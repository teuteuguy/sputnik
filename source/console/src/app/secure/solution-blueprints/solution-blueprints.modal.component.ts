import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs';

// Models
import { SolutionBlueprint } from '../../models/solution-blueprint.model';

// Services
import { SolutionBlueprintService } from '../../services/solution-blueprint.service';

@Component({
    selector: 'app-root-solution-blueprints-modal',
    templateUrl: './solution-blueprints.modal.component.html'
})
export class SolutionBlueprintsModalComponent {
    @Input()
    element: SolutionBlueprint;
    @Input()
    modalType: string;
    @Input()
    cancelSubject: Subject<void>;
    @Input()
    submitSubject: Subject<any>;

    constructor(private solutionBlueprintService: SolutionBlueprintService) {
        this.element = new SolutionBlueprint({
            id: 'new',
            name: 'new',
            description: 'New Solution',
            spec: {}
        });
    }

    submit() {
        if (this.modalType === 'create') {
            this.solutionBlueprintService
                .add(this.element)
                .then(solutionBlueprint => {
                    console.log(solutionBlueprint);
                    this.submitSubject.next({ data: solutionBlueprint, error: null });
                })
                .catch(err => {
                    console.error(err);
                    this.submitSubject.next({ data: this.element, error: err });
                });
        } else if (this.modalType === 'edit') {
            this.solutionBlueprintService
                .update(this.element)
                .then(solutionBlueprint => {
                    console.log(solutionBlueprint);
                    this.submitSubject.next({ data: solutionBlueprint, error: null });
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
