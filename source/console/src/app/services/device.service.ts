import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Models
import { Device } from '../models/device.model';
import { Stats } from '../models/stats.model';

// Services
import { LoggerService } from './logger.service';
import { AppSyncService } from './common/appsync.service';

// Helpers
import { _ } from 'underscore';

// Queries
import listDevices from '../graphql/queries/devices.list';
import listDevicesOfDeviceType from '../graphql/queries/devices-of-device-type.list';
import listDevicesWithDeviceBlueprint from '../graphql/queries/devices-with-device-blueprint.list';
import getDevice from '../graphql/queries/device.get';
import getDeviceStats from '../graphql/queries/device.getStats';

// Mutations
import addDevice from '../graphql/mutations/device.add';
import deleteDevice from '../graphql/mutations/device.delete';
import updateDevice from '../graphql/mutations/device.update';
// // Subscriptions
import addedDevice from '../graphql/subscriptions/device.added';
import deletedDevice from '../graphql/subscriptions/device.deleted';
import updatedDevice from '../graphql/subscriptions/device.updated';

@Injectable()
export class DeviceService extends AppSyncService {
    private limit = 10;
    private observable: any = new Subject<any>();
    public devices: Device[] = [];
    devicesObservable$ = this.observable.asObservable();

    constructor(private logger: LoggerService) {
        super();
        const _self = this;

        super.subscribe(addedDevice, {}).subscribe({
            next: result => {
                // _self.loadBlueprints();
            }
        });

        super.subscribe(updatedDevice, {}).subscribe({
            next: result => {
                // _self.loadBlueprints();
            }
        });

        super.subscribe(deletedDevice, {}).subscribe({
            next: result => {
                // _self.loadBlueprints();
            }
        });

        // _self.loadDeviceTypes();
    }

    public listDevices(limit: number, nextToken: String) {
        return super.query(listDevices, { limit: limit, nextToken: nextToken }).then(result => result.data.listDevices);
    }
    public listDevicesOfDeviceType(limit: number, nextToken: String) {
        return super
            .query(listDevicesOfDeviceType, { limit: limit, nextToken: nextToken })
            .then(result => result.data.listDevicesOfDeviceType);
    }
    public listDevicesWithDeviceBlueprint(limit: number, nextToken: String) {
        return super
            .query(listDevicesWithDeviceBlueprint, { limit: limit, nextToken: nextToken })
            .then(result => result.data.listDevicesWithDeviceBlueprint);
    }
    public getDevice(thingId: string) {
        return super.query(getDevice, { thingId: thingId }).then(result => <Device>result.data.getDevice);
    }
    public getDeviceStats() {
        return super.query(getDeviceStats, {}).then(result => <Stats>result.data.getDeviceStats);
    }

    public addDevice(thingName: String, isGreengrass) {
        return super.mutation(addDevice, { thingName: thingName, isGreengrass: isGreengrass }).then(result => {
            return <Device>result.data.device;
        });
    }

    public deleteDevice(thingId: string) {
        return super
            .mutation(deleteDevice, {
                thingId: thingId
            })
            .then(d => {
                return <Device>d.data.deleteDevice;
            });
    }

    public updateDevice(thingId: string, name: string, deviceTypeId: string, deviceBlueprintId: string) {
        return super
            .mutation(updateDevice, {
                thingId: thingId,
                name: name,
                deviceTypeId: deviceTypeId,
                deviceBlueprintId: deviceBlueprintId
            })
            .then(d => {
                return <Device>d.data.updateDevice;
            });
    }
}
