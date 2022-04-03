"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRiseFolder = void 0;
const rise_cli_foundation_1 = require("rise-cli-foundation");
const HIDDEN_FOLDER = '.rise';
async function makeRiseFolder(path) {
    const projectPath = path || process.cwd();
    /**
     * Create rise folder
     */
    const projectFolder = rise_cli_foundation_1.default.fileSystem.getDirectories(projectPath);
    if (!projectFolder.includes(HIDDEN_FOLDER)) {
        await rise_cli_foundation_1.default.fileSystem.makeDir(projectPath + '/' + HIDDEN_FOLDER);
    }
    /**
     * Create lambda folder
     */
    const riseFolder = rise_cli_foundation_1.default.fileSystem.getDirectories(projectPath + '/' + HIDDEN_FOLDER);
    if (!riseFolder.includes('lambdas')) {
        await rise_cli_foundation_1.default.fileSystem.makeDir(projectPath + '/' + HIDDEN_FOLDER + '/lambdas');
    }
}
exports.makeRiseFolder = makeRiseFolder;
