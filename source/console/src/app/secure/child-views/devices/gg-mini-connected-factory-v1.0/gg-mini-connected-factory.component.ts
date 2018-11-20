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

    private shadowField = 'factoryCamera';

    latestInference: any = null;

    constructor(private iotService: IOTService) {
        super(iotService);
    }

    ngOnInit() {
        this.subscribe([
            {
                topic: '$aws/things/' + this.device.thingName + '/shadow/update/accepted',
                onMessage: data => {
                    this.updateIncomingShadow(data.value, this.shadowField);
                },
                onError: err => {
                    console.error('Error:', err);
                }
            },
            {
                topic: 'mtm/' + this.device.thingName + '/inference',
                onMessage: data => {
                    console.log('Inference:', data.value);
                    data.value.payload.probability = Math.floor(data.value.payload.probability * 1000) / 10;
                    this.latestInference = data.value.payload;
                    // this.latestInference.advice = 'inconclusive';
                    // if (this.latestInference.probability > 0.8) {
                    //     if (this.latestInference.category === 'hat') {
                    //         this.latestInference.advice = 'safe';
                    //     } else if (this.latestInference.category === 'nohat') {
                    //         this.latestInference.advice = 'not save';
                    //     }
                    // }
                },
                onError: err => {
                    console.error('Error:', err);
                }
            },
            {
                topic: 'mtm/' + this.device.thingName + '/logger',
                onMessage: data => {
                    // console.log('Admin:', data.value);
                },
                onError: err => {
                    console.error('Error:', err);
                }
            }
        ]);

        this.getLastState(this.device.thingName, this.shadowField);
    }

    desiredStateChange(field) {
        let update = false;
        if (field === 'capture') {
            this.desired.capture = this.desired.capture === 'On' ? 'Off' : 'On';
            update = true;
        }
        if (field === 's3Upload') {
            this.desired.s3Upload = this.desired.s3Upload === 'On' ? 'Off' : 'On';
            update = true;
        }
        if (update) {
            this.iotService
                .updateThingShadow({
                    thingName: this.device.thingName,
                    payload: JSON.stringify({
                        state: {
                            desired: {
                                factoryCamera: this.desired
                            }
                        }
                    })
                })
                .then(result => {
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
}
