import { deployStack } from './deployStack'
import { removeStack } from './removeStack'
import { getDeployStatus } from './getDeployStatus'

jest.setTimeout(30000)

const createTemplate = JSON.stringify({
    Resources: {
        Database: {
            Type: 'AWS::DynamoDB::Table',
            Properties: {
                TableName: 'example-table',
                AttributeDefinitions: [
                    { AttributeName: 'pk', AttributeType: 'S' },
                    { AttributeName: 'sk', AttributeType: 'S' }
                ],
                KeySchema: [
                    { AttributeName: 'pk', KeyType: 'HASH' },
                    { AttributeName: 'sk', KeyType: 'RANGE' }
                ],
                BillingMode: 'PAY_PER_REQUEST'
            }
        }
    }
})

const updateTemplate = JSON.stringify({
    Resources: {
        Database: {
            Type: 'AWS::DynamoDB::Table',
            Properties: {
                TableName: 'example-table',
                AttributeDefinitions: [
                    { AttributeName: 'pk', AttributeType: 'S' },
                    { AttributeName: 'sk', AttributeType: 'S' }
                ],
                KeySchema: [
                    { AttributeName: 'pk', KeyType: 'HASH' },
                    { AttributeName: 'sk', KeyType: 'RANGE' }
                ],
                Tags: {
                    Key: 'app',
                    Value: 'foundatio'
                },

                BillingMode: 'PAY_PER_REQUEST'
            }
        }
    },
    Outputs: {
        // something here
    }
})

test.skip('cf will work', async () => {
    /**
     * Create Stack
     *
     */
    const createResult = await deployStack({
        name: 'testingstack',
        template: createTemplate
    })

    //{"status":"creating","id":"arn:aws:cloudformation:us-east-1:251256923172:stack/testingstack/958805f0-15bb-11ec-a375-12f6d51fe9c7"}
    console.log('CREATE:: ', JSON.stringify(createResult))

    // run it again to hit inprogress state
    const createResult2 = await deployStack({
        name: 'testingstack',
        template: createTemplate
    })
    //{"status":"createinprogress"}
    console.log('CREATE2:: ', JSON.stringify(createResult2))

    // do the check status function
    const completeResult = await getDeployStatus({
        config: {
            stackName: 'testingstack',
            minRetryInterval: 1000,
            maxRetryInterval: 5000,
            backoffRate: 1.2,
            maxRetries: 50,
            onCheck: (x: any) => {
                console.log('>>> ', JSON.stringify(x))
            }
        }
    })
    console.log('compelte-- ', completeResult)

    // try deploying the same stacj and get nothing status back

    // deploy updated stack

    // do the  check status function

    // do get outputs function

    // remove stack

    // do the check remove status function
    const removeResult = await removeStack({
        name: 'testingstack',
        template: createTemplate
    })

    // get complete status on stack
})
