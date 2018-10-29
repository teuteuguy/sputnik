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

let AWS = require('aws-sdk');
const fs = require('fs');
const moment = require('moment');

/**
 * Helper function to interact with AWS S3 for cfn custom resource.
 *
 * @class dynamodbHelper
 */
class dynamodbHelper {

    /**
     * @class dynamodbHelper
     * @constructor
     */
    constructor() {
        this.creds = new AWS.EnvironmentCredentials('AWS'); // Lambda provided credentials
    }

    dynamodbPutObjectsFromS3Folder(sourceS3Bucket, sourceS3prefix, table) {
        console.log(`source bucket: ${sourceS3Bucket}`);
        console.log(`source prefix: ${sourceS3prefix}`);
        console.log(`ddb table: ${table}`);

        const s3 = new AWS.S3();
        const documentClient = new AWS.DynamoDB.DocumentClient();

        let _self = this;

        function _listAllFiles(allFiles, token) {
            let opts = {
                Bucket: sourceS3Bucket,
                Prefix: sourceS3prefix
            };
            if (token) {
                opts.ContinuationToken = token;
            }

            return s3.listObjectsV2(opts).promise().then(data => {
                allFiles = allFiles.concat(data.Contents.map((e) => {
                    return e.Key.split(sourceS3prefix + '/').pop();
                }));
                if (data.IsTruncated) {
                    return _listAllFiles(allFiles, data.NextContinuationToken);
                } else
                    return allFiles;
            });
        }

        return _listAllFiles([], null).then(files => {
            console.log('Found:', JSON.stringify(files));

            return files.map(file => {
                return s3.getObject({
                    Bucket: sourceS3Bucket,
                    Key: sourceS3prefix + '/' + file
                }).promise().then(data => {
                    const object = JSON.parse(data.Body.toString('ascii'));
                    console.log(file, object);

                    object.createdAt = moment()
                        .utc()
                        .format();
                    object.updatedAt = moment()
                        .utc()
                        .format();

                    const params = {
                        TableName: table,
                        Item: object
                    };

                    return documentClient.put(params).promise();

                }).then(result => {
                    return {
                        file: file
                    };
                });
            });
        }).then(results => {
            return {
                result: results
            };
        });

    }

}

module.exports = dynamodbHelper;
