/**
 * Check Output Structure
 *
 */
const checkInputStructure = (def, input) => {
    let x = def
    delete x.type

    let checked = {}

    Object.keys(input).forEach((k) => {
        const value = input[k]
        const typeOfValue = typeof value
        const structureType = x[k]

        if (structureType === undefined) {
            const message = `"${k}" is not part of the input schema`
            throw new Error(message)
        }

        if (typeOfValue !== structureType) {
            const message = `Input mismatch. ${k}: ${input[k]} is not a ${x[k]}`
            throw new Error(message)
        }
        checked[k] = true
    })

    Object.keys(def).forEach((k) => {
        if (!checked[k]) {
            const message = `"${k}" must be included in the input`
            throw new Error(message)
        }
    })

    return input
}

module.exports = {
    checkInputStructure
}
