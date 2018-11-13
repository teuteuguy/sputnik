import { Component, OnInit, ComponentFactoryResolver, NgZone } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { Router, NavigationExtras } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import swal from 'sweetalert2';

// Parent
import {
    GenericTableComponent,
    GenericTableParams,
    GenericTableElementParams
} from '../common/generic-table.component';

// Childs
import { SolutionsModalComponent } from './solutions.modal.component';
import { SolutionEditModalComponent } from '../solution/solution.edit.modal.component';

// Models
import { Solution } from '../../models/solution.model';
import { ProfileInfo } from '../../models/profile-info.model';

// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service';
import { LoggerService } from '../../services/logger.service';
import { SolutionService } from '../../services/solution.service';
import { StatService, Stats } from '../../services/stat.service';

// Helpers
import * as moment from 'moment';

@Component({
    selector: 'app-root-solutions',
    templateUrl: '../../common/components/generic-table/generic-table.component.html'
})
export class SolutionsComponent extends GenericTableComponent implements OnInit {
    private isAdminUser: boolean;
    private profile: ProfileInfo;

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        private breadCrumbService: BreadCrumbService,
        private logger: LoggerService,
        private solutionService: SolutionService,
        private localStorage: LocalStorage,
        private statService: StatService,
        private resolver: ComponentFactoryResolver,
        private ngZone: NgZone
    ) {
        super(logger, resolver);

        this.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            this.profile = new ProfileInfo(profile);
            this.isAdminUser = this.profile.isAdmin();

            this.params = <GenericTableParams>{
                path: '/securehome/solutions',
                pageTitle: 'Solutions',
                createElement: <GenericTableElementParams>{
                    text: 'Create NEW Solution',
                    modal: SolutionsModalComponent,
                    modalName: 'defaultSolutionModal',
                    link: false
                },
                editElement: <GenericTableElementParams>{
                    text: 'Edit',
                    modal: SolutionEditModalComponent,
                    modalName: 'editSolutionModal',
                    link: false
                },
                viewElement: <GenericTableElementParams>{ text: 'View', modal: null, link: true },
                fieldLink: 'name',
                deleteElement: this.isAdminUser,
                fields: [
                    // { attr: 'type', text: 'type' },
                    { attr: 'name', text: 'Name' },
                    { attr: 'createdAt', text: 'Created At', class: 'text-right', format: 'date' },
                    { attr: 'updatedAt', text: 'Last Updated At', class: 'text-right', format: 'date' }
                ],
                cachedMode: false
            };
        });

        statService.statObservable$.subscribe((message: Stats) => {
            this.dataStats = message.solutionStats;
            this.ngZone.run(() => {});
        });

        statService.refresh();
    }

    ngOnInit() {
        const _self = this;
        _self.blockUI.start('Loading solutions...');

        _self.breadCrumbService.setup(_self.params.pageTitle, [
            new Crumb({ title: _self.params.pageTitle, active: true, link: 'solutions' })
        ]);

        _self.handleDelete.subscribe((element: Solution) => {
            swal({
                title: 'Are you sure you want to delete this solution?',
                text: `You won't be able to revert this!`,
                type: 'question',
                showCancelButton: true,
                cancelButtonColor: '#3085d6',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then(result => {
                if (result.value) {
                    _self.blockUI.start('Deleting device...');
                    _self.solutionService
                        .delete(element.id)
                        .then((resp: any) => {
                            console.log(resp);
                            _self.blockUI.stop();
                        })
                        .catch(err => {
                            _self.blockUI.stop();
                            swal('Oops...', 'Something went wrong! Unable to delete the solution.', 'error');
                            _self.logger.error('error occurred calling deleteSolution api, show message');
                            _self.logger.error(err);
                        });
                }
            });
        });

        _self.load();
    }

    private getSolutions(ofPage: number, nextToken: string) {
        return this.solutionService.list(this.pages.pageSize, nextToken).then(data1 => {
            if (ofPage === 0) {
                return data1;
            } else if (data1.nextToken) {
                return this.getSolutions(ofPage - 1, data1.nextToken).then(data2 => {
                    return data2;
                });
            } else {
                throw new Error('Something is wrong');
            }
        });
    }

    load() {
        const _self = this;

        return _self
            .getSolutions(_self.pages.current - 1, null)
            .then(results => {
                console.log(results);
                _self.data = results.solutions;
                _self.updatePaging();
                _self.blockUI.stop();
            })
            .catch(err => {
                swal('Oops...', 'Something went wrong! Unable to retrieve the solutions.', 'error');
                _self.logger.error('error occurred calling listSolutions api');
                _self.logger.error(err);
                _self.router.navigate(['/securehome/solutions']);
            });
    }

    open(elem: Solution) {
        this.router.navigate([['/securehome/solutions', elem.id].join('/')]);
    }

    refreshData() {
        this.blockUI.start('Loading solutions...');
        this.pages.current = 1;
        this.load();
    }

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
