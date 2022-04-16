const { inputHelper } = require('./_inputHelper')

const broadcastPayload = async (channel, data) => {
    const env = require('process').env
    const AWS = require('aws-sdk')
    const URL = require('url')
    const https = require('https')

    AWS.config.update({
        region: process.env.AWS_REGION,
        credentials: new AWS.Credentials(
            env.AWS_ACCESS_KEY_ID,
            env.AWS_SECRET_ACCESS_KEY,
            env.AWS_SESSION_TOKEN
        )
    })

    const main = () => {
        const body = {
            query: `mutation MyMutation($channel: String!, $data: AWSJSON!) {
                mainPublish(name: $channel, data: $data) {
                    name
                    data
                }
            }`,
            variables: {
                channel: channel,
                data: JSON.stringify(data)
            }
        }
        const uri = URL.parse(process.env.BROADCAST_URL)
        const httpRequest = new AWS.HttpRequest(
            uri.href,
            process.env.AWS_REGION
        )
        httpRequest.headers.host = uri.host
        httpRequest.headers['Content-Type'] = 'application/json'
        httpRequest.method = 'POST'
        httpRequest.body = JSON.stringify(body)

        const signer = new AWS.Signers.V4(httpRequest, 'appsync', true)
        signer.addAuthorization(AWS.config.credentials, AWS.util.date.getDate())

        const options = {
            hostname: uri.href.slice(8, uri.href.length - 8),
            path: '/graphql',
            method: httpRequest.method,
            body: httpRequest.body,
            headers: httpRequest.headers
        }

        return new Promise((res, rej) => {
            const req = https.request(options, (res) => {
                res.on('data', (d) => {
                    process.stdout.write(d)
                })
            })

            req.on('error', (error) => {
                console.error(error.message)
            })

            req.write(JSON.stringify(body))
            req.end(() => {
                res()
            })
        })
    }

    return main()
}

const broadcastAction = async (def, input) => {
    const data = def.input ? inputHelper(input, def.input) : input.working
    await broadcastPayload(def.channel, data)
    return input.working
}

module.exports = {
    broadcastAction
}
