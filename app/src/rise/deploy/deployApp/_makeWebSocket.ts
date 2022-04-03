export function makeWebsocket(props: {appName: string,lambdaName: string, stage: string}) {
    return {
        Resources: {    
            "WebSocket": {
                "Type": "AWS::ApiGatewayV2::Api",
                "Properties": {
                    "Name": props.appName + " Websocket",
                    "ProtocolType": "WEBSOCKET",
                    "RouteSelectionExpression": "$request.body.action"
                }
            },
            "WebSocketDeployment": {
                "Type": "AWS::ApiGatewayV2::Deployment",
                "DependsOn": [
                    "ConnectRoute"
                ],
                "Properties": {
                    "ApiId": { 
                        Ref: 'WebSocket'
                    },
                }
            },
            ["WebSocketStage" + props.stage]: {
                "Type": "AWS::ApiGatewayV2::Stage",
                "Properties": {
                    "StageName": props.stage,
                    "Description": props.stage + " Stage",
                    "ApiId": { 
                        Ref: 'WebSocket'  
                    },
                    "DeploymentId": { 
                        Ref: 'WebSocketDeployment'  
                    },
                }
            },
            "ConnectFunctionPermission": {
                "Type": "AWS::Lambda::Permission",
                "DependsOn": [
                    "WebSocket"
                  
                ],
                "Properties": {
                    "Action": "lambda:InvokeFunction",
                    "Principal": "apigateway.amazonaws.com",
                    "FunctionName": {
                        'Fn::GetAtt': [props.lambdaName, 'Arn']
                    },
                }
            },
            "ConnectRoute": {
                "Type": "AWS::ApiGatewayV2::Route",
                "Properties": {
                    "RouteKey": "$connect",
                    "ApiId": { 
                        Ref: 'WebSocket'  
                    },
                    "AuthorizationType": "NONE",
                    "OperationName": "ConnectRoute",
                    "Target": {
                        'Fn::Join': [
                            '/',
                            [
                                'integrations',
                                {
                                    Ref: 'ConnectIntegration'
                                },
                                
                            ]
                        ]
                    }
                }
            },
            "ConnectIntegration": {
                "Type": "AWS::ApiGatewayV2::Integration",
                "Properties": {
                    "ApiId": { 
                        Ref: 'WebSocket'  
                    },
                    "Description": "TO DO",
                    "IntegrationType": "AWS_PROXY",
                    "IntegrationUri": { 
                        'Fn::Sub': `arn:aws:apigateway:\${AWS::Region}:lambda:path/2015-03-31/functions/\${${props.lambdaName}.Arn}/invocations`  
                    },
                },
                DependsOn: [props.lambdaName]
            },
            "DisconnectRoute": {
                "Type": "AWS::ApiGatewayV2::Route",
                "Properties": {
                    "RouteKey": "$disconnect",
                    "ApiId": { 
                        Ref: 'WebSocket'  
                    },
                    "AuthorizationType": "NONE",
                    "OperationName": "ConnectRoute",
                    "Target": {
                        'Fn::Join': [
                            '/',
                            [
                                'integrations',
                                {
                                    Ref: 'ConnectIntegration'
                                },
                                
                            ]
                        ]
                    }
                }
            },
         
            "SendRoute": {
                "Type": "AWS::ApiGatewayV2::Route",
                "Properties": {
                    "RouteKey": "sendMessage",
                    "ApiId": { 
                        Ref: 'WebSocket'  
                    },
                    "AuthorizationType": "NONE",
                    "OperationName": "SendRoute",
                    "Target": {
                        'Fn::Join': [
                            '/',
                            [
                                'integrations',
                                {
                                    Ref: 'SendIntegration'
                                },
                                
                            ]
                        ]
                    }
                }
            },
            "SendIntegration": {
                "Type": "AWS::ApiGatewayV2::Integration",
                "Properties": {
                    "ApiId": { 
                        Ref: 'WebSocket'  
                    },
                    "Description": "TO DO",
                    "IntegrationType": "AWS_PROXY",
                    "IntegrationUri": { 
                        'Fn::Sub': `arn:aws:apigateway:\${AWS::Region}:lambda:path/2015-03-31/functions/\${${props.lambdaName}.Arn}/invocations` 
                    },
                },
                DependsOn: [props.lambdaName]
            }
  
        },

        Outputs: {
            websocketUrl: {
                    Value: {
                        'Fn::Join': [
                            '',
                            [
                                'wss://',
                                {
                                    Ref: 'WebSocket'
                                },
                                '.execute-api.',
                                {
                                     Ref: 'AWS::Region'
                                },
                                '.amazonaws.com/',
                                props.stage
                                
                            ]
                        ]                   
                    }
                },
        }
    }
}