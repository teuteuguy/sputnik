import { OnDestroy } from '@angular/core';
import { AWSIoTService } from './aws-iot.service';
export declare class IoTSubscription {
    topic: string;
    onMessage: (data: any) => void;
    onError: (data: any) => void;
}
export declare class AWSIoTComponent implements OnDestroy {
    private _iotService;
    private subscriptions;
    private iotSubscriptions;
    desired: any;
    reported: any;
    constructor(_iotService: AWSIoTService);
    ngOnDestroy(): void;
    protected subscribe(iotSubscriptions: IoTSubscription[]): void;
    private setSubscriptions;
    protected updateIncomingShadow(incoming: any, shadowField?: any): void;
    protected getLastState(thingName: any, shadowField?: any): any;
    protected updateDesiredShadow(thingName: any, desiredState: any): any;
}
