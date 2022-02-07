/**
 * Check Output Structure
 *
 */
const checkOutputStructure = (def, input) => {
    let x = def
    delete x.type

    let toReturn = {}
    Object.keys(input).forEach((k) => {
        const value = input[k]

        // ARRAY
        if (x[k] === 'array') {
            if (!Array.isArray(value)) {
                const message = `Output mismatch. ${k}: ${input[k]} is not an array`
                throw new Error(message)
            }

            toReturn[k] = value
        }

        // IITEM
        else {
            const typeOfValue = typeof value
            const structureType = x[k]
            if (structureType !== undefined) {
                if (typeOfValue !== structureType) {
                    const message = `Output mismatch. ${k}: ${input[k]} is not a ${x[k]}`
                    throw new Error(message)
                }
                toReturn[k] = value
            }
        }
    })
    return toReturn
}

module.exports = {
    checkOutputStructure
}
