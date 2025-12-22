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

},{"./load-script":18,"@babel/runtime/helpers/interopRequireDefault":1}],17:[function(require,module,exports){
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

},{"../app/document-query-selector-all":13,"./load-script":18,"@babel/runtime/helpers/interopRequireDefault":1}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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

},{"../app/document-query-selector-all":13,"@babel/runtime/helpers/interopRequireDefault":1}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
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

},{"./app/dark-mode":12,"./app/header-transparency":14,"./app/social-media":15,"./components/load-script":18,"./components/promo-popup":19,"./components/scroll-hide-header":21,"./post-infinite":25,"@babel/runtime/helpers/interopRequireDefault":1,"lazysizes":11}],25:[function(require,module,exports){
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

},{"./components/highlight-prismjs":17,"./components/resize-images-galleries":20,"./components/video-responsive":22,"./lib/analytics":23,"@babel/runtime/helpers/interopRequireDefault":1,"infinite-scroll":7}],26:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
require("./main");
var _videoResponsive = _interopRequireDefault(require("./components/video-responsive"));
var _resizeImagesGalleries = _interopRequireDefault(require("./components/resize-images-galleries"));
var _highlightPrismjs = _interopRequireDefault(require("./components/highlight-prismjs"));
var _gallery = _interopRequireDefault(require("./components/gallery"));
var _isSingglePost = _interopRequireDefault(require("./post/is-singgle-post"));
var _postInfinite = _interopRequireDefault(require("./post-infinite"));
// Post

// Import Infinite Scroll Manager

const M4PostSetup = () => {
  console.log('M4PostSetup: Starting initialization...'); // Debug Log

  (0, _videoResponsive.default)();
  (0, _resizeImagesGalleries.default)();
  (0, _highlightPrismjs.default)('code[class*=language-]');
  (0, _isSingglePost.default)();
  (0, _gallery.default)();

  // Initialize Infinite Scroll
  console.log('M4PostSetup: Initializing Infinite Scroll...'); // Debug Log
  (0, _postInfinite.default)();
};
document.addEventListener('DOMContentLoaded', M4PostSetup);

},{"./components/gallery":16,"./components/highlight-prismjs":17,"./components/resize-images-galleries":20,"./components/video-responsive":22,"./main":24,"./post-infinite":25,"./post/is-singgle-post":27,"@babel/runtime/helpers/interopRequireDefault":1}],27:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _documentQuerySelectorAll = _interopRequireDefault(require("../app/document-query-selector-all"));
var _default = () => {
  if (!document.body.classList.contains('is-single-post')) return;
  const $shareBox = document.querySelector('.js-share');
  if (!$shareBox) return;
  const $observe = (0, _documentQuerySelectorAll.default)('.kg-width-full, .kg-width-wide');
  if (!$observe.length) return;
  if (document.body.clientWidth <= 1000) return;

  /* Intersect share box with image => return true or false
  /* ---------------------------------------------------------- */
  const intersects = (el1, el2) => {
    const rect1 = el1.getBoundingClientRect();
    const rect2 = el2.getBoundingClientRect();
    return !(rect1.top > rect2.bottom || rect1.right < rect2.left || rect1.bottom < rect2.top || rect1.left > rect2.right);
  };

  /* the floating fade sharing in the sidebar
  /* ---------------------------------------------------------- */
  const shareFade = () => {
    let isHidden = false;
    for (const i in $observe) {
      if (intersects($shareBox, $observe[i])) {
        isHidden = true;
        break;
      }
    }
    isHidden ? $shareBox.classList.add('is-hidden') : $shareBox.classList.remove('is-hidden');
  };
  window.addEventListener('scroll', shareFade, {
    passive: true
  });

  //
};
exports.default = _default;

},{"../app/document-query-selector-all":13,"@babel/runtime/helpers/interopRequireDefault":1}]},{},[26])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHQuanMiLCJub2RlX21vZHVsZXMvZXYtZW1pdHRlci9ldi1lbWl0dGVyLmpzIiwibm9kZV9tb2R1bGVzL2Zpenp5LXVpLXV0aWxzL3V0aWxzLmpzIiwibm9kZV9tb2R1bGVzL2luZmluaXRlLXNjcm9sbC9qcy9idXR0b24uanMiLCJub2RlX21vZHVsZXMvaW5maW5pdGUtc2Nyb2xsL2pzL2NvcmUuanMiLCJub2RlX21vZHVsZXMvaW5maW5pdGUtc2Nyb2xsL2pzL2hpc3RvcnkuanMiLCJub2RlX21vZHVsZXMvaW5maW5pdGUtc2Nyb2xsL2pzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2luZmluaXRlLXNjcm9sbC9qcy9wYWdlLWxvYWQuanMiLCJub2RlX21vZHVsZXMvaW5maW5pdGUtc2Nyb2xsL2pzL3Njcm9sbC13YXRjaC5qcyIsIm5vZGVfbW9kdWxlcy9pbmZpbml0ZS1zY3JvbGwvanMvc3RhdHVzLmpzIiwibm9kZV9tb2R1bGVzL2xhenlzaXplcy9sYXp5c2l6ZXMuanMiLCJzcmMvanMvYXBwL2RhcmstbW9kZS5qcyIsInNyYy9qcy9hcHAvZG9jdW1lbnQtcXVlcnktc2VsZWN0b3ItYWxsLmpzIiwic3JjL2pzL2FwcC9oZWFkZXItdHJhbnNwYXJlbmN5LmpzIiwic3JjL2pzL2FwcC9zb2NpYWwtbWVkaWEuanMiLCJzcmMvanMvY29tcG9uZW50cy9nYWxsZXJ5LmpzIiwic3JjL2pzL2NvbXBvbmVudHMvaGlnaGxpZ2h0LXByaXNtanMuanMiLCJzcmMvanMvY29tcG9uZW50cy9sb2FkLXNjcmlwdC5qcyIsInNyYy9qcy9jb21wb25lbnRzL3Byb21vLXBvcHVwLmpzIiwic3JjL2pzL2NvbXBvbmVudHMvcmVzaXplLWltYWdlcy1nYWxsZXJpZXMuanMiLCJzcmMvanMvY29tcG9uZW50cy9zY3JvbGwtaGlkZS1oZWFkZXIuanMiLCJzcmMvanMvY29tcG9uZW50cy92aWRlby1yZXNwb25zaXZlLmpzIiwic3JjL2pzL2xpYi9hbmFseXRpY3MuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9wb3N0LWluZmluaXRlLmpzIiwic3JjL2pzL3Bvc3QuanMiLCJzcmMvanMvcG9zdC9pcy1zaW5nZ2xlLXBvc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7QUM3eUJBLElBQUEseUJBQUEsR0FBQSxzQkFBQSxDQUFBLE9BQUE7QUFEQTtBQUFBLElBQUEsUUFBQSxHQUdlLEVBQUUsSUFBSTtFQUNuQixNQUFNLFlBQVksR0FBRyxJQUFBLGlDQUFjLEVBQUMsRUFBRSxDQUFDO0VBRXZDLElBQUksQ0FB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LENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUV6QyxPQUFPLEVBQUUsS0FBSyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO0VBQ3hILENBQUM7O0VBRUQ7QUFDRjtFQUNFLE1BQU0sU0FBUyxHQUFHLENBQUEsS0FBTTtJQUN0QixJQUFJLFFBQVEsR0FBRyxLQUFLO0lBRXBCLEtBQUssTUFBTSxDQUFDLElBQUksUUFBUSxFQUFFO01BQ3hCLElBQUksVUFBVSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUN0QyxRQUFRLEdBQUcsSUFBSTtRQUNmO01BQ0Y7SUFDRjtJQUVBLFFBQVEsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7RUFDM0YsQ0FBQztFQUVELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFO0lBQUUsT0FBTyxFQUFFO0VBQUssQ0FBQyxDQUFDOztFQUUvRDtBQUNGLENBQUM7QUFBQSxPQUFBLENBQUEsT0FBQSxHQUFBLFFBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJmdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KGUpIHtcbiAgcmV0dXJuIGUgJiYgZS5fX2VzTW9kdWxlID8gZSA6IHtcbiAgICBcImRlZmF1bHRcIjogZVxuICB9O1xufVxubW9kdWxlLmV4cG9ydHMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0LCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZSwgbW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHM7IiwiLyoqXG4gKiBFdkVtaXR0ZXIgdjIuMS4xXG4gKiBMaWwnIGV2ZW50IGVtaXR0ZXJcbiAqIE1JVCBMaWNlbnNlXG4gKi9cblxuKCBmdW5jdGlvbiggZ2xvYmFsLCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTIC0gQnJvd3NlcmlmeSwgV2VicGFja1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgIGdsb2JhbC5FdkVtaXR0ZXIgPSBmYWN0b3J5KCk7XG4gIH1cblxufSggdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHRoaXMsIGZ1bmN0aW9uKCkge1xuXG5mdW5jdGlvbiBFdkVtaXR0ZXIoKSB7fVxuXG5sZXQgcHJvdG8gPSBFdkVtaXR0ZXIucHJvdG90eXBlO1xuXG5wcm90by5vbiA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGxpc3RlbmVyICkge1xuICBpZiAoICFldmVudE5hbWUgfHwgIWxpc3RlbmVyICkgcmV0dXJuIHRoaXM7XG5cbiAgLy8gc2V0IGV2ZW50cyBoYXNoXG4gIGxldCBldmVudHMgPSB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIC8vIHNldCBsaXN0ZW5lcnMgYXJyYXlcbiAgbGV0IGxpc3RlbmVycyA9IGV2ZW50c1sgZXZlbnROYW1lIF0gPSBldmVudHNbIGV2ZW50TmFtZSBdIHx8IFtdO1xuICAvLyBvbmx5IGFkZCBvbmNlXG4gIGlmICggIWxpc3RlbmVycy5pbmNsdWRlcyggbGlzdGVuZXIgKSApIHtcbiAgICBsaXN0ZW5lcnMucHVzaCggbGlzdGVuZXIgKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8ub25jZSA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGxpc3RlbmVyICkge1xuICBpZiAoICFldmVudE5hbWUgfHwgIWxpc3RlbmVyICkgcmV0dXJuIHRoaXM7XG5cbiAgLy8gYWRkIGV2ZW50XG4gIHRoaXMub24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKTtcbiAgLy8gc2V0IG9uY2UgZmxhZ1xuICAvLyBzZXQgb25jZUV2ZW50cyBoYXNoXG4gIGxldCBvbmNlRXZlbnRzID0gdGhpcy5fb25jZUV2ZW50cyA9IHRoaXMuX29uY2VFdmVudHMgfHwge307XG4gIC8vIHNldCBvbmNlTGlzdGVuZXJzIG9iamVjdFxuICBsZXQgb25jZUxpc3RlbmVycyA9IG9uY2VFdmVudHNbIGV2ZW50TmFtZSBdID0gb25jZUV2ZW50c1sgZXZlbnROYW1lIF0gfHwge307XG4gIC8vIHNldCBmbGFnXG4gIG9uY2VMaXN0ZW5lcnNbIGxpc3RlbmVyIF0gPSB0cnVlO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8ub2ZmID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKSB7XG4gIGxldCBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzWyBldmVudE5hbWUgXTtcbiAgaWYgKCAhbGlzdGVuZXJzIHx8ICFsaXN0ZW5lcnMubGVuZ3RoICkgcmV0dXJuIHRoaXM7XG5cbiAgbGV0IGluZGV4ID0gbGlzdGVuZXJzLmluZGV4T2YoIGxpc3RlbmVyICk7XG4gIGlmICggaW5kZXggIT0gLTEgKSB7XG4gICAgbGlzdGVuZXJzLnNwbGljZSggaW5kZXgsIDEgKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8uZW1pdEV2ZW50ID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgYXJncyApIHtcbiAgbGV0IGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbIGV2ZW50TmFtZSBdO1xuICBpZiAoICFsaXN0ZW5lcnMgfHwgIWxpc3RlbmVycy5sZW5ndGggKSByZXR1cm4gdGhpcztcblxuICAvLyBjb3B5IG92ZXIgdG8gYXZvaWQgaW50ZXJmZXJlbmNlIGlmIC5vZmYoKSBpbiBsaXN0ZW5lclxuICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuc2xpY2UoIDAgKTtcbiAgYXJncyA9IGFyZ3MgfHwgW107XG4gIC8vIG9uY2Ugc3R1ZmZcbiAgbGV0IG9uY2VMaXN0ZW5lcnMgPSB0aGlzLl9vbmNlRXZlbnRzICYmIHRoaXMuX29uY2VFdmVudHNbIGV2ZW50TmFtZSBdO1xuXG4gIGZvciAoIGxldCBsaXN0ZW5lciBvZiBsaXN0ZW5lcnMgKSB7XG4gICAgbGV0IGlzT25jZSA9IG9uY2VMaXN0ZW5lcnMgJiYgb25jZUxpc3RlbmVyc1sgbGlzdGVuZXIgXTtcbiAgICBpZiAoIGlzT25jZSApIHtcbiAgICAgIC8vIHJlbW92ZSBsaXN0ZW5lclxuICAgICAgLy8gcmVtb3ZlIGJlZm9yZSB0cmlnZ2VyIHRvIHByZXZlbnQgcmVjdXJzaW9uXG4gICAgICB0aGlzLm9mZiggZXZlbnROYW1lLCBsaXN0ZW5lciApO1xuICAgICAgLy8gdW5zZXQgb25jZSBmbGFnXG4gICAgICBkZWxldGUgb25jZUxpc3RlbmVyc1sgbGlzdGVuZXIgXTtcbiAgICB9XG4gICAgLy8gdHJpZ2dlciBsaXN0ZW5lclxuICAgIGxpc3RlbmVyLmFwcGx5KCB0aGlzLCBhcmdzICk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbnByb3RvLmFsbE9mZiA9IGZ1bmN0aW9uKCkge1xuICBkZWxldGUgdGhpcy5fZXZlbnRzO1xuICBkZWxldGUgdGhpcy5fb25jZUV2ZW50cztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5yZXR1cm4gRXZFbWl0dGVyO1xuXG59ICkgKTtcbiIsIi8qKlxuICogRml6enkgVUkgdXRpbHMgdjMuMC4wXG4gKiBNSVQgbGljZW5zZVxuICovXG5cbiggZnVuY3Rpb24oIGdsb2JhbCwgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSggZ2xvYmFsICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICBnbG9iYWwuZml6enlVSVV0aWxzID0gZmFjdG9yeSggZ2xvYmFsICk7XG4gIH1cblxufSggdGhpcywgZnVuY3Rpb24gZmFjdG9yeSggZ2xvYmFsICkge1xuXG5sZXQgdXRpbHMgPSB7fTtcblxuLy8gLS0tLS0gZXh0ZW5kIC0tLS0tIC8vXG5cbi8vIGV4dGVuZHMgb2JqZWN0c1xudXRpbHMuZXh0ZW5kID0gZnVuY3Rpb24oIGEsIGIgKSB7XG4gIHJldHVybiBPYmplY3QuYXNzaWduKCBhLCBiICk7XG59O1xuXG4vLyAtLS0tLSBtb2R1bG8gLS0tLS0gLy9cblxudXRpbHMubW9kdWxvID0gZnVuY3Rpb24oIG51bSwgZGl2ICkge1xuICByZXR1cm4gKCAoIG51bSAlIGRpdiApICsgZGl2ICkgJSBkaXY7XG59O1xuXG4vLyAtLS0tLSBtYWtlQXJyYXkgLS0tLS0gLy9cblxuLy8gdHVybiBlbGVtZW50IG9yIG5vZGVMaXN0IGludG8gYW4gYXJyYXlcbnV0aWxzLm1ha2VBcnJheSA9IGZ1bmN0aW9uKCBvYmogKSB7XG4gIC8vIHVzZSBvYmplY3QgaWYgYWxyZWFkeSBhbiBhcnJheVxuICBpZiAoIEFycmF5LmlzQXJyYXkoIG9iaiApICkgcmV0dXJuIG9iajtcblxuICAvLyByZXR1cm4gZW1wdHkgYXJyYXkgaWYgdW5kZWZpbmVkIG9yIG51bGwuICM2XG4gIGlmICggb2JqID09PSBudWxsIHx8IG9iaiA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIFtdO1xuXG4gIGxldCBpc0FycmF5TGlrZSA9IHR5cGVvZiBvYmogPT0gJ29iamVjdCcgJiYgdHlwZW9mIG9iai5sZW5ndGggPT0gJ251bWJlcic7XG4gIC8vIGNvbnZlcnQgbm9kZUxpc3QgdG8gYXJyYXlcbiAgaWYgKCBpc0FycmF5TGlrZSApIHJldHVybiBbIC4uLm9iaiBdO1xuXG4gIC8vIGFycmF5IG9mIHNpbmdsZSBpbmRleFxuICByZXR1cm4gWyBvYmogXTtcbn07XG5cbi8vIC0tLS0tIHJlbW92ZUZyb20gLS0tLS0gLy9cblxudXRpbHMucmVtb3ZlRnJvbSA9IGZ1bmN0aW9uKCBhcnksIG9iaiApIHtcbiAgbGV0IGluZGV4ID0gYXJ5LmluZGV4T2YoIG9iaiApO1xuICBpZiAoIGluZGV4ICE9IC0xICkge1xuICAgIGFyeS5zcGxpY2UoIGluZGV4LCAxICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIGdldFBhcmVudCAtLS0tLSAvL1xuXG51dGlscy5nZXRQYXJlbnQgPSBmdW5jdGlvbiggZWxlbSwgc2VsZWN0b3IgKSB7XG4gIHdoaWxlICggZWxlbS5wYXJlbnROb2RlICYmIGVsZW0gIT0gZG9jdW1lbnQuYm9keSApIHtcbiAgICBlbGVtID0gZWxlbS5wYXJlbnROb2RlO1xuICAgIGlmICggZWxlbS5tYXRjaGVzKCBzZWxlY3RvciApICkgcmV0dXJuIGVsZW07XG4gIH1cbn07XG5cbi8vIC0tLS0tIGdldFF1ZXJ5RWxlbWVudCAtLS0tLSAvL1xuXG4vLyB1c2UgZWxlbWVudCBhcyBzZWxlY3RvciBzdHJpbmdcbnV0aWxzLmdldFF1ZXJ5RWxlbWVudCA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICBpZiAoIHR5cGVvZiBlbGVtID09ICdzdHJpbmcnICkge1xuICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCBlbGVtICk7XG4gIH1cbiAgcmV0dXJuIGVsZW07XG59O1xuXG4vLyAtLS0tLSBoYW5kbGVFdmVudCAtLS0tLSAvL1xuXG4vLyBlbmFibGUgLm9udHlwZSB0byB0cmlnZ2VyIGZyb20gLmFkZEV2ZW50TGlzdGVuZXIoIGVsZW0sICd0eXBlJyApXG51dGlscy5oYW5kbGVFdmVudCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgbGV0IG1ldGhvZCA9ICdvbicgKyBldmVudC50eXBlO1xuICBpZiAoIHRoaXNbIG1ldGhvZCBdICkge1xuICAgIHRoaXNbIG1ldGhvZCBdKCBldmVudCApO1xuICB9XG59O1xuXG4vLyAtLS0tLSBmaWx0ZXJGaW5kRWxlbWVudHMgLS0tLS0gLy9cblxudXRpbHMuZmlsdGVyRmluZEVsZW1lbnRzID0gZnVuY3Rpb24oIGVsZW1zLCBzZWxlY3RvciApIHtcbiAgLy8gbWFrZSBhcnJheSBvZiBlbGVtc1xuICBlbGVtcyA9IHV0aWxzLm1ha2VBcnJheSggZWxlbXMgKTtcblxuICByZXR1cm4gZWxlbXNcbiAgICAvLyBjaGVjayB0aGF0IGVsZW0gaXMgYW4gYWN0dWFsIGVsZW1lbnRcbiAgICAuZmlsdGVyKCAoIGVsZW0gKSA9PiBlbGVtIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgKVxuICAgIC5yZWR1Y2UoICggZmZFbGVtcywgZWxlbSApID0+IHtcbiAgICAgIC8vIGFkZCBlbGVtIGlmIG5vIHNlbGVjdG9yXG4gICAgICBpZiAoICFzZWxlY3RvciApIHtcbiAgICAgICAgZmZFbGVtcy5wdXNoKCBlbGVtICk7XG4gICAgICAgIHJldHVybiBmZkVsZW1zO1xuICAgICAgfVxuICAgICAgLy8gZmlsdGVyICYgZmluZCBpdGVtcyBpZiB3ZSBoYXZlIGEgc2VsZWN0b3JcbiAgICAgIC8vIGZpbHRlclxuICAgICAgaWYgKCBlbGVtLm1hdGNoZXMoIHNlbGVjdG9yICkgKSB7XG4gICAgICAgIGZmRWxlbXMucHVzaCggZWxlbSApO1xuICAgICAgfVxuICAgICAgLy8gZmluZCBjaGlsZHJlblxuICAgICAgbGV0IGNoaWxkRWxlbXMgPSBlbGVtLnF1ZXJ5U2VsZWN0b3JBbGwoIHNlbGVjdG9yICk7XG4gICAgICAvLyBjb25jYXQgY2hpbGRFbGVtcyB0byBmaWx0ZXJGb3VuZCBhcnJheVxuICAgICAgZmZFbGVtcyA9IGZmRWxlbXMuY29uY2F0KCAuLi5jaGlsZEVsZW1zICk7XG4gICAgICByZXR1cm4gZmZFbGVtcztcbiAgICB9LCBbXSApO1xufTtcblxuLy8gLS0tLS0gZGVib3VuY2VNZXRob2QgLS0tLS0gLy9cblxudXRpbHMuZGVib3VuY2VNZXRob2QgPSBmdW5jdGlvbiggX2NsYXNzLCBtZXRob2ROYW1lLCB0aHJlc2hvbGQgKSB7XG4gIHRocmVzaG9sZCA9IHRocmVzaG9sZCB8fCAxMDA7XG4gIC8vIG9yaWdpbmFsIG1ldGhvZFxuICBsZXQgbWV0aG9kID0gX2NsYXNzLnByb3RvdHlwZVsgbWV0aG9kTmFtZSBdO1xuICBsZXQgdGltZW91dE5hbWUgPSBtZXRob2ROYW1lICsgJ1RpbWVvdXQnO1xuXG4gIF9jbGFzcy5wcm90b3R5cGVbIG1ldGhvZE5hbWUgXSA9IGZ1bmN0aW9uKCkge1xuICAgIGNsZWFyVGltZW91dCggdGhpc1sgdGltZW91dE5hbWUgXSApO1xuXG4gICAgbGV0IGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgdGhpc1sgdGltZW91dE5hbWUgXSA9IHNldFRpbWVvdXQoICgpID0+IHtcbiAgICAgIG1ldGhvZC5hcHBseSggdGhpcywgYXJncyApO1xuICAgICAgZGVsZXRlIHRoaXNbIHRpbWVvdXROYW1lIF07XG4gICAgfSwgdGhyZXNob2xkICk7XG4gIH07XG59O1xuXG4vLyAtLS0tLSBkb2NSZWFkeSAtLS0tLSAvL1xuXG51dGlscy5kb2NSZWFkeSA9IGZ1bmN0aW9uKCBvbkRvY1JlYWR5ICkge1xuICBsZXQgcmVhZHlTdGF0ZSA9IGRvY3VtZW50LnJlYWR5U3RhdGU7XG4gIGlmICggcmVhZHlTdGF0ZSA9PSAnY29tcGxldGUnIHx8IHJlYWR5U3RhdGUgPT0gJ2ludGVyYWN0aXZlJyApIHtcbiAgICAvLyBkbyBhc3luYyB0byBhbGxvdyBmb3Igb3RoZXIgc2NyaXB0cyB0byBydW4uIG1ldGFmaXp6eS9mbGlja2l0eSM0NDFcbiAgICBzZXRUaW1lb3V0KCBvbkRvY1JlYWR5ICk7XG4gIH0gZWxzZSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ0RPTUNvbnRlbnRMb2FkZWQnLCBvbkRvY1JlYWR5ICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIGh0bWxJbml0IC0tLS0tIC8vXG5cbi8vIGh0dHA6Ly9iaXQubHkvM29ZTHVzY1xudXRpbHMudG9EYXNoZWQgPSBmdW5jdGlvbiggc3RyICkge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoIC8oLikoW0EtWl0pL2csIGZ1bmN0aW9uKCBtYXRjaCwgJDEsICQyICkge1xuICAgIHJldHVybiAkMSArICctJyArICQyO1xuICB9ICkudG9Mb3dlckNhc2UoKTtcbn07XG5cbmxldCBjb25zb2xlID0gZ2xvYmFsLmNvbnNvbGU7XG5cbi8vIGFsbG93IHVzZXIgdG8gaW5pdGlhbGl6ZSBjbGFzc2VzIHZpYSBbZGF0YS1uYW1lc3BhY2VdIG9yIC5qcy1uYW1lc3BhY2UgY2xhc3Ncbi8vIGh0bWxJbml0KCBXaWRnZXQsICd3aWRnZXROYW1lJyApXG4vLyBvcHRpb25zIGFyZSBwYXJzZWQgZnJvbSBkYXRhLW5hbWVzcGFjZS1vcHRpb25zXG51dGlscy5odG1sSW5pdCA9IGZ1bmN0aW9uKCBXaWRnZXRDbGFzcywgbmFtZXNwYWNlICkge1xuICB1dGlscy5kb2NSZWFkeSggZnVuY3Rpb24oKSB7XG4gICAgbGV0IGRhc2hlZE5hbWVzcGFjZSA9IHV0aWxzLnRvRGFzaGVkKCBuYW1lc3BhY2UgKTtcbiAgICBsZXQgZGF0YUF0dHIgPSAnZGF0YS0nICsgZGFzaGVkTmFtZXNwYWNlO1xuICAgIGxldCBkYXRhQXR0ckVsZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCggYFske2RhdGFBdHRyfV1gICk7XG4gICAgbGV0IGpRdWVyeSA9IGdsb2JhbC5qUXVlcnk7XG5cbiAgICBbIC4uLmRhdGFBdHRyRWxlbXMgXS5mb3JFYWNoKCAoIGVsZW0gKSA9PiB7XG4gICAgICBsZXQgYXR0ciA9IGVsZW0uZ2V0QXR0cmlidXRlKCBkYXRhQXR0ciApO1xuICAgICAgbGV0IG9wdGlvbnM7XG4gICAgICB0cnkge1xuICAgICAgICBvcHRpb25zID0gYXR0ciAmJiBKU09OLnBhcnNlKCBhdHRyICk7XG4gICAgICB9IGNhdGNoICggZXJyb3IgKSB7XG4gICAgICAgIC8vIGxvZyBlcnJvciwgZG8gbm90IGluaXRpYWxpemVcbiAgICAgICAgaWYgKCBjb25zb2xlICkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIGBFcnJvciBwYXJzaW5nICR7ZGF0YUF0dHJ9IG9uICR7ZWxlbS5jbGFzc05hbWV9OiAke2Vycm9yfWAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBpbml0aWFsaXplXG4gICAgICBsZXQgaW5zdGFuY2UgPSBuZXcgV2lkZ2V0Q2xhc3MoIGVsZW0sIG9wdGlvbnMgKTtcbiAgICAgIC8vIG1ha2UgYXZhaWxhYmxlIHZpYSAkKCkuZGF0YSgnbmFtZXNwYWNlJylcbiAgICAgIGlmICggalF1ZXJ5ICkge1xuICAgICAgICBqUXVlcnkuZGF0YSggZWxlbSwgbmFtZXNwYWNlLCBpbnN0YW5jZSApO1xuICAgICAgfVxuICAgIH0gKTtcblxuICB9ICk7XG59O1xuXG4vLyAtLS0tLSAgLS0tLS0gLy9cblxucmV0dXJuIHV0aWxzO1xuXG59ICkgKTtcbiIsIi8vIGJ1dHRvblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICB3aW5kb3csXG4gICAgICAgIHJlcXVpcmUoJy4vY29yZScpLFxuICAgICAgICByZXF1aXJlKCdmaXp6eS11aS11dGlscycpLFxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICBmYWN0b3J5KFxuICAgICAgICB3aW5kb3csXG4gICAgICAgIHdpbmRvdy5JbmZpbml0ZVNjcm9sbCxcbiAgICAgICAgd2luZG93LmZpenp5VUlVdGlscyxcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggd2luZG93LCBJbmZpbml0ZVNjcm9sbCwgdXRpbHMgKSB7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEluZmluaXRlU2Nyb2xsQnV0dG9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmNsYXNzIEluZmluaXRlU2Nyb2xsQnV0dG9uIHtcbiAgY29uc3RydWN0b3IoIGVsZW1lbnQsIGluZlNjcm9sbCApIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMuaW5mU2Nyb2xsID0gaW5mU2Nyb2xsO1xuICAgIC8vIGV2ZW50c1xuICAgIHRoaXMuY2xpY2tIYW5kbGVyID0gdGhpcy5vbkNsaWNrLmJpbmQoIHRoaXMgKTtcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgdGhpcy5jbGlja0hhbmRsZXIgKTtcbiAgICBpbmZTY3JvbGwub24oICdyZXF1ZXN0JywgdGhpcy5kaXNhYmxlLmJpbmQoIHRoaXMgKSApO1xuICAgIGluZlNjcm9sbC5vbiggJ2xvYWQnLCB0aGlzLmVuYWJsZS5iaW5kKCB0aGlzICkgKTtcbiAgICBpbmZTY3JvbGwub24oICdlcnJvcicsIHRoaXMuaGlkZS5iaW5kKCB0aGlzICkgKTtcbiAgICBpbmZTY3JvbGwub24oICdsYXN0JywgdGhpcy5oaWRlLmJpbmQoIHRoaXMgKSApO1xuICB9XG5cbiAgb25DbGljayggZXZlbnQgKSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLmluZlNjcm9sbC5sb2FkTmV4dFBhZ2UoKTtcbiAgfVxuXG4gIGVuYWJsZSgpIHtcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xuICB9XG5cbiAgZGlzYWJsZSgpIHtcbiAgICB0aGlzLmVsZW1lbnQuZGlzYWJsZWQgPSAnZGlzYWJsZWQnO1xuICB9XG5cbiAgaGlkZSgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdjbGljaycsIHRoaXMuY2xpY2tIYW5kbGVyICk7XG4gIH1cblxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBJbmZpbml0ZVNjcm9sbCBtZXRob2RzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8vIEluZmluaXRlU2Nyb2xsLmRlZmF1bHRzLmJ1dHRvbiA9IG51bGw7XG5cbkluZmluaXRlU2Nyb2xsLmNyZWF0ZS5idXR0b24gPSBmdW5jdGlvbigpIHtcbiAgbGV0IGJ1dHRvbkVsZW0gPSB1dGlscy5nZXRRdWVyeUVsZW1lbnQoIHRoaXMub3B0aW9ucy5idXR0b24gKTtcbiAgaWYgKCBidXR0b25FbGVtICkge1xuICAgIHRoaXMuYnV0dG9uID0gbmV3IEluZmluaXRlU2Nyb2xsQnV0dG9uKCBidXR0b25FbGVtLCB0aGlzICk7XG4gIH1cbn07XG5cbkluZmluaXRlU2Nyb2xsLmRlc3Ryb3kuYnV0dG9uID0gZnVuY3Rpb24oKSB7XG4gIGlmICggdGhpcy5idXR0b24gKSB0aGlzLmJ1dHRvbi5kZXN0cm95KCk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuSW5maW5pdGVTY3JvbGwuQnV0dG9uID0gSW5maW5pdGVTY3JvbGxCdXR0b247XG5cbnJldHVybiBJbmZpbml0ZVNjcm9sbDtcblxufSApICk7XG4iLCIvLyBjb3JlXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgcmVxdWlyZSgnZXYtZW1pdHRlcicpLFxuICAgICAgICByZXF1aXJlKCdmaXp6eS11aS11dGlscycpLFxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cuSW5maW5pdGVTY3JvbGwgPSBmYWN0b3J5KFxuICAgICAgICB3aW5kb3csXG4gICAgICAgIHdpbmRvdy5FdkVtaXR0ZXIsXG4gICAgICAgIHdpbmRvdy5maXp6eVVJVXRpbHMsXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgRXZFbWl0dGVyLCB1dGlscyApIHtcblxubGV0IGpRdWVyeSA9IHdpbmRvdy5qUXVlcnk7XG4vLyBpbnRlcm5hbCBzdG9yZSBvZiBhbGwgSW5maW5pdGVTY3JvbGwgaW50YW5jZXNcbmxldCBpbnN0YW5jZXMgPSB7fTtcblxuZnVuY3Rpb24gSW5maW5pdGVTY3JvbGwoIGVsZW1lbnQsIG9wdGlvbnMgKSB7XG4gIGxldCBxdWVyeUVsZW0gPSB1dGlscy5nZXRRdWVyeUVsZW1lbnQoIGVsZW1lbnQgKTtcblxuICBpZiAoICFxdWVyeUVsZW0gKSB7XG4gICAgY29uc29sZS5lcnJvciggJ0JhZCBlbGVtZW50IGZvciBJbmZpbml0ZVNjcm9sbDogJyArICggcXVlcnlFbGVtIHx8IGVsZW1lbnQgKSApO1xuICAgIHJldHVybjtcbiAgfVxuICBlbGVtZW50ID0gcXVlcnlFbGVtO1xuICAvLyBkbyBub3QgaW5pdGlhbGl6ZSB0d2ljZSBvbiBzYW1lIGVsZW1lbnRcbiAgaWYgKCBlbGVtZW50LmluZmluaXRlU2Nyb2xsR1VJRCApIHtcbiAgICBsZXQgaW5zdGFuY2UgPSBpbnN0YW5jZXNbIGVsZW1lbnQuaW5maW5pdGVTY3JvbGxHVUlEIF07XG4gICAgaW5zdGFuY2Uub3B0aW9uKCBvcHRpb25zICk7XG4gICAgcmV0dXJuIGluc3RhbmNlO1xuICB9XG5cbiAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgLy8gb3B0aW9uc1xuICB0aGlzLm9wdGlvbnMgPSB7IC4uLkluZmluaXRlU2Nyb2xsLmRlZmF1bHRzIH07XG4gIHRoaXMub3B0aW9uKCBvcHRpb25zICk7XG4gIC8vIGFkZCBqUXVlcnlcbiAgaWYgKCBqUXVlcnkgKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGpRdWVyeSggdGhpcy5lbGVtZW50ICk7XG4gIH1cblxuICB0aGlzLmNyZWF0ZSgpO1xufVxuXG4vLyBkZWZhdWx0c1xuSW5maW5pdGVTY3JvbGwuZGVmYXVsdHMgPSB7XG4gIC8vIHBhdGg6IG51bGwsXG4gIC8vIGhpZGVOYXY6IG51bGwsXG4gIC8vIGRlYnVnOiBmYWxzZSxcbn07XG5cbi8vIGNyZWF0ZSAmIGRlc3Ryb3kgbWV0aG9kc1xuSW5maW5pdGVTY3JvbGwuY3JlYXRlID0ge307XG5JbmZpbml0ZVNjcm9sbC5kZXN0cm95ID0ge307XG5cbmxldCBwcm90byA9IEluZmluaXRlU2Nyb2xsLnByb3RvdHlwZTtcbi8vIGluaGVyaXQgRXZFbWl0dGVyXG5PYmplY3QuYXNzaWduKCBwcm90bywgRXZFbWl0dGVyLnByb3RvdHlwZSApO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gZ2xvYmFsbHkgdW5pcXVlIGlkZW50aWZpZXJzXG5sZXQgR1VJRCA9IDA7XG5cbnByb3RvLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyBjcmVhdGUgY29yZVxuICAvLyBhZGQgaWQgZm9yIEluZmluaXRlU2Nyb2xsLmRhdGFcbiAgbGV0IGlkID0gdGhpcy5ndWlkID0gKytHVUlEO1xuICB0aGlzLmVsZW1lbnQuaW5maW5pdGVTY3JvbGxHVUlEID0gaWQ7IC8vIGV4cGFuZG9cbiAgaW5zdGFuY2VzWyBpZCBdID0gdGhpczsgLy8gYXNzb2NpYXRlIHZpYSBpZFxuICAvLyBwcm9wZXJ0aWVzXG4gIHRoaXMucGFnZUluZGV4ID0gMTsgLy8gZGVmYXVsdCB0byBmaXJzdCBwYWdlXG4gIHRoaXMubG9hZENvdW50ID0gMDtcbiAgdGhpcy51cGRhdGVHZXRQYXRoKCk7XG4gIC8vIGJhaWwgaWYgZ2V0UGF0aCBub3Qgc2V0LCBvciByZXR1cm5zIGZhbHNleSAjNzc2XG4gIGxldCBoYXNQYXRoID0gdGhpcy5nZXRQYXRoICYmIHRoaXMuZ2V0UGF0aCgpO1xuICBpZiAoICFoYXNQYXRoICkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Rpc2FibGluZyBJbmZpbml0ZVNjcm9sbCcpO1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnVwZGF0ZUdldEFic29sdXRlUGF0aCgpO1xuICB0aGlzLmxvZyggJ2luaXRpYWxpemVkJywgWyB0aGlzLmVsZW1lbnQuY2xhc3NOYW1lIF0gKTtcbiAgdGhpcy5jYWxsT25Jbml0KCk7XG4gIC8vIGNyZWF0ZSBmZWF0dXJlc1xuICBmb3IgKCBsZXQgbWV0aG9kIGluIEluZmluaXRlU2Nyb2xsLmNyZWF0ZSApIHtcbiAgICBJbmZpbml0ZVNjcm9sbC5jcmVhdGVbIG1ldGhvZCBdLmNhbGwoIHRoaXMgKTtcbiAgfVxufTtcblxucHJvdG8ub3B0aW9uID0gZnVuY3Rpb24oIG9wdHMgKSB7XG4gIE9iamVjdC5hc3NpZ24oIHRoaXMub3B0aW9ucywgb3B0cyApO1xufTtcblxuLy8gY2FsbCBvbkluaXQgb3B0aW9uLCB1c2VkIGZvciBiaW5kaW5nIGV2ZW50cyBvbiBpbml0XG5wcm90by5jYWxsT25Jbml0ID0gZnVuY3Rpb24oKSB7XG4gIGxldCBvbkluaXQgPSB0aGlzLm9wdGlvbnMub25Jbml0O1xuICBpZiAoIG9uSW5pdCApIHtcbiAgICBvbkluaXQuY2FsbCggdGhpcywgdGhpcyApO1xuICB9XG59O1xuXG4vLyAtLS0tLSBldmVudHMgLS0tLS0gLy9cblxucHJvdG8uZGlzcGF0Y2hFdmVudCA9IGZ1bmN0aW9uKCB0eXBlLCBldmVudCwgYXJncyApIHtcbiAgdGhpcy5sb2coIHR5cGUsIGFyZ3MgKTtcbiAgbGV0IGVtaXRBcmdzID0gZXZlbnQgPyBbIGV2ZW50IF0uY29uY2F0KCBhcmdzICkgOiBhcmdzO1xuICB0aGlzLmVtaXRFdmVudCggdHlwZSwgZW1pdEFyZ3MgKTtcbiAgLy8gdHJpZ2dlciBqUXVlcnkgZXZlbnRcbiAgaWYgKCAhalF1ZXJ5IHx8ICF0aGlzLiRlbGVtZW50ICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBuYW1lc3BhY2UgalF1ZXJ5IGV2ZW50XG4gIHR5cGUgKz0gJy5pbmZpbml0ZVNjcm9sbCc7XG4gIGxldCAkZXZlbnQgPSB0eXBlO1xuICBpZiAoIGV2ZW50ICkge1xuICAgIC8vIGNyZWF0ZSBqUXVlcnkgZXZlbnRcbiAgICAvKiBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbmV3LWNhcCAqL1xuICAgIGxldCBqUUV2ZW50ID0galF1ZXJ5LkV2ZW50KCBldmVudCApO1xuICAgIGpRRXZlbnQudHlwZSA9IHR5cGU7XG4gICAgJGV2ZW50ID0galFFdmVudDtcbiAgfVxuICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoICRldmVudCwgYXJncyApO1xufTtcblxubGV0IGxvZ2dlcnMgPSB7XG4gIGluaXRpYWxpemVkOiAoIGNsYXNzTmFtZSApID0+IGBvbiAke2NsYXNzTmFtZX1gLFxuICByZXF1ZXN0OiAoIHBhdGggKSA9PiBgVVJMOiAke3BhdGh9YCxcbiAgbG9hZDogKCByZXNwb25zZSwgcGF0aCApID0+IGAke3Jlc3BvbnNlLnRpdGxlIHx8ICcnfS4gVVJMOiAke3BhdGh9YCxcbiAgZXJyb3I6ICggZXJyb3IsIHBhdGggKSA9PiBgJHtlcnJvcn0uIFVSTDogJHtwYXRofWAsXG4gIGFwcGVuZDogKCByZXNwb25zZSwgcGF0aCwgaXRlbXMgKSA9PiBgJHtpdGVtcy5sZW5ndGh9IGl0ZW1zLiBVUkw6ICR7cGF0aH1gLFxuICBsYXN0OiAoIHJlc3BvbnNlLCBwYXRoICkgPT4gYFVSTDogJHtwYXRofWAsXG4gIGhpc3Rvcnk6ICggdGl0bGUsIHBhdGggKSA9PiBgVVJMOiAke3BhdGh9YCxcbiAgcGFnZUluZGV4OiBmdW5jdGlvbiggaW5kZXgsIG9yaWdpbiApIHtcbiAgICByZXR1cm4gYGN1cnJlbnQgcGFnZSBkZXRlcm1pbmVkIHRvIGJlOiAke2luZGV4fSBmcm9tICR7b3JpZ2lufWA7XG4gIH0sXG59O1xuXG4vLyBsb2cgZXZlbnRzXG5wcm90by5sb2cgPSBmdW5jdGlvbiggdHlwZSwgYXJncyApIHtcbiAgaWYgKCAhdGhpcy5vcHRpb25zLmRlYnVnICkgcmV0dXJuO1xuXG4gIGxldCBtZXNzYWdlID0gYFtJbmZpbml0ZVNjcm9sbF0gJHt0eXBlfWA7XG4gIGxldCBsb2dnZXIgPSBsb2dnZXJzWyB0eXBlIF07XG4gIGlmICggbG9nZ2VyICkgbWVzc2FnZSArPSAnLiAnICsgbG9nZ2VyLmFwcGx5KCB0aGlzLCBhcmdzICk7XG4gIGNvbnNvbGUubG9nKCBtZXNzYWdlICk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBtZXRob2RzIHVzZWQgYW1vdW5nIGZlYXR1cmVzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnByb3RvLnVwZGF0ZU1lYXN1cmVtZW50cyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLndpbmRvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgbGV0IHJlY3QgPSB0aGlzLmVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHRoaXMudG9wID0gcmVjdC50b3AgKyB3aW5kb3cuc2Nyb2xsWTtcbn07XG5cbnByb3RvLnVwZGF0ZVNjcm9sbGVyID0gZnVuY3Rpb24oKSB7XG4gIGxldCBlbGVtZW50U2Nyb2xsID0gdGhpcy5vcHRpb25zLmVsZW1lbnRTY3JvbGw7XG4gIGlmICggIWVsZW1lbnRTY3JvbGwgKSB7XG4gICAgLy8gZGVmYXVsdCwgdXNlIHdpbmRvd1xuICAgIHRoaXMuc2Nyb2xsZXIgPSB3aW5kb3c7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGlmIHRydWUsIHNldCB0byBlbGVtZW50LCBvdGhlcndpc2UgdXNlIG9wdGlvblxuICB0aGlzLnNjcm9sbGVyID0gZWxlbWVudFNjcm9sbCA9PT0gdHJ1ZSA/IHRoaXMuZWxlbWVudCA6XG4gICAgdXRpbHMuZ2V0UXVlcnlFbGVtZW50KCBlbGVtZW50U2Nyb2xsICk7XG4gIGlmICggIXRoaXMuc2Nyb2xsZXIgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gZmluZCBlbGVtZW50U2Nyb2xsOiAke2VsZW1lbnRTY3JvbGx9YCk7XG4gIH1cbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHBhZ2UgcGF0aCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5wcm90by51cGRhdGVHZXRQYXRoID0gZnVuY3Rpb24oKSB7XG4gIGxldCBvcHRQYXRoID0gdGhpcy5vcHRpb25zLnBhdGg7XG4gIGlmICggIW9wdFBhdGggKSB7XG4gICAgY29uc29sZS5lcnJvcihgSW5maW5pdGVTY3JvbGwgcGF0aCBvcHRpb24gcmVxdWlyZWQuIFNldCBhczogJHtvcHRQYXRofWApO1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBmdW5jdGlvblxuICBsZXQgdHlwZSA9IHR5cGVvZiBvcHRQYXRoO1xuICBpZiAoIHR5cGUgPT0gJ2Z1bmN0aW9uJyApIHtcbiAgICB0aGlzLmdldFBhdGggPSBvcHRQYXRoO1xuICAgIHJldHVybjtcbiAgfVxuICAvLyB0ZW1wbGF0ZSBzdHJpbmc6ICcvcGFnZXMve3sjfX0uaHRtbCdcbiAgbGV0IHRlbXBsYXRlTWF0Y2ggPSB0eXBlID09ICdzdHJpbmcnICYmIG9wdFBhdGgubWF0Y2goJ3t7I319Jyk7XG4gIGlmICggdGVtcGxhdGVNYXRjaCApIHtcbiAgICB0aGlzLnVwZGF0ZUdldFBhdGhUZW1wbGF0ZSggb3B0UGF0aCApO1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBzZWxlY3RvcjogJy5uZXh0LXBhZ2Utc2VsZWN0b3InXG4gIHRoaXMudXBkYXRlR2V0UGF0aFNlbGVjdG9yKCBvcHRQYXRoICk7XG59O1xuXG5wcm90by51cGRhdGVHZXRQYXRoVGVtcGxhdGUgPSBmdW5jdGlvbiggb3B0UGF0aCApIHtcbiAgLy8gc2V0IGdldFBhdGggd2l0aCB0ZW1wbGF0ZSBzdHJpbmdcbiAgdGhpcy5nZXRQYXRoID0gKCkgPT4ge1xuICAgIGxldCBuZXh0SW5kZXggPSB0aGlzLnBhZ2VJbmRleCArIDE7XG4gICAgcmV0dXJuIG9wdFBhdGgucmVwbGFjZSggJ3t7I319JywgbmV4dEluZGV4ICk7XG4gIH07XG4gIC8vIGdldCBwYWdlSW5kZXggZnJvbSBsb2NhdGlvblxuICAvLyBjb252ZXJ0IHBhdGggb3B0aW9uIGludG8gcmVnZXggdG8gbG9vayBmb3IgcGF0dGVybiBpbiBsb2NhdGlvblxuICAvLyBlc2NhcGUgcXVlcnkgKD8pIGluIHVybCwgYWxsb3dzIGZvciBwYXJzaW5nIEdFVCBwYXJhbWV0ZXJzXG4gIGxldCByZWdleFN0cmluZyA9IG9wdFBhdGhcbiAgICAucmVwbGFjZSggLyhcXFxcXFw/fFxcPykvLCAnXFxcXD8nIClcbiAgICAucmVwbGFjZSggJ3t7I319JywgJyhcXFxcZFxcXFxkP1xcXFxkPyknICk7XG4gIGxldCB0ZW1wbGF0ZVJlID0gbmV3IFJlZ0V4cCggcmVnZXhTdHJpbmcgKTtcbiAgbGV0IG1hdGNoID0gbG9jYXRpb24uaHJlZi5tYXRjaCggdGVtcGxhdGVSZSApO1xuXG4gIGlmICggbWF0Y2ggKSB7XG4gICAgdGhpcy5wYWdlSW5kZXggPSBwYXJzZUludCggbWF0Y2hbMV0sIDEwICk7XG4gICAgdGhpcy5sb2coICdwYWdlSW5kZXgnLCBbIHRoaXMucGFnZUluZGV4LCAndGVtcGxhdGUgc3RyaW5nJyBdICk7XG4gIH1cbn07XG5cbmxldCBwYXRoUmVnZXhlcyA9IFtcbiAgLy8gV29yZFByZXNzICYgVHVtYmxyIC0gZXhhbXBsZS5jb20vcGFnZS8yXG4gIC8vIEpla3lsbCAtIGV4YW1wbGUuY29tL3BhZ2UyXG4gIC9eKC4qP1xcLz9wYWdlXFwvPykoXFxkXFxkP1xcZD8pKC4qPyQpLyxcbiAgLy8gRHJ1cGFsIC0gZXhhbXBsZS5jb20vP3BhZ2U9MVxuICAvXiguKj9cXC8/XFw/cGFnZT0pKFxcZFxcZD9cXGQ/KSguKj8kKS8sXG4gIC8vIGNhdGNoIGFsbCwgbGFzdCBvY2N1cmVuY2Ugb2YgYSBudW1iZXJcbiAgLyguKj8pKFxcZFxcZD9cXGQ/KSg/IS4qXFxkKSguKj8kKS8sXG5dO1xuXG4vLyB0cnkgbWF0Y2hpbmcgaHJlZiB0byBwYXRoUmVnZXhlcyBwYXR0ZXJuc1xubGV0IGdldFBhdGhQYXJ0cyA9IEluZmluaXRlU2Nyb2xsLmdldFBhdGhQYXJ0cyA9IGZ1bmN0aW9uKCBocmVmICkge1xuICBpZiAoICFocmVmICkgcmV0dXJuO1xuICBmb3IgKCBsZXQgcmVnZXggb2YgcGF0aFJlZ2V4ZXMgKSB7XG4gICAgbGV0IG1hdGNoID0gaHJlZi5tYXRjaCggcmVnZXggKTtcbiAgICBpZiAoIG1hdGNoICkge1xuICAgICAgbGV0IFsgLCBiZWdpbiwgaW5kZXgsIGVuZCBdID0gbWF0Y2g7XG4gICAgICByZXR1cm4geyBiZWdpbiwgaW5kZXgsIGVuZCB9O1xuICAgIH1cbiAgfVxufTtcblxucHJvdG8udXBkYXRlR2V0UGF0aFNlbGVjdG9yID0gZnVuY3Rpb24oIG9wdFBhdGggKSB7XG4gIC8vIHBhcnNlIGhyZWYgb2YgbGluazogJy5uZXh0LXBhZ2UtbGluaydcbiAgbGV0IGhyZWZFbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvciggb3B0UGF0aCApO1xuICBpZiAoICFocmVmRWxlbSApIHtcbiAgICBjb25zb2xlLmVycm9yKGBCYWQgSW5maW5pdGVTY3JvbGwgcGF0aCBvcHRpb24uIE5leHQgbGluayBub3QgZm91bmQ6ICR7b3B0UGF0aH1gKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQgaHJlZiA9IGhyZWZFbGVtLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuICBsZXQgcGF0aFBhcnRzID0gZ2V0UGF0aFBhcnRzKCBocmVmICk7XG4gIGlmICggIXBhdGhQYXJ0cyApIHtcbiAgICBjb25zb2xlLmVycm9yKGBJbmZpbml0ZVNjcm9sbCB1bmFibGUgdG8gcGFyc2UgbmV4dCBsaW5rIGhyZWY6ICR7aHJlZn1gKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQgeyBiZWdpbiwgaW5kZXgsIGVuZCB9ID0gcGF0aFBhcnRzO1xuICB0aGlzLmlzUGF0aFNlbGVjdG9yID0gdHJ1ZTsgLy8gZmxhZyBmb3IgY2hlY2tMYXN0UGFnZSgpXG4gIHRoaXMuZ2V0UGF0aCA9ICgpID0+IGJlZ2luICsgKCB0aGlzLnBhZ2VJbmRleCArIDEgKSArIGVuZDtcbiAgLy8gZ2V0IHBhZ2VJbmRleCBmcm9tIGhyZWZcbiAgdGhpcy5wYWdlSW5kZXggPSBwYXJzZUludCggaW5kZXgsIDEwICkgLSAxO1xuICB0aGlzLmxvZyggJ3BhZ2VJbmRleCcsIFsgdGhpcy5wYWdlSW5kZXgsICduZXh0IGxpbmsnIF0gKTtcbn07XG5cbnByb3RvLnVwZGF0ZUdldEFic29sdXRlUGF0aCA9IGZ1bmN0aW9uKCkge1xuICBsZXQgcGF0aCA9IHRoaXMuZ2V0UGF0aCgpO1xuICAvLyBwYXRoIGRvZXNuJ3Qgc3RhcnQgd2l0aCBodHRwIG9yIC9cbiAgbGV0IGlzQWJzb2x1dGUgPSBwYXRoLm1hdGNoKCAvXmh0dHAvICkgfHwgcGF0aC5tYXRjaCggL15cXC8vICk7XG4gIGlmICggaXNBYnNvbHV0ZSApIHtcbiAgICB0aGlzLmdldEFic29sdXRlUGF0aCA9IHRoaXMuZ2V0UGF0aDtcbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQgeyBwYXRobmFtZSB9ID0gbG9jYXRpb247XG4gIC8vIHF1ZXJ5IHBhcmFtZXRlciAjODI5LiBleGFtcGxlLmNvbS8/cGc9MlxuICBsZXQgaXNRdWVyeSA9IHBhdGgubWF0Y2goIC9eXFw/LyApO1xuICAvLyAvZm9vL2Jhci9pbmRleC5odG1sID0+IC9mb28vYmFyXG4gIGxldCBkaXJlY3RvcnkgPSBwYXRobmFtZS5zdWJzdHJpbmcoIDAsIHBhdGhuYW1lLmxhc3RJbmRleE9mKCcvJykgKTtcbiAgbGV0IHBhdGhTdGFydCA9IGlzUXVlcnkgPyBwYXRobmFtZSA6IGRpcmVjdG9yeSArICcvJztcblxuICB0aGlzLmdldEFic29sdXRlUGF0aCA9ICgpID0+IHBhdGhTdGFydCArIHRoaXMuZ2V0UGF0aCgpO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gbmF2IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8vIGhpZGUgbmF2aWdhdGlvblxuSW5maW5pdGVTY3JvbGwuY3JlYXRlLmhpZGVOYXYgPSBmdW5jdGlvbigpIHtcbiAgbGV0IG5hdiA9IHV0aWxzLmdldFF1ZXJ5RWxlbWVudCggdGhpcy5vcHRpb25zLmhpZGVOYXYgKTtcbiAgaWYgKCAhbmF2ICkgcmV0dXJuO1xuXG4gIG5hdi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICB0aGlzLm5hdiA9IG5hdjtcbn07XG5cbkluZmluaXRlU2Nyb2xsLmRlc3Ryb3kuaGlkZU5hdiA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIHRoaXMubmF2ICkgdGhpcy5uYXYuc3R5bGUuZGlzcGxheSA9ICcnO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZGVzdHJveSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5wcm90by5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuYWxsT2ZmKCk7IC8vIHJlbW92ZSBhbGwgZXZlbnQgbGlzdGVuZXJzXG4gIC8vIGNhbGwgZGVzdHJveSBtZXRob2RzXG4gIGZvciAoIGxldCBtZXRob2QgaW4gSW5maW5pdGVTY3JvbGwuZGVzdHJveSApIHtcbiAgICBJbmZpbml0ZVNjcm9sbC5kZXN0cm95WyBtZXRob2QgXS5jYWxsKCB0aGlzICk7XG4gIH1cblxuICBkZWxldGUgdGhpcy5lbGVtZW50LmluZmluaXRlU2Nyb2xsR1VJRDtcbiAgZGVsZXRlIGluc3RhbmNlc1sgdGhpcy5ndWlkIF07XG4gIC8vIHJlbW92ZSBqUXVlcnkgZGF0YS4gIzgwN1xuICBpZiAoIGpRdWVyeSAmJiB0aGlzLiRlbGVtZW50ICkge1xuICAgIGpRdWVyeS5yZW1vdmVEYXRhKCB0aGlzLmVsZW1lbnQsICdpbmZpbml0ZVNjcm9sbCcgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gdXRpbGl0aWVzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8vIGh0dHBzOi8vcmVteXNoYXJwLmNvbS8yMDEwLzA3LzIxL3Rocm90dGxpbmctZnVuY3Rpb24tY2FsbHNcbkluZmluaXRlU2Nyb2xsLnRocm90dGxlID0gZnVuY3Rpb24oIGZuLCB0aHJlc2hvbGQgKSB7XG4gIHRocmVzaG9sZCA9IHRocmVzaG9sZCB8fCAyMDA7XG4gIGxldCBsYXN0LCB0aW1lb3V0O1xuXG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBsZXQgbm93ID0gK25ldyBEYXRlKCk7XG4gICAgbGV0IGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgbGV0IHRyaWdnZXIgPSAoKSA9PiB7XG4gICAgICBsYXN0ID0gbm93O1xuICAgICAgZm4uYXBwbHkoIHRoaXMsIGFyZ3MgKTtcbiAgICB9O1xuICAgIGlmICggbGFzdCAmJiBub3cgPCBsYXN0ICsgdGhyZXNob2xkICkge1xuICAgICAgLy8gaG9sZCBvbiB0byBpdFxuICAgICAgY2xlYXJUaW1lb3V0KCB0aW1lb3V0ICk7XG4gICAgICB0aW1lb3V0ID0gc2V0VGltZW91dCggdHJpZ2dlciwgdGhyZXNob2xkICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyaWdnZXIoKTtcbiAgICB9XG4gIH07XG59O1xuXG5JbmZpbml0ZVNjcm9sbC5kYXRhID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIGVsZW0gPSB1dGlscy5nZXRRdWVyeUVsZW1lbnQoIGVsZW0gKTtcbiAgbGV0IGlkID0gZWxlbSAmJiBlbGVtLmluZmluaXRlU2Nyb2xsR1VJRDtcbiAgcmV0dXJuIGlkICYmIGluc3RhbmNlc1sgaWQgXTtcbn07XG5cbi8vIHNldCBpbnRlcm5hbCBqUXVlcnksIGZvciBXZWJwYWNrICsgalF1ZXJ5IHYzXG5JbmZpbml0ZVNjcm9sbC5zZXRKUXVlcnkgPSBmdW5jdGlvbigganFyeSApIHtcbiAgalF1ZXJ5ID0ganFyeTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHNldHVwIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnV0aWxzLmh0bWxJbml0KCBJbmZpbml0ZVNjcm9sbCwgJ2luZmluaXRlLXNjcm9sbCcgKTtcblxuLy8gYWRkIG5vb3AgX2luaXQgbWV0aG9kIGZvciBqUXVlcnkgQnJpZGdldC4gIzc2OFxucHJvdG8uX2luaXQgPSBmdW5jdGlvbigpIHt9O1xuXG5sZXQgeyBqUXVlcnlCcmlkZ2V0IH0gPSB3aW5kb3c7XG5pZiAoIGpRdWVyeSAmJiBqUXVlcnlCcmlkZ2V0ICkge1xuICBqUXVlcnlCcmlkZ2V0KCAnaW5maW5pdGVTY3JvbGwnLCBJbmZpbml0ZVNjcm9sbCwgalF1ZXJ5ICk7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5yZXR1cm4gSW5maW5pdGVTY3JvbGw7XG5cbn0gKSApO1xuIiwiLy8gaGlzdG9yeVxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICB3aW5kb3csXG4gICAgICAgIHJlcXVpcmUoJy4vY29yZScpLFxuICAgICAgICByZXF1aXJlKCdmaXp6eS11aS11dGlscycpLFxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICBmYWN0b3J5KFxuICAgICAgICB3aW5kb3csXG4gICAgICAgIHdpbmRvdy5JbmZpbml0ZVNjcm9sbCxcbiAgICAgICAgd2luZG93LmZpenp5VUlVdGlscyxcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggd2luZG93LCBJbmZpbml0ZVNjcm9sbCwgdXRpbHMgKSB7XG5cbmxldCBwcm90byA9IEluZmluaXRlU2Nyb2xsLnByb3RvdHlwZTtcblxuT2JqZWN0LmFzc2lnbiggSW5maW5pdGVTY3JvbGwuZGVmYXVsdHMsIHtcbiAgaGlzdG9yeTogJ3JlcGxhY2UnLFxuICAvLyBoaXN0b3J5VGl0bGU6IGZhbHNlLFxufSApO1xuXG5sZXQgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcblxuLy8gLS0tLS0gY3JlYXRlL2Rlc3Ryb3kgLS0tLS0gLy9cblxuSW5maW5pdGVTY3JvbGwuY3JlYXRlLmhpc3RvcnkgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGhpcy5vcHRpb25zLmhpc3RvcnkgKSByZXR1cm47XG5cbiAgLy8gY2hlY2sgZm9yIHNhbWUgb3JpZ2luXG4gIGxpbmsuaHJlZiA9IHRoaXMuZ2V0QWJzb2x1dGVQYXRoKCk7XG4gIC8vIE1TIEVkZ2UgZG9lcyBub3QgaGF2ZSBvcmlnaW4gb24gbGlua1xuICAvLyBodHRwczovL2RldmVsb3Blci5taWNyb3NvZnQuY29tL2VuLXVzL21pY3Jvc29mdC1lZGdlL3BsYXRmb3JtL2lzc3Vlcy8xMjIzNjQ5My9cbiAgbGV0IGxpbmtPcmlnaW4gPSBsaW5rLm9yaWdpbiB8fCBsaW5rLnByb3RvY29sICsgJy8vJyArIGxpbmsuaG9zdDtcbiAgbGV0IGlzU2FtZU9yaWdpbiA9IGxpbmtPcmlnaW4gPT0gbG9jYXRpb24ub3JpZ2luO1xuICBpZiAoICFpc1NhbWVPcmlnaW4gKSB7XG4gICAgY29uc29sZS5lcnJvciggJ1tJbmZpbml0ZVNjcm9sbF0gY2Fubm90IHNldCBoaXN0b3J5IHdpdGggZGlmZmVyZW50IG9yaWdpbjogJyArXG4gICAgICBgJHtsaW5rLm9yaWdpbn0gb24gJHtsb2NhdGlvbi5vcmlnaW59IC4gSGlzdG9yeSBiZWhhdmlvciBkaXNhYmxlZC5gICk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gdHdvIHdheXMgdG8gaGFuZGxlIGNoYW5naW5nIGhpc3RvcnlcbiAgaWYgKCB0aGlzLm9wdGlvbnMuYXBwZW5kICkge1xuICAgIHRoaXMuY3JlYXRlSGlzdG9yeUFwcGVuZCgpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuY3JlYXRlSGlzdG9yeVBhZ2VMb2FkKCk7XG4gIH1cbn07XG5cbnByb3RvLmNyZWF0ZUhpc3RvcnlBcHBlbmQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy51cGRhdGVNZWFzdXJlbWVudHMoKTtcbiAgdGhpcy51cGRhdGVTY3JvbGxlcigpO1xuICAvLyBhcnJheSBvZiBzY3JvbGwgcG9zaXRpb25zIG9mIGFwcGVuZGVkIHBhZ2VzXG4gIHRoaXMuc2Nyb2xsUGFnZXMgPSBbXG4gICAgLy8gZmlyc3QgcGFnZVxuICAgIHtcbiAgICAgIHRvcDogMCxcbiAgICAgIHBhdGg6IGxvY2F0aW9uLmhyZWYsXG4gICAgICB0aXRsZTogZG9jdW1lbnQudGl0bGUsXG4gICAgfSxcbiAgXTtcbiAgdGhpcy5zY3JvbGxQYWdlID0gdGhpcy5zY3JvbGxQYWdlc1swXTtcbiAgLy8gZXZlbnRzXG4gIHRoaXMuc2Nyb2xsSGlzdG9yeUhhbmRsZXIgPSB0aGlzLm9uU2Nyb2xsSGlzdG9yeS5iaW5kKCB0aGlzICk7XG4gIHRoaXMudW5sb2FkSGFuZGxlciA9IHRoaXMub25VbmxvYWQuYmluZCggdGhpcyApO1xuICB0aGlzLnNjcm9sbGVyLmFkZEV2ZW50TGlzdGVuZXIoICdzY3JvbGwnLCB0aGlzLnNjcm9sbEhpc3RvcnlIYW5kbGVyICk7XG4gIHRoaXMub24oICdhcHBlbmQnLCB0aGlzLm9uQXBwZW5kSGlzdG9yeSApO1xuICB0aGlzLmJpbmRIaXN0b3J5QXBwZW5kRXZlbnRzKCB0cnVlICk7XG59O1xuXG5wcm90by5iaW5kSGlzdG9yeUFwcGVuZEV2ZW50cyA9IGZ1bmN0aW9uKCBpc0JpbmQgKSB7XG4gIGxldCBhZGRSZW1vdmUgPSBpc0JpbmQgPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gIHRoaXMuc2Nyb2xsZXJbIGFkZFJlbW92ZSBdKCAnc2Nyb2xsJywgdGhpcy5zY3JvbGxIaXN0b3J5SGFuZGxlciApO1xuICB3aW5kb3dbIGFkZFJlbW92ZSBdKCAndW5sb2FkJywgdGhpcy51bmxvYWRIYW5kbGVyICk7XG59O1xuXG5wcm90by5jcmVhdGVIaXN0b3J5UGFnZUxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5vbiggJ2xvYWQnLCB0aGlzLm9uUGFnZUxvYWRIaXN0b3J5ICk7XG59O1xuXG5JbmZpbml0ZVNjcm9sbC5kZXN0cm95Lmhpc3RvcnkgPVxucHJvdG8uZGVzdHJveUhpc3RvcnkgPSBmdW5jdGlvbigpIHtcbiAgbGV0IGlzSGlzdG9yeUFwcGVuZCA9IHRoaXMub3B0aW9ucy5oaXN0b3J5ICYmIHRoaXMub3B0aW9ucy5hcHBlbmQ7XG4gIGlmICggaXNIaXN0b3J5QXBwZW5kICkge1xuICAgIHRoaXMuYmluZEhpc3RvcnlBcHBlbmRFdmVudHMoIGZhbHNlICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIGFwcGVuZCBoaXN0b3J5IC0tLS0tIC8vXG5cbnByb3RvLm9uQXBwZW5kSGlzdG9yeSA9IGZ1bmN0aW9uKCByZXNwb25zZSwgcGF0aCwgaXRlbXMgKSB7XG4gIC8vIGRvIG5vdCBwcm9jZWVkIGlmIG5vIGl0ZW1zLiAjNzc5XG4gIGlmICggIWl0ZW1zIHx8ICFpdGVtcy5sZW5ndGggKSByZXR1cm47XG5cbiAgbGV0IGZpcnN0SXRlbSA9IGl0ZW1zWzBdO1xuICBsZXQgZWxlbVNjcm9sbFkgPSB0aGlzLmdldEVsZW1lbnRTY3JvbGxZKCBmaXJzdEl0ZW0gKTtcbiAgLy8gcmVzb2x2ZSBwYXRoXG4gIGxpbmsuaHJlZiA9IHBhdGg7XG4gIC8vIGFkZCBwYWdlIGRhdGEgdG8gaGFzaFxuICB0aGlzLnNjcm9sbFBhZ2VzLnB1c2goe1xuICAgIHRvcDogZWxlbVNjcm9sbFksXG4gICAgcGF0aDogbGluay5ocmVmLFxuICAgIHRpdGxlOiByZXNwb25zZS50aXRsZSxcbiAgfSk7XG59O1xuXG5wcm90by5nZXRFbGVtZW50U2Nyb2xsWSA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICBpZiAoIHRoaXMub3B0aW9ucy5lbGVtZW50U2Nyb2xsICkge1xuICAgIHJldHVybiBlbGVtLm9mZnNldFRvcCAtIHRoaXMudG9wO1xuICB9IGVsc2Uge1xuICAgIGxldCByZWN0ID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICByZXR1cm4gcmVjdC50b3AgKyB3aW5kb3cuc2Nyb2xsWTtcbiAgfVxufTtcblxucHJvdG8ub25TY3JvbGxIaXN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gIC8vIGN5Y2xlIHRocm91Z2ggcG9zaXRpb25zLCBmaW5kIGJpZ2dlc3Qgd2l0aG91dCBnb2luZyBvdmVyXG4gIGxldCBzY3JvbGxQYWdlID0gdGhpcy5nZXRDbG9zZXN0U2Nyb2xsUGFnZSgpO1xuICAvLyBzZXQgaGlzdG9yeSBpZiBjaGFuZ2VkXG4gIGlmICggc2Nyb2xsUGFnZSAhPSB0aGlzLnNjcm9sbFBhZ2UgKSB7XG4gICAgdGhpcy5zY3JvbGxQYWdlID0gc2Nyb2xsUGFnZTtcbiAgICB0aGlzLnNldEhpc3RvcnkoIHNjcm9sbFBhZ2UudGl0bGUsIHNjcm9sbFBhZ2UucGF0aCApO1xuICB9XG59O1xuXG51dGlscy5kZWJvdW5jZU1ldGhvZCggSW5maW5pdGVTY3JvbGwsICdvblNjcm9sbEhpc3RvcnknLCAxNTAgKTtcblxucHJvdG8uZ2V0Q2xvc2VzdFNjcm9sbFBhZ2UgPSBmdW5jdGlvbigpIHtcbiAgbGV0IHNjcm9sbFZpZXdZO1xuICBpZiAoIHRoaXMub3B0aW9ucy5lbGVtZW50U2Nyb2xsICkge1xuICAgIHNjcm9sbFZpZXdZID0gdGhpcy5zY3JvbGxlci5zY3JvbGxUb3AgKyB0aGlzLnNjcm9sbGVyLmNsaWVudEhlaWdodCAvIDI7XG4gIH0gZWxzZSB7XG4gICAgc2Nyb2xsVmlld1kgPSB3aW5kb3cuc2Nyb2xsWSArIHRoaXMud2luZG93SGVpZ2h0IC8gMjtcbiAgfVxuXG4gIGxldCBzY3JvbGxQYWdlO1xuICBmb3IgKCBsZXQgcGFnZSBvZiB0aGlzLnNjcm9sbFBhZ2VzICkge1xuICAgIGlmICggcGFnZS50b3AgPj0gc2Nyb2xsVmlld1kgKSBicmVhaztcblxuICAgIHNjcm9sbFBhZ2UgPSBwYWdlO1xuICB9XG4gIHJldHVybiBzY3JvbGxQYWdlO1xufTtcblxucHJvdG8uc2V0SGlzdG9yeSA9IGZ1bmN0aW9uKCB0aXRsZSwgcGF0aCApIHtcbiAgbGV0IG9wdEhpc3RvcnkgPSB0aGlzLm9wdGlvbnMuaGlzdG9yeTtcbiAgbGV0IGhpc3RvcnlNZXRob2QgPSBvcHRIaXN0b3J5ICYmIGhpc3RvcnlbIG9wdEhpc3RvcnkgKyAnU3RhdGUnIF07XG4gIGlmICggIWhpc3RvcnlNZXRob2QgKSByZXR1cm47XG5cbiAgaGlzdG9yeVsgb3B0SGlzdG9yeSArICdTdGF0ZScgXSggbnVsbCwgdGl0bGUsIHBhdGggKTtcbiAgaWYgKCB0aGlzLm9wdGlvbnMuaGlzdG9yeVRpdGxlICkgZG9jdW1lbnQudGl0bGUgPSB0aXRsZTtcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAnaGlzdG9yeScsIG51bGwsIFsgdGl0bGUsIHBhdGggXSApO1xufTtcblxuLy8gc2Nyb2xsIHRvIHRvcCB0byBwcmV2ZW50IGluaXRpYWwgc2Nyb2xsLXJlc2V0IGFmdGVyIHBhZ2UgcmVmcmVzaFxuLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE4NjMzOTE1LzE4MjE4M1xucHJvdG8ub25VbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCB0aGlzLnNjcm9sbFBhZ2UudG9wID09PSAwICkgcmV0dXJuO1xuXG4gIC8vIGNhbGN1bGF0ZSB3aGVyZSBzY3JvbGwgcG9zaXRpb24gd291bGQgYmUgb24gcmVmcmVzaFxuICBsZXQgc2Nyb2xsWSA9IHdpbmRvdy5zY3JvbGxZIC0gdGhpcy5zY3JvbGxQYWdlLnRvcCArIHRoaXMudG9wO1xuICAvLyBkaXNhYmxlIHNjcm9sbCBldmVudCBiZWZvcmUgc2V0dGluZyBzY3JvbGwgIzY3OVxuICB0aGlzLmRlc3Ryb3lIaXN0b3J5KCk7XG4gIHNjcm9sbFRvKCAwLCBzY3JvbGxZICk7XG59O1xuXG4vLyAtLS0tLSBsb2FkIGhpc3RvcnkgLS0tLS0gLy9cblxuLy8gdXBkYXRlIFVSTFxucHJvdG8ub25QYWdlTG9hZEhpc3RvcnkgPSBmdW5jdGlvbiggcmVzcG9uc2UsIHBhdGggKSB7XG4gIHRoaXMuc2V0SGlzdG9yeSggcmVzcG9uc2UudGl0bGUsIHBhdGggKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5yZXR1cm4gSW5maW5pdGVTY3JvbGw7XG5cbn0gKSApO1xuIiwiLyohXG4gKiBJbmZpbml0ZSBTY3JvbGwgdjQuMC4xXG4gKiBBdXRvbWF0aWNhbGx5IGFkZCBuZXh0IHBhZ2VcbiAqXG4gKiBMaWNlbnNlZCBHUEx2MyBmb3Igb3BlbiBzb3VyY2UgdXNlXG4gKiBvciBJbmZpbml0ZSBTY3JvbGwgQ29tbWVyY2lhbCBMaWNlbnNlIGZvciBjb21tZXJjaWFsIHVzZVxuICpcbiAqIGh0dHBzOi8vaW5maW5pdGUtc2Nyb2xsLmNvbVxuICogQ29weXJpZ2h0IDIwMTgtMjAyMCBNZXRhZml6enlcbiAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgIHJlcXVpcmUoJy4vY29yZScpLFxuICAgICAgICByZXF1aXJlKCcuL3BhZ2UtbG9hZCcpLFxuICAgICAgICByZXF1aXJlKCcuL3Njcm9sbC13YXRjaCcpLFxuICAgICAgICByZXF1aXJlKCcuL2hpc3RvcnknKSxcbiAgICAgICAgcmVxdWlyZSgnLi9idXR0b24nKSxcbiAgICAgICAgcmVxdWlyZSgnLi9zdGF0dXMnKSxcbiAgICApO1xuICB9XG5cbn0gKSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCBJbmZpbml0ZVNjcm9sbCApIHtcbiAgcmV0dXJuIEluZmluaXRlU2Nyb2xsO1xufSApO1xuIiwiLy8gcGFnZS1sb2FkXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgcmVxdWlyZSgnLi9jb3JlJyksXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgd2luZG93LkluZmluaXRlU2Nyb2xsLFxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEluZmluaXRlU2Nyb2xsICkge1xuXG5sZXQgcHJvdG8gPSBJbmZpbml0ZVNjcm9sbC5wcm90b3R5cGU7XG5cbk9iamVjdC5hc3NpZ24oIEluZmluaXRlU2Nyb2xsLmRlZmF1bHRzLCB7XG4gIC8vIGFwcGVuZDogZmFsc2UsXG4gIGxvYWRPblNjcm9sbDogdHJ1ZSxcbiAgY2hlY2tMYXN0UGFnZTogdHJ1ZSxcbiAgcmVzcG9uc2VCb2R5OiAndGV4dCcsXG4gIGRvbVBhcnNlUmVzcG9uc2U6IHRydWUsXG4gIC8vIHByZWZpbGw6IGZhbHNlLFxuICAvLyBvdXRsYXllcjogbnVsbCxcbn0gKTtcblxuSW5maW5pdGVTY3JvbGwuY3JlYXRlLnBhZ2VMb2FkID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY2FuTG9hZCA9IHRydWU7XG4gIHRoaXMub24oICdzY3JvbGxUaHJlc2hvbGQnLCB0aGlzLm9uU2Nyb2xsVGhyZXNob2xkTG9hZCApO1xuICB0aGlzLm9uKCAnbG9hZCcsIHRoaXMuY2hlY2tMYXN0UGFnZSApO1xuICBpZiAoIHRoaXMub3B0aW9ucy5vdXRsYXllciApIHtcbiAgICB0aGlzLm9uKCAnYXBwZW5kJywgdGhpcy5vbkFwcGVuZE91dGxheWVyICk7XG4gIH1cbn07XG5cbnByb3RvLm9uU2Nyb2xsVGhyZXNob2xkTG9hZCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIHRoaXMub3B0aW9ucy5sb2FkT25TY3JvbGwgKSB0aGlzLmxvYWROZXh0UGFnZSgpO1xufTtcblxubGV0IGRvbVBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcblxucHJvdG8ubG9hZE5leHRQYWdlID0gZnVuY3Rpb24oKSB7XG4gIGlmICggdGhpcy5pc0xvYWRpbmcgfHwgIXRoaXMuY2FuTG9hZCApIHJldHVybjtcblxuICBsZXQgeyByZXNwb25zZUJvZHksIGRvbVBhcnNlUmVzcG9uc2UsIGZldGNoT3B0aW9ucyB9ID0gdGhpcy5vcHRpb25zO1xuICBsZXQgcGF0aCA9IHRoaXMuZ2V0QWJzb2x1dGVQYXRoKCk7XG4gIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZTtcbiAgaWYgKCB0eXBlb2YgZmV0Y2hPcHRpb25zID09ICdmdW5jdGlvbicgKSBmZXRjaE9wdGlvbnMgPSBmZXRjaE9wdGlvbnMoKTtcblxuICBsZXQgZmV0Y2hQcm9taXNlID0gZmV0Y2goIHBhdGgsIGZldGNoT3B0aW9ucyApXG4gICAgLnRoZW4oICggcmVzcG9uc2UgKSA9PiB7XG4gICAgICBpZiAoICFyZXNwb25zZS5vayApIHtcbiAgICAgICAgbGV0IGVycm9yID0gbmV3IEVycm9yKCByZXNwb25zZS5zdGF0dXNUZXh0ICk7XG4gICAgICAgIHRoaXMub25QYWdlRXJyb3IoIGVycm9yLCBwYXRoLCByZXNwb25zZSApO1xuICAgICAgICByZXR1cm4geyByZXNwb25zZSB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzcG9uc2VbIHJlc3BvbnNlQm9keSBdKCkudGhlbiggKCBib2R5ICkgPT4ge1xuICAgICAgICBsZXQgY2FuRG9tUGFyc2UgPSByZXNwb25zZUJvZHkgPT0gJ3RleHQnICYmIGRvbVBhcnNlUmVzcG9uc2U7XG4gICAgICAgIGlmICggY2FuRG9tUGFyc2UgKSB7XG4gICAgICAgICAgYm9keSA9IGRvbVBhcnNlci5wYXJzZUZyb21TdHJpbmcoIGJvZHksICd0ZXh0L2h0bWwnICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCByZXNwb25zZS5zdGF0dXMgPT0gMjA0ICkge1xuICAgICAgICAgIHRoaXMubGFzdFBhZ2VSZWFjaGVkKCBib2R5LCBwYXRoICk7XG4gICAgICAgICAgcmV0dXJuIHsgYm9keSwgcmVzcG9uc2UgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5vblBhZ2VMb2FkKCBib2R5LCBwYXRoLCByZXNwb25zZSApO1xuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfSApXG4gICAgLmNhdGNoKCAoIGVycm9yICkgPT4ge1xuICAgICAgdGhpcy5vblBhZ2VFcnJvciggZXJyb3IsIHBhdGggKTtcbiAgICB9ICk7XG5cbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAncmVxdWVzdCcsIG51bGwsIFsgcGF0aCwgZmV0Y2hQcm9taXNlIF0gKTtcblxuICByZXR1cm4gZmV0Y2hQcm9taXNlO1xufTtcblxucHJvdG8ub25QYWdlTG9hZCA9IGZ1bmN0aW9uKCBib2R5LCBwYXRoLCByZXNwb25zZSApIHtcbiAgLy8gZG9uZSBsb2FkaW5nIGlmIG5vdCBhcHBlbmRpbmdcbiAgaWYgKCAhdGhpcy5vcHRpb25zLmFwcGVuZCApIHtcbiAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xuICB9XG4gIHRoaXMucGFnZUluZGV4Kys7XG4gIHRoaXMubG9hZENvdW50Kys7XG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ2xvYWQnLCBudWxsLCBbIGJvZHksIHBhdGgsIHJlc3BvbnNlIF0gKTtcbiAgcmV0dXJuIHRoaXMuYXBwZW5kTmV4dFBhZ2UoIGJvZHksIHBhdGgsIHJlc3BvbnNlICk7XG59O1xuXG5wcm90by5hcHBlbmROZXh0UGFnZSA9IGZ1bmN0aW9uKCBib2R5LCBwYXRoLCByZXNwb25zZSApIHtcbiAgbGV0IHsgYXBwZW5kLCByZXNwb25zZUJvZHksIGRvbVBhcnNlUmVzcG9uc2UgfSA9IHRoaXMub3B0aW9ucztcbiAgLy8gZG8gbm90IGFwcGVuZCBqc29uXG4gIGxldCBpc0RvY3VtZW50ID0gcmVzcG9uc2VCb2R5ID09ICd0ZXh0JyAmJiBkb21QYXJzZVJlc3BvbnNlO1xuICBpZiAoICFpc0RvY3VtZW50IHx8ICFhcHBlbmQgKSByZXR1cm4geyBib2R5LCByZXNwb25zZSB9O1xuXG4gIGxldCBpdGVtcyA9IGJvZHkucXVlcnlTZWxlY3RvckFsbCggYXBwZW5kICk7XG4gIGxldCBwcm9taXNlVmFsdWUgPSB7IGJvZHksIHJlc3BvbnNlLCBpdGVtcyB9O1xuICAvLyBsYXN0IHBhZ2UgaGl0IGlmIG5vIGl0ZW1zLiAjODQwXG4gIGlmICggIWl0ZW1zIHx8ICFpdGVtcy5sZW5ndGggKSB7XG4gICAgdGhpcy5sYXN0UGFnZVJlYWNoZWQoIGJvZHksIHBhdGggKTtcbiAgICByZXR1cm4gcHJvbWlzZVZhbHVlO1xuICB9XG5cbiAgbGV0IGZyYWdtZW50ID0gZ2V0SXRlbXNGcmFnbWVudCggaXRlbXMgKTtcbiAgbGV0IGFwcGVuZFJlYWR5ID0gKCkgPT4ge1xuICAgIHRoaXMuYXBwZW5kSXRlbXMoIGl0ZW1zLCBmcmFnbWVudCApO1xuICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KCAnYXBwZW5kJywgbnVsbCwgWyBib2R5LCBwYXRoLCBpdGVtcywgcmVzcG9uc2UgXSApO1xuICAgIHJldHVybiBwcm9taXNlVmFsdWU7XG4gIH07XG5cbiAgLy8gVE9ETyBhZGQgaG9vayBmb3Igb3B0aW9uIHRvIHRyaWdnZXIgYXBwZW5kUmVhZHlcbiAgaWYgKCB0aGlzLm9wdGlvbnMub3V0bGF5ZXIgKSB7XG4gICAgcmV0dXJuIHRoaXMuYXBwZW5kT3V0bGF5ZXJJdGVtcyggZnJhZ21lbnQsIGFwcGVuZFJlYWR5ICk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGFwcGVuZFJlYWR5KCk7XG4gIH1cbn07XG5cbnByb3RvLmFwcGVuZEl0ZW1zID0gZnVuY3Rpb24oIGl0ZW1zLCBmcmFnbWVudCApIHtcbiAgaWYgKCAhaXRlbXMgfHwgIWl0ZW1zLmxlbmd0aCApIHJldHVybjtcblxuICAvLyBnZXQgZnJhZ21lbnQgaWYgbm90IHByb3ZpZGVkXG4gIGZyYWdtZW50ID0gZnJhZ21lbnQgfHwgZ2V0SXRlbXNGcmFnbWVudCggaXRlbXMgKTtcbiAgcmVmcmVzaFNjcmlwdHMoIGZyYWdtZW50ICk7XG4gIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCggZnJhZ21lbnQgKTtcbn07XG5cbmZ1bmN0aW9uIGdldEl0ZW1zRnJhZ21lbnQoIGl0ZW1zICkge1xuICAvLyBhZGQgaXRlbXMgdG8gZnJhZ21lbnRcbiAgbGV0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICBpZiAoIGl0ZW1zICkgZnJhZ21lbnQuYXBwZW5kKCAuLi5pdGVtcyApO1xuICByZXR1cm4gZnJhZ21lbnQ7XG59XG5cbi8vIHJlcGxhY2UgPHNjcmlwdD5zIHdpdGggY29waWVzIHNvIHRoZXkgbG9hZFxuLy8gPHNjcmlwdD5zIGFkZGVkIGJ5IEluZmluaXRlU2Nyb2xsIHdpbGwgbm90IGxvYWRcbi8vIHNpbWlsYXIgdG8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNjEwOTk1XG5mdW5jdGlvbiByZWZyZXNoU2NyaXB0cyggZnJhZ21lbnQgKSB7XG4gIGxldCBzY3JpcHRzID0gZnJhZ21lbnQucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0Jyk7XG4gIGZvciAoIGxldCBzY3JpcHQgb2Ygc2NyaXB0cyApIHtcbiAgICBsZXQgZnJlc2hTY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAvLyBjb3B5IGF0dHJpYnV0ZXNcbiAgICBsZXQgYXR0cnMgPSBzY3JpcHQuYXR0cmlidXRlcztcbiAgICBmb3IgKCBsZXQgYXR0ciBvZiBhdHRycyApIHtcbiAgICAgIGZyZXNoU2NyaXB0LnNldEF0dHJpYnV0ZSggYXR0ci5uYW1lLCBhdHRyLnZhbHVlICk7XG4gICAgfVxuICAgIC8vIGNvcHkgaW5uZXIgc2NyaXB0IGNvZGUuICM3MTgsICM3ODJcbiAgICBmcmVzaFNjcmlwdC5pbm5lckhUTUwgPSBzY3JpcHQuaW5uZXJIVE1MO1xuICAgIHNjcmlwdC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZCggZnJlc2hTY3JpcHQsIHNjcmlwdCApO1xuICB9XG59XG5cbi8vIC0tLS0tIG91dGxheWVyIC0tLS0tIC8vXG5cbnByb3RvLmFwcGVuZE91dGxheWVySXRlbXMgPSBmdW5jdGlvbiggZnJhZ21lbnQsIGFwcGVuZFJlYWR5ICkge1xuICBsZXQgaW1hZ2VzTG9hZGVkID0gSW5maW5pdGVTY3JvbGwuaW1hZ2VzTG9hZGVkIHx8IHdpbmRvdy5pbWFnZXNMb2FkZWQ7XG4gIGlmICggIWltYWdlc0xvYWRlZCApIHtcbiAgICBjb25zb2xlLmVycm9yKCdbSW5maW5pdGVTY3JvbGxdIGltYWdlc0xvYWRlZCByZXF1aXJlZCBmb3Igb3V0bGF5ZXIgb3B0aW9uJyk7XG4gICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gYXBwZW5kIG9uY2UgaW1hZ2VzIGxvYWRlZFxuICByZXR1cm4gbmV3IFByb21pc2UoIGZ1bmN0aW9uKCByZXNvbHZlICkge1xuICAgIGltYWdlc0xvYWRlZCggZnJhZ21lbnQsIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IGJvZHlSZXNwb25zZSA9IGFwcGVuZFJlYWR5KCk7XG4gICAgICByZXNvbHZlKCBib2R5UmVzcG9uc2UgKTtcbiAgICB9ICk7XG4gIH0gKTtcbn07XG5cbnByb3RvLm9uQXBwZW5kT3V0bGF5ZXIgPSBmdW5jdGlvbiggcmVzcG9uc2UsIHBhdGgsIGl0ZW1zICkge1xuICB0aGlzLm9wdGlvbnMub3V0bGF5ZXIuYXBwZW5kZWQoIGl0ZW1zICk7XG59O1xuXG4vLyAtLS0tLSBjaGVja0xhc3RQYWdlIC0tLS0tIC8vXG5cbi8vIGNoZWNrIHJlc3BvbnNlIGZvciBuZXh0IGVsZW1lbnRcbnByb3RvLmNoZWNrTGFzdFBhZ2UgPSBmdW5jdGlvbiggYm9keSwgcGF0aCApIHtcbiAgbGV0IHsgY2hlY2tMYXN0UGFnZSwgcGF0aDogcGF0aE9wdCB9ID0gdGhpcy5vcHRpb25zO1xuICBpZiAoICFjaGVja0xhc3RQYWdlICkgcmV0dXJuO1xuXG4gIC8vIGlmIHBhdGggaXMgZnVuY3Rpb24sIGNoZWNrIGlmIG5leHQgcGF0aCBpcyB0cnV0aHlcbiAgaWYgKCB0eXBlb2YgcGF0aE9wdCA9PSAnZnVuY3Rpb24nICkge1xuICAgIGxldCBuZXh0UGF0aCA9IHRoaXMuZ2V0UGF0aCgpO1xuICAgIGlmICggIW5leHRQYXRoICkge1xuICAgICAgdGhpcy5sYXN0UGFnZVJlYWNoZWQoIGJvZHksIHBhdGggKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbiAgLy8gZ2V0IHNlbGVjdG9yIGZyb20gY2hlY2tMYXN0UGFnZSBvciBwYXRoIG9wdGlvblxuICBsZXQgc2VsZWN0b3I7XG4gIGlmICggdHlwZW9mIGNoZWNrTGFzdFBhZ2UgPT0gJ3N0cmluZycgKSB7XG4gICAgc2VsZWN0b3IgPSBjaGVja0xhc3RQYWdlO1xuICB9IGVsc2UgaWYgKCB0aGlzLmlzUGF0aFNlbGVjdG9yICkge1xuICAgIC8vIHBhdGggb3B0aW9uIGlzIHNlbGVjdG9yIHN0cmluZ1xuICAgIHNlbGVjdG9yID0gcGF0aE9wdDtcbiAgfVxuICAvLyBjaGVjayBsYXN0IHBhZ2UgZm9yIHNlbGVjdG9yXG4gIC8vIGJhaWwgaWYgbm8gc2VsZWN0b3Igb3Igbm90IGRvY3VtZW50IHJlc3BvbnNlXG4gIGlmICggIXNlbGVjdG9yIHx8ICFib2R5LnF1ZXJ5U2VsZWN0b3IgKSByZXR1cm47XG5cbiAgLy8gY2hlY2sgaWYgcmVzcG9uc2UgaGFzIHNlbGVjdG9yXG4gIGxldCBuZXh0RWxlbSA9IGJvZHkucXVlcnlTZWxlY3Rvciggc2VsZWN0b3IgKTtcbiAgaWYgKCAhbmV4dEVsZW0gKSB0aGlzLmxhc3RQYWdlUmVhY2hlZCggYm9keSwgcGF0aCApO1xufTtcblxucHJvdG8ubGFzdFBhZ2VSZWFjaGVkID0gZnVuY3Rpb24oIGJvZHksIHBhdGggKSB7XG4gIHRoaXMuY2FuTG9hZCA9IGZhbHNlO1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdsYXN0JywgbnVsbCwgWyBib2R5LCBwYXRoIF0gKTtcbn07XG5cbi8vIC0tLS0tIGVycm9yIC0tLS0tIC8vXG5cbnByb3RvLm9uUGFnZUVycm9yID0gZnVuY3Rpb24oIGVycm9yLCBwYXRoLCByZXNwb25zZSApIHtcbiAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgdGhpcy5jYW5Mb2FkID0gZmFsc2U7XG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ2Vycm9yJywgbnVsbCwgWyBlcnJvciwgcGF0aCwgcmVzcG9uc2UgXSApO1xuICByZXR1cm4gZXJyb3I7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBwcmVmaWxsIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbkluZmluaXRlU2Nyb2xsLmNyZWF0ZS5wcmVmaWxsID0gZnVuY3Rpb24oKSB7XG4gIGlmICggIXRoaXMub3B0aW9ucy5wcmVmaWxsICkgcmV0dXJuO1xuXG4gIGxldCBhcHBlbmQgPSB0aGlzLm9wdGlvbnMuYXBwZW5kO1xuICBpZiAoICFhcHBlbmQgKSB7XG4gICAgY29uc29sZS5lcnJvcihgYXBwZW5kIG9wdGlvbiByZXF1aXJlZCBmb3IgcHJlZmlsbC4gU2V0IGFzIDoke2FwcGVuZH1gKTtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy51cGRhdGVNZWFzdXJlbWVudHMoKTtcbiAgdGhpcy51cGRhdGVTY3JvbGxlcigpO1xuICB0aGlzLmlzUHJlZmlsbGluZyA9IHRydWU7XG4gIHRoaXMub24oICdhcHBlbmQnLCB0aGlzLnByZWZpbGwgKTtcbiAgdGhpcy5vbmNlKCAnZXJyb3InLCB0aGlzLnN0b3BQcmVmaWxsICk7XG4gIHRoaXMub25jZSggJ2xhc3QnLCB0aGlzLnN0b3BQcmVmaWxsICk7XG4gIHRoaXMucHJlZmlsbCgpO1xufTtcblxucHJvdG8ucHJlZmlsbCA9IGZ1bmN0aW9uKCkge1xuICBsZXQgZGlzdGFuY2UgPSB0aGlzLmdldFByZWZpbGxEaXN0YW5jZSgpO1xuICB0aGlzLmlzUHJlZmlsbGluZyA9IGRpc3RhbmNlID49IDA7XG4gIGlmICggdGhpcy5pc1ByZWZpbGxpbmcgKSB7XG4gICAgdGhpcy5sb2coJ3ByZWZpbGwnKTtcbiAgICB0aGlzLmxvYWROZXh0UGFnZSgpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuc3RvcFByZWZpbGwoKTtcbiAgfVxufTtcblxucHJvdG8uZ2V0UHJlZmlsbERpc3RhbmNlID0gZnVuY3Rpb24oKSB7XG4gIC8vIGVsZW1lbnQgc2Nyb2xsXG4gIGlmICggdGhpcy5vcHRpb25zLmVsZW1lbnRTY3JvbGwgKSB7XG4gICAgcmV0dXJuIHRoaXMuc2Nyb2xsZXIuY2xpZW50SGVpZ2h0IC0gdGhpcy5zY3JvbGxlci5zY3JvbGxIZWlnaHQ7XG4gIH1cbiAgLy8gd2luZG93XG4gIHJldHVybiB0aGlzLndpbmRvd0hlaWdodCAtIHRoaXMuZWxlbWVudC5jbGllbnRIZWlnaHQ7XG59O1xuXG5wcm90by5zdG9wUHJlZmlsbCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmxvZygnc3RvcFByZWZpbGwnKTtcbiAgdGhpcy5vZmYoICdhcHBlbmQnLCB0aGlzLnByZWZpbGwgKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5yZXR1cm4gSW5maW5pdGVTY3JvbGw7XG5cbn0gKSApO1xuIiwiLy8gc2Nyb2xsLXdhdGNoXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgcmVxdWlyZSgnLi9jb3JlJyksXG4gICAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJyksXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgd2luZG93LkluZmluaXRlU2Nyb2xsLFxuICAgICAgICB3aW5kb3cuZml6enlVSVV0aWxzLFxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEluZmluaXRlU2Nyb2xsLCB1dGlscyApIHtcblxubGV0IHByb3RvID0gSW5maW5pdGVTY3JvbGwucHJvdG90eXBlO1xuXG4vLyBkZWZhdWx0IG9wdGlvbnNcbk9iamVjdC5hc3NpZ24oIEluZmluaXRlU2Nyb2xsLmRlZmF1bHRzLCB7XG4gIHNjcm9sbFRocmVzaG9sZDogNDAwLFxuICAvLyBlbGVtZW50U2Nyb2xsOiBudWxsLFxufSApO1xuXG5JbmZpbml0ZVNjcm9sbC5jcmVhdGUuc2Nyb2xsV2F0Y2ggPSBmdW5jdGlvbigpIHtcbiAgLy8gZXZlbnRzXG4gIHRoaXMucGFnZVNjcm9sbEhhbmRsZXIgPSB0aGlzLm9uUGFnZVNjcm9sbC5iaW5kKCB0aGlzICk7XG4gIHRoaXMucmVzaXplSGFuZGxlciA9IHRoaXMub25SZXNpemUuYmluZCggdGhpcyApO1xuXG4gIGxldCBzY3JvbGxUaHJlc2hvbGQgPSB0aGlzLm9wdGlvbnMuc2Nyb2xsVGhyZXNob2xkO1xuICBsZXQgaXNFbmFibGUgPSBzY3JvbGxUaHJlc2hvbGQgfHwgc2Nyb2xsVGhyZXNob2xkID09PSAwO1xuICBpZiAoIGlzRW5hYmxlICkgdGhpcy5lbmFibGVTY3JvbGxXYXRjaCgpO1xufTtcblxuSW5maW5pdGVTY3JvbGwuZGVzdHJveS5zY3JvbGxXYXRjaCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmRpc2FibGVTY3JvbGxXYXRjaCgpO1xufTtcblxucHJvdG8uZW5hYmxlU2Nyb2xsV2F0Y2ggPSBmdW5jdGlvbigpIHtcbiAgaWYgKCB0aGlzLmlzU2Nyb2xsV2F0Y2hpbmcgKSByZXR1cm47XG5cbiAgdGhpcy5pc1Njcm9sbFdhdGNoaW5nID0gdHJ1ZTtcbiAgdGhpcy51cGRhdGVNZWFzdXJlbWVudHMoKTtcbiAgdGhpcy51cGRhdGVTY3JvbGxlcigpO1xuICAvLyBUT0RPIGRpc2FibGUgYWZ0ZXIgZXJyb3I/XG4gIHRoaXMub24oICdsYXN0JywgdGhpcy5kaXNhYmxlU2Nyb2xsV2F0Y2ggKTtcbiAgdGhpcy5iaW5kU2Nyb2xsV2F0Y2hFdmVudHMoIHRydWUgKTtcbn07XG5cbnByb3RvLmRpc2FibGVTY3JvbGxXYXRjaCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoICF0aGlzLmlzU2Nyb2xsV2F0Y2hpbmcgKSByZXR1cm47XG5cbiAgdGhpcy5iaW5kU2Nyb2xsV2F0Y2hFdmVudHMoIGZhbHNlICk7XG4gIGRlbGV0ZSB0aGlzLmlzU2Nyb2xsV2F0Y2hpbmc7XG59O1xuXG5wcm90by5iaW5kU2Nyb2xsV2F0Y2hFdmVudHMgPSBmdW5jdGlvbiggaXNCaW5kICkge1xuICBsZXQgYWRkUmVtb3ZlID0gaXNCaW5kID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuICB0aGlzLnNjcm9sbGVyWyBhZGRSZW1vdmUgXSggJ3Njcm9sbCcsIHRoaXMucGFnZVNjcm9sbEhhbmRsZXIgKTtcbiAgd2luZG93WyBhZGRSZW1vdmUgXSggJ3Jlc2l6ZScsIHRoaXMucmVzaXplSGFuZGxlciApO1xufTtcblxucHJvdG8ub25QYWdlU2Nyb2xsID0gSW5maW5pdGVTY3JvbGwudGhyb3R0bGUoIGZ1bmN0aW9uKCkge1xuICBsZXQgZGlzdGFuY2UgPSB0aGlzLmdldEJvdHRvbURpc3RhbmNlKCk7XG4gIGlmICggZGlzdGFuY2UgPD0gdGhpcy5vcHRpb25zLnNjcm9sbFRocmVzaG9sZCApIHtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoJ3Njcm9sbFRocmVzaG9sZCcpO1xuICB9XG59ICk7XG5cbnByb3RvLmdldEJvdHRvbURpc3RhbmNlID0gZnVuY3Rpb24oKSB7XG4gIGxldCBib3R0b20sIHNjcm9sbFk7XG4gIGlmICggdGhpcy5vcHRpb25zLmVsZW1lbnRTY3JvbGwgKSB7XG4gICAgYm90dG9tID0gdGhpcy5zY3JvbGxlci5zY3JvbGxIZWlnaHQ7XG4gICAgc2Nyb2xsWSA9IHRoaXMuc2Nyb2xsZXIuc2Nyb2xsVG9wICsgdGhpcy5zY3JvbGxlci5jbGllbnRIZWlnaHQ7XG4gIH0gZWxzZSB7XG4gICAgYm90dG9tID0gdGhpcy50b3AgKyB0aGlzLmVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgIHNjcm9sbFkgPSB3aW5kb3cuc2Nyb2xsWSArIHRoaXMud2luZG93SGVpZ2h0O1xuICB9XG4gIHJldHVybiBib3R0b20gLSBzY3JvbGxZO1xufTtcblxucHJvdG8ub25SZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy51cGRhdGVNZWFzdXJlbWVudHMoKTtcbn07XG5cbnV0aWxzLmRlYm91bmNlTWV0aG9kKCBJbmZpbml0ZVNjcm9sbCwgJ29uUmVzaXplJywgMTUwICk7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5yZXR1cm4gSW5maW5pdGVTY3JvbGw7XG5cbn0gKSApO1xuIiwiLy8gc3RhdHVzXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgcmVxdWlyZSgnLi9jb3JlJyksXG4gICAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJyksXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgd2luZG93LkluZmluaXRlU2Nyb2xsLFxuICAgICAgICB3aW5kb3cuZml6enlVSVV0aWxzLFxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEluZmluaXRlU2Nyb2xsLCB1dGlscyApIHtcblxubGV0IHByb3RvID0gSW5maW5pdGVTY3JvbGwucHJvdG90eXBlO1xuXG4vLyBJbmZpbml0ZVNjcm9sbC5kZWZhdWx0cy5zdGF0dXMgPSBudWxsO1xuXG5JbmZpbml0ZVNjcm9sbC5jcmVhdGUuc3RhdHVzID0gZnVuY3Rpb24oKSB7XG4gIGxldCBzdGF0dXNFbGVtID0gdXRpbHMuZ2V0UXVlcnlFbGVtZW50KCB0aGlzLm9wdGlvbnMuc3RhdHVzICk7XG4gIGlmICggIXN0YXR1c0VsZW0gKSByZXR1cm47XG5cbiAgLy8gZWxlbWVudHNcbiAgdGhpcy5zdGF0dXNFbGVtZW50ID0gc3RhdHVzRWxlbTtcbiAgdGhpcy5zdGF0dXNFdmVudEVsZW1lbnRzID0ge1xuICAgIHJlcXVlc3Q6IHN0YXR1c0VsZW0ucXVlcnlTZWxlY3RvcignLmluZmluaXRlLXNjcm9sbC1yZXF1ZXN0JyksXG4gICAgZXJyb3I6IHN0YXR1c0VsZW0ucXVlcnlTZWxlY3RvcignLmluZmluaXRlLXNjcm9sbC1lcnJvcicpLFxuICAgIGxhc3Q6IHN0YXR1c0VsZW0ucXVlcnlTZWxlY3RvcignLmluZmluaXRlLXNjcm9sbC1sYXN0JyksXG4gIH07XG4gIC8vIGV2ZW50c1xuICB0aGlzLm9uKCAncmVxdWVzdCcsIHRoaXMuc2hvd1JlcXVlc3RTdGF0dXMgKTtcbiAgdGhpcy5vbiggJ2Vycm9yJywgdGhpcy5zaG93RXJyb3JTdGF0dXMgKTtcbiAgdGhpcy5vbiggJ2xhc3QnLCB0aGlzLnNob3dMYXN0U3RhdHVzICk7XG4gIHRoaXMuYmluZEhpZGVTdGF0dXMoJ29uJyk7XG59O1xuXG5wcm90by5iaW5kSGlkZVN0YXR1cyA9IGZ1bmN0aW9uKCBiaW5kTWV0aG9kICkge1xuICBsZXQgaGlkZUV2ZW50ID0gdGhpcy5vcHRpb25zLmFwcGVuZCA/ICdhcHBlbmQnIDogJ2xvYWQnO1xuICB0aGlzWyBiaW5kTWV0aG9kIF0oIGhpZGVFdmVudCwgdGhpcy5oaWRlQWxsU3RhdHVzICk7XG59O1xuXG5wcm90by5zaG93UmVxdWVzdFN0YXR1cyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnNob3dTdGF0dXMoJ3JlcXVlc3QnKTtcbn07XG5cbnByb3RvLnNob3dFcnJvclN0YXR1cyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnNob3dTdGF0dXMoJ2Vycm9yJyk7XG59O1xuXG5wcm90by5zaG93TGFzdFN0YXR1cyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnNob3dTdGF0dXMoJ2xhc3QnKTtcbiAgLy8gcHJldmVudCBsYXN0IHRoZW4gYXBwZW5kIGV2ZW50IHJhY2UgY29uZGl0aW9uIGZyb20gc2hvd2luZyBsYXN0IHN0YXR1cyAjNzA2XG4gIHRoaXMuYmluZEhpZGVTdGF0dXMoJ29mZicpO1xufTtcblxucHJvdG8uc2hvd1N0YXR1cyA9IGZ1bmN0aW9uKCBldmVudE5hbWUgKSB7XG4gIHNob3coIHRoaXMuc3RhdHVzRWxlbWVudCApO1xuICB0aGlzLmhpZGVTdGF0dXNFdmVudEVsZW1lbnRzKCk7XG4gIGxldCBldmVudEVsZW0gPSB0aGlzLnN0YXR1c0V2ZW50RWxlbWVudHNbIGV2ZW50TmFtZSBdO1xuICBzaG93KCBldmVudEVsZW0gKTtcbn07XG5cbnByb3RvLmhpZGVBbGxTdGF0dXMgPSBmdW5jdGlvbigpIHtcbiAgaGlkZSggdGhpcy5zdGF0dXNFbGVtZW50ICk7XG4gIHRoaXMuaGlkZVN0YXR1c0V2ZW50RWxlbWVudHMoKTtcbn07XG5cbnByb3RvLmhpZGVTdGF0dXNFdmVudEVsZW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gIGZvciAoIGxldCB0eXBlIGluIHRoaXMuc3RhdHVzRXZlbnRFbGVtZW50cyApIHtcbiAgICBsZXQgZXZlbnRFbGVtID0gdGhpcy5zdGF0dXNFdmVudEVsZW1lbnRzWyB0eXBlIF07XG4gICAgaGlkZSggZXZlbnRFbGVtICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBoaWRlKCBlbGVtICkge1xuICBzZXREaXNwbGF5KCBlbGVtLCAnbm9uZScgKTtcbn1cblxuZnVuY3Rpb24gc2hvdyggZWxlbSApIHtcbiAgc2V0RGlzcGxheSggZWxlbSwgJ2Jsb2NrJyApO1xufVxuXG5mdW5jdGlvbiBzZXREaXNwbGF5KCBlbGVtLCB2YWx1ZSApIHtcbiAgaWYgKCBlbGVtICkge1xuICAgIGVsZW0uc3R5bGUuZGlzcGxheSA9IHZhbHVlO1xuICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5yZXR1cm4gSW5maW5pdGVTY3JvbGw7XG5cbn0gKSApO1xuIiwiKGZ1bmN0aW9uKHdpbmRvdywgZmFjdG9yeSkge1xuXHR2YXIgbGF6eVNpemVzID0gZmFjdG9yeSh3aW5kb3csIHdpbmRvdy5kb2N1bWVudCwgRGF0ZSk7XG5cdHdpbmRvdy5sYXp5U2l6ZXMgPSBsYXp5U2l6ZXM7XG5cdGlmKHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpe1xuXHRcdG1vZHVsZS5leHBvcnRzID0gbGF6eVNpemVzO1xuXHR9XG59KHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgP1xuICAgICAgd2luZG93IDoge30sIFxuLyoqXG4gKiBpbXBvcnQoXCIuL3R5cGVzL2dsb2JhbFwiKVxuICogQHR5cGVkZWYgeyBpbXBvcnQoXCIuL3R5cGVzL2xhenlzaXplcy1jb25maWdcIikuTGF6eVNpemVzQ29uZmlnUGFydGlhbCB9IExhenlTaXplc0NvbmZpZ1BhcnRpYWxcbiAqL1xuZnVuY3Rpb24gbCh3aW5kb3csIGRvY3VtZW50LCBEYXRlKSB7IC8vIFBhc3MgaW4gdGhlIHdpbmRvdyBEYXRlIGZ1bmN0aW9uIGFsc28gZm9yIFNTUiBiZWNhdXNlIHRoZSBEYXRlIGNsYXNzIGNhbiBiZSBsb3N0XG5cdCd1c2Ugc3RyaWN0Jztcblx0Lypqc2hpbnQgZXFudWxsOnRydWUgKi9cblxuXHR2YXIgbGF6eXNpemVzLFxuXHRcdC8qKlxuXHRcdCAqIEB0eXBlIHsgTGF6eVNpemVzQ29uZmlnUGFydGlhbCB9XG5cdFx0ICovXG5cdFx0bGF6eVNpemVzQ2ZnO1xuXG5cdChmdW5jdGlvbigpe1xuXHRcdHZhciBwcm9wO1xuXG5cdFx0dmFyIGxhenlTaXplc0RlZmF1bHRzID0ge1xuXHRcdFx0bGF6eUNsYXNzOiAnbGF6eWxvYWQnLFxuXHRcdFx0bG9hZGVkQ2xhc3M6ICdsYXp5bG9hZGVkJyxcblx0XHRcdGxvYWRpbmdDbGFzczogJ2xhenlsb2FkaW5nJyxcblx0XHRcdHByZWxvYWRDbGFzczogJ2xhenlwcmVsb2FkJyxcblx0XHRcdGVycm9yQ2xhc3M6ICdsYXp5ZXJyb3InLFxuXHRcdFx0Ly9zdHJpY3RDbGFzczogJ2xhenlzdHJpY3QnLFxuXHRcdFx0YXV0b3NpemVzQ2xhc3M6ICdsYXp5YXV0b3NpemVzJyxcblx0XHRcdGZhc3RMb2FkZWRDbGFzczogJ2xzLWlzLWNhY2hlZCcsXG5cdFx0XHRpZnJhbWVMb2FkTW9kZTogMCxcblx0XHRcdHNyY0F0dHI6ICdkYXRhLXNyYycsXG5cdFx0XHRzcmNzZXRBdHRyOiAnZGF0YS1zcmNzZXQnLFxuXHRcdFx0c2l6ZXNBdHRyOiAnZGF0YS1zaXplcycsXG5cdFx0XHQvL3ByZWxvYWRBZnRlckxvYWQ6IGZhbHNlLFxuXHRcdFx0bWluU2l6ZTogNDAsXG5cdFx0XHRjdXN0b21NZWRpYToge30sXG5cdFx0XHRpbml0OiB0cnVlLFxuXHRcdFx0ZXhwRmFjdG9yOiAxLjUsXG5cdFx0XHRoRmFjOiAwLjgsXG5cdFx0XHRsb2FkTW9kZTogMixcblx0XHRcdGxvYWRIaWRkZW46IHRydWUsXG5cdFx0XHRyaWNUaW1lb3V0OiAwLFxuXHRcdFx0dGhyb3R0bGVEZWxheTogMTI1LFxuXHRcdH07XG5cblx0XHRsYXp5U2l6ZXNDZmcgPSB3aW5kb3cubGF6eVNpemVzQ29uZmlnIHx8IHdpbmRvdy5sYXp5c2l6ZXNDb25maWcgfHwge307XG5cblx0XHRmb3IocHJvcCBpbiBsYXp5U2l6ZXNEZWZhdWx0cyl7XG5cdFx0XHRpZighKHByb3AgaW4gbGF6eVNpemVzQ2ZnKSl7XG5cdFx0XHRcdGxhenlTaXplc0NmZ1twcm9wXSA9IGxhenlTaXplc0RlZmF1bHRzW3Byb3BdO1xuXHRcdFx0fVxuXHRcdH1cblx0fSkoKTtcblxuXHRpZiAoIWRvY3VtZW50IHx8ICFkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGluaXQ6IGZ1bmN0aW9uICgpIHt9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBAdHlwZSB7IExhenlTaXplc0NvbmZpZ1BhcnRpYWwgfVxuXHRcdFx0ICovXG5cdFx0XHRjZmc6IGxhenlTaXplc0NmZyxcblx0XHRcdC8qKlxuXHRcdFx0ICogQHR5cGUgeyB0cnVlIH1cblx0XHRcdCAqL1xuXHRcdFx0bm9TdXBwb3J0OiB0cnVlLFxuXHRcdH07XG5cdH1cblxuXHR2YXIgZG9jRWxlbSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcblxuXHR2YXIgc3VwcG9ydFBpY3R1cmUgPSB3aW5kb3cuSFRNTFBpY3R1cmVFbGVtZW50O1xuXG5cdHZhciBfYWRkRXZlbnRMaXN0ZW5lciA9ICdhZGRFdmVudExpc3RlbmVyJztcblxuXHR2YXIgX2dldEF0dHJpYnV0ZSA9ICdnZXRBdHRyaWJ1dGUnO1xuXG5cdC8qKlxuXHQgKiBVcGRhdGUgdG8gYmluZCB0byB3aW5kb3cgYmVjYXVzZSAndGhpcycgYmVjb21lcyBudWxsIGR1cmluZyBTU1Jcblx0ICogYnVpbGRzLlxuXHQgKi9cblx0dmFyIGFkZEV2ZW50TGlzdGVuZXIgPSB3aW5kb3dbX2FkZEV2ZW50TGlzdGVuZXJdLmJpbmQod2luZG93KTtcblxuXHR2YXIgc2V0VGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0O1xuXG5cdHZhciByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHNldFRpbWVvdXQ7XG5cblx0dmFyIHJlcXVlc3RJZGxlQ2FsbGJhY2sgPSB3aW5kb3cucmVxdWVzdElkbGVDYWxsYmFjaztcblxuXHR2YXIgcmVnUGljdHVyZSA9IC9ecGljdHVyZSQvaTtcblxuXHR2YXIgbG9hZEV2ZW50cyA9IFsnbG9hZCcsICdlcnJvcicsICdsYXp5aW5jbHVkZWQnLCAnX2xhenlsb2FkZWQnXTtcblxuXHR2YXIgcmVnQ2xhc3NDYWNoZSA9IHt9O1xuXG5cdHZhciBmb3JFYWNoID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2g7XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBlbGUge0VsZW1lbnR9XG5cdCAqIEBwYXJhbSBjbHMge3N0cmluZ31cblx0ICovXG5cdHZhciBoYXNDbGFzcyA9IGZ1bmN0aW9uKGVsZSwgY2xzKSB7XG5cdFx0aWYoIXJlZ0NsYXNzQ2FjaGVbY2xzXSl7XG5cdFx0XHRyZWdDbGFzc0NhY2hlW2Nsc10gPSBuZXcgUmVnRXhwKCcoXFxcXHN8XiknK2NscysnKFxcXFxzfCQpJyk7XG5cdFx0fVxuXHRcdHJldHVybiByZWdDbGFzc0NhY2hlW2Nsc10udGVzdChlbGVbX2dldEF0dHJpYnV0ZV0oJ2NsYXNzJykgfHwgJycpICYmIHJlZ0NsYXNzQ2FjaGVbY2xzXTtcblx0fTtcblxuXHQvKipcblx0ICogQHBhcmFtIGVsZSB7RWxlbWVudH1cblx0ICogQHBhcmFtIGNscyB7c3RyaW5nfVxuXHQgKi9cblx0dmFyIGFkZENsYXNzID0gZnVuY3Rpb24oZWxlLCBjbHMpIHtcblx0XHRpZiAoIWhhc0NsYXNzKGVsZSwgY2xzKSl7XG5cdFx0XHRlbGUuc2V0QXR0cmlidXRlKCdjbGFzcycsIChlbGVbX2dldEF0dHJpYnV0ZV0oJ2NsYXNzJykgfHwgJycpLnRyaW0oKSArICcgJyArIGNscyk7XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBAcGFyYW0gZWxlIHtFbGVtZW50fVxuXHQgKiBAcGFyYW0gY2xzIHtzdHJpbmd9XG5cdCAqL1xuXHR2YXIgcmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbihlbGUsIGNscykge1xuXHRcdHZhciByZWc7XG5cdFx0aWYgKChyZWcgPSBoYXNDbGFzcyhlbGUsY2xzKSkpIHtcblx0XHRcdGVsZS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgKGVsZVtfZ2V0QXR0cmlidXRlXSgnY2xhc3MnKSB8fCAnJykucmVwbGFjZShyZWcsICcgJykpO1xuXHRcdH1cblx0fTtcblxuXHR2YXIgYWRkUmVtb3ZlTG9hZEV2ZW50cyA9IGZ1bmN0aW9uKGRvbSwgZm4sIGFkZCl7XG5cdFx0dmFyIGFjdGlvbiA9IGFkZCA/IF9hZGRFdmVudExpc3RlbmVyIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuXHRcdGlmKGFkZCl7XG5cdFx0XHRhZGRSZW1vdmVMb2FkRXZlbnRzKGRvbSwgZm4pO1xuXHRcdH1cblx0XHRsb2FkRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXZ0KXtcblx0XHRcdGRvbVthY3Rpb25dKGV2dCwgZm4pO1xuXHRcdH0pO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBAcGFyYW0gZWxlbSB7IEVsZW1lbnQgfVxuXHQgKiBAcGFyYW0gbmFtZSB7IHN0cmluZyB9XG5cdCAqIEBwYXJhbSBkZXRhaWwgeyBhbnkgfVxuXHQgKiBAcGFyYW0gbm9CdWJibGVzIHsgYm9vbGVhbiB9XG5cdCAqIEBwYXJhbSBub0NhbmNlbGFibGUgeyBib29sZWFuIH1cblx0ICogQHJldHVybnMgeyBDdXN0b21FdmVudCB9XG5cdCAqL1xuXHR2YXIgdHJpZ2dlckV2ZW50ID0gZnVuY3Rpb24oZWxlbSwgbmFtZSwgZGV0YWlsLCBub0J1YmJsZXMsIG5vQ2FuY2VsYWJsZSl7XG5cdFx0dmFyIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG5cblx0XHRpZighZGV0YWlsKXtcblx0XHRcdGRldGFpbCA9IHt9O1xuXHRcdH1cblxuXHRcdGRldGFpbC5pbnN0YW5jZSA9IGxhenlzaXplcztcblxuXHRcdGV2ZW50LmluaXRFdmVudChuYW1lLCAhbm9CdWJibGVzLCAhbm9DYW5jZWxhYmxlKTtcblxuXHRcdGV2ZW50LmRldGFpbCA9IGRldGFpbDtcblxuXHRcdGVsZW0uZGlzcGF0Y2hFdmVudChldmVudCk7XG5cdFx0cmV0dXJuIGV2ZW50O1xuXHR9O1xuXG5cdHZhciB1cGRhdGVQb2x5ZmlsbCA9IGZ1bmN0aW9uIChlbCwgZnVsbCl7XG5cdFx0dmFyIHBvbHlmaWxsO1xuXHRcdGlmKCAhc3VwcG9ydFBpY3R1cmUgJiYgKCBwb2x5ZmlsbCA9ICh3aW5kb3cucGljdHVyZWZpbGwgfHwgbGF6eVNpemVzQ2ZnLnBmKSApICl7XG5cdFx0XHRpZihmdWxsICYmIGZ1bGwuc3JjICYmICFlbFtfZ2V0QXR0cmlidXRlXSgnc3Jjc2V0Jykpe1xuXHRcdFx0XHRlbC5zZXRBdHRyaWJ1dGUoJ3NyY3NldCcsIGZ1bGwuc3JjKTtcblx0XHRcdH1cblx0XHRcdHBvbHlmaWxsKHtyZWV2YWx1YXRlOiB0cnVlLCBlbGVtZW50czogW2VsXX0pO1xuXHRcdH0gZWxzZSBpZihmdWxsICYmIGZ1bGwuc3JjKXtcblx0XHRcdGVsLnNyYyA9IGZ1bGwuc3JjO1xuXHRcdH1cblx0fTtcblxuXHR2YXIgZ2V0Q1NTID0gZnVuY3Rpb24gKGVsZW0sIHN0eWxlKXtcblx0XHRyZXR1cm4gKGdldENvbXB1dGVkU3R5bGUoZWxlbSwgbnVsbCkgfHwge30pW3N0eWxlXTtcblx0fTtcblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIGVsZW0geyBFbGVtZW50IH1cblx0ICogQHBhcmFtIHBhcmVudCB7IEVsZW1lbnQgfVxuXHQgKiBAcGFyYW0gW3dpZHRoXSB7bnVtYmVyfVxuXHQgKiBAcmV0dXJucyB7bnVtYmVyfVxuXHQgKi9cblx0dmFyIGdldFdpZHRoID0gZnVuY3Rpb24oZWxlbSwgcGFyZW50LCB3aWR0aCl7XG5cdFx0d2lkdGggPSB3aWR0aCB8fCBlbGVtLm9mZnNldFdpZHRoO1xuXG5cdFx0d2hpbGUod2lkdGggPCBsYXp5U2l6ZXNDZmcubWluU2l6ZSAmJiBwYXJlbnQgJiYgIWVsZW0uX2xhenlzaXplc1dpZHRoKXtcblx0XHRcdHdpZHRoID0gIHBhcmVudC5vZmZzZXRXaWR0aDtcblx0XHRcdHBhcmVudCA9IHBhcmVudC5wYXJlbnROb2RlO1xuXHRcdH1cblxuXHRcdHJldHVybiB3aWR0aDtcblx0fTtcblxuXHR2YXIgckFGID0gKGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHJ1bm5pbmcsIHdhaXRpbmc7XG5cdFx0dmFyIGZpcnN0Rm5zID0gW107XG5cdFx0dmFyIHNlY29uZEZucyA9IFtdO1xuXHRcdHZhciBmbnMgPSBmaXJzdEZucztcblxuXHRcdHZhciBydW4gPSBmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHJ1bkZucyA9IGZucztcblxuXHRcdFx0Zm5zID0gZmlyc3RGbnMubGVuZ3RoID8gc2Vjb25kRm5zIDogZmlyc3RGbnM7XG5cblx0XHRcdHJ1bm5pbmcgPSB0cnVlO1xuXHRcdFx0d2FpdGluZyA9IGZhbHNlO1xuXG5cdFx0XHR3aGlsZShydW5GbnMubGVuZ3RoKXtcblx0XHRcdFx0cnVuRm5zLnNoaWZ0KCkoKTtcblx0XHRcdH1cblxuXHRcdFx0cnVubmluZyA9IGZhbHNlO1xuXHRcdH07XG5cblx0XHR2YXIgcmFmQmF0Y2ggPSBmdW5jdGlvbihmbiwgcXVldWUpe1xuXHRcdFx0aWYocnVubmluZyAmJiAhcXVldWUpe1xuXHRcdFx0XHRmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Zm5zLnB1c2goZm4pO1xuXG5cdFx0XHRcdGlmKCF3YWl0aW5nKXtcblx0XHRcdFx0XHR3YWl0aW5nID0gdHJ1ZTtcblx0XHRcdFx0XHQoZG9jdW1lbnQuaGlkZGVuID8gc2V0VGltZW91dCA6IHJlcXVlc3RBbmltYXRpb25GcmFtZSkocnVuKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRyYWZCYXRjaC5fbHNGbHVzaCA9IHJ1bjtcblxuXHRcdHJldHVybiByYWZCYXRjaDtcblx0fSkoKTtcblxuXHR2YXIgckFGSXQgPSBmdW5jdGlvbihmbiwgc2ltcGxlKXtcblx0XHRyZXR1cm4gc2ltcGxlID9cblx0XHRcdGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyQUYoZm4pO1xuXHRcdFx0fSA6XG5cdFx0XHRmdW5jdGlvbigpe1xuXHRcdFx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0XHRcdHZhciBhcmdzID0gYXJndW1lbnRzO1xuXHRcdFx0XHRyQUYoZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRmbi5hcHBseSh0aGF0LCBhcmdzKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0O1xuXHR9O1xuXG5cdHZhciB0aHJvdHRsZSA9IGZ1bmN0aW9uKGZuKXtcblx0XHR2YXIgcnVubmluZztcblx0XHR2YXIgbGFzdFRpbWUgPSAwO1xuXHRcdHZhciBnRGVsYXkgPSBsYXp5U2l6ZXNDZmcudGhyb3R0bGVEZWxheTtcblx0XHR2YXIgcklDVGltZW91dCA9IGxhenlTaXplc0NmZy5yaWNUaW1lb3V0O1xuXHRcdHZhciBydW4gPSBmdW5jdGlvbigpe1xuXHRcdFx0cnVubmluZyA9IGZhbHNlO1xuXHRcdFx0bGFzdFRpbWUgPSBEYXRlLm5vdygpO1xuXHRcdFx0Zm4oKTtcblx0XHR9O1xuXHRcdHZhciBpZGxlQ2FsbGJhY2sgPSByZXF1ZXN0SWRsZUNhbGxiYWNrICYmIHJJQ1RpbWVvdXQgPiA0OSA/XG5cdFx0XHRmdW5jdGlvbigpe1xuXHRcdFx0XHRyZXF1ZXN0SWRsZUNhbGxiYWNrKHJ1biwge3RpbWVvdXQ6IHJJQ1RpbWVvdXR9KTtcblxuXHRcdFx0XHRpZihySUNUaW1lb3V0ICE9PSBsYXp5U2l6ZXNDZmcucmljVGltZW91dCl7XG5cdFx0XHRcdFx0cklDVGltZW91dCA9IGxhenlTaXplc0NmZy5yaWNUaW1lb3V0O1xuXHRcdFx0XHR9XG5cdFx0XHR9IDpcblx0XHRcdHJBRkl0KGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHNldFRpbWVvdXQocnVuKTtcblx0XHRcdH0sIHRydWUpXG5cdFx0O1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGlzUHJpb3JpdHkpe1xuXHRcdFx0dmFyIGRlbGF5O1xuXG5cdFx0XHRpZigoaXNQcmlvcml0eSA9IGlzUHJpb3JpdHkgPT09IHRydWUpKXtcblx0XHRcdFx0cklDVGltZW91dCA9IDMzO1xuXHRcdFx0fVxuXG5cdFx0XHRpZihydW5uaW5nKXtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRydW5uaW5nID0gIHRydWU7XG5cblx0XHRcdGRlbGF5ID0gZ0RlbGF5IC0gKERhdGUubm93KCkgLSBsYXN0VGltZSk7XG5cblx0XHRcdGlmKGRlbGF5IDwgMCl7XG5cdFx0XHRcdGRlbGF5ID0gMDtcblx0XHRcdH1cblxuXHRcdFx0aWYoaXNQcmlvcml0eSB8fCBkZWxheSA8IDkpe1xuXHRcdFx0XHRpZGxlQ2FsbGJhY2soKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNldFRpbWVvdXQoaWRsZUNhbGxiYWNrLCBkZWxheSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fTtcblxuXHQvL2Jhc2VkIG9uIGh0dHA6Ly9tb2Rlcm5qYXZhc2NyaXB0LmJsb2dzcG90LmRlLzIwMTMvMDgvYnVpbGRpbmctYmV0dGVyLWRlYm91bmNlLmh0bWxcblx0dmFyIGRlYm91bmNlID0gZnVuY3Rpb24oZnVuYykge1xuXHRcdHZhciB0aW1lb3V0LCB0aW1lc3RhbXA7XG5cdFx0dmFyIHdhaXQgPSA5OTtcblx0XHR2YXIgcnVuID0gZnVuY3Rpb24oKXtcblx0XHRcdHRpbWVvdXQgPSBudWxsO1xuXHRcdFx0ZnVuYygpO1xuXHRcdH07XG5cdFx0dmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbGFzdCA9IERhdGUubm93KCkgLSB0aW1lc3RhbXA7XG5cblx0XHRcdGlmIChsYXN0IDwgd2FpdCkge1xuXHRcdFx0XHRzZXRUaW1lb3V0KGxhdGVyLCB3YWl0IC0gbGFzdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQocmVxdWVzdElkbGVDYWxsYmFjayB8fCBydW4pKHJ1bik7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdHRpbWVzdGFtcCA9IERhdGUubm93KCk7XG5cblx0XHRcdGlmICghdGltZW91dCkge1xuXHRcdFx0XHR0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fTtcblxuXHR2YXIgbG9hZGVyID0gKGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHByZWxvYWRFbGVtcywgaXNDb21wbGV0ZWQsIHJlc2V0UHJlbG9hZGluZ1RpbWVyLCBsb2FkTW9kZSwgc3RhcnRlZDtcblxuXHRcdHZhciBlTHZXLCBlbHZILCBlTHRvcCwgZUxsZWZ0LCBlTHJpZ2h0LCBlTGJvdHRvbSwgaXNCb2R5SGlkZGVuO1xuXG5cdFx0dmFyIHJlZ0ltZyA9IC9eaW1nJC9pO1xuXHRcdHZhciByZWdJZnJhbWUgPSAvXmlmcmFtZSQvaTtcblxuXHRcdHZhciBzdXBwb3J0U2Nyb2xsID0gKCdvbnNjcm9sbCcgaW4gd2luZG93KSAmJiAhKC8oZ2xlfGluZylib3QvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpO1xuXG5cdFx0dmFyIHNocmlua0V4cGFuZCA9IDA7XG5cdFx0dmFyIGN1cnJlbnRFeHBhbmQgPSAwO1xuXG5cdFx0dmFyIGlzTG9hZGluZyA9IDA7XG5cdFx0dmFyIGxvd1J1bnMgPSAtMTtcblxuXHRcdHZhciByZXNldFByZWxvYWRpbmcgPSBmdW5jdGlvbihlKXtcblx0XHRcdGlzTG9hZGluZy0tO1xuXHRcdFx0aWYoIWUgfHwgaXNMb2FkaW5nIDwgMCB8fCAhZS50YXJnZXQpe1xuXHRcdFx0XHRpc0xvYWRpbmcgPSAwO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHR2YXIgaXNWaXNpYmxlID0gZnVuY3Rpb24gKGVsZW0pIHtcblx0XHRcdGlmIChpc0JvZHlIaWRkZW4gPT0gbnVsbCkge1xuXHRcdFx0XHRpc0JvZHlIaWRkZW4gPSBnZXRDU1MoZG9jdW1lbnQuYm9keSwgJ3Zpc2liaWxpdHknKSA9PSAnaGlkZGVuJztcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGlzQm9keUhpZGRlbiB8fCAhKGdldENTUyhlbGVtLnBhcmVudE5vZGUsICd2aXNpYmlsaXR5JykgPT0gJ2hpZGRlbicgJiYgZ2V0Q1NTKGVsZW0sICd2aXNpYmlsaXR5JykgPT0gJ2hpZGRlbicpO1xuXHRcdH07XG5cblx0XHR2YXIgaXNOZXN0ZWRWaXNpYmxlID0gZnVuY3Rpb24oZWxlbSwgZWxlbUV4cGFuZCl7XG5cdFx0XHR2YXIgb3V0ZXJSZWN0O1xuXHRcdFx0dmFyIHBhcmVudCA9IGVsZW07XG5cdFx0XHR2YXIgdmlzaWJsZSA9IGlzVmlzaWJsZShlbGVtKTtcblxuXHRcdFx0ZUx0b3AgLT0gZWxlbUV4cGFuZDtcblx0XHRcdGVMYm90dG9tICs9IGVsZW1FeHBhbmQ7XG5cdFx0XHRlTGxlZnQgLT0gZWxlbUV4cGFuZDtcblx0XHRcdGVMcmlnaHQgKz0gZWxlbUV4cGFuZDtcblxuXHRcdFx0d2hpbGUodmlzaWJsZSAmJiAocGFyZW50ID0gcGFyZW50Lm9mZnNldFBhcmVudCkgJiYgcGFyZW50ICE9IGRvY3VtZW50LmJvZHkgJiYgcGFyZW50ICE9IGRvY0VsZW0pe1xuXHRcdFx0XHR2aXNpYmxlID0gKChnZXRDU1MocGFyZW50LCAnb3BhY2l0eScpIHx8IDEpID4gMCk7XG5cblx0XHRcdFx0aWYodmlzaWJsZSAmJiBnZXRDU1MocGFyZW50LCAnb3ZlcmZsb3cnKSAhPSAndmlzaWJsZScpe1xuXHRcdFx0XHRcdG91dGVyUmVjdCA9IHBhcmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHRcdFx0XHR2aXNpYmxlID0gZUxyaWdodCA+IG91dGVyUmVjdC5sZWZ0ICYmXG5cdFx0XHRcdFx0XHRlTGxlZnQgPCBvdXRlclJlY3QucmlnaHQgJiZcblx0XHRcdFx0XHRcdGVMYm90dG9tID4gb3V0ZXJSZWN0LnRvcCAtIDEgJiZcblx0XHRcdFx0XHRcdGVMdG9wIDwgb3V0ZXJSZWN0LmJvdHRvbSArIDFcblx0XHRcdFx0XHQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHZpc2libGU7XG5cdFx0fTtcblxuXHRcdHZhciBjaGVja0VsZW1lbnRzID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgZUxsZW4sIGksIHJlY3QsIGF1dG9Mb2FkRWxlbSwgbG9hZGVkU29tZXRoaW5nLCBlbGVtRXhwYW5kLCBlbGVtTmVnYXRpdmVFeHBhbmQsIGVsZW1FeHBhbmRWYWwsXG5cdFx0XHRcdGJlZm9yZUV4cGFuZFZhbCwgZGVmYXVsdEV4cGFuZCwgcHJlbG9hZEV4cGFuZCwgaEZhYztcblx0XHRcdHZhciBsYXp5bG9hZEVsZW1zID0gbGF6eXNpemVzLmVsZW1lbnRzO1xuXG5cdFx0XHRpZigobG9hZE1vZGUgPSBsYXp5U2l6ZXNDZmcubG9hZE1vZGUpICYmIGlzTG9hZGluZyA8IDggJiYgKGVMbGVuID0gbGF6eWxvYWRFbGVtcy5sZW5ndGgpKXtcblxuXHRcdFx0XHRpID0gMDtcblxuXHRcdFx0XHRsb3dSdW5zKys7XG5cblx0XHRcdFx0Zm9yKDsgaSA8IGVMbGVuOyBpKyspe1xuXG5cdFx0XHRcdFx0aWYoIWxhenlsb2FkRWxlbXNbaV0gfHwgbGF6eWxvYWRFbGVtc1tpXS5fbGF6eVJhY2Upe2NvbnRpbnVlO31cblxuXHRcdFx0XHRcdGlmKCFzdXBwb3J0U2Nyb2xsIHx8IChsYXp5c2l6ZXMucHJlbWF0dXJlVW52ZWlsICYmIGxhenlzaXplcy5wcmVtYXR1cmVVbnZlaWwobGF6eWxvYWRFbGVtc1tpXSkpKXt1bnZlaWxFbGVtZW50KGxhenlsb2FkRWxlbXNbaV0pO2NvbnRpbnVlO31cblxuXHRcdFx0XHRcdGlmKCEoZWxlbUV4cGFuZFZhbCA9IGxhenlsb2FkRWxlbXNbaV1bX2dldEF0dHJpYnV0ZV0oJ2RhdGEtZXhwYW5kJykpIHx8ICEoZWxlbUV4cGFuZCA9IGVsZW1FeHBhbmRWYWwgKiAxKSl7XG5cdFx0XHRcdFx0XHRlbGVtRXhwYW5kID0gY3VycmVudEV4cGFuZDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIWRlZmF1bHRFeHBhbmQpIHtcblx0XHRcdFx0XHRcdGRlZmF1bHRFeHBhbmQgPSAoIWxhenlTaXplc0NmZy5leHBhbmQgfHwgbGF6eVNpemVzQ2ZnLmV4cGFuZCA8IDEpID9cblx0XHRcdFx0XHRcdFx0ZG9jRWxlbS5jbGllbnRIZWlnaHQgPiA1MDAgJiYgZG9jRWxlbS5jbGllbnRXaWR0aCA+IDUwMCA/IDUwMCA6IDM3MCA6XG5cdFx0XHRcdFx0XHRcdGxhenlTaXplc0NmZy5leHBhbmQ7XG5cblx0XHRcdFx0XHRcdGxhenlzaXplcy5fZGVmRXggPSBkZWZhdWx0RXhwYW5kO1xuXG5cdFx0XHRcdFx0XHRwcmVsb2FkRXhwYW5kID0gZGVmYXVsdEV4cGFuZCAqIGxhenlTaXplc0NmZy5leHBGYWN0b3I7XG5cdFx0XHRcdFx0XHRoRmFjID0gbGF6eVNpemVzQ2ZnLmhGYWM7XG5cdFx0XHRcdFx0XHRpc0JvZHlIaWRkZW4gPSBudWxsO1xuXG5cdFx0XHRcdFx0XHRpZihjdXJyZW50RXhwYW5kIDwgcHJlbG9hZEV4cGFuZCAmJiBpc0xvYWRpbmcgPCAxICYmIGxvd1J1bnMgPiAyICYmIGxvYWRNb2RlID4gMiAmJiAhZG9jdW1lbnQuaGlkZGVuKXtcblx0XHRcdFx0XHRcdFx0Y3VycmVudEV4cGFuZCA9IHByZWxvYWRFeHBhbmQ7XG5cdFx0XHRcdFx0XHRcdGxvd1J1bnMgPSAwO1xuXHRcdFx0XHRcdFx0fSBlbHNlIGlmKGxvYWRNb2RlID4gMSAmJiBsb3dSdW5zID4gMSAmJiBpc0xvYWRpbmcgPCA2KXtcblx0XHRcdFx0XHRcdFx0Y3VycmVudEV4cGFuZCA9IGRlZmF1bHRFeHBhbmQ7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjdXJyZW50RXhwYW5kID0gc2hyaW5rRXhwYW5kO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmKGJlZm9yZUV4cGFuZFZhbCAhPT0gZWxlbUV4cGFuZCl7XG5cdFx0XHRcdFx0XHRlTHZXID0gaW5uZXJXaWR0aCArIChlbGVtRXhwYW5kICogaEZhYyk7XG5cdFx0XHRcdFx0XHRlbHZIID0gaW5uZXJIZWlnaHQgKyBlbGVtRXhwYW5kO1xuXHRcdFx0XHRcdFx0ZWxlbU5lZ2F0aXZlRXhwYW5kID0gZWxlbUV4cGFuZCAqIC0xO1xuXHRcdFx0XHRcdFx0YmVmb3JlRXhwYW5kVmFsID0gZWxlbUV4cGFuZDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZWN0ID0gbGF6eWxvYWRFbGVtc1tpXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuXHRcdFx0XHRcdGlmICgoZUxib3R0b20gPSByZWN0LmJvdHRvbSkgPj0gZWxlbU5lZ2F0aXZlRXhwYW5kICYmXG5cdFx0XHRcdFx0XHQoZUx0b3AgPSByZWN0LnRvcCkgPD0gZWx2SCAmJlxuXHRcdFx0XHRcdFx0KGVMcmlnaHQgPSByZWN0LnJpZ2h0KSA+PSBlbGVtTmVnYXRpdmVFeHBhbmQgKiBoRmFjICYmXG5cdFx0XHRcdFx0XHQoZUxsZWZ0ID0gcmVjdC5sZWZ0KSA8PSBlTHZXICYmXG5cdFx0XHRcdFx0XHQoZUxib3R0b20gfHwgZUxyaWdodCB8fCBlTGxlZnQgfHwgZUx0b3ApICYmXG5cdFx0XHRcdFx0XHQobGF6eVNpemVzQ2ZnLmxvYWRIaWRkZW4gfHwgaXNWaXNpYmxlKGxhenlsb2FkRWxlbXNbaV0pKSAmJlxuXHRcdFx0XHRcdFx0KChpc0NvbXBsZXRlZCAmJiBpc0xvYWRpbmcgPCAzICYmICFlbGVtRXhwYW5kVmFsICYmIChsb2FkTW9kZSA8IDMgfHwgbG93UnVucyA8IDQpKSB8fCBpc05lc3RlZFZpc2libGUobGF6eWxvYWRFbGVtc1tpXSwgZWxlbUV4cGFuZCkpKXtcblx0XHRcdFx0XHRcdHVudmVpbEVsZW1lbnQobGF6eWxvYWRFbGVtc1tpXSk7XG5cdFx0XHRcdFx0XHRsb2FkZWRTb21ldGhpbmcgPSB0cnVlO1xuXHRcdFx0XHRcdFx0aWYoaXNMb2FkaW5nID4gOSl7YnJlYWs7fVxuXHRcdFx0XHRcdH0gZWxzZSBpZighbG9hZGVkU29tZXRoaW5nICYmIGlzQ29tcGxldGVkICYmICFhdXRvTG9hZEVsZW0gJiZcblx0XHRcdFx0XHRcdGlzTG9hZGluZyA8IDQgJiYgbG93UnVucyA8IDQgJiYgbG9hZE1vZGUgPiAyICYmXG5cdFx0XHRcdFx0XHQocHJlbG9hZEVsZW1zWzBdIHx8IGxhenlTaXplc0NmZy5wcmVsb2FkQWZ0ZXJMb2FkKSAmJlxuXHRcdFx0XHRcdFx0KHByZWxvYWRFbGVtc1swXSB8fCAoIWVsZW1FeHBhbmRWYWwgJiYgKChlTGJvdHRvbSB8fCBlTHJpZ2h0IHx8IGVMbGVmdCB8fCBlTHRvcCkgfHwgbGF6eWxvYWRFbGVtc1tpXVtfZ2V0QXR0cmlidXRlXShsYXp5U2l6ZXNDZmcuc2l6ZXNBdHRyKSAhPSAnYXV0bycpKSkpe1xuXHRcdFx0XHRcdFx0YXV0b0xvYWRFbGVtID0gcHJlbG9hZEVsZW1zWzBdIHx8IGxhenlsb2FkRWxlbXNbaV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoYXV0b0xvYWRFbGVtICYmICFsb2FkZWRTb21ldGhpbmcpe1xuXHRcdFx0XHRcdHVudmVpbEVsZW1lbnQoYXV0b0xvYWRFbGVtKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHR2YXIgdGhyb3R0bGVkQ2hlY2tFbGVtZW50cyA9IHRocm90dGxlKGNoZWNrRWxlbWVudHMpO1xuXG5cdFx0dmFyIHN3aXRjaExvYWRpbmdDbGFzcyA9IGZ1bmN0aW9uKGUpe1xuXHRcdFx0dmFyIGVsZW0gPSBlLnRhcmdldDtcblxuXHRcdFx0aWYgKGVsZW0uX2xhenlDYWNoZSkge1xuXHRcdFx0XHRkZWxldGUgZWxlbS5fbGF6eUNhY2hlO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHJlc2V0UHJlbG9hZGluZyhlKTtcblx0XHRcdGFkZENsYXNzKGVsZW0sIGxhenlTaXplc0NmZy5sb2FkZWRDbGFzcyk7XG5cdFx0XHRyZW1vdmVDbGFzcyhlbGVtLCBsYXp5U2l6ZXNDZmcubG9hZGluZ0NsYXNzKTtcblx0XHRcdGFkZFJlbW92ZUxvYWRFdmVudHMoZWxlbSwgcmFmU3dpdGNoTG9hZGluZ0NsYXNzKTtcblx0XHRcdHRyaWdnZXJFdmVudChlbGVtLCAnbGF6eWxvYWRlZCcpO1xuXHRcdH07XG5cdFx0dmFyIHJhZmVkU3dpdGNoTG9hZGluZ0NsYXNzID0gckFGSXQoc3dpdGNoTG9hZGluZ0NsYXNzKTtcblx0XHR2YXIgcmFmU3dpdGNoTG9hZGluZ0NsYXNzID0gZnVuY3Rpb24oZSl7XG5cdFx0XHRyYWZlZFN3aXRjaExvYWRpbmdDbGFzcyh7dGFyZ2V0OiBlLnRhcmdldH0pO1xuXHRcdH07XG5cblx0XHR2YXIgY2hhbmdlSWZyYW1lU3JjID0gZnVuY3Rpb24oZWxlbSwgc3JjKXtcblx0XHRcdHZhciBsb2FkTW9kZSA9IGVsZW0uZ2V0QXR0cmlidXRlKCdkYXRhLWxvYWQtbW9kZScpIHx8IGxhenlTaXplc0NmZy5pZnJhbWVMb2FkTW9kZTtcblxuXHRcdFx0Ly8gbG9hZE1vZGUgY2FuIGJlIGFsc28gYSBzdHJpbmchXG5cdFx0XHRpZiAobG9hZE1vZGUgPT0gMCkge1xuXHRcdFx0XHRlbGVtLmNvbnRlbnRXaW5kb3cubG9jYXRpb24ucmVwbGFjZShzcmMpO1xuXHRcdFx0fSBlbHNlIGlmIChsb2FkTW9kZSA9PSAxKSB7XG5cdFx0XHRcdGVsZW0uc3JjID0gc3JjO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHR2YXIgaGFuZGxlU291cmNlcyA9IGZ1bmN0aW9uKHNvdXJjZSl7XG5cdFx0XHR2YXIgY3VzdG9tTWVkaWE7XG5cblx0XHRcdHZhciBzb3VyY2VTcmNzZXQgPSBzb3VyY2VbX2dldEF0dHJpYnV0ZV0obGF6eVNpemVzQ2ZnLnNyY3NldEF0dHIpO1xuXG5cdFx0XHRpZiggKGN1c3RvbU1lZGlhID0gbGF6eVNpemVzQ2ZnLmN1c3RvbU1lZGlhW3NvdXJjZVtfZ2V0QXR0cmlidXRlXSgnZGF0YS1tZWRpYScpIHx8IHNvdXJjZVtfZ2V0QXR0cmlidXRlXSgnbWVkaWEnKV0pICl7XG5cdFx0XHRcdHNvdXJjZS5zZXRBdHRyaWJ1dGUoJ21lZGlhJywgY3VzdG9tTWVkaWEpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZihzb3VyY2VTcmNzZXQpe1xuXHRcdFx0XHRzb3VyY2Uuc2V0QXR0cmlidXRlKCdzcmNzZXQnLCBzb3VyY2VTcmNzZXQpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHR2YXIgbGF6eVVudmVpbCA9IHJBRkl0KGZ1bmN0aW9uIChlbGVtLCBkZXRhaWwsIGlzQXV0bywgc2l6ZXMsIGlzSW1nKXtcblx0XHRcdHZhciBzcmMsIHNyY3NldCwgcGFyZW50LCBpc1BpY3R1cmUsIGV2ZW50LCBmaXJlc0xvYWQ7XG5cblx0XHRcdGlmKCEoZXZlbnQgPSB0cmlnZ2VyRXZlbnQoZWxlbSwgJ2xhenliZWZvcmV1bnZlaWwnLCBkZXRhaWwpKS5kZWZhdWx0UHJldmVudGVkKXtcblxuXHRcdFx0XHRpZihzaXplcyl7XG5cdFx0XHRcdFx0aWYoaXNBdXRvKXtcblx0XHRcdFx0XHRcdGFkZENsYXNzKGVsZW0sIGxhenlTaXplc0NmZy5hdXRvc2l6ZXNDbGFzcyk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGVsZW0uc2V0QXR0cmlidXRlKCdzaXplcycsIHNpemVzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRzcmNzZXQgPSBlbGVtW19nZXRBdHRyaWJ1dGVdKGxhenlTaXplc0NmZy5zcmNzZXRBdHRyKTtcblx0XHRcdFx0c3JjID0gZWxlbVtfZ2V0QXR0cmlidXRlXShsYXp5U2l6ZXNDZmcuc3JjQXR0cik7XG5cblx0XHRcdFx0aWYoaXNJbWcpIHtcblx0XHRcdFx0XHRwYXJlbnQgPSBlbGVtLnBhcmVudE5vZGU7XG5cdFx0XHRcdFx0aXNQaWN0dXJlID0gcGFyZW50ICYmIHJlZ1BpY3R1cmUudGVzdChwYXJlbnQubm9kZU5hbWUgfHwgJycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZmlyZXNMb2FkID0gZGV0YWlsLmZpcmVzTG9hZCB8fCAoKCdzcmMnIGluIGVsZW0pICYmIChzcmNzZXQgfHwgc3JjIHx8IGlzUGljdHVyZSkpO1xuXG5cdFx0XHRcdGV2ZW50ID0ge3RhcmdldDogZWxlbX07XG5cblx0XHRcdFx0YWRkQ2xhc3MoZWxlbSwgbGF6eVNpemVzQ2ZnLmxvYWRpbmdDbGFzcyk7XG5cblx0XHRcdFx0aWYoZmlyZXNMb2FkKXtcblx0XHRcdFx0XHRjbGVhclRpbWVvdXQocmVzZXRQcmVsb2FkaW5nVGltZXIpO1xuXHRcdFx0XHRcdHJlc2V0UHJlbG9hZGluZ1RpbWVyID0gc2V0VGltZW91dChyZXNldFByZWxvYWRpbmcsIDI1MDApO1xuXHRcdFx0XHRcdGFkZFJlbW92ZUxvYWRFdmVudHMoZWxlbSwgcmFmU3dpdGNoTG9hZGluZ0NsYXNzLCB0cnVlKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKGlzUGljdHVyZSl7XG5cdFx0XHRcdFx0Zm9yRWFjaC5jYWxsKHBhcmVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc291cmNlJyksIGhhbmRsZVNvdXJjZXMpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoc3Jjc2V0KXtcblx0XHRcdFx0XHRlbGVtLnNldEF0dHJpYnV0ZSgnc3Jjc2V0Jywgc3Jjc2V0KTtcblx0XHRcdFx0fSBlbHNlIGlmKHNyYyAmJiAhaXNQaWN0dXJlKXtcblx0XHRcdFx0XHRpZihyZWdJZnJhbWUudGVzdChlbGVtLm5vZGVOYW1lKSl7XG5cdFx0XHRcdFx0XHRjaGFuZ2VJZnJhbWVTcmMoZWxlbSwgc3JjKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZWxlbS5zcmMgPSBzcmM7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoaXNJbWcgJiYgKHNyY3NldCB8fCBpc1BpY3R1cmUpKXtcblx0XHRcdFx0XHR1cGRhdGVQb2x5ZmlsbChlbGVtLCB7c3JjOiBzcmN9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZihlbGVtLl9sYXp5UmFjZSl7XG5cdFx0XHRcdGRlbGV0ZSBlbGVtLl9sYXp5UmFjZTtcblx0XHRcdH1cblx0XHRcdHJlbW92ZUNsYXNzKGVsZW0sIGxhenlTaXplc0NmZy5sYXp5Q2xhc3MpO1xuXG5cdFx0XHRyQUYoZnVuY3Rpb24oKXtcblx0XHRcdFx0Ly8gUGFydCBvZiB0aGlzIGNhbiBiZSByZW1vdmVkIGFzIHNvb24gYXMgdGhpcyBmaXggaXMgb2xkZXI6IGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTc3MzEgKDIwMTUpXG5cdFx0XHRcdHZhciBpc0xvYWRlZCA9IGVsZW0uY29tcGxldGUgJiYgZWxlbS5uYXR1cmFsV2lkdGggPiAxO1xuXG5cdFx0XHRcdGlmKCAhZmlyZXNMb2FkIHx8IGlzTG9hZGVkKXtcblx0XHRcdFx0XHRpZiAoaXNMb2FkZWQpIHtcblx0XHRcdFx0XHRcdGFkZENsYXNzKGVsZW0sIGxhenlTaXplc0NmZy5mYXN0TG9hZGVkQ2xhc3MpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRzd2l0Y2hMb2FkaW5nQ2xhc3MoZXZlbnQpO1xuXHRcdFx0XHRcdGVsZW0uX2xhenlDYWNoZSA9IHRydWU7XG5cdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdFx0aWYgKCdfbGF6eUNhY2hlJyBpbiBlbGVtKSB7XG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSBlbGVtLl9sYXp5Q2FjaGU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSwgOSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGVsZW0ubG9hZGluZyA9PSAnbGF6eScpIHtcblx0XHRcdFx0XHRpc0xvYWRpbmctLTtcblx0XHRcdFx0fVxuXHRcdFx0fSwgdHJ1ZSk7XG5cdFx0fSk7XG5cblx0XHQvKipcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlbGVtIHsgRWxlbWVudCB9XG5cdFx0ICovXG5cdFx0dmFyIHVudmVpbEVsZW1lbnQgPSBmdW5jdGlvbiAoZWxlbSl7XG5cdFx0XHRpZiAoZWxlbS5fbGF6eVJhY2UpIHtyZXR1cm47fVxuXHRcdFx0dmFyIGRldGFpbDtcblxuXHRcdFx0dmFyIGlzSW1nID0gcmVnSW1nLnRlc3QoZWxlbS5ub2RlTmFtZSk7XG5cblx0XHRcdC8vYWxsb3cgdXNpbmcgc2l6ZXM9XCJhdXRvXCIsIGJ1dCBkb24ndCB1c2UuIGl0J3MgaW52YWxpZC4gVXNlIGRhdGEtc2l6ZXM9XCJhdXRvXCIgb3IgYSB2YWxpZCB2YWx1ZSBmb3Igc2l6ZXMgaW5zdGVhZCAoaS5lLjogc2l6ZXM9XCI4MHZ3XCIpXG5cdFx0XHR2YXIgc2l6ZXMgPSBpc0ltZyAmJiAoZWxlbVtfZ2V0QXR0cmlidXRlXShsYXp5U2l6ZXNDZmcuc2l6ZXNBdHRyKSB8fCBlbGVtW19nZXRBdHRyaWJ1dGVdKCdzaXplcycpKTtcblx0XHRcdHZhciBpc0F1dG8gPSBzaXplcyA9PSAnYXV0byc7XG5cblx0XHRcdGlmKCAoaXNBdXRvIHx8ICFpc0NvbXBsZXRlZCkgJiYgaXNJbWcgJiYgKGVsZW1bX2dldEF0dHJpYnV0ZV0oJ3NyYycpIHx8IGVsZW0uc3Jjc2V0KSAmJiAhZWxlbS5jb21wbGV0ZSAmJiAhaGFzQ2xhc3MoZWxlbSwgbGF6eVNpemVzQ2ZnLmVycm9yQ2xhc3MpICYmIGhhc0NsYXNzKGVsZW0sIGxhenlTaXplc0NmZy5sYXp5Q2xhc3MpKXtyZXR1cm47fVxuXG5cdFx0XHRkZXRhaWwgPSB0cmlnZ2VyRXZlbnQoZWxlbSwgJ2xhenl1bnZlaWxyZWFkJykuZGV0YWlsO1xuXG5cdFx0XHRpZihpc0F1dG8pe1xuXHRcdFx0XHQgYXV0b1NpemVyLnVwZGF0ZUVsZW0oZWxlbSwgdHJ1ZSwgZWxlbS5vZmZzZXRXaWR0aCk7XG5cdFx0XHR9XG5cblx0XHRcdGVsZW0uX2xhenlSYWNlID0gdHJ1ZTtcblx0XHRcdGlzTG9hZGluZysrO1xuXG5cdFx0XHRsYXp5VW52ZWlsKGVsZW0sIGRldGFpbCwgaXNBdXRvLCBzaXplcywgaXNJbWcpO1xuXHRcdH07XG5cblx0XHR2YXIgYWZ0ZXJTY3JvbGwgPSBkZWJvdW5jZShmdW5jdGlvbigpe1xuXHRcdFx0bGF6eVNpemVzQ2ZnLmxvYWRNb2RlID0gMztcblx0XHRcdHRocm90dGxlZENoZWNrRWxlbWVudHMoKTtcblx0XHR9KTtcblxuXHRcdHZhciBhbHRMb2FkbW9kZVNjcm9sbExpc3RuZXIgPSBmdW5jdGlvbigpe1xuXHRcdFx0aWYobGF6eVNpemVzQ2ZnLmxvYWRNb2RlID09IDMpe1xuXHRcdFx0XHRsYXp5U2l6ZXNDZmcubG9hZE1vZGUgPSAyO1xuXHRcdFx0fVxuXHRcdFx0YWZ0ZXJTY3JvbGwoKTtcblx0XHR9O1xuXG5cdFx0dmFyIG9ubG9hZCA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRpZihpc0NvbXBsZXRlZCl7cmV0dXJuO31cblx0XHRcdGlmKERhdGUubm93KCkgLSBzdGFydGVkIDwgOTk5KXtcblx0XHRcdFx0c2V0VGltZW91dChvbmxvYWQsIDk5OSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXG5cdFx0XHRpc0NvbXBsZXRlZCA9IHRydWU7XG5cblx0XHRcdGxhenlTaXplc0NmZy5sb2FkTW9kZSA9IDM7XG5cblx0XHRcdHRocm90dGxlZENoZWNrRWxlbWVudHMoKTtcblxuXHRcdFx0YWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgYWx0TG9hZG1vZGVTY3JvbGxMaXN0bmVyLCB0cnVlKTtcblx0XHR9O1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdF86IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHN0YXJ0ZWQgPSBEYXRlLm5vdygpO1xuXG5cdFx0XHRcdGxhenlzaXplcy5lbGVtZW50cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUobGF6eVNpemVzQ2ZnLmxhenlDbGFzcyk7XG5cdFx0XHRcdHByZWxvYWRFbGVtcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUobGF6eVNpemVzQ2ZnLmxhenlDbGFzcyArICcgJyArIGxhenlTaXplc0NmZy5wcmVsb2FkQ2xhc3MpO1xuXG5cdFx0XHRcdGFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRocm90dGxlZENoZWNrRWxlbWVudHMsIHRydWUpO1xuXG5cdFx0XHRcdGFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRocm90dGxlZENoZWNrRWxlbWVudHMsIHRydWUpO1xuXG5cdFx0XHRcdGFkZEV2ZW50TGlzdGVuZXIoJ3BhZ2VzaG93JywgZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0XHRpZiAoZS5wZXJzaXN0ZWQpIHtcblx0XHRcdFx0XHRcdHZhciBsb2FkaW5nRWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuJyArIGxhenlTaXplc0NmZy5sb2FkaW5nQ2xhc3MpO1xuXG5cdFx0XHRcdFx0XHRpZiAobG9hZGluZ0VsZW1lbnRzLmxlbmd0aCAmJiBsb2FkaW5nRWxlbWVudHMuZm9yRWFjaCkge1xuXHRcdFx0XHRcdFx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdGxvYWRpbmdFbGVtZW50cy5mb3JFYWNoKCBmdW5jdGlvbiAoaW1nKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoaW1nLmNvbXBsZXRlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHVudmVpbEVsZW1lbnQoaW1nKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRpZih3aW5kb3cuTXV0YXRpb25PYnNlcnZlcil7XG5cdFx0XHRcdFx0bmV3IE11dGF0aW9uT2JzZXJ2ZXIoIHRocm90dGxlZENoZWNrRWxlbWVudHMgKS5vYnNlcnZlKCBkb2NFbGVtLCB7Y2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlLCBhdHRyaWJ1dGVzOiB0cnVlfSApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGRvY0VsZW1bX2FkZEV2ZW50TGlzdGVuZXJdKCdET01Ob2RlSW5zZXJ0ZWQnLCB0aHJvdHRsZWRDaGVja0VsZW1lbnRzLCB0cnVlKTtcblx0XHRcdFx0XHRkb2NFbGVtW19hZGRFdmVudExpc3RlbmVyXSgnRE9NQXR0ck1vZGlmaWVkJywgdGhyb3R0bGVkQ2hlY2tFbGVtZW50cywgdHJ1ZSk7XG5cdFx0XHRcdFx0c2V0SW50ZXJ2YWwodGhyb3R0bGVkQ2hlY2tFbGVtZW50cywgOTk5KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCB0aHJvdHRsZWRDaGVja0VsZW1lbnRzLCB0cnVlKTtcblxuXHRcdFx0XHQvLywgJ2Z1bGxzY3JlZW5jaGFuZ2UnXG5cdFx0XHRcdFsnZm9jdXMnLCAnbW91c2VvdmVyJywgJ2NsaWNrJywgJ2xvYWQnLCAndHJhbnNpdGlvbmVuZCcsICdhbmltYXRpb25lbmQnXS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpe1xuXHRcdFx0XHRcdGRvY3VtZW50W19hZGRFdmVudExpc3RlbmVyXShuYW1lLCB0aHJvdHRsZWRDaGVja0VsZW1lbnRzLCB0cnVlKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0aWYoKC9kJHxeYy8udGVzdChkb2N1bWVudC5yZWFkeVN0YXRlKSkpe1xuXHRcdFx0XHRcdG9ubG9hZCgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbmxvYWQpO1xuXHRcdFx0XHRcdGRvY3VtZW50W19hZGRFdmVudExpc3RlbmVyXSgnRE9NQ29udGVudExvYWRlZCcsIHRocm90dGxlZENoZWNrRWxlbWVudHMpO1xuXHRcdFx0XHRcdHNldFRpbWVvdXQob25sb2FkLCAyMDAwMCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihsYXp5c2l6ZXMuZWxlbWVudHMubGVuZ3RoKXtcblx0XHRcdFx0XHRjaGVja0VsZW1lbnRzKCk7XG5cdFx0XHRcdFx0ckFGLl9sc0ZsdXNoKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhyb3R0bGVkQ2hlY2tFbGVtZW50cygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0Y2hlY2tFbGVtczogdGhyb3R0bGVkQ2hlY2tFbGVtZW50cyxcblx0XHRcdHVudmVpbDogdW52ZWlsRWxlbWVudCxcblx0XHRcdF9hTFNMOiBhbHRMb2FkbW9kZVNjcm9sbExpc3RuZXIsXG5cdFx0fTtcblx0fSkoKTtcblxuXG5cdHZhciBhdXRvU2l6ZXIgPSAoZnVuY3Rpb24oKXtcblx0XHR2YXIgYXV0b3NpemVzRWxlbXM7XG5cblx0XHR2YXIgc2l6ZUVsZW1lbnQgPSByQUZJdChmdW5jdGlvbihlbGVtLCBwYXJlbnQsIGV2ZW50LCB3aWR0aCl7XG5cdFx0XHR2YXIgc291cmNlcywgaSwgbGVuO1xuXHRcdFx0ZWxlbS5fbGF6eXNpemVzV2lkdGggPSB3aWR0aDtcblx0XHRcdHdpZHRoICs9ICdweCc7XG5cblx0XHRcdGVsZW0uc2V0QXR0cmlidXRlKCdzaXplcycsIHdpZHRoKTtcblxuXHRcdFx0aWYocmVnUGljdHVyZS50ZXN0KHBhcmVudC5ub2RlTmFtZSB8fCAnJykpe1xuXHRcdFx0XHRzb3VyY2VzID0gcGFyZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzb3VyY2UnKTtcblx0XHRcdFx0Zm9yKGkgPSAwLCBsZW4gPSBzb3VyY2VzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcblx0XHRcdFx0XHRzb3VyY2VzW2ldLnNldEF0dHJpYnV0ZSgnc2l6ZXMnLCB3aWR0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYoIWV2ZW50LmRldGFpbC5kYXRhQXR0cil7XG5cdFx0XHRcdHVwZGF0ZVBvbHlmaWxsKGVsZW0sIGV2ZW50LmRldGFpbCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0LyoqXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZWxlbSB7RWxlbWVudH1cblx0XHQgKiBAcGFyYW0gZGF0YUF0dHJcblx0XHQgKiBAcGFyYW0gW3dpZHRoXSB7IG51bWJlciB9XG5cdFx0ICovXG5cdFx0dmFyIGdldFNpemVFbGVtZW50ID0gZnVuY3Rpb24gKGVsZW0sIGRhdGFBdHRyLCB3aWR0aCl7XG5cdFx0XHR2YXIgZXZlbnQ7XG5cdFx0XHR2YXIgcGFyZW50ID0gZWxlbS5wYXJlbnROb2RlO1xuXG5cdFx0XHRpZihwYXJlbnQpe1xuXHRcdFx0XHR3aWR0aCA9IGdldFdpZHRoKGVsZW0sIHBhcmVudCwgd2lkdGgpO1xuXHRcdFx0XHRldmVudCA9IHRyaWdnZXJFdmVudChlbGVtLCAnbGF6eWJlZm9yZXNpemVzJywge3dpZHRoOiB3aWR0aCwgZGF0YUF0dHI6ICEhZGF0YUF0dHJ9KTtcblxuXHRcdFx0XHRpZighZXZlbnQuZGVmYXVsdFByZXZlbnRlZCl7XG5cdFx0XHRcdFx0d2lkdGggPSBldmVudC5kZXRhaWwud2lkdGg7XG5cblx0XHRcdFx0XHRpZih3aWR0aCAmJiB3aWR0aCAhPT0gZWxlbS5fbGF6eXNpemVzV2lkdGgpe1xuXHRcdFx0XHRcdFx0c2l6ZUVsZW1lbnQoZWxlbSwgcGFyZW50LCBldmVudCwgd2lkdGgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHR2YXIgdXBkYXRlRWxlbWVudHNTaXplcyA9IGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgaTtcblx0XHRcdHZhciBsZW4gPSBhdXRvc2l6ZXNFbGVtcy5sZW5ndGg7XG5cdFx0XHRpZihsZW4pe1xuXHRcdFx0XHRpID0gMDtcblxuXHRcdFx0XHRmb3IoOyBpIDwgbGVuOyBpKyspe1xuXHRcdFx0XHRcdGdldFNpemVFbGVtZW50KGF1dG9zaXplc0VsZW1zW2ldKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHR2YXIgZGVib3VuY2VkVXBkYXRlRWxlbWVudHNTaXplcyA9IGRlYm91bmNlKHVwZGF0ZUVsZW1lbnRzU2l6ZXMpO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdF86IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGF1dG9zaXplc0VsZW1zID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShsYXp5U2l6ZXNDZmcuYXV0b3NpemVzQ2xhc3MpO1xuXHRcdFx0XHRhZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBkZWJvdW5jZWRVcGRhdGVFbGVtZW50c1NpemVzKTtcblx0XHRcdH0sXG5cdFx0XHRjaGVja0VsZW1zOiBkZWJvdW5jZWRVcGRhdGVFbGVtZW50c1NpemVzLFxuXHRcdFx0dXBkYXRlRWxlbTogZ2V0U2l6ZUVsZW1lbnRcblx0XHR9O1xuXHR9KSgpO1xuXG5cdHZhciBpbml0ID0gZnVuY3Rpb24oKXtcblx0XHRpZighaW5pdC5pICYmIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUpe1xuXHRcdFx0aW5pdC5pID0gdHJ1ZTtcblx0XHRcdGF1dG9TaXplci5fKCk7XG5cdFx0XHRsb2FkZXIuXygpO1xuXHRcdH1cblx0fTtcblxuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0aWYobGF6eVNpemVzQ2ZnLmluaXQpe1xuXHRcdFx0aW5pdCgpO1xuXHRcdH1cblx0fSk7XG5cblx0bGF6eXNpemVzID0ge1xuXHRcdC8qKlxuXHRcdCAqIEB0eXBlIHsgTGF6eVNpemVzQ29uZmlnUGFydGlhbCB9XG5cdFx0ICovXG5cdFx0Y2ZnOiBsYXp5U2l6ZXNDZmcsXG5cdFx0YXV0b1NpemVyOiBhdXRvU2l6ZXIsXG5cdFx0bG9hZGVyOiBsb2FkZXIsXG5cdFx0aW5pdDogaW5pdCxcblx0XHR1UDogdXBkYXRlUG9seWZpbGwsXG5cdFx0YUM6IGFkZENsYXNzLFxuXHRcdHJDOiByZW1vdmVDbGFzcyxcblx0XHRoQzogaGFzQ2xhc3MsXG5cdFx0ZmlyZTogdHJpZ2dlckV2ZW50LFxuXHRcdGdXOiBnZXRXaWR0aCxcblx0XHRyQUY6IHJBRixcblx0fTtcblxuXHRyZXR1cm4gbGF6eXNpemVzO1xufVxuKSk7XG4iLCIvKiBnbG9iYWwgbG9jYWxTdG9yYWdlICAqL1xuaW1wb3J0IGRvY1NlbGVjdG9yQWxsIGZyb20gJy4vZG9jdW1lbnQtcXVlcnktc2VsZWN0b3ItYWxsJ1xuXG5leHBvcnQgZGVmYXVsdCBlbCA9PiB7XG4gIGNvbnN0ICR0b2dnbGVUaGVtZSA9IGRvY1NlbGVjdG9yQWxsKGVsKVxuXG4gIGlmICghJHRvZ2dsZVRoZW1lLmxlbmd0aCkgcmV0dXJuXG5cbiAgY29uc3Qgcm9vdEVsID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XG5cbiAgJHRvZ2dsZVRoZW1lLmZvckVhY2goaXRlbSA9PiBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4gICAgaWYgKCFyb290RWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdkYXJrJykpIHtcbiAgICAgIHJvb3RFbC5jbGFzc0xpc3QuYWRkKCdkYXJrJylcbiAgICAgIGxvY2FsU3RvcmFnZS50aGVtZSA9ICdkYXJrJ1xuICAgIH0gZWxzZSB7XG4gICAgICByb290RWwuY2xhc3NMaXN0LnJlbW92ZSgnZGFyaycpXG4gICAgICBsb2NhbFN0b3JhZ2UudGhlbWUgPSAnbGlnaHQnXG4gICAgfVxuICB9KSlcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICBjb25zdCBwYXJlbnQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGRvY3VtZW50XG5cbiAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHBhcmVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSwgMClcbn1cbiIsImV4cG9ydCBkZWZhdWx0IChjb3ZlckNsYXNzLCBoZWFkVHJhbnNwYXJlbnQpID0+IHtcbiAgY29uc3QgZG9tQm9keSA9IGRvY3VtZW50LmJvZHlcbiAgY29uc3QgaGFzQ292ZXIgPSBkb21Cb2R5LmNsb3Nlc3QoY292ZXJDbGFzcylcblxuICBpZiAoIWhhc0NvdmVyKSByZXR1cm5cblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgKCkgPT4ge1xuICAgIGNvbnN0IGxhc3RTY3JvbGxZID0gd2luZG93LnNjcm9sbFlcblxuICAgIGxhc3RTY3JvbGxZID49IDYwID8gZG9tQm9keS5jbGFzc0xpc3QucmVtb3ZlKGhlYWRUcmFuc3BhcmVudCkgOiBkb21Cb2R5LmNsYXNzTGlzdC5hZGQoaGVhZFRyYW5zcGFyZW50KVxuICB9LCB7IHBhc3NpdmU6IHRydWUgfSlcbn1cbiIsIlxuaW1wb3J0IGRvY1NlbGVjdG9yQWxsIGZyb20gJy4vZG9jdW1lbnQtcXVlcnktc2VsZWN0b3ItYWxsJ1xuXG5leHBvcnQgZGVmYXVsdCAoc29jaWFsTWVkaWFEYXRhLCBib3hTZWxlY3RvcikgPT4ge1xuICAvLyBjaGVjayBpZiB0aGUgYm94IGZvciB0aGUgbWVudSBleGlzdHNcbiAgY29uc3Qgbm9kZUJveCA9IGRvY1NlbGVjdG9yQWxsKGJveFNlbGVjdG9yKVxuXG4gIGlmICghbm9kZUJveC5sZW5ndGgpIHJldHVyblxuXG4gIGNvbnN0IHVybFJlZ2V4cCA9IHVybCA9PiAvKCgoW0EtWmEtel17Myw5fTooPzpcXC9cXC8pPykoPzpbXFwtOzomPVxcK1xcJCxcXHddK0ApP1tBLVphLXowLTlcXC5cXC1dK3woPzp3d3dcXC58W1xcLTs6Jj1cXCtcXCQsXFx3XStAKVtBLVphLXowLTlcXC5cXC1dKykoKD86XFwvW1xcK34lXFwvXFwuXFx3XFwtX10qKT9cXD8/KD86W1xcLVxcKz0mOyVAXFwuXFx3X10qKSM/KD86W1xcLlxcIVxcL1xcXFxcXHddKikpPykvLnRlc3QodXJsKSAvL2VzbGludC1kaXNhYmxlLWxpbmVcblxuICBjb25zdCBjcmVhdGVFbGVtZW50ID0gZWxlbWVudCA9PiB7XG4gICAgT2JqZWN0LmVudHJpZXMoc29jaWFsTWVkaWFEYXRhKS5mb3JFYWNoKChbbmFtZSwgdXJsVGl0bGVdKSA9PiB7XG4gICAgICBjb25zdCB1cmwgPSB1cmxUaXRsZVswXVxuXG4gICAgICAvLyBUaGUgdXJsIGlzIGJlaW5nIHZhbGlkYXRlZCBpZiBpdCBpcyBmYWxzZSBpdCByZXR1cm5zXG4gICAgICBpZiAoIXVybFJlZ2V4cCh1cmwpKSByZXR1cm5cblxuICAgICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKVxuICAgICAgbGluay5ocmVmID0gdXJsXG4gICAgICBsaW5rLnRpdGxlID0gdXJsVGl0bGVbMV1cbiAgICAgIGxpbmsuY2xhc3NMaXN0ID0gYGJ1dHRvbiBib3JkZXItbm9uZSBob3Zlcjp0ZXh0LSR7bmFtZX1gXG4gICAgICBsaW5rLnRhcmdldCA9ICdfYmxhbmsnXG4gICAgICBsaW5rLnJlbCA9ICdub29wZW5lciBub3JlZmVycmVyJ1xuICAgICAgbGluay5pbm5lckhUTUwgPSBgPHN2ZyBjbGFzcz1cImljb24gaWNvbi0tJHtuYW1lfVwiPjx1c2UgeGxpbms6aHJlZj1cIiNpY29uLSR7bmFtZX1cIj48L3VzZT48L3N2Zz5gXG5cbiAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQobGluaylcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIG5vZGVCb3guZm9yRWFjaChjcmVhdGVFbGVtZW50KVxufVxuIiwiLyogZ2xvYmFsIE00R2FsbGVyeSAqL1xuXG5pbXBvcnQgbG9hZFNjcmlwdCBmcm9tICcuL2xvYWQtc2NyaXB0J1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7XG4gIGlmIChNNEdhbGxlcnkgPT09IGZhbHNlKSByZXR1cm5cblxuICBpZiAod2luZG93LmlubmVyV2lkdGggPCA3NjgpIHJldHVyblxuXG4gIGNvbnN0ICRwb3N0Qm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwb3N0LWJvZHknKVxuXG4gIGlmICghJHBvc3RCb2R5KSByZXR1cm5cblxuICAvKiA8aW1nPiBTZXQgQXRyaWJ1dGUgKGRhdGEtc3JjIC0gZGF0YS1zdWItaHRtbClcbiAgLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuICAkcG9zdEJvZHkucXVlcnlTZWxlY3RvckFsbCgnaW1nJykuZm9yRWFjaChlbCA9PiB7XG4gICAgaWYgKGVsLmNsb3Nlc3QoJ2EnKSkgcmV0dXJuXG5cbiAgICBlbC5jbGFzc0xpc3QuYWRkKCdNNC1saWdodC1nYWxsZXJ5JylcbiAgICBlbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtc3JjJywgZWwuc3JjKVxuXG4gICAgY29uc3QgbmV4dEVsZW1lbnQgPSBlbC5uZXh0U2libGluZ1xuXG4gICAgaWYgKG5leHRFbGVtZW50ICE9PSBudWxsICYmIG5leHRFbGVtZW50Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdmaWdjYXB0aW9uJykge1xuICAgICAgZWwuc2V0QXR0cmlidXRlKCdkYXRhLXN1Yi1odG1sJywgbmV4dEVsZW1lbnQuaW5uZXJIVE1MKVxuICAgIH1cbiAgfSlcblxuICAvKiBMaWdodGdhbGxlcnlcbiAgLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuICBjb25zdCAkaW1nTGlnaHRHYWxsZXJ5ID0gJHBvc3RCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJy5NNC1saWdodC1nYWxsZXJ5JylcblxuICBpZiAoISRpbWdMaWdodEdhbGxlcnkubGVuZ3RoKSByZXR1cm5cblxuICBjb25zdCBsb2FkQ1NTID0gaHJlZiA9PiB7XG4gICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKVxuICAgIGxpbmsubWVkaWEgPSAncHJpbnQnXG4gICAgbGluay5yZWwgPSAnc3R5bGVzaGVldCdcbiAgICBsaW5rLmhyZWYgPSBocmVmXG4gICAgbGluay5vbmxvYWQgPSAoKSA9PiB7IGxpbmsubWVkaWEgPSAnYWxsJyB9XG4gICAgZG9jdW1lbnQuaGVhZC5pbnNlcnRCZWZvcmUobGluaywgZG9jdW1lbnQuaGVhZC5jaGlsZE5vZGVzW2RvY3VtZW50LmhlYWQuY2hpbGROb2Rlcy5sZW5ndGggLSAxXS5uZXh0U2libGluZylcbiAgfVxuXG4gIGxvYWRDU1MoJ2h0dHBzOi8vdW5wa2cuY29tL2xpZ2h0Z2FsbGVyeUAyLjEuOC9jc3MvbGlnaHRnYWxsZXJ5LmNzcycpXG5cbiAgbG9hZFNjcmlwdCgnaHR0cHM6Ly91bnBrZy5jb20vbGlnaHRnYWxsZXJ5QDIuMS44L2xpZ2h0Z2FsbGVyeS5taW4uanMnLCAoKSA9PiB7XG4gICAgd2luZG93LmxpZ2h0R2FsbGVyeSgkcG9zdEJvZHksIHtcbiAgICAgIHNwZWVkOiA1MDAsXG4gICAgICBzZWxlY3RvcjogJy5NNC1saWdodC1nYWxsZXJ5J1xuICAgIH0pXG4gIH0pXG59XG4iLCIvKiBnbG9iYWwgcHJpc21KcyAqL1xuXG5pbXBvcnQgbG9hZFNjcmlwdCBmcm9tICcuL2xvYWQtc2NyaXB0J1xuaW1wb3J0IGRvY1NlbGVjdG9yQWxsIGZyb20gJy4uL2FwcC9kb2N1bWVudC1xdWVyeS1zZWxlY3Rvci1hbGwnXG5cbmV4cG9ydCBkZWZhdWx0IChyb290ID0gZG9jdW1lbnQsIGNvZGVMYW5ndWFnZSkgPT4ge1xuICBjb25zdCAkY29kZUxhbmd1YWdlID0gKHJvb3QgJiYgcm9vdC5xdWVyeVNlbGVjdG9yQWxsKSA/IHJvb3QucXVlcnlTZWxlY3RvckFsbChjb2RlTGFuZ3VhZ2UpIDogZG9jU2VsZWN0b3JBbGwoY29kZUxhbmd1YWdlKVxuXG4gIGlmICgoISRjb2RlTGFuZ3VhZ2UgfHwgISRjb2RlTGFuZ3VhZ2UubGVuZ3RoKSAmJiB0eXBlb2YgcHJpc21KcyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVyblxuXG4gIC8vIFNob3cgTGFuZ3VhZ2VcbiAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbCgkY29kZUxhbmd1YWdlIHx8IFtdLCBlbGVtZW50ID0+IHtcbiAgICAvLyBJZGVtcG90ZW5jeVxuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdCAmJiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnanMtcHJpc20tcHJvY2Vzc2VkJykpIHJldHVyblxuXG4gICAgbGV0IGxhbmd1YWdlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykgfHwgJydcbiAgICBsYW5ndWFnZSA9IGxhbmd1YWdlLnNwbGl0KCctJylcbiAgICBpZiAoZWxlbWVudC5wYXJlbnRFbGVtZW50ICYmIGxhbmd1YWdlWzFdKSB7XG4gICAgICBlbGVtZW50LnBhcmVudEVsZW1lbnQuc2V0QXR0cmlidXRlKCdyZWwnLCBsYW5ndWFnZVsxXSlcbiAgICB9XG5cbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnanMtcHJpc20tcHJvY2Vzc2VkJylcbiAgfSlcblxuICAvLyBMb2FkIFByaXNtSnMgYW5kIFBsdWdpbiBMb2FmXG4gIGxvYWRTY3JpcHQocHJpc21Kcylcbn1cbiIsImV4cG9ydCBkZWZhdWx0IChzcmMsIGNhbGxiYWNrKSA9PiB7XG4gIGNvbnN0IHNjcmlwdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKVxuICBzY3JpcHRFbGVtZW50LnNyYyA9IHNyY1xuICBzY3JpcHRFbGVtZW50LmRlZmVyID0gdHJ1ZVxuICBzY3JpcHRFbGVtZW50LmFzeW5jID0gdHJ1ZVxuXG4gIGNhbGxiYWNrICYmIHNjcmlwdEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGNhbGxiYWNrKVxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdEVsZW1lbnQpXG59XG4iLCJleHBvcnQgZGVmYXVsdCBzZXR0aW5ncyA9PiB7XHJcbiAgY29uc3QgZGVmYXVsdHMgPSB7XHJcbiAgICBzZWxlY3RvcjogJyNqcy1wcm9tby1wb3B1cCcsXHJcbiAgICBzdG9yYWdlS2V5OiAnbTQtcHJvbW8taGlkZGVuJyxcclxuICAgIGRlbGF5OiAxMDAwLFxyXG4gICAgY29udGVudDogYFxyXG4gICAgICA8ZGl2IGNsYXNzPVwicHJvbW8tcG9wdXBfX2NvbnRlbnRcIj5cclxuICAgICAgICA8c3BhbiBjbGFzcz1cInByb21vLXBvcHVwX19tZXNzYWdlXCI+XHJcbiAgICAgICAgICDwn5OiIFdlJ3ZlIHVwZGF0ZWQgb3VyIHByaXZhY3kgcG9saWN5IGFuZCBkZXRlbnRpb24gZ3VpZGVsaW5lcy5cclxuICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cInByb21vLXBvcHVwX19idG4ganMtcHJvbW8tY2xvc2VcIj5cclxuICAgICAgICAgIERvbid0IHNob3cgYWdhaW5cclxuICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICBgXHJcbiAgfVxyXG5cclxuICBjb25zdCBvcHRpb25zID0geyAuLi5kZWZhdWx0cywgLi4uc2V0dGluZ3MgfVxyXG4gIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKG9wdGlvbnMuc2VsZWN0b3IpXHJcblxyXG4gIGlmICghZWxlbWVudCkgcmV0dXJuXHJcblxyXG4gIC8vIENoZWNrIFNlc3Npb24gU3RvcmFnZVxyXG4gIGlmICh3aW5kb3cuc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShvcHRpb25zLnN0b3JhZ2VLZXkpID09PSAndHJ1ZScpIHtcclxuICAgIHJldHVyblxyXG4gIH1cclxuXHJcbiAgLy8gUG9wdWxhdGUgSFRNTFxyXG4gIGVsZW1lbnQuaW5uZXJIVE1MID0gb3B0aW9ucy5jb250ZW50XHJcblxyXG4gIC8vIEFuaW1hdGUgSW4gKEVubGFyZ2UgVmVydGljYWxseSlcclxuICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLXZpc2libGUnKVxyXG4gIH0sIG9wdGlvbnMuZGVsYXkpXHJcblxyXG4gIC8vIEhhbmRsZSBDbG9zZVxyXG4gIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgaWYgKGUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnanMtcHJvbW8tY2xvc2UnKSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuXHJcbiAgICAgIC8vIEFuaW1hdGUgT3V0XHJcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtdmlzaWJsZScpXHJcblxyXG4gICAgICAvLyBTZXQgU2Vzc2lvbiBTdG9yYWdlXHJcbiAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKG9wdGlvbnMuc3RvcmFnZUtleSwgJ3RydWUnKVxyXG5cclxuICAgICAgLy8gUmVtb3ZlIGZyb20gRE9NIGFmdGVyIHRyYW5zaXRpb25cclxuICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gJydcclxuICAgICAgfSwgNTAwKVxyXG4gICAgfVxyXG4gIH0pXHJcbn0iLCJpbXBvcnQgZG9jU2VsZWN0b3JBbGwgZnJvbSAnLi4vYXBwL2RvY3VtZW50LXF1ZXJ5LXNlbGVjdG9yLWFsbCdcblxuLyoqXG4gKiBHYWxsZXJ5IGNhcmQgc3VwcG9ydFxuICogVXNlZCBvbiBhbnkgaW5kaXZpZHVhbCBwb3N0L3BhZ2VcbiAqXG4gKiBEZXRlY3RzIHdoZW4gYSBnYWxsZXJ5IGNhcmQgaGFzIGJlZW4gdXNlZCBhbmQgYXBwbGllcyBzaXppbmcgdG8gbWFrZSBzdXJlXG4gKiB0aGUgZGlzcGxheSBtYXRjaGVzIHdoYXQgaXMgc2VlbiBpbiB0aGUgZWRpdG9yLlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IChyb290ID0gZG9jdW1lbnQpID0+IHtcbiAgY29uc3QgaW1hZ2VzID0gKHJvb3QgJiYgcm9vdC5xdWVyeVNlbGVjdG9yQWxsKSA/IHJvb3QucXVlcnlTZWxlY3RvckFsbCgnLmtnLWdhbGxlcnktaW1hZ2UgPiBpbWcnKSA6IGRvY1NlbGVjdG9yQWxsKCcua2ctZ2FsbGVyeS1pbWFnZSA+IGltZycpXG5cbiAgaWYgKCFpbWFnZXMgfHwgIWltYWdlcy5sZW5ndGgpIHJldHVyblxuXG4gIGltYWdlcy5mb3JFYWNoKGltYWdlID0+IHtcbiAgICAvLyBJZGVtcG90ZW5jeTogc2tpcCBpbWFnZXMgYWxyZWFkeSBwcm9jZXNzZWRcbiAgICBpZiAoaW1hZ2UuY2xhc3NMaXN0ICYmIGltYWdlLmNsYXNzTGlzdC5jb250YWlucygnanMtZ2FsbGVyeS1wcm9jZXNzZWQnKSkgcmV0dXJuXG5cbiAgICBjb25zdCBjb250YWluZXIgPSBpbWFnZS5jbG9zZXN0KCcua2ctZ2FsbGVyeS1pbWFnZScpXG4gICAgaWYgKCFjb250YWluZXIpIHJldHVyblxuXG4gICAgY29uc3Qgd2lkdGggPSBpbWFnZS5hdHRyaWJ1dGVzLndpZHRoICYmIGltYWdlLmF0dHJpYnV0ZXMud2lkdGgudmFsdWVcbiAgICBjb25zdCBoZWlnaHQgPSBpbWFnZS5hdHRyaWJ1dGVzLmhlaWdodCAmJiBpbWFnZS5hdHRyaWJ1dGVzLmhlaWdodC52YWx1ZVxuICAgIGlmICghd2lkdGggfHwgIWhlaWdodCkgcmV0dXJuXG5cbiAgICBjb25zdCByYXRpbyA9IHdpZHRoIC8gaGVpZ2h0XG4gICAgY29udGFpbmVyLnN0eWxlLmZsZXggPSByYXRpbyArICcgMSAwJSdcblxuICAgIGltYWdlLmNsYXNzTGlzdC5hZGQoJ2pzLWdhbGxlcnktcHJvY2Vzc2VkJylcbiAgfSlcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGVsID0+IHtcbiAgY29uc3QgJGhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwpXG5cbiAgaWYgKCEkaGVhZGVyKSByZXR1cm5cblxuICBjb25zdCAkc2VhcmNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLXNlYXJjaCcpXG5cbiAgbGV0IHByZXZTY3JvbGxwb3MgPSB3aW5kb3cucGFnZVlPZmZzZXRcblxuICB3aW5kb3cub25zY3JvbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgY3VycmVudFNjcm9sbFBvcyA9IHdpbmRvdy5wYWdlWU9mZnNldFxuXG4gICAgaWYgKHByZXZTY3JvbGxwb3MgPiBjdXJyZW50U2Nyb2xsUG9zKSB7XG4gICAgICAkaGVhZGVyLmNsYXNzTGlzdC5yZW1vdmUoJy10b3AtMTgnKVxuICAgICAgJHNlYXJjaC5jbGFzc0xpc3QuYWRkKCdtdC0xNicpXG4gICAgfSBlbHNlIHtcbiAgICAgICRoZWFkZXIuY2xhc3NMaXN0LmFkZCgnLXRvcC0xOCcpXG4gICAgICAkc2VhcmNoLmNsYXNzTGlzdC5yZW1vdmUoJ210LTE2JylcbiAgICB9XG5cbiAgICBwcmV2U2Nyb2xscG9zID0gY3VycmVudFNjcm9sbFBvc1xuICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCAocm9vdCA9IGRvY3VtZW50KSA9PiB7XG4gIC8qIElmcmFtZSBTUkMgdmlkZW8gKi9cbiAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICdpZnJhbWVbc3JjKj1cInBsYXllci52aW1lby5jb21cIl0nLFxuICAgICdpZnJhbWVbc3JjKj1cImRhaWx5bW90aW9uLmNvbVwiXScsXG4gICAgJ2lmcmFtZVtzcmMqPVwieW91dHViZS5jb21cIl0nLFxuICAgICdpZnJhbWVbc3JjKj1cInlvdXR1YmUtbm9jb29raWUuY29tXCJdJyxcbiAgICAnaWZyYW1lW3NyYyo9XCJwbGF5ZXIudHdpdGNoLnR2XCJdJyxcbiAgICAnaWZyYW1lW3NyYyo9XCJraWNrc3RhcnRlci5jb21cIl1bc3JjKj1cInZpZGVvLmh0bWxcIl0nXG4gIF1cblxuICAvLyBVc2Ugcm9vdC5xdWVyeVNlbGVjdG9yQWxsIHRvIHNjb3BlIHRoZSBzZWFyY2hcbiAgY29uc3QgaWZyYW1lcyA9IHJvb3QucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcnMuam9pbignLCcpKVxuXG4gIGlmICghaWZyYW1lcy5sZW5ndGgpIHJldHVyblxuXG4gIGlmcmFtZXMuZm9yRWFjaChlbCA9PiB7XG4gICAgLy8gQ2hlY2sgaWYgYWxyZWFkeSBwcm9jZXNzZWRcbiAgICBpZiAoZWwucGFyZW50Tm9kZS5jbGFzc0xpc3QuY29udGFpbnMoJ3ZpZGVvLXJlc3BvbnNpdmUnKSkgcmV0dXJuXG5cbiAgICBjb25zdCBwYXJlbnRGb3JWaWRlbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgcGFyZW50Rm9yVmlkZW8uY2xhc3NOYW1lID0gJ3ZpZGVvLXJlc3BvbnNpdmUnXG4gICAgZWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUocGFyZW50Rm9yVmlkZW8sIGVsKVxuICAgIHBhcmVudEZvclZpZGVvLmFwcGVuZENoaWxkKGVsKVxuICAgIGVsLnJlbW92ZUF0dHJpYnV0ZSgnaGVpZ2h0JylcbiAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoJ3dpZHRoJylcbiAgfSlcbn0iLCIvKipcclxuICogTWF0b21vIEFuYWx5dGljcyAmIEVuZ2FnZW1lbnQgTWFuYWdlclxyXG4gKiBIYW5kbGVzIFNQQS1saWtlIHBhZ2UgdHJhbnNpdGlvbnMgYW5kIHNjb3BlZCBzY3JvbGwgdHJhY2tpbmcuXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBbmFseXRpY3NNYW5hZ2VyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMuY3VycmVudFBhdGggPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWVcclxuICAgIHRoaXMub2JzZXJ2ZXJzID0gbmV3IE1hcCgpXHJcbiAgfVxyXG5cclxuICAvLyBUcmFjayBhIG5ldyB2aXJ0dWFsIHBhZ2UgdmlldyAoSXNzdWUgIzEpXHJcbiAgdHJhY2tQYWdlVmlldyh1cmwsIHRpdGxlLCBwcmV2aW91c1VybCkge1xyXG4gICAgY29uc29sZS5kZWJ1ZygnW0FuYWx5dGljc01hbmFnZXJdIHRyYWNrUGFnZVZpZXcgY2FsbGVkJywge3VybCwgdGl0bGUsIHByZXZpb3VzVXJsfSlcclxuICAgIGlmICghd2luZG93Ll9wYXEpIHtcclxuICAgICAgY29uc29sZS53YXJuKCdbQW5hbHl0aWNzTWFuYWdlcl0gd2luZG93Ll9wYXEgaXMgbm90IGF2YWlsYWJsZTsgc2tpcHBpbmcgTWF0b21vIGNhbGxzJylcclxuICAgICAgdGhpcy5jdXJyZW50UGF0aCA9IHVybFxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmN1cnJlbnRQYXRoID0gdXJsXHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgd2luZG93Ll9wYXEucHVzaChbJ3NldFJlZmVycmVyVXJsJywgcHJldmlvdXNVcmxdKVxyXG4gICAgICB3aW5kb3cuX3BhcS5wdXNoKFsnc2V0Q3VzdG9tVXJsJywgdXJsXSlcclxuICAgICAgd2luZG93Ll9wYXEucHVzaChbJ3NldERvY3VtZW50VGl0bGUnLCB0aXRsZV0pXHJcbiAgICAgIHdpbmRvdy5fcGFxLnB1c2goWydzZXRHZW5lcmF0aW9uVGltZU1zJywgMF0pXHJcbiAgICAgIHdpbmRvdy5fcGFxLnB1c2goWyd0cmFja1BhZ2VWaWV3J10pXHJcbiAgICAgIHdpbmRvdy5fcGFxLnB1c2goWydlbmFibGVMaW5rVHJhY2tpbmcnXSlcclxuICAgICAgd2luZG93Ll9wYXEucHVzaChbJ01lZGlhQW5hbHl0aWNzOjpzY2FuRm9yTWVkaWEnXSlcclxuICAgICAgY29uc29sZS5pbmZvKCdbQW5hbHl0aWNzTWFuYWdlcl0gTWF0b21vIHRyYWNrUGFnZVZpZXcgcHVzaGVkJywge3VybCwgdGl0bGV9KVxyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tBbmFseXRpY3NNYW5hZ2VyXSBlcnJvciBwdXNoaW5nIHRvIF9wYXEnLCBlcnIpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBPYnNlcnZlIGFuIGFydGljbGUgZm9yIFwiUmVhZFwiIHN0YXR1cyAoSXNzdWUgIzIsICMzKVxyXG4gIG9ic2VydmVBcnRpY2xlKGFydGljbGVFbGVtZW50LCB0aXRsZSkge1xyXG4gIGNvbnNvbGUuZGVidWcoJ1tBbmFseXRpY3NNYW5hZ2VyXSBvYnNlcnZlQXJ0aWNsZSBjYWxsZWQnLCB7dGl0bGV9KVxyXG4gICAgaWYgKCFhcnRpY2xlRWxlbWVudCkgcmV0dXJuXHJcblxyXG4gICAgbGV0IGhhc1JlYWQgPSBmYWxzZVxyXG4gICAgbGV0IHRpbWVTdGFydGVkID0gMFxyXG5cclxuICAgIGNvbnN0IFJFQURfVEhSRVNIT0xEX1BFUkNFTlQgPSAwLjVcclxuICAgIGNvbnN0IFJFQURfVElNRV9NUyA9IDEwMDAwXHJcblxyXG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIoKGVudHJpZXMpID0+IHtcclxuICAgICAgZW50cmllcy5mb3JFYWNoKGVudHJ5ID0+IHtcclxuICAgICAgICBpZiAoZW50cnkuaXNJbnRlcnNlY3RpbmcgJiYgZW50cnkuaW50ZXJzZWN0aW9uUmF0aW8gPj0gUkVBRF9USFJFU0hPTERfUEVSQ0VOVCkge1xyXG4gICAgICAgICAgaWYgKCF0aW1lU3RhcnRlZCkgdGltZVN0YXJ0ZWQgPSBEYXRlLm5vdygpXHJcblxyXG4gICAgICAgICAgY29uc3QgZHdlbGxUaW1lID0gRGF0ZS5ub3coKSAtIHRpbWVTdGFydGVkXHJcbiAgICAgICAgICBpZiAoZHdlbGxUaW1lID4gUkVBRF9USU1FX01TICYmICFoYXNSZWFkKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlclJlYWRFdmVudCh0aXRsZSlcclxuICAgICAgICAgICAgaGFzUmVhZCA9IHRydWVcclxuICAgICAgICAgICAgb2JzZXJ2ZXIudW5vYnNlcnZlKGFydGljbGVFbGVtZW50KVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aW1lU3RhcnRlZCA9IDBcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9LCB7XHJcbiAgICAgIHRocmVzaG9sZDogWzAsIDAuMjUsIDAuNSwgMC43NSwgMV1cclxuICAgIH0pXHJcblxyXG4gIG9ic2VydmVyLm9ic2VydmUoYXJ0aWNsZUVsZW1lbnQpXHJcbiAgdGhpcy5vYnNlcnZlcnMuc2V0KGFydGljbGVFbGVtZW50LCBvYnNlcnZlcilcclxuICBjb25zb2xlLmRlYnVnKCdbQW5hbHl0aWNzTWFuYWdlcl0gSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgYXR0YWNoZWQgZm9yIGFydGljbGUnLCB7dGl0bGV9KVxyXG4gIH1cclxuXHJcbiAgdHJpZ2dlclJlYWRFdmVudCh0aXRsZSkge1xyXG4gICAgaWYgKHdpbmRvdy5fcGFxKSB7XHJcbiAgICAgIHdpbmRvdy5fcGFxLnB1c2goWyd0cmFja0V2ZW50JywgJ0FydGljbGUnLCAnUmVhZCcsIHRpdGxlXSlcclxuICAgIH1cclxuICBjb25zb2xlLmxvZyhgW0FuYWx5dGljc10gTWFya2VkIGFzIHJlYWQ6ICR7dGl0bGV9YClcclxuICB9XHJcblxyXG4gIGNsZWFudXAoKSB7XHJcbiAgICB0aGlzLm9ic2VydmVycy5mb3JFYWNoKG9icyA9PiBvYnMuZGlzY29ubmVjdCgpKVxyXG4gICAgdGhpcy5vYnNlcnZlcnMuY2xlYXIoKVxyXG4gIH1cclxufVxyXG4iLCIvKiBnbG9iYWwgZm9sbG93U29jaWFsTWVkaWEgc2l0ZVNlYXJjaCAqL1xuXG4vLyBsaWJcbmltcG9ydCAnbGF6eXNpemVzJ1xuXG5pbXBvcnQgc29jaWFsTWVkaWEgZnJvbSAnLi9hcHAvc29jaWFsLW1lZGlhJ1xuaW1wb3J0IGRhcmtNb2RlIGZyb20gJy4vYXBwL2RhcmstbW9kZSdcbmltcG9ydCBoZWFkZXJUcmFuc3BhcmVuY3kgZnJvbSAnLi9hcHAvaGVhZGVyLXRyYW5zcGFyZW5jeSdcbmltcG9ydCBsb2FkU2NyaXB0IGZyb20gJy4vY29tcG9uZW50cy9sb2FkLXNjcmlwdCdcbmltcG9ydCBzY3JvbGxIaWRlSGVhZGVyIGZyb20gJy4vY29tcG9uZW50cy9zY3JvbGwtaGlkZS1oZWFkZXInXG5pbXBvcnQgcHJvbW9Qb3B1cCBmcm9tICcuL2NvbXBvbmVudHMvcHJvbW8tcG9wdXAnXG5pbXBvcnQgcG9zdEluZmluaXRlIGZyb20gJy4vcG9zdC1pbmZpbml0ZSdcblxuY29uc3QgTTRTZXR1cCA9ICgpID0+IHtcbiAgY29uc29sZS5kZWJ1ZygnW21haW5dIE00U2V0dXAgc3RhcnRpbmcnKVxuICAvKipcbiAgICogTGlua3MgdG8gc29jaWFsIG1lZGlhXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdFtuYW1lLCB1cmwsIHRpdGxlXX0gZm9sbG93U29jaWFsTWVkaWEgLSAgVGhpcyB2YXJpYWJsZSB3aWxsIGNvbWUgZnJvbSB0aGUgZ2hvc3QgZGFzaGJvYXJkXG4gICAqIEBwYXJhbSAge0VsZW1lbnR9ICcuanMtc29jaWFsLW1lZGlhJyAtIEFsbCBlbGVtZW50cyBjb250YWluaW5nIHRoaXMgY2xhc3Mgd2lsbCBiZSBzZWxlY3RlZCBhbmQgdGhlIHNvY2lhbCBtZWRpYSBsaW5rcyB3aWxsIGJlIGFwcGVuZGVkLlxuICAgKi9cbiAgaWYgKHR5cGVvZiBmb2xsb3dTb2NpYWxNZWRpYSA9PT0gJ29iamVjdCcgJiYgZm9sbG93U29jaWFsTWVkaWEgIT09IG51bGwpIHtcbiAgICBzb2NpYWxNZWRpYShmb2xsb3dTb2NpYWxNZWRpYSwgJy5qcy1zb2NpYWwtbWVkaWEnKVxuICB9XG5cbiAgLyoqXG4gICAqIERhcmsgTW9kZVxuICAgKiBAcGFyYW0gIHtFbGVtZW50fSAnLmpzLWRhcmstbW9kZScgLSBDbGFzcyBuYW1lIG9mIGFsbCBidXR0b25zIGZvciBjaGFuZ2luZyB0aGUgZGFyayBtb2RlXG4gICAqL1xuICBkYXJrTW9kZSgnLmpzLWRhcmstbW9kZScpXG5cbiAgLyoqXG4gICAqIEhlYWRlciAtIEFkZCBhbmQgcmVtb3ZlIHRyYW5zcGFyZW5jeSB3aGVuIHRoZSBoZWFkZXIgaXMgbGFyZ2VyIHRoYW4gNjRweFxuICAgKiBhbmQgdGhlIHBhZ2UgY29udGFpbnMgdGhlIGNvdmVyLlxuICAgKlxuICAgKiBAcGFyYW0gIHtFbGVtZW50fSAnLmhhcy1jb3ZlcicgLSBUaGUgY2xhc3Mgd2lsbCBiZSBpbiB0aGUgYm9keSBpbmRpY2F0aW5nIHRoYXQgaXQgaXMgZW5hYmxlZCB0byBhZGQgdHJhbnNwYXJlbmN5LlxuICAgKiBAcGFyYW0gIHtjbGFzc05hbWV9ICdpcy1oZWFkLXRyYW5zcGFyZW50JyAtIEFkZCB0aGlzIGNsYXNzIHRvIHRoZSBib2R5IHRvIG1ha2UgaXQgdHJhbnNwYXJlbnQuXG4gICAqL1xuICBoZWFkZXJUcmFuc3BhcmVuY3koJy5oYXMtY292ZXInLCAnaXMtaGVhZC10cmFuc3BhcmVudCcpXG5cbiAgLyogVG9nZ2xlIE1vYmlsZSBNZW51XG4gIC8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLW1lbnUtb3BlbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtc2VhcmNoJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJylcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ2hhcy1tZW51JylcbiAgfSlcblxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtbWVudS1jbG9zZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2hhcy1tZW51JylcbiAgfSlcblxuICAvKipcbiAgICogU2VhcmNoIC0gTG9hZCB0aGUgbGF6eSBzZWFyY2ggU2NyaXB0XG4gICAqIEBwYXJhbSAge1N0cmluZ30gc2l0ZVNlYXJjaCAtIGFzc2V0cy9zY3JpcHRzL3NlYXJjaC5qc1xuICAgKi9cbiAgaWYgKHR5cGVvZiBzZWFyY2hTZXR0aW5ncyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHNpdGVTZWFyY2ggIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbG9hZFNjcmlwdChzaXRlU2VhcmNoKVxuICB9XG5cbiAgLyoqXG4gICAqIGhlYWRlciBoaWRlIHdoZW4gc2Nyb2xsaW5nIGRvd24gYW5kIHNob3cgd2hlbiBzY3JvbGxpbmcgdXBcbiAgICogQHBhcmFtICB7RWxlbWVudH0gJy5qcy1oaWRlLWhlYWRlcicgLSBIZWFkZXIgY2xhc3NcbiAgICovXG4gIHNjcm9sbEhpZGVIZWFkZXIoJy5qcy1oaWRlLWhlYWRlcicpXG5cbiAgLyoqXG4gICAqIFByb21vIFBvcHVwXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvciAtIFRoZSBjb250YWluZXIgSURcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbGF5IC0gRGVsYXkgaW4gbXMgYmVmb3JlIHNob3dpbmdcbiAgICovXG4gIHByb21vUG9wdXAoJyNqcy1wcm9tby1wb3B1cCcsIDIwMDApXG5cbiAgLy8gSW5pdGlhbGl6ZSBpbmZpbml0ZSBzY3JvbGwgb3JjaGVzdHJhdGlvbiBpZiBwcmVzZW50XG4gIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaW5maW5pdGUtY29udGFpbmVyJykpIHtcbiAgICBjb25zb2xlLmluZm8oJ1ttYWluXSAuanMtaW5maW5pdGUtY29udGFpbmVyIGRldGVjdGVkIOKAlCBpbml0aWFsaXppbmcgcG9zdEluZmluaXRlJylcbiAgICBwb3N0SW5maW5pdGUoKVxuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUuZGVidWcoJ1ttYWluXSAuanMtaW5maW5pdGUtY29udGFpbmVyIG5vdCBmb3VuZCDigJQgc2tpcHBpbmcgcG9zdEluZmluaXRlJylcbiAgfVxuXG4gIC8vIEVuZCBNNFNldHVwXG59XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBNNFNldHVwKVxuIiwiaW1wb3J0IEluZmluaXRlU2Nyb2xsIGZyb20gJ2luZmluaXRlLXNjcm9sbCdcclxuaW1wb3J0IEFuYWx5dGljc01hbmFnZXIgZnJvbSAnLi9saWIvYW5hbHl0aWNzJ1xyXG5pbXBvcnQgdmlkZW9SZXNwb25zaXZlIGZyb20gJy4vY29tcG9uZW50cy92aWRlby1yZXNwb25zaXZlJ1xyXG5pbXBvcnQgcmVzaXplSW1hZ2VzSW5HYWxsZXJpZXMgZnJvbSAnLi9jb21wb25lbnRzL3Jlc2l6ZS1pbWFnZXMtZ2FsbGVyaWVzJ1xyXG5pbXBvcnQgaGlnaGxpZ2h0UHJpc20gZnJvbSAnLi9jb21wb25lbnRzL2hpZ2hsaWdodC1wcmlzbWpzJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW5pdEluZmluaXRlU2Nyb2xsKCkge1xyXG4gIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1pbmZpbml0ZS1jb250YWluZXInKVxyXG4gIGNvbnN0IG5leHRMaW5rID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLW5leHQtcG9zdC1saW5rJylcclxuXHJcbiAgY29uc29sZS5kZWJ1ZygnW3Bvc3QtaW5maW5pdGVdIGluaXQgY2hlY2sgLSBjb250YWluZXI6JywgY29udGFpbmVyKVxyXG4gIGNvbnNvbGUuZGVidWcoJ1twb3N0LWluZmluaXRlXSBpbml0IGNoZWNrIC0gbmV4dExpbms6JywgbmV4dExpbmspXHJcblxyXG4gIC8vIElmIHdlIGRvbid0IGhhdmUgYSBjb250YWluZXIgb3IgYSBuZXh0IGxpbmssIHN0b3AuXHJcbiAgLy8gVGhpcyBhY3RzIGFzIHRoZSBjaGVjayBmb3IgXCJJcyB0aGlzIGEgc2luZ2xlIHBvc3QgcGFnZT9cIlxyXG4gIGlmICghY29udGFpbmVyIHx8ICFuZXh0TGluaykge1xyXG4gICAgY29uc29sZS5pbmZvKCdbcG9zdC1pbmZpbml0ZV0gYWJvcnRlZDogbWlzc2luZyBjb250YWluZXIgb3IgbmV4dCBsaW5rJylcclxuICAgIHJldHVyblxyXG4gIH1cclxuXHJcbiAgY29uc3QgYW5hbHl0aWNzID0gbmV3IEFuYWx5dGljc01hbmFnZXIoKVxyXG4gIGNvbnNvbGUuZGVidWcoJ1twb3N0LWluZmluaXRlXSBBbmFseXRpY3NNYW5hZ2VyIGluc3RhbnRpYXRlZCcpXHJcblxyXG4gIC8vIE9ic2VydmUgdGhlIGluaXRpYWwgYXJ0aWNsZVxyXG4gIGNvbnN0IGluaXRpYWxBcnRpY2xlID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5qcy1wb3N0LWFydGljbGUnKVxyXG4gIGNvbnNvbGUuZGVidWcoJ1twb3N0LWluZmluaXRlXSBpbml0aWFsQXJ0aWNsZTonLCBpbml0aWFsQXJ0aWNsZSlcclxuICBpZiAoaW5pdGlhbEFydGljbGUpIHtcclxuICAgIGFuYWx5dGljcy5vYnNlcnZlQXJ0aWNsZShpbml0aWFsQXJ0aWNsZSwgZG9jdW1lbnQudGl0bGUpXHJcbiAgICBjb25zb2xlLmluZm8oJ1twb3N0LWluZmluaXRlXSBvYnNlcnZpbmcgaW5pdGlhbCBhcnRpY2xlIGZvciBSZWFkIG1ldHJpYycsIHt0aXRsZTogZG9jdW1lbnQudGl0bGV9KVxyXG4gIH1cclxuXHJcbiAgLy8gUHJlZmV0Y2ggTkVYVCBhcnRpY2xlXHJcbiAgaWYgKG5leHRMaW5rICYmIG5leHRMaW5rLmhyZWYpIHtcclxuICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJylcclxuICAgIGxpbmsucmVsID0gJ3ByZWZldGNoJ1xyXG4gICAgbGluay5ocmVmID0gbmV4dExpbmsuaHJlZlxyXG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChsaW5rKVxyXG4gICAgY29uc29sZS5kZWJ1ZygnW3Bvc3QtaW5maW5pdGVdIHByZWZldGNoaW5nIG5leHQgYXJ0aWNsZScsIG5leHRMaW5rLmhyZWYpXHJcbiAgfVxyXG5cclxuICBjb25zdCBpbmZTY3JvbGwgPSBuZXcgSW5maW5pdGVTY3JvbGwoY29udGFpbmVyLCB7XHJcbiAgICBwYXRoOiAnLmpzLW5leHQtcG9zdC1saW5rJyxcclxuICAgIGFwcGVuZDogJy5qcy1wb3N0LWFydGljbGUnLFxyXG4gICAgaGlzdG9yeTogJ3B1c2gnLFxyXG4gICAgaGlzdG9yeVRpdGxlOiB0cnVlLFxyXG4gICAgc2Nyb2xsVGhyZXNob2xkOiA0MDAsXHJcbiAgICBoaWRlTmF2OiAnLnBhZ2luYXRpb24tZmFsbGJhY2snXHJcbiAgfSlcclxuXHJcbiAgY29uc29sZS5pbmZvKCdbcG9zdC1pbmZpbml0ZV0gSW5maW5pdGVTY3JvbGwgaW5pdGlhbGl6ZWQnKVxyXG5cclxuICBpbmZTY3JvbGwub24oJ2FwcGVuZCcsIChyZXNwb25zZSwgcGF0aCwgaXRlbXMpID0+IHtcclxuICAgIGNvbnNvbGUuZGVidWcoJ1twb3N0LWluZmluaXRlXSBhcHBlbmQgZXZlbnQgZmlyZWQnLCB7cGF0aCwgaXRlbXNDb3VudDogaXRlbXMgJiYgaXRlbXMubGVuZ3RofSlcclxuICAgIGNvbnN0IG5ld0FydGljbGUgPSBpdGVtcyAmJiBpdGVtc1swXVxyXG4gICAgaWYgKCFuZXdBcnRpY2xlKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybignW3Bvc3QtaW5maW5pdGVdIGFwcGVuZCBldmVudDogbm8gYXJ0aWNsZSBmb3VuZCBpbiBpdGVtcycpXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG5ld1RpdGxlID0gbmV3QXJ0aWNsZS5kYXRhc2V0ICYmIG5ld0FydGljbGUuZGF0YXNldC50aXRsZVxyXG4gICAgY29uc3QgbmV3VXJsID0gbmV3QXJ0aWNsZS5kYXRhc2V0ICYmIG5ld0FydGljbGUuZGF0YXNldC51cmxcclxuICAgIGNvbnN0IHByZXZVcmwgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWVcclxuXHJcbiAgICBjb25zb2xlLmluZm8oJ1twb3N0LWluZmluaXRlXSBuZXcgYXJ0aWNsZSBhcHBlbmRlZCcsIHt0aXRsZTogbmV3VGl0bGUsIHVybDogbmV3VXJsLCBwcmV2VXJsfSlcclxuXHJcbiAgICAvLyBSZS1pbml0IHNjb3BlZCBiZWhhdmlvcnNcclxuICAgIHRyeSB7IHZpZGVvUmVzcG9uc2l2ZShuZXdBcnRpY2xlKTsgY29uc29sZS5kZWJ1ZygnW3Bvc3QtaW5maW5pdGVdIHZpZGVvUmVzcG9uc2l2ZSByYW4nKSB9IGNhdGNoIChlKSB7IGNvbnNvbGUuZXJyb3IoJ1twb3N0LWluZmluaXRlXSB2aWRlb1Jlc3BvbnNpdmUgZXJyb3InLCBlKSB9XHJcbiAgICB0cnkgeyByZXNpemVJbWFnZXNJbkdhbGxlcmllcyhuZXdBcnRpY2xlKTsgY29uc29sZS5kZWJ1ZygnW3Bvc3QtaW5maW5pdGVdIHJlc2l6ZUltYWdlc0luR2FsbGVyaWVzIHJhbicpIH0gY2F0Y2ggKGUpIHsgY29uc29sZS5lcnJvcignW3Bvc3QtaW5maW5pdGVdIHJlc2l6ZUltYWdlc0luR2FsbGVyaWVzIGVycm9yJywgZSkgfVxyXG4gICAgdHJ5IHsgaGlnaGxpZ2h0UHJpc20obmV3QXJ0aWNsZSk7IGNvbnNvbGUuZGVidWcoJ1twb3N0LWluZmluaXRlXSBoaWdobGlnaHRQcmlzbSByYW4nKSB9IGNhdGNoIChlKSB7IGNvbnNvbGUuZXJyb3IoJ1twb3N0LWluZmluaXRlXSBoaWdobGlnaHRQcmlzbSBlcnJvcicsIGUpIH1cclxuXHJcbiAgICAvLyBBbmFseXRpY3NcclxuICAgIHRyeSB7IGFuYWx5dGljcy50cmFja1BhZ2VWaWV3KG5ld1VybCwgbmV3VGl0bGUsIHByZXZVcmwpOyBjb25zb2xlLmRlYnVnKCdbcG9zdC1pbmZpbml0ZV0gYW5hbHl0aWNzLnRyYWNrUGFnZVZpZXcgY2FsbGVkJykgfSBjYXRjaCAoZSkgeyBjb25zb2xlLmVycm9yKCdbcG9zdC1pbmZpbml0ZV0gYW5hbHl0aWNzLnRyYWNrUGFnZVZpZXcgZXJyb3InLCBlKSB9XHJcbiAgICB0cnkgeyBhbmFseXRpY3Mub2JzZXJ2ZUFydGljbGUobmV3QXJ0aWNsZSwgbmV3VGl0bGUpOyBjb25zb2xlLmRlYnVnKCdbcG9zdC1pbmZpbml0ZV0gYW5hbHl0aWNzLm9ic2VydmVBcnRpY2xlIGNhbGxlZCcpIH0gY2F0Y2ggKGUpIHsgY29uc29sZS5lcnJvcignW3Bvc3QtaW5maW5pdGVdIGFuYWx5dGljcy5vYnNlcnZlQXJ0aWNsZSBlcnJvcicsIGUpIH1cclxuXHJcbiAgICAvLyBDaGFpbiBwcmVmZXRjaGluZ1xyXG4gICAgY29uc3QgbmV4dE5leHRMaW5rID0gbmV3QXJ0aWNsZS5xdWVyeVNlbGVjdG9yKCcuanMtbmV4dC1wb3N0LWRhdGEnKVxyXG4gICAgaWYgKG5leHROZXh0TGluayAmJiBuZXh0TmV4dExpbmsuZGF0YXNldCAmJiBuZXh0TmV4dExpbmsuZGF0YXNldC51cmwpIHtcclxuICAgICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKVxyXG4gICAgICBsaW5rLnJlbCA9ICdwcmVmZXRjaCdcclxuICAgICAgbGluay5ocmVmID0gbmV4dE5leHRMaW5rLmRhdGFzZXQudXJsXHJcbiAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobGluaylcclxuICAgICAgY29uc29sZS5kZWJ1ZygnW3Bvc3QtaW5maW5pdGVdIHByZWZldGNoaW5nIG5leHQtbmV4dCBhcnRpY2xlJywgbGluay5ocmVmKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc29sZS5kZWJ1ZygnW3Bvc3QtaW5maW5pdGVdIG5vIG5leHQtbmV4dCBsaW5rIGZvdW5kIGluIGFwcGVuZGVkIGFydGljbGUnKVxyXG4gICAgfVxyXG4gIH0pXHJcblxyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsICgpID0+IHtcclxuICAgIGNvbnNvbGUuaW5mbygnW3Bvc3QtaW5maW5pdGVdIHBvcHN0YXRlIGV2ZW50JylcclxuICB9KVxyXG5cclxuICByZXR1cm4gaW5mU2Nyb2xsXHJcbn1cclxuIiwiLy8gUG9zdFxuaW1wb3J0ICcuL21haW4nXG5cbmltcG9ydCB2aWRlb1Jlc3BvbnNpdmUgZnJvbSAnLi9jb21wb25lbnRzL3ZpZGVvLXJlc3BvbnNpdmUnXG5pbXBvcnQgcmVzaXplSW1hZ2VzSW5HYWxsZXJpZXMgZnJvbSAnLi9jb21wb25lbnRzL3Jlc2l6ZS1pbWFnZXMtZ2FsbGVyaWVzJ1xuaW1wb3J0IGhpZ2hsaWdodFByaXNtIGZyb20gJy4vY29tcG9uZW50cy9oaWdobGlnaHQtcHJpc21qcydcbmltcG9ydCBNNEdhbGxlcnkgZnJvbSAnLi9jb21wb25lbnRzL2dhbGxlcnknXG5pbXBvcnQgaXNTaW5nbGVQb3N0IGZyb20gJy4vcG9zdC9pcy1zaW5nZ2xlLXBvc3QnXG5cbi8vIEltcG9ydCBJbmZpbml0ZSBTY3JvbGwgTWFuYWdlclxuaW1wb3J0IGluaXRJbmZpbml0ZVNjcm9sbCBmcm9tICcuL3Bvc3QtaW5maW5pdGUnXG5cbmNvbnN0IE00UG9zdFNldHVwID0gKCkgPT4ge1xuICBjb25zb2xlLmxvZygnTTRQb3N0U2V0dXA6IFN0YXJ0aW5nIGluaXRpYWxpemF0aW9uLi4uJyk7IC8vIERlYnVnIExvZ1xuICBcbiAgdmlkZW9SZXNwb25zaXZlKClcbiAgcmVzaXplSW1hZ2VzSW5HYWxsZXJpZXMoKVxuICBoaWdobGlnaHRQcmlzbSgnY29kZVtjbGFzcyo9bGFuZ3VhZ2UtXScpXG4gIGlzU2luZ2xlUG9zdCgpXG4gIE00R2FsbGVyeSgpXG5cbiAgLy8gSW5pdGlhbGl6ZSBJbmZpbml0ZSBTY3JvbGxcbiAgY29uc29sZS5sb2coJ000UG9zdFNldHVwOiBJbml0aWFsaXppbmcgSW5maW5pdGUgU2Nyb2xsLi4uJyk7IC8vIERlYnVnIExvZ1xuICBpbml0SW5maW5pdGVTY3JvbGwoKVxufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgTTRQb3N0U2V0dXApIiwiaW1wb3J0IGRvY1NlbGVjdG9yQWxsIGZyb20gJy4uL2FwcC9kb2N1bWVudC1xdWVyeS1zZWxlY3Rvci1hbGwnXG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHtcbiAgaWYgKCFkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucygnaXMtc2luZ2xlLXBvc3QnKSkgcmV0dXJuXG5cbiAgY29uc3QgJHNoYXJlQm94ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLXNoYXJlJylcblxuICBpZiAoISRzaGFyZUJveCkgcmV0dXJuXG5cbiAgY29uc3QgJG9ic2VydmUgPSBkb2NTZWxlY3RvckFsbCgnLmtnLXdpZHRoLWZ1bGwsIC5rZy13aWR0aC13aWRlJylcblxuICBpZiAoISRvYnNlcnZlLmxlbmd0aCkgcmV0dXJuXG5cbiAgaWYgKGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGggPD0gMTAwMCkgcmV0dXJuXG5cbiAgLyogSW50ZXJzZWN0IHNoYXJlIGJveCB3aXRoIGltYWdlID0+IHJldHVybiB0cnVlIG9yIGZhbHNlXG4gIC8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cbiAgY29uc3QgaW50ZXJzZWN0cyA9IChlbDEsIGVsMikgPT4ge1xuICAgIGNvbnN0IHJlY3QxID0gZWwxLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgY29uc3QgcmVjdDIgPSBlbDIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblxuICAgIHJldHVybiAhKHJlY3QxLnRvcCA+IHJlY3QyLmJvdHRvbSB8fCByZWN0MS5yaWdodCA8IHJlY3QyLmxlZnQgfHwgcmVjdDEuYm90dG9tIDwgcmVjdDIudG9wIHx8IHJlY3QxLmxlZnQgPiByZWN0Mi5yaWdodClcbiAgfVxuXG4gIC8qIHRoZSBmbG9hdGluZyBmYWRlIHNoYXJpbmcgaW4gdGhlIHNpZGViYXJcbiAgLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuICBjb25zdCBzaGFyZUZhZGUgPSAoKSA9PiB7XG4gICAgbGV0IGlzSGlkZGVuID0gZmFsc2VcblxuICAgIGZvciAoY29uc3QgaSBpbiAkb2JzZXJ2ZSkge1xuICAgICAgaWYgKGludGVyc2VjdHMoJHNoYXJlQm94LCAkb2JzZXJ2ZVtpXSkpIHtcbiAgICAgICAgaXNIaWRkZW4gPSB0cnVlXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuXG4gICAgaXNIaWRkZW4gPyAkc2hhcmVCb3guY2xhc3NMaXN0LmFkZCgnaXMtaGlkZGVuJykgOiAkc2hhcmVCb3guY2xhc3NMaXN0LnJlbW92ZSgnaXMtaGlkZGVuJylcbiAgfVxuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBzaGFyZUZhZGUsIHsgcGFzc2l2ZTogdHJ1ZSB9KVxuXG4gIC8vXG59XG4iXX0=

//# sourceMappingURL=map/post.js.map
