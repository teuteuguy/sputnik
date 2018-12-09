import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Components
import { PrettyJsonComponent } from '@common-components/pretty-json/pretty-json.component';
import { SecureHomeCommonComponent } from '@common-secure/secure-home-common.component';
import { TableModule } from '@common-modules/table/table.module';

import { DeviceTypeComponent } from './device-type.component';
import { DeviceTypesComponent } from './device-types.component';

// Pipes
import { PipesModule } from '@pipes/pipes.module';

const deviceTypesRoutes: Routes = [
    {
        path: 'securehome/device-types',
        component: SecureHomeCommonComponent,
        children: [{ path: ':id', component: DeviceTypeComponent }, { path: '', component: DeviceTypesComponent }]
    }
];

@NgModule({
    declarations: [DeviceTypeComponent, DeviceTypesComponent, PrettyJsonComponent],
    exports: [RouterModule, DeviceTypeComponent, DeviceTypesComponent, PrettyJsonComponent],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(deviceTypesRoutes),

        // Modules
        TableModule,

        // Pipes
        PipesModule
    ]
})
export class DeviceTypesModule {}
