"use strict";
const { checkInputStructure } = require('./checkInputStructure');
const { checkOutputStructure } = require('./checkOutputStructure');
const { addAction } = require('./add');
const { makeDbCall } = require('./db');
const { guardAction } = require('./guard');
const { makeEmitCall } = require('./emit');
const { makeCognitoCall } = require('./users');
const { broadcastAction } = require('./broadcast');
const { sendWebsocketMessage } = require('./sendWebsocketMessage');
const r = require('./node_modules/rise-foundation');
const { inputHelper } = require('./_inputHelper');
const def = require('./index');
/**
 * DB CALL
 *
 *
 */
const AWS = require('aws-sdk');
const region = process.env.AWS_REGION || 'us-east-1';
const db = new AWS.DynamoDB.DocumentClient({
    region: region
});
const getDef = async (tableName) => {
    const item = await db
        .query({
        TableName: `${tableName}meta`,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
        ExpressionAttributeValues: {
            ':pk': 'defBrokenUp',
            ':sk': 'module_'
        }
    })
        .promise();
    let def = {
        api: {},
        events: {}
    };
    item.Items.forEach((x) => {
        let MOD = JSON.parse(x.def);
        //eval(x.def.replace('module.exports=', 'MOD='))
        // eval(x.def.replace('module.exports = ', 'MOD='))
        const moduleName = x.sk.split('_')[1];
        const makeNewEventName = (name) => `${moduleName}##${name}`;
        def = {
            api: {
                ...def.api,
                ...MOD.api
            },
            events: def.events || {},
            connect: {
                ...def.connect,
                ...MOD.connect
            }
        };
        const modEvents = MOD.events || {};
        Object.keys(modEvents).forEach((name) => {
            const newName = makeNewEventName(name);
            def.events[newName] = modEvents[name];
        });
    });
    return def;
    //return JSON.parse(item.Item.def)
};
const isWebSocketSendEvent = (e) => {
    if (!e.body)
        return false;
    const d = JSON.parse(e.body);
    if (!d.action)
        return false;
    if (d.action !== 'sendMessage')
        return false;
    if (!d.data)
        return false;
    if (!d.data.channel)
        return false;
    if (!d.data.payload)
        return false;
    return true;
};
const isWebSocketAskInfoEvent = (e) => {
    if (!e.body)
        return false;
    const d = JSON.parse(e.body);
    if (!d.action)
        return false;
    if (d.action !== 'sendMessage')
        return false;
    if (!d.data)
        return false;
    if (!d.data.channel)
        return false;
    if (d.data.channel !== 'RISE_CONNECTION_INFO')
        return false;
    if (!d.data.payload)
        return false;
    return true;
};
const isWebSocketConnectConfirmEvent = (e) => {
    if (!e.body)
        return false;
    const d = JSON.parse(e.body);
    if (!d.action)
        return false;
    if (d.action !== 'sendMessage')
        return false;
    if (!d.data)
        return false;
    if (!d.data.channel)
        return false;
    if (d.data.channel !== 'RISE_CONNECT')
        return false;
    if (!d.data.payload)
        return false;
    if (!d.data.payload.id)
        return false;
    if (!d.data.payload.input)
        return false;
    return true;
};
const isWebSocketKeepAliveEvent = (e) => {
    if (!e.body)
        return false;
    const d = JSON.parse(e.body);
    if (!d.action)
        return false;
    if (d.action !== 'sendMessage')
        return false;
    if (!d.data)
        return false;
    if (!d.data.channel)
        return false;
    if (d.data.channel !== 'RISE_KEEPALIVE')
        return false;
    return true;
};
const isWebSocketConnectEvent = (e) => {
    if (!e.requestContext)
        return false;
    if (!e.requestContext.connectionId)
        return false;
    if (!e.requestContext.eventType)
        return false;
    if (e.requestContext.eventType !== 'CONNECT')
        return false;
    return true;
};
const isWebSocketDisconnectEvent = (e) => {
    if (!e.requestContext)
        return false;
    if (!e.requestContext.connectionId)
        return false;
    if (!e.requestContext.eventType)
        return false;
    if (e.requestContext.eventType !== 'DISCONNECT')
        return false;
    return true;
};
const sendWebsocketConfirmation = async (event) => {
    const table = `${process.env.DB}meta`;
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
    });
    const connectionId = event.requestContext.connectionId;
    try {
        await apigwManagementApi
            .postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify({
                connectionId
            })
        })
            .promise();
    }
    catch (e) {
        if (e.statusCode === 410) {
            console.log(`Found stale connection, deleting ${connectionId}`);
            await db
                .delete({
                TableName: table,
                Key: { pk: connectionId, sk: 'id_' + connectionId }
            })
                .promise();
        }
        else {
            throw e;
        }
    }
    return { statusCode: 200, body: 'Data sent.' };
};
const sendWebsocketKeepAlive = async (event) => {
    const table = `${process.env.DB}meta`;
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
    });
    const connectionId = event.requestContext.connectionId;
    try {
        console.log('KEEPALIVE', {
            ConnectionId: connectionId,
            Data: JSON.stringify({
                KEEPALIVE: true
            })
        });
        await apigwManagementApi
            .postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify({
                KEEPALIVE: true
            })
        })
            .promise();
    }
    catch (e) {
        if (e.statusCode === 410) {
            console.log(`Found stale connection, deleting ${connectionId}`);
            await db
                .delete({
                TableName: table,
                Key: { pk: connectionId, sk: 'id_' + connectionId }
            })
                .promise();
        }
        else {
            throw e;
        }
    }
    return { statusCode: 200, body: 'Data sent.' };
};
const getSubFromJwtHeader = async (event) => {
    if (!event.queryStringParameters || !event.queryStringParameters.header) {
        return false;
    }
    let hData = event.queryStringParameters.header;
    let buff = new Buffer(hData, 'base64');
    let text = buff.toString('ascii');
    const jwtResult = await r.default.cognito.validateToken({
        token: JSON.parse(text).jwt,
        userPoolId: process.env.USERPOOL_ID || 'us-east-1_EBxmB9P5J'
    });
    if (!jwtResult.sub) {
        return false;
    }
    return jwtResult.sub;
};
const getSubFromJwt = async (jwt) => {
    const jwtResult = await r.default.cognito.validateToken({
        token: jwt,
        userPoolId: process.env.USERPOOL_ID || 'us-east-1_EBxmB9P5J'
    });
    if (!jwtResult.sub) {
        return false;
    }
    return jwtResult.sub;
};
/**
 * Code
 *
 *
 */
module.exports.handler = async (event) => {
    let state = {
        input: {},
        working: {},
        prev: {},
        auth: {}
    };
    let path = '';
    let errorType = 400;
    let def = {};
    let input = {};
    if (isWebSocketConnectEvent(event)) {
        if (process.env.USERPOOL_ID) {
            const sub = await getSubFromJwtHeader(event);
            if (!sub) {
                return {
                    statusCode: 400,
                    body: 'Not a valid jwt'
                };
            }
        }
        const connectionId = event.requestContext.connectionId;
        const params = {
            TableName: `${process.env.DB}meta`,
            Item: {
                pk: connectionId,
                sk: 'id_' + connectionId
            }
        };
        await db.put(params).promise();
        return {
            statusCode: 200,
            body: ''
        };
    }
    if (isWebSocketDisconnectEvent(event)) {
        const connectionId = event.requestContext.connectionId;
        const params = {
            TableName: `${process.env.DB}meta`,
            Key: {
                pk: connectionId,
                sk: 'id_' + connectionId
            }
        };
        await db.delete(params).promise();
        return {
            statusCode: 200,
            body: 'everything is alright'
        };
    }
    if (isWebSocketAskInfoEvent(event)) {
        await sendWebsocketConfirmation(event);
        return {
            statusCode: 200,
            body: 'everything is alright'
        };
    }
    if (isWebSocketKeepAliveEvent(event)) {
        console.log('KEEPALIVE');
        await sendWebsocketKeepAlive(event);
        return {
            statusCode: 200,
            body: 'everything is alright'
        };
    }
    if (isWebSocketConnectConfirmEvent(event)) {
        const app = await getDef(process.env.DB);
        const def = app.connect;
        if (!def || !def[JSON.parse(event.body).data.payload.connection]) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Not a valid connection'
                })
            };
        }
        input = JSON.parse(event.body).data.payload.input;
        const l = def[JSON.parse(event.body).data.payload.connection];
        let auth = {};
        if (JSON.parse(event.body).data.payload.jwt) {
            const sub = await getSubFromJwt(JSON.parse(event.body).data.payload.jwt);
            auth = {
                sub
            };
        }
        state = {
            input,
            working: input,
            prev: {},
            auth
        };
        let channelToWrite = 'public';
        try {
            for (const x of l) {
                if (x.type === 'input') {
                    state.working = checkInputStructure(x, input);
                    errorType = 500;
                }
                if (x.type === 'add') {
                    const res = addAction(x, state);
                    state.working = {
                        ...state.working,
                        ...res
                    };
                }
                if (x.type === 'guard') {
                    state.working = await guardAction(x, state);
                }
                if (x.type === 'channel') {
                    const xx = inputHelper(state, { key: x.key });
                    channelToWrite = xx.key;
                }
            }
        }
        catch (e) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: e.message
                })
            };
        }
        const params = {
            TableName: `${process.env.DB}meta`,
            Item: {
                pk: channelToWrite,
                sk: 'id_' + JSON.parse(event.body).data.payload.id
            }
        };
        await db.put(params).promise();
    }
    if (isWebSocketSendEvent(event)) {
        return await sendWebsocketMessage(event);
    }
    if (event.httpMethod) {
        const data = JSON.parse(event.body);
        path = data.action;
        input = data.input;
        const app = await getDef(process.env.DB);
        def = app.api;
        let auth = {};
        if (event.requestContext &&
            event.requestContext.authorizer &&
            event.requestContext.authorizer.claims) {
            auth = event.requestContext.authorizer.claims;
        }
        // need to investigate why I needed to add this when making rispresso
        if (!auth.sub && event.headers.Authorization) {
            const sub = await getSubFromJwt(event.headers.Authorization.split(' ')[1]);
            auth = {
                sub
            };
        }
        state = {
            input,
            working: input,
            prev: {},
            auth
        };
        if (!def[path]) {
            console.log(JSON.stringify({
                type: 'RISE',
                error: 'invalid path',
                details: path
            }));
            return {
                statusCode: errorType,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                body: JSON.stringify({
                    error: 'Path does not exist'
                })
            };
        }
        let outputDefined = false;
        let internalDevState = [];
        try {
            for (const x of def[path]) {
                if (x.type === 'input') {
                    state.working = checkInputStructure(x, input);
                    errorType = 500;
                }
                if (x.type === 'add') {
                    const res = addAction(x, state);
                    state.working = {
                        ...state.working,
                        ...res
                    };
                }
                if (x.type === 'guard') {
                    state.working = await guardAction(x, state);
                }
                if (x.type === 'emit') {
                    errorType = 500;
                    const res = await makeEmitCall(x, state);
                    state.prev = res;
                    state.working = {
                        ...state.working,
                        ...res
                    };
                    if (process.env.STAGE === 'dev') {
                        internalDevState.push({
                            type: 'EMIT',
                            data: x.input
                                ? inputHelper(state, x.input)
                                : state.working
                        });
                    }
                }
                if (x.type === 'db') {
                    errorType = 500;
                    const res = await makeDbCall(x, state);
                    if (x.action === 'list') {
                        state.prev = res;
                        state.dbResult = res;
                        state.working = {
                            ...state.working,
                            list: res
                        };
                    }
                    else if (x.action === 'get') {
                        state.prev = res;
                        state.dbResult = res;
                        state.working = {
                            ...state.working,
                            item: res
                        };
                    }
                    else {
                        state.prev = res;
                        state.dbResult = res;
                        state.working = {
                            ...state.working,
                            ...res
                        };
                    }
                    if (process.env.STAGE === 'dev' && x.action === 'set') {
                        internalDevState.push({
                            type: 'DB',
                            data: x.input
                                ? inputHelper(state, x.input)
                                : state.working
                        });
                    }
                }
                if (x.type === 'users') {
                    errorType = 500;
                    const res = await makeCognitoCall(x, state);
                    state.prev = res;
                    state.working = {
                        ...state.working,
                        ...res
                    };
                }
                if (x.type === 'broadcast') {
                    errorType = 500;
                    const { channel } = inputHelper(state, {
                        channel: x.channel
                    });
                    x.channel = channel;
                    await broadcastAction(x, state);
                    if (process.env.STAGE === 'dev') {
                        internalDevState.push({
                            type: 'BROADCAST',
                            data: x.input
                                ? inputHelper(state, x.input)
                                : state.working
                        });
                    }
                }
                if (x.type === 'output') {
                    outputDefined = true;
                    state.working = checkOutputStructure(x, state.working);
                }
            }
            if (process.env.STAGE === 'dev') {
                internalDevState.push({
                    type: 'API',
                    data: !outputDefined && state.dbResult
                        ? state.dbResult
                        : state.working
                });
            }
            // await broadcastAction(
            //     { channel: 'internal' },
            //     {
            //         working: {
            //             type: 'EXECUTION_STATE',
            //             actions: internalDevState
            //         }
            //     }
            // )
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
                    'Access-Control-Allow-Headers': 'Content-Type'
                    // 'Access-Control-Allow-Credentials': true
                },
                body: JSON.stringify(!outputDefined && state.dbResult
                    ? state.dbResult
                    : state.working)
            };
        }
        catch (e) {
            console.log(JSON.stringify({
                type: 'RISE',
                error: 'error',
                path,
                details: e.message
            }));
            if (process.env.STAGE === 'dev') {
                internalDevState.push({
                    type: 'ERROR',
                    data: {
                        message: e.message
                    }
                });
            }
            // await broadcastAction(
            //     { channel: 'internal' },
            //     {
            //         working: {
            //             type: 'EXECUTION_STATE',
            //             actions: internalDevState
            //         }
            //     }
            // )
            // await r.default.db.set(
            //     {
            //         pk: 'RISE_ERROR',
            //         sk: Date.now().toString(),
            //         details: e.message
            //     },
            //     process.env.DB
            // )
            return {
                statusCode: errorType,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
                    'Access-Control-Allow-Headers': 'Content-Type'
                    // 'Access-Control-Allow-Credentials': true
                },
                body: JSON.stringify({
                    error: e.message
                })
            };
        }
    }
    if (event.detail) {
        input = event.detail;
        const source = event.source.split('.')[1];
        const eventName = event['detail-type'];
        const eventKey = `${source}_${eventName}`;
        const app = await getDef(process.env.DB);
        def = app.events || {};
        path = eventKey;
        state = {
            input,
            working: input,
            prev: {},
            auth: {}
        };
        let internalDevState = [];
        const doAction = async (eventAction) => {
            try {
                for (const x of eventAction) {
                    if (x.type === 'input') {
                        state.working = checkInputStructure(x, input);
                        errorType = 500;
                    }
                    if (x.type === 'add') {
                        const res = addAction(x, state);
                        state.working = {
                            ...state.working,
                            ...res
                        };
                    }
                    if (x.type === 'guard') {
                        state.working = await guardAction(x, state);
                    }
                    if (x.type === 'emit') {
                        const res = await makeEmitCall(x, state);
                        state.prev = res;
                        state.working = {
                            ...state.working,
                            ...res
                        };
                        if (process.env.STAGE === 'dev') {
                            internalDevState.push({
                                type: 'EMIT',
                                data: x.input
                                    ? inputHelper(state, x.input)
                                    : state.working
                            });
                        }
                    }
                    if (x.type === 'db') {
                        const res = await makeDbCall(x, state);
                        if (x.action === 'list') {
                            state.prev = res;
                            state.dbResult = res;
                            state.working = {
                                ...state.working,
                                list: res
                            };
                        }
                        else if (x.action === 'get') {
                            state.prev = res;
                            state.dbResult = res;
                            state.working = {
                                ...state.working,
                                item: res
                            };
                        }
                        else {
                            state.prev = res;
                            state.dbResult = res;
                            state.working = {
                                ...state.working,
                                ...res
                            };
                        }
                        if (process.env.STAGE === 'dev' && x.action === 'set') {
                            internalDevState.push({
                                type: 'DB',
                                data: x.input
                                    ? inputHelper(state, x.input)
                                    : state.working
                            });
                        }
                    }
                    if (x.type === 'users') {
                        const res = await makeCognitoCall(x, state);
                        state.prev = res;
                        state.working = {
                            ...state.working,
                            ...res
                        };
                    }
                    if (x.type === 'broadcast') {
                        const { channel } = inputHelper(state, {
                            channel: x.channel
                        });
                        x.channel = channel;
                        await broadcastAction(x, state);
                        if (process.env.STAGE === 'dev') {
                            internalDevState.push({
                                type: 'BROADCAST',
                                data: x.input
                                    ? inputHelper(state, x.input)
                                    : state.working
                            });
                        }
                    }
                    if (x.type === 'output') {
                        state.working = checkOutputStructure(x, state.working);
                    }
                }
                // return {
                //     statusCode: 200,
                //     headers: {
                //         'Access-Control-Allow-Origin': '*',
                //         'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
                //         'Access-Control-Allow-Headers': 'Content-Type'
                //         // 'Access-Control-Allow-Credentials': true
                //     },
                //     body: JSON.stringify(state.working)
                // }
            }
            catch (e) {
                console.log(JSON.stringify({
                    type: 'RISE',
                    error: 'error',
                    path,
                    details: e.message
                }));
                if (process.env.STAGE === 'dev') {
                    internalDevState.push({
                        type: 'ERROR',
                        data: {
                            message: e.message
                        }
                    });
                }
            }
        };
        for (const defEventKey of Object.keys(def)) {
            console.log('eventKey ', eventKey);
            const source = eventKey.split('_')[0];
            const theEvent = eventKey.split('_')[1];
            const eventSourceInfo = def[defEventKey].filter((x) => {
                return x.type === 'event-source';
            })[0];
            if (eventSourceInfo.source === source &&
                eventSourceInfo.event === theEvent) {
                await doAction(def[defEventKey]);
            }
        }
        // await broadcastAction(
        //     { channel: 'internal' },
        //     {
        //         working: {
        //             type: 'EXECUTION_STATE',
        //             actions: internalDevState
        //         }
        //     }
        // )
    }
};
