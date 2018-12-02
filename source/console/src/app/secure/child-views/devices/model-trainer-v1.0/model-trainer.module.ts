import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { ModelTrainerV10Component } from './model-trainer.component';

// Pipes
import { AppPipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [ModelTrainerV10Component],
    exports: [ModelTrainerV10Component],
    imports: [AppPipesModule, CommonModule],
    providers: []
})
export class ModelTrainerV10Module {}
