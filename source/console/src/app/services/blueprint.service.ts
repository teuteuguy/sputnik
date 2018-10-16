import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// AWS
import { AmplifyService } from 'aws-amplify-angular';

// Models
import { Blueprint } from '../models/blueprint.model';

// Services
import { LoggerService } from './logger.service';
import { AppSyncService } from './appsync.service';

// Helpers
import { _ } from 'underscore';

// Queries
import getBlueprints from '../graphql/queries/blueprints.get';
import getBlueprint from '../graphql/queries/blueprint.get';
// Mutations
import addBlueprint from '../graphql/mutations/blueprint.add';
import deleteBlueprint from '../graphql/mutations/blueprint.delete';
import updateBlueprint from '../graphql/mutations/blueprint.update';
// Subscriptions
import addedBlueprint from '../graphql/subscriptions/blueprint.added';
import deletedBlueprint from '../graphql/subscriptions/blueprint.deleted';
import updatedBlueprint from '../graphql/subscriptions/blueprint.updated';


@Injectable()
export class BlueprintService extends AppSyncService {
    private limit = 10;
    private observable: any = new Subject<any>();
    private blueprints: Blueprint[] = [];
    public blueprintsObservable$ = this.observable.asObservable();

    constructor(private logger: LoggerService, private amplifyService: AmplifyService) {
        super(amplifyService);
        const _self = this;

        super.subscribe(addedBlueprint, {}).subscribe({
            next: result => {
                _self.loadBlueprints();
            }
        });

        super.subscribe(updatedBlueprint, {}).subscribe({
            next: result => {
                _self.loadBlueprints();
            }
        });

        super.subscribe(deletedBlueprint, {}).subscribe({
            next: result => {
                _self.loadBlueprints();
            }
        });

        _self.loadBlueprints();
    }

    private pushNewBlueprints(blueprints: Blueprint[]) {
        const _self = this;
        blueprints.forEach((newBlueprint: Blueprint) => {
            const index = _.findIndex(_self.blueprints, (existingBlueprint: Blueprint) => {
                return existingBlueprint.id === newBlueprint.id;
            });
            if (index === -1) {
                _self.blueprints.push(newBlueprint);
            } else {
                _self.blueprints[index] = newBlueprint;
            }
        });
    }

    private _getBlueprints(limit: number, nexttoken: string) {
        const _self = this;

        return super.query(getBlueprints, { limit: limit, nextToken: nexttoken }).then(result => {
            let _blueprints: Blueprint[];
            _blueprints = result.data.getBlueprints.blueprints;
            if (result.data.getBlueprints.nextToken) {
                return _self._getBlueprints(limit, result.data.getBlueprints.nextToken).then(data => {
                    _blueprints.push(data);
                    return _blueprints;
                });
            } else {
                return _blueprints;
            }
        });
    }

    private loadBlueprints() {
        const _self = this;
        _self._getBlueprints(_self.limit, null).then((results: Blueprint[]) => {
            _self.pushNewBlueprints(results);
            _self.observable.next(results);
        });
    }

    public refresh() {
        this.loadBlueprints();
    }

    public getBlueprints() {
        const _self = this;
        return _self.blueprints;
        // return super
        //     .query(getBlueprints, { limit: limit, nextToken: nextToken })
        //     .then(d => <Blueprint[]>d.data.getBlueprints);
    }

    public getBlueprint(id: string) {
        return super.query(getBlueprint, { id: id }).then(d => <Blueprint>d.data.getBlueprint);
    }

    public addBlueprint(blueprint: Blueprint) {
        delete blueprint.id;
        return super
            .mutation(addBlueprint, { name: blueprint.name, type: blueprint.type, spec: blueprint.spec })
            .then(b => {
                return <Blueprint>b.data.addBlueprint;
            });
    }

    public deleteBlueprint(id: string) {
        return super
            .mutation(deleteBlueprint, {
                id: id
            })
            .then(b => {
                return <Blueprint>b.data.deleteBlueprint;
            });
    }

    public updateBlueprint(blueprint: Blueprint) {
        delete blueprint.updatedAt;
        return super.mutation(updateBlueprint, blueprint).then(b => {
            return <Blueprint>b.data.updateBlueprint;
        });
    }
}
