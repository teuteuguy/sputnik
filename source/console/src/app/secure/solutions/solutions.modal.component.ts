import { Component, Input } from '@angular/core';
import { Subject } from 'rxjs';

// Models
import { Solution } from '../../models/solution.model';

// Services
import { SolutionService } from '../../services/solution.service';
import { SolutionBlueprintService } from '../../services/solution-blueprint.service';

@Component({
    selector: 'app-root-solutions-modal',
    templateUrl: './solutions.modal.component.html'
})
export class SolutionsModalComponent {
    @Input()
    element: Solution;
    @Input()
    modalType: string;
    @Input()
    cancelSubject: Subject<void>;
    @Input()
    submitSubject: Subject<any>;

    constructor(private solutionService: SolutionService, public solutionBlueprintService: SolutionBlueprintService) {
        this.element = new Solution({
            id: 'new',
            name: 'new',
            description: 'New Solution'
        });
    }

    submit() {
        if (this.modalType === 'create') {
            console.log('element', this.element);
            this.solutionService
                .add(
                    this.element.name,
                    this.element.description,
                    this.element.thingIds,
                    this.element.solutionBlueprintId
                )
                .then(solution => {
                    console.log(solution);
                    this.submitSubject.next({ data: solution, error: null });
                })
                .catch(err => {
                    console.error(err);
                    this.submitSubject.next({ data: this.element, error: err });
                });
        } else if (this.modalType === 'edit') {
            this.solutionService
                .update(this.element.id, this.element.name, this.element.description, this.element.thingIds)
                .then(solution => {
                    console.log(solution);
                    this.submitSubject.next({ data: solution, error: null });
                })
                .catch(err => {
                    console.error(err);
                    this.submitSubject.next({ data: this.element, error: err });
                });
        }
    }

    cancel() {
        console.log('Cancel');
        this.cancelSubject.next();
    }
}
