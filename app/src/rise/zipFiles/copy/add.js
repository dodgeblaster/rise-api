const { inputHelper } = require('./_inputHelper')

const addAction = (def, input) => {
    let x = def
    delete x.type
    const data = inputHelper(input, x)
    return data
}

module.exports = {
    addAction
}
