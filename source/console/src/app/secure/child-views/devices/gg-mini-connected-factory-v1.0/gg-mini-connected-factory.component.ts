import { Component, Input, OnInit } from '@angular/core';

// Components
import { IoTPubSuberComponent } from '../../../common/iot-pubsuber.component';

// Models
import { Device } from 'src/app/models/device.model';

// Services
import { IOTService } from 'src/app/services/iot.service';

@Component({
    selector: 'app-gg-mini-connected-factory-v1-0',
    templateUrl: './gg-mini-connected-factory.component.html'
})
export class GGMiniConnectedFactoryV10Component extends IoTPubSuberComponent implements OnInit {
    @Input()
    device: Device = new Device();

    latestInference: any = null;

    constructor(private iotService: IOTService) {
        super(iotService);
    }

    ngOnInit() {
        this.subscribe([
            {
                topic: 'mtm/' + this.device.thingName + '/inference',
                onMessage: data => {
                    // console.log('Inference:', data.value);
                    data.value.payload.probability = Math.floor(data.value.payload.probability * 1000) / 10;
                    this.latestInference = data.value.payload;
                },
                onError: err => {
                    console.error('Error:', err);
                }
            },
            {
                topic: 'mtm/' + this.device.thingName + '/admin',
                onMessage: data => {
                    // console.log('Admin:', data.value);
                },
                onError: err => {
                    console.error('Error:', err);
                }
            }
        ]);
    }
}
