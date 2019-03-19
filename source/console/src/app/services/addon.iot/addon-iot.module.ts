import { NgModule } from '@angular/core';
import { AddonIoTComponent } from './addon-iot.component';
import { AddonIoTService } from './addon-iot.service';

@NgModule({
    declarations: [AddonIoTComponent],
    imports: [],
    exports: [AddonIoTComponent],
    providers: [AddonIoTService]
})
export class AddonIoTModule { }
