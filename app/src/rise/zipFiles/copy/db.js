const { inputHelper } = require('./_inputHelper')
const r = require('./node_modules/rise-foundation')

const makeDbCall = async (def, input) => {
    const data = def.input ? inputHelper(input, def.input) : input.working

    if (def.action === 'set') {
        const x = await r.default.db.set(data, process.env.DB)
        return x
    }

    if (def.action === 'remove') {
        const x = await r.default.db.remove(data, process.env.DB)
        return x
    }

    if (def.action === 'get') {
        const x = await r.default.db.get(data, process.env.DB)
        return x
    }

    if (def.action === 'list') {
        const x = await r.default.db.list(data, process.env.DB)
        return x
    }

    throw new Error(`db action "${def.action}" is not supported`)

    return data
}

module.exports = {
    makeDbCall
}
