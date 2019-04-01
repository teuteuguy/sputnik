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

    public sensors = {
        humidity: 0,
        north: 0,
        pressure: 0,
        temperature: {
            temp: 0,
            1: 0,
            2: 0
        }
        // ,
        // accel: {
        //     yaw: 0,
        //     roll: 0,
        //     pitch: 0
        // },
        // orientation: {
        //     yaw: 0,
        //     roll: 0,
        //     pitch: 0
        // }
    };

    public northOpts = {
        angle: -0.5,
        lineWidth: 0.09,
        radiusScale: 1.1,
        pointer: { length: 0.64, strokeWidth: 0.049, color: '#000000' },
        limitMax: false,
        limitMin: false,
        colorStart: '#009efb',
        colorStop: '#009efb',
        strokeColor: '#E0E0E0',
        generateGradient: true,
        highDpiSupport: true
    };

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
                topic: 'sputnik/' + this.device.thingName + '/sensors',
                onMessage: data => {
                    this.sensors = data.value;
                    this.sensors.temperature.temp =
                        Math.floor(((this.sensors.temperature['1'] + this.sensors.temperature['2']) * 10) / 2) / 10;
                    this.sensors.humidity = Math.floor(this.sensors.humidity * 10) / 10;
                    this.sensors.pressure = Math.floor(this.sensors.pressure * 10) / 10;
                    // console.log(this.sensors.north);
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
