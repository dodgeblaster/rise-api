import AWS from 'aws-sdk'

export type GetCloudFormationOutputsInput = {
    stack: string
    outputs: string[]
    region?: string
    AWS?: any
}

export async function getCloudFormationOutputs(
    props: GetCloudFormationOutputsInput
) {
    const aws = props.AWS || AWS
    const cloudformation = new aws.CloudFormation({
        region: props.region || process.env.AWS_REGION || 'us-east-1'
    })
    function getOutput(outputs: any[], value: string) {
        const v = outputs.find((x) => x.OutputKey === value)
        return v ? v.OutputValue : false
    }

    const params = {
        StackName: props.stack
    }

    const x: any = await cloudformation.describeStacks(params).promise()
    const details = x.Stacks[0]
    const outputs = details.Outputs

    let res: any = {}
    for (const o of props.outputs) {
        res[o] = getOutput(outputs, o)
    }
    return res
}
