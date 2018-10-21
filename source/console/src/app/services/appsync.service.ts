import { Injectable } from '@angular/core';

// AWS
import { AmplifyService } from 'aws-amplify-angular';

// Models
import { Deployment } from '../models/deployment.model';
import { Device } from '../models/device.model';
import { DeviceBlueprint } from '../models/device-blueprint.model';
import { DeviceType } from '../models/device-type.model';
import { Setting } from '../models/setting.model';
import { Solution } from '../models/solution.model';
import { Stats } from '../models/stats.model';

// Queries
// import getAllDeviceTypes from '../graphql/queries/getAllDeviceTypes';
import factoryReset from '../graphql/mutations/factoryReset';
import getDevice from '../graphql/queries/device.get';
import getDeviceBlueprint from '../graphql/queries/device-blueprint.get';
import getDeviceStats from '../graphql/queries/device.getStats';
import getDeviceType from '../graphql/queries/device-type.get';
import getSetting from '../graphql/queries/setting.get';
import getSolution from '../graphql/queries/solution.get';
import getThingAutoRegistrationState from '../graphql/queries/thing-auto-registration-state.get';
import listDeployments from '../graphql/queries/deployments.list';
import listDevices from '../graphql/queries/devices.list';
import listDevicesOfDeviceType from '../graphql/queries/devices-of-device-type.list';
import listDevicesWithDeviceBlueprint from '../graphql/queries/devices-with-device-blueprint.list';
import listDeviceBlueprints from '../graphql/queries/device-blueprints.list';
import listDeviceTypes from '../graphql/queries/device-types.list';
import listSolutions from '../graphql/queries/solutions.list';
// Mutations
import addDevice from '../graphql/mutations/device.add';
import addDeviceBlueprint from '../graphql/mutations/device-blueprint.add';
import addDeviceType from '../graphql/mutations/device-type.add';
import addSolution from '../graphql/mutations/solution.add';
import deleteDevice from '../graphql/mutations/device.delete';
import deleteDeviceBlueprint from '../graphql/mutations/device-blueprint.delete';
import deleteDeviceType from '../graphql/mutations/device-type.delete';
import deleteSolution from '../graphql/mutations/solution.delete';
import setThingAutoRegistrationState from '../graphql/mutations/thing-auto-registration-state.set';
import updateDevice from '../graphql/mutations/device.update';
import updateDeviceBlueprint from '../graphql/mutations/device-blueprint.update';
import updateDeviceType from '../graphql/mutations/device-type.update';
import updateSolution from '../graphql/mutations/solution.update';
// Subscriptions
import addedDevice from '../graphql/subscriptions/device.added';
import addedDeviceBlueprint from '../graphql/subscriptions/device-blueprint.added';
import addedDeviceType from '../graphql/subscriptions/device-type.added';
import addedSolution from '../graphql/subscriptions/solution.added';
import deletedDevice from '../graphql/subscriptions/device.deleted';
import deletedDeviceBlueprint from '../graphql/subscriptions/device-blueprint.deleted';
import deletedDeviceType from '../graphql/subscriptions/device-type.deleted';
import deletedSolution from '../graphql/subscriptions/solution.deleted';
import updatedDevice from '../graphql/subscriptions/device.updated';
import updatedDeviceBlueprint from '../graphql/subscriptions/device-blueprint.updated';
import updatedDeviceType from '../graphql/subscriptions/device-type.updated';
import updatedSolution from '../graphql/subscriptions/solution.updated';

export interface AddedDevice {
    onAddedDevice(result: Device): void;
}
export interface UpdatedDevice {
    onUpdatedDevice(result: Device): void;
}
export interface DeletedDevice {
    onDeletedDevice(result: Device): void;
}
export interface AddedDeviceBlueprint {
    onAddedDeviceBlueprint(result: DeviceBlueprint): void;
}
export interface UpdatedDeviceBlueprint {
    onUpdatedDeviceBlueprint(result: DeviceBlueprint): void;
}
export interface DeletedDeviceBlueprint {
    onDeletedDeviceBlueprint(result: DeviceBlueprint): void;
}
export interface AddedDeviceType {
    onAddedDeviceType(result: DeviceType): void;
}
export interface UpdatedDeviceType {
    onUpdatedDeviceType(result: DeviceType): void;
}
export interface DeletedDeviceType {
    onDeletedDeviceType(result: DeviceType): void;
}
export interface AddedSolution {
    onAddedSolution(result: Solution): void;
}
export interface UpdatedSolution {
    onUpdatedSolution(result: Solution): void;
}
export interface DeletedSolution {
    onDeletedSolution(result: Solution): void;
}

@Injectable()
export class AppSyncService {
    constructor(private amplifyService: AmplifyService) {}

    private query(query, params) {
        const _self = this;
        const promise: any = _self.amplifyService.api().graphql({ query: query.loc.source.body, variables: params });
        return promise;
    }
    private mutation(mutation, params) {
        const _self = this;
        const promise: any = _self.amplifyService.api().graphql({ query: mutation.loc.source.body, variables: params });
        return promise;
    }
    private subscribe(subscription, params) {
        const _self = this;
        const obs: any = _self.amplifyService.api().graphql({ query: subscription.loc.source.body, variables: params });
        return obs;
    }

    // Device Types
    public listDeviceTypes(limit: number, nextToken: string) {
        return this.query(listDeviceTypes, {
            limit: limit,
            nextToken: nextToken
        }).then(result => {
            return result.data.listDeviceTypes;
        });
    }
    public getDeviceType(id: string) {
        return this.query(getDeviceType, {
            id: id
        }).then(d => <DeviceType>d.data.getDeviceType);
    }
    public addDeviceType(deviceType: DeviceType) {
        delete deviceType.id;
        return this.mutation(addDeviceType, {
            name: deviceType.name,
            type: deviceType.type,
            spec: deviceType.spec
        }).then(d => {
            return <DeviceType>d.data.addDeviceType;
        });
    }
    public deleteDeviceType(id: string) {
        return this.mutation(deleteDeviceType, {
            id: id
        }).then(d => {
            return <DeviceType>d.data.deleteDeviceType;
        });
    }
    public updateDeviceType(deviceType: DeviceType) {
        delete deviceType.updatedAt;
        return this.mutation(updateDeviceType, deviceType).then(d => {
            return <DeviceType>d.data.updateDeviceType;
        });
    }
    public onAddedDeviceType(hook: AddedDeviceType) {
        this.subscribe(addedDeviceType, {}).subscribe({
            next: result => {
                return hook.onAddedDeviceType(result.value.data.addedDeviceType);
            }
        });
    }
    public onUpdatedDeviceType(hook: UpdatedDeviceType) {
        this.subscribe(updatedDeviceType, {}).subscribe({
            next: result => {
                return hook.onUpdatedDeviceType(result.value.data.updatedDeviceType);
            }
        });
    }
    public onDeletedDeviceType(hook: DeletedDeviceType) {
        this.subscribe(deletedDeviceType, {}).subscribe({
            next: result => {
                return hook.onDeletedDeviceType(result.value.data.deletedDeviceType);
            }
        });
    }

    // Deployments
    public listDeployments(limit: number, nextToken: String) {
        return this.query(listDeployments, { limit: limit, nextToken: nextToken }).then(
            result => result.data.listDeployments
        );
    }

    // Device Blueprints
    public listDeviceBlueprints(limit: number, nextToken: string) {
        return this.query(listDeviceBlueprints, { limit: limit, nextToken: nextToken }).then(result => {
            return result.data.listDeviceBlueprints;
        });
    }
    public getDeviceBlueprint(id: string) {
        return this.query(getDeviceBlueprint, { id: id }).then(d => <DeviceBlueprint>d.data.getDeviceBlueprint);
    }
    public addDeviceBlueprint(deviceBlueprint: DeviceBlueprint) {
        delete deviceBlueprint.id;
        return this.mutation(addDeviceBlueprint, {
            name: deviceBlueprint.name,
            type: deviceBlueprint.type,
            spec: deviceBlueprint.spec
        }).then(b => {
            return <DeviceBlueprint>b.data.addBlueprint;
        });
    }
    public deleteDeviceBlueprint(id: string) {
        return this.mutation(deleteDeviceBlueprint, {
            id: id
        }).then(b => {
            return <DeviceBlueprint>b.data.deleteBlueprint;
        });
    }
    public updateDeviceBlueprint(deviceBlueprint: DeviceBlueprint) {
        delete deviceBlueprint.updatedAt;
        return this.mutation(updateDeviceBlueprint, deviceBlueprint).then(b => {
            return <DeviceBlueprint>b.data.updateBlueprint;
        });
    }
    public onAddedDeviceBlueprint(hook: AddedDeviceBlueprint) {
        this.subscribe(addedDeviceBlueprint, {}).subscribe({
            next: result => {
                return hook.onAddedDeviceBlueprint(result.value.data.addedDeviceBlueprint);
            }
        });
    }
    public onUpdatedDeviceBlueprint(hook: UpdatedDeviceBlueprint) {
        this.subscribe(updatedDeviceBlueprint, {}).subscribe({
            next: result => {
                return hook.onUpdatedDeviceBlueprint(result.value.data.updatedDeviceBlueprint);
            }
        });
    }
    public onDeletedDeviceBlueprint(hook: DeletedDeviceBlueprint) {
        this.subscribe(deletedDeviceBlueprint, {}).subscribe({
            next: result => {
                return hook.onDeletedDeviceBlueprint(result.value.data.deletedDeviceBlueprint);
            }
        });
    }

    // Devices
    public listDevices(limit: number, nextToken: string) {
        return this.query(listDevices, { limit: limit, nextToken: nextToken }).then(result => {
            return result.data.listDevices;
        });
    }
    public listDevicesOfDeviceType(limit: number, nextToken: String) {
        return this.query(listDevicesOfDeviceType, { limit: limit, nextToken: nextToken }).then(
            result => result.data.listDevicesOfDeviceType
        );
    }
    public listDevicesWithDeviceBlueprint(limit: number, nextToken: String) {
        return this.query(listDevicesWithDeviceBlueprint, { limit: limit, nextToken: nextToken }).then(
            result => result.data.listDevicesWithDeviceBlueprint
        );
    }
    public getDevice(thingId: string) {
        return this.query(getDevice, { thingId: thingId }).then(d => <Device>d.data.getDevice);
    }
    public getDeviceStats() {
        return this.query(getDeviceStats, {}).then(result => <Stats>result.data.getDeviceStats);
    }
    public addDevice(thingName: string, isGreengrass: boolean) {
        return this.mutation(addDevice, { thingName: thingName, isGreengrass: isGreengrass }).then(result => {
            return <Device>result.data.device;
        });
    }
    public deleteDevice(thingId: string) {
        return this.mutation(deleteDevice, { thingId: thingId }).then(d => {
            return <Device>d.data.deleteDevice;
        });
    }
    public updateDevice(thingId: string, name: string, deviceTypeId: string, deviceBlueprintId: string) {
        return this.mutation(updateDevice, {
            thingId: thingId,
            name: name,
            deviceTypeId: deviceTypeId,
            deviceBlueprintId: deviceBlueprintId
        }).then(d => {
            return <Device>d.data.updateDevice;
        });
    }
    public onAddedDevice(hook: AddedDevice) {
        this.subscribe(addedDevice, {}).subscribe({
            next: result => {
                return hook.onAddedDevice(result.value.data.addedDevice);
            }
        });
    }
    public onUpdatedDevice(hook: UpdatedDevice) {
        this.subscribe(updatedDevice, {}).subscribe({
            next: result => {
                return hook.onUpdatedDevice(result.value.data.updatedDevice);
            }
        });
    }
    public onDeletedDevice(hook: DeletedDevice) {
        this.subscribe(deletedDevice, {}).subscribe({
            next: result => {
                return hook.onDeletedDevice(result.value.data.deletedDevice);
            }
        });
    }

    // Factory Reset
    public factoryReset(cmd) {
        return this.query(factoryReset, { cmd: cmd }).then(result => {
            return <boolean>result.data.factoryReset;
        });
    }

    // Settings
    public getSetting(id: string) {
        return this.query(getSetting, { id: id }).then(result => {
            if (result.data.getSetting !== null) {
                result.data.getSetting.setting = JSON.parse(result.data.getSetting.setting);
            }
            return <Setting>result.data.getSetting;
        });
    }
    public getThingAutoRegistrationState() {
        return this.query(getThingAutoRegistrationState, {}).then(result => {
            return result.data.getThingAutoRegistrationState;
        });
    }
    public setThingAutoRegistrationState(enabled: boolean) {
        return this.query(setThingAutoRegistrationState, { enabled: enabled }).then(result => {
            return result.data.setThingAutoRegistrationState;
        });
    }

    // Devices
    public listSolutions(limit: number, nextToken: string) {
        console.log('appsync list solutions');
        return this.query(listSolutions, { limit: limit, nextToken: nextToken }).then(result => {
            console.log('query result', result);
            return result.data.listSolutions;
        });
    }
    public getSolution(id: string) {
        return this.query(getSolution, { id: id }).then(d => <Solution>d.data.getSolution);
    }
    // public getSolutionStats() {
    //     return this.query(getSolutionStats, {}).then(result => <Stats>result.data.getSolutionStats);
    // }
    public addSolution(name: string, solutionBlueprintId: string) {
        return this.mutation(addSolution, {
            name: name,
            solutionBlueprintId: solutionBlueprintId
        }).then(result => {
            return <Solution>result.data.solution;
        });
    }
    public deleteSolution(id: string) {
        return this.mutation(deleteSolution, { id: id }).then(d => {
            return <Solution>d.data.deleteSolution;
        });
    }
    public updateSolution(id: string, name: string) {
        return this.mutation(updateSolution, {
            id: id,
            name: name
        }).then(d => {
            return <Solution>d.data.updateSolution;
        });
    }
    public onAddedSolution(hook: AddedSolution) {
        this.subscribe(addedSolution, {}).subscribe({
            next: result => {
                return hook.onAddedSolution(result.value.data.addedSolution);
            }
        });
    }
    public onUpdatedSolution(hook: UpdatedSolution) {
        this.subscribe(updatedSolution, {}).subscribe({
            next: result => {
                return hook.onUpdatedSolution(result.value.data.updatedSolution);
            }
        });
    }
    public onDeletedSolution(hook: DeletedSolution) {
        this.subscribe(deletedSolution, {}).subscribe({
            next: result => {
                return hook.onDeletedSolution(result.value.data.deletedSolution);
            }
        });
    }
}
