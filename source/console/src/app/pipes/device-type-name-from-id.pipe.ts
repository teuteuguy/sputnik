import { Pipe, PipeTransform } from '@angular/core';

import { DeviceType } from '../models/device-type.model';

@Pipe({ name: 'deviceTypeNameFromId', pure: true })

export class DeviceTypeNameFromIdPipe implements PipeTransform {
    transform(id: string, deviceTypes: DeviceType[]): string {
        const index = deviceTypes.findIndex((dt: DeviceType) => {
            return dt.id === id;
        });
        if (index !== -1) {
            return deviceTypes[index].name;
        } else {
            return '';
        }
    }
}
