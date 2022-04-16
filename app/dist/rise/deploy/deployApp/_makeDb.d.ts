export declare function makeDb(name: string, outputSuffix: string): {
    Resources: {
        [x: string]: {
            Type: string;
            Properties: {
                TableName: string;
                AttributeDefinitions: {
                    AttributeName: string;
                    AttributeType: string;
                }[];
                KeySchema: {
                    AttributeName: string;
                    KeyType: string;
                }[];
                GlobalSecondaryIndexes: {
                    IndexName: string;
                    KeySchema: {
                        AttributeName: string;
                        KeyType: string;
                    }[];
                    Projection: {
                        ProjectionType: string;
                    };
                }[];
                BillingMode: string;
            };
        };
    };
    Outputs: {
        [x: string]: {
            Description: string;
            Value: string;
        };
    };
};
