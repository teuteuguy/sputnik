import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

// Models
import { ProfileInfo } from '../../models/profile-info.model';
import { DeviceStats, SolutionStats } from '../../models/stats.model';

// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service';
import { UserLoginService, LoggedInCallback } from '../../services/user-login.service';
import { LoggerService } from '../../services/logger.service';
import { StatService, Stats } from '../../services/stat.service';
import { IOTService } from '../../services/iot.service';

// Services that cache
import { DeviceTypeService } from '../../services/device-type.service';
import { DeviceBlueprintService } from '../../services/device-blueprint.service';
import { SolutionBlueprintService } from '../../services/solution-blueprint.service';

// Helpers
declare let jquery: any;
declare let $: any;
import { _ } from 'underscore';

@Component({
    selector: 'app-root',
    templateUrl: './secure-home-common.component.html'
})
export class SecureHomeCommonComponent implements OnInit, LoggedInCallback {

    public profile: ProfileInfo = null;
    public isAdminUser = false;
    private loadedProfile = false;

    public title: '';
    public crumbs: Crumb[] = [];
    public deviceStats: DeviceStats = new DeviceStats();
    public solutionStats: SolutionStats = new SolutionStats();

    public fullpage = false;

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public userService: UserLoginService,
        private statService: StatService,
        private _ngZone: NgZone,
        protected localStorage: LocalStorage,
        private logger: LoggerService,
        private breadCrumbService: BreadCrumbService,
        private iotService: IOTService,
        // Here we load cached services for rest of app
        private deviceTypeService: DeviceTypeService,
        private deviceBlueprintService: DeviceBlueprintService,
        private solutionBlueprintService: SolutionBlueprintService
    ) {
        const _self = this;

        _self.logger.info('SecureHomeComponent.constructor: checking if user is authenticated');
        _self.isAdminUser = false;
        _self.loadedProfile = false;
    }

    ngOnInit() {
        const _self = this;

        const _deviceStats = { total: 0, connected: 0, disconnected: 0 };
        _self.localStorage.setItem('deviceStats', _deviceStats).subscribe(() => { });

        _self.statService.statObservable$.subscribe((message: Stats) => {
            _self.deviceStats = message.deviceStats;
            _self.solutionStats = message.solutionStats;
            _self._ngZone.run(() => { });
        });
        _self.statService.refresh();

        _self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            if (profile) {
                _self.logger.info('SecureHomeComponent.constructor: profile exists, issuing no request profile');
                _self.profile = new ProfileInfo(profile);
                _self.isAdminUser = _self.profile.isAdmin();
                _self.userService.isAuthenticated(_self, false);
                _self.iotService.connect();
            } else {
                _self.logger.info('SecureHomeComponent.constructor: no profile found, requesting profile');
                _self.loadedProfile = true;
                _self.userService.isAuthenticated(_self, true);
            }
        });

        _self.breadCrumbService.pageTitleObservable$.subscribe(title => (_self.title = title));
        _self.breadCrumbService.crumbObservable$.subscribe(crumbs => {
            _self.crumbs.splice(0, _self.crumbs.length);
            _self.crumbs.push(...crumbs);
            _self._ngZone.run(() => { });
        });

        _self.prepUI();
        // this.iotService.connect();

        if (_self.router.url === '/securehome/maps') {
            _self.fullpage = true;
        }
        console.log(_self.router.url);
    }

    prepUI() {
        // ==============================================================
        // This is for the top header part and sidebar part
        // ==============================================================
        const set = function() {
            const width = window.innerWidth > 0 ? window.innerWidth : this.screen.width;
            const topOffset = 70;
            if (width < 1170) {
                $('body').addClass('mini-sidebar');
                $('.navbar-brand span').hide();
                $('.scroll-sidebar, .slimScrollDiv')
                    .css('overflow-x', 'visible')
                    .parent()
                    .css('overflow', 'visible');
                $('.sidebartoggler i').addClass('ti-menu');
            } else {
                $('body').removeClass('mini-sidebar');
                $('.navbar-brand span').show();
            }

            let height = (window.innerHeight > 0 ? window.innerHeight : this.screen.height) - 1;
            height = height - topOffset;
            if (height < 1) {
                height = 1;
            }

            if (height > topOffset) {
                $('.page-wrapper').css('min-height', height + 'px');
            }
        };
        $(window).ready(set);
        $(window).on('resize', set);

        // ==============================================================
        // Theme options
        // ==============================================================
        $('.sidebartoggler').on('click', function() {
            if ($('body').hasClass('mini-sidebar')) {
                $('body').trigger('resize');
                $('.scroll-sidebar, .slimScrollDiv')
                    .css('overflow', 'hidden')
                    .parent()
                    .css('overflow', 'visible');
                $('body').removeClass('mini-sidebar');
                $('.navbar-brand span').show();
            } else {
                $('body').trigger('resize');
                $('.scroll-sidebar, .slimScrollDiv')
                    .css('overflow-x', 'visible')
                    .parent()
                    .css('overflow', 'visible');
                $('body').addClass('mini-sidebar');
                $('.navbar-brand span').hide();
            }
        });

        // topbar stickey on scroll

        $('.fix-header .topbar').stick_in_parent({});

        // this is for close icon when navigation open in mobile view
        $('.nav-toggler').click(function() {
            $('body').toggleClass('show-sidebar');
            $('.nav-toggler i').toggleClass('ti-menu');
            $('.nav-toggler i').addClass('ti-close');
        });

        // ==============================================================
        // Auto select left navbar
        // ==============================================================
        $(function() {
            const url = window.location;
            let element = $('ul#sidebarnav a')
                .filter(function() {
                    return this.href === url.href;
                })
                .addClass('active')
                .parent()
                .addClass('active');
            while (true) {
                if (element.is('li')) {
                    element = element
                        .parent()
                        .addClass('in')
                        .parent()
                        .addClass('active');
                } else {
                    break;
                }
            }
        });

        // $(function() {
        //     $('#sidebarnav').metisMenu();
        // });
        this.blockUI.stop();
    }

    isLoggedIn(message: string, isLoggedIn: boolean, profile: ProfileInfo) {
        if (!isLoggedIn) {
            this.router.navigate(['/home/login']);
        } else {
            if (this.loadedProfile) {
                this.localStorage.setItem('profile', profile).subscribe(() => {});
                this.profile = profile;
                this.isAdminUser = this.profile.isAdmin();
            }
        }
    }
}
