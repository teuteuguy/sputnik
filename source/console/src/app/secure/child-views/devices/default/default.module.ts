import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DefaultComponent } from './default.component';

import { WidgetsModule } from '../widgets/widgets.module';

// Pipes
import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [DefaultComponent],
    exports: [DefaultComponent],
    imports: [
        PipesModule,
        CommonModule,
        FormsModule,
        WidgetsModule
    ],
    providers: [],
    schemas: [NO_ERRORS_SCHEMA]
})
export class DefaultModule {}
