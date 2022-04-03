"use strict";
const { inputHelper } = require('./_inputHelper');
const r = require('./node_modules/rise-foundation');
const AWS = require('aws-sdk');
const crypto = require('crypto');
const byteToHex = [];
for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).substr(1));
}
function bytesToUuid(buf, offset_) {
    const offset = offset_ || 0;
    return (byteToHex[buf[offset + 0]] +
        byteToHex[buf[offset + 1]] +
        byteToHex[buf[offset + 2]] +
        byteToHex[buf[offset + 3]] +
        '-' +
        byteToHex[buf[offset + 4]] +
        byteToHex[buf[offset + 5]] +
        '-' +
        byteToHex[buf[offset + 6]] +
        byteToHex[buf[offset + 7]] +
        '-' +
        byteToHex[buf[offset + 8]] +
        byteToHex[buf[offset + 9]] +
        '-' +
        byteToHex[buf[offset + 10]] +
        byteToHex[buf[offset + 11]] +
        byteToHex[buf[offset + 12]] +
        byteToHex[buf[offset + 13]] +
        byteToHex[buf[offset + 14]] +
        byteToHex[buf[offset + 15]]).toLowerCase();
}
function rng() {
    const rnds8 = new Uint8Array(16);
    return crypto.randomFillSync(rnds8);
}
/** Generates a uuid */
function uuid() {
    const rnds = rng();
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;
    return bytesToUuid(rnds, undefined);
}
const cognito = new AWS.CognitoIdentityServiceProvider({
    region: process.env.REGION || 'us-east-1'
});
function makePassword() {
    const id = uuid().split('-').join('').slice(0, 10);
    const addCharacter = (x, char) => {
        const i = Math.floor(Math.random() * 10) + 1;
        const arr = x.split('');
        arr.splice(i, 0, char);
        return arr.join('');
    };
    const withUppercaseLetter = addCharacter(id, 'C');
    const withSpecialCharacter = addCharacter(withUppercaseLetter, '!');
    return withSpecialCharacter;
}
async function createUser(props) {
    if (!props.email) {
        throw new Error('CreateUser must have an email defined');
    }
    if (!process.env.USERPOOL_ID && !props.userPoolId) {
        throw new Error('CreateUser must have process.env.USERPOOL_ID defined');
    }
    const pass = makePassword();
    const params = {
        UserPoolId: props.userPoolId || process.env.USERPOOL_ID || '',
        Username: props.email,
        TemporaryPassword: pass,
        MessageAction: 'SUPPRESS',
        UserAttributes: [
            {
                Name: 'name',
                Value: props.email
            },
            {
                Name: 'email',
                Value: props.email
            },
            {
                Name: 'email_verified',
                Value: 'True'
            }
        ]
    };
    try {
        const result = await cognito.adminCreateUser(params).promise();
        return {
            email: props.email,
            password: pass,
            userId: result.User.Attributes.filter((x) => x.Name === 'sub')[0]
                .Value
        };
    }
    catch (err) {
        throw new Error(err);
    }
}
//USERPOOL_ID
const makeCognitoCall = async (def, input) => {
    if (def.action === 'add') {
        let x = def;
        delete x.type;
        delete x.action;
        const data = inputHelper(input, x);
        try {
            const res = await createUser({
                email: data.email
            });
            return res;
        }
        catch (e) {
            if (e.message.includes('UsernameExistsException')) {
                throw new Error(`User already exists with email: ${data.email}`);
            }
            else {
                throw new Error(e);
            }
        }
    }
    if (def.action === 'remove') {
        let x = def;
        delete x.type;
        delete x.action;
        const data = inputHelper(input, x);
        try {
            const res = await r.default.cognito.removeUser({
                email: data.email
            });
            return res;
        }
        catch (e) {
            if (e.message.includes('UserNotFoundException')) {
                throw new Error(`User with email: ${data.email} does not exist`);
            }
            else {
                throw new Error(e);
            }
        }
    }
    return data;
};
module.exports = {
    makeCognitoCall
};
