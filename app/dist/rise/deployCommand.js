"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploy = void 0;
const getConfig_1 = require("./getConfig");
const zipFiles_1 = require("./zipFiles");
const deployApplicationBucket_1 = require("./deploy/deployApplicationBucket");
const uploadCode_1 = require("./uploadCode");
const deployApp_1 = require("./deploy/deployApp");
const rise_foundation_1 = require("rise-foundation");
const rise_cli_foundation_1 = require("rise-cli-foundation");
const getCompleteDefinitionForEvents = () => {
    // get root
    let orig = rise_cli_foundation_1.default.fileSystem.getJsFileFromProject('/rise.js');
    const deff = Object.assign({}, orig);
    // get modules
    const fs = require('fs');
    const p = process.cwd() + '/modules';
    try {
        fs.readdirSync(p).forEach((file) => {
            const mod = rise_cli_foundation_1.default.fileSystem.getJsFile(`${p}/${file}`);
            deff.api = {
                ...deff.api,
                ...mod.api
            };
            deff.events = {
                ...deff.events,
                ...mod.events
            };
        });
    }
    catch (e) {
        //dont do anything for now
    }
    return deff;
};
const getEventsFromDefinition = (config) => {
    const defForEvents = getCompleteDefinitionForEvents();
    if (!defForEvents.events) {
        return [];
    }
    const events = Object.keys(defForEvents.events).map((k) => {
        const actions = defForEvents.events[k];
        const eventSourceDef = actions.filter((x) => x.type === 'event-source');
        if (eventSourceDef.length === 0) {
            throw new Error(`events.${k} needs to have an action of type "event-source"`);
        }
        const eventDefinition = {
            source: eventSourceDef[0].source.replace('{@stage}', config.stage),
            event: eventSourceDef[0].event.replace('{@stage}', config.stage) // k.split('_')[1]
        };
        return eventDefinition;
    });
    return events;
};
async function deploy(stage, region) {
    let config = await getConfig_1.getConfig(stage, region);
    await zipFiles_1.zipFiles();
    if (!config.bucketName) {
        const bucketName = await deployApplicationBucket_1.deployApplicationBucket(config.name, config.stage);
        config.bucketName = bucketName;
    }
    await uploadCode_1.uploadLambda(config.bucketName);
    const events = getEventsFromDefinition(config);
    await deployApp_1.deployCfTemplate({
        region: config.region,
        appName: config.name,
        bucketArn: 'arn:aws:s3:::' + config.bucketName,
        stage: config.stage,
        auth: config.auth,
        eventBus: config.eventBus,
        events
    });
    await rise_foundation_1.default.lambda.updateLambdaCode({
        name: `${config.name}-main-${config.stage}`,
        filePath: 'main.zip',
        bucket: config.bucketName
    });
}
exports.deploy = deploy;
