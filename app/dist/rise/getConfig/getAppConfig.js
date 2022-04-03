"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppConfig = void 0;
function getAppConfig(path) {
    const folderPath = path || process.cwd();
    try {
        const app = require(folderPath + '/rise.js');
        let bucketName = undefined;
        try {
            const data = require(folderPath + '/.rise/data.js');
            bucketName = data.bucketName;
        }
        catch (e) {
            bucketName = undefined;
        }
        return {
            appName: app.config.name,
            bucketName: bucketName,
            region: app.config.region || 'us-east-1',
            stage: app.config.stage || 'dev',
            auth: app.config.auth || false,
            eventBus: app.config.eventBus || false
        };
    }
    catch (e) {
        throw new Error('Must have a rise.js file');
    }
}
exports.getAppConfig = getAppConfig;
