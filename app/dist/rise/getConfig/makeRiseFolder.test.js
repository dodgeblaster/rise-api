"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const makeRiseFolder_1 = require("./makeRiseFolder");
const rise_cli_foundation_1 = require("rise-cli-foundation");
test('can make rise folders', async () => {
    const current = await rise_cli_foundation_1.default.fileSystem.getDirectories(process.cwd() + '/src/rise/getConfig/test/');
    if (!current.includes('makeFolderTest')) {
        await rise_cli_foundation_1.default.fileSystem.makeDir(process.cwd() + '/src/rise/getConfig/test/makeFolderTest');
    }
    const path = process.cwd() + '/src/rise/getConfig/test/makeFolderTest';
    await makeRiseFolder_1.makeRiseFolder(path);
    // .rise is made
    const projectFolders = await rise_cli_foundation_1.default.fileSystem.getDirectories(path);
    expect(projectFolders).toEqual(['.rise']);
    // .rise/lambdas is made
    const riseFolders = await rise_cli_foundation_1.default.fileSystem.getDirectories(path + '/.rise');
    expect(riseFolders).toEqual(['lambdas']);
});
