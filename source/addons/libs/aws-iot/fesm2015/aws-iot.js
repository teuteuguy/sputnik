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
const attachPrincipalPolicy = gql `
    mutation AttachPrincipalPolicy($policyName: String!, $principal: String!) {
        attachPrincipalPolicy(policyName: $policyName, principal: $principal)
    }
`;
/** @type {?} */
const getThingShadow = gql `
    query GetThingShadow($params: AWSJSON!) {
        getThingShadow(params: $params) {
            payload
        }
    }
`;
/** @type {?} */
const updateThingShadow = gql `
    mutation UpdateThingShadow($params: AWSJSON!) {
        updateThingShadow(params: $params) {
            payload
        }
    }
`;
class AWSIoTService {
    /**
     * @param {?} amplifyService
     */
    constructor(amplifyService) {
        this.amplifyService = amplifyService;
        this.connectionSubject = new Subject();
        this.connectionObservable$ = this.connectionSubject.asObservable();
        this.isConnected = false;
    }
    /**
     * @return {?}
     */
    connect() {
        this.amplifyService
            .auth()
            .currentCredentials()
            .then(credentials => {
            /** @type {?} */
            const promise = this.amplifyService.api().graphql({
                query: attachPrincipalPolicy.loc.source.body,
                variables: {
                    policyName: appVariables.IOT_COGNITO_POLICY,
                    principal: credentials.identityId
                }
            });
            return promise.then(result => {
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
            .then(result => {
            console.log('Connected to AWS IoT', result);
            this.isConnected = true;
            this.connectionSubject.next(this.isConnected);
        })
            .catch(err => {
            console.error('Error while trying to connect to AWS IoT:', err);
            this.isConnected = false;
            this.connectionSubject.next(this.isConnected);
        });
    }
    /**
     * @param {?} topic
     * @param {?} onMessage
     * @param {?} onError
     * @return {?}
     */
    subscribe(topic, onMessage, onError) {
        return this.amplifyService
            .pubsub()
            .subscribe(topic)
            .subscribe(data => onMessage(data), error => onError(error), () => {
            console.log('Subscription to', topic, 'done.');
        });
    }
    /**
     * @param {?} params
     * @return {?}
     */
    getThingShadow(params) {
        /** @type {?} */
        const promise = this.amplifyService.api().graphql({
            query: getThingShadow.loc.source.body,
            variables: {
                params: JSON.stringify(params)
            }
        });
        return promise.then(result => JSON.parse(result.data.getThingShadow.payload));
    }
    /**
     * @param {?} params
     * @return {?}
     */
    updateThingShadow(params) {
        /** @type {?} */
        const promise = this.amplifyService.api().graphql({
            query: updateThingShadow.loc.source.body,
            variables: {
                params: JSON.stringify(params)
            }
        });
        return promise.then(result => JSON.parse(result.data.updateThingShadow.payload));
    }
}
AWSIoTService.decorators = [
    { type: Injectable }
];
/** @nocollapse */
AWSIoTService.ctorParameters = () => [
    { type: AmplifyService }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
class IoTSubscription {
}
class AWSIoTComponent {
    /**
     * @param {?} _iotService
     */
    constructor(_iotService) {
        this._iotService = _iotService;
        this.subscriptions = new Subscription();
        this.desired = {};
        this.reported = {};
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        console.log('Unsubscribing to topics');
        this.subscriptions.unsubscribe();
    }
    /**
     * @param {?} iotSubscriptions
     * @return {?}
     */
    subscribe(iotSubscriptions) {
        this.iotSubscriptions = iotSubscriptions;
        this._iotService.connectionObservable$.subscribe((connected) => {
            console.log('Change of connection state: setting subscriptions', connected);
            this.setSubscriptions();
        });
        this.setSubscriptions();
    }
    /**
     * @return {?}
     */
    setSubscriptions() {
        if (this._iotService.isConnected) {
            this.iotSubscriptions.forEach((sub) => {
                console.log('Subscribing to topic:', sub.topic);
                this.subscriptions.add(this._iotService.subscribe(sub.topic, sub.onMessage, sub.onError));
            });
        }
        else {
            console.log('Not connected to AWS IoT: Cant subscribe');
        }
    }
    /**
     * @param {?} incoming
     * @param {?=} shadowField
     * @return {?}
     */
    updateIncomingShadow(incoming, shadowField = null) {
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
    }
    /**
     * @param {?} thingName
     * @param {?=} shadowField
     * @return {?}
     */
    getLastState(thingName, shadowField = null) {
        return this._iotService
            .getThingShadow({
            thingName: thingName
        })
            .then(result => {
            this.updateIncomingShadow(result, shadowField);
            return result;
        })
            .catch(err => {
            console.error(err);
            throw err;
        });
    }
    /**
     * @param {?} thingName
     * @param {?} desiredState
     * @return {?}
     */
    updateDesiredShadow(thingName, desiredState) {
        return this._iotService.updateThingShadow({
            thingName: thingName,
            payload: JSON.stringify({
                state: {
                    desired: desiredState
                }
            })
        });
    }
}
AWSIoTComponent.decorators = [
    { type: Component, args: [{
                selector: 'aws-iot-component',
                template: ''
            }] }
];
/** @nocollapse */
AWSIoTComponent.ctorParameters = () => [
    { type: AWSIoTService }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
class AWSIoTModule {
}
AWSIoTModule.decorators = [
    { type: NgModule, args: [{
                declarations: [AWSIoTComponent],
                exports: [AWSIoTComponent],
                imports: [AmplifyAngularModule, CommonModule],
                providers: [AWSIoTService]
            },] }
];

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