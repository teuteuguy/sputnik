import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { AWSDeeplensImageCaptureV10Component } from './aws-deeplens-image-capture.component';

// Pipes
import { AppPipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [AWSDeeplensImageCaptureV10Component],
    exports: [AWSDeeplensImageCaptureV10Component],
    imports: [AppPipesModule, CommonModule],
    providers: []
})
export class AWSDeeplensImageCaptureV10Module {}
