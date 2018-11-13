import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

// Services
import { IOTService } from 'src/app/services/iot.service';

export class IoTSubscription {
    topic: string;
    onMessage: (data: any) => void;
    onError: (data: any) => void;
}

@Component({
    selector: 'app-root-iot-pubsuber',
    template: ''
})
export class IoTPubSuberComponent implements OnDestroy {
    private subscriptions: Subscription = new Subscription();
    private iotSubscriptions: IoTSubscription[];

    constructor(private _iotService: IOTService) {}

    public subscribe(iotSubscriptions: IoTSubscription[]) {
        this.iotSubscriptions = iotSubscriptions;
        this._iotService.connectionObservable$.subscribe((connected: boolean) => {
            console.log('Change of connection state: setting subscriptions', connected);
            this.setSubscriptions();
        });
        this.setSubscriptions();
    }

    private setSubscriptions() {
        if (this._iotService.isConnected) {
            console.log('Connected to AWS IoT');
            this.iotSubscriptions.forEach((sub: IoTSubscription) => {
                console.log('Subscribing to topic:', sub.topic);
                this.subscriptions.add(this._iotService.subscribe(sub.topic, sub.onMessage, sub.onError));
            });
        } else {
            console.log('Not connected to AWS IoT: Cant subscribe');
        }
    }

    ngOnDestroy() {
        console.log('Unsubscribing to topics');
        this.subscriptions.unsubscribe();
    }
}
