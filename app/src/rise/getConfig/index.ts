import { makeRiseFolder } from './makeRiseFolder'
import { getAppConfig } from './getAppConfig'
// import { AppConfig } from '../interfaces'

export async function getConfig(
    stage: string | undefined,
    region: string | undefined
): Promise<any> {
    makeRiseFolder()
    let config: Record<string, any> = getAppConfig()
    if (stage) {
        config.stage = stage
    }
    if (region) {
        config.region = region
    }

    return {
        name: config.appName,
        stage: config.stage,
        region: config.region,
        bucketName: config.bucketName,
        auth: config.auth,
        eventBus: config.eventBus
    }
}
