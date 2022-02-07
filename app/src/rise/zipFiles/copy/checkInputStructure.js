/**
 * Check Output Structure
 *
 */
const checkInputStructure = (def, input) => {
    let x = def
    delete x.type

    Object.keys(input).forEach((k) => {
        const value = input[k]
        const typeOfValue = typeof value
        const structureType = x[k]

        if (structureType === undefined) {
            const message = `Input mismatch. ${k} is not defined as part of the input structure`
            throw new Error(message)
        }

        if (typeOfValue !== structureType) {
            const message = `Input mismatch. ${k}: ${input[k]} is not a ${x[k]}`
            throw new Error(message)
        }
    })
    return input
}

module.exports = {
    checkInputStructure
}
