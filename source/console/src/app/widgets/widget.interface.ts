
import { IoTPubSuber } from '@secure/common/iot-pubsuber.component';

export interface IoTPubSuberPlusHelpers extends IoTPubSuber {
    getValueByString(str: string): any;
    setValueByString(str: string, value: any): void;
}

export interface Widget {
    parent: any;
    data: any;
}
