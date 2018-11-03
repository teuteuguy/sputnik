import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs';
import swal from 'sweetalert2';

// Models
import { Device } from '../../models/device.model';
import { Solution } from '../../models/solution.model';
import { SolutionBlueprint } from '../../models/solution-blueprint.model';

// Services
import { DeviceService } from '../../services/device.service';
import { DeviceBlueprintService } from '../../services/device-blueprint.service';
import { SolutionService } from '../../services/solution.service';
import { SolutionBlueprintService } from '../../services/solution-blueprint.service';

import { _ } from 'underscore';

class DeviceBlueprintPossibleDevices {
    device: Device;
    deviceBlueprintId: string;
    list: Device[];
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

@Component({
    selector: 'app-root-solution-edit-modal',
    templateUrl: './solution.edit.modal.component.html'
})
export class SolutionEditModalComponent implements OnInit {
    @Input()
    element: Solution;
    @Input()
    modalType: string;
    @Input()
    cancelSubject: Subject<void>;
    @Input()
    submitSubject: Subject<any>;

    public deviceBlueprintPossibleDevices: DeviceBlueprintPossibleDevices[] = [];
    public solutionBlueprint: SolutionBlueprint = new SolutionBlueprint();

    constructor(
        private solutionService: SolutionService,
        private solutionBlueprintService: SolutionBlueprintService,
        private deviceService: DeviceService,
        private deviceBlueprintService: DeviceBlueprintService
    ) {
        this.element = new Solution({
            id: 'new',
            name: 'new'
        });
    }

    ngOnInit() {
        // this.deviceBlueprintService.blueprintsObservable$.subscribe(message => {
        // Promise.all(
        //     this.element.deviceIds.map(deviceId => {
        //         return this.deviceService.getDevice(deviceId).then(device => {
        //             // console.log('Found device:', device);
        //             return this.deviceService
        //                 .listRecursive('listDevicesWithDeviceBlueprint', device.deviceBlueprintId, 10, null)
        //                 .then(devices => {
        //                     // console.log(this.element.id, this.element.name, this.element.description, this.element.deviceIds);
        //                     return new DeviceBlueprintPossibleDevices({
        //                         thingId: deviceId,
        //                         device: device,
        //                         list: devices
        //                     });
        //                 });
        //         });
        //     })
        // )
        let _solutionBlueprint;
        this.solutionBlueprintService
            .get(this.element.solutionBlueprintId)
            .then((solutionBlueprint: SolutionBlueprint) => {
                _solutionBlueprint = solutionBlueprint;
                return Promise.all(solutionBlueprint.spec.devices.map((specDevice, index) => {
                        return this.deviceService
                            .listRecursive(
                                'listDevicesWithDeviceBlueprint',
                                specDevice.deviceBlueprintId,
                                10,
                                null
                            )
                            .then((devices: Device[]) => {
                                if (this.element.deviceIds[index]) {
                                    return this.deviceService
                                        .getDevice(this.element.deviceIds[index])
                                        .then((device: Device) => {
                                            return new DeviceBlueprintPossibleDevices({
                                                deviceBlueprintId: specDevice.deviceBlueprintId,
                                                device: device,
                                                list: devices
                                            });
                                        });
                                } else {
                                    return new DeviceBlueprintPossibleDevices({
                                        deviceBlueprintId: specDevice.deviceBlueprintId,
                                        device: null,
                                        list: devices
                                    });
                                }
                            });
                    })
                );
            })
            .then((results: DeviceBlueprintPossibleDevices[]) => {
                console.log(results);
                this.deviceBlueprintPossibleDevices = results;
                this.solutionBlueprint = new SolutionBlueprint(_solutionBlueprint);
            })
            .catch(err => console.error(err));
    }

    submit() {
        // console.log(this.element, this.deviceBlueprintPossibleDevices, this.solutionBlueprint);
        this.solutionService
            .update(
                this.element.id,
                this.element.name,
                this.element.description,
                this.element.deviceIds
                // this.deviceBlueprintPossibleDevices.map(d => d.device.thingId)
            )
            .then((solution: Solution) => {
                console.log(solution);
                this.submitSubject.next({ data: solution, error: null });
            })
            .catch(err => {
                console.error(err);
                this.submitSubject.next({ data: this.element, error: err });
            });
    }

    cancel() {
        this.cancelSubject.next();
    }

    deviceBlueprintNameFor(deviceBlueprintId: string) {
        return _.find(this.deviceBlueprintService.deviceBlueprints, db => {
            return db.id === deviceBlueprintId;
        }).name;
    }

    refreshSpecs() {
        this.solutionService
            .refreshSolution(this.element.id)
            .then(result => {
                console.log(result);
                swal({
                    timer: 1000,
                    title: 'Success',
                    type: 'success',
                    showConfirmButton: false
                }).then(() => {
                    this.cancelSubject.next();
                });
            })
            .catch(err => {
                console.error(err);
                swal('Oops...', 'Something went wrong!', 'error');
            });
    }
}
