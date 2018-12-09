import { Component, OnInit, NgZone, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Subject } from 'rxjs';
import { LocalStorage } from '@ngx-pwa/local-storage';
import swal from 'sweetalert2';

// SubComponents
import { SolutionsModalComponent } from './solutions.modal.component';

// Models
import { ProfileInfo } from '@models/profile-info.model';
import { Solution } from '@models/solution.model';

// Services
import { BreadCrumbService, Crumb } from '@services/bread-crumb.service';
import { SolutionService } from '@services/solution.service';
import { StatService, Stats } from '@services/stat.service';
import { LoggerService } from '@services/logger.service';

declare var $: any;

@Component({
    selector: 'app-root-solutions',
    templateUrl: './solutions.component.html'
})
export class SolutionsComponent implements OnInit {
    private profile: ProfileInfo;

    public isAdminUser: boolean;
    public tableData: Solution[];
    public tableHeaders = [
        { attr: 'name', name: 'Name' },
        { attr: 'createdAt', name: 'Created At', class: 'text-right', pipe: 'moment', pipeValue: 'MMM Do YYYY' },
        { attr: 'updatedAt', name: 'Last Updated At', class: 'text-right', pipe: 'moment', pipeValue: 'MMM Do YYYY' }
    ];
    public totalSolutions: number;
    public pages: any = {
        current: 1,
        total: 0,
        pageSize: 20
    };
    public pageTitle = 'Solutions';

    @BlockUI()
    blockUI: NgBlockUI;
    @ViewChild('createModalTemplate', { read: ViewContainerRef })
    createModalTemplate: ViewContainerRef;

    constructor(
        public router: Router,
        private breadCrumbService: BreadCrumbService,
        private solutionService: SolutionService,
        private statService: StatService,
        private localStorage: LocalStorage,
        private logger: LoggerService,
        private ngZone: NgZone,
        private resolver: ComponentFactoryResolver
    ) {
        this.totalSolutions = 0;
        this.tableData = [];
    }

    ngOnInit() {
        const self = this;

        self.blockUI.start(`Loading ${self.pageTitle}...`);

        self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            self.profile = new ProfileInfo(profile);
            self.isAdminUser = self.profile.isAdmin();

            self.breadCrumbService.setup(self.pageTitle, [
                new Crumb({ title: self.pageTitle, active: true, link: 'solutions' })
            ]);

            self.statService.statObservable$.subscribe((message: Stats) => {
                this.ngZone.run(() => {
                    this.totalSolutions = message.solutionStats.total;
                });
            });

            self.statService.refresh();

            self.load();
        });
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

    private load() {
        const self = this;

        return self
            .getSolutions(self.pages.current - 1, null)
            .then(results => {
                self.tableData = results.solutions;
                self.updatePaging();
                self.blockUI.stop();
            })
            .catch(err => {
                swal('Oops...', 'Something went wrong! Unable to retrieve the solutions.', 'error');
                self.logger.error('error occurred calling listSolutions api');
                self.logger.error(err);
                self.router.navigate(['/securehome/solutions']);
            });
    }

    private updatePaging() {
        this.pages.total = Math.ceil(this.totalSolutions / this.pages.pageSize);
    }

    public refreshData() {
        this.blockUI.start(`Loading ${this.pageTitle}...`);
        this.pages.current = 1;
        this.load();
    }

    public handleCreate() {
        const self = this;
        self.createModalTemplate.clear();

        const componentRef = this.createModalTemplate.createComponent(this.resolver.resolveComponentFactory(SolutionsModalComponent));
        const componentRefInstance = <any>componentRef.instance;

        const cancelSubject: Subject<void> = new Subject<void>();
        cancelSubject.subscribe(() => {
            self.handleCancelCreate();
        });
        const submitSubject: Subject<any> = new Subject<any>();
        submitSubject.subscribe(result => {
            if (result.error) {
                swal('Oops...', 'Something went wrong!', 'error');
                self.logger.error('error occurred calling api, show message');
                self.logger.error(result.error);
            } else {
                swal({ timer: 1000, title: 'Success', type: 'success', showConfirmButton: false }).then();
            }
            self.handleCancelCreate();
            self.refreshData();
        });

        componentRefInstance.cancelSubject = cancelSubject;
        componentRefInstance.submitSubject = submitSubject;
        $('#createModalTemplate').modal('show');
    }

    private handleCancelCreate() {
        $('#createModalTemplate').modal('hide');
        this.createModalTemplate.clear();
    }

}
