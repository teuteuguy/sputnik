import { Component, Input, OnInit } from '@angular/core';

// Components
import { IoTPubSuberComponent } from '../../../common/iot-pubsuber.component';

// Models
import { Device } from 'src/app/models/device.model';

// Services
import { IOTService } from 'src/app/services/iot.service';

@Component({
    selector: 'app-aws-deeplens-image-capture-v1',
    templateUrl: './aws-deeplens-image-capture.component.html'
})
export class AWSDeeplensImageCaptureV10Component extends IoTPubSuberComponent implements OnInit {
    @Input()
    device: Device = new Device();

    latestData: any = null;
    shadow: any = {};

    constructor(private iotService: IOTService) {
        super(iotService);
    }

    ngOnInit() {
        this.subscribe([
            {
                topic: 'mtm/' + this.device.thingName + '/admin',
                onMessage: data => {
                    console.log('Data:', data.value);
                    this.latestData = data.value.payload;
                },
                onError: err => {
                    console.error('Error:', err);
                }
            }
        ]);

        this.iotService.getThingShadow({
            thingName: this.device.thingName
        }).then(result => {
            console.log('shadow:', result);
            this.shadow = result;
        }).catch(err => {
            console.error(err);
        });
    }
}
