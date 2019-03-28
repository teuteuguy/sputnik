import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';

import { MurataVibrationSensorNodeV10Component } from './murata-vibration-sensor-node-v1.0.component';

// Pipes
import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [MurataVibrationSensorNodeV10Component],
    exports: [MurataVibrationSensorNodeV10Component],
    imports: [PipesModule, CommonModule, FormsModule, ChartsModule],
    providers: []
})
export class MurataVibrationSensorNodeV10Module {}
