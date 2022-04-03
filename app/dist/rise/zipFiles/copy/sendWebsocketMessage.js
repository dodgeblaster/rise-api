'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
module.exports.sendWebsocketMessage = async (event) => {
    const postData = JSON.parse(event.body).data;
    const channel = postData.channel;
    const payload = postData.payload;
    const table = `${process.env.DB}meta`;
    let connectionData;
    try {
        const params = {
            TableName: table,
            KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
            ExpressionAttributeValues: {
                ':pk': channel,
                ':sk': 'id_'
            }
        };
        connectionData = await db.query(params).promise();
    }
    catch (e) {
        return { statusCode: 500, body: e.stack };
    }
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
    });
    const postCalls = connectionData.Items.map((x) => x.sk.split('_')[1]).map(async (sk) => {
        try {
            await apigwManagementApi
                .postToConnection({
                ConnectionId: sk,
                Data: JSON.stringify(payload)
            })
                .promise();
        }
        catch (e) {
            if (e.statusCode === 410) {
                console.log(`Found stale connection, deleting `, {
                    pk: channel,
                    sk: 'id_' + sk
                });
                await db
                    .delete({
                    TableName: table,
                    Key: { pk: channel, sk: 'id_' + sk }
                })
                    .promise();
                await db
                    .delete({
                    TableName: table,
                    Key: { pk: sk, sk: 'id_' + sk }
                })
                    .promise();
            }
            else {
                throw e;
            }
        }
    });
    try {
        await Promise.all(postCalls);
    }
    catch (e) {
        return { statusCode: 500, body: e.stack };
    }
    return { statusCode: 200, body: 'Data sent.' };
};
