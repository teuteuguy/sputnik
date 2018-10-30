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
 *
 * @class iotHelper
 */
class iotHelper {

    /**
     * @class iotHelper
     * @constructor
     */
    constructor() {
        this.creds = new AWS.EnvironmentCredentials('AWS'); // Lambda provided credentials
    }

    describeEndpoint() {
        const iot = new AWS.Iot();
        return iot.describeEndpoint().promise().then(data => {
            console.log('Returned endpoint', data);
            return data;
        });
    }

    attachPrincipalPolicy(policyName, principal) {
        const iot = new AWS.Iot();
        return iot.attachPrincipalPolicy({
            policyName: policyName,
            principal: principal
        }).promise().then(data => {
            console.log('attachPrincipalPolicy successful for', policyName, principal, data);
            return true;
        }).catch(err => {
            console.error(err);
            return false;
        });
    }
}

module.exports = iotHelper;
