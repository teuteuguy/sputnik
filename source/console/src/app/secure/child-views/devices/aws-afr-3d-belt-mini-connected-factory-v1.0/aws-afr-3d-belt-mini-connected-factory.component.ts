import { Component, Input, OnInit } from '@angular/core';

// Components
import { IoTPubSuberComponent } from '../../../common/iot-pubsuber.component';

// Models
import { Device } from 'src/app/models/device.model';

// Services
import { IOTService } from 'src/app/services/iot.service';

@Component({
    selector: 'app-aws-afr-3d-belt-mini-connected-factory-v1-0',
    templateUrl: './aws-afr-3d-belt-mini-connected-factory.component.html'
})
export class AWSAFR3DBeltMiniConnectedFactoryV10Component extends IoTPubSuberComponent implements OnInit {
    @Input() device: Device = new Device();

    constructor(private iotService: IOTService) {
        super(iotService);
    }

    ngOnInit() {
        this.subscribe([
            {
                topic: 'mtm/' + this.device.thingName + '/sensors',
                onMessage: data => {
                    // console.log('Sensors:', data.value);
                },
                onError: err => {
                    console.error('Error:', err);
                }
            }
        ]);
    }
}
