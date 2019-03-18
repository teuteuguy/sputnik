/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AmplifyService } from 'aws-amplify-angular';
import Amplify from 'aws-amplify';
import { AWSIoTProvider } from '@aws-amplify/pubsub/lib/Providers';
import gql from 'graphql-tag';
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
export class AWSIoTService {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzLWlvdC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYXdzLWlvdC8iLCJzb3VyY2VzIjpbImxpYi9hd3MtaW90LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUNBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUcvQixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDckQsT0FBTyxPQUFPLE1BQU0sYUFBYSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUduRSxPQUFPLEdBQUcsTUFBTSxhQUFhLENBQUM7O0FBRTlCLE1BQU0scUJBQXFCLEdBQUcsR0FBRyxDQUFBOzs7O0NBSWhDLENBQUM7O0FBQ0YsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFBOzs7Ozs7Q0FNekIsQ0FBQzs7QUFDRixNQUFNLGlCQUFpQixHQUFHLEdBQUcsQ0FBQTs7Ozs7O0NBTTVCLENBQUM7QUFVRixNQUFNOzs7O0lBTUYsWUFBb0IsY0FBOEI7UUFBOUIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO2lDQUpqQixJQUFJLE9BQU8sRUFBVztxQ0FDeEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksRUFBRTsyQkFDL0MsS0FBSztLQUU2Qjs7OztJQUV2RCxPQUFPO1FBQ0gsSUFBSSxDQUFDLGNBQWM7YUFDZCxJQUFJLEVBQUU7YUFDTixrQkFBa0IsRUFBRTthQUNwQixJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUU7O1lBRWhCLE1BQU0sT0FBTyxHQUFRLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO2dCQUNuRCxLQUFLLEVBQUUscUJBQXFCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJO2dCQUM1QyxTQUFTLEVBQUU7b0JBQ1AsVUFBVSxFQUFFLFlBQVks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QyxDQUFDO0tBQ3BGOzs7WUFwRkosVUFBVTs7OztZQTlCRixjQUFjIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQW5ndWxhclxuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuXG4vLyBBV1NcbmltcG9ydCB7IEFtcGxpZnlTZXJ2aWNlIH0gZnJvbSAnYXdzLWFtcGxpZnktYW5ndWxhcic7XG5pbXBvcnQgQW1wbGlmeSBmcm9tICdhd3MtYW1wbGlmeSc7XG5pbXBvcnQgeyBBV1NJb1RQcm92aWRlciB9IGZyb20gJ0Bhd3MtYW1wbGlmeS9wdWJzdWIvbGliL1Byb3ZpZGVycyc7XG5cbi8vIC0tLS0tXG5pbXBvcnQgZ3FsIGZyb20gJ2dyYXBocWwtdGFnJztcblxuY29uc3QgYXR0YWNoUHJpbmNpcGFsUG9saWN5ID0gZ3FsYFxuICAgIG11dGF0aW9uIEF0dGFjaFByaW5jaXBhbFBvbGljeSgkcG9saWN5TmFtZTogU3RyaW5nISwgJHByaW5jaXBhbDogU3RyaW5nISkge1xuICAgICAgICBhdHRhY2hQcmluY2lwYWxQb2xpY3kocG9saWN5TmFtZTogJHBvbGljeU5hbWUsIHByaW5jaXBhbDogJHByaW5jaXBhbClcbiAgICB9XG5gO1xuY29uc3QgZ2V0VGhpbmdTaGFkb3cgPSBncWxgXG4gICAgcXVlcnkgR2V0VGhpbmdTaGFkb3coJHBhcmFtczogQVdTSlNPTiEpIHtcbiAgICAgICAgZ2V0VGhpbmdTaGFkb3cocGFyYW1zOiAkcGFyYW1zKSB7XG4gICAgICAgICAgICBwYXlsb2FkXG4gICAgICAgIH1cbiAgICB9XG5gO1xuY29uc3QgdXBkYXRlVGhpbmdTaGFkb3cgPSBncWxgXG4gICAgbXV0YXRpb24gVXBkYXRlVGhpbmdTaGFkb3coJHBhcmFtczogQVdTSlNPTiEpIHtcbiAgICAgICAgdXBkYXRlVGhpbmdTaGFkb3cocGFyYW1zOiAkcGFyYW1zKSB7XG4gICAgICAgICAgICBwYXlsb2FkXG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG5kZWNsYXJlIHZhciBhcHBWYXJpYWJsZXM6IGFueTtcblxuXG5ASW5qZWN0YWJsZShcbi8vIHtcbi8vICAgICBwcm92aWRlZEluOiAncm9vdCdcbi8vIH1cbilcbmV4cG9ydCBjbGFzcyBBV1NJb1RTZXJ2aWNlIHtcblxuICAgIHByaXZhdGUgY29ubmVjdGlvblN1YmplY3Q6IGFueSA9IG5ldyBTdWJqZWN0PGJvb2xlYW4+KCk7XG4gICAgcHVibGljIGNvbm5lY3Rpb25PYnNlcnZhYmxlJCA9IHRoaXMuY29ubmVjdGlvblN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gICAgcHVibGljIGlzQ29ubmVjdGVkID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGFtcGxpZnlTZXJ2aWNlOiBBbXBsaWZ5U2VydmljZSkgeyB9XG5cbiAgICBjb25uZWN0KCkge1xuICAgICAgICB0aGlzLmFtcGxpZnlTZXJ2aWNlXG4gICAgICAgICAgICAuYXV0aCgpXG4gICAgICAgICAgICAuY3VycmVudENyZWRlbnRpYWxzKClcbiAgICAgICAgICAgIC50aGVuKGNyZWRlbnRpYWxzID0+IHtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHByb21pc2U6IGFueSA9IHRoaXMuYW1wbGlmeVNlcnZpY2UuYXBpKCkuZ3JhcGhxbCh7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5OiBhdHRhY2hQcmluY2lwYWxQb2xpY3kubG9jLnNvdXJjZS5ib2R5LFxuICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvbGljeU5hbWU6IGFwcFZhcmlhYmxlcy5JT1RfQ09HTklUT19QT0xJQ1ksXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmluY2lwYWw6IGNyZWRlbnRpYWxzLmlkZW50aXR5SWRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuZGF0YS5hdHRhY2hQcmluY2lwYWxQb2xpY3k7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEFtcGxpZnkuYWRkUGx1Z2dhYmxlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBBV1NJb1RQcm92aWRlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3c19wdWJzdWJfcmVnaW9uOiBhcHBWYXJpYWJsZXMuUkVHSU9OLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd3NfcHVic3ViX2VuZHBvaW50OiAnd3NzOi8vJyArIGFwcFZhcmlhYmxlcy5JT1RfRU5EUE9JTlQgKyAnL21xdHQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgdG8gQVdTIElvVCcsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0Nvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uU3ViamVjdC5uZXh0KHRoaXMuaXNDb25uZWN0ZWQpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHdoaWxlIHRyeWluZyB0byBjb25uZWN0IHRvIEFXUyBJb1Q6JywgZXJyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzQ29ubmVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uU3ViamVjdC5uZXh0KHRoaXMuaXNDb25uZWN0ZWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3Vic2NyaWJlKHRvcGljOiBzdHJpbmcsIG9uTWVzc2FnZSwgb25FcnJvcikge1xuICAgICAgICByZXR1cm4gdGhpcy5hbXBsaWZ5U2VydmljZVxuICAgICAgICAgICAgLnB1YnN1YigpXG4gICAgICAgICAgICAuc3Vic2NyaWJlKHRvcGljKVxuICAgICAgICAgICAgLnN1YnNjcmliZShcbiAgICAgICAgICAgICAgICBkYXRhID0+IG9uTWVzc2FnZShkYXRhKSxcbiAgICAgICAgICAgICAgICBlcnJvciA9PiBvbkVycm9yKGVycm9yKSxcbiAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTdWJzY3JpcHRpb24gdG8nLCB0b3BpYywgJ2RvbmUuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICB9XG5cbiAgICBnZXRUaGluZ1NoYWRvdyhwYXJhbXM6IGFueSkge1xuICAgICAgICBjb25zdCBwcm9taXNlOiBhbnkgPSB0aGlzLmFtcGxpZnlTZXJ2aWNlLmFwaSgpLmdyYXBocWwoe1xuICAgICAgICAgICAgcXVlcnk6IGdldFRoaW5nU2hhZG93LmxvYy5zb3VyY2UuYm9keSxcbiAgICAgICAgICAgIHZhcmlhYmxlczoge1xuICAgICAgICAgICAgICAgIHBhcmFtczogSlNPTi5zdHJpbmdpZnkocGFyYW1zKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbihyZXN1bHQgPT4gSlNPTi5wYXJzZShyZXN1bHQuZGF0YS5nZXRUaGluZ1NoYWRvdy5wYXlsb2FkKSk7XG4gICAgfVxuXG4gICAgdXBkYXRlVGhpbmdTaGFkb3cocGFyYW1zOiBhbnkpIHtcbiAgICAgICAgY29uc3QgcHJvbWlzZTogYW55ID0gdGhpcy5hbXBsaWZ5U2VydmljZS5hcGkoKS5ncmFwaHFsKHtcbiAgICAgICAgICAgIHF1ZXJ5OiB1cGRhdGVUaGluZ1NoYWRvdy5sb2Muc291cmNlLmJvZHksXG4gICAgICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICBwYXJhbXM6IEpTT04uc3RyaW5naWZ5KHBhcmFtcylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbihyZXN1bHQgPT4gSlNPTi5wYXJzZShyZXN1bHQuZGF0YS51cGRhdGVUaGluZ1NoYWRvdy5wYXlsb2FkKSk7XG4gICAgfVxufVxuIl19