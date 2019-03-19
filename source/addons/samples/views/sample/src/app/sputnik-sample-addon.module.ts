// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SputnikSampleAddonComponent } from './sputnik-sample-addon.component';

@NgModule({
    imports: [CommonModule],
    declarations: [SputnikSampleAddonComponent],
    entryComponents: [SputnikSampleAddonComponent],
    providers: [
        {
            provide: 'addons',
            useValue: [
                {
                    name: 'sputnik-sample-addon-component',
                    component: SputnikSampleAddonComponent
                }
            ],
            multi: true
        }
    ]
})
export class SputnikSampleAddonModule {}
