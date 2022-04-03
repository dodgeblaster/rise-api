interface EventInput {
    appName: string;
    eventBus: string | false;
    eventSource: string;
    eventName: string;
    lambdaName: string;
}
export declare function makeEventRule({ appName, eventBus, eventSource, eventName, lambdaName }: EventInput): {
    Resources: {
        [x: string]: {
            Type: string;
            Properties: {
                EventBusName: string | false;
                EventPattern: {
                    source: string[];
                    'detail-type': string[];
                };
                Targets: {
                    Arn: {
                        'Fn::GetAtt': string[];
                    };
                    Id: string;
                }[];
                FunctionName?: undefined;
                Action?: undefined;
                Principal?: undefined;
                SourceArn?: undefined;
            };
        } | {
            Type: string;
            Properties: {
                FunctionName: {
                    'Fn::GetAtt': string[];
                };
                Action: string;
                Principal: string;
                SourceArn: {
                    'Fn::GetAtt': string[];
                };
                EventBusName?: undefined;
                EventPattern?: undefined;
                Targets?: undefined;
            };
        };
    };
    Outputs: {};
};
export {};
