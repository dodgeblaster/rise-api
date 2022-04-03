import AWS from 'aws-sdk'

type StatusUpdateResource = {
    id: string
    status: string
    type: string
}

export type StatusUpdateInput = StatusUpdateResource[]

/**
 * GetStackInfo
 *
 */
const getStackInfo = (AWS: any, region: string) => async (name: string) => {
    const cloudformation = new AWS.CloudFormation({
        region
    })
    const params = {
        StackName: name
    }

    const x = await cloudformation.describeStacks(params).promise()
    return x.Stacks[0]
}

/**
 * GetStackResourceStatus
 *
 */
const getStackResourceStatus =
    (AWS: any, region: string) => async (name: string) => {
        const cloudformation = new AWS.CloudFormation({
            region
        })
        const params = {
            StackName: name
        }

        return await cloudformation.describeStackResources(params).promise()
    }

/**
 * Get Cloudformation stack info and outputs
 */
async function getCloudFormationStackInfo(getInfo: any, name: string) {
    const data = await getInfo(name)
    const status = data.StackStatus
    const message = data.StackStatusReason
    const outputs = data.Outputs
    return {
        status,
        message,
        outputs
    }
}

/**
 * Display and return:
 * "we checked the max amount of times, and Cloudformation is still deploying"
 */
function stillInProgressState() {
    return {
        status: 'in progress',
        message: 'Cloudformation is still deploying...'
    }
}

/**
 * Display current deploy status of all resources
 * wait some time
 * and check the status again
 */
// @ts-ignore
async function checkAgainState(
    io: any,
    config: any,
    timer: number,
    times: number
) {
    /**
     * Wait based on timer passed in to the function
     */
    const wait = (time: number): Promise<void> =>
        new Promise((r) => setTimeout(() => r(), time))

    await wait(timer)

    /**
     * Get status of all resources
     */
    const resourceProgress = await io.getResources(config.stackName)

    const xx = {
        ResponseMetadata: { RequestId: '21f88cc8-94ea-4b50-a089-9b55ddd20c2e' },
        StackResources: [
            {
                StackName: 'testingstack',
                StackId:
                    'arn:aws:cloudformation:us-east-1:251256923172:stack/testingstack/ef160310-15d4-11ec-bfcb-12d63f44d7b7',
                LogicalResourceId: 'Database',
                PhysicalResourceId: 'example-table',
                ResourceType: 'AWS::DynamoDB::Table',
                Timestamp: '2021-09-15T03:28:08.237Z',
                ResourceStatus: 'CREATE_IN_PROGRESS',
                ResourceStatusReason: 'Resource creation Initiated',
                DriftInformation: { StackResourceDriftStatus: 'NOT_CHECKED' }
            }
        ]
    }

    /**
     * Display status in terminal
     */
    const resources = resourceProgress.StackResources.map((x: any) => ({
        id: x.LogicalResourceId,
        status: x.ResourceStatus,
        type: x.ResourceType
    }))
    config.onCheck(resources, times)

    /**
     * Create increased timer for the next call
     */
    const increasedTimer = timer * config.backoffRate
    const newTimer =
        increasedTimer > config.maxRetryInterval
            ? config.maxRetryInterval
            : increasedTimer

    return await recursiveCheck(io, config, times + 1, newTimer)
}

/**
 * Display and return deploy failure message
 */
function failState(message: string) {
    return {
        status: 'fail',
        message: message
    }
}

/**
 * Display and return deploy success state
 * and deployed app resource details
 */
function completeState(stackInfo: any) {
    return {
        status: 'success',
        message: 'success',
        info: stackInfo
    }
}

/**
 * Display and return an unkonwn state
 * this happens if cloudformation returns an unknown or undefined
 * status
 */
function unknownState() {
    return {
        status: 'fail',
        message: 'Cloudformation is in an unknown state'
    }
}

// @ts-ignore
async function recursiveCheck(
    io: any,
    config: any,
    times: number,
    timer: number
) {
    const stackInfo = await getCloudFormationStackInfo(
        io.getInfo,
        config.stackName
    )

    if (times === config.maxRetries) {
        return stillInProgressState()
    }

    if (stackInfo.status.includes('PROGRESS')) {
        return await checkAgainState(io, config, timer, times)
    }

    if (stackInfo.status.includes('FAIL')) {
        return failState(stackInfo.message)
    }

    if (stackInfo.status.includes('COMPLETE')) {
        return completeState(stackInfo)
    }

    return unknownState()
}

export type GetDeploymentStatusInput = {
    AWS?: any
    region?: string
    config: {
        stackName: string
        minRetryInterval: number
        maxRetryInterval: number
        backoffRate: number
        maxRetries: number
        onCheck: any
    }
}

export type Output = {
    status: string
    message: string
    info?: any
}

export async function getDeployStatus(
    props: GetDeploymentStatusInput
): Promise<Output> {
    const aws = props.AWS || AWS
    const region = props.region || process.env.AWS_REGION || 'us-east-1'
    return recursiveCheck(
        {
            getInfo: getStackInfo(aws, region),
            getResources: getStackResourceStatus(aws, region)
        },
        props.config,
        1,
        props.config.minRetryInterval
    )
}
