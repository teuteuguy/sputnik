import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Models
import { Device } from '../models/device.model';

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
    public updateDevice(
        thingId: string,
        name: string,
        spec: any = {},
        deviceTypeId: string = 'UNKNOWN',
        deviceBlueprintId: string = 'UNKNOWN'
    ) {
        return this.appSyncService.updateDevice(thingId, name, spec, deviceTypeId, deviceBlueprintId);
    }
    public deleteDevice(thingId: string) {
        return this.appSyncService.deleteDevice(thingId);
    }
    public addDevice(
        thingName: string,
        deviceTypeId: string = 'UNKNOWN',
        deviceBlueprintId: string = 'UNKNOWN',
        spec: any = {},
        generateCert: boolean = true
    ) {
        return this.appSyncService.addDevice(thingName, deviceTypeId, deviceBlueprintId, spec, generateCert);
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
