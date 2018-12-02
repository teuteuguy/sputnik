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

/**
 * Helper function to interact with AWS S3 for cfn custom resource.
 *
 * @class s3Helper
 */
class s3Helper {

    /**
     * @class s3Helper
     * @constructor
     */
    constructor() {
        this.creds = new AWS.EnvironmentCredentials('AWS'); // Lambda provided credentials
    }

    copyFileFromS3ToS3(sourceS3Bucket, sourceS3Key, destS3Bucket, destS3Key) {
        console.log(`source bucket: ${sourceS3Bucket}`);
        console.log(`source key: ${sourceS3Key}`);
        console.log(`dest bucket: ${destS3Bucket}`);
        console.log(`dest key: ${destS3Key}`);


        const params = {
            Bucket: destS3Bucket,
            Key: destS3Key,
            CopySource: [sourceS3Bucket, sourceS3Key].join('/'),
            MetadataDirective: 'REPLACE'
        };

        // params.ContentType = this._setContentType(filelist[index]);
        // params.Metadata = {
        //     'Content-Type': params.ContentType
        // };
        // console.log(params);
        const s3 = new AWS.S3();

        return s3.copyObject(params).promise().then(data => {
            console.log(`${sourceS3Bucket}/${sourceS3Key} copied successfully`);
            return data;
        }).catch(err => {
            throw `error copying ${sourceS3Bucket}/${sourceS3Key}\n${err}`;
        });
    }

    listObjectsV2(params) {
        const s3 = new AWS.S3({ region: 'us-east-1'});

        console.log('listObjectsV2:', params);
        return s3.listObjectsV2(params).promise().then(data => {
            return data;
        });
    }

}

module.exports = s3Helper;
