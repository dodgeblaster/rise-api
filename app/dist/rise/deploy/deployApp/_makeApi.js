"use strict";
// type Input = {
//     endpointName: string
//     lambdaName: string
//     stage: string
//     path: string
// }
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeLambdaeEndpoint = void 0;
const userConfig = (appName, stage) => {
    return {
        Resources: {
            ApiGatewayAuthorizer: {
                DependsOn: ['ApiGatewayRestApi'],
                Type: 'AWS::ApiGateway::Authorizer',
                Properties: {
                    Name: appName + stage + '_auth',
                    RestApiId: {
                        Ref: 'ApiGatewayRestApi'
                    },
                    IdentitySource: 'method.request.header.Authorization',
                    Type: 'COGNITO_USER_POOLS',
                    ProviderARNs: [
                        {
                            'Fn::GetAtt': ['CognitoUserPool', 'Arn']
                        }
                    ]
                }
            },
            CognitoUserPool: {
                Type: 'AWS::Cognito::UserPool',
                Properties: {
                    UserPoolName: `${appName}${stage}-pool`,
                    AdminCreateUserConfig: {
                        AllowAdminCreateUserOnly: true,
                        UnusedAccountValidityDays: 365
                    }
                }
            },
            CognitoUserPoolClient: {
                Type: 'AWS::Cognito::UserPoolClient',
                Properties: {
                    ClientName: `${appName}${stage}-pool-client`,
                    UserPoolId: {
                        Ref: 'CognitoUserPool'
                    },
                    ExplicitAuthFlows: ['ADMIN_NO_SRP_AUTH'],
                    GenerateSecret: false
                }
            }
        },
        Outputs: {
            UserPoolId: {
                Value: {
                    Ref: 'CognitoUserPool'
                }
            },
            UserPoolClientId: {
                Value: {
                    Ref: 'CognitoUserPoolClient'
                }
            }
        }
    };
};
const apiConfig = (props, auth) => {
    return {
        Resources: {
            ApiGatewayRestApi: {
                Type: 'AWS::ApiGateway::RestApi',
                Properties: {
                    Name: props.endpointName,
                    EndpointConfiguration: {
                        Types: ['EDGE']
                    },
                    Policy: ''
                }
            },
            ApiGatewayResource: {
                Type: 'AWS::ApiGateway::Resource',
                Properties: {
                    ParentId: {
                        'Fn::GetAtt': ['ApiGatewayRestApi', 'RootResourceId']
                    },
                    PathPart: props.path,
                    RestApiId: {
                        Ref: 'ApiGatewayRestApi'
                    }
                }
            },
            OptionsMethod: {
                Type: 'AWS::ApiGateway::Method',
                Properties: {
                    AuthorizationType: 'NONE',
                    RestApiId: {
                        Ref: 'ApiGatewayRestApi'
                    },
                    ResourceId: {
                        Ref: 'ApiGatewayResource'
                    },
                    HttpMethod: 'OPTIONS',
                    Integration: {
                        IntegrationResponses: [
                            {
                                StatusCode: 200,
                                ResponseParameters: {
                                    'method.response.header.Access-Control-Allow-Origin': "'*'",
                                    'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                                    'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,POST'",
                                    'method.response.header.Access-Control-Allow-Credentials': "'false'"
                                },
                                ResponseTemplates: {
                                    'application/json': ''
                                }
                            }
                        ],
                        PassthroughBehavior: 'WHEN_NO_MATCH',
                        RequestTemplates: {
                            'application/json': '{"statusCode": 200}'
                        },
                        Type: 'MOCK'
                    },
                    MethodResponses: [
                        {
                            StatusCode: '200',
                            ResponseParameters: {
                                'method.response.header.Access-Control-Allow-Origin': true,
                                'method.response.header.Access-Control-Allow-Headers': true,
                                'method.response.header.Access-Control-Allow-Methods': true,
                                'method.response.header.Access-Control-Allow-Credentials': true
                            },
                            ResponseModels: {}
                        }
                    ]
                }
            },
            ApiGatewayMethodPost: {
                Type: 'AWS::ApiGateway::Method',
                Properties: {
                    HttpMethod: 'POST',
                    RequestParameters: {},
                    ResourceId: {
                        Ref: 'ApiGatewayResource'
                    },
                    RestApiId: {
                        Ref: 'ApiGatewayRestApi'
                    },
                    ApiKeyRequired: false,
                    ...(auth
                        ? {
                            AuthorizationType: 'COGNITO_USER_POOLS',
                            AuthorizerId: {
                                Ref: 'ApiGatewayAuthorizer'
                            }
                        }
                        : {
                            AuthorizationType: 'NONE'
                        }),
                    Integration: {
                        IntegrationHttpMethod: 'POST',
                        Type: 'AWS_PROXY',
                        Uri: {
                            'Fn::Join': [
                                '',
                                [
                                    'arn:',
                                    {
                                        Ref: 'AWS::Partition'
                                    },
                                    ':apigateway:',
                                    {
                                        Ref: 'AWS::Region'
                                    },
                                    ':lambda:path/2015-03-31/functions/',
                                    {
                                        'Fn::GetAtt': [props.lambdaName, 'Arn']
                                    },
                                    '/invocations'
                                ]
                            ]
                        }
                    },
                    MethodResponses: []
                }
            },
            ApiGatewayDeployment: {
                Type: 'AWS::ApiGateway::Deployment',
                Properties: {
                    RestApiId: {
                        Ref: 'ApiGatewayRestApi'
                    },
                    StageName: props.stage
                },
                DependsOn: ['ApiGatewayMethodPost']
            },
            MainLambdaPermissionApiGateway: {
                Type: 'AWS::Lambda::Permission',
                Properties: {
                    FunctionName: {
                        'Fn::GetAtt': [props.lambdaName, 'Arn']
                    },
                    Action: 'lambda:InvokeFunction',
                    Principal: 'apigateway.amazonaws.com',
                    SourceArn: {
                        'Fn::Join': [
                            '',
                            [
                                'arn:',
                                {
                                    Ref: 'AWS::Partition'
                                },
                                ':execute-api:',
                                {
                                    Ref: 'AWS::Region'
                                },
                                ':',
                                {
                                    Ref: 'AWS::AccountId'
                                },
                                ':',
                                {
                                    Ref: 'ApiGatewayRestApi'
                                },
                                '/*/*'
                            ]
                        ]
                    }
                }
            }
        },
        Outputs: {
            Endpoint: {
                Description: 'URL of the endpoint',
                Value: {
                    'Fn::Join': [
                        '',
                        [
                            'https://',
                            {
                                Ref: 'ApiGatewayRestApi'
                            },
                            '.execute-api.',
                            {
                                Ref: 'AWS::Region'
                            },
                            '.',
                            {
                                Ref: 'AWS::URLSuffix'
                            },
                            '/dev'
                        ]
                    ]
                }
            }
        }
    };
};
function makeLambdaeEndpoint(props) {
    if (props.auth) {
        const a = apiConfig(props, true);
        const c = userConfig(props.endpointName, props.stage);
        return {
            Resources: {
                ...a.Resources,
                ...c.Resources
            },
            Outputs: {
                ...a.Outputs,
                ...c.Outputs
            }
        };
    }
    return apiConfig(props, false);
}
exports.makeLambdaeEndpoint = makeLambdaeEndpoint;
