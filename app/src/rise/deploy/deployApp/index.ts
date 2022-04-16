import foundation from 'rise-foundation'
import { makeTemplate } from './_makeTemplate'
import { getRiseDefinition } from './_getRiseDefinition'

interface Input {
    appName: string
    bucketArn: string
    stage: string
    region: string
    auth: boolean
    eventBus: string | false
    events: { source: string; event: string }[]
    deployCodeOnly: string | undefined
}

export async function deployCfTemplate({
    appName,
    bucketArn,
    stage,
    auth = false,
    eventBus = false,
    events = [],
    region,
    deployCodeOnly
}: Input) {
    if (!deployCodeOnly) {
        const template = makeTemplate({
            appName,
            bucketArn,
            stage,
            auth,
            eventBus,
            events,
            region
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
    }

    let brokenDownDeff = getRiseDefinition(stage)
    await foundation.db.set(
        {
            pk: 'definition',
            sk: 'meta',
            def: JSON.stringify(brokenDownDeff)
        },
        `${appName}${stage}meta`
    )
}
