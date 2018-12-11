import { Component, Input, OnInit, NgZone } from '@angular/core';

// Components
import { IoTPubSuberComponent } from '../../../common/iot-pubsuber.component';

// Models
import { Device } from '@models/device.model';

// Services
import { IOTService } from '@services/iot.service';

@Component({
    selector: 'app-rpi3-sense-hat-demo-v1-0',
    templateUrl: './rpi3-sense-hat-demo-v1-0.component.html'
})
export class RPI3SenseHatDemoV10Component extends IoTPubSuberComponent implements OnInit {
    @Input() device: Device = new Device();

    private shadowObject = 'sense-hat';

    constructor(private iotService: IOTService, private ngZone: NgZone) {
        super(iotService);
    }

    ngOnInit() {
        function defaultErrorCallback(err) {
            console.error('Error:', err);
        }

        this.subscribe([
            {
                topic: '$aws/things/' + this.device.thingName + '/shadow/update/accepted',
                onMessage: data => {
                    this.ngZone.run(() => {
                        this.updateIncomingShadow(data.value);
                    });
                },
                onError: defaultErrorCallback
            },
            {
                topic: 'mtm/' + this.device.thingName + '/sensors',
                onMessage: data => {
                    // this.sensors.speed = data.value;
                },
                onError: defaultErrorCallback
            }
        ]);

        this.getLastState(this.device.thingName, this.shadowObject).then(data => {
            // console.log('getLastState:', data);
            // console.log(this.reported);
        });
    }

    desiredStateChange(button) {
        // const desired = {
        //     mode: button.mode,
        //     speed: button.speed
        // };
        // this.iotService
        //     .updateThingShadow({
        //         thingName: this.device.thingName,
        //         payload: JSON.stringify({
        //             state: {
        //                 desired: desired
        //             }
        //         })
        //     })
        //     .then(result => {
        //         this.getLastState(this.device.thingName).then(data => {
        //             // this.ngZone.run(() => {
        //             //     // console.log('getLastState here:', data);
        //             // });
        //         });
        //         // this.getLastState();
        //         // console.log('updateThingShadow:', result);
        //         // this.shadow = result;
        //         // if (
        //         //     this.shadow &&
        //         //     this.shadow.hasOwnProperty('state') &&
        //         //     this.shadow.state.hasOwnProperty('desired') &&
        //         //     this.shadow.state.desired.hasOwnProperty('simpleCamera')
        //         // ) {
        //         //     this.simpleCamera = this.shadow.state.desired.simpleCamera;
        //         // }
        //         return result;
        //     })
        //     .catch(err => {
        //         console.error(err);
        //     });
    }

    public getRGBString(value) {
        if (value === 0) {
            return `rgb(${this.desired.color.off[0]}, ${this.desired.color.off[1]}, ${this.desired.color.off[2]})`;
        } else {
            return `rgb(${this.desired.color.on[0]}, ${this.desired.color.on[1]}, ${this.desired.color.on[2]})`;
        }
    }

    public changeLed(i, j) {

        this.desired.led[i * 8 + j] = 1 - this.desired.led[i * 8 + j];

        const desired = {};
        desired[this.shadowObject] = {};
        desired[this.shadowObject].led = this.desired.led;

        this.iotService
            .updateThingShadow({
                thingName: this.device.thingName,
                payload: JSON.stringify({
                    state: {
                        desired: desired
                    }
                })
            })
            .then(result => {
                this.getLastState(this.device.thingName, this.shadowObject).then(data => {
                    // this.ngZone.run(() => {
                    //     // console.log('getLastState here:', data);
                    // });
                });
                // this.getLastState();
                // console.log('updateThingShadow:', result);
                // this.shadow = result;
                // if (
                //     this.shadow &&
                //     this.shadow.hasOwnProperty('state') &&
                //     this.shadow.state.hasOwnProperty('desired') &&
                //     this.shadow.state.desired.hasOwnProperty('simpleCamera')
                // ) {
                //     this.simpleCamera = this.shadow.state.desired.simpleCamera;
                // }
                return result;
            })
            .catch(err => {
                console.error(err);
            });
    }
}
