import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Models
import { System } from '@models/system.model';

// Systems
import { DefaultSystemModule } from './default-system/default-system.module';

@Component({
    selector: 'app-system-child-view',
    template: `
        <div [ngSwitch]="system.systemBlueprintId" *ngIf="system && system.systemBlueprintId">
            <app-default-system *ngSwitchDefault [system]="system"></app-default-system>
        </div>
    `
})
export class SystemChildViewComponent {
    @Input()
    system: System = new System();
}

@NgModule({
    declarations: [SystemChildViewComponent],
    exports: [SystemChildViewComponent],
    imports: [CommonModule, DefaultSystemModule]
})
export class SystemChildViewsModule {}
