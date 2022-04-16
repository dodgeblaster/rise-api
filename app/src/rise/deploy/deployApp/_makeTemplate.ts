import foundation from 'rise-foundation'
import { makeLambdaeEndpoint } from './_makeApi'
import { makeDb } from './_makeDb'
import { makeEventRule } from './_makeEventTrigger'
import { makeWebsocket } from './_makeWebSocket'

interface MakeTemplateInput {
    appName: string
    stage: string
    region: string
    eventBus: string | false
    auth: boolean
    bucketArn: string
    events: { source: string; event: string }[]
}

export function makeTemplate({
    appName,
    stage,
    bucketArn,
    eventBus,
    events,
    auth
}: MakeTemplateInput) {
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
            STAGE: stage,
            BUS: eventBus,
            ...(auth
                ? {
                      USERPOOL_ID: {
                          Ref: 'CognitoUserPool'
                      }
                  }
                : {}),
            WEBSOCKET_SEND_URL: {
                'Fn::Join': [
                    '',
                    [
                        {
                            Ref: 'WebSocket'
                        },
                        '.execute-api.',
                        {
                            Ref: 'AWS::Region'
                        },
                        '.amazonaws.com/',
                        stage
                    ]
                ]
            },
            WEBSOCKET_URL: {
                'Fn::Join': [
                    '',
                    [
                        'wss://',
                        {
                            Ref: 'WebSocket'
                        },
                        '.execute-api.',
                        {
                            Ref: 'AWS::Region'
                        },
                        '.amazonaws.com/',
                        stage
                    ]
                ]
            }
        },
        handler: '_index.handler',

        /**
         * TODO: tighten these permissions up
         * Set:
         * - DynamoDB *
         * - EventBridge PublishEvent
         * - https://github.com/aws-samples/simple-websockets-chat-app/blob/master/template.yaml#L158-L176
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

    const db = makeDb(`${appName}${stage}`, '')
    const metadb = makeDb(`${appName}${stage}meta`, 'meta')
    const websocket = makeWebsocket({
        appName: appName,
        lambdaName: `Lambdamain${stage}`,
        stage: stage
    })

    template.Resources = {
        ...template.Resources,
        ...res.Resources,
        ...api.Resources,
        ...db.Resources,
        ...metadb.Resources,
        ...websocket.Resources
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
        ...websocket.Outputs,
        RiseType: {
            Value: 'api'
        }
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

    return template
}
