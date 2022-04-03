export declare function makeBroadcast(name: string, channels: string[], auth: boolean): {
    Resources: any;
    Outputs: {
        broadcastUrl: {
            Value: {
                'Fn::GetAtt': string[];
            };
        };
        broadcastId: {
            Value: {
                'Fn::GetAtt': string[];
            };
        };
        region: {
            Value: {
                Ref: string;
            };
        };
        broadcastApiKey?: undefined;
    };
} | {
    Resources: any;
    Outputs: {
        broadcastUrl: {
            Value: {
                'Fn::GetAtt': string[];
            };
        };
        broadcastApiKey: {
            Value: {
                'Fn::GetAtt': string[];
            };
        };
        broadcastId: {
            Value: {
                'Fn::GetAtt': string[];
            };
        };
        region: {
            Value: {
                Ref: string;
            };
        };
    };
};
