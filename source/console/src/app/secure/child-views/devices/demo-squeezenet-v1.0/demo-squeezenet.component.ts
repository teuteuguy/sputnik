import { Component, Input, OnInit } from '@angular/core';

// Components
import { IoTPubSuberComponent } from '@common-secure/iot-pubsuber.component';

// Models
import { Device } from '@models/device.model';

// Services
import { IOTService } from '@services/iot.service';

@Component({
    selector: 'app-demo-squeezenet-v1-0',
    templateUrl: './demo-squeezenet.component.html'
})
export class DemoSqueezenetV10Component extends IoTPubSuberComponent implements OnInit {
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
                    // console.log('Data:', data.value);
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
