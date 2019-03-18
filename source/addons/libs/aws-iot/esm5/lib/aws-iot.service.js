/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AmplifyService } from 'aws-amplify-angular';
import Amplify from 'aws-amplify';
import { AWSIoTProvider } from '@aws-amplify/pubsub/lib/Providers';
import gql from 'graphql-tag';
/** @type {?} */
var attachPrincipalPolicy = gql(templateObject_1 || (templateObject_1 = tslib_1.__makeTemplateObject(["\n    mutation AttachPrincipalPolicy($policyName: String!, $principal: String!) {\n        attachPrincipalPolicy(policyName: $policyName, principal: $principal)\n    }\n"], ["\n    mutation AttachPrincipalPolicy($policyName: String!, $principal: String!) {\n        attachPrincipalPolicy(policyName: $policyName, principal: $principal)\n    }\n"])));
/** @type {?} */
var getThingShadow = gql(templateObject_2 || (templateObject_2 = tslib_1.__makeTemplateObject(["\n    query GetThingShadow($params: AWSJSON!) {\n        getThingShadow(params: $params) {\n            payload\n        }\n    }\n"], ["\n    query GetThingShadow($params: AWSJSON!) {\n        getThingShadow(params: $params) {\n            payload\n        }\n    }\n"])));
/** @type {?} */
var updateThingShadow = gql(templateObject_3 || (templateObject_3 = tslib_1.__makeTemplateObject(["\n    mutation UpdateThingShadow($params: AWSJSON!) {\n        updateThingShadow(params: $params) {\n            payload\n        }\n    }\n"], ["\n    mutation UpdateThingShadow($params: AWSJSON!) {\n        updateThingShadow(params: $params) {\n            payload\n        }\n    }\n"])));
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
export { AWSIoTService };
if (false) {
    /** @type {?} */
    AWSIoTService.prototype.connectionSubject;
    /** @type {?} */
    AWSIoTService.prototype.connectionObservable$;
    /** @type {?} */
    AWSIoTService.prototype.isConnected;
    /** @type {?} */
    AWSIoTService.prototype.amplifyService;
}
var templateObject_1, templateObject_2, templateObject_3;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzLWlvdC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYXdzLWlvdC8iLCJzb3VyY2VzIjpbImxpYi9hd3MtaW90LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFHL0IsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3JELE9BQU8sT0FBTyxNQUFNLGFBQWEsQ0FBQztBQUNsQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFHbkUsT0FBTyxHQUFHLE1BQU0sYUFBYSxDQUFDOztBQUU5QixJQUFNLHFCQUFxQixHQUFHLEdBQUcsc1BBQUEsMktBSWhDLEtBQUM7O0FBQ0YsSUFBTSxjQUFjLEdBQUcsR0FBRyxnTkFBQSxxSUFNekIsS0FBQzs7QUFDRixJQUFNLGlCQUFpQixHQUFHLEdBQUcseU5BQUEsOElBTTVCLEtBQUM7O0lBZ0JFLHVCQUFvQixjQUE4QjtRQUE5QixtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7aUNBSmpCLElBQUksT0FBTyxFQUFXO3FDQUN4QixJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFOzJCQUMvQyxLQUFLO0tBRTZCOzs7O0lBRXZELCtCQUFPOzs7SUFBUDtRQUFBLGlCQXFDQztRQXBDRyxJQUFJLENBQUMsY0FBYzthQUNkLElBQUksRUFBRTthQUNOLGtCQUFrQixFQUFFO2FBQ3BCLElBQUksQ0FBQyxVQUFBLFdBQVc7O1lBRWIsSUFBTSxPQUFPLEdBQVEsS0FBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7Z0JBQ25ELEtBQUssRUFBRSxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUk7Z0JBQzVDLFNBQVMsRUFBRTtvQkFDUCxVQUFVLEVBQUUsWUFBWSxD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LElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsRUFBakQsQ0FBaUQsQ0FBQyxDQUFDO0tBQ3BGOztnQkFwRkosVUFBVTs7OztnQkE5QkYsY0FBYzs7d0JBTHZCOztTQXdDYSxhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQW5ndWxhclxuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuXG4vLyBBV1NcbmltcG9ydCB7IEFtcGxpZnlTZXJ2aWNlIH0gZnJvbSAnYXdzLWFtcGxpZnktYW5ndWxhcic7XG5pbXBvcnQgQW1wbGlmeSBmcm9tICdhd3MtYW1wbGlmeSc7XG5pbXBvcnQgeyBBV1NJb1RQcm92aWRlciB9IGZyb20gJ0Bhd3MtYW1wbGlmeS9wdWJzdWIvbGliL1Byb3ZpZGVycyc7XG5cbi8vIC0tLS0tXG5pbXBvcnQgZ3FsIGZyb20gJ2dyYXBocWwtdGFnJztcblxuY29uc3QgYXR0YWNoUHJpbmNpcGFsUG9saWN5ID0gZ3FsYFxuICAgIG11dGF0aW9uIEF0dGFjaFByaW5jaXBhbFBvbGljeSgkcG9saWN5TmFtZTogU3RyaW5nISwgJHByaW5jaXBhbDogU3RyaW5nISkge1xuICAgICAgICBhdHRhY2hQcmluY2lwYWxQb2xpY3kocG9saWN5TmFtZTogJHBvbGljeU5hbWUsIHByaW5jaXBhbDogJHByaW5jaXBhbClcbiAgICB9XG5gO1xuY29uc3QgZ2V0VGhpbmdTaGFkb3cgPSBncWxgXG4gICAgcXVlcnkgR2V0VGhpbmdTaGFkb3coJHBhcmFtczogQVdTSlNPTiEpIHtcbiAgICAgICAgZ2V0VGhpbmdTaGFkb3cocGFyYW1zOiAkcGFyYW1zKSB7XG4gICAgICAgICAgICBwYXlsb2FkXG4gICAgICAgIH1cbiAgICB9XG5gO1xuY29uc3QgdXBkYXRlVGhpbmdTaGFkb3cgPSBncWxgXG4gICAgbXV0YXRpb24gVXBkYXRlVGhpbmdTaGFkb3coJHBhcmFtczogQVdTSlNPTiEpIHtcbiAgICAgICAgdXBkYXRlVGhpbmdTaGFkb3cocGFyYW1zOiAkcGFyYW1zKSB7XG4gICAgICAgICAgICBwYXlsb2FkXG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG5kZWNsYXJlIHZhciBhcHBWYXJpYWJsZXM6IGFueTtcblxuXG5ASW5qZWN0YWJsZShcbi8vIHtcbi8vICAgICBwcm92aWRlZEluOiAncm9vdCdcbi8vIH1cbilcbmV4cG9ydCBjbGFzcyBBV1NJb1RTZXJ2aWNlIHtcblxuICAgIHByaXZhdGUgY29ubmVjdGlvblN1YmplY3Q6IGFueSA9IG5ldyBTdWJqZWN0PGJvb2xlYW4+KCk7XG4gICAgcHVibGljIGNvbm5lY3Rpb25PYnNlcnZhYmxlJCA9IHRoaXMuY29ubmVjdGlvblN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gICAgcHVibGljIGlzQ29ubmVjdGVkID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGFtcGxpZnlTZXJ2aWNlOiBBbXBsaWZ5U2VydmljZSkgeyB9XG5cbiAgICBjb25uZWN0KCkge1xuICAgICAgICB0aGlzLmFtcGxpZnlTZXJ2aWNlXG4gICAgICAgICAgICAuYXV0aCgpXG4gICAgICAgICAgICAuY3VycmVudENyZWRlbnRpYWxzKClcbiAgICAgICAgICAgIC50aGVuKGNyZWRlbnRpYWxzID0+IHtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHByb21pc2U6IGFueSA9IHRoaXMuYW1wbGlmeVNlcnZpY2UuYXBpKCkuZ3JhcGhxbCh7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5OiBhdHRhY2hQcmluY2lwYWxQb2xpY3kubG9jLnNvdXJjZS5ib2R5LFxuICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvbGljeU5hbWU6IGFwcFZhcmlhYmxlcy5JT1RfQ09HTklUT19QT0xJQ1ksXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmluY2lwYWw6IGNyZWRlbnRpYWxzLmlkZW50aXR5SWRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuZGF0YS5hdHRhY2hQcmluY2lwYWxQb2xpY3k7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEFtcGxpZnkuYWRkUGx1Z2dhYmxlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBBV1NJb1RQcm92aWRlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3c19wdWJzdWJfcmVnaW9uOiBhcHBWYXJpYWJsZXMuUkVHSU9OLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd3NfcHVic3ViX2VuZHBvaW50OiAnd3NzOi8vJyArIGFwcFZhcmlhYmxlcy5JT1RfRU5EUE9JTlQgKyAnL21xdHQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgdG8gQVdTIElvVCcsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0Nvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uU3ViamVjdC5uZXh0KHRoaXMuaXNDb25uZWN0ZWQpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHdoaWxlIHRyeWluZyB0byBjb25uZWN0IHRvIEFXUyBJb1Q6JywgZXJyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzQ29ubmVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uU3ViamVjdC5uZXh0KHRoaXMuaXNDb25uZWN0ZWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3Vic2NyaWJlKHRvcGljOiBzdHJpbmcsIG9uTWVzc2FnZSwgb25FcnJvcikge1xuICAgICAgICByZXR1cm4gdGhpcy5hbXBsaWZ5U2VydmljZVxuICAgICAgICAgICAgLnB1YnN1YigpXG4gICAgICAgICAgICAuc3Vic2NyaWJlKHRvcGljKVxuICAgICAgICAgICAgLnN1YnNjcmliZShcbiAgICAgICAgICAgICAgICBkYXRhID0+IG9uTWVzc2FnZShkYXRhKSxcbiAgICAgICAgICAgICAgICBlcnJvciA9PiBvbkVycm9yKGVycm9yKSxcbiAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTdWJzY3JpcHRpb24gdG8nLCB0b3BpYywgJ2RvbmUuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICB9XG5cbiAgICBnZXRUaGluZ1NoYWRvdyhwYXJhbXM6IGFueSkge1xuICAgICAgICBjb25zdCBwcm9taXNlOiBhbnkgPSB0aGlzLmFtcGxpZnlTZXJ2aWNlLmFwaSgpLmdyYXBocWwoe1xuICAgICAgICAgICAgcXVlcnk6IGdldFRoaW5nU2hhZG93LmxvYy5zb3VyY2UuYm9keSxcbiAgICAgICAgICAgIHZhcmlhYmxlczoge1xuICAgICAgICAgICAgICAgIHBhcmFtczogSlNPTi5zdHJpbmdpZnkocGFyYW1zKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbihyZXN1bHQgPT4gSlNPTi5wYXJzZShyZXN1bHQuZGF0YS5nZXRUaGluZ1NoYWRvdy5wYXlsb2FkKSk7XG4gICAgfVxuXG4gICAgdXBkYXRlVGhpbmdTaGFkb3cocGFyYW1zOiBhbnkpIHtcbiAgICAgICAgY29uc3QgcHJvbWlzZTogYW55ID0gdGhpcy5hbXBsaWZ5U2VydmljZS5hcGkoKS5ncmFwaHFsKHtcbiAgICAgICAgICAgIHF1ZXJ5OiB1cGRhdGVUaGluZ1NoYWRvdy5sb2Muc291cmNlLmJvZHksXG4gICAgICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICBwYXJhbXM6IEpTT04uc3RyaW5naWZ5KHBhcmFtcylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbihyZXN1bHQgPT4gSlNPTi5wYXJzZShyZXN1bHQuZGF0YS51cGRhdGVUaGluZ1NoYWRvdy5wYXlsb2FkKSk7XG4gICAgfVxufVxuIl19