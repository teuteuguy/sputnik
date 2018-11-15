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
import { SolutionBlueprint } from '../models/solution-blueprint.model';
import { DeviceStats, SolutionStats, SolutionBlueprintStats } from '../models/stats.model';

// Queries
// import getAllDeviceTypes from '../graphql/queries/getAllDeviceTypes';
import factoryReset from '../graphql/mutations/factoryReset';
import getDevice from '../graphql/queries/device.get';
import getDeviceBlueprint from '../graphql/queries/device-blueprint.get';
import getDeviceStats from '../graphql/queries/device.getStats';
import getDeviceType from '../graphql/queries/device-type.get';
import getSetting from '../graphql/queries/setting.get';
import getSolution from '../graphql/queries/solution.get';
import getSolutionStats from '../graphql/queries/solution.getStats';
import getSolutionBlueprint from '../graphql/queries/solution-blueprint.get';
import getThingAutoRegistrationState from '../graphql/queries/thing-auto-registration-state.get';
import listDeployments from '../graphql/queries/deployments.list';
import listDevices from '../graphql/queries/devices.list';
import listDevicesOfDeviceType from '../graphql/queries/devices-of-device-type.list';
import listDevicesWithDeviceBlueprint from '../graphql/queries/devices-with-device-blueprint.list';
import listDeviceBlueprints from '../graphql/queries/device-blueprints.list';
import listDeviceTypes from '../graphql/queries/device-types.list';
import listSolutions from '../graphql/queries/solutions.list';
import listSolutionBlueprints from '../graphql/queries/solution-blueprints.list';
// Mutations
import addDeployment from '../graphql/mutations/deployment.add';
import addDevice from '../graphql/mutations/device.add';
import addDeviceBlueprint from '../graphql/mutations/device-blueprint.add';
import addDeviceType from '../graphql/mutations/device-type.add';
import addSolution from '../graphql/mutations/solution.add';
import addSolutionBlueprint from '../graphql/mutations/solution-blueprint.add';
import deleteDevice from '../graphql/mutations/device.delete';
import deleteDeviceBlueprint from '../graphql/mutations/device-blueprint.delete';
import deleteDeviceType from '../graphql/mutations/device-type.delete';
import deleteSolution from '../graphql/mutations/solution.delete';
import deleteSolutionBlueprint from '../graphql/mutations/solution-blueprint.delete';
import refreshSolution from '../graphql/mutations/solution.refresh';
import setThingAutoRegistrationState from '../graphql/mutations/thing-auto-registration-state.set';
import updateDevice from '../graphql/mutations/device.update';
import updateDeviceBlueprint from '../graphql/mutations/device-blueprint.update';
import updateDeviceType from '../graphql/mutations/device-type.update';
import updateSetting from '../graphql/mutations/setting.update';
import updateSolution from '../graphql/mutations/solution.update';
import updateSolutionBlueprint from '../graphql/mutations/solution-blueprint.update';
// Subscriptions
import addedDevice from '../graphql/subscriptions/device.added';
import addedDeviceBlueprint from '../graphql/subscriptions/device-blueprint.added';
import addedDeviceType from '../graphql/subscriptions/device-type.added';
import addedSolution from '../graphql/subscriptions/solution.added';
import addedSolutionBlueprint from '../graphql/subscriptions/solution-blueprint.added';
import deletedDevice from '../graphql/subscriptions/device.deleted';
import deletedDeviceBlueprint from '../graphql/subscriptions/device-blueprint.deleted';
import deletedDeviceType from '../graphql/subscriptions/device-type.deleted';
import deletedSolution from '../graphql/subscriptions/solution.deleted';
import deletedSolutionBlueprint from '../graphql/subscriptions/solution-blueprint.deleted';
import updatedDevice from '../graphql/subscriptions/device.updated';
import updatedDeviceBlueprint from '../graphql/subscriptions/device-blueprint.updated';
import updatedDeviceType from '../graphql/subscriptions/device-type.updated';
import updatedSolution from '../graphql/subscriptions/solution.updated';
import updatedSolutionBlueprint from '../graphql/subscriptions/solution-blueprint.updated';

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
export interface AddedSolutionBlueprint {
    onAddedSolutionBlueprint(result: SolutionBlueprint): void;
}
export interface UpdatedSolutionBlueprint {
    onUpdatedSolutionBlueprint(result: SolutionBlueprint): void;
}
export interface DeletedSolutionBlueprint {
    onDeletedSolutionBlueprint(result: SolutionBlueprint): void;
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
    private cleanIncomingDeviceType(deviceType: DeviceType) {
        if (deviceType.spec) {
            deviceType.spec = JSON.parse(deviceType.spec);
        }
        return deviceType;
    }
    private cleanOutgoingDeviceType(deviceType: DeviceType) {
        deviceType.spec = JSON.stringify(deviceType.spec);
        return deviceType;
    }
    public listDeviceTypes(limit: number, nextToken: string) {
        return this.query(listDeviceTypes, {
            limit: limit,
            nextToken: nextToken
        }).then(r => {
            r.data.listDeviceTypes.deviceTypes = r.data.listDeviceTypes.deviceTypes.map(d =>
                this.cleanIncomingDeviceType(d)
            );
            return r.data.listDeviceTypes;
        });
    }
    public getDeviceType(id: string) {
        return this.query(getDeviceType, {
            id: id
        }).then(d => this.cleanIncomingDeviceType(d.data.getDeviceType));
    }
    public addDeviceType(deviceType: DeviceType) {
        deviceType = this.cleanOutgoingDeviceType(deviceType);
        delete deviceType.id;
        delete deviceType.createdAt;
        delete deviceType.updatedAt;
        return this.mutation(addDeviceType, {
            name: deviceType.name,
            type: deviceType.type,
            spec: deviceType.spec
        }).then(d => this.cleanIncomingDeviceType(d.data.addDeviceType));
    }
    public deleteDeviceType(id: string) {
        return this.mutation(deleteDeviceType, {
            id: id
        }).then(d => this.cleanIncomingDeviceType(d.data.deleteDeviceType));
    }
    public updateDeviceType(deviceType: DeviceType) {
        deviceType = this.cleanOutgoingDeviceType(deviceType);
        delete deviceType.updatedAt;
        delete deviceType.createdAt;
        return this.mutation(updateDeviceType, deviceType).then(d =>
            this.cleanIncomingDeviceType(d.data.updateDeviceType)
        );
    }
    public onAddedDeviceType(hook: AddedDeviceType) {
        this.subscribe(addedDeviceType, {}).subscribe({
            next: result => {
                return hook.onAddedDeviceType(this.cleanIncomingDeviceType(result.value.data.addedDeviceType));
            }
        });
    }
    public onUpdatedDeviceType(hook: UpdatedDeviceType) {
        this.subscribe(updatedDeviceType, {}).subscribe({
            next: result => {
                return hook.onUpdatedDeviceType(this.cleanIncomingDeviceType(result.value.data.updatedDeviceType));
            }
        });
    }
    public onDeletedDeviceType(hook: DeletedDeviceType) {
        this.subscribe(deletedDeviceType, {}).subscribe({
            next: result => {
                return hook.onDeletedDeviceType(this.cleanIncomingDeviceType(result.value.data.deletedDeviceType));
            }
        });
    }

    // Deployments
    private cleanIncomingDeployment(deployment: Deployment) {
        if (deployment.spec) {
            deployment.spec = JSON.parse(deployment.spec);
        }
        return deployment;
    }
    public listDeployments(limit: number, nextToken: String) {
        return this.query(listDeployments, { limit: limit, nextToken: nextToken }).then(
            result => result.data.listDeployments
        );
    }
    public addDeployment(thingId: String) {
        return this.mutation(addDeployment, { thingId: thingId }).then(result =>
            this.cleanIncomingDeployment(result.data.addDeployment)
        );
    }

    // Device Blueprints
    private cleanIncomingDeviceBlueprint(deviceBlueprint: DeviceBlueprint) {
        if (deviceBlueprint.deviceTypeMappings) {
            deviceBlueprint.deviceTypeMappings = JSON.parse(deviceBlueprint.deviceTypeMappings);
        }
        if (deviceBlueprint.spec) {
            deviceBlueprint.spec = JSON.parse(deviceBlueprint.spec);
        }
        return deviceBlueprint;
    }
    private cleanOutgoingDeviceBlueprint(deviceBlueprint: DeviceBlueprint) {
        deviceBlueprint.deviceTypeMappings = JSON.stringify(deviceBlueprint.deviceTypeMappings);
        deviceBlueprint.spec = JSON.stringify(deviceBlueprint.spec);
        return deviceBlueprint;
    }
    public listDeviceBlueprints(limit: number, nextToken: string) {
        return this.query(listDeviceBlueprints, { limit: limit, nextToken: nextToken }).then(r => {
            r.data.listDeviceBlueprints.deviceBlueprints = r.data.listDeviceBlueprints.deviceBlueprints.map(d =>
                this.cleanIncomingDeviceBlueprint(d)
            );
            return r.data.listDeviceBlueprints;
        });
    }
    public getDeviceBlueprint(id: string) {
        // return this.query(getDeviceBlueprint, { id: id }).then(r => r.data.getDeviceBlueprint);
        return this.query(getDeviceBlueprint, { id: id }).then(r => {
            return this.cleanIncomingDeviceBlueprint(r.data.getDeviceBlueprint);
        });
    }
    public addDeviceBlueprint(deviceBlueprint: DeviceBlueprint) {
        deviceBlueprint = this.cleanOutgoingDeviceBlueprint(deviceBlueprint);
        delete deviceBlueprint.id;
        delete deviceBlueprint.updatedAt;
        delete deviceBlueprint.createdAt;
        return this.mutation(addDeviceBlueprint, deviceBlueprint).then(r => {
            return this.cleanIncomingDeviceBlueprint(r.data.addDeviceBlueprint);
        });
    }
    public deleteDeviceBlueprint(id: string) {
        // return this.mutation(deleteDeviceBlueprint, { id: id }).then(r => r.data.deleteDeviceBlueprint);
        return this.mutation(deleteDeviceBlueprint, {
            id: id
        }).then(r => {
            console.log(r);
            return this.cleanIncomingDeviceBlueprint(r.data.deleteDeviceBlueprint);
        });
    }
    public updateDeviceBlueprint(deviceBlueprint: DeviceBlueprint) {
        deviceBlueprint = this.cleanOutgoingDeviceBlueprint(deviceBlueprint);
        delete deviceBlueprint.updatedAt;
        delete deviceBlueprint.createdAt;
        console.log(deviceBlueprint);
        return this.mutation(updateDeviceBlueprint, deviceBlueprint).then(r => {
            return this.cleanIncomingDeviceBlueprint(r.data.updateDeviceBlueprint);
        });
    }
    public onAddedDeviceBlueprint(hook: AddedDeviceBlueprint) {
        this.subscribe(addedDeviceBlueprint, {}).subscribe({
            next: result => {
                return hook.onAddedDeviceBlueprint(
                    this.cleanIncomingDeviceBlueprint(result.value.data.addedDeviceBlueprint)
                );
            }
        });
    }
    public onUpdatedDeviceBlueprint(hook: UpdatedDeviceBlueprint) {
        this.subscribe(updatedDeviceBlueprint, {}).subscribe({
            next: result => {
                return hook.onUpdatedDeviceBlueprint(
                    this.cleanIncomingDeviceBlueprint(result.value.data.updatedDeviceBlueprint)
                );
            }
        });
    }
    public onDeletedDeviceBlueprint(hook: DeletedDeviceBlueprint) {
        this.subscribe(deletedDeviceBlueprint, {}).subscribe({
            next: result => {
                console.log('onDelete', result);
                return hook.onDeletedDeviceBlueprint(
                    this.cleanIncomingDeviceBlueprint(result.value.data.deletedDeviceBlueprint)
                );
            }
        });
    }

    // Devices
    private cleanIncomingDevice(device: Device) {
        if (device.spec) {
            device.spec = JSON.parse(device.spec);
        }
        return device;
    }
    public listDevices(limit: number, nextToken: string) {
        return this.query(listDevices, { limit: limit, nextToken: nextToken }).then(result => {
            result.data.listDevices.devices = result.data.listDevices.devices.map(r => this.cleanIncomingDevice(r));
            return result.data.listDevices;
        });
    }
    public listDevicesOfDeviceType(deviceTypeId: String, limit: number, nextToken: String) {
        return this.query(listDevicesOfDeviceType, {
            deviceTypeId: deviceTypeId,
            limit: limit,
            nextToken: nextToken
        }).then(result => {
            result.data.listDevicesOfDeviceType.devices = result.data.listDevicesOfDeviceType.devices.map(r =>
                this.cleanIncomingDevice(r)
            );
            return result.data.listDevicesOfDeviceType;
        });
    }
    public listDevicesWithDeviceBlueprint(deviceBlueprintId: String, limit: number, nextToken: String) {
        return this.query(listDevicesWithDeviceBlueprint, {
            deviceBlueprintId: deviceBlueprintId,
            limit: limit,
            nextToken: nextToken
        }).then(result => {
            result.data.listDevicesWithDeviceBlueprint.devices = result.data.listDevicesWithDeviceBlueprint.devices.map(
                r => this.cleanIncomingDevice(r)
            );
            return result.data.listDevicesWithDeviceBlueprint;
        });
    }
    public getDevice(thingId: string) {
        return this.query(getDevice, { thingId: thingId }).then(d => this.cleanIncomingDevice(d.data.getDevice));
    }
    public getDeviceStats() {
        return this.query(getDeviceStats, {}).then(result => <DeviceStats>result.data.getDeviceStats);
    }
    public addDevice(
        thingName: string,
        deviceTypeId: string = 'UNKNOWN',
        deviceBlueprintId: string = 'UNKNOWN',
        spec: any = {},
        generateCert: boolean = true
    ) {
        return this.mutation(addDevice, {
            thingName: thingName,
            spec: JSON.stringify(spec),
            generateCert: generateCert,
            deviceTypeId: deviceTypeId,
            deviceBlueprintId: deviceBlueprintId
        }).then(result => this.cleanIncomingDevice(result.data.addDevice));
    }
    public deleteDevice(thingId: string) {
        return this.mutation(deleteDevice, { thingId: thingId }).then(d =>
            this.cleanIncomingDevice(d.data.deleteDevice)
        );
    }
    public updateDevice(device: Device) {
        const obj = {
            thingId: device.thingId,
            name: device.name,
            spec: JSON.stringify(device.spec),
            deviceTypeId: device.deviceTypeId,
            deviceBlueprintId: device.deviceBlueprintId
        };
        // console.log('updateDevice mutation with:', obj);
        return this.mutation(updateDevice, obj).then(d => {
            // console.log('updateDevice mutation return:', d);
            return this.cleanIncomingDevice(d.data.updateDevice);
        });
    }
    public onAddedDevice(hook: AddedDevice) {
        this.subscribe(addedDevice, {}).subscribe({
            next: result => {
                return hook.onAddedDevice(this.cleanIncomingDevice(result.value.data.addedDevice));
            }
        });
    }
    public onUpdatedDevice(hook: UpdatedDevice) {
        this.subscribe(updatedDevice, {}).subscribe({
            next: result => {
                return hook.onUpdatedDevice(this.cleanIncomingDevice(result.value.data.updatedDevice));
            }
        });
    }
    public onDeletedDevice(hook: DeletedDevice) {
        this.subscribe(deletedDevice, {}).subscribe({
            next: result => {
                return hook.onDeletedDevice(this.cleanIncomingDevice(result.value.data.deletedDevice));
            }
        });
    }

    // Factory Reset
    public factoryReset(cmd: string) {
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
    public updateSetting(setting: Setting) {
        return this.query(updateSetting, { id: setting.id, type: setting.type, setting: JSON.stringify(setting.setting) }).then(result => {
            if (result.data.updateSetting !== null) {
                result.data.updateSetting.setting = JSON.parse(result.data.updateSetting.setting);
            }
            return <Setting>result.data.updateSetting;
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

    // Solutions
    public listSolutions(limit: number, nextToken: string) {
        return this.query(listSolutions, { limit: limit, nextToken: nextToken }).then(result => {
            return result.data.listSolutions;
        });
    }
    public getSolution(id: string) {
        return this.query(getSolution, { id: id }).then(d => <Solution>d.data.getSolution);
    }
    public getSolutionStats() {
        return this.query(getSolutionStats, {}).then(result => <SolutionStats>result.data.getSolutionStats);
    }
    public addSolution(name: string, description: string, deviceIds: string[], solutionBlueprintId: string) {
        return this.mutation(addSolution, {
            name: name,
            description: description,
            deviceIds: deviceIds,
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
    public updateSolution(id: string, name: string, description: string, deviceIds: string[]) {
        return this.mutation(updateSolution, {
            id: id,
            name: name,
            description: description,
            deviceIds: deviceIds
        }).then(d => {
            return <Solution>d.data.updateSolution;
        });
    }
    public refreshSolution(id: string) {
        return this.mutation(refreshSolution, {
            id: id
        }).then(r => r.data.refreshSolution);
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

    // Solution Blueprints
    private cleanIncomingSolutionBlueprint(solutionBlueprint: SolutionBlueprint) {
        if (solutionBlueprint.spec) {
            solutionBlueprint.spec = JSON.parse(solutionBlueprint.spec);
        }
        return solutionBlueprint;
    }
    private cleanOutgoingSolutionBlueprint(solutionBlueprint: SolutionBlueprint) {
        solutionBlueprint.spec = JSON.stringify(solutionBlueprint.spec);
        return solutionBlueprint;
    }
    public listSolutionBlueprints(limit: number, nextToken: string) {
        return this.query(listSolutionBlueprints, { limit: limit, nextToken: nextToken }).then(result => {
            result.data.listSolutionBlueprints.solutionBlueprints = result.data.listSolutionBlueprints.solutionBlueprints.map(
                r => this.cleanIncomingSolutionBlueprint(r)
            );
            return result.data.listSolutionBlueprints;
        });
    }
    public getSolutionBlueprint(id: string) {
        return this.query(getSolutionBlueprint, {
            id: id
        }).then(d => this.cleanIncomingSolutionBlueprint(d.data.getSolutionBlueprint));
    }
    public addSolutionBlueprint(solutionBlueprint: SolutionBlueprint) {
        solutionBlueprint = this.cleanOutgoingSolutionBlueprint(solutionBlueprint);
        delete solutionBlueprint.id;
        delete solutionBlueprint.createdAt;
        delete solutionBlueprint.updatedAt;
        return this.mutation(addSolutionBlueprint, {
            name: solutionBlueprint.name,
            description: solutionBlueprint.description,
            spec: solutionBlueprint.spec
        }).then(r => this.cleanIncomingSolutionBlueprint(r.data.addSolutionBlueprint));
    }
    public deleteSolutionBlueprint(id: string) {
        return this.mutation(deleteSolutionBlueprint, {
            id: id
        }).then(r => this.cleanIncomingSolutionBlueprint(r.data.deleteSolutionBlueprint));
    }
    public updateSolutionBlueprint(solutionBlueprint: SolutionBlueprint) {
        solutionBlueprint = this.cleanOutgoingSolutionBlueprint(solutionBlueprint);
        delete solutionBlueprint.updatedAt;
        delete solutionBlueprint.createdAt;
        return this.mutation(updateSolutionBlueprint, solutionBlueprint).then(r =>
            this.cleanIncomingSolutionBlueprint(r.data.updateSolutionBlueprint)
        );
    }
    public onAddedSolutionBlueprint(hook: AddedSolutionBlueprint) {
        this.subscribe(addedSolutionBlueprint, {}).subscribe({
            next: result => {
                return hook.onAddedSolutionBlueprint(
                    this.cleanIncomingSolutionBlueprint(result.value.data.addedSolutionBlueprint)
                );
            }
        });
    }
    public onUpdatedSolutionBlueprint(hook: UpdatedSolutionBlueprint) {
        this.subscribe(updatedSolutionBlueprint, {}).subscribe({
            next: result => {
                return hook.onUpdatedSolutionBlueprint(
                    this.cleanIncomingSolutionBlueprint(result.value.data.updatedSolutionBlueprint)
                );
            }
        });
    }
    public onDeletedSolutionBlueprint(hook: DeletedSolutionBlueprint) {
        this.subscribe(deletedSolutionBlueprint, {}).subscribe({
            next: result => {
                return hook.onDeletedSolutionBlueprint(
                    this.cleanIncomingSolutionBlueprint(result.value.data.deletedSolutionBlueprint)
                );
            }
        });
    }
}
