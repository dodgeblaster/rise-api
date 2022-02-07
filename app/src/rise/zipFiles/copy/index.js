module.exports = {
    makenote: [
        {
            type: 'input',
            structure: {
                title: 'string',
                content: 'string'
            }
        },
        {
            type: 'add',
            id: '@id'
        },
        {
            type: 'db',
            action: 'set'
        },
        {
            type: 'output',
            structure: {
                id: 'string',
                title: 'string',
                content: 'string'
            }
        }
    ]
}
