'use strict';

console.log('Loading function');

const AWS = require('aws-sdk');
const https = require('https');
const url = require('url');
const moment = require('moment');
const UsageMetrics = require('usage-metrics');
const UUID = require('uuid');

/**
 * Request handler.
 */
exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    const creds = new AWS.EnvironmentCredentials('AWS'); // Lambda provided credentials
    const dynamoConfig = {
        credentials: this.creds,
        region: process.env.AWS_REGION
    };
    const s3Config = {
        credentials: this.creds,
        region: process.env.AWS_REGION
    };

    let responseStatus = 'FAILED';
    let responseData = {};

    if (event.RequestType === 'Delete') {
        if (event.ResourceProperties.customAction === 'sendMetric') {
            responseStatus = 'SUCCESS';

            if (event.ResourceProperties.anonymousData === 'Yes') {
                let _metric = {
                    Solution: event.ResourceProperties.solutionId,
                    UUID: event.ResourceProperties.UUID,
                    TimeStamp: moment().utc().format('YYYY-MM-DD HH:mm:ss.S'),
                    Data: {
                        Version: event.ResourceProperties.version,
                        Deleted: moment().utc().format()
                    }
                };

                let _usageMetrics = new UsageMetrics();
                _usageMetrics.sendAnonymousMetric(_metric).then((data) => {
                    console.log(data);
                    console.log('Annonymous metrics successfully sent.');
                    sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
                }).catch((err) => {
                    responseData = {
                        Error: 'Sending anonymous delete metric failed'
                    };
                    console.log([responseData.Error, ':\n', err].join(''));
                    sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
                });
            } else {
                sendResponse(event, callback, context.logStreamName, 'SUCCESS');
            }

        } else {
            sendResponse(event, callback, context.logStreamName, 'SUCCESS');
        }
    }

    if (event.RequestType === 'Create') {
        if (event.ResourceProperties.customAction === 'saveGGBlueprints') {
            console.log(event.ResourceProperties.ddbItem);

            const S3 = new AWS.S3(s3Config);
            const docClient = new AWS.DynamoDB.DocumentClient(dynamoConfig);

            Promise.all(event.ResourceProperties.blueprints.map(blueprint => {
                return S3.getObject({
                    Bucket: event.ResourceProperties.s3Bucket,
                    Key: blueprint
                }).promise().then(response => {
                    let spec = JSON.parse(response.Body.toString('utf-8'));
                    let params = {
                        TableName: event.ResourceProperties.ddbTable,
                        Item: {
                            ggBlueprintId: spec.Metadata.ggBlueprintId,
                            name: spec.Metadata.name,
                            custom: false,
                            spec: spec,
                            createdBy: "_system_",
                            createdAt: moment().utc().format(),
                            updatedAt: moment().utc().format()
                        }
                    };

                    return docClient
                        .put(params)
                        .promise();
                }).catch(err => {
                    console.error(blueprint, err);
                    throw err;
                });
            })).then(results => {
                responseStatus = 'SUCCESS';
                responseData = null;
                console.log(results);
                sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
            }).catch(err => {
                responseData = {
                    Error: `Saving item to DyanmoDB table ${event.ResourceProperties.ddbTable} failed`
                };
                console.log([responseData.Error, ':\n', err].join(''));
                sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
            });

        } else {
            sendResponse(event, callback, context.logStreamName, 'SUCCESS');
        }
    }

    if (event.RequestType === 'Update') {
        console.log('NOT SUPPORTED YET');
        sendResponse(event, callback, context.logStreamName, 'SUCCESS');
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
