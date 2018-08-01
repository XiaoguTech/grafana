webpackHotUpdate("explore",{

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


/***/ })

})
//# sourceMappingURL=explore.6b4e578487905110ad7c.hot-update.js.map