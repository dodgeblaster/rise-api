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
    deployCodeOnly: string | undefined;
}
export declare function deployCfTemplate({ appName, bucketArn, stage, auth, eventBus, events, region, deployCodeOnly }: Input): Promise<void>;
export {};
