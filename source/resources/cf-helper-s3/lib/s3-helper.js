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

    /**
     * putFile
     * Saves a JSON config file to S3 location.
     * @param {JSON} content -  JSON object.
     * @param {JSON} destS3Bucket -  S3 destination bucket.
     * @param {JSON} destS3key -  S3 destination key.
     */
    putFile(content, destS3Bucket, destS3key) {
        console.log(`Attempting to save content blob destination location: ${destS3Bucket}/${destS3key}`);
        console.log(JSON.stringify(content));

        let _self = this;

        let _content = `'use strict';\n\nconst appVariables = {\n`;

        let i = 0;
        for (let key in content) {
            if (i > 0) {
                _content += ', \n';
            }
            _content += `${key}: '${content[key]}'`;
            i++;
        }
        _content += '\n};';

        let params = {
            Bucket: destS3Bucket,
            Key: destS3key,
            Body: _content
        };

        let s3 = new AWS.S3();

        return s3.putObject(params).promise().then((data) => {
            console.log(data);
            return data;
        }).catch((err) => {
            throw (err);
        });
    }

    copyAssets(sourceS3Bucket, sourceS3prefix, destS3Bucket) {
        console.log(`source bucket: ${sourceS3Bucket}`);
        console.log(`source prefix: ${sourceS3prefix}`);
        console.log(`destination bucket: ${destS3Bucket}`);

        let _self = this;

        let s3 = new AWS.S3();

        function _listAllFiles(allFiles, token, cb) {
            var opts = {
                Bucket: sourceS3Bucket,
                Prefix: sourceS3prefix
            };
            if (token) opts.ContinuationToken = token;

            s3.listObjectsV2(opts, function (err, data) {
                if (err) cb(err, null);
                else {
                    allFiles = allFiles.concat(data.Contents.map((e) => {
                        return e.Key.split(sourceS3prefix + '/').pop();
                    }));

                    if (data.IsTruncated)
                        _listAllFiles(allFiles, data.NextContinuationToken, cb);
                    else
                        cb(null, allFiles);
                }
            });
        }

        return new Promise((resolve, reject) => {

            _listAllFiles([], null, (err, files) => {

                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    _self._uploadFile(files, 0, destS3Bucket, `${sourceS3Bucket}/${sourceS3prefix}`).then((resp) => {
                        console.log(resp);
                        resolve(resp);
                    }).catch((err) => {
                        console.log(err);
                        reject(err);
                    });
                }

            });
        });
    }




    _uploadFile(filelist, index, destS3Bucket, sourceS3prefix) {
        let _self = this;
        return new Promise((resolve, reject) => {

            if (filelist.length > index) {
                let params = {
                    Bucket: destS3Bucket,
                    Key: filelist[index],
                    CopySource: [sourceS3prefix, filelist[index]].join('/'),
                    MetadataDirective: 'REPLACE'
                };

                params.ContentType = this._setContentType(filelist[index]);
                params.Metadata = {
                    'Content-Type': params.ContentType
                };
                console.log(params);
                let s3 = new AWS.S3();
                s3.copyObject(params, function (err, data) {
                    if (err) {
                        console.log(err);
                        reject(`error copying ${sourceS3prefix}/${filelist[index]}\n${err}`);
                    } else {
                        console.log(`${sourceS3prefix}/${filelist[index]} uploaded successfully`);
                        let _next = index + 1;
                        _self._uploadFile(filelist, _next, destS3Bucket, sourceS3prefix).then((resp) => {
                            resolve(resp);
                        }).catch((err2) => {
                            reject(err2);
                        });
                    }
                });
            } else {
                resolve(`${index} files copied`);
            }

        });

    }


    _setContentType(file) {
        let _contentType = 'binary/octet-stream';
        if (file.endsWith('.html')) {
            _contentType = 'text/html';
        } else if (file.endsWith('.css')) {
            _contentType = 'text/css';
        } else if (file.endsWith('.png')) {
            _contentType = 'image/png';
        } else if (file.endsWith('.svg')) {
            _contentType = 'image/svg+xml';
        } else if (file.endsWith('.jpg')) {
            _contentType = 'image/jpeg';
        } else if (file.endsWith('.js')) {
            _contentType = 'application/javascript';
        }

        return _contentType;
    }


}

module.exports = s3Helper;
