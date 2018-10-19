import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Models
import { DeviceBlueprint } from '../models/device-blueprint.model';

// Services
import { LoggerService } from './logger.service';
import { AppSyncService } from './common/appsync.service';

// Helpers
import { _ } from 'underscore';

// Queries
import listDeviceBlueprints from '../graphql/queries/device-blueprints.list';
import getDeviceBlueprint from '../graphql/queries/device-blueprint.get';
// Mutations
import addDeviceBlueprint from '../graphql/mutations/device-blueprint.add';
import deleteDeviceBlueprint from '../graphql/mutations/device-blueprint.delete';
import updateDeviceBlueprint from '../graphql/mutations/device-blueprint.update';
// Subscriptions
import addedDeviceBlueprint from '../graphql/subscriptions/device-blueprint.added';
import deletedDeviceBlueprint from '../graphql/subscriptions/device-blueprint.deleted';
import updatedDeviceBlueprint from '../graphql/subscriptions/device-blueprint.updated';


@Injectable()
export class DeviceBlueprintService extends AppSyncService {
    private limit = 10;
    private observable: any = new Subject<any>();
    private deviceBlueprints: DeviceBlueprint[] = [];
    public blueprintsObservable$ = this.observable.asObservable();

    constructor(private logger: LoggerService) {
        super();
        const _self = this;

        super.subscribe(addedDeviceBlueprint, {}).subscribe({
            next: result => {
                _self.loadDeviceBlueprints();
            }
        });

        super.subscribe(updatedDeviceBlueprint, {}).subscribe({
            next: result => {
                _self.loadDeviceBlueprints();
            }
        });

        super.subscribe(deletedDeviceBlueprint, {}).subscribe({
            next: result => {
                _self.loadDeviceBlueprints();
            }
        });

        _self.loadDeviceBlueprints();
    }

    private pushNewDeviceBlueprints(deviceBlueprints: DeviceBlueprint[]) {
        const _self = this;
        deviceBlueprints.forEach((newDeviceBlueprint: DeviceBlueprint) => {
            const index = _.findIndex(_self.deviceBlueprints, (existingDeviceBlueprint: DeviceBlueprint) => {
                return existingDeviceBlueprint.id === newDeviceBlueprint.id;
            });
            if (index === -1) {
                _self.deviceBlueprints.push(newDeviceBlueprint);
            } else {
                _self.deviceBlueprints[index] = newDeviceBlueprint;
            }
        });
    }

    private _listDeviceBlueprints(limit: number, nexttoken: string) {
        const _self = this;

        return super.query(listDeviceBlueprints, { limit: limit, nextToken: nexttoken }).then(result => {
            let _deviceBlueprints: DeviceBlueprint[];
            _deviceBlueprints = result.data.listDeviceBlueprints.deviceBlueprints;
            if (result.data.listDeviceBlueprints.nextToken) {
                return _self
                    ._listDeviceBlueprints(limit, result.data.listDeviceBlueprints.nextToken)
                    .then(data => {
                        _deviceBlueprints.push(data);
                        return _deviceBlueprints;
                    });
            } else {
                return _deviceBlueprints;
            }
        });
    }

    private loadDeviceBlueprints() {
        const _self = this;
        _self._listDeviceBlueprints(_self.limit, null).then((results: DeviceBlueprint[]) => {
            _self.pushNewDeviceBlueprints(results);
            _self.observable.next(results);
        });
    }

    public refresh() {
        this.loadDeviceBlueprints();
    }

    public getDeviceBlueprints() {
        const _self = this;
        return _self.deviceBlueprints;
        // return super
        //     .query(getBlueprints, { limit: limit, nextToken: nextToken })
        //     .then(d => <Blueprint[]>d.data.getBlueprints);
    }

    public getDeviceBlueprint(id: string) {
        return super.query(getDeviceBlueprint, { id: id }).then(d => <DeviceBlueprint>d.data.getDeviceBlueprint);
    }

    public addDeviceBlueprint(deviceBlueprint: DeviceBlueprint) {
        delete deviceBlueprint.id;
        return super
            .mutation(addDeviceBlueprint, {
                name: deviceBlueprint.name,
                type: deviceBlueprint.type,
                spec: deviceBlueprint.spec
            })
            .then(b => {
                return <DeviceBlueprint>b.data.addBlueprint;
            });
    }

    public deleteDeviceBlueprint(id: string) {
        return super
            .mutation(deleteDeviceBlueprint, {
                id: id
            })
            .then(b => {
                return <DeviceBlueprint>b.data.deleteBlueprint;
            });
    }

    public updateDeviceBlueprint(deviceBlueprint: DeviceBlueprint) {
        delete deviceBlueprint.updatedAt;
        return super.mutation(updateDeviceBlueprint, deviceBlueprint).then(b => {
            return <DeviceBlueprint>b.data.updateBlueprint;
        });
    }
}
