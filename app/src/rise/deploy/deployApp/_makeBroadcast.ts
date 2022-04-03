export function makeBroadcast(name: string, channels: string[], auth: boolean) {
    if (auth) {
        const region = 'us-east-1'
        const makeMutationChannel = (channel: string) =>
            `${channel}Publish (name: String! data: AWSJSON!): Channel
        @aws_iam 
`

        const makeSubscriptionChannel = (
            channel: string
        ) => `${channel}Subscribe (name: String!): Channel
            @aws_subscribe(mutations: ["${channel}Publish"])
`

        const makeResolver = (channel: string) => ({
            Type: 'AWS::AppSync::Resolver',
            Properties: {
                ApiId: {
                    'Fn::GetAtt': ['BroadcastApi', 'ApiId']
                },
                FieldName: `${channel}Publish`,
                TypeName: 'Mutation',
                DataSourceName: 'pubsub',
                Kind: 'UNIT',
                RequestMappingTemplate: ` {
                        "version": "2017-02-28",
                        "payload": {
                            "name": "$context.arguments.name",
                            "data": $util.toJson($context.arguments.data)
                        }
                        #if ($context.arguments.name == "internal")
                            #if ($context.identity.accountId != 251256923172)
                                $util.unauthorized()
                            #end
                        #end
                    }`,
                ResponseMappingTemplate: '$util.toJson($context.result)'
            },
            DependsOn: ['NoneDataSource', 'BroadcastApiSchema']
        })

        const resolverObject = channels.reduce((acc: any, ch) => {
            acc[`${ch}Resolver`] = makeResolver(ch)
            return acc
        }, {})

        const schema = `schema {
            query: Query
            mutation: Mutation
            subscription: Subscription
        }
        
        type Channel @aws_iam @aws_cognito_user_pools {
            name: String!
            data: AWSJSON!
        }
        
        type Query {
            getChannel: Channel
        }
        
        type Mutation {
            ${channels.map(makeMutationChannel)}
        }
        
        type Subscription {
            ${channels.map(makeSubscriptionChannel)}
        }
    `

        return {
            Resources: {
                BroadcastApi: {
                    Type: 'AWS::AppSync::GraphQLApi',
                    Properties: {
                        Name: name,
                        XrayEnabled: false,
                        AuthenticationType: 'AMAZON_COGNITO_USER_POOLS',
                        UserPoolConfig: {
                            AwsRegion: region,
                            UserPoolId: {
                                Ref: 'CognitoUserPool'
                            },
                            DefaultAction: 'ALLOW'
                        },

                        AdditionalAuthenticationProviders: [
                            // {
                            //     AuthenticationType: 'API_KEY'
                            // },
                            {
                                AuthenticationType: 'AWS_IAM'
                            }
                        ]
                    }
                },
                BroadcastApiSchema: {
                    Type: 'AWS::AppSync::GraphQLSchema',
                    Properties: {
                        ApiId: {
                            'Fn::GetAtt': ['BroadcastApi', 'ApiId']
                        },
                        Definition: schema
                    }
                },
                // BroadcastApiKey: {
                //     Type: 'AWS::AppSync::ApiKey',
                //     Properties: {
                //         ApiId: {
                //             'Fn::GetAtt': ['BroadcastApi', 'ApiId']
                //         }
                //     },
                //     DependsOn: ['BroadcastApiSchema']
                // },
                NoneDataSource: {
                    Type: 'AWS::AppSync::DataSource',
                    Properties: {
                        ApiId: {
                            'Fn::GetAtt': ['BroadcastApi', 'ApiId']
                        },
                        Name: 'pubsub',
                        Type: 'NONE'
                    }
                },
                ...resolverObject
            },
            Outputs: {
                broadcastUrl: {
                    Value: {
                        'Fn::GetAtt': ['BroadcastApi', 'GraphQLUrl']
                    }
                },
                // broadcastApiKey: {
                //     Value: {
                //         'Fn::GetAtt': ['BroadcastApiKey', 'ApiKey']
                //     }
                // },
                broadcastId: {
                    Value: {
                        'Fn::GetAtt': ['BroadcastApi', 'ApiId']
                    }
                },
                region: {
                    Value: {
                        Ref: 'AWS::Region'
                    }
                }
            }
        }
    } else {
        const region = 'us-east-1'
        const makeMutationChannel = (channel: string) =>
            `${channel}Publish (name: String! data: AWSJSON!): Channel
        @aws_iam 
`

        const makeSubscriptionChannel = (
            channel: string
        ) => `${channel}Subscribe (name: String!): Channel
            @aws_subscribe(mutations: ["${channel}Publish"])
`

        const makeResolver = (channel: string) => ({
            Type: 'AWS::AppSync::Resolver',
            Properties: {
                ApiId: {
                    'Fn::GetAtt': ['BroadcastApi', 'ApiId']
                },
                FieldName: `${channel}Publish`,
                TypeName: 'Mutation',
                DataSourceName: 'pubsub',
                Kind: 'UNIT',
                RequestMappingTemplate:
                    '\n        {\n          "version": "2017-02-28",\n          "payload": {\n              "name": "$context.arguments.name",\n              "data": $util.toJson($context.arguments.data)\n          }\n        }',
                ResponseMappingTemplate: '$util.toJson($context.result)'
            },
            DependsOn: ['NoneDataSource', 'BroadcastApiSchema']
        })

        const resolverObject = channels.reduce((acc: any, ch) => {
            acc[`${ch}Resolver`] = makeResolver(ch)
            return acc
        }, {})

        const schema = `schema {
            query: Query
            mutation: Mutation
            subscription: Subscription
        }
        
        type Channel @aws_iam @aws_api_key {
            name: String!
            data: AWSJSON!
        }
        
        type Query {
            getChannel: Channel
        }
        
        type Mutation {
            ${channels.map(makeMutationChannel)}
        }
        
        type Subscription {
            ${channels.map(makeSubscriptionChannel)}
        }
    `

        return {
            Resources: {
                BroadcastApi: {
                    Type: 'AWS::AppSync::GraphQLApi',
                    Properties: {
                        Name: name,
                        XrayEnabled: false,
                        AuthenticationType: 'API_KEY',
                        AdditionalAuthenticationProviders: [
                            // {
                            //     AuthenticationType: 'API_KEY'
                            // },
                            {
                                AuthenticationType: 'AWS_IAM'
                            }
                        ]
                    }
                },
                BroadcastApiSchema: {
                    Type: 'AWS::AppSync::GraphQLSchema',
                    Properties: {
                        ApiId: {
                            'Fn::GetAtt': ['BroadcastApi', 'ApiId']
                        },
                        Definition: schema
                    }
                },
                BroadcastApiKey: {
                    Type: 'AWS::AppSync::ApiKey',
                    Properties: {
                        ApiId: {
                            'Fn::GetAtt': ['BroadcastApi', 'ApiId']
                        }
                    },
                    DependsOn: ['BroadcastApiSchema']
                },
                NoneDataSource: {
                    Type: 'AWS::AppSync::DataSource',
                    Properties: {
                        ApiId: {
                            'Fn::GetAtt': ['BroadcastApi', 'ApiId']
                        },
                        Name: 'pubsub',
                        Type: 'NONE'
                    }
                },
                ...resolverObject
            },
            Outputs: {
                broadcastUrl: {
                    Value: {
                        'Fn::GetAtt': ['BroadcastApi', 'GraphQLUrl']
                    }
                },
                broadcastApiKey: {
                    Value: {
                        'Fn::GetAtt': ['BroadcastApiKey', 'ApiKey']
                    }
                },
                broadcastId: {
                    Value: {
                        'Fn::GetAtt': ['BroadcastApi', 'ApiId']
                    }
                },
                region: {
                    Value: {
                        Ref: 'AWS::Region'
                    }
                }
            }
        }
    }
}
