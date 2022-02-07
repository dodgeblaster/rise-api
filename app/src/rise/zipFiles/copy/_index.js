const { checkInputStructure } = require('./checkInputStructure')
const { checkOutputStructure } = require('./checkOutputStructure')
const { addAction } = require('./add')
const { makeDbCall } = require('./db')
const { guardAction } = require('./guard')
const { makeEmitCall } = require('./emit')
const { makeCognitoCall } = require('./users')
const { broadcastAction } = require('./broadcast')
const r = require('./node_modules/rise-foundation')
const def = require('./index')

/**
 * DB CALL
 *
 *
 */
const AWS = require('aws-sdk')
const region = process.env.AWS_REGION || 'us-east-1'
const db = new AWS.DynamoDB.DocumentClient({
    region: region
})
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
        .promise()

    let def = {
        api: {},
        events: {}
    }
    item.Items.forEach((x) => {
        const mod = JSON.parse(x.def)
        def = {
            api: {
                ...def.api,
                ...mod.api
            },
            events: {
                ...def.events,
                ...mod.events
            }
        }
    })
    return def
    //return JSON.parse(item.Item.def)
}

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
    }
    let path = ''
    let errorType = 400
    let def = {}
    let input = {}
    if (event.httpMethod) {
        const data = JSON.parse(event.body)
        path = data.action
        input = data.input
        const app = await getDef(process.env.DB)
        def = app.api

        let auth = {}
        if (
            event.requestContext &&
            event.requestContext.authorizer &&
            event.requestContext.authorizer.claims
        ) {
            auth = event.requestContext.authorizer.claims
        }

        state = {
            input,
            working: input,
            prev: {},
            auth
        }
        if (!def[path]) {
            console.log(
                JSON.stringify({
                    type: 'RISE',
                    error: 'invalid path',
                    details: path
                })
            )
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
            }
        }
        let outputDefined = false

        try {
            for (const x of def[path]) {
                if (x.type === 'input') {
                    state.working = checkInputStructure(x, input)
                    errorType = 500
                }

                if (x.type === 'add') {
                    const res = addAction(x, state)
                    state.working = {
                        ...state.working,
                        ...res
                    }
                }

                if (x.type === 'guard') {
                    state.working = await guardAction(x, state)
                }

                if (x.type === 'emit') {
                    const res = await makeEmitCall(x, state)
                    state.prev = res
                    state.working = {
                        ...state.working,
                        ...res
                    }
                }

                if (x.type === 'db') {
                    const res = await makeDbCall(x, state)
                    if (x.action === 'list') {
                        state.prev = res
                        state.dbResult = res
                        state.working = {
                            ...state.working,
                            list: res
                        }
                    } else if (x.action === 'get') {
                        state.prev = res
                        state.dbResult = res
                        state.working = {
                            ...state.working,
                            item: res
                        }
                    } else {
                        state.prev = res
                        state.dbResult = res
                        state.working = {
                            ...state.working,
                            ...res
                        }
                    }
                }
                if (x.type === 'users') {
                    const res = await makeCognitoCall(x, state)
                    state.prev = res
                    state.working = {
                        ...state.working,
                        ...res
                    }
                }

                if (x.type === 'broadcast') {
                    await broadcastAction(x, state)
                }

                if (x.type === 'output') {
                    outputDefined = true
                    state.working = checkOutputStructure(x, state.working)
                }
            }

            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
                    'Access-Control-Allow-Headers': 'Content-Type'
                    // 'Access-Control-Allow-Credentials': true
                },
                body: JSON.stringify(
                    !outputDefined && state.dbResult
                        ? state.dbResult
                        : state.working
                )
            }
        } catch (e) {
            console.log(
                JSON.stringify({
                    type: 'RISE',
                    error: 'error',
                    path,
                    details: e.message
                })
            )

            await r.default.db.set(
                {
                    pk: 'RISE_ERROR',
                    sk: Date.now().toString(),
                    details: e.message
                },
                process.env.DB
            )

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
            }
        }
    }

    if (event.detail) {
        input = event.detail
        const source = event.source.split('.')[1]
        const eventName = event['detail-type']
        const eventKey = `${source}_${eventName}`
        const app = await getDef(process.env.DB)
        def = app.events
        path = eventKey

        state = {
            input,
            working: input,
            prev: {},
            auth: {}
        }

        const doAction = async (eventAction) => {
            try {
                for (const x of eventAction) {
                    if (x.type === 'input') {
                        state.working = checkInputStructure(x, input)
                        errorType = 500
                    }

                    if (x.type === 'add') {
                        const res = addAction(x, state)
                        state.working = {
                            ...state.working,
                            ...res
                        }
                    }

                    if (x.type === 'guard') {
                        state.working = await guardAction(x, state)
                    }

                    if (x.type === 'emit') {
                        const res = await makeEmitCall(x, state)
                        state.prev = res
                        state.working = {
                            ...state.working,
                            ...res
                        }
                    }

                    if (x.type === 'db') {
                        const res = await makeDbCall(x, state)
                        if (x.action === 'list') {
                            state.prev = res
                            state.dbResult = res
                            state.working = {
                                ...state.working,
                                list: res
                            }
                        } else if (x.action === 'get') {
                            state.prev = res
                            state.dbResult = res
                            state.working = {
                                ...state.working,
                                item: res
                            }
                        } else {
                            state.prev = res
                            state.dbResult = res
                            state.working = {
                                ...state.working,
                                ...res
                            }
                        }
                    }
                    if (x.type === 'users') {
                        const res = await makeCognitoCall(x, state)
                        state.prev = res
                        state.working = {
                            ...state.working,
                            ...res
                        }
                    }

                    if (x.type === 'broadcast') {
                        await broadcastAction(x, state)
                    }

                    if (x.type === 'output') {
                        state.working = checkOutputStructure(x, state.working)
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
            } catch (e) {
                console.log(
                    JSON.stringify({
                        type: 'RISE',
                        error: 'error',
                        path,
                        details: e.message
                    })
                )

                await r.default.db.set(
                    {
                        pk: 'RISE_ERROR',
                        sk: Date.now().toString(),
                        details: e.message
                    },
                    process.env.DB
                )
            }
        }

        for (const defEventKey of Object.keys(def)) {
            if (defEventKey.includes(eventKey)) {
                await doAction(def[defEventKey])
            }
        }
    }
}
