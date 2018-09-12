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
/* harmony import */ var app_core_store__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! app/core/store */ "./public/app/core/store.ts");
/* harmony import */ var app_core_time_series2__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! app/core/time_series2 */ "./public/app/core/time_series2.ts");
/* harmony import */ var app_core_utils_location_util__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! app/core/utils/location_util */ "./public/app/core/utils/location_util.ts");
/* harmony import */ var app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! app/core/utils/datemath */ "./public/app/core/utils/datemath.ts");
/* harmony import */ var _ElapsedTime__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./ElapsedTime */ "./public/app/containers/Explore/ElapsedTime.tsx");
/* harmony import */ var _QueryRows__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./QueryRows */ "./public/app/containers/Explore/QueryRows.tsx");
/* harmony import */ var _Graph__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./Graph */ "./public/app/containers/Explore/Graph.tsx");
/* harmony import */ var _Logs__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./Logs */ "./public/app/containers/Explore/Logs.tsx");
/* harmony import */ var _Table__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./Table */ "./public/app/containers/Explore/Table.tsx");
/* harmony import */ var _TimePicker__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./TimePicker */ "./public/app/containers/Explore/TimePicker.tsx");
/* harmony import */ var _utils_query__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./utils/query */ "./public/app/containers/Explore/utils/query.ts");

















var MAX_HISTORY_ITEMS = 100;
function makeHints(hints) {
    var hintsByIndex = [];
    hints.forEach(function (hint) {
        if (hint) {
            hintsByIndex[hint.index] = hint;
        }
    });
    return hintsByIndex;
}
function makeTimeSeriesList(dataList, options) {
    return dataList.map(function (seriesData, index) {
        var datapoints = seriesData.datapoints || [];
        var alias = seriesData.target;
        var colorIndex = index % app_core_utils_colors__WEBPACK_IMPORTED_MODULE_5__["default"].length;
        var color = app_core_utils_colors__WEBPACK_IMPORTED_MODULE_5__["default"][colorIndex];
        var series = new app_core_time_series2__WEBPACK_IMPORTED_MODULE_7__["default"]({
            datapoints: datapoints,
            alias: alias,
            color: color,
            unit: seriesData.unit,
        });
        return series;
    });
}
function parseUrlState(initial) {
    if (initial) {
        try {
            var parsed = JSON.parse(Object(app_core_utils_location_util__WEBPACK_IMPORTED_MODULE_8__["decodePathComponent"])(initial));
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
    return { datasource: null, queries: [], range: _TimePicker__WEBPACK_IMPORTED_MODULE_15__["DEFAULT_RANGE"] };
}
var Explore = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](Explore, _super);
    function Explore(props) {
        var _this = _super.call(this, props) || this;
        _this.getRef = function (el) {
            _this.el = el;
        };
        _this.onAddQueryRow = function (index) {
            var queries = _this.state.queries;
            var nextQueries = queries.slice(0, index + 1).concat([
                { query: '', key: Object(_utils_query__WEBPACK_IMPORTED_MODULE_16__["generateQueryKey"])() }
            ], queries.slice(index + 1));
            _this.setState({ queries: nextQueries });
        };
        _this.onChangeDatasource = function (option) { return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](_this, void 0, void 0, function () {
            var datasource;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setState({
                            datasource: null,
                            datasourceError: null,
                            datasourceLoading: true,
                            graphResult: null,
                            latency: 0,
                            logsResult: null,
                            queryErrors: [],
                            queryHints: [],
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
        _this.onChangeQuery = function (value, index, override) {
            var queries = _this.state.queries;
            var _a = _this.state, queryErrors = _a.queryErrors, queryHints = _a.queryHints;
            var prevQuery = queries[index];
            var edited = override ? false : prevQuery.query !== value;
            var nextQuery = tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, queries[index], { edited: edited, query: value });
            var nextQueries = queries.slice();
            nextQueries[index] = nextQuery;
            if (override) {
                queryErrors = [];
                queryHints = [];
            }
            _this.setState({
                queryErrors: queryErrors,
                queryHints: queryHints,
                queries: nextQueries,
            }, override ? function () { return _this.onSubmit(); } : undefined);
        };
        _this.onChangeTime = function (nextRange) {
            var range = {
                from: nextRange.from,
                to: nextRange.to,
            };
            _this.setState({ range: range }, function () { return _this.onSubmit(); });
        };
        _this.onClickClear = function () {
            _this.setState({
                graphResult: null,
                logsResult: null,
                latency: 0,
                queries: Object(_utils_query__WEBPACK_IMPORTED_MODULE_16__["ensureQueries"])(),
                queryErrors: [],
                queryHints: [],
                tableResult: null,
            });
        };
        _this.onClickCloseSplit = function () {
            var onChangeSplit = _this.props.onChangeSplit;
            if (onChangeSplit) {
                onChangeSplit(false);
            }
        };
        _this.onClickGraphButton = function () {
            _this.setState(function (state) { return ({ showingGraph: !state.showingGraph }); });
        };
        _this.onClickLogsButton = function () {
            _this.setState(function (state) { return ({ showingLogs: !state.showingLogs }); });
        };
        _this.onClickSplit = function () {
            var onChangeSplit = _this.props.onChangeSplit;
            var state = tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, _this.state);
            state.queries = state.queries.map(function (_a) {
                var edited = _a.edited, rest = tslib__WEBPACK_IMPORTED_MODULE_0__["__rest"](_a, ["edited"]);
                return rest;
            });
            if (onChangeSplit) {
                onChangeSplit(true, state);
            }
        };
        _this.onClickTableButton = function () {
            _this.setState(function (state) { return ({ showingTable: !state.showingTable }); });
        };
        _this.onClickTableCell = function (columnKey, rowValue) {
            _this.onModifyQueries({ type: 'ADD_FILTER', key: columnKey, value: rowValue });
        };
        _this.onModifyQueries = function (action, index) {
            var _a = _this.state, datasource = _a.datasource, queries = _a.queries;
            if (datasource && datasource.modifyQuery) {
                var nextQueries = void 0;
                if (index === undefined) {
                    // Modify all queries
                    nextQueries = queries.map(function (q) { return (tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, q, { edited: false, query: datasource.modifyQuery(q.query, action) })); });
                }
                else {
                    // Modify query only at index
                    nextQueries = queries.slice(0, index).concat([
                        tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, queries[index], { edited: false, query: datasource.modifyQuery(queries[index].query, action) })
                    ], queries.slice(index + 1));
                }
                _this.setState({ queries: nextQueries }, function () { return _this.onSubmit(); });
            }
        };
        _this.onRemoveQueryRow = function (index) {
            var queries = _this.state.queries;
            if (queries.length <= 1) {
                return;
            }
            var nextQueries = queries.slice(0, index).concat(queries.slice(index + 1));
            _this.setState({ queries: nextQueries }, function () { return _this.onSubmit(); });
        };
        _this.onSubmit = function () {
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
        var initialState = props.initialState;
        var _a = parseUrlState(props.routeParams.state), datasource = _a.datasource, queries = _a.queries, range = _a.range;
        _this.state = tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({ datasource: null, datasourceError: null, datasourceLoading: null, datasourceMissing: false, graphResult: null, initialDatasource: datasource, history: [], latency: 0, loading: false, logsResult: null, queries: Object(_utils_query__WEBPACK_IMPORTED_MODULE_16__["ensureQueries"])(queries), queryErrors: [], queryHints: [], range: range || tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, _TimePicker__WEBPACK_IMPORTED_MODULE_15__["DEFAULT_RANGE"]), requestOptions: null, showingGraph: true, showingLogs: true, showingTable: true, supportsGraph: null, supportsLogs: null, supportsTable: null, tableResult: null }, initialState);
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
            var supportsGraph, supportsLogs, supportsTable, datasourceId, datasourceError, testResult, error_1, historyKey, history, nextQueries;
            var _this = this;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        supportsGraph = datasource.meta.metrics;
                        supportsLogs = datasource.meta.logs;
                        supportsTable = datasource.meta.metrics;
                        datasourceId = datasource.meta.id;
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
                        historyKey = "grafana.explore.history." + datasourceId;
                        history = app_core_store__WEBPACK_IMPORTED_MODULE_6__["default"].getObject(historyKey, []);
                        if (datasource.init) {
                            datasource.init();
                        }
                        nextQueries = this.state.queries.map(function (q) { return (tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, q, { edited: false })); });
                        this.setState({
                            datasource: datasource,
                            datasourceError: datasourceError,
                            history: history,
                            supportsGraph: supportsGraph,
                            supportsLogs: supportsLogs,
                            supportsTable: supportsTable,
                            datasourceLoading: false,
                            queries: nextQueries,
                        }, function () { return datasourceError === null && _this.onSubmit(); });
                        return [2 /*return*/];
                }
            });
        });
    };
    Explore.prototype.onQuerySuccess = function (datasourceId, queries) {
        // save queries to history
        var history = this.state.history;
        var datasource = this.state.datasource;
        if (datasource.meta.id !== datasourceId) {
            // Navigated away, queries did not matter
            return;
        }
        var ts = Date.now();
        queries.forEach(function (q) {
            var query = q.query;
            history = [{ query: query, ts: ts }].concat(history);
        });
        if (history.length > MAX_HISTORY_ITEMS) {
            history = history.slice(0, MAX_HISTORY_ITEMS);
        }
        // Combine all queries of a datasource type into one history
        var historyKey = "grafana.explore.history." + datasourceId;
        app_core_store__WEBPACK_IMPORTED_MODULE_6__["default"].setObject(historyKey, history);
        this.setState({ history: history });
    };
    Explore.prototype.buildQueryOptions = function (targetOptions) {
        var _a = this.state, datasource = _a.datasource, queries = _a.queries, range = _a.range;
        var resolution = this.el.offsetWidth;
        var absoluteRange = {
            from: Object(app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_9__["parse"])(range.from, false),
            to: Object(app_core_utils_datemath__WEBPACK_IMPORTED_MODULE_9__["parse"])(range.to, true),
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
            var _a, datasource, queries, now, options, res, result, queryHints, latency, response_1, queryError;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.state, datasource = _a.datasource, queries = _a.queries;
                        if (!Object(_utils_query__WEBPACK_IMPORTED_MODULE_16__["hasQuery"])(queries)) {
                            return [2 /*return*/];
                        }
                        this.setState({ latency: 0, loading: true, graphResult: null, queryErrors: [], queryHints: [] });
                        now = Date.now();
                        options = this.buildQueryOptions({ format: 'time_series', instant: false, hinting: true });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, datasource.query(options)];
                    case 2:
                        res = _b.sent();
                        result = makeTimeSeriesList(res.data, options);
                        queryHints = res.hints ? makeHints(res.hints) : [];
                        latency = Date.now() - now;
                        this.setState({ latency: latency, loading: false, graphResult: result, queryHints: queryHints, requestOptions: options });
                        this.onQuerySuccess(datasource.meta.id, queries);
                        return [3 /*break*/, 4];
                    case 3:
                        response_1 = _b.sent();
                        console.error(response_1);
                        queryError = response_1.data ? response_1.data.error : response_1;
                        this.setState({ loading: false, queryErrors: [queryError] });
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
                        if (!Object(_utils_query__WEBPACK_IMPORTED_MODULE_16__["hasQuery"])(queries)) {
                            return [2 /*return*/];
                        }
                        this.setState({ latency: 0, loading: true, queryErrors: [], queryHints: [], tableResult: null });
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
                        this.onQuerySuccess(datasource.meta.id, queries);
                        return [3 /*break*/, 4];
                    case 3:
                        response_2 = _b.sent();
                        console.error(response_2);
                        queryError = response_2.data ? response_2.data.error : response_2;
                        this.setState({ loading: false, queryErrors: [queryError] });
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
                        if (!Object(_utils_query__WEBPACK_IMPORTED_MODULE_16__["hasQuery"])(queries)) {
                            return [2 /*return*/];
                        }
                        this.setState({ latency: 0, loading: true, queryErrors: [], queryHints: [], logsResult: null });
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
                        this.onQuerySuccess(datasource.meta.id, queries);
                        return [3 /*break*/, 4];
                    case 3:
                        response_3 = _b.sent();
                        console.error(response_3);
                        queryError = response_3.data ? response_3.data.error : response_3;
                        this.setState({ loading: false, queryErrors: [queryError] });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Explore.prototype.render = function () {
        var _a = this.props, datasourceSrv = _a.datasourceSrv, position = _a.position, split = _a.split;
        var _b = this.state, datasource = _b.datasource, datasourceError = _b.datasourceError, datasourceLoading = _b.datasourceLoading, datasourceMissing = _b.datasourceMissing, graphResult = _b.graphResult, history = _b.history, latency = _b.latency, loading = _b.loading, logsResult = _b.logsResult, queries = _b.queries, queryErrors = _b.queryErrors, queryHints = _b.queryHints, range = _b.range, requestOptions = _b.requestOptions, showingGraph = _b.showingGraph, showingLogs = _b.showingLogs, showingTable = _b.showingTable, supportsGraph = _b.supportsGraph, supportsLogs = _b.supportsLogs, supportsTable = _b.supportsTable, tableResult = _b.tableResult;
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
                        "\u63A2\u7D22"))) : (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "navbar-buttons explore-first-button" },
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("button", { className: "btn navbar-button", onClick: this.onClickCloseSplit }, "\u5173\u95ED\u5206\u9694"))),
                !datasourceMissing ? (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "navbar-buttons" },
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react_select__WEBPACK_IMPORTED_MODULE_3__["default"], { className: "datasource-picker", clearable: false, onChange: this.onChangeDatasource, options: datasources, placeholder: "\u52A0\u8F7D\u6570\u636E\u6E90...", value: selectedDatasource }))) : null,
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "navbar__spacer" }),
                position === 'left' && !split ? (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "navbar-buttons" },
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("button", { className: "btn navbar-button", onClick: this.onClickSplit }, "\u5206\u9694"))) : null,
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_TimePicker__WEBPACK_IMPORTED_MODULE_15__["default"], { range: range, onChangeTime: this.onChangeTime }),
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "navbar-buttons" },
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("button", { className: "btn navbar-button navbar-button--no-icon", onClick: this.onClickClear }, "\u6E05\u9664\u6240\u6709")),
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "navbar-buttons relative" },
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("button", { className: "btn navbar-button--primary", onClick: this.onSubmit },
                        "\u6267\u884C\u67E5\u8BE2 ",
                        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("i", { className: "fa fa-level-down run-icon" })),
                    loading || latency ? react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_ElapsedTime__WEBPACK_IMPORTED_MODULE_10__["default"], { time: latency, className: "text-info" }) : null)),
            datasourceLoading ? react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "explore-container" }, "\u52A0\u8F7D\u6570\u636E\u6E90...") : null,
            datasourceMissing ? (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "explore-container" }, "\u8BF7\u6DFB\u52A0\u4E00\u4E2A\u6570\u636E\u6E90\u4EE5\u4F9B\u66F4\u591A\u64CD\u4F5C (\u4F8B\u5982, Prometheus\u6570\u636E\u6E90).")) : null,
            datasourceError ? (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "explore-container" },
                "\u8FDE\u63A5\u6570\u636E\u6E90\u51FA\u9519. [",
                datasourceError,
                "]")) : null,
            datasource && !datasourceError ? (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "explore-container" },
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_QueryRows__WEBPACK_IMPORTED_MODULE_11__["default"], { history: history, queries: queries, queryErrors: queryErrors, queryHints: queryHints, request: this.request, onAddQueryRow: this.onAddQueryRow, onChangeQuery: this.onChangeQuery, onClickHintFix: this.onModifyQueries, onExecuteQuery: this.onSubmit, onRemoveQueryRow: this.onRemoveQueryRow }),
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "result-options" },
                    supportsGraph ? (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("button", { className: "btn navbar-button " + graphButtonActive, onClick: this.onClickGraphButton }, "\u56FE\u5F62")) : null,
                    supportsTable ? (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("button", { className: "btn navbar-button " + tableButtonActive, onClick: this.onClickTableButton }, "\u8868\u683C")) : null,
                    supportsLogs ? (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("button", { className: "btn navbar-button " + logsButtonActive, onClick: this.onClickLogsButton }, "\u65E5\u5FD7")) : null),
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("main", { className: "m-t-2" },
                    supportsGraph && showingGraph ? (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_Graph__WEBPACK_IMPORTED_MODULE_12__["default"], { data: graphResult, height: graphHeight, loading: loading, id: "explore-graph-" + position, options: requestOptions, split: split })) : null,
                    supportsTable && showingTable ? (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_Table__WEBPACK_IMPORTED_MODULE_14__["default"], { className: "m-t-3", data: tableResult, loading: loading, onClickCell: this.onClickTableCell })) : null,
                    supportsLogs && showingLogs ? react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_Logs__WEBPACK_IMPORTED_MODULE_13__["default"], { data: logsResult, loading: loading }) : null))) : null));
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
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js-exposed");
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
        var $el = jquery__WEBPACK_IMPORTED_MODULE_1___default()("#" + this.props.id);
        if (!data) {
            $el.empty();
            return;
        }
        var series = data.map(function (ts) { return ({
            color: ts.color,
            label: ts.label,
            data: ts.getFlotPairs('null'),
        }); });
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
        var _a = this.props, data = _a.data, height = _a.height, loading = _a.loading;
        if (!loading && data && data.length === 0) {
            return (react__WEBPACK_IMPORTED_MODULE_2___default.a.createElement("div", { className: "panel-container" },
                react__WEBPACK_IMPORTED_MODULE_2___default.a.createElement("div", { className: "muted m-a-1" }, "The queries returned no time series to graph.")));
        }
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
/*! exports provided: RECORDING_RULES_GROUP, wrapLabel, setFunctionMove, addHistoryMetadata, groupMetricsByPrefix, willApplySuggestion, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RECORDING_RULES_GROUP", function() { return RECORDING_RULES_GROUP; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "wrapLabel", function() { return wrapLabel; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setFunctionMove", function() { return setFunctionMove; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addHistoryMetadata", function() { return addHistoryMetadata; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "groupMetricsByPrefix", function() { return groupMetricsByPrefix; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "willApplySuggestion", function() { return willApplySuggestion; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! moment */ "./node_modules/moment/moment.js");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var rc_cascader__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rc-cascader */ "./node_modules/rc-cascader/es/index.js");
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utils/dom */ "./public/app/containers/Explore/utils/dom.ts");
/* harmony import */ var _slate_plugins_prism_index__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./slate-plugins/prism/index */ "./public/app/containers/Explore/slate-plugins/prism/index.tsx");
/* harmony import */ var _slate_plugins_prism_promql__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./slate-plugins/prism/promql */ "./public/app/containers/Explore/slate-plugins/prism/promql.ts");
/* harmony import */ var _slate_plugins_braces__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./slate-plugins/braces */ "./public/app/containers/Explore/slate-plugins/braces.ts");
/* harmony import */ var _slate_plugins_runner__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./slate-plugins/runner */ "./public/app/containers/Explore/slate-plugins/runner.ts");
/* harmony import */ var _utils_prometheus__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./utils/prometheus */ "./public/app/containers/Explore/utils/prometheus.ts");
/* harmony import */ var _QueryField__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./QueryField */ "./public/app/containers/Explore/QueryField.tsx");





// dom also includes Element polyfills







var DEFAULT_KEYS = ['job', 'instance'];
var EMPTY_SELECTOR = '{}';
var HISTOGRAM_GROUP = '__histograms__';
var HISTOGRAM_SELECTOR = '{le!=""}'; // Returns all timeseries for histograms
var HISTORY_ITEM_COUNT = 5;
var HISTORY_COUNT_CUTOFF = 1000 * 60 * 60 * 24; // 24h
var METRIC_MARK = 'metric';
var PRISM_LANGUAGE = 'promql';
var RECORDING_RULES_GROUP = '__recording_rules__';
var wrapLabel = function (label) { return ({ label: label }); };
var setFunctionMove = function (suggestion) {
    suggestion.move = -1;
    return suggestion;
};
function addHistoryMetadata(item, history) {
    var cutoffTs = Date.now() - HISTORY_COUNT_CUTOFF;
    var historyForItem = history.filter(function (h) { return h.ts > cutoffTs && h.query === item.label; });
    var count = historyForItem.length;
    var recent = historyForItem[0];
    var hint = "Queried " + count + " times in the last 24h.";
    if (recent) {
        var lastQueried = moment__WEBPACK_IMPORTED_MODULE_2___default()(recent.ts).fromNow();
        hint = hint + " Last queried " + lastQueried + ".";
    }
    return tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, item, { documentation: hint });
}
function groupMetricsByPrefix(metrics, delimiter) {
    if (delimiter === void 0) { delimiter = '_'; }
    // Filter out recording rules and insert as first option
    var ruleRegex = /:\w+:/;
    var ruleNames = metrics.filter(function (metric) { return ruleRegex.test(metric); });
    var rulesOption = {
        label: 'Recording rules',
        value: RECORDING_RULES_GROUP,
        children: ruleNames
            .slice()
            .sort()
            .map(function (name) { return ({ label: name, value: name }); }),
    };
    var options = ruleNames.length > 0 ? [rulesOption] : [];
    var metricsOptions = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.chain(metrics)
        .filter(function (metric) { return !ruleRegex.test(metric); })
        .groupBy(function (metric) { return metric.split(delimiter)[0]; })
        .map(function (metricsForPrefix, prefix) {
        var prefixIsMetric = metricsForPrefix.length === 1 && metricsForPrefix[0] === prefix;
        var children = prefixIsMetric ? [] : metricsForPrefix.sort().map(function (m) { return ({ label: m, value: m }); });
        return {
            children: children,
            label: prefix,
            value: prefix,
        };
    })
        .sortBy('label')
        .value();
    return options.concat(metricsOptions);
}
function willApplySuggestion(suggestion, _a) {
    var typeaheadContext = _a.typeaheadContext, typeaheadText = _a.typeaheadText;
    // Modify suggestion based on context
    switch (typeaheadContext) {
        case 'context-labels': {
            var nextChar = Object(_utils_dom__WEBPACK_IMPORTED_MODULE_5__["getNextCharacter"])();
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
            if (Object(_utils_dom__WEBPACK_IMPORTED_MODULE_5__["getNextCharacter"])() !== '"') {
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
        _this.onChangeMetrics = function (values, selectedOptions) {
            var query;
            if (selectedOptions.length === 1) {
                if (selectedOptions[0].children.length === 0) {
                    query = selectedOptions[0].value;
                }
                else {
                    // Ignore click on group
                    return;
                }
            }
            else {
                var prefix = selectedOptions[0].value;
                var metric = selectedOptions[1].value;
                if (prefix === HISTOGRAM_GROUP) {
                    query = "histogram_quantile(0.95, sum(rate(" + metric + "[5m])) by (le))";
                }
                else {
                    query = metric;
                }
            }
            _this.onChangeQuery(query, true);
        };
        _this.onChangeQuery = function (value, override) {
            // Send text change to parent
            var onQueryChange = _this.props.onQueryChange;
            if (onQueryChange) {
                onQueryChange(value, override);
            }
        };
        _this.onClickHintFix = function () {
            var _a = _this.props, hint = _a.hint, onClickHintFix = _a.onClickHintFix;
            if (onClickHintFix && hint && hint.fix) {
                onClickHintFix(hint.fix.action);
            }
        };
        _this.onReceiveMetrics = function () {
            if (!_this.state.metrics) {
                return;
            }
            Object(_slate_plugins_prism_index__WEBPACK_IMPORTED_MODULE_6__["setPrismTokens"])(PRISM_LANGUAGE, METRIC_MARK, _this.state.metrics);
        };
        _this.onTypeahead = function (typeahead) {
            var prefix = typeahead.prefix, text = typeahead.text, value = typeahead.value, wrapperNode = typeahead.wrapperNode;
            // Get DOM-dependent context
            var wrapperClasses = Array.from(wrapperNode.classList);
            var labelKeyNode = Object(_utils_dom__WEBPACK_IMPORTED_MODULE_5__["getPreviousCousin"])(wrapperNode, '.attr-name');
            var labelKey = labelKeyNode && labelKeyNode.textContent;
            var nextChar = Object(_utils_dom__WEBPACK_IMPORTED_MODULE_5__["getNextCharacter"])();
            var result = _this.getTypeahead({ text: text, value: value, prefix: prefix, wrapperClasses: wrapperClasses, labelKey: labelKey });
            console.log('handleTypeahead', wrapperClasses, text, prefix, nextChar, labelKey, result.context);
            return result;
        };
        _this.request = function (url) {
            if (_this.props.request) {
                return _this.props.request(url);
            }
            return fetch(url);
        };
        _this.plugins = [
            Object(_slate_plugins_braces__WEBPACK_IMPORTED_MODULE_8__["default"])(),
            Object(_slate_plugins_runner__WEBPACK_IMPORTED_MODULE_9__["default"])({ handler: props.onPressEnter }),
            Object(_slate_plugins_prism_index__WEBPACK_IMPORTED_MODULE_6__["default"])({ definition: _slate_plugins_prism_promql__WEBPACK_IMPORTED_MODULE_7__["default"], language: PRISM_LANGUAGE }),
        ];
        _this.state = {
            histogramMetrics: props.histogramMetrics || [],
            labelKeys: props.labelKeys || {},
            labelValues: props.labelValues || {},
            metrics: props.metrics || [],
            metricsByPrefix: props.metricsByPrefix || [],
        };
        return _this;
    }
    PromQueryField.prototype.componentDidMount = function () {
        this.fetchMetricNames();
        this.fetchHistogramMetrics();
    };
    // Keep this DOM-free for testing
    PromQueryField.prototype.getTypeahead = function (_a) {
        var prefix = _a.prefix, wrapperClasses = _a.wrapperClasses, text = _a.text;
        // Determine candidates by CSS context
        if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.includes(wrapperClasses, 'context-range')) {
            // Suggestions for metric[|]
            return this.getRangeTypeahead();
        }
        else if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.includes(wrapperClasses, 'context-labels')) {
            // Suggestions for metric{|} and metric{foo=|}, as well as metric-independent label queries like {|}
            return this.getLabelTypeahead.apply(this, arguments);
        }
        else if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.includes(wrapperClasses, 'context-aggregation')) {
            return this.getAggregationTypeahead.apply(this, arguments);
        }
        else if (
        // Non-empty but not inside known token
        (prefix && !lodash__WEBPACK_IMPORTED_MODULE_1___default.a.includes(wrapperClasses, 'token')) ||
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
        var history = this.props.history;
        var metrics = this.state.metrics;
        var suggestions = [];
        if (history && history.length > 0) {
            var historyItems = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.chain(history)
                .uniqBy('query')
                .take(HISTORY_ITEM_COUNT)
                .map(function (h) { return h.query; })
                .map(wrapLabel)
                .map(function (item) { return addHistoryMetadata(item, history); })
                .value();
            suggestions.push({
                prefixMatch: true,
                skipSort: true,
                label: 'History',
                items: historyItems,
            });
        }
        suggestions.push({
            prefixMatch: true,
            label: 'Functions',
            items: _slate_plugins_prism_promql__WEBPACK_IMPORTED_MODULE_7__["FUNCTIONS"].map(setFunctionMove),
        });
        if (metrics) {
            suggestions.push({
                label: 'Metrics',
                items: metrics.map(wrapLabel),
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
                    items: _utils_prometheus__WEBPACK_IMPORTED_MODULE_10__["RATE_RANGES"].slice().map(wrapLabel),
                },
            ],
        };
    };
    PromQueryField.prototype.getAggregationTypeahead = function (_a) {
        var value = _a.value;
        var refresher = null;
        var suggestions = [];
        // sum(foo{bar="1"}) by (|)
        var line = value.anchorBlock.getText();
        var cursorOffset = value.anchorOffset;
        // sum(foo{bar="1"}) by (
        var leftSide = line.slice(0, cursorOffset);
        var openParensAggregationIndex = leftSide.lastIndexOf('(');
        var openParensSelectorIndex = leftSide.slice(0, openParensAggregationIndex).lastIndexOf('(');
        var closeParensSelectorIndex = leftSide.slice(openParensSelectorIndex).indexOf(')') + openParensSelectorIndex;
        // foo{bar="1"}
        var selectorString = leftSide.slice(openParensSelectorIndex + 1, closeParensSelectorIndex);
        var selector = Object(_utils_prometheus__WEBPACK_IMPORTED_MODULE_10__["parseSelector"])(selectorString, selectorString.length - 2).selector;
        var labelKeys = this.state.labelKeys[selector];
        if (labelKeys) {
            suggestions.push({ label: 'Labels', items: labelKeys.map(wrapLabel) });
        }
        else {
            refresher = this.fetchSeriesLabels(selector);
        }
        return {
            refresher: refresher,
            suggestions: suggestions,
            context: 'context-aggregation',
        };
    };
    PromQueryField.prototype.getLabelTypeahead = function (_a) {
        var _this = this;
        var text = _a.text, wrapperClasses = _a.wrapperClasses, labelKey = _a.labelKey, value = _a.value;
        var context;
        var refresher = null;
        var suggestions = [];
        var line = value.anchorBlock.getText();
        var cursorOffset = value.anchorOffset;
        // Get normalized selector
        var selector;
        var parsedSelector;
        try {
            parsedSelector = Object(_utils_prometheus__WEBPACK_IMPORTED_MODULE_10__["parseSelector"])(line, cursorOffset);
            selector = parsedSelector.selector;
        }
        catch (_b) {
            selector = EMPTY_SELECTOR;
        }
        var containsMetric = selector.indexOf('__name__=') > -1;
        var existingKeys = parsedSelector ? parsedSelector.labelKeys : [];
        if ((text && text.startsWith('=')) || lodash__WEBPACK_IMPORTED_MODULE_1___default.a.includes(wrapperClasses, 'attr-value')) {
            // Label values
            if (labelKey && this.state.labelValues[selector] && this.state.labelValues[selector][labelKey]) {
                var labelValues = this.state.labelValues[selector][labelKey];
                context = 'context-label-values';
                suggestions.push({
                    label: "Label values for \"" + labelKey + "\"",
                    items: labelValues.map(wrapLabel),
                });
            }
        }
        else {
            // Label keys
            var labelKeys = this.state.labelKeys[selector] || (containsMetric ? null : DEFAULT_KEYS);
            if (labelKeys) {
                var possibleKeys = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.difference(labelKeys, existingKeys);
                if (possibleKeys.length > 0) {
                    context = 'context-labels';
                    suggestions.push({ label: "Labels", items: possibleKeys.map(wrapLabel) });
                }
            }
        }
        // Query labels for selector
        if (selector && !this.state.labelValues[selector]) {
            if (selector === EMPTY_SELECTOR) {
                // Query label values for default labels
                refresher = Promise.all(DEFAULT_KEYS.map(function (key) { return _this.fetchLabelValues(key); }));
            }
            else {
                refresher = this.fetchSeriesLabels(selector, !containsMetric);
            }
        }
        return { context: context, refresher: refresher, suggestions: suggestions };
    };
    PromQueryField.prototype.fetchHistogramMetrics = function () {
        var _this = this;
        this.fetchSeriesLabels(HISTOGRAM_SELECTOR, true, function () {
            var histogramSeries = _this.state.labelValues[HISTOGRAM_SELECTOR];
            if (histogramSeries && histogramSeries['__name__']) {
                var histogramMetrics = histogramSeries['__name__'].slice().sort();
                _this.setState({ histogramMetrics: histogramMetrics });
            }
        });
    };
    PromQueryField.prototype.fetchLabelValues = function (key) {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var _a, _b, url, res, body, exisingValues, values, labelValues, e_1;
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
                        exisingValues = this.state.labelValues[EMPTY_SELECTOR];
                        values = tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, exisingValues, (_a = {}, _a[key] = body.data, _a));
                        labelValues = tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, this.state.labelValues, (_b = {}, _b[EMPTY_SELECTOR] = values, _b));
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
    PromQueryField.prototype.fetchSeriesLabels = function (name, withName, callback) {
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
                        _c = Object(_utils_prometheus__WEBPACK_IMPORTED_MODULE_10__["processLabels"])(body.data, withName), keys = _c.keys, values = _c.values;
                        labelKeys = tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, this.state.labelKeys, (_a = {}, _a[name] = keys, _a));
                        labelValues = tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, this.state.labelValues, (_b = {}, _b[name] = values, _b));
                        this.setState({ labelKeys: labelKeys, labelValues: labelValues }, callback);
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
            var url, res, body, metrics, metricsByPrefix, error_1;
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
                        metrics = body.data;
                        metricsByPrefix = groupMetricsByPrefix(metrics);
                        this.setState({ metrics: metrics, metricsByPrefix: metricsByPrefix }, this.onReceiveMetrics);
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
        var _a = this.props, error = _a.error, hint = _a.hint;
        var _b = this.state, histogramMetrics = _b.histogramMetrics, metricsByPrefix = _b.metricsByPrefix;
        var histogramOptions = histogramMetrics.map(function (hm) { return ({ label: hm, value: hm }); });
        var metricsOptions = [
            { label: 'Histograms', value: HISTOGRAM_GROUP, children: histogramOptions }
        ].concat(metricsByPrefix);
        return (react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement("div", { className: "prom-query-field" },
            react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement("div", { className: "prom-query-field-tools" },
                react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement(rc_cascader__WEBPACK_IMPORTED_MODULE_4__["default"], { options: metricsOptions, onChange: this.onChangeMetrics },
                    react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement("button", { className: "btn navbar-button navbar-button--tight" }, "Metrics"))),
            react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement("div", { className: "prom-query-field-wrapper" },
                react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement("div", { className: "slate-query-field-wrapper" },
                    react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement(_QueryField__WEBPACK_IMPORTED_MODULE_11__["default"], { additionalPlugins: this.plugins, cleanText: _utils_prometheus__WEBPACK_IMPORTED_MODULE_10__["cleanText"], initialValue: this.props.initialQuery, onTypeahead: this.onTypeahead, onWillApplySuggestion: willApplySuggestion, onValueChanged: this.onChangeQuery, placeholder: "\u8F93\u5165\u4E00\u6761 PromQL \u67E5\u8BE2" })),
                error ? react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement("div", { className: "prom-query-field-info text-error" }, error) : null,
                hint ? (react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement("div", { className: "prom-query-field-info text-warning" },
                    hint.label,
                    ' ',
                    hint.fix ? (react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement("a", { className: "text-link muted", onClick: this.onClickHintFix }, hint.fix.label)) : null)) : null)));
    };
    return PromQueryField;
}(react__WEBPACK_IMPORTED_MODULE_3___default.a.Component));
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
/* harmony import */ var _slate_plugins_clear__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./slate-plugins/clear */ "./public/app/containers/Explore/slate-plugins/clear.ts");
/* harmony import */ var _slate_plugins_newline__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./slate-plugins/newline */ "./public/app/containers/Explore/slate-plugins/newline.ts");
/* harmony import */ var _Typeahead__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Typeahead */ "./public/app/containers/Explore/Typeahead.tsx");










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
            var selection, _a, cleanText, onTypeahead, value, wrapperNode, editorNode, range, offset, text, prefix_1, _b, suggestions, context, refresher_1, filteredSuggestions;
            var _this = this;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_c) {
                selection = window.getSelection();
                _a = this.props, cleanText = _a.cleanText, onTypeahead = _a.onTypeahead;
                value = this.state.value;
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
                        value: value,
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
                            if (!group.skipSort) {
                                group.items = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.sortBy(group.items, function (item) { return item.sortText || item.label; });
                            }
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
                case 'Enter':
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
                react__WEBPACK_IMPORTED_MODULE_2___default.a.createElement(_Typeahead__WEBPACK_IMPORTED_MODULE_9__["default"], { menuRef: _this.menuRef, selectedItem: selectedItem, onClickItem: _this.onClickMenu, groupedItems: suggestions })));
        };
        // Base plugins
        _this.plugins = [Object(_slate_plugins_clear__WEBPACK_IMPORTED_MODULE_7__["default"])(), Object(_slate_plugins_newline__WEBPACK_IMPORTED_MODULE_8__["default"])()].concat(props.additionalPlugins);
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


// TODO make this datasource-plugin-dependent

var QueryRow = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](QueryRow, _super);
    function QueryRow() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onChangeQuery = function (value, override) {
            var _a = _this.props, index = _a.index, onChangeQuery = _a.onChangeQuery;
            if (onChangeQuery) {
                onChangeQuery(value, index, override);
            }
        };
        _this.onClickAddButton = function () {
            var _a = _this.props, index = _a.index, onAddQueryRow = _a.onAddQueryRow;
            if (onAddQueryRow) {
                onAddQueryRow(index);
            }
        };
        _this.onClickClearButton = function () {
            _this.onChangeQuery('', true);
        };
        _this.onClickHintFix = function (action) {
            var _a = _this.props, index = _a.index, onClickHintFix = _a.onClickHintFix;
            if (onClickHintFix) {
                onClickHintFix(action, index);
            }
        };
        _this.onClickRemoveButton = function () {
            var _a = _this.props, index = _a.index, onRemoveQueryRow = _a.onRemoveQueryRow;
            if (onRemoveQueryRow) {
                onRemoveQueryRow(index);
            }
        };
        _this.onPressEnter = function () {
            var onExecuteQuery = _this.props.onExecuteQuery;
            if (onExecuteQuery) {
                onExecuteQuery();
            }
        };
        return _this;
    }
    QueryRow.prototype.render = function () {
        var _a = this.props, edited = _a.edited, history = _a.history, query = _a.query, queryError = _a.queryError, queryHint = _a.queryHint, request = _a.request;
        return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "query-row" },
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "query-row-field" },
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_PromQueryField__WEBPACK_IMPORTED_MODULE_2__["default"], { error: queryError, hint: queryHint, initialQuery: edited ? null : query, history: history, portalPrefix: "explore", onClickHintFix: this.onClickHintFix, onPressEnter: this.onPressEnter, onQueryChange: this.onChangeQuery, request: request })),
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "query-row-tools" },
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("button", { className: "btn navbar-button navbar-button--tight", onClick: this.onClickClearButton },
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("i", { className: "fa fa-times" })),
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("button", { className: "btn navbar-button navbar-button--tight", onClick: this.onClickAddButton },
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("i", { className: "fa fa-plus" })),
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("button", { className: "btn navbar-button navbar-button--tight", onClick: this.onClickRemoveButton },
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("i", { className: "fa fa-minus" })))));
    };
    return QueryRow;
}(react__WEBPACK_IMPORTED_MODULE_1__["PureComponent"]));
var QueryRows = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](QueryRows, _super);
    function QueryRows() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    QueryRows.prototype.render = function () {
        var _a = this.props, _b = _a.className, className = _b === void 0 ? '' : _b, queries = _a.queries, _c = _a.queryErrors, queryErrors = _c === void 0 ? [] : _c, _d = _a.queryHints, queryHints = _d === void 0 ? [] : _d, handlers = tslib__WEBPACK_IMPORTED_MODULE_0__["__rest"](_a, ["className", "queries", "queryErrors", "queryHints"]);
        return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: className }, queries.map(function (q, index) { return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(QueryRow, tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({ key: q.key, index: index, query: q.query, queryError: queryErrors[index], queryHint: queryHints[index], edited: q.edited }, handlers))); })));
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
/* harmony import */ var app_core_table_model__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! app/core/table_model */ "./public/app/core/table_model.ts");



var EMPTY_TABLE = new app_core_table_model__WEBPACK_IMPORTED_MODULE_2__["default"]();
function Cell(props) {
    var columnIndex = props.columnIndex, rowIndex = props.rowIndex, table = props.table, value = props.value, onClickCell = props.onClickCell;
    var column = table.columns[columnIndex];
    if (column && column.filterable && onClickCell) {
        var onClick = function (event) {
            event.preventDefault();
            onClickCell(column.text, value, columnIndex, rowIndex, table);
        };
        return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("td", null,
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("a", { className: "link", onClick: onClick }, value)));
    }
    return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("td", null, value);
}
var Table = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](Table, _super);
    function Table() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Table.prototype.render = function () {
        var _a = this.props, _b = _a.className, className = _b === void 0 ? '' : _b, data = _a.data, loading = _a.loading, onClickCell = _a.onClickCell;
        var tableModel = data || EMPTY_TABLE;
        if (!loading && data && data.rows.length === 0) {
            return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("table", { className: className + " filter-table" },
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("thead", null,
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("tr", null,
                        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("th", null, "Table"))),
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("tbody", null,
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("tr", null,
                        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("td", { className: "muted" }, "The queries returned no data for a table.")))));
        }
        return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("table", { className: className + " filter-table" },
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("thead", null,
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("tr", null, tableModel.columns.map(function (col) { return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("th", { key: col.text }, col.text); }))),
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("tbody", null, tableModel.rows.map(function (row, i) { return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("tr", { key: i }, row.map(function (value, j) { return (react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(Cell, { key: j, columnIndex: j, rowIndex: i, value: String(value), table: data, onClickCell: onClickCell })); }))); }))));
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
        var epoch = parseInt(value, 10);
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
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("label", { className: "small" }, "\u81EA:"),
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "gf-form-inline" },
                    react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", { className: "gf-form max-width-28" },
                        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("input", { type: "text", className: "gf-form-input input-large timepicker-from", value: fromRaw, onChange: this.handleChangeFrom }))),
                react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("label", { className: "small" }, "\u81F3:"),
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
                        "\u00A0 \u5237\u65B0\u95F4\u9694 ",
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
var NON_SELECTOR_SPACE_REGEXP = / (?![^}]+})/;
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
                    var delimiterIndex = text.slice(offset).search(NON_SELECTOR_SPACE_REGEXP);
                    var length = delimiterIndex > -1 ? delimiterIndex + offset : text.length;
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
            el = el.parentElement;
        } while (i < 0 && el);
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
/*! exports provided: RATE_RANGES, processLabels, cleanText, parseSelector */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RATE_RANGES", function() { return RATE_RANGES; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "processLabels", function() { return processLabels; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cleanText", function() { return cleanText; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseSelector", function() { return parseSelector; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");

var RATE_RANGES = ['1m', '5m', '10m', '30m', '1h'];
function processLabels(labels, withName) {
    if (withName === void 0) { withName = false; }
    var values = {};
    labels.forEach(function (l) {
        var __name__ = l.__name__, rest = tslib__WEBPACK_IMPORTED_MODULE_0__["__rest"](l, ["__name__"]);
        if (withName) {
            values['__name__'] = values['__name__'] || [];
            if (values['__name__'].indexOf(__name__) === -1) {
                values['__name__'].push(__name__);
            }
        }
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
// const cleanSelectorRegexp = /\{(\w+="[^"\n]*?")(,\w+="[^"\n]*?")*\}/;
var selectorRegexp = /\{[^}]*?\}/;
var labelRegexp = /\b\w+="[^"\n]*?"/g;
function parseSelector(query, cursorOffset) {
    if (cursorOffset === void 0) { cursorOffset = 1; }
    if (!query.match(selectorRegexp)) {
        // Special matcher for metrics
        if (query.match(/^\w+$/)) {
            return {
                selector: "{__name__=\"" + query + "\"}",
                labelKeys: ['__name__'],
            };
        }
        throw new Error('Query must contain a selector: ' + query);
    }
    // Check if inside a selector
    var prefix = query.slice(0, cursorOffset);
    var prefixOpen = prefix.lastIndexOf('{');
    var prefixClose = prefix.lastIndexOf('}');
    if (prefixOpen === -1) {
        throw new Error('Not inside selector, missing open brace: ' + prefix);
    }
    if (prefixClose > -1 && prefixClose > prefixOpen) {
        throw new Error('Not inside selector, previous selector already closed: ' + prefix);
    }
    var suffix = query.slice(cursorOffset);
    var suffixCloseIndex = suffix.indexOf('}');
    var suffixClose = suffixCloseIndex + cursorOffset;
    var suffixOpenIndex = suffix.indexOf('{');
    var suffixOpen = suffixOpenIndex + cursorOffset;
    if (suffixClose === -1) {
        throw new Error('Not inside selector, missing closing brace in suffix: ' + suffix);
    }
    if (suffixOpenIndex > -1 && suffixOpen < suffixClose) {
        throw new Error('Not inside selector, next selector opens before this one closed: ' + suffix);
    }
    // Extract clean labels to form clean selector, incomplete labels are dropped
    var selector = query.slice(prefixOpen, suffixClose);
    var labels = {};
    selector.replace(labelRegexp, function (match) {
        var delimiterIndex = match.indexOf('=');
        var key = match.slice(0, delimiterIndex);
        var value = match.slice(delimiterIndex + 1, match.length);
        labels[key] = value;
        return '';
    });
    // Add metric if there is one before the selector
    var metricPrefix = query.slice(0, prefixOpen);
    var metricMatch = metricPrefix.match(/\w+$/);
    if (metricMatch) {
        labels['__name__'] = "\"" + metricMatch[0] + "\"";
    }
    // Build sorted selector
    var labelKeys = Object.keys(labels).sort();
    var cleanSelector = labelKeys.map(function (key) { return key + "=" + labels[key]; }).join(',');
    var selectorString = ['{', cleanSelector, '}'].join('');
    return { labelKeys: labelKeys, selector: selectorString };
}


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
//# sourceMappingURL=explore.b07147e0e5eff8a22d68.js.map