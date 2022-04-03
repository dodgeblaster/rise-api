import getFile from './get_file'
import uploadFile from './upload_file'
import removeFile from './remove_file'
import * as fs from 'fs'

test('s3 functions can upload, get, and remove a file in a bucket', async () => {
    /**
     * Upload File
     */
    const file = fs.readFileSync(
        process.cwd() + '/src/s3/_test/test_s3_img.zip'
    )

    const x = await uploadFile({
        file: file,
        bucket: 'rise-foundation-integration-test-bucket',
        key: '/pics/mypic.zip'
    })

    expect(typeof x.etag).toBe('string')

    /**
     * Get File
     */
    const getResult = await getFile({
        bucket: 'rise-foundation-integration-test-bucket',
        key: '/pics/mypic.zip'
    })

    expect(typeof getResult.body).toBe('object')

    /**
     * Remove File
     *
     */
    const removeResult = await removeFile({
        bucket: 'rise-foundation-integration-test-bucket',
        key: '/pics/mypic.zip'
    })
    expect(removeResult).toEqual(true)
})
