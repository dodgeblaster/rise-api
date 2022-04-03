export declare function makeLambdaeEndpoint(props: any): {
    Resources: {
        ApiGatewayRestApi: {
            Type: string;
            Properties: {
                Name: any;
                EndpointConfiguration: {
                    Types: string[];
                };
                Policy: string;
            };
        };
        ApiGatewayResource: {
            Type: string;
            Properties: {
                ParentId: {
                    'Fn::GetAtt': string[];
                };
                PathPart: any;
                RestApiId: {
                    Ref: string;
                };
            };
        };
        OptionsMethod: {
            Type: string;
            Properties: {
                AuthorizationType: string;
                RestApiId: {
                    Ref: string;
                };
                ResourceId: {
                    Ref: string;
                };
                HttpMethod: string;
                Integration: {
                    IntegrationResponses: {
                        StatusCode: number;
                        ResponseParameters: {
                            'method.response.header.Access-Control-Allow-Origin': string;
                            'method.response.header.Access-Control-Allow-Headers': string;
                            'method.response.header.Access-Control-Allow-Methods': string;
                            'method.response.header.Access-Control-Allow-Credentials': string;
                        };
                        ResponseTemplates: {
                            'application/json': string;
                        };
                    }[];
                    PassthroughBehavior: string;
                    RequestTemplates: {
                        'application/json': string;
                    };
                    Type: string;
                };
                MethodResponses: {
                    StatusCode: string;
                    ResponseParameters: {
                        'method.response.header.Access-Control-Allow-Origin': boolean;
                        'method.response.header.Access-Control-Allow-Headers': boolean;
                        'method.response.header.Access-Control-Allow-Methods': boolean;
                        'method.response.header.Access-Control-Allow-Credentials': boolean;
                    };
                    ResponseModels: {};
                }[];
            };
        };
        ApiGatewayMethodPost: {
            Type: string;
            Properties: {
                Integration: {
                    IntegrationHttpMethod: string;
                    Type: string;
                    Uri: {
                        'Fn::Join': (string | (string | {
                            Ref: string;
                            'Fn::GetAtt'?: undefined;
                        } | {
                            'Fn::GetAtt': any[];
                            Ref?: undefined;
                        })[])[];
                    };
                };
                MethodResponses: never[];
                AuthorizationType: string;
                AuthorizerId: {
                    Ref: string;
                };
                HttpMethod: string;
                RequestParameters: {};
                ResourceId: {
                    Ref: string;
                };
                RestApiId: {
                    Ref: string;
                };
                ApiKeyRequired: boolean;
            } | {
                Integration: {
                    IntegrationHttpMethod: string;
                    Type: string;
                    Uri: {
                        'Fn::Join': (string | (string | {
                            Ref: string;
                            'Fn::GetAtt'?: undefined;
                        } | {
                            'Fn::GetAtt': any[];
                            Ref?: undefined;
                        })[])[];
                    };
                };
                MethodResponses: never[];
                AuthorizationType: string;
                HttpMethod: string;
                RequestParameters: {};
                ResourceId: {
                    Ref: string;
                };
                RestApiId: {
                    Ref: string;
                };
                ApiKeyRequired: boolean;
            };
        };
        ApiGatewayDeployment: {
            Type: string;
            Properties: {
                RestApiId: {
                    Ref: string;
                };
                StageName: any;
            };
            DependsOn: string[];
        };
        MainLambdaPermissionApiGateway: {
            Type: string;
            Properties: {
                FunctionName: {
                    'Fn::GetAtt': any[];
                };
                Action: string;
                Principal: string;
                SourceArn: {
                    'Fn::Join': (string | (string | {
                        Ref: string;
                    })[])[];
                };
            };
        };
    };
    Outputs: {
        Endpoint: {
            Description: string;
            Value: {
                'Fn::Join': (string | (string | {
                    Ref: string;
                })[])[];
            };
        };
    };
};
