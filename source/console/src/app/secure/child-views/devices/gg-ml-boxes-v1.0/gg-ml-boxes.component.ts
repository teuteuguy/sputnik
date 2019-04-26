import { Component, Input, OnInit } from '@angular/core';

// Components
import { IoTPubSuberComponent } from '@common-secure/iot-pubsuber.component';

// Models
import { Device } from '@models/device.model';

// Services
import { IoTService } from '@services/iot.service';

@Component({
    selector: 'app-gg-ml-boxes-v1-0',
    templateUrl: './gg-ml-boxes.component.html'
})
export class GGMLBoxesV10Component extends IoTPubSuberComponent implements OnInit {
    @Input()
    device: Device = new Device();

    private shadowField = 'inferenceCamera';

    latestInference: any = null;

    constructor(private iotService: IoTService) {
        super(iotService);
    }

    ngOnInit() {
        this.subscribe([
            {
                topic: '$aws/things/' + this.device.thingName + '/shadow/update/accepted',
                onMessage: data => {
                    console.log(data.value);
                    this.updateIncomingShadow(data.value, this.shadowField);
                },
                onError: err => {
                    console.error('Error:', err);
                }
            },
            {
                topic: 'sputnik/' + this.device.thingName + '/inference',
                onMessage: data => {
                    // console.log('Inference:', data.value);
                    // console.log(data.value.payload.fps);
                    data.value.probability = data.value.probability;
                    this.latestInference = data.value;
                },
                onError: err => {
                    console.error('Error:', err);
                }
            },
            {
                topic: 'sputnik/' + this.device.thingName + '/logger',
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

    desiredStateChange(event) {
        event.preventDefault();
        event.stopPropagation();
        const field = event.target.id;
        let update = false;
        const desired = {};
        if (field === 'capture') {
            desired['capture'] = this.desired.capture === 'On' ? 'Off' : 'On';
            update = true;
        }
        if (field === 'threaded') {
            desired['threaded'] = this.desired.threaded === 'On' ? 'Off' : 'On';
            update = true;
        }
        if (field === 's3Upload') {
            desired['s3Upload'] = this.desired.s3Upload === 'On' ? 'Off' : 'On';
            update = true;
        }
        if (update) {
            console.log('desired', desired);
            this.iotService
                .updateThingShadow({
                    thingName: this.device.thingName,
                    payload: JSON.stringify({
                        state: {
                            desired: {
                                inferenceCamera: desired
                            }
                        }
                    })
                })
                .then(result => {
                    console.log(result);
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

    betterProb(value) {
        return Math.floor(value * 10000) / 100;
    }

    maxProb(results) {
        let result = {
            category: '',
            probability: 0
        };
        for (let key in results) {
            if (results.hasOwnProperty(key)) {
                // console.log(key, dictionary[key]);
                if (result.probability <= results[key]) {
                    result.category = key;
                    result.probability = results[key];
                }
            }
        }
        result.probability = Math.floor(result.probability * 10000) / 100;
        return result;
    }
}
