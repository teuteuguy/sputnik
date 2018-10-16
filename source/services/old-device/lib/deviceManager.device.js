/*********************************************************************************************************************
 *  Copyright 2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                           *
 *                                                                                                                    *
 *  Licensed under the Amazon Software License (the 'License'). You may not use this file except in compliance        *
 *  with the License. A copy of the License is located at                                                             *
 *                                                                                                                    *
 *      http://aws.amazon.com/asl/                                                                                    *
 *                                                                                                                    *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES *
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
 *  and limitations under the License.                                                                                *
 *********************************************************************************************************************/

/**
 * @author Solution Builders
 */

'use strict';

const Logger = require('logger');
const moment = require('moment');
const AWS = require('aws-sdk');
const _ = require('underscore');
const uuid = require('uuid');
const randomstring = require('randomstring');
const DeviceTypeManager = require('./deviceTypeManager.device.js');


/**
 * Performs crud actions for a device, such as, creating, retrieving, updating and deleting devices.
 *
 * @class DeviceManager
 */
class DeviceManager {

    /**
     * @class DeviceManager
     * @constructor
     */
    constructor() {
        this.creds = new AWS.EnvironmentCredentials('AWS'); // Lambda provided credentials
        this.dynamoConfig = {
            credentials: this.creds,
            region: process.env.AWS_REGION
        };
    }

    /**
     * Get devices for the user.
     * @param {JSON} ticket - authorization ticket.
     */
    getDevices(ticket, category, page) {
        const _self = this;
        return new Promise((resolve, reject) => {

            let _page = parseInt(page);
            if (isNaN(_page)) {
                _page = 0;
            }

            _self._getDevicePage(ticket, category, null, 0, _page).then((devices) => {
                resolve(devices);
            }).catch((err) => {
                Logger.error(Logger.levels.INFO, err);
                Logger.error(Logger.levels.INFO, `Error occurred while attempting to retrieve devices for user ${ticket.userid}.`);
                reject({
                    code: 500,
                    error: 'DeviceRetrievalFailure',
                    message: err
                });
            });

        });
    }

    /**
     * Retrieves a user's device widget statistics.
     * @param {JSON} ticket - authentication ticket
     */
    getDeviceStats(ticket, category) {
        const _self = this;
        return new Promise((resolve, reject) => {
            _self._getDeviceStats(ticket, category, null).then((data) => {
                data.total = data.provisioning + data.provisioned + data.deployed;
                resolve(data);
            }).catch((err) => {
                Logger.error(Logger.levels.INFO, err);
                Logger.error(Logger.levels.INFO, `Error occurred while attempting to retrieve device stats for user ${ticket.userid}.`);
                reject({
                    code: 500,
                    error: 'DeviceStatsRetrievalFailure',
                    message: err
                });
            });
        });
    }

    /**
     * Retrieves a device for user.
     * @param {JSON} ticket - authentication ticket
     * @param {string} deviceId - id of device to retrieve
     */
    getDevice(ticket, deviceId) {

        const _self = this;
        return new Promise((resolve, reject) => {

            if (ticket.isAdmin) {

                let params = {
                    TableName: process.env.DEVICES_TBL,
                    IndexName: 'thingId',
                    KeyConditionExpression: 'id = :thingId',
                    ExpressionAttributeValues: {
                        ':thingId': deviceId
                    }
                };

                let docClient = new AWS.DynamoDB.DocumentClient(_self.dynamoConfig);

                docClient.query(params, function (err, data) {
                    if (err) {
                        Logger.error(Logger.levels.INFO, err);
                        return reject({
                            code: 500,
                            error: 'DeviceRetrieveFailure',
                            message: `Error occurred while attempting to retrieve device ${deviceId} for user ${ticket.userid}.`
                        });
                    }
                    if (!_.isEmpty(data)) {
                        if (data.Items.length !== 1) {
                            return reject({
                                code: 500,
                                error: 'DeviceRetrieveFailure',
                                message: `The device ${deviceId} for user ${ticket.userid} exists multiple times or never ${JSON.stringify(data.Items)}.`
                            });
                        } else {
                            return resolve(data.Items[0]);
                        }
                    } else {
                        return reject({
                            code: 400,
                            error: 'MissingDevice',
                            message: `The device ${deviceId} for user ${ticket.userid} does not exist.`
                        });
                    }
                });

            } else {
                let params = {
                    TableName: process.env.DEVICES_TBL,
                    Key: {
                        groupId: ticket.groupid,
                        id: deviceId
                    }
                };

                let docClient = new AWS.DynamoDB.DocumentClient(_self.dynamoConfig);
                docClient.get(params, function (err, data) {
                    if (err) {
                        Logger.error(Logger.levels.INFO, err);
                        return reject({
                            code: 500,
                            error: 'DeviceRetrieveFailure',
                            message: `Error occurred while attempting to retrieve device ${deviceId} for user ${ticket.userid}.`
                        });
                    }

                    if (!_.isEmpty(data)) {
                        return resolve(data.Item);
                    } else {
                        return reject({
                            code: 400,
                            error: 'MissingDevice',
                            message: `The device ${deviceId} for user ${ticket.userid} does not exist.`
                        });
                    }
                });
            }
        });
    }

    /**
     * Creates a device for user.
     * @param {JSON} ticket - authentication ticket
     * @param {JSON} request - device creation request object
     */
    createDevice(ticket, request) {

        const _self = this;

        // if (ticket.isAdmin === true) {
        return new Promise((resolve, reject) => {

            if (request.count > 25) {
                return reject({
                    code: 400,
                    error: 'DeviceCreateLimitExceeded',
                    message: 'Exceeded limit of 25 concurrent device creations per request.'
                });
            }

            let params = {
                TableName: process.env.DEVICE_TYPES_TBL,
                Key: {
                    groupId: ticket.groupid,
                    typeId: request.typeId
                }
            };

            let _deviceTypeManager = new DeviceTypeManager();

            _deviceTypeManager.getDeviceType(ticket, request.typeId).then(dtype => {

                let params = {
                    TableName: process.env.DEVICES_TBL,
                    Item: {
                        groupId: ticket.groupid,
                        userId: ticket.userid,
                        id: uuid.v4(),
                        name: request.name,
                        thingName: request.name,
                        connectionState: {
                            state: 'never connected',
                            at: moment().utc().format()
                        },
                        stage: 'provisioning',
                        category: dtype.custom ? 'custom widget' : dtype.typeId,
                        subCategory: dtype.name,
                        typeId: dtype.typeId,
                        createdAt: moment().utc().format(),
                        updatedAt: moment().utc().format()
                    }
                };
                let docClient = new AWS.DynamoDB.DocumentClient(_self.dynamoConfig);
                docClient.put(params, function (err, data) {
                    if (err) {
                        Logger.error(Logger.levels.INFO, err);
                        return reject({
                            code: 500,
                            error: 'DeviceCreateFailure',
                            message: `Error occurred while attempting to create devices for user ${ticket.userid}.`
                        });
                    }
                    return resolve(params.Item);
                });

            }).catch((err) => {
                reject(err);
            });
        });
        // } else {
        //     return new Promise((resolve, reject) => {
        //         reject({
        //             code: 401,
        //             error: 'DeviceTypeCreateFailure',
        //             message: `Error occurred while attempting to create device type for user ${ticket.userid}. Only Administrators can create types: User's groups ${JSON.stringify(ticket.groups)}`
        //         });
        //     });
        // }

    }

    /**
     * Deletes a device for user.
     * @param {JSON} ticket - authentication ticket
     * @param {string} DeviceId - id of device to delete
     */
    deleteDevice(ticket, deviceId) {

        const _self = this;

        if (ticket.isAdmin === true) {
            return new Promise((resolve, reject) => {

                let _params = {
                    TableName: process.env.DEVICES_TBL,
                    IndexName: 'thingId',
                    KeyConditionExpression: 'id = :thingId',
                    ExpressionAttributeValues: {
                        ':thingId': deviceId
                    }
                };

                let docClient = new AWS.DynamoDB.DocumentClient(_self.dynamoConfig);

                docClient.query(_params, function (err, data) {
                    if (err) {
                        Logger.error(Logger.levels.INFO, err);
                        return reject({
                            code: 500,
                            error: 'DeviceRetrieveFailure',
                            message: `Error occurred while attempting to retrieve device ${deviceId} for user ${ticket.userid}.`
                        });
                    }
                    if (!_.isEmpty(data)) {
                        if (data.Items.length !== 1) {
                            return reject({
                                code: 500,
                                error: 'DeviceRetrieveFailure',
                                message: `The device ${deviceId} for user ${ticket.userid} exists multiple times or never ${JSON.stringify(data.Items)}.`
                            });
                        } else {

                            let _params = {
                                TableName: process.env.DEVICES_TBL,
                                Key: {
                                    groupId: data.Items[0].groupId,
                                    id: deviceId
                                }
                            };

                            docClient.delete(_params, function (err, data) {
                                if (err) {
                                    Logger.error(Logger.levels.INFO, err);
                                    return reject({
                                        code: 500,
                                        error: 'DeviceDeleteFailure',
                                        message: `Error occurred while attempting to delete device ${deviceId} for user ${ticket.userid}.`
                                    });
                                }

                                resolve(data);
                            });
                        }
                    } else {
                        return reject({
                            code: 400,
                            error: 'MissingDevice',
                            message: `The device ${deviceId} for user ${ticket.userid} does not exist.`
                        });
                    }
                });
            });
        } else {
            return new Promise((resolve, reject) => {
                reject({
                    code: 401,
                    error: 'DeviceDeleteFailure',
                    message: `Error occurred while attempting to delete device type for user ${ticket.userid}. Only Administrators can delete: User's groups ${JSON.stringify(ticket.groups)}`
                });
            });
        }
    }

    /**
     * Updates a device for user.
     * @param {JSON} ticket - authentication ticket
     * @param {string} deviceId - id device to update
     * @param {string} newDevice - new device object
     */
    updateDevice(ticket, deviceId, newDevice) {

        const _self = this;

        if (ticket.isAdmin === true) {
            return new Promise((resolve, reject) => {

                let _params = {
                    TableName: process.env.DEVICES_TBL,
                    IndexName: 'thingId',
                    KeyConditionExpression: 'id = :thingId',
                    ExpressionAttributeValues: {
                        ':thingId': deviceId
                    }
                };

                let docClient = new AWS.DynamoDB.DocumentClient(_self.dynamoConfig);
                docClient.query(_params, function (err, data) {
                    if (err) {
                        Logger.error(Logger.levels.INFO, err);
                        return reject({
                            code: 500,
                            error: 'DeviceRetrieveFailure',
                            message: `Error occurred while attempting to retrieve device ${deviceId} for user ${ticket.userid}.`
                        });
                    }
                    if (!_.isEmpty(data)) {
                        if (data.Items.length !== 1) {
                            return reject({
                                code: 500,
                                error: 'DeviceRetrieveFailure',
                                message: `The device ${deviceId} for user ${ticket.userid} exists multiple times or never ${JSON.stringify(data.Items)}.`
                            });
                        } else {
                            let device = data.Items[0];
                            if (!_.isEmpty(device)) {
                                device.updatedAt = moment().utc().format();
                                device.typeId = newDevice.typeId;
                                device.category = newDevice.category;
                                device.subCategory = newDevice.subCategory;
                                device.name = newDevice.name;
                                device.stage = newDevice.stage;
                                if (device.ggBlueprintId !== newDevice.ggBlueprintId) {
                                    device.stage = 'provisioned';
                                }
                                device.ggBlueprintId = newDevice.ggBlueprintId;

                                let _updateParams = {
                                    TableName: process.env.DEVICES_TBL,
                                    Item: device
                                };

                                docClient.put(_updateParams, function (err, data) {
                                    if (err) {
                                        Logger.error(Logger.levels.INFO, err);
                                        return reject({
                                            code: 500,
                                            error: 'DeviceUpdateFailure',
                                            message: `Error occurred while attempting to update device ${deviceId} for user ${ticket.userid}.`
                                        });
                                    }

                                    resolve(device);
                                });

                            } else {
                                return reject({
                                    code: 400,
                                    error: 'MissingDevice',
                                    message: `The requested device ${deviceId} for user ${ticket.userid} does not exist.`
                                });
                            }
                        }
                    } else {
                        return reject({
                            code: 400,
                            error: 'MissingDevice',
                            message: `The device ${deviceId} for user ${ticket.userid} does not exist.`
                        });
                    }
                });
            });
        } else {
            return new Promise((resolve, reject) => {
                reject({
                    code: 401,
                    error: 'DeviceUpdateFailure',
                    message: `Error occurred while attempting to update device for user ${ticket.userid}. Only Administrators can update: User's groups ${JSON.stringify(ticket.groups)}`
                });
            });
        }
    }

    /**
     * Get device statistics for the user.
     * @param {JSON} ticket - authorization ticket.
     * @param {string} category - category of devices to get stats on
     * @param {string} lastevalkey - a serializable JavaScript object representing last evaluated key
     */
    _getDeviceStats(ticket, category, lastevalkey) {

        const _self = this;
        return new Promise((resolve, reject) => {

            let params = {};
            let docClient = new AWS.DynamoDB.DocumentClient(_self.dynamoConfig);
            let docClientFunction = 'query';

            if (ticket.isAdmin === true) {

                // Here we need to look at ALL devices
                params = {
                    TableName: process.env.DEVICES_TBL,
                    Limit: 75
                };

                docClientFunction = 'scan';

            } else {

                let _filter = 'groupId = :gid';
                let _expression = {
                    ':gid': ticket.groupid
                };

                if (category) {
                    _filter += ' and category = :category';
                    _expression[':category'] = category;
                }

                params = {
                    TableName: process.env.DEVICES_TBL,
                    IndexName: 'userId-category-index',
                    KeyConditionExpression: _filter,
                    ExpressionAttributeValues: _expression,
                    Limit: 75
                };

            }

            if (lastevalkey) {
                params.ExclusiveStartKey = lastevalkey;
            }

            params.ProjectionExpression = 'userId, id, category, subCategory, typeId, stage, connectionState';

            docClient[docClientFunction](params, function (err, result) {
                if (err) {
                    Logger.error(Logger.levels.INFO, err);
                    return reject(`Error occurred while attempting to retrieve stats for ${process.env.DEVICES_TBL}.`);
                }

                let _status = _.countBy(result.Items, function (device) {
                    return device.stage;
                });

                if (!_status.hasOwnProperty('provisioning')) {
                    _status.provisioning = 0;
                }
                if (!_status.hasOwnProperty('provisioned')) {
                    _status.provisioned = 0;
                }
                if (!_status.hasOwnProperty('deployed')) {
                    _status.deployed = 0;
                }

                let _connection = _.countBy(result.Items, function (device) {
                    return device.connectionState.state;
                });

                if (!_connection.hasOwnProperty('connected')) {
                    _connection.connected = 0;
                }

                if (!_connection.hasOwnProperty('disconnected')) {
                    _connection.disconnected = 0;
                }

                _status.connected = _connection.connected;
                _status.disconnected = _connection.disconnected;

                if (result.LastEvaluatedKey) {
                    _self._getDeviceStats(ticket, category, result.LastEvaluatedKey).then((data) => {
                        _status.provisioning = _status.provisioning + data.provisioning;
                        _status.provisioned = _status.provisioned + data.provisioned;
                        _status.deployed = _status.deployed + data.deployed;
                        _status.connected = _status.connected + data.connected;
                        _status.disconnected = _status.disconnected + data.disconnected;

                        resolve(_status);
                    }).catch((err) => {
                        Logger.error(Logger.levels.INFO, err);
                        return reject(`Error occurred while attempting to retrieve stats for ${process.env.DEVICES_TBL}.`);
                    });
                } else {
                    resolve(_status);
                }

            });

        });

    }

    /**
     * Get specific devices page for the user.
     * @param {JSON} ticket - authorization ticket.
     * @param {string} lastevalkey - a serializable JavaScript object representing last evaluated key
     * @param {int} curpage - current page evaluated
     * @param {int} targetpage - target page of devices to Retrieves
     */
    _getDevicePage(ticket, category, lastevalkey, curpage, targetpage) {
        const _self = this;
        return new Promise((resolve, reject) => {

            if (ticket.isAdmin === true) {
                // Here we do a SCAN instead of a query

                let params = {
                    TableName: process.env.DEVICES_TBL,
                    Limit: 20
                };

                if (lastevalkey) {
                    params.ExclusiveStartKey = lastevalkey;
                }

                let docClient = new AWS.DynamoDB.DocumentClient(_self.dynamoConfig);
                docClient.scan(params, function (err, result) {
                    if (err) {
                        Logger.error(Logger.levels.INFO, err);
                        return reject(`Error occurred while attempting to retrieve page ${targetpage} from devices.`);
                    }

                    if (curpage === targetpage) {
                        return resolve(result.Items);
                    } else if (result.LastEvaluatedKey) {
                        curpage++;
                        _self._getDevicePage(ticket, category, result.LastEvaluatedKey, curpage, targetpage).then((data) => {
                            resolve(data);
                        }).catch((err) => {
                            return reject(err);
                        });
                    } else {
                        return resolve([]);
                    }

                });

            } else {

                let _filter = 'groupId = :uid';
                let _expression = {
                    ':uid': ticket.groupid
                };

                if (category) {
                    _filter += ' and category = :category';
                    _expression[':category'] = category;
                }

                let params = {
                    TableName: process.env.DEVICES_TBL,
                    IndexName: 'groupId-category-index',
                    KeyConditionExpression: _filter,
                    ExpressionAttributeValues: _expression,
                    Limit: 20
                };

                if (lastevalkey) {
                    params.ExclusiveStartKey = lastevalkey;
                }

                let docClient = new AWS.DynamoDB.DocumentClient(_self.dynamoConfig);
                docClient.query(params, function (err, result) {
                    if (err) {
                        Logger.error(Logger.levels.INFO, err);
                        return reject(`Error occurred while attempting to retrieve page ${targetpage} from devices.`);
                    }

                    if (curpage === targetpage) {
                        return resolve(result.Items);
                    } else if (result.LastEvaluatedKey) {
                        curpage++;
                        _self._getDevicePage(ticket, category, result.LastEvaluatedKey, curpage, targetpage).then((data) => {
                            resolve(data);
                        }).catch((err) => {
                            return reject(err);
                        });
                    } else {
                        return resolve([]);
                    }

                });

            }

        });

    }
}

module.exports = DeviceManager;
