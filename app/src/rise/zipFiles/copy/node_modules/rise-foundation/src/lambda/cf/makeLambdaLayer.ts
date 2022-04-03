export function makeLambdaLayer(props: any) {
    return {
        Resources: {
            [`Layer${props.name}`]: {
                Type: 'AWS::Lambda::LayerVersion',
                Properties: {
                    Content: {
                        S3Bucket: props.bucket,
                        S3Key: props.bucketKey
                    },
                    Description: props.description || '',
                    LayerName: props.name
                }
            }
        },
        Outputs: {}
    }
}
