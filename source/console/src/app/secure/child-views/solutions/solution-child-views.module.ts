import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Models
import { Solution } from '../../../models/solution.model';

// Solutions
import { MiniConnectedFactoryV10Module } from './mini-connected-factory-v1.0/mini-connected-factory.module';

@Component({
    selector: 'app-solution-child-view',
    template: `
        <app-mini-connected-factory-v1
            *ngIf="solution.solutionBlueprintId === 'mini-connected-factory-v1.1' ||
                solution.solutionBlueprintId === 'mini-connected-factory-v1.2'"
            [solution]="solution"
        ></app-mini-connected-factory-v1>
    `
})
export class SolutionChildViewComponent {
    @Input()
    solution: Solution = new Solution();
}

@NgModule({
    declarations: [SolutionChildViewComponent],
    exports: [SolutionChildViewComponent],
    imports: [CommonModule, MiniConnectedFactoryV10Module]
})
export class SolutionChildViewsModule {}
