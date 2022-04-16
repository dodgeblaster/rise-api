"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const deployCommand_1 = require("../../rise/deployCommand");
class Deploy extends core_1.Command {
    async run() {
        const { flags } = await this.parse(Deploy);
        const stage = flags.stage || undefined;
        const region = flags.region || undefined;
        const code = flags.code || undefined;
        deployCommand_1.deploy(stage, region, code);
    }
}
exports.default = Deploy;
Deploy.description = 'describe the command here';
Deploy.examples = ['<%= config.bin %> <%= command.id %>'];
Deploy.flags = {
    stage: core_1.Flags.string({
        char: 's',
        description: 'Stage of deployment',
        required: false
    }),
    region: core_1.Flags.string({
        char: 'r',
        description: 'AWS Region',
        required: false
    }),
    code: core_1.Flags.string({
        char: 'c',
        description: 'Deploy code only',
        required: false
    })
};
