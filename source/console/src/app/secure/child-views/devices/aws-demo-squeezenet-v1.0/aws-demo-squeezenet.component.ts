import { Component, Input, OnInit } from '@angular/core';

// Components
import { IoTPubSuberComponent } from '../../../common/iot-pubsuber.component';

// Models
import { Device } from 'src/app/models/device.model';

// Services
import { IOTService } from 'src/app/services/iot.service';

@Component({
    selector: 'app-aws-demo-squeezenet-v1-0',
    templateUrl: './aws-demo-squeezenet.component.html'
})
export class AWSDemoSqueezenetV10Component extends IoTPubSuberComponent implements OnInit {
    @Input()
    device: Device = new Device();
    latestData: any = null;

    constructor(private iotService: IOTService) {
        super(iotService);
    }

    ngOnInit() {
        this.subscribe([
            {
                topic: 'mtm/' + this.device.thingName + '/camera',
                onMessage: data => {
                    console.log('Data:', data.value);
                    this.latestData = data.value;
                },
                onError: err => {
                    console.error('Error:', err);
                }
            },
            {
                topic: 'mtm/' + this.device.thingName + '/logger',
                onMessage: data => {
                    // console.log('Logger:', data.value);
                    if (data.value.hasOwnProperty('type') && data.value.type === 'info') {
                        // console.log('INFO:', data.value.payload);
                    }
                    if (data.value.hasOwnProperty('type') && data.value.type === 'exception') {
                        console.error('EXCEPTION:', data.value.payload);
                    }
                },
                onError: err => {
                    console.error('Error:', err);
                }
            }
        ]);
    }
}
