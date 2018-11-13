import { Component, OnInit, ComponentFactoryResolver, NgZone } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import swal from 'sweetalert2';

// Parent
import {
    GenericTableComponent,
    GenericTableParams,
    GenericTableElementParams
} from '../common/generic-table.component';

// Childs
import { SolutionBlueprintsModalComponent } from './solution-blueprints.modal.component';

// Models
import { SolutionBlueprint } from '../../models/solution-blueprint.model';
import { ProfileInfo } from '../../models/profile-info.model';

// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service';
import { LoggerService } from '../../services/logger.service';
import { SolutionBlueprintService } from '../../services/solution-blueprint.service';

import { _ } from 'underscore';

@Component({
    selector: 'app-root-solution-blueprints',
    templateUrl: '../../common/components/generic-table/generic-table.component.html'
})
export class SolutionBlueprintsComponent extends GenericTableComponent implements OnInit {
    private isAdminUser: boolean;
    private profile: ProfileInfo;

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        private breadCrumbService: BreadCrumbService,
        private solutionBlueprintService: SolutionBlueprintService,
        private localStorage: LocalStorage,
        private logger: LoggerService,
        private ngZone: NgZone,
        private resolver: ComponentFactoryResolver
    ) {
        super(logger, resolver);

        this.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            this.profile = new ProfileInfo(profile);
            this.isAdminUser = this.profile.isAdmin();

            this.params = <GenericTableParams>{
                path: '/securehome/solution-blueprints',
                pageTitle: 'Solution Blueprints',
                createElement: <GenericTableElementParams>{
                    text: 'Create NEW Solution Blueprint',
                    modal: SolutionBlueprintsModalComponent,
                    modalName: 'defaultSolutionBlueprintsModal',
                    link: false
                },
                editElement: <GenericTableElementParams>{
                    text: 'Edit',
                    modal: SolutionBlueprintsModalComponent,
                    modalName: 'defaultSolutionBlueprintsModal',
                    link: false
                },
                viewElement: <GenericTableElementParams>{
                    text: 'View',
                    modal: SolutionBlueprintsModalComponent,
                    modalName: 'defaultSolutionBlueprintsModal',
                    link: false
                },
                deleteElement: this.isAdminUser,
                fields: [
                    { attr: 'name', text: 'Name' },
                    { attr: 'createdAt', text: 'Created At', class: 'text-right', format: 'date' },
                    { attr: 'updatedAt', text: 'Last Updated At', class: 'text-right', format: 'date' }
                ],
                cachedMode: true
            };

            this.handleDelete.subscribe((element: SolutionBlueprint) => {
                const _self = this;
                swal({
                    title: 'Are you sure you want to delete this solution blueprint?',
                    text: `You won't be able to revert this!`,
                    type: 'question',
                    showCancelButton: true,
                    cancelButtonColor: '#3085d6',
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete it!'
                }).then(result => {
                    if (result.value) {
                        _self.blockUI.start('Deleting solution blueprint...');
                        _self.solutionBlueprintService
                            .delete(element.id)
                            .then((resp: any) => {
                                console.log(resp);
                                _self.blockUI.stop();
                            })
                            .catch(err => {
                                _self.blockUI.stop();
                                swal(
                                    'Oops...',
                                    'Something went wrong! Unable to delete the solution blueprint.',
                                    'error'
                                );
                                _self.logger.error('error occurred calling deleteSolutionBlueprint api, show message');
                                _self.logger.error(err);
                            });
                    }
                });
            });

            this.data = solutionBlueprintService.solutionBlueprints;
        });
    }

    ngOnInit() {
        const _self = this;
        _self.blockUI.start('Loading solution blueprints...');

        _self.route.params.subscribe(params => {
            // _self.solution = new Solution({ id: params['solutionId'] });

            _self.breadCrumbService.setup(_self.params.pageTitle, [
                new Crumb({ title: _self.params.pageTitle, active: true, link: 'solution-blueprints' })
            ]);

            _self.solutionBlueprintService.solutionBlueprintsObservable$.subscribe(solutionBlueprints => {
                if (params['solutionBlueprintId']) {
                    const index = _.findIndex(_self.data, e => {
                        return e.id === params['solutionBlueprintId'];
                    });
                    if (index !== -1) {
                        _self.handleView(_self.data[index]);
                    }
                }
                _self.cleanup();
                _self.blockUI.stop();
                _self.ngZone.run(() => {});
            });

            _self.load();
        });
    }

    cleanup() {
        this.dataStats.total = this.solutionBlueprintService.solutionBlueprints.length;
        this.updatePaging();
    }

    load() {
        this.blockUI.stop();
        this.cleanup();
    }

    refreshData() {
        this.blockUI.start('Loading solution blueprints...');
        this.solutionBlueprintService.refresh();
        this.pages.current = 1;
    }

    open(elem: SolutionBlueprint) {
        console.log(elem);
        this.router.navigate([['/securehome/solution-blueprints', elem.id].join('/')]);
    }
}
