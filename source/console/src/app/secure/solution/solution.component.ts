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
import swal from 'sweetalert2';

// SubComponents
import { SolutionEditModalComponent } from './solution.edit.modal.component';
// import { FactoryResetDeeplensV10Component } from './types/factory-reset-deeplens-v1.0.component';
// import { MyDeeplensWebCameraV10Component } from './types/my-deeplens-web-camera-v1.0.component';
// import { MiniConnectedFactoryV10Component } from './types/mini-connected-factory-v1.0.component';

// Models
import { Device } from '../../models/device.model';
import { Solution } from '../../models/solution.model';

// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service';
import { DeploymentService } from '../../services/deployment.service';
import { DeviceService } from '../../services/device.service';
import { SolutionService } from '../../services/solution.service';
import { LoggerService } from '../../services/logger.service';

declare var $: any;

@Component({
    selector: 'app-root-solution',
    templateUrl: './solution.component.html'
})
export class SolutionComponent implements OnInit {
    public title = 'Solution';
    public id: string;

    public solution: Solution = new Solution();
    public devices: Device[] = [];

    @BlockUI()
    blockUI: NgBlockUI;
    @ViewChild('editModalTemplate', { read: ViewContainerRef })
    editModalTemplate: ViewContainerRef;

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        private ngZone: NgZone,
        private logger: LoggerService,
        private breadCrumbService: BreadCrumbService,
        private resolver: ComponentFactoryResolver,
        private deploymentService: DeploymentService,
        private deviceService: DeviceService,
        private solutionService: SolutionService
    ) {}

    ngOnInit() {
        const _self = this;

        _self.route.params.subscribe(params => {
            _self.solution = new Solution({ id: params['solutionId'] });

            _self.breadCrumbService.setup(_self.title, [
                new Crumb({
                    title: _self.title,
                    link: _self.title.toLowerCase()
                }),
                new Crumb({
                    title: _self.solution.id,
                    active: true
                })
            ]);

            _self.blockUI.start('Loading solution...');

            _self.loadSolution();

            // _self.solutionBlueprintService.solutionBlueprints$.subscribe(message => {
            //     _self.cleanup();
            //     _self.blockUI.stop();
            //     _self.ngZone.run(() => {});
            // });
        });
    }

    loadSolution() {
        const _self = this;

        _self.solutionService
            .get(_self.solution.id)
            .then(solution => {
                _self.logger.info('solution:', solution);
                _self.solution = new Solution(solution);
                _self.blockUI.stop();
                _self.devices = [];
                // return _self.getTheExtraResources();
            })
            // .then(result => {})
            .catch(err => {
                _self.blockUI.stop();
                swal('Oops...', 'Something went wrong! Unable to retrieve the solution.', 'error');
                _self.logger.error('error occurred calling getSolution api, show message');
                _self.logger.error(err);
                _self.router.navigate(['/securehome/solutions']);
            });
    }

    // getTheExtraResources() {
    //     const _self = this;
    //     _self.solution.deviceIds.forEach((thingId: string) => {
    //         _self.deviceService
    //             .getDevice(thingId)
    //             .then((device: Device) => {
    //                 _self.devices.push(device);
    //                 // this.edit();
    //             })
    //             .catch(err => {
    //                 _self.logger.error('Something went wrong trying to get thingId', thingId);
    //                 _self.logger.error(err);
    //             });
    //     });
    // }

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
                }).then();
            }
            this.handleCancelEdit();
            this.loadSolution();
        });

        componentRefInstance.cancelSubject = cancelSubject;
        componentRefInstance.submitSubject = submitSubject;
        componentRefInstance.element = this.solution;
        $('#editSolutionModal').modal('show');
    }
    handleCancelEdit() {
        $('#editSolutionModal').modal('hide');
        this.editModalTemplate.clear();
    }

    deploy() {
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

    gotoDevice(device: Device) {
        this.router.navigate([['/securehome/devices', device.thingId].join('/')]);
    }
}
