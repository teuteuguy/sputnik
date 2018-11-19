import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { ImageCaptureV10Component } from './image-capture.component';

// Pipes
import { AppPipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [ImageCaptureV10Component],
    exports: [ImageCaptureV10Component],
    imports: [AppPipesModule, CommonModule],
    providers: []
})
export class ImageCaptureV10Module {}
