import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Models
import { DeviceType } from '../models/device-type.model';

// Services
import { LoggerService } from './logger.service';
import { AppSyncService, AddedDeviceType, UpdatedDeviceType, DeletedDeviceType } from './appsync.service';

// Helpers
import { _ } from 'underscore';

@Injectable()
export class DeviceTypeService implements AddedDeviceType, UpdatedDeviceType, DeletedDeviceType {
    private limit = 10;
    private observable: any = new Subject<any>();
    private deviceTypes: DeviceType[] = [];
    public deviceTypesObservable$ = this.observable.asObservable();

    constructor(private logger: LoggerService, private appSyncService: AppSyncService) {
        console.log(this);
        const _self = this;

        _self.appSyncService.onAddedDeviceType(_self);
        _self.appSyncService.onUpdatedDeviceType(_self);
        _self.appSyncService.onDeletedDeviceType(_self);

        _self.loadDeviceTypes();
    }
    public addDeviceType(deviceType: DeviceType) {
        return this.appSyncService.addDeviceType(deviceType);
    }
    public updateDeviceType(deviceType: DeviceType) {
        return this.appSyncService.updateDeviceType(deviceType);
    }
    public deleteDeviceType(id: string) {
        return this.appSyncService.deleteDeviceType(id);
    }

    private pushNewDeviceTypes(deviceTypes: DeviceType[]) {
        const _self = this;
        deviceTypes.forEach((newDeviceType: DeviceType) => {
            const index = _.findIndex(_self.deviceTypes, (existingDeviceType: DeviceType) => {
                return existingDeviceType.id === newDeviceType.id;
            });
            if (index === -1) {
                _self.deviceTypes.push(newDeviceType);
            } else {
                _self.deviceTypes[index] = newDeviceType;
            }
        });
    }

    private _listDeviceTypes(limit: number, nextToken: string) {
        const _self = this;

        return _self.appSyncService.listDeviceTypes(limit, nextToken).then(result => {
            let _deviceTypes: DeviceType[];
            _deviceTypes = result.deviceTypes;
            if (result.nextToken) {
                return _self._listDeviceTypes(limit, result.nextToken).then(data => {
                    _deviceTypes.push(data);
                    return _deviceTypes;
                });
            } else {
                return _deviceTypes;
            }
        });
    }

    private loadDeviceTypes() {
        const _self = this;
        _self._listDeviceTypes(_self.limit, null).then((results: DeviceType[]) => {
            _self.pushNewDeviceTypes(results);
            _self.observable.next(results);
        });
    }

    public refresh() {
        this.loadDeviceTypes();
    }

    public getDeviceTypes() {
        return this.deviceTypes;
    }

    public getDeviceType(id: string) {
        console.log('deviceTypeService.getDeviceType');
        return this.deviceTypes.find((dt: DeviceType) => {
            return dt.id === id;
        });
    }

    onAddedDeviceType(deviceType: DeviceType) {
        // TODO: Improve this.
        this.loadDeviceTypes();
    }
    onUpdatedDeviceType(deviceType: DeviceType) {
        // TODO: Improve this.
        this.loadDeviceTypes();
    }
    onDeletedDeviceType(deviceType: DeviceType) {
        // TODO: Improve this.
        this.loadDeviceTypes();
    }
}
