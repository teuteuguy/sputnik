import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Components
import { SecureHomeCommonComponent } from '@common-secure/secure-home-common.component';
import { TableModule } from '@common-modules/table/table.module';

import { SolutionBlueprintComponent } from './solution-blueprint.component';
import { SolutionBlueprintsComponent } from './solution-blueprints.component';

// Pipes
import { PipesModule } from '@pipes/pipes.module';
import { PrettyJsonModule } from '@common-modules/pretty-json/pretty-json.module';

const solutionBlueprintsRoutes: Routes = [
    {
        path: 'securehome/solution-blueprints',
        component: SecureHomeCommonComponent,
        children: [{ path: ':id', component: SolutionBlueprintComponent }, { path: '', component: SolutionBlueprintsComponent }]
    }
];

@NgModule({
    declarations: [SolutionBlueprintComponent, SolutionBlueprintsComponent],
    exports: [RouterModule, SolutionBlueprintComponent, SolutionBlueprintsComponent],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(solutionBlueprintsRoutes),

        // Modules
        PrettyJsonModule,
        TableModule,

        // Pipes
        PipesModule
    ]
})
export class SolutionBlueprintsModule {}
