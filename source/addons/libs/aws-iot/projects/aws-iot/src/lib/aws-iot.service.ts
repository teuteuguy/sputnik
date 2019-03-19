import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AddonIoTService {
    private connectionSubject: any = new Subject<boolean>();
    public connectionObservable$ = this.connectionSubject.asObservable();
    public isConnected = false;

    constructor() {}

    connect() {}

    subscribe(topic: string, onMessage, onError) {
        const observable: any = new Subject<any>();
        return observable.asObservable();
    }

    getThingShadow(params: any) {
        return Promise.resolve();
    }

    updateThingShadow(params: any) {
        return Promise.resolve();
    }
}
