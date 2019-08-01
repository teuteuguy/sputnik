import { Component, Input } from '@angular/core';
import { Subject } from 'rxjs';

// Models
import { System } from '@models/system.model';

// Services
import { LoggerService } from '@services/logger.service';
import { SystemService } from '@services/system.service';
import { SystemBlueprintService } from '@services/system-blueprint.service';

@Component({
    selector: 'app-root-systems-modal',
    templateUrl: './systems.modal.component.html'
})
export class SystemsModalComponent {
    @Input()
    element: System;
    @Input()
    modalType: string;
    @Input()
    cancelSubject: Subject<void>;
    @Input()
    submitSubject: Subject<any>;

    public createResources;

    constructor(
        private logger: LoggerService,
        private systemService: SystemService,
        public systemBlueprintService: SystemBlueprintService
    ) {
        this.modalType = 'create';
        this.element = new System({
            id: 'new',
            name: 'new',
            description: 'New System'
        });
        this.createResources = false;
    }

    submit() {
        if (this.modalType === 'create') {
            console.log('element', this.element);
            this.systemService
                .add(
                    this.element.name,
                    this.element.description,
                    this.element.deviceIds,
                    this.element.systemBlueprintId
                )
                .then(system => {
                    this.submitSubject.next({ data: system, error: null });
                })
                .catch(err => {
                    console.error(err);
                    this.submitSubject.next({ data: this.element, error: err });
                });
        } else if (this.modalType === 'edit') {
            this.systemService
                .update(this.element.id, this.element.name, this.element.description, this.element.deviceIds)
                .then(system => {
                    console.log(system);
                    this.submitSubject.next({ data: system, error: null });
                })
                .catch(err => {
                    console.error(err);
                    this.submitSubject.next({ data: this.element, error: err });
                });
        }
    }

    cancel() {
        // console.log('Cancel', this.createResources);
        this.cancelSubject.next();
    }

    toggleCreateResources() {
        this.createResources = !this.createResources;
    }
}
