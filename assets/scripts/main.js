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
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
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

process.nextTick = function (fun) {
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
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],13:[function(require,module,exports){
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

},{"./document-query-selector-all":14,"@babel/runtime/helpers/interopRequireDefault":1}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function _default(selector) {
  const parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
  return Array.prototype.slice.call(parent.querySelectorAll(selector), 0);
}

},{}],15:[function(require,module,exports){
(function (process){(function (){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initHapticFeedback;
var _haptic = require("../lib/haptic");
/**
 * haptic-feedback.js
 *
 * Attaches web-haptics feedback to any element via a `targets` array.
 * Each target maps a CSS selector → a named haptic preset (+ optional event).
 *
 * Uses a single delegated listener on `document` — works automatically
 * for elements added later by infinite scroll, no re-init needed.
 *
 * ─── Preset quick-reference ────────────────────────────────────────────────
 *
 *  "light"      single short tap     — nav links, toggles, minor taps
 *  "medium"     moderate tap         — buttons, card actions  (default)
 *  "heavy"      strong tap           — major actions, destructive confirms
 *  "soft"       cushioned tap        — subtle, rounded feel
 *  "rigid"      crisp hard tap       — precise, snappy feel
 *  "selection"  subtle tick          — sliders, pickers, steppers
 *  "success"    two ascending taps   — form saved, payment confirmed
 *  "warning"    two taps + hesitate  — destructive action ahead
 *  "error"      four rapid taps      — validation fail, network error
 *  "nudge"      strong + soft tail   — reminder / attention grab
 *  "buzz"       long vibration       — rare, high-attention moments
 *
 * ─── Usage ─────────────────────────────────────────────────────────────────
 *
 *   import initHapticFeedback from './app/haptic-feedback'
 *
 *   initHapticFeedback({
 *     targets: [
 *       { selector: 'button',               haptic: 'medium'    },
 *       { selector: 'a[href]',              haptic: 'light'     },
 *       { selector: '.kg-audio-seek-slider',haptic: 'selection', event: 'change' },
 *     ],
 *     exclude: ['[disabled]', '.no-haptic'],
 *   })
 */

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG = {
  targets: [{
    selector: 'button',
    haptic: 'medium'
  }, {
    selector: 'a[href]',
    haptic: 'heavy'
  }, {
    selector: '.hla',
    haptic: 'light'
  },
  // [data-ghost-search] clicks are handled by meilisearch.js (capture phase)
  // so they never reach this bubble-phase listener. Listed here only so that
  // if MeiliSearch is not loaded, the click still gets a haptic.
  {
    selector: '[data-ghost-search]',
    haptic: 'nudge'
  }, {
    selector: '[data-haptic]',
    haptic: 'medium'
  }, {
    selector: '.kg-audio-seek-slider',
    haptic: 'selection',
    event: 'change'
  }, {
    selector: '.kg-audio-volume-slider',
    haptic: 'selection',
    event: 'change'
  }],
  exclude: ['[disabled]', '[aria-disabled="true"]', '.no-haptic']
};

// ─── Init ────────────────────────────────────────────────────────────────────

function initHapticFeedback(userConfig = {}) {
  const config = {
    exclude: [...DEFAULT_CONFIG.exclude, ...(userConfig.exclude || [])],
    targets: userConfig.targets ? [...DEFAULT_CONFIG.targets, ...userConfig.targets] : [...DEFAULT_CONFIG.targets]
  };
  const excludeSelector = config.exclude.filter(Boolean).join(', ') || null;
  const byEvent = {};
  for (const target of config.targets) {
    const event = target.event || 'click';
    if (!byEvent[event]) byEvent[event] = [];
    byEvent[event].push(target);
  }
  for (const [event, targets] of Object.entries(byEvent)) {
    const presetMap = new Map();
    for (const t of targets) presetMap.set(t.selector.trim(), t.haptic || 'medium');
    const combinedSelector = [...presetMap.keys()].join(', ');
    document.addEventListener(event, function handleHaptic(e) {
      const el = e.target.closest(combinedSelector);
      if (!el) return;
      if (excludeSelector && el.matches(excludeSelector)) return;
      let preset = 'medium';
      for (const [sel, p] of presetMap) {
        try {
          if (el.matches(sel)) {
            preset = p;
            break;
          }
        } catch (_) {}
      }

      // data-haptic="preset" inline override — highest priority
      const dataPreset = el.getAttribute('data-haptic');
      if (dataPreset && dataPreset.trim()) preset = dataPreset.trim();
      _haptic.haptics.trigger(preset);
    }, {
      passive: true
    });
  }
  if (process.env.NODE_ENV !== 'production') {
    for (const [event, targets] of Object.entries(byEvent)) {
      console.debug(`[haptic-feedback] "${event}" listener →`, targets.map(t => `${t.selector} (${t.haptic || 'medium'})`).join(' | '));
    }
    if (excludeSelector) console.debug('[haptic-feedback] Excluding:', excludeSelector);
  }
}

}).call(this)}).call(this,require('_process'))

},{"../lib/haptic":26,"_process":12}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{"./document-query-selector-all":14,"@babel/runtime/helpers/interopRequireDefault":1}],18:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _loadScript = _interopRequireDefault(require("./load-script"));
/* global M4Gallery */
var _default = () => {
  if (M4Gallery === false) return;
  if (window.innerWidth < 768) return;
  const $postBody = document.getElementById('post-body');
  if (!$postBody) return;

  /* <img> Set Atribute (data-src - data-sub-html)
  /* ---------------------------------------------------------- */
  $postBody.querySelectorAll('img').forEach(el => {
    if (el.closest('a')) return;
    el.classList.add('M4-light-gallery');
    el.setAttribute('data-src', el.src);
    const nextElement = el.nextSibling;
    if (nextElement !== null && nextElement.nodeName.toLowerCase() === 'figcaption') {
      el.setAttribute('data-sub-html', nextElement.innerHTML);
    }
  });

  /* Lightgallery
  /* ---------------------------------------------------------- */
  const $imgLightGallery = $postBody.querySelectorAll('.M4-light-gallery');
  if (!$imgLightGallery.length) return;
  const loadCSS = href => {
    const link = document.createElement('link');
    link.media = 'print';
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => {
      link.media = 'all';
    };
    document.head.insertBefore(link, document.head.childNodes[document.head.childNodes.length - 1].nextSibling);
  };
  loadCSS('https://unpkg.com/lightgallery@2.1.8/css/lightgallery.css');
  (0, _loadScript.default)('https://unpkg.com/lightgallery@2.1.8/lightgallery.min.js', () => {
    window.lightGallery($postBody, {
      speed: 500,
      selector: '.M4-light-gallery'
    });
  });
};
exports.default = _default;

},{"./load-script":20,"@babel/runtime/helpers/interopRequireDefault":1}],19:[function(require,module,exports){
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

},{"../app/document-query-selector-all":14,"./load-script":20,"@babel/runtime/helpers/interopRequireDefault":1}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = settings => {
  const options = {
    selector: '#js-promo-popup',
    storageKey: 'm4-promo-hidden',
    delay: 1000,
    ...settings
  };
  const element = document.querySelector(options.selector);
  if (!element) return;
  const message = element.dataset.message;
  if (!message) return;
  if (window.sessionStorage.getItem(options.storageKey) === message) return;
  element.innerHTML = `
    <div class="promo-popup__content">
      <span class="promo-popup__message">${message}</span>
      <button class="promo-popup__btn js-promo-close">Don't show again</button>
    </div>
  `;
  window.setTimeout(() => {
    element.classList.add('is-visible');
  }, options.delay);
  element.addEventListener('click', e => {
    if (e.target.classList.contains('js-promo-close')) {
      e.preventDefault();
      element.classList.remove('is-visible');
      window.sessionStorage.setItem(options.storageKey, message);
      window.setTimeout(() => {
        element.innerHTML = '';
      }, 500);
    }
  });
};
exports.default = _default;

},{}],22:[function(require,module,exports){
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

},{"../app/document-query-selector-all":14,"@babel/runtime/helpers/interopRequireDefault":1}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = el => {
  const $header = document.querySelector(el);
  if (!$header) return;

  // Guard: .js-search may not exist on every page template
  const $search = document.querySelector('.js-search');
  let prevScrollpos = window.pageYOffset;

  // IMPORTANT: use addEventListener, not `window.onscroll = ...`
  // Assigning to window.onscroll gets silently overwritten by any other
  // script (including infinite-scroll) that does the same — this was why
  // scroll-hide-header stopped working after infinite scroll was added.
  window.addEventListener('scroll', function () {
    const currentScrollPos = window.pageYOffset;
    if (prevScrollpos > currentScrollPos) {
      // Scrolling up — reveal header
      $header.classList.remove('-top-18');
      if ($search) $search.classList.add('mt-16');
    } else {
      // Scrolling down — hide header
      $header.classList.add('-top-18');
      if ($search) $search.classList.remove('mt-16');
    }
    prevScrollpos = currentScrollPos;
  }, {
    passive: true
  });
};
exports.default = _default;

},{}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Matomo Analytics & Engagement Manager
 * Handles SPA-like page transitions and scoped scroll tracking.
 *
 * ─── Prerendering guard ───────────────────────────────────────────────────────
 * The Speculation Rules API (speculation-rules.js) currently uses `prefetch`,
 * which does NOT execute JavaScript, so Matomo is safe today.
 *
 * If you ever upgrade to `prerender`, JavaScript DOES run in the background tab.
 * Matomo's own tracking snippet (in your Ghost template / code injection) would
 * fire before the user actually views the page, double-counting the pageview.
 *
 * To fix that at the snippet level, wrap Matomo's trackPageView push like:
 *
 *   if (document.prerendering) {
 *     document.addEventListener('prerenderingchange', () => {
 *       _paq.push(['trackPageView'])
 *     }, { once: true })
 *   } else {
 *     _paq.push(['trackPageView'])
 *   }
 *
 * The `trackPageView` calls inside this class (used by infinite scroll) are
 * triggered by user scroll action and are therefore already safe — they only
 * fire once the article is actually visible.
 */
class AnalyticsManager {
  constructor() {
    this.currentPath = window.location.pathname;
    this.observers = new Map();
  }

  /**
   * Track a virtual pageview for an infinite-scroll article transition.
   * Safe from prerendering double-counting: this is only called from the
   * InfiniteScroll 'append' event, which requires real user scroll action.
   */
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

  /**
   * Observe an article element and fire a "Read" event once the user has
   * spent meaningful time with ≥50% of it in view.
   *
   * This is also safe from prerendering because IntersectionObserver entries
   * do not fire while the page is in the prerendered (background) state —
   * the page must be active and visible for intersections to occur.
   */
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

},{}],26:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.haptics = exports.defaultPatterns = exports.WebHaptics = void 0;
/**
 * haptic.js
 * Core haptic engine ported from web-haptics (MIT © lochie).
 * https://github.com/lochie/web-haptics
 *
 * Preset reference (Apple HIG aligned):
 *
 * Notification  → "success"    two ascending taps — positive outcome
 *               → "warning"    two taps with hesitation — caution ahead
 *               → "error"      four rapid harsh taps — failure
 *
 * Impact        → "light"      single short tap — minor interaction
 *               → "medium"     moderate tap — standard button press
 *               → "heavy"      strong tap — major state change
 *               → "soft"       cushioned tap — rounded feel
 *               → "rigid"      crisp hard tap — precise feel
 *
 * Selection     → "selection"  subtle tick — picker / slider step
 *
 * Custom        → "nudge"      strong tap + soft tail
 *               → "buzz"       long vibration
 */

// ─── Patterns ────────────────────────────────────────────────────────────────

const defaultPatterns = exports.defaultPatterns = {
  // Notification
  success: {
    pattern: [{
      duration: 30,
      intensity: 0.5
    }, {
      delay: 60,
      duration: 40,
      intensity: 1
    }]
  },
  warning: {
    pattern: [{
      duration: 40,
      intensity: 0.8
    }, {
      delay: 100,
      duration: 40,
      intensity: 0.6
    }]
  },
  error: {
    pattern: [{
      duration: 40,
      intensity: 0.7
    }, {
      delay: 40,
      duration: 40,
      intensity: 0.7
    }, {
      delay: 40,
      duration: 40,
      intensity: 0.9
    }, {
      delay: 40,
      duration: 50,
      intensity: 0.6
    }]
  },
  // Impact
  light: {
    pattern: [{
      duration: 15,
      intensity: 0.4
    }]
  },
  medium: {
    pattern: [{
      duration: 25,
      intensity: 0.7
    }]
  },
  heavy: {
    pattern: [{
      duration: 35,
      intensity: 1
    }]
  },
  soft: {
    pattern: [{
      duration: 40,
      intensity: 0.5
    }]
  },
  rigid: {
    pattern: [{
      duration: 10,
      intensity: 1
    }]
  },
  // Selection
  selection: {
    pattern: [{
      duration: 8,
      intensity: 0.3
    }]
  },
  // Custom
  nudge: {
    pattern: [{
      duration: 80,
      intensity: 0.8
    }, {
      delay: 80,
      duration: 50,
      intensity: 0.3
    }]
  },
  buzz: {
    pattern: [{
      duration: 1000,
      intensity: 1
    }]
  }
};

// ─── Internal constants ───────────────────────────────────────────────────────

const TOGGLE_MIN = 16; // ms at intensity 1 (every frame)
const TOGGLE_MAX = 184; // range above min  (0.5 ≈ 100ms)
const MAX_PHASE_MS = 1000; // browser haptic window limit
const PWM_CYCLE = 20; // ms per intensity modulation cycle

// ─── Internal helpers ─────────────────────────────────────────────────────────

function normalizeInput(input) {
  if (input == null) return {
    vibrations: [{
      duration: 25,
      intensity: 0.7
    }]
  }; // medium default
  if (typeof input === 'number') return {
    vibrations: [{
      duration: input
    }]
  };
  if (typeof input === 'string') {
    const preset = defaultPatterns[input];
    if (!preset) {
      console.warn(`[web-haptics] Unknown preset: "${input}"`);
      return null;
    }
    return {
      vibrations: preset.pattern.map(v => ({
        ...v
      }))
    };
  }
  if (Array.isArray(input)) {
    if (!input.length) return {
      vibrations: []
    };
    if (typeof input[0] === 'number') {
      const vibrations = [];
      for (let i = 0; i < input.length; i += 2) {
        const delay = i > 0 ? input[i - 1] : 0;
        vibrations.push({
          ...(delay > 0 && {
            delay
          }),
          duration: input[i]
        });
      }
      return {
        vibrations
      };
    }
    return {
      vibrations: input.map(v => ({
        ...v
      }))
    };
  }
  if (input && input.pattern) return {
    vibrations: input.pattern.map(v => ({
      ...v
    }))
  };
  return null;
}
function modulateVibration(duration, intensity) {
  if (intensity >= 1) return [duration];
  if (intensity <= 0) return [];
  const onTime = Math.max(1, Math.round(PWM_CYCLE * intensity));
  const offTime = PWM_CYCLE - onTime;
  const result = [];
  let remaining = duration;
  while (remaining >= PWM_CYCLE) {
    result.push(onTime, offTime);
    remaining -= PWM_CYCLE;
  }
  if (remaining > 0) {
    const remOn = Math.max(1, Math.round(remaining * intensity));
    result.push(remOn);
    const remOff = remaining - remOn;
    if (remOff > 0) result.push(remOff);
  }
  return result;
}
function toVibratePattern(vibrations, defaultIntensity) {
  const result = [];
  for (const vib of vibrations) {
    const intensity = Math.max(0, Math.min(1, vib.intensity ?? defaultIntensity));
    const delay = vib.delay ?? 0;
    if (delay > 0) {
      if (result.length && result.length % 2 === 0) result[result.length - 1] += delay;else {
        if (!result.length) result.push(0);
        result.push(delay);
      }
    }
    const modulated = modulateVibration(vib.duration, intensity);
    if (!modulated.length) {
      if (result.length && result.length % 2 === 0) result[result.length - 1] += vib.duration;else if (vib.duration > 0) result.push(0, vib.duration);
      continue;
    }
    for (const seg of modulated) result.push(seg);
  }
  return result;
}

// ─── WebHaptics class ─────────────────────────────────────────────────────────

let _instanceCounter = 0;
class WebHaptics {
  constructor(options = {}) {
    this._id = ++_instanceCounter;
    this._debug = options.debug ?? false;
    this._label = null;
    this._domReady = false;
    this._rafId = null;
    this._resolve = null;
  }
  static get isSupported() {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  }

  // The checkbox-switch trick below only produces a real haptic on iOS/iPadOS,
  // where Safari maps a <input switch> toggle onto the native HIG tick. It was
  // previously gated on `!isSupported`, which is ALSO true on desktop Firefox
  // and desktop Safari (neither implements navigator.vibrate). On those the
  // trick buys nothing and costs a lot: clicking the label focuses the hidden
  // checkbox at the end of <body>, which scrolls the document to the bottom and
  // steals focus from whatever the reader was using -- notably the Ghost Portal
  // sign-in iframe, whose input then silently refuses typing and pasting.
  static get _usesSwitchFallback() {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    // iPhone/iPod/iPad, plus iPadOS 13+ which reports itself as "Macintosh".
    return /iP(hone|od|ad)/.test(ua) || /Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1;
  }
  async trigger(input, options = {}) {
    const normalized = normalizeInput(input);
    if (!normalized) return;
    const {
      vibrations
    } = normalized;
    if (!vibrations.length) return;
    const defaultIntensity = Math.max(0, Math.min(1, options.intensity ?? 0.5));
    for (const vib of vibrations) {
      if (vib.duration > MAX_PHASE_MS) vib.duration = MAX_PHASE_MS;
      if (!Number.isFinite(vib.duration) || vib.duration < 0 || vib.delay !== undefined && (!Number.isFinite(vib.delay) || vib.delay < 0)) {
        console.warn('[web-haptics] Invalid vibration values — skipping.');
        return;
      }
    }
    if (WebHaptics.isSupported) {
      navigator.vibrate(toVibratePattern(vibrations, defaultIntensity));
    }

    // iOS / Safari: use the checkbox-switch trick (fires native HIG haptic)
    if (!WebHaptics.isSupported && WebHaptics._usesSwitchFallback || this._debug) {
      this._ensureDOM();
      if (!this._label) return;
      this._stopPattern();
      const firstDelay = vibrations[0]?.delay ?? 0;
      const firstClickFired = firstDelay === 0;
      if (firstClickFired) this._tick();
      await this._runPattern(vibrations, defaultIntensity, firstClickFired);
    }
  }
  cancel() {
    this._stopPattern();
    if (WebHaptics.isSupported) navigator.vibrate(0);
  }
  destroy() {
    this._stopPattern();
    if (this._label) {
      this._label.remove();
      this._label = null;
      this._domReady = false;
    }
  }
  _stopPattern() {
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    if (this._resolve) {
      this._resolve();
      this._resolve = null;
    }
  }
  _runPattern(vibrations, defaultIntensity, firstClickFired) {
    return new Promise(resolve => {
      this._resolve = resolve;
      const phases = [];
      let cumulative = 0;
      for (const vib of vibrations) {
        const intensity = Math.max(0, Math.min(1, vib.intensity ?? defaultIntensity));
        const delay = vib.delay ?? 0;
        if (delay > 0) {
          cumulative += delay;
          phases.push({
            end: cumulative,
            isOn: false,
            intensity: 0
          });
        }
        cumulative += vib.duration;
        phases.push({
          end: cumulative,
          isOn: true,
          intensity
        });
      }
      const totalDuration = cumulative;
      let startTime = 0,
        lastToggleTime = -1;
      const loop = time => {
        if (!startTime) startTime = time;
        const elapsed = time - startTime;
        if (elapsed >= totalDuration) {
          this._rafId = null;
          this._resolve = null;
          resolve();
          return;
        }
        let phase = phases[0];
        for (const p of phases) {
          if (elapsed < p.end) {
            phase = p;
            break;
          }
        }
        if (phase.isOn) {
          const interval = TOGGLE_MIN + (1 - phase.intensity) * TOGGLE_MAX;
          if (lastToggleTime === -1) {
            lastToggleTime = time;
            if (!firstClickFired) {
              this._tick();
              firstClickFired = true;
            }
          } else if (time - lastToggleTime >= interval) {
            this._tick();
            lastToggleTime = time;
          }
        }
        this._rafId = requestAnimationFrame(loop);
      };
      this._rafId = requestAnimationFrame(loop);
    });
  }

  // Fires the switch toggle without letting it disturb the page. Clicking a
  // <label> forwards the click to its checkbox, which FOCUSES that checkbox --
  // and focusing an element scrolls it into view. Both effects are restored
  // synchronously here so the reader never sees them.
  _tick() {
    if (!this._label) return;
    const doc = this._label.ownerDocument;
    const prev = doc.activeElement;
    const scroll = {
      x: window.scrollX,
      y: window.scrollY
    };
    this._label.click();
    if (doc.activeElement !== prev) {
      if (prev && typeof prev.focus === 'function') prev.focus({
        preventScroll: true
      });else if (doc.activeElement && typeof doc.activeElement.blur === 'function') doc.activeElement.blur();
    }
    if (window.scrollX !== scroll.x || window.scrollY !== scroll.y) {
      window.scrollTo(scroll.x, scroll.y);
    }
  }
  _ensureDOM() {
    if (this._domReady || typeof document === 'undefined') return;
    const id = `web-haptics-${this._id}`;
    const label = document.createElement('label');
    label.htmlFor = id;
    label.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;opacity:0;pointer-events:none;overflow:hidden';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.setAttribute('switch', '');
    checkbox.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;opacity:0;pointer-events:none';
    label.appendChild(checkbox);
    document.body.appendChild(label);
    this._label = label;
    this._domReady = true;
  }
}

// ─── Shared singleton used by haptic-feedback.js ──────────────────────────────
exports.WebHaptics = WebHaptics;
const haptics = exports.haptics = new WebHaptics();

},{}],27:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MEILISEARCH_ENABLED = void 0;
exports.default = initMeiliSearch;
var _haptic = require("./haptic");
/**
 * meilisearch.js
 *
 * Full MeiliSearch integration — init, click interception, haptics, animation.
 *
 * ─── Rollback ──────────────────────────────────────────────────────────────
 * To switch back to the theme's native FlexSearch:
 *   1. Set MEILISEARCH_ENABLED = false below
 *   2. Remove the CDN <script> and <link> from default.hbs
 *   3. Rebuild
 * Everything else (header buttons, CSS selectors) stays the same.
 *
 * ─── Animation strategy ────────────────────────────────────────────────────
 * The library mounts its container div during initialize(), NOT on first
 * open(). So by the time the user clicks, the container already exists in the
 * DOM and a MutationObserver watching for new body children never fires.
 *
 * Instead:
 *   1. After initialize(), poll for the container with findContainer()
 *   2. Save it as _searchContainer
 *   3. On every open() call, re-trigger the CSS keyframe via a forced reflow
 *      (void el.offsetWidth) so the animation plays each time
 *
 * ─── Haptic strategy ───────────────────────────────────────────────────────
 * Uses a custom two-pulse pattern to match the visual "snap open, settle"
 * feel of the slide animation rather than the generic single tap used by
 * other buttons. Tune SEARCH_HAPTIC to taste.
 */

// ─── Toggle ───────────────────────────────────────────────────────────────────

/**
 * Set to false to disable MeiliSearch and fall back to the theme's native
 * FlexSearch. main.js reads this flag to decide whether to load search.js.
 */
const MEILISEARCH_ENABLED = exports.MEILISEARCH_ENABLED = true;

// ─── Config ───────────────────────────────────────────────────────────────────

const MS_CONFIG = {
  meilisearchHost: 'https://m44.cl/search',
  meilisearchApiKey: '27c8ffa68ef4045f6116ba22498b1a19a19acc6f00d58678d4ee8f52810fd2ba',
  indexName: 'ghost_posts',
  theme: 'system' // 'light' | 'dark' | 'system'
};

/**
 * Haptic pattern for opening search.
 * A sharp snap (intensity 0.9, 25 ms) followed by a soft settle
 * (intensity 0.25, 15 ms after 50 ms gap) — mirrors the fast-in /
 * slow-out feel of the ms-slide-in CSS animation.
 * Swap for any preset name ('medium', 'nudge', etc.) or leave as a
 * custom Vibration[] array.
 */
const SEARCH_HAPTIC = [{
  duration: 25,
  intensity: 0.9
}, {
  delay: 50,
  duration: 15,
  intensity: 0.25
}];

// ─── State ────────────────────────────────────────────────────────────────────

let _searchContainer = null; // reference to the modal root element

// ─── Container detection ──────────────────────────────────────────────────────

/**
 * Try to find the search modal container using multiple strategies:
 *   1. Known IDs used by Ghost's sodo-search / common forks
 *   2. Any new child of <body> that appeared since `snapshot` was taken
 *
 * Returns the element or null.
 */
function findContainer(snapshot) {
  const byId = document.getElementById('ghost-search-root') || document.getElementById('sodo-search-root') || document.querySelector('[data-ghost-search-root]');
  if (byId) return byId;
  if (snapshot) {
    const newKids = [...document.body.children].filter(el => !snapshot.has(el));
    if (newKids.length) return newKids[newKids.length - 1];
  }
  return null;
}

/**
 * Poll for the container after initialize().
 * The library may render the container asynchronously (React), so we check
 * across several animation frames rather than in the same tick.
 */
function detectContainerAfterInit(snapshot) {
  let attempts = 0;
  const check = () => {
    attempts++;
    const found = findContainer(snapshot);
    if (found) {
      _searchContainer = found;
      console.debug('[meilisearch] modal container detected:', _searchContainer.id || _searchContainer.className || _searchContainer.tagName);
      return;
    }
    if (attempts < 15) requestAnimationFrame(check);
  };
  requestAnimationFrame(check);
}

// ─── Animation ────────────────────────────────────────────────────────────────

/**
 * Trigger the ms-slide-in keyframe on the search container.
 * Removing the class and forcing a reflow before re-adding it restarts
 * the animation cleanly even if it was already applied on a previous open.
 */
function animateSearchOpen() {
  if (!_searchContainer) return;
  _searchContainer.classList.remove('ms-search-entering');
  void _searchContainer.offsetWidth; // force reflow → restart keyframe
  _searchContainer.classList.add('ms-search-entering');
  _searchContainer.addEventListener('animationend', () => {
    _searchContainer.classList.remove('ms-search-entering');
  }, {
    once: true
  });
}

/**
 * After calling open(), retry finding the container if it isn't known yet.
 * This covers the (unlikely) case where the container is added on first open
 * rather than on init.
 */
function animateWithRetry(snapshot, attempts = 0) {
  if (_searchContainer) {
    animateSearchOpen();
    return;
  }
  const found = findContainer(snapshot);
  if (found) {
    _searchContainer = found;
    animateSearchOpen();
    return;
  }
  if (attempts < 10) {
    requestAnimationFrame(() => animateWithRetry(snapshot, attempts + 1));
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function initInstance() {
  if (window.GhostMeilisearchSearch && !window.ghostMeilisearchSearch) {
    window.__MS_SEARCH_CONFIG__ = MS_CONFIG;
    const snapshot = new Set([...document.body.children]);
    window.ghostMeilisearchSearch = window.GhostMeilisearchSearch.initialize(MS_CONFIG);
    // Find whatever the library just added to <body>
    detectContainerAfterInit(snapshot);
  }
}

// ─── Click interception ───────────────────────────────────────────────────────

/**
 * Attach capture-phase listeners to every [data-ghost-search] element.
 * Capture phase ensures our handler runs before Ghost's bubble-phase handler.
 * stopImmediatePropagation prevents Ghost's native search from opening.
 */
function wireSearchTriggers() {
  document.querySelectorAll('[data-ghost-search]').forEach(el => {
    if (el.dataset.msWired) return;
    el.dataset.msWired = '1';
    el.addEventListener('click', e => {
      e.preventDefault();
      e.stopImmediatePropagation();

      // Haptic fires synchronously — still within the user gesture context
      // required by iOS Safari for the switch-checkbox trick to produce a tap.
      _haptic.haptics.trigger(SEARCH_HAPTIC);

      // Snapshot body children BEFORE open() in case the container is
      // added lazily on first open rather than during initialize().
      const snapshot = new Set([...document.body.children]);
      window.ghostMeilisearchSearch?.open();
      animateWithRetry(snapshot);
    }, true /* capture phase */);
  });
}

// ─── Public ───────────────────────────────────────────────────────────────────

function initMeiliSearch() {
  if (!MEILISEARCH_ENABLED) return;
  initInstance();
  wireSearchTriggers();

  // Poll if the CDN bundle hasn't executed yet (defer in default.hbs means
  // it runs after parsing but timing relative to DOMContentLoaded varies)
  if (!window.ghostMeilisearchSearch) {
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      initInstance();
      if (window.ghostMeilisearchSearch || attempts >= 20) clearInterval(poll);
    }, 100);
  }
}

},{"./haptic":26}],28:[function(require,module,exports){
(function (process){(function (){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initSpeculationRules;
/**
 * speculation-rules.js
 *
 * Injects a <script type="speculationrules"> tag to enable browser-native
 * hover-triggered prefetching via the Speculation Rules API.
 *
 * Strategy: prefetch only (not prerender) — safer because:
 *   - Prefetch only downloads HTML; it does NOT execute JavaScript
 *   - No risk of Matomo double-counting pageviews
 *   - No risk of side-effect routes (/logout, /signout) triggering early
 *   - Lower bandwidth cost on mobile
 *
 * Eagerness "moderate": browser prefetches after the pointer has hovered
 * a link for ~200 ms. This filters out accidental mouse-overs and avoids
 * blasting the server with every link on the page.
 *
 * Upgrade path: once you confirm prefetch is working well and your
 * Cloudflare worker passes through prefetch requests cleanly, you can
 * promote the rule to `prerender` for near-instant navigations. Just be
 * sure to add the Matomo prerendering guard (see analytics.js) first.
 *
 * ─── Cloudflare Splash Screen note ──────────────────────────────────────────
 * Prefetch requests carry cookies, so users who already passed the splash
 * (cookie set) are fine. First-time visitors may trigger the worker on
 * prefetch. Confirm your worker passes requests that include the header:
 *   Sec-Purpose: prefetch
 * or add a worker check like:
 *   if (request.headers.get('Sec-Purpose') === 'prefetch') return fetch(request)
 *
 * ─── CSP note ────────────────────────────────────────────────────────────────
 * If you have a Content-Security-Policy header, add:
 *   script-src 'inline-speculation-rules'
 * (This is a dedicated CSP source expression, NOT 'unsafe-inline'.)
 */

function initSpeculationRules() {
  // Bail out on unsupported browsers (Firefox, Safari) — progressive enhancement.
  // The site works perfectly for them; Chromium users get the speed boost.
  if (!HTMLScriptElement.supports?.('speculationrules')) return;

  // Avoid double-injecting (e.g. if main.js is somehow called twice)
  if (document.querySelector('script[type="speculationrules"]')) return;
  const rules = {
    prefetch: [{
      source: 'document',
      where: {
        and: [
        // Only same-origin links (cross-origin is the default browser behaviour)
        {
          href_matches: '/*'
        },
        // ── Ghost admin & API ──────────────────────────────────────────
        {
          not: {
            href_matches: '/ghost/*'
          }
        },
        // ── Auth / membership side-effects ────────────────────────────
        {
          not: {
            href_matches: '/logout*'
          }
        }, {
          not: {
            href_matches: '/signout*'
          }
        }, {
          not: {
            href_matches: '/subscribe*'
          }
        },
        // Portal links open a modal, not a navigation
        {
          not: {
            selector_matches: '[data-portal]'
          }
        }, {
          not: {
            selector_matches: '[data-members-signout]'
          }
        },
        // ── Search triggers ───────────────────────────────────────────
        // These open the MeiliSearch modal, not a page
        {
          not: {
            selector_matches: '[data-ghost-search]'
          }
        },
        // ── Hash / fragment-only links ────────────────────────────────
        // e.g. <a href="#section"> — no navigation happens
        {
          not: {
            href_matches: '/#*'
          }
        },
        // ── Infinite scroll "next" data nodes ─────────────────────────
        // These are <div data-url="…"> not real <a> tags, so they're
        // already excluded — listed here for clarity
        {
          not: {
            selector_matches: '[data-next-post-data]'
          }
        }]
      },
      eagerness: 'moderate' // hover ~200 ms before prefetch fires
    }]
  };
  const script = document.createElement('script');
  script.type = 'speculationrules';
  script.textContent = JSON.stringify(rules);
  document.head.appendChild(script);
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[speculation-rules] Injected prefetch rules (moderate eagerness)');
  }
}

}).call(this)}).call(this,require('_process'))

},{"_process":12}],29:[function(require,module,exports){
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
var _hapticFeedback = _interopRequireDefault(require("./app/haptic-feedback"));
var _meilisearch = _interopRequireWildcard(require("./lib/meilisearch"));
var _speculationRules = _interopRequireDefault(require("./lib/speculation-rules"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/* global followSocialMedia siteSearch */

// lib

const M4Setup = () => {
  console.debug('[main] M4Setup starting');
  if (typeof followSocialMedia === 'object' && followSocialMedia !== null) {
    (0, _socialMedia.default)(followSocialMedia, '.js-social-media');
  }
  (0, _darkMode.default)('.js-dark-mode');
  (0, _headerTransparency.default)('.has-cover', 'is-head-transparent');
  const $menuOpen = document.querySelector('.js-menu-open');
  const $menuClose = document.querySelector('.js-menu-close');
  const $search = document.querySelector('.js-search');
  let _menuScrollY = 0;
  if ($menuOpen) {
    $menuOpen.addEventListener('click', e => {
      e.preventDefault();
      _menuScrollY = window.scrollY;
      if ($search) $search.classList.add('hidden');
      document.body.classList.add('has-menu');
      // Firefox scrolls to the menu wrapper on overflow:hidden; restore position.
      window.scrollTo(0, _menuScrollY);
    });
  }
  if ($menuClose) {
    $menuClose.addEventListener('click', e => {
      e.preventDefault();
      document.body.classList.remove('has-menu');
      window.scrollTo(0, _menuScrollY);
    });
  }

  // ── Search ─────────────────────────────────────────────────────────────────
  if (!_meilisearch.MEILISEARCH_ENABLED) {
    if (typeof searchSettings !== 'undefined' && typeof siteSearch !== 'undefined') {
      (0, _loadScript.default)(siteSearch);
    }
  }
  (0, _scrollHideHeader.default)('.js-hide-header');
  (0, _promoPopup.default)('#js-promo-popup', 2000);
  if (document.querySelector('.js-infinite-container')) {
    console.info('[main] .js-infinite-container detected — initializing postInfinite');
    (0, _postInfinite.default)();
  } else {
    console.debug('[main] .js-infinite-container not found — skipping postInfinite');
  }

  // ── Haptic feedback ────────────────────────────────────────────────────────
  (0, _hapticFeedback.default)({
    targets: [],
    exclude: []
  });

  // ── MeiliSearch ────────────────────────────────────────────────────────────
  (0, _meilisearch.default)();

  // ── Speculation Rules (prefetch on hover) ──────────────────────────────────
  // Progressive enhancement: Chromium only. No-ops silently on Firefox/Safari.
  // See src/js/lib/speculation-rules.js for exclusion list and upgrade notes.
  (0, _speculationRules.default)();
};
document.addEventListener('DOMContentLoaded', M4Setup);

},{"./app/dark-mode":13,"./app/haptic-feedback":15,"./app/header-transparency":16,"./app/social-media":17,"./components/load-script":20,"./components/promo-popup":21,"./components/scroll-hide-header":23,"./lib/meilisearch":27,"./lib/speculation-rules":28,"./post-infinite":30,"@babel/runtime/helpers/interopRequireDefault":1,"lazysizes":11}],30:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _infiniteScroll = _interopRequireDefault(require("infinite-scroll"));
var _analytics = _interopRequireDefault(require("./lib/analytics"));
var _videoResponsive = _interopRequireDefault(require("./components/video-responsive"));
var _resizeImagesGalleries = _interopRequireDefault(require("./components/resize-images-galleries"));
var _highlightPrismjs = _interopRequireDefault(require("./components/highlight-prismjs"));
var _gallery = _interopRequireDefault(require("./components/gallery"));
var _default = () => {
  if (window.M4InfiniteScrollActive) return;
  const container = document.querySelector('.js-infinite-container');
  const initialNextLink = document.querySelector('.js-next-post-link');

  // Mobile Menu Diagnostic
  const menuToggle = document.querySelector('.js-menu-toggle');
  console.log('[InfiniteScroll] DOM Check:', {
    container: !!container,
    nextLink: !!initialNextLink,
    menuToggle: !!menuToggle
  });
  if (!container || !initialNextLink) return;
  const analytics = new _analytics.default();
  const firstArticle = container.querySelector('.js-post-article');
  if (firstArticle) {
    analytics.observeArticle(firstArticle, document.title);
  }
  const infScroll = new _infiniteScroll.default(container, {
    // The path function is evaluated before every fetch
    path: function () {
      const articles = document.querySelectorAll('.js-post-article');
      const lastArticle = articles[articles.length - 1];
      if (!lastArticle) return null;
      const nextData = lastArticle.querySelector('.js-next-post-data');
      const nextUrl = nextData ? nextData.dataset.url : null;
      if (nextUrl) {
        console.log('[InfiniteScroll] Next target identified:', nextUrl);
      }
      return nextUrl;
    },
    append: '.js-post-article',
    history: 'push',
    historyTitle: true,
    scrollThreshold: 800,
    loadOnScroll: true
  });
  infScroll.on('append', (response, path, items) => {
    const newArticle = items[0];
    if (!newArticle) return;
    console.log('[InfiniteScroll] Appended:', newArticle.dataset.title);

    // Re-initialize theme logic for the newly added post content
    (0, _videoResponsive.default)(newArticle);
    (0, _resizeImagesGalleries.default)(newArticle);
    (0, _highlightPrismjs.default)(newArticle);
    (0, _gallery.default)();
    analytics.trackPageView(newArticle.dataset.url, newArticle.dataset.title, window.location.pathname);
    analytics.observeArticle(newArticle, newArticle.dataset.title);
  });
  infScroll.on('error', (error, path) => {
    console.error('[InfiniteScroll] Fetch failed:', error, path);
  });
  window.M4InfiniteScrollActive = true;
};
exports.default = _default;

},{"./components/gallery":18,"./components/highlight-prismjs":19,"./components/resize-images-galleries":22,"./components/video-responsive":24,"./lib/analytics":25,"@babel/runtime/helpers/interopRequireDefault":1,"infinite-scroll":7}]},{},[29])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHQuanMiLCJub2RlX21vZHVsZXMvZXYtZW1pdHRlci9ldi1lbWl0dGVyLmpzIiwibm9kZV9tb2R1bGVzL2Zpenp5LXVpLXV0aWxzL3V0aWxzLmpzIiwibm9kZV9tb2R1bGVzL2luZmluaXRlLXNjcm9sbC9qcy9idXR0b24uanMiLCJub2RlX21vZHVsZXMvaW5maW5pdGUtc2Nyb2xsL2pzL2NvcmUuanMiLCJub2RlX21vZHVsZXMvaW5maW5pdGUtc2Nyb2xsL2pzL2hpc3RvcnkuanMiLCJub2RlX21vZHVsZXMvaW5maW5pdGUtc2Nyb2xsL2pzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2luZmluaXRlLXNjcm9sbC9qcy9wYWdlLWxvYWQuanMiLCJub2RlX21vZHVsZXMvaW5maW5pdGUtc2Nyb2xsL2pzL3Njcm9sbC13YXRjaC5qcyIsIm5vZGVfbW9kdWxlcy9pbmZpbml0ZS1zY3JvbGwvanMvc3RhdHVzLmpzIiwibm9kZV9tb2R1bGVzL2xhenlzaXplcy9sYXp5c2l6ZXMuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwic3JjL2pzL2FwcC9kYXJrLW1vZGUuanMiLCJzcmMvanMvYXBwL2RvY3VtZW50LXF1ZXJ5LXNlbGVjdG9yLWFsbC5qcyIsInNyYy9qcy9hcHAvaGFwdGljLWZlZWRiYWNrLmpzIiwic3JjL2pzL2FwcC9oZWFkZXItdHJhbnNwYXJlbmN5LmpzIiwic3JjL2pzL2FwcC9zb2NpYWwtbWVkaWEuanMiLCJzcmMvanMvY29tcG9uZW50cy9nYWxsZXJ5LmpzIiwic3JjL2pzL2NvbXBvbmVudHMvaGlnaGxpZ2h0LXByaXNtanMuanMiLCJzcmMvanMvY29tcG9uZW50cy9sb2FkLXNjcmlwdC5qcyIsInNyYy9qcy9jb21wb25lbnRzL3Byb21vLXBvcHVwLmpzIiwic3JjL2pzL2NvbXBvbmVudHMvcmVzaXplLWltYWdlcy1nYWxsZXJpZXMuanMiLCJzcmMvanMvY29tcG9uZW50cy9zY3JvbGwtaGlkZS1oZWFkZXIuanMiLCJzcmMvanMvY29tcG9uZW50cy92aWRlby1yZXNwb25zaXZlLmpzIiwic3JjL2pzL2xpYi9hbmFseXRpY3MuanMiLCJzcmMvanMvbGliL2hhcHRpYy5qcyIsInNyYy9qcy9saWIvbWVpbGlzZWFyY2guanMiLCJzcmMvanMvbGliL3NwZWN1bGF0aW9uLXJ1bGVzLmpzIiwic3JjL2pzL21haW4uanMiLCJzcmMvanMvcG9zdC1pbmZpbml0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25YQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOXlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7QUN2TEEs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QUFFO01BQUUsU0FBUyxFQUFFO0lBQUksQ0FBQyxFQUFFO01BQUUsS0FBSyxFQUFFLEVBQUU7TUFBRyxRQUFRLEVBQUUsRUFBRTtNQUFFLFNBQVMsRUFBRTtJQUFJLENBQUM7RUFBRSxDQUFDO0VBQ3hHLE9BQU8sRUFBSTtJQUFFLE9BQU8sRUFBRSxDQUFDO01BQUUsUUFBUSxFQUFFLEVBQUU7TUFBRSxTQUFTLEVBQUU7SUFBSSxDQUFDLEVBQUU7TUFBRSxLQUFLLEVBQUUsR0FBRztNQUFFLFFBQVEsRUFBRSxFQUFFO01BQUUsU0FBUyxFQUFFO0lBQUksQ0FBQztFQUFFLENBQUM7RUFDeEcsS0FBSyxFQUFNO0lBQUUsT0FBTyxFQUFFLENBQUM7TUFBRSxRQUFRLEVBQUUsRUFBRTtNQUFFLFNBQVMsRUFBRTtJQUFJLENBQUMsRUFBRTtNQUFFLEtBQUssRUFBRSxFQUFFO01BQUcsUUFBUSxFQUFFLEVBQUU7TUFBRSxTQUFTLEVBQUU7SUFBSSxDQUFDLEVBQzdFO01BQUUsS0FBSyxFQUFFLEVBQUU7TUFBRyxRQUFRLEVBQUUsRUFBRTtNQUFFLFNBQVMsRUFBRTtJQUFJLENBQUMsRUFBRTtNQUFFLEtBQUssRUFBRSxFQUFFO01BQUUsUUFBUSxFQUFFLEVBQUU7TUFBRSxTQUFTLEVBQUU7SUFBSSxDQUFDO0VBQUUsQ0FBQztFQUNwSDtFQUNBLEtBQUssRUFBTTtJQUFFLE9BQU8sRUFBRSxDQUFDO01BQUUsUUFBUSxFQUFFLEVBQUU7TUFBRSxTQUFTLEVBQUU7SUFBSSxDQUFDO0VBQUUsQ0FBQztFQUMxRCxNQUFNLEVBQUs7SUFBRSxPQUFPLEVBQUUsQ0FBQztNQUFFLFFBQVEsRUFBRSxFQUFFO01BQUUsU0FBUyxFQUFFO0lBQUksQ0FBQztFQUFFLENBQUM7RUFDMUQsS0FBSyxFQUFNO0lBQUUsT0FBTyxFQUFFLENBQUM7TUFBRSxRQUFRLEVBQUUsRUFBRTtNQUFFLFNBQVMsRUFBRTtJQUFJLENBQUM7RUFBRSxDQUFDO0VBQzFELElBQUksRUFBTztJQUFFLE9BQU8sRUFBRSxDQUFDO01BQUUsUUFBUSxFQUFFLEVBQUU7TUFBRSxTQUFTLEVBQUU7SUFBSSxDQUFDO0VBQUUsQ0FBQztFQUMxRCxLQUFLLEVBQU07SUFBRSxPQUFPLEVBQUUsQ0FBQztNQUFFLFFBQVEsRUFBRSxFQUFFO01BQUUsU0FBUyxFQUFFO0lBQUksQ0FBQztFQUFFLENBQUM7RUFDMUQ7RUFDQSxTQUFTLEVBQUU7SUFBRSxPQUFPLEVBQUUsQ0FBQztNQUFFLFFBQVEsRUFBRSxDQUFDO01BQUcsU0FBUyxFQUFFO0lBQUksQ0FBQztFQUFFLENBQUM7RUFDMUQ7RUFDQSxLQUFLLEVBQU07SUFBRSxPQUFPLEVBQUUsQ0FBQztNQUFFLFFBQVEsRUFBRSxFQUFFO01BQUUsU0FBUyxFQUFFO0lBQUksQ0FBQyxFQUFFO01BQUUsS0FBSyxFQUFFLEVBQUU7TUFBRSxRQUFRLEVBQUUsRUFBRTtNQUFFLFNBQVMsRUFBRTtJQUFJLENBQUM7RUFBRSxDQUFDO0VBQ3ZHLElBQUksRUFBTztJQUFFLE9BQU8sRUFBRSxDQUFDO01BQUUsUUFBUSxFQUFFLElBQUk7TUFBRSxTQUFTLEVBQUU7SUFBRSxDQUFDO0VBQUU7QUFDM0QsQ0FBQzs7QUFFRDs7QUFFQSxNQUFNLFVBQVUsR0FBSyxFQUFFLEVBQUk7QUFDM0IsTUFBTSxVQUFVLEdBQUssR0FBRyxFQUFHO0FBQzNCLE1BQU0sWUFBWSxHQUFHLElBQUksRUFBRTtBQUMzQixNQUFNLFNBQVMsR0FBTSxFQUFFLEVBQUk7O0FBRTNCOztBQUVBLFNBQVMsY0FBYyxDQUFFLEtBQUssRUFBRTtFQUM5QixJQUFJLEtBQUssSUFBSSxJQUFJLEVBQUUsT0FBTztJQUFFLFVBQVUsRUFBRSxDQUFDO01BQUUsUUFBUSxFQUFFLEVBQUU7TUFBRSxTQUFTLEVBQUU7SUFBSSxDQUFDO0VBQUUsQ0FBQyxFQUFDO0VBQzdFLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFLE9BQU87SUFBRSxVQUFVLEVBQUUsQ0FBQztNQUFFLFFBQVEsRUFBRTtJQUFNLENBQUM7RUFBRSxDQUFDO0VBQzNFLElBQUksT0FBTyxLQUFLLEtBQUssUUFB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Q0FBQyxDQUFDO0lBQzNCLElBQUksQ0FBQyxVQUFVLEVBQUU7SUFFakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQzs7SUFFbkU7SUFDQSxJQUFBLHdCQUFlLEVBQUMsVUFBVSxDQUFDO0lBQzNCLElBQUEsOEJBQXVCLEVBQUMsVUFBVSxDQUFDO0lBQ25DLElBQUEseUJBQWMsRUFBQyxVQUFVLENBQUM7SUFDMUIsSUFBQSxnQkFBUyxFQUFDLENBQUM7SUFFWCxTQUFTLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO0lBQ25HLFNBQVMsQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO0VBQ2hFLENBQUMsQ0FBQztFQUVGLFNBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksS0FBSztJQUNyQyxPQUFPLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUM7RUFDOUQsQ0FBQyxDQUFDO0VBRUYsTUFBTSxDQUFDLHNCQUFzQixHQUFHLElBQUk7QUFDdEMsQ0FBQztBQUFBLE9BQUEsQ0FBQSxPQUFBLEdBQUEsUUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoZSkge1xuICByZXR1cm4gZSAmJiBlLl9fZXNNb2R1bGUgPyBlIDoge1xuICAgIFwiZGVmYXVsdFwiOiBlXG4gIH07XG59XG5tb2R1bGUuZXhwb3J0cyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlLCBtb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0czsiLCIvKipcbiAqIEV2RW1pdHRlciB2Mi4xLjFcbiAqIExpbCcgZXZlbnQgZW1pdHRlclxuICogTUlUIExpY2Vuc2VcbiAqL1xuXG4oIGZ1bmN0aW9uKCBnbG9iYWwsIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlMgLSBCcm93c2VyaWZ5LCBXZWJwYWNrXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgZ2xvYmFsLkV2RW1pdHRlciA9IGZhY3RvcnkoKTtcbiAgfVxuXG59KCB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcywgZnVuY3Rpb24oKSB7XG5cbmZ1bmN0aW9uIEV2RW1pdHRlcigpIHt9XG5cbmxldCBwcm90byA9IEV2RW1pdHRlci5wcm90b3R5cGU7XG5cbnByb3RvLm9uID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKSB7XG4gIGlmICggIWV2ZW50TmFtZSB8fCAhbGlzdGVuZXIgKSByZXR1cm4gdGhpcztcblxuICAvLyBzZXQgZXZlbnRzIGhhc2hcbiAgbGV0IGV2ZW50cyA9IHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgLy8gc2V0IGxpc3RlbmVycyBhcnJheVxuICBsZXQgbGlzdGVuZXJzID0gZXZlbnRzWyBldmVudE5hbWUgXSA9IGV2ZW50c1sgZXZlbnROYW1lIF0gfHwgW107XG4gIC8vIG9ubHkgYWRkIG9uY2VcbiAgaWYgKCAhbGlzdGVuZXJzLmluY2x1ZGVzKCBsaXN0ZW5lciApICkge1xuICAgIGxpc3RlbmVycy5wdXNoKCBsaXN0ZW5lciApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5vbmNlID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKSB7XG4gIGlmICggIWV2ZW50TmFtZSB8fCAhbGlzdGVuZXIgKSByZXR1cm4gdGhpcztcblxuICAvLyBhZGQgZXZlbnRcbiAgdGhpcy5vbiggZXZlbnROYW1lLCBsaXN0ZW5lciApO1xuICAvLyBzZXQgb25jZSBmbGFnXG4gIC8vIHNldCBvbmNlRXZlbnRzIGhhc2hcbiAgbGV0IG9uY2VFdmVudHMgPSB0aGlzLl9vbmNlRXZlbnRzID0gdGhpcy5fb25jZUV2ZW50cyB8fCB7fTtcbiAgLy8gc2V0IG9uY2VMaXN0ZW5lcnMgb2JqZWN0XG4gIGxldCBvbmNlTGlzdGVuZXJzID0gb25jZUV2ZW50c1sgZXZlbnROYW1lIF0gPSBvbmNlRXZlbnRzWyBldmVudE5hbWUgXSB8fCB7fTtcbiAgLy8gc2V0IGZsYWdcbiAgb25jZUxpc3RlbmVyc1sgbGlzdGVuZXIgXSA9IHRydWU7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5vZmYgPSBmdW5jdGlvbiggZXZlbnROYW1lLCBsaXN0ZW5lciApIHtcbiAgbGV0IGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbIGV2ZW50TmFtZSBdO1xuICBpZiAoICFsaXN0ZW5lcnMgfHwgIWxpc3RlbmVycy5sZW5ndGggKSByZXR1cm4gdGhpcztcblxuICBsZXQgaW5kZXggPSBsaXN0ZW5lcnMuaW5kZXhPZiggbGlzdGVuZXIgKTtcbiAgaWYgKCBpbmRleCAhPSAtMSApIHtcbiAgICBsaXN0ZW5lcnMuc3BsaWNlKCBpbmRleCwgMSApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5lbWl0RXZlbnQgPSBmdW5jdGlvbiggZXZlbnROYW1lLCBhcmdzICkge1xuICBsZXQgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1sgZXZlbnROYW1lIF07XG4gIGlmICggIWxpc3RlbmVycyB8fCAhbGlzdGVuZXJzLmxlbmd0aCApIHJldHVybiB0aGlzO1xuXG4gIC8vIGNvcHkgb3ZlciB0byBhdm9pZCBpbnRlcmZlcmVuY2UgaWYgLm9mZigpIGluIGxpc3RlbmVyXG4gIGxpc3RlbmVycyA9IGxpc3RlbmVycy5zbGljZSggMCApO1xuICBhcmdzID0gYXJncyB8fCBbXTtcbiAgLy8gb25jZSBzdHVmZlxuICBsZXQgb25jZUxpc3RlbmVycyA9IHRoaXMuX29uY2VFdmVudHMgJiYgdGhpcy5fb25jZUV2ZW50c1sgZXZlbnROYW1lIF07XG5cbiAgZm9yICggbGV0IGxpc3RlbmVyIG9mIGxpc3RlbmVycyApIHtcbiAgICBsZXQgaXNPbmNlID0gb25jZUxpc3RlbmVycyAmJiBvbmNlTGlzdGVuZXJzWyBsaXN0ZW5lciBdO1xuICAgIGlmICggaXNPbmNlICkge1xuICAgICAgLy8gcmVtb3ZlIGxpc3RlbmVyXG4gICAgICAvLyByZW1vdmUgYmVmb3JlIHRyaWdnZXIgdG8gcHJldmVudCByZWN1cnNpb25cbiAgICAgIHRoaXMub2ZmKCBldmVudE5hbWUsIGxpc3RlbmVyICk7XG4gICAgICAvLyB1bnNldCBvbmNlIGZsYWdcbiAgICAgIGRlbGV0ZSBvbmNlTGlzdGVuZXJzWyBsaXN0ZW5lciBdO1xuICAgIH1cbiAgICAvLyB0cmlnZ2VyIGxpc3RlbmVyXG4gICAgbGlzdGVuZXIuYXBwbHkoIHRoaXMsIGFyZ3MgKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8uYWxsT2ZmID0gZnVuY3Rpb24oKSB7XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHM7XG4gIGRlbGV0ZSB0aGlzLl9vbmNlRXZlbnRzO1xuICByZXR1cm4gdGhpcztcbn07XG5cbnJldHVybiBFdkVtaXR0ZXI7XG5cbn0gKSApO1xuIiwiLyoqXG4gKiBGaXp6eSBVSSB1dGlscyB2My4wLjBcbiAqIE1JVCBsaWNlbnNlXG4gKi9cblxuKCBmdW5jdGlvbiggZ2xvYmFsLCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCBnbG9iYWwgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIGdsb2JhbC5maXp6eVVJVXRpbHMgPSBmYWN0b3J5KCBnbG9iYWwgKTtcbiAgfVxuXG59KCB0aGlzLCBmdW5jdGlvbiBmYWN0b3J5KCBnbG9iYWwgKSB7XG5cbmxldCB1dGlscyA9IHt9O1xuXG4vLyAtLS0tLSBleHRlbmQgLS0tLS0gLy9cblxuLy8gZXh0ZW5kcyBvYmplY3RzXG51dGlscy5leHRlbmQgPSBmdW5jdGlvbiggYSwgYiApIHtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oIGEsIGIgKTtcbn07XG5cbi8vIC0tLS0tIG1vZHVsbyAtLS0tLSAvL1xuXG51dGlscy5tb2R1bG8gPSBmdW5jdGlvbiggbnVtLCBkaXYgKSB7XG4gIHJldHVybiAoICggbnVtICUgZGl2ICkgKyBkaXYgKSAlIGRpdjtcbn07XG5cbi8vIC0tLS0tIG1ha2VBcnJheSAtLS0tLSAvL1xuXG4vLyB0dXJuIGVsZW1lbnQgb3Igbm9kZUxpc3QgaW50byBhbiBhcnJheVxudXRpbHMubWFrZUFycmF5ID0gZnVuY3Rpb24oIG9iaiApIHtcbiAgLy8gdXNlIG9iamVjdCBpZiBhbHJlYWR5IGFuIGFycmF5XG4gIGlmICggQXJyYXkuaXNBcnJheSggb2JqICkgKSByZXR1cm4gb2JqO1xuXG4gIC8vIHJldHVybiBlbXB0eSBhcnJheSBpZiB1bmRlZmluZWQgb3IgbnVsbC4gIzZcbiAgaWYgKCBvYmogPT09IG51bGwgfHwgb2JqID09PSB1bmRlZmluZWQgKSByZXR1cm4gW107XG5cbiAgbGV0IGlzQXJyYXlMaWtlID0gdHlwZW9mIG9iaiA9PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb2JqLmxlbmd0aCA9PSAnbnVtYmVyJztcbiAgLy8gY29udmVydCBub2RlTGlzdCB0byBhcnJheVxuICBpZiAoIGlzQXJyYXlMaWtlICkgcmV0dXJuIFsgLi4ub2JqIF07XG5cbiAgLy8gYXJyYXkgb2Ygc2luZ2xlIGluZGV4XG4gIHJldHVybiBbIG9iaiBdO1xufTtcblxuLy8gLS0tLS0gcmVtb3ZlRnJvbSAtLS0tLSAvL1xuXG51dGlscy5yZW1vdmVGcm9tID0gZnVuY3Rpb24oIGFyeSwgb2JqICkge1xuICBsZXQgaW5kZXggPSBhcnkuaW5kZXhPZiggb2JqICk7XG4gIGlmICggaW5kZXggIT0gLTEgKSB7XG4gICAgYXJ5LnNwbGljZSggaW5kZXgsIDEgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0gZ2V0UGFyZW50IC0tLS0tIC8vXG5cbnV0aWxzLmdldFBhcmVudCA9IGZ1bmN0aW9uKCBlbGVtLCBzZWxlY3RvciApIHtcbiAgd2hpbGUgKCBlbGVtLnBhcmVudE5vZGUgJiYgZWxlbSAhPSBkb2N1bWVudC5ib2R5ICkge1xuICAgIGVsZW0gPSBlbGVtLnBhcmVudE5vZGU7XG4gICAgaWYgKCBlbGVtLm1hdGNoZXMoIHNlbGVjdG9yICkgKSByZXR1cm4gZWxlbTtcbiAgfVxufTtcblxuLy8gLS0tLS0gZ2V0UXVlcnlFbGVtZW50IC0tLS0tIC8vXG5cbi8vIHVzZSBlbGVtZW50IGFzIHNlbGVjdG9yIHN0cmluZ1xudXRpbHMuZ2V0UXVlcnlFbGVtZW50ID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIGlmICggdHlwZW9mIGVsZW0gPT0gJ3N0cmluZycgKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIGVsZW0gKTtcbiAgfVxuICByZXR1cm4gZWxlbTtcbn07XG5cbi8vIC0tLS0tIGhhbmRsZUV2ZW50IC0tLS0tIC8vXG5cbi8vIGVuYWJsZSAub250eXBlIHRvIHRyaWdnZXIgZnJvbSAuYWRkRXZlbnRMaXN0ZW5lciggZWxlbSwgJ3R5cGUnIClcbnV0aWxzLmhhbmRsZUV2ZW50ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICBsZXQgbWV0aG9kID0gJ29uJyArIGV2ZW50LnR5cGU7XG4gIGlmICggdGhpc1sgbWV0aG9kIF0gKSB7XG4gICAgdGhpc1sgbWV0aG9kIF0oIGV2ZW50ICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIGZpbHRlckZpbmRFbGVtZW50cyAtLS0tLSAvL1xuXG51dGlscy5maWx0ZXJGaW5kRWxlbWVudHMgPSBmdW5jdGlvbiggZWxlbXMsIHNlbGVjdG9yICkge1xuICAvLyBtYWtlIGFycmF5IG9mIGVsZW1zXG4gIGVsZW1zID0gdXRpbHMubWFrZUFycmF5KCBlbGVtcyApO1xuXG4gIHJldHVybiBlbGVtc1xuICAgIC8vIGNoZWNrIHRoYXQgZWxlbSBpcyBhbiBhY3R1YWwgZWxlbWVudFxuICAgIC5maWx0ZXIoICggZWxlbSApID0+IGVsZW0gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCApXG4gICAgLnJlZHVjZSggKCBmZkVsZW1zLCBlbGVtICkgPT4ge1xuICAgICAgLy8gYWRkIGVsZW0gaWYgbm8gc2VsZWN0b3JcbiAgICAgIGlmICggIXNlbGVjdG9yICkge1xuICAgICAgICBmZkVsZW1zLnB1c2goIGVsZW0gKTtcbiAgICAgICAgcmV0dXJuIGZmRWxlbXM7XG4gICAgICB9XG4gICAgICAvLyBmaWx0ZXIgJiBmaW5kIGl0ZW1zIGlmIHdlIGhhdmUgYSBzZWxlY3RvclxuICAgICAgLy8gZmlsdGVyXG4gICAgICBpZiAoIGVsZW0ubWF0Y2hlcyggc2VsZWN0b3IgKSApIHtcbiAgICAgICAgZmZFbGVtcy5wdXNoKCBlbGVtICk7XG4gICAgICB9XG4gICAgICAvLyBmaW5kIGNoaWxkcmVuXG4gICAgICBsZXQgY2hpbGRFbGVtcyA9IGVsZW0ucXVlcnlTZWxlY3RvckFsbCggc2VsZWN0b3IgKTtcbiAgICAgIC8vIGNvbmNhdCBjaGlsZEVsZW1zIHRvIGZpbHRlckZvdW5kIGFycmF5XG4gICAgICBmZkVsZW1zID0gZmZFbGVtcy5jb25jYXQoIC4uLmNoaWxkRWxlbXMgKTtcbiAgICAgIHJldHVybiBmZkVsZW1zO1xuICAgIH0sIFtdICk7XG59O1xuXG4vLyAtLS0tLSBkZWJvdW5jZU1ldGhvZCAtLS0tLSAvL1xuXG51dGlscy5kZWJvdW5jZU1ldGhvZCA9IGZ1bmN0aW9uKCBfY2xhc3MsIG1ldGhvZE5hbWUsIHRocmVzaG9sZCApIHtcbiAgdGhyZXNob2xkID0gdGhyZXNob2xkIHx8IDEwMDtcbiAgLy8gb3JpZ2luYWwgbWV0aG9kXG4gIGxldCBtZXRob2QgPSBfY2xhc3MucHJvdG90eXBlWyBtZXRob2ROYW1lIF07XG4gIGxldCB0aW1lb3V0TmFtZSA9IG1ldGhvZE5hbWUgKyAnVGltZW91dCc7XG5cbiAgX2NsYXNzLnByb3RvdHlwZVsgbWV0aG9kTmFtZSBdID0gZnVuY3Rpb24oKSB7XG4gICAgY2xlYXJUaW1lb3V0KCB0aGlzWyB0aW1lb3V0TmFtZSBdICk7XG5cbiAgICBsZXQgYXJncyA9IGFyZ3VtZW50cztcbiAgICB0aGlzWyB0aW1lb3V0TmFtZSBdID0gc2V0VGltZW91dCggKCkgPT4ge1xuICAgICAgbWV0aG9kLmFwcGx5KCB0aGlzLCBhcmdzICk7XG4gICAgICBkZWxldGUgdGhpc1sgdGltZW91dE5hbWUgXTtcbiAgICB9LCB0aHJlc2hvbGQgKTtcbiAgfTtcbn07XG5cbi8vIC0tLS0tIGRvY1JlYWR5IC0tLS0tIC8vXG5cbnV0aWxzLmRvY1JlYWR5ID0gZnVuY3Rpb24oIG9uRG9jUmVhZHkgKSB7XG4gIGxldCByZWFkeVN0YXRlID0gZG9jdW1lbnQucmVhZHlTdGF0ZTtcbiAgaWYgKCByZWFkeVN0YXRlID09ICdjb21wbGV0ZScgfHwgcmVhZHlTdGF0ZSA9PSAnaW50ZXJhY3RpdmUnICkge1xuICAgIC8vIGRvIGFzeW5jIHRvIGFsbG93IGZvciBvdGhlciBzY3JpcHRzIHRvIHJ1bi4gbWV0YWZpenp5L2ZsaWNraXR5IzQ0MVxuICAgIHNldFRpbWVvdXQoIG9uRG9jUmVhZHkgKTtcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnRE9NQ29udGVudExvYWRlZCcsIG9uRG9jUmVhZHkgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0gaHRtbEluaXQgLS0tLS0gLy9cblxuLy8gaHR0cDovL2JpdC5seS8zb1lMdXNjXG51dGlscy50b0Rhc2hlZCA9IGZ1bmN0aW9uKCBzdHIgKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSggLyguKShbQS1aXSkvZywgZnVuY3Rpb24oIG1hdGNoLCAkMSwgJDIgKSB7XG4gICAgcmV0dXJuICQxICsgJy0nICsgJDI7XG4gIH0gKS50b0xvd2VyQ2FzZSgpO1xufTtcblxubGV0IGNvbnNvbGUgPSBnbG9iYWwuY29uc29sZTtcblxuLy8gYWxsb3cgdXNlciB0byBpbml0aWFsaXplIGNsYXNzZXMgdmlhIFtkYXRhLW5hbWVzcGFjZV0gb3IgLmpzLW5hbWVzcGFjZSBjbGFzc1xuLy8gaHRtbEluaXQoIFdpZGdldCwgJ3dpZGdldE5hbWUnIClcbi8vIG9wdGlvbnMgYXJlIHBhcnNlZCBmcm9tIGRhdGEtbmFtZXNwYWNlLW9wdGlvbnNcbnV0aWxzLmh0bWxJbml0ID0gZnVuY3Rpb24oIFdpZGdldENsYXNzLCBuYW1lc3BhY2UgKSB7XG4gIHV0aWxzLmRvY1JlYWR5KCBmdW5jdGlvbigpIHtcbiAgICBsZXQgZGFzaGVkTmFtZXNwYWNlID0gdXRpbHMudG9EYXNoZWQoIG5hbWVzcGFjZSApO1xuICAgIGxldCBkYXRhQXR0ciA9ICdkYXRhLScgKyBkYXNoZWROYW1lc3BhY2U7XG4gICAgbGV0IGRhdGFBdHRyRWxlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCBgWyR7ZGF0YUF0dHJ9XWAgKTtcbiAgICBsZXQgalF1ZXJ5ID0gZ2xvYmFsLmpRdWVyeTtcblxuICAgIFsgLi4uZGF0YUF0dHJFbGVtcyBdLmZvckVhY2goICggZWxlbSApID0+IHtcbiAgICAgIGxldCBhdHRyID0gZWxlbS5nZXRBdHRyaWJ1dGUoIGRhdGFBdHRyICk7XG4gICAgICBsZXQgb3B0aW9ucztcbiAgICAgIHRyeSB7XG4gICAgICAgIG9wdGlvbnMgPSBhdHRyICYmIEpTT04ucGFyc2UoIGF0dHIgKTtcbiAgICAgIH0gY2F0Y2ggKCBlcnJvciApIHtcbiAgICAgICAgLy8gbG9nIGVycm9yLCBkbyBub3QgaW5pdGlhbGl6ZVxuICAgICAgICBpZiAoIGNvbnNvbGUgKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvciggYEVycm9yIHBhcnNpbmcgJHtkYXRhQXR0cn0gb24gJHtlbGVtLmNsYXNzTmFtZX06ICR7ZXJyb3J9YCApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIGluaXRpYWxpemVcbiAgICAgIGxldCBpbnN0YW5jZSA9IG5ldyBXaWRnZXRDbGFzcyggZWxlbSwgb3B0aW9ucyApO1xuICAgICAgLy8gbWFrZSBhdmFpbGFibGUgdmlhICQoKS5kYXRhKCduYW1lc3BhY2UnKVxuICAgICAgaWYgKCBqUXVlcnkgKSB7XG4gICAgICAgIGpRdWVyeS5kYXRhKCBlbGVtLCBuYW1lc3BhY2UsIGluc3RhbmNlICk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gIH0gKTtcbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5yZXR1cm4gdXRpbHM7XG5cbn0gKSApO1xuIiwiLy8gYnV0dG9uXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgcmVxdWlyZSgnLi9jb3JlJyksXG4gICAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJyksXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgd2luZG93LkluZmluaXRlU2Nyb2xsLFxuICAgICAgICB3aW5kb3cuZml6enlVSVV0aWxzLFxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEluZmluaXRlU2Nyb2xsLCB1dGlscyApIHtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gSW5maW5pdGVTY3JvbGxCdXR0b24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuY2xhc3MgSW5maW5pdGVTY3JvbGxCdXR0b24ge1xuICBjb25zdHJ1Y3RvciggZWxlbWVudCwgaW5mU2Nyb2xsICkge1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5pbmZTY3JvbGwgPSBpbmZTY3JvbGw7XG4gICAgLy8gZXZlbnRzXG4gICAgdGhpcy5jbGlja0hhbmRsZXIgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCB0aGlzLmNsaWNrSGFuZGxlciApO1xuICAgIGluZlNjcm9sbC5vbiggJ3JlcXVlc3QnLCB0aGlzLmRpc2FibGUuYmluZCggdGhpcyApICk7XG4gICAgaW5mU2Nyb2xsLm9uKCAnbG9hZCcsIHRoaXMuZW5hYmxlLmJpbmQoIHRoaXMgKSApO1xuICAgIGluZlNjcm9sbC5vbiggJ2Vycm9yJywgdGhpcy5oaWRlLmJpbmQoIHRoaXMgKSApO1xuICAgIGluZlNjcm9sbC5vbiggJ2xhc3QnLCB0aGlzLmhpZGUuYmluZCggdGhpcyApICk7XG4gIH1cblxuICBvbkNsaWNrKCBldmVudCApIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMuaW5mU2Nyb2xsLmxvYWROZXh0UGFnZSgpO1xuICB9XG5cbiAgZW5hYmxlKCkge1xuICAgIHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gIH1cblxuICBkaXNhYmxlKCkge1xuICAgIHRoaXMuZWxlbWVudC5kaXNhYmxlZCA9ICdkaXNhYmxlZCc7XG4gIH1cblxuICBoaWRlKCkge1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgdGhpcy5jbGlja0hhbmRsZXIgKTtcbiAgfVxuXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEluZmluaXRlU2Nyb2xsIG1ldGhvZHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gSW5maW5pdGVTY3JvbGwuZGVmYXVsdHMuYnV0dG9uID0gbnVsbDtcblxuSW5maW5pdGVTY3JvbGwuY3JlYXRlLmJ1dHRvbiA9IGZ1bmN0aW9uKCkge1xuICBsZXQgYnV0dG9uRWxlbSA9IHV0aWxzLmdldFF1ZXJ5RWxlbWVudCggdGhpcy5vcHRpb25zLmJ1dHRvbiApO1xuICBpZiAoIGJ1dHRvbkVsZW0gKSB7XG4gICAgdGhpcy5idXR0b24gPSBuZXcgSW5maW5pdGVTY3JvbGxCdXR0b24oIGJ1dHRvbkVsZW0sIHRoaXMgKTtcbiAgfVxufTtcblxuSW5maW5pdGVTY3JvbGwuZGVzdHJveS5idXR0b24gPSBmdW5jdGlvbigpIHtcbiAgaWYgKCB0aGlzLmJ1dHRvbiApIHRoaXMuYnV0dG9uLmRlc3Ryb3koKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5JbmZpbml0ZVNjcm9sbC5CdXR0b24gPSBJbmZpbml0ZVNjcm9sbEJ1dHRvbjtcblxucmV0dXJuIEluZmluaXRlU2Nyb2xsO1xuXG59ICkgKTtcbiIsIi8vIGNvcmVcbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICByZXF1aXJlKCdldi1lbWl0dGVyJyksXG4gICAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJyksXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5JbmZpbml0ZVNjcm9sbCA9IGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgd2luZG93LkV2RW1pdHRlcixcbiAgICAgICAgd2luZG93LmZpenp5VUlVdGlscyxcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggd2luZG93LCBFdkVtaXR0ZXIsIHV0aWxzICkge1xuXG5sZXQgalF1ZXJ5ID0gd2luZG93LmpRdWVyeTtcbi8vIGludGVybmFsIHN0b3JlIG9mIGFsbCBJbmZpbml0ZVNjcm9sbCBpbnRhbmNlc1xubGV0IGluc3RhbmNlcyA9IHt9O1xuXG5mdW5jdGlvbiBJbmZpbml0ZVNjcm9sbCggZWxlbWVudCwgb3B0aW9ucyApIHtcbiAgbGV0IHF1ZXJ5RWxlbSA9IHV0aWxzLmdldFF1ZXJ5RWxlbWVudCggZWxlbWVudCApO1xuXG4gIGlmICggIXF1ZXJ5RWxlbSApIHtcbiAgICBjb25zb2xlLmVycm9yKCAnQmFkIGVsZW1lbnQgZm9yIEluZmluaXRlU2Nyb2xsOiAnICsgKCBxdWVyeUVsZW0gfHwgZWxlbWVudCApICk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGVsZW1lbnQgPSBxdWVyeUVsZW07XG4gIC8vIGRvIG5vdCBpbml0aWFsaXplIHR3aWNlIG9uIHNhbWUgZWxlbWVudFxuICBpZiAoIGVsZW1lbnQuaW5maW5pdGVTY3JvbGxHVUlEICkge1xuICAgIGxldCBpbnN0YW5jZSA9IGluc3RhbmNlc1sgZWxlbWVudC5pbmZpbml0ZVNjcm9sbEdVSUQgXTtcbiAgICBpbnN0YW5jZS5vcHRpb24oIG9wdGlvbnMgKTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cblxuICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAvLyBvcHRpb25zXG4gIHRoaXMub3B0aW9ucyA9IHsgLi4uSW5maW5pdGVTY3JvbGwuZGVmYXVsdHMgfTtcbiAgdGhpcy5vcHRpb24oIG9wdGlvbnMgKTtcbiAgLy8gYWRkIGpRdWVyeVxuICBpZiAoIGpRdWVyeSApIHtcbiAgICB0aGlzLiRlbGVtZW50ID0galF1ZXJ5KCB0aGlzLmVsZW1lbnQgKTtcbiAgfVxuXG4gIHRoaXMuY3JlYXRlKCk7XG59XG5cbi8vIGRlZmF1bHRzXG5JbmZpbml0ZVNjcm9sbC5kZWZhdWx0cyA9IHtcbiAgLy8gcGF0aDogbnVsbCxcbiAgLy8gaGlkZU5hdjogbnVsbCxcbiAgLy8gZGVidWc6IGZhbHNlLFxufTtcblxuLy8gY3JlYXRlICYgZGVzdHJveSBtZXRob2RzXG5JbmZpbml0ZVNjcm9sbC5jcmVhdGUgPSB7fTtcbkluZmluaXRlU2Nyb2xsLmRlc3Ryb3kgPSB7fTtcblxubGV0IHByb3RvID0gSW5maW5pdGVTY3JvbGwucHJvdG90eXBlO1xuLy8gaW5oZXJpdCBFdkVtaXR0ZXJcbk9iamVjdC5hc3NpZ24oIHByb3RvLCBFdkVtaXR0ZXIucHJvdG90eXBlICk7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBnbG9iYWxseSB1bmlxdWUgaWRlbnRpZmllcnNcbmxldCBHVUlEID0gMDtcblxucHJvdG8uY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gIC8vIGNyZWF0ZSBjb3JlXG4gIC8vIGFkZCBpZCBmb3IgSW5maW5pdGVTY3JvbGwuZGF0YVxuICBsZXQgaWQgPSB0aGlzLmd1aWQgPSArK0dVSUQ7XG4gIHRoaXMuZWxlbWVudC5pbmZpbml0ZVNjcm9sbEdVSUQgPSBpZDsgLy8gZXhwYW5kb1xuICBpbnN0YW5jZXNbIGlkIF0gPSB0aGlzOyAvLyBhc3NvY2lhdGUgdmlhIGlkXG4gIC8vIHByb3BlcnRpZXNcbiAgdGhpcy5wYWdlSW5kZXggPSAxOyAvLyBkZWZhdWx0IHRvIGZpcnN0IHBhZ2VcbiAgdGhpcy5sb2FkQ291bnQgPSAwO1xuICB0aGlzLnVwZGF0ZUdldFBhdGgoKTtcbiAgLy8gYmFpbCBpZiBnZXRQYXRoIG5vdCBzZXQsIG9yIHJldHVybnMgZmFsc2V5ICM3NzZcbiAgbGV0IGhhc1BhdGggPSB0aGlzLmdldFBhdGggJiYgdGhpcy5nZXRQYXRoKCk7XG4gIGlmICggIWhhc1BhdGggKSB7XG4gICAgY29uc29sZS5lcnJvcignRGlzYWJsaW5nIEluZmluaXRlU2Nyb2xsJyk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMudXBkYXRlR2V0QWJzb2x1dGVQYXRoKCk7XG4gIHRoaXMubG9nKCAnaW5pdGlhbGl6ZWQnLCBbIHRoaXMuZWxlbWVudC5jbGFzc05hbWUgXSApO1xuICB0aGlzLmNhbGxPbkluaXQoKTtcbiAgLy8gY3JlYXRlIGZlYXR1cmVzXG4gIGZvciAoIGxldCBtZXRob2QgaW4gSW5maW5pdGVTY3JvbGwuY3JlYXRlICkge1xuICAgIEluZmluaXRlU2Nyb2xsLmNyZWF0ZVsgbWV0aG9kIF0uY2FsbCggdGhpcyApO1xuICB9XG59O1xuXG5wcm90by5vcHRpb24gPSBmdW5jdGlvbiggb3B0cyApIHtcbiAgT2JqZWN0LmFzc2lnbiggdGhpcy5vcHRpb25zLCBvcHRzICk7XG59O1xuXG4vLyBjYWxsIG9uSW5pdCBvcHRpb24sIHVzZWQgZm9yIGJpbmRpbmcgZXZlbnRzIG9uIGluaXRcbnByb3RvLmNhbGxPbkluaXQgPSBmdW5jdGlvbigpIHtcbiAgbGV0IG9uSW5pdCA9IHRoaXMub3B0aW9ucy5vbkluaXQ7XG4gIGlmICggb25Jbml0ICkge1xuICAgIG9uSW5pdC5jYWxsKCB0aGlzLCB0aGlzICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIGV2ZW50cyAtLS0tLSAvL1xuXG5wcm90by5kaXNwYXRjaEV2ZW50ID0gZnVuY3Rpb24oIHR5cGUsIGV2ZW50LCBhcmdzICkge1xuICB0aGlzLmxvZyggdHlwZSwgYXJncyApO1xuICBsZXQgZW1pdEFyZ3MgPSBldmVudCA/IFsgZXZlbnQgXS5jb25jYXQoIGFyZ3MgKSA6IGFyZ3M7XG4gIHRoaXMuZW1pdEV2ZW50KCB0eXBlLCBlbWl0QXJncyApO1xuICAvLyB0cmlnZ2VyIGpRdWVyeSBldmVudFxuICBpZiAoICFqUXVlcnkgfHwgIXRoaXMuJGVsZW1lbnQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIG5hbWVzcGFjZSBqUXVlcnkgZXZlbnRcbiAgdHlwZSArPSAnLmluZmluaXRlU2Nyb2xsJztcbiAgbGV0ICRldmVudCA9IHR5cGU7XG4gIGlmICggZXZlbnQgKSB7XG4gICAgLy8gY3JlYXRlIGpRdWVyeSBldmVudFxuICAgIC8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuZXctY2FwICovXG4gICAgbGV0IGpRRXZlbnQgPSBqUXVlcnkuRXZlbnQoIGV2ZW50ICk7XG4gICAgalFFdmVudC50eXBlID0gdHlwZTtcbiAgICAkZXZlbnQgPSBqUUV2ZW50O1xuICB9XG4gIHRoaXMuJGVsZW1lbnQudHJpZ2dlciggJGV2ZW50LCBhcmdzICk7XG59O1xuXG5sZXQgbG9nZ2VycyA9IHtcbiAgaW5pdGlhbGl6ZWQ6ICggY2xhc3NOYW1lICkgPT4gYG9uICR7Y2xhc3NOYW1lfWAsXG4gIHJlcXVlc3Q6ICggcGF0aCApID0+IGBVUkw6ICR7cGF0aH1gLFxuICBsb2FkOiAoIHJlc3BvbnNlLCBwYXRoICkgPT4gYCR7cmVzcG9uc2UudGl0bGUgfHwgJyd9LiBVUkw6ICR7cGF0aH1gLFxuICBlcnJvcjogKCBlcnJvciwgcGF0aCApID0+IGAke2Vycm9yfS4gVVJMOiAke3BhdGh9YCxcbiAgYXBwZW5kOiAoIHJlc3BvbnNlLCBwYXRoLCBpdGVtcyApID0+IGAke2l0ZW1zLmxlbmd0aH0gaXRlbXMuIFVSTDogJHtwYXRofWAsXG4gIGxhc3Q6ICggcmVzcG9uc2UsIHBhdGggKSA9PiBgVVJMOiAke3BhdGh9YCxcbiAgaGlzdG9yeTogKCB0aXRsZSwgcGF0aCApID0+IGBVUkw6ICR7cGF0aH1gLFxuICBwYWdlSW5kZXg6IGZ1bmN0aW9uKCBpbmRleCwgb3JpZ2luICkge1xuICAgIHJldHVybiBgY3VycmVudCBwYWdlIGRldGVybWluZWQgdG8gYmU6ICR7aW5kZXh9IGZyb20gJHtvcmlnaW59YDtcbiAgfSxcbn07XG5cbi8vIGxvZyBldmVudHNcbnByb3RvLmxvZyA9IGZ1bmN0aW9uKCB0eXBlLCBhcmdzICkge1xuICBpZiAoICF0aGlzLm9wdGlvbnMuZGVidWcgKSByZXR1cm47XG5cbiAgbGV0IG1lc3NhZ2UgPSBgW0luZmluaXRlU2Nyb2xsXSAke3R5cGV9YDtcbiAgbGV0IGxvZ2dlciA9IGxvZ2dlcnNbIHR5cGUgXTtcbiAgaWYgKCBsb2dnZXIgKSBtZXNzYWdlICs9ICcuICcgKyBsb2dnZXIuYXBwbHkoIHRoaXMsIGFyZ3MgKTtcbiAgY29uc29sZS5sb2coIG1lc3NhZ2UgKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIG1ldGhvZHMgdXNlZCBhbW91bmcgZmVhdHVyZXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxucHJvdG8udXBkYXRlTWVhc3VyZW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMud2luZG93SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICBsZXQgcmVjdCA9IHRoaXMuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdGhpcy50b3AgPSByZWN0LnRvcCArIHdpbmRvdy5zY3JvbGxZO1xufTtcblxucHJvdG8udXBkYXRlU2Nyb2xsZXIgPSBmdW5jdGlvbigpIHtcbiAgbGV0IGVsZW1lbnRTY3JvbGwgPSB0aGlzLm9wdGlvbnMuZWxlbWVudFNjcm9sbDtcbiAgaWYgKCAhZWxlbWVudFNjcm9sbCApIHtcbiAgICAvLyBkZWZhdWx0LCB1c2Ugd2luZG93XG4gICAgdGhpcy5zY3JvbGxlciA9IHdpbmRvdztcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gaWYgdHJ1ZSwgc2V0IHRvIGVsZW1lbnQsIG90aGVyd2lzZSB1c2Ugb3B0aW9uXG4gIHRoaXMuc2Nyb2xsZXIgPSBlbGVtZW50U2Nyb2xsID09PSB0cnVlID8gdGhpcy5lbGVtZW50IDpcbiAgICB1dGlscy5nZXRRdWVyeUVsZW1lbnQoIGVsZW1lbnRTY3JvbGwgKTtcbiAgaWYgKCAhdGhpcy5zY3JvbGxlciApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBmaW5kIGVsZW1lbnRTY3JvbGw6ICR7ZWxlbWVudFNjcm9sbH1gKTtcbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gcGFnZSBwYXRoIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnByb3RvLnVwZGF0ZUdldFBhdGggPSBmdW5jdGlvbigpIHtcbiAgbGV0IG9wdFBhdGggPSB0aGlzLm9wdGlvbnMucGF0aDtcbiAgaWYgKCAhb3B0UGF0aCApIHtcbiAgICBjb25zb2xlLmVycm9yKGBJbmZpbml0ZVNjcm9sbCBwYXRoIG9wdGlvbiByZXF1aXJlZC4gU2V0IGFzOiAke29wdFBhdGh9YCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGZ1bmN0aW9uXG4gIGxldCB0eXBlID0gdHlwZW9mIG9wdFBhdGg7XG4gIGlmICggdHlwZSA9PSAnZnVuY3Rpb24nICkge1xuICAgIHRoaXMuZ2V0UGF0aCA9IG9wdFBhdGg7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHRlbXBsYXRlIHN0cmluZzogJy9wYWdlcy97eyN9fS5odG1sJ1xuICBsZXQgdGVtcGxhdGVNYXRjaCA9IHR5cGUgPT0gJ3N0cmluZycgJiYgb3B0UGF0aC5tYXRjaCgne3sjfX0nKTtcbiAgaWYgKCB0ZW1wbGF0ZU1hdGNoICkge1xuICAgIHRoaXMudXBkYXRlR2V0UGF0aFRlbXBsYXRlKCBvcHRQYXRoICk7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHNlbGVjdG9yOiAnLm5leHQtcGFnZS1zZWxlY3RvcidcbiAgdGhpcy51cGRhdGVHZXRQYXRoU2VsZWN0b3IoIG9wdFBhdGggKTtcbn07XG5cbnByb3RvLnVwZGF0ZUdldFBhdGhUZW1wbGF0ZSA9IGZ1bmN0aW9uKCBvcHRQYXRoICkge1xuICAvLyBzZXQgZ2V0UGF0aCB3aXRoIHRlbXBsYXRlIHN0cmluZ1xuICB0aGlzLmdldFBhdGggPSAoKSA9PiB7XG4gICAgbGV0IG5leHRJbmRleCA9IHRoaXMucGFnZUluZGV4ICsgMTtcbiAgICByZXR1cm4gb3B0UGF0aC5yZXBsYWNlKCAne3sjfX0nLCBuZXh0SW5kZXggKTtcbiAgfTtcbiAgLy8gZ2V0IHBhZ2VJbmRleCBmcm9tIGxvY2F0aW9uXG4gIC8vIGNvbnZlcnQgcGF0aCBvcHRpb24gaW50byByZWdleCB0byBsb29rIGZvciBwYXR0ZXJuIGluIGxvY2F0aW9uXG4gIC8vIGVzY2FwZSBxdWVyeSAoPykgaW4gdXJsLCBhbGxvd3MgZm9yIHBhcnNpbmcgR0VUIHBhcmFtZXRlcnNcbiAgbGV0IHJlZ2V4U3RyaW5nID0gb3B0UGF0aFxuICAgIC5yZXBsYWNlKCAvKFxcXFxcXD98XFw/KS8sICdcXFxcPycgKVxuICAgIC5yZXBsYWNlKCAne3sjfX0nLCAnKFxcXFxkXFxcXGQ/XFxcXGQ/KScgKTtcbiAgbGV0IHRlbXBsYXRlUmUgPSBuZXcgUmVnRXhwKCByZWdleFN0cmluZyApO1xuICBsZXQgbWF0Y2ggPSBsb2NhdGlvbi5ocmVmLm1hdGNoKCB0ZW1wbGF0ZVJlICk7XG5cbiAgaWYgKCBtYXRjaCApIHtcbiAgICB0aGlzLnBhZ2VJbmRleCA9IHBhcnNlSW50KCBtYXRjaFsxXSwgMTAgKTtcbiAgICB0aGlzLmxvZyggJ3BhZ2VJbmRleCcsIFsgdGhpcy5wYWdlSW5kZXgsICd0ZW1wbGF0ZSBzdHJpbmcnIF0gKTtcbiAgfVxufTtcblxubGV0IHBhdGhSZWdleGVzID0gW1xuICAvLyBXb3JkUHJlc3MgJiBUdW1ibHIgLSBleGFtcGxlLmNvbS9wYWdlLzJcbiAgLy8gSmVreWxsIC0gZXhhbXBsZS5jb20vcGFnZTJcbiAgL14oLio/XFwvP3BhZ2VcXC8/KShcXGRcXGQ/XFxkPykoLio/JCkvLFxuICAvLyBEcnVwYWwgLSBleGFtcGxlLmNvbS8/cGFnZT0xXG4gIC9eKC4qP1xcLz9cXD9wYWdlPSkoXFxkXFxkP1xcZD8pKC4qPyQpLyxcbiAgLy8gY2F0Y2ggYWxsLCBsYXN0IG9jY3VyZW5jZSBvZiBhIG51bWJlclxuICAvKC4qPykoXFxkXFxkP1xcZD8pKD8hLipcXGQpKC4qPyQpLyxcbl07XG5cbi8vIHRyeSBtYXRjaGluZyBocmVmIHRvIHBhdGhSZWdleGVzIHBhdHRlcm5zXG5sZXQgZ2V0UGF0aFBhcnRzID0gSW5maW5pdGVTY3JvbGwuZ2V0UGF0aFBhcnRzID0gZnVuY3Rpb24oIGhyZWYgKSB7XG4gIGlmICggIWhyZWYgKSByZXR1cm47XG4gIGZvciAoIGxldCByZWdleCBvZiBwYXRoUmVnZXhlcyApIHtcbiAgICBsZXQgbWF0Y2ggPSBocmVmLm1hdGNoKCByZWdleCApO1xuICAgIGlmICggbWF0Y2ggKSB7XG4gICAgICBsZXQgWyAsIGJlZ2luLCBpbmRleCwgZW5kIF0gPSBtYXRjaDtcbiAgICAgIHJldHVybiB7IGJlZ2luLCBpbmRleCwgZW5kIH07XG4gICAgfVxuICB9XG59O1xuXG5wcm90by51cGRhdGVHZXRQYXRoU2VsZWN0b3IgPSBmdW5jdGlvbiggb3B0UGF0aCApIHtcbiAgLy8gcGFyc2UgaHJlZiBvZiBsaW5rOiAnLm5leHQtcGFnZS1saW5rJ1xuICBsZXQgaHJlZkVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCBvcHRQYXRoICk7XG4gIGlmICggIWhyZWZFbGVtICkge1xuICAgIGNvbnNvbGUuZXJyb3IoYEJhZCBJbmZpbml0ZVNjcm9sbCBwYXRoIG9wdGlvbi4gTmV4dCBsaW5rIG5vdCBmb3VuZDogJHtvcHRQYXRofWApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCBocmVmID0gaHJlZkVsZW0uZ2V0QXR0cmlidXRlKCdocmVmJyk7XG4gIGxldCBwYXRoUGFydHMgPSBnZXRQYXRoUGFydHMoIGhyZWYgKTtcbiAgaWYgKCAhcGF0aFBhcnRzICkge1xuICAgIGNvbnNvbGUuZXJyb3IoYEluZmluaXRlU2Nyb2xsIHVuYWJsZSB0byBwYXJzZSBuZXh0IGxpbmsgaHJlZjogJHtocmVmfWApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCB7IGJlZ2luLCBpbmRleCwgZW5kIH0gPSBwYXRoUGFydHM7XG4gIHRoaXMuaXNQYXRoU2VsZWN0b3IgPSB0cnVlOyAvLyBmbGFnIGZvciBjaGVja0xhc3RQYWdlKClcbiAgdGhpcy5nZXRQYXRoID0gKCkgPT4gYmVnaW4gKyAoIHRoaXMucGFnZUluZGV4ICsgMSApICsgZW5kO1xuICAvLyBnZXQgcGFnZUluZGV4IGZyb20gaHJlZlxuICB0aGlzLnBhZ2VJbmRleCA9IHBhcnNlSW50KCBpbmRleCwgMTAgKSAtIDE7XG4gIHRoaXMubG9nKCAncGFnZUluZGV4JywgWyB0aGlzLnBhZ2VJbmRleCwgJ25leHQgbGluaycgXSApO1xufTtcblxucHJvdG8udXBkYXRlR2V0QWJzb2x1dGVQYXRoID0gZnVuY3Rpb24oKSB7XG4gIGxldCBwYXRoID0gdGhpcy5nZXRQYXRoKCk7XG4gIC8vIHBhdGggZG9lc24ndCBzdGFydCB3aXRoIGh0dHAgb3IgL1xuICBsZXQgaXNBYnNvbHV0ZSA9IHBhdGgubWF0Y2goIC9eaHR0cC8gKSB8fCBwYXRoLm1hdGNoKCAvXlxcLy8gKTtcbiAgaWYgKCBpc0Fic29sdXRlICkge1xuICAgIHRoaXMuZ2V0QWJzb2x1dGVQYXRoID0gdGhpcy5nZXRQYXRoO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCB7IHBhdGhuYW1lIH0gPSBsb2NhdGlvbjtcbiAgLy8gcXVlcnkgcGFyYW1ldGVyICM4MjkuIGV4YW1wbGUuY29tLz9wZz0yXG4gIGxldCBpc1F1ZXJ5ID0gcGF0aC5tYXRjaCggL15cXD8vICk7XG4gIC8vIC9mb28vYmFyL2luZGV4Lmh0bWwgPT4gL2Zvby9iYXJcbiAgbGV0IGRpcmVjdG9yeSA9IHBhdGhuYW1lLnN1YnN0cmluZyggMCwgcGF0aG5hbWUubGFzdEluZGV4T2YoJy8nKSApO1xuICBsZXQgcGF0aFN0YXJ0ID0gaXNRdWVyeSA/IHBhdGhuYW1lIDogZGlyZWN0b3J5ICsgJy8nO1xuXG4gIHRoaXMuZ2V0QWJzb2x1dGVQYXRoID0gKCkgPT4gcGF0aFN0YXJ0ICsgdGhpcy5nZXRQYXRoKCk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBuYXYgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gaGlkZSBuYXZpZ2F0aW9uXG5JbmZpbml0ZVNjcm9sbC5jcmVhdGUuaGlkZU5hdiA9IGZ1bmN0aW9uKCkge1xuICBsZXQgbmF2ID0gdXRpbHMuZ2V0UXVlcnlFbGVtZW50KCB0aGlzLm9wdGlvbnMuaGlkZU5hdiApO1xuICBpZiAoICFuYXYgKSByZXR1cm47XG5cbiAgbmF2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIHRoaXMubmF2ID0gbmF2O1xufTtcblxuSW5maW5pdGVTY3JvbGwuZGVzdHJveS5oaWRlTmF2ID0gZnVuY3Rpb24oKSB7XG4gIGlmICggdGhpcy5uYXYgKSB0aGlzLm5hdi5zdHlsZS5kaXNwbGF5ID0gJyc7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBkZXN0cm95IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnByb3RvLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5hbGxPZmYoKTsgLy8gcmVtb3ZlIGFsbCBldmVudCBsaXN0ZW5lcnNcbiAgLy8gY2FsbCBkZXN0cm95IG1ldGhvZHNcbiAgZm9yICggbGV0IG1ldGhvZCBpbiBJbmZpbml0ZVNjcm9sbC5kZXN0cm95ICkge1xuICAgIEluZmluaXRlU2Nyb2xsLmRlc3Ryb3lbIG1ldGhvZCBdLmNhbGwoIHRoaXMgKTtcbiAgfVxuXG4gIGRlbGV0ZSB0aGlzLmVsZW1lbnQuaW5maW5pdGVTY3JvbGxHVUlEO1xuICBkZWxldGUgaW5zdGFuY2VzWyB0aGlzLmd1aWQgXTtcbiAgLy8gcmVtb3ZlIGpRdWVyeSBkYXRhLiAjODA3XG4gIGlmICggalF1ZXJ5ICYmIHRoaXMuJGVsZW1lbnQgKSB7XG4gICAgalF1ZXJ5LnJlbW92ZURhdGEoIHRoaXMuZWxlbWVudCwgJ2luZmluaXRlU2Nyb2xsJyApO1xuICB9XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSB1dGlsaXRpZXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gaHR0cHM6Ly9yZW15c2hhcnAuY29tLzIwMTAvMDcvMjEvdGhyb3R0bGluZy1mdW5jdGlvbi1jYWxsc1xuSW5maW5pdGVTY3JvbGwudGhyb3R0bGUgPSBmdW5jdGlvbiggZm4sIHRocmVzaG9sZCApIHtcbiAgdGhyZXNob2xkID0gdGhyZXNob2xkIHx8IDIwMDtcbiAgbGV0IGxhc3QsIHRpbWVvdXQ7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGxldCBub3cgPSArbmV3IERhdGUoKTtcbiAgICBsZXQgYXJncyA9IGFyZ3VtZW50cztcbiAgICBsZXQgdHJpZ2dlciA9ICgpID0+IHtcbiAgICAgIGxhc3QgPSBub3c7XG4gICAgICBmbi5hcHBseSggdGhpcywgYXJncyApO1xuICAgIH07XG4gICAgaWYgKCBsYXN0ICYmIG5vdyA8IGxhc3QgKyB0aHJlc2hvbGQgKSB7XG4gICAgICAvLyBob2xkIG9uIHRvIGl0XG4gICAgICBjbGVhclRpbWVvdXQoIHRpbWVvdXQgKTtcbiAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KCB0cmlnZ2VyLCB0aHJlc2hvbGQgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHJpZ2dlcigpO1xuICAgIH1cbiAgfTtcbn07XG5cbkluZmluaXRlU2Nyb2xsLmRhdGEgPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgZWxlbSA9IHV0aWxzLmdldFF1ZXJ5RWxlbWVudCggZWxlbSApO1xuICBsZXQgaWQgPSBlbGVtICYmIGVsZW0uaW5maW5pdGVTY3JvbGxHVUlEO1xuICByZXR1cm4gaWQgJiYgaW5zdGFuY2VzWyBpZCBdO1xufTtcblxuLy8gc2V0IGludGVybmFsIGpRdWVyeSwgZm9yIFdlYnBhY2sgKyBqUXVlcnkgdjNcbkluZmluaXRlU2Nyb2xsLnNldEpRdWVyeSA9IGZ1bmN0aW9uKCBqcXJ5ICkge1xuICBqUXVlcnkgPSBqcXJ5O1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gc2V0dXAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxudXRpbHMuaHRtbEluaXQoIEluZmluaXRlU2Nyb2xsLCAnaW5maW5pdGUtc2Nyb2xsJyApO1xuXG4vLyBhZGQgbm9vcCBfaW5pdCBtZXRob2QgZm9yIGpRdWVyeSBCcmlkZ2V0LiAjNzY4XG5wcm90by5faW5pdCA9IGZ1bmN0aW9uKCkge307XG5cbmxldCB7IGpRdWVyeUJyaWRnZXQgfSA9IHdpbmRvdztcbmlmICggalF1ZXJ5ICYmIGpRdWVyeUJyaWRnZXQgKSB7XG4gIGpRdWVyeUJyaWRnZXQoICdpbmZpbml0ZVNjcm9sbCcsIEluZmluaXRlU2Nyb2xsLCBqUXVlcnkgKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnJldHVybiBJbmZpbml0ZVNjcm9sbDtcblxufSApICk7XG4iLCIvLyBoaXN0b3J5XG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgcmVxdWlyZSgnLi9jb3JlJyksXG4gICAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJyksXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgd2luZG93LkluZmluaXRlU2Nyb2xsLFxuICAgICAgICB3aW5kb3cuZml6enlVSVV0aWxzLFxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEluZmluaXRlU2Nyb2xsLCB1dGlscyApIHtcblxubGV0IHByb3RvID0gSW5maW5pdGVTY3JvbGwucHJvdG90eXBlO1xuXG5PYmplY3QuYXNzaWduKCBJbmZpbml0ZVNjcm9sbC5kZWZhdWx0cywge1xuICBoaXN0b3J5OiAncmVwbGFjZScsXG4gIC8vIGhpc3RvcnlUaXRsZTogZmFsc2UsXG59ICk7XG5cbmxldCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuXG4vLyAtLS0tLSBjcmVhdGUvZGVzdHJveSAtLS0tLSAvL1xuXG5JbmZpbml0ZVNjcm9sbC5jcmVhdGUuaGlzdG9yeSA9IGZ1bmN0aW9uKCkge1xuICBpZiAoICF0aGlzLm9wdGlvbnMuaGlzdG9yeSApIHJldHVybjtcblxuICAvLyBjaGVjayBmb3Igc2FtZSBvcmlnaW5cbiAgbGluay5ocmVmID0gdGhpcy5nZXRBYnNvbHV0ZVBhdGgoKTtcbiAgLy8gTVMgRWRnZSBkb2VzIG5vdCBoYXZlIG9yaWdpbiBvbiBsaW5rXG4gIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1pY3Jvc29mdC5jb20vZW4tdXMvbWljcm9zb2Z0LWVkZ2UvcGxhdGZvcm0vaXNzdWVzLzEyMjM2NDkzL1xuICBsZXQgbGlua09yaWdpbiA9IGxpbmsub3JpZ2luIHx8IGxpbmsucHJvdG9jb2wgKyAnLy8nICsgbGluay5ob3N0O1xuICBsZXQgaXNTYW1lT3JpZ2luID0gbGlua09yaWdpbiA9PSBsb2NhdGlvbi5vcmlnaW47XG4gIGlmICggIWlzU2FtZU9yaWdpbiApIHtcbiAgICBjb25zb2xlLmVycm9yKCAnW0luZmluaXRlU2Nyb2xsXSBjYW5ub3Qgc2V0IGhpc3Rvcnkgd2l0aCBkaWZmZXJlbnQgb3JpZ2luOiAnICtcbiAgICAgIGAke2xpbmsub3JpZ2lufSBvbiAke2xvY2F0aW9uLm9yaWdpbn0gLiBIaXN0b3J5IGJlaGF2aW9yIGRpc2FibGVkLmAgKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyB0d28gd2F5cyB0byBoYW5kbGUgY2hhbmdpbmcgaGlzdG9yeVxuICBpZiAoIHRoaXMub3B0aW9ucy5hcHBlbmQgKSB7XG4gICAgdGhpcy5jcmVhdGVIaXN0b3J5QXBwZW5kKCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5jcmVhdGVIaXN0b3J5UGFnZUxvYWQoKTtcbiAgfVxufTtcblxucHJvdG8uY3JlYXRlSGlzdG9yeUFwcGVuZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnVwZGF0ZU1lYXN1cmVtZW50cygpO1xuICB0aGlzLnVwZGF0ZVNjcm9sbGVyKCk7XG4gIC8vIGFycmF5IG9mIHNjcm9sbCBwb3NpdGlvbnMgb2YgYXBwZW5kZWQgcGFnZXNcbiAgdGhpcy5zY3JvbGxQYWdlcyA9IFtcbiAgICAvLyBmaXJzdCBwYWdlXG4gICAge1xuICAgICAgdG9wOiAwLFxuICAgICAgcGF0aDogbG9jYXRpb24uaHJlZixcbiAgICAgIHRpdGxlOiBkb2N1bWVudC50aXRsZSxcbiAgICB9LFxuICBdO1xuICB0aGlzLnNjcm9sbFBhZ2UgPSB0aGlzLnNjcm9sbFBhZ2VzWzBdO1xuICAvLyBldmVudHNcbiAgdGhpcy5zY3JvbGxIaXN0b3J5SGFuZGxlciA9IHRoaXMub25TY3JvbGxIaXN0b3J5LmJpbmQoIHRoaXMgKTtcbiAgdGhpcy51bmxvYWRIYW5kbGVyID0gdGhpcy5vblVubG9hZC5iaW5kKCB0aGlzICk7XG4gIHRoaXMuc2Nyb2xsZXIuYWRkRXZlbnRMaXN0ZW5lciggJ3Njcm9sbCcsIHRoaXMuc2Nyb2xsSGlzdG9yeUhhbmRsZXIgKTtcbiAgdGhpcy5vbiggJ2FwcGVuZCcsIHRoaXMub25BcHBlbmRIaXN0b3J5ICk7XG4gIHRoaXMuYmluZEhpc3RvcnlBcHBlbmRFdmVudHMoIHRydWUgKTtcbn07XG5cbnByb3RvLmJpbmRIaXN0b3J5QXBwZW5kRXZlbnRzID0gZnVuY3Rpb24oIGlzQmluZCApIHtcbiAgbGV0IGFkZFJlbW92ZSA9IGlzQmluZCA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgdGhpcy5zY3JvbGxlclsgYWRkUmVtb3ZlIF0oICdzY3JvbGwnLCB0aGlzLnNjcm9sbEhpc3RvcnlIYW5kbGVyICk7XG4gIHdpbmRvd1sgYWRkUmVtb3ZlIF0oICd1bmxvYWQnLCB0aGlzLnVubG9hZEhhbmRsZXIgKTtcbn07XG5cbnByb3RvLmNyZWF0ZUhpc3RvcnlQYWdlTG9hZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm9uKCAnbG9hZCcsIHRoaXMub25QYWdlTG9hZEhpc3RvcnkgKTtcbn07XG5cbkluZmluaXRlU2Nyb2xsLmRlc3Ryb3kuaGlzdG9yeSA9XG5wcm90by5kZXN0cm95SGlzdG9yeSA9IGZ1bmN0aW9uKCkge1xuICBsZXQgaXNIaXN0b3J5QXBwZW5kID0gdGhpcy5vcHRpb25zLmhpc3RvcnkgJiYgdGhpcy5vcHRpb25zLmFwcGVuZDtcbiAgaWYgKCBpc0hpc3RvcnlBcHBlbmQgKSB7XG4gICAgdGhpcy5iaW5kSGlzdG9yeUFwcGVuZEV2ZW50cyggZmFsc2UgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0gYXBwZW5kIGhpc3RvcnkgLS0tLS0gLy9cblxucHJvdG8ub25BcHBlbmRIaXN0b3J5ID0gZnVuY3Rpb24oIHJlc3BvbnNlLCBwYXRoLCBpdGVtcyApIHtcbiAgLy8gZG8gbm90IHByb2NlZWQgaWYgbm8gaXRlbXMuICM3NzlcbiAgaWYgKCAhaXRlbXMgfHwgIWl0ZW1zLmxlbmd0aCApIHJldHVybjtcblxuICBsZXQgZmlyc3RJdGVtID0gaXRlbXNbMF07XG4gIGxldCBlbGVtU2Nyb2xsWSA9IHRoaXMuZ2V0RWxlbWVudFNjcm9sbFkoIGZpcnN0SXRlbSApO1xuICAvLyByZXNvbHZlIHBhdGhcbiAgbGluay5ocmVmID0gcGF0aDtcbiAgLy8gYWRkIHBhZ2UgZGF0YSB0byBoYXNoXG4gIHRoaXMuc2Nyb2xsUGFnZXMucHVzaCh7XG4gICAgdG9wOiBlbGVtU2Nyb2xsWSxcbiAgICBwYXRoOiBsaW5rLmhyZWYsXG4gICAgdGl0bGU6IHJlc3BvbnNlLnRpdGxlLFxuICB9KTtcbn07XG5cbnByb3RvLmdldEVsZW1lbnRTY3JvbGxZID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIGlmICggdGhpcy5vcHRpb25zLmVsZW1lbnRTY3JvbGwgKSB7XG4gICAgcmV0dXJuIGVsZW0ub2Zmc2V0VG9wIC0gdGhpcy50b3A7XG4gIH0gZWxzZSB7XG4gICAgbGV0IHJlY3QgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHJldHVybiByZWN0LnRvcCArIHdpbmRvdy5zY3JvbGxZO1xuICB9XG59O1xuXG5wcm90by5vblNjcm9sbEhpc3RvcnkgPSBmdW5jdGlvbigpIHtcbiAgLy8gY3ljbGUgdGhyb3VnaCBwb3NpdGlvbnMsIGZpbmQgYmlnZ2VzdCB3aXRob3V0IGdvaW5nIG92ZXJcbiAgbGV0IHNjcm9sbFBhZ2UgPSB0aGlzLmdldENsb3Nlc3RTY3JvbGxQYWdlKCk7XG4gIC8vIHNldCBoaXN0b3J5IGlmIGNoYW5nZWRcbiAgaWYgKCBzY3JvbGxQYWdlICE9IHRoaXMuc2Nyb2xsUGFnZSApIHtcbiAgICB0aGlzLnNjcm9sbFBhZ2UgPSBzY3JvbGxQYWdlO1xuICAgIHRoaXMuc2V0SGlzdG9yeSggc2Nyb2xsUGFnZS50aXRsZSwgc2Nyb2xsUGFnZS5wYXRoICk7XG4gIH1cbn07XG5cbnV0aWxzLmRlYm91bmNlTWV0aG9kKCBJbmZpbml0ZVNjcm9sbCwgJ29uU2Nyb2xsSGlzdG9yeScsIDE1MCApO1xuXG5wcm90by5nZXRDbG9zZXN0U2Nyb2xsUGFnZSA9IGZ1bmN0aW9uKCkge1xuICBsZXQgc2Nyb2xsVmlld1k7XG4gIGlmICggdGhpcy5vcHRpb25zLmVsZW1lbnRTY3JvbGwgKSB7XG4gICAgc2Nyb2xsVmlld1kgPSB0aGlzLnNjcm9sbGVyLnNjcm9sbFRvcCArIHRoaXMuc2Nyb2xsZXIuY2xpZW50SGVpZ2h0IC8gMjtcbiAgfSBlbHNlIHtcbiAgICBzY3JvbGxWaWV3WSA9IHdpbmRvdy5zY3JvbGxZICsgdGhpcy53aW5kb3dIZWlnaHQgLyAyO1xuICB9XG5cbiAgbGV0IHNjcm9sbFBhZ2U7XG4gIGZvciAoIGxldCBwYWdlIG9mIHRoaXMuc2Nyb2xsUGFnZXMgKSB7XG4gICAgaWYgKCBwYWdlLnRvcCA+PSBzY3JvbGxWaWV3WSApIGJyZWFrO1xuXG4gICAgc2Nyb2xsUGFnZSA9IHBhZ2U7XG4gIH1cbiAgcmV0dXJuIHNjcm9sbFBhZ2U7XG59O1xuXG5wcm90by5zZXRIaXN0b3J5ID0gZnVuY3Rpb24oIHRpdGxlLCBwYXRoICkge1xuICBsZXQgb3B0SGlzdG9yeSA9IHRoaXMub3B0aW9ucy5oaXN0b3J5O1xuICBsZXQgaGlzdG9yeU1ldGhvZCA9IG9wdEhpc3RvcnkgJiYgaGlzdG9yeVsgb3B0SGlzdG9yeSArICdTdGF0ZScgXTtcbiAgaWYgKCAhaGlzdG9yeU1ldGhvZCApIHJldHVybjtcblxuICBoaXN0b3J5WyBvcHRIaXN0b3J5ICsgJ1N0YXRlJyBdKCBudWxsLCB0aXRsZSwgcGF0aCApO1xuICBpZiAoIHRoaXMub3B0aW9ucy5oaXN0b3J5VGl0bGUgKSBkb2N1bWVudC50aXRsZSA9IHRpdGxlO1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdoaXN0b3J5JywgbnVsbCwgWyB0aXRsZSwgcGF0aCBdICk7XG59O1xuXG4vLyBzY3JvbGwgdG8gdG9wIHRvIHByZXZlbnQgaW5pdGlhbCBzY3JvbGwtcmVzZXQgYWZ0ZXIgcGFnZSByZWZyZXNoXG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTg2MzM5MTUvMTgyMTgzXG5wcm90by5vblVubG9hZCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIHRoaXMuc2Nyb2xsUGFnZS50b3AgPT09IDAgKSByZXR1cm47XG5cbiAgLy8gY2FsY3VsYXRlIHdoZXJlIHNjcm9sbCBwb3NpdGlvbiB3b3VsZCBiZSBvbiByZWZyZXNoXG4gIGxldCBzY3JvbGxZID0gd2luZG93LnNjcm9sbFkgLSB0aGlzLnNjcm9sbFBhZ2UudG9wICsgdGhpcy50b3A7XG4gIC8vIGRpc2FibGUgc2Nyb2xsIGV2ZW50IGJlZm9yZSBzZXR0aW5nIHNjcm9sbCAjNjc5XG4gIHRoaXMuZGVzdHJveUhpc3RvcnkoKTtcbiAgc2Nyb2xsVG8oIDAsIHNjcm9sbFkgKTtcbn07XG5cbi8vIC0tLS0tIGxvYWQgaGlzdG9yeSAtLS0tLSAvL1xuXG4vLyB1cGRhdGUgVVJMXG5wcm90by5vblBhZ2VMb2FkSGlzdG9yeSA9IGZ1bmN0aW9uKCByZXNwb25zZSwgcGF0aCApIHtcbiAgdGhpcy5zZXRIaXN0b3J5KCByZXNwb25zZS50aXRsZSwgcGF0aCApO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnJldHVybiBJbmZpbml0ZVNjcm9sbDtcblxufSApICk7XG4iLCIvKiFcbiAqIEluZmluaXRlIFNjcm9sbCB2NC4wLjFcbiAqIEF1dG9tYXRpY2FsbHkgYWRkIG5leHQgcGFnZVxuICpcbiAqIExpY2Vuc2VkIEdQTHYzIGZvciBvcGVuIHNvdXJjZSB1c2VcbiAqIG9yIEluZmluaXRlIFNjcm9sbCBDb21tZXJjaWFsIExpY2Vuc2UgZm9yIGNvbW1lcmNpYWwgdXNlXG4gKlxuICogaHR0cHM6Ly9pbmZpbml0ZS1zY3JvbGwuY29tXG4gKiBDb3B5cmlnaHQgMjAxOC0yMDIwIE1ldGFmaXp6eVxuICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgcmVxdWlyZSgnLi9jb3JlJyksXG4gICAgICAgIHJlcXVpcmUoJy4vcGFnZS1sb2FkJyksXG4gICAgICAgIHJlcXVpcmUoJy4vc2Nyb2xsLXdhdGNoJyksXG4gICAgICAgIHJlcXVpcmUoJy4vaGlzdG9yeScpLFxuICAgICAgICByZXF1aXJlKCcuL2J1dHRvbicpLFxuICAgICAgICByZXF1aXJlKCcuL3N0YXR1cycpLFxuICAgICk7XG4gIH1cblxufSApKCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIEluZmluaXRlU2Nyb2xsICkge1xuICByZXR1cm4gSW5maW5pdGVTY3JvbGw7XG59ICk7XG4iLCIvLyBwYWdlLWxvYWRcbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICByZXF1aXJlKCcuL2NvcmUnKSxcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICB3aW5kb3cuSW5maW5pdGVTY3JvbGwsXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgSW5maW5pdGVTY3JvbGwgKSB7XG5cbmxldCBwcm90byA9IEluZmluaXRlU2Nyb2xsLnByb3RvdHlwZTtcblxuT2JqZWN0LmFzc2lnbiggSW5maW5pdGVTY3JvbGwuZGVmYXVsdHMsIHtcbiAgLy8gYXBwZW5kOiBmYWxzZSxcbiAgbG9hZE9uU2Nyb2xsOiB0cnVlLFxuICBjaGVja0xhc3RQYWdlOiB0cnVlLFxuICByZXNwb25zZUJvZHk6ICd0ZXh0JyxcbiAgZG9tUGFyc2VSZXNwb25zZTogdHJ1ZSxcbiAgLy8gcHJlZmlsbDogZmFsc2UsXG4gIC8vIG91dGxheWVyOiBudWxsLFxufSApO1xuXG5JbmZpbml0ZVNjcm9sbC5jcmVhdGUucGFnZUxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jYW5Mb2FkID0gdHJ1ZTtcbiAgdGhpcy5vbiggJ3Njcm9sbFRocmVzaG9sZCcsIHRoaXMub25TY3JvbGxUaHJlc2hvbGRMb2FkICk7XG4gIHRoaXMub24oICdsb2FkJywgdGhpcy5jaGVja0xhc3RQYWdlICk7XG4gIGlmICggdGhpcy5vcHRpb25zLm91dGxheWVyICkge1xuICAgIHRoaXMub24oICdhcHBlbmQnLCB0aGlzLm9uQXBwZW5kT3V0bGF5ZXIgKTtcbiAgfVxufTtcblxucHJvdG8ub25TY3JvbGxUaHJlc2hvbGRMb2FkID0gZnVuY3Rpb24oKSB7XG4gIGlmICggdGhpcy5vcHRpb25zLmxvYWRPblNjcm9sbCApIHRoaXMubG9hZE5leHRQYWdlKCk7XG59O1xuXG5sZXQgZG9tUGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuXG5wcm90by5sb2FkTmV4dFBhZ2UgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCB0aGlzLmlzTG9hZGluZyB8fCAhdGhpcy5jYW5Mb2FkICkgcmV0dXJuO1xuXG4gIGxldCB7IHJlc3BvbnNlQm9keSwgZG9tUGFyc2VSZXNwb25zZSwgZmV0Y2hPcHRpb25zIH0gPSB0aGlzLm9wdGlvbnM7XG4gIGxldCBwYXRoID0gdGhpcy5nZXRBYnNvbHV0ZVBhdGgoKTtcbiAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xuICBpZiAoIHR5cGVvZiBmZXRjaE9wdGlvbnMgPT0gJ2Z1bmN0aW9uJyApIGZldGNoT3B0aW9ucyA9IGZldGNoT3B0aW9ucygpO1xuXG4gIGxldCBmZXRjaFByb21pc2UgPSBmZXRjaCggcGF0aCwgZmV0Y2hPcHRpb25zIClcbiAgICAudGhlbiggKCByZXNwb25zZSApID0+IHtcbiAgICAgIGlmICggIXJlc3BvbnNlLm9rICkge1xuICAgICAgICBsZXQgZXJyb3IgPSBuZXcgRXJyb3IoIHJlc3BvbnNlLnN0YXR1c1RleHQgKTtcbiAgICAgICAgdGhpcy5vblBhZ2VFcnJvciggZXJyb3IsIHBhdGgsIHJlc3BvbnNlICk7XG4gICAgICAgIHJldHVybiB7IHJlc3BvbnNlIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXNwb25zZVsgcmVzcG9uc2VCb2R5IF0oKS50aGVuKCAoIGJvZHkgKSA9PiB7XG4gICAgICAgIGxldCBjYW5Eb21QYXJzZSA9IHJlc3BvbnNlQm9keSA9PSAndGV4dCcgJiYgZG9tUGFyc2VSZXNwb25zZTtcbiAgICAgICAgaWYgKCBjYW5Eb21QYXJzZSApIHtcbiAgICAgICAgICBib2R5ID0gZG9tUGFyc2VyLnBhcnNlRnJvbVN0cmluZyggYm9keSwgJ3RleHQvaHRtbCcgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIHJlc3BvbnNlLnN0YXR1cyA9PSAyMDQgKSB7XG4gICAgICAgICAgdGhpcy5sYXN0UGFnZVJlYWNoZWQoIGJvZHksIHBhdGggKTtcbiAgICAgICAgICByZXR1cm4geyBib2R5LCByZXNwb25zZSB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLm9uUGFnZUxvYWQoIGJvZHksIHBhdGgsIHJlc3BvbnNlICk7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICB9IClcbiAgICAuY2F0Y2goICggZXJyb3IgKSA9PiB7XG4gICAgICB0aGlzLm9uUGFnZUVycm9yKCBlcnJvciwgcGF0aCApO1xuICAgIH0gKTtcblxuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdyZXF1ZXN0JywgbnVsbCwgWyBwYXRoLCBmZXRjaFByb21pc2UgXSApO1xuXG4gIHJldHVybiBmZXRjaFByb21pc2U7XG59O1xuXG5wcm90by5vblBhZ2VMb2FkID0gZnVuY3Rpb24oIGJvZHksIHBhdGgsIHJlc3BvbnNlICkge1xuICAvLyBkb25lIGxvYWRpbmcgaWYgbm90IGFwcGVuZGluZ1xuICBpZiAoICF0aGlzLm9wdGlvbnMuYXBwZW5kICkge1xuICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gIH1cbiAgdGhpcy5wYWdlSW5kZXgrKztcbiAgdGhpcy5sb2FkQ291bnQrKztcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAnbG9hZCcsIG51bGwsIFsgYm9keSwgcGF0aCwgcmVzcG9uc2UgXSApO1xuICByZXR1cm4gdGhpcy5hcHBlbmROZXh0UGFnZSggYm9keSwgcGF0aCwgcmVzcG9uc2UgKTtcbn07XG5cbnByb3RvLmFwcGVuZE5leHRQYWdlID0gZnVuY3Rpb24oIGJvZHksIHBhdGgsIHJlc3BvbnNlICkge1xuICBsZXQgeyBhcHBlbmQsIHJlc3BvbnNlQm9keSwgZG9tUGFyc2VSZXNwb25zZSB9ID0gdGhpcy5vcHRpb25zO1xuICAvLyBkbyBub3QgYXBwZW5kIGpzb25cbiAgbGV0IGlzRG9jdW1lbnQgPSByZXNwb25zZUJvZHkgPT0gJ3RleHQnICYmIGRvbVBhcnNlUmVzcG9uc2U7XG4gIGlmICggIWlzRG9jdW1lbnQgfHwgIWFwcGVuZCApIHJldHVybiB7IGJvZHksIHJlc3BvbnNlIH07XG5cbiAgbGV0IGl0ZW1zID0gYm9keS5xdWVyeVNlbGVjdG9yQWxsKCBhcHBlbmQgKTtcbiAgbGV0IHByb21pc2VWYWx1ZSA9IHsgYm9keSwgcmVzcG9uc2UsIGl0ZW1zIH07XG4gIC8vIGxhc3QgcGFnZSBoaXQgaWYgbm8gaXRlbXMuICM4NDBcbiAgaWYgKCAhaXRlbXMgfHwgIWl0ZW1zLmxlbmd0aCApIHtcbiAgICB0aGlzLmxhc3RQYWdlUmVhY2hlZCggYm9keSwgcGF0aCApO1xuICAgIHJldHVybiBwcm9taXNlVmFsdWU7XG4gIH1cblxuICBsZXQgZnJhZ21lbnQgPSBnZXRJdGVtc0ZyYWdtZW50KCBpdGVtcyApO1xuICBsZXQgYXBwZW5kUmVhZHkgPSAoKSA9PiB7XG4gICAgdGhpcy5hcHBlbmRJdGVtcyggaXRlbXMsIGZyYWdtZW50ICk7XG4gICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoICdhcHBlbmQnLCBudWxsLCBbIGJvZHksIHBhdGgsIGl0ZW1zLCByZXNwb25zZSBdICk7XG4gICAgcmV0dXJuIHByb21pc2VWYWx1ZTtcbiAgfTtcblxuICAvLyBUT0RPIGFkZCBob29rIGZvciBvcHRpb24gdG8gdHJpZ2dlciBhcHBlbmRSZWFkeVxuICBpZiAoIHRoaXMub3B0aW9ucy5vdXRsYXllciApIHtcbiAgICByZXR1cm4gdGhpcy5hcHBlbmRPdXRsYXllckl0ZW1zKCBmcmFnbWVudCwgYXBwZW5kUmVhZHkgKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYXBwZW5kUmVhZHkoKTtcbiAgfVxufTtcblxucHJvdG8uYXBwZW5kSXRlbXMgPSBmdW5jdGlvbiggaXRlbXMsIGZyYWdtZW50ICkge1xuICBpZiAoICFpdGVtcyB8fCAhaXRlbXMubGVuZ3RoICkgcmV0dXJuO1xuXG4gIC8vIGdldCBmcmFnbWVudCBpZiBub3QgcHJvdmlkZWRcbiAgZnJhZ21lbnQgPSBmcmFnbWVudCB8fCBnZXRJdGVtc0ZyYWdtZW50KCBpdGVtcyApO1xuICByZWZyZXNoU2NyaXB0cyggZnJhZ21lbnQgKTtcbiAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKCBmcmFnbWVudCApO1xufTtcblxuZnVuY3Rpb24gZ2V0SXRlbXNGcmFnbWVudCggaXRlbXMgKSB7XG4gIC8vIGFkZCBpdGVtcyB0byBmcmFnbWVudFxuICBsZXQgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIGlmICggaXRlbXMgKSBmcmFnbWVudC5hcHBlbmQoIC4uLml0ZW1zICk7XG4gIHJldHVybiBmcmFnbWVudDtcbn1cblxuLy8gcmVwbGFjZSA8c2NyaXB0PnMgd2l0aCBjb3BpZXMgc28gdGhleSBsb2FkXG4vLyA8c2NyaXB0PnMgYWRkZWQgYnkgSW5maW5pdGVTY3JvbGwgd2lsbCBub3QgbG9hZFxuLy8gc2ltaWxhciB0byBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy82MTA5OTVcbmZ1bmN0aW9uIHJlZnJlc2hTY3JpcHRzKCBmcmFnbWVudCApIHtcbiAgbGV0IHNjcmlwdHMgPSBmcmFnbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHQnKTtcbiAgZm9yICggbGV0IHNjcmlwdCBvZiBzY3JpcHRzICkge1xuICAgIGxldCBmcmVzaFNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgIC8vIGNvcHkgYXR0cmlidXRlc1xuICAgIGxldCBhdHRycyA9IHNjcmlwdC5hdHRyaWJ1dGVzO1xuICAgIGZvciAoIGxldCBhdHRyIG9mIGF0dHJzICkge1xuICAgICAgZnJlc2hTY3JpcHQuc2V0QXR0cmlidXRlKCBhdHRyLm5hbWUsIGF0dHIudmFsdWUgKTtcbiAgICB9XG4gICAgLy8gY29weSBpbm5lciBzY3JpcHQgY29kZS4gIzcxOCwgIzc4MlxuICAgIGZyZXNoU2NyaXB0LmlubmVySFRNTCA9IHNjcmlwdC5pbm5lckhUTUw7XG4gICAgc2NyaXB0LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKCBmcmVzaFNjcmlwdCwgc2NyaXB0ICk7XG4gIH1cbn1cblxuLy8gLS0tLS0gb3V0bGF5ZXIgLS0tLS0gLy9cblxucHJvdG8uYXBwZW5kT3V0bGF5ZXJJdGVtcyA9IGZ1bmN0aW9uKCBmcmFnbWVudCwgYXBwZW5kUmVhZHkgKSB7XG4gIGxldCBpbWFnZXNMb2FkZWQgPSBJbmZpbml0ZVNjcm9sbC5pbWFnZXNMb2FkZWQgfHwgd2luZG93LmltYWdlc0xvYWRlZDtcbiAgaWYgKCAhaW1hZ2VzTG9hZGVkICkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1tJbmZpbml0ZVNjcm9sbF0gaW1hZ2VzTG9hZGVkIHJlcXVpcmVkIGZvciBvdXRsYXllciBvcHRpb24nKTtcbiAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBhcHBlbmQgb25jZSBpbWFnZXMgbG9hZGVkXG4gIHJldHVybiBuZXcgUHJvbWlzZSggZnVuY3Rpb24oIHJlc29sdmUgKSB7XG4gICAgaW1hZ2VzTG9hZGVkKCBmcmFnbWVudCwgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgYm9keVJlc3BvbnNlID0gYXBwZW5kUmVhZHkoKTtcbiAgICAgIHJlc29sdmUoIGJvZHlSZXNwb25zZSApO1xuICAgIH0gKTtcbiAgfSApO1xufTtcblxucHJvdG8ub25BcHBlbmRPdXRsYXllciA9IGZ1bmN0aW9uKCByZXNwb25zZSwgcGF0aCwgaXRlbXMgKSB7XG4gIHRoaXMub3B0aW9ucy5vdXRsYXllci5hcHBlbmRlZCggaXRlbXMgKTtcbn07XG5cbi8vIC0tLS0tIGNoZWNrTGFzdFBhZ2UgLS0tLS0gLy9cblxuLy8gY2hlY2sgcmVzcG9uc2UgZm9yIG5leHQgZWxlbWVudFxucHJvdG8uY2hlY2tMYXN0UGFnZSA9IGZ1bmN0aW9uKCBib2R5LCBwYXRoICkge1xuICBsZXQgeyBjaGVja0xhc3RQYWdlLCBwYXRoOiBwYXRoT3B0IH0gPSB0aGlzLm9wdGlvbnM7XG4gIGlmICggIWNoZWNrTGFzdFBhZ2UgKSByZXR1cm47XG5cbiAgLy8gaWYgcGF0aCBpcyBmdW5jdGlvbiwgY2hlY2sgaWYgbmV4dCBwYXRoIGlzIHRydXRoeVxuICBpZiAoIHR5cGVvZiBwYXRoT3B0ID09ICdmdW5jdGlvbicgKSB7XG4gICAgbGV0IG5leHRQYXRoID0gdGhpcy5nZXRQYXRoKCk7XG4gICAgaWYgKCAhbmV4dFBhdGggKSB7XG4gICAgICB0aGlzLmxhc3RQYWdlUmVhY2hlZCggYm9keSwgcGF0aCApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICAvLyBnZXQgc2VsZWN0b3IgZnJvbSBjaGVja0xhc3RQYWdlIG9yIHBhdGggb3B0aW9uXG4gIGxldCBzZWxlY3RvcjtcbiAgaWYgKCB0eXBlb2YgY2hlY2tMYXN0UGFnZSA9PSAnc3RyaW5nJyApIHtcbiAgICBzZWxlY3RvciA9IGNoZWNrTGFzdFBhZ2U7XG4gIH0gZWxzZSBpZiAoIHRoaXMuaXNQYXRoU2VsZWN0b3IgKSB7XG4gICAgLy8gcGF0aCBvcHRpb24gaXMgc2VsZWN0b3Igc3RyaW5nXG4gICAgc2VsZWN0b3IgPSBwYXRoT3B0O1xuICB9XG4gIC8vIGNoZWNrIGxhc3QgcGFnZSBmb3Igc2VsZWN0b3JcbiAgLy8gYmFpbCBpZiBubyBzZWxlY3RvciBvciBub3QgZG9jdW1lbnQgcmVzcG9uc2VcbiAgaWYgKCAhc2VsZWN0b3IgfHwgIWJvZHkucXVlcnlTZWxlY3RvciApIHJldHVybjtcblxuICAvLyBjaGVjayBpZiByZXNwb25zZSBoYXMgc2VsZWN0b3JcbiAgbGV0IG5leHRFbGVtID0gYm9keS5xdWVyeVNlbGVjdG9yKCBzZWxlY3RvciApO1xuICBpZiAoICFuZXh0RWxlbSApIHRoaXMubGFzdFBhZ2VSZWFjaGVkKCBib2R5LCBwYXRoICk7XG59O1xuXG5wcm90by5sYXN0UGFnZVJlYWNoZWQgPSBmdW5jdGlvbiggYm9keSwgcGF0aCApIHtcbiAgdGhpcy5jYW5Mb2FkID0gZmFsc2U7XG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ2xhc3QnLCBudWxsLCBbIGJvZHksIHBhdGggXSApO1xufTtcblxuLy8gLS0tLS0gZXJyb3IgLS0tLS0gLy9cblxucHJvdG8ub25QYWdlRXJyb3IgPSBmdW5jdGlvbiggZXJyb3IsIHBhdGgsIHJlc3BvbnNlICkge1xuICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xuICB0aGlzLmNhbkxvYWQgPSBmYWxzZTtcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAnZXJyb3InLCBudWxsLCBbIGVycm9yLCBwYXRoLCByZXNwb25zZSBdICk7XG4gIHJldHVybiBlcnJvcjtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHByZWZpbGwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuSW5maW5pdGVTY3JvbGwuY3JlYXRlLnByZWZpbGwgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGhpcy5vcHRpb25zLnByZWZpbGwgKSByZXR1cm47XG5cbiAgbGV0IGFwcGVuZCA9IHRoaXMub3B0aW9ucy5hcHBlbmQ7XG4gIGlmICggIWFwcGVuZCApIHtcbiAgICBjb25zb2xlLmVycm9yKGBhcHBlbmQgb3B0aW9uIHJlcXVpcmVkIGZvciBwcmVmaWxsLiBTZXQgYXMgOiR7YXBwZW5kfWApO1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnVwZGF0ZU1lYXN1cmVtZW50cygpO1xuICB0aGlzLnVwZGF0ZVNjcm9sbGVyKCk7XG4gIHRoaXMuaXNQcmVmaWxsaW5nID0gdHJ1ZTtcbiAgdGhpcy5vbiggJ2FwcGVuZCcsIHRoaXMucHJlZmlsbCApO1xuICB0aGlzLm9uY2UoICdlcnJvcicsIHRoaXMuc3RvcFByZWZpbGwgKTtcbiAgdGhpcy5vbmNlKCAnbGFzdCcsIHRoaXMuc3RvcFByZWZpbGwgKTtcbiAgdGhpcy5wcmVmaWxsKCk7XG59O1xuXG5wcm90by5wcmVmaWxsID0gZnVuY3Rpb24oKSB7XG4gIGxldCBkaXN0YW5jZSA9IHRoaXMuZ2V0UHJlZmlsbERpc3RhbmNlKCk7XG4gIHRoaXMuaXNQcmVmaWxsaW5nID0gZGlzdGFuY2UgPj0gMDtcbiAgaWYgKCB0aGlzLmlzUHJlZmlsbGluZyApIHtcbiAgICB0aGlzLmxvZygncHJlZmlsbCcpO1xuICAgIHRoaXMubG9hZE5leHRQYWdlKCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5zdG9wUHJlZmlsbCgpO1xuICB9XG59O1xuXG5wcm90by5nZXRQcmVmaWxsRGlzdGFuY2UgPSBmdW5jdGlvbigpIHtcbiAgLy8gZWxlbWVudCBzY3JvbGxcbiAgaWYgKCB0aGlzLm9wdGlvbnMuZWxlbWVudFNjcm9sbCApIHtcbiAgICByZXR1cm4gdGhpcy5zY3JvbGxlci5jbGllbnRIZWlnaHQgLSB0aGlzLnNjcm9sbGVyLnNjcm9sbEhlaWdodDtcbiAgfVxuICAvLyB3aW5kb3dcbiAgcmV0dXJuIHRoaXMud2luZG93SGVpZ2h0IC0gdGhpcy5lbGVtZW50LmNsaWVudEhlaWdodDtcbn07XG5cbnByb3RvLnN0b3BQcmVmaWxsID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMubG9nKCdzdG9wUHJlZmlsbCcpO1xuICB0aGlzLm9mZiggJ2FwcGVuZCcsIHRoaXMucHJlZmlsbCApO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnJldHVybiBJbmZpbml0ZVNjcm9sbDtcblxufSApICk7XG4iLCIvLyBzY3JvbGwtd2F0Y2hcbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICByZXF1aXJlKCcuL2NvcmUnKSxcbiAgICAgICAgcmVxdWlyZSgnZml6enktdWktdXRpbHMnKSxcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICB3aW5kb3cuSW5maW5pdGVTY3JvbGwsXG4gICAgICAgIHdpbmRvdy5maXp6eVVJVXRpbHMsXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgSW5maW5pdGVTY3JvbGwsIHV0aWxzICkge1xuXG5sZXQgcHJvdG8gPSBJbmZpbml0ZVNjcm9sbC5wcm90b3R5cGU7XG5cbi8vIGRlZmF1bHQgb3B0aW9uc1xuT2JqZWN0LmFzc2lnbiggSW5maW5pdGVTY3JvbGwuZGVmYXVsdHMsIHtcbiAgc2Nyb2xsVGhyZXNob2xkOiA0MDAsXG4gIC8vIGVsZW1lbnRTY3JvbGw6IG51bGwsXG59ICk7XG5cbkluZmluaXRlU2Nyb2xsLmNyZWF0ZS5zY3JvbGxXYXRjaCA9IGZ1bmN0aW9uKCkge1xuICAvLyBldmVudHNcbiAgdGhpcy5wYWdlU2Nyb2xsSGFuZGxlciA9IHRoaXMub25QYWdlU2Nyb2xsLmJpbmQoIHRoaXMgKTtcbiAgdGhpcy5yZXNpemVIYW5kbGVyID0gdGhpcy5vblJlc2l6ZS5iaW5kKCB0aGlzICk7XG5cbiAgbGV0IHNjcm9sbFRocmVzaG9sZCA9IHRoaXMub3B0aW9ucy5zY3JvbGxUaHJlc2hvbGQ7XG4gIGxldCBpc0VuYWJsZSA9IHNjcm9sbFRocmVzaG9sZCB8fCBzY3JvbGxUaHJlc2hvbGQgPT09IDA7XG4gIGlmICggaXNFbmFibGUgKSB0aGlzLmVuYWJsZVNjcm9sbFdhdGNoKCk7XG59O1xuXG5JbmZpbml0ZVNjcm9sbC5kZXN0cm95LnNjcm9sbFdhdGNoID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZGlzYWJsZVNjcm9sbFdhdGNoKCk7XG59O1xuXG5wcm90by5lbmFibGVTY3JvbGxXYXRjaCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIHRoaXMuaXNTY3JvbGxXYXRjaGluZyApIHJldHVybjtcblxuICB0aGlzLmlzU2Nyb2xsV2F0Y2hpbmcgPSB0cnVlO1xuICB0aGlzLnVwZGF0ZU1lYXN1cmVtZW50cygpO1xuICB0aGlzLnVwZGF0ZVNjcm9sbGVyKCk7XG4gIC8vIFRPRE8gZGlzYWJsZSBhZnRlciBlcnJvcj9cbiAgdGhpcy5vbiggJ2xhc3QnLCB0aGlzLmRpc2FibGVTY3JvbGxXYXRjaCApO1xuICB0aGlzLmJpbmRTY3JvbGxXYXRjaEV2ZW50cyggdHJ1ZSApO1xufTtcblxucHJvdG8uZGlzYWJsZVNjcm9sbFdhdGNoID0gZnVuY3Rpb24oKSB7XG4gIGlmICggIXRoaXMuaXNTY3JvbGxXYXRjaGluZyApIHJldHVybjtcblxuICB0aGlzLmJpbmRTY3JvbGxXYXRjaEV2ZW50cyggZmFsc2UgKTtcbiAgZGVsZXRlIHRoaXMuaXNTY3JvbGxXYXRjaGluZztcbn07XG5cbnByb3RvLmJpbmRTY3JvbGxXYXRjaEV2ZW50cyA9IGZ1bmN0aW9uKCBpc0JpbmQgKSB7XG4gIGxldCBhZGRSZW1vdmUgPSBpc0JpbmQgPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gIHRoaXMuc2Nyb2xsZXJbIGFkZFJlbW92ZSBdKCAnc2Nyb2xsJywgdGhpcy5wYWdlU2Nyb2xsSGFuZGxlciApO1xuICB3aW5kb3dbIGFkZFJlbW92ZSBdKCAncmVzaXplJywgdGhpcy5yZXNpemVIYW5kbGVyICk7XG59O1xuXG5wcm90by5vblBhZ2VTY3JvbGwgPSBJbmZpbml0ZVNjcm9sbC50aHJvdHRsZSggZnVuY3Rpb24oKSB7XG4gIGxldCBkaXN0YW5jZSA9IHRoaXMuZ2V0Qm90dG9tRGlzdGFuY2UoKTtcbiAgaWYgKCBkaXN0YW5jZSA8PSB0aGlzLm9wdGlvbnMuc2Nyb2xsVGhyZXNob2xkICkge1xuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCgnc2Nyb2xsVGhyZXNob2xkJyk7XG4gIH1cbn0gKTtcblxucHJvdG8uZ2V0Qm90dG9tRGlzdGFuY2UgPSBmdW5jdGlvbigpIHtcbiAgbGV0IGJvdHRvbSwgc2Nyb2xsWTtcbiAgaWYgKCB0aGlzLm9wdGlvbnMuZWxlbWVudFNjcm9sbCApIHtcbiAgICBib3R0b20gPSB0aGlzLnNjcm9sbGVyLnNjcm9sbEhlaWdodDtcbiAgICBzY3JvbGxZID0gdGhpcy5zY3JvbGxlci5zY3JvbGxUb3AgKyB0aGlzLnNjcm9sbGVyLmNsaWVudEhlaWdodDtcbiAgfSBlbHNlIHtcbiAgICBib3R0b20gPSB0aGlzLnRvcCArIHRoaXMuZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgc2Nyb2xsWSA9IHdpbmRvdy5zY3JvbGxZICsgdGhpcy53aW5kb3dIZWlnaHQ7XG4gIH1cbiAgcmV0dXJuIGJvdHRvbSAtIHNjcm9sbFk7XG59O1xuXG5wcm90by5vblJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnVwZGF0ZU1lYXN1cmVtZW50cygpO1xufTtcblxudXRpbHMuZGVib3VuY2VNZXRob2QoIEluZmluaXRlU2Nyb2xsLCAnb25SZXNpemUnLCAxNTAgKTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnJldHVybiBJbmZpbml0ZVNjcm9sbDtcblxufSApICk7XG4iLCIvLyBzdGF0dXNcbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICByZXF1aXJlKCcuL2NvcmUnKSxcbiAgICAgICAgcmVxdWlyZSgnZml6enktdWktdXRpbHMnKSxcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICB3aW5kb3cuSW5maW5pdGVTY3JvbGwsXG4gICAgICAgIHdpbmRvdy5maXp6eVVJVXRpbHMsXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgSW5maW5pdGVTY3JvbGwsIHV0aWxzICkge1xuXG5sZXQgcHJvdG8gPSBJbmZpbml0ZVNjcm9sbC5wcm90b3R5cGU7XG5cbi8vIEluZmluaXRlU2Nyb2xsLmRlZmF1bHRzLnN0YXR1cyA9IG51bGw7XG5cbkluZmluaXRlU2Nyb2xsLmNyZWF0ZS5zdGF0dXMgPSBmdW5jdGlvbigpIHtcbiAgbGV0IHN0YXR1c0VsZW0gPSB1dGlscy5nZXRRdWVyeUVsZW1lbnQoIHRoaXMub3B0aW9ucy5zdGF0dXMgKTtcbiAgaWYgKCAhc3RhdHVzRWxlbSApIHJldHVybjtcblxuICAvLyBlbGVtZW50c1xuICB0aGlzLnN0YXR1c0VsZW1lbnQgPSBzdGF0dXNFbGVtO1xuICB0aGlzLnN0YXR1c0V2ZW50RWxlbWVudHMgPSB7XG4gICAgcmVxdWVzdDogc3RhdHVzRWxlbS5xdWVyeVNlbGVjdG9yKCcuaW5maW5pdGUtc2Nyb2xsLXJlcXVlc3QnKSxcbiAgICBlcnJvcjogc3RhdHVzRWxlbS5xdWVyeVNlbGVjdG9yKCcuaW5maW5pdGUtc2Nyb2xsLWVycm9yJyksXG4gICAgbGFzdDogc3RhdHVzRWxlbS5xdWVyeVNlbGVjdG9yKCcuaW5maW5pdGUtc2Nyb2xsLWxhc3QnKSxcbiAgfTtcbiAgLy8gZXZlbnRzXG4gIHRoaXMub24oICdyZXF1ZXN0JywgdGhpcy5zaG93UmVxdWVzdFN0YXR1cyApO1xuICB0aGlzLm9uKCAnZXJyb3InLCB0aGlzLnNob3dFcnJvclN0YXR1cyApO1xuICB0aGlzLm9uKCAnbGFzdCcsIHRoaXMuc2hvd0xhc3RTdGF0dXMgKTtcbiAgdGhpcy5iaW5kSGlkZVN0YXR1cygnb24nKTtcbn07XG5cbnByb3RvLmJpbmRIaWRlU3RhdHVzID0gZnVuY3Rpb24oIGJpbmRNZXRob2QgKSB7XG4gIGxldCBoaWRlRXZlbnQgPSB0aGlzLm9wdGlvbnMuYXBwZW5kID8gJ2FwcGVuZCcgOiAnbG9hZCc7XG4gIHRoaXNbIGJpbmRNZXRob2QgXSggaGlkZUV2ZW50LCB0aGlzLmhpZGVBbGxTdGF0dXMgKTtcbn07XG5cbnByb3RvLnNob3dSZXF1ZXN0U3RhdHVzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2hvd1N0YXR1cygncmVxdWVzdCcpO1xufTtcblxucHJvdG8uc2hvd0Vycm9yU3RhdHVzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2hvd1N0YXR1cygnZXJyb3InKTtcbn07XG5cbnByb3RvLnNob3dMYXN0U3RhdHVzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2hvd1N0YXR1cygnbGFzdCcpO1xuICAvLyBwcmV2ZW50IGxhc3QgdGhlbiBhcHBlbmQgZXZlbnQgcmFjZSBjb25kaXRpb24gZnJvbSBzaG93aW5nIGxhc3Qgc3RhdHVzICM3MDZcbiAgdGhpcy5iaW5kSGlkZVN0YXR1cygnb2ZmJyk7XG59O1xuXG5wcm90by5zaG93U3RhdHVzID0gZnVuY3Rpb24oIGV2ZW50TmFtZSApIHtcbiAgc2hvdyggdGhpcy5zdGF0dXNFbGVtZW50ICk7XG4gIHRoaXMuaGlkZVN0YXR1c0V2ZW50RWxlbWVudHMoKTtcbiAgbGV0IGV2ZW50RWxlbSA9IHRoaXMuc3RhdHVzRXZlbnRFbGVtZW50c1sgZXZlbnROYW1lIF07XG4gIHNob3coIGV2ZW50RWxlbSApO1xufTtcblxucHJvdG8uaGlkZUFsbFN0YXR1cyA9IGZ1bmN0aW9uKCkge1xuICBoaWRlKCB0aGlzLnN0YXR1c0VsZW1lbnQgKTtcbiAgdGhpcy5oaWRlU3RhdHVzRXZlbnRFbGVtZW50cygpO1xufTtcblxucHJvdG8uaGlkZVN0YXR1c0V2ZW50RWxlbWVudHMgPSBmdW5jdGlvbigpIHtcbiAgZm9yICggbGV0IHR5cGUgaW4gdGhpcy5zdGF0dXNFdmVudEVsZW1lbnRzICkge1xuICAgIGxldCBldmVudEVsZW0gPSB0aGlzLnN0YXR1c0V2ZW50RWxlbWVudHNbIHR5cGUgXTtcbiAgICBoaWRlKCBldmVudEVsZW0gKTtcbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmZ1bmN0aW9uIGhpZGUoIGVsZW0gKSB7XG4gIHNldERpc3BsYXkoIGVsZW0sICdub25lJyApO1xufVxuXG5mdW5jdGlvbiBzaG93KCBlbGVtICkge1xuICBzZXREaXNwbGF5KCBlbGVtLCAnYmxvY2snICk7XG59XG5cbmZ1bmN0aW9uIHNldERpc3BsYXkoIGVsZW0sIHZhbHVlICkge1xuICBpZiAoIGVsZW0gKSB7XG4gICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gdmFsdWU7XG4gIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnJldHVybiBJbmZpbml0ZVNjcm9sbDtcblxufSApICk7XG4iLCIoZnVuY3Rpb24od2luZG93LCBmYWN0b3J5KSB7XG5cdHZhciBsYXp5U2l6ZXMgPSBmYWN0b3J5KHdpbmRvdywgd2luZG93LmRvY3VtZW50LCBEYXRlKTtcblx0d2luZG93LmxhenlTaXplcyA9IGxhenlTaXplcztcblx0aWYodHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyl7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBsYXp5U2l6ZXM7XG5cdH1cbn0odHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyA/XG4gICAgICB3aW5kb3cgOiB7fSwgXG4vKipcbiAqIGltcG9ydChcIi4vdHlwZXMvZ2xvYmFsXCIpXG4gKiBAdHlwZWRlZiB7IGltcG9ydChcIi4vdHlwZXMvbGF6eXNpemVzLWNvbmZpZ1wiKS5MYXp5U2l6ZXNDb25maWdQYXJ0aWFsIH0gTGF6eVNpemVzQ29uZmlnUGFydGlhbFxuICovXG5mdW5jdGlvbiBsKHdpbmRvdywgZG9jdW1lbnQsIERhdGUpIHsgLy8gUGFzcyBpbiB0aGUgd2luZG93IERhdGUgZnVuY3Rpb24gYWxzbyBmb3IgU1NSIGJlY2F1c2UgdGhlIERhdGUgY2xhc3MgY2FuIGJlIGxvc3Rcblx0J3VzZSBzdHJpY3QnO1xuXHQvKmpzaGludCBlcW51bGw6dHJ1ZSAqL1xuXG5cdHZhciBsYXp5c2l6ZXMsXG5cdFx0LyoqXG5cdFx0ICogQHR5cGUgeyBMYXp5U2l6ZXNDb25maWdQYXJ0aWFsIH1cblx0XHQgKi9cblx0XHRsYXp5U2l6ZXNDZmc7XG5cblx0KGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHByb3A7XG5cblx0XHR2YXIgbGF6eVNpemVzRGVmYXVsdHMgPSB7XG5cdFx0XHRsYXp5Q2xhc3M6ICdsYXp5bG9hZCcsXG5cdFx0XHRsb2FkZWRDbGFzczogJ2xhenlsb2FkZWQnLFxuXHRcdFx0bG9hZGluZ0NsYXNzOiAnbGF6eWxvYWRpbmcnLFxuXHRcdFx0cHJlbG9hZENsYXNzOiAnbGF6eXByZWxvYWQnLFxuXHRcdFx0ZXJyb3JDbGFzczogJ2xhenllcnJvcicsXG5cdFx0XHQvL3N0cmljdENsYXNzOiAnbGF6eXN0cmljdCcsXG5cdFx0XHRhdXRvc2l6ZXNDbGFzczogJ2xhenlhdXRvc2l6ZXMnLFxuXHRcdFx0ZmFzdExvYWRlZENsYXNzOiAnbHMtaXMtY2FjaGVkJyxcblx0XHRcdGlmcmFtZUxvYWRNb2RlOiAwLFxuXHRcdFx0c3JjQXR0cjogJ2RhdGEtc3JjJyxcblx0XHRcdHNyY3NldEF0dHI6ICdkYXRhLXNyY3NldCcsXG5cdFx0XHRzaXplc0F0dHI6ICdkYXRhLXNpemVzJyxcblx0XHRcdC8vcHJlbG9hZEFmdGVyTG9hZDogZmFsc2UsXG5cdFx0XHRtaW5TaXplOiA0MCxcblx0XHRcdGN1c3RvbU1lZGlhOiB7fSxcblx0XHRcdGluaXQ6IHRydWUsXG5cdFx0XHRleHBGYWN0b3I6IDEuNSxcblx0XHRcdGhGYWM6IDAuOCxcblx0XHRcdGxvYWRNb2RlOiAyLFxuXHRcdFx0bG9hZEhpZGRlbjogdHJ1ZSxcblx0XHRcdHJpY1RpbWVvdXQ6IDAsXG5cdFx0XHR0aHJvdHRsZURlbGF5OiAxMjUsXG5cdFx0fTtcblxuXHRcdGxhenlTaXplc0NmZyA9IHdpbmRvdy5sYXp5U2l6ZXNDb25maWcgfHwgd2luZG93LmxhenlzaXplc0NvbmZpZyB8fCB7fTtcblxuXHRcdGZvcihwcm9wIGluIGxhenlTaXplc0RlZmF1bHRzKXtcblx0XHRcdGlmKCEocHJvcCBpbiBsYXp5U2l6ZXNDZmcpKXtcblx0XHRcdFx0bGF6eVNpemVzQ2ZnW3Byb3BdID0gbGF6eVNpemVzRGVmYXVsdHNbcHJvcF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9KSgpO1xuXG5cdGlmICghZG9jdW1lbnQgfHwgIWRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0aW5pdDogZnVuY3Rpb24gKCkge30sXG5cdFx0XHQvKipcblx0XHRcdCAqIEB0eXBlIHsgTGF6eVNpemVzQ29uZmlnUGFydGlhbCB9XG5cdFx0XHQgKi9cblx0XHRcdGNmZzogbGF6eVNpemVzQ2ZnLFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBAdHlwZSB7IHRydWUgfVxuXHRcdFx0ICovXG5cdFx0XHRub1N1cHBvcnQ6IHRydWUsXG5cdFx0fTtcblx0fVxuXG5cdHZhciBkb2NFbGVtID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG5cdHZhciBzdXBwb3J0UGljdHVyZSA9IHdpbmRvdy5IVE1MUGljdHVyZUVsZW1lbnQ7XG5cblx0dmFyIF9hZGRFdmVudExpc3RlbmVyID0gJ2FkZEV2ZW50TGlzdGVuZXInO1xuXG5cdHZhciBfZ2V0QXR0cmlidXRlID0gJ2dldEF0dHJpYnV0ZSc7XG5cblx0LyoqXG5cdCAqIFVwZGF0ZSB0byBiaW5kIHRvIHdpbmRvdyBiZWNhdXNlICd0aGlzJyBiZWNvbWVzIG51bGwgZHVyaW5nIFNTUlxuXHQgKiBidWlsZHMuXG5cdCAqL1xuXHR2YXIgYWRkRXZlbnRMaXN0ZW5lciA9IHdpbmRvd1tfYWRkRXZlbnRMaXN0ZW5lcl0uYmluZCh3aW5kb3cpO1xuXG5cdHZhciBzZXRUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQ7XG5cblx0dmFyIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgc2V0VGltZW91dDtcblxuXHR2YXIgcmVxdWVzdElkbGVDYWxsYmFjayA9IHdpbmRvdy5yZXF1ZXN0SWRsZUNhbGxiYWNrO1xuXG5cdHZhciByZWdQaWN0dXJlID0gL15waWN0dXJlJC9pO1xuXG5cdHZhciBsb2FkRXZlbnRzID0gWydsb2FkJywgJ2Vycm9yJywgJ2xhenlpbmNsdWRlZCcsICdfbGF6eWxvYWRlZCddO1xuXG5cdHZhciByZWdDbGFzc0NhY2hlID0ge307XG5cblx0dmFyIGZvckVhY2ggPSBBcnJheS5wcm90b3R5cGUuZm9yRWFjaDtcblxuXHQvKipcblx0ICogQHBhcmFtIGVsZSB7RWxlbWVudH1cblx0ICogQHBhcmFtIGNscyB7c3RyaW5nfVxuXHQgKi9cblx0dmFyIGhhc0NsYXNzID0gZnVuY3Rpb24oZWxlLCBjbHMpIHtcblx0XHRpZighcmVnQ2xhc3NDYWNoZVtjbHNdKXtcblx0XHRcdHJlZ0NsYXNzQ2FjaGVbY2xzXSA9IG5ldyBSZWdFeHAoJyhcXFxcc3xeKScrY2xzKycoXFxcXHN8JCknKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlZ0NsYXNzQ2FjaGVbY2xzXS50ZXN0KGVsZVtfZ2V0QXR0cmlidXRlXSgnY2xhc3MnKSB8fCAnJykgJiYgcmVnQ2xhc3NDYWNoZVtjbHNdO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBAcGFyYW0gZWxlIHtFbGVtZW50fVxuXHQgKiBAcGFyYW0gY2xzIHtzdHJpbmd9XG5cdCAqL1xuXHR2YXIgYWRkQ2xhc3MgPSBmdW5jdGlvbihlbGUsIGNscykge1xuXHRcdGlmICghaGFzQ2xhc3MoZWxlLCBjbHMpKXtcblx0XHRcdGVsZS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgKGVsZVtfZ2V0QXR0cmlidXRlXSgnY2xhc3MnKSB8fCAnJykudHJpbSgpICsgJyAnICsgY2xzKTtcblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBlbGUge0VsZW1lbnR9XG5cdCAqIEBwYXJhbSBjbHMge3N0cmluZ31cblx0ICovXG5cdHZhciByZW1vdmVDbGFzcyA9IGZ1bmN0aW9uKGVsZSwgY2xzKSB7XG5cdFx0dmFyIHJlZztcblx0XHRpZiAoKHJlZyA9IGhhc0NsYXNzKGVsZSxjbHMpKSkge1xuXHRcdFx0ZWxlLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAoZWxlW19nZXRBdHRyaWJ1dGVdKCdjbGFzcycpIHx8ICcnKS5yZXBsYWNlKHJlZywgJyAnKSk7XG5cdFx0fVxuXHR9O1xuXG5cdHZhciBhZGRSZW1vdmVMb2FkRXZlbnRzID0gZnVuY3Rpb24oZG9tLCBmbiwgYWRkKXtcblx0XHR2YXIgYWN0aW9uID0gYWRkID8gX2FkZEV2ZW50TGlzdGVuZXIgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG5cdFx0aWYoYWRkKXtcblx0XHRcdGFkZFJlbW92ZUxvYWRFdmVudHMoZG9tLCBmbik7XG5cdFx0fVxuXHRcdGxvYWRFdmVudHMuZm9yRWFjaChmdW5jdGlvbihldnQpe1xuXHRcdFx0ZG9tW2FjdGlvbl0oZXZ0LCBmbik7XG5cdFx0fSk7XG5cdH07XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBlbGVtIHsgRWxlbWVudCB9XG5cdCAqIEBwYXJhbSBuYW1lIHsgc3RyaW5nIH1cblx0ICogQHBhcmFtIGRldGFpbCB7IGFueSB9XG5cdCAqIEBwYXJhbSBub0J1YmJsZXMgeyBib29sZWFuIH1cblx0ICogQHBhcmFtIG5vQ2FuY2VsYWJsZSB7IGJvb2xlYW4gfVxuXHQgKiBAcmV0dXJucyB7IEN1c3RvbUV2ZW50IH1cblx0ICovXG5cdHZhciB0cmlnZ2VyRXZlbnQgPSBmdW5jdGlvbihlbGVtLCBuYW1lLCBkZXRhaWwsIG5vQnViYmxlcywgbm9DYW5jZWxhYmxlKXtcblx0XHR2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcblxuXHRcdGlmKCFkZXRhaWwpe1xuXHRcdFx0ZGV0YWlsID0ge307XG5cdFx0fVxuXG5cdFx0ZGV0YWlsLmluc3RhbmNlID0gbGF6eXNpemVzO1xuXG5cdFx0ZXZlbnQuaW5pdEV2ZW50KG5hbWUsICFub0J1YmJsZXMsICFub0NhbmNlbGFibGUpO1xuXG5cdFx0ZXZlbnQuZGV0YWlsID0gZGV0YWlsO1xuXG5cdFx0ZWxlbS5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcblx0XHRyZXR1cm4gZXZlbnQ7XG5cdH07XG5cblx0dmFyIHVwZGF0ZVBvbHlmaWxsID0gZnVuY3Rpb24gKGVsLCBmdWxsKXtcblx0XHR2YXIgcG9seWZpbGw7XG5cdFx0aWYoICFzdXBwb3J0UGljdHVyZSAmJiAoIHBvbHlmaWxsID0gKHdpbmRvdy5waWN0dXJlZmlsbCB8fCBsYXp5U2l6ZXNDZmcucGYpICkgKXtcblx0XHRcdGlmKGZ1bGwgJiYgZnVsbC5zcmMgJiYgIWVsW19nZXRBdHRyaWJ1dGVdKCdzcmNzZXQnKSl7XG5cdFx0XHRcdGVsLnNldEF0dHJpYnV0ZSgnc3Jjc2V0JywgZnVsbC5zcmMpO1xuXHRcdFx0fVxuXHRcdFx0cG9seWZpbGwoe3JlZXZhbHVhdGU6IHRydWUsIGVsZW1lbnRzOiBbZWxdfSk7XG5cdFx0fSBlbHNlIGlmKGZ1bGwgJiYgZnVsbC5zcmMpe1xuXHRcdFx0ZWwuc3JjID0gZnVsbC5zcmM7XG5cdFx0fVxuXHR9O1xuXG5cdHZhciBnZXRDU1MgPSBmdW5jdGlvbiAoZWxlbSwgc3R5bGUpe1xuXHRcdHJldHVybiAoZ2V0Q29tcHV0ZWRTdHlsZShlbGVtLCBudWxsKSB8fCB7fSlbc3R5bGVdO1xuXHR9O1xuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gZWxlbSB7IEVsZW1lbnQgfVxuXHQgKiBAcGFyYW0gcGFyZW50IHsgRWxlbWVudCB9XG5cdCAqIEBwYXJhbSBbd2lkdGhdIHtudW1iZXJ9XG5cdCAqIEByZXR1cm5zIHtudW1iZXJ9XG5cdCAqL1xuXHR2YXIgZ2V0V2lkdGggPSBmdW5jdGlvbihlbGVtLCBwYXJlbnQsIHdpZHRoKXtcblx0XHR3aWR0aCA9IHdpZHRoIHx8IGVsZW0ub2Zmc2V0V2lkdGg7XG5cblx0XHR3aGlsZSh3aWR0aCA8IGxhenlTaXplc0NmZy5taW5TaXplICYmIHBhcmVudCAmJiAhZWxlbS5fbGF6eXNpemVzV2lkdGgpe1xuXHRcdFx0d2lkdGggPSAgcGFyZW50Lm9mZnNldFdpZHRoO1xuXHRcdFx0cGFyZW50ID0gcGFyZW50LnBhcmVudE5vZGU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHdpZHRoO1xuXHR9O1xuXG5cdHZhciByQUYgPSAoZnVuY3Rpb24oKXtcblx0XHR2YXIgcnVubmluZywgd2FpdGluZztcblx0XHR2YXIgZmlyc3RGbnMgPSBbXTtcblx0XHR2YXIgc2Vjb25kRm5zID0gW107XG5cdFx0dmFyIGZucyA9IGZpcnN0Rm5zO1xuXG5cdFx0dmFyIHJ1biA9IGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgcnVuRm5zID0gZm5zO1xuXG5cdFx0XHRmbnMgPSBmaXJzdEZucy5sZW5ndGggPyBzZWNvbmRGbnMgOiBmaXJzdEZucztcblxuXHRcdFx0cnVubmluZyA9IHRydWU7XG5cdFx0XHR3YWl0aW5nID0gZmFsc2U7XG5cblx0XHRcdHdoaWxlKHJ1bkZucy5sZW5ndGgpe1xuXHRcdFx0XHRydW5GbnMuc2hpZnQoKSgpO1xuXHRcdFx0fVxuXG5cdFx0XHRydW5uaW5nID0gZmFsc2U7XG5cdFx0fTtcblxuXHRcdHZhciByYWZCYXRjaCA9IGZ1bmN0aW9uKGZuLCBxdWV1ZSl7XG5cdFx0XHRpZihydW5uaW5nICYmICFxdWV1ZSl7XG5cdFx0XHRcdGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmbnMucHVzaChmbik7XG5cblx0XHRcdFx0aWYoIXdhaXRpbmcpe1xuXHRcdFx0XHRcdHdhaXRpbmcgPSB0cnVlO1xuXHRcdFx0XHRcdChkb2N1bWVudC5oaWRkZW4gPyBzZXRUaW1lb3V0IDogcmVxdWVzdEFuaW1hdGlvbkZyYW1lKShydW4pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHJhZkJhdGNoLl9sc0ZsdXNoID0gcnVuO1xuXG5cdFx0cmV0dXJuIHJhZkJhdGNoO1xuXHR9KSgpO1xuXG5cdHZhciByQUZJdCA9IGZ1bmN0aW9uKGZuLCBzaW1wbGUpe1xuXHRcdHJldHVybiBzaW1wbGUgP1xuXHRcdFx0ZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJBRihmbik7XG5cdFx0XHR9IDpcblx0XHRcdGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHRcdFx0dmFyIGFyZ3MgPSBhcmd1bWVudHM7XG5cdFx0XHRcdHJBRihmdW5jdGlvbigpe1xuXHRcdFx0XHRcdGZuLmFwcGx5KHRoYXQsIGFyZ3MpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHQ7XG5cdH07XG5cblx0dmFyIHRocm90dGxlID0gZnVuY3Rpb24oZm4pe1xuXHRcdHZhciBydW5uaW5nO1xuXHRcdHZhciBsYXN0VGltZSA9IDA7XG5cdFx0dmFyIGdEZWxheSA9IGxhenlTaXplc0NmZy50aHJvdHRsZURlbGF5O1xuXHRcdHZhciBySUNUaW1lb3V0ID0gbGF6eVNpemVzQ2ZnLnJpY1RpbWVvdXQ7XG5cdFx0dmFyIHJ1biA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRydW5uaW5nID0gZmFsc2U7XG5cdFx0XHRsYXN0VGltZSA9IERhdGUubm93KCk7XG5cdFx0XHRmbigpO1xuXHRcdH07XG5cdFx0dmFyIGlkbGVDYWxsYmFjayA9IHJlcXVlc3RJZGxlQ2FsbGJhY2sgJiYgcklDVGltZW91dCA+IDQ5ID9cblx0XHRcdGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHJlcXVlc3RJZGxlQ2FsbGJhY2socnVuLCB7dGltZW91dDogcklDVGltZW91dH0pO1xuXG5cdFx0XHRcdGlmKHJJQ1RpbWVvdXQgIT09IGxhenlTaXplc0NmZy5yaWNUaW1lb3V0KXtcblx0XHRcdFx0XHRySUNUaW1lb3V0ID0gbGF6eVNpemVzQ2ZnLnJpY1RpbWVvdXQ7XG5cdFx0XHRcdH1cblx0XHRcdH0gOlxuXHRcdFx0ckFGSXQoZnVuY3Rpb24oKXtcblx0XHRcdFx0c2V0VGltZW91dChydW4pO1xuXHRcdFx0fSwgdHJ1ZSlcblx0XHQ7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24oaXNQcmlvcml0eSl7XG5cdFx0XHR2YXIgZGVsYXk7XG5cblx0XHRcdGlmKChpc1ByaW9yaXR5ID0gaXNQcmlvcml0eSA9PT0gdHJ1ZSkpe1xuXHRcdFx0XHRySUNUaW1lb3V0ID0gMzM7XG5cdFx0XHR9XG5cblx0XHRcdGlmKHJ1bm5pbmcpe1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHJ1bm5pbmcgPSAgdHJ1ZTtcblxuXHRcdFx0ZGVsYXkgPSBnRGVsYXkgLSAoRGF0ZS5ub3coKSAtIGxhc3RUaW1lKTtcblxuXHRcdFx0aWYoZGVsYXkgPCAwKXtcblx0XHRcdFx0ZGVsYXkgPSAwO1xuXHRcdFx0fVxuXG5cdFx0XHRpZihpc1ByaW9yaXR5IHx8IGRlbGF5IDwgOSl7XG5cdFx0XHRcdGlkbGVDYWxsYmFjaygpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2V0VGltZW91dChpZGxlQ2FsbGJhY2ssIGRlbGF5KTtcblx0XHRcdH1cblx0XHR9O1xuXHR9O1xuXG5cdC8vYmFzZWQgb24gaHR0cDovL21vZGVybmphdmFzY3JpcHQuYmxvZ3Nwb3QuZGUvMjAxMy8wOC9idWlsZGluZy1iZXR0ZXItZGVib3VuY2UuaHRtbFxuXHR2YXIgZGVib3VuY2UgPSBmdW5jdGlvbihmdW5jKSB7XG5cdFx0dmFyIHRpbWVvdXQsIHRpbWVzdGFtcDtcblx0XHR2YXIgd2FpdCA9IDk5O1xuXHRcdHZhciBydW4gPSBmdW5jdGlvbigpe1xuXHRcdFx0dGltZW91dCA9IG51bGw7XG5cdFx0XHRmdW5jKCk7XG5cdFx0fTtcblx0XHR2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBsYXN0ID0gRGF0ZS5ub3coKSAtIHRpbWVzdGFtcDtcblxuXHRcdFx0aWYgKGxhc3QgPCB3YWl0KSB7XG5cdFx0XHRcdHNldFRpbWVvdXQobGF0ZXIsIHdhaXQgLSBsYXN0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdChyZXF1ZXN0SWRsZUNhbGxiYWNrIHx8IHJ1bikocnVuKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGltZXN0YW1wID0gRGF0ZS5ub3coKTtcblxuXHRcdFx0aWYgKCF0aW1lb3V0KSB7XG5cdFx0XHRcdHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcblx0XHRcdH1cblx0XHR9O1xuXHR9O1xuXG5cdHZhciBsb2FkZXIgPSAoZnVuY3Rpb24oKXtcblx0XHR2YXIgcHJlbG9hZEVsZW1zLCBpc0NvbXBsZXRlZCwgcmVzZXRQcmVsb2FkaW5nVGltZXIsIGxvYWRNb2RlLCBzdGFydGVkO1xuXG5cdFx0dmFyIGVMdlcsIGVsdkgsIGVMdG9wLCBlTGxlZnQsIGVMcmlnaHQsIGVMYm90dG9tLCBpc0JvZHlIaWRkZW47XG5cblx0XHR2YXIgcmVnSW1nID0gL15pbWckL2k7XG5cdFx0dmFyIHJlZ0lmcmFtZSA9IC9eaWZyYW1lJC9pO1xuXG5cdFx0dmFyIHN1cHBvcnRTY3JvbGwgPSAoJ29uc2Nyb2xsJyBpbiB3aW5kb3cpICYmICEoLyhnbGV8aW5nKWJvdC8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSk7XG5cblx0XHR2YXIgc2hyaW5rRXhwYW5kID0gMDtcblx0XHR2YXIgY3VycmVudEV4cGFuZCA9IDA7XG5cblx0XHR2YXIgaXNMb2FkaW5nID0gMDtcblx0XHR2YXIgbG93UnVucyA9IC0xO1xuXG5cdFx0dmFyIHJlc2V0UHJlbG9hZGluZyA9IGZ1bmN0aW9uKGUpe1xuXHRcdFx0aXNMb2FkaW5nLS07XG5cdFx0XHRpZighZSB8fCBpc0xvYWRpbmcgPCAwIHx8ICFlLnRhcmdldCl7XG5cdFx0XHRcdGlzTG9hZGluZyA9IDA7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciBpc1Zpc2libGUgPSBmdW5jdGlvbiAoZWxlbSkge1xuXHRcdFx0aWYgKGlzQm9keUhpZGRlbiA9PSBudWxsKSB7XG5cdFx0XHRcdGlzQm9keUhpZGRlbiA9IGdldENTUyhkb2N1bWVudC5ib2R5LCAndmlzaWJpbGl0eScpID09ICdoaWRkZW4nO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gaXNCb2R5SGlkZGVuIHx8ICEoZ2V0Q1NTKGVsZW0ucGFyZW50Tm9kZSwgJ3Zpc2liaWxpdHknKSA9PSAnaGlkZGVuJyAmJiBnZXRDU1MoZWxlbSwgJ3Zpc2liaWxpdHknKSA9PSAnaGlkZGVuJyk7XG5cdFx0fTtcblxuXHRcdHZhciBpc05lc3RlZFZpc2libGUgPSBmdW5jdGlvbihlbGVtLCBlbGVtRXhwYW5kKXtcblx0XHRcdHZhciBvdXRlclJlY3Q7XG5cdFx0XHR2YXIgcGFyZW50ID0gZWxlbTtcblx0XHRcdHZhciB2aXNpYmxlID0gaXNWaXNpYmxlKGVsZW0pO1xuXG5cdFx0XHRlTHRvcCAtPSBlbGVtRXhwYW5kO1xuXHRcdFx0ZUxib3R0b20gKz0gZWxlbUV4cGFuZDtcblx0XHRcdGVMbGVmdCAtPSBlbGVtRXhwYW5kO1xuXHRcdFx0ZUxyaWdodCArPSBlbGVtRXhwYW5kO1xuXG5cdFx0XHR3aGlsZSh2aXNpYmxlICYmIChwYXJlbnQgPSBwYXJlbnQub2Zmc2V0UGFyZW50KSAmJiBwYXJlbnQgIT0gZG9jdW1lbnQuYm9keSAmJiBwYXJlbnQgIT0gZG9jRWxlbSl7XG5cdFx0XHRcdHZpc2libGUgPSAoKGdldENTUyhwYXJlbnQsICdvcGFjaXR5JykgfHwgMSkgPiAwKTtcblxuXHRcdFx0XHRpZih2aXNpYmxlICYmIGdldENTUyhwYXJlbnQsICdvdmVyZmxvdycpICE9ICd2aXNpYmxlJyl7XG5cdFx0XHRcdFx0b3V0ZXJSZWN0ID0gcGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0XHRcdHZpc2libGUgPSBlTHJpZ2h0ID4gb3V0ZXJSZWN0LmxlZnQgJiZcblx0XHRcdFx0XHRcdGVMbGVmdCA8IG91dGVyUmVjdC5yaWdodCAmJlxuXHRcdFx0XHRcdFx0ZUxib3R0b20gPiBvdXRlclJlY3QudG9wIC0gMSAmJlxuXHRcdFx0XHRcdFx0ZUx0b3AgPCBvdXRlclJlY3QuYm90dG9tICsgMVxuXHRcdFx0XHRcdDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdmlzaWJsZTtcblx0XHR9O1xuXG5cdFx0dmFyIGNoZWNrRWxlbWVudHMgPSBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBlTGxlbiwgaSwgcmVjdCwgYXV0b0xvYWRFbGVtLCBsb2FkZWRTb21ldGhpbmcsIGVsZW1FeHBhbmQsIGVsZW1OZWdhdGl2ZUV4cGFuZCwgZWxlbUV4cGFuZFZhbCxcblx0XHRcdFx0YmVmb3JlRXhwYW5kVmFsLCBkZWZhdWx0RXhwYW5kLCBwcmVsb2FkRXhwYW5kLCBoRmFjO1xuXHRcdFx0dmFyIGxhenlsb2FkRWxlbXMgPSBsYXp5c2l6ZXMuZWxlbWVudHM7XG5cblx0XHRcdGlmKChsb2FkTW9kZSA9IGxhenlTaXplc0NmZy5sb2FkTW9kZSkgJiYgaXNMb2FkaW5nIDwgOCAmJiAoZUxsZW4gPSBsYXp5bG9hZEVsZW1zLmxlbmd0aCkpe1xuXG5cdFx0XHRcdGkgPSAwO1xuXG5cdFx0XHRcdGxvd1J1bnMrKztcblxuXHRcdFx0XHRmb3IoOyBpIDwgZUxsZW47IGkrKyl7XG5cblx0XHRcdFx0XHRpZighbGF6eWxvYWRFbGVtc1tpXSB8fCBsYXp5bG9hZEVsZW1zW2ldLl9sYXp5UmFjZSl7Y29udGludWU7fVxuXG5cdFx0XHRcdFx0aWYoIXN1cHBvcnRTY3JvbGwgfHwgKGxhenlzaXplcy5wcmVtYXR1cmVVbnZlaWwgJiYgbGF6eXNpemVzLnByZW1hdHVyZVVudmVpbChsYXp5bG9hZEVsZW1zW2ldKSkpe3VudmVpbEVsZW1lbnQobGF6eWxvYWRFbGVtc1tpXSk7Y29udGludWU7fVxuXG5cdFx0XHRcdFx0aWYoIShlbGVtRXhwYW5kVmFsID0gbGF6eWxvYWRFbGVtc1tpXVtfZ2V0QXR0cmlidXRlXSgnZGF0YS1leHBhbmQnKSkgfHwgIShlbGVtRXhwYW5kID0gZWxlbUV4cGFuZFZhbCAqIDEpKXtcblx0XHRcdFx0XHRcdGVsZW1FeHBhbmQgPSBjdXJyZW50RXhwYW5kO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICghZGVmYXVsdEV4cGFuZCkge1xuXHRcdFx0XHRcdFx0ZGVmYXVsdEV4cGFuZCA9ICghbGF6eVNpemVzQ2ZnLmV4cGFuZCB8fCBsYXp5U2l6ZXNDZmcuZXhwYW5kIDwgMSkgP1xuXHRcdFx0XHRcdFx0XHRkb2NFbGVtLmNsaWVudEhlaWdodCA+IDUwMCAmJiBkb2NFbGVtLmNsaWVudFdpZHRoID4gNTAwID8gNTAwIDogMzcwIDpcblx0XHRcdFx0XHRcdFx0bGF6eVNpemVzQ2ZnLmV4cGFuZDtcblxuXHRcdFx0XHRcdFx0bGF6eXNpemVzLl9kZWZFeCA9IGRlZmF1bHRFeHBhbmQ7XG5cblx0XHRcdFx0XHRcdHByZWxvYWRFeHBhbmQgPSBkZWZhdWx0RXhwYW5kICogbGF6eVNpemVzQ2ZnLmV4cEZhY3Rvcjtcblx0XHRcdFx0XHRcdGhGYWMgPSBsYXp5U2l6ZXNDZmcuaEZhYztcblx0XHRcdFx0XHRcdGlzQm9keUhpZGRlbiA9IG51bGw7XG5cblx0XHRcdFx0XHRcdGlmKGN1cnJlbnRFeHBhbmQgPCBwcmVsb2FkRXhwYW5kICYmIGlzTG9hZGluZyA8IDEgJiYgbG93UnVucyA+IDIgJiYgbG9hZE1vZGUgPiAyICYmICFkb2N1bWVudC5oaWRkZW4pe1xuXHRcdFx0XHRcdFx0XHRjdXJyZW50RXhwYW5kID0gcHJlbG9hZEV4cGFuZDtcblx0XHRcdFx0XHRcdFx0bG93UnVucyA9IDA7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYobG9hZE1vZGUgPiAxICYmIGxvd1J1bnMgPiAxICYmIGlzTG9hZGluZyA8IDYpe1xuXHRcdFx0XHRcdFx0XHRjdXJyZW50RXhwYW5kID0gZGVmYXVsdEV4cGFuZDtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRFeHBhbmQgPSBzaHJpbmtFeHBhbmQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYoYmVmb3JlRXhwYW5kVmFsICE9PSBlbGVtRXhwYW5kKXtcblx0XHRcdFx0XHRcdGVMdlcgPSBpbm5lcldpZHRoICsgKGVsZW1FeHBhbmQgKiBoRmFjKTtcblx0XHRcdFx0XHRcdGVsdkggPSBpbm5lckhlaWdodCArIGVsZW1FeHBhbmQ7XG5cdFx0XHRcdFx0XHRlbGVtTmVnYXRpdmVFeHBhbmQgPSBlbGVtRXhwYW5kICogLTE7XG5cdFx0XHRcdFx0XHRiZWZvcmVFeHBhbmRWYWwgPSBlbGVtRXhwYW5kO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJlY3QgPSBsYXp5bG9hZEVsZW1zW2ldLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG5cdFx0XHRcdFx0aWYgKChlTGJvdHRvbSA9IHJlY3QuYm90dG9tKSA+PSBlbGVtTmVnYXRpdmVFeHBhbmQgJiZcblx0XHRcdFx0XHRcdChlTHRvcCA9IHJlY3QudG9wKSA8PSBlbHZIICYmXG5cdFx0XHRcdFx0XHQoZUxyaWdodCA9IHJlY3QucmlnaHQpID49IGVsZW1OZWdhdGl2ZUV4cGFuZCAqIGhGYWMgJiZcblx0XHRcdFx0XHRcdChlTGxlZnQgPSByZWN0LmxlZnQpIDw9IGVMdlcgJiZcblx0XHRcdFx0XHRcdChlTGJvdHRvbSB8fCBlTHJpZ2h0IHx8IGVMbGVmdCB8fCBlTHRvcCkgJiZcblx0XHRcdFx0XHRcdChsYXp5U2l6ZXNDZmcubG9hZEhpZGRlbiB8fCBpc1Zpc2libGUobGF6eWxvYWRFbGVtc1tpXSkpICYmXG5cdFx0XHRcdFx0XHQoKGlzQ29tcGxldGVkICYmIGlzTG9hZGluZyA8IDMgJiYgIWVsZW1FeHBhbmRWYWwgJiYgKGxvYWRNb2RlIDwgMyB8fCBsb3dSdW5zIDwgNCkpIHx8IGlzTmVzdGVkVmlzaWJsZShsYXp5bG9hZEVsZW1zW2ldLCBlbGVtRXhwYW5kKSkpe1xuXHRcdFx0XHRcdFx0dW52ZWlsRWxlbWVudChsYXp5bG9hZEVsZW1zW2ldKTtcblx0XHRcdFx0XHRcdGxvYWRlZFNvbWV0aGluZyA9IHRydWU7XG5cdFx0XHRcdFx0XHRpZihpc0xvYWRpbmcgPiA5KXticmVhazt9XG5cdFx0XHRcdFx0fSBlbHNlIGlmKCFsb2FkZWRTb21ldGhpbmcgJiYgaXNDb21wbGV0ZWQgJiYgIWF1dG9Mb2FkRWxlbSAmJlxuXHRcdFx0XHRcdFx0aXNMb2FkaW5nIDwgNCAmJiBsb3dSdW5zIDwgNCAmJiBsb2FkTW9kZSA+IDIgJiZcblx0XHRcdFx0XHRcdChwcmVsb2FkRWxlbXNbMF0gfHwgbGF6eVNpemVzQ2ZnLnByZWxvYWRBZnRlckxvYWQpICYmXG5cdFx0XHRcdFx0XHQocHJlbG9hZEVsZW1zWzBdIHx8ICghZWxlbUV4cGFuZFZhbCAmJiAoKGVMYm90dG9tIHx8IGVMcmlnaHQgfHwgZUxsZWZ0IHx8IGVMdG9wKSB8fCBsYXp5bG9hZEVsZW1zW2ldW19nZXRBdHRyaWJ1dGVdKGxhenlTaXplc0NmZy5zaXplc0F0dHIpICE9ICdhdXRvJykpKSl7XG5cdFx0XHRcdFx0XHRhdXRvTG9hZEVsZW0gPSBwcmVsb2FkRWxlbXNbMF0gfHwgbGF6eWxvYWRFbGVtc1tpXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihhdXRvTG9hZEVsZW0gJiYgIWxvYWRlZFNvbWV0aGluZyl7XG5cdFx0XHRcdFx0dW52ZWlsRWxlbWVudChhdXRvTG9hZEVsZW0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciB0aHJvdHRsZWRDaGVja0VsZW1lbnRzID0gdGhyb3R0bGUoY2hlY2tFbGVtZW50cyk7XG5cblx0XHR2YXIgc3dpdGNoTG9hZGluZ0NsYXNzID0gZnVuY3Rpb24oZSl7XG5cdFx0XHR2YXIgZWxlbSA9IGUudGFyZ2V0O1xuXG5cdFx0XHRpZiAoZWxlbS5fbGF6eUNhY2hlKSB7XG5cdFx0XHRcdGRlbGV0ZSBlbGVtLl9sYXp5Q2FjaGU7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0cmVzZXRQcmVsb2FkaW5nKGUpO1xuXHRcdFx0YWRkQ2xhc3MoZWxlbSwgbGF6eVNpemVzQ2ZnLmxvYWRlZENsYXNzKTtcblx0XHRcdHJlbW92ZUNsYXNzKGVsZW0sIGxhenlTaXplc0NmZy5sb2FkaW5nQ2xhc3MpO1xuXHRcdFx0YWRkUmVtb3ZlTG9hZEV2ZW50cyhlbGVtLCByYWZTd2l0Y2hMb2FkaW5nQ2xhc3MpO1xuXHRcdFx0dHJpZ2dlckV2ZW50KGVsZW0sICdsYXp5bG9hZGVkJyk7XG5cdFx0fTtcblx0XHR2YXIgcmFmZWRTd2l0Y2hMb2FkaW5nQ2xhc3MgPSByQUZJdChzd2l0Y2hMb2FkaW5nQ2xhc3MpO1xuXHRcdHZhciByYWZTd2l0Y2hMb2FkaW5nQ2xhc3MgPSBmdW5jdGlvbihlKXtcblx0XHRcdHJhZmVkU3dpdGNoTG9hZGluZ0NsYXNzKHt0YXJnZXQ6IGUudGFyZ2V0fSk7XG5cdFx0fTtcblxuXHRcdHZhciBjaGFuZ2VJZnJhbWVTcmMgPSBmdW5jdGlvbihlbGVtLCBzcmMpe1xuXHRcdFx0dmFyIGxvYWRNb2RlID0gZWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbG9hZC1tb2RlJykgfHwgbGF6eVNpemVzQ2ZnLmlmcmFtZUxvYWRNb2RlO1xuXG5cdFx0XHQvLyBsb2FkTW9kZSBjYW4gYmUgYWxzbyBhIHN0cmluZyFcblx0XHRcdGlmIChsb2FkTW9kZSA9PSAwKSB7XG5cdFx0XHRcdGVsZW0uY29udGVudFdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKHNyYyk7XG5cdFx0XHR9IGVsc2UgaWYgKGxvYWRNb2RlID09IDEpIHtcblx0XHRcdFx0ZWxlbS5zcmMgPSBzcmM7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciBoYW5kbGVTb3VyY2VzID0gZnVuY3Rpb24oc291cmNlKXtcblx0XHRcdHZhciBjdXN0b21NZWRpYTtcblxuXHRcdFx0dmFyIHNvdXJjZVNyY3NldCA9IHNvdXJjZVtfZ2V0QXR0cmlidXRlXShsYXp5U2l6ZXNDZmcuc3Jjc2V0QXR0cik7XG5cblx0XHRcdGlmKCAoY3VzdG9tTWVkaWEgPSBsYXp5U2l6ZXNDZmcuY3VzdG9tTWVkaWFbc291cmNlW19nZXRBdHRyaWJ1dGVdKCdkYXRhLW1lZGlhJykgfHwgc291cmNlW19nZXRBdHRyaWJ1dGVdKCdtZWRpYScpXSkgKXtcblx0XHRcdFx0c291cmNlLnNldEF0dHJpYnV0ZSgnbWVkaWEnLCBjdXN0b21NZWRpYSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmKHNvdXJjZVNyY3NldCl7XG5cdFx0XHRcdHNvdXJjZS5zZXRBdHRyaWJ1dGUoJ3NyY3NldCcsIHNvdXJjZVNyY3NldCk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciBsYXp5VW52ZWlsID0gckFGSXQoZnVuY3Rpb24gKGVsZW0sIGRldGFpbCwgaXNBdXRvLCBzaXplcywgaXNJbWcpe1xuXHRcdFx0dmFyIHNyYywgc3Jjc2V0LCBwYXJlbnQsIGlzUGljdHVyZSwgZXZlbnQsIGZpcmVzTG9hZDtcblxuXHRcdFx0aWYoIShldmVudCA9IHRyaWdnZXJFdmVudChlbGVtLCAnbGF6eWJlZm9yZXVudmVpbCcsIGRldGFpbCkpLmRlZmF1bHRQcmV2ZW50ZWQpe1xuXG5cdFx0XHRcdGlmKHNpemVzKXtcblx0XHRcdFx0XHRpZihpc0F1dG8pe1xuXHRcdFx0XHRcdFx0YWRkQ2xhc3MoZWxlbSwgbGF6eVNpemVzQ2ZnLmF1dG9zaXplc0NsYXNzKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZWxlbS5zZXRBdHRyaWJ1dGUoJ3NpemVzJywgc2l6ZXMpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHNyY3NldCA9IGVsZW1bX2dldEF0dHJpYnV0ZV0obGF6eVNpemVzQ2ZnLnNyY3NldEF0dHIpO1xuXHRcdFx0XHRzcmMgPSBlbGVtW19nZXRBdHRyaWJ1dGVdKGxhenlTaXplc0NmZy5zcmNBdHRyKTtcblxuXHRcdFx0XHRpZihpc0ltZykge1xuXHRcdFx0XHRcdHBhcmVudCA9IGVsZW0ucGFyZW50Tm9kZTtcblx0XHRcdFx0XHRpc1BpY3R1cmUgPSBwYXJlbnQgJiYgcmVnUGljdHVyZS50ZXN0KHBhcmVudC5ub2RlTmFtZSB8fCAnJyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmaXJlc0xvYWQgPSBkZXRhaWwuZmlyZXNMb2FkIHx8ICgoJ3NyYycgaW4gZWxlbSkgJiYgKHNyY3NldCB8fCBzcmMgfHwgaXNQaWN0dXJlKSk7XG5cblx0XHRcdFx0ZXZlbnQgPSB7dGFyZ2V0OiBlbGVtfTtcblxuXHRcdFx0XHRhZGRDbGFzcyhlbGVtLCBsYXp5U2l6ZXNDZmcubG9hZGluZ0NsYXNzKTtcblxuXHRcdFx0XHRpZihmaXJlc0xvYWQpe1xuXHRcdFx0XHRcdGNsZWFyVGltZW91dChyZXNldFByZWxvYWRpbmdUaW1lcik7XG5cdFx0XHRcdFx0cmVzZXRQcmVsb2FkaW5nVGltZXIgPSBzZXRUaW1lb3V0KHJlc2V0UHJlbG9hZGluZywgMjUwMCk7XG5cdFx0XHRcdFx0YWRkUmVtb3ZlTG9hZEV2ZW50cyhlbGVtLCByYWZTd2l0Y2hMb2FkaW5nQ2xhc3MsIHRydWUpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoaXNQaWN0dXJlKXtcblx0XHRcdFx0XHRmb3JFYWNoLmNhbGwocGFyZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzb3VyY2UnKSwgaGFuZGxlU291cmNlcyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihzcmNzZXQpe1xuXHRcdFx0XHRcdGVsZW0uc2V0QXR0cmlidXRlKCdzcmNzZXQnLCBzcmNzZXQpO1xuXHRcdFx0XHR9IGVsc2UgaWYoc3JjICYmICFpc1BpY3R1cmUpe1xuXHRcdFx0XHRcdGlmKHJlZ0lmcmFtZS50ZXN0KGVsZW0ubm9kZU5hbWUpKXtcblx0XHRcdFx0XHRcdGNoYW5nZUlmcmFtZVNyYyhlbGVtLCBzcmMpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRlbGVtLnNyYyA9IHNyYztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihpc0ltZyAmJiAoc3Jjc2V0IHx8IGlzUGljdHVyZSkpe1xuXHRcdFx0XHRcdHVwZGF0ZVBvbHlmaWxsKGVsZW0sIHtzcmM6IHNyY30pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmKGVsZW0uX2xhenlSYWNlKXtcblx0XHRcdFx0ZGVsZXRlIGVsZW0uX2xhenlSYWNlO1xuXHRcdFx0fVxuXHRcdFx0cmVtb3ZlQ2xhc3MoZWxlbSwgbGF6eVNpemVzQ2ZnLmxhenlDbGFzcyk7XG5cblx0XHRcdHJBRihmdW5jdGlvbigpe1xuXHRcdFx0XHQvLyBQYXJ0IG9mIHRoaXMgY2FuIGJlIHJlbW92ZWQgYXMgc29vbiBhcyB0aGlzIGZpeCBpcyBvbGRlcjogaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9NzczMSAoMjAxNSlcblx0XHRcdFx0dmFyIGlzTG9hZGVkID0gZWxlbS5jb21wbGV0ZSAmJiBlbGVtLm5hdHVyYWxXaWR0aCA+IDE7XG5cblx0XHRcdFx0aWYoICFmaXJlc0xvYWQgfHwgaXNMb2FkZWQpe1xuXHRcdFx0XHRcdGlmIChpc0xvYWRlZCkge1xuXHRcdFx0XHRcdFx0YWRkQ2xhc3MoZWxlbSwgbGF6eVNpemVzQ2ZnLmZhc3RMb2FkZWRDbGFzcyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHN3aXRjaExvYWRpbmdDbGFzcyhldmVudCk7XG5cdFx0XHRcdFx0ZWxlbS5fbGF6eUNhY2hlID0gdHJ1ZTtcblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0XHRpZiAoJ19sYXp5Q2FjaGUnIGluIGVsZW0pIHtcblx0XHRcdFx0XHRcdFx0ZGVsZXRlIGVsZW0uX2xhenlDYWNoZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LCA5KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoZWxlbS5sb2FkaW5nID09ICdsYXp5Jykge1xuXHRcdFx0XHRcdGlzTG9hZGluZy0tO1xuXHRcdFx0XHR9XG5cdFx0XHR9LCB0cnVlKTtcblx0XHR9KTtcblxuXHRcdC8qKlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGVsZW0geyBFbGVtZW50IH1cblx0XHQgKi9cblx0XHR2YXIgdW52ZWlsRWxlbWVudCA9IGZ1bmN0aW9uIChlbGVtKXtcblx0XHRcdGlmIChlbGVtLl9sYXp5UmFjZSkge3JldHVybjt9XG5cdFx0XHR2YXIgZGV0YWlsO1xuXG5cdFx0XHR2YXIgaXNJbWcgPSByZWdJbWcudGVzdChlbGVtLm5vZGVOYW1lKTtcblxuXHRcdFx0Ly9hbGxvdyB1c2luZyBzaXplcz1cImF1dG9cIiwgYnV0IGRvbid0IHVzZS4gaXQncyBpbnZhbGlkLiBVc2UgZGF0YS1zaXplcz1cImF1dG9cIiBvciBhIHZhbGlkIHZhbHVlIGZvciBzaXplcyBpbnN0ZWFkIChpLmUuOiBzaXplcz1cIjgwdndcIilcblx0XHRcdHZhciBzaXplcyA9IGlzSW1nICYmIChlbGVtW19nZXRBdHRyaWJ1dGVdKGxhenlTaXplc0NmZy5zaXplc0F0dHIpIHx8IGVsZW1bX2dldEF0dHJpYnV0ZV0oJ3NpemVzJykpO1xuXHRcdFx0dmFyIGlzQXV0byA9IHNpemVzID09ICdhdXRvJztcblxuXHRcdFx0aWYoIChpc0F1dG8gfHwgIWlzQ29tcGxldGVkKSAmJiBpc0ltZyAmJiAoZWxlbVtfZ2V0QXR0cmlidXRlXSgnc3JjJykgfHwgZWxlbS5zcmNzZXQpICYmICFlbGVtLmNvbXBsZXRlICYmICFoYXNDbGFzcyhlbGVtLCBsYXp5U2l6ZXNDZmcuZXJyb3JDbGFzcykgJiYgaGFzQ2xhc3MoZWxlbSwgbGF6eVNpemVzQ2ZnLmxhenlDbGFzcykpe3JldHVybjt9XG5cblx0XHRcdGRldGFpbCA9IHRyaWdnZXJFdmVudChlbGVtLCAnbGF6eXVudmVpbHJlYWQnKS5kZXRhaWw7XG5cblx0XHRcdGlmKGlzQXV0byl7XG5cdFx0XHRcdCBhdXRvU2l6ZXIudXBkYXRlRWxlbShlbGVtLCB0cnVlLCBlbGVtLm9mZnNldFdpZHRoKTtcblx0XHRcdH1cblxuXHRcdFx0ZWxlbS5fbGF6eVJhY2UgPSB0cnVlO1xuXHRcdFx0aXNMb2FkaW5nKys7XG5cblx0XHRcdGxhenlVbnZlaWwoZWxlbSwgZGV0YWlsLCBpc0F1dG8sIHNpemVzLCBpc0ltZyk7XG5cdFx0fTtcblxuXHRcdHZhciBhZnRlclNjcm9sbCA9IGRlYm91bmNlKGZ1bmN0aW9uKCl7XG5cdFx0XHRsYXp5U2l6ZXNDZmcubG9hZE1vZGUgPSAzO1xuXHRcdFx0dGhyb3R0bGVkQ2hlY2tFbGVtZW50cygpO1xuXHRcdH0pO1xuXG5cdFx0dmFyIGFsdExvYWRtb2RlU2Nyb2xsTGlzdG5lciA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRpZihsYXp5U2l6ZXNDZmcubG9hZE1vZGUgPT0gMyl7XG5cdFx0XHRcdGxhenlTaXplc0NmZy5sb2FkTW9kZSA9IDI7XG5cdFx0XHR9XG5cdFx0XHRhZnRlclNjcm9sbCgpO1xuXHRcdH07XG5cblx0XHR2YXIgb25sb2FkID0gZnVuY3Rpb24oKXtcblx0XHRcdGlmKGlzQ29tcGxldGVkKXtyZXR1cm47fVxuXHRcdFx0aWYoRGF0ZS5ub3coKSAtIHN0YXJ0ZWQgPCA5OTkpe1xuXHRcdFx0XHRzZXRUaW1lb3V0KG9ubG9hZCwgOTk5KTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cblx0XHRcdGlzQ29tcGxldGVkID0gdHJ1ZTtcblxuXHRcdFx0bGF6eVNpemVzQ2ZnLmxvYWRNb2RlID0gMztcblxuXHRcdFx0dGhyb3R0bGVkQ2hlY2tFbGVtZW50cygpO1xuXG5cdFx0XHRhZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBhbHRMb2FkbW9kZVNjcm9sbExpc3RuZXIsIHRydWUpO1xuXHRcdH07XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0XzogZnVuY3Rpb24oKXtcblx0XHRcdFx0c3RhcnRlZCA9IERhdGUubm93KCk7XG5cblx0XHRcdFx0bGF6eXNpemVzLmVsZW1lbnRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShsYXp5U2l6ZXNDZmcubGF6eUNsYXNzKTtcblx0XHRcdFx0cHJlbG9hZEVsZW1zID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShsYXp5U2l6ZXNDZmcubGF6eUNsYXNzICsgJyAnICsgbGF6eVNpemVzQ2ZnLnByZWxvYWRDbGFzcyk7XG5cblx0XHRcdFx0YWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhyb3R0bGVkQ2hlY2tFbGVtZW50cywgdHJ1ZSk7XG5cblx0XHRcdFx0YWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhyb3R0bGVkQ2hlY2tFbGVtZW50cywgdHJ1ZSk7XG5cblx0XHRcdFx0YWRkRXZlbnRMaXN0ZW5lcigncGFnZXNob3cnLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRcdGlmIChlLnBlcnNpc3RlZCkge1xuXHRcdFx0XHRcdFx0dmFyIGxvYWRpbmdFbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy4nICsgbGF6eVNpemVzQ2ZnLmxvYWRpbmdDbGFzcyk7XG5cblx0XHRcdFx0XHRcdGlmIChsb2FkaW5nRWxlbWVudHMubGVuZ3RoICYmIGxvYWRpbmdFbGVtZW50cy5mb3JFYWNoKSB7XG5cdFx0XHRcdFx0XHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0bG9hZGluZ0VsZW1lbnRzLmZvckVhY2goIGZ1bmN0aW9uIChpbWcpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChpbWcuY29tcGxldGUpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dW52ZWlsRWxlbWVudChpbWcpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGlmKHdpbmRvdy5NdXRhdGlvbk9ic2VydmVyKXtcblx0XHRcdFx0XHRuZXcgTXV0YXRpb25PYnNlcnZlciggdGhyb3R0bGVkQ2hlY2tFbGVtZW50cyApLm9ic2VydmUoIGRvY0VsZW0sIHtjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWUsIGF0dHJpYnV0ZXM6IHRydWV9ICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZG9jRWxlbVtfYWRkRXZlbnRMaXN0ZW5lcl0oJ0RPTU5vZGVJbnNlcnRlZCcsIHRocm90dGxlZENoZWNrRWxlbWVudHMsIHRydWUpO1xuXHRcdFx0XHRcdGRvY0VsZW1bX2FkZEV2ZW50TGlzdGVuZXJdKCdET01BdHRyTW9kaWZpZWQnLCB0aHJvdHRsZWRDaGVja0VsZW1lbnRzLCB0cnVlKTtcblx0XHRcdFx0XHRzZXRJbnRlcnZhbCh0aHJvdHRsZWRDaGVja0VsZW1lbnRzLCA5OTkpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIHRocm90dGxlZENoZWNrRWxlbWVudHMsIHRydWUpO1xuXG5cdFx0XHRcdC8vLCAnZnVsbHNjcmVlbmNoYW5nZSdcblx0XHRcdFx0Wydmb2N1cycsICdtb3VzZW92ZXInLCAnY2xpY2snLCAnbG9hZCcsICd0cmFuc2l0aW9uZW5kJywgJ2FuaW1hdGlvbmVuZCddLmZvckVhY2goZnVuY3Rpb24obmFtZSl7XG5cdFx0XHRcdFx0ZG9jdW1lbnRbX2FkZEV2ZW50TGlzdGVuZXJdKG5hbWUsIHRocm90dGxlZENoZWNrRWxlbWVudHMsIHRydWUpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRpZigoL2QkfF5jLy50ZXN0KGRvY3VtZW50LnJlYWR5U3RhdGUpKSl7XG5cdFx0XHRcdFx0b25sb2FkKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9ubG9hZCk7XG5cdFx0XHRcdFx0ZG9jdW1lbnRbX2FkZEV2ZW50TGlzdGVuZXJdKCdET01Db250ZW50TG9hZGVkJywgdGhyb3R0bGVkQ2hlY2tFbGVtZW50cyk7XG5cdFx0XHRcdFx0c2V0VGltZW91dChvbmxvYWQsIDIwMDAwKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKGxhenlzaXplcy5lbGVtZW50cy5sZW5ndGgpe1xuXHRcdFx0XHRcdGNoZWNrRWxlbWVudHMoKTtcblx0XHRcdFx0XHRyQUYuX2xzRmx1c2goKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aHJvdHRsZWRDaGVja0VsZW1lbnRzKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRjaGVja0VsZW1zOiB0aHJvdHRsZWRDaGVja0VsZW1lbnRzLFxuXHRcdFx0dW52ZWlsOiB1bnZlaWxFbGVtZW50LFxuXHRcdFx0X2FMU0w6IGFsdExvYWRtb2RlU2Nyb2xsTGlzdG5lcixcblx0XHR9O1xuXHR9KSgpO1xuXG5cblx0dmFyIGF1dG9TaXplciA9IChmdW5jdGlvbigpe1xuXHRcdHZhciBhdXRvc2l6ZXNFbGVtcztcblxuXHRcdHZhciBzaXplRWxlbWVudCA9IHJBRkl0KGZ1bmN0aW9uKGVsZW0sIHBhcmVudCwgZXZlbnQsIHdpZHRoKXtcblx0XHRcdHZhciBzb3VyY2VzLCBpLCBsZW47XG5cdFx0XHRlbGVtLl9sYXp5c2l6ZXNXaWR0aCA9IHdpZHRoO1xuXHRcdFx0d2lkdGggKz0gJ3B4JztcblxuXHRcdFx0ZWxlbS5zZXRBdHRyaWJ1dGUoJ3NpemVzJywgd2lkdGgpO1xuXG5cdFx0XHRpZihyZWdQaWN0dXJlLnRlc3QocGFyZW50Lm5vZGVOYW1lIHx8ICcnKSl7XG5cdFx0XHRcdHNvdXJjZXMgPSBwYXJlbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NvdXJjZScpO1xuXHRcdFx0XHRmb3IoaSA9IDAsIGxlbiA9IHNvdXJjZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xuXHRcdFx0XHRcdHNvdXJjZXNbaV0uc2V0QXR0cmlidXRlKCdzaXplcycsIHdpZHRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZighZXZlbnQuZGV0YWlsLmRhdGFBdHRyKXtcblx0XHRcdFx0dXBkYXRlUG9seWZpbGwoZWxlbSwgZXZlbnQuZGV0YWlsKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHQvKipcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlbGVtIHtFbGVtZW50fVxuXHRcdCAqIEBwYXJhbSBkYXRhQXR0clxuXHRcdCAqIEBwYXJhbSBbd2lkdGhdIHsgbnVtYmVyIH1cblx0XHQgKi9cblx0XHR2YXIgZ2V0U2l6ZUVsZW1lbnQgPSBmdW5jdGlvbiAoZWxlbSwgZGF0YUF0dHIsIHdpZHRoKXtcblx0XHRcdHZhciBldmVudDtcblx0XHRcdHZhciBwYXJlbnQgPSBlbGVtLnBhcmVudE5vZGU7XG5cblx0XHRcdGlmKHBhcmVudCl7XG5cdFx0XHRcdHdpZHRoID0gZ2V0V2lkdGgoZWxlbSwgcGFyZW50LCB3aWR0aCk7XG5cdFx0XHRcdGV2ZW50ID0gdHJpZ2dlckV2ZW50KGVsZW0sICdsYXp5YmVmb3Jlc2l6ZXMnLCB7d2lkdGg6IHdpZHRoLCBkYXRhQXR0cjogISFkYXRhQXR0cn0pO1xuXG5cdFx0XHRcdGlmKCFldmVudC5kZWZhdWx0UHJldmVudGVkKXtcblx0XHRcdFx0XHR3aWR0aCA9IGV2ZW50LmRldGFpbC53aWR0aDtcblxuXHRcdFx0XHRcdGlmKHdpZHRoICYmIHdpZHRoICE9PSBlbGVtLl9sYXp5c2l6ZXNXaWR0aCl7XG5cdFx0XHRcdFx0XHRzaXplRWxlbWVudChlbGVtLCBwYXJlbnQsIGV2ZW50LCB3aWR0aCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciB1cGRhdGVFbGVtZW50c1NpemVzID0gZnVuY3Rpb24oKXtcblx0XHRcdHZhciBpO1xuXHRcdFx0dmFyIGxlbiA9IGF1dG9zaXplc0VsZW1zLmxlbmd0aDtcblx0XHRcdGlmKGxlbil7XG5cdFx0XHRcdGkgPSAwO1xuXG5cdFx0XHRcdGZvcig7IGkgPCBsZW47IGkrKyl7XG5cdFx0XHRcdFx0Z2V0U2l6ZUVsZW1lbnQoYXV0b3NpemVzRWxlbXNbaV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciBkZWJvdW5jZWRVcGRhdGVFbGVtZW50c1NpemVzID0gZGVib3VuY2UodXBkYXRlRWxlbWVudHNTaXplcyk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0XzogZnVuY3Rpb24oKXtcblx0XHRcdFx0YXV0b3NpemVzRWxlbXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGxhenlTaXplc0NmZy5hdXRvc2l6ZXNDbGFzcyk7XG5cdFx0XHRcdGFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGRlYm91bmNlZFVwZGF0ZUVsZW1lbnRzU2l6ZXMpO1xuXHRcdFx0fSxcblx0XHRcdGNoZWNrRWxlbXM6IGRlYm91bmNlZFVwZGF0ZUVsZW1lbnRzU2l6ZXMsXG5cdFx0XHR1cGRhdGVFbGVtOiBnZXRTaXplRWxlbWVudFxuXHRcdH07XG5cdH0pKCk7XG5cblx0dmFyIGluaXQgPSBmdW5jdGlvbigpe1xuXHRcdGlmKCFpbml0LmkgJiYgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSl7XG5cdFx0XHRpbml0LmkgPSB0cnVlO1xuXHRcdFx0YXV0b1NpemVyLl8oKTtcblx0XHRcdGxvYWRlci5fKCk7XG5cdFx0fVxuXHR9O1xuXG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHRpZihsYXp5U2l6ZXNDZmcuaW5pdCl7XG5cdFx0XHRpbml0KCk7XG5cdFx0fVxuXHR9KTtcblxuXHRsYXp5c2l6ZXMgPSB7XG5cdFx0LyoqXG5cdFx0ICogQHR5cGUgeyBMYXp5U2l6ZXNDb25maWdQYXJ0aWFsIH1cblx0XHQgKi9cblx0XHRjZmc6IGxhenlTaXplc0NmZyxcblx0XHRhdXRvU2l6ZXI6IGF1dG9TaXplcixcblx0XHRsb2FkZXI6IGxvYWRlcixcblx0XHRpbml0OiBpbml0LFxuXHRcdHVQOiB1cGRhdGVQb2x5ZmlsbCxcblx0XHRhQzogYWRkQ2xhc3MsXG5cdFx0ckM6IHJlbW92ZUNsYXNzLFxuXHRcdGhDOiBoYXNDbGFzcyxcblx0XHRmaXJlOiB0cmlnZ2VyRXZlbnQsXG5cdFx0Z1c6IGdldFdpZHRoLFxuXHRcdHJBRjogckFGLFxuXHR9O1xuXG5cdHJldHVybiBsYXp5c2l6ZXM7XG59XG4pKTtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIvKiBnbG9iYWwgbG9jYWxTdG9yYWdlICAqL1xuaW1wb3J0IGRvY1NlbGVjdG9yQWxsIGZyb20gJy4vZG9jdW1lbnQtcXVlcnktc2VsZWN0b3ItYWxsJ1xuXG5leHBvcnQgZGVmYXVsdCBlbCA9PiB7XG4gIGNvbnN0ICR0b2dnbGVUaGVtZSA9IGRvY1NlbGVjdG9yQWxsKGVsKVxuXG4gIGlmICghJHRvZ2dsZVRoZW1lLmxlbmd0aCkgcmV0dXJuXG5cbiAgY29uc3Qgcm9vdEVsID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XG5cbiAgJHRvZ2dsZVRoZW1lLmZvckVhY2goaXRlbSA9PiBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4gICAgaWYgKCFyb290RWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdkYXJrJykpIHtcbiAgICAgIHJvb3RFbC5jbGFzc0xpc3QuYWRkKCdkYXJrJylcbiAgICAgIGxvY2FsU3RvcmFnZS50aGVtZSA9ICdkYXJrJ1xuICAgIH0gZWxzZSB7XG4gICAgICByb290RWwuY2xhc3NMaXN0LnJlbW92ZSgnZGFyaycpXG4gICAgICBsb2NhbFN0b3JhZ2UudGhlbWUgPSAnbGlnaHQnXG4gICAgfVxuICB9KSlcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICBjb25zdCBwYXJlbnQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGRvY3VtZW50XG5cbiAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHBhcmVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSwgMClcbn1cbiIsIi8qKlxuICogaGFwdGljLWZlZWRiYWNrLmpzXG4gKlxuICogQXR0YWNoZXMgd2ViLWhhcHRpY3MgZmVlZGJhY2sgdG8gYW55IGVsZW1lbnQgdmlhIGEgYHRhcmdldHNgIGFycmF5LlxuICogRWFjaCB0YXJnZXQgbWFwcyBhIENTUyBzZWxlY3RvciDihpIgYSBuYW1lZCBoYXB0aWMgcHJlc2V0ICgrIG9wdGlvbmFsIGV2ZW50KS5cbiAqXG4gKiBVc2VzIGEgc2luZ2xlIGRlbGVnYXRlZCBsaXN0ZW5lciBvbiBgZG9jdW1lbnRgIOKAlCB3b3JrcyBhdXRvbWF0aWNhbGx5XG4gKiBmb3IgZWxlbWVudHMgYWRkZWQgbGF0ZXIgYnkgaW5maW5pdGUgc2Nyb2xsLCBubyByZS1pbml0IG5lZWRlZC5cbiAqXG4gKiDilIDilIDilIAgUHJlc2V0IHF1aWNrLXJlZmVyZW5jZSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbiAqXG4gKiAgXCJsaWdodFwiICAgICAgc2luZ2xlIHNob3J0IHRhcCAgICAg4oCUIG5hdiBsaW5rcywgdG9nZ2xlcywgbWlub3IgdGFwc1xuICogIFwibWVkaXVtXCIgICAgIG1vZGVyYXRlIHRhcCAgICAgICAgIOKAlCBidXR0b25zLCBjYXJkIGFjdGlvbnMgIChkZWZhdWx0KVxuICogIFwiaGVhdnlcIiAgICAgIHN0cm9uZyB0YXAgICAgICAgICAgIOKAlCBtYWpvciBhY3Rpb25zLCBkZXN0cnVjdGl2ZSBjb25maXJtc1xuICogIFwic29mdFwiICAgICAgIGN1c2hpb25lZCB0YXAgICAgICAgIOKAlCBzdWJ0bGUsIHJvdW5kZWQgZmVlbFxuICogIFwicmlnaWRcIiAgICAgIGNyaXNwIGhhcmQgdGFwICAgICAgIOKAlCBwcmVjaXNlLCBzbmFwcHkgZmVlbFxuICogIFwic2VsZWN0aW9uXCIgIHN1YnRsZSB0aWNrICAgICAgICAgIOKAlCBzbGlkZXJzLCBwaWNrZXJzLCBzdGVwcGVyc1xuICogIFwic3VjY2Vzc1wiICAgIHR3byBhc2NlbmRpbmcgdGFwcyAgIOKAlCBmb3JtIHNhdmVkLCBwYXltZW50IGNvbmZpcm1lZFxuICogIFwid2FybmluZ1wiICAgIHR3byB0YXBzICsgaGVzaXRhdGUgIOKAlCBkZXN0cnVjdGl2ZSBhY3Rpb24gYWhlYWRcbiAqICBcImVycm9yXCIgICAgICBmb3VyIHJhcGlkIHRhcHMgICAgICDigJQgdmFsaWRhdGlvbiBmYWlsLCBuZXR3b3JrIGVycm9yXG4gKiAgXCJudWRnZVwiICAgICAgc3Ryb25nICsgc29mdCB0YWlsICAg4oCUIHJlbWluZGVyIC8gYXR0ZW50aW9uIGdyYWJcbiAqICBcImJ1enpcIiAgICAgICBsb25nIHZpYnJhdGlvbiAgICAgICDigJQgcmFyZSwgaGlnaC1hdHRlbnRpb24gbW9tZW50c1xuICpcbiAqIOKUgOKUgOKUgCBVc2FnZSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbiAqXG4gKiAgIGltcG9ydCBpbml0SGFwdGljRmVlZGJhY2sgZnJvbSAnLi9hcHAvaGFwdGljLWZlZWRiYWNrJ1xuICpcbiAqICAgaW5pdEhhcHRpY0ZlZWRiYWNrKHtcbiAqICAgICB0YXJnZXRzOiBbXG4gKiAgICAgICB7IHNlbGVjdG9yOiAnYnV0dG9uJywgICAgICAgICAgICAgICBoYXB0aWM6ICdtZWRpdW0nICAgIH0sXG4gKiAgICAgICB7IHNlbGVjdG9yOiAnYVtocmVmXScsICAgICAgICAgICAgICBoYXB0aWM6ICdsaWdodCcgICAgIH0sXG4gKiAgICAgICB7IHNlbGVjdG9yOiAnLmtnLWF1ZGlvLXNlZWstc2xpZGVyJyxoYXB0aWM6ICdzZWxlY3Rpb24nLCBldmVudDogJ2NoYW5nZScgfSxcbiAqICAgICBdLFxuICogICAgIGV4Y2x1ZGU6IFsnW2Rpc2FibGVkXScsICcubm8taGFwdGljJ10sXG4gKiAgIH0pXG4gKi9cblxuaW1wb3J0IHsgaGFwdGljcyB9IGZyb20gJy4uL2xpYi9oYXB0aWMnXG5cbi8vIOKUgOKUgOKUgCBEZWZhdWx0cyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuY29uc3QgREVGQVVMVF9DT05GSUcgPSB7XG4gIHRhcmdldHM6IFtcbiAgICB7IHNlbGVjdG9yOiAnYnV0dG9uJywgICAgICAgICAgICAgICAgICBoYXB0aWM6ICdtZWRpdW0nICAgIH0sXG4gICAgeyBzZWxlY3RvcjogJ2FbaHJlZl0nLCAgICAgICAgICAgICAgICAgaGFwdGljOiAnaGVhdnknICAgICB9LFxuICAgIHsgc2VsZWN0b3I6ICcuaGxhJywgICAgICAgICAgICAgICAgICAgIGhhcHRpYzogJ2xpZ2h0JyAgICAgfSxcblxuICAgIC8vIFtkYXRhLWdob3N0LXNlYXJjaF0gY2xpY2tzIGFyZSBoYW5kbGVkIGJ5IG1laWxpc2VhcmNoLmpzIChjYXB0dXJlIHBoYXNlKVxuICAgIC8vIHNvIHRoZXkgbmV2ZXIgcmVhY2ggdGhpcyBidWJibGUtcGhhc2UgbGlzdGVuZXIuIExpc3RlZCBoZXJlIG9ubHkgc28gdGhhdFxuICAgIC8vIGlmIE1laWxpU2VhcmNoIGlzIG5vdCBsb2FkZWQsIHRoZSBjbGljayBzdGlsbCBnZXRzIGEgaGFwdGljLlxuICAgIHsgc2VsZWN0b3I6ICdbZGF0YS1naG9zdC1zZWFyY2hdJywgICAgIGhhcHRpYzogJ251ZGdlJyAgICAgfSxcblxuICAgIHsgc2VsZWN0b3I6ICdbZGF0YS1oYXB0aWNdJywgICAgICAgICAgIGhhcHRpYzogJ21lZGl1bScgICAgfSxcbiAgICB7IHNlbGVjdG9yOiAnLmtnLWF1ZGlvLXNlZWstc2xpZGVyJywgICBoYXB0aWM6ICdzZWxlY3Rpb24nLCBldmVudDogJ2NoYW5nZScgfSxcbiAgICB7IHNlbGVjdG9yOiAnLmtnLWF1ZGlvLXZvbHVtZS1zbGlkZXInLCBoYXB0aWM6ICdzZWxlY3Rpb24nLCBldmVudDogJ2NoYW5nZScgfSxcbiAgXSxcbiAgZXhjbHVkZTogW1xuICAgICdbZGlzYWJsZWRdJyxcbiAgICAnW2FyaWEtZGlzYWJsZWQ9XCJ0cnVlXCJdJyxcbiAgICAnLm5vLWhhcHRpYycsXG4gIF0sXG59XG5cbi8vIOKUgOKUgOKUgCBJbml0IOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpbml0SGFwdGljRmVlZGJhY2sgKHVzZXJDb25maWcgPSB7fSkge1xuICBjb25zdCBjb25maWcgPSB7XG4gICAgZXhjbHVkZTogWy4uLkRFRkFVTFRfQ09ORklHLmV4Y2x1ZGUsIC4uLih1c2VyQ29uZmlnLmV4Y2x1ZGUgfHwgW10pXSxcbiAgICB0YXJnZXRzOiB1c2VyQ29uZmlnLnRhcmdldHNcbiAgICAgID8gWy4uLkRFRkFVTFRfQ09ORklHLnRhcmdldHMsIC4uLnVzZXJDb25maWcudGFyZ2V0c11cbiAgICAgIDogWy4uLkRFRkFVTFRfQ09ORklHLnRhcmdldHNdLFxuICB9XG5cbiAgY29uc3QgZXhjbHVkZVNlbGVjdG9yID0gY29uZmlnLmV4Y2x1ZGUuZmlsdGVyKEJvb2xlYW4pLmpvaW4oJywgJykgfHwgbnVsbFxuXG4gIGNvbnN0IGJ5RXZlbnQgPSB7fVxuICBmb3IgKGNvbnN0IHRhcmdldCBvZiBjb25maWcudGFyZ2V0cykge1xuICAgIGNvbnN0IGV2ZW50ID0gdGFyZ2V0LmV2ZW50IHx8ICdjbGljaydcbiAgICBpZiAoIWJ5RXZlbnRbZXZlbnRdKSBieUV2ZW50W2V2ZW50XSA9IFtdXG4gICAgYnlFdmVudFtldmVudF0ucHVzaCh0YXJnZXQpXG4gIH1cblxuICBmb3IgKGNvbnN0IFtldmVudCwgdGFyZ2V0c10gb2YgT2JqZWN0LmVudHJpZXMoYnlFdmVudCkpIHtcbiAgICBjb25zdCBwcmVzZXRNYXAgPSBuZXcgTWFwKClcbiAgICBmb3IgKGNvbnN0IHQgb2YgdGFyZ2V0cykgcHJlc2V0TWFwLnNldCh0LnNlbGVjdG9yLnRyaW0oKSwgdC5oYXB0aWMgfHwgJ21lZGl1bScpXG5cbiAgICBjb25zdCBjb21iaW5lZFNlbGVjdG9yID0gWy4uLnByZXNldE1hcC5rZXlzKCldLmpvaW4oJywgJylcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGZ1bmN0aW9uIGhhbmRsZUhhcHRpYyAoZSkge1xuICAgICAgY29uc3QgZWwgPSBlLnRhcmdldC5jbG9zZXN0KGNvbWJpbmVkU2VsZWN0b3IpXG4gICAgICBpZiAoIWVsKSByZXR1cm5cbiAgICAgIGlmIChleGNsdWRlU2VsZWN0b3IgJiYgZWwubWF0Y2hlcyhleGNsdWRlU2VsZWN0b3IpKSByZXR1cm5cblxuICAgICAgbGV0IHByZXNldCA9ICdtZWRpdW0nXG4gICAgICBmb3IgKGNvbnN0IFtzZWwsIHBdIG9mIHByZXNldE1hcCkge1xuICAgICAgICB0cnkgeyBpZiAoZWwubWF0Y2hlcyhzZWwpKSB7IHByZXNldCA9IHA7IGJyZWFrIH0gfSBjYXRjaCAoXykge31cbiAgICAgIH1cblxuICAgICAgLy8gZGF0YS1oYXB0aWM9XCJwcmVzZXRcIiBpbmxpbmUgb3ZlcnJpZGUg4oCUIGhpZ2hlc3QgcHJpb3JpdHlcbiAgICAgIGNvbnN0IGRhdGFQcmVzZXQgPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaGFwdGljJylcbiAgICAgIGlmIChkYXRhUHJlc2V0ICYmIGRhdGFQcmVzZXQudHJpbSgpKSBwcmVzZXQgPSBkYXRhUHJlc2V0LnRyaW0oKVxuXG4gICAgICBoYXB0aWNzLnRyaWdnZXIocHJlc2V0KVxuICAgIH0sIHsgcGFzc2l2ZTogdHJ1ZSB9KVxuICB9XG5cbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICBmb3IgKGNvbnN0IFtldmVudCwgdGFyZ2V0c10gb2YgT2JqZWN0LmVudHJpZXMoYnlFdmVudCkpIHtcbiAgICAgIGNvbnNvbGUuZGVidWcoXG4gICAgICAgIGBbaGFwdGljLWZlZWRiYWNrXSBcIiR7ZXZlbnR9XCIgbGlzdGVuZXIg4oaSYCxcbiAgICAgICAgdGFyZ2V0cy5tYXAodCA9PiBgJHt0LnNlbGVjdG9yfSAoJHt0LmhhcHRpYyB8fCAnbWVkaXVtJ30pYCkuam9pbignIHwgJylcbiAgICAgIClcbiAgICB9XG4gICAgaWYgKGV4Y2x1ZGVTZWxlY3RvcikgY29uc29sZS5kZWJ1ZygnW2hhcHRpYy1mZWVkYmFja10gRXhjbHVkaW5nOicsIGV4Y2x1ZGVTZWxlY3RvcilcbiAgfVxufSIsImV4cG9ydCBkZWZhdWx0IChjb3ZlckNsYXNzLCBoZWFkVHJhbnNwYXJlbnQpID0+IHtcbiAgY29uc3QgZG9tQm9keSA9IGRvY3VtZW50LmJvZHlcbiAgY29uc3QgaGFzQ292ZXIgPSBkb21Cb2R5LmNsb3Nlc3QoY292ZXJDbGFzcylcblxuICBpZiAoIWhhc0NvdmVyKSByZXR1cm5cblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgKCkgPT4ge1xuICAgIGNvbnN0IGxhc3RTY3JvbGxZID0gd2luZG93LnNjcm9sbFlcblxuICAgIGxhc3RTY3JvbGxZID49IDYwID8gZG9tQm9keS5jbGFzc0xpc3QucmVtb3ZlKGhlYWRUcmFuc3BhcmVudCkgOiBkb21Cb2R5LmNsYXNzTGlzdC5hZGQoaGVhZFRyYW5zcGFyZW50KVxuICB9LCB7IHBhc3NpdmU6IHRydWUgfSlcbn1cbiIsIlxuaW1wb3J0IGRvY1NlbGVjdG9yQWxsIGZyb20gJy4vZG9jdW1lbnQtcXVlcnktc2VsZWN0b3ItYWxsJ1xuXG5leHBvcnQgZGVmYXVsdCAoc29jaWFsTWVkaWFEYXRhLCBib3hTZWxlY3RvcikgPT4ge1xuICAvLyBjaGVjayBpZiB0aGUgYm94IGZvciB0aGUgbWVudSBleGlzdHNcbiAgY29uc3Qgbm9kZUJveCA9IGRvY1NlbGVjdG9yQWxsKGJveFNlbGVjdG9yKVxuXG4gIGlmICghbm9kZUJveC5sZW5ndGgpIHJldHVyblxuXG4gIGNvbnN0IHVybFJlZ2V4cCA9IHVybCA9PiAvKCgoW0EtWmEtel17Myw5fTooPzpcXC9cXC8pPykoPzpbXFwtOzomPVxcK1xcJCxcXHddK0ApP1tBLVphLXowLTlcXC5cXC1dK3woPzp3d3dcXC58W1xcLTs6Jj1cXCtcXCQsXFx3XStAKVtBLVphLXowLTlcXC5cXC1dKykoKD86XFwvW1xcK34lXFwvXFwuXFx3XFwtX10qKT9cXD8/KD86W1xcLVxcKz0mOyVAXFwuXFx3X10qKSM/KD86W1xcLlxcIVxcL1xcXFxcXHddKikpPykvLnRlc3QodXJsKSAvL2VzbGludC1kaXNhYmxlLWxpbmVcblxuICBjb25zdCBjcmVhdGVFbGVtZW50ID0gZWxlbWVudCA9PiB7XG4gICAgT2JqZWN0LmVudHJpZXMoc29jaWFsTWVkaWFEYXRhKS5mb3JFYWNoKChbbmFtZSwgdXJsVGl0bGVdKSA9PiB7XG4gICAgICBjb25zdCB1cmwgPSB1cmxUaXRsZVswXVxuXG4gICAgICAvLyBUaGUgdXJsIGlzIGJlaW5nIHZhbGlkYXRlZCBpZiBpdCBpcyBmYWxzZSBpdCByZXR1cm5zXG4gICAgICBpZiAoIXVybFJlZ2V4cCh1cmwpKSByZXR1cm5cblxuICAgICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKVxuICAgICAgbGluay5ocmVmID0gdXJsXG4gICAgICBsaW5rLnRpdGxlID0gdXJsVGl0bGVbMV1cbiAgICAgIGxpbmsuY2xhc3NMaXN0ID0gYGJ1dHRvbiBib3JkZXItbm9uZSBob3Zlcjp0ZXh0LSR7bmFtZX1gXG4gICAgICBsaW5rLnRhcmdldCA9ICdfYmxhbmsnXG4gICAgICBsaW5rLnJlbCA9ICdub29wZW5lciBub3JlZmVycmVyJ1xuICAgICAgbGluay5pbm5lckhUTUwgPSBgPHN2ZyBjbGFzcz1cImljb24gaWNvbi0tJHtuYW1lfVwiPjx1c2UgeGxpbms6aHJlZj1cIiNpY29uLSR7bmFtZX1cIj48L3VzZT48L3N2Zz5gXG5cbiAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQobGluaylcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIG5vZGVCb3guZm9yRWFjaChjcmVhdGVFbGVtZW50KVxufVxuIiwiLyogZ2xvYmFsIE00R2FsbGVyeSAqL1xuXG5pbXBvcnQgbG9hZFNjcmlwdCBmcm9tICcuL2xvYWQtc2NyaXB0J1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7XG4gIGlmIChNNEdhbGxlcnkgPT09IGZhbHNlKSByZXR1cm5cblxuICBpZiAod2luZG93LmlubmVyV2lkdGggPCA3NjgpIHJldHVyblxuXG4gIGNvbnN0ICRwb3N0Qm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwb3N0LWJvZHknKVxuXG4gIGlmICghJHBvc3RCb2R5KSByZXR1cm5cblxuICAvKiA8aW1nPiBTZXQgQXRyaWJ1dGUgKGRhdGEtc3JjIC0gZGF0YS1zdWItaHRtbClcbiAgLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuICAkcG9zdEJvZHkucXVlcnlTZWxlY3RvckFsbCgnaW1nJykuZm9yRWFjaChlbCA9PiB7XG4gICAgaWYgKGVsLmNsb3Nlc3QoJ2EnKSkgcmV0dXJuXG5cbiAgICBlbC5jbGFzc0xpc3QuYWRkKCdNNC1saWdodC1nYWxsZXJ5JylcbiAgICBlbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtc3JjJywgZWwuc3JjKVxuXG4gICAgY29uc3QgbmV4dEVsZW1lbnQgPSBlbC5uZXh0U2libGluZ1xuXG4gICAgaWYgKG5leHRFbGVtZW50ICE9PSBudWxsICYmIG5leHRFbGVtZW50Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdmaWdjYXB0aW9uJykge1xuICAgICAgZWwuc2V0QXR0cmlidXRlKCdkYXRhLXN1Yi1odG1sJywgbmV4dEVsZW1lbnQuaW5uZXJIVE1MKVxuICAgIH1cbiAgfSlcblxuICAvKiBMaWdodGdhbGxlcnlcbiAgLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuICBjb25zdCAkaW1nTGlnaHRHYWxsZXJ5ID0gJHBvc3RCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJy5NNC1saWdodC1nYWxsZXJ5JylcblxuICBpZiAoISRpbWdMaWdodEdhbGxlcnkubGVuZ3RoKSByZXR1cm5cblxuICBjb25zdCBsb2FkQ1NTID0gaHJlZiA9PiB7XG4gICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKVxuICAgIGxpbmsubWVkaWEgPSAncHJpbnQnXG4gICAgbGluay5yZWwgPSAnc3R5bGVzaGVldCdcbiAgICBsaW5rLmhyZWYgPSBocmVmXG4gICAgbGluay5vbmxvYWQgPSAoKSA9PiB7IGxpbmsubWVkaWEgPSAnYWxsJyB9XG4gICAgZG9jdW1lbnQuaGVhZC5pbnNlcnRCZWZvcmUobGluaywgZG9jdW1lbnQuaGVhZC5jaGlsZE5vZGVzW2RvY3VtZW50LmhlYWQuY2hpbGROb2Rlcy5sZW5ndGggLSAxXS5uZXh0U2libGluZylcbiAgfVxuXG4gIGxvYWRDU1MoJ2h0dHBzOi8vdW5wa2cuY29tL2xpZ2h0Z2FsbGVyeUAyLjEuOC9jc3MvbGlnaHRnYWxsZXJ5LmNzcycpXG5cbiAgbG9hZFNjcmlwdCgnaHR0cHM6Ly91bnBrZy5jb20vbGlnaHRnYWxsZXJ5QDIuMS44L2xpZ2h0Z2FsbGVyeS5taW4uanMnLCAoKSA9PiB7XG4gICAgd2luZG93LmxpZ2h0R2FsbGVyeSgkcG9zdEJvZHksIHtcbiAgICAgIHNwZWVkOiA1MDAsXG4gICAgICBzZWxlY3RvcjogJy5NNC1saWdodC1nYWxsZXJ5J1xuICAgIH0pXG4gIH0pXG59XG4iLCIvKiBnbG9iYWwgcHJpc21KcyAqL1xuXG5pbXBvcnQgbG9hZFNjcmlwdCBmcm9tICcuL2xvYWQtc2NyaXB0J1xuaW1wb3J0IGRvY1NlbGVjdG9yQWxsIGZyb20gJy4uL2FwcC9kb2N1bWVudC1xdWVyeS1zZWxlY3Rvci1hbGwnXG5cbmV4cG9ydCBkZWZhdWx0IChyb290ID0gZG9jdW1lbnQsIGNvZGVMYW5ndWFnZSkgPT4ge1xuICBjb25zdCAkY29kZUxhbmd1YWdlID0gKHJvb3QgJiYgcm9vdC5xdWVyeVNlbGVjdG9yQWxsKSA/IHJvb3QucXVlcnlTZWxlY3RvckFsbChjb2RlTGFuZ3VhZ2UpIDogZG9jU2VsZWN0b3JBbGwoY29kZUxhbmd1YWdlKVxuXG4gIGlmICgoISRjb2RlTGFuZ3VhZ2UgfHwgISRjb2RlTGFuZ3VhZ2UubGVuZ3RoKSAmJiB0eXBlb2YgcHJpc21KcyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVyblxuXG4gIC8vIFNob3cgTGFuZ3VhZ2VcbiAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbCgkY29kZUxhbmd1YWdlIHx8IFtdLCBlbGVtZW50ID0+IHtcbiAgICAvLyBJZGVtcG90ZW5jeVxuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdCAmJiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnanMtcHJpc20tcHJvY2Vzc2VkJykpIHJldHVyblxuXG4gICAgbGV0IGxhbmd1YWdlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykgfHwgJydcbiAgICBsYW5ndWFnZSA9IGxhbmd1YWdlLnNwbGl0KCctJylcbiAgICBpZiAoZWxlbWVudC5wYXJlbnRFbGVtZW50ICYmIGxhbmd1YWdlWzFdKSB7XG4gICAgICBlbGVtZW50LnBhcmVudEVsZW1lbnQuc2V0QXR0cmlidXRlKCdyZWwnLCBsYW5ndWFnZVsxXSlcbiAgICB9XG5cbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnanMtcHJpc20tcHJvY2Vzc2VkJylcbiAgfSlcblxuICAvLyBMb2FkIFByaXNtSnMgYW5kIFBsdWdpbiBMb2FmXG4gIGxvYWRTY3JpcHQocHJpc21Kcylcbn1cbiIsImV4cG9ydCBkZWZhdWx0IChzcmMsIGNhbGxiYWNrKSA9PiB7XG4gIGNvbnN0IHNjcmlwdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKVxuICBzY3JpcHRFbGVtZW50LnNyYyA9IHNyY1xuICBzY3JpcHRFbGVtZW50LmRlZmVyID0gdHJ1ZVxuICBzY3JpcHRFbGVtZW50LmFzeW5jID0gdHJ1ZVxuXG4gIGNhbGxiYWNrICYmIHNjcmlwdEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGNhbGxiYWNrKVxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdEVsZW1lbnQpXG59XG4iLCJleHBvcnQgZGVmYXVsdCBzZXR0aW5ncyA9PiB7XG4gIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgc2VsZWN0b3I6ICcjanMtcHJvbW8tcG9wdXAnLFxuICAgIHN0b3JhZ2VLZXk6ICdtNC1wcm9tby1oaWRkZW4nLFxuICAgIGRlbGF5OiAxMDAwLFxuICAgIC4uLnNldHRpbmdzXG4gIH1cblxuICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihvcHRpb25zLnNlbGVjdG9yKVxuICBpZiAoIWVsZW1lbnQpIHJldHVyblxuXG4gIGNvbnN0IG1lc3NhZ2UgPSBlbGVtZW50LmRhdGFzZXQubWVzc2FnZVxuICBpZiAoIW1lc3NhZ2UpIHJldHVyblxuXG4gIGlmICh3aW5kb3cuc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShvcHRpb25zLnN0b3JhZ2VLZXkpID09PSBtZXNzYWdlKSByZXR1cm5cblxuICBlbGVtZW50LmlubmVySFRNTCA9IGBcbiAgICA8ZGl2IGNsYXNzPVwicHJvbW8tcG9wdXBfX2NvbnRlbnRcIj5cbiAgICAgIDxzcGFuIGNsYXNzPVwicHJvbW8tcG9wdXBfX21lc3NhZ2VcIj4ke21lc3NhZ2V9PC9zcGFuPlxuICAgICAgPGJ1dHRvbiBjbGFzcz1cInByb21vLXBvcHVwX19idG4ganMtcHJvbW8tY2xvc2VcIj5Eb24ndCBzaG93IGFnYWluPC9idXR0b24+XG4gICAgPC9kaXY+XG4gIGBcblxuICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy12aXNpYmxlJylcbiAgfSwgb3B0aW9ucy5kZWxheSlcblxuICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICBpZiAoZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdqcy1wcm9tby1jbG9zZScpKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtdmlzaWJsZScpXG4gICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShvcHRpb25zLnN0b3JhZ2VLZXksIG1lc3NhZ2UpXG4gICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7IGVsZW1lbnQuaW5uZXJIVE1MID0gJycgfSwgNTAwKVxuICAgIH1cbiAgfSlcbn1cbiIsImltcG9ydCBkb2NTZWxlY3RvckFsbCBmcm9tICcuLi9hcHAvZG9jdW1lbnQtcXVlcnktc2VsZWN0b3ItYWxsJ1xuXG4vKipcbiAqIEdhbGxlcnkgY2FyZCBzdXBwb3J0XG4gKiBVc2VkIG9uIGFueSBpbmRpdmlkdWFsIHBvc3QvcGFnZVxuICpcbiAqIERldGVjdHMgd2hlbiBhIGdhbGxlcnkgY2FyZCBoYXMgYmVlbiB1c2VkIGFuZCBhcHBsaWVzIHNpemluZyB0byBtYWtlIHN1cmVcbiAqIHRoZSBkaXNwbGF5IG1hdGNoZXMgd2hhdCBpcyBzZWVuIGluIHRoZSBlZGl0b3IuXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgKHJvb3QgPSBkb2N1bWVudCkgPT4ge1xuICBjb25zdCBpbWFnZXMgPSAocm9vdCAmJiByb290LnF1ZXJ5U2VsZWN0b3JBbGwpID8gcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcua2ctZ2FsbGVyeS1pbWFnZSA+IGltZycpIDogZG9jU2VsZWN0b3JBbGwoJy5rZy1nYWxsZXJ5LWltYWdlID4gaW1nJylcblxuICBpZiAoIWltYWdlcyB8fCAhaW1hZ2VzLmxlbmd0aCkgcmV0dXJuXG5cbiAgaW1hZ2VzLmZvckVhY2goaW1hZ2UgPT4ge1xuICAgIC8vIElkZW1wb3RlbmN5OiBza2lwIGltYWdlcyBhbHJlYWR5IHByb2Nlc3NlZFxuICAgIGlmIChpbWFnZS5jbGFzc0xpc3QgJiYgaW1hZ2UuY2xhc3NMaXN0LmNvbnRhaW5zKCdqcy1nYWxsZXJ5LXByb2Nlc3NlZCcpKSByZXR1cm5cblxuICAgIGNvbnN0IGNvbnRhaW5lciA9IGltYWdlLmNsb3Nlc3QoJy5rZy1nYWxsZXJ5LWltYWdlJylcbiAgICBpZiAoIWNvbnRhaW5lcikgcmV0dXJuXG5cbiAgICBjb25zdCB3aWR0aCA9IGltYWdlLmF0dHJpYnV0ZXMud2lkdGggJiYgaW1hZ2UuYXR0cmlidXRlcy53aWR0aC52YWx1ZVxuICAgIGNvbnN0IGhlaWdodCA9IGltYWdlLmF0dHJpYnV0ZXMuaGVpZ2h0ICYmIGltYWdlLmF0dHJpYnV0ZXMuaGVpZ2h0LnZhbHVlXG4gICAgaWYgKCF3aWR0aCB8fCAhaGVpZ2h0KSByZXR1cm5cblxuICAgIGNvbnN0IHJhdGlvID0gd2lkdGggLyBoZWlnaHRcbiAgICBjb250YWluZXIuc3R5bGUuZmxleCA9IHJhdGlvICsgJyAxIDAlJ1xuXG4gICAgaW1hZ2UuY2xhc3NMaXN0LmFkZCgnanMtZ2FsbGVyeS1wcm9jZXNzZWQnKVxuICB9KVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZWwgPT4ge1xuICBjb25zdCAkaGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbClcblxuICBpZiAoISRoZWFkZXIpIHJldHVyblxuXG4gIC8vIEd1YXJkOiAuanMtc2VhcmNoIG1heSBub3QgZXhpc3Qgb24gZXZlcnkgcGFnZSB0ZW1wbGF0ZVxuICBjb25zdCAkc2VhcmNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLXNlYXJjaCcpXG5cbiAgbGV0IHByZXZTY3JvbGxwb3MgPSB3aW5kb3cucGFnZVlPZmZzZXRcblxuICAvLyBJTVBPUlRBTlQ6IHVzZSBhZGRFdmVudExpc3RlbmVyLCBub3QgYHdpbmRvdy5vbnNjcm9sbCA9IC4uLmBcbiAgLy8gQXNzaWduaW5nIHRvIHdpbmRvdy5vbnNjcm9sbCBnZXRzIHNpbGVudGx5IG92ZXJ3cml0dGVuIGJ5IGFueSBvdGhlclxuICAvLyBzY3JpcHQgKGluY2x1ZGluZyBpbmZpbml0ZS1zY3JvbGwpIHRoYXQgZG9lcyB0aGUgc2FtZSDigJQgdGhpcyB3YXMgd2h5XG4gIC8vIHNjcm9sbC1oaWRlLWhlYWRlciBzdG9wcGVkIHdvcmtpbmcgYWZ0ZXIgaW5maW5pdGUgc2Nyb2xsIHdhcyBhZGRlZC5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBjdXJyZW50U2Nyb2xsUG9zID0gd2luZG93LnBhZ2VZT2Zmc2V0XG5cbiAgICBpZiAocHJldlNjcm9sbHBvcyA+IGN1cnJlbnRTY3JvbGxQb3MpIHtcbiAgICAgIC8vIFNjcm9sbGluZyB1cCDigJQgcmV2ZWFsIGhlYWRlclxuICAgICAgJGhlYWRlci5jbGFzc0xpc3QucmVtb3ZlKCctdG9wLTE4JylcbiAgICAgIGlmICgkc2VhcmNoKSAkc2VhcmNoLmNsYXNzTGlzdC5hZGQoJ210LTE2JylcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU2Nyb2xsaW5nIGRvd24g4oCUIGhpZGUgaGVhZGVyXG4gICAgICAkaGVhZGVyLmNsYXNzTGlzdC5hZGQoJy10b3AtMTgnKVxuICAgICAgaWYgKCRzZWFyY2gpICRzZWFyY2guY2xhc3NMaXN0LnJlbW92ZSgnbXQtMTYnKVxuICAgIH1cblxuICAgIHByZXZTY3JvbGxwb3MgPSBjdXJyZW50U2Nyb2xsUG9zXG4gIH0sIHsgcGFzc2l2ZTogdHJ1ZSB9KVxufSIsImV4cG9ydCBkZWZhdWx0IChyb290ID0gZG9jdW1lbnQpID0+IHtcbiAgLyogSWZyYW1lIFNSQyB2aWRlbyAqL1xuICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgJ2lmcmFtZVtzcmMqPVwicGxheWVyLnZpbWVvLmNvbVwiXScsXG4gICAgJ2lmcmFtZVtzcmMqPVwiZGFpbHltb3Rpb24uY29tXCJdJyxcbiAgICAnaWZyYW1lW3NyYyo9XCJ5b3V0dWJlLmNvbVwiXScsXG4gICAgJ2lmcmFtZVtzcmMqPVwieW91dHViZS1ub2Nvb2tpZS5jb21cIl0nLFxuICAgICdpZnJhbWVbc3JjKj1cInBsYXllci50d2l0Y2gudHZcIl0nLFxuICAgICdpZnJhbWVbc3JjKj1cImtpY2tzdGFydGVyLmNvbVwiXVtzcmMqPVwidmlkZW8uaHRtbFwiXSdcbiAgXVxuXG4gIC8vIFVzZSByb290LnF1ZXJ5U2VsZWN0b3JBbGwgdG8gc2NvcGUgdGhlIHNlYXJjaFxuICBjb25zdCBpZnJhbWVzID0gcm9vdC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycy5qb2luKCcsJykpXG5cbiAgaWYgKCFpZnJhbWVzLmxlbmd0aCkgcmV0dXJuXG5cbiAgaWZyYW1lcy5mb3JFYWNoKGVsID0+IHtcbiAgICAvLyBDaGVjayBpZiBhbHJlYWR5IHByb2Nlc3NlZFxuICAgIGlmIChlbC5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucygndmlkZW8tcmVzcG9uc2l2ZScpKSByZXR1cm5cblxuICAgIGNvbnN0IHBhcmVudEZvclZpZGVvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBwYXJlbnRGb3JWaWRlby5jbGFzc05hbWUgPSAndmlkZW8tcmVzcG9uc2l2ZSdcbiAgICBlbC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShwYXJlbnRGb3JWaWRlbywgZWwpXG4gICAgcGFyZW50Rm9yVmlkZW8uYXBwZW5kQ2hpbGQoZWwpXG4gICAgZWwucmVtb3ZlQXR0cmlidXRlKCdoZWlnaHQnKVxuICAgIGVsLnJlbW92ZUF0dHJpYnV0ZSgnd2lkdGgnKVxuICB9KVxufSIsIi8qKlxuICogTWF0b21vIEFuYWx5dGljcyAmIEVuZ2FnZW1lbnQgTWFuYWdlclxuICogSGFuZGxlcyBTUEEtbGlrZSBwYWdlIHRyYW5zaXRpb25zIGFuZCBzY29wZWQgc2Nyb2xsIHRyYWNraW5nLlxuICpcbiAqIOKUgOKUgOKUgCBQcmVyZW5kZXJpbmcgZ3VhcmQg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4gKiBUaGUgU3BlY3VsYXRpb24gUnVsZXMgQVBJIChzcGVjdWxhdGlvbi1ydWxlcy5qcykgY3VycmVudGx5IHVzZXMgYHByZWZldGNoYCxcbiAqIHdoaWNoIGRvZXMgTk9UIGV4ZWN1dGUgSmF2YVNjcmlwdCwgc28gTWF0b21vIGlzIHNhZmUgdG9kYXkuXG4gKlxuICogSWYgeW91IGV2ZXIgdXBncmFkZSB0byBgcHJlcmVuZGVyYCwgSmF2YVNjcmlwdCBET0VTIHJ1biBpbiB0aGUgYmFja2dyb3VuZCB0YWIuXG4gKiBNYXRvbW8ncyBvd24gdHJhY2tpbmcgc25pcHBldCAoaW4geW91ciBHaG9zdCB0ZW1wbGF0ZSAvIGNvZGUgaW5qZWN0aW9uKSB3b3VsZFxuICogZmlyZSBiZWZvcmUgdGhlIHVzZXIgYWN0dWFsbHkgdmlld3MgdGhlIHBhZ2UsIGRvdWJsZS1jb3VudGluZyB0aGUgcGFnZXZpZXcuXG4gKlxuICogVG8gZml4IHRoYXQgYXQgdGhlIHNuaXBwZXQgbGV2ZWwsIHdyYXAgTWF0b21vJ3MgdHJhY2tQYWdlVmlldyBwdXNoIGxpa2U6XG4gKlxuICogICBpZiAoZG9jdW1lbnQucHJlcmVuZGVyaW5nKSB7XG4gKiAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncHJlcmVuZGVyaW5nY2hhbmdlJywgKCkgPT4ge1xuICogICAgICAgX3BhcS5wdXNoKFsndHJhY2tQYWdlVmlldyddKVxuICogICAgIH0sIHsgb25jZTogdHJ1ZSB9KVxuICogICB9IGVsc2Uge1xuICogICAgIF9wYXEucHVzaChbJ3RyYWNrUGFnZVZpZXcnXSlcbiAqICAgfVxuICpcbiAqIFRoZSBgdHJhY2tQYWdlVmlld2AgY2FsbHMgaW5zaWRlIHRoaXMgY2xhc3MgKHVzZWQgYnkgaW5maW5pdGUgc2Nyb2xsKSBhcmVcbiAqIHRyaWdnZXJlZCBieSB1c2VyIHNjcm9sbCBhY3Rpb24gYW5kIGFyZSB0aGVyZWZvcmUgYWxyZWFkeSBzYWZlIOKAlCB0aGV5IG9ubHlcbiAqIGZpcmUgb25jZSB0aGUgYXJ0aWNsZSBpcyBhY3R1YWxseSB2aXNpYmxlLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBbmFseXRpY3NNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHRoaXMuY3VycmVudFBhdGggPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWVcbiAgICB0aGlzLm9ic2VydmVycyA9IG5ldyBNYXAoKVxuICB9XG5cbiAgLyoqXG4gICAqIFRyYWNrIGEgdmlydHVhbCBwYWdldmlldyBmb3IgYW4gaW5maW5pdGUtc2Nyb2xsIGFydGljbGUgdHJhbnNpdGlvbi5cbiAgICogU2FmZSBmcm9tIHByZXJlbmRlcmluZyBkb3VibGUtY291bnRpbmc6IHRoaXMgaXMgb25seSBjYWxsZWQgZnJvbSB0aGVcbiAgICogSW5maW5pdGVTY3JvbGwgJ2FwcGVuZCcgZXZlbnQsIHdoaWNoIHJlcXVpcmVzIHJlYWwgdXNlciBzY3JvbGwgYWN0aW9uLlxuICAgKi9cbiAgdHJhY2tQYWdlVmlldyAodXJsLCB0aXRsZSwgcHJldmlvdXNVcmwpIHtcbiAgICBjb25zb2xlLmRlYnVnKCdbQW5hbHl0aWNzTWFuYWdlcl0gdHJhY2tQYWdlVmlldyBjYWxsZWQnLCB7IHVybCwgdGl0bGUsIHByZXZpb3VzVXJsIH0pXG5cbiAgICBpZiAoIXdpbmRvdy5fcGFxKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tBbmFseXRpY3NNYW5hZ2VyXSB3aW5kb3cuX3BhcSBpcyBub3QgYXZhaWxhYmxlOyBza2lwcGluZyBNYXRvbW8gY2FsbHMnKVxuICAgICAgdGhpcy5jdXJyZW50UGF0aCA9IHVybFxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5jdXJyZW50UGF0aCA9IHVybFxuXG4gICAgdHJ5IHtcbiAgICAgIHdpbmRvdy5fcGFxLnB1c2goWydzZXRSZWZlcnJlclVybCcsIHByZXZpb3VzVXJsXSlcbiAgICAgIHdpbmRvdy5fcGFxLnB1c2goWydzZXRDdXN0b21VcmwnLCB1cmxdKVxuICAgICAgd2luZG93Ll9wYXEucHVzaChbJ3NldERvY3VtZW50VGl0bGUnLCB0aXRsZV0pXG4gICAgICB3aW5kb3cuX3BhcS5wdXNoKFsnc2V0R2VuZXJhdGlvblRpbWVNcycsIDBdKVxuICAgICAgd2luZG93Ll9wYXEucHVzaChbJ3RyYWNrUGFnZVZpZXcnXSlcbiAgICAgIHdpbmRvdy5fcGFxLnB1c2goWydlbmFibGVMaW5rVHJhY2tpbmcnXSlcbiAgICAgIHdpbmRvdy5fcGFxLnB1c2goWydNZWRpYUFuYWx5dGljczo6c2NhbkZvck1lZGlhJ10pXG4gICAgICBjb25zb2xlLmluZm8oJ1tBbmFseXRpY3NNYW5hZ2VyXSBNYXRvbW8gdHJhY2tQYWdlVmlldyBwdXNoZWQnLCB7IHVybCwgdGl0bGUgfSlcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tBbmFseXRpY3NNYW5hZ2VyXSBlcnJvciBwdXNoaW5nIHRvIF9wYXEnLCBlcnIpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE9ic2VydmUgYW4gYXJ0aWNsZSBlbGVtZW50IGFuZCBmaXJlIGEgXCJSZWFkXCIgZXZlbnQgb25jZSB0aGUgdXNlciBoYXNcbiAgICogc3BlbnQgbWVhbmluZ2Z1bCB0aW1lIHdpdGgg4omlNTAlIG9mIGl0IGluIHZpZXcuXG4gICAqXG4gICAqIFRoaXMgaXMgYWxzbyBzYWZlIGZyb20gcHJlcmVuZGVyaW5nIGJlY2F1c2UgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgZW50cmllc1xuICAgKiBkbyBub3QgZmlyZSB3aGlsZSB0aGUgcGFnZSBpcyBpbiB0aGUgcHJlcmVuZGVyZWQgKGJhY2tncm91bmQpIHN0YXRlIOKAlFxuICAgKiB0aGUgcGFnZSBtdXN0IGJlIGFjdGl2ZSBhbmQgdmlzaWJsZSBmb3IgaW50ZXJzZWN0aW9ucyB0byBvY2N1ci5cbiAgICovXG4gIG9ic2VydmVBcnRpY2xlIChhcnRpY2xlRWxlbWVudCwgdGl0bGUpIHtcbiAgICBjb25zb2xlLmRlYnVnKCdbQW5hbHl0aWNzTWFuYWdlcl0gb2JzZXJ2ZUFydGljbGUgY2FsbGVkJywgeyB0aXRsZSB9KVxuICAgIGlmICghYXJ0aWNsZUVsZW1lbnQpIHJldHVyblxuXG4gICAgbGV0IGhhc1JlYWQgICAgID0gZmFsc2VcbiAgICBsZXQgdGltZVN0YXJ0ZWQgPSAwXG5cbiAgICBjb25zdCBSRUFEX1RIUkVTSE9MRF9QRVJDRU5UID0gMC41XG4gICAgY29uc3QgUkVBRF9USU1FX01TICAgICAgICAgICA9IDEwMDAwXG5cbiAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcigoZW50cmllcykgPT4ge1xuICAgICAgZW50cmllcy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgICAgaWYgKGVudHJ5LmlzSW50ZXJzZWN0aW5nICYmIGVudHJ5LmludGVyc2VjdGlvblJhdGlvID49IFJFQURfVEhSRVNIT0xEX1BFUkNFTlQpIHtcbiAgICAgICAgICBpZiAoIXRpbWVTdGFydGVkKSB0aW1lU3RhcnRlZCA9IERhdGUubm93KClcblxuICAgICAgICAgIGNvbnN0IGR3ZWxsVGltZSA9IERhdGUubm93KCkgLSB0aW1lU3RhcnRlZFxuICAgICAgICAgIGlmIChkd2VsbFRpbWUgPiBSRUFEX1RJTUVfTVMgJiYgIWhhc1JlYWQpIHtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlclJlYWRFdmVudCh0aXRsZSlcbiAgICAgICAgICAgIGhhc1JlYWQgPSB0cnVlXG4gICAgICAgICAgICBvYnNlcnZlci51bm9ic2VydmUoYXJ0aWNsZUVsZW1lbnQpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRpbWVTdGFydGVkID0gMFxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0sIHtcbiAgICAgIHRocmVzaG9sZDogWzAsIDAuMjUsIDAuNSwgMC43NSwgMV1cbiAgICB9KVxuXG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZShhcnRpY2xlRWxlbWVudClcbiAgICB0aGlzLm9ic2VydmVycy5zZXQoYXJ0aWNsZUVsZW1lbnQsIG9ic2VydmVyKVxuICAgIGNvbnNvbGUuZGVidWcoJ1tBbmFseXRpY3NNYW5hZ2VyXSBJbnRlcnNlY3Rpb25PYnNlcnZlciBhdHRhY2hlZCBmb3IgYXJ0aWNsZScsIHsgdGl0bGUgfSlcbiAgfVxuXG4gIHRyaWdnZXJSZWFkRXZlbnQgKHRpdGxlKSB7XG4gICAgaWYgKHdpbmRvdy5fcGFxKSB7XG4gICAgICB3aW5kb3cuX3BhcS5wdXNoKFsndHJhY2tFdmVudCcsICdBcnRpY2xlJywgJ1JlYWQnLCB0aXRsZV0pXG4gICAgfVxuICAgIGNvbnNvbGUubG9nKGBbQW5hbHl0aWNzXSBNYXJrZWQgYXMgcmVhZDogJHt0aXRsZX1gKVxuICB9XG5cbiAgY2xlYW51cCAoKSB7XG4gICAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaChvYnMgPT4gb2JzLmRpc2Nvbm5lY3QoKSlcbiAgICB0aGlzLm9ic2VydmVycy5jbGVhcigpXG4gIH1cbn1cbiIsIi8qKlxuICogaGFwdGljLmpzXG4gKiBDb3JlIGhhcHRpYyBlbmdpbmUgcG9ydGVkIGZyb20gd2ViLWhhcHRpY3MgKE1JVCDCqSBsb2NoaWUpLlxuICogaHR0cHM6Ly9naXRodWIuY29tL2xvY2hpZS93ZWItaGFwdGljc1xuICpcbiAqIFByZXNldCByZWZlcmVuY2UgKEFwcGxlIEhJRyBhbGlnbmVkKTpcbiAqXG4gKiBOb3RpZmljYXRpb24gIOKGkiBcInN1Y2Nlc3NcIiAgICB0d28gYXNjZW5kaW5nIHRhcHMg4oCUIHBvc2l0aXZlIG91dGNvbWVcbiAqICAgICAgICAgICAgICAg4oaSIFwid2FybmluZ1wiICAgIHR3byB0YXBzIHdpdGggaGVzaXRhdGlvbiDigJQgY2F1dGlvbiBhaGVhZFxuICogICAgICAgICAgICAgICDihpIgXCJlcnJvclwiICAgICAgZm91ciByYXBpZCBoYXJzaCB0YXBzIOKAlCBmYWlsdXJlXG4gKlxuICogSW1wYWN0ICAgICAgICDihpIgXCJsaWdodFwiICAgICAgc2luZ2xlIHNob3J0IHRhcCDigJQgbWlub3IgaW50ZXJhY3Rpb25cbiAqICAgICAgICAgICAgICAg4oaSIFwibWVkaXVtXCIgICAgIG1vZGVyYXRlIHRhcCDigJQgc3RhbmRhcmQgYnV0dG9uIHByZXNzXG4gKiAgICAgICAgICAgICAgIOKGkiBcImhlYXZ5XCIgICAgICBzdHJvbmcgdGFwIOKAlCBtYWpvciBzdGF0ZSBjaGFuZ2VcbiAqICAgICAgICAgICAgICAg4oaSIFwic29mdFwiICAgICAgIGN1c2hpb25lZCB0YXAg4oCUIHJvdW5kZWQgZmVlbFxuICogICAgICAgICAgICAgICDihpIgXCJyaWdpZFwiICAgICAgY3Jpc3AgaGFyZCB0YXAg4oCUIHByZWNpc2UgZmVlbFxuICpcbiAqIFNlbGVjdGlvbiAgICAg4oaSIFwic2VsZWN0aW9uXCIgIHN1YnRsZSB0aWNrIOKAlCBwaWNrZXIgLyBzbGlkZXIgc3RlcFxuICpcbiAqIEN1c3RvbSAgICAgICAg4oaSIFwibnVkZ2VcIiAgICAgIHN0cm9uZyB0YXAgKyBzb2Z0IHRhaWxcbiAqICAgICAgICAgICAgICAg4oaSIFwiYnV6elwiICAgICAgIGxvbmcgdmlicmF0aW9uXG4gKi9cblxuLy8g4pSA4pSA4pSAIFBhdHRlcm5zIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG5leHBvcnQgY29uc3QgZGVmYXVsdFBhdHRlcm5zID0ge1xuICAvLyBOb3RpZmljYXRpb25cbiAgc3VjY2VzczogICB7IHBhdHRlcm46IFt7IGR1cmF0aW9uOiAzMCwgaW50ZW5zaXR5OiAwLjUgfSwgeyBkZWxheTogNjAsICBkdXJhdGlvbjogNDAsIGludGVuc2l0eTogMSAgIH1dIH0sXG4gIHdhcm5pbmc6ICAgeyBwYXR0ZXJuOiBbeyBkdXJhdGlvbjogNDAsIGludGVuc2l0eTogMC44IH0sIHsgZGVsYXk6IDEwMCwgZHVyYXRpb246IDQwLCBpbnRlbnNpdHk6IDAuNiB9XSB9LFxuICBlcnJvcjogICAgIHsgcGF0dGVybjogW3sgZHVyYXRpb246IDQwLCBpbnRlbnNpdHk6IDAuNyB9LCB7IGRlbGF5OiA0MCwgIGR1cmF0aW9uOiA0MCwgaW50ZW5zaXR5OiAwLjcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgeyBkZWxheTogNDAsICBkdXJhdGlvbjogNDAsIGludGVuc2l0eTogMC45IH0sIHsgZGVsYXk6IDQwLCBkdXJhdGlvbjogNTAsIGludGVuc2l0eTogMC42IH1dIH0sXG4gIC8vIEltcGFjdFxuICBsaWdodDogICAgIHsgcGF0dGVybjogW3sgZHVyYXRpb246IDE1LCBpbnRlbnNpdHk6IDAuNCB9XSB9LFxuICBtZWRpdW06ICAgIHsgcGF0dGVybjogW3sgZHVyYXRpb246IDI1LCBpbnRlbnNpdHk6IDAuNyB9XSB9LFxuICBoZWF2eTogICAgIHsgcGF0dGVybjogW3sgZHVyYXRpb246IDM1LCBpbnRlbnNpdHk6IDEgICB9XSB9LFxuICBzb2Z0OiAgICAgIHsgcGF0dGVybjogW3sgZHVyYXRpb246IDQwLCBpbnRlbnNpdHk6IDAuNSB9XSB9LFxuICByaWdpZDogICAgIHsgcGF0dGVybjogW3sgZHVyYXRpb246IDEwLCBpbnRlbnNpdHk6IDEgICB9XSB9LFxuICAvLyBTZWxlY3Rpb25cbiAgc2VsZWN0aW9uOiB7IHBhdHRlcm46IFt7IGR1cmF0aW9uOiA4LCAgaW50ZW5zaXR5OiAwLjMgfV0gfSxcbiAgLy8gQ3VzdG9tXG4gIG51ZGdlOiAgICAgeyBwYXR0ZXJuOiBbeyBkdXJhdGlvbjogODAsIGludGVuc2l0eTogMC44IH0sIHsgZGVsYXk6IDgwLCBkdXJhdGlvbjogNTAsIGludGVuc2l0eTogMC4zIH1dIH0sXG4gIGJ1eno6ICAgICAgeyBwYXR0ZXJuOiBbeyBkdXJhdGlvbjogMTAwMCwgaW50ZW5zaXR5OiAxIH1dIH0sXG59XG5cbi8vIOKUgOKUgOKUgCBJbnRlcm5hbCBjb25zdGFudHMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbmNvbnN0IFRPR0dMRV9NSU4gICA9IDE2ICAgIC8vIG1zIGF0IGludGVuc2l0eSAxIChldmVyeSBmcmFtZSlcbmNvbnN0IFRPR0dMRV9NQVggICA9IDE4NCAgIC8vIHJhbmdlIGFib3ZlIG1pbiAgKDAuNSDiiYggMTAwbXMpXG5jb25zdCBNQVhfUEhBU0VfTVMgPSAxMDAwICAvLyBicm93c2VyIGhhcHRpYyB3aW5kb3cgbGltaXRcbmNvbnN0IFBXTV9DWUNMRSAgICA9IDIwICAgIC8vIG1zIHBlciBpbnRlbnNpdHkgbW9kdWxhdGlvbiBjeWNsZVxuXG4vLyDilIDilIDilIAgSW50ZXJuYWwgaGVscGVycyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuZnVuY3Rpb24gbm9ybWFsaXplSW5wdXQgKGlucHV0KSB7XG4gIGlmIChpbnB1dCA9PSBudWxsKSByZXR1cm4geyB2aWJyYXRpb25zOiBbeyBkdXJhdGlvbjogMjUsIGludGVuc2l0eTogMC43IH1dIH0gLy8gbWVkaXVtIGRlZmF1bHRcbiAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ251bWJlcicpIHJldHVybiB7IHZpYnJhdGlvbnM6IFt7IGR1cmF0aW9uOiBpbnB1dCB9XSB9XG4gIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uc3QgcHJlc2V0ID0gZGVmYXVsdFBhdHRlcm5zW2lucHV0XVxuICAgIGlmICghcHJlc2V0KSB7IGNvbnNvbGUud2FybihgW3dlYi1oYXB0aWNzXSBVbmtub3duIHByZXNldDogXCIke2lucHV0fVwiYCk7IHJldHVybiBudWxsIH1cbiAgICByZXR1cm4geyB2aWJyYXRpb25zOiBwcmVzZXQucGF0dGVybi5tYXAodiA9PiAoeyAuLi52IH0pKSB9XG4gIH1cbiAgaWYgKEFycmF5LmlzQXJyYXkoaW5wdXQpKSB7XG4gICAgaWYgKCFpbnB1dC5sZW5ndGgpIHJldHVybiB7IHZpYnJhdGlvbnM6IFtdIH1cbiAgICBpZiAodHlwZW9mIGlucHV0WzBdID09PSAnbnVtYmVyJykge1xuICAgICAgY29uc3QgdmlicmF0aW9ucyA9IFtdXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Lmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgIGNvbnN0IGRlbGF5ID0gaSA+IDAgPyBpbnB1dFtpIC0gMV0gOiAwXG4gICAgICAgIHZpYnJhdGlvbnMucHVzaCh7IC4uLihkZWxheSA+IDAgJiYgeyBkZWxheSB9KSwgZHVyYXRpb246IGlucHV0W2ldIH0pXG4gICAgICB9XG4gICAgICByZXR1cm4geyB2aWJyYXRpb25zIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgdmlicmF0aW9uczogaW5wdXQubWFwKHYgPT4gKHsgLi4udiB9KSkgfVxuICB9XG4gIGlmIChpbnB1dCAmJiBpbnB1dC5wYXR0ZXJuKSByZXR1cm4geyB2aWJyYXRpb25zOiBpbnB1dC5wYXR0ZXJuLm1hcCh2ID0+ICh7IC4uLnYgfSkpIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuZnVuY3Rpb24gbW9kdWxhdGVWaWJyYXRpb24gKGR1cmF0aW9uLCBpbnRlbnNpdHkpIHtcbiAgaWYgKGludGVuc2l0eSA+PSAxKSByZXR1cm4gW2R1cmF0aW9uXVxuICBpZiAoaW50ZW5zaXR5IDw9IDApIHJldHVybiBbXVxuICBjb25zdCBvblRpbWUgPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKFBXTV9DWUNMRSAqIGludGVuc2l0eSkpXG4gIGNvbnN0IG9mZlRpbWUgPSBQV01fQ1lDTEUgLSBvblRpbWVcbiAgY29uc3QgcmVzdWx0ID0gW11cbiAgbGV0IHJlbWFpbmluZyA9IGR1cmF0aW9uXG4gIHdoaWxlIChyZW1haW5pbmcgPj0gUFdNX0NZQ0xFKSB7IHJlc3VsdC5wdXNoKG9uVGltZSwgb2ZmVGltZSk7IHJlbWFpbmluZyAtPSBQV01fQ1lDTEUgfVxuICBpZiAocmVtYWluaW5nID4gMCkge1xuICAgIGNvbnN0IHJlbU9uID0gTWF0aC5tYXgoMSwgTWF0aC5yb3VuZChyZW1haW5pbmcgKiBpbnRlbnNpdHkpKVxuICAgIHJlc3VsdC5wdXNoKHJlbU9uKVxuICAgIGNvbnN0IHJlbU9mZiA9IHJlbWFpbmluZyAtIHJlbU9uXG4gICAgaWYgKHJlbU9mZiA+IDApIHJlc3VsdC5wdXNoKHJlbU9mZilcbiAgfVxuICByZXR1cm4gcmVzdWx0XG59XG5cbmZ1bmN0aW9uIHRvVmlicmF0ZVBhdHRlcm4gKHZpYnJhdGlvbnMsIGRlZmF1bHRJbnRlbnNpdHkpIHtcbiAgY29uc3QgcmVzdWx0ID0gW11cbiAgZm9yIChjb25zdCB2aWIgb2YgdmlicmF0aW9ucykge1xuICAgIGNvbnN0IGludGVuc2l0eSA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIHZpYi5pbnRlbnNpdHkgPz8gZGVmYXVsdEludGVuc2l0eSkpXG4gICAgY29uc3QgZGVsYXkgICAgID0gdmliLmRlbGF5ID8/IDBcbiAgICBpZiAoZGVsYXkgPiAwKSB7XG4gICAgICBpZiAocmVzdWx0Lmxlbmd0aCAmJiByZXN1bHQubGVuZ3RoICUgMiA9PT0gMCkgcmVzdWx0W3Jlc3VsdC5sZW5ndGggLSAxXSArPSBkZWxheVxuICAgICAgZWxzZSB7IGlmICghcmVzdWx0Lmxlbmd0aCkgcmVzdWx0LnB1c2goMCk7IHJlc3VsdC5wdXNoKGRlbGF5KSB9XG4gICAgfVxuICAgIGNvbnN0IG1vZHVsYXRlZCA9IG1vZHVsYXRlVmlicmF0aW9uKHZpYi5kdXJhdGlvbiwgaW50ZW5zaXR5KVxuICAgIGlmICghbW9kdWxhdGVkLmxlbmd0aCkge1xuICAgICAgaWYgKHJlc3VsdC5sZW5ndGggJiYgcmVzdWx0Lmxlbmd0aCAlIDIgPT09IDApIHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMV0gKz0gdmliLmR1cmF0aW9uXG4gICAgICBlbHNlIGlmICh2aWIuZHVyYXRpb24gPiAwKSByZXN1bHQucHVzaCgwLCB2aWIuZHVyYXRpb24pXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IHNlZyBvZiBtb2R1bGF0ZWQpIHJlc3VsdC5wdXNoKHNlZylcbiAgfVxuICByZXR1cm4gcmVzdWx0XG59XG5cbi8vIOKUgOKUgOKUgCBXZWJIYXB0aWNzIGNsYXNzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG5sZXQgX2luc3RhbmNlQ291bnRlciA9IDBcblxuZXhwb3J0IGNsYXNzIFdlYkhhcHRpY3Mge1xuICBjb25zdHJ1Y3RvciAob3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5faWQgICAgICAgPSArK19pbnN0YW5jZUNvdW50ZXJcbiAgICB0aGlzLl9kZWJ1ZyAgICA9IG9wdGlvbnMuZGVidWcgPz8gZmFsc2VcbiAgICB0aGlzLl9sYWJlbCAgICA9IG51bGxcbiAgICB0aGlzLl9kb21SZWFkeSA9IGZhbHNlXG4gICAgdGhpcy5fcmFmSWQgICAgPSBudWxsXG4gICAgdGhpcy5fcmVzb2x2ZSAgPSBudWxsXG4gIH1cblxuICBzdGF0aWMgZ2V0IGlzU3VwcG9ydGVkICgpIHtcbiAgICByZXR1cm4gdHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG5hdmlnYXRvci52aWJyYXRlID09PSAnZnVuY3Rpb24nXG4gIH1cblxuICAvLyBUaGUgY2hlY2tib3gtc3dpdGNoIHRyaWNrIGJlbG93IG9ubHkgcHJvZHVjZXMgYSByZWFsIGhhcHRpYyBvbiBpT1MvaVBhZE9TLFxuICAvLyB3aGVyZSBTYWZhcmkgbWFwcyBhIDxpbnB1dCBzd2l0Y2g+IHRvZ2dsZSBvbnRvIHRoZSBuYXRpdmUgSElHIHRpY2suIEl0IHdhc1xuICAvLyBwcmV2aW91c2x5IGdhdGVkIG9uIGAhaXNTdXBwb3J0ZWRgLCB3aGljaCBpcyBBTFNPIHRydWUgb24gZGVza3RvcCBGaXJlZm94XG4gIC8vIGFuZCBkZXNrdG9wIFNhZmFyaSAobmVpdGhlciBpbXBsZW1lbnRzIG5hdmlnYXRvci52aWJyYXRlKS4gT24gdGhvc2UgdGhlXG4gIC8vIHRyaWNrIGJ1eXMgbm90aGluZyBhbmQgY29zdHMgYSBsb3Q6IGNsaWNraW5nIHRoZSBsYWJlbCBmb2N1c2VzIHRoZSBoaWRkZW5cbiAgLy8gY2hlY2tib3ggYXQgdGhlIGVuZCBvZiA8Ym9keT4sIHdoaWNoIHNjcm9sbHMgdGhlIGRvY3VtZW50IHRvIHRoZSBib3R0b20gYW5kXG4gIC8vIHN0ZWFscyBmb2N1cyBmcm9tIHdoYXRldmVyIHRoZSByZWFkZXIgd2FzIHVzaW5nIC0tIG5vdGFibHkgdGhlIEdob3N0IFBvcnRhbFxuICAvLyBzaWduLWluIGlmcmFtZSwgd2hvc2UgaW5wdXQgdGhlbiBzaWxlbnRseSByZWZ1c2VzIHR5cGluZyBhbmQgcGFzdGluZy5cbiAgc3RhdGljIGdldCBfdXNlc1N3aXRjaEZhbGxiYWNrICgpIHtcbiAgICBpZiAodHlwZW9mIG5hdmlnYXRvciA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiBmYWxzZVxuICAgIGNvbnN0IHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudCB8fCAnJ1xuICAgIC8vIGlQaG9uZS9pUG9kL2lQYWQsIHBsdXMgaVBhZE9TIDEzKyB3aGljaCByZXBvcnRzIGl0c2VsZiBhcyBcIk1hY2ludG9zaFwiLlxuICAgIHJldHVybiAvaVAoaG9uZXxvZHxhZCkvLnRlc3QodWEpIHx8XG4gICAgICAgICAgICgvTWFjaW50b3NoLy50ZXN0KHVhKSAmJiAobmF2aWdhdG9yLm1heFRvdWNoUG9pbnRzIHx8IDApID4gMSlcbiAgfVxuXG4gIGFzeW5jIHRyaWdnZXIgKGlucHV0LCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBub3JtYWxpemVkID0gbm9ybWFsaXplSW5wdXQoaW5wdXQpXG4gICAgaWYgKCFub3JtYWxpemVkKSByZXR1cm5cbiAgICBjb25zdCB7IHZpYnJhdGlvbnMgfSA9IG5vcm1hbGl6ZWRcbiAgICBpZiAoIXZpYnJhdGlvbnMubGVuZ3RoKSByZXR1cm5cblxuICAgIGNvbnN0IGRlZmF1bHRJbnRlbnNpdHkgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBvcHRpb25zLmludGVuc2l0eSA/PyAwLjUpKVxuXG4gICAgZm9yIChjb25zdCB2aWIgb2YgdmlicmF0aW9ucykge1xuICAgICAgaWYgKHZpYi5kdXJhdGlvbiA+IE1BWF9QSEFTRV9NUykgdmliLmR1cmF0aW9uID0gTUFYX1BIQVNFX01TXG4gICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZSh2aWIuZHVyYXRpb24pIHx8IHZpYi5kdXJhdGlvbiA8IDAgfHxcbiAgICAgICAgICAodmliLmRlbGF5ICE9PSB1bmRlZmluZWQgJiYgKCFOdW1iZXIuaXNGaW5pdGUodmliLmRlbGF5KSB8fCB2aWIuZGVsYXkgPCAwKSkpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdbd2ViLWhhcHRpY3NdIEludmFsaWQgdmlicmF0aW9uIHZhbHVlcyDigJQgc2tpcHBpbmcuJylcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKFdlYkhhcHRpY3MuaXNTdXBwb3J0ZWQpIHtcbiAgICAgIG5hdmlnYXRvci52aWJyYXRlKHRvVmlicmF0ZVBhdHRlcm4odmlicmF0aW9ucywgZGVmYXVsdEludGVuc2l0eSkpXG4gICAgfVxuXG4gICAgLy8gaU9TIC8gU2FmYXJpOiB1c2UgdGhlIGNoZWNrYm94LXN3aXRjaCB0cmljayAoZmlyZXMgbmF0aXZlIEhJRyBoYXB0aWMpXG4gICAgaWYgKCghV2ViSGFwdGljcy5pc1N1cHBvcnRlZCAmJiBXZWJIYXB0aWNzLl91c2VzU3dpdGNoRmFsbGJhY2spIHx8IHRoaXMuX2RlYnVnKSB7XG4gICAgICB0aGlzLl9lbnN1cmVET00oKVxuICAgICAgaWYgKCF0aGlzLl9sYWJlbCkgcmV0dXJuXG4gICAgICB0aGlzLl9zdG9wUGF0dGVybigpXG4gICAgICBjb25zdCBmaXJzdERlbGF5ICAgICAgPSB2aWJyYXRpb25zWzBdPy5kZWxheSA/PyAwXG4gICAgICBjb25zdCBmaXJzdENsaWNrRmlyZWQgPSBmaXJzdERlbGF5ID09PSAwXG4gICAgICBpZiAoZmlyc3RDbGlja0ZpcmVkKSB0aGlzLl90aWNrKClcbiAgICAgIGF3YWl0IHRoaXMuX3J1blBhdHRlcm4odmlicmF0aW9ucywgZGVmYXVsdEludGVuc2l0eSwgZmlyc3RDbGlja0ZpcmVkKVxuICAgIH1cbiAgfVxuXG4gIGNhbmNlbCAoKSB7XG4gICAgdGhpcy5fc3RvcFBhdHRlcm4oKVxuICAgIGlmIChXZWJIYXB0aWNzLmlzU3VwcG9ydGVkKSBuYXZpZ2F0b3IudmlicmF0ZSgwKVxuICB9XG5cbiAgZGVzdHJveSAoKSB7XG4gICAgdGhpcy5fc3RvcFBhdHRlcm4oKVxuICAgIGlmICh0aGlzLl9sYWJlbCkgeyB0aGlzLl9sYWJlbC5yZW1vdmUoKTsgdGhpcy5fbGFiZWwgPSBudWxsOyB0aGlzLl9kb21SZWFkeSA9IGZhbHNlIH1cbiAgfVxuXG4gIF9zdG9wUGF0dGVybiAoKSB7XG4gICAgaWYgKHRoaXMuX3JhZklkICE9PSBudWxsKSB7IGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3JhZklkKTsgdGhpcy5fcmFmSWQgPSBudWxsIH1cbiAgICBpZiAodGhpcy5fcmVzb2x2ZSkgeyB0aGlzLl9yZXNvbHZlKCk7IHRoaXMuX3Jlc29sdmUgPSBudWxsIH1cbiAgfVxuXG4gIF9ydW5QYXR0ZXJuICh2aWJyYXRpb25zLCBkZWZhdWx0SW50ZW5zaXR5LCBmaXJzdENsaWNrRmlyZWQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICB0aGlzLl9yZXNvbHZlID0gcmVzb2x2ZVxuICAgICAgY29uc3QgcGhhc2VzICA9IFtdXG4gICAgICBsZXQgY3VtdWxhdGl2ZSA9IDBcbiAgICAgIGZvciAoY29uc3QgdmliIG9mIHZpYnJhdGlvbnMpIHtcbiAgICAgICAgY29uc3QgaW50ZW5zaXR5ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgdmliLmludGVuc2l0eSA/PyBkZWZhdWx0SW50ZW5zaXR5KSlcbiAgICAgICAgY29uc3QgZGVsYXkgICAgID0gdmliLmRlbGF5ID8/IDBcbiAgICAgICAgaWYgKGRlbGF5ID4gMCkgeyBjdW11bGF0aXZlICs9IGRlbGF5OyBwaGFzZXMucHVzaCh7IGVuZDogY3VtdWxhdGl2ZSwgaXNPbjogZmFsc2UsIGludGVuc2l0eTogMCB9KSB9XG4gICAgICAgIGN1bXVsYXRpdmUgKz0gdmliLmR1cmF0aW9uXG4gICAgICAgIHBoYXNlcy5wdXNoKHsgZW5kOiBjdW11bGF0aXZlLCBpc09uOiB0cnVlLCBpbnRlbnNpdHkgfSlcbiAgICAgIH1cbiAgICAgIGNvbnN0IHRvdGFsRHVyYXRpb24gPSBjdW11bGF0aXZlXG4gICAgICBsZXQgc3RhcnRUaW1lID0gMCwgbGFzdFRvZ2dsZVRpbWUgPSAtMVxuXG4gICAgICBjb25zdCBsb29wID0gdGltZSA9PiB7XG4gICAgICAgIGlmICghc3RhcnRUaW1lKSBzdGFydFRpbWUgPSB0aW1lXG4gICAgICAgIGNvbnN0IGVsYXBzZWQgPSB0aW1lIC0gc3RhcnRUaW1lXG4gICAgICAgIGlmIChlbGFwc2VkID49IHRvdGFsRHVyYXRpb24pIHsgdGhpcy5fcmFmSWQgPSBudWxsOyB0aGlzLl9yZXNvbHZlID0gbnVsbDsgcmVzb2x2ZSgpOyByZXR1cm4gfVxuXG4gICAgICAgIGxldCBwaGFzZSA9IHBoYXNlc1swXVxuICAgICAgICBmb3IgKGNvbnN0IHAgb2YgcGhhc2VzKSB7IGlmIChlbGFwc2VkIDwgcC5lbmQpIHsgcGhhc2UgPSBwOyBicmVhayB9IH1cblxuICAgICAgICBpZiAocGhhc2UuaXNPbikge1xuICAgICAgICAgIGNvbnN0IGludGVydmFsID0gVE9HR0xFX01JTiArICgxIC0gcGhhc2UuaW50ZW5zaXR5KSAqIFRPR0dMRV9NQVhcbiAgICAgICAgICBpZiAobGFzdFRvZ2dsZVRpbWUgPT09IC0xKSB7XG4gICAgICAgICAgICBsYXN0VG9nZ2xlVGltZSA9IHRpbWVcbiAgICAgICAgICAgIGlmICghZmlyc3RDbGlja0ZpcmVkKSB7IHRoaXMuX3RpY2soKTsgZmlyc3RDbGlja0ZpcmVkID0gdHJ1ZSB9XG4gICAgICAgICAgfSBlbHNlIGlmICh0aW1lIC0gbGFzdFRvZ2dsZVRpbWUgPj0gaW50ZXJ2YWwpIHtcbiAgICAgICAgICAgIHRoaXMuX3RpY2soKVxuICAgICAgICAgICAgbGFzdFRvZ2dsZVRpbWUgPSB0aW1lXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3JhZklkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3ApXG4gICAgICB9XG4gICAgICB0aGlzLl9yYWZJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wKVxuICAgIH0pXG4gIH1cblxuICAvLyBGaXJlcyB0aGUgc3dpdGNoIHRvZ2dsZSB3aXRob3V0IGxldHRpbmcgaXQgZGlzdHVyYiB0aGUgcGFnZS4gQ2xpY2tpbmcgYVxuICAvLyA8bGFiZWw+IGZvcndhcmRzIHRoZSBjbGljayB0byBpdHMgY2hlY2tib3gsIHdoaWNoIEZPQ1VTRVMgdGhhdCBjaGVja2JveCAtLVxuICAvLyBhbmQgZm9jdXNpbmcgYW4gZWxlbWVudCBzY3JvbGxzIGl0IGludG8gdmlldy4gQm90aCBlZmZlY3RzIGFyZSByZXN0b3JlZFxuICAvLyBzeW5jaHJvbm91c2x5IGhlcmUgc28gdGhlIHJlYWRlciBuZXZlciBzZWVzIHRoZW0uXG4gIF90aWNrICgpIHtcbiAgICBpZiAoIXRoaXMuX2xhYmVsKSByZXR1cm5cbiAgICBjb25zdCBkb2MgICAgPSB0aGlzLl9sYWJlbC5vd25lckRvY3VtZW50XG4gICAgY29uc3QgcHJldiAgID0gZG9jLmFjdGl2ZUVsZW1lbnRcbiAgICBjb25zdCBzY3JvbGwgPSB7IHg6IHdpbmRvdy5zY3JvbGxYLCB5OiB3aW5kb3cuc2Nyb2xsWSB9XG4gICAgdGhpcy5fbGFiZWwuY2xpY2soKVxuICAgIGlmIChkb2MuYWN0aXZlRWxlbWVudCAhPT0gcHJldikge1xuICAgICAgaWYgKHByZXYgJiYgdHlwZW9mIHByZXYuZm9jdXMgPT09ICdmdW5jdGlvbicpIHByZXYuZm9jdXMoeyBwcmV2ZW50U2Nyb2xsOiB0cnVlIH0pXG4gICAgICBlbHNlIGlmIChkb2MuYWN0aXZlRWxlbWVudCAmJiB0eXBlb2YgZG9jLmFjdGl2ZUVsZW1lbnQuYmx1ciA9PT0gJ2Z1bmN0aW9uJykgZG9jLmFjdGl2ZUVsZW1lbnQuYmx1cigpXG4gICAgfVxuICAgIGlmICh3aW5kb3cuc2Nyb2xsWCAhPT0gc2Nyb2xsLnggfHwgd2luZG93LnNjcm9sbFkgIT09IHNjcm9sbC55KSB7XG4gICAgICB3aW5kb3cuc2Nyb2xsVG8oc2Nyb2xsLngsIHNjcm9sbC55KVxuICAgIH1cbiAgfVxuXG4gIF9lbnN1cmVET00gKCkge1xuICAgIGlmICh0aGlzLl9kb21SZWFkeSB8fCB0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnKSByZXR1cm5cbiAgICBjb25zdCBpZCAgICAgICA9IGB3ZWItaGFwdGljcy0ke3RoaXMuX2lkfWBcbiAgICBjb25zdCBsYWJlbCAgICA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJylcbiAgICBsYWJlbC5odG1sRm9yICA9IGlkXG4gICAgbGFiZWwuc3R5bGUuY3NzVGV4dCA9ICdwb3NpdGlvbjpmaXhlZDt0b3A6MDtsZWZ0OjA7d2lkdGg6MDtoZWlnaHQ6MDtvcGFjaXR5OjA7cG9pbnRlci1ldmVudHM6bm9uZTtvdmVyZmxvdzpoaWRkZW4nXG4gICAgY29uc3QgY2hlY2tib3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpXG4gICAgY2hlY2tib3gudHlwZSAgPSAnY2hlY2tib3gnXG4gICAgY2hlY2tib3guaWQgICAgPSBpZFxuICAgIGNoZWNrYm94LnNldEF0dHJpYnV0ZSgnc3dpdGNoJywgJycpXG4gICAgY2hlY2tib3guc3R5bGUuY3NzVGV4dCA9ICdwb3NpdGlvbjpmaXhlZDt0b3A6MDtsZWZ0OjA7d2lkdGg6MDtoZWlnaHQ6MDtvcGFjaXR5OjA7cG9pbnRlci1ldmVudHM6bm9uZSdcbiAgICBsYWJlbC5hcHBlbmRDaGlsZChjaGVja2JveClcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxhYmVsKVxuICAgIHRoaXMuX2xhYmVsICAgID0gbGFiZWxcbiAgICB0aGlzLl9kb21SZWFkeSA9IHRydWVcbiAgfVxufVxuXG4vLyDilIDilIDilIAgU2hhcmVkIHNpbmdsZXRvbiB1c2VkIGJ5IGhhcHRpYy1mZWVkYmFjay5qcyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbmV4cG9ydCBjb25zdCBoYXB0aWNzID0gbmV3IFdlYkhhcHRpY3MoKSIsIi8qKlxuICogbWVpbGlzZWFyY2guanNcbiAqXG4gKiBGdWxsIE1laWxpU2VhcmNoIGludGVncmF0aW9uIOKAlCBpbml0LCBjbGljayBpbnRlcmNlcHRpb24sIGhhcHRpY3MsIGFuaW1hdGlvbi5cbiAqXG4gKiDilIDilIDilIAgUm9sbGJhY2sg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4gKiBUbyBzd2l0Y2ggYmFjayB0byB0aGUgdGhlbWUncyBuYXRpdmUgRmxleFNlYXJjaDpcbiAqICAgMS4gU2V0IE1FSUxJU0VBUkNIX0VOQUJMRUQgPSBmYWxzZSBiZWxvd1xuICogICAyLiBSZW1vdmUgdGhlIENETiA8c2NyaXB0PiBhbmQgPGxpbms+IGZyb20gZGVmYXVsdC5oYnNcbiAqICAgMy4gUmVidWlsZFxuICogRXZlcnl0aGluZyBlbHNlIChoZWFkZXIgYnV0dG9ucywgQ1NTIHNlbGVjdG9ycykgc3RheXMgdGhlIHNhbWUuXG4gKlxuICog4pSA4pSA4pSAIEFuaW1hdGlvbiBzdHJhdGVneSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbiAqIFRoZSBsaWJyYXJ5IG1vdW50cyBpdHMgY29udGFpbmVyIGRpdiBkdXJpbmcgaW5pdGlhbGl6ZSgpLCBOT1Qgb24gZmlyc3RcbiAqIG9wZW4oKS4gU28gYnkgdGhlIHRpbWUgdGhlIHVzZXIgY2xpY2tzLCB0aGUgY29udGFpbmVyIGFscmVhZHkgZXhpc3RzIGluIHRoZVxuICogRE9NIGFuZCBhIE11dGF0aW9uT2JzZXJ2ZXIgd2F0Y2hpbmcgZm9yIG5ldyBib2R5IGNoaWxkcmVuIG5ldmVyIGZpcmVzLlxuICpcbiAqIEluc3RlYWQ6XG4gKiAgIDEuIEFmdGVyIGluaXRpYWxpemUoKSwgcG9sbCBmb3IgdGhlIGNvbnRhaW5lciB3aXRoIGZpbmRDb250YWluZXIoKVxuICogICAyLiBTYXZlIGl0IGFzIF9zZWFyY2hDb250YWluZXJcbiAqICAgMy4gT24gZXZlcnkgb3BlbigpIGNhbGwsIHJlLXRyaWdnZXIgdGhlIENTUyBrZXlmcmFtZSB2aWEgYSBmb3JjZWQgcmVmbG93XG4gKiAgICAgICh2b2lkIGVsLm9mZnNldFdpZHRoKSBzbyB0aGUgYW5pbWF0aW9uIHBsYXlzIGVhY2ggdGltZVxuICpcbiAqIOKUgOKUgOKUgCBIYXB0aWMgc3RyYXRlZ3kg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4gKiBVc2VzIGEgY3VzdG9tIHR3by1wdWxzZSBwYXR0ZXJuIHRvIG1hdGNoIHRoZSB2aXN1YWwgXCJzbmFwIG9wZW4sIHNldHRsZVwiXG4gKiBmZWVsIG9mIHRoZSBzbGlkZSBhbmltYXRpb24gcmF0aGVyIHRoYW4gdGhlIGdlbmVyaWMgc2luZ2xlIHRhcCB1c2VkIGJ5XG4gKiBvdGhlciBidXR0b25zLiBUdW5lIFNFQVJDSF9IQVBUSUMgdG8gdGFzdGUuXG4gKi9cblxuaW1wb3J0IHsgaGFwdGljcyB9IGZyb20gJy4vaGFwdGljJ1xuXG4vLyDilIDilIDilIAgVG9nZ2xlIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG4vKipcbiAqIFNldCB0byBmYWxzZSB0byBkaXNhYmxlIE1laWxpU2VhcmNoIGFuZCBmYWxsIGJhY2sgdG8gdGhlIHRoZW1lJ3MgbmF0aXZlXG4gKiBGbGV4U2VhcmNoLiBtYWluLmpzIHJlYWRzIHRoaXMgZmxhZyB0byBkZWNpZGUgd2hldGhlciB0byBsb2FkIHNlYXJjaC5qcy5cbiAqL1xuZXhwb3J0IGNvbnN0IE1FSUxJU0VBUkNIX0VOQUJMRUQgPSB0cnVlXG5cbi8vIOKUgOKUgOKUgCBDb25maWcg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbmNvbnN0IE1TX0NPTkZJRyA9IHtcbiAgbWVpbGlzZWFyY2hIb3N0OiAgICdodHRwczovL200NC5jbC9zZWFyY2gnLFxuICBtZWlsaXNlYXJjaEFwaUtleTogJzI3YzhmZmE2OGVmNDA0NWY2MTE2YmEyMjQ5OGIxYTE5YTE5YWNjNmYwMGQ1ODY3OGQ0ZWU4ZjUyODEwZmQyYmEnLFxuICBpbmRleE5hbWU6ICAgICAgICAgJ2dob3N0X3Bvc3RzJyxcbiAgdGhlbWU6ICAgICAgICAgICAgICdzeXN0ZW0nLCAgLy8gJ2xpZ2h0JyB8ICdkYXJrJyB8ICdzeXN0ZW0nXG59XG5cbi8qKlxuICogSGFwdGljIHBhdHRlcm4gZm9yIG9wZW5pbmcgc2VhcmNoLlxuICogQSBzaGFycCBzbmFwIChpbnRlbnNpdHkgMC45LCAyNSBtcykgZm9sbG93ZWQgYnkgYSBzb2Z0IHNldHRsZVxuICogKGludGVuc2l0eSAwLjI1LCAxNSBtcyBhZnRlciA1MCBtcyBnYXApIOKAlCBtaXJyb3JzIHRoZSBmYXN0LWluIC9cbiAqIHNsb3ctb3V0IGZlZWwgb2YgdGhlIG1zLXNsaWRlLWluIENTUyBhbmltYXRpb24uXG4gKiBTd2FwIGZvciBhbnkgcHJlc2V0IG5hbWUgKCdtZWRpdW0nLCAnbnVkZ2UnLCBldGMuKSBvciBsZWF2ZSBhcyBhXG4gKiBjdXN0b20gVmlicmF0aW9uW10gYXJyYXkuXG4gKi9cbmNvbnN0IFNFQVJDSF9IQVBUSUMgPSBbXG4gIHsgZHVyYXRpb246IDI1LCBpbnRlbnNpdHk6IDAuOSB9LFxuICB7IGRlbGF5OiA1MCwgZHVyYXRpb246IDE1LCBpbnRlbnNpdHk6IDAuMjUgfSxcbl1cblxuLy8g4pSA4pSA4pSAIFN0YXRlIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG5sZXQgX3NlYXJjaENvbnRhaW5lciA9IG51bGwgIC8vIHJlZmVyZW5jZSB0byB0aGUgbW9kYWwgcm9vdCBlbGVtZW50XG5cbi8vIOKUgOKUgOKUgCBDb250YWluZXIgZGV0ZWN0aW9uIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG4vKipcbiAqIFRyeSB0byBmaW5kIHRoZSBzZWFyY2ggbW9kYWwgY29udGFpbmVyIHVzaW5nIG11bHRpcGxlIHN0cmF0ZWdpZXM6XG4gKiAgIDEuIEtub3duIElEcyB1c2VkIGJ5IEdob3N0J3Mgc29kby1zZWFyY2ggLyBjb21tb24gZm9ya3NcbiAqICAgMi4gQW55IG5ldyBjaGlsZCBvZiA8Ym9keT4gdGhhdCBhcHBlYXJlZCBzaW5jZSBgc25hcHNob3RgIHdhcyB0YWtlblxuICpcbiAqIFJldHVybnMgdGhlIGVsZW1lbnQgb3IgbnVsbC5cbiAqL1xuZnVuY3Rpb24gZmluZENvbnRhaW5lciAoc25hcHNob3QpIHtcbiAgY29uc3QgYnlJZCA9XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dob3N0LXNlYXJjaC1yb290JykgfHxcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc29kby1zZWFyY2gtcm9vdCcpICAgfHxcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1naG9zdC1zZWFyY2gtcm9vdF0nKVxuICBpZiAoYnlJZCkgcmV0dXJuIGJ5SWRcblxuICBpZiAoc25hcHNob3QpIHtcbiAgICBjb25zdCBuZXdLaWRzID0gWy4uLmRvY3VtZW50LmJvZHkuY2hpbGRyZW5dLmZpbHRlcihlbCA9PiAhc25hcHNob3QuaGFzKGVsKSlcbiAgICBpZiAobmV3S2lkcy5sZW5ndGgpIHJldHVybiBuZXdLaWRzW25ld0tpZHMubGVuZ3RoIC0gMV1cbiAgfVxuXG4gIHJldHVybiBudWxsXG59XG5cbi8qKlxuICogUG9sbCBmb3IgdGhlIGNvbnRhaW5lciBhZnRlciBpbml0aWFsaXplKCkuXG4gKiBUaGUgbGlicmFyeSBtYXkgcmVuZGVyIHRoZSBjb250YWluZXIgYXN5bmNocm9ub3VzbHkgKFJlYWN0KSwgc28gd2UgY2hlY2tcbiAqIGFjcm9zcyBzZXZlcmFsIGFuaW1hdGlvbiBmcmFtZXMgcmF0aGVyIHRoYW4gaW4gdGhlIHNhbWUgdGljay5cbiAqL1xuZnVuY3Rpb24gZGV0ZWN0Q29udGFpbmVyQWZ0ZXJJbml0IChzbmFwc2hvdCkge1xuICBsZXQgYXR0ZW1wdHMgPSAwXG4gIGNvbnN0IGNoZWNrID0gKCkgPT4ge1xuICAgIGF0dGVtcHRzKytcbiAgICBjb25zdCBmb3VuZCA9IGZpbmRDb250YWluZXIoc25hcHNob3QpXG4gICAgaWYgKGZvdW5kKSB7XG4gICAgICBfc2VhcmNoQ29udGFpbmVyID0gZm91bmRcbiAgICAgIGNvbnNvbGUuZGVidWcoJ1ttZWlsaXNlYXJjaF0gbW9kYWwgY29udGFpbmVyIGRldGVjdGVkOicsIF9zZWFyY2hDb250YWluZXIuaWQgfHwgX3NlYXJjaENvbnRhaW5lci5jbGFzc05hbWUgfHwgX3NlYXJjaENvbnRhaW5lci50YWdOYW1lKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmIChhdHRlbXB0cyA8IDE1KSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2hlY2spXG4gIH1cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNoZWNrKVxufVxuXG4vLyDilIDilIDilIAgQW5pbWF0aW9uIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG4vKipcbiAqIFRyaWdnZXIgdGhlIG1zLXNsaWRlLWluIGtleWZyYW1lIG9uIHRoZSBzZWFyY2ggY29udGFpbmVyLlxuICogUmVtb3ZpbmcgdGhlIGNsYXNzIGFuZCBmb3JjaW5nIGEgcmVmbG93IGJlZm9yZSByZS1hZGRpbmcgaXQgcmVzdGFydHNcbiAqIHRoZSBhbmltYXRpb24gY2xlYW5seSBldmVuIGlmIGl0IHdhcyBhbHJlYWR5IGFwcGxpZWQgb24gYSBwcmV2aW91cyBvcGVuLlxuICovXG5mdW5jdGlvbiBhbmltYXRlU2VhcmNoT3BlbiAoKSB7XG4gIGlmICghX3NlYXJjaENvbnRhaW5lcikgcmV0dXJuXG4gIF9zZWFyY2hDb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnbXMtc2VhcmNoLWVudGVyaW5nJylcbiAgdm9pZCBfc2VhcmNoQ29udGFpbmVyLm9mZnNldFdpZHRoICAgICAgICAgICAvLyBmb3JjZSByZWZsb3cg4oaSIHJlc3RhcnQga2V5ZnJhbWVcbiAgX3NlYXJjaENvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdtcy1zZWFyY2gtZW50ZXJpbmcnKVxuICBfc2VhcmNoQ29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2FuaW1hdGlvbmVuZCcsICgpID0+IHtcbiAgICBfc2VhcmNoQ29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ21zLXNlYXJjaC1lbnRlcmluZycpXG4gIH0sIHsgb25jZTogdHJ1ZSB9KVxufVxuXG4vKipcbiAqIEFmdGVyIGNhbGxpbmcgb3BlbigpLCByZXRyeSBmaW5kaW5nIHRoZSBjb250YWluZXIgaWYgaXQgaXNuJ3Qga25vd24geWV0LlxuICogVGhpcyBjb3ZlcnMgdGhlICh1bmxpa2VseSkgY2FzZSB3aGVyZSB0aGUgY29udGFpbmVyIGlzIGFkZGVkIG9uIGZpcnN0IG9wZW5cbiAqIHJhdGhlciB0aGFuIG9uIGluaXQuXG4gKi9cbmZ1bmN0aW9uIGFuaW1hdGVXaXRoUmV0cnkgKHNuYXBzaG90LCBhdHRlbXB0cyA9IDApIHtcbiAgaWYgKF9zZWFyY2hDb250YWluZXIpIHsgYW5pbWF0ZVNlYXJjaE9wZW4oKTsgcmV0dXJuIH1cblxuICBjb25zdCBmb3VuZCA9IGZpbmRDb250YWluZXIoc25hcHNob3QpXG4gIGlmIChmb3VuZCkgeyBfc2VhcmNoQ29udGFpbmVyID0gZm91bmQ7IGFuaW1hdGVTZWFyY2hPcGVuKCk7IHJldHVybiB9XG5cbiAgaWYgKGF0dGVtcHRzIDwgMTApIHtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gYW5pbWF0ZVdpdGhSZXRyeShzbmFwc2hvdCwgYXR0ZW1wdHMgKyAxKSlcbiAgfVxufVxuXG4vLyDilIDilIDilIAgSW5pdCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuZnVuY3Rpb24gaW5pdEluc3RhbmNlICgpIHtcbiAgaWYgKHdpbmRvdy5HaG9zdE1laWxpc2VhcmNoU2VhcmNoICYmICF3aW5kb3cuZ2hvc3RNZWlsaXNlYXJjaFNlYXJjaCkge1xuICAgIHdpbmRvdy5fX01TX1NFQVJDSF9DT05GSUdfXyAgID0gTVNfQ09ORklHXG4gICAgY29uc3Qgc25hcHNob3QgPSBuZXcgU2V0KFsuLi5kb2N1bWVudC5ib2R5LmNoaWxkcmVuXSlcbiAgICB3aW5kb3cuZ2hvc3RNZWlsaXNlYXJjaFNlYXJjaCA9IHdpbmRvdy5HaG9zdE1laWxpc2VhcmNoU2VhcmNoLmluaXRpYWxpemUoTVNfQ09ORklHKVxuICAgIC8vIEZpbmQgd2hhdGV2ZXIgdGhlIGxpYnJhcnkganVzdCBhZGRlZCB0byA8Ym9keT5cbiAgICBkZXRlY3RDb250YWluZXJBZnRlckluaXQoc25hcHNob3QpXG4gIH1cbn1cblxuLy8g4pSA4pSA4pSAIENsaWNrIGludGVyY2VwdGlvbiDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuLyoqXG4gKiBBdHRhY2ggY2FwdHVyZS1waGFzZSBsaXN0ZW5lcnMgdG8gZXZlcnkgW2RhdGEtZ2hvc3Qtc2VhcmNoXSBlbGVtZW50LlxuICogQ2FwdHVyZSBwaGFzZSBlbnN1cmVzIG91ciBoYW5kbGVyIHJ1bnMgYmVmb3JlIEdob3N0J3MgYnViYmxlLXBoYXNlIGhhbmRsZXIuXG4gKiBzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24gcHJldmVudHMgR2hvc3QncyBuYXRpdmUgc2VhcmNoIGZyb20gb3BlbmluZy5cbiAqL1xuZnVuY3Rpb24gd2lyZVNlYXJjaFRyaWdnZXJzICgpIHtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZ2hvc3Qtc2VhcmNoXScpLmZvckVhY2goZWwgPT4ge1xuICAgIGlmIChlbC5kYXRhc2V0Lm1zV2lyZWQpIHJldHVyblxuICAgIGVsLmRhdGFzZXQubXNXaXJlZCA9ICcxJ1xuXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuXG4gICAgICAvLyBIYXB0aWMgZmlyZXMgc3luY2hyb25vdXNseSDigJQgc3RpbGwgd2l0aGluIHRoZSB1c2VyIGdlc3R1cmUgY29udGV4dFxuICAgICAgLy8gcmVxdWlyZWQgYnkgaU9TIFNhZmFyaSBmb3IgdGhlIHN3aXRjaC1jaGVja2JveCB0cmljayB0byBwcm9kdWNlIGEgdGFwLlxuICAgICAgaGFwdGljcy50cmlnZ2VyKFNFQVJDSF9IQVBUSUMpXG5cbiAgICAgIC8vIFNuYXBzaG90IGJvZHkgY2hpbGRyZW4gQkVGT1JFIG9wZW4oKSBpbiBjYXNlIHRoZSBjb250YWluZXIgaXNcbiAgICAgIC8vIGFkZGVkIGxhemlseSBvbiBmaXJzdCBvcGVuIHJhdGhlciB0aGFuIGR1cmluZyBpbml0aWFsaXplKCkuXG4gICAgICBjb25zdCBzbmFwc2hvdCA9IG5ldyBTZXQoWy4uLmRvY3VtZW50LmJvZHkuY2hpbGRyZW5dKVxuICAgICAgd2luZG93Lmdob3N0TWVpbGlzZWFyY2hTZWFyY2g/Lm9wZW4oKVxuICAgICAgYW5pbWF0ZVdpdGhSZXRyeShzbmFwc2hvdClcblxuICAgIH0sIHRydWUgLyogY2FwdHVyZSBwaGFzZSAqLylcbiAgfSlcbn1cblxuLy8g4pSA4pSA4pSAIFB1YmxpYyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW5pdE1laWxpU2VhcmNoICgpIHtcbiAgaWYgKCFNRUlMSVNFQVJDSF9FTkFCTEVEKSByZXR1cm5cblxuICBpbml0SW5zdGFuY2UoKVxuICB3aXJlU2VhcmNoVHJpZ2dlcnMoKVxuXG4gIC8vIFBvbGwgaWYgdGhlIENETiBidW5kbGUgaGFzbid0IGV4ZWN1dGVkIHlldCAoZGVmZXIgaW4gZGVmYXVsdC5oYnMgbWVhbnNcbiAgLy8gaXQgcnVucyBhZnRlciBwYXJzaW5nIGJ1dCB0aW1pbmcgcmVsYXRpdmUgdG8gRE9NQ29udGVudExvYWRlZCB2YXJpZXMpXG4gIGlmICghd2luZG93Lmdob3N0TWVpbGlzZWFyY2hTZWFyY2gpIHtcbiAgICBsZXQgYXR0ZW1wdHMgPSAwXG4gICAgY29uc3QgcG9sbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGF0dGVtcHRzKytcbiAgICAgIGluaXRJbnN0YW5jZSgpXG4gICAgICBpZiAod2luZG93Lmdob3N0TWVpbGlzZWFyY2hTZWFyY2ggfHwgYXR0ZW1wdHMgPj0gMjApIGNsZWFySW50ZXJ2YWwocG9sbClcbiAgICB9LCAxMDApXG4gIH1cbn1cbiIsIi8qKlxuICogc3BlY3VsYXRpb24tcnVsZXMuanNcbiAqXG4gKiBJbmplY3RzIGEgPHNjcmlwdCB0eXBlPVwic3BlY3VsYXRpb25ydWxlc1wiPiB0YWcgdG8gZW5hYmxlIGJyb3dzZXItbmF0aXZlXG4gKiBob3Zlci10cmlnZ2VyZWQgcHJlZmV0Y2hpbmcgdmlhIHRoZSBTcGVjdWxhdGlvbiBSdWxlcyBBUEkuXG4gKlxuICogU3RyYXRlZ3k6IHByZWZldGNoIG9ubHkgKG5vdCBwcmVyZW5kZXIpIOKAlCBzYWZlciBiZWNhdXNlOlxuICogICAtIFByZWZldGNoIG9ubHkgZG93bmxvYWRzIEhUTUw7IGl0IGRvZXMgTk9UIGV4ZWN1dGUgSmF2YVNjcmlwdFxuICogICAtIE5vIHJpc2sgb2YgTWF0b21vIGRvdWJsZS1jb3VudGluZyBwYWdldmlld3NcbiAqICAgLSBObyByaXNrIG9mIHNpZGUtZWZmZWN0IHJvdXRlcyAoL2xvZ291dCwgL3NpZ25vdXQpIHRyaWdnZXJpbmcgZWFybHlcbiAqICAgLSBMb3dlciBiYW5kd2lkdGggY29zdCBvbiBtb2JpbGVcbiAqXG4gKiBFYWdlcm5lc3MgXCJtb2RlcmF0ZVwiOiBicm93c2VyIHByZWZldGNoZXMgYWZ0ZXIgdGhlIHBvaW50ZXIgaGFzIGhvdmVyZWRcbiAqIGEgbGluayBmb3IgfjIwMCBtcy4gVGhpcyBmaWx0ZXJzIG91dCBhY2NpZGVudGFsIG1vdXNlLW92ZXJzIGFuZCBhdm9pZHNcbiAqIGJsYXN0aW5nIHRoZSBzZXJ2ZXIgd2l0aCBldmVyeSBsaW5rIG9uIHRoZSBwYWdlLlxuICpcbiAqIFVwZ3JhZGUgcGF0aDogb25jZSB5b3UgY29uZmlybSBwcmVmZXRjaCBpcyB3b3JraW5nIHdlbGwgYW5kIHlvdXJcbiAqIENsb3VkZmxhcmUgd29ya2VyIHBhc3NlcyB0aHJvdWdoIHByZWZldGNoIHJlcXVlc3RzIGNsZWFubHksIHlvdSBjYW5cbiAqIHByb21vdGUgdGhlIHJ1bGUgdG8gYHByZXJlbmRlcmAgZm9yIG5lYXItaW5zdGFudCBuYXZpZ2F0aW9ucy4gSnVzdCBiZVxuICogc3VyZSB0byBhZGQgdGhlIE1hdG9tbyBwcmVyZW5kZXJpbmcgZ3VhcmQgKHNlZSBhbmFseXRpY3MuanMpIGZpcnN0LlxuICpcbiAqIOKUgOKUgOKUgCBDbG91ZGZsYXJlIFNwbGFzaCBTY3JlZW4gbm90ZSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbiAqIFByZWZldGNoIHJlcXVlc3RzIGNhcnJ5IGNvb2tpZXMsIHNvIHVzZXJzIHdobyBhbHJlYWR5IHBhc3NlZCB0aGUgc3BsYXNoXG4gKiAoY29va2llIHNldCkgYXJlIGZpbmUuIEZpcnN0LXRpbWUgdmlzaXRvcnMgbWF5IHRyaWdnZXIgdGhlIHdvcmtlciBvblxuICogcHJlZmV0Y2guIENvbmZpcm0geW91ciB3b3JrZXIgcGFzc2VzIHJlcXVlc3RzIHRoYXQgaW5jbHVkZSB0aGUgaGVhZGVyOlxuICogICBTZWMtUHVycG9zZTogcHJlZmV0Y2hcbiAqIG9yIGFkZCBhIHdvcmtlciBjaGVjayBsaWtlOlxuICogICBpZiAocmVxdWVzdC5oZWFkZXJzLmdldCgnU2VjLVB1cnBvc2UnKSA9PT0gJ3ByZWZldGNoJykgcmV0dXJuIGZldGNoKHJlcXVlc3QpXG4gKlxuICog4pSA4pSA4pSAIENTUCBub3RlIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuICogSWYgeW91IGhhdmUgYSBDb250ZW50LVNlY3VyaXR5LVBvbGljeSBoZWFkZXIsIGFkZDpcbiAqICAgc2NyaXB0LXNyYyAnaW5saW5lLXNwZWN1bGF0aW9uLXJ1bGVzJ1xuICogKFRoaXMgaXMgYSBkZWRpY2F0ZWQgQ1NQIHNvdXJjZSBleHByZXNzaW9uLCBOT1QgJ3Vuc2FmZS1pbmxpbmUnLilcbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpbml0U3BlY3VsYXRpb25SdWxlcyAoKSB7XG4gIC8vIEJhaWwgb3V0IG9uIHVuc3VwcG9ydGVkIGJyb3dzZXJzIChGaXJlZm94LCBTYWZhcmkpIOKAlCBwcm9ncmVzc2l2ZSBlbmhhbmNlbWVudC5cbiAgLy8gVGhlIHNpdGUgd29ya3MgcGVyZmVjdGx5IGZvciB0aGVtOyBDaHJvbWl1bSB1c2VycyBnZXQgdGhlIHNwZWVkIGJvb3N0LlxuICBpZiAoIUhUTUxTY3JpcHRFbGVtZW50LnN1cHBvcnRzPy4oJ3NwZWN1bGF0aW9ucnVsZXMnKSkgcmV0dXJuXG5cbiAgLy8gQXZvaWQgZG91YmxlLWluamVjdGluZyAoZS5nLiBpZiBtYWluLmpzIGlzIHNvbWVob3cgY2FsbGVkIHR3aWNlKVxuICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc2NyaXB0W3R5cGU9XCJzcGVjdWxhdGlvbnJ1bGVzXCJdJykpIHJldHVyblxuXG4gIGNvbnN0IHJ1bGVzID0ge1xuICAgIHByZWZldGNoOiBbXG4gICAgICB7XG4gICAgICAgIHNvdXJjZTogJ2RvY3VtZW50JyxcbiAgICAgICAgd2hlcmU6IHtcbiAgICAgICAgICBhbmQ6IFtcbiAgICAgICAgICAgIC8vIE9ubHkgc2FtZS1vcmlnaW4gbGlua3MgKGNyb3NzLW9yaWdpbiBpcyB0aGUgZGVmYXVsdCBicm93c2VyIGJlaGF2aW91cilcbiAgICAgICAgICAgIHsgaHJlZl9tYXRjaGVzOiAnLyonIH0sXG5cbiAgICAgICAgICAgIC8vIOKUgOKUgCBHaG9zdCBhZG1pbiAmIEFQSSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbiAgICAgICAgICAgIHsgbm90OiB7IGhyZWZfbWF0Y2hlczogJy9naG9zdC8qJyB9IH0sXG5cbiAgICAgICAgICAgIC8vIOKUgOKUgCBBdXRoIC8gbWVtYmVyc2hpcCBzaWRlLWVmZmVjdHMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4gICAgICAgICAgICB7IG5vdDogeyBocmVmX21hdGNoZXM6ICcvbG9nb3V0KicgIH0gfSxcbiAgICAgICAgICAgIHsgbm90OiB7IGhyZWZfbWF0Y2hlczogJy9zaWdub3V0KicgfSB9LFxuICAgICAgICAgICAgeyBub3Q6IHsgaHJlZl9tYXRjaGVzOiAnL3N1YnNjcmliZSonIH0gfSxcblxuICAgICAgICAgICAgLy8gUG9ydGFsIGxpbmtzIG9wZW4gYSBtb2RhbCwgbm90IGEgbmF2aWdhdGlvblxuICAgICAgICAgICAgeyBub3Q6IHsgc2VsZWN0b3JfbWF0Y2hlczogJ1tkYXRhLXBvcnRhbF0nIH0gfSxcbiAgICAgICAgICAgIHsgbm90OiB7IHNlbGVjdG9yX21hdGNoZXM6ICdbZGF0YS1tZW1iZXJzLXNpZ25vdXRdJyB9IH0sXG5cbiAgICAgICAgICAgIC8vIOKUgOKUgCBTZWFyY2ggdHJpZ2dlcnMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4gICAgICAgICAgICAvLyBUaGVzZSBvcGVuIHRoZSBNZWlsaVNlYXJjaCBtb2RhbCwgbm90IGEgcGFnZVxuICAgICAgICAgICAgeyBub3Q6IHsgc2VsZWN0b3JfbWF0Y2hlczogJ1tkYXRhLWdob3N0LXNlYXJjaF0nIH0gfSxcblxuICAgICAgICAgICAgLy8g4pSA4pSAIEhhc2ggLyBmcmFnbWVudC1vbmx5IGxpbmtzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuICAgICAgICAgICAgLy8gZS5nLiA8YSBocmVmPVwiI3NlY3Rpb25cIj4g4oCUIG5vIG5hdmlnYXRpb24gaGFwcGVuc1xuICAgICAgICAgICAgeyBub3Q6IHsgaHJlZl9tYXRjaGVzOiAnLyMqJyB9IH0sXG5cbiAgICAgICAgICAgIC8vIOKUgOKUgCBJbmZpbml0ZSBzY3JvbGwgXCJuZXh0XCIgZGF0YSBub2RlcyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbiAgICAgICAgICAgIC8vIFRoZXNlIGFyZSA8ZGl2IGRhdGEtdXJsPVwi4oCmXCI+IG5vdCByZWFsIDxhPiB0YWdzLCBzbyB0aGV5J3JlXG4gICAgICAgICAgICAvLyBhbHJlYWR5IGV4Y2x1ZGVkIOKAlCBsaXN0ZWQgaGVyZSBmb3IgY2xhcml0eVxuICAgICAgICAgICAgeyBub3Q6IHsgc2VsZWN0b3JfbWF0Y2hlczogJ1tkYXRhLW5leHQtcG9zdC1kYXRhXScgfSB9LFxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgZWFnZXJuZXNzOiAnbW9kZXJhdGUnLCAvLyBob3ZlciB+MjAwIG1zIGJlZm9yZSBwcmVmZXRjaCBmaXJlc1xuICAgICAgfVxuICAgIF1cbiAgfVxuXG4gIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpXG4gIHNjcmlwdC50eXBlID0gJ3NwZWN1bGF0aW9ucnVsZXMnXG4gIHNjcmlwdC50ZXh0Q29udGVudCA9IEpTT04uc3RyaW5naWZ5KHJ1bGVzKVxuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdClcblxuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgIGNvbnNvbGUuZGVidWcoJ1tzcGVjdWxhdGlvbi1ydWxlc10gSW5qZWN0ZWQgcHJlZmV0Y2ggcnVsZXMgKG1vZGVyYXRlIGVhZ2VybmVzcyknKVxuICB9XG59XG4iLCIvKiBnbG9iYWwgZm9sbG93U29jaWFsTWVkaWEgc2l0ZVNlYXJjaCAqL1xuXG4vLyBsaWJcbmltcG9ydCAnbGF6eXNpemVzJ1xuXG5pbXBvcnQgc29jaWFsTWVkaWEgICAgICAgIGZyb20gJy4vYXBwL3NvY2lhbC1tZWRpYSdcbmltcG9ydCBkYXJrTW9kZSAgICAgICAgICAgZnJvbSAnLi9hcHAvZGFyay1tb2RlJ1xuaW1wb3J0IGhlYWRlclRyYW5zcGFyZW5jeSBmcm9tICcuL2FwcC9oZWFkZXItdHJhbnNwYXJlbmN5J1xuaW1wb3J0IGxvYWRTY3JpcHQgICAgICAgICBmcm9tICcuL2NvbXBvbmVudHMvbG9hZC1zY3JpcHQnXG5pbXBvcnQgc2Nyb2xsSGlkZUhlYWRlciAgIGZyb20gJy4vY29tcG9uZW50cy9zY3JvbGwtaGlkZS1oZWFkZXInXG5pbXBvcnQgcHJvbW9Qb3B1cCAgICAgICAgIGZyb20gJy4vY29tcG9uZW50cy9wcm9tby1wb3B1cCdcbmltcG9ydCBwb3N0SW5maW5pdGUgICAgICAgZnJvbSAnLi9wb3N0LWluZmluaXRlJ1xuXG5pbXBvcnQgaW5pdEhhcHRpY0ZlZWRiYWNrICAgICAgICAgICAgICAgICAgICAgICBmcm9tICcuL2FwcC9oYXB0aWMtZmVlZGJhY2snXG5pbXBvcnQgaW5pdE1laWxpU2VhcmNoLCB7IE1FSUxJU0VBUkNIX0VOQUJMRUQgfSBmcm9tICcuL2xpYi9tZWlsaXNlYXJjaCdcbmltcG9ydCBpbml0U3BlY3VsYXRpb25SdWxlcyAgICAgICAgICAgICAgICAgICAgIGZyb20gJy4vbGliL3NwZWN1bGF0aW9uLXJ1bGVzJ1xuXG5jb25zdCBNNFNldHVwID0gKCkgPT4ge1xuICBjb25zb2xlLmRlYnVnKCdbbWFpbl0gTTRTZXR1cCBzdGFydGluZycpXG5cbiAgaWYgKHR5cGVvZiBmb2xsb3dTb2NpYWxNZWRpYSA9PT0gJ29iamVjdCcgJiYgZm9sbG93U29jaWFsTWVkaWEgIT09IG51bGwpIHtcbiAgICBzb2NpYWxNZWRpYShmb2xsb3dTb2NpYWxNZWRpYSwgJy5qcy1zb2NpYWwtbWVkaWEnKVxuICB9XG5cbiAgZGFya01vZGUoJy5qcy1kYXJrLW1vZGUnKVxuICBoZWFkZXJUcmFuc3BhcmVuY3koJy5oYXMtY292ZXInLCAnaXMtaGVhZC10cmFuc3BhcmVudCcpXG5cbiAgY29uc3QgJG1lbnVPcGVuICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51LW9wZW4nKVxuICBjb25zdCAkbWVudUNsb3NlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLW1lbnUtY2xvc2UnKVxuICBjb25zdCAkc2VhcmNoICAgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLXNlYXJjaCcpXG5cbiAgbGV0IF9tZW51U2Nyb2xsWSA9IDBcblxuICBpZiAoJG1lbnVPcGVuKSB7XG4gICAgJG1lbnVPcGVuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIF9tZW51U2Nyb2xsWSA9IHdpbmRvdy5zY3JvbGxZXG4gICAgICBpZiAoJHNlYXJjaCkgJHNlYXJjaC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdoYXMtbWVudScpXG4gICAgICAvLyBGaXJlZm94IHNjcm9sbHMgdG8gdGhlIG1lbnUgd3JhcHBlciBvbiBvdmVyZmxvdzpoaWRkZW47IHJlc3RvcmUgcG9zaXRpb24uXG4gICAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgX21lbnVTY3JvbGxZKVxuICAgIH0pXG4gIH1cblxuICBpZiAoJG1lbnVDbG9zZSkge1xuICAgICRtZW51Q2xvc2UuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdoYXMtbWVudScpXG4gICAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgX21lbnVTY3JvbGxZKVxuICAgIH0pXG4gIH1cblxuICAvLyDilIDilIAgU2VhcmNoIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuICBpZiAoIU1FSUxJU0VBUkNIX0VOQUJMRUQpIHtcbiAgICBpZiAodHlwZW9mIHNlYXJjaFNldHRpbmdzICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygc2l0ZVNlYXJjaCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGxvYWRTY3JpcHQoc2l0ZVNlYXJjaClcbiAgICB9XG4gIH1cblxuICBzY3JvbGxIaWRlSGVhZGVyKCcuanMtaGlkZS1oZWFkZXInKVxuICBwcm9tb1BvcHVwKCcjanMtcHJvbW8tcG9wdXAnLCAyMDAwKVxuXG4gIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaW5maW5pdGUtY29udGFpbmVyJykpIHtcbiAgICBjb25zb2xlLmluZm8oJ1ttYWluXSAuanMtaW5maW5pdGUtY29udGFpbmVyIGRldGVjdGVkIOKAlCBpbml0aWFsaXppbmcgcG9zdEluZmluaXRlJylcbiAgICBwb3N0SW5maW5pdGUoKVxuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUuZGVidWcoJ1ttYWluXSAuanMtaW5maW5pdGUtY29udGFpbmVyIG5vdCBmb3VuZCDigJQgc2tpcHBpbmcgcG9zdEluZmluaXRlJylcbiAgfVxuXG4gIC8vIOKUgOKUgCBIYXB0aWMgZmVlZGJhY2sg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4gIGluaXRIYXB0aWNGZWVkYmFjayh7XG4gICAgdGFyZ2V0czogW10sXG4gICAgZXhjbHVkZTogW10sXG4gIH0pXG5cbiAgLy8g4pSA4pSAIE1laWxpU2VhcmNoIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuICBpbml0TWVpbGlTZWFyY2goKVxuXG4gIC8vIOKUgOKUgCBTcGVjdWxhdGlvbiBSdWxlcyAocHJlZmV0Y2ggb24gaG92ZXIpIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuICAvLyBQcm9ncmVzc2l2ZSBlbmhhbmNlbWVudDogQ2hyb21pdW0gb25seS4gTm8tb3BzIHNpbGVudGx5IG9uIEZpcmVmb3gvU2FmYXJpLlxuICAvLyBTZWUgc3JjL2pzL2xpYi9zcGVjdWxhdGlvbi1ydWxlcy5qcyBmb3IgZXhjbHVzaW9uIGxpc3QgYW5kIHVwZ3JhZGUgbm90ZXMuXG4gIGluaXRTcGVjdWxhdGlvblJ1bGVzKClcbn1cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIE00U2V0dXApXG4iLCJpbXBvcnQgSW5maW5pdGVTY3JvbGwgZnJvbSAnaW5maW5pdGUtc2Nyb2xsJztcclxuaW1wb3J0IEFuYWx5dGljc01hbmFnZXIgZnJvbSAnLi9saWIvYW5hbHl0aWNzJztcclxuXHJcbmltcG9ydCB2aWRlb1Jlc3BvbnNpdmUgZnJvbSAnLi9jb21wb25lbnRzL3ZpZGVvLXJlc3BvbnNpdmUnO1xyXG5pbXBvcnQgcmVzaXplSW1hZ2VzSW5HYWxsZXJpZXMgZnJvbSAnLi9jb21wb25lbnRzL3Jlc2l6ZS1pbWFnZXMtZ2FsbGVyaWVzJztcclxuaW1wb3J0IGhpZ2hsaWdodFByaXNtIGZyb20gJy4vY29tcG9uZW50cy9oaWdobGlnaHQtcHJpc21qcyc7XHJcbmltcG9ydCBNNEdhbGxlcnkgZnJvbSAnLi9jb21wb25lbnRzL2dhbGxlcnknO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge1xyXG4gIGlmICh3aW5kb3cuTTRJbmZpbml0ZVNjcm9sbEFjdGl2ZSkgcmV0dXJuO1xyXG5cclxuICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaW5maW5pdGUtY29udGFpbmVyJyk7XHJcbiAgY29uc3QgaW5pdGlhbE5leHRMaW5rID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLW5leHQtcG9zdC1saW5rJyk7XHJcbiAgXHJcbiAgLy8gTW9iaWxlIE1lbnUgRGlhZ25vc3RpY1xyXG4gIGNvbnN0IG1lbnVUb2dnbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtbWVudS10b2dnbGUnKTtcclxuICBjb25zb2xlLmxvZygnW0luZmluaXRlU2Nyb2xsXSBET00gQ2hlY2s6JywgeyBcclxuICAgIGNvbnRhaW5lcjogISFjb250YWluZXIsIFxyXG4gICAgbmV4dExpbms6ICEhaW5pdGlhbE5leHRMaW5rLFxyXG4gICAgbWVudVRvZ2dsZTogISFtZW51VG9nZ2xlIFxyXG4gIH0pO1xyXG5cclxuICBpZiAoIWNvbnRhaW5lciB8fCAhaW5pdGlhbE5leHRMaW5rKSByZXR1cm47XHJcblxyXG4gIGNvbnN0IGFuYWx5dGljcyA9IG5ldyBBbmFseXRpY3NNYW5hZ2VyKCk7XHJcbiAgY29uc3QgZmlyc3RBcnRpY2xlID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5qcy1wb3N0LWFydGljbGUnKTtcclxuICBpZiAoZmlyc3RBcnRpY2xlKSB7XHJcbiAgICBhbmFseXRpY3Mub2JzZXJ2ZUFydGljbGUoZmlyc3RBcnRpY2xlLCBkb2N1bWVudC50aXRsZSk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBpbmZTY3JvbGwgPSBuZXcgSW5maW5pdGVTY3JvbGwoY29udGFpbmVyLCB7XHJcbiAgICAvLyBUaGUgcGF0aCBmdW5jdGlvbiBpcyBldmFsdWF0ZWQgYmVmb3JlIGV2ZXJ5IGZldGNoXHJcbiAgICBwYXRoOiBmdW5jdGlvbigpIHtcclxuICAgICAgY29uc3QgYXJ0aWNsZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtcG9zdC1hcnRpY2xlJyk7XHJcbiAgICAgIGNvbnN0IGxhc3RBcnRpY2xlID0gYXJ0aWNsZXNbYXJ0aWNsZXMubGVuZ3RoIC0gMV07XHJcbiAgICAgIGlmICghbGFzdEFydGljbGUpIHJldHVybiBudWxsO1xyXG4gICAgICBcclxuICAgICAgY29uc3QgbmV4dERhdGEgPSBsYXN0QXJ0aWNsZS5xdWVyeVNlbGVjdG9yKCcuanMtbmV4dC1wb3N0LWRhdGEnKTtcclxuICAgICAgY29uc3QgbmV4dFVybCA9IG5leHREYXRhID8gbmV4dERhdGEuZGF0YXNldC51cmwgOiBudWxsO1xyXG4gICAgICBcclxuICAgICAgaWYgKG5leHRVcmwpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW0luZmluaXRlU2Nyb2xsXSBOZXh0IHRhcmdldCBpZGVudGlmaWVkOicsIG5leHRVcmwpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBuZXh0VXJsO1xyXG4gICAgfSxcclxuICAgIGFwcGVuZDogJy5qcy1wb3N0LWFydGljbGUnLFxyXG4gICAgaGlzdG9yeTogJ3B1c2gnLFxyXG4gICAgaGlzdG9yeVRpdGxlOiB0cnVlLFxyXG4gICAgc2Nyb2xsVGhyZXNob2xkOiA4MDAsXHJcbiAgICBsb2FkT25TY3JvbGw6IHRydWVcclxuICB9KTtcclxuXHJcbiAgaW5mU2Nyb2xsLm9uKCdhcHBlbmQnLCAocmVzcG9uc2UsIHBhdGgsIGl0ZW1zKSA9PiB7XHJcbiAgICBjb25zdCBuZXdBcnRpY2xlID0gaXRlbXNbMF07XHJcbiAgICBpZiAoIW5ld0FydGljbGUpIHJldHVybjtcclxuXHJcbiAgICBjb25zb2xlLmxvZygnW0luZmluaXRlU2Nyb2xsXSBBcHBlbmRlZDonLCBuZXdBcnRpY2xlLmRhdGFzZXQudGl0bGUpO1xyXG5cclxuICAgIC8vIFJlLWluaXRpYWxpemUgdGhlbWUgbG9naWMgZm9yIHRoZSBuZXdseSBhZGRlZCBwb3N0IGNvbnRlbnRcclxuICAgIHZpZGVvUmVzcG9uc2l2ZShuZXdBcnRpY2xlKTtcclxuICAgIHJlc2l6ZUltYWdlc0luR2FsbGVyaWVzKG5ld0FydGljbGUpO1xyXG4gICAgaGlnaGxpZ2h0UHJpc20obmV3QXJ0aWNsZSk7XHJcbiAgICBNNEdhbGxlcnkoKTtcclxuXHJcbiAgICBhbmFseXRpY3MudHJhY2tQYWdlVmlldyhuZXdBcnRpY2xlLmRhdGFzZXQudXJsLCBuZXdBcnRpY2xlLmRhdGFzZXQudGl0bGUsIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSk7XHJcbiAgICBhbmFseXRpY3Mub2JzZXJ2ZUFydGljbGUobmV3QXJ0aWNsZSwgbmV3QXJ0aWNsZS5kYXRhc2V0LnRpdGxlKTtcclxuICB9KTtcclxuXHJcbiAgaW5mU2Nyb2xsLm9uKCdlcnJvcicsIChlcnJvciwgcGF0aCkgPT4ge1xyXG4gICAgY29uc29sZS5lcnJvcignW0luZmluaXRlU2Nyb2xsXSBGZXRjaCBmYWlsZWQ6JywgZXJyb3IsIHBhdGgpO1xyXG4gIH0pO1xyXG5cclxuICB3aW5kb3cuTTRJbmZpbml0ZVNjcm9sbEFjdGl2ZSA9IHRydWU7XHJcbn07Il19

//# sourceMappingURL=map/main.js.map
