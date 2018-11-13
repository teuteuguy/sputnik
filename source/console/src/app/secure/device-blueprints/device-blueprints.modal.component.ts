import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs';

// Models
import { DeviceBlueprint } from '../../models/device-blueprint.model';

// Services
import { DeviceBlueprintService } from '../../services/device-blueprint.service';
import { DeviceTypeService } from '../../services/device-type.service';

@Component({
    selector: 'app-root-device-blueprints-modal',
    templateUrl: './device-blueprints.modal.component.html'
})
export class DeviceBlueprintsModalComponent {
    @Input()
    element: DeviceBlueprint;
    @Input()
    modalType: string;
    @Input()
    cancelSubject: Subject<void>;
    @Input()
    submitSubject: Subject<any>;

    constructor(private deviceBlueprintService: DeviceBlueprintService, public deviceTypeService: DeviceTypeService) {
        this.element = new DeviceBlueprint({
            id: 'new',
            name: 'new'
        });
    }

    submit() {
        if (this.modalType === 'create') {
            this.deviceBlueprintService
                .add(this.element)
                .then(deviceBlueprint => {
                    console.log(deviceBlueprint);
                    this.submitSubject.next({ data: deviceBlueprint, error: null });
                })
                .catch(err => {
                    console.error(err);
                    this.submitSubject.next({ data: this.element, error: err });
                });
        } else if (this.modalType === 'edit') {
            this.deviceBlueprintService
                .update(this.element)
                .then(deviceBlueprint => {
                    console.log(deviceBlueprint);
                    this.submitSubject.next({ data: deviceBlueprint, error: null });
                })
                .catch(err => {
                    console.error(err);
                    this.submitSubject.next({ data: this.element, error: err });
                });
        }
    }

    cancel() {
        this.cancelSubject.next();
    }

    inCompatibilityList(id: string) {
        if (this.element.compatibility) {
            return (
                this.element.compatibility.findIndex(devicetypetype => {
                    return devicetypetype === id;
                }) !== -1
            );
        } else {
            return false;
        }
    }

    toggleDeviceType(event, id: string) {
        const _self = this;
        const index = _self.element.compatibility.indexOf(id);
        if (index === -1) {
            _self.element.compatibility.push(id);
        } else {
            _self.element.compatibility.splice(index, 1);
        }
        // _self.logger.info(_self.deviceBlueprint.compatibility);
        event.stopPropagation();
        event.preventDefault();
    }
}
