import { Component, Input, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';

// Components
import { IoTPubSuberComponent } from '../../../common/iot-pubsuber.component';

// Models
import { Device } from '@models/device.model';
import { DeviceBlueprint } from '@models/device-blueprint.model';

// Services
import { IoTService } from '@services/iot.service';
import { AppSyncService } from '@services/appsync.service';

@Component({
    selector: 'app-default',
    template: `
        <app-widgets *ngIf="widgets" [widgets]="widgets" [parent]="self"></app-widgets>
    `
})
export class DefaultComponent extends IoTPubSuberComponent implements OnInit {
    @Input() device: Device = new Device();

    private widgetSubscriptionSubjects: any = {};
    public widgetSubscriptionObservables: any = {};

    constructor(private iotService: IoTService, private appSyncService: AppSyncService) {
        super(iotService);
    }

    public widgets: any[];
    public self: any;

    ngOnInit() {
        const self = this;

        function defaultErrorCallback(err) {
            console.error('Error:', err);
        }

        self.appSyncService
            .getDeviceBlueprint(self.device.deviceBlueprintId)
            .then((deviceBlueprint: DeviceBlueprint) => {
                if (deviceBlueprint) {
                    self.getLastState(self.device.thingName).then(data => {
                        const subscriptions = [];

                        if (deviceBlueprint && deviceBlueprint.spec.hasOwnProperty('View')) {
                            self.self = self;

                            const view = JSON.parse(
                                JSON.stringify(deviceBlueprint.spec.View)
                                    .split('[CORE]')
                                    .join(self.device.thingName)
                                    .split('[THING_NAME]')
                                    .join(self.device.thingName)
                            );

                            if (view.hasOwnProperty('widgets')) {
                                self.widgets = view.widgets;
                            }
                            if (view.hasOwnProperty('subscriptions')) {
                                const subs = view.subscriptions;
                                for (let ref in subs) {
                                    if (subs.hasOwnProperty(ref)) {
                                        const topic = subs[ref];
                                        console.log('Subscription:', ref, topic);
                                        self.widgetSubscriptionSubjects[ref] = new Subject<any>();
                                        self.widgetSubscriptionObservables[ref] = self.widgetSubscriptionSubjects[ref].asObservable();
                                        subscriptions.push({
                                            topic: subs[ref],
                                            onMessage: message => {
                                                self.widgetSubscriptionSubjects[ref].next(message.value);
                                            },
                                            onError: defaultErrorCallback
                                        });
                                    }
                                }
                            }
                        }

                        // subscriptions.push({
                        //     topic: '$aws/things/' + self.device.thingName + '/shadow/update/accepted',
                        //     onMessage: message => {
                        //         self.updateIncomingShadow(message.value);
                        //     },
                        //     onError: defaultErrorCallback
                        // });

                        self.subscribe(subscriptions);
                    });
                }
            })
            .catch(defaultErrorCallback);
    }
}
