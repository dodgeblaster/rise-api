"use strict";
/**
 * Check Output Structure
 *
 */
const validateAndFilterItem = (x, input) => {
    let toReturn = {};
    Object.keys(input).forEach((k) => {
        const value = input[k];
        // ARRAY
        if (x[k] === 'array') {
            if (!Array.isArray(value)) {
                const message = `Output mismatch. ${k}: ${input[k]} is not an array`;
                throw new Error(message);
            }
            toReturn[k] = value;
        }
        // ITEM
        else {
            const typeOfValue = typeof value;
            const structureType = x[k];
            if (structureType !== undefined) {
                if (typeOfValue !== structureType) {
                    const message = `Output mismatch. ${k}: ${input[k]} is not a ${x[k]}`;
                    throw new Error(message);
                }
                toReturn[k] = value;
            }
        }
    });
    return toReturn;
};
const checkOutputStructure = (def, input) => {
    let x = def;
    delete x.type;
    if (input.list) {
        input = input.list;
        let res = [];
        input.forEach((item) => {
            const filteredItem = validateAndFilterItem(x, item);
            res.push(filteredItem);
        });
        return res;
    }
    if (input.item) {
        input = input.item;
        return validateAndFilterItem(x, input);
    }
    return validateAndFilterItem(x, input);
};
module.exports = {
    checkOutputStructure
};
