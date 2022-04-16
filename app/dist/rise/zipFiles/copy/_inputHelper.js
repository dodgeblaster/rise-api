const AWS = require('aws-sdk')

/**
 * Handle Single Value
 *
 */
const handleSingleValue = (state, value) => {
    if (value.startsWith('@id')) {
        return AWS.util.uuid.v4()
    }

    if (value.startsWith('@now')) {
        return Date.now()
    }

    if (value.startsWith('@today')) {
        const today = new Date()
        const dd = String(today.getDate()).padStart(2, '0')
        const mm = String(today.getMonth() + 1).padStart(2, '0')
        const yyyy = today.getFullYear()
        return `${yyyy}-${mm}-${dd}`
    }

    if (value.startsWith('$')) {
        value = value.replace('$', '')
        return state.working[value]
    }

    if (value.startsWith('!')) {
        value = value.replace('!', '')
        return state.auth[value]
    }

    return value
}

/**
 * Is Multiple
 *
 */
const isMultiple = (value) => value.includes('{') && value.includes('}')

/**
 * Handle Multiple Value
 *
 */
const parseValue = (state, v) => {
    let value = v

    if (value.includes('{') && value.includes('}')) {
        let stringToUse = ''
        let replaceText = []
        let replaceIndex = -1

        let replace = false
        value.split('').forEach((ch, i, l) => {
            if (l[i] === '{') {
                replaceIndex++
                replace = true
            } else if (l[i] === '}') {
                replace = false
            } else {
                stringToUse = stringToUse + ch
                if (replace) {
                    if (!replaceText[replaceIndex]) {
                        replaceText[replaceIndex] = ch
                    } else {
                        replaceText[replaceIndex] =
                            replaceText[replaceIndex] + ch
                    }
                }
            }
        })

        replaceText.forEach((value) => {
            const x = handleSingleValue(state, value)
            stringToUse = stringToUse.replace(value, x)
        })
        value = stringToUse
    }

    return value
}

const inputHelper = (state, input) => {
    let d = {}

    Object.keys(input).forEach((k) => {
        const value = input[k]
        if (isMultiple(value)) {
            d[k] = parseValue(state, value)
        } else {
            d[k] = handleSingleValue(state, value)
        }
    })
    return d
}

module.exports = {
    inputHelper
}
