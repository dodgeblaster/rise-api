import { Command, Flags } from '@oclif/core'
import { deploy } from '../../rise/deployCommand'

export default class Deploy extends Command {
    static description = 'describe the command here'

    static examples = ['<%= config.bin %> <%= command.id %>']

    static flags = {
        stage: Flags.string({
            char: 's',
            description: 'Stage of deployment',
            required: false
        }),
        region: Flags.string({
            char: 'r',
            description: 'AWS Region',
            required: false
        }),
        code: Flags.string({
            char: 'c',
            description: 'Deploy code only',
            required: false
        })
    }

    public async run(): Promise<void> {
        const { flags } = await this.parse(Deploy)
        const stage = flags.stage || undefined
        const region = flags.region || undefined
        const code = flags.code || undefined

        deploy(stage, region, code)
    }
}
