import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Models
import { SolutionBlueprint } from '@models/solution-blueprint.model';

// Services
import { LoggerService } from './logger.service';
import {
    AppSyncService,
    AddedSolutionBlueprint,
    UpdatedSolutionBlueprint,
    DeletedSolutionBlueprint
} from './appsync.service';

// Helpers
import { _ } from 'underscore';

@Injectable()
export class SolutionBlueprintService
    implements AddedSolutionBlueprint, UpdatedSolutionBlueprint, DeletedSolutionBlueprint {
    private limit = 50;
    public solutionBlueprints: SolutionBlueprint[] = [];
    private observable: Subject<any> = new Subject<any>();
    public solutionBlueprintsObservable$ = this.observable.asObservable();

    constructor(private logger: LoggerService, private appSyncService: AppSyncService) {
        const _self = this;

        _self.appSyncService.onAddedSolutionBlueprint(_self);
        _self.appSyncService.onUpdatedSolutionBlueprint(_self);
        _self.appSyncService.onDeletedSolutionBlueprint(_self);

        _self.loadAll();
    }
    public add(solutionBlueprint: SolutionBlueprint) {
        return this.appSyncService.addSolutionBlueprint(solutionBlueprint).then(r => {
            this.onAddedSolutionBlueprint(r);
            return r;
        });
    }
    public update(solutionBlueprint: SolutionBlueprint) {
        return this.appSyncService.updateSolutionBlueprint(solutionBlueprint).then(r => {
            this.onUpdatedSolutionBlueprint(r);
            return r;
        });
    }
    public delete(id: string) {
        return this.appSyncService.deleteSolutionBlueprint(id).then(r => {
            this.onDeletedSolutionBlueprint(r);
            return r;
        });
    }

    private loadAll() {
        const _self = this;
        _self.listRecursive(_self.limit, null).then((results: SolutionBlueprint[]) => {
            _self.solutionBlueprints.splice(0, _self.solutionBlueprints.length);
            results.forEach(r => {
                _self.solutionBlueprints.push(r);
            });
            _self.observable.next(_self.solutionBlueprints);
        });
    }

    public refresh() {
        this.loadAll();
    }

    private listRecursive(limit: number, nextToken: string) {
        const _self = this;
        return _self.list(_self.limit, nextToken).then(result => {
            let _solutionBlueprints: SolutionBlueprint[];
            _solutionBlueprints = result.solutionBlueprints;
            if (result.nextToken) {
                return _self.listRecursive(limit, result.nextToken).then(data => {
                    data.forEach(d => {
                        _solutionBlueprints.push(d);
                    });
                    return _solutionBlueprints;
                });
            } else {
                return _solutionBlueprints;
            }
        });
    }

    public list(limit: number, nextToken: string) {
        return this.appSyncService.listSolutionBlueprints(limit, nextToken);
    }
    public get(id: string) {
        return this.appSyncService.getSolutionBlueprint(id);
    }

    onAddedSolutionBlueprint(result: SolutionBlueprint) {
        const index = _.findIndex(this.solutionBlueprints, (r: SolutionBlueprint) => {
            return r.id === result.id;
        });
        if (index === -1) {
            this.solutionBlueprints.push(result);
            this.observable.next(this.solutionBlueprints);
        } else {
            this.onUpdatedSolutionBlueprint(result);
        }
    }
    onUpdatedSolutionBlueprint(result: SolutionBlueprint) {
        const index = _.findIndex(this.solutionBlueprints, (r: SolutionBlueprint) => {
            return r.id === result.id;
        });
        this.solutionBlueprints[index] = result;
        this.observable.next(this.solutionBlueprints);
    }
    onDeletedSolutionBlueprint(result: SolutionBlueprint) {
        const index = _.findIndex(this.solutionBlueprints, (r: SolutionBlueprint) => {
            return r.id === result.id;
        });
        this.solutionBlueprints.splice(index, 1);
        this.observable.next(this.solutionBlueprints);
    }
}
