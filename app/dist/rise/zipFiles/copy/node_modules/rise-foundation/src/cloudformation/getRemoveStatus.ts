import AWS from 'aws-sdk'

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
 * Get Cloudformation stack info and outputs
 */
async function getCloudFormationStackInfo(getInfo: any) {
    const data = await getInfo()
    const status = data.StackStatus
    const message = data.StackStatusReason
    const outputs = data.Outputs
    return {
        status,
        message,
        outputs
    }
}

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
     * Create increased timer for the next call
     */
    const increasedTimer = timer * config.backoffRate
    const newTimer =
        increasedTimer > config.maxRetryInterval
            ? config.maxRetryInterval
            : increasedTimer

    return await recursiveCheck(io, config, times + 1, newTimer)
}

// @ts-ignore
async function recursiveCheck(
    io: any,
    config: any,
    times: number,
    timer: number
) {
    let stackInfo = {
        status: ''
    }
    try {
        stackInfo = await getCloudFormationStackInfo(io.getInfo)
    } catch (e: any) {
        if (times > 1 && e.message.includes('does not exist')) {
            return {
                status: 'success',
                message: 'Your app was successfully removed'
            }
        }

        if (times === 1 && e.message.includes('does not exist')) {
            return {
                status: 'does not exist',
                message: 'You app does not exist in this AWS account'
            }
        }
    }

    if (times === config.maxRetries) {
        return {
            status: 'still deleting',
            message: 'You app is still deleting'
        }
    }

    if (stackInfo.status.includes('PROGRESS')) {
        return await checkAgainState(io, config, timer, times)
    }

    if (stackInfo.status.includes('FAIL')) {
        return {
            status: 'fail',
            message: 'Failed to remove app'
        }
    }

    if (stackInfo.status.includes('COMPLETE')) {
        return {
            status: 'success',
            message: 'Your app was successfully removed'
        }
    }

    return {
        status: 'fail',
        message: 'Cloudformation is in an unknown state'
    }
}

export type GetRemoveStatusInput = {
    AWS?: any
    region?: string
    config: {
        stackName: string
        minRetryInterval: number
        maxRetryInterval: number
        backoffRate: number
        maxRetries: number
    }
}

export type GetRemoveStatusOutput = {
    status: string
    message: string
}

export async function getRemoveStatus(
    props: GetRemoveStatusInput
): Promise<GetRemoveStatusOutput> {
    const aws = props.AWS || AWS
    const region = props.region || process.env.AWS_REGION || 'us-east-1'
    return recursiveCheck(
        {
            getInfo: getStackInfo(aws, region)
        },
        props.config,
        1,
        props.config.minRetryInterval
    )
}
