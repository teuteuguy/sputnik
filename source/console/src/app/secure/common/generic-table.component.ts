import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

// Helpers
import { _ } from 'underscore';

export class GenericTableParams {
    childPath: string;
    title: string;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class DataStat {
    total: number;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

@Component({
    selector: 'app-root',
    templateUrl: './generic-table.component.html'
})
export class GenericTableComponent {
    protected pages: any = {
        current: 1,
        total: 0,
        pageSize: 20
    };
    protected metrics: any = {
        total: 0
    };
    protected data: any[];
    protected dataStats: DataStat;

    constructor(protected params: GenericTableParams, public router: Router) {}

    @BlockUI()
    blockUI: NgBlockUI;

    load() { }

    updatePaging() {
        const _self = this;
        _self.pages.total = Math.ceil(_self.dataStats.total / _self.pages.pageSize);
    }

    refreshData() {
        this.blockUI.start(`Loading ${this.params.title.toLowerCase}...`);
        this.load();
    }

    openSolution(id: string) {
        this.router.navigate([[this.params.childPath, id].join('/')]);
    }

    nextPage() {
        this.pages.current++;
        this.blockUI.start(`Loading ${this.params.title.toLowerCase}...`);
        this.load();
    }

    previousPage() {
        this.pages.current--;
        this.blockUI.start(`Loading ${this.params.title.toLowerCase}...`);
        this.load();
    }

    // showCreateForm() {
    //     this.newDevice = new Device();
    //     $('#createModal').modal('show');
    // }
    // cancelCreateForm(form: NgForm) {
    //     form.reset();
    //     $('#createModal').modal('hide');
    // }
    // submitCreateDevice(value: any) {
    //     const _self = this;

    //     _self.blockUI.start('Creating device...');

    //     _self.deviceService
    //         .addDevice(_self.newDevice.thingName, false)
    //         .then((device: Device) => {
    //             _self.loadDevices();
    //             // TODO: goto the /devices/thingId in the router
    //             $('#createModal').modal('hide');
    //         })
    //         .catch(err => {
    //             _self.blockUI.stop();
    //             swal('Oops...', 'Something went wrong! Unable to update the device.', 'error');
    //             _self.logger.error('error occurred calling updateDevice api, show message');
    //             _self.logger.error(err);
    //             _self.loadDevices();
    //         });

    // }
}
