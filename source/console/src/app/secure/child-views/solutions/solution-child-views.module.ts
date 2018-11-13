import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Models
import { Solution } from '../../../models/solution.model';

// Solutions
import { AWSMiniConnectedFactoryV10Module } from './aws-mini-connected-factory-v1.0/aws-mini-connected-factory.module';

@Component({
    selector: 'app-solution-child-view',
    template: `
        <app-aws-mini-connected-factory-v1
            *ngIf="solution.solutionBlueprintId === 'aws-mini-connected-factory-v1.0' ||
                solution.solutionBlueprintId === 'aws-mini-connected-factory-v1.1'"
            [solution]="solution"
        ></app-aws-mini-connected-factory-v1>
    `
})
export class SolutionChildViewComponent {
    @Input()
    solution: Solution = new Solution();
}

@NgModule({
    declarations: [SolutionChildViewComponent],
    exports: [SolutionChildViewComponent],
    imports: [CommonModule, AWSMiniConnectedFactoryV10Module]
})
export class SolutionChildViewsModule {}
