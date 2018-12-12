import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Models
import { Solution } from '@models/solution.model';

// Solutions
import { ReInvent2018MCFV10Module } from './reinvent-2018-mcf-v1.0/reinvent-2018-mcf-v1-0.module';

@Component({
    selector: 'app-solution-child-view',
    template: `
        <app-reinvent-2018-mcf-v1-0
            *ngIf="solution.solutionBlueprintId === 'reinvent-2018-mcf-v1.0'"
            [solution]="solution"
        ></app-reinvent-2018-mcf-v1-0>
    `
})
export class SolutionChildViewComponent {
    @Input()
    solution: Solution = new Solution();
}

@NgModule({
    declarations: [SolutionChildViewComponent],
    exports: [SolutionChildViewComponent],
    imports: [CommonModule, ReInvent2018MCFV10Module]
})
export class SolutionChildViewsModule {}
