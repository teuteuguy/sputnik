import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// AWS
import { AmplifyService } from 'aws-amplify-angular';

// Models
import { DeviceType } from '../models/device-type.model';

// Services
import { LoggerService } from './logger.service';
import { AppSyncService } from './appsync.service';

// Helpers
import { _ } from 'underscore';

// Queries
// import getAllDeviceTypes from '../graphql/queries/getAllDeviceTypes';
import getDeviceTypes from '../graphql/queries/device-types.get';
import getDeviceType from '../graphql/queries/device-type.get';
// Mutations
import addDeviceType from '../graphql/mutations/device-type.add';
import deleteDeviceType from '../graphql/mutations/device-type.delete';
import updateDeviceType from '../graphql/mutations/device-type.update';
// Subscriptions
import addedDeviceType from '../graphql/subscriptions/device-type.added';
import deletedDeviceType from '../graphql/subscriptions/device-type.deleted';
import updatedDeviceType from '../graphql/subscriptions/device-type.updated';

@Injectable()
export class DeviceTypeService extends AppSyncService {
    private limit = 10;
    private observable: any = new Subject<any>();
    private deviceTypes: DeviceType[] = [];
    public deviceTypesObservable$ = this.observable.asObservable();

    constructor(private logger: LoggerService, private amplifyService: AmplifyService) {
        super(amplifyService);
        const _self = this;

        super.subscribe(addedDeviceType, {}).subscribe({
            next: result => {
                // _self.deviceTypes.push(result.value.data.addedDeviceType);
                // _self.observable.next(result.value.data.addedDeviceType);
                _self.loadDeviceTypes();
            }
        });

        super.subscribe(updatedDeviceType, {}).subscribe({
            next: result => {
                // const index = _.findIndex(_self.deviceTypes, deviceType => {
                //     return deviceType.id === result.value.data.updatedDeviceType.id;
                // });
                // if (index !== -1) {
                //     _self.deviceTypes[index] = JSON.parse(JSON.stringify(result.value.data.updatedDeviceType));
                // } else {
                //     console.error('Something went wrong! The index was not found');
                //     console.log(result.value.data.updatedDeviceType, _self.deviceTypes);
                // }
                // _self.observable.next(result.value.data.updatedDeviceType);
                _self.loadDeviceTypes();
            }
        });

        super.subscribe(deletedDeviceType, {}).subscribe({
            next: result => {
                // const index = _.findIndex(_self.deviceTypes, deviceType => {
                //     return deviceType.id === result.value.data.deletedDeviceType.id;
                // });
                // if (index !== -1) {
                //     _self.deviceTypes.splice(index, 1);
                // } else {
                //     console.error('Something went wrong! The index was not found');
                //     console.log(result.value.data.deletedDeviceType, _self.deviceTypes);
                // }
                // _self.observable.next(result.value.data.deletedDeviceType);
                _self.loadDeviceTypes();
            }
        });

        _self.loadDeviceTypes();
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

    private _getDeviceTypes(limit: number, nexttoken: string) {
        const _self = this;

        return super.query(getDeviceTypes, { limit: limit, nextToken: nexttoken }).then(result => {
            let _devicetypes: DeviceType[];
            _devicetypes = result.data.getDeviceTypes.deviceTypes;
            if (result.data.getDeviceTypes.nextToken) {
                return _self._getDeviceTypes(limit, result.data.getDeviceTypes.nextToken).then(data => {
                    _devicetypes.push(data);
                    return _devicetypes;
                });
            } else {
                return _devicetypes;
            }
        });
    }

    private loadDeviceTypes() {
        const _self = this;
        _self._getDeviceTypes(_self.limit, null).then((results: DeviceType[]) => {
            _self.pushNewDeviceTypes(results);
            _self.observable.next(results);
        });
    }

    public refresh() {
        this.loadDeviceTypes();
    }

    public getDeviceTypes() {
        const _self = this;
        return _self.deviceTypes;
        // return new Promise((resolve, reject) => {
        //     resolve(_self.deviceTypes);
        // });
        // return this.deviceTypes;
    // public getDeviceTypes(limit: number, nextToken: String) {
    //     return super.query(getDeviceTypes, { limit: limit, nextToken: nextToken }).then(d => d.data.getAllDeviceTypes);
    }

    public getDeviceType(id: string) {
        return this.deviceTypes.find((dt: DeviceType) => {
            return dt.id === id;
        });
        // return super.query(getDeviceType, { id: id }).then(d => <DeviceType>d.data.getDeviceType);
    }

    public addDeviceType(deviceType: DeviceType) {
        delete deviceType.id;
        return super
            .mutation(addDeviceType, {
                name: deviceType.name,
                type: deviceType.type,
                spec: deviceType.spec
            })
            .then(d => {
                return <DeviceType>d.data.addDeviceType;
            });
    }

    public deleteDeviceType(id: string) {
        return super
            .mutation(deleteDeviceType, {
                id: id
            })
            .then(d => {
                return <DeviceType>d.data.deleteDeviceType;
            });
    }

    public updateDeviceType(deviceType: DeviceType) {
        delete deviceType.updatedAt;
        return super.mutation(updateDeviceType, deviceType).then(d => {
            return <DeviceType>d.data.updateDeviceType;
        });
    }
}
