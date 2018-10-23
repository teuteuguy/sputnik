import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import swal from 'sweetalert2';

// Models
import { Solution } from '../../models/solution.model';

// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service';
import { LoggerService } from '../../services/logger.service';
import { SolutionService } from '../../services/solution.service';

declare var jquery: any;
declare var $: any;
import * as _ from 'underscore';

@Component({
    selector: 'app-root-solution',
    templateUrl: './solution.component.html'
})
export class SolutionComponent implements OnInit {
    public title = 'Solution';
    public solution: Solution;

    private editMode = false;

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        private logger: LoggerService,
        private breadCrumbService: BreadCrumbService,
        private solutionService: SolutionService
    ) {}

    ngOnInit() {
        const _self = this;

        _self.route.paramMap.subscribe((paramMap: ParamMap) => {
            _self.solution = new Solution({ id: paramMap['params'].solutionId });

            _self.route.queryParamMap.subscribe(queryMap => {
                _self.editMode = queryMap['params'].edit;
            });

            _self.breadCrumbService.setup(_self.title, [
                new Crumb({
                    title: 'Solutions',
                    link: 'solutions'
                }),
                new Crumb({
                    title: _self.solution.id,
                    active: true
                })
            ]);
        });

        _self.blockUI.start('Loading solution...');
        _self.load();
    }

    private load() {
        const _self = this;

        _self.solutionService
            .getSolution(_self.solution.id)
            .then(solution => {
                _self.logger.info('solution:', solution);
                _self.solution = solution;
                // _self.deviceTypes = _self.deviceTypeService.getDeviceTypes();
                // _self.deviceBlueprints = _self.deviceBlueprintService.getDeviceBlueprints();
                // _self.getTheExtraResources();
                _self.blockUI.stop();
            })
            .catch(err => {
                _self.blockUI.stop();
                swal('Oops...', 'Something went wrong! Unable to retrieve the solution.', 'error');
                _self.logger.error('error occurred calling getSolution api, show message');
                _self.logger.error(err);
                _self.router.navigate(['/securehome/solutions']);
            });

        // _self.deviceService
        //     .getDevice(_self.thingId)
        //     .then((device: Device) => {
        //         _self.logger.info('device:', device);
        //         _self.device = device;
        //         _self.deviceTypes = _self.deviceTypeService.getDeviceTypes();
        //         _self.deviceBlueprints = _self.deviceBlueprintService.getDeviceBlueprints();
        //         _self.getTheExtraResources();
        // _self.blockUI.stop();
        //     })
        //     .catch(err => {
        //         _self.blockUI.stop();
        //         swal('Oops...', 'Something went wrong! Unable to retrieve the device.', 'error');
        //         _self.logger.error('error occurred calling getDevice api, show message');
        //         _self.logger.error(err);
        //         _self.router.navigate(['/securehome/devices']);
        //     });

        // //         _self.loadCustomComponentForDeviceType(_self.device.typeId, _self.device.ggBlueprintId);

        // //         return _self.deviceService.getDeviceType(_self.device.typeId);
        // //     })
        // //     .then((deviceType: DeviceType) => {
        // //         _self.deviceType = deviceType;
        // //         // this.logger.info('deviceType:', deviceType);
        // //         if (_self.device.greengrass && _self.device.ggBlueprintId) {
        // //             return _self.ggBlueprintService.getGGBlueprint(_self.device.ggBlueprintId);
        // //         }
        // //         return null;
        // //     })
        // //     .then((ggBlueprint: GGBlueprint) => {
        // //         // this.logger.info('ggBlueprint:', ggBlueprint);
        // //         _self.ggBlueprint = ggBlueprint;
        // //         _self.blockUI.stop();
        // //         return _self.ggBlueprintService.getDeploymentStatus(_self.device);
        // //     })
        // //     .then((ggDeploymentStatus: GGDeploymentStatus) => {
        // //         // _self.logger.info('deploymentStatus:', ggDeploymentStatus);
        // //         _self.ggDeploymentStatus = ggDeploymentStatus;
        // //         return;
        // //     })
    }
}
