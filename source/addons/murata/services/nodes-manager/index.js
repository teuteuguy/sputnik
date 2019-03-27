const AWS = require('aws-sdk');

function handler(event, context, callback) {

    console.log('Event:', JSON.stringify(event, null, 2));
    callback(null, 'SUCCESS');
}

exports.handler = handler;
