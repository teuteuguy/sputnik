import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Components
import { SecureHomeLayoutComponent } from '@secure/secure-home-layout.component';

import { SolutionComponent } from './solution.component';
import { SolutionsComponent } from './solutions.component';
import { SolutionEditModalComponent } from './solution.edit.modal.component';
import { SolutionsModalComponent } from './solutions.modal.component';

// Modules
import { ChildViewsModule } from '../child-views/child-views.module';
import { TableModule } from '@common-modules/table/table.module';
import { PipesModule } from '@pipes/pipes.module';
import { PrettyJsonModule } from '@common-modules/pretty-json/pretty-json.module';

const solutionsRoutes: Routes = [
    {
        path: 'securehome/solutions',
        component: SecureHomeLayoutComponent,
        children: [{ path: ':id', component: SolutionComponent }, { path: '', component: SolutionsComponent }]
    }
];

@NgModule({
    declarations: [SolutionComponent, SolutionsComponent, SolutionEditModalComponent, SolutionsModalComponent],
    entryComponents: [SolutionEditModalComponent, SolutionsModalComponent],
    exports: [RouterModule, SolutionComponent, SolutionsComponent],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(solutionsRoutes),

        // Modules
        ChildViewsModule,
        PipesModule,
        PrettyJsonModule,
        TableModule

    ]
})
export class SolutionsModule {}
