(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[1],{

/***/ "./node_modules/debug/src/browser.js":
/*!*******************************************!*\
  !*** ./node_modules/debug/src/browser.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(/*! ./debug */ "./node_modules/debug/src/debug.js");
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = Object({"NODE_ENV":"development"}).DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/debug/src/debug.js":
/*!*****************************************!*\
  !*** ./node_modules/debug/src/debug.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = __webpack_require__(/*! ms */ "./node_modules/ms/index.js");

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}


/***/ }),

/***/ "./node_modules/direction/index.js":
/*!*****************************************!*\
  !*** ./node_modules/direction/index.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var GROUP_LEFT_TO_RIGHT,
    GROUP_RIGHT_TO_LEFT,
    EXPRESSION_LEFT_TO_RIGHT,
    EXPRESSION_RIGHT_TO_LEFT;

/*
 * Character ranges of left-to-right characters.
 */

GROUP_LEFT_TO_RIGHT = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6' +
    '\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF\u200E\u2C00-\uFB1C' +
    '\uFE00-\uFE6F\uFEFD-\uFFFF';

/*
 * Character ranges of right-to-left characters.
 */

GROUP_RIGHT_TO_LEFT = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC';

/*
 * Expression to match a left-to-right string.
 *
 * Matches the start of a string, followed by zero or
 * more non-right-to-left characters, followed by a
 * left-to-right character.
 */

EXPRESSION_LEFT_TO_RIGHT = new RegExp(
    '^[^' + GROUP_RIGHT_TO_LEFT + ']*[' + GROUP_LEFT_TO_RIGHT + ']'
);

/*
 * Expression to match a right-to-left string.
 *
 * Matches the start of a string, followed by zero or
 * more non-left-to-right characters, followed by a
 * right-to-left character.
 */

EXPRESSION_RIGHT_TO_LEFT = new RegExp(
    '^[^' + GROUP_LEFT_TO_RIGHT + ']*[' + GROUP_RIGHT_TO_LEFT + ']'
);

/**
 * Detect the direction of text.
 *
 * @param {string} value - value to stringify and check.
 * @return {string} - One of `"rtl"`, `"ltr"`, or
 *   `"neutral"`.
 */
function direction(value) {
    value = value.toString();

    if (EXPRESSION_RIGHT_TO_LEFT.test(value)) {
        return 'rtl';
    }

    if (EXPRESSION_LEFT_TO_RIGHT.test(value)) {
        return 'ltr';
    }

    return 'neutral';
}

/*
 * Expose `direction`.
 */

module.exports = direction;


/***/ }),

/***/ "./node_modules/esrever/esrever.js":
/*!*****************************************!*\
  !*** ./node_modules/esrever/esrever.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module, global) {var __WEBPACK_AMD_DEFINE_RESULT__;/*! https://mths.be/esrever v0.2.0 by @mathias */
;(function(root) {

	// Detect free variables `exports`
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code,
	// and use it as `root`
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var regexSymbolWithCombiningMarks = /([\0-\u02FF\u0370-\u1AAF\u1B00-\u1DBF\u1E00-\u20CF\u2100-\uD7FF\uE000-\uFE1F\uFE30-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])([\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]+)/g;
	var regexSurrogatePair = /([\uD800-\uDBFF])([\uDC00-\uDFFF])/g;

	var reverse = function(string) {
		// Step 1: deal with combining marks and astral symbols (surrogate pairs)
		string = string
			// Swap symbols with their combining marks so the combining marks go first
			.replace(regexSymbolWithCombiningMarks, function($0, $1, $2) {
				// Reverse the combining marks so they will end up in the same order
				// later on (after another round of reversing)
				return reverse($2) + $1;
			})
			// Swap high and low surrogates so the low surrogates go first
			.replace(regexSurrogatePair, '$2$1');
		// Step 2: reverse the code units in the string
		var result = '';
		var index = string.length;
		while (index--) {
			result += string.charAt(index);
		}
		return result;
	};

	/*--------------------------------------------------------------------------*/

	var esrever = {
		'version': '0.2.0',
		'reverse': reverse
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		true
	) {
		!(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
			return esrever;
		}).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}	else { var key; }

}(this));

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module), __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/get-document/index.js":
/*!********************************************!*\
  !*** ./node_modules/get-document/index.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {


/**
 * Module exports.
 */

module.exports = getDocument;

// defined by w3c
var DOCUMENT_NODE = 9;

/**
 * Returns `true` if `w` is a Document object, or `false` otherwise.
 *
 * @param {?} d - Document object, maybe
 * @return {Boolean}
 * @private
 */

function isDocument (d) {
  return d && d.nodeType === DOCUMENT_NODE;
}

/**
 * Returns the `document` object associated with the given `node`, which may be
 * a DOM element, the Window object, a Selection, a Range. Basically any DOM
 * object that references the Document in some way, this function will find it.
 *
 * @param {Mixed} node - DOM node, selection, or range in which to find the `document` object
 * @return {Document} the `document` object associated with `node`
 * @public
 */

function getDocument(node) {
  if (isDocument(node)) {
    return node;

  } else if (isDocument(node.ownerDocument)) {
    return node.ownerDocument;

  } else if (isDocument(node.document)) {
    return node.document;

  } else if (node.parentNode) {
    return getDocument(node.parentNode);

  // Range support
  } else if (node.commonAncestorContainer) {
    return getDocument(node.commonAncestorContainer);

  } else if (node.startContainer) {
    return getDocument(node.startContainer);

  // Selection support
  } else if (node.anchorNode) {
    return getDocument(node.anchorNode);
  }
}


/***/ }),

/***/ "./node_modules/get-window/index.js":
/*!******************************************!*\
  !*** ./node_modules/get-window/index.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


/**
 * Module dependencies.
 */

var getDocument = __webpack_require__(/*! get-document */ "./node_modules/get-document/index.js");

/**
 * Module exports.
 */

module.exports = getWindow;

var needsIEFallback = __webpack_require__(/*! ./needs-ie-fallback */ "./node_modules/get-window/needs-ie-fallback.br.js");

/**
 * Returns `true` if `w` is a Window object, or `false` otherwise.
 *
 * @param {Mixed} w - Window object, maybe
 * @return {Boolean}
 * @private
 */

function isWindow (w) {
  return w && w.window === w;
}

/**
 * Returns the `window` object associated with the given `node`, which may be
 * a DOM element, the Window object, a Selection, a Range. Basically any DOM
 * object that references the Window in some way, this function will find it.
 *
 * @param {Mixed} node - DOM node, selection, or range in which to find the `window` object
 * @return {Window} the `window` object associated with `node`
 * @public
 */

function getWindow(node) {
  if (isWindow(node)) {
    return node;
  }

  var doc = getDocument(node);

  if (needsIEFallback) {
    // In IE 6-8, only the variable 'window' can be used to connect events (others
    // may be only copies).
    doc.parentWindow.execScript('document._parentWindow = window;', 'Javascript');
    var win = doc._parentWindow;
    // to prevent memory leak, unset it after use
    // another possibility is to add an onUnload handler,
    // (which seems overkill to @liucougar)
    doc._parentWindow = null;
    return win;
  } else {
    // standards-compliant and newer IE
    return doc.defaultView || doc.parentWindow;
  }
}


/***/ }),

/***/ "./node_modules/get-window/needs-ie-fallback.br.js":
/*!*********************************************************!*\
  !*** ./node_modules/get-window/needs-ie-fallback.br.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// this is a browser-only module. There is a non-browser equivalent in the same
// directory. This is done using a `package.json` browser field.
// old-IE fallback logic: http://stackoverflow.com/a/10260692
module.exports =  !!document.attachEvent && window !== document.parentWindow;


/***/ }),

/***/ "./node_modules/immutable/dist/immutable.js":
/*!**************************************************!*\
  !*** ./node_modules/immutable/dist/immutable.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

(function (global, factory) {
   true ? module.exports = factory() :
  undefined;
}(this, function () { 'use strict';var SLICE$0 = Array.prototype.slice;

  function createClass(ctor, superClass) {
    if (superClass) {
      ctor.prototype = Object.create(superClass.prototype);
    }
    ctor.prototype.constructor = ctor;
  }

  function Iterable(value) {
      return isIterable(value) ? value : Seq(value);
    }


  createClass(KeyedIterable, Iterable);
    function KeyedIterable(value) {
      return isKeyed(value) ? value : KeyedSeq(value);
    }


  createClass(IndexedIterable, Iterable);
    function IndexedIterable(value) {
      return isIndexed(value) ? value : IndexedSeq(value);
    }


  createClass(SetIterable, Iterable);
    function SetIterable(value) {
      return isIterable(value) && !isAssociative(value) ? value : SetSeq(value);
    }



  function isIterable(maybeIterable) {
    return !!(maybeIterable && maybeIterable[IS_ITERABLE_SENTINEL]);
  }

  function isKeyed(maybeKeyed) {
    return !!(maybeKeyed && maybeKeyed[IS_KEYED_SENTINEL]);
  }

  function isIndexed(maybeIndexed) {
    return !!(maybeIndexed && maybeIndexed[IS_INDEXED_SENTINEL]);
  }

  function isAssociative(maybeAssociative) {
    return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
  }

  function isOrdered(maybeOrdered) {
    return !!(maybeOrdered && maybeOrdered[IS_ORDERED_SENTINEL]);
  }

  Iterable.isIterable = isIterable;
  Iterable.isKeyed = isKeyed;
  Iterable.isIndexed = isIndexed;
  Iterable.isAssociative = isAssociative;
  Iterable.isOrdered = isOrdered;

  Iterable.Keyed = KeyedIterable;
  Iterable.Indexed = IndexedIterable;
  Iterable.Set = SetIterable;


  var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
  var IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
  var IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@';
  var IS_ORDERED_SENTINEL = '@@__IMMUTABLE_ORDERED__@@';

  // Used for setting prototype methods that IE8 chokes on.
  var DELETE = 'delete';

  // Constants describing the size of trie nodes.
  var SHIFT = 5; // Resulted in best performance after ______?
  var SIZE = 1 << SHIFT;
  var MASK = SIZE - 1;

  // A consistent shared value representing "not set" which equals nothing other
  // than itself, and nothing that could be provided externally.
  var NOT_SET = {};

  // Boolean references, Rough equivalent of `bool &`.
  var CHANGE_LENGTH = { value: false };
  var DID_ALTER = { value: false };

  function MakeRef(ref) {
    ref.value = false;
    return ref;
  }

  function SetRef(ref) {
    ref && (ref.value = true);
  }

  // A function which returns a value representing an "owner" for transient writes
  // to tries. The return value will only ever equal itself, and will not equal
  // the return of any subsequent call of this function.
  function OwnerID() {}

  // http://jsperf.com/copy-array-inline
  function arrCopy(arr, offset) {
    offset = offset || 0;
    var len = Math.max(0, arr.length - offset);
    var newArr = new Array(len);
    for (var ii = 0; ii < len; ii++) {
      newArr[ii] = arr[ii + offset];
    }
    return newArr;
  }

  function ensureSize(iter) {
    if (iter.size === undefined) {
      iter.size = iter.__iterate(returnTrue);
    }
    return iter.size;
  }

  function wrapIndex(iter, index) {
    // This implements "is array index" which the ECMAString spec defines as:
    //
    //     A String property name P is an array index if and only if
    //     ToString(ToUint32(P)) is equal to P and ToUint32(P) is not equal
    //     to 2^32−1.
    //
    // http://www.ecma-international.org/ecma-262/6.0/#sec-array-exotic-objects
    if (typeof index !== 'number') {
      var uint32Index = index >>> 0; // N >>> 0 is shorthand for ToUint32
      if ('' + uint32Index !== index || uint32Index === 4294967295) {
        return NaN;
      }
      index = uint32Index;
    }
    return index < 0 ? ensureSize(iter) + index : index;
  }

  function returnTrue() {
    return true;
  }

  function wholeSlice(begin, end, size) {
    return (begin === 0 || (size !== undefined && begin <= -size)) &&
      (end === undefined || (size !== undefined && end >= size));
  }

  function resolveBegin(begin, size) {
    return resolveIndex(begin, size, 0);
  }

  function resolveEnd(end, size) {
    return resolveIndex(end, size, size);
  }

  function resolveIndex(index, size, defaultIndex) {
    return index === undefined ?
      defaultIndex :
      index < 0 ?
        Math.max(0, size + index) :
        size === undefined ?
          index :
          Math.min(size, index);
  }

  /* global Symbol */

  var ITERATE_KEYS = 0;
  var ITERATE_VALUES = 1;
  var ITERATE_ENTRIES = 2;

  var REAL_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator';

  var ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;


  function Iterator(next) {
      this.next = next;
    }

    Iterator.prototype.toString = function() {
      return '[Iterator]';
    };


  Iterator.KEYS = ITERATE_KEYS;
  Iterator.VALUES = ITERATE_VALUES;
  Iterator.ENTRIES = ITERATE_ENTRIES;

  Iterator.prototype.inspect =
  Iterator.prototype.toSource = function () { return this.toString(); }
  Iterator.prototype[ITERATOR_SYMBOL] = function () {
    return this;
  };


  function iteratorValue(type, k, v, iteratorResult) {
    var value = type === 0 ? k : type === 1 ? v : [k, v];
    iteratorResult ? (iteratorResult.value = value) : (iteratorResult = {
      value: value, done: false
    });
    return iteratorResult;
  }

  function iteratorDone() {
    return { value: undefined, done: true };
  }

  function hasIterator(maybeIterable) {
    return !!getIteratorFn(maybeIterable);
  }

  function isIterator(maybeIterator) {
    return maybeIterator && typeof maybeIterator.next === 'function';
  }

  function getIterator(iterable) {
    var iteratorFn = getIteratorFn(iterable);
    return iteratorFn && iteratorFn.call(iterable);
  }

  function getIteratorFn(iterable) {
    var iteratorFn = iterable && (
      (REAL_ITERATOR_SYMBOL && iterable[REAL_ITERATOR_SYMBOL]) ||
      iterable[FAUX_ITERATOR_SYMBOL]
    );
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  function isArrayLike(value) {
    return value && typeof value.length === 'number';
  }

  createClass(Seq, Iterable);
    function Seq(value) {
      return value === null || value === undefined ? emptySequence() :
        isIterable(value) ? value.toSeq() : seqFromValue(value);
    }

    Seq.of = function(/*...values*/) {
      return Seq(arguments);
    };

    Seq.prototype.toSeq = function() {
      return this;
    };

    Seq.prototype.toString = function() {
      return this.__toString('Seq {', '}');
    };

    Seq.prototype.cacheResult = function() {
      if (!this._cache && this.__iterateUncached) {
        this._cache = this.entrySeq().toArray();
        this.size = this._cache.length;
      }
      return this;
    };

    // abstract __iterateUncached(fn, reverse)

    Seq.prototype.__iterate = function(fn, reverse) {
      return seqIterate(this, fn, reverse, true);
    };

    // abstract __iteratorUncached(type, reverse)

    Seq.prototype.__iterator = function(type, reverse) {
      return seqIterator(this, type, reverse, true);
    };



  createClass(KeyedSeq, Seq);
    function KeyedSeq(value) {
      return value === null || value === undefined ?
        emptySequence().toKeyedSeq() :
        isIterable(value) ?
          (isKeyed(value) ? value.toSeq() : value.fromEntrySeq()) :
          keyedSeqFromValue(value);
    }

    KeyedSeq.prototype.toKeyedSeq = function() {
      return this;
    };



  createClass(IndexedSeq, Seq);
    function IndexedSeq(value) {
      return value === null || value === undefined ? emptySequence() :
        !isIterable(value) ? indexedSeqFromValue(value) :
        isKeyed(value) ? value.entrySeq() : value.toIndexedSeq();
    }

    IndexedSeq.of = function(/*...values*/) {
      return IndexedSeq(arguments);
    };

    IndexedSeq.prototype.toIndexedSeq = function() {
      return this;
    };

    IndexedSeq.prototype.toString = function() {
      return this.__toString('Seq [', ']');
    };

    IndexedSeq.prototype.__iterate = function(fn, reverse) {
      return seqIterate(this, fn, reverse, false);
    };

    IndexedSeq.prototype.__iterator = function(type, reverse) {
      return seqIterator(this, type, reverse, false);
    };



  createClass(SetSeq, Seq);
    function SetSeq(value) {
      return (
        value === null || value === undefined ? emptySequence() :
        !isIterable(value) ? indexedSeqFromValue(value) :
        isKeyed(value) ? value.entrySeq() : value
      ).toSetSeq();
    }

    SetSeq.of = function(/*...values*/) {
      return SetSeq(arguments);
    };

    SetSeq.prototype.toSetSeq = function() {
      return this;
    };



  Seq.isSeq = isSeq;
  Seq.Keyed = KeyedSeq;
  Seq.Set = SetSeq;
  Seq.Indexed = IndexedSeq;

  var IS_SEQ_SENTINEL = '@@__IMMUTABLE_SEQ__@@';

  Seq.prototype[IS_SEQ_SENTINEL] = true;



  createClass(ArraySeq, IndexedSeq);
    function ArraySeq(array) {
      this._array = array;
      this.size = array.length;
    }

    ArraySeq.prototype.get = function(index, notSetValue) {
      return this.has(index) ? this._array[wrapIndex(this, index)] : notSetValue;
    };

    ArraySeq.prototype.__iterate = function(fn, reverse) {
      var array = this._array;
      var maxIndex = array.length - 1;
      for (var ii = 0; ii <= maxIndex; ii++) {
        if (fn(array[reverse ? maxIndex - ii : ii], ii, this) === false) {
          return ii + 1;
        }
      }
      return ii;
    };

    ArraySeq.prototype.__iterator = function(type, reverse) {
      var array = this._array;
      var maxIndex = array.length - 1;
      var ii = 0;
      return new Iterator(function() 
        {return ii > maxIndex ?
          iteratorDone() :
          iteratorValue(type, ii, array[reverse ? maxIndex - ii++ : ii++])}
      );
    };



  createClass(ObjectSeq, KeyedSeq);
    function ObjectSeq(object) {
      var keys = Object.keys(object);
      this._object = object;
      this._keys = keys;
      this.size = keys.length;
    }

    ObjectSeq.prototype.get = function(key, notSetValue) {
      if (notSetValue !== undefined && !this.has(key)) {
        return notSetValue;
      }
      return this._object[key];
    };

    ObjectSeq.prototype.has = function(key) {
      return this._object.hasOwnProperty(key);
    };

    ObjectSeq.prototype.__iterate = function(fn, reverse) {
      var object = this._object;
      var keys = this._keys;
      var maxIndex = keys.length - 1;
      for (var ii = 0; ii <= maxIndex; ii++) {
        var key = keys[reverse ? maxIndex - ii : ii];
        if (fn(object[key], key, this) === false) {
          return ii + 1;
        }
      }
      return ii;
    };

    ObjectSeq.prototype.__iterator = function(type, reverse) {
      var object = this._object;
      var keys = this._keys;
      var maxIndex = keys.length - 1;
      var ii = 0;
      return new Iterator(function()  {
        var key = keys[reverse ? maxIndex - ii : ii];
        return ii++ > maxIndex ?
          iteratorDone() :
          iteratorValue(type, key, object[key]);
      });
    };

  ObjectSeq.prototype[IS_ORDERED_SENTINEL] = true;


  createClass(IterableSeq, IndexedSeq);
    function IterableSeq(iterable) {
      this._iterable = iterable;
      this.size = iterable.length || iterable.size;
    }

    IterableSeq.prototype.__iterateUncached = function(fn, reverse) {
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var iterable = this._iterable;
      var iterator = getIterator(iterable);
      var iterations = 0;
      if (isIterator(iterator)) {
        var step;
        while (!(step = iterator.next()).done) {
          if (fn(step.value, iterations++, this) === false) {
            break;
          }
        }
      }
      return iterations;
    };

    IterableSeq.prototype.__iteratorUncached = function(type, reverse) {
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterable = this._iterable;
      var iterator = getIterator(iterable);
      if (!isIterator(iterator)) {
        return new Iterator(iteratorDone);
      }
      var iterations = 0;
      return new Iterator(function()  {
        var step = iterator.next();
        return step.done ? step : iteratorValue(type, iterations++, step.value);
      });
    };



  createClass(IteratorSeq, IndexedSeq);
    function IteratorSeq(iterator) {
      this._iterator = iterator;
      this._iteratorCache = [];
    }

    IteratorSeq.prototype.__iterateUncached = function(fn, reverse) {
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var iterator = this._iterator;
      var cache = this._iteratorCache;
      var iterations = 0;
      while (iterations < cache.length) {
        if (fn(cache[iterations], iterations++, this) === false) {
          return iterations;
        }
      }
      var step;
      while (!(step = iterator.next()).done) {
        var val = step.value;
        cache[iterations] = val;
        if (fn(val, iterations++, this) === false) {
          break;
        }
      }
      return iterations;
    };

    IteratorSeq.prototype.__iteratorUncached = function(type, reverse) {
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterator = this._iterator;
      var cache = this._iteratorCache;
      var iterations = 0;
      return new Iterator(function()  {
        if (iterations >= cache.length) {
          var step = iterator.next();
          if (step.done) {
            return step;
          }
          cache[iterations] = step.value;
        }
        return iteratorValue(type, iterations, cache[iterations++]);
      });
    };




  // # pragma Helper functions

  function isSeq(maybeSeq) {
    return !!(maybeSeq && maybeSeq[IS_SEQ_SENTINEL]);
  }

  var EMPTY_SEQ;

  function emptySequence() {
    return EMPTY_SEQ || (EMPTY_SEQ = new ArraySeq([]));
  }

  function keyedSeqFromValue(value) {
    var seq =
      Array.isArray(value) ? new ArraySeq(value).fromEntrySeq() :
      isIterator(value) ? new IteratorSeq(value).fromEntrySeq() :
      hasIterator(value) ? new IterableSeq(value).fromEntrySeq() :
      typeof value === 'object' ? new ObjectSeq(value) :
      undefined;
    if (!seq) {
      throw new TypeError(
        'Expected Array or iterable object of [k, v] entries, '+
        'or keyed object: ' + value
      );
    }
    return seq;
  }

  function indexedSeqFromValue(value) {
    var seq = maybeIndexedSeqFromValue(value);
    if (!seq) {
      throw new TypeError(
        'Expected Array or iterable object of values: ' + value
      );
    }
    return seq;
  }

  function seqFromValue(value) {
    var seq = maybeIndexedSeqFromValue(value) ||
      (typeof value === 'object' && new ObjectSeq(value));
    if (!seq) {
      throw new TypeError(
        'Expected Array or iterable object of values, or keyed object: ' + value
      );
    }
    return seq;
  }

  function maybeIndexedSeqFromValue(value) {
    return (
      isArrayLike(value) ? new ArraySeq(value) :
      isIterator(value) ? new IteratorSeq(value) :
      hasIterator(value) ? new IterableSeq(value) :
      undefined
    );
  }

  function seqIterate(seq, fn, reverse, useKeys) {
    var cache = seq._cache;
    if (cache) {
      var maxIndex = cache.length - 1;
      for (var ii = 0; ii <= maxIndex; ii++) {
        var entry = cache[reverse ? maxIndex - ii : ii];
        if (fn(entry[1], useKeys ? entry[0] : ii, seq) === false) {
          return ii + 1;
        }
      }
      return ii;
    }
    return seq.__iterateUncached(fn, reverse);
  }

  function seqIterator(seq, type, reverse, useKeys) {
    var cache = seq._cache;
    if (cache) {
      var maxIndex = cache.length - 1;
      var ii = 0;
      return new Iterator(function()  {
        var entry = cache[reverse ? maxIndex - ii : ii];
        return ii++ > maxIndex ?
          iteratorDone() :
          iteratorValue(type, useKeys ? entry[0] : ii - 1, entry[1]);
      });
    }
    return seq.__iteratorUncached(type, reverse);
  }

  function fromJS(json, converter) {
    return converter ?
      fromJSWith(converter, json, '', {'': json}) :
      fromJSDefault(json);
  }

  function fromJSWith(converter, json, key, parentJSON) {
    if (Array.isArray(json)) {
      return converter.call(parentJSON, key, IndexedSeq(json).map(function(v, k)  {return fromJSWith(converter, v, k, json)}));
    }
    if (isPlainObj(json)) {
      return converter.call(parentJSON, key, KeyedSeq(json).map(function(v, k)  {return fromJSWith(converter, v, k, json)}));
    }
    return json;
  }

  function fromJSDefault(json) {
    if (Array.isArray(json)) {
      return IndexedSeq(json).map(fromJSDefault).toList();
    }
    if (isPlainObj(json)) {
      return KeyedSeq(json).map(fromJSDefault).toMap();
    }
    return json;
  }

  function isPlainObj(value) {
    return value && (value.constructor === Object || value.constructor === undefined);
  }

  /**
   * An extension of the "same-value" algorithm as [described for use by ES6 Map
   * and Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Key_equality)
   *
   * NaN is considered the same as NaN, however -0 and 0 are considered the same
   * value, which is different from the algorithm described by
   * [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is).
   *
   * This is extended further to allow Objects to describe the values they
   * represent, by way of `valueOf` or `equals` (and `hashCode`).
   *
   * Note: because of this extension, the key equality of Immutable.Map and the
   * value equality of Immutable.Set will differ from ES6 Map and Set.
   *
   * ### Defining custom values
   *
   * The easiest way to describe the value an object represents is by implementing
   * `valueOf`. For example, `Date` represents a value by returning a unix
   * timestamp for `valueOf`:
   *
   *     var date1 = new Date(1234567890000); // Fri Feb 13 2009 ...
   *     var date2 = new Date(1234567890000);
   *     date1.valueOf(); // 1234567890000
   *     assert( date1 !== date2 );
   *     assert( Immutable.is( date1, date2 ) );
   *
   * Note: overriding `valueOf` may have other implications if you use this object
   * where JavaScript expects a primitive, such as implicit string coercion.
   *
   * For more complex types, especially collections, implementing `valueOf` may
   * not be performant. An alternative is to implement `equals` and `hashCode`.
   *
   * `equals` takes another object, presumably of similar type, and returns true
   * if the it is equal. Equality is symmetrical, so the same result should be
   * returned if this and the argument are flipped.
   *
   *     assert( a.equals(b) === b.equals(a) );
   *
   * `hashCode` returns a 32bit integer number representing the object which will
   * be used to determine how to store the value object in a Map or Set. You must
   * provide both or neither methods, one must not exist without the other.
   *
   * Also, an important relationship between these methods must be upheld: if two
   * values are equal, they *must* return the same hashCode. If the values are not
   * equal, they might have the same hashCode; this is called a hash collision,
   * and while undesirable for performance reasons, it is acceptable.
   *
   *     if (a.equals(b)) {
   *       assert( a.hashCode() === b.hashCode() );
   *     }
   *
   * All Immutable collections implement `equals` and `hashCode`.
   *
   */
  function is(valueA, valueB) {
    if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
      return true;
    }
    if (!valueA || !valueB) {
      return false;
    }
    if (typeof valueA.valueOf === 'function' &&
        typeof valueB.valueOf === 'function') {
      valueA = valueA.valueOf();
      valueB = valueB.valueOf();
      if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
        return true;
      }
      if (!valueA || !valueB) {
        return false;
      }
    }
    if (typeof valueA.equals === 'function' &&
        typeof valueB.equals === 'function' &&
        valueA.equals(valueB)) {
      return true;
    }
    return false;
  }

  function deepEqual(a, b) {
    if (a === b) {
      return true;
    }

    if (
      !isIterable(b) ||
      a.size !== undefined && b.size !== undefined && a.size !== b.size ||
      a.__hash !== undefined && b.__hash !== undefined && a.__hash !== b.__hash ||
      isKeyed(a) !== isKeyed(b) ||
      isIndexed(a) !== isIndexed(b) ||
      isOrdered(a) !== isOrdered(b)
    ) {
      return false;
    }

    if (a.size === 0 && b.size === 0) {
      return true;
    }

    var notAssociative = !isAssociative(a);

    if (isOrdered(a)) {
      var entries = a.entries();
      return b.every(function(v, k)  {
        var entry = entries.next().value;
        return entry && is(entry[1], v) && (notAssociative || is(entry[0], k));
      }) && entries.next().done;
    }

    var flipped = false;

    if (a.size === undefined) {
      if (b.size === undefined) {
        if (typeof a.cacheResult === 'function') {
          a.cacheResult();
        }
      } else {
        flipped = true;
        var _ = a;
        a = b;
        b = _;
      }
    }

    var allEqual = true;
    var bSize = b.__iterate(function(v, k)  {
      if (notAssociative ? !a.has(v) :
          flipped ? !is(v, a.get(k, NOT_SET)) : !is(a.get(k, NOT_SET), v)) {
        allEqual = false;
        return false;
      }
    });

    return allEqual && a.size === bSize;
  }

  createClass(Repeat, IndexedSeq);

    function Repeat(value, times) {
      if (!(this instanceof Repeat)) {
        return new Repeat(value, times);
      }
      this._value = value;
      this.size = times === undefined ? Infinity : Math.max(0, times);
      if (this.size === 0) {
        if (EMPTY_REPEAT) {
          return EMPTY_REPEAT;
        }
        EMPTY_REPEAT = this;
      }
    }

    Repeat.prototype.toString = function() {
      if (this.size === 0) {
        return 'Repeat []';
      }
      return 'Repeat [ ' + this._value + ' ' + this.size + ' times ]';
    };

    Repeat.prototype.get = function(index, notSetValue) {
      return this.has(index) ? this._value : notSetValue;
    };

    Repeat.prototype.includes = function(searchValue) {
      return is(this._value, searchValue);
    };

    Repeat.prototype.slice = function(begin, end) {
      var size = this.size;
      return wholeSlice(begin, end, size) ? this :
        new Repeat(this._value, resolveEnd(end, size) - resolveBegin(begin, size));
    };

    Repeat.prototype.reverse = function() {
      return this;
    };

    Repeat.prototype.indexOf = function(searchValue) {
      if (is(this._value, searchValue)) {
        return 0;
      }
      return -1;
    };

    Repeat.prototype.lastIndexOf = function(searchValue) {
      if (is(this._value, searchValue)) {
        return this.size;
      }
      return -1;
    };

    Repeat.prototype.__iterate = function(fn, reverse) {
      for (var ii = 0; ii < this.size; ii++) {
        if (fn(this._value, ii, this) === false) {
          return ii + 1;
        }
      }
      return ii;
    };

    Repeat.prototype.__iterator = function(type, reverse) {var this$0 = this;
      var ii = 0;
      return new Iterator(function() 
        {return ii < this$0.size ? iteratorValue(type, ii++, this$0._value) : iteratorDone()}
      );
    };

    Repeat.prototype.equals = function(other) {
      return other instanceof Repeat ?
        is(this._value, other._value) :
        deepEqual(other);
    };


  var EMPTY_REPEAT;

  function invariant(condition, error) {
    if (!condition) throw new Error(error);
  }

  createClass(Range, IndexedSeq);

    function Range(start, end, step) {
      if (!(this instanceof Range)) {
        return new Range(start, end, step);
      }
      invariant(step !== 0, 'Cannot step a Range by 0');
      start = start || 0;
      if (end === undefined) {
        end = Infinity;
      }
      step = step === undefined ? 1 : Math.abs(step);
      if (end < start) {
        step = -step;
      }
      this._start = start;
      this._end = end;
      this._step = step;
      this.size = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
      if (this.size === 0) {
        if (EMPTY_RANGE) {
          return EMPTY_RANGE;
        }
        EMPTY_RANGE = this;
      }
    }

    Range.prototype.toString = function() {
      if (this.size === 0) {
        return 'Range []';
      }
      return 'Range [ ' +
        this._start + '...' + this._end +
        (this._step !== 1 ? ' by ' + this._step : '') +
      ' ]';
    };

    Range.prototype.get = function(index, notSetValue) {
      return this.has(index) ?
        this._start + wrapIndex(this, index) * this._step :
        notSetValue;
    };

    Range.prototype.includes = function(searchValue) {
      var possibleIndex = (searchValue - this._start) / this._step;
      return possibleIndex >= 0 &&
        possibleIndex < this.size &&
        possibleIndex === Math.floor(possibleIndex);
    };

    Range.prototype.slice = function(begin, end) {
      if (wholeSlice(begin, end, this.size)) {
        return this;
      }
      begin = resolveBegin(begin, this.size);
      end = resolveEnd(end, this.size);
      if (end <= begin) {
        return new Range(0, 0);
      }
      return new Range(this.get(begin, this._end), this.get(end, this._end), this._step);
    };

    Range.prototype.indexOf = function(searchValue) {
      var offsetValue = searchValue - this._start;
      if (offsetValue % this._step === 0) {
        var index = offsetValue / this._step;
        if (index >= 0 && index < this.size) {
          return index
        }
      }
      return -1;
    };

    Range.prototype.lastIndexOf = function(searchValue) {
      return this.indexOf(searchValue);
    };

    Range.prototype.__iterate = function(fn, reverse) {
      var maxIndex = this.size - 1;
      var step = this._step;
      var value = reverse ? this._start + maxIndex * step : this._start;
      for (var ii = 0; ii <= maxIndex; ii++) {
        if (fn(value, ii, this) === false) {
          return ii + 1;
        }
        value += reverse ? -step : step;
      }
      return ii;
    };

    Range.prototype.__iterator = function(type, reverse) {
      var maxIndex = this.size - 1;
      var step = this._step;
      var value = reverse ? this._start + maxIndex * step : this._start;
      var ii = 0;
      return new Iterator(function()  {
        var v = value;
        value += reverse ? -step : step;
        return ii > maxIndex ? iteratorDone() : iteratorValue(type, ii++, v);
      });
    };

    Range.prototype.equals = function(other) {
      return other instanceof Range ?
        this._start === other._start &&
        this._end === other._end &&
        this._step === other._step :
        deepEqual(this, other);
    };


  var EMPTY_RANGE;

  createClass(Collection, Iterable);
    function Collection() {
      throw TypeError('Abstract');
    }


  createClass(KeyedCollection, Collection);function KeyedCollection() {}

  createClass(IndexedCollection, Collection);function IndexedCollection() {}

  createClass(SetCollection, Collection);function SetCollection() {}


  Collection.Keyed = KeyedCollection;
  Collection.Indexed = IndexedCollection;
  Collection.Set = SetCollection;

  var imul =
    typeof Math.imul === 'function' && Math.imul(0xffffffff, 2) === -2 ?
    Math.imul :
    function imul(a, b) {
      a = a | 0; // int
      b = b | 0; // int
      var c = a & 0xffff;
      var d = b & 0xffff;
      // Shift by 0 fixes the sign on the high part.
      return (c * d) + ((((a >>> 16) * d + c * (b >>> 16)) << 16) >>> 0) | 0; // int
    };

  // v8 has an optimization for storing 31-bit signed numbers.
  // Values which have either 00 or 11 as the high order bits qualify.
  // This function drops the highest order bit in a signed number, maintaining
  // the sign bit.
  function smi(i32) {
    return ((i32 >>> 1) & 0x40000000) | (i32 & 0xBFFFFFFF);
  }

  function hash(o) {
    if (o === false || o === null || o === undefined) {
      return 0;
    }
    if (typeof o.valueOf === 'function') {
      o = o.valueOf();
      if (o === false || o === null || o === undefined) {
        return 0;
      }
    }
    if (o === true) {
      return 1;
    }
    var type = typeof o;
    if (type === 'number') {
      if (o !== o || o === Infinity) {
        return 0;
      }
      var h = o | 0;
      if (h !== o) {
        h ^= o * 0xFFFFFFFF;
      }
      while (o > 0xFFFFFFFF) {
        o /= 0xFFFFFFFF;
        h ^= o;
      }
      return smi(h);
    }
    if (type === 'string') {
      return o.length > STRING_HASH_CACHE_MIN_STRLEN ? cachedHashString(o) : hashString(o);
    }
    if (typeof o.hashCode === 'function') {
      return o.hashCode();
    }
    if (type === 'object') {
      return hashJSObj(o);
    }
    if (typeof o.toString === 'function') {
      return hashString(o.toString());
    }
    throw new Error('Value type ' + type + ' cannot be hashed.');
  }

  function cachedHashString(string) {
    var hash = stringHashCache[string];
    if (hash === undefined) {
      hash = hashString(string);
      if (STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE) {
        STRING_HASH_CACHE_SIZE = 0;
        stringHashCache = {};
      }
      STRING_HASH_CACHE_SIZE++;
      stringHashCache[string] = hash;
    }
    return hash;
  }

  // http://jsperf.com/hashing-strings
  function hashString(string) {
    // This is the hash from JVM
    // The hash code for a string is computed as
    // s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
    // where s[i] is the ith character of the string and n is the length of
    // the string. We "mod" the result to make it between 0 (inclusive) and 2^31
    // (exclusive) by dropping high bits.
    var hash = 0;
    for (var ii = 0; ii < string.length; ii++) {
      hash = 31 * hash + string.charCodeAt(ii) | 0;
    }
    return smi(hash);
  }

  function hashJSObj(obj) {
    var hash;
    if (usingWeakMap) {
      hash = weakMap.get(obj);
      if (hash !== undefined) {
        return hash;
      }
    }

    hash = obj[UID_HASH_KEY];
    if (hash !== undefined) {
      return hash;
    }

    if (!canDefineProperty) {
      hash = obj.propertyIsEnumerable && obj.propertyIsEnumerable[UID_HASH_KEY];
      if (hash !== undefined) {
        return hash;
      }

      hash = getIENodeHash(obj);
      if (hash !== undefined) {
        return hash;
      }
    }

    hash = ++objHashUID;
    if (objHashUID & 0x40000000) {
      objHashUID = 0;
    }

    if (usingWeakMap) {
      weakMap.set(obj, hash);
    } else if (isExtensible !== undefined && isExtensible(obj) === false) {
      throw new Error('Non-extensible objects are not allowed as keys.');
    } else if (canDefineProperty) {
      Object.defineProperty(obj, UID_HASH_KEY, {
        'enumerable': false,
        'configurable': false,
        'writable': false,
        'value': hash
      });
    } else if (obj.propertyIsEnumerable !== undefined &&
               obj.propertyIsEnumerable === obj.constructor.prototype.propertyIsEnumerable) {
      // Since we can't define a non-enumerable property on the object
      // we'll hijack one of the less-used non-enumerable properties to
      // save our hash on it. Since this is a function it will not show up in
      // `JSON.stringify` which is what we want.
      obj.propertyIsEnumerable = function() {
        return this.constructor.prototype.propertyIsEnumerable.apply(this, arguments);
      };
      obj.propertyIsEnumerable[UID_HASH_KEY] = hash;
    } else if (obj.nodeType !== undefined) {
      // At this point we couldn't get the IE `uniqueID` to use as a hash
      // and we couldn't use a non-enumerable property to exploit the
      // dontEnum bug so we simply add the `UID_HASH_KEY` on the node
      // itself.
      obj[UID_HASH_KEY] = hash;
    } else {
      throw new Error('Unable to set a non-enumerable property on object.');
    }

    return hash;
  }

  // Get references to ES5 object methods.
  var isExtensible = Object.isExtensible;

  // True if Object.defineProperty works as expected. IE8 fails this test.
  var canDefineProperty = (function() {
    try {
      Object.defineProperty({}, '@', {});
      return true;
    } catch (e) {
      return false;
    }
  }());

  // IE has a `uniqueID` property on DOM nodes. We can construct the hash from it
  // and avoid memory leaks from the IE cloneNode bug.
  function getIENodeHash(node) {
    if (node && node.nodeType > 0) {
      switch (node.nodeType) {
        case 1: // Element
          return node.uniqueID;
        case 9: // Document
          return node.documentElement && node.documentElement.uniqueID;
      }
    }
  }

  // If possible, use a WeakMap.
  var usingWeakMap = typeof WeakMap === 'function';
  var weakMap;
  if (usingWeakMap) {
    weakMap = new WeakMap();
  }

  var objHashUID = 0;

  var UID_HASH_KEY = '__immutablehash__';
  if (typeof Symbol === 'function') {
    UID_HASH_KEY = Symbol(UID_HASH_KEY);
  }

  var STRING_HASH_CACHE_MIN_STRLEN = 16;
  var STRING_HASH_CACHE_MAX_SIZE = 255;
  var STRING_HASH_CACHE_SIZE = 0;
  var stringHashCache = {};

  function assertNotInfinite(size) {
    invariant(
      size !== Infinity,
      'Cannot perform this action with an infinite size.'
    );
  }

  createClass(Map, KeyedCollection);

    // @pragma Construction

    function Map(value) {
      return value === null || value === undefined ? emptyMap() :
        isMap(value) && !isOrdered(value) ? value :
        emptyMap().withMutations(function(map ) {
          var iter = KeyedIterable(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v, k)  {return map.set(k, v)});
        });
    }

    Map.of = function() {var keyValues = SLICE$0.call(arguments, 0);
      return emptyMap().withMutations(function(map ) {
        for (var i = 0; i < keyValues.length; i += 2) {
          if (i + 1 >= keyValues.length) {
            throw new Error('Missing value for key: ' + keyValues[i]);
          }
          map.set(keyValues[i], keyValues[i + 1]);
        }
      });
    };

    Map.prototype.toString = function() {
      return this.__toString('Map {', '}');
    };

    // @pragma Access

    Map.prototype.get = function(k, notSetValue) {
      return this._root ?
        this._root.get(0, undefined, k, notSetValue) :
        notSetValue;
    };

    // @pragma Modification

    Map.prototype.set = function(k, v) {
      return updateMap(this, k, v);
    };

    Map.prototype.setIn = function(keyPath, v) {
      return this.updateIn(keyPath, NOT_SET, function()  {return v});
    };

    Map.prototype.remove = function(k) {
      return updateMap(this, k, NOT_SET);
    };

    Map.prototype.deleteIn = function(keyPath) {
      return this.updateIn(keyPath, function()  {return NOT_SET});
    };

    Map.prototype.update = function(k, notSetValue, updater) {
      return arguments.length === 1 ?
        k(this) :
        this.updateIn([k], notSetValue, updater);
    };

    Map.prototype.updateIn = function(keyPath, notSetValue, updater) {
      if (!updater) {
        updater = notSetValue;
        notSetValue = undefined;
      }
      var updatedValue = updateInDeepMap(
        this,
        forceIterator(keyPath),
        notSetValue,
        updater
      );
      return updatedValue === NOT_SET ? undefined : updatedValue;
    };

    Map.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = 0;
        this._root = null;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return emptyMap();
    };

    // @pragma Composition

    Map.prototype.merge = function(/*...iters*/) {
      return mergeIntoMapWith(this, undefined, arguments);
    };

    Map.prototype.mergeWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return mergeIntoMapWith(this, merger, iters);
    };

    Map.prototype.mergeIn = function(keyPath) {var iters = SLICE$0.call(arguments, 1);
      return this.updateIn(
        keyPath,
        emptyMap(),
        function(m ) {return typeof m.merge === 'function' ?
          m.merge.apply(m, iters) :
          iters[iters.length - 1]}
      );
    };

    Map.prototype.mergeDeep = function(/*...iters*/) {
      return mergeIntoMapWith(this, deepMerger, arguments);
    };

    Map.prototype.mergeDeepWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return mergeIntoMapWith(this, deepMergerWith(merger), iters);
    };

    Map.prototype.mergeDeepIn = function(keyPath) {var iters = SLICE$0.call(arguments, 1);
      return this.updateIn(
        keyPath,
        emptyMap(),
        function(m ) {return typeof m.mergeDeep === 'function' ?
          m.mergeDeep.apply(m, iters) :
          iters[iters.length - 1]}
      );
    };

    Map.prototype.sort = function(comparator) {
      // Late binding
      return OrderedMap(sortFactory(this, comparator));
    };

    Map.prototype.sortBy = function(mapper, comparator) {
      // Late binding
      return OrderedMap(sortFactory(this, comparator, mapper));
    };

    // @pragma Mutability

    Map.prototype.withMutations = function(fn) {
      var mutable = this.asMutable();
      fn(mutable);
      return mutable.wasAltered() ? mutable.__ensureOwner(this.__ownerID) : this;
    };

    Map.prototype.asMutable = function() {
      return this.__ownerID ? this : this.__ensureOwner(new OwnerID());
    };

    Map.prototype.asImmutable = function() {
      return this.__ensureOwner();
    };

    Map.prototype.wasAltered = function() {
      return this.__altered;
    };

    Map.prototype.__iterator = function(type, reverse) {
      return new MapIterator(this, type, reverse);
    };

    Map.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      var iterations = 0;
      this._root && this._root.iterate(function(entry ) {
        iterations++;
        return fn(entry[1], entry[0], this$0);
      }, reverse);
      return iterations;
    };

    Map.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      if (!ownerID) {
        this.__ownerID = ownerID;
        this.__altered = false;
        return this;
      }
      return makeMap(this.size, this._root, ownerID, this.__hash);
    };


  function isMap(maybeMap) {
    return !!(maybeMap && maybeMap[IS_MAP_SENTINEL]);
  }

  Map.isMap = isMap;

  var IS_MAP_SENTINEL = '@@__IMMUTABLE_MAP__@@';

  var MapPrototype = Map.prototype;
  MapPrototype[IS_MAP_SENTINEL] = true;
  MapPrototype[DELETE] = MapPrototype.remove;
  MapPrototype.removeIn = MapPrototype.deleteIn;


  // #pragma Trie Nodes



    function ArrayMapNode(ownerID, entries) {
      this.ownerID = ownerID;
      this.entries = entries;
    }

    ArrayMapNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      var entries = this.entries;
      for (var ii = 0, len = entries.length; ii < len; ii++) {
        if (is(key, entries[ii][0])) {
          return entries[ii][1];
        }
      }
      return notSetValue;
    };

    ArrayMapNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      var removed = value === NOT_SET;

      var entries = this.entries;
      var idx = 0;
      for (var len = entries.length; idx < len; idx++) {
        if (is(key, entries[idx][0])) {
          break;
        }
      }
      var exists = idx < len;

      if (exists ? entries[idx][1] === value : removed) {
        return this;
      }

      SetRef(didAlter);
      (removed || !exists) && SetRef(didChangeSize);

      if (removed && entries.length === 1) {
        return; // undefined
      }

      if (!exists && !removed && entries.length >= MAX_ARRAY_MAP_SIZE) {
        return createNodes(ownerID, entries, key, value);
      }

      var isEditable = ownerID && ownerID === this.ownerID;
      var newEntries = isEditable ? entries : arrCopy(entries);

      if (exists) {
        if (removed) {
          idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
        } else {
          newEntries[idx] = [key, value];
        }
      } else {
        newEntries.push([key, value]);
      }

      if (isEditable) {
        this.entries = newEntries;
        return this;
      }

      return new ArrayMapNode(ownerID, newEntries);
    };




    function BitmapIndexedNode(ownerID, bitmap, nodes) {
      this.ownerID = ownerID;
      this.bitmap = bitmap;
      this.nodes = nodes;
    }

    BitmapIndexedNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var bit = (1 << ((shift === 0 ? keyHash : keyHash >>> shift) & MASK));
      var bitmap = this.bitmap;
      return (bitmap & bit) === 0 ? notSetValue :
        this.nodes[popCount(bitmap & (bit - 1))].get(shift + SHIFT, keyHash, key, notSetValue);
    };

    BitmapIndexedNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var keyHashFrag = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
      var bit = 1 << keyHashFrag;
      var bitmap = this.bitmap;
      var exists = (bitmap & bit) !== 0;

      if (!exists && value === NOT_SET) {
        return this;
      }

      var idx = popCount(bitmap & (bit - 1));
      var nodes = this.nodes;
      var node = exists ? nodes[idx] : undefined;
      var newNode = updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);

      if (newNode === node) {
        return this;
      }

      if (!exists && newNode && nodes.length >= MAX_BITMAP_INDEXED_SIZE) {
        return expandNodes(ownerID, nodes, bitmap, keyHashFrag, newNode);
      }

      if (exists && !newNode && nodes.length === 2 && isLeafNode(nodes[idx ^ 1])) {
        return nodes[idx ^ 1];
      }

      if (exists && newNode && nodes.length === 1 && isLeafNode(newNode)) {
        return newNode;
      }

      var isEditable = ownerID && ownerID === this.ownerID;
      var newBitmap = exists ? newNode ? bitmap : bitmap ^ bit : bitmap | bit;
      var newNodes = exists ? newNode ?
        setIn(nodes, idx, newNode, isEditable) :
        spliceOut(nodes, idx, isEditable) :
        spliceIn(nodes, idx, newNode, isEditable);

      if (isEditable) {
        this.bitmap = newBitmap;
        this.nodes = newNodes;
        return this;
      }

      return new BitmapIndexedNode(ownerID, newBitmap, newNodes);
    };




    function HashArrayMapNode(ownerID, count, nodes) {
      this.ownerID = ownerID;
      this.count = count;
      this.nodes = nodes;
    }

    HashArrayMapNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
      var node = this.nodes[idx];
      return node ? node.get(shift + SHIFT, keyHash, key, notSetValue) : notSetValue;
    };

    HashArrayMapNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
      var removed = value === NOT_SET;
      var nodes = this.nodes;
      var node = nodes[idx];

      if (removed && !node) {
        return this;
      }

      var newNode = updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);
      if (newNode === node) {
        return this;
      }

      var newCount = this.count;
      if (!node) {
        newCount++;
      } else if (!newNode) {
        newCount--;
        if (newCount < MIN_HASH_ARRAY_MAP_SIZE) {
          return packNodes(ownerID, nodes, newCount, idx);
        }
      }

      var isEditable = ownerID && ownerID === this.ownerID;
      var newNodes = setIn(nodes, idx, newNode, isEditable);

      if (isEditable) {
        this.count = newCount;
        this.nodes = newNodes;
        return this;
      }

      return new HashArrayMapNode(ownerID, newCount, newNodes);
    };




    function HashCollisionNode(ownerID, keyHash, entries) {
      this.ownerID = ownerID;
      this.keyHash = keyHash;
      this.entries = entries;
    }

    HashCollisionNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      var entries = this.entries;
      for (var ii = 0, len = entries.length; ii < len; ii++) {
        if (is(key, entries[ii][0])) {
          return entries[ii][1];
        }
      }
      return notSetValue;
    };

    HashCollisionNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }

      var removed = value === NOT_SET;

      if (keyHash !== this.keyHash) {
        if (removed) {
          return this;
        }
        SetRef(didAlter);
        SetRef(didChangeSize);
        return mergeIntoNode(this, ownerID, shift, keyHash, [key, value]);
      }

      var entries = this.entries;
      var idx = 0;
      for (var len = entries.length; idx < len; idx++) {
        if (is(key, entries[idx][0])) {
          break;
        }
      }
      var exists = idx < len;

      if (exists ? entries[idx][1] === value : removed) {
        return this;
      }

      SetRef(didAlter);
      (removed || !exists) && SetRef(didChangeSize);

      if (removed && len === 2) {
        return new ValueNode(ownerID, this.keyHash, entries[idx ^ 1]);
      }

      var isEditable = ownerID && ownerID === this.ownerID;
      var newEntries = isEditable ? entries : arrCopy(entries);

      if (exists) {
        if (removed) {
          idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
        } else {
          newEntries[idx] = [key, value];
        }
      } else {
        newEntries.push([key, value]);
      }

      if (isEditable) {
        this.entries = newEntries;
        return this;
      }

      return new HashCollisionNode(ownerID, this.keyHash, newEntries);
    };




    function ValueNode(ownerID, keyHash, entry) {
      this.ownerID = ownerID;
      this.keyHash = keyHash;
      this.entry = entry;
    }

    ValueNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      return is(key, this.entry[0]) ? this.entry[1] : notSetValue;
    };

    ValueNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      var removed = value === NOT_SET;
      var keyMatch = is(key, this.entry[0]);
      if (keyMatch ? value === this.entry[1] : removed) {
        return this;
      }

      SetRef(didAlter);

      if (removed) {
        SetRef(didChangeSize);
        return; // undefined
      }

      if (keyMatch) {
        if (ownerID && ownerID === this.ownerID) {
          this.entry[1] = value;
          return this;
        }
        return new ValueNode(ownerID, this.keyHash, [key, value]);
      }

      SetRef(didChangeSize);
      return mergeIntoNode(this, ownerID, shift, hash(key), [key, value]);
    };



  // #pragma Iterators

  ArrayMapNode.prototype.iterate =
  HashCollisionNode.prototype.iterate = function (fn, reverse) {
    var entries = this.entries;
    for (var ii = 0, maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
      if (fn(entries[reverse ? maxIndex - ii : ii]) === false) {
        return false;
      }
    }
  }

  BitmapIndexedNode.prototype.iterate =
  HashArrayMapNode.prototype.iterate = function (fn, reverse) {
    var nodes = this.nodes;
    for (var ii = 0, maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
      var node = nodes[reverse ? maxIndex - ii : ii];
      if (node && node.iterate(fn, reverse) === false) {
        return false;
      }
    }
  }

  ValueNode.prototype.iterate = function (fn, reverse) {
    return fn(this.entry);
  }

  createClass(MapIterator, Iterator);

    function MapIterator(map, type, reverse) {
      this._type = type;
      this._reverse = reverse;
      this._stack = map._root && mapIteratorFrame(map._root);
    }

    MapIterator.prototype.next = function() {
      var type = this._type;
      var stack = this._stack;
      while (stack) {
        var node = stack.node;
        var index = stack.index++;
        var maxIndex;
        if (node.entry) {
          if (index === 0) {
            return mapIteratorValue(type, node.entry);
          }
        } else if (node.entries) {
          maxIndex = node.entries.length - 1;
          if (index <= maxIndex) {
            return mapIteratorValue(type, node.entries[this._reverse ? maxIndex - index : index]);
          }
        } else {
          maxIndex = node.nodes.length - 1;
          if (index <= maxIndex) {
            var subNode = node.nodes[this._reverse ? maxIndex - index : index];
            if (subNode) {
              if (subNode.entry) {
                return mapIteratorValue(type, subNode.entry);
              }
              stack = this._stack = mapIteratorFrame(subNode, stack);
            }
            continue;
          }
        }
        stack = this._stack = this._stack.__prev;
      }
      return iteratorDone();
    };


  function mapIteratorValue(type, entry) {
    return iteratorValue(type, entry[0], entry[1]);
  }

  function mapIteratorFrame(node, prev) {
    return {
      node: node,
      index: 0,
      __prev: prev
    };
  }

  function makeMap(size, root, ownerID, hash) {
    var map = Object.create(MapPrototype);
    map.size = size;
    map._root = root;
    map.__ownerID = ownerID;
    map.__hash = hash;
    map.__altered = false;
    return map;
  }

  var EMPTY_MAP;
  function emptyMap() {
    return EMPTY_MAP || (EMPTY_MAP = makeMap(0));
  }

  function updateMap(map, k, v) {
    var newRoot;
    var newSize;
    if (!map._root) {
      if (v === NOT_SET) {
        return map;
      }
      newSize = 1;
      newRoot = new ArrayMapNode(map.__ownerID, [[k, v]]);
    } else {
      var didChangeSize = MakeRef(CHANGE_LENGTH);
      var didAlter = MakeRef(DID_ALTER);
      newRoot = updateNode(map._root, map.__ownerID, 0, undefined, k, v, didChangeSize, didAlter);
      if (!didAlter.value) {
        return map;
      }
      newSize = map.size + (didChangeSize.value ? v === NOT_SET ? -1 : 1 : 0);
    }
    if (map.__ownerID) {
      map.size = newSize;
      map._root = newRoot;
      map.__hash = undefined;
      map.__altered = true;
      return map;
    }
    return newRoot ? makeMap(newSize, newRoot) : emptyMap();
  }

  function updateNode(node, ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
    if (!node) {
      if (value === NOT_SET) {
        return node;
      }
      SetRef(didAlter);
      SetRef(didChangeSize);
      return new ValueNode(ownerID, keyHash, [key, value]);
    }
    return node.update(ownerID, shift, keyHash, key, value, didChangeSize, didAlter);
  }

  function isLeafNode(node) {
    return node.constructor === ValueNode || node.constructor === HashCollisionNode;
  }

  function mergeIntoNode(node, ownerID, shift, keyHash, entry) {
    if (node.keyHash === keyHash) {
      return new HashCollisionNode(ownerID, keyHash, [node.entry, entry]);
    }

    var idx1 = (shift === 0 ? node.keyHash : node.keyHash >>> shift) & MASK;
    var idx2 = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;

    var newNode;
    var nodes = idx1 === idx2 ?
      [mergeIntoNode(node, ownerID, shift + SHIFT, keyHash, entry)] :
      ((newNode = new ValueNode(ownerID, keyHash, entry)), idx1 < idx2 ? [node, newNode] : [newNode, node]);

    return new BitmapIndexedNode(ownerID, (1 << idx1) | (1 << idx2), nodes);
  }

  function createNodes(ownerID, entries, key, value) {
    if (!ownerID) {
      ownerID = new OwnerID();
    }
    var node = new ValueNode(ownerID, hash(key), [key, value]);
    for (var ii = 0; ii < entries.length; ii++) {
      var entry = entries[ii];
      node = node.update(ownerID, 0, undefined, entry[0], entry[1]);
    }
    return node;
  }

  function packNodes(ownerID, nodes, count, excluding) {
    var bitmap = 0;
    var packedII = 0;
    var packedNodes = new Array(count);
    for (var ii = 0, bit = 1, len = nodes.length; ii < len; ii++, bit <<= 1) {
      var node = nodes[ii];
      if (node !== undefined && ii !== excluding) {
        bitmap |= bit;
        packedNodes[packedII++] = node;
      }
    }
    return new BitmapIndexedNode(ownerID, bitmap, packedNodes);
  }

  function expandNodes(ownerID, nodes, bitmap, including, node) {
    var count = 0;
    var expandedNodes = new Array(SIZE);
    for (var ii = 0; bitmap !== 0; ii++, bitmap >>>= 1) {
      expandedNodes[ii] = bitmap & 1 ? nodes[count++] : undefined;
    }
    expandedNodes[including] = node;
    return new HashArrayMapNode(ownerID, count + 1, expandedNodes);
  }

  function mergeIntoMapWith(map, merger, iterables) {
    var iters = [];
    for (var ii = 0; ii < iterables.length; ii++) {
      var value = iterables[ii];
      var iter = KeyedIterable(value);
      if (!isIterable(value)) {
        iter = iter.map(function(v ) {return fromJS(v)});
      }
      iters.push(iter);
    }
    return mergeIntoCollectionWith(map, merger, iters);
  }

  function deepMerger(existing, value, key) {
    return existing && existing.mergeDeep && isIterable(value) ?
      existing.mergeDeep(value) :
      is(existing, value) ? existing : value;
  }

  function deepMergerWith(merger) {
    return function(existing, value, key)  {
      if (existing && existing.mergeDeepWith && isIterable(value)) {
        return existing.mergeDeepWith(merger, value);
      }
      var nextValue = merger(existing, value, key);
      return is(existing, nextValue) ? existing : nextValue;
    };
  }

  function mergeIntoCollectionWith(collection, merger, iters) {
    iters = iters.filter(function(x ) {return x.size !== 0});
    if (iters.length === 0) {
      return collection;
    }
    if (collection.size === 0 && !collection.__ownerID && iters.length === 1) {
      return collection.constructor(iters[0]);
    }
    return collection.withMutations(function(collection ) {
      var mergeIntoMap = merger ?
        function(value, key)  {
          collection.update(key, NOT_SET, function(existing )
            {return existing === NOT_SET ? value : merger(existing, value, key)}
          );
        } :
        function(value, key)  {
          collection.set(key, value);
        }
      for (var ii = 0; ii < iters.length; ii++) {
        iters[ii].forEach(mergeIntoMap);
      }
    });
  }

  function updateInDeepMap(existing, keyPathIter, notSetValue, updater) {
    var isNotSet = existing === NOT_SET;
    var step = keyPathIter.next();
    if (step.done) {
      var existingValue = isNotSet ? notSetValue : existing;
      var newValue = updater(existingValue);
      return newValue === existingValue ? existing : newValue;
    }
    invariant(
      isNotSet || (existing && existing.set),
      'invalid keyPath'
    );
    var key = step.value;
    var nextExisting = isNotSet ? NOT_SET : existing.get(key, NOT_SET);
    var nextUpdated = updateInDeepMap(
      nextExisting,
      keyPathIter,
      notSetValue,
      updater
    );
    return nextUpdated === nextExisting ? existing :
      nextUpdated === NOT_SET ? existing.remove(key) :
      (isNotSet ? emptyMap() : existing).set(key, nextUpdated);
  }

  function popCount(x) {
    x = x - ((x >> 1) & 0x55555555);
    x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
    x = (x + (x >> 4)) & 0x0f0f0f0f;
    x = x + (x >> 8);
    x = x + (x >> 16);
    return x & 0x7f;
  }

  function setIn(array, idx, val, canEdit) {
    var newArray = canEdit ? array : arrCopy(array);
    newArray[idx] = val;
    return newArray;
  }

  function spliceIn(array, idx, val, canEdit) {
    var newLen = array.length + 1;
    if (canEdit && idx + 1 === newLen) {
      array[idx] = val;
      return array;
    }
    var newArray = new Array(newLen);
    var after = 0;
    for (var ii = 0; ii < newLen; ii++) {
      if (ii === idx) {
        newArray[ii] = val;
        after = -1;
      } else {
        newArray[ii] = array[ii + after];
      }
    }
    return newArray;
  }

  function spliceOut(array, idx, canEdit) {
    var newLen = array.length - 1;
    if (canEdit && idx === newLen) {
      array.pop();
      return array;
    }
    var newArray = new Array(newLen);
    var after = 0;
    for (var ii = 0; ii < newLen; ii++) {
      if (ii === idx) {
        after = 1;
      }
      newArray[ii] = array[ii + after];
    }
    return newArray;
  }

  var MAX_ARRAY_MAP_SIZE = SIZE / 4;
  var MAX_BITMAP_INDEXED_SIZE = SIZE / 2;
  var MIN_HASH_ARRAY_MAP_SIZE = SIZE / 4;

  createClass(List, IndexedCollection);

    // @pragma Construction

    function List(value) {
      var empty = emptyList();
      if (value === null || value === undefined) {
        return empty;
      }
      if (isList(value)) {
        return value;
      }
      var iter = IndexedIterable(value);
      var size = iter.size;
      if (size === 0) {
        return empty;
      }
      assertNotInfinite(size);
      if (size > 0 && size < SIZE) {
        return makeList(0, size, SHIFT, null, new VNode(iter.toArray()));
      }
      return empty.withMutations(function(list ) {
        list.setSize(size);
        iter.forEach(function(v, i)  {return list.set(i, v)});
      });
    }

    List.of = function(/*...values*/) {
      return this(arguments);
    };

    List.prototype.toString = function() {
      return this.__toString('List [', ']');
    };

    // @pragma Access

    List.prototype.get = function(index, notSetValue) {
      index = wrapIndex(this, index);
      if (index >= 0 && index < this.size) {
        index += this._origin;
        var node = listNodeFor(this, index);
        return node && node.array[index & MASK];
      }
      return notSetValue;
    };

    // @pragma Modification

    List.prototype.set = function(index, value) {
      return updateList(this, index, value);
    };

    List.prototype.remove = function(index) {
      return !this.has(index) ? this :
        index === 0 ? this.shift() :
        index === this.size - 1 ? this.pop() :
        this.splice(index, 1);
    };

    List.prototype.insert = function(index, value) {
      return this.splice(index, 0, value);
    };

    List.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = this._origin = this._capacity = 0;
        this._level = SHIFT;
        this._root = this._tail = null;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return emptyList();
    };

    List.prototype.push = function(/*...values*/) {
      var values = arguments;
      var oldSize = this.size;
      return this.withMutations(function(list ) {
        setListBounds(list, 0, oldSize + values.length);
        for (var ii = 0; ii < values.length; ii++) {
          list.set(oldSize + ii, values[ii]);
        }
      });
    };

    List.prototype.pop = function() {
      return setListBounds(this, 0, -1);
    };

    List.prototype.unshift = function(/*...values*/) {
      var values = arguments;
      return this.withMutations(function(list ) {
        setListBounds(list, -values.length);
        for (var ii = 0; ii < values.length; ii++) {
          list.set(ii, values[ii]);
        }
      });
    };

    List.prototype.shift = function() {
      return setListBounds(this, 1);
    };

    // @pragma Composition

    List.prototype.merge = function(/*...iters*/) {
      return mergeIntoListWith(this, undefined, arguments);
    };

    List.prototype.mergeWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return mergeIntoListWith(this, merger, iters);
    };

    List.prototype.mergeDeep = function(/*...iters*/) {
      return mergeIntoListWith(this, deepMerger, arguments);
    };

    List.prototype.mergeDeepWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return mergeIntoListWith(this, deepMergerWith(merger), iters);
    };

    List.prototype.setSize = function(size) {
      return setListBounds(this, 0, size);
    };

    // @pragma Iteration

    List.prototype.slice = function(begin, end) {
      var size = this.size;
      if (wholeSlice(begin, end, size)) {
        return this;
      }
      return setListBounds(
        this,
        resolveBegin(begin, size),
        resolveEnd(end, size)
      );
    };

    List.prototype.__iterator = function(type, reverse) {
      var index = 0;
      var values = iterateList(this, reverse);
      return new Iterator(function()  {
        var value = values();
        return value === DONE ?
          iteratorDone() :
          iteratorValue(type, index++, value);
      });
    };

    List.prototype.__iterate = function(fn, reverse) {
      var index = 0;
      var values = iterateList(this, reverse);
      var value;
      while ((value = values()) !== DONE) {
        if (fn(value, index++, this) === false) {
          break;
        }
      }
      return index;
    };

    List.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      if (!ownerID) {
        this.__ownerID = ownerID;
        return this;
      }
      return makeList(this._origin, this._capacity, this._level, this._root, this._tail, ownerID, this.__hash);
    };


  function isList(maybeList) {
    return !!(maybeList && maybeList[IS_LIST_SENTINEL]);
  }

  List.isList = isList;

  var IS_LIST_SENTINEL = '@@__IMMUTABLE_LIST__@@';

  var ListPrototype = List.prototype;
  ListPrototype[IS_LIST_SENTINEL] = true;
  ListPrototype[DELETE] = ListPrototype.remove;
  ListPrototype.setIn = MapPrototype.setIn;
  ListPrototype.deleteIn =
  ListPrototype.removeIn = MapPrototype.removeIn;
  ListPrototype.update = MapPrototype.update;
  ListPrototype.updateIn = MapPrototype.updateIn;
  ListPrototype.mergeIn = MapPrototype.mergeIn;
  ListPrototype.mergeDeepIn = MapPrototype.mergeDeepIn;
  ListPrototype.withMutations = MapPrototype.withMutations;
  ListPrototype.asMutable = MapPrototype.asMutable;
  ListPrototype.asImmutable = MapPrototype.asImmutable;
  ListPrototype.wasAltered = MapPrototype.wasAltered;



    function VNode(array, ownerID) {
      this.array = array;
      this.ownerID = ownerID;
    }

    // TODO: seems like these methods are very similar

    VNode.prototype.removeBefore = function(ownerID, level, index) {
      if (index === level ? 1 << level : 0 || this.array.length === 0) {
        return this;
      }
      var originIndex = (index >>> level) & MASK;
      if (originIndex >= this.array.length) {
        return new VNode([], ownerID);
      }
      var removingFirst = originIndex === 0;
      var newChild;
      if (level > 0) {
        var oldChild = this.array[originIndex];
        newChild = oldChild && oldChild.removeBefore(ownerID, level - SHIFT, index);
        if (newChild === oldChild && removingFirst) {
          return this;
        }
      }
      if (removingFirst && !newChild) {
        return this;
      }
      var editable = editableVNode(this, ownerID);
      if (!removingFirst) {
        for (var ii = 0; ii < originIndex; ii++) {
          editable.array[ii] = undefined;
        }
      }
      if (newChild) {
        editable.array[originIndex] = newChild;
      }
      return editable;
    };

    VNode.prototype.removeAfter = function(ownerID, level, index) {
      if (index === (level ? 1 << level : 0) || this.array.length === 0) {
        return this;
      }
      var sizeIndex = ((index - 1) >>> level) & MASK;
      if (sizeIndex >= this.array.length) {
        return this;
      }

      var newChild;
      if (level > 0) {
        var oldChild = this.array[sizeIndex];
        newChild = oldChild && oldChild.removeAfter(ownerID, level - SHIFT, index);
        if (newChild === oldChild && sizeIndex === this.array.length - 1) {
          return this;
        }
      }

      var editable = editableVNode(this, ownerID);
      editable.array.splice(sizeIndex + 1);
      if (newChild) {
        editable.array[sizeIndex] = newChild;
      }
      return editable;
    };



  var DONE = {};

  function iterateList(list, reverse) {
    var left = list._origin;
    var right = list._capacity;
    var tailPos = getTailOffset(right);
    var tail = list._tail;

    return iterateNodeOrLeaf(list._root, list._level, 0);

    function iterateNodeOrLeaf(node, level, offset) {
      return level === 0 ?
        iterateLeaf(node, offset) :
        iterateNode(node, level, offset);
    }

    function iterateLeaf(node, offset) {
      var array = offset === tailPos ? tail && tail.array : node && node.array;
      var from = offset > left ? 0 : left - offset;
      var to = right - offset;
      if (to > SIZE) {
        to = SIZE;
      }
      return function()  {
        if (from === to) {
          return DONE;
        }
        var idx = reverse ? --to : from++;
        return array && array[idx];
      };
    }

    function iterateNode(node, level, offset) {
      var values;
      var array = node && node.array;
      var from = offset > left ? 0 : (left - offset) >> level;
      var to = ((right - offset) >> level) + 1;
      if (to > SIZE) {
        to = SIZE;
      }
      return function()  {
        do {
          if (values) {
            var value = values();
            if (value !== DONE) {
              return value;
            }
            values = null;
          }
          if (from === to) {
            return DONE;
          }
          var idx = reverse ? --to : from++;
          values = iterateNodeOrLeaf(
            array && array[idx], level - SHIFT, offset + (idx << level)
          );
        } while (true);
      };
    }
  }

  function makeList(origin, capacity, level, root, tail, ownerID, hash) {
    var list = Object.create(ListPrototype);
    list.size = capacity - origin;
    list._origin = origin;
    list._capacity = capacity;
    list._level = level;
    list._root = root;
    list._tail = tail;
    list.__ownerID = ownerID;
    list.__hash = hash;
    list.__altered = false;
    return list;
  }

  var EMPTY_LIST;
  function emptyList() {
    return EMPTY_LIST || (EMPTY_LIST = makeList(0, 0, SHIFT));
  }

  function updateList(list, index, value) {
    index = wrapIndex(list, index);

    if (index !== index) {
      return list;
    }

    if (index >= list.size || index < 0) {
      return list.withMutations(function(list ) {
        index < 0 ?
          setListBounds(list, index).set(0, value) :
          setListBounds(list, 0, index + 1).set(index, value)
      });
    }

    index += list._origin;

    var newTail = list._tail;
    var newRoot = list._root;
    var didAlter = MakeRef(DID_ALTER);
    if (index >= getTailOffset(list._capacity)) {
      newTail = updateVNode(newTail, list.__ownerID, 0, index, value, didAlter);
    } else {
      newRoot = updateVNode(newRoot, list.__ownerID, list._level, index, value, didAlter);
    }

    if (!didAlter.value) {
      return list;
    }

    if (list.__ownerID) {
      list._root = newRoot;
      list._tail = newTail;
      list.__hash = undefined;
      list.__altered = true;
      return list;
    }
    return makeList(list._origin, list._capacity, list._level, newRoot, newTail);
  }

  function updateVNode(node, ownerID, level, index, value, didAlter) {
    var idx = (index >>> level) & MASK;
    var nodeHas = node && idx < node.array.length;
    if (!nodeHas && value === undefined) {
      return node;
    }

    var newNode;

    if (level > 0) {
      var lowerNode = node && node.array[idx];
      var newLowerNode = updateVNode(lowerNode, ownerID, level - SHIFT, index, value, didAlter);
      if (newLowerNode === lowerNode) {
        return node;
      }
      newNode = editableVNode(node, ownerID);
      newNode.array[idx] = newLowerNode;
      return newNode;
    }

    if (nodeHas && node.array[idx] === value) {
      return node;
    }

    SetRef(didAlter);

    newNode = editableVNode(node, ownerID);
    if (value === undefined && idx === newNode.array.length - 1) {
      newNode.array.pop();
    } else {
      newNode.array[idx] = value;
    }
    return newNode;
  }

  function editableVNode(node, ownerID) {
    if (ownerID && node && ownerID === node.ownerID) {
      return node;
    }
    return new VNode(node ? node.array.slice() : [], ownerID);
  }

  function listNodeFor(list, rawIndex) {
    if (rawIndex >= getTailOffset(list._capacity)) {
      return list._tail;
    }
    if (rawIndex < 1 << (list._level + SHIFT)) {
      var node = list._root;
      var level = list._level;
      while (node && level > 0) {
        node = node.array[(rawIndex >>> level) & MASK];
        level -= SHIFT;
      }
      return node;
    }
  }

  function setListBounds(list, begin, end) {
    // Sanitize begin & end using this shorthand for ToInt32(argument)
    // http://www.ecma-international.org/ecma-262/6.0/#sec-toint32
    if (begin !== undefined) {
      begin = begin | 0;
    }
    if (end !== undefined) {
      end = end | 0;
    }
    var owner = list.__ownerID || new OwnerID();
    var oldOrigin = list._origin;
    var oldCapacity = list._capacity;
    var newOrigin = oldOrigin + begin;
    var newCapacity = end === undefined ? oldCapacity : end < 0 ? oldCapacity + end : oldOrigin + end;
    if (newOrigin === oldOrigin && newCapacity === oldCapacity) {
      return list;
    }

    // If it's going to end after it starts, it's empty.
    if (newOrigin >= newCapacity) {
      return list.clear();
    }

    var newLevel = list._level;
    var newRoot = list._root;

    // New origin might need creating a higher root.
    var offsetShift = 0;
    while (newOrigin + offsetShift < 0) {
      newRoot = new VNode(newRoot && newRoot.array.length ? [undefined, newRoot] : [], owner);
      newLevel += SHIFT;
      offsetShift += 1 << newLevel;
    }
    if (offsetShift) {
      newOrigin += offsetShift;
      oldOrigin += offsetShift;
      newCapacity += offsetShift;
      oldCapacity += offsetShift;
    }

    var oldTailOffset = getTailOffset(oldCapacity);
    var newTailOffset = getTailOffset(newCapacity);

    // New size might need creating a higher root.
    while (newTailOffset >= 1 << (newLevel + SHIFT)) {
      newRoot = new VNode(newRoot && newRoot.array.length ? [newRoot] : [], owner);
      newLevel += SHIFT;
    }

    // Locate or create the new tail.
    var oldTail = list._tail;
    var newTail = newTailOffset < oldTailOffset ?
      listNodeFor(list, newCapacity - 1) :
      newTailOffset > oldTailOffset ? new VNode([], owner) : oldTail;

    // Merge Tail into tree.
    if (oldTail && newTailOffset > oldTailOffset && newOrigin < oldCapacity && oldTail.array.length) {
      newRoot = editableVNode(newRoot, owner);
      var node = newRoot;
      for (var level = newLevel; level > SHIFT; level -= SHIFT) {
        var idx = (oldTailOffset >>> level) & MASK;
        node = node.array[idx] = editableVNode(node.array[idx], owner);
      }
      node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
    }

    // If the size has been reduced, there's a chance the tail needs to be trimmed.
    if (newCapacity < oldCapacity) {
      newTail = newTail && newTail.removeAfter(owner, 0, newCapacity);
    }

    // If the new origin is within the tail, then we do not need a root.
    if (newOrigin >= newTailOffset) {
      newOrigin -= newTailOffset;
      newCapacity -= newTailOffset;
      newLevel = SHIFT;
      newRoot = null;
      newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);

    // Otherwise, if the root has been trimmed, garbage collect.
    } else if (newOrigin > oldOrigin || newTailOffset < oldTailOffset) {
      offsetShift = 0;

      // Identify the new top root node of the subtree of the old root.
      while (newRoot) {
        var beginIndex = (newOrigin >>> newLevel) & MASK;
        if (beginIndex !== (newTailOffset >>> newLevel) & MASK) {
          break;
        }
        if (beginIndex) {
          offsetShift += (1 << newLevel) * beginIndex;
        }
        newLevel -= SHIFT;
        newRoot = newRoot.array[beginIndex];
      }

      // Trim the new sides of the new root.
      if (newRoot && newOrigin > oldOrigin) {
        newRoot = newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
      }
      if (newRoot && newTailOffset < oldTailOffset) {
        newRoot = newRoot.removeAfter(owner, newLevel, newTailOffset - offsetShift);
      }
      if (offsetShift) {
        newOrigin -= offsetShift;
        newCapacity -= offsetShift;
      }
    }

    if (list.__ownerID) {
      list.size = newCapacity - newOrigin;
      list._origin = newOrigin;
      list._capacity = newCapacity;
      list._level = newLevel;
      list._root = newRoot;
      list._tail = newTail;
      list.__hash = undefined;
      list.__altered = true;
      return list;
    }
    return makeList(newOrigin, newCapacity, newLevel, newRoot, newTail);
  }

  function mergeIntoListWith(list, merger, iterables) {
    var iters = [];
    var maxSize = 0;
    for (var ii = 0; ii < iterables.length; ii++) {
      var value = iterables[ii];
      var iter = IndexedIterable(value);
      if (iter.size > maxSize) {
        maxSize = iter.size;
      }
      if (!isIterable(value)) {
        iter = iter.map(function(v ) {return fromJS(v)});
      }
      iters.push(iter);
    }
    if (maxSize > list.size) {
      list = list.setSize(maxSize);
    }
    return mergeIntoCollectionWith(list, merger, iters);
  }

  function getTailOffset(size) {
    return size < SIZE ? 0 : (((size - 1) >>> SHIFT) << SHIFT);
  }

  createClass(OrderedMap, Map);

    // @pragma Construction

    function OrderedMap(value) {
      return value === null || value === undefined ? emptyOrderedMap() :
        isOrderedMap(value) ? value :
        emptyOrderedMap().withMutations(function(map ) {
          var iter = KeyedIterable(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v, k)  {return map.set(k, v)});
        });
    }

    OrderedMap.of = function(/*...values*/) {
      return this(arguments);
    };

    OrderedMap.prototype.toString = function() {
      return this.__toString('OrderedMap {', '}');
    };

    // @pragma Access

    OrderedMap.prototype.get = function(k, notSetValue) {
      var index = this._map.get(k);
      return index !== undefined ? this._list.get(index)[1] : notSetValue;
    };

    // @pragma Modification

    OrderedMap.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = 0;
        this._map.clear();
        this._list.clear();
        return this;
      }
      return emptyOrderedMap();
    };

    OrderedMap.prototype.set = function(k, v) {
      return updateOrderedMap(this, k, v);
    };

    OrderedMap.prototype.remove = function(k) {
      return updateOrderedMap(this, k, NOT_SET);
    };

    OrderedMap.prototype.wasAltered = function() {
      return this._map.wasAltered() || this._list.wasAltered();
    };

    OrderedMap.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return this._list.__iterate(
        function(entry ) {return entry && fn(entry[1], entry[0], this$0)},
        reverse
      );
    };

    OrderedMap.prototype.__iterator = function(type, reverse) {
      return this._list.fromEntrySeq().__iterator(type, reverse);
    };

    OrderedMap.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      var newMap = this._map.__ensureOwner(ownerID);
      var newList = this._list.__ensureOwner(ownerID);
      if (!ownerID) {
        this.__ownerID = ownerID;
        this._map = newMap;
        this._list = newList;
        return this;
      }
      return makeOrderedMap(newMap, newList, ownerID, this.__hash);
    };


  function isOrderedMap(maybeOrderedMap) {
    return isMap(maybeOrderedMap) && isOrdered(maybeOrderedMap);
  }

  OrderedMap.isOrderedMap = isOrderedMap;

  OrderedMap.prototype[IS_ORDERED_SENTINEL] = true;
  OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;



  function makeOrderedMap(map, list, ownerID, hash) {
    var omap = Object.create(OrderedMap.prototype);
    omap.size = map ? map.size : 0;
    omap._map = map;
    omap._list = list;
    omap.__ownerID = ownerID;
    omap.__hash = hash;
    return omap;
  }

  var EMPTY_ORDERED_MAP;
  function emptyOrderedMap() {
    return EMPTY_ORDERED_MAP || (EMPTY_ORDERED_MAP = makeOrderedMap(emptyMap(), emptyList()));
  }

  function updateOrderedMap(omap, k, v) {
    var map = omap._map;
    var list = omap._list;
    var i = map.get(k);
    var has = i !== undefined;
    var newMap;
    var newList;
    if (v === NOT_SET) { // removed
      if (!has) {
        return omap;
      }
      if (list.size >= SIZE && list.size >= map.size * 2) {
        newList = list.filter(function(entry, idx)  {return entry !== undefined && i !== idx});
        newMap = newList.toKeyedSeq().map(function(entry ) {return entry[0]}).flip().toMap();
        if (omap.__ownerID) {
          newMap.__ownerID = newList.__ownerID = omap.__ownerID;
        }
      } else {
        newMap = map.remove(k);
        newList = i === list.size - 1 ? list.pop() : list.set(i, undefined);
      }
    } else {
      if (has) {
        if (v === list.get(i)[1]) {
          return omap;
        }
        newMap = map;
        newList = list.set(i, [k, v]);
      } else {
        newMap = map.set(k, list.size);
        newList = list.set(list.size, [k, v]);
      }
    }
    if (omap.__ownerID) {
      omap.size = newMap.size;
      omap._map = newMap;
      omap._list = newList;
      omap.__hash = undefined;
      return omap;
    }
    return makeOrderedMap(newMap, newList);
  }

  createClass(ToKeyedSequence, KeyedSeq);
    function ToKeyedSequence(indexed, useKeys) {
      this._iter = indexed;
      this._useKeys = useKeys;
      this.size = indexed.size;
    }

    ToKeyedSequence.prototype.get = function(key, notSetValue) {
      return this._iter.get(key, notSetValue);
    };

    ToKeyedSequence.prototype.has = function(key) {
      return this._iter.has(key);
    };

    ToKeyedSequence.prototype.valueSeq = function() {
      return this._iter.valueSeq();
    };

    ToKeyedSequence.prototype.reverse = function() {var this$0 = this;
      var reversedSequence = reverseFactory(this, true);
      if (!this._useKeys) {
        reversedSequence.valueSeq = function()  {return this$0._iter.toSeq().reverse()};
      }
      return reversedSequence;
    };

    ToKeyedSequence.prototype.map = function(mapper, context) {var this$0 = this;
      var mappedSequence = mapFactory(this, mapper, context);
      if (!this._useKeys) {
        mappedSequence.valueSeq = function()  {return this$0._iter.toSeq().map(mapper, context)};
      }
      return mappedSequence;
    };

    ToKeyedSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      var ii;
      return this._iter.__iterate(
        this._useKeys ?
          function(v, k)  {return fn(v, k, this$0)} :
          ((ii = reverse ? resolveSize(this) : 0),
            function(v ) {return fn(v, reverse ? --ii : ii++, this$0)}),
        reverse
      );
    };

    ToKeyedSequence.prototype.__iterator = function(type, reverse) {
      if (this._useKeys) {
        return this._iter.__iterator(type, reverse);
      }
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      var ii = reverse ? resolveSize(this) : 0;
      return new Iterator(function()  {
        var step = iterator.next();
        return step.done ? step :
          iteratorValue(type, reverse ? --ii : ii++, step.value, step);
      });
    };

  ToKeyedSequence.prototype[IS_ORDERED_SENTINEL] = true;


  createClass(ToIndexedSequence, IndexedSeq);
    function ToIndexedSequence(iter) {
      this._iter = iter;
      this.size = iter.size;
    }

    ToIndexedSequence.prototype.includes = function(value) {
      return this._iter.includes(value);
    };

    ToIndexedSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      var iterations = 0;
      return this._iter.__iterate(function(v ) {return fn(v, iterations++, this$0)}, reverse);
    };

    ToIndexedSequence.prototype.__iterator = function(type, reverse) {
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      var iterations = 0;
      return new Iterator(function()  {
        var step = iterator.next();
        return step.done ? step :
          iteratorValue(type, iterations++, step.value, step)
      });
    };



  createClass(ToSetSequence, SetSeq);
    function ToSetSequence(iter) {
      this._iter = iter;
      this.size = iter.size;
    }

    ToSetSequence.prototype.has = function(key) {
      return this._iter.includes(key);
    };

    ToSetSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return this._iter.__iterate(function(v ) {return fn(v, v, this$0)}, reverse);
    };

    ToSetSequence.prototype.__iterator = function(type, reverse) {
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      return new Iterator(function()  {
        var step = iterator.next();
        return step.done ? step :
          iteratorValue(type, step.value, step.value, step);
      });
    };



  createClass(FromEntriesSequence, KeyedSeq);
    function FromEntriesSequence(entries) {
      this._iter = entries;
      this.size = entries.size;
    }

    FromEntriesSequence.prototype.entrySeq = function() {
      return this._iter.toSeq();
    };

    FromEntriesSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return this._iter.__iterate(function(entry ) {
        // Check if entry exists first so array access doesn't throw for holes
        // in the parent iteration.
        if (entry) {
          validateEntry(entry);
          var indexedIterable = isIterable(entry);
          return fn(
            indexedIterable ? entry.get(1) : entry[1],
            indexedIterable ? entry.get(0) : entry[0],
            this$0
          );
        }
      }, reverse);
    };

    FromEntriesSequence.prototype.__iterator = function(type, reverse) {
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      return new Iterator(function()  {
        while (true) {
          var step = iterator.next();
          if (step.done) {
            return step;
          }
          var entry = step.value;
          // Check if entry exists first so array access doesn't throw for holes
          // in the parent iteration.
          if (entry) {
            validateEntry(entry);
            var indexedIterable = isIterable(entry);
            return iteratorValue(
              type,
              indexedIterable ? entry.get(0) : entry[0],
              indexedIterable ? entry.get(1) : entry[1],
              step
            );
          }
        }
      });
    };


  ToIndexedSequence.prototype.cacheResult =
  ToKeyedSequence.prototype.cacheResult =
  ToSetSequence.prototype.cacheResult =
  FromEntriesSequence.prototype.cacheResult =
    cacheResultThrough;


  function flipFactory(iterable) {
    var flipSequence = makeSequence(iterable);
    flipSequence._iter = iterable;
    flipSequence.size = iterable.size;
    flipSequence.flip = function()  {return iterable};
    flipSequence.reverse = function () {
      var reversedSequence = iterable.reverse.apply(this); // super.reverse()
      reversedSequence.flip = function()  {return iterable.reverse()};
      return reversedSequence;
    };
    flipSequence.has = function(key ) {return iterable.includes(key)};
    flipSequence.includes = function(key ) {return iterable.has(key)};
    flipSequence.cacheResult = cacheResultThrough;
    flipSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
      return iterable.__iterate(function(v, k)  {return fn(k, v, this$0) !== false}, reverse);
    }
    flipSequence.__iteratorUncached = function(type, reverse) {
      if (type === ITERATE_ENTRIES) {
        var iterator = iterable.__iterator(type, reverse);
        return new Iterator(function()  {
          var step = iterator.next();
          if (!step.done) {
            var k = step.value[0];
            step.value[0] = step.value[1];
            step.value[1] = k;
          }
          return step;
        });
      }
      return iterable.__iterator(
        type === ITERATE_VALUES ? ITERATE_KEYS : ITERATE_VALUES,
        reverse
      );
    }
    return flipSequence;
  }


  function mapFactory(iterable, mapper, context) {
    var mappedSequence = makeSequence(iterable);
    mappedSequence.size = iterable.size;
    mappedSequence.has = function(key ) {return iterable.has(key)};
    mappedSequence.get = function(key, notSetValue)  {
      var v = iterable.get(key, NOT_SET);
      return v === NOT_SET ?
        notSetValue :
        mapper.call(context, v, key, iterable);
    };
    mappedSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
      return iterable.__iterate(
        function(v, k, c)  {return fn(mapper.call(context, v, k, c), k, this$0) !== false},
        reverse
      );
    }
    mappedSequence.__iteratorUncached = function (type, reverse) {
      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
      return new Iterator(function()  {
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        var key = entry[0];
        return iteratorValue(
          type,
          key,
          mapper.call(context, entry[1], key, iterable),
          step
        );
      });
    }
    return mappedSequence;
  }


  function reverseFactory(iterable, useKeys) {
    var reversedSequence = makeSequence(iterable);
    reversedSequence._iter = iterable;
    reversedSequence.size = iterable.size;
    reversedSequence.reverse = function()  {return iterable};
    if (iterable.flip) {
      reversedSequence.flip = function () {
        var flipSequence = flipFactory(iterable);
        flipSequence.reverse = function()  {return iterable.flip()};
        return flipSequence;
      };
    }
    reversedSequence.get = function(key, notSetValue) 
      {return iterable.get(useKeys ? key : -1 - key, notSetValue)};
    reversedSequence.has = function(key )
      {return iterable.has(useKeys ? key : -1 - key)};
    reversedSequence.includes = function(value ) {return iterable.includes(value)};
    reversedSequence.cacheResult = cacheResultThrough;
    reversedSequence.__iterate = function (fn, reverse) {var this$0 = this;
      return iterable.__iterate(function(v, k)  {return fn(v, k, this$0)}, !reverse);
    };
    reversedSequence.__iterator =
      function(type, reverse)  {return iterable.__iterator(type, !reverse)};
    return reversedSequence;
  }


  function filterFactory(iterable, predicate, context, useKeys) {
    var filterSequence = makeSequence(iterable);
    if (useKeys) {
      filterSequence.has = function(key ) {
        var v = iterable.get(key, NOT_SET);
        return v !== NOT_SET && !!predicate.call(context, v, key, iterable);
      };
      filterSequence.get = function(key, notSetValue)  {
        var v = iterable.get(key, NOT_SET);
        return v !== NOT_SET && predicate.call(context, v, key, iterable) ?
          v : notSetValue;
      };
    }
    filterSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
      var iterations = 0;
      iterable.__iterate(function(v, k, c)  {
        if (predicate.call(context, v, k, c)) {
          iterations++;
          return fn(v, useKeys ? k : iterations - 1, this$0);
        }
      }, reverse);
      return iterations;
    };
    filterSequence.__iteratorUncached = function (type, reverse) {
      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
      var iterations = 0;
      return new Iterator(function()  {
        while (true) {
          var step = iterator.next();
          if (step.done) {
            return step;
          }
          var entry = step.value;
          var key = entry[0];
          var value = entry[1];
          if (predicate.call(context, value, key, iterable)) {
            return iteratorValue(type, useKeys ? key : iterations++, value, step);
          }
        }
      });
    }
    return filterSequence;
  }


  function countByFactory(iterable, grouper, context) {
    var groups = Map().asMutable();
    iterable.__iterate(function(v, k)  {
      groups.update(
        grouper.call(context, v, k, iterable),
        0,
        function(a ) {return a + 1}
      );
    });
    return groups.asImmutable();
  }


  function groupByFactory(iterable, grouper, context) {
    var isKeyedIter = isKeyed(iterable);
    var groups = (isOrdered(iterable) ? OrderedMap() : Map()).asMutable();
    iterable.__iterate(function(v, k)  {
      groups.update(
        grouper.call(context, v, k, iterable),
        function(a ) {return (a = a || [], a.push(isKeyedIter ? [k, v] : v), a)}
      );
    });
    var coerce = iterableClass(iterable);
    return groups.map(function(arr ) {return reify(iterable, coerce(arr))});
  }


  function sliceFactory(iterable, begin, end, useKeys) {
    var originalSize = iterable.size;

    // Sanitize begin & end using this shorthand for ToInt32(argument)
    // http://www.ecma-international.org/ecma-262/6.0/#sec-toint32
    if (begin !== undefined) {
      begin = begin | 0;
    }
    if (end !== undefined) {
      if (end === Infinity) {
        end = originalSize;
      } else {
        end = end | 0;
      }
    }

    if (wholeSlice(begin, end, originalSize)) {
      return iterable;
    }

    var resolvedBegin = resolveBegin(begin, originalSize);
    var resolvedEnd = resolveEnd(end, originalSize);

    // begin or end will be NaN if they were provided as negative numbers and
    // this iterable's size is unknown. In that case, cache first so there is
    // a known size and these do not resolve to NaN.
    if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd) {
      return sliceFactory(iterable.toSeq().cacheResult(), begin, end, useKeys);
    }

    // Note: resolvedEnd is undefined when the original sequence's length is
    // unknown and this slice did not supply an end and should contain all
    // elements after resolvedBegin.
    // In that case, resolvedSize will be NaN and sliceSize will remain undefined.
    var resolvedSize = resolvedEnd - resolvedBegin;
    var sliceSize;
    if (resolvedSize === resolvedSize) {
      sliceSize = resolvedSize < 0 ? 0 : resolvedSize;
    }

    var sliceSeq = makeSequence(iterable);

    // If iterable.size is undefined, the size of the realized sliceSeq is
    // unknown at this point unless the number of items to slice is 0
    sliceSeq.size = sliceSize === 0 ? sliceSize : iterable.size && sliceSize || undefined;

    if (!useKeys && isSeq(iterable) && sliceSize >= 0) {
      sliceSeq.get = function (index, notSetValue) {
        index = wrapIndex(this, index);
        return index >= 0 && index < sliceSize ?
          iterable.get(index + resolvedBegin, notSetValue) :
          notSetValue;
      }
    }

    sliceSeq.__iterateUncached = function(fn, reverse) {var this$0 = this;
      if (sliceSize === 0) {
        return 0;
      }
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var skipped = 0;
      var isSkipping = true;
      var iterations = 0;
      iterable.__iterate(function(v, k)  {
        if (!(isSkipping && (isSkipping = skipped++ < resolvedBegin))) {
          iterations++;
          return fn(v, useKeys ? k : iterations - 1, this$0) !== false &&
                 iterations !== sliceSize;
        }
      });
      return iterations;
    };

    sliceSeq.__iteratorUncached = function(type, reverse) {
      if (sliceSize !== 0 && reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      // Don't bother instantiating parent iterator if taking 0.
      var iterator = sliceSize !== 0 && iterable.__iterator(type, reverse);
      var skipped = 0;
      var iterations = 0;
      return new Iterator(function()  {
        while (skipped++ < resolvedBegin) {
          iterator.next();
        }
        if (++iterations > sliceSize) {
          return iteratorDone();
        }
        var step = iterator.next();
        if (useKeys || type === ITERATE_VALUES) {
          return step;
        } else if (type === ITERATE_KEYS) {
          return iteratorValue(type, iterations - 1, undefined, step);
        } else {
          return iteratorValue(type, iterations - 1, step.value[1], step);
        }
      });
    }

    return sliceSeq;
  }


  function takeWhileFactory(iterable, predicate, context) {
    var takeSequence = makeSequence(iterable);
    takeSequence.__iterateUncached = function(fn, reverse) {var this$0 = this;
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var iterations = 0;
      iterable.__iterate(function(v, k, c) 
        {return predicate.call(context, v, k, c) && ++iterations && fn(v, k, this$0)}
      );
      return iterations;
    };
    takeSequence.__iteratorUncached = function(type, reverse) {var this$0 = this;
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
      var iterating = true;
      return new Iterator(function()  {
        if (!iterating) {
          return iteratorDone();
        }
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        var k = entry[0];
        var v = entry[1];
        if (!predicate.call(context, v, k, this$0)) {
          iterating = false;
          return iteratorDone();
        }
        return type === ITERATE_ENTRIES ? step :
          iteratorValue(type, k, v, step);
      });
    };
    return takeSequence;
  }


  function skipWhileFactory(iterable, predicate, context, useKeys) {
    var skipSequence = makeSequence(iterable);
    skipSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var isSkipping = true;
      var iterations = 0;
      iterable.__iterate(function(v, k, c)  {
        if (!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))) {
          iterations++;
          return fn(v, useKeys ? k : iterations - 1, this$0);
        }
      });
      return iterations;
    };
    skipSequence.__iteratorUncached = function(type, reverse) {var this$0 = this;
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
      var skipping = true;
      var iterations = 0;
      return new Iterator(function()  {
        var step, k, v;
        do {
          step = iterator.next();
          if (step.done) {
            if (useKeys || type === ITERATE_VALUES) {
              return step;
            } else if (type === ITERATE_KEYS) {
              return iteratorValue(type, iterations++, undefined, step);
            } else {
              return iteratorValue(type, iterations++, step.value[1], step);
            }
          }
          var entry = step.value;
          k = entry[0];
          v = entry[1];
          skipping && (skipping = predicate.call(context, v, k, this$0));
        } while (skipping);
        return type === ITERATE_ENTRIES ? step :
          iteratorValue(type, k, v, step);
      });
    };
    return skipSequence;
  }


  function concatFactory(iterable, values) {
    var isKeyedIterable = isKeyed(iterable);
    var iters = [iterable].concat(values).map(function(v ) {
      if (!isIterable(v)) {
        v = isKeyedIterable ?
          keyedSeqFromValue(v) :
          indexedSeqFromValue(Array.isArray(v) ? v : [v]);
      } else if (isKeyedIterable) {
        v = KeyedIterable(v);
      }
      return v;
    }).filter(function(v ) {return v.size !== 0});

    if (iters.length === 0) {
      return iterable;
    }

    if (iters.length === 1) {
      var singleton = iters[0];
      if (singleton === iterable ||
          isKeyedIterable && isKeyed(singleton) ||
          isIndexed(iterable) && isIndexed(singleton)) {
        return singleton;
      }
    }

    var concatSeq = new ArraySeq(iters);
    if (isKeyedIterable) {
      concatSeq = concatSeq.toKeyedSeq();
    } else if (!isIndexed(iterable)) {
      concatSeq = concatSeq.toSetSeq();
    }
    concatSeq = concatSeq.flatten(true);
    concatSeq.size = iters.reduce(
      function(sum, seq)  {
        if (sum !== undefined) {
          var size = seq.size;
          if (size !== undefined) {
            return sum + size;
          }
        }
      },
      0
    );
    return concatSeq;
  }


  function flattenFactory(iterable, depth, useKeys) {
    var flatSequence = makeSequence(iterable);
    flatSequence.__iterateUncached = function(fn, reverse) {
      var iterations = 0;
      var stopped = false;
      function flatDeep(iter, currentDepth) {var this$0 = this;
        iter.__iterate(function(v, k)  {
          if ((!depth || currentDepth < depth) && isIterable(v)) {
            flatDeep(v, currentDepth + 1);
          } else if (fn(v, useKeys ? k : iterations++, this$0) === false) {
            stopped = true;
          }
          return !stopped;
        }, reverse);
      }
      flatDeep(iterable, 0);
      return iterations;
    }
    flatSequence.__iteratorUncached = function(type, reverse) {
      var iterator = iterable.__iterator(type, reverse);
      var stack = [];
      var iterations = 0;
      return new Iterator(function()  {
        while (iterator) {
          var step = iterator.next();
          if (step.done !== false) {
            iterator = stack.pop();
            continue;
          }
          var v = step.value;
          if (type === ITERATE_ENTRIES) {
            v = v[1];
          }
          if ((!depth || stack.length < depth) && isIterable(v)) {
            stack.push(iterator);
            iterator = v.__iterator(type, reverse);
          } else {
            return useKeys ? step : iteratorValue(type, iterations++, v, step);
          }
        }
        return iteratorDone();
      });
    }
    return flatSequence;
  }


  function flatMapFactory(iterable, mapper, context) {
    var coerce = iterableClass(iterable);
    return iterable.toSeq().map(
      function(v, k)  {return coerce(mapper.call(context, v, k, iterable))}
    ).flatten(true);
  }


  function interposeFactory(iterable, separator) {
    var interposedSequence = makeSequence(iterable);
    interposedSequence.size = iterable.size && iterable.size * 2 -1;
    interposedSequence.__iterateUncached = function(fn, reverse) {var this$0 = this;
      var iterations = 0;
      iterable.__iterate(function(v, k) 
        {return (!iterations || fn(separator, iterations++, this$0) !== false) &&
        fn(v, iterations++, this$0) !== false},
        reverse
      );
      return iterations;
    };
    interposedSequence.__iteratorUncached = function(type, reverse) {
      var iterator = iterable.__iterator(ITERATE_VALUES, reverse);
      var iterations = 0;
      var step;
      return new Iterator(function()  {
        if (!step || iterations % 2) {
          step = iterator.next();
          if (step.done) {
            return step;
          }
        }
        return iterations % 2 ?
          iteratorValue(type, iterations++, separator) :
          iteratorValue(type, iterations++, step.value, step);
      });
    };
    return interposedSequence;
  }


  function sortFactory(iterable, comparator, mapper) {
    if (!comparator) {
      comparator = defaultComparator;
    }
    var isKeyedIterable = isKeyed(iterable);
    var index = 0;
    var entries = iterable.toSeq().map(
      function(v, k)  {return [k, v, index++, mapper ? mapper(v, k, iterable) : v]}
    ).toArray();
    entries.sort(function(a, b)  {return comparator(a[3], b[3]) || a[2] - b[2]}).forEach(
      isKeyedIterable ?
      function(v, i)  { entries[i].length = 2; } :
      function(v, i)  { entries[i] = v[1]; }
    );
    return isKeyedIterable ? KeyedSeq(entries) :
      isIndexed(iterable) ? IndexedSeq(entries) :
      SetSeq(entries);
  }


  function maxFactory(iterable, comparator, mapper) {
    if (!comparator) {
      comparator = defaultComparator;
    }
    if (mapper) {
      var entry = iterable.toSeq()
        .map(function(v, k)  {return [v, mapper(v, k, iterable)]})
        .reduce(function(a, b)  {return maxCompare(comparator, a[1], b[1]) ? b : a});
      return entry && entry[0];
    } else {
      return iterable.reduce(function(a, b)  {return maxCompare(comparator, a, b) ? b : a});
    }
  }

  function maxCompare(comparator, a, b) {
    var comp = comparator(b, a);
    // b is considered the new max if the comparator declares them equal, but
    // they are not equal and b is in fact a nullish value.
    return (comp === 0 && b !== a && (b === undefined || b === null || b !== b)) || comp > 0;
  }


  function zipWithFactory(keyIter, zipper, iters) {
    var zipSequence = makeSequence(keyIter);
    zipSequence.size = new ArraySeq(iters).map(function(i ) {return i.size}).min();
    // Note: this a generic base implementation of __iterate in terms of
    // __iterator which may be more generically useful in the future.
    zipSequence.__iterate = function(fn, reverse) {
      /* generic:
      var iterator = this.__iterator(ITERATE_ENTRIES, reverse);
      var step;
      var iterations = 0;
      while (!(step = iterator.next()).done) {
        iterations++;
        if (fn(step.value[1], step.value[0], this) === false) {
          break;
        }
      }
      return iterations;
      */
      // indexed:
      var iterator = this.__iterator(ITERATE_VALUES, reverse);
      var step;
      var iterations = 0;
      while (!(step = iterator.next()).done) {
        if (fn(step.value, iterations++, this) === false) {
          break;
        }
      }
      return iterations;
    };
    zipSequence.__iteratorUncached = function(type, reverse) {
      var iterators = iters.map(function(i )
        {return (i = Iterable(i), getIterator(reverse ? i.reverse() : i))}
      );
      var iterations = 0;
      var isDone = false;
      return new Iterator(function()  {
        var steps;
        if (!isDone) {
          steps = iterators.map(function(i ) {return i.next()});
          isDone = steps.some(function(s ) {return s.done});
        }
        if (isDone) {
          return iteratorDone();
        }
        return iteratorValue(
          type,
          iterations++,
          zipper.apply(null, steps.map(function(s ) {return s.value}))
        );
      });
    };
    return zipSequence
  }


  // #pragma Helper Functions

  function reify(iter, seq) {
    return isSeq(iter) ? seq : iter.constructor(seq);
  }

  function validateEntry(entry) {
    if (entry !== Object(entry)) {
      throw new TypeError('Expected [K, V] tuple: ' + entry);
    }
  }

  function resolveSize(iter) {
    assertNotInfinite(iter.size);
    return ensureSize(iter);
  }

  function iterableClass(iterable) {
    return isKeyed(iterable) ? KeyedIterable :
      isIndexed(iterable) ? IndexedIterable :
      SetIterable;
  }

  function makeSequence(iterable) {
    return Object.create(
      (
        isKeyed(iterable) ? KeyedSeq :
        isIndexed(iterable) ? IndexedSeq :
        SetSeq
      ).prototype
    );
  }

  function cacheResultThrough() {
    if (this._iter.cacheResult) {
      this._iter.cacheResult();
      this.size = this._iter.size;
      return this;
    } else {
      return Seq.prototype.cacheResult.call(this);
    }
  }

  function defaultComparator(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
  }

  function forceIterator(keyPath) {
    var iter = getIterator(keyPath);
    if (!iter) {
      // Array might not be iterable in this environment, so we need a fallback
      // to our wrapped type.
      if (!isArrayLike(keyPath)) {
        throw new TypeError('Expected iterable or array-like: ' + keyPath);
      }
      iter = getIterator(Iterable(keyPath));
    }
    return iter;
  }

  createClass(Record, KeyedCollection);

    function Record(defaultValues, name) {
      var hasInitialized;

      var RecordType = function Record(values) {
        if (values instanceof RecordType) {
          return values;
        }
        if (!(this instanceof RecordType)) {
          return new RecordType(values);
        }
        if (!hasInitialized) {
          hasInitialized = true;
          var keys = Object.keys(defaultValues);
          setProps(RecordTypePrototype, keys);
          RecordTypePrototype.size = keys.length;
          RecordTypePrototype._name = name;
          RecordTypePrototype._keys = keys;
          RecordTypePrototype._defaultValues = defaultValues;
        }
        this._map = Map(values);
      };

      var RecordTypePrototype = RecordType.prototype = Object.create(RecordPrototype);
      RecordTypePrototype.constructor = RecordType;

      return RecordType;
    }

    Record.prototype.toString = function() {
      return this.__toString(recordName(this) + ' {', '}');
    };

    // @pragma Access

    Record.prototype.has = function(k) {
      return this._defaultValues.hasOwnProperty(k);
    };

    Record.prototype.get = function(k, notSetValue) {
      if (!this.has(k)) {
        return notSetValue;
      }
      var defaultVal = this._defaultValues[k];
      return this._map ? this._map.get(k, defaultVal) : defaultVal;
    };

    // @pragma Modification

    Record.prototype.clear = function() {
      if (this.__ownerID) {
        this._map && this._map.clear();
        return this;
      }
      var RecordType = this.constructor;
      return RecordType._empty || (RecordType._empty = makeRecord(this, emptyMap()));
    };

    Record.prototype.set = function(k, v) {
      if (!this.has(k)) {
        throw new Error('Cannot set unknown key "' + k + '" on ' + recordName(this));
      }
      if (this._map && !this._map.has(k)) {
        var defaultVal = this._defaultValues[k];
        if (v === defaultVal) {
          return this;
        }
      }
      var newMap = this._map && this._map.set(k, v);
      if (this.__ownerID || newMap === this._map) {
        return this;
      }
      return makeRecord(this, newMap);
    };

    Record.prototype.remove = function(k) {
      if (!this.has(k)) {
        return this;
      }
      var newMap = this._map && this._map.remove(k);
      if (this.__ownerID || newMap === this._map) {
        return this;
      }
      return makeRecord(this, newMap);
    };

    Record.prototype.wasAltered = function() {
      return this._map.wasAltered();
    };

    Record.prototype.__iterator = function(type, reverse) {var this$0 = this;
      return KeyedIterable(this._defaultValues).map(function(_, k)  {return this$0.get(k)}).__iterator(type, reverse);
    };

    Record.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return KeyedIterable(this._defaultValues).map(function(_, k)  {return this$0.get(k)}).__iterate(fn, reverse);
    };

    Record.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      var newMap = this._map && this._map.__ensureOwner(ownerID);
      if (!ownerID) {
        this.__ownerID = ownerID;
        this._map = newMap;
        return this;
      }
      return makeRecord(this, newMap, ownerID);
    };


  var RecordPrototype = Record.prototype;
  RecordPrototype[DELETE] = RecordPrototype.remove;
  RecordPrototype.deleteIn =
  RecordPrototype.removeIn = MapPrototype.removeIn;
  RecordPrototype.merge = MapPrototype.merge;
  RecordPrototype.mergeWith = MapPrototype.mergeWith;
  RecordPrototype.mergeIn = MapPrototype.mergeIn;
  RecordPrototype.mergeDeep = MapPrototype.mergeDeep;
  RecordPrototype.mergeDeepWith = MapPrototype.mergeDeepWith;
  RecordPrototype.mergeDeepIn = MapPrototype.mergeDeepIn;
  RecordPrototype.setIn = MapPrototype.setIn;
  RecordPrototype.update = MapPrototype.update;
  RecordPrototype.updateIn = MapPrototype.updateIn;
  RecordPrototype.withMutations = MapPrototype.withMutations;
  RecordPrototype.asMutable = MapPrototype.asMutable;
  RecordPrototype.asImmutable = MapPrototype.asImmutable;


  function makeRecord(likeRecord, map, ownerID) {
    var record = Object.create(Object.getPrototypeOf(likeRecord));
    record._map = map;
    record.__ownerID = ownerID;
    return record;
  }

  function recordName(record) {
    return record._name || record.constructor.name || 'Record';
  }

  function setProps(prototype, names) {
    try {
      names.forEach(setProp.bind(undefined, prototype));
    } catch (error) {
      // Object.defineProperty failed. Probably IE8.
    }
  }

  function setProp(prototype, name) {
    Object.defineProperty(prototype, name, {
      get: function() {
        return this.get(name);
      },
      set: function(value) {
        invariant(this.__ownerID, 'Cannot set on an immutable record.');
        this.set(name, value);
      }
    });
  }

  createClass(Set, SetCollection);

    // @pragma Construction

    function Set(value) {
      return value === null || value === undefined ? emptySet() :
        isSet(value) && !isOrdered(value) ? value :
        emptySet().withMutations(function(set ) {
          var iter = SetIterable(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v ) {return set.add(v)});
        });
    }

    Set.of = function(/*...values*/) {
      return this(arguments);
    };

    Set.fromKeys = function(value) {
      return this(KeyedIterable(value).keySeq());
    };

    Set.prototype.toString = function() {
      return this.__toString('Set {', '}');
    };

    // @pragma Access

    Set.prototype.has = function(value) {
      return this._map.has(value);
    };

    // @pragma Modification

    Set.prototype.add = function(value) {
      return updateSet(this, this._map.set(value, true));
    };

    Set.prototype.remove = function(value) {
      return updateSet(this, this._map.remove(value));
    };

    Set.prototype.clear = function() {
      return updateSet(this, this._map.clear());
    };

    // @pragma Composition

    Set.prototype.union = function() {var iters = SLICE$0.call(arguments, 0);
      iters = iters.filter(function(x ) {return x.size !== 0});
      if (iters.length === 0) {
        return this;
      }
      if (this.size === 0 && !this.__ownerID && iters.length === 1) {
        return this.constructor(iters[0]);
      }
      return this.withMutations(function(set ) {
        for (var ii = 0; ii < iters.length; ii++) {
          SetIterable(iters[ii]).forEach(function(value ) {return set.add(value)});
        }
      });
    };

    Set.prototype.intersect = function() {var iters = SLICE$0.call(arguments, 0);
      if (iters.length === 0) {
        return this;
      }
      iters = iters.map(function(iter ) {return SetIterable(iter)});
      var originalSet = this;
      return this.withMutations(function(set ) {
        originalSet.forEach(function(value ) {
          if (!iters.every(function(iter ) {return iter.includes(value)})) {
            set.remove(value);
          }
        });
      });
    };

    Set.prototype.subtract = function() {var iters = SLICE$0.call(arguments, 0);
      if (iters.length === 0) {
        return this;
      }
      iters = iters.map(function(iter ) {return SetIterable(iter)});
      var originalSet = this;
      return this.withMutations(function(set ) {
        originalSet.forEach(function(value ) {
          if (iters.some(function(iter ) {return iter.includes(value)})) {
            set.remove(value);
          }
        });
      });
    };

    Set.prototype.merge = function() {
      return this.union.apply(this, arguments);
    };

    Set.prototype.mergeWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return this.union.apply(this, iters);
    };

    Set.prototype.sort = function(comparator) {
      // Late binding
      return OrderedSet(sortFactory(this, comparator));
    };

    Set.prototype.sortBy = function(mapper, comparator) {
      // Late binding
      return OrderedSet(sortFactory(this, comparator, mapper));
    };

    Set.prototype.wasAltered = function() {
      return this._map.wasAltered();
    };

    Set.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return this._map.__iterate(function(_, k)  {return fn(k, k, this$0)}, reverse);
    };

    Set.prototype.__iterator = function(type, reverse) {
      return this._map.map(function(_, k)  {return k}).__iterator(type, reverse);
    };

    Set.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      var newMap = this._map.__ensureOwner(ownerID);
      if (!ownerID) {
        this.__ownerID = ownerID;
        this._map = newMap;
        return this;
      }
      return this.__make(newMap, ownerID);
    };


  function isSet(maybeSet) {
    return !!(maybeSet && maybeSet[IS_SET_SENTINEL]);
  }

  Set.isSet = isSet;

  var IS_SET_SENTINEL = '@@__IMMUTABLE_SET__@@';

  var SetPrototype = Set.prototype;
  SetPrototype[IS_SET_SENTINEL] = true;
  SetPrototype[DELETE] = SetPrototype.remove;
  SetPrototype.mergeDeep = SetPrototype.merge;
  SetPrototype.mergeDeepWith = SetPrototype.mergeWith;
  SetPrototype.withMutations = MapPrototype.withMutations;
  SetPrototype.asMutable = MapPrototype.asMutable;
  SetPrototype.asImmutable = MapPrototype.asImmutable;

  SetPrototype.__empty = emptySet;
  SetPrototype.__make = makeSet;

  function updateSet(set, newMap) {
    if (set.__ownerID) {
      set.size = newMap.size;
      set._map = newMap;
      return set;
    }
    return newMap === set._map ? set :
      newMap.size === 0 ? set.__empty() :
      set.__make(newMap);
  }

  function makeSet(map, ownerID) {
    var set = Object.create(SetPrototype);
    set.size = map ? map.size : 0;
    set._map = map;
    set.__ownerID = ownerID;
    return set;
  }

  var EMPTY_SET;
  function emptySet() {
    return EMPTY_SET || (EMPTY_SET = makeSet(emptyMap()));
  }

  createClass(OrderedSet, Set);

    // @pragma Construction

    function OrderedSet(value) {
      return value === null || value === undefined ? emptyOrderedSet() :
        isOrderedSet(value) ? value :
        emptyOrderedSet().withMutations(function(set ) {
          var iter = SetIterable(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v ) {return set.add(v)});
        });
    }

    OrderedSet.of = function(/*...values*/) {
      return this(arguments);
    };

    OrderedSet.fromKeys = function(value) {
      return this(KeyedIterable(value).keySeq());
    };

    OrderedSet.prototype.toString = function() {
      return this.__toString('OrderedSet {', '}');
    };


  function isOrderedSet(maybeOrderedSet) {
    return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);
  }

  OrderedSet.isOrderedSet = isOrderedSet;

  var OrderedSetPrototype = OrderedSet.prototype;
  OrderedSetPrototype[IS_ORDERED_SENTINEL] = true;

  OrderedSetPrototype.__empty = emptyOrderedSet;
  OrderedSetPrototype.__make = makeOrderedSet;

  function makeOrderedSet(map, ownerID) {
    var set = Object.create(OrderedSetPrototype);
    set.size = map ? map.size : 0;
    set._map = map;
    set.__ownerID = ownerID;
    return set;
  }

  var EMPTY_ORDERED_SET;
  function emptyOrderedSet() {
    return EMPTY_ORDERED_SET || (EMPTY_ORDERED_SET = makeOrderedSet(emptyOrderedMap()));
  }

  createClass(Stack, IndexedCollection);

    // @pragma Construction

    function Stack(value) {
      return value === null || value === undefined ? emptyStack() :
        isStack(value) ? value :
        emptyStack().unshiftAll(value);
    }

    Stack.of = function(/*...values*/) {
      return this(arguments);
    };

    Stack.prototype.toString = function() {
      return this.__toString('Stack [', ']');
    };

    // @pragma Access

    Stack.prototype.get = function(index, notSetValue) {
      var head = this._head;
      index = wrapIndex(this, index);
      while (head && index--) {
        head = head.next;
      }
      return head ? head.value : notSetValue;
    };

    Stack.prototype.peek = function() {
      return this._head && this._head.value;
    };

    // @pragma Modification

    Stack.prototype.push = function(/*...values*/) {
      if (arguments.length === 0) {
        return this;
      }
      var newSize = this.size + arguments.length;
      var head = this._head;
      for (var ii = arguments.length - 1; ii >= 0; ii--) {
        head = {
          value: arguments[ii],
          next: head
        };
      }
      if (this.__ownerID) {
        this.size = newSize;
        this._head = head;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return makeStack(newSize, head);
    };

    Stack.prototype.pushAll = function(iter) {
      iter = IndexedIterable(iter);
      if (iter.size === 0) {
        return this;
      }
      assertNotInfinite(iter.size);
      var newSize = this.size;
      var head = this._head;
      iter.reverse().forEach(function(value ) {
        newSize++;
        head = {
          value: value,
          next: head
        };
      });
      if (this.__ownerID) {
        this.size = newSize;
        this._head = head;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return makeStack(newSize, head);
    };

    Stack.prototype.pop = function() {
      return this.slice(1);
    };

    Stack.prototype.unshift = function(/*...values*/) {
      return this.push.apply(this, arguments);
    };

    Stack.prototype.unshiftAll = function(iter) {
      return this.pushAll(iter);
    };

    Stack.prototype.shift = function() {
      return this.pop.apply(this, arguments);
    };

    Stack.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = 0;
        this._head = undefined;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return emptyStack();
    };

    Stack.prototype.slice = function(begin, end) {
      if (wholeSlice(begin, end, this.size)) {
        return this;
      }
      var resolvedBegin = resolveBegin(begin, this.size);
      var resolvedEnd = resolveEnd(end, this.size);
      if (resolvedEnd !== this.size) {
        // super.slice(begin, end);
        return IndexedCollection.prototype.slice.call(this, begin, end);
      }
      var newSize = this.size - resolvedBegin;
      var head = this._head;
      while (resolvedBegin--) {
        head = head.next;
      }
      if (this.__ownerID) {
        this.size = newSize;
        this._head = head;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return makeStack(newSize, head);
    };

    // @pragma Mutability

    Stack.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      if (!ownerID) {
        this.__ownerID = ownerID;
        this.__altered = false;
        return this;
      }
      return makeStack(this.size, this._head, ownerID, this.__hash);
    };

    // @pragma Iteration

    Stack.prototype.__iterate = function(fn, reverse) {
      if (reverse) {
        return this.reverse().__iterate(fn);
      }
      var iterations = 0;
      var node = this._head;
      while (node) {
        if (fn(node.value, iterations++, this) === false) {
          break;
        }
        node = node.next;
      }
      return iterations;
    };

    Stack.prototype.__iterator = function(type, reverse) {
      if (reverse) {
        return this.reverse().__iterator(type);
      }
      var iterations = 0;
      var node = this._head;
      return new Iterator(function()  {
        if (node) {
          var value = node.value;
          node = node.next;
          return iteratorValue(type, iterations++, value);
        }
        return iteratorDone();
      });
    };


  function isStack(maybeStack) {
    return !!(maybeStack && maybeStack[IS_STACK_SENTINEL]);
  }

  Stack.isStack = isStack;

  var IS_STACK_SENTINEL = '@@__IMMUTABLE_STACK__@@';

  var StackPrototype = Stack.prototype;
  StackPrototype[IS_STACK_SENTINEL] = true;
  StackPrototype.withMutations = MapPrototype.withMutations;
  StackPrototype.asMutable = MapPrototype.asMutable;
  StackPrototype.asImmutable = MapPrototype.asImmutable;
  StackPrototype.wasAltered = MapPrototype.wasAltered;


  function makeStack(size, head, ownerID, hash) {
    var map = Object.create(StackPrototype);
    map.size = size;
    map._head = head;
    map.__ownerID = ownerID;
    map.__hash = hash;
    map.__altered = false;
    return map;
  }

  var EMPTY_STACK;
  function emptyStack() {
    return EMPTY_STACK || (EMPTY_STACK = makeStack(0));
  }

  /**
   * Contributes additional methods to a constructor
   */
  function mixin(ctor, methods) {
    var keyCopier = function(key ) { ctor.prototype[key] = methods[key]; };
    Object.keys(methods).forEach(keyCopier);
    Object.getOwnPropertySymbols &&
      Object.getOwnPropertySymbols(methods).forEach(keyCopier);
    return ctor;
  }

  Iterable.Iterator = Iterator;

  mixin(Iterable, {

    // ### Conversion to other types

    toArray: function() {
      assertNotInfinite(this.size);
      var array = new Array(this.size || 0);
      this.valueSeq().__iterate(function(v, i)  { array[i] = v; });
      return array;
    },

    toIndexedSeq: function() {
      return new ToIndexedSequence(this);
    },

    toJS: function() {
      return this.toSeq().map(
        function(value ) {return value && typeof value.toJS === 'function' ? value.toJS() : value}
      ).__toJS();
    },

    toJSON: function() {
      return this.toSeq().map(
        function(value ) {return value && typeof value.toJSON === 'function' ? value.toJSON() : value}
      ).__toJS();
    },

    toKeyedSeq: function() {
      return new ToKeyedSequence(this, true);
    },

    toMap: function() {
      // Use Late Binding here to solve the circular dependency.
      return Map(this.toKeyedSeq());
    },

    toObject: function() {
      assertNotInfinite(this.size);
      var object = {};
      this.__iterate(function(v, k)  { object[k] = v; });
      return object;
    },

    toOrderedMap: function() {
      // Use Late Binding here to solve the circular dependency.
      return OrderedMap(this.toKeyedSeq());
    },

    toOrderedSet: function() {
      // Use Late Binding here to solve the circular dependency.
      return OrderedSet(isKeyed(this) ? this.valueSeq() : this);
    },

    toSet: function() {
      // Use Late Binding here to solve the circular dependency.
      return Set(isKeyed(this) ? this.valueSeq() : this);
    },

    toSetSeq: function() {
      return new ToSetSequence(this);
    },

    toSeq: function() {
      return isIndexed(this) ? this.toIndexedSeq() :
        isKeyed(this) ? this.toKeyedSeq() :
        this.toSetSeq();
    },

    toStack: function() {
      // Use Late Binding here to solve the circular dependency.
      return Stack(isKeyed(this) ? this.valueSeq() : this);
    },

    toList: function() {
      // Use Late Binding here to solve the circular dependency.
      return List(isKeyed(this) ? this.valueSeq() : this);
    },


    // ### Common JavaScript methods and properties

    toString: function() {
      return '[Iterable]';
    },

    __toString: function(head, tail) {
      if (this.size === 0) {
        return head + tail;
      }
      return head + ' ' + this.toSeq().map(this.__toStringMapper).join(', ') + ' ' + tail;
    },


    // ### ES6 Collection methods (ES6 Array and Map)

    concat: function() {var values = SLICE$0.call(arguments, 0);
      return reify(this, concatFactory(this, values));
    },

    includes: function(searchValue) {
      return this.some(function(value ) {return is(value, searchValue)});
    },

    entries: function() {
      return this.__iterator(ITERATE_ENTRIES);
    },

    every: function(predicate, context) {
      assertNotInfinite(this.size);
      var returnValue = true;
      this.__iterate(function(v, k, c)  {
        if (!predicate.call(context, v, k, c)) {
          returnValue = false;
          return false;
        }
      });
      return returnValue;
    },

    filter: function(predicate, context) {
      return reify(this, filterFactory(this, predicate, context, true));
    },

    find: function(predicate, context, notSetValue) {
      var entry = this.findEntry(predicate, context);
      return entry ? entry[1] : notSetValue;
    },

    forEach: function(sideEffect, context) {
      assertNotInfinite(this.size);
      return this.__iterate(context ? sideEffect.bind(context) : sideEffect);
    },

    join: function(separator) {
      assertNotInfinite(this.size);
      separator = separator !== undefined ? '' + separator : ',';
      var joined = '';
      var isFirst = true;
      this.__iterate(function(v ) {
        isFirst ? (isFirst = false) : (joined += separator);
        joined += v !== null && v !== undefined ? v.toString() : '';
      });
      return joined;
    },

    keys: function() {
      return this.__iterator(ITERATE_KEYS);
    },

    map: function(mapper, context) {
      return reify(this, mapFactory(this, mapper, context));
    },

    reduce: function(reducer, initialReduction, context) {
      assertNotInfinite(this.size);
      var reduction;
      var useFirst;
      if (arguments.length < 2) {
        useFirst = true;
      } else {
        reduction = initialReduction;
      }
      this.__iterate(function(v, k, c)  {
        if (useFirst) {
          useFirst = false;
          reduction = v;
        } else {
          reduction = reducer.call(context, reduction, v, k, c);
        }
      });
      return reduction;
    },

    reduceRight: function(reducer, initialReduction, context) {
      var reversed = this.toKeyedSeq().reverse();
      return reversed.reduce.apply(reversed, arguments);
    },

    reverse: function() {
      return reify(this, reverseFactory(this, true));
    },

    slice: function(begin, end) {
      return reify(this, sliceFactory(this, begin, end, true));
    },

    some: function(predicate, context) {
      return !this.every(not(predicate), context);
    },

    sort: function(comparator) {
      return reify(this, sortFactory(this, comparator));
    },

    values: function() {
      return this.__iterator(ITERATE_VALUES);
    },


    // ### More sequential methods

    butLast: function() {
      return this.slice(0, -1);
    },

    isEmpty: function() {
      return this.size !== undefined ? this.size === 0 : !this.some(function()  {return true});
    },

    count: function(predicate, context) {
      return ensureSize(
        predicate ? this.toSeq().filter(predicate, context) : this
      );
    },

    countBy: function(grouper, context) {
      return countByFactory(this, grouper, context);
    },

    equals: function(other) {
      return deepEqual(this, other);
    },

    entrySeq: function() {
      var iterable = this;
      if (iterable._cache) {
        // We cache as an entries array, so we can just return the cache!
        return new ArraySeq(iterable._cache);
      }
      var entriesSequence = iterable.toSeq().map(entryMapper).toIndexedSeq();
      entriesSequence.fromEntrySeq = function()  {return iterable.toSeq()};
      return entriesSequence;
    },

    filterNot: function(predicate, context) {
      return this.filter(not(predicate), context);
    },

    findEntry: function(predicate, context, notSetValue) {
      var found = notSetValue;
      this.__iterate(function(v, k, c)  {
        if (predicate.call(context, v, k, c)) {
          found = [k, v];
          return false;
        }
      });
      return found;
    },

    findKey: function(predicate, context) {
      var entry = this.findEntry(predicate, context);
      return entry && entry[0];
    },

    findLast: function(predicate, context, notSetValue) {
      return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);
    },

    findLastEntry: function(predicate, context, notSetValue) {
      return this.toKeyedSeq().reverse().findEntry(predicate, context, notSetValue);
    },

    findLastKey: function(predicate, context) {
      return this.toKeyedSeq().reverse().findKey(predicate, context);
    },

    first: function() {
      return this.find(returnTrue);
    },

    flatMap: function(mapper, context) {
      return reify(this, flatMapFactory(this, mapper, context));
    },

    flatten: function(depth) {
      return reify(this, flattenFactory(this, depth, true));
    },

    fromEntrySeq: function() {
      return new FromEntriesSequence(this);
    },

    get: function(searchKey, notSetValue) {
      return this.find(function(_, key)  {return is(key, searchKey)}, undefined, notSetValue);
    },

    getIn: function(searchKeyPath, notSetValue) {
      var nested = this;
      // Note: in an ES6 environment, we would prefer:
      // for (var key of searchKeyPath) {
      var iter = forceIterator(searchKeyPath);
      var step;
      while (!(step = iter.next()).done) {
        var key = step.value;
        nested = nested && nested.get ? nested.get(key, NOT_SET) : NOT_SET;
        if (nested === NOT_SET) {
          return notSetValue;
        }
      }
      return nested;
    },

    groupBy: function(grouper, context) {
      return groupByFactory(this, grouper, context);
    },

    has: function(searchKey) {
      return this.get(searchKey, NOT_SET) !== NOT_SET;
    },

    hasIn: function(searchKeyPath) {
      return this.getIn(searchKeyPath, NOT_SET) !== NOT_SET;
    },

    isSubset: function(iter) {
      iter = typeof iter.includes === 'function' ? iter : Iterable(iter);
      return this.every(function(value ) {return iter.includes(value)});
    },

    isSuperset: function(iter) {
      iter = typeof iter.isSubset === 'function' ? iter : Iterable(iter);
      return iter.isSubset(this);
    },

    keyOf: function(searchValue) {
      return this.findKey(function(value ) {return is(value, searchValue)});
    },

    keySeq: function() {
      return this.toSeq().map(keyMapper).toIndexedSeq();
    },

    last: function() {
      return this.toSeq().reverse().first();
    },

    lastKeyOf: function(searchValue) {
      return this.toKeyedSeq().reverse().keyOf(searchValue);
    },

    max: function(comparator) {
      return maxFactory(this, comparator);
    },

    maxBy: function(mapper, comparator) {
      return maxFactory(this, comparator, mapper);
    },

    min: function(comparator) {
      return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator);
    },

    minBy: function(mapper, comparator) {
      return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator, mapper);
    },

    rest: function() {
      return this.slice(1);
    },

    skip: function(amount) {
      return this.slice(Math.max(0, amount));
    },

    skipLast: function(amount) {
      return reify(this, this.toSeq().reverse().skip(amount).reverse());
    },

    skipWhile: function(predicate, context) {
      return reify(this, skipWhileFactory(this, predicate, context, true));
    },

    skipUntil: function(predicate, context) {
      return this.skipWhile(not(predicate), context);
    },

    sortBy: function(mapper, comparator) {
      return reify(this, sortFactory(this, comparator, mapper));
    },

    take: function(amount) {
      return this.slice(0, Math.max(0, amount));
    },

    takeLast: function(amount) {
      return reify(this, this.toSeq().reverse().take(amount).reverse());
    },

    takeWhile: function(predicate, context) {
      return reify(this, takeWhileFactory(this, predicate, context));
    },

    takeUntil: function(predicate, context) {
      return this.takeWhile(not(predicate), context);
    },

    valueSeq: function() {
      return this.toIndexedSeq();
    },


    // ### Hashable Object

    hashCode: function() {
      return this.__hash || (this.__hash = hashIterable(this));
    }


    // ### Internal

    // abstract __iterate(fn, reverse)

    // abstract __iterator(type, reverse)
  });

  // var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
  // var IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
  // var IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@';
  // var IS_ORDERED_SENTINEL = '@@__IMMUTABLE_ORDERED__@@';

  var IterablePrototype = Iterable.prototype;
  IterablePrototype[IS_ITERABLE_SENTINEL] = true;
  IterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.values;
  IterablePrototype.__toJS = IterablePrototype.toArray;
  IterablePrototype.__toStringMapper = quoteString;
  IterablePrototype.inspect =
  IterablePrototype.toSource = function() { return this.toString(); };
  IterablePrototype.chain = IterablePrototype.flatMap;
  IterablePrototype.contains = IterablePrototype.includes;

  mixin(KeyedIterable, {

    // ### More sequential methods

    flip: function() {
      return reify(this, flipFactory(this));
    },

    mapEntries: function(mapper, context) {var this$0 = this;
      var iterations = 0;
      return reify(this,
        this.toSeq().map(
          function(v, k)  {return mapper.call(context, [k, v], iterations++, this$0)}
        ).fromEntrySeq()
      );
    },

    mapKeys: function(mapper, context) {var this$0 = this;
      return reify(this,
        this.toSeq().flip().map(
          function(k, v)  {return mapper.call(context, k, v, this$0)}
        ).flip()
      );
    }

  });

  var KeyedIterablePrototype = KeyedIterable.prototype;
  KeyedIterablePrototype[IS_KEYED_SENTINEL] = true;
  KeyedIterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.entries;
  KeyedIterablePrototype.__toJS = IterablePrototype.toObject;
  KeyedIterablePrototype.__toStringMapper = function(v, k)  {return JSON.stringify(k) + ': ' + quoteString(v)};



  mixin(IndexedIterable, {

    // ### Conversion to other types

    toKeyedSeq: function() {
      return new ToKeyedSequence(this, false);
    },


    // ### ES6 Collection methods (ES6 Array and Map)

    filter: function(predicate, context) {
      return reify(this, filterFactory(this, predicate, context, false));
    },

    findIndex: function(predicate, context) {
      var entry = this.findEntry(predicate, context);
      return entry ? entry[0] : -1;
    },

    indexOf: function(searchValue) {
      var key = this.keyOf(searchValue);
      return key === undefined ? -1 : key;
    },

    lastIndexOf: function(searchValue) {
      var key = this.lastKeyOf(searchValue);
      return key === undefined ? -1 : key;
    },

    reverse: function() {
      return reify(this, reverseFactory(this, false));
    },

    slice: function(begin, end) {
      return reify(this, sliceFactory(this, begin, end, false));
    },

    splice: function(index, removeNum /*, ...values*/) {
      var numArgs = arguments.length;
      removeNum = Math.max(removeNum | 0, 0);
      if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
        return this;
      }
      // If index is negative, it should resolve relative to the size of the
      // collection. However size may be expensive to compute if not cached, so
      // only call count() if the number is in fact negative.
      index = resolveBegin(index, index < 0 ? this.count() : this.size);
      var spliced = this.slice(0, index);
      return reify(
        this,
        numArgs === 1 ?
          spliced :
          spliced.concat(arrCopy(arguments, 2), this.slice(index + removeNum))
      );
    },


    // ### More collection methods

    findLastIndex: function(predicate, context) {
      var entry = this.findLastEntry(predicate, context);
      return entry ? entry[0] : -1;
    },

    first: function() {
      return this.get(0);
    },

    flatten: function(depth) {
      return reify(this, flattenFactory(this, depth, false));
    },

    get: function(index, notSetValue) {
      index = wrapIndex(this, index);
      return (index < 0 || (this.size === Infinity ||
          (this.size !== undefined && index > this.size))) ?
        notSetValue :
        this.find(function(_, key)  {return key === index}, undefined, notSetValue);
    },

    has: function(index) {
      index = wrapIndex(this, index);
      return index >= 0 && (this.size !== undefined ?
        this.size === Infinity || index < this.size :
        this.indexOf(index) !== -1
      );
    },

    interpose: function(separator) {
      return reify(this, interposeFactory(this, separator));
    },

    interleave: function(/*...iterables*/) {
      var iterables = [this].concat(arrCopy(arguments));
      var zipped = zipWithFactory(this.toSeq(), IndexedSeq.of, iterables);
      var interleaved = zipped.flatten(true);
      if (zipped.size) {
        interleaved.size = zipped.size * iterables.length;
      }
      return reify(this, interleaved);
    },

    keySeq: function() {
      return Range(0, this.size);
    },

    last: function() {
      return this.get(-1);
    },

    skipWhile: function(predicate, context) {
      return reify(this, skipWhileFactory(this, predicate, context, false));
    },

    zip: function(/*, ...iterables */) {
      var iterables = [this].concat(arrCopy(arguments));
      return reify(this, zipWithFactory(this, defaultZipper, iterables));
    },

    zipWith: function(zipper/*, ...iterables */) {
      var iterables = arrCopy(arguments);
      iterables[0] = this;
      return reify(this, zipWithFactory(this, zipper, iterables));
    }

  });

  IndexedIterable.prototype[IS_INDEXED_SENTINEL] = true;
  IndexedIterable.prototype[IS_ORDERED_SENTINEL] = true;



  mixin(SetIterable, {

    // ### ES6 Collection methods (ES6 Array and Map)

    get: function(value, notSetValue) {
      return this.has(value) ? value : notSetValue;
    },

    includes: function(value) {
      return this.has(value);
    },


    // ### More sequential methods

    keySeq: function() {
      return this.valueSeq();
    }

  });

  SetIterable.prototype.has = IterablePrototype.includes;
  SetIterable.prototype.contains = SetIterable.prototype.includes;


  // Mixin subclasses

  mixin(KeyedSeq, KeyedIterable.prototype);
  mixin(IndexedSeq, IndexedIterable.prototype);
  mixin(SetSeq, SetIterable.prototype);

  mixin(KeyedCollection, KeyedIterable.prototype);
  mixin(IndexedCollection, IndexedIterable.prototype);
  mixin(SetCollection, SetIterable.prototype);


  // #pragma Helper functions

  function keyMapper(v, k) {
    return k;
  }

  function entryMapper(v, k) {
    return [k, v];
  }

  function not(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    }
  }

  function neg(predicate) {
    return function() {
      return -predicate.apply(this, arguments);
    }
  }

  function quoteString(value) {
    return typeof value === 'string' ? JSON.stringify(value) : String(value);
  }

  function defaultZipper() {
    return arrCopy(arguments);
  }

  function defaultNegComparator(a, b) {
    return a < b ? 1 : a > b ? -1 : 0;
  }

  function hashIterable(iterable) {
    if (iterable.size === Infinity) {
      return 0;
    }
    var ordered = isOrdered(iterable);
    var keyed = isKeyed(iterable);
    var h = ordered ? 1 : 0;
    var size = iterable.__iterate(
      keyed ?
        ordered ?
          function(v, k)  { h = 31 * h + hashMerge(hash(v), hash(k)) | 0; } :
          function(v, k)  { h = h + hashMerge(hash(v), hash(k)) | 0; } :
        ordered ?
          function(v ) { h = 31 * h + hash(v) | 0; } :
          function(v ) { h = h + hash(v) | 0; }
    );
    return murmurHashOfSize(size, h);
  }

  function murmurHashOfSize(size, h) {
    h = imul(h, 0xCC9E2D51);
    h = imul(h << 15 | h >>> -15, 0x1B873593);
    h = imul(h << 13 | h >>> -13, 5);
    h = (h + 0xE6546B64 | 0) ^ size;
    h = imul(h ^ h >>> 16, 0x85EBCA6B);
    h = imul(h ^ h >>> 13, 0xC2B2AE35);
    h = smi(h ^ h >>> 16);
    return h;
  }

  function hashMerge(a, b) {
    return a ^ b + 0x9E3779B9 + (a << 6) + (a >> 2) | 0; // int
  }

  var Immutable = {

    Iterable: Iterable,

    Seq: Seq,
    Collection: Collection,
    Map: Map,
    OrderedMap: OrderedMap,
    List: List,
    Stack: Stack,
    Set: Set,
    OrderedSet: OrderedSet,

    Record: Record,
    Range: Range,
    Repeat: Repeat,

    is: is,
    fromJS: fromJS

  };

  return Immutable;

}));

/***/ }),

/***/ "./node_modules/is-empty/lib/index.js":
/*!********************************************!*\
  !*** ./node_modules/is-empty/lib/index.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {


/**
 * Has own property.
 *
 * @type {Function}
 */

var has = Object.prototype.hasOwnProperty

/**
 * To string.
 *
 * @type {Function}
 */

var toString = Object.prototype.toString

/**
 * Test whether a value is "empty".
 *
 * @param {Mixed} val
 * @return {Boolean}
 */

function isEmpty(val) {
  // Null and Undefined...
  if (val == null) return true

  // Booleans...
  if ('boolean' == typeof val) return false

  // Numbers...
  if ('number' == typeof val) return val === 0

  // Strings...
  if ('string' == typeof val) return val.length === 0

  // Functions...
  if ('function' == typeof val) return val.length === 0

  // Arrays...
  if (Array.isArray(val)) return val.length === 0

  // Errors...
  if (val instanceof Error) return val.message === ''

  // Objects...
  if (val.toString == toString) {
    switch (val.toString()) {

      // Maps, Sets, Files and Errors...
      case '[object File]':
      case '[object Map]':
      case '[object Set]': {
        return val.size === 0
      }

      // Plain objects...
      case '[object Object]': {
        for (var key in val) {
          if (has.call(val, key)) return false
        }

        return true
      }
    }
  }

  // Anything else...
  return false
}

/**
 * Export `isEmpty`.
 *
 * @type {Function}
 */

module.exports = isEmpty


/***/ }),

/***/ "./node_modules/is-hotkey/lib/index.js":
/*!*********************************************!*\
  !*** ./node_modules/is-hotkey/lib/index.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Constants.
 */

var IS_MAC = typeof window != 'undefined' && /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);

var MODIFIERS = {
  alt: 'altKey',
  control: 'ctrlKey',
  meta: 'metaKey',
  shift: 'shiftKey'
};

var ALIASES = {
  add: '+',
  break: 'pause',
  cmd: 'meta',
  command: 'meta',
  ctl: 'control',
  ctrl: 'control',
  del: 'delete',
  down: 'arrowdown',
  esc: 'escape',
  ins: 'insert',
  left: 'arrowleft',
  mod: IS_MAC ? 'meta' : 'control',
  opt: 'alt',
  option: 'alt',
  return: 'enter',
  right: 'arrowright',
  space: ' ',
  spacebar: ' ',
  up: 'arrowup',
  win: 'meta',
  windows: 'meta'
};

var CODES = {
  backspace: 8,
  tab: 9,
  enter: 13,
  shift: 16,
  control: 17,
  alt: 18,
  pause: 19,
  capslock: 20,
  escape: 27,
  ' ': 32,
  pageup: 33,
  pagedown: 34,
  end: 35,
  home: 36,
  arrowleft: 37,
  arrowup: 38,
  arrowright: 39,
  arrowdown: 40,
  insert: 45,
  delete: 46,
  meta: 91,
  numlock: 144,
  scrolllock: 145,
  ';': 186,
  '=': 187,
  ',': 188,
  '-': 189,
  '.': 190,
  '/': 191,
  '`': 192,
  '[': 219,
  '\\': 220,
  ']': 221,
  '\'': 222
};

for (var f = 1; f < 20; f++) {
  CODES['f' + f] = 111 + f;
}

/**
 * Is hotkey?
 */

function isHotkey(hotkey, options, event) {
  if (options && !('byKey' in options)) {
    event = options;
    options = null;
  }

  var object = parseHotkey(hotkey, options);
  var ret = event == null ? function (e) {
    return compareHotkey(object, e);
  } : compareHotkey(object, event);

  return ret;
}

function isCodeHotkey(hotkey, event) {
  return isHotkey(hotkey, event);
}

function isKeyHotkey(hotkey, event) {
  return isHotkey(hotkey, { byKey: true }, event);
}

/**
 * Parse.
 */

function parseHotkey(hotkey, options) {
  var byKey = options && options.byKey;
  var ret = {};

  // Special case to handle the `+` key since we use it as a separator.
  hotkey = hotkey.replace('++', '+add');
  var values = hotkey.split('+');
  var length = values.length;

  // Ensure that all the modifiers are set to false unless the hotkey has them.

  for (var k in MODIFIERS) {
    ret[MODIFIERS[k]] = false;
  }

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = values[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var value = _step.value;

      var name = toKeyName(value);
      var modifier = MODIFIERS[name];

      if (length == 1 || !modifier) {
        if (byKey) {
          ret.key = name;
        } else {
          ret.which = toKeyCode(value);
        }
      }

      if (modifier) {
        ret[modifier] = true;
      }

      // If there's only one key, and it's not a modifier, ignore the shift key
      // because it will already be taken into accout by the `event.key` value.
      if (length == 1 && !modifier && byKey) {
        ret.shiftKey = null;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return ret;
}

/**
 * Compare.
 */

function compareHotkey(object, event) {
  for (var key in object) {
    var expected = object[key];
    var actual = void 0;

    if (expected == null) continue;

    if (key == 'key') {
      actual = event.key.toLowerCase();
    } else if (key == 'which') {
      actual = expected == 91 && event.which == 93 ? 91 : event.which;
    } else {
      actual = event[key];
    }

    if (actual == null && expected == false) continue;
    if (actual != expected) return false;
  }

  return true;
}

/**
 * Utils.
 */

function toKeyCode(name) {
  name = toKeyName(name);
  var code = CODES[name] || name.toUpperCase().charCodeAt(0);
  return code;
}

function toKeyName(name) {
  name = name.toLowerCase();
  name = ALIASES[name] || name;
  return name;
}

/**
 * Export.
 */

exports.default = isHotkey;
exports.isHotkey = isHotkey;
exports.isCodeHotkey = isCodeHotkey;
exports.isKeyHotkey = isKeyHotkey;
exports.parseHotkey = parseHotkey;
exports.compareHotkey = compareHotkey;
exports.toKeyCode = toKeyCode;
exports.toKeyName = toKeyName;

/***/ }),

/***/ "./node_modules/is-in-browser/dist/module.js":
/*!***************************************************!*\
  !*** ./node_modules/is-in-browser/dist/module.js ***!
  \***************************************************/
/*! exports provided: isBrowser, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isBrowser", function() { return isBrowser; });
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isBrowser = (typeof window === "undefined" ? "undefined" : _typeof(window)) === "object" && (typeof document === "undefined" ? "undefined" : _typeof(document)) === 'object' && document.nodeType === 9;

/* harmony default export */ __webpack_exports__["default"] = (isBrowser);


/***/ }),

/***/ "./node_modules/is-plain-object/index.js":
/*!***********************************************!*\
  !*** ./node_modules/is-plain-object/index.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */



var isObject = __webpack_require__(/*! isobject */ "./node_modules/isobject/index.js");

function isObjectObject(o) {
  return isObject(o) === true
    && Object.prototype.toString.call(o) === '[object Object]';
}

module.exports = function isPlainObject(o) {
  var ctor,prot;

  if (isObjectObject(o) === false) return false;

  // If has modified constructor
  ctor = o.constructor;
  if (typeof ctor !== 'function') return false;

  // If has modified prototype
  prot = ctor.prototype;
  if (isObjectObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
};


/***/ }),

/***/ "./node_modules/isobject/index.js":
/*!****************************************!*\
  !*** ./node_modules/isobject/index.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */



module.exports = function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
};


/***/ }),

/***/ "./node_modules/isomorphic-base64/browser.js":
/*!***************************************************!*\
  !*** ./node_modules/isomorphic-base64/browser.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.atob = self.atob.bind(self);
exports.btoa = self.btoa.bind(self);


/***/ }),

/***/ "./node_modules/lodash/_DataView.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_DataView.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView');

module.exports = DataView;


/***/ }),

/***/ "./node_modules/lodash/_Hash.js":
/*!**************************************!*\
  !*** ./node_modules/lodash/_Hash.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var hashClear = __webpack_require__(/*! ./_hashClear */ "./node_modules/lodash/_hashClear.js"),
    hashDelete = __webpack_require__(/*! ./_hashDelete */ "./node_modules/lodash/_hashDelete.js"),
    hashGet = __webpack_require__(/*! ./_hashGet */ "./node_modules/lodash/_hashGet.js"),
    hashHas = __webpack_require__(/*! ./_hashHas */ "./node_modules/lodash/_hashHas.js"),
    hashSet = __webpack_require__(/*! ./_hashSet */ "./node_modules/lodash/_hashSet.js");

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

module.exports = Hash;


/***/ }),

/***/ "./node_modules/lodash/_ListCache.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_ListCache.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var listCacheClear = __webpack_require__(/*! ./_listCacheClear */ "./node_modules/lodash/_listCacheClear.js"),
    listCacheDelete = __webpack_require__(/*! ./_listCacheDelete */ "./node_modules/lodash/_listCacheDelete.js"),
    listCacheGet = __webpack_require__(/*! ./_listCacheGet */ "./node_modules/lodash/_listCacheGet.js"),
    listCacheHas = __webpack_require__(/*! ./_listCacheHas */ "./node_modules/lodash/_listCacheHas.js"),
    listCacheSet = __webpack_require__(/*! ./_listCacheSet */ "./node_modules/lodash/_listCacheSet.js");

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

module.exports = ListCache;


/***/ }),

/***/ "./node_modules/lodash/_Map.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/_Map.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map');

module.exports = Map;


/***/ }),

/***/ "./node_modules/lodash/_MapCache.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_MapCache.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var mapCacheClear = __webpack_require__(/*! ./_mapCacheClear */ "./node_modules/lodash/_mapCacheClear.js"),
    mapCacheDelete = __webpack_require__(/*! ./_mapCacheDelete */ "./node_modules/lodash/_mapCacheDelete.js"),
    mapCacheGet = __webpack_require__(/*! ./_mapCacheGet */ "./node_modules/lodash/_mapCacheGet.js"),
    mapCacheHas = __webpack_require__(/*! ./_mapCacheHas */ "./node_modules/lodash/_mapCacheHas.js"),
    mapCacheSet = __webpack_require__(/*! ./_mapCacheSet */ "./node_modules/lodash/_mapCacheSet.js");

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

module.exports = MapCache;


/***/ }),

/***/ "./node_modules/lodash/_Promise.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_Promise.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/* Built-in method references that are verified to be native. */
var Promise = getNative(root, 'Promise');

module.exports = Promise;


/***/ }),

/***/ "./node_modules/lodash/_Set.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/_Set.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/* Built-in method references that are verified to be native. */
var Set = getNative(root, 'Set');

module.exports = Set;


/***/ }),

/***/ "./node_modules/lodash/_SetCache.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_SetCache.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var MapCache = __webpack_require__(/*! ./_MapCache */ "./node_modules/lodash/_MapCache.js"),
    setCacheAdd = __webpack_require__(/*! ./_setCacheAdd */ "./node_modules/lodash/_setCacheAdd.js"),
    setCacheHas = __webpack_require__(/*! ./_setCacheHas */ "./node_modules/lodash/_setCacheHas.js");

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

module.exports = SetCache;


/***/ }),

/***/ "./node_modules/lodash/_Stack.js":
/*!***************************************!*\
  !*** ./node_modules/lodash/_Stack.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var ListCache = __webpack_require__(/*! ./_ListCache */ "./node_modules/lodash/_ListCache.js"),
    stackClear = __webpack_require__(/*! ./_stackClear */ "./node_modules/lodash/_stackClear.js"),
    stackDelete = __webpack_require__(/*! ./_stackDelete */ "./node_modules/lodash/_stackDelete.js"),
    stackGet = __webpack_require__(/*! ./_stackGet */ "./node_modules/lodash/_stackGet.js"),
    stackHas = __webpack_require__(/*! ./_stackHas */ "./node_modules/lodash/_stackHas.js"),
    stackSet = __webpack_require__(/*! ./_stackSet */ "./node_modules/lodash/_stackSet.js");

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

module.exports = Stack;


/***/ }),

/***/ "./node_modules/lodash/_Symbol.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/_Symbol.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;


/***/ }),

/***/ "./node_modules/lodash/_Uint8Array.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_Uint8Array.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/** Built-in value references. */
var Uint8Array = root.Uint8Array;

module.exports = Uint8Array;


/***/ }),

/***/ "./node_modules/lodash/_WeakMap.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_WeakMap.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/* Built-in method references that are verified to be native. */
var WeakMap = getNative(root, 'WeakMap');

module.exports = WeakMap;


/***/ }),

/***/ "./node_modules/lodash/_apply.js":
/*!***************************************!*\
  !*** ./node_modules/lodash/_apply.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

module.exports = apply;


/***/ }),

/***/ "./node_modules/lodash/_arrayEach.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_arrayEach.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

module.exports = arrayEach;


/***/ }),

/***/ "./node_modules/lodash/_arrayFilter.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_arrayFilter.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

module.exports = arrayFilter;


/***/ }),

/***/ "./node_modules/lodash/_arrayLikeKeys.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_arrayLikeKeys.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseTimes = __webpack_require__(/*! ./_baseTimes */ "./node_modules/lodash/_baseTimes.js"),
    isArguments = __webpack_require__(/*! ./isArguments */ "./node_modules/lodash/isArguments.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isBuffer = __webpack_require__(/*! ./isBuffer */ "./node_modules/lodash/isBuffer.js"),
    isIndex = __webpack_require__(/*! ./_isIndex */ "./node_modules/lodash/_isIndex.js"),
    isTypedArray = __webpack_require__(/*! ./isTypedArray */ "./node_modules/lodash/isTypedArray.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = arrayLikeKeys;


/***/ }),

/***/ "./node_modules/lodash/_arrayMap.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_arrayMap.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

module.exports = arrayMap;


/***/ }),

/***/ "./node_modules/lodash/_arrayPush.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_arrayPush.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

module.exports = arrayPush;


/***/ }),

/***/ "./node_modules/lodash/_arraySome.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_arraySome.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

module.exports = arraySome;


/***/ }),

/***/ "./node_modules/lodash/_assignMergeValue.js":
/*!**************************************************!*\
  !*** ./node_modules/lodash/_assignMergeValue.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseAssignValue = __webpack_require__(/*! ./_baseAssignValue */ "./node_modules/lodash/_baseAssignValue.js"),
    eq = __webpack_require__(/*! ./eq */ "./node_modules/lodash/eq.js");

/**
 * This function is like `assignValue` except that it doesn't assign
 * `undefined` values.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignMergeValue(object, key, value) {
  if ((value !== undefined && !eq(object[key], value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

module.exports = assignMergeValue;


/***/ }),

/***/ "./node_modules/lodash/_assignValue.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_assignValue.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseAssignValue = __webpack_require__(/*! ./_baseAssignValue */ "./node_modules/lodash/_baseAssignValue.js"),
    eq = __webpack_require__(/*! ./eq */ "./node_modules/lodash/eq.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

module.exports = assignValue;


/***/ }),

/***/ "./node_modules/lodash/_assocIndexOf.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_assocIndexOf.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var eq = __webpack_require__(/*! ./eq */ "./node_modules/lodash/eq.js");

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

module.exports = assocIndexOf;


/***/ }),

/***/ "./node_modules/lodash/_baseAssign.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_baseAssign.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__(/*! ./_copyObject */ "./node_modules/lodash/_copyObject.js"),
    keys = __webpack_require__(/*! ./keys */ "./node_modules/lodash/keys.js");

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}

module.exports = baseAssign;


/***/ }),

/***/ "./node_modules/lodash/_baseAssignIn.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_baseAssignIn.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__(/*! ./_copyObject */ "./node_modules/lodash/_copyObject.js"),
    keysIn = __webpack_require__(/*! ./keysIn */ "./node_modules/lodash/keysIn.js");

/**
 * The base implementation of `_.assignIn` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssignIn(object, source) {
  return object && copyObject(source, keysIn(source), object);
}

module.exports = baseAssignIn;


/***/ }),

/***/ "./node_modules/lodash/_baseAssignValue.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_baseAssignValue.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var defineProperty = __webpack_require__(/*! ./_defineProperty */ "./node_modules/lodash/_defineProperty.js");

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue(object, key, value) {
  if (key == '__proto__' && defineProperty) {
    defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

module.exports = baseAssignValue;


/***/ }),

/***/ "./node_modules/lodash/_baseClone.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseClone.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Stack = __webpack_require__(/*! ./_Stack */ "./node_modules/lodash/_Stack.js"),
    arrayEach = __webpack_require__(/*! ./_arrayEach */ "./node_modules/lodash/_arrayEach.js"),
    assignValue = __webpack_require__(/*! ./_assignValue */ "./node_modules/lodash/_assignValue.js"),
    baseAssign = __webpack_require__(/*! ./_baseAssign */ "./node_modules/lodash/_baseAssign.js"),
    baseAssignIn = __webpack_require__(/*! ./_baseAssignIn */ "./node_modules/lodash/_baseAssignIn.js"),
    cloneBuffer = __webpack_require__(/*! ./_cloneBuffer */ "./node_modules/lodash/_cloneBuffer.js"),
    copyArray = __webpack_require__(/*! ./_copyArray */ "./node_modules/lodash/_copyArray.js"),
    copySymbols = __webpack_require__(/*! ./_copySymbols */ "./node_modules/lodash/_copySymbols.js"),
    copySymbolsIn = __webpack_require__(/*! ./_copySymbolsIn */ "./node_modules/lodash/_copySymbolsIn.js"),
    getAllKeys = __webpack_require__(/*! ./_getAllKeys */ "./node_modules/lodash/_getAllKeys.js"),
    getAllKeysIn = __webpack_require__(/*! ./_getAllKeysIn */ "./node_modules/lodash/_getAllKeysIn.js"),
    getTag = __webpack_require__(/*! ./_getTag */ "./node_modules/lodash/_getTag.js"),
    initCloneArray = __webpack_require__(/*! ./_initCloneArray */ "./node_modules/lodash/_initCloneArray.js"),
    initCloneByTag = __webpack_require__(/*! ./_initCloneByTag */ "./node_modules/lodash/_initCloneByTag.js"),
    initCloneObject = __webpack_require__(/*! ./_initCloneObject */ "./node_modules/lodash/_initCloneObject.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isBuffer = __webpack_require__(/*! ./isBuffer */ "./node_modules/lodash/isBuffer.js"),
    isMap = __webpack_require__(/*! ./isMap */ "./node_modules/lodash/isMap.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    isSet = __webpack_require__(/*! ./isSet */ "./node_modules/lodash/isSet.js"),
    keys = __webpack_require__(/*! ./keys */ "./node_modules/lodash/keys.js");

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG = 4;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
cloneableTags[boolTag] = cloneableTags[dateTag] =
cloneableTags[float32Tag] = cloneableTags[float64Tag] =
cloneableTags[int8Tag] = cloneableTags[int16Tag] =
cloneableTags[int32Tag] = cloneableTags[mapTag] =
cloneableTags[numberTag] = cloneableTags[objectTag] =
cloneableTags[regexpTag] = cloneableTags[setTag] =
cloneableTags[stringTag] = cloneableTags[symbolTag] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[weakMapTag] = false;

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Deep clone
 *  2 - Flatten inherited properties
 *  4 - Clone symbols
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, bitmask, customizer, key, object, stack) {
  var result,
      isDeep = bitmask & CLONE_DEEP_FLAG,
      isFlat = bitmask & CLONE_FLAT_FLAG,
      isFull = bitmask & CLONE_SYMBOLS_FLAG;

  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag(value),
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      result = (isFlat || isFunc) ? {} : initCloneObject(value);
      if (!isDeep) {
        return isFlat
          ? copySymbolsIn(value, baseAssignIn(result, value))
          : copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (isSet(value)) {
    value.forEach(function(subValue) {
      result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
    });

    return result;
  }

  if (isMap(value)) {
    value.forEach(function(subValue, key) {
      result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
    });

    return result;
  }

  var keysFunc = isFull
    ? (isFlat ? getAllKeysIn : getAllKeys)
    : (isFlat ? keysIn : keys);

  var props = isArr ? undefined : keysFunc(value);
  arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
  });
  return result;
}

module.exports = baseClone;


/***/ }),

/***/ "./node_modules/lodash/_baseCreate.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_baseCreate.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js");

/** Built-in value references. */
var objectCreate = Object.create;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(proto) {
    if (!isObject(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}());

module.exports = baseCreate;


/***/ }),

/***/ "./node_modules/lodash/_baseFlatten.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_baseFlatten.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var arrayPush = __webpack_require__(/*! ./_arrayPush */ "./node_modules/lodash/_arrayPush.js"),
    isFlattenable = __webpack_require__(/*! ./_isFlattenable */ "./node_modules/lodash/_isFlattenable.js");

/**
 * The base implementation of `_.flatten` with support for restricting flattening.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {number} depth The maximum recursion depth.
 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
 * @param {Array} [result=[]] The initial result value.
 * @returns {Array} Returns the new flattened array.
 */
function baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1,
      length = array.length;

  predicate || (predicate = isFlattenable);
  result || (result = []);

  while (++index < length) {
    var value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        // Recursively flatten arrays (susceptible to call stack limits).
        baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}

module.exports = baseFlatten;


/***/ }),

/***/ "./node_modules/lodash/_baseFor.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_baseFor.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var createBaseFor = __webpack_require__(/*! ./_createBaseFor */ "./node_modules/lodash/_createBaseFor.js");

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

module.exports = baseFor;


/***/ }),

/***/ "./node_modules/lodash/_baseGet.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_baseGet.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var castPath = __webpack_require__(/*! ./_castPath */ "./node_modules/lodash/_castPath.js"),
    toKey = __webpack_require__(/*! ./_toKey */ "./node_modules/lodash/_toKey.js");

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = castPath(path, object);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

module.exports = baseGet;


/***/ }),

/***/ "./node_modules/lodash/_baseGetAllKeys.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_baseGetAllKeys.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var arrayPush = __webpack_require__(/*! ./_arrayPush */ "./node_modules/lodash/_arrayPush.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js");

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

module.exports = baseGetAllKeys;


/***/ }),

/***/ "./node_modules/lodash/_baseGetTag.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_baseGetTag.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js"),
    getRawTag = __webpack_require__(/*! ./_getRawTag */ "./node_modules/lodash/_getRawTag.js"),
    objectToString = __webpack_require__(/*! ./_objectToString */ "./node_modules/lodash/_objectToString.js");

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;


/***/ }),

/***/ "./node_modules/lodash/_baseHasIn.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseHasIn.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}

module.exports = baseHasIn;


/***/ }),

/***/ "./node_modules/lodash/_baseIsArguments.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_baseIsArguments.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

module.exports = baseIsArguments;


/***/ }),

/***/ "./node_modules/lodash/_baseIsEqual.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_baseIsEqual.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseIsEqualDeep = __webpack_require__(/*! ./_baseIsEqualDeep */ "./node_modules/lodash/_baseIsEqualDeep.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

module.exports = baseIsEqual;


/***/ }),

/***/ "./node_modules/lodash/_baseIsEqualDeep.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_baseIsEqualDeep.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Stack = __webpack_require__(/*! ./_Stack */ "./node_modules/lodash/_Stack.js"),
    equalArrays = __webpack_require__(/*! ./_equalArrays */ "./node_modules/lodash/_equalArrays.js"),
    equalByTag = __webpack_require__(/*! ./_equalByTag */ "./node_modules/lodash/_equalByTag.js"),
    equalObjects = __webpack_require__(/*! ./_equalObjects */ "./node_modules/lodash/_equalObjects.js"),
    getTag = __webpack_require__(/*! ./_getTag */ "./node_modules/lodash/_getTag.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isBuffer = __webpack_require__(/*! ./isBuffer */ "./node_modules/lodash/isBuffer.js"),
    isTypedArray = __webpack_require__(/*! ./isTypedArray */ "./node_modules/lodash/isTypedArray.js");

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    objectTag = '[object Object]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = objIsArr ? arrayTag : getTag(object),
      othTag = othIsArr ? arrayTag : getTag(other);

  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;

  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack);
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack);
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

module.exports = baseIsEqualDeep;


/***/ }),

/***/ "./node_modules/lodash/_baseIsMap.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseIsMap.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getTag = __webpack_require__(/*! ./_getTag */ "./node_modules/lodash/_getTag.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/** `Object#toString` result references. */
var mapTag = '[object Map]';

/**
 * The base implementation of `_.isMap` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 */
function baseIsMap(value) {
  return isObjectLike(value) && getTag(value) == mapTag;
}

module.exports = baseIsMap;


/***/ }),

/***/ "./node_modules/lodash/_baseIsNative.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_baseIsNative.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isFunction = __webpack_require__(/*! ./isFunction */ "./node_modules/lodash/isFunction.js"),
    isMasked = __webpack_require__(/*! ./_isMasked */ "./node_modules/lodash/_isMasked.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    toSource = __webpack_require__(/*! ./_toSource */ "./node_modules/lodash/_toSource.js");

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

module.exports = baseIsNative;


/***/ }),

/***/ "./node_modules/lodash/_baseIsSet.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseIsSet.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getTag = __webpack_require__(/*! ./_getTag */ "./node_modules/lodash/_getTag.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/** `Object#toString` result references. */
var setTag = '[object Set]';

/**
 * The base implementation of `_.isSet` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 */
function baseIsSet(value) {
  return isObjectLike(value) && getTag(value) == setTag;
}

module.exports = baseIsSet;


/***/ }),

/***/ "./node_modules/lodash/_baseIsTypedArray.js":
/*!**************************************************!*\
  !*** ./node_modules/lodash/_baseIsTypedArray.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    isLength = __webpack_require__(/*! ./isLength */ "./node_modules/lodash/isLength.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

module.exports = baseIsTypedArray;


/***/ }),

/***/ "./node_modules/lodash/_baseKeys.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_baseKeys.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isPrototype = __webpack_require__(/*! ./_isPrototype */ "./node_modules/lodash/_isPrototype.js"),
    nativeKeys = __webpack_require__(/*! ./_nativeKeys */ "./node_modules/lodash/_nativeKeys.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeys;


/***/ }),

/***/ "./node_modules/lodash/_baseKeysIn.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_baseKeysIn.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    isPrototype = __webpack_require__(/*! ./_isPrototype */ "./node_modules/lodash/_isPrototype.js"),
    nativeKeysIn = __webpack_require__(/*! ./_nativeKeysIn */ "./node_modules/lodash/_nativeKeysIn.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeysIn;


/***/ }),

/***/ "./node_modules/lodash/_baseMerge.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseMerge.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Stack = __webpack_require__(/*! ./_Stack */ "./node_modules/lodash/_Stack.js"),
    assignMergeValue = __webpack_require__(/*! ./_assignMergeValue */ "./node_modules/lodash/_assignMergeValue.js"),
    baseFor = __webpack_require__(/*! ./_baseFor */ "./node_modules/lodash/_baseFor.js"),
    baseMergeDeep = __webpack_require__(/*! ./_baseMergeDeep */ "./node_modules/lodash/_baseMergeDeep.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    keysIn = __webpack_require__(/*! ./keysIn */ "./node_modules/lodash/keysIn.js"),
    safeGet = __webpack_require__(/*! ./_safeGet */ "./node_modules/lodash/_safeGet.js");

/**
 * The base implementation of `_.merge` without support for multiple sources.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  baseFor(source, function(srcValue, key) {
    if (isObject(srcValue)) {
      stack || (stack = new Stack);
      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
    }
    else {
      var newValue = customizer
        ? customizer(safeGet(object, key), srcValue, (key + ''), object, source, stack)
        : undefined;

      if (newValue === undefined) {
        newValue = srcValue;
      }
      assignMergeValue(object, key, newValue);
    }
  }, keysIn);
}

module.exports = baseMerge;


/***/ }),

/***/ "./node_modules/lodash/_baseMergeDeep.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_baseMergeDeep.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var assignMergeValue = __webpack_require__(/*! ./_assignMergeValue */ "./node_modules/lodash/_assignMergeValue.js"),
    cloneBuffer = __webpack_require__(/*! ./_cloneBuffer */ "./node_modules/lodash/_cloneBuffer.js"),
    cloneTypedArray = __webpack_require__(/*! ./_cloneTypedArray */ "./node_modules/lodash/_cloneTypedArray.js"),
    copyArray = __webpack_require__(/*! ./_copyArray */ "./node_modules/lodash/_copyArray.js"),
    initCloneObject = __webpack_require__(/*! ./_initCloneObject */ "./node_modules/lodash/_initCloneObject.js"),
    isArguments = __webpack_require__(/*! ./isArguments */ "./node_modules/lodash/isArguments.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isArrayLikeObject = __webpack_require__(/*! ./isArrayLikeObject */ "./node_modules/lodash/isArrayLikeObject.js"),
    isBuffer = __webpack_require__(/*! ./isBuffer */ "./node_modules/lodash/isBuffer.js"),
    isFunction = __webpack_require__(/*! ./isFunction */ "./node_modules/lodash/isFunction.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    isPlainObject = __webpack_require__(/*! ./isPlainObject */ "./node_modules/lodash/isPlainObject.js"),
    isTypedArray = __webpack_require__(/*! ./isTypedArray */ "./node_modules/lodash/isTypedArray.js"),
    safeGet = __webpack_require__(/*! ./_safeGet */ "./node_modules/lodash/_safeGet.js"),
    toPlainObject = __webpack_require__(/*! ./toPlainObject */ "./node_modules/lodash/toPlainObject.js");

/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = safeGet(object, key),
      srcValue = safeGet(source, key),
      stacked = stack.get(srcValue);

  if (stacked) {
    assignMergeValue(object, key, stacked);
    return;
  }
  var newValue = customizer
    ? customizer(objValue, srcValue, (key + ''), object, source, stack)
    : undefined;

  var isCommon = newValue === undefined;

  if (isCommon) {
    var isArr = isArray(srcValue),
        isBuff = !isArr && isBuffer(srcValue),
        isTyped = !isArr && !isBuff && isTypedArray(srcValue);

    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (isArray(objValue)) {
        newValue = objValue;
      }
      else if (isArrayLikeObject(objValue)) {
        newValue = copyArray(objValue);
      }
      else if (isBuff) {
        isCommon = false;
        newValue = cloneBuffer(srcValue, true);
      }
      else if (isTyped) {
        isCommon = false;
        newValue = cloneTypedArray(srcValue, true);
      }
      else {
        newValue = [];
      }
    }
    else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      newValue = objValue;
      if (isArguments(objValue)) {
        newValue = toPlainObject(objValue);
      }
      else if (!isObject(objValue) || (srcIndex && isFunction(objValue))) {
        newValue = initCloneObject(srcValue);
      }
    }
    else {
      isCommon = false;
    }
  }
  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack['delete'](srcValue);
  }
  assignMergeValue(object, key, newValue);
}

module.exports = baseMergeDeep;


/***/ }),

/***/ "./node_modules/lodash/_basePick.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_basePick.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var basePickBy = __webpack_require__(/*! ./_basePickBy */ "./node_modules/lodash/_basePickBy.js"),
    hasIn = __webpack_require__(/*! ./hasIn */ "./node_modules/lodash/hasIn.js");

/**
 * The base implementation of `_.pick` without support for individual
 * property identifiers.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} paths The property paths to pick.
 * @returns {Object} Returns the new object.
 */
function basePick(object, paths) {
  return basePickBy(object, paths, function(value, path) {
    return hasIn(object, path);
  });
}

module.exports = basePick;


/***/ }),

/***/ "./node_modules/lodash/_basePickBy.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_basePickBy.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGet = __webpack_require__(/*! ./_baseGet */ "./node_modules/lodash/_baseGet.js"),
    baseSet = __webpack_require__(/*! ./_baseSet */ "./node_modules/lodash/_baseSet.js"),
    castPath = __webpack_require__(/*! ./_castPath */ "./node_modules/lodash/_castPath.js");

/**
 * The base implementation of  `_.pickBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} paths The property paths to pick.
 * @param {Function} predicate The function invoked per property.
 * @returns {Object} Returns the new object.
 */
function basePickBy(object, paths, predicate) {
  var index = -1,
      length = paths.length,
      result = {};

  while (++index < length) {
    var path = paths[index],
        value = baseGet(object, path);

    if (predicate(value, path)) {
      baseSet(result, castPath(path, object), value);
    }
  }
  return result;
}

module.exports = basePickBy;


/***/ }),

/***/ "./node_modules/lodash/_baseRest.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_baseRest.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var identity = __webpack_require__(/*! ./identity */ "./node_modules/lodash/identity.js"),
    overRest = __webpack_require__(/*! ./_overRest */ "./node_modules/lodash/_overRest.js"),
    setToString = __webpack_require__(/*! ./_setToString */ "./node_modules/lodash/_setToString.js");

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

module.exports = baseRest;


/***/ }),

/***/ "./node_modules/lodash/_baseSet.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_baseSet.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var assignValue = __webpack_require__(/*! ./_assignValue */ "./node_modules/lodash/_assignValue.js"),
    castPath = __webpack_require__(/*! ./_castPath */ "./node_modules/lodash/_castPath.js"),
    isIndex = __webpack_require__(/*! ./_isIndex */ "./node_modules/lodash/_isIndex.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    toKey = __webpack_require__(/*! ./_toKey */ "./node_modules/lodash/_toKey.js");

/**
 * The base implementation of `_.set`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to set.
 * @param {*} value The value to set.
 * @param {Function} [customizer] The function to customize path creation.
 * @returns {Object} Returns `object`.
 */
function baseSet(object, path, value, customizer) {
  if (!isObject(object)) {
    return object;
  }
  path = castPath(path, object);

  var index = -1,
      length = path.length,
      lastIndex = length - 1,
      nested = object;

  while (nested != null && ++index < length) {
    var key = toKey(path[index]),
        newValue = value;

    if (index != lastIndex) {
      var objValue = nested[key];
      newValue = customizer ? customizer(objValue, key, nested) : undefined;
      if (newValue === undefined) {
        newValue = isObject(objValue)
          ? objValue
          : (isIndex(path[index + 1]) ? [] : {});
      }
    }
    assignValue(nested, key, newValue);
    nested = nested[key];
  }
  return object;
}

module.exports = baseSet;


/***/ }),

/***/ "./node_modules/lodash/_baseSetToString.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_baseSetToString.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var constant = __webpack_require__(/*! ./constant */ "./node_modules/lodash/constant.js"),
    defineProperty = __webpack_require__(/*! ./_defineProperty */ "./node_modules/lodash/_defineProperty.js"),
    identity = __webpack_require__(/*! ./identity */ "./node_modules/lodash/identity.js");

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !defineProperty ? identity : function(func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};

module.exports = baseSetToString;


/***/ }),

/***/ "./node_modules/lodash/_baseSlice.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseSlice.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

module.exports = baseSlice;


/***/ }),

/***/ "./node_modules/lodash/_baseTimes.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseTimes.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

module.exports = baseTimes;


/***/ }),

/***/ "./node_modules/lodash/_baseToString.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_baseToString.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js"),
    arrayMap = __webpack_require__(/*! ./_arrayMap */ "./node_modules/lodash/_arrayMap.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isSymbol = __webpack_require__(/*! ./isSymbol */ "./node_modules/lodash/isSymbol.js");

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap(value, baseToString) + '';
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

module.exports = baseToString;


/***/ }),

/***/ "./node_modules/lodash/_baseUnary.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseUnary.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

module.exports = baseUnary;


/***/ }),

/***/ "./node_modules/lodash/_baseUnset.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseUnset.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var castPath = __webpack_require__(/*! ./_castPath */ "./node_modules/lodash/_castPath.js"),
    last = __webpack_require__(/*! ./last */ "./node_modules/lodash/last.js"),
    parent = __webpack_require__(/*! ./_parent */ "./node_modules/lodash/_parent.js"),
    toKey = __webpack_require__(/*! ./_toKey */ "./node_modules/lodash/_toKey.js");

/**
 * The base implementation of `_.unset`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The property path to unset.
 * @returns {boolean} Returns `true` if the property is deleted, else `false`.
 */
function baseUnset(object, path) {
  path = castPath(path, object);
  object = parent(object, path);
  return object == null || delete object[toKey(last(path))];
}

module.exports = baseUnset;


/***/ }),

/***/ "./node_modules/lodash/_cacheHas.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_cacheHas.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

module.exports = cacheHas;


/***/ }),

/***/ "./node_modules/lodash/_castPath.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_castPath.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isKey = __webpack_require__(/*! ./_isKey */ "./node_modules/lodash/_isKey.js"),
    stringToPath = __webpack_require__(/*! ./_stringToPath */ "./node_modules/lodash/_stringToPath.js"),
    toString = __webpack_require__(/*! ./toString */ "./node_modules/lodash/toString.js");

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value, object) {
  if (isArray(value)) {
    return value;
  }
  return isKey(value, object) ? [value] : stringToPath(toString(value));
}

module.exports = castPath;


/***/ }),

/***/ "./node_modules/lodash/_cloneArrayBuffer.js":
/*!**************************************************!*\
  !*** ./node_modules/lodash/_cloneArrayBuffer.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Uint8Array = __webpack_require__(/*! ./_Uint8Array */ "./node_modules/lodash/_Uint8Array.js");

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

module.exports = cloneArrayBuffer;


/***/ }),

/***/ "./node_modules/lodash/_cloneBuffer.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_cloneBuffer.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

  buffer.copy(result);
  return result;
}

module.exports = cloneBuffer;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "./node_modules/lodash/_cloneDataView.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_cloneDataView.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var cloneArrayBuffer = __webpack_require__(/*! ./_cloneArrayBuffer */ "./node_modules/lodash/_cloneArrayBuffer.js");

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

module.exports = cloneDataView;


/***/ }),

/***/ "./node_modules/lodash/_cloneRegExp.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_cloneRegExp.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

module.exports = cloneRegExp;


/***/ }),

/***/ "./node_modules/lodash/_cloneSymbol.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_cloneSymbol.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js");

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

module.exports = cloneSymbol;


/***/ }),

/***/ "./node_modules/lodash/_cloneTypedArray.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_cloneTypedArray.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var cloneArrayBuffer = __webpack_require__(/*! ./_cloneArrayBuffer */ "./node_modules/lodash/_cloneArrayBuffer.js");

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

module.exports = cloneTypedArray;


/***/ }),

/***/ "./node_modules/lodash/_copyArray.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_copyArray.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

module.exports = copyArray;


/***/ }),

/***/ "./node_modules/lodash/_copyObject.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_copyObject.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var assignValue = __webpack_require__(/*! ./_assignValue */ "./node_modules/lodash/_assignValue.js"),
    baseAssignValue = __webpack_require__(/*! ./_baseAssignValue */ "./node_modules/lodash/_baseAssignValue.js");

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }
  return object;
}

module.exports = copyObject;


/***/ }),

/***/ "./node_modules/lodash/_copySymbols.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_copySymbols.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__(/*! ./_copyObject */ "./node_modules/lodash/_copyObject.js"),
    getSymbols = __webpack_require__(/*! ./_getSymbols */ "./node_modules/lodash/_getSymbols.js");

/**
 * Copies own symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return copyObject(source, getSymbols(source), object);
}

module.exports = copySymbols;


/***/ }),

/***/ "./node_modules/lodash/_copySymbolsIn.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_copySymbolsIn.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__(/*! ./_copyObject */ "./node_modules/lodash/_copyObject.js"),
    getSymbolsIn = __webpack_require__(/*! ./_getSymbolsIn */ "./node_modules/lodash/_getSymbolsIn.js");

/**
 * Copies own and inherited symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbolsIn(source, object) {
  return copyObject(source, getSymbolsIn(source), object);
}

module.exports = copySymbolsIn;


/***/ }),

/***/ "./node_modules/lodash/_coreJsData.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_coreJsData.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

module.exports = coreJsData;


/***/ }),

/***/ "./node_modules/lodash/_createAssigner.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_createAssigner.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseRest = __webpack_require__(/*! ./_baseRest */ "./node_modules/lodash/_baseRest.js"),
    isIterateeCall = __webpack_require__(/*! ./_isIterateeCall */ "./node_modules/lodash/_isIterateeCall.js");

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

module.exports = createAssigner;


/***/ }),

/***/ "./node_modules/lodash/_createBaseFor.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_createBaseFor.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

module.exports = createBaseFor;


/***/ }),

/***/ "./node_modules/lodash/_customOmitClone.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_customOmitClone.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isPlainObject = __webpack_require__(/*! ./isPlainObject */ "./node_modules/lodash/isPlainObject.js");

/**
 * Used by `_.omit` to customize its `_.cloneDeep` use to only clone plain
 * objects.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {string} key The key of the property to inspect.
 * @returns {*} Returns the uncloned value or `undefined` to defer cloning to `_.cloneDeep`.
 */
function customOmitClone(value) {
  return isPlainObject(value) ? undefined : value;
}

module.exports = customOmitClone;


/***/ }),

/***/ "./node_modules/lodash/_defineProperty.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_defineProperty.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js");

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

module.exports = defineProperty;


/***/ }),

/***/ "./node_modules/lodash/_equalArrays.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_equalArrays.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var SetCache = __webpack_require__(/*! ./_SetCache */ "./node_modules/lodash/_SetCache.js"),
    arraySome = __webpack_require__(/*! ./_arraySome */ "./node_modules/lodash/_arraySome.js"),
    cacheHas = __webpack_require__(/*! ./_cacheHas */ "./node_modules/lodash/_cacheHas.js");

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function(othValue, othIndex) {
            if (!cacheHas(seen, othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, bitmask, customizer, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

module.exports = equalArrays;


/***/ }),

/***/ "./node_modules/lodash/_equalByTag.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_equalByTag.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js"),
    Uint8Array = __webpack_require__(/*! ./_Uint8Array */ "./node_modules/lodash/_Uint8Array.js"),
    eq = __webpack_require__(/*! ./eq */ "./node_modules/lodash/eq.js"),
    equalArrays = __webpack_require__(/*! ./_equalArrays */ "./node_modules/lodash/_equalArrays.js"),
    mapToArray = __webpack_require__(/*! ./_mapToArray */ "./node_modules/lodash/_mapToArray.js"),
    setToArray = __webpack_require__(/*! ./_setToArray */ "./node_modules/lodash/_setToArray.js");

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/** `Object#toString` result references. */
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]';

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

module.exports = equalByTag;


/***/ }),

/***/ "./node_modules/lodash/_equalObjects.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_equalObjects.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getAllKeys = __webpack_require__(/*! ./_getAllKeys */ "./node_modules/lodash/_getAllKeys.js");

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      objProps = getAllKeys(object),
      objLength = objProps.length,
      othProps = getAllKeys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(object);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

module.exports = equalObjects;


/***/ }),

/***/ "./node_modules/lodash/_flatRest.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_flatRest.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var flatten = __webpack_require__(/*! ./flatten */ "./node_modules/lodash/flatten.js"),
    overRest = __webpack_require__(/*! ./_overRest */ "./node_modules/lodash/_overRest.js"),
    setToString = __webpack_require__(/*! ./_setToString */ "./node_modules/lodash/_setToString.js");

/**
 * A specialized version of `baseRest` which flattens the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @returns {Function} Returns the new function.
 */
function flatRest(func) {
  return setToString(overRest(func, undefined, flatten), func + '');
}

module.exports = flatRest;


/***/ }),

/***/ "./node_modules/lodash/_freeGlobal.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_freeGlobal.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/lodash/_getAllKeys.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_getAllKeys.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGetAllKeys = __webpack_require__(/*! ./_baseGetAllKeys */ "./node_modules/lodash/_baseGetAllKeys.js"),
    getSymbols = __webpack_require__(/*! ./_getSymbols */ "./node_modules/lodash/_getSymbols.js"),
    keys = __webpack_require__(/*! ./keys */ "./node_modules/lodash/keys.js");

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

module.exports = getAllKeys;


/***/ }),

/***/ "./node_modules/lodash/_getAllKeysIn.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_getAllKeysIn.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGetAllKeys = __webpack_require__(/*! ./_baseGetAllKeys */ "./node_modules/lodash/_baseGetAllKeys.js"),
    getSymbolsIn = __webpack_require__(/*! ./_getSymbolsIn */ "./node_modules/lodash/_getSymbolsIn.js"),
    keysIn = __webpack_require__(/*! ./keysIn */ "./node_modules/lodash/keysIn.js");

/**
 * Creates an array of own and inherited enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeysIn(object) {
  return baseGetAllKeys(object, keysIn, getSymbolsIn);
}

module.exports = getAllKeysIn;


/***/ }),

/***/ "./node_modules/lodash/_getMapData.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_getMapData.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isKeyable = __webpack_require__(/*! ./_isKeyable */ "./node_modules/lodash/_isKeyable.js");

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

module.exports = getMapData;


/***/ }),

/***/ "./node_modules/lodash/_getNative.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_getNative.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseIsNative = __webpack_require__(/*! ./_baseIsNative */ "./node_modules/lodash/_baseIsNative.js"),
    getValue = __webpack_require__(/*! ./_getValue */ "./node_modules/lodash/_getValue.js");

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

module.exports = getNative;


/***/ }),

/***/ "./node_modules/lodash/_getPrototype.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_getPrototype.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var overArg = __webpack_require__(/*! ./_overArg */ "./node_modules/lodash/_overArg.js");

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

module.exports = getPrototype;


/***/ }),

/***/ "./node_modules/lodash/_getRawTag.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_getRawTag.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;


/***/ }),

/***/ "./node_modules/lodash/_getSymbols.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_getSymbols.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var arrayFilter = __webpack_require__(/*! ./_arrayFilter */ "./node_modules/lodash/_arrayFilter.js"),
    stubArray = __webpack_require__(/*! ./stubArray */ "./node_modules/lodash/stubArray.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

module.exports = getSymbols;


/***/ }),

/***/ "./node_modules/lodash/_getSymbolsIn.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_getSymbolsIn.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var arrayPush = __webpack_require__(/*! ./_arrayPush */ "./node_modules/lodash/_arrayPush.js"),
    getPrototype = __webpack_require__(/*! ./_getPrototype */ "./node_modules/lodash/_getPrototype.js"),
    getSymbols = __webpack_require__(/*! ./_getSymbols */ "./node_modules/lodash/_getSymbols.js"),
    stubArray = __webpack_require__(/*! ./stubArray */ "./node_modules/lodash/stubArray.js");

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own and inherited enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
  var result = [];
  while (object) {
    arrayPush(result, getSymbols(object));
    object = getPrototype(object);
  }
  return result;
};

module.exports = getSymbolsIn;


/***/ }),

/***/ "./node_modules/lodash/_getTag.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/_getTag.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var DataView = __webpack_require__(/*! ./_DataView */ "./node_modules/lodash/_DataView.js"),
    Map = __webpack_require__(/*! ./_Map */ "./node_modules/lodash/_Map.js"),
    Promise = __webpack_require__(/*! ./_Promise */ "./node_modules/lodash/_Promise.js"),
    Set = __webpack_require__(/*! ./_Set */ "./node_modules/lodash/_Set.js"),
    WeakMap = __webpack_require__(/*! ./_WeakMap */ "./node_modules/lodash/_WeakMap.js"),
    baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    toSource = __webpack_require__(/*! ./_toSource */ "./node_modules/lodash/_toSource.js");

/** `Object#toString` result references. */
var mapTag = '[object Map]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    setTag = '[object Set]',
    weakMapTag = '[object WeakMap]';

var dataViewTag = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = baseGetTag(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

module.exports = getTag;


/***/ }),

/***/ "./node_modules/lodash/_getValue.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_getValue.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

module.exports = getValue;


/***/ }),

/***/ "./node_modules/lodash/_hasPath.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_hasPath.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var castPath = __webpack_require__(/*! ./_castPath */ "./node_modules/lodash/_castPath.js"),
    isArguments = __webpack_require__(/*! ./isArguments */ "./node_modules/lodash/isArguments.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isIndex = __webpack_require__(/*! ./_isIndex */ "./node_modules/lodash/_isIndex.js"),
    isLength = __webpack_require__(/*! ./isLength */ "./node_modules/lodash/isLength.js"),
    toKey = __webpack_require__(/*! ./_toKey */ "./node_modules/lodash/_toKey.js");

/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */
function hasPath(object, path, hasFunc) {
  path = castPath(path, object);

  var index = -1,
      length = path.length,
      result = false;

  while (++index < length) {
    var key = toKey(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength(length) && isIndex(key, length) &&
    (isArray(object) || isArguments(object));
}

module.exports = hasPath;


/***/ }),

/***/ "./node_modules/lodash/_hashClear.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_hashClear.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

module.exports = hashClear;


/***/ }),

/***/ "./node_modules/lodash/_hashDelete.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_hashDelete.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = hashDelete;


/***/ }),

/***/ "./node_modules/lodash/_hashGet.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_hashGet.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

module.exports = hashGet;


/***/ }),

/***/ "./node_modules/lodash/_hashHas.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_hashHas.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

module.exports = hashHas;


/***/ }),

/***/ "./node_modules/lodash/_hashSet.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_hashSet.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

module.exports = hashSet;


/***/ }),

/***/ "./node_modules/lodash/_initCloneArray.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_initCloneArray.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = new array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

module.exports = initCloneArray;


/***/ }),

/***/ "./node_modules/lodash/_initCloneByTag.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_initCloneByTag.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var cloneArrayBuffer = __webpack_require__(/*! ./_cloneArrayBuffer */ "./node_modules/lodash/_cloneArrayBuffer.js"),
    cloneDataView = __webpack_require__(/*! ./_cloneDataView */ "./node_modules/lodash/_cloneDataView.js"),
    cloneRegExp = __webpack_require__(/*! ./_cloneRegExp */ "./node_modules/lodash/_cloneRegExp.js"),
    cloneSymbol = __webpack_require__(/*! ./_cloneSymbol */ "./node_modules/lodash/_cloneSymbol.js"),
    cloneTypedArray = __webpack_require__(/*! ./_cloneTypedArray */ "./node_modules/lodash/_cloneTypedArray.js");

/** `Object#toString` result references. */
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag:
      return cloneArrayBuffer(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case dataViewTag:
      return cloneDataView(object, isDeep);

    case float32Tag: case float64Tag:
    case int8Tag: case int16Tag: case int32Tag:
    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
      return cloneTypedArray(object, isDeep);

    case mapTag:
      return new Ctor;

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      return cloneRegExp(object);

    case setTag:
      return new Ctor;

    case symbolTag:
      return cloneSymbol(object);
  }
}

module.exports = initCloneByTag;


/***/ }),

/***/ "./node_modules/lodash/_initCloneObject.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_initCloneObject.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseCreate = __webpack_require__(/*! ./_baseCreate */ "./node_modules/lodash/_baseCreate.js"),
    getPrototype = __webpack_require__(/*! ./_getPrototype */ "./node_modules/lodash/_getPrototype.js"),
    isPrototype = __webpack_require__(/*! ./_isPrototype */ "./node_modules/lodash/_isPrototype.js");

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate(getPrototype(object))
    : {};
}

module.exports = initCloneObject;


/***/ }),

/***/ "./node_modules/lodash/_isFlattenable.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_isFlattenable.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js"),
    isArguments = __webpack_require__(/*! ./isArguments */ "./node_modules/lodash/isArguments.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js");

/** Built-in value references. */
var spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined;

/**
 * Checks if `value` is a flattenable `arguments` object or array.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
 */
function isFlattenable(value) {
  return isArray(value) || isArguments(value) ||
    !!(spreadableSymbol && value && value[spreadableSymbol]);
}

module.exports = isFlattenable;


/***/ }),

/***/ "./node_modules/lodash/_isIndex.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_isIndex.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

module.exports = isIndex;


/***/ }),

/***/ "./node_modules/lodash/_isIterateeCall.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_isIterateeCall.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var eq = __webpack_require__(/*! ./eq */ "./node_modules/lodash/eq.js"),
    isArrayLike = __webpack_require__(/*! ./isArrayLike */ "./node_modules/lodash/isArrayLike.js"),
    isIndex = __webpack_require__(/*! ./_isIndex */ "./node_modules/lodash/_isIndex.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js");

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

module.exports = isIterateeCall;


/***/ }),

/***/ "./node_modules/lodash/_isKey.js":
/*!***************************************!*\
  !*** ./node_modules/lodash/_isKey.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isSymbol = __webpack_require__(/*! ./isSymbol */ "./node_modules/lodash/isSymbol.js");

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

module.exports = isKey;


/***/ }),

/***/ "./node_modules/lodash/_isKeyable.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_isKeyable.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

module.exports = isKeyable;


/***/ }),

/***/ "./node_modules/lodash/_isMasked.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_isMasked.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var coreJsData = __webpack_require__(/*! ./_coreJsData */ "./node_modules/lodash/_coreJsData.js");

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

module.exports = isMasked;


/***/ }),

/***/ "./node_modules/lodash/_isPrototype.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_isPrototype.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

module.exports = isPrototype;


/***/ }),

/***/ "./node_modules/lodash/_listCacheClear.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_listCacheClear.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

module.exports = listCacheClear;


/***/ }),

/***/ "./node_modules/lodash/_listCacheDelete.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_listCacheDelete.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

module.exports = listCacheDelete;


/***/ }),

/***/ "./node_modules/lodash/_listCacheGet.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_listCacheGet.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

module.exports = listCacheGet;


/***/ }),

/***/ "./node_modules/lodash/_listCacheHas.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_listCacheHas.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

module.exports = listCacheHas;


/***/ }),

/***/ "./node_modules/lodash/_listCacheSet.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_listCacheSet.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

module.exports = listCacheSet;


/***/ }),

/***/ "./node_modules/lodash/_mapCacheClear.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_mapCacheClear.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Hash = __webpack_require__(/*! ./_Hash */ "./node_modules/lodash/_Hash.js"),
    ListCache = __webpack_require__(/*! ./_ListCache */ "./node_modules/lodash/_ListCache.js"),
    Map = __webpack_require__(/*! ./_Map */ "./node_modules/lodash/_Map.js");

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

module.exports = mapCacheClear;


/***/ }),

/***/ "./node_modules/lodash/_mapCacheDelete.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_mapCacheDelete.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = mapCacheDelete;


/***/ }),

/***/ "./node_modules/lodash/_mapCacheGet.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_mapCacheGet.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

module.exports = mapCacheGet;


/***/ }),

/***/ "./node_modules/lodash/_mapCacheHas.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_mapCacheHas.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

module.exports = mapCacheHas;


/***/ }),

/***/ "./node_modules/lodash/_mapCacheSet.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_mapCacheSet.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

module.exports = mapCacheSet;


/***/ }),

/***/ "./node_modules/lodash/_mapToArray.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_mapToArray.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

module.exports = mapToArray;


/***/ }),

/***/ "./node_modules/lodash/_memoizeCapped.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_memoizeCapped.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var memoize = __webpack_require__(/*! ./memoize */ "./node_modules/lodash/memoize.js");

/** Used as the maximum memoize cache size. */
var MAX_MEMOIZE_SIZE = 500;

/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */
function memoizeCapped(func) {
  var result = memoize(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });

  var cache = result.cache;
  return result;
}

module.exports = memoizeCapped;


/***/ }),

/***/ "./node_modules/lodash/_nativeCreate.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_nativeCreate.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js");

/* Built-in method references that are verified to be native. */
var nativeCreate = getNative(Object, 'create');

module.exports = nativeCreate;


/***/ }),

/***/ "./node_modules/lodash/_nativeKeys.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_nativeKeys.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var overArg = __webpack_require__(/*! ./_overArg */ "./node_modules/lodash/_overArg.js");

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

module.exports = nativeKeys;


/***/ }),

/***/ "./node_modules/lodash/_nativeKeysIn.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_nativeKeysIn.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

module.exports = nativeKeysIn;


/***/ }),

/***/ "./node_modules/lodash/_nodeUtil.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_nodeUtil.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var freeGlobal = __webpack_require__(/*! ./_freeGlobal */ "./node_modules/lodash/_freeGlobal.js");

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule && freeModule.require && freeModule.require('util').types;

    if (types) {
      return types;
    }

    // Legacy `process.binding('util')` for Node.js < 10.
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "./node_modules/lodash/_objectToString.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_objectToString.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;


/***/ }),

/***/ "./node_modules/lodash/_overArg.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_overArg.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;


/***/ }),

/***/ "./node_modules/lodash/_overRest.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_overRest.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var apply = __webpack_require__(/*! ./_apply */ "./node_modules/lodash/_apply.js");

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

module.exports = overRest;


/***/ }),

/***/ "./node_modules/lodash/_parent.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/_parent.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGet = __webpack_require__(/*! ./_baseGet */ "./node_modules/lodash/_baseGet.js"),
    baseSlice = __webpack_require__(/*! ./_baseSlice */ "./node_modules/lodash/_baseSlice.js");

/**
 * Gets the parent value at `path` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} path The path to get the parent value of.
 * @returns {*} Returns the parent value.
 */
function parent(object, path) {
  return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
}

module.exports = parent;


/***/ }),

/***/ "./node_modules/lodash/_root.js":
/*!**************************************!*\
  !*** ./node_modules/lodash/_root.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var freeGlobal = __webpack_require__(/*! ./_freeGlobal */ "./node_modules/lodash/_freeGlobal.js");

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;


/***/ }),

/***/ "./node_modules/lodash/_safeGet.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_safeGet.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Gets the value at `key`, unless `key` is "__proto__".
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function safeGet(object, key) {
  return key == '__proto__'
    ? undefined
    : object[key];
}

module.exports = safeGet;


/***/ }),

/***/ "./node_modules/lodash/_setCacheAdd.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_setCacheAdd.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

module.exports = setCacheAdd;


/***/ }),

/***/ "./node_modules/lodash/_setCacheHas.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_setCacheHas.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

module.exports = setCacheHas;


/***/ }),

/***/ "./node_modules/lodash/_setToArray.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_setToArray.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

module.exports = setToArray;


/***/ }),

/***/ "./node_modules/lodash/_setToString.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_setToString.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseSetToString = __webpack_require__(/*! ./_baseSetToString */ "./node_modules/lodash/_baseSetToString.js"),
    shortOut = __webpack_require__(/*! ./_shortOut */ "./node_modules/lodash/_shortOut.js");

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = shortOut(baseSetToString);

module.exports = setToString;


/***/ }),

/***/ "./node_modules/lodash/_shortOut.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_shortOut.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
    HOT_SPAN = 16;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeNow = Date.now;

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

module.exports = shortOut;


/***/ }),

/***/ "./node_modules/lodash/_stackClear.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_stackClear.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var ListCache = __webpack_require__(/*! ./_ListCache */ "./node_modules/lodash/_ListCache.js");

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
  this.size = 0;
}

module.exports = stackClear;


/***/ }),

/***/ "./node_modules/lodash/_stackDelete.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_stackDelete.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

module.exports = stackDelete;


/***/ }),

/***/ "./node_modules/lodash/_stackGet.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_stackGet.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

module.exports = stackGet;


/***/ }),

/***/ "./node_modules/lodash/_stackHas.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_stackHas.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

module.exports = stackHas;


/***/ }),

/***/ "./node_modules/lodash/_stackSet.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_stackSet.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var ListCache = __webpack_require__(/*! ./_ListCache */ "./node_modules/lodash/_ListCache.js"),
    Map = __webpack_require__(/*! ./_Map */ "./node_modules/lodash/_Map.js"),
    MapCache = __webpack_require__(/*! ./_MapCache */ "./node_modules/lodash/_MapCache.js");

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

module.exports = stackSet;


/***/ }),

/***/ "./node_modules/lodash/_stringToPath.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_stringToPath.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var memoizeCapped = __webpack_require__(/*! ./_memoizeCapped */ "./node_modules/lodash/_memoizeCapped.js");

/** Used to match property names within property paths. */
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46 /* . */) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

module.exports = stringToPath;


/***/ }),

/***/ "./node_modules/lodash/_toKey.js":
/*!***************************************!*\
  !*** ./node_modules/lodash/_toKey.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isSymbol = __webpack_require__(/*! ./isSymbol */ "./node_modules/lodash/isSymbol.js");

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

module.exports = toKey;


/***/ }),

/***/ "./node_modules/lodash/_toSource.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_toSource.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

module.exports = toSource;


/***/ }),

/***/ "./node_modules/lodash/constant.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/constant.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

module.exports = constant;


/***/ }),

/***/ "./node_modules/lodash/debounce.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/debounce.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    now = __webpack_require__(/*! ./now */ "./node_modules/lodash/now.js"),
    toNumber = __webpack_require__(/*! ./toNumber */ "./node_modules/lodash/toNumber.js");

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        timeWaiting = wait - timeSinceLastCall;

    return maxing
      ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

module.exports = debounce;


/***/ }),

/***/ "./node_modules/lodash/eq.js":
/*!***********************************!*\
  !*** ./node_modules/lodash/eq.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

module.exports = eq;


/***/ }),

/***/ "./node_modules/lodash/flatten.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/flatten.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseFlatten = __webpack_require__(/*! ./_baseFlatten */ "./node_modules/lodash/_baseFlatten.js");

/**
 * Flattens `array` a single level deep.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to flatten.
 * @returns {Array} Returns the new flattened array.
 * @example
 *
 * _.flatten([1, [2, [3, [4]], 5]]);
 * // => [1, 2, [3, [4]], 5]
 */
function flatten(array) {
  var length = array == null ? 0 : array.length;
  return length ? baseFlatten(array, 1) : [];
}

module.exports = flatten;


/***/ }),

/***/ "./node_modules/lodash/hasIn.js":
/*!**************************************!*\
  !*** ./node_modules/lodash/hasIn.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseHasIn = __webpack_require__(/*! ./_baseHasIn */ "./node_modules/lodash/_baseHasIn.js"),
    hasPath = __webpack_require__(/*! ./_hasPath */ "./node_modules/lodash/_hasPath.js");

/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */
function hasIn(object, path) {
  return object != null && hasPath(object, path, baseHasIn);
}

module.exports = hasIn;


/***/ }),

/***/ "./node_modules/lodash/identity.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/identity.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;


/***/ }),

/***/ "./node_modules/lodash/isArguments.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/isArguments.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseIsArguments = __webpack_require__(/*! ./_baseIsArguments */ "./node_modules/lodash/_baseIsArguments.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

module.exports = isArguments;


/***/ }),

/***/ "./node_modules/lodash/isArray.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/isArray.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;


/***/ }),

/***/ "./node_modules/lodash/isArrayLike.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/isArrayLike.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isFunction = __webpack_require__(/*! ./isFunction */ "./node_modules/lodash/isFunction.js"),
    isLength = __webpack_require__(/*! ./isLength */ "./node_modules/lodash/isLength.js");

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

module.exports = isArrayLike;


/***/ }),

/***/ "./node_modules/lodash/isArrayLikeObject.js":
/*!**************************************************!*\
  !*** ./node_modules/lodash/isArrayLikeObject.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isArrayLike = __webpack_require__(/*! ./isArrayLike */ "./node_modules/lodash/isArrayLike.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

module.exports = isArrayLikeObject;


/***/ }),

/***/ "./node_modules/lodash/isBuffer.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/isBuffer.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js"),
    stubFalse = __webpack_require__(/*! ./stubFalse */ "./node_modules/lodash/stubFalse.js");

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

module.exports = isBuffer;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "./node_modules/lodash/isEqual.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/isEqual.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseIsEqual = __webpack_require__(/*! ./_baseIsEqual */ "./node_modules/lodash/_baseIsEqual.js");

/**
 * Performs a deep comparison between two values to determine if they are
 * equivalent.
 *
 * **Note:** This method supports comparing arrays, array buffers, booleans,
 * date objects, error objects, maps, numbers, `Object` objects, regexes,
 * sets, strings, symbols, and typed arrays. `Object` objects are compared
 * by their own, not inherited, enumerable properties. Functions and DOM
 * nodes are compared by strict equality, i.e. `===`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.isEqual(object, other);
 * // => true
 *
 * object === other;
 * // => false
 */
function isEqual(value, other) {
  return baseIsEqual(value, other);
}

module.exports = isEqual;


/***/ }),

/***/ "./node_modules/lodash/isFunction.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/isFunction.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js");

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

module.exports = isFunction;


/***/ }),

/***/ "./node_modules/lodash/isLength.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/isLength.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;


/***/ }),

/***/ "./node_modules/lodash/isMap.js":
/*!**************************************!*\
  !*** ./node_modules/lodash/isMap.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseIsMap = __webpack_require__(/*! ./_baseIsMap */ "./node_modules/lodash/_baseIsMap.js"),
    baseUnary = __webpack_require__(/*! ./_baseUnary */ "./node_modules/lodash/_baseUnary.js"),
    nodeUtil = __webpack_require__(/*! ./_nodeUtil */ "./node_modules/lodash/_nodeUtil.js");

/* Node.js helper references. */
var nodeIsMap = nodeUtil && nodeUtil.isMap;

/**
 * Checks if `value` is classified as a `Map` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 * @example
 *
 * _.isMap(new Map);
 * // => true
 *
 * _.isMap(new WeakMap);
 * // => false
 */
var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;

module.exports = isMap;


/***/ }),

/***/ "./node_modules/lodash/isObject.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/isObject.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;


/***/ }),

/***/ "./node_modules/lodash/isObjectLike.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/isObjectLike.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;


/***/ }),

/***/ "./node_modules/lodash/isPlainObject.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/isPlainObject.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    getPrototype = __webpack_require__(/*! ./_getPrototype */ "./node_modules/lodash/_getPrototype.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

module.exports = isPlainObject;


/***/ }),

/***/ "./node_modules/lodash/isSet.js":
/*!**************************************!*\
  !*** ./node_modules/lodash/isSet.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseIsSet = __webpack_require__(/*! ./_baseIsSet */ "./node_modules/lodash/_baseIsSet.js"),
    baseUnary = __webpack_require__(/*! ./_baseUnary */ "./node_modules/lodash/_baseUnary.js"),
    nodeUtil = __webpack_require__(/*! ./_nodeUtil */ "./node_modules/lodash/_nodeUtil.js");

/* Node.js helper references. */
var nodeIsSet = nodeUtil && nodeUtil.isSet;

/**
 * Checks if `value` is classified as a `Set` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 * @example
 *
 * _.isSet(new Set);
 * // => true
 *
 * _.isSet(new WeakSet);
 * // => false
 */
var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;

module.exports = isSet;


/***/ }),

/***/ "./node_modules/lodash/isSymbol.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/isSymbol.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

module.exports = isSymbol;


/***/ }),

/***/ "./node_modules/lodash/isTypedArray.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/isTypedArray.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseIsTypedArray = __webpack_require__(/*! ./_baseIsTypedArray */ "./node_modules/lodash/_baseIsTypedArray.js"),
    baseUnary = __webpack_require__(/*! ./_baseUnary */ "./node_modules/lodash/_baseUnary.js"),
    nodeUtil = __webpack_require__(/*! ./_nodeUtil */ "./node_modules/lodash/_nodeUtil.js");

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

module.exports = isTypedArray;


/***/ }),

/***/ "./node_modules/lodash/keys.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/keys.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var arrayLikeKeys = __webpack_require__(/*! ./_arrayLikeKeys */ "./node_modules/lodash/_arrayLikeKeys.js"),
    baseKeys = __webpack_require__(/*! ./_baseKeys */ "./node_modules/lodash/_baseKeys.js"),
    isArrayLike = __webpack_require__(/*! ./isArrayLike */ "./node_modules/lodash/isArrayLike.js");

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

module.exports = keys;


/***/ }),

/***/ "./node_modules/lodash/keysIn.js":
/*!***************************************!*\
  !*** ./node_modules/lodash/keysIn.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var arrayLikeKeys = __webpack_require__(/*! ./_arrayLikeKeys */ "./node_modules/lodash/_arrayLikeKeys.js"),
    baseKeysIn = __webpack_require__(/*! ./_baseKeysIn */ "./node_modules/lodash/_baseKeysIn.js"),
    isArrayLike = __webpack_require__(/*! ./isArrayLike */ "./node_modules/lodash/isArrayLike.js");

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

module.exports = keysIn;


/***/ }),

/***/ "./node_modules/lodash/last.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/last.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Gets the last element of `array`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the last element of `array`.
 * @example
 *
 * _.last([1, 2, 3]);
 * // => 3
 */
function last(array) {
  var length = array == null ? 0 : array.length;
  return length ? array[length - 1] : undefined;
}

module.exports = last;


/***/ }),

/***/ "./node_modules/lodash/memoize.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/memoize.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var MapCache = __webpack_require__(/*! ./_MapCache */ "./node_modules/lodash/_MapCache.js");

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Expose `MapCache`.
memoize.Cache = MapCache;

module.exports = memoize;


/***/ }),

/***/ "./node_modules/lodash/mergeWith.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/mergeWith.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseMerge = __webpack_require__(/*! ./_baseMerge */ "./node_modules/lodash/_baseMerge.js"),
    createAssigner = __webpack_require__(/*! ./_createAssigner */ "./node_modules/lodash/_createAssigner.js");

/**
 * This method is like `_.merge` except that it accepts `customizer` which
 * is invoked to produce the merged values of the destination and source
 * properties. If `customizer` returns `undefined`, merging is handled by the
 * method instead. The `customizer` is invoked with six arguments:
 * (objValue, srcValue, key, object, source, stack).
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} sources The source objects.
 * @param {Function} customizer The function to customize assigned values.
 * @returns {Object} Returns `object`.
 * @example
 *
 * function customizer(objValue, srcValue) {
 *   if (_.isArray(objValue)) {
 *     return objValue.concat(srcValue);
 *   }
 * }
 *
 * var object = { 'a': [1], 'b': [2] };
 * var other = { 'a': [3], 'b': [4] };
 *
 * _.mergeWith(object, other, customizer);
 * // => { 'a': [1, 3], 'b': [2, 4] }
 */
var mergeWith = createAssigner(function(object, source, srcIndex, customizer) {
  baseMerge(object, source, srcIndex, customizer);
});

module.exports = mergeWith;


/***/ }),

/***/ "./node_modules/lodash/now.js":
/*!************************************!*\
  !*** ./node_modules/lodash/now.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

module.exports = now;


/***/ }),

/***/ "./node_modules/lodash/omit.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/omit.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var arrayMap = __webpack_require__(/*! ./_arrayMap */ "./node_modules/lodash/_arrayMap.js"),
    baseClone = __webpack_require__(/*! ./_baseClone */ "./node_modules/lodash/_baseClone.js"),
    baseUnset = __webpack_require__(/*! ./_baseUnset */ "./node_modules/lodash/_baseUnset.js"),
    castPath = __webpack_require__(/*! ./_castPath */ "./node_modules/lodash/_castPath.js"),
    copyObject = __webpack_require__(/*! ./_copyObject */ "./node_modules/lodash/_copyObject.js"),
    customOmitClone = __webpack_require__(/*! ./_customOmitClone */ "./node_modules/lodash/_customOmitClone.js"),
    flatRest = __webpack_require__(/*! ./_flatRest */ "./node_modules/lodash/_flatRest.js"),
    getAllKeysIn = __webpack_require__(/*! ./_getAllKeysIn */ "./node_modules/lodash/_getAllKeysIn.js");

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG = 4;

/**
 * The opposite of `_.pick`; this method creates an object composed of the
 * own and inherited enumerable property paths of `object` that are not omitted.
 *
 * **Note:** This method is considerably slower than `_.pick`.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The source object.
 * @param {...(string|string[])} [paths] The property paths to omit.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * _.omit(object, ['a', 'c']);
 * // => { 'b': '2' }
 */
var omit = flatRest(function(object, paths) {
  var result = {};
  if (object == null) {
    return result;
  }
  var isDeep = false;
  paths = arrayMap(paths, function(path) {
    path = castPath(path, object);
    isDeep || (isDeep = path.length > 1);
    return path;
  });
  copyObject(object, getAllKeysIn(object), result);
  if (isDeep) {
    result = baseClone(result, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone);
  }
  var length = paths.length;
  while (length--) {
    baseUnset(result, paths[length]);
  }
  return result;
});

module.exports = omit;


/***/ }),

/***/ "./node_modules/lodash/pick.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/pick.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var basePick = __webpack_require__(/*! ./_basePick */ "./node_modules/lodash/_basePick.js"),
    flatRest = __webpack_require__(/*! ./_flatRest */ "./node_modules/lodash/_flatRest.js");

/**
 * Creates an object composed of the picked `object` properties.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The source object.
 * @param {...(string|string[])} [paths] The property paths to pick.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * _.pick(object, ['a', 'c']);
 * // => { 'a': 1, 'c': 3 }
 */
var pick = flatRest(function(object, paths) {
  return object == null ? {} : basePick(object, paths);
});

module.exports = pick;


/***/ }),

/***/ "./node_modules/lodash/stubArray.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/stubArray.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

module.exports = stubArray;


/***/ }),

/***/ "./node_modules/lodash/stubFalse.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/stubFalse.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = stubFalse;


/***/ }),

/***/ "./node_modules/lodash/throttle.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/throttle.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var debounce = __webpack_require__(/*! ./debounce */ "./node_modules/lodash/debounce.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js");

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

module.exports = throttle;


/***/ }),

/***/ "./node_modules/lodash/toNumber.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/toNumber.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    isSymbol = __webpack_require__(/*! ./isSymbol */ "./node_modules/lodash/isSymbol.js");

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = toNumber;


/***/ }),

/***/ "./node_modules/lodash/toPlainObject.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/toPlainObject.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__(/*! ./_copyObject */ "./node_modules/lodash/_copyObject.js"),
    keysIn = __webpack_require__(/*! ./keysIn */ "./node_modules/lodash/keysIn.js");

/**
 * Converts `value` to a plain object flattening inherited enumerable string
 * keyed properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */
function toPlainObject(value) {
  return copyObject(value, keysIn(value));
}

module.exports = toPlainObject;


/***/ }),

/***/ "./node_modules/lodash/toString.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/toString.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseToString = __webpack_require__(/*! ./_baseToString */ "./node_modules/lodash/_baseToString.js");

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

module.exports = toString;


/***/ }),

/***/ "./node_modules/ms/index.js":
/*!**********************************!*\
  !*** ./node_modules/ms/index.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}


/***/ }),

/***/ "./node_modules/prismjs/prism.js":
/*!***************************************!*\
  !*** ./node_modules/prismjs/prism.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {
/* **********************************************
     Begin prism-core.js
********************************************** */

var _self = (typeof window !== 'undefined')
	? window   // if in browser
	: (
		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
		? self // if in worker
		: {}   // if in node js
	);

/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

var Prism = (function(){

// Private helper vars
var lang = /\blang(?:uage)?-([\w-]+)\b/i;
var uniqueId = 0;

var _ = _self.Prism = {
	manual: _self.Prism && _self.Prism.manual,
	disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler,
	util: {
		encode: function (tokens) {
			if (tokens instanceof Token) {
				return new Token(tokens.type, _.util.encode(tokens.content), tokens.alias);
			} else if (_.util.type(tokens) === 'Array') {
				return tokens.map(_.util.encode);
			} else {
				return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
			}
		},

		type: function (o) {
			return Object.prototype.toString.call(o).match(/\[object (\w+)\]/)[1];
		},

		objId: function (obj) {
			if (!obj['__id']) {
				Object.defineProperty(obj, '__id', { value: ++uniqueId });
			}
			return obj['__id'];
		},

		// Deep clone a language definition (e.g. to extend it)
		clone: function (o, visited) {
			var type = _.util.type(o);
			visited = visited || {};

			switch (type) {
				case 'Object':
					if (visited[_.util.objId(o)]) {
						return visited[_.util.objId(o)];
					}
					var clone = {};
					visited[_.util.objId(o)] = clone;

					for (var key in o) {
						if (o.hasOwnProperty(key)) {
							clone[key] = _.util.clone(o[key], visited);
						}
					}

					return clone;

				case 'Array':
					if (visited[_.util.objId(o)]) {
						return visited[_.util.objId(o)];
					}
					var clone = [];
					visited[_.util.objId(o)] = clone;

					o.forEach(function (v, i) {
						clone[i] = _.util.clone(v, visited);
					});

					return clone;
			}

			return o;
		}
	},

	languages: {
		extend: function (id, redef) {
			var lang = _.util.clone(_.languages[id]);

			for (var key in redef) {
				lang[key] = redef[key];
			}

			return lang;
		},

		/**
		 * Insert a token before another token in a language literal
		 * As this needs to recreate the object (we cannot actually insert before keys in object literals),
		 * we cannot just provide an object, we need anobject and a key.
		 * @param inside The key (or language id) of the parent
		 * @param before The key to insert before. If not provided, the function appends instead.
		 * @param insert Object with the key/value pairs to insert
		 * @param root The object that contains `inside`. If equal to Prism.languages, it can be omitted.
		 */
		insertBefore: function (inside, before, insert, root) {
			root = root || _.languages;
			var grammar = root[inside];

			if (arguments.length == 2) {
				insert = arguments[1];

				for (var newToken in insert) {
					if (insert.hasOwnProperty(newToken)) {
						grammar[newToken] = insert[newToken];
					}
				}

				return grammar;
			}

			var ret = {};

			for (var token in grammar) {

				if (grammar.hasOwnProperty(token)) {

					if (token == before) {

						for (var newToken in insert) {

							if (insert.hasOwnProperty(newToken)) {
								ret[newToken] = insert[newToken];
							}
						}
					}

					ret[token] = grammar[token];
				}
			}

			// Update references in other language definitions
			_.languages.DFS(_.languages, function(key, value) {
				if (value === root[inside] && key != inside) {
					this[key] = ret;
				}
			});

			return root[inside] = ret;
		},

		// Traverse a language definition with Depth First Search
		DFS: function(o, callback, type, visited) {
			visited = visited || {};
			for (var i in o) {
				if (o.hasOwnProperty(i)) {
					callback.call(o, i, o[i], type || i);

					if (_.util.type(o[i]) === 'Object' && !visited[_.util.objId(o[i])]) {
						visited[_.util.objId(o[i])] = true;
						_.languages.DFS(o[i], callback, null, visited);
					}
					else if (_.util.type(o[i]) === 'Array' && !visited[_.util.objId(o[i])]) {
						visited[_.util.objId(o[i])] = true;
						_.languages.DFS(o[i], callback, i, visited);
					}
				}
			}
		}
	},
	plugins: {},

	highlightAll: function(async, callback) {
		_.highlightAllUnder(document, async, callback);
	},

	highlightAllUnder: function(container, async, callback) {
		var env = {
			callback: callback,
			selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
		};

		_.hooks.run("before-highlightall", env);

		var elements = env.elements || container.querySelectorAll(env.selector);

		for (var i=0, element; element = elements[i++];) {
			_.highlightElement(element, async === true, env.callback);
		}
	},

	highlightElement: function(element, async, callback) {
		// Find language
		var language, grammar, parent = element;

		while (parent && !lang.test(parent.className)) {
			parent = parent.parentNode;
		}

		if (parent) {
			language = (parent.className.match(lang) || [,''])[1].toLowerCase();
			grammar = _.languages[language];
		}

		// Set language on the element, if not present
		element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

		if (element.parentNode) {
			// Set language on the parent, for styling
			parent = element.parentNode;

			if (/pre/i.test(parent.nodeName)) {
				parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
			}
		}

		var code = element.textContent;

		var env = {
			element: element,
			language: language,
			grammar: grammar,
			code: code
		};

		_.hooks.run('before-sanity-check', env);

		if (!env.code || !env.grammar) {
			if (env.code) {
				_.hooks.run('before-highlight', env);
				env.element.textContent = env.code;
				_.hooks.run('after-highlight', env);
			}
			_.hooks.run('complete', env);
			return;
		}

		_.hooks.run('before-highlight', env);

		if (async && _self.Worker) {
			var worker = new Worker(_.filename);

			worker.onmessage = function(evt) {
				env.highlightedCode = evt.data;

				_.hooks.run('before-insert', env);

				env.element.innerHTML = env.highlightedCode;

				callback && callback.call(env.element);
				_.hooks.run('after-highlight', env);
				_.hooks.run('complete', env);
			};

			worker.postMessage(JSON.stringify({
				language: env.language,
				code: env.code,
				immediateClose: true
			}));
		}
		else {
			env.highlightedCode = _.highlight(env.code, env.grammar, env.language);

			_.hooks.run('before-insert', env);

			env.element.innerHTML = env.highlightedCode;

			callback && callback.call(element);

			_.hooks.run('after-highlight', env);
			_.hooks.run('complete', env);
		}
	},

	highlight: function (text, grammar, language) {
		var env = {
			code: text,
			grammar: grammar,
			language: language
		};
		_.hooks.run('before-tokenize', env);
		env.tokens = _.tokenize(env.code, env.grammar);
		_.hooks.run('after-tokenize', env);
		return Token.stringify(_.util.encode(env.tokens), env.language);
	},

	matchGrammar: function (text, strarr, grammar, index, startPos, oneshot, target) {
		var Token = _.Token;

		for (var token in grammar) {
			if(!grammar.hasOwnProperty(token) || !grammar[token]) {
				continue;
			}

			if (token == target) {
				return;
			}

			var patterns = grammar[token];
			patterns = (_.util.type(patterns) === "Array") ? patterns : [patterns];

			for (var j = 0; j < patterns.length; ++j) {
				var pattern = patterns[j],
					inside = pattern.inside,
					lookbehind = !!pattern.lookbehind,
					greedy = !!pattern.greedy,
					lookbehindLength = 0,
					alias = pattern.alias;

				if (greedy && !pattern.pattern.global) {
					// Without the global flag, lastIndex won't work
					var flags = pattern.pattern.toString().match(/[imuy]*$/)[0];
					pattern.pattern = RegExp(pattern.pattern.source, flags + "g");
				}

				pattern = pattern.pattern || pattern;

				// Don’t cache length as it changes during the loop
				for (var i = index, pos = startPos; i < strarr.length; pos += strarr[i].length, ++i) {

					var str = strarr[i];

					if (strarr.length > text.length) {
						// Something went terribly wrong, ABORT, ABORT!
						return;
					}

					if (str instanceof Token) {
						continue;
					}

					if (greedy && i != strarr.length - 1) {
						pattern.lastIndex = pos;
						var match = pattern.exec(text);
						if (!match) {
							break;
						}

						var from = match.index + (lookbehind ? match[1].length : 0),
						    to = match.index + match[0].length,
						    k = i,
						    p = pos;

						for (var len = strarr.length; k < len && (p < to || (!strarr[k].type && !strarr[k - 1].greedy)); ++k) {
							p += strarr[k].length;
							// Move the index i to the element in strarr that is closest to from
							if (from >= p) {
								++i;
								pos = p;
							}
						}

						// If strarr[i] is a Token, then the match starts inside another Token, which is invalid
						if (strarr[i] instanceof Token) {
							continue;
						}

						// Number of tokens to delete and replace with the new match
						delNum = k - i;
						str = text.slice(pos, p);
						match.index -= pos;
					} else {
						pattern.lastIndex = 0;

						var match = pattern.exec(str),
							delNum = 1;
					}

					if (!match) {
						if (oneshot) {
							break;
						}

						continue;
					}

					if(lookbehind) {
						lookbehindLength = match[1] ? match[1].length : 0;
					}

					var from = match.index + lookbehindLength,
					    match = match[0].slice(lookbehindLength),
					    to = from + match.length,
					    before = str.slice(0, from),
					    after = str.slice(to);

					var args = [i, delNum];

					if (before) {
						++i;
						pos += before.length;
						args.push(before);
					}

					var wrapped = new Token(token, inside? _.tokenize(match, inside) : match, alias, match, greedy);

					args.push(wrapped);

					if (after) {
						args.push(after);
					}

					Array.prototype.splice.apply(strarr, args);

					if (delNum != 1)
						_.matchGrammar(text, strarr, grammar, i, pos, true, token);

					if (oneshot)
						break;
				}
			}
		}
	},

	tokenize: function(text, grammar, language) {
		var strarr = [text];

		var rest = grammar.rest;

		if (rest) {
			for (var token in rest) {
				grammar[token] = rest[token];
			}

			delete grammar.rest;
		}

		_.matchGrammar(text, strarr, grammar, 0, 0, false);

		return strarr;
	},

	hooks: {
		all: {},

		add: function (name, callback) {
			var hooks = _.hooks.all;

			hooks[name] = hooks[name] || [];

			hooks[name].push(callback);
		},

		run: function (name, env) {
			var callbacks = _.hooks.all[name];

			if (!callbacks || !callbacks.length) {
				return;
			}

			for (var i=0, callback; callback = callbacks[i++];) {
				callback(env);
			}
		}
	}
};

var Token = _.Token = function(type, content, alias, matchedStr, greedy) {
	this.type = type;
	this.content = content;
	this.alias = alias;
	// Copy of the full string this token was created from
	this.length = (matchedStr || "").length|0;
	this.greedy = !!greedy;
};

Token.stringify = function(o, language, parent) {
	if (typeof o == 'string') {
		return o;
	}

	if (_.util.type(o) === 'Array') {
		return o.map(function(element) {
			return Token.stringify(element, language, o);
		}).join('');
	}

	var env = {
		type: o.type,
		content: Token.stringify(o.content, language, parent),
		tag: 'span',
		classes: ['token', o.type],
		attributes: {},
		language: language,
		parent: parent
	};

	if (o.alias) {
		var aliases = _.util.type(o.alias) === 'Array' ? o.alias : [o.alias];
		Array.prototype.push.apply(env.classes, aliases);
	}

	_.hooks.run('wrap', env);

	var attributes = Object.keys(env.attributes).map(function(name) {
		return name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
	}).join(' ');

	return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + (attributes ? ' ' + attributes : '') + '>' + env.content + '</' + env.tag + '>';

};

if (!_self.document) {
	if (!_self.addEventListener) {
		// in Node.js
		return _self.Prism;
	}

	if (!_.disableWorkerMessageHandler) {
		// In worker
		_self.addEventListener('message', function (evt) {
			var message = JSON.parse(evt.data),
				lang = message.language,
				code = message.code,
				immediateClose = message.immediateClose;

			_self.postMessage(_.highlight(code, _.languages[lang], lang));
			if (immediateClose) {
				_self.close();
			}
		}, false);
	}

	return _self.Prism;
}

//Get current script and highlight
var script = document.currentScript || [].slice.call(document.getElementsByTagName("script")).pop();

if (script) {
	_.filename = script.src;

	if (!_.manual && !script.hasAttribute('data-manual')) {
		if(document.readyState !== "loading") {
			if (window.requestAnimationFrame) {
				window.requestAnimationFrame(_.highlightAll);
			} else {
				window.setTimeout(_.highlightAll, 16);
			}
		}
		else {
			document.addEventListener('DOMContentLoaded', _.highlightAll);
		}
	}
}

return _self.Prism;

})();

if (typeof module !== 'undefined' && module.exports) {
	module.exports = Prism;
}

// hack for components to work correctly in node.js
if (typeof global !== 'undefined') {
	global.Prism = Prism;
}


/* **********************************************
     Begin prism-markup.js
********************************************** */

Prism.languages.markup = {
	'comment': /<!--[\s\S]*?-->/,
	'prolog': /<\?[\s\S]+?\?>/,
	'doctype': /<!DOCTYPE[\s\S]+?>/i,
	'cdata': /<!\[CDATA\[[\s\S]*?]]>/i,
	'tag': {
		pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+))?)*\s*\/?>/i,
		greedy: true,
		inside: {
			'tag': {
				pattern: /^<\/?[^\s>\/]+/i,
				inside: {
					'punctuation': /^<\/?/,
					'namespace': /^[^\s>\/:]+:/
				}
			},
			'attr-value': {
				pattern: /=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+)/i,
				inside: {
					'punctuation': [
						/^=/,
						{
							pattern: /(^|[^\\])["']/,
							lookbehind: true
						}
					]
				}
			},
			'punctuation': /\/?>/,
			'attr-name': {
				pattern: /[^\s>\/]+/,
				inside: {
					'namespace': /^[^\s>\/:]+:/
				}
			}

		}
	},
	'entity': /&#?[\da-z]{1,8};/i
};

Prism.languages.markup['tag'].inside['attr-value'].inside['entity'] =
	Prism.languages.markup['entity'];

// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add('wrap', function(env) {

	if (env.type === 'entity') {
		env.attributes['title'] = env.content.replace(/&amp;/, '&');
	}
});

Prism.languages.xml = Prism.languages.markup;
Prism.languages.html = Prism.languages.markup;
Prism.languages.mathml = Prism.languages.markup;
Prism.languages.svg = Prism.languages.markup;


/* **********************************************
     Begin prism-css.js
********************************************** */

Prism.languages.css = {
	'comment': /\/\*[\s\S]*?\*\//,
	'atrule': {
		pattern: /@[\w-]+?.*?(?:;|(?=\s*\{))/i,
		inside: {
			'rule': /@[\w-]+/
			// See rest below
		}
	},
	'url': /url\((?:(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,
	'selector': /[^{}\s][^{};]*?(?=\s*\{)/,
	'string': {
		pattern: /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		greedy: true
	},
	'property': /[-_a-z\xA0-\uFFFF][-\w\xA0-\uFFFF]*(?=\s*:)/i,
	'important': /\B!important\b/i,
	'function': /[-a-z0-9]+(?=\()/i,
	'punctuation': /[(){};:]/
};

Prism.languages.css['atrule'].inside.rest = Prism.languages.css;

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'style': {
			pattern: /(<style[\s\S]*?>)[\s\S]*?(?=<\/style>)/i,
			lookbehind: true,
			inside: Prism.languages.css,
			alias: 'language-css',
			greedy: true
		}
	});

	Prism.languages.insertBefore('inside', 'attr-value', {
		'style-attr': {
			pattern: /\s*style=("|')(?:\\[\s\S]|(?!\1)[^\\])*\1/i,
			inside: {
				'attr-name': {
					pattern: /^\s*style/i,
					inside: Prism.languages.markup.tag.inside
				},
				'punctuation': /^\s*=\s*['"]|['"]\s*$/,
				'attr-value': {
					pattern: /.+/i,
					inside: Prism.languages.css
				}
			},
			alias: 'language-css'
		}
	}, Prism.languages.markup.tag);
}

/* **********************************************
     Begin prism-clike.js
********************************************** */

Prism.languages.clike = {
	'comment': [
		{
			pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
			lookbehind: true
		},
		{
			pattern: /(^|[^\\:])\/\/.*/,
			lookbehind: true,
			greedy: true
		}
	],
	'string': {
		pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		greedy: true
	},
	'class-name': {
		pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[\w.\\]+/i,
		lookbehind: true,
		inside: {
			punctuation: /[.\\]/
		}
	},
	'keyword': /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
	'boolean': /\b(?:true|false)\b/,
	'function': /[a-z0-9_]+(?=\()/i,
	'number': /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,
	'operator': /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,
	'punctuation': /[{}[\];(),.:]/
};


/* **********************************************
     Begin prism-javascript.js
********************************************** */

Prism.languages.javascript = Prism.languages.extend('clike', {
	'keyword': /\b(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/,
	'number': /\b(?:0[xX][\dA-Fa-f]+|0[bB][01]+|0[oO][0-7]+|NaN|Infinity)\b|(?:\b\d+\.?\d*|\B\.\d+)(?:[Ee][+-]?\d+)?/,
	// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
	'function': /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*\()/i,
	'operator': /-[-=]?|\+[+=]?|!=?=?|<<?=?|>>?>?=?|=(?:==?|>)?|&[&=]?|\|[|=]?|\*\*?=?|\/=?|~|\^=?|%=?|\?|\.{3}/
});

Prism.languages.insertBefore('javascript', 'keyword', {
	'regex': {
		pattern: /((?:^|[^$\w\xA0-\uFFFF."'\])\s])\s*)\/(\[[^\]\r\n]+]|\\.|[^/\\\[\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/,
		lookbehind: true,
		greedy: true
	},
	// This must be declared before keyword because we use "function" inside the look-forward
	'function-variable': {
		pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=\s*(?:function\b|(?:\([^()]*\)|[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/i,
		alias: 'function'
	},
	'constant': /\b[A-Z][A-Z\d_]*\b/
});

Prism.languages.insertBefore('javascript', 'string', {
	'template-string': {
		pattern: /`(?:\\[\s\S]|[^\\`])*`/,
		greedy: true,
		inside: {
			'interpolation': {
				pattern: /\$\{[^}]+\}/,
				inside: {
					'interpolation-punctuation': {
						pattern: /^\$\{|\}$/,
						alias: 'punctuation'
					},
					rest: Prism.languages.javascript
				}
			},
			'string': /[\s\S]+/
		}
	}
});

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'script': {
			pattern: /(<script[\s\S]*?>)[\s\S]*?(?=<\/script>)/i,
			lookbehind: true,
			inside: Prism.languages.javascript,
			alias: 'language-javascript',
			greedy: true
		}
	});
}

Prism.languages.js = Prism.languages.javascript;


/* **********************************************
     Begin prism-file-highlight.js
********************************************** */

(function () {
	if (typeof self === 'undefined' || !self.Prism || !self.document || !document.querySelector) {
		return;
	}

	self.Prism.fileHighlight = function() {

		var Extensions = {
			'js': 'javascript',
			'py': 'python',
			'rb': 'ruby',
			'ps1': 'powershell',
			'psm1': 'powershell',
			'sh': 'bash',
			'bat': 'batch',
			'h': 'c',
			'tex': 'latex'
		};

		Array.prototype.slice.call(document.querySelectorAll('pre[data-src]')).forEach(function (pre) {
			var src = pre.getAttribute('data-src');

			var language, parent = pre;
			var lang = /\blang(?:uage)?-(?!\*)([\w-]+)\b/i;
			while (parent && !lang.test(parent.className)) {
				parent = parent.parentNode;
			}

			if (parent) {
				language = (pre.className.match(lang) || [, ''])[1];
			}

			if (!language) {
				var extension = (src.match(/\.(\w+)$/) || [, ''])[1];
				language = Extensions[extension] || extension;
			}

			var code = document.createElement('code');
			code.className = 'language-' + language;

			pre.textContent = '';

			code.textContent = 'Loading…';

			pre.appendChild(code);

			var xhr = new XMLHttpRequest();

			xhr.open('GET', src, true);

			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {

					if (xhr.status < 400 && xhr.responseText) {
						code.textContent = xhr.responseText;

						Prism.highlightElement(code);
					}
					else if (xhr.status >= 400) {
						code.textContent = '✖ Error ' + xhr.status + ' while fetching file: ' + xhr.statusText;
					}
					else {
						code.textContent = '✖ Error: File does not exist or is empty';
					}
				}
			};

			if (pre.hasAttribute('data-download-link') && Prism.plugins.toolbar) {
				Prism.plugins.toolbar.registerButton('download-file', function () {
					var a = document.createElement('a');
					a.textContent = pre.getAttribute('data-download-link-label') || 'Download';
					a.setAttribute('download', '');
					a.href = src;
					return a;
				});
			}

			xhr.send(null);
		});

	};

	document.addEventListener('DOMContentLoaded', self.Prism.fileHighlight);

})();

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/react-immutable-proptypes/dist/ImmutablePropTypes.js":
/*!***************************************************************************!*\
  !*** ./node_modules/react-immutable-proptypes/dist/ImmutablePropTypes.js ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This is a straight rip-off of the React.js ReactPropTypes.js proptype validators,
 * modified to make it possible to validate Immutable.js data.
 *     ImmutableTypes.listOf is patterned after React.PropTypes.arrayOf, but for Immutable.List
 *     ImmutableTypes.shape  is based on React.PropTypes.shape, but for any Immutable.Iterable
 */


var Immutable = __webpack_require__(/*! immutable */ "./node_modules/immutable/dist/immutable.js");

var ANONYMOUS = "<<anonymous>>";

var ImmutablePropTypes = {
  listOf: createListOfTypeChecker,
  mapOf: createMapOfTypeChecker,
  orderedMapOf: createOrderedMapOfTypeChecker,
  setOf: createSetOfTypeChecker,
  orderedSetOf: createOrderedSetOfTypeChecker,
  stackOf: createStackOfTypeChecker,
  iterableOf: createIterableOfTypeChecker,
  recordOf: createRecordOfTypeChecker,
  shape: createShapeChecker,
  contains: createShapeChecker,
  mapContains: createMapContainsChecker,
  // Primitive Types
  list: createImmutableTypeChecker("List", Immutable.List.isList),
  map: createImmutableTypeChecker("Map", Immutable.Map.isMap),
  orderedMap: createImmutableTypeChecker("OrderedMap", Immutable.OrderedMap.isOrderedMap),
  set: createImmutableTypeChecker("Set", Immutable.Set.isSet),
  orderedSet: createImmutableTypeChecker("OrderedSet", Immutable.OrderedSet.isOrderedSet),
  stack: createImmutableTypeChecker("Stack", Immutable.Stack.isStack),
  seq: createImmutableTypeChecker("Seq", Immutable.Seq.isSeq),
  record: createImmutableTypeChecker("Record", function (isRecord) {
    return isRecord instanceof Immutable.Record;
  }),
  iterable: createImmutableTypeChecker("Iterable", Immutable.Iterable.isIterable)
};

function getPropType(propValue) {
  var propType = typeof propValue;
  if (Array.isArray(propValue)) {
    return "array";
  }
  if (propValue instanceof RegExp) {
    // Old webkits (at least until Android 4.0) return 'function' rather than
    // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
    // passes PropTypes.object.
    return "object";
  }
  if (propValue instanceof Immutable.Iterable) {
    return "Immutable." + propValue.toSource().split(" ")[0];
  }
  return propType;
}

function createChainableTypeChecker(validate) {
  function checkType(isRequired, props, propName, componentName, location, propFullName) {
    for (var _len = arguments.length, rest = Array(_len > 6 ? _len - 6 : 0), _key = 6; _key < _len; _key++) {
      rest[_key - 6] = arguments[_key];
    }

    propFullName = propFullName || propName;
    componentName = componentName || ANONYMOUS;
    if (props[propName] == null) {
      var locationName = location;
      if (isRequired) {
        return new Error("Required " + locationName + " `" + propFullName + "` was not specified in " + ("`" + componentName + "`."));
      }
    } else {
      return validate.apply(undefined, [props, propName, componentName, location, propFullName].concat(rest));
    }
  }

  var chainedCheckType = checkType.bind(null, false);
  chainedCheckType.isRequired = checkType.bind(null, true);

  return chainedCheckType;
}

function createImmutableTypeChecker(immutableClassName, immutableClassTypeValidator) {
  function validate(props, propName, componentName, location, propFullName) {
    var propValue = props[propName];
    if (!immutableClassTypeValidator(propValue)) {
      var propType = getPropType(propValue);
      return new Error("Invalid " + location + " `" + propFullName + "` of type `" + propType + "` " + ("supplied to `" + componentName + "`, expected `" + immutableClassName + "`."));
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createIterableTypeChecker(typeChecker, immutableClassName, immutableClassTypeValidator) {

  function validate(props, propName, componentName, location, propFullName) {
    for (var _len = arguments.length, rest = Array(_len > 5 ? _len - 5 : 0), _key = 5; _key < _len; _key++) {
      rest[_key - 5] = arguments[_key];
    }

    var propValue = props[propName];
    if (!immutableClassTypeValidator(propValue)) {
      var locationName = location;
      var propType = getPropType(propValue);
      return new Error("Invalid " + locationName + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected an Immutable.js " + immutableClassName + "."));
    }

    if (typeof typeChecker !== "function") {
      return new Error("Invalid typeChecker supplied to `" + componentName + "` " + ("for propType `" + propFullName + "`, expected a function."));
    }

    var propValues = propValue.toArray();
    for (var i = 0, len = propValues.length; i < len; i++) {
      var error = typeChecker.apply(undefined, [propValues, i, componentName, location, "" + propFullName + "[" + i + "]"].concat(rest));
      if (error instanceof Error) {
        return error;
      }
    }
  }
  return createChainableTypeChecker(validate);
}

function createKeysTypeChecker(typeChecker) {

  function validate(props, propName, componentName, location, propFullName) {
    for (var _len = arguments.length, rest = Array(_len > 5 ? _len - 5 : 0), _key = 5; _key < _len; _key++) {
      rest[_key - 5] = arguments[_key];
    }

    var propValue = props[propName];
    if (typeof typeChecker !== "function") {
      return new Error("Invalid keysTypeChecker (optional second argument) supplied to `" + componentName + "` " + ("for propType `" + propFullName + "`, expected a function."));
    }

    var keys = propValue.keySeq().toArray();
    for (var i = 0, len = keys.length; i < len; i++) {
      var error = typeChecker.apply(undefined, [keys, i, componentName, location, "" + propFullName + " -> key(" + keys[i] + ")"].concat(rest));
      if (error instanceof Error) {
        return error;
      }
    }
  }
  return createChainableTypeChecker(validate);
}

function createListOfTypeChecker(typeChecker) {
  return createIterableTypeChecker(typeChecker, "List", Immutable.List.isList);
}

function createMapOfTypeCheckerFactory(valuesTypeChecker, keysTypeChecker, immutableClassName, immutableClassTypeValidator) {
  function validate() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return createIterableTypeChecker(valuesTypeChecker, immutableClassName, immutableClassTypeValidator).apply(undefined, args) || keysTypeChecker && createKeysTypeChecker(keysTypeChecker).apply(undefined, args);
  }

  return createChainableTypeChecker(validate);
}

function createMapOfTypeChecker(valuesTypeChecker, keysTypeChecker) {
  return createMapOfTypeCheckerFactory(valuesTypeChecker, keysTypeChecker, "Map", Immutable.Map.isMap);
}

function createOrderedMapOfTypeChecker(valuesTypeChecker, keysTypeChecker) {
  return createMapOfTypeCheckerFactory(valuesTypeChecker, keysTypeChecker, "OrderedMap", Immutable.OrderedMap.isOrderedMap);
}

function createSetOfTypeChecker(typeChecker) {
  return createIterableTypeChecker(typeChecker, "Set", Immutable.Set.isSet);
}

function createOrderedSetOfTypeChecker(typeChecker) {
  return createIterableTypeChecker(typeChecker, "OrderedSet", Immutable.OrderedSet.isOrderedSet);
}

function createStackOfTypeChecker(typeChecker) {
  return createIterableTypeChecker(typeChecker, "Stack", Immutable.Stack.isStack);
}

function createIterableOfTypeChecker(typeChecker) {
  return createIterableTypeChecker(typeChecker, "Iterable", Immutable.Iterable.isIterable);
}

function createRecordOfTypeChecker(recordKeys) {
  function validate(props, propName, componentName, location, propFullName) {
    for (var _len = arguments.length, rest = Array(_len > 5 ? _len - 5 : 0), _key = 5; _key < _len; _key++) {
      rest[_key - 5] = arguments[_key];
    }

    var propValue = props[propName];
    if (!(propValue instanceof Immutable.Record)) {
      var propType = getPropType(propValue);
      var locationName = location;
      return new Error("Invalid " + locationName + " `" + propFullName + "` of type `" + propType + "` " + ("supplied to `" + componentName + "`, expected an Immutable.js Record."));
    }
    for (var key in recordKeys) {
      var checker = recordKeys[key];
      if (!checker) {
        continue;
      }
      var mutablePropValue = propValue.toObject();
      var error = checker.apply(undefined, [mutablePropValue, key, componentName, location, "" + propFullName + "." + key].concat(rest));
      if (error) {
        return error;
      }
    }
  }
  return createChainableTypeChecker(validate);
}

// there is some irony in the fact that shapeTypes is a standard hash and not an immutable collection
function createShapeTypeChecker(shapeTypes) {
  var immutableClassName = arguments[1] === undefined ? "Iterable" : arguments[1];
  var immutableClassTypeValidator = arguments[2] === undefined ? Immutable.Iterable.isIterable : arguments[2];

  function validate(props, propName, componentName, location, propFullName) {
    for (var _len = arguments.length, rest = Array(_len > 5 ? _len - 5 : 0), _key = 5; _key < _len; _key++) {
      rest[_key - 5] = arguments[_key];
    }

    var propValue = props[propName];
    if (!immutableClassTypeValidator(propValue)) {
      var propType = getPropType(propValue);
      var locationName = location;
      return new Error("Invalid " + locationName + " `" + propFullName + "` of type `" + propType + "` " + ("supplied to `" + componentName + "`, expected an Immutable.js " + immutableClassName + "."));
    }
    var mutablePropValue = propValue.toObject();
    for (var key in shapeTypes) {
      var checker = shapeTypes[key];
      if (!checker) {
        continue;
      }
      var error = checker.apply(undefined, [mutablePropValue, key, componentName, location, "" + propFullName + "." + key].concat(rest));
      if (error) {
        return error;
      }
    }
  }
  return createChainableTypeChecker(validate);
}

function createShapeChecker(shapeTypes) {
  return createShapeTypeChecker(shapeTypes);
}

function createMapContainsChecker(shapeTypes) {
  return createShapeTypeChecker(shapeTypes, "Map", Immutable.Map.isMap);
}

module.exports = ImmutablePropTypes;

/***/ }),

/***/ "./node_modules/react-portal/build/portal.js":
/*!***************************************************!*\
  !*** ./node_modules/react-portal/build/portal.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(/*! react-dom */ "./node_modules/react-dom/index.js");

var _reactDom2 = _interopRequireDefault(_reactDom);

var _propTypes = __webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var KEYCODES = {
  ESCAPE: 27
};

var Portal = function (_React$Component) {
  _inherits(Portal, _React$Component);

  function Portal() {
    _classCallCheck(this, Portal);

    var _this = _possibleConstructorReturn(this, (Portal.__proto__ || Object.getPrototypeOf(Portal)).call(this));

    _this.state = { active: false };
    _this.handleWrapperClick = _this.handleWrapperClick.bind(_this);
    _this.closePortal = _this.closePortal.bind(_this);
    _this.handleOutsideMouseClick = _this.handleOutsideMouseClick.bind(_this);
    _this.handleKeydown = _this.handleKeydown.bind(_this);
    _this.portal = null;
    _this.node = null;
    return _this;
  }

  _createClass(Portal, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (this.props.closeOnEsc) {
        document.addEventListener('keydown', this.handleKeydown);
      }

      if (this.props.closeOnOutsideClick) {
        document.addEventListener('mouseup', this.handleOutsideMouseClick);
        document.addEventListener('touchstart', this.handleOutsideMouseClick);
      }

      if (this.props.isOpened) {
        this.openPortal();
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      // portal's 'is open' state is handled through the prop isOpened
      if (typeof newProps.isOpened !== 'undefined') {
        if (newProps.isOpened) {
          if (this.state.active) {
            this.renderPortal(newProps);
          } else {
            this.openPortal(newProps);
          }
        }
        if (!newProps.isOpened && this.state.active) {
          this.closePortal();
        }
      }

      // portal handles its own 'is open' state
      if (typeof newProps.isOpened === 'undefined' && this.state.active) {
        this.renderPortal(newProps);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this.props.closeOnEsc) {
        document.removeEventListener('keydown', this.handleKeydown);
      }

      if (this.props.closeOnOutsideClick) {
        document.removeEventListener('mouseup', this.handleOutsideMouseClick);
        document.removeEventListener('touchstart', this.handleOutsideMouseClick);
      }

      this.closePortal(true);
    }
  }, {
    key: 'handleWrapperClick',
    value: function handleWrapperClick(e) {
      e.preventDefault();
      e.stopPropagation();
      if (this.state.active) {
        return;
      }
      this.openPortal();
    }
  }, {
    key: 'openPortal',
    value: function openPortal() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

      this.setState({ active: true });
      this.renderPortal(props);
      this.props.onOpen(this.node);
    }
  }, {
    key: 'closePortal',
    value: function closePortal() {
      var _this2 = this;

      var isUnmounted = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var resetPortalState = function resetPortalState(overrideIsUnmounted) {
        if (_this2.node) {
          _reactDom2.default.unmountComponentAtNode(_this2.node);
          document.body.removeChild(_this2.node);
        }
        _this2.portal = null;
        _this2.node = null;

        var finalIsUnmounted = overrideIsUnmounted === undefined ? isUnmounted : overrideIsUnmounted;

        if (finalIsUnmounted !== true) {
          _this2.setState({ active: false });
        }
      };

      if (this.state.active) {
        if (this.props.beforeClose) {
          this.props.beforeClose(this.node, resetPortalState);
        } else {
          resetPortalState();
        }

        this.props.onClose();
      }
    }
  }, {
    key: 'handleOutsideMouseClick',
    value: function handleOutsideMouseClick(e) {
      if (!this.state.active) {
        return;
      }

      var root = (0, _reactDom.findDOMNode)(this.portal);
      if (root.contains(e.target) || e.button && e.button !== 0) {
        return;
      }

      e.stopPropagation();
      this.closePortal();
    }
  }, {
    key: 'handleKeydown',
    value: function handleKeydown(e) {
      if (e.keyCode === KEYCODES.ESCAPE && this.state.active) {
        this.closePortal();
      }
    }
  }, {
    key: 'renderPortal',
    value: function renderPortal(props) {
      if (!this.node) {
        this.node = document.createElement('div');
        document.body.appendChild(this.node);
      }

      var children = props.children;
      // https://gist.github.com/jimfb/d99e0678e9da715ccf6454961ef04d1b
      if (typeof props.children.type === 'function') {
        children = _react2.default.cloneElement(props.children, { closePortal: this.closePortal });
      }

      this.portal = _reactDom2.default.unstable_renderSubtreeIntoContainer(this, children, this.node, this.props.onUpdate);
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.props.openByClickOn) {
        return _react2.default.cloneElement(this.props.openByClickOn, { onClick: this.handleWrapperClick });
      }
      return null;
    }
  }]);

  return Portal;
}(_react2.default.Component);

exports.default = Portal;


Portal.propTypes = {
  children: _propTypes2.default.element.isRequired,
  openByClickOn: _propTypes2.default.element,
  closeOnEsc: _propTypes2.default.bool,
  closeOnOutsideClick: _propTypes2.default.bool,
  isOpened: _propTypes2.default.bool,
  onOpen: _propTypes2.default.func,
  onClose: _propTypes2.default.func,
  beforeClose: _propTypes2.default.func,
  onUpdate: _propTypes2.default.func
};

Portal.defaultProps = {
  onOpen: function onOpen() {},
  onClose: function onClose() {},
  onUpdate: function onUpdate() {}
};
module.exports = exports['default'];


/***/ }),

/***/ "./node_modules/selection-is-backward/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/selection-is-backward/index.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function isBackward(selection) {
    var startNode = selection.anchorNode;
    var startOffset = selection.anchorOffset;
    var endNode = selection.focusNode;
    var endOffset = selection.focusOffset;

    var position = startNode.compareDocumentPosition(endNode);

    return !(position === 4 || (position === 0 && startOffset < endOffset));
}

module.exports = isBackward;


/***/ }),

/***/ "./node_modules/slate-base64-serializer/lib/slate-base64-serializer.es.js":
/*!********************************************************************************!*\
  !*** ./node_modules/slate-base64-serializer/lib/slate-base64-serializer.es.js ***!
  \********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var slate__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! slate */ "./node_modules/slate/lib/slate.es.js");
/* harmony import */ var isomorphic_base64__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! isomorphic-base64 */ "./node_modules/isomorphic-base64/browser.js");
/* harmony import */ var isomorphic_base64__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(isomorphic_base64__WEBPACK_IMPORTED_MODULE_1__);



/**
 * Encode a JSON `object` as base-64 `string`.
 *
 * @param {Object} object
 * @return {String}
 */

function encode(object) {
  var string = JSON.stringify(object);
  var encoded = Object(isomorphic_base64__WEBPACK_IMPORTED_MODULE_1__["btoa"])(encodeURIComponent(string));
  return encoded;
}

/**
 * Decode a base-64 `string` to a JSON `object`.
 *
 * @param {String} string
 * @return {Object}
 */

function decode(string) {
  var decoded = decodeURIComponent(Object(isomorphic_base64__WEBPACK_IMPORTED_MODULE_1__["atob"])(string));
  var object = JSON.parse(decoded);
  return object;
}

/**
 * Deserialize a Value `string`.
 *
 * @param {String} string
 * @return {Value}
 */

function deserialize(string, options) {
  var raw = decode(string);
  var value = slate__WEBPACK_IMPORTED_MODULE_0__["Value"].fromJSON(raw, options);
  return value;
}

/**
 * Deserialize a Node `string`.
 *
 * @param {String} string
 * @return {Node}
 */

function deserializeNode(string, options) {
  var raw = decode(string);
  var node = slate__WEBPACK_IMPORTED_MODULE_0__["Node"].fromJSON(raw, options);
  return node;
}

/**
 * Serialize a `value`.
 *
 * @param {Value} value
 * @return {String}
 */

function serialize(value, options) {
  var raw = value.toJSON(options);
  var encoded = encode(raw);
  return encoded;
}

/**
 * Serialize a `node`.
 *
 * @param {Node} node
 * @return {String}
 */

function serializeNode(node, options) {
  var raw = node.toJSON(options);
  var encoded = encode(raw);
  return encoded;
}

/**
 * Export.
 *
 * @type {Object}
 */

var index = {
  deserialize: deserialize,
  deserializeNode: deserializeNode,
  serialize: serialize,
  serializeNode: serializeNode
};

/* harmony default export */ __webpack_exports__["default"] = (index);
//# sourceMappingURL=slate-base64-serializer.es.js.map


/***/ }),

/***/ "./node_modules/slate-dev-environment/lib/slate-dev-environment.es.js":
/*!****************************************************************************!*\
  !*** ./node_modules/slate-dev-environment/lib/slate-dev-environment.es.js ***!
  \****************************************************************************/
/*! exports provided: IS_CHROME, IS_OPERA, IS_FIREFOX, IS_SAFARI, IS_IE, IS_EDGE, IS_ANDROID, IS_IOS, IS_MAC, IS_WINDOWS, SUPPORTED_EVENTS */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IS_CHROME", function() { return IS_CHROME; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IS_OPERA", function() { return IS_OPERA; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IS_FIREFOX", function() { return IS_FIREFOX; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IS_SAFARI", function() { return IS_SAFARI; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IS_IE", function() { return IS_IE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IS_EDGE", function() { return IS_EDGE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IS_ANDROID", function() { return IS_ANDROID; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IS_IOS", function() { return IS_IOS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IS_MAC", function() { return IS_MAC; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IS_WINDOWS", function() { return IS_WINDOWS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SUPPORTED_EVENTS", function() { return SUPPORTED_EVENTS; });
/* harmony import */ var is_in_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! is-in-browser */ "./node_modules/is-in-browser/dist/module.js");


var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

/**
 * Browser matching rules.
 *
 * @type {Array}
 */

var BROWSER_RULES = [['edge', /Edge\/([0-9\._]+)/], ['chrome', /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/], ['firefox', /Firefox\/([0-9\.]+)(?:\s|$)/], ['opera', /Opera\/([0-9\.]+)(?:\s|$)/], ['opera', /OPR\/([0-9\.]+)(:?\s|$)$/], ['ie', /Trident\/7\.0.*rv\:([0-9\.]+)\).*Gecko$/], ['ie', /MSIE\s([0-9\.]+);.*Trident\/[4-7].0/], ['ie', /MSIE\s(7\.0)/], ['android', /Android\s([0-9\.]+)/], ['safari', /Version\/([0-9\._]+).*Safari/]];

/**
 * DOM event matching rules.
 *
 * @type {Array}
 */

var EVENT_RULES = [['beforeinput', function (el) {
  return 'onbeforeinput' in el;
}]];

/**
 * Operating system matching rules.
 *
 * @type {Array}
 */

var OS_RULES = [['ios', /os ([\.\_\d]+) like mac os/i], // must be before the macos rule
['macos', /mac os x/i], ['android', /android/i], ['firefoxos', /mozilla\/[a-z\.\_\d]+ \((?:mobile)|(?:tablet)/i], ['windows', /windows\s*(?:nt)?\s*([\.\_\d]+)/i]];

/**
 * Define variables to store the result.
 */

var BROWSER = void 0;
var EVENTS = {};
var OS = void 0;

/**
 * Run the matchers when in browser.
 */

if (is_in_browser__WEBPACK_IMPORTED_MODULE_0__["default"]) {
  var userAgent = window.navigator.userAgent;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {

    for (var _iterator = BROWSER_RULES[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _ref = _step.value;

      var _ref2 = slicedToArray(_ref, 2);

      var name = _ref2[0];
      var regexp = _ref2[1];

      if (regexp.test(userAgent)) {
        BROWSER = name;
        break;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = OS_RULES[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _ref3 = _step2.value;

      var _ref4 = slicedToArray(_ref3, 2);

      var _name = _ref4[0];
      var _regexp = _ref4[1];

      if (_regexp.test(userAgent)) {
        OS = _name;
        break;
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  var testEl = window.document.createElement('div');
  testEl.contentEditable = true;

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = EVENT_RULES[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _ref5 = _step3.value;

      var _ref6 = slicedToArray(_ref5, 2);

      var _name2 = _ref6[0];
      var testFn = _ref6[1];

      EVENTS[_name2] = testFn(testEl);
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }
}

/**
 * Export.
 *
 * @type {Object}
 */

var IS_CHROME = BROWSER === 'chrome';
var IS_OPERA = BROWSER === 'opera';
var IS_FIREFOX = BROWSER === 'firefox';
var IS_SAFARI = BROWSER === 'safari';
var IS_IE = BROWSER === 'ie';
var IS_EDGE = BROWSER === 'edge';

var IS_ANDROID = OS === 'android';
var IS_IOS = OS === 'ios';
var IS_MAC = OS === 'macos';
var IS_WINDOWS = OS === 'windows';

var SUPPORTED_EVENTS = EVENTS;


//# sourceMappingURL=slate-dev-environment.es.js.map


/***/ }),

/***/ "./node_modules/slate-dev-logger/lib/slate-dev-logger.es.js":
/*!******************************************************************!*\
  !*** ./node_modules/slate-dev-logger/lib/slate-dev-logger.es.js ***!
  \******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(global) {var global$1 = typeof global !== "undefined" ? global :
            typeof self !== "undefined" ? self :
            typeof window !== "undefined" ? window : {}

// shim for using process in browser
// based off https://github.com/defunctzombie/node-process/blob/master/browser.js

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
var cachedSetTimeout = defaultSetTimout;
var cachedClearTimeout = defaultClearTimeout;
if (typeof global$1.setTimeout === 'function') {
    cachedSetTimeout = setTimeout;
}
if (typeof global$1.clearTimeout === 'function') {
    cachedClearTimeout = clearTimeout;
}

function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}
function nextTick(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
}
// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
var title = 'browser';
var platform = 'browser';
var browser = true;
var env = {};
var argv = [];
var version = ''; // empty string to avoid regexp issues
var versions = {};
var release = {};
var config = {};

function noop() {}

var on = noop;
var addListener = noop;
var once = noop;
var off = noop;
var removeListener = noop;
var removeAllListeners = noop;
var emit = noop;

function binding(name) {
    throw new Error('process.binding is not supported');
}

function cwd () { return '/' }
function chdir (dir) {
    throw new Error('process.chdir is not supported');
}
function umask() { return 0; }

// from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
var performance = global$1.performance || {};
var performanceNow =
  performance.now        ||
  performance.mozNow     ||
  performance.msNow      ||
  performance.oNow       ||
  performance.webkitNow  ||
  function(){ return (new Date()).getTime() };

// generate timestamp or delta
// see http://nodejs.org/api/process.html#process_process_hrtime
function hrtime(previousTimestamp){
  var clocktime = performanceNow.call(performance)*1e-3;
  var seconds = Math.floor(clocktime);
  var nanoseconds = Math.floor((clocktime%1)*1e9);
  if (previousTimestamp) {
    seconds = seconds - previousTimestamp[0];
    nanoseconds = nanoseconds - previousTimestamp[1];
    if (nanoseconds<0) {
      seconds--;
      nanoseconds += 1e9;
    }
  }
  return [seconds,nanoseconds]
}

var startTime = new Date();
function uptime() {
  var currentTime = new Date();
  var dif = currentTime - startTime;
  return dif / 1000;
}

var process = {
  nextTick: nextTick,
  title: title,
  browser: browser,
  env: env,
  argv: argv,
  version: version,
  versions: versions,
  on: on,
  addListener: addListener,
  once: once,
  off: off,
  removeListener: removeListener,
  removeAllListeners: removeAllListeners,
  emit: emit,
  binding: binding,
  cwd: cwd,
  chdir: chdir,
  umask: umask,
  hrtime: hrtime,
  platform: platform,
  release: release,
  config: config,
  uptime: uptime
};

/* eslint-disable no-console */

/**
 * Is in development?
 *
 * @type {Boolean}
 */

var IS_DEV = typeof process !== 'undefined' && process.env && "development" !== 'production';

/**
 * Has console?
 *
 * @type {Boolean}
 */

var HAS_CONSOLE = typeof console != 'undefined' && typeof console.log == 'function' && typeof console.warn == 'function' && typeof console.error == 'function';

/**
 * Log a `message` at `level`.
 *
 * @param {String} level
 * @param {String} message
 * @param {Any} ...args
 */

function log(level, message) {
  if (!IS_DEV) {
    return;
  }

  if (HAS_CONSOLE) {
    var _console;

    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    (_console = console)[level].apply(_console, [message].concat(args));
  }
}

/**
 * Log an error `message`.
 *
 * @param {String} message
 * @param {Any} ...args
 */

function error(message) {
  if (HAS_CONSOLE) {
    var _console2;

    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    (_console2 = console).error.apply(_console2, [message].concat(args));
  }
}

/**
 * Log a warning `message` in development only.
 *
 * @param {String} message
 * @param {Any} ...args
 */

function warn(message) {
  for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    args[_key3 - 1] = arguments[_key3];
  }

  log.apply(undefined, ['warn', 'Warning: ' + message].concat(args));
}

/**
 * Log a deprecation warning `message`, with helpful `version` number in
 * development only.
 *
 * @param {String} version
 * @param {String} message
 * @param {Any} ...args
 */

function deprecate(version$$1, message) {
  for (var _len4 = arguments.length, args = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
    args[_key4 - 2] = arguments[_key4];
  }

  log.apply(undefined, ['warn', 'Deprecation (' + version$$1 + '): ' + message].concat(args));
}

/**
 * Export.
 *
 * @type {Function}
 */

var index = {
  deprecate: deprecate,
  error: error,
  warn: warn
};

/* harmony default export */ __webpack_exports__["default"] = (index);
//# sourceMappingURL=slate-dev-logger.es.js.map

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/slate-hotkeys/lib/slate-hotkeys.es.js":
/*!************************************************************!*\
  !*** ./node_modules/slate-hotkeys/lib/slate-hotkeys.es.js ***!
  \************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var is_hotkey__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! is-hotkey */ "./node_modules/is-hotkey/lib/index.js");
/* harmony import */ var is_hotkey__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(is_hotkey__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var slate_dev_environment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! slate-dev-environment */ "./node_modules/slate-dev-environment/lib/slate-dev-environment.es.js");



/**
 * Is Apple?
 *
 * @type {Boolean}
 */

var IS_APPLE = slate_dev_environment__WEBPACK_IMPORTED_MODULE_1__["IS_IOS"] || slate_dev_environment__WEBPACK_IMPORTED_MODULE_1__["IS_MAC"];

/**
 * Hotkeys.
 *
 * @type {Function}
 */

var isBold = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('mod+b');
var isItalic = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('mod+i');

var isEnter = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('enter');
var isShiftEnter = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('shift+enter');
var isSplitBlock = function isSplitBlock(e) {
  return isEnter(e) || isShiftEnter(e);
};

var isBackspace = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('backspace');
var isShiftBackspace = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('shift+backspace');
var isDelete = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('delete');
var isShiftDelete = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('shift+delete');
var isDeleteBackward = function isDeleteBackward(e) {
  return isBackspace(e) || isShiftBackspace(e);
};
var isDeleteForward = function isDeleteForward(e) {
  return isDelete(e) || isShiftDelete(e);
};

var isDeleteCharBackwardMac = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('ctrl+h');
var isDeleteCharForwardMac = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('ctrl+d');
var isDeleteCharBackward = function isDeleteCharBackward(e) {
  return isDeleteBackward(e) || IS_APPLE && isDeleteCharBackwardMac(e);
};
var isDeleteCharForward = function isDeleteCharForward(e) {
  return isDeleteForward(e) || IS_APPLE && isDeleteCharForwardMac(e);
};

var isDeleteLineBackwardMac = function isDeleteLineBackwardMac(e) {
  return Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('cmd+shift+backspace', e) || Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('cmd+backspace', e);
};
var isDeleteLineForwardMac = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('ctrl+k');
var isDeleteLineBackward = function isDeleteLineBackward(e) {
  return IS_APPLE && isDeleteLineBackwardMac(e);
};
var isDeleteLineForward = function isDeleteLineForward(e) {
  return IS_APPLE && isDeleteLineForwardMac(e);
};

var isDeleteWordBackwardMac = function isDeleteWordBackwardMac(e) {
  return Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('shift+option+backspace', e) || Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('option+backspace', e);
};
var isDeleteWordBackwardPC = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('ctrl+backspace');
var isDeleteWordForwardMac = function isDeleteWordForwardMac(e) {
  return Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('shift+option+delete', e) || Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('option+delete', e);
};
var isDeleteWordForwardPC = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('ctrl+delete');
var isDeleteWordBackward = function isDeleteWordBackward(e) {
  return IS_APPLE ? isDeleteWordBackwardMac(e) : isDeleteWordBackwardPC(e);
};
var isDeleteWordForward = function isDeleteWordForward(e) {
  return IS_APPLE ? isDeleteWordForwardMac(e) : isDeleteWordForwardPC(e);
};

var isExtendCharForward = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('shift+right');
var isExtendCharBackward = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('shift+left');

var isRightArrow = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('right');
var isLeftArrow = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('left');
var isCollapseCharForward = function isCollapseCharForward(e) {
  return isRightArrow(e) && !isExtendCharForward(e);
};
var isCollapseCharBackward = function isCollapseCharBackward(e) {
  return isLeftArrow(e) && !isExtendCharBackward(e);
};

var isCollapseLineBackwardMac = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('option+up');
var isCollapseLineForwardMac = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('option+down');
var isCollapseLineBackward = function isCollapseLineBackward(e) {
  return IS_APPLE && isCollapseLineBackwardMac(e);
};
var isCollapseLineForward = function isCollapseLineForward(e) {
  return IS_APPLE && isCollapseLineForwardMac(e);
};

var isExtendLineBackwardMac = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('option+shift+up');
var isExtendLineForwardMac = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('option+shift+down');
var isExtendLineBackward = function isExtendLineBackward(e) {
  return IS_APPLE && isExtendLineBackwardMac(e);
};
var isExtendLineForward = function isExtendLineForward(e) {
  return IS_APPLE && isExtendLineForwardMac(e);
};

var isUndo = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('mod+z');
var isRedoMac = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('mod+shift+z');
var isRedoPC = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('mod+y');
var isRedo = function isRedo(e) {
  return IS_APPLE ? isRedoMac(e) : isRedoPC(e);
};

var isTransposeCharacterMac = Object(is_hotkey__WEBPACK_IMPORTED_MODULE_0__["isKeyHotkey"])('ctrl+t');
var isTransposeCharacter = function isTransposeCharacter(e) {
  return IS_APPLE && isTransposeCharacterMac(e);
};

var isContentEditable = function isContentEditable(e) {
  return isBold(e) || isDeleteCharBackward(e) || isDeleteCharForward(e) || isDeleteLineBackward(e) || isDeleteLineForward(e) || isDeleteWordBackward(e) || isDeleteWordForward(e) || isItalic(e) || isRedo(e) || isSplitBlock(e) || isTransposeCharacter(e) || isUndo(e);
};

var isComposing = function isComposing(e) {
  return e.key == 'ArrowDown' || e.key == 'ArrowLeft' || e.key == 'ArrowRight' || e.key == 'ArrowUp' || e.key == 'Backspace' || e.key == 'Enter';
};

/**
 * Export.
 *
 * @type {Object}
 */

var index = {
  isBold: isBold,
  isCollapseCharBackward: isCollapseCharBackward,
  isCollapseCharForward: isCollapseCharForward,
  isCollapseLineBackward: isCollapseLineBackward,
  isCollapseLineForward: isCollapseLineForward,
  isComposing: isComposing,
  isContentEditable: isContentEditable,
  isDeleteCharBackward: isDeleteCharBackward,
  isDeleteCharForward: isDeleteCharForward,
  isDeleteLineBackward: isDeleteLineBackward,
  isDeleteLineForward: isDeleteLineForward,
  isDeleteWordBackward: isDeleteWordBackward,
  isDeleteWordForward: isDeleteWordForward,
  isExtendCharBackward: isExtendCharBackward,
  isExtendCharForward: isExtendCharForward,
  isExtendLineBackward: isExtendLineBackward,
  isExtendLineForward: isExtendLineForward,
  isItalic: isItalic,
  isRedo: isRedo,
  isSplitBlock: isSplitBlock,
  isUndo: isUndo
};

/* harmony default export */ __webpack_exports__["default"] = (index);
//# sourceMappingURL=slate-hotkeys.es.js.map


/***/ }),

/***/ "./node_modules/slate-plain-serializer/lib/slate-plain-serializer.es.js":
/*!******************************************************************************!*\
  !*** ./node_modules/slate-plain-serializer/lib/slate-plain-serializer.es.js ***!
  \******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var slate__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! slate */ "./node_modules/slate/lib/slate.es.js");
/* harmony import */ var immutable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! immutable */ "./node_modules/immutable/dist/immutable.js");
/* harmony import */ var immutable__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(immutable__WEBPACK_IMPORTED_MODULE_1__);



var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

/**
 * Deserialize a plain text `string` to a Slate value.
 *
 * @param {String} string
 * @param {Object} options
 *   @property {Boolean} toJSON
 *   @property {String|Object|Block} defaultBlock
 *   @property {Array|Set} defaultMarks
 * @return {Value}
 */

function deserialize(string) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$defaultBlock = options.defaultBlock,
      defaultBlock = _options$defaultBlock === undefined ? 'line' : _options$defaultBlock,
      _options$defaultMarks = options.defaultMarks,
      defaultMarks = _options$defaultMarks === undefined ? [] : _options$defaultMarks,
      _options$toJSON = options.toJSON,
      toJSON = _options$toJSON === undefined ? false : _options$toJSON;


  if (immutable__WEBPACK_IMPORTED_MODULE_1__["Set"].isSet(defaultMarks)) {
    defaultMarks = defaultMarks.toArray();
  }

  defaultBlock = slate__WEBPACK_IMPORTED_MODULE_0__["Node"].createProperties(defaultBlock);
  defaultMarks = defaultMarks.map(slate__WEBPACK_IMPORTED_MODULE_0__["Mark"].createProperties);

  var json = {
    object: 'value',
    document: {
      object: 'document',
      data: {},
      nodes: string.split('\n').map(function (line) {
        return _extends({}, defaultBlock, {
          object: 'block',
          isVoid: false,
          data: {},
          nodes: [{
            object: 'text',
            leaves: [{
              object: 'leaf',
              text: line,
              marks: defaultMarks
            }]
          }]
        });
      })
    }
  };

  var ret = toJSON ? json : slate__WEBPACK_IMPORTED_MODULE_0__["Value"].fromJSON(json);
  return ret;
}

/**
 * Serialize a Slate `value` to a plain text string.
 *
 * @param {Value} value
 * @return {String}
 */

function serialize(value) {
  return serializeNode(value.document);
}

/**
 * Serialize a `node` to plain text.
 *
 * @param {Node} node
 * @return {String}
 */

function serializeNode(node) {
  if (node.object == 'document' || node.object == 'block' && slate__WEBPACK_IMPORTED_MODULE_0__["Block"].isBlockList(node.nodes)) {
    return node.nodes.map(serializeNode).join('\n');
  } else {
    return node.text;
  }
}

/**
 * Export.
 *
 * @type {Object}
 */

var index = {
  deserialize: deserialize,
  serialize: serialize
};

/* harmony default export */ __webpack_exports__["default"] = (index);
//# sourceMappingURL=slate-plain-serializer.es.js.map


/***/ }),

/***/ "./node_modules/slate-prop-types/lib/slate-prop-types.es.js":
/*!******************************************************************!*\
  !*** ./node_modules/slate-prop-types/lib/slate-prop-types.es.js ***!
  \******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var slate__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! slate */ "./node_modules/slate/lib/slate.es.js");


/**
 * Create a prop type checker for Slate objects with `name` and `validate`.
 *
 * @param {String} name
 * @param {Function} validate
 * @return {Function}
 */

function create(name, validate) {
  function check(isRequired, props, propName, componentName, location) {
    var value = props[propName];
    if (value == null && !isRequired) return null;
    if (value == null && isRequired) return new Error('The ' + location + ' `' + propName + '` is marked as required in `' + componentName + '`, but it was not supplied.');
    if (validate(value)) return null;
    return new Error('Invalid ' + location + ' `' + propName + '` supplied to `' + componentName + '`, expected a Slate `' + name + '` but received: ' + value);
  }

  function propType() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return check.apply(undefined, [false].concat(args));
  }

  propType.isRequired = function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return check.apply(undefined, [true].concat(args));
  };

  return propType;
}

/**
 * Prop type checkers.
 *
 * @type {Object}
 */

var Types = {
  block: create('Block', function (v) {
    return slate__WEBPACK_IMPORTED_MODULE_0__["Block"].isBlock(v);
  }),
  blocks: create('List<Block>', function (v) {
    return slate__WEBPACK_IMPORTED_MODULE_0__["Block"].isBlockList(v);
  }),
  change: create('Change', function (v) {
    return slate__WEBPACK_IMPORTED_MODULE_0__["Change"].isChange(v);
  }),
  character: create('Character', function (v) {
    return slate__WEBPACK_IMPORTED_MODULE_0__["Character"].isCharacter(v);
  }),
  characters: create('List<Character>', function (v) {
    return slate__WEBPACK_IMPORTED_MODULE_0__["Character"].isCharacterList(v);
  }),
  data: create('Data', function (v) {
    return slate__WEBPACK_IMPORTED_MODULE_0__["Data"].isData(v);
  }),
  document: create('Document', function (v) {
    return slate__WEBPACK_IMPORTED_MODULE_0__["Document"].isDocument(v);
  }),
  history: create('History', function (v) {
    return slate__WEBPACK_IMPORTED_MODULE_0__["History"].isHistory(v);
  }),
  inline: create('Inline', function (v) {
    return slate__WEBPACK_IMPORTED_MODULE_0__["Inline"].isInline(v);
  }),
  inlines: create('Inline', function (v) {
    return slate__WEBPACK_IMPORTED_MODULE_0__["Inline"].isInlineList(v);
  }),
  leaf: create('Leaf', function (v) {
    return slate__WEBPACK_IMPORTED_MODULE_0__["Leaf"].isLeaf(v);
  }),
  leaves: create('List<Leaf>', function (v) {
    return slate__WEBPACK_IMPORTED_MODULE_0__["Leaf"].isLeafList(v);
  }),
  mark: create('Mark', function (v) {
    return slate__WEBPACK_IMPORTED_MODULE_0__["Mark"].isMark(v);
  }),
  marks: create('Set<Mark>', function (v) {
    return slate__WEBPACK_IMPORTED_MODULE_0__["Mark"].isMarkSet(v);
  }),
  node: create('Node', function (v) {
    return slate__WEBPACK_IMPORTED_MODULE_0__["Node"].isNode(v);
  }),
  nodes: create('List<Node>', function (v) {
    return slate__WEBPACK_IMPORTED_MODULE_0__["Node"].isNodeList(v);
  }),
  range: create('Range', function (v) {
    return slate__WEBPACK_IMPORTED_MODULE_0__["Range"].isRange(v);
  }),
  ranges: create('List<Range>', function (v) {
    return slate__WEBPACK_IMPORTED_MODULE_0__["Range"].isRangeList(v);
  }),
  schema: create('Schema', function (v) {
    return slate__WEBPACK_IMPORTED_MODULE_0__["Schema"].isSchema(v);
  }),
  stack: create('Stack', function (v) {
    return slate__WEBPACK_IMPORTED_MODULE_0__["Stack"].isStack(v);
  }),
  value: create('Value', function (v) {
    return slate__WEBPACK_IMPORTED_MODULE_0__["Value"].isValue(v);
  }),
  text: create('Text', function (v) {
    return slate__WEBPACK_IMPORTED_MODULE_0__["Text"].isText(v);
  }),
  texts: create('List<Text>', function (v) {
    return slate__WEBPACK_IMPORTED_MODULE_0__["Text"].isTextList(v);
  })

  /**
   * Export.
   *
   * @type {Object}
   */

};

/* harmony default export */ __webpack_exports__["default"] = (Types);
//# sourceMappingURL=slate-prop-types.es.js.map


/***/ }),

/***/ "./node_modules/slate-react/lib/slate-react.es.js":
/*!********************************************************!*\
  !*** ./node_modules/slate-react/lib/slate-react.es.js ***!
  \********************************************************/
/*! exports provided: default, Editor, cloneFragment, findDOMNode, findDOMRange, findNode, findRange, getEventRange, getEventTransfer, setEventTransfer, AfterPlugin, BeforePlugin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Editor", function() { return Editor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cloneFragment", function() { return cloneFragment; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findDOMNode", function() { return findDOMNode$1; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findDOMRange", function() { return findDOMRange; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findNode", function() { return findNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findRange", function() { return findRange; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getEventRange", function() { return getEventRange; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getEventTransfer", function() { return getEventTransfer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setEventTransfer", function() { return setEventTransfer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AfterPlugin", function() { return AfterPlugin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BeforePlugin", function() { return BeforePlugin; });
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(debug__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var slate_prop_types__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! slate-prop-types */ "./node_modules/slate-prop-types/lib/slate-prop-types.es.js");
/* harmony import */ var react_immutable_proptypes__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-immutable-proptypes */ "./node_modules/react-immutable-proptypes/dist/ImmutablePropTypes.js");
/* harmony import */ var react_immutable_proptypes__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_immutable_proptypes__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var immutable__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! immutable */ "./node_modules/immutable/dist/immutable.js");
/* harmony import */ var immutable__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(immutable__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var slate_dev_logger__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! slate-dev-logger */ "./node_modules/slate-dev-logger/lib/slate-dev-logger.es.js");
/* harmony import */ var slate__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! slate */ "./node_modules/slate/lib/slate.es.js");
/* harmony import */ var get_window__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! get-window */ "./node_modules/get-window/index.js");
/* harmony import */ var get_window__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(get_window__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var selection_is_backward__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! selection-is-backward */ "./node_modules/selection-is-backward/index.js");
/* harmony import */ var selection_is_backward__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(selection_is_backward__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! slate-dev-environment */ "./node_modules/slate-dev-environment/lib/slate-dev-environment.es.js");
/* harmony import */ var lodash_throttle__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! lodash/throttle */ "./node_modules/lodash/throttle.js");
/* harmony import */ var lodash_throttle__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(lodash_throttle__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var slate_base64_serializer__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! slate-base64-serializer */ "./node_modules/slate-base64-serializer/lib/slate-base64-serializer.es.js");
/* harmony import */ var slate_plain_serializer__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! slate-plain-serializer */ "./node_modules/slate-plain-serializer/lib/slate-plain-serializer.es.js");
/* harmony import */ var slate_hotkeys__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! slate-hotkeys */ "./node_modules/slate-hotkeys/lib/slate-hotkeys.es.js");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! react-dom */ "./node_modules/react-dom/index.js");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var react_portal__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! react-portal */ "./node_modules/react-portal/build/portal.js");
/* harmony import */ var react_portal__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(react_portal__WEBPACK_IMPORTED_MODULE_16__);


















/**
 * Event handlers used by Slate plugins.
 *
 * @type {Array}
 */

var EVENT_HANDLERS = ['onBeforeInput', 'onBlur', 'onClick', 'onCompositionEnd', 'onCompositionStart', 'onCopy', 'onCut', 'onDragEnd', 'onDragEnter', 'onDragExit', 'onDragLeave', 'onDragOver', 'onDragStart', 'onDrop', 'onInput', 'onFocus', 'onKeyDown', 'onKeyUp', 'onPaste', 'onSelect'];

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};



var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};





var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();













var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/**
 * Props that can be defined by plugins.
 *
 * @type {Array}
 */

var PLUGIN_PROPS = [].concat(toConsumableArray(EVENT_HANDLERS), ['decorateNode', 'onChange', 'renderMark', 'renderNode', 'renderPlaceholder', 'renderPortal', 'schema', 'validateNode']);

/**
 * Offset key parser regex.
 *
 * @type {RegExp}
 */

var PARSER = /^([\w-]+)(?::(\d+))?$/;

/**
 * Parse an offset key `string`.
 *
 * @param {String} string
 * @return {Object}
 */

function parse(string) {
  var matches = PARSER.exec(string);

  if (!matches) {
    throw new Error("Invalid offset key string \"" + string + "\".");
  }

  var _matches = slicedToArray(matches, 3),
      original = _matches[0],
      key = _matches[1],
      index = _matches[2]; // eslint-disable-line no-unused-vars


  return {
    key: key,
    index: parseInt(index, 10)
  };
}

/**
 * Stringify an offset key `object`.
 *
 * @param {Object} object
 *   @property {String} key
 *   @property {Number} index
 * @return {String}
 */

function stringify(object) {
  return object.key + ":" + object.index;
}

/**
 * Export.
 *
 * @type {Object}
 */

var OffsetKey = {
  parse: parse,
  stringify: stringify
};

/**
 * Debugger.
 *
 * @type {Function}
 */

var debug = debug__WEBPACK_IMPORTED_MODULE_0___default()('slate:leaves');

/**
 * Leaf.
 *
 * @type {Component}
 */

var Leaf = function (_React$Component) {
  inherits(Leaf, _React$Component);

  function Leaf() {
    var _ref;

    var _temp, _this, _ret;

    classCallCheck(this, Leaf);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = Leaf.__proto__ || Object.getPrototypeOf(Leaf)).call.apply(_ref, [this].concat(args))), _this), _initialiseProps.call(_this), _temp), possibleConstructorReturn(_this, _ret);
  }
  /**
   * Property types.
   *
   * @type {Object}
   */

  /**
   * Debug.
   *
   * @param {String} message
   * @param {Mixed} ...args
   */

  createClass(Leaf, [{
    key: 'shouldComponentUpdate',


    /**
     * Should component update?
     *
     * @param {Object} props
     * @return {Boolean}
     */

    value: function shouldComponentUpdate(props) {
      // If any of the regular properties have changed, re-render.
      if (props.index != this.props.index || props.marks != this.props.marks || props.text != this.props.text || props.parent != this.props.parent) {
        return true;
      }

      // Otherwise, don't update.
      return false;
    }

    /**
     * Render the leaf.
     *
     * @return {Element}
     */

  }, {
    key: 'render',
    value: function render() {
      this.debug('render', this);

      var _props = this.props,
          node = _props.node,
          index = _props.index;

      var offsetKey = OffsetKey.stringify({
        key: node.key,
        index: index
      });

      return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
        'span',
        { 'data-offset-key': offsetKey },
        this.renderMarks()
      );
    }

    /**
     * Render all of the leaf's mark components.
     *
     * @return {Element}
     */

  }, {
    key: 'renderMarks',
    value: function renderMarks() {
      var _props2 = this.props,
          marks = _props2.marks,
          node = _props2.node,
          offset = _props2.offset,
          text = _props2.text,
          editor = _props2.editor;
      var stack = editor.stack;

      var leaf = this.renderText();
      var attributes = {
        'data-slate-leaf': true
      };

      return marks.reduce(function (children, mark) {
        var props = {
          editor: editor,
          mark: mark,
          marks: marks,
          node: node,
          offset: offset,
          text: text,
          children: children,
          attributes: attributes
        };
        var element = stack.find('renderMark', props);
        return element || children;
      }, leaf);
    }

    /**
     * Render the text content of the leaf, accounting for browsers.
     *
     * @return {Element}
     */

  }, {
    key: 'renderText',
    value: function renderText() {
      var _props3 = this.props,
          block = _props3.block,
          node = _props3.node,
          parent = _props3.parent,
          text = _props3.text,
          index = _props3.index,
          leaves = _props3.leaves;

      // COMPAT: Render text inside void nodes with a zero-width space.
      // So the node can contain selection but the text is not visible.

      if (parent.isVoid) {
        return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
          'span',
          { 'data-slate-zero-width': 'z' },
          '\u200B'
        );
      }

      // COMPAT: If this is the last text node in an empty block, render a zero-
      // width space that will convert into a line break when copying and pasting
      // to support expected plain text.
      if (text === '' && parent.object === 'block' && parent.text === '' && parent.nodes.size === 1) {
        return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
          'span',
          { 'data-slate-zero-width': 'n' },
          '\u200B'
        );
      }

      // COMPAT: If the text is empty, it's because it's on the edge of an inline
      // void node, so we render a zero-width space so that the selection can be
      // inserted next to it still.
      if (text === '') {
        return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
          'span',
          { 'data-slate-zero-width': 'z' },
          '\u200B'
        );
      }

      // COMPAT: Browsers will collapse trailing new lines at the end of blocks,
      // so we need to add an extra trailing new lines to prevent that.
      var lastText = block.getLastText();
      var lastChar = text.charAt(text.length - 1);
      var isLastText = node === lastText;
      var isLastLeaf = index === leaves.size - 1;
      if (isLastText && isLastLeaf && lastChar === '\n') return text + '\n';

      // Otherwise, just return the text.
      return text;
    }
  }]);
  return Leaf;
}(react__WEBPACK_IMPORTED_MODULE_1___default.a.Component);

/**
 * Export.
 *
 * @type {Component}
 */

Leaf.propTypes = {
  block: slate_prop_types__WEBPACK_IMPORTED_MODULE_3__["default"].block.isRequired,
  editor: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.object.isRequired,
  index: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.number.isRequired,
  leaves: slate_prop_types__WEBPACK_IMPORTED_MODULE_3__["default"].leaves.isRequired,
  marks: slate_prop_types__WEBPACK_IMPORTED_MODULE_3__["default"].marks.isRequired,
  node: slate_prop_types__WEBPACK_IMPORTED_MODULE_3__["default"].node.isRequired,
  offset: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.number.isRequired,
  parent: slate_prop_types__WEBPACK_IMPORTED_MODULE_3__["default"].node.isRequired,
  text: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.string.isRequired };

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.debug = function (message) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    debug.apply(undefined, [message, _this2.props.node.key + '-' + _this2.props.index].concat(args));
  };
};

/**
 * Debug.
 *
 * @type {Function}
 */

var debug$1 = debug__WEBPACK_IMPORTED_MODULE_0___default()('slate:node');

/**
 * Text.
 *
 * @type {Component}
 */

var Text$1 = function (_React$Component) {
  inherits(Text$$1, _React$Component);

  function Text$$1() {
    var _ref;

    var _temp, _this, _ret;

    classCallCheck(this, Text$$1);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = Text$$1.__proto__ || Object.getPrototypeOf(Text$$1)).call.apply(_ref, [this].concat(args))), _this), _initialiseProps$1.call(_this), _temp), possibleConstructorReturn(_this, _ret);
  }
  /**
   * Property types.
   *
   * @type {Object}
   */

  /**
   * Default prop types.
   *
   * @type {Object}
   */

  /**
   * Debug.
   *
   * @param {String} message
   * @param {Mixed} ...args
   */

  /**
   * Should the node update?
   *
   * @param {Object} nextProps
   * @param {Object} value
   * @return {Boolean}
   */

  createClass(Text$$1, [{
    key: 'render',


    /**
     * Render.
     *
     * @return {Element}
     */

    value: function render() {
      var _this2 = this;

      this.debug('render', this);

      var _props = this.props,
          decorations = _props.decorations,
          editor = _props.editor,
          node = _props.node,
          style = _props.style;
      var value = editor.value;
      var document = value.document;
      var key = node.key;


      var decs = decorations.filter(function (d) {
        var startKey = d.startKey,
            endKey = d.endKey;

        if (startKey == key || endKey == key) return true;
        if (startKey === endKey) return false;
        var startsBefore = document.areDescendantsSorted(startKey, key);
        if (!startsBefore) return false;
        var endsAfter = document.areDescendantsSorted(key, endKey);
        return endsAfter;
      });

      // PERF: Take advantage of cache by avoiding arguments
      var leaves = decs.size === 0 ? node.getLeaves() : node.getLeaves(decs);
      var offset = 0;

      var children = leaves.map(function (leaf, i) {
        var child = _this2.renderLeaf(leaves, leaf, i, offset);
        offset += leaf.text.length;
        return child;
      });

      return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
        'span',
        { 'data-key': key, style: style },
        children
      );
    }

    /**
     * Render a single leaf given a `leaf` and `offset`.
     *
     * @param {List<Leaf>} leaves
     * @param {Leaf} leaf
     * @param {Number} index
     * @param {Number} offset
     * @return {Element} leaf
     */

  }]);
  return Text$$1;
}(react__WEBPACK_IMPORTED_MODULE_1___default.a.Component);

/**
 * Export.
 *
 * @type {Component}
 */

Text$1.propTypes = {
  block: slate_prop_types__WEBPACK_IMPORTED_MODULE_3__["default"].block,
  decorations: react_immutable_proptypes__WEBPACK_IMPORTED_MODULE_4___default.a.list.isRequired,
  editor: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.object.isRequired,
  node: slate_prop_types__WEBPACK_IMPORTED_MODULE_3__["default"].node.isRequired,
  parent: slate_prop_types__WEBPACK_IMPORTED_MODULE_3__["default"].node.isRequired,
  style: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.object };
Text$1.defaultProps = {
  style: null };

var _initialiseProps$1 = function _initialiseProps() {
  var _this3 = this;

  this.debug = function (message) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    var node = _this3.props.node;
    var key = node.key;

    debug$1.apply(undefined, [message, key + ' (text)'].concat(args));
  };

  this.shouldComponentUpdate = function (nextProps) {
    var props = _this3.props;

    var n = nextProps;
    var p = props;

    // If the node has changed, update. PERF: There are cases where it will have
    // changed, but it's properties will be exactly the same (eg. copy-paste)
    // which this won't catch. But that's rare and not a drag on performance, so
    // for simplicity we just let them through.
    if (n.node != p.node) return true;

    // If the node parent is a block node, and it was the last child of the
    // block, re-render to cleanup extra `\n`.
    if (n.parent.object == 'block') {
      var pLast = p.parent.nodes.last();
      var nLast = n.parent.nodes.last();
      if (p.node == pLast && n.node != nLast) return true;
    }

    // Re-render if the current decorations have changed.
    if (!n.decorations.equals(p.decorations)) return true;

    // Otherwise, don't update.
    return false;
  };

  this.renderLeaf = function (leaves, leaf, index, offset) {
    var _props2 = _this3.props,
        block = _props2.block,
        node = _props2.node,
        parent = _props2.parent,
        editor = _props2.editor;
    var text = leaf.text,
        marks = leaf.marks;


    return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(Leaf, {
      key: node.key + '-' + index,
      block: block,
      editor: editor,
      index: index,
      marks: marks,
      node: node,
      offset: offset,
      parent: parent,
      leaves: leaves,
      text: text
    });
  };
};

/**
 * Debug.
 *
 * @type {Function}
 */

var debug$2 = debug__WEBPACK_IMPORTED_MODULE_0___default()('slate:void');

/**
 * Void.
 *
 * @type {Component}
 */

var Void = function (_React$Component) {
  inherits(Void, _React$Component);

  function Void() {
    var _ref;

    var _temp, _this, _ret;

    classCallCheck(this, Void);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = Void.__proto__ || Object.getPrototypeOf(Void)).call.apply(_ref, [this].concat(args))), _this), _initialiseProps$2.call(_this), _temp), possibleConstructorReturn(_this, _ret);
  }
  /**
   * Property types.
   *
   * @type {Object}
   */

  /**
   * Debug.
   *
   * @param {String} message
   * @param {Mixed} ...args
   */

  createClass(Void, [{
    key: 'render',


    /**
     * Render.
     *
     * @return {Element}
     */

    value: function render() {
      var props = this.props;
      var children = props.children,
          node = props.node,
          readOnly = props.readOnly;

      var Tag = node.object == 'block' ? 'div' : 'span';
      var style = {
        height: '0',
        color: 'transparent',
        outline: 'none'
      };

      var spacer = react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
        Tag,
        { 'data-slate-spacer': true, style: style },
        this.renderText()
      );

      var content = react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
        Tag,
        { contentEditable: readOnly ? null : false },
        children
      );

      this.debug('render', { props: props });

      return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
        Tag,
        { 'data-slate-void': true, 'data-key': node.key },
        readOnly ? null : spacer,
        content
      );
    }

    /**
     * Render the void node's text node, which will catch the cursor when it the
     * void node is navigated to with the arrow keys.
     *
     * Having this text node there means the browser continues to manage the
     * selection natively, so it keeps track of the right offset when moving
     * across the block.
     *
     * @return {Element}
     */

  }]);
  return Void;
}(react__WEBPACK_IMPORTED_MODULE_1___default.a.Component);

/**
 * Export.
 *
 * @type {Component}
 */

Void.propTypes = {
  block: slate_prop_types__WEBPACK_IMPORTED_MODULE_3__["default"].block,
  children: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.any.isRequired,
  editor: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.object.isRequired,
  node: slate_prop_types__WEBPACK_IMPORTED_MODULE_3__["default"].node.isRequired,
  parent: slate_prop_types__WEBPACK_IMPORTED_MODULE_3__["default"].node.isRequired,
  readOnly: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.bool.isRequired };

var _initialiseProps$2 = function _initialiseProps() {
  var _this2 = this;

  this.debug = function (message) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    var node = _this2.props.node;
    var key = node.key,
        type = node.type;

    var id = key + ' (' + type + ')';
    debug$2.apply(undefined, [message, '' + id].concat(args));
  };

  this.renderText = function () {
    var _props = _this2.props,
        block = _props.block,
        decorations = _props.decorations,
        isSelected = _props.isSelected,
        node = _props.node,
        readOnly = _props.readOnly,
        editor = _props.editor;

    var child = node.getFirstText();
    return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(Text$1, {
      block: node.object == 'block' ? node : block,
      decorations: decorations,
      editor: editor,
      isSelected: isSelected,
      key: child.key,
      node: child,
      parent: node,
      readOnly: readOnly
    });
  };
};

/**
 * Split the decorations in lists of relevant decorations for each child.
 *
 * @param {Node} node
 * @param {List} decorations
 * @return {Array<List<Decoration>>}
 */

function getChildrenDecorations(node, decorations) {
  var activeDecorations = Object(immutable__WEBPACK_IMPORTED_MODULE_5__["Set"])().asMutable();
  var childrenDecorations = [];

  orderChildDecorations(node, decorations).forEach(function (item) {
    if (item.isRangeStart) {
      // Item is a decoration start
      activeDecorations.add(item.decoration);
    } else if (item.isRangeEnd) {
      // item is a decoration end
      activeDecorations.remove(item.decoration);
    } else {
      // Item is a child node
      childrenDecorations.push(activeDecorations.toList());
    }
  });

  return childrenDecorations;
}

/**
 * Orders the children of provided node and its decoration endpoints (start, end)
 * so that decorations can be passed only to relevant children (see use in Node.render())
 *
 * @param {Node} node
 * @param {List} decorations
 * @return {Array<Item>}
 *
 * where type Item =
 * {
 *   child: Node,
 *   // Index of the child in its parent
 *   index: number
 * }
 * or {
 *   // True if this represents the start of the given decoration
 *   isRangeStart: boolean,
 *   // True if this represents the end of the given decoration
 *   isRangeEnd: boolean,
 *   decoration: Range
 * }
 */

function orderChildDecorations(node, decorations) {
  if (decorations.isEmpty()) {
    return node.nodes.toArray().map(function (child, index) {
      return {
        child: child,
        index: index
      };
    });
  }

  // Map each key to its global order
  var keyOrders = defineProperty({}, node.key, 0);
  var globalOrder = 1;
  node.forEachDescendant(function (child) {
    keyOrders[child.key] = globalOrder;
    globalOrder = globalOrder + 1;
  });

  var childNodes = node.nodes.toArray();

  var endPoints = childNodes.map(function (child, index) {
    return {
      child: child,
      index: index,
      order: keyOrders[child.key]
    };
  });

  decorations.forEach(function (decoration) {
    // Range start.
    // A rangeStart should be before the child containing its startKey, in order
    // to consider it active before going down the child.
    var startKeyOrder = keyOrders[decoration.startKey];
    var containingChildOrder = startKeyOrder === undefined ? 0 : getContainingChildOrder(childNodes, keyOrders, startKeyOrder);
    endPoints.push({
      isRangeStart: true,
      order: containingChildOrder - 0.5,
      decoration: decoration
    });

    // Range end.
    var endKeyOrder = (keyOrders[decoration.endKey] || globalOrder) + 0.5;
    endPoints.push({
      isRangeEnd: true,
      order: endKeyOrder,
      decoration: decoration
    });
  });

  return endPoints.sort(function (a, b) {
    return a.order > b.order ? 1 : -1;
  });
}

/*
 * Returns the key order of the child right before the given order.
 */

function getContainingChildOrder(children, keyOrders, order) {
  // Find the first child that is after the given key
  var nextChildIndex = children.findIndex(function (child) {
    return order < keyOrders[child.key];
  });

  if (nextChildIndex <= 0) {
    return 0;
  }

  var containingChild = children[nextChildIndex - 1];
  return keyOrders[containingChild.key];
}

/**
 * Debug.
 *
 * @type {Function}
 */

var debug$3 = debug__WEBPACK_IMPORTED_MODULE_0___default()('slate:node');

/**
 * Node.
 *
 * @type {Component}
 */

var Node$1 = function (_React$Component) {
  inherits(Node$$1, _React$Component);

  function Node$$1() {
    var _ref;

    var _temp, _this, _ret;

    classCallCheck(this, Node$$1);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = Node$$1.__proto__ || Object.getPrototypeOf(Node$$1)).call.apply(_ref, [this].concat(args))), _this), _initialiseProps$3.call(_this), _temp), possibleConstructorReturn(_this, _ret);
  }
  /**
   * Property types.
   *
   * @type {Object}
   */

  /**
   * Debug.
   *
   * @param {String} message
   * @param {Mixed} ...args
   */

  /**
   * Should the node update?
   *
   * @param {Object} nextProps
   * @param {Object} value
   * @return {Boolean}
   */

  createClass(Node$$1, [{
    key: 'render',


    /**
     * Render.
     *
     * @return {Element}
     */

    value: function render() {
      var _this2 = this;

      this.debug('render', this);
      var _props = this.props,
          editor = _props.editor,
          isSelected = _props.isSelected,
          node = _props.node,
          decorations = _props.decorations,
          parent = _props.parent,
          readOnly = _props.readOnly;
      var value = editor.value;
      var selection = value.selection;
      var stack = editor.stack;

      var indexes = node.getSelectionIndexes(selection, isSelected);
      var decs = decorations.concat(node.getDecorations(stack));
      var childrenDecorations = getChildrenDecorations(node, decs);

      var children = [];
      node.nodes.forEach(function (child, i) {
        var isChildSelected = !!indexes && indexes.start <= i && i < indexes.end;

        children.push(_this2.renderNode(child, isChildSelected, childrenDecorations[i]));
      });

      // Attributes that the developer must mix into the element in their
      // custom node renderer component.
      var attributes = { 'data-key': node.key

        // If it's a block node with inline children, add the proper `dir` attribute
        // for text direction.
      };if (node.object == 'block' && node.nodes.first().object != 'block') {
        var direction = node.getTextDirection();
        if (direction == 'rtl') attributes.dir = 'rtl';
      }

      var props = {
        key: node.key,
        editor: editor,
        isSelected: isSelected,
        node: node,
        parent: parent,
        readOnly: readOnly
      };

      var placeholder = stack.find('renderPlaceholder', props);

      if (placeholder) {
        placeholder = react__WEBPACK_IMPORTED_MODULE_1___default.a.cloneElement(placeholder, {
          key: node.key + '-placeholder'
        });
        children = [placeholder].concat(toConsumableArray(children));
      }

      var element = stack.find('renderNode', _extends({}, props, {
        attributes: attributes,
        children: children
      }));

      return node.isVoid ? react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
        Void,
        this.props,
        element
      ) : element;
    }

    /**
     * Render a `child` node.
     *
     * @param {Node} child
     * @param {Boolean} isSelected
     * @param {Array<Decoration>} decorations
     * @return {Element}
     */

  }]);
  return Node$$1;
}(react__WEBPACK_IMPORTED_MODULE_1___default.a.Component);

/**
 * Export.
 *
 * @type {Component}
 */

Node$1.propTypes = {
  block: slate_prop_types__WEBPACK_IMPORTED_MODULE_3__["default"].block,
  decorations: react_immutable_proptypes__WEBPACK_IMPORTED_MODULE_4___default.a.list.isRequired,
  editor: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.object.isRequired,
  isSelected: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.bool.isRequired,
  node: slate_prop_types__WEBPACK_IMPORTED_MODULE_3__["default"].node.isRequired,
  parent: slate_prop_types__WEBPACK_IMPORTED_MODULE_3__["default"].node.isRequired,
  readOnly: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.bool.isRequired };

var _initialiseProps$3 = function _initialiseProps() {
  var _this3 = this;

  this.debug = function (message) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    var node = _this3.props.node;
    var key = node.key,
        type = node.type;

    debug$3.apply(undefined, [message, key + ' (' + type + ')'].concat(args));
  };

  this.shouldComponentUpdate = function (nextProps) {
    var props = _this3.props;
    var stack = props.editor.stack;

    var shouldUpdate = stack.find('shouldNodeComponentUpdate', props, nextProps);
    var n = nextProps;
    var p = props;

    // If the `Component` has a custom logic to determine whether the component
    // needs to be updated or not, return true if it returns true. If it returns
    // false, we need to ignore it, because it shouldn't be allowed it.
    if (shouldUpdate != null) {
      if (shouldUpdate) {
        return true;
      }

      if (shouldUpdate === false) {
        slate_dev_logger__WEBPACK_IMPORTED_MODULE_6__["default"].warn("Returning false in `shouldNodeComponentUpdate` does not disable Slate's internal `shouldComponentUpdate` logic. If you want to prevent updates, use React's `shouldComponentUpdate` instead.");
      }
    }

    // If the `readOnly` status has changed, re-render in case there is any
    // user-land logic that depends on it, like nested editable contents.
    if (n.readOnly != p.readOnly) return true;

    // If the node has changed, update. PERF: There are cases where it will have
    // changed, but it's properties will be exactly the same (eg. copy-paste)
    // which this won't catch. But that's rare and not a drag on performance, so
    // for simplicity we just let them through.
    if (n.node != p.node) return true;

    // If the selection value of the node or of some of its children has changed,
    // re-render in case there is any user-land logic depends on it to render.
    // if the node is selected update it, even if it was already selected: the
    // selection value of some of its children could have been changed and they
    // need to be rendered again.
    if (n.isSelected || p.isSelected) return true;

    // If the decorations have changed, update.
    if (!n.decorations.equals(p.decorations)) return true;

    // Otherwise, don't update.
    return false;
  };

  this.renderNode = function (child, isSelected, decorations) {
    var _props2 = _this3.props,
        block = _props2.block,
        editor = _props2.editor,
        node = _props2.node,
        readOnly = _props2.readOnly;

    var Component = child.object == 'text' ? Text$1 : Node$1;

    return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(Component, {
      block: node.object == 'block' ? node : block,
      decorations: decorations,
      editor: editor,
      isSelected: isSelected,
      key: child.key,
      node: child,
      parent: node,
      readOnly: readOnly
    });
  };
};

/**
 * Find the DOM node for a `key`.
 *
 * @param {String|Node} key
 * @param {Window} win (optional)
 * @return {Element}
 */

function findDOMNode$1(key) {
  var win = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : window;

  if (slate__WEBPACK_IMPORTED_MODULE_7__["Node"].isNode(key)) {
    key = key.key;
  }

  var el = win.document.querySelector('[data-key="' + key + '"]');

  if (!el) {
    throw new Error('Unable to find a DOM node for "' + key + '". This is often because of forgetting to add `props.attributes` to a custom component.');
  }

  return el;
}

/**
 * Find a native DOM selection point from a Slate `key` and `offset`.
 *
 * @param {String} key
 * @param {Number} offset
 * @param {Window} win (optional)
 * @return {Object|Null}
 */

function findDOMPoint(key, offset) {
  var win = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : window;

  var el = findDOMNode$1(key, win);
  var start = 0;
  var n = void 0;

  // COMPAT: In IE, this method's arguments are not optional, so we have to
  // pass in all four even though the last two are defaults. (2017/10/25)
  var iterator = win.document.createNodeIterator(el, NodeFilter.SHOW_TEXT, function () {
    return NodeFilter.FILTER_ACCEPT;
  }, false);

  while (n = iterator.nextNode()) {
    var length = n.textContent.length;

    var end = start + length;

    if (offset <= end) {
      var o = offset - start;
      return { node: n, offset: o >= 0 ? o : 0 };
    }

    start = end;
  }

  return null;
}

/**
 * Find a native DOM range Slate `range`.
 *
 * @param {Range} range
 * @param {Window} win (optional)
 * @return {Object|Null}
 */

function findDOMRange(range) {
  var win = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : window;
  var anchorKey = range.anchorKey,
      anchorOffset = range.anchorOffset,
      focusKey = range.focusKey,
      focusOffset = range.focusOffset,
      isBackward$$1 = range.isBackward,
      isCollapsed = range.isCollapsed;

  var anchor = findDOMPoint(anchorKey, anchorOffset, win);
  var focus = isCollapsed ? anchor : findDOMPoint(focusKey, focusOffset, win);
  if (!anchor || !focus) return null;

  var r = win.document.createRange();
  var start = isBackward$$1 ? focus : anchor;
  var end = isBackward$$1 ? anchor : focus;
  r.setStart(start.node, start.offset);
  r.setEnd(end.node, end.offset);
  return r;
}

/**
 * Constants.
 *
 * @type {String}
 */

var ZERO_WIDTH_ATTRIBUTE = 'data-slate-zero-width';
var ZERO_WIDTH_SELECTOR = '[' + ZERO_WIDTH_ATTRIBUTE + ']';
var OFFSET_KEY_ATTRIBUTE = 'data-offset-key';
var RANGE_SELECTOR = '[' + OFFSET_KEY_ATTRIBUTE + ']';
var TEXT_SELECTOR = '[data-key]';
var VOID_SELECTOR = '[data-slate-void]';

/**
 * Find a Slate point from a DOM selection's `nativeNode` and `nativeOffset`.
 *
 * @param {Element} nativeNode
 * @param {Number} nativeOffset
 * @param {Value} value
 * @return {Object}
 */

function findPoint(nativeNode, nativeOffset, value) {
  var _normalizeNodeAndOffs = normalizeNodeAndOffset(nativeNode, nativeOffset),
      nearestNode = _normalizeNodeAndOffs.node,
      nearestOffset = _normalizeNodeAndOffs.offset;

  var window = get_window__WEBPACK_IMPORTED_MODULE_8___default()(nativeNode);
  var parentNode = nearestNode.parentNode;

  var rangeNode = parentNode.closest(RANGE_SELECTOR);
  var offset = void 0;
  var node = void 0;

  // Calculate how far into the text node the `nearestNode` is, so that we can
  // determine what the offset relative to the text node is.
  if (rangeNode) {
    var range = window.document.createRange();
    var textNode = rangeNode.closest(TEXT_SELECTOR);
    range.setStart(textNode, 0);
    range.setEnd(nearestNode, nearestOffset);
    node = textNode;
    offset = range.toString().length;
  } else {
    // For void nodes, the element with the offset key will be a cousin, not an
    // ancestor, so find it by going down from the nearest void parent.
    var voidNode = parentNode.closest(VOID_SELECTOR);
    if (!voidNode) return null;
    rangeNode = voidNode.querySelector(RANGE_SELECTOR);
    if (!rangeNode) return null;
    node = rangeNode;
    offset = node.textContent.length;
  }

  // COMPAT: If the parent node is a Slate zero-width space, this is because the
  // text node should have no characters. However, during IME composition the
  // ASCII characters will be prepended to the zero-width space, so subtract 1
  // from the offset to account for the zero-width space character.
  if (offset == node.textContent.length && parentNode.hasAttribute(ZERO_WIDTH_ATTRIBUTE)) {
    offset--;
  }

  // Get the string value of the offset key attribute.
  var offsetKey = rangeNode.getAttribute(OFFSET_KEY_ATTRIBUTE);
  if (!offsetKey) return null;

  var _OffsetKey$parse = OffsetKey.parse(offsetKey),
      key = _OffsetKey$parse.key;

  // COMPAT: If someone is clicking from one Slate editor into another, the
  // select event fires twice, once for the old editor's `element` first, and
  // then afterwards for the correct `element`. (2017/03/03)


  if (!value.document.hasDescendant(key)) return null;

  return {
    key: key,
    offset: offset
  };
}

/**
 * From a DOM selection's `node` and `offset`, normalize so that it always
 * refers to a text node.
 *
 * @param {Element} node
 * @param {Number} offset
 * @return {Object}
 */

function normalizeNodeAndOffset(node, offset) {
  // If it's an element node, its offset refers to the index of its children
  // including comment nodes, so try to find the right text child node.
  if (node.nodeType == 1 && node.childNodes.length) {
    var isLast = offset == node.childNodes.length;
    var direction = isLast ? 'backward' : 'forward';
    var index = isLast ? offset - 1 : offset;
    node = getEditableChild(node, index, direction);

    // If the node has children, traverse until we have a leaf node. Leaf nodes
    // can be either text nodes, or other void DOM nodes.
    while (node.nodeType == 1 && node.childNodes.length) {
      var i = isLast ? node.childNodes.length - 1 : 0;
      node = getEditableChild(node, i, direction);
    }

    // Determine the new offset inside the text node.
    offset = isLast ? node.textContent.length : 0;
  }

  // Return the node and offset.
  return { node: node, offset: offset };
}

/**
 * Get the nearest editable child at `index` in a `parent`, preferring
 * `direction`.
 *
 * @param {Element} parent
 * @param {Number} index
 * @param {String} direction ('forward' or 'backward')
 * @return {Element|Null}
 */

function getEditableChild(parent, index, direction) {
  var childNodes = parent.childNodes;

  var child = childNodes[index];
  var i = index;
  var triedForward = false;
  var triedBackward = false;

  // While the child is a comment node, or an element node with no children,
  // keep iterating to find a sibling non-void, non-comment node.
  while (child.nodeType == 8 || child.nodeType == 1 && child.childNodes.length == 0 || child.nodeType == 1 && child.getAttribute('contenteditable') == 'false') {
    if (triedForward && triedBackward) break;

    if (i >= childNodes.length) {
      triedForward = true;
      i = index - 1;
      direction = 'backward';
      continue;
    }

    if (i < 0) {
      triedBackward = true;
      i = index + 1;
      direction = 'forward';
      continue;
    }

    child = childNodes[i];
    if (direction == 'forward') i++;
    if (direction == 'backward') i--;
  }

  return child || null;
}

/**
 * Find a Slate range from a DOM `native` selection.
 *
 * @param {Selection} native
 * @param {Value} value
 * @return {Range}
 */

function findRange(native, value) {
  var el = native.anchorNode || native.startContainer;
  if (!el) return null;

  var window = get_window__WEBPACK_IMPORTED_MODULE_8___default()(el);

  // If the `native` object is a DOM `Range` or `StaticRange` object, change it
  // into something that looks like a DOM `Selection` instead.
  if (native instanceof window.Range || window.StaticRange && native instanceof window.StaticRange) {
    native = {
      anchorNode: native.startContainer,
      anchorOffset: native.startOffset,
      focusNode: native.endContainer,
      focusOffset: native.endOffset
    };
  }

  var _native = native,
      anchorNode = _native.anchorNode,
      anchorOffset = _native.anchorOffset,
      focusNode = _native.focusNode,
      focusOffset = _native.focusOffset,
      isCollapsed = _native.isCollapsed;

  var anchor = findPoint(anchorNode, anchorOffset, value);
  var focus = isCollapsed ? anchor : findPoint(focusNode, focusOffset, value);
  if (!anchor || !focus) return null;

  // COMPAT: ??? The Edge browser seems to have a case where if you select the
  // last word of a span, it sets the endContainer to the containing span.
  // `selection-is-backward` doesn't handle this case.
  if (slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["IS_IE"] || slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["IS_EDGE"]) {
    var domAnchor = findDOMPoint(anchor.key, anchor.offset);
    var domFocus = findDOMPoint(focus.key, focus.offset);

    native = {
      anchorNode: domAnchor.node,
      anchorOffset: domAnchor.offset,
      focusNode: domFocus.node,
      focusOffset: domFocus.offset
    };
  }

  var range = slate__WEBPACK_IMPORTED_MODULE_7__["Range"].create({
    anchorKey: anchor.key,
    anchorOffset: anchor.offset,
    focusKey: focus.key,
    focusOffset: focus.offset,
    isBackward: isCollapsed ? false : selection_is_backward__WEBPACK_IMPORTED_MODULE_9___default()(native),
    isFocused: true
  });

  return range;
}

/**
 * CSS overflow values that would cause scrolling.
 *
 * @type {Array}
 */

var OVERFLOWS = ['auto', 'overlay', 'scroll'];

/**
 * Detect whether we are running IOS version 11
 */

var IS_IOS_11 = slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["IS_IOS"] && !!window.navigator.userAgent.match(/os 11_/i);

/**
 * Find the nearest parent with scrolling, or window.
 *
 * @param {el} Element
 */

function findScrollContainer(el, window) {
  var parent = el.parentNode;
  var scroller = void 0;

  while (!scroller) {
    if (!parent.parentNode) break;

    var style = window.getComputedStyle(parent);
    var overflowY = style.overflowY;


    if (OVERFLOWS.includes(overflowY)) {
      scroller = parent;
      break;
    }

    parent = parent.parentNode;
  }

  // COMPAT: Because Chrome does not allow doucment.body.scrollTop, we're
  // assuming that window.scrollTo() should be used if the scrollable element
  // turns out to be document.body or document.documentElement. This will work
  // unless body is intentionally set to scrollable by restricting its height
  // (e.g. height: 100vh).
  if (!scroller) {
    return window.document.body;
  }

  return scroller;
}

/**
 * Scroll the current selection's focus point into view if needed.
 *
 * @param {Selection} selection
 */

function scrollToSelection(selection) {
  if (IS_IOS_11) return;
  if (!selection.anchorNode) return;

  var window = get_window__WEBPACK_IMPORTED_MODULE_8___default()(selection.anchorNode);
  var scroller = findScrollContainer(selection.anchorNode, window);
  var isWindow = scroller == window.document.body || scroller == window.document.documentElement;
  var backward = selection_is_backward__WEBPACK_IMPORTED_MODULE_9___default()(selection);

  var range = selection.getRangeAt(0).cloneRange();
  range.collapse(backward);
  var cursorRect = range.getBoundingClientRect();

  // COMPAT: range.getBoundingClientRect() returns 0s in Safari when range is
  // collapsed. Expanding the range by 1 is a relatively effective workaround
  // for vertical scroll, although horizontal may be off by 1 character.
  // https://bugs.webkit.org/show_bug.cgi?id=138949
  // https://bugs.chromium.org/p/chromium/issues/detail?id=435438
  if (slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["IS_SAFARI"]) {
    if (range.collapsed && cursorRect.top == 0 && cursorRect.height == 0) {
      if (range.startOffset == 0) {
        range.setEnd(range.endContainer, 1);
      } else {
        range.setStart(range.startContainer, range.startOffset - 1);
      }

      cursorRect = range.getBoundingClientRect();

      if (cursorRect.top == 0 && cursorRect.height == 0) {
        if (range.getClientRects().length) {
          cursorRect = range.getClientRects()[0];
        }
      }
    }
  }

  var width = void 0;
  var height = void 0;
  var yOffset = void 0;
  var xOffset = void 0;
  var scrollerTop = 0;
  var scrollerLeft = 0;
  var scrollerBordersY = 0;
  var scrollerBordersX = 0;
  var scrollerPaddingTop = 0;
  var scrollerPaddingBottom = 0;
  var scrollerPaddingLeft = 0;
  var scrollerPaddingRight = 0;

  if (isWindow) {
    var innerWidth = window.innerWidth,
        innerHeight = window.innerHeight,
        pageYOffset = window.pageYOffset,
        pageXOffset = window.pageXOffset;

    width = innerWidth;
    height = innerHeight;
    yOffset = pageYOffset;
    xOffset = pageXOffset;
  } else {
    var offsetWidth = scroller.offsetWidth,
        offsetHeight = scroller.offsetHeight,
        scrollTop = scroller.scrollTop,
        scrollLeft = scroller.scrollLeft;

    var _window$getComputedSt = window.getComputedStyle(scroller),
        borderTopWidth = _window$getComputedSt.borderTopWidth,
        borderBottomWidth = _window$getComputedSt.borderBottomWidth,
        borderLeftWidth = _window$getComputedSt.borderLeftWidth,
        borderRightWidth = _window$getComputedSt.borderRightWidth,
        paddingTop = _window$getComputedSt.paddingTop,
        paddingBottom = _window$getComputedSt.paddingBottom,
        paddingLeft = _window$getComputedSt.paddingLeft,
        paddingRight = _window$getComputedSt.paddingRight;

    var scrollerRect = scroller.getBoundingClientRect();
    width = offsetWidth;
    height = offsetHeight;
    scrollerTop = scrollerRect.top + parseInt(borderTopWidth, 10);
    scrollerLeft = scrollerRect.left + parseInt(borderLeftWidth, 10);
    scrollerBordersY = parseInt(borderTopWidth, 10) + parseInt(borderBottomWidth, 10);
    scrollerBordersX = parseInt(borderLeftWidth, 10) + parseInt(borderRightWidth, 10);
    scrollerPaddingTop = parseInt(paddingTop, 10);
    scrollerPaddingBottom = parseInt(paddingBottom, 10);
    scrollerPaddingLeft = parseInt(paddingLeft, 10);
    scrollerPaddingRight = parseInt(paddingRight, 10);
    yOffset = scrollTop;
    xOffset = scrollLeft;
  }

  var cursorTop = cursorRect.top + yOffset - scrollerTop;
  var cursorLeft = cursorRect.left + xOffset - scrollerLeft;

  var x = xOffset;
  var y = yOffset;

  if (cursorLeft < xOffset) {
    // selection to the left of viewport
    x = cursorLeft - scrollerPaddingLeft;
  } else if (cursorLeft + cursorRect.width + scrollerBordersX > xOffset + width) {
    // selection to the right of viewport
    x = cursorLeft + scrollerBordersX + scrollerPaddingRight - width;
  }

  if (cursorTop < yOffset) {
    // selection above viewport
    y = cursorTop - scrollerPaddingTop;
  } else if (cursorTop + cursorRect.height + scrollerBordersY > yOffset + height) {
    // selection below viewport
    y = cursorTop + scrollerBordersY + scrollerPaddingBottom + cursorRect.height - height;
  }

  if (isWindow) {
    window.scrollTo(x, y);
  } else {
    scroller.scrollTop = y;
    scroller.scrollLeft = x;
  }
}

/**
 * COMPAT: if we are in <= IE11 and the selection contains
 * tables, `removeAllRanges()` will throw
 * "unable to complete the operation due to error 800a025e"
 *
 * @param {Selection} selection document selection
 */

function removeAllRanges(selection) {
  var doc = window.document;
  if (doc && doc.body.createTextRange) {
    // All IE but Edge
    var range = doc.body.createTextRange();
    range.collapse();
    range.select();
  } else {
    selection.removeAllRanges();
  }
}

/**
 * Debug.
 *
 * @type {Function}
 */

var debug$4 = debug__WEBPACK_IMPORTED_MODULE_0___default()('slate:content');

/**
 * Content.
 *
 * @type {Component}
 */

var Content = function (_React$Component) {
  inherits(Content, _React$Component);

  /**
   * Constructor.
   *
   * @param {Object} props
   */

  /**
   * Property types.
   *
   * @type {Object}
   */

  function Content(props) {
    classCallCheck(this, Content);

    var _this = possibleConstructorReturn(this, (Content.__proto__ || Object.getPrototypeOf(Content)).call(this, props));

    _this.componentDidMount = function () {
      var window = get_window__WEBPACK_IMPORTED_MODULE_8___default()(_this.element);

      window.document.addEventListener('selectionchange', _this.onNativeSelectionChange);

      // COMPAT: Restrict scope of `beforeinput` to mobile.
      if ((slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["IS_IOS"] || slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["IS_ANDROID"]) && slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["SUPPORTED_EVENTS"].beforeinput) {
        _this.element.addEventListener('beforeinput', _this.onNativeBeforeInput);
      }

      _this.updateSelection();
    };

    _this.componentDidUpdate = function () {
      _this.updateSelection();
    };

    _this.updateSelection = function () {
      var editor = _this.props.editor;
      var value = editor.value;
      var selection = value.selection;
      var isBackward$$1 = selection.isBackward;

      var window = get_window__WEBPACK_IMPORTED_MODULE_8___default()(_this.element);
      var native = window.getSelection();
      var rangeCount = native.rangeCount,
          anchorNode = native.anchorNode;

      // If both selections are blurred, do nothing.

      if (!rangeCount && selection.isBlurred) return;

      // If the selection has been blurred, but is still inside the editor in the
      // DOM, blur it manually.
      if (selection.isBlurred) {
        if (!_this.isInEditor(anchorNode)) return;
        removeAllRanges(native);
        _this.element.blur();
        debug$4('updateSelection', { selection: selection, native: native });
        return;
      }

      // If the selection isn't set, do nothing.
      if (selection.isUnset) return;

      // Otherwise, figure out which DOM nodes should be selected...
      var current = !!rangeCount && native.getRangeAt(0);
      var range = findDOMRange(selection, window);

      if (!range) {
        slate_dev_logger__WEBPACK_IMPORTED_MODULE_6__["default"].error('Unable to find a native DOM range from the current selection.', { selection: selection });
        return;
      }

      var startContainer = range.startContainer,
          startOffset = range.startOffset,
          endContainer = range.endContainer,
          endOffset = range.endOffset;

      // If the new range matches the current selection, there is nothing to fix.
      // COMPAT: The native `Range` object always has it's "start" first and "end"
      // last in the DOM. It has no concept of "backwards/forwards", so we have
      // to check both orientations here. (2017/10/31)

      if (current) {
        if (startContainer == current.startContainer && startOffset == current.startOffset && endContainer == current.endContainer && endOffset == current.endOffset || startContainer == current.endContainer && startOffset == current.endOffset && endContainer == current.startContainer && endOffset == current.startOffset) {
          return;
        }
      }

      // Otherwise, set the `isUpdatingSelection` flag and update the selection.
      _this.tmp.isUpdatingSelection = true;
      removeAllRanges(native);

      // COMPAT: IE 11 does not support Selection.setBaseAndExtent
      if (native.setBaseAndExtent) {
        // COMPAT: Since the DOM range has no concept of backwards/forwards
        // we need to check and do the right thing here.
        if (isBackward$$1) {
          native.setBaseAndExtent(range.endContainer, range.endOffset, range.startContainer, range.startOffset);
        } else {
          native.setBaseAndExtent(range.startContainer, range.startOffset, range.endContainer, range.endOffset);
        }
      } else {
        // COMPAT: IE 11 does not support Selection.extend, fallback to addRange
        native.addRange(range);
      }

      // Scroll to the selection, in case it's out of view.
      scrollToSelection(native);

      // Then unset the `isUpdatingSelection` flag after a delay.
      setTimeout(function () {
        // COMPAT: In Firefox, it's not enough to create a range, you also need to
        // focus the contenteditable element too. (2016/11/16)
        if (slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["IS_FIREFOX"] && _this.element) _this.element.focus();
        _this.tmp.isUpdatingSelection = false;
      });

      debug$4('updateSelection', { selection: selection, native: native });
    };

    _this.ref = function (element) {
      _this.element = element;
    };

    _this.isInEditor = function (target) {
      var element = _this.element;
      // COMPAT: Text nodes don't have `isContentEditable` property. So, when
      // `target` is a text node use its parent node for check.

      var el = target.nodeType === 3 ? target.parentNode : target;
      return el.isContentEditable && (el === element || el.closest('[data-slate-editor]') === element);
    };

    _this.onNativeBeforeInput = function (event) {
      if (_this.props.readOnly) return;
      if (!_this.isInEditor(event.target)) return;

      var _event$getTargetRange = event.getTargetRanges(),
          _event$getTargetRange2 = slicedToArray(_event$getTargetRange, 1),
          targetRange = _event$getTargetRange2[0];

      if (!targetRange) return;

      var editor = _this.props.editor;


      switch (event.inputType) {
        case 'deleteContentBackward':
          {
            event.preventDefault();

            var range = findRange(targetRange, editor.value);
            editor.change(function (change) {
              return change.deleteAtRange(range);
            });
            break;
          }

        case 'insertLineBreak': // intentional fallthru
        case 'insertParagraph':
          {
            event.preventDefault();
            var _range = findRange(targetRange, editor.value);

            editor.change(function (change) {
              if (change.value.isInVoid) {
                change.collapseToStartOfNextText();
              } else {
                change.splitBlockAtRange(_range);
              }
            });
            break;
          }

        case 'insertReplacementText': // intentional fallthru
        case 'insertText':
          {
            // `data` should have the text for the `insertText` input type and
            // `dataTransfer` should have the text for the `insertReplacementText`
            // input type, but Safari uses `insertText` for spell check replacements
            // and sets `data` to `null`.
            var text = event.data == null ? event.dataTransfer.getData('text/plain') : event.data;

            if (text == null) return;

            event.preventDefault();

            var value = editor.value;
            var selection = value.selection;

            var _range2 = findRange(targetRange, value);

            editor.change(function (change) {
              change.insertTextAtRange(_range2, text, selection.marks);

              // If the text was successfully inserted, and the selection had marks
              // on it, unset the selection's marks.
              if (selection.marks && value.document != change.value.document) {
                change.select({ marks: null });
              }
            });

            break;
          }
      }
    };

    _this.onNativeSelectionChange = lodash_throttle__WEBPACK_IMPORTED_MODULE_11___default()(function (event) {
      if (_this.props.readOnly) return;

      var window = get_window__WEBPACK_IMPORTED_MODULE_8___default()(event.target);
      var activeElement = window.document.activeElement;

      if (activeElement !== _this.element) return;

      _this.props.onSelect(event);
    }, 100);

    _this.renderNode = function (child, isSelected, decorations) {
      var _this$props = _this.props,
          editor = _this$props.editor,
          readOnly = _this$props.readOnly;
      var value = editor.value;
      var document = value.document;


      return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(Node$1, {
        block: null,
        editor: editor,
        decorations: decorations,
        isSelected: isSelected,
        key: child.key,
        node: child,
        parent: document,
        readOnly: readOnly
      });
    };

    _this.tmp = {};
    _this.tmp.isUpdatingSelection = false;

    EVENT_HANDLERS.forEach(function (handler) {
      _this[handler] = function (event) {
        _this.onEvent(handler, event);
      };
    });
    return _this;
  }

  /**
   * When the editor first mounts in the DOM we need to:
   *
   *   - Add native DOM event listeners.
   *   - Update the selection, in case it starts focused.
   */

  /**
   * Default properties.
   *
   * @type {Object}
   */

  createClass(Content, [{
    key: 'componentWillUnmount',


    /**
     * When unmounting, remove DOM event listeners.
     */

    value: function componentWillUnmount() {
      var window = get_window__WEBPACK_IMPORTED_MODULE_8___default()(this.element);

      if (window) {
        window.document.removeEventListener('selectionchange', this.onNativeSelectionChange);
      }

      // COMPAT: Restrict scope of `beforeinput` to mobile.
      if ((slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["IS_IOS"] || slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["IS_ANDROID"]) && slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["SUPPORTED_EVENTS"].beforeinput) {
        this.element.removeEventListener('beforeinput', this.onNativeBeforeInput);
      }
    }

    /**
     * On update, update the selection.
     */

    /**
     * Update the native DOM selection to reflect the internal model.
     */

    /**
     * The React ref method to set the root content element locally.
     *
     * @param {Element} element
     */

    /**
     * Check if an event `target` is fired from within the contenteditable
     * element. This should be false for edits happening in non-contenteditable
     * children, such as void nodes and other nested Slate editors.
     *
     * @param {Element} target
     * @return {Boolean}
     */

  }, {
    key: 'onEvent',


    /**
     * On `event` with `handler`.
     *
     * @param {String} handler
     * @param {Event} event
     */

    value: function onEvent(handler, event) {
      debug$4('onEvent', handler);

      // Ignore `onBlur`, `onFocus` and `onSelect` events generated
      // programmatically while updating selection.
      if (this.tmp.isUpdatingSelection && (handler == 'onSelect' || handler == 'onBlur' || handler == 'onFocus')) {
        return;
      }

      // COMPAT: There are situations where a select event will fire with a new
      // native selection that resolves to the same internal position. In those
      // cases we don't need to trigger any changes, since our internal model is
      // already up to date, but we do want to update the native selection again
      // to make sure it is in sync. (2017/10/16)
      if (handler == 'onSelect') {
        var editor = this.props.editor;
        var value = editor.value;
        var selection = value.selection;

        var window = get_window__WEBPACK_IMPORTED_MODULE_8___default()(event.target);
        var native = window.getSelection();
        var range = findRange(native, value);

        if (range && range.equals(selection)) {
          this.updateSelection();
          return;
        }
      }

      // Don't handle drag and drop events coming from embedded editors.
      if (handler == 'onDragEnd' || handler == 'onDragEnter' || handler == 'onDragExit' || handler == 'onDragLeave' || handler == 'onDragOver' || handler == 'onDragStart' || handler == 'onDrop') {
        var target = event.target;

        var targetEditorNode = target.closest('[data-slate-editor]');
        if (targetEditorNode !== this.element) return;
      }

      // Some events require being in editable in the editor, so if the event
      // target isn't, ignore them.
      if (handler == 'onBeforeInput' || handler == 'onBlur' || handler == 'onCompositionEnd' || handler == 'onCompositionStart' || handler == 'onCopy' || handler == 'onCut' || handler == 'onFocus' || handler == 'onInput' || handler == 'onKeyDown' || handler == 'onKeyUp' || handler == 'onPaste' || handler == 'onSelect') {
        if (!this.isInEditor(event.target)) return;
      }

      this.props[handler](event);
    }

    /**
     * On a native `beforeinput` event, use the additional range information
     * provided by the event to manipulate text exactly as the browser would.
     *
     * This is currently only used on iOS and Android.
     *
     * @param {InputEvent} event
     */

    /**
     * On native `selectionchange` event, trigger the `onSelect` handler. This is
     * needed to account for React's `onSelect` being non-standard and not firing
     * until after a selection has been released. This causes issues in situations
     * where another change happens while a selection is being made.
     *
     * @param {Event} event
     */

  }, {
    key: 'render',


    /**
     * Render the editor content.
     *
     * @return {Element}
     */

    value: function render() {
      var _this2 = this;

      var props = this.props;
      var className = props.className,
          readOnly = props.readOnly,
          editor = props.editor,
          tabIndex = props.tabIndex,
          role = props.role,
          tagName = props.tagName,
          spellCheck = props.spellCheck;
      var value = editor.value,
          stack = editor.stack;

      var Container = tagName;
      var document = value.document,
          selection = value.selection,
          decorations = value.decorations;

      var indexes = document.getSelectionIndexes(selection, selection.isFocused);
      var decs = document.getDecorations(stack).concat(decorations || []);
      var childrenDecorations = getChildrenDecorations(document, decs);

      var children = document.nodes.toArray().map(function (child, i) {
        var isSelected = !!indexes && indexes.start <= i && i < indexes.end;

        return _this2.renderNode(child, isSelected, childrenDecorations[i]);
      });

      var handlers = EVENT_HANDLERS.reduce(function (obj, handler) {
        obj[handler] = _this2[handler];
        return obj;
      }, {});

      var style = _extends({
        // Prevent the default outline styles.
        outline: 'none',
        // Preserve adjacent whitespace and new lines.
        whiteSpace: 'pre-wrap',
        // Allow words to break if they are too long.
        wordWrap: 'break-word'
      }, readOnly ? {} : { WebkitUserModify: 'read-write-plaintext-only' }, props.style);

      debug$4('render', { props: props });

      return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
        Container,
        _extends({}, handlers, {
          'data-slate-editor': true,
          ref: this.ref,
          'data-key': document.key,
          contentEditable: readOnly ? null : true,
          suppressContentEditableWarning: true,
          className: className,
          onBlur: this.onBlur,
          onFocus: this.onFocus,
          onCompositionEnd: this.onCompositionEnd,
          onCompositionStart: this.onCompositionStart,
          onCopy: this.onCopy,
          onCut: this.onCut,
          onDragEnd: this.onDragEnd,
          onDragOver: this.onDragOver,
          onDragStart: this.onDragStart,
          onDrop: this.onDrop,
          onInput: this.onInput,
          onKeyDown: this.onKeyDown,
          onKeyUp: this.onKeyUp,
          onPaste: this.onPaste,
          onSelect: this.onSelect,
          autoCorrect: props.autoCorrect ? 'on' : 'off',
          spellCheck: spellCheck,
          style: style,
          role: readOnly ? null : role || 'textbox',
          tabIndex: tabIndex
          // COMPAT: The Grammarly Chrome extension works by changing the DOM out
          // from under `contenteditable` elements, which leads to weird behaviors
          // so we have to disable it like this. (2017/04/24)
          , 'data-gramm': false
        }),
        children,
        this.props.children
      );
    }

    /**
     * Render a `child` node of the document.
     *
     * @param {Node} child
     * @param {Boolean} isSelected
     * @return {Element}
     */

  }]);
  return Content;
}(react__WEBPACK_IMPORTED_MODULE_1___default.a.Component);

/**
 * Mix in handler prop types.
 */

Content.propTypes = {
  autoCorrect: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.bool.isRequired,
  children: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.any.isRequired,
  className: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.string,
  editor: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.object.isRequired,
  readOnly: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.bool.isRequired,
  role: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.string,
  spellCheck: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.bool.isRequired,
  style: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.object,
  tabIndex: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.number,
  tagName: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.string };
Content.defaultProps = {
  style: {},
  tagName: 'div' };
EVENT_HANDLERS.forEach(function (handler) {
  Content.propTypes[handler] = prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.func.isRequired;
});

/**
 * The transfer types that Slate recognizes.
 *
 * @type {Object}
 */

var TRANSFER_TYPES = {
  FRAGMENT: 'application/x-slate-fragment',
  HTML: 'text/html',
  NODE: 'application/x-slate-node',
  RICH: 'text/rtf',
  TEXT: 'text/plain'

  /**
   * Export.
   *
   * @type {Object}
   */

};

var FRAGMENT = TRANSFER_TYPES.FRAGMENT;
var HTML = TRANSFER_TYPES.HTML;
var TEXT = TRANSFER_TYPES.TEXT;

/**
 * Prepares a Slate document fragment to be copied to the clipboard.
 *
 * @param {Event} event
 * @param {Value} value
 * @param {Document} [fragment]
 */

function cloneFragment(event, value) {
  var fragment = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : value.fragment;

  var window = get_window__WEBPACK_IMPORTED_MODULE_8___default()(event.target);
  var native = window.getSelection();
  var startKey = value.startKey,
      endKey = value.endKey,
      startText = value.startText;

  var startVoid = value.document.getClosestVoid(startKey);
  var endVoid = value.document.getClosestVoid(endKey);

  // If the selection is collapsed, and it isn't inside a void node, abort.
  if (native.isCollapsed && !startVoid) return;

  // Create a fake selection so that we can add a Base64-encoded copy of the
  // fragment to the HTML, to decode on future pastes.
  var encoded = slate_base64_serializer__WEBPACK_IMPORTED_MODULE_12__["default"].serializeNode(fragment);
  var range = native.getRangeAt(0);
  var contents = range.cloneContents();
  var attach = contents.childNodes[0];

  // Make sure attach is a non-empty node, since empty nodes will not get copied
  contents.childNodes.forEach(function (node) {
    if (node.innerText && node.innerText.trim() !== '') {
      attach = node;
    }
  });

  // COMPAT: If the end node is a void node, we need to move the end of the
  // range from the void node's spacer span, to the end of the void node's
  // content, since the spacer is before void's content in the DOM.
  if (endVoid) {
    var r = range.cloneRange();
    var node = findDOMNode$1(endVoid, window);
    r.setEndAfter(node);
    contents = r.cloneContents();
  }

  // COMPAT: If the start node is a void node, we need to attach the encoded
  // fragment to the void node's content node instead of the spacer, because
  // attaching it to empty `<div>/<span>` nodes will end up having it erased by
  // most browsers. (2018/04/27)
  if (startVoid) {
    attach = contents.childNodes[0].childNodes[1].firstChild;
  }

  // COMPAT: in Safari and Chrome when selecting a single marked word, marks are
  // not preserved when copying. If the attatched is not void, and the start key
  // and endKey is the same, check if there is marks involved. If so, set the
  // range start just before the start text node.
  if ((slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["IS_CHROME"] || slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["IS_SAFARI"] || slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["IS_OPERA"]) && !endVoid && startKey === endKey) {
    var hasMarks = startText.characters.slice(value.selection.anchorOffset, value.selection.focusOffset).filter(function (char) {
      return char.marks.size !== 0;
    }).size !== 0;
    if (hasMarks) {
      var _r = range.cloneRange();
      var _node = findDOMNode$1(startText, window);
      _r.setStartBefore(_node);
      contents = _r.cloneContents();
      attach = contents.childNodes[contents.childNodes.length - 1].firstChild;
    }
  }

  // Remove any zero-width space spans from the cloned DOM so that they don't
  // show up elsewhere when pasted.
  [].slice.call(contents.querySelectorAll(ZERO_WIDTH_SELECTOR)).forEach(function (zw) {
    var isNewline = zw.getAttribute(ZERO_WIDTH_ATTRIBUTE) === 'n';
    zw.textContent = isNewline ? '\n' : '';
  });

  // COMPAT: In Chrome and Safari, if the last element in the selection to
  // copy has `contenteditable="false"` the copy will fail, and nothing will
  // be put in the clipboard. So we remove them all. (2017/05/04)
  if (slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["IS_CHROME"] || slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["IS_SAFARI"] || slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["IS_OPERA"]) {
    var els = [].slice.call(contents.querySelectorAll('[contenteditable="false"]'));
    els.forEach(function (el) {
      return el.removeAttribute('contenteditable');
    });
  }

  // Set a `data-slate-fragment` attribute on a non-empty node, so it shows up
  // in the HTML, and can be used for intra-Slate pasting. If it's a text
  // node, wrap it in a `<span>` so we have something to set an attribute on.
  if (attach.nodeType == 3) {
    var span = window.document.createElement('span');

    // COMPAT: In Chrome and Safari, if we don't add the `white-space` style
    // then leading and trailing spaces will be ignored. (2017/09/21)
    span.style.whiteSpace = 'pre';

    span.appendChild(attach);
    contents.appendChild(span);
    attach = span;
  }

  attach.setAttribute('data-slate-fragment', encoded);

  // Add the phony content to a div element. This is needed to copy the
  // contents into the html clipboard register.
  var div = window.document.createElement('div');
  div.appendChild(contents);

  // For browsers supporting it, we set the clipboard registers manually,
  // since the result is more predictable.
  if (event.clipboardData && event.clipboardData.setData) {
    event.preventDefault();
    event.clipboardData.setData(TEXT, native.toString());
    event.clipboardData.setData(FRAGMENT, encoded);
    event.clipboardData.setData(HTML, div.innerHTML);
    return;
  }

  // COMPAT: For browser that don't support the Clipboard API's setData method,
  // we must rely on the browser to natively copy what's selected.
  // So we add the div (containing our content) to the DOM, and select it.
  var editor = event.target.closest('[data-slate-editor]');
  div.setAttribute('contenteditable', true);
  div.style.position = 'absolute';
  div.style.left = '-9999px';
  editor.appendChild(div);
  native.selectAllChildren(div);

  // Revert to the previous selection right after copying.
  window.requestAnimationFrame(function () {
    editor.removeChild(div);
    removeAllRanges(native);
    native.addRange(range);
  });
}

/**
 * Find a Slate node from a DOM `element`.
 *
 * @param {Element} element
 * @param {Value} value
 * @return {Node|Null}
 */

function findNode(element, value) {
  var closest = element.closest('[data-key]');
  if (!closest) return null;

  var key = closest.getAttribute('data-key');
  if (!key) return null;

  var node = value.document.getNode(key);
  return node || null;
}

/**
 * Get the target range from a DOM `event`.
 *
 * @param {Event} event
 * @param {Value} value
 * @return {Range}
 */

function getEventRange(event, value) {
  if (event.nativeEvent) {
    event = event.nativeEvent;
  }

  var _event = event,
      x = _event.x,
      y = _event.y,
      target = _event.target;

  if (x == null || y == null) return null;

  var document = value.document;

  var node = findNode(target, value);
  if (!node) return null;

  // If the drop target is inside a void node, move it into either the next or
  // previous node, depending on which side the `x` and `y` coordinates are
  // closest to.
  if (node.isVoid) {
    var rect = target.getBoundingClientRect();
    var isPrevious = node.object == 'inline' ? x - rect.left < rect.left + rect.width - x : y - rect.top < rect.top + rect.height - y;

    var text = node.getFirstText();
    var _range = slate__WEBPACK_IMPORTED_MODULE_7__["Range"].create();
    return isPrevious ? _range.moveToEndOf(document.getPreviousText(text.key)) : _range.moveToStartOf(document.getNextText(text.key));
  }

  // Else resolve a range from the caret position where the drop occured.
  var window = get_window__WEBPACK_IMPORTED_MODULE_8___default()(target);
  var native = void 0;

  // COMPAT: In Firefox, `caretRangeFromPoint` doesn't exist. (2016/07/25)
  if (window.document.caretRangeFromPoint) {
    native = window.document.caretRangeFromPoint(x, y);
  } else {
    var position = window.document.caretPositionFromPoint(x, y);
    native = window.document.createRange();
    native.setStart(position.offsetNode, position.offset);
    native.setEnd(position.offsetNode, position.offset);
  }

  // Resolve a Slate range from the DOM range.
  var range = findRange(native, value);
  if (!range) return null;

  return range;
}

/**
 * Transfer types.
 *
 * @type {String}
 */

var FRAGMENT$1 = TRANSFER_TYPES.FRAGMENT;
var HTML$1 = TRANSFER_TYPES.HTML;
var NODE = TRANSFER_TYPES.NODE;
var RICH = TRANSFER_TYPES.RICH;
var TEXT$1 = TRANSFER_TYPES.TEXT;

/**
 * Fragment matching regexp for HTML nodes.
 *
 * @type {RegExp}
 */

var FRAGMENT_MATCHER = / data-slate-fragment="([^\s"]+)"/;

/**
 * Get the transfer data from an `event`.
 *
 * @param {Event} event
 * @return {Object}
 */

function getEventTransfer(event) {
  if (event.nativeEvent) {
    event = event.nativeEvent;
  }

  var transfer = event.dataTransfer || event.clipboardData;
  var fragment = getType(transfer, FRAGMENT$1);
  var node = getType(transfer, NODE);
  var html = getType(transfer, HTML$1);
  var rich = getType(transfer, RICH);
  var text = getType(transfer, TEXT$1);
  var files = void 0;

  // If there isn't a fragment, but there is HTML, check to see if the HTML is
  // actually an encoded fragment.
  if (!fragment && html && ~html.indexOf(' data-slate-fragment="')) {
    var matches = FRAGMENT_MATCHER.exec(html);

    var _matches = slicedToArray(matches, 2),
        full = _matches[0],
        encoded = _matches[1]; // eslint-disable-line no-unused-vars


    if (encoded) fragment = encoded;
  }

  // COMPAT: Edge doesn't handle custom data types
  // These will be embedded in text/plain in this case (2017/7/12)
  if (text) {
    var embeddedTypes = getEmbeddedTypes(text);

    if (embeddedTypes[FRAGMENT$1]) fragment = embeddedTypes[FRAGMENT$1];
    if (embeddedTypes[NODE]) node = embeddedTypes[NODE];
    if (embeddedTypes[TEXT$1]) text = embeddedTypes[TEXT$1];
  }

  // Decode a fragment or node if they exist.
  if (fragment) fragment = slate_base64_serializer__WEBPACK_IMPORTED_MODULE_12__["default"].deserializeNode(fragment);
  if (node) node = slate_base64_serializer__WEBPACK_IMPORTED_MODULE_12__["default"].deserializeNode(node);

  // COMPAT: Edge sometimes throws 'NotSupportedError'
  // when accessing `transfer.items` (2017/7/12)
  try {
    // Get and normalize files if they exist.
    if (transfer.items && transfer.items.length) {
      files = Array.from(transfer.items).map(function (item) {
        return item.kind == 'file' ? item.getAsFile() : null;
      }).filter(function (exists) {
        return exists;
      });
    } else if (transfer.files && transfer.files.length) {
      files = Array.from(transfer.files);
    }
  } catch (err) {
    if (transfer.files && transfer.files.length) {
      files = Array.from(transfer.files);
    }
  }

  // Determine the type of the data.
  var data = { files: files, fragment: fragment, html: html, node: node, rich: rich, text: text };
  data.type = getTransferType(data);
  return data;
}

/**
 * Takes text input, checks whether contains embedded data
 * and returns object with original text +/- additional data
 *
 * @param {String} text
 * @return {Object}
 */

function getEmbeddedTypes(text) {
  var prefix = 'SLATE-DATA-EMBED::';

  if (text.substring(0, prefix.length) != prefix) {
    return { TEXT: text };
  }

  // Attempt to parse, if fails then just standard text/plain
  // Otherwise, already had data embedded
  try {
    return JSON.parse(text.substring(prefix.length));
  } catch (err) {
    throw new Error('Unable to parse custom Slate drag event data.');
  }
}

/**
 * Get the type of a transfer from its `data`.
 *
 * @param {Object} data
 * @return {String}
 */

function getTransferType(data) {
  if (data.fragment) return 'fragment';
  if (data.node) return 'node';

  // COMPAT: Microsoft Word adds an image of the selected text to the data.
  // Since files are preferred over HTML or text, this would cause the type to
  // be considered `files`. But it also adds rich text data so we can check
  // for that and properly set the type to `html` or `text`. (2016/11/21)
  if (data.rich && data.html) return 'html';
  if (data.rich && data.text) return 'text';

  if (data.files && data.files.length) return 'files';
  if (data.html) return 'html';
  if (data.text) return 'text';
  return 'unknown';
}

/**
 * Get one of types `TYPES.FRAGMENT`, `TYPES.NODE`, `text/html`, `text/rtf` or
 * `text/plain` from transfers's `data` if possible, otherwise return null.
 *
 * @param {Object} transfer
 * @param {String} type
 * @return {String}
 */

function getType(transfer, type) {
  if (!transfer.types || !transfer.types.length) {
    // COMPAT: In IE 11, there is no `types` field but `getData('Text')`
    // is supported`. (2017/06/23)
    return type == TEXT$1 ? transfer.getData('Text') || null : null;
  }

  // COMPAT: In Edge, transfer.types doesn't respond to `indexOf`. (2017/10/25)
  var types = Array.from(transfer.types);

  return types.indexOf(type) !== -1 ? transfer.getData(type) || null : null;
}

/**
 * The default plain text transfer type.
 *
 * @type {String}
 */

var TEXT$2 = TRANSFER_TYPES.TEXT;

/**
 * Set data with `type` and `content` on an `event`.
 *
 * COMPAT: In Edge, custom types throw errors, so embed all non-standard
 * types in text/plain compound object. (2017/7/12)
 *
 * @param {Event} event
 * @param {String} type
 * @param {String} content
 */

function setEventTransfer(event, type, content) {
  var mime = TRANSFER_TYPES[type.toUpperCase()];

  if (!mime) {
    throw new Error('Cannot set unknown transfer type "' + mime + '".');
  }

  if (event.nativeEvent) {
    event = event.nativeEvent;
  }

  var transfer = event.dataTransfer || event.clipboardData;

  try {
    transfer.setData(mime, content);
  } catch (err) {
    var prefix = 'SLATE-DATA-EMBED::';
    var text = transfer.getData(TEXT$2);
    var obj = {};

    // If the existing plain text data is prefixed, it's Slate JSON data.
    if (text.substring(0, prefix.length) === prefix) {
      try {
        obj = JSON.parse(text.substring(prefix.length));
      } catch (e) {
        throw new Error('Failed to parse Slate data from `DataTransfer` object.');
      }
    } else {
      // Otherwise, it's just set it as is.
      obj[TEXT$2] = text;
    }

    obj[mime] = content;
    var string = '' + prefix + JSON.stringify(obj);
    transfer.setData(TEXT$2, string);
  }
}

/**
 * Debug.
 *
 * @type {Function}
 */

var debug$5 = debug__WEBPACK_IMPORTED_MODULE_0___default()('slate:after');

/**
 * The after plugin.
 *
 * @return {Object}
 */

function AfterPlugin() {
  var isDraggingInternally = null;

  /**
   * On before input, correct any browser inconsistencies.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onBeforeInput(event, change, editor) {
    debug$5('onBeforeInput', { event: event });

    event.preventDefault();
    change.insertText(event.data);
  }

  /**
   * On blur.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onBlur(event, change, editor) {
    debug$5('onBlur', { event: event });

    change.blur();
  }

  /**
   * On click.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onClick(event, change, editor) {
    if (editor.props.readOnly) return true;

    var value = change.value;
    var document = value.document;

    var node = findNode(event.target, value);
    var isVoid = node && (node.isVoid || document.hasVoidParent(node.key));

    if (isVoid) {
      // COMPAT: In Chrome & Safari, selections that are at the zero offset of
      // an inline node will be automatically replaced to be at the last offset
      // of a previous inline node, which screws us up, so we always want to set
      // it to the end of the node. (2016/11/29)
      change.focus().collapseToEndOf(node);
    }

    debug$5('onClick', { event: event });
  }

  /**
   * On copy.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onCopy(event, change, editor) {
    debug$5('onCopy', { event: event });

    cloneFragment(event, change.value);
  }

  /**
   * On cut.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onCut(event, change, editor) {
    debug$5('onCut', { event: event });

    cloneFragment(event, change.value);
    var window = get_window__WEBPACK_IMPORTED_MODULE_8___default()(event.target);

    // Once the fake cut content has successfully been added to the clipboard,
    // delete the content in the current selection.
    window.requestAnimationFrame(function () {
      // If user cuts a void block node or a void inline node,
      // manually removes it since selection is collapsed in this case.
      var value = change.value;
      var endBlock = value.endBlock,
          endInline = value.endInline,
          isCollapsed = value.isCollapsed;

      var isVoidBlock = endBlock && endBlock.isVoid && isCollapsed;
      var isVoidInline = endInline && endInline.isVoid && isCollapsed;

      if (isVoidBlock) {
        editor.change(function (c) {
          return c.removeNodeByKey(endBlock.key);
        });
      } else if (isVoidInline) {
        editor.change(function (c) {
          return c.removeNodeByKey(endInline.key);
        });
      } else {
        editor.change(function (c) {
          return c.delete();
        });
      }
    });
  }

  /**
   * On drag end.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDragEnd(event, change, editor) {
    debug$5('onDragEnd', { event: event });

    isDraggingInternally = null;
  }

  /**
   * On drag over.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDragOver(event, change, editor) {
    debug$5('onDragOver', { event: event });

    isDraggingInternally = false;
  }

  /**
   * On drag start.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDragStart(event, change, editor) {
    debug$5('onDragStart', { event: event });

    isDraggingInternally = true;

    var value = change.value;
    var document = value.document;

    var node = findNode(event.target, value);
    var isVoid = node && (node.isVoid || document.hasVoidParent(node.key));

    if (isVoid) {
      var encoded = slate_base64_serializer__WEBPACK_IMPORTED_MODULE_12__["default"].serializeNode(node, { preserveKeys: true });
      setEventTransfer(event, 'node', encoded);
    } else {
      var fragment = value.fragment;

      var _encoded = slate_base64_serializer__WEBPACK_IMPORTED_MODULE_12__["default"].serializeNode(fragment);
      setEventTransfer(event, 'fragment', _encoded);
    }
  }

  /**
   * On drop.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDrop(event, change, editor) {
    debug$5('onDrop', { event: event });

    var value = change.value;
    var document = value.document,
        selection = value.selection;

    var window = get_window__WEBPACK_IMPORTED_MODULE_8___default()(event.target);
    var target = getEventRange(event, value);
    if (!target) return;

    var transfer = getEventTransfer(event);
    var type = transfer.type,
        fragment = transfer.fragment,
        node = transfer.node,
        text = transfer.text;


    change.focus();

    // If the drag is internal and the target is after the selection, it
    // needs to account for the selection's content being deleted.
    if (isDraggingInternally && selection.endKey == target.endKey && selection.endOffset < target.endOffset) {
      target = target.move(selection.startKey == selection.endKey ? 0 - selection.endOffset + selection.startOffset : 0 - selection.endOffset);
    }

    if (isDraggingInternally) {
      change.delete();
    }

    change.select(target);

    if (type == 'text' || type == 'html') {
      var _target = target,
          anchorKey = _target.anchorKey;

      var hasVoidParent = document.hasVoidParent(anchorKey);

      if (hasVoidParent) {
        var n = document.getNode(anchorKey);

        while (hasVoidParent) {
          n = document.getNextText(n.key);
          if (!n) break;
          hasVoidParent = document.hasVoidParent(n.key);
        }

        if (n) change.collapseToStartOf(n);
      }

      if (text) {
        text.split('\n').forEach(function (line, i) {
          if (i > 0) change.splitBlock();
          change.insertText(line);
        });
      }
    }

    if (type == 'fragment') {
      change.insertFragment(fragment);
    }

    if (type == 'node' && slate__WEBPACK_IMPORTED_MODULE_7__["Block"].isBlock(node)) {
      change.insertBlock(node.regenerateKey()).removeNodeByKey(node.key);
    }

    if (type == 'node' && slate__WEBPACK_IMPORTED_MODULE_7__["Inline"].isInline(node)) {
      change.insertInline(node.regenerateKey()).removeNodeByKey(node.key);
    }

    // COMPAT: React's onSelect event breaks after an onDrop event
    // has fired in a node: https://github.com/facebook/react/issues/11379.
    // Until this is fixed in React, we dispatch a mouseup event on that
    // DOM node, since that will make it go back to normal.
    var focusNode = document.getNode(target.focusKey);
    var el = findDOMNode$1(focusNode, window);
    if (!el) return;

    el.dispatchEvent(new MouseEvent('mouseup', {
      view: window,
      bubbles: true,
      cancelable: true
    }));
  }

  /**
   * On input.
   *
   * @param {Event} eventvent
   * @param {Change} change
   */

  function onInput(event, change, editor) {
    debug$5('onInput', { event: event });

    var window = get_window__WEBPACK_IMPORTED_MODULE_8___default()(event.target);
    var value = change.value;

    // Get the selection point.

    var native = window.getSelection();
    var anchorNode = native.anchorNode;

    var point = findPoint(anchorNode, 0, value);
    if (!point) return;

    // Get the text node and leaf in question.
    var document = value.document,
        selection = value.selection;

    var node = document.getDescendant(point.key);
    var block = document.getClosestBlock(node.key);
    var leaves = node.getLeaves();
    var lastText = block.getLastText();
    var lastLeaf = leaves.last();
    var start = 0;
    var end = 0;

    var leaf = leaves.find(function (r) {
      start = end;
      end += r.text.length;
      if (end > point.offset) return true;
    }) || lastLeaf;

    // Get the text information.
    var text = leaf.text;
    var textContent = anchorNode.textContent;

    var isLastText = node == lastText;
    var isLastLeaf = leaf == lastLeaf;
    var lastChar = textContent.charAt(textContent.length - 1);

    // COMPAT: If this is the last leaf, and the DOM text ends in a new line,
    // we will have added another new line in <Leaf>'s render method to account
    // for browsers collapsing a single trailing new lines, so remove it.
    if (isLastText && isLastLeaf && lastChar == '\n') {
      textContent = textContent.slice(0, -1);
    }

    // If the text is no different, abort.
    if (textContent == text) return;

    // Determine what the selection should be after changing the text.
    var delta = textContent.length - text.length;
    var corrected = selection.collapseToEnd().move(delta);
    var entire = selection.moveAnchorTo(point.key, start).moveFocusTo(point.key, end);

    // Change the current value to have the leaf's text replaced.
    change.insertTextAtRange(entire, textContent, leaf.marks).select(corrected);
  }

  /**
   * On key down.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onKeyDown(event, change, editor) {
    debug$5('onKeyDown', { event: event });

    var value = change.value;

    // COMPAT: In iOS, some of these hotkeys are handled in the
    // `onNativeBeforeInput` handler of the `<Content>` component in order to
    // preserve native autocorrect behavior, so they shouldn't be handled here.

    if (slate_hotkeys__WEBPACK_IMPORTED_MODULE_14__["default"].isSplitBlock(event) && !slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["IS_IOS"]) {
      return value.isInVoid ? change.collapseToStartOfNextText() : change.splitBlock();
    }

    if (slate_hotkeys__WEBPACK_IMPORTED_MODULE_14__["default"].isDeleteCharBackward(event) && !slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["IS_IOS"]) {
      return change.deleteCharBackward();
    }

    if (slate_hotkeys__WEBPACK_IMPORTED_MODULE_14__["default"].isDeleteCharForward(event) && !slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["IS_IOS"]) {
      return change.deleteCharForward();
    }

    if (slate_hotkeys__WEBPACK_IMPORTED_MODULE_14__["default"].isDeleteLineBackward(event)) {
      return change.deleteLineBackward();
    }

    if (slate_hotkeys__WEBPACK_IMPORTED_MODULE_14__["default"].isDeleteLineForward(event)) {
      return change.deleteLineForward();
    }

    if (slate_hotkeys__WEBPACK_IMPORTED_MODULE_14__["default"].isDeleteWordBackward(event)) {
      return change.deleteWordBackward();
    }

    if (slate_hotkeys__WEBPACK_IMPORTED_MODULE_14__["default"].isDeleteWordForward(event)) {
      return change.deleteWordForward();
    }

    if (slate_hotkeys__WEBPACK_IMPORTED_MODULE_14__["default"].isRedo(event)) {
      return change.redo();
    }

    if (slate_hotkeys__WEBPACK_IMPORTED_MODULE_14__["default"].isUndo(event)) {
      return change.undo();
    }

    // COMPAT: Certain browsers don't handle the selection updates properly. In
    // Chrome, the selection isn't properly extended. And in Firefox, the
    // selection isn't properly collapsed. (2017/10/17)
    if (slate_hotkeys__WEBPACK_IMPORTED_MODULE_14__["default"].isCollapseLineBackward(event)) {
      event.preventDefault();
      return change.collapseLineBackward();
    }

    if (slate_hotkeys__WEBPACK_IMPORTED_MODULE_14__["default"].isCollapseLineForward(event)) {
      event.preventDefault();
      return change.collapseLineForward();
    }

    if (slate_hotkeys__WEBPACK_IMPORTED_MODULE_14__["default"].isExtendLineBackward(event)) {
      event.preventDefault();
      return change.extendLineBackward();
    }

    if (slate_hotkeys__WEBPACK_IMPORTED_MODULE_14__["default"].isExtendLineForward(event)) {
      event.preventDefault();
      return change.extendLineForward();
    }

    // COMPAT: If a void node is selected, or a zero-width text node adjacent to
    // an inline is selected, we need to handle these hotkeys manually because
    // browsers won't know what to do.
    if (slate_hotkeys__WEBPACK_IMPORTED_MODULE_14__["default"].isCollapseCharBackward(event)) {
      var document = value.document,
          isInVoid = value.isInVoid,
          previousText = value.previousText,
          startText = value.startText;

      var isPreviousInVoid = previousText && document.hasVoidParent(previousText.key);
      if (isInVoid || isPreviousInVoid || startText.text == '') {
        event.preventDefault();
        return change.collapseCharBackward();
      }
    }

    if (slate_hotkeys__WEBPACK_IMPORTED_MODULE_14__["default"].isCollapseCharForward(event)) {
      var _document = value.document,
          _isInVoid = value.isInVoid,
          nextText = value.nextText,
          _startText = value.startText;

      var isNextInVoid = nextText && _document.hasVoidParent(nextText.key);
      if (_isInVoid || isNextInVoid || _startText.text == '') {
        event.preventDefault();
        return change.collapseCharForward();
      }
    }

    if (slate_hotkeys__WEBPACK_IMPORTED_MODULE_14__["default"].isExtendCharBackward(event)) {
      var _document2 = value.document,
          _isInVoid2 = value.isInVoid,
          _previousText = value.previousText,
          _startText2 = value.startText;

      var _isPreviousInVoid = _previousText && _document2.hasVoidParent(_previousText.key);
      if (_isInVoid2 || _isPreviousInVoid || _startText2.text == '') {
        event.preventDefault();
        return change.extendCharBackward();
      }
    }

    if (slate_hotkeys__WEBPACK_IMPORTED_MODULE_14__["default"].isExtendCharForward(event)) {
      var _document3 = value.document,
          _isInVoid3 = value.isInVoid,
          _nextText = value.nextText,
          _startText3 = value.startText;

      var _isNextInVoid = _nextText && _document3.hasVoidParent(_nextText.key);
      if (_isInVoid3 || _isNextInVoid || _startText3.text == '') {
        event.preventDefault();
        return change.extendCharForward();
      }
    }
  }

  /**
   * On paste.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onPaste(event, change, editor) {
    debug$5('onPaste', { event: event });

    var transfer = getEventTransfer(event);
    var type = transfer.type,
        fragment = transfer.fragment,
        text = transfer.text;


    if (type == 'fragment') {
      change.insertFragment(fragment);
    }

    if (type == 'text' || type == 'html') {
      if (!text) return;
      var value = change.value;
      var document = value.document,
          selection = value.selection,
          startBlock = value.startBlock;

      if (startBlock.isVoid) return;

      var defaultBlock = startBlock;
      var defaultMarks = document.getInsertMarksAtRange(selection);
      var frag = slate_plain_serializer__WEBPACK_IMPORTED_MODULE_13__["default"].deserialize(text, { defaultBlock: defaultBlock, defaultMarks: defaultMarks }).document;
      change.insertFragment(frag);
    }
  }

  /**
   * On select.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onSelect(event, change, editor) {
    debug$5('onSelect', { event: event });

    var window = get_window__WEBPACK_IMPORTED_MODULE_8___default()(event.target);
    var value = change.value;
    var document = value.document;

    var native = window.getSelection();

    // If there are no ranges, the editor was blurred natively.
    if (!native.rangeCount) {
      change.blur();
      return;
    }

    // Otherwise, determine the Slate selection from the native one.
    var range = findRange(native, value);
    if (!range) return;

    var _range = range,
        anchorKey = _range.anchorKey,
        anchorOffset = _range.anchorOffset,
        focusKey = _range.focusKey,
        focusOffset = _range.focusOffset;

    var anchorText = document.getNode(anchorKey);
    var focusText = document.getNode(focusKey);
    var anchorInline = document.getClosestInline(anchorKey);
    var focusInline = document.getClosestInline(focusKey);
    var focusBlock = document.getClosestBlock(focusKey);
    var anchorBlock = document.getClosestBlock(anchorKey);

    // COMPAT: If the anchor point is at the start of a non-void, and the
    // focus point is inside a void node with an offset that isn't `0`, set
    // the focus offset to `0`. This is due to void nodes <span>'s being
    // positioned off screen, resulting in the offset always being greater
    // than `0`. Since we can't know what it really should be, and since an
    // offset of `0` is less destructive because it creates a hanging
    // selection, go with `0`. (2017/09/07)
    if (anchorBlock && !anchorBlock.isVoid && anchorOffset == 0 && focusBlock && focusBlock.isVoid && focusOffset != 0) {
      range = range.set('focusOffset', 0);
    }

    // COMPAT: If the selection is at the end of a non-void inline node, and
    // there is a node after it, put it in the node after instead. This
    // standardizes the behavior, since it's indistinguishable to the user.
    if (anchorInline && !anchorInline.isVoid && anchorOffset == anchorText.text.length) {
      var block = document.getClosestBlock(anchorKey);
      var next = block.getNextText(anchorKey);
      if (next) range = range.moveAnchorTo(next.key, 0);
    }

    if (focusInline && !focusInline.isVoid && focusOffset == focusText.text.length) {
      var _block = document.getClosestBlock(focusKey);
      var _next = _block.getNextText(focusKey);
      if (_next) range = range.moveFocusTo(_next.key, 0);
    }

    range = range.normalize(document);
    change.select(range);
  }

  /**
   * Render editor.
   *
   * @param {Object} props
   * @param {Editor} editor
   * @return {Object}
   */

  function renderEditor(props, editor) {
    var handlers = EVENT_HANDLERS.reduce(function (obj, handler) {
      obj[handler] = editor[handler];
      return obj;
    }, {});

    return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(Content, _extends({}, handlers, {
      autoCorrect: props.autoCorrect,
      className: props.className,
      children: props.children,
      editor: editor,
      readOnly: props.readOnly,
      role: props.role,
      spellCheck: props.spellCheck,
      style: props.style,
      tabIndex: props.tabIndex,
      tagName: props.tagName
    }));
  }

  /**
   * Render node.
   *
   * @param {Object} props
   * @return {Element}
   */

  function renderNode(props) {
    var attributes = props.attributes,
        children = props.children,
        node = props.node;

    if (node.object != 'block' && node.object != 'inline') return;
    var Tag = node.object == 'block' ? 'div' : 'span';
    var style = { position: 'relative' };
    return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
      Tag,
      _extends({}, attributes, { style: style }),
      children
    );
  }

  /**
   * Render placeholder.
   *
   * @param {Object} props
   * @return {Element}
   */

  function renderPlaceholder(props) {
    var editor = props.editor,
        node = props.node;

    if (!editor.props.placeholder) return;
    if (editor.state.isComposing) return;
    if (node.object != 'block') return;
    if (!slate__WEBPACK_IMPORTED_MODULE_7__["Text"].isTextList(node.nodes)) return;
    if (node.text != '') return;
    if (editor.value.document.getBlocks().size > 1) return;

    var style = {
      pointerEvents: 'none',
      display: 'inline-block',
      width: '0',
      maxWidth: '100%',
      whiteSpace: 'nowrap',
      opacity: '0.333'
    };

    return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
      'span',
      { contentEditable: false, style: style },
      editor.props.placeholder
    );
  }

  /**
   * Return the plugin.
   *
   * @type {Object}
   */

  return {
    onBeforeInput: onBeforeInput,
    onBlur: onBlur,
    onClick: onClick,
    onCopy: onCopy,
    onCut: onCut,
    onDragEnd: onDragEnd,
    onDragOver: onDragOver,
    onDragStart: onDragStart,
    onDrop: onDrop,
    onInput: onInput,
    onKeyDown: onKeyDown,
    onPaste: onPaste,
    onSelect: onSelect,
    renderEditor: renderEditor,
    renderNode: renderNode,
    renderPlaceholder: renderPlaceholder
  };
}

/**
 * Debug.
 *
 * @type {Function}
 */

var debug$6 = debug__WEBPACK_IMPORTED_MODULE_0___default()('slate:before');

/**
 * The core before plugin.
 *
 * @return {Object}
 */

function BeforePlugin() {
  var activeElement = null;
  var compositionCount = 0;
  var isComposing = false;
  var isCopying = false;
  var isDragging = false;

  /**
   * On before input.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onBeforeInput(event, change, editor) {
    if (editor.props.readOnly) return true;

    // COMPAT: React's `onBeforeInput` synthetic event is based on the native
    // `keypress` and `textInput` events. In browsers that support the native
    // `beforeinput` event, we instead use that event to trigger text insertion,
    // since it provides more useful information about the range being affected
    // and also preserves compatibility with iOS autocorrect, which would be
    // broken if we called `preventDefault()` on React's synthetic event here.
    // Since native `onbeforeinput` mainly benefits autocorrect and spellcheck
    // for mobile, on desktop it brings IME issue, limit its scope for now.
    if ((slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["IS_IOS"] || slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["IS_ANDROID"]) && slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["SUPPORTED_EVENTS"].beforeinput) return true;

    debug$6('onBeforeInput', { event: event });
  }

  /**
   * On blur.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onBlur(event, change, editor) {
    if (isCopying) return true;
    if (editor.props.readOnly) return true;

    var value = change.value;
    var relatedTarget = event.relatedTarget,
        target = event.target;

    var window = get_window__WEBPACK_IMPORTED_MODULE_8___default()(target);

    // COMPAT: If the current `activeElement` is still the previous one, this is
    // due to the window being blurred when the tab itself becomes unfocused, so
    // we want to abort early to allow to editor to stay focused when the tab
    // becomes focused again.
    if (activeElement == window.document.activeElement) return true;

    // COMPAT: The `relatedTarget` can be null when the new focus target is not
    // a "focusable" element (eg. a `<div>` without `tabindex` set).
    if (relatedTarget) {
      var el = Object(react_dom__WEBPACK_IMPORTED_MODULE_15__["findDOMNode"])(editor);

      // COMPAT: The event should be ignored if the focus is returning to the
      // editor from an embedded editable element (eg. an <input> element inside
      // a void node).
      if (relatedTarget == el) return true;

      // COMPAT: The event should be ignored if the focus is moving from the
      // editor to inside a void node's spacer element.
      if (relatedTarget.hasAttribute('data-slate-spacer')) return true;

      // COMPAT: The event should be ignored if the focus is moving to a non-
      // editable section of an element that isn't a void node (eg. a list item
      // of the check list example).
      var node = findNode(relatedTarget, value);
      if (el.contains(relatedTarget) && node && !node.isVoid) return true;
    }

    debug$6('onBlur', { event: event });
  }

  /**
   * On change.
   *
   * @param {Change} change
   * @param {Editor} editor
   */

  function onChange(change, editor) {
    var value = change.value;

    // If the value's schema isn't the editor's schema, update it. This can
    // happen on the initialization of the editor, or if the schema changes.
    // This change isn't save into history since only schema is updated.

    if (value.schema != editor.schema) {
      change.setValue({ schema: editor.schema }, { save: false }).normalize();
    }

    debug$6('onChange');
  }

  /**
   * On composition end.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onCompositionEnd(event, change, editor) {
    var n = compositionCount;

    // The `count` check here ensures that if another composition starts
    // before the timeout has closed out this one, we will abort unsetting the
    // `isComposing` flag, since a composition is still in affect.
    window.requestAnimationFrame(function () {
      if (compositionCount > n) return;
      isComposing = false;

      // HACK: we need to re-render the editor here so that it will update its
      // placeholder in case one is currently rendered. This should be handled
      // differently ideally, in a less invasive way?
      // (apply force re-render if isComposing changes)
      if (editor.state.isComposing) {
        editor.setState({ isComposing: false });
      }
    });

    debug$6('onCompositionEnd', { event: event });
  }

  /**
   * On composition start.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onCompositionStart(event, change, editor) {
    isComposing = true;
    compositionCount++;

    // HACK: we need to re-render the editor here so that it will update its
    // placeholder in case one is currently rendered. This should be handled
    // differently ideally, in a less invasive way?
    // (apply force re-render if isComposing changes)
    if (!editor.state.isComposing) {
      editor.setState({ isComposing: true });
    }

    debug$6('onCompositionStart', { event: event });
  }

  /**
   * On copy.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onCopy(event, change, editor) {
    var window = get_window__WEBPACK_IMPORTED_MODULE_8___default()(event.target);
    isCopying = true;
    window.requestAnimationFrame(function () {
      return isCopying = false;
    });

    debug$6('onCopy', { event: event });
  }

  /**
   * On cut.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onCut(event, change, editor) {
    if (editor.props.readOnly) return true;

    var window = get_window__WEBPACK_IMPORTED_MODULE_8___default()(event.target);
    isCopying = true;
    window.requestAnimationFrame(function () {
      return isCopying = false;
    });

    debug$6('onCut', { event: event });
  }

  /**
   * On drag end.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDragEnd(event, change, editor) {
    isDragging = false;

    debug$6('onDragEnd', { event: event });
  }

  /**
   * On drag enter.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDragEnter(event, change, editor) {
    debug$6('onDragEnter', { event: event });
  }

  /**
   * On drag exit.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDragExit(event, change, editor) {
    debug$6('onDragExit', { event: event });
  }

  /**
   * On drag leave.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDragLeave(event, change, editor) {
    debug$6('onDragLeave', { event: event });
  }

  /**
   * On drag over.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDragOver(event, change, editor) {
    // If the target is inside a void node, and only in this case,
    // call `preventDefault` to signal that drops are allowed.
    // When the target is editable, dropping is already allowed by
    // default, and calling `preventDefault` hides the cursor.
    var node = findNode(event.target, editor.value);
    if (node.isVoid) event.preventDefault();

    // If a drag is already in progress, don't do this again.
    if (!isDragging) {
      isDragging = true;
      event.nativeEvent.dataTransfer.dropEffect = 'move';
    }

    debug$6('onDragOver', { event: event });
  }

  /**
   * On drag start.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDragStart(event, change, editor) {
    isDragging = true;

    debug$6('onDragStart', { event: event });
  }

  /**
   * On drop.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onDrop(event, change, editor) {
    // Nothing happens in read-only mode.
    if (editor.props.readOnly) return true;

    // Prevent default so the DOM's value isn't corrupted.
    event.preventDefault();

    debug$6('onDrop', { event: event });
  }

  /**
   * On focus.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onFocus(event, change, editor) {
    if (isCopying) return true;
    if (editor.props.readOnly) return true;

    var el = Object(react_dom__WEBPACK_IMPORTED_MODULE_15__["findDOMNode"])(editor);

    // Save the new `activeElement`.
    var window = get_window__WEBPACK_IMPORTED_MODULE_8___default()(event.target);
    activeElement = window.document.activeElement;

    // COMPAT: If the editor has nested editable elements, the focus can go to
    // those elements. In Firefox, this must be prevented because it results in
    // issues with keyboard navigation. (2017/03/30)
    if (slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["IS_FIREFOX"] && event.target != el) {
      el.focus();
      return true;
    }

    debug$6('onFocus', { event: event });
  }

  /**
   * On input.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onInput(event, change, editor) {
    if (isComposing) return true;
    if (change.value.isBlurred) return true;

    debug$6('onInput', { event: event });
  }

  /**
   * On key down.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onKeyDown(event, change, editor) {
    if (editor.props.readOnly) return true;

    // When composing, we need to prevent all hotkeys from executing while
    // typing. However, certain characters also move the selection before
    // we're able to handle it, so prevent their default behavior.
    if (isComposing) {
      if (slate_hotkeys__WEBPACK_IMPORTED_MODULE_14__["default"].isComposing(event)) event.preventDefault();
      return true;
    }

    // Certain hotkeys have native behavior in contenteditable elements which
    // will cause our value to be out of sync, so prevent them.
    if (slate_hotkeys__WEBPACK_IMPORTED_MODULE_14__["default"].isContentEditable(event) && !slate_dev_environment__WEBPACK_IMPORTED_MODULE_10__["IS_IOS"]) {
      event.preventDefault();
    }

    debug$6('onKeyDown', { event: event });
  }

  /**
   * On paste.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onPaste(event, change, editor) {
    if (editor.props.readOnly) return true;

    // Prevent defaults so the DOM state isn't corrupted.
    event.preventDefault();

    debug$6('onPaste', { event: event });
  }

  /**
   * On select.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   */

  function onSelect(event, change, editor) {
    if (isCopying) return true;
    if (isComposing) return true;
    if (editor.props.readOnly) return true;

    // Save the new `activeElement`.
    var window = get_window__WEBPACK_IMPORTED_MODULE_8___default()(event.target);
    activeElement = window.document.activeElement;

    debug$6('onSelect', { event: event });
  }

  /**
   * Return the plugin.
   *
   * @type {Object}
   */

  return {
    onBeforeInput: onBeforeInput,
    onBlur: onBlur,
    onChange: onChange,
    onCompositionEnd: onCompositionEnd,
    onCompositionStart: onCompositionStart,
    onCopy: onCopy,
    onCut: onCut,
    onDragEnd: onDragEnd,
    onDragEnter: onDragEnter,
    onDragExit: onDragExit,
    onDragLeave: onDragLeave,
    onDragOver: onDragOver,
    onDragStart: onDragStart,
    onDrop: onDrop,
    onFocus: onFocus,
    onInput: onInput,
    onKeyDown: onKeyDown,
    onPaste: onPaste,
    onSelect: onSelect
  };
}

/**
 * Noop.
 *
 * @return {Void}
 */

function noop() {}

/**
 * Debug.
 *
 * @type {Function}
 */

var debug$7 = debug__WEBPACK_IMPORTED_MODULE_0___default()('slate:editor');

/**
 * Editor.
 *
 * @type {Component}
 */

var Editor = function (_React$Component) {
  inherits(Editor, _React$Component);

  /**
   * Constructor.
   *
   * @param {Object} props
   */

  /**
   * Property types.
   *
   * @type {Object}
   */

  function Editor(props) {
    classCallCheck(this, Editor);

    var _this = possibleConstructorReturn(this, (Editor.__proto__ || Object.getPrototypeOf(Editor)).call(this, props));

    _initialiseProps$4.call(_this);

    _this.state = {};
    _this.tmp = {};
    _this.tmp.updates = 0;
    _this.tmp.resolves = 0;

    // Resolve the plugins and create a stack and schema from them.
    var plugins = _this.resolvePlugins(props.plugins, props.schema);
    var stack = slate__WEBPACK_IMPORTED_MODULE_7__["Stack"].create({ plugins: plugins });
    var schema = slate__WEBPACK_IMPORTED_MODULE_7__["Schema"].create({ plugins: plugins });
    _this.state.schema = schema;
    _this.state.stack = stack;

    // Run `onChange` on the passed-in value because we need to ensure that it
    // is normalized, and queue the resulting change.
    var change = props.value.change();
    stack.run('onChange', change, _this);
    _this.queueChange(change);
    _this.state.value = change.value;

    // Create a bound event handler for each event.
    EVENT_HANDLERS.forEach(function (handler) {
      _this[handler] = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this.onEvent.apply(_this, [handler].concat(args));
      };
    });
    return _this;
  }

  /**
   * When the `props` are updated, create a new `Stack` if necessary and run
   * `onChange` to ensure the value is normalized.
   *
   * @param {Object} props
   */

  /**
   * Default properties.
   *
   * @type {Object}
   */

  /**
   * When the component first mounts, flush any temporary changes,
   * and then, focus the editor if `autoFocus` is set.
   */

  /**
   * When the component updates, flush any temporary change.
   */

  /**
   * Queue a `change` object, to be able to flush it later. This is required for
   * when a change needs to be applied to the value, but because of the React
   * lifecycle we can't apply that change immediately. So we cache it here and
   * later can call `this.flushChange()` to flush it.
   *
   * @param {Change} change
   */

  /**
   * Flush a temporarily stored `change` object, for when a change needed to be
   * made but couldn't because of React's lifecycle.
   */

  /**
   * Perform a change on the editor, passing `...args` to `change.call`.
   *
   * @param {Mixed} ...args
   */

  /**
   * Programmatically blur the editor.
   */

  /**
   * Programmatically focus the editor.
   */

  createClass(Editor, [{
    key: 'render',


    /**
     * Render the editor.
     *
     * @return {Element}
     */

    value: function render() {
      debug$7('render', this);

      var children = this.stack.map('renderPortal', this.value, this).map(function (child, i) {
        return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
          react_portal__WEBPACK_IMPORTED_MODULE_16___default.a,
          { key: i, isOpened: true },
          child
        );
      });

      var props = _extends({}, this.props, { children: children });
      var tree = this.stack.render('renderEditor', props, this);
      return tree;
    }

    /**
     * Resolve an array of plugins from `plugins` and `schema` props.
     *
     * In addition to the plugins provided in props, this will initialize three
     * other plugins:
     *
     * - The top-level editor plugin, which allows for top-level handlers, etc.
     * - The two "core" plugins, one before all the other and one after.
     *
     * @param {Array|Void} plugins
     * @param {Schema|Object|Void} schema
     * @return {Array}
     */

  }, {
    key: 'schema',


    /**
     * Getters for exposing public properties of the editor's state.
     */

    get: function get$$1() {
      return this.state.schema;
    }
  }, {
    key: 'stack',
    get: function get$$1() {
      return this.state.stack;
    }
  }, {
    key: 'value',
    get: function get$$1() {
      return this.state.value;
    }

    /**
     * On event.
     *
     * @param {String} handler
     * @param {Event} event
     */

    /**
     * On change.
     *
     * @param {Change} change
     */

  }]);
  return Editor;
}(react__WEBPACK_IMPORTED_MODULE_1___default.a.Component);

/**
 * Mix in the property types for the event handlers.
 */

Editor.propTypes = {
  autoCorrect: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.bool,
  autoFocus: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.bool,
  className: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.string,
  onChange: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.func,
  placeholder: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.any,
  plugins: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.array,
  readOnly: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.bool,
  role: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.string,
  schema: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.object,
  spellCheck: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.bool,
  style: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.object,
  tabIndex: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.number,
  value: slate_prop_types__WEBPACK_IMPORTED_MODULE_3__["default"].value.isRequired };
Editor.defaultProps = {
  autoFocus: false,
  autoCorrect: true,
  onChange: noop,
  plugins: [],
  readOnly: false,
  schema: {},
  spellCheck: true };

var _initialiseProps$4 = function _initialiseProps() {
  var _this2 = this;

  this.componentWillReceiveProps = function (props) {
    var schema = _this2.schema,
        stack = _this2.stack;

    // Increment the updates counter as a baseline.

    _this2.tmp.updates++;

    // If the plugins or the schema have changed, we need to re-resolve the
    // plugins, since it will result in a new stack and new validations.
    if (props.plugins != _this2.props.plugins || props.schema != _this2.props.schema) {
      var plugins = _this2.resolvePlugins(props.plugins, props.schema);
      stack = slate__WEBPACK_IMPORTED_MODULE_7__["Stack"].create({ plugins: plugins });
      schema = slate__WEBPACK_IMPORTED_MODULE_7__["Schema"].create({ plugins: plugins });
      _this2.setState({ schema: schema, stack: stack });

      // Increment the resolves counter.
      _this2.tmp.resolves++;

      // If we've resolved a few times already, and it's exactly in line with
      // the updates, then warn the user that they may be doing something wrong.
      if (_this2.tmp.resolves > 5 && _this2.tmp.resolves == _this2.tmp.updates) {
        slate_dev_logger__WEBPACK_IMPORTED_MODULE_6__["default"].warn('A Slate <Editor> is re-resolving `props.plugins` or `props.schema` on each update, which leads to poor performance. This is often due to passing in a new `schema` or `plugins` prop with each render by declaring them inline in your render function. Do not do this!');
      }
    }

    // Run `onChange` on the passed-in value because we need to ensure that it
    // is normalized, and queue the resulting change.
    var change = props.value.change();
    stack.run('onChange', change, _this2);
    _this2.queueChange(change);
    _this2.setState({ value: change.value });
  };

  this.componentDidMount = function () {
    _this2.flushChange();

    if (_this2.props.autoFocus) {
      _this2.focus();
    }
  };

  this.componentDidUpdate = function () {
    _this2.flushChange();
  };

  this.queueChange = function (change) {
    if (change.operations.size) {
      debug$7('queueChange', { change: change });
      _this2.tmp.change = change;
    }
  };

  this.flushChange = function () {
    var change = _this2.tmp.change;


    if (change) {
      debug$7('flushChange', { change: change });
      delete _this2.tmp.change;
      _this2.props.onChange(change);
    }
  };

  this.change = function () {
    var _value$change;

    var change = (_value$change = _this2.value.change()).call.apply(_value$change, arguments);
    _this2.onChange(change);
  };

  this.blur = function () {
    _this2.change(function (c) {
      return c.blur();
    });
  };

  this.focus = function () {
    _this2.change(function (c) {
      return c.focus();
    });
  };

  this.onEvent = function (handler, event) {
    _this2.change(function (change) {
      _this2.stack.run(handler, event, change, _this2);
    });
  };

  this.onChange = function (change) {
    debug$7('onChange', { change: change });

    _this2.stack.run('onChange', change, _this2);
    var value = change.value;
    var onChange = _this2.props.onChange;

    if (value == _this2.value) return;
    onChange(change);
  };

  this.resolvePlugins = function (plugins, schema) {
    var beforePlugin = BeforePlugin();
    var afterPlugin = AfterPlugin();
    var editorPlugin = {
      schema: schema || {}
    };

    var _loop = function _loop(_prop) {
      // Skip `onChange` because the editor's `onChange` is special.
      if (_prop == 'onChange') return 'continue';

      // Skip `schema` because it can't be proxied easily, so it must be
      // passed in as an argument to this function instead.
      if (_prop == 'schema') return 'continue';

      // Define a function that will just proxies into `props`.
      editorPlugin[_prop] = function () {
        var _props;

        return _this2.props[_prop] && (_props = _this2.props)[_prop].apply(_props, arguments);
      };
    };

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = PLUGIN_PROPS[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var _prop = _step2.value;

        var _ret = _loop(_prop);

        if (_ret === 'continue') continue;
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return [beforePlugin, editorPlugin].concat(toConsumableArray(plugins || []), [afterPlugin]);
  };
};

var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
  for (var _iterator = EVENT_HANDLERS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
    var prop = _step.value;

    Editor.propTypes[prop] = prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.func;
  }

  /**
   * Export.
   *
   * @type {Component}
   */
} catch (err) {
  _didIteratorError = true;
  _iteratorError = err;
} finally {
  try {
    if (!_iteratorNormalCompletion && _iterator.return) {
      _iterator.return();
    }
  } finally {
    if (_didIteratorError) {
      throw _iteratorError;
    }
  }
}

var index = {
  Editor: Editor,
  cloneFragment: cloneFragment,
  findDOMNode: findDOMNode$1,
  findDOMRange: findDOMRange,
  findNode: findNode,
  findRange: findRange,
  getEventRange: getEventRange,
  getEventTransfer: getEventTransfer,
  setEventTransfer: setEventTransfer,
  AfterPlugin: AfterPlugin,
  BeforePlugin: BeforePlugin
};

/* harmony default export */ __webpack_exports__["default"] = (index);

//# sourceMappingURL=slate-react.es.js.map


/***/ }),

/***/ "./node_modules/slate-schema-violations/lib/slate-schema-violations.es.js":
/*!********************************************************************************!*\
  !*** ./node_modules/slate-schema-violations/lib/slate-schema-violations.es.js ***!
  \********************************************************************************/
/*! exports provided: CHILD_OBJECT_INVALID, CHILD_REQUIRED, CHILD_TYPE_INVALID, CHILD_UNKNOWN, FIRST_CHILD_OBJECT_INVALID, FIRST_CHILD_TYPE_INVALID, LAST_CHILD_OBJECT_INVALID, LAST_CHILD_TYPE_INVALID, NODE_DATA_INVALID, NODE_IS_VOID_INVALID, NODE_MARK_INVALID, NODE_TEXT_INVALID, PARENT_OBJECT_INVALID, PARENT_TYPE_INVALID */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CHILD_OBJECT_INVALID", function() { return CHILD_OBJECT_INVALID; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CHILD_REQUIRED", function() { return CHILD_REQUIRED; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CHILD_TYPE_INVALID", function() { return CHILD_TYPE_INVALID; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CHILD_UNKNOWN", function() { return CHILD_UNKNOWN; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FIRST_CHILD_OBJECT_INVALID", function() { return FIRST_CHILD_OBJECT_INVALID; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FIRST_CHILD_TYPE_INVALID", function() { return FIRST_CHILD_TYPE_INVALID; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LAST_CHILD_OBJECT_INVALID", function() { return LAST_CHILD_OBJECT_INVALID; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LAST_CHILD_TYPE_INVALID", function() { return LAST_CHILD_TYPE_INVALID; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NODE_DATA_INVALID", function() { return NODE_DATA_INVALID; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NODE_IS_VOID_INVALID", function() { return NODE_IS_VOID_INVALID; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NODE_MARK_INVALID", function() { return NODE_MARK_INVALID; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NODE_TEXT_INVALID", function() { return NODE_TEXT_INVALID; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PARENT_OBJECT_INVALID", function() { return PARENT_OBJECT_INVALID; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PARENT_TYPE_INVALID", function() { return PARENT_TYPE_INVALID; });
/**
 * Schema violations.
 *
 * @type {String}
 */

var CHILD_OBJECT_INVALID = 'child_object_invalid';
var CHILD_REQUIRED = 'child_required';
var CHILD_TYPE_INVALID = 'child_type_invalid';
var CHILD_UNKNOWN = 'child_unknown';
var FIRST_CHILD_OBJECT_INVALID = 'first_child_object_invalid';
var FIRST_CHILD_TYPE_INVALID = 'first_child_type_invalid';
var LAST_CHILD_OBJECT_INVALID = 'last_child_object_invalid';
var LAST_CHILD_TYPE_INVALID = 'last_child_type_invalid';
var NODE_DATA_INVALID = 'node_data_invalid';
var NODE_IS_VOID_INVALID = 'node_is_void_invalid';
var NODE_MARK_INVALID = 'node_mark_invalid';
var NODE_TEXT_INVALID = 'node_text_invalid';
var PARENT_OBJECT_INVALID = 'parent_object_invalid';
var PARENT_TYPE_INVALID = 'parent_type_invalid';


//# sourceMappingURL=slate-schema-violations.es.js.map


/***/ }),

/***/ "./node_modules/slate/lib/slate.es.js":
/*!********************************************!*\
  !*** ./node_modules/slate/lib/slate.es.js ***!
  \********************************************/
/*! exports provided: default, Block, Change, Changes, Character, Data, Document, History, Inline, Leaf, Mark, Node, Operation, Operations, Range, Schema, Stack, Text, Value, resetKeyGenerator, setKeyGenerator, resetMemoization, useMemoization */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Block", function() { return Block; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Change", function() { return Change; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Changes", function() { return Changes$7; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Character", function() { return Character; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Data", function() { return Data; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Document", function() { return Document; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "History", function() { return History; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Inline", function() { return Inline; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Leaf", function() { return Leaf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Mark", function() { return Mark; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Node", function() { return Node; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Operation", function() { return Operation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Operations", function() { return Operations; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Range", function() { return Range; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Schema", function() { return Schema; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Stack", function() { return Stack$1; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Text", function() { return Text; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Value", function() { return Value; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resetKeyGenerator", function() { return resetKeyGenerator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setKeyGenerator", function() { return setKeyGenerator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resetMemoization", function() { return resetMemoization; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "useMemoization", function() { return useMemoization; });
/* harmony import */ var is_plain_object__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! is-plain-object */ "./node_modules/is-plain-object/index.js");
/* harmony import */ var is_plain_object__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(is_plain_object__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var immutable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! immutable */ "./node_modules/immutable/dist/immutable.js");
/* harmony import */ var immutable__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(immutable__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! slate-dev-logger */ "./node_modules/slate-dev-logger/lib/slate-dev-logger.es.js");
/* harmony import */ var direction__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! direction */ "./node_modules/direction/index.js");
/* harmony import */ var direction__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(direction__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var esrever__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! esrever */ "./node_modules/esrever/esrever.js");
/* harmony import */ var esrever__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(esrever__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(debug__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var lodash_isEqual__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! lodash/isEqual */ "./node_modules/lodash/isEqual.js");
/* harmony import */ var lodash_isEqual__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(lodash_isEqual__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var lodash_mergeWith__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! lodash/mergeWith */ "./node_modules/lodash/mergeWith.js");
/* harmony import */ var lodash_mergeWith__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(lodash_mergeWith__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! slate-schema-violations */ "./node_modules/slate-schema-violations/lib/slate-schema-violations.es.js");
/* harmony import */ var lodash_pick__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! lodash/pick */ "./node_modules/lodash/pick.js");
/* harmony import */ var lodash_pick__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(lodash_pick__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var lodash_omit__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! lodash/omit */ "./node_modules/lodash/omit.js");
/* harmony import */ var lodash_omit__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(lodash_omit__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var is_empty__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! is-empty */ "./node_modules/is-empty/lib/index.js");
/* harmony import */ var is_empty__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(is_empty__WEBPACK_IMPORTED_MODULE_11__);













var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};



var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};









var objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};





var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();













var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/**
 * Data.
 *
 * This isn't an immutable record, it's just a thin wrapper around `Map` so that
 * we can allow for more convenient creation.
 *
 * @type {Object}
 */

var Data = function () {
  function Data() {
    classCallCheck(this, Data);
  }

  createClass(Data, null, [{
    key: 'create',

    /**
     * Create a new `Data` with `attrs`.
     *
     * @param {Object|Data|Map} attrs
     * @return {Data} data
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (immutable__WEBPACK_IMPORTED_MODULE_1__["Map"].isMap(attrs)) {
        return attrs;
      }

      if (is_plain_object__WEBPACK_IMPORTED_MODULE_0___default()(attrs)) {
        return Data.fromJSON(attrs);
      }

      throw new Error('`Data.create` only accepts objects or maps, but you passed it: ' + attrs);
    }

    /**
     * Create a `Data` from a JSON `object`.
     *
     * @param {Object} object
     * @return {Data}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      return new immutable__WEBPACK_IMPORTED_MODULE_1__["Map"](object);
    }

    /**
     * Alias `fromJS`.
     */

  }]);
  return Data;
}();

/**
 * Export.
 *
 * @type {Object}
 */

Data.fromJS = Data.fromJSON;

/**
 * Slate-specific model types.
 *
 * @type {Object}
 */

var MODEL_TYPES = {
  BLOCK: '@@__SLATE_BLOCK__@@',
  CHANGE: '@@__SLATE_CHANGE__@@',
  CHARACTER: '@@__SLATE_CHARACTER__@@',
  DOCUMENT: '@@__SLATE_DOCUMENT__@@',
  HISTORY: '@@__SLATE_HISTORY__@@',
  INLINE: '@@__SLATE_INLINE__@@',
  LEAF: '@@__SLATE_LEAF__@@',
  MARK: '@@__SLATE_MARK__@@',
  OPERATION: '@@__SLATE_OPERATION__@@',
  RANGE: '@@__SLATE_RANGE__@@',
  SCHEMA: '@@__SLATE_SCHEMA__@@',
  STACK: '@@__SLATE_STACK__@@',
  TEXT: '@@__SLATE_TEXT__@@',
  VALUE: '@@__SLATE_VALUE__@@'

  /**
   * Export.
   *
   * @type {Object}
   */

};

/**
 * GLOBAL: True if memoization should is enabled.
 *
 * @type {Boolean}
 */

var ENABLED = true;

/**
 * GLOBAL: Changing this cache key will clear all previous cached results.
 *
 * @type {Number}
 */

var CACHE_KEY = 0;

/**
 * The leaf node of a cache tree. Used to support variable argument length. A
 * unique object, so that native Maps will key it by reference.
 *
 * @type {Object}
 */

var LEAF = {};

/**
 * A value to represent a memoized undefined value. Allows efficient value
 * retrieval using Map.get only.
 *
 * @type {Object}
 */

var UNDEFINED = {};

/**
 * Default value for unset keys in native Maps
 *
 * @type {Undefined}
 */

var UNSET = undefined;

/**
 * Memoize all of the `properties` on a `object`.
 *
 * @param {Object} object
 * @param {Array} properties
 * @return {Record}
 */

function memoize(object, properties) {
  var _loop = function _loop(property) {
    var original = object[property];

    if (!original) {
      throw new Error("Object does not have a property named \"" + property + "\".");
    }

    object[property] = function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // If memoization is disabled, call into the original method.
      if (!ENABLED) return original.apply(this, args);

      // If the cache key is different, previous caches must be cleared.
      if (CACHE_KEY !== this.__cache_key) {
        this.__cache_key = CACHE_KEY;
        this.__cache = new Map(); // eslint-disable-line no-undef,no-restricted-globals
        this.__cache_no_args = {};
      }

      if (!this.__cache) {
        this.__cache = new Map(); // eslint-disable-line no-undef,no-restricted-globals
      }
      if (!this.__cache_no_args) {
        this.__cache_no_args = {};
      }

      var takesArguments = args.length !== 0;

      var cachedValue = void 0;
      var keys = void 0;

      if (takesArguments) {
        keys = [property].concat(args);
        cachedValue = getIn(this.__cache, keys);
      } else {
        cachedValue = this.__cache_no_args[property];
      }

      // If we've got a result already, return it.
      if (cachedValue !== UNSET) {
        return cachedValue === UNDEFINED ? undefined : cachedValue;
      }

      // Otherwise calculate what it should be once and cache it.
      var value = original.apply(this, args);
      var v = value === undefined ? UNDEFINED : value;

      if (takesArguments) {
        this.__cache = setIn(this.__cache, keys, v);
      } else {
        this.__cache_no_args[property] = v;
      }

      return value;
    };
  };

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = properties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var property = _step.value;

      _loop(property);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

/**
 * Get a value at a key path in a tree of Map.
 *
 * If not set, returns UNSET.
 * If the set value is undefined, returns UNDEFINED.
 *
 * @param {Map} map
 * @param {Array} keys
 * @return {Any|UNSET|UNDEFINED}
 */

function getIn(map, keys) {
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = keys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var key = _step2.value;

      map = map.get(key);
      if (map === UNSET) return UNSET;
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return map.get(LEAF);
}

/**
 * Set a value at a key path in a tree of Map, creating Maps on the go.
 *
 * @param {Map} map
 * @param {Array} keys
 * @param {Any} value
 * @return {Map}
 */

function setIn(map, keys, value) {
  var parent = map;
  var child = void 0;

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = keys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var key = _step3.value;

      child = parent.get(key);

      // If the path was not created yet...
      if (child === UNSET) {
        child = new Map(); // eslint-disable-line no-undef,no-restricted-globals
        parent.set(key, child);
      }

      parent = child;
    }

    // The whole path has been created, so set the value to the bottom most map.
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  child.set(LEAF, value);
  return map;
}

/**
 * In DEV mode, clears the previously memoized values, globally.
 *
 * @return {Void}
 */

function resetMemoization() {
  CACHE_KEY++;

  if (CACHE_KEY >= Number.MAX_SAFE_INTEGER) {
    CACHE_KEY = 0;
  }
}

/**
 * In DEV mode, enable or disable the use of memoize values, globally.
 *
 * @param {Boolean} enabled
 * @return {Void}
 */

function useMemoization(enabled) {
  ENABLED = enabled;
}

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  data: new immutable__WEBPACK_IMPORTED_MODULE_1__["Map"](),
  type: undefined

  /**
   * Mark.
   *
   * @type {Mark}
   */

};
var Mark = function (_Record) {
  inherits(Mark, _Record);

  function Mark() {
    classCallCheck(this, Mark);
    return possibleConstructorReturn(this, (Mark.__proto__ || Object.getPrototypeOf(Mark)).apply(this, arguments));
  }

  createClass(Mark, [{
    key: 'getComponent',


    /**
     * Get the component for the node from a `schema`.
     *
     * @param {Schema} schema
     * @return {Component|Void}
     */

    value: function getComponent(schema) {
      return schema.__getComponent(this);
    }

    /**
     * Return a JSON representation of the mark.
     *
     * @return {Object}
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
      var object = {
        object: this.object,
        type: this.type,
        data: this.data.toJSON()
      };

      return object;
    }

    /**
     * Alias `toJS`.
     */

  }, {
    key: 'toJS',
    value: function toJS() {
      return this.toJSON();
    }
  }, {
    key: 'object',


    /**
     * Object.
     */

    get: function get$$1() {
      return 'mark';
    }
  }, {
    key: 'kind',
    get: function get$$1() {
      slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
      return this.object;
    }
  }], [{
    key: 'create',

    /**
     * Create a new `Mark` with `attrs`.
     *
     * @param {Object|Mark} attrs
     * @return {Mark}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Mark.isMark(attrs)) {
        return attrs;
      }

      if (typeof attrs == 'string') {
        attrs = { type: attrs };
      }

      if (is_plain_object__WEBPACK_IMPORTED_MODULE_0___default()(attrs)) {
        return Mark.fromJSON(attrs);
      }

      throw new Error('`Mark.create` only accepts objects, strings or marks, but you passed it: ' + attrs);
    }

    /**
     * Create a set of marks.
     *
     * @param {Array<Object|Mark>} elements
     * @return {Set<Mark>}
     */

  }, {
    key: 'createSet',
    value: function createSet(elements) {
      if (immutable__WEBPACK_IMPORTED_MODULE_1__["Set"].isSet(elements) || Array.isArray(elements)) {
        var marks = new immutable__WEBPACK_IMPORTED_MODULE_1__["Set"](elements.map(Mark.create));
        return marks;
      }

      if (elements == null) {
        return new immutable__WEBPACK_IMPORTED_MODULE_1__["Set"]();
      }

      throw new Error('`Mark.createSet` only accepts sets, arrays or null, but you passed it: ' + elements);
    }

    /**
     * Create a dictionary of settable mark properties from `attrs`.
     *
     * @param {Object|String|Mark} attrs
     * @return {Object}
     */

  }, {
    key: 'createProperties',
    value: function createProperties() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Mark.isMark(attrs)) {
        return {
          data: attrs.data,
          type: attrs.type
        };
      }

      if (typeof attrs == 'string') {
        return { type: attrs };
      }

      if (is_plain_object__WEBPACK_IMPORTED_MODULE_0___default()(attrs)) {
        var props = {};
        if ('type' in attrs) props.type = attrs.type;
        if ('data' in attrs) props.data = Data.create(attrs.data);
        return props;
      }

      throw new Error('`Mark.createProperties` only accepts objects, strings or marks, but you passed it: ' + attrs);
    }

    /**
     * Create a `Mark` from a JSON `object`.
     *
     * @param {Object} object
     * @return {Mark}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      var _object$data = object.data,
          data = _object$data === undefined ? {} : _object$data,
          type = object.type;


      if (typeof type != 'string') {
        throw new Error('`Mark.fromJS` requires a `type` string.');
      }

      var mark = new Mark({
        type: type,
        data: new immutable__WEBPACK_IMPORTED_MODULE_1__["Map"](data)
      });

      return mark;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isMark',


    /**
     * Check if `any` is a `Mark`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isMark(any) {
      return !!(any && any[MODEL_TYPES.MARK]);
    }

    /**
     * Check if `any` is a set of marks.
     *
     * @param {Any} any
     * @return {Boolean}
     */

  }, {
    key: 'isMarkSet',
    value: function isMarkSet(any) {
      return immutable__WEBPACK_IMPORTED_MODULE_1__["Set"].isSet(any) && any.every(function (item) {
        return Mark.isMark(item);
      });
    }
  }]);
  return Mark;
}(Object(immutable__WEBPACK_IMPORTED_MODULE_1__["Record"])(DEFAULTS));

/**
 * Attach a pseudo-symbol for type checking.
 */

Mark.fromJS = Mark.fromJSON;
Mark.prototype[MODEL_TYPES.MARK] = true;

/**
 * Memoize read methods.
 */

memoize(Mark.prototype, ['getComponent']);

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS$1 = {
  anchorKey: null,
  anchorOffset: 0,
  focusKey: null,
  focusOffset: 0,
  isBackward: null,
  isFocused: false,
  marks: null

  /**
   * Range.
   *
   * @type {Range}
   */

};
var Range = function (_Record) {
  inherits(Range, _Record);

  function Range() {
    classCallCheck(this, Range);
    return possibleConstructorReturn(this, (Range.__proto__ || Object.getPrototypeOf(Range)).apply(this, arguments));
  }

  createClass(Range, [{
    key: 'hasAnchorAtStartOf',


    /**
     * Check whether anchor point of the range is at the start of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

    value: function hasAnchorAtStartOf(node) {
      // PERF: Do a check for a `0` offset first since it's quickest.
      if (this.anchorOffset != 0) return false;
      var first = getFirst(node);
      return this.anchorKey == first.key;
    }

    /**
     * Check whether anchor point of the range is at the end of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasAnchorAtEndOf',
    value: function hasAnchorAtEndOf(node) {
      var last = getLast(node);
      return this.anchorKey == last.key && this.anchorOffset == last.text.length;
    }

    /**
     * Check whether the anchor edge of a range is in a `node` and at an
     * offset between `start` and `end`.
     *
     * @param {Node} node
     * @param {Number} start
     * @param {Number} end
     * @return {Boolean}
     */

  }, {
    key: 'hasAnchorBetween',
    value: function hasAnchorBetween(node, start, end) {
      return this.anchorOffset <= end && start <= this.anchorOffset && this.hasAnchorIn(node);
    }

    /**
     * Check whether the anchor edge of a range is in a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasAnchorIn',
    value: function hasAnchorIn(node) {
      return node.object == 'text' ? node.key == this.anchorKey : this.anchorKey != null && node.hasDescendant(this.anchorKey);
    }

    /**
     * Check whether focus point of the range is at the end of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasFocusAtEndOf',
    value: function hasFocusAtEndOf(node) {
      var last = getLast(node);
      return this.focusKey == last.key && this.focusOffset == last.text.length;
    }

    /**
     * Check whether focus point of the range is at the start of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasFocusAtStartOf',
    value: function hasFocusAtStartOf(node) {
      if (this.focusOffset != 0) return false;
      var first = getFirst(node);
      return this.focusKey == first.key;
    }

    /**
     * Check whether the focus edge of a range is in a `node` and at an
     * offset between `start` and `end`.
     *
     * @param {Node} node
     * @param {Number} start
     * @param {Number} end
     * @return {Boolean}
     */

  }, {
    key: 'hasFocusBetween',
    value: function hasFocusBetween(node, start, end) {
      return start <= this.focusOffset && this.focusOffset <= end && this.hasFocusIn(node);
    }

    /**
     * Check whether the focus edge of a range is in a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasFocusIn',
    value: function hasFocusIn(node) {
      return node.object == 'text' ? node.key == this.focusKey : this.focusKey != null && node.hasDescendant(this.focusKey);
    }

    /**
     * Check whether the range is at the start of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'isAtStartOf',
    value: function isAtStartOf(node) {
      return this.isCollapsed && this.hasAnchorAtStartOf(node);
    }

    /**
     * Check whether the range is at the end of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'isAtEndOf',
    value: function isAtEndOf(node) {
      return this.isCollapsed && this.hasAnchorAtEndOf(node);
    }

    /**
     * Focus the range.
     *
     * @return {Range}
     */

  }, {
    key: 'focus',
    value: function focus() {
      return this.merge({
        isFocused: true
      });
    }

    /**
     * Blur the range.
     *
     * @return {Range}
     */

  }, {
    key: 'blur',
    value: function blur() {
      return this.merge({
        isFocused: false
      });
    }

    /**
     * Unset the range.
     *
     * @return {Range}
     */

  }, {
    key: 'deselect',
    value: function deselect() {
      return this.merge({
        anchorKey: null,
        anchorOffset: 0,
        focusKey: null,
        focusOffset: 0,
        isFocused: false,
        isBackward: false
      });
    }

    /**
     * Flip the range.
     *
     * @return {Range}
     */

  }, {
    key: 'flip',
    value: function flip() {
      return this.merge({
        anchorKey: this.focusKey,
        anchorOffset: this.focusOffset,
        focusKey: this.anchorKey,
        focusOffset: this.anchorOffset,
        isBackward: this.isBackward == null ? null : !this.isBackward
      });
    }

    /**
     * Move the anchor offset `n` characters.
     *
     * @param {Number} n (optional)
     * @return {Range}
     */

  }, {
    key: 'moveAnchor',
    value: function moveAnchor() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var anchorKey = this.anchorKey,
          focusKey = this.focusKey,
          focusOffset = this.focusOffset,
          isBackward = this.isBackward;

      var anchorOffset = this.anchorOffset + n;
      return this.merge({
        anchorOffset: anchorOffset,
        isBackward: anchorKey == focusKey ? anchorOffset > focusOffset : isBackward
      });
    }

    /**
     * Move the anchor offset `n` characters.
     *
     * @param {Number} n (optional)
     * @return {Range}
     */

  }, {
    key: 'moveFocus',
    value: function moveFocus() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var anchorKey = this.anchorKey,
          anchorOffset = this.anchorOffset,
          focusKey = this.focusKey,
          isBackward = this.isBackward;

      var focusOffset = this.focusOffset + n;
      return this.merge({
        focusOffset: focusOffset,
        isBackward: focusKey == anchorKey ? anchorOffset > focusOffset : isBackward
      });
    }

    /**
     * Move the range's anchor point to a `key` and `offset`.
     *
     * @param {String} key
     * @param {Number} offset
     * @return {Range}
     */

  }, {
    key: 'moveAnchorTo',
    value: function moveAnchorTo(key, offset) {
      var anchorKey = this.anchorKey,
          focusKey = this.focusKey,
          focusOffset = this.focusOffset,
          isBackward = this.isBackward;

      return this.merge({
        anchorKey: key,
        anchorOffset: offset,
        isBackward: key == focusKey ? offset > focusOffset : key == anchorKey ? isBackward : null
      });
    }

    /**
     * Move the range's focus point to a `key` and `offset`.
     *
     * @param {String} key
     * @param {Number} offset
     * @return {Range}
     */

  }, {
    key: 'moveFocusTo',
    value: function moveFocusTo(key, offset) {
      var focusKey = this.focusKey,
          anchorKey = this.anchorKey,
          anchorOffset = this.anchorOffset,
          isBackward = this.isBackward;

      return this.merge({
        focusKey: key,
        focusOffset: offset,
        isBackward: key == anchorKey ? anchorOffset > offset : key == focusKey ? isBackward : null
      });
    }

    /**
     * Move the range to `anchorOffset`.
     *
     * @param {Number} anchorOffset
     * @return {Range}
     */

  }, {
    key: 'moveAnchorOffsetTo',
    value: function moveAnchorOffsetTo(anchorOffset) {
      return this.merge({
        anchorOffset: anchorOffset,
        isBackward: this.anchorKey == this.focusKey ? anchorOffset > this.focusOffset : this.isBackward
      });
    }

    /**
     * Move the range to `focusOffset`.
     *
     * @param {Number} focusOffset
     * @return {Range}
     */

  }, {
    key: 'moveFocusOffsetTo',
    value: function moveFocusOffsetTo(focusOffset) {
      return this.merge({
        focusOffset: focusOffset,
        isBackward: this.anchorKey == this.focusKey ? this.anchorOffset > focusOffset : this.isBackward
      });
    }

    /**
     * Move the range to `anchorOffset` and `focusOffset`.
     *
     * @param {Number} anchorOffset
     * @param {Number} focusOffset (optional)
     * @return {Range}
     */

  }, {
    key: 'moveOffsetsTo',
    value: function moveOffsetsTo(anchorOffset) {
      var focusOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : anchorOffset;

      return this.moveAnchorOffsetTo(anchorOffset).moveFocusOffsetTo(focusOffset);
    }

    /**
     * Move the focus point to the anchor point.
     *
     * @return {Range}
     */

  }, {
    key: 'moveToAnchor',
    value: function moveToAnchor() {
      return this.moveFocusTo(this.anchorKey, this.anchorOffset);
    }

    /**
     * Move the anchor point to the focus point.
     *
     * @return {Range}
     */

  }, {
    key: 'moveToFocus',
    value: function moveToFocus() {
      return this.moveAnchorTo(this.focusKey, this.focusOffset);
    }

    /**
     * Move the range's anchor point to the start of a `node`.
     *
     * @param {Node} node
     * @return {Range}
     */

  }, {
    key: 'moveAnchorToStartOf',
    value: function moveAnchorToStartOf(node) {
      node = getFirst(node);
      return this.moveAnchorTo(node.key, 0);
    }

    /**
     * Move the range's anchor point to the end of a `node`.
     *
     * @param {Node} node
     * @return {Range}
     */

  }, {
    key: 'moveAnchorToEndOf',
    value: function moveAnchorToEndOf(node) {
      node = getLast(node);
      return this.moveAnchorTo(node.key, node.text.length);
    }

    /**
     * Move the range's focus point to the start of a `node`.
     *
     * @param {Node} node
     * @return {Range}
     */

  }, {
    key: 'moveFocusToStartOf',
    value: function moveFocusToStartOf(node) {
      node = getFirst(node);
      return this.moveFocusTo(node.key, 0);
    }

    /**
     * Move the range's focus point to the end of a `node`.
     *
     * @param {Node} node
     * @return {Range}
     */

  }, {
    key: 'moveFocusToEndOf',
    value: function moveFocusToEndOf(node) {
      node = getLast(node);
      return this.moveFocusTo(node.key, node.text.length);
    }

    /**
     * Move to the entire range of `start` and `end` nodes.
     *
     * @param {Node} start
     * @param {Node} end (optional)
     * @return {Range}
     */

  }, {
    key: 'moveToRangeOf',
    value: function moveToRangeOf(start) {
      var end = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : start;

      var range = this.isBackward ? this.flip() : this;
      return range.moveAnchorToStartOf(start).moveFocusToEndOf(end);
    }

    /**
     * Normalize the range, relative to a `node`, ensuring that the anchor
     * and focus nodes of the range always refer to leaf text nodes.
     *
     * @param {Node} node
     * @return {Range}
     */

  }, {
    key: 'normalize',
    value: function normalize(node) {
      var range = this;
      var anchorKey = range.anchorKey,
          anchorOffset = range.anchorOffset,
          focusKey = range.focusKey,
          focusOffset = range.focusOffset,
          isBackward = range.isBackward;


      var anchorOffsetType = typeof anchorOffset === 'undefined' ? 'undefined' : _typeof(anchorOffset);
      var focusOffsetType = typeof focusOffset === 'undefined' ? 'undefined' : _typeof(focusOffset);
      if (anchorOffsetType != 'number' || focusOffsetType != 'number') {
        slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].warn('The range offsets should be numbers, but they were of type "' + anchorOffsetType + '" and "' + focusOffsetType + '".');
      }

      // If the range is unset, make sure it is properly zeroed out.
      if (anchorKey == null || focusKey == null) {
        return range.merge({
          anchorKey: null,
          anchorOffset: 0,
          focusKey: null,
          focusOffset: 0,
          isBackward: false
        });
      }

      // Get the anchor and focus nodes.
      var anchorNode = node.getDescendant(anchorKey);
      var focusNode = node.getDescendant(focusKey);

      // If the range is malformed, warn and zero it out.
      if (!anchorNode || !focusNode) {
        slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].warn('The range was invalid and was reset. The range in question was:', range);
        var first = node.getFirstText();
        return range.merge({
          anchorKey: first ? first.key : null,
          anchorOffset: 0,
          focusKey: first ? first.key : null,
          focusOffset: 0,
          isBackward: false
        });
      }

      // If the anchor node isn't a text node, match it to one.
      if (anchorNode.object != 'text') {
        slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].warn('The range anchor was set to a Node that is not a Text node. This should not happen and can degrade performance. The node in question was:', anchorNode);
        var anchorText = anchorNode.getTextAtOffset(anchorOffset);
        var offset = anchorNode.getOffset(anchorText.key);
        anchorOffset = anchorOffset - offset;
        anchorNode = anchorText;
      }

      // If the focus node isn't a text node, match it to one.
      if (focusNode.object != 'text') {
        slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].warn('The range focus was set to a Node that is not a Text node. This should not happen and can degrade performance. The node in question was:', focusNode);
        var focusText = focusNode.getTextAtOffset(focusOffset);
        var _offset = focusNode.getOffset(focusText.key);
        focusOffset = focusOffset - _offset;
        focusNode = focusText;
      }

      // If `isBackward` is not set, derive it.
      if (isBackward == null) {
        if (anchorNode.key === focusNode.key) {
          isBackward = anchorOffset > focusOffset;
        } else {
          isBackward = !node.areDescendantsSorted(anchorNode.key, focusNode.key);
        }
      }

      // Merge in any updated properties.
      return range.merge({
        anchorKey: anchorNode.key,
        anchorOffset: anchorOffset,
        focusKey: focusNode.key,
        focusOffset: focusOffset,
        isBackward: isBackward
      });
    }

    /**
     * Return a JSON representation of the range.
     *
     * @return {Object}
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
      var object = {
        object: this.object,
        anchorKey: this.anchorKey,
        anchorOffset: this.anchorOffset,
        focusKey: this.focusKey,
        focusOffset: this.focusOffset,
        isBackward: this.isBackward,
        isFocused: this.isFocused,
        marks: this.marks == null ? null : this.marks.toArray().map(function (m) {
          return m.toJSON();
        })
      };

      return object;
    }

    /**
     * Alias `toJS`.
     */

  }, {
    key: 'toJS',
    value: function toJS() {
      return this.toJSON();
    }
  }, {
    key: 'object',


    /**
     * Object.
     *
     * @return {String}
     */

    get: function get$$1() {
      return 'range';
    }
  }, {
    key: 'kind',
    get: function get$$1() {
      slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
      return this.object;
    }

    /**
     * Check whether the range is blurred.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isBlurred',
    get: function get$$1() {
      return !this.isFocused;
    }

    /**
     * Check whether the range is collapsed.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isCollapsed',
    get: function get$$1() {
      return this.anchorKey == this.focusKey && this.anchorOffset == this.focusOffset;
    }

    /**
     * Check whether the range is expanded.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isExpanded',
    get: function get$$1() {
      return !this.isCollapsed;
    }

    /**
     * Check whether the range is forward.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isForward',
    get: function get$$1() {
      return this.isBackward == null ? null : !this.isBackward;
    }

    /**
     * Check whether the range's keys are set.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isSet',
    get: function get$$1() {
      return this.anchorKey != null && this.focusKey != null;
    }

    /**
     * Check whether the range's keys are not set.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isUnset',
    get: function get$$1() {
      return !this.isSet;
    }

    /**
     * Get the start key.
     *
     * @return {String}
     */

  }, {
    key: 'startKey',
    get: function get$$1() {
      return this.isBackward ? this.focusKey : this.anchorKey;
    }

    /**
     * Get the start offset.
     *
     * @return {String}
     */

  }, {
    key: 'startOffset',
    get: function get$$1() {
      return this.isBackward ? this.focusOffset : this.anchorOffset;
    }

    /**
     * Get the end key.
     *
     * @return {String}
     */

  }, {
    key: 'endKey',
    get: function get$$1() {
      return this.isBackward ? this.anchorKey : this.focusKey;
    }

    /**
     * Get the end offset.
     *
     * @return {String}
     */

  }, {
    key: 'endOffset',
    get: function get$$1() {
      return this.isBackward ? this.anchorOffset : this.focusOffset;
    }
  }], [{
    key: 'create',

    /**
     * Create a new `Range` with `attrs`.
     *
     * @param {Object|Range} attrs
     * @return {Range}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Range.isRange(attrs)) {
        return attrs;
      }

      if (is_plain_object__WEBPACK_IMPORTED_MODULE_0___default()(attrs)) {
        return Range.fromJSON(attrs);
      }

      throw new Error('`Range.create` only accepts objects or ranges, but you passed it: ' + attrs);
    }

    /**
     * Create a list of `Ranges` from `elements`.
     *
     * @param {Array<Range|Object>|List<Range|Object>} elements
     * @return {List<Range>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (immutable__WEBPACK_IMPORTED_MODULE_1__["List"].isList(elements) || Array.isArray(elements)) {
        var list = new immutable__WEBPACK_IMPORTED_MODULE_1__["List"](elements.map(Range.create));
        return list;
      }

      throw new Error('`Range.createList` only accepts arrays or lists, but you passed it: ' + elements);
    }

    /**
     * Create a dictionary of settable range properties from `attrs`.
     *
     * @param {Object|String|Range} attrs
     * @return {Object}
     */

  }, {
    key: 'createProperties',
    value: function createProperties() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Range.isRange(attrs)) {
        return {
          anchorKey: attrs.anchorKey,
          anchorOffset: attrs.anchorOffset,
          focusKey: attrs.focusKey,
          focusOffset: attrs.focusOffset,
          isBackward: attrs.isBackward,
          isFocused: attrs.isFocused,
          marks: attrs.marks
        };
      }

      if (is_plain_object__WEBPACK_IMPORTED_MODULE_0___default()(attrs)) {
        var props = {};
        if ('anchorKey' in attrs) props.anchorKey = attrs.anchorKey;
        if ('anchorOffset' in attrs) props.anchorOffset = attrs.anchorOffset;
        if ('anchorPath' in attrs) props.anchorPath = attrs.anchorPath;
        if ('focusKey' in attrs) props.focusKey = attrs.focusKey;
        if ('focusOffset' in attrs) props.focusOffset = attrs.focusOffset;
        if ('focusPath' in attrs) props.focusPath = attrs.focusPath;
        if ('isBackward' in attrs) props.isBackward = attrs.isBackward;
        if ('isFocused' in attrs) props.isFocused = attrs.isFocused;
        if ('marks' in attrs) props.marks = attrs.marks == null ? null : Mark.createSet(attrs.marks);
        return props;
      }

      throw new Error('`Range.createProperties` only accepts objects or ranges, but you passed it: ' + attrs);
    }

    /**
     * Create a `Range` from a JSON `object`.
     *
     * @param {Object} object
     * @return {Range}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      var _object$anchorKey = object.anchorKey,
          anchorKey = _object$anchorKey === undefined ? null : _object$anchorKey,
          _object$anchorOffset = object.anchorOffset,
          anchorOffset = _object$anchorOffset === undefined ? 0 : _object$anchorOffset,
          _object$focusKey = object.focusKey,
          focusKey = _object$focusKey === undefined ? null : _object$focusKey,
          _object$focusOffset = object.focusOffset,
          focusOffset = _object$focusOffset === undefined ? 0 : _object$focusOffset,
          _object$isBackward = object.isBackward,
          isBackward = _object$isBackward === undefined ? null : _object$isBackward,
          _object$isFocused = object.isFocused,
          isFocused = _object$isFocused === undefined ? false : _object$isFocused,
          _object$marks = object.marks,
          marks = _object$marks === undefined ? null : _object$marks;


      var range = new Range({
        anchorKey: anchorKey,
        anchorOffset: anchorOffset,
        focusKey: focusKey,
        focusOffset: focusOffset,
        isBackward: isBackward,
        isFocused: isFocused,
        marks: marks == null ? null : new immutable__WEBPACK_IMPORTED_MODULE_1__["Set"](marks.map(Mark.fromJSON))
      });

      return range;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isRange',


    /**
     * Check if an `obj` is a `Range`.
     *
     * @param {Any} obj
     * @return {Boolean}
     */

    value: function isRange(obj) {
      return !!(obj && obj[MODEL_TYPES.RANGE]);
    }
  }]);
  return Range;
}(Object(immutable__WEBPACK_IMPORTED_MODULE_1__["Record"])(DEFAULTS$1));

/**
 * Attach a pseudo-symbol for type checking.
 */

Range.fromJS = Range.fromJSON;
Range.prototype[MODEL_TYPES.RANGE] = true;

/**
 * Mix in some "move" convenience methods.
 */

var MOVE_METHODS = [['move', ''], ['move', 'To'], ['move', 'ToStartOf'], ['move', 'ToEndOf']];

MOVE_METHODS.forEach(function (_ref) {
  var _ref2 = slicedToArray(_ref, 2),
      p = _ref2[0],
      s = _ref2[1];

  Range.prototype['' + p + s] = function () {
    var _ref3;

    return (_ref3 = this[p + 'Anchor' + s].apply(this, arguments))[p + 'Focus' + s].apply(_ref3, arguments);
  };
});

/**
 * Mix in the "start", "end" and "edge" convenience methods.
 */

var EDGE_METHODS = [['has', 'AtStartOf', true], ['has', 'AtEndOf', true], ['has', 'Between', true], ['has', 'In', true], ['collapseTo', ''], ['move', ''], ['moveTo', ''], ['move', 'To'], ['move', 'OffsetTo']];

EDGE_METHODS.forEach(function (_ref4) {
  var _ref5 = slicedToArray(_ref4, 3),
      p = _ref5[0],
      s = _ref5[1],
      hasEdge = _ref5[2];

  var anchor = p + 'Anchor' + s;
  var focus = p + 'Focus' + s;

  Range.prototype[p + 'Start' + s] = function () {
    return this.isBackward ? this[focus].apply(this, arguments) : this[anchor].apply(this, arguments);
  };

  Range.prototype[p + 'End' + s] = function () {
    return this.isBackward ? this[anchor].apply(this, arguments) : this[focus].apply(this, arguments);
  };

  if (hasEdge) {
    Range.prototype[p + 'Edge' + s] = function () {
      return this[anchor].apply(this, arguments) || this[focus].apply(this, arguments);
    };
  }
});

/**
 * Mix in some aliases for convenience / parallelism with the browser APIs.
 */

var ALIAS_METHODS = [['collapseTo', 'moveTo'], ['collapseToAnchor', 'moveToAnchor'], ['collapseToFocus', 'moveToFocus'], ['collapseToStart', 'moveToStart'], ['collapseToEnd', 'moveToEnd'], ['collapseToStartOf', 'moveToStartOf'], ['collapseToEndOf', 'moveToEndOf'], ['extend', 'moveFocus'], ['extendTo', 'moveFocusTo'], ['extendToStartOf', 'moveFocusToStartOf'], ['extendToEndOf', 'moveFocusToEndOf']];

ALIAS_METHODS.forEach(function (_ref6) {
  var _ref7 = slicedToArray(_ref6, 2),
      alias = _ref7[0],
      method = _ref7[1];

  Range.prototype[alias] = function () {
    return this[method].apply(this, arguments);
  };
});

/**
 * Get the first text of a `node`.
 *
 * @param {Node} node
 * @return {Text}
 */

function getFirst(node) {
  return node.object == 'text' ? node : node.getFirstText();
}

/**
 * Get the last text of a `node`.
 *
 * @param {Node} node
 * @return {Text}
 */

function getLast(node) {
  return node.object == 'text' ? node : node.getLastText();
}

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS$2 = {
  marks: new immutable__WEBPACK_IMPORTED_MODULE_1__["Set"](),
  text: ''

  /**
   * Character.
   *
   * @type {Character}
   */

};
var Character = function (_Record) {
  inherits(Character, _Record);

  function Character() {
    classCallCheck(this, Character);
    return possibleConstructorReturn(this, (Character.__proto__ || Object.getPrototypeOf(Character)).apply(this, arguments));
  }

  createClass(Character, [{
    key: 'toJSON',


    /**
     * Return a JSON representation of the character.
     *
     * @return {Object}
     */

    value: function toJSON() {
      var object = {
        object: this.object,
        text: this.text,
        marks: this.marks.toArray().map(function (m) {
          return m.toJSON();
        })
      };

      return object;
    }

    /**
     * Alias `toJS`.
     */

  }, {
    key: 'toJS',
    value: function toJS() {
      return this.toJSON();
    }
  }, {
    key: 'object',


    /**
     * Object.
     *
     * @return {String}
     */

    get: function get$$1() {
      return 'character';
    }
  }, {
    key: 'kind',
    get: function get$$1() {
      slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
      return this.object;
    }
  }], [{
    key: 'create',

    /**
     * Create a `Character` with `attrs`.
     *
     * @param {Object|String|Character} attrs
     * @return {Character}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Character.isCharacter(attrs)) {
        return attrs;
      }

      if (typeof attrs == 'string') {
        attrs = { text: attrs };
      }

      if (is_plain_object__WEBPACK_IMPORTED_MODULE_0___default()(attrs)) {
        return Character.fromJSON(attrs);
      }

      throw new Error('`Character.create` only accepts objects, strings or characters, but you passed it: ' + attrs);
    }

    /**
     * Create a list of `Characters` from `elements`.
     *
     * @param {String|Array<Object|Character|String>|List<Object|Character|String>} elements
     * @return {List<Character>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (typeof elements == 'string') {
        elements = elements.split('');
      }

      if (immutable__WEBPACK_IMPORTED_MODULE_1__["List"].isList(elements) || Array.isArray(elements)) {
        var list = new immutable__WEBPACK_IMPORTED_MODULE_1__["List"](elements.map(Character.create));
        return list;
      }

      throw new Error('`Block.createList` only accepts strings, arrays or lists, but you passed it: ' + elements);
    }

    /**
     * Create a `Character` from a JSON `object`.
     *
     * @param {Object} object
     * @return {Character}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      var text = object.text,
          _object$marks = object.marks,
          marks = _object$marks === undefined ? [] : _object$marks;


      if (typeof text != 'string') {
        throw new Error('`Character.fromJSON` requires a block `text` string.');
      }

      var character = new Character({
        text: text,
        marks: new immutable__WEBPACK_IMPORTED_MODULE_1__["Set"](marks)
      });

      return character;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isCharacter',


    /**
     * Check if `any` is a `Character`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isCharacter(any) {
      return !!(any && any[MODEL_TYPES.CHARACTER]);
    }

    /**
     * Check if `any` is a character list.
     *
     * @param {Any} any
     * @return {Boolean}
     */

  }, {
    key: 'isCharacterList',
    value: function isCharacterList(any) {
      return immutable__WEBPACK_IMPORTED_MODULE_1__["List"].isList(any) && any.every(function (item) {
        return Character.isCharacter(item);
      });
    }
  }]);
  return Character;
}(Object(immutable__WEBPACK_IMPORTED_MODULE_1__["Record"])(DEFAULTS$2));

/**
 * Attach a pseudo-symbol for type checking.
 */

Character.fromJS = Character.fromJSON;
Character.prototype[MODEL_TYPES.CHARACTER] = true;

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS$3 = {
  marks: new immutable__WEBPACK_IMPORTED_MODULE_1__["Set"](),
  text: ''

  /**
   * Leaf.
   *
   * @type {Leaf}
   */

};
var Leaf = function (_Record) {
  inherits(Leaf, _Record);

  function Leaf() {
    classCallCheck(this, Leaf);
    return possibleConstructorReturn(this, (Leaf.__proto__ || Object.getPrototypeOf(Leaf)).apply(this, arguments));
  }

  createClass(Leaf, [{
    key: 'getCharacters',


    /**
     * Return leaf as a list of characters
     *
     * @return {List<Character>}
     */

    value: function getCharacters() {
      var marks = this.marks;

      var characters = Character.createList(this.text.split('').map(function (char) {
        return Character.create({
          text: char,
          marks: marks
        });
      }));

      return characters;
    }

    /**
     * Return a JSON representation of the leaf.
     *
     * @return {Object}
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
      var object = {
        object: this.object,
        text: this.text,
        marks: this.marks.toArray().map(function (m) {
          return m.toJSON();
        })
      };

      return object;
    }

    /**
     * Alias `toJS`.
     */

  }, {
    key: 'toJS',
    value: function toJS() {
      return this.toJSON();
    }
  }, {
    key: 'object',


    /**
     * Object.
     *
     * @return {String}
     */

    get: function get$$1() {
      return 'leaf';
    }
  }, {
    key: 'kind',
    get: function get$$1() {
      slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
      return this.object;
    }
  }], [{
    key: 'create',

    /**
     * Create a new `Leaf` with `attrs`.
     *
     * @param {Object|Leaf} attrs
     * @return {Leaf}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Leaf.isLeaf(attrs)) {
        return attrs;
      }

      if (typeof attrs == 'string') {
        attrs = { text: attrs };
      }

      if (is_plain_object__WEBPACK_IMPORTED_MODULE_0___default()(attrs)) {
        return Leaf.fromJSON(attrs);
      }

      throw new Error('`Leaf.create` only accepts objects, strings or leaves, but you passed it: ' + attrs);
    }

    /**
     * Create a `Leaf` list from `attrs`.
     *
     * @param {Array<Leaf|Object>|List<Leaf|Object>} attrs
     * @return {List<Leaf>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (immutable__WEBPACK_IMPORTED_MODULE_1__["List"].isList(attrs) || Array.isArray(attrs)) {
        var list = new immutable__WEBPACK_IMPORTED_MODULE_1__["List"](attrs.map(Leaf.create));
        return list;
      }

      throw new Error('`Leaf.createList` only accepts arrays or lists, but you passed it: ' + attrs);
    }

    /**
     * Create a `Leaf` from a JSON `object`.
     *
     * @param {Object} object
     * @return {Leaf}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      var _object$text = object.text,
          text = _object$text === undefined ? '' : _object$text,
          _object$marks = object.marks,
          marks = _object$marks === undefined ? [] : _object$marks;


      var leaf = new Leaf({
        text: text,
        marks: new immutable__WEBPACK_IMPORTED_MODULE_1__["Set"](marks.map(Mark.fromJSON))
      });

      return leaf;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isLeaf',


    /**
     * Check if `any` is a `Leaf`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isLeaf(any) {
      return !!(any && any[MODEL_TYPES.LEAF]);
    }

    /**
     * Check if `any` is a list of leaves.
     *
     * @param {Any} any
     * @return {Boolean}
     */

  }, {
    key: 'isLeafList',
    value: function isLeafList(any) {
      return immutable__WEBPACK_IMPORTED_MODULE_1__["List"].isList(any) && any.every(function (item) {
        return Leaf.isLeaf(item);
      });
    }
  }]);
  return Leaf;
}(Object(immutable__WEBPACK_IMPORTED_MODULE_1__["Record"])(DEFAULTS$3));

/**
 * Attach a pseudo-symbol for type checking.
 */

Leaf.fromJS = Leaf.fromJSON;
Leaf.prototype[MODEL_TYPES.LEAF] = true;

/**
 * An auto-incrementing index for generating keys.
 *
 * @type {Number}
 */

var n = void 0;

/**
 * The global key generating function.
 *
 * @type {Function}
 */

var generate = void 0;

/**
 * Generate a key.
 *
 * @return {String}
 */

function generateKey() {
  return generate();
}

/**
 * Set a different unique ID generating `function`.
 *
 * @param {Function} func
 */

function setKeyGenerator(func) {
  generate = func;
}

/**
 * Reset the key generating function to its initial state.
 */

function resetKeyGenerator() {
  n = 0;
  generate = function generate() {
    return "" + n++;
  };
}

/**
 * Set the initial state.
 */

resetKeyGenerator();

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS$4 = {
  characters: new immutable__WEBPACK_IMPORTED_MODULE_1__["List"](),
  key: undefined

  /**
   * Text.
   *
   * @type {Text}
   */

};
var Text = function (_Record) {
  inherits(Text, _Record);

  function Text() {
    classCallCheck(this, Text);
    return possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).apply(this, arguments));
  }

  createClass(Text, [{
    key: 'addMark',


    /**
     * Add a `mark` at `index` and `length`.
     *
     * @param {Number} index
     * @param {Number} length
     * @param {Mark} mark
     * @return {Text}
     */

    value: function addMark(index, length, mark) {
      var marks = new immutable__WEBPACK_IMPORTED_MODULE_1__["Set"]([mark]);
      return this.addMarks(index, length, marks);
    }

    /**
     * Add a `set` of marks at `index` and `length`.
     *
     * @param {Number} index
     * @param {Number} length
     * @param {Set<Mark>} set
     * @return {Text}
     */

  }, {
    key: 'addMarks',
    value: function addMarks(index, length, set$$1) {
      var characters = this.characters.map(function (char, i) {
        if (i < index) return char;
        if (i >= index + length) return char;
        var _char = char,
            marks = _char.marks;

        marks = marks.union(set$$1);
        char = char.set('marks', marks);
        return char;
      });

      return this.set('characters', characters);
    }

    /**
     * Derive a set of decorated characters with `decorations`.
     *
     * @param {List<Decoration>} decorations
     * @return {List<Character>}
     */

  }, {
    key: 'getDecoratedCharacters',
    value: function getDecoratedCharacters(decorations) {
      var node = this;
      var _node = node,
          key = _node.key,
          characters = _node.characters;

      // PERF: Exit early if there are no characters to be decorated.

      if (characters.size == 0) return characters;

      decorations.forEach(function (range) {
        var startKey = range.startKey,
            endKey = range.endKey,
            startOffset = range.startOffset,
            endOffset = range.endOffset,
            marks = range.marks;

        var hasStart = startKey == key;
        var hasEnd = endKey == key;
        var index = hasStart ? startOffset : 0;
        var length = hasEnd ? endOffset - index : characters.size;
        node = node.addMarks(index, length, marks);
      });

      return node.characters;
    }

    /**
     * Get the decorations for the node from a `schema`.
     *
     * @param {Schema} schema
     * @return {Array}
     */

  }, {
    key: 'getDecorations',
    value: function getDecorations(schema) {
      return schema.__getDecorations(this);
    }

    /**
     * Derive the leaves for a list of `characters`.
     *
     * @param {Array|Void} decorations (optional)
     * @return {List<Leaf>}
     */

  }, {
    key: 'getLeaves',
    value: function getLeaves() {
      var decorations = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      var characters = this.getDecoratedCharacters(decorations);
      var leaves = [];

      // PERF: cache previous values for faster lookup.
      var prevChar = void 0;
      var prevLeaf = void 0;

      // If there are no characters, return one empty range.
      if (characters.size == 0) {
        leaves.push({});
      } else {
        // Otherwise, loop the characters and build the leaves...
        characters.forEach(function (char, i) {
          var marks = char.marks,
              text = char.text;

          // The first one can always just be created.

          if (i == 0) {
            prevChar = char;
            prevLeaf = { text: text, marks: marks };
            leaves.push(prevLeaf);
            return;
          }

          // Otherwise, compare the current and previous marks.
          var prevMarks = prevChar.marks;
          var isSame = Object(immutable__WEBPACK_IMPORTED_MODULE_1__["is"])(marks, prevMarks);

          // If the marks are the same, add the text to the previous range.
          if (isSame) {
            prevChar = char;
            prevLeaf.text += text;
            return;
          }

          // Otherwise, create a new range.
          prevChar = char;
          prevLeaf = { text: text, marks: marks };
          leaves.push(prevLeaf);
        }, []);
      }

      // PERF: convert the leaves to immutable objects after iterating.
      leaves = new immutable__WEBPACK_IMPORTED_MODULE_1__["List"](leaves.map(function (object) {
        return new Leaf(object);
      }));

      // Return the leaves.
      return leaves;
    }

    /**
     * Get all of the active marks on between two offsets
     *
     * @return {Set<Mark>}
     */

  }, {
    key: 'getActiveMarksBetweenOffsets',
    value: function getActiveMarksBetweenOffsets(startOffset, endOffset) {
      var _this2 = this;

      if (startOffset === 0 && endOffset === this.characters.size) {
        return this.getActiveMarks();
      }
      var startCharacter = this.characters.get(startOffset);
      if (!startCharacter) return Object(immutable__WEBPACK_IMPORTED_MODULE_1__["Set"])();
      var result = startCharacter.marks;
      if (result.size === 0) return result;
      return result.withMutations(function (x) {
        for (var index = startOffset + 1; index < endOffset; index++) {
          var c = _this2.characters.get(index);
          x.intersect(c.marks);
          if (x.size === 0) return;
        }
      });
    }

    /**
     * Get all of the active marks on the text
     *
     * @return {Set<Mark>}
     */

  }, {
    key: 'getActiveMarks',
    value: function getActiveMarks() {
      var _this3 = this;

      if (this.characters.size === 0) return Object(immutable__WEBPACK_IMPORTED_MODULE_1__["Set"])();
      var result = this.characters.first().marks;
      if (result.size === 0) return result;

      return result.withMutations(function (x) {
        _this3.characters.forEach(function (c) {
          x.intersect(c.marks);
          if (x.size === 0) return false;
        });
      });
    }

    /**
     * Get all of the marks on between two offsets
     *
     * @return {OrderedSet<Mark>}
     */

  }, {
    key: 'getMarksBetweenOffsets',
    value: function getMarksBetweenOffsets(startOffset, endOffset) {
      var _this4 = this;

      if (startOffset === 0 && endOffset === this.characters.size) {
        return this.getMarks();
      }
      return new immutable__WEBPACK_IMPORTED_MODULE_1__["OrderedSet"]().withMutations(function (result) {
        for (var index = startOffset; index < endOffset; index++) {
          var c = _this4.characters.get(index);
          result.union(c.marks);
        }
      });
    }

    /**
     * Get all of the marks on the text.
     *
     * @return {OrderedSet<Mark>}
     */

  }, {
    key: 'getMarks',
    value: function getMarks() {
      var array = this.getMarksAsArray();
      return new immutable__WEBPACK_IMPORTED_MODULE_1__["OrderedSet"](array);
    }

    /**
     * Get all of the marks on the text as an array
     *
     * @return {Array}
     */

  }, {
    key: 'getMarksAsArray',
    value: function getMarksAsArray() {
      if (this.characters.size === 0) return [];
      var first = this.characters.first().marks;
      var previousMark = first;
      var result = [];
      this.characters.forEach(function (c) {
        // If the character marks is the same with the
        // previous characters, we do not need to
        // add the marks twice
        if (c.marks === previousMark) return true;
        previousMark = c.marks;
        result.push(previousMark.toArray());
      });
      return Array.prototype.concat.apply(first.toArray(), result);
    }

    /**
     * Get the marks on the text at `index`.
     *
     * @param {Number} index
     * @return {Set<Mark>}
     */

  }, {
    key: 'getMarksAtIndex',
    value: function getMarksAtIndex(index) {
      if (index == 0) return Mark.createSet();
      var characters = this.characters;

      var char = characters.get(index - 1);
      if (!char) return Mark.createSet();
      return char.marks;
    }

    /**
     * Get a node by `key`, to parallel other nodes.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getNode',
    value: function getNode(key) {
      return this.key == key ? this : null;
    }

    /**
     * Check if the node has a node by `key`, to parallel other nodes.
     *
     * @param {String} key
     * @return {Boolean}
     */

  }, {
    key: 'hasNode',
    value: function hasNode(key) {
      return !!this.getNode(key);
    }

    /**
     * Insert `text` at `index`.
     *
     * @param {Numbder} index
     * @param {String} text
     * @param {String} marks (optional)
     * @return {Text}
     */

  }, {
    key: 'insertText',
    value: function insertText(index, text, marks) {
      var characters = this.characters;

      var chars = Character.createList(text.split('').map(function (char) {
        return { text: char, marks: marks };
      }));

      characters = characters.slice(0, index).concat(chars).concat(characters.slice(index));

      return this.set('characters', characters);
    }

    /**
     * Regenerate the node's key.
     *
     * @return {Text}
     */

  }, {
    key: 'regenerateKey',
    value: function regenerateKey() {
      var key = generateKey();
      return this.set('key', key);
    }

    /**
     * Remove a `mark` at `index` and `length`.
     *
     * @param {Number} index
     * @param {Number} length
     * @param {Mark} mark
     * @return {Text}
     */

  }, {
    key: 'removeMark',
    value: function removeMark(index, length, mark) {
      var characters = this.characters.map(function (char, i) {
        if (i < index) return char;
        if (i >= index + length) return char;
        var _char2 = char,
            marks = _char2.marks;

        marks = marks.remove(mark);
        char = char.set('marks', marks);
        return char;
      });

      return this.set('characters', characters);
    }

    /**
     * Remove text from the text node at `index` for `length`.
     *
     * @param {Number} index
     * @param {Number} length
     * @return {Text}
     */

  }, {
    key: 'removeText',
    value: function removeText(index, length) {
      var characters = this.characters;

      var start = index;
      var end = index + length;
      characters = characters.filterNot(function (char, i) {
        return start <= i && i < end;
      });
      return this.set('characters', characters);
    }

    /**
     * Return a JSON representation of the text.
     *
     * @param {Object} options
     * @return {Object}
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var object = {
        object: this.object,
        leaves: this.getLeaves().toArray().map(function (r) {
          return r.toJSON();
        })
      };

      if (options.preserveKeys) {
        object.key = this.key;
      }

      return object;
    }

    /**
     * Alias `toJS`.
     */

  }, {
    key: 'toJS',
    value: function toJS(options) {
      return this.toJSON(options);
    }

    /**
     * Update a `mark` at `index` and `length` with `properties`.
     *
     * @param {Number} index
     * @param {Number} length
     * @param {Mark} mark
     * @param {Object} properties
     * @return {Text}
     */

  }, {
    key: 'updateMark',
    value: function updateMark(index, length, mark, properties) {
      var newMark = mark.merge(properties);

      var characters = this.characters.map(function (char, i) {
        if (i < index) return char;
        if (i >= index + length) return char;
        var _char3 = char,
            marks = _char3.marks;

        if (!marks.has(mark)) return char;
        marks = marks.remove(mark);
        marks = marks.add(newMark);
        char = char.set('marks', marks);
        return char;
      });

      return this.set('characters', characters);
    }

    /**
     * Validate the text node against a `schema`.
     *
     * @param {Schema} schema
     * @return {Object|Void}
     */

  }, {
    key: 'validate',
    value: function validate(schema) {
      return schema.validateNode(this);
    }

    /**
     * Get the first invalid descendant
     * PREF: Do not cache this method; because it can cause cycle reference
     *
     * @param {Schema} schema
     * @returns {Text|Null}
     */

  }, {
    key: 'getFirstInvalidDescendant',
    value: function getFirstInvalidDescendant(schema) {
      return this.validate(schema) ? this : null;
    }
  }, {
    key: 'object',


    /**
     * Object.
     *
     * @return {String}
     */

    get: function get$$1() {
      return 'text';
    }
  }, {
    key: 'kind',
    get: function get$$1() {
      slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
      return this.object;
    }

    /**
     * Is the node empty?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isEmpty',
    get: function get$$1() {
      return this.text == '';
    }

    /**
     * Get the concatenated text of the node.
     *
     * @return {String}
     */

  }, {
    key: 'text',
    get: function get$$1() {
      return this.characters.reduce(function (string, char) {
        return string + char.text;
      }, '');
    }
  }], [{
    key: 'create',

    /**
     * Create a new `Text` with `attrs`.
     *
     * @param {Object|Array|List|String|Text} attrs
     * @return {Text}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      if (Text.isText(attrs)) {
        return attrs;
      }

      if (typeof attrs == 'string') {
        attrs = { leaves: [{ text: attrs }] };
      }

      if (is_plain_object__WEBPACK_IMPORTED_MODULE_0___default()(attrs)) {
        if (attrs.text) {
          var _attrs = attrs,
              text = _attrs.text,
              marks = _attrs.marks,
              key = _attrs.key;

          attrs = { key: key, leaves: [{ text: text, marks: marks }] };
        }

        return Text.fromJSON(attrs);
      }

      throw new Error('`Text.create` only accepts objects, arrays, strings or texts, but you passed it: ' + attrs);
    }

    /**
     * Create a list of `Texts` from `elements`.
     *
     * @param {Array<Text|Object>|List<Text|Object>} elements
     * @return {List<Text>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (immutable__WEBPACK_IMPORTED_MODULE_1__["List"].isList(elements) || Array.isArray(elements)) {
        var list = new immutable__WEBPACK_IMPORTED_MODULE_1__["List"](elements.map(Text.create));
        return list;
      }

      throw new Error('`Text.createList` only accepts arrays or lists, but you passed it: ' + elements);
    }

    /**
     * Create a `Text` from a JSON `object`.
     *
     * @param {Object|Text} object
     * @return {Text}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      if (Text.isText(object)) {
        return object;
      }

      var _object$leaves = object.leaves,
          leaves = _object$leaves === undefined ? [] : _object$leaves,
          _object$key = object.key,
          key = _object$key === undefined ? generateKey() : _object$key;


      var characters = leaves.map(Leaf.fromJSON).reduce(function (l, r) {
        return l.concat(r.getCharacters());
      }, new immutable__WEBPACK_IMPORTED_MODULE_1__["List"]());

      var node = new Text({
        characters: characters,
        key: key
      });

      return node;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isText',


    /**
     * Check if `any` is a `Text`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isText(any) {
      return !!(any && any[MODEL_TYPES.TEXT]);
    }

    /**
     * Check if `any` is a list of texts.
     *
     * @param {Any} any
     * @return {Boolean}
     */

  }, {
    key: 'isTextList',
    value: function isTextList(any) {
      return immutable__WEBPACK_IMPORTED_MODULE_1__["List"].isList(any) && any.every(function (item) {
        return Text.isText(item);
      });
    }
  }]);
  return Text;
}(Object(immutable__WEBPACK_IMPORTED_MODULE_1__["Record"])(DEFAULTS$4));

/**
 * Attach a pseudo-symbol for type checking.
 */

Text.fromJS = Text.fromJSON;
Text.prototype[MODEL_TYPES.TEXT] = true;

/**
 * Memoize read methods.
 */

memoize(Text.prototype, ['getDecoratedCharacters', 'getDecorations', 'getLeaves', 'getActiveMarks', 'getMarks', 'getMarksAsArray', 'getMarksAtIndex', 'validate']);

/**
 * Node.
 *
 * And interface that `Document`, `Block` and `Inline` all implement, to make
 * working with the recursive node tree easier.
 *
 * @type {Node}
 */

var Node = function () {
  function Node() {
    classCallCheck(this, Node);
  }

  createClass(Node, [{
    key: 'areDescendantsSorted',


    /**
     * True if the node has both descendants in that order, false otherwise. The
     * order is depth-first, post-order.
     *
     * @param {String} first
     * @param {String} second
     * @return {Boolean}
     */

    value: function areDescendantsSorted(first, second) {
      first = assertKey(first);
      second = assertKey(second);

      var keys = this.getKeysAsArray();
      var firstIndex = keys.indexOf(first);
      var secondIndex = keys.indexOf(second);
      if (firstIndex == -1 || secondIndex == -1) return null;

      return firstIndex < secondIndex;
    }

    /**
     * Assert that a node has a child by `key` and return it.
     *
     * @param {String} key
     * @return {Node}
     */

  }, {
    key: 'assertChild',
    value: function assertChild(key) {
      var child = this.getChild(key);

      if (!child) {
        key = assertKey(key);
        throw new Error('Could not find a child node with key "' + key + '".');
      }

      return child;
    }

    /**
     * Assert that a node has a descendant by `key` and return it.
     *
     * @param {String} key
     * @return {Node}
     */

  }, {
    key: 'assertDescendant',
    value: function assertDescendant(key) {
      var descendant = this.getDescendant(key);

      if (!descendant) {
        key = assertKey(key);
        throw new Error('Could not find a descendant node with key "' + key + '".');
      }

      return descendant;
    }

    /**
     * Assert that a node's tree has a node by `key` and return it.
     *
     * @param {String} key
     * @return {Node}
     */

  }, {
    key: 'assertNode',
    value: function assertNode(key) {
      var node = this.getNode(key);

      if (!node) {
        key = assertKey(key);
        throw new Error('Could not find a node with key "' + key + '".');
      }

      return node;
    }

    /**
     * Assert that a node exists at `path` and return it.
     *
     * @param {Array} path
     * @return {Node}
     */

  }, {
    key: 'assertPath',
    value: function assertPath(path) {
      var descendant = this.getDescendantAtPath(path);

      if (!descendant) {
        throw new Error('Could not find a descendant at path "' + path + '".');
      }

      return descendant;
    }

    /**
     * Recursively filter all descendant nodes with `iterator`.
     *
     * @param {Function} iterator
     * @return {List<Node>}
     */

  }, {
    key: 'filterDescendants',
    value: function filterDescendants(iterator) {
      var matches = [];

      this.forEachDescendant(function (node, i, nodes) {
        if (iterator(node, i, nodes)) matches.push(node);
      });

      return Object(immutable__WEBPACK_IMPORTED_MODULE_1__["List"])(matches);
    }

    /**
     * Recursively find all descendant nodes by `iterator`.
     *
     * @param {Function} iterator
     * @return {Node|Null}
     */

  }, {
    key: 'findDescendant',
    value: function findDescendant(iterator) {
      var found = null;

      this.forEachDescendant(function (node, i, nodes) {
        if (iterator(node, i, nodes)) {
          found = node;
          return false;
        }
      });

      return found;
    }

    /**
     * Recursively iterate over all descendant nodes with `iterator`. If the
     * iterator returns false it will break the loop.
     *
     * @param {Function} iterator
     */

  }, {
    key: 'forEachDescendant',
    value: function forEachDescendant(iterator) {
      var ret = void 0;

      this.nodes.forEach(function (child, i, nodes) {
        if (iterator(child, i, nodes) === false) {
          ret = false;
          return false;
        }

        if (child.object != 'text') {
          ret = child.forEachDescendant(iterator);
          return ret;
        }
      });

      return ret;
    }

    /**
     * Get the path of ancestors of a descendant node by `key`.
     *
     * @param {String|Node} key
     * @return {List<Node>|Null}
     */

  }, {
    key: 'getAncestors',
    value: function getAncestors(key) {
      key = assertKey(key);

      if (key == this.key) return Object(immutable__WEBPACK_IMPORTED_MODULE_1__["List"])();
      if (this.hasChild(key)) return Object(immutable__WEBPACK_IMPORTED_MODULE_1__["List"])([this]);

      var ancestors = void 0;
      this.nodes.find(function (node) {
        if (node.object == 'text') return false;
        ancestors = node.getAncestors(key);
        return ancestors;
      });

      if (ancestors) {
        return ancestors.unshift(this);
      } else {
        return null;
      }
    }

    /**
     * Get the leaf block descendants of the node.
     *
     * @return {List<Node>}
     */

  }, {
    key: 'getBlocks',
    value: function getBlocks() {
      var array = this.getBlocksAsArray();
      return new immutable__WEBPACK_IMPORTED_MODULE_1__["List"](array);
    }

    /**
     * Get the leaf block descendants of the node.
     *
     * @return {List<Node>}
     */

  }, {
    key: 'getBlocksAsArray',
    value: function getBlocksAsArray() {
      return this.nodes.reduce(function (array, child) {
        if (child.object != 'block') return array;
        if (!child.isLeafBlock()) return array.concat(child.getBlocksAsArray());
        array.push(child);
        return array;
      }, []);
    }

    /**
     * Get the leaf block descendants in a `range`.
     *
     * @param {Range} range
     * @return {List<Node>}
     */

  }, {
    key: 'getBlocksAtRange',
    value: function getBlocksAtRange(range) {
      var array = this.getBlocksAtRangeAsArray(range);
      // Eliminate duplicates by converting to an `OrderedSet` first.
      return new immutable__WEBPACK_IMPORTED_MODULE_1__["List"](new immutable__WEBPACK_IMPORTED_MODULE_1__["OrderedSet"](array));
    }

    /**
     * Get the leaf block descendants in a `range` as an array
     *
     * @param {Range} range
     * @return {Array}
     */

  }, {
    key: 'getBlocksAtRangeAsArray',
    value: function getBlocksAtRangeAsArray(range) {
      range = range.normalize(this);
      if (range.isUnset) return [];

      var _range = range,
          startKey = _range.startKey,
          endKey = _range.endKey;

      var startBlock = this.getClosestBlock(startKey);

      // PERF: the most common case is when the range is in a single block node,
      // where we can avoid a lot of iterating of the tree.
      if (startKey == endKey) return [startBlock];

      var endBlock = this.getClosestBlock(endKey);
      var blocks = this.getBlocksAsArray();
      var start = blocks.indexOf(startBlock);
      var end = blocks.indexOf(endBlock);
      return blocks.slice(start, end + 1);
    }

    /**
     * Get all of the leaf blocks that match a `type`.
     *
     * @param {String} type
     * @return {List<Node>}
     */

  }, {
    key: 'getBlocksByType',
    value: function getBlocksByType(type) {
      var array = this.getBlocksByTypeAsArray(type);
      return new immutable__WEBPACK_IMPORTED_MODULE_1__["List"](array);
    }

    /**
     * Get all of the leaf blocks that match a `type` as an array
     *
     * @param {String} type
     * @return {Array}
     */

  }, {
    key: 'getBlocksByTypeAsArray',
    value: function getBlocksByTypeAsArray(type) {
      return this.nodes.reduce(function (array, node) {
        if (node.object != 'block') {
          return array;
        } else if (node.isLeafBlock() && node.type == type) {
          array.push(node);
          return array;
        } else {
          return array.concat(node.getBlocksByTypeAsArray(type));
        }
      }, []);
    }

    /**
     * Get all of the characters for every text node.
     *
     * @return {List<Character>}
     */

  }, {
    key: 'getCharacters',
    value: function getCharacters() {
      return this.getTexts().flatMap(function (t) {
        return t.characters;
      });
    }

    /**
     * Get a list of the characters in a `range`.
     *
     * @param {Range} range
     * @return {List<Character>}
     */

  }, {
    key: 'getCharactersAtRange',
    value: function getCharactersAtRange(range) {
      range = range.normalize(this);
      if (range.isUnset) return Object(immutable__WEBPACK_IMPORTED_MODULE_1__["List"])();
      var _range2 = range,
          startKey = _range2.startKey,
          endKey = _range2.endKey,
          startOffset = _range2.startOffset,
          endOffset = _range2.endOffset;

      if (startKey === endKey) {
        var endText = this.getDescendant(endKey);
        return endText.characters.slice(startOffset, endOffset);
      }

      return this.getTextsAtRange(range).flatMap(function (t) {
        if (t.key === startKey) {
          return t.characters.slice(startOffset);
        }
        if (t.key === endKey) {
          return t.characters.slice(0, endOffset);
        }
        return t.characters;
      });
    }

    /**
     * Get a child node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getChild',
    value: function getChild(key) {
      key = assertKey(key);
      return this.nodes.find(function (node) {
        return node.key == key;
      });
    }

    /**
     * Get closest parent of node by `key` that matches `iterator`.
     *
     * @param {String} key
     * @param {Function} iterator
     * @return {Node|Null}
     */

  }, {
    key: 'getClosest',
    value: function getClosest(key, iterator) {
      key = assertKey(key);
      var ancestors = this.getAncestors(key);
      if (!ancestors) {
        throw new Error('Could not find a descendant node with key "' + key + '".');
      }

      // Exclude this node itself.
      return ancestors.rest().findLast(iterator);
    }

    /**
     * Get the closest block parent of a `node`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getClosestBlock',
    value: function getClosestBlock(key) {
      return this.getClosest(key, function (parent) {
        return parent.object == 'block';
      });
    }

    /**
     * Get the closest inline parent of a `node`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getClosestInline',
    value: function getClosestInline(key) {
      return this.getClosest(key, function (parent) {
        return parent.object == 'inline';
      });
    }

    /**
     * Get the closest void parent of a `node`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getClosestVoid',
    value: function getClosestVoid(key) {
      return this.getClosest(key, function (parent) {
        return parent.isVoid;
      });
    }

    /**
     * Get the common ancestor of nodes `one` and `two` by keys.
     *
     * @param {String} one
     * @param {String} two
     * @return {Node}
     */

  }, {
    key: 'getCommonAncestor',
    value: function getCommonAncestor(one, two) {
      one = assertKey(one);
      two = assertKey(two);

      if (one == this.key) return this;
      if (two == this.key) return this;

      this.assertDescendant(one);
      this.assertDescendant(two);
      var ancestors = new immutable__WEBPACK_IMPORTED_MODULE_1__["List"]();
      var oneParent = this.getParent(one);
      var twoParent = this.getParent(two);

      while (oneParent) {
        ancestors = ancestors.push(oneParent);
        oneParent = this.getParent(oneParent.key);
      }

      while (twoParent) {
        if (ancestors.includes(twoParent)) return twoParent;
        twoParent = this.getParent(twoParent.key);
      }
    }

    /**
     * Get the decorations for the node from a `stack`.
     *
     * @param {Stack} stack
     * @return {List}
     */

  }, {
    key: 'getDecorations',
    value: function getDecorations(stack) {
      var decorations = stack.find('decorateNode', this);
      var list = Range.createList(decorations || []);
      return list;
    }

    /**
     * Get the depth of a child node by `key`, with optional `startAt`.
     *
     * @param {String} key
     * @param {Number} startAt (optional)
     * @return {Number} depth
     */

  }, {
    key: 'getDepth',
    value: function getDepth(key) {
      var startAt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

      this.assertDescendant(key);
      if (this.hasChild(key)) return startAt;
      return this.getFurthestAncestor(key).getDepth(key, startAt + 1);
    }

    /**
     * Get a descendant node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getDescendant',
    value: function getDescendant(key) {
      key = assertKey(key);
      var descendantFound = null;

      var found = this.nodes.find(function (node) {
        if (node.key === key) {
          return node;
        } else if (node.object !== 'text') {
          descendantFound = node.getDescendant(key);
          return descendantFound;
        } else {
          return false;
        }
      });

      return descendantFound || found;
    }

    /**
     * Get a descendant by `path`.
     *
     * @param {Array} path
     * @return {Node|Null}
     */

  }, {
    key: 'getDescendantAtPath',
    value: function getDescendantAtPath(path) {
      var descendant = this;

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = path[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var index = _step.value;

          if (!descendant) return;
          if (!descendant.nodes) return;
          descendant = descendant.nodes.get(index);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return descendant;
    }

    /**
     * Get the first child text node.
     *
     * @return {Node|Null}
     */

  }, {
    key: 'getFirstText',
    value: function getFirstText() {
      var descendantFound = null;

      var found = this.nodes.find(function (node) {
        if (node.object == 'text') return true;
        descendantFound = node.getFirstText();
        return descendantFound;
      });

      return descendantFound || found;
    }

    /**
     * Get a fragment of the node at a `range`.
     *
     * @param {Range} range
     * @return {Document}
     */

  }, {
    key: 'getFragmentAtRange',
    value: function getFragmentAtRange(range) {
      range = range.normalize(this);
      if (range.isUnset) return Document.create();

      var node = this;

      // Make sure the children exist.
      var _range3 = range,
          startKey = _range3.startKey,
          startOffset = _range3.startOffset,
          endKey = _range3.endKey,
          endOffset = _range3.endOffset;

      var startText = node.assertDescendant(startKey);
      var endText = node.assertDescendant(endKey);

      // Split at the start and end.
      var child = startText;
      var previous = void 0;
      var parent = void 0;

      while (parent = node.getParent(child.key)) {
        var index = parent.nodes.indexOf(child);
        var position = child.object == 'text' ? startOffset : child.nodes.indexOf(previous);

        parent = parent.splitNode(index, position);
        node = node.updateNode(parent);
        previous = parent.nodes.get(index + 1);
        child = parent;
      }

      child = startKey == endKey ? node.getNextText(startKey) : endText;

      while (parent = node.getParent(child.key)) {
        var _index = parent.nodes.indexOf(child);
        var _position = child.object == 'text' ? startKey == endKey ? endOffset - startOffset : endOffset : child.nodes.indexOf(previous);

        parent = parent.splitNode(_index, _position);
        node = node.updateNode(parent);
        previous = parent.nodes.get(_index + 1);
        child = parent;
      }

      // Get the start and end nodes.
      var startNode = node.getNextSibling(node.getFurthestAncestor(startKey).key);
      var endNode = startKey == endKey ? node.getNextSibling(node.getNextSibling(node.getFurthestAncestor(endKey).key).key) : node.getNextSibling(node.getFurthestAncestor(endKey).key);

      // Get children range of nodes from start to end nodes
      var startIndex = node.nodes.indexOf(startNode);
      var endIndex = node.nodes.indexOf(endNode);
      var nodes = node.nodes.slice(startIndex, endIndex);

      // Return a new document fragment.
      return Document.create({ nodes: nodes });
    }

    /**
     * Get the furthest parent of a node by `key` that matches an `iterator`.
     *
     * @param {String} key
     * @param {Function} iterator
     * @return {Node|Null}
     */

  }, {
    key: 'getFurthest',
    value: function getFurthest(key, iterator) {
      var ancestors = this.getAncestors(key);
      if (!ancestors) {
        key = assertKey(key);
        throw new Error('Could not find a descendant node with key "' + key + '".');
      }

      // Exclude this node itself
      return ancestors.rest().find(iterator);
    }

    /**
     * Get the furthest block parent of a node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getFurthestBlock',
    value: function getFurthestBlock(key) {
      return this.getFurthest(key, function (node) {
        return node.object == 'block';
      });
    }

    /**
     * Get the furthest inline parent of a node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getFurthestInline',
    value: function getFurthestInline(key) {
      return this.getFurthest(key, function (node) {
        return node.object == 'inline';
      });
    }

    /**
     * Get the furthest ancestor of a node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getFurthestAncestor',
    value: function getFurthestAncestor(key) {
      key = assertKey(key);
      return this.nodes.find(function (node) {
        if (node.key == key) return true;
        if (node.object == 'text') return false;
        return node.hasDescendant(key);
      });
    }

    /**
     * Get the furthest ancestor of a node by `key` that has only one child.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getFurthestOnlyChildAncestor',
    value: function getFurthestOnlyChildAncestor(key) {
      var ancestors = this.getAncestors(key);

      if (!ancestors) {
        key = assertKey(key);
        throw new Error('Could not find a descendant node with key "' + key + '".');
      }

      var result = ancestors
      // Skip this node...
      .shift()
      // Take parents until there are more than one child...
      .reverse().takeUntil(function (p) {
        return p.nodes.size > 1;
      })
      // And pick the highest.
      .last();
      if (!result) return null;
      return result;
    }

    /**
     * Get the closest inline nodes for each text node in the node.
     *
     * @return {List<Node>}
     */

  }, {
    key: 'getInlines',
    value: function getInlines() {
      var array = this.getInlinesAsArray();
      return new immutable__WEBPACK_IMPORTED_MODULE_1__["List"](array);
    }

    /**
     * Get the closest inline nodes for each text node in the node, as an array.
     *
     * @return {List<Node>}
     */

  }, {
    key: 'getInlinesAsArray',
    value: function getInlinesAsArray() {
      var array = [];

      this.nodes.forEach(function (child) {
        if (child.object == 'text') return;
        if (child.isLeafInline()) {
          array.push(child);
        } else {
          array = array.concat(child.getInlinesAsArray());
        }
      });

      return array;
    }

    /**
     * Get the closest inline nodes for each text node in a `range`.
     *
     * @param {Range} range
     * @return {List<Node>}
     */

  }, {
    key: 'getInlinesAtRange',
    value: function getInlinesAtRange(range) {
      var array = this.getInlinesAtRangeAsArray(range);
      // Remove duplicates by converting it to an `OrderedSet` first.
      return new immutable__WEBPACK_IMPORTED_MODULE_1__["List"](new immutable__WEBPACK_IMPORTED_MODULE_1__["OrderedSet"](array));
    }

    /**
     * Get the closest inline nodes for each text node in a `range` as an array.
     *
     * @param {Range} range
     * @return {Array}
     */

  }, {
    key: 'getInlinesAtRangeAsArray',
    value: function getInlinesAtRangeAsArray(range) {
      var _this = this;

      range = range.normalize(this);
      if (range.isUnset) return [];

      return this.getTextsAtRangeAsArray(range).map(function (text) {
        return _this.getClosestInline(text.key);
      }).filter(function (exists) {
        return exists;
      });
    }

    /**
     * Get all of the leaf inline nodes that match a `type`.
     *
     * @param {String} type
     * @return {List<Node>}
     */

  }, {
    key: 'getInlinesByType',
    value: function getInlinesByType(type) {
      var array = this.getInlinesByTypeAsArray(type);
      return new immutable__WEBPACK_IMPORTED_MODULE_1__["List"](array);
    }

    /**
     * Get all of the leaf inline nodes that match a `type` as an array.
     *
     * @param {String} type
     * @return {Array}
     */

  }, {
    key: 'getInlinesByTypeAsArray',
    value: function getInlinesByTypeAsArray(type) {
      return this.nodes.reduce(function (inlines, node) {
        if (node.object == 'text') {
          return inlines;
        } else if (node.isLeafInline() && node.type == type) {
          inlines.push(node);
          return inlines;
        } else {
          return inlines.concat(node.getInlinesByTypeAsArray(type));
        }
      }, []);
    }

    /**
     * Return a set of all keys in the node as an array.
     *
     * @return {Array<String>}
     */

  }, {
    key: 'getKeysAsArray',
    value: function getKeysAsArray() {
      var keys = [];

      this.forEachDescendant(function (desc) {
        keys.push(desc.key);
      });

      return keys;
    }

    /**
     * Return a set of all keys in the node.
     *
     * @return {Set<String>}
     */

  }, {
    key: 'getKeys',
    value: function getKeys() {
      var keys = this.getKeysAsArray();
      return new immutable__WEBPACK_IMPORTED_MODULE_1__["Set"](keys);
    }

    /**
     * Get the last child text node.
     *
     * @return {Node|Null}
     */

  }, {
    key: 'getLastText',
    value: function getLastText() {
      var descendantFound = null;

      var found = this.nodes.findLast(function (node) {
        if (node.object == 'text') return true;
        descendantFound = node.getLastText();
        return descendantFound;
      });

      return descendantFound || found;
    }

    /**
     * Get all of the marks for all of the characters of every text node.
     *
     * @return {Set<Mark>}
     */

  }, {
    key: 'getMarks',
    value: function getMarks() {
      var array = this.getMarksAsArray();
      return new immutable__WEBPACK_IMPORTED_MODULE_1__["Set"](array);
    }

    /**
     * Get all of the marks for all of the characters of every text node.
     *
     * @return {OrderedSet<Mark>}
     */

  }, {
    key: 'getOrderedMarks',
    value: function getOrderedMarks() {
      var array = this.getMarksAsArray();
      return new immutable__WEBPACK_IMPORTED_MODULE_1__["OrderedSet"](array);
    }

    /**
     * Get all of the marks as an array.
     *
     * @return {Array}
     */

  }, {
    key: 'getMarksAsArray',
    value: function getMarksAsArray() {
      // PERF: use only one concat rather than multiple concat
      // becuase one concat is faster
      var result = [];
      this.nodes.forEach(function (node) {
        result.push(node.getMarksAsArray());
      });
      return Array.prototype.concat.apply([], result);
    }

    /**
     * Get a set of the marks in a `range`.
     *
     * @param {Range} range
     * @return {Set<Mark>}
     */

  }, {
    key: 'getMarksAtRange',
    value: function getMarksAtRange(range) {
      return new immutable__WEBPACK_IMPORTED_MODULE_1__["Set"](this.getOrderedMarksAtRange(range));
    }

    /**
     * Get a set of the marks in a `range`.
     *
     * @param {Range} range
     * @return {Set<Mark>}
     */

  }, {
    key: 'getInsertMarksAtRange',
    value: function getInsertMarksAtRange(range) {
      range = range.normalize(this);
      if (range.isUnset) return Object(immutable__WEBPACK_IMPORTED_MODULE_1__["Set"])();
      if (range.isCollapsed) {
        // PERF: range is not cachable, use key and offset as proxies for cache
        return this.getMarksAtPosition(range.startKey, range.startOffset);
      }

      var text = this.getDescendant(range.startKey);
      var char = text.characters.get(range.startOffset);
      if (!char) return Object(immutable__WEBPACK_IMPORTED_MODULE_1__["Set"])();

      return char.marks;
    }

    /**
     * Get a set of the marks in a `range`.
     *
     * @param {Range} range
     * @return {OrderedSet<Mark>}
     */

  }, {
    key: 'getOrderedMarksAtRange',
    value: function getOrderedMarksAtRange(range) {
      range = range.normalize(this);
      if (range.isUnset) return Object(immutable__WEBPACK_IMPORTED_MODULE_1__["OrderedSet"])();
      if (range.isCollapsed) {
        // PERF: range is not cachable, use key and offset as proxies for cache
        return this.getMarksAtPosition(range.startKey, range.startOffset);
      }

      var _range4 = range,
          startKey = _range4.startKey,
          startOffset = _range4.startOffset,
          endKey = _range4.endKey,
          endOffset = _range4.endOffset;

      return this.getOrderedMarksBetweenPositions(startKey, startOffset, endKey, endOffset);
    }

    /**
     * Get a set of the marks in a `range`.
     * PERF: arguments use key and offset for utilizing cache
     *
     * @param {string} startKey
     * @param {number} startOffset
     * @param {string} endKey
     * @param {number} endOffset
     * @returns {OrderedSet<Mark>}
     */

  }, {
    key: 'getOrderedMarksBetweenPositions',
    value: function getOrderedMarksBetweenPositions(startKey, startOffset, endKey, endOffset) {
      if (startKey === endKey) {
        var startText = this.getDescendant(startKey);
        return startText.getMarksBetweenOffsets(startOffset, endOffset);
      }

      var texts = this.getTextsBetweenPositionsAsArray(startKey, endKey);

      return Object(immutable__WEBPACK_IMPORTED_MODULE_1__["OrderedSet"])().withMutations(function (result) {
        texts.forEach(function (text) {
          if (text.key === startKey) {
            result.union(text.getMarksBetweenOffsets(startOffset, text.text.length));
          } else if (text.key === endKey) {
            result.union(text.getMarksBetweenOffsets(0, endOffset));
          } else {
            result.union(text.getMarks());
          }
        });
      });
    }

    /**
     * Get a set of the active marks in a `range`.
     *
     * @param {Range} range
     * @return {Set<Mark>}
     */

  }, {
    key: 'getActiveMarksAtRange',
    value: function getActiveMarksAtRange(range) {
      range = range.normalize(this);
      if (range.isUnset) return Object(immutable__WEBPACK_IMPORTED_MODULE_1__["Set"])();
      if (range.isCollapsed) {
        var _range5 = range,
            _startKey = _range5.startKey,
            _startOffset = _range5.startOffset;

        return this.getMarksAtPosition(_startKey, _startOffset).toSet();
      }

      var _range6 = range,
          startKey = _range6.startKey,
          endKey = _range6.endKey,
          startOffset = _range6.startOffset,
          endOffset = _range6.endOffset;

      var startText = this.getDescendant(startKey);

      if (startKey !== endKey) {
        while (startKey !== endKey && endOffset === 0) {
          var _endText = this.getPreviousText(endKey);
          endKey = _endText.key;
          endOffset = _endText.text.length;
        }

        while (startKey !== endKey && startOffset === startText.text.length) {
          startText = this.getNextText(startKey);
          startKey = startText.key;
          startOffset = 0;
        }
      }

      if (startKey === endKey) {
        return startText.getActiveMarksBetweenOffsets(startOffset, endOffset);
      }

      var startMarks = startText.getActiveMarksBetweenOffsets(startOffset, startText.text.length);
      if (startMarks.size === 0) return Object(immutable__WEBPACK_IMPORTED_MODULE_1__["Set"])();
      var endText = this.getDescendant(endKey);
      var endMarks = endText.getActiveMarksBetweenOffsets(0, endOffset);
      var marks = startMarks.intersect(endMarks);
      // If marks is already empty, the active marks is empty
      if (marks.size === 0) return marks;

      var text = this.getNextText(startKey);
      while (text.key !== endKey) {
        if (text.text.length !== 0) {
          marks = marks.intersect(text.getActiveMarks());
          if (marks.size === 0) return Object(immutable__WEBPACK_IMPORTED_MODULE_1__["Set"])();
        }
        text = this.getNextText(text.key);
      }
      return marks;
    }

    /**
     * Get a set of marks in a `position`, the equivalent of a collapsed range
     *
     * @param {string} key
     * @param {number} offset
     * @return {OrderedSet}
     */

  }, {
    key: 'getMarksAtPosition',
    value: function getMarksAtPosition(key, offset) {
      if (offset == 0) {
        var previous = this.getPreviousText(key);
        if (!previous || previous.text.length == 0) return Object(immutable__WEBPACK_IMPORTED_MODULE_1__["OrderedSet"])();
        if (this.getClosestBlock(key) !== this.getClosestBlock(previous.key)) {
          return Object(immutable__WEBPACK_IMPORTED_MODULE_1__["OrderedSet"])();
        }

        var _char = previous.characters.last();
        if (!_char) return Object(immutable__WEBPACK_IMPORTED_MODULE_1__["OrderedSet"])();
        return new immutable__WEBPACK_IMPORTED_MODULE_1__["OrderedSet"](_char.marks);
      }

      var text = this.getDescendant(key);
      var char = text.characters.get(offset - 1);
      if (!char) return Object(immutable__WEBPACK_IMPORTED_MODULE_1__["OrderedSet"])();
      return new immutable__WEBPACK_IMPORTED_MODULE_1__["OrderedSet"](char.marks);
    }

    /**
     * Get all of the marks that match a `type`.
     *
     * @param {String} type
     * @return {Set<Mark>}
     */

  }, {
    key: 'getMarksByType',
    value: function getMarksByType(type) {
      var array = this.getMarksByTypeAsArray(type);
      return new immutable__WEBPACK_IMPORTED_MODULE_1__["Set"](array);
    }

    /**
     * Get all of the marks that match a `type`.
     *
     * @param {String} type
     * @return {OrderedSet<Mark>}
     */

  }, {
    key: 'getOrderedMarksByType',
    value: function getOrderedMarksByType(type) {
      var array = this.getMarksByTypeAsArray(type);
      return new immutable__WEBPACK_IMPORTED_MODULE_1__["OrderedSet"](array);
    }

    /**
     * Get all of the marks that match a `type` as an array.
     *
     * @param {String} type
     * @return {Array}
     */

  }, {
    key: 'getMarksByTypeAsArray',
    value: function getMarksByTypeAsArray(type) {
      return this.nodes.reduce(function (array, node) {
        return node.object == 'text' ? array.concat(node.getMarksAsArray().filter(function (m) {
          return m.type == type;
        })) : array.concat(node.getMarksByTypeAsArray(type));
      }, []);
    }

    /**
     * Get the block node before a descendant text node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getNextBlock',
    value: function getNextBlock(key) {
      var child = this.assertDescendant(key);
      var last = void 0;

      if (child.object == 'block') {
        last = child.getLastText();
      } else {
        var block = this.getClosestBlock(key);
        last = block.getLastText();
      }

      var next = this.getNextText(last.key);
      if (!next) return null;

      return this.getClosestBlock(next.key);
    }

    /**
     * Get the node after a descendant by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getNextSibling',
    value: function getNextSibling(key) {
      key = assertKey(key);

      var parent = this.getParent(key);
      var after = parent.nodes.skipUntil(function (child) {
        return child.key == key;
      });

      if (after.size == 0) {
        throw new Error('Could not find a child node with key "' + key + '".');
      }
      return after.get(1);
    }

    /**
     * Get the text node after a descendant text node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getNextText',
    value: function getNextText(key) {
      key = assertKey(key);
      return this.getTexts().skipUntil(function (text) {
        return text.key == key;
      }).get(1);
    }

    /**
     * Get a node in the tree by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getNode',
    value: function getNode(key) {
      key = assertKey(key);
      return this.key == key ? this : this.getDescendant(key);
    }

    /**
     * Get a node in the tree by `path`.
     *
     * @param {Array} path
     * @return {Node|Null}
     */

  }, {
    key: 'getNodeAtPath',
    value: function getNodeAtPath(path) {
      return path.length ? this.getDescendantAtPath(path) : this;
    }

    /**
     * Get the offset for a descendant text node by `key`.
     *
     * @param {String} key
     * @return {Number}
     */

  }, {
    key: 'getOffset',
    value: function getOffset(key) {
      this.assertDescendant(key);

      // Calculate the offset of the nodes before the highest child.
      var child = this.getFurthestAncestor(key);
      var offset = this.nodes.takeUntil(function (n) {
        return n == child;
      }).reduce(function (memo, n) {
        return memo + n.text.length;
      }, 0);

      // Recurse if need be.
      return this.hasChild(key) ? offset : offset + child.getOffset(key);
    }

    /**
     * Get the offset from a `range`.
     *
     * @param {Range} range
     * @return {Number}
     */

  }, {
    key: 'getOffsetAtRange',
    value: function getOffsetAtRange(range) {
      range = range.normalize(this);

      if (range.isUnset) {
        throw new Error('The range cannot be unset to calculcate its offset.');
      }

      if (range.isExpanded) {
        throw new Error('The range must be collapsed to calculcate its offset.');
      }

      var _range7 = range,
          startKey = _range7.startKey,
          startOffset = _range7.startOffset;

      return this.getOffset(startKey) + startOffset;
    }

    /**
     * Get the parent of a child node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getParent',
    value: function getParent(key) {
      if (this.hasChild(key)) return this;

      var node = null;

      this.nodes.find(function (child) {
        if (child.object == 'text') {
          return false;
        } else {
          node = child.getParent(key);
          return node;
        }
      });

      return node;
    }

    /**
     * Get the path of a descendant node by `key`.
     *
     * @param {String|Node} key
     * @return {Array}
     */

  }, {
    key: 'getPath',
    value: function getPath(key) {
      var child = this.assertNode(key);
      var ancestors = this.getAncestors(key);
      var path = [];

      ancestors.reverse().forEach(function (ancestor) {
        var index = ancestor.nodes.indexOf(child);
        path.unshift(index);
        child = ancestor;
      });

      return path;
    }

    /**
     * Refind the path of node if path is changed.
     *
     * @param {Array} path
     * @param {String} key
     * @return {Array}
     */

  }, {
    key: 'refindPath',
    value: function refindPath(path, key) {
      var node = this.getDescendantAtPath(path);
      if (node && node.key === key) {
        return path;
      }

      return this.getPath(key);
    }

    /**
     *
     * Refind the node with the same node.key after change.
     *
     * @param {Array} path
     * @param {String} key
     * @return {Node|Void}
     */

  }, {
    key: 'refindNode',
    value: function refindNode(path, key) {
      var node = this.getDescendantAtPath(path);
      if (node && node.key === key) {
        return node;
      }

      return this.getDescendant(key);
    }

    /**
     * Get the placeholder for the node from a `schema`.
     *
     * @param {Schema} schema
     * @return {Component|Void}
     */

  }, {
    key: 'getPlaceholder',
    value: function getPlaceholder(schema) {
      return schema.__getPlaceholder(this);
    }

    /**
     * Get the block node before a descendant text node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getPreviousBlock',
    value: function getPreviousBlock(key) {
      var child = this.assertDescendant(key);
      var first = void 0;

      if (child.object == 'block') {
        first = child.getFirstText();
      } else {
        var block = this.getClosestBlock(key);
        first = block.getFirstText();
      }

      var previous = this.getPreviousText(first.key);
      if (!previous) return null;

      return this.getClosestBlock(previous.key);
    }

    /**
     * Get the node before a descendant node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getPreviousSibling',
    value: function getPreviousSibling(key) {
      key = assertKey(key);
      var parent = this.getParent(key);
      var before = parent.nodes.takeUntil(function (child) {
        return child.key == key;
      });

      if (before.size == parent.nodes.size) {
        throw new Error('Could not find a child node with key "' + key + '".');
      }

      return before.last();
    }

    /**
     * Get the text node before a descendant text node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getPreviousText',
    value: function getPreviousText(key) {
      key = assertKey(key);
      return this.getTexts().takeUntil(function (text) {
        return text.key == key;
      }).last();
    }

    /**
     * Get the indexes of the selection for a `range`, given an extra flag for
     * whether the node `isSelected`, to determine whether not finding matches
     * means everything is selected or nothing is.
     *
     * @param {Range} range
     * @param {Boolean} isSelected
     * @return {Object|Null}
     */

  }, {
    key: 'getSelectionIndexes',
    value: function getSelectionIndexes(range) {
      var isSelected = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var startKey = range.startKey,
          endKey = range.endKey;

      // PERF: if we're not selected, or the range is blurred, we can exit early.

      if (!isSelected || range.isBlurred) {
        return null;
      }

      // if we've been given an invalid selection we can exit early.
      if (range.isUnset) {
        return null;
      }

      // PERF: if the start and end keys are the same, just check for the child
      // that contains that single key.
      if (startKey == endKey) {
        var child = this.getFurthestAncestor(startKey);
        var index = child ? this.nodes.indexOf(child) : null;
        return { start: index, end: index + 1 };
      }

      // Otherwise, check all of the children...
      var start = null;
      var end = null;

      this.nodes.forEach(function (child, i) {
        if (child.object == 'text') {
          if (start == null && child.key == startKey) start = i;
          if (end == null && child.key == endKey) end = i + 1;
        } else {
          if (start == null && child.hasDescendant(startKey)) start = i;
          if (end == null && child.hasDescendant(endKey)) end = i + 1;
        }

        // PERF: exit early if both start and end have been found.
        return start == null || end == null;
      });

      if (isSelected && start == null) start = 0;
      if (isSelected && end == null) end = this.nodes.size;
      return start == null ? null : { start: start, end: end };
    }

    /**
     * Get the concatenated text string of all child nodes.
     *
     * @return {String}
     */

  }, {
    key: 'getText',
    value: function getText() {
      return this.nodes.reduce(function (string, node) {
        return string + node.text;
      }, '');
    }

    /**
     * Get the descendent text node at an `offset`.
     *
     * @param {String} offset
     * @return {Node|Null}
     */

  }, {
    key: 'getTextAtOffset',
    value: function getTextAtOffset(offset) {
      // PERF: Add a few shortcuts for the obvious cases.
      if (offset == 0) return this.getFirstText();
      if (offset == this.text.length) return this.getLastText();
      if (offset < 0 || offset > this.text.length) return null;

      var length = 0;

      return this.getTexts().find(function (node, i, nodes) {
        length += node.text.length;
        return length > offset;
      });
    }

    /**
     * Get the direction of the node's text.
     *
     * @return {String}
     */

  }, {
    key: 'getTextDirection',
    value: function getTextDirection() {
      var dir = direction__WEBPACK_IMPORTED_MODULE_3___default()(this.text);
      return dir == 'neutral' ? undefined : dir;
    }

    /**
     * Recursively get all of the child text nodes in order of appearance.
     *
     * @return {List<Node>}
     */

  }, {
    key: 'getTexts',
    value: function getTexts() {
      var array = this.getTextsAsArray();
      return new immutable__WEBPACK_IMPORTED_MODULE_1__["List"](array);
    }

    /**
     * Recursively get all the leaf text nodes in order of appearance, as array.
     *
     * @return {List<Node>}
     */

  }, {
    key: 'getTextsAsArray',
    value: function getTextsAsArray() {
      var array = [];

      this.nodes.forEach(function (node) {
        if (node.object == 'text') {
          array.push(node);
        } else {
          array = array.concat(node.getTextsAsArray());
        }
      });

      return array;
    }

    /**
     * Get all of the text nodes in a `range`.
     *
     * @param {Range} range
     * @return {List<Node>}
     */

  }, {
    key: 'getTextsAtRange',
    value: function getTextsAtRange(range) {
      range = range.normalize(this);
      if (range.isUnset) return Object(immutable__WEBPACK_IMPORTED_MODULE_1__["List"])();
      var _range8 = range,
          startKey = _range8.startKey,
          endKey = _range8.endKey;

      return new immutable__WEBPACK_IMPORTED_MODULE_1__["List"](this.getTextsBetweenPositionsAsArray(startKey, endKey));
    }

    /**
     * Get all of the text nodes in a `range` as an array.
     * PERF: use key in arguments for cache
     *
     * @param {string} startKey
     * @param {string} endKey
     * @returns {Array}
     */

  }, {
    key: 'getTextsBetweenPositionsAsArray',
    value: function getTextsBetweenPositionsAsArray(startKey, endKey) {
      var startText = this.getDescendant(startKey);

      // PERF: the most common case is when the range is in a single text node,
      // where we can avoid a lot of iterating of the tree.
      if (startKey == endKey) return [startText];

      var endText = this.getDescendant(endKey);
      var texts = this.getTextsAsArray();
      var start = texts.indexOf(startText);
      var end = texts.indexOf(endText, start);
      return texts.slice(start, end + 1);
    }

    /**
     * Get all of the text nodes in a `range` as an array.
     *
     * @param {Range} range
     * @return {Array}
     */

  }, {
    key: 'getTextsAtRangeAsArray',
    value: function getTextsAtRangeAsArray(range) {
      range = range.normalize(this);
      if (range.isUnset) return [];
      var _range9 = range,
          startKey = _range9.startKey,
          endKey = _range9.endKey;

      return this.getTextsBetweenPositionsAsArray(startKey, endKey);
    }

    /**
     * Check if a child node exists by `key`.
     *
     * @param {String} key
     * @return {Boolean}
     */

  }, {
    key: 'hasChild',
    value: function hasChild(key) {
      return !!this.getChild(key);
    }

    /**
     * Check if a node has block node children.
     *
     * @param {String} key
     * @return {Boolean}
     */

  }, {
    key: 'hasBlocks',
    value: function hasBlocks(key) {
      var node = this.assertNode(key);
      return !!(node.nodes && node.nodes.find(function (n) {
        return n.object === 'block';
      }));
    }

    /**
     * Check if a node has inline node children.
     *
     * @param {String} key
     * @return {Boolean}
     */

  }, {
    key: 'hasInlines',
    value: function hasInlines(key) {
      var node = this.assertNode(key);
      return !!(node.nodes && node.nodes.find(function (n) {
        return Inline.isInline(n) || Text.isText(n);
      }));
    }

    /**
     * Recursively check if a child node exists by `key`.
     *
     * @param {String} key
     * @return {Boolean}
     */

  }, {
    key: 'hasDescendant',
    value: function hasDescendant(key) {
      return !!this.getDescendant(key);
    }

    /**
     * Recursively check if a node exists by `key`.
     *
     * @param {String} key
     * @return {Boolean}
     */

  }, {
    key: 'hasNode',
    value: function hasNode(key) {
      return !!this.getNode(key);
    }

    /**
     * Check if a node has a void parent by `key`.
     *
     * @param {String} key
     * @return {Boolean}
     */

  }, {
    key: 'hasVoidParent',
    value: function hasVoidParent(key) {
      return !!this.getClosestVoid(key);
    }

    /**
     * Insert a `node` at `index`.
     *
     * @param {Number} index
     * @param {Node} node
     * @return {Node}
     */

  }, {
    key: 'insertNode',
    value: function insertNode(index, node) {
      var keys = this.getKeysAsArray();

      if (keys.includes(node.key)) {
        node = node.regenerateKey();
      }

      if (node.object != 'text') {
        node = node.mapDescendants(function (desc) {
          return keys.includes(desc.key) ? desc.regenerateKey() : desc;
        });
      }

      var nodes = this.nodes.insert(index, node);
      return this.set('nodes', nodes);
    }

    /**
     * Check whether the node is in a `range`.
     *
     * @param {Range} range
     * @return {Boolean}
     */

  }, {
    key: 'isInRange',
    value: function isInRange(range) {
      range = range.normalize(this);

      var node = this;
      var _range10 = range,
          startKey = _range10.startKey,
          endKey = _range10.endKey,
          isCollapsed = _range10.isCollapsed;

      // PERF: solve the most common cast where the start or end key are inside
      // the node, for collapsed selections.

      if (node.key == startKey || node.key == endKey || node.hasDescendant(startKey) || node.hasDescendant(endKey)) {
        return true;
      }

      // PERF: if the selection is collapsed and the previous check didn't return
      // true, then it must be false.
      if (isCollapsed) {
        return false;
      }

      // Otherwise, look through all of the leaf text nodes in the range, to see
      // if any of them are inside the node.
      var texts = node.getTextsAtRange(range);
      var memo = false;

      texts.forEach(function (text) {
        if (node.hasDescendant(text.key)) memo = true;
        return memo;
      });

      return memo;
    }

    /**
     * Check whether the node is a leaf block.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isLeafBlock',
    value: function isLeafBlock() {
      return this.object == 'block' && this.nodes.every(function (n) {
        return n.object != 'block';
      });
    }

    /**
     * Check whether the node is a leaf inline.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isLeafInline',
    value: function isLeafInline() {
      return this.object == 'inline' && this.nodes.every(function (n) {
        return n.object != 'inline';
      });
    }

    /**
     * Merge a children node `first` with another children node `second`.
     * `first` and `second` will be concatenated in that order.
     * `first` and `second` must be two Nodes or two Text.
     *
     * @param {Node} first
     * @param {Node} second
     * @return {Node}
     */

  }, {
    key: 'mergeNode',
    value: function mergeNode(withIndex, index) {
      var node = this;
      var one = node.nodes.get(withIndex);
      var two = node.nodes.get(index);

      if (one.object != two.object) {
        throw new Error('Tried to merge two nodes of different objects: "' + one.object + '" and "' + two.object + '".');
      }

      // If the nodes are text nodes, concatenate their characters together.
      if (one.object == 'text') {
        var characters = one.characters.concat(two.characters);
        one = one.set('characters', characters);
      } else {
        // Otherwise, concatenate their child nodes together.
        var nodes = one.nodes.concat(two.nodes);
        one = one.set('nodes', nodes);
      }

      node = node.removeNode(index);
      node = node.removeNode(withIndex);
      node = node.insertNode(withIndex, one);
      return node;
    }

    /**
     * Map all child nodes, updating them in their parents. This method is
     * optimized to not return a new node if no changes are made.
     *
     * @param {Function} iterator
     * @return {Node}
     */

  }, {
    key: 'mapChildren',
    value: function mapChildren(iterator) {
      var _this2 = this;

      var nodes = this.nodes;


      nodes.forEach(function (node, i) {
        var ret = iterator(node, i, _this2.nodes);
        if (ret != node) nodes = nodes.set(ret.key, ret);
      });

      return this.set('nodes', nodes);
    }

    /**
     * Map all descendant nodes, updating them in their parents. This method is
     * optimized to not return a new node if no changes are made.
     *
     * @param {Function} iterator
     * @return {Node}
     */

  }, {
    key: 'mapDescendants',
    value: function mapDescendants(iterator) {
      var _this3 = this;

      var nodes = this.nodes;


      nodes.forEach(function (node, index) {
        var ret = node;
        if (ret.object != 'text') ret = ret.mapDescendants(iterator);
        ret = iterator(ret, index, _this3.nodes);
        if (ret == node) return;

        nodes = nodes.set(index, ret);
      });

      return this.set('nodes', nodes);
    }

    /**
     * Regenerate the node's key.
     *
     * @return {Node}
     */

  }, {
    key: 'regenerateKey',
    value: function regenerateKey() {
      var key = generateKey();
      return this.set('key', key);
    }

    /**
     * Remove a `node` from the children node map.
     *
     * @param {String} key
     * @return {Node}
     */

  }, {
    key: 'removeDescendant',
    value: function removeDescendant(key) {
      key = assertKey(key);

      var node = this;
      var parent = node.getParent(key);
      if (!parent) throw new Error('Could not find a descendant node with key "' + key + '".');

      var index = parent.nodes.findIndex(function (n) {
        return n.key === key;
      });
      var nodes = parent.nodes.splice(index, 1);

      parent = parent.set('nodes', nodes);
      node = node.updateNode(parent);
      return node;
    }

    /**
     * Remove a node at `index`.
     *
     * @param {Number} index
     * @return {Node}
     */

  }, {
    key: 'removeNode',
    value: function removeNode(index) {
      var nodes = this.nodes.splice(index, 1);
      return this.set('nodes', nodes);
    }

    /**
     * Split a child node by `index` at `position`.
     *
     * @param {Number} index
     * @param {Number} position
     * @return {Node}
     */

  }, {
    key: 'splitNode',
    value: function splitNode(index, position) {
      var node = this;
      var child = node.nodes.get(index);
      var one = void 0;
      var two = void 0;

      // If the child is a text node, the `position` refers to the text offset at
      // which to split it.
      if (child.object == 'text') {
        var befores = child.characters.take(position);
        var afters = child.characters.skip(position);
        one = child.set('characters', befores);
        two = child.set('characters', afters).regenerateKey();
      } else {
        // Otherwise, if the child is not a text node, the `position` refers to the
        // index at which to split its children.
        var _befores = child.nodes.take(position);
        var _afters = child.nodes.skip(position);
        one = child.set('nodes', _befores);
        two = child.set('nodes', _afters).regenerateKey();
      }

      // Remove the old node and insert the newly split children.
      node = node.removeNode(index);
      node = node.insertNode(index, two);
      node = node.insertNode(index, one);
      return node;
    }

    /**
     * Set a new value for a child node by `key`.
     *
     * @param {Node} node
     * @return {Node}
     */

  }, {
    key: 'updateNode',
    value: function updateNode(node) {
      if (node.key == this.key) {
        return node;
      }

      var child = this.assertDescendant(node.key);
      var ancestors = this.getAncestors(node.key);

      ancestors.reverse().forEach(function (parent) {
        var _parent = parent,
            nodes = _parent.nodes;

        var index = nodes.indexOf(child);
        child = parent;
        nodes = nodes.set(index, node);
        parent = parent.set('nodes', nodes);
        node = parent;
      });

      return node;
    }

    /**
     * Validate the node against a `schema`.
     *
     * @param {Schema} schema
     * @return {Function|Null}
     */

  }, {
    key: 'validate',
    value: function validate(schema) {
      return schema.validateNode(this);
    }

    /**
     * Get the first invalid descendant
     *
     * @param {Schema} schema
     * @return {Node|Text|Null}
     */

  }, {
    key: 'getFirstInvalidDescendant',
    value: function getFirstInvalidDescendant(schema) {
      var result = null;
      this.nodes.find(function (n) {
        result = n.validate(schema) ? n : n.getFirstInvalidDescendant(schema);
        return result;
      });
      return result;
    }
  }], [{
    key: 'create',

    /**
     * Create a new `Node` with `attrs`.
     *
     * @param {Object|Node} attrs
     * @return {Node}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Node.isNode(attrs)) {
        return attrs;
      }

      if (is_plain_object__WEBPACK_IMPORTED_MODULE_0___default()(attrs)) {
        var object = attrs.object;


        if (!object && attrs.kind) {
          slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
          object = attrs.kind;
        }

        switch (object) {
          case 'block':
            return Block.create(attrs);
          case 'document':
            return Document.create(attrs);
          case 'inline':
            return Inline.create(attrs);
          case 'text':
            return Text.create(attrs);
          default:
            {
              throw new Error('`Node.create` requires a `object` string.');
            }
        }
      }

      throw new Error('`Node.create` only accepts objects or nodes but you passed it: ' + attrs);
    }

    /**
     * Create a list of `Nodes` from an array.
     *
     * @param {Array<Object|Node>} elements
     * @return {List<Node>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (immutable__WEBPACK_IMPORTED_MODULE_1__["List"].isList(elements) || Array.isArray(elements)) {
        var list = new immutable__WEBPACK_IMPORTED_MODULE_1__["List"](elements.map(Node.create));
        return list;
      }

      throw new Error('`Node.createList` only accepts lists or arrays, but you passed it: ' + elements);
    }

    /**
     * Create a dictionary of settable node properties from `attrs`.
     *
     * @param {Object|String|Node} attrs
     * @return {Object}
     */

  }, {
    key: 'createProperties',
    value: function createProperties() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Block.isBlock(attrs) || Inline.isInline(attrs)) {
        return {
          data: attrs.data,
          isVoid: attrs.isVoid,
          type: attrs.type
        };
      }

      if (typeof attrs == 'string') {
        return { type: attrs };
      }

      if (is_plain_object__WEBPACK_IMPORTED_MODULE_0___default()(attrs)) {
        var props = {};
        if ('type' in attrs) props.type = attrs.type;
        if ('data' in attrs) props.data = Data.create(attrs.data);
        if ('isVoid' in attrs) props.isVoid = attrs.isVoid;
        return props;
      }

      throw new Error('`Node.createProperties` only accepts objects, strings, blocks or inlines, but you passed it: ' + attrs);
    }

    /**
     * Create a `Node` from a JSON `value`.
     *
     * @param {Object} value
     * @return {Node}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(value) {
      var object = value.object;


      if (!object && value.kind) {
        slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
        object = value.kind;
      }

      switch (object) {
        case 'block':
          return Block.fromJSON(value);
        case 'document':
          return Document.fromJSON(value);
        case 'inline':
          return Inline.fromJSON(value);
        case 'text':
          return Text.fromJSON(value);
        default:
          {
            throw new Error('`Node.fromJSON` requires an `object` of either \'block\', \'document\', \'inline\' or \'text\', but you passed: ' + value);
          }
      }
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isNode',


    /**
     * Check if `any` is a `Node`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isNode(any) {
      return Block.isBlock(any) || Document.isDocument(any) || Inline.isInline(any) || Text.isText(any);
    }

    /**
     * Check if `any` is a list of nodes.
     *
     * @param {Any} any
     * @return {Boolean}
     */

  }, {
    key: 'isNodeList',
    value: function isNodeList(any) {
      return immutable__WEBPACK_IMPORTED_MODULE_1__["List"].isList(any) && any.every(function (item) {
        return Node.isNode(item);
      });
    }
  }]);
  return Node;
}();

/**
 * Assert a key `arg`.
 *
 * @param {String} arg
 * @return {String}
 */

Node.fromJS = Node.fromJSON;
function assertKey(arg) {
  if (typeof arg == 'string') return arg;
  throw new Error('Invalid `key` argument! It must be a key string, but you passed: ' + arg);
}

/**
 * Memoize read methods.
 */

memoize(Node.prototype, ['areDescendantsSorted', 'getAncestors', 'getBlocksAsArray', 'getBlocksAtRangeAsArray', 'getBlocksByTypeAsArray', 'getChild', 'getClosestBlock', 'getClosestInline', 'getClosestVoid', 'getCommonAncestor', 'getDecorations', 'getDepth', 'getDescendant', 'getDescendantAtPath', 'getFirstText', 'getFragmentAtRange', 'getFurthestBlock', 'getFurthestInline', 'getFurthestAncestor', 'getFurthestOnlyChildAncestor', 'getInlinesAsArray', 'getInlinesAtRangeAsArray', 'getInlinesByTypeAsArray', 'getMarksAsArray', 'getMarksAtPosition', 'getOrderedMarksBetweenPositions', 'getInsertMarksAtRange', 'getKeysAsArray', 'getLastText', 'getMarksByTypeAsArray', 'getNextBlock', 'getNextSibling', 'getNextText', 'getNode', 'getNodeAtPath', 'getOffset', 'getOffsetAtRange', 'getParent', 'getPath', 'getPlaceholder', 'getPreviousBlock', 'getPreviousSibling', 'getPreviousText', 'getText', 'getTextAtOffset', 'getTextDirection', 'getTextsAsArray', 'getTextsBetweenPositionsAsArray', 'isLeafBlock', 'isLeafInline', 'validate', 'getFirstInvalidDescendant']);

/**
 * Prevent circular dependencies.
 */

/**
 * Dependencies.
 */

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS$5 = {
  data: new immutable__WEBPACK_IMPORTED_MODULE_1__["Map"](),
  isVoid: false,
  key: undefined,
  nodes: new immutable__WEBPACK_IMPORTED_MODULE_1__["List"](),
  type: undefined

  /**
   * Inline.
   *
   * @type {Inline}
   */

};
var Inline = function (_Record) {
  inherits(Inline, _Record);

  function Inline() {
    classCallCheck(this, Inline);
    return possibleConstructorReturn(this, (Inline.__proto__ || Object.getPrototypeOf(Inline)).apply(this, arguments));
  }

  createClass(Inline, [{
    key: 'toJSON',


    /**
     * Return a JSON representation of the inline.
     *
     * @param {Object} options
     * @return {Object}
     */

    value: function toJSON() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var object = {
        object: this.object,
        type: this.type,
        isVoid: this.isVoid,
        data: this.data.toJSON(),
        nodes: this.nodes.toArray().map(function (n) {
          return n.toJSON(options);
        })
      };

      if (options.preserveKeys) {
        object.key = this.key;
      }

      return object;
    }

    /**
     * Alias `toJS`.
     */

  }, {
    key: 'toJS',
    value: function toJS(options) {
      return this.toJSON(options);
    }
  }, {
    key: 'object',


    /**
     * Object.
     *
     * @return {String}
     */

    get: function get$$1() {
      return 'inline';
    }
  }, {
    key: 'kind',
    get: function get$$1() {
      slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
      return this.object;
    }

    /**
     * Check if the inline is empty.
     * Returns true if inline is not void and all it's children nodes are empty.
     * Void node is never empty, regardless of it's content.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isEmpty',
    get: function get$$1() {
      return !this.isVoid && !this.nodes.some(function (child) {
        return !child.isEmpty;
      });
    }

    /**
     * Get the concatenated text of all the inline's children.
     *
     * @return {String}
     */

  }, {
    key: 'text',
    get: function get$$1() {
      return this.getText();
    }
  }], [{
    key: 'create',

    /**
     * Create a new `Inline` with `attrs`.
     *
     * @param {Object|String|Inline} attrs
     * @return {Inline}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Inline.isInline(attrs)) {
        return attrs;
      }

      if (typeof attrs == 'string') {
        attrs = { type: attrs };
      }

      if (is_plain_object__WEBPACK_IMPORTED_MODULE_0___default()(attrs)) {
        return Inline.fromJSON(attrs);
      }

      throw new Error('`Inline.create` only accepts objects, strings or inlines, but you passed it: ' + attrs);
    }

    /**
     * Create a list of `Inlines` from an array.
     *
     * @param {Array<Inline|Object>|List<Inline|Object>} elements
     * @return {List<Inline>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (immutable__WEBPACK_IMPORTED_MODULE_1__["List"].isList(elements) || Array.isArray(elements)) {
        var list = new immutable__WEBPACK_IMPORTED_MODULE_1__["List"](elements.map(Inline.create));
        return list;
      }

      throw new Error('`Inline.createList` only accepts arrays or lists, but you passed it: ' + elements);
    }

    /**
     * Create a `Inline` from a JSON `object`.
     *
     * @param {Object|Inline} object
     * @return {Inline}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      if (Inline.isInline(object)) {
        return object;
      }

      var _object$data = object.data,
          data = _object$data === undefined ? {} : _object$data,
          _object$isVoid = object.isVoid,
          isVoid = _object$isVoid === undefined ? false : _object$isVoid,
          _object$key = object.key,
          key = _object$key === undefined ? generateKey() : _object$key,
          _object$nodes = object.nodes,
          nodes = _object$nodes === undefined ? [] : _object$nodes,
          type = object.type;


      if (typeof type != 'string') {
        throw new Error('`Inline.fromJS` requires a `type` string.');
      }

      var inline = new Inline({
        key: key,
        type: type,
        isVoid: !!isVoid,
        data: new immutable__WEBPACK_IMPORTED_MODULE_1__["Map"](data),
        nodes: new immutable__WEBPACK_IMPORTED_MODULE_1__["List"](nodes.map(Node.fromJSON))
      });

      return inline;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isInline',


    /**
     * Check if `any` is a `Inline`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isInline(any) {
      return !!(any && any[MODEL_TYPES.INLINE]);
    }

    /**
     * Check if `any` is a list of inlines.
     *
     * @param {Any} any
     * @return {Boolean}
     */

  }, {
    key: 'isInlineList',
    value: function isInlineList(any) {
      return immutable__WEBPACK_IMPORTED_MODULE_1__["List"].isList(any) && any.every(function (item) {
        return Inline.isInline(item);
      });
    }
  }]);
  return Inline;
}(Object(immutable__WEBPACK_IMPORTED_MODULE_1__["Record"])(DEFAULTS$5));

/**
 * Attach a pseudo-symbol for type checking.
 */

Inline.fromJS = Inline.fromJSON;
Inline.prototype[MODEL_TYPES.INLINE] = true;

/**
 * Mix in `Node` methods.
 */

Object.getOwnPropertyNames(Node.prototype).forEach(function (method) {
  if (method == 'constructor') return;
  Inline.prototype[method] = Node.prototype[method];
});

/**
 * Prevent circular dependencies.
 */

/**
 * Dependencies.
 */

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS$6 = {
  data: new immutable__WEBPACK_IMPORTED_MODULE_1__["Map"](),
  key: undefined,
  nodes: new immutable__WEBPACK_IMPORTED_MODULE_1__["List"]()

  /**
   * Document.
   *
   * @type {Document}
   */

};
var Document = function (_Record) {
  inherits(Document, _Record);

  function Document() {
    classCallCheck(this, Document);
    return possibleConstructorReturn(this, (Document.__proto__ || Object.getPrototypeOf(Document)).apply(this, arguments));
  }

  createClass(Document, [{
    key: 'toJSON',


    /**
     * Return a JSON representation of the document.
     *
     * @param {Object} options
     * @return {Object}
     */

    value: function toJSON() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var object = {
        object: this.object,
        data: this.data.toJSON(),
        nodes: this.nodes.toArray().map(function (n) {
          return n.toJSON(options);
        })
      };

      if (options.preserveKeys) {
        object.key = this.key;
      }

      return object;
    }

    /**
     * Alias `toJS`.
     */

  }, {
    key: 'toJS',
    value: function toJS(options) {
      return this.toJSON(options);
    }
  }, {
    key: 'object',


    /**
     * Object.
     *
     * @return {String}
     */

    get: function get$$1() {
      return 'document';
    }
  }, {
    key: 'kind',
    get: function get$$1() {
      slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
      return this.object;
    }

    /**
     * Check if the document is empty.
     * Returns true if all it's children nodes are empty.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isEmpty',
    get: function get$$1() {
      return !this.nodes.some(function (child) {
        return !child.isEmpty;
      });
    }

    /**
     * Get the concatenated text of all the document's children.
     *
     * @return {String}
     */

  }, {
    key: 'text',
    get: function get$$1() {
      return this.getText();
    }
  }], [{
    key: 'create',

    /**
     * Create a new `Document` with `attrs`.
     *
     * @param {Object|Array|List|Text} attrs
     * @return {Document}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Document.isDocument(attrs)) {
        return attrs;
      }

      if (immutable__WEBPACK_IMPORTED_MODULE_1__["List"].isList(attrs) || Array.isArray(attrs)) {
        attrs = { nodes: attrs };
      }

      if (is_plain_object__WEBPACK_IMPORTED_MODULE_0___default()(attrs)) {
        return Document.fromJSON(attrs);
      }

      throw new Error('`Document.create` only accepts objects, arrays, lists or documents, but you passed it: ' + attrs);
    }

    /**
     * Create a `Document` from a JSON `object`.
     *
     * @param {Object|Document} object
     * @return {Document}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      if (Document.isDocument(object)) {
        return object;
      }

      var _object$data = object.data,
          data = _object$data === undefined ? {} : _object$data,
          _object$key = object.key,
          key = _object$key === undefined ? generateKey() : _object$key,
          _object$nodes = object.nodes,
          nodes = _object$nodes === undefined ? [] : _object$nodes;


      var document = new Document({
        key: key,
        data: new immutable__WEBPACK_IMPORTED_MODULE_1__["Map"](data),
        nodes: new immutable__WEBPACK_IMPORTED_MODULE_1__["List"](nodes.map(Node.fromJSON))
      });

      return document;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isDocument',


    /**
     * Check if `any` is a `Document`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isDocument(any) {
      return !!(any && any[MODEL_TYPES.DOCUMENT]);
    }
  }]);
  return Document;
}(Object(immutable__WEBPACK_IMPORTED_MODULE_1__["Record"])(DEFAULTS$6));

/**
 * Attach a pseudo-symbol for type checking.
 */

Document.fromJS = Document.fromJSON;
Document.prototype[MODEL_TYPES.DOCUMENT] = true;

/**
 * Mix in `Node` methods.
 */

Object.getOwnPropertyNames(Node.prototype).forEach(function (method) {
  if (method == 'constructor') return;
  Document.prototype[method] = Node.prototype[method];
});

/**
 * Prevent circular dependencies.
 */

/**
 * Dependencies.
 */

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS$7 = {
  data: new immutable__WEBPACK_IMPORTED_MODULE_1__["Map"](),
  isVoid: false,
  key: undefined,
  nodes: new immutable__WEBPACK_IMPORTED_MODULE_1__["List"](),
  type: undefined

  /**
   * Block.
   *
   * @type {Block}
   */

};
var Block = function (_Record) {
  inherits(Block, _Record);

  function Block() {
    classCallCheck(this, Block);
    return possibleConstructorReturn(this, (Block.__proto__ || Object.getPrototypeOf(Block)).apply(this, arguments));
  }

  createClass(Block, [{
    key: 'toJSON',


    /**
     * Return a JSON representation of the block.
     *
     * @param {Object} options
     * @return {Object}
     */

    value: function toJSON() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var object = {
        object: this.object,
        type: this.type,
        isVoid: this.isVoid,
        data: this.data.toJSON(),
        nodes: this.nodes.toArray().map(function (n) {
          return n.toJSON(options);
        })
      };

      if (options.preserveKeys) {
        object.key = this.key;
      }

      return object;
    }

    /**
     * Alias `toJS`.
     */

  }, {
    key: 'toJS',
    value: function toJS(options) {
      return this.toJSON(options);
    }
  }, {
    key: 'object',


    /**
     * Object.
     *
     * @return {String}
     */

    get: function get$$1() {
      return 'block';
    }
  }, {
    key: 'kind',
    get: function get$$1() {
      slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
      return this.object;
    }

    /**
     * Check if the block is empty.
     * Returns true if block is not void and all it's children nodes are empty.
     * Void node is never empty, regardless of it's content.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isEmpty',
    get: function get$$1() {
      return !this.isVoid && !this.nodes.some(function (child) {
        return !child.isEmpty;
      });
    }

    /**
     * Get the concatenated text of all the block's children.
     *
     * @return {String}
     */

  }, {
    key: 'text',
    get: function get$$1() {
      return this.getText();
    }
  }], [{
    key: 'create',

    /**
     * Create a new `Block` from `attrs`.
     *
     * @param {Object|String|Block} attrs
     * @return {Block}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Block.isBlock(attrs)) {
        return attrs;
      }

      if (typeof attrs == 'string') {
        attrs = { type: attrs };
      }

      if (is_plain_object__WEBPACK_IMPORTED_MODULE_0___default()(attrs)) {
        return Block.fromJSON(attrs);
      }

      throw new Error('`Block.create` only accepts objects, strings or blocks, but you passed it: ' + attrs);
    }

    /**
     * Create a list of `Blocks` from `attrs`.
     *
     * @param {Array<Block|Object>|List<Block|Object>} attrs
     * @return {List<Block>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (immutable__WEBPACK_IMPORTED_MODULE_1__["List"].isList(attrs) || Array.isArray(attrs)) {
        var list = new immutable__WEBPACK_IMPORTED_MODULE_1__["List"](attrs.map(Block.create));
        return list;
      }

      throw new Error('`Block.createList` only accepts arrays or lists, but you passed it: ' + attrs);
    }

    /**
     * Create a `Block` from a JSON `object`.
     *
     * @param {Object|Block} object
     * @return {Block}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      if (Block.isBlock(object)) {
        return object;
      }

      var _object$data = object.data,
          data = _object$data === undefined ? {} : _object$data,
          _object$isVoid = object.isVoid,
          isVoid = _object$isVoid === undefined ? false : _object$isVoid,
          _object$key = object.key,
          key = _object$key === undefined ? generateKey() : _object$key,
          _object$nodes = object.nodes,
          nodes = _object$nodes === undefined ? [] : _object$nodes,
          type = object.type;


      if (typeof type != 'string') {
        throw new Error('`Block.fromJSON` requires a `type` string.');
      }

      var block = new Block({
        key: key,
        type: type,
        isVoid: !!isVoid,
        data: new immutable__WEBPACK_IMPORTED_MODULE_1__["Map"](data),
        nodes: new immutable__WEBPACK_IMPORTED_MODULE_1__["List"](nodes.map(Node.fromJSON))
      });

      return block;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isBlock',


    /**
     * Check if `any` is a `Block`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isBlock(any) {
      return !!(any && any[MODEL_TYPES.BLOCK]);
    }

    /**
     * Check if `any` is a block list.
     *
     * @param {Any} any
     * @return {Boolean}
     */

  }, {
    key: 'isBlockList',
    value: function isBlockList(any) {
      return immutable__WEBPACK_IMPORTED_MODULE_1__["List"].isList(any) && any.every(function (item) {
        return Block.isBlock(item);
      });
    }
  }]);
  return Block;
}(Object(immutable__WEBPACK_IMPORTED_MODULE_1__["Record"])(DEFAULTS$7));

/**
 * Attach a pseudo-symbol for type checking.
 */

Block.fromJS = Block.fromJSON;
Block.prototype[MODEL_TYPES.BLOCK] = true;

/**
 * Mix in `Node` methods.
 */

Object.getOwnPropertyNames(Node.prototype).forEach(function (method) {
  if (method == 'constructor') return;
  Block.prototype[method] = Node.prototype[method];
});

/**
 * Changes.
 *
 * @type {Object}
 */

var Changes = {};

/**
 * Mix in the changes that pass through to their at-range equivalents because
 * they don't have any effect on the selection.
 */

var PROXY_TRANSFORMS = ['deleteBackward', 'deleteCharBackward', 'deleteLineBackward', 'deleteWordBackward', 'deleteForward', 'deleteCharForward', 'deleteWordForward', 'deleteLineForward', 'setBlocks', 'setInlines', 'splitInline', 'unwrapBlock', 'unwrapInline', 'wrapBlock', 'wrapInline'];

PROXY_TRANSFORMS.forEach(function (method) {
  Changes[method] = function (change) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var value = change.value;
    var selection = value.selection;

    var methodAtRange = method + 'AtRange';
    change[methodAtRange].apply(change, [selection].concat(args));
    if (method.match(/Backward$/)) {
      change.collapseToStart();
    } else if (method.match(/Forward$/)) {
      change.collapseToEnd();
    }
  };
});

Changes.setBlock = function () {
  slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].deprecate('slate@0.33.0', 'The `setBlock` method of Slate changes has been renamed to `setBlocks`.');
  Changes.setBlocks.apply(Changes, arguments);
};

Changes.setInline = function () {
  slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].deprecate('slate@0.33.0', 'The `setInline` method of Slate changes has been renamed to `setInlines`.');
  Changes.setInlines.apply(Changes, arguments);
};

/**
 * Add a `mark` to the characters in the current selection.
 *
 * @param {Change} change
 * @param {Mark} mark
 */

Changes.addMark = function (change, mark) {
  mark = Mark.create(mark);
  var value = change.value;
  var document = value.document,
      selection = value.selection;


  if (selection.isExpanded) {
    change.addMarkAtRange(selection, mark);
  } else if (selection.marks) {
    var marks = selection.marks.add(mark);
    var sel = selection.set('marks', marks);
    change.select(sel);
  } else {
    var _marks = document.getActiveMarksAtRange(selection).add(mark);
    var _sel = selection.set('marks', _marks);
    change.select(_sel);
  }
};

/**
 * Add a list of `marks` to the characters in the current selection.
 *
 * @param {Change} change
 * @param {Mark} mark
 */

Changes.addMarks = function (change, marks) {
  marks.forEach(function (mark) {
    return change.addMark(mark);
  });
};

/**
 * Delete at the current selection.
 *
 * @param {Change} change
 */

Changes.delete = function (change) {
  var value = change.value;
  var selection = value.selection;

  change.deleteAtRange(selection);

  // Ensure that the selection is collapsed to the start, because in certain
  // cases when deleting across inline nodes, when splitting the inline node the
  // end point of the selection will end up after the split point.
  change.collapseToStart();
};

/**
 * Insert a `block` at the current selection.
 *
 * @param {Change} change
 * @param {String|Object|Block} block
 */

Changes.insertBlock = function (change, block) {
  block = Block.create(block);
  var value = change.value;
  var selection = value.selection;

  change.insertBlockAtRange(selection, block);

  // If the node was successfully inserted, update the selection.
  var node = change.value.document.getNode(block.key);
  if (node) change.collapseToEndOf(node);
};

/**
 * Insert a `fragment` at the current selection.
 *
 * @param {Change} change
 * @param {Document} fragment
 */

Changes.insertFragment = function (change, fragment) {
  if (!fragment.nodes.size) return;

  var value = change.value;
  var _value = value,
      document = _value.document,
      selection = _value.selection;
  var _value2 = value,
      startText = _value2.startText,
      endText = _value2.endText,
      startInline = _value2.startInline;

  var lastText = fragment.getLastText();
  var lastInline = fragment.getClosestInline(lastText.key);
  var firstChild = fragment.nodes.first();
  var lastChild = fragment.nodes.last();
  var keys = document.getTexts().map(function (text) {
    return text.key;
  });
  var isAppending = !startInline || selection.hasEdgeAtStartOf(startText) || selection.hasEdgeAtEndOf(endText);

  var isInserting = fragment.hasBlocks(firstChild.key) || fragment.hasBlocks(lastChild.key);

  change.insertFragmentAtRange(selection, fragment);
  value = change.value;
  document = value.document;

  var newTexts = document.getTexts().filter(function (n) {
    return !keys.includes(n.key);
  });
  var newText = isAppending ? newTexts.last() : newTexts.takeLast(2).first();

  if (newText && lastInline || isInserting) {
    change.select(selection.collapseToEndOf(newText));
  } else if (newText) {
    change.select(selection.collapseToStartOf(newText).move(lastText.text.length));
  } else {
    change.select(selection.collapseToStart().move(lastText.text.length));
  }
};

/**
 * Insert an `inline` at the current selection.
 *
 * @param {Change} change
 * @param {String|Object|Inline} inline
 */

Changes.insertInline = function (change, inline) {
  inline = Inline.create(inline);
  var value = change.value;
  var selection = value.selection;

  change.insertInlineAtRange(selection, inline);

  // If the node was successfully inserted, update the selection.
  var node = change.value.document.getNode(inline.key);
  if (node) change.collapseToEndOf(node);
};

/**
 * Insert a string of `text` with optional `marks` at the current selection.
 *
 * @param {Change} change
 * @param {String} text
 * @param {Set<Mark>} marks (optional)
 */

Changes.insertText = function (change, text, marks) {
  var value = change.value;
  var document = value.document,
      selection = value.selection;

  marks = marks || selection.marks || document.getInsertMarksAtRange(selection);
  change.insertTextAtRange(selection, text, marks);

  // If the text was successfully inserted, and the selection had marks on it,
  // unset the selection's marks.
  if (selection.marks && document != change.value.document) {
    change.select({ marks: null });
  }
};

/**
 * Split the block node at the current selection, to optional `depth`.
 *
 * @param {Change} change
 * @param {Number} depth (optional)
 */

Changes.splitBlock = function (change) {
  var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var value = change.value;
  var selection = value.selection,
      document = value.document;

  var marks = selection.marks || document.getInsertMarksAtRange(selection);
  change.splitBlockAtRange(selection, depth).collapseToEnd();
  if (marks && marks.size !== 0) {
    change.select({ marks: marks });
  }
};

/**
 * Remove a `mark` from the characters in the current selection.
 *
 * @param {Change} change
 * @param {Mark} mark
 */

Changes.removeMark = function (change, mark) {
  mark = Mark.create(mark);
  var value = change.value;
  var document = value.document,
      selection = value.selection;


  if (selection.isExpanded) {
    change.removeMarkAtRange(selection, mark);
  } else if (selection.marks) {
    var marks = selection.marks.remove(mark);
    var sel = selection.set('marks', marks);
    change.select(sel);
  } else {
    var _marks2 = document.getActiveMarksAtRange(selection).remove(mark);
    var _sel2 = selection.set('marks', _marks2);
    change.select(_sel2);
  }
};

/**
 * Add or remove a `mark` from the characters in the current selection,
 * depending on whether it's already there.
 *
 * @param {Change} change
 * @param {Mark} mark
 */

Changes.toggleMark = function (change, mark) {
  mark = Mark.create(mark);
  var value = change.value;

  var exists = value.activeMarks.has(mark);

  if (exists) {
    change.removeMark(mark);
  } else {
    change.addMark(mark);
  }
};

/**
 * Wrap the current selection with prefix/suffix.
 *
 * @param {Change} change
 * @param {String} prefix
 * @param {String} suffix
 */

Changes.wrapText = function (change, prefix) {
  var suffix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : prefix;
  var value = change.value;
  var selection = value.selection;

  change.wrapTextAtRange(selection, prefix, suffix);

  // If the selection was collapsed, it will have moved the start offset too.
  if (selection.isCollapsed) {
    change.moveStart(0 - prefix.length);
  }

  // Adding the suffix will have pushed the end of the selection further on, so
  // we need to move it back to account for this.
  change.moveEnd(0 - suffix.length);

  // There's a chance that the selection points moved "through" each other,
  // resulting in a now-incorrect selection direction.
  if (selection.isForward != change.value.selection.isForward) {
    change.flip();
  }
};

/**
 * Surrogate pair start and end points.
 *
 * @type {Number}
 */

var SURROGATE_START = 0xd800;
var SURROGATE_END = 0xdfff;

/**
 * A regex to match space characters.
 *
 * @type {RegExp}
 */

var SPACE = /\s/;

/**
 * A regex to match chameleon characters, that count as word characters as long
 * as they are inside of a word.
 *
 * @type {RegExp}
 */

var CHAMELEON = /['\u2018\u2019]/;

/**
 * A regex that matches punctuation.
 *
 * @type {RegExp}
 */

var PUNCTUATION = /[\u0021-\u0023\u0025-\u002A\u002C-\u002F\u003A\u003B\u003F\u0040\u005B-\u005D\u005F\u007B\u007D\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E3B\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]/;

/**
 * Is a character `code` in a surrogate character.
 *
 * @param {Number} code
 * @return {Boolean}
 */

function isSurrogate(code) {
  return SURROGATE_START <= code && code <= SURROGATE_END;
}

/**
 * Is a character a word character? Needs the `remaining` characters too.
 *
 * @param {String} char
 * @param {String|Void} remaining
 * @return {Boolean}
 */

function isWord(char, remaining) {
  if (SPACE.test(char)) return false;

  // If it's a chameleon character, recurse to see if the next one is or not.
  if (CHAMELEON.test(char)) {
    var next = remaining.charAt(0);
    var length = getCharLength(next);
    next = remaining.slice(0, length);
    var rest = remaining.slice(length);
    if (isWord(next, rest)) return true;
  }

  if (PUNCTUATION.test(char)) return false;
  return true;
}

/**
 * Get the length of a `character`.
 *
 * @param {String} char
 * @return {Number}
 */

function getCharLength(char) {
  return isSurrogate(char.charCodeAt(0)) ? 2 : 1;
}

/**
 * Get the offset to the end of the first character in `text`.
 *
 * @param {String} text
 * @return {Number}
 */

function getCharOffset(text) {
  var char = text.charAt(0);
  return getCharLength(char);
}

/**
 * Get the offset to the end of the character before an `offset` in `text`.
 *
 * @param {String} text
 * @param {Number} offset
 * @return {Number}
 */

function getCharOffsetBackward(text, offset) {
  text = text.slice(0, offset);
  text = Object(esrever__WEBPACK_IMPORTED_MODULE_4__["reverse"])(text);
  return getCharOffset(text);
}

/**
 * Get the offset to the end of the character after an `offset` in `text`.
 *
 * @param {String} text
 * @param {Number} offset
 * @return {Number}
 */

function getCharOffsetForward(text, offset) {
  text = text.slice(offset);
  return getCharOffset(text);
}

/**
 * Get the offset to the end of the first word in `text`.
 *
 * @param {String} text
 * @return {Number}
 */

function getWordOffset(text) {
  var length = 0;
  var i = 0;
  var started = false;
  var char = void 0;

  while (char = text.charAt(i)) {
    var l = getCharLength(char);
    char = text.slice(i, i + l);
    var rest = text.slice(i + l);

    if (isWord(char, rest)) {
      started = true;
      length += l;
    } else if (!started) {
      length += l;
    } else {
      break;
    }

    i += l;
  }

  return length;
}

/**
 * Get the offset to the end of the word before an `offset` in `text`.
 *
 * @param {String} text
 * @param {Number} offset
 * @return {Number}
 */

function getWordOffsetBackward(text, offset) {
  text = text.slice(0, offset);
  text = Object(esrever__WEBPACK_IMPORTED_MODULE_4__["reverse"])(text);
  var o = getWordOffset(text);
  return o;
}

/**
 * Get the offset to the end of the word after an `offset` in `text`.
 *
 * @param {String} text
 * @param {Number} offset
 * @return {Number}
 */

function getWordOffsetForward(text, offset) {
  text = text.slice(offset);
  var o = getWordOffset(text);
  return o;
}

/**
 * Export.
 *
 * @type {Object}
 */

var String = {
  getCharOffsetForward: getCharOffsetForward,
  getCharOffsetBackward: getCharOffsetBackward,
  getWordOffsetBackward: getWordOffsetBackward,
  getWordOffsetForward: getWordOffsetForward
};

/**
 * Changes.
 *
 * @type {Object}
 */

var Changes$1 = {};

/**
 * Add a new `mark` to the characters at `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Mixed} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.addMarkAtRange = function (change, range, mark) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  if (range.isCollapsed) return;

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;

  var texts = document.getTextsAtRange(range);

  texts.forEach(function (node) {
    var key = node.key;

    var index = 0;
    var length = node.text.length;

    if (key == startKey) index = startOffset;
    if (key == endKey) length = endOffset;
    if (key == startKey && key == endKey) length = endOffset - startOffset;

    change.addMarkByKey(key, index, length, mark, { normalize: normalize });
  });
};

/**
 * Add a list of `marks` to the characters at `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Array<Mixed>} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.addMarksAtRange = function (change, range, marks) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  marks.forEach(function (mark) {
    return change.addMarkAtRange(range, mark, options);
  });
};

/**
 * Delete everything in a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.deleteAtRange = function (change, range) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (range.isCollapsed) return;

  // Snapshot the selection, which creates an extra undo save point, so that
  // when you undo a delete, the expanded selection will be retained.
  change.snapshotSelection();

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;
  var document = value.document;

  var isStartVoid = document.hasVoidParent(startKey);
  var isEndVoid = document.hasVoidParent(endKey);
  var startBlock = document.getClosestBlock(startKey);
  var endBlock = document.getClosestBlock(endKey);

  // Check if we have a "hanging" selection case where the even though the
  // selection extends into the start of the end node, we actually want to
  // ignore that for UX reasons.
  var isHanging = startOffset == 0 && endOffset == 0 && isStartVoid == false && startKey == startBlock.getFirstText().key && endKey == endBlock.getFirstText().key;

  // If it's a hanging selection, nudge it back to end in the previous text.
  if (isHanging && isEndVoid) {
    var prevText = document.getPreviousText(endKey);
    endKey = prevText.key;
    endOffset = prevText.text.length;
    isEndVoid = document.hasVoidParent(endKey);
  }

  // If the start node is inside a void node, remove the void node and update
  // the starting point to be right after it, continuously until the start point
  // is not a void, or until the entire range is handled.
  while (isStartVoid) {
    var startVoid = document.getClosestVoid(startKey);
    var nextText = document.getNextText(startKey);
    change.removeNodeByKey(startVoid.key, { normalize: false });

    // If the start and end keys are the same, we're done.
    if (startKey == endKey) return;

    // If there is no next text node, we're done.
    if (!nextText) return;

    // Continue...
    document = change.value.document;
    startKey = nextText.key;
    startOffset = 0;
    isStartVoid = document.hasVoidParent(startKey);
  }

  // If the end node is inside a void node, do the same thing but backwards. But
  // we don't need any aborting checks because if we've gotten this far there
  // must be a non-void node that will exit the loop.
  while (isEndVoid) {
    var endVoid = document.getClosestVoid(endKey);
    var _prevText = document.getPreviousText(endKey);
    change.removeNodeByKey(endVoid.key, { normalize: false });

    // Continue...
    document = change.value.document;
    endKey = _prevText.key;
    endOffset = _prevText.text.length;
    isEndVoid = document.hasVoidParent(endKey);
  }

  // If the start and end key are the same, and it was a hanging selection, we
  // can just remove the entire block.
  if (startKey == endKey && isHanging) {
    change.removeNodeByKey(startBlock.key, { normalize: normalize });
    return;
  } else if (startKey == endKey) {
    // Otherwise, if it wasn't hanging, we're inside a single text node, so we can
    // simply remove the text in the range.
    var index = startOffset;
    var length = endOffset - startOffset;
    change.removeTextByKey(startKey, index, length, { normalize: normalize });
    return;
  } else {
    // Otherwise, we need to recursively remove text and nodes inside the start
    // block after the start offset and inside the end block before the end
    // offset. Then remove any blocks that are in between the start and end
    // blocks. Then finally merge the start and end nodes.
    startBlock = document.getClosestBlock(startKey);
    endBlock = document.getClosestBlock(endKey);
    var startText = document.getNode(startKey);
    var endText = document.getNode(endKey);
    var startLength = startText.text.length - startOffset;
    var endLength = endOffset;

    var ancestor = document.getCommonAncestor(startKey, endKey);
    var startChild = ancestor.getFurthestAncestor(startKey);
    var endChild = ancestor.getFurthestAncestor(endKey);

    var startParent = document.getParent(startBlock.key);
    var startParentIndex = startParent.nodes.indexOf(startBlock);
    var endParentIndex = startParent.nodes.indexOf(endBlock);

    var child = void 0;

    // Iterate through all of the nodes in the tree after the start text node
    // but inside the end child, and remove them.
    child = startText;

    while (child.key != startChild.key) {
      var parent = document.getParent(child.key);
      var _index = parent.nodes.indexOf(child);
      var afters = parent.nodes.slice(_index + 1);

      afters.reverse().forEach(function (node) {
        change.removeNodeByKey(node.key, { normalize: false });
      });

      child = parent;
    }

    // Remove all of the middle children.
    var startChildIndex = ancestor.nodes.indexOf(startChild);
    var endChildIndex = ancestor.nodes.indexOf(endChild);
    var middles = ancestor.nodes.slice(startChildIndex + 1, endChildIndex);

    middles.reverse().forEach(function (node) {
      change.removeNodeByKey(node.key, { normalize: false });
    });

    // Remove the nodes before the end text node in the tree.
    child = endText;

    while (child.key != endChild.key) {
      var _parent = document.getParent(child.key);
      var _index2 = _parent.nodes.indexOf(child);
      var befores = _parent.nodes.slice(0, _index2);

      befores.reverse().forEach(function (node) {
        change.removeNodeByKey(node.key, { normalize: false });
      });

      child = _parent;
    }

    // Remove any overlapping text content from the leaf text nodes.
    if (startLength != 0) {
      change.removeTextByKey(startKey, startOffset, startLength, {
        normalize: false
      });
    }

    if (endLength != 0) {
      change.removeTextByKey(endKey, 0, endOffset, { normalize: false });
    }

    // If the start and end blocks aren't the same, move and merge the end block
    // into the start block.
    if (startBlock.key != endBlock.key) {
      document = change.value.document;
      var lonely = document.getFurthestOnlyChildAncestor(endBlock.key);

      // Move the end block to be right after the start block.
      if (endParentIndex != startParentIndex + 1) {
        change.moveNodeByKey(endBlock.key, startParent.key, startParentIndex + 1, { normalize: false });
      }

      // If the selection is hanging, just remove the start block, otherwise
      // merge the end block into it.
      if (isHanging) {
        change.removeNodeByKey(startBlock.key, { normalize: false });
      } else {
        change.mergeNodeByKey(endBlock.key, { normalize: false });
      }

      // If nested empty blocks are left over above the end block, remove them.
      if (lonely) {
        change.removeNodeByKey(lonely.key, { normalize: false });
      }
    }

    // If we should normalize, do it now after everything.
    if (normalize) {
      change.normalizeNodeByKey(ancestor.key);
    }
  }
};

/**
 * Delete backward until the character boundary at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.deleteCharBackwardAtRange = function (change, range, options) {
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  var text = startBlock.text;

  var n = String.getCharOffsetBackward(text, o);
  change.deleteBackwardAtRange(range, n, options);
};

/**
 * Delete backward until the line boundary at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.deleteLineBackwardAtRange = function (change, range, options) {
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  change.deleteBackwardAtRange(range, o, options);
};

/**
 * Delete backward until the word boundary at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.deleteWordBackwardAtRange = function (change, range, options) {
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  var text = startBlock.text;

  var n = String.getWordOffsetBackward(text, o);
  change.deleteBackwardAtRange(range, n, options);
};

/**
 * Delete backward `n` characters at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Number} n (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.deleteBackwardAtRange = function (change, range) {
  var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;
  var _range = range,
      startKey = _range.startKey,
      focusOffset = _range.focusOffset;

  // If the range is expanded, perform a regular delete instead.

  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: normalize });
    return;
  }

  var voidParent = document.getClosestVoid(startKey);

  // If there is a void parent, delete it.
  if (voidParent) {
    change.removeNodeByKey(voidParent.key, { normalize: normalize });
    return;
  }

  var block = document.getClosestBlock(startKey);

  // If the closest is not void, but empty, remove it
  if (block && block.isEmpty && document.nodes.size !== 1) {
    change.removeNodeByKey(block.key, { normalize: normalize });
    return;
  }

  // If the range is at the start of the document, abort.
  if (range.isAtStartOf(document)) {
    return;
  }

  // If the range is at the start of the text node, we need to figure out what
  // is behind it to know how to delete...
  var text = document.getDescendant(startKey);
  if (range.isAtStartOf(text)) {
    var prev = document.getPreviousText(text.key);
    var prevBlock = document.getClosestBlock(prev.key);
    var prevVoid = document.getClosestVoid(prev.key);

    // If the previous text node has a void parent, remove it.
    if (prevVoid) {
      change.removeNodeByKey(prevVoid.key, { normalize: normalize });
      return;
    }

    // If we're deleting by one character and the previous text node is not
    // inside the current block, we need to merge the two blocks together.
    if (n == 1 && prevBlock != block) {
      range = range.merge({
        anchorKey: prev.key,
        anchorOffset: prev.text.length
      });

      change.deleteAtRange(range, { normalize: normalize });
      return;
    }
  }

  // If the focus offset is farther than the number of characters to delete,
  // just remove the characters backwards inside the current node.
  if (n < focusOffset) {
    range = range.merge({
      focusOffset: focusOffset - n,
      isBackward: true
    });

    change.deleteAtRange(range, { normalize: normalize });
    return;
  }

  // Otherwise, we need to see how many nodes backwards to go.
  var node = text;
  var offset = 0;
  var traversed = focusOffset;

  while (n > traversed) {
    node = document.getPreviousText(node.key);
    var next = traversed + node.text.length;
    if (n <= next) {
      offset = next - n;
      break;
    } else {
      traversed = next;
    }
  }

  range = range.merge({
    focusKey: node.key,
    focusOffset: offset,
    isBackward: true
  });

  change.deleteAtRange(range, { normalize: normalize });
};

/**
 * Delete forward until the character boundary at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.deleteCharForwardAtRange = function (change, range, options) {
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  var text = startBlock.text;

  var n = String.getCharOffsetForward(text, o);
  change.deleteForwardAtRange(range, n, options);
};

/**
 * Delete forward until the line boundary at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.deleteLineForwardAtRange = function (change, range, options) {
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  change.deleteForwardAtRange(range, o, options);
};

/**
 * Delete forward until the word boundary at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.deleteWordForwardAtRange = function (change, range, options) {
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  var text = startBlock.text;

  var n = String.getWordOffsetForward(text, o);
  change.deleteForwardAtRange(range, n, options);
};

/**
 * Delete forward `n` characters at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Number} n (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.deleteForwardAtRange = function (change, range) {
  var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;
  var _range2 = range,
      startKey = _range2.startKey,
      focusOffset = _range2.focusOffset;

  // If the range is expanded, perform a regular delete instead.

  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: normalize });
    return;
  }

  var voidParent = document.getClosestVoid(startKey);

  // If the node has a void parent, delete it.
  if (voidParent) {
    change.removeNodeByKey(voidParent.key, { normalize: normalize });
    return;
  }

  var block = document.getClosestBlock(startKey);

  // If the closest is not void, but empty, remove it
  if (block && block.isEmpty && document.nodes.size !== 1) {
    var nextBlock = document.getNextBlock(block.key);
    change.removeNodeByKey(block.key, { normalize: normalize });
    if (nextBlock && nextBlock.key) {
      change.moveToStartOf(nextBlock);
    }
    return;
  }

  // If the range is at the start of the document, abort.
  if (range.isAtEndOf(document)) {
    return;
  }

  // If the range is at the start of the text node, we need to figure out what
  // is behind it to know how to delete...
  var text = document.getDescendant(startKey);
  if (range.isAtEndOf(text)) {
    var next = document.getNextText(text.key);
    var _nextBlock = document.getClosestBlock(next.key);
    var nextVoid = document.getClosestVoid(next.key);

    // If the next text node has a void parent, remove it.
    if (nextVoid) {
      change.removeNodeByKey(nextVoid.key, { normalize: normalize });
      return;
    }

    // If we're deleting by one character and the previous text node is not
    // inside the current block, we need to merge the two blocks together.
    if (n == 1 && _nextBlock != block) {
      range = range.merge({
        focusKey: next.key,
        focusOffset: 0
      });

      change.deleteAtRange(range, { normalize: normalize });
      return;
    }
  }

  // If the remaining characters to the end of the node is greater than or equal
  // to the number of characters to delete, just remove the characters forwards
  // inside the current node.
  if (n <= text.text.length - focusOffset) {
    range = range.merge({
      focusOffset: focusOffset + n
    });

    change.deleteAtRange(range, { normalize: normalize });
    return;
  }

  // Otherwise, we need to see how many nodes forwards to go.
  var node = text;
  var offset = focusOffset;
  var traversed = text.text.length - focusOffset;

  while (n > traversed) {
    node = document.getNextText(node.key);
    var _next = traversed + node.text.length;
    if (n <= _next) {
      offset = n - traversed;
      break;
    } else {
      traversed = _next;
    }
  }

  // If the focus node is inside a void, go up until right before it.
  if (document.hasVoidParent(node.key)) {
    var parent = document.getClosestVoid(node.key);
    node = document.getPreviousText(parent.key);
    offset = node.text.length;
  }

  range = range.merge({
    focusKey: node.key,
    focusOffset: offset
  });

  change.deleteAtRange(range, { normalize: normalize });
};

/**
 * Insert a `block` node at `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Block|String|Object} block
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.insertBlockAtRange = function (change, range, block) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  block = Block.create(block);
  var normalize = change.getFlag('normalize', options);

  if (range.isExpanded) {
    change.deleteAtRange(range);
    range = range.collapseToStart();
  }

  var value = change.value;
  var document = value.document;
  var _range3 = range,
      startKey = _range3.startKey,
      startOffset = _range3.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var parent = document.getParent(startBlock.key);
  var index = parent.nodes.indexOf(startBlock);

  if (startBlock.isVoid) {
    var extra = range.isAtEndOf(startBlock) ? 1 : 0;
    change.insertNodeByKey(parent.key, index + extra, block, { normalize: normalize });
  } else if (startBlock.isEmpty) {
    change.insertNodeByKey(parent.key, index + 1, block, { normalize: normalize });
  } else if (range.isAtStartOf(startBlock)) {
    change.insertNodeByKey(parent.key, index, block, { normalize: normalize });
  } else if (range.isAtEndOf(startBlock)) {
    change.insertNodeByKey(parent.key, index + 1, block, { normalize: normalize });
  } else {
    change.splitDescendantsByKey(startBlock.key, startKey, startOffset, {
      normalize: false
    });
    change.insertNodeByKey(parent.key, index + 1, block, { normalize: normalize });
  }

  if (normalize) {
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Insert a `fragment` at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Document} fragment
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.insertFragmentAtRange = function (change, range, fragment) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var normalize = change.getFlag('normalize', options);

  // If the range is expanded, delete it first.
  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: false });
    if (change.value.document.getDescendant(range.startKey)) {
      range = range.collapseToStart();
    } else {
      range = range.collapseTo(range.endKey, 0);
    }
  }

  // If the fragment is empty, there's nothing to do after deleting.
  if (!fragment.nodes.size) return;

  // Regenerate the keys for all of the fragments nodes, so that they're
  // guaranteed not to collide with the existing keys in the document. Otherwise
  // they will be rengerated automatically and we won't have an easy way to
  // reference them.
  fragment = fragment.mapDescendants(function (child) {
    return child.regenerateKey();
  });

  // Calculate a few things...
  var _range4 = range,
      startKey = _range4.startKey,
      startOffset = _range4.startOffset;
  var value = change.value;
  var document = value.document;

  var startText = document.getDescendant(startKey);
  var startBlock = document.getClosestBlock(startText.key);
  var startChild = startBlock.getFurthestAncestor(startText.key);
  var isAtStart = range.isAtStartOf(startBlock);
  var parent = document.getParent(startBlock.key);
  var index = parent.nodes.indexOf(startBlock);
  var blocks = fragment.getBlocks();
  var firstChild = fragment.nodes.first();
  var lastChild = fragment.nodes.last();
  var firstBlock = blocks.first();
  var lastBlock = blocks.last();

  // If the fragment only contains a void block, use `insertBlock` instead.
  if (firstBlock == lastBlock && firstBlock.isVoid) {
    change.insertBlockAtRange(range, firstBlock, options);
    return;
  }

  // If the fragment starts or ends with single nested block, (e.g., table),
  // do not merge this fragment with existing blocks.
  if (fragment.hasBlocks(firstChild.key) || fragment.hasBlocks(lastChild.key)) {
    fragment.nodes.reverse().forEach(function (node) {
      change.insertBlockAtRange(range, node, options);
    });
    return;
  }

  // If the first and last block aren't the same, we need to insert all of the
  // nodes after the fragment's first block at the index.
  if (firstBlock != lastBlock) {
    var lonelyParent = fragment.getFurthest(firstBlock.key, function (p) {
      return p.nodes.size == 1;
    });
    var lonelyChild = lonelyParent || firstBlock;
    var startIndex = parent.nodes.indexOf(startBlock);
    fragment = fragment.removeDescendant(lonelyChild.key);

    fragment.nodes.forEach(function (node, i) {
      var newIndex = startIndex + i + 1;
      change.insertNodeByKey(parent.key, newIndex, node, { normalize: false });
    });
  }

  // Check if we need to split the node.
  if (startOffset != 0) {
    change.splitDescendantsByKey(startChild.key, startKey, startOffset, {
      normalize: false
    });
  }

  // Update our variables with the new value.
  document = change.value.document;
  startText = document.getDescendant(startKey);
  startBlock = document.getClosestBlock(startKey);
  startChild = startBlock.getFurthestAncestor(startText.key);

  // If the first and last block aren't the same, we need to move any of the
  // starting block's children after the split into the last block of the
  // fragment, which has already been inserted.
  if (firstBlock != lastBlock) {
    var nextChild = isAtStart ? startChild : startBlock.getNextSibling(startChild.key);
    var nextNodes = nextChild ? startBlock.nodes.skipUntil(function (n) {
      return n.key == nextChild.key;
    }) : Object(immutable__WEBPACK_IMPORTED_MODULE_1__["List"])();
    var lastIndex = lastBlock.nodes.size;

    nextNodes.forEach(function (node, i) {
      var newIndex = lastIndex + i;
      change.moveNodeByKey(node.key, lastBlock.key, newIndex, {
        normalize: false
      });
    });
  }

  // If the starting block is empty, we replace it entirely with the first block
  // of the fragment, since this leads to a more expected behavior for the user.
  if (startBlock.isEmpty) {
    change.removeNodeByKey(startBlock.key, { normalize: false });
    change.insertNodeByKey(parent.key, index, firstBlock, { normalize: false });
  } else {
    // Otherwise, we maintain the starting block, and insert all of the first
    // block's inline nodes into it at the split point.
    var inlineChild = startBlock.getFurthestAncestor(startText.key);
    var inlineIndex = startBlock.nodes.indexOf(inlineChild);

    firstBlock.nodes.forEach(function (inline, i) {
      var o = startOffset == 0 ? 0 : 1;
      var newIndex = inlineIndex + i + o;
      change.insertNodeByKey(startBlock.key, newIndex, inline, {
        normalize: false
      });
    });
  }

  // Normalize if requested.
  if (normalize) {
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Insert an `inline` node at `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Inline|String|Object} inline
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.insertInlineAtRange = function (change, range, inline) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var normalize = change.getFlag('normalize', options);
  inline = Inline.create(inline);

  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: false });
    range = range.collapseToStart();
  }

  var value = change.value;
  var document = value.document;
  var _range5 = range,
      startKey = _range5.startKey,
      startOffset = _range5.startOffset;

  var parent = document.getParent(startKey);
  var startText = document.assertDescendant(startKey);
  var index = parent.nodes.indexOf(startText);

  if (parent.isVoid) return;

  change.splitNodeByKey(startKey, startOffset, { normalize: false });
  change.insertNodeByKey(parent.key, index + 1, inline, { normalize: false });

  if (normalize) {
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Insert `text` at a `range`, with optional `marks`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {String} text
 * @param {Set<Mark>} marks (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.insertTextAtRange = function (change, range, text, marks) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var normalize = options.normalize;
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var key = startKey;
  var offset = startOffset;
  var parent = document.getParent(startKey);

  if (parent.isVoid) return;

  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: false });

    // Update range start after delete
    if (change.value.startKey !== key) {
      key = change.value.startKey;
      offset = change.value.startOffset;
    }
  }

  // PERF: Unless specified, don't normalize if only inserting text.
  if (normalize !== undefined) {
    normalize = range.isExpanded;
  }
  change.insertTextByKey(key, offset, text, marks, { normalize: false });

  if (normalize) {
    // normalize in the narrowest existing block that originally contains startKey and endKey
    var commonAncestor = document.getCommonAncestor(startKey, range.endKey);
    var ancestors = document.getAncestors(commonAncestor.key).push(commonAncestor);
    var normalizeAncestor = ancestors.findLast(function (n) {
      return change.value.document.getDescendant(n.key);
    });
    change.normalizeNodeByKey(normalizeAncestor.key);
  }
};

/**
 * Remove an existing `mark` to the characters at `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Mark|String} mark (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.removeMarkAtRange = function (change, range, mark) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  if (range.isCollapsed) return;

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var texts = document.getTextsAtRange(range);
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;


  texts.forEach(function (node) {
    var key = node.key;

    var index = 0;
    var length = node.text.length;

    if (key == startKey) index = startOffset;
    if (key == endKey) length = endOffset;
    if (key == startKey && key == endKey) length = endOffset - startOffset;

    change.removeMarkByKey(key, index, length, mark, { normalize: normalize });
  });
};

/**
 * Set the `properties` of block nodes in a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object|String} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.setBlocksAtRange = function (change, range, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var blocks = document.getBlocksAtRange(range);

  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset,
      isCollapsed = range.isCollapsed;

  var isStartVoid = document.hasVoidParent(startKey);
  var startBlock = document.getClosestBlock(startKey);
  var endBlock = document.getClosestBlock(endKey);

  // Check if we have a "hanging" selection case where the even though the
  // selection extends into the start of the end node, we actually want to
  // ignore that for UX reasons.
  var isHanging = isCollapsed == false && startOffset == 0 && endOffset == 0 && isStartVoid == false && startKey == startBlock.getFirstText().key && endKey == endBlock.getFirstText().key;

  // If it's a hanging selection, ignore the last block.
  var sets = isHanging ? blocks.slice(0, -1) : blocks;

  sets.forEach(function (block) {
    change.setNodeByKey(block.key, properties, { normalize: normalize });
  });
};

Changes$1.setBlockAtRange = function () {
  slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].deprecate('slate@0.33.0', 'The `setBlockAtRange` method of Slate changes has been renamed to `setBlocksAtRange`.');
  Changes$1.setBlocksAtRange.apply(Changes$1, arguments);
};

/**
 * Set the `properties` of inline nodes in a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object|String} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.setInlinesAtRange = function (change, range, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var inlines = document.getInlinesAtRange(range);

  inlines.forEach(function (inline) {
    change.setNodeByKey(inline.key, properties, { normalize: normalize });
  });
};

Changes$1.setInlineAtRange = function () {
  slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].deprecate('slate@0.33.0', 'The `setInlineAtRange` method of Slate changes has been renamed to `setInlinesAtRange`.');
  Changes$1.setInlinesAtRange.apply(Changes$1, arguments);
};

/**
 * Split the block nodes at a `range`, to optional `height`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Number} height (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.splitBlockAtRange = function (change, range) {
  var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var normalize = change.getFlag('normalize', options);

  var _range6 = range,
      startKey = _range6.startKey,
      startOffset = _range6.startOffset,
      endOffset = _range6.endOffset,
      endKey = _range6.endKey;
  var value = change.value;
  var document = value.document;

  var node = document.assertDescendant(startKey);
  var parent = document.getClosestBlock(node.key);
  var h = 0;

  while (parent && parent.object == 'block' && h < height) {
    node = parent;
    parent = document.getClosestBlock(parent.key);
    h++;
  }

  change.splitDescendantsByKey(node.key, startKey, startOffset, {
    normalize: normalize && range.isCollapsed
  });

  if (range.isExpanded) {
    if (range.isBackward) range = range.flip();
    var nextBlock = change.value.document.getNextBlock(node.key);
    range = range.moveAnchorToStartOf(nextBlock);
    if (startKey === endKey) {
      range = range.moveFocusTo(range.anchorKey, endOffset - startOffset);
    }
    change.deleteAtRange(range, { normalize: normalize });
  }
};

/**
 * Split the inline nodes at a `range`, to optional `height`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Number} height (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.splitInlineAtRange = function (change, range) {
  var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Infinity;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var normalize = change.getFlag('normalize', options);

  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: normalize });
    range = range.collapseToStart();
  }

  var _range7 = range,
      startKey = _range7.startKey,
      startOffset = _range7.startOffset;
  var value = change.value;
  var document = value.document;

  var node = document.assertDescendant(startKey);
  var parent = document.getClosestInline(node.key);
  var h = 0;

  while (parent && parent.object == 'inline' && h < height) {
    node = parent;
    parent = document.getClosestInline(parent.key);
    h++;
  }

  change.splitDescendantsByKey(node.key, startKey, startOffset, { normalize: normalize });
};

/**
 * Add or remove a `mark` from the characters at `range`, depending on whether
 * it's already there.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Mixed} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.toggleMarkAtRange = function (change, range, mark) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  if (range.isCollapsed) return;

  mark = Mark.create(mark);

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var marks = document.getActiveMarksAtRange(range);
  var exists = marks.some(function (m) {
    return m.equals(mark);
  });

  if (exists) {
    change.removeMarkAtRange(range, mark, { normalize: normalize });
  } else {
    change.addMarkAtRange(range, mark, { normalize: normalize });
  }
};

/**
 * Unwrap all of the block nodes in a `range` from a block with `properties`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {String|Object} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.unwrapBlockAtRange = function (change, range, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  properties = Node.createProperties(properties);

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var blocks = document.getBlocksAtRange(range);
  var wrappers = blocks.map(function (block) {
    return document.getClosest(block.key, function (parent) {
      if (parent.object != 'block') return false;
      if (properties.type != null && parent.type != properties.type) return false;
      if (properties.isVoid != null && parent.isVoid != properties.isVoid) return false;
      if (properties.data != null && !parent.data.isSuperset(properties.data)) return false;
      return true;
    });
  }).filter(function (exists) {
    return exists;
  }).toOrderedSet().toList();

  wrappers.forEach(function (block) {
    var first = block.nodes.first();
    var last = block.nodes.last();
    var parent = document.getParent(block.key);
    var index = parent.nodes.indexOf(block);

    var children = block.nodes.filter(function (child) {
      return blocks.some(function (b) {
        return child == b || child.hasDescendant(b.key);
      });
    });

    var firstMatch = children.first();
    var lastMatch = children.last();

    if (first == firstMatch && last == lastMatch) {
      block.nodes.forEach(function (child, i) {
        change.moveNodeByKey(child.key, parent.key, index + i, {
          normalize: false
        });
      });

      change.removeNodeByKey(block.key, { normalize: false });
    } else if (last == lastMatch) {
      block.nodes.skipUntil(function (n) {
        return n == firstMatch;
      }).forEach(function (child, i) {
        change.moveNodeByKey(child.key, parent.key, index + 1 + i, {
          normalize: false
        });
      });
    } else if (first == firstMatch) {
      block.nodes.takeUntil(function (n) {
        return n == lastMatch;
      }).push(lastMatch).forEach(function (child, i) {
        change.moveNodeByKey(child.key, parent.key, index + i, {
          normalize: false
        });
      });
    } else {
      var firstText = firstMatch.getFirstText();
      change.splitDescendantsByKey(block.key, firstText.key, 0, {
        normalize: false
      });
      document = change.value.document;

      children.forEach(function (child, i) {
        if (i == 0) {
          var extra = child;
          child = document.getNextBlock(child.key);
          change.removeNodeByKey(extra.key, { normalize: false });
        }

        change.moveNodeByKey(child.key, parent.key, index + 1 + i, {
          normalize: false
        });
      });
    }
  });

  // TODO: optmize to only normalize the right block
  if (normalize) {
    change.normalizeDocument();
  }
};

/**
 * Unwrap the inline nodes in a `range` from an inline with `properties`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {String|Object} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.unwrapInlineAtRange = function (change, range, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  properties = Node.createProperties(properties);

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var texts = document.getTextsAtRange(range);
  var inlines = texts.map(function (text) {
    return document.getClosest(text.key, function (parent) {
      if (parent.object != 'inline') return false;
      if (properties.type != null && parent.type != properties.type) return false;
      if (properties.isVoid != null && parent.isVoid != properties.isVoid) return false;
      if (properties.data != null && !parent.data.isSuperset(properties.data)) return false;
      return true;
    });
  }).filter(function (exists) {
    return exists;
  }).toOrderedSet().toList();

  inlines.forEach(function (inline) {
    var parent = change.value.document.getParent(inline.key);
    var index = parent.nodes.indexOf(inline);

    inline.nodes.forEach(function (child, i) {
      change.moveNodeByKey(child.key, parent.key, index + i, {
        normalize: false
      });
    });
  });

  // TODO: optmize to only normalize the right block
  if (normalize) {
    change.normalizeDocument();
  }
};

/**
 * Wrap all of the blocks in a `range` in a new `block`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Block|Object|String} block
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.wrapBlockAtRange = function (change, range, block) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  block = Block.create(block);
  block = block.set('nodes', block.nodes.clear());

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;


  var blocks = document.getBlocksAtRange(range);
  var firstblock = blocks.first();
  var lastblock = blocks.last();
  var parent = void 0,
      siblings = void 0,
      index = void 0;

  // If there is only one block in the selection then we know the parent and
  // siblings.
  if (blocks.length === 1) {
    parent = document.getParent(firstblock.key);
    siblings = blocks;
  } else {
    // Determine closest shared parent to all blocks in selection.
    parent = document.getClosest(firstblock.key, function (p1) {
      return !!document.getClosest(lastblock.key, function (p2) {
        return p1 == p2;
      });
    });
  }

  // If no shared parent could be found then the parent is the document.
  if (parent == null) parent = document;

  // Create a list of direct children siblings of parent that fall in the
  // selection.
  if (siblings == null) {
    var indexes = parent.nodes.reduce(function (ind, node, i) {
      if (node == firstblock || node.hasDescendant(firstblock.key)) ind[0] = i;
      if (node == lastblock || node.hasDescendant(lastblock.key)) ind[1] = i;
      return ind;
    }, []);

    index = indexes[0];
    siblings = parent.nodes.slice(indexes[0], indexes[1] + 1);
  }

  // Get the index to place the new wrapped node at.
  if (index == null) {
    index = parent.nodes.indexOf(siblings.first());
  }

  // Inject the new block node into the parent.
  change.insertNodeByKey(parent.key, index, block, { normalize: false });

  // Move the sibling nodes into the new block node.
  siblings.forEach(function (node, i) {
    change.moveNodeByKey(node.key, block.key, i, { normalize: false });
  });

  if (normalize) {
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Wrap the text and inlines in a `range` in a new `inline`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Inline|Object|String} inline
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.wrapInlineAtRange = function (change, range, inline) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var value = change.value;
  var document = value.document;

  var normalize = change.getFlag('normalize', options);
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;


  if (range.isCollapsed) {
    // Wrapping an inline void
    var inlineParent = document.getClosestInline(startKey);
    if (!inlineParent.isVoid) {
      return;
    }

    return change.wrapInlineByKey(inlineParent.key, inline, options);
  }

  inline = Inline.create(inline);
  inline = inline.set('nodes', inline.nodes.clear());

  var blocks = document.getBlocksAtRange(range);
  var startBlock = document.getClosestBlock(startKey);
  var endBlock = document.getClosestBlock(endKey);
  var startChild = startBlock.getFurthestAncestor(startKey);
  var endChild = endBlock.getFurthestAncestor(endKey);

  change.splitDescendantsByKey(endChild.key, endKey, endOffset, {
    normalize: false
  });
  change.splitDescendantsByKey(startChild.key, startKey, startOffset, {
    normalize: false
  });

  document = change.value.document;
  startBlock = document.getDescendant(startBlock.key);
  endBlock = document.getDescendant(endBlock.key);
  startChild = startBlock.getFurthestAncestor(startKey);
  endChild = endBlock.getFurthestAncestor(endKey);
  var startIndex = startBlock.nodes.indexOf(startChild);
  var endIndex = endBlock.nodes.indexOf(endChild);

  if (startBlock == endBlock) {
    document = change.value.document;
    startBlock = document.getClosestBlock(startKey);
    startChild = startBlock.getFurthestAncestor(startKey);

    var startInner = document.getNextSibling(startChild.key);
    var startInnerIndex = startBlock.nodes.indexOf(startInner);
    var endInner = startKey == endKey ? startInner : startBlock.getFurthestAncestor(endKey);
    var inlines = startBlock.nodes.skipUntil(function (n) {
      return n == startInner;
    }).takeUntil(function (n) {
      return n == endInner;
    }).push(endInner);

    var node = inline.regenerateKey();

    change.insertNodeByKey(startBlock.key, startInnerIndex, node, {
      normalize: false
    });

    inlines.forEach(function (child, i) {
      change.moveNodeByKey(child.key, node.key, i, { normalize: false });
    });

    if (normalize) {
      change.normalizeNodeByKey(startBlock.key);
    }
  } else {
    var startInlines = startBlock.nodes.slice(startIndex + 1);
    var endInlines = endBlock.nodes.slice(0, endIndex + 1);
    var startNode = inline.regenerateKey();
    var endNode = inline.regenerateKey();

    change.insertNodeByKey(startBlock.key, startIndex + 1, startNode, {
      normalize: false
    });
    change.insertNodeByKey(endBlock.key, endIndex, endNode, {
      normalize: false
    });

    startInlines.forEach(function (child, i) {
      change.moveNodeByKey(child.key, startNode.key, i, { normalize: false });
    });

    endInlines.forEach(function (child, i) {
      change.moveNodeByKey(child.key, endNode.key, i, { normalize: false });
    });

    if (normalize) {
      change.normalizeNodeByKey(startBlock.key).normalizeNodeByKey(endBlock.key);
    }

    blocks.slice(1, -1).forEach(function (block) {
      var node = inline.regenerateKey();
      change.insertNodeByKey(block.key, 0, node, { normalize: false });

      block.nodes.forEach(function (child, i) {
        change.moveNodeByKey(child.key, node.key, i, { normalize: false });
      });

      if (normalize) {
        change.normalizeNodeByKey(block.key);
      }
    });
  }
};

/**
 * Wrap the text in a `range` in a prefix/suffix.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {String} prefix
 * @param {String} suffix (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$1.wrapTextAtRange = function (change, range, prefix) {
  var suffix = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : prefix;
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  var normalize = change.getFlag('normalize', options);
  var startKey = range.startKey,
      endKey = range.endKey;

  var start = range.collapseToStart();
  var end = range.collapseToEnd();

  if (startKey == endKey) {
    end = end.move(prefix.length);
  }

  change.insertTextAtRange(start, prefix, [], { normalize: normalize });
  change.insertTextAtRange(end, suffix, [], { normalize: normalize });
};

/**
 * Changes.
 *
 * @type {Object}
 */

var Changes$2 = {};

/**
 * Add mark to text at `offset` and `length` in node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} offset
 * @param {Number} length
 * @param {Mixed} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$2.addMarkByKey = function (change, key, offset, length, mark) {
  var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

  mark = Mark.create(mark);
  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var node = document.getNode(key);
  var leaves = node.getLeaves();

  var operations = [];
  var bx = offset;
  var by = offset + length;
  var o = 0;

  leaves.forEach(function (leaf) {
    var ax = o;
    var ay = ax + leaf.text.length;

    o += leaf.text.length;

    // If the leaf doesn't overlap with the operation, continue on.
    if (ay < bx || by < ax) return;

    // If the leaf already has the mark, continue on.
    if (leaf.marks.has(mark)) return;

    // Otherwise, determine which offset and characters overlap.
    var start = Math.max(ax, bx);
    var end = Math.min(ay, by);

    operations.push({
      type: 'add_mark',
      value: value,
      path: path,
      offset: start,
      length: end - start,
      mark: mark
    });
  });

  change.applyOperations(operations);

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Insert a `fragment` at `index` in a node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} index
 * @param {Fragment} fragment
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$2.insertFragmentByKey = function (change, key, index, fragment) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  var normalize = change.getFlag('normalize', options);

  fragment.nodes.forEach(function (node, i) {
    change.insertNodeByKey(key, index + i, node);
  });

  if (normalize) {
    change.normalizeNodeByKey(key);
  }
};

/**
 * Insert a `node` at `index` in a node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} index
 * @param {Node} node
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$2.insertNodeByKey = function (change, key, index, node) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);

  change.applyOperation({
    type: 'insert_node',
    value: value,
    path: [].concat(toConsumableArray(path), [index]),
    node: node
  });

  if (normalize) {
    change.normalizeNodeByKey(key);
  }
};

/**
 * Insert `text` at `offset` in node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} offset
 * @param {String} text
 * @param {Set<Mark>} marks (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$2.insertTextByKey = function (change, key, offset, text, marks) {
  var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

  var normalize = change.getFlag('normalize', options);

  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var node = document.getNode(key);
  marks = marks || node.getMarksAtIndex(offset);

  change.applyOperation({
    type: 'insert_text',
    value: value,
    path: path,
    offset: offset,
    text: text,
    marks: marks
  });

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Merge a node by `key` with the previous node.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$2.mergeNodeByKey = function (change, key) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var original = document.getDescendant(key);
  var previous = document.getPreviousSibling(key);

  if (!previous) {
    throw new Error('Unable to merge node with key "' + key + '", no previous key.');
  }

  var position = previous.object == 'text' ? previous.text.length : previous.nodes.size;

  change.applyOperation({
    type: 'merge_node',
    value: value,
    path: path,
    position: position,
    // for undos to succeed we only need the type and data because
    // these are the only properties that get changed in the merge operation
    properties: {
      type: original.type,
      data: original.data
    },
    target: null
  });

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Move a node by `key` to a new parent by `newKey` and `index`.
 * `newKey` is the key of the container (it can be the document itself)
 *
 * @param {Change} change
 * @param {String} key
 * @param {String} newKey
 * @param {Number} index
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$2.moveNodeByKey = function (change, key, newKey, newIndex) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var newPath = document.getPath(newKey);

  change.applyOperation({
    type: 'move_node',
    value: value,
    path: path,
    newPath: [].concat(toConsumableArray(newPath), [newIndex])
  });

  if (normalize) {
    var parent = document.getCommonAncestor(key, newKey);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Remove mark from text at `offset` and `length` in node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} offset
 * @param {Number} length
 * @param {Mark} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$2.removeMarkByKey = function (change, key, offset, length, mark) {
  var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

  mark = Mark.create(mark);
  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var node = document.getNode(key);
  var leaves = node.getLeaves();

  var operations = [];
  var bx = offset;
  var by = offset + length;
  var o = 0;

  leaves.forEach(function (leaf) {
    var ax = o;
    var ay = ax + leaf.text.length;

    o += leaf.text.length;

    // If the leaf doesn't overlap with the operation, continue on.
    if (ay < bx || by < ax) return;

    // If the leaf already has the mark, continue on.
    if (!leaf.marks.has(mark)) return;

    // Otherwise, determine which offset and characters overlap.
    var start = Math.max(ax, bx);
    var end = Math.min(ay, by);

    operations.push({
      type: 'remove_mark',
      value: value,
      path: path,
      offset: start,
      length: end - start,
      mark: mark
    });
  });

  change.applyOperations(operations);

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Remove all `marks` from node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$2.removeAllMarksByKey = function (change, key) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var state = change.state;
  var document = state.document;

  var node = document.getNode(key);
  var texts = node.object === 'text' ? [node] : node.getTextsAsArray();

  texts.forEach(function (text) {
    text.getMarksAsArray().forEach(function (mark) {
      change.removeMarkByKey(text.key, 0, text.text.length, mark, options);
    });
  });
};

/**
 * Remove a node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$2.removeNodeByKey = function (change, key) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var node = document.getNode(key);

  change.applyOperation({
    type: 'remove_node',
    value: value,
    path: path,
    node: node
  });

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Insert `text` at `offset` in node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {String} text
 * @param {Set<Mark>} marks (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$2.setTextByKey = function (change, key, text, marks) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  var textNode = change.value.document.getDescendant(key);
  change.replaceTextByKey(key, 0, textNode.text.length, text, marks, options);
};

/**
 * Replace A Length of Text with another string or text
 * @param {Change} change
 * @param {String} key
 * @param {Number} offset
 * @param {Number} length
 * @param {string} text
 * @param {Set<Mark>} marks (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 *
 */

Changes$2.replaceTextByKey = function (change, key, offset, length, text, marks, options) {
  var document = change.value.document;

  var textNode = document.getDescendant(key);
  if (length + offset > textNode.text.length) {
    length = textNode.text.length - offset;
  }
  var range = Range.create({
    anchorKey: key,
    focusKey: key,
    anchorOffset: offset,
    focusOffset: offset + length
  });
  var activeMarks = document.getActiveMarksAtRange(range);

  change.removeTextByKey(key, offset, length, { normalize: false });
  if (!marks) {
    // Do not use mark at index when marks and activeMarks are both empty
    marks = activeMarks ? activeMarks : [];
  } else if (activeMarks) {
    // Do not use `has` because we may want to reset marks like font-size with an updated data;
    activeMarks = activeMarks.filter(function (activeMark) {
      return !marks.find(function (m) {
        return activeMark.type === m.type;
      });
    });
    marks = activeMarks.merge(marks);
  }
  change.insertTextByKey(key, offset, text, marks, options);
};

/**
 * Remove text at `offset` and `length` in node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} offset
 * @param {Number} length
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$2.removeTextByKey = function (change, key, offset, length) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var node = document.getNode(key);
  var leaves = node.getLeaves();
  var text = node.text;


  var removals = [];
  var bx = offset;
  var by = offset + length;
  var o = 0;

  leaves.forEach(function (leaf) {
    var ax = o;
    var ay = ax + leaf.text.length;

    o += leaf.text.length;

    // If the leaf doesn't overlap with the removal, continue on.
    if (ay < bx || by < ax) return;

    // Otherwise, determine which offset and characters overlap.
    var start = Math.max(ax, bx);
    var end = Math.min(ay, by);
    var string = text.slice(start, end);

    removals.push({
      type: 'remove_text',
      value: value,
      path: path,
      offset: start,
      text: string,
      marks: leaf.marks
    });
  });

  // Apply in reverse order, so subsequent removals don't impact previous ones.
  change.applyOperations(removals.reverse());

  if (normalize) {
    var block = document.getClosestBlock(key);
    change.normalizeNodeByKey(block.key);
  }
};

/**
`* Replace a `node` with another `node`
 *
 * @param {Change} change
 * @param {String} key
 * @param {Object|Node} node
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$2.replaceNodeByKey = function (change, key, newNode) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  newNode = Node.create(newNode);
  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var node = document.getNode(key);
  var parent = document.getParent(key);
  var index = parent.nodes.indexOf(node);
  change.removeNodeByKey(key, { normalize: false });
  change.insertNodeByKey(parent.key, index, newNode, { normalize: false });
  if (normalize) {
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Set `properties` on mark on text at `offset` and `length` in node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} offset
 * @param {Number} length
 * @param {Mark} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$2.setMarkByKey = function (change, key, offset, length, mark, properties) {
  var options = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : {};

  mark = Mark.create(mark);
  properties = Mark.createProperties(properties);
  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);

  change.applyOperation({
    type: 'set_mark',
    value: value,
    path: path,
    offset: offset,
    length: length,
    mark: mark,
    properties: properties
  });

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Set `properties` on a node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Object|String} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$2.setNodeByKey = function (change, key, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  properties = Node.createProperties(properties);
  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var node = document.getNode(key);

  change.applyOperation({
    type: 'set_node',
    value: value,
    path: path,
    node: node,
    properties: properties
  });

  if (normalize) {
    change.normalizeNodeByKey(node.key);
  }
};

/**
 * Split a node by `key` at `position`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} position
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$2.splitNodeByKey = function (change, key, position) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize = options.normalize,
      normalize = _options$normalize === undefined ? true : _options$normalize,
      _options$target = options.target,
      target = _options$target === undefined ? null : _options$target;
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var node = document.getDescendantAtPath(path);

  change.applyOperation({
    type: 'split_node',
    value: value,
    path: path,
    position: position,
    properties: {
      type: node.type,
      data: node.data
    },
    target: target
  });

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Split a node deeply down the tree by `key`, `textKey` and `textOffset`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} position
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$2.splitDescendantsByKey = function (change, key, textKey, textOffset) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  if (key == textKey) {
    change.splitNodeByKey(textKey, textOffset, options);
    return;
  }

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;


  var text = document.getNode(textKey);
  var ancestors = document.getAncestors(textKey);
  var nodes = ancestors.skipUntil(function (a) {
    return a.key == key;
  }).reverse().unshift(text);
  var previous = void 0;
  var index = void 0;

  nodes.forEach(function (node) {
    var prevIndex = index == null ? null : index;
    index = previous ? node.nodes.indexOf(previous) + 1 : textOffset;
    previous = node;
    change.splitNodeByKey(node.key, index, {
      normalize: false,
      target: prevIndex
    });
  });

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Unwrap content from an inline parent with `properties`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Object|String} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$2.unwrapInlineByKey = function (change, key, properties, options) {
  var value = change.value;
  var document = value.document,
      selection = value.selection;

  var node = document.assertDescendant(key);
  var first = node.getFirstText();
  var last = node.getLastText();
  var range = selection.moveToRangeOf(first, last);
  change.unwrapInlineAtRange(range, properties, options);
};

/**
 * Unwrap content from a block parent with `properties`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Object|String} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$2.unwrapBlockByKey = function (change, key, properties, options) {
  var value = change.value;
  var document = value.document,
      selection = value.selection;

  var node = document.assertDescendant(key);
  var first = node.getFirstText();
  var last = node.getLastText();
  var range = selection.moveToRangeOf(first, last);
  change.unwrapBlockAtRange(range, properties, options);
};

/**
 * Unwrap a single node from its parent.
 *
 * If the node is surrounded with siblings, its parent will be
 * split. If the node is the only child, the parent is removed, and
 * simply replaced by the node itself.  Cannot unwrap a root node.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$2.unwrapNodeByKey = function (change, key) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var normalize = change.getFlag('normalize', options);
  var value = change.value;
  var document = value.document;

  var parent = document.getParent(key);
  var node = parent.getChild(key);

  var index = parent.nodes.indexOf(node);
  var isFirst = index === 0;
  var isLast = index === parent.nodes.size - 1;

  var parentParent = document.getParent(parent.key);
  var parentIndex = parentParent.nodes.indexOf(parent);

  if (parent.nodes.size === 1) {
    change.moveNodeByKey(key, parentParent.key, parentIndex, {
      normalize: false
    });
    change.removeNodeByKey(parent.key, options);
  } else if (isFirst) {
    // Just move the node before its parent.
    change.moveNodeByKey(key, parentParent.key, parentIndex, options);
  } else if (isLast) {
    // Just move the node after its parent.
    change.moveNodeByKey(key, parentParent.key, parentIndex + 1, options);
  } else {
    // Split the parent.
    change.splitNodeByKey(parent.key, index, { normalize: false });

    // Extract the node in between the splitted parent.
    change.moveNodeByKey(key, parentParent.key, parentIndex + 1, {
      normalize: false
    });

    if (normalize) {
      change.normalizeNodeByKey(parentParent.key);
    }
  }
};

/**
 * Wrap a node in a block with `properties`.
 *
 * @param {Change} change
 * @param {String} key The node to wrap
 * @param {Block|Object|String} block The wrapping block (its children are discarded)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$2.wrapBlockByKey = function (change, key, block, options) {
  block = Block.create(block);
  block = block.set('nodes', block.nodes.clear());

  var document = change.value.document;

  var node = document.assertDescendant(key);
  var parent = document.getParent(node.key);
  var index = parent.nodes.indexOf(node);

  change.insertNodeByKey(parent.key, index, block, { normalize: false });
  change.moveNodeByKey(node.key, block.key, 0, options);
};

/**
 * Wrap a node in an inline with `properties`.
 *
 * @param {Change} change
 * @param {String} key The node to wrap
 * @param {Block|Object|String} inline The wrapping inline (its children are discarded)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes$2.wrapInlineByKey = function (change, key, inline, options) {
  inline = Inline.create(inline);
  inline = inline.set('nodes', inline.nodes.clear());

  var document = change.value.document;

  var node = document.assertDescendant(key);
  var parent = document.getParent(node.key);
  var index = parent.nodes.indexOf(node);

  change.insertNodeByKey(parent.key, index, inline, { normalize: false });
  change.moveNodeByKey(node.key, inline.key, 0, options);
};

/**
 * Wrap a node by `key` with `parent`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Node|Object} parent
 * @param {Object} options
 */

Changes$2.wrapNodeByKey = function (change, key, parent) {
  parent = Node.create(parent);
  parent = parent.set('nodes', parent.nodes.clear());

  if (parent.object == 'block') {
    change.wrapBlockByKey(key, parent);
    return;
  }

  if (parent.object == 'inline') {
    change.wrapInlineByKey(key, parent);
    return;
  }
};

/**
 * Slate operation attributes.
 *
 * @type {Array}
 */

var OPERATION_ATTRIBUTES = {
  add_mark: ['value', 'path', 'offset', 'length', 'mark'],
  insert_node: ['value', 'path', 'node'],
  insert_text: ['value', 'path', 'offset', 'text', 'marks'],
  merge_node: ['value', 'path', 'position', 'properties', 'target'],
  move_node: ['value', 'path', 'newPath'],
  remove_mark: ['value', 'path', 'offset', 'length', 'mark'],
  remove_node: ['value', 'path', 'node'],
  remove_text: ['value', 'path', 'offset', 'text', 'marks'],
  set_mark: ['value', 'path', 'offset', 'length', 'mark', 'properties'],
  set_node: ['value', 'path', 'node', 'properties'],
  set_selection: ['value', 'selection', 'properties'],
  set_value: ['value', 'properties'],
  split_node: ['value', 'path', 'position', 'properties', 'target']

  /**
   * Export.
   *
   * @type {Object}
   */

};

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = debug__WEBPACK_IMPORTED_MODULE_5___default()('slate:history');

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS$8 = {
  redos: new immutable__WEBPACK_IMPORTED_MODULE_1__["Stack"](),
  undos: new immutable__WEBPACK_IMPORTED_MODULE_1__["Stack"]()

  /**
   * History.
   *
   * @type {History}
   */

};
var History = function (_Record) {
  inherits(History, _Record);

  function History() {
    classCallCheck(this, History);
    return possibleConstructorReturn(this, (History.__proto__ || Object.getPrototypeOf(History)).apply(this, arguments));
  }

  createClass(History, [{
    key: 'save',


    /**
     * Save an `operation` into the history.
     *
     * @param {Object} operation
     * @param {Object} options
     * @return {History}
     */

    value: function save(operation) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var history = this;
      var _history = history,
          undos = _history.undos,
          redos = _history.redos;
      var merge = options.merge,
          skip = options.skip;

      var prevBatch = undos.peek();
      var prevOperation = prevBatch && prevBatch.last();

      if (skip == null) {
        skip = shouldSkip(operation, prevOperation);
      }

      if (skip) {
        return history;
      }

      if (merge == null) {
        merge = shouldMerge(operation, prevOperation);
      }

      debug('save', { operation: operation, merge: merge });

      // If the `merge` flag is true, add the operation to the previous batch.
      if (merge && prevBatch) {
        var batch = prevBatch.push(operation);
        undos = undos.pop();
        undos = undos.push(batch);
      } else {
        // Otherwise, create a new batch with the operation.
        var _batch = new immutable__WEBPACK_IMPORTED_MODULE_1__["List"]([operation]);
        undos = undos.push(_batch);
      }

      // Constrain the history to 100 entries for memory's sake.
      if (undos.size > 100) {
        undos = undos.take(100);
      }

      // Clear the redos and update the history.
      redos = redos.clear();
      history = history.set('undos', undos).set('redos', redos);
      return history;
    }

    /**
     * Return a JSON representation of the history.
     *
     * @return {Object}
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
      var object = {
        object: this.object,
        redos: this.redos.toJSON(),
        undos: this.undos.toJSON()
      };

      return object;
    }

    /**
     * Alias `toJS`.
     */

  }, {
    key: 'toJS',
    value: function toJS() {
      return this.toJSON();
    }
  }, {
    key: 'object',


    /**
     * Object.
     *
     * @return {String}
     */

    get: function get$$1() {
      return 'history';
    }
  }, {
    key: 'kind',
    get: function get$$1() {
      slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
      return this.object;
    }
  }], [{
    key: 'create',

    /**
     * Create a new `History` with `attrs`.
     *
     * @param {Object|History} attrs
     * @return {History}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (History.isHistory(attrs)) {
        return attrs;
      }

      if (is_plain_object__WEBPACK_IMPORTED_MODULE_0___default()(attrs)) {
        return History.fromJSON(attrs);
      }

      throw new Error('`History.create` only accepts objects or histories, but you passed it: ' + attrs);
    }

    /**
     * Create a `History` from a JSON `object`.
     *
     * @param {Object} object
     * @return {History}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      var _object$redos = object.redos,
          redos = _object$redos === undefined ? [] : _object$redos,
          _object$undos = object.undos,
          undos = _object$undos === undefined ? [] : _object$undos;


      var history = new History({
        redos: new immutable__WEBPACK_IMPORTED_MODULE_1__["Stack"](redos),
        undos: new immutable__WEBPACK_IMPORTED_MODULE_1__["Stack"](undos)
      });

      return history;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isHistory',


    /**
     * Check if `any` is a `History`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isHistory(any) {
      return !!(any && any[MODEL_TYPES.HISTORY]);
    }
  }]);
  return History;
}(Object(immutable__WEBPACK_IMPORTED_MODULE_1__["Record"])(DEFAULTS$8));

/**
 * Attach a pseudo-symbol for type checking.
 */

History.fromJS = History.fromJSON;
History.prototype[MODEL_TYPES.HISTORY] = true;

/**
 * Check whether to merge a new operation `o` into the previous operation `p`.
 *
 * @param {Object} o
 * @param {Object} p
 * @return {Boolean}
 */

function shouldMerge(o, p) {
  if (!p) return false;

  var merge = o.type == 'set_selection' && p.type == 'set_selection' || o.type == 'insert_text' && p.type == 'insert_text' && o.offset == p.offset + p.text.length && lodash_isEqual__WEBPACK_IMPORTED_MODULE_6___default()(o.path, p.path) || o.type == 'remove_text' && p.type == 'remove_text' && o.offset + o.text.length == p.offset && lodash_isEqual__WEBPACK_IMPORTED_MODULE_6___default()(o.path, p.path);

  return merge;
}

/**
 * Check whether to skip a new operation `o`, given previous operation `p`.
 *
 * @param {Object} o
 * @param {Object} p
 * @return {Boolean}
 */

function shouldSkip(o, p) {
  if (!p) return false;

  var skip = o.type == 'set_selection' && p.type == 'set_selection';

  return skip;
}

/**
 * Define the core schema rules, order-sensitive.
 *
 * @type {Array}
 */

var CORE_SCHEMA_RULES = [
/**
 * Only allow block nodes in documents.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.object != 'document') return;
    var invalids = node.nodes.filter(function (n) {
      return n.object != 'block';
    });
    if (!invalids.size) return;

    return function (change) {
      invalids.forEach(function (child) {
        change.removeNodeByKey(child.key, { normalize: false });
      });
    };
  }
},

/**
 * Only allow block nodes or inline and text nodes in blocks.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.object != 'block') return;
    var first = node.nodes.first();
    if (!first) return;
    var objects = first.object == 'block' ? ['block'] : ['inline', 'text'];
    var invalids = node.nodes.filter(function (n) {
      return !objects.includes(n.object);
    });
    if (!invalids.size) return;

    return function (change) {
      invalids.forEach(function (child) {
        change.removeNodeByKey(child.key, { normalize: false });
      });
    };
  }
},

/**
 * Only allow inline and text nodes in inlines.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.object != 'inline') return;
    var invalids = node.nodes.filter(function (n) {
      return n.object != 'inline' && n.object != 'text';
    });
    if (!invalids.size) return;

    return function (change) {
      invalids.forEach(function (child) {
        change.removeNodeByKey(child.key, { normalize: false });
      });
    };
  }
},

/**
 * Ensure that block and inline nodes have at least one text child.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.object != 'block' && node.object != 'inline') return;
    if (node.nodes.size > 0) return;

    return function (change) {
      var text = Text.create();
      change.insertNodeByKey(node.key, 0, text, { normalize: false });
    };
  }
},

/**
 * Ensure that inline non-void nodes are never empty.
 *
 * This rule is applied to all blocks and inlines, because when they contain an empty
 * inline, we need to remove the empty inline from that parent node. If `validate`
 * was to be memoized, it should be against the parent node, not the empty inline itself.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.object != 'inline' && node.object != 'block') return;

    var invalids = node.nodes.filter(function (child) {
      return child.object === 'inline' && child.isEmpty;
    });

    if (!invalids.size) return;

    return function (change) {
      // If all of the block's nodes are invalid, insert an empty text node so
      // that the selection will be preserved when they are all removed.
      if (node.nodes.size == invalids.size) {
        var text = Text.create();
        change.insertNodeByKey(node.key, 1, text, { normalize: false });
      }

      invalids.forEach(function (child) {
        change.removeNodeByKey(child.key, { normalize: false });
      });
    };
  }
},

/**
 * Ensure that inline void nodes are surrounded by text nodes, by adding extra
 * blank text nodes if necessary.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.object != 'block' && node.object != 'inline') return;

    var invalids = node.nodes.reduce(function (list, child, index) {
      if (child.object !== 'inline') return list;

      var prev = index > 0 ? node.nodes.get(index - 1) : null;
      var next = node.nodes.get(index + 1);

      // We don't test if "prev" is inline, since it has already been
      // processed in the loop
      var insertBefore = !prev;
      var insertAfter = !next || next.object == 'inline';

      if (insertAfter || insertBefore) {
        list = list.push({ insertAfter: insertAfter, insertBefore: insertBefore, index: index });
      }

      return list;
    }, new immutable__WEBPACK_IMPORTED_MODULE_1__["List"]());

    if (!invalids.size) return;

    return function (change) {
      // Shift for every text node inserted previously.
      var shift = 0;

      invalids.forEach(function (_ref) {
        var index = _ref.index,
            insertAfter = _ref.insertAfter,
            insertBefore = _ref.insertBefore;

        if (insertBefore) {
          change.insertNodeByKey(node.key, shift + index, Text.create(), {
            normalize: false
          });
          shift++;
        }

        if (insertAfter) {
          change.insertNodeByKey(node.key, shift + index + 1, Text.create(), {
            normalize: false
          });
          shift++;
        }
      });
    };
  }
},

/**
 * Merge adjacent text nodes.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.object != 'block' && node.object != 'inline') return;

    var invalids = node.nodes.map(function (child, i) {
      var next = node.nodes.get(i + 1);
      if (child.object != 'text') return;
      if (!next || next.object != 'text') return;
      return next;
    }).filter(Boolean);

    if (!invalids.size) return;

    return function (change) {
      // Reverse the list to handle consecutive merges, since the earlier nodes
      // will always exist after each merge.
      invalids.reverse().forEach(function (n) {
        change.mergeNodeByKey(n.key, { normalize: false });
      });
    };
  }
},

/**
 * Prevent extra empty text nodes, except when adjacent to inline void nodes.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.object != 'block' && node.object != 'inline') return;
    var nodes = node.nodes;

    if (nodes.size <= 1) return;

    var invalids = nodes.filter(function (desc, i) {
      if (desc.object != 'text') return;
      if (desc.text.length > 0) return;

      var prev = i > 0 ? nodes.get(i - 1) : null;
      var next = nodes.get(i + 1);

      // If it's the first node, and the next is a void, preserve it.
      if (!prev && next.object == 'inline') return;

      // It it's the last node, and the previous is an inline, preserve it.
      if (!next && prev.object == 'inline') return;

      // If it's surrounded by inlines, preserve it.
      if (next && prev && next.object == 'inline' && prev.object == 'inline') return;

      // Otherwise, remove it.
      return true;
    });

    if (!invalids.size) return;

    return function (change) {
      invalids.forEach(function (text) {
        change.removeNodeByKey(text.key, { normalize: false });
      });
    };
  }
}];

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS$9 = {
  plugins: []

  /**
   * Stack.
   *
   * @type {Stack}
   */

};
var Stack$1 = function (_Record) {
  inherits(Stack$$1, _Record);

  function Stack$$1() {
    classCallCheck(this, Stack$$1);
    return possibleConstructorReturn(this, (Stack$$1.__proto__ || Object.getPrototypeOf(Stack$$1)).apply(this, arguments));
  }

  createClass(Stack$$1, [{
    key: 'getPluginsWith',


    /**
     * Get all plugins with `property`.
     *
     * @param {String} property
     * @return {Array}
     */

    value: function getPluginsWith(property) {
      return this.plugins.filter(function (plugin) {
        return plugin[property] != null;
      });
    }

    /**
     * Iterate the plugins with `property`, returning the first non-null value.
     *
     * @param {String} property
     * @param {Any} ...args
     */

  }, {
    key: 'find',
    value: function find(property) {
      var plugins = this.getPluginsWith(property);

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = plugins[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var plugin = _step.value;

          var ret = plugin[property].apply(plugin, args);
          if (ret != null) return ret;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    /**
     * Iterate the plugins with `property`, returning all the non-null values.
     *
     * @param {String} property
     * @param {Any} ...args
     * @return {Array}
     */

  }, {
    key: 'map',
    value: function map(property) {
      var plugins = this.getPluginsWith(property);
      var array = [];

      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = plugins[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var plugin = _step2.value;

          var ret = plugin[property].apply(plugin, args);
          if (ret != null) array.push(ret);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return array;
    }

    /**
     * Iterate the plugins with `property`, breaking on any a non-null values.
     *
     * @param {String} property
     * @param {Any} ...args
     */

  }, {
    key: 'run',
    value: function run(property) {
      var plugins = this.getPluginsWith(property);

      for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = plugins[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var plugin = _step3.value;

          var ret = plugin[property].apply(plugin, args);
          if (ret != null) return;
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }

    /**
     * Iterate the plugins with `property`, reducing to a set of React children.
     *
     * @param {String} property
     * @param {Object} props
     * @param {Any} ...args
     */

  }, {
    key: 'render',
    value: function render(property, props) {
      var plugins = this.getPluginsWith(property).slice().reverse();
      var _props$children = props.children,
          children = _props$children === undefined ? null : _props$children;

      for (var _len4 = arguments.length, args = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
        args[_key4 - 2] = arguments[_key4];
      }

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {

        for (var _iterator4 = plugins[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var plugin = _step4.value;

          var ret = plugin[property].apply(plugin, [props].concat(args));
          if (ret == null) continue;
          props.children = children = ret;
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      return children;
    }
  }, {
    key: 'object',


    /**
     * Object.
     *
     * @return {String}
     */

    get: function get$$1() {
      return 'stack';
    }
  }, {
    key: 'kind',
    get: function get$$1() {
      slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
      return this.object;
    }
  }], [{
    key: 'create',

    /**
     * Constructor.
     *
     * @param {Object} attrs
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _attrs$plugins = attrs.plugins,
          plugins = _attrs$plugins === undefined ? [] : _attrs$plugins;

      var stack = new Stack$$1({ plugins: plugins });
      return stack;
    }

    /**
     * Check if `any` is a `Stack`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

  }, {
    key: 'isStack',
    value: function isStack(any) {
      return !!(any && any[MODEL_TYPES.STACK]);
    }
  }]);
  return Stack$$1;
}(Object(immutable__WEBPACK_IMPORTED_MODULE_1__["Record"])(DEFAULTS$9));

/**
 * Attach a pseudo-symbol for type checking.
 */

Stack$1.prototype[MODEL_TYPES.STACK] = true;

/**
 * Memoize read methods.
 */

memoize(Stack$1.prototype, ['getPluginsWith']);

/**
 * Debug.
 *
 * @type {Function}
 */

var debug$1 = debug__WEBPACK_IMPORTED_MODULE_5___default()('slate:schema');

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS$10 = {
  stack: Stack$1.create(),
  document: {},
  blocks: {},
  inlines: {}

  /**
   * Schema.
   *
   * @type {Schema}
   */

};
var Schema = function (_Record) {
  inherits(Schema, _Record);

  function Schema() {
    classCallCheck(this, Schema);
    return possibleConstructorReturn(this, (Schema.__proto__ || Object.getPrototypeOf(Schema)).apply(this, arguments));
  }

  createClass(Schema, [{
    key: 'getRule',


    /**
     * Get the rule for an `object`.
     *
     * @param {Mixed} object
     * @return {Object}
     */

    value: function getRule(object) {
      switch (object.object) {
        case 'document':
          return this.document;
        case 'block':
          return this.blocks[object.type];
        case 'inline':
          return this.inlines[object.type];
      }
    }

    /**
     * Get a dictionary of the parent rule validations by child type.
     *
     * @return {Object|Null}
     */

  }, {
    key: 'getParentRules',
    value: function getParentRules() {
      var blocks = this.blocks,
          inlines = this.inlines;

      var parents = {};

      for (var key in blocks) {
        var rule = blocks[key];
        if (rule.parent == null) continue;
        parents[key] = rule;
      }

      for (var _key in inlines) {
        var _rule = inlines[_key];
        if (_rule.parent == null) continue;
        parents[_key] = _rule;
      }

      return Object.keys(parents).length == 0 ? null : parents;
    }

    /**
     * Fail validation by returning a normalizing change function.
     *
     * @param {String} violation
     * @param {Object} context
     * @return {Function}
     */

  }, {
    key: 'fail',
    value: function fail(violation, context) {
      var _this2 = this;

      return function (change) {
        debug$1('normalizing', { violation: violation, context: context });
        var rule = context.rule;
        var size = change.operations.size;

        if (rule.normalize) rule.normalize(change, violation, context);
        if (change.operations.size > size) return;
        _this2.normalize(change, violation, context);
      };
    }

    /**
     * Normalize an invalid value with `violation` and `context`.
     *
     * @param {Change} change
     * @param {String} violation
     * @param {Mixed} context
     */

  }, {
    key: 'normalize',
    value: function normalize(change, violation, context) {
      switch (violation) {
        case slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["CHILD_OBJECT_INVALID"]:
        case slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["CHILD_TYPE_INVALID"]:
        case slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["CHILD_UNKNOWN"]:
        case slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["FIRST_CHILD_OBJECT_INVALID"]:
        case slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["FIRST_CHILD_TYPE_INVALID"]:
        case slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["LAST_CHILD_OBJECT_INVALID"]:
        case slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["LAST_CHILD_TYPE_INVALID"]:
          {
            var child = context.child,
                node = context.node;

            return child.object == 'text' && node.object == 'block' && node.nodes.size == 1 ? change.removeNodeByKey(node.key) : change.removeNodeByKey(child.key);
          }

        case slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["CHILD_REQUIRED"]:
        case slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["NODE_TEXT_INVALID"]:
        case slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["PARENT_OBJECT_INVALID"]:
        case slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["PARENT_TYPE_INVALID"]:
          {
            var _node = context.node;

            return _node.object == 'document' ? _node.nodes.forEach(function (child) {
              return change.removeNodeByKey(child.key);
            }) : change.removeNodeByKey(_node.key);
          }

        case slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["NODE_DATA_INVALID"]:
          {
            var _node2 = context.node,
                key = context.key;

            return _node2.data.get(key) === undefined && _node2.object != 'document' ? change.removeNodeByKey(_node2.key) : change.setNodeByKey(_node2.key, { data: _node2.data.delete(key) });
          }

        case slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["NODE_IS_VOID_INVALID"]:
          {
            var _node3 = context.node;

            return change.setNodeByKey(_node3.key, { isVoid: !_node3.isVoid });
          }

        case slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["NODE_MARK_INVALID"]:
          {
            var _node4 = context.node,
                mark = context.mark;

            return _node4.getTexts().forEach(function (t) {
              return change.removeMarkByKey(t.key, 0, t.text.length, mark);
            });
          }
      }
    }

    /**
     * Validate a `node` with the schema, returning a function that will fix the
     * invalid node, or void if the node is valid.
     *
     * @param {Node} node
     * @return {Function|Void}
     */

  }, {
    key: 'validateNode',
    value: function validateNode(node) {
      var _this3 = this;

      var ret = this.stack.find('validateNode', node);
      if (ret) return ret;

      if (node.object == 'text') return;

      var rule = this.getRule(node) || {};
      var parents = this.getParentRules();
      var ctx = { node: node, rule: rule };

      if (rule.isVoid != null) {
        if (node.isVoid != rule.isVoid) {
          return this.fail(slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["NODE_IS_VOID_INVALID"], ctx);
        }
      }

      if (rule.data != null) {
        for (var key in rule.data) {
          var fn = rule.data[key];
          var value = node.data.get(key);

          if (!fn(value)) {
            return this.fail(slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["NODE_DATA_INVALID"], _extends({}, ctx, { key: key, value: value }));
          }
        }
      }

      if (rule.marks != null) {
        var marks = node.getMarks().toArray();

        var _loop = function _loop(mark) {
          if (!rule.marks.some(function (def) {
            return def.type === mark.type;
          })) {
            return {
              v: _this3.fail(slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["NODE_MARK_INVALID"], _extends({}, ctx, { mark: mark }))
            };
          }
        };

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = marks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var mark = _step.value;

            var _ret = _loop(mark);

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

      if (rule.text != null) {
        var text = node.text;


        if (!rule.text.test(text)) {
          return this.fail(slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["NODE_TEXT_INVALID"], _extends({}, ctx, { text: text }));
        }
      }

      if (rule.first != null) {
        var _rule$first = rule.first,
            objects = _rule$first.objects,
            types = _rule$first.types;

        var child = node.nodes.first();

        if (child && objects && !objects.includes(child.object)) {
          return this.fail(slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["FIRST_CHILD_OBJECT_INVALID"], _extends({}, ctx, { child: child }));
        }

        if (child && types && !types.includes(child.type)) {
          return this.fail(slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["FIRST_CHILD_TYPE_INVALID"], _extends({}, ctx, { child: child }));
        }
      }

      if (rule.last != null) {
        var _rule$last = rule.last,
            _objects = _rule$last.objects,
            _types = _rule$last.types;

        var _child = node.nodes.last();

        if (_child && _objects && !_objects.includes(_child.object)) {
          return this.fail(slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["LAST_CHILD_OBJECT_INVALID"], _extends({}, ctx, { child: _child }));
        }

        if (_child && _types && !_types.includes(_child.type)) {
          return this.fail(slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["LAST_CHILD_TYPE_INVALID"], _extends({}, ctx, { child: _child }));
        }
      }

      if (rule.nodes != null || parents != null) {
        var nextDef = function nextDef() {
          offset = offset == null ? null : 0;
          def = defs.shift();
          min = def && (def.min == null ? 0 : def.min);
          max = def && (def.max == null ? Infinity : def.max);
          return !!def;
        };

        var nextChild = function nextChild() {
          index = index == null ? 0 : index + 1;
          offset = offset == null ? 0 : offset + 1;
          _child2 = children[index];
          if (max != null && offset == max) nextDef();
          return !!_child2;
        };

        var rewind = function rewind() {
          offset -= 1;
          index -= 1;
        };

        var children = node.nodes.toArray();
        var defs = rule.nodes != null ? rule.nodes.slice() : [];

        var offset = void 0;
        var min = void 0;
        var index = void 0;
        var def = void 0;
        var max = void 0;
        var _child2 = void 0;

        if (rule.nodes != null) {
          nextDef();
        }

        while (nextChild()) {
          if (parents != null && _child2.object != 'text' && _child2.type in parents) {
            var r = parents[_child2.type];

            if (r.parent.objects != null && !r.parent.objects.includes(node.object)) {
              return this.fail(slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["PARENT_OBJECT_INVALID"], {
                node: _child2,
                parent: node,
                rule: r
              });
            }

            if (r.parent.types != null && !r.parent.types.includes(node.type)) {
              return this.fail(slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["PARENT_TYPE_INVALID"], {
                node: _child2,
                parent: node,
                rule: r
              });
            }
          }

          if (rule.nodes != null) {
            if (!def) {
              return this.fail(slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["CHILD_UNKNOWN"], _extends({}, ctx, { child: _child2, index: index }));
            }

            if (def.objects != null && !def.objects.includes(_child2.object)) {
              if (offset >= min && nextDef()) {
                rewind();
                continue;
              }
              return this.fail(slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["CHILD_OBJECT_INVALID"], _extends({}, ctx, { child: _child2, index: index }));
            }

            if (def.types != null && !def.types.includes(_child2.type)) {
              if (offset >= min && nextDef()) {
                rewind();
                continue;
              }
              return this.fail(slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["CHILD_TYPE_INVALID"], _extends({}, ctx, { child: _child2, index: index }));
            }
          }
        }

        if (rule.nodes != null) {
          while (min != null) {
            if (offset < min) {
              return this.fail(slate_schema_violations__WEBPACK_IMPORTED_MODULE_8__["CHILD_REQUIRED"], _extends({}, ctx, { index: index }));
            }

            nextDef();
          }
        }
      }
    }

    /**
     * Return a JSON representation of the schema.
     *
     * @return {Object}
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
      var object = {
        object: this.object,
        document: this.document,
        blocks: this.blocks,
        inlines: this.inlines
      };

      return object;
    }

    /**
     * Alias `toJS`.
     */

  }, {
    key: 'toJS',
    value: function toJS() {
      return this.toJSON();
    }
  }, {
    key: 'object',


    /**
     * Object.
     *
     * @return {String}
     */

    get: function get$$1() {
      return 'schema';
    }
  }, {
    key: 'kind',
    get: function get$$1() {
      slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
      return this.object;
    }
  }], [{
    key: 'create',

    /**
     * Create a new `Schema` with `attrs`.
     *
     * @param {Object|Schema} attrs
     * @return {Schema}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Schema.isSchema(attrs)) {
        return attrs;
      }

      if (is_plain_object__WEBPACK_IMPORTED_MODULE_0___default()(attrs)) {
        return Schema.fromJSON(attrs);
      }

      throw new Error('`Schema.create` only accepts objects or schemas, but you passed it: ' + attrs);
    }

    /**
     * Create a `Schema` from a JSON `object`.
     *
     * @param {Object} object
     * @return {Schema}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      if (Schema.isSchema(object)) {
        return object;
      }

      var plugins = object.plugins;


      if (object.rules) {
        throw new Error('Schemas in Slate have changed! They are no longer accept a `rules` property.');
      }

      if (object.nodes) {
        throw new Error('Schemas in Slate have changed! They are no longer accept a `nodes` property.');
      }

      if (!plugins) {
        plugins = [{ schema: object }];
      }

      var schema = resolveSchema(plugins);
      var stack = Stack$1.create({ plugins: [].concat(toConsumableArray(CORE_SCHEMA_RULES), toConsumableArray(plugins)) });
      var ret = new Schema(_extends({}, schema, { stack: stack }));
      return ret;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isSchema',


    /**
     * Check if `any` is a `Schema`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isSchema(any) {
      return !!(any && any[MODEL_TYPES.SCHEMA]);
    }
  }]);
  return Schema;
}(Object(immutable__WEBPACK_IMPORTED_MODULE_1__["Record"])(DEFAULTS$10));

/**
 * Resolve a set of schema rules from an array of `plugins`.
 *
 * @param {Array} plugins
 * @return {Object}
 */

Schema.fromJS = Schema.fromJSON;
function resolveSchema() {
  var plugins = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  var schema = {
    document: {},
    blocks: {},
    inlines: {}
  };

  plugins.slice().reverse().forEach(function (plugin) {
    if (!plugin.schema) return;

    if (plugin.schema.rules) {
      throw new Error('Schemas in Slate have changed! They are no longer accept a `rules` property.');
    }

    if (plugin.schema.nodes) {
      throw new Error('Schemas in Slate have changed! They are no longer accept a `nodes` property.');
    }

    var _plugin$schema = plugin.schema,
        _plugin$schema$docume = _plugin$schema.document,
        document = _plugin$schema$docume === undefined ? {} : _plugin$schema$docume,
        _plugin$schema$blocks = _plugin$schema.blocks,
        blocks = _plugin$schema$blocks === undefined ? {} : _plugin$schema$blocks,
        _plugin$schema$inline = _plugin$schema.inlines,
        inlines = _plugin$schema$inline === undefined ? {} : _plugin$schema$inline;

    var d = resolveDocumentRule(document);
    var bs = {};
    var is$$1 = {};

    for (var key in blocks) {
      bs[key] = resolveNodeRule('block', key, blocks[key]);
    }

    for (var _key2 in inlines) {
      is$$1[_key2] = resolveNodeRule('inline', _key2, inlines[_key2]);
    }

    lodash_mergeWith__WEBPACK_IMPORTED_MODULE_7___default()(schema.document, d, customizer);
    lodash_mergeWith__WEBPACK_IMPORTED_MODULE_7___default()(schema.blocks, bs, customizer);
    lodash_mergeWith__WEBPACK_IMPORTED_MODULE_7___default()(schema.inlines, is$$1, customizer);
  });

  return schema;
}

/**
 * Resolve a document rule `obj`.
 *
 * @param {Object} obj
 * @return {Object}
 */

function resolveDocumentRule(obj) {
  return _extends({
    data: {},
    nodes: null
  }, obj);
}

/**
 * Resolve a node rule with `type` from `obj`.
 *
 * @param {String} object
 * @param {String} type
 * @param {Object} obj
 * @return {Object}
 */

function resolveNodeRule(object, type, obj) {
  return _extends({
    data: {},
    isVoid: null,
    nodes: null,
    first: null,
    last: null,
    parent: null,
    text: null
  }, obj);
}

/**
 * A Lodash customizer for merging schema definitions. Special cases `objects`
 * and `types` arrays to be unioned, and ignores new `null` values.
 *
 * @param {Mixed} target
 * @param {Mixed} source
 * @return {Array|Void}
 */

function customizer(target, source, key) {
  if (key == 'objects' || key == 'types') {
    return target == null ? source : target.concat(source);
  } else {
    return source == null ? target : source;
  }
}

/**
 * Attach a pseudo-symbol for type checking.
 */

Schema.prototype[MODEL_TYPES.SCHEMA] = true;

/**
 * Memoize read methods.
 */

memoize(Schema.prototype, ['getParentRules']);

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS$11 = {
  data: new immutable__WEBPACK_IMPORTED_MODULE_1__["Map"](),
  decorations: null,
  document: Document.create(),
  history: History.create(),
  schema: Schema.create(),
  selection: Range.create()

  /**
   * Value.
   *
   * @type {Value}
   */

};
var Value = function (_Record) {
  inherits(Value, _Record);

  function Value() {
    classCallCheck(this, Value);
    return possibleConstructorReturn(this, (Value.__proto__ || Object.getPrototypeOf(Value)).apply(this, arguments));
  }

  createClass(Value, [{
    key: 'change',


    /**
     * Create a new `Change` with the current value as a starting point.
     *
     * @param {Object} attrs
     * @return {Change}
     */

    value: function change() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return new Change(_extends({}, attrs, { value: this }));
    }

    /**
     * Return a JSON representation of the value.
     *
     * @param {Object} options
     * @return {Object}
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var object = {
        object: this.object,
        document: this.document.toJSON(options)
      };

      if (options.preserveData) {
        object.data = this.data.toJSON();
      }

      if (options.preserveDecorations) {
        object.decorations = this.decorations ? this.decorations.toArray().map(function (d) {
          return d.toJSON();
        }) : null;
      }

      if (options.preserveHistory) {
        object.history = this.history.toJSON();
      }

      if (options.preserveSelection) {
        object.selection = this.selection.toJSON();
      }

      if (options.preserveSchema) {
        object.schema = this.schema.toJSON();
      }

      if (options.preserveSelection && !options.preserveKeys) {
        var document = this.document,
            selection = this.selection;

        object.selection.anchorPath = selection.isSet ? document.getPath(selection.anchorKey) : null;
        object.selection.focusPath = selection.isSet ? document.getPath(selection.focusKey) : null;
        delete object.selection.anchorKey;
        delete object.selection.focusKey;
      }

      return object;
    }

    /**
     * Alias `toJS`.
     */

  }, {
    key: 'toJS',
    value: function toJS(options) {
      return this.toJSON(options);
    }
  }, {
    key: 'object',


    /**
     * Object.
     *
     * @return {String}
     */

    get: function get$$1() {
      return 'value';
    }
  }, {
    key: 'kind',
    get: function get$$1() {
      slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
      return this.object;
    }

    /**
     * Are there undoable events?
     *
     * @return {Boolean}
     */

  }, {
    key: 'hasUndos',
    get: function get$$1() {
      return this.history.undos.size > 0;
    }

    /**
     * Are there redoable events?
     *
     * @return {Boolean}
     */

  }, {
    key: 'hasRedos',
    get: function get$$1() {
      return this.history.redos.size > 0;
    }

    /**
     * Is the current selection blurred?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isBlurred',
    get: function get$$1() {
      return this.selection.isBlurred;
    }

    /**
     * Is the current selection focused?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isFocused',
    get: function get$$1() {
      return this.selection.isFocused;
    }

    /**
     * Is the current selection collapsed?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isCollapsed',
    get: function get$$1() {
      return this.selection.isCollapsed;
    }

    /**
     * Is the current selection expanded?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isExpanded',
    get: function get$$1() {
      return this.selection.isExpanded;
    }

    /**
     * Is the current selection backward?
     *
     * @return {Boolean} isBackward
     */

  }, {
    key: 'isBackward',
    get: function get$$1() {
      return this.selection.isBackward;
    }

    /**
     * Is the current selection forward?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isForward',
    get: function get$$1() {
      return this.selection.isForward;
    }

    /**
     * Get the current start key.
     *
     * @return {String}
     */

  }, {
    key: 'startKey',
    get: function get$$1() {
      return this.selection.startKey;
    }

    /**
     * Get the current end key.
     *
     * @return {String}
     */

  }, {
    key: 'endKey',
    get: function get$$1() {
      return this.selection.endKey;
    }

    /**
     * Get the current start offset.
     *
     * @return {String}
     */

  }, {
    key: 'startOffset',
    get: function get$$1() {
      return this.selection.startOffset;
    }

    /**
     * Get the current end offset.
     *
     * @return {String}
     */

  }, {
    key: 'endOffset',
    get: function get$$1() {
      return this.selection.endOffset;
    }

    /**
     * Get the current anchor key.
     *
     * @return {String}
     */

  }, {
    key: 'anchorKey',
    get: function get$$1() {
      return this.selection.anchorKey;
    }

    /**
     * Get the current focus key.
     *
     * @return {String}
     */

  }, {
    key: 'focusKey',
    get: function get$$1() {
      return this.selection.focusKey;
    }

    /**
     * Get the current anchor offset.
     *
     * @return {String}
     */

  }, {
    key: 'anchorOffset',
    get: function get$$1() {
      return this.selection.anchorOffset;
    }

    /**
     * Get the current focus offset.
     *
     * @return {String}
     */

  }, {
    key: 'focusOffset',
    get: function get$$1() {
      return this.selection.focusOffset;
    }

    /**
     * Get the current start text node's closest block parent.
     *
     * @return {Block}
     */

  }, {
    key: 'startBlock',
    get: function get$$1() {
      return this.startKey && this.document.getClosestBlock(this.startKey);
    }

    /**
     * Get the current end text node's closest block parent.
     *
     * @return {Block}
     */

  }, {
    key: 'endBlock',
    get: function get$$1() {
      return this.endKey && this.document.getClosestBlock(this.endKey);
    }

    /**
     * Get the current anchor text node's closest block parent.
     *
     * @return {Block}
     */

  }, {
    key: 'anchorBlock',
    get: function get$$1() {
      return this.anchorKey && this.document.getClosestBlock(this.anchorKey);
    }

    /**
     * Get the current focus text node's closest block parent.
     *
     * @return {Block}
     */

  }, {
    key: 'focusBlock',
    get: function get$$1() {
      return this.focusKey && this.document.getClosestBlock(this.focusKey);
    }

    /**
     * Get the current start text node's closest inline parent.
     *
     * @return {Inline}
     */

  }, {
    key: 'startInline',
    get: function get$$1() {
      return this.startKey && this.document.getClosestInline(this.startKey);
    }

    /**
     * Get the current end text node's closest inline parent.
     *
     * @return {Inline}
     */

  }, {
    key: 'endInline',
    get: function get$$1() {
      return this.endKey && this.document.getClosestInline(this.endKey);
    }

    /**
     * Get the current anchor text node's closest inline parent.
     *
     * @return {Inline}
     */

  }, {
    key: 'anchorInline',
    get: function get$$1() {
      return this.anchorKey && this.document.getClosestInline(this.anchorKey);
    }

    /**
     * Get the current focus text node's closest inline parent.
     *
     * @return {Inline}
     */

  }, {
    key: 'focusInline',
    get: function get$$1() {
      return this.focusKey && this.document.getClosestInline(this.focusKey);
    }

    /**
     * Get the current start text node.
     *
     * @return {Text}
     */

  }, {
    key: 'startText',
    get: function get$$1() {
      return this.startKey && this.document.getDescendant(this.startKey);
    }

    /**
     * Get the current end node.
     *
     * @return {Text}
     */

  }, {
    key: 'endText',
    get: function get$$1() {
      return this.endKey && this.document.getDescendant(this.endKey);
    }

    /**
     * Get the current anchor node.
     *
     * @return {Text}
     */

  }, {
    key: 'anchorText',
    get: function get$$1() {
      return this.anchorKey && this.document.getDescendant(this.anchorKey);
    }

    /**
     * Get the current focus node.
     *
     * @return {Text}
     */

  }, {
    key: 'focusText',
    get: function get$$1() {
      return this.focusKey && this.document.getDescendant(this.focusKey);
    }

    /**
     * Get the next block node.
     *
     * @return {Block}
     */

  }, {
    key: 'nextBlock',
    get: function get$$1() {
      return this.endKey && this.document.getNextBlock(this.endKey);
    }

    /**
     * Get the previous block node.
     *
     * @return {Block}
     */

  }, {
    key: 'previousBlock',
    get: function get$$1() {
      return this.startKey && this.document.getPreviousBlock(this.startKey);
    }

    /**
     * Get the next inline node.
     *
     * @return {Inline}
     */

  }, {
    key: 'nextInline',
    get: function get$$1() {
      return this.endKey && this.document.getNextInline(this.endKey);
    }

    /**
     * Get the previous inline node.
     *
     * @return {Inline}
     */

  }, {
    key: 'previousInline',
    get: function get$$1() {
      return this.startKey && this.document.getPreviousInline(this.startKey);
    }

    /**
     * Get the next text node.
     *
     * @return {Text}
     */

  }, {
    key: 'nextText',
    get: function get$$1() {
      return this.endKey && this.document.getNextText(this.endKey);
    }

    /**
     * Get the previous text node.
     *
     * @return {Text}
     */

  }, {
    key: 'previousText',
    get: function get$$1() {
      return this.startKey && this.document.getPreviousText(this.startKey);
    }

    /**
     * Get the characters in the current selection.
     *
     * @return {List<Character>}
     */

  }, {
    key: 'characters',
    get: function get$$1() {
      return this.selection.isUnset ? new immutable__WEBPACK_IMPORTED_MODULE_1__["List"]() : this.document.getCharactersAtRange(this.selection);
    }

    /**
     * Get the marks of the current selection.
     *
     * @return {Set<Mark>}
     */

  }, {
    key: 'marks',
    get: function get$$1() {
      return this.selection.isUnset ? new immutable__WEBPACK_IMPORTED_MODULE_1__["Set"]() : this.selection.marks || this.document.getMarksAtRange(this.selection);
    }

    /**
     * Get the active marks of the current selection.
     *
     * @return {Set<Mark>}
     */

  }, {
    key: 'activeMarks',
    get: function get$$1() {
      return this.selection.isUnset ? new immutable__WEBPACK_IMPORTED_MODULE_1__["Set"]() : this.selection.marks || this.document.getActiveMarksAtRange(this.selection);
    }

    /**
     * Get the block nodes in the current selection.
     *
     * @return {List<Block>}
     */

  }, {
    key: 'blocks',
    get: function get$$1() {
      return this.selection.isUnset ? new immutable__WEBPACK_IMPORTED_MODULE_1__["List"]() : this.document.getBlocksAtRange(this.selection);
    }

    /**
     * Get the fragment of the current selection.
     *
     * @return {Document}
     */

  }, {
    key: 'fragment',
    get: function get$$1() {
      return this.selection.isUnset ? Document.create() : this.document.getFragmentAtRange(this.selection);
    }

    /**
     * Get the inline nodes in the current selection.
     *
     * @return {List<Inline>}
     */

  }, {
    key: 'inlines',
    get: function get$$1() {
      return this.selection.isUnset ? new immutable__WEBPACK_IMPORTED_MODULE_1__["List"]() : this.document.getInlinesAtRange(this.selection);
    }

    /**
     * Get the text nodes in the current selection.
     *
     * @return {List<Text>}
     */

  }, {
    key: 'texts',
    get: function get$$1() {
      return this.selection.isUnset ? new immutable__WEBPACK_IMPORTED_MODULE_1__["List"]() : this.document.getTextsAtRange(this.selection);
    }

    /**
     * Check whether the selection is empty.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isEmpty',
    get: function get$$1() {
      if (this.isCollapsed) return true;
      if (this.endOffset != 0 && this.startOffset != 0) return false;
      return this.fragment.isEmpty;
    }

    /**
     * Check whether the selection is collapsed in a void node.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isInVoid',
    get: function get$$1() {
      if (this.isExpanded) return false;
      return this.document.hasVoidParent(this.startKey);
    }
  }], [{
    key: 'create',

    /**
     * Create a new `Value` with `attrs`.
     *
     * @param {Object|Value} attrs
     * @param {Object} options
     * @return {Value}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (Value.isValue(attrs)) {
        return attrs;
      }

      if (is_plain_object__WEBPACK_IMPORTED_MODULE_0___default()(attrs)) {
        return Value.fromJSON(attrs, options);
      }

      throw new Error('`Value.create` only accepts objects or values, but you passed it: ' + attrs);
    }

    /**
     * Create a dictionary of settable value properties from `attrs`.
     *
     * @param {Object|Value} attrs
     * @return {Object}
     */

  }, {
    key: 'createProperties',
    value: function createProperties() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Value.isValue(attrs)) {
        return {
          data: attrs.data,
          decorations: attrs.decorations,
          schema: attrs.schema
        };
      }

      if (is_plain_object__WEBPACK_IMPORTED_MODULE_0___default()(attrs)) {
        var props = {};
        if ('data' in attrs) props.data = Data.create(attrs.data);
        if ('decorations' in attrs) props.decorations = Range.createList(attrs.decorations);
        if ('schema' in attrs) props.schema = Schema.create(attrs.schema);
        return props;
      }

      throw new Error('`Value.createProperties` only accepts objects or values, but you passed it: ' + attrs);
    }

    /**
     * Create a `Value` from a JSON `object`.
     *
     * @param {Object} object
     * @param {Object} options
     *   @property {Boolean} normalize
     *   @property {Array} plugins
     * @return {Value}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var _object$document = object.document,
          document = _object$document === undefined ? {} : _object$document,
          _object$selection = object.selection,
          selection = _object$selection === undefined ? {} : _object$selection,
          _object$schema = object.schema,
          schema = _object$schema === undefined ? {} : _object$schema;


      var data = new immutable__WEBPACK_IMPORTED_MODULE_1__["Map"]();

      document = Document.fromJSON(document);
      selection = Range.fromJSON(selection);
      schema = Schema.fromJSON(schema);

      // Allow plugins to set a default value for `data`.
      if (options.plugins) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = options.plugins[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var plugin = _step.value;

            if (plugin.data) data = data.merge(plugin.data);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

      // Then merge in the `data` provided.
      if ('data' in object) {
        data = data.merge(object.data);
      }

      if (selection.isUnset) {
        var text = document.getFirstText();
        if (text) selection = selection.collapseToStartOf(text);
      }

      var value = new Value({
        data: data,
        document: document,
        selection: selection,
        schema: schema
      });

      if (options.normalize !== false) {
        value = value.change({ save: false }).normalize().value;
      }

      return value;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isValue',


    /**
     * Check if a `value` is a `Value`.
     *
     * @param {Any} value
     * @return {Boolean}
     */

    value: function isValue(value) {
      return !!(value && value[MODEL_TYPES.VALUE]);
    }
  }]);
  return Value;
}(Object(immutable__WEBPACK_IMPORTED_MODULE_1__["Record"])(DEFAULTS$11));

/**
 * Attach a pseudo-symbol for type checking.
 */

Value.fromJS = Value.fromJSON;
Value.prototype[MODEL_TYPES.VALUE] = true;

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS$12 = {
  length: undefined,
  mark: undefined,
  marks: undefined,
  newPath: undefined,
  node: undefined,
  offset: undefined,
  path: undefined,
  position: undefined,
  properties: undefined,
  selection: undefined,
  target: undefined,
  text: undefined,
  type: undefined,
  value: undefined

  /**
   * Operation.
   *
   * @type {Operation}
   */

};
var Operation = function (_Record) {
  inherits(Operation, _Record);

  function Operation() {
    classCallCheck(this, Operation);
    return possibleConstructorReturn(this, (Operation.__proto__ || Object.getPrototypeOf(Operation)).apply(this, arguments));
  }

  createClass(Operation, [{
    key: 'toJSON',


    /**
     * Return a JSON representation of the operation.
     *
     * @param {Object} options
     * @return {Object}
     */

    value: function toJSON() {
      var object = this.object,
          type = this.type;

      var json = { object: object, type: type };
      var ATTRIBUTES = OPERATION_ATTRIBUTES[type];

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = ATTRIBUTES[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;

          var value = this[key];

          // Skip keys for objects that should not be serialized, and are only used
          // for providing the local-only invert behavior for the history stack.
          if (key == 'document') continue;
          if (key == 'selection') continue;
          if (key == 'value') continue;
          if (key == 'node' && type != 'insert_node') continue;

          if (key == 'mark' || key == 'marks' || key == 'node') {
            value = value.toJSON();
          }

          if (key == 'properties' && type == 'merge_node') {
            var v = {};
            if ('data' in value) v.data = value.data.toJS();
            if ('type' in value) v.type = value.type;
            value = v;
          }

          if (key == 'properties' && type == 'set_mark') {
            var _v = {};
            if ('data' in value) _v.data = value.data.toJS();
            if ('type' in value) _v.type = value.type;
            value = _v;
          }

          if (key == 'properties' && type == 'set_node') {
            var _v2 = {};
            if ('data' in value) _v2.data = value.data.toJS();
            if ('isVoid' in value) _v2.isVoid = value.isVoid;
            if ('type' in value) _v2.type = value.type;
            value = _v2;
          }

          if (key == 'properties' && type == 'set_selection') {
            var _v3 = {};
            if ('anchorOffset' in value) _v3.anchorOffset = value.anchorOffset;
            if ('anchorPath' in value) _v3.anchorPath = value.anchorPath;
            if ('focusOffset' in value) _v3.focusOffset = value.focusOffset;
            if ('focusPath' in value) _v3.focusPath = value.focusPath;
            if ('isBackward' in value) _v3.isBackward = value.isBackward;
            if ('isFocused' in value) _v3.isFocused = value.isFocused;
            if ('marks' in value) _v3.marks = value.marks == null ? null : value.marks.toJSON();
            value = _v3;
          }

          if (key == 'properties' && type == 'set_value') {
            var _v4 = {};
            if ('data' in value) _v4.data = value.data.toJS();
            if ('decorations' in value) _v4.decorations = value.decorations.toJS();
            if ('schema' in value) _v4.schema = value.schema.toJS();
            value = _v4;
          }

          if (key == 'properties' && type == 'split_node') {
            var _v5 = {};
            if ('data' in value) _v5.data = value.data.toJS();
            if ('type' in value) _v5.type = value.type;
            value = _v5;
          }

          json[key] = value;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return json;
    }

    /**
     * Alias `toJS`.
     */

  }, {
    key: 'toJS',
    value: function toJS(options) {
      return this.toJSON(options);
    }
  }, {
    key: 'object',


    /**
     * Object.
     *
     * @return {String}
     */

    get: function get$$1() {
      return 'operation';
    }
  }, {
    key: 'kind',
    get: function get$$1() {
      slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
      return this.object;
    }
  }], [{
    key: 'create',

    /**
     * Create a new `Operation` with `attrs`.
     *
     * @param {Object|Array|List|String|Operation} attrs
     * @return {Operation}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Operation.isOperation(attrs)) {
        return attrs;
      }

      if (is_plain_object__WEBPACK_IMPORTED_MODULE_0___default()(attrs)) {
        return Operation.fromJSON(attrs);
      }

      throw new Error('`Operation.create` only accepts objects or operations, but you passed it: ' + attrs);
    }

    /**
     * Create a list of `Operations` from `elements`.
     *
     * @param {Array<Operation|Object>|List<Operation|Object>} elements
     * @return {List<Operation>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (immutable__WEBPACK_IMPORTED_MODULE_1__["List"].isList(elements) || Array.isArray(elements)) {
        var list = new immutable__WEBPACK_IMPORTED_MODULE_1__["List"](elements.map(Operation.create));
        return list;
      }

      throw new Error('`Operation.createList` only accepts arrays or lists, but you passed it: ' + elements);
    }

    /**
     * Create a `Operation` from a JSON `object`.
     *
     * @param {Object|Operation} object
     * @return {Operation}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      if (Operation.isOperation(object)) {
        return object;
      }

      var type = object.type,
          value = object.value;

      var ATTRIBUTES = OPERATION_ATTRIBUTES[type];
      var attrs = { type: type };

      if (!ATTRIBUTES) {
        throw new Error('`Operation.fromJSON` was passed an unrecognized operation type: "' + type + '"');
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = ATTRIBUTES[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var key = _step2.value;

          var v = object[key];

          if (v === undefined) {
            // Skip keys for objects that should not be serialized, and are only used
            // for providing the local-only invert behavior for the history stack.
            if (key == 'document') continue;
            if (key == 'selection') continue;
            if (key == 'value') continue;
            if (key == 'node' && type != 'insert_node') continue;

            throw new Error('`Operation.fromJSON` was passed a "' + type + '" operation without the required "' + key + '" attribute.');
          }

          if (key == 'mark') {
            v = Mark.create(v);
          }

          if (key == 'marks' && v != null) {
            v = Mark.createSet(v);
          }

          if (key == 'node') {
            v = Node.create(v);
          }

          if (key == 'selection') {
            v = Range.create(v);
          }

          if (key == 'value') {
            v = Value.create(v);
          }

          if (key == 'properties' && type == 'merge_node') {
            v = Node.createProperties(v);
          }

          if (key == 'properties' && type == 'set_mark') {
            v = Mark.createProperties(v);
          }

          if (key == 'properties' && type == 'set_node') {
            v = Node.createProperties(v);
          }

          if (key == 'properties' && type == 'set_selection') {
            var _v6 = v,
                anchorKey = _v6.anchorKey,
                focusKey = _v6.focusKey,
                rest = objectWithoutProperties(_v6, ['anchorKey', 'focusKey']);

            v = Range.createProperties(rest);

            if (anchorKey !== undefined) {
              v.anchorPath = anchorKey === null ? null : value.document.getPath(anchorKey);
            }

            if (focusKey !== undefined) {
              v.focusPath = focusKey === null ? null : value.document.getPath(focusKey);
            }
          }

          if (key == 'properties' && type == 'set_value') {
            v = Value.createProperties(v);
          }

          if (key == 'properties' && type == 'split_node') {
            v = Node.createProperties(v);
          }

          attrs[key] = v;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      var node = new Operation(attrs);
      return node;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isOperation',


    /**
     * Check if `any` is a `Operation`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isOperation(any) {
      return !!(any && any[MODEL_TYPES.OPERATION]);
    }

    /**
     * Check if `any` is a list of operations.
     *
     * @param {Any} any
     * @return {Boolean}
     */

  }, {
    key: 'isOperationList',
    value: function isOperationList(any) {
      return immutable__WEBPACK_IMPORTED_MODULE_1__["List"].isList(any) && any.every(function (item) {
        return Operation.isOperation(item);
      });
    }
  }]);
  return Operation;
}(Object(immutable__WEBPACK_IMPORTED_MODULE_1__["Record"])(DEFAULTS$12));

/**
 * Attach a pseudo-symbol for type checking.
 */

Operation.fromJS = Operation.fromJSON;
Operation.prototype[MODEL_TYPES.OPERATION] = true;

/**
 * Debug.
 *
 * @type {Function}
 */

var debug$2 = debug__WEBPACK_IMPORTED_MODULE_5___default()('slate:operation:invert');

/**
 * Invert an `op`.
 *
 * @param {Object} op
 * @return {Object}
 */

function invertOperation(op) {
  op = Operation.create(op);
  var _op = op,
      type = _op.type;

  debug$2(type, op);

  /**
   * Insert node.
   */

  if (type == 'insert_node') {
    var inverse = op.set('type', 'remove_node');
    return inverse;
  }

  /**
   * Remove node.
   */

  if (type == 'remove_node') {
    var _inverse = op.set('type', 'insert_node');
    return _inverse;
  }

  /**
   * Move node.
   */

  if (type == 'move_node') {
    var _op2 = op,
        newPath = _op2.newPath,
        path = _op2.path;

    var inversePath = newPath;
    var inverseNewPath = path;

    var pathLast = path.length - 1;
    var newPathLast = newPath.length - 1;

    // If the node's old position was a left sibling of an ancestor of
    // its new position, we need to adjust part of the path by -1.
    if (path.length < inversePath.length && path.slice(0, pathLast).every(function (e, i) {
      return e == inversePath[i];
    }) && path[pathLast] < inversePath[pathLast]) {
      inversePath = inversePath.slice(0, pathLast).concat([inversePath[pathLast] - 1]).concat(inversePath.slice(pathLast + 1, inversePath.length));
    }

    // If the node's new position is an ancestor of the old position,
    // or a left sibling of an ancestor of its old position, we need
    // to adjust part of the path by 1.
    if (newPath.length < inverseNewPath.length && newPath.slice(0, newPathLast).every(function (e, i) {
      return e == inverseNewPath[i];
    }) && newPath[newPathLast] <= inverseNewPath[newPathLast]) {
      inverseNewPath = inverseNewPath.slice(0, newPathLast).concat([inverseNewPath[newPathLast] + 1]).concat(inverseNewPath.slice(newPathLast + 1, inverseNewPath.length));
    }

    var _inverse2 = op.set('path', inversePath).set('newPath', inverseNewPath);
    return _inverse2;
  }

  /**
   * Merge node.
   */

  if (type == 'merge_node') {
    var _op3 = op,
        _path = _op3.path;
    var length = _path.length;

    var last = length - 1;
    var _inversePath = _path.slice(0, last).concat([_path[last] - 1]);
    var _inverse3 = op.set('type', 'split_node').set('path', _inversePath);
    return _inverse3;
  }

  /**
   * Split node.
   */

  if (type == 'split_node') {
    var _op4 = op,
        _path2 = _op4.path;
    var _length = _path2.length;

    var _last = _length - 1;
    var _inversePath2 = _path2.slice(0, _last).concat([_path2[_last] + 1]);
    var _inverse4 = op.set('type', 'merge_node').set('path', _inversePath2);
    return _inverse4;
  }

  /**
   * Set node.
   */

  if (type == 'set_node') {
    var _op5 = op,
        properties = _op5.properties,
        node = _op5.node;

    var inverseNode = node.merge(properties);
    var inverseProperties = lodash_pick__WEBPACK_IMPORTED_MODULE_9___default()(node, Object.keys(properties));
    var _inverse5 = op.set('node', inverseNode).set('properties', inverseProperties);
    return _inverse5;
  }

  /**
   * Insert text.
   */

  if (type == 'insert_text') {
    var _inverse6 = op.set('type', 'remove_text');
    return _inverse6;
  }

  /**
   * Remove text.
   */

  if (type == 'remove_text') {
    var _inverse7 = op.set('type', 'insert_text');
    return _inverse7;
  }

  /**
   * Add mark.
   */

  if (type == 'add_mark') {
    var _inverse8 = op.set('type', 'remove_mark');
    return _inverse8;
  }

  /**
   * Remove mark.
   */

  if (type == 'remove_mark') {
    var _inverse9 = op.set('type', 'add_mark');
    return _inverse9;
  }

  /**
   * Set mark.
   */

  if (type == 'set_mark') {
    var _op6 = op,
        _properties = _op6.properties,
        mark = _op6.mark;

    var inverseMark = mark.merge(_properties);
    var _inverseProperties = lodash_pick__WEBPACK_IMPORTED_MODULE_9___default()(mark, Object.keys(_properties));
    var _inverse10 = op.set('mark', inverseMark).set('properties', _inverseProperties);
    return _inverse10;
  }

  /**
   * Set selection.
   */

  if (type == 'set_selection') {
    var _op7 = op,
        _properties2 = _op7.properties,
        selection = _op7.selection,
        value = _op7.value;
    var anchorPath = _properties2.anchorPath,
        focusPath = _properties2.focusPath,
        props = objectWithoutProperties(_properties2, ['anchorPath', 'focusPath']);
    var document = value.document;


    if (anchorPath !== undefined) {
      props.anchorKey = anchorPath === null ? null : document.assertPath(anchorPath).key;
    }

    if (focusPath !== undefined) {
      props.focusKey = focusPath === null ? null : document.assertPath(focusPath).key;
    }

    var inverseSelection = selection.merge(props);
    var inverseProps = lodash_pick__WEBPACK_IMPORTED_MODULE_9___default()(selection, Object.keys(props));

    if (anchorPath !== undefined) {
      inverseProps.anchorPath = inverseProps.anchorKey === null ? null : document.getPath(inverseProps.anchorKey);
      delete inverseProps.anchorKey;
    }

    if (focusPath !== undefined) {
      inverseProps.focusPath = inverseProps.focusKey === null ? null : document.getPath(inverseProps.focusKey);
      delete inverseProps.focusKey;
    }

    var _inverse11 = op.set('selection', inverseSelection).set('properties', inverseProps);
    return _inverse11;
  }

  /**
   * Set value.
   */

  if (type == 'set_value') {
    var _op8 = op,
        _properties3 = _op8.properties,
        _value = _op8.value;

    var inverseValue = _value.merge(_properties3);
    var _inverseProperties2 = lodash_pick__WEBPACK_IMPORTED_MODULE_9___default()(_value, Object.keys(_properties3));
    var _inverse12 = op.set('value', inverseValue).set('properties', _inverseProperties2);
    return _inverse12;
  }
}

/**
 * Changes.
 *
 * @type {Object}
 */

var Changes$3 = {};

/**
 * Redo to the next value in the history.
 *
 * @param {Change} change
 */

Changes$3.redo = function (change) {
  var value = change.value;
  var _value = value,
      history = _value.history;

  if (!history) return;

  var _history = history,
      undos = _history.undos,
      redos = _history.redos;

  var next = redos.peek();
  if (!next) return;

  // Shift the next value into the undo stack.
  redos = redos.pop();
  undos = undos.push(next);

  // Replay the next operations.
  next.forEach(function (op) {
    var _op = op,
        type = _op.type,
        properties = _op.properties;

    // When the operation mutates the selection, omit its `isFocused` value to
    // prevent the editor focus from changing during redoing.

    if (type == 'set_selection') {
      op = op.set('properties', lodash_omit__WEBPACK_IMPORTED_MODULE_10___default()(properties, 'isFocused'));
    }

    change.applyOperation(op, { save: false });
  });

  // Update the history.
  value = change.value;
  history = history.set('undos', undos).set('redos', redos);
  value = value.set('history', history);
  change.value = value;
};

/**
 * Undo the previous operations in the history.
 *
 * @param {Change} change
 */

Changes$3.undo = function (change) {
  var value = change.value;
  var _value2 = value,
      history = _value2.history;

  if (!history) return;

  var _history2 = history,
      undos = _history2.undos,
      redos = _history2.redos;

  var previous = undos.peek();
  if (!previous) return;

  // Shift the previous operations into the redo stack.
  undos = undos.pop();
  redos = redos.push(previous);

  // Replay the inverse of the previous operations.
  previous.slice().reverse().map(invertOperation).forEach(function (inverse) {
    var _inverse = inverse,
        type = _inverse.type,
        properties = _inverse.properties;

    // When the operation mutates the selection, omit its `isFocused` value to
    // prevent the editor focus from changing during undoing.

    if (type == 'set_selection') {
      inverse = inverse.set('properties', lodash_omit__WEBPACK_IMPORTED_MODULE_10___default()(properties, 'isFocused'));
    }

    change.applyOperation(inverse, { save: false });
  });

  // Update the history.
  value = change.value;
  history = history.set('undos', undos).set('redos', redos);
  value = value.set('history', history);
  change.value = value;
};

/**
 * Changes.
 *
 * @type {Object}
 */

var Changes$4 = {};

/**
 * Set `properties` on the selection.
 *
 * @param {Change} change
 * @param {Object} properties
 */

Changes$4.select = function (change, properties) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  properties = Range.createProperties(properties);

  var _options$snapshot = options.snapshot,
      snapshot = _options$snapshot === undefined ? false : _options$snapshot;
  var value = change.value;
  var document = value.document,
      selection = value.selection;

  var props = {};
  var sel = selection.toJSON();
  var next = selection.merge(properties).normalize(document);
  properties = lodash_pick__WEBPACK_IMPORTED_MODULE_9___default()(next, Object.keys(properties));

  // Remove any properties that are already equal to the current selection. And
  // create a dictionary of the previous values for all of the properties that
  // are being changed, for the inverse operation.
  for (var k in properties) {
    if (snapshot == false && properties[k] == sel[k]) continue;
    props[k] = properties[k];
  }

  // If the selection moves, clear any marks, unless the new selection
  // properties change the marks in some way.
  var moved = ['anchorKey', 'anchorOffset', 'focusKey', 'focusOffset'].some(function (p) {
    return props.hasOwnProperty(p);
  });

  if (sel.marks && properties.marks == sel.marks && moved) {
    props.marks = null;
  }

  // If there are no new properties to set, abort.
  if (is_empty__WEBPACK_IMPORTED_MODULE_11___default()(props)) {
    return;
  }

  // Apply the operation.
  change.applyOperation({
    type: 'set_selection',
    value: value,
    properties: props,
    selection: sel
  }, snapshot ? { skip: false, merge: false } : {});
};

/**
 * Select the whole document.
 *
 * @param {Change} change
 */

Changes$4.selectAll = function (change) {
  var value = change.value;
  var document = value.document,
      selection = value.selection;

  var next = selection.moveToRangeOf(document);
  change.select(next);
};

/**
 * Snapshot the current selection.
 *
 * @param {Change} change
 */

Changes$4.snapshotSelection = function (change) {
  var value = change.value;
  var selection = value.selection;

  change.select(selection, { snapshot: true });
};

/**
 * Move the anchor point backward, accounting for being at the start of a block.
 *
 * @param {Change} change
 */

Changes$4.moveAnchorCharBackward = function (change) {
  var value = change.value;
  var document = value.document,
      selection = value.selection,
      anchorText = value.anchorText,
      anchorBlock = value.anchorBlock;
  var anchorOffset = selection.anchorOffset;

  var previousText = document.getPreviousText(anchorText.key);
  var isInVoid = document.hasVoidParent(anchorText.key);
  var isPreviousInVoid = previousText && document.hasVoidParent(previousText.key);

  if (!isInVoid && anchorOffset > 0) {
    change.moveAnchor(-1);
    return;
  }

  if (!previousText) {
    return;
  }

  change.moveAnchorToEndOf(previousText);

  if (!isInVoid && !isPreviousInVoid && anchorBlock.hasNode(previousText.key)) {
    change.moveAnchor(-1);
  }
};

/**
 * Move the anchor point forward, accounting for being at the end of a block.
 *
 * @param {Change} change
 */

Changes$4.moveAnchorCharForward = function (change) {
  var value = change.value;
  var document = value.document,
      selection = value.selection,
      anchorText = value.anchorText,
      anchorBlock = value.anchorBlock;
  var anchorOffset = selection.anchorOffset;

  var nextText = document.getNextText(anchorText.key);
  var isInVoid = document.hasVoidParent(anchorText.key);
  var isNextInVoid = nextText && document.hasVoidParent(nextText.key);

  if (!isInVoid && anchorOffset < anchorText.text.length) {
    change.moveAnchor(1);
    return;
  }

  if (!nextText) {
    return;
  }

  change.moveAnchorToStartOf(nextText);

  if (!isInVoid && !isNextInVoid && anchorBlock.hasNode(nextText.key)) {
    change.moveAnchor(1);
  }
};

/**
 * Move the focus point backward, accounting for being at the start of a block.
 *
 * @param {Change} change
 */

Changes$4.moveFocusCharBackward = function (change) {
  var value = change.value;
  var document = value.document,
      selection = value.selection,
      focusText = value.focusText,
      focusBlock = value.focusBlock;
  var focusOffset = selection.focusOffset;

  var previousText = document.getPreviousText(focusText.key);
  var isInVoid = document.hasVoidParent(focusText.key);
  var isPreviousInVoid = previousText && document.hasVoidParent(previousText.key);

  if (!isInVoid && focusOffset > 0) {
    change.moveFocus(-1);
    return;
  }

  if (!previousText) {
    return;
  }

  change.moveFocusToEndOf(previousText);

  if (!isInVoid && !isPreviousInVoid && focusBlock.hasNode(previousText.key)) {
    change.moveFocus(-1);
  }
};

/**
 * Move the focus point forward, accounting for being at the end of a block.
 *
 * @param {Change} change
 */

Changes$4.moveFocusCharForward = function (change) {
  var value = change.value;
  var document = value.document,
      selection = value.selection,
      focusText = value.focusText,
      focusBlock = value.focusBlock;
  var focusOffset = selection.focusOffset;

  var nextText = document.getNextText(focusText.key);
  var isInVoid = document.hasVoidParent(focusText.key);
  var isNextInVoid = nextText && document.hasVoidParent(nextText.key);

  if (!isInVoid && focusOffset < focusText.text.length) {
    change.moveFocus(1);
    return;
  }

  if (!nextText) {
    return;
  }

  change.moveFocusToStartOf(nextText);

  if (!isInVoid && !isNextInVoid && focusBlock.hasNode(nextText.key)) {
    change.moveFocus(1);
  }
};

/**
 * Mix in move methods.
 */

var MOVE_DIRECTIONS = ['Forward', 'Backward'];

MOVE_DIRECTIONS.forEach(function (direction$$1) {
  var anchor = 'moveAnchorChar' + direction$$1;
  var focus = 'moveFocusChar' + direction$$1;

  Changes$4['moveChar' + direction$$1] = function (change) {
    change[anchor]()[focus]();
  };

  Changes$4['moveStartChar' + direction$$1] = function (change) {
    if (change.value.isBackward) {
      change[focus]();
    } else {
      change[anchor]();
    }
  };

  Changes$4['moveEndChar' + direction$$1] = function (change) {
    if (change.value.isBackward) {
      change[anchor]();
    } else {
      change[focus]();
    }
  };

  Changes$4['extendChar' + direction$$1] = function (change) {
    change['moveFocusChar' + direction$$1]();
  };

  Changes$4['collapseChar' + direction$$1] = function (change) {
    var collapse = direction$$1 == 'Forward' ? 'collapseToEnd' : 'collapseToStart';
    change[collapse]()['moveChar' + direction$$1]();
  };
});

/**
 * Mix in alias methods.
 */

var ALIAS_METHODS$1 = [['collapseLineBackward', 'collapseToStartOfBlock'], ['collapseLineForward', 'collapseToEndOfBlock'], ['extendLineBackward', 'extendToStartOfBlock'], ['extendLineForward', 'extendToEndOfBlock']];

ALIAS_METHODS$1.forEach(function (_ref) {
  var _ref2 = slicedToArray(_ref, 2),
      alias = _ref2[0],
      method = _ref2[1];

  Changes$4[alias] = function (change) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    change[method].apply(change, [change].concat(args));
  };
});

/**
 * Mix in selection changes that are just a proxy for the selection method.
 */

var PROXY_TRANSFORMS$1 = ['blur', 'collapseTo', 'collapseToAnchor', 'collapseToEnd', 'collapseToEndOf', 'collapseToFocus', 'collapseToStart', 'collapseToStartOf', 'extend', 'extendTo', 'extendToEndOf', 'extendToStartOf', 'flip', 'focus', 'move', 'moveAnchor', 'moveAnchorOffsetTo', 'moveAnchorTo', 'moveAnchorToEndOf', 'moveAnchorToStartOf', 'moveEnd', 'moveEndOffsetTo', 'moveEndTo', 'moveFocus', 'moveFocusOffsetTo', 'moveFocusTo', 'moveFocusToEndOf', 'moveFocusToStartOf', 'moveOffsetsTo', 'moveStart', 'moveStartOffsetTo', 'moveStartTo', 'moveTo', 'moveToEnd', 'moveToEndOf', 'moveToRangeOf', 'moveToStart', 'moveToStartOf', 'deselect'];

PROXY_TRANSFORMS$1.forEach(function (method) {
  Changes$4[method] = function (change) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    var normalize = method != 'deselect';
    var value = change.value;
    var document = value.document,
        selection = value.selection;

    var next = selection[method].apply(selection, args);
    if (normalize) next = next.normalize(document);
    change.select(next);
  };
});

/**
 * Mix in node-related changes.
 */

var PREFIXES = ['moveTo', 'moveAnchorTo', 'moveFocusTo', 'moveStartTo', 'moveEndTo', 'collapseTo', 'extendTo'];

var DIRECTIONS = ['Next', 'Previous'];

var OBJECTS = ['Block', 'Inline', 'Text'];

PREFIXES.forEach(function (prefix) {
  var edges = ['Start', 'End'];

  if (prefix == 'moveTo') {
    edges.push('Range');
  }

  edges.forEach(function (edge) {
    var method = '' + prefix + edge + 'Of';

    OBJECTS.forEach(function (object) {
      var getNode = object == 'Text' ? 'getNode' : 'getClosest' + object;

      Changes$4['' + method + object] = function (change) {
        var value = change.value;
        var document = value.document,
            selection = value.selection;

        var node = document[getNode](selection.startKey);
        if (!node) return;
        change[method](node);
      };

      DIRECTIONS.forEach(function (direction$$1) {
        var getDirectionNode = 'get' + direction$$1 + object;
        var directionKey = direction$$1 == 'Next' ? 'startKey' : 'endKey';

        Changes$4['' + method + direction$$1 + object] = function (change) {
          var value = change.value;
          var document = value.document,
              selection = value.selection;

          var node = document[getNode](selection[directionKey]);
          if (!node) return;
          var target = document[getDirectionNode](node.key);
          if (!target) return;
          change[method](target);
        };
      });
    });
  });
});

/**
 * Changes.
 *
 * @type {Object}
 */

var Changes$5 = {};

/**
 * Set `properties` on the value.
 *
 * @param {Change} change
 * @param {Object|Value} properties
 * @param {Object} options
 */

Changes$5.setValue = function (change, properties) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  properties = Value.createProperties(properties);
  var value = change.value;


  change.applyOperation({
    type: 'set_value',
    properties: properties,
    value: value
  }, options);
};

/**
 * Changes.
 *
 * @type {Object}
 */

var Changes$6 = {};

/**
 * Normalize the value with its schema.
 *
 * @param {Change} change
 */

Changes$6.normalize = function (change) {
  change.normalizeDocument();
};

/**
 * Normalize the document with the value's schema.
 *
 * @param {Change} change
 */

Changes$6.normalizeDocument = function (change) {
  var value = change.value;
  var document = value.document;

  change.normalizeNodeByKey(document.key);
};

/**
 * Normalize a `node` and its children with the value's schema.
 *
 * @param {Change} change
 * @param {Node|String} key
 */

Changes$6.normalizeNodeByKey = function (change, key) {
  var value = change.value;
  var document = value.document,
      schema = value.schema;

  var node = document.assertNode(key);

  normalizeNodeAndChildren(change, node, schema);

  document = change.value.document;
  var ancestors = document.getAncestors(key);
  if (!ancestors) return;

  ancestors.forEach(function (ancestor) {
    if (change.value.document.getDescendant(ancestor.key)) {
      normalizeNode(change, ancestor, schema);
    }
  });
};

/**
 * Normalize a `node` and its children with a `schema`.
 *
 * @param {Change} change
 * @param {Node} node
 * @param {Schema} schema
 */

function normalizeNodeAndChildren(change, node, schema) {
  if (node.object == 'text') {
    normalizeNode(change, node, schema);
    return;
  }

  var child = node.getFirstInvalidDescendant(schema);
  var path = change.value.document.getPath(node.key);
  while (node && child) {
    normalizeNodeAndChildren(change, child, schema);
    node = change.value.document.refindNode(path, node.key);
    if (!node) {
      path = [];
      child = null;
    } else {
      path = change.value.document.refindPath(path, node.key);
      child = node.getFirstInvalidDescendant(schema);
    }
  }

  // Normalize the node itself if it still exists.
  if (node) {
    normalizeNode(change, node, schema);
  }
}

/**
 * Normalize a `node` with a `schema`, but not its children.
 *
 * @param {Change} change
 * @param {Node} node
 * @param {Schema} schema
 */

function normalizeNode(change, node, schema) {
  var max = schema.stack.plugins.length + 1;
  var iterations = 0;

  function iterate(c, n) {
    var normalize = n.validate(schema);
    if (!normalize) return;

    // Run the `normalize` function to fix the node.
    var path = c.value.document.getPath(n.key);
    normalize(c);

    // Re-find the node reference, in case it was updated. If the node no longer
    // exists, we're done for this branch.
    n = c.value.document.refindNode(path, n.key);
    if (!n) return;

    path = c.value.document.refindPath(path, n.key);

    // Increment the iterations counter, and check to make sure that we haven't
    // exceeded the max. Without this check, it's easy for the `validate` or
    // `normalize` function of a schema rule to be written incorrectly and for
    // an infinite invalid loop to occur.
    iterations++;

    if (iterations > max) {
      throw new Error('A schema rule could not be validated after sufficient iterations. This is usually due to a `rule.validate` or `rule.normalize` function of a schema being incorrectly written, causing an infinite loop.');
    }

    // Otherwise, iterate again.
    iterate(c, n);
  }

  iterate(change, node);
}

/**
 * Export.
 *
 * @type {Object}
 */

var Changes$7 = _extends({}, Changes, Changes$1, Changes$2, Changes$3, Changes$4, Changes$5, Changes$6);

/**
 * Debug.
 *
 * @type {Function}
 */

var debug$3 = debug__WEBPACK_IMPORTED_MODULE_5___default()('slate:operation:apply');

/**
 * Applying functions.
 *
 * @type {Object}
 */

var APPLIERS = {
  /**
   * Add mark to text at `offset` and `length` in node by `path`.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  add_mark: function add_mark(value, operation) {
    var path = operation.path,
        offset = operation.offset,
        length = operation.length,
        mark = operation.mark;
    var _value = value,
        document = _value.document;

    var node = document.assertPath(path);
    node = node.addMark(offset, length, mark);
    document = document.updateNode(node);
    value = value.set('document', document);
    return value;
  },


  /**
   * Insert a `node` at `index` in a node by `path`.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  insert_node: function insert_node(value, operation) {
    var path = operation.path,
        node = operation.node;

    var index = path[path.length - 1];
    var rest = path.slice(0, -1);
    var _value2 = value,
        document = _value2.document;

    var parent = document.assertPath(rest);
    parent = parent.insertNode(index, node);
    document = document.updateNode(parent);
    value = value.set('document', document);
    return value;
  },


  /**
   * Insert `text` at `offset` in node by `path`.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  insert_text: function insert_text(value, operation) {
    var path = operation.path,
        offset = operation.offset,
        text = operation.text,
        marks = operation.marks;
    var _value3 = value,
        document = _value3.document,
        selection = _value3.selection;
    var _selection = selection,
        anchorKey = _selection.anchorKey,
        focusKey = _selection.focusKey,
        anchorOffset = _selection.anchorOffset,
        focusOffset = _selection.focusOffset;

    var node = document.assertPath(path);

    // Update the document
    node = node.insertText(offset, text, marks);
    document = document.updateNode(node);

    // Update the selection
    if (anchorKey == node.key && anchorOffset >= offset) {
      selection = selection.moveAnchor(text.length);
    }
    if (focusKey == node.key && focusOffset >= offset) {
      selection = selection.moveFocus(text.length);
    }

    value = value.set('document', document).set('selection', selection);
    return value;
  },


  /**
   * Merge a node at `path` with the previous node.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  merge_node: function merge_node(value, operation) {
    var path = operation.path;

    var withPath = path.slice(0, path.length - 1).concat([path[path.length - 1] - 1]);
    var _value4 = value,
        document = _value4.document,
        selection = _value4.selection;

    var one = document.assertPath(withPath);
    var two = document.assertPath(path);
    var parent = document.getParent(one.key);
    var oneIndex = parent.nodes.indexOf(one);
    var twoIndex = parent.nodes.indexOf(two);

    // Perform the merge in the document.
    parent = parent.mergeNode(oneIndex, twoIndex);
    document = document.updateNode(parent);

    // If the nodes are text nodes and the selection is inside the second node
    // update it to refer to the first node instead.
    if (one.object == 'text') {
      var _selection2 = selection,
          anchorKey = _selection2.anchorKey,
          anchorOffset = _selection2.anchorOffset,
          focusKey = _selection2.focusKey,
          focusOffset = _selection2.focusOffset;

      var normalize = false;

      if (anchorKey == two.key) {
        selection = selection.moveAnchorTo(one.key, one.text.length + anchorOffset);
        normalize = true;
      }

      if (focusKey == two.key) {
        selection = selection.moveFocusTo(one.key, one.text.length + focusOffset);
        normalize = true;
      }

      if (normalize) {
        selection = selection.normalize(document);
      }
    }

    // Update the document and selection.
    value = value.set('document', document).set('selection', selection);
    return value;
  },


  /**
   * Move a node by `path` to `newPath`.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  move_node: function move_node(value, operation) {
    var path = operation.path,
        newPath = operation.newPath;

    var newIndex = newPath[newPath.length - 1];
    var newParentPath = newPath.slice(0, -1);
    var oldParentPath = path.slice(0, -1);
    var oldIndex = path[path.length - 1];
    var _value5 = value,
        document = _value5.document;

    var node = document.assertPath(path);

    // Remove the node from its current parent.
    var parent = document.getParent(node.key);
    parent = parent.removeNode(oldIndex);
    document = document.updateNode(parent);

    // Find the new target...
    var target = void 0;

    // If the old path and the rest of the new path are the same, then the new
    // target is the old parent.
    if (oldParentPath.every(function (x, i) {
      return x === newParentPath[i];
    }) && oldParentPath.length === newParentPath.length) {
      target = parent;
    } else if (oldParentPath.every(function (x, i) {
      return x === newParentPath[i];
    }) && oldIndex < newParentPath[oldParentPath.length]) {
      // Otherwise, if the old path removal resulted in the new path being no longer
      // correct, we need to decrement the new path at the old path's last index.
      newParentPath[oldParentPath.length]--;
      target = document.assertPath(newParentPath);
    } else {
      // Otherwise, we can just grab the target normally...
      target = document.assertPath(newParentPath);
    }

    // Insert the new node to its new parent.
    target = target.insertNode(newIndex, node);
    document = document.updateNode(target);
    value = value.set('document', document);
    return value;
  },


  /**
   * Remove mark from text at `offset` and `length` in node by `path`.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  remove_mark: function remove_mark(value, operation) {
    var path = operation.path,
        offset = operation.offset,
        length = operation.length,
        mark = operation.mark;
    var _value6 = value,
        document = _value6.document;

    var node = document.assertPath(path);
    node = node.removeMark(offset, length, mark);
    document = document.updateNode(node);
    value = value.set('document', document);
    return value;
  },


  /**
   * Remove a node by `path`.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  remove_node: function remove_node(value, operation) {
    var path = operation.path;
    var _value7 = value,
        document = _value7.document,
        selection = _value7.selection;
    var _selection3 = selection,
        startKey = _selection3.startKey,
        endKey = _selection3.endKey;

    var node = document.assertPath(path);

    // If the selection is set, check to see if it needs to be updated.
    if (selection.isSet) {
      var hasStartNode = node.hasNode(startKey);
      var hasEndNode = node.hasNode(endKey);
      var first = node.object == 'text' ? node : node.getFirstText() || node;
      var last = node.object == 'text' ? node : node.getLastText() || node;
      var prev = document.getPreviousText(first.key);
      var next = document.getNextText(last.key);

      // If the start point was in this node, update it to be just before/after.
      if (hasStartNode) {
        if (prev) {
          selection = selection.moveStartTo(prev.key, prev.text.length);
        } else if (next) {
          selection = selection.moveStartTo(next.key, 0);
        } else {
          selection = selection.deselect();
        }
      }

      // If the end point was in this node, update it to be just before/after.
      if (selection.isSet && hasEndNode) {
        if (prev) {
          selection = selection.moveEndTo(prev.key, prev.text.length);
        } else if (next) {
          selection = selection.moveEndTo(next.key, 0);
        } else {
          selection = selection.deselect();
        }
      }

      // If the selection wasn't deselected, normalize it.
      if (selection.isSet) {
        selection = selection.normalize(document);
      }
    }

    // Remove the node from the document.
    var parent = document.getParent(node.key);
    var index = parent.nodes.indexOf(node);
    parent = parent.removeNode(index);
    document = document.updateNode(parent);

    // Update the document and selection.
    value = value.set('document', document).set('selection', selection);
    return value;
  },


  /**
   * Remove `text` at `offset` in node by `path`.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  remove_text: function remove_text(value, operation) {
    var path = operation.path,
        offset = operation.offset,
        text = operation.text;
    var length = text.length;

    var rangeOffset = offset + length;
    var _value8 = value,
        document = _value8.document,
        selection = _value8.selection;
    var _selection4 = selection,
        anchorKey = _selection4.anchorKey,
        focusKey = _selection4.focusKey,
        anchorOffset = _selection4.anchorOffset,
        focusOffset = _selection4.focusOffset;

    var node = document.assertPath(path);

    if (anchorKey == node.key) {
      if (anchorOffset >= rangeOffset) {
        selection = selection.moveAnchor(-length);
      } else if (anchorOffset > offset) {
        selection = selection.moveAnchorTo(anchorKey, offset);
      }
    }

    if (focusKey == node.key) {
      if (focusOffset >= rangeOffset) {
        selection = selection.moveFocus(-length);
      } else if (focusOffset > offset) {
        selection = selection.moveFocusTo(focusKey, offset);
      }
    }

    node = node.removeText(offset, length);
    document = document.updateNode(node);
    value = value.set('document', document).set('selection', selection);
    return value;
  },


  /**
   * Set `properties` on mark on text at `offset` and `length` in node by `path`.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  set_mark: function set_mark(value, operation) {
    var path = operation.path,
        offset = operation.offset,
        length = operation.length,
        mark = operation.mark,
        properties = operation.properties;
    var _value9 = value,
        document = _value9.document;

    var node = document.assertPath(path);
    node = node.updateMark(offset, length, mark, properties);
    document = document.updateNode(node);
    value = value.set('document', document);
    return value;
  },


  /**
   * Set `properties` on a node by `path`.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  set_node: function set_node(value, operation) {
    var path = operation.path,
        properties = operation.properties;
    var _value10 = value,
        document = _value10.document;

    var node = document.assertPath(path);
    node = node.merge(properties);
    document = document.updateNode(node);
    value = value.set('document', document);
    return value;
  },


  /**
   * Set `properties` on the selection.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  set_selection: function set_selection(value, operation) {
    var properties = operation.properties;
    var anchorPath = properties.anchorPath,
        focusPath = properties.focusPath,
        props = objectWithoutProperties(properties, ['anchorPath', 'focusPath']);
    var _value11 = value,
        document = _value11.document,
        selection = _value11.selection;


    if (anchorPath !== undefined) {
      props.anchorKey = anchorPath === null ? null : document.assertPath(anchorPath).key;
    }

    if (focusPath !== undefined) {
      props.focusKey = focusPath === null ? null : document.assertPath(focusPath).key;
    }

    selection = selection.merge(props);
    selection = selection.normalize(document);
    value = value.set('selection', selection);
    return value;
  },


  /**
   * Set `properties` on `value`.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  set_value: function set_value(value, operation) {
    var properties = operation.properties;

    value = value.merge(properties);
    return value;
  },


  /**
   * Split a node by `path` at `offset`.
   *
   * @param {Value} value
   * @param {Operation} operation
   * @return {Value}
   */

  split_node: function split_node(value, operation) {
    var path = operation.path,
        position = operation.position,
        properties = operation.properties;
    var _value12 = value,
        document = _value12.document,
        selection = _value12.selection;

    // Calculate a few things...

    var node = document.assertPath(path);
    var parent = document.getParent(node.key);
    var index = parent.nodes.indexOf(node);

    // Split the node by its parent.
    parent = parent.splitNode(index, position);
    if (properties) {
      var splitNode = parent.nodes.get(index + 1);
      if (splitNode.object !== 'text') {
        parent = parent.updateNode(splitNode.merge(properties));
      }
    }
    document = document.updateNode(parent);

    // Determine whether we need to update the selection...
    var _selection5 = selection,
        startKey = _selection5.startKey,
        endKey = _selection5.endKey,
        startOffset = _selection5.startOffset,
        endOffset = _selection5.endOffset;

    var next = document.getNextText(node.key);
    var normalize = false;

    // If the start point is after or equal to the split, update it.
    if (node.key == startKey && position <= startOffset) {
      selection = selection.moveStartTo(next.key, startOffset - position);
      normalize = true;
    }

    // If the end point is after or equal to the split, update it.
    if (node.key == endKey && position <= endOffset) {
      selection = selection.moveEndTo(next.key, endOffset - position);
      normalize = true;
    }

    // Normalize the selection if we changed it, since the methods we use might
    // leave it in a non-normalized value.
    if (normalize) {
      selection = selection.normalize(document);
    }

    // Return the updated value.
    value = value.set('document', document).set('selection', selection);
    return value;
  }
};

/**
 * Apply an `operation` to a `value`.
 *
 * @param {Value} value
 * @param {Object|Operation} operation
 * @return {Value} value
 */

function applyOperation(value, operation) {
  operation = Operation.create(operation);
  var _operation = operation,
      type = _operation.type;

  var apply = APPLIERS[type];

  if (!apply) {
    throw new Error('Unknown operation type: "' + type + '".');
  }

  debug$3(type, operation);
  value = apply(value, operation);
  return value;
}

/**
 * Debug.
 *
 * @type {Function}
 */

var debug$4 = debug__WEBPACK_IMPORTED_MODULE_5___default()('slate:change');

/**
 * Change.
 *
 * @type {Change}
 */

var Change = function () {
  createClass(Change, null, [{
    key: 'isChange',

    /**
     * Check if `any` is a `Change`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isChange(any) {
      return !!(any && any[MODEL_TYPES.CHANGE]);
    }

    /**
     * Create a new `Change` with `attrs`.
     *
     * @param {Object} attrs
     *   @property {Value} value
     */

  }]);

  function Change(attrs) {
    classCallCheck(this, Change);
    var value = attrs.value;

    this.value = value;
    this.operations = new immutable__WEBPACK_IMPORTED_MODULE_1__["List"]();
    this.flags = _extends({
      normalize: true
    }, lodash_pick__WEBPACK_IMPORTED_MODULE_9___default()(attrs, ['merge', 'save', 'normalize']));
  }

  /**
   * Object.
   *
   * @return {String}
   */

  createClass(Change, [{
    key: 'applyOperation',


    /**
     * Apply an `operation` to the current value, saving the operation to the
     * history if needed.
     *
     * @param {Operation|Object} operation
     * @param {Object} options
     * @return {Change}
     */

    value: function applyOperation$$1(operation) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var operations = this.operations,
          flags = this.flags;
      var value = this.value;
      var _value = value,
          history = _value.history;

      // Add in the current `value` in case the operation was serialized.

      if (is_plain_object__WEBPACK_IMPORTED_MODULE_0___default()(operation)) {
        operation = _extends({}, operation, { value: value });
      }

      operation = Operation.create(operation);

      // Default options to the change-level flags, this allows for setting
      // specific options for all of the operations of a given change.
      options = _extends({}, flags, options);

      // Derive the default option values.
      var _options = options,
          _options$merge = _options.merge,
          merge = _options$merge === undefined ? operations.size == 0 ? null : true : _options$merge,
          _options$save = _options.save,
          save = _options$save === undefined ? true : _options$save,
          _options$skip = _options.skip,
          skip = _options$skip === undefined ? null : _options$skip;

      // Apply the operation to the value.

      debug$4('apply', { operation: operation, save: save, merge: merge });
      value = applyOperation(value, operation);

      // If needed, save the operation to the history.
      if (history && save) {
        history = history.save(operation, { merge: merge, skip: skip });
        value = value.set('history', history);
      }

      // Update the mutable change object.
      this.value = value;
      this.operations = operations.push(operation);
      return this;
    }

    /**
     * Apply a series of `operations` to the current value.
     *
     * @param {Array|List} operations
     * @param {Object} options
     * @return {Change}
     */

  }, {
    key: 'applyOperations',
    value: function applyOperations(operations, options) {
      var _this = this;

      operations.forEach(function (op) {
        return _this.applyOperation(op, options);
      });
      return this;
    }

    /**
     * Call a change `fn` with arguments.
     *
     * @param {Function} fn
     * @param {Mixed} ...args
     * @return {Change}
     */

  }, {
    key: 'call',
    value: function call(fn) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      fn.apply(undefined, [this].concat(args));
      return this;
    }

    /**
     * Applies a series of change mutations and defers normalization until the end.
     *
     * @param {Function} customChange - function that accepts a change object and executes change operations
     * @return {Change}
     */

  }, {
    key: 'withoutNormalization',
    value: function withoutNormalization(customChange) {
      var original = this.flags.normalize;
      this.setOperationFlag('normalize', false);
      try {
        customChange(this);
        // if the change function worked then run normalization
        this.normalizeDocument();
      } finally {
        // restore the flag to whatever it was
        this.setOperationFlag('normalize', original);
      }
      return this;
    }

    /**
     * Set an operation flag by `key` to `value`.
     *
     * @param {String} key
     * @param {Any} value
     * @return {Change}
     */

  }, {
    key: 'setOperationFlag',
    value: function setOperationFlag(key, value) {
      this.flags[key] = value;
      return this;
    }

    /**
     * Get the `value` of the specified flag by its `key`. Optionally accepts an `options`
     * object with override flags.
     *
     * @param {String} key
     * @param {Object} options
     * @return {Change}
     */

  }, {
    key: 'getFlag',
    value: function getFlag(key) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return options[key] !== undefined ? options[key] : this.flags[key];
    }

    /**
     * Unset an operation flag by `key`.
     *
     * @param {String} key
     * @return {Change}
     */

  }, {
    key: 'unsetOperationFlag',
    value: function unsetOperationFlag(key) {
      delete this.flags[key];
      return this;
    }
  }, {
    key: 'object',
    get: function get$$1() {
      return 'change';
    }
  }, {
    key: 'kind',
    get: function get$$1() {
      slate_dev_logger__WEBPACK_IMPORTED_MODULE_2__["default"].deprecate('slate@0.32.0', 'The `kind` property of Slate objects has been renamed to `object`.');
      return this.object;
    }
  }]);
  return Change;
}();

/**
 * Attach a pseudo-symbol for type checking.
 */

Change.prototype[MODEL_TYPES.CHANGE] = true;

/**
 * Add a change method for each of the changes.
 */

Object.keys(Changes$7).forEach(function (type) {
  Change.prototype[type] = function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    debug$4(type, { args: args });
    this.call.apply(this, [Changes$7[type]].concat(args));
    return this;
  };
});

/**
 * Export.
 *
 * @type {Object}
 */

var Operations = {
  apply: applyOperation,
  invert: invertOperation
};

var index = {
  Block: Block,
  Changes: Changes$7,
  Character: Character,
  Data: Data,
  Document: Document,
  History: History,
  Inline: Inline,
  Leaf: Leaf,
  Mark: Mark,
  Node: Node,
  Operation: Operation,
  Operations: Operations,
  Range: Range,
  Schema: Schema,
  Stack: Stack$1,
  Text: Text,
  Value: Value,
  resetKeyGenerator: resetKeyGenerator,
  setKeyGenerator: setKeyGenerator,
  resetMemoization: resetMemoization,
  useMemoization: useMemoization
};

/* harmony default export */ __webpack_exports__["default"] = (index);

//# sourceMappingURL=slate.es.js.map


/***/ })

}]);
//# sourceMappingURL=1.6b4e578487905110ad7c.js.map