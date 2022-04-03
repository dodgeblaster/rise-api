"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLambda = void 0;
const rise_cli_foundation_1 = require("rise-cli-foundation");
const rise_foundation_1 = require("rise-foundation");
const HIDDEN_FOLDER = '.rise';
async function uploadLambda(bucketName, path) {
    const pathDir = path || process.cwd();
    const file = await rise_cli_foundation_1.default.fileSystem.getFile(pathDir + '/' + HIDDEN_FOLDER + '/lambdas/main.zip');
    await rise_foundation_1.default.s3.uploadFile({
        file: file,
        bucket: bucketName,
        key: 'main.zip'
    });
}
exports.uploadLambda = uploadLambda;
