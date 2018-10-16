import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'moment' })
export class MomentPipe implements PipeTransform {
    transform(value: any, format: string): any {
        return moment(value).format(format);
    }
}
