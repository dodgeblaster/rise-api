"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployCfTemplate = void 0;
const rise_foundation_1 = require("rise-foundation");
const _makeApi_1 = require("./_makeApi");
const _makeDb_1 = require("./_makeDb");
const _makeEventTrigger_1 = require("./_makeEventTrigger");
const _makeBroadcast_1 = require("./_makeBroadcast");
const _makeWebSocket_1 = require("./_makeWebSocket");
const AWS = require("aws-sdk");
const batchWrite = async (appName, stage, region, items) => {
    const dynamodb = new AWS.DynamoDB({
        region
    });
    var params = {
        RequestItems: {
            [`${appName}${stage}meta`]: items.map((x) => ({
                PutRequest: {
                    Item: {
                        pk: {
                            S: x.pk
                        },
                        sk: {
                            S: x.sk
                        },
                        def: {
                            S: x.def
                        }
                    }
                }
            }))
        }
    };
    await dynamodb.batchWriteItem(params).promise();
};
const getBrokenDownDefinition = (stage) => {
    let itemsToSave = [];
    // const outputFolder = process.cwd() + '/.rise/'
    const outputFolder = process.cwd() + '/';
    // get root
    let deffi = require(process.cwd() + '/rise.js');
    // console.log(process.cwd() + '/rise.js')
    // console.log('MAIN: ', JSON.stringify(deffi))
    // esbuild.buildSync({
    //     minify: true,
    //     treeShaking: true,
    //     entryPoints: [process.cwd() + '/rise.js'],
    //     outfile: outputFolder + 'root.js',
    //     platform: 'node'
    // })
    // itemsToSave.push({
    //     pk: 'defBrokenUp',
    //     sk: 'module_root',
    //     def: JSON.stringify(deffi)
    // })
    // get modules
    const fs = require('fs');
    const p = process.cwd() + '/modules';
    let outputFilesArray = [
        {
            module: 'root.js',
            outputPath: outputFolder + 'rise.js' //'root.js'
        }
    ];
    // function byteCount(s: string) {
    //     const bytes = encodeURI(s).split(/%..|./).length - 1
    //     const kb = bytes * 0.001
    //     const res = (kb / 400).toFixed(2)
    //     if (res.toString() === '0.00') {
    //         return 0.01
    //     } else {
    //         return res
    //     }
    // }
    // try {
    //     const modules = fs.readdirSync(p)
    //     modules.forEach((fileName: string) => {
    //         const inputPath = `${p}/${fileName}`
    //         const outputPath = outputFolder + fileName
    //         esbuild.buildSync({
    //             minify: true,
    //             treeShaking: true,
    //             entryPoints: [inputPath],
    //             outfile: outputPath,
    //             platform: 'node',
    //             format: 'cjs',
    //             bundle: true
    //         })
    //         outputFilesArray.push({
    //             module: fileName,
    //             outputPath
    //         })
    //     })
    // } catch (e) {
    //     //dont do anything for now
    // }
    outputFilesArray.forEach((x) => {
        //const codeString = fs.readFileSync(x.outputPath, { encoding: 'utf-8' })
        let codeString = require(x.outputPath);
        // const size = byteCount(codeString)
        // if (size > 100) {
        //     throw new Error(`Module ${x.module} is too big: ${size}%`)
        // }
        // console.log('Module Size: ' + size + '% for ' + x.module)
        if (codeString.events) {
            Object.keys(codeString.events).forEach((k) => {
                const actions = codeString.events[k];
                let newActions = actions.map((x) => {
                    if (x.type === 'event-source') {
                        return {
                            ...x,
                            source: x.source.replace('{@stage}', stage),
                            event: x.event.replace('{@stage}', stage)
                        };
                    }
                    else {
                        return x;
                    }
                });
                codeString.events[k] = newActions;
            });
        }
        itemsToSave.push({
            pk: 'defBrokenUp',
            sk: 'module_' + x.module,
            def: JSON.stringify(codeString)
        });
    });
    // try {
    //     fs.readdirSync(p).forEach((file: string) => {
    //         const mod: any = cli.fileSystem.getJsFile(`${p}/${file}`)
    //         const newEvents = Object.keys(mod.events || {}).reduce(
    //             (acc: any, k) => {
    //                 acc[`${file}##${k}`] = mod.events[k]
    //                 return acc
    //             },
    //             {}
    //         )
    //         itemsToSave.push({
    //             pk: 'defBrokenUp',
    //             sk: 'module_' + file,
    //             def: JSON.stringify({
    //                 ...mod,
    //                 events: newEvents
    //             })
    //         })
    //     })
    // } catch (e) {
    //     //dont do anything for now
    // }
    return itemsToSave;
};
async function deployCfTemplate({ appName, bucketArn, stage, auth = false, eventBus = false, events = [], region }) {
    let template = {
        Resources: {},
        Outputs: {}
    };
    const functionName = `${appName}`;
    const res = rise_foundation_1.default.lambda.cf.makeLambda({
        appName: appName,
        name: 'main',
        stage: stage,
        bucketArn: bucketArn,
        bucketKey: 'main.zip',
        env: {
            DB: appName + stage,
            STAGE: stage,
            BUS: eventBus,
            ...(auth
                ? {
                    USERPOOL_ID: {
                        Ref: 'CognitoUserPool'
                    }
                }
                : {}),
            WEBSOCKET_SEND_URL: {
                'Fn::Join': [
                    '',
                    [
                        {
                            Ref: 'WebSocket'
                        },
                        '.execute-api.',
                        {
                            Ref: 'AWS::Region'
                        },
                        '.amazonaws.com/',
                        stage
                    ]
                ]
            },
            WEBSOCKET_URL: {
                'Fn::Join': [
                    '',
                    [
                        'wss://',
                        {
                            Ref: 'WebSocket'
                        },
                        '.execute-api.',
                        {
                            Ref: 'AWS::Region'
                        },
                        '.amazonaws.com/',
                        stage
                    ]
                ]
            }
            // {
            //     'Fn::GetAtt': ['BroadcastApi', 'GraphQLUrl']
            // }
            // BROADCAST_URL: {
            //     'Fn::GetAtt': ['BroadcastApi', 'GraphQLUrl']
            // }
        },
        handler: '_index.handler',
        /**
         * TODO: tighten these permissions up
         * Set:
         * - DynamoDB *
         * - EventBridge PublishEvent
         * - https://github.com/aws-samples/simple-websockets-chat-app/blob/master/template.yaml#L158-L176
         */
        permissions: [
            {
                Resource: '*',
                Action: '*',
                Effect: 'Allow'
            }
        ],
        timeout: 6
    });
    const api = _makeApi_1.makeLambdaeEndpoint({
        endpointName: functionName,
        lambdaName: `Lambdamain${stage}`,
        stage: stage,
        path: 'rise',
        auth
    });
    const db = _makeDb_1.makeDb(`${appName}${stage}`);
    const metadb = _makeDb_1.makeDb(`${appName}${stage}meta`);
    const broadcast = _makeBroadcast_1.makeBroadcast(`${appName}${stage}`, ['main'], auth);
    const websocket = _makeWebSocket_1.makeWebsocket({
        appName: appName,
        lambdaName: `Lambdamain${stage}`,
        stage: stage
    });
    template.Resources = {
        ...template.Resources,
        ...res.Resources,
        ...api.Resources,
        ...db.Resources,
        ...metadb.Resources,
        ...websocket.Resources
        //...broadcast.Resources
    };
    template.Outputs = {
        ...template.Outputs,
        ...{
            [`Lambdamain${stage}Arn`]: {
                Value: {
                    'Fn::GetAtt': [`Lambdamain${stage}`, 'Arn']
                }
            }
        },
        ...api.Outputs,
        ...db.Outputs,
        ...metadb.Outputs,
        ...websocket.Outputs
        //...broadcast.Outputs
    };
    events.forEach((e) => {
        const res = _makeEventTrigger_1.makeEventRule({
            appName,
            eventBus,
            eventSource: e.source,
            eventName: e.event,
            lambdaName: `Lambdamain${stage}`
        });
        template.Resources = {
            ...template.Resources,
            ...res.Resources
        };
        template.Outputs = {
            ...template.Outputs,
            ...res.Outputs
        };
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
    let brokenDownDeff = getBrokenDownDefinition(stage);
    await batchWrite(appName, stage, region, brokenDownDeff);
}
exports.deployCfTemplate = deployCfTemplate;
