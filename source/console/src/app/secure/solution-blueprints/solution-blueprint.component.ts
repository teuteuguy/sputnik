import { Component, OnInit, NgZone } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { LocalStorage } from '@ngx-pwa/local-storage';
import swal from 'sweetalert2';

// Models
import { SolutionBlueprint } from '@models/solution-blueprint.model';
import { ProfileInfo } from '@models/profile-info.model';

// Services
import { BreadCrumbService, Crumb } from '@services/bread-crumb.service';
import { SolutionBlueprintService } from '@services/solution-blueprint.service';
import { LoggerService } from '@services/logger.service';

@Component({
    selector: 'app-root-solution-blueprint',
    templateUrl: './solution-blueprint.component.html'
})
export class SolutionBlueprintComponent implements OnInit {
    private profile: ProfileInfo;

    public isAdminUser: boolean;
    public pageTitle = 'Device Type';
    public solutionBlueprintId: string;
    public solutionBlueprint: SolutionBlueprint;

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        private breadCrumbService: BreadCrumbService,
        private solutionBlueprintService: SolutionBlueprintService,
        private localStorage: LocalStorage,
        private logger: LoggerService,
        private ngZone: NgZone
    ) {
        this.solutionBlueprintId = '';
        this.solutionBlueprint = undefined;
    }

    ngOnInit() {
        const self = this;

        self.blockUI.start(`Loading ${self.pageTitle}...`);

        self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            self.profile = new ProfileInfo(profile);
            self.isAdminUser = self.profile.isAdmin();

            self.route.params.subscribe(params => {
                self.solutionBlueprintId = params['id'];

                self.breadCrumbService.setup(self.pageTitle, [
                    new Crumb({
                        title: self.pageTitle + 's',
                        link: 'solution-blueprints'
                    }),
                    new Crumb({
                        title: self.solutionBlueprintId,
                        active: true
                    })
                ]);

                self.loadSolutionBlueprint(self.solutionBlueprintId);

                self.blockUI.stop();
            });
        });
    }

    private loadSolutionBlueprint(solutionBlueprintId) {
        const self = this;
        self.solutionBlueprintService.solutionBlueprintsObservable$.subscribe(message => {
            self.ngZone.run(() => {
                if (self.solutionBlueprintId !== 'new') {
                    self.solutionBlueprint = self.solutionBlueprintService.solutionBlueprints.find(solutionBlueprint => {
                        return solutionBlueprint.id === self.solutionBlueprintId;
                    });
                }
            });
        });

        if (self.solutionBlueprintId !== 'new') {
            self.solutionBlueprint = self.solutionBlueprintService.solutionBlueprints.find(solutionBlueprint => {
                return solutionBlueprint.id === self.solutionBlueprintId;
            });
        } else {
            self.solutionBlueprint = new SolutionBlueprint();
        }
    }

    cancel() {
        this.router.navigate(['/securehome/solution-blueprints']);
    }

    submit(f) {
        console.log(f);
        if (this.solutionBlueprintId === 'new') {
            this.solutionBlueprintService
                .add(this.solutionBlueprint)
                .then(solutionBlueprint => {
                    swal({
                        timer: 1000,
                        title: 'Success',
                        type: 'success',
                        showConfirmButton: false
                    }).then(() => {
                        this.logger.info('Created solutionBlueprint:', solutionBlueprint);
                        this.router.navigate(['securehome/solution-blueprints/' + solutionBlueprint.id]);
                    });
                })
                .catch(err => {
                    swal('Oops...', 'Something went wrong! In trying to create solutionBlueprint', 'error');
                    this.logger.error('Error creating solutionBlueprint:', err);
                });
        } else {
            this.solutionBlueprintService
                .update(this.solutionBlueprint)
                .then(solutionBlueprint => {
                    swal({
                        timer: 1000,
                        title: 'Success',
                        type: 'success',
                        showConfirmButton: false
                    }).then(() => {
                        this.logger.info('Updated solutionBlueprint:', solutionBlueprint);
                        this.router.navigate(['securehome/solution-blueprints/' + solutionBlueprint.id]);
                    });
                })
                .catch(err => {
                    swal('Oops...', 'Something went wrong! In trying to update solutionBlueprint', 'error');
                    this.logger.error('Error creating solutionBlueprint:', err);
                });
        }
    }

    delete() {
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
                this.blockUI.start('Deleting solution blueprint...');
                this.solutionBlueprintService
                    .delete(this.solutionBlueprint.id)
                    .then((resp: any) => {
                        this.blockUI.stop();
                        this.router.navigate(['securehome/solution-blueprints']);
                    })
                    .catch(err => {
                        this.blockUI.stop();
                        swal('Oops...', 'Something went wrong! Unable to delete the solution blueprint.', 'error');
                        this.logger.error('error occurred calling deleteSolutionBlueprint api, show message');
                        this.logger.error(err);
                    });
            }
        });
    }
}
