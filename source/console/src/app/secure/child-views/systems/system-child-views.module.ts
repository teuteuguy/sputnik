import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Models
import { System } from '@models/system.model';

// Systems
import { ReInvent2018MCFV10Module } from './reinvent-2018-mcf-v1.0/reinvent-2018-mcf-v1-0.module';

@Component({
    selector: 'app-system-child-view',
    template: `
        <app-reinvent-2018-mcf-v1-0
            *ngIf="system.systemBlueprintId === 'reinvent-2018-mcf-v1.0' || system.systemBlueprintId === 'ebc-mcf-2018-v1.0'"
            [system]="system"
        ></app-reinvent-2018-mcf-v1-0>
    `
})
export class SystemChildViewComponent {
    @Input()
    system: System = new System();
}

@NgModule({
    declarations: [SystemChildViewComponent],
    exports: [SystemChildViewComponent],
    imports: [CommonModule, ReInvent2018MCFV10Module]
})
export class SystemChildViewsModule {}
