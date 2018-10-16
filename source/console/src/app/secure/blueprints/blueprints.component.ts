import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import swal from 'sweetalert2';
import { _ } from 'underscore';

// Models
import { ProfileInfo } from '../../models/profile-info.model';
import { Blueprint } from '../../models/blueprint.model';

// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service';
import { LoggerService } from '../../services/logger.service';
import { BlueprintService } from '../../services/blueprint.service';

// Helpers
import * as moment from 'moment';
declare var jquery: any;
declare var $: any;
// declare var swal: any;

@Component({
    selector: 'app-root-blueprints',
    templateUrl: './blueprints.component.html'
})
export class BlueprintsComponent implements OnInit {
    public title = 'Blueprints';
    private profile: ProfileInfo;
    public blueprints: Blueprint[] = [];
    public pages: any = {
        current: 1,
        total: 0,
        pageSize: 20
    };
    public metrics: any = {
        total: 0
    };

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        private breadCrumbService: BreadCrumbService,
        private blueprintService: BlueprintService,
        protected localStorage: LocalStorage,
        private logger: LoggerService,
        private _ngZone: NgZone
    ) {}

    ngOnInit() {
        const _self = this;
        _self.blockUI.start('Loading blueprints...');

        _self.breadCrumbService.setup(_self.title, [new Crumb({ title: _self.title, active: true, link: 'blueprints' })]);

        _self.localStorage.getItem<ProfileInfo>('profile').subscribe(profile => {
            _self.profile = new ProfileInfo(profile);
            _self.loadBlueprints();
        });

        _self.blueprintService.blueprintsObservable$.subscribe(message => {
            _self.updatePaging();
            _self._ngZone.run(() => {});
        });
    }

    loadBlueprints() {
        const _self = this;
        _self.blueprints = _self.blueprintService.getBlueprints();
        _self.updatePaging();
        _self.blockUI.stop();


        // _self.blueprintService
        //     // TODO Implement the paging here.
        //     .getBlueprints(_self.pages.pageSize, null)
        //     .then(b => {
        //         _self.blockUI.stop();
        //         _self.blueprints = <Blueprint[]>b.blueprints;
        //     })
        //     .catch(err => {
        //         _self.blockUI.stop();
        //         swal('Oops...', 'Something went wrong! Unable to retrieve the device types.', 'error');
        //         _self.logger.error('error occurred calling getGGBlueprints api, show message');
        //         _self.logger.error(err);
        //     });
    }

    updatePaging() {
        const _self = this;
        _self.metrics.total = _self.blueprints.length;
        _self.pages.total = Math.ceil(_self.metrics.total / _self.pages.pageSize);
    }

    refreshData() {
        this.blockUI.start('Loading blueprints...');
        this.loadBlueprints();
    }

    nextPage() {
        this.pages.current++;
        this.blockUI.start('Loading blueprints...');
        this.loadBlueprints();
    }

    previousPage() {
        this.pages.current--;
        this.blockUI.start('Loading blueprints...');
        this.loadBlueprints();
    }

    openBlueprint(id: string) {
        this.router.navigate([['/securehome/blueprints', id].join('/')]);
    }
}
