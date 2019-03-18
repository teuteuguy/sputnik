// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// AWS Specific
import { AmplifyAngularModule } from 'aws-amplify-angular';

// Services
import { AWSIoTService } from './aws-iot.service';

@NgModule({
    imports: [AmplifyAngularModule, CommonModule],
    providers: [AWSIoTService]
})
export class AWSIoTModule {}
