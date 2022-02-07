import cli from 'rise-cli-foundation'
const HIDDEN_FOLDER = '.rise'

export async function zipFiles(path?: string) {
    const projectPath = path || process.cwd()

    await cli.fileSystem.packageCode({
        location: __dirname + '/copy',
        target: projectPath + '/' + HIDDEN_FOLDER + '/lambdas',
        name: 'main'
    })
}
