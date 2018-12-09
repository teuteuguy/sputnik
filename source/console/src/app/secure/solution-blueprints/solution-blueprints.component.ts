import { Component, OnInit, NgZone, ComponentFactoryResolver } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
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
    selector: 'app-root-solution-blueprints',
    templateUrl: './solution-blueprints.component.html'
    // templateUrl: '../common/generic-table.component.html'
})
export class SolutionBlueprintsComponent implements OnInit {

    private profile: ProfileInfo;

    public isAdminUser: boolean;
    public tableData: SolutionBlueprint[];
    public tableHeaders = [
        { attr: 'name', name: 'Name' },
        { attr: 'createdAt', name: 'Created At', class: 'text-right', pipe: 'moment', pipeValue: 'MMM Do YYYY' },
        { attr: 'updatedAt', name: 'Last Updated At', class: 'text-right', pipe: 'moment', pipeValue: 'MMM Do YYYY' }
    ];
    public totalSolutionBlueprints: number;
    public pages: any = {
        current: 1,
        total: 0,
        pageSize: 20
    };
    public pageTitle = 'Solution Blueprints';

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        private breadCrumbService: BreadCrumbService,
        private solutionBlueprintService: SolutionBlueprintService,
        private localStorage: LocalStorage,
        private logger: LoggerService,
        private ngZone: NgZone,
        private resolver: ComponentFactoryResolver
    ) {
        this.totalSolutionBlueprints = 0;
        this.tableData = solutionBlueprintService.solutionBlueprints;
    }

    ngOnInit() {
        const self = this;

        self.blockUI.start(`Loading ${self.pageTitle}...`);

        self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            self.profile = new ProfileInfo(profile);
            self.isAdminUser = self.profile.isAdmin();

            self.breadCrumbService.setup(self.pageTitle, [
                new Crumb({ title: self.pageTitle, active: true, link: 'solution-blueprints' })
            ]);

            self.solutionBlueprintService.solutionBlueprintsObservable$.subscribe(solutionBlueprints => {
                self.ngZone.run(() => {
                    self.load();
                });
            });

            self.load();
        });
    }

    private load() {
        this.blockUI.stop();
        this.updatePaging();
    }

    private updatePaging() {
        this.totalSolutionBlueprints = this.solutionBlueprintService.solutionBlueprints.length;
        this.pages.total = Math.ceil(this.totalSolutionBlueprints / this.pages.pageSize);
    }

    refreshData() {
        this.blockUI.start(`Loading ${this.pageTitle}...`);
        this.solutionBlueprintService.refresh();
        this.pages.current = 1;
    }

    handleCreate() {
        this.router.navigate(['securehome/solution-blueprints/new']);
    }
}
