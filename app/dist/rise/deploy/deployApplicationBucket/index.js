"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployApplicationBucket = void 0;
const rise_foundation_1 = require("rise-foundation");
const fs = require("fs");
async function deployApplicationBucket(appName, stage) {
    /**
     * Deploy Stack
     */
    const bucketTemplate = rise_foundation_1.default.s3.cf.makeBucket('Main');
    const stackName = appName + stage + '-bucket';
    await rise_foundation_1.default.cloudformation.deployStack({
        name: stackName,
        template: JSON.stringify(bucketTemplate)
    });
    await rise_foundation_1.default.cloudformation.getDeployStatus({
        config: {
            stackName: stackName,
            minRetryInterval: 2000,
            maxRetryInterval: 10000,
            backoffRate: 1.1,
            maxRetries: 200,
            onCheck: () => {
                console.log('Creating Bucket...');
            }
        }
    });
    /**
     * Write generated bucket name to local state
     */
    const { MainBucket } = await rise_foundation_1.default.cloudformation.getCloudFormationOutputs({
        stack: stackName,
        outputs: ['MainBucket']
    });
    fs.writeFileSync(process.cwd() + '/.rise/data.js', `module.exports = { bucketName: "${MainBucket}"}`);
    return MainBucket;
}
exports.deployApplicationBucket = deployApplicationBucket;
