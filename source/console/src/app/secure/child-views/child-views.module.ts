import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Solutions
import { DeviceChildViewsModule } from './devices/device-child-views.module';
import { SolutionChildViewsModule } from './solutions/solution-child-views.module';

@Component({
    selector: 'app-child-view',
    template: `
        <app-solution-child-view *ngIf="type === 'solution'" [solution]="data"></app-solution-child-view>
        <app-device-child-view *ngIf="type === 'device'" [device]="data"></app-device-child-view>
    `
})
export class ChildViewComponent {
    @Input()
    data: any;
    @Input()
    type: string;
}

@NgModule({
    declarations: [ChildViewComponent],
    exports: [ChildViewComponent],
    imports: [CommonModule, DeviceChildViewsModule, SolutionChildViewsModule]
})
export class ChildViewsModule {}
