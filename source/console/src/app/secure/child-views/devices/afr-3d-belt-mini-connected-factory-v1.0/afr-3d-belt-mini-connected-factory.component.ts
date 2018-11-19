import { Component, Input, OnInit } from '@angular/core';

// Components
import { IoTPubSuberComponent } from '../../../common/iot-pubsuber.component';

// Models
import { Device } from 'src/app/models/device.model';

// Services
import { IOTService } from 'src/app/services/iot.service';

@Component({
    selector: 'app-afr-3d-belt-mini-connected-factory-v1-0',
    templateUrl: './afr-3d-belt-mini-connected-factory.component.html'
})
export class AFR3DBeltMiniConnectedFactoryV10Component extends IoTPubSuberComponent implements OnInit {
    @Input() device: Device = new Device();

    public sensors: any = {};

    constructor(private iotService: IOTService) {
        super(iotService);
    }

    ngOnInit() {
        this.subscribe([
            {
                topic: '$aws/things/' + this.device.thingName + '/shadow/update/accepted',
                onMessage: data => {
                    this.updateIncomingShadow(data.value);
                },
                onError: err => {
                    console.error('Error:', err);
                }
            },
            {
                topic: 'mtm/' + this.device.thingName + '/sensors',
                onMessage: data => {
                    this.sensors = data.value;
                    // console.log('Sensors:', data.value);
                },
                onError: err => {
                    console.error('Error:', err);
                }
            }
        ]);

        this.getLastState(this.device.thingName).then(data => {
            console.log(data);
        });
    }
}
