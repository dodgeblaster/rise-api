import getUrl from './get_file_url'

test('getFileUrl will work', () => {
    const x = getUrl({
        bucket: 'mybucket',
        key: 'one/two.jpg'
    })

    expect(x).toBe('https://mybucket.s3.amazonaws.com/one/two.jpg')
})

test('getFileUrl will remove beginning / if key starts with it', () => {
    const x = getUrl({
        bucket: 'mybucket',
        key: '/one/two.jpg'
    })

    expect(x).toBe('https://mybucket.s3.amazonaws.com/one/two.jpg')
})
