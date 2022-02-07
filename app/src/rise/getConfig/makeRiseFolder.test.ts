import { makeRiseFolder } from './makeRiseFolder'
import cli from 'rise-cli-foundation'

test('can make rise folders', async () => {
    const current = await cli.fileSystem.getDirectories(
        process.cwd() + '/src/rise/getConfig/test/'
    )

    if (!current.includes('makeFolderTest')) {
        await cli.fileSystem.makeDir(
            process.cwd() + '/src/rise/getConfig/test/makeFolderTest'
        )
    }

    const path = process.cwd() + '/src/rise/getConfig/test/makeFolderTest'
    await makeRiseFolder(path)

    // .rise is made
    const projectFolders = await cli.fileSystem.getDirectories(path)
    expect(projectFolders).toEqual(['.rise'])

    // .rise/lambdas is made
    const riseFolders = await cli.fileSystem.getDirectories(path + '/.rise')
    expect(riseFolders).toEqual(['lambdas'])
})
