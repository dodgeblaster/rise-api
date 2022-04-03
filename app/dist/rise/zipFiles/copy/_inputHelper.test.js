"use strict";
const { inputHelper } = require('./_inputHelper');
test('@id works', () => {
    const state = {
        working: {},
        input: {
            color: 'blue'
        },
        auth: {
            id: 'none'
        }
    };
    const input = {
        id: '@id',
        userId: '!id',
        title: 'note_{$color}_{!id}'
    };
    const res = inputHelper(state, input);
});
