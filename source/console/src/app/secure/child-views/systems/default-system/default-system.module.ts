import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { DefaultSystemComponent } from './default-system.component';

// Modules
import { DeviceChildViewsModule } from '../../devices/device-child-views.module';

@NgModule({
    declarations: [DefaultSystemComponent],
    exports: [DefaultSystemComponent],
    imports: [CommonModule, DeviceChildViewsModule],
    providers: [],
    schemas: []
})
export class DefaultSystemModule {}
