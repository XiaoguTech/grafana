webpackHotUpdate(0,{

/***/ "./public/app/features/annotations/annotation_tooltip.ts":
/*!***************************************************************!*\
  !*** ./public/app/features/annotations/annotation_tooltip.ts ***!
  \***************************************************************/
/*! exports provided: annotationTooltipDirective */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "annotationTooltipDirective", function() { return annotationTooltipDirective; });
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var app_core_core_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! app/core/core_module */ "./public/app/core/core_module.ts");
/* harmony import */ var _alerting_alert_def__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../alerting/alert_def */ "./public/app/features/alerting/alert_def.ts");




/** @ngInject **/
function annotationTooltipDirective($sanitize, dashboardSrv, contextSrv, $compile) {
    function sanitizeString(str) {
        try {
            return $sanitize(str);
        }
        catch (err) {
            console.log('Could not sanitize annotation string, html escaping instead');
            return lodash__WEBPACK_IMPORTED_MODULE_0___default.a.escape(str);
        }
    }
    return {
        restrict: 'E',
        scope: {
            event: '=',
            onEdit: '&',
        },
        link: function (scope, element) {
            var event = scope.event;
            var title = event.title;
            var text = event.text;
            var dashboard = dashboardSrv.getCurrent();
            var tooltip = '<div class="graph-annotation">';
            var titleStateClass = '';
            if (event.alertId) {
                var stateModel = _alerting_alert_def__WEBPACK_IMPORTED_MODULE_3__["default"].getStateDisplayModel(event.newState);
                titleStateClass = stateModel.stateClass;
                title = "<i class=\"icon-gf " + stateModel.iconClass + "\"></i> " + stateModel.text;
                text = _alerting_alert_def__WEBPACK_IMPORTED_MODULE_3__["default"].getAlertAnnotationInfo(event);
                if (event.text) {
                    text = text + '<br />' + event.text;
                }
            }
            else if (title) {
                text = title + '<br />' + (lodash__WEBPACK_IMPORTED_MODULE_0___default.a.isString(text) ? text : '');
                title = '';
            }
            var header = "<div class=\"graph-annotation__header\">";
            if (event.login) {
                header += "<div class=\"graph-annotation__user\" bs-tooltip=\"'Created by " + event.login + "'\"><img src=\"" + event.avatarUrl + "\" /></div>";
            }
            header += "\n          <span class=\"graph-annotation__title " + titleStateClass + "\">" + sanitizeString(title) + "</span>\n          <span class=\"graph-annotation__time\">" + dashboard.formatDate(event.min) + "</span>\n      ";
            // Show edit icon only for users with at least Editor role
            if (event.id && dashboard.meta.canEdit) {
                header += "\n          <span class=\"pointer graph-annotation__edit-icon\" ng-click=\"onEdit()\">\n            <i class=\"fa fa-pencil-square\"></i>\n          </span>\n        ";
            }
            header += "</div>";
            tooltip += header;
            tooltip += '<div class="graph-annotation__body">';
            if (text) {
                tooltip += '<div>' + sanitizeString(text.replace(/\n/g, '<br>')) + '</div>';
            }
            var tags = event.tags;
            if (tags && tags.length) {
                scope.tags = tags;
                tooltip +=
                    '<span class="label label-tag small" ng-repeat="tag in tags" tag-color-from-name="tag">{{tag}}</span><br/>';
            }
            tooltip += '</div>';
            tooltip += '</div>';
            var $tooltip = jquery__WEBPACK_IMPORTED_MODULE_1___default()(tooltip);
            $tooltip.appendTo(element);
            $compile(element.contents())(scope);
        },
    };
}
app_core_core_module__WEBPACK_IMPORTED_MODULE_2__["default"].directive('annotationTooltip', annotationTooltipDirective);


/***/ }),

/***/ "./public/app/features/annotations/editor_ctrl.ts":
/*!********************************************************!*\
  !*** ./public/app/features/annotations/editor_ctrl.ts ***!
  \********************************************************/
/*! exports provided: AnnotationsEditorCtrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AnnotationsEditorCtrl", function() { return AnnotationsEditorCtrl; });
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! angular */ "./node_modules/angular/index.js");
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(angular__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var app_core_core_module__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! app/core/core_module */ "./public/app/core/core_module.ts");




var AnnotationsEditorCtrl = /** @class */ (function () {
    /** @ngInject */
    function AnnotationsEditorCtrl($scope, datasourceSrv) {
        this.datasourceSrv = datasourceSrv;
        this.annotationDefaults = {
            name: '',
            datasource: null,
            iconColor: 'rgba(255, 96, 96, 1)',
            enable: true,
            showIn: 0,
            hide: false,
        };
        this.showOptions = [{ text: 'All Panels', value: 0 }, { text: 'Specific Panels', value: 1 }];
        $scope.ctrl = this;
        this.mode = 'list';
        this.datasources = datasourceSrv.getAnnotationSources();
        this.annotations = $scope.dashboard.annotations.list;
        this.reset();
        this.onColorChange = this.onColorChange.bind(this);
    }
    AnnotationsEditorCtrl.prototype.datasourceChanged = function () {
        var _this = this;
        return this.datasourceSrv.get(this.currentAnnotation.datasource).then(function (ds) {
            _this.currentDatasource = ds;
        });
    };
    AnnotationsEditorCtrl.prototype.edit = function (annotation) {
        this.currentAnnotation = annotation;
        this.currentAnnotation.showIn = this.currentAnnotation.showIn || 0;
        this.currentIsNew = false;
        this.datasourceChanged();
        this.mode = 'edit';
        jquery__WEBPACK_IMPORTED_MODULE_2___default()('.tooltip.in').remove();
    };
    AnnotationsEditorCtrl.prototype.reset = function () {
        this.currentAnnotation = angular__WEBPACK_IMPORTED_MODULE_0___default.a.copy(this.annotationDefaults);
        this.currentAnnotation.datasource = this.datasources[0].name;
        this.currentIsNew = true;
        this.datasourceChanged();
    };
    AnnotationsEditorCtrl.prototype.update = function () {
        this.reset();
        this.mode = 'list';
    };
    AnnotationsEditorCtrl.prototype.setupNew = function () {
        this.mode = 'new';
        this.reset();
    };
    AnnotationsEditorCtrl.prototype.backToList = function () {
        this.mode = 'list';
    };
    AnnotationsEditorCtrl.prototype.move = function (index, dir) {
        lodash__WEBPACK_IMPORTED_MODULE_1___default.a.move(this.annotations, index, index + dir);
    };
    AnnotationsEditorCtrl.prototype.add = function () {
        this.annotations.push(this.currentAnnotation);
        this.reset();
        this.mode = 'list';
    };
    AnnotationsEditorCtrl.prototype.removeAnnotation = function (annotation) {
        var index = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.indexOf(this.annotations, annotation);
        this.annotations.splice(index, 1);
    };
    AnnotationsEditorCtrl.prototype.onColorChange = function (newColor) {
        this.currentAnnotation.iconColor = newColor;
    };
    return AnnotationsEditorCtrl;
}());

app_core_core_module__WEBPACK_IMPORTED_MODULE_3__["default"].controller('AnnotationsEditorCtrl', AnnotationsEditorCtrl);


/***/ }),

/***/ "./public/app/features/dashboard/dashboard_loader_srv.ts":
/*!***************************************************************!*\
  !*** ./public/app/features/dashboard/dashboard_loader_srv.ts ***!
  \***************************************************************/
/*! exports provided: DashboardLoaderSrv */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DashboardLoaderSrv", function() { return DashboardLoaderSrv; });
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! angular */ "./node_modules/angular/index.js");
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(angular__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! moment */ "./node_modules/moment/moment.js");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! app/core/utils/kbn */ "./public/app/core/utils/kbn.ts");
/* harmony import */ var app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! app/core/utils/datemath */ "./public/app/core/utils/datemath.ts");
/* harmony import */ var app_core_services_impression_srv__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! app/core/services/impression_srv */ "./public/app/core/services/impression_srv.ts");







var DashboardLoaderSrv = /** @class */ (function () {
    /** @ngInject */
    function DashboardLoaderSrv(backendSrv, dashboardSrv, datasourceSrv, $http, $q, $timeout, contextSrv, $routeParams, $rootScope) {
        this.backendSrv = backendSrv;
        this.dashboardSrv = dashboardSrv;
        this.datasourceSrv = datasourceSrv;
        this.$http = $http;
        this.$q = $q;
        this.$timeout = $timeout;
        this.$routeParams = $routeParams;
        this.$rootScope = $rootScope;
    }
    DashboardLoaderSrv.prototype._dashboardLoadFailed = function (title, snapshot) {
        snapshot = snapshot || false;
        return {
            meta: {
                canStar: false,
                isSnapshot: snapshot,
                canDelete: false,
                canSave: false,
                canEdit: false,
                dashboardNotFound: true,
            },
            dashboard: { title: title },
        };
    };
    DashboardLoaderSrv.prototype.loadDashboard = function (type, slug, uid) {
        var _this = this;
        var promise;
        if (type === 'script') {
            promise = this._loadScriptedDashboard(slug);
        }
        else if (type === 'snapshot') {
            promise = this.backendSrv.get('/api/snapshots/' + slug).catch(function () {
                return _this._dashboardLoadFailed('Snapshot not found', true);
            });
        }
        else {
            promise = this.backendSrv
                .getDashboardByUid(uid)
                .then(function (result) {
                if (result.meta.isFolder) {
                    _this.$rootScope.appEvent('alert-error', ['Dashboard not found']);
                    throw new Error('Dashboard not found');
                }
                return result;
            })
                .catch(function () {
                return _this._dashboardLoadFailed('Not found', true);
            });
        }
        promise.then(function (result) {
            if (result.meta.dashboardNotFound !== true) {
                app_core_services_impression_srv__WEBPACK_IMPORTED_MODULE_6__["default"].addDashboardImpression(result.dashboard.id);
            }
            return result;
        });
        return promise;
    };
    DashboardLoaderSrv.prototype._loadScriptedDashboard = function (file) {
        var _this = this;
        var url = 'public/dashboards/' + file.replace(/\.(?!js)/, '/') + '?' + new Date().getTime();
        return this.$http({ url: url, method: 'GET' })
            .then(this._executeScript.bind(this))
            .then(function (result) {
            return {
                meta: {
                    fromScript: true,
                    canDelete: false,
                    canSave: false,
                    canStar: false,
                },
                dashboard: result.data,
            };
        }, function (err) {
            console.log('Script dashboard error ' + err);
            _this.$rootScope.appEvent('alert-error', [
                'Script Error',
                'Please make sure it exists and returns a valid dashboard',
            ]);
            return _this._dashboardLoadFailed('Scripted dashboard');
        });
    };
    DashboardLoaderSrv.prototype._executeScript = function (result) {
        var _this = this;
        var services = {
            dashboardSrv: this.dashboardSrv,
            datasourceSrv: this.datasourceSrv,
            $q: this.$q,
        };
        /*jshint -W054 */
        var script_func = new Function('ARGS', 'kbn', 'dateMath', '_', 'moment', 'window', 'document', '$', 'jQuery', 'services', result.data);
        var script_result = script_func(this.$routeParams, app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_4__["default"], app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_5__, lodash__WEBPACK_IMPORTED_MODULE_2___default.a, moment__WEBPACK_IMPORTED_MODULE_1___default.a, window, document, jquery__WEBPACK_IMPORTED_MODULE_3___default.a, jquery__WEBPACK_IMPORTED_MODULE_3___default.a, services);
        // Handle async dashboard scripts
        if (lodash__WEBPACK_IMPORTED_MODULE_2___default.a.isFunction(script_result)) {
            var deferred = this.$q.defer();
            script_result(function (dashboard) {
                _this.$timeout(function () {
                    deferred.resolve({ data: dashboard });
                });
            });
            return deferred.promise;
        }
        return { data: script_result };
    };
    return DashboardLoaderSrv;
}());

angular__WEBPACK_IMPORTED_MODULE_0___default.a.module('grafana.services').service('dashboardLoaderSrv', DashboardLoaderSrv);


/***/ }),

/***/ "./public/app/features/dashboard/settings/settings.ts":
/*!************************************************************!*\
  !*** ./public/app/features/dashboard/settings/settings.ts ***!
  \************************************************************/
/*! exports provided: SettingsCtrl, dashboardSettings */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SettingsCtrl", function() { return SettingsCtrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dashboardSettings", function() { return dashboardSettings; });
/* harmony import */ var app_core_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! app/core/core */ "./public/app/core/core.ts");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! angular */ "./node_modules/angular/index.js");
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(angular__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var app_core_config__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! app/core/config */ "./public/app/core/config.ts");





var SettingsCtrl = /** @class */ (function () {
    /** @ngInject */
    function SettingsCtrl($scope, $route, $location, $rootScope, backendSrv, dashboardSrv) {
        var _this = this;
        this.$scope = $scope;
        this.$route = $route;
        this.$location = $location;
        this.$rootScope = $rootScope;
        this.backendSrv = backendSrv;
        this.dashboardSrv = dashboardSrv;
        // temp hack for annotations and variables editors
        // that rely on inherited scope
        $scope.dashboard = this.dashboard;
        this.$scope.$on('$destroy', function () {
            _this.dashboard.updateSubmenuVisibility();
            _this.$rootScope.$broadcast('refresh');
            setTimeout(function () {
                _this.$rootScope.appEvent('dash-scroll', { restore: true });
            });
        });
        this.canSaveAs = this.dashboard.meta.canEdit && app_core_core__WEBPACK_IMPORTED_MODULE_0__["contextSrv"].hasEditPermissionInFolders;
        this.canSave = this.dashboard.meta.canSave;
        this.canDelete = this.dashboard.meta.canSave;
        this.buildSectionList();
        this.onRouteUpdated();
        this.$rootScope.onAppEvent('$routeUpdate', this.onRouteUpdated.bind(this), $scope);
        this.$rootScope.appEvent('dash-scroll', { animate: false, pos: 0 });
        this.$rootScope.onAppEvent('dashboard-saved', this.onPostSave.bind(this), $scope);
    }
    SettingsCtrl.prototype.buildSectionList = function () {
        this.sections = [];
        if (this.dashboard.meta.canEdit) {
            this.sections.push({
                title: 'General',
                id: 'settings',
                icon: 'gicon gicon-preferences',
            });
            this.sections.push({
                title: 'Annotations',
                id: 'annotations',
                icon: 'gicon gicon-annotation',
            });
            this.sections.push({
                title: 'Variables',
                id: 'templating',
                icon: 'gicon gicon-variable',
            });
            this.sections.push({
                title: 'Links',
                id: 'links',
                icon: 'gicon gicon-link',
            });
        }
        if (this.dashboard.id && this.dashboard.meta.canSave) {
            this.sections.push({
                title: 'Versions',
                id: 'versions',
                icon: 'fa fa-fw fa-history',
            });
        }
        if (this.dashboard.id && this.dashboard.meta.canAdmin) {
            this.sections.push({
                title: 'Permissions',
                id: 'permissions',
                icon: 'fa fa-fw fa-lock',
            });
        }
        if (this.dashboard.meta.canMakeEditable) {
            this.sections.push({
                title: 'General',
                icon: 'gicon gicon-preferences',
                id: 'make_editable',
            });
        }
        this.sections.push({
            title: 'JSON Model',
            id: 'dashboard_json',
            icon: 'gicon gicon-json',
        });
        var params = this.$location.search();
        var url = this.$location.path();
        for (var _i = 0, _a = this.sections; _i < _a.length; _i++) {
            var section = _a[_i];
            var sectionParams = lodash__WEBPACK_IMPORTED_MODULE_2___default.a.defaults({ editview: section.id }, params);
            section.url = app_core_config__WEBPACK_IMPORTED_MODULE_4__["default"].appSubUrl + url + '?' + jquery__WEBPACK_IMPORTED_MODULE_1___default.a.param(sectionParams);
        }
    };
    SettingsCtrl.prototype.onRouteUpdated = function () {
        this.viewId = this.$location.search().editview;
        if (this.viewId) {
            this.json = angular__WEBPACK_IMPORTED_MODULE_3___default.a.toJson(this.dashboard.getSaveModelClone(), true);
        }
        if (this.viewId === 'settings' && this.dashboard.meta.canMakeEditable) {
            this.viewId = 'make_editable';
        }
        var currentSection = lodash__WEBPACK_IMPORTED_MODULE_2___default.a.find(this.sections, { id: this.viewId });
        if (!currentSection) {
            this.sections.unshift({
                title: 'Not found',
                id: '404',
                icon: 'fa fa-fw fa-warning',
            });
            this.viewId = '404';
        }
    };
    SettingsCtrl.prototype.openSaveAsModal = function () {
        this.dashboardSrv.showSaveAsModal();
    };
    SettingsCtrl.prototype.saveDashboard = function () {
        this.dashboardSrv.saveDashboard();
    };
    SettingsCtrl.prototype.saveDashboardJson = function () {
        var _this = this;
        this.dashboardSrv.saveJSONDashboard(this.json).then(function () {
            _this.$route.reload();
        });
    };
    SettingsCtrl.prototype.onPostSave = function () {
        this.hasUnsavedFolderChange = false;
    };
    SettingsCtrl.prototype.hideSettings = function () {
        var _this = this;
        var urlParams = this.$location.search();
        delete urlParams.editview;
        setTimeout(function () {
            _this.$rootScope.$apply(function () {
                _this.$location.search(urlParams);
            });
        });
    };
    SettingsCtrl.prototype.makeEditable = function () {
        this.dashboard.editable = true;
        this.dashboard.meta.canMakeEditable = false;
        this.dashboard.meta.canEdit = true;
        this.dashboard.meta.canSave = true;
        this.canDelete = true;
        this.viewId = 'settings';
        this.buildSectionList();
        var currentSection = lodash__WEBPACK_IMPORTED_MODULE_2___default.a.find(this.sections, { id: this.viewId });
        this.$location.url(currentSection.url);
    };
    SettingsCtrl.prototype.deleteDashboard = function () {
        var _this = this;
        var confirmText = '';
        var text2 = this.dashboard.title;
        var alerts = lodash__WEBPACK_IMPORTED_MODULE_2___default.a.sumBy(this.dashboard.panels, function (panel) {
            return panel.alert ? 1 : 0;
        });
        if (alerts > 0) {
            confirmText = 'DELETE';
            text2 = "This dashboard contains " + alerts + " alerts. Deleting this dashboard will also delete those alerts";
        }
        app_core_core__WEBPACK_IMPORTED_MODULE_0__["appEvents"].emit('confirm-modal', {
            title: 'Delete',
            text: 'Do you want to delete this dashboard?',
            text2: text2,
            icon: 'fa-trash',
            confirmText: confirmText,
            yesText: 'Delete',
            onConfirm: function () {
                _this.dashboard.meta.canSave = false;
                _this.deleteDashboardConfirmed();
            },
        });
    };
    SettingsCtrl.prototype.deleteDashboardConfirmed = function () {
        var _this = this;
        this.backendSrv.deleteDashboard(this.dashboard.uid).then(function () {
            app_core_core__WEBPACK_IMPORTED_MODULE_0__["appEvents"].emit('alert-success', ['Dashboard Deleted', _this.dashboard.title + ' has been deleted']);
            _this.$location.url('/');
        });
    };
    SettingsCtrl.prototype.onFolderChange = function (folder) {
        this.dashboard.meta.folderId = folder.id;
        this.dashboard.meta.folderTitle = folder.title;
        this.hasUnsavedFolderChange = true;
    };
    SettingsCtrl.prototype.getFolder = function () {
        return {
            id: this.dashboard.meta.folderId,
            title: this.dashboard.meta.folderTitle,
            url: this.dashboard.meta.folderUrl,
        };
    };
    return SettingsCtrl;
}());

function dashboardSettings() {
    return {
        restrict: 'E',
        templateUrl: 'public/app/features/dashboard/settings/settings.html',
        controller: SettingsCtrl,
        bindToController: true,
        controllerAs: 'ctrl',
        transclude: true,
        scope: { dashboard: '=' },
    };
}
app_core_core__WEBPACK_IMPORTED_MODULE_0__["coreModule"].directive('dashboardSettings', dashboardSettings);


/***/ }),

/***/ "./public/app/features/panel/metrics_panel_ctrl.ts":
/*!*********************************************************!*\
  !*** ./public/app/features/panel/metrics_panel_ctrl.ts ***!
  \*********************************************************/
/*! exports provided: MetricsPanelCtrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MetricsPanelCtrl", function() { return MetricsPanelCtrl; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var app_core_config__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! app/core/config */ "./public/app/core/config.ts");
/* harmony import */ var app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! app/core/utils/kbn */ "./public/app/core/utils/kbn.ts");
/* harmony import */ var app_features_panel_panel_ctrl__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! app/features/panel/panel_ctrl */ "./public/app/features/panel/panel_ctrl.ts");
/* harmony import */ var app_core_utils_rangeutil__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! app/core/utils/rangeutil */ "./public/app/core/utils/rangeutil.ts");
/* harmony import */ var app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! app/core/utils/datemath */ "./public/app/core/utils/datemath.ts");
/* harmony import */ var app_core_utils_location_util__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! app/core/utils/location_util */ "./public/app/core/utils/location_util.ts");
/* harmony import */ var _metrics_tab__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./metrics_tab */ "./public/app/features/panel/metrics_tab.ts");










var MetricsPanelCtrl = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](MetricsPanelCtrl, _super);
    function MetricsPanelCtrl($scope, $injector) {
        var _this = _super.call(this, $scope, $injector) || this;
        // make metrics tab the default
        _this.editorTabIndex = 1;
        _this.$q = $injector.get('$q');
        _this.contextSrv = $injector.get('contextSrv');
        _this.datasourceSrv = $injector.get('datasourceSrv');
        _this.timeSrv = $injector.get('timeSrv');
        _this.templateSrv = $injector.get('templateSrv');
        _this.scope = $scope;
        _this.panel.datasource = _this.panel.datasource || null;
        if (!_this.panel.targets) {
            _this.panel.targets = [{}];
        }
        _this.events.on('refresh', _this.onMetricsPanelRefresh.bind(_this));
        _this.events.on('init-edit-mode', _this.onInitMetricsPanelEditMode.bind(_this));
        _this.events.on('panel-teardown', _this.onPanelTearDown.bind(_this));
        return _this;
    }
    MetricsPanelCtrl.prototype.onPanelTearDown = function () {
        if (this.dataSubscription) {
            this.dataSubscription.unsubscribe();
            this.dataSubscription = null;
        }
    };
    MetricsPanelCtrl.prototype.onInitMetricsPanelEditMode = function () {
        this.addEditorTab('Metrics', _metrics_tab__WEBPACK_IMPORTED_MODULE_9__["metricsTabDirective"]);
        this.addEditorTab('Time range', 'public/app/features/panel/partials/panelTime.html');
    };
    MetricsPanelCtrl.prototype.onMetricsPanelRefresh = function () {
        var _this = this;
        // ignore fetching data if another panel is in fullscreen
        if (this.otherPanelInFullscreenMode()) {
            return;
        }
        // if we have snapshot data use that
        if (this.panel.snapshotData) {
            this.updateTimeRange();
            var data = this.panel.snapshotData;
            // backward compatibility
            if (!lodash__WEBPACK_IMPORTED_MODULE_2___default.a.isArray(data)) {
                data = data.data;
            }
            // Defer panel rendering till the next digest cycle.
            // For some reason snapshot panels don't init at this time, so this helps to avoid rendering issues.
            return this.$timeout(function () {
                _this.events.emit('data-snapshot-load', data);
            });
        }
        // // ignore if we have data stream
        if (this.dataStream) {
            return;
        }
        // clear loading/error state
        delete this.error;
        this.loading = true;
        // load datasource service
        this.setTimeQueryStart();
        this.datasourceSrv
            .get(this.panel.datasource)
            .then(this.updateTimeRange.bind(this))
            .then(this.issueQueries.bind(this))
            .then(this.handleQueryResult.bind(this))
            .catch(function (err) {
            // if cancelled  keep loading set to true
            if (err.cancelled) {
                console.log('Panel request cancelled', err);
                return;
            }
            _this.loading = false;
            _this.error = err.message || 'Request Error';
            _this.inspector = { error: err };
            if (err.data) {
                if (err.data.message) {
                    _this.error = err.data.message;
                }
                if (err.data.error) {
                    _this.error = err.data.error;
                }
            }
            _this.events.emit('data-error', err);
            console.log('Panel data error:', err);
        });
    };
    MetricsPanelCtrl.prototype.setTimeQueryStart = function () {
        this.timing.queryStart = new Date().getTime();
    };
    MetricsPanelCtrl.prototype.setTimeQueryEnd = function () {
        this.timing.queryEnd = new Date().getTime();
    };
    MetricsPanelCtrl.prototype.updateTimeRange = function (datasource) {
        this.datasource = datasource || this.datasource;
        this.range = this.timeSrv.timeRange();
        this.applyPanelTimeOverrides();
        if (this.panel.maxDataPoints) {
            this.resolution = this.panel.maxDataPoints;
        }
        else {
            this.resolution = Math.ceil(jquery__WEBPACK_IMPORTED_MODULE_1___default()(window).width() * (this.panel.gridPos.w / 24));
        }
        this.calculateInterval();
        return this.datasource;
    };
    MetricsPanelCtrl.prototype.calculateInterval = function () {
        var intervalOverride = this.panel.interval;
        // if no panel interval check datasource
        if (intervalOverride) {
            intervalOverride = this.templateSrv.replace(intervalOverride, this.panel.scopedVars);
        }
        else if (this.datasource && this.datasource.interval) {
            intervalOverride = this.datasource.interval;
        }
        var res = app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_4__["default"].calculateInterval(this.range, this.resolution, intervalOverride);
        this.interval = res.interval;
        this.intervalMs = res.intervalMs;
    };
    MetricsPanelCtrl.prototype.applyPanelTimeOverrides = function () {
        this.timeInfo = '';
        // check panel time overrrides
        if (this.panel.timeFrom) {
            var timeFromInterpolated = this.templateSrv.replace(this.panel.timeFrom, this.panel.scopedVars);
            var timeFromInfo = app_core_utils_rangeutil__WEBPACK_IMPORTED_MODULE_6__["describeTextRange"](timeFromInterpolated);
            if (timeFromInfo.invalid) {
                this.timeInfo = 'invalid time override';
                return;
            }
            if (lodash__WEBPACK_IMPORTED_MODULE_2___default.a.isString(this.range.raw.from)) {
                var timeFromDate = app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_7__["parse"](timeFromInfo.from);
                this.timeInfo = timeFromInfo.display;
                this.range.from = timeFromDate;
                this.range.to = app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_7__["parse"](timeFromInfo.to);
                this.range.raw.from = timeFromInfo.from;
                this.range.raw.to = timeFromInfo.to;
            }
        }
        if (this.panel.timeShift) {
            var timeShiftInterpolated = this.templateSrv.replace(this.panel.timeShift, this.panel.scopedVars);
            var timeShiftInfo = app_core_utils_rangeutil__WEBPACK_IMPORTED_MODULE_6__["describeTextRange"](timeShiftInterpolated);
            if (timeShiftInfo.invalid) {
                this.timeInfo = 'invalid timeshift';
                return;
            }
            var timeShift = '-' + timeShiftInterpolated;
            this.timeInfo += ' timeshift ' + timeShift;
            this.range.from = app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_7__["parseDateMath"](timeShift, this.range.from, false);
            this.range.to = app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_7__["parseDateMath"](timeShift, this.range.to, true);
            this.range.raw = { from: this.range.from, to: this.range.to };
        }
        if (this.panel.hideTimeOverride) {
            this.timeInfo = '';
        }
    };
    MetricsPanelCtrl.prototype.issueQueries = function (datasource) {
        this.datasource = datasource;
        if (!this.panel.targets || this.panel.targets.length === 0) {
            return this.$q.when([]);
        }
        // make shallow copy of scoped vars,
        // and add built in variables interval and interval_ms
        var scopedVars = Object.assign({}, this.panel.scopedVars, {
            __interval: { text: this.interval, value: this.interval },
            __interval_ms: { text: this.intervalMs, value: this.intervalMs },
        });
        var metricsQuery = {
            timezone: this.dashboard.getTimezone(),
            panelId: this.panel.id,
            dashboardId: this.dashboard.id,
            range: this.range,
            rangeRaw: this.range.raw,
            interval: this.interval,
            intervalMs: this.intervalMs,
            targets: this.panel.targets,
            maxDataPoints: this.resolution,
            scopedVars: scopedVars,
            cacheTimeout: this.panel.cacheTimeout,
        };
        return datasource.query(metricsQuery);
    };
    MetricsPanelCtrl.prototype.handleQueryResult = function (result) {
        this.setTimeQueryEnd();
        this.loading = false;
        // check for if data source returns subject
        if (result && result.subscribe) {
            this.handleDataStream(result);
            return;
        }
        if (this.dashboard.snapshot) {
            this.panel.snapshotData = result.data;
        }
        if (!result || !result.data) {
            console.log('Data source query result invalid, missing data field:', result);
            result = { data: [] };
        }
        this.events.emit('data-received', result.data);
    };
    MetricsPanelCtrl.prototype.handleDataStream = function (stream) {
        var _this = this;
        // if we already have a connection
        if (this.dataStream) {
            console.log('two stream observables!');
            return;
        }
        this.dataStream = stream;
        this.dataSubscription = stream.subscribe({
            next: function (data) {
                console.log('dataSubject next!');
                if (data.range) {
                    _this.range = data.range;
                }
                _this.events.emit('data-received', data.data);
            },
            error: function (error) {
                _this.events.emit('data-error', error);
                console.log('panel: observer got error');
            },
            complete: function () {
                console.log('panel: observer got complete');
                _this.dataStream = null;
            },
        });
    };
    MetricsPanelCtrl.prototype.setDatasource = function (datasource) {
        var _this = this;
        // switching to mixed
        if (datasource.meta.mixed) {
            lodash__WEBPACK_IMPORTED_MODULE_2___default.a.each(this.panel.targets, function (target) {
                target.datasource = _this.panel.datasource;
                if (!target.datasource) {
                    target.datasource = app_core_config__WEBPACK_IMPORTED_MODULE_3__["default"].defaultDatasource;
                }
            });
        }
        else if (this.datasource && this.datasource.meta.mixed) {
            lodash__WEBPACK_IMPORTED_MODULE_2___default.a.each(this.panel.targets, function (target) {
                delete target.datasource;
            });
        }
        this.panel.datasource = datasource.value;
        this.datasourceName = datasource.name;
        this.datasource = null;
        this.refresh();
    };
    MetricsPanelCtrl.prototype.getAdditionalMenuItems = function () {
        var items = [];
        if (app_core_config__WEBPACK_IMPORTED_MODULE_3__["default"].exploreEnabled && this.contextSrv.isEditor && this.datasource && this.datasource.supportsExplore) {
            items.push({
                text: 'Explore',
                click: 'ctrl.explore();',
                icon: 'fa fa-fw fa-rocket',
                shortcut: 'x',
            });
        }
        return items;
    };
    MetricsPanelCtrl.prototype.explore = function () {
        var range = this.timeSrv.timeRangeForUrl();
        var state = tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, this.datasource.getExploreState(this.panel), { range: range });
        var exploreState = Object(app_core_utils_location_util__WEBPACK_IMPORTED_MODULE_8__["encodePathComponent"])(JSON.stringify(state));
        this.$location.url("/explore?state=" + exploreState);
    };
    MetricsPanelCtrl.prototype.addQuery = function (target) {
        target.refId = this.dashboard.getNextQueryLetter(this.panel);
        this.panel.targets.push(target);
        this.nextRefId = this.dashboard.getNextQueryLetter(this.panel);
    };
    MetricsPanelCtrl.prototype.removeQuery = function (target) {
        var index = lodash__WEBPACK_IMPORTED_MODULE_2___default.a.indexOf(this.panel.targets, target);
        this.panel.targets.splice(index, 1);
        this.nextRefId = this.dashboard.getNextQueryLetter(this.panel);
        this.refresh();
    };
    MetricsPanelCtrl.prototype.moveQuery = function (target, direction) {
        var index = lodash__WEBPACK_IMPORTED_MODULE_2___default.a.indexOf(this.panel.targets, target);
        lodash__WEBPACK_IMPORTED_MODULE_2___default.a.move(this.panel.targets, index, index + direction);
    };
    return MetricsPanelCtrl;
}(app_features_panel_panel_ctrl__WEBPACK_IMPORTED_MODULE_5__["PanelCtrl"]));



/***/ }),

/***/ "./public/app/features/panel/panel_ctrl.ts":
/*!*************************************************!*\
  !*** ./public/app/features/panel/panel_ctrl.ts ***!
  \*************************************************/
/*! exports provided: PanelCtrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PanelCtrl", function() { return PanelCtrl; });
/* harmony import */ var app_core_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! app/core/config */ "./public/app/core/config.ts");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var app_core_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! app/core/core */ "./public/app/core/core.ts");
/* harmony import */ var app_features_dashboard_panel_model__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! app/features/dashboard/panel_model */ "./public/app/features/dashboard/panel_model.ts");
/* harmony import */ var remarkable__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! remarkable */ "./node_modules/remarkable/index.js");
/* harmony import */ var remarkable__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(remarkable__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var app_core_constants__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! app/core/constants */ "./public/app/core/constants.ts");
/* harmony import */ var app_core_store__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! app/core/store */ "./public/app/core/store.ts");








var TITLE_HEIGHT = 27;
var PANEL_BORDER = 2;
var PanelCtrl = /** @class */ (function () {
    function PanelCtrl($scope, $injector) {
        var _this = this;
        this.$injector = $injector;
        this.$location = $injector.get('$location');
        this.$scope = $scope;
        this.$timeout = $injector.get('$timeout');
        this.editorTabIndex = 0;
        this.events = this.panel.events;
        this.timing = {};
        var plugin = app_core_config__WEBPACK_IMPORTED_MODULE_0__["default"].panels[this.panel.type];
        if (plugin) {
            this.pluginId = plugin.id;
            this.pluginName = plugin.name;
        }
        $scope.$on('refresh', function () { return _this.refresh(); });
        $scope.$on('component-did-mount', function () { return _this.panelDidMount(); });
        $scope.$on('$destroy', function () {
            _this.events.emit('panel-teardown');
            _this.events.removeAllListeners();
        });
    }
    PanelCtrl.prototype.init = function () {
        this.events.emit('panel-initialized');
        this.publishAppEvent('panel-initialized', { scope: this.$scope });
    };
    PanelCtrl.prototype.panelDidMount = function () {
        this.events.emit('component-did-mount');
    };
    PanelCtrl.prototype.renderingCompleted = function () {
        app_core_core__WEBPACK_IMPORTED_MODULE_3__["profiler"].renderingCompleted(this.panel.id, this.timing);
    };
    PanelCtrl.prototype.refresh = function () {
        this.events.emit('refresh', null);
    };
    PanelCtrl.prototype.publishAppEvent = function (evtName, evt) {
        this.$scope.$root.appEvent(evtName, evt);
    };
    PanelCtrl.prototype.changeView = function (fullscreen, edit) {
        this.publishAppEvent('panel-change-view', {
            fullscreen: fullscreen,
            edit: edit,
            panelId: this.panel.id,
        });
    };
    PanelCtrl.prototype.viewPanel = function () {
        this.changeView(true, false);
    };
    PanelCtrl.prototype.editPanel = function () {
        this.changeView(true, true);
    };
    PanelCtrl.prototype.exitFullscreen = function () {
        this.changeView(false, false);
    };
    PanelCtrl.prototype.initEditMode = function () {
        var _this = this;
        this.editorTabs = [];
        this.addEditorTab('General', 'public/app/partials/panelgeneral.html');
        this.editModeInitiated = true;
        this.events.emit('init-edit-mode', null);
        var urlTab = (this.$injector.get('$routeParams').tab || '').toLowerCase();
        if (urlTab) {
            this.editorTabs.forEach(function (tab, i) {
                if (tab.title.toLowerCase() === urlTab) {
                    _this.editorTabIndex = i;
                }
            });
        }
    };
    PanelCtrl.prototype.changeTab = function (newIndex) {
        this.editorTabIndex = newIndex;
        var route = this.$injector.get('$route');
        route.current.params.tab = this.editorTabs[newIndex].title.toLowerCase();
        route.updateParams();
    };
    PanelCtrl.prototype.addEditorTab = function (title, directiveFn, index) {
        var editorTab = { title: title, directiveFn: directiveFn };
        if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isString(directiveFn)) {
            editorTab.directiveFn = function () {
                return { templateUrl: directiveFn };
            };
        }
        if (index) {
            this.editorTabs.splice(index, 0, editorTab);
        }
        else {
            this.editorTabs.push(editorTab);
        }
    };
    PanelCtrl.prototype.getMenu = function () {
        var menu = [];
        menu.push({
            text: 'View',
            click: 'ctrl.viewPanel();',
            icon: 'fa fa-fw fa-eye',
            shortcut: 'v',
        });
        if (this.dashboard.meta.canEdit) {
            menu.push({
                text: 'Edit',
                click: 'ctrl.editPanel();',
                role: 'Editor',
                icon: 'fa fa-fw fa-edit',
                shortcut: 'e',
            });
        }
        menu.push({
            text: 'Share',
            click: 'ctrl.sharePanel();',
            icon: 'fa fa-fw fa-share',
            shortcut: 'p s',
        });
        // Additional items from sub-class
        menu.push.apply(menu, this.getAdditionalMenuItems());
        var extendedMenu = this.getExtendedMenu();
        menu.push({
            text: 'More ...',
            click: '',
            icon: 'fa fa-fw fa-cube',
            submenu: extendedMenu,
        });
        if (this.dashboard.meta.canEdit) {
            menu.push({ divider: true, role: 'Editor' });
            menu.push({
                text: 'Remove',
                click: 'ctrl.removePanel();',
                role: 'Editor',
                icon: 'fa fa-fw fa-trash',
                shortcut: 'p r',
            });
        }
        return menu;
    };
    PanelCtrl.prototype.getExtendedMenu = function () {
        var menu = [];
        if (!this.fullscreen && this.dashboard.meta.canEdit) {
            menu.push({
                text: 'Duplicate',
                click: 'ctrl.duplicate()',
                role: 'Editor',
                shortcut: 'p d',
            });
            menu.push({
                text: 'Copy',
                click: 'ctrl.copyPanel()',
                role: 'Editor',
            });
        }
        menu.push({
            text: 'Panel JSON',
            click: 'ctrl.editPanelJson(); dismiss();',
        });
        this.events.emit('init-panel-actions', menu);
        return menu;
    };
    // Override in sub-class to add items before extended menu
    PanelCtrl.prototype.getAdditionalMenuItems = function () {
        return [];
    };
    PanelCtrl.prototype.otherPanelInFullscreenMode = function () {
        return this.dashboard.meta.fullscreen && !this.fullscreen;
    };
    PanelCtrl.prototype.calculatePanelHeight = function () {
        if (this.fullscreen) {
            var docHeight = jquery__WEBPACK_IMPORTED_MODULE_2___default()(window).height();
            var editHeight = Math.floor(docHeight * 0.4);
            var fullscreenHeight = Math.floor(docHeight * 0.8);
            this.containerHeight = this.editMode ? editHeight : fullscreenHeight;
        }
        else {
            this.containerHeight = this.panel.gridPos.h * app_core_constants__WEBPACK_IMPORTED_MODULE_6__["GRID_CELL_HEIGHT"] + (this.panel.gridPos.h - 1) * app_core_constants__WEBPACK_IMPORTED_MODULE_6__["GRID_CELL_VMARGIN"];
        }
        if (this.panel.soloMode) {
            this.containerHeight = jquery__WEBPACK_IMPORTED_MODULE_2___default()(window).height();
        }
        this.height = this.containerHeight - (PANEL_BORDER + TITLE_HEIGHT);
    };
    PanelCtrl.prototype.render = function (payload) {
        this.timing.renderStart = new Date().getTime();
        this.events.emit('render', payload);
    };
    PanelCtrl.prototype.duplicate = function () {
        var _this = this;
        this.dashboard.duplicatePanel(this.panel);
        this.$timeout(function () {
            _this.$scope.$root.$broadcast('render');
        });
    };
    PanelCtrl.prototype.removePanel = function () {
        this.publishAppEvent('panel-remove', {
            panelId: this.panel.id,
        });
    };
    PanelCtrl.prototype.editPanelJson = function () {
        var editScope = this.$scope.$root.$new();
        editScope.object = this.panel.getSaveModel();
        editScope.updateHandler = this.replacePanel.bind(this);
        editScope.enableCopy = true;
        this.publishAppEvent('show-modal', {
            src: 'public/app/partials/edit_json.html',
            scope: editScope,
        });
    };
    PanelCtrl.prototype.copyPanel = function () {
        app_core_store__WEBPACK_IMPORTED_MODULE_7__["default"].set(app_core_constants__WEBPACK_IMPORTED_MODULE_6__["LS_PANEL_COPY_KEY"], JSON.stringify(this.panel.getSaveModel()));
        app_core_core__WEBPACK_IMPORTED_MODULE_3__["appEvents"].emit('alert-success', ['Panel copied. Open Add Panel to paste']);
    };
    PanelCtrl.prototype.replacePanel = function (newPanel, oldPanel) {
        var dashboard = this.dashboard;
        var index = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.findIndex(dashboard.panels, function (panel) {
            return panel.id === oldPanel.id;
        });
        var deletedPanel = dashboard.panels.splice(index, 1);
        this.dashboard.events.emit('panel-removed', deletedPanel);
        newPanel = new app_features_dashboard_panel_model__WEBPACK_IMPORTED_MODULE_4__["PanelModel"](newPanel);
        newPanel.id = oldPanel.id;
        dashboard.panels.splice(index, 0, newPanel);
        dashboard.sortPanelsByGridPos();
        dashboard.events.emit('panel-added', newPanel);
    };
    PanelCtrl.prototype.sharePanel = function () {
        var shareScope = this.$scope.$new();
        shareScope.panel = this.panel;
        shareScope.dashboard = this.dashboard;
        this.publishAppEvent('show-modal', {
            src: 'public/app/features/dashboard/partials/shareModal.html',
            scope: shareScope,
        });
    };
    PanelCtrl.prototype.getInfoMode = function () {
        if (this.error) {
            return 'error';
        }
        if (!!this.panel.description) {
            return 'info';
        }
        if (this.panel.links && this.panel.links.length) {
            return 'links';
        }
        return '';
    };
    PanelCtrl.prototype.getInfoContent = function (options) {
        var markdown = this.panel.description;
        if (options.mode === 'tooltip') {
            markdown = this.error || this.panel.description;
        }
        var linkSrv = this.$injector.get('linkSrv');
        var sanitize = this.$injector.get('$sanitize');
        var templateSrv = this.$injector.get('templateSrv');
        var interpolatedMarkdown = templateSrv.replace(markdown, this.panel.scopedVars);
        var html = '<div class="markdown-html">';
        html += new remarkable__WEBPACK_IMPORTED_MODULE_5___default.a().render(interpolatedMarkdown);
        if (this.panel.links && this.panel.links.length > 0) {
            html += '<ul>';
            for (var _i = 0, _a = this.panel.links; _i < _a.length; _i++) {
                var link = _a[_i];
                var info = linkSrv.getPanelLinkAnchorInfo(link, this.panel.scopedVars);
                html +=
                    '<li><a class="panel-menu-link" href="' +
                        info.href +
                        '" target="' +
                        info.target +
                        '">' +
                        info.title +
                        '</a></li>';
            }
            html += '</ul>';
        }
        html += '</div>';
        return sanitize(html);
    };
    PanelCtrl.prototype.openInspector = function () {
        var modalScope = this.$scope.$new();
        modalScope.panel = this.panel;
        modalScope.dashboard = this.dashboard;
        modalScope.panelInfoHtml = this.getInfoContent({ mode: 'inspector' });
        modalScope.inspector = jquery__WEBPACK_IMPORTED_MODULE_2___default.a.extend(true, {}, this.inspector);
        this.publishAppEvent('show-modal', {
            src: 'public/app/features/dashboard/partials/inspector.html',
            scope: modalScope,
        });
    };
    return PanelCtrl;
}());



/***/ }),

/***/ "./public/app/features/panel/panel_directive.ts":
/*!******************************************************!*\
  !*** ./public/app/features/panel/panel_directive.ts ***!
  \******************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! angular */ "./node_modules/angular/index.js");
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(angular__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var tether_drop__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tether-drop */ "./node_modules/tether-drop/dist/js/drop.js");
/* harmony import */ var tether_drop__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(tether_drop__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var baron__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! baron */ "./node_modules/baron/src/core.js");
/* harmony import */ var baron__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(baron__WEBPACK_IMPORTED_MODULE_3__);




var module = angular__WEBPACK_IMPORTED_MODULE_0___default.a.module('grafana.directives');
var panelTemplate = "\n  <div class=\"panel-container\">\n    <div class=\"panel-header\" ng-class=\"{'grid-drag-handle': !ctrl.fullscreen}\">\n      <span class=\"panel-info-corner\">\n        <i class=\"fa\"></i>\n        <span class=\"panel-info-corner-inner\"></span>\n      </span>\n\n      <span class=\"panel-loading\" ng-show=\"ctrl.loading\">\n        <i class=\"fa fa-spinner fa-spin\"></i>\n      </span>\n\n      <panel-header class=\"panel-title-container\" panel-ctrl=\"ctrl\"></panel-header>\n    </div>\n\n    <div class=\"panel-content\">\n      <ng-transclude class=\"panel-height-helper\"></ng-transclude>\n    </div>\n  </div>\n\n  <div class=\"panel-full-edit\" ng-if=\"ctrl.editMode\">\n    <div class=\"tabbed-view tabbed-view--panel-edit\">\n      <div class=\"tabbed-view-header\">\n        <h3 class=\"tabbed-view-panel-title\">\n          {{ctrl.pluginName}}\n        </h3>\n\n        <ul class=\"gf-tabs\">\n          <li class=\"gf-tabs-item\" ng-repeat=\"tab in ::ctrl.editorTabs\">\n            <a class=\"gf-tabs-link\" ng-click=\"ctrl.changeTab($index)\" ng-class=\"{active: ctrl.editorTabIndex === $index}\">\n              {{::tab.title}}\n            </a>\n          </li>\n        </ul>\n\n        <button class=\"tabbed-view-close-btn\" ng-click=\"ctrl.exitFullscreen();\">\n          <i class=\"fa fa-remove\"></i>\n        </button>\n      </div>\n\n      <div class=\"tabbed-view-body\">\n        <div ng-repeat=\"tab in ctrl.editorTabs\" ng-if=\"ctrl.editorTabIndex === $index\">\n          <panel-editor-tab editor-tab=\"tab\" ctrl=\"ctrl\" index=\"$index\"></panel-editor-tab>\n        </div>\n      </div>\n    </div>\n  </div>\n";
module.directive('grafanaPanel', function ($rootScope, $document, $timeout) {
    return {
        restrict: 'E',
        template: panelTemplate,
        transclude: true,
        scope: { ctrl: '=' },
        link: function (scope, elem) {
            var panelContainer = elem.find('.panel-container');
            var panelContent = elem.find('.panel-content');
            var cornerInfoElem = elem.find('.panel-info-corner');
            var ctrl = scope.ctrl;
            var infoDrop;
            var panelScrollbar;
            // the reason for handling these classes this way is for performance
            // limit the watchers on panels etc
            var transparentLastState = false;
            var lastHasAlertRule = false;
            var lastAlertState;
            var hasAlertRule;
            function mouseEnter() {
                panelContainer.toggleClass('panel-hover-highlight', true);
                ctrl.dashboard.setPanelFocus(ctrl.panel.id);
            }
            function mouseLeave() {
                panelContainer.toggleClass('panel-hover-highlight', false);
                ctrl.dashboard.setPanelFocus(0);
            }
            function panelHeightUpdated() {
                panelContent.css({ height: ctrl.height + 'px' });
            }
            function resizeScrollableContent() {
                if (panelScrollbar) {
                    panelScrollbar.update();
                }
            }
            // set initial transparency
            if (ctrl.panel.transparent) {
                transparentLastState = true;
                panelContainer.addClass('panel-transparent', true);
            }
            // update scrollbar after mounting
            ctrl.events.on('component-did-mount', function () {
                if (ctrl.__proto__.constructor.scrollable) {
                    var scrollRootClass = 'baron baron__root baron__clipper panel-content--scrollable';
                    var scrollerClass = 'baron__scroller';
                    var scrollBarHTML = "\n            <div class=\"baron__track\">\n              <div class=\"baron__bar\"></div>\n            </div>\n          ";
                    var scrollRoot = panelContent;
                    var scroller = panelContent.find(':first').find(':first');
                    scrollRoot.addClass(scrollRootClass);
                    jquery__WEBPACK_IMPORTED_MODULE_1___default()(scrollBarHTML).appendTo(scrollRoot);
                    scroller.addClass(scrollerClass);
                    panelScrollbar = baron__WEBPACK_IMPORTED_MODULE_3___default()({
                        root: scrollRoot[0],
                        scroller: scroller[0],
                        bar: '.baron__bar',
                        barOnCls: '_scrollbar',
                        scrollingCls: '_scrolling',
                    });
                    panelScrollbar.scroll();
                }
            });
            ctrl.events.on('panel-size-changed', function () {
                ctrl.calculatePanelHeight();
                panelHeightUpdated();
                $timeout(function () {
                    resizeScrollableContent();
                    ctrl.render();
                });
            });
            // set initial height
            ctrl.calculatePanelHeight();
            panelHeightUpdated();
            ctrl.events.on('render', function () {
                if (transparentLastState !== ctrl.panel.transparent) {
                    panelContainer.toggleClass('panel-transparent', ctrl.panel.transparent === true);
                    transparentLastState = ctrl.panel.transparent;
                }
                hasAlertRule = ctrl.panel.alert !== undefined;
                if (lastHasAlertRule !== hasAlertRule) {
                    panelContainer.toggleClass('panel-has-alert', hasAlertRule);
                    lastHasAlertRule = hasAlertRule;
                }
                if (ctrl.alertState) {
                    if (lastAlertState) {
                        panelContainer.removeClass('panel-alert-state--' + lastAlertState);
                    }
                    if (ctrl.alertState.state === 'ok' || ctrl.alertState.state === 'alerting') {
                        panelContainer.addClass('panel-alert-state--' + ctrl.alertState.state);
                    }
                    lastAlertState = ctrl.alertState.state;
                }
                else if (lastAlertState) {
                    panelContainer.removeClass('panel-alert-state--' + lastAlertState);
                    lastAlertState = null;
                }
            });
            function updatePanelCornerInfo() {
                var cornerMode = ctrl.getInfoMode();
                cornerInfoElem[0].className = 'panel-info-corner panel-info-corner--' + cornerMode;
                if (cornerMode) {
                    if (infoDrop) {
                        infoDrop.destroy();
                    }
                    infoDrop = new tether_drop__WEBPACK_IMPORTED_MODULE_2___default.a({
                        target: cornerInfoElem[0],
                        content: function () {
                            return ctrl.getInfoContent({ mode: 'tooltip' });
                        },
                        classes: ctrl.error ? 'drop-error' : 'drop-help',
                        openOn: 'hover',
                        hoverOpenDelay: 100,
                        tetherOptions: {
                            attachment: 'bottom left',
                            targetAttachment: 'top left',
                            constraints: [
                                {
                                    to: 'window',
                                    attachment: 'together',
                                    pin: true,
                                },
                            ],
                        },
                    });
                }
            }
            scope.$watchGroup(['ctrl.error', 'ctrl.panel.description'], updatePanelCornerInfo);
            scope.$watchCollection('ctrl.panel.links', updatePanelCornerInfo);
            cornerInfoElem.on('click', function () {
                infoDrop.close();
                scope.$apply(ctrl.openInspector.bind(ctrl));
            });
            elem.on('mouseenter', mouseEnter);
            elem.on('mouseleave', mouseLeave);
            scope.$on('$destroy', function () {
                elem.off();
                cornerInfoElem.off();
                if (infoDrop) {
                    infoDrop.destroy();
                }
                if (panelScrollbar) {
                    panelScrollbar.dispose();
                }
            });
        },
    };
});
module.directive('panelHelpCorner', function ($rootScope) {
    return {
        restrict: 'E',
        template: "\n    <span class=\"alert-error panel-error small pointer\" ng-if=\"ctrl.error\" ng-click=\"ctrl.openInspector()\">\n    <span data-placement=\"top\" bs-tooltip=\"ctrl.error\">\n    <i class=\"fa fa-exclamation\"></i><span class=\"panel-error-arrow\"></span>\n    </span>\n    </span>\n    ",
        link: function (scope, elem) { },
    };
});


/***/ }),

/***/ "./public/app/features/panel/panel_header.ts":
/*!***************************************************!*\
  !*** ./public/app/features/panel/panel_header.ts ***!
  \***************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var app_core_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! app/core/core */ "./public/app/core/core.ts");


var template = "\n<span class=\"panel-title\">\n  <span class=\"icon-gf panel-alert-icon\"></span>\n  <span class=\"panel-title-text\">{{ctrl.panel.title | interpolateTemplateVars:this}}</span>\n  <span class=\"panel-menu-container dropdown\">\n    <span class=\"fa fa-caret-down panel-menu-toggle\" data-toggle=\"dropdown\"></span>\n    <ul class=\"dropdown-menu dropdown-menu--menu panel-menu\" role=\"menu\">\n      <li>\n        <a ng-click=\"ctrl.addDataQuery(datasource);\">\n          <i class=\"fa fa-cog\"></i> Edit <span class=\"dropdown-menu-item-shortcut\">e</span>\n        </a>\n      </li>\n      <li class=\"dropdown-submenu\">\n        <a ng-click=\"ctrl.addDataQuery(datasource);\"><i class=\"fa fa-cube\"></i> Actions</a>\n        <ul class=\"dropdown-menu panel-menu\">\n          <li><a ng-click=\"ctrl.addDataQuery(datasource);\"><i class=\"fa fa-flash\"></i> Add Annotation</a></li>\n          <li><a ng-click=\"ctrl.addDataQuery(datasource);\"><i class=\"fa fa-bullseye\"></i> Toggle Legend</a></li>\n          <li><a ng-click=\"ctrl.addDataQuery(datasource);\"><i class=\"fa fa-download\"></i> Export to CSV</a></li>\n          <li><a ng-click=\"ctrl.addDataQuery(datasource);\"><i class=\"fa fa-eye\"></i> View JSON</a></li>\n        </ul>\n      </li>\n      <li><a ng-click=\"ctrl.addDataQuery(datasource);\"><i class=\"fa fa-trash\"></i> Remove</a></li>\n    </ul>\n  </span>\n  <span class=\"panel-time-info\" ng-if=\"ctrl.timeInfo\"><i class=\"fa fa-clock-o\"></i> {{ctrl.timeInfo}}</span>\n</span>";
function renderMenuItem(item, ctrl) {
    var html = '';
    var listItemClass = '';
    if (item.divider) {
        return '<li class="divider"></li>';
    }
    if (item.submenu) {
        listItemClass = 'dropdown-submenu';
    }
    html += "<li class=\"" + listItemClass + "\"><a ";
    if (item.click) {
        html += " ng-click=\"" + item.click + "\"";
    }
    if (item.href) {
        html += " href=\"" + item.href + "\"";
    }
    html += "><i class=\"" + item.icon + "\"></i>";
    html += "<span class=\"dropdown-item-text\">" + item.text + "</span>";
    if (item.shortcut) {
        html += "<span class=\"dropdown-menu-item-shortcut\">" + item.shortcut + "</span>";
    }
    html += "</a>";
    if (item.submenu) {
        html += '<ul class="dropdown-menu dropdown-menu--menu panel-menu">';
        for (var _i = 0, _a = item.submenu; _i < _a.length; _i++) {
            var subitem = _a[_i];
            html += renderMenuItem(subitem, ctrl);
        }
        html += '</ul>';
    }
    html += "</li>";
    return html;
}
function createMenuTemplate(ctrl) {
    var html = '';
    for (var _i = 0, _a = ctrl.getMenu(); _i < _a.length; _i++) {
        var item = _a[_i];
        html += renderMenuItem(item, ctrl);
    }
    return html;
}
/** @ngInject **/
function panelHeader($compile) {
    return {
        restrict: 'E',
        template: template,
        link: function (scope, elem, attrs) {
            var menuElem = elem.find('.panel-menu');
            var menuScope;
            var isDragged;
            elem.click(function (evt) {
                var targetClass = evt.target.className;
                // remove existing scope
                if (menuScope) {
                    menuScope.$destroy();
                }
                menuScope = scope.$new();
                var menuHtml = createMenuTemplate(scope.ctrl);
                menuElem.html(menuHtml);
                $compile(menuElem)(menuScope);
                if (targetClass.indexOf('panel-title-text') >= 0 || targetClass.indexOf('panel-title') >= 0) {
                    togglePanelMenu(evt);
                }
            });
            elem.find('.panel-menu-toggle').click(function () {
                togglePanelStackPosition();
            });
            function togglePanelMenu(e) {
                if (!isDragged) {
                    e.stopPropagation();
                    togglePanelStackPosition();
                    elem.find('[data-toggle=dropdown]').dropdown('toggle');
                }
            }
            /**
             * Hack for adding special class 'dropdown-menu-open' to the panel.
             * This class sets z-index for panel and prevents menu overlapping.
             */
            function togglePanelStackPosition() {
                var menuOpenClass = 'dropdown-menu-open';
                var panelGridClass = '.react-grid-item.panel';
                var panelElem = elem
                    .find('[data-toggle=dropdown]')
                    .parentsUntil('.panel')
                    .parent();
                var menuElem = elem.find('[data-toggle=dropdown]').parent();
                panelElem = panelElem && panelElem.length ? panelElem[0] : undefined;
                if (panelElem) {
                    panelElem = jquery__WEBPACK_IMPORTED_MODULE_0___default()(panelElem);
                    jquery__WEBPACK_IMPORTED_MODULE_0___default()(panelGridClass).removeClass(menuOpenClass);
                    var state = !menuElem.hasClass('open');
                    panelElem.toggleClass(menuOpenClass, state);
                }
            }
            var mouseX, mouseY;
            elem.mousedown(function (e) {
                mouseX = e.pageX;
                mouseY = e.pageY;
            });
            elem.mouseup(function (e) {
                if (mouseX === e.pageX && mouseY === e.pageY) {
                    isDragged = false;
                }
                else {
                    isDragged = true;
                }
            });
        },
    };
}
app_core_core__WEBPACK_IMPORTED_MODULE_1__["coreModule"].directive('panelHeader', panelHeader);


/***/ }),

/***/ "./public/app/features/plugins/plugin_loader.ts":
/*!******************************************************!*\
  !*** ./public/app/features/plugins/plugin_loader.ts ***!
  \******************************************************/
/*! exports provided: importPluginModule, loadPluginCss */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "importPluginModule", function() { return importPluginModule; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadPluginCss", function() { return loadPluginCss; });
/* harmony import */ var systemjs_dist_system_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! systemjs/dist/system.js */ "./node_modules/systemjs/dist/system.js");
/* harmony import */ var systemjs_dist_system_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(systemjs_dist_system_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var app_plugins_sdk__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! app/plugins/sdk */ "./public/app/plugins/sdk.ts");
/* harmony import */ var app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! app/core/utils/kbn */ "./public/app/core/utils/kbn.ts");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! moment */ "./node_modules/moment/moment.js");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! angular */ "./node_modules/angular/index.js");
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(angular__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var prismjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! prismjs */ "./node_modules/prismjs/prism.js");
/* harmony import */ var prismjs__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(prismjs__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var slate__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! slate */ "./node_modules/slate/lib/slate.es.js");
/* harmony import */ var slate_react__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! slate-react */ "./node_modules/slate-react/lib/slate-react.es.js");
/* harmony import */ var slate_plain_serializer__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! slate-plain-serializer */ "./node_modules/slate-plain-serializer/lib/slate-plain-serializer.es.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! react-dom */ "./node_modules/react-dom/index.js");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var app_core_config__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! app/core/config */ "./public/app/core/config.ts");
/* harmony import */ var app_core_time_series2__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! app/core/time_series2 */ "./public/app/core/time_series2.ts");
/* harmony import */ var app_core_table_model__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! app/core/table_model */ "./public/app/core/table_model.ts");
/* harmony import */ var app_core_core__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! app/core/core */ "./public/app/core/core.ts");
/* harmony import */ var app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! app/core/utils/datemath */ "./public/app/core/utils/datemath.ts");
/* harmony import */ var app_core_utils_file_export__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! app/core/utils/file_export */ "./public/app/core/utils/file_export.ts");
/* harmony import */ var app_core_utils_flatten__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! app/core/utils/flatten */ "./public/app/core/utils/flatten.ts");
/* harmony import */ var app_core_utils_ticks__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! app/core/utils/ticks */ "./public/app/core/utils/ticks.ts");
/* harmony import */ var app_core_services_impression_srv__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! app/core/services/impression_srv */ "./public/app/core/services/impression_srv.ts");
/* harmony import */ var _built_in_plugins__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./built_in_plugins */ "./public/app/features/plugins/built_in_plugins.ts");
/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! d3 */ "./node_modules/d3/index.js");
/* harmony import */ var rxjs_Observable__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! rxjs/Observable */ "./node_modules/rxjs/Observable.js");
/* harmony import */ var rxjs_Observable__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(rxjs_Observable__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var rxjs_Subject__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! rxjs/Subject */ "./node_modules/rxjs/Subject.js");
/* harmony import */ var rxjs_Subject__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(rxjs_Subject__WEBPACK_IMPORTED_MODULE_25__);
/* harmony import */ var rxjs_add_observable_empty__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! rxjs/add/observable/empty */ "./node_modules/rxjs/add/observable/empty.js");
/* harmony import */ var rxjs_add_observable_empty__WEBPACK_IMPORTED_MODULE_26___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_observable_empty__WEBPACK_IMPORTED_MODULE_26__);
/* harmony import */ var rxjs_add_observable_from__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! rxjs/add/observable/from */ "./node_modules/rxjs/add/observable/from.js");
/* harmony import */ var rxjs_add_observable_from__WEBPACK_IMPORTED_MODULE_27___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_observable_from__WEBPACK_IMPORTED_MODULE_27__);
/* harmony import */ var rxjs_add_operator_map__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! rxjs/add/operator/map */ "./node_modules/rxjs/add/operator/map.js");
/* harmony import */ var rxjs_add_operator_map__WEBPACK_IMPORTED_MODULE_28___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_map__WEBPACK_IMPORTED_MODULE_28__);
/* harmony import */ var rxjs_add_operator_combineAll__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! rxjs/add/operator/combineAll */ "./node_modules/rxjs/add/operator/combineAll.js");
/* harmony import */ var rxjs_add_operator_combineAll__WEBPACK_IMPORTED_MODULE_29___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_combineAll__WEBPACK_IMPORTED_MODULE_29__);
/* harmony import */ var vendor_flot_jquery_flot__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! vendor/flot/jquery.flot */ "./public/vendor/flot/jquery.flot.js");
/* harmony import */ var vendor_flot_jquery_flot__WEBPACK_IMPORTED_MODULE_30___default = /*#__PURE__*/__webpack_require__.n(vendor_flot_jquery_flot__WEBPACK_IMPORTED_MODULE_30__);
/* harmony import */ var vendor_flot_jquery_flot_selection__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! vendor/flot/jquery.flot.selection */ "./public/vendor/flot/jquery.flot.selection.js");
/* harmony import */ var vendor_flot_jquery_flot_selection__WEBPACK_IMPORTED_MODULE_31___default = /*#__PURE__*/__webpack_require__.n(vendor_flot_jquery_flot_selection__WEBPACK_IMPORTED_MODULE_31__);
/* harmony import */ var vendor_flot_jquery_flot_time__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! vendor/flot/jquery.flot.time */ "./public/vendor/flot/jquery.flot.time.js");
/* harmony import */ var vendor_flot_jquery_flot_time__WEBPACK_IMPORTED_MODULE_32___default = /*#__PURE__*/__webpack_require__.n(vendor_flot_jquery_flot_time__WEBPACK_IMPORTED_MODULE_32__);
/* harmony import */ var vendor_flot_jquery_flot_stack__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! vendor/flot/jquery.flot.stack */ "./public/vendor/flot/jquery.flot.stack.js");
/* harmony import */ var vendor_flot_jquery_flot_stack__WEBPACK_IMPORTED_MODULE_33___default = /*#__PURE__*/__webpack_require__.n(vendor_flot_jquery_flot_stack__WEBPACK_IMPORTED_MODULE_33__);
/* harmony import */ var vendor_flot_jquery_flot_pie__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! vendor/flot/jquery.flot.pie */ "./public/vendor/flot/jquery.flot.pie.js");
/* harmony import */ var vendor_flot_jquery_flot_pie__WEBPACK_IMPORTED_MODULE_34___default = /*#__PURE__*/__webpack_require__.n(vendor_flot_jquery_flot_pie__WEBPACK_IMPORTED_MODULE_34__);
/* harmony import */ var vendor_flot_jquery_flot_stackpercent__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! vendor/flot/jquery.flot.stackpercent */ "./public/vendor/flot/jquery.flot.stackpercent.js");
/* harmony import */ var vendor_flot_jquery_flot_stackpercent__WEBPACK_IMPORTED_MODULE_35___default = /*#__PURE__*/__webpack_require__.n(vendor_flot_jquery_flot_stackpercent__WEBPACK_IMPORTED_MODULE_35__);
/* harmony import */ var vendor_flot_jquery_flot_fillbelow__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! vendor/flot/jquery.flot.fillbelow */ "./public/vendor/flot/jquery.flot.fillbelow.js");
/* harmony import */ var vendor_flot_jquery_flot_fillbelow__WEBPACK_IMPORTED_MODULE_36___default = /*#__PURE__*/__webpack_require__.n(vendor_flot_jquery_flot_fillbelow__WEBPACK_IMPORTED_MODULE_36__);
/* harmony import */ var vendor_flot_jquery_flot_crosshair__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! vendor/flot/jquery.flot.crosshair */ "./public/vendor/flot/jquery.flot.crosshair.js");
/* harmony import */ var vendor_flot_jquery_flot_crosshair__WEBPACK_IMPORTED_MODULE_37___default = /*#__PURE__*/__webpack_require__.n(vendor_flot_jquery_flot_crosshair__WEBPACK_IMPORTED_MODULE_37__);
/* harmony import */ var vendor_flot_jquery_flot_dashes__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! vendor/flot/jquery.flot.dashes */ "./public/vendor/flot/jquery.flot.dashes.js");
/* harmony import */ var vendor_flot_jquery_flot_dashes__WEBPACK_IMPORTED_MODULE_38___default = /*#__PURE__*/__webpack_require__.n(vendor_flot_jquery_flot_dashes__WEBPACK_IMPORTED_MODULE_38__);
/* harmony import */ var vendor_flot_jquery_flot_gauge__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! vendor/flot/jquery.flot.gauge */ "./public/vendor/flot/jquery.flot.gauge.js");
/* harmony import */ var vendor_flot_jquery_flot_gauge__WEBPACK_IMPORTED_MODULE_39___default = /*#__PURE__*/__webpack_require__.n(vendor_flot_jquery_flot_gauge__WEBPACK_IMPORTED_MODULE_39__);







// Experimental module exports

















// rxjs


// these imports add functions to Observable




// add cache busting
var bust = "?_cache=" + Date.now();
function locate(load) {
    return load.address + bust;
}
systemjs_dist_system_js__WEBPACK_IMPORTED_MODULE_0___default.a.registry.set('plugin-loader', systemjs_dist_system_js__WEBPACK_IMPORTED_MODULE_0___default.a.newModule({ locate: locate }));
systemjs_dist_system_js__WEBPACK_IMPORTED_MODULE_0___default.a.config({
    baseURL: 'public',
    defaultExtension: 'js',
    packages: {
        plugins: {
            defaultExtension: 'js',
        },
    },
    map: {
        text: 'vendor/plugin-text/text.js',
        css: 'vendor/plugin-css/css.js',
    },
    meta: {
        '/*': {
            esModule: true,
            authorization: true,
            loader: 'plugin-loader',
        },
    },
});
function exposeToPlugin(name, component) {
    systemjs_dist_system_js__WEBPACK_IMPORTED_MODULE_0___default.a.registerDynamic(name, [], true, function (require, exports, module) {
        module.exports = component;
    });
}
exposeToPlugin('lodash', lodash__WEBPACK_IMPORTED_MODULE_1___default.a);
exposeToPlugin('moment', moment__WEBPACK_IMPORTED_MODULE_4___default.a);
exposeToPlugin('jquery', jquery__WEBPACK_IMPORTED_MODULE_6___default.a);
exposeToPlugin('angular', angular__WEBPACK_IMPORTED_MODULE_5___default.a);
exposeToPlugin('d3', d3__WEBPACK_IMPORTED_MODULE_23__);
exposeToPlugin('rxjs/Subject', rxjs_Subject__WEBPACK_IMPORTED_MODULE_25__["Subject"]);
exposeToPlugin('rxjs/Observable', rxjs_Observable__WEBPACK_IMPORTED_MODULE_24__["Observable"]);
// Experimental modules
exposeToPlugin('prismjs', prismjs__WEBPACK_IMPORTED_MODULE_7___default.a);
exposeToPlugin('slate', slate__WEBPACK_IMPORTED_MODULE_8__["default"]);
exposeToPlugin('slate-react', slate_react__WEBPACK_IMPORTED_MODULE_9__["default"]);
exposeToPlugin('slate-plain-serializer', slate_plain_serializer__WEBPACK_IMPORTED_MODULE_10__["default"]);
exposeToPlugin('react', react__WEBPACK_IMPORTED_MODULE_11___default.a);
exposeToPlugin('react-dom', react_dom__WEBPACK_IMPORTED_MODULE_12___default.a);
// backward compatible path
exposeToPlugin('vendor/npm/rxjs/Rx', {
    Subject: rxjs_Subject__WEBPACK_IMPORTED_MODULE_25__["Subject"],
    Observable: rxjs_Observable__WEBPACK_IMPORTED_MODULE_24__["Observable"],
});
exposeToPlugin('app/features/dashboard/impression_store', {
    impressions: app_core_services_impression_srv__WEBPACK_IMPORTED_MODULE_21__["default"],
    __esModule: true,
});
exposeToPlugin('app/plugins/sdk', app_plugins_sdk__WEBPACK_IMPORTED_MODULE_2__);
exposeToPlugin('app/core/utils/datemath', app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_17__);
exposeToPlugin('app/core/utils/file_export', app_core_utils_file_export__WEBPACK_IMPORTED_MODULE_18__);
exposeToPlugin('app/core/utils/flatten', app_core_utils_flatten__WEBPACK_IMPORTED_MODULE_19__);
exposeToPlugin('app/core/utils/kbn', app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_3__["default"]);
exposeToPlugin('app/core/utils/ticks', app_core_utils_ticks__WEBPACK_IMPORTED_MODULE_20__);
exposeToPlugin('app/core/config', app_core_config__WEBPACK_IMPORTED_MODULE_13__["default"]);
exposeToPlugin('app/core/time_series', app_core_time_series2__WEBPACK_IMPORTED_MODULE_14__["default"]);
exposeToPlugin('app/core/time_series2', app_core_time_series2__WEBPACK_IMPORTED_MODULE_14__["default"]);
exposeToPlugin('app/core/table_model', app_core_table_model__WEBPACK_IMPORTED_MODULE_15__["default"]);
exposeToPlugin('app/core/app_events', app_core_core__WEBPACK_IMPORTED_MODULE_16__["appEvents"]);
exposeToPlugin('app/core/core_module', app_core_core__WEBPACK_IMPORTED_MODULE_16__["coreModule"]);
exposeToPlugin('app/core/core', {
    coreModule: app_core_core__WEBPACK_IMPORTED_MODULE_16__["coreModule"],
    appEvents: app_core_core__WEBPACK_IMPORTED_MODULE_16__["appEvents"],
    contextSrv: app_core_core__WEBPACK_IMPORTED_MODULE_16__["contextSrv"],
    __esModule: true,
});










var flotDeps = [
    'jquery.flot',
    'jquery.flot.pie',
    'jquery.flot.time',
    'jquery.flot.fillbelow',
    'jquery.flot.crosshair',
    'jquery.flot.stack',
    'jquery.flot.selection',
    'jquery.flot.stackpercent',
    'jquery.flot.events',
    'jquery.flot.gauge',
];
for (var _i = 0, flotDeps_1 = flotDeps; _i < flotDeps_1.length; _i++) {
    var flotDep = flotDeps_1[_i];
    exposeToPlugin(flotDep, { fakeDep: 1 });
}
function importPluginModule(path) {
    var builtIn = _built_in_plugins__WEBPACK_IMPORTED_MODULE_22__["default"][path];
    if (builtIn) {
        return Promise.resolve(builtIn);
    }
    return systemjs_dist_system_js__WEBPACK_IMPORTED_MODULE_0___default.a.import(path);
}
function loadPluginCss(options) {
    if (app_core_config__WEBPACK_IMPORTED_MODULE_13__["default"].bootData.user.lightTheme) {
        systemjs_dist_system_js__WEBPACK_IMPORTED_MODULE_0___default.a.import(options.light + '!css');
    }
    else {
        systemjs_dist_system_js__WEBPACK_IMPORTED_MODULE_0___default.a.import(options.dark + '!css');
    }
}


/***/ }),

/***/ "./public/app/plugins/datasource/graphite/add_graphite_func.ts":
/*!*********************************************************************!*\
  !*** ./public/app/plugins/datasource/graphite/add_graphite_func.ts ***!
  \*********************************************************************/
/*! exports provided: graphiteAddFunc */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "graphiteAddFunc", function() { return graphiteAddFunc; });
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! angular */ "./node_modules/angular/index.js");
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(angular__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var rst2html__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rst2html */ "./node_modules/rst2html/dist/rst2html.min.js");
/* harmony import */ var rst2html__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(rst2html__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var tether_drop__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! tether-drop */ "./node_modules/tether-drop/dist/js/drop.js");
/* harmony import */ var tether_drop__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(tether_drop__WEBPACK_IMPORTED_MODULE_4__);





/** @ngInject */
function graphiteAddFunc($compile) {
    var inputTemplate = '<input type="text"' + ' class="gf-form-input"' + ' spellcheck="false" style="display:none"></input>';
    var buttonTemplate = '<a class="gf-form-label query-part dropdown-toggle"' +
        ' tabindex="1" gf-dropdown="functionMenu" data-toggle="dropdown">' +
        '<i class="fa fa-plus"></i></a>';
    return {
        link: function ($scope, elem) {
            var ctrl = $scope.ctrl;
            var $input = jquery__WEBPACK_IMPORTED_MODULE_2___default()(inputTemplate);
            var $button = jquery__WEBPACK_IMPORTED_MODULE_2___default()(buttonTemplate);
            $input.appendTo(elem);
            $button.appendTo(elem);
            ctrl.datasource.getFuncDefs().then(function (funcDefs) {
                var allFunctions = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.map(funcDefs, 'name').sort();
                $scope.functionMenu = createFunctionDropDownMenu(funcDefs);
                $input.attr('data-provide', 'typeahead');
                $input.typeahead({
                    source: allFunctions,
                    minLength: 1,
                    items: 10,
                    updater: function (value) {
                        var funcDef = ctrl.datasource.getFuncDef(value);
                        if (!funcDef) {
                            // try find close match
                            value = value.toLowerCase();
                            funcDef = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.find(allFunctions, function (funcName) {
                                return funcName.toLowerCase().indexOf(value) === 0;
                            });
                            if (!funcDef) {
                                return '';
                            }
                        }
                        $scope.$apply(function () {
                            ctrl.addFunction(funcDef);
                        });
                        $input.trigger('blur');
                        return '';
                    },
                });
                $button.click(function () {
                    $button.hide();
                    $input.show();
                    $input.focus();
                });
                $input.keyup(function () {
                    elem.toggleClass('open', $input.val() === '');
                });
                $input.blur(function () {
                    // clicking the function dropdown menu won't
                    // work if you remove class at once
                    setTimeout(function () {
                        $input.val('');
                        $input.hide();
                        $button.show();
                        elem.removeClass('open');
                    }, 200);
                });
                $compile(elem.contents())($scope);
            });
            var drop;
            var cleanUpDrop = function () {
                if (drop) {
                    drop.destroy();
                    drop = null;
                }
            };
            jquery__WEBPACK_IMPORTED_MODULE_2___default()(elem)
                .on('mouseenter', 'ul.dropdown-menu li', function () {
                cleanUpDrop();
                var funcDef;
                try {
                    funcDef = ctrl.datasource.getFuncDef(jquery__WEBPACK_IMPORTED_MODULE_2___default()('a', this).text());
                }
                catch (e) {
                    // ignore
                }
                if (funcDef && funcDef.description) {
                    var shortDesc = funcDef.description;
                    if (shortDesc.length > 500) {
                        shortDesc = shortDesc.substring(0, 497) + '...';
                    }
                    var contentElement = document.createElement('div');
                    contentElement.innerHTML = '<h4>' + funcDef.name + '</h4>' + rst2html__WEBPACK_IMPORTED_MODULE_3___default()(shortDesc);
                    drop = new tether_drop__WEBPACK_IMPORTED_MODULE_4___default.a({
                        target: this,
                        content: contentElement,
                        classes: 'drop-popover',
                        openOn: 'always',
                        tetherOptions: {
                            attachment: 'bottom left',
                            targetAttachment: 'bottom right',
                        },
                    });
                }
            })
                .on('mouseout', 'ul.dropdown-menu li', function () {
                cleanUpDrop();
            });
            $scope.$on('$destroy', cleanUpDrop);
        },
    };
}
angular__WEBPACK_IMPORTED_MODULE_0___default.a.module('grafana.directives').directive('graphiteAddFunc', graphiteAddFunc);
function createFunctionDropDownMenu(funcDefs) {
    var categories = {};
    lodash__WEBPACK_IMPORTED_MODULE_1___default.a.forEach(funcDefs, function (funcDef) {
        if (!funcDef.category) {
            return;
        }
        if (!categories[funcDef.category]) {
            categories[funcDef.category] = [];
        }
        categories[funcDef.category].push({
            text: funcDef.name,
            click: "ctrl.addFunction('" + funcDef.name + "')",
        });
    });
    return lodash__WEBPACK_IMPORTED_MODULE_1___default.a.sortBy(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.map(categories, function (submenu, category) {
        return {
            text: category,
            submenu: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.sortBy(submenu, 'text'),
        };
    }), 'text');
}


/***/ }),

/***/ "./public/app/plugins/datasource/graphite/func_editor.ts":
/*!***************************************************************!*\
  !*** ./public/app/plugins/datasource/graphite/func_editor.ts ***!
  \***************************************************************/
/*! exports provided: graphiteFuncEditor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "graphiteFuncEditor", function() { return graphiteFuncEditor; });
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! angular */ "./node_modules/angular/index.js");
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(angular__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var rst2html__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rst2html */ "./node_modules/rst2html/dist/rst2html.min.js");
/* harmony import */ var rst2html__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(rst2html__WEBPACK_IMPORTED_MODULE_3__);




/** @ngInject */
function graphiteFuncEditor($compile, templateSrv, popoverSrv) {
    var funcSpanTemplate = '<a ng-click="">{{func.def.name}}</a><span>(</span>';
    var paramTemplate = '<input type="text" style="display:none"' + ' class="input-small tight-form-func-param"></input>';
    var funcControlsTemplate = "\n    <div class=\"tight-form-func-controls\">\n      <span class=\"pointer fa fa-arrow-left\"></span>\n      <span class=\"pointer fa fa-question-circle\"></span>\n      <span class=\"pointer fa fa-remove\" ></span>\n      <span class=\"pointer fa fa-arrow-right\"></span>\n    </div>";
    return {
        restrict: 'A',
        link: function postLink($scope, elem) {
            var $funcLink = jquery__WEBPACK_IMPORTED_MODULE_2___default()(funcSpanTemplate);
            var $funcControls = jquery__WEBPACK_IMPORTED_MODULE_2___default()(funcControlsTemplate);
            var ctrl = $scope.ctrl;
            var func = $scope.func;
            var scheduledRelink = false;
            var paramCountAtLink = 0;
            var cancelBlur = null;
            function clickFuncParam(paramIndex) {
                /*jshint validthis:true */
                var $link = jquery__WEBPACK_IMPORTED_MODULE_2___default()(this);
                var $comma = $link.prev('.comma');
                var $input = $link.next();
                $input.val(func.params[paramIndex]);
                $comma.removeClass('query-part__last');
                $link.hide();
                $input.show();
                $input.focus();
                $input.select();
                var typeahead = $input.data('typeahead');
                if (typeahead) {
                    $input.val('');
                    typeahead.lookup();
                }
            }
            function scheduledRelinkIfNeeded() {
                if (paramCountAtLink === func.params.length) {
                    return;
                }
                if (!scheduledRelink) {
                    scheduledRelink = true;
                    setTimeout(function () {
                        relink();
                        scheduledRelink = false;
                    }, 200);
                }
            }
            function paramDef(index) {
                if (index < func.def.params.length) {
                    return func.def.params[index];
                }
                if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.last(func.def.params).multiple) {
                    return lodash__WEBPACK_IMPORTED_MODULE_1___default.a.assign({}, lodash__WEBPACK_IMPORTED_MODULE_1___default.a.last(func.def.params), { optional: true });
                }
                return {};
            }
            function switchToLink(inputElem, paramIndex) {
                /*jshint validthis:true */
                var $input = jquery__WEBPACK_IMPORTED_MODULE_2___default()(inputElem);
                clearTimeout(cancelBlur);
                cancelBlur = null;
                var $link = $input.prev();
                var $comma = $link.prev('.comma');
                var newValue = $input.val();
                // remove optional empty params
                if (newValue !== '' || paramDef(paramIndex).optional) {
                    func.updateParam(newValue, paramIndex);
                    $link.html(newValue ? templateSrv.highlightVariablesAsHtml(newValue) : '&nbsp;');
                }
                scheduledRelinkIfNeeded();
                $scope.$apply(function () {
                    ctrl.targetChanged();
                });
                if ($link.hasClass('query-part__last') && newValue === '') {
                    $comma.addClass('query-part__last');
                }
                else {
                    $link.removeClass('query-part__last');
                }
                $input.hide();
                $link.show();
            }
            // this = input element
            function inputBlur(paramIndex) {
                /*jshint validthis:true */
                var inputElem = this;
                // happens long before the click event on the typeahead options
                // need to have long delay because the blur
                cancelBlur = setTimeout(function () {
                    switchToLink(inputElem, paramIndex);
                }, 200);
            }
            function inputKeyPress(paramIndex, e) {
                /*jshint validthis:true */
                if (e.which === 13) {
                    jquery__WEBPACK_IMPORTED_MODULE_2___default()(this).blur();
                }
            }
            function inputKeyDown() {
                /*jshint validthis:true */
                this.style.width = (3 + this.value.length) * 8 + 'px';
            }
            function addTypeahead($input, paramIndex) {
                $input.attr('data-provide', 'typeahead');
                var options = paramDef(paramIndex).options;
                if (paramDef(paramIndex).type === 'int') {
                    options = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.map(options, function (val) {
                        return val.toString();
                    });
                }
                $input.typeahead({
                    source: options,
                    minLength: 0,
                    items: 20,
                    updater: function (value) {
                        $input.val(value);
                        switchToLink($input[0], paramIndex);
                        return value;
                    },
                });
                var typeahead = $input.data('typeahead');
                typeahead.lookup = function () {
                    this.query = this.$element.val() || '';
                    return this.process(this.source);
                };
            }
            function toggleFuncControls() {
                var targetDiv = elem.closest('.tight-form');
                if (elem.hasClass('show-function-controls')) {
                    elem.removeClass('show-function-controls');
                    targetDiv.removeClass('has-open-function');
                    $funcControls.hide();
                    return;
                }
                elem.addClass('show-function-controls');
                targetDiv.addClass('has-open-function');
                $funcControls.show();
            }
            function addElementsAndCompile() {
                $funcControls.appendTo(elem);
                $funcLink.appendTo(elem);
                var defParams = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.clone(func.def.params);
                var lastParam = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.last(func.def.params);
                while (func.params.length >= defParams.length && lastParam && lastParam.multiple) {
                    defParams.push(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.assign({}, lastParam, { optional: true }));
                }
                lodash__WEBPACK_IMPORTED_MODULE_1___default.a.each(defParams, function (param, index) {
                    if (param.optional && func.params.length < index) {
                        return false;
                    }
                    var paramValue = templateSrv.highlightVariablesAsHtml(func.params[index]);
                    var last = index >= func.params.length - 1 && param.optional && !paramValue;
                    if (last && param.multiple) {
                        paramValue = '+';
                    }
                    if (index > 0) {
                        jquery__WEBPACK_IMPORTED_MODULE_2___default()('<span class="comma' + (last ? ' query-part__last' : '') + '">, </span>').appendTo(elem);
                    }
                    var $paramLink = jquery__WEBPACK_IMPORTED_MODULE_2___default()('<a ng-click="" class="graphite-func-param-link' +
                        (last ? ' query-part__last' : '') +
                        '">' +
                        (paramValue || '&nbsp;') +
                        '</a>');
                    var $input = jquery__WEBPACK_IMPORTED_MODULE_2___default()(paramTemplate);
                    $input.attr('placeholder', param.name);
                    paramCountAtLink++;
                    $paramLink.appendTo(elem);
                    $input.appendTo(elem);
                    $input.blur(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.partial(inputBlur, index));
                    $input.keyup(inputKeyDown);
                    $input.keypress(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.partial(inputKeyPress, index));
                    $paramLink.click(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.partial(clickFuncParam, index));
                    if (param.options) {
                        addTypeahead($input, index);
                    }
                    return true;
                });
                jquery__WEBPACK_IMPORTED_MODULE_2___default()('<span>)</span>').appendTo(elem);
                $compile(elem.contents())($scope);
            }
            function ifJustAddedFocusFirstParam() {
                if ($scope.func.added) {
                    $scope.func.added = false;
                    setTimeout(function () {
                        elem
                            .find('.graphite-func-param-link')
                            .first()
                            .click();
                    }, 10);
                }
            }
            function registerFuncControlsToggle() {
                $funcLink.click(toggleFuncControls);
            }
            function registerFuncControlsActions() {
                $funcControls.click(function (e) {
                    var $target = jquery__WEBPACK_IMPORTED_MODULE_2___default()(e.target);
                    if ($target.hasClass('fa-remove')) {
                        toggleFuncControls();
                        $scope.$apply(function () {
                            ctrl.removeFunction($scope.func);
                        });
                        return;
                    }
                    if ($target.hasClass('fa-arrow-left')) {
                        $scope.$apply(function () {
                            lodash__WEBPACK_IMPORTED_MODULE_1___default.a.move(ctrl.queryModel.functions, $scope.$index, $scope.$index - 1);
                            ctrl.targetChanged();
                        });
                        return;
                    }
                    if ($target.hasClass('fa-arrow-right')) {
                        $scope.$apply(function () {
                            lodash__WEBPACK_IMPORTED_MODULE_1___default.a.move(ctrl.queryModel.functions, $scope.$index, $scope.$index + 1);
                            ctrl.targetChanged();
                        });
                        return;
                    }
                    if ($target.hasClass('fa-question-circle')) {
                        var funcDef = ctrl.datasource.getFuncDef(func.def.name);
                        if (funcDef && funcDef.description) {
                            popoverSrv.show({
                                element: e.target,
                                position: 'bottom left',
                                classNames: 'drop-popover drop-function-def',
                                template: "\n                  <div style=\"overflow:auto;max-height:30rem;\">\n                    <h4> " + funcDef.name + " </h4>\n                    " + rst2html__WEBPACK_IMPORTED_MODULE_3___default()(funcDef.description) + "\n                  </div>",
                                openOn: 'click',
                            });
                        }
                        else {
                            window.open('http://graphite.readthedocs.org/en/latest/functions.html#graphite.render.functions.' + func.def.name, '_blank');
                        }
                        return;
                    }
                });
            }
            function relink() {
                elem.children().remove();
                addElementsAndCompile();
                ifJustAddedFocusFirstParam();
                registerFuncControlsToggle();
                registerFuncControlsActions();
            }
            relink();
        },
    };
}
angular__WEBPACK_IMPORTED_MODULE_0___default.a.module('grafana.directives').directive('graphiteFuncEditor', graphiteFuncEditor);


/***/ }),

/***/ "./public/app/plugins/datasource/prometheus/datasource.ts":
/*!****************************************************************!*\
  !*** ./public/app/plugins/datasource/prometheus/datasource.ts ***!
  \****************************************************************/
/*! exports provided: alignRange, prometheusRegularEscape, prometheusSpecialRegexEscape, PrometheusDatasource */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "alignRange", function() { return alignRange; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "prometheusRegularEscape", function() { return prometheusRegularEscape; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "prometheusSpecialRegexEscape", function() { return prometheusSpecialRegexEscape; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PrometheusDatasource", function() { return PrometheusDatasource; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! app/core/utils/kbn */ "./public/app/core/utils/kbn.ts");
/* harmony import */ var app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! app/core/utils/datemath */ "./public/app/core/utils/datemath.ts");
/* harmony import */ var _metric_find_query__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./metric_find_query */ "./public/app/plugins/datasource/prometheus/metric_find_query.ts");
/* harmony import */ var _result_transformer__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./result_transformer */ "./public/app/plugins/datasource/prometheus/result_transformer.ts");







function alignRange(start, end, step) {
    var alignedEnd = Math.ceil(end / step) * step;
    var alignedStart = Math.floor(start / step) * step;
    return {
        end: alignedEnd,
        start: alignedStart,
    };
}
function prometheusRegularEscape(value) {
    if (typeof value === 'string') {
        return value.replace(/'/g, "\\\\'");
    }
    return value;
}
function prometheusSpecialRegexEscape(value) {
    if (typeof value === 'string') {
        return prometheusRegularEscape(value.replace(/\\/g, '\\\\\\\\').replace(/[$^*{}\[\]+?.()]/g, '\\\\$&'));
    }
    return value;
}
var PrometheusDatasource = /** @class */ (function () {
    /** @ngInject */
    function PrometheusDatasource(instanceSettings, $q, backendSrv, templateSrv, timeSrv) {
        this.$q = $q;
        this.backendSrv = backendSrv;
        this.templateSrv = templateSrv;
        this.timeSrv = timeSrv;
        this.type = 'prometheus';
        this.editorSrc = 'app/features/prometheus/partials/query.editor.html';
        this.name = instanceSettings.name;
        this.supportsExplore = true;
        this.supportMetrics = true;
        this.url = instanceSettings.url;
        this.directUrl = instanceSettings.directUrl;
        this.basicAuth = instanceSettings.basicAuth;
        this.withCredentials = instanceSettings.withCredentials;
        this.interval = instanceSettings.jsonData.timeInterval || '15s';
        this.queryTimeout = instanceSettings.jsonData.queryTimeout;
        this.httpMethod = instanceSettings.jsonData.httpMethod || 'GET';
        this.resultTransformer = new _result_transformer__WEBPACK_IMPORTED_MODULE_6__["ResultTransformer"](templateSrv);
    }
    PrometheusDatasource.prototype._request = function (url, data, options) {
        var options = tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({ url: this.url + url, method: this.httpMethod }, options);
        if (options.method === 'GET') {
            if (!lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isEmpty(data)) {
                options.url =
                    options.url +
                        '?' +
                        lodash__WEBPACK_IMPORTED_MODULE_1___default.a.map(data, function (v, k) {
                            return encodeURIComponent(k) + '=' + encodeURIComponent(v);
                        }).join('&');
            }
        }
        else {
            options.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
            options.transformRequest = function (data) {
                return jquery__WEBPACK_IMPORTED_MODULE_2___default.a.param(data);
            };
            options.data = data;
        }
        if (this.basicAuth || this.withCredentials) {
            options.withCredentials = true;
        }
        if (this.basicAuth) {
            options.headers = {
                Authorization: this.basicAuth,
            };
        }
        return this.backendSrv.datasourceRequest(options);
    };
    // Use this for tab completion features, wont publish response to other components
    PrometheusDatasource.prototype.metadataRequest = function (url) {
        return this._request(url, null, { method: 'GET', silent: true });
    };
    PrometheusDatasource.prototype.interpolateQueryExpr = function (value, variable, defaultFormatFn) {
        // if no multi or include all do not regexEscape
        if (!variable.multi && !variable.includeAll) {
            return prometheusRegularEscape(value);
        }
        if (typeof value === 'string') {
            return prometheusSpecialRegexEscape(value);
        }
        var escapedValues = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.map(value, prometheusSpecialRegexEscape);
        return escapedValues.join('|');
    };
    PrometheusDatasource.prototype.targetContainsTemplate = function (target) {
        return this.templateSrv.variableExists(target.expr);
    };
    PrometheusDatasource.prototype.query = function (options) {
        var _this = this;
        var start = this.getPrometheusTime(options.range.from, false);
        var end = this.getPrometheusTime(options.range.to, true);
        var queries = [];
        var activeTargets = [];
        options = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.clone(options);
        for (var _i = 0, _a = options.targets; _i < _a.length; _i++) {
            var target = _a[_i];
            if (!target.expr || target.hide) {
                continue;
            }
            activeTargets.push(target);
            queries.push(this.createQuery(target, options, start, end));
        }
        // No valid targets, return the empty result to save a round trip.
        if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isEmpty(queries)) {
            return this.$q.when({ data: [] });
        }
        var allQueryPromise = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.map(queries, function (query) {
            if (!query.instant) {
                return _this.performTimeSeriesQuery(query, query.start, query.end);
            }
            else {
                return _this.performInstantQuery(query, end);
            }
        });
        return this.$q.all(allQueryPromise).then(function (responseList) {
            var result = [];
            lodash__WEBPACK_IMPORTED_MODULE_1___default.a.each(responseList, function (response, index) {
                if (response.status === 'error') {
                    throw response.error;
                }
                // Keeping original start/end for transformers
                var transformerOptions = {
                    format: activeTargets[index].format,
                    step: queries[index].step,
                    legendFormat: activeTargets[index].legendFormat,
                    start: queries[index].start,
                    end: queries[index].end,
                    query: queries[index].expr,
                    responseListLength: responseList.length,
                    responseIndex: index,
                    refId: activeTargets[index].refId,
                };
                _this.resultTransformer.transform(result, response, transformerOptions);
            });
            return { data: result };
        });
    };
    PrometheusDatasource.prototype.createQuery = function (target, options, start, end) {
        var query = {};
        query.instant = target.instant;
        var range = Math.ceil(end - start);
        var interval = app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_3__["default"].interval_to_seconds(options.interval);
        // Minimum interval ("Min step"), if specified for the query. or same as interval otherwise
        var minInterval = app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_3__["default"].interval_to_seconds(this.templateSrv.replace(target.interval, options.scopedVars) || options.interval);
        var intervalFactor = target.intervalFactor || 1;
        // Adjust the interval to take into account any specified minimum and interval factor plus Prometheus limits
        var adjustedInterval = this.adjustInterval(interval, minInterval, range, intervalFactor);
        var scopedVars = tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, options.scopedVars, this.getRangeScopedVars());
        // If the interval was adjusted, make a shallow copy of scopedVars with updated interval vars
        if (interval !== adjustedInterval) {
            interval = adjustedInterval;
            scopedVars = Object.assign({}, options.scopedVars, tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({ __interval: { text: interval + 's', value: interval + 's' }, __interval_ms: { text: interval * 1000, value: interval * 1000 } }, this.getRangeScopedVars()));
        }
        query.step = interval;
        // Only replace vars in expression after having (possibly) updated interval vars
        query.expr = this.templateSrv.replace(target.expr, scopedVars, this.interpolateQueryExpr);
        query.requestId = options.panelId + target.refId;
        // Align query interval with step
        var adjusted = alignRange(start, end, query.step);
        query.start = adjusted.start;
        query.end = adjusted.end;
        return query;
    };
    PrometheusDatasource.prototype.adjustInterval = function (interval, minInterval, range, intervalFactor) {
        // Prometheus will drop queries that might return more than 11000 data points.
        // Calibrate interval if it is too small.
        if (interval !== 0 && range / intervalFactor / interval > 11000) {
            interval = Math.ceil(range / intervalFactor / 11000);
        }
        return Math.max(interval * intervalFactor, minInterval, 1);
    };
    PrometheusDatasource.prototype.performTimeSeriesQuery = function (query, start, end) {
        if (start > end) {
            throw { message: 'Invalid time range' };
        }
        var url = '/api/v1/query_range';
        var data = {
            query: query.expr,
            start: start,
            end: end,
            step: query.step,
        };
        if (this.queryTimeout) {
            data['timeout'] = this.queryTimeout;
        }
        return this._request(url, data, { requestId: query.requestId });
    };
    PrometheusDatasource.prototype.performInstantQuery = function (query, time) {
        var url = '/api/v1/query';
        var data = {
            query: query.expr,
            time: time,
        };
        if (this.queryTimeout) {
            data['timeout'] = this.queryTimeout;
        }
        return this._request(url, data, { requestId: query.requestId });
    };
    PrometheusDatasource.prototype.performSuggestQuery = function (query, cache) {
        var _this = this;
        if (cache === void 0) { cache = false; }
        var url = '/api/v1/label/__name__/values';
        if (cache && this.metricsNameCache && this.metricsNameCache.expire > Date.now()) {
            return this.$q.when(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.filter(this.metricsNameCache.data, function (metricName) {
                return metricName.indexOf(query) !== 1;
            }));
        }
        return this.metadataRequest(url).then(function (result) {
            _this.metricsNameCache = {
                data: result.data.data,
                expire: Date.now() + 60 * 1000,
            };
            return lodash__WEBPACK_IMPORTED_MODULE_1___default.a.filter(result.data.data, function (metricName) {
                return metricName.indexOf(query) !== 1;
            });
        });
    };
    PrometheusDatasource.prototype.metricFindQuery = function (query) {
        if (!query) {
            return this.$q.when([]);
        }
        var scopedVars = tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({ __interval: { text: this.interval, value: this.interval }, __interval_ms: { text: app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_3__["default"].interval_to_ms(this.interval), value: app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_3__["default"].interval_to_ms(this.interval) } }, this.getRangeScopedVars());
        var interpolated = this.templateSrv.replace(query, scopedVars, this.interpolateQueryExpr);
        var metricFindQuery = new _metric_find_query__WEBPACK_IMPORTED_MODULE_5__["default"](this, interpolated, this.timeSrv);
        return metricFindQuery.process();
    };
    PrometheusDatasource.prototype.getRangeScopedVars = function () {
        var range = this.timeSrv.timeRange();
        var msRange = range.to.diff(range.from);
        var regularRange = app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_3__["default"].secondsToHms(msRange / 1000);
        return {
            __range_ms: { text: msRange, value: msRange },
            __range: { text: regularRange, value: regularRange },
        };
    };
    PrometheusDatasource.prototype.annotationQuery = function (options) {
        var annotation = options.annotation;
        var expr = annotation.expr || '';
        var tagKeys = annotation.tagKeys || '';
        var titleFormat = annotation.titleFormat || '';
        var textFormat = annotation.textFormat || '';
        if (!expr) {
            return this.$q.when([]);
        }
        var step = annotation.step || '60s';
        var start = this.getPrometheusTime(options.range.from, false);
        var end = this.getPrometheusTime(options.range.to, true);
        // Unsetting min interval
        var queryOptions = tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, options, { interval: '0s' });
        var query = this.createQuery({ expr: expr, interval: step }, queryOptions, start, end);
        var self = this;
        return this.performTimeSeriesQuery(query, query.start, query.end).then(function (results) {
            var eventList = [];
            tagKeys = tagKeys.split(',');
            lodash__WEBPACK_IMPORTED_MODULE_1___default.a.each(results.data.data.result, function (series) {
                var tags = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.chain(series.metric)
                    .filter(function (v, k) {
                    return lodash__WEBPACK_IMPORTED_MODULE_1___default.a.includes(tagKeys, k);
                })
                    .value();
                for (var _i = 0, _a = series.values; _i < _a.length; _i++) {
                    var value = _a[_i];
                    if (value[1] === '1') {
                        var event = {
                            annotation: annotation,
                            time: Math.floor(parseFloat(value[0])) * 1000,
                            title: self.resultTransformer.renderTemplate(titleFormat, series.metric),
                            tags: tags,
                            text: self.resultTransformer.renderTemplate(textFormat, series.metric),
                        };
                        eventList.push(event);
                    }
                }
            });
            return eventList;
        });
    };
    PrometheusDatasource.prototype.testDatasource = function () {
        var now = new Date().getTime();
        return this.performInstantQuery({ expr: '1+1' }, now / 1000).then(function (response) {
            if (response.data.status === 'success') {
                return { status: 'success', message: 'Data source is working' };
            }
            else {
                return { status: 'error', message: response.error };
            }
        });
    };
    PrometheusDatasource.prototype.getExploreState = function (panel) {
        var _this = this;
        var state = {};
        if (panel.targets) {
            var queries = panel.targets.map(function (t) { return ({
                query: _this.templateSrv.replace(t.expr, {}, _this.interpolateQueryExpr),
                format: t.format,
            }); });
            state = tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, state, { queries: queries, datasource: this.name });
        }
        return state;
    };
    PrometheusDatasource.prototype.getPrometheusTime = function (date, roundUp) {
        if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isString(date)) {
            date = app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_4__["parse"](date, roundUp);
        }
        return Math.ceil(date.valueOf() / 1000);
    };
    PrometheusDatasource.prototype.getOriginalMetricName = function (labelData) {
        return this.resultTransformer.getOriginalMetricName(labelData);
    };
    return PrometheusDatasource;
}());



/***/ }),

/***/ "./public/app/plugins/panel/graph/graph.ts":
/*!*************************************************!*\
  !*** ./public/app/plugins/panel/graph/graph.ts ***!
  \*************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var vendor_flot_jquery_flot__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vendor/flot/jquery.flot */ "./public/vendor/flot/jquery.flot.js");
/* harmony import */ var vendor_flot_jquery_flot__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vendor_flot_jquery_flot__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var vendor_flot_jquery_flot_selection__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vendor/flot/jquery.flot.selection */ "./public/vendor/flot/jquery.flot.selection.js");
/* harmony import */ var vendor_flot_jquery_flot_selection__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(vendor_flot_jquery_flot_selection__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var vendor_flot_jquery_flot_time__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! vendor/flot/jquery.flot.time */ "./public/vendor/flot/jquery.flot.time.js");
/* harmony import */ var vendor_flot_jquery_flot_time__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(vendor_flot_jquery_flot_time__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var vendor_flot_jquery_flot_stack__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! vendor/flot/jquery.flot.stack */ "./public/vendor/flot/jquery.flot.stack.js");
/* harmony import */ var vendor_flot_jquery_flot_stack__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(vendor_flot_jquery_flot_stack__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var vendor_flot_jquery_flot_stackpercent__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! vendor/flot/jquery.flot.stackpercent */ "./public/vendor/flot/jquery.flot.stackpercent.js");
/* harmony import */ var vendor_flot_jquery_flot_stackpercent__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(vendor_flot_jquery_flot_stackpercent__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var vendor_flot_jquery_flot_fillbelow__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! vendor/flot/jquery.flot.fillbelow */ "./public/vendor/flot/jquery.flot.fillbelow.js");
/* harmony import */ var vendor_flot_jquery_flot_fillbelow__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(vendor_flot_jquery_flot_fillbelow__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var vendor_flot_jquery_flot_crosshair__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! vendor/flot/jquery.flot.crosshair */ "./public/vendor/flot/jquery.flot.crosshair.js");
/* harmony import */ var vendor_flot_jquery_flot_crosshair__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(vendor_flot_jquery_flot_crosshair__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var vendor_flot_jquery_flot_dashes__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! vendor/flot/jquery.flot.dashes */ "./public/vendor/flot/jquery.flot.dashes.js");
/* harmony import */ var vendor_flot_jquery_flot_dashes__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(vendor_flot_jquery_flot_dashes__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _jquery_flot_events__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./jquery.flot.events */ "./public/app/plugins/panel/graph/jquery.flot.events.ts");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! moment */ "./node_modules/moment/moment.js");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! app/core/utils/kbn */ "./public/app/core/utils/kbn.ts");
/* harmony import */ var app_core_utils_ticks__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! app/core/utils/ticks */ "./public/app/core/utils/ticks.ts");
/* harmony import */ var app_core_core__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! app/core/core */ "./public/app/core/core.ts");
/* harmony import */ var _graph_tooltip__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./graph_tooltip */ "./public/app/plugins/panel/graph/graph_tooltip.ts");
/* harmony import */ var _threshold_manager__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./threshold_manager */ "./public/app/plugins/panel/graph/threshold_manager.ts");
/* harmony import */ var app_features_annotations_all__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! app/features/annotations/all */ "./public/app/features/annotations/all.ts");
/* harmony import */ var _histogram__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./histogram */ "./public/app/plugins/panel/graph/histogram.ts");
/* harmony import */ var _align_yaxes__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./align_yaxes */ "./public/app/plugins/panel/graph/align_yaxes.ts");
/* harmony import */ var app_core_config__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! app/core/config */ "./public/app/core/config.ts");





















/** @ngInject **/
function graphDirective(timeSrv, popoverSrv, contextSrv) {
    return {
        restrict: 'A',
        template: '',
        link: function (scope, elem) {
            var ctrl = scope.ctrl;
            var dashboard = ctrl.dashboard;
            var panel = ctrl.panel;
            var annotations = [];
            var data;
            var plot;
            var sortedSeries;
            var panelWidth = 0;
            var eventManager = new app_features_annotations_all__WEBPACK_IMPORTED_MODULE_17__["EventManager"](ctrl);
            var thresholdManager = new _threshold_manager__WEBPACK_IMPORTED_MODULE_16__["ThresholdManager"](ctrl);
            var tooltip = new _graph_tooltip__WEBPACK_IMPORTED_MODULE_15__["default"](elem, dashboard, scope, function () {
                return sortedSeries;
            });
            // panel events
            ctrl.events.on('panel-teardown', function () {
                thresholdManager = null;
                if (plot) {
                    plot.destroy();
                    plot = null;
                }
            });
            /**
             * Split graph rendering into two parts.
             * First, calculate series stats in buildFlotPairs() function. Then legend rendering started
             * (see ctrl.events.on('render') in legend.ts).
             * When legend is rendered it emits 'legend-rendering-complete' and graph rendered.
             */
            ctrl.events.on('render', function (renderData) {
                data = renderData || data;
                if (!data) {
                    return;
                }
                annotations = ctrl.annotations || [];
                buildFlotPairs(data);
                var graphHeight = elem.height();
                Object(app_core_core__WEBPACK_IMPORTED_MODULE_14__["updateLegendValues"])(data, panel, graphHeight);
                ctrl.events.emit('render-legend');
            });
            ctrl.events.on('legend-rendering-complete', function () {
                render_panel();
            });
            // global events
            app_core_core__WEBPACK_IMPORTED_MODULE_14__["appEvents"].on('graph-hover', function (evt) {
                // ignore other graph hover events if shared tooltip is disabled
                if (!dashboard.sharedTooltipModeEnabled()) {
                    return;
                }
                // ignore if we are the emitter
                if (!plot || evt.panel.id === panel.id || ctrl.otherPanelInFullscreenMode()) {
                    return;
                }
                tooltip.show(evt.pos);
            }, scope);
            app_core_core__WEBPACK_IMPORTED_MODULE_14__["appEvents"].on('graph-hover-clear', function (event, info) {
                if (plot) {
                    tooltip.clear(plot);
                }
            }, scope);
            function shouldAbortRender() {
                if (!data) {
                    return true;
                }
                if (panelWidth === 0) {
                    return true;
                }
                return false;
            }
            function drawHook(plot) {
                // add left axis labels
                if (panel.yaxes[0].label && panel.yaxes[0].show) {
                    jquery__WEBPACK_IMPORTED_MODULE_9___default()("<div class='axisLabel left-yaxis-label flot-temp-elem'></div>")
                        .text(panel.yaxes[0].label)
                        .appendTo(elem);
                }
                // add right axis labels
                if (panel.yaxes[1].label && panel.yaxes[1].show) {
                    jquery__WEBPACK_IMPORTED_MODULE_9___default()("<div class='axisLabel right-yaxis-label flot-temp-elem'></div>")
                        .text(panel.yaxes[1].label)
                        .appendTo(elem);
                }
                if (ctrl.dataWarning) {
                    jquery__WEBPACK_IMPORTED_MODULE_9___default()("<div class=\"datapoints-warning flot-temp-elem\">" + ctrl.dataWarning.title + "</div>").appendTo(elem);
                }
                thresholdManager.draw(plot);
            }
            function processOffsetHook(plot, gridMargin) {
                var left = panel.yaxes[0];
                var right = panel.yaxes[1];
                if (left.show && left.label) {
                    gridMargin.left = 20;
                }
                if (right.show && right.label) {
                    gridMargin.right = 20;
                }
                // apply y-axis min/max options
                var yaxis = plot.getYAxes();
                for (var i = 0; i < yaxis.length; i++) {
                    var axis = yaxis[i];
                    var panelOptions = panel.yaxes[i];
                    axis.options.max = axis.options.max !== null ? axis.options.max : panelOptions.max;
                    axis.options.min = axis.options.min !== null ? axis.options.min : panelOptions.min;
                }
            }
            function processRangeHook(plot) {
                var yAxes = plot.getYAxes();
                var align = panel.yaxis.align || false;
                if (yAxes.length > 1 && align === true) {
                    var level = panel.yaxis.alignLevel || 0;
                    Object(_align_yaxes__WEBPACK_IMPORTED_MODULE_19__["alignYLevel"])(yAxes, parseFloat(level));
                }
            }
            // Series could have different timeSteps,
            // let's find the smallest one so that bars are correctly rendered.
            // In addition, only take series which are rendered as bars for this.
            function getMinTimeStepOfSeries(data) {
                var min = Number.MAX_VALUE;
                for (var i = 0; i < data.length; i++) {
                    if (!data[i].stats.timeStep) {
                        continue;
                    }
                    if (panel.bars) {
                        if (data[i].bars && data[i].bars.show === false) {
                            continue;
                        }
                    }
                    else {
                        if (typeof data[i].bars === 'undefined' || typeof data[i].bars.show === 'undefined' || !data[i].bars.show) {
                            continue;
                        }
                    }
                    if (data[i].stats.timeStep < min) {
                        min = data[i].stats.timeStep;
                    }
                }
                return min;
            }
            // Function for rendering panel
            function render_panel() {
                panelWidth = elem.width();
                if (shouldAbortRender()) {
                    return;
                }
                // give space to alert editing
                thresholdManager.prepare(elem, data);
                // un-check dashes if lines are unchecked
                panel.dashes = panel.lines ? panel.dashes : false;
                // Populate element
                var options = buildFlotOptions(panel);
                prepareXAxis(options, panel);
                configureYAxisOptions(data, options);
                thresholdManager.addFlotOptions(options, panel);
                eventManager.addFlotEvents(annotations, options);
                sortedSeries = sortSeries(data, panel);
                callPlot(options, true);
            }
            function buildFlotPairs(data) {
                for (var i = 0; i < data.length; i++) {
                    var series = data[i];
                    series.data = series.getFlotPairs(series.nullPointMode || panel.nullPointMode);
                    // if hidden remove points and disable stack
                    if (ctrl.hiddenSeries[series.alias]) {
                        series.data = [];
                        series.stack = false;
                    }
                }
            }
            function prepareXAxis(options, panel) {
                switch (panel.xaxis.mode) {
                    case 'series': {
                        options.series.bars.barWidth = 0.7;
                        options.series.bars.align = 'center';
                        for (var i = 0; i < data.length; i++) {
                            var series = data[i];
                            series.data = [[i + 1, series.stats[panel.xaxis.values[0]]]];
                        }
                        addXSeriesAxis(options);
                        break;
                    }
                    case 'histogram': {
                        var bucketSize = void 0;
                        if (data.length) {
                            var histMin = lodash__WEBPACK_IMPORTED_MODULE_10___default.a.min(lodash__WEBPACK_IMPORTED_MODULE_10___default.a.map(data, function (s) { return s.stats.min; }));
                            var histMax = lodash__WEBPACK_IMPORTED_MODULE_10___default.a.max(lodash__WEBPACK_IMPORTED_MODULE_10___default.a.map(data, function (s) { return s.stats.max; }));
                            var ticks = panel.xaxis.buckets || panelWidth / 50;
                            bucketSize = Object(app_core_utils_ticks__WEBPACK_IMPORTED_MODULE_13__["tickStep"])(histMin, histMax, ticks);
                            options.series.bars.barWidth = bucketSize * 0.8;
                            data = Object(_histogram__WEBPACK_IMPORTED_MODULE_18__["convertToHistogramData"])(data, bucketSize, ctrl.hiddenSeries, histMin, histMax);
                        }
                        else {
                            bucketSize = 0;
                        }
                        addXHistogramAxis(options, bucketSize);
                        break;
                    }
                    case 'table': {
                        options.series.bars.barWidth = 0.7;
                        options.series.bars.align = 'center';
                        addXTableAxis(options);
                        break;
                    }
                    default: {
                        options.series.bars.barWidth = getMinTimeStepOfSeries(data) / 1.5;
                        addTimeAxis(options);
                        break;
                    }
                }
            }
            function callPlot(options, incrementRenderCounter) {
                try {
                    plot = jquery__WEBPACK_IMPORTED_MODULE_9___default.a.plot(elem, sortedSeries, options);
                    if (ctrl.renderError) {
                        delete ctrl.error;
                        delete ctrl.inspector;
                    }
                }
                catch (e) {
                    console.log('flotcharts error', e);
                    ctrl.error = e.message || 'Render Error';
                    ctrl.renderError = true;
                    ctrl.inspector = { error: e };
                }
                if (incrementRenderCounter) {
                    ctrl.renderingCompleted();
                }
            }
            function buildFlotOptions(panel) {
                var gridColor = '#c8c8c8';
                if (app_core_config__WEBPACK_IMPORTED_MODULE_20__["default"].bootData.user.lightTheme === true) {
                    gridColor = '#a1a1a1';
                }
                var stack = panel.stack ? true : null;
                var options = {
                    hooks: {
                        draw: [drawHook],
                        processOffset: [processOffsetHook],
                        processRange: [processRangeHook],
                    },
                    legend: { show: false },
                    series: {
                        stackpercent: panel.stack ? panel.percentage : false,
                        stack: panel.percentage ? null : stack,
                        lines: {
                            show: panel.lines,
                            zero: false,
                            fill: translateFillOption(panel.fill),
                            lineWidth: panel.dashes ? 0 : panel.linewidth,
                            steps: panel.steppedLine,
                        },
                        dashes: {
                            show: panel.dashes,
                            lineWidth: panel.linewidth,
                            dashLength: [panel.dashLength, panel.spaceLength],
                        },
                        bars: {
                            show: panel.bars,
                            fill: 1,
                            barWidth: 1,
                            zero: false,
                            lineWidth: 0,
                        },
                        points: {
                            show: panel.points,
                            fill: 1,
                            fillColor: false,
                            radius: panel.points ? panel.pointradius : 2,
                        },
                        shadowSize: 0,
                    },
                    yaxes: [],
                    xaxis: {},
                    grid: {
                        minBorderMargin: 0,
                        markings: [],
                        backgroundColor: null,
                        borderWidth: 0,
                        hoverable: true,
                        clickable: true,
                        color: gridColor,
                        margin: { left: 0, right: 0 },
                        labelMarginX: 0,
                    },
                    selection: {
                        mode: 'x',
                        color: '#666',
                    },
                    crosshair: {
                        mode: 'x',
                    },
                };
                return options;
            }
            function sortSeries(series, panel) {
                var sortBy = panel.legend.sort;
                var sortOrder = panel.legend.sortDesc;
                var haveSortBy = sortBy !== null && sortBy !== undefined;
                var haveSortOrder = sortOrder !== null && sortOrder !== undefined;
                var shouldSortBy = panel.stack && haveSortBy && haveSortOrder;
                var sortDesc = panel.legend.sortDesc === true ? -1 : 1;
                if (shouldSortBy) {
                    return lodash__WEBPACK_IMPORTED_MODULE_10___default.a.sortBy(series, function (s) { return s.stats[sortBy] * sortDesc; });
                }
                else {
                    return lodash__WEBPACK_IMPORTED_MODULE_10___default.a.sortBy(series, function (s) { return s.zindex; });
                }
            }
            function translateFillOption(fill) {
                if (panel.percentage && panel.stack) {
                    return fill === 0 ? 0.001 : fill / 10;
                }
                else {
                    return fill / 10;
                }
            }
            function addTimeAxis(options) {
                var ticks = panelWidth / 100;
                var min = lodash__WEBPACK_IMPORTED_MODULE_10___default.a.isUndefined(ctrl.range.from) ? null : ctrl.range.from.valueOf();
                var max = lodash__WEBPACK_IMPORTED_MODULE_10___default.a.isUndefined(ctrl.range.to) ? null : ctrl.range.to.valueOf();
                options.xaxis = {
                    timezone: dashboard.getTimezone(),
                    show: panel.xaxis.show,
                    mode: 'time',
                    min: min,
                    max: max,
                    label: 'Datetime',
                    ticks: ticks,
                    timeformat: time_format(ticks, min, max),
                };
            }
            function addXSeriesAxis(options) {
                var ticks = lodash__WEBPACK_IMPORTED_MODULE_10___default.a.map(data, function (series, index) {
                    return [index + 1, series.alias];
                });
                options.xaxis = {
                    timezone: dashboard.getTimezone(),
                    show: panel.xaxis.show,
                    mode: null,
                    min: 0,
                    max: ticks.length + 1,
                    label: 'Datetime',
                    ticks: ticks,
                };
            }
            function addXHistogramAxis(options, bucketSize) {
                var ticks, min, max;
                var defaultTicks = panelWidth / 50;
                if (data.length && bucketSize) {
                    var tick_values = [];
                    for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                        var d = data_1[_i];
                        for (var _a = 0, _b = d.data; _a < _b.length; _a++) {
                            var point = _b[_a];
                            tick_values[point[0]] = true;
                        }
                    }
                    ticks = Object.keys(tick_values).map(function (v) { return Number(v); });
                    min = lodash__WEBPACK_IMPORTED_MODULE_10___default.a.min(ticks);
                    max = lodash__WEBPACK_IMPORTED_MODULE_10___default.a.max(ticks);
                    // Adjust tick step
                    var tickStep_1 = bucketSize;
                    var ticks_num = Math.floor((max - min) / tickStep_1);
                    while (ticks_num > defaultTicks) {
                        tickStep_1 = tickStep_1 * 2;
                        ticks_num = Math.ceil((max - min) / tickStep_1);
                    }
                    // Expand ticks for pretty view
                    min = Math.floor(min / tickStep_1) * tickStep_1;
                    // 1.01 is 101% - ensure we have enough space for last bar
                    max = Math.ceil(max * 1.01 / tickStep_1) * tickStep_1;
                    ticks = [];
                    for (var i = min; i <= max; i += tickStep_1) {
                        ticks.push(i);
                    }
                }
                else {
                    // Set defaults if no data
                    ticks = defaultTicks / 2;
                    min = 0;
                    max = 1;
                }
                options.xaxis = {
                    timezone: dashboard.getTimezone(),
                    show: panel.xaxis.show,
                    mode: null,
                    min: min,
                    max: max,
                    label: 'Histogram',
                    ticks: ticks,
                };
                // Use 'short' format for histogram values
                configureAxisMode(options.xaxis, 'short');
            }
            function addXTableAxis(options) {
                var ticks = lodash__WEBPACK_IMPORTED_MODULE_10___default.a.map(data, function (series, seriesIndex) {
                    return lodash__WEBPACK_IMPORTED_MODULE_10___default.a.map(series.datapoints, function (point, pointIndex) {
                        var tickIndex = seriesIndex * series.datapoints.length + pointIndex;
                        return [tickIndex + 1, point[1]];
                    });
                });
                ticks = lodash__WEBPACK_IMPORTED_MODULE_10___default.a.flatten(ticks, true);
                options.xaxis = {
                    timezone: dashboard.getTimezone(),
                    show: panel.xaxis.show,
                    mode: null,
                    min: 0,
                    max: ticks.length + 1,
                    label: 'Datetime',
                    ticks: ticks,
                };
            }
            function configureYAxisOptions(data, options) {
                var defaults = {
                    position: 'left',
                    show: panel.yaxes[0].show,
                    index: 1,
                    logBase: panel.yaxes[0].logBase || 1,
                    min: parseNumber(panel.yaxes[0].min),
                    max: parseNumber(panel.yaxes[0].max),
                    tickDecimals: panel.yaxes[0].decimals,
                };
                options.yaxes.push(defaults);
                if (lodash__WEBPACK_IMPORTED_MODULE_10___default.a.find(data, { yaxis: 2 })) {
                    var secondY = lodash__WEBPACK_IMPORTED_MODULE_10___default.a.clone(defaults);
                    secondY.index = 2;
                    secondY.show = panel.yaxes[1].show;
                    secondY.logBase = panel.yaxes[1].logBase || 1;
                    secondY.position = 'right';
                    secondY.min = parseNumber(panel.yaxes[1].min);
                    secondY.max = parseNumber(panel.yaxes[1].max);
                    secondY.tickDecimals = panel.yaxes[1].decimals;
                    options.yaxes.push(secondY);
                    applyLogScale(options.yaxes[1], data);
                    configureAxisMode(options.yaxes[1], panel.percentage && panel.stack ? 'percent' : panel.yaxes[1].format);
                }
                applyLogScale(options.yaxes[0], data);
                configureAxisMode(options.yaxes[0], panel.percentage && panel.stack ? 'percent' : panel.yaxes[0].format);
            }
            function parseNumber(value) {
                if (value === null || typeof value === 'undefined') {
                    return null;
                }
                return lodash__WEBPACK_IMPORTED_MODULE_10___default.a.toNumber(value);
            }
            function applyLogScale(axis, data) {
                if (axis.logBase === 1) {
                    return;
                }
                var minSetToZero = axis.min === 0;
                if (axis.min < Number.MIN_VALUE) {
                    axis.min = null;
                }
                if (axis.max < Number.MIN_VALUE) {
                    axis.max = null;
                }
                var series, i;
                var max = axis.max, min = axis.min;
                for (i = 0; i < data.length; i++) {
                    series = data[i];
                    if (series.yaxis === axis.index) {
                        if (!max || max < series.stats.max) {
                            max = series.stats.max;
                        }
                        if (!min || min > series.stats.logmin) {
                            min = series.stats.logmin;
                        }
                    }
                }
                axis.transform = function (v) {
                    return v < Number.MIN_VALUE ? null : Math.log(v) / Math.log(axis.logBase);
                };
                axis.inverseTransform = function (v) {
                    return Math.pow(axis.logBase, v);
                };
                if (!max && !min) {
                    max = axis.inverseTransform(+2);
                    min = axis.inverseTransform(-2);
                }
                else if (!max) {
                    max = min * axis.inverseTransform(+4);
                }
                else if (!min) {
                    min = max * axis.inverseTransform(-4);
                }
                if (axis.min) {
                    min = axis.inverseTransform(Math.ceil(axis.transform(axis.min)));
                }
                else {
                    min = axis.min = axis.inverseTransform(Math.floor(axis.transform(min)));
                }
                if (axis.max) {
                    max = axis.inverseTransform(Math.floor(axis.transform(axis.max)));
                }
                else {
                    max = axis.max = axis.inverseTransform(Math.ceil(axis.transform(max)));
                }
                if (!min || min < Number.MIN_VALUE || !max || max < Number.MIN_VALUE) {
                    return;
                }
                if (Number.isFinite(min) && Number.isFinite(max)) {
                    if (minSetToZero) {
                        axis.min = 0.1;
                        min = 1;
                    }
                    axis.ticks = generateTicksForLogScaleYAxis(min, max, axis.logBase);
                    if (minSetToZero) {
                        axis.ticks.unshift(0.1);
                    }
                    if (axis.ticks[axis.ticks.length - 1] > axis.max) {
                        axis.max = axis.ticks[axis.ticks.length - 1];
                    }
                }
                else {
                    axis.ticks = [1, 2];
                    delete axis.min;
                    delete axis.max;
                }
            }
            function generateTicksForLogScaleYAxis(min, max, logBase) {
                var ticks = [];
                var nextTick;
                for (nextTick = min; nextTick <= max; nextTick *= logBase) {
                    ticks.push(nextTick);
                }
                var maxNumTicks = Math.ceil(ctrl.height / 25);
                var numTicks = ticks.length;
                if (numTicks > maxNumTicks) {
                    var factor = Math.ceil(numTicks / maxNumTicks) * logBase;
                    ticks = [];
                    for (nextTick = min; nextTick <= max * factor; nextTick *= factor) {
                        ticks.push(nextTick);
                    }
                }
                return ticks;
            }
            function configureAxisMode(axis, format) {
                axis.tickFormatter = function (val, axis) {
                    if (!app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_12__["default"].valueFormats[format]) {
                        throw new Error("Unit '" + format + "' is not supported");
                    }
                    return app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_12__["default"].valueFormats[format](val, axis.tickDecimals, axis.scaledDecimals);
                };
            }
            function time_format(ticks, min, max) {
                if (min && max && ticks) {
                    var range = max - min;
                    var secPerTick = range / ticks / 1000;
                    var oneDay = 86400000;
                    var oneYear = 31536000000;
                    if (secPerTick <= 45) {
                        return '%H:%M:%S';
                    }
                    if (secPerTick <= 7200 || range <= oneDay) {
                        return '%H:%M';
                    }
                    if (secPerTick <= 80000) {
                        return '%m/%d %H:%M';
                    }
                    if (secPerTick <= 2419200 || range <= oneYear) {
                        return '%m/%d';
                    }
                    return '%Y-%m';
                }
                return '%H:%M';
            }
            elem.bind('plotselected', function (event, ranges) {
                if (panel.xaxis.mode !== 'time') {
                    // Skip if panel in histogram or series mode
                    plot.clearSelection();
                    return;
                }
                if ((ranges.ctrlKey || ranges.metaKey) && (dashboard.meta.canEdit || dashboard.meta.canMakeEditable)) {
                    // Add annotation
                    setTimeout(function () {
                        eventManager.updateTime(ranges.xaxis);
                    }, 100);
                }
                else {
                    scope.$apply(function () {
                        timeSrv.setTime({
                            from: moment__WEBPACK_IMPORTED_MODULE_11___default.a.utc(ranges.xaxis.from),
                            to: moment__WEBPACK_IMPORTED_MODULE_11___default.a.utc(ranges.xaxis.to),
                        });
                    });
                }
            });
            elem.bind('plotclick', function (event, pos, item) {
                if (panel.xaxis.mode !== 'time') {
                    // Skip if panel in histogram or series mode
                    return;
                }
                if ((pos.ctrlKey || pos.metaKey) && (dashboard.meta.canEdit || dashboard.meta.canMakeEditable)) {
                    // Skip if range selected (added in "plotselected" event handler)
                    var isRangeSelection = pos.x !== pos.x1;
                    if (!isRangeSelection) {
                        setTimeout(function () {
                            eventManager.updateTime({ from: pos.x, to: null });
                        }, 100);
                    }
                }
            });
            scope.$on('$destroy', function () {
                tooltip.destroy();
                elem.off();
                elem.remove();
            });
        },
    };
}
app_core_core__WEBPACK_IMPORTED_MODULE_14__["coreModule"].directive('grafanaGraph', graphDirective);


/***/ }),

/***/ "./public/app/plugins/panel/graph/graph_tooltip.ts":
/*!*********************************************************!*\
  !*** ./public/app/plugins/panel/graph/graph_tooltip.ts ***!
  \*********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return GraphTooltip; });
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var app_core_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! app/core/core */ "./public/app/core/core.ts");


function GraphTooltip(elem, dashboard, scope, getSeriesFn) {
    var self = this;
    var ctrl = scope.ctrl;
    var panel = ctrl.panel;
    var $tooltip = jquery__WEBPACK_IMPORTED_MODULE_0___default()('<div class="graph-tooltip">');
    this.destroy = function () {
        $tooltip.remove();
    };
    this.findHoverIndexFromDataPoints = function (posX, series, last) {
        var ps = series.datapoints.pointsize;
        var initial = last * ps;
        var len = series.datapoints.points.length;
        var j;
        for (j = initial; j < len; j += ps) {
            // Special case of a non stepped line, highlight the very last point just before a null point
            if ((!series.lines.steps && series.datapoints.points[initial] != null && series.datapoints.points[j] == null) ||
                //normal case
                series.datapoints.points[j] > posX) {
                return Math.max(j - ps, 0) / ps;
            }
        }
        return j / ps - 1;
    };
    this.findHoverIndexFromData = function (posX, series) {
        var lower = 0;
        var upper = series.data.length - 1;
        var middle;
        while (true) {
            if (lower > upper) {
                return Math.max(upper, 0);
            }
            middle = Math.floor((lower + upper) / 2);
            if (series.data[middle][0] === posX) {
                return middle;
            }
            else if (series.data[middle][0] < posX) {
                lower = middle + 1;
            }
            else {
                upper = middle - 1;
            }
        }
    };
    this.renderAndShow = function (absoluteTime, innerHtml, pos, xMode) {
        if (xMode === 'time') {
            innerHtml = '<div class="graph-tooltip-time">' + absoluteTime + '</div>' + innerHtml;
        }
        $tooltip.html(innerHtml).place_tt(pos.pageX + 20, pos.pageY);
    };
    this.getMultiSeriesPlotHoverInfo = function (seriesList, pos) {
        var value, i, series, hoverIndex, hoverDistance, pointTime, yaxis;
        // 3 sub-arrays, 1st for hidden series, 2nd for left yaxis, 3rd for right yaxis.
        var results = [[], [], []];
        //now we know the current X (j) position for X and Y values
        var last_value = 0; //needed for stacked values
        var minDistance, minTime;
        for (i = 0; i < seriesList.length; i++) {
            series = seriesList[i];
            if (!series.data.length || (panel.legend.hideEmpty && series.allIsNull)) {
                // Init value so that it does not brake series sorting
                results[0].push({ hidden: true, value: 0 });
                continue;
            }
            if (!series.data.length || (panel.legend.hideZero && series.allIsZero)) {
                // Init value so that it does not brake series sorting
                results[0].push({ hidden: true, value: 0 });
                continue;
            }
            hoverIndex = this.findHoverIndexFromData(pos.x, series);
            hoverDistance = pos.x - series.data[hoverIndex][0];
            pointTime = series.data[hoverIndex][0];
            // Take the closest point before the cursor, or if it does not exist, the closest after
            if (!minDistance ||
                (hoverDistance >= 0 && (hoverDistance < minDistance || minDistance < 0)) ||
                (hoverDistance < 0 && hoverDistance > minDistance)) {
                minDistance = hoverDistance;
                minTime = pointTime;
            }
            if (series.stack) {
                if (panel.tooltip.value_type === 'individual') {
                    value = series.data[hoverIndex][1];
                }
                else if (!series.stack) {
                    value = series.data[hoverIndex][1];
                }
                else {
                    last_value += series.data[hoverIndex][1];
                    value = last_value;
                }
            }
            else {
                value = series.data[hoverIndex][1];
            }
            // Highlighting multiple Points depending on the plot type
            if (series.lines.steps || series.stack) {
                // stacked and steppedLine plots can have series with different length.
                // Stacked series can increase its length on each new stacked serie if null points found,
                // to speed the index search we begin always on the last found hoverIndex.
                hoverIndex = this.findHoverIndexFromDataPoints(pos.x, series, hoverIndex);
            }
            // Be sure we have a yaxis so that it does not brake series sorting
            yaxis = 0;
            if (series.yaxis) {
                yaxis = series.yaxis.n;
            }
            results[yaxis].push({
                value: value,
                hoverIndex: hoverIndex,
                color: series.color,
                label: series.aliasEscaped,
                time: pointTime,
                distance: hoverDistance,
                index: i,
            });
        }
        // Contat the 3 sub-arrays
        results = results[0].concat(results[1], results[2]);
        // Time of the point closer to pointer
        results.time = minTime;
        return results;
    };
    elem.mouseleave(function () {
        if (panel.tooltip.shared) {
            var plot = elem.data().plot;
            if (plot) {
                $tooltip.detach();
                plot.unhighlight();
            }
        }
        app_core_core__WEBPACK_IMPORTED_MODULE_1__["appEvents"].emit('graph-hover-clear');
    });
    elem.bind('plothover', function (event, pos, item) {
        self.show(pos, item);
        // broadcast to other graph panels that we are hovering!
        pos.panelRelY = (pos.pageY - elem.offset().top) / elem.height();
        app_core_core__WEBPACK_IMPORTED_MODULE_1__["appEvents"].emit('graph-hover', { pos: pos, panel: panel });
    });
    elem.bind('plotclick', function (event, pos, item) {
        app_core_core__WEBPACK_IMPORTED_MODULE_1__["appEvents"].emit('graph-click', { pos: pos, panel: panel, item: item });
    });
    this.clear = function (plot) {
        $tooltip.detach();
        plot.clearCrosshair();
        plot.unhighlight();
    };
    this.show = function (pos, item) {
        var plot = elem.data().plot;
        var plotData = plot.getData();
        var xAxes = plot.getXAxes();
        var xMode = xAxes[0].options.mode;
        var seriesList = getSeriesFn();
        var allSeriesMode = panel.tooltip.shared;
        var group, value, absoluteTime, hoverInfo, i, series, seriesHtml, tooltipFormat;
        // if panelRelY is defined another panel wants us to show a tooltip
        // get pageX from position on x axis and pageY from relative position in original panel
        if (pos.panelRelY) {
            var pointOffset = plot.pointOffset({ x: pos.x });
            if (Number.isNaN(pointOffset.left) || pointOffset.left < 0 || pointOffset.left > elem.width()) {
                self.clear(plot);
                return;
            }
            pos.pageX = elem.offset().left + pointOffset.left;
            pos.pageY = elem.offset().top + elem.height() * pos.panelRelY;
            var isVisible = pos.pageY >= jquery__WEBPACK_IMPORTED_MODULE_0___default()(window).scrollTop() && pos.pageY <= jquery__WEBPACK_IMPORTED_MODULE_0___default()(window).innerHeight() + jquery__WEBPACK_IMPORTED_MODULE_0___default()(window).scrollTop();
            if (!isVisible) {
                self.clear(plot);
                return;
            }
            plot.setCrosshair(pos);
            allSeriesMode = true;
            if (dashboard.sharedCrosshairModeOnly()) {
                // if only crosshair mode we are done
                return;
            }
        }
        if (seriesList.length === 0) {
            return;
        }
        if (seriesList[0].hasMsResolution) {
            tooltipFormat = 'YYYY-MM-DD HH:mm:ss.SSS';
        }
        else {
            tooltipFormat = 'YYYY-MM-DD HH:mm:ss';
        }
        if (allSeriesMode) {
            plot.unhighlight();
            var seriesHoverInfo = self.getMultiSeriesPlotHoverInfo(plotData, pos);
            seriesHtml = '';
            absoluteTime = dashboard.formatDate(seriesHoverInfo.time, tooltipFormat);
            // Dynamically reorder the hovercard for the current time point if the
            // option is enabled.
            if (panel.tooltip.sort === 2) {
                seriesHoverInfo.sort(function (a, b) {
                    return b.value - a.value;
                });
            }
            else if (panel.tooltip.sort === 1) {
                seriesHoverInfo.sort(function (a, b) {
                    return a.value - b.value;
                });
            }
            for (i = 0; i < seriesHoverInfo.length; i++) {
                hoverInfo = seriesHoverInfo[i];
                if (hoverInfo.hidden) {
                    continue;
                }
                var highlightClass = '';
                if (item && hoverInfo.index === item.seriesIndex) {
                    highlightClass = 'graph-tooltip-list-item--highlight';
                }
                series = seriesList[hoverInfo.index];
                value = series.formatValue(hoverInfo.value);
                seriesHtml +=
                    '<div class="graph-tooltip-list-item ' + highlightClass + '"><div class="graph-tooltip-series-name">';
                seriesHtml +=
                    '<i class="fa fa-minus" style="color:' + hoverInfo.color + ';"></i> ' + hoverInfo.label + ':</div>';
                seriesHtml += '<div class="graph-tooltip-value">' + value + '</div></div>';
                plot.highlight(hoverInfo.index, hoverInfo.hoverIndex);
            }
            self.renderAndShow(absoluteTime, seriesHtml, pos, xMode);
        }
        else if (item) {
            // single series tooltip
            series = seriesList[item.seriesIndex];
            group = '<div class="graph-tooltip-list-item"><div class="graph-tooltip-series-name">';
            group +=
                '<i class="fa fa-minus" style="color:' + item.series.color + ';"></i> ' + series.aliasEscaped + ':</div>';
            if (panel.stack && panel.tooltip.value_type === 'individual') {
                value = item.datapoint[1] - item.datapoint[2];
            }
            else {
                value = item.datapoint[1];
            }
            value = series.formatValue(value);
            absoluteTime = dashboard.formatDate(item.datapoint[0], tooltipFormat);
            group += '<div class="graph-tooltip-value">' + value + '</div>';
            self.renderAndShow(absoluteTime, group, pos, xMode);
        }
        else {
            // no hit
            $tooltip.detach();
        }
    };
}


/***/ }),

/***/ "./public/app/plugins/panel/graph/jquery.flot.events.ts":
/*!**************************************************************!*\
  !*** ./public/app/plugins/panel/graph/jquery.flot.events.ts ***!
  \**************************************************************/
/*! exports provided: createAnnotationToolip, createEditPopover, DrawableEvent, VisualEvent, EventMarkers, init */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createAnnotationToolip", function() { return createAnnotationToolip; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createEditPopover", function() { return createEditPopover; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DrawableEvent", function() { return DrawableEvent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VisualEvent", function() { return VisualEvent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EventMarkers", function() { return EventMarkers; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "init", function() { return init; });
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! angular */ "./node_modules/angular/index.js");
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(angular__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var tether_drop__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! tether-drop */ "./node_modules/tether-drop/dist/js/drop.js");
/* harmony import */ var tether_drop__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(tether_drop__WEBPACK_IMPORTED_MODULE_3__);




/** @ngInject */
function createAnnotationToolip(element, event, plot) {
    var injector = angular__WEBPACK_IMPORTED_MODULE_0___default.a.element(document).injector();
    var content = document.createElement('div');
    content.innerHTML = '<annotation-tooltip event="event" on-edit="onEdit()"></annotation-tooltip>';
    injector.invoke([
        '$compile',
        '$rootScope',
        function ($compile, $rootScope) {
            var eventManager = plot.getOptions().events.manager;
            var tmpScope = $rootScope.$new(true);
            tmpScope.event = event;
            tmpScope.onEdit = function () {
                eventManager.editEvent(event);
            };
            $compile(content)(tmpScope);
            tmpScope.$digest();
            tmpScope.$destroy();
            var drop = new tether_drop__WEBPACK_IMPORTED_MODULE_3___default.a({
                target: element[0],
                content: content,
                position: 'bottom center',
                classes: 'drop-popover drop-popover--annotation',
                openOn: 'hover',
                hoverCloseDelay: 200,
                tetherOptions: {
                    constraints: [{ to: 'window', pin: true, attachment: 'both' }],
                },
            });
            drop.open();
            drop.on('close', function () {
                setTimeout(function () {
                    drop.destroy();
                });
            });
        },
    ]);
}
var markerElementToAttachTo = null;
/** @ngInject */
function createEditPopover(element, event, plot) {
    var eventManager = plot.getOptions().events.manager;
    if (eventManager.editorOpen) {
        // update marker element to attach to (needed in case of legend on the right
        // when there is a double render pass and the inital marker element is removed)
        markerElementToAttachTo = element;
        return;
    }
    // mark as openend
    eventManager.editorOpened();
    // set marker elment to attache to
    markerElementToAttachTo = element;
    // wait for element to be attached and positioned
    setTimeout(function () {
        var injector = angular__WEBPACK_IMPORTED_MODULE_0___default.a.element(document).injector();
        var content = document.createElement('div');
        content.innerHTML = '<event-editor panel-ctrl="panelCtrl" event="event" close="close()"></event-editor>';
        injector.invoke([
            '$compile',
            '$rootScope',
            function ($compile, $rootScope) {
                var scope = $rootScope.$new(true);
                var drop;
                scope.event = event;
                scope.panelCtrl = eventManager.panelCtrl;
                scope.close = function () {
                    drop.close();
                };
                $compile(content)(scope);
                scope.$digest();
                drop = new tether_drop__WEBPACK_IMPORTED_MODULE_3___default.a({
                    target: markerElementToAttachTo[0],
                    content: content,
                    position: 'bottom center',
                    classes: 'drop-popover drop-popover--form',
                    openOn: 'click',
                    tetherOptions: {
                        constraints: [{ to: 'window', pin: true, attachment: 'both' }],
                    },
                });
                drop.open();
                eventManager.editorOpened();
                drop.on('close', function () {
                    // need timeout here in order call drop.destroy
                    setTimeout(function () {
                        eventManager.editorClosed();
                        scope.$destroy();
                        drop.destroy();
                    });
                });
            },
        ]);
    }, 100);
}
/*
 * jquery.flot.events
 *
 * description: Flot plugin for adding events/markers to the plot
 * version: 0.2.5
 * authors:
 *    Alexander Wunschik <alex@wunschik.net>
 *    Joel Oughton <joeloughton@gmail.com>
 *    Nicolas Joseph <www.nicolasjoseph.com>
 *
 * website: https://github.com/mojoaxel/flot-events
 *
 * released under MIT License and GPLv2+
 */
/**
 * A class that allows for the drawing an remove of some object
 */
var DrawableEvent = /** @class */ (function () {
    /** @ngInject */
    function DrawableEvent(object, drawFunc, clearFunc, moveFunc, left, top, width, height) {
        this._object = object;
        this._drawFunc = drawFunc;
        this._clearFunc = clearFunc;
        this._moveFunc = moveFunc;
        this._position = { left: left, top: top };
        this._width = width;
        this._height = height;
    }
    DrawableEvent.prototype.width = function () {
        return this._width;
    };
    DrawableEvent.prototype.height = function () {
        return this._height;
    };
    DrawableEvent.prototype.position = function () {
        return this._position;
    };
    DrawableEvent.prototype.draw = function () {
        this._drawFunc(this._object);
    };
    DrawableEvent.prototype.clear = function () {
        this._clearFunc(this._object);
    };
    DrawableEvent.prototype.getObject = function () {
        return this._object;
    };
    DrawableEvent.prototype.moveTo = function (position) {
        this._position = position;
        this._moveFunc(this._object, this._position);
    };
    return DrawableEvent;
}());

/**
 * Event class that stores options (eventType, min, max, title, description) and the object to draw.
 */
var VisualEvent = /** @class */ (function () {
    /** @ngInject */
    function VisualEvent(options, drawableEvent) {
        this._options = options;
        this._drawableEvent = drawableEvent;
        this._hidden = false;
    }
    VisualEvent.prototype.visual = function () {
        return this._drawableEvent;
    };
    VisualEvent.prototype.getOptions = function () {
        return this._options;
    };
    VisualEvent.prototype.getParent = function () {
        return this._parent;
    };
    VisualEvent.prototype.isHidden = function () {
        return this._hidden;
    };
    VisualEvent.prototype.hide = function () {
        this._hidden = true;
    };
    VisualEvent.prototype.unhide = function () {
        this._hidden = false;
    };
    return VisualEvent;
}());

/**
 * A Class that handles the event-markers inside the given plot
 */
var EventMarkers = /** @class */ (function () {
    /** @ngInject */
    function EventMarkers(plot) {
        this._events = [];
        this._types = [];
        this._plot = plot;
        this.eventsEnabled = false;
    }
    EventMarkers.prototype.getEvents = function () {
        return this._events;
    };
    EventMarkers.prototype.setTypes = function (types) {
        return (this._types = types);
    };
    /**
     * create internal objects for the given events
     */
    EventMarkers.prototype.setupEvents = function (events) {
        var _this = this;
        var parts = lodash__WEBPACK_IMPORTED_MODULE_2___default.a.partition(events, 'isRegion');
        var regions = parts[0];
        events = parts[1];
        jquery__WEBPACK_IMPORTED_MODULE_1___default.a.each(events, function (index, event) {
            var ve = new VisualEvent(event, _this._buildDiv(event));
            _this._events.push(ve);
        });
        jquery__WEBPACK_IMPORTED_MODULE_1___default.a.each(regions, function (index, event) {
            var vre = new VisualEvent(event, _this._buildRegDiv(event));
            _this._events.push(vre);
        });
        this._events.sort(function (a, b) {
            var ao = a.getOptions(), bo = b.getOptions();
            if (ao.min > bo.min) {
                return 1;
            }
            if (ao.min < bo.min) {
                return -1;
            }
            return 0;
        });
    };
    /**
     * draw the events to the plot
     */
    EventMarkers.prototype.drawEvents = function () {
        // var o = this._plot.getPlotOffset();
        var _this = this;
        jquery__WEBPACK_IMPORTED_MODULE_1___default.a.each(this._events, function (index, event) {
            // check event is inside the graph range
            if (_this._insidePlot(event.getOptions().min) && !event.isHidden()) {
                event.visual().draw();
            }
            else {
                event
                    .visual()
                    .getObject()
                    .hide();
            }
        });
    };
    /**
     * update the position of the event-markers (e.g. after scrolling or zooming)
     */
    EventMarkers.prototype.updateEvents = function () {
        var _this = this;
        var o = this._plot.getPlotOffset(), left, top;
        var xaxis = this._plot.getXAxes()[this._plot.getOptions().events.xaxis - 1];
        jquery__WEBPACK_IMPORTED_MODULE_1___default.a.each(this._events, function (index, event) {
            top = o.top + _this._plot.height() - event.visual().height();
            left = xaxis.p2c(event.getOptions().min) + o.left - event.visual().width() / 2;
            event.visual().moveTo({ top: top, left: left });
        });
    };
    /**
     * remove all events from the plot
     */
    EventMarkers.prototype._clearEvents = function () {
        jquery__WEBPACK_IMPORTED_MODULE_1___default.a.each(this._events, function (index, val) {
            val.visual().clear();
        });
        this._events = [];
    };
    /**
     * create a DOM element for the given event
     */
    EventMarkers.prototype._buildDiv = function (event) {
        var that = this;
        var container = this._plot.getPlaceholder();
        var o = this._plot.getPlotOffset();
        var xaxis = this._plot.getXAxes()[this._plot.getOptions().events.xaxis - 1];
        var top, left, color, markerSize, markerShow, lineStyle, lineWidth;
        var markerTooltip;
        // map the eventType to a types object
        var eventTypeId = event.eventType;
        if (this._types === null || !this._types[eventTypeId] || !this._types[eventTypeId].color) {
            color = '#666';
        }
        else {
            color = this._types[eventTypeId].color;
        }
        if (this._types === null || !this._types[eventTypeId] || !this._types[eventTypeId].markerSize) {
            markerSize = 8; //default marker size
        }
        else {
            markerSize = this._types[eventTypeId].markerSize;
        }
        if (this._types === null || !this._types[eventTypeId] || this._types[eventTypeId].markerShow === undefined) {
            markerShow = true;
        }
        else {
            markerShow = this._types[eventTypeId].markerShow;
        }
        if (this._types === null || !this._types[eventTypeId] || this._types[eventTypeId].markerTooltip === undefined) {
            markerTooltip = true;
        }
        else {
            markerTooltip = this._types[eventTypeId].markerTooltip;
        }
        if (this._types == null || !this._types[eventTypeId] || !this._types[eventTypeId].lineStyle) {
            lineStyle = 'dashed'; //default line style
        }
        else {
            lineStyle = this._types[eventTypeId].lineStyle.toLowerCase();
        }
        if (this._types == null || !this._types[eventTypeId] || this._types[eventTypeId].lineWidth === undefined) {
            lineWidth = 1; //default line width
        }
        else {
            lineWidth = this._types[eventTypeId].lineWidth;
        }
        var topOffset = xaxis.options.eventSectionHeight || 0;
        topOffset = topOffset / 3;
        top = o.top + this._plot.height() + topOffset;
        left = xaxis.p2c(event.min) + o.left;
        var line = jquery__WEBPACK_IMPORTED_MODULE_1___default()('<div class="events_line flot-temp-elem"></div>')
            .css({
            position: 'absolute',
            opacity: 0.8,
            left: left + 'px',
            top: 8,
            width: lineWidth + 'px',
            height: this._plot.height() + topOffset * 0.8,
            'border-left-width': lineWidth + 'px',
            'border-left-style': lineStyle,
            'border-left-color': color,
            color: color,
        })
            .appendTo(container);
        if (markerShow) {
            var marker_1 = jquery__WEBPACK_IMPORTED_MODULE_1___default()('<div class="events_marker"></div>').css({
                position: 'absolute',
                left: -markerSize - Math.round(lineWidth / 2) + 'px',
                'font-size': 0,
                'line-height': 0,
                width: 0,
                height: 0,
                'border-left': markerSize + 'px solid transparent',
                'border-right': markerSize + 'px solid transparent',
            });
            marker_1.appendTo(line);
            if (this._types[eventTypeId] &&
                this._types[eventTypeId].position &&
                this._types[eventTypeId].position.toUpperCase() === 'BOTTOM') {
                marker_1.css({
                    top: top - markerSize - 8 + 'px',
                    'border-top': 'none',
                    'border-bottom': markerSize + 'px solid ' + color,
                });
            }
            else {
                marker_1.css({
                    top: '0px',
                    'border-top': markerSize + 'px solid ' + color,
                    'border-bottom': 'none',
                });
            }
            marker_1.data({
                event: event,
            });
            var mouseenter = function () {
                createAnnotationToolip(marker_1, jquery__WEBPACK_IMPORTED_MODULE_1___default()(this).data('event'), that._plot);
            };
            if (event.editModel) {
                createEditPopover(marker_1, event.editModel, that._plot);
            }
            var mouseleave = function () {
                that._plot.clearSelection();
            };
            if (markerTooltip) {
                marker_1.css({ cursor: 'help' });
                marker_1.hover(mouseenter, mouseleave);
            }
        }
        var drawableEvent = new DrawableEvent(line, function drawFunc(obj) {
            obj.show();
        }, function (obj) {
            obj.remove();
        }, function (obj, position) {
            obj.css({
                top: position.top,
                left: position.left,
            });
        }, left, top, line.width(), line.height());
        return drawableEvent;
    };
    /**
     * create a DOM element for the given region
     */
    EventMarkers.prototype._buildRegDiv = function (event) {
        var _this = this;
        var that = this;
        var container = this._plot.getPlaceholder();
        var o = this._plot.getPlotOffset();
        var xaxis = this._plot.getXAxes()[this._plot.getOptions().events.xaxis - 1];
        var top, left, lineWidth, regionWidth, lineStyle, color, markerTooltip;
        // map the eventType to a types object
        var eventTypeId = event.eventType;
        if (this._types === null || !this._types[eventTypeId] || !this._types[eventTypeId].color) {
            color = '#666';
        }
        else {
            color = this._types[eventTypeId].color;
        }
        if (this._types === null || !this._types[eventTypeId] || this._types[eventTypeId].markerTooltip === undefined) {
            markerTooltip = true;
        }
        else {
            markerTooltip = this._types[eventTypeId].markerTooltip;
        }
        if (this._types == null || !this._types[eventTypeId] || this._types[eventTypeId].lineWidth === undefined) {
            lineWidth = 1; //default line width
        }
        else {
            lineWidth = this._types[eventTypeId].lineWidth;
        }
        if (this._types == null || !this._types[eventTypeId] || !this._types[eventTypeId].lineStyle) {
            lineStyle = 'dashed'; //default line style
        }
        else {
            lineStyle = this._types[eventTypeId].lineStyle.toLowerCase();
        }
        var topOffset = 2;
        top = o.top + this._plot.height() + topOffset;
        var timeFrom = Math.min(event.min, event.timeEnd);
        var timeTo = Math.max(event.min, event.timeEnd);
        left = xaxis.p2c(timeFrom) + o.left;
        var right = xaxis.p2c(timeTo) + o.left;
        regionWidth = right - left;
        lodash__WEBPACK_IMPORTED_MODULE_2___default.a.each([left, right], function (position) {
            var line = jquery__WEBPACK_IMPORTED_MODULE_1___default()('<div class="events_line flot-temp-elem"></div>').css({
                position: 'absolute',
                opacity: 0.8,
                left: position + 'px',
                top: 8,
                width: lineWidth + 'px',
                height: _this._plot.height() + topOffset,
                'border-left-width': lineWidth + 'px',
                'border-left-style': lineStyle,
                'border-left-color': color,
                color: color,
            });
            line.appendTo(container);
        });
        var region = jquery__WEBPACK_IMPORTED_MODULE_1___default()('<div class="events_marker region_marker flot-temp-elem"></div>').css({
            position: 'absolute',
            opacity: 0.5,
            left: left + 'px',
            top: top,
            width: Math.round(regionWidth + lineWidth) + 'px',
            height: '0.5rem',
            'border-left-color': color,
            color: color,
            'background-color': color,
        });
        region.appendTo(container);
        region.data({
            event: event,
        });
        var mouseenter = function () {
            createAnnotationToolip(region, jquery__WEBPACK_IMPORTED_MODULE_1___default()(this).data('event'), that._plot);
        };
        if (event.editModel) {
            createEditPopover(region, event.editModel, that._plot);
        }
        var mouseleave = function () {
            that._plot.clearSelection();
        };
        if (markerTooltip) {
            region.css({ cursor: 'help' });
            region.hover(mouseenter, mouseleave);
        }
        var drawableEvent = new DrawableEvent(region, function drawFunc(obj) {
            obj.show();
        }, function (obj) {
            obj.remove();
        }, function (obj, position) {
            obj.css({
                top: position.top,
                left: position.left,
            });
        }, left, top, region.width(), region.height());
        return drawableEvent;
    };
    /**
     * check if the event is inside visible range
     */
    EventMarkers.prototype._insidePlot = function (x) {
        var xaxis = this._plot.getXAxes()[this._plot.getOptions().events.xaxis - 1];
        var xc = xaxis.p2c(x);
        return xc > 0 && xc < xaxis.p2c(xaxis.max);
    };
    return EventMarkers;
}());

/**
 * initialize the plugin for the given plot
 */
/** @ngInject */
function init(plot) {
    /*jshint validthis:true */
    var that = this;
    var eventMarkers = new EventMarkers(plot);
    plot.getEvents = function () {
        return eventMarkers._events;
    };
    plot.hideEvents = function () {
        jquery__WEBPACK_IMPORTED_MODULE_1___default.a.each(eventMarkers._events, function (index, event) {
            event
                .visual()
                .getObject()
                .hide();
        });
    };
    plot.showEvents = function () {
        plot.hideEvents();
        jquery__WEBPACK_IMPORTED_MODULE_1___default.a.each(eventMarkers._events, function (index, event) {
            event.hide();
        });
        that.eventMarkers.drawEvents();
    };
    // change events on an existing plot
    plot.setEvents = function (events) {
        if (eventMarkers.eventsEnabled) {
            eventMarkers.setupEvents(events);
        }
    };
    plot.hooks.processOptions.push(function (plot, options) {
        // enable the plugin
        if (options.events.data != null) {
            eventMarkers.eventsEnabled = true;
        }
    });
    plot.hooks.draw.push(function (plot) {
        var options = plot.getOptions();
        if (eventMarkers.eventsEnabled) {
            // check for first run
            if (eventMarkers.getEvents().length < 1) {
                eventMarkers.setTypes(options.events.types);
                eventMarkers.setupEvents(options.events.data);
            }
            else {
                eventMarkers.updateEvents();
            }
        }
        eventMarkers.drawEvents();
    });
}
var defaultOptions = {
    events: {
        data: null,
        types: null,
        xaxis: 1,
        position: 'BOTTOM',
    },
};
jquery__WEBPACK_IMPORTED_MODULE_1___default.a.plot.plugins.push({
    init: init,
    options: defaultOptions,
    name: 'events',
    version: '0.2.5',
});


/***/ }),

/***/ "./public/app/plugins/panel/graph/legend.ts":
/*!**************************************************!*\
  !*** ./public/app/plugins/panel/graph/legend.ts ***!
  \**************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! angular */ "./node_modules/angular/index.js");
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(angular__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var baron__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! baron */ "./node_modules/baron/src/core.js");
/* harmony import */ var baron__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(baron__WEBPACK_IMPORTED_MODULE_3__);




var module = angular__WEBPACK_IMPORTED_MODULE_0___default.a.module('grafana.directives');
module.directive('graphLegend', function (popoverSrv, $timeout) {
    return {
        link: function (scope, elem) {
            var firstRender = true;
            var ctrl = scope.ctrl;
            var panel = ctrl.panel;
            var data;
            var seriesList;
            var i;
            var legendScrollbar;
            var legendRightDefaultWidth = 10;
            var legendElem = elem.parent();
            scope.$on('$destroy', function () {
                destroyScrollbar();
            });
            ctrl.events.on('render-legend', function () {
                data = ctrl.seriesList;
                if (data) {
                    render();
                }
                ctrl.events.emit('legend-rendering-complete');
            });
            function getSeriesIndexForElement(el) {
                return el.parents('[data-series-index]').data('series-index');
            }
            function openColorSelector(e) {
                // if we clicked inside poup container ignore click
                if (jquery__WEBPACK_IMPORTED_MODULE_2___default()(e.target).parents('.popover').length) {
                    return;
                }
                var el = jquery__WEBPACK_IMPORTED_MODULE_2___default()(e.currentTarget).find('.fa-minus');
                var index = getSeriesIndexForElement(el);
                var series = seriesList[index];
                $timeout(function () {
                    popoverSrv.show({
                        element: el[0],
                        position: 'bottom left',
                        targetAttachment: 'top left',
                        template: '<series-color-picker series="series" onToggleAxis="toggleAxis" onColorChange="colorSelected">' +
                            '</series-color-picker>',
                        openOn: 'hover',
                        model: {
                            series: series,
                            toggleAxis: function () {
                                ctrl.toggleAxis(series);
                            },
                            colorSelected: function (color) {
                                ctrl.changeSeriesColor(series, color);
                            },
                        },
                    });
                });
            }
            function toggleSeries(e) {
                var el = jquery__WEBPACK_IMPORTED_MODULE_2___default()(e.currentTarget);
                var index = getSeriesIndexForElement(el);
                var seriesInfo = seriesList[index];
                var scrollPosition = jquery__WEBPACK_IMPORTED_MODULE_2___default()(elem.children('tbody')).scrollTop();
                ctrl.toggleSeries(seriesInfo, e);
                jquery__WEBPACK_IMPORTED_MODULE_2___default()(elem.children('tbody')).scrollTop(scrollPosition);
            }
            function sortLegend(e) {
                var el = jquery__WEBPACK_IMPORTED_MODULE_2___default()(e.currentTarget);
                var stat = el.data('stat');
                if (stat !== panel.legend.sort) {
                    panel.legend.sortDesc = null;
                }
                // if already sort ascending, disable sorting
                if (panel.legend.sortDesc === false) {
                    panel.legend.sort = null;
                    panel.legend.sortDesc = null;
                    ctrl.render();
                    return;
                }
                panel.legend.sortDesc = !panel.legend.sortDesc;
                panel.legend.sort = stat;
                ctrl.render();
            }
            function getTableHeaderHtml(statName) {
                if (!panel.legend[statName]) {
                    return '';
                }
                var html = '<th class="pointer" data-stat="' + statName + '">' + statName;
                if (panel.legend.sort === statName) {
                    var cssClass = panel.legend.sortDesc ? 'fa fa-caret-down' : 'fa fa-caret-up';
                    html += ' <span class="' + cssClass + '"></span>';
                }
                return html + '</th>';
            }
            function render() {
                var legendWidth = legendElem.width();
                if (!ctrl.panel.legend.show) {
                    elem.empty();
                    firstRender = true;
                    return;
                }
                if (firstRender) {
                    elem.on('click', '.graph-legend-icon', openColorSelector);
                    elem.on('click', '.graph-legend-alias', toggleSeries);
                    elem.on('click', 'th', sortLegend);
                    firstRender = false;
                }
                seriesList = data;
                elem.empty();
                // Set min-width if side style and there is a value, otherwise remove the CSS property
                // Set width so it works with IE11
                var width = panel.legend.rightSide && panel.legend.sideWidth ? panel.legend.sideWidth + 'px' : '';
                var ieWidth = panel.legend.rightSide && panel.legend.sideWidth ? panel.legend.sideWidth - 1 + 'px' : '';
                legendElem.css('min-width', width);
                legendElem.css('width', ieWidth);
                elem.toggleClass('graph-legend-table', panel.legend.alignAsTable === true);
                var tableHeaderElem;
                if (panel.legend.alignAsTable) {
                    var header = '<tr>';
                    header += '<th colspan="2" style="text-align:left"></th>';
                    if (panel.legend.values) {
                        header += getTableHeaderHtml('min');
                        header += getTableHeaderHtml('max');
                        header += getTableHeaderHtml('avg');
                        header += getTableHeaderHtml('current');
                        header += getTableHeaderHtml('total');
                    }
                    header += '</tr>';
                    tableHeaderElem = jquery__WEBPACK_IMPORTED_MODULE_2___default()(header);
                }
                if (panel.legend.sort) {
                    seriesList = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.sortBy(seriesList, function (series) {
                        var sort = series.stats[panel.legend.sort];
                        if (sort === null) {
                            sort = -Infinity;
                        }
                        return sort;
                    });
                    if (panel.legend.sortDesc) {
                        seriesList = seriesList.reverse();
                    }
                }
                // render first time for getting proper legend height
                if (!panel.legend.rightSide || (panel.legend.rightSide && legendWidth !== legendRightDefaultWidth)) {
                    renderLegendElement(tableHeaderElem);
                    elem.empty();
                }
                renderLegendElement(tableHeaderElem);
            }
            function renderSeriesLegendElements() {
                var seriesElements = [];
                for (i = 0; i < seriesList.length; i++) {
                    var series = seriesList[i];
                    if (series.hideFromLegend(panel.legend)) {
                        continue;
                    }
                    var html = '<div class="graph-legend-series';
                    if (series.yaxis === 2) {
                        html += ' graph-legend-series--right-y';
                    }
                    if (ctrl.hiddenSeries[series.alias]) {
                        html += ' graph-legend-series-hidden';
                    }
                    html += '" data-series-index="' + i + '">';
                    html += '<div class="graph-legend-icon">';
                    html += '<i class="fa fa-minus pointer" style="color:' + series.color + '"></i>';
                    html += '</div>';
                    html +=
                        '<a class="graph-legend-alias pointer" title="' + series.aliasEscaped + '">' + series.aliasEscaped + '</a>';
                    if (panel.legend.values) {
                        var avg = series.formatValue(series.stats.avg);
                        var current = series.formatValue(series.stats.current);
                        var min = series.formatValue(series.stats.min);
                        var max = series.formatValue(series.stats.max);
                        var total = series.formatValue(series.stats.total);
                        if (panel.legend.min) {
                            html += '<div class="graph-legend-value min">' + min + '</div>';
                        }
                        if (panel.legend.max) {
                            html += '<div class="graph-legend-value max">' + max + '</div>';
                        }
                        if (panel.legend.avg) {
                            html += '<div class="graph-legend-value avg">' + avg + '</div>';
                        }
                        if (panel.legend.current) {
                            html += '<div class="graph-legend-value current">' + current + '</div>';
                        }
                        if (panel.legend.total) {
                            html += '<div class="graph-legend-value total">' + total + '</div>';
                        }
                    }
                    html += '</div>';
                    seriesElements.push(jquery__WEBPACK_IMPORTED_MODULE_2___default()(html));
                }
                return seriesElements;
            }
            function renderLegendElement(tableHeaderElem) {
                var legendWidth = elem.width();
                var seriesElements = renderSeriesLegendElements();
                if (panel.legend.alignAsTable) {
                    var tbodyElem = jquery__WEBPACK_IMPORTED_MODULE_2___default()('<tbody></tbody>');
                    tbodyElem.append(tableHeaderElem);
                    tbodyElem.append(seriesElements);
                    elem.append(tbodyElem);
                    tbodyElem.wrap('<div class="graph-legend-scroll"></div>');
                }
                else {
                    elem.append('<div class="graph-legend-scroll"></div>');
                    elem.find('.graph-legend-scroll').append(seriesElements);
                }
                if (!panel.legend.rightSide || (panel.legend.rightSide && legendWidth !== legendRightDefaultWidth)) {
                    addScrollbar();
                }
                else {
                    destroyScrollbar();
                }
            }
            function addScrollbar() {
                var scrollRootClass = 'baron baron__root';
                var scrollerClass = 'baron__scroller';
                var scrollBarHTML = "\n          <div class=\"baron__track\">\n            <div class=\"baron__bar\"></div>\n          </div>\n        ";
                var scrollRoot = elem;
                var scroller = elem.find('.graph-legend-scroll');
                // clear existing scroll bar track to prevent duplication
                scrollRoot.find('.baron__track').remove();
                scrollRoot.addClass(scrollRootClass);
                jquery__WEBPACK_IMPORTED_MODULE_2___default()(scrollBarHTML).appendTo(scrollRoot);
                scroller.addClass(scrollerClass);
                var scrollbarParams = {
                    root: scrollRoot[0],
                    scroller: scroller[0],
                    bar: '.baron__bar',
                    track: '.baron__track',
                    barOnCls: '_scrollbar',
                    scrollingCls: '_scrolling',
                };
                if (!legendScrollbar) {
                    legendScrollbar = baron__WEBPACK_IMPORTED_MODULE_3___default()(scrollbarParams);
                }
                else {
                    destroyScrollbar();
                    legendScrollbar = baron__WEBPACK_IMPORTED_MODULE_3___default()(scrollbarParams);
                }
                // #11830 - compensates for Firefox scrollbar calculation error in the baron framework
                scroller[0].style.marginRight = '-' + (scroller[0].offsetWidth - scroller[0].clientWidth) + 'px';
                legendScrollbar.scroll();
            }
            function destroyScrollbar() {
                if (legendScrollbar) {
                    legendScrollbar.dispose();
                    legendScrollbar = undefined;
                }
            }
        },
    };
});


/***/ }),

/***/ "./public/app/plugins/panel/graph/threshold_manager.ts":
/*!*************************************************************!*\
  !*** ./public/app/plugins/panel/graph/threshold_manager.ts ***!
  \*************************************************************/
/*! exports provided: ThresholdManager */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ThresholdManager", function() { return ThresholdManager; });
/* harmony import */ var vendor_flot_jquery_flot__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vendor/flot/jquery.flot */ "./public/vendor/flot/jquery.flot.js");
/* harmony import */ var vendor_flot_jquery_flot__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vendor_flot_jquery_flot__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_2__);



var ThresholdManager = /** @class */ (function () {
    function ThresholdManager(panelCtrl) {
        this.panelCtrl = panelCtrl;
    }
    ThresholdManager.prototype.getHandleHtml = function (handleIndex, model, valueStr) {
        var stateClass = model.colorMode;
        if (model.colorMode === 'custom') {
            stateClass = 'critical';
        }
        return "\n    <div class=\"alert-handle-wrapper alert-handle-wrapper--T" + handleIndex + "\">\n      <div class=\"alert-handle-line alert-handle-line--" + stateClass + "\">\n      </div>\n      <div class=\"alert-handle\" data-handle-index=\"" + handleIndex + "\">\n        <i class=\"icon-gf icon-gf-" + stateClass + " alert-state-" + stateClass + "\"></i>\n        <span class=\"alert-handle-value\">" + valueStr + "<i class=\"alert-handle-grip\"></i></span>\n      </div>\n    </div>";
    };
    ThresholdManager.prototype.initDragging = function (evt) {
        var handleElem = jquery__WEBPACK_IMPORTED_MODULE_1___default()(evt.currentTarget).parents('.alert-handle-wrapper');
        var handleIndex = jquery__WEBPACK_IMPORTED_MODULE_1___default()(evt.currentTarget).data('handleIndex');
        var lastY = null;
        var posTop;
        var plot = this.plot;
        var panelCtrl = this.panelCtrl;
        var model = this.thresholds[handleIndex];
        function dragging(evt) {
            if (lastY === null) {
                lastY = evt.clientY;
            }
            else {
                var diff = evt.clientY - lastY;
                posTop = posTop + diff;
                lastY = evt.clientY;
                handleElem.css({ top: posTop + diff });
            }
        }
        function stopped() {
            // calculate graph level
            var graphValue = plot.c2p({ left: 0, top: posTop }).y;
            graphValue = parseInt(graphValue.toFixed(0));
            model.value = graphValue;
            handleElem.off('mousemove', dragging);
            handleElem.off('mouseup', dragging);
            handleElem.off('mouseleave', dragging);
            // trigger digest and render
            panelCtrl.$scope.$apply(function () {
                panelCtrl.render();
                panelCtrl.events.emit('threshold-changed', {
                    threshold: model,
                    handleIndex: handleIndex,
                });
            });
        }
        lastY = null;
        posTop = handleElem.position().top;
        handleElem.on('mousemove', dragging);
        handleElem.on('mouseup', stopped);
        handleElem.on('mouseleave', stopped);
    };
    ThresholdManager.prototype.cleanUp = function () {
        this.placeholder.find('.alert-handle-wrapper').remove();
        this.needsCleanup = false;
    };
    ThresholdManager.prototype.renderHandle = function (handleIndex, defaultHandleTopPos) {
        var model = this.thresholds[handleIndex];
        var value = model.value;
        var valueStr = value;
        var handleTopPos = 0;
        // handle no value
        if (!lodash__WEBPACK_IMPORTED_MODULE_2___default.a.isNumber(value)) {
            valueStr = '';
            handleTopPos = defaultHandleTopPos;
        }
        else {
            var valueCanvasPos = this.plot.p2c({ x: 0, y: value });
            handleTopPos = Math.round(Math.min(Math.max(valueCanvasPos.top, 0), this.height) - 6);
        }
        var handleElem = jquery__WEBPACK_IMPORTED_MODULE_1___default()(this.getHandleHtml(handleIndex, model, valueStr));
        this.placeholder.append(handleElem);
        handleElem.toggleClass('alert-handle-wrapper--no-value', valueStr === '');
        handleElem.css({ top: handleTopPos });
    };
    ThresholdManager.prototype.shouldDrawHandles = function () {
        return !this.hasSecondYAxis && this.panelCtrl.editingThresholds && this.panelCtrl.panel.thresholds.length > 0;
    };
    ThresholdManager.prototype.prepare = function (elem, data) {
        this.hasSecondYAxis = false;
        for (var i = 0; i < data.length; i++) {
            if (data[i].yaxis > 1) {
                this.hasSecondYAxis = true;
                break;
            }
        }
        if (this.shouldDrawHandles()) {
            var thresholdMargin = this.panelCtrl.panel.thresholds.length > 1 ? '220px' : '110px';
            elem.css('margin-right', thresholdMargin);
        }
        else if (this.needsCleanup) {
            elem.css('margin-right', '0');
        }
    };
    ThresholdManager.prototype.draw = function (plot) {
        this.thresholds = this.panelCtrl.panel.thresholds;
        this.plot = plot;
        this.placeholder = plot.getPlaceholder();
        if (this.needsCleanup) {
            this.cleanUp();
        }
        if (!this.shouldDrawHandles()) {
            return;
        }
        this.height = plot.height();
        if (this.thresholds.length > 0) {
            this.renderHandle(0, 10);
        }
        if (this.thresholds.length > 1) {
            this.renderHandle(1, this.height - 30);
        }
        this.placeholder.off('mousedown', '.alert-handle');
        this.placeholder.on('mousedown', '.alert-handle', this.initDragging.bind(this));
        this.needsCleanup = true;
    };
    ThresholdManager.prototype.addFlotOptions = function (options, panel) {
        if (!panel.thresholds || panel.thresholds.length === 0) {
            return;
        }
        var gtLimit = Infinity;
        var ltLimit = -Infinity;
        var i, threshold, other;
        for (i = 0; i < panel.thresholds.length; i++) {
            threshold = panel.thresholds[i];
            if (!lodash__WEBPACK_IMPORTED_MODULE_2___default.a.isNumber(threshold.value)) {
                continue;
            }
            var limit;
            switch (threshold.op) {
                case 'gt': {
                    limit = gtLimit;
                    // if next threshold is less then op and greater value, then use that as limit
                    if (panel.thresholds.length > i + 1) {
                        other = panel.thresholds[i + 1];
                        if (other.value > threshold.value) {
                            limit = other.value;
                            ltLimit = limit;
                        }
                    }
                    break;
                }
                case 'lt': {
                    limit = ltLimit;
                    // if next threshold is less then op and greater value, then use that as limit
                    if (panel.thresholds.length > i + 1) {
                        other = panel.thresholds[i + 1];
                        if (other.value < threshold.value) {
                            limit = other.value;
                            gtLimit = limit;
                        }
                    }
                    break;
                }
            }
            var fillColor, lineColor;
            switch (threshold.colorMode) {
                case 'critical': {
                    fillColor = 'rgba(234, 112, 112, 0.12)';
                    lineColor = 'rgba(237, 46, 24, 0.60)';
                    break;
                }
                case 'warning': {
                    fillColor = 'rgba(235, 138, 14, 0.12)';
                    lineColor = 'rgba(247, 149, 32, 0.60)';
                    break;
                }
                case 'ok': {
                    fillColor = 'rgba(11, 237, 50, 0.090)';
                    lineColor = 'rgba(6,163,69, 0.60)';
                    break;
                }
                case 'custom': {
                    fillColor = threshold.fillColor;
                    lineColor = threshold.lineColor;
                    break;
                }
            }
            // fill
            if (threshold.fill) {
                if (threshold.yaxis === 'right' && this.hasSecondYAxis) {
                    options.grid.markings.push({
                        y2axis: { from: threshold.value, to: limit },
                        color: fillColor,
                    });
                }
                else {
                    options.grid.markings.push({
                        yaxis: { from: threshold.value, to: limit },
                        color: fillColor,
                    });
                }
            }
            if (threshold.line) {
                if (threshold.yaxis === 'right' && this.hasSecondYAxis) {
                    options.grid.markings.push({
                        y2axis: { from: threshold.value, to: threshold.value },
                        color: lineColor,
                    });
                }
                else {
                    options.grid.markings.push({
                        yaxis: { from: threshold.value, to: threshold.value },
                        color: lineColor,
                    });
                }
            }
        }
    };
    return ThresholdManager;
}());



/***/ }),

/***/ "./public/app/plugins/panel/heatmap/color_legend.ts":
/*!**********************************************************!*\
  !*** ./public/app/plugins/panel/heatmap/color_legend.ts ***!
  \**********************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! angular */ "./node_modules/angular/index.js");
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(angular__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! d3 */ "./node_modules/d3/index.js");
/* harmony import */ var app_core_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! app/core/core */ "./public/app/core/core.ts");
/* harmony import */ var app_core_utils_ticks__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! app/core/utils/ticks */ "./public/app/core/utils/ticks.ts");
/* harmony import */ var _color_scale__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./color_scale */ "./public/app/plugins/panel/heatmap/color_scale.ts");







var module = angular__WEBPACK_IMPORTED_MODULE_0___default.a.module('grafana.directives');
var LEGEND_HEIGHT_PX = 6;
var LEGEND_WIDTH_PX = 100;
var LEGEND_TICK_SIZE = 0;
var LEGEND_VALUE_MARGIN = 0;
/**
 * Color legend for heatmap editor.
 */
module.directive('colorLegend', function () {
    return {
        restrict: 'E',
        template: '<div class="heatmap-color-legend"><svg width="16.5rem" height="24px"></svg></div>',
        link: function (scope, elem, attrs) {
            var ctrl = scope.ctrl;
            var panel = scope.ctrl.panel;
            render();
            ctrl.events.on('render', function () {
                render();
            });
            function render() {
                var legendElem = jquery__WEBPACK_IMPORTED_MODULE_2___default()(elem).find('svg');
                var legendWidth = Math.floor(legendElem.outerWidth());
                if (panel.color.mode === 'spectrum') {
                    var colorScheme = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.find(ctrl.colorSchemes, {
                        value: panel.color.colorScheme,
                    });
                    var colorScale = Object(_color_scale__WEBPACK_IMPORTED_MODULE_6__["getColorScale"])(colorScheme, app_core_core__WEBPACK_IMPORTED_MODULE_4__["contextSrv"].user.lightTheme, legendWidth);
                    drawSimpleColorLegend(elem, colorScale);
                }
                else if (panel.color.mode === 'opacity') {
                    var colorOptions = panel.color;
                    drawSimpleOpacityLegend(elem, colorOptions);
                }
            }
        },
    };
});
/**
 * Heatmap legend with scale values.
 */
module.directive('heatmapLegend', function () {
    return {
        restrict: 'E',
        template: "<div class=\"heatmap-color-legend\"><svg width=\"" + LEGEND_WIDTH_PX + "px\" height=\"" + LEGEND_HEIGHT_PX + "px\"></svg></div>",
        link: function (scope, elem, attrs) {
            var ctrl = scope.ctrl;
            var panel = scope.ctrl.panel;
            render();
            ctrl.events.on('render', function () {
                render();
            });
            function render() {
                clearLegend(elem);
                if (!lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isEmpty(ctrl.data) && !lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isEmpty(ctrl.data.cards)) {
                    var rangeFrom = 0;
                    var rangeTo = ctrl.data.cardStats.max;
                    var maxValue = panel.color.max || rangeTo;
                    var minValue = panel.color.min || 0;
                    if (panel.color.mode === 'spectrum') {
                        var colorScheme = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.find(ctrl.colorSchemes, {
                            value: panel.color.colorScheme,
                        });
                        drawColorLegend(elem, colorScheme, rangeFrom, rangeTo, maxValue, minValue);
                    }
                    else if (panel.color.mode === 'opacity') {
                        var colorOptions = panel.color;
                        drawOpacityLegend(elem, colorOptions, rangeFrom, rangeTo, maxValue, minValue);
                    }
                }
            }
        },
    };
});
function drawColorLegend(elem, colorScheme, rangeFrom, rangeTo, maxValue, minValue) {
    var legendElem = jquery__WEBPACK_IMPORTED_MODULE_2___default()(elem).find('svg');
    var legend = d3__WEBPACK_IMPORTED_MODULE_3__["select"](legendElem.get(0));
    clearLegend(elem);
    var legendWidth = Math.floor(legendElem.outerWidth()) - 30;
    var legendHeight = legendElem.attr('height');
    var rangeStep = 1;
    if (rangeTo - rangeFrom > legendWidth) {
        rangeStep = Math.floor((rangeTo - rangeFrom) / legendWidth);
    }
    var widthFactor = legendWidth / (rangeTo - rangeFrom);
    var valuesRange = d3__WEBPACK_IMPORTED_MODULE_3__["range"](rangeFrom, rangeTo, rangeStep);
    var colorScale = Object(_color_scale__WEBPACK_IMPORTED_MODULE_6__["getColorScale"])(colorScheme, app_core_core__WEBPACK_IMPORTED_MODULE_4__["contextSrv"].user.lightTheme, maxValue, minValue);
    legend
        .selectAll('.heatmap-color-legend-rect')
        .data(valuesRange)
        .enter()
        .append('rect')
        .attr('x', function (d) { return d * widthFactor; })
        .attr('y', 0)
        .attr('width', rangeStep * widthFactor + 1) // Overlap rectangles to prevent gaps
        .attr('height', legendHeight)
        .attr('stroke-width', 0)
        .attr('fill', function (d) { return colorScale(d); });
    drawLegendValues(elem, colorScale, rangeFrom, rangeTo, maxValue, minValue, legendWidth);
}
function drawOpacityLegend(elem, options, rangeFrom, rangeTo, maxValue, minValue) {
    var legendElem = jquery__WEBPACK_IMPORTED_MODULE_2___default()(elem).find('svg');
    var legend = d3__WEBPACK_IMPORTED_MODULE_3__["select"](legendElem.get(0));
    clearLegend(elem);
    var legendWidth = Math.floor(legendElem.outerWidth()) - 30;
    var legendHeight = legendElem.attr('height');
    var rangeStep = 1;
    if (rangeTo - rangeFrom > legendWidth) {
        rangeStep = Math.floor((rangeTo - rangeFrom) / legendWidth);
    }
    var widthFactor = legendWidth / (rangeTo - rangeFrom);
    var valuesRange = d3__WEBPACK_IMPORTED_MODULE_3__["range"](rangeFrom, rangeTo, rangeStep);
    var opacityScale = Object(_color_scale__WEBPACK_IMPORTED_MODULE_6__["getOpacityScale"])(options, maxValue, minValue);
    legend
        .selectAll('.heatmap-opacity-legend-rect')
        .data(valuesRange)
        .enter()
        .append('rect')
        .attr('x', function (d) { return d * widthFactor; })
        .attr('y', 0)
        .attr('width', rangeStep * widthFactor)
        .attr('height', legendHeight)
        .attr('stroke-width', 0)
        .attr('fill', options.cardColor)
        .style('opacity', function (d) { return opacityScale(d); });
    drawLegendValues(elem, opacityScale, rangeFrom, rangeTo, maxValue, minValue, legendWidth);
}
function drawLegendValues(elem, colorScale, rangeFrom, rangeTo, maxValue, minValue, legendWidth) {
    var legendElem = jquery__WEBPACK_IMPORTED_MODULE_2___default()(elem).find('svg');
    var legend = d3__WEBPACK_IMPORTED_MODULE_3__["select"](legendElem.get(0));
    if (legendWidth <= 0 || legendElem.get(0).childNodes.length === 0) {
        return;
    }
    var legendValueScale = d3__WEBPACK_IMPORTED_MODULE_3__["scaleLinear"]()
        .domain([0, rangeTo])
        .range([0, legendWidth]);
    var ticks = buildLegendTicks(0, rangeTo, maxValue, minValue);
    var xAxis = d3__WEBPACK_IMPORTED_MODULE_3__["axisBottom"](legendValueScale)
        .tickValues(ticks)
        .tickSize(LEGEND_TICK_SIZE);
    var colorRect = legendElem.find(':first-child');
    var posY = getSvgElemHeight(legendElem) + LEGEND_VALUE_MARGIN;
    var posX = getSvgElemX(colorRect);
    d3__WEBPACK_IMPORTED_MODULE_3__["select"](legendElem.get(0))
        .append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(' + posX + ',' + posY + ')')
        .call(xAxis);
    legend
        .select('.axis')
        .select('.domain')
        .remove();
}
function drawSimpleColorLegend(elem, colorScale) {
    var legendElem = jquery__WEBPACK_IMPORTED_MODULE_2___default()(elem).find('svg');
    clearLegend(elem);
    var legendWidth = Math.floor(legendElem.outerWidth());
    var legendHeight = legendElem.attr('height');
    if (legendWidth) {
        var valuesNumber = Math.floor(legendWidth / 2);
        var rangeStep = Math.floor(legendWidth / valuesNumber);
        var valuesRange = d3__WEBPACK_IMPORTED_MODULE_3__["range"](0, legendWidth, rangeStep);
        var legend = d3__WEBPACK_IMPORTED_MODULE_3__["select"](legendElem.get(0));
        var legendRects = legend.selectAll('.heatmap-color-legend-rect').data(valuesRange);
        legendRects
            .enter()
            .append('rect')
            .attr('x', function (d) { return d; })
            .attr('y', 0)
            .attr('width', rangeStep + 1) // Overlap rectangles to prevent gaps
            .attr('height', legendHeight)
            .attr('stroke-width', 0)
            .attr('fill', function (d) { return colorScale(d); });
    }
}
function drawSimpleOpacityLegend(elem, options) {
    var legendElem = jquery__WEBPACK_IMPORTED_MODULE_2___default()(elem).find('svg');
    clearLegend(elem);
    var legend = d3__WEBPACK_IMPORTED_MODULE_3__["select"](legendElem.get(0));
    var legendWidth = Math.floor(legendElem.outerWidth());
    var legendHeight = legendElem.attr('height');
    if (legendWidth) {
        var legendOpacityScale_1;
        if (options.colorScale === 'linear') {
            legendOpacityScale_1 = d3__WEBPACK_IMPORTED_MODULE_3__["scaleLinear"]()
                .domain([0, legendWidth])
                .range([0, 1]);
        }
        else if (options.colorScale === 'sqrt') {
            legendOpacityScale_1 = d3__WEBPACK_IMPORTED_MODULE_3__["scalePow"]()
                .exponent(options.exponent)
                .domain([0, legendWidth])
                .range([0, 1]);
        }
        var rangeStep = 10;
        var valuesRange = d3__WEBPACK_IMPORTED_MODULE_3__["range"](0, legendWidth, rangeStep);
        var legendRects = legend.selectAll('.heatmap-opacity-legend-rect').data(valuesRange);
        legendRects
            .enter()
            .append('rect')
            .attr('x', function (d) { return d; })
            .attr('y', 0)
            .attr('width', rangeStep)
            .attr('height', legendHeight)
            .attr('stroke-width', 0)
            .attr('fill', options.cardColor)
            .style('opacity', function (d) { return legendOpacityScale_1(d); });
    }
}
function clearLegend(elem) {
    var legendElem = jquery__WEBPACK_IMPORTED_MODULE_2___default()(elem).find('svg');
    legendElem.empty();
}
function getSvgElemX(elem) {
    var svgElem = elem.get(0);
    if (svgElem && svgElem.x && svgElem.x.baseVal) {
        return svgElem.x.baseVal.value;
    }
    else {
        return 0;
    }
}
function getSvgElemHeight(elem) {
    var svgElem = elem.get(0);
    if (svgElem && svgElem.height && svgElem.height.baseVal) {
        return svgElem.height.baseVal.value;
    }
    else {
        return 0;
    }
}
function buildLegendTicks(rangeFrom, rangeTo, maxValue, minValue) {
    var range = rangeTo - rangeFrom;
    var tickStepSize = Object(app_core_utils_ticks__WEBPACK_IMPORTED_MODULE_5__["tickStep"])(rangeFrom, rangeTo, 3);
    var ticksNum = Math.round(range / tickStepSize);
    var ticks = [];
    for (var i = 0; i < ticksNum; i++) {
        var current = tickStepSize * i;
        // Add user-defined min and max if it had been set
        if (isValueCloseTo(minValue, current, tickStepSize)) {
            ticks.push(minValue);
            continue;
        }
        else if (minValue < current) {
            ticks.push(minValue);
        }
        if (isValueCloseTo(maxValue, current, tickStepSize)) {
            ticks.push(maxValue);
            continue;
        }
        else if (maxValue < current) {
            ticks.push(maxValue);
        }
        ticks.push(tickStepSize * i);
    }
    if (!isValueCloseTo(maxValue, rangeTo, tickStepSize)) {
        ticks.push(maxValue);
    }
    ticks.push(rangeTo);
    ticks = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.sortBy(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.uniq(ticks));
    return ticks;
}
function isValueCloseTo(val, valueTo, step) {
    var diff = Math.abs(val - valueTo);
    return diff < step * 0.3;
}


/***/ }),

/***/ "./public/app/plugins/panel/heatmap/heatmap_tooltip.ts":
/*!*************************************************************!*\
  !*** ./public/app/plugins/panel/heatmap/heatmap_tooltip.ts ***!
  \*************************************************************/
/*! exports provided: HeatmapTooltip */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HeatmapTooltip", function() { return HeatmapTooltip; });
/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! d3 */ "./node_modules/d3/index.js");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! app/core/utils/kbn */ "./public/app/core/utils/kbn.ts");
/* harmony import */ var _heatmap_data_converter__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./heatmap_data_converter */ "./public/app/plugins/panel/heatmap/heatmap_data_converter.ts");





var TOOLTIP_PADDING_X = 30;
var TOOLTIP_PADDING_Y = 5;
var HISTOGRAM_WIDTH = 160;
var HISTOGRAM_HEIGHT = 40;
var HeatmapTooltip = /** @class */ (function () {
    function HeatmapTooltip(elem, scope) {
        this.scope = scope;
        this.dashboard = scope.ctrl.dashboard;
        this.panelCtrl = scope.ctrl;
        this.panel = scope.ctrl.panel;
        this.heatmapPanel = elem;
        this.mouseOverBucket = false;
        this.originalFillColor = null;
        elem.on('mouseover', this.onMouseOver.bind(this));
        elem.on('mouseleave', this.onMouseLeave.bind(this));
    }
    HeatmapTooltip.prototype.onMouseOver = function (e) {
        if (!this.panel.tooltip.show || !this.scope.ctrl.data || lodash__WEBPACK_IMPORTED_MODULE_2___default.a.isEmpty(this.scope.ctrl.data.buckets)) {
            return;
        }
        if (!this.tooltip) {
            this.add();
            this.move(e);
        }
    };
    HeatmapTooltip.prototype.onMouseLeave = function () {
        this.destroy();
    };
    HeatmapTooltip.prototype.onMouseMove = function (e) {
        if (!this.panel.tooltip.show) {
            return;
        }
        this.move(e);
    };
    HeatmapTooltip.prototype.add = function () {
        this.tooltip = d3__WEBPACK_IMPORTED_MODULE_0__["select"]('body')
            .append('div')
            .attr('class', 'heatmap-tooltip graph-tooltip grafana-tooltip');
    };
    HeatmapTooltip.prototype.destroy = function () {
        if (this.tooltip) {
            this.tooltip.remove();
        }
        this.tooltip = null;
    };
    HeatmapTooltip.prototype.show = function (pos, data) {
        if (!this.panel.tooltip.show || !data) {
            return;
        }
        // shared tooltip mode
        if (pos.panelRelY) {
            return;
        }
        var _a = this.getBucketIndexes(pos, data), xBucketIndex = _a.xBucketIndex, yBucketIndex = _a.yBucketIndex;
        if (!data.buckets[xBucketIndex] || !this.tooltip) {
            this.destroy();
            return;
        }
        var boundBottom, boundTop, valuesNumber;
        var xData = data.buckets[xBucketIndex];
        // Search in special 'zero' bucket also
        var yData = lodash__WEBPACK_IMPORTED_MODULE_2___default.a.find(xData.buckets, function (bucket, bucketIndex) {
            return bucket.bounds.bottom === yBucketIndex || bucketIndex === yBucketIndex.toString();
        });
        var tooltipTimeFormat = 'YYYY-MM-DD HH:mm:ss';
        var time = this.dashboard.formatDate(xData.x, tooltipTimeFormat);
        // Decimals override. Code from panel/graph/graph.ts
        var countValueFormatter, bucketBoundFormatter;
        if (lodash__WEBPACK_IMPORTED_MODULE_2___default.a.isNumber(this.panel.tooltipDecimals)) {
            countValueFormatter = this.countValueFormatter(this.panel.tooltipDecimals, null);
            bucketBoundFormatter = this.panelCtrl.tickValueFormatter(this.panelCtrl.decimals, null);
        }
        else {
            // auto decimals
            // legend and tooltip gets one more decimal precision
            // than graph legend ticks
            var decimals = (this.panelCtrl.decimals || -1) + 1;
            countValueFormatter = this.countValueFormatter(decimals, this.panelCtrl.scaledDecimals + 2);
            bucketBoundFormatter = this.panelCtrl.tickValueFormatter(decimals, this.panelCtrl.scaledDecimals + 2);
        }
        var tooltipHtml = "<div class=\"graph-tooltip-time\">" + time + "</div>\n      <div class=\"heatmap-histogram\"></div>";
        if (yData) {
            if (yData.bounds) {
                if (data.tsBuckets) {
                    // Use Y-axis labels
                    var tickFormatter = function (valIndex) {
                        return data.tsBucketsFormatted ? data.tsBucketsFormatted[valIndex] : data.tsBuckets[valIndex];
                    };
                    boundBottom = tickFormatter(yBucketIndex);
                    boundTop = yBucketIndex < data.tsBuckets.length - 1 ? tickFormatter(yBucketIndex + 1) : '';
                }
                else {
                    // Display 0 if bucket is a special 'zero' bucket
                    var bottom = yData.y ? yData.bounds.bottom : 0;
                    boundBottom = bucketBoundFormatter(bottom);
                    boundTop = bucketBoundFormatter(yData.bounds.top);
                }
                valuesNumber = countValueFormatter(yData.count);
                tooltipHtml += "<div>\n          bucket: <b>" + boundBottom + " - " + boundTop + "</b> <br>\n          count: <b>" + valuesNumber + "</b> <br>\n        </div>";
            }
            else {
                // currently no bounds for pre bucketed data
                tooltipHtml += "<div>count: <b>" + yData.count + "</b><br></div>";
            }
        }
        else {
            if (!this.panel.tooltip.showHistogram) {
                this.destroy();
                return;
            }
            boundBottom = yBucketIndex;
            boundTop = '';
            valuesNumber = 0;
        }
        this.tooltip.html(tooltipHtml);
        if (this.panel.tooltip.showHistogram) {
            this.addHistogram(xData);
        }
        this.move(pos);
    };
    HeatmapTooltip.prototype.getBucketIndexes = function (pos, data) {
        var xBucketIndex = this.getXBucketIndex(pos.offsetX, data);
        var yBucketIndex = this.getYBucketIndex(pos.offsetY, data);
        return { xBucketIndex: xBucketIndex, yBucketIndex: yBucketIndex };
    };
    HeatmapTooltip.prototype.getXBucketIndex = function (offsetX, data) {
        var x = this.scope.xScale.invert(offsetX - this.scope.yAxisWidth).valueOf();
        // First try to find X bucket by checking x pos is in the
        // [bucket.x, bucket.x + xBucketSize] interval
        var xBucket = lodash__WEBPACK_IMPORTED_MODULE_2___default.a.find(data.buckets, function (bucket) {
            return x > bucket.x && x - bucket.x <= data.xBucketSize;
        });
        return xBucket ? xBucket.x : Object(_heatmap_data_converter__WEBPACK_IMPORTED_MODULE_4__["getValueBucketBound"])(x, data.xBucketSize, 1);
    };
    HeatmapTooltip.prototype.getYBucketIndex = function (offsetY, data) {
        var y = this.scope.yScale.invert(offsetY - this.scope.chartTop);
        if (data.tsBuckets) {
            return Math.floor(y);
        }
        var yBucketIndex = Object(_heatmap_data_converter__WEBPACK_IMPORTED_MODULE_4__["getValueBucketBound"])(y, data.yBucketSize, this.panel.yAxis.logBase);
        return yBucketIndex;
    };
    HeatmapTooltip.prototype.getSharedTooltipPos = function (pos) {
        // get pageX from position on x axis and pageY from relative position in original panel
        pos.pageX = this.heatmapPanel.offset().left + this.scope.xScale(pos.x);
        pos.pageY = this.heatmapPanel.offset().top + this.scope.chartHeight * pos.panelRelY;
        return pos;
    };
    HeatmapTooltip.prototype.addHistogram = function (data) {
        var xBucket = this.scope.ctrl.data.buckets[data.x];
        var yBucketSize = this.scope.ctrl.data.yBucketSize;
        var min, max, ticks;
        if (this.scope.ctrl.data.tsBuckets) {
            min = 0;
            max = this.scope.ctrl.data.tsBuckets.length - 1;
            ticks = this.scope.ctrl.data.tsBuckets.length;
        }
        else {
            min = this.scope.ctrl.data.yAxis.min;
            max = this.scope.ctrl.data.yAxis.max;
            ticks = this.scope.ctrl.data.yAxis.ticks;
        }
        var histogramData = lodash__WEBPACK_IMPORTED_MODULE_2___default.a.map(xBucket.buckets, function (bucket) {
            var count = bucket.count !== undefined ? bucket.count : bucket.values.length;
            return [bucket.bounds.bottom, count];
        });
        histogramData = lodash__WEBPACK_IMPORTED_MODULE_2___default.a.filter(histogramData, function (d) {
            return d[0] >= min && d[0] <= max;
        });
        var scale = this.scope.yScale.copy();
        var histXScale = scale.domain([min, max]).range([0, HISTOGRAM_WIDTH]);
        var barWidth;
        if (this.panel.yAxis.logBase === 1) {
            barWidth = Math.floor(HISTOGRAM_WIDTH / (max - min) * yBucketSize * 0.9);
        }
        else {
            var barNumberFactor = yBucketSize ? yBucketSize : 1;
            barWidth = Math.floor(HISTOGRAM_WIDTH / ticks / barNumberFactor * 0.9);
        }
        barWidth = Math.max(barWidth, 1);
        // Normalize histogram Y axis
        var histogramDomain = lodash__WEBPACK_IMPORTED_MODULE_2___default.a.reduce(lodash__WEBPACK_IMPORTED_MODULE_2___default.a.map(histogramData, function (d) { return d[1]; }), function (sum, val) { return sum + val; }, 0);
        var histYScale = d3__WEBPACK_IMPORTED_MODULE_0__["scaleLinear"]()
            .domain([0, histogramDomain])
            .range([0, HISTOGRAM_HEIGHT]);
        var histogram = this.tooltip
            .select('.heatmap-histogram')
            .append('svg')
            .attr('width', HISTOGRAM_WIDTH)
            .attr('height', HISTOGRAM_HEIGHT);
        histogram
            .selectAll('.bar')
            .data(histogramData)
            .enter()
            .append('rect')
            .attr('x', function (d) {
            return histXScale(d[0]);
        })
            .attr('width', barWidth)
            .attr('y', function (d) {
            return HISTOGRAM_HEIGHT - histYScale(d[1]);
        })
            .attr('height', function (d) {
            return histYScale(d[1]);
        });
    };
    HeatmapTooltip.prototype.move = function (pos) {
        if (!this.tooltip) {
            return;
        }
        var elem = jquery__WEBPACK_IMPORTED_MODULE_1___default()(this.tooltip.node())[0];
        var tooltipWidth = elem.clientWidth;
        var tooltipHeight = elem.clientHeight;
        var left = pos.pageX + TOOLTIP_PADDING_X;
        var top = pos.pageY + TOOLTIP_PADDING_Y;
        if (pos.pageX + tooltipWidth + 40 > window.innerWidth) {
            left = pos.pageX - tooltipWidth - TOOLTIP_PADDING_X;
        }
        if (pos.pageY - window.pageYOffset + tooltipHeight + 20 > window.innerHeight) {
            top = pos.pageY - tooltipHeight - TOOLTIP_PADDING_Y;
        }
        return this.tooltip.style('left', left + 'px').style('top', top + 'px');
    };
    HeatmapTooltip.prototype.countValueFormatter = function (decimals, scaledDecimals) {
        if (scaledDecimals === void 0) { scaledDecimals = null; }
        var format = 'short';
        return function (value) {
            return app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_3__["default"].valueFormats[format](value, decimals, scaledDecimals);
        };
    };
    return HeatmapTooltip;
}());



/***/ }),

/***/ "./public/app/plugins/panel/heatmap/rendering.ts":
/*!*******************************************************!*\
  !*** ./public/app/plugins/panel/heatmap/rendering.ts ***!
  \*******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return link; });
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! moment */ "./node_modules/moment/moment.js");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! d3 */ "./node_modules/d3/index.js");
/* harmony import */ var app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! app/core/utils/kbn */ "./public/app/core/utils/kbn.ts");
/* harmony import */ var app_core_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! app/core/core */ "./public/app/core/core.ts");
/* harmony import */ var app_core_utils_ticks__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! app/core/utils/ticks */ "./public/app/core/utils/ticks.ts");
/* harmony import */ var _heatmap_tooltip__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./heatmap_tooltip */ "./public/app/plugins/panel/heatmap/heatmap_tooltip.ts");
/* harmony import */ var _heatmap_data_converter__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./heatmap_data_converter */ "./public/app/plugins/panel/heatmap/heatmap_data_converter.ts");
/* harmony import */ var _color_scale__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./color_scale */ "./public/app/plugins/panel/heatmap/color_scale.ts");










var MIN_CARD_SIZE = 1, CARD_PADDING = 1, CARD_ROUND = 0, DATA_RANGE_WIDING_FACTOR = 1.2, DEFAULT_X_TICK_SIZE_PX = 100, DEFAULT_Y_TICK_SIZE_PX = 50, X_AXIS_TICK_PADDING = 10, Y_AXIS_TICK_PADDING = 5, MIN_SELECTION_WIDTH = 2;
function link(scope, elem, attrs, ctrl) {
    var data, timeRange, panel, heatmap;
    // $heatmap is JQuery object, but heatmap is D3
    var $heatmap = elem.find('.heatmap-panel');
    var tooltip = new _heatmap_tooltip__WEBPACK_IMPORTED_MODULE_7__["HeatmapTooltip"]($heatmap, scope);
    var width, height, yScale, xScale, chartWidth, chartHeight, chartTop, chartBottom, yAxisWidth, xAxisHeight, cardPadding, cardRound, cardWidth, cardHeight, colorScale, opacityScale, mouseUpHandler;
    var selection = {
        active: false,
        x1: -1,
        x2: -1,
    };
    var padding = { left: 0, right: 0, top: 0, bottom: 0 }, margin = { left: 25, right: 15, top: 10, bottom: 20 }, dataRangeWidingFactor = DATA_RANGE_WIDING_FACTOR;
    ctrl.events.on('render', function () {
        render();
        ctrl.renderingCompleted();
    });
    function setElementHeight() {
        try {
            var height = ctrl.height || panel.height || ctrl.row.height;
            if (lodash__WEBPACK_IMPORTED_MODULE_0___default.a.isString(height)) {
                height = parseInt(height.replace('px', ''), 10);
            }
            height -= panel.legend.show ? 28 : 11; // bottom padding and space for legend
            $heatmap.css('height', height + 'px');
            return true;
        }
        catch (e) {
            // IE throws errors sometimes
            return false;
        }
    }
    function getYAxisWidth(elem) {
        var axis_text = elem.selectAll('.axis-y text').nodes();
        var max_text_width = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.max(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.map(axis_text, function (text) {
            // Use SVG getBBox method
            return text.getBBox().width;
        }));
        return max_text_width;
    }
    function getXAxisHeight(elem) {
        var axis_line = elem.select('.axis-x line');
        if (!axis_line.empty()) {
            var axis_line_position = parseFloat(elem.select('.axis-x line').attr('y2'));
            var canvas_width = parseFloat(elem.attr('height'));
            return canvas_width - axis_line_position;
        }
        else {
            // Default height
            return 30;
        }
    }
    function addXAxis() {
        scope.xScale = xScale = d3__WEBPACK_IMPORTED_MODULE_3__["scaleTime"]()
            .domain([timeRange.from, timeRange.to])
            .range([0, chartWidth]);
        var ticks = chartWidth / DEFAULT_X_TICK_SIZE_PX;
        var grafanaTimeFormatter = app_core_utils_ticks__WEBPACK_IMPORTED_MODULE_6__["grafanaTimeFormat"](ticks, timeRange.from, timeRange.to);
        var timeFormat;
        var dashboardTimeZone = ctrl.dashboard.getTimezone();
        if (dashboardTimeZone === 'utc') {
            timeFormat = d3__WEBPACK_IMPORTED_MODULE_3__["utcFormat"](grafanaTimeFormatter);
        }
        else {
            timeFormat = d3__WEBPACK_IMPORTED_MODULE_3__["timeFormat"](grafanaTimeFormatter);
        }
        var xAxis = d3__WEBPACK_IMPORTED_MODULE_3__["axisBottom"](xScale)
            .ticks(ticks)
            .tickFormat(timeFormat)
            .tickPadding(X_AXIS_TICK_PADDING)
            .tickSize(chartHeight);
        var posY = margin.top;
        var posX = yAxisWidth;
        heatmap
            .append('g')
            .attr('class', 'axis axis-x')
            .attr('transform', 'translate(' + posX + ',' + posY + ')')
            .call(xAxis);
        // Remove horizontal line in the top of axis labels (called domain in d3)
        heatmap
            .select('.axis-x')
            .select('.domain')
            .remove();
    }
    function addYAxis() {
        var ticks = Math.ceil(chartHeight / DEFAULT_Y_TICK_SIZE_PX);
        var tick_interval = app_core_utils_ticks__WEBPACK_IMPORTED_MODULE_6__["tickStep"](data.heatmapStats.min, data.heatmapStats.max, ticks);
        var _a = wideYAxisRange(data.heatmapStats.min, data.heatmapStats.max, tick_interval), y_min = _a.y_min, y_max = _a.y_max;
        // Rewrite min and max if it have been set explicitly
        y_min = panel.yAxis.min !== null ? panel.yAxis.min : y_min;
        y_max = panel.yAxis.max !== null ? panel.yAxis.max : y_max;
        // Adjust ticks after Y range widening
        tick_interval = app_core_utils_ticks__WEBPACK_IMPORTED_MODULE_6__["tickStep"](y_min, y_max, ticks);
        ticks = Math.ceil((y_max - y_min) / tick_interval);
        var decimalsAuto = app_core_utils_ticks__WEBPACK_IMPORTED_MODULE_6__["getPrecision"](tick_interval);
        var decimals = panel.yAxis.decimals === null ? decimalsAuto : panel.yAxis.decimals;
        // Calculate scaledDecimals for log scales using tick size (as in jquery.flot.js)
        var flot_tick_size = app_core_utils_ticks__WEBPACK_IMPORTED_MODULE_6__["getFlotTickSize"](y_min, y_max, ticks, decimalsAuto);
        var scaledDecimals = app_core_utils_ticks__WEBPACK_IMPORTED_MODULE_6__["getScaledDecimals"](decimals, flot_tick_size);
        ctrl.decimals = decimals;
        ctrl.scaledDecimals = scaledDecimals;
        // Set default Y min and max if no data
        if (lodash__WEBPACK_IMPORTED_MODULE_0___default.a.isEmpty(data.buckets)) {
            y_max = 1;
            y_min = -1;
            ticks = 3;
            decimals = 1;
        }
        data.yAxis = {
            min: y_min,
            max: y_max,
            ticks: ticks,
        };
        scope.yScale = yScale = d3__WEBPACK_IMPORTED_MODULE_3__["scaleLinear"]()
            .domain([y_min, y_max])
            .range([chartHeight, 0]);
        var yAxis = d3__WEBPACK_IMPORTED_MODULE_3__["axisLeft"](yScale)
            .ticks(ticks)
            .tickFormat(tickValueFormatter(decimals, scaledDecimals))
            .tickSizeInner(0 - width)
            .tickSizeOuter(0)
            .tickPadding(Y_AXIS_TICK_PADDING);
        heatmap
            .append('g')
            .attr('class', 'axis axis-y')
            .call(yAxis);
        // Calculate Y axis width first, then move axis into visible area
        var posY = margin.top;
        var posX = getYAxisWidth(heatmap) + Y_AXIS_TICK_PADDING;
        heatmap.select('.axis-y').attr('transform', 'translate(' + posX + ',' + posY + ')');
        // Remove vertical line in the right of axis labels (called domain in d3)
        heatmap
            .select('.axis-y')
            .select('.domain')
            .remove();
    }
    // Wide Y values range and anjust to bucket size
    function wideYAxisRange(min, max, tickInterval) {
        var y_widing = (max * (dataRangeWidingFactor - 1) - min * (dataRangeWidingFactor - 1)) / 2;
        var y_min, y_max;
        if (tickInterval === 0) {
            y_max = max * dataRangeWidingFactor;
            y_min = min - min * (dataRangeWidingFactor - 1);
            tickInterval = (y_max - y_min) / 2;
        }
        else {
            y_max = Math.ceil((max + y_widing) / tickInterval) * tickInterval;
            y_min = Math.floor((min - y_widing) / tickInterval) * tickInterval;
        }
        // Don't wide axis below 0 if all values are positive
        if (min >= 0 && y_min < 0) {
            y_min = 0;
        }
        return { y_min: y_min, y_max: y_max };
    }
    function addLogYAxis() {
        var log_base = panel.yAxis.logBase;
        var _a = adjustLogRange(data.heatmapStats.minLog, data.heatmapStats.max, log_base), y_min = _a.y_min, y_max = _a.y_max;
        y_min = panel.yAxis.min && panel.yAxis.min !== '0' ? adjustLogMin(panel.yAxis.min, log_base) : y_min;
        y_max = panel.yAxis.max !== null ? adjustLogMax(panel.yAxis.max, log_base) : y_max;
        // Set default Y min and max if no data
        if (lodash__WEBPACK_IMPORTED_MODULE_0___default.a.isEmpty(data.buckets)) {
            y_max = Math.pow(log_base, 2);
            y_min = 1;
        }
        scope.yScale = yScale = d3__WEBPACK_IMPORTED_MODULE_3__["scaleLog"]()
            .base(panel.yAxis.logBase)
            .domain([y_min, y_max])
            .range([chartHeight, 0]);
        var domain = yScale.domain();
        var tick_values = logScaleTickValues(domain, log_base);
        var decimalsAuto = app_core_utils_ticks__WEBPACK_IMPORTED_MODULE_6__["getPrecision"](y_min);
        var decimals = panel.yAxis.decimals || decimalsAuto;
        // Calculate scaledDecimals for log scales using tick size (as in jquery.flot.js)
        var flot_tick_size = app_core_utils_ticks__WEBPACK_IMPORTED_MODULE_6__["getFlotTickSize"](y_min, y_max, tick_values.length, decimalsAuto);
        var scaledDecimals = app_core_utils_ticks__WEBPACK_IMPORTED_MODULE_6__["getScaledDecimals"](decimals, flot_tick_size);
        ctrl.decimals = decimals;
        ctrl.scaledDecimals = scaledDecimals;
        data.yAxis = {
            min: y_min,
            max: y_max,
            ticks: tick_values.length,
        };
        var yAxis = d3__WEBPACK_IMPORTED_MODULE_3__["axisLeft"](yScale)
            .tickValues(tick_values)
            .tickFormat(tickValueFormatter(decimals, scaledDecimals))
            .tickSizeInner(0 - width)
            .tickSizeOuter(0)
            .tickPadding(Y_AXIS_TICK_PADDING);
        heatmap
            .append('g')
            .attr('class', 'axis axis-y')
            .call(yAxis);
        // Calculate Y axis width first, then move axis into visible area
        var posY = margin.top;
        var posX = getYAxisWidth(heatmap) + Y_AXIS_TICK_PADDING;
        heatmap.select('.axis-y').attr('transform', 'translate(' + posX + ',' + posY + ')');
        // Set first tick as pseudo 0
        if (y_min < 1) {
            heatmap
                .select('.axis-y')
                .select('.tick text')
                .text('0');
        }
        // Remove vertical line in the right of axis labels (called domain in d3)
        heatmap
            .select('.axis-y')
            .select('.domain')
            .remove();
    }
    function addYAxisFromBuckets() {
        var tsBuckets = data.tsBuckets;
        scope.yScale = yScale = d3__WEBPACK_IMPORTED_MODULE_3__["scaleLinear"]()
            .domain([0, tsBuckets.length - 1])
            .range([chartHeight, 0]);
        var tick_values = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.map(tsBuckets, function (b, i) { return i; });
        var decimalsAuto = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.max(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.map(tsBuckets, app_core_utils_ticks__WEBPACK_IMPORTED_MODULE_6__["getStringPrecision"]));
        var decimals = panel.yAxis.decimals === null ? decimalsAuto : panel.yAxis.decimals;
        ctrl.decimals = decimals;
        function tickFormatter(valIndex) {
            var valueFormatted = tsBuckets[valIndex];
            if (!lodash__WEBPACK_IMPORTED_MODULE_0___default.a.isNaN(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toNumber(valueFormatted)) && valueFormatted !== '') {
                // Try to format numeric tick labels
                valueFormatted = tickValueFormatter(decimals)(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toNumber(valueFormatted));
            }
            return valueFormatted;
        }
        var tsBucketsFormatted = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.map(tsBuckets, function (v, i) { return tickFormatter(i); });
        data.tsBucketsFormatted = tsBucketsFormatted;
        var yAxis = d3__WEBPACK_IMPORTED_MODULE_3__["axisLeft"](yScale)
            .tickValues(tick_values)
            .tickFormat(tickFormatter)
            .tickSizeInner(0 - width)
            .tickSizeOuter(0)
            .tickPadding(Y_AXIS_TICK_PADDING);
        heatmap
            .append('g')
            .attr('class', 'axis axis-y')
            .call(yAxis);
        // Calculate Y axis width first, then move axis into visible area
        var posY = margin.top;
        var posX = getYAxisWidth(heatmap) + Y_AXIS_TICK_PADDING;
        heatmap.select('.axis-y').attr('transform', 'translate(' + posX + ',' + posY + ')');
        // Remove vertical line in the right of axis labels (called domain in d3)
        heatmap
            .select('.axis-y')
            .select('.domain')
            .remove();
    }
    // Adjust data range to log base
    function adjustLogRange(min, max, logBase) {
        var y_min, y_max;
        y_min = data.heatmapStats.minLog;
        if (data.heatmapStats.minLog > 1 || !data.heatmapStats.minLog) {
            y_min = 1;
        }
        else {
            y_min = adjustLogMin(data.heatmapStats.minLog, logBase);
        }
        // Adjust max Y value to log base
        y_max = adjustLogMax(data.heatmapStats.max, logBase);
        return { y_min: y_min, y_max: y_max };
    }
    function adjustLogMax(max, base) {
        return Math.pow(base, Math.ceil(app_core_utils_ticks__WEBPACK_IMPORTED_MODULE_6__["logp"](max, base)));
    }
    function adjustLogMin(min, base) {
        return Math.pow(base, Math.floor(app_core_utils_ticks__WEBPACK_IMPORTED_MODULE_6__["logp"](min, base)));
    }
    function logScaleTickValues(domain, base) {
        var domainMin = domain[0];
        var domainMax = domain[1];
        var tickValues = [];
        if (domainMin < 1) {
            var under_one_ticks = Math.floor(app_core_utils_ticks__WEBPACK_IMPORTED_MODULE_6__["logp"](domainMin, base));
            for (var i = under_one_ticks; i < 0; i++) {
                var tick_value = Math.pow(base, i);
                tickValues.push(tick_value);
            }
        }
        var ticks = Math.ceil(app_core_utils_ticks__WEBPACK_IMPORTED_MODULE_6__["logp"](domainMax, base));
        for (var i = 0; i <= ticks; i++) {
            var tick_value = Math.pow(base, i);
            tickValues.push(tick_value);
        }
        return tickValues;
    }
    function tickValueFormatter(decimals, scaledDecimals) {
        if (scaledDecimals === void 0) { scaledDecimals = null; }
        var format = panel.yAxis.format;
        return function (value) {
            try {
                return format !== 'none' ? app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_4__["default"].valueFormats[format](value, decimals, scaledDecimals) : value;
            }
            catch (err) {
                console.error(err.message || err);
                return value;
            }
        };
    }
    ctrl.tickValueFormatter = tickValueFormatter;
    function fixYAxisTickSize() {
        heatmap
            .select('.axis-y')
            .selectAll('.tick line')
            .attr('x2', chartWidth);
    }
    function addAxes() {
        chartHeight = height - margin.top - margin.bottom;
        chartTop = margin.top;
        chartBottom = chartTop + chartHeight;
        if (panel.dataFormat === 'tsbuckets') {
            addYAxisFromBuckets();
        }
        else {
            if (panel.yAxis.logBase === 1) {
                addYAxis();
            }
            else {
                addLogYAxis();
            }
        }
        yAxisWidth = getYAxisWidth(heatmap) + Y_AXIS_TICK_PADDING;
        chartWidth = width - yAxisWidth - margin.right;
        fixYAxisTickSize();
        addXAxis();
        xAxisHeight = getXAxisHeight(heatmap);
        if (!panel.yAxis.show) {
            heatmap
                .select('.axis-y')
                .selectAll('line')
                .style('opacity', 0);
        }
        if (!panel.xAxis.show) {
            heatmap
                .select('.axis-x')
                .selectAll('line')
                .style('opacity', 0);
        }
    }
    function addHeatmapCanvas() {
        var heatmap_elem = $heatmap[0];
        width = Math.floor($heatmap.width()) - padding.right;
        height = Math.floor($heatmap.height()) - padding.bottom;
        cardPadding = panel.cards.cardPadding !== null ? panel.cards.cardPadding : CARD_PADDING;
        cardRound = panel.cards.cardRound !== null ? panel.cards.cardRound : CARD_ROUND;
        if (heatmap) {
            heatmap.remove();
        }
        heatmap = d3__WEBPACK_IMPORTED_MODULE_3__["select"](heatmap_elem)
            .append('svg')
            .attr('width', width)
            .attr('height', height);
    }
    function addHeatmap() {
        addHeatmapCanvas();
        addAxes();
        if (panel.yAxis.logBase !== 1 && panel.dataFormat !== 'tsbuckets') {
            var log_base = panel.yAxis.logBase;
            var domain = yScale.domain();
            var tick_values = logScaleTickValues(domain, log_base);
            data.buckets = Object(_heatmap_data_converter__WEBPACK_IMPORTED_MODULE_8__["mergeZeroBuckets"])(data.buckets, lodash__WEBPACK_IMPORTED_MODULE_0___default.a.min(tick_values));
        }
        var cardsData = data.cards;
        var maxValueAuto = data.cardStats.max;
        var maxValue = panel.color.max || maxValueAuto;
        var minValue = panel.color.min || 0;
        var colorScheme = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.find(ctrl.colorSchemes, {
            value: panel.color.colorScheme,
        });
        colorScale = Object(_color_scale__WEBPACK_IMPORTED_MODULE_9__["getColorScale"])(colorScheme, app_core_core__WEBPACK_IMPORTED_MODULE_5__["contextSrv"].user.lightTheme, maxValue, minValue);
        opacityScale = Object(_color_scale__WEBPACK_IMPORTED_MODULE_9__["getOpacityScale"])(panel.color, maxValue);
        setCardSize();
        var cards = heatmap.selectAll('.heatmap-card').data(cardsData);
        cards.append('title');
        cards = cards
            .enter()
            .append('rect')
            .attr('x', getCardX)
            .attr('width', getCardWidth)
            .attr('y', getCardY)
            .attr('height', getCardHeight)
            .attr('rx', cardRound)
            .attr('ry', cardRound)
            .attr('class', 'bordered heatmap-card')
            .style('fill', getCardColor)
            .style('stroke', getCardColor)
            .style('stroke-width', 0)
            .style('opacity', getCardOpacity);
        var $cards = $heatmap.find('.heatmap-card');
        $cards
            .on('mouseenter', function (event) {
            tooltip.mouseOverBucket = true;
            highlightCard(event);
        })
            .on('mouseleave', function (event) {
            tooltip.mouseOverBucket = false;
            resetCardHighLight(event);
        });
    }
    function highlightCard(event) {
        var color = d3__WEBPACK_IMPORTED_MODULE_3__["select"](event.target).style('fill');
        var highlightColor = d3__WEBPACK_IMPORTED_MODULE_3__["color"](color).darker(2);
        var strokeColor = d3__WEBPACK_IMPORTED_MODULE_3__["color"](color).brighter(4);
        var current_card = d3__WEBPACK_IMPORTED_MODULE_3__["select"](event.target);
        tooltip.originalFillColor = color;
        current_card
            .style('fill', highlightColor.toString())
            .style('stroke', strokeColor.toString())
            .style('stroke-width', 1);
    }
    function resetCardHighLight(event) {
        d3__WEBPACK_IMPORTED_MODULE_3__["select"](event.target)
            .style('fill', tooltip.originalFillColor)
            .style('stroke', tooltip.originalFillColor)
            .style('stroke-width', 0);
    }
    function setCardSize() {
        var xGridSize = Math.floor(xScale(data.xBucketSize) - xScale(0));
        var yGridSize = Math.floor(yScale(yScale.invert(0) - data.yBucketSize));
        if (panel.yAxis.logBase !== 1) {
            var base = panel.yAxis.logBase;
            var splitFactor = data.yBucketSize || 1;
            yGridSize = Math.floor((yScale(1) - yScale(base)) / splitFactor);
        }
        cardWidth = xGridSize - cardPadding * 2;
        cardHeight = yGridSize ? yGridSize - cardPadding * 2 : 0;
    }
    function getCardX(d) {
        var x;
        if (xScale(d.x) < 0) {
            // Cut card left to prevent overlay
            x = yAxisWidth + cardPadding;
        }
        else {
            x = xScale(d.x) + yAxisWidth + cardPadding;
        }
        return x;
    }
    function getCardWidth(d) {
        var w;
        if (xScale(d.x) < 0) {
            // Cut card left to prevent overlay
            var cutted_width = xScale(d.x) + cardWidth;
            w = cutted_width > 0 ? cutted_width : 0;
        }
        else if (xScale(d.x) + cardWidth > chartWidth) {
            // Cut card right to prevent overlay
            w = chartWidth - xScale(d.x) - cardPadding;
        }
        else {
            w = cardWidth;
        }
        // Card width should be MIN_CARD_SIZE at least
        w = Math.max(w, MIN_CARD_SIZE);
        return w;
    }
    function getCardY(d) {
        var y = yScale(d.y) + chartTop - cardHeight - cardPadding;
        if (panel.yAxis.logBase !== 1 && d.y === 0) {
            y = chartBottom - cardHeight - cardPadding;
        }
        else {
            if (y < chartTop) {
                y = chartTop;
            }
        }
        return y;
    }
    function getCardHeight(d) {
        var y = yScale(d.y) + chartTop - cardHeight - cardPadding;
        var h = cardHeight;
        if (panel.yAxis.logBase !== 1 && d.y === 0) {
            return cardHeight;
        }
        // Cut card height to prevent overlay
        if (y < chartTop) {
            h = yScale(d.y) - cardPadding;
        }
        else if (yScale(d.y) > chartBottom) {
            h = chartBottom - y;
        }
        else if (y + cardHeight > chartBottom) {
            h = chartBottom - y;
        }
        // Height can't be more than chart height
        h = Math.min(h, chartHeight);
        // Card height should be MIN_CARD_SIZE at least
        h = Math.max(h, MIN_CARD_SIZE);
        return h;
    }
    function getCardColor(d) {
        if (panel.color.mode === 'opacity') {
            return panel.color.cardColor;
        }
        else {
            return colorScale(d.count);
        }
    }
    function getCardOpacity(d) {
        if (panel.color.mode === 'opacity') {
            return opacityScale(d.count);
        }
        else {
            return 1;
        }
    }
    /////////////////////////////
    // Selection and crosshair //
    /////////////////////////////
    // Shared crosshair and tooltip
    app_core_core__WEBPACK_IMPORTED_MODULE_5__["appEvents"].on('graph-hover', function (event) {
        drawSharedCrosshair(event.pos);
    }, scope);
    app_core_core__WEBPACK_IMPORTED_MODULE_5__["appEvents"].on('graph-hover-clear', function () {
        clearCrosshair();
    }, scope);
    function onMouseDown(event) {
        selection.active = true;
        selection.x1 = event.offsetX;
        mouseUpHandler = function () {
            onMouseUp();
        };
        jquery__WEBPACK_IMPORTED_MODULE_1___default()(document).one('mouseup', mouseUpHandler);
    }
    function onMouseUp() {
        jquery__WEBPACK_IMPORTED_MODULE_1___default()(document).unbind('mouseup', mouseUpHandler);
        mouseUpHandler = null;
        selection.active = false;
        var selectionRange = Math.abs(selection.x2 - selection.x1);
        if (selection.x2 >= 0 && selectionRange > MIN_SELECTION_WIDTH) {
            var timeFrom = xScale.invert(Math.min(selection.x1, selection.x2) - yAxisWidth);
            var timeTo = xScale.invert(Math.max(selection.x1, selection.x2) - yAxisWidth);
            ctrl.timeSrv.setTime({
                from: moment__WEBPACK_IMPORTED_MODULE_2___default.a.utc(timeFrom),
                to: moment__WEBPACK_IMPORTED_MODULE_2___default.a.utc(timeTo),
            });
        }
        clearSelection();
    }
    function onMouseLeave() {
        app_core_core__WEBPACK_IMPORTED_MODULE_5__["appEvents"].emit('graph-hover-clear');
        clearCrosshair();
    }
    function onMouseMove(event) {
        if (!heatmap) {
            return;
        }
        if (selection.active) {
            // Clear crosshair and tooltip
            clearCrosshair();
            tooltip.destroy();
            selection.x2 = limitSelection(event.offsetX);
            drawSelection(selection.x1, selection.x2);
        }
        else {
            emitGraphHoverEvent(event);
            drawCrosshair(event.offsetX);
            tooltip.show(event, data);
        }
    }
    function emitGraphHoverEvent(event) {
        var x = xScale.invert(event.offsetX - yAxisWidth).valueOf();
        var y = yScale.invert(event.offsetY);
        var pos = {
            pageX: event.pageX,
            pageY: event.pageY,
            x: x,
            x1: x,
            y: y,
            y1: y,
            panelRelY: null,
        };
        // Set minimum offset to prevent showing legend from another panel
        pos.panelRelY = Math.max(event.offsetY / height, 0.001);
        // broadcast to other graph panels that we are hovering
        app_core_core__WEBPACK_IMPORTED_MODULE_5__["appEvents"].emit('graph-hover', { pos: pos, panel: panel });
    }
    function limitSelection(x2) {
        x2 = Math.max(x2, yAxisWidth);
        x2 = Math.min(x2, chartWidth + yAxisWidth);
        return x2;
    }
    function drawSelection(posX1, posX2) {
        if (heatmap) {
            heatmap.selectAll('.heatmap-selection').remove();
            var selectionX = Math.min(posX1, posX2);
            var selectionWidth = Math.abs(posX1 - posX2);
            if (selectionWidth > MIN_SELECTION_WIDTH) {
                heatmap
                    .append('rect')
                    .attr('class', 'heatmap-selection')
                    .attr('x', selectionX)
                    .attr('width', selectionWidth)
                    .attr('y', chartTop)
                    .attr('height', chartHeight);
            }
        }
    }
    function clearSelection() {
        selection.x1 = -1;
        selection.x2 = -1;
        if (heatmap) {
            heatmap.selectAll('.heatmap-selection').remove();
        }
    }
    function drawCrosshair(position) {
        if (heatmap) {
            heatmap.selectAll('.heatmap-crosshair').remove();
            var posX = position;
            posX = Math.max(posX, yAxisWidth);
            posX = Math.min(posX, chartWidth + yAxisWidth);
            heatmap
                .append('g')
                .attr('class', 'heatmap-crosshair')
                .attr('transform', 'translate(' + posX + ',0)')
                .append('line')
                .attr('x1', 1)
                .attr('y1', chartTop)
                .attr('x2', 1)
                .attr('y2', chartBottom)
                .attr('stroke-width', 1);
        }
    }
    function drawSharedCrosshair(pos) {
        if (heatmap && ctrl.dashboard.graphTooltip !== 0) {
            var posX = xScale(pos.x) + yAxisWidth;
            drawCrosshair(posX);
        }
    }
    function clearCrosshair() {
        if (heatmap) {
            heatmap.selectAll('.heatmap-crosshair').remove();
        }
    }
    function render() {
        data = ctrl.data;
        panel = ctrl.panel;
        timeRange = ctrl.range;
        if (!setElementHeight() || !data) {
            return;
        }
        // Draw default axes and return if no data
        if (lodash__WEBPACK_IMPORTED_MODULE_0___default.a.isEmpty(data.buckets)) {
            addHeatmapCanvas();
            addAxes();
            return;
        }
        addHeatmap();
        scope.yAxisWidth = yAxisWidth;
        scope.xAxisHeight = xAxisHeight;
        scope.chartHeight = chartHeight;
        scope.chartWidth = chartWidth;
        scope.chartTop = chartTop;
    }
    // Register selection listeners
    $heatmap.on('mousedown', onMouseDown);
    $heatmap.on('mousemove', onMouseMove);
    $heatmap.on('mouseleave', onMouseLeave);
}


/***/ }),

/***/ "./public/app/plugins/panel/singlestat/module.ts":
/*!*******************************************************!*\
  !*** ./public/app/plugins/panel/singlestat/module.ts ***!
  \*******************************************************/
/*! exports provided: SingleStatCtrl, PanelCtrl, getColorForValue */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SingleStatCtrl", function() { return SingleStatCtrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PanelCtrl", function() { return SingleStatCtrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getColorForValue", function() { return getColorForValue; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var vendor_flot_jquery_flot__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! vendor/flot/jquery.flot */ "./public/vendor/flot/jquery.flot.js");
/* harmony import */ var vendor_flot_jquery_flot__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(vendor_flot_jquery_flot__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var vendor_flot_jquery_flot_gauge__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! vendor/flot/jquery.flot.gauge */ "./public/vendor/flot/jquery.flot.gauge.js");
/* harmony import */ var vendor_flot_jquery_flot_gauge__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(vendor_flot_jquery_flot_gauge__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var app_features_panellinks_link_srv__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! app/features/panellinks/link_srv */ "./public/app/features/panellinks/link_srv.ts");
/* harmony import */ var app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! app/core/utils/kbn */ "./public/app/core/utils/kbn.ts");
/* harmony import */ var app_core_config__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! app/core/config */ "./public/app/core/config.ts");
/* harmony import */ var app_core_time_series2__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! app/core/time_series2 */ "./public/app/core/time_series2.ts");
/* harmony import */ var app_plugins_sdk__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! app/plugins/sdk */ "./public/app/plugins/sdk.ts");










var SingleStatCtrl = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](SingleStatCtrl, _super);
    /** @ngInject */
    function SingleStatCtrl($scope, $injector, linkSrv) {
        var _this = _super.call(this, $scope, $injector) || this;
        _this.linkSrv = linkSrv;
        _this.dataType = 'timeseries';
        _this.valueNameOptions = [
            { value: 'min', text: 'Min' },
            { value: 'max', text: 'Max' },
            { value: 'avg', text: 'Average' },
            { value: 'current', text: 'Current' },
            { value: 'total', text: 'Total' },
            { value: 'name', text: 'Name' },
            { value: 'first', text: 'First' },
            { value: 'delta', text: 'Delta' },
            { value: 'diff', text: 'Difference' },
            { value: 'range', text: 'Range' },
            { value: 'last_time', text: 'Time of last point' },
        ];
        // Set and populate defaults
        _this.panelDefaults = {
            links: [],
            datasource: null,
            maxDataPoints: 100,
            interval: null,
            targets: [{}],
            cacheTimeout: null,
            format: 'none',
            prefix: '',
            postfix: '',
            nullText: null,
            valueMaps: [{ value: 'null', op: '=', text: 'N/A' }],
            mappingTypes: [{ name: 'value to text', value: 1 }, { name: 'range to text', value: 2 }],
            rangeMaps: [{ from: 'null', to: 'null', text: 'N/A' }],
            mappingType: 1,
            nullPointMode: 'connected',
            valueName: 'avg',
            prefixFontSize: '50%',
            valueFontSize: '80%',
            postfixFontSize: '50%',
            thresholds: '',
            colorBackground: false,
            colorValue: false,
            colors: ['#299c46', 'rgba(237, 129, 40, 0.89)', '#d44a3a'],
            sparkline: {
                show: false,
                full: false,
                lineColor: 'rgb(31, 120, 193)',
                fillColor: 'rgba(31, 118, 189, 0.18)',
            },
            gauge: {
                show: false,
                minValue: 0,
                maxValue: 100,
                thresholdMarkers: true,
                thresholdLabels: false,
            },
            tableColumn: '',
        };
        lodash__WEBPACK_IMPORTED_MODULE_1___default.a.defaults(_this.panel, _this.panelDefaults);
        _this.events.on('data-received', _this.onDataReceived.bind(_this));
        _this.events.on('data-error', _this.onDataError.bind(_this));
        _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_this));
        _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
        _this.onSparklineColorChange = _this.onSparklineColorChange.bind(_this);
        _this.onSparklineFillChange = _this.onSparklineFillChange.bind(_this);
        return _this;
    }
    SingleStatCtrl.prototype.onInitEditMode = function () {
        this.fontSizes = ['20%', '30%', '50%', '70%', '80%', '100%', '110%', '120%', '150%', '170%', '200%'];
        this.addEditorTab('Options', 'public/app/plugins/panel/singlestat/editor.html', 2);
        this.addEditorTab('Value Mappings', 'public/app/plugins/panel/singlestat/mappings.html', 3);
        this.unitFormats = app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_6__["default"].getUnitFormats();
    };
    SingleStatCtrl.prototype.setUnitFormat = function (subItem) {
        this.panel.format = subItem.value;
        this.refresh();
    };
    SingleStatCtrl.prototype.onDataError = function (err) {
        this.onDataReceived([]);
    };
    SingleStatCtrl.prototype.onDataReceived = function (dataList) {
        var data = {};
        if (dataList.length > 0 && dataList[0].type === 'table') {
            this.dataType = 'table';
            var tableData = dataList.map(this.tableHandler.bind(this));
            this.setTableValues(tableData, data);
        }
        else {
            this.dataType = 'timeseries';
            this.series = dataList.map(this.seriesHandler.bind(this));
            this.setValues(data);
        }
        this.data = data;
        this.render();
    };
    SingleStatCtrl.prototype.seriesHandler = function (seriesData) {
        var series = new app_core_time_series2__WEBPACK_IMPORTED_MODULE_8__["default"]({
            datapoints: seriesData.datapoints || [],
            alias: seriesData.target,
        });
        series.flotpairs = series.getFlotPairs(this.panel.nullPointMode);
        return series;
    };
    SingleStatCtrl.prototype.tableHandler = function (tableData) {
        var datapoints = [];
        var columnNames = {};
        tableData.columns.forEach(function (column, columnIndex) {
            columnNames[columnIndex] = column.text;
        });
        this.tableColumnOptions = columnNames;
        if (!lodash__WEBPACK_IMPORTED_MODULE_1___default.a.find(tableData.columns, ['text', this.panel.tableColumn])) {
            this.setTableColumnToSensibleDefault(tableData);
        }
        tableData.rows.forEach(function (row) {
            var datapoint = {};
            row.forEach(function (value, columnIndex) {
                var key = columnNames[columnIndex];
                datapoint[key] = value;
            });
            datapoints.push(datapoint);
        });
        return datapoints;
    };
    SingleStatCtrl.prototype.setTableColumnToSensibleDefault = function (tableData) {
        if (tableData.columns.length === 1) {
            this.panel.tableColumn = tableData.columns[0].text;
        }
        else {
            this.panel.tableColumn = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.find(tableData.columns, function (col) {
                return col.type !== 'time';
            }).text;
        }
    };
    SingleStatCtrl.prototype.setTableValues = function (tableData, data) {
        if (!tableData || tableData.length === 0) {
            return;
        }
        if (tableData[0].length === 0 || tableData[0][0][this.panel.tableColumn] === undefined) {
            return;
        }
        var datapoint = tableData[0][0];
        data.value = datapoint[this.panel.tableColumn];
        if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isString(data.value)) {
            data.valueFormatted = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.escape(data.value);
            data.value = 0;
            data.valueRounded = 0;
        }
        else {
            var decimalInfo = this.getDecimalsForValue(data.value);
            var formatFunc = app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_6__["default"].valueFormats[this.panel.format];
            data.valueFormatted = formatFunc(datapoint[this.panel.tableColumn], decimalInfo.decimals, decimalInfo.scaledDecimals);
            data.valueRounded = app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_6__["default"].roundValue(data.value, this.panel.decimals || 0);
        }
        this.setValueMapping(data);
    };
    SingleStatCtrl.prototype.canModifyText = function () {
        return !this.panel.gauge.show;
    };
    SingleStatCtrl.prototype.setColoring = function (options) {
        if (options.background) {
            this.panel.colorValue = false;
            this.panel.colors = ['rgba(71, 212, 59, 0.4)', 'rgba(245, 150, 40, 0.73)', 'rgba(225, 40, 40, 0.59)'];
        }
        else {
            this.panel.colorBackground = false;
            this.panel.colors = ['rgba(50, 172, 45, 0.97)', 'rgba(237, 129, 40, 0.89)', 'rgba(245, 54, 54, 0.9)'];
        }
        this.render();
    };
    SingleStatCtrl.prototype.invertColorOrder = function () {
        var tmp = this.panel.colors[0];
        this.panel.colors[0] = this.panel.colors[2];
        this.panel.colors[2] = tmp;
        this.render();
    };
    SingleStatCtrl.prototype.onColorChange = function (panelColorIndex) {
        var _this = this;
        return function (color) {
            _this.panel.colors[panelColorIndex] = color;
            _this.render();
        };
    };
    SingleStatCtrl.prototype.onSparklineColorChange = function (newColor) {
        this.panel.sparkline.lineColor = newColor;
        this.render();
    };
    SingleStatCtrl.prototype.onSparklineFillChange = function (newColor) {
        this.panel.sparkline.fillColor = newColor;
        this.render();
    };
    SingleStatCtrl.prototype.getDecimalsForValue = function (value) {
        if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isNumber(this.panel.decimals)) {
            return { decimals: this.panel.decimals, scaledDecimals: null };
        }
        var delta = value / 2;
        var dec = -Math.floor(Math.log(delta) / Math.LN10);
        var magn = Math.pow(10, -dec), norm = delta / magn, // norm is between 1.0 and 10.0
        size;
        if (norm < 1.5) {
            size = 1;
        }
        else if (norm < 3) {
            size = 2;
            // special case for 2.5, requires an extra decimal
            if (norm > 2.25) {
                size = 2.5;
                ++dec;
            }
        }
        else if (norm < 7.5) {
            size = 5;
        }
        else {
            size = 10;
        }
        size *= magn;
        // reduce starting decimals if not needed
        if (Math.floor(value) === value) {
            dec = 0;
        }
        var result = {};
        result.decimals = Math.max(0, dec);
        result.scaledDecimals = result.decimals - Math.floor(Math.log(size) / Math.LN10) + 2;
        return result;
    };
    SingleStatCtrl.prototype.setValues = function (data) {
        data.flotpairs = [];
        if (this.series.length > 1) {
            var error = new Error();
            error.message = 'Multiple Series Error';
            error.data =
                'Metric query returns ' +
                    this.series.length +
                    ' series. Single Stat Panel expects a single series.\n\nResponse:\n' +
                    JSON.stringify(this.series);
            throw error;
        }
        if (this.series && this.series.length > 0) {
            var lastPoint = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.last(this.series[0].datapoints);
            var lastValue = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isArray(lastPoint) ? lastPoint[0] : null;
            if (this.panel.valueName === 'name') {
                data.value = 0;
                data.valueRounded = 0;
                data.valueFormatted = this.series[0].alias;
            }
            else if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isString(lastValue)) {
                data.value = 0;
                data.valueFormatted = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.escape(lastValue);
                data.valueRounded = 0;
            }
            else if (this.panel.valueName === 'last_time') {
                var formatFunc = app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_6__["default"].valueFormats[this.panel.format];
                data.value = lastPoint[1];
                data.valueRounded = data.value;
                data.valueFormatted = formatFunc(data.value, this.dashboard.isTimezoneUtc());
            }
            else {
                data.value = this.series[0].stats[this.panel.valueName];
                data.flotpairs = this.series[0].flotpairs;
                var decimalInfo = this.getDecimalsForValue(data.value);
                var formatFunc = app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_6__["default"].valueFormats[this.panel.format];
                data.valueFormatted = formatFunc(data.value, decimalInfo.decimals, decimalInfo.scaledDecimals);
                data.valueRounded = app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_6__["default"].roundValue(data.value, decimalInfo.decimals);
            }
            // Add $__name variable for using in prefix or postfix
            data.scopedVars = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.extend({}, this.panel.scopedVars);
            data.scopedVars['__name'] = { value: this.series[0].label };
        }
        this.setValueMapping(data);
    };
    SingleStatCtrl.prototype.setValueMapping = function (data) {
        // check value to text mappings if its enabled
        if (this.panel.mappingType === 1) {
            for (var i = 0; i < this.panel.valueMaps.length; i++) {
                var map = this.panel.valueMaps[i];
                // special null case
                if (map.value === 'null') {
                    if (data.value === null || data.value === void 0) {
                        data.valueFormatted = map.text;
                        return;
                    }
                    continue;
                }
                // value/number to text mapping
                var value = parseFloat(map.value);
                if (value === data.valueRounded) {
                    data.valueFormatted = map.text;
                    return;
                }
            }
        }
        else if (this.panel.mappingType === 2) {
            for (var i = 0; i < this.panel.rangeMaps.length; i++) {
                var map = this.panel.rangeMaps[i];
                // special null case
                if (map.from === 'null' && map.to === 'null') {
                    if (data.value === null || data.value === void 0) {
                        data.valueFormatted = map.text;
                        return;
                    }
                    continue;
                }
                // value/number to range mapping
                var from = parseFloat(map.from);
                var to = parseFloat(map.to);
                if (to >= data.valueRounded && from <= data.valueRounded) {
                    data.valueFormatted = map.text;
                    return;
                }
            }
        }
        if (data.value === null || data.value === void 0) {
            data.valueFormatted = 'no value';
        }
    };
    SingleStatCtrl.prototype.removeValueMap = function (map) {
        var index = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.indexOf(this.panel.valueMaps, map);
        this.panel.valueMaps.splice(index, 1);
        this.render();
    };
    SingleStatCtrl.prototype.addValueMap = function () {
        this.panel.valueMaps.push({ value: '', op: '=', text: '' });
    };
    SingleStatCtrl.prototype.removeRangeMap = function (rangeMap) {
        var index = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.indexOf(this.panel.rangeMaps, rangeMap);
        this.panel.rangeMaps.splice(index, 1);
        this.render();
    };
    SingleStatCtrl.prototype.addRangeMap = function () {
        this.panel.rangeMaps.push({ from: '', to: '', text: '' });
    };
    SingleStatCtrl.prototype.link = function (scope, elem, attrs, ctrl) {
        var $location = this.$location;
        var linkSrv = this.linkSrv;
        var $timeout = this.$timeout;
        var panel = ctrl.panel;
        var templateSrv = this.templateSrv;
        var data, linkInfo;
        var $panelContainer = elem.find('.panel-container');
        elem = elem.find('.singlestat-panel');
        function applyColoringThresholds(value, valueString) {
            var color = getColorForValue(data, value);
            if (color) {
                return '<span style="color:' + color + '">' + valueString + '</span>';
            }
            return valueString;
        }
        function getSpan(className, fontSize, value) {
            value = templateSrv.replace(value, data.scopedVars);
            return '<span class="' + className + '" style="font-size:' + fontSize + '">' + value + '</span>';
        }
        function getBigValueHtml() {
            var body = '<div class="singlestat-panel-value-container">';
            if (panel.prefix) {
                var prefix = panel.prefix;
                if (panel.colorPrefix) {
                    prefix = applyColoringThresholds(data.value, panel.prefix);
                }
                body += getSpan('singlestat-panel-prefix', panel.prefixFontSize, prefix);
            }
            var value = data.valueFormatted;
            if (panel.colorValue) {
                value = applyColoringThresholds(data.value, value);
            }
            body += getSpan('singlestat-panel-value', panel.valueFontSize, value);
            if (panel.postfix) {
                var postfix = panel.postfix;
                if (panel.colorPostfix) {
                    postfix = applyColoringThresholds(data.value, panel.postfix);
                }
                body += getSpan('singlestat-panel-postfix', panel.postfixFontSize, postfix);
            }
            body += '</div>';
            return body;
        }
        function getValueText() {
            var result = panel.prefix ? templateSrv.replace(panel.prefix, data.scopedVars) : '';
            result += data.valueFormatted;
            result += panel.postfix ? templateSrv.replace(panel.postfix, data.scopedVars) : '';
            return result;
        }
        function addGauge() {
            var width = elem.width();
            var height = elem.height();
            // Allow to use a bit more space for wide gauges
            var dimension = Math.min(width, height * 1.3);
            ctrl.invalidGaugeRange = false;
            if (panel.gauge.minValue > panel.gauge.maxValue) {
                ctrl.invalidGaugeRange = true;
                return;
            }
            var plotCanvas = jquery__WEBPACK_IMPORTED_MODULE_2___default()('<div></div>');
            var plotCss = {
                top: '10px',
                margin: 'auto',
                position: 'relative',
                height: height * 0.9 + 'px',
                width: dimension + 'px',
            };
            plotCanvas.css(plotCss);
            var thresholds = [];
            for (var i = 0; i < data.thresholds.length; i++) {
                thresholds.push({
                    value: data.thresholds[i],
                    color: data.colorMap[i],
                });
            }
            thresholds.push({
                value: panel.gauge.maxValue,
                color: data.colorMap[data.colorMap.length - 1],
            });
            var bgColor = app_core_config__WEBPACK_IMPORTED_MODULE_7__["default"].bootData.user.lightTheme ? 'rgb(230,230,230)' : 'rgb(38,38,38)';
            var fontScale = parseInt(panel.valueFontSize) / 100;
            var fontSize = Math.min(dimension / 5, 100) * fontScale;
            // Reduce gauge width if threshold labels enabled
            var gaugeWidthReduceRatio = panel.gauge.thresholdLabels ? 1.5 : 1;
            var gaugeWidth = Math.min(dimension / 6, 60) / gaugeWidthReduceRatio;
            var thresholdMarkersWidth = gaugeWidth / 5;
            var thresholdLabelFontSize = fontSize / 2.5;
            var options = {
                series: {
                    gauges: {
                        gauge: {
                            min: panel.gauge.minValue,
                            max: panel.gauge.maxValue,
                            background: { color: bgColor },
                            border: { color: null },
                            shadow: { show: false },
                            width: gaugeWidth,
                        },
                        frame: { show: false },
                        label: { show: false },
                        layout: { margin: 0, thresholdWidth: 0 },
                        cell: { border: { width: 0 } },
                        threshold: {
                            values: thresholds,
                            label: {
                                show: panel.gauge.thresholdLabels,
                                margin: thresholdMarkersWidth + 1,
                                font: { size: thresholdLabelFontSize },
                            },
                            show: panel.gauge.thresholdMarkers,
                            width: thresholdMarkersWidth,
                        },
                        value: {
                            color: panel.colorValue ? getColorForValue(data, data.valueRounded) : null,
                            formatter: function () {
                                return getValueText();
                            },
                            font: {
                                size: fontSize,
                                family: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                            },
                        },
                        show: true,
                    },
                },
            };
            elem.append(plotCanvas);
            var plotSeries = {
                data: [[0, data.valueRounded]],
            };
            jquery__WEBPACK_IMPORTED_MODULE_2___default.a.plot(plotCanvas, [plotSeries], options);
        }
        function addSparkline() {
            var width = elem.width() + 20;
            if (width < 30) {
                // element has not gotten it's width yet
                // delay sparkline render
                setTimeout(addSparkline, 30);
                return;
            }
            var height = ctrl.height;
            var plotCanvas = jquery__WEBPACK_IMPORTED_MODULE_2___default()('<div></div>');
            var plotCss = {};
            plotCss.position = 'absolute';
            if (panel.sparkline.full) {
                plotCss.bottom = '5px';
                plotCss.left = '-5px';
                plotCss.width = width - 10 + 'px';
                var dynamicHeightMargin = height <= 100 ? 5 : Math.round(height / 100) * 15 + 5;
                plotCss.height = height - dynamicHeightMargin + 'px';
            }
            else {
                plotCss.bottom = '0px';
                plotCss.left = '-5px';
                plotCss.width = width - 10 + 'px';
                plotCss.height = Math.floor(height * 0.25) + 'px';
            }
            plotCanvas.css(plotCss);
            var options = {
                legend: { show: false },
                series: {
                    lines: {
                        show: true,
                        fill: 1,
                        zero: false,
                        lineWidth: 1,
                        fillColor: panel.sparkline.fillColor,
                    },
                },
                yaxes: { show: false },
                xaxis: {
                    show: false,
                    mode: 'time',
                    min: ctrl.range.from.valueOf(),
                    max: ctrl.range.to.valueOf(),
                },
                grid: { hoverable: false, show: false },
            };
            elem.append(plotCanvas);
            var plotSeries = {
                data: data.flotpairs,
                color: panel.sparkline.lineColor,
            };
            jquery__WEBPACK_IMPORTED_MODULE_2___default.a.plot(plotCanvas, [plotSeries], options);
        }
        function render() {
            if (!ctrl.data) {
                return;
            }
            data = ctrl.data;
            // get thresholds
            data.thresholds = panel.thresholds.split(',').map(function (strVale) {
                return Number(strVale.trim());
            });
            data.colorMap = panel.colors;
            var body = panel.gauge.show ? '' : getBigValueHtml();
            if (panel.colorBackground) {
                var color = getColorForValue(data, data.value);
                if (color) {
                    $panelContainer.css('background-color', color);
                    if (scope.fullscreen) {
                        elem.css('background-color', color);
                    }
                    else {
                        elem.css('background-color', '');
                    }
                }
            }
            else {
                $panelContainer.css('background-color', '');
                elem.css('background-color', '');
            }
            elem.html(body);
            if (panel.sparkline.show) {
                addSparkline();
            }
            if (panel.gauge.show) {
                addGauge();
            }
            elem.toggleClass('pointer', panel.links.length > 0);
            if (panel.links.length > 0) {
                linkInfo = linkSrv.getPanelLinkAnchorInfo(panel.links[0], data.scopedVars);
            }
            else {
                linkInfo = null;
            }
        }
        function hookupDrilldownLinkTooltip() {
            // drilldown link tooltip
            var drilldownTooltip = jquery__WEBPACK_IMPORTED_MODULE_2___default()('<div id="tooltip" class="">hello</div>"');
            elem.mouseleave(function () {
                if (panel.links.length === 0) {
                    return;
                }
                $timeout(function () {
                    drilldownTooltip.detach();
                });
            });
            elem.click(function (evt) {
                if (!linkInfo) {
                    return;
                }
                // ignore title clicks in title
                if (jquery__WEBPACK_IMPORTED_MODULE_2___default()(evt).parents('.panel-header').length > 0) {
                    return;
                }
                if (linkInfo.target === '_blank') {
                    window.open(linkInfo.href, '_blank');
                    return;
                }
                if (linkInfo.href.indexOf('http') === 0) {
                    window.location.href = linkInfo.href;
                }
                else {
                    $timeout(function () {
                        $location.url(linkInfo.href);
                    });
                }
                drilldownTooltip.detach();
            });
            elem.mousemove(function (e) {
                if (!linkInfo) {
                    return;
                }
                drilldownTooltip.text('click to go to: ' + linkInfo.title);
                drilldownTooltip.place_tt(e.pageX, e.pageY - 50);
            });
        }
        hookupDrilldownLinkTooltip();
        this.events.on('render', function () {
            render();
            ctrl.renderingCompleted();
        });
    };
    SingleStatCtrl.templateUrl = 'module.html';
    return SingleStatCtrl;
}(app_plugins_sdk__WEBPACK_IMPORTED_MODULE_9__["MetricsPanelCtrl"]));
function getColorForValue(data, value) {
    if (!lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isFinite(value)) {
        return null;
    }
    for (var i = data.thresholds.length; i > 0; i--) {
        if (value >= data.thresholds[i - 1]) {
            return data.colorMap[i];
        }
    }
    return lodash__WEBPACK_IMPORTED_MODULE_1___default.a.first(data.colorMap);
}



/***/ }),

/***/ "./public/app/plugins/panel/table/module.ts":
/*!**************************************************!*\
  !*** ./public/app/plugins/panel/table/module.ts ***!
  \**************************************************/
/*! exports provided: TablePanelCtrl, PanelCtrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TablePanelCtrl", function() { return TablePanelCtrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PanelCtrl", function() { return TablePanelCtrl; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var app_plugins_sdk__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! app/plugins/sdk */ "./public/app/plugins/sdk.ts");
/* harmony import */ var _transformers__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./transformers */ "./public/app/plugins/panel/table/transformers.ts");
/* harmony import */ var _editor__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./editor */ "./public/app/plugins/panel/table/editor.ts");
/* harmony import */ var _column_options__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./column_options */ "./public/app/plugins/panel/table/column_options.ts");
/* harmony import */ var _renderer__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./renderer */ "./public/app/plugins/panel/table/renderer.ts");








var TablePanelCtrl = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](TablePanelCtrl, _super);
    /** @ngInject */
    function TablePanelCtrl($scope, $injector, templateSrv, annotationsSrv, $sanitize, variableSrv) {
        var _this = _super.call(this, $scope, $injector) || this;
        _this.annotationsSrv = annotationsSrv;
        _this.$sanitize = $sanitize;
        _this.variableSrv = variableSrv;
        _this.panelDefaults = {
            targets: [{}],
            transform: 'timeseries_to_columns',
            pageSize: null,
            showHeader: true,
            styles: [
                {
                    type: 'date',
                    pattern: 'Time',
                    alias: 'Time',
                    dateFormat: 'YYYY-MM-DD HH:mm:ss',
                },
                {
                    unit: 'short',
                    type: 'number',
                    alias: '',
                    decimals: 2,
                    colors: ['rgba(245, 54, 54, 0.9)', 'rgba(237, 129, 40, 0.89)', 'rgba(50, 172, 45, 0.97)'],
                    colorMode: null,
                    pattern: '/.*/',
                    thresholds: [],
                },
            ],
            columns: [],
            scroll: true,
            fontSize: '100%',
            sort: { col: 0, desc: true },
        };
        _this.pageIndex = 0;
        if (_this.panel.styles === void 0) {
            _this.panel.styles = _this.panel.columns;
            _this.panel.columns = _this.panel.fields;
            delete _this.panel.columns;
            delete _this.panel.fields;
        }
        lodash__WEBPACK_IMPORTED_MODULE_1___default.a.defaults(_this.panel, _this.panelDefaults);
        _this.events.on('data-received', _this.onDataReceived.bind(_this));
        _this.events.on('data-error', _this.onDataError.bind(_this));
        _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_this));
        _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
        _this.events.on('init-panel-actions', _this.onInitPanelActions.bind(_this));
        return _this;
    }
    TablePanelCtrl.prototype.onInitEditMode = function () {
        this.addEditorTab('Options', _editor__WEBPACK_IMPORTED_MODULE_5__["tablePanelEditor"], 2);
        this.addEditorTab('Column Styles', _column_options__WEBPACK_IMPORTED_MODULE_6__["columnOptionsTab"], 3);
    };
    TablePanelCtrl.prototype.onInitPanelActions = function (actions) {
        actions.push({ text: 'Export CSV', click: 'ctrl.exportCsv()' });
    };
    TablePanelCtrl.prototype.issueQueries = function (datasource) {
        this.pageIndex = 0;
        if (this.panel.transform === 'annotations') {
            this.setTimeQueryStart();
            return this.annotationsSrv
                .getAnnotations({
                dashboard: this.dashboard,
                panel: this.panel,
                range: this.range,
            })
                .then(function (annotations) {
                return { data: annotations };
            });
        }
        return _super.prototype.issueQueries.call(this, datasource);
    };
    TablePanelCtrl.prototype.onDataError = function (err) {
        this.dataRaw = [];
        this.render();
    };
    TablePanelCtrl.prototype.onDataReceived = function (dataList) {
        this.dataRaw = dataList;
        this.pageIndex = 0;
        // automatically correct transform mode based on data
        if (this.dataRaw && this.dataRaw.length) {
            if (this.dataRaw[0].type === 'table') {
                this.panel.transform = 'table';
            }
            else {
                if (this.dataRaw[0].type === 'docs') {
                    this.panel.transform = 'json';
                }
                else {
                    if (this.panel.transform === 'table' || this.panel.transform === 'json') {
                        this.panel.transform = 'timeseries_to_rows';
                    }
                }
            }
        }
        this.render();
    };
    TablePanelCtrl.prototype.render = function () {
        this.table = Object(_transformers__WEBPACK_IMPORTED_MODULE_4__["transformDataToTable"])(this.dataRaw, this.panel);
        this.table.sort(this.panel.sort);
        this.renderer = new _renderer__WEBPACK_IMPORTED_MODULE_7__["TableRenderer"](this.panel, this.table, this.dashboard.isTimezoneUtc(), this.$sanitize, this.templateSrv);
        return _super.prototype.render.call(this, this.table);
    };
    TablePanelCtrl.prototype.toggleColumnSort = function (col, colIndex) {
        // remove sort flag from current column
        if (this.table.columns[this.panel.sort.col]) {
            this.table.columns[this.panel.sort.col].sort = false;
        }
        if (this.panel.sort.col === colIndex) {
            if (this.panel.sort.desc) {
                this.panel.sort.desc = false;
            }
            else {
                this.panel.sort.col = null;
            }
        }
        else {
            this.panel.sort.col = colIndex;
            this.panel.sort.desc = true;
        }
        this.render();
    };
    TablePanelCtrl.prototype.moveQuery = function (target, direction) {
        _super.prototype.moveQuery.call(this, target, direction);
        _super.prototype.refresh.call(this);
    };
    TablePanelCtrl.prototype.exportCsv = function () {
        var scope = this.$scope.$new(true);
        scope.tableData = this.renderer.render_values();
        scope.panel = 'table';
        this.publishAppEvent('show-modal', {
            templateHtml: '<export-data-modal panel="panel" data="tableData"></export-data-modal>',
            scope: scope,
            modalClass: 'modal--narrow',
        });
    };
    TablePanelCtrl.prototype.link = function (scope, elem, attrs, ctrl) {
        var data;
        var panel = ctrl.panel;
        var pageCount = 0;
        function getTableHeight() {
            var panelHeight = ctrl.height;
            if (pageCount > 1) {
                panelHeight -= 26;
            }
            return panelHeight - 31 + 'px';
        }
        function appendTableRows(tbodyElem) {
            ctrl.renderer.setTable(data);
            tbodyElem.empty();
            tbodyElem.html(ctrl.renderer.render(ctrl.pageIndex));
        }
        function switchPage(e) {
            var el = jquery__WEBPACK_IMPORTED_MODULE_2___default()(e.currentTarget);
            ctrl.pageIndex = parseInt(el.text(), 10) - 1;
            renderPanel();
        }
        function appendPaginationControls(footerElem) {
            footerElem.empty();
            var pageSize = panel.pageSize || 100;
            pageCount = Math.ceil(data.rows.length / pageSize);
            if (pageCount === 1) {
                return;
            }
            var startPage = Math.max(ctrl.pageIndex - 3, 0);
            var endPage = Math.min(pageCount, startPage + 9);
            var paginationList = jquery__WEBPACK_IMPORTED_MODULE_2___default()('<ul></ul>');
            for (var i = startPage; i < endPage; i++) {
                var activeClass = i === ctrl.pageIndex ? 'active' : '';
                var pageLinkElem = jquery__WEBPACK_IMPORTED_MODULE_2___default()('<li><a class="table-panel-page-link pointer ' + activeClass + '">' + (i + 1) + '</a></li>');
                paginationList.append(pageLinkElem);
            }
            footerElem.append(paginationList);
        }
        function renderPanel() {
            var panelElem = elem.parents('.panel-content');
            var rootElem = elem.find('.table-panel-scroll');
            var tbodyElem = elem.find('tbody');
            var footerElem = elem.find('.table-panel-footer');
            elem.css({ 'font-size': panel.fontSize });
            panelElem.addClass('table-panel-content');
            appendTableRows(tbodyElem);
            appendPaginationControls(footerElem);
            rootElem.css({ 'max-height': panel.scroll ? getTableHeight() : '' });
        }
        // hook up link tooltips
        elem.tooltip({
            selector: '[data-link-tooltip]',
        });
        function addFilterClicked(e) {
            var filterData = jquery__WEBPACK_IMPORTED_MODULE_2___default()(e.currentTarget).data();
            var options = {
                datasource: panel.datasource,
                key: data.columns[filterData.column].text,
                value: data.rows[filterData.row][filterData.column],
                operator: filterData.operator,
            };
            ctrl.variableSrv.setAdhocFilter(options);
        }
        elem.on('click', '.table-panel-page-link', switchPage);
        elem.on('click', '.table-panel-filter-link', addFilterClicked);
        var unbindDestroy = scope.$on('$destroy', function () {
            elem.off('click', '.table-panel-page-link');
            elem.off('click', '.table-panel-filter-link');
            unbindDestroy();
        });
        ctrl.events.on('render', function (renderData) {
            data = renderData || data;
            if (data) {
                renderPanel();
            }
            ctrl.renderingCompleted();
        });
    };
    TablePanelCtrl.templateUrl = 'module.html';
    return TablePanelCtrl;
}(app_plugins_sdk__WEBPACK_IMPORTED_MODULE_3__["MetricsPanelCtrl"]));



/***/ })

})
//# sourceMappingURL=0.6b4e578487905110ad7c.hot-update.js.map