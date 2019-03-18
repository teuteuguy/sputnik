import { AmplifyService } from 'aws-amplify-angular';
export declare class AWSIoTService {
    private amplifyService;
    private connectionSubject;
    connectionObservable$: any;
    isConnected: boolean;
    constructor(amplifyService: AmplifyService);
    connect(): void;
    subscribe(topic: string, onMessage: any, onError: any): any;
    getThingShadow(params: any): any;
    updateThingShadow(params: any): any;
}
