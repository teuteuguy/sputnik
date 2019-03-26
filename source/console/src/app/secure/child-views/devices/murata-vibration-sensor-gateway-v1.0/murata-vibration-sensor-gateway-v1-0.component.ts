import { Component, Input, OnInit, NgZone } from '@angular/core';
import { NgForm } from '@angular/forms';

// Components
import { IoTPubSuberComponent } from '../../../common/iot-pubsuber.component';

// Models
import { Device } from '@models/device.model';

// Services
import { IOTService } from '@services/iot.service';

declare var $: any;

@Component({
    selector: 'app-murata-vibration-sensor-gateway-v1-0',
    templateUrl: './murata-vibration-sensor-gateway-v1-0.component.html'
})
export class MurataVibrationSensorGatewayV10Component extends IoTPubSuberComponent implements OnInit {
    @Input() device: Device = new Device();

    constructor(private iotService: IOTService, private ngZone: NgZone) {
        super(iotService);
    }

    ngOnInit() {

        const self = this;

        function defaultErrorCallback(err) {
            console.error('Error:', err);
        }

        self.getLastState(self.device.thingName).then(data => {

            // console.log('getLastState:', data, self.desired);

            self.subscribe([
                {
                    topic: '$aws/things/' + self.device.thingName + '/shadow/update/accepted',
                    onMessage: message => {
                        self.ngZone.run(() => {
                            self.updateIncomingShadow(message.value);
                        });
                    },
                    onError: defaultErrorCallback
                },
                {
                    topic: 'murata/' + self.device.thingName + '/sensordata',
                    onMessage: message => {
                        console.log('Data:', message);
                    },
                    onError: defaultErrorCallback
                }
            ]);
        });
    }

    private changeMode(mode) {
        this.iotService
            .updateThingShadow({
                thingName: this.device.thingName,
                payload: JSON.stringify({
                    state: {
                        desired: {
                            mode: mode
                        }
                    }
                })
            })
            .then(result => {
                // this.getLastState(this.device.thingName).then(data => {
                //     console.log('getLastState:', data, this.desired);
                // });
                return result;
            })
            .catch(err => {
                console.error(err);
            });
    }

    init() {
        this.changeMode('init');
    }

    scan() {
        this.changeMode('scan');
    }

}
