import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ChartsModule } from 'ng2-charts';

import { MurataVibrationSensorNodeV10Component } from './murata-vibration-sensor-node-v1.0.component';

// import { MurataLineGraphComponent } from './murata-vibration-sensor-node-v1.0-line-graph.component';

import { CardModule } from '../../../../common/modules/card/card.module';
import { GraphLineModule } from '../../../../common/modules/graph-line/graph-line.module';
import { GaugeModule } from '../../../../common/modules/gauge/gauge.module';

// Pipes
import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [
        MurataVibrationSensorNodeV10Component
        // MurataLineGraphComponent
    ],
    exports: [
        MurataVibrationSensorNodeV10Component
        // MurataLineGraphComponent
    ],
    imports: [PipesModule, CommonModule, FormsModule, CardModule, ChartsModule, GaugeModule, GraphLineModule],
    providers: [],
    schemas: [NO_ERRORS_SCHEMA]
})
export class MurataVibrationSensorNodeV10Module {}
