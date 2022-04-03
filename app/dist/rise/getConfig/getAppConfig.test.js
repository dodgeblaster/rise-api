"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getAppConfig_1 = require("./getAppConfig");
const rise_cli_foundation_1 = require("rise-cli-foundation");
test('getAppConfig will throw error if no rise.js file is present', async () => {
    const current = await rise_cli_foundation_1.default.fileSystem.getDirectories(process.cwd() + '/src/rise/getConfig/test/getAppConfig');
    if (!current.includes('withoutConfigFile')) {
        await rise_cli_foundation_1.default.fileSystem.makeDir(process.cwd() +
            '/src/rise/getConfig/test/getAppConfig/withoutConfigFile');
    }
    try {
        await getAppConfig_1.getAppConfig(process.cwd() +
            '/src/rise/getConfig/test/getAppConfig/withoutConfigFile');
    }
    catch (e) {
        expect(e.message).toBe('Must have a rise.js file');
    }
});
test('getAppConfig will return config from rise.js file', async () => {
    const res = await getAppConfig_1.getAppConfig(process.cwd() + '/src/rise/getConfig/test/getAppConfig/withConfigFile');
    expect(res).toEqual({
        appName: 'testapp',
        bucketName: undefined,
        region: 'regionA',
        stage: 'qa',
        auth: true,
        eventBus: 'default'
    });
});
test('getAppConfig will return config from rise.js file with bucketName if data.js is defined', async () => {
    const res = await getAppConfig_1.getAppConfig(process.cwd() +
        '/src/rise/getConfig/test/getAppConfig/withConfigAndData');
    expect(res).toEqual({
        appName: 'testapp',
        bucketName: 'testbucket',
        region: 'regionA',
        stage: 'qa',
        auth: true,
        eventBus: 'default'
    });
});
