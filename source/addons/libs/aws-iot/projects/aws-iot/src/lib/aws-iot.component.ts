import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

// Services
import { AddonIoTService } from './aws-iot.service';

import { _ } from 'underscore';

export class IoTSubscription {
  topic: string;
  onMessage: (data: any) => void;
  onError: (data: any) => void;
}

@Component({
    selector: 'iot-aws-iot-component',
    template: ''
})
export class AddonIoTComponent implements OnDestroy {
    private subscriptions: Subscription = new Subscription();
    private iotSubscriptions: IoTSubscription[];

    public desired: any = {};
    public reported: any = {};

    constructor(private _iotService: AddonIoTService) {}

    ngOnDestroy() {
        console.log('Unsubscribing to topics');
        this.subscriptions.unsubscribe();
    }

    protected subscribe(iotSubscriptions: IoTSubscription[]) {
        this.iotSubscriptions = iotSubscriptions;
        this._iotService.connectionObservable$.subscribe((connected: boolean) => {
            console.log('Change of connection state: setting subscriptions', connected);
            this.setSubscriptions();
        });
        this.setSubscriptions();
    }

    private setSubscriptions() {
        if (this._iotService.isConnected) {
            this.iotSubscriptions.forEach((sub: IoTSubscription) => {
                console.log('Subscribing to topic:', sub.topic);
                this.subscriptions.add(this._iotService.subscribe(sub.topic, sub.onMessage, sub.onError));
            });
        } else {
            console.log('Not connected to AWS IoT: Cant subscribe');
        }
    }
    protected updateIncomingShadow(incoming, shadowField = null) {
        if (incoming.hasOwnProperty('state') && incoming.state.hasOwnProperty('reported')) {
            if (shadowField !== null && incoming.state.reported.hasOwnProperty(shadowField)) {
                _.extend(this.reported, incoming.state.reported[shadowField]);
                // this.reported = incoming.state.reported[shadowField];
            } else {
                _.extend(this.reported, incoming.state.reported);
                // this.reported = incoming.state.reported;
            }
        }
        if (incoming.hasOwnProperty('state') && incoming.state.hasOwnProperty('desired')) {
            if (shadowField !== null && incoming.state.desired.hasOwnProperty(shadowField)) {
                _.extend(this.desired, incoming.state.desired[shadowField]);
                // this.desired = incoming.state.desired[shadowField];
            } else {
                _.extend(this.desired, incoming.state.desired);
                // this.desired = incoming.state.desired;
            }
        }
    }

    protected getLastState(thingName, shadowField = null) {
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

    protected updateDesiredShadow(thingName, desiredState) {
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
