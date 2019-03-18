/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { AWSIoTService } from './aws-iot.service';
import { _ } from 'underscore';
var IoTSubscription = /** @class */ (function () {
    function IoTSubscription() {
    }
    return IoTSubscription;
}());
export { IoTSubscription };
if (false) {
    /** @type {?} */
    IoTSubscription.prototype.topic;
    /** @type {?} */
    IoTSubscription.prototype.onMessage;
    /** @type {?} */
    IoTSubscription.prototype.onError;
}
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
export { AWSIoTComponent };
if (false) {
    /** @type {?} */
    AWSIoTComponent.prototype.subscriptions;
    /** @type {?} */
    AWSIoTComponent.prototype.iotSubscriptions;
    /** @type {?} */
    AWSIoTComponent.prototype.desired;
    /** @type {?} */
    AWSIoTComponent.prototype.reported;
    /** @type {?} */
    AWSIoTComponent.prototype._iotService;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzLWlvdC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hd3MtaW90LyIsInNvdXJjZXMiOlsibGliL2F3cy1pb3QuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFhLE1BQU0sZUFBZSxDQUFDO0FBQ3JELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFHcEMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRWxELE9BQU8sRUFBRSxDQUFDLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFL0IsSUFBQTs7OzBCQVJBO0lBWUMsQ0FBQTtBQUpELDJCQUlDOzs7Ozs7Ozs7O0lBYUcseUJBQW9CLFdBQTBCO1FBQTFCLGdCQUFXLEdBQVgsV0FBVyxDQUFlOzZCQU5SLElBQUksWUFBWSxFQUFFO3VCQUdsQyxFQUFFO3dCQUNELEVBQUU7S0FFeUI7Ozs7SUFFbEQscUNBQVc7OztJQUFYO1FBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7S0FDcEM7Ozs7O0lBRVMsbUNBQVM7Ozs7SUFBbkIsVUFBb0IsZ0JBQW1DO1FBQXZELGlCQU9DO1FBTkcsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO1FBQ3pDLElBQUksQ0FBQyxXQUFXLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDLFVBQUMsU0FBa0I7WUFDaEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtREFBbUQsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM1RSxLQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztTQUMzQixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztLQUMzQjs7OztJQUVPLDBDQUFnQjs7Ozs7UUFDcEIsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcs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bUI7b0JBQzdCLFFBQVEsRUFBRSxFQUFFO2lCQUNmOzs7O2dCQWJRLGFBQWE7OzBCQUp0Qjs7U0FrQmEsZUFBZSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgT25EZXN0cm95IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcblxuLy8gU2VydmljZXNcbmltcG9ydCB7IEFXU0lvVFNlcnZpY2UgfSBmcm9tICcuL2F3cy1pb3Quc2VydmljZSc7XG5cbmltcG9ydCB7IF8gfSBmcm9tICd1bmRlcnNjb3JlJztcblxuZXhwb3J0IGNsYXNzIElvVFN1YnNjcmlwdGlvbiB7XG4gICAgdG9waWM6IHN0cmluZztcbiAgICBvbk1lc3NhZ2U6IChkYXRhOiBhbnkpID0+IHZvaWQ7XG4gICAgb25FcnJvcjogKGRhdGE6IGFueSkgPT4gdm9pZDtcbn1cblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdhd3MtaW90LWNvbXBvbmVudCcsXG4gICAgdGVtcGxhdGU6ICcnXG59KVxuZXhwb3J0IGNsYXNzIEFXU0lvVENvbXBvbmVudCBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gICAgcHJpdmF0ZSBzdWJzY3JpcHRpb25zOiBTdWJzY3JpcHRpb24gPSBuZXcgU3Vic2NyaXB0aW9uKCk7XG4gICAgcHJpdmF0ZSBpb3RTdWJzY3JpcHRpb25zOiBJb1RTdWJzY3JpcHRpb25bXTtcblxuICAgIHB1YmxpYyBkZXNpcmVkOiBhbnkgPSB7fTtcbiAgICBwdWJsaWMgcmVwb3J0ZWQ6IGFueSA9IHt9O1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBfaW90U2VydmljZTogQVdTSW9UU2VydmljZSkge31cblxuICAgIG5nT25EZXN0cm95KCkge1xuICAgICAgICBjb25zb2xlLmxvZygnVW5zdWJzY3JpYmluZyB0byB0b3BpY3MnKTtcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLnVuc3Vic2NyaWJlKCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHN1YnNjcmliZShpb3RTdWJzY3JpcHRpb25zOiBJb1RTdWJzY3JpcHRpb25bXSkge1xuICAgICAgICB0aGlzLmlvdFN1YnNjcmlwdGlvbnMgPSBpb3RTdWJzY3JpcHRpb25zO1xuICAgICAgICB0aGlzLl9pb3RTZXJ2aWNlLmNvbm5lY3Rpb25PYnNlcnZhYmxlJC5zdWJzY3JpYmUoKGNvbm5lY3RlZDogYm9vbGVhbikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0NoYW5nZSBvZiBjb25uZWN0aW9uIHN0YXRlOiBzZXR0aW5nIHN1YnNjcmlwdGlvbnMnLCBjb25uZWN0ZWQpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdWJzY3JpcHRpb25zKCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldFN1YnNjcmlwdGlvbnMoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldFN1YnNjcmlwdGlvbnMoKSB7XG4gICAgICAgIGlmICh0aGlzLl9pb3RTZXJ2aWNlLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgICAgICB0aGlzLmlvdFN1YnNjcmlwdGlvbnMuZm9yRWFjaCgoc3ViOiBJb1RTdWJzY3JpcHRpb24pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU3Vic2NyaWJpbmcgdG8gdG9waWM6Jywgc3ViLnRvcGljKTtcbiAgICAgICAgICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuX2lvdFNlcnZpY2Uuc3Vic2NyaWJlKHN1Yi50b3BpYywgc3ViLm9uTWVzc2FnZSwgc3ViLm9uRXJyb3IpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ05vdCBjb25uZWN0ZWQgdG8gQVdTIElvVDogQ2FudCBzdWJzY3JpYmUnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwcm90ZWN0ZWQgdXBkYXRlSW5jb21pbmdTaGFkb3coaW5jb21pbmcsIHNoYWRvd0ZpZWxkID0gbnVsbCkge1xuICAgICAgICBpZiAoaW5jb21pbmcuaGFzT3duUHJvcGVydHkoJ3N0YXRlJykgJiYgaW5jb21pbmcuc3RhdGUuaGFzT3duUHJvcGVydHkoJ3JlcG9ydGVkJykpIHtcbiAgICAgICAgICAgIGlmIChzaGFkb3dGaWVsZCAhPT0gbnVsbCAmJiBpbmNvbWluZy5zdGF0ZS5yZXBvcnRlZC5oYXNPd25Qcm9wZXJ0eShzaGFkb3dGaWVsZCkpIHtcbiAgICAgICAgICAgICAgICBfLmV4dGVuZCh0aGlzLnJlcG9ydGVkLCBpbmNvbWluZy5zdGF0ZS5yZXBvcnRlZFtzaGFkb3dGaWVsZF0pO1xuICAgICAgICAgICAgICAgIC8vIHRoaXMucmVwb3J0ZWQgPSBpbmNvbWluZy5zdGF0ZS5yZXBvcnRlZFtzaGFkb3dGaWVsZF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF8uZXh0ZW5kKHRoaXMucmVwb3J0ZWQsIGluY29taW5nLnN0YXRlLnJlcG9ydGVkKTtcbiAgICAgICAgICAgICAgICAvLyB0aGlzLnJlcG9ydGVkID0gaW5jb21pbmcuc3RhdGUucmVwb3J0ZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGluY29taW5nLmhhc093blByb3BlcnR5KCdzdGF0ZScpICYmIGluY29taW5nLnN0YXRlLmhhc093blByb3BlcnR5KCdkZXNpcmVkJykpIHtcbiAgICAgICAgICAgIGlmIChzaGFkb3dGaWVsZCAhPT0gbnVsbCAmJiBpbmNvbWluZy5zdGF0ZS5kZXNpcmVkLmhhc093blByb3BlcnR5KHNoYWRvd0ZpZWxkKSkge1xuICAgICAgICAgICAgICAgIF8uZXh0ZW5kKHRoaXMuZGVzaXJlZCwgaW5jb21pbmcuc3RhdGUuZGVzaXJlZFtzaGFkb3dGaWVsZF0pO1xuICAgICAgICAgICAgICAgIC8vIHRoaXMuZGVzaXJlZCA9IGluY29taW5nLnN0YXRlLmRlc2lyZWRbc2hhZG93RmllbGRdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfLmV4dGVuZCh0aGlzLmRlc2lyZWQsIGluY29taW5nLnN0YXRlLmRlc2lyZWQpO1xuICAgICAgICAgICAgICAgIC8vIHRoaXMuZGVzaXJlZCA9IGluY29taW5nLnN0YXRlLmRlc2lyZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0TGFzdFN0YXRlKHRoaW5nTmFtZSwgc2hhZG93RmllbGQgPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pb3RTZXJ2aWNlXG4gICAgICAgICAgICAuZ2V0VGhpbmdTaGFkb3coe1xuICAgICAgICAgICAgICAgIHRoaW5nTmFtZTogdGhpbmdOYW1lXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUluY29taW5nU2hhZG93KHJlc3VsdCwgc2hhZG93RmllbGQpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCB1cGRhdGVEZXNpcmVkU2hhZG93KHRoaW5nTmFtZSwgZGVzaXJlZFN0YXRlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pb3RTZXJ2aWNlLnVwZGF0ZVRoaW5nU2hhZG93KHtcbiAgICAgICAgICAgIHRoaW5nTmFtZTogdGhpbmdOYW1lLFxuICAgICAgICAgICAgcGF5bG9hZDogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIHN0YXRlOiB7XG4gICAgICAgICAgICAgICAgICAgIGRlc2lyZWQ6IGRlc2lyZWRTdGF0ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==