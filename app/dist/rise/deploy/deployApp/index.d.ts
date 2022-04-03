interface Input {
    appName: string;
    bucketArn: string;
    stage: string;
    region: string;
    auth: boolean;
    eventBus: string | false;
    events: {
        source: string;
        event: string;
    }[];
}
export declare function deployCfTemplate({ appName, bucketArn, stage, auth, eventBus, events, region }: Input): Promise<void>;
export {};
