'use strict';

console.log('Loading function');

const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const https = require('https');
const url = require('url');

const MTMThingGroups = require('./mtm-thing-groups');

/**
 * Request handler.
 */
exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    const mtmThingGroups = new MTMThingGroups();

    let responseStatus = 'FAILED';
    let responseData = {};

    // TODO: revisit this later. Wasting too much time on this for now.
    if (event.RequestType === 'Delete') {
        console.log('EVENT: DELETE');
        // mtmThingGroups.deleteALLThingGroups().then(results => {
        //     console.log(results);
            sendResponse(event, callback, context.logStreamName, 'SUCCESS');
        // }).catch(err => {
        //     console.error('ERROR', err);
        //     console.log([responseData.Error, ':\n', err].join(''));
        //     sendResponse(event, callback, context.logStreamName, 'SUCCESS');
        // });
    }

    if (event.RequestType === 'Update') {
        console.log('EVENT: UPDATE');
        // TODO: This needs to be implemented!
        // Need to go through all the childs and tree...
        sendResponse(event, callback, context.logStreamName, 'SUCCESS');
    }

    if (event.RequestType === 'Create') {
        if (event.ResourceProperties.customAction === 'init') {
            console.log('EVENT: CREATE init');
            mtmThingGroups.init().then(results => {
                console.log('init done successfully');
                responseStatus = 'SUCCESS';
                responseData = null;
                sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
            }).catch(err => {
                console.log('ERROR');
                responseData = {
                    Error: `Init of groups failed`
                };
                console.log([responseData.Error, ':\n', err].join(''));
                sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
            });
        } else {
            console.log('EVENT: CREATE');
            sendResponse(event, callback, context.logStreamName, 'SUCCESS');
        }
    }
};

/**
 * Sends a response to the pre-signed S3 URL
 */
let sendResponse = function (event, callback, logStreamName, responseStatus, responseData) {
    const responseBody = JSON.stringify({
        Status: responseStatus,
        Reason: `See the details in CloudWatch Log Stream: ${logStreamName}`,
        PhysicalResourceId: logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: responseData,
    });

    console.log('RESPONSE BODY:\n', responseBody);
    const parsedUrl = url.parse(event.ResponseURL);
    const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: 'PUT',
        headers: {
            'Content-Type': '',
            'Content-Length': responseBody.length,
        }
    };

    const req = https.request(options, (res) => {
        console.log('STATUS:', res.statusCode);
        console.log('HEADERS:', JSON.stringify(res.headers));
        callback(null, 'Successfully sent stack response!');
    });

    req.on('error', (err) => {
        console.log('sendResponse Error:\n', err);
        callback(err);
    });

    req.write(responseBody);
    req.end();
};
