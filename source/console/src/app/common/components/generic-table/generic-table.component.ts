import { Component, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { Subject } from 'rxjs';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import swal from 'sweetalert2';

// Services
import { LoggerService } from '../../../services/logger.service';

// Helpers
import { _ } from 'underscore';
declare var $: any;

export class GenericTableElementParams {
    text: string;
    modal: any;
    link: boolean;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class GenericTableParams {
    path: string;
    pageTitle: string;
    fields: any;
    createElement: GenericTableElementParams;
    viewElement: GenericTableElementParams;
    editElement: GenericTableElementParams;
    deleteElement: boolean;
    viewLink: boolean;
    editLink: boolean;
    cachedMode: boolean;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class DataStat {
    total: number;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

@Component({
    selector: 'app-root',
    templateUrl: './generic-table.component.html'
})
export class GenericTableComponent {
    protected pages: any = {
        current: 1,
        total: 0,
        pageSize: 20
    };
    protected data: any[] = [];
    protected dataStats: DataStat = new DataStat({
        total: 0
    });

    protected handleDeleteSubject: Subject<any> = new Subject<any>();
    protected handleDelete = this.handleDeleteSubject.asObservable();

    @BlockUI()
    blockUI: NgBlockUI;
    @ViewChild('createModalTemplate', { read: ViewContainerRef })
    createModalTemplate: ViewContainerRef;

    protected params: GenericTableParams = new GenericTableParams();

    constructor(private genericLogger: LoggerService, private genericResolver: ComponentFactoryResolver) {}

    load() {}
    open(element: any) {}

    refreshData() {
        if (!this.params.cachedMode) {
            this.blockUI.start(`Loading ${this.params.pageTitle.toLowerCase()}...`);
        }
        this.load();
    }

    handleCreate() {
        if (this.params.createElement && this.params.createElement.modal) {
            this.showModal(this.params.createElement.modal, 'create', null);
        }
    }
    handleCancel() {
        $('#modal').modal('hide');
        this.createModalTemplate.clear();
    }

    handleEdit(element: any) {
        if (this.params.editElement && this.params.editElement.modal) {
            this.showModal(this.params.editElement.modal, 'edit', element);
        } else if (this.params.editElement && this.params.editElement.link) {
            this.open(element);
        }
    }
    handleView(element: any) {
        console.log(element, this.params);
        if (this.params.viewElement && this.params.viewElement.modal) {
            this.showModal(this.params.viewElement.modal, 'view', element);
        } else if (this.params.viewElement && this.params.viewElement.link) {
            this.open(element);
        }
    }

    private showModal(modal: any, type: string, element: any = null) {
        this.createModalTemplate.clear();
        const componentRef = this.createModalTemplate.createComponent(
            this.genericResolver.resolveComponentFactory(modal)
        );
        const componentRefInstance = <any>componentRef.instance;

        const cancelSubject: Subject<void> = new Subject<void>();
        cancelSubject.subscribe(() => {
            this.handleCancel();
            this.load();
        });
        const submitSubject: Subject<any> = new Subject<any>();
        submitSubject.subscribe(result => {
            if (result.error) {
                swal('Oops...', 'Something went wrong!', 'error');
                this.genericLogger.error('error occurred calling api, show message');
                this.genericLogger.error(result.error);
            } else {
                swal({
                    timer: 1000,
                    title: 'Success',
                    type: 'success',
                    showConfirmButton: false
                }).then();
            }
            this.handleCancel();
            this.load();
        });

        componentRefInstance.modalType = type;
        componentRefInstance.cancelSubject = cancelSubject;
        componentRefInstance.submitSubject = submitSubject;
        if (element) {
            componentRefInstance.element = element;
        }
        $('#modal').modal('show');
    }

    updatePaging() {
        const _self = this;
        _self.pages.total = Math.ceil(_self.dataStats.total / _self.pages.pageSize);
    }
    nextPage() {
        this.pages.current++;
        if (!this.params.cachedMode) {
            this.blockUI.start(`Loading ${this.params.pageTitle.toLowerCase()}...`);
        }
        this.load();
    }
    previousPage() {
        this.pages.current--;
        if (!this.params.cachedMode) {
            this.blockUI.start(`Loading ${this.params.pageTitle.toLowerCase()}...`);
        }
        this.load();
    }

    sliceData(data: any) {
        // console.log(this.params, data, (this.pages.current - 1) * this.pages.pageSize, this.pages.current * this.pages.pageSize);
        if (this.params.cachedMode) {
            return data.slice((this.pages.current - 1) * this.pages.pageSize, this.pages.current * this.pages.pageSize);
        } else {
            return data;
        }
    }
}
