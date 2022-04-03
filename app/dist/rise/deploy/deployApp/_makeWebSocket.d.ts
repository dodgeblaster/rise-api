export declare function makeWebsocket(props: {
    appName: string;
    lambdaName: string;
    stage: string;
}): {
    Resources: {
        [x: string]: {
            Type: string;
            Properties: {
                Name: string;
                ProtocolType: string;
                RouteSelectionExpression: string;
                ApiId?: undefined;
                StageName?: undefined;
                Description?: undefined;
                DeploymentId?: undefined;
                Action?: undefined;
                Principal?: undefined;
                FunctionName?: undefined;
                RouteKey?: undefined;
                AuthorizationType?: undefined;
                OperationName?: undefined;
                Target?: undefined;
                IntegrationType?: undefined;
                IntegrationUri?: undefined;
            };
            DependsOn?: undefined;
        } | {
            Type: string;
            DependsOn: string[];
            Properties: {
                ApiId: {
                    Ref: string;
                };
                Name?: undefined;
                ProtocolType?: undefined;
                RouteSelectionExpression?: undefined;
                StageName?: undefined;
                Description?: undefined;
                DeploymentId?: undefined;
                Action?: undefined;
                Principal?: undefined;
                FunctionName?: undefined;
                RouteKey?: undefined;
                AuthorizationType?: undefined;
                OperationName?: undefined;
                Target?: undefined;
                IntegrationType?: undefined;
                IntegrationUri?: undefined;
            };
        } | {
            Type: string;
            Properties: {
                StageName: string;
                Description: string;
                ApiId: {
                    Ref: string;
                };
                DeploymentId: {
                    Ref: string;
                };
                Name?: undefined;
                ProtocolType?: undefined;
                RouteSelectionExpression?: undefined;
                Action?: undefined;
                Principal?: undefined;
                FunctionName?: undefined;
                RouteKey?: undefined;
                AuthorizationType?: undefined;
                OperationName?: undefined;
                Target?: undefined;
                IntegrationType?: undefined;
                IntegrationUri?: undefined;
            };
            DependsOn?: undefined;
        } | {
            Type: string;
            DependsOn: string[];
            Properties: {
                Action: string;
                Principal: string;
                FunctionName: {
                    'Fn::GetAtt': string[];
                };
                Name?: undefined;
                ProtocolType?: undefined;
                RouteSelectionExpression?: undefined;
                ApiId?: undefined;
                StageName?: undefined;
                Description?: undefined;
                DeploymentId?: undefined;
                RouteKey?: undefined;
                AuthorizationType?: undefined;
                OperationName?: undefined;
                Target?: undefined;
                IntegrationType?: undefined;
                IntegrationUri?: undefined;
            };
        } | {
            Type: string;
            Properties: {
                RouteKey: string;
                ApiId: {
                    Ref: string;
                };
                AuthorizationType: string;
                OperationName: string;
                Target: {
                    'Fn::Join': (string | (string | {
                        Ref: string;
                    })[])[];
                };
                Name?: undefined;
                ProtocolType?: undefined;
                RouteSelectionExpression?: undefined;
                StageName?: undefined;
                Description?: undefined;
                DeploymentId?: undefined;
                Action?: undefined;
                Principal?: undefined;
                FunctionName?: undefined;
                IntegrationType?: undefined;
                IntegrationUri?: undefined;
            };
            DependsOn?: undefined;
        } | {
            Type: string;
            Properties: {
                ApiId: {
                    Ref: string;
                };
                Description: string;
                IntegrationType: string;
                IntegrationUri: {
                    'Fn::Sub': string;
                };
                Name?: undefined;
                ProtocolType?: undefined;
                RouteSelectionExpression?: undefined;
                StageName?: undefined;
                DeploymentId?: undefined;
                Action?: undefined;
                Principal?: undefined;
                FunctionName?: undefined;
                RouteKey?: undefined;
                AuthorizationType?: undefined;
                OperationName?: undefined;
                Target?: undefined;
            };
            DependsOn: string[];
        };
        WebSocket: {
            Type: string;
            Properties: {
                Name: string;
                ProtocolType: string;
                RouteSelectionExpression: string;
            };
        };
        WebSocketDeployment: {
            Type: string;
            DependsOn: string[];
            Properties: {
                ApiId: {
                    Ref: string;
                };
            };
        };
        ConnectFunctionPermission: {
            Type: string;
            DependsOn: string[];
            Properties: {
                Action: string;
                Principal: string;
                FunctionName: {
                    'Fn::GetAtt': string[];
                };
            };
        };
        ConnectRoute: {
            Type: string;
            Properties: {
                RouteKey: string;
                ApiId: {
                    Ref: string;
                };
                AuthorizationType: string;
                OperationName: string;
                Target: {
                    'Fn::Join': (string | (string | {
                        Ref: string;
                    })[])[];
                };
            };
        };
        ConnectIntegration: {
            Type: string;
            Properties: {
                ApiId: {
                    Ref: string;
                };
                Description: string;
                IntegrationType: string;
                IntegrationUri: {
                    'Fn::Sub': string;
                };
            };
            DependsOn: string[];
        };
        DisconnectRoute: {
            Type: string;
            Properties: {
                RouteKey: string;
                ApiId: {
                    Ref: string;
                };
                AuthorizationType: string;
                OperationName: string;
                Target: {
                    'Fn::Join': (string | (string | {
                        Ref: string;
                    })[])[];
                };
            };
        };
        SendRoute: {
            Type: string;
            Properties: {
                RouteKey: string;
                ApiId: {
                    Ref: string;
                };
                AuthorizationType: string;
                OperationName: string;
                Target: {
                    'Fn::Join': (string | (string | {
                        Ref: string;
                    })[])[];
                };
            };
        };
        SendIntegration: {
            Type: string;
            Properties: {
                ApiId: {
                    Ref: string;
                };
                Description: string;
                IntegrationType: string;
                IntegrationUri: {
                    'Fn::Sub': string;
                };
            };
            DependsOn: string[];
        };
    };
    Outputs: {
        websocketUrl: {
            Value: {
                'Fn::Join': (string | (string | {
                    Ref: string;
                })[])[];
            };
        };
    };
};
