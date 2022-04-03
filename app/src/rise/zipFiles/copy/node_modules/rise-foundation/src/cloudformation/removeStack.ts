import AWS from 'aws-sdk'

export type RemoveStackInput = {
    name: string
    template: string
    region?: string
    AWS?: any
}

export async function removeStack(props: RemoveStackInput) {
    const aws = props.AWS || AWS
    const cloudformation = new aws.CloudFormation({
        region: props.region || process.env.AWS_REGION || 'us-east-1'
    })

    const params = {
        StackName: props.name
    }

    return await cloudformation.deleteStack(params).promise()
}
