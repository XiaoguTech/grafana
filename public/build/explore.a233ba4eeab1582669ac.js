(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["explore"],{

/***/ "./public/app/containers/Explore/ElapsedTime.tsx":
/*!*******************************************************!*\
  !*** ./public/app/containers/Explore/ElapsedTime.tsx ***!
  \*******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);


var INTERVAL = 150;
var ElapsedTime = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](ElapsedTime, _super);
    function ElapsedTime() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            elapsed: 0,
        };
        _this.tick = function () {
            var jetzt = Date.now();
            var elapsed = jetzt - _this.offset;
            _this.setState({ elapsed: elapsed });
        };
        return _this;
    }
    ElapsedTime.prototype.start = function () {
        this.offset = Date.now();
        this.timer = window.setInterval(this.tick, INTERVAL);
    };
    ElapsedTime.prototype.componentWillReceiveProps = function (nextProps) {
        if (nextProps.time) {
            clearInterval(this.timer);
        }
        else if (this.props.time) {
            this.start();
        }
    };
    ElapsedTime.prototype.componentDidMount = function () {
        this.start();
    };
    ElapsedTime.prototype.componentWillUnmount = function () {
        clearInterval(this.timer);
    };
    ElapsedTime.prototype.render = function () {
        var elapsed = this.state.elapsed;
        var _a = this.props, className = _a.className, time = _a.time;
        var value = (time || elapsed) / 1000;
        return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("span", { className: "elapsed-time " + className },
            value.toFixed(1),
            "s");
    };
    return ElapsedTime;
}(react__WEBPACK_IMPORTED_MODULE_1__["PureComponent"]));
/* harmony default export */ __webpack_exports__["default"] = (ElapsedTime);


/***/ }),

/***/ "./public/app/containers/Explore/Explore.tsx":
/*!***************************************************!*\
  !*** ./public/app/containers/Explore/Explore.tsx ***!
  \***************************************************/
/*! exports provided: Explore, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(module) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Explore", function() { return Explore; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_hot_loader__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-hot-loader */ "./node_modules/react-hot-loader/index.js");
/* harmony import */ var react_hot_loader__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_hot_loader__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react_select__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-select */ "./node_modules/react-select/dist/react-select.es.js");
/* harmony import */ var app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! app/core/utils/kbn */ "./public/app/core/utils/kbn.ts");
/* harmony import */ var app_core_utils_colors__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! app/core/utils/colors */ "./public/app/core/utils/colors.ts");
/* harmony import */ var app_core_time_series2__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! app/core/time_series2 */ "./public/app/core/time_series2.ts");
/* harmony import */ var app_core_utils_location_util__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! app/core/utils/location_util */ "./public/app/core/utils/location_util.ts");
/* harmony import */ var app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! app/core/utils/datemath */ "./public/app/core/utils/datemath.ts");
/* harmony import */ var _ElapsedTime__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./ElapsedTime */ "./public/app/containers/Explore/ElapsedTime.tsx");
/* harmony import */ var _QueryRows__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./QueryRows */ "./public/app/containers/Explore/QueryRows.tsx");
/* harmony import */ var _Graph__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./Graph */ "./public/app/containers/Explore/Graph.tsx");
/* harmony import */ var _Logs__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./Logs */ "./public/app/containers/Explore/Logs.tsx");
/* harmony import */ var _Table__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./Table */ "./public/app/containers/Explore/Table.tsx");
/* harmony import */ var _TimePicker__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./TimePicker */ "./public/app/containers/Explore/TimePicker.tsx");
/* harmony import */ var _utils_query__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./utils/query */ "./public/app/containers/Explore/utils/query.ts");
















function makeTimeSeriesList(dataList, options) {
    return dataList.map(function (seriesData, index) {
        var datapoints = seriesData.datapoints || [];
        var alias = seriesData.target;
        var colorIndex = index % app_core_utils_colors__WEBPACK_IMPORTED_MODULE_5__["default"].length;
        var color = app_core_utils_colors__WEBPACK_IMPORTED_MODULE_5__["default"][colorIndex];
        var series = new app_core_time_series2__WEBPACK_IMPORTED_MODULE_6__["default"]({
            datapoints: datapoints,
            alias: alias,
            color: color,
            unit: seriesData.unit,
        });
        return series;
    });
}
function parseInitialState(initial) {
    if (initial) {
        try {
            var parsed = JSON.parse(Object(app_core_utils_location_util__WEBPACK_IMPORTED_MODULE_7__["decodePathComponent"])(initial));
            return {
                datasource: parsed.datasource,
                queries: parsed.queries.map(function (q) { return q.query; }),
                range: parsed.range,
            };
        }
        catch (e) {
            console.error(e);
        }
    }
    return { datasource: null, queries: [], range: _TimePicker__WEBPACK_IMPORTED_MODULE_14__["DEFAULT_RANGE"] };
}
var Explore = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](Explore, _super);
    function Explore(props) {
        var _this = _super.call(this, props) || this;
        _this.getRef = function (el) {
            _this.el = el;
        };
        _this.handleAddQueryRow = function (index) {
            var queries = _this.state.queries;
            var nextQueries = queries.slice(0, index + 1).concat([
                { query: '', key: Object(_utils_query__WEBPACK_IMPORTED_MODULE_15__["generateQueryKey"])() }
            ], queries.slice(index + 1));
            _this.setState({ queries: nextQueries });
        };
        _this.handleChangeDatasource = function (option) { return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](_this, void 0, void 0, function () {
            var datasource;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setState({
                            datasource: null,
                            datasourceError: null,
                            datasourceLoading: true,
                            graphResult: null,
                            logsResult: null,
                            tableResult: null,
                        });
                        return [4 /*yield*/, this.props.datasourceSrv.get(option.value)];
                    case 1:
                        datasource = _a.sent();
                        this.setDatasource(datasource);
                        return [2 /*return*/];
                }
            });
        }); };
        _this.handleChangeQuery = function (query, index) {
            var queries = _this.state.queries;
            var nextQuery = tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, queries[index], { query: query });
            var nextQueries = queries.slice();
            nextQueries[index] = nextQuery;
            _this.setState({ queries: nextQueries });
        };
        _this.handleChangeTime = function (nextRange) {
            var range = {
                from: nextRange.from,
                to: nextRange.to,
            };
            _this.setState({ range: range }, function () { return _this.handleSubmit(); });
        };
        _this.handleClickCloseSplit = function () {
            var onChangeSplit = _this.props.onChangeSplit;
            if (onChangeSplit) {
                onChangeSplit(false);
            }
        };
        _this.handleClickGraphButton = function () {
            _this.setState(function (state) { return ({ showingGraph: !state.showingGraph }); });
        };
        _this.handleClickLogsButton = function () {
            _this.setState(function (state) { return ({ showingLogs: !state.showingLogs }); });
        };
        _this.handleClickSplit = function () {
            var onChangeSplit = _this.props.onChangeSplit;
            if (onChangeSplit) {
                onChangeSplit(true, _this.state);
            }
        };
        _this.handleClickTableButton = function () {
            _this.setState(function (state) { return ({ showingTable: !state.showingTable }); });
        };
        _this.handleRemoveQueryRow = function (index) {
            var queries = _this.state.queries;
            if (queries.length <= 1) {
                return;
            }
            var nextQueries = queries.slice(0, index).concat(queries.slice(index + 1));
            _this.setState({ queries: nextQueries }, function () { return _this.handleSubmit(); });
        };
        _this.handleSubmit = function () {
            var _a = _this.state, showingLogs = _a.showingLogs, showingGraph = _a.showingGraph, showingTable = _a.showingTable, supportsGraph = _a.supportsGraph, supportsLogs = _a.supportsLogs, supportsTable = _a.supportsTable;
            if (showingTable && supportsTable) {
                _this.runTableQuery();
            }
            if (showingGraph && supportsGraph) {
                _this.runGraphQuery();
            }
            if (showingLogs && supportsLogs) {
                _this.runLogsQuery();
            }
        };
        _this.request = function (url) {
            var datasource = _this.state.datasource;
            return datasource.metadataRequest(url);
        };
        var _a = parseInitialState(props.routeParams.state), datasource = _a.datasource, queries = _a.queries, range = _a.range;
        _this.state = tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({ datasource: null, datasourceError: null, datasourceLoading: null, datasourceMissing: false, graphResult: null, initialDatasource: datasource, latency: 0, loading: false, logsResult: null, queries: Object(_utils_query__WEBPACK_IMPORTED_MODULE_15__["ensureQueries"])(queries), queryError: null, range: range || tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, _TimePicker__WEBPACK_IMPORTED_MODULE_14__["DEFAULT_RANGE"]), requestOptions: null, showingGraph: true, showingLogs: true, showingTable: true, supportsGraph: null, supportsLogs: null, supportsTable: null, tableResult: null }, props.initialState);
        return _this;
    }
    Explore.prototype.componentDidMount = function () {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var datasourceSrv, initialDatasource, datasources, datasource;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        datasourceSrv = this.props.datasourceSrv;
                        initialDatasource = this.state.initialDatasource;
                        if (!datasourceSrv) {
                            throw new Error('No datasource service passed as props.');
                        }
                        datasources = datasourceSrv.getExploreSources();
                        if (!(datasources.length > 0)) return [3 /*break*/, 7];
                        this.setState({ datasourceLoading: true });
                        datasource = void 0;
                        if (!initialDatasource) return [3 /*break*/, 2];
                        return [4 /*yield*/, datasourceSrv.get(initialDatasource)];
                    case 1:
                        datasource = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, datasourceSrv.get()];
                    case 3:
                        datasource = _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!!datasource.meta.explore) return [3 /*break*/, 6];
                        return [4 /*yield*/, datasourceSrv.get(datasources[0].name)];
                    case 5:
                        datasource = _a.sent();
                        _a.label = 6;
                    case 6:
                        this.setDatasource(datasource);
                        return [3 /*break*/, 8];
                    case 7:
                        this.setState({ datasourceMissing: true });
                        _a.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Explore.prototype.componentDidCatch = function (error) {
        this.setState({ datasourceError: error });
        console.error(error);
    };
    Explore.prototype.setDatasource = function (datasource) {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var supportsGraph, supportsLogs, supportsTable, datasourceError, testResult, error_1;
            var _this = this;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        supportsGraph = datasource.meta.metrics;
                        supportsLogs = datasource.meta.logs;
                        supportsTable = datasource.meta.metrics;
                        datasourceError = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, datasource.testDatasource()];
                    case 2:
                        testResult = _a.sent();
                        datasourceError = testResult.status === 'success' ? null : testResult.message;
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        datasourceError = (error_1 && error_1.statusText) || error_1;
                        return [3 /*break*/, 4];
                    case 4:
                        this.setState({
                            datasource: datasource,
                            datasourceError: datasourceError,
                            supportsGraph: supportsGraph,
                            supportsLogs: supportsLogs,
                            supportsTable: supportsTable,
                            datasourceLoading: false,
                        }, function () { return datasourceError === null && _this.handleSubmit(); });
                        return [2 /*return*/];
                }
            });
        });
    };
    Explore.prototype.buildQueryOptions = function (targetOptions) {
        var _a = this.state, datasource = _a.datasource, queries = _a.queries, range = _a.range;
        var resolution = this.el.offsetWidth;
        var absoluteRange = {
            from: Object(app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_8__["parse"])(range.from, false),
            to: Object(app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_8__["parse"])(range.to, true),
        };
        var interval = app_core_utils_kbn__WEBPACK_IMPORTED_MODULE_4__["default"].calculateInterval(absoluteRange, resolution, datasource.interval).interval;
        var targets = queries.map(function (q) { return (tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, targetOptions, { expr: q.query })); });
        return {
            interval: interval,
            range: range,
            targets: targets,
        };
    };
    Explore.prototype.runGraphQuery = function () {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var _a, datasource, queries, now, options, res, result, latency, response_1, queryError;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.state, datasource = _a.datasource, queries = _a.queries;
                        if (!Object(_utils_query__WEBPACK_IMPORTED_MODULE_15__["hasQuery"])(queries)) {
                            return [2 /*return*/];
                        }
                        this.setState({ latency: 0, loading: true, graphResult: null, queryError: null });
                        now = Date.now();
                        options = this.buildQueryOptions({ format: 'time_series', instant: false });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, datasource.query(options)];
                    case 2:
                        res = _b.sent();
                        result = makeTimeSeriesList(res.data, options);
                        latency = Date.now() - now;
                        this.setState({ latency: latency, loading: false, graphResult: result, requestOptions: options });
                        return [3 /*break*/, 4];
                    case 3:
                        response_1 = _b.sent();
                        console.error(response_1);
                        queryError = response_1.data ? response_1.data.error : response_1;
                        this.setState({ loading: false, queryError: queryError });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Explore.prototype.runTableQuery = function () {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var _a, datasource, queries, now, options, res, tableModel, latency, response_2, queryError;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.state, datasource = _a.datasource, queries = _a.queries;
                        if (!Object(_utils_query__WEBPACK_IMPORTED_MODULE_15__["hasQuery"])(queries)) {
                            return [2 /*return*/];
                        }
                        this.setState({ latency: 0, loading: true, queryError: null, tableResult: null });
                        now = Date.now();
                        options = this.buildQueryOptions({
                            format: 'table',
                            instant: true,
                        });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, datasource.query(options)];
                    case 2:
                        res = _b.sent();
                        tableModel = res.data[0];
                        latency = Date.now() - now;
                        this.setState({ latency: latency, loading: false, tableResult: tableModel, requestOptions: options });
                        return [3 /*break*/, 4];
                    case 3:
                        response_2 = _b.sent();
                        console.error(response_2);
                        queryError = response_2.data ? response_2.data.error : response_2;
                        this.setState({ loading: false, queryError: queryError });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Explore.prototype.runLogsQuery = function () {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var _a, datasource, queries, now, options, res, logsData, latency, response_3, queryError;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.state, datasource = _a.datasource, queries = _a.queries;
                        if (!Object(_utils_query__WEBPACK_IMPORTED_MODULE_15__["hasQuery"])(queries)) {
                            return [2 /*return*/];
                        }
                        this.setState({ latency: 0, loading: true, queryError: null, logsResult: null });
                        now = Date.now();
                        options = this.buildQueryOptions({
                            format: 'logs',
                        });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, datasource.query(options)];
                    case 2:
                        res = _b.sent();
                        logsData = res.data;
                        latency = Date.now() - now;
                        this.setState({ latency: latency, loading: false, logsResult: logsData, requestOptions: options });
                        return [3 /*break*/, 4];
                    case 3:
                        response_3 = _b.sent();
                        console.error(response_3);
                        queryError = response_3.data ? response_3.data.error : response_3;
                        this.setState({ loading: false, queryError: queryError });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Explore.prototype.render = function () {
        var _a = this.props, datasourceSrv = _a.datasourceSrv, position = _a.position, split = _a.split;
        var _b = this.state, datasource = _b.datasource, datasourceError = _b.datasourceError, datasourceLoading = _b.datasourceLoading, datasourceMissing = _b.datasourceMissing, graphResult = _b.graphResult, latency = _b.latency, loading = _b.loading, logsResult = _b.logsResult, queries = _b.queries, queryError = _b.queryError, range = _b.range, requestOptions = _b.requestOptions, showingGraph = _b.showingGraph, showingLogs = _b.showingLogs, showingTable = _b.showingTable, supportsGraph = _b.supportsGraph, supportsLogs = _b.supportsLogs, supportsTable = _b.supportsTable, tableResult = _b.tableResult;
        var showingBoth = showingGraph && showingTable;
        var graphHeight = showingBoth ? '200px' : '400px';
        var graphButtonActive = showingBoth || showingGraph ? 'active' : '';
        var logsButtonActive = showingLogs ? 'active' : '';
        var tableButtonActive = showingBoth || showingTable ? 'active' : '';
        var exploreClass = split ? 'explore explore-split' : 'explore';
        var datasources = datasourceSrv.getExploreSources().map(function (ds) { return ({
            value: ds.name,
            label: ds.name,
        }); });
        var selectedDatasource = datasource ? datasource.name : undefined;
        return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: exploreClass, ref: this.getRef },
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "navbar" },
                position === 'left' ? (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", null,
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("a", { className: "navbar-page-btn" },
                        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("i", { className: "fa fa-rocket" }),
                        "Explore"))) : (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "navbar-buttons explore-first-button" },
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("button", { className: "btn navbar-button", onClick: this.handleClickCloseSplit }, "Close Split"))),
                !datasourceMissing ? (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "navbar-buttons" },
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react_select__WEBPACK_IMPORTED_MODULE_3__["default"], { className: "datasource-picker", clearable: false, onChange: this.handleChangeDatasource, options: datasources, placeholder: "Loading datasources...", value: selectedDatasource }))) : null,
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "navbar__spacer" }),
                position === 'left' && !split ? (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "navbar-buttons" },
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("button", { className: "btn navbar-button", onClick: this.handleClickSplit }, "Split"))) : null,
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "navbar-buttons" },
                    supportsGraph ? (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("button", { className: "btn navbar-button " + graphButtonActive, onClick: this.handleClickGraphButton }, "Graph")) : null,
                    supportsTable ? (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("button", { className: "btn navbar-button " + tableButtonActive, onClick: this.handleClickTableButton }, "Table")) : null,
                    supportsLogs ? (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("button", { className: "btn navbar-button " + logsButtonActive, onClick: this.handleClickLogsButton }, "Logs")) : null),
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_TimePicker__WEBPACK_IMPORTED_MODULE_14__["default"], { range: range, onChangeTime: this.handleChangeTime }),
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "navbar-buttons relative" },
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("button", { className: "btn navbar-button--primary", onClick: this.handleSubmit },
                        "Run Query ",
                        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("i", { className: "fa fa-level-down run-icon" })),
                    loading || latency ? react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_ElapsedTime__WEBPACK_IMPORTED_MODULE_9__["default"], { time: latency, className: "text-info" }) : null)),
            datasourceLoading ? react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "explore-container" }, "Loading datasource...") : null,
            datasourceMissing ? (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "explore-container" }, "Please add a datasource that supports Explore (e.g., Prometheus).")) : null,
            datasourceError ? (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "explore-container" },
                "Error connecting to datasource. [",
                datasourceError,
                "]")) : null,
            datasource && !datasourceError ? (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "explore-container" },
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_QueryRows__WEBPACK_IMPORTED_MODULE_10__["default"], { queries: queries, request: this.request, onAddQueryRow: this.handleAddQueryRow, onChangeQuery: this.handleChangeQuery, onExecuteQuery: this.handleSubmit, onRemoveQueryRow: this.handleRemoveQueryRow }),
                queryError ? react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "text-warning m-a-2" }, queryError) : null,
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("main", { className: "m-t-2" },
                    supportsGraph && showingGraph ? (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_Graph__WEBPACK_IMPORTED_MODULE_11__["default"], { data: graphResult, id: "explore-graph-" + position, options: requestOptions, height: graphHeight, split: split })) : null,
                    supportsTable && showingTable ? react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_Table__WEBPACK_IMPORTED_MODULE_13__["default"], { data: tableResult, className: "m-t-3" }) : null,
                    supportsLogs && showingLogs ? react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_Logs__WEBPACK_IMPORTED_MODULE_12__["default"], { data: logsResult }) : null))) : null));
    };
    return Explore;
}(react__WEBPACK_IMPORTED_MODULE_1___default.a.Component));

/* harmony default export */ __webpack_exports__["default"] = (Object(react_hot_loader__WEBPACK_IMPORTED_MODULE_2__["hot"])(module)(Explore));

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../node_modules/webpack/buildin/harmony-module.js */ "./node_modules/webpack/buildin/harmony-module.js")(module)))

/***/ }),

/***/ "./public/app/containers/Explore/Graph.tsx":
/*!*************************************************!*\
  !*** ./public/app/containers/Explore/Graph.tsx ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js?fe57");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! moment */ "./node_modules/moment/moment.js");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var vendor_flot_jquery_flot__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! vendor/flot/jquery.flot */ "./public/vendor/flot/jquery.flot.js");
/* harmony import */ var vendor_flot_jquery_flot__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(vendor_flot_jquery_flot__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var vendor_flot_jquery_flot_time__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! vendor/flot/jquery.flot.time */ "./public/vendor/flot/jquery.flot.time.js");
/* harmony import */ var vendor_flot_jquery_flot_time__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(vendor_flot_jquery_flot_time__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! app/core/utils/datemath */ "./public/app/core/utils/datemath.ts");
/* harmony import */ var _Legend__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Legend */ "./public/app/containers/Explore/Legend.tsx");








// Copied from graph.ts
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
var FLOT_OPTIONS = {
    legend: {
        show: false,
    },
    series: {
        lines: {
            linewidth: 1,
            zero: false,
        },
        shadowSize: 0,
    },
    grid: {
        minBorderMargin: 0,
        markings: [],
        backgroundColor: null,
        borderWidth: 0,
        // hoverable: true,
        clickable: true,
        color: '#a1a1a1',
        margin: { left: 0, right: 0 },
        labelMarginX: 0,
    },
};
var Graph = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](Graph, _super);
    function Graph() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Graph.prototype.componentDidMount = function () {
        this.draw();
    };
    Graph.prototype.componentDidUpdate = function (prevProps) {
        if (prevProps.data !== this.props.data ||
            prevProps.options !== this.props.options ||
            prevProps.split !== this.props.split ||
            prevProps.height !== this.props.height) {
            this.draw();
        }
    };
    Graph.prototype.draw = function () {
        var _a = this.props, data = _a.data, userOptions = _a.options;
        if (!data) {
            return;
        }
        var series = data.map(function (ts) { return ({
            color: ts.color,
            label: ts.label,
            data: ts.getFlotPairs('null'),
        }); });
        var $el = jquery__WEBPACK_IMPORTED_MODULE_1___default()("#" + this.props.id);
        var ticks = $el.width() / 100;
        var _b = userOptions.range, from = _b.from, to = _b.to;
        if (!moment__WEBPACK_IMPORTED_MODULE_3___default.a.isMoment(from)) {
            from = app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_6__["parse"](from, false);
        }
        if (!moment__WEBPACK_IMPORTED_MODULE_3___default.a.isMoment(to)) {
            to = app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_6__["parse"](to, true);
        }
        var min = from.valueOf();
        var max = to.valueOf();
        var dynamicOptions = {
            xaxis: {
                mode: 'time',
                min: min,
                max: max,
                label: 'Datetime',
                ticks: ticks,
                timeformat: time_format(ticks, min, max),
            },
        };
        var options = tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, FLOT_OPTIONS, dynamicOptions, userOptions);
        jquery__WEBPACK_IMPORTED_MODULE_1___default.a.plot($el, series, options);
    };
    Graph.prototype.render = function () {
        var _a = this.props, data = _a.data, height = _a.height;
        return (react__WEBPACK_IMPORTED_MODULE_2___default.a.createElement("div", { className: "panel-container" },
            react__WEBPACK_IMPORTED_MODULE_2___default.a.createElement("div", { id: this.props.id, className: "explore-graph", style: { height: height } }),
            react__WEBPACK_IMPORTED_MODULE_2___default.a.createElement(_Legend__WEBPACK_IMPORTED_MODULE_7__["default"], { data: data })));
    };
    return Graph;
}(react__WEBPACK_IMPORTED_MODULE_2__["Component"]));
/* harmony default export */ __webpack_exports__["default"] = (Graph);


/***/ }),

/***/ "./public/app/containers/Explore/Legend.tsx":
/*!**************************************************!*\
  !*** ./public/app/containers/Explore/Legend.tsx ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);


var LegendItem = function (_a) {
    var series = _a.series;
    return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "graph-legend-series" },
        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "graph-legend-icon" },
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("i", { className: "fa fa-minus pointer", style: { color: series.color } })),
        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("a", { className: "graph-legend-alias pointer" }, series.alias)));
};
var Legend = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](Legend, _super);
    function Legend() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Legend.prototype.render = function () {
        var _a = this.props, _b = _a.className, className = _b === void 0 ? '' : _b, data = _a.data;
        var items = data || [];
        return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: className + " graph-legend ps" }, items.map(function (series) { return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(LegendItem, { key: series.id, series: series }); })));
    };
    return Legend;
}(react__WEBPACK_IMPORTED_MODULE_1__["PureComponent"]));
/* harmony default export */ __webpack_exports__["default"] = (Legend);


/***/ }),

/***/ "./public/app/containers/Explore/Logs.tsx":
/*!************************************************!*\
  !*** ./public/app/containers/Explore/Logs.tsx ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);


var EXAMPLE_QUERY = '{job="default/prometheus"}';
var Entry = function (props) {
    var entry = props.entry, searchMatches = props.searchMatches;
    if (searchMatches && searchMatches.length > 0) {
        var lastMatchEnd_1 = 0;
        var spans = searchMatches.reduce(function (acc, match, i) {
            // Insert non-match
            if (match.start !== lastMatchEnd_1) {
                acc.push(react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, entry.slice(lastMatchEnd_1, match.start)));
            }
            // Match
            acc.push(react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("span", { className: "logs-row-match-highlight", title: "Matching expression: " + match.text }, entry.substr(match.start, match.length)));
            lastMatchEnd_1 = match.start + match.length;
            // Non-matching end
            if (i === searchMatches.length - 1) {
                acc.push(react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, entry.slice(lastMatchEnd_1)));
            }
            return acc;
        }, []);
        return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, spans);
    }
    return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, props.entry);
};
var Logs = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](Logs, _super);
    function Logs() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Logs.prototype.render = function () {
        var _a = this.props, _b = _a.className, className = _b === void 0 ? '' : _b, data = _a.data;
        var hasData = data && data.rows && data.rows.length > 0;
        return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: className + " logs" },
            hasData ? (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "logs-entries panel-container" }, data.rows.map(function (row) { return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1__["Fragment"], { key: row.key },
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: row.logLevel ? "logs-row-level logs-row-level-" + row.logLevel : '' }),
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { title: row.timestamp + " (" + row.timeFromNow + ")" }, row.timeLocal),
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", null,
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(Entry, tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, row))))); }))) : null,
            !hasData ? (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "panel-container" },
                "Enter a query like ",
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("code", null, EXAMPLE_QUERY))) : null));
    };
    return Logs;
}(react__WEBPACK_IMPORTED_MODULE_1__["PureComponent"]));
/* harmony default export */ __webpack_exports__["default"] = (Logs);


/***/ }),

/***/ "./public/app/containers/Explore/PromQueryField.tsx":
/*!**********************************************************!*\
  !*** ./public/app/containers/Explore/PromQueryField.tsx ***!
  \**********************************************************/
/*! exports provided: wrapLabel, setFunctionMove, willApplySuggestion, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "wrapLabel", function() { return wrapLabel; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setFunctionMove", function() { return setFunctionMove; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "willApplySuggestion", function() { return willApplySuggestion; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils/dom */ "./public/app/containers/Explore/utils/dom.ts");
/* harmony import */ var _slate_plugins_prism_index__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./slate-plugins/prism/index */ "./public/app/containers/Explore/slate-plugins/prism/index.tsx");
/* harmony import */ var _slate_plugins_prism_promql__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./slate-plugins/prism/promql */ "./public/app/containers/Explore/slate-plugins/prism/promql.ts");
/* harmony import */ var _slate_plugins_runner__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./slate-plugins/runner */ "./public/app/containers/Explore/slate-plugins/runner.ts");
/* harmony import */ var _utils_prometheus__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./utils/prometheus */ "./public/app/containers/Explore/utils/prometheus.ts");
/* harmony import */ var _QueryField__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./QueryField */ "./public/app/containers/Explore/QueryField.tsx");



// dom also includes Element polyfills






var EMPTY_METRIC = '';
var METRIC_MARK = 'metric';
var PRISM_LANGUAGE = 'promql';
var wrapLabel = function (label) { return ({ label: label }); };
var setFunctionMove = function (suggestion) {
    suggestion.move = -1;
    return suggestion;
};
function willApplySuggestion(suggestion, _a) {
    var typeaheadContext = _a.typeaheadContext, typeaheadText = _a.typeaheadText;
    // Modify suggestion based on context
    switch (typeaheadContext) {
        case 'context-labels': {
            var nextChar = Object(_utils_dom__WEBPACK_IMPORTED_MODULE_3__["getNextCharacter"])();
            if (!nextChar || nextChar === '}' || nextChar === ',') {
                suggestion += '=';
            }
            break;
        }
        case 'context-label-values': {
            // Always add quotes and remove existing ones instead
            if (!(typeaheadText.startsWith('="') || typeaheadText.startsWith('"'))) {
                suggestion = "\"" + suggestion;
            }
            if (Object(_utils_dom__WEBPACK_IMPORTED_MODULE_3__["getNextCharacter"])() !== '"') {
                suggestion = suggestion + "\"";
            }
            break;
        }
        default:
    }
    return suggestion;
}
var PromQueryField = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](PromQueryField, _super);
    function PromQueryField(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.onChangeQuery = function (value) {
            // Send text change to parent
            var onQueryChange = _this.props.onQueryChange;
            if (onQueryChange) {
                onQueryChange(value);
            }
        };
        _this.onReceiveMetrics = function () {
            if (!_this.state.metrics) {
                return;
            }
            Object(_slate_plugins_prism_index__WEBPACK_IMPORTED_MODULE_4__["setPrismTokens"])(PRISM_LANGUAGE, METRIC_MARK, _this.state.metrics);
        };
        _this.onTypeahead = function (typeahead) {
            var editorNode = typeahead.editorNode, prefix = typeahead.prefix, text = typeahead.text, wrapperNode = typeahead.wrapperNode;
            // Get DOM-dependent context
            var wrapperClasses = Array.from(wrapperNode.classList);
            // Take first metric as lucky guess
            var metricNode = editorNode.querySelector("." + METRIC_MARK);
            var metric = metricNode && metricNode.textContent;
            var labelKeyNode = Object(_utils_dom__WEBPACK_IMPORTED_MODULE_3__["getPreviousCousin"])(wrapperNode, '.attr-name');
            var labelKey = labelKeyNode && labelKeyNode.textContent;
            var result = _this.getTypeahead({ text: text, prefix: prefix, wrapperClasses: wrapperClasses, metric: metric, labelKey: labelKey });
            console.log('handleTypeahead', wrapperClasses, text, prefix, result.context);
            return result;
        };
        _this.request = function (url) {
            if (_this.props.request) {
                return _this.props.request(url);
            }
            return fetch(url);
        };
        _this.plugins = [
            Object(_slate_plugins_runner__WEBPACK_IMPORTED_MODULE_6__["default"])({ handler: props.onPressEnter }),
            Object(_slate_plugins_prism_index__WEBPACK_IMPORTED_MODULE_4__["default"])({ definition: _slate_plugins_prism_promql__WEBPACK_IMPORTED_MODULE_5__["default"], language: PRISM_LANGUAGE }),
        ];
        _this.state = {
            labelKeys: props.labelKeys || {},
            labelValues: props.labelValues || {},
            metrics: props.metrics || [],
        };
        return _this;
    }
    PromQueryField.prototype.componentDidMount = function () {
        this.fetchMetricNames();
    };
    // Keep this DOM-free for testing
    PromQueryField.prototype.getTypeahead = function (_a) {
        var prefix = _a.prefix, wrapperClasses = _a.wrapperClasses, metric = _a.metric, text = _a.text;
        // Determine candidates by CSS context
        if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.includes(wrapperClasses, 'context-range')) {
            // Suggestions for metric[|]
            return this.getRangeTypeahead();
        }
        else if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.includes(wrapperClasses, 'context-labels')) {
            // Suggestions for metric{|} and metric{foo=|}, as well as metric-independent label queries like {|}
            return this.getLabelTypeahead.apply(this, arguments);
        }
        else if (metric && lodash__WEBPACK_IMPORTED_MODULE_1___default.a.includes(wrapperClasses, 'context-aggregation')) {
            return this.getAggregationTypeahead.apply(this, arguments);
        }
        else if (
        // Non-empty but not inside known token unless it's a metric
        (prefix && !lodash__WEBPACK_IMPORTED_MODULE_1___default.a.includes(wrapperClasses, 'token')) ||
            prefix === metric ||
            (prefix === '' && !text.match(/^[)\s]+$/)) || // Empty context or after ')'
            text.match(/[+\-*/^%]/) // After binary operator
        ) {
            return this.getEmptyTypeahead();
        }
        return {
            suggestions: [],
        };
    };
    PromQueryField.prototype.getEmptyTypeahead = function () {
        var suggestions = [];
        suggestions.push({
            prefixMatch: true,
            label: 'Functions',
            items: _slate_plugins_prism_promql__WEBPACK_IMPORTED_MODULE_5__["FUNCTIONS"].map(setFunctionMove),
        });
        if (this.state.metrics) {
            suggestions.push({
                label: 'Metrics',
                items: this.state.metrics.map(wrapLabel),
            });
        }
        return { suggestions: suggestions };
    };
    PromQueryField.prototype.getRangeTypeahead = function () {
        return {
            context: 'context-range',
            suggestions: [
                {
                    label: 'Range vector',
                    items: _utils_prometheus__WEBPACK_IMPORTED_MODULE_7__["RATE_RANGES"].slice().map(wrapLabel),
                },
            ],
        };
    };
    PromQueryField.prototype.getAggregationTypeahead = function (_a) {
        var metric = _a.metric;
        var refresher = null;
        var suggestions = [];
        var labelKeys = this.state.labelKeys[metric];
        if (labelKeys) {
            suggestions.push({ label: 'Labels', items: labelKeys.map(wrapLabel) });
        }
        else {
            refresher = this.fetchMetricLabels(metric);
        }
        return {
            refresher: refresher,
            suggestions: suggestions,
            context: 'context-aggregation',
        };
    };
    PromQueryField.prototype.getLabelTypeahead = function (_a) {
        var _this = this;
        var metric = _a.metric, text = _a.text, wrapperClasses = _a.wrapperClasses, labelKey = _a.labelKey;
        var context;
        var refresher = null;
        var suggestions = [];
        if (metric) {
            var labelKeys = this.state.labelKeys[metric];
            if (labelKeys) {
                if ((text && text.startsWith('=')) || lodash__WEBPACK_IMPORTED_MODULE_1___default.a.includes(wrapperClasses, 'attr-value')) {
                    // Label values
                    if (labelKey) {
                        var labelValues = this.state.labelValues[metric][labelKey];
                        context = 'context-label-values';
                        suggestions.push({
                            label: 'Label values',
                            items: labelValues.map(wrapLabel),
                        });
                    }
                }
                else {
                    // Label keys
                    context = 'context-labels';
                    suggestions.push({ label: 'Labels', items: labelKeys.map(wrapLabel) });
                }
            }
            else {
                refresher = this.fetchMetricLabels(metric);
            }
        }
        else {
            // Metric-independent label queries
            var defaultKeys = ['job', 'instance'];
            // Munge all keys that we have seen together
            var labelKeys = Object.keys(this.state.labelKeys).reduce(function (acc, metric) {
                return acc.concat(_this.state.labelKeys[metric].filter(function (key) { return acc.indexOf(key) === -1; }));
            }, defaultKeys);
            if ((text && text.startsWith('=')) || lodash__WEBPACK_IMPORTED_MODULE_1___default.a.includes(wrapperClasses, 'attr-value')) {
                // Label values
                if (labelKey) {
                    if (this.state.labelValues[EMPTY_METRIC]) {
                        var labelValues = this.state.labelValues[EMPTY_METRIC][labelKey];
                        context = 'context-label-values';
                        suggestions.push({
                            label: 'Label values',
                            items: labelValues.map(wrapLabel),
                        });
                    }
                    else {
                        // Can only query label values for now (API to query keys is under development)
                        refresher = this.fetchLabelValues(labelKey);
                    }
                }
            }
            else {
                // Label keys
                context = 'context-labels';
                suggestions.push({ label: 'Labels', items: labelKeys.map(wrapLabel) });
            }
        }
        return { context: context, refresher: refresher, suggestions: suggestions };
    };
    PromQueryField.prototype.fetchLabelValues = function (key) {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var _a, _b, url, res, body, pairs, values, labelValues, e_1;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_c) {
                switch (_c.label) {
                    case 0:
                        url = "/api/v1/label/" + key + "/values";
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.request(url)];
                    case 2:
                        res = _c.sent();
                        return [4 /*yield*/, (res.data || res.json())];
                    case 3:
                        body = _c.sent();
                        pairs = this.state.labelValues[EMPTY_METRIC];
                        values = tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, pairs, (_a = {}, _a[key] = body.data, _a));
                        labelValues = tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, this.state.labelValues, (_b = {}, _b[EMPTY_METRIC] = values, _b));
                        this.setState({ labelValues: labelValues });
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _c.sent();
                        console.error(e_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    PromQueryField.prototype.fetchMetricLabels = function (name) {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var _a, _b, url, res, body, _c, keys, values, labelKeys, labelValues, e_2;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_d) {
                switch (_d.label) {
                    case 0:
                        url = "/api/v1/series?match[]=" + name;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.request(url)];
                    case 2:
                        res = _d.sent();
                        return [4 /*yield*/, (res.data || res.json())];
                    case 3:
                        body = _d.sent();
                        _c = Object(_utils_prometheus__WEBPACK_IMPORTED_MODULE_7__["processLabels"])(body.data), keys = _c.keys, values = _c.values;
                        labelKeys = tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, this.state.labelKeys, (_a = {}, _a[name] = keys, _a));
                        labelValues = tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, this.state.labelValues, (_b = {}, _b[name] = values, _b));
                        this.setState({ labelKeys: labelKeys, labelValues: labelValues });
                        return [3 /*break*/, 5];
                    case 4:
                        e_2 = _d.sent();
                        console.error(e_2);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    PromQueryField.prototype.fetchMetricNames = function () {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var url, res, body, error_1;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = '/api/v1/label/__name__/values';
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.request(url)];
                    case 2:
                        res = _a.sent();
                        return [4 /*yield*/, (res.data || res.json())];
                    case 3:
                        body = _a.sent();
                        this.setState({ metrics: body.data }, this.onReceiveMetrics);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error(error_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    PromQueryField.prototype.render = function () {
        return (react__WEBPACK_IMPORTED_MODULE_2___default.a.createElement(_QueryField__WEBPACK_IMPORTED_MODULE_8__["default"], { additionalPlugins: this.plugins, cleanText: _utils_prometheus__WEBPACK_IMPORTED_MODULE_7__["cleanText"], initialValue: this.props.initialQuery, onTypeahead: this.onTypeahead, onWillApplySuggestion: willApplySuggestion, onValueChanged: this.onChangeQuery, placeholder: "Enter a PromQL query" }));
    };
    return PromQueryField;
}(react__WEBPACK_IMPORTED_MODULE_2___default.a.Component));
/* harmony default export */ __webpack_exports__["default"] = (PromQueryField);


/***/ }),

/***/ "./public/app/containers/Explore/QueryField.tsx":
/*!******************************************************!*\
  !*** ./public/app/containers/Explore/QueryField.tsx ***!
  \******************************************************/
/*! exports provided: TYPEAHEAD_DEBOUNCE, makeFragment, getInitialValue, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TYPEAHEAD_DEBOUNCE", function() { return TYPEAHEAD_DEBOUNCE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeFragment", function() { return makeFragment; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getInitialValue", function() { return getInitialValue; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-dom */ "./node_modules/react-dom/index.js");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var slate__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! slate */ "./node_modules/slate/lib/slate.es.js");
/* harmony import */ var slate_react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! slate-react */ "./node_modules/slate-react/lib/slate-react.es.js");
/* harmony import */ var slate_plain_serializer__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! slate-plain-serializer */ "./node_modules/slate-plain-serializer/lib/slate-plain-serializer.es.js");
/* harmony import */ var _slate_plugins_braces__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./slate-plugins/braces */ "./public/app/containers/Explore/slate-plugins/braces.ts");
/* harmony import */ var _slate_plugins_clear__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./slate-plugins/clear */ "./public/app/containers/Explore/slate-plugins/clear.ts");
/* harmony import */ var _slate_plugins_newline__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./slate-plugins/newline */ "./public/app/containers/Explore/slate-plugins/newline.ts");
/* harmony import */ var _Typeahead__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./Typeahead */ "./public/app/containers/Explore/Typeahead.tsx");











var TYPEAHEAD_DEBOUNCE = 300;
function flattenSuggestions(s) {
    return s ? s.reduce(function (acc, g) { return acc.concat(g.items); }, []) : [];
}
var makeFragment = function (text) {
    var lines = text.split('\n').map(function (line) {
        return slate__WEBPACK_IMPORTED_MODULE_4__["Block"].create({
            type: 'paragraph',
            nodes: [slate__WEBPACK_IMPORTED_MODULE_4__["Text"].create(line)],
        });
    });
    var fragment = slate__WEBPACK_IMPORTED_MODULE_4__["Document"].create({
        nodes: lines,
    });
    return fragment;
};
var getInitialValue = function (value) { return slate__WEBPACK_IMPORTED_MODULE_4__["Value"].create({ document: makeFragment(value) }); };
var QueryField = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](QueryField, _super);
    function QueryField(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.onChange = function (_a) {
            var value = _a.value;
            var changed = value.document !== _this.state.value.document;
            _this.setState({ value: value }, function () {
                if (changed) {
                    _this.handleChangeValue();
                }
            });
            if (changed) {
                window.requestAnimationFrame(_this.handleTypeahead);
            }
        };
        _this.handleChangeValue = function () {
            // Send text change to parent
            var onValueChanged = _this.props.onValueChanged;
            if (onValueChanged) {
                onValueChanged(slate_plain_serializer__WEBPACK_IMPORTED_MODULE_6__["default"].serialize(_this.state.value));
            }
        };
        _this.handleTypeahead = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.debounce(function () { return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](_this, void 0, void 0, function () {
            var selection, _a, cleanText, onTypeahead, wrapperNode, editorNode, range, offset, text, prefix_1, _b, suggestions, context, refresher_1, filteredSuggestions;
            var _this = this;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_c) {
                selection = window.getSelection();
                _a = this.props, cleanText = _a.cleanText, onTypeahead = _a.onTypeahead;
                if (onTypeahead && selection.anchorNode) {
                    wrapperNode = selection.anchorNode.parentElement;
                    editorNode = wrapperNode.closest('.slate-query-field');
                    if (!editorNode || this.state.value.isBlurred) {
                        // Not inside this editor
                        return [2 /*return*/];
                    }
                    range = selection.getRangeAt(0);
                    offset = range.startOffset;
                    text = selection.anchorNode.textContent;
                    prefix_1 = text.substr(0, offset);
                    if (cleanText) {
                        prefix_1 = cleanText(prefix_1);
                    }
                    _b = onTypeahead({
                        editorNode: editorNode,
                        prefix: prefix_1,
                        selection: selection,
                        text: text,
                        wrapperNode: wrapperNode,
                    }), suggestions = _b.suggestions, context = _b.context, refresher_1 = _b.refresher;
                    filteredSuggestions = suggestions
                        .map(function (group) {
                        if (group.items) {
                            if (prefix_1) {
                                // Filter groups based on prefix
                                if (!group.skipFilter) {
                                    group.items = group.items.filter(function (c) { return (c.filterText || c.label).length >= prefix_1.length; });
                                    if (group.prefixMatch) {
                                        group.items = group.items.filter(function (c) { return (c.filterText || c.label).indexOf(prefix_1) === 0; });
                                    }
                                    else {
                                        group.items = group.items.filter(function (c) { return (c.filterText || c.label).indexOf(prefix_1) > -1; });
                                    }
                                }
                                // Filter out the already typed value (prefix) unless it inserts custom text
                                group.items = group.items.filter(function (c) { return c.insertText || (c.filterText || c.label) !== prefix_1; });
                            }
                            group.items = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.sortBy(group.items, function (item) { return item.sortText || item.label; });
                        }
                        return group;
                    })
                        .filter(function (group) { return group.items && group.items.length > 0; });
                    this.setState({
                        suggestions: filteredSuggestions,
                        typeaheadPrefix: prefix_1,
                        typeaheadContext: context,
                        typeaheadText: text,
                    }, function () {
                        if (refresher_1) {
                            refresher_1.then(_this.handleTypeahead).catch(function (e) { return console.error(e); });
                        }
                    });
                }
                return [2 /*return*/];
            });
        }); }, TYPEAHEAD_DEBOUNCE);
        _this.onKeyDown = function (event, change) {
            var _a = _this.state, typeaheadIndex = _a.typeaheadIndex, suggestions = _a.suggestions;
            switch (event.key) {
                case 'Escape': {
                    if (_this.menuEl) {
                        event.preventDefault();
                        event.stopPropagation();
                        _this.resetTypeahead();
                        return true;
                    }
                    break;
                }
                case ' ': {
                    if (event.ctrlKey) {
                        event.preventDefault();
                        _this.handleTypeahead();
                        return true;
                    }
                    break;
                }
                case 'Tab': {
                    if (_this.menuEl) {
                        // Dont blur input
                        event.preventDefault();
                        if (!suggestions || suggestions.length === 0) {
                            return undefined;
                        }
                        // Get the currently selected suggestion
                        var flattenedSuggestions = flattenSuggestions(suggestions);
                        var selected = Math.abs(typeaheadIndex);
                        var selectedIndex = selected % flattenedSuggestions.length || 0;
                        var suggestion = flattenedSuggestions[selectedIndex];
                        _this.applyTypeahead(change, suggestion);
                        return true;
                    }
                    break;
                }
                case 'ArrowDown': {
                    if (_this.menuEl) {
                        // Select next suggestion
                        event.preventDefault();
                        _this.setState({ typeaheadIndex: typeaheadIndex + 1 });
                    }
                    break;
                }
                case 'ArrowUp': {
                    if (_this.menuEl) {
                        // Select previous suggestion
                        event.preventDefault();
                        _this.setState({ typeaheadIndex: Math.max(0, typeaheadIndex - 1) });
                    }
                    break;
                }
                default: {
                    // console.log('default key', event.key, event.which, event.charCode, event.locale, data.key);
                    break;
                }
            }
            return undefined;
        };
        _this.resetTypeahead = function () {
            _this.setState({
                suggestions: [],
                typeaheadIndex: 0,
                typeaheadPrefix: '',
                typeaheadContext: null,
            });
        };
        _this.handleBlur = function () {
            var onBlur = _this.props.onBlur;
            // If we dont wait here, menu clicks wont work because the menu
            // will be gone.
            _this.resetTimer = setTimeout(_this.resetTypeahead, 100);
            if (onBlur) {
                onBlur();
            }
        };
        _this.handleFocus = function () {
            var onFocus = _this.props.onFocus;
            if (onFocus) {
                onFocus();
            }
        };
        _this.onClickMenu = function (item) {
            // Manually triggering change
            var change = _this.applyTypeahead(_this.state.value.change(), item);
            _this.onChange(change);
        };
        _this.updateMenu = function () {
            var suggestions = _this.state.suggestions;
            var menu = _this.menuEl;
            var selection = window.getSelection();
            var node = selection.anchorNode;
            // No menu, nothing to do
            if (!menu) {
                return;
            }
            // No suggestions or blur, remove menu
            var hasSuggesstions = suggestions && suggestions.length > 0;
            if (!hasSuggesstions) {
                menu.removeAttribute('style');
                return;
            }
            // Align menu overlay to editor node
            if (node) {
                // Read from DOM
                var rect_1 = node.parentElement.getBoundingClientRect();
                var scrollX_1 = window.scrollX;
                var scrollY_1 = window.scrollY;
                // Write DOM
                requestAnimationFrame(function () {
                    menu.style.opacity = '1';
                    menu.style.top = rect_1.top + scrollY_1 + rect_1.height + 4 + "px";
                    menu.style.left = rect_1.left + scrollX_1 - 2 + "px";
                });
            }
        };
        _this.menuRef = function (el) {
            _this.menuEl = el;
        };
        _this.renderMenu = function () {
            var portalPrefix = _this.props.portalPrefix;
            var suggestions = _this.state.suggestions;
            var hasSuggesstions = suggestions && suggestions.length > 0;
            if (!hasSuggesstions) {
                return null;
            }
            // Guard selectedIndex to be within the length of the suggestions
            var selectedIndex = Math.max(_this.state.typeaheadIndex, 0);
            var flattenedSuggestions = flattenSuggestions(suggestions);
            selectedIndex = selectedIndex % flattenedSuggestions.length || 0;
            var selectedItem = flattenedSuggestions.length > 0 ? flattenedSuggestions[selectedIndex] : null;
            // Create typeahead in DOM root so we can later position it absolutely
            return (react__WEBPACK_IMPORTED_MODULE_2___default.a.createElement(Portal, { prefix: portalPrefix },
                react__WEBPACK_IMPORTED_MODULE_2___default.a.createElement(_Typeahead__WEBPACK_IMPORTED_MODULE_10__["default"], { menuRef: _this.menuRef, selectedItem: selectedItem, onClickItem: _this.onClickMenu, groupedItems: suggestions })));
        };
        // Base plugins
        _this.plugins = [Object(_slate_plugins_braces__WEBPACK_IMPORTED_MODULE_7__["default"])(), Object(_slate_plugins_clear__WEBPACK_IMPORTED_MODULE_8__["default"])(), Object(_slate_plugins_newline__WEBPACK_IMPORTED_MODULE_9__["default"])()].concat(props.additionalPlugins);
        _this.state = {
            suggestions: [],
            typeaheadContext: null,
            typeaheadIndex: 0,
            typeaheadPrefix: '',
            typeaheadText: '',
            value: getInitialValue(props.initialValue || ''),
        };
        return _this;
    }
    QueryField.prototype.componentDidMount = function () {
        this.updateMenu();
    };
    QueryField.prototype.componentWillUnmount = function () {
        clearTimeout(this.resetTimer);
    };
    QueryField.prototype.componentDidUpdate = function () {
        this.updateMenu();
    };
    QueryField.prototype.componentWillReceiveProps = function (nextProps) {
        // initialValue is null in case the user typed
        if (nextProps.initialValue !== null && nextProps.initialValue !== this.props.initialValue) {
            this.setState({ value: getInitialValue(nextProps.initialValue) });
        }
    };
    QueryField.prototype.applyTypeahead = function (change, suggestion) {
        var _a = this.props, cleanText = _a.cleanText, onWillApplySuggestion = _a.onWillApplySuggestion;
        var _b = this.state, typeaheadPrefix = _b.typeaheadPrefix, typeaheadText = _b.typeaheadText;
        var suggestionText = suggestion.insertText || suggestion.label;
        var move = suggestion.move || 0;
        if (onWillApplySuggestion) {
            suggestionText = onWillApplySuggestion(suggestionText, tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, this.state));
        }
        this.resetTypeahead();
        // Remove the current, incomplete text and replace it with the selected suggestion
        var backward = suggestion.deleteBackwards || typeaheadPrefix.length;
        var text = cleanText ? cleanText(typeaheadText) : typeaheadText;
        var suffixLength = text.length - typeaheadPrefix.length;
        var offset = typeaheadText.indexOf(typeaheadPrefix);
        var midWord = typeaheadPrefix && ((suffixLength > 0 && offset > -1) || suggestionText === typeaheadText);
        var forward = midWord ? suffixLength + offset : 0;
        // If new-lines, apply suggestion as block
        if (suggestionText.match(/\n/)) {
            var fragment = makeFragment(suggestionText);
            return change
                .deleteBackward(backward)
                .deleteForward(forward)
                .insertFragment(fragment)
                .focus();
        }
        return change
            .deleteBackward(backward)
            .deleteForward(forward)
            .insertText(suggestionText)
            .move(move)
            .focus();
    };
    QueryField.prototype.render = function () {
        return (react__WEBPACK_IMPORTED_MODULE_2___default.a.createElement("div", { className: "slate-query-field" },
            this.renderMenu(),
            react__WEBPACK_IMPORTED_MODULE_2___default.a.createElement(slate_react__WEBPACK_IMPORTED_MODULE_5__["Editor"], { autoCorrect: false, onBlur: this.handleBlur, onKeyDown: this.onKeyDown, onChange: this.onChange, onFocus: this.handleFocus, placeholder: this.props.placeholder, plugins: this.plugins, spellCheck: false, value: this.state.value })));
    };
    return QueryField;
}(react__WEBPACK_IMPORTED_MODULE_2___default.a.Component));
var Portal = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](Portal, _super);
    function Portal(props) {
        var _this = _super.call(this, props) || this;
        var _a = props.index, index = _a === void 0 ? 0 : _a, _b = props.prefix, prefix = _b === void 0 ? 'query' : _b;
        _this.node = document.createElement('div');
        _this.node.classList.add("slate-typeahead", "slate-typeahead-" + prefix + "-" + index);
        document.body.appendChild(_this.node);
        return _this;
    }
    Portal.prototype.componentWillUnmount = function () {
        document.body.removeChild(this.node);
    };
    Portal.prototype.render = function () {
        return react_dom__WEBPACK_IMPORTED_MODULE_3___default.a.createPortal(this.props.children, this.node);
    };
    return Portal;
}(react__WEBPACK_IMPORTED_MODULE_2___default.a.Component));
/* harmony default export */ __webpack_exports__["default"] = (QueryField);


/***/ }),

/***/ "./public/app/containers/Explore/QueryRows.tsx":
/*!*****************************************************!*\
  !*** ./public/app/containers/Explore/QueryRows.tsx ***!
  \*****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _PromQueryField__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./PromQueryField */ "./public/app/containers/Explore/PromQueryField.tsx");



var QueryRow = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](QueryRow, _super);
    function QueryRow(props) {
        var _this = _super.call(this, props) || this;
        _this.handleChangeQuery = function (value) {
            var _a = _this.props, index = _a.index, onChangeQuery = _a.onChangeQuery;
            var query = _this.state.query;
            var edited = query !== value;
            _this.setState({ edited: edited, query: value });
            if (onChangeQuery) {
                onChangeQuery(value, index);
            }
        };
        _this.handleClickAddButton = function () {
            var _a = _this.props, index = _a.index, onAddQueryRow = _a.onAddQueryRow;
            if (onAddQueryRow) {
                onAddQueryRow(index);
            }
        };
        _this.handleClickRemoveButton = function () {
            var _a = _this.props, index = _a.index, onRemoveQueryRow = _a.onRemoveQueryRow;
            if (onRemoveQueryRow) {
                onRemoveQueryRow(index);
            }
        };
        _this.handlePressEnter = function () {
            var onExecuteQuery = _this.props.onExecuteQuery;
            if (onExecuteQuery) {
                onExecuteQuery();
            }
        };
        _this.state = {
            edited: false,
            query: props.query || '',
        };
        return _this;
    }
    QueryRow.prototype.render = function () {
        var request = this.props.request;
        var _a = this.state, edited = _a.edited, query = _a.query;
        return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "query-row" },
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "query-row-tools" },
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("button", { className: "btn navbar-button navbar-button--tight", onClick: this.handleClickAddButton },
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("i", { className: "fa fa-plus" })),
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("button", { className: "btn navbar-button navbar-button--tight", onClick: this.handleClickRemoveButton },
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("i", { className: "fa fa-minus" }))),
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "slate-query-field-wrapper" },
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_PromQueryField__WEBPACK_IMPORTED_MODULE_2__["default"], { initialQuery: edited ? null : query, portalPrefix: "explore", onPressEnter: this.handlePressEnter, onQueryChange: this.handleChangeQuery, request: request }))));
    };
    return QueryRow;
}(react__WEBPACK_IMPORTED_MODULE_1__["PureComponent"]));
var QueryRows = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](QueryRows, _super);
    function QueryRows() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    QueryRows.prototype.render = function () {
        var _a = this.props, _b = _a.className, className = _b === void 0 ? '' : _b, queries = _a.queries, handlers = tslib__WEBPACK_IMPORTED_MODULE_0__["__rest"](_a, ["className", "queries"]);
        return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: className }, queries.map(function (q, index) { return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(QueryRow, tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({ key: q.key, index: index, query: q.query }, handlers)); })));
    };
    return QueryRows;
}(react__WEBPACK_IMPORTED_MODULE_1__["PureComponent"]));
/* harmony default export */ __webpack_exports__["default"] = (QueryRows);


/***/ }),

/***/ "./public/app/containers/Explore/Table.tsx":
/*!*************************************************!*\
  !*** ./public/app/containers/Explore/Table.tsx ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);


// import TableModel from 'app/core/table_model';
var EMPTY_TABLE = {
    columns: [],
    rows: [],
};
var Table = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](Table, _super);
    function Table() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Table.prototype.render = function () {
        var _a = this.props, _b = _a.className, className = _b === void 0 ? '' : _b, data = _a.data;
        var tableModel = data || EMPTY_TABLE;
        return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("table", { className: className + " filter-table" },
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("thead", null,
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("tr", null, tableModel.columns.map(function (col) { return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("th", { key: col.text }, col.text); }))),
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("tbody", null, tableModel.rows.map(function (row, i) { return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("tr", { key: i }, row.map(function (content, j) { return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("td", { key: j }, content); })); }))));
    };
    return Table;
}(react__WEBPACK_IMPORTED_MODULE_1__["PureComponent"]));
/* harmony default export */ __webpack_exports__["default"] = (Table);


/***/ }),

/***/ "./public/app/containers/Explore/TimePicker.tsx":
/*!******************************************************!*\
  !*** ./public/app/containers/Explore/TimePicker.tsx ***!
  \******************************************************/
/*! exports provided: DEFAULT_RANGE, parseTime, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DEFAULT_RANGE", function() { return DEFAULT_RANGE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseTime", function() { return parseTime; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! moment */ "./node_modules/moment/moment.js");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! app/core/utils/datemath */ "./public/app/core/utils/datemath.ts");
/* harmony import */ var app_core_utils_rangeutil__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! app/core/utils/rangeutil */ "./public/app/core/utils/rangeutil.ts");





var DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
var DEFAULT_RANGE = {
    from: 'now-6h',
    to: 'now',
};
function parseTime(value, isUtc, asString) {
    if (isUtc === void 0) { isUtc = false; }
    if (asString === void 0) { asString = false; }
    if (value.indexOf('now') !== -1) {
        return value;
    }
    if (!isNaN(value)) {
        var epoch = parseInt(value);
        var m = isUtc ? moment__WEBPACK_IMPORTED_MODULE_2___default.a.utc(epoch) : moment__WEBPACK_IMPORTED_MODULE_2___default()(epoch);
        return asString ? m.format(DATE_FORMAT) : m;
    }
    return undefined;
}
var TimePicker = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](TimePicker, _super);
    function TimePicker(props) {
        var _this = _super.call(this, props) || this;
        _this.handleChangeFrom = function (e) {
            _this.setState({
                fromRaw: e.target.value,
            });
        };
        _this.handleChangeTo = function (e) {
            _this.setState({
                toRaw: e.target.value,
            });
        };
        _this.handleClickApply = function () {
            var onChangeTime = _this.props.onChangeTime;
            var _a = _this.state, toRaw = _a.toRaw, fromRaw = _a.fromRaw;
            var range = {
                from: app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_3__["parse"](fromRaw, false),
                to: app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_3__["parse"](toRaw, true),
            };
            var rangeString = app_core_utils_rangeutil__WEBPACK_IMPORTED_MODULE_4__["describeTimeRange"](range);
            _this.setState({
                isOpen: false,
                rangeString: rangeString,
            }, function () {
                if (onChangeTime) {
                    onChangeTime(range);
                }
            });
        };
        _this.handleClickLeft = function () { return _this.move(-1); };
        _this.handleClickPicker = function () {
            _this.setState(function (state) { return ({
                isOpen: !state.isOpen,
            }); });
        };
        _this.handleClickRight = function () { return _this.move(1); };
        _this.handleClickRefresh = function () { };
        _this.handleClickRelativeOption = function (range) {
            var onChangeTime = _this.props.onChangeTime;
            var rangeString = app_core_utils_rangeutil__WEBPACK_IMPORTED_MODULE_4__["describeTimeRange"](range);
            _this.setState({
                toRaw: range.to,
                fromRaw: range.from,
                isOpen: false,
                rangeString: rangeString,
            }, function () {
                if (onChangeTime) {
                    onChangeTime(range);
                }
            });
        };
        _this.dropdownRef = function (el) {
            _this.dropdownEl = el;
        };
        var fromRaw = props.range ? props.range.from : DEFAULT_RANGE.from;
        var toRaw = props.range ? props.range.to : DEFAULT_RANGE.to;
        var range = {
            from: parseTime(fromRaw),
            to: parseTime(toRaw),
        };
        _this.state = {
            fromRaw: parseTime(fromRaw, props.isUtc, true),
            isOpen: props.isOpen,
            isUtc: props.isUtc,
            rangeString: app_core_utils_rangeutil__WEBPACK_IMPORTED_MODULE_4__["describeTimeRange"](range),
            refreshInterval: '',
            toRaw: parseTime(toRaw, props.isUtc, true),
        };
        return _this;
    }
    TimePicker.prototype.move = function (direction) {
        var onChangeTime = this.props.onChangeTime;
        var _a = this.state, fromRaw = _a.fromRaw, toRaw = _a.toRaw;
        var range = {
            from: app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_3__["parse"](fromRaw, false),
            to: app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_3__["parse"](toRaw, true),
        };
        var timespan = (range.to.valueOf() - range.from.valueOf()) / 2;
        var to, from;
        if (direction === -1) {
            to = range.to.valueOf() - timespan;
            from = range.from.valueOf() - timespan;
        }
        else if (direction === 1) {
            to = range.to.valueOf() + timespan;
            from = range.from.valueOf() + timespan;
            if (to > Date.now() && range.to < Date.now()) {
                to = Date.now();
                from = range.from.valueOf();
            }
        }
        else {
            to = range.to.valueOf();
            from = range.from.valueOf();
        }
        var rangeString = app_core_utils_rangeutil__WEBPACK_IMPORTED_MODULE_4__["describeTimeRange"](range);
        // No need to convert to UTC again
        to = moment__WEBPACK_IMPORTED_MODULE_2___default()(to);
        from = moment__WEBPACK_IMPORTED_MODULE_2___default()(from);
        this.setState({
            rangeString: rangeString,
            fromRaw: from.format(DATE_FORMAT),
            toRaw: to.format(DATE_FORMAT),
        }, function () {
            onChangeTime({ to: to, from: from });
        });
    };
    TimePicker.prototype.getTimeOptions = function () {
        return app_core_utils_rangeutil__WEBPACK_IMPORTED_MODULE_4__["getRelativeTimesList"]({}, this.state.rangeString);
    };
    TimePicker.prototype.renderDropdown = function () {
        var _this = this;
        var _a = this.state, fromRaw = _a.fromRaw, isOpen = _a.isOpen, toRaw = _a.toRaw;
        if (!isOpen) {
            return null;
        }
        var timeOptions = this.getTimeOptions();
        return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { ref: this.dropdownRef, className: "gf-timepicker-dropdown" },
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "gf-timepicker-absolute-section" },
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("h3", { className: "section-heading" }, "Custom range"),
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("label", { className: "small" }, "From:"),
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "gf-form-inline" },
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "gf-form max-width-28" },
                        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("input", { type: "text", className: "gf-form-input input-large timepicker-from", value: fromRaw, onChange: this.handleChangeFrom }))),
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("label", { className: "small" }, "To:"),
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "gf-form-inline" },
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "gf-form max-width-28" },
                        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("input", { type: "text", className: "gf-form-input input-large timepicker-to", value: toRaw, onChange: this.handleChangeTo }))),
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "gf-form" },
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("button", { className: "btn gf-form-btn btn-secondary", onClick: this.handleClickApply }, "Apply"))),
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "gf-timepicker-relative-section" },
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("h3", { className: "section-heading" }, "Quick ranges"),
                Object.keys(timeOptions).map(function (section) {
                    var group = timeOptions[section];
                    return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("ul", { key: section }, group.map(function (option) { return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("li", { className: option.active ? 'active' : '', key: option.display },
                        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("a", { onClick: function () { return _this.handleClickRelativeOption(option); } }, option.display))); })));
                }))));
    };
    TimePicker.prototype.render = function () {
        var _a = this.state, isUtc = _a.isUtc, rangeString = _a.rangeString, refreshInterval = _a.refreshInterval;
        return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "timepicker" },
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "navbar-buttons" },
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("button", { className: "btn navbar-button navbar-button--tight timepicker-left", onClick: this.handleClickLeft },
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("i", { className: "fa fa-chevron-left" })),
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("button", { className: "btn navbar-button gf-timepicker-nav-btn", onClick: this.handleClickPicker },
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("i", { className: "fa fa-clock-o" }),
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("span", { className: "timepicker-rangestring" }, rangeString),
                    isUtc ? react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("span", { className: "gf-timepicker-utc" }, "UTC") : null,
                    refreshInterval ? react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("span", { className: "text-warning" },
                        "\u00A0 Refresh every ",
                        refreshInterval) : null),
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("button", { className: "btn navbar-button navbar-button--tight timepicker-right", onClick: this.handleClickRight },
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("i", { className: "fa fa-chevron-right" }))),
            this.renderDropdown()));
    };
    return TimePicker;
}(react__WEBPACK_IMPORTED_MODULE_1__["PureComponent"]));
/* harmony default export */ __webpack_exports__["default"] = (TimePicker);


/***/ }),

/***/ "./public/app/containers/Explore/Typeahead.tsx":
/*!*****************************************************!*\
  !*** ./public/app/containers/Explore/Typeahead.tsx ***!
  \*****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);


function scrollIntoView(el) {
    if (!el || !el.offsetParent) {
        return;
    }
    var container = el.offsetParent;
    if (el.offsetTop > container.scrollTop + container.offsetHeight || el.offsetTop < container.scrollTop) {
        container.scrollTop = el.offsetTop - container.offsetTop;
    }
}
var TypeaheadItem = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](TypeaheadItem, _super);
    function TypeaheadItem() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.getRef = function (el) {
            _this.el = el;
        };
        _this.onClick = function () {
            _this.props.onClickItem(_this.props.item);
        };
        return _this;
    }
    TypeaheadItem.prototype.componentDidUpdate = function (prevProps) {
        if (this.props.isSelected && !prevProps.isSelected) {
            scrollIntoView(this.el);
        }
    };
    TypeaheadItem.prototype.render = function () {
        var _a = this.props, isSelected = _a.isSelected, item = _a.item;
        var className = isSelected ? 'typeahead-item typeahead-item__selected' : 'typeahead-item';
        return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("li", { ref: this.getRef, className: className, onClick: this.onClick },
            item.detail || item.label,
            item.documentation && isSelected ? react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "typeahead-item-hint" }, item.documentation) : null));
    };
    return TypeaheadItem;
}(react__WEBPACK_IMPORTED_MODULE_1___default.a.PureComponent));
var TypeaheadGroup = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](TypeaheadGroup, _super);
    function TypeaheadGroup() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TypeaheadGroup.prototype.render = function () {
        var _a = this.props, items = _a.items, label = _a.label, selected = _a.selected, onClickItem = _a.onClickItem;
        return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("li", { className: "typeahead-group" },
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "typeahead-group__title" }, label),
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("ul", { className: "typeahead-group__list" }, items.map(function (item) {
                return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(TypeaheadItem, { key: item.label, onClickItem: onClickItem, isSelected: selected === item, item: item }));
            }))));
    };
    return TypeaheadGroup;
}(react__WEBPACK_IMPORTED_MODULE_1___default.a.PureComponent));
var Typeahead = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](Typeahead, _super);
    function Typeahead() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Typeahead.prototype.render = function () {
        var _a = this.props, groupedItems = _a.groupedItems, menuRef = _a.menuRef, selectedItem = _a.selectedItem, onClickItem = _a.onClickItem;
        return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("ul", { className: "typeahead", ref: menuRef }, groupedItems.map(function (g) { return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(TypeaheadGroup, tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({ key: g.label, onClickItem: onClickItem, selected: selectedItem }, g))); })));
    };
    return Typeahead;
}(react__WEBPACK_IMPORTED_MODULE_1___default.a.PureComponent));
/* harmony default export */ __webpack_exports__["default"] = (Typeahead);


/***/ }),

/***/ "./public/app/containers/Explore/Wrapper.tsx":
/*!***************************************************!*\
  !*** ./public/app/containers/Explore/Wrapper.tsx ***!
  \***************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _Explore__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Explore */ "./public/app/containers/Explore/Explore.tsx");



var Wrapper = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](Wrapper, _super);
    function Wrapper() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            initialState: null,
            split: false,
        };
        _this.handleChangeSplit = function (split, initialState) {
            _this.setState({ split: split, initialState: initialState });
        };
        return _this;
    }
    Wrapper.prototype.render = function () {
        // State overrides for props from first Explore
        var _a = this.state, initialState = _a.initialState, split = _a.split;
        return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "explore-wrapper" },
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_Explore__WEBPACK_IMPORTED_MODULE_2__["default"], tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, this.props, { position: "left", onChangeSplit: this.handleChangeSplit, split: split })),
            split ? (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_Explore__WEBPACK_IMPORTED_MODULE_2__["default"], tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, this.props, { initialState: initialState, onChangeSplit: this.handleChangeSplit, position: "right", split: split }))) : null));
    };
    return Wrapper;
}(react__WEBPACK_IMPORTED_MODULE_1__["PureComponent"]));
/* harmony default export */ __webpack_exports__["default"] = (Wrapper);


/***/ }),

/***/ "./public/app/containers/Explore/slate-plugins/braces.ts":
/*!***************************************************************!*\
  !*** ./public/app/containers/Explore/slate-plugins/braces.ts ***!
  \***************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return BracesPlugin; });
var BRACES = {
    '[': ']',
    '{': '}',
    '(': ')',
};
function BracesPlugin() {
    return {
        onKeyDown: function (event, change) {
            var value = change.value;
            if (!value.isCollapsed) {
                return undefined;
            }
            switch (event.key) {
                case '{':
                case '[': {
                    event.preventDefault();
                    // Insert matching braces
                    change
                        .insertText("" + event.key + BRACES[event.key])
                        .move(-1)
                        .focus();
                    return true;
                }
                case '(': {
                    event.preventDefault();
                    var text = value.anchorText.text;
                    var offset = value.anchorOffset;
                    var space = text.indexOf(' ', offset);
                    var length = space > 0 ? space : text.length;
                    var forward = length - offset;
                    // Insert matching braces
                    change
                        .insertText(event.key)
                        .move(forward)
                        .insertText(BRACES[event.key])
                        .move(-1 - forward)
                        .focus();
                    return true;
                }
                default: {
                    break;
                }
            }
            return undefined;
        },
    };
}


/***/ }),

/***/ "./public/app/containers/Explore/slate-plugins/clear.ts":
/*!**************************************************************!*\
  !*** ./public/app/containers/Explore/slate-plugins/clear.ts ***!
  \**************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ClearPlugin; });
// Clears the rest of the line after the caret
function ClearPlugin() {
    return {
        onKeyDown: function (event, change) {
            var value = change.value;
            if (!value.isCollapsed) {
                return undefined;
            }
            if (event.key === 'k' && event.ctrlKey) {
                event.preventDefault();
                var text = value.anchorText.text;
                var offset = value.anchorOffset;
                var length = text.length;
                var forward = length - offset;
                change.deleteForward(forward);
                return true;
            }
            return undefined;
        },
    };
}


/***/ }),

/***/ "./public/app/containers/Explore/slate-plugins/newline.ts":
/*!****************************************************************!*\
  !*** ./public/app/containers/Explore/slate-plugins/newline.ts ***!
  \****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return NewlinePlugin; });
function getIndent(text) {
    var offset = text.length - text.trimLeft().length;
    if (offset) {
        var indent = text[0];
        while (--offset) {
            indent += text[0];
        }
        return indent;
    }
    return '';
}
function NewlinePlugin() {
    return {
        onKeyDown: function (event, change) {
            var value = change.value;
            if (!value.isCollapsed) {
                return undefined;
            }
            if (event.key === 'Enter' && event.shiftKey) {
                event.preventDefault();
                var startBlock = value.startBlock;
                var currentLineText = startBlock.text;
                var indent = getIndent(currentLineText);
                return change
                    .splitBlock()
                    .insertText(indent)
                    .focus();
            }
        },
    };
}


/***/ }),

/***/ "./public/app/containers/Explore/slate-plugins/prism/index.tsx":
/*!*********************************************************************!*\
  !*** ./public/app/containers/Explore/slate-plugins/prism/index.tsx ***!
  \*********************************************************************/
/*! exports provided: setPrismTokens, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setPrismTokens", function() { return setPrismTokens; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return PrismPlugin; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var prismjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! prismjs */ "./node_modules/prismjs/prism.js");
/* harmony import */ var prismjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(prismjs__WEBPACK_IMPORTED_MODULE_1__);


var TOKEN_MARK = 'prism-token';
function setPrismTokens(language, field, values, alias) {
    if (alias === void 0) { alias = 'variable'; }
    prismjs__WEBPACK_IMPORTED_MODULE_1___default.a.languages[language][field] = {
        alias: alias,
        pattern: new RegExp("(?:^|\\s)(" + values.join('|') + ")(?:$|\\s)"),
    };
}
/**
 * Code-highlighting plugin based on Prism and
 * https://github.com/ianstormtaylor/slate/blob/master/examples/code-highlighting/index.js
 *
 * (Adapted to handle nested grammar definitions.)
 */
function PrismPlugin(_a) {
    var definition = _a.definition, language = _a.language;
    if (definition) {
        // Don't override exising modified definitions
        prismjs__WEBPACK_IMPORTED_MODULE_1___default.a.languages[language] = prismjs__WEBPACK_IMPORTED_MODULE_1___default.a.languages[language] || definition;
    }
    return {
        /**
         * Render a Slate mark with appropiate CSS class names
         *
         * @param {Object} props
         * @return {Element}
         */
        renderMark: function (props) {
            var children = props.children, mark = props.mark;
            // Only apply spans to marks identified by this plugin
            if (mark.type !== TOKEN_MARK) {
                return undefined;
            }
            var className = "token " + mark.data.get('types');
            return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("span", { className: className }, children);
        },
        /**
         * Decorate code blocks with Prism.js highlighting.
         *
         * @param {Node} node
         * @return {Array}
         */
        decorateNode: function (node) {
            if (node.type !== 'paragraph') {
                return [];
            }
            var texts = node.getTexts().toArray();
            var tstring = texts.map(function (t) { return t.text; }).join('\n');
            var grammar = prismjs__WEBPACK_IMPORTED_MODULE_1___default.a.languages[language];
            var tokens = prismjs__WEBPACK_IMPORTED_MODULE_1___default.a.tokenize(tstring, grammar);
            var decorations = [];
            var startText = texts.shift();
            var endText = startText;
            var startOffset = 0;
            var endOffset = 0;
            var start = 0;
            function processToken(token, acc) {
                // Accumulate token types down the tree
                var types = (acc || '') + " " + (token.type || '') + " " + (token.alias || '');
                // Add mark for token node
                if (typeof token === 'string' || typeof token.content === 'string') {
                    startText = endText;
                    startOffset = endOffset;
                    var content = typeof token === 'string' ? token : token.content;
                    var newlines = content.split('\n').length - 1;
                    var length = content.length - newlines;
                    var end = start + length;
                    var available = startText.text.length - startOffset;
                    var remaining = length;
                    endOffset = startOffset + remaining;
                    while (available < remaining) {
                        endText = texts.shift();
                        remaining = length - available;
                        available = endText.text.length;
                        endOffset = remaining;
                    }
                    // Inject marks from up the tree (acc) as well
                    if (typeof token !== 'string' || acc) {
                        var range = {
                            anchorKey: startText.key,
                            anchorOffset: startOffset,
                            focusKey: endText.key,
                            focusOffset: endOffset,
                            marks: [{ type: TOKEN_MARK, data: { types: types } }],
                        };
                        decorations.push(range);
                    }
                    start = end;
                }
                else if (token.content && token.content.length) {
                    // Tokens can be nested
                    for (var _i = 0, _a = token.content; _i < _a.length; _i++) {
                        var subToken = _a[_i];
                        processToken(subToken, types);
                    }
                }
            }
            // Process top-level tokens
            for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
                var token = tokens_1[_i];
                processToken(token);
            }
            return decorations;
        },
    };
}


/***/ }),

/***/ "./public/app/containers/Explore/slate-plugins/prism/promql.ts":
/*!*********************************************************************!*\
  !*** ./public/app/containers/Explore/slate-plugins/prism/promql.ts ***!
  \*********************************************************************/
/*! exports provided: OPERATORS, FUNCTIONS, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "OPERATORS", function() { return OPERATORS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FUNCTIONS", function() { return FUNCTIONS; });
/* tslint:disable max-line-length */
var OPERATORS = ['by', 'group_left', 'group_right', 'ignoring', 'on', 'offset', 'without'];
var AGGREGATION_OPERATORS = [
    {
        label: 'sum',
        insertText: 'sum()',
        documentation: 'Calculate sum over dimensions',
    },
    {
        label: 'min',
        insertText: 'min()',
        documentation: 'Select minimum over dimensions',
    },
    {
        label: 'max',
        insertText: 'max()',
        documentation: 'Select maximum over dimensions',
    },
    {
        label: 'avg',
        insertText: 'avg()',
        documentation: 'Calculate the average over dimensions',
    },
    {
        label: 'stddev',
        insertText: 'stddev()',
        documentation: 'Calculate population standard deviation over dimensions',
    },
    {
        label: 'stdvar',
        insertText: 'stdvar()',
        documentation: 'Calculate population standard variance over dimensions',
    },
    {
        label: 'count',
        insertText: 'count()',
        documentation: 'Count number of elements in the vector',
    },
    {
        label: 'count_values',
        insertText: 'count_values()',
        documentation: 'Count number of elements with the same value',
    },
    {
        label: 'bottomk',
        insertText: 'bottomk()',
        documentation: 'Smallest k elements by sample value',
    },
    {
        label: 'topk',
        insertText: 'topk()',
        documentation: 'Largest k elements by sample value',
    },
    {
        label: 'quantile',
        insertText: 'quantile()',
        documentation: 'Calculate φ-quantile (0 ≤ φ ≤ 1) over dimensions',
    },
];
var FUNCTIONS = AGGREGATION_OPERATORS.concat([
    {
        insertText: 'abs()',
        label: 'abs',
        detail: 'abs(v instant-vector)',
        documentation: 'Returns the input vector with all sample values converted to their absolute value.',
    },
    {
        insertText: 'absent()',
        label: 'absent',
        detail: 'absent(v instant-vector)',
        documentation: 'Returns an empty vector if the vector passed to it has any elements and a 1-element vector with the value 1 if the vector passed to it has no elements. This is useful for alerting on when no time series exist for a given metric name and label combination.',
    },
    {
        insertText: 'ceil()',
        label: 'ceil',
        detail: 'ceil(v instant-vector)',
        documentation: 'Rounds the sample values of all elements in `v` up to the nearest integer.',
    },
    {
        insertText: 'changes()',
        label: 'changes',
        detail: 'changes(v range-vector)',
        documentation: 'For each input time series, `changes(v range-vector)` returns the number of times its value has changed within the provided time range as an instant vector.',
    },
    {
        insertText: 'clamp_max()',
        label: 'clamp_max',
        detail: 'clamp_max(v instant-vector, max scalar)',
        documentation: 'Clamps the sample values of all elements in `v` to have an upper limit of `max`.',
    },
    {
        insertText: 'clamp_min()',
        label: 'clamp_min',
        detail: 'clamp_min(v instant-vector, min scalar)',
        documentation: 'Clamps the sample values of all elements in `v` to have a lower limit of `min`.',
    },
    {
        insertText: 'count_scalar()',
        label: 'count_scalar',
        detail: 'count_scalar(v instant-vector)',
        documentation: 'Returns the number of elements in a time series vector as a scalar. This is in contrast to the `count()` aggregation operator, which always returns a vector (an empty one if the input vector is empty) and allows grouping by labels via a `by` clause.',
    },
    {
        insertText: 'day_of_month()',
        label: 'day_of_month',
        detail: 'day_of_month(v=vector(time()) instant-vector)',
        documentation: 'Returns the day of the month for each of the given times in UTC. Returned values are from 1 to 31.',
    },
    {
        insertText: 'day_of_week()',
        label: 'day_of_week',
        detail: 'day_of_week(v=vector(time()) instant-vector)',
        documentation: 'Returns the day of the week for each of the given times in UTC. Returned values are from 0 to 6, where 0 means Sunday etc.',
    },
    {
        insertText: 'days_in_month()',
        label: 'days_in_month',
        detail: 'days_in_month(v=vector(time()) instant-vector)',
        documentation: 'Returns number of days in the month for each of the given times in UTC. Returned values are from 28 to 31.',
    },
    {
        insertText: 'delta()',
        label: 'delta',
        detail: 'delta(v range-vector)',
        documentation: 'Calculates the difference between the first and last value of each time series element in a range vector `v`, returning an instant vector with the given deltas and equivalent labels. The delta is extrapolated to cover the full time range as specified in the range vector selector, so that it is possible to get a non-integer result even if the sample values are all integers.',
    },
    {
        insertText: 'deriv()',
        label: 'deriv',
        detail: 'deriv(v range-vector)',
        documentation: 'Calculates the per-second derivative of the time series in a range vector `v`, using simple linear regression.',
    },
    {
        insertText: 'drop_common_labels()',
        label: 'drop_common_labels',
        detail: 'drop_common_labels(instant-vector)',
        documentation: 'Drops all labels that have the same name and value across all series in the input vector.',
    },
    {
        insertText: 'exp()',
        label: 'exp',
        detail: 'exp(v instant-vector)',
        documentation: 'Calculates the exponential function for all elements in `v`.\nSpecial cases are:\n* `Exp(+Inf) = +Inf` \n* `Exp(NaN) = NaN`',
    },
    {
        insertText: 'floor()',
        label: 'floor',
        detail: 'floor(v instant-vector)',
        documentation: 'Rounds the sample values of all elements in `v` down to the nearest integer.',
    },
    {
        insertText: 'histogram_quantile()',
        label: 'histogram_quantile',
        detail: 'histogram_quantile(φ float, b instant-vector)',
        documentation: 'Calculates the φ-quantile (0 ≤ φ ≤ 1) from the buckets `b` of a histogram. The samples in `b` are the counts of observations in each bucket. Each sample must have a label `le` where the label value denotes the inclusive upper bound of the bucket. (Samples without such a label are silently ignored.) The histogram metric type automatically provides time series with the `_bucket` suffix and the appropriate labels.',
    },
    {
        insertText: 'holt_winters()',
        label: 'holt_winters',
        detail: 'holt_winters(v range-vector, sf scalar, tf scalar)',
        documentation: 'Produces a smoothed value for time series based on the range in `v`. The lower the smoothing factor `sf`, the more importance is given to old data. The higher the trend factor `tf`, the more trends in the data is considered. Both `sf` and `tf` must be between 0 and 1.',
    },
    {
        insertText: 'hour()',
        label: 'hour',
        detail: 'hour(v=vector(time()) instant-vector)',
        documentation: 'Returns the hour of the day for each of the given times in UTC. Returned values are from 0 to 23.',
    },
    {
        insertText: 'idelta()',
        label: 'idelta',
        detail: 'idelta(v range-vector)',
        documentation: 'Calculates the difference between the last two samples in the range vector `v`, returning an instant vector with the given deltas and equivalent labels.',
    },
    {
        insertText: 'increase()',
        label: 'increase',
        detail: 'increase(v range-vector)',
        documentation: 'Calculates the increase in the time series in the range vector. Breaks in monotonicity (such as counter resets due to target restarts) are automatically adjusted for. The increase is extrapolated to cover the full time range as specified in the range vector selector, so that it is possible to get a non-integer result even if a counter increases only by integer increments.',
    },
    {
        insertText: 'irate()',
        label: 'irate',
        detail: 'irate(v range-vector)',
        documentation: 'Calculates the per-second instant rate of increase of the time series in the range vector. This is based on the last two data points. Breaks in monotonicity (such as counter resets due to target restarts) are automatically adjusted for.',
    },
    {
        insertText: 'label_replace()',
        label: 'label_replace',
        detail: 'label_replace(v instant-vector, dst_label string, replacement string, src_label string, regex string)',
        documentation: "For each timeseries in `v`, `label_replace(v instant-vector, dst_label string, replacement string, src_label string, regex string)`  matches the regular expression `regex` against the label `src_label`.  If it matches, then the timeseries is returned with the label `dst_label` replaced by the expansion of `replacement`. `$1` is replaced with the first matching subgroup, `$2` with the second etc. If the regular expression doesn't match then the timeseries is returned unchanged.",
    },
    {
        insertText: 'ln()',
        label: 'ln',
        detail: 'ln(v instant-vector)',
        documentation: 'calculates the natural logarithm for all elements in `v`.\nSpecial cases are:\n * `ln(+Inf) = +Inf`\n * `ln(0) = -Inf`\n * `ln(x < 0) = NaN`\n * `ln(NaN) = NaN`',
    },
    {
        insertText: 'log2()',
        label: 'log2',
        detail: 'log2(v instant-vector)',
        documentation: 'Calculates the binary logarithm for all elements in `v`. The special cases are equivalent to those in `ln`.',
    },
    {
        insertText: 'log10()',
        label: 'log10',
        detail: 'log10(v instant-vector)',
        documentation: 'Calculates the decimal logarithm for all elements in `v`. The special cases are equivalent to those in `ln`.',
    },
    {
        insertText: 'minute()',
        label: 'minute',
        detail: 'minute(v=vector(time()) instant-vector)',
        documentation: 'Returns the minute of the hour for each of the given times in UTC. Returned values are from 0 to 59.',
    },
    {
        insertText: 'month()',
        label: 'month',
        detail: 'month(v=vector(time()) instant-vector)',
        documentation: 'Returns the month of the year for each of the given times in UTC. Returned values are from 1 to 12, where 1 means January etc.',
    },
    {
        insertText: 'predict_linear()',
        label: 'predict_linear',
        detail: 'predict_linear(v range-vector, t scalar)',
        documentation: 'Predicts the value of time series `t` seconds from now, based on the range vector `v`, using simple linear regression.',
    },
    {
        insertText: 'rate()',
        label: 'rate',
        detail: 'rate(v range-vector)',
        documentation: "Calculates the per-second average rate of increase of the time series in the range vector. Breaks in monotonicity (such as counter resets due to target restarts) are automatically adjusted for. Also, the calculation extrapolates to the ends of the time range, allowing for missed scrapes or imperfect alignment of scrape cycles with the range's time period.",
    },
    {
        insertText: 'resets()',
        label: 'resets',
        detail: 'resets(v range-vector)',
        documentation: 'For each input time series, `resets(v range-vector)` returns the number of counter resets within the provided time range as an instant vector. Any decrease in the value between two consecutive samples is interpreted as a counter reset.',
    },
    {
        insertText: 'round()',
        label: 'round',
        detail: 'round(v instant-vector, to_nearest=1 scalar)',
        documentation: 'Rounds the sample values of all elements in `v` to the nearest integer. Ties are resolved by rounding up. The optional `to_nearest` argument allows specifying the nearest multiple to which the sample values should be rounded. This multiple may also be a fraction.',
    },
    {
        insertText: 'scalar()',
        label: 'scalar',
        detail: 'scalar(v instant-vector)',
        documentation: 'Given a single-element input vector, `scalar(v instant-vector)` returns the sample value of that single element as a scalar. If the input vector does not have exactly one element, `scalar` will return `NaN`.',
    },
    {
        insertText: 'sort()',
        label: 'sort',
        detail: 'sort(v instant-vector)',
        documentation: 'Returns vector elements sorted by their sample values, in ascending order.',
    },
    {
        insertText: 'sort_desc()',
        label: 'sort_desc',
        detail: 'sort_desc(v instant-vector)',
        documentation: 'Returns vector elements sorted by their sample values, in descending order.',
    },
    {
        insertText: 'sqrt()',
        label: 'sqrt',
        detail: 'sqrt(v instant-vector)',
        documentation: 'Calculates the square root of all elements in `v`.',
    },
    {
        insertText: 'time()',
        label: 'time',
        detail: 'time()',
        documentation: 'Returns the number of seconds since January 1, 1970 UTC. Note that this does not actually return the current time, but the time at which the expression is to be evaluated.',
    },
    {
        insertText: 'vector()',
        label: 'vector',
        detail: 'vector(s scalar)',
        documentation: 'Returns the scalar `s` as a vector with no labels.',
    },
    {
        insertText: 'year()',
        label: 'year',
        detail: 'year(v=vector(time()) instant-vector)',
        documentation: 'Returns the year for each of the given times in UTC.',
    },
    {
        insertText: 'avg_over_time()',
        label: 'avg_over_time',
        detail: 'avg_over_time(range-vector)',
        documentation: 'The average value of all points in the specified interval.',
    },
    {
        insertText: 'min_over_time()',
        label: 'min_over_time',
        detail: 'min_over_time(range-vector)',
        documentation: 'The minimum value of all points in the specified interval.',
    },
    {
        insertText: 'max_over_time()',
        label: 'max_over_time',
        detail: 'max_over_time(range-vector)',
        documentation: 'The maximum value of all points in the specified interval.',
    },
    {
        insertText: 'sum_over_time()',
        label: 'sum_over_time',
        detail: 'sum_over_time(range-vector)',
        documentation: 'The sum of all values in the specified interval.',
    },
    {
        insertText: 'count_over_time()',
        label: 'count_over_time',
        detail: 'count_over_time(range-vector)',
        documentation: 'The count of all values in the specified interval.',
    },
    {
        insertText: 'quantile_over_time()',
        label: 'quantile_over_time',
        detail: 'quantile_over_time(scalar, range-vector)',
        documentation: 'The φ-quantile (0 ≤ φ ≤ 1) of the values in the specified interval.',
    },
    {
        insertText: 'stddev_over_time()',
        label: 'stddev_over_time',
        detail: 'stddev_over_time(range-vector)',
        documentation: 'The population standard deviation of the values in the specified interval.',
    },
    {
        insertText: 'stdvar_over_time()',
        label: 'stdvar_over_time',
        detail: 'stdvar_over_time(range-vector)',
        documentation: 'The population standard variance of the values in the specified interval.',
    },
]);
var tokenizer = {
    comment: {
        pattern: /(^|[^\n])#.*/,
        lookbehind: true,
    },
    'context-aggregation': {
        pattern: /((by|without)\s*)\([^)]*\)/,
        lookbehind: true,
        inside: {
            'label-key': {
                pattern: /[^,\s][^,]*[^,\s]*/,
                alias: 'attr-name',
            },
        },
    },
    'context-labels': {
        pattern: /\{[^}]*(?=})/,
        inside: {
            'label-key': {
                pattern: /[a-z_]\w*(?=\s*(=|!=|=~|!~))/,
                alias: 'attr-name',
            },
            'label-value': {
                pattern: /"(?:\\.|[^\\"])*"/,
                greedy: true,
                alias: 'attr-value',
            },
        },
    },
    function: new RegExp("\\b(?:" + FUNCTIONS.map(function (f) { return f.label; }).join('|') + ")(?=\\s*\\()", 'i'),
    'context-range': [
        {
            pattern: /\[[^\]]*(?=])/,
            inside: {
                'range-duration': {
                    pattern: /\b\d+[smhdwy]\b/i,
                    alias: 'number',
                },
            },
        },
        {
            pattern: /(offset\s+)\w+/,
            lookbehind: true,
            inside: {
                'range-duration': {
                    pattern: /\b\d+[smhdwy]\b/i,
                    alias: 'number',
                },
            },
        },
    ],
    number: /\b-?\d+((\.\d*)?([eE][+-]?\d+)?)?\b/,
    operator: new RegExp("/[-+*/=%^~]|&&?|\\|?\\||!=?|<(?:=>?|<|>)?|>[>=]?|\\b(?:" + OPERATORS.join('|') + ")\\b", 'i'),
    punctuation: /[{};()`,.]/,
};
/* harmony default export */ __webpack_exports__["default"] = (tokenizer);


/***/ }),

/***/ "./public/app/containers/Explore/slate-plugins/runner.ts":
/*!***************************************************************!*\
  !*** ./public/app/containers/Explore/slate-plugins/runner.ts ***!
  \***************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return RunnerPlugin; });
function RunnerPlugin(_a) {
    var handler = _a.handler;
    return {
        onKeyDown: function (event) {
            // Handle enter
            if (handler && event.key === 'Enter' && !event.shiftKey) {
                // Submit on Enter
                event.preventDefault();
                handler(event);
                return true;
            }
            return undefined;
        },
    };
}


/***/ }),

/***/ "./public/app/containers/Explore/utils/dom.ts":
/*!****************************************************!*\
  !*** ./public/app/containers/Explore/utils/dom.ts ***!
  \****************************************************/
/*! exports provided: getPreviousCousin, getNextCharacter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getPreviousCousin", function() { return getPreviousCousin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getNextCharacter", function() { return getNextCharacter; });
// Node.closest() polyfill
if ('Element' in window && !Element.prototype.closest) {
    Element.prototype.closest = function (s) {
        var matches = (this.document || this.ownerDocument).querySelectorAll(s);
        var el = this;
        var i;
        // eslint-disable-next-line
        do {
            i = matches.length;
            // eslint-disable-next-line
            while (--i >= 0 && matches.item(i) !== el) { }
        } while (i < 0 && (el = el.parentElement));
        return el;
    };
}
function getPreviousCousin(node, selector) {
    var sibling = node.parentElement.previousSibling;
    var el;
    while (sibling) {
        el = sibling.querySelector(selector);
        if (el) {
            return el;
        }
        sibling = sibling.previousSibling;
    }
    return undefined;
}
function getNextCharacter(global) {
    if (global === void 0) { global = window; }
    var selection = global.getSelection();
    if (!selection.anchorNode) {
        return null;
    }
    var range = selection.getRangeAt(0);
    var text = selection.anchorNode.textContent;
    var offset = range.startOffset;
    return text.substr(offset, 1);
}


/***/ }),

/***/ "./public/app/containers/Explore/utils/prometheus.ts":
/*!***********************************************************!*\
  !*** ./public/app/containers/Explore/utils/prometheus.ts ***!
  \***********************************************************/
/*! exports provided: RATE_RANGES, processLabels, cleanText */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RATE_RANGES", function() { return RATE_RANGES; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "processLabels", function() { return processLabels; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cleanText", function() { return cleanText; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");

var RATE_RANGES = ['1m', '5m', '10m', '30m', '1h'];
function processLabels(labels) {
    var values = {};
    labels.forEach(function (l) {
        var __name__ = l.__name__, rest = tslib__WEBPACK_IMPORTED_MODULE_0__["__rest"](l, ["__name__"]);
        Object.keys(rest).forEach(function (key) {
            if (!values[key]) {
                values[key] = [];
            }
            if (values[key].indexOf(rest[key]) === -1) {
                values[key].push(rest[key]);
            }
        });
    });
    return { values: values, keys: Object.keys(values) };
}
// Strip syntax chars
var cleanText = function (s) { return s.replace(/[{}[\]="(),!~+\-*/^%]/g, '').trim(); };


/***/ }),

/***/ "./public/app/containers/Explore/utils/query.ts":
/*!******************************************************!*\
  !*** ./public/app/containers/Explore/utils/query.ts ***!
  \******************************************************/
/*! exports provided: generateQueryKey, ensureQueries, hasQuery */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "generateQueryKey", function() { return generateQueryKey; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ensureQueries", function() { return ensureQueries; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hasQuery", function() { return hasQuery; });
function generateQueryKey(index) {
    if (index === void 0) { index = 0; }
    return "Q-" + Date.now() + "-" + Math.random() + "-" + index;
}
function ensureQueries(queries) {
    if (queries && typeof queries === 'object' && queries.length > 0 && typeof queries[0] === 'string') {
        return queries.map(function (query, i) { return ({ key: generateQueryKey(i), query: query }); });
    }
    return [{ key: generateQueryKey(), query: '' }];
}
function hasQuery(queries) {
    return queries.some(function (q) { return q.query; });
}


/***/ })

}]);
//# sourceMappingURL=explore.a233ba4eeab1582669ac.js.map