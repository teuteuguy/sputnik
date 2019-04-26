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
                self.getLastState(self.device.thingName).then(data => {
                    self.subscribe([
                        {
                            topic: '$aws/things/' + self.device.thingName + '/shadow/update/accepted',
                            onMessage: message => {
                                self.updateIncomingShadow(message.value);
                            },
                            onError: defaultErrorCallback
                        }
                    ]);

                    if (deviceBlueprint && deviceBlueprint.spec.hasOwnProperty('view')) {
                        self.self = self;
                        self.widgets = deviceBlueprint.spec.widgets;
                    }
                });
            })
            .catch(defaultErrorCallback);
    }
}
