import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MurataVibrationSensorNetworkComponent } from './murata-vibration-sensor-network.component';


import { AddonIoTModule } from '@sputnik-addon-iot/module';
import { AddonIoTService } from '@sputnik-addon-iot/service';

@NgModule({
    declarations: [MurataVibrationSensorNetworkComponent],
    entryComponents: [MurataVibrationSensorNetworkComponent],
    imports: [CommonModule, AddonIoTModule],
    providers: [
        AddonIoTService,
        {
            provide: 'addons',
                useValue: [
                {
                    name: 'murata-vibration-sensor-network-component',
                    component: MurataVibrationSensorNetworkComponent
                }
            ],
            multi: true
        }
    ]
})
export class MurataVibrationSensorNetworkModule {}
