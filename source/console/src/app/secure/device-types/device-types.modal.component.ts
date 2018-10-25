import { Component, Input } from '@angular/core';
import { Subject } from 'rxjs';

// Models
import { DeviceType } from '../../models/device-type.model';

// Services
import { DeviceTypeService } from '../../services/device-type.service';

@Component({
    selector: 'app-root-device-types-modal',
    templateUrl: './device-types.modal.component.html'
})
export class DeviceTypesModalComponent {
    @Input()
    element: DeviceType;
    @Input()
    modalType: string;
    @Input()
    cancelSubject: Subject<void>;
    @Input()
    submitSubject: Subject<any>;

    constructor(private deviceTypeService: DeviceTypeService) {
        this.element = new DeviceType({
            id: 'new',
            name: 'new'
        });
    }

    submit() {
        if (this.modalType === 'create') {
            this.deviceTypeService
                .add(this.element)
                .then(deviceType => {
                    console.log(deviceType);
                    this.submitSubject.next({ data: deviceType, error: null });
                })
                .catch(err => {
                    console.error(err);
                    this.submitSubject.next({ data: this.element, error: err });
                });
        } else if (this.modalType === 'edit') {
            this.deviceTypeService
                .update(this.element)
                .then(deviceType => {
                    console.log(deviceType);
                    this.submitSubject.next({ data: deviceType, error: null });
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
}
