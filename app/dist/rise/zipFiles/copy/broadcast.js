const { inputHelper } = require('./_inputHelper')
const { sendWebsocketMessage } = require('./sendWebsocketMessage')

const broadcastPayload = async (channel, data) => {
    const domain = process.env.WEBSOCKET_SEND_URL.split('/')[0]
    await sendWebsocketMessage({
        requestContext: {
            domainName: domain,
            stage: process.env.STAGE
        },
        body: JSON.stringify({
            data: {
                channel,
                payload: data
            }
        })
    })
}

const broadcastAction = async (def, input) => {
    const data = def.input ? inputHelper(input, def.input) : input.working
    await broadcastPayload(def.channel, data)
    return input.working
}

module.exports = {
    broadcastAction
}
