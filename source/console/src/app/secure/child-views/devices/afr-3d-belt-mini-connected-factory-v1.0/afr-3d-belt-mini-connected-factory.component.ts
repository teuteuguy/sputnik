import { Component, Input, OnInit, NgZone } from '@angular/core';

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
        this.subscribe([
            {
                topic: '$aws/things/' + this.device.thingName + '/shadow/update/accepted',
                onMessage: data => {
                    console.log('Shadow', data);
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
                    console.log('Sensors:', this.sensors);
                },
                onError: err => {
                    console.error('Error:', err);
                }
            }
        ]);

        this.getLastState(this.device.thingName).then(data => {
            console.log('getLastState:', data);
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
                    this.ngZone.run(() => {
                        console.log('getLastState here:', data);
                    });
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
