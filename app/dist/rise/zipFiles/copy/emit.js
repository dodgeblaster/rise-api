"use strict";
const { inputHelper } = require('./_inputHelper');
const AWS = require('aws-sdk');
var eventbridge = new AWS.EventBridge();
const emit = async (event, input) => {
    const params = {
        Entries: [
            {
                Detail: JSON.stringify(input),
                DetailType: event,
                EventBusName: process.env.BUS,
                Source: `custom.${process.env.DB}`,
                Time: new Date()
            }
        ]
    };
    await eventbridge.putEvents(params).promise();
};
const makeEmitCall = async (def, input) => {
    const data = def.input ? inputHelper(input, def.input) : input.working;
    await emit(def.event, data);
    return data;
};
module.exports = {
    makeEmitCall
};
