import cli from 'rise-cli-foundation'
import foundation from 'rise-foundation'
import { makeLambdaeEndpoint } from './_makeApi'
import { makeDb } from './_makeDb'
import { makeEventRule } from './_makeEventTrigger'
import { makeBroadcast } from './_makeBroadcast'
import * as AWS from 'aws-sdk'

interface Input {
    appName: string
    bucketArn: string
    stage: string
    region: string
    auth: boolean
    eventBus: string | false
    events: { source: string; event: string }[]
}

const batchWrite = async (
    appName: string,
    stage: string,
    region: string,
    items: any[]
) => {
    const dynamodb = new AWS.DynamoDB({
        region
    })
    var params = {
        RequestItems: {
            [`${appName}${stage}meta`]: items.map((x) => ({
                PutRequest: {
                    Item: {
                        pk: {
                            S: x.pk
                        },
                        sk: {
                            S: x.sk
                        },
                        def: {
                            S: x.def
                        }
                    }
                }
            }))
        }
    }

    await dynamodb.batchWriteItem(params).promise()
}

const getBrokenDownDefinition = () => {
    let itemsToSave = []
    // get root
    let deffi = require(process.cwd() + '/rise.js')

    if (!deffi.events) {
        deffi.events = {}
    }
    itemsToSave.push({
        pk: 'defBrokenUp',
        sk: 'module_root',
        def: JSON.stringify(deffi)
    })
    // get modules
    const fs = require('fs')
    const p = process.cwd() + '/modules'
    try {
        fs.readdirSync(p).forEach((file: string) => {
            const mod: any = cli.fileSystem.getJsFile(`${p}/${file}`)
            const newEvents = Object.keys(mod.events || {}).reduce(
                (acc: any, k) => {
                    acc[`${file}##${k}`] = mod.events[k]
                    return acc
                },
                {}
            )
            itemsToSave.push({
                pk: 'defBrokenUp',
                sk: 'module_' + file,
                def: JSON.stringify({
                    ...mod,
                    events: newEvents
                })
            })
        })
    } catch (e) {
        //dont do anything for now
    }

    return itemsToSave
}

export async function deployCfTemplate({
    appName,
    bucketArn,
    stage,
    auth = false,
    eventBus = false,
    events = [],
    region
}: Input) {
    let template = {
        Resources: {},
        Outputs: {}
    }

    const functionName = `${appName}`
    const res = foundation.lambda.cf.makeLambda({
        appName: appName,
        name: 'main',
        stage: stage,
        bucketArn: bucketArn,
        bucketKey: 'main.zip',
        env: {
            DB: appName + stage,
            BUS: eventBus,
            USERPOOL_ID: {
                Ref: 'CognitoUserPool'
            },
            BROADCAST_URL: {
                'Fn::GetAtt': ['BroadcastApi', 'GraphQLUrl']
            }
        },
        handler: '_index.handler',

        /**
         * TODO: tighten these permissions up
         * Set:
         * - DynamoDB *
         * - EventBridge PublishEvent
         */
        permissions: [
            {
                Resource: '*',
                Action: '*',
                Effect: 'Allow'
            }
        ],
        timeout: 6
    })

    const api = makeLambdaeEndpoint({
        endpointName: functionName,
        lambdaName: `Lambdamain${stage}`,
        stage: stage,
        path: 'rise',
        auth
    })

    const db = makeDb(`${appName}${stage}`)
    const metadb = makeDb(`${appName}${stage}meta`)
    const broadcast = makeBroadcast(`${appName}${stage}`, ['main'])

    template.Resources = {
        ...template.Resources,
        ...res.Resources,
        ...api.Resources,
        ...db.Resources,
        ...metadb.Resources,
        ...broadcast.Resources
    }
    template.Outputs = {
        ...template.Outputs,
        ...{
            [`Lambdamain${stage}Arn`]: {
                Value: {
                    'Fn::GetAtt': [`Lambdamain${stage}`, 'Arn']
                }
            }
        },
        ...api.Outputs,
        ...db.Outputs,
        ...metadb.Outputs,
        ...broadcast.Outputs
    }

    events.forEach((e) => {
        const res = makeEventRule({
            appName,
            eventBus,
            eventSource: e.source,
            eventName: e.event,
            lambdaName: `Lambdamain${stage}`
        })
        template.Resources = {
            ...template.Resources,
            ...res.Resources
        }

        template.Outputs = {
            ...template.Outputs,
            ...res.Outputs
        }
    })

    await foundation.cloudformation.deployStack({
        name: appName + '-' + stage,
        template: JSON.stringify(template)
    })

    await foundation.cloudformation.getDeployStatus({
        config: {
            stackName: appName + '-' + stage,
            minRetryInterval: 5000,
            maxRetryInterval: 10000,
            backoffRate: 1.1,
            maxRetries: 200,
            onCheck: (resources: any) => {
                console.log(JSON.stringify(resources, null, 2))
            }
        }
    })

    let brokenDownDeff = getBrokenDownDefinition()
    await batchWrite(appName, stage, region, brokenDownDeff)
}
