import { NgModule } from '@angular/core';
import { AddonIoTComponent } from './aws-iot.component';
import { AddonIoTService } from './aws-iot.service';

@NgModule({
    declarations: [AddonIoTComponent],
    imports: [],
    exports: [AddonIoTComponent],
    providers: [AddonIoTService]
})
export class AddonIoTModule {}
