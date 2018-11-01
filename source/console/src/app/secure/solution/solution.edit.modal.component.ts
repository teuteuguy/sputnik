import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs';
import swal from 'sweetalert2';

// Models
import { Device } from '../../models/device.model';
import { Solution } from '../../models/solution.model';

// Services
import { DeviceService } from '../../services/device.service';
import { DeviceBlueprintService } from '../../services/device-blueprint.service';
import { SolutionService } from '../../services/solution.service';

import { _ } from 'underscore';

class DeviceBlueprintPossibleDevices {
    thingId: string;
    device: Device;
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

    constructor(
        private solutionService: SolutionService,
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
        Promise.all(
            this.element.thingIds.map(thingId => {
                return this.deviceService.getDevice(thingId).then(device => {
                    // console.log('Found device:', device);
                    return this.deviceService
                        .listRecursive('listDevicesWithDeviceBlueprint', device.deviceBlueprintId, 10, null)
                        .then(devices => {
                            // console.log(this.element.id, this.element.name, this.element.description, this.element.thingIds);
                            return new DeviceBlueprintPossibleDevices({
                                thingId: thingId,
                                device: device,
                                list: devices
                            });
                        });
                });
            })
        )
            .then((results: DeviceBlueprintPossibleDevices[]) => (this.deviceBlueprintPossibleDevices = results))
            .catch(err => console.error(err));
        // });
    }

    submit() {
        // console.log(this.element.thingIds, this.deviceBlueprintPossibleDevices);
        // console.log(this.deviceBlueprintPossibleDevices.map(d => d.thingId));
        this.solutionService
            .update(
                this.element.id,
                this.element.name,
                this.element.description,
                this.deviceBlueprintPossibleDevices.map(d => d.thingId)
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
