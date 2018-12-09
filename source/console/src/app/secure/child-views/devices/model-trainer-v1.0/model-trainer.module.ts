import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { ModelTrainerV10Component } from './model-trainer.component';

// Modules
import { S3Module } from '@services/s3/s3.module';

// Pipes
import { PipesModule } from '@pipes/pipes.module';

@NgModule({
    declarations: [ModelTrainerV10Component],
    exports: [ModelTrainerV10Component],
    imports: [PipesModule, CommonModule, S3Module],
    providers: []
})
export class ModelTrainerV10Module {}
