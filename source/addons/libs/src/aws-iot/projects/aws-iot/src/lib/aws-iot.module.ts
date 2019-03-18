// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// AWS Specific
import { AmplifyAngularModule } from 'aws-amplify-angular';

// --------
import { AWSIoTComponent } from './aws-iot.component';
import { AWSIoTService } from './aws-iot.service';

@NgModule({
    declarations: [AWSIoTComponent],
    exports: [AWSIoTComponent],
    imports: [AmplifyAngularModule, CommonModule],
    providers: [AWSIoTService]
})
export class AWSIoTModule {}
