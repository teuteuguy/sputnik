import { Component, Input, OnInit, OnChanges } from '@angular/core';

// Models
import { Device } from '@models/device.model';
import { Solution } from '@models/solution.model';
import { SolutionBlueprint } from '@models/solution-blueprint.model';

// Services
import { DeviceService } from '@services/device.service';
import { SolutionBlueprintService } from '@services/solution-blueprint.service';
import { IOTService } from '@services/iot.service';

@Component({
    selector: 'app-mini-connected-factory-v1',
    templateUrl: './mini-connected-factory.component.html'
})
export class MiniConnectedFactoryV10Component implements OnInit, OnChanges {
    @Input()
    solution: Solution = new Solution();

    public devices: Device[] = [new Device(), new Device()];
    public inferenceDecision: any = {};

    constructor(private deviceService: DeviceService, private iotService: IOTService) {}

    ngOnInit() {
        console.log('ngInit: ', this.solution.id);
        // We know that Device 0 is a belt.
        // We know that Device 1 is a camera.
        // We know this from the blueprint.
        Promise.all(
            this.solution.deviceIds.map((deviceId, index) => {
                return this.deviceService.getDevice(deviceId);
            })
        )
            .then(results => {
                this.devices = results;
                if (this.devices[1] && this.devices[1].thingName) {
                    this.iotService
                        .getThingShadow({
                            thingName: this.devices[1].thingName
                        })
                        .then(shadow => {
                            console.log(shadow.state.desired.inferenceDecision);
                            this.inferenceDecision = shadow.state.desired.inferenceDecision;
                        })
                        .catch(err => {
                            console.error(err);
                        });
                }
            })
            .catch(err => {
                console.error(err);
            });
    }

    ngOnChanges() {
        this.ngOnInit();
    }

    setCategory(category) {
        this.iotService
            .updateThingShadow({
                thingName: this.devices[1].thingName,
                payload: JSON.stringify({
                    state: {
                        desired: {
                            inferenceDecision: {
                                category: category
                            }
                        }
                    }
                })
            })
            .then(data => {
                console.log(data);
            })
            .catch(err => {
                console.error(err);
            });
    }
}
