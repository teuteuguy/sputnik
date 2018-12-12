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
import { SolutionEditModalComponent } from './solution.edit.modal.component';

// Models
import { Device } from '@models/device.model';
import { ProfileInfo } from '@models/profile-info.model';
import { Solution } from '@models/solution.model';

// Services
import { BreadCrumbService, Crumb } from '@services/bread-crumb.service';
import { DeploymentService } from '@services/deployment.service';
import { DeviceService } from '@services/device.service';
import { SolutionService } from '@services/solution.service';
import { LoggerService } from '@services/logger.service';

declare var $: any;

@Component({
    selector: 'app-root-solution',
    templateUrl: './solution.component.html'
})
export class SolutionComponent implements OnInit {
    private profile: ProfileInfo;

    public isAdminUser: boolean;
    public pageTitle = 'Solution';
    public id: string;

    public solution: Solution;
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
        private solutionService: SolutionService,
        private ngZone: NgZone
    ) {
        this.solution = new Solution();
        this.devices = [];
    }

    ngOnInit() {
        const self = this;

        self.blockUI.start('Loading solution...');

        self.route.params.subscribe(params => {
            self.solution = new Solution({ id: params['id'] });

            self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
                self.profile = new ProfileInfo(profile);
                self.isAdminUser = self.profile.isAdmin();

                self.breadCrumbService.setup(self.pageTitle, [
                    new Crumb({
                        title: self.pageTitle + 's',
                        link: 'solutions'
                    }),
                    new Crumb({
                        title: self.solution.id,
                        active: true
                    })
                ]);

                self.loadSolution();
            });
        });
    }

    private loadSolution() {
        const self = this;

        self.solutionService
            .get(self.solution.id)
            .then((solution: Solution) => {
                self.solution = solution;
                self.logger.info('Loaded solution:', this.solution);
                self.devices = [];
                self.blockUI.stop();
            })
            .catch(err => {
                self.blockUI.stop();
                swal('Oops...', 'Something went wrong! Unable to retrieve the solution.', 'error');
                self.logger.error('error occurred calling getSolution api, show message');
                self.logger.error(err);
                self.router.navigate(['/securehome/solutions']);
            });
    }

    public refresh() {
        this.blockUI.start('Loading solution...');
        this.loadSolution();
    }

    public edit() {
        this.editModalTemplate.clear();

        const componentRef = this.editModalTemplate.createComponent(
            this.resolver.resolveComponentFactory(SolutionEditModalComponent)
        );
        const componentRefInstance = <any>componentRef.instance;

        const cancelSubject: Subject<void> = new Subject<void>();
        cancelSubject.subscribe(() => {
            this.handleCancelEdit();
            this.loadSolution();
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
                    this.solutionService.refreshSolution(this.solution.id);
                });
            }
            this.handleCancelEdit();
            this.loadSolution();
        });

        const deleteSubject: Subject<any> = new Subject<any>();
        deleteSubject.subscribe(result => {
            if (result.error) {
                swal('Oops...', 'Something went wrong! Unable to delete the solution.', 'error');
                this.logger.error('error occurred calling deleteSolution api, show message');
                this.logger.error(result.error);
            } else {
                this.handleCancelEdit();
                this.router.navigate(['securehome/solutions']);
            }
        });

        componentRefInstance.cancelSubject = cancelSubject;
        componentRefInstance.submitSubject = submitSubject;
        componentRefInstance.deleteSubject = deleteSubject;
        componentRefInstance.element = this.solution;
        $('#editSolutionModal').modal('show');
    }

    private handleCancelEdit() {
        $('#editSolutionModal').modal('hide');
        this.editModalTemplate.clear();
    }

    public deploy() {
        console.log('Deploy', this.solution.deviceIds);
        swal({
            title: 'Are you sure you want to deploy this solution?',
            text: `This will overwrite whatever the device is doing!`,
            type: 'question',
            showCancelButton: true,
            cancelButtonColor: '#3085d6',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, deploy it!'
        }).then(result => {
            if (result.value) {
                this.blockUI.start('Deploying solution...');
                Promise.all(
                    this.solution.deviceIds.map(deviceId => {
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
                        swal('Oops...', 'Something went wrong! Unable to deploy the solution.', 'error');
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
