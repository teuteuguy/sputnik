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
    modalName: string;
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
    cachedMode: boolean;
    fieldLink = '';
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
    public pages: any = {
        current: 1,
        total: 0,
        pageSize: 20
    };
    public data: any[] = [];
    public dataStats: DataStat = new DataStat({
        total: 0
    });

    protected handleDeleteSubject: Subject<any> = new Subject<any>();
    protected handleDelete = this.handleDeleteSubject.asObservable();

    protected handleSubmitSubject: Subject<any> = new Subject<any>();
    protected handleSubmit = this.handleSubmitSubject.asObservable();

    @BlockUI()
    blockUI: NgBlockUI;
    @ViewChild('createModalTemplate', { read: ViewContainerRef })
    createModalTemplate: ViewContainerRef;

    public params: GenericTableParams = new GenericTableParams();

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
    handleCancel(type) {
        if (type === 'create') {
            $('#' + this.params.createElement.modalName).modal('hide');
        } else if (type === 'edit') {
            $('#' + this.params.editElement.modalName).modal('hide');
        } else {
            $('#' + this.params.viewElement.modalName).modal('hide');
        }
        // $('#modal').modal('hide');
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
        if (this.params.viewElement && this.params.viewElement.modal) {
            this.showModal(this.params.viewElement.modal, 'view', element);
        } else if (this.params.viewElement && this.params.viewElement.link) {
            this.open(element);
        }
    }

    private showModal(modal: any, type: string, element: any = null) {
        // console.log(type, element);
        this.createModalTemplate.clear();
        const componentRef = this.createModalTemplate.createComponent(
            this.genericResolver.resolveComponentFactory(modal)
        );
        const componentRefInstance = <any>componentRef.instance;

        const cancelSubject: Subject<void> = new Subject<void>();
        cancelSubject.subscribe(() => {
            this.handleCancel(type);
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
                }).then(() => {
                    this.handleSubmitSubject.next();
                });
            }
            this.handleCancel(type);
            this.load();
        });

        componentRefInstance.modalType = type;
        componentRefInstance.cancelSubject = cancelSubject;
        componentRefInstance.submitSubject = submitSubject;
        if (element) {
            componentRefInstance.element = element;
        }

        if (type === 'create') {
            $('#' + this.params.createElement.modalName).modal('show');
        } else if (type === 'edit') {
            $('#' + this.params.editElement.modalName).modal('show');
        } else {
            $('#' + this.params.viewElement.modalName).modal('show');
        }
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
