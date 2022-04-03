import { getConfig } from './getConfig'
import { zipFiles } from './zipFiles'
import { deployApplicationBucket } from './deploy/deployApplicationBucket'
import { uploadLambda } from './uploadCode'
import { deployCfTemplate } from './deploy/deployApp'
import foundation from 'rise-foundation'
import cli from 'rise-cli-foundation'

const getCompleteDefinitionForEvents = () => {
    // get root
    let orig = cli.fileSystem.getJsFileFromProject('/rise.js')
    const deff = Object.assign({}, orig)
    // get modules
    const fs = require('fs')
    const p = process.cwd() + '/modules'
    try {
        fs.readdirSync(p).forEach((file: string) => {
            const mod: any = cli.fileSystem.getJsFile(`${p}/${file}`)

            deff.api = {
                ...deff.api,
                ...mod.api
            }

            deff.events = {
                ...deff.events,
                ...mod.events
            }
        })
    } catch (e) {
        //dont do anything for now
    }

    return deff
}

const getEventsFromDefinition = (config: any) => {
    const defForEvents = getCompleteDefinitionForEvents()

    if (!defForEvents.events) {
        return []
    }
    const events = Object.keys(defForEvents.events).map((k) => {
        const actions = defForEvents.events[k]
        const eventSourceDef = actions.filter(
            (x: any) => x.type === 'event-source'
        )

        if (eventSourceDef.length === 0) {
            throw new Error(
                `events.${k} needs to have an action of type "event-source"`
            )
        }
        const eventDefinition = {
            source: eventSourceDef[0].source.replace('{@stage}', config.stage), //k.split('_')[0],
            event: eventSourceDef[0].event.replace('{@stage}', config.stage) // k.split('_')[1]
        }

        return eventDefinition
    })
    return events
}

export async function deploy(
    stage: string | undefined,
    region: string | undefined
) {
    let config = await getConfig(stage, region)
    await zipFiles()
    if (!config.bucketName) {
        const bucketName = await deployApplicationBucket(
            config.name,
            config.stage
        )
        config.bucketName = bucketName
    }

    await uploadLambda(config.bucketName)
    const events = getEventsFromDefinition(config)

    await deployCfTemplate({
        region: config.region,
        appName: config.name,
        bucketArn: 'arn:aws:s3:::' + config.bucketName,
        stage: config.stage,
        auth: config.auth,
        eventBus: config.eventBus,
        events
    })

    await foundation.lambda.updateLambdaCode({
        name: `${config.name}-main-${config.stage}`,
        filePath: 'main.zip',
        bucket: config.bucketName
    })
}
