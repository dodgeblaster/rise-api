"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployCfTemplate = void 0;
const rise_foundation_1 = require("rise-foundation");
const _makeTemplate_1 = require("./_makeTemplate");
const _getRiseDefinition_1 = require("./_getRiseDefinition");
async function deployCfTemplate({ appName, bucketArn, stage, auth = false, eventBus = false, events = [], region, deployCodeOnly }) {
    if (!deployCodeOnly) {
        const template = _makeTemplate_1.makeTemplate({
            appName,
            bucketArn,
            stage,
            auth,
            eventBus,
            events,
            region
        });
        await rise_foundation_1.default.cloudformation.deployStack({
            name: appName + '-' + stage,
            template: JSON.stringify(template)
        });
        await rise_foundation_1.default.cloudformation.getDeployStatus({
            config: {
                stackName: appName + '-' + stage,
                minRetryInterval: 5000,
                maxRetryInterval: 10000,
                backoffRate: 1.1,
                maxRetries: 200,
                onCheck: (resources) => {
                    console.log(JSON.stringify(resources, null, 2));
                }
            }
        });
    }
    let brokenDownDeff = _getRiseDefinition_1.getRiseDefinition(stage);
    await rise_foundation_1.default.db.set({
        pk: 'definition',
        sk: 'meta',
        def: JSON.stringify(brokenDownDeff)
    }, `${appName}${stage}meta`);
}
exports.deployCfTemplate = deployCfTemplate;
