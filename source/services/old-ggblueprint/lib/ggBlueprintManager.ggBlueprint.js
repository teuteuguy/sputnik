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

/**
 * Performs crud actions for a gg blueprint, such as, creating, retrieving, updating and deleting gg blueprints.
 *
 * @class GGBlueprintManager
 */
class GGBlueprintManager {
    /**
     * @class GGBlueprintManager
     * @constructor
     */
    constructor() {
        this.creds = new AWS.EnvironmentCredentials('AWS'); // Lambda provided credentials
        this.dynamoConfig = {
            credentials: this.creds,
            region: process.env.AWS_REGION
        };
        this.greengrassConfig = {
            credentials: this.creds,
            region: process.env.AWS_REGION
        };
        this.iamConfig = {
            credentials: this.creds,
            region: process.env.AWS_REGION
        };
    }

    /**
     * Get gg blueprints.
     * @param {JSON} ticket - authorization ticket.
     */
    getGGBlueprints(ticket, page) {
        const _self = this;
        return new Promise((resolve, reject) => {
            let _page = parseInt(page);
            if (isNaN(_page)) {
                _page = 0;
            }

            _self
                ._getGGBlueprintsPage(ticket, null, 0, _page)
                .then(ggBlueprints => {
                    resolve(ggBlueprints);
                })
                .catch(err => {
                    Logger.error(Logger.levels.INFO, err);
                    Logger.error(Logger.levels.INFO, 'Error occurred while attempting to retrieve gg blueprints.');
                    reject({
                        code: 500,
                        error: 'GGBlueprintsRetrievalFailure',
                        message: err
                    });
                });
        });
    }
    getAllGGBlueprints(ticket) {
        const _self = this;
        return new Promise((resolve, reject) => {
            _self
                ._getAllGGBlueprints(ticket, null)
                .then(results => {
                    resolve(results);
                })
                .catch(err => {
                    Logger.error(Logger.levels.INFO, err);
                    Logger.error(Logger.levels.INFO, 'Error occurred while attempting to retrieve device types.');
                    reject({
                        code: 500,
                        error: 'DeviceTypeRetrievalFailure',
                        message: err
                    });
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
    _getGGBlueprintsPage(ticket, lastevalkey, curpage, targetpage) {
        const _self = this;
        return new Promise((resolve, reject) => {
            let params = {
                TableName: process.env.GG_BLUEPRINTS_TBL,
                Limit: 20
            };

            if (lastevalkey) {
                params.ExclusiveStartKey = lastevalkey;
            }

            let docClient = new AWS.DynamoDB.DocumentClient(_self.dynamoConfig);
            docClient
                .scan(params)
                .promise()
                .then(result => {
                    if (curpage === targetpage) {
                        return resolve(result.Items);
                    } else if (result.LastEvaluatedKey) {
                        curpage++;
                        _self
                            ._getGGBlueprintsPage(ticket, result.LastEvaluatedKey, curpage, targetpage)
                            .then(data => {
                                resolve(data);
                            })
                            .catch(err => {
                                return reject(err);
                            });
                    } else {
                        return resolve([]);
                    }
                })
                .catch(err => {
                    Logger.error(Logger.levels.INFO, err);
                    reject(`Error occurred while attempting to retrieve page ${targetpage} gg blueprints.`);
                });
        });
    }
    _getAllGGBlueprints(ticket, lastevalkey) {
        const _self = this;
        return new Promise((resolve, reject) => {
            let params = {
                TableName: process.env.GG_BLUEPRINTS_TBL,
                Limit: 75
            };

            if (lastevalkey) {
                params.ExclusiveStartKey = lastevalkey;
            }

            let docClient = new AWS.DynamoDB.DocumentClient(_self.dynamoConfig);
            docClient
                .scan(params)
                .promise()
                .then(result => {
                    let _ggBlueprints = [].concat(result.Items);

                    if (result.LastEvaluatedKey) {
                        _self
                            ._getDeviceTypeStats(ticket, result.LastEvaluatedKey)
                            .then(data => {
                                _ggBlueprints = _ggBlueprints.concat(data.Items);
                                resolve(_ggBlueprints);
                            })
                            .catch(err => {
                                Logger.error(Logger.levels.INFO, err);
                                reject('Error occurred while attempting to retrieve all gg blueprints.');
                            });
                    } else {
                        resolve(_ggBlueprints);
                    }
                })
                .catch(err => {
                    Logger.error(Logger.levels.INFO, err);
                    return reject(
                        `Error occurred while attempting to retrieve gg blueprints for ${
                            process.env.GG_BLUEPRINTS_TBL
                        }.`
                    );
                });
        });
    }

    /**
     * Retrieves gg blueprint statistics.
     * @param {JSON} ticket - authentication ticket
     */
    getGGBlueprintStats(ticket) {
        const _self = this;
        return new Promise((resolve, reject) => {
            _self
                ._getGGBlueprintStats(ticket, null)
                .then(data => {
                    resolve(data);
                })
                .catch(err => {
                    Logger.error(Logger.levels.INFO, err);
                    Logger.error(Logger.levels.INFO, 'Error occurred while attempting to retrieve gg blueprint stats');
                    reject({
                        code: 500,
                        error: 'GGBlueprintStatsRetrievalFailure',
                        message: err
                    });
                });
        });
    }

    /**
     * Get gg blueprint statistics
     * @param {JSON} ticket - authorization ticket.
     * @param {string} lastevalkey - a serializable JavaScript object representing last evaluated key
     */
    _getGGBlueprintStats(ticket, lastevalkey) {
        const _self = this;
        return new Promise((resolve, reject) => {
            let params = {
                TableName: process.env.GG_BLUEPRINTS_TBL,
                ProjectionExpression: 'ggBlueprintId',
                Limit: 75
            };

            if (lastevalkey) {
                params.ExclusiveStartKey = lastevalkey;
            }

            let docClient = new AWS.DynamoDB.DocumentClient(_self.dynamoConfig);
            docClient
                .scan(params)
                .promise()
                .then(result => {
                    let _stats = {
                        total: result.Items.length
                    };

                    if (result.LastEvaluatedKey) {
                        _self
                            ._getGGBlueprintStats(ticket, result.LastEvaluatedKey)
                            .then(data => {
                                _stats.total = _stats.total + data.total;
                                resolve(_stats);
                            })
                            .catch(err => {
                                Logger.error(Logger.levels.INFO, err);
                                reject('Error occurred while attempting to retrieve gg blueprint statistics.');
                            });
                    } else {
                        resolve(_stats);
                    }
                })
                .catch(err => {
                    Logger.error(Logger.levels.INFO, err);
                    return reject(
                        `Error occurred while attempting to retrieve stats for ${process.env.GG_BLUEPRINTS_TBL}.`
                    );
                });
        });
    }

    /**
     * Retrieves a gg blueprint.
     * @param {JSON} ticket - authentication ticket
     * @param {string} ggBlueprintId - id of gg blueprint to retrieve
     */
    getGGBlueprint(ticket, ggBlueprintId) {
        const _self = this;

        return new Promise((resolve, reject) => {
            let params = {
                TableName: process.env.GG_BLUEPRINTS_TBL,
                Key: {
                    ggBlueprintId: ggBlueprintId
                }
            };

            let docClient = new AWS.DynamoDB.DocumentClient(_self.dynamoConfig);
            docClient.get(params, function (err, data) {
                if (err) {
                    Logger.error(Logger.levels.INFO, err);
                    return reject({
                        code: 500,
                        error: 'GGBlueprintRetrieveFailure',
                        message: `Error occurred while attempting to retrieve gg blueprint ${ggBlueprintId} for user ${
                            ticket.userid
                        }.`
                    });
                }

                if (!_.isEmpty(data)) {
                    return resolve(data.Item);
                } else {
                    return reject({
                        code: 400,
                        error: 'MissingGGBlueprint',
                        message: `The gg blueprint ${ggBlueprintId} for user ${ticket.userid} or default does not exist.`
                    });
                }
            });
        });
    }

    /**
     * Creates a gg blueprint.
     * @param {JSON} ticket - authentication ticket
     * @param {JSON} ggBlueprint - ggBlueprint object
     */
    createGGBlueprint(ticket, ggBlueprint) {
        const _self = this;

        return new Promise((resolve, reject) => {
            let _id = _.has(ggBlueprint, 'ggBlueprintId') ? ggBlueprint.ggBlueprintId : uuid.v4();
            if (_id === '') {
                _id = uuid.v4();
            }

            let _ggBlueprint = {
                ggBlueprintId: _id,
                name: ggBlueprint.name,
                custom: ggBlueprint.custom,
                spec: ggBlueprint.spec,
                createdBy: ticket.userid,
                createdAt: moment()
                    .utc()
                    .format(),
                updatedAt: moment()
                    .utc()
                    .format()
            };

            let params = {
                TableName: process.env.GG_BLUEPRINTS_TBL,
                Item: _ggBlueprint
            };

            let docClient = new AWS.DynamoDB.DocumentClient(_self.dynamoConfig);
            docClient
                .put(params)
                .promise()
                .then(data => resolve(_ggBlueprint))
                .catch(err => {
                    Logger.error(Logger.levels.INFO, err);
                    reject({
                        code: 500,
                        error: 'GGBlueprintCreateFailure',
                        message: `Error occurred while attempting to create gg blueprint for user ${ticket.userid}.`
                    });
                });
        });
    }

    /**
     * Deletes a gg blueprint.
     * @param {JSON} ticket - authentication ticket
     * @param {string} ggBlueprintId - id of gg blueprint to delete
     */
    deleteGGBlueprint(ticket, ggBlueprintId) {
        const _self = this;
        return new Promise((resolve, reject) => {
            let params = {
                TableName: process.env.GG_BLUEPRINTS_TBL,
                Key: {
                    ggBlueprintId: ggBlueprintId
                }
            };

            let docClient = new AWS.DynamoDB.DocumentClient(_self.dynamoConfig);
            docClient.get(params, function (err, ggBlueprint) {
                if (err) {
                    Logger.error(Logger.levels.INFO, err);
                    return reject({
                        code: 500,
                        error: 'GGBlueprintRetrieveFailure',
                        message: `Error occurred while attempting to retrieve gg blueprint ${ggBlueprintId} for user ${
                            ticket.userid
                        } to delete.`
                    });
                }

                if (!_.isEmpty(ggBlueprint)) {
                    docClient.delete(params, function (err, data) {
                        if (err) {
                            Logger.error(Logger.levels.INFO, err);
                            return reject({
                                code: 500,
                                error: 'GGBlueprintDeleteFailure',
                                message: `Error occurred while attempting to delete gg blueprint ${ggBlueprintId} for user ${
                                    ticket.userid
                                }.`
                            });
                        }

                        resolve(data);
                    });
                } else {
                    return reject({
                        code: 400,
                        error: 'MissingGGBlueprint',
                        message: `The requested gg blueprint ${ggBlueprintId} for user ${ticket.userid} does not exist.`
                    });
                }
            });
        });
    }

    /**
     * Updates a gg blueprint for user.
     * @param {JSON} ticket - authentication ticket
     * @param {string} ggBlueprintId - id gg blueprint to update
     * @param {string} newGGBlueprint - new gg blueprint object
     */
    updateGGBlueprint(ticket, ggBlueprintId, newGGBlueprint) {
        const _self = this;
        return new Promise((resolve, reject) => {
            if (!ticket.isAdmin) {
                return reject({
                    code: 401,
                    error: 'GGBlueprintCreateFailure',
                    message: `Error occurred while attempting to update gg blueprint for user ${
                        ticket.userid
                    }. Only Administrators can update gg blueprints: User's groups ${JSON.stringify(ticket.groups)}`
                });
            }

            let _params = {
                TableName: process.env.GG_BLUEPRINTS_TBL,
                Key: {
                    ggBlueprintId: ggBlueprintId
                }
            };

            let docClient = new AWS.DynamoDB.DocumentClient(_self.dynamoConfig);
            docClient.get(_params, function (err, ggBlueprint) {
                if (err) {
                    Logger.error(Logger.levels.INFO, err);
                    return reject({
                        code: 500,
                        error: 'GGBlueprintRetrieveFailure',
                        message: `Error occurred while attempting to retrieve gg blueprint ${ggBlueprintId} for user ${
                            ticket.userid
                        } to update.`
                    });
                }

                if (!_.isEmpty(ggBlueprint)) {
                    ggBlueprint.Item.updatedAt = moment()
                        .utc()
                        .format();
                    ggBlueprint.Item.name = newGGBlueprint.name;
                    ggBlueprint.Item.spec = newGGBlueprint.spec;

                    let _updateParams = {
                        TableName: process.env.GG_BLUEPRINTS_TBL,
                        Item: ggBlueprint.Item
                    };

                    docClient.put(_updateParams, function (err, data) {
                        if (err) {
                            Logger.error(Logger.levels.INFO, err);
                            return reject({
                                code: 500,
                                error: 'GGBlueprintUpdateFailure',
                                message: `Error occurred while attempting to update gg blueprint ${ggBlueprintId} for user ${
                                    ticket.userid
                                }.`
                            });
                        }

                        resolve(data);
                    });
                } else {
                    return reject({
                        code: 400,
                        error: 'MissingGGBlueprint',
                        message: `The requested gg blueprint ${ggBlueprintId} for user ${ticket.userid} does not exist.`
                    });
                }
            });
        });
    }

    /**
     * Gets gg blueprint status from the actual device
     * @param {JSON} ticket - authentication ticket
     * @param {string} deviceId - device Id to deploy to
     */
    getDeploymentStatus(ticket, deviceId) {
        // TODO: fix this
        const _self = this;

        let _device = null;
        let ggSDK = new AWS.Greengrass(this.greengrassConfig);

        // Get the device:
        return _self
            ._getDevice(ticket, deviceId)
            .then(dev => {
                // Check the device is a GG device.
                if (!dev.hasOwnProperty('greengrass') || dev.greengrass === null) {
                    throw {
                        code: 400,
                        error: 'DeviceNotAGreengrass',
                        message: `The device ${deviceId} is not a greengrass device.`
                    };
                }
                _device = dev;
                return ggSDK.getDeploymentStatus({
                    GroupId: _device.greengrass.groupId,
                    DeploymentId: _device.greengrass.deploymentId
                }).promise();
            }).catch(err => {
                Logger.error(Logger.levels.INFO, err);
                throw ({
                    code: 500,
                    error: 'DeploymentStatusFailure',
                    message: `Error occurred: ${JSON.stringify(err)}.`
                });
            });
    }
    /**
     * Runs a gg blueprint on a device
     * @param {JSON} ticket - authentication ticket
     * @param {string} ggBlueprintId - gg blueprint Id to use
     * @param {string} deviceId - device Id to deploy to
     * @param {JSON} ggBlueprintInfo - gg blueprint information object. Can contain a custom object to apply to the template. TODO: work on this.
     */
    runGGBlueprint(ticket, ggBlueprintId, deviceId, ggBlueprintInfo) {
        const _self = this;

        // return new Promise((resolve, reject) => {
        let _device = null;
        let _ggBlueprint = null;
        let _currentGGGroupVersion = null;
        let _newGGGroupVersion = {};

        let _substitutions = {
            THING_NAME: null,
            CORE_ARN: null,
            CORE_CERTIFICATE_ARN: null,
            AWS_REGION: null,
            AWS_ACCOUNT: null,
            MYTHINGS_MGMT_DATA_BUCKET_ACCESS_POLICY: null
        };

        let ggSDK = new AWS.Greengrass(this.greengrassConfig);

        // Get the device:
        return _self
            ._getDevice(ticket, deviceId)
            .then(dev => {
                // Check the device is a GG device.
                if (!dev.hasOwnProperty('greengrass') || dev.greengrass === null) {
                    throw {
                        code: 400,
                        error: 'DeviceNotAGreengrass',
                        message: `The device ${deviceId} is not a greengrass device.`
                    };
                }

                _device = dev;

                _substitutions.THING_NAME = _device.thingName;
                _substitutions.CORE_ARN = _device.greengrass.thingArn;
                _substitutions.CORE_CERTIFICATE_ARN = _device.greengrass.certificateArn;
                _substitutions.AWS_ACCOUNT = process.env.AWS_ACCOUNT;
                _substitutions.AWS_REGION = process.env.AWS_REGION;
                _substitutions.MYTHINGS_MGMT_DATA_BUCKET_ACCESS_POLICY = process.env.MYTHINGS_MGMT_DATA_BUCKET_ACCESS_POLICY;

                // Get the gg blueprint
                Logger.log(Logger.levels.INFO, `Getting gg blueprint ${ggBlueprintId} and group ${_device.greengrass.groupId}:`);
                return Promise.all([
                    _self.getGGBlueprint(ticket, ggBlueprintId).then(depl => _ggBlueprint = depl),
                    ggSDK.getGroup({
                        GroupId: _device.greengrass.groupId
                    }).promise().then(group => {
                        return ggSDK.getGroupVersion({
                            GroupId: _device.greengrass.groupId,
                            GroupVersionId: group.LatestVersion
                        }).promise();
                    }).then(groupVersion => _currentGGGroupVersion = groupVersion)
                ]);
            })
            .then(results => {

                Logger.log(Logger.levels.INFO, 'Will replace spec with following info:');
                Logger.log(Logger.levels.INFO, `THING_NAME: ${_substitutions.THING_NAME}`);
                Logger.log(Logger.levels.INFO, `CORE_ARN: ${_substitutions.CORE_ARN}`);
                Logger.log(Logger.levels.INFO, `CORE_CERTIFICATE_ARN: ${_substitutions.CORE_CERTIFICATE_ARN}`);
                Logger.log(Logger.levels.INFO, `AWS_REGION: ${process.env.AWS_REGION}`);
                Logger.log(Logger.levels.INFO, `AWS_ACCOUNT: ${process.env.AWS_ACCOUNT}`);
                Logger.log(Logger.levels.INFO, `MYTHINGS_MGMT_DATA_BUCKET_ACCESS_POLICY: ${process.env.MYTHINGS_MGMT_DATA_BUCKET_ACCESS_POLICY}`);

                Logger.log(Logger.levels.INFO, `Spec in: ${JSON.stringify(_ggBlueprint.spec, null, 2)}`);

                // Construct the spec:
                let strSpec = JSON.stringify(_ggBlueprint.spec);

                for (var key in _substitutions) {
                    // skip loop if the property is from prototype
                    if (!_substitutions.hasOwnProperty(key)) continue;

                    var value = _substitutions[key];
                    for (var prop in value) {
                        // skip loop if the property is from prototype
                        if (!value.hasOwnProperty(prop)) continue;

                        // your code
                        let regExp = new RegExp('[' + key + ']', 'gi');
                        strSpec = strSpec.split('[' + key + ']').join(value);
                    }
                }

                _ggBlueprint.spec = JSON.parse(strSpec);
                Logger.log(Logger.levels.INFO, `Spec out: ${JSON.stringify(_ggBlueprint.spec, null, 2)}`);

                return _ggBlueprint.spec;
            }).then(spec => {

                // Check for each version if they are different to what the spec wants
                _newGGGroupVersion.GroupId = _device.greengrass.groupId;

                let promises = [
                    _self._createCoreDefinitionVersion(_ggBlueprint, _device, _currentGGGroupVersion).then(coreDefinitionVersion => {
                        if (coreDefinitionVersion) {
                            _newGGGroupVersion.CoreDefinitionVersionArn = coreDefinitionVersion.Arn;
                        }
                    }),
                    _self._createFunctionDefinitionVersion(_ggBlueprint, _device, _currentGGGroupVersion).then(functionDefinitionVersion => {
                        if (functionDefinitionVersion) {
                            _newGGGroupVersion.FunctionDefinitionVersionArn = functionDefinitionVersion.Arn;
                        }
                    }),
                    _self._createLoggerDefinitionVersion(_ggBlueprint, _device, _currentGGGroupVersion).then(loggerDefinitionVersion => {
                        if (loggerDefinitionVersion) {
                            _newGGGroupVersion.LoggerDefinitionVersionArn = loggerDefinitionVersion.Arn;
                        }
                    }),
                    _self._createResourceDefinitionVersion(_ggBlueprint, _device, _currentGGGroupVersion).then(resourceDefinitionVersion => {
                        if (resourceDefinitionVersion) {
                            _newGGGroupVersion.ResourceDefinitionVersionArn = resourceDefinitionVersion.Arn;
                        }
                    }),
                    _self._createSubscriptionDefinitionVersion(_ggBlueprint, _device, _currentGGGroupVersion).then(subscriptionDefinitionVersion => {
                        if (subscriptionDefinitionVersion) {
                            _newGGGroupVersion.SubscriptionDefinitionVersionArn = subscriptionDefinitionVersion.Arn;
                        }
                    }),
                    _self._iamWork(_ggBlueprint, _device, _currentGGGroupVersion)
                ];

                return Promise.all(promises);
            }).then(results => {

                Logger.log(Logger.levels.INFO, `Creating group version: ${_newGGGroupVersion}`);
                return ggSDK.createGroupVersion(_newGGGroupVersion).promise();

            }).then(groupVersion => {

                Logger.log(Logger.levels.INFO, `Created group version: ${groupVersion}`);
                Logger.log(Logger.levels.INFO, `Deploy it:`);
                return ggSDK.createDeployment({
                    GroupId: groupVersion.Id,
                    DeploymentId: uuid.v4(),
                    DeploymentType: 'NewDeployment',
                    GroupVersionId: groupVersion.Version
                }).promise();

            }).then(deployment => {

                Logger.log(Logger.levels.INFO, `Deployed: ${deployment.DeploymentId}`);

                _device.greengrass.deploymentId = deployment.DeploymentId;
                _device.stage = 'deployed';

                return _self._updateDevice(ticket, _device, ggBlueprintId);

            }).then(device => {

                return device;

            }).catch(err => {
                Logger.error(Logger.levels.INFO, err);
                throw ({
                    code: 500,
                    error: 'DeploymentFailure',
                    message: `Error occurred: ${JSON.stringify(err)}.`
                });
            });
    }

    _createCoreDefinitionVersion(ggBlueprint, device, currentGGGroupVersion) {
        let ggSDK = new AWS.Greengrass(this.greengrassConfig);
        let spec = ggBlueprint.spec;

        // Simple version: We'll just create it rather than check.
        // TODO: probably check if it needs changing.
        if (!spec.hasOwnProperty('CoreDefinitionVersion')) {
            return new Promise((resolve, reject) => resolve(null));
        } else {
            Logger.log(Logger.levels.INFO, 'Checking difference of CoreDefinitionVersion to:');
            let currentDefinitionId = currentGGGroupVersion.Definition.CoreDefinitionVersionArn.split('/')[4];

            // spec.CoreDefinitionVersion.Id = uuid.v4();
            spec.CoreDefinitionVersion.Cores.forEach(c => c.Id = uuid.v4());

            return ggSDK.createCoreDefinitionVersion({
                CoreDefinitionId: currentDefinitionId,
                Cores: [spec.CoreDefinitionVersion.Cores[0]]
            }).promise();
        }

        // let ggSDK = new AWS.Greengrass(this.greengrassConfig);
        // let spec = ggBlueprint.spec;
        // if (!spec.hasOwnProperty('CoreDefinitionVersion') || !currentGGGroupVersion.Definition.hasOwnProperty('CoreDefinitionVersionArn')) {
        //     if (!spec.hasOwnProperty('CoreDefinitionVersion')) {
        //         // Current GG Group does not have a core attached to it. This is a problem. We must exit here.
        //         throw `FAIL: Spec doesn't have a Core`;
        //     }
        //     if (!currentGGGroupVersion.Definition.hasOwnProperty('CoreDefinitionVersionArn')) {
        //         throw `MASSIVE FAIL: Greengrass Group: ${device.greengrass.groupId} does not have a Core ???`;
        //     }
        // } else {
        //     Logger.log(Logger.levels.INFO, 'Checking difference of CoreDefinitionVersion to:');
        //     let currentCoreDefinitionId = currentGGGroupVersion.Definition.CoreDefinitionVersionArn.split('/')[4];
        //     let currentCoreDefinitionVersionId = currentGGGroupVersion.Definition.CoreDefinitionVersionArn.split('/')[6];

        //     return ggSDK.getCoreDefinitionVersion({
        //         CoreDefinitionId: currentCoreDefinitionId,
        //         CoreDefinitionVersionId: currentCoreDefinitionVersionId
        //     }).promise().then(coreDefinitionVersion => {
        //         if (coreDefinitionVersion.Definition.Cores.length !== 1) {
        //             throw `FAIL: Greengrass Core ARN ${currentGGGroupVersion.Definition.CoreDefinitionVersionArn} doesn't have a core attached to it`;
        //         }

        //         let core = coreDefinitionVersion.Definition.Cores[0];

        //         Logger.log(Logger.levels.INFO, `${coreDefinitionVersion} vs. ${core}`);

        //         if (core.CertificateArn !== spec.CoreDefinitionVersion.CertificateArn ||
        //             core.ThingArn !== spec.CoreDefinitionVersion.ThingArn ||
        //             core.SyncShadow !== spec.CoreDefinitionVersion.SyncShadow) {
        //             Logger.log(Logger.levels.INFO, 'CoreDefinitionVersion is different. Need to create a new one:');
        //             spec.CoreDefinitionVersion.Id = uuid.v4();
        //             return ggSDK.createCoreDefinitionVersion({
        //                 CoreDefinitionId: currentCoreDefinitionId,
        //                 Cores: [spec.CoreDefinitionVersion]
        //             }).promise();
        //         } else {
        //             return null;
        //         }
        //     });
        // }
    }
    _createFunctionDefinitionVersion(ggBlueprint, device, currentGGGroupVersion) {
        let ggSDK = new AWS.Greengrass(this.greengrassConfig);
        let spec = ggBlueprint.spec;

        // Simple version: We'll just create it rather than check.
        // TODO: probably check if it needs changing.
        if (!spec.hasOwnProperty('FunctionDefinitionVersion')) {
            return new Promise((resolve, reject) => resolve(null));
        } else {
            Logger.log(Logger.levels.INFO, 'Checking difference of FunctionDefinitionVersion to:');
            let currentFunctionDefinitionId = currentGGGroupVersion.Definition.FunctionDefinitionVersionArn.split('/')[4];

            spec.FunctionDefinitionVersion.Functions.forEach(f => f.Id = uuid.v4());

            return ggSDK.createFunctionDefinitionVersion({
                FunctionDefinitionId: currentFunctionDefinitionId,
                Functions: spec.FunctionDefinitionVersion.Functions
            }).promise();
        }
    }
    _createLoggerDefinitionVersion(ggBlueprint, device, currentGGGroupVersion) {
        let ggSDK = new AWS.Greengrass(this.greengrassConfig);
        let spec = ggBlueprint.spec;

        // Simple version: We'll just create it rather than check.
        // TODO: probably check if it needs changing.
        if (!spec.hasOwnProperty('LoggerDefinitionVersion')) {
            return new Promise((resolve, reject) => resolve(null));
        } else {
            Logger.log(Logger.levels.INFO, 'Checking difference of LoggerDefinitionVersion to:');
            let currentDefinitionId = currentGGGroupVersion.Definition.LoggerDefinitionVersionArn.split('/')[4];

            spec.LoggerDefinitionVersion.Loggers.forEach(l => l.Id = uuid.v4());

            return ggSDK.createLoggerDefinitionVersion({
                LoggerDefinitionId: currentDefinitionId,
                Loggers: spec.LoggerDefinitionVersion.Loggers
            }).promise();
        }
    }
    _createResourceDefinitionVersion(ggBlueprint, device, currentGGGroupVersion) {
        let ggSDK = new AWS.Greengrass(this.greengrassConfig);
        let spec = ggBlueprint.spec;

        // Simple version: We'll just create it rather than check.
        // TODO: probably check if it needs changing.
        if (!spec.hasOwnProperty('ResourceDefinitionVersion')) {
            return new Promise((resolve, reject) => resolve(null));
        } else {
            Logger.log(Logger.levels.INFO, 'Checking difference of ResourceDefinitionVersion to:');
            let currentDefinitionId = currentGGGroupVersion.Definition.ResourceDefinitionVersionArn.split('/')[4];

            spec.ResourceDefinitionVersion.Resources.forEach(r => {
                if (!r.hasOwnProperty('Id')) {
                    r.Id = uuid.v4();
                }
            });

            return ggSDK.createResourceDefinitionVersion({
                ResourceDefinitionId: currentDefinitionId,
                Resources: spec.ResourceDefinitionVersion.Resources
            }).promise();
        }
    }
    _createSubscriptionDefinitionVersion(ggBlueprint, device, currentGGGroupVersion) {
        let ggSDK = new AWS.Greengrass(this.greengrassConfig);
        let spec = ggBlueprint.spec;

        // Simple version: We'll just create it rather than check.
        // TODO: probably check if it needs changing.
        if (!spec.hasOwnProperty('SubscriptionDefinitionVersion')) {
            return new Promise((resolve, reject) => resolve(null));
        } else {
            Logger.log(Logger.levels.INFO, 'Checking difference of SubscriptionDefinitionVersion to:');
            let currentDefinitionId = currentGGGroupVersion.Definition.SubscriptionDefinitionVersionArn.split('/')[4];

            spec.SubscriptionDefinitionVersion.Subscriptions.forEach(s => s.Id = uuid.v4());

            return ggSDK.createSubscriptionDefinitionVersion({
                SubscriptionDefinitionId: currentDefinitionId,
                Subscriptions: spec.SubscriptionDefinitionVersion.Subscriptions
            }).promise();
        }
    }
    _iamWork(ggBlueprint, device, currentGGGroupVersion) {
        let ggSDK = new AWS.Greengrass(this.greengrassConfig);
        let iamSDK = new AWS.IAM(this.iamConfig);
        let spec = ggBlueprint.spec;

        let roleName = null;

        // TODO: think about whether or not we should reset the whole role itself ? and recreate it

        if (spec.IAM && spec.IAM.PolicyArns && spec.IAM.PolicyArns.length > 0) {
            // First let's get the role for the group.

            Logger.log(Logger.levels.INFO, 'IAM field present in spec.');
            return ggSDK.getAssociatedRole({
                GroupId: device.greengrass.groupId
            }).promise().then(association => {
                Logger.log(Logger.levels.INFO, 'Found associated role:', association);
                roleName = association.RoleArn.split('/')[2];
                return iamSDK.listAttachedRolePolicies({
                    RoleName: roleName
                }).promise();
            }).then(rolePolicies => {
                Logger.log(Logger.levels.INFO, 'Found following policies for the role:', rolePolicies);

                return Promise.all(spec.IAM.PolicyArns.map(policy => {
                    let foundPolicy = rolePolicies.AttachedPolicies.find(p => {
                        return p.PolicyArn === policy;
                    });
                    if (foundPolicy === undefined) {
                        Logger.log(Logger.levels.INFO, 'Did not find policy', policy, 'in role. Adding it.');
                        return iamSDK.attachRolePolicy({
                            RoleName: roleName,
                            PolicyArn: policy
                        }).promise();
                    } else {
                        Logger.log(Logger.levels.INFO, 'Policy', policy, 'already present.');
                        return null;
                    }
                }));
            });
        } else {
            return new Promise((resolve, reject) => resolve(null));
        }
    }

    _getDevice(ticket, deviceId) {
        const _self = this;

        let params = {
            TableName: process.env.DEVICES_TBL
        };
        let docClient = new AWS.DynamoDB.DocumentClient(_self.dynamoConfig);
        let docClientFunction = 'get';

        if (ticket.isAdmin) {
            params.IndexName = 'thingId';
            params.KeyConditionExpression = 'id = :thingId';
            params.ExpressionAttributeValues = {
                ':thingId': deviceId
            };
            docClientFunction = 'query';
        } else {
            params.Key = {
                groupId: ticket.groupid,
                id: deviceId
            };
        }

        return docClient[docClientFunction](params)
            .promise()
            .then(data => {
                let device = null;
                if (_.isEmpty(data)) {
                    throw {
                        thenError: true,
                        code: 400,
                        error: 'MissingDevice',
                        message: `The device ${deviceId} for user ${ticket.userid} does not exist.`
                    };
                } else {
                    if (ticket.isAdmin && data.Items.length !== 1) {
                        throw {
                            code: 500,
                            error: 'DeviceRetrieveFailure',
                            message: `The device ${deviceId} for user ${
                                ticket.userid
                            } exists multiple times or never ${JSON.stringify(data.Items)}.`
                        };
                    } else {
                        if (ticket.isAdmin) {
                            device = data.Items[0];
                        } else {
                            device = data.Item;
                        }
                    }
                }
                return device;
            })
            .catch(err => {
                Logger.error(Logger.levels.INFO, err);
                if (err.thenError) {
                    delete err.thenError;
                    throw err;
                }
                throw {
                    code: 500,
                    error: 'DeviceRetrieveFailure',
                    message: `Error occurred while attempting to retrieve device ${deviceId} for user ${ticket.userid}.`
                };
            });
    }

    _updateDevice(ticket, device, ggBlueprintId) {

        const _self = this;

        let _updateParams = {
            TableName: process.env.DEVICES_TBL,
            Key: {
                groupId: device.groupId,
                id: device.id
            },
            UpdateExpression: 'set #ud = :ud, #ggbid = :ggbid, #lggbid = :lggbid, #gg = :gg, #s = :s',
            ExpressionAttributeNames: {
                '#ud': 'updatedAt',
                '#ggbid': 'ggBlueprintId',
                '#lggbid': 'lastGGBlueprintId',
                '#gg': 'greengrass',
                '#s': 'stage'
            },
            ExpressionAttributeValues: {
                ':ud': moment().utc().format(),
                ':ggbid': ggBlueprintId,
                ':lggbid': ggBlueprintId,
                ':gg': device.greengrass,
                ':s': device.stage
            }
        };

        let docClient = new AWS.DynamoDB.DocumentClient(_self.dynamoConfig);
        return docClient.update(_updateParams).promise();

    }
}

module.exports = GGBlueprintManager;
