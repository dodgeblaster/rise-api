"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zipFiles = void 0;
const rise_cli_foundation_1 = require("rise-cli-foundation");
const HIDDEN_FOLDER = '.rise';
async function zipFiles(path) {
    const projectPath = path || process.cwd();
    await rise_cli_foundation_1.default.fileSystem.packageCode({
        location: __dirname + '/copy',
        target: projectPath + '/' + HIDDEN_FOLDER + '/lambdas',
        name: 'main'
    });
}
exports.zipFiles = zipFiles;
