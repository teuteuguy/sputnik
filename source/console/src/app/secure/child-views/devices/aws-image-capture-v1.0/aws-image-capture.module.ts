import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { AWSImageCaptureV10Component } from './aws-image-capture.component';

// Pipes
import { AppPipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [AWSImageCaptureV10Component],
    exports: [AWSImageCaptureV10Component],
    imports: [AppPipesModule, CommonModule],
    providers: []
})
export class AWSImageCaptureV10Module {}
