import {
    Component,
    OnInit,
    NgZone,
    ViewChild,
    ViewContainerRef,
    ComponentFactoryResolver,
    ComponentRef,
    ComponentFactory,
    Output
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { LocalStorage } from '@ngx-pwa/local-storage';
import swal from 'sweetalert2';

// SubComponents
import { SystemEditModalComponent } from './system.edit.modal.component';

// Models
import { Device } from '@models/device.model';
import { ProfileInfo } from '@models/profile-info.model';
import { System } from '@models/system.model';

// Services
import { BreadCrumbService, Crumb } from '@services/bread-crumb.service';
import { DeploymentService } from '@services/deployment.service';
import { DeviceService } from '@services/device.service';
import { SystemService } from '@services/system.service';
import { LoggerService } from '@services/logger.service';

declare var $: any;

@Component({
    selector: 'app-root-system',
    templateUrl: './system.component.html'
})
export class SystemComponent implements OnInit {
    private profile: ProfileInfo;

    public isAdminUser: boolean;
    public pageTitle = 'System';
    public id: string;

    public system: System;
    public devices: Device[];

    @BlockUI()
    blockUI: NgBlockUI;
    @ViewChild('editModalTemplate', { read: ViewContainerRef })
    editModalTemplate: ViewContainerRef;

    constructor(
        private breadCrumbService: BreadCrumbService,
        private deploymentService: DeploymentService,
        private deviceService: DeviceService,
        private localStorage: LocalStorage,
        private logger: LoggerService,
        private resolver: ComponentFactoryResolver,
        public route: ActivatedRoute,
        public router: Router,
        private systemService: SystemService,
        private ngZone: NgZone
    ) {
        this.system = new System();
        this.devices = [];
    }

    ngOnInit() {
        const self = this;

        self.blockUI.start('Loading system...');

        self.route.params.subscribe(params => {
            self.system = new System({ id: params['id'] });

            self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
                self.profile = new ProfileInfo(profile);
                self.isAdminUser = self.profile.isAdmin();

                self.breadCrumbService.setup(self.pageTitle, [
                    new Crumb({
                        title: self.pageTitle + 's',
                        link: 'systems'
                    }),
                    new Crumb({
                        title: self.system.id,
                        active: true
                    })
                ]);

                self.loadSystem();
            });
        });
    }

    private loadSystem() {
        const self = this;

        self.systemService
            .get(self.system.id)
            .then((system: System) => {
                self.system = system;
                self.logger.info('Loaded system:', this.system);
                self.devices = [];
                self.blockUI.stop();
            })
            .catch(err => {
                self.blockUI.stop();
                swal('Oops...', 'Something went wrong! Unable to retrieve the system.', 'error');
                self.logger.error('error occurred calling getSystem api, show message');
                self.logger.error(err);
                self.router.navigate(['/securehome/systems']);
            });
    }

    public refresh() {
        this.blockUI.start('Loading system...');
        this.loadSystem();
    }

    public edit() {
        this.editModalTemplate.clear();

        const componentRef = this.editModalTemplate.createComponent(
            this.resolver.resolveComponentFactory(SystemEditModalComponent)
        );
        const componentRefInstance = <any>componentRef.instance;

        const cancelSubject: Subject<void> = new Subject<void>();
        cancelSubject.subscribe(() => {
            this.handleCancelEdit();
            this.loadSystem();
        });
        const submitSubject: Subject<any> = new Subject<any>();
        submitSubject.subscribe(result => {
            if (result.error) {
                swal('Oops...', 'Something went wrong!', 'error');
                this.logger.error('error occurred calling api, show message');
                this.logger.error(result.error);
            } else {
                swal({
                    timer: 1000,
                    title: 'Success',
                    type: 'success',
                    showConfirmButton: false
                }).then(() => {
                    this.systemService.refreshSystem(this.system.id);
                });
            }
            this.handleCancelEdit();
            this.loadSystem();
        });

        const deleteSubject: Subject<any> = new Subject<any>();
        deleteSubject.subscribe(result => {
            if (result.error) {
                swal('Oops...', 'Something went wrong! Unable to delete the system.', 'error');
                this.logger.error('error occurred calling deleteSystem api, show message');
                this.logger.error(result.error);
            } else {
                this.handleCancelEdit();
                this.router.navigate(['securehome/systems']);
            }
        });

        componentRefInstance.cancelSubject = cancelSubject;
        componentRefInstance.submitSubject = submitSubject;
        componentRefInstance.deleteSubject = deleteSubject;
        componentRefInstance.element = this.system;
        $('#editSystemModal').modal('show');
    }

    private handleCancelEdit() {
        $('#editSystemModal').modal('hide');
        this.editModalTemplate.clear();
    }

    public deploy() {
        console.log('Deploy', this.system.deviceIds);
        swal({
            title: 'Are you sure you want to deploy this system?',
            text: `This will overwrite whatever the device is doing!`,
            type: 'question',
            showCancelButton: true,
            cancelButtonColor: '#3085d6',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, deploy it!'
        }).then(result => {
            if (result.value) {
                this.blockUI.start('Deploying system...');
                Promise.all(
                    this.system.deviceIds.map(deviceId => {
                        return this.deploymentService
                            .addDeployment(deviceId)
                            .then(deployment => {
                                console.log(deployment);
                                return deployment;
                            })
                            .catch(err => {
                                console.error(err);
                                throw err;
                            });
                    })
                )
                    .then(results => {
                        this.blockUI.stop();
                        swal({
                            timer: 1000,
                            title: 'Success',
                            type: 'success',
                            showConfirmButton: false
                        }).then();
                    })
                    .catch(err => {
                        this.blockUI.stop();
                        swal('Oops...', 'Something went wrong! Unable to deploy the system.', 'error');
                        this.logger.error('error occurred calling addDeployment api, show message');
                        this.logger.error(err);
                    });
            }
        });
    }

    public gotoDevice(device: Device) {
        this.router.navigate([['/securehome/devices', device.thingId].join('/')]);
    }
}
