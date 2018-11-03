import { Pipe, PipeTransform } from '@angular/core';

import { SolutionBlueprint } from '../models/solution-blueprint.model';

import { SolutionBlueprintService } from '../services/solution-blueprint.service';

@Pipe({ name: 'solutionBlueprintFromSolutionBlueprintId', pure: true })
export class SolutionBlueprintFromSolutionBlueprintIdPipe implements PipeTransform {
    constructor(private solutionBlueprintService: SolutionBlueprintService) {}

    transform(id: string): SolutionBlueprint {
        const index = this.solutionBlueprintService.solutionBlueprints.findIndex((r: SolutionBlueprint) => {
            return r.id === id;
        });
        if (index !== -1) {
            return this.solutionBlueprintService.solutionBlueprints[index];
        } else {
            return null;
        }
    }
}
