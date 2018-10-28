/*********************************************************************************************************************
 *  Copyright 2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                           *
 *                                                                                                                    *
 *  Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance        *
 *  with the License. A copy of the License is located at                                                             *
 *                                                                                                                    *
 *      http://aws.amazon.com/asl/                                                                                    *
 *                                                                                                                    *
 *  or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES *
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
 *  and limitations under the License.                                                                                *
 *********************************************************************************************************************/

'use strict';

console.log('Loading function');

const https = require('https');
const url = require('url');

const DDBHelper = require('./lib/dynamodb-helper');


/**
 * Request handler.
 */
exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    const ddbHelper = new DDBHelper();

    let responseStatus = 'FAILED';
    let responseData = {};

    if (event.RequestType === 'Delete') {
        sendResponse(event, callback, context.logStreamName, 'SUCCESS');
    }

    if (event.RequestType === 'Create' || event.RequestType === 'Update') {
        if (event.ResourceProperties.customAction === 'dynamodbPutObjectsFromS3Folder') {
            ddbHelper.dynamodbPutObjectsFromS3Folder(event.ResourceProperties.sourceS3Bucket, event.ResourceProperties.sourceS3Key, event.ResourceProperties.table).then(data => {
                responseStatus = 'SUCCESS';
                responseData = data;
                sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
            }).catch((err) => {
                responseData = {
                    Error: `dynamodbPutObjectsFromS3Folder failed`
                };
                console.log([responseData.Error, ':\n', err].join(''));
                sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
            });

        }
        else {
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
