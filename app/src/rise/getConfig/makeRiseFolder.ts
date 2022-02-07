import cli from 'rise-cli-foundation'
const HIDDEN_FOLDER = '.rise'

export async function makeRiseFolder(path?: string) {
    const projectPath = path || process.cwd()

    /**
     * Create rise folder
     */
    const projectFolder = cli.fileSystem.getDirectories(projectPath)
    if (!projectFolder.includes(HIDDEN_FOLDER)) {
        await cli.fileSystem.makeDir(projectPath + '/' + HIDDEN_FOLDER)
    }

    /**
     * Create lambda folder
     */
    const riseFolder = cli.fileSystem.getDirectories(
        projectPath + '/' + HIDDEN_FOLDER
    )
    if (!riseFolder.includes('lambdas')) {
        await cli.fileSystem.makeDir(
            projectPath + '/' + HIDDEN_FOLDER + '/lambdas'
        )
    }
}
