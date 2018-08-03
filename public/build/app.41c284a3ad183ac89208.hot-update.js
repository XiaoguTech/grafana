webpackHotUpdate("app",{

/***/ "./public/app/app.ts":
/*!***************************!*\
  !*** ./public/app/app.ts ***!
  \***************************/
/*! exports provided: GrafanaApp, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GrafanaApp", function() { return GrafanaApp; });
/* harmony import */ var babel_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-polyfill */ "./node_modules/babel-polyfill/lib/index.js");
/* harmony import */ var babel_polyfill__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_polyfill__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var file_saver__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! file-saver */ "./node_modules/file-saver/FileSaver.js");
/* harmony import */ var file_saver__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(file_saver__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! angular */ "./node_modules/angular/index.js");
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(angular__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var angular_route__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! angular-route */ "./node_modules/angular-route/index.js");
/* harmony import */ var angular_route__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(angular_route__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var angular_sanitize__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! angular-sanitize */ "./node_modules/angular-sanitize/index.js");
/* harmony import */ var angular_sanitize__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(angular_sanitize__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var angular_native_dragdrop__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! angular-native-dragdrop */ "./node_modules/angular-native-dragdrop/index.js");
/* harmony import */ var angular_native_dragdrop__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(angular_native_dragdrop__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var angular_bindonce__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! angular-bindonce */ "./node_modules/angular-bindonce/bindonce.js");
/* harmony import */ var angular_bindonce__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(angular_bindonce__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! react-dom */ "./node_modules/react-dom/index.js");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var vendor_bootstrap_bootstrap__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! vendor/bootstrap/bootstrap */ "./public/vendor/bootstrap/bootstrap.js");
/* harmony import */ var vendor_bootstrap_bootstrap__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(vendor_bootstrap_bootstrap__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var vendor_angular_ui_ui_bootstrap_tpls__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! vendor/angular-ui/ui-bootstrap-tpls */ "./public/vendor/angular-ui/ui-bootstrap-tpls.js");
/* harmony import */ var vendor_angular_ui_ui_bootstrap_tpls__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(vendor_angular_ui_ui_bootstrap_tpls__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var vendor_angular_other_angular_strap__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! vendor/angular-other/angular-strap */ "./public/vendor/angular-other/angular-strap.js");
/* harmony import */ var vendor_angular_other_angular_strap__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(vendor_angular_other_angular_strap__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var app_core_config__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! app/core/config */ "./public/app/core/config.ts");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! moment */ "./node_modules/moment/moment.js");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var _core_core__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./core/core */ "./public/app/core/core.ts");
/* harmony import */ var _routes_routes__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./routes/routes */ "./public/app/routes/routes.ts");



















// add move to lodash for backward compatabiltiy
lodash__WEBPACK_IMPORTED_MODULE_2___default.a.move = function (array, fromIndex, toIndex) {
    array.splice(toIndex, 0, array.splice(fromIndex, 1)[0]);
    return array;
};


// declare var System: any;
var GrafanaApp = /** @class */ (function () {
    function GrafanaApp() {
        this.preBootModules = [];
        this.registerFunctions = {};
        this.ngModuleDependencies = [];
    }
    GrafanaApp.prototype.useModule = function (module) {
        if (this.preBootModules) {
            this.preBootModules.push(module);
        }
        else {
            lodash__WEBPACK_IMPORTED_MODULE_2___default.a.extend(module, this.registerFunctions);
        }
        this.ngModuleDependencies.push(module.name);
        return module;
    };
    GrafanaApp.prototype.init = function () {
        var _this = this;
        var app = angular__WEBPACK_IMPORTED_MODULE_4___default.a.module('grafana', []);
        moment__WEBPACK_IMPORTED_MODULE_15___default.a.locale(app_core_config__WEBPACK_IMPORTED_MODULE_14__["default"].bootData.user.locale);
        app.config(function ($locationProvider, $controllerProvider, $compileProvider, $filterProvider, $httpProvider, $provide) {
            // pre assing bindings before constructor calls
            $compileProvider.preAssignBindingsEnabled(true);
            if (app_core_config__WEBPACK_IMPORTED_MODULE_14__["default"].buildInfo.env !== 'development') {
                $compileProvider.debugInfoEnabled(false);
            }
            $httpProvider.useApplyAsync(true);
            _this.registerFunctions.controller = $controllerProvider.register;
            _this.registerFunctions.directive = $compileProvider.directive;
            _this.registerFunctions.factory = $provide.factory;
            _this.registerFunctions.service = $provide.service;
            _this.registerFunctions.filter = $filterProvider.register;
            $provide.decorator('$http', [
                '$delegate',
                '$templateCache',
                function ($delegate, $templateCache) {
                    var get = $delegate.get;
                    $delegate.get = function (url, config) {
                        if (url.match(/\.html$/)) {
                            // some template's already exist in the cache
                            if (!$templateCache.get(url)) {
                                url += '?v=' + new Date().getTime();
                            }
                        }
                        return get(url, config);
                    };
                    return $delegate;
                },
            ]);
        });
        this.ngModuleDependencies = [
            'grafana.core',
            'ngRoute',
            'ngSanitize',
            '$strap.directives',
            'ang-drag-drop',
            'grafana',
            'pasvaz.bindonce',
            'ui.bootstrap',
            'ui.bootstrap.tpls',
            'react',
        ];
        var module_types = ['controllers', 'directives', 'factories', 'services', 'filters', 'routes'];
        lodash__WEBPACK_IMPORTED_MODULE_2___default.a.each(module_types, function (type) {
            var moduleName = 'grafana.' + type;
            _this.useModule(angular__WEBPACK_IMPORTED_MODULE_4___default.a.module(moduleName, []));
        });
        // makes it possible to add dynamic stuff
        this.useModule(_core_core__WEBPACK_IMPORTED_MODULE_16__["coreModule"]);
        // register react angular wrappers
        _core_core__WEBPACK_IMPORTED_MODULE_16__["coreModule"].config(_routes_routes__WEBPACK_IMPORTED_MODULE_17__["setupAngularRoutes"]);
        Object(_core_core__WEBPACK_IMPORTED_MODULE_16__["registerAngularDirectives"])();
        var preBootRequires = [Promise.all(/*! import() */[__webpack_require__.e(1), __webpack_require__.e(2), __webpack_require__.e(3), __webpack_require__.e(0)]).then(__webpack_require__.bind(null, /*! app/features/all */ "./public/app/features/all.ts"))];
        Promise.all(preBootRequires)
            .then(function () {
            // disable tool tip animation
            jquery__WEBPACK_IMPORTED_MODULE_3___default.a.fn.tooltip.defaults.animation = false;
            // bootstrap the app
            angular__WEBPACK_IMPORTED_MODULE_4___default.a.bootstrap(document, _this.ngModuleDependencies).invoke(function () {
                lodash__WEBPACK_IMPORTED_MODULE_2___default.a.each(_this.preBootModules, function (module) {
                    lodash__WEBPACK_IMPORTED_MODULE_2___default.a.extend(module, _this.registerFunctions);
                });
                _this.preBootModules = null;
            });
        })
            .catch(function (err) {
            console.log('Application boot failed:', err);
        });
    };
    return GrafanaApp;
}());

/* harmony default export */ __webpack_exports__["default"] = (new GrafanaApp());


/***/ })

})
//# sourceMappingURL=app.41c284a3ad183ac89208.hot-update.js.map