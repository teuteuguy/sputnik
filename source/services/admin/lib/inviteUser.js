const AWS = require('aws-sdk');
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
const _ = require('underscore');
const generatePassword = require('password-generator');
const setUserGroups = require('./setUserGroups');

const MAX_PASSWORD_LENGTH = 18;
const MIN_PASSWORD_LENGTH = 12;

const lib = 'inviteUser';

function inviteUser(name, email, groups) {

    const _password = _generatedSecurePassword();
    const _username = email.replace('@', '_').replace(/\./g, '_');

    const params = {
        UserPoolId: process.env.USER_POOL_ID,
        Username: _username,
        DesiredDeliveryMediums: ['EMAIL'],
        ForceAliasCreation: true,
        TemporaryPassword: _password,
        UserAttributes: [{
            Name: 'email',
            Value: email
        }, {
            Name: 'email_verified',
            Value: 'true'
        }, {
            Name: 'nickname',
            Value: name
        }]
    };

    return cognitoidentityserviceprovider.adminCreateUser(params).promise().then(data => {
        return setUserGroups(process.env.USER_POOL_ID, _username, groups).then(result => {
            return data;
        });
    });
}

module.exports = function (event, context) {
    return inviteUser(event.name, event.email, event.groups);
};

/**
 * Helper function to validate that a generated password is strong.
 * @param {string} password - Password to validate.
 */
function _isStrongEnough(password) {
    const uppercaseMinCount = 1;
    const lowercaseMinCount = 1;
    const numberMinCount = 2;
    const UPPERCASE_RE = /([A-Z])/g;
    const LOWERCASE_RE = /([a-z])/g;
    const NUMBER_RE = /([\d])/g;
    const NON_REPEATING_CHAR_RE = /([\w\d\?\-])\1{2,}/g;

    let uc = password.match(UPPERCASE_RE);
    let lc = password.match(LOWERCASE_RE);
    let n = password.match(NUMBER_RE);
    let nr = password.match(NON_REPEATING_CHAR_RE);
    return password.length >= this.MIN_PASSWORD_LENGTH &&
        !nr &&
        uc && uc.length >= uppercaseMinCount &&
        lc && lc.length >= lowercaseMinCount &&
        n && n.length >= numberMinCount;
};

/**
 * Helper function to generated a strong password.
 */
function _generatedSecurePassword() {
    var password = '';
    var randomLength = Math.floor(Math.random() * (MAX_PASSWORD_LENGTH - MIN_PASSWORD_LENGTH)) +
        MIN_PASSWORD_LENGTH;
    while (!_isStrongEnough(password)) {
        password = generatePassword(randomLength, false, /[\w\d\?\-]/);
    }

    return password;
};
