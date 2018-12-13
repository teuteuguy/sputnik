import { Component, Input, OnInit, NgZone } from '@angular/core';

// Components
import { IoTPubSuberComponent } from '../../../common/iot-pubsuber.component';

// Models
import { Device } from '@models/device.model';

// Services
import { IOTService } from '@services/iot.service';

@Component({
    selector: 'app-3d-belt-serial-v1-0',
    templateUrl: './3d-belt-serial-v1-0.component.html'
})
export class AFR3DBeltSerialV10Component extends IoTPubSuberComponent implements OnInit {
    @Input() device: Device = new Device();

    public sensors: any = {
        speed: {
            rpm: 0
        },
        proximity: {
            sensor1: 0,
            sensor2: 0
        }
    };

    public buttons = [
        {
            value: -2,
            mode: 1,
            speed: 2
        },
        {
            value: -1,
            mode: 1,
            speed: 1
        },
        {
            value: 0,
            mode: 2,
            speed: 1
        },
        {
            value: 1,
            mode: 3,
            speed: 1
        },
        {
            value: 2,
            mode: 3,
            speed: 2
        }
    ];

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
                        console.log(data.value.state.reported);
                        this.updateIncomingShadow(data.value);
                    });
                },
                onError: defaultErrorCallback
            },
            {
                topic: 'mtm/' + this.device.thingName + '/sensors/speed',
                onMessage: data => {
                    this.sensors.speed = data.value;
                },
                onError: defaultErrorCallback
            },
            {
                topic: 'mtm/' + this.device.thingName + '/sensors/chassis',
                onMessage: data => {
                    this.sensors.chassis = data.value;
                },
                onError: defaultErrorCallback
            },
            {
                topic: 'mtm/' + this.device.thingName + '/sensors/proximity',
                onMessage: data => {
                    this.sensors.proximity = data.value;
                    console.log(this.sensors.proximity);
                },
                onError: defaultErrorCallback
            }
        ]);

        this.getLastState(this.device.thingName).then(data => {
            // console.log('getLastState:', data);
        });
    }

    desiredStateChange(button) {
        const desired = {
            mode: button.mode,
            speed: button.speed
        };

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
                this.getLastState(this.device.thingName).then(data => {
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

    beltValueFor(mode, speed) {
        if (mode === 1 && speed === 2) {
            return -2;
        } else if (mode === 1 && speed === 1) {
            return -1;
        } else if (mode === 2) {
            return 0;
        } else if (mode === 3 && speed === 1) {
            return 1;
        } else if (mode === 3 && speed === 2) {
            return 2;
        }
    }
}
