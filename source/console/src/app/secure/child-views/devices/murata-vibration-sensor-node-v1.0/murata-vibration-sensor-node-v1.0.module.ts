import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';

import { MurataVibrationSensorNodeV10Component } from './murata-vibration-sensor-node-v1.0.component';
import { MurataBatteryGraphComponent } from './murata-vibration-sensor-node-v1.0-battery-graph.component';
import { MurataTemperatureGraphComponent } from './murata-vibration-sensor-node-v1.0-temperature-graph.component';

import { CardModule } from '../../../../common/modules/card/card.module';
import { GaugeModule } from '../../../../common/modules/gauge/gauge.module';

// Pipes
import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [MurataVibrationSensorNodeV10Component, MurataBatteryGraphComponent, MurataTemperatureGraphComponent],
    exports: [MurataVibrationSensorNodeV10Component, MurataBatteryGraphComponent, MurataTemperatureGraphComponent],
    imports: [PipesModule, CommonModule, FormsModule, ChartsModule, CardModule, GaugeModule],
    providers: [],
    schemas: [NO_ERRORS_SCHEMA]
})
export class MurataVibrationSensorNodeV10Module {}
