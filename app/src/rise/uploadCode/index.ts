import cli from 'rise-cli-foundation'
import foundation from 'rise-foundation'
const HIDDEN_FOLDER = '.rise'

export async function uploadLambda(bucketName: string, path?: string) {
    const pathDir = path || process.cwd()

    const file = await cli.fileSystem.getFile(
        pathDir + '/' + HIDDEN_FOLDER + '/lambdas/main.zip'
    )

    await foundation.s3.uploadFile({
        file: file,
        bucket: bucketName,
        key: 'main.zip'
    })
}
