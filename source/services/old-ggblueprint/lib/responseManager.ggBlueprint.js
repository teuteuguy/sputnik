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

/**
 * Lib
 */
const _ = require('underscore');
const Logger = require('logger');
const Auth = require('authorizer');
const GGBlueprintManager = require('./ggBlueprintManager.ggBlueprint');

// Logging class for orchestrating microservice responses
class ResponseManager {

    constructor() {}

    static respond(event) {
        return new Promise((resolve, reject) => {
            let _response = '';
            if (event.httpMethod === 'OPTIONS') {
                let _response = {
                    statusCode: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
                        'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'
                    },
                    body: JSON.stringify({})
                };
                resolve(_response);
            } else {
                Auth.getUserClaimTicket(event.headers.Authorization).then((ticket) => {
                    this._processRequest(event, ticket).then((data) => {
                        resolve(data);
                    }).catch(err => {
                        resolve(err);
                    });
                }).catch(err => {
                    _response = this._buildOutput(401, {
                        error: 'AccessDeniedException',
                        message: err.message
                    });
                    resolve(_response);
                });
            }
        });
    }

    /**
     * Routes the request to the appropriate logic based on the request resource and method.
     * @param {JSON} event - Request event.
     * @param {JSON} ticket - authorization ticket.
     */
    static _processRequest(event, ticket) {

        let INVALID_PATH_ERR = {
            error: 'InvalidAction',
            message: `Invalid path request ${event.resource}, ${event.httpMethod}`
        };

        let _ggBlueprintManager = new GGBlueprintManager();
        let _response = {};
        let _operation = '';
        let _body = {};
        if (event.body) {
            _body = JSON.parse(event.body);
        }

        ticket.isAdmin = _.contains(ticket.groups, 'Administrators');
        ticket.groupid = ticket.isAdmin ? 'Administrators' : ticket.groups.find(function (element) {
            return element !== 'Administrators';
        });

        Logger.log(Logger.levels.INFO, 'isAdmin: ' + ticket.isAdmin);
        Logger.log(Logger.levels.INFO, 'groupid: ' + ticket.groupid);

        let _promise = null;

        Logger.log(Logger.levels.INFO, event.pathParameters);
        Logger.log(Logger.levels.INFO, event.queryStringParameters);

        if (event.resource === '/gg-blueprints' && event.httpMethod === 'GET') {
            if (event.queryStringParameters.op === 'stats') {
                _operation = 'retrieve gg blueprint stats';
                _promise = _ggBlueprintManager.getGGBlueprintStats(ticket);
            } else if (event.queryStringParameters.op === 'all') {
                _operation = 'retrieve all gg blueprints';
                _promise = _ggBlueprintManager.getAllGGBlueprints(ticket);
            } else if (!_.isEmpty(event.queryStringParameters)) {
                _operation = 'retrieve gg blueprint by page';
                _promise = _ggBlueprintManager.getGGBlueprints(ticket, event.queryStringParameters.page);
            }
        } else if (event.resource === '/gg-blueprints/{gg_blueprint_id}' && !(_.isEmpty(event.pathParameters)) && event.pathParameters.hasOwnProperty('gg_blueprint_id') && event.httpMethod === 'GET') {
            _operation = ['retrieve gg blueprint', event.pathParameters.gg_blueprint_id].join(' ');
            _promise = _ggBlueprintManager.getGGBlueprint(ticket, event.pathParameters.gg_blueprint_id);
        } else if (event.resource === '/gg-blueprints/{gg_blueprint_id}/deploy-to-device' && !(_.isEmpty(event.pathParameters)) && event.pathParameters.hasOwnProperty('gg_blueprint_id') && !(_.isEmpty(event.queryStringParameters)) && event.queryStringParameters.hasOwnProperty('device_id') && event.httpMethod === 'GET') {
            _operation = ['get deployment status of gg blueprint', event.pathParameters.gg_blueprint_id, 'on device', event.queryStringParameters.device_id, 'status'].join(' ');
            _promise = _ggBlueprintManager.getDeploymentStatus(ticket, event.queryStringParameters.device_id);
        } else if (event.resource === '/gg-blueprints/{gg_blueprint_id}/deploy-to-device' && !(_.isEmpty(event.pathParameters)) && event.pathParameters.hasOwnProperty('gg_blueprint_id') && !(_.isEmpty(event.queryStringParameters)) && event.queryStringParameters.hasOwnProperty('device_id') && event.httpMethod === 'POST') {
            _operation = ['start deployment of gg blueprint', event.pathParameters.gg_blueprint_id, 'to device', event.queryStringParameters.device_id].join(' ');
            _promise = _ggBlueprintManager.runGGBlueprint(ticket, event.pathParameters.gg_blueprint_id, event.queryStringParameters.device_id, _body);
        } else if (ticket.isAdmin) {
            if (event.resource === '/gg-blueprints' && event.httpMethod === 'POST') {
                _operation = 'create device gg blueprint';
                _promise = _ggBlueprintManager.createGGBlueprint(ticket, _body);
            } else if (event.resource === '/gg-blueprints/{gg_blueprint_id}' && !(_.isEmpty(event.pathParameters)) && event.pathParameters.hasOwnProperty('gg_blueprint_id') && event.httpMethod === 'PUT') {
                _operation = ['update device gg blueprint', event.pathParameters.gg_blueprint_id].join(' ');
                _promise = _ggBlueprintManager.updateGGBlueprint(ticket, event.pathParameters.gg_blueprint_id, _body);
            } else if (event.resource === '/gg-blueprints/{gg_blueprint_id}' && !(_.isEmpty(event.pathParameters)) && event.pathParameters.hasOwnProperty('gg_blueprint_id') && event.httpMethod === 'DELETE') {
                _operation = ['delete device gg blueprint', event.pathParameters.gg_blueprint_id].join(' ');
                _promise = _ggBlueprintManager.deleteGGBlueprint(ticket, event.pathParameters.gg_blueprint_id);
            } else {
                _promise = new Promise((resolve, reject) => reject(this._buildOutput(401, {
                    code: 401,
                    error: 'AdminsOnly',
                    message: `Error occurred while attempting to ${_operation} with user ${ticket.userid}. Only Administrators can play with blueprints: User's groups ${JSON.stringify(ticket.groups)}`
                })));
            }

        }

        if (_promise === null) {
            _operation = ['do something for unknown path', event.resource].join(' ');
            Logger.log(Logger.levels.INFO, ['Attempting to', _operation].join(' '));
            return new Promise((resolve, reject) => {
                resolve(this._buildOutput(400, INVALID_PATH_ERR));
            });
        } else {
            Logger.log(Logger.levels.INFO, ['Attempting to', _operation].join(' '));
            return _promise.then(data => this._processResponse(200, data, _operation)).catch(err => this._processResponse(err.code, err, _operation));
        }


    }

    /**
     * Process operation response and log the access/result.
     * @param {JSON} code - Http code to return from operation.
     * @param {JSON} response - Data returned from operation.
     * @param {JSON} operation - Description of operation executed.
     */
    static _processResponse(code, response, operation) {
        let _response = {};

        Logger.log(Logger.levels.ROBUST, [operation, JSON.stringify(response)].join(': '));
        _response = this._buildOutput(code, response);
        return _response;

    };

    /**
     * Constructs the appropriate HTTP response.
     * @param {integer} statusCode - HTTP status code for the response.
     * @param {JSON} data - Result body to return in the response.
     */
    static _buildOutput(statusCode, data) {

        let _response = {
            statusCode: statusCode,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(data)
        };
        Logger.log(Logger.levels.ROBUST, `API response: ${JSON.stringify(_response)}`);
        return _response;
    };

}

module.exports = ResponseManager;
