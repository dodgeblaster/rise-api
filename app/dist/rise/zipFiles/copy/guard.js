"use strict";
const r = require('./node_modules/rise-foundation');
const { inputHelper } = require('./_inputHelper');
const guardAction = async (def, input) => {
    let x = def;
    delete x.type;
    const data = inputHelper(input, x);
    const res = await r.default.db.get(data, process.env.DB);
    if (!res) {
        throw new Error('Unauthorized');
    }
    return input.working;
};
module.exports = {
    guardAction
};
