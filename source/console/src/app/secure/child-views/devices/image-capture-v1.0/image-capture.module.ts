import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { ImageCaptureV10Component } from './image-capture.component';

// Pipes
import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [ImageCaptureV10Component],
    exports: [ImageCaptureV10Component],
    imports: [PipesModule, CommonModule],
    providers: []
})
export class ImageCaptureV10Module {}
