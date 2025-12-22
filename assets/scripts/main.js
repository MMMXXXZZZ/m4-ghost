(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : {
    "default": e
  };
}
module.exports = _interopRequireDefault, module.exports.__esModule = true, module.exports["default"] = module.exports;
},{}],2:[function(require,module,exports){
/**
 * EvEmitter v2.1.1
 * Lil' event emitter
 * MIT License
 */

( function( global, factory ) {
  // universal module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS - Browserify, Webpack
    module.exports = factory();
  } else {
    // Browser globals
    global.EvEmitter = factory();
  }

}( typeof window != 'undefined' ? window : this, function() {

function EvEmitter() {}

let proto = EvEmitter.prototype;

proto.on = function( eventName, listener ) {
  if ( !eventName || !listener ) return this;

  // set events hash
  let events = this._events = this._events || {};
  // set listeners array
  let listeners = events[ eventName ] = events[ eventName ] || [];
  // only add once
  if ( !listeners.includes( listener ) ) {
    listeners.push( listener );
  }

  return this;
};

proto.once = function( eventName, listener ) {
  if ( !eventName || !listener ) return this;

  // add event
  this.on( eventName, listener );
  // set once flag
  // set onceEvents hash
  let onceEvents = this._onceEvents = this._onceEvents || {};
  // set onceListeners object
  let onceListeners = onceEvents[ eventName ] = onceEvents[ eventName ] || {};
  // set flag
  onceListeners[ listener ] = true;

  return this;
};

proto.off = function( eventName, listener ) {
  let listeners = this._events && this._events[ eventName ];
  if ( !listeners || !listeners.length ) return this;

  let index = listeners.indexOf( listener );
  if ( index != -1 ) {
    listeners.splice( index, 1 );
  }

  return this;
};

proto.emitEvent = function( eventName, args ) {
  let listeners = this._events && this._events[ eventName ];
  if ( !listeners || !listeners.length ) return this;

  // copy over to avoid interference if .off() in listener
  listeners = listeners.slice( 0 );
  args = args || [];
  // once stuff
  let onceListeners = this._onceEvents && this._onceEvents[ eventName ];

  for ( let listener of listeners ) {
    let isOnce = onceListeners && onceListeners[ listener ];
    if ( isOnce ) {
      // remove listener
      // remove before trigger to prevent recursion
      this.off( eventName, listener );
      // unset once flag
      delete onceListeners[ listener ];
    }
    // trigger listener
    listener.apply( this, args );
  }

  return this;
};

proto.allOff = function() {
  delete this._events;
  delete this._onceEvents;
  return this;
};

return EvEmitter;

} ) );

},{}],3:[function(require,module,exports){
/**
 * Fizzy UI utils v3.0.0
 * MIT license
 */

( function( global, factory ) {
  // universal module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory( global );
  } else {
    // browser global
    global.fizzyUIUtils = factory( global );
  }

}( this, function factory( global ) {

let utils = {};

// ----- extend ----- //

// extends objects
utils.extend = function( a, b ) {
  return Object.assign( a, b );
};

// ----- modulo ----- //

utils.modulo = function( num, div ) {
  return ( ( num % div ) + div ) % div;
};

// ----- makeArray ----- //

// turn element or nodeList into an array
utils.makeArray = function( obj ) {
  // use object if already an array
  if ( Array.isArray( obj ) ) return obj;

  // return empty array if undefined or null. #6
  if ( obj === null || obj === undefined ) return [];

  let isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
  // convert nodeList to array
  if ( isArrayLike ) return [ ...obj ];

  // array of single index
  return [ obj ];
};

// ----- removeFrom ----- //

utils.removeFrom = function( ary, obj ) {
  let index = ary.indexOf( obj );
  if ( index != -1 ) {
    ary.splice( index, 1 );
  }
};

// ----- getParent ----- //

utils.getParent = function( elem, selector ) {
  while ( elem.parentNode && elem != document.body ) {
    elem = elem.parentNode;
    if ( elem.matches( selector ) ) return elem;
  }
};

// ----- getQueryElement ----- //

// use element as selector string
utils.getQueryElement = function( elem ) {
  if ( typeof elem == 'string' ) {
    return document.querySelector( elem );
  }
  return elem;
};

// ----- handleEvent ----- //

// enable .ontype to trigger from .addEventListener( elem, 'type' )
utils.handleEvent = function( event ) {
  let method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

// ----- filterFindElements ----- //

utils.filterFindElements = function( elems, selector ) {
  // make array of elems
  elems = utils.makeArray( elems );

  return elems
    // check that elem is an actual element
    .filter( ( elem ) => elem instanceof HTMLElement )
    .reduce( ( ffElems, elem ) => {
      // add elem if no selector
      if ( !selector ) {
        ffElems.push( elem );
        return ffElems;
      }
      // filter & find items if we have a selector
      // filter
      if ( elem.matches( selector ) ) {
        ffElems.push( elem );
      }
      // find children
      let childElems = elem.querySelectorAll( selector );
      // concat childElems to filterFound array
      ffElems = ffElems.concat( ...childElems );
      return ffElems;
    }, [] );
};

// ----- debounceMethod ----- //

utils.debounceMethod = function( _class, methodName, threshold ) {
  threshold = threshold || 100;
  // original method
  let method = _class.prototype[ methodName ];
  let timeoutName = methodName + 'Timeout';

  _class.prototype[ methodName ] = function() {
    clearTimeout( this[ timeoutName ] );

    let args = arguments;
    this[ timeoutName ] = setTimeout( () => {
      method.apply( this, args );
      delete this[ timeoutName ];
    }, threshold );
  };
};

// ----- docReady ----- //

utils.docReady = function( onDocReady ) {
  let readyState = document.readyState;
  if ( readyState == 'complete' || readyState == 'interactive' ) {
    // do async to allow for other scripts to run. metafizzy/flickity#441
    setTimeout( onDocReady );
  } else {
    document.addEventListener( 'DOMContentLoaded', onDocReady );
  }
};

// ----- htmlInit ----- //

// http://bit.ly/3oYLusc
utils.toDashed = function( str ) {
  return str.replace( /(.)([A-Z])/g, function( match, $1, $2 ) {
    return $1 + '-' + $2;
  } ).toLowerCase();
};

let console = global.console;

// allow user to initialize classes via [data-namespace] or .js-namespace class
// htmlInit( Widget, 'widgetName' )
// options are parsed from data-namespace-options
utils.htmlInit = function( WidgetClass, namespace ) {
  utils.docReady( function() {
    let dashedNamespace = utils.toDashed( namespace );
    let dataAttr = 'data-' + dashedNamespace;
    let dataAttrElems = document.querySelectorAll( `[${dataAttr}]` );
    let jQuery = global.jQuery;

    [ ...dataAttrElems ].forEach( ( elem ) => {
      let attr = elem.getAttribute( dataAttr );
      let options;
      try {
        options = attr && JSON.parse( attr );
      } catch ( error ) {
        // log error, do not initialize
        if ( console ) {
          console.error( `Error parsing ${dataAttr} on ${elem.className}: ${error}` );
        }
        return;
      }
      // initialize
      let instance = new WidgetClass( elem, options );
      // make available via $().data('namespace')
      if ( jQuery ) {
        jQuery.data( elem, namespace, instance );
      }
    } );

  } );
};

// -----  ----- //

return utils;

} ) );

},{}],4:[function(require,module,exports){
// button
( function( window, factory ) {
  // universal module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
        window,
        require('./core'),
        require('fizzy-ui-utils'),
    );
  } else {
    // browser global
    factory(
        window,
        window.InfiniteScroll,
        window.fizzyUIUtils,
    );
  }

}( window, function factory( window, InfiniteScroll, utils ) {

// -------------------------- InfiniteScrollButton -------------------------- //

class InfiniteScrollButton {
  constructor( element, infScroll ) {
    this.element = element;
    this.infScroll = infScroll;
    // events
    this.clickHandler = this.onClick.bind( this );
    this.element.addEventListener( 'click', this.clickHandler );
    infScroll.on( 'request', this.disable.bind( this ) );
    infScroll.on( 'load', this.enable.bind( this ) );
    infScroll.on( 'error', this.hide.bind( this ) );
    infScroll.on( 'last', this.hide.bind( this ) );
  }

  onClick( event ) {
    event.preventDefault();
    this.infScroll.loadNextPage();
  }

  enable() {
    this.element.removeAttribute('disabled');
  }

  disable() {
    this.element.disabled = 'disabled';
  }

  hide() {
    this.element.style.display = 'none';
  }

  destroy() {
    this.element.removeEventListener( 'click', this.clickHandler );
  }

}

// -------------------------- InfiniteScroll methods -------------------------- //

// InfiniteScroll.defaults.button = null;

InfiniteScroll.create.button = function() {
  let buttonElem = utils.getQueryElement( this.options.button );
  if ( buttonElem ) {
    this.button = new InfiniteScrollButton( buttonElem, this );
  }
};

InfiniteScroll.destroy.button = function() {
  if ( this.button ) this.button.destroy();
};

// --------------------------  -------------------------- //

InfiniteScroll.Button = InfiniteScrollButton;

return InfiniteScroll;

} ) );

},{"./core":5,"fizzy-ui-utils":3}],5:[function(require,module,exports){
// core
( function( window, factory ) {
  // universal module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
        window,
        require('ev-emitter'),
        require('fizzy-ui-utils'),
    );
  } else {
    // browser global
    window.InfiniteScroll = factory(
        window,
        window.EvEmitter,
        window.fizzyUIUtils,
    );
  }

}( window, function factory( window, EvEmitter, utils ) {

let jQuery = window.jQuery;
// internal store of all InfiniteScroll intances
let instances = {};

function InfiniteScroll( element, options ) {
  let queryElem = utils.getQueryElement( element );

  if ( !queryElem ) {
    console.error( 'Bad element for InfiniteScroll: ' + ( queryElem || element ) );
    return;
  }
  element = queryElem;
  // do not initialize twice on same element
  if ( element.infiniteScrollGUID ) {
    let instance = instances[ element.infiniteScrollGUID ];
    instance.option( options );
    return instance;
  }

  this.element = element;
  // options
  this.options = { ...InfiniteScroll.defaults };
  this.option( options );
  // add jQuery
  if ( jQuery ) {
    this.$element = jQuery( this.element );
  }

  this.create();
}

// defaults
InfiniteScroll.defaults = {
  // path: null,
  // hideNav: null,
  // debug: false,
};

// create & destroy methods
InfiniteScroll.create = {};
InfiniteScroll.destroy = {};

let proto = InfiniteScroll.prototype;
// inherit EvEmitter
Object.assign( proto, EvEmitter.prototype );

// --------------------------  -------------------------- //

// globally unique identifiers
let GUID = 0;

proto.create = function() {
  // create core
  // add id for InfiniteScroll.data
  let id = this.guid = ++GUID;
  this.element.infiniteScrollGUID = id; // expando
  instances[ id ] = this; // associate via id
  // properties
  this.pageIndex = 1; // default to first page
  this.loadCount = 0;
  this.updateGetPath();
  // bail if getPath not set, or returns falsey #776
  let hasPath = this.getPath && this.getPath();
  if ( !hasPath ) {
    console.error('Disabling InfiniteScroll');
    return;
  }
  this.updateGetAbsolutePath();
  this.log( 'initialized', [ this.element.className ] );
  this.callOnInit();
  // create features
  for ( let method in InfiniteScroll.create ) {
    InfiniteScroll.create[ method ].call( this );
  }
};

proto.option = function( opts ) {
  Object.assign( this.options, opts );
};

// call onInit option, used for binding events on init
proto.callOnInit = function() {
  let onInit = this.options.onInit;
  if ( onInit ) {
    onInit.call( this, this );
  }
};

// ----- events ----- //

proto.dispatchEvent = function( type, event, args ) {
  this.log( type, args );
  let emitArgs = event ? [ event ].concat( args ) : args;
  this.emitEvent( type, emitArgs );
  // trigger jQuery event
  if ( !jQuery || !this.$element ) {
    return;
  }
  // namespace jQuery event
  type += '.infiniteScroll';
  let $event = type;
  if ( event ) {
    // create jQuery event
    /* eslint-disable-next-line new-cap */
    let jQEvent = jQuery.Event( event );
    jQEvent.type = type;
    $event = jQEvent;
  }
  this.$element.trigger( $event, args );
};

let loggers = {
  initialized: ( className ) => `on ${className}`,
  request: ( path ) => `URL: ${path}`,
  load: ( response, path ) => `${response.title || ''}. URL: ${path}`,
  error: ( error, path ) => `${error}. URL: ${path}`,
  append: ( response, path, items ) => `${items.length} items. URL: ${path}`,
  last: ( response, path ) => `URL: ${path}`,
  history: ( title, path ) => `URL: ${path}`,
  pageIndex: function( index, origin ) {
    return `current page determined to be: ${index} from ${origin}`;
  },
};

// log events
proto.log = function( type, args ) {
  if ( !this.options.debug ) return;

  let message = `[InfiniteScroll] ${type}`;
  let logger = loggers[ type ];
  if ( logger ) message += '. ' + logger.apply( this, args );
  console.log( message );
};

// -------------------------- methods used amoung features -------------------------- //

proto.updateMeasurements = function() {
  this.windowHeight = window.innerHeight;
  let rect = this.element.getBoundingClientRect();
  this.top = rect.top + window.scrollY;
};

proto.updateScroller = function() {
  let elementScroll = this.options.elementScroll;
  if ( !elementScroll ) {
    // default, use window
    this.scroller = window;
    return;
  }
  // if true, set to element, otherwise use option
  this.scroller = elementScroll === true ? this.element :
    utils.getQueryElement( elementScroll );
  if ( !this.scroller ) {
    throw new Error(`Unable to find elementScroll: ${elementScroll}`);
  }
};

// -------------------------- page path -------------------------- //

proto.updateGetPath = function() {
  let optPath = this.options.path;
  if ( !optPath ) {
    console.error(`InfiniteScroll path option required. Set as: ${optPath}`);
    return;
  }
  // function
  let type = typeof optPath;
  if ( type == 'function' ) {
    this.getPath = optPath;
    return;
  }
  // template string: '/pages/{{#}}.html'
  let templateMatch = type == 'string' && optPath.match('{{#}}');
  if ( templateMatch ) {
    this.updateGetPathTemplate( optPath );
    return;
  }
  // selector: '.next-page-selector'
  this.updateGetPathSelector( optPath );
};

proto.updateGetPathTemplate = function( optPath ) {
  // set getPath with template string
  this.getPath = () => {
    let nextIndex = this.pageIndex + 1;
    return optPath.replace( '{{#}}', nextIndex );
  };
  // get pageIndex from location
  // convert path option into regex to look for pattern in location
  // escape query (?) in url, allows for parsing GET parameters
  let regexString = optPath
    .replace( /(\\\?|\?)/, '\\?' )
    .replace( '{{#}}', '(\\d\\d?\\d?)' );
  let templateRe = new RegExp( regexString );
  let match = location.href.match( templateRe );

  if ( match ) {
    this.pageIndex = parseInt( match[1], 10 );
    this.log( 'pageIndex', [ this.pageIndex, 'template string' ] );
  }
};

let pathRegexes = [
  // WordPress & Tumblr - example.com/page/2
  // Jekyll - example.com/page2
  /^(.*?\/?page\/?)(\d\d?\d?)(.*?$)/,
  // Drupal - example.com/?page=1
  /^(.*?\/?\?page=)(\d\d?\d?)(.*?$)/,
  // catch all, last occurence of a number
  /(.*?)(\d\d?\d?)(?!.*\d)(.*?$)/,
];

// try matching href to pathRegexes patterns
let getPathParts = InfiniteScroll.getPathParts = function( href ) {
  if ( !href ) return;
  for ( let regex of pathRegexes ) {
    let match = href.match( regex );
    if ( match ) {
      let [ , begin, index, end ] = match;
      return { begin, index, end };
    }
  }
};

proto.updateGetPathSelector = function( optPath ) {
  // parse href of link: '.next-page-link'
  let hrefElem = document.querySelector( optPath );
  if ( !hrefElem ) {
    console.error(`Bad InfiniteScroll path option. Next link not found: ${optPath}`);
    return;
  }

  let href = hrefElem.getAttribute('href');
  let pathParts = getPathParts( href );
  if ( !pathParts ) {
    console.error(`InfiniteScroll unable to parse next link href: ${href}`);
    return;
  }

  let { begin, index, end } = pathParts;
  this.isPathSelector = true; // flag for checkLastPage()
  this.getPath = () => begin + ( this.pageIndex + 1 ) + end;
  // get pageIndex from href
  this.pageIndex = parseInt( index, 10 ) - 1;
  this.log( 'pageIndex', [ this.pageIndex, 'next link' ] );
};

proto.updateGetAbsolutePath = function() {
  let path = this.getPath();
  // path doesn't start with http or /
  let isAbsolute = path.match( /^http/ ) || path.match( /^\// );
  if ( isAbsolute ) {
    this.getAbsolutePath = this.getPath;
    return;
  }

  let { pathname } = location;
  // query parameter #829. example.com/?pg=2
  let isQuery = path.match( /^\?/ );
  // /foo/bar/index.html => /foo/bar
  let directory = pathname.substring( 0, pathname.lastIndexOf('/') );
  let pathStart = isQuery ? pathname : directory + '/';

  this.getAbsolutePath = () => pathStart + this.getPath();
};

// -------------------------- nav -------------------------- //

// hide navigation
InfiniteScroll.create.hideNav = function() {
  let nav = utils.getQueryElement( this.options.hideNav );
  if ( !nav ) return;

  nav.style.display = 'none';
  this.nav = nav;
};

InfiniteScroll.destroy.hideNav = function() {
  if ( this.nav ) this.nav.style.display = '';
};

// -------------------------- destroy -------------------------- //

proto.destroy = function() {
  this.allOff(); // remove all event listeners
  // call destroy methods
  for ( let method in InfiniteScroll.destroy ) {
    InfiniteScroll.destroy[ method ].call( this );
  }

  delete this.element.infiniteScrollGUID;
  delete instances[ this.guid ];
  // remove jQuery data. #807
  if ( jQuery && this.$element ) {
    jQuery.removeData( this.element, 'infiniteScroll' );
  }
};

// -------------------------- utilities -------------------------- //

// https://remysharp.com/2010/07/21/throttling-function-calls
InfiniteScroll.throttle = function( fn, threshold ) {
  threshold = threshold || 200;
  let last, timeout;

  return function() {
    let now = +new Date();
    let args = arguments;
    let trigger = () => {
      last = now;
      fn.apply( this, args );
    };
    if ( last && now < last + threshold ) {
      // hold on to it
      clearTimeout( timeout );
      timeout = setTimeout( trigger, threshold );
    } else {
      trigger();
    }
  };
};

InfiniteScroll.data = function( elem ) {
  elem = utils.getQueryElement( elem );
  let id = elem && elem.infiniteScrollGUID;
  return id && instances[ id ];
};

// set internal jQuery, for Webpack + jQuery v3
InfiniteScroll.setJQuery = function( jqry ) {
  jQuery = jqry;
};

// -------------------------- setup -------------------------- //

utils.htmlInit( InfiniteScroll, 'infinite-scroll' );

// add noop _init method for jQuery Bridget. #768
proto._init = function() {};

let { jQueryBridget } = window;
if ( jQuery && jQueryBridget ) {
  jQueryBridget( 'infiniteScroll', InfiniteScroll, jQuery );
}

// --------------------------  -------------------------- //

return InfiniteScroll;

} ) );

},{"ev-emitter":2,"fizzy-ui-utils":3}],6:[function(require,module,exports){
// history
( function( window, factory ) {
  // universal module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
        window,
        require('./core'),
        require('fizzy-ui-utils'),
    );
  } else {
    // browser global
    factory(
        window,
        window.InfiniteScroll,
        window.fizzyUIUtils,
    );
  }

}( window, function factory( window, InfiniteScroll, utils ) {

let proto = InfiniteScroll.prototype;

Object.assign( InfiniteScroll.defaults, {
  history: 'replace',
  // historyTitle: false,
} );

let link = document.createElement('a');

// ----- create/destroy ----- //

InfiniteScroll.create.history = function() {
  if ( !this.options.history ) return;

  // check for same origin
  link.href = this.getAbsolutePath();
  // MS Edge does not have origin on link
  // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12236493/
  let linkOrigin = link.origin || link.protocol + '//' + link.host;
  let isSameOrigin = linkOrigin == location.origin;
  if ( !isSameOrigin ) {
    console.error( '[InfiniteScroll] cannot set history with different origin: ' +
      `${link.origin} on ${location.origin} . History behavior disabled.` );
    return;
  }

  // two ways to handle changing history
  if ( this.options.append ) {
    this.createHistoryAppend();
  } else {
    this.createHistoryPageLoad();
  }
};

proto.createHistoryAppend = function() {
  this.updateMeasurements();
  this.updateScroller();
  // array of scroll positions of appended pages
  this.scrollPages = [
    // first page
    {
      top: 0,
      path: location.href,
      title: document.title,
    },
  ];
  this.scrollPage = this.scrollPages[0];
  // events
  this.scrollHistoryHandler = this.onScrollHistory.bind( this );
  this.unloadHandler = this.onUnload.bind( this );
  this.scroller.addEventListener( 'scroll', this.scrollHistoryHandler );
  this.on( 'append', this.onAppendHistory );
  this.bindHistoryAppendEvents( true );
};

proto.bindHistoryAppendEvents = function( isBind ) {
  let addRemove = isBind ? 'addEventListener' : 'removeEventListener';
  this.scroller[ addRemove ]( 'scroll', this.scrollHistoryHandler );
  window[ addRemove ]( 'unload', this.unloadHandler );
};

proto.createHistoryPageLoad = function() {
  this.on( 'load', this.onPageLoadHistory );
};

InfiniteScroll.destroy.history =
proto.destroyHistory = function() {
  let isHistoryAppend = this.options.history && this.options.append;
  if ( isHistoryAppend ) {
    this.bindHistoryAppendEvents( false );
  }
};

// ----- append history ----- //

proto.onAppendHistory = function( response, path, items ) {
  // do not proceed if no items. #779
  if ( !items || !items.length ) return;

  let firstItem = items[0];
  let elemScrollY = this.getElementScrollY( firstItem );
  // resolve path
  link.href = path;
  // add page data to hash
  this.scrollPages.push({
    top: elemScrollY,
    path: link.href,
    title: response.title,
  });
};

proto.getElementScrollY = function( elem ) {
  if ( this.options.elementScroll ) {
    return elem.offsetTop - this.top;
  } else {
    let rect = elem.getBoundingClientRect();
    return rect.top + window.scrollY;
  }
};

proto.onScrollHistory = function() {
  // cycle through positions, find biggest without going over
  let scrollPage = this.getClosestScrollPage();
  // set history if changed
  if ( scrollPage != this.scrollPage ) {
    this.scrollPage = scrollPage;
    this.setHistory( scrollPage.title, scrollPage.path );
  }
};

utils.debounceMethod( InfiniteScroll, 'onScrollHistory', 150 );

proto.getClosestScrollPage = function() {
  let scrollViewY;
  if ( this.options.elementScroll ) {
    scrollViewY = this.scroller.scrollTop + this.scroller.clientHeight / 2;
  } else {
    scrollViewY = window.scrollY + this.windowHeight / 2;
  }

  let scrollPage;
  for ( let page of this.scrollPages ) {
    if ( page.top >= scrollViewY ) break;

    scrollPage = page;
  }
  return scrollPage;
};

proto.setHistory = function( title, path ) {
  let optHistory = this.options.history;
  let historyMethod = optHistory && history[ optHistory + 'State' ];
  if ( !historyMethod ) return;

  history[ optHistory + 'State' ]( null, title, path );
  if ( this.options.historyTitle ) document.title = title;
  this.dispatchEvent( 'history', null, [ title, path ] );
};

// scroll to top to prevent initial scroll-reset after page refresh
// https://stackoverflow.com/a/18633915/182183
proto.onUnload = function() {
  if ( this.scrollPage.top === 0 ) return;

  // calculate where scroll position would be on refresh
  let scrollY = window.scrollY - this.scrollPage.top + this.top;
  // disable scroll event before setting scroll #679
  this.destroyHistory();
  scrollTo( 0, scrollY );
};

// ----- load history ----- //

// update URL
proto.onPageLoadHistory = function( response, path ) {
  this.setHistory( response.title, path );
};

// --------------------------  -------------------------- //

return InfiniteScroll;

} ) );

},{"./core":5,"fizzy-ui-utils":3}],7:[function(require,module,exports){
/*!
 * Infinite Scroll v4.0.1
 * Automatically add next page
 *
 * Licensed GPLv3 for open source use
 * or Infinite Scroll Commercial License for commercial use
 *
 * https://infinite-scroll.com
 * Copyright 2018-2020 Metafizzy
 */

( function( window, factory ) {
  // universal module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
        require('./core'),
        require('./page-load'),
        require('./scroll-watch'),
        require('./history'),
        require('./button'),
        require('./status'),
    );
  }

} )( window, function factory( InfiniteScroll ) {
  return InfiniteScroll;
} );

},{"./button":4,"./core":5,"./history":6,"./page-load":8,"./scroll-watch":9,"./status":10}],8:[function(require,module,exports){
// page-load
( function( window, factory ) {
  // universal module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
        window,
        require('./core'),
    );
  } else {
    // browser global
    factory(
        window,
        window.InfiniteScroll,
    );
  }

}( window, function factory( window, InfiniteScroll ) {

let proto = InfiniteScroll.prototype;

Object.assign( InfiniteScroll.defaults, {
  // append: false,
  loadOnScroll: true,
  checkLastPage: true,
  responseBody: 'text',
  domParseResponse: true,
  // prefill: false,
  // outlayer: null,
} );

InfiniteScroll.create.pageLoad = function() {
  this.canLoad = true;
  this.on( 'scrollThreshold', this.onScrollThresholdLoad );
  this.on( 'load', this.checkLastPage );
  if ( this.options.outlayer ) {
    this.on( 'append', this.onAppendOutlayer );
  }
};

proto.onScrollThresholdLoad = function() {
  if ( this.options.loadOnScroll ) this.loadNextPage();
};

let domParser = new DOMParser();

proto.loadNextPage = function() {
  if ( this.isLoading || !this.canLoad ) return;

  let { responseBody, domParseResponse, fetchOptions } = this.options;
  let path = this.getAbsolutePath();
  this.isLoading = true;
  if ( typeof fetchOptions == 'function' ) fetchOptions = fetchOptions();

  let fetchPromise = fetch( path, fetchOptions )
    .then( ( response ) => {
      if ( !response.ok ) {
        let error = new Error( response.statusText );
        this.onPageError( error, path, response );
        return { response };
      }

      return response[ responseBody ]().then( ( body ) => {
        let canDomParse = responseBody == 'text' && domParseResponse;
        if ( canDomParse ) {
          body = domParser.parseFromString( body, 'text/html' );
        }
        if ( response.status == 204 ) {
          this.lastPageReached( body, path );
          return { body, response };
        } else {
          return this.onPageLoad( body, path, response );
        }
      } );
    } )
    .catch( ( error ) => {
      this.onPageError( error, path );
    } );

  this.dispatchEvent( 'request', null, [ path, fetchPromise ] );

  return fetchPromise;
};

proto.onPageLoad = function( body, path, response ) {
  // done loading if not appending
  if ( !this.options.append ) {
    this.isLoading = false;
  }
  this.pageIndex++;
  this.loadCount++;
  this.dispatchEvent( 'load', null, [ body, path, response ] );
  return this.appendNextPage( body, path, response );
};

proto.appendNextPage = function( body, path, response ) {
  let { append, responseBody, domParseResponse } = this.options;
  // do not append json
  let isDocument = responseBody == 'text' && domParseResponse;
  if ( !isDocument || !append ) return { body, response };

  let items = body.querySelectorAll( append );
  let promiseValue = { body, response, items };
  // last page hit if no items. #840
  if ( !items || !items.length ) {
    this.lastPageReached( body, path );
    return promiseValue;
  }

  let fragment = getItemsFragment( items );
  let appendReady = () => {
    this.appendItems( items, fragment );
    this.isLoading = false;
    this.dispatchEvent( 'append', null, [ body, path, items, response ] );
    return promiseValue;
  };

  // TODO add hook for option to trigger appendReady
  if ( this.options.outlayer ) {
    return this.appendOutlayerItems( fragment, appendReady );
  } else {
    return appendReady();
  }
};

proto.appendItems = function( items, fragment ) {
  if ( !items || !items.length ) return;

  // get fragment if not provided
  fragment = fragment || getItemsFragment( items );
  refreshScripts( fragment );
  this.element.appendChild( fragment );
};

function getItemsFragment( items ) {
  // add items to fragment
  let fragment = document.createDocumentFragment();
  if ( items ) fragment.append( ...items );
  return fragment;
}

// replace <script>s with copies so they load
// <script>s added by InfiniteScroll will not load
// similar to https://stackoverflow.com/questions/610995
function refreshScripts( fragment ) {
  let scripts = fragment.querySelectorAll('script');
  for ( let script of scripts ) {
    let freshScript = document.createElement('script');
    // copy attributes
    let attrs = script.attributes;
    for ( let attr of attrs ) {
      freshScript.setAttribute( attr.name, attr.value );
    }
    // copy inner script code. #718, #782
    freshScript.innerHTML = script.innerHTML;
    script.parentNode.replaceChild( freshScript, script );
  }
}

// ----- outlayer ----- //

proto.appendOutlayerItems = function( fragment, appendReady ) {
  let imagesLoaded = InfiniteScroll.imagesLoaded || window.imagesLoaded;
  if ( !imagesLoaded ) {
    console.error('[InfiniteScroll] imagesLoaded required for outlayer option');
    this.isLoading = false;
    return;
  }
  // append once images loaded
  return new Promise( function( resolve ) {
    imagesLoaded( fragment, function() {
      let bodyResponse = appendReady();
      resolve( bodyResponse );
    } );
  } );
};

proto.onAppendOutlayer = function( response, path, items ) {
  this.options.outlayer.appended( items );
};

// ----- checkLastPage ----- //

// check response for next element
proto.checkLastPage = function( body, path ) {
  let { checkLastPage, path: pathOpt } = this.options;
  if ( !checkLastPage ) return;

  // if path is function, check if next path is truthy
  if ( typeof pathOpt == 'function' ) {
    let nextPath = this.getPath();
    if ( !nextPath ) {
      this.lastPageReached( body, path );
      return;
    }
  }
  // get selector from checkLastPage or path option
  let selector;
  if ( typeof checkLastPage == 'string' ) {
    selector = checkLastPage;
  } else if ( this.isPathSelector ) {
    // path option is selector string
    selector = pathOpt;
  }
  // check last page for selector
  // bail if no selector or not document response
  if ( !selector || !body.querySelector ) return;

  // check if response has selector
  let nextElem = body.querySelector( selector );
  if ( !nextElem ) this.lastPageReached( body, path );
};

proto.lastPageReached = function( body, path ) {
  this.canLoad = false;
  this.dispatchEvent( 'last', null, [ body, path ] );
};

// ----- error ----- //

proto.onPageError = function( error, path, response ) {
  this.isLoading = false;
  this.canLoad = false;
  this.dispatchEvent( 'error', null, [ error, path, response ] );
  return error;
};

// -------------------------- prefill -------------------------- //

InfiniteScroll.create.prefill = function() {
  if ( !this.options.prefill ) return;

  let append = this.options.append;
  if ( !append ) {
    console.error(`append option required for prefill. Set as :${append}`);
    return;
  }
  this.updateMeasurements();
  this.updateScroller();
  this.isPrefilling = true;
  this.on( 'append', this.prefill );
  this.once( 'error', this.stopPrefill );
  this.once( 'last', this.stopPrefill );
  this.prefill();
};

proto.prefill = function() {
  let distance = this.getPrefillDistance();
  this.isPrefilling = distance >= 0;
  if ( this.isPrefilling ) {
    this.log('prefill');
    this.loadNextPage();
  } else {
    this.stopPrefill();
  }
};

proto.getPrefillDistance = function() {
  // element scroll
  if ( this.options.elementScroll ) {
    return this.scroller.clientHeight - this.scroller.scrollHeight;
  }
  // window
  return this.windowHeight - this.element.clientHeight;
};

proto.stopPrefill = function() {
  this.log('stopPrefill');
  this.off( 'append', this.prefill );
};

// --------------------------  -------------------------- //

return InfiniteScroll;

} ) );

},{"./core":5}],9:[function(require,module,exports){
// scroll-watch
( function( window, factory ) {
  // universal module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
        window,
        require('./core'),
        require('fizzy-ui-utils'),
    );
  } else {
    // browser global
    factory(
        window,
        window.InfiniteScroll,
        window.fizzyUIUtils,
    );
  }

}( window, function factory( window, InfiniteScroll, utils ) {

let proto = InfiniteScroll.prototype;

// default options
Object.assign( InfiniteScroll.defaults, {
  scrollThreshold: 400,
  // elementScroll: null,
} );

InfiniteScroll.create.scrollWatch = function() {
  // events
  this.pageScrollHandler = this.onPageScroll.bind( this );
  this.resizeHandler = this.onResize.bind( this );

  let scrollThreshold = this.options.scrollThreshold;
  let isEnable = scrollThreshold || scrollThreshold === 0;
  if ( isEnable ) this.enableScrollWatch();
};

InfiniteScroll.destroy.scrollWatch = function() {
  this.disableScrollWatch();
};

proto.enableScrollWatch = function() {
  if ( this.isScrollWatching ) return;

  this.isScrollWatching = true;
  this.updateMeasurements();
  this.updateScroller();
  // TODO disable after error?
  this.on( 'last', this.disableScrollWatch );
  this.bindScrollWatchEvents( true );
};

proto.disableScrollWatch = function() {
  if ( !this.isScrollWatching ) return;

  this.bindScrollWatchEvents( false );
  delete this.isScrollWatching;
};

proto.bindScrollWatchEvents = function( isBind ) {
  let addRemove = isBind ? 'addEventListener' : 'removeEventListener';
  this.scroller[ addRemove ]( 'scroll', this.pageScrollHandler );
  window[ addRemove ]( 'resize', this.resizeHandler );
};

proto.onPageScroll = InfiniteScroll.throttle( function() {
  let distance = this.getBottomDistance();
  if ( distance <= this.options.scrollThreshold ) {
    this.dispatchEvent('scrollThreshold');
  }
} );

proto.getBottomDistance = function() {
  let bottom, scrollY;
  if ( this.options.elementScroll ) {
    bottom = this.scroller.scrollHeight;
    scrollY = this.scroller.scrollTop + this.scroller.clientHeight;
  } else {
    bottom = this.top + this.element.clientHeight;
    scrollY = window.scrollY + this.windowHeight;
  }
  return bottom - scrollY;
};

proto.onResize = function() {
  this.updateMeasurements();
};

utils.debounceMethod( InfiniteScroll, 'onResize', 150 );

// --------------------------  -------------------------- //

return InfiniteScroll;

} ) );

},{"./core":5,"fizzy-ui-utils":3}],10:[function(require,module,exports){
// status
( function( window, factory ) {
  // universal module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
        window,
        require('./core'),
        require('fizzy-ui-utils'),
    );
  } else {
    // browser global
    factory(
        window,
        window.InfiniteScroll,
        window.fizzyUIUtils,
    );
  }

}( window, function factory( window, InfiniteScroll, utils ) {

let proto = InfiniteScroll.prototype;

// InfiniteScroll.defaults.status = null;

InfiniteScroll.create.status = function() {
  let statusElem = utils.getQueryElement( this.options.status );
  if ( !statusElem ) return;

  // elements
  this.statusElement = statusElem;
  this.statusEventElements = {
    request: statusElem.querySelector('.infinite-scroll-request'),
    error: statusElem.querySelector('.infinite-scroll-error'),
    last: statusElem.querySelector('.infinite-scroll-last'),
  };
  // events
  this.on( 'request', this.showRequestStatus );
  this.on( 'error', this.showErrorStatus );
  this.on( 'last', this.showLastStatus );
  this.bindHideStatus('on');
};

proto.bindHideStatus = function( bindMethod ) {
  let hideEvent = this.options.append ? 'append' : 'load';
  this[ bindMethod ]( hideEvent, this.hideAllStatus );
};

proto.showRequestStatus = function() {
  this.showStatus('request');
};

proto.showErrorStatus = function() {
  this.showStatus('error');
};

proto.showLastStatus = function() {
  this.showStatus('last');
  // prevent last then append event race condition from showing last status #706
  this.bindHideStatus('off');
};

proto.showStatus = function( eventName ) {
  show( this.statusElement );
  this.hideStatusEventElements();
  let eventElem = this.statusEventElements[ eventName ];
  show( eventElem );
};

proto.hideAllStatus = function() {
  hide( this.statusElement );
  this.hideStatusEventElements();
};

proto.hideStatusEventElements = function() {
  for ( let type in this.statusEventElements ) {
    let eventElem = this.statusEventElements[ type ];
    hide( eventElem );
  }
};

// --------------------------  -------------------------- //

function hide( elem ) {
  setDisplay( elem, 'none' );
}

function show( elem ) {
  setDisplay( elem, 'block' );
}

function setDisplay( elem, value ) {
  if ( elem ) {
    elem.style.display = value;
  }
}

// --------------------------  -------------------------- //

return InfiniteScroll;

} ) );

},{"./core":5,"fizzy-ui-utils":3}],11:[function(require,module,exports){
(function(window, factory) {
	var lazySizes = factory(window, window.document, Date);
	window.lazySizes = lazySizes;
	if(typeof module == 'object' && module.exports){
		module.exports = lazySizes;
	}
}(typeof window != 'undefined' ?
      window : {}, 
/**
 * import("./types/global")
 * @typedef { import("./types/lazysizes-config").LazySizesConfigPartial } LazySizesConfigPartial
 */
function l(window, document, Date) { // Pass in the window Date function also for SSR because the Date class can be lost
	'use strict';
	/*jshint eqnull:true */

	var lazysizes,
		/**
		 * @type { LazySizesConfigPartial }
		 */
		lazySizesCfg;

	(function(){
		var prop;

		var lazySizesDefaults = {
			lazyClass: 'lazyload',
			loadedClass: 'lazyloaded',
			loadingClass: 'lazyloading',
			preloadClass: 'lazypreload',
			errorClass: 'lazyerror',
			//strictClass: 'lazystrict',
			autosizesClass: 'lazyautosizes',
			fastLoadedClass: 'ls-is-cached',
			iframeLoadMode: 0,
			srcAttr: 'data-src',
			srcsetAttr: 'data-srcset',
			sizesAttr: 'data-sizes',
			//preloadAfterLoad: false,
			minSize: 40,
			customMedia: {},
			init: true,
			expFactor: 1.5,
			hFac: 0.8,
			loadMode: 2,
			loadHidden: true,
			ricTimeout: 0,
			throttleDelay: 125,
		};

		lazySizesCfg = window.lazySizesConfig || window.lazysizesConfig || {};

		for(prop in lazySizesDefaults){
			if(!(prop in lazySizesCfg)){
				lazySizesCfg[prop] = lazySizesDefaults[prop];
			}
		}
	})();

	if (!document || !document.getElementsByClassName) {
		return {
			init: function () {},
			/**
			 * @type { LazySizesConfigPartial }
			 */
			cfg: lazySizesCfg,
			/**
			 * @type { true }
			 */
			noSupport: true,
		};
	}

	var docElem = document.documentElement;

	var supportPicture = window.HTMLPictureElement;

	var _addEventListener = 'addEventListener';

	var _getAttribute = 'getAttribute';

	/**
	 * Update to bind to window because 'this' becomes null during SSR
	 * builds.
	 */
	var addEventListener = window[_addEventListener].bind(window);

	var setTimeout = window.setTimeout;

	var requestAnimationFrame = window.requestAnimationFrame || setTimeout;

	var requestIdleCallback = window.requestIdleCallback;

	var regPicture = /^picture$/i;

	var loadEvents = ['load', 'error', 'lazyincluded', '_lazyloaded'];

	var regClassCache = {};

	var forEach = Array.prototype.forEach;

	/**
	 * @param ele {Element}
	 * @param cls {string}
	 */
	var hasClass = function(ele, cls) {
		if(!regClassCache[cls]){
			regClassCache[cls] = new RegExp('(\\s|^)'+cls+'(\\s|$)');
		}
		return regClassCache[cls].test(ele[_getAttribute]('class') || '') && regClassCache[cls];
	};

	/**
	 * @param ele {Element}
	 * @param cls {string}
	 */
	var addClass = function(ele, cls) {
		if (!hasClass(ele, cls)){
			ele.setAttribute('class', (ele[_getAttribute]('class') || '').trim() + ' ' + cls);
		}
	};

	/**
	 * @param ele {Element}
	 * @param cls {string}
	 */
	var removeClass = function(ele, cls) {
		var reg;
		if ((reg = hasClass(ele,cls))) {
			ele.setAttribute('class', (ele[_getAttribute]('class') || '').replace(reg, ' '));
		}
	};

	var addRemoveLoadEvents = function(dom, fn, add){
		var action = add ? _addEventListener : 'removeEventListener';
		if(add){
			addRemoveLoadEvents(dom, fn);
		}
		loadEvents.forEach(function(evt){
			dom[action](evt, fn);
		});
	};

	/**
	 * @param elem { Element }
	 * @param name { string }
	 * @param detail { any }
	 * @param noBubbles { boolean }
	 * @param noCancelable { boolean }
	 * @returns { CustomEvent }
	 */
	var triggerEvent = function(elem, name, detail, noBubbles, noCancelable){
		var event = document.createEvent('Event');

		if(!detail){
			detail = {};
		}

		detail.instance = lazysizes;

		event.initEvent(name, !noBubbles, !noCancelable);

		event.detail = detail;

		elem.dispatchEvent(event);
		return event;
	};

	var updatePolyfill = function (el, full){
		var polyfill;
		if( !supportPicture && ( polyfill = (window.picturefill || lazySizesCfg.pf) ) ){
			if(full && full.src && !el[_getAttribute]('srcset')){
				el.setAttribute('srcset', full.src);
			}
			polyfill({reevaluate: true, elements: [el]});
		} else if(full && full.src){
			el.src = full.src;
		}
	};

	var getCSS = function (elem, style){
		return (getComputedStyle(elem, null) || {})[style];
	};

	/**
	 *
	 * @param elem { Element }
	 * @param parent { Element }
	 * @param [width] {number}
	 * @returns {number}
	 */
	var getWidth = function(elem, parent, width){
		width = width || elem.offsetWidth;

		while(width < lazySizesCfg.minSize && parent && !elem._lazysizesWidth){
			width =  parent.offsetWidth;
			parent = parent.parentNode;
		}

		return width;
	};

	var rAF = (function(){
		var running, waiting;
		var firstFns = [];
		var secondFns = [];
		var fns = firstFns;

		var run = function(){
			var runFns = fns;

			fns = firstFns.length ? secondFns : firstFns;

			running = true;
			waiting = false;

			while(runFns.length){
				runFns.shift()();
			}

			running = false;
		};

		var rafBatch = function(fn, queue){
			if(running && !queue){
				fn.apply(this, arguments);
			} else {
				fns.push(fn);

				if(!waiting){
					waiting = true;
					(document.hidden ? setTimeout : requestAnimationFrame)(run);
				}
			}
		};

		rafBatch._lsFlush = run;

		return rafBatch;
	})();

	var rAFIt = function(fn, simple){
		return simple ?
			function() {
				rAF(fn);
			} :
			function(){
				var that = this;
				var args = arguments;
				rAF(function(){
					fn.apply(that, args);
				});
			}
		;
	};

	var throttle = function(fn){
		var running;
		var lastTime = 0;
		var gDelay = lazySizesCfg.throttleDelay;
		var rICTimeout = lazySizesCfg.ricTimeout;
		var run = function(){
			running = false;
			lastTime = Date.now();
			fn();
		};
		var idleCallback = requestIdleCallback && rICTimeout > 49 ?
			function(){
				requestIdleCallback(run, {timeout: rICTimeout});

				if(rICTimeout !== lazySizesCfg.ricTimeout){
					rICTimeout = lazySizesCfg.ricTimeout;
				}
			} :
			rAFIt(function(){
				setTimeout(run);
			}, true)
		;

		return function(isPriority){
			var delay;

			if((isPriority = isPriority === true)){
				rICTimeout = 33;
			}

			if(running){
				return;
			}

			running =  true;

			delay = gDelay - (Date.now() - lastTime);

			if(delay < 0){
				delay = 0;
			}

			if(isPriority || delay < 9){
				idleCallback();
			} else {
				setTimeout(idleCallback, delay);
			}
		};
	};

	//based on http://modernjavascript.blogspot.de/2013/08/building-better-debounce.html
	var debounce = function(func) {
		var timeout, timestamp;
		var wait = 99;
		var run = function(){
			timeout = null;
			func();
		};
		var later = function() {
			var last = Date.now() - timestamp;

			if (last < wait) {
				setTimeout(later, wait - last);
			} else {
				(requestIdleCallback || run)(run);
			}
		};

		return function() {
			timestamp = Date.now();

			if (!timeout) {
				timeout = setTimeout(later, wait);
			}
		};
	};

	var loader = (function(){
		var preloadElems, isCompleted, resetPreloadingTimer, loadMode, started;

		var eLvW, elvH, eLtop, eLleft, eLright, eLbottom, isBodyHidden;

		var regImg = /^img$/i;
		var regIframe = /^iframe$/i;

		var supportScroll = ('onscroll' in window) && !(/(gle|ing)bot/.test(navigator.userAgent));

		var shrinkExpand = 0;
		var currentExpand = 0;

		var isLoading = 0;
		var lowRuns = -1;

		var resetPreloading = function(e){
			isLoading--;
			if(!e || isLoading < 0 || !e.target){
				isLoading = 0;
			}
		};

		var isVisible = function (elem) {
			if (isBodyHidden == null) {
				isBodyHidden = getCSS(document.body, 'visibility') == 'hidden';
			}

			return isBodyHidden || !(getCSS(elem.parentNode, 'visibility') == 'hidden' && getCSS(elem, 'visibility') == 'hidden');
		};

		var isNestedVisible = function(elem, elemExpand){
			var outerRect;
			var parent = elem;
			var visible = isVisible(elem);

			eLtop -= elemExpand;
			eLbottom += elemExpand;
			eLleft -= elemExpand;
			eLright += elemExpand;

			while(visible && (parent = parent.offsetParent) && parent != document.body && parent != docElem){
				visible = ((getCSS(parent, 'opacity') || 1) > 0);

				if(visible && getCSS(parent, 'overflow') != 'visible'){
					outerRect = parent.getBoundingClientRect();
					visible = eLright > outerRect.left &&
						eLleft < outerRect.right &&
						eLbottom > outerRect.top - 1 &&
						eLtop < outerRect.bottom + 1
					;
				}
			}

			return visible;
		};

		var checkElements = function() {
			var eLlen, i, rect, autoLoadElem, loadedSomething, elemExpand, elemNegativeExpand, elemExpandVal,
				beforeExpandVal, defaultExpand, preloadExpand, hFac;
			var lazyloadElems = lazysizes.elements;

			if((loadMode = lazySizesCfg.loadMode) && isLoading < 8 && (eLlen = lazyloadElems.length)){

				i = 0;

				lowRuns++;

				for(; i < eLlen; i++){

					if(!lazyloadElems[i] || lazyloadElems[i]._lazyRace){continue;}

					if(!supportScroll || (lazysizes.prematureUnveil && lazysizes.prematureUnveil(lazyloadElems[i]))){unveilElement(lazyloadElems[i]);continue;}

					if(!(elemExpandVal = lazyloadElems[i][_getAttribute]('data-expand')) || !(elemExpand = elemExpandVal * 1)){
						elemExpand = currentExpand;
					}

					if (!defaultExpand) {
						defaultExpand = (!lazySizesCfg.expand || lazySizesCfg.expand < 1) ?
							docElem.clientHeight > 500 && docElem.clientWidth > 500 ? 500 : 370 :
							lazySizesCfg.expand;

						lazysizes._defEx = defaultExpand;

						preloadExpand = defaultExpand * lazySizesCfg.expFactor;
						hFac = lazySizesCfg.hFac;
						isBodyHidden = null;

						if(currentExpand < preloadExpand && isLoading < 1 && lowRuns > 2 && loadMode > 2 && !document.hidden){
							currentExpand = preloadExpand;
							lowRuns = 0;
						} else if(loadMode > 1 && lowRuns > 1 && isLoading < 6){
							currentExpand = defaultExpand;
						} else {
							currentExpand = shrinkExpand;
						}
					}

					if(beforeExpandVal !== elemExpand){
						eLvW = innerWidth + (elemExpand * hFac);
						elvH = innerHeight + elemExpand;
						elemNegativeExpand = elemExpand * -1;
						beforeExpandVal = elemExpand;
					}

					rect = lazyloadElems[i].getBoundingClientRect();

					if ((eLbottom = rect.bottom) >= elemNegativeExpand &&
						(eLtop = rect.top) <= elvH &&
						(eLright = rect.right) >= elemNegativeExpand * hFac &&
						(eLleft = rect.left) <= eLvW &&
						(eLbottom || eLright || eLleft || eLtop) &&
						(lazySizesCfg.loadHidden || isVisible(lazyloadElems[i])) &&
						((isCompleted && isLoading < 3 && !elemExpandVal && (loadMode < 3 || lowRuns < 4)) || isNestedVisible(lazyloadElems[i], elemExpand))){
						unveilElement(lazyloadElems[i]);
						loadedSomething = true;
						if(isLoading > 9){break;}
					} else if(!loadedSomething && isCompleted && !autoLoadElem &&
						isLoading < 4 && lowRuns < 4 && loadMode > 2 &&
						(preloadElems[0] || lazySizesCfg.preloadAfterLoad) &&
						(preloadElems[0] || (!elemExpandVal && ((eLbottom || eLright || eLleft || eLtop) || lazyloadElems[i][_getAttribute](lazySizesCfg.sizesAttr) != 'auto')))){
						autoLoadElem = preloadElems[0] || lazyloadElems[i];
					}
				}

				if(autoLoadElem && !loadedSomething){
					unveilElement(autoLoadElem);
				}
			}
		};

		var throttledCheckElements = throttle(checkElements);

		var switchLoadingClass = function(e){
			var elem = e.target;

			if (elem._lazyCache) {
				delete elem._lazyCache;
				return;
			}

			resetPreloading(e);
			addClass(elem, lazySizesCfg.loadedClass);
			removeClass(elem, lazySizesCfg.loadingClass);
			addRemoveLoadEvents(elem, rafSwitchLoadingClass);
			triggerEvent(elem, 'lazyloaded');
		};
		var rafedSwitchLoadingClass = rAFIt(switchLoadingClass);
		var rafSwitchLoadingClass = function(e){
			rafedSwitchLoadingClass({target: e.target});
		};

		var changeIframeSrc = function(elem, src){
			var loadMode = elem.getAttribute('data-load-mode') || lazySizesCfg.iframeLoadMode;

			// loadMode can be also a string!
			if (loadMode == 0) {
				elem.contentWindow.location.replace(src);
			} else if (loadMode == 1) {
				elem.src = src;
			}
		};

		var handleSources = function(source){
			var customMedia;

			var sourceSrcset = source[_getAttribute](lazySizesCfg.srcsetAttr);

			if( (customMedia = lazySizesCfg.customMedia[source[_getAttribute]('data-media') || source[_getAttribute]('media')]) ){
				source.setAttribute('media', customMedia);
			}

			if(sourceSrcset){
				source.setAttribute('srcset', sourceSrcset);
			}
		};

		var lazyUnveil = rAFIt(function (elem, detail, isAuto, sizes, isImg){
			var src, srcset, parent, isPicture, event, firesLoad;

			if(!(event = triggerEvent(elem, 'lazybeforeunveil', detail)).defaultPrevented){

				if(sizes){
					if(isAuto){
						addClass(elem, lazySizesCfg.autosizesClass);
					} else {
						elem.setAttribute('sizes', sizes);
					}
				}

				srcset = elem[_getAttribute](lazySizesCfg.srcsetAttr);
				src = elem[_getAttribute](lazySizesCfg.srcAttr);

				if(isImg) {
					parent = elem.parentNode;
					isPicture = parent && regPicture.test(parent.nodeName || '');
				}

				firesLoad = detail.firesLoad || (('src' in elem) && (srcset || src || isPicture));

				event = {target: elem};

				addClass(elem, lazySizesCfg.loadingClass);

				if(firesLoad){
					clearTimeout(resetPreloadingTimer);
					resetPreloadingTimer = setTimeout(resetPreloading, 2500);
					addRemoveLoadEvents(elem, rafSwitchLoadingClass, true);
				}

				if(isPicture){
					forEach.call(parent.getElementsByTagName('source'), handleSources);
				}

				if(srcset){
					elem.setAttribute('srcset', srcset);
				} else if(src && !isPicture){
					if(regIframe.test(elem.nodeName)){
						changeIframeSrc(elem, src);
					} else {
						elem.src = src;
					}
				}

				if(isImg && (srcset || isPicture)){
					updatePolyfill(elem, {src: src});
				}
			}

			if(elem._lazyRace){
				delete elem._lazyRace;
			}
			removeClass(elem, lazySizesCfg.lazyClass);

			rAF(function(){
				// Part of this can be removed as soon as this fix is older: https://bugs.chromium.org/p/chromium/issues/detail?id=7731 (2015)
				var isLoaded = elem.complete && elem.naturalWidth > 1;

				if( !firesLoad || isLoaded){
					if (isLoaded) {
						addClass(elem, lazySizesCfg.fastLoadedClass);
					}
					switchLoadingClass(event);
					elem._lazyCache = true;
					setTimeout(function(){
						if ('_lazyCache' in elem) {
							delete elem._lazyCache;
						}
					}, 9);
				}
				if (elem.loading == 'lazy') {
					isLoading--;
				}
			}, true);
		});

		/**
		 *
		 * @param elem { Element }
		 */
		var unveilElement = function (elem){
			if (elem._lazyRace) {return;}
			var detail;

			var isImg = regImg.test(elem.nodeName);

			//allow using sizes="auto", but don't use. it's invalid. Use data-sizes="auto" or a valid value for sizes instead (i.e.: sizes="80vw")
			var sizes = isImg && (elem[_getAttribute](lazySizesCfg.sizesAttr) || elem[_getAttribute]('sizes'));
			var isAuto = sizes == 'auto';

			if( (isAuto || !isCompleted) && isImg && (elem[_getAttribute]('src') || elem.srcset) && !elem.complete && !hasClass(elem, lazySizesCfg.errorClass) && hasClass(elem, lazySizesCfg.lazyClass)){return;}

			detail = triggerEvent(elem, 'lazyunveilread').detail;

			if(isAuto){
				 autoSizer.updateElem(elem, true, elem.offsetWidth);
			}

			elem._lazyRace = true;
			isLoading++;

			lazyUnveil(elem, detail, isAuto, sizes, isImg);
		};

		var afterScroll = debounce(function(){
			lazySizesCfg.loadMode = 3;
			throttledCheckElements();
		});

		var altLoadmodeScrollListner = function(){
			if(lazySizesCfg.loadMode == 3){
				lazySizesCfg.loadMode = 2;
			}
			afterScroll();
		};

		var onload = function(){
			if(isCompleted){return;}
			if(Date.now() - started < 999){
				setTimeout(onload, 999);
				return;
			}


			isCompleted = true;

			lazySizesCfg.loadMode = 3;

			throttledCheckElements();

			addEventListener('scroll', altLoadmodeScrollListner, true);
		};

		return {
			_: function(){
				started = Date.now();

				lazysizes.elements = document.getElementsByClassName(lazySizesCfg.lazyClass);
				preloadElems = document.getElementsByClassName(lazySizesCfg.lazyClass + ' ' + lazySizesCfg.preloadClass);

				addEventListener('scroll', throttledCheckElements, true);

				addEventListener('resize', throttledCheckElements, true);

				addEventListener('pageshow', function (e) {
					if (e.persisted) {
						var loadingElements = document.querySelectorAll('.' + lazySizesCfg.loadingClass);

						if (loadingElements.length && loadingElements.forEach) {
							requestAnimationFrame(function () {
								loadingElements.forEach( function (img) {
									if (img.complete) {
										unveilElement(img);
									}
								});
							});
						}
					}
				});

				if(window.MutationObserver){
					new MutationObserver( throttledCheckElements ).observe( docElem, {childList: true, subtree: true, attributes: true} );
				} else {
					docElem[_addEventListener]('DOMNodeInserted', throttledCheckElements, true);
					docElem[_addEventListener]('DOMAttrModified', throttledCheckElements, true);
					setInterval(throttledCheckElements, 999);
				}

				addEventListener('hashchange', throttledCheckElements, true);

				//, 'fullscreenchange'
				['focus', 'mouseover', 'click', 'load', 'transitionend', 'animationend'].forEach(function(name){
					document[_addEventListener](name, throttledCheckElements, true);
				});

				if((/d$|^c/.test(document.readyState))){
					onload();
				} else {
					addEventListener('load', onload);
					document[_addEventListener]('DOMContentLoaded', throttledCheckElements);
					setTimeout(onload, 20000);
				}

				if(lazysizes.elements.length){
					checkElements();
					rAF._lsFlush();
				} else {
					throttledCheckElements();
				}
			},
			checkElems: throttledCheckElements,
			unveil: unveilElement,
			_aLSL: altLoadmodeScrollListner,
		};
	})();


	var autoSizer = (function(){
		var autosizesElems;

		var sizeElement = rAFIt(function(elem, parent, event, width){
			var sources, i, len;
			elem._lazysizesWidth = width;
			width += 'px';

			elem.setAttribute('sizes', width);

			if(regPicture.test(parent.nodeName || '')){
				sources = parent.getElementsByTagName('source');
				for(i = 0, len = sources.length; i < len; i++){
					sources[i].setAttribute('sizes', width);
				}
			}

			if(!event.detail.dataAttr){
				updatePolyfill(elem, event.detail);
			}
		});
		/**
		 *
		 * @param elem {Element}
		 * @param dataAttr
		 * @param [width] { number }
		 */
		var getSizeElement = function (elem, dataAttr, width){
			var event;
			var parent = elem.parentNode;

			if(parent){
				width = getWidth(elem, parent, width);
				event = triggerEvent(elem, 'lazybeforesizes', {width: width, dataAttr: !!dataAttr});

				if(!event.defaultPrevented){
					width = event.detail.width;

					if(width && width !== elem._lazysizesWidth){
						sizeElement(elem, parent, event, width);
					}
				}
			}
		};

		var updateElementsSizes = function(){
			var i;
			var len = autosizesElems.length;
			if(len){
				i = 0;

				for(; i < len; i++){
					getSizeElement(autosizesElems[i]);
				}
			}
		};

		var debouncedUpdateElementsSizes = debounce(updateElementsSizes);

		return {
			_: function(){
				autosizesElems = document.getElementsByClassName(lazySizesCfg.autosizesClass);
				addEventListener('resize', debouncedUpdateElementsSizes);
			},
			checkElems: debouncedUpdateElementsSizes,
			updateElem: getSizeElement
		};
	})();

	var init = function(){
		if(!init.i && document.getElementsByClassName){
			init.i = true;
			autoSizer._();
			loader._();
		}
	};

	setTimeout(function(){
		if(lazySizesCfg.init){
			init();
		}
	});

	lazysizes = {
		/**
		 * @type { LazySizesConfigPartial }
		 */
		cfg: lazySizesCfg,
		autoSizer: autoSizer,
		loader: loader,
		init: init,
		uP: updatePolyfill,
		aC: addClass,
		rC: removeClass,
		hC: hasClass,
		fire: triggerEvent,
		gW: getWidth,
		rAF: rAF,
	};

	return lazysizes;
}
));

},{}],12:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _documentQuerySelectorAll = _interopRequireDefault(require("./document-query-selector-all"));
/* global localStorage  */
var _default = el => {
  const $toggleTheme = (0, _documentQuerySelectorAll.default)(el);
  if (!$toggleTheme.length) return;
  const rootEl = document.documentElement;
  $toggleTheme.forEach(item => item.addEventListener('click', function (event) {
    event.preventDefault();
    if (!rootEl.classList.contains('dark')) {
      rootEl.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      rootEl.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }));
};
exports.default = _default;

},{"./document-query-selector-all":13,"@babel/runtime/helpers/interopRequireDefault":1}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function _default(selector) {
  const parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
  return Array.prototype.slice.call(parent.querySelectorAll(selector), 0);
}

},{}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = (coverClass, headTransparent) => {
  const domBody = document.body;
  const hasCover = domBody.closest(coverClass);
  if (!hasCover) return;
  window.addEventListener('scroll', () => {
    const lastScrollY = window.scrollY;
    lastScrollY >= 60 ? domBody.classList.remove(headTransparent) : domBody.classList.add(headTransparent);
  }, {
    passive: true
  });
};
exports.default = _default;

},{}],15:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _documentQuerySelectorAll = _interopRequireDefault(require("./document-query-selector-all"));
var _default = (socialMediaData, boxSelector) => {
  // check if the box for the menu exists
  const nodeBox = (0, _documentQuerySelectorAll.default)(boxSelector);
  if (!nodeBox.length) return;
  const urlRegexp = url => /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/.test(url); //eslint-disable-line

  const createElement = element => {
    Object.entries(socialMediaData).forEach(([name, urlTitle]) => {
      const url = urlTitle[0];

      // The url is being validated if it is false it returns
      if (!urlRegexp(url)) return;
      const link = document.createElement('a');
      link.href = url;
      link.title = urlTitle[1];
      link.classList = `button border-none hover:text-${name}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.innerHTML = `<svg class="icon icon--${name}"><use xlink:href="#icon-${name}"></use></svg>`;
      element.appendChild(link);
    });
  };
  return nodeBox.forEach(createElement);
};
exports.default = _default;

},{"./document-query-selector-all":13,"@babel/runtime/helpers/interopRequireDefault":1}],16:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _loadScript = _interopRequireDefault(require("./load-script"));
var _documentQuerySelectorAll = _interopRequireDefault(require("../app/document-query-selector-all"));
/* global prismJs */
var _default = (root = document, codeLanguage) => {
  const $codeLanguage = root && root.querySelectorAll ? root.querySelectorAll(codeLanguage) : (0, _documentQuerySelectorAll.default)(codeLanguage);
  if ((!$codeLanguage || !$codeLanguage.length) && typeof prismJs === 'undefined') return;

  // Show Language
  Array.prototype.forEach.call($codeLanguage || [], element => {
    // Idempotency
    if (element.classList && element.classList.contains('js-prism-processed')) return;
    let language = element.getAttribute('class') || '';
    language = language.split('-');
    if (element.parentElement && language[1]) {
      element.parentElement.setAttribute('rel', language[1]);
    }
    if (element.classList) element.classList.add('js-prism-processed');
  });

  // Load PrismJs and Plugin Loaf
  (0, _loadScript.default)(prismJs);
};
exports.default = _default;

},{"../app/document-query-selector-all":13,"./load-script":17,"@babel/runtime/helpers/interopRequireDefault":1}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = (src, callback) => {
  const scriptElement = document.createElement('script');
  scriptElement.src = src;
  scriptElement.defer = true;
  scriptElement.async = true;
  callback && scriptElement.addEventListener('load', callback);
  document.body.appendChild(scriptElement);
};
exports.default = _default;

},{}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = settings => {
  const defaults = {
    selector: '#js-promo-popup',
    storageKey: 'm4-promo-hidden',
    delay: 1000,
    content: `
      <div class="promo-popup__content">
        <span class="promo-popup__message">
          📢 We've updated our privacy policy and detention guidelines.
        </span>
        <button class="promo-popup__btn js-promo-close">
          Don't show again
        </button>
      </div>
    `
  };
  const options = {
    ...defaults,
    ...settings
  };
  const element = document.querySelector(options.selector);
  if (!element) return;

  // Check Session Storage
  if (window.sessionStorage.getItem(options.storageKey) === 'true') {
    return;
  }

  // Populate HTML
  element.innerHTML = options.content;

  // Animate In (Enlarge Vertically)
  window.setTimeout(() => {
    element.classList.add('is-visible');
  }, options.delay);

  // Handle Close
  element.addEventListener('click', e => {
    if (e.target.classList.contains('js-promo-close')) {
      e.preventDefault();

      // Animate Out
      element.classList.remove('is-visible');

      // Set Session Storage
      window.sessionStorage.setItem(options.storageKey, 'true');

      // Remove from DOM after transition
      window.setTimeout(() => {
        element.innerHTML = '';
      }, 500);
    }
  });
};
exports.default = _default;

},{}],19:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _documentQuerySelectorAll = _interopRequireDefault(require("../app/document-query-selector-all"));
/**
 * Gallery card support
 * Used on any individual post/page
 *
 * Detects when a gallery card has been used and applies sizing to make sure
 * the display matches what is seen in the editor.
 */
var _default = (root = document) => {
  const images = root && root.querySelectorAll ? root.querySelectorAll('.kg-gallery-image > img') : (0, _documentQuerySelectorAll.default)('.kg-gallery-image > img');
  if (!images || !images.length) return;
  images.forEach(image => {
    // Idempotency: skip images already processed
    if (image.classList && image.classList.contains('js-gallery-processed')) return;
    const container = image.closest('.kg-gallery-image');
    if (!container) return;
    const width = image.attributes.width && image.attributes.width.value;
    const height = image.attributes.height && image.attributes.height.value;
    if (!width || !height) return;
    const ratio = width / height;
    container.style.flex = ratio + ' 1 0%';
    image.classList.add('js-gallery-processed');
  });
};
exports.default = _default;

},{"../app/document-query-selector-all":13,"@babel/runtime/helpers/interopRequireDefault":1}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = el => {
  const $header = document.querySelector(el);
  if (!$header) return;
  const $search = document.querySelector('.js-search');
  let prevScrollpos = window.pageYOffset;
  window.onscroll = function () {
    const currentScrollPos = window.pageYOffset;
    if (prevScrollpos > currentScrollPos) {
      $header.classList.remove('-top-18');
      $search.classList.add('mt-16');
    } else {
      $header.classList.add('-top-18');
      $search.classList.remove('mt-16');
    }
    prevScrollpos = currentScrollPos;
  };
};
exports.default = _default;

},{}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = (root = document) => {
  /* Iframe SRC video */
  const selectors = ['iframe[src*="player.vimeo.com"]', 'iframe[src*="dailymotion.com"]', 'iframe[src*="youtube.com"]', 'iframe[src*="youtube-nocookie.com"]', 'iframe[src*="player.twitch.tv"]', 'iframe[src*="kickstarter.com"][src*="video.html"]'];

  // Use root.querySelectorAll to scope the search
  const iframes = root.querySelectorAll(selectors.join(','));
  if (!iframes.length) return;
  iframes.forEach(el => {
    // Check if already processed
    if (el.parentNode.classList.contains('video-responsive')) return;
    const parentForVideo = document.createElement('div');
    parentForVideo.className = 'video-responsive';
    el.parentNode.insertBefore(parentForVideo, el);
    parentForVideo.appendChild(el);
    el.removeAttribute('height');
    el.removeAttribute('width');
  });
};
exports.default = _default;

},{}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Matomo Analytics & Engagement Manager
 * Handles SPA-like page transitions and scoped scroll tracking.
 */
class AnalyticsManager {
  constructor() {
    this.currentPath = window.location.pathname;
    this.observers = new Map();
  }

  // Track a new virtual page view (Issue #1)
  trackPageView(url, title, previousUrl) {
    console.debug('[AnalyticsManager] trackPageView called', {
      url,
      title,
      previousUrl
    });
    if (!window._paq) {
      console.warn('[AnalyticsManager] window._paq is not available; skipping Matomo calls');
      this.currentPath = url;
      return;
    }
    this.currentPath = url;
    try {
      window._paq.push(['setReferrerUrl', previousUrl]);
      window._paq.push(['setCustomUrl', url]);
      window._paq.push(['setDocumentTitle', title]);
      window._paq.push(['setGenerationTimeMs', 0]);
      window._paq.push(['trackPageView']);
      window._paq.push(['enableLinkTracking']);
      window._paq.push(['MediaAnalytics::scanForMedia']);
      console.info('[AnalyticsManager] Matomo trackPageView pushed', {
        url,
        title
      });
    } catch (err) {
      console.error('[AnalyticsManager] error pushing to _paq', err);
    }
  }

  // Observe an article for "Read" status (Issue #2, #3)
  observeArticle(articleElement, title) {
    console.debug('[AnalyticsManager] observeArticle called', {
      title
    });
    if (!articleElement) return;
    let hasRead = false;
    let timeStarted = 0;
    const READ_THRESHOLD_PERCENT = 0.5;
    const READ_TIME_MS = 10000;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= READ_THRESHOLD_PERCENT) {
          if (!timeStarted) timeStarted = Date.now();
          const dwellTime = Date.now() - timeStarted;
          if (dwellTime > READ_TIME_MS && !hasRead) {
            this.triggerReadEvent(title);
            hasRead = true;
            observer.unobserve(articleElement);
          }
        } else {
          timeStarted = 0;
        }
      });
    }, {
      threshold: [0, 0.25, 0.5, 0.75, 1]
    });
    observer.observe(articleElement);
    this.observers.set(articleElement, observer);
    console.debug('[AnalyticsManager] IntersectionObserver attached for article', {
      title
    });
  }
  triggerReadEvent(title) {
    if (window._paq) {
      window._paq.push(['trackEvent', 'Article', 'Read', title]);
    }
    console.log(`[Analytics] Marked as read: ${title}`);
  }
  cleanup() {
    this.observers.forEach(obs => obs.disconnect());
    this.observers.clear();
  }
}
exports.default = AnalyticsManager;

},{}],23:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
require("lazysizes");
var _socialMedia = _interopRequireDefault(require("./app/social-media"));
var _darkMode = _interopRequireDefault(require("./app/dark-mode"));
var _headerTransparency = _interopRequireDefault(require("./app/header-transparency"));
var _loadScript = _interopRequireDefault(require("./components/load-script"));
var _scrollHideHeader = _interopRequireDefault(require("./components/scroll-hide-header"));
var _promoPopup = _interopRequireDefault(require("./components/promo-popup"));
var _postInfinite = _interopRequireDefault(require("./post-infinite"));
/* global followSocialMedia siteSearch */

// lib

const M4Setup = () => {
  console.debug('[main] M4Setup starting');
  /**
   * Links to social media
   *
   * @param  {Object[name, url, title]} followSocialMedia -  This variable will come from the ghost dashboard
   * @param  {Element} '.js-social-media' - All elements containing this class will be selected and the social media links will be appended.
   */
  if (typeof followSocialMedia === 'object' && followSocialMedia !== null) {
    (0, _socialMedia.default)(followSocialMedia, '.js-social-media');
  }

  /**
   * Dark Mode
   * @param  {Element} '.js-dark-mode' - Class name of all buttons for changing the dark mode
   */
  (0, _darkMode.default)('.js-dark-mode');

  /**
   * Header - Add and remove transparency when the header is larger than 64px
   * and the page contains the cover.
   *
   * @param  {Element} '.has-cover' - The class will be in the body indicating that it is enabled to add transparency.
   * @param  {className} 'is-head-transparent' - Add this class to the body to make it transparent.
   */
  (0, _headerTransparency.default)('.has-cover', 'is-head-transparent');

  /* Toggle Mobile Menu
  /* ---------------------------------------------------------- */
  document.querySelector('.js-menu-open').addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector('.js-search').classList.add('hidden');
    document.body.classList.add('has-menu');
  });
  document.querySelector('.js-menu-close').addEventListener('click', function (e) {
    e.preventDefault();
    document.body.classList.remove('has-menu');
  });

  /**
   * Search - Load the lazy search Script
   * @param  {String} siteSearch - assets/scripts/search.js
   */
  if (typeof searchSettings !== 'undefined' && typeof siteSearch !== 'undefined') {
    (0, _loadScript.default)(siteSearch);
  }

  /**
   * header hide when scrolling down and show when scrolling up
   * @param  {Element} '.js-hide-header' - Header class
   */
  (0, _scrollHideHeader.default)('.js-hide-header');

  /**
   * Promo Popup
   * @param {String} selector - The container ID
   * @param {Number} delay - Delay in ms before showing
   */
  (0, _promoPopup.default)('#js-promo-popup', 2000);

  // Initialize infinite scroll orchestration if present
  if (document.querySelector('.js-infinite-container')) {
    console.info('[main] .js-infinite-container detected — initializing postInfinite');
    (0, _postInfinite.default)();
  } else {
    console.debug('[main] .js-infinite-container not found — skipping postInfinite');
  }

  // End M4Setup
};
document.addEventListener('DOMContentLoaded', M4Setup);

},{"./app/dark-mode":12,"./app/header-transparency":14,"./app/social-media":15,"./components/load-script":17,"./components/promo-popup":18,"./components/scroll-hide-header":20,"./post-infinite":24,"@babel/runtime/helpers/interopRequireDefault":1,"lazysizes":11}],24:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initInfiniteScroll;
var _infiniteScroll = _interopRequireDefault(require("infinite-scroll"));
var _analytics = _interopRequireDefault(require("./lib/analytics"));
var _videoResponsive = _interopRequireDefault(require("./components/video-responsive"));
var _resizeImagesGalleries = _interopRequireDefault(require("./components/resize-images-galleries"));
var _highlightPrismjs = _interopRequireDefault(require("./components/highlight-prismjs"));
function initInfiniteScroll() {
  const container = document.querySelector('.js-infinite-container');
  const nextLink = document.querySelector('.js-next-post-link');
  console.debug('[post-infinite] init check - container:', container);
  console.debug('[post-infinite] init check - nextLink:', nextLink);

  // If we don't have a container or a next link, stop.
  // This acts as the check for "Is this a single post page?"
  if (!container || !nextLink) {
    console.info('[post-infinite] aborted: missing container or next link');
    return;
  }
  const analytics = new _analytics.default();
  console.debug('[post-infinite] AnalyticsManager instantiated');

  // Observe the initial article
  const initialArticle = container.querySelector('.js-post-article');
  console.debug('[post-infinite] initialArticle:', initialArticle);
  if (initialArticle) {
    analytics.observeArticle(initialArticle, document.title);
    console.info('[post-infinite] observing initial article for Read metric', {
      title: document.title
    });
  }

  // Prefetch NEXT article
  if (nextLink && nextLink.href) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = nextLink.href;
    document.head.appendChild(link);
    console.debug('[post-infinite] prefetching next article', nextLink.href);
  }
  const infScroll = new _infiniteScroll.default(container, {
    path: '.js-next-post-link',
    append: '.js-post-article',
    history: 'push',
    historyTitle: true,
    scrollThreshold: 400,
    hideNav: '.pagination-fallback'
  });
  console.info('[post-infinite] InfiniteScroll initialized');
  infScroll.on('append', (response, path, items) => {
    console.debug('[post-infinite] append event fired', {
      path,
      itemsCount: items && items.length
    });
    const newArticle = items && items[0];
    if (!newArticle) {
      console.warn('[post-infinite] append event: no article found in items');
      return;
    }
    const newTitle = newArticle.dataset && newArticle.dataset.title;
    const newUrl = newArticle.dataset && newArticle.dataset.url;
    const prevUrl = window.location.pathname;
    console.info('[post-infinite] new article appended', {
      title: newTitle,
      url: newUrl,
      prevUrl
    });

    // Re-init scoped behaviors
    try {
      (0, _videoResponsive.default)(newArticle);
      console.debug('[post-infinite] videoResponsive ran');
    } catch (e) {
      console.error('[post-infinite] videoResponsive error', e);
    }
    try {
      (0, _resizeImagesGalleries.default)(newArticle);
      console.debug('[post-infinite] resizeImagesInGalleries ran');
    } catch (e) {
      console.error('[post-infinite] resizeImagesInGalleries error', e);
    }
    try {
      (0, _highlightPrismjs.default)(newArticle);
      console.debug('[post-infinite] highlightPrism ran');
    } catch (e) {
      console.error('[post-infinite] highlightPrism error', e);
    }

    // Analytics
    try {
      analytics.trackPageView(newUrl, newTitle, prevUrl);
      console.debug('[post-infinite] analytics.trackPageView called');
    } catch (e) {
      console.error('[post-infinite] analytics.trackPageView error', e);
    }
    try {
      analytics.observeArticle(newArticle, newTitle);
      console.debug('[post-infinite] analytics.observeArticle called');
    } catch (e) {
      console.error('[post-infinite] analytics.observeArticle error', e);
    }

    // Chain prefetching
    const nextNextLink = newArticle.querySelector('.js-next-post-data');
    if (nextNextLink && nextNextLink.dataset && nextNextLink.dataset.url) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = nextNextLink.dataset.url;
      document.head.appendChild(link);
      console.debug('[post-infinite] prefetching next-next article', link.href);
    } else {
      console.debug('[post-infinite] no next-next link found in appended article');
    }
  });
  window.addEventListener('popstate', () => {
    console.info('[post-infinite] popstate event');
  });
  return infScroll;
}

},{"./components/highlight-prismjs":16,"./components/resize-images-galleries":19,"./components/video-responsive":21,"./lib/analytics":22,"@babel/runtime/helpers/interopRequireDefault":1,"infinite-scroll":7}]},{},[23])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHQuanMiLCJub2RlX21vZHVsZXMvZXYtZW1pdHRlci9ldi1lbWl0dGVyLmpzIiwibm9kZV9tb2R1bGVzL2Zpenp5LXVpLXV0aWxzL3V0aWxzLmpzIiwibm9kZV9tb2R1bGVzL2luZmluaXRlLXNjcm9sbC9qcy9idXR0b24uanMiLCJub2RlX21vZHVsZXMvaW5maW5pdGUtc2Nyb2xsL2pzL2NvcmUuanMiLCJub2RlX21vZHVsZXMvaW5maW5pdGUtc2Nyb2xsL2pzL2hpc3RvcnkuanMiLCJub2RlX21vZHVsZXMvaW5maW5pdGUtc2Nyb2xsL2pzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2luZmluaXRlLXNjcm9sbC9qcy9wYWdlLWxvYWQuanMiLCJub2RlX21vZHVsZXMvaW5maW5pdGUtc2Nyb2xsL2pzL3Njcm9sbC13YXRjaC5qcyIsIm5vZGVfbW9kdWxlcy9pbmZpbml0ZS1zY3JvbGwvanMvc3RhdHVzLmpzIiwibm9kZV9tb2R1bGVzL2xhenlzaXplcy9sYXp5c2l6ZXMuanMiLCJzcmMvanMvYXBwL2RhcmstbW9kZS5qcyIsInNyYy9qcy9hcHAvZG9jdW1lbnQtcXVlcnktc2VsZWN0b3ItYWxsLmpzIiwic3JjL2pzL2FwcC9oZWFkZXItdHJhbnNwYXJlbmN5LmpzIiwic3JjL2pzL2FwcC9zb2NpYWwtbWVkaWEuanMiLCJzcmMvanMvY29tcG9uZW50cy9oaWdobGlnaHQtcHJpc21qcy5qcyIsInNyYy9qcy9jb21wb25lbnRzL2xvYWQtc2NyaXB0LmpzIiwic3JjL2pzL2NvbXBvbmVudHMvcHJvbW8tcG9wdXAuanMiLCJzcmMvanMvY29tcG9uZW50cy9yZXNpemUtaW1hZ2VzLWdhbGxlcmllcy5qcyIsInNyYy9qcy9jb21wb25lbnRzL3Njcm9sbC1oaWRlLWhlYWRlci5qcyIsInNyYy9qcy9jb21wb25lbnRzL3ZpZGVvLXJlc3BvbnNpdmUuanMiLCJzcmMvanMvbGliL2FuYWx5dGljcy5qcyIsInNyYy9qcy9tYWluLmpzIiwic3JjL2pzL3Bvc3QtaW5maW5pdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7QUM3eUJBLElBQUEseUJBQUEsR0FBQSxzQkFBQSxDQUFBLE9BQUE7QUFEQTtBQUFBLElBQUEsUUFBQSxHQUdlLEVBQUUsSUFBSTtFQUNuQixNQUFNLFlBQVksR0FBRyxJQUFBLGlDQUFjLEVBQUMsRUFBRSxDQUFDO0VBRXZDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFO0VBRTFCLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxlQUFlO0VBRXZDLFlBQVksQ0FBQyxPQUFPLENB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Q0FBQyw2REFBNkQsQ0FBQztJQUM5RTtFQUNGLENBQUMsQ0FBQztFQUVGLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsTUFBTTtJQUN4QyxPQUFPLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxDQUFDO0VBQ2hELENBQUMsQ0FBQztFQUVGLE9BQU8sU0FBUztBQUNsQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoZSkge1xuICByZXR1cm4gZSAmJiBlLl9fZXNNb2R1bGUgPyBlIDoge1xuICAgIFwiZGVmYXVsdFwiOiBlXG4gIH07XG59XG5tb2R1bGUuZXhwb3J0cyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlLCBtb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0czsiLCIvKipcbiAqIEV2RW1pdHRlciB2Mi4xLjFcbiAqIExpbCcgZXZlbnQgZW1pdHRlclxuICogTUlUIExpY2Vuc2VcbiAqL1xuXG4oIGZ1bmN0aW9uKCBnbG9iYWwsIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlMgLSBCcm93c2VyaWZ5LCBXZWJwYWNrXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgZ2xvYmFsLkV2RW1pdHRlciA9IGZhY3RvcnkoKTtcbiAgfVxuXG59KCB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcywgZnVuY3Rpb24oKSB7XG5cbmZ1bmN0aW9uIEV2RW1pdHRlcigpIHt9XG5cbmxldCBwcm90byA9IEV2RW1pdHRlci5wcm90b3R5cGU7XG5cbnByb3RvLm9uID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKSB7XG4gIGlmICggIWV2ZW50TmFtZSB8fCAhbGlzdGVuZXIgKSByZXR1cm4gdGhpcztcblxuICAvLyBzZXQgZXZlbnRzIGhhc2hcbiAgbGV0IGV2ZW50cyA9IHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgLy8gc2V0IGxpc3RlbmVycyBhcnJheVxuICBsZXQgbGlzdGVuZXJzID0gZXZlbnRzWyBldmVudE5hbWUgXSA9IGV2ZW50c1sgZXZlbnROYW1lIF0gfHwgW107XG4gIC8vIG9ubHkgYWRkIG9uY2VcbiAgaWYgKCAhbGlzdGVuZXJzLmluY2x1ZGVzKCBsaXN0ZW5lciApICkge1xuICAgIGxpc3RlbmVycy5wdXNoKCBsaXN0ZW5lciApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5vbmNlID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKSB7XG4gIGlmICggIWV2ZW50TmFtZSB8fCAhbGlzdGVuZXIgKSByZXR1cm4gdGhpcztcblxuICAvLyBhZGQgZXZlbnRcbiAgdGhpcy5vbiggZXZlbnROYW1lLCBsaXN0ZW5lciApO1xuICAvLyBzZXQgb25jZSBmbGFnXG4gIC8vIHNldCBvbmNlRXZlbnRzIGhhc2hcbiAgbGV0IG9uY2VFdmVudHMgPSB0aGlzLl9vbmNlRXZlbnRzID0gdGhpcy5fb25jZUV2ZW50cyB8fCB7fTtcbiAgLy8gc2V0IG9uY2VMaXN0ZW5lcnMgb2JqZWN0XG4gIGxldCBvbmNlTGlzdGVuZXJzID0gb25jZUV2ZW50c1sgZXZlbnROYW1lIF0gPSBvbmNlRXZlbnRzWyBldmVudE5hbWUgXSB8fCB7fTtcbiAgLy8gc2V0IGZsYWdcbiAgb25jZUxpc3RlbmVyc1sgbGlzdGVuZXIgXSA9IHRydWU7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5vZmYgPSBmdW5jdGlvbiggZXZlbnROYW1lLCBsaXN0ZW5lciApIHtcbiAgbGV0IGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbIGV2ZW50TmFtZSBdO1xuICBpZiAoICFsaXN0ZW5lcnMgfHwgIWxpc3RlbmVycy5sZW5ndGggKSByZXR1cm4gdGhpcztcblxuICBsZXQgaW5kZXggPSBsaXN0ZW5lcnMuaW5kZXhPZiggbGlzdGVuZXIgKTtcbiAgaWYgKCBpbmRleCAhPSAtMSApIHtcbiAgICBsaXN0ZW5lcnMuc3BsaWNlKCBpbmRleCwgMSApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5lbWl0RXZlbnQgPSBmdW5jdGlvbiggZXZlbnROYW1lLCBhcmdzICkge1xuICBsZXQgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1sgZXZlbnROYW1lIF07XG4gIGlmICggIWxpc3RlbmVycyB8fCAhbGlzdGVuZXJzLmxlbmd0aCApIHJldHVybiB0aGlzO1xuXG4gIC8vIGNvcHkgb3ZlciB0byBhdm9pZCBpbnRlcmZlcmVuY2UgaWYgLm9mZigpIGluIGxpc3RlbmVyXG4gIGxpc3RlbmVycyA9IGxpc3RlbmVycy5zbGljZSggMCApO1xuICBhcmdzID0gYXJncyB8fCBbXTtcbiAgLy8gb25jZSBzdHVmZlxuICBsZXQgb25jZUxpc3RlbmVycyA9IHRoaXMuX29uY2VFdmVudHMgJiYgdGhpcy5fb25jZUV2ZW50c1sgZXZlbnROYW1lIF07XG5cbiAgZm9yICggbGV0IGxpc3RlbmVyIG9mIGxpc3RlbmVycyApIHtcbiAgICBsZXQgaXNPbmNlID0gb25jZUxpc3RlbmVycyAmJiBvbmNlTGlzdGVuZXJzWyBsaXN0ZW5lciBdO1xuICAgIGlmICggaXNPbmNlICkge1xuICAgICAgLy8gcmVtb3ZlIGxpc3RlbmVyXG4gICAgICAvLyByZW1vdmUgYmVmb3JlIHRyaWdnZXIgdG8gcHJldmVudCByZWN1cnNpb25cbiAgICAgIHRoaXMub2ZmKCBldmVudE5hbWUsIGxpc3RlbmVyICk7XG4gICAgICAvLyB1bnNldCBvbmNlIGZsYWdcbiAgICAgIGRlbGV0ZSBvbmNlTGlzdGVuZXJzWyBsaXN0ZW5lciBdO1xuICAgIH1cbiAgICAvLyB0cmlnZ2VyIGxpc3RlbmVyXG4gICAgbGlzdGVuZXIuYXBwbHkoIHRoaXMsIGFyZ3MgKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8uYWxsT2ZmID0gZnVuY3Rpb24oKSB7XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHM7XG4gIGRlbGV0ZSB0aGlzLl9vbmNlRXZlbnRzO1xuICByZXR1cm4gdGhpcztcbn07XG5cbnJldHVybiBFdkVtaXR0ZXI7XG5cbn0gKSApO1xuIiwiLyoqXG4gKiBGaXp6eSBVSSB1dGlscyB2My4wLjBcbiAqIE1JVCBsaWNlbnNlXG4gKi9cblxuKCBmdW5jdGlvbiggZ2xvYmFsLCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCBnbG9iYWwgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIGdsb2JhbC5maXp6eVVJVXRpbHMgPSBmYWN0b3J5KCBnbG9iYWwgKTtcbiAgfVxuXG59KCB0aGlzLCBmdW5jdGlvbiBmYWN0b3J5KCBnbG9iYWwgKSB7XG5cbmxldCB1dGlscyA9IHt9O1xuXG4vLyAtLS0tLSBleHRlbmQgLS0tLS0gLy9cblxuLy8gZXh0ZW5kcyBvYmplY3RzXG51dGlscy5leHRlbmQgPSBmdW5jdGlvbiggYSwgYiApIHtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oIGEsIGIgKTtcbn07XG5cbi8vIC0tLS0tIG1vZHVsbyAtLS0tLSAvL1xuXG51dGlscy5tb2R1bG8gPSBmdW5jdGlvbiggbnVtLCBkaXYgKSB7XG4gIHJldHVybiAoICggbnVtICUgZGl2ICkgKyBkaXYgKSAlIGRpdjtcbn07XG5cbi8vIC0tLS0tIG1ha2VBcnJheSAtLS0tLSAvL1xuXG4vLyB0dXJuIGVsZW1lbnQgb3Igbm9kZUxpc3QgaW50byBhbiBhcnJheVxudXRpbHMubWFrZUFycmF5ID0gZnVuY3Rpb24oIG9iaiApIHtcbiAgLy8gdXNlIG9iamVjdCBpZiBhbHJlYWR5IGFuIGFycmF5XG4gIGlmICggQXJyYXkuaXNBcnJheSggb2JqICkgKSByZXR1cm4gb2JqO1xuXG4gIC8vIHJldHVybiBlbXB0eSBhcnJheSBpZiB1bmRlZmluZWQgb3IgbnVsbC4gIzZcbiAgaWYgKCBvYmogPT09IG51bGwgfHwgb2JqID09PSB1bmRlZmluZWQgKSByZXR1cm4gW107XG5cbiAgbGV0IGlzQXJyYXlMaWtlID0gdHlwZW9mIG9iaiA9PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb2JqLmxlbmd0aCA9PSAnbnVtYmVyJztcbiAgLy8gY29udmVydCBub2RlTGlzdCB0byBhcnJheVxuICBpZiAoIGlzQXJyYXlMaWtlICkgcmV0dXJuIFsgLi4ub2JqIF07XG5cbiAgLy8gYXJyYXkgb2Ygc2luZ2xlIGluZGV4XG4gIHJldHVybiBbIG9iaiBdO1xufTtcblxuLy8gLS0tLS0gcmVtb3ZlRnJvbSAtLS0tLSAvL1xuXG51dGlscy5yZW1vdmVGcm9tID0gZnVuY3Rpb24oIGFyeSwgb2JqICkge1xuICBsZXQgaW5kZXggPSBhcnkuaW5kZXhPZiggb2JqICk7XG4gIGlmICggaW5kZXggIT0gLTEgKSB7XG4gICAgYXJ5LnNwbGljZSggaW5kZXgsIDEgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0gZ2V0UGFyZW50IC0tLS0tIC8vXG5cbnV0aWxzLmdldFBhcmVudCA9IGZ1bmN0aW9uKCBlbGVtLCBzZWxlY3RvciApIHtcbiAgd2hpbGUgKCBlbGVtLnBhcmVudE5vZGUgJiYgZWxlbSAhPSBkb2N1bWVudC5ib2R5ICkge1xuICAgIGVsZW0gPSBlbGVtLnBhcmVudE5vZGU7XG4gICAgaWYgKCBlbGVtLm1hdGNoZXMoIHNlbGVjdG9yICkgKSByZXR1cm4gZWxlbTtcbiAgfVxufTtcblxuLy8gLS0tLS0gZ2V0UXVlcnlFbGVtZW50IC0tLS0tIC8vXG5cbi8vIHVzZSBlbGVtZW50IGFzIHNlbGVjdG9yIHN0cmluZ1xudXRpbHMuZ2V0UXVlcnlFbGVtZW50ID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIGlmICggdHlwZW9mIGVsZW0gPT0gJ3N0cmluZycgKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIGVsZW0gKTtcbiAgfVxuICByZXR1cm4gZWxlbTtcbn07XG5cbi8vIC0tLS0tIGhhbmRsZUV2ZW50IC0tLS0tIC8vXG5cbi8vIGVuYWJsZSAub250eXBlIHRvIHRyaWdnZXIgZnJvbSAuYWRkRXZlbnRMaXN0ZW5lciggZWxlbSwgJ3R5cGUnIClcbnV0aWxzLmhhbmRsZUV2ZW50ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICBsZXQgbWV0aG9kID0gJ29uJyArIGV2ZW50LnR5cGU7XG4gIGlmICggdGhpc1sgbWV0aG9kIF0gKSB7XG4gICAgdGhpc1sgbWV0aG9kIF0oIGV2ZW50ICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIGZpbHRlckZpbmRFbGVtZW50cyAtLS0tLSAvL1xuXG51dGlscy5maWx0ZXJGaW5kRWxlbWVudHMgPSBmdW5jdGlvbiggZWxlbXMsIHNlbGVjdG9yICkge1xuICAvLyBtYWtlIGFycmF5IG9mIGVsZW1zXG4gIGVsZW1zID0gdXRpbHMubWFrZUFycmF5KCBlbGVtcyApO1xuXG4gIHJldHVybiBlbGVtc1xuICAgIC8vIGNoZWNrIHRoYXQgZWxlbSBpcyBhbiBhY3R1YWwgZWxlbWVudFxuICAgIC5maWx0ZXIoICggZWxlbSApID0+IGVsZW0gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCApXG4gICAgLnJlZHVjZSggKCBmZkVsZW1zLCBlbGVtICkgPT4ge1xuICAgICAgLy8gYWRkIGVsZW0gaWYgbm8gc2VsZWN0b3JcbiAgICAgIGlmICggIXNlbGVjdG9yICkge1xuICAgICAgICBmZkVsZW1zLnB1c2goIGVsZW0gKTtcbiAgICAgICAgcmV0dXJuIGZmRWxlbXM7XG4gICAgICB9XG4gICAgICAvLyBmaWx0ZXIgJiBmaW5kIGl0ZW1zIGlmIHdlIGhhdmUgYSBzZWxlY3RvclxuICAgICAgLy8gZmlsdGVyXG4gICAgICBpZiAoIGVsZW0ubWF0Y2hlcyggc2VsZWN0b3IgKSApIHtcbiAgICAgICAgZmZFbGVtcy5wdXNoKCBlbGVtICk7XG4gICAgICB9XG4gICAgICAvLyBmaW5kIGNoaWxkcmVuXG4gICAgICBsZXQgY2hpbGRFbGVtcyA9IGVsZW0ucXVlcnlTZWxlY3RvckFsbCggc2VsZWN0b3IgKTtcbiAgICAgIC8vIGNvbmNhdCBjaGlsZEVsZW1zIHRvIGZpbHRlckZvdW5kIGFycmF5XG4gICAgICBmZkVsZW1zID0gZmZFbGVtcy5jb25jYXQoIC4uLmNoaWxkRWxlbXMgKTtcbiAgICAgIHJldHVybiBmZkVsZW1zO1xuICAgIH0sIFtdICk7XG59O1xuXG4vLyAtLS0tLSBkZWJvdW5jZU1ldGhvZCAtLS0tLSAvL1xuXG51dGlscy5kZWJvdW5jZU1ldGhvZCA9IGZ1bmN0aW9uKCBfY2xhc3MsIG1ldGhvZE5hbWUsIHRocmVzaG9sZCApIHtcbiAgdGhyZXNob2xkID0gdGhyZXNob2xkIHx8IDEwMDtcbiAgLy8gb3JpZ2luYWwgbWV0aG9kXG4gIGxldCBtZXRob2QgPSBfY2xhc3MucHJvdG90eXBlWyBtZXRob2ROYW1lIF07XG4gIGxldCB0aW1lb3V0TmFtZSA9IG1ldGhvZE5hbWUgKyAnVGltZW91dCc7XG5cbiAgX2NsYXNzLnByb3RvdHlwZVsgbWV0aG9kTmFtZSBdID0gZnVuY3Rpb24oKSB7XG4gICAgY2xlYXJUaW1lb3V0KCB0aGlzWyB0aW1lb3V0TmFtZSBdICk7XG5cbiAgICBsZXQgYXJncyA9IGFyZ3VtZW50cztcbiAgICB0aGlzWyB0aW1lb3V0TmFtZSBdID0gc2V0VGltZW91dCggKCkgPT4ge1xuICAgICAgbWV0aG9kLmFwcGx5KCB0aGlzLCBhcmdzICk7XG4gICAgICBkZWxldGUgdGhpc1sgdGltZW91dE5hbWUgXTtcbiAgICB9LCB0aHJlc2hvbGQgKTtcbiAgfTtcbn07XG5cbi8vIC0tLS0tIGRvY1JlYWR5IC0tLS0tIC8vXG5cbnV0aWxzLmRvY1JlYWR5ID0gZnVuY3Rpb24oIG9uRG9jUmVhZHkgKSB7XG4gIGxldCByZWFkeVN0YXRlID0gZG9jdW1lbnQucmVhZHlTdGF0ZTtcbiAgaWYgKCByZWFkeVN0YXRlID09ICdjb21wbGV0ZScgfHwgcmVhZHlTdGF0ZSA9PSAnaW50ZXJhY3RpdmUnICkge1xuICAgIC8vIGRvIGFzeW5jIHRvIGFsbG93IGZvciBvdGhlciBzY3JpcHRzIHRvIHJ1bi4gbWV0YWZpenp5L2ZsaWNraXR5IzQ0MVxuICAgIHNldFRpbWVvdXQoIG9uRG9jUmVhZHkgKTtcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnRE9NQ29udGVudExvYWRlZCcsIG9uRG9jUmVhZHkgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0gaHRtbEluaXQgLS0tLS0gLy9cblxuLy8gaHR0cDovL2JpdC5seS8zb1lMdXNjXG51dGlscy50b0Rhc2hlZCA9IGZ1bmN0aW9uKCBzdHIgKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSggLyguKShbQS1aXSkvZywgZnVuY3Rpb24oIG1hdGNoLCAkMSwgJDIgKSB7XG4gICAgcmV0dXJuICQxICsgJy0nICsgJDI7XG4gIH0gKS50b0xvd2VyQ2FzZSgpO1xufTtcblxubGV0IGNvbnNvbGUgPSBnbG9iYWwuY29uc29sZTtcblxuLy8gYWxsb3cgdXNlciB0byBpbml0aWFsaXplIGNsYXNzZXMgdmlhIFtkYXRhLW5hbWVzcGFjZV0gb3IgLmpzLW5hbWVzcGFjZSBjbGFzc1xuLy8gaHRtbEluaXQoIFdpZGdldCwgJ3dpZGdldE5hbWUnIClcbi8vIG9wdGlvbnMgYXJlIHBhcnNlZCBmcm9tIGRhdGEtbmFtZXNwYWNlLW9wdGlvbnNcbnV0aWxzLmh0bWxJbml0ID0gZnVuY3Rpb24oIFdpZGdldENsYXNzLCBuYW1lc3BhY2UgKSB7XG4gIHV0aWxzLmRvY1JlYWR5KCBmdW5jdGlvbigpIHtcbiAgICBsZXQgZGFzaGVkTmFtZXNwYWNlID0gdXRpbHMudG9EYXNoZWQoIG5hbWVzcGFjZSApO1xuICAgIGxldCBkYXRhQXR0ciA9ICdkYXRhLScgKyBkYXNoZWROYW1lc3BhY2U7XG4gICAgbGV0IGRhdGFBdHRyRWxlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCBgWyR7ZGF0YUF0dHJ9XWAgKTtcbiAgICBsZXQgalF1ZXJ5ID0gZ2xvYmFsLmpRdWVyeTtcblxuICAgIFsgLi4uZGF0YUF0dHJFbGVtcyBdLmZvckVhY2goICggZWxlbSApID0+IHtcbiAgICAgIGxldCBhdHRyID0gZWxlbS5nZXRBdHRyaWJ1dGUoIGRhdGFBdHRyICk7XG4gICAgICBsZXQgb3B0aW9ucztcbiAgICAgIHRyeSB7XG4gICAgICAgIG9wdGlvbnMgPSBhdHRyICYmIEpTT04ucGFyc2UoIGF0dHIgKTtcbiAgICAgIH0gY2F0Y2ggKCBlcnJvciApIHtcbiAgICAgICAgLy8gbG9nIGVycm9yLCBkbyBub3QgaW5pdGlhbGl6ZVxuICAgICAgICBpZiAoIGNvbnNvbGUgKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvciggYEVycm9yIHBhcnNpbmcgJHtkYXRhQXR0cn0gb24gJHtlbGVtLmNsYXNzTmFtZX06ICR7ZXJyb3J9YCApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIGluaXRpYWxpemVcbiAgICAgIGxldCBpbnN0YW5jZSA9IG5ldyBXaWRnZXRDbGFzcyggZWxlbSwgb3B0aW9ucyApO1xuICAgICAgLy8gbWFrZSBhdmFpbGFibGUgdmlhICQoKS5kYXRhKCduYW1lc3BhY2UnKVxuICAgICAgaWYgKCBqUXVlcnkgKSB7XG4gICAgICAgIGpRdWVyeS5kYXRhKCBlbGVtLCBuYW1lc3BhY2UsIGluc3RhbmNlICk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gIH0gKTtcbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5yZXR1cm4gdXRpbHM7XG5cbn0gKSApO1xuIiwiLy8gYnV0dG9uXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgcmVxdWlyZSgnLi9jb3JlJyksXG4gICAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJyksXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgd2luZG93LkluZmluaXRlU2Nyb2xsLFxuICAgICAgICB3aW5kb3cuZml6enlVSVV0aWxzLFxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEluZmluaXRlU2Nyb2xsLCB1dGlscyApIHtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gSW5maW5pdGVTY3JvbGxCdXR0b24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuY2xhc3MgSW5maW5pdGVTY3JvbGxCdXR0b24ge1xuICBjb25zdHJ1Y3RvciggZWxlbWVudCwgaW5mU2Nyb2xsICkge1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5pbmZTY3JvbGwgPSBpbmZTY3JvbGw7XG4gICAgLy8gZXZlbnRzXG4gICAgdGhpcy5jbGlja0hhbmRsZXIgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCB0aGlzLmNsaWNrSGFuZGxlciApO1xuICAgIGluZlNjcm9sbC5vbiggJ3JlcXVlc3QnLCB0aGlzLmRpc2FibGUuYmluZCggdGhpcyApICk7XG4gICAgaW5mU2Nyb2xsLm9uKCAnbG9hZCcsIHRoaXMuZW5hYmxlLmJpbmQoIHRoaXMgKSApO1xuICAgIGluZlNjcm9sbC5vbiggJ2Vycm9yJywgdGhpcy5oaWRlLmJpbmQoIHRoaXMgKSApO1xuICAgIGluZlNjcm9sbC5vbiggJ2xhc3QnLCB0aGlzLmhpZGUuYmluZCggdGhpcyApICk7XG4gIH1cblxuICBvbkNsaWNrKCBldmVudCApIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMuaW5mU2Nyb2xsLmxvYWROZXh0UGFnZSgpO1xuICB9XG5cbiAgZW5hYmxlKCkge1xuICAgIHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gIH1cblxuICBkaXNhYmxlKCkge1xuICAgIHRoaXMuZWxlbWVudC5kaXNhYmxlZCA9ICdkaXNhYmxlZCc7XG4gIH1cblxuICBoaWRlKCkge1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgdGhpcy5jbGlja0hhbmRsZXIgKTtcbiAgfVxuXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEluZmluaXRlU2Nyb2xsIG1ldGhvZHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gSW5maW5pdGVTY3JvbGwuZGVmYXVsdHMuYnV0dG9uID0gbnVsbDtcblxuSW5maW5pdGVTY3JvbGwuY3JlYXRlLmJ1dHRvbiA9IGZ1bmN0aW9uKCkge1xuICBsZXQgYnV0dG9uRWxlbSA9IHV0aWxzLmdldFF1ZXJ5RWxlbWVudCggdGhpcy5vcHRpb25zLmJ1dHRvbiApO1xuICBpZiAoIGJ1dHRvbkVsZW0gKSB7XG4gICAgdGhpcy5idXR0b24gPSBuZXcgSW5maW5pdGVTY3JvbGxCdXR0b24oIGJ1dHRvbkVsZW0sIHRoaXMgKTtcbiAgfVxufTtcblxuSW5maW5pdGVTY3JvbGwuZGVzdHJveS5idXR0b24gPSBmdW5jdGlvbigpIHtcbiAgaWYgKCB0aGlzLmJ1dHRvbiApIHRoaXMuYnV0dG9uLmRlc3Ryb3koKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5JbmZpbml0ZVNjcm9sbC5CdXR0b24gPSBJbmZpbml0ZVNjcm9sbEJ1dHRvbjtcblxucmV0dXJuIEluZmluaXRlU2Nyb2xsO1xuXG59ICkgKTtcbiIsIi8vIGNvcmVcbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICByZXF1aXJlKCdldi1lbWl0dGVyJyksXG4gICAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJyksXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5JbmZpbml0ZVNjcm9sbCA9IGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgd2luZG93LkV2RW1pdHRlcixcbiAgICAgICAgd2luZG93LmZpenp5VUlVdGlscyxcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggd2luZG93LCBFdkVtaXR0ZXIsIHV0aWxzICkge1xuXG5sZXQgalF1ZXJ5ID0gd2luZG93LmpRdWVyeTtcbi8vIGludGVybmFsIHN0b3JlIG9mIGFsbCBJbmZpbml0ZVNjcm9sbCBpbnRhbmNlc1xubGV0IGluc3RhbmNlcyA9IHt9O1xuXG5mdW5jdGlvbiBJbmZpbml0ZVNjcm9sbCggZWxlbWVudCwgb3B0aW9ucyApIHtcbiAgbGV0IHF1ZXJ5RWxlbSA9IHV0aWxzLmdldFF1ZXJ5RWxlbWVudCggZWxlbWVudCApO1xuXG4gIGlmICggIXF1ZXJ5RWxlbSApIHtcbiAgICBjb25zb2xlLmVycm9yKCAnQmFkIGVsZW1lbnQgZm9yIEluZmluaXRlU2Nyb2xsOiAnICsgKCBxdWVyeUVsZW0gfHwgZWxlbWVudCApICk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGVsZW1lbnQgPSBxdWVyeUVsZW07XG4gIC8vIGRvIG5vdCBpbml0aWFsaXplIHR3aWNlIG9uIHNhbWUgZWxlbWVudFxuICBpZiAoIGVsZW1lbnQuaW5maW5pdGVTY3JvbGxHVUlEICkge1xuICAgIGxldCBpbnN0YW5jZSA9IGluc3RhbmNlc1sgZWxlbWVudC5pbmZpbml0ZVNjcm9sbEdVSUQgXTtcbiAgICBpbnN0YW5jZS5vcHRpb24oIG9wdGlvbnMgKTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cblxuICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAvLyBvcHRpb25zXG4gIHRoaXMub3B0aW9ucyA9IHsgLi4uSW5maW5pdGVTY3JvbGwuZGVmYXVsdHMgfTtcbiAgdGhpcy5vcHRpb24oIG9wdGlvbnMgKTtcbiAgLy8gYWRkIGpRdWVyeVxuICBpZiAoIGpRdWVyeSApIHtcbiAgICB0aGlzLiRlbGVtZW50ID0galF1ZXJ5KCB0aGlzLmVsZW1lbnQgKTtcbiAgfVxuXG4gIHRoaXMuY3JlYXRlKCk7XG59XG5cbi8vIGRlZmF1bHRzXG5JbmZpbml0ZVNjcm9sbC5kZWZhdWx0cyA9IHtcbiAgLy8gcGF0aDogbnVsbCxcbiAgLy8gaGlkZU5hdjogbnVsbCxcbiAgLy8gZGVidWc6IGZhbHNlLFxufTtcblxuLy8gY3JlYXRlICYgZGVzdHJveSBtZXRob2RzXG5JbmZpbml0ZVNjcm9sbC5jcmVhdGUgPSB7fTtcbkluZmluaXRlU2Nyb2xsLmRlc3Ryb3kgPSB7fTtcblxubGV0IHByb3RvID0gSW5maW5pdGVTY3JvbGwucHJvdG90eXBlO1xuLy8gaW5oZXJpdCBFdkVtaXR0ZXJcbk9iamVjdC5hc3NpZ24oIHByb3RvLCBFdkVtaXR0ZXIucHJvdG90eXBlICk7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBnbG9iYWxseSB1bmlxdWUgaWRlbnRpZmllcnNcbmxldCBHVUlEID0gMDtcblxucHJvdG8uY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gIC8vIGNyZWF0ZSBjb3JlXG4gIC8vIGFkZCBpZCBmb3IgSW5maW5pdGVTY3JvbGwuZGF0YVxuICBsZXQgaWQgPSB0aGlzLmd1aWQgPSArK0dVSUQ7XG4gIHRoaXMuZWxlbWVudC5pbmZpbml0ZVNjcm9sbEdVSUQgPSBpZDsgLy8gZXhwYW5kb1xuICBpbnN0YW5jZXNbIGlkIF0gPSB0aGlzOyAvLyBhc3NvY2lhdGUgdmlhIGlkXG4gIC8vIHByb3BlcnRpZXNcbiAgdGhpcy5wYWdlSW5kZXggPSAxOyAvLyBkZWZhdWx0IHRvIGZpcnN0IHBhZ2VcbiAgdGhpcy5sb2FkQ291bnQgPSAwO1xuICB0aGlzLnVwZGF0ZUdldFBhdGgoKTtcbiAgLy8gYmFpbCBpZiBnZXRQYXRoIG5vdCBzZXQsIG9yIHJldHVybnMgZmFsc2V5ICM3NzZcbiAgbGV0IGhhc1BhdGggPSB0aGlzLmdldFBhdGggJiYgdGhpcy5nZXRQYXRoKCk7XG4gIGlmICggIWhhc1BhdGggKSB7XG4gICAgY29uc29sZS5lcnJvcignRGlzYWJsaW5nIEluZmluaXRlU2Nyb2xsJyk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMudXBkYXRlR2V0QWJzb2x1dGVQYXRoKCk7XG4gIHRoaXMubG9nKCAnaW5pdGlhbGl6ZWQnLCBbIHRoaXMuZWxlbWVudC5jbGFzc05hbWUgXSApO1xuICB0aGlzLmNhbGxPbkluaXQoKTtcbiAgLy8gY3JlYXRlIGZlYXR1cmVzXG4gIGZvciAoIGxldCBtZXRob2QgaW4gSW5maW5pdGVTY3JvbGwuY3JlYXRlICkge1xuICAgIEluZmluaXRlU2Nyb2xsLmNyZWF0ZVsgbWV0aG9kIF0uY2FsbCggdGhpcyApO1xuICB9XG59O1xuXG5wcm90by5vcHRpb24gPSBmdW5jdGlvbiggb3B0cyApIHtcbiAgT2JqZWN0LmFzc2lnbiggdGhpcy5vcHRpb25zLCBvcHRzICk7XG59O1xuXG4vLyBjYWxsIG9uSW5pdCBvcHRpb24sIHVzZWQgZm9yIGJpbmRpbmcgZXZlbnRzIG9uIGluaXRcbnByb3RvLmNhbGxPbkluaXQgPSBmdW5jdGlvbigpIHtcbiAgbGV0IG9uSW5pdCA9IHRoaXMub3B0aW9ucy5vbkluaXQ7XG4gIGlmICggb25Jbml0ICkge1xuICAgIG9uSW5pdC5jYWxsKCB0aGlzLCB0aGlzICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIGV2ZW50cyAtLS0tLSAvL1xuXG5wcm90by5kaXNwYXRjaEV2ZW50ID0gZnVuY3Rpb24oIHR5cGUsIGV2ZW50LCBhcmdzICkge1xuICB0aGlzLmxvZyggdHlwZSwgYXJncyApO1xuICBsZXQgZW1pdEFyZ3MgPSBldmVudCA/IFsgZXZlbnQgXS5jb25jYXQoIGFyZ3MgKSA6IGFyZ3M7XG4gIHRoaXMuZW1pdEV2ZW50KCB0eXBlLCBlbWl0QXJncyApO1xuICAvLyB0cmlnZ2VyIGpRdWVyeSBldmVudFxuICBpZiAoICFqUXVlcnkgfHwgIXRoaXMuJGVsZW1lbnQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIG5hbWVzcGFjZSBqUXVlcnkgZXZlbnRcbiAgdHlwZSArPSAnLmluZmluaXRlU2Nyb2xsJztcbiAgbGV0ICRldmVudCA9IHR5cGU7XG4gIGlmICggZXZlbnQgKSB7XG4gICAgLy8gY3JlYXRlIGpRdWVyeSBldmVudFxuICAgIC8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuZXctY2FwICovXG4gICAgbGV0IGpRRXZlbnQgPSBqUXVlcnkuRXZlbnQoIGV2ZW50ICk7XG4gICAgalFFdmVudC50eXBlID0gdHlwZTtcbiAgICAkZXZlbnQgPSBqUUV2ZW50O1xuICB9XG4gIHRoaXMuJGVsZW1lbnQudHJpZ2dlciggJGV2ZW50LCBhcmdzICk7XG59O1xuXG5sZXQgbG9nZ2VycyA9IHtcbiAgaW5pdGlhbGl6ZWQ6ICggY2xhc3NOYW1lICkgPT4gYG9uICR7Y2xhc3NOYW1lfWAsXG4gIHJlcXVlc3Q6ICggcGF0aCApID0+IGBVUkw6ICR7cGF0aH1gLFxuICBsb2FkOiAoIHJlc3BvbnNlLCBwYXRoICkgPT4gYCR7cmVzcG9uc2UudGl0bGUgfHwgJyd9LiBVUkw6ICR7cGF0aH1gLFxuICBlcnJvcjogKCBlcnJvciwgcGF0aCApID0+IGAke2Vycm9yfS4gVVJMOiAke3BhdGh9YCxcbiAgYXBwZW5kOiAoIHJlc3BvbnNlLCBwYXRoLCBpdGVtcyApID0+IGAke2l0ZW1zLmxlbmd0aH0gaXRlbXMuIFVSTDogJHtwYXRofWAsXG4gIGxhc3Q6ICggcmVzcG9uc2UsIHBhdGggKSA9PiBgVVJMOiAke3BhdGh9YCxcbiAgaGlzdG9yeTogKCB0aXRsZSwgcGF0aCApID0+IGBVUkw6ICR7cGF0aH1gLFxuICBwYWdlSW5kZXg6IGZ1bmN0aW9uKCBpbmRleCwgb3JpZ2luICkge1xuICAgIHJldHVybiBgY3VycmVudCBwYWdlIGRldGVybWluZWQgdG8gYmU6ICR7aW5kZXh9IGZyb20gJHtvcmlnaW59YDtcbiAgfSxcbn07XG5cbi8vIGxvZyBldmVudHNcbnByb3RvLmxvZyA9IGZ1bmN0aW9uKCB0eXBlLCBhcmdzICkge1xuICBpZiAoICF0aGlzLm9wdGlvbnMuZGVidWcgKSByZXR1cm47XG5cbiAgbGV0IG1lc3NhZ2UgPSBgW0luZmluaXRlU2Nyb2xsXSAke3R5cGV9YDtcbiAgbGV0IGxvZ2dlciA9IGxvZ2dlcnNbIHR5cGUgXTtcbiAgaWYgKCBsb2dnZXIgKSBtZXNzYWdlICs9ICcuICcgKyBsb2dnZXIuYXBwbHkoIHRoaXMsIGFyZ3MgKTtcbiAgY29uc29sZS5sb2coIG1lc3NhZ2UgKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIG1ldGhvZHMgdXNlZCBhbW91bmcgZmVhdHVyZXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxucHJvdG8udXBkYXRlTWVhc3VyZW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMud2luZG93SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICBsZXQgcmVjdCA9IHRoaXMuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdGhpcy50b3AgPSByZWN0LnRvcCArIHdpbmRvdy5zY3JvbGxZO1xufTtcblxucHJvdG8udXBkYXRlU2Nyb2xsZXIgPSBmdW5jdGlvbigpIHtcbiAgbGV0IGVsZW1lbnRTY3JvbGwgPSB0aGlzLm9wdGlvbnMuZWxlbWVudFNjcm9sbDtcbiAgaWYgKCAhZWxlbWVudFNjcm9sbCApIHtcbiAgICAvLyBkZWZhdWx0LCB1c2Ugd2luZG93XG4gICAgdGhpcy5zY3JvbGxlciA9IHdpbmRvdztcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gaWYgdHJ1ZSwgc2V0IHRvIGVsZW1lbnQsIG90aGVyd2lzZSB1c2Ugb3B0aW9uXG4gIHRoaXMuc2Nyb2xsZXIgPSBlbGVtZW50U2Nyb2xsID09PSB0cnVlID8gdGhpcy5lbGVtZW50IDpcbiAgICB1dGlscy5nZXRRdWVyeUVsZW1lbnQoIGVsZW1lbnRTY3JvbGwgKTtcbiAgaWYgKCAhdGhpcy5zY3JvbGxlciApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBmaW5kIGVsZW1lbnRTY3JvbGw6ICR7ZWxlbWVudFNjcm9sbH1gKTtcbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gcGFnZSBwYXRoIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnByb3RvLnVwZGF0ZUdldFBhdGggPSBmdW5jdGlvbigpIHtcbiAgbGV0IG9wdFBhdGggPSB0aGlzLm9wdGlvbnMucGF0aDtcbiAgaWYgKCAhb3B0UGF0aCApIHtcbiAgICBjb25zb2xlLmVycm9yKGBJbmZpbml0ZVNjcm9sbCBwYXRoIG9wdGlvbiByZXF1aXJlZC4gU2V0IGFzOiAke29wdFBhdGh9YCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGZ1bmN0aW9uXG4gIGxldCB0eXBlID0gdHlwZW9mIG9wdFBhdGg7XG4gIGlmICggdHlwZSA9PSAnZnVuY3Rpb24nICkge1xuICAgIHRoaXMuZ2V0UGF0aCA9IG9wdFBhdGg7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHRlbXBsYXRlIHN0cmluZzogJy9wYWdlcy97eyN9fS5odG1sJ1xuICBsZXQgdGVtcGxhdGVNYXRjaCA9IHR5cGUgPT0gJ3N0cmluZycgJiYgb3B0UGF0aC5tYXRjaCgne3sjfX0nKTtcbiAgaWYgKCB0ZW1wbGF0ZU1hdGNoICkge1xuICAgIHRoaXMudXBkYXRlR2V0UGF0aFRlbXBsYXRlKCBvcHRQYXRoICk7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHNlbGVjdG9yOiAnLm5leHQtcGFnZS1zZWxlY3RvcidcbiAgdGhpcy51cGRhdGVHZXRQYXRoU2VsZWN0b3IoIG9wdFBhdGggKTtcbn07XG5cbnByb3RvLnVwZGF0ZUdldFBhdGhUZW1wbGF0ZSA9IGZ1bmN0aW9uKCBvcHRQYXRoICkge1xuICAvLyBzZXQgZ2V0UGF0aCB3aXRoIHRlbXBsYXRlIHN0cmluZ1xuICB0aGlzLmdldFBhdGggPSAoKSA9PiB7XG4gICAgbGV0IG5leHRJbmRleCA9IHRoaXMucGFnZUluZGV4ICsgMTtcbiAgICByZXR1cm4gb3B0UGF0aC5yZXBsYWNlKCAne3sjfX0nLCBuZXh0SW5kZXggKTtcbiAgfTtcbiAgLy8gZ2V0IHBhZ2VJbmRleCBmcm9tIGxvY2F0aW9uXG4gIC8vIGNvbnZlcnQgcGF0aCBvcHRpb24gaW50byByZWdleCB0byBsb29rIGZvciBwYXR0ZXJuIGluIGxvY2F0aW9uXG4gIC8vIGVzY2FwZSBxdWVyeSAoPykgaW4gdXJsLCBhbGxvd3MgZm9yIHBhcnNpbmcgR0VUIHBhcmFtZXRlcnNcbiAgbGV0IHJlZ2V4U3RyaW5nID0gb3B0UGF0aFxuICAgIC5yZXBsYWNlKCAvKFxcXFxcXD98XFw/KS8sICdcXFxcPycgKVxuICAgIC5yZXBsYWNlKCAne3sjfX0nLCAnKFxcXFxkXFxcXGQ/XFxcXGQ/KScgKTtcbiAgbGV0IHRlbXBsYXRlUmUgPSBuZXcgUmVnRXhwKCByZWdleFN0cmluZyApO1xuICBsZXQgbWF0Y2ggPSBsb2NhdGlvbi5ocmVmLm1hdGNoKCB0ZW1wbGF0ZVJlICk7XG5cbiAgaWYgKCBtYXRjaCApIHtcbiAgICB0aGlzLnBhZ2VJbmRleCA9IHBhcnNlSW50KCBtYXRjaFsxXSwgMTAgKTtcbiAgICB0aGlzLmxvZyggJ3BhZ2VJbmRleCcsIFsgdGhpcy5wYWdlSW5kZXgsICd0ZW1wbGF0ZSBzdHJpbmcnIF0gKTtcbiAgfVxufTtcblxubGV0IHBhdGhSZWdleGVzID0gW1xuICAvLyBXb3JkUHJlc3MgJiBUdW1ibHIgLSBleGFtcGxlLmNvbS9wYWdlLzJcbiAgLy8gSmVreWxsIC0gZXhhbXBsZS5jb20vcGFnZTJcbiAgL14oLio/XFwvP3BhZ2VcXC8/KShcXGRcXGQ/XFxkPykoLio/JCkvLFxuICAvLyBEcnVwYWwgLSBleGFtcGxlLmNvbS8/cGFnZT0xXG4gIC9eKC4qP1xcLz9cXD9wYWdlPSkoXFxkXFxkP1xcZD8pKC4qPyQpLyxcbiAgLy8gY2F0Y2ggYWxsLCBsYXN0IG9jY3VyZW5jZSBvZiBhIG51bWJlclxuICAvKC4qPykoXFxkXFxkP1xcZD8pKD8hLipcXGQpKC4qPyQpLyxcbl07XG5cbi8vIHRyeSBtYXRjaGluZyBocmVmIHRvIHBhdGhSZWdleGVzIHBhdHRlcm5zXG5sZXQgZ2V0UGF0aFBhcnRzID0gSW5maW5pdGVTY3JvbGwuZ2V0UGF0aFBhcnRzID0gZnVuY3Rpb24oIGhyZWYgKSB7XG4gIGlmICggIWhyZWYgKSByZXR1cm47XG4gIGZvciAoIGxldCByZWdleCBvZiBwYXRoUmVnZXhlcyApIHtcbiAgICBsZXQgbWF0Y2ggPSBocmVmLm1hdGNoKCByZWdleCApO1xuICAgIGlmICggbWF0Y2ggKSB7XG4gICAgICBsZXQgWyAsIGJlZ2luLCBpbmRleCwgZW5kIF0gPSBtYXRjaDtcbiAgICAgIHJldHVybiB7IGJlZ2luLCBpbmRleCwgZW5kIH07XG4gICAgfVxuICB9XG59O1xuXG5wcm90by51cGRhdGVHZXRQYXRoU2VsZWN0b3IgPSBmdW5jdGlvbiggb3B0UGF0aCApIHtcbiAgLy8gcGFyc2UgaHJlZiBvZiBsaW5rOiAnLm5leHQtcGFnZS1saW5rJ1xuICBsZXQgaHJlZkVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCBvcHRQYXRoICk7XG4gIGlmICggIWhyZWZFbGVtICkge1xuICAgIGNvbnNvbGUuZXJyb3IoYEJhZCBJbmZpbml0ZVNjcm9sbCBwYXRoIG9wdGlvbi4gTmV4dCBsaW5rIG5vdCBmb3VuZDogJHtvcHRQYXRofWApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCBocmVmID0gaHJlZkVsZW0uZ2V0QXR0cmlidXRlKCdocmVmJyk7XG4gIGxldCBwYXRoUGFydHMgPSBnZXRQYXRoUGFydHMoIGhyZWYgKTtcbiAgaWYgKCAhcGF0aFBhcnRzICkge1xuICAgIGNvbnNvbGUuZXJyb3IoYEluZmluaXRlU2Nyb2xsIHVuYWJsZSB0byBwYXJzZSBuZXh0IGxpbmsgaHJlZjogJHtocmVmfWApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCB7IGJlZ2luLCBpbmRleCwgZW5kIH0gPSBwYXRoUGFydHM7XG4gIHRoaXMuaXNQYXRoU2VsZWN0b3IgPSB0cnVlOyAvLyBmbGFnIGZvciBjaGVja0xhc3RQYWdlKClcbiAgdGhpcy5nZXRQYXRoID0gKCkgPT4gYmVnaW4gKyAoIHRoaXMucGFnZUluZGV4ICsgMSApICsgZW5kO1xuICAvLyBnZXQgcGFnZUluZGV4IGZyb20gaHJlZlxuICB0aGlzLnBhZ2VJbmRleCA9IHBhcnNlSW50KCBpbmRleCwgMTAgKSAtIDE7XG4gIHRoaXMubG9nKCAncGFnZUluZGV4JywgWyB0aGlzLnBhZ2VJbmRleCwgJ25leHQgbGluaycgXSApO1xufTtcblxucHJvdG8udXBkYXRlR2V0QWJzb2x1dGVQYXRoID0gZnVuY3Rpb24oKSB7XG4gIGxldCBwYXRoID0gdGhpcy5nZXRQYXRoKCk7XG4gIC8vIHBhdGggZG9lc24ndCBzdGFydCB3aXRoIGh0dHAgb3IgL1xuICBsZXQgaXNBYnNvbHV0ZSA9IHBhdGgubWF0Y2goIC9eaHR0cC8gKSB8fCBwYXRoLm1hdGNoKCAvXlxcLy8gKTtcbiAgaWYgKCBpc0Fic29sdXRlICkge1xuICAgIHRoaXMuZ2V0QWJzb2x1dGVQYXRoID0gdGhpcy5nZXRQYXRoO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCB7IHBhdGhuYW1lIH0gPSBsb2NhdGlvbjtcbiAgLy8gcXVlcnkgcGFyYW1ldGVyICM4MjkuIGV4YW1wbGUuY29tLz9wZz0yXG4gIGxldCBpc1F1ZXJ5ID0gcGF0aC5tYXRjaCggL15cXD8vICk7XG4gIC8vIC9mb28vYmFyL2luZGV4Lmh0bWwgPT4gL2Zvby9iYXJcbiAgbGV0IGRpcmVjdG9yeSA9IHBhdGhuYW1lLnN1YnN0cmluZyggMCwgcGF0aG5hbWUubGFzdEluZGV4T2YoJy8nKSApO1xuICBsZXQgcGF0aFN0YXJ0ID0gaXNRdWVyeSA/IHBhdGhuYW1lIDogZGlyZWN0b3J5ICsgJy8nO1xuXG4gIHRoaXMuZ2V0QWJzb2x1dGVQYXRoID0gKCkgPT4gcGF0aFN0YXJ0ICsgdGhpcy5nZXRQYXRoKCk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBuYXYgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gaGlkZSBuYXZpZ2F0aW9uXG5JbmZpbml0ZVNjcm9sbC5jcmVhdGUuaGlkZU5hdiA9IGZ1bmN0aW9uKCkge1xuICBsZXQgbmF2ID0gdXRpbHMuZ2V0UXVlcnlFbGVtZW50KCB0aGlzLm9wdGlvbnMuaGlkZU5hdiApO1xuICBpZiAoICFuYXYgKSByZXR1cm47XG5cbiAgbmF2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIHRoaXMubmF2ID0gbmF2O1xufTtcblxuSW5maW5pdGVTY3JvbGwuZGVzdHJveS5oaWRlTmF2ID0gZnVuY3Rpb24oKSB7XG4gIGlmICggdGhpcy5uYXYgKSB0aGlzLm5hdi5zdHlsZS5kaXNwbGF5ID0gJyc7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBkZXN0cm95IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnByb3RvLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5hbGxPZmYoKTsgLy8gcmVtb3ZlIGFsbCBldmVudCBsaXN0ZW5lcnNcbiAgLy8gY2FsbCBkZXN0cm95IG1ldGhvZHNcbiAgZm9yICggbGV0IG1ldGhvZCBpbiBJbmZpbml0ZVNjcm9sbC5kZXN0cm95ICkge1xuICAgIEluZmluaXRlU2Nyb2xsLmRlc3Ryb3lbIG1ldGhvZCBdLmNhbGwoIHRoaXMgKTtcbiAgfVxuXG4gIGRlbGV0ZSB0aGlzLmVsZW1lbnQuaW5maW5pdGVTY3JvbGxHVUlEO1xuICBkZWxldGUgaW5zdGFuY2VzWyB0aGlzLmd1aWQgXTtcbiAgLy8gcmVtb3ZlIGpRdWVyeSBkYXRhLiAjODA3XG4gIGlmICggalF1ZXJ5ICYmIHRoaXMuJGVsZW1lbnQgKSB7XG4gICAgalF1ZXJ5LnJlbW92ZURhdGEoIHRoaXMuZWxlbWVudCwgJ2luZmluaXRlU2Nyb2xsJyApO1xuICB9XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSB1dGlsaXRpZXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gaHR0cHM6Ly9yZW15c2hhcnAuY29tLzIwMTAvMDcvMjEvdGhyb3R0bGluZy1mdW5jdGlvbi1jYWxsc1xuSW5maW5pdGVTY3JvbGwudGhyb3R0bGUgPSBmdW5jdGlvbiggZm4sIHRocmVzaG9sZCApIHtcbiAgdGhyZXNob2xkID0gdGhyZXNob2xkIHx8IDIwMDtcbiAgbGV0IGxhc3QsIHRpbWVvdXQ7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGxldCBub3cgPSArbmV3IERhdGUoKTtcbiAgICBsZXQgYXJncyA9IGFyZ3VtZW50cztcbiAgICBsZXQgdHJpZ2dlciA9ICgpID0+IHtcbiAgICAgIGxhc3QgPSBub3c7XG4gICAgICBmbi5hcHBseSggdGhpcywgYXJncyApO1xuICAgIH07XG4gICAgaWYgKCBsYXN0ICYmIG5vdyA8IGxhc3QgKyB0aHJlc2hvbGQgKSB7XG4gICAgICAvLyBob2xkIG9uIHRvIGl0XG4gICAgICBjbGVhclRpbWVvdXQoIHRpbWVvdXQgKTtcbiAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KCB0cmlnZ2VyLCB0aHJlc2hvbGQgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHJpZ2dlcigpO1xuICAgIH1cbiAgfTtcbn07XG5cbkluZmluaXRlU2Nyb2xsLmRhdGEgPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgZWxlbSA9IHV0aWxzLmdldFF1ZXJ5RWxlbWVudCggZWxlbSApO1xuICBsZXQgaWQgPSBlbGVtICYmIGVsZW0uaW5maW5pdGVTY3JvbGxHVUlEO1xuICByZXR1cm4gaWQgJiYgaW5zdGFuY2VzWyBpZCBdO1xufTtcblxuLy8gc2V0IGludGVybmFsIGpRdWVyeSwgZm9yIFdlYnBhY2sgKyBqUXVlcnkgdjNcbkluZmluaXRlU2Nyb2xsLnNldEpRdWVyeSA9IGZ1bmN0aW9uKCBqcXJ5ICkge1xuICBqUXVlcnkgPSBqcXJ5O1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gc2V0dXAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxudXRpbHMuaHRtbEluaXQoIEluZmluaXRlU2Nyb2xsLCAnaW5maW5pdGUtc2Nyb2xsJyApO1xuXG4vLyBhZGQgbm9vcCBfaW5pdCBtZXRob2QgZm9yIGpRdWVyeSBCcmlkZ2V0LiAjNzY4XG5wcm90by5faW5pdCA9IGZ1bmN0aW9uKCkge307XG5cbmxldCB7IGpRdWVyeUJyaWRnZXQgfSA9IHdpbmRvdztcbmlmICggalF1ZXJ5ICYmIGpRdWVyeUJyaWRnZXQgKSB7XG4gIGpRdWVyeUJyaWRnZXQoICdpbmZpbml0ZVNjcm9sbCcsIEluZmluaXRlU2Nyb2xsLCBqUXVlcnkgKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnJldHVybiBJbmZpbml0ZVNjcm9sbDtcblxufSApICk7XG4iLCIvLyBoaXN0b3J5XG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgcmVxdWlyZSgnLi9jb3JlJyksXG4gICAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJyksXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgd2luZG93LkluZmluaXRlU2Nyb2xsLFxuICAgICAgICB3aW5kb3cuZml6enlVSVV0aWxzLFxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEluZmluaXRlU2Nyb2xsLCB1dGlscyApIHtcblxubGV0IHByb3RvID0gSW5maW5pdGVTY3JvbGwucHJvdG90eXBlO1xuXG5PYmplY3QuYXNzaWduKCBJbmZpbml0ZVNjcm9sbC5kZWZhdWx0cywge1xuICBoaXN0b3J5OiAncmVwbGFjZScsXG4gIC8vIGhpc3RvcnlUaXRsZTogZmFsc2UsXG59ICk7XG5cbmxldCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuXG4vLyAtLS0tLSBjcmVhdGUvZGVzdHJveSAtLS0tLSAvL1xuXG5JbmZpbml0ZVNjcm9sbC5jcmVhdGUuaGlzdG9yeSA9IGZ1bmN0aW9uKCkge1xuICBpZiAoICF0aGlzLm9wdGlvbnMuaGlzdG9yeSApIHJldHVybjtcblxuICAvLyBjaGVjayBmb3Igc2FtZSBvcmlnaW5cbiAgbGluay5ocmVmID0gdGhpcy5nZXRBYnNvbHV0ZVBhdGgoKTtcbiAgLy8gTVMgRWRnZSBkb2VzIG5vdCBoYXZlIG9yaWdpbiBvbiBsaW5rXG4gIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1pY3Jvc29mdC5jb20vZW4tdXMvbWljcm9zb2Z0LWVkZ2UvcGxhdGZvcm0vaXNzdWVzLzEyMjM2NDkzL1xuICBsZXQgbGlua09yaWdpbiA9IGxpbmsub3JpZ2luIHx8IGxpbmsucHJvdG9jb2wgKyAnLy8nICsgbGluay5ob3N0O1xuICBsZXQgaXNTYW1lT3JpZ2luID0gbGlua09yaWdpbiA9PSBsb2NhdGlvbi5vcmlnaW47XG4gIGlmICggIWlzU2FtZU9yaWdpbiApIHtcbiAgICBjb25zb2xlLmVycm9yKCAnW0luZmluaXRlU2Nyb2xsXSBjYW5ub3Qgc2V0IGhpc3Rvcnkgd2l0aCBkaWZmZXJlbnQgb3JpZ2luOiAnICtcbiAgICAgIGAke2xpbmsub3JpZ2lufSBvbiAke2xvY2F0aW9uLm9yaWdpbn0gLiBIaXN0b3J5IGJlaGF2aW9yIGRpc2FibGVkLmAgKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyB0d28gd2F5cyB0byBoYW5kbGUgY2hhbmdpbmcgaGlzdG9yeVxuICBpZiAoIHRoaXMub3B0aW9ucy5hcHBlbmQgKSB7XG4gICAgdGhpcy5jcmVhdGVIaXN0b3J5QXBwZW5kKCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5jcmVhdGVIaXN0b3J5UGFnZUxvYWQoKTtcbiAgfVxufTtcblxucHJvdG8uY3JlYXRlSGlzdG9yeUFwcGVuZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnVwZGF0ZU1lYXN1cmVtZW50cygpO1xuICB0aGlzLnVwZGF0ZVNjcm9sbGVyKCk7XG4gIC8vIGFycmF5IG9mIHNjcm9sbCBwb3NpdGlvbnMgb2YgYXBwZW5kZWQgcGFnZXNcbiAgdGhpcy5zY3JvbGxQYWdlcyA9IFtcbiAgICAvLyBmaXJzdCBwYWdlXG4gICAge1xuICAgICAgdG9wOiAwLFxuICAgICAgcGF0aDogbG9jYXRpb24uaHJlZixcbiAgICAgIHRpdGxlOiBkb2N1bWVudC50aXRsZSxcbiAgICB9LFxuICBdO1xuICB0aGlzLnNjcm9sbFBhZ2UgPSB0aGlzLnNjcm9sbFBhZ2VzWzBdO1xuICAvLyBldmVudHNcbiAgdGhpcy5zY3JvbGxIaXN0b3J5SGFuZGxlciA9IHRoaXMub25TY3JvbGxIaXN0b3J5LmJpbmQoIHRoaXMgKTtcbiAgdGhpcy51bmxvYWRIYW5kbGVyID0gdGhpcy5vblVubG9hZC5iaW5kKCB0aGlzICk7XG4gIHRoaXMuc2Nyb2xsZXIuYWRkRXZlbnRMaXN0ZW5lciggJ3Njcm9sbCcsIHRoaXMuc2Nyb2xsSGlzdG9yeUhhbmRsZXIgKTtcbiAgdGhpcy5vbiggJ2FwcGVuZCcsIHRoaXMub25BcHBlbmRIaXN0b3J5ICk7XG4gIHRoaXMuYmluZEhpc3RvcnlBcHBlbmRFdmVudHMoIHRydWUgKTtcbn07XG5cbnByb3RvLmJpbmRIaXN0b3J5QXBwZW5kRXZlbnRzID0gZnVuY3Rpb24oIGlzQmluZCApIHtcbiAgbGV0IGFkZFJlbW92ZSA9IGlzQmluZCA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgdGhpcy5zY3JvbGxlclsgYWRkUmVtb3ZlIF0oICdzY3JvbGwnLCB0aGlzLnNjcm9sbEhpc3RvcnlIYW5kbGVyICk7XG4gIHdpbmRvd1sgYWRkUmVtb3ZlIF0oICd1bmxvYWQnLCB0aGlzLnVubG9hZEhhbmRsZXIgKTtcbn07XG5cbnByb3RvLmNyZWF0ZUhpc3RvcnlQYWdlTG9hZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm9uKCAnbG9hZCcsIHRoaXMub25QYWdlTG9hZEhpc3RvcnkgKTtcbn07XG5cbkluZmluaXRlU2Nyb2xsLmRlc3Ryb3kuaGlzdG9yeSA9XG5wcm90by5kZXN0cm95SGlzdG9yeSA9IGZ1bmN0aW9uKCkge1xuICBsZXQgaXNIaXN0b3J5QXBwZW5kID0gdGhpcy5vcHRpb25zLmhpc3RvcnkgJiYgdGhpcy5vcHRpb25zLmFwcGVuZDtcbiAgaWYgKCBpc0hpc3RvcnlBcHBlbmQgKSB7XG4gICAgdGhpcy5iaW5kSGlzdG9yeUFwcGVuZEV2ZW50cyggZmFsc2UgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0gYXBwZW5kIGhpc3RvcnkgLS0tLS0gLy9cblxucHJvdG8ub25BcHBlbmRIaXN0b3J5ID0gZnVuY3Rpb24oIHJlc3BvbnNlLCBwYXRoLCBpdGVtcyApIHtcbiAgLy8gZG8gbm90IHByb2NlZWQgaWYgbm8gaXRlbXMuICM3NzlcbiAgaWYgKCAhaXRlbXMgfHwgIWl0ZW1zLmxlbmd0aCApIHJldHVybjtcblxuICBsZXQgZmlyc3RJdGVtID0gaXRlbXNbMF07XG4gIGxldCBlbGVtU2Nyb2xsWSA9IHRoaXMuZ2V0RWxlbWVudFNjcm9sbFkoIGZpcnN0SXRlbSApO1xuICAvLyByZXNvbHZlIHBhdGhcbiAgbGluay5ocmVmID0gcGF0aDtcbiAgLy8gYWRkIHBhZ2UgZGF0YSB0byBoYXNoXG4gIHRoaXMuc2Nyb2xsUGFnZXMucHVzaCh7XG4gICAgdG9wOiBlbGVtU2Nyb2xsWSxcbiAgICBwYXRoOiBsaW5rLmhyZWYsXG4gICAgdGl0bGU6IHJlc3BvbnNlLnRpdGxlLFxuICB9KTtcbn07XG5cbnByb3RvLmdldEVsZW1lbnRTY3JvbGxZID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIGlmICggdGhpcy5vcHRpb25zLmVsZW1lbnRTY3JvbGwgKSB7XG4gICAgcmV0dXJuIGVsZW0ub2Zmc2V0VG9wIC0gdGhpcy50b3A7XG4gIH0gZWxzZSB7XG4gICAgbGV0IHJlY3QgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHJldHVybiByZWN0LnRvcCArIHdpbmRvdy5zY3JvbGxZO1xuICB9XG59O1xuXG5wcm90by5vblNjcm9sbEhpc3RvcnkgPSBmdW5jdGlvbigpIHtcbiAgLy8gY3ljbGUgdGhyb3VnaCBwb3NpdGlvbnMsIGZpbmQgYmlnZ2VzdCB3aXRob3V0IGdvaW5nIG92ZXJcbiAgbGV0IHNjcm9sbFBhZ2UgPSB0aGlzLmdldENsb3Nlc3RTY3JvbGxQYWdlKCk7XG4gIC8vIHNldCBoaXN0b3J5IGlmIGNoYW5nZWRcbiAgaWYgKCBzY3JvbGxQYWdlICE9IHRoaXMuc2Nyb2xsUGFnZSApIHtcbiAgICB0aGlzLnNjcm9sbFBhZ2UgPSBzY3JvbGxQYWdlO1xuICAgIHRoaXMuc2V0SGlzdG9yeSggc2Nyb2xsUGFnZS50aXRsZSwgc2Nyb2xsUGFnZS5wYXRoICk7XG4gIH1cbn07XG5cbnV0aWxzLmRlYm91bmNlTWV0aG9kKCBJbmZpbml0ZVNjcm9sbCwgJ29uU2Nyb2xsSGlzdG9yeScsIDE1MCApO1xuXG5wcm90by5nZXRDbG9zZXN0U2Nyb2xsUGFnZSA9IGZ1bmN0aW9uKCkge1xuICBsZXQgc2Nyb2xsVmlld1k7XG4gIGlmICggdGhpcy5vcHRpb25zLmVsZW1lbnRTY3JvbGwgKSB7XG4gICAgc2Nyb2xsVmlld1kgPSB0aGlzLnNjcm9sbGVyLnNjcm9sbFRvcCArIHRoaXMuc2Nyb2xsZXIuY2xpZW50SGVpZ2h0IC8gMjtcbiAgfSBlbHNlIHtcbiAgICBzY3JvbGxWaWV3WSA9IHdpbmRvdy5zY3JvbGxZICsgdGhpcy53aW5kb3dIZWlnaHQgLyAyO1xuICB9XG5cbiAgbGV0IHNjcm9sbFBhZ2U7XG4gIGZvciAoIGxldCBwYWdlIG9mIHRoaXMuc2Nyb2xsUGFnZXMgKSB7XG4gICAgaWYgKCBwYWdlLnRvcCA+PSBzY3JvbGxWaWV3WSApIGJyZWFrO1xuXG4gICAgc2Nyb2xsUGFnZSA9IHBhZ2U7XG4gIH1cbiAgcmV0dXJuIHNjcm9sbFBhZ2U7XG59O1xuXG5wcm90by5zZXRIaXN0b3J5ID0gZnVuY3Rpb24oIHRpdGxlLCBwYXRoICkge1xuICBsZXQgb3B0SGlzdG9yeSA9IHRoaXMub3B0aW9ucy5oaXN0b3J5O1xuICBsZXQgaGlzdG9yeU1ldGhvZCA9IG9wdEhpc3RvcnkgJiYgaGlzdG9yeVsgb3B0SGlzdG9yeSArICdTdGF0ZScgXTtcbiAgaWYgKCAhaGlzdG9yeU1ldGhvZCApIHJldHVybjtcblxuICBoaXN0b3J5WyBvcHRIaXN0b3J5ICsgJ1N0YXRlJyBdKCBudWxsLCB0aXRsZSwgcGF0aCApO1xuICBpZiAoIHRoaXMub3B0aW9ucy5oaXN0b3J5VGl0bGUgKSBkb2N1bWVudC50aXRsZSA9IHRpdGxlO1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdoaXN0b3J5JywgbnVsbCwgWyB0aXRsZSwgcGF0aCBdICk7XG59O1xuXG4vLyBzY3JvbGwgdG8gdG9wIHRvIHByZXZlbnQgaW5pdGlhbCBzY3JvbGwtcmVzZXQgYWZ0ZXIgcGFnZSByZWZyZXNoXG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTg2MzM5MTUvMTgyMTgzXG5wcm90by5vblVubG9hZCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIHRoaXMuc2Nyb2xsUGFnZS50b3AgPT09IDAgKSByZXR1cm47XG5cbiAgLy8gY2FsY3VsYXRlIHdoZXJlIHNjcm9sbCBwb3NpdGlvbiB3b3VsZCBiZSBvbiByZWZyZXNoXG4gIGxldCBzY3JvbGxZID0gd2luZG93LnNjcm9sbFkgLSB0aGlzLnNjcm9sbFBhZ2UudG9wICsgdGhpcy50b3A7XG4gIC8vIGRpc2FibGUgc2Nyb2xsIGV2ZW50IGJlZm9yZSBzZXR0aW5nIHNjcm9sbCAjNjc5XG4gIHRoaXMuZGVzdHJveUhpc3RvcnkoKTtcbiAgc2Nyb2xsVG8oIDAsIHNjcm9sbFkgKTtcbn07XG5cbi8vIC0tLS0tIGxvYWQgaGlzdG9yeSAtLS0tLSAvL1xuXG4vLyB1cGRhdGUgVVJMXG5wcm90by5vblBhZ2VMb2FkSGlzdG9yeSA9IGZ1bmN0aW9uKCByZXNwb25zZSwgcGF0aCApIHtcbiAgdGhpcy5zZXRIaXN0b3J5KCByZXNwb25zZS50aXRsZSwgcGF0aCApO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnJldHVybiBJbmZpbml0ZVNjcm9sbDtcblxufSApICk7XG4iLCIvKiFcbiAqIEluZmluaXRlIFNjcm9sbCB2NC4wLjFcbiAqIEF1dG9tYXRpY2FsbHkgYWRkIG5leHQgcGFnZVxuICpcbiAqIExpY2Vuc2VkIEdQTHYzIGZvciBvcGVuIHNvdXJjZSB1c2VcbiAqIG9yIEluZmluaXRlIFNjcm9sbCBDb21tZXJjaWFsIExpY2Vuc2UgZm9yIGNvbW1lcmNpYWwgdXNlXG4gKlxuICogaHR0cHM6Ly9pbmZpbml0ZS1zY3JvbGwuY29tXG4gKiBDb3B5cmlnaHQgMjAxOC0yMDIwIE1ldGFmaXp6eVxuICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgcmVxdWlyZSgnLi9jb3JlJyksXG4gICAgICAgIHJlcXVpcmUoJy4vcGFnZS1sb2FkJyksXG4gICAgICAgIHJlcXVpcmUoJy4vc2Nyb2xsLXdhdGNoJyksXG4gICAgICAgIHJlcXVpcmUoJy4vaGlzdG9yeScpLFxuICAgICAgICByZXF1aXJlKCcuL2J1dHRvbicpLFxuICAgICAgICByZXF1aXJlKCcuL3N0YXR1cycpLFxuICAgICk7XG4gIH1cblxufSApKCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIEluZmluaXRlU2Nyb2xsICkge1xuICByZXR1cm4gSW5maW5pdGVTY3JvbGw7XG59ICk7XG4iLCIvLyBwYWdlLWxvYWRcbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICByZXF1aXJlKCcuL2NvcmUnKSxcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICB3aW5kb3cuSW5maW5pdGVTY3JvbGwsXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgSW5maW5pdGVTY3JvbGwgKSB7XG5cbmxldCBwcm90byA9IEluZmluaXRlU2Nyb2xsLnByb3RvdHlwZTtcblxuT2JqZWN0LmFzc2lnbiggSW5maW5pdGVTY3JvbGwuZGVmYXVsdHMsIHtcbiAgLy8gYXBwZW5kOiBmYWxzZSxcbiAgbG9hZE9uU2Nyb2xsOiB0cnVlLFxuICBjaGVja0xhc3RQYWdlOiB0cnVlLFxuICByZXNwb25zZUJvZHk6ICd0ZXh0JyxcbiAgZG9tUGFyc2VSZXNwb25zZTogdHJ1ZSxcbiAgLy8gcHJlZmlsbDogZmFsc2UsXG4gIC8vIG91dGxheWVyOiBudWxsLFxufSApO1xuXG5JbmZpbml0ZVNjcm9sbC5jcmVhdGUucGFnZUxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jYW5Mb2FkID0gdHJ1ZTtcbiAgdGhpcy5vbiggJ3Njcm9sbFRocmVzaG9sZCcsIHRoaXMub25TY3JvbGxUaHJlc2hvbGRMb2FkICk7XG4gIHRoaXMub24oICdsb2FkJywgdGhpcy5jaGVja0xhc3RQYWdlICk7XG4gIGlmICggdGhpcy5vcHRpb25zLm91dGxheWVyICkge1xuICAgIHRoaXMub24oICdhcHBlbmQnLCB0aGlzLm9uQXBwZW5kT3V0bGF5ZXIgKTtcbiAgfVxufTtcblxucHJvdG8ub25TY3JvbGxUaHJlc2hvbGRMb2FkID0gZnVuY3Rpb24oKSB7XG4gIGlmICggdGhpcy5vcHRpb25zLmxvYWRPblNjcm9sbCApIHRoaXMubG9hZE5leHRQYWdlKCk7XG59O1xuXG5sZXQgZG9tUGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuXG5wcm90by5sb2FkTmV4dFBhZ2UgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCB0aGlzLmlzTG9hZGluZyB8fCAhdGhpcy5jYW5Mb2FkICkgcmV0dXJuO1xuXG4gIGxldCB7IHJlc3BvbnNlQm9keSwgZG9tUGFyc2VSZXNwb25zZSwgZmV0Y2hPcHRpb25zIH0gPSB0aGlzLm9wdGlvbnM7XG4gIGxldCBwYXRoID0gdGhpcy5nZXRBYnNvbHV0ZVBhdGgoKTtcbiAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xuICBpZiAoIHR5cGVvZiBmZXRjaE9wdGlvbnMgPT0gJ2Z1bmN0aW9uJyApIGZldGNoT3B0aW9ucyA9IGZldGNoT3B0aW9ucygpO1xuXG4gIGxldCBmZXRjaFByb21pc2UgPSBmZXRjaCggcGF0aCwgZmV0Y2hPcHRpb25zIClcbiAgICAudGhlbiggKCByZXNwb25zZSApID0+IHtcbiAgICAgIGlmICggIXJlc3BvbnNlLm9rICkge1xuICAgICAgICBsZXQgZXJyb3IgPSBuZXcgRXJyb3IoIHJlc3BvbnNlLnN0YXR1c1RleHQgKTtcbiAgICAgICAgdGhpcy5vblBhZ2VFcnJvciggZXJyb3IsIHBhdGgsIHJlc3BvbnNlICk7XG4gICAgICAgIHJldHVybiB7IHJlc3BvbnNlIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXNwb25zZVsgcmVzcG9uc2VCb2R5IF0oKS50aGVuKCAoIGJvZHkgKSA9PiB7XG4gICAgICAgIGxldCBjYW5Eb21QYXJzZSA9IHJlc3BvbnNlQm9keSA9PSAndGV4dCcgJiYgZG9tUGFyc2VSZXNwb25zZTtcbiAgICAgICAgaWYgKCBjYW5Eb21QYXJzZSApIHtcbiAgICAgICAgICBib2R5ID0gZG9tUGFyc2VyLnBhcnNlRnJvbVN0cmluZyggYm9keSwgJ3RleHQvaHRtbCcgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIHJlc3BvbnNlLnN0YXR1cyA9PSAyMDQgKSB7XG4gICAgICAgICAgdGhpcy5sYXN0UGFnZVJlYWNoZWQoIGJvZHksIHBhdGggKTtcbiAgICAgICAgICByZXR1cm4geyBib2R5LCByZXNwb25zZSB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLm9uUGFnZUxvYWQoIGJvZHksIHBhdGgsIHJlc3BvbnNlICk7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICB9IClcbiAgICAuY2F0Y2goICggZXJyb3IgKSA9PiB7XG4gICAgICB0aGlzLm9uUGFnZUVycm9yKCBlcnJvciwgcGF0aCApO1xuICAgIH0gKTtcblxuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdyZXF1ZXN0JywgbnVsbCwgWyBwYXRoLCBmZXRjaFByb21pc2UgXSApO1xuXG4gIHJldHVybiBmZXRjaFByb21pc2U7XG59O1xuXG5wcm90by5vblBhZ2VMb2FkID0gZnVuY3Rpb24oIGJvZHksIHBhdGgsIHJlc3BvbnNlICkge1xuICAvLyBkb25lIGxvYWRpbmcgaWYgbm90IGFwcGVuZGluZ1xuICBpZiAoICF0aGlzLm9wdGlvbnMuYXBwZW5kICkge1xuICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gIH1cbiAgdGhpcy5wYWdlSW5kZXgrKztcbiAgdGhpcy5sb2FkQ291bnQrKztcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAnbG9hZCcsIG51bGwsIFsgYm9keSwgcGF0aCwgcmVzcG9uc2UgXSApO1xuICByZXR1cm4gdGhpcy5hcHBlbmROZXh0UGFnZSggYm9keSwgcGF0aCwgcmVzcG9uc2UgKTtcbn07XG5cbnByb3RvLmFwcGVuZE5leHRQYWdlID0gZnVuY3Rpb24oIGJvZHksIHBhdGgsIHJlc3BvbnNlICkge1xuICBsZXQgeyBhcHBlbmQsIHJlc3BvbnNlQm9keSwgZG9tUGFyc2VSZXNwb25zZSB9ID0gdGhpcy5vcHRpb25zO1xuICAvLyBkbyBub3QgYXBwZW5kIGpzb25cbiAgbGV0IGlzRG9jdW1lbnQgPSByZXNwb25zZUJvZHkgPT0gJ3RleHQnICYmIGRvbVBhcnNlUmVzcG9uc2U7XG4gIGlmICggIWlzRG9jdW1lbnQgfHwgIWFwcGVuZCApIHJldHVybiB7IGJvZHksIHJlc3BvbnNlIH07XG5cbiAgbGV0IGl0ZW1zID0gYm9keS5xdWVyeVNlbGVjdG9yQWxsKCBhcHBlbmQgKTtcbiAgbGV0IHByb21pc2VWYWx1ZSA9IHsgYm9keSwgcmVzcG9uc2UsIGl0ZW1zIH07XG4gIC8vIGxhc3QgcGFnZSBoaXQgaWYgbm8gaXRlbXMuICM4NDBcbiAgaWYgKCAhaXRlbXMgfHwgIWl0ZW1zLmxlbmd0aCApIHtcbiAgICB0aGlzLmxhc3RQYWdlUmVhY2hlZCggYm9keSwgcGF0aCApO1xuICAgIHJldHVybiBwcm9taXNlVmFsdWU7XG4gIH1cblxuICBsZXQgZnJhZ21lbnQgPSBnZXRJdGVtc0ZyYWdtZW50KCBpdGVtcyApO1xuICBsZXQgYXBwZW5kUmVhZHkgPSAoKSA9PiB7XG4gICAgdGhpcy5hcHBlbmRJdGVtcyggaXRlbXMsIGZyYWdtZW50ICk7XG4gICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoICdhcHBlbmQnLCBudWxsLCBbIGJvZHksIHBhdGgsIGl0ZW1zLCByZXNwb25zZSBdICk7XG4gICAgcmV0dXJuIHByb21pc2VWYWx1ZTtcbiAgfTtcblxuICAvLyBUT0RPIGFkZCBob29rIGZvciBvcHRpb24gdG8gdHJpZ2dlciBhcHBlbmRSZWFkeVxuICBpZiAoIHRoaXMub3B0aW9ucy5vdXRsYXllciApIHtcbiAgICByZXR1cm4gdGhpcy5hcHBlbmRPdXRsYXllckl0ZW1zKCBmcmFnbWVudCwgYXBwZW5kUmVhZHkgKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYXBwZW5kUmVhZHkoKTtcbiAgfVxufTtcblxucHJvdG8uYXBwZW5kSXRlbXMgPSBmdW5jdGlvbiggaXRlbXMsIGZyYWdtZW50ICkge1xuICBpZiAoICFpdGVtcyB8fCAhaXRlbXMubGVuZ3RoICkgcmV0dXJuO1xuXG4gIC8vIGdldCBmcmFnbWVudCBpZiBub3QgcHJvdmlkZWRcbiAgZnJhZ21lbnQgPSBmcmFnbWVudCB8fCBnZXRJdGVtc0ZyYWdtZW50KCBpdGVtcyApO1xuICByZWZyZXNoU2NyaXB0cyggZnJhZ21lbnQgKTtcbiAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKCBmcmFnbWVudCApO1xufTtcblxuZnVuY3Rpb24gZ2V0SXRlbXNGcmFnbWVudCggaXRlbXMgKSB7XG4gIC8vIGFkZCBpdGVtcyB0byBmcmFnbWVudFxuICBsZXQgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIGlmICggaXRlbXMgKSBmcmFnbWVudC5hcHBlbmQoIC4uLml0ZW1zICk7XG4gIHJldHVybiBmcmFnbWVudDtcbn1cblxuLy8gcmVwbGFjZSA8c2NyaXB0PnMgd2l0aCBjb3BpZXMgc28gdGhleSBsb2FkXG4vLyA8c2NyaXB0PnMgYWRkZWQgYnkgSW5maW5pdGVTY3JvbGwgd2lsbCBub3QgbG9hZFxuLy8gc2ltaWxhciB0byBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy82MTA5OTVcbmZ1bmN0aW9uIHJlZnJlc2hTY3JpcHRzKCBmcmFnbWVudCApIHtcbiAgbGV0IHNjcmlwdHMgPSBmcmFnbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHQnKTtcbiAgZm9yICggbGV0IHNjcmlwdCBvZiBzY3JpcHRzICkge1xuICAgIGxldCBmcmVzaFNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgIC8vIGNvcHkgYXR0cmlidXRlc1xuICAgIGxldCBhdHRycyA9IHNjcmlwdC5hdHRyaWJ1dGVzO1xuICAgIGZvciAoIGxldCBhdHRyIG9mIGF0dHJzICkge1xuICAgICAgZnJlc2hTY3JpcHQuc2V0QXR0cmlidXRlKCBhdHRyLm5hbWUsIGF0dHIudmFsdWUgKTtcbiAgICB9XG4gICAgLy8gY29weSBpbm5lciBzY3JpcHQgY29kZS4gIzcxOCwgIzc4MlxuICAgIGZyZXNoU2NyaXB0LmlubmVySFRNTCA9IHNjcmlwdC5pbm5lckhUTUw7XG4gICAgc2NyaXB0LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKCBmcmVzaFNjcmlwdCwgc2NyaXB0ICk7XG4gIH1cbn1cblxuLy8gLS0tLS0gb3V0bGF5ZXIgLS0tLS0gLy9cblxucHJvdG8uYXBwZW5kT3V0bGF5ZXJJdGVtcyA9IGZ1bmN0aW9uKCBmcmFnbWVudCwgYXBwZW5kUmVhZHkgKSB7XG4gIGxldCBpbWFnZXNMb2FkZWQgPSBJbmZpbml0ZVNjcm9sbC5pbWFnZXNMb2FkZWQgfHwgd2luZG93LmltYWdlc0xvYWRlZDtcbiAgaWYgKCAhaW1hZ2VzTG9hZGVkICkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1tJbmZpbml0ZVNjcm9sbF0gaW1hZ2VzTG9hZGVkIHJlcXVpcmVkIGZvciBvdXRsYXllciBvcHRpb24nKTtcbiAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBhcHBlbmQgb25jZSBpbWFnZXMgbG9hZGVkXG4gIHJldHVybiBuZXcgUHJvbWlzZSggZnVuY3Rpb24oIHJlc29sdmUgKSB7XG4gICAgaW1hZ2VzTG9hZGVkKCBmcmFnbWVudCwgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgYm9keVJlc3BvbnNlID0gYXBwZW5kUmVhZHkoKTtcbiAgICAgIHJlc29sdmUoIGJvZHlSZXNwb25zZSApO1xuICAgIH0gKTtcbiAgfSApO1xufTtcblxucHJvdG8ub25BcHBlbmRPdXRsYXllciA9IGZ1bmN0aW9uKCByZXNwb25zZSwgcGF0aCwgaXRlbXMgKSB7XG4gIHRoaXMub3B0aW9ucy5vdXRsYXllci5hcHBlbmRlZCggaXRlbXMgKTtcbn07XG5cbi8vIC0tLS0tIGNoZWNrTGFzdFBhZ2UgLS0tLS0gLy9cblxuLy8gY2hlY2sgcmVzcG9uc2UgZm9yIG5leHQgZWxlbWVudFxucHJvdG8uY2hlY2tMYXN0UGFnZSA9IGZ1bmN0aW9uKCBib2R5LCBwYXRoICkge1xuICBsZXQgeyBjaGVja0xhc3RQYWdlLCBwYXRoOiBwYXRoT3B0IH0gPSB0aGlzLm9wdGlvbnM7XG4gIGlmICggIWNoZWNrTGFzdFBhZ2UgKSByZXR1cm47XG5cbiAgLy8gaWYgcGF0aCBpcyBmdW5jdGlvbiwgY2hlY2sgaWYgbmV4dCBwYXRoIGlzIHRydXRoeVxuICBpZiAoIHR5cGVvZiBwYXRoT3B0ID09ICdmdW5jdGlvbicgKSB7XG4gICAgbGV0IG5leHRQYXRoID0gdGhpcy5nZXRQYXRoKCk7XG4gICAgaWYgKCAhbmV4dFBhdGggKSB7XG4gICAgICB0aGlzLmxhc3RQYWdlUmVhY2hlZCggYm9keSwgcGF0aCApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICAvLyBnZXQgc2VsZWN0b3IgZnJvbSBjaGVja0xhc3RQYWdlIG9yIHBhdGggb3B0aW9uXG4gIGxldCBzZWxlY3RvcjtcbiAgaWYgKCB0eXBlb2YgY2hlY2tMYXN0UGFnZSA9PSAnc3RyaW5nJyApIHtcbiAgICBzZWxlY3RvciA9IGNoZWNrTGFzdFBhZ2U7XG4gIH0gZWxzZSBpZiAoIHRoaXMuaXNQYXRoU2VsZWN0b3IgKSB7XG4gICAgLy8gcGF0aCBvcHRpb24gaXMgc2VsZWN0b3Igc3RyaW5nXG4gICAgc2VsZWN0b3IgPSBwYXRoT3B0O1xuICB9XG4gIC8vIGNoZWNrIGxhc3QgcGFnZSBmb3Igc2VsZWN0b3JcbiAgLy8gYmFpbCBpZiBubyBzZWxlY3RvciBvciBub3QgZG9jdW1lbnQgcmVzcG9uc2VcbiAgaWYgKCAhc2VsZWN0b3IgfHwgIWJvZHkucXVlcnlTZWxlY3RvciApIHJldHVybjtcblxuICAvLyBjaGVjayBpZiByZXNwb25zZSBoYXMgc2VsZWN0b3JcbiAgbGV0IG5leHRFbGVtID0gYm9keS5xdWVyeVNlbGVjdG9yKCBzZWxlY3RvciApO1xuICBpZiAoICFuZXh0RWxlbSApIHRoaXMubGFzdFBhZ2VSZWFjaGVkKCBib2R5LCBwYXRoICk7XG59O1xuXG5wcm90by5sYXN0UGFnZVJlYWNoZWQgPSBmdW5jdGlvbiggYm9keSwgcGF0aCApIHtcbiAgdGhpcy5jYW5Mb2FkID0gZmFsc2U7XG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ2xhc3QnLCBudWxsLCBbIGJvZHksIHBhdGggXSApO1xufTtcblxuLy8gLS0tLS0gZXJyb3IgLS0tLS0gLy9cblxucHJvdG8ub25QYWdlRXJyb3IgPSBmdW5jdGlvbiggZXJyb3IsIHBhdGgsIHJlc3BvbnNlICkge1xuICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xuICB0aGlzLmNhbkxvYWQgPSBmYWxzZTtcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAnZXJyb3InLCBudWxsLCBbIGVycm9yLCBwYXRoLCByZXNwb25zZSBdICk7XG4gIHJldHVybiBlcnJvcjtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHByZWZpbGwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuSW5maW5pdGVTY3JvbGwuY3JlYXRlLnByZWZpbGwgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGhpcy5vcHRpb25zLnByZWZpbGwgKSByZXR1cm47XG5cbiAgbGV0IGFwcGVuZCA9IHRoaXMub3B0aW9ucy5hcHBlbmQ7XG4gIGlmICggIWFwcGVuZCApIHtcbiAgICBjb25zb2xlLmVycm9yKGBhcHBlbmQgb3B0aW9uIHJlcXVpcmVkIGZvciBwcmVmaWxsLiBTZXQgYXMgOiR7YXBwZW5kfWApO1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnVwZGF0ZU1lYXN1cmVtZW50cygpO1xuICB0aGlzLnVwZGF0ZVNjcm9sbGVyKCk7XG4gIHRoaXMuaXNQcmVmaWxsaW5nID0gdHJ1ZTtcbiAgdGhpcy5vbiggJ2FwcGVuZCcsIHRoaXMucHJlZmlsbCApO1xuICB0aGlzLm9uY2UoICdlcnJvcicsIHRoaXMuc3RvcFByZWZpbGwgKTtcbiAgdGhpcy5vbmNlKCAnbGFzdCcsIHRoaXMuc3RvcFByZWZpbGwgKTtcbiAgdGhpcy5wcmVmaWxsKCk7XG59O1xuXG5wcm90by5wcmVmaWxsID0gZnVuY3Rpb24oKSB7XG4gIGxldCBkaXN0YW5jZSA9IHRoaXMuZ2V0UHJlZmlsbERpc3RhbmNlKCk7XG4gIHRoaXMuaXNQcmVmaWxsaW5nID0gZGlzdGFuY2UgPj0gMDtcbiAgaWYgKCB0aGlzLmlzUHJlZmlsbGluZyApIHtcbiAgICB0aGlzLmxvZygncHJlZmlsbCcpO1xuICAgIHRoaXMubG9hZE5leHRQYWdlKCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5zdG9wUHJlZmlsbCgpO1xuICB9XG59O1xuXG5wcm90by5nZXRQcmVmaWxsRGlzdGFuY2UgPSBmdW5jdGlvbigpIHtcbiAgLy8gZWxlbWVudCBzY3JvbGxcbiAgaWYgKCB0aGlzLm9wdGlvbnMuZWxlbWVudFNjcm9sbCApIHtcbiAgICByZXR1cm4gdGhpcy5zY3JvbGxlci5jbGllbnRIZWlnaHQgLSB0aGlzLnNjcm9sbGVyLnNjcm9sbEhlaWdodDtcbiAgfVxuICAvLyB3aW5kb3dcbiAgcmV0dXJuIHRoaXMud2luZG93SGVpZ2h0IC0gdGhpcy5lbGVtZW50LmNsaWVudEhlaWdodDtcbn07XG5cbnByb3RvLnN0b3BQcmVmaWxsID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMubG9nKCdzdG9wUHJlZmlsbCcpO1xuICB0aGlzLm9mZiggJ2FwcGVuZCcsIHRoaXMucHJlZmlsbCApO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnJldHVybiBJbmZpbml0ZVNjcm9sbDtcblxufSApICk7XG4iLCIvLyBzY3JvbGwtd2F0Y2hcbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICByZXF1aXJlKCcuL2NvcmUnKSxcbiAgICAgICAgcmVxdWlyZSgnZml6enktdWktdXRpbHMnKSxcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICB3aW5kb3cuSW5maW5pdGVTY3JvbGwsXG4gICAgICAgIHdpbmRvdy5maXp6eVVJVXRpbHMsXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgSW5maW5pdGVTY3JvbGwsIHV0aWxzICkge1xuXG5sZXQgcHJvdG8gPSBJbmZpbml0ZVNjcm9sbC5wcm90b3R5cGU7XG5cbi8vIGRlZmF1bHQgb3B0aW9uc1xuT2JqZWN0LmFzc2lnbiggSW5maW5pdGVTY3JvbGwuZGVmYXVsdHMsIHtcbiAgc2Nyb2xsVGhyZXNob2xkOiA0MDAsXG4gIC8vIGVsZW1lbnRTY3JvbGw6IG51bGwsXG59ICk7XG5cbkluZmluaXRlU2Nyb2xsLmNyZWF0ZS5zY3JvbGxXYXRjaCA9IGZ1bmN0aW9uKCkge1xuICAvLyBldmVudHNcbiAgdGhpcy5wYWdlU2Nyb2xsSGFuZGxlciA9IHRoaXMub25QYWdlU2Nyb2xsLmJpbmQoIHRoaXMgKTtcbiAgdGhpcy5yZXNpemVIYW5kbGVyID0gdGhpcy5vblJlc2l6ZS5iaW5kKCB0aGlzICk7XG5cbiAgbGV0IHNjcm9sbFRocmVzaG9sZCA9IHRoaXMub3B0aW9ucy5zY3JvbGxUaHJlc2hvbGQ7XG4gIGxldCBpc0VuYWJsZSA9IHNjcm9sbFRocmVzaG9sZCB8fCBzY3JvbGxUaHJlc2hvbGQgPT09IDA7XG4gIGlmICggaXNFbmFibGUgKSB0aGlzLmVuYWJsZVNjcm9sbFdhdGNoKCk7XG59O1xuXG5JbmZpbml0ZVNjcm9sbC5kZXN0cm95LnNjcm9sbFdhdGNoID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZGlzYWJsZVNjcm9sbFdhdGNoKCk7XG59O1xuXG5wcm90by5lbmFibGVTY3JvbGxXYXRjaCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIHRoaXMuaXNTY3JvbGxXYXRjaGluZyApIHJldHVybjtcblxuICB0aGlzLmlzU2Nyb2xsV2F0Y2hpbmcgPSB0cnVlO1xuICB0aGlzLnVwZGF0ZU1lYXN1cmVtZW50cygpO1xuICB0aGlzLnVwZGF0ZVNjcm9sbGVyKCk7XG4gIC8vIFRPRE8gZGlzYWJsZSBhZnRlciBlcnJvcj9cbiAgdGhpcy5vbiggJ2xhc3QnLCB0aGlzLmRpc2FibGVTY3JvbGxXYXRjaCApO1xuICB0aGlzLmJpbmRTY3JvbGxXYXRjaEV2ZW50cyggdHJ1ZSApO1xufTtcblxucHJvdG8uZGlzYWJsZVNjcm9sbFdhdGNoID0gZnVuY3Rpb24oKSB7XG4gIGlmICggIXRoaXMuaXNTY3JvbGxXYXRjaGluZyApIHJldHVybjtcblxuICB0aGlzLmJpbmRTY3JvbGxXYXRjaEV2ZW50cyggZmFsc2UgKTtcbiAgZGVsZXRlIHRoaXMuaXNTY3JvbGxXYXRjaGluZztcbn07XG5cbnByb3RvLmJpbmRTY3JvbGxXYXRjaEV2ZW50cyA9IGZ1bmN0aW9uKCBpc0JpbmQgKSB7XG4gIGxldCBhZGRSZW1vdmUgPSBpc0JpbmQgPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gIHRoaXMuc2Nyb2xsZXJbIGFkZFJlbW92ZSBdKCAnc2Nyb2xsJywgdGhpcy5wYWdlU2Nyb2xsSGFuZGxlciApO1xuICB3aW5kb3dbIGFkZFJlbW92ZSBdKCAncmVzaXplJywgdGhpcy5yZXNpemVIYW5kbGVyICk7XG59O1xuXG5wcm90by5vblBhZ2VTY3JvbGwgPSBJbmZpbml0ZVNjcm9sbC50aHJvdHRsZSggZnVuY3Rpb24oKSB7XG4gIGxldCBkaXN0YW5jZSA9IHRoaXMuZ2V0Qm90dG9tRGlzdGFuY2UoKTtcbiAgaWYgKCBkaXN0YW5jZSA8PSB0aGlzLm9wdGlvbnMuc2Nyb2xsVGhyZXNob2xkICkge1xuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCgnc2Nyb2xsVGhyZXNob2xkJyk7XG4gIH1cbn0gKTtcblxucHJvdG8uZ2V0Qm90dG9tRGlzdGFuY2UgPSBmdW5jdGlvbigpIHtcbiAgbGV0IGJvdHRvbSwgc2Nyb2xsWTtcbiAgaWYgKCB0aGlzLm9wdGlvbnMuZWxlbWVudFNjcm9sbCApIHtcbiAgICBib3R0b20gPSB0aGlzLnNjcm9sbGVyLnNjcm9sbEhlaWdodDtcbiAgICBzY3JvbGxZID0gdGhpcy5zY3JvbGxlci5zY3JvbGxUb3AgKyB0aGlzLnNjcm9sbGVyLmNsaWVudEhlaWdodDtcbiAgfSBlbHNlIHtcbiAgICBib3R0b20gPSB0aGlzLnRvcCArIHRoaXMuZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgc2Nyb2xsWSA9IHdpbmRvdy5zY3JvbGxZICsgdGhpcy53aW5kb3dIZWlnaHQ7XG4gIH1cbiAgcmV0dXJuIGJvdHRvbSAtIHNjcm9sbFk7XG59O1xuXG5wcm90by5vblJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnVwZGF0ZU1lYXN1cmVtZW50cygpO1xufTtcblxudXRpbHMuZGVib3VuY2VNZXRob2QoIEluZmluaXRlU2Nyb2xsLCAnb25SZXNpemUnLCAxNTAgKTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnJldHVybiBJbmZpbml0ZVNjcm9sbDtcblxufSApICk7XG4iLCIvLyBzdGF0dXNcbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICByZXF1aXJlKCcuL2NvcmUnKSxcbiAgICAgICAgcmVxdWlyZSgnZml6enktdWktdXRpbHMnKSxcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICB3aW5kb3cuSW5maW5pdGVTY3JvbGwsXG4gICAgICAgIHdpbmRvdy5maXp6eVVJVXRpbHMsXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgSW5maW5pdGVTY3JvbGwsIHV0aWxzICkge1xuXG5sZXQgcHJvdG8gPSBJbmZpbml0ZVNjcm9sbC5wcm90b3R5cGU7XG5cbi8vIEluZmluaXRlU2Nyb2xsLmRlZmF1bHRzLnN0YXR1cyA9IG51bGw7XG5cbkluZmluaXRlU2Nyb2xsLmNyZWF0ZS5zdGF0dXMgPSBmdW5jdGlvbigpIHtcbiAgbGV0IHN0YXR1c0VsZW0gPSB1dGlscy5nZXRRdWVyeUVsZW1lbnQoIHRoaXMub3B0aW9ucy5zdGF0dXMgKTtcbiAgaWYgKCAhc3RhdHVzRWxlbSApIHJldHVybjtcblxuICAvLyBlbGVtZW50c1xuICB0aGlzLnN0YXR1c0VsZW1lbnQgPSBzdGF0dXNFbGVtO1xuICB0aGlzLnN0YXR1c0V2ZW50RWxlbWVudHMgPSB7XG4gICAgcmVxdWVzdDogc3RhdHVzRWxlbS5xdWVyeVNlbGVjdG9yKCcuaW5maW5pdGUtc2Nyb2xsLXJlcXVlc3QnKSxcbiAgICBlcnJvcjogc3RhdHVzRWxlbS5xdWVyeVNlbGVjdG9yKCcuaW5maW5pdGUtc2Nyb2xsLWVycm9yJyksXG4gICAgbGFzdDogc3RhdHVzRWxlbS5xdWVyeVNlbGVjdG9yKCcuaW5maW5pdGUtc2Nyb2xsLWxhc3QnKSxcbiAgfTtcbiAgLy8gZXZlbnRzXG4gIHRoaXMub24oICdyZXF1ZXN0JywgdGhpcy5zaG93UmVxdWVzdFN0YXR1cyApO1xuICB0aGlzLm9uKCAnZXJyb3InLCB0aGlzLnNob3dFcnJvclN0YXR1cyApO1xuICB0aGlzLm9uKCAnbGFzdCcsIHRoaXMuc2hvd0xhc3RTdGF0dXMgKTtcbiAgdGhpcy5iaW5kSGlkZVN0YXR1cygnb24nKTtcbn07XG5cbnByb3RvLmJpbmRIaWRlU3RhdHVzID0gZnVuY3Rpb24oIGJpbmRNZXRob2QgKSB7XG4gIGxldCBoaWRlRXZlbnQgPSB0aGlzLm9wdGlvbnMuYXBwZW5kID8gJ2FwcGVuZCcgOiAnbG9hZCc7XG4gIHRoaXNbIGJpbmRNZXRob2QgXSggaGlkZUV2ZW50LCB0aGlzLmhpZGVBbGxTdGF0dXMgKTtcbn07XG5cbnByb3RvLnNob3dSZXF1ZXN0U3RhdHVzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2hvd1N0YXR1cygncmVxdWVzdCcpO1xufTtcblxucHJvdG8uc2hvd0Vycm9yU3RhdHVzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2hvd1N0YXR1cygnZXJyb3InKTtcbn07XG5cbnByb3RvLnNob3dMYXN0U3RhdHVzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2hvd1N0YXR1cygnbGFzdCcpO1xuICAvLyBwcmV2ZW50IGxhc3QgdGhlbiBhcHBlbmQgZXZlbnQgcmFjZSBjb25kaXRpb24gZnJvbSBzaG93aW5nIGxhc3Qgc3RhdHVzICM3MDZcbiAgdGhpcy5iaW5kSGlkZVN0YXR1cygnb2ZmJyk7XG59O1xuXG5wcm90by5zaG93U3RhdHVzID0gZnVuY3Rpb24oIGV2ZW50TmFtZSApIHtcbiAgc2hvdyggdGhpcy5zdGF0dXNFbGVtZW50ICk7XG4gIHRoaXMuaGlkZVN0YXR1c0V2ZW50RWxlbWVudHMoKTtcbiAgbGV0IGV2ZW50RWxlbSA9IHRoaXMuc3RhdHVzRXZlbnRFbGVtZW50c1sgZXZlbnROYW1lIF07XG4gIHNob3coIGV2ZW50RWxlbSApO1xufTtcblxucHJvdG8uaGlkZUFsbFN0YXR1cyA9IGZ1bmN0aW9uKCkge1xuICBoaWRlKCB0aGlzLnN0YXR1c0VsZW1lbnQgKTtcbiAgdGhpcy5oaWRlU3RhdHVzRXZlbnRFbGVtZW50cygpO1xufTtcblxucHJvdG8uaGlkZVN0YXR1c0V2ZW50RWxlbWVudHMgPSBmdW5jdGlvbigpIHtcbiAgZm9yICggbGV0IHR5cGUgaW4gdGhpcy5zdGF0dXNFdmVudEVsZW1lbnRzICkge1xuICAgIGxldCBldmVudEVsZW0gPSB0aGlzLnN0YXR1c0V2ZW50RWxlbWVudHNbIHR5cGUgXTtcbiAgICBoaWRlKCBldmVudEVsZW0gKTtcbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmZ1bmN0aW9uIGhpZGUoIGVsZW0gKSB7XG4gIHNldERpc3BsYXkoIGVsZW0sICdub25lJyApO1xufVxuXG5mdW5jdGlvbiBzaG93KCBlbGVtICkge1xuICBzZXREaXNwbGF5KCBlbGVtLCAnYmxvY2snICk7XG59XG5cbmZ1bmN0aW9uIHNldERpc3BsYXkoIGVsZW0sIHZhbHVlICkge1xuICBpZiAoIGVsZW0gKSB7XG4gICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gdmFsdWU7XG4gIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnJldHVybiBJbmZpbml0ZVNjcm9sbDtcblxufSApICk7XG4iLCIoZnVuY3Rpb24od2luZG93LCBmYWN0b3J5KSB7XG5cdHZhciBsYXp5U2l6ZXMgPSBmYWN0b3J5KHdpbmRvdywgd2luZG93LmRvY3VtZW50LCBEYXRlKTtcblx0d2luZG93LmxhenlTaXplcyA9IGxhenlTaXplcztcblx0aWYodHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyl7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBsYXp5U2l6ZXM7XG5cdH1cbn0odHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyA/XG4gICAgICB3aW5kb3cgOiB7fSwgXG4vKipcbiAqIGltcG9ydChcIi4vdHlwZXMvZ2xvYmFsXCIpXG4gKiBAdHlwZWRlZiB7IGltcG9ydChcIi4vdHlwZXMvbGF6eXNpemVzLWNvbmZpZ1wiKS5MYXp5U2l6ZXNDb25maWdQYXJ0aWFsIH0gTGF6eVNpemVzQ29uZmlnUGFydGlhbFxuICovXG5mdW5jdGlvbiBsKHdpbmRvdywgZG9jdW1lbnQsIERhdGUpIHsgLy8gUGFzcyBpbiB0aGUgd2luZG93IERhdGUgZnVuY3Rpb24gYWxzbyBmb3IgU1NSIGJlY2F1c2UgdGhlIERhdGUgY2xhc3MgY2FuIGJlIGxvc3Rcblx0J3VzZSBzdHJpY3QnO1xuXHQvKmpzaGludCBlcW51bGw6dHJ1ZSAqL1xuXG5cdHZhciBsYXp5c2l6ZXMsXG5cdFx0LyoqXG5cdFx0ICogQHR5cGUgeyBMYXp5U2l6ZXNDb25maWdQYXJ0aWFsIH1cblx0XHQgKi9cblx0XHRsYXp5U2l6ZXNDZmc7XG5cblx0KGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHByb3A7XG5cblx0XHR2YXIgbGF6eVNpemVzRGVmYXVsdHMgPSB7XG5cdFx0XHRsYXp5Q2xhc3M6ICdsYXp5bG9hZCcsXG5cdFx0XHRsb2FkZWRDbGFzczogJ2xhenlsb2FkZWQnLFxuXHRcdFx0bG9hZGluZ0NsYXNzOiAnbGF6eWxvYWRpbmcnLFxuXHRcdFx0cHJlbG9hZENsYXNzOiAnbGF6eXByZWxvYWQnLFxuXHRcdFx0ZXJyb3JDbGFzczogJ2xhenllcnJvcicsXG5cdFx0XHQvL3N0cmljdENsYXNzOiAnbGF6eXN0cmljdCcsXG5cdFx0XHRhdXRvc2l6ZXNDbGFzczogJ2xhenlhdXRvc2l6ZXMnLFxuXHRcdFx0ZmFzdExvYWRlZENsYXNzOiAnbHMtaXMtY2FjaGVkJyxcblx0XHRcdGlmcmFtZUxvYWRNb2RlOiAwLFxuXHRcdFx0c3JjQXR0cjogJ2RhdGEtc3JjJyxcblx0XHRcdHNyY3NldEF0dHI6ICdkYXRhLXNyY3NldCcsXG5cdFx0XHRzaXplc0F0dHI6ICdkYXRhLXNpemVzJyxcblx0XHRcdC8vcHJlbG9hZEFmdGVyTG9hZDogZmFsc2UsXG5cdFx0XHRtaW5TaXplOiA0MCxcblx0XHRcdGN1c3RvbU1lZGlhOiB7fSxcblx0XHRcdGluaXQ6IHRydWUsXG5cdFx0XHRleHBGYWN0b3I6IDEuNSxcblx0XHRcdGhGYWM6IDAuOCxcblx0XHRcdGxvYWRNb2RlOiAyLFxuXHRcdFx0bG9hZEhpZGRlbjogdHJ1ZSxcblx0XHRcdHJpY1RpbWVvdXQ6IDAsXG5cdFx0XHR0aHJvdHRsZURlbGF5OiAxMjUsXG5cdFx0fTtcblxuXHRcdGxhenlTaXplc0NmZyA9IHdpbmRvdy5sYXp5U2l6ZXNDb25maWcgfHwgd2luZG93LmxhenlzaXplc0NvbmZpZyB8fCB7fTtcblxuXHRcdGZvcihwcm9wIGluIGxhenlTaXplc0RlZmF1bHRzKXtcblx0XHRcdGlmKCEocHJvcCBpbiBsYXp5U2l6ZXNDZmcpKXtcblx0XHRcdFx0bGF6eVNpemVzQ2ZnW3Byb3BdID0gbGF6eVNpemVzRGVmYXVsdHNbcHJvcF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9KSgpO1xuXG5cdGlmICghZG9jdW1lbnQgfHwgIWRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0aW5pdDogZnVuY3Rpb24gKCkge30sXG5cdFx0XHQvKipcblx0XHRcdCAqIEB0eXBlIHsgTGF6eVNpemVzQ29uZmlnUGFydGlhbCB9XG5cdFx0XHQgKi9cblx0XHRcdGNmZzogbGF6eVNpemVzQ2ZnLFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBAdHlwZSB7IHRydWUgfVxuXHRcdFx0ICovXG5cdFx0XHRub1N1cHBvcnQ6IHRydWUsXG5cdFx0fTtcblx0fVxuXG5cdHZhciBkb2NFbGVtID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG5cdHZhciBzdXBwb3J0UGljdHVyZSA9IHdpbmRvdy5IVE1MUGljdHVyZUVsZW1lbnQ7XG5cblx0dmFyIF9hZGRFdmVudExpc3RlbmVyID0gJ2FkZEV2ZW50TGlzdGVuZXInO1xuXG5cdHZhciBfZ2V0QXR0cmlidXRlID0gJ2dldEF0dHJpYnV0ZSc7XG5cblx0LyoqXG5cdCAqIFVwZGF0ZSB0byBiaW5kIHRvIHdpbmRvdyBiZWNhdXNlICd0aGlzJyBiZWNvbWVzIG51bGwgZHVyaW5nIFNTUlxuXHQgKiBidWlsZHMuXG5cdCAqL1xuXHR2YXIgYWRkRXZlbnRMaXN0ZW5lciA9IHdpbmRvd1tfYWRkRXZlbnRMaXN0ZW5lcl0uYmluZCh3aW5kb3cpO1xuXG5cdHZhciBzZXRUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQ7XG5cblx0dmFyIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgc2V0VGltZW91dDtcblxuXHR2YXIgcmVxdWVzdElkbGVDYWxsYmFjayA9IHdpbmRvdy5yZXF1ZXN0SWRsZUNhbGxiYWNrO1xuXG5cdHZhciByZWdQaWN0dXJlID0gL15waWN0dXJlJC9pO1xuXG5cdHZhciBsb2FkRXZlbnRzID0gWydsb2FkJywgJ2Vycm9yJywgJ2xhenlpbmNsdWRlZCcsICdfbGF6eWxvYWRlZCddO1xuXG5cdHZhciByZWdDbGFzc0NhY2hlID0ge307XG5cblx0dmFyIGZvckVhY2ggPSBBcnJheS5wcm90b3R5cGUuZm9yRWFjaDtcblxuXHQvKipcblx0ICogQHBhcmFtIGVsZSB7RWxlbWVudH1cblx0ICogQHBhcmFtIGNscyB7c3RyaW5nfVxuXHQgKi9cblx0dmFyIGhhc0NsYXNzID0gZnVuY3Rpb24oZWxlLCBjbHMpIHtcblx0XHRpZighcmVnQ2xhc3NDYWNoZVtjbHNdKXtcblx0XHRcdHJlZ0NsYXNzQ2FjaGVbY2xzXSA9IG5ldyBSZWdFeHAoJyhcXFxcc3xeKScrY2xzKycoXFxcXHN8JCknKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlZ0NsYXNzQ2FjaGVbY2xzXS50ZXN0KGVsZVtfZ2V0QXR0cmlidXRlXSgnY2xhc3MnKSB8fCAnJykgJiYgcmVnQ2xhc3NDYWNoZVtjbHNdO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBAcGFyYW0gZWxlIHtFbGVtZW50fVxuXHQgKiBAcGFyYW0gY2xzIHtzdHJpbmd9XG5cdCAqL1xuXHR2YXIgYWRkQ2xhc3MgPSBmdW5jdGlvbihlbGUsIGNscykge1xuXHRcdGlmICghaGFzQ2xhc3MoZWxlLCBjbHMpKXtcblx0XHRcdGVsZS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgKGVsZVtfZ2V0QXR0cmlidXRlXSgnY2xhc3MnKSB8fCAnJykudHJpbSgpICsgJyAnICsgY2xzKTtcblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBlbGUge0VsZW1lbnR9XG5cdCAqIEBwYXJhbSBjbHMge3N0cmluZ31cblx0ICovXG5cdHZhciByZW1vdmVDbGFzcyA9IGZ1bmN0aW9uKGVsZSwgY2xzKSB7XG5cdFx0dmFyIHJlZztcblx0XHRpZiAoKHJlZyA9IGhhc0NsYXNzKGVsZSxjbHMpKSkge1xuXHRcdFx0ZWxlLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAoZWxlW19nZXRBdHRyaWJ1dGVdKCdjbGFzcycpIHx8ICcnKS5yZXBsYWNlKHJlZywgJyAnKSk7XG5cdFx0fVxuXHR9O1xuXG5cdHZhciBhZGRSZW1vdmVMb2FkRXZlbnRzID0gZnVuY3Rpb24oZG9tLCBmbiwgYWRkKXtcblx0XHR2YXIgYWN0aW9uID0gYWRkID8gX2FkZEV2ZW50TGlzdGVuZXIgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG5cdFx0aWYoYWRkKXtcblx0XHRcdGFkZFJlbW92ZUxvYWRFdmVudHMoZG9tLCBmbik7XG5cdFx0fVxuXHRcdGxvYWRFdmVudHMuZm9yRWFjaChmdW5jdGlvbihldnQpe1xuXHRcdFx0ZG9tW2FjdGlvbl0oZXZ0LCBmbik7XG5cdFx0fSk7XG5cdH07XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBlbGVtIHsgRWxlbWVudCB9XG5cdCAqIEBwYXJhbSBuYW1lIHsgc3RyaW5nIH1cblx0ICogQHBhcmFtIGRldGFpbCB7IGFueSB9XG5cdCAqIEBwYXJhbSBub0J1YmJsZXMgeyBib29sZWFuIH1cblx0ICogQHBhcmFtIG5vQ2FuY2VsYWJsZSB7IGJvb2xlYW4gfVxuXHQgKiBAcmV0dXJucyB7IEN1c3RvbUV2ZW50IH1cblx0ICovXG5cdHZhciB0cmlnZ2VyRXZlbnQgPSBmdW5jdGlvbihlbGVtLCBuYW1lLCBkZXRhaWwsIG5vQnViYmxlcywgbm9DYW5jZWxhYmxlKXtcblx0XHR2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcblxuXHRcdGlmKCFkZXRhaWwpe1xuXHRcdFx0ZGV0YWlsID0ge307XG5cdFx0fVxuXG5cdFx0ZGV0YWlsLmluc3RhbmNlID0gbGF6eXNpemVzO1xuXG5cdFx0ZXZlbnQuaW5pdEV2ZW50KG5hbWUsICFub0J1YmJsZXMsICFub0NhbmNlbGFibGUpO1xuXG5cdFx0ZXZlbnQuZGV0YWlsID0gZGV0YWlsO1xuXG5cdFx0ZWxlbS5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcblx0XHRyZXR1cm4gZXZlbnQ7XG5cdH07XG5cblx0dmFyIHVwZGF0ZVBvbHlmaWxsID0gZnVuY3Rpb24gKGVsLCBmdWxsKXtcblx0XHR2YXIgcG9seWZpbGw7XG5cdFx0aWYoICFzdXBwb3J0UGljdHVyZSAmJiAoIHBvbHlmaWxsID0gKHdpbmRvdy5waWN0dXJlZmlsbCB8fCBsYXp5U2l6ZXNDZmcucGYpICkgKXtcblx0XHRcdGlmKGZ1bGwgJiYgZnVsbC5zcmMgJiYgIWVsW19nZXRBdHRyaWJ1dGVdKCdzcmNzZXQnKSl7XG5cdFx0XHRcdGVsLnNldEF0dHJpYnV0ZSgnc3Jjc2V0JywgZnVsbC5zcmMpO1xuXHRcdFx0fVxuXHRcdFx0cG9seWZpbGwoe3JlZXZhbHVhdGU6IHRydWUsIGVsZW1lbnRzOiBbZWxdfSk7XG5cdFx0fSBlbHNlIGlmKGZ1bGwgJiYgZnVsbC5zcmMpe1xuXHRcdFx0ZWwuc3JjID0gZnVsbC5zcmM7XG5cdFx0fVxuXHR9O1xuXG5cdHZhciBnZXRDU1MgPSBmdW5jdGlvbiAoZWxlbSwgc3R5bGUpe1xuXHRcdHJldHVybiAoZ2V0Q29tcHV0ZWRTdHlsZShlbGVtLCBudWxsKSB8fCB7fSlbc3R5bGVdO1xuXHR9O1xuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gZWxlbSB7IEVsZW1lbnQgfVxuXHQgKiBAcGFyYW0gcGFyZW50IHsgRWxlbWVudCB9XG5cdCAqIEBwYXJhbSBbd2lkdGhdIHtudW1iZXJ9XG5cdCAqIEByZXR1cm5zIHtudW1iZXJ9XG5cdCAqL1xuXHR2YXIgZ2V0V2lkdGggPSBmdW5jdGlvbihlbGVtLCBwYXJlbnQsIHdpZHRoKXtcblx0XHR3aWR0aCA9IHdpZHRoIHx8IGVsZW0ub2Zmc2V0V2lkdGg7XG5cblx0XHR3aGlsZSh3aWR0aCA8IGxhenlTaXplc0NmZy5taW5TaXplICYmIHBhcmVudCAmJiAhZWxlbS5fbGF6eXNpemVzV2lkdGgpe1xuXHRcdFx0d2lkdGggPSAgcGFyZW50Lm9mZnNldFdpZHRoO1xuXHRcdFx0cGFyZW50ID0gcGFyZW50LnBhcmVudE5vZGU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHdpZHRoO1xuXHR9O1xuXG5cdHZhciByQUYgPSAoZnVuY3Rpb24oKXtcblx0XHR2YXIgcnVubmluZywgd2FpdGluZztcblx0XHR2YXIgZmlyc3RGbnMgPSBbXTtcblx0XHR2YXIgc2Vjb25kRm5zID0gW107XG5cdFx0dmFyIGZucyA9IGZpcnN0Rm5zO1xuXG5cdFx0dmFyIHJ1biA9IGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgcnVuRm5zID0gZm5zO1xuXG5cdFx0XHRmbnMgPSBmaXJzdEZucy5sZW5ndGggPyBzZWNvbmRGbnMgOiBmaXJzdEZucztcblxuXHRcdFx0cnVubmluZyA9IHRydWU7XG5cdFx0XHR3YWl0aW5nID0gZmFsc2U7XG5cblx0XHRcdHdoaWxlKHJ1bkZucy5sZW5ndGgpe1xuXHRcdFx0XHRydW5GbnMuc2hpZnQoKSgpO1xuXHRcdFx0fVxuXG5cdFx0XHRydW5uaW5nID0gZmFsc2U7XG5cdFx0fTtcblxuXHRcdHZhciByYWZCYXRjaCA9IGZ1bmN0aW9uKGZuLCBxdWV1ZSl7XG5cdFx0XHRpZihydW5uaW5nICYmICFxdWV1ZSl7XG5cdFx0XHRcdGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmbnMucHVzaChmbik7XG5cblx0XHRcdFx0aWYoIXdhaXRpbmcpe1xuXHRcdFx0XHRcdHdhaXRpbmcgPSB0cnVlO1xuXHRcdFx0XHRcdChkb2N1bWVudC5oaWRkZW4gPyBzZXRUaW1lb3V0IDogcmVxdWVzdEFuaW1hdGlvbkZyYW1lKShydW4pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHJhZkJhdGNoLl9sc0ZsdXNoID0gcnVuO1xuXG5cdFx0cmV0dXJuIHJhZkJhdGNoO1xuXHR9KSgpO1xuXG5cdHZhciByQUZJdCA9IGZ1bmN0aW9uKGZuLCBzaW1wbGUpe1xuXHRcdHJldHVybiBzaW1wbGUgP1xuXHRcdFx0ZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJBRihmbik7XG5cdFx0XHR9IDpcblx0XHRcdGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHRcdFx0dmFyIGFyZ3MgPSBhcmd1bWVudHM7XG5cdFx0XHRcdHJBRihmdW5jdGlvbigpe1xuXHRcdFx0XHRcdGZuLmFwcGx5KHRoYXQsIGFyZ3MpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHQ7XG5cdH07XG5cblx0dmFyIHRocm90dGxlID0gZnVuY3Rpb24oZm4pe1xuXHRcdHZhciBydW5uaW5nO1xuXHRcdHZhciBsYXN0VGltZSA9IDA7XG5cdFx0dmFyIGdEZWxheSA9IGxhenlTaXplc0NmZy50aHJvdHRsZURlbGF5O1xuXHRcdHZhciBySUNUaW1lb3V0ID0gbGF6eVNpemVzQ2ZnLnJpY1RpbWVvdXQ7XG5cdFx0dmFyIHJ1biA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRydW5uaW5nID0gZmFsc2U7XG5cdFx0XHRsYXN0VGltZSA9IERhdGUubm93KCk7XG5cdFx0XHRmbigpO1xuXHRcdH07XG5cdFx0dmFyIGlkbGVDYWxsYmFjayA9IHJlcXVlc3RJZGxlQ2FsbGJhY2sgJiYgcklDVGltZW91dCA+IDQ5ID9cblx0XHRcdGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHJlcXVlc3RJZGxlQ2FsbGJhY2socnVuLCB7dGltZW91dDogcklDVGltZW91dH0pO1xuXG5cdFx0XHRcdGlmKHJJQ1RpbWVvdXQgIT09IGxhenlTaXplc0NmZy5yaWNUaW1lb3V0KXtcblx0XHRcdFx0XHRySUNUaW1lb3V0ID0gbGF6eVNpemVzQ2ZnLnJpY1RpbWVvdXQ7XG5cdFx0XHRcdH1cblx0XHRcdH0gOlxuXHRcdFx0ckFGSXQoZnVuY3Rpb24oKXtcblx0XHRcdFx0c2V0VGltZW91dChydW4pO1xuXHRcdFx0fSwgdHJ1ZSlcblx0XHQ7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24oaXNQcmlvcml0eSl7XG5cdFx0XHR2YXIgZGVsYXk7XG5cblx0XHRcdGlmKChpc1ByaW9yaXR5ID0gaXNQcmlvcml0eSA9PT0gdHJ1ZSkpe1xuXHRcdFx0XHRySUNUaW1lb3V0ID0gMzM7XG5cdFx0XHR9XG5cblx0XHRcdGlmKHJ1bm5pbmcpe1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHJ1bm5pbmcgPSAgdHJ1ZTtcblxuXHRcdFx0ZGVsYXkgPSBnRGVsYXkgLSAoRGF0ZS5ub3coKSAtIGxhc3RUaW1lKTtcblxuXHRcdFx0aWYoZGVsYXkgPCAwKXtcblx0XHRcdFx0ZGVsYXkgPSAwO1xuXHRcdFx0fVxuXG5cdFx0XHRpZihpc1ByaW9yaXR5IHx8IGRlbGF5IDwgOSl7XG5cdFx0XHRcdGlkbGVDYWxsYmFjaygpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2V0VGltZW91dChpZGxlQ2FsbGJhY2ssIGRlbGF5KTtcblx0XHRcdH1cblx0XHR9O1xuXHR9O1xuXG5cdC8vYmFzZWQgb24gaHR0cDovL21vZGVybmphdmFzY3JpcHQuYmxvZ3Nwb3QuZGUvMjAxMy8wOC9idWlsZGluZy1iZXR0ZXItZGVib3VuY2UuaHRtbFxuXHR2YXIgZGVib3VuY2UgPSBmdW5jdGlvbihmdW5jKSB7XG5cdFx0dmFyIHRpbWVvdXQsIHRpbWVzdGFtcDtcblx0XHR2YXIgd2FpdCA9IDk5O1xuXHRcdHZhciBydW4gPSBmdW5jdGlvbigpe1xuXHRcdFx0dGltZW91dCA9IG51bGw7XG5cdFx0XHRmdW5jKCk7XG5cdFx0fTtcblx0XHR2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBsYXN0ID0gRGF0ZS5ub3coKSAtIHRpbWVzdGFtcDtcblxuXHRcdFx0aWYgKGxhc3QgPCB3YWl0KSB7XG5cdFx0XHRcdHNldFRpbWVvdXQobGF0ZXIsIHdhaXQgLSBsYXN0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdChyZXF1ZXN0SWRsZUNhbGxiYWNrIHx8IHJ1bikocnVuKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGltZXN0YW1wID0gRGF0ZS5ub3coKTtcblxuXHRcdFx0aWYgKCF0aW1lb3V0KSB7XG5cdFx0XHRcdHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcblx0XHRcdH1cblx0XHR9O1xuXHR9O1xuXG5cdHZhciBsb2FkZXIgPSAoZnVuY3Rpb24oKXtcblx0XHR2YXIgcHJlbG9hZEVsZW1zLCBpc0NvbXBsZXRlZCwgcmVzZXRQcmVsb2FkaW5nVGltZXIsIGxvYWRNb2RlLCBzdGFydGVkO1xuXG5cdFx0dmFyIGVMdlcsIGVsdkgsIGVMdG9wLCBlTGxlZnQsIGVMcmlnaHQsIGVMYm90dG9tLCBpc0JvZHlIaWRkZW47XG5cblx0XHR2YXIgcmVnSW1nID0gL15pbWckL2k7XG5cdFx0dmFyIHJlZ0lmcmFtZSA9IC9eaWZyYW1lJC9pO1xuXG5cdFx0dmFyIHN1cHBvcnRTY3JvbGwgPSAoJ29uc2Nyb2xsJyBpbiB3aW5kb3cpICYmICEoLyhnbGV8aW5nKWJvdC8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSk7XG5cblx0XHR2YXIgc2hyaW5rRXhwYW5kID0gMDtcblx0XHR2YXIgY3VycmVudEV4cGFuZCA9IDA7XG5cblx0XHR2YXIgaXNMb2FkaW5nID0gMDtcblx0XHR2YXIgbG93UnVucyA9IC0xO1xuXG5cdFx0dmFyIHJlc2V0UHJlbG9hZGluZyA9IGZ1bmN0aW9uKGUpe1xuXHRcdFx0aXNMb2FkaW5nLS07XG5cdFx0XHRpZighZSB8fCBpc0xvYWRpbmcgPCAwIHx8ICFlLnRhcmdldCl7XG5cdFx0XHRcdGlzTG9hZGluZyA9IDA7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciBpc1Zpc2libGUgPSBmdW5jdGlvbiAoZWxlbSkge1xuXHRcdFx0aWYgKGlzQm9keUhpZGRlbiA9PSBudWxsKSB7XG5cdFx0XHRcdGlzQm9keUhpZGRlbiA9IGdldENTUyhkb2N1bWVudC5ib2R5LCAndmlzaWJpbGl0eScpID09ICdoaWRkZW4nO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gaXNCb2R5SGlkZGVuIHx8ICEoZ2V0Q1NTKGVsZW0ucGFyZW50Tm9kZSwgJ3Zpc2liaWxpdHknKSA9PSAnaGlkZGVuJyAmJiBnZXRDU1MoZWxlbSwgJ3Zpc2liaWxpdHknKSA9PSAnaGlkZGVuJyk7XG5cdFx0fTtcblxuXHRcdHZhciBpc05lc3RlZFZpc2libGUgPSBmdW5jdGlvbihlbGVtLCBlbGVtRXhwYW5kKXtcblx0XHRcdHZhciBvdXRlclJlY3Q7XG5cdFx0XHR2YXIgcGFyZW50ID0gZWxlbTtcblx0XHRcdHZhciB2aXNpYmxlID0gaXNWaXNpYmxlKGVsZW0pO1xuXG5cdFx0XHRlTHRvcCAtPSBlbGVtRXhwYW5kO1xuXHRcdFx0ZUxib3R0b20gKz0gZWxlbUV4cGFuZDtcblx0XHRcdGVMbGVmdCAtPSBlbGVtRXhwYW5kO1xuXHRcdFx0ZUxyaWdodCArPSBlbGVtRXhwYW5kO1xuXG5cdFx0XHR3aGlsZSh2aXNpYmxlICYmIChwYXJlbnQgPSBwYXJlbnQub2Zmc2V0UGFyZW50KSAmJiBwYXJlbnQgIT0gZG9jdW1lbnQuYm9keSAmJiBwYXJlbnQgIT0gZG9jRWxlbSl7XG5cdFx0XHRcdHZpc2libGUgPSAoKGdldENTUyhwYXJlbnQsICdvcGFjaXR5JykgfHwgMSkgPiAwKTtcblxuXHRcdFx0XHRpZih2aXNpYmxlICYmIGdldENTUyhwYXJlbnQsICdvdmVyZmxvdycpICE9ICd2aXNpYmxlJyl7XG5cdFx0XHRcdFx0b3V0ZXJSZWN0ID0gcGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0XHRcdHZpc2libGUgPSBlTHJpZ2h0ID4gb3V0ZXJSZWN0LmxlZnQgJiZcblx0XHRcdFx0XHRcdGVMbGVmdCA8IG91dGVyUmVjdC5yaWdodCAmJlxuXHRcdFx0XHRcdFx0ZUxib3R0b20gPiBvdXRlclJlY3QudG9wIC0gMSAmJlxuXHRcdFx0XHRcdFx0ZUx0b3AgPCBvdXRlclJlY3QuYm90dG9tICsgMVxuXHRcdFx0XHRcdDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdmlzaWJsZTtcblx0XHR9O1xuXG5cdFx0dmFyIGNoZWNrRWxlbWVudHMgPSBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBlTGxlbiwgaSwgcmVjdCwgYXV0b0xvYWRFbGVtLCBsb2FkZWRTb21ldGhpbmcsIGVsZW1FeHBhbmQsIGVsZW1OZWdhdGl2ZUV4cGFuZCwgZWxlbUV4cGFuZFZhbCxcblx0XHRcdFx0YmVmb3JlRXhwYW5kVmFsLCBkZWZhdWx0RXhwYW5kLCBwcmVsb2FkRXhwYW5kLCBoRmFjO1xuXHRcdFx0dmFyIGxhenlsb2FkRWxlbXMgPSBsYXp5c2l6ZXMuZWxlbWVudHM7XG5cblx0XHRcdGlmKChsb2FkTW9kZSA9IGxhenlTaXplc0NmZy5sb2FkTW9kZSkgJiYgaXNMb2FkaW5nIDwgOCAmJiAoZUxsZW4gPSBsYXp5bG9hZEVsZW1zLmxlbmd0aCkpe1xuXG5cdFx0XHRcdGkgPSAwO1xuXG5cdFx0XHRcdGxvd1J1bnMrKztcblxuXHRcdFx0XHRmb3IoOyBpIDwgZUxsZW47IGkrKyl7XG5cblx0XHRcdFx0XHRpZighbGF6eWxvYWRFbGVtc1tpXSB8fCBsYXp5bG9hZEVsZW1zW2ldLl9sYXp5UmFjZSl7Y29udGludWU7fVxuXG5cdFx0XHRcdFx0aWYoIXN1cHBvcnRTY3JvbGwgfHwgKGxhenlzaXplcy5wcmVtYXR1cmVVbnZlaWwgJiYgbGF6eXNpemVzLnByZW1hdHVyZVVudmVpbChsYXp5bG9hZEVsZW1zW2ldKSkpe3VudmVpbEVsZW1lbnQobGF6eWxvYWRFbGVtc1tpXSk7Y29udGludWU7fVxuXG5cdFx0XHRcdFx0aWYoIShlbGVtRXhwYW5kVmFsID0gbGF6eWxvYWRFbGVtc1tpXVtfZ2V0QXR0cmlidXRlXSgnZGF0YS1leHBhbmQnKSkgfHwgIShlbGVtRXhwYW5kID0gZWxlbUV4cGFuZFZhbCAqIDEpKXtcblx0XHRcdFx0XHRcdGVsZW1FeHBhbmQgPSBjdXJyZW50RXhwYW5kO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICghZGVmYXVsdEV4cGFuZCkge1xuXHRcdFx0XHRcdFx0ZGVmYXVsdEV4cGFuZCA9ICghbGF6eVNpemVzQ2ZnLmV4cGFuZCB8fCBsYXp5U2l6ZXNDZmcuZXhwYW5kIDwgMSkgP1xuXHRcdFx0XHRcdFx0XHRkb2NFbGVtLmNsaWVudEhlaWdodCA+IDUwMCAmJiBkb2NFbGVtLmNsaWVudFdpZHRoID4gNTAwID8gNTAwIDogMzcwIDpcblx0XHRcdFx0XHRcdFx0bGF6eVNpemVzQ2ZnLmV4cGFuZDtcblxuXHRcdFx0XHRcdFx0bGF6eXNpemVzLl9kZWZFeCA9IGRlZmF1bHRFeHBhbmQ7XG5cblx0XHRcdFx0XHRcdHByZWxvYWRFeHBhbmQgPSBkZWZhdWx0RXhwYW5kICogbGF6eVNpemVzQ2ZnLmV4cEZhY3Rvcjtcblx0XHRcdFx0XHRcdGhGYWMgPSBsYXp5U2l6ZXNDZmcuaEZhYztcblx0XHRcdFx0XHRcdGlzQm9keUhpZGRlbiA9IG51bGw7XG5cblx0XHRcdFx0XHRcdGlmKGN1cnJlbnRFeHBhbmQgPCBwcmVsb2FkRXhwYW5kICYmIGlzTG9hZGluZyA8IDEgJiYgbG93UnVucyA+IDIgJiYgbG9hZE1vZGUgPiAyICYmICFkb2N1bWVudC5oaWRkZW4pe1xuXHRcdFx0XHRcdFx0XHRjdXJyZW50RXhwYW5kID0gcHJlbG9hZEV4cGFuZDtcblx0XHRcdFx0XHRcdFx0bG93UnVucyA9IDA7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYobG9hZE1vZGUgPiAxICYmIGxvd1J1bnMgPiAxICYmIGlzTG9hZGluZyA8IDYpe1xuXHRcdFx0XHRcdFx0XHRjdXJyZW50RXhwYW5kID0gZGVmYXVsdEV4cGFuZDtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRFeHBhbmQgPSBzaHJpbmtFeHBhbmQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYoYmVmb3JlRXhwYW5kVmFsICE9PSBlbGVtRXhwYW5kKXtcblx0XHRcdFx0XHRcdGVMdlcgPSBpbm5lcldpZHRoICsgKGVsZW1FeHBhbmQgKiBoRmFjKTtcblx0XHRcdFx0XHRcdGVsdkggPSBpbm5lckhlaWdodCArIGVsZW1FeHBhbmQ7XG5cdFx0XHRcdFx0XHRlbGVtTmVnYXRpdmVFeHBhbmQgPSBlbGVtRXhwYW5kICogLTE7XG5cdFx0XHRcdFx0XHRiZWZvcmVFeHBhbmRWYWwgPSBlbGVtRXhwYW5kO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJlY3QgPSBsYXp5bG9hZEVsZW1zW2ldLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG5cdFx0XHRcdFx0aWYgKChlTGJvdHRvbSA9IHJlY3QuYm90dG9tKSA+PSBlbGVtTmVnYXRpdmVFeHBhbmQgJiZcblx0XHRcdFx0XHRcdChlTHRvcCA9IHJlY3QudG9wKSA8PSBlbHZIICYmXG5cdFx0XHRcdFx0XHQoZUxyaWdodCA9IHJlY3QucmlnaHQpID49IGVsZW1OZWdhdGl2ZUV4cGFuZCAqIGhGYWMgJiZcblx0XHRcdFx0XHRcdChlTGxlZnQgPSByZWN0LmxlZnQpIDw9IGVMdlcgJiZcblx0XHRcdFx0XHRcdChlTGJvdHRvbSB8fCBlTHJpZ2h0IHx8IGVMbGVmdCB8fCBlTHRvcCkgJiZcblx0XHRcdFx0XHRcdChsYXp5U2l6ZXNDZmcubG9hZEhpZGRlbiB8fCBpc1Zpc2libGUobGF6eWxvYWRFbGVtc1tpXSkpICYmXG5cdFx0XHRcdFx0XHQoKGlzQ29tcGxldGVkICYmIGlzTG9hZGluZyA8IDMgJiYgIWVsZW1FeHBhbmRWYWwgJiYgKGxvYWRNb2RlIDwgMyB8fCBsb3dSdW5zIDwgNCkpIHx8IGlzTmVzdGVkVmlzaWJsZShsYXp5bG9hZEVsZW1zW2ldLCBlbGVtRXhwYW5kKSkpe1xuXHRcdFx0XHRcdFx0dW52ZWlsRWxlbWVudChsYXp5bG9hZEVsZW1zW2ldKTtcblx0XHRcdFx0XHRcdGxvYWRlZFNvbWV0aGluZyA9IHRydWU7XG5cdFx0XHRcdFx0XHRpZihpc0xvYWRpbmcgPiA5KXticmVhazt9XG5cdFx0XHRcdFx0fSBlbHNlIGlmKCFsb2FkZWRTb21ldGhpbmcgJiYgaXNDb21wbGV0ZWQgJiYgIWF1dG9Mb2FkRWxlbSAmJlxuXHRcdFx0XHRcdFx0aXNMb2FkaW5nIDwgNCAmJiBsb3dSdW5zIDwgNCAmJiBsb2FkTW9kZSA+IDIgJiZcblx0XHRcdFx0XHRcdChwcmVsb2FkRWxlbXNbMF0gfHwgbGF6eVNpemVzQ2ZnLnByZWxvYWRBZnRlckxvYWQpICYmXG5cdFx0XHRcdFx0XHQocHJlbG9hZEVsZW1zWzBdIHx8ICghZWxlbUV4cGFuZFZhbCAmJiAoKGVMYm90dG9tIHx8IGVMcmlnaHQgfHwgZUxsZWZ0IHx8IGVMdG9wKSB8fCBsYXp5bG9hZEVsZW1zW2ldW19nZXRBdHRyaWJ1dGVdKGxhenlTaXplc0NmZy5zaXplc0F0dHIpICE9ICdhdXRvJykpKSl7XG5cdFx0XHRcdFx0XHRhdXRvTG9hZEVsZW0gPSBwcmVsb2FkRWxlbXNbMF0gfHwgbGF6eWxvYWRFbGVtc1tpXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihhdXRvTG9hZEVsZW0gJiYgIWxvYWRlZFNvbWV0aGluZyl7XG5cdFx0XHRcdFx0dW52ZWlsRWxlbWVudChhdXRvTG9hZEVsZW0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciB0aHJvdHRsZWRDaGVja0VsZW1lbnRzID0gdGhyb3R0bGUoY2hlY2tFbGVtZW50cyk7XG5cblx0XHR2YXIgc3dpdGNoTG9hZGluZ0NsYXNzID0gZnVuY3Rpb24oZSl7XG5cdFx0XHR2YXIgZWxlbSA9IGUudGFyZ2V0O1xuXG5cdFx0XHRpZiAoZWxlbS5fbGF6eUNhY2hlKSB7XG5cdFx0XHRcdGRlbGV0ZSBlbGVtLl9sYXp5Q2FjaGU7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0cmVzZXRQcmVsb2FkaW5nKGUpO1xuXHRcdFx0YWRkQ2xhc3MoZWxlbSwgbGF6eVNpemVzQ2ZnLmxvYWRlZENsYXNzKTtcblx0XHRcdHJlbW92ZUNsYXNzKGVsZW0sIGxhenlTaXplc0NmZy5sb2FkaW5nQ2xhc3MpO1xuXHRcdFx0YWRkUmVtb3ZlTG9hZEV2ZW50cyhlbGVtLCByYWZTd2l0Y2hMb2FkaW5nQ2xhc3MpO1xuXHRcdFx0dHJpZ2dlckV2ZW50KGVsZW0sICdsYXp5bG9hZGVkJyk7XG5cdFx0fTtcblx0XHR2YXIgcmFmZWRTd2l0Y2hMb2FkaW5nQ2xhc3MgPSByQUZJdChzd2l0Y2hMb2FkaW5nQ2xhc3MpO1xuXHRcdHZhciByYWZTd2l0Y2hMb2FkaW5nQ2xhc3MgPSBmdW5jdGlvbihlKXtcblx0XHRcdHJhZmVkU3dpdGNoTG9hZGluZ0NsYXNzKHt0YXJnZXQ6IGUudGFyZ2V0fSk7XG5cdFx0fTtcblxuXHRcdHZhciBjaGFuZ2VJZnJhbWVTcmMgPSBmdW5jdGlvbihlbGVtLCBzcmMpe1xuXHRcdFx0dmFyIGxvYWRNb2RlID0gZWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbG9hZC1tb2RlJykgfHwgbGF6eVNpemVzQ2ZnLmlmcmFtZUxvYWRNb2RlO1xuXG5cdFx0XHQvLyBsb2FkTW9kZSBjYW4gYmUgYWxzbyBhIHN0cmluZyFcblx0XHRcdGlmIChsb2FkTW9kZSA9PSAwKSB7XG5cdFx0XHRcdGVsZW0uY29udGVudFdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKHNyYyk7XG5cdFx0XHR9IGVsc2UgaWYgKGxvYWRNb2RlID09IDEpIHtcblx0XHRcdFx0ZWxlbS5zcmMgPSBzcmM7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciBoYW5kbGVTb3VyY2VzID0gZnVuY3Rpb24oc291cmNlKXtcblx0XHRcdHZhciBjdXN0b21NZWRpYTtcblxuXHRcdFx0dmFyIHNvdXJjZVNyY3NldCA9IHNvdXJjZVtfZ2V0QXR0cmlidXRlXShsYXp5U2l6ZXNDZmcuc3Jjc2V0QXR0cik7XG5cblx0XHRcdGlmKCAoY3VzdG9tTWVkaWEgPSBsYXp5U2l6ZXNDZmcuY3VzdG9tTWVkaWFbc291cmNlW19nZXRBdHRyaWJ1dGVdKCdkYXRhLW1lZGlhJykgfHwgc291cmNlW19nZXRBdHRyaWJ1dGVdKCdtZWRpYScpXSkgKXtcblx0XHRcdFx0c291cmNlLnNldEF0dHJpYnV0ZSgnbWVkaWEnLCBjdXN0b21NZWRpYSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmKHNvdXJjZVNyY3NldCl7XG5cdFx0XHRcdHNvdXJjZS5zZXRBdHRyaWJ1dGUoJ3NyY3NldCcsIHNvdXJjZVNyY3NldCk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciBsYXp5VW52ZWlsID0gckFGSXQoZnVuY3Rpb24gKGVsZW0sIGRldGFpbCwgaXNBdXRvLCBzaXplcywgaXNJbWcpe1xuXHRcdFx0dmFyIHNyYywgc3Jjc2V0LCBwYXJlbnQsIGlzUGljdHVyZSwgZXZlbnQsIGZpcmVzTG9hZDtcblxuXHRcdFx0aWYoIShldmVudCA9IHRyaWdnZXJFdmVudChlbGVtLCAnbGF6eWJlZm9yZXVudmVpbCcsIGRldGFpbCkpLmRlZmF1bHRQcmV2ZW50ZWQpe1xuXG5cdFx0XHRcdGlmKHNpemVzKXtcblx0XHRcdFx0XHRpZihpc0F1dG8pe1xuXHRcdFx0XHRcdFx0YWRkQ2xhc3MoZWxlbSwgbGF6eVNpemVzQ2ZnLmF1dG9zaXplc0NsYXNzKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZWxlbS5zZXRBdHRyaWJ1dGUoJ3NpemVzJywgc2l6ZXMpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHNyY3NldCA9IGVsZW1bX2dldEF0dHJpYnV0ZV0obGF6eVNpemVzQ2ZnLnNyY3NldEF0dHIpO1xuXHRcdFx0XHRzcmMgPSBlbGVtW19nZXRBdHRyaWJ1dGVdKGxhenlTaXplc0NmZy5zcmNBdHRyKTtcblxuXHRcdFx0XHRpZihpc0ltZykge1xuXHRcdFx0XHRcdHBhcmVudCA9IGVsZW0ucGFyZW50Tm9kZTtcblx0XHRcdFx0XHRpc1BpY3R1cmUgPSBwYXJlbnQgJiYgcmVnUGljdHVyZS50ZXN0KHBhcmVudC5ub2RlTmFtZSB8fCAnJyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmaXJlc0xvYWQgPSBkZXRhaWwuZmlyZXNMb2FkIHx8ICgoJ3NyYycgaW4gZWxlbSkgJiYgKHNyY3NldCB8fCBzcmMgfHwgaXNQaWN0dXJlKSk7XG5cblx0XHRcdFx0ZXZlbnQgPSB7dGFyZ2V0OiBlbGVtfTtcblxuXHRcdFx0XHRhZGRDbGFzcyhlbGVtLCBsYXp5U2l6ZXNDZmcubG9hZGluZ0NsYXNzKTtcblxuXHRcdFx0XHRpZihmaXJlc0xvYWQpe1xuXHRcdFx0XHRcdGNsZWFyVGltZW91dChyZXNldFByZWxvYWRpbmdUaW1lcik7XG5cdFx0XHRcdFx0cmVzZXRQcmVsb2FkaW5nVGltZXIgPSBzZXRUaW1lb3V0KHJlc2V0UHJlbG9hZGluZywgMjUwMCk7XG5cdFx0XHRcdFx0YWRkUmVtb3ZlTG9hZEV2ZW50cyhlbGVtLCByYWZTd2l0Y2hMb2FkaW5nQ2xhc3MsIHRydWUpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoaXNQaWN0dXJlKXtcblx0XHRcdFx0XHRmb3JFYWNoLmNhbGwocGFyZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzb3VyY2UnKSwgaGFuZGxlU291cmNlcyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihzcmNzZXQpe1xuXHRcdFx0XHRcdGVsZW0uc2V0QXR0cmlidXRlKCdzcmNzZXQnLCBzcmNzZXQpO1xuXHRcdFx0XHR9IGVsc2UgaWYoc3JjICYmICFpc1BpY3R1cmUpe1xuXHRcdFx0XHRcdGlmKHJlZ0lmcmFtZS50ZXN0KGVsZW0ubm9kZU5hbWUpKXtcblx0XHRcdFx0XHRcdGNoYW5nZUlmcmFtZVNyYyhlbGVtLCBzcmMpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRlbGVtLnNyYyA9IHNyYztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihpc0ltZyAmJiAoc3Jjc2V0IHx8IGlzUGljdHVyZSkpe1xuXHRcdFx0XHRcdHVwZGF0ZVBvbHlmaWxsKGVsZW0sIHtzcmM6IHNyY30pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmKGVsZW0uX2xhenlSYWNlKXtcblx0XHRcdFx0ZGVsZXRlIGVsZW0uX2xhenlSYWNlO1xuXHRcdFx0fVxuXHRcdFx0cmVtb3ZlQ2xhc3MoZWxlbSwgbGF6eVNpemVzQ2ZnLmxhenlDbGFzcyk7XG5cblx0XHRcdHJBRihmdW5jdGlvbigpe1xuXHRcdFx0XHQvLyBQYXJ0IG9mIHRoaXMgY2FuIGJlIHJlbW92ZWQgYXMgc29vbiBhcyB0aGlzIGZpeCBpcyBvbGRlcjogaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9NzczMSAoMjAxNSlcblx0XHRcdFx0dmFyIGlzTG9hZGVkID0gZWxlbS5jb21wbGV0ZSAmJiBlbGVtLm5hdHVyYWxXaWR0aCA+IDE7XG5cblx0XHRcdFx0aWYoICFmaXJlc0xvYWQgfHwgaXNMb2FkZWQpe1xuXHRcdFx0XHRcdGlmIChpc0xvYWRlZCkge1xuXHRcdFx0XHRcdFx0YWRkQ2xhc3MoZWxlbSwgbGF6eVNpemVzQ2ZnLmZhc3RMb2FkZWRDbGFzcyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHN3aXRjaExvYWRpbmdDbGFzcyhldmVudCk7XG5cdFx0XHRcdFx0ZWxlbS5fbGF6eUNhY2hlID0gdHJ1ZTtcblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0XHRpZiAoJ19sYXp5Q2FjaGUnIGluIGVsZW0pIHtcblx0XHRcdFx0XHRcdFx0ZGVsZXRlIGVsZW0uX2xhenlDYWNoZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LCA5KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoZWxlbS5sb2FkaW5nID09ICdsYXp5Jykge1xuXHRcdFx0XHRcdGlzTG9hZGluZy0tO1xuXHRcdFx0XHR9XG5cdFx0XHR9LCB0cnVlKTtcblx0XHR9KTtcblxuXHRcdC8qKlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGVsZW0geyBFbGVtZW50IH1cblx0XHQgKi9cblx0XHR2YXIgdW52ZWlsRWxlbWVudCA9IGZ1bmN0aW9uIChlbGVtKXtcblx0XHRcdGlmIChlbGVtLl9sYXp5UmFjZSkge3JldHVybjt9XG5cdFx0XHR2YXIgZGV0YWlsO1xuXG5cdFx0XHR2YXIgaXNJbWcgPSByZWdJbWcudGVzdChlbGVtLm5vZGVOYW1lKTtcblxuXHRcdFx0Ly9hbGxvdyB1c2luZyBzaXplcz1cImF1dG9cIiwgYnV0IGRvbid0IHVzZS4gaXQncyBpbnZhbGlkLiBVc2UgZGF0YS1zaXplcz1cImF1dG9cIiBvciBhIHZhbGlkIHZhbHVlIGZvciBzaXplcyBpbnN0ZWFkIChpLmUuOiBzaXplcz1cIjgwdndcIilcblx0XHRcdHZhciBzaXplcyA9IGlzSW1nICYmIChlbGVtW19nZXRBdHRyaWJ1dGVdKGxhenlTaXplc0NmZy5zaXplc0F0dHIpIHx8IGVsZW1bX2dldEF0dHJpYnV0ZV0oJ3NpemVzJykpO1xuXHRcdFx0dmFyIGlzQXV0byA9IHNpemVzID09ICdhdXRvJztcblxuXHRcdFx0aWYoIChpc0F1dG8gfHwgIWlzQ29tcGxldGVkKSAmJiBpc0ltZyAmJiAoZWxlbVtfZ2V0QXR0cmlidXRlXSgnc3JjJykgfHwgZWxlbS5zcmNzZXQpICYmICFlbGVtLmNvbXBsZXRlICYmICFoYXNDbGFzcyhlbGVtLCBsYXp5U2l6ZXNDZmcuZXJyb3JDbGFzcykgJiYgaGFzQ2xhc3MoZWxlbSwgbGF6eVNpemVzQ2ZnLmxhenlDbGFzcykpe3JldHVybjt9XG5cblx0XHRcdGRldGFpbCA9IHRyaWdnZXJFdmVudChlbGVtLCAnbGF6eXVudmVpbHJlYWQnKS5kZXRhaWw7XG5cblx0XHRcdGlmKGlzQXV0byl7XG5cdFx0XHRcdCBhdXRvU2l6ZXIudXBkYXRlRWxlbShlbGVtLCB0cnVlLCBlbGVtLm9mZnNldFdpZHRoKTtcblx0XHRcdH1cblxuXHRcdFx0ZWxlbS5fbGF6eVJhY2UgPSB0cnVlO1xuXHRcdFx0aXNMb2FkaW5nKys7XG5cblx0XHRcdGxhenlVbnZlaWwoZWxlbSwgZGV0YWlsLCBpc0F1dG8sIHNpemVzLCBpc0ltZyk7XG5cdFx0fTtcblxuXHRcdHZhciBhZnRlclNjcm9sbCA9IGRlYm91bmNlKGZ1bmN0aW9uKCl7XG5cdFx0XHRsYXp5U2l6ZXNDZmcubG9hZE1vZGUgPSAzO1xuXHRcdFx0dGhyb3R0bGVkQ2hlY2tFbGVtZW50cygpO1xuXHRcdH0pO1xuXG5cdFx0dmFyIGFsdExvYWRtb2RlU2Nyb2xsTGlzdG5lciA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRpZihsYXp5U2l6ZXNDZmcubG9hZE1vZGUgPT0gMyl7XG5cdFx0XHRcdGxhenlTaXplc0NmZy5sb2FkTW9kZSA9IDI7XG5cdFx0XHR9XG5cdFx0XHRhZnRlclNjcm9sbCgpO1xuXHRcdH07XG5cblx0XHR2YXIgb25sb2FkID0gZnVuY3Rpb24oKXtcblx0XHRcdGlmKGlzQ29tcGxldGVkKXtyZXR1cm47fVxuXHRcdFx0aWYoRGF0ZS5ub3coKSAtIHN0YXJ0ZWQgPCA5OTkpe1xuXHRcdFx0XHRzZXRUaW1lb3V0KG9ubG9hZCwgOTk5KTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cblx0XHRcdGlzQ29tcGxldGVkID0gdHJ1ZTtcblxuXHRcdFx0bGF6eVNpemVzQ2ZnLmxvYWRNb2RlID0gMztcblxuXHRcdFx0dGhyb3R0bGVkQ2hlY2tFbGVtZW50cygpO1xuXG5cdFx0XHRhZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBhbHRMb2FkbW9kZVNjcm9sbExpc3RuZXIsIHRydWUpO1xuXHRcdH07XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0XzogZnVuY3Rpb24oKXtcblx0XHRcdFx0c3RhcnRlZCA9IERhdGUubm93KCk7XG5cblx0XHRcdFx0bGF6eXNpemVzLmVsZW1lbnRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShsYXp5U2l6ZXNDZmcubGF6eUNsYXNzKTtcblx0XHRcdFx0cHJlbG9hZEVsZW1zID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShsYXp5U2l6ZXNDZmcubGF6eUNsYXNzICsgJyAnICsgbGF6eVNpemVzQ2ZnLnByZWxvYWRDbGFzcyk7XG5cblx0XHRcdFx0YWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhyb3R0bGVkQ2hlY2tFbGVtZW50cywgdHJ1ZSk7XG5cblx0XHRcdFx0YWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhyb3R0bGVkQ2hlY2tFbGVtZW50cywgdHJ1ZSk7XG5cblx0XHRcdFx0YWRkRXZlbnRMaXN0ZW5lcigncGFnZXNob3cnLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRcdGlmIChlLnBlcnNpc3RlZCkge1xuXHRcdFx0XHRcdFx0dmFyIGxvYWRpbmdFbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy4nICsgbGF6eVNpemVzQ2ZnLmxvYWRpbmdDbGFzcyk7XG5cblx0XHRcdFx0XHRcdGlmIChsb2FkaW5nRWxlbWVudHMubGVuZ3RoICYmIGxvYWRpbmdFbGVtZW50cy5mb3JFYWNoKSB7XG5cdFx0XHRcdFx0XHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0bG9hZGluZ0VsZW1lbnRzLmZvckVhY2goIGZ1bmN0aW9uIChpbWcpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChpbWcuY29tcGxldGUpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dW52ZWlsRWxlbWVudChpbWcpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGlmKHdpbmRvdy5NdXRhdGlvbk9ic2VydmVyKXtcblx0XHRcdFx0XHRuZXcgTXV0YXRpb25PYnNlcnZlciggdGhyb3R0bGVkQ2hlY2tFbGVtZW50cyApLm9ic2VydmUoIGRvY0VsZW0sIHtjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWUsIGF0dHJpYnV0ZXM6IHRydWV9ICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZG9jRWxlbVtfYWRkRXZlbnRMaXN0ZW5lcl0oJ0RPTU5vZGVJbnNlcnRlZCcsIHRocm90dGxlZENoZWNrRWxlbWVudHMsIHRydWUpO1xuXHRcdFx0XHRcdGRvY0VsZW1bX2FkZEV2ZW50TGlzdGVuZXJdKCdET01BdHRyTW9kaWZpZWQnLCB0aHJvdHRsZWRDaGVja0VsZW1lbnRzLCB0cnVlKTtcblx0XHRcdFx0XHRzZXRJbnRlcnZhbCh0aHJvdHRsZWRDaGVja0VsZW1lbnRzLCA5OTkpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIHRocm90dGxlZENoZWNrRWxlbWVudHMsIHRydWUpO1xuXG5cdFx0XHRcdC8vLCAnZnVsbHNjcmVlbmNoYW5nZSdcblx0XHRcdFx0Wydmb2N1cycsICdtb3VzZW92ZXInLCAnY2xpY2snLCAnbG9hZCcsICd0cmFuc2l0aW9uZW5kJywgJ2FuaW1hdGlvbmVuZCddLmZvckVhY2goZnVuY3Rpb24obmFtZSl7XG5cdFx0XHRcdFx0ZG9jdW1lbnRbX2FkZEV2ZW50TGlzdGVuZXJdKG5hbWUsIHRocm90dGxlZENoZWNrRWxlbWVudHMsIHRydWUpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRpZigoL2QkfF5jLy50ZXN0KGRvY3VtZW50LnJlYWR5U3RhdGUpKSl7XG5cdFx0XHRcdFx0b25sb2FkKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9ubG9hZCk7XG5cdFx0XHRcdFx0ZG9jdW1lbnRbX2FkZEV2ZW50TGlzdGVuZXJdKCdET01Db250ZW50TG9hZGVkJywgdGhyb3R0bGVkQ2hlY2tFbGVtZW50cyk7XG5cdFx0XHRcdFx0c2V0VGltZW91dChvbmxvYWQsIDIwMDAwKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKGxhenlzaXplcy5lbGVtZW50cy5sZW5ndGgpe1xuXHRcdFx0XHRcdGNoZWNrRWxlbWVudHMoKTtcblx0XHRcdFx0XHRyQUYuX2xzRmx1c2goKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aHJvdHRsZWRDaGVja0VsZW1lbnRzKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRjaGVja0VsZW1zOiB0aHJvdHRsZWRDaGVja0VsZW1lbnRzLFxuXHRcdFx0dW52ZWlsOiB1bnZlaWxFbGVtZW50LFxuXHRcdFx0X2FMU0w6IGFsdExvYWRtb2RlU2Nyb2xsTGlzdG5lcixcblx0XHR9O1xuXHR9KSgpO1xuXG5cblx0dmFyIGF1dG9TaXplciA9IChmdW5jdGlvbigpe1xuXHRcdHZhciBhdXRvc2l6ZXNFbGVtcztcblxuXHRcdHZhciBzaXplRWxlbWVudCA9IHJBRkl0KGZ1bmN0aW9uKGVsZW0sIHBhcmVudCwgZXZlbnQsIHdpZHRoKXtcblx0XHRcdHZhciBzb3VyY2VzLCBpLCBsZW47XG5cdFx0XHRlbGVtLl9sYXp5c2l6ZXNXaWR0aCA9IHdpZHRoO1xuXHRcdFx0d2lkdGggKz0gJ3B4JztcblxuXHRcdFx0ZWxlbS5zZXRBdHRyaWJ1dGUoJ3NpemVzJywgd2lkdGgpO1xuXG5cdFx0XHRpZihyZWdQaWN0dXJlLnRlc3QocGFyZW50Lm5vZGVOYW1lIHx8ICcnKSl7XG5cdFx0XHRcdHNvdXJjZXMgPSBwYXJlbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NvdXJjZScpO1xuXHRcdFx0XHRmb3IoaSA9IDAsIGxlbiA9IHNvdXJjZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xuXHRcdFx0XHRcdHNvdXJjZXNbaV0uc2V0QXR0cmlidXRlKCdzaXplcycsIHdpZHRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZighZXZlbnQuZGV0YWlsLmRhdGFBdHRyKXtcblx0XHRcdFx0dXBkYXRlUG9seWZpbGwoZWxlbSwgZXZlbnQuZGV0YWlsKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHQvKipcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlbGVtIHtFbGVtZW50fVxuXHRcdCAqIEBwYXJhbSBkYXRhQXR0clxuXHRcdCAqIEBwYXJhbSBbd2lkdGhdIHsgbnVtYmVyIH1cblx0XHQgKi9cblx0XHR2YXIgZ2V0U2l6ZUVsZW1lbnQgPSBmdW5jdGlvbiAoZWxlbSwgZGF0YUF0dHIsIHdpZHRoKXtcblx0XHRcdHZhciBldmVudDtcblx0XHRcdHZhciBwYXJlbnQgPSBlbGVtLnBhcmVudE5vZGU7XG5cblx0XHRcdGlmKHBhcmVudCl7XG5cdFx0XHRcdHdpZHRoID0gZ2V0V2lkdGgoZWxlbSwgcGFyZW50LCB3aWR0aCk7XG5cdFx0XHRcdGV2ZW50ID0gdHJpZ2dlckV2ZW50KGVsZW0sICdsYXp5YmVmb3Jlc2l6ZXMnLCB7d2lkdGg6IHdpZHRoLCBkYXRhQXR0cjogISFkYXRhQXR0cn0pO1xuXG5cdFx0XHRcdGlmKCFldmVudC5kZWZhdWx0UHJldmVudGVkKXtcblx0XHRcdFx0XHR3aWR0aCA9IGV2ZW50LmRldGFpbC53aWR0aDtcblxuXHRcdFx0XHRcdGlmKHdpZHRoICYmIHdpZHRoICE9PSBlbGVtLl9sYXp5c2l6ZXNXaWR0aCl7XG5cdFx0XHRcdFx0XHRzaXplRWxlbWVudChlbGVtLCBwYXJlbnQsIGV2ZW50LCB3aWR0aCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciB1cGRhdGVFbGVtZW50c1NpemVzID0gZnVuY3Rpb24oKXtcblx0XHRcdHZhciBpO1xuXHRcdFx0dmFyIGxlbiA9IGF1dG9zaXplc0VsZW1zLmxlbmd0aDtcblx0XHRcdGlmKGxlbil7XG5cdFx0XHRcdGkgPSAwO1xuXG5cdFx0XHRcdGZvcig7IGkgPCBsZW47IGkrKyl7XG5cdFx0XHRcdFx0Z2V0U2l6ZUVsZW1lbnQoYXV0b3NpemVzRWxlbXNbaV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciBkZWJvdW5jZWRVcGRhdGVFbGVtZW50c1NpemVzID0gZGVib3VuY2UodXBkYXRlRWxlbWVudHNTaXplcyk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0XzogZnVuY3Rpb24oKXtcblx0XHRcdFx0YXV0b3NpemVzRWxlbXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGxhenlTaXplc0NmZy5hdXRvc2l6ZXNDbGFzcyk7XG5cdFx0XHRcdGFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGRlYm91bmNlZFVwZGF0ZUVsZW1lbnRzU2l6ZXMpO1xuXHRcdFx0fSxcblx0XHRcdGNoZWNrRWxlbXM6IGRlYm91bmNlZFVwZGF0ZUVsZW1lbnRzU2l6ZXMsXG5cdFx0XHR1cGRhdGVFbGVtOiBnZXRTaXplRWxlbWVudFxuXHRcdH07XG5cdH0pKCk7XG5cblx0dmFyIGluaXQgPSBmdW5jdGlvbigpe1xuXHRcdGlmKCFpbml0LmkgJiYgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSl7XG5cdFx0XHRpbml0LmkgPSB0cnVlO1xuXHRcdFx0YXV0b1NpemVyLl8oKTtcblx0XHRcdGxvYWRlci5fKCk7XG5cdFx0fVxuXHR9O1xuXG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHRpZihsYXp5U2l6ZXNDZmcuaW5pdCl7XG5cdFx0XHRpbml0KCk7XG5cdFx0fVxuXHR9KTtcblxuXHRsYXp5c2l6ZXMgPSB7XG5cdFx0LyoqXG5cdFx0ICogQHR5cGUgeyBMYXp5U2l6ZXNDb25maWdQYXJ0aWFsIH1cblx0XHQgKi9cblx0XHRjZmc6IGxhenlTaXplc0NmZyxcblx0XHRhdXRvU2l6ZXI6IGF1dG9TaXplcixcblx0XHRsb2FkZXI6IGxvYWRlcixcblx0XHRpbml0OiBpbml0LFxuXHRcdHVQOiB1cGRhdGVQb2x5ZmlsbCxcblx0XHRhQzogYWRkQ2xhc3MsXG5cdFx0ckM6IHJlbW92ZUNsYXNzLFxuXHRcdGhDOiBoYXNDbGFzcyxcblx0XHRmaXJlOiB0cmlnZ2VyRXZlbnQsXG5cdFx0Z1c6IGdldFdpZHRoLFxuXHRcdHJBRjogckFGLFxuXHR9O1xuXG5cdHJldHVybiBsYXp5c2l6ZXM7XG59XG4pKTtcbiIsIi8qIGdsb2JhbCBsb2NhbFN0b3JhZ2UgICovXG5pbXBvcnQgZG9jU2VsZWN0b3JBbGwgZnJvbSAnLi9kb2N1bWVudC1xdWVyeS1zZWxlY3Rvci1hbGwnXG5cbmV4cG9ydCBkZWZhdWx0IGVsID0+IHtcbiAgY29uc3QgJHRvZ2dsZVRoZW1lID0gZG9jU2VsZWN0b3JBbGwoZWwpXG5cbiAgaWYgKCEkdG9nZ2xlVGhlbWUubGVuZ3RoKSByZXR1cm5cblxuICBjb25zdCByb290RWwgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcblxuICAkdG9nZ2xlVGhlbWUuZm9yRWFjaChpdGVtID0+IGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICBpZiAoIXJvb3RFbC5jbGFzc0xpc3QuY29udGFpbnMoJ2RhcmsnKSkge1xuICAgICAgcm9vdEVsLmNsYXNzTGlzdC5hZGQoJ2RhcmsnKVxuICAgICAgbG9jYWxTdG9yYWdlLnRoZW1lID0gJ2RhcmsnXG4gICAgfSBlbHNlIHtcbiAgICAgIHJvb3RFbC5jbGFzc0xpc3QucmVtb3ZlKCdkYXJrJylcbiAgICAgIGxvY2FsU3RvcmFnZS50aGVtZSA9ICdsaWdodCdcbiAgICB9XG4gIH0pKVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gIGNvbnN0IHBhcmVudCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZG9jdW1lbnRcblxuICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwocGFyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpLCAwKVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgKGNvdmVyQ2xhc3MsIGhlYWRUcmFuc3BhcmVudCkgPT4ge1xuICBjb25zdCBkb21Cb2R5ID0gZG9jdW1lbnQuYm9keVxuICBjb25zdCBoYXNDb3ZlciA9IGRvbUJvZHkuY2xvc2VzdChjb3ZlckNsYXNzKVxuXG4gIGlmICghaGFzQ292ZXIpIHJldHVyblxuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCAoKSA9PiB7XG4gICAgY29uc3QgbGFzdFNjcm9sbFkgPSB3aW5kb3cuc2Nyb2xsWVxuXG4gICAgbGFzdFNjcm9sbFkgPj0gNjAgPyBkb21Cb2R5LmNsYXNzTGlzdC5yZW1vdmUoaGVhZFRyYW5zcGFyZW50KSA6IGRvbUJvZHkuY2xhc3NMaXN0LmFkZChoZWFkVHJhbnNwYXJlbnQpXG4gIH0sIHsgcGFzc2l2ZTogdHJ1ZSB9KVxufVxuIiwiXG5pbXBvcnQgZG9jU2VsZWN0b3JBbGwgZnJvbSAnLi9kb2N1bWVudC1xdWVyeS1zZWxlY3Rvci1hbGwnXG5cbmV4cG9ydCBkZWZhdWx0IChzb2NpYWxNZWRpYURhdGEsIGJveFNlbGVjdG9yKSA9PiB7XG4gIC8vIGNoZWNrIGlmIHRoZSBib3ggZm9yIHRoZSBtZW51IGV4aXN0c1xuICBjb25zdCBub2RlQm94ID0gZG9jU2VsZWN0b3JBbGwoYm94U2VsZWN0b3IpXG5cbiAgaWYgKCFub2RlQm94Lmxlbmd0aCkgcmV0dXJuXG5cbiAgY29uc3QgdXJsUmVnZXhwID0gdXJsID0+IC8oKChbQS1aYS16XXszLDl9Oig/OlxcL1xcLyk/KSg/OltcXC07OiY9XFwrXFwkLFxcd10rQCk/W0EtWmEtejAtOVxcLlxcLV0rfCg/Ond3d1xcLnxbXFwtOzomPVxcK1xcJCxcXHddK0ApW0EtWmEtejAtOVxcLlxcLV0rKSgoPzpcXC9bXFwrfiVcXC9cXC5cXHdcXC1fXSopP1xcPz8oPzpbXFwtXFwrPSY7JUBcXC5cXHdfXSopIz8oPzpbXFwuXFwhXFwvXFxcXFxcd10qKSk/KS8udGVzdCh1cmwpIC8vZXNsaW50LWRpc2FibGUtbGluZVxuXG4gIGNvbnN0IGNyZWF0ZUVsZW1lbnQgPSBlbGVtZW50ID0+IHtcbiAgICBPYmplY3QuZW50cmllcyhzb2NpYWxNZWRpYURhdGEpLmZvckVhY2goKFtuYW1lLCB1cmxUaXRsZV0pID0+IHtcbiAgICAgIGNvbnN0IHVybCA9IHVybFRpdGxlWzBdXG5cbiAgICAgIC8vIFRoZSB1cmwgaXMgYmVpbmcgdmFsaWRhdGVkIGlmIGl0IGlzIGZhbHNlIGl0IHJldHVybnNcbiAgICAgIGlmICghdXJsUmVnZXhwKHVybCkpIHJldHVyblxuXG4gICAgICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXG4gICAgICBsaW5rLmhyZWYgPSB1cmxcbiAgICAgIGxpbmsudGl0bGUgPSB1cmxUaXRsZVsxXVxuICAgICAgbGluay5jbGFzc0xpc3QgPSBgYnV0dG9uIGJvcmRlci1ub25lIGhvdmVyOnRleHQtJHtuYW1lfWBcbiAgICAgIGxpbmsudGFyZ2V0ID0gJ19ibGFuaydcbiAgICAgIGxpbmsucmVsID0gJ25vb3BlbmVyIG5vcmVmZXJyZXInXG4gICAgICBsaW5rLmlubmVySFRNTCA9IGA8c3ZnIGNsYXNzPVwiaWNvbiBpY29uLS0ke25hbWV9XCI+PHVzZSB4bGluazpocmVmPVwiI2ljb24tJHtuYW1lfVwiPjwvdXNlPjwvc3ZnPmBcblxuICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChsaW5rKVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gbm9kZUJveC5mb3JFYWNoKGNyZWF0ZUVsZW1lbnQpXG59XG4iLCIvKiBnbG9iYWwgcHJpc21KcyAqL1xuXG5pbXBvcnQgbG9hZFNjcmlwdCBmcm9tICcuL2xvYWQtc2NyaXB0J1xuaW1wb3J0IGRvY1NlbGVjdG9yQWxsIGZyb20gJy4uL2FwcC9kb2N1bWVudC1xdWVyeS1zZWxlY3Rvci1hbGwnXG5cbmV4cG9ydCBkZWZhdWx0IChyb290ID0gZG9jdW1lbnQsIGNvZGVMYW5ndWFnZSkgPT4ge1xuICBjb25zdCAkY29kZUxhbmd1YWdlID0gKHJvb3QgJiYgcm9vdC5xdWVyeVNlbGVjdG9yQWxsKSA/IHJvb3QucXVlcnlTZWxlY3RvckFsbChjb2RlTGFuZ3VhZ2UpIDogZG9jU2VsZWN0b3JBbGwoY29kZUxhbmd1YWdlKVxuXG4gIGlmICgoISRjb2RlTGFuZ3VhZ2UgfHwgISRjb2RlTGFuZ3VhZ2UubGVuZ3RoKSAmJiB0eXBlb2YgcHJpc21KcyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVyblxuXG4gIC8vIFNob3cgTGFuZ3VhZ2VcbiAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbCgkY29kZUxhbmd1YWdlIHx8IFtdLCBlbGVtZW50ID0+IHtcbiAgICAvLyBJZGVtcG90ZW5jeVxuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdCAmJiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnanMtcHJpc20tcHJvY2Vzc2VkJykpIHJldHVyblxuXG4gICAgbGV0IGxhbmd1YWdlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykgfHwgJydcbiAgICBsYW5ndWFnZSA9IGxhbmd1YWdlLnNwbGl0KCctJylcbiAgICBpZiAoZWxlbWVudC5wYXJlbnRFbGVtZW50ICYmIGxhbmd1YWdlWzFdKSB7XG4gICAgICBlbGVtZW50LnBhcmVudEVsZW1lbnQuc2V0QXR0cmlidXRlKCdyZWwnLCBsYW5ndWFnZVsxXSlcbiAgICB9XG5cbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnanMtcHJpc20tcHJvY2Vzc2VkJylcbiAgfSlcblxuICAvLyBMb2FkIFByaXNtSnMgYW5kIFBsdWdpbiBMb2FmXG4gIGxvYWRTY3JpcHQocHJpc21Kcylcbn1cbiIsImV4cG9ydCBkZWZhdWx0IChzcmMsIGNhbGxiYWNrKSA9PiB7XG4gIGNvbnN0IHNjcmlwdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKVxuICBzY3JpcHRFbGVtZW50LnNyYyA9IHNyY1xuICBzY3JpcHRFbGVtZW50LmRlZmVyID0gdHJ1ZVxuICBzY3JpcHRFbGVtZW50LmFzeW5jID0gdHJ1ZVxuXG4gIGNhbGxiYWNrICYmIHNjcmlwdEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGNhbGxiYWNrKVxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdEVsZW1lbnQpXG59XG4iLCJleHBvcnQgZGVmYXVsdCBzZXR0aW5ncyA9PiB7XHJcbiAgY29uc3QgZGVmYXVsdHMgPSB7XHJcbiAgICBzZWxlY3RvcjogJyNqcy1wcm9tby1wb3B1cCcsXHJcbiAgICBzdG9yYWdlS2V5OiAnbTQtcHJvbW8taGlkZGVuJyxcclxuICAgIGRlbGF5OiAxMDAwLFxyXG4gICAgY29udGVudDogYFxyXG4gICAgICA8ZGl2IGNsYXNzPVwicHJvbW8tcG9wdXBfX2NvbnRlbnRcIj5cclxuICAgICAgICA8c3BhbiBjbGFzcz1cInByb21vLXBvcHVwX19tZXNzYWdlXCI+XHJcbiAgICAgICAgICDwn5OiIFdlJ3ZlIHVwZGF0ZWQgb3VyIHByaXZhY3kgcG9saWN5IGFuZCBkZXRlbnRpb24gZ3VpZGVsaW5lcy5cclxuICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cInByb21vLXBvcHVwX19idG4ganMtcHJvbW8tY2xvc2VcIj5cclxuICAgICAgICAgIERvbid0IHNob3cgYWdhaW5cclxuICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICBgXHJcbiAgfVxyXG5cclxuICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0cywgLi4uc2V0dGluZ3MgfVxyXG4gIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKG9wdGlvbnMuc2VsZWN0b3IpXHJcblxyXG4gIGlmICghZWxlbWVudCkgcmV0dXJuXHJcblxyXG4gIC8vIENoZWNrIFNlc3Npb24gU3RvcmFnZVxyXG4gIGlmICh3aW5kb3cuc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShvcHRpb25zLnN0b3JhZ2VLZXkpID09PSAndHJ1ZScpIHtcclxuICAgIHJldHVyblxyXG4gIH1cclxuXHJcbiAgLy8gUG9wdWxhdGUgSFRNTFxyXG4gIGVsZW1lbnQuaW5uZXJIVE1MID0gb3B0aW9ucy5jb250ZW50XHJcblxyXG4gIC8vIEFuaW1hdGUgSW4gKEVubGFyZ2UgVmVydGljYWxseSlcclxuICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLXZpc2libGUnKVxyXG4gIH0sIG9wdGlvbnMuZGVsYXkpXHJcblxyXG4gIC8vIEhhbmRsZSBDbG9zZVxyXG4gIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgaWYgKGUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnanMtcHJvbW8tY2xvc2UnKSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuXHJcbiAgICAgIC8vIEFuaW1hdGUgT3V0XHJcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtdmlzaWJsZScpXHJcblxyXG4gICAgICAvLyBTZXQgU2Vzc2lvbiBTdG9yYWdlXHJcbiAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKG9wdGlvbnMuc3RvcmFnZUtleSwgJ3RydWUnKVxyXG5cclxuICAgICAgLy8gUmVtb3ZlIGZyb20gRE9NIGFmdGVyIHRyYW5zaXRpb25cclxuICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gJydcclxuICAgICAgfSwgNTAwKVxyXG4gICAgfVxyXG4gIH0pXHJcbn0iLCJpbXBvcnQgZG9jU2VsZWN0b3JBbGwgZnJvbSAnLi4vYXBwL2RvY3VtZW50LXF1ZXJ5LXNlbGVjdG9yLWFsbCdcblxuLyoqXG4gKiBHYWxsZXJ5IGNhcmQgc3VwcG9ydFxuICogVXNlZCBvbiBhbnkgaW5kaXZpZHVhbCBwb3N0L3BhZ2VcbiAqXG4gKiBEZXRlY3RzIHdoZW4gYSBnYWxsZXJ5IGNhcmQgaGFzIGJlZW4gdXNlZCBhbmQgYXBwbGllcyBzaXppbmcgdG8gbWFrZSBzdXJlXG4gKiB0aGUgZGlzcGxheSBtYXRjaGVzIHdoYXQgaXMgc2VlbiBpbiB0aGUgZWRpdG9yLlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IChyb290ID0gZG9jdW1lbnQpID0+IHtcbiAgY29uc3QgaW1hZ2VzID0gKHJvb3QgJiYgcm9vdC5xdWVyeVNlbGVjdG9yQWxsKSA/IHJvb3QucXVlcnlTZWxlY3RvckFsbCgnLmtnLWdhbGxlcnktaW1hZ2UgPiBpbWcnKSA6IGRvY1NlbGVjdG9yQWxsKCcua2ctZ2FsbGVyeS1pbWFnZSA+IGltZycpXG5cbiAgaWYgKCFpbWFnZXMgfHwgIWltYWdlcy5sZW5ndGgpIHJldHVyblxuXG4gIGltYWdlcy5mb3JFYWNoKGltYWdlID0+IHtcbiAgICAvLyBJZGVtcG90ZW5jeTogc2tpcCBpbWFnZXMgYWxyZWFkeSBwcm9jZXNzZWRcbiAgICBpZiAoaW1hZ2UuY2xhc3NMaXN0ICYmIGltYWdlLmNsYXNzTGlzdC5jb250YWlucygnanMtZ2FsbGVyeS1wcm9jZXNzZWQnKSkgcmV0dXJuXG5cbiAgICBjb25zdCBjb250YWluZXIgPSBpbWFnZS5jbG9zZXN0KCcua2ctZ2FsbGVyeS1pbWFnZScpXG4gICAgaWYgKCFjb250YWluZXIpIHJldHVyblxuXG4gICAgY29uc3Qgd2lkdGggPSBpbWFnZS5hdHRyaWJ1dGVzLndpZHRoICYmIGltYWdlLmF0dHJpYnV0ZXMud2lkdGgudmFsdWVcbiAgICBjb25zdCBoZWlnaHQgPSBpbWFnZS5hdHRyaWJ1dGVzLmhlaWdodCAmJiBpbWFnZS5hdHRyaWJ1dGVzLmhlaWdodC52YWx1ZVxuICAgIGlmICghd2lkdGggfHwgIWhlaWdodCkgcmV0dXJuXG5cbiAgICBjb25zdCByYXRpbyA9IHdpZHRoIC8gaGVpZ2h0XG4gICAgY29udGFpbmVyLnN0eWxlLmZsZXggPSByYXRpbyArICcgMSAwJSdcblxuICAgIGltYWdlLmNsYXNzTGlzdC5hZGQoJ2pzLWdhbGxlcnktcHJvY2Vzc2VkJylcbiAgfSlcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGVsID0+IHtcbiAgY29uc3QgJGhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwpXG5cbiAgaWYgKCEkaGVhZGVyKSByZXR1cm5cblxuICBjb25zdCAkc2VhcmNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLXNlYXJjaCcpXG5cbiAgbGV0IHByZXZTY3JvbGxwb3MgPSB3aW5kb3cucGFnZVlPZmZzZXRcblxuICB3aW5kb3cub25zY3JvbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgY3VycmVudFNjcm9sbFBvcyA9IHdpbmRvdy5wYWdlWU9mZnNldFxuXG4gICAgaWYgKHByZXZTY3JvbGxwb3MgPiBjdXJyZW50U2Nyb2xsUG9zKSB7XG4gICAgICAkaGVhZGVyLmNsYXNzTGlzdC5yZW1vdmUoJy10b3AtMTgnKVxuICAgICAgJHNlYXJjaC5jbGFzc0xpc3QuYWRkKCdtdC0xNicpXG4gICAgfSBlbHNlIHtcbiAgICAgICRoZWFkZXIuY2xhc3NMaXN0LmFkZCgnLXRvcC0xOCcpXG4gICAgICAkc2VhcmNoLmNsYXNzTGlzdC5yZW1vdmUoJ210LTE2JylcbiAgICB9XG5cbiAgICBwcmV2U2Nyb2xscG9zID0gY3VycmVudFNjcm9sbFBvc1xuICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCAocm9vdCA9IGRvY3VtZW50KSA9PiB7XG4gIC8qIElmcmFtZSBTUkMgdmlkZW8gKi9cbiAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICdpZnJhbWVbc3JjKj1cInBsYXllci52aW1lby5jb21cIl0nLFxuICAgICdpZnJhbWVbc3JjKj1cImRhaWx5bW90aW9uLmNvbVwiXScsXG4gICAgJ2lmcmFtZVtzcmMqPVwieW91dHViZS5jb21cIl0nLFxuICAgICdpZnJhbWVbc3JjKj1cInlvdXR1YmUtbm9jb29raWUuY29tXCJdJyxcbiAgICAnaWZyYW1lW3NyYyo9XCJwbGF5ZXIudHdpdGNoLnR2XCJdJyxcbiAgICAnaWZyYW1lW3NyYyo9XCJraWNrc3RhcnRlci5jb21cIl1bc3JjKj1cInZpZGVvLmh0bWxcIl0nXG4gIF1cblxuICAvLyBVc2Ugcm9vdC5xdWVyeVNlbGVjdG9yQWxsIHRvIHNjb3BlIHRoZSBzZWFyY2hcbiAgY29uc3QgaWZyYW1lcyA9IHJvb3QucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcnMuam9pbignLCcpKVxuXG4gIGlmICghaWZyYW1lcy5sZW5ndGgpIHJldHVyblxuXG4gIGlmcmFtZXMuZm9yRWFjaChlbCA9PiB7XG4gICAgLy8gQ2hlY2sgaWYgYWxyZWFkeSBwcm9jZXNzZWRcbiAgICBpZiAoZWwucGFyZW50Tm9kZS5jbGFzc0xpc3QuY29udGFpbnMoJ3ZpZGVvLXJlc3BvbnNpdmUnKSkgcmV0dXJuXG5cbiAgICBjb25zdCBwYXJlbnRGb3JWaWRlbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgcGFyZW50Rm9yVmlkZW8uY2xhc3NOYW1lID0gJ3ZpZGVvLXJlc3BvbnNpdmUnXG4gICAgZWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUocGFyZW50Rm9yVmlkZW8sIGVsKVxuICAgIHBhcmVudEZvclZpZGVvLmFwcGVuZENoaWxkKGVsKVxuICAgIGVsLnJlbW92ZUF0dHJpYnV0ZSgnaGVpZ2h0JylcbiAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoJ3dpZHRoJylcbiAgfSlcbn0iLCIvKipcclxuICogTWF0b21vIEFuYWx5dGljcyAmIEVuZ2FnZW1lbnQgTWFuYWdlclxyXG4gKiBIYW5kbGVzIFNQQS1saWtlIHBhZ2UgdHJhbnNpdGlvbnMgYW5kIHNjb3BlZCBzY3JvbGwgdHJhY2tpbmcuXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBbmFseXRpY3NNYW5hZ2VyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMuY3VycmVudFBhdGggPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWVcclxuICAgIHRoaXMub2JzZXJ2ZXJzID0gbmV3IE1hcCgpXHJcbiAgfVxyXG5cclxuICAvLyBUcmFjayBhIG5ldyB2aXJ0dWFsIHBhZ2UgdmlldyAoSXNzdWUgIzEpXHJcbiAgdHJhY2tQYWdlVmlldyh1cmwsIHRpdGxlLCBwcmV2aW91c1VybCkge1xyXG4gICAgY29uc29sZS5kZWJ1ZygnW0FuYWx5dGljc01hbmFnZXJdIHRyYWNrUGFnZVZpZXcgY2FsbGVkJywge3VybCwgdGl0bGUsIHByZXZpb3VzVXJsfSlcclxuICAgIGlmICghd2luZG93Ll9wYXEpIHtcclxuICAgICAgY29uc29sZS53YXJuKCdbQW5hbHl0aWNzTWFuYWdlcl0gd2luZG93Ll9wYXEgaXMgbm90IGF2YWlsYWJsZTsgc2tpcHBpbmcgTWF0b21vIGNhbGxzJylcclxuICAgICAgdGhpcy5jdXJyZW50UGF0aCA9IHVybFxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmN1cnJlbnRQYXRoID0gdXJsXHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgd2luZG93Ll9wYXEucHVzaChbJ3NldFJlZmVycmVyVXJsJywgcHJldmlvdXNVcmxdKVxyXG4gICAgICB3aW5kb3cuX3BhcS5wdXNoKFsnc2V0Q3VzdG9tVXJsJywgdXJsXSlcclxuICAgICAgd2luZG93Ll9wYXEucHVzaChbJ3NldERvY3VtZW50VGl0bGUnLCB0aXRsZV0pXHJcbiAgICAgIHdpbmRvdy5fcGFxLnB1c2goWydzZXRHZW5lcmF0aW9uVGltZU1zJywgMF0pXHJcbiAgICAgIHdpbmRvdy5fcGFxLnB1c2goWyd0cmFja1BhZ2VWaWV3J10pXHJcbiAgICAgIHdpbmRvdy5fcGFxLnB1c2goWydlbmFibGVMaW5rVHJhY2tpbmcnXSlcclxuICAgICAgd2luZG93Ll9wYXEucHVzaChbJ01lZGlhQW5hbHl0aWNzOjpzY2FuRm9yTWVkaWEnXSlcclxuICAgICAgY29uc29sZS5pbmZvKCdbQW5hbHl0aWNzTWFuYWdlcl0gTWF0b21vIHRyYWNrUGFnZVZpZXcgcHVzaGVkJywge3VybCwgdGl0bGV9KVxyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tBbmFseXRpY3NNYW5hZ2VyXSBlcnJvciBwdXNoaW5nIHRvIF9wYXEnLCBlcnIpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBPYnNlcnZlIGFuIGFydGljbGUgZm9yIFwiUmVhZFwiIHN0YXR1cyAoSXNzdWUgIzIsICMzKVxyXG4gIG9ic2VydmVBcnRpY2xlKGFydGljbGVFbGVtZW50LCB0aXRsZSkge1xyXG4gIGNvbnNvbGUuZGVidWcoJ1tBbmFseXRpY3NNYW5hZ2VyXSBvYnNlcnZlQXJ0aWNsZSBjYWxsZWQnLCB7dGl0bGV9KVxyXG4gICAgaWYgKCFhcnRpY2xlRWxlbWVudCkgcmV0dXJuXHJcblxyXG4gICAgbGV0IGhhc1JlYWQgPSBmYWxzZVxyXG4gICAgbGV0IHRpbWVTdGFydGVkID0gMFxyXG5cclxuICAgIGNvbnN0IFJFQURfVEhSRVNIT0xEX1BFUkNFTlQgPSAwLjVcclxuICAgIGNvbnN0IFJFQURfVElNRV9NUyA9IDEwMDAwXHJcblxyXG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIoKGVudHJpZXMpID0+IHtcclxuICAgICAgZW50cmllcy5mb3JFYWNoKGVudHJ5ID0+IHtcclxuICAgICAgICBpZiAoZW50cnkuaXNJbnRlcnNlY3RpbmcgJiYgZW50cnkuaW50ZXJzZWN0aW9uUmF0aW8gPj0gUkVBRF9USFJFU0hPTERfUEVSQ0VOVCkge1xyXG4gICAgICAgICAgaWYgKCF0aW1lU3RhcnRlZCkgdGltZVN0YXJ0ZWQgPSBEYXRlLm5vdygpXHJcblxyXG4gICAgICAgICAgY29uc3QgZHdlbGxUaW1lID0gRGF0ZS5ub3coKSAtIHRpbWVTdGFydGVkXHJcbiAgICAgICAgICBpZiAoZHdlbGxUaW1lID4gUkVBRF9USU1FX01TICYmICFoYXNSZWFkKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlclJlYWRFdmVudCh0aXRsZSlcclxuICAgICAgICAgICAgaGFzUmVhZCA9IHRydWVcclxuICAgICAgICAgICAgb2JzZXJ2ZXIudW5vYnNlcnZlKGFydGljbGVFbGVtZW50KVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aW1lU3RhcnRlZCA9IDBcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9LCB7XHJcbiAgICAgIHRocmVzaG9sZDogWzAsIDAuMjUsIDAuNSwgMC43NSwgMV1cclxuICAgIH0pXHJcblxyXG4gIG9ic2VydmVyLm9ic2VydmUoYXJ0aWNsZUVsZW1lbnQpXHJcbiAgdGhpcy5vYnNlcnZlcnMuc2V0KGFydGljbGVFbGVtZW50LCBvYnNlcnZlcilcclxuICBjb25zb2xlLmRlYnVnKCdbQW5hbHl0aWNzTWFuYWdlcl0gSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgYXR0YWNoZWQgZm9yIGFydGljbGUnLCB7dGl0bGV9KVxyXG4gIH1cclxuXHJcbiAgdHJpZ2dlclJlYWRFdmVudCh0aXRsZSkge1xyXG4gICAgaWYgKHdpbmRvdy5fcGFxKSB7XHJcbiAgICAgIHdpbmRvdy5fcGFxLnB1c2goWyd0cmFja0V2ZW50JywgJ0FydGljbGUnLCAnUmVhZCcsIHRpdGxlXSlcclxuICAgIH1cclxuICBjb25zb2xlLmxvZyhgW0FuYWx5dGljc10gTWFya2VkIGFzIHJlYWQ6ICR7dGl0bGV9YClcclxuICB9XHJcblxyXG4gIGNsZWFudXAoKSB7XHJcbiAgICB0aGlzLm9ic2VydmVycy5mb3JFYWNoKG9icyA9PiBvYnMuZGlzY29ubmVjdCgpKVxyXG4gICAgdGhpcy5vYnNlcnZlcnMuY2xlYXIoKVxyXG4gIH1cclxufVxyXG4iLCIvKiBnbG9iYWwgZm9sbG93U29jaWFsTWVkaWEgc2l0ZVNlYXJjaCAqL1xuXG4vLyBsaWJcbmltcG9ydCAnbGF6eXNpemVzJ1xuXG5pbXBvcnQgc29jaWFsTWVkaWEgZnJvbSAnLi9hcHAvc29jaWFsLW1lZGlhJ1xuaW1wb3J0IGRhcmtNb2RlIGZyb20gJy4vYXBwL2RhcmstbW9kZSdcbmltcG9ydCBoZWFkZXJUcmFuc3BhcmVuY3kgZnJvbSAnLi9hcHAvaGVhZGVyLXRyYW5zcGFyZW5jeSdcbmltcG9ydCBsb2FkU2NyaXB0IGZyb20gJy4vY29tcG9uZW50cy9sb2FkLXNjcmlwdCdcbmltcG9ydCBzY3JvbGxIaWRlSGVhZGVyIGZyb20gJy4vY29tcG9uZW50cy9zY3JvbGwtaGlkZS1oZWFkZXInXG5pbXBvcnQgcHJvbW9Qb3B1cCBmcm9tICcuL2NvbXBvbmVudHMvcHJvbW8tcG9wdXAnXG5pbXBvcnQgcG9zdEluZmluaXRlIGZyb20gJy4vcG9zdC1pbmZpbml0ZSdcblxuY29uc3QgTTRTZXR1cCA9ICgpID0+IHtcbiAgY29uc29sZS5kZWJ1ZygnW21haW5dIE00U2V0dXAgc3RhcnRpbmcnKVxuICAvKipcbiAgICogTGlua3MgdG8gc29jaWFsIG1lZGlhXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdFtuYW1lLCB1cmwsIHRpdGxlXX0gZm9sbG93U29jaWFsTWVkaWEgLSAgVGhpcyB2YXJpYWJsZSB3aWxsIGNvbWUgZnJvbSB0aGUgZ2hvc3QgZGFzaGJvYXJkXG4gICAqIEBwYXJhbSAge0VsZW1lbnR9ICcuanMtc29jaWFsLW1lZGlhJyAtIEFsbCBlbGVtZW50cyBjb250YWluaW5nIHRoaXMgY2xhc3Mgd2lsbCBiZSBzZWxlY3RlZCBhbmQgdGhlIHNvY2lhbCBtZWRpYSBsaW5rcyB3aWxsIGJlIGFwcGVuZGVkLlxuICAgKi9cbiAgaWYgKHR5cGVvZiBmb2xsb3dTb2NpYWxNZWRpYSA9PT0gJ29iamVjdCcgJiYgZm9sbG93U29jaWFsTWVkaWEgIT09IG51bGwpIHtcbiAgICBzb2NpYWxNZWRpYShmb2xsb3dTb2NpYWxNZWRpYSwgJy5qcy1zb2NpYWwtbWVkaWEnKVxuICB9XG5cbiAgLyoqXG4gICAqIERhcmsgTW9kZVxuICAgKiBAcGFyYW0gIHtFbGVtZW50fSAnLmpzLWRhcmstbW9kZScgLSBDbGFzcyBuYW1lIG9mIGFsbCBidXR0b25zIGZvciBjaGFuZ2luZyB0aGUgZGFyayBtb2RlXG4gICAqL1xuICBkYXJrTW9kZSgnLmpzLWRhcmstbW9kZScpXG5cbiAgLyoqXG4gICAqIEhlYWRlciAtIEFkZCBhbmQgcmVtb3ZlIHRyYW5zcGFyZW5jeSB3aGVuIHRoZSBoZWFkZXIgaXMgbGFyZ2VyIHRoYW4gNjRweFxuICAgKiBhbmQgdGhlIHBhZ2UgY29udGFpbnMgdGhlIGNvdmVyLlxuICAgKlxuICAgKiBAcGFyYW0gIHtFbGVtZW50fSAnLmhhcy1jb3ZlcicgLSBUaGUgY2xhc3Mgd2lsbCBiZSBpbiB0aGUgYm9keSBpbmRpY2F0aW5nIHRoYXQgaXQgaXMgZW5hYmxlZCB0byBhZGQgdHJhbnNwYXJlbmN5LlxuICAgKiBAcGFyYW0gIHtjbGFzc05hbWV9ICdpcy1oZWFkLXRyYW5zcGFyZW50JyAtIEFkZCB0aGlzIGNsYXNzIHRvIHRoZSBib2R5IHRvIG1ha2UgaXQgdHJhbnNwYXJlbnQuXG4gICAqL1xuICBoZWFkZXJUcmFuc3BhcmVuY3koJy5oYXMtY292ZXInLCAnaXMtaGVhZC10cmFuc3BhcmVudCcpXG5cbiAgLyogVG9nZ2xlIE1vYmlsZSBNZW51XG4gIC8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLW1lbnUtb3BlbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtc2VhcmNoJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJylcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ2hhcy1tZW51JylcbiAgfSlcblxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtbWVudS1jbG9zZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2hhcy1tZW51JylcbiAgfSlcblxuICAvKipcbiAgICogU2VhcmNoIC0gTG9hZCB0aGUgbGF6eSBzZWFyY2ggU2NyaXB0XG4gICAqIEBwYXJhbSAge1N0cmluZ30gc2l0ZVNlYXJjaCAtIGFzc2V0cy9zY3JpcHRzL3NlYXJjaC5qc1xuICAgKi9cbiAgaWYgKHR5cGVvZiBzZWFyY2hTZXR0aW5ncyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHNpdGVTZWFyY2ggIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbG9hZFNjcmlwdChzaXRlU2VhcmNoKVxuICB9XG5cbiAgLyoqXG4gICAqIGhlYWRlciBoaWRlIHdoZW4gc2Nyb2xsaW5nIGRvd24gYW5kIHNob3cgd2hlbiBzY3JvbGxpbmcgdXBcbiAgICogQHBhcmFtICB7RWxlbWVudH0gJy5qcy1oaWRlLWhlYWRlcicgLSBIZWFkZXIgY2xhc3NcbiAgICovXG4gIHNjcm9sbEhpZGVIZWFkZXIoJy5qcy1oaWRlLWhlYWRlcicpXG5cbiAgLyoqXG4gICAqIFByb21vIFBvcHVwXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvciAtIFRoZSBjb250YWluZXIgSURcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbGF5IC0gRGVsYXkgaW4gbXMgYmVmb3JlIHNob3dpbmdcbiAgICovXG4gIHByb21vUG9wdXAoJyNqcy1wcm9tby1wb3B1cCcsIDIwMDApXG5cbiAgLy8gSW5pdGlhbGl6ZSBpbmZpbml0ZSBzY3JvbGwgb3JjaGVzdHJhdGlvbiBpZiBwcmVzZW50XG4gIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaW5maW5pdGUtY29udGFpbmVyJykpIHtcbiAgICBjb25zb2xlLmluZm8oJ1ttYWluXSAuanMtaW5maW5pdGUtY29udGFpbmVyIGRldGVjdGVkIOKAlCBpbml0aWFsaXppbmcgcG9zdEluZmluaXRlJylcbiAgICBwb3N0SW5maW5pdGUoKVxuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUuZGVidWcoJ1ttYWluXSAuanMtaW5maW5pdGUtY29udGFpbmVyIG5vdCBmb3VuZCDigJQgc2tpcHBpbmcgcG9zdEluZmluaXRlJylcbiAgfVxuXG4gIC8vIEVuZCBNNFNldHVwXG59XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBNNFNldHVwKVxuIiwiaW1wb3J0IEluZmluaXRlU2Nyb2xsIGZyb20gJ2luZmluaXRlLXNjcm9sbCdcclxuaW1wb3J0IEFuYWx5dGljc01hbmFnZXIgZnJvbSAnLi9saWIvYW5hbHl0aWNzJ1xyXG5pbXBvcnQgdmlkZW9SZXNwb25zaXZlIGZyb20gJy4vY29tcG9uZW50cy92aWRlby1yZXNwb25zaXZlJ1xyXG5pbXBvcnQgcmVzaXplSW1hZ2VzSW5HYWxsZXJpZXMgZnJvbSAnLi9jb21wb25lbnRzL3Jlc2l6ZS1pbWFnZXMtZ2FsbGVyaWVzJ1xyXG5pbXBvcnQgaGlnaGxpZ2h0UHJpc20gZnJvbSAnLi9jb21wb25lbnRzL2hpZ2hsaWdodC1wcmlzbWpzJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW5pdEluZmluaXRlU2Nyb2xsKCkge1xyXG4gIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1pbmZpbml0ZS1jb250YWluZXInKVxyXG4gIGNvbnN0IG5leHRMaW5rID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLW5leHQtcG9zdC1saW5rJylcclxuXHJcbiAgY29uc29sZS5kZWJ1ZygnW3Bvc3QtaW5maW5pdGVdIGluaXQgY2hlY2sgLSBjb250YWluZXI6JywgY29udGFpbmVyKVxyXG4gIGNvbnNvbGUuZGVidWcoJ1twb3N0LWluZmluaXRlXSBpbml0IGNoZWNrIC0gbmV4dExpbms6JywgbmV4dExpbmspXHJcblxyXG4gIC8vIElmIHdlIGRvbid0IGhhdmUgYSBjb250YWluZXIgb3IgYSBuZXh0IGxpbmssIHN0b3AuXHJcbiAgLy8gVGhpcyBhY3RzIGFzIHRoZSBjaGVjayBmb3IgXCJJcyB0aGlzIGEgc2luZ2xlIHBvc3QgcGFnZT9cIlxyXG4gIGlmICghY29udGFpbmVyIHx8ICFuZXh0TGluaykge1xyXG4gICAgY29uc29sZS5pbmZvKCdbcG9zdC1pbmZpbml0ZV0gYWJvcnRlZDogbWlzc2luZyBjb250YWluZXIgb3IgbmV4dCBsaW5rJylcclxuICAgIHJldHVyblxyXG4gIH1cclxuXHJcbiAgY29uc3QgYW5hbHl0aWNzID0gbmV3IEFuYWx5dGljc01hbmFnZXIoKVxyXG4gIGNvbnNvbGUuZGVidWcoJ1twb3N0LWluZmluaXRlXSBBbmFseXRpY3NNYW5hZ2VyIGluc3RhbnRpYXRlZCcpXHJcblxyXG4gIC8vIE9ic2VydmUgdGhlIGluaXRpYWwgYXJ0aWNsZVxyXG4gIGNvbnN0IGluaXRpYWxBcnRpY2xlID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5qcy1wb3N0LWFydGljbGUnKVxyXG4gIGNvbnNvbGUuZGVidWcoJ1twb3N0LWluZmluaXRlXSBpbml0aWFsQXJ0aWNsZTonLCBpbml0aWFsQXJ0aWNsZSlcclxuICBpZiAoaW5pdGlhbEFydGljbGUpIHtcclxuICAgIGFuYWx5dGljcy5vYnNlcnZlQXJ0aWNsZShpbml0aWFsQXJ0aWNsZSwgZG9jdW1lbnQudGl0bGUpXHJcbiAgICBjb25zb2xlLmluZm8oJ1twb3N0LWluZmluaXRlXSBvYnNlcnZpbmcgaW5pdGlhbCBhcnRpY2xlIGZvciBSZWFkIG1ldHJpYycsIHt0aXRsZTogZG9jdW1lbnQudGl0bGV9KVxyXG4gIH1cclxuXHJcbiAgLy8gUHJlZmV0Y2ggTkVYVCBhcnRpY2xlXHJcbiAgaWYgKG5leHRMaW5rICYmIG5leHRMaW5rLmhyZWYpIHtcclxuICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJylcclxuICAgIGxpbmsucmVsID0gJ3ByZWZldGNoJ1xyXG4gICAgbGluay5ocmVmID0gbmV4dExpbmsuaHJlZlxyXG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChsaW5rKVxyXG4gICAgY29uc29sZS5kZWJ1ZygnW3Bvc3QtaW5maW5pdGVdIHByZWZldGNoaW5nIG5leHQgYXJ0aWNsZScsIG5leHRMaW5rLmhyZWYpXHJcbiAgfVxyXG5cclxuICBjb25zdCBpbmZTY3JvbGwgPSBuZXcgSW5maW5pdGVTY3JvbGwoY29udGFpbmVyLCB7XHJcbiAgICBwYXRoOiAnLmpzLW5leHQtcG9zdC1saW5rJyxcclxuICAgIGFwcGVuZDogJy5qcy1wb3N0LWFydGljbGUnLFxyXG4gICAgaGlzdG9yeTogJ3B1c2gnLFxyXG4gICAgaGlzdG9yeVRpdGxlOiB0cnVlLFxyXG4gICAgc2Nyb2xsVGhyZXNob2xkOiA0MDAsXHJcbiAgICBoaWRlTmF2OiAnLnBhZ2luYXRpb24tZmFsbGJhY2snXHJcbiAgfSlcclxuXHJcbiAgY29uc29sZS5pbmZvKCdbcG9zdC1pbmZpbml0ZV0gSW5maW5pdGVTY3JvbGwgaW5pdGlhbGl6ZWQnKVxyXG5cclxuICBpbmZTY3JvbGwub24oJ2FwcGVuZCcsIChyZXNwb25zZSwgcGF0aCwgaXRlbXMpID0+IHtcclxuICAgIGNvbnNvbGUuZGVidWcoJ1twb3N0LWluZmluaXRlXSBhcHBlbmQgZXZlbnQgZmlyZWQnLCB7cGF0aCwgaXRlbXNDb3VudDogaXRlbXMgJiYgaXRlbXMubGVuZ3RofSlcclxuICAgIGNvbnN0IG5ld0FydGljbGUgPSBpdGVtcyAmJiBpdGVtc1swXVxyXG4gICAgaWYgKCFuZXdBcnRpY2xlKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybignW3Bvc3QtaW5maW5pdGVdIGFwcGVuZCBldmVudDogbm8gYXJ0aWNsZSBmb3VuZCBpbiBpdGVtcycpXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG5ld1RpdGxlID0gbmV3QXJ0aWNsZS5kYXRhc2V0ICYmIG5ld0FydGljbGUuZGF0YXNldC50aXRsZVxyXG4gICAgY29uc3QgbmV3VXJsID0gbmV3QXJ0aWNsZS5kYXRhc2V0ICYmIG5ld0FydGljbGUuZGF0YXNldC51cmxcclxuICAgIGNvbnN0IHByZXZVcmwgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWVcclxuXHJcbiAgICBjb25zb2xlLmluZm8oJ1twb3N0LWluZmluaXRlXSBuZXcgYXJ0aWNsZSBhcHBlbmRlZCcsIHt0aXRsZTogbmV3VGl0bGUsIHVybDogbmV3VXJsLCBwcmV2VXJsfSlcclxuXHJcbiAgICAvLyBSZS1pbml0IHNjb3BlZCBiZWhhdmlvcnNcclxuICAgIHRyeSB7IHZpZGVvUmVzcG9uc2l2ZShuZXdBcnRpY2xlKTsgY29uc29sZS5kZWJ1ZygnW3Bvc3QtaW5maW5pdGVdIHZpZGVvUmVzcG9uc2l2ZSByYW4nKSB9IGNhdGNoIChlKSB7IGNvbnNvbGUuZXJyb3IoJ1twb3N0LWluZmluaXRlXSB2aWRlb1Jlc3BvbnNpdmUgZXJyb3InLCBlKSB9XHJcbiAgICB0cnkgeyByZXNpemVJbWFnZXNJbkdhbGxlcmllcyhuZXdBcnRpY2xlKTsgY29uc29sZS5kZWJ1ZygnW3Bvc3QtaW5maW5pdGVdIHJlc2l6ZUltYWdlc0luR2FsbGVyaWVzIHJhbicpIH0gY2F0Y2ggKGUpIHsgY29uc29sZS5lcnJvcignW3Bvc3QtaW5maW5pdGVdIHJlc2l6ZUltYWdlc0luR2FsbGVyaWVzIGVycm9yJywgZSkgfVxyXG4gICAgdHJ5IHsgaGlnaGxpZ2h0UHJpc20obmV3QXJ0aWNsZSk7IGNvbnNvbGUuZGVidWcoJ1twb3N0LWluZmluaXRlXSBoaWdobGlnaHRQcmlzbSByYW4nKSB9IGNhdGNoIChlKSB7IGNvbnNvbGUuZXJyb3IoJ1twb3N0LWluZmluaXRlXSBoaWdobGlnaHRQcmlzbSBlcnJvcicsIGUpIH1cclxuXHJcbiAgICAvLyBBbmFseXRpY3NcclxuICAgIHRyeSB7IGFuYWx5dGljcy50cmFja1BhZ2VWaWV3KG5ld1VybCwgbmV3VGl0bGUsIHByZXZVcmwpOyBjb25zb2xlLmRlYnVnKCdbcG9zdC1pbmZpbml0ZV0gYW5hbHl0aWNzLnRyYWNrUGFnZVZpZXcgY2FsbGVkJykgfSBjYXRjaCAoZSkgeyBjb25zb2xlLmVycm9yKCdbcG9zdC1pbmZpbml0ZV0gYW5hbHl0aWNzLnRyYWNrUGFnZVZpZXcgZXJyb3InLCBlKSB9XHJcbiAgICB0cnkgeyBhbmFseXRpY3Mub2JzZXJ2ZUFydGljbGUobmV3QXJ0aWNsZSwgbmV3VGl0bGUpOyBjb25zb2xlLmRlYnVnKCdbcG9zdC1pbmZpbml0ZV0gYW5hbHl0aWNzLm9ic2VydmVBcnRpY2xlIGNhbGxlZCcpIH0gY2F0Y2ggKGUpIHsgY29uc29sZS5lcnJvcignW3Bvc3QtaW5maW5pdGVdIGFuYWx5dGljcy5vYnNlcnZlQXJ0aWNsZSBlcnJvcicsIGUpIH1cclxuXHJcbiAgICAvLyBDaGFpbiBwcmVmZXRjaGluZ1xyXG4gICAgY29uc3QgbmV4dE5leHRMaW5rID0gbmV3QXJ0aWNsZS5xdWVyeVNlbGVjdG9yKCcuanMtbmV4dC1wb3N0LWRhdGEnKVxyXG4gICAgaWYgKG5leHROZXh0TGluayAmJiBuZXh0TmV4dExpbmsuZGF0YXNldCAmJiBuZXh0TmV4dExpbmsuZGF0YXNldC51cmwpIHtcclxuICAgICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKVxyXG4gICAgICBsaW5rLnJlbCA9ICdwcmVmZXRjaCdcclxuICAgICAgbGluay5ocmVmID0gbmV4dE5leHRMaW5rLmRhdGFzZXQudXJsXHJcbiAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobGluaylcclxuICAgICAgY29uc29sZS5kZWJ1ZygnW3Bvc3QtaW5maW5pdGVdIHByZWZldGNoaW5nIG5leHQtbmV4dCBhcnRpY2xlJywgbGluay5ocmVmKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc29sZS5kZWJ1ZygnW3Bvc3QtaW5maW5pdGVdIG5vIG5leHQtbmV4dCBsaW5rIGZvdW5kIGluIGFwcGVuZGVkIGFydGljbGUnKVxyXG4gICAgfVxyXG4gIH0pXHJcblxyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsICgpID0+IHtcclxuICAgIGNvbnNvbGUuaW5mbygnW3Bvc3QtaW5maW5pdGVdIHBvcHN0YXRlIGV2ZW50JylcclxuICB9KVxyXG5cclxuICByZXR1cm4gaW5mU2Nyb2xsXHJcbn1cclxuIl19

//# sourceMappingURL=map/main.js.map
