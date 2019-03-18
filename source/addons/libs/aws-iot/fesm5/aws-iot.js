import { __makeTemplateObject } from 'tslib';
import { Subject, Subscription } from 'rxjs';
import Amplify from 'aws-amplify';
import { AWSIoTProvider } from '@aws-amplify/pubsub/lib/Providers';
import gql from 'graphql-tag';
import { _ } from 'underscore';
import { Injectable, Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmplifyService, AmplifyAngularModule } from 'aws-amplify-angular';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var attachPrincipalPolicy = gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n    mutation AttachPrincipalPolicy($policyName: String!, $principal: String!) {\n        attachPrincipalPolicy(policyName: $policyName, principal: $principal)\n    }\n"], ["\n    mutation AttachPrincipalPolicy($policyName: String!, $principal: String!) {\n        attachPrincipalPolicy(policyName: $policyName, principal: $principal)\n    }\n"])));
/** @type {?} */
var getThingShadow = gql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n    query GetThingShadow($params: AWSJSON!) {\n        getThingShadow(params: $params) {\n            payload\n        }\n    }\n"], ["\n    query GetThingShadow($params: AWSJSON!) {\n        getThingShadow(params: $params) {\n            payload\n        }\n    }\n"])));
/** @type {?} */
var updateThingShadow = gql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n    mutation UpdateThingShadow($params: AWSJSON!) {\n        updateThingShadow(params: $params) {\n            payload\n        }\n    }\n"], ["\n    mutation UpdateThingShadow($params: AWSJSON!) {\n        updateThingShadow(params: $params) {\n            payload\n        }\n    }\n"])));
var AWSIoTService = /** @class */ (function () {
    function AWSIoTService(amplifyService) {
        this.amplifyService = amplifyService;
        this.connectionSubject = new Subject();
        this.connectionObservable$ = this.connectionSubject.asObservable();
        this.isConnected = false;
    }
    /**
     * @return {?}
     */
    AWSIoTService.prototype.connect = /**
     * @return {?}
     */
    function () {
        var _this = this;
        this.amplifyService
            .auth()
            .currentCredentials()
            .then(function (credentials) {
            /** @type {?} */
            var promise = _this.amplifyService.api().graphql({
                query: attachPrincipalPolicy.loc.source.body,
                variables: {
                    policyName: appVariables.IOT_COGNITO_POLICY,
                    principal: credentials.identityId
                }
            });
            return promise.then(function (result) {
                result = result.data.attachPrincipalPolicy;
                if (result === true) {
                    Amplify.addPluggable(new AWSIoTProvider({
                        aws_pubsub_region: appVariables.REGION,
                        aws_pubsub_endpoint: 'wss://' + appVariables.IOT_ENDPOINT + '/mqtt'
                    }));
                }
                return result;
            });
        })
            .then(function (result) {
            console.log('Connected to AWS IoT', result);
            _this.isConnected = true;
            _this.connectionSubject.next(_this.isConnected);
        })
            .catch(function (err) {
            console.error('Error while trying to connect to AWS IoT:', err);
            _this.isConnected = false;
            _this.connectionSubject.next(_this.isConnected);
        });
    };
    /**
     * @param {?} topic
     * @param {?} onMessage
     * @param {?} onError
     * @return {?}
     */
    AWSIoTService.prototype.subscribe = /**
     * @param {?} topic
     * @param {?} onMessage
     * @param {?} onError
     * @return {?}
     */
    function (topic, onMessage, onError) {
        return this.amplifyService
            .pubsub()
            .subscribe(topic)
            .subscribe(function (data) { return onMessage(data); }, function (error) { return onError(error); }, function () {
            console.log('Subscription to', topic, 'done.');
        });
    };
    /**
     * @param {?} params
     * @return {?}
     */
    AWSIoTService.prototype.getThingShadow = /**
     * @param {?} params
     * @return {?}
     */
    function (params) {
        /** @type {?} */
        var promise = this.amplifyService.api().graphql({
            query: getThingShadow.loc.source.body,
            variables: {
                params: JSON.stringify(params)
            }
        });
        return promise.then(function (result) { return JSON.parse(result.data.getThingShadow.payload); });
    };
    /**
     * @param {?} params
     * @return {?}
     */
    AWSIoTService.prototype.updateThingShadow = /**
     * @param {?} params
     * @return {?}
     */
    function (params) {
        /** @type {?} */
        var promise = this.amplifyService.api().graphql({
            query: updateThingShadow.loc.source.body,
            variables: {
                params: JSON.stringify(params)
            }
        });
        return promise.then(function (result) { return JSON.parse(result.data.updateThingShadow.payload); });
    };
    AWSIoTService.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    AWSIoTService.ctorParameters = function () { return [
        { type: AmplifyService }
    ]; };
    return AWSIoTService;
}());
var templateObject_1, templateObject_2, templateObject_3;

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
var IoTSubscription = /** @class */ (function () {
    function IoTSubscription() {
    }
    return IoTSubscription;
}());
var AWSIoTComponent = /** @class */ (function () {
    function AWSIoTComponent(_iotService) {
        this._iotService = _iotService;
        this.subscriptions = new Subscription();
        this.desired = {};
        this.reported = {};
    }
    /**
     * @return {?}
     */
    AWSIoTComponent.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        console.log('Unsubscribing to topics');
        this.subscriptions.unsubscribe();
    };
    /**
     * @param {?} iotSubscriptions
     * @return {?}
     */
    AWSIoTComponent.prototype.subscribe = /**
     * @param {?} iotSubscriptions
     * @return {?}
     */
    function (iotSubscriptions) {
        var _this = this;
        this.iotSubscriptions = iotSubscriptions;
        this._iotService.connectionObservable$.subscribe(function (connected) {
            console.log('Change of connection state: setting subscriptions', connected);
            _this.setSubscriptions();
        });
        this.setSubscriptions();
    };
    /**
     * @return {?}
     */
    AWSIoTComponent.prototype.setSubscriptions = /**
     * @return {?}
     */
    function () {
        var _this = this;
        if (this._iotService.isConnected) {
            this.iotSubscriptions.forEach(function (sub) {
                console.log('Subscribing to topic:', sub.topic);
                _this.subscriptions.add(_this._iotService.subscribe(sub.topic, sub.onMessage, sub.onError));
            });
        }
        else {
            console.log('Not connected to AWS IoT: Cant subscribe');
        }
    };
    /**
     * @param {?} incoming
     * @param {?=} shadowField
     * @return {?}
     */
    AWSIoTComponent.prototype.updateIncomingShadow = /**
     * @param {?} incoming
     * @param {?=} shadowField
     * @return {?}
     */
    function (incoming, shadowField) {
        if (shadowField === void 0) { shadowField = null; }
        if (incoming.hasOwnProperty('state') && incoming.state.hasOwnProperty('reported')) {
            if (shadowField !== null && incoming.state.reported.hasOwnProperty(shadowField)) {
                _.extend(this.reported, incoming.state.reported[shadowField]);
                // this.reported = incoming.state.reported[shadowField];
            }
            else {
                _.extend(this.reported, incoming.state.reported);
                // this.reported = incoming.state.reported;
            }
        }
        if (incoming.hasOwnProperty('state') && incoming.state.hasOwnProperty('desired')) {
            if (shadowField !== null && incoming.state.desired.hasOwnProperty(shadowField)) {
                _.extend(this.desired, incoming.state.desired[shadowField]);
                // this.desired = incoming.state.desired[shadowField];
            }
            else {
                _.extend(this.desired, incoming.state.desired);
                // this.desired = incoming.state.desired;
            }
        }
    };
    /**
     * @param {?} thingName
     * @param {?=} shadowField
     * @return {?}
     */
    AWSIoTComponent.prototype.getLastState = /**
     * @param {?} thingName
     * @param {?=} shadowField
     * @return {?}
     */
    function (thingName, shadowField) {
        var _this = this;
        if (shadowField === void 0) { shadowField = null; }
        return this._iotService
            .getThingShadow({
            thingName: thingName
        })
            .then(function (result) {
            _this.updateIncomingShadow(result, shadowField);
            return result;
        })
            .catch(function (err) {
            console.error(err);
            throw err;
        });
    };
    /**
     * @param {?} thingName
     * @param {?} desiredState
     * @return {?}
     */
    AWSIoTComponent.prototype.updateDesiredShadow = /**
     * @param {?} thingName
     * @param {?} desiredState
     * @return {?}
     */
    function (thingName, desiredState) {
        return this._iotService.updateThingShadow({
            thingName: thingName,
            payload: JSON.stringify({
                state: {
                    desired: desiredState
                }
            })
        });
    };
    AWSIoTComponent.decorators = [
        { type: Component, args: [{
                    selector: 'aws-iot-component',
                    template: ''
                }] }
    ];
    /** @nocollapse */
    AWSIoTComponent.ctorParameters = function () { return [
        { type: AWSIoTService }
    ]; };
    return AWSIoTComponent;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
var AWSIoTModule = /** @class */ (function () {
    function AWSIoTModule() {
    }
    AWSIoTModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [AWSIoTComponent],
                    exports: [AWSIoTComponent],
                    imports: [AmplifyAngularModule, CommonModule],
                    providers: [AWSIoTService]
                },] }
    ];
    return AWSIoTModule;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

export { IoTSubscription, AWSIoTComponent, AWSIoTService, AWSIoTModule };

//# sourceMappingURL=aws-iot.js.map