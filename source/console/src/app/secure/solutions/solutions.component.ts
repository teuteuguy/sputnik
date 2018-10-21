import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import swal from 'sweetalert2';

// Parent
import { GenericTableComponent, GenericTableParams, DataStat } from '../common/generic-table.component';

// Models
import { ProfileInfo } from '../../models/profile-info.model';
import { Solution } from '../../models/solution.model';

// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service';
import { LoggerService } from '../../services/logger.service';
import { SolutionService } from '../../services/solution.service';

// Helpers
import * as moment from 'moment';

@Component({
    selector: 'app-root-solutions',
    templateUrl: '../common/generic-table.component.html'
})
export class SolutionsComponent extends GenericTableComponent implements OnInit {
    private solutions: Solution[] = [];
    private solutionStats: DataStat = {
        total: 0
    };

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        private breadCrumbService: BreadCrumbService,
        private logger: LoggerService,
        private _ngZone: NgZone,
        private solutionService: SolutionService
    ) {
        super(<GenericTableParams>{ childPath: '/securehome/solutions', title: 'Solutions' }, router);
        this.data = this.solutions;
        this.dataStats = this.solutionStats;
    }

    ngOnInit() {
        const _self = this;
        _self.blockUI.start('Loading solutions...');

        _self.breadCrumbService.setup(_self.params.title, [
            new Crumb({ title: _self.params.title, active: true, link: _self.params.title.toLowerCase() })
        ]);

        _self.load();
    }

    load() {
        const _self = this;
        return _self.solutionService.listSolutions(_self.pages.pageSize, null).then(results => {
        // return _self.load().then(results => {
            console.log(results);
        // // _self.statService.refresh();
        // return _self.deviceService.listDevices(_self.pages.pageSize, null).then(results => {
        //     console.log(results);
        //     _self.devices = results.devices;
        //     _self.updatePaging();
        //     _self.blockUI.stop();
        }).catch(err => {
            swal('Oops...', 'Something went wrong! Unable to retrieve the solutions.', 'error');
            _self.logger.error('error occurred calling listSolutions api');
            _self.logger.error(err);
            _self.router.navigate(['/securehome/solutions']);
        });
    }

    // refreshData() {
    //     this.blockUI.start('Loading solutions...');
    //     this.load();
    // }

    // openSolution(id: string) {
    //     this.router.navigate([['/securehome/solutions', id].join('/')]);
    // }

    // formatDate(dt: string) {
    //     if (dt) {
    //         return moment(dt).format('MMM Do YYYY');
    //     } else {
    //         return '';
    //     }
    // }

    // nextPage() {
    //     this.pages.current++;
    //     this.blockUI.start('Loading device types...');
    //     this.load();
    // }

    // previousPage() {
    //     this.pages.current--;
    //     this.blockUI.start('Loading device types...');
    //     this.load();
    // }

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
