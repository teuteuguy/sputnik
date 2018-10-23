import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Models
import { Solution } from '../models/solution.model';

// Services
import { LoggerService } from './logger.service';
import {
    AppSyncService,
    AddedSolution,
    UpdatedSolution,
    DeletedSolution
} from './appsync.service';

// Helpers
import { _ } from 'underscore';

@Injectable()
export class SolutionService implements AddedSolution, UpdatedSolution, DeletedSolution {
    private limit = 10;
    private solutions: Solution[] = [];

    constructor(private logger: LoggerService, private appSyncService: AppSyncService) {
        const _self = this;

        _self.appSyncService.onAddedSolution(_self);
        _self.appSyncService.onUpdatedSolution(_self);
        _self.appSyncService.onDeletedSolution(_self);

        // _self.loadSolutions();
    }

    public list(limit: number, nextToken: string) {
        return this.appSyncService.listSolutions(limit, nextToken);
    }
    public get(id: string) {
        return this.appSyncService.getSolution(id);
    }
    public getSolutionStats() {
        return this.appSyncService.getSolutionStats();
    }
    public add(name: string, description: string, thingIds: string[], solutionBlueprintId: string) {
        return this.appSyncService.addSolution(name, description, thingIds, solutionBlueprintId);
    }
    public update(id: string, name: string, description: string, thingIds: string[]) {
        return this.appSyncService.updateSolution(id, name, description, thingIds);
    }
    public delete(id: string) {
        return this.appSyncService.deleteSolution(id);
    }

    // private pushNewSolutions(solutions: Solution[]) {
    //     const _self = this;
    //     solutions.forEach((newSolution: Solution) => {
    //         const index = _.findIndex(_self.solutions, (existingSolution: Solution) => {
    //             return existingSolution.id === newSolution.id;
    //         });
    //         if (index === -1) {
    //             _self.solutions.push(newSolution);
    //         } else {
    //             _self.solutions[index] = newSolution;
    //         }
    //     });
    // }

    // private _listSolutions(limit: number, nextToken: string) {
    //     const _self = this;

    //     return _self.listSolutions(limit, nextToken).then(result => {
    //         let _deviceBlueprints: Solution[];
    //         _deviceBlueprints = result.solutions;
    //         if (result.nextToken) {
    //             return _self._listSolutions(limit, result.nextToken).then(data => {
    //                 _deviceBlueprints.push(data);
    //                 return _deviceBlueprints;
    //             });
    //         } else {
    //             return _deviceBlueprints;
    //         }
    //     });
    // }

    // private loadSolutions() {
    //     const _self = this;
    //     _self._listSolutions(_self.limit, null).then((results: Solution[]) => {
    //         _self.pushNewSolutions(results);
    //         _self.observable.next(results);
    //     });
    // }

    // public refresh() {
    //     this.loadSolutions();
    // }

    // public getSolutions() {
    //     return this.solutions;
    // }

    onAddedSolution(result: Solution) {}
    onUpdatedSolution(result: Solution) {}
    onDeletedSolution(result: Solution) {}
}
