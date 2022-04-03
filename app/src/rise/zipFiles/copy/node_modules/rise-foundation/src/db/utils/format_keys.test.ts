import { formatKeys } from './format_keys'

test('format keys will return the same thing if no @id keyword is present ', () => {
    const res = formatKeys({
        pk: 'note',
        sk: 'note_1234'
    })

    expect(res).toEqual({ pk: 'note', sk: 'note_1234' })
})

test('format keys will replace @id with a unique id ', () => {
    const res = formatKeys({
        pk: 'note',
        sk: 'note_@id'
    })

    expect(res.pk).toBe('note')
    expect(res.sk).not.toBe('note_@id')
    expect(res.sk.startsWith('note_')).toBeTruthy()
})
