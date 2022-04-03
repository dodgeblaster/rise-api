"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
const makeRiseFolder_1 = require("./makeRiseFolder");
const getAppConfig_1 = require("./getAppConfig");
// import { AppConfig } from '../interfaces'
async function getConfig(stage, region) {
    makeRiseFolder_1.makeRiseFolder();
    let config = getAppConfig_1.getAppConfig();
    if (stage) {
        config.stage = stage;
    }
    if (region) {
        config.region = region;
    }
    return {
        name: config.appName,
        stage: config.stage,
        region: config.region,
        bucketName: config.bucketName,
        auth: config.auth,
        eventBus: config.eventBus
    };
}
exports.getConfig = getConfig;
