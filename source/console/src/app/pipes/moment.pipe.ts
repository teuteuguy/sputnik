import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'moment' })
export class MomentPipe implements PipeTransform {
    transform(value: any, format: string): any {
        return moment(value).format(format);
    }
}

@Pipe({ name: 'fromNow' })
export class FromNowPipe implements PipeTransform {
    transform(value: any): any {
        return moment(value).fromNow();
    }
}
