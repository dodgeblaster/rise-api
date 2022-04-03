const AWS = require('aws-sdk')
AWS.config = {
    region: 'us-east-1'
}
const db = new AWS.DynamoDB({ apiVersion: '2012-08-10' })

export const testUtils = {
    createTable: async () => {
        await db
            .createTable({
                AttributeDefinitions: [
                    {
                        AttributeName: 'pk',
                        AttributeType: 'S'
                    },
                    {
                        AttributeName: 'sk',
                        AttributeType: 'S'
                    },
                    {
                        AttributeName: 'pk2',
                        AttributeType: 'S'
                    },
                    {
                        AttributeName: 'pk3',
                        AttributeType: 'S'
                    }
                ],
                KeySchema: [
                    {
                        AttributeName: 'pk',
                        KeyType: 'HASH'
                    },
                    {
                        AttributeName: 'sk',
                        KeyType: 'RANGE'
                    }
                ],
                GlobalSecondaryIndexes: [
                    {
                        IndexName: 'pk2',
                        KeySchema: [
                            {
                                AttributeName: 'pk2',
                                KeyType: 'HASH'
                            },
                            {
                                AttributeName: 'sk',
                                KeyType: 'RANGE'
                            }
                        ],
                        Projection: {
                            ProjectionType: 'ALL'
                        }
                    },
                    {
                        IndexName: 'pk3',
                        KeySchema: [
                            {
                                AttributeName: 'pk3',
                                KeyType: 'HASH'
                            },
                            {
                                AttributeName: 'sk',
                                KeyType: 'RANGE'
                            }
                        ],
                        Projection: {
                            ProjectionType: 'ALL'
                        }
                    }
                ],
                BillingMode: 'PAY_PER_REQUEST',
                TableName: process.env.TABLE
            })
            .promise()
    },

    removeTable: async () => {
        await db.deleteTable({
            TableName: process.env.TABLE
        })
    }
}
