import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Models
import { DeviceBlueprint } from '../models/device-blueprint.model';

// Services
import { LoggerService } from './logger.service';
import {
    AppSyncService,
    AddedDeviceBlueprint,
    UpdatedDeviceBlueprint,
    DeletedDeviceBlueprint
} from './appsync.service';

// Helpers
import { _ } from 'underscore';

@Injectable()
export class DeviceBlueprintService implements AddedDeviceBlueprint, UpdatedDeviceBlueprint, DeletedDeviceBlueprint {
    private limit = 10;
    private observable: any = new Subject<any>();
    private deviceBlueprints: DeviceBlueprint[] = [];
    public blueprintsObservable$ = this.observable.asObservable();

    constructor(private logger: LoggerService, private appSyncService: AppSyncService) {
        const _self = this;

        _self.appSyncService.onAddedDeviceBlueprint(_self);
        _self.appSyncService.onUpdatedDeviceBlueprint(_self);
        _self.appSyncService.onDeletedDeviceBlueprint(_self);

        _self.loadDeviceBlueprints();
    }

    public listDeviceBlueprints(limit: number, nextToken: string) {
        return this.appSyncService.listDeviceBlueprints(limit, nextToken);
    }
    public getDeviceBlueprint(id: string) {
        return this.appSyncService.getDeviceBlueprint(id);
    }
    public addDeviceBlueprint(deviceBlueprint: DeviceBlueprint) {
        return this.appSyncService.addDeviceBlueprint(deviceBlueprint);
    }
    public updateDeviceBlueprint(deviceBlueprint: DeviceBlueprint) {
        return this.appSyncService.updateDeviceBlueprint(deviceBlueprint);
    }
    public deleteDeviceBlueprint(id: string) {
        return this.appSyncService.deleteDeviceBlueprint(id);
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

    private _listDeviceBlueprints(limit: number, nextToken: string) {
        const _self = this;

        return _self.listDeviceBlueprints(limit, nextToken).then(result => {
            let _deviceBlueprints: DeviceBlueprint[];
            _deviceBlueprints = result.deviceBlueprints;
            if (result.nextToken) {
                return _self._listDeviceBlueprints(limit, result.nextToken).then(data => {
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
        return this.deviceBlueprints;
    }

    onAddedDeviceBlueprint(result: DeviceBlueprint) {
        // TODO: Improve this.
        this.loadDeviceBlueprints();
    }
    onUpdatedDeviceBlueprint(result: DeviceBlueprint) {
        // TODO: Improve this.
        this.loadDeviceBlueprints();
    }
    onDeletedDeviceBlueprint(result: DeviceBlueprint) {
        // TODO: Improve this.
        this.loadDeviceBlueprints();
    }
}
