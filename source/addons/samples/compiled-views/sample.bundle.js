(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common'), require('aws-amplify'), require('@aws-amplify/pubsub/lib/Providers'), require('graphql-tag'), require('aws-amplify-angular')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/common', 'aws-amplify', '@aws-amplify/pubsub/lib/Providers', 'graphql-tag', 'aws-amplify-angular'], factory) :
    (global = global || self, factory(global.sample = {}, global.core, global.common, global.Amplify, global.Providers, global.gql, global.awsAmplifyAngular));
}(this, function (exports, core, common, Amplify, Providers, gql, awsAmplifyAngular) { 'use strict';

    Amplify = Amplify && Amplify.hasOwnProperty('default') ? Amplify['default'] : Amplify;
    gql = gql && gql.hasOwnProperty('default') ? gql['default'] : gql;

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }

    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function isFunction(x) {
        return typeof x === 'function';
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var _enable_super_gross_mode_that_will_cause_bad_things = false;
    var config = {
        Promise: undefined,
        set useDeprecatedSynchronousErrorHandling(value) {
            if (value) {
                var error = /*@__PURE__*/ new Error();
                /*@__PURE__*/ console.warn('DEPRECATED! RxJS was set to use deprecated synchronous error handling behavior by code at: \n' + error.stack);
            }
            _enable_super_gross_mode_that_will_cause_bad_things = value;
        },
        get useDeprecatedSynchronousErrorHandling() {
            return _enable_super_gross_mode_that_will_cause_bad_things;
        },
    };

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function hostReportError(err) {
        setTimeout(function () { throw err; });
    }

    /** PURE_IMPORTS_START _config,_util_hostReportError PURE_IMPORTS_END */
    var empty = {
        closed: true,
        next: function (value) { },
        error: function (err) {
            if (config.useDeprecatedSynchronousErrorHandling) {
                throw err;
            }
            else {
                hostReportError(err);
            }
        },
        complete: function () { }
    };

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var isArray = Array.isArray || (function (x) { return x && typeof x.length === 'number'; });

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function isObject(x) {
        return x !== null && typeof x === 'object';
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function UnsubscriptionErrorImpl(errors) {
        Error.call(this);
        this.message = errors ?
            errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ') : '';
        this.name = 'UnsubscriptionError';
        this.errors = errors;
        return this;
    }
    UnsubscriptionErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
    var UnsubscriptionError = UnsubscriptionErrorImpl;

    /** PURE_IMPORTS_START _util_isArray,_util_isObject,_util_isFunction,_util_UnsubscriptionError PURE_IMPORTS_END */
    var Subscription = /*@__PURE__*/ (function () {
        function Subscription(unsubscribe) {
            this.closed = false;
            this._parent = null;
            this._parents = null;
            this._subscriptions = null;
            if (unsubscribe) {
                this._unsubscribe = unsubscribe;
            }
        }
        Subscription.prototype.unsubscribe = function () {
            var hasErrors = false;
            var errors;
            if (this.closed) {
                return;
            }
            var _a = this, _parent = _a._parent, _parents = _a._parents, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
            this.closed = true;
            this._parent = null;
            this._parents = null;
            this._subscriptions = null;
            var index = -1;
            var len = _parents ? _parents.length : 0;
            while (_parent) {
                _parent.remove(this);
                _parent = ++index < len && _parents[index] || null;
            }
            if (isFunction(_unsubscribe)) {
                try {
                    _unsubscribe.call(this);
                }
                catch (e) {
                    hasErrors = true;
                    errors = e instanceof UnsubscriptionError ? flattenUnsubscriptionErrors(e.errors) : [e];
                }
            }
            if (isArray(_subscriptions)) {
                index = -1;
                len = _subscriptions.length;
                while (++index < len) {
                    var sub = _subscriptions[index];
                    if (isObject(sub)) {
                        try {
                            sub.unsubscribe();
                        }
                        catch (e) {
                            hasErrors = true;
                            errors = errors || [];
                            if (e instanceof UnsubscriptionError) {
                                errors = errors.concat(flattenUnsubscriptionErrors(e.errors));
                            }
                            else {
                                errors.push(e);
                            }
                        }
                    }
                }
            }
            if (hasErrors) {
                throw new UnsubscriptionError(errors);
            }
        };
        Subscription.prototype.add = function (teardown) {
            var subscription = teardown;
            switch (typeof teardown) {
                case 'function':
                    subscription = new Subscription(teardown);
                case 'object':
                    if (subscription === this || subscription.closed || typeof subscription.unsubscribe !== 'function') {
                        return subscription;
                    }
                    else if (this.closed) {
                        subscription.unsubscribe();
                        return subscription;
                    }
                    else if (!(subscription instanceof Subscription)) {
                        var tmp = subscription;
                        subscription = new Subscription();
                        subscription._subscriptions = [tmp];
                    }
                    break;
                default: {
                    if (!teardown) {
                        return Subscription.EMPTY;
                    }
                    throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
                }
            }
            if (subscription._addParent(this)) {
                var subscriptions = this._subscriptions;
                if (subscriptions) {
                    subscriptions.push(subscription);
                }
                else {
                    this._subscriptions = [subscription];
                }
            }
            return subscription;
        };
        Subscription.prototype.remove = function (subscription) {
            var subscriptions = this._subscriptions;
            if (subscriptions) {
                var subscriptionIndex = subscriptions.indexOf(subscription);
                if (subscriptionIndex !== -1) {
                    subscriptions.splice(subscriptionIndex, 1);
                }
            }
        };
        Subscription.prototype._addParent = function (parent) {
            var _a = this, _parent = _a._parent, _parents = _a._parents;
            if (_parent === parent) {
                return false;
            }
            else if (!_parent) {
                this._parent = parent;
                return true;
            }
            else if (!_parents) {
                this._parents = [parent];
                return true;
            }
            else if (_parents.indexOf(parent) === -1) {
                _parents.push(parent);
                return true;
            }
            return false;
        };
        Subscription.EMPTY = (function (empty) {
            empty.closed = true;
            return empty;
        }(new Subscription()));
        return Subscription;
    }());
    function flattenUnsubscriptionErrors(errors) {
        return errors.reduce(function (errs, err) { return errs.concat((err instanceof UnsubscriptionError) ? err.errors : err); }, []);
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var rxSubscriber = typeof Symbol === 'function'
        ? /*@__PURE__*/ Symbol('rxSubscriber')
        : '@@rxSubscriber_' + /*@__PURE__*/ Math.random();

    /** PURE_IMPORTS_START tslib,_util_isFunction,_Observer,_Subscription,_internal_symbol_rxSubscriber,_config,_util_hostReportError PURE_IMPORTS_END */
    var Subscriber = /*@__PURE__*/ (function (_super) {
        __extends(Subscriber, _super);
        function Subscriber(destinationOrNext, error, complete) {
            var _this = _super.call(this) || this;
            _this.syncErrorValue = null;
            _this.syncErrorThrown = false;
            _this.syncErrorThrowable = false;
            _this.isStopped = false;
            switch (arguments.length) {
                case 0:
                    _this.destination = empty;
                    break;
                case 1:
                    if (!destinationOrNext) {
                        _this.destination = empty;
                        break;
                    }
                    if (typeof destinationOrNext === 'object') {
                        if (destinationOrNext instanceof Subscriber) {
                            _this.syncErrorThrowable = destinationOrNext.syncErrorThrowable;
                            _this.destination = destinationOrNext;
                            destinationOrNext.add(_this);
                        }
                        else {
                            _this.syncErrorThrowable = true;
                            _this.destination = new SafeSubscriber(_this, destinationOrNext);
                        }
                        break;
                    }
                default:
                    _this.syncErrorThrowable = true;
                    _this.destination = new SafeSubscriber(_this, destinationOrNext, error, complete);
                    break;
            }
            return _this;
        }
        Subscriber.prototype[rxSubscriber] = function () { return this; };
        Subscriber.create = function (next, error, complete) {
            var subscriber = new Subscriber(next, error, complete);
            subscriber.syncErrorThrowable = false;
            return subscriber;
        };
        Subscriber.prototype.next = function (value) {
            if (!this.isStopped) {
                this._next(value);
            }
        };
        Subscriber.prototype.error = function (err) {
            if (!this.isStopped) {
                this.isStopped = true;
                this._error(err);
            }
        };
        Subscriber.prototype.complete = function () {
            if (!this.isStopped) {
                this.isStopped = true;
                this._complete();
            }
        };
        Subscriber.prototype.unsubscribe = function () {
            if (this.closed) {
                return;
            }
            this.isStopped = true;
            _super.prototype.unsubscribe.call(this);
        };
        Subscriber.prototype._next = function (value) {
            this.destination.next(value);
        };
        Subscriber.prototype._error = function (err) {
            this.destination.error(err);
            this.unsubscribe();
        };
        Subscriber.prototype._complete = function () {
            this.destination.complete();
            this.unsubscribe();
        };
        Subscriber.prototype._unsubscribeAndRecycle = function () {
            var _a = this, _parent = _a._parent, _parents = _a._parents;
            this._parent = null;
            this._parents = null;
            this.unsubscribe();
            this.closed = false;
            this.isStopped = false;
            this._parent = _parent;
            this._parents = _parents;
            return this;
        };
        return Subscriber;
    }(Subscription));
    var SafeSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(SafeSubscriber, _super);
        function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {
            var _this = _super.call(this) || this;
            _this._parentSubscriber = _parentSubscriber;
            var next;
            var context = _this;
            if (isFunction(observerOrNext)) {
                next = observerOrNext;
            }
            else if (observerOrNext) {
                next = observerOrNext.next;
                error = observerOrNext.error;
                complete = observerOrNext.complete;
                if (observerOrNext !== empty) {
                    context = Object.create(observerOrNext);
                    if (isFunction(context.unsubscribe)) {
                        _this.add(context.unsubscribe.bind(context));
                    }
                    context.unsubscribe = _this.unsubscribe.bind(_this);
                }
            }
            _this._context = context;
            _this._next = next;
            _this._error = error;
            _this._complete = complete;
            return _this;
        }
        SafeSubscriber.prototype.next = function (value) {
            if (!this.isStopped && this._next) {
                var _parentSubscriber = this._parentSubscriber;
                if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(this._next, value);
                }
                else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.error = function (err) {
            if (!this.isStopped) {
                var _parentSubscriber = this._parentSubscriber;
                var useDeprecatedSynchronousErrorHandling = config.useDeprecatedSynchronousErrorHandling;
                if (this._error) {
                    if (!useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                        this.__tryOrUnsub(this._error, err);
                        this.unsubscribe();
                    }
                    else {
                        this.__tryOrSetError(_parentSubscriber, this._error, err);
                        this.unsubscribe();
                    }
                }
                else if (!_parentSubscriber.syncErrorThrowable) {
                    this.unsubscribe();
                    if (useDeprecatedSynchronousErrorHandling) {
                        throw err;
                    }
                    hostReportError(err);
                }
                else {
                    if (useDeprecatedSynchronousErrorHandling) {
                        _parentSubscriber.syncErrorValue = err;
                        _parentSubscriber.syncErrorThrown = true;
                    }
                    else {
                        hostReportError(err);
                    }
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.complete = function () {
            var _this = this;
            if (!this.isStopped) {
                var _parentSubscriber = this._parentSubscriber;
                if (this._complete) {
                    var wrappedComplete = function () { return _this._complete.call(_this._context); };
                    if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                        this.__tryOrUnsub(wrappedComplete);
                        this.unsubscribe();
                    }
                    else {
                        this.__tryOrSetError(_parentSubscriber, wrappedComplete);
                        this.unsubscribe();
                    }
                }
                else {
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
            try {
                fn.call(this._context, value);
            }
            catch (err) {
                this.unsubscribe();
                if (config.useDeprecatedSynchronousErrorHandling) {
                    throw err;
                }
                else {
                    hostReportError(err);
                }
            }
        };
        SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
            if (!config.useDeprecatedSynchronousErrorHandling) {
                throw new Error('bad call');
            }
            try {
                fn.call(this._context, value);
            }
            catch (err) {
                if (config.useDeprecatedSynchronousErrorHandling) {
                    parent.syncErrorValue = err;
                    parent.syncErrorThrown = true;
                    return true;
                }
                else {
                    hostReportError(err);
                    return true;
                }
            }
            return false;
        };
        SafeSubscriber.prototype._unsubscribe = function () {
            var _parentSubscriber = this._parentSubscriber;
            this._context = null;
            this._parentSubscriber = null;
            _parentSubscriber.unsubscribe();
        };
        return SafeSubscriber;
    }(Subscriber));

    /** PURE_IMPORTS_START _Subscriber PURE_IMPORTS_END */
    function canReportError(observer) {
        while (observer) {
            var _a = observer, closed_1 = _a.closed, destination = _a.destination, isStopped = _a.isStopped;
            if (closed_1 || isStopped) {
                return false;
            }
            else if (destination && destination instanceof Subscriber) {
                observer = destination;
            }
            else {
                observer = null;
            }
        }
        return true;
    }

    /** PURE_IMPORTS_START _Subscriber,_symbol_rxSubscriber,_Observer PURE_IMPORTS_END */
    function toSubscriber(nextOrObserver, error, complete) {
        if (nextOrObserver) {
            if (nextOrObserver instanceof Subscriber) {
                return nextOrObserver;
            }
            if (nextOrObserver[rxSubscriber]) {
                return nextOrObserver[rxSubscriber]();
            }
        }
        if (!nextOrObserver && !error && !complete) {
            return new Subscriber(empty);
        }
        return new Subscriber(nextOrObserver, error, complete);
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var observable = typeof Symbol === 'function' && Symbol.observable || '@@observable';

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function noop() { }

    /** PURE_IMPORTS_START _noop PURE_IMPORTS_END */
    function pipeFromArray(fns) {
        if (!fns) {
            return noop;
        }
        if (fns.length === 1) {
            return fns[0];
        }
        return function piped(input) {
            return fns.reduce(function (prev, fn) { return fn(prev); }, input);
        };
    }

    /** PURE_IMPORTS_START _util_canReportError,_util_toSubscriber,_internal_symbol_observable,_util_pipe,_config PURE_IMPORTS_END */
    var Observable = /*@__PURE__*/ (function () {
        function Observable(subscribe) {
            this._isScalar = false;
            if (subscribe) {
                this._subscribe = subscribe;
            }
        }
        Observable.prototype.lift = function (operator) {
            var observable = new Observable();
            observable.source = this;
            observable.operator = operator;
            return observable;
        };
        Observable.prototype.subscribe = function (observerOrNext, error, complete) {
            var operator = this.operator;
            var sink = toSubscriber(observerOrNext, error, complete);
            if (operator) {
                sink.add(operator.call(sink, this.source));
            }
            else {
                sink.add(this.source || (config.useDeprecatedSynchronousErrorHandling && !sink.syncErrorThrowable) ?
                    this._subscribe(sink) :
                    this._trySubscribe(sink));
            }
            if (config.useDeprecatedSynchronousErrorHandling) {
                if (sink.syncErrorThrowable) {
                    sink.syncErrorThrowable = false;
                    if (sink.syncErrorThrown) {
                        throw sink.syncErrorValue;
                    }
                }
            }
            return sink;
        };
        Observable.prototype._trySubscribe = function (sink) {
            try {
                return this._subscribe(sink);
            }
            catch (err) {
                if (config.useDeprecatedSynchronousErrorHandling) {
                    sink.syncErrorThrown = true;
                    sink.syncErrorValue = err;
                }
                if (canReportError(sink)) {
                    sink.error(err);
                }
                else {
                    console.warn(err);
                }
            }
        };
        Observable.prototype.forEach = function (next, promiseCtor) {
            var _this = this;
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor(function (resolve, reject) {
                var subscription;
                subscription = _this.subscribe(function (value) {
                    try {
                        next(value);
                    }
                    catch (err) {
                        reject(err);
                        if (subscription) {
                            subscription.unsubscribe();
                        }
                    }
                }, reject, resolve);
            });
        };
        Observable.prototype._subscribe = function (subscriber) {
            var source = this.source;
            return source && source.subscribe(subscriber);
        };
        Observable.prototype[observable] = function () {
            return this;
        };
        Observable.prototype.pipe = function () {
            var operations = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                operations[_i] = arguments[_i];
            }
            if (operations.length === 0) {
                return this;
            }
            return pipeFromArray(operations)(this);
        };
        Observable.prototype.toPromise = function (promiseCtor) {
            var _this = this;
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor(function (resolve, reject) {
                var value;
                _this.subscribe(function (x) { return value = x; }, function (err) { return reject(err); }, function () { return resolve(value); });
            });
        };
        Observable.create = function (subscribe) {
            return new Observable(subscribe);
        };
        return Observable;
    }());
    function getPromiseCtor(promiseCtor) {
        if (!promiseCtor) {
            promiseCtor = config.Promise || Promise;
        }
        if (!promiseCtor) {
            throw new Error('no Promise impl found');
        }
        return promiseCtor;
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function ObjectUnsubscribedErrorImpl() {
        Error.call(this);
        this.message = 'object unsubscribed';
        this.name = 'ObjectUnsubscribedError';
        return this;
    }
    ObjectUnsubscribedErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
    var ObjectUnsubscribedError = ObjectUnsubscribedErrorImpl;

    /** PURE_IMPORTS_START tslib,_Subscription PURE_IMPORTS_END */
    var SubjectSubscription = /*@__PURE__*/ (function (_super) {
        __extends(SubjectSubscription, _super);
        function SubjectSubscription(subject, subscriber) {
            var _this = _super.call(this) || this;
            _this.subject = subject;
            _this.subscriber = subscriber;
            _this.closed = false;
            return _this;
        }
        SubjectSubscription.prototype.unsubscribe = function () {
            if (this.closed) {
                return;
            }
            this.closed = true;
            var subject = this.subject;
            var observers = subject.observers;
            this.subject = null;
            if (!observers || observers.length === 0 || subject.isStopped || subject.closed) {
                return;
            }
            var subscriberIndex = observers.indexOf(this.subscriber);
            if (subscriberIndex !== -1) {
                observers.splice(subscriberIndex, 1);
            }
        };
        return SubjectSubscription;
    }(Subscription));

    /** PURE_IMPORTS_START tslib,_Observable,_Subscriber,_Subscription,_util_ObjectUnsubscribedError,_SubjectSubscription,_internal_symbol_rxSubscriber PURE_IMPORTS_END */
    var SubjectSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(SubjectSubscriber, _super);
        function SubjectSubscriber(destination) {
            var _this = _super.call(this, destination) || this;
            _this.destination = destination;
            return _this;
        }
        return SubjectSubscriber;
    }(Subscriber));
    var Subject = /*@__PURE__*/ (function (_super) {
        __extends(Subject, _super);
        function Subject() {
            var _this = _super.call(this) || this;
            _this.observers = [];
            _this.closed = false;
            _this.isStopped = false;
            _this.hasError = false;
            _this.thrownError = null;
            return _this;
        }
        Subject.prototype[rxSubscriber] = function () {
            return new SubjectSubscriber(this);
        };
        Subject.prototype.lift = function (operator) {
            var subject = new AnonymousSubject(this, this);
            subject.operator = operator;
            return subject;
        };
        Subject.prototype.next = function (value) {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            if (!this.isStopped) {
                var observers = this.observers;
                var len = observers.length;
                var copy = observers.slice();
                for (var i = 0; i < len; i++) {
                    copy[i].next(value);
                }
            }
        };
        Subject.prototype.error = function (err) {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            this.hasError = true;
            this.thrownError = err;
            this.isStopped = true;
            var observers = this.observers;
            var len = observers.length;
            var copy = observers.slice();
            for (var i = 0; i < len; i++) {
                copy[i].error(err);
            }
            this.observers.length = 0;
        };
        Subject.prototype.complete = function () {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            this.isStopped = true;
            var observers = this.observers;
            var len = observers.length;
            var copy = observers.slice();
            for (var i = 0; i < len; i++) {
                copy[i].complete();
            }
            this.observers.length = 0;
        };
        Subject.prototype.unsubscribe = function () {
            this.isStopped = true;
            this.closed = true;
            this.observers = null;
        };
        Subject.prototype._trySubscribe = function (subscriber) {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            else {
                return _super.prototype._trySubscribe.call(this, subscriber);
            }
        };
        Subject.prototype._subscribe = function (subscriber) {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            else if (this.hasError) {
                subscriber.error(this.thrownError);
                return Subscription.EMPTY;
            }
            else if (this.isStopped) {
                subscriber.complete();
                return Subscription.EMPTY;
            }
            else {
                this.observers.push(subscriber);
                return new SubjectSubscription(this, subscriber);
            }
        };
        Subject.prototype.asObservable = function () {
            var observable = new Observable();
            observable.source = this;
            return observable;
        };
        Subject.create = function (destination, source) {
            return new AnonymousSubject(destination, source);
        };
        return Subject;
    }(Observable));
    var AnonymousSubject = /*@__PURE__*/ (function (_super) {
        __extends(AnonymousSubject, _super);
        function AnonymousSubject(destination, source) {
            var _this = _super.call(this) || this;
            _this.destination = destination;
            _this.source = source;
            return _this;
        }
        AnonymousSubject.prototype.next = function (value) {
            var destination = this.destination;
            if (destination && destination.next) {
                destination.next(value);
            }
        };
        AnonymousSubject.prototype.error = function (err) {
            var destination = this.destination;
            if (destination && destination.error) {
                this.destination.error(err);
            }
        };
        AnonymousSubject.prototype.complete = function () {
            var destination = this.destination;
            if (destination && destination.complete) {
                this.destination.complete();
            }
        };
        AnonymousSubject.prototype._subscribe = function (subscriber) {
            var source = this.source;
            if (source) {
                return this.source.subscribe(subscriber);
            }
            else {
                return Subscription.EMPTY;
            }
        };
        return AnonymousSubject;
    }(Subject));

    /** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
    function refCount() {
        return function refCountOperatorFunction(source) {
            return source.lift(new RefCountOperator(source));
        };
    }
    var RefCountOperator = /*@__PURE__*/ (function () {
        function RefCountOperator(connectable) {
            this.connectable = connectable;
        }
        RefCountOperator.prototype.call = function (subscriber, source) {
            var connectable = this.connectable;
            connectable._refCount++;
            var refCounter = new RefCountSubscriber(subscriber, connectable);
            var subscription = source.subscribe(refCounter);
            if (!refCounter.closed) {
                refCounter.connection = connectable.connect();
            }
            return subscription;
        };
        return RefCountOperator;
    }());
    var RefCountSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(RefCountSubscriber, _super);
        function RefCountSubscriber(destination, connectable) {
            var _this = _super.call(this, destination) || this;
            _this.connectable = connectable;
            return _this;
        }
        RefCountSubscriber.prototype._unsubscribe = function () {
            var connectable = this.connectable;
            if (!connectable) {
                this.connection = null;
                return;
            }
            this.connectable = null;
            var refCount = connectable._refCount;
            if (refCount <= 0) {
                this.connection = null;
                return;
            }
            connectable._refCount = refCount - 1;
            if (refCount > 1) {
                this.connection = null;
                return;
            }
            var connection = this.connection;
            var sharedConnection = connectable._connection;
            this.connection = null;
            if (sharedConnection && (!connection || sharedConnection === connection)) {
                sharedConnection.unsubscribe();
            }
        };
        return RefCountSubscriber;
    }(Subscriber));

    /** PURE_IMPORTS_START tslib,_Subject,_Observable,_Subscriber,_Subscription,_operators_refCount PURE_IMPORTS_END */
    var ConnectableObservable = /*@__PURE__*/ (function (_super) {
        __extends(ConnectableObservable, _super);
        function ConnectableObservable(source, subjectFactory) {
            var _this = _super.call(this) || this;
            _this.source = source;
            _this.subjectFactory = subjectFactory;
            _this._refCount = 0;
            _this._isComplete = false;
            return _this;
        }
        ConnectableObservable.prototype._subscribe = function (subscriber) {
            return this.getSubject().subscribe(subscriber);
        };
        ConnectableObservable.prototype.getSubject = function () {
            var subject = this._subject;
            if (!subject || subject.isStopped) {
                this._subject = this.subjectFactory();
            }
            return this._subject;
        };
        ConnectableObservable.prototype.connect = function () {
            var connection = this._connection;
            if (!connection) {
                this._isComplete = false;
                connection = this._connection = new Subscription();
                connection.add(this.source
                    .subscribe(new ConnectableSubscriber(this.getSubject(), this)));
                if (connection.closed) {
                    this._connection = null;
                    connection = Subscription.EMPTY;
                }
                else {
                    this._connection = connection;
                }
            }
            return connection;
        };
        ConnectableObservable.prototype.refCount = function () {
            return refCount()(this);
        };
        return ConnectableObservable;
    }(Observable));
    var connectableProto = ConnectableObservable.prototype;
    var connectableObservableDescriptor = {
        operator: { value: null },
        _refCount: { value: 0, writable: true },
        _subject: { value: null, writable: true },
        _connection: { value: null, writable: true },
        _subscribe: { value: connectableProto._subscribe },
        _isComplete: { value: connectableProto._isComplete, writable: true },
        getSubject: { value: connectableProto.getSubject },
        connect: { value: connectableProto.connect },
        refCount: { value: connectableProto.refCount }
    };
    var ConnectableSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(ConnectableSubscriber, _super);
        function ConnectableSubscriber(destination, connectable) {
            var _this = _super.call(this, destination) || this;
            _this.connectable = connectable;
            return _this;
        }
        ConnectableSubscriber.prototype._error = function (err) {
            this._unsubscribe();
            _super.prototype._error.call(this, err);
        };
        ConnectableSubscriber.prototype._complete = function () {
            this.connectable._isComplete = true;
            this._unsubscribe();
            _super.prototype._complete.call(this);
        };
        ConnectableSubscriber.prototype._unsubscribe = function () {
            var connectable = this.connectable;
            if (connectable) {
                this.connectable = null;
                var connection = connectable._connection;
                connectable._refCount = 0;
                connectable._subject = null;
                connectable._connection = null;
                if (connection) {
                    connection.unsubscribe();
                }
            }
        };
        return ConnectableSubscriber;
    }(SubjectSubscriber));

    /** PURE_IMPORTS_START tslib,_Subscriber,_Subscription,_Observable,_Subject PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_Subject,_util_ObjectUnsubscribedError PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_Subscription PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_Action PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_AsyncAction PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_Scheduler PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_AsyncScheduler PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _QueueAction,_QueueScheduler PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_Subscription,_util_subscribeToArray PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _util_isScheduler,_fromArray,_empty,_scalar PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _observable_empty,_observable_of,_observable_throwError PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_Subscriber,_Notification PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_Subject,_scheduler_queue,_Subscription,_operators_observeOn,_util_ObjectUnsubscribedError,_SubjectSubscription PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_Subject,_Subscription PURE_IMPORTS_END */

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_util_Immediate,_AsyncAction PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_AsyncScheduler PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _AsapAction,_AsapScheduler PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _AsyncAction,_AsyncScheduler PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_AsyncAction PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_AsyncScheduler PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _AnimationFrameAction,_AnimationFrameScheduler PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_AsyncAction,_AsyncScheduler PURE_IMPORTS_END */

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_AsyncSubject,_operators_map,_util_canReportError,_util_isArray,_util_isScheduler PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_AsyncSubject,_operators_map,_util_canReportError,_util_isScheduler,_util_isArray PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _hostReportError PURE_IMPORTS_END */

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _symbol_iterator PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _symbol_observable PURE_IMPORTS_END */

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_subscribeToArray,_subscribeToPromise,_subscribeToIterable,_subscribeToObservable,_isArrayLike,_isPromise,_isObject,_symbol_iterator,_symbol_observable PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _InnerSubscriber,_subscribeTo PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_util_isScheduler,_util_isArray,_OuterSubscriber,_util_subscribeToResult,_fromArray PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _symbol_observable PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _symbol_iterator PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_Subscription,_util_subscribeToPromise PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_Subscription,_symbol_iterator,_util_subscribeToIterable PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_Subscription,_symbol_observable,_util_subscribeToObservable PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_util_isPromise,_util_isArrayLike,_util_isInteropObservable,_util_isIterable,_fromArray,_fromPromise,_fromIterable,_fromObservable,_util_subscribeTo PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_util_subscribeToResult,_OuterSubscriber,_InnerSubscriber,_map,_observable_from PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _mergeMap,_util_identity PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _mergeAll PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _of,_operators_concatAll PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_from,_empty PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_Observable,_util_isArray,_empty,_util_subscribeToResult,_OuterSubscriber,_operators_map PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_util_isArray,_util_isFunction,_operators_map PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_util_isArray,_util_isFunction,_operators_map PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_util_identity,_util_isScheduler PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _defer,_empty PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _isArray PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_scheduler_async,_util_isNumeric PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_util_isScheduler,_operators_mergeAll,_fromArray PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_util_noop PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_from,_util_isArray,_empty PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_Subscription PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_util_isArray,_fromArray,_OuterSubscriber,_util_subscribeToResult PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_scheduler_async,_util_isNumeric,_util_isScheduler PURE_IMPORTS_END */

    /** PURE_IMPORTS_START _Observable,_from,_empty PURE_IMPORTS_END */

    /** PURE_IMPORTS_START tslib,_fromArray,_util_isArray,_Subscriber,_OuterSubscriber,_util_subscribeToResult,_.._internal_symbol_iterator PURE_IMPORTS_END */

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */

    var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var underscore = createCommonjsModule(function (module, exports) {
    //     Underscore.js 1.4.4
    //     http://underscorejs.org
    //     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
    //     Underscore may be freely distributed under the MIT license.

    (function() {

      // Baseline setup
      // --------------

      // Establish the root object, `window` in the browser, or `global` on the server.
      var root = this;

      // Save the previous value of the `_` variable.
      var previousUnderscore = root._;

      // Establish the object that gets returned to break out of a loop iteration.
      var breaker = {};

      // Save bytes in the minified (but not gzipped) version:
      var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

      // Create quick reference variables for speed access to core prototypes.
      var push             = ArrayProto.push,
          slice            = ArrayProto.slice,
          concat           = ArrayProto.concat,
          toString         = ObjProto.toString,
          hasOwnProperty   = ObjProto.hasOwnProperty;

      // All **ECMAScript 5** native function implementations that we hope to use
      // are declared here.
      var
        nativeForEach      = ArrayProto.forEach,
        nativeMap          = ArrayProto.map,
        nativeReduce       = ArrayProto.reduce,
        nativeReduceRight  = ArrayProto.reduceRight,
        nativeFilter       = ArrayProto.filter,
        nativeEvery        = ArrayProto.every,
        nativeSome         = ArrayProto.some,
        nativeIndexOf      = ArrayProto.indexOf,
        nativeLastIndexOf  = ArrayProto.lastIndexOf,
        nativeIsArray      = Array.isArray,
        nativeKeys         = Object.keys,
        nativeBind         = FuncProto.bind;

      // Create a safe reference to the Underscore object for use below.
      var _ = function(obj) {
        if (obj instanceof _) return obj;
        if (!(this instanceof _)) return new _(obj);
        this._wrapped = obj;
      };

      // Export the Underscore object for **Node.js**, with
      // backwards-compatibility for the old `require()` API. If we're in
      // the browser, add `_` as a global object via a string identifier,
      // for Closure Compiler "advanced" mode.
      {
        if (module.exports) {
          exports = module.exports = _;
        }
        exports._ = _;
      }

      // Current version.
      _.VERSION = '1.4.4';

      // Collection Functions
      // --------------------

      // The cornerstone, an `each` implementation, aka `forEach`.
      // Handles objects with the built-in `forEach`, arrays, and raw objects.
      // Delegates to **ECMAScript 5**'s native `forEach` if available.
      var each = _.each = _.forEach = function(obj, iterator, context) {
        if (obj == null) return;
        if (nativeForEach && obj.forEach === nativeForEach) {
          obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
          for (var i = 0, l = obj.length; i < l; i++) {
            if (iterator.call(context, obj[i], i, obj) === breaker) return;
          }
        } else {
          for (var key in obj) {
            if (_.has(obj, key)) {
              if (iterator.call(context, obj[key], key, obj) === breaker) return;
            }
          }
        }
      };

      // Return the results of applying the iterator to each element.
      // Delegates to **ECMAScript 5**'s native `map` if available.
      _.map = _.collect = function(obj, iterator, context) {
        var results = [];
        if (obj == null) return results;
        if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
        each(obj, function(value, index, list) {
          results[results.length] = iterator.call(context, value, index, list);
        });
        return results;
      };

      var reduceError = 'Reduce of empty array with no initial value';

      // **Reduce** builds up a single result from a list of values, aka `inject`,
      // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
      _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
        var initial = arguments.length > 2;
        if (obj == null) obj = [];
        if (nativeReduce && obj.reduce === nativeReduce) {
          if (context) iterator = _.bind(iterator, context);
          return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
        }
        each(obj, function(value, index, list) {
          if (!initial) {
            memo = value;
            initial = true;
          } else {
            memo = iterator.call(context, memo, value, index, list);
          }
        });
        if (!initial) throw new TypeError(reduceError);
        return memo;
      };

      // The right-associative version of reduce, also known as `foldr`.
      // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
      _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
        var initial = arguments.length > 2;
        if (obj == null) obj = [];
        if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
          if (context) iterator = _.bind(iterator, context);
          return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
        }
        var length = obj.length;
        if (length !== +length) {
          var keys = _.keys(obj);
          length = keys.length;
        }
        each(obj, function(value, index, list) {
          index = keys ? keys[--length] : --length;
          if (!initial) {
            memo = obj[index];
            initial = true;
          } else {
            memo = iterator.call(context, memo, obj[index], index, list);
          }
        });
        if (!initial) throw new TypeError(reduceError);
        return memo;
      };

      // Return the first value which passes a truth test. Aliased as `detect`.
      _.find = _.detect = function(obj, iterator, context) {
        var result;
        any(obj, function(value, index, list) {
          if (iterator.call(context, value, index, list)) {
            result = value;
            return true;
          }
        });
        return result;
      };

      // Return all the elements that pass a truth test.
      // Delegates to **ECMAScript 5**'s native `filter` if available.
      // Aliased as `select`.
      _.filter = _.select = function(obj, iterator, context) {
        var results = [];
        if (obj == null) return results;
        if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
        each(obj, function(value, index, list) {
          if (iterator.call(context, value, index, list)) results[results.length] = value;
        });
        return results;
      };

      // Return all the elements for which a truth test fails.
      _.reject = function(obj, iterator, context) {
        return _.filter(obj, function(value, index, list) {
          return !iterator.call(context, value, index, list);
        }, context);
      };

      // Determine whether all of the elements match a truth test.
      // Delegates to **ECMAScript 5**'s native `every` if available.
      // Aliased as `all`.
      _.every = _.all = function(obj, iterator, context) {
        iterator || (iterator = _.identity);
        var result = true;
        if (obj == null) return result;
        if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
        each(obj, function(value, index, list) {
          if (!(result = result && iterator.call(context, value, index, list))) return breaker;
        });
        return !!result;
      };

      // Determine if at least one element in the object matches a truth test.
      // Delegates to **ECMAScript 5**'s native `some` if available.
      // Aliased as `any`.
      var any = _.some = _.any = function(obj, iterator, context) {
        iterator || (iterator = _.identity);
        var result = false;
        if (obj == null) return result;
        if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
        each(obj, function(value, index, list) {
          if (result || (result = iterator.call(context, value, index, list))) return breaker;
        });
        return !!result;
      };

      // Determine if the array or object contains a given value (using `===`).
      // Aliased as `include`.
      _.contains = _.include = function(obj, target) {
        if (obj == null) return false;
        if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
        return any(obj, function(value) {
          return value === target;
        });
      };

      // Invoke a method (with arguments) on every item in a collection.
      _.invoke = function(obj, method) {
        var args = slice.call(arguments, 2);
        var isFunc = _.isFunction(method);
        return _.map(obj, function(value) {
          return (isFunc ? method : value[method]).apply(value, args);
        });
      };

      // Convenience version of a common use case of `map`: fetching a property.
      _.pluck = function(obj, key) {
        return _.map(obj, function(value){ return value[key]; });
      };

      // Convenience version of a common use case of `filter`: selecting only objects
      // containing specific `key:value` pairs.
      _.where = function(obj, attrs, first) {
        if (_.isEmpty(attrs)) return first ? null : [];
        return _[first ? 'find' : 'filter'](obj, function(value) {
          for (var key in attrs) {
            if (attrs[key] !== value[key]) return false;
          }
          return true;
        });
      };

      // Convenience version of a common use case of `find`: getting the first object
      // containing specific `key:value` pairs.
      _.findWhere = function(obj, attrs) {
        return _.where(obj, attrs, true);
      };

      // Return the maximum element or (element-based computation).
      // Can't optimize arrays of integers longer than 65,535 elements.
      // See: https://bugs.webkit.org/show_bug.cgi?id=80797
      _.max = function(obj, iterator, context) {
        if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
          return Math.max.apply(Math, obj);
        }
        if (!iterator && _.isEmpty(obj)) return -Infinity;
        var result = {computed : -Infinity, value: -Infinity};
        each(obj, function(value, index, list) {
          var computed = iterator ? iterator.call(context, value, index, list) : value;
          computed >= result.computed && (result = {value : value, computed : computed});
        });
        return result.value;
      };

      // Return the minimum element (or element-based computation).
      _.min = function(obj, iterator, context) {
        if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
          return Math.min.apply(Math, obj);
        }
        if (!iterator && _.isEmpty(obj)) return Infinity;
        var result = {computed : Infinity, value: Infinity};
        each(obj, function(value, index, list) {
          var computed = iterator ? iterator.call(context, value, index, list) : value;
          computed < result.computed && (result = {value : value, computed : computed});
        });
        return result.value;
      };

      // Shuffle an array.
      _.shuffle = function(obj) {
        var rand;
        var index = 0;
        var shuffled = [];
        each(obj, function(value) {
          rand = _.random(index++);
          shuffled[index - 1] = shuffled[rand];
          shuffled[rand] = value;
        });
        return shuffled;
      };

      // An internal function to generate lookup iterators.
      var lookupIterator = function(value) {
        return _.isFunction(value) ? value : function(obj){ return obj[value]; };
      };

      // Sort the object's values by a criterion produced by an iterator.
      _.sortBy = function(obj, value, context) {
        var iterator = lookupIterator(value);
        return _.pluck(_.map(obj, function(value, index, list) {
          return {
            value : value,
            index : index,
            criteria : iterator.call(context, value, index, list)
          };
        }).sort(function(left, right) {
          var a = left.criteria;
          var b = right.criteria;
          if (a !== b) {
            if (a > b || a === void 0) return 1;
            if (a < b || b === void 0) return -1;
          }
          return left.index < right.index ? -1 : 1;
        }), 'value');
      };

      // An internal function used for aggregate "group by" operations.
      var group = function(obj, value, context, behavior) {
        var result = {};
        var iterator = lookupIterator(value || _.identity);
        each(obj, function(value, index) {
          var key = iterator.call(context, value, index, obj);
          behavior(result, key, value);
        });
        return result;
      };

      // Groups the object's values by a criterion. Pass either a string attribute
      // to group by, or a function that returns the criterion.
      _.groupBy = function(obj, value, context) {
        return group(obj, value, context, function(result, key, value) {
          (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
        });
      };

      // Counts instances of an object that group by a certain criterion. Pass
      // either a string attribute to count by, or a function that returns the
      // criterion.
      _.countBy = function(obj, value, context) {
        return group(obj, value, context, function(result, key) {
          if (!_.has(result, key)) result[key] = 0;
          result[key]++;
        });
      };

      // Use a comparator function to figure out the smallest index at which
      // an object should be inserted so as to maintain order. Uses binary search.
      _.sortedIndex = function(array, obj, iterator, context) {
        iterator = iterator == null ? _.identity : lookupIterator(iterator);
        var value = iterator.call(context, obj);
        var low = 0, high = array.length;
        while (low < high) {
          var mid = (low + high) >>> 1;
          iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
        }
        return low;
      };

      // Safely convert anything iterable into a real, live array.
      _.toArray = function(obj) {
        if (!obj) return [];
        if (_.isArray(obj)) return slice.call(obj);
        if (obj.length === +obj.length) return _.map(obj, _.identity);
        return _.values(obj);
      };

      // Return the number of elements in an object.
      _.size = function(obj) {
        if (obj == null) return 0;
        return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
      };

      // Array Functions
      // ---------------

      // Get the first element of an array. Passing **n** will return the first N
      // values in the array. Aliased as `head` and `take`. The **guard** check
      // allows it to work with `_.map`.
      _.first = _.head = _.take = function(array, n, guard) {
        if (array == null) return void 0;
        return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
      };

      // Returns everything but the last entry of the array. Especially useful on
      // the arguments object. Passing **n** will return all the values in
      // the array, excluding the last N. The **guard** check allows it to work with
      // `_.map`.
      _.initial = function(array, n, guard) {
        return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
      };

      // Get the last element of an array. Passing **n** will return the last N
      // values in the array. The **guard** check allows it to work with `_.map`.
      _.last = function(array, n, guard) {
        if (array == null) return void 0;
        if ((n != null) && !guard) {
          return slice.call(array, Math.max(array.length - n, 0));
        } else {
          return array[array.length - 1];
        }
      };

      // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
      // Especially useful on the arguments object. Passing an **n** will return
      // the rest N values in the array. The **guard**
      // check allows it to work with `_.map`.
      _.rest = _.tail = _.drop = function(array, n, guard) {
        return slice.call(array, (n == null) || guard ? 1 : n);
      };

      // Trim out all falsy values from an array.
      _.compact = function(array) {
        return _.filter(array, _.identity);
      };

      // Internal implementation of a recursive `flatten` function.
      var flatten = function(input, shallow, output) {
        each(input, function(value) {
          if (_.isArray(value)) {
            shallow ? push.apply(output, value) : flatten(value, shallow, output);
          } else {
            output.push(value);
          }
        });
        return output;
      };

      // Return a completely flattened version of an array.
      _.flatten = function(array, shallow) {
        return flatten(array, shallow, []);
      };

      // Return a version of the array that does not contain the specified value(s).
      _.without = function(array) {
        return _.difference(array, slice.call(arguments, 1));
      };

      // Produce a duplicate-free version of the array. If the array has already
      // been sorted, you have the option of using a faster algorithm.
      // Aliased as `unique`.
      _.uniq = _.unique = function(array, isSorted, iterator, context) {
        if (_.isFunction(isSorted)) {
          context = iterator;
          iterator = isSorted;
          isSorted = false;
        }
        var initial = iterator ? _.map(array, iterator, context) : array;
        var results = [];
        var seen = [];
        each(initial, function(value, index) {
          if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
            seen.push(value);
            results.push(array[index]);
          }
        });
        return results;
      };

      // Produce an array that contains the union: each distinct element from all of
      // the passed-in arrays.
      _.union = function() {
        return _.uniq(concat.apply(ArrayProto, arguments));
      };

      // Produce an array that contains every item shared between all the
      // passed-in arrays.
      _.intersection = function(array) {
        var rest = slice.call(arguments, 1);
        return _.filter(_.uniq(array), function(item) {
          return _.every(rest, function(other) {
            return _.indexOf(other, item) >= 0;
          });
        });
      };

      // Take the difference between one array and a number of other arrays.
      // Only the elements present in just the first array will remain.
      _.difference = function(array) {
        var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
        return _.filter(array, function(value){ return !_.contains(rest, value); });
      };

      // Zip together multiple lists into a single array -- elements that share
      // an index go together.
      _.zip = function() {
        var args = slice.call(arguments);
        var length = _.max(_.pluck(args, 'length'));
        var results = new Array(length);
        for (var i = 0; i < length; i++) {
          results[i] = _.pluck(args, "" + i);
        }
        return results;
      };

      // Converts lists into objects. Pass either a single array of `[key, value]`
      // pairs, or two parallel arrays of the same length -- one of keys, and one of
      // the corresponding values.
      _.object = function(list, values) {
        if (list == null) return {};
        var result = {};
        for (var i = 0, l = list.length; i < l; i++) {
          if (values) {
            result[list[i]] = values[i];
          } else {
            result[list[i][0]] = list[i][1];
          }
        }
        return result;
      };

      // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
      // we need this function. Return the position of the first occurrence of an
      // item in an array, or -1 if the item is not included in the array.
      // Delegates to **ECMAScript 5**'s native `indexOf` if available.
      // If the array is large and already in sort order, pass `true`
      // for **isSorted** to use binary search.
      _.indexOf = function(array, item, isSorted) {
        if (array == null) return -1;
        var i = 0, l = array.length;
        if (isSorted) {
          if (typeof isSorted == 'number') {
            i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
          } else {
            i = _.sortedIndex(array, item);
            return array[i] === item ? i : -1;
          }
        }
        if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
        for (; i < l; i++) if (array[i] === item) return i;
        return -1;
      };

      // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
      _.lastIndexOf = function(array, item, from) {
        if (array == null) return -1;
        var hasIndex = from != null;
        if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
          return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
        }
        var i = (hasIndex ? from : array.length);
        while (i--) if (array[i] === item) return i;
        return -1;
      };

      // Generate an integer Array containing an arithmetic progression. A port of
      // the native Python `range()` function. See
      // [the Python documentation](http://docs.python.org/library/functions.html#range).
      _.range = function(start, stop, step) {
        if (arguments.length <= 1) {
          stop = start || 0;
          start = 0;
        }
        step = arguments[2] || 1;

        var len = Math.max(Math.ceil((stop - start) / step), 0);
        var idx = 0;
        var range = new Array(len);

        while(idx < len) {
          range[idx++] = start;
          start += step;
        }

        return range;
      };

      // Function (ahem) Functions
      // ------------------

      // Create a function bound to a given object (assigning `this`, and arguments,
      // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
      // available.
      _.bind = function(func, context) {
        if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
        var args = slice.call(arguments, 2);
        return function() {
          return func.apply(context, args.concat(slice.call(arguments)));
        };
      };

      // Partially apply a function by creating a version that has had some of its
      // arguments pre-filled, without changing its dynamic `this` context.
      _.partial = function(func) {
        var args = slice.call(arguments, 1);
        return function() {
          return func.apply(this, args.concat(slice.call(arguments)));
        };
      };

      // Bind all of an object's methods to that object. Useful for ensuring that
      // all callbacks defined on an object belong to it.
      _.bindAll = function(obj) {
        var funcs = slice.call(arguments, 1);
        if (funcs.length === 0) funcs = _.functions(obj);
        each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
        return obj;
      };

      // Memoize an expensive function by storing its results.
      _.memoize = function(func, hasher) {
        var memo = {};
        hasher || (hasher = _.identity);
        return function() {
          var key = hasher.apply(this, arguments);
          return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
        };
      };

      // Delays a function for the given number of milliseconds, and then calls
      // it with the arguments supplied.
      _.delay = function(func, wait) {
        var args = slice.call(arguments, 2);
        return setTimeout(function(){ return func.apply(null, args); }, wait);
      };

      // Defers a function, scheduling it to run after the current call stack has
      // cleared.
      _.defer = function(func) {
        return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
      };

      // Returns a function, that, when invoked, will only be triggered at most once
      // during a given window of time.
      _.throttle = function(func, wait) {
        var context, args, timeout, result;
        var previous = 0;
        var later = function() {
          previous = new Date;
          timeout = null;
          result = func.apply(context, args);
        };
        return function() {
          var now = new Date;
          var remaining = wait - (now - previous);
          context = this;
          args = arguments;
          if (remaining <= 0) {
            clearTimeout(timeout);
            timeout = null;
            previous = now;
            result = func.apply(context, args);
          } else if (!timeout) {
            timeout = setTimeout(later, remaining);
          }
          return result;
        };
      };

      // Returns a function, that, as long as it continues to be invoked, will not
      // be triggered. The function will be called after it stops being called for
      // N milliseconds. If `immediate` is passed, trigger the function on the
      // leading edge, instead of the trailing.
      _.debounce = function(func, wait, immediate) {
        var timeout, result;
        return function() {
          var context = this, args = arguments;
          var later = function() {
            timeout = null;
            if (!immediate) result = func.apply(context, args);
          };
          var callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
          if (callNow) result = func.apply(context, args);
          return result;
        };
      };

      // Returns a function that will be executed at most one time, no matter how
      // often you call it. Useful for lazy initialization.
      _.once = function(func) {
        var ran = false, memo;
        return function() {
          if (ran) return memo;
          ran = true;
          memo = func.apply(this, arguments);
          func = null;
          return memo;
        };
      };

      // Returns the first function passed as an argument to the second,
      // allowing you to adjust arguments, run code before and after, and
      // conditionally execute the original function.
      _.wrap = function(func, wrapper) {
        return function() {
          var args = [func];
          push.apply(args, arguments);
          return wrapper.apply(this, args);
        };
      };

      // Returns a function that is the composition of a list of functions, each
      // consuming the return value of the function that follows.
      _.compose = function() {
        var funcs = arguments;
        return function() {
          var args = arguments;
          for (var i = funcs.length - 1; i >= 0; i--) {
            args = [funcs[i].apply(this, args)];
          }
          return args[0];
        };
      };

      // Returns a function that will only be executed after being called N times.
      _.after = function(times, func) {
        if (times <= 0) return func();
        return function() {
          if (--times < 1) {
            return func.apply(this, arguments);
          }
        };
      };

      // Object Functions
      // ----------------

      // Retrieve the names of an object's properties.
      // Delegates to **ECMAScript 5**'s native `Object.keys`
      _.keys = nativeKeys || function(obj) {
        if (obj !== Object(obj)) throw new TypeError('Invalid object');
        var keys = [];
        for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
        return keys;
      };

      // Retrieve the values of an object's properties.
      _.values = function(obj) {
        var values = [];
        for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
        return values;
      };

      // Convert an object into a list of `[key, value]` pairs.
      _.pairs = function(obj) {
        var pairs = [];
        for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
        return pairs;
      };

      // Invert the keys and values of an object. The values must be serializable.
      _.invert = function(obj) {
        var result = {};
        for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
        return result;
      };

      // Return a sorted list of the function names available on the object.
      // Aliased as `methods`
      _.functions = _.methods = function(obj) {
        var names = [];
        for (var key in obj) {
          if (_.isFunction(obj[key])) names.push(key);
        }
        return names.sort();
      };

      // Extend a given object with all the properties in passed-in object(s).
      _.extend = function(obj) {
        each(slice.call(arguments, 1), function(source) {
          if (source) {
            for (var prop in source) {
              obj[prop] = source[prop];
            }
          }
        });
        return obj;
      };

      // Return a copy of the object only containing the whitelisted properties.
      _.pick = function(obj) {
        var copy = {};
        var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
        each(keys, function(key) {
          if (key in obj) copy[key] = obj[key];
        });
        return copy;
      };

       // Return a copy of the object without the blacklisted properties.
      _.omit = function(obj) {
        var copy = {};
        var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
        for (var key in obj) {
          if (!_.contains(keys, key)) copy[key] = obj[key];
        }
        return copy;
      };

      // Fill in a given object with default properties.
      _.defaults = function(obj) {
        each(slice.call(arguments, 1), function(source) {
          if (source) {
            for (var prop in source) {
              if (obj[prop] == null) obj[prop] = source[prop];
            }
          }
        });
        return obj;
      };

      // Create a (shallow-cloned) duplicate of an object.
      _.clone = function(obj) {
        if (!_.isObject(obj)) return obj;
        return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
      };

      // Invokes interceptor with the obj, and then returns obj.
      // The primary purpose of this method is to "tap into" a method chain, in
      // order to perform operations on intermediate results within the chain.
      _.tap = function(obj, interceptor) {
        interceptor(obj);
        return obj;
      };

      // Internal recursive comparison function for `isEqual`.
      var eq = function(a, b, aStack, bStack) {
        // Identical objects are equal. `0 === -0`, but they aren't identical.
        // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
        if (a === b) return a !== 0 || 1 / a == 1 / b;
        // A strict comparison is necessary because `null == undefined`.
        if (a == null || b == null) return a === b;
        // Unwrap any wrapped objects.
        if (a instanceof _) a = a._wrapped;
        if (b instanceof _) b = b._wrapped;
        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className != toString.call(b)) return false;
        switch (className) {
          // Strings, numbers, dates, and booleans are compared by value.
          case '[object String]':
            // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
            // equivalent to `new String("5")`.
            return a == String(b);
          case '[object Number]':
            // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
            // other numeric values.
            return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
          case '[object Date]':
          case '[object Boolean]':
            // Coerce dates and booleans to numeric primitive values. Dates are compared by their
            // millisecond representations. Note that invalid dates with millisecond representations
            // of `NaN` are not equivalent.
            return +a == +b;
          // RegExps are compared by their source patterns and flags.
          case '[object RegExp]':
            return a.source == b.source &&
                   a.global == b.global &&
                   a.multiline == b.multiline &&
                   a.ignoreCase == b.ignoreCase;
        }
        if (typeof a != 'object' || typeof b != 'object') return false;
        // Assume equality for cyclic structures. The algorithm for detecting cyclic
        // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
        var length = aStack.length;
        while (length--) {
          // Linear search. Performance is inversely proportional to the number of
          // unique nested structures.
          if (aStack[length] == a) return bStack[length] == b;
        }
        // Add the first object to the stack of traversed objects.
        aStack.push(a);
        bStack.push(b);
        var size = 0, result = true;
        // Recursively compare objects and arrays.
        if (className == '[object Array]') {
          // Compare array lengths to determine if a deep comparison is necessary.
          size = a.length;
          result = size == b.length;
          if (result) {
            // Deep compare the contents, ignoring non-numeric properties.
            while (size--) {
              if (!(result = eq(a[size], b[size], aStack, bStack))) break;
            }
          }
        } else {
          // Objects with different constructors are not equivalent, but `Object`s
          // from different frames are.
          var aCtor = a.constructor, bCtor = b.constructor;
          if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                                   _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
            return false;
          }
          // Deep compare objects.
          for (var key in a) {
            if (_.has(a, key)) {
              // Count the expected number of properties.
              size++;
              // Deep compare each member.
              if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
            }
          }
          // Ensure that both objects contain the same number of properties.
          if (result) {
            for (key in b) {
              if (_.has(b, key) && !(size--)) break;
            }
            result = !size;
          }
        }
        // Remove the first object from the stack of traversed objects.
        aStack.pop();
        bStack.pop();
        return result;
      };

      // Perform a deep comparison to check if two objects are equal.
      _.isEqual = function(a, b) {
        return eq(a, b, [], []);
      };

      // Is a given array, string, or object empty?
      // An "empty" object has no enumerable own-properties.
      _.isEmpty = function(obj) {
        if (obj == null) return true;
        if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
        for (var key in obj) if (_.has(obj, key)) return false;
        return true;
      };

      // Is a given value a DOM element?
      _.isElement = function(obj) {
        return !!(obj && obj.nodeType === 1);
      };

      // Is a given value an array?
      // Delegates to ECMA5's native Array.isArray
      _.isArray = nativeIsArray || function(obj) {
        return toString.call(obj) == '[object Array]';
      };

      // Is a given variable an object?
      _.isObject = function(obj) {
        return obj === Object(obj);
      };

      // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
      each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
        _['is' + name] = function(obj) {
          return toString.call(obj) == '[object ' + name + ']';
        };
      });

      // Define a fallback version of the method in browsers (ahem, IE), where
      // there isn't any inspectable "Arguments" type.
      if (!_.isArguments(arguments)) {
        _.isArguments = function(obj) {
          return !!(obj && _.has(obj, 'callee'));
        };
      }

      // Optimize `isFunction` if appropriate.
      {
        _.isFunction = function(obj) {
          return typeof obj === 'function';
        };
      }

      // Is a given object a finite number?
      _.isFinite = function(obj) {
        return isFinite(obj) && !isNaN(parseFloat(obj));
      };

      // Is the given value `NaN`? (NaN is the only number which does not equal itself).
      _.isNaN = function(obj) {
        return _.isNumber(obj) && obj != +obj;
      };

      // Is a given value a boolean?
      _.isBoolean = function(obj) {
        return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
      };

      // Is a given value equal to null?
      _.isNull = function(obj) {
        return obj === null;
      };

      // Is a given variable undefined?
      _.isUndefined = function(obj) {
        return obj === void 0;
      };

      // Shortcut function for checking if an object has a given property directly
      // on itself (in other words, not on a prototype).
      _.has = function(obj, key) {
        return hasOwnProperty.call(obj, key);
      };

      // Utility Functions
      // -----------------

      // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
      // previous owner. Returns a reference to the Underscore object.
      _.noConflict = function() {
        root._ = previousUnderscore;
        return this;
      };

      // Keep the identity function around for default iterators.
      _.identity = function(value) {
        return value;
      };

      // Run a function **n** times.
      _.times = function(n, iterator, context) {
        var accum = Array(n);
        for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
        return accum;
      };

      // Return a random integer between min and max (inclusive).
      _.random = function(min, max) {
        if (max == null) {
          max = min;
          min = 0;
        }
        return min + Math.floor(Math.random() * (max - min + 1));
      };

      // List of HTML entities for escaping.
      var entityMap = {
        escape: {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '/': '&#x2F;'
        }
      };
      entityMap.unescape = _.invert(entityMap.escape);

      // Regexes containing the keys and values listed immediately above.
      var entityRegexes = {
        escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
        unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
      };

      // Functions for escaping and unescaping strings to/from HTML interpolation.
      _.each(['escape', 'unescape'], function(method) {
        _[method] = function(string) {
          if (string == null) return '';
          return ('' + string).replace(entityRegexes[method], function(match) {
            return entityMap[method][match];
          });
        };
      });

      // If the value of the named property is a function then invoke it;
      // otherwise, return it.
      _.result = function(object, property) {
        if (object == null) return null;
        var value = object[property];
        return _.isFunction(value) ? value.call(object) : value;
      };

      // Add your own custom functions to the Underscore object.
      _.mixin = function(obj) {
        each(_.functions(obj), function(name){
          var func = _[name] = obj[name];
          _.prototype[name] = function() {
            var args = [this._wrapped];
            push.apply(args, arguments);
            return result.call(this, func.apply(_, args));
          };
        });
      };

      // Generate a unique integer id (unique within the entire client session).
      // Useful for temporary DOM ids.
      var idCounter = 0;
      _.uniqueId = function(prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
      };

      // By default, Underscore uses ERB-style template delimiters, change the
      // following template settings to use alternative delimiters.
      _.templateSettings = {
        evaluate    : /<%([\s\S]+?)%>/g,
        interpolate : /<%=([\s\S]+?)%>/g,
        escape      : /<%-([\s\S]+?)%>/g
      };

      // When customizing `templateSettings`, if you don't want to define an
      // interpolation, evaluation or escaping regex, we need one that is
      // guaranteed not to match.
      var noMatch = /(.)^/;

      // Certain characters need to be escaped so that they can be put into a
      // string literal.
      var escapes = {
        "'":      "'",
        '\\':     '\\',
        '\r':     'r',
        '\n':     'n',
        '\t':     't',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
      };

      var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

      // JavaScript micro-templating, similar to John Resig's implementation.
      // Underscore templating handles arbitrary delimiters, preserves whitespace,
      // and correctly escapes quotes within interpolated code.
      _.template = function(text, data, settings) {
        var render;
        settings = _.defaults({}, settings, _.templateSettings);

        // Combine delimiters into one regular expression via alternation.
        var matcher = new RegExp([
          (settings.escape || noMatch).source,
          (settings.interpolate || noMatch).source,
          (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g');

        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
          source += text.slice(index, offset)
            .replace(escaper, function(match) { return '\\' + escapes[match]; });

          if (escape) {
            source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
          }
          if (interpolate) {
            source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
          }
          if (evaluate) {
            source += "';\n" + evaluate + "\n__p+='";
          }
          index = offset + match.length;
          return match;
        });
        source += "';\n";

        // If a variable is not specified, place data values in local scope.
        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

        source = "var __t,__p='',__j=Array.prototype.join," +
          "print=function(){__p+=__j.call(arguments,'');};\n" +
          source + "return __p;\n";

        try {
          render = new Function(settings.variable || 'obj', '_', source);
        } catch (e) {
          e.source = source;
          throw e;
        }

        if (data) return render(data, _);
        var template = function(data) {
          return render.call(this, data, _);
        };

        // Provide the compiled function source as a convenience for precompilation.
        template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

        return template;
      };

      // Add a "chain" function, which will delegate to the wrapper.
      _.chain = function(obj) {
        return _(obj).chain();
      };

      // OOP
      // ---------------
      // If Underscore is called as a function, it returns a wrapped object that
      // can be used OO-style. This wrapper holds altered versions of all the
      // underscore functions. Wrapped objects may be chained.

      // Helper function to continue chaining intermediate results.
      var result = function(obj) {
        return this._chain ? _(obj).chain() : obj;
      };

      // Add all of the Underscore functions to the wrapper object.
      _.mixin(_);

      // Add all mutator Array functions to the wrapper.
      each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
        var method = ArrayProto[name];
        _.prototype[name] = function() {
          var obj = this._wrapped;
          method.apply(obj, arguments);
          if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
          return result.call(this, obj);
        };
      });

      // Add all accessor Array functions to the wrapper.
      each(['concat', 'join', 'slice'], function(name) {
        var method = ArrayProto[name];
        _.prototype[name] = function() {
          return result.call(this, method.apply(this._wrapped, arguments));
        };
      });

      _.extend(_.prototype, {

        // Start chaining a wrapped Underscore object.
        chain: function() {
          this._chain = true;
          return this;
        },

        // Extracts the result from a wrapped and chained object.
        value: function() {
          return this._wrapped;
        }

      });

    }).call(commonjsGlobal);
    });
    var underscore_1 = underscore._;

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */
    /** @type {?} */
    var attachPrincipalPolicy = gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n    mutation AttachPrincipalPolicy($policyName: String!, $principal: String!) {\n        attachPrincipalPolicy(policyName: $policyName, principal: $principal)\n    }\n"], ["\n    mutation AttachPrincipalPolicy($policyName: String!, $principal: String!) {\n        attachPrincipalPolicy(policyName: $policyName, principal: $principal)\n    }\n"])));
    /** @type {?} */
    var getThingShadow = gql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n    query GetThingShadow($params: AWSJSON!) {\n        getThingShadow(params: $params) {\n            payload\n        }\n    }\n"], ["\n    query GetThingShadow($params: AWSJSON!) {\n        getThingShadow(params: $params) {\n            payload\n        }\n    }\n"])));
    /** @type {?} */
    var updateThingShadow = gql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n    mutation UpdateThingShadow($params: AWSJSON!) {\n        updateThingShadow(params: $params) {\n            payload\n        }\n    }\n"], ["\n    mutation UpdateThingShadow($params: AWSJSON!) {\n        updateThingShadow(params: $params) {\n            payload\n        }\n    }\n"])));
    var AWSIoTService = /** @class */ (function () {
        function AWSIoTService(amplifyService) {
            this.amplifyService = amplifyService;
            this.connectionSubject = new Subject();
            this.connectionObservable$ = this.connectionSubject.asObservable();
            this.isConnected = false;
        }
        /**
         * @return {?}
         */
        AWSIoTService.prototype.connect = /**
         * @return {?}
         */
        function () {
            var _this = this;
            this.amplifyService
                .auth()
                .currentCredentials()
                .then(function (credentials) {
                /** @type {?} */
                var promise = _this.amplifyService.api().graphql({
                    query: attachPrincipalPolicy.loc.source.body,
                    variables: {
                        policyName: appVariables.IOT_COGNITO_POLICY,
                        principal: credentials.identityId
                    }
                });
                return promise.then(function (result) {
                    result = result.data.attachPrincipalPolicy;
                    if (result === true) {
                        Amplify.addPluggable(new Providers.AWSIoTProvider({
                            aws_pubsub_region: appVariables.REGION,
                            aws_pubsub_endpoint: 'wss://' + appVariables.IOT_ENDPOINT + '/mqtt'
                        }));
                    }
                    return result;
                });
            })
                .then(function (result) {
                console.log('Connected to AWS IoT', result);
                _this.isConnected = true;
                _this.connectionSubject.next(_this.isConnected);
            })
                .catch(function (err) {
                console.error('Error while trying to connect to AWS IoT:', err);
                _this.isConnected = false;
                _this.connectionSubject.next(_this.isConnected);
            });
        };
        /**
         * @param {?} topic
         * @param {?} onMessage
         * @param {?} onError
         * @return {?}
         */
        AWSIoTService.prototype.subscribe = /**
         * @param {?} topic
         * @param {?} onMessage
         * @param {?} onError
         * @return {?}
         */
        function (topic, onMessage, onError) {
            return this.amplifyService
                .pubsub()
                .subscribe(topic)
                .subscribe(function (data) { return onMessage(data); }, function (error) { return onError(error); }, function () {
                console.log('Subscription to', topic, 'done.');
            });
        };
        /**
         * @param {?} params
         * @return {?}
         */
        AWSIoTService.prototype.getThingShadow = /**
         * @param {?} params
         * @return {?}
         */
        function (params) {
            /** @type {?} */
            var promise = this.amplifyService.api().graphql({
                query: getThingShadow.loc.source.body,
                variables: {
                    params: JSON.stringify(params)
                }
            });
            return promise.then(function (result) { return JSON.parse(result.data.getThingShadow.payload); });
        };
        /**
         * @param {?} params
         * @return {?}
         */
        AWSIoTService.prototype.updateThingShadow = /**
         * @param {?} params
         * @return {?}
         */
        function (params) {
            /** @type {?} */
            var promise = this.amplifyService.api().graphql({
                query: updateThingShadow.loc.source.body,
                variables: {
                    params: JSON.stringify(params)
                }
            });
            return promise.then(function (result) { return JSON.parse(result.data.updateThingShadow.payload); });
        };
        AWSIoTService.decorators = [
            { type: core.Injectable }
        ];
        /** @nocollapse */
        AWSIoTService.ctorParameters = function () { return [
            { type: awsAmplifyAngular.AmplifyService }
        ]; };
        return AWSIoTService;
    }());
    var templateObject_1, templateObject_2, templateObject_3;
    var AWSIoTComponent = /** @class */ (function () {
        function AWSIoTComponent(_iotService) {
            this._iotService = _iotService;
            this.subscriptions = new Subscription();
            this.desired = {};
            this.reported = {};
        }
        /**
         * @return {?}
         */
        AWSIoTComponent.prototype.ngOnDestroy = /**
         * @return {?}
         */
        function () {
            console.log('Unsubscribing to topics');
            this.subscriptions.unsubscribe();
        };
        /**
         * @param {?} iotSubscriptions
         * @return {?}
         */
        AWSIoTComponent.prototype.subscribe = /**
         * @param {?} iotSubscriptions
         * @return {?}
         */
        function (iotSubscriptions) {
            var _this = this;
            this.iotSubscriptions = iotSubscriptions;
            this._iotService.connectionObservable$.subscribe(function (connected) {
                console.log('Change of connection state: setting subscriptions', connected);
                _this.setSubscriptions();
            });
            this.setSubscriptions();
        };
        /**
         * @return {?}
         */
        AWSIoTComponent.prototype.setSubscriptions = /**
         * @return {?}
         */
        function () {
            var _this = this;
            if (this._iotService.isConnected) {
                this.iotSubscriptions.forEach(function (sub) {
                    console.log('Subscribing to topic:', sub.topic);
                    _this.subscriptions.add(_this._iotService.subscribe(sub.topic, sub.onMessage, sub.onError));
                });
            }
            else {
                console.log('Not connected to AWS IoT: Cant subscribe');
            }
        };
        /**
         * @param {?} incoming
         * @param {?=} shadowField
         * @return {?}
         */
        AWSIoTComponent.prototype.updateIncomingShadow = /**
         * @param {?} incoming
         * @param {?=} shadowField
         * @return {?}
         */
        function (incoming, shadowField) {
            if (shadowField === void 0) { shadowField = null; }
            if (incoming.hasOwnProperty('state') && incoming.state.hasOwnProperty('reported')) {
                if (shadowField !== null && incoming.state.reported.hasOwnProperty(shadowField)) {
                    underscore_1.extend(this.reported, incoming.state.reported[shadowField]);
                    // this.reported = incoming.state.reported[shadowField];
                }
                else {
                    underscore_1.extend(this.reported, incoming.state.reported);
                    // this.reported = incoming.state.reported;
                }
            }
            if (incoming.hasOwnProperty('state') && incoming.state.hasOwnProperty('desired')) {
                if (shadowField !== null && incoming.state.desired.hasOwnProperty(shadowField)) {
                    underscore_1.extend(this.desired, incoming.state.desired[shadowField]);
                    // this.desired = incoming.state.desired[shadowField];
                }
                else {
                    underscore_1.extend(this.desired, incoming.state.desired);
                    // this.desired = incoming.state.desired;
                }
            }
        };
        /**
         * @param {?} thingName
         * @param {?=} shadowField
         * @return {?}
         */
        AWSIoTComponent.prototype.getLastState = /**
         * @param {?} thingName
         * @param {?=} shadowField
         * @return {?}
         */
        function (thingName, shadowField) {
            var _this = this;
            if (shadowField === void 0) { shadowField = null; }
            return this._iotService
                .getThingShadow({
                thingName: thingName
            })
                .then(function (result) {
                _this.updateIncomingShadow(result, shadowField);
                return result;
            })
                .catch(function (err) {
                console.error(err);
                throw err;
            });
        };
        /**
         * @param {?} thingName
         * @param {?} desiredState
         * @return {?}
         */
        AWSIoTComponent.prototype.updateDesiredShadow = /**
         * @param {?} thingName
         * @param {?} desiredState
         * @return {?}
         */
        function (thingName, desiredState) {
            return this._iotService.updateThingShadow({
                thingName: thingName,
                payload: JSON.stringify({
                    state: {
                        desired: desiredState
                    }
                })
            });
        };
        AWSIoTComponent.decorators = [
            { type: core.Component, args: [{
                        selector: 'aws-iot-component',
                        template: ''
                    }] }
        ];
        /** @nocollapse */
        AWSIoTComponent.ctorParameters = function () { return [
            { type: AWSIoTService }
        ]; };
        return AWSIoTComponent;
    }());

    let SputnikSampleAddonComponent = class SputnikSampleAddonComponent extends AWSIoTComponent {
        constructor(awsIoTService) {
            super(awsIoTService);
            this.awsIoTService = awsIoTService;
        }
        ngOnInit() {
            this.subscribe([
                {
                    topic: 'test',
                    onMessage: data => {
                        // console.log('Data:', data.value);
                        // this.latestData = data.value;
                    },
                    onError: err => {
                        // console.error('Error:', err);
                    }
                }
            ]);
        }
    };
    SputnikSampleAddonComponent = __decorate([
        core.Component({
            selector: 'sputnik-sample-addon-component',
            template: `
        <h3>Hi, I am the Sample Addon component.</h3>
    `
        }),
        __metadata("design:paramtypes", [AWSIoTService])
    ], SputnikSampleAddonComponent);

    exports.SputnikSampleAddonModule = class SputnikSampleAddonModule {
    };
    exports.SputnikSampleAddonModule = __decorate([
        core.NgModule({
            imports: [common.CommonModule],
            declarations: [SputnikSampleAddonComponent],
            entryComponents: [SputnikSampleAddonComponent],
            providers: [
                {
                    provide: 'addons',
                    useValue: [
                        {
                            name: 'sputnik-sample-addon-component',
                            component: SputnikSampleAddonComponent
                        }
                    ],
                    multi: true
                }
            ]
        })
    ], exports.SputnikSampleAddonModule);

    Object.defineProperty(exports, '__esModule', { value: true });

}));
