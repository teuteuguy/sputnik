/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { AWSIoTService } from './aws-iot.service';
import { _ } from 'underscore';
export class IoTSubscription {
}
if (false) {
    /** @type {?} */
    IoTSubscription.prototype.topic;
    /** @type {?} */
    IoTSubscription.prototype.onMessage;
    /** @type {?} */
    IoTSubscription.prototype.onError;
}
export class AWSIoTComponent {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzLWlvdC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hd3MtaW90LyIsInNvdXJjZXMiOlsibGliL2F3cy1pb3QuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFhLE1BQU0sZUFBZSxDQUFDO0FBQ3JELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFHcEMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRWxELE9BQU8sRUFBRSxDQUFDLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFL0IsTUFBTTtDQUlMOzs7Ozs7Ozs7QUFNRCxNQUFNOzs7O0lBT0YsWUFBb0IsV0FBMEI7UUFBMUIsZ0JBQVcsR0FBWCxXQUFXLENBQWU7NkJBTlIsSUFBSSxZQUFZLEVBQUU7dUJBR2xDLEVBQUU7d0JBQ0QsRUFBRTtLQUV5Qjs7OztJQUVsRCxXQUFXO1FBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7S0FDcEM7Ozs7O0lBRVMsU0FBUyxDQUFDLGdCQUFtQztRQUNuRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7UUFDekMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFrQixFQUFFLEVBQUU7WUFDcEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtREFBbUQsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM1RSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztTQUMzQixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztLQUMzQjs7OztJQUVPLGdCQUFnQjtRQUNwQixJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFO1lBQzlCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFP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fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xuXG4vLyBTZXJ2aWNlc1xuaW1wb3J0IHsgQVdTSW9UU2VydmljZSB9IGZyb20gJy4vYXdzLWlvdC5zZXJ2aWNlJztcblxuaW1wb3J0IHsgXyB9IGZyb20gJ3VuZGVyc2NvcmUnO1xuXG5leHBvcnQgY2xhc3MgSW9UU3Vic2NyaXB0aW9uIHtcbiAgICB0b3BpYzogc3RyaW5nO1xuICAgIG9uTWVzc2FnZTogKGRhdGE6IGFueSkgPT4gdm9pZDtcbiAgICBvbkVycm9yOiAoZGF0YTogYW55KSA9PiB2b2lkO1xufVxuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2F3cy1pb3QtY29tcG9uZW50JyxcbiAgICB0ZW1wbGF0ZTogJydcbn0pXG5leHBvcnQgY2xhc3MgQVdTSW9UQ29tcG9uZW50IGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgICBwcml2YXRlIHN1YnNjcmlwdGlvbnM6IFN1YnNjcmlwdGlvbiA9IG5ldyBTdWJzY3JpcHRpb24oKTtcbiAgICBwcml2YXRlIGlvdFN1YnNjcmlwdGlvbnM6IElvVFN1YnNjcmlwdGlvbltdO1xuXG4gICAgcHVibGljIGRlc2lyZWQ6IGFueSA9IHt9O1xuICAgIHB1YmxpYyByZXBvcnRlZDogYW55ID0ge307XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9pb3RTZXJ2aWNlOiBBV1NJb1RTZXJ2aWNlKSB7fVxuXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdVbnN1YnNjcmliaW5nIHRvIHRvcGljcycpO1xuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMudW5zdWJzY3JpYmUoKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgc3Vic2NyaWJlKGlvdFN1YnNjcmlwdGlvbnM6IElvVFN1YnNjcmlwdGlvbltdKSB7XG4gICAgICAgIHRoaXMuaW90U3Vic2NyaXB0aW9ucyA9IGlvdFN1YnNjcmlwdGlvbnM7XG4gICAgICAgIHRoaXMuX2lvdFNlcnZpY2UuY29ubmVjdGlvbk9ic2VydmFibGUkLnN1YnNjcmliZSgoY29ubmVjdGVkOiBib29sZWFuKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQ2hhbmdlIG9mIGNvbm5lY3Rpb24gc3RhdGU6IHNldHRpbmcgc3Vic2NyaXB0aW9ucycsIGNvbm5lY3RlZCk7XG4gICAgICAgICAgICB0aGlzLnNldFN1YnNjcmlwdGlvbnMoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2V0U3Vic2NyaXB0aW9ucygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0U3Vic2NyaXB0aW9ucygpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lvdFNlcnZpY2UuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaW90U3Vic2NyaXB0aW9ucy5mb3JFYWNoKChzdWI6IElvVFN1YnNjcmlwdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTdWJzY3JpYmluZyB0byB0b3BpYzonLCBzdWIudG9waWMpO1xuICAgICAgICAgICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5faW90U2VydmljZS5zdWJzY3JpYmUoc3ViLnRvcGljLCBzdWIub25NZXNzYWdlLCBzdWIub25FcnJvcikpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnTm90IGNvbm5lY3RlZCB0byBBV1MgSW9UOiBDYW50IHN1YnNjcmliZScpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHByb3RlY3RlZCB1cGRhdGVJbmNvbWluZ1NoYWRvdyhpbmNvbWluZywgc2hhZG93RmllbGQgPSBudWxsKSB7XG4gICAgICAgIGlmIChpbmNvbWluZy5oYXNPd25Qcm9wZXJ0eSgnc3RhdGUnKSAmJiBpbmNvbWluZy5zdGF0ZS5oYXNPd25Qcm9wZXJ0eSgncmVwb3J0ZWQnKSkge1xuICAgICAgICAgICAgaWYgKHNoYWRvd0ZpZWxkICE9PSBudWxsICYmIGluY29taW5nLnN0YXRlLnJlcG9ydGVkLmhhc093blByb3BlcnR5KHNoYWRvd0ZpZWxkKSkge1xuICAgICAgICAgICAgICAgIF8uZXh0ZW5kKHRoaXMucmVwb3J0ZWQsIGluY29taW5nLnN0YXRlLnJlcG9ydGVkW3NoYWRvd0ZpZWxkXSk7XG4gICAgICAgICAgICAgICAgLy8gdGhpcy5yZXBvcnRlZCA9IGluY29taW5nLnN0YXRlLnJlcG9ydGVkW3NoYWRvd0ZpZWxkXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgXy5leHRlbmQodGhpcy5yZXBvcnRlZCwgaW5jb21pbmcuc3RhdGUucmVwb3J0ZWQpO1xuICAgICAgICAgICAgICAgIC8vIHRoaXMucmVwb3J0ZWQgPSBpbmNvbWluZy5zdGF0ZS5yZXBvcnRlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5jb21pbmcuaGFzT3duUHJvcGVydHkoJ3N0YXRlJykgJiYgaW5jb21pbmcuc3RhdGUuaGFzT3duUHJvcGVydHkoJ2Rlc2lyZWQnKSkge1xuICAgICAgICAgICAgaWYgKHNoYWRvd0ZpZWxkICE9PSBudWxsICYmIGluY29taW5nLnN0YXRlLmRlc2lyZWQuaGFzT3duUHJvcGVydHkoc2hhZG93RmllbGQpKSB7XG4gICAgICAgICAgICAgICAgXy5leHRlbmQodGhpcy5kZXNpcmVkLCBpbmNvbWluZy5zdGF0ZS5kZXNpcmVkW3NoYWRvd0ZpZWxkXSk7XG4gICAgICAgICAgICAgICAgLy8gdGhpcy5kZXNpcmVkID0gaW5jb21pbmcuc3RhdGUuZGVzaXJlZFtzaGFkb3dGaWVsZF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF8uZXh0ZW5kKHRoaXMuZGVzaXJlZCwgaW5jb21pbmcuc3RhdGUuZGVzaXJlZCk7XG4gICAgICAgICAgICAgICAgLy8gdGhpcy5kZXNpcmVkID0gaW5jb21pbmcuc3RhdGUuZGVzaXJlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRMYXN0U3RhdGUodGhpbmdOYW1lLCBzaGFkb3dGaWVsZCA9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lvdFNlcnZpY2VcbiAgICAgICAgICAgIC5nZXRUaGluZ1NoYWRvdyh7XG4gICAgICAgICAgICAgICAgdGhpbmdOYW1lOiB0aGluZ05hbWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlSW5jb21pbmdTaGFkb3cocmVzdWx0LCBzaGFkb3dGaWVsZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHVwZGF0ZURlc2lyZWRTaGFkb3codGhpbmdOYW1lLCBkZXNpcmVkU3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lvdFNlcnZpY2UudXBkYXRlVGhpbmdTaGFkb3coe1xuICAgICAgICAgICAgdGhpbmdOYW1lOiB0aGluZ05hbWUsXG4gICAgICAgICAgICBwYXlsb2FkOiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgc3RhdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgZGVzaXJlZDogZGVzaXJlZFN0YXRlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19