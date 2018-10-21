import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Models
import { Device } from '../models/device.model';
import { Stats } from '../models/stats.model';

// Services
import { LoggerService } from './logger.service';
import {
    AppSyncService, AddedDevice,
    UpdatedDevice,
    DeletedDevice
 } from './appsync.service';

// Helpers
import { _ } from 'underscore';

@Injectable()
export class DeviceService implements AddedDevice, UpdatedDevice, DeletedDevice {
    private limit = 10;
    private observable: any = new Subject<any>();
    public devices: Device[] = [];
    devicesObservable$ = this.observable.asObservable();

    constructor(private logger: LoggerService, private appSyncService: AppSyncService) {
        const _self = this;

        _self.appSyncService.onAddedDevice(_self);
        _self.appSyncService.onUpdatedDevice(_self);
        _self.appSyncService.onDeletedDevice(_self);
    }

    public listDevices(limit: number, nextToken: string) {
        return this.appSyncService.listDevices(limit, nextToken);
    }
    public getDevice(thingId: string) {
        return this.appSyncService.getDevice(thingId);
    }
    public updateDevice(thingId: string, name: string, deviceTypeId: string, deviceBlueprintId: string) {
        return this.appSyncService.updateDevice(thingId, name, deviceTypeId, deviceBlueprintId);
    }
    public deleteDevice(thingId: string) {
        return this.appSyncService.deleteDevice(thingId);
    }
    public addDevice(thingName: string, isGreengrass: boolean) {
        return this.appSyncService.addDevice(thingName, isGreengrass);
    }

    onAddedDevice(result: Device) {
        // TODO: Improve this.
    }
    onUpdatedDevice(result: Device) {
        // TODO: Improve this.
    }
    onDeletedDevice(result: Device) {
        // TODO: Improve this.
    }
}
