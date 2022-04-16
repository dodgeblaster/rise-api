import { Command } from '@oclif/core';
export default class Deploy extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        stage: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        region: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        code: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
    };
    run(): Promise<void>;
}
