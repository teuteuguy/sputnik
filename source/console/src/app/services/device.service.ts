import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// AWS
import { AmplifyService } from 'aws-amplify-angular';

// Models
import { Device } from '../models/device.model';
import { Stats } from '../models/stats.model';

// Services
import { LoggerService } from './logger.service';
import { AppSyncService } from './appsync.service';

// Helpers
import { _ } from 'underscore';

// Queries
import getDevices from '../graphql/queries/devices.get';
import getDevicesOfDeviceType from '../graphql/queries/devices-of-device-type.get';
import getDevicesWithDeviceBlueprint from '../graphql/queries/devices-with-device-blueprint.get';
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

    constructor(private logger: LoggerService, private amplifyService: AmplifyService) {
        super(amplifyService);
        const _self = this;

        super.subscribe(addedDevice, {}).subscribe({ next: result => {
                // _self.loadBlueprints();
            } });

        super.subscribe(updatedDevice, {}).subscribe({ next: result => {
                // _self.loadBlueprints();
            } });

        super.subscribe(deletedDevice, {}).subscribe({ next: result => {
                // _self.loadBlueprints();
            } });

        // _self.loadDeviceTypes();
    }

    public getDevices(limit: number, nextToken: String) {
        return super.query(getDevices, { limit: limit, nextToken: nextToken }).then(result => result.data.getDevices);
    }
    public getDevicesOfDeviceType(limit: number, nextToken: String) {
        return super
            .query(getDevicesOfDeviceType, { limit: limit, nextToken: nextToken })
            .then(result => result.data.getDevicesOfDeviceType);
    }
    public getDevicesWithDeviceBlueprint(limit: number, nextToken: String) {
        return super
            .query(getDevicesWithDeviceBlueprint, { limit: limit, nextToken: nextToken })
            .then(result => result.data.getDevicesWithDeviceBlueprint);
    }
    public getDevice(thingId: string) {
        return super.query(getDevice, { thingId: thingId }).then(result => <Device>result.data.getDevice);
    }
    public getDeviceStats() {
        return super.query(getDeviceStats, {}).then(result => <Stats>result.data.getDeviceStats);
    }

    public addDevice(thingName: String, isGreengrass) {
        return super
            .mutation(addDevice, { thingName: thingName, isGreengrass: isGreengrass })
            .then(result => {
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
        return super.mutation(updateDevice, {
            thingId: thingId,
            name: name,
            deviceTypeId: deviceTypeId,
            deviceBlueprintId: deviceBlueprintId
        }).then(d => {
            return <Device>d.data.updateDevice;
        });
    }
}
