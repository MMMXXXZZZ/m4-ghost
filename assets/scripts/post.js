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

},{"../lib/haptic":27,"_process":12}],16:[function(require,module,exports){
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

},{"./load-script":21,"@babel/runtime/helpers/interopRequireDefault":1}],19:[function(require,module,exports){
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

},{"../app/document-query-selector-all":14,"./load-script":21,"@babel/runtime/helpers/interopRequireDefault":1}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initIgShareStory;
/**
 * ig-share-story.js
 *
 * "Add to Story" button — shares the post's feature image via the
 * Web Share API so the user can paste it into an Instagram Story.
 *
 * Usage (in a Ghost template):
 *   <div class="ig-share-root" data-image="{{feature_image}}"></div>
 *
 * Configuration:
 *   Set ICON_URL to the URL of the Instagram-camera icon you want
 *   displayed in the circular button container.
 */

// ─── Configuration ────────────────────────────────────────────────────────────

const ICON_URL = 'data:image/png;base64,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'; // ← replace with your icon URL

// ─── Language support ─────────────────────────────────────────────────────────

const translations = {
  es: {
    addToStory: 'Agregar a Historia',
    selectApp: 'Selecciona Instagram',
    errorMessage: 'Error al compartir. Por favor intenta nuevamente.',
    mobileOnly: '(Solo móvil)'
  },
  en: {
    addToStory: 'Add to Story',
    selectApp: 'Select Instagram',
    errorMessage: 'Error sharing. Please try again.',
    mobileOnly: '(Mobile only)'
  }
};
function getLang() {
  const lang = (navigator.language || navigator.userLanguage || 'es').slice(0, 2);
  return lang === 'en' ? 'en' : 'es';
}

// ─── Device detection ─────────────────────────────────────────────────────────

function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || navigator.maxTouchPoints && navigator.maxTouchPoints > 1;
}

// ─── CSS custom property for the icon URL ─────────────────────────────────────
// The rest of the styles live in _ig-share-story.scss.

function injectIconVar() {
  if (document.getElementById('ig-share-icon-var')) return;
  const style = document.createElement('style');
  style.id = 'ig-share-icon-var';
  style.textContent = `:root { --ig-share-icon-url: url('${ICON_URL}'); }`;
  document.head.appendChild(style);
}

// ─── Button rendering ─────────────────────────────────────────────────────────

function renderShareButton(root, imageUrl, lang) {
  const t = translations[lang];
  root.innerHTML = `
    <button type="button" class="ig-share-btn" aria-label="${t.addToStory}">
      <div class="ig-share-btn__icon"></div>
      <div class="ig-share-btn__text-wrap">
        <div class="ig-share-btn__label">${t.addToStory}</div>
      </div>
    </button>
  `;
  const button = root.querySelector('button');
  const isMobile = isMobileDevice();
  if (!isMobile) {
    button.disabled = true;
    button.querySelector('.ig-share-btn__label').innerHTML = `${t.addToStory}<br><span class="ig-share-btn__note">${t.mobileOnly}</span>`;
    return;
  }
  button.addEventListener('click', async function () {
    if (button.classList.contains('ig-share-btn--loading')) return;
    const textWrap = button.querySelector('.ig-share-btn__text-wrap');
    const originalLabel = textWrap.querySelector('.ig-share-btn__label');
    const loadingLabel = document.createElement('div');
    button.classList.add('ig-share-btn--loading');
    loadingLabel.className = 'ig-share-btn__label ig-share-btn__label--enter';
    loadingLabel.textContent = t.selectApp;
    textWrap.appendChild(loadingLabel);
    setTimeout(() => {
      originalLabel.classList.add('ig-share-btn__label--exit');
      originalLabel.style.pointerEvents = 'none';
    }, 10);
    try {
      await new Promise(resolve => setTimeout(resolve, 700));
      const response = await fetch(imageUrl, {
        mode: 'cors'
      });
      if (!response.ok) throw new Error('Image load failed');
      const blob = await response.blob();
      const file = new File([blob], 'historia.png', {
        type: blob.type
      });
      if (!navigator.canShare || !navigator.canShare({
        files: [file]
      })) {
        throw new Error("Web Share API not supported or can't share files");
      }
      await navigator.share({
        files: [file]
      });
    } catch (_err) {
      alert(t.errorMessage);
    } finally {
      loadingLabel.classList.remove('ig-share-btn__label--enter');
      loadingLabel.classList.add('ig-share-btn__label--exit');
      setTimeout(() => {
        textWrap.removeChild(loadingLabel);
        originalLabel.classList.remove('ig-share-btn__label--exit');
        originalLabel.style.pointerEvents = 'auto';
        button.classList.remove('ig-share-btn--loading');
      }, 400);
    }
  });
}

// ─── Public init ──────────────────────────────────────────────────────────────

function initIgShareStory() {
  injectIconVar();
  const lang = getLang();
  document.querySelectorAll('.ig-share-root[data-image]').forEach(root => {
    const imageUrl = root.getAttribute('data-image');
    if (imageUrl) renderShareButton(root, imageUrl, lang);
  });
}

},{}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

},{"../app/document-query-selector-all":14,"@babel/runtime/helpers/interopRequireDefault":1}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
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

},{}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
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

},{"./haptic":27}],29:[function(require,module,exports){
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

},{"_process":12}],30:[function(require,module,exports){
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

},{"./app/dark-mode":13,"./app/haptic-feedback":15,"./app/header-transparency":16,"./app/social-media":17,"./components/load-script":21,"./components/promo-popup":22,"./components/scroll-hide-header":24,"./lib/meilisearch":28,"./lib/speculation-rules":29,"./post-infinite":31,"@babel/runtime/helpers/interopRequireDefault":1,"lazysizes":11}],31:[function(require,module,exports){
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

},{"./components/gallery":18,"./components/highlight-prismjs":19,"./components/resize-images-galleries":23,"./components/video-responsive":25,"./lib/analytics":26,"@babel/runtime/helpers/interopRequireDefault":1,"infinite-scroll":7}],32:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
require("./main");
var _videoResponsive = _interopRequireDefault(require("./components/video-responsive"));
var _resizeImagesGalleries = _interopRequireDefault(require("./components/resize-images-galleries"));
var _highlightPrismjs = _interopRequireDefault(require("./components/highlight-prismjs"));
var _gallery = _interopRequireDefault(require("./components/gallery"));
var _isSingglePost = _interopRequireDefault(require("./post/is-singgle-post"));
var _postInfinite = _interopRequireDefault(require("./post-infinite"));
var _igShareStory = _interopRequireDefault(require("./components/ig-share-story"));
// Post
// Imports main.js which handles all shared setup (nav, dark mode, haptic, etc.)
// This file only adds post-specific behaviour on top.

const M4PostSetup = () => {
  console.log('M4PostSetup: Starting initialization...');
  (0, _videoResponsive.default)();
  (0, _resizeImagesGalleries.default)();
  (0, _highlightPrismjs.default)('code[class*=language-]');
  (0, _isSingglePost.default)();
  (0, _gallery.default)();
  (0, _igShareStory.default)();
  console.log('M4PostSetup: Initializing Infinite Scroll...');
  (0, _postInfinite.default)();

  // Haptic feedback is already active from main.js — the delegated listener on
  // `document` automatically covers articles appended by infinite scroll.
};
document.addEventListener('DOMContentLoaded', M4PostSetup);

},{"./components/gallery":18,"./components/highlight-prismjs":19,"./components/ig-share-story":20,"./components/resize-images-galleries":23,"./components/video-responsive":25,"./main":30,"./post-infinite":31,"./post/is-singgle-post":33,"@babel/runtime/helpers/interopRequireDefault":1}],33:[function(require,module,exports){
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

},{"../app/document-query-selector-all":14,"@babel/runtime/helpers/interopRequireDefault":1}]},{},[32])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHQuanMiLCJub2RlX21vZHVsZXMvZXYtZW1pdHRlci9ldi1lbWl0dGVyLmpzIiwibm9kZV9tb2R1bGVzL2Zpenp5LXVpLXV0aWxzL3V0aWxzLmpzIiwibm9kZV9tb2R1bGVzL2luZmluaXRlLXNjcm9sbC9qcy9idXR0b24uanMiLCJub2RlX21vZHVsZXMvaW5maW5pdGUtc2Nyb2xsL2pzL2NvcmUuanMiLCJub2RlX21vZHVsZXMvaW5maW5pdGUtc2Nyb2xsL2pzL2hpc3RvcnkuanMiLCJub2RlX21vZHVsZXMvaW5maW5pdGUtc2Nyb2xsL2pzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2luZmluaXRlLXNjcm9sbC9qcy9wYWdlLWxvYWQuanMiLCJub2RlX21vZHVsZXMvaW5maW5pdGUtc2Nyb2xsL2pzL3Njcm9sbC13YXRjaC5qcyIsIm5vZGVfbW9kdWxlcy9pbmZpbml0ZS1zY3JvbGwvanMvc3RhdHVzLmpzIiwibm9kZV9tb2R1bGVzL2xhenlzaXplcy9sYXp5c2l6ZXMuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwic3JjL2pzL2FwcC9kYXJrLW1vZGUuanMiLCJzcmMvanMvYXBwL2RvY3VtZW50LXF1ZXJ5LXNlbGVjdG9yLWFsbC5qcyIsInNyYy9qcy9hcHAvaGFwdGljLWZlZWRiYWNrLmpzIiwic3JjL2pzL2FwcC9oZWFkZXItdHJhbnNwYXJlbmN5LmpzIiwic3JjL2pzL2FwcC9zb2NpYWwtbWVkaWEuanMiLCJzcmMvanMvY29tcG9uZW50cy9nYWxsZXJ5LmpzIiwic3JjL2pzL2NvbXBvbmVudHMvaGlnaGxpZ2h0LXByaXNtanMuanMiLCJzcmMvanMvY29tcG9uZW50cy9pZy1zaGFyZS1zdG9yeS5qcyIsInNyYy9qcy9jb21wb25lbnRzL2xvYWQtc2NyaXB0LmpzIiwic3JjL2pzL2NvbXBvbmVudHMvcHJvbW8tcG9wdXAuanMiLCJzcmMvanMvY29tcG9uZW50cy9yZXNpemUtaW1hZ2VzLWdhbGxlcmllcy5qcyIsInNyYy9qcy9jb21wb25lbnRzL3Njcm9sbC1oaWRlLWhlYWRlci5qcyIsInNyYy9qcy9jb21wb25lbnRzL3ZpZGVvLXJlc3BvbnNpdmUuanMiLCJzcmMvanMvbGliL2FuYWx5dGljcy5qcyIsInNyYy9qcy9saWIvaGFwdGljLmpzIiwic3JjL2pzL2xpYi9tZWlsaXNlYXJjaC5qcyIsInNyYy9qcy9saWIvc3BlY3VsYXRpb24tcnVsZXMuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9wb3N0LWluZmluaXRlLmpzIiwic3JjL2pzL3Bvc3QuanMiLCJzcmMvanMvcG9zdC9pcy1zaW5nZ2xlLXBvc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzl5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUFRLEVBQUUsRUFBRTtNQUFFLFNBQVMsRUFBRTtJQUFJLENBQUM7RUFBRSxDQUFDO0VBQ3hHLEtBQUssRUFBTTtJQUFFLE9BQU8sRUFBRSxDQUFDO01BQUUsUUFBUSxFQUFFLEVBQUU7TUFBRSxTQUFTLEVBQUU7SUFBSSxDQUFDLEVBQUU7TUFBRSxLQUFLLEVBQUUsRUFBRTtNQUFHLFFBQVEsRUFBRSxFQUFFO01BQUUsU0FBUyxFQUFFO0lBQUksQ0FBQyxFQUM3RTtNQUFFLEtBQUssRUFBRSxFQUFFO01BQUcsUUFBUSxFQUFFLEVBQUU7TUFBRSxTQUFTLEVBQUU7SUFBSSxDQUFDLEVBQUU7TUFBRSxLQUFLLEVBQUUsRUFBRTtNQUFFLFFBQVEsRUFBRSxFQUFFO01BQUUsU0FBUyxFQUFFO0lBQUksQ0FBQztFQUFFLENBQUM7RUFDcEg7RUFDQSxLQUFLLEVBQU07SUFBRSxPQUFPLEVBQUUsQ0FBQztNQUFFLFFBQVEsRUFBRSxFQUFFO01BQUUsU0FBUyxFQUFFO0lBQUksQ0FBQztFQUFFLENBQUM7RUFDMUQsTUFBTSxFQUFLO0lBQUUsT0FBTyxFQUFFLENBQUM7TUFBRSxRQUFRLEVBQUUsRUFBRTtNQUFFLFNBQVMsRUFBRTtJQUFJLENBQUM7RUFBRSxDQUFDO0VBQzFELEtBQUssRUFBTTtJQUFFLE9BQU8sRUFBRSxDQUFDO01BQUUsUUFBUSxFQUFFLEVBQUU7TUFBRSxTQUFTLEVBQUU7SUFBSSxDQUFDO0VBQUUsQ0FBQztFQUMxRCxJQUFJLEVBQU87SUFBRSxPQUFPLEVBQUUsQ0FBQztNQUFFLFFBQVEsRUFBRSxFQUFFO01BQUUsU0FBUyxFQUFFO0lBQUksQ0FBQztFQUFFLENBQUM7RUFDMUQsS0FBSyxFQUFNO0lBQUUsT0FBTyxFQUFFLENBQUM7TUFBRSxRQUFRLEVBQUUsRUFBRTtNQUFFLFNBQVMsRUFBRTtJQUFJLENBQUM7RUFBRSxDQUFDO0VBQzFEO0VBQ0EsU0FBUyxFQUFFO0lBQUUsT0FBTyxFQUFFLENBQUM7TUFBRSxRQUFRLEVBQUUsQ0FBQztNQUFHLFNBQVMsRUFBRTtJQUFJLENBQUM7RUFB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TUFBTSxTQUFTLEdBQUcsQ0FBQSxLQUFNO0lBQ3RCLElBQUksUUFBUSxHQUFHLEtBQUs7SUFFcEIsS0FBSyxNQUFNLENBQUMsSUFBSSxRQUFRLEVBQUU7TUFDeEIsSUFBSSxVQUFVLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ3RDLFFBQVEsR0FBRyxJQUFJO1FBQ2Y7TUFDRjtJQUNGO0lBRUEsUUFBUSxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztFQUMzRixDQUFDO0VBRUQsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUU7SUFBRSxPQUFPLEVBQUU7RUFBSyxDQUFDLENBQUM7O0VBRS9EO0FBQ0YsQ0FBQztBQUFBLE9BQUEsQ0FBQSxPQUFBLEdBQUEsUUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoZSkge1xuICByZXR1cm4gZSAmJiBlLl9fZXNNb2R1bGUgPyBlIDoge1xuICAgIFwiZGVmYXVsdFwiOiBlXG4gIH07XG59XG5tb2R1bGUuZXhwb3J0cyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlLCBtb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0czsiLCIvKipcbiAqIEV2RW1pdHRlciB2Mi4xLjFcbiAqIExpbCcgZXZlbnQgZW1pdHRlclxuICogTUlUIExpY2Vuc2VcbiAqL1xuXG4oIGZ1bmN0aW9uKCBnbG9iYWwsIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlMgLSBCcm93c2VyaWZ5LCBXZWJwYWNrXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgZ2xvYmFsLkV2RW1pdHRlciA9IGZhY3RvcnkoKTtcbiAgfVxuXG59KCB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcywgZnVuY3Rpb24oKSB7XG5cbmZ1bmN0aW9uIEV2RW1pdHRlcigpIHt9XG5cbmxldCBwcm90byA9IEV2RW1pdHRlci5wcm90b3R5cGU7XG5cbnByb3RvLm9uID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKSB7XG4gIGlmICggIWV2ZW50TmFtZSB8fCAhbGlzdGVuZXIgKSByZXR1cm4gdGhpcztcblxuICAvLyBzZXQgZXZlbnRzIGhhc2hcbiAgbGV0IGV2ZW50cyA9IHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgLy8gc2V0IGxpc3RlbmVycyBhcnJheVxuICBsZXQgbGlzdGVuZXJzID0gZXZlbnRzWyBldmVudE5hbWUgXSA9IGV2ZW50c1sgZXZlbnROYW1lIF0gfHwgW107XG4gIC8vIG9ubHkgYWRkIG9uY2VcbiAgaWYgKCAhbGlzdGVuZXJzLmluY2x1ZGVzKCBsaXN0ZW5lciApICkge1xuICAgIGxpc3RlbmVycy5wdXNoKCBsaXN0ZW5lciApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5vbmNlID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKSB7XG4gIGlmICggIWV2ZW50TmFtZSB8fCAhbGlzdGVuZXIgKSByZXR1cm4gdGhpcztcblxuICAvLyBhZGQgZXZlbnRcbiAgdGhpcy5vbiggZXZlbnROYW1lLCBsaXN0ZW5lciApO1xuICAvLyBzZXQgb25jZSBmbGFnXG4gIC8vIHNldCBvbmNlRXZlbnRzIGhhc2hcbiAgbGV0IG9uY2VFdmVudHMgPSB0aGlzLl9vbmNlRXZlbnRzID0gdGhpcy5fb25jZUV2ZW50cyB8fCB7fTtcbiAgLy8gc2V0IG9uY2VMaXN0ZW5lcnMgb2JqZWN0XG4gIGxldCBvbmNlTGlzdGVuZXJzID0gb25jZUV2ZW50c1sgZXZlbnROYW1lIF0gPSBvbmNlRXZlbnRzWyBldmVudE5hbWUgXSB8fCB7fTtcbiAgLy8gc2V0IGZsYWdcbiAgb25jZUxpc3RlbmVyc1sgbGlzdGVuZXIgXSA9IHRydWU7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5vZmYgPSBmdW5jdGlvbiggZXZlbnROYW1lLCBsaXN0ZW5lciApIHtcbiAgbGV0IGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbIGV2ZW50TmFtZSBdO1xuICBpZiAoICFsaXN0ZW5lcnMgfHwgIWxpc3RlbmVycy5sZW5ndGggKSByZXR1cm4gdGhpcztcblxuICBsZXQgaW5kZXggPSBsaXN0ZW5lcnMuaW5kZXhPZiggbGlzdGVuZXIgKTtcbiAgaWYgKCBpbmRleCAhPSAtMSApIHtcbiAgICBsaXN0ZW5lcnMuc3BsaWNlKCBpbmRleCwgMSApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5lbWl0RXZlbnQgPSBmdW5jdGlvbiggZXZlbnROYW1lLCBhcmdzICkge1xuICBsZXQgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1sgZXZlbnROYW1lIF07XG4gIGlmICggIWxpc3RlbmVycyB8fCAhbGlzdGVuZXJzLmxlbmd0aCApIHJldHVybiB0aGlzO1xuXG4gIC8vIGNvcHkgb3ZlciB0byBhdm9pZCBpbnRlcmZlcmVuY2UgaWYgLm9mZigpIGluIGxpc3RlbmVyXG4gIGxpc3RlbmVycyA9IGxpc3RlbmVycy5zbGljZSggMCApO1xuICBhcmdzID0gYXJncyB8fCBbXTtcbiAgLy8gb25jZSBzdHVmZlxuICBsZXQgb25jZUxpc3RlbmVycyA9IHRoaXMuX29uY2VFdmVudHMgJiYgdGhpcy5fb25jZUV2ZW50c1sgZXZlbnROYW1lIF07XG5cbiAgZm9yICggbGV0IGxpc3RlbmVyIG9mIGxpc3RlbmVycyApIHtcbiAgICBsZXQgaXNPbmNlID0gb25jZUxpc3RlbmVycyAmJiBvbmNlTGlzdGVuZXJzWyBsaXN0ZW5lciBdO1xuICAgIGlmICggaXNPbmNlICkge1xuICAgICAgLy8gcmVtb3ZlIGxpc3RlbmVyXG4gICAgICAvLyByZW1vdmUgYmVmb3JlIHRyaWdnZXIgdG8gcHJldmVudCByZWN1cnNpb25cbiAgICAgIHRoaXMub2ZmKCBldmVudE5hbWUsIGxpc3RlbmVyICk7XG4gICAgICAvLyB1bnNldCBvbmNlIGZsYWdcbiAgICAgIGRlbGV0ZSBvbmNlTGlzdGVuZXJzWyBsaXN0ZW5lciBdO1xuICAgIH1cbiAgICAvLyB0cmlnZ2VyIGxpc3RlbmVyXG4gICAgbGlzdGVuZXIuYXBwbHkoIHRoaXMsIGFyZ3MgKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8uYWxsT2ZmID0gZnVuY3Rpb24oKSB7XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHM7XG4gIGRlbGV0ZSB0aGlzLl9vbmNlRXZlbnRzO1xuICByZXR1cm4gdGhpcztcbn07XG5cbnJldHVybiBFdkVtaXR0ZXI7XG5cbn0gKSApO1xuIiwiLyoqXG4gKiBGaXp6eSBVSSB1dGlscyB2My4wLjBcbiAqIE1JVCBsaWNlbnNlXG4gKi9cblxuKCBmdW5jdGlvbiggZ2xvYmFsLCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCBnbG9iYWwgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIGdsb2JhbC5maXp6eVVJVXRpbHMgPSBmYWN0b3J5KCBnbG9iYWwgKTtcbiAgfVxuXG59KCB0aGlzLCBmdW5jdGlvbiBmYWN0b3J5KCBnbG9iYWwgKSB7XG5cbmxldCB1dGlscyA9IHt9O1xuXG4vLyAtLS0tLSBleHRlbmQgLS0tLS0gLy9cblxuLy8gZXh0ZW5kcyBvYmplY3RzXG51dGlscy5leHRlbmQgPSBmdW5jdGlvbiggYSwgYiApIHtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oIGEsIGIgKTtcbn07XG5cbi8vIC0tLS0tIG1vZHVsbyAtLS0tLSAvL1xuXG51dGlscy5tb2R1bG8gPSBmdW5jdGlvbiggbnVtLCBkaXYgKSB7XG4gIHJldHVybiAoICggbnVtICUgZGl2ICkgKyBkaXYgKSAlIGRpdjtcbn07XG5cbi8vIC0tLS0tIG1ha2VBcnJheSAtLS0tLSAvL1xuXG4vLyB0dXJuIGVsZW1lbnQgb3Igbm9kZUxpc3QgaW50byBhbiBhcnJheVxudXRpbHMubWFrZUFycmF5ID0gZnVuY3Rpb24oIG9iaiApIHtcbiAgLy8gdXNlIG9iamVjdCBpZiBhbHJlYWR5IGFuIGFycmF5XG4gIGlmICggQXJyYXkuaXNBcnJheSggb2JqICkgKSByZXR1cm4gb2JqO1xuXG4gIC8vIHJldHVybiBlbXB0eSBhcnJheSBpZiB1bmRlZmluZWQgb3IgbnVsbC4gIzZcbiAgaWYgKCBvYmogPT09IG51bGwgfHwgb2JqID09PSB1bmRlZmluZWQgKSByZXR1cm4gW107XG5cbiAgbGV0IGlzQXJyYXlMaWtlID0gdHlwZW9mIG9iaiA9PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb2JqLmxlbmd0aCA9PSAnbnVtYmVyJztcbiAgLy8gY29udmVydCBub2RlTGlzdCB0byBhcnJheVxuICBpZiAoIGlzQXJyYXlMaWtlICkgcmV0dXJuIFsgLi4ub2JqIF07XG5cbiAgLy8gYXJyYXkgb2Ygc2luZ2xlIGluZGV4XG4gIHJldHVybiBbIG9iaiBdO1xufTtcblxuLy8gLS0tLS0gcmVtb3ZlRnJvbSAtLS0tLSAvL1xuXG51dGlscy5yZW1vdmVGcm9tID0gZnVuY3Rpb24oIGFyeSwgb2JqICkge1xuICBsZXQgaW5kZXggPSBhcnkuaW5kZXhPZiggb2JqICk7XG4gIGlmICggaW5kZXggIT0gLTEgKSB7XG4gICAgYXJ5LnNwbGljZSggaW5kZXgsIDEgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0gZ2V0UGFyZW50IC0tLS0tIC8vXG5cbnV0aWxzLmdldFBhcmVudCA9IGZ1bmN0aW9uKCBlbGVtLCBzZWxlY3RvciApIHtcbiAgd2hpbGUgKCBlbGVtLnBhcmVudE5vZGUgJiYgZWxlbSAhPSBkb2N1bWVudC5ib2R5ICkge1xuICAgIGVsZW0gPSBlbGVtLnBhcmVudE5vZGU7XG4gICAgaWYgKCBlbGVtLm1hdGNoZXMoIHNlbGVjdG9yICkgKSByZXR1cm4gZWxlbTtcbiAgfVxufTtcblxuLy8gLS0tLS0gZ2V0UXVlcnlFbGVtZW50IC0tLS0tIC8vXG5cbi8vIHVzZSBlbGVtZW50IGFzIHNlbGVjdG9yIHN0cmluZ1xudXRpbHMuZ2V0UXVlcnlFbGVtZW50ID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIGlmICggdHlwZW9mIGVsZW0gPT0gJ3N0cmluZycgKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIGVsZW0gKTtcbiAgfVxuICByZXR1cm4gZWxlbTtcbn07XG5cbi8vIC0tLS0tIGhhbmRsZUV2ZW50IC0tLS0tIC8vXG5cbi8vIGVuYWJsZSAub250eXBlIHRvIHRyaWdnZXIgZnJvbSAuYWRkRXZlbnRMaXN0ZW5lciggZWxlbSwgJ3R5cGUnIClcbnV0aWxzLmhhbmRsZUV2ZW50ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICBsZXQgbWV0aG9kID0gJ29uJyArIGV2ZW50LnR5cGU7XG4gIGlmICggdGhpc1sgbWV0aG9kIF0gKSB7XG4gICAgdGhpc1sgbWV0aG9kIF0oIGV2ZW50ICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIGZpbHRlckZpbmRFbGVtZW50cyAtLS0tLSAvL1xuXG51dGlscy5maWx0ZXJGaW5kRWxlbWVudHMgPSBmdW5jdGlvbiggZWxlbXMsIHNlbGVjdG9yICkge1xuICAvLyBtYWtlIGFycmF5IG9mIGVsZW1zXG4gIGVsZW1zID0gdXRpbHMubWFrZUFycmF5KCBlbGVtcyApO1xuXG4gIHJldHVybiBlbGVtc1xuICAgIC8vIGNoZWNrIHRoYXQgZWxlbSBpcyBhbiBhY3R1YWwgZWxlbWVudFxuICAgIC5maWx0ZXIoICggZWxlbSApID0+IGVsZW0gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCApXG4gICAgLnJlZHVjZSggKCBmZkVsZW1zLCBlbGVtICkgPT4ge1xuICAgICAgLy8gYWRkIGVsZW0gaWYgbm8gc2VsZWN0b3JcbiAgICAgIGlmICggIXNlbGVjdG9yICkge1xuICAgICAgICBmZkVsZW1zLnB1c2goIGVsZW0gKTtcbiAgICAgICAgcmV0dXJuIGZmRWxlbXM7XG4gICAgICB9XG4gICAgICAvLyBmaWx0ZXIgJiBmaW5kIGl0ZW1zIGlmIHdlIGhhdmUgYSBzZWxlY3RvclxuICAgICAgLy8gZmlsdGVyXG4gICAgICBpZiAoIGVsZW0ubWF0Y2hlcyggc2VsZWN0b3IgKSApIHtcbiAgICAgICAgZmZFbGVtcy5wdXNoKCBlbGVtICk7XG4gICAgICB9XG4gICAgICAvLyBmaW5kIGNoaWxkcmVuXG4gICAgICBsZXQgY2hpbGRFbGVtcyA9IGVsZW0ucXVlcnlTZWxlY3RvckFsbCggc2VsZWN0b3IgKTtcbiAgICAgIC8vIGNvbmNhdCBjaGlsZEVsZW1zIHRvIGZpbHRlckZvdW5kIGFycmF5XG4gICAgICBmZkVsZW1zID0gZmZFbGVtcy5jb25jYXQoIC4uLmNoaWxkRWxlbXMgKTtcbiAgICAgIHJldHVybiBmZkVsZW1zO1xuICAgIH0sIFtdICk7XG59O1xuXG4vLyAtLS0tLSBkZWJvdW5jZU1ldGhvZCAtLS0tLSAvL1xuXG51dGlscy5kZWJvdW5jZU1ldGhvZCA9IGZ1bmN0aW9uKCBfY2xhc3MsIG1ldGhvZE5hbWUsIHRocmVzaG9sZCApIHtcbiAgdGhyZXNob2xkID0gdGhyZXNob2xkIHx8IDEwMDtcbiAgLy8gb3JpZ2luYWwgbWV0aG9kXG4gIGxldCBtZXRob2QgPSBfY2xhc3MucHJvdG90eXBlWyBtZXRob2ROYW1lIF07XG4gIGxldCB0aW1lb3V0TmFtZSA9IG1ldGhvZE5hbWUgKyAnVGltZW91dCc7XG5cbiAgX2NsYXNzLnByb3RvdHlwZVsgbWV0aG9kTmFtZSBdID0gZnVuY3Rpb24oKSB7XG4gICAgY2xlYXJUaW1lb3V0KCB0aGlzWyB0aW1lb3V0TmFtZSBdICk7XG5cbiAgICBsZXQgYXJncyA9IGFyZ3VtZW50cztcbiAgICB0aGlzWyB0aW1lb3V0TmFtZSBdID0gc2V0VGltZW91dCggKCkgPT4ge1xuICAgICAgbWV0aG9kLmFwcGx5KCB0aGlzLCBhcmdzICk7XG4gICAgICBkZWxldGUgdGhpc1sgdGltZW91dE5hbWUgXTtcbiAgICB9LCB0aHJlc2hvbGQgKTtcbiAgfTtcbn07XG5cbi8vIC0tLS0tIGRvY1JlYWR5IC0tLS0tIC8vXG5cbnV0aWxzLmRvY1JlYWR5ID0gZnVuY3Rpb24oIG9uRG9jUmVhZHkgKSB7XG4gIGxldCByZWFkeVN0YXRlID0gZG9jdW1lbnQucmVhZHlTdGF0ZTtcbiAgaWYgKCByZWFkeVN0YXRlID09ICdjb21wbGV0ZScgfHwgcmVhZHlTdGF0ZSA9PSAnaW50ZXJhY3RpdmUnICkge1xuICAgIC8vIGRvIGFzeW5jIHRvIGFsbG93IGZvciBvdGhlciBzY3JpcHRzIHRvIHJ1bi4gbWV0YWZpenp5L2ZsaWNraXR5IzQ0MVxuICAgIHNldFRpbWVvdXQoIG9uRG9jUmVhZHkgKTtcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnRE9NQ29udGVudExvYWRlZCcsIG9uRG9jUmVhZHkgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0gaHRtbEluaXQgLS0tLS0gLy9cblxuLy8gaHR0cDovL2JpdC5seS8zb1lMdXNjXG51dGlscy50b0Rhc2hlZCA9IGZ1bmN0aW9uKCBzdHIgKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSggLyguKShbQS1aXSkvZywgZnVuY3Rpb24oIG1hdGNoLCAkMSwgJDIgKSB7XG4gICAgcmV0dXJuICQxICsgJy0nICsgJDI7XG4gIH0gKS50b0xvd2VyQ2FzZSgpO1xufTtcblxubGV0IGNvbnNvbGUgPSBnbG9iYWwuY29uc29sZTtcblxuLy8gYWxsb3cgdXNlciB0byBpbml0aWFsaXplIGNsYXNzZXMgdmlhIFtkYXRhLW5hbWVzcGFjZV0gb3IgLmpzLW5hbWVzcGFjZSBjbGFzc1xuLy8gaHRtbEluaXQoIFdpZGdldCwgJ3dpZGdldE5hbWUnIClcbi8vIG9wdGlvbnMgYXJlIHBhcnNlZCBmcm9tIGRhdGEtbmFtZXNwYWNlLW9wdGlvbnNcbnV0aWxzLmh0bWxJbml0ID0gZnVuY3Rpb24oIFdpZGdldENsYXNzLCBuYW1lc3BhY2UgKSB7XG4gIHV0aWxzLmRvY1JlYWR5KCBmdW5jdGlvbigpIHtcbiAgICBsZXQgZGFzaGVkTmFtZXNwYWNlID0gdXRpbHMudG9EYXNoZWQoIG5hbWVzcGFjZSApO1xuICAgIGxldCBkYXRhQXR0ciA9ICdkYXRhLScgKyBkYXNoZWROYW1lc3BhY2U7XG4gICAgbGV0IGRhdGFBdHRyRWxlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCBgWyR7ZGF0YUF0dHJ9XWAgKTtcbiAgICBsZXQgalF1ZXJ5ID0gZ2xvYmFsLmpRdWVyeTtcblxuICAgIFsgLi4uZGF0YUF0dHJFbGVtcyBdLmZvckVhY2goICggZWxlbSApID0+IHtcbiAgICAgIGxldCBhdHRyID0gZWxlbS5nZXRBdHRyaWJ1dGUoIGRhdGFBdHRyICk7XG4gICAgICBsZXQgb3B0aW9ucztcbiAgICAgIHRyeSB7XG4gICAgICAgIG9wdGlvbnMgPSBhdHRyICYmIEpTT04ucGFyc2UoIGF0dHIgKTtcbiAgICAgIH0gY2F0Y2ggKCBlcnJvciApIHtcbiAgICAgICAgLy8gbG9nIGVycm9yLCBkbyBub3QgaW5pdGlhbGl6ZVxuICAgICAgICBpZiAoIGNvbnNvbGUgKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvciggYEVycm9yIHBhcnNpbmcgJHtkYXRhQXR0cn0gb24gJHtlbGVtLmNsYXNzTmFtZX06ICR7ZXJyb3J9YCApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIGluaXRpYWxpemVcbiAgICAgIGxldCBpbnN0YW5jZSA9IG5ldyBXaWRnZXRDbGFzcyggZWxlbSwgb3B0aW9ucyApO1xuICAgICAgLy8gbWFrZSBhdmFpbGFibGUgdmlhICQoKS5kYXRhKCduYW1lc3BhY2UnKVxuICAgICAgaWYgKCBqUXVlcnkgKSB7XG4gICAgICAgIGpRdWVyeS5kYXRhKCBlbGVtLCBuYW1lc3BhY2UsIGluc3RhbmNlICk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gIH0gKTtcbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5yZXR1cm4gdXRpbHM7XG5cbn0gKSApO1xuIiwiLy8gYnV0dG9uXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgcmVxdWlyZSgnLi9jb3JlJyksXG4gICAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJyksXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgd2luZG93LkluZmluaXRlU2Nyb2xsLFxuICAgICAgICB3aW5kb3cuZml6enlVSVV0aWxzLFxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEluZmluaXRlU2Nyb2xsLCB1dGlscyApIHtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gSW5maW5pdGVTY3JvbGxCdXR0b24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuY2xhc3MgSW5maW5pdGVTY3JvbGxCdXR0b24ge1xuICBjb25zdHJ1Y3RvciggZWxlbWVudCwgaW5mU2Nyb2xsICkge1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5pbmZTY3JvbGwgPSBpbmZTY3JvbGw7XG4gICAgLy8gZXZlbnRzXG4gICAgdGhpcy5jbGlja0hhbmRsZXIgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCB0aGlzLmNsaWNrSGFuZGxlciApO1xuICAgIGluZlNjcm9sbC5vbiggJ3JlcXVlc3QnLCB0aGlzLmRpc2FibGUuYmluZCggdGhpcyApICk7XG4gICAgaW5mU2Nyb2xsLm9uKCAnbG9hZCcsIHRoaXMuZW5hYmxlLmJpbmQoIHRoaXMgKSApO1xuICAgIGluZlNjcm9sbC5vbiggJ2Vycm9yJywgdGhpcy5oaWRlLmJpbmQoIHRoaXMgKSApO1xuICAgIGluZlNjcm9sbC5vbiggJ2xhc3QnLCB0aGlzLmhpZGUuYmluZCggdGhpcyApICk7XG4gIH1cblxuICBvbkNsaWNrKCBldmVudCApIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMuaW5mU2Nyb2xsLmxvYWROZXh0UGFnZSgpO1xuICB9XG5cbiAgZW5hYmxlKCkge1xuICAgIHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gIH1cblxuICBkaXNhYmxlKCkge1xuICAgIHRoaXMuZWxlbWVudC5kaXNhYmxlZCA9ICdkaXNhYmxlZCc7XG4gIH1cblxuICBoaWRlKCkge1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgdGhpcy5jbGlja0hhbmRsZXIgKTtcbiAgfVxuXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEluZmluaXRlU2Nyb2xsIG1ldGhvZHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gSW5maW5pdGVTY3JvbGwuZGVmYXVsdHMuYnV0dG9uID0gbnVsbDtcblxuSW5maW5pdGVTY3JvbGwuY3JlYXRlLmJ1dHRvbiA9IGZ1bmN0aW9uKCkge1xuICBsZXQgYnV0dG9uRWxlbSA9IHV0aWxzLmdldFF1ZXJ5RWxlbWVudCggdGhpcy5vcHRpb25zLmJ1dHRvbiApO1xuICBpZiAoIGJ1dHRvbkVsZW0gKSB7XG4gICAgdGhpcy5idXR0b24gPSBuZXcgSW5maW5pdGVTY3JvbGxCdXR0b24oIGJ1dHRvbkVsZW0sIHRoaXMgKTtcbiAgfVxufTtcblxuSW5maW5pdGVTY3JvbGwuZGVzdHJveS5idXR0b24gPSBmdW5jdGlvbigpIHtcbiAgaWYgKCB0aGlzLmJ1dHRvbiApIHRoaXMuYnV0dG9uLmRlc3Ryb3koKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5JbmZpbml0ZVNjcm9sbC5CdXR0b24gPSBJbmZpbml0ZVNjcm9sbEJ1dHRvbjtcblxucmV0dXJuIEluZmluaXRlU2Nyb2xsO1xuXG59ICkgKTtcbiIsIi8vIGNvcmVcbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICByZXF1aXJlKCdldi1lbWl0dGVyJyksXG4gICAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJyksXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5JbmZpbml0ZVNjcm9sbCA9IGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgd2luZG93LkV2RW1pdHRlcixcbiAgICAgICAgd2luZG93LmZpenp5VUlVdGlscyxcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggd2luZG93LCBFdkVtaXR0ZXIsIHV0aWxzICkge1xuXG5sZXQgalF1ZXJ5ID0gd2luZG93LmpRdWVyeTtcbi8vIGludGVybmFsIHN0b3JlIG9mIGFsbCBJbmZpbml0ZVNjcm9sbCBpbnRhbmNlc1xubGV0IGluc3RhbmNlcyA9IHt9O1xuXG5mdW5jdGlvbiBJbmZpbml0ZVNjcm9sbCggZWxlbWVudCwgb3B0aW9ucyApIHtcbiAgbGV0IHF1ZXJ5RWxlbSA9IHV0aWxzLmdldFF1ZXJ5RWxlbWVudCggZWxlbWVudCApO1xuXG4gIGlmICggIXF1ZXJ5RWxlbSApIHtcbiAgICBjb25zb2xlLmVycm9yKCAnQmFkIGVsZW1lbnQgZm9yIEluZmluaXRlU2Nyb2xsOiAnICsgKCBxdWVyeUVsZW0gfHwgZWxlbWVudCApICk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGVsZW1lbnQgPSBxdWVyeUVsZW07XG4gIC8vIGRvIG5vdCBpbml0aWFsaXplIHR3aWNlIG9uIHNhbWUgZWxlbWVudFxuICBpZiAoIGVsZW1lbnQuaW5maW5pdGVTY3JvbGxHVUlEICkge1xuICAgIGxldCBpbnN0YW5jZSA9IGluc3RhbmNlc1sgZWxlbWVudC5pbmZpbml0ZVNjcm9sbEdVSUQgXTtcbiAgICBpbnN0YW5jZS5vcHRpb24oIG9wdGlvbnMgKTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cblxuICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAvLyBvcHRpb25zXG4gIHRoaXMub3B0aW9ucyA9IHsgLi4uSW5maW5pdGVTY3JvbGwuZGVmYXVsdHMgfTtcbiAgdGhpcy5vcHRpb24oIG9wdGlvbnMgKTtcbiAgLy8gYWRkIGpRdWVyeVxuICBpZiAoIGpRdWVyeSApIHtcbiAgICB0aGlzLiRlbGVtZW50ID0galF1ZXJ5KCB0aGlzLmVsZW1lbnQgKTtcbiAgfVxuXG4gIHRoaXMuY3JlYXRlKCk7XG59XG5cbi8vIGRlZmF1bHRzXG5JbmZpbml0ZVNjcm9sbC5kZWZhdWx0cyA9IHtcbiAgLy8gcGF0aDogbnVsbCxcbiAgLy8gaGlkZU5hdjogbnVsbCxcbiAgLy8gZGVidWc6IGZhbHNlLFxufTtcblxuLy8gY3JlYXRlICYgZGVzdHJveSBtZXRob2RzXG5JbmZpbml0ZVNjcm9sbC5jcmVhdGUgPSB7fTtcbkluZmluaXRlU2Nyb2xsLmRlc3Ryb3kgPSB7fTtcblxubGV0IHByb3RvID0gSW5maW5pdGVTY3JvbGwucHJvdG90eXBlO1xuLy8gaW5oZXJpdCBFdkVtaXR0ZXJcbk9iamVjdC5hc3NpZ24oIHByb3RvLCBFdkVtaXR0ZXIucHJvdG90eXBlICk7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBnbG9iYWxseSB1bmlxdWUgaWRlbnRpZmllcnNcbmxldCBHVUlEID0gMDtcblxucHJvdG8uY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gIC8vIGNyZWF0ZSBjb3JlXG4gIC8vIGFkZCBpZCBmb3IgSW5maW5pdGVTY3JvbGwuZGF0YVxuICBsZXQgaWQgPSB0aGlzLmd1aWQgPSArK0dVSUQ7XG4gIHRoaXMuZWxlbWVudC5pbmZpbml0ZVNjcm9sbEdVSUQgPSBpZDsgLy8gZXhwYW5kb1xuICBpbnN0YW5jZXNbIGlkIF0gPSB0aGlzOyAvLyBhc3NvY2lhdGUgdmlhIGlkXG4gIC8vIHByb3BlcnRpZXNcbiAgdGhpcy5wYWdlSW5kZXggPSAxOyAvLyBkZWZhdWx0IHRvIGZpcnN0IHBhZ2VcbiAgdGhpcy5sb2FkQ291bnQgPSAwO1xuICB0aGlzLnVwZGF0ZUdldFBhdGgoKTtcbiAgLy8gYmFpbCBpZiBnZXRQYXRoIG5vdCBzZXQsIG9yIHJldHVybnMgZmFsc2V5ICM3NzZcbiAgbGV0IGhhc1BhdGggPSB0aGlzLmdldFBhdGggJiYgdGhpcy5nZXRQYXRoKCk7XG4gIGlmICggIWhhc1BhdGggKSB7XG4gICAgY29uc29sZS5lcnJvcignRGlzYWJsaW5nIEluZmluaXRlU2Nyb2xsJyk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMudXBkYXRlR2V0QWJzb2x1dGVQYXRoKCk7XG4gIHRoaXMubG9nKCAnaW5pdGlhbGl6ZWQnLCBbIHRoaXMuZWxlbWVudC5jbGFzc05hbWUgXSApO1xuICB0aGlzLmNhbGxPbkluaXQoKTtcbiAgLy8gY3JlYXRlIGZlYXR1cmVzXG4gIGZvciAoIGxldCBtZXRob2QgaW4gSW5maW5pdGVTY3JvbGwuY3JlYXRlICkge1xuICAgIEluZmluaXRlU2Nyb2xsLmNyZWF0ZVsgbWV0aG9kIF0uY2FsbCggdGhpcyApO1xuICB9XG59O1xuXG5wcm90by5vcHRpb24gPSBmdW5jdGlvbiggb3B0cyApIHtcbiAgT2JqZWN0LmFzc2lnbiggdGhpcy5vcHRpb25zLCBvcHRzICk7XG59O1xuXG4vLyBjYWxsIG9uSW5pdCBvcHRpb24sIHVzZWQgZm9yIGJpbmRpbmcgZXZlbnRzIG9uIGluaXRcbnByb3RvLmNhbGxPbkluaXQgPSBmdW5jdGlvbigpIHtcbiAgbGV0IG9uSW5pdCA9IHRoaXMub3B0aW9ucy5vbkluaXQ7XG4gIGlmICggb25Jbml0ICkge1xuICAgIG9uSW5pdC5jYWxsKCB0aGlzLCB0aGlzICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIGV2ZW50cyAtLS0tLSAvL1xuXG5wcm90by5kaXNwYXRjaEV2ZW50ID0gZnVuY3Rpb24oIHR5cGUsIGV2ZW50LCBhcmdzICkge1xuICB0aGlzLmxvZyggdHlwZSwgYXJncyApO1xuICBsZXQgZW1pdEFyZ3MgPSBldmVudCA/IFsgZXZlbnQgXS5jb25jYXQoIGFyZ3MgKSA6IGFyZ3M7XG4gIHRoaXMuZW1pdEV2ZW50KCB0eXBlLCBlbWl0QXJncyApO1xuICAvLyB0cmlnZ2VyIGpRdWVyeSBldmVudFxuICBpZiAoICFqUXVlcnkgfHwgIXRoaXMuJGVsZW1lbnQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIG5hbWVzcGFjZSBqUXVlcnkgZXZlbnRcbiAgdHlwZSArPSAnLmluZmluaXRlU2Nyb2xsJztcbiAgbGV0ICRldmVudCA9IHR5cGU7XG4gIGlmICggZXZlbnQgKSB7XG4gICAgLy8gY3JlYXRlIGpRdWVyeSBldmVudFxuICAgIC8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuZXctY2FwICovXG4gICAgbGV0IGpRRXZlbnQgPSBqUXVlcnkuRXZlbnQoIGV2ZW50ICk7XG4gICAgalFFdmVudC50eXBlID0gdHlwZTtcbiAgICAkZXZlbnQgPSBqUUV2ZW50O1xuICB9XG4gIHRoaXMuJGVsZW1lbnQudHJpZ2dlciggJGV2ZW50LCBhcmdzICk7XG59O1xuXG5sZXQgbG9nZ2VycyA9IHtcbiAgaW5pdGlhbGl6ZWQ6ICggY2xhc3NOYW1lICkgPT4gYG9uICR7Y2xhc3NOYW1lfWAsXG4gIHJlcXVlc3Q6ICggcGF0aCApID0+IGBVUkw6ICR7cGF0aH1gLFxuICBsb2FkOiAoIHJlc3BvbnNlLCBwYXRoICkgPT4gYCR7cmVzcG9uc2UudGl0bGUgfHwgJyd9LiBVUkw6ICR7cGF0aH1gLFxuICBlcnJvcjogKCBlcnJvciwgcGF0aCApID0+IGAke2Vycm9yfS4gVVJMOiAke3BhdGh9YCxcbiAgYXBwZW5kOiAoIHJlc3BvbnNlLCBwYXRoLCBpdGVtcyApID0+IGAke2l0ZW1zLmxlbmd0aH0gaXRlbXMuIFVSTDogJHtwYXRofWAsXG4gIGxhc3Q6ICggcmVzcG9uc2UsIHBhdGggKSA9PiBgVVJMOiAke3BhdGh9YCxcbiAgaGlzdG9yeTogKCB0aXRsZSwgcGF0aCApID0+IGBVUkw6ICR7cGF0aH1gLFxuICBwYWdlSW5kZXg6IGZ1bmN0aW9uKCBpbmRleCwgb3JpZ2luICkge1xuICAgIHJldHVybiBgY3VycmVudCBwYWdlIGRldGVybWluZWQgdG8gYmU6ICR7aW5kZXh9IGZyb20gJHtvcmlnaW59YDtcbiAgfSxcbn07XG5cbi8vIGxvZyBldmVudHNcbnByb3RvLmxvZyA9IGZ1bmN0aW9uKCB0eXBlLCBhcmdzICkge1xuICBpZiAoICF0aGlzLm9wdGlvbnMuZGVidWcgKSByZXR1cm47XG5cbiAgbGV0IG1lc3NhZ2UgPSBgW0luZmluaXRlU2Nyb2xsXSAke3R5cGV9YDtcbiAgbGV0IGxvZ2dlciA9IGxvZ2dlcnNbIHR5cGUgXTtcbiAgaWYgKCBsb2dnZXIgKSBtZXNzYWdlICs9ICcuICcgKyBsb2dnZXIuYXBwbHkoIHRoaXMsIGFyZ3MgKTtcbiAgY29uc29sZS5sb2coIG1lc3NhZ2UgKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIG1ldGhvZHMgdXNlZCBhbW91bmcgZmVhdHVyZXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxucHJvdG8udXBkYXRlTWVhc3VyZW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMud2luZG93SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICBsZXQgcmVjdCA9IHRoaXMuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdGhpcy50b3AgPSByZWN0LnRvcCArIHdpbmRvdy5zY3JvbGxZO1xufTtcblxucHJvdG8udXBkYXRlU2Nyb2xsZXIgPSBmdW5jdGlvbigpIHtcbiAgbGV0IGVsZW1lbnRTY3JvbGwgPSB0aGlzLm9wdGlvbnMuZWxlbWVudFNjcm9sbDtcbiAgaWYgKCAhZWxlbWVudFNjcm9sbCApIHtcbiAgICAvLyBkZWZhdWx0LCB1c2Ugd2luZG93XG4gICAgdGhpcy5zY3JvbGxlciA9IHdpbmRvdztcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gaWYgdHJ1ZSwgc2V0IHRvIGVsZW1lbnQsIG90aGVyd2lzZSB1c2Ugb3B0aW9uXG4gIHRoaXMuc2Nyb2xsZXIgPSBlbGVtZW50U2Nyb2xsID09PSB0cnVlID8gdGhpcy5lbGVtZW50IDpcbiAgICB1dGlscy5nZXRRdWVyeUVsZW1lbnQoIGVsZW1lbnRTY3JvbGwgKTtcbiAgaWYgKCAhdGhpcy5zY3JvbGxlciApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBmaW5kIGVsZW1lbnRTY3JvbGw6ICR7ZWxlbWVudFNjcm9sbH1gKTtcbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gcGFnZSBwYXRoIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnByb3RvLnVwZGF0ZUdldFBhdGggPSBmdW5jdGlvbigpIHtcbiAgbGV0IG9wdFBhdGggPSB0aGlzLm9wdGlvbnMucGF0aDtcbiAgaWYgKCAhb3B0UGF0aCApIHtcbiAgICBjb25zb2xlLmVycm9yKGBJbmZpbml0ZVNjcm9sbCBwYXRoIG9wdGlvbiByZXF1aXJlZC4gU2V0IGFzOiAke29wdFBhdGh9YCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGZ1bmN0aW9uXG4gIGxldCB0eXBlID0gdHlwZW9mIG9wdFBhdGg7XG4gIGlmICggdHlwZSA9PSAnZnVuY3Rpb24nICkge1xuICAgIHRoaXMuZ2V0UGF0aCA9IG9wdFBhdGg7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHRlbXBsYXRlIHN0cmluZzogJy9wYWdlcy97eyN9fS5odG1sJ1xuICBsZXQgdGVtcGxhdGVNYXRjaCA9IHR5cGUgPT0gJ3N0cmluZycgJiYgb3B0UGF0aC5tYXRjaCgne3sjfX0nKTtcbiAgaWYgKCB0ZW1wbGF0ZU1hdGNoICkge1xuICAgIHRoaXMudXBkYXRlR2V0UGF0aFRlbXBsYXRlKCBvcHRQYXRoICk7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHNlbGVjdG9yOiAnLm5leHQtcGFnZS1zZWxlY3RvcidcbiAgdGhpcy51cGRhdGVHZXRQYXRoU2VsZWN0b3IoIG9wdFBhdGggKTtcbn07XG5cbnByb3RvLnVwZGF0ZUdldFBhdGhUZW1wbGF0ZSA9IGZ1bmN0aW9uKCBvcHRQYXRoICkge1xuICAvLyBzZXQgZ2V0UGF0aCB3aXRoIHRlbXBsYXRlIHN0cmluZ1xuICB0aGlzLmdldFBhdGggPSAoKSA9PiB7XG4gICAgbGV0IG5leHRJbmRleCA9IHRoaXMucGFnZUluZGV4ICsgMTtcbiAgICByZXR1cm4gb3B0UGF0aC5yZXBsYWNlKCAne3sjfX0nLCBuZXh0SW5kZXggKTtcbiAgfTtcbiAgLy8gZ2V0IHBhZ2VJbmRleCBmcm9tIGxvY2F0aW9uXG4gIC8vIGNvbnZlcnQgcGF0aCBvcHRpb24gaW50byByZWdleCB0byBsb29rIGZvciBwYXR0ZXJuIGluIGxvY2F0aW9uXG4gIC8vIGVzY2FwZSBxdWVyeSAoPykgaW4gdXJsLCBhbGxvd3MgZm9yIHBhcnNpbmcgR0VUIHBhcmFtZXRlcnNcbiAgbGV0IHJlZ2V4U3RyaW5nID0gb3B0UGF0aFxuICAgIC5yZXBsYWNlKCAvKFxcXFxcXD98XFw/KS8sICdcXFxcPycgKVxuICAgIC5yZXBsYWNlKCAne3sjfX0nLCAnKFxcXFxkXFxcXGQ/XFxcXGQ/KScgKTtcbiAgbGV0IHRlbXBsYXRlUmUgPSBuZXcgUmVnRXhwKCByZWdleFN0cmluZyApO1xuICBsZXQgbWF0Y2ggPSBsb2NhdGlvbi5ocmVmLm1hdGNoKCB0ZW1wbGF0ZVJlICk7XG5cbiAgaWYgKCBtYXRjaCApIHtcbiAgICB0aGlzLnBhZ2VJbmRleCA9IHBhcnNlSW50KCBtYXRjaFsxXSwgMTAgKTtcbiAgICB0aGlzLmxvZyggJ3BhZ2VJbmRleCcsIFsgdGhpcy5wYWdlSW5kZXgsICd0ZW1wbGF0ZSBzdHJpbmcnIF0gKTtcbiAgfVxufTtcblxubGV0IHBhdGhSZWdleGVzID0gW1xuICAvLyBXb3JkUHJlc3MgJiBUdW1ibHIgLSBleGFtcGxlLmNvbS9wYWdlLzJcbiAgLy8gSmVreWxsIC0gZXhhbXBsZS5jb20vcGFnZTJcbiAgL14oLio/XFwvP3BhZ2VcXC8/KShcXGRcXGQ/XFxkPykoLio/JCkvLFxuICAvLyBEcnVwYWwgLSBleGFtcGxlLmNvbS8/cGFnZT0xXG4gIC9eKC4qP1xcLz9cXD9wYWdlPSkoXFxkXFxkP1xcZD8pKC4qPyQpLyxcbiAgLy8gY2F0Y2ggYWxsLCBsYXN0IG9jY3VyZW5jZSBvZiBhIG51bWJlclxuICAvKC4qPykoXFxkXFxkP1xcZD8pKD8hLipcXGQpKC4qPyQpLyxcbl07XG5cbi8vIHRyeSBtYXRjaGluZyBocmVmIHRvIHBhdGhSZWdleGVzIHBhdHRlcm5zXG5sZXQgZ2V0UGF0aFBhcnRzID0gSW5maW5pdGVTY3JvbGwuZ2V0UGF0aFBhcnRzID0gZnVuY3Rpb24oIGhyZWYgKSB7XG4gIGlmICggIWhyZWYgKSByZXR1cm47XG4gIGZvciAoIGxldCByZWdleCBvZiBwYXRoUmVnZXhlcyApIHtcbiAgICBsZXQgbWF0Y2ggPSBocmVmLm1hdGNoKCByZWdleCApO1xuICAgIGlmICggbWF0Y2ggKSB7XG4gICAgICBsZXQgWyAsIGJlZ2luLCBpbmRleCwgZW5kIF0gPSBtYXRjaDtcbiAgICAgIHJldHVybiB7IGJlZ2luLCBpbmRleCwgZW5kIH07XG4gICAgfVxuICB9XG59O1xuXG5wcm90by51cGRhdGVHZXRQYXRoU2VsZWN0b3IgPSBmdW5jdGlvbiggb3B0UGF0aCApIHtcbiAgLy8gcGFyc2UgaHJlZiBvZiBsaW5rOiAnLm5leHQtcGFnZS1saW5rJ1xuICBsZXQgaHJlZkVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCBvcHRQYXRoICk7XG4gIGlmICggIWhyZWZFbGVtICkge1xuICAgIGNvbnNvbGUuZXJyb3IoYEJhZCBJbmZpbml0ZVNjcm9sbCBwYXRoIG9wdGlvbi4gTmV4dCBsaW5rIG5vdCBmb3VuZDogJHtvcHRQYXRofWApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCBocmVmID0gaHJlZkVsZW0uZ2V0QXR0cmlidXRlKCdocmVmJyk7XG4gIGxldCBwYXRoUGFydHMgPSBnZXRQYXRoUGFydHMoIGhyZWYgKTtcbiAgaWYgKCAhcGF0aFBhcnRzICkge1xuICAgIGNvbnNvbGUuZXJyb3IoYEluZmluaXRlU2Nyb2xsIHVuYWJsZSB0byBwYXJzZSBuZXh0IGxpbmsgaHJlZjogJHtocmVmfWApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCB7IGJlZ2luLCBpbmRleCwgZW5kIH0gPSBwYXRoUGFydHM7XG4gIHRoaXMuaXNQYXRoU2VsZWN0b3IgPSB0cnVlOyAvLyBmbGFnIGZvciBjaGVja0xhc3RQYWdlKClcbiAgdGhpcy5nZXRQYXRoID0gKCkgPT4gYmVnaW4gKyAoIHRoaXMucGFnZUluZGV4ICsgMSApICsgZW5kO1xuICAvLyBnZXQgcGFnZUluZGV4IGZyb20gaHJlZlxuICB0aGlzLnBhZ2VJbmRleCA9IHBhcnNlSW50KCBpbmRleCwgMTAgKSAtIDE7XG4gIHRoaXMubG9nKCAncGFnZUluZGV4JywgWyB0aGlzLnBhZ2VJbmRleCwgJ25leHQgbGluaycgXSApO1xufTtcblxucHJvdG8udXBkYXRlR2V0QWJzb2x1dGVQYXRoID0gZnVuY3Rpb24oKSB7XG4gIGxldCBwYXRoID0gdGhpcy5nZXRQYXRoKCk7XG4gIC8vIHBhdGggZG9lc24ndCBzdGFydCB3aXRoIGh0dHAgb3IgL1xuICBsZXQgaXNBYnNvbHV0ZSA9IHBhdGgubWF0Y2goIC9eaHR0cC8gKSB8fCBwYXRoLm1hdGNoKCAvXlxcLy8gKTtcbiAgaWYgKCBpc0Fic29sdXRlICkge1xuICAgIHRoaXMuZ2V0QWJzb2x1dGVQYXRoID0gdGhpcy5nZXRQYXRoO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCB7IHBhdGhuYW1lIH0gPSBsb2NhdGlvbjtcbiAgLy8gcXVlcnkgcGFyYW1ldGVyICM4MjkuIGV4YW1wbGUuY29tLz9wZz0yXG4gIGxldCBpc1F1ZXJ5ID0gcGF0aC5tYXRjaCggL15cXD8vICk7XG4gIC8vIC9mb28vYmFyL2luZGV4Lmh0bWwgPT4gL2Zvby9iYXJcbiAgbGV0IGRpcmVjdG9yeSA9IHBhdGhuYW1lLnN1YnN0cmluZyggMCwgcGF0aG5hbWUubGFzdEluZGV4T2YoJy8nKSApO1xuICBsZXQgcGF0aFN0YXJ0ID0gaXNRdWVyeSA/IHBhdGhuYW1lIDogZGlyZWN0b3J5ICsgJy8nO1xuXG4gIHRoaXMuZ2V0QWJzb2x1dGVQYXRoID0gKCkgPT4gcGF0aFN0YXJ0ICsgdGhpcy5nZXRQYXRoKCk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBuYXYgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gaGlkZSBuYXZpZ2F0aW9uXG5JbmZpbml0ZVNjcm9sbC5jcmVhdGUuaGlkZU5hdiA9IGZ1bmN0aW9uKCkge1xuICBsZXQgbmF2ID0gdXRpbHMuZ2V0UXVlcnlFbGVtZW50KCB0aGlzLm9wdGlvbnMuaGlkZU5hdiApO1xuICBpZiAoICFuYXYgKSByZXR1cm47XG5cbiAgbmF2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIHRoaXMubmF2ID0gbmF2O1xufTtcblxuSW5maW5pdGVTY3JvbGwuZGVzdHJveS5oaWRlTmF2ID0gZnVuY3Rpb24oKSB7XG4gIGlmICggdGhpcy5uYXYgKSB0aGlzLm5hdi5zdHlsZS5kaXNwbGF5ID0gJyc7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBkZXN0cm95IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnByb3RvLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5hbGxPZmYoKTsgLy8gcmVtb3ZlIGFsbCBldmVudCBsaXN0ZW5lcnNcbiAgLy8gY2FsbCBkZXN0cm95IG1ldGhvZHNcbiAgZm9yICggbGV0IG1ldGhvZCBpbiBJbmZpbml0ZVNjcm9sbC5kZXN0cm95ICkge1xuICAgIEluZmluaXRlU2Nyb2xsLmRlc3Ryb3lbIG1ldGhvZCBdLmNhbGwoIHRoaXMgKTtcbiAgfVxuXG4gIGRlbGV0ZSB0aGlzLmVsZW1lbnQuaW5maW5pdGVTY3JvbGxHVUlEO1xuICBkZWxldGUgaW5zdGFuY2VzWyB0aGlzLmd1aWQgXTtcbiAgLy8gcmVtb3ZlIGpRdWVyeSBkYXRhLiAjODA3XG4gIGlmICggalF1ZXJ5ICYmIHRoaXMuJGVsZW1lbnQgKSB7XG4gICAgalF1ZXJ5LnJlbW92ZURhdGEoIHRoaXMuZWxlbWVudCwgJ2luZmluaXRlU2Nyb2xsJyApO1xuICB9XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSB1dGlsaXRpZXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gaHR0cHM6Ly9yZW15c2hhcnAuY29tLzIwMTAvMDcvMjEvdGhyb3R0bGluZy1mdW5jdGlvbi1jYWxsc1xuSW5maW5pdGVTY3JvbGwudGhyb3R0bGUgPSBmdW5jdGlvbiggZm4sIHRocmVzaG9sZCApIHtcbiAgdGhyZXNob2xkID0gdGhyZXNob2xkIHx8IDIwMDtcbiAgbGV0IGxhc3QsIHRpbWVvdXQ7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGxldCBub3cgPSArbmV3IERhdGUoKTtcbiAgICBsZXQgYXJncyA9IGFyZ3VtZW50cztcbiAgICBsZXQgdHJpZ2dlciA9ICgpID0+IHtcbiAgICAgIGxhc3QgPSBub3c7XG4gICAgICBmbi5hcHBseSggdGhpcywgYXJncyApO1xuICAgIH07XG4gICAgaWYgKCBsYXN0ICYmIG5vdyA8IGxhc3QgKyB0aHJlc2hvbGQgKSB7XG4gICAgICAvLyBob2xkIG9uIHRvIGl0XG4gICAgICBjbGVhclRpbWVvdXQoIHRpbWVvdXQgKTtcbiAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KCB0cmlnZ2VyLCB0aHJlc2hvbGQgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHJpZ2dlcigpO1xuICAgIH1cbiAgfTtcbn07XG5cbkluZmluaXRlU2Nyb2xsLmRhdGEgPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgZWxlbSA9IHV0aWxzLmdldFF1ZXJ5RWxlbWVudCggZWxlbSApO1xuICBsZXQgaWQgPSBlbGVtICYmIGVsZW0uaW5maW5pdGVTY3JvbGxHVUlEO1xuICByZXR1cm4gaWQgJiYgaW5zdGFuY2VzWyBpZCBdO1xufTtcblxuLy8gc2V0IGludGVybmFsIGpRdWVyeSwgZm9yIFdlYnBhY2sgKyBqUXVlcnkgdjNcbkluZmluaXRlU2Nyb2xsLnNldEpRdWVyeSA9IGZ1bmN0aW9uKCBqcXJ5ICkge1xuICBqUXVlcnkgPSBqcXJ5O1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gc2V0dXAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxudXRpbHMuaHRtbEluaXQoIEluZmluaXRlU2Nyb2xsLCAnaW5maW5pdGUtc2Nyb2xsJyApO1xuXG4vLyBhZGQgbm9vcCBfaW5pdCBtZXRob2QgZm9yIGpRdWVyeSBCcmlkZ2V0LiAjNzY4XG5wcm90by5faW5pdCA9IGZ1bmN0aW9uKCkge307XG5cbmxldCB7IGpRdWVyeUJyaWRnZXQgfSA9IHdpbmRvdztcbmlmICggalF1ZXJ5ICYmIGpRdWVyeUJyaWRnZXQgKSB7XG4gIGpRdWVyeUJyaWRnZXQoICdpbmZpbml0ZVNjcm9sbCcsIEluZmluaXRlU2Nyb2xsLCBqUXVlcnkgKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnJldHVybiBJbmZpbml0ZVNjcm9sbDtcblxufSApICk7XG4iLCIvLyBoaXN0b3J5XG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgcmVxdWlyZSgnLi9jb3JlJyksXG4gICAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJyksXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgd2luZG93LkluZmluaXRlU2Nyb2xsLFxuICAgICAgICB3aW5kb3cuZml6enlVSVV0aWxzLFxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEluZmluaXRlU2Nyb2xsLCB1dGlscyApIHtcblxubGV0IHByb3RvID0gSW5maW5pdGVTY3JvbGwucHJvdG90eXBlO1xuXG5PYmplY3QuYXNzaWduKCBJbmZpbml0ZVNjcm9sbC5kZWZhdWx0cywge1xuICBoaXN0b3J5OiAncmVwbGFjZScsXG4gIC8vIGhpc3RvcnlUaXRsZTogZmFsc2UsXG59ICk7XG5cbmxldCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuXG4vLyAtLS0tLSBjcmVhdGUvZGVzdHJveSAtLS0tLSAvL1xuXG5JbmZpbml0ZVNjcm9sbC5jcmVhdGUuaGlzdG9yeSA9IGZ1bmN0aW9uKCkge1xuICBpZiAoICF0aGlzLm9wdGlvbnMuaGlzdG9yeSApIHJldHVybjtcblxuICAvLyBjaGVjayBmb3Igc2FtZSBvcmlnaW5cbiAgbGluay5ocmVmID0gdGhpcy5nZXRBYnNvbHV0ZVBhdGgoKTtcbiAgLy8gTVMgRWRnZSBkb2VzIG5vdCBoYXZlIG9yaWdpbiBvbiBsaW5rXG4gIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1pY3Jvc29mdC5jb20vZW4tdXMvbWljcm9zb2Z0LWVkZ2UvcGxhdGZvcm0vaXNzdWVzLzEyMjM2NDkzL1xuICBsZXQgbGlua09yaWdpbiA9IGxpbmsub3JpZ2luIHx8IGxpbmsucHJvdG9jb2wgKyAnLy8nICsgbGluay5ob3N0O1xuICBsZXQgaXNTYW1lT3JpZ2luID0gbGlua09yaWdpbiA9PSBsb2NhdGlvbi5vcmlnaW47XG4gIGlmICggIWlzU2FtZU9yaWdpbiApIHtcbiAgICBjb25zb2xlLmVycm9yKCAnW0luZmluaXRlU2Nyb2xsXSBjYW5ub3Qgc2V0IGhpc3Rvcnkgd2l0aCBkaWZmZXJlbnQgb3JpZ2luOiAnICtcbiAgICAgIGAke2xpbmsub3JpZ2lufSBvbiAke2xvY2F0aW9uLm9yaWdpbn0gLiBIaXN0b3J5IGJlaGF2aW9yIGRpc2FibGVkLmAgKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyB0d28gd2F5cyB0byBoYW5kbGUgY2hhbmdpbmcgaGlzdG9yeVxuICBpZiAoIHRoaXMub3B0aW9ucy5hcHBlbmQgKSB7XG4gICAgdGhpcy5jcmVhdGVIaXN0b3J5QXBwZW5kKCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5jcmVhdGVIaXN0b3J5UGFnZUxvYWQoKTtcbiAgfVxufTtcblxucHJvdG8uY3JlYXRlSGlzdG9yeUFwcGVuZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnVwZGF0ZU1lYXN1cmVtZW50cygpO1xuICB0aGlzLnVwZGF0ZVNjcm9sbGVyKCk7XG4gIC8vIGFycmF5IG9mIHNjcm9sbCBwb3NpdGlvbnMgb2YgYXBwZW5kZWQgcGFnZXNcbiAgdGhpcy5zY3JvbGxQYWdlcyA9IFtcbiAgICAvLyBmaXJzdCBwYWdlXG4gICAge1xuICAgICAgdG9wOiAwLFxuICAgICAgcGF0aDogbG9jYXRpb24uaHJlZixcbiAgICAgIHRpdGxlOiBkb2N1bWVudC50aXRsZSxcbiAgICB9LFxuICBdO1xuICB0aGlzLnNjcm9sbFBhZ2UgPSB0aGlzLnNjcm9sbFBhZ2VzWzBdO1xuICAvLyBldmVudHNcbiAgdGhpcy5zY3JvbGxIaXN0b3J5SGFuZGxlciA9IHRoaXMub25TY3JvbGxIaXN0b3J5LmJpbmQoIHRoaXMgKTtcbiAgdGhpcy51bmxvYWRIYW5kbGVyID0gdGhpcy5vblVubG9hZC5iaW5kKCB0aGlzICk7XG4gIHRoaXMuc2Nyb2xsZXIuYWRkRXZlbnRMaXN0ZW5lciggJ3Njcm9sbCcsIHRoaXMuc2Nyb2xsSGlzdG9yeUhhbmRsZXIgKTtcbiAgdGhpcy5vbiggJ2FwcGVuZCcsIHRoaXMub25BcHBlbmRIaXN0b3J5ICk7XG4gIHRoaXMuYmluZEhpc3RvcnlBcHBlbmRFdmVudHMoIHRydWUgKTtcbn07XG5cbnByb3RvLmJpbmRIaXN0b3J5QXBwZW5kRXZlbnRzID0gZnVuY3Rpb24oIGlzQmluZCApIHtcbiAgbGV0IGFkZFJlbW92ZSA9IGlzQmluZCA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgdGhpcy5zY3JvbGxlclsgYWRkUmVtb3ZlIF0oICdzY3JvbGwnLCB0aGlzLnNjcm9sbEhpc3RvcnlIYW5kbGVyICk7XG4gIHdpbmRvd1sgYWRkUmVtb3ZlIF0oICd1bmxvYWQnLCB0aGlzLnVubG9hZEhhbmRsZXIgKTtcbn07XG5cbnByb3RvLmNyZWF0ZUhpc3RvcnlQYWdlTG9hZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm9uKCAnbG9hZCcsIHRoaXMub25QYWdlTG9hZEhpc3RvcnkgKTtcbn07XG5cbkluZmluaXRlU2Nyb2xsLmRlc3Ryb3kuaGlzdG9yeSA9XG5wcm90by5kZXN0cm95SGlzdG9yeSA9IGZ1bmN0aW9uKCkge1xuICBsZXQgaXNIaXN0b3J5QXBwZW5kID0gdGhpcy5vcHRpb25zLmhpc3RvcnkgJiYgdGhpcy5vcHRpb25zLmFwcGVuZDtcbiAgaWYgKCBpc0hpc3RvcnlBcHBlbmQgKSB7XG4gICAgdGhpcy5iaW5kSGlzdG9yeUFwcGVuZEV2ZW50cyggZmFsc2UgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0gYXBwZW5kIGhpc3RvcnkgLS0tLS0gLy9cblxucHJvdG8ub25BcHBlbmRIaXN0b3J5ID0gZnVuY3Rpb24oIHJlc3BvbnNlLCBwYXRoLCBpdGVtcyApIHtcbiAgLy8gZG8gbm90IHByb2NlZWQgaWYgbm8gaXRlbXMuICM3NzlcbiAgaWYgKCAhaXRlbXMgfHwgIWl0ZW1zLmxlbmd0aCApIHJldHVybjtcblxuICBsZXQgZmlyc3RJdGVtID0gaXRlbXNbMF07XG4gIGxldCBlbGVtU2Nyb2xsWSA9IHRoaXMuZ2V0RWxlbWVudFNjcm9sbFkoIGZpcnN0SXRlbSApO1xuICAvLyByZXNvbHZlIHBhdGhcbiAgbGluay5ocmVmID0gcGF0aDtcbiAgLy8gYWRkIHBhZ2UgZGF0YSB0byBoYXNoXG4gIHRoaXMuc2Nyb2xsUGFnZXMucHVzaCh7XG4gICAgdG9wOiBlbGVtU2Nyb2xsWSxcbiAgICBwYXRoOiBsaW5rLmhyZWYsXG4gICAgdGl0bGU6IHJlc3BvbnNlLnRpdGxlLFxuICB9KTtcbn07XG5cbnByb3RvLmdldEVsZW1lbnRTY3JvbGxZID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIGlmICggdGhpcy5vcHRpb25zLmVsZW1lbnRTY3JvbGwgKSB7XG4gICAgcmV0dXJuIGVsZW0ub2Zmc2V0VG9wIC0gdGhpcy50b3A7XG4gIH0gZWxzZSB7XG4gICAgbGV0IHJlY3QgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHJldHVybiByZWN0LnRvcCArIHdpbmRvdy5zY3JvbGxZO1xuICB9XG59O1xuXG5wcm90by5vblNjcm9sbEhpc3RvcnkgPSBmdW5jdGlvbigpIHtcbiAgLy8gY3ljbGUgdGhyb3VnaCBwb3NpdGlvbnMsIGZpbmQgYmlnZ2VzdCB3aXRob3V0IGdvaW5nIG92ZXJcbiAgbGV0IHNjcm9sbFBhZ2UgPSB0aGlzLmdldENsb3Nlc3RTY3JvbGxQYWdlKCk7XG4gIC8vIHNldCBoaXN0b3J5IGlmIGNoYW5nZWRcbiAgaWYgKCBzY3JvbGxQYWdlICE9IHRoaXMuc2Nyb2xsUGFnZSApIHtcbiAgICB0aGlzLnNjcm9sbFBhZ2UgPSBzY3JvbGxQYWdlO1xuICAgIHRoaXMuc2V0SGlzdG9yeSggc2Nyb2xsUGFnZS50aXRsZSwgc2Nyb2xsUGFnZS5wYXRoICk7XG4gIH1cbn07XG5cbnV0aWxzLmRlYm91bmNlTWV0aG9kKCBJbmZpbml0ZVNjcm9sbCwgJ29uU2Nyb2xsSGlzdG9yeScsIDE1MCApO1xuXG5wcm90by5nZXRDbG9zZXN0U2Nyb2xsUGFnZSA9IGZ1bmN0aW9uKCkge1xuICBsZXQgc2Nyb2xsVmlld1k7XG4gIGlmICggdGhpcy5vcHRpb25zLmVsZW1lbnRTY3JvbGwgKSB7XG4gICAgc2Nyb2xsVmlld1kgPSB0aGlzLnNjcm9sbGVyLnNjcm9sbFRvcCArIHRoaXMuc2Nyb2xsZXIuY2xpZW50SGVpZ2h0IC8gMjtcbiAgfSBlbHNlIHtcbiAgICBzY3JvbGxWaWV3WSA9IHdpbmRvdy5zY3JvbGxZICsgdGhpcy53aW5kb3dIZWlnaHQgLyAyO1xuICB9XG5cbiAgbGV0IHNjcm9sbFBhZ2U7XG4gIGZvciAoIGxldCBwYWdlIG9mIHRoaXMuc2Nyb2xsUGFnZXMgKSB7XG4gICAgaWYgKCBwYWdlLnRvcCA+PSBzY3JvbGxWaWV3WSApIGJyZWFrO1xuXG4gICAgc2Nyb2xsUGFnZSA9IHBhZ2U7XG4gIH1cbiAgcmV0dXJuIHNjcm9sbFBhZ2U7XG59O1xuXG5wcm90by5zZXRIaXN0b3J5ID0gZnVuY3Rpb24oIHRpdGxlLCBwYXRoICkge1xuICBsZXQgb3B0SGlzdG9yeSA9IHRoaXMub3B0aW9ucy5oaXN0b3J5O1xuICBsZXQgaGlzdG9yeU1ldGhvZCA9IG9wdEhpc3RvcnkgJiYgaGlzdG9yeVsgb3B0SGlzdG9yeSArICdTdGF0ZScgXTtcbiAgaWYgKCAhaGlzdG9yeU1ldGhvZCApIHJldHVybjtcblxuICBoaXN0b3J5WyBvcHRIaXN0b3J5ICsgJ1N0YXRlJyBdKCBudWxsLCB0aXRsZSwgcGF0aCApO1xuICBpZiAoIHRoaXMub3B0aW9ucy5oaXN0b3J5VGl0bGUgKSBkb2N1bWVudC50aXRsZSA9IHRpdGxlO1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdoaXN0b3J5JywgbnVsbCwgWyB0aXRsZSwgcGF0aCBdICk7XG59O1xuXG4vLyBzY3JvbGwgdG8gdG9wIHRvIHByZXZlbnQgaW5pdGlhbCBzY3JvbGwtcmVzZXQgYWZ0ZXIgcGFnZSByZWZyZXNoXG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTg2MzM5MTUvMTgyMTgzXG5wcm90by5vblVubG9hZCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIHRoaXMuc2Nyb2xsUGFnZS50b3AgPT09IDAgKSByZXR1cm47XG5cbiAgLy8gY2FsY3VsYXRlIHdoZXJlIHNjcm9sbCBwb3NpdGlvbiB3b3VsZCBiZSBvbiByZWZyZXNoXG4gIGxldCBzY3JvbGxZID0gd2luZG93LnNjcm9sbFkgLSB0aGlzLnNjcm9sbFBhZ2UudG9wICsgdGhpcy50b3A7XG4gIC8vIGRpc2FibGUgc2Nyb2xsIGV2ZW50IGJlZm9yZSBzZXR0aW5nIHNjcm9sbCAjNjc5XG4gIHRoaXMuZGVzdHJveUhpc3RvcnkoKTtcbiAgc2Nyb2xsVG8oIDAsIHNjcm9sbFkgKTtcbn07XG5cbi8vIC0tLS0tIGxvYWQgaGlzdG9yeSAtLS0tLSAvL1xuXG4vLyB1cGRhdGUgVVJMXG5wcm90by5vblBhZ2VMb2FkSGlzdG9yeSA9IGZ1bmN0aW9uKCByZXNwb25zZSwgcGF0aCApIHtcbiAgdGhpcy5zZXRIaXN0b3J5KCByZXNwb25zZS50aXRsZSwgcGF0aCApO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnJldHVybiBJbmZpbml0ZVNjcm9sbDtcblxufSApICk7XG4iLCIvKiFcbiAqIEluZmluaXRlIFNjcm9sbCB2NC4wLjFcbiAqIEF1dG9tYXRpY2FsbHkgYWRkIG5leHQgcGFnZVxuICpcbiAqIExpY2Vuc2VkIEdQTHYzIGZvciBvcGVuIHNvdXJjZSB1c2VcbiAqIG9yIEluZmluaXRlIFNjcm9sbCBDb21tZXJjaWFsIExpY2Vuc2UgZm9yIGNvbW1lcmNpYWwgdXNlXG4gKlxuICogaHR0cHM6Ly9pbmZpbml0ZS1zY3JvbGwuY29tXG4gKiBDb3B5cmlnaHQgMjAxOC0yMDIwIE1ldGFmaXp6eVxuICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgcmVxdWlyZSgnLi9jb3JlJyksXG4gICAgICAgIHJlcXVpcmUoJy4vcGFnZS1sb2FkJyksXG4gICAgICAgIHJlcXVpcmUoJy4vc2Nyb2xsLXdhdGNoJyksXG4gICAgICAgIHJlcXVpcmUoJy4vaGlzdG9yeScpLFxuICAgICAgICByZXF1aXJlKCcuL2J1dHRvbicpLFxuICAgICAgICByZXF1aXJlKCcuL3N0YXR1cycpLFxuICAgICk7XG4gIH1cblxufSApKCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIEluZmluaXRlU2Nyb2xsICkge1xuICByZXR1cm4gSW5maW5pdGVTY3JvbGw7XG59ICk7XG4iLCIvLyBwYWdlLWxvYWRcbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICByZXF1aXJlKCcuL2NvcmUnKSxcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICB3aW5kb3cuSW5maW5pdGVTY3JvbGwsXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgSW5maW5pdGVTY3JvbGwgKSB7XG5cbmxldCBwcm90byA9IEluZmluaXRlU2Nyb2xsLnByb3RvdHlwZTtcblxuT2JqZWN0LmFzc2lnbiggSW5maW5pdGVTY3JvbGwuZGVmYXVsdHMsIHtcbiAgLy8gYXBwZW5kOiBmYWxzZSxcbiAgbG9hZE9uU2Nyb2xsOiB0cnVlLFxuICBjaGVja0xhc3RQYWdlOiB0cnVlLFxuICByZXNwb25zZUJvZHk6ICd0ZXh0JyxcbiAgZG9tUGFyc2VSZXNwb25zZTogdHJ1ZSxcbiAgLy8gcHJlZmlsbDogZmFsc2UsXG4gIC8vIG91dGxheWVyOiBudWxsLFxufSApO1xuXG5JbmZpbml0ZVNjcm9sbC5jcmVhdGUucGFnZUxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jYW5Mb2FkID0gdHJ1ZTtcbiAgdGhpcy5vbiggJ3Njcm9sbFRocmVzaG9sZCcsIHRoaXMub25TY3JvbGxUaHJlc2hvbGRMb2FkICk7XG4gIHRoaXMub24oICdsb2FkJywgdGhpcy5jaGVja0xhc3RQYWdlICk7XG4gIGlmICggdGhpcy5vcHRpb25zLm91dGxheWVyICkge1xuICAgIHRoaXMub24oICdhcHBlbmQnLCB0aGlzLm9uQXBwZW5kT3V0bGF5ZXIgKTtcbiAgfVxufTtcblxucHJvdG8ub25TY3JvbGxUaHJlc2hvbGRMb2FkID0gZnVuY3Rpb24oKSB7XG4gIGlmICggdGhpcy5vcHRpb25zLmxvYWRPblNjcm9sbCApIHRoaXMubG9hZE5leHRQYWdlKCk7XG59O1xuXG5sZXQgZG9tUGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuXG5wcm90by5sb2FkTmV4dFBhZ2UgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCB0aGlzLmlzTG9hZGluZyB8fCAhdGhpcy5jYW5Mb2FkICkgcmV0dXJuO1xuXG4gIGxldCB7IHJlc3BvbnNlQm9keSwgZG9tUGFyc2VSZXNwb25zZSwgZmV0Y2hPcHRpb25zIH0gPSB0aGlzLm9wdGlvbnM7XG4gIGxldCBwYXRoID0gdGhpcy5nZXRBYnNvbHV0ZVBhdGgoKTtcbiAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xuICBpZiAoIHR5cGVvZiBmZXRjaE9wdGlvbnMgPT0gJ2Z1bmN0aW9uJyApIGZldGNoT3B0aW9ucyA9IGZldGNoT3B0aW9ucygpO1xuXG4gIGxldCBmZXRjaFByb21pc2UgPSBmZXRjaCggcGF0aCwgZmV0Y2hPcHRpb25zIClcbiAgICAudGhlbiggKCByZXNwb25zZSApID0+IHtcbiAgICAgIGlmICggIXJlc3BvbnNlLm9rICkge1xuICAgICAgICBsZXQgZXJyb3IgPSBuZXcgRXJyb3IoIHJlc3BvbnNlLnN0YXR1c1RleHQgKTtcbiAgICAgICAgdGhpcy5vblBhZ2VFcnJvciggZXJyb3IsIHBhdGgsIHJlc3BvbnNlICk7XG4gICAgICAgIHJldHVybiB7IHJlc3BvbnNlIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXNwb25zZVsgcmVzcG9uc2VCb2R5IF0oKS50aGVuKCAoIGJvZHkgKSA9PiB7XG4gICAgICAgIGxldCBjYW5Eb21QYXJzZSA9IHJlc3BvbnNlQm9keSA9PSAndGV4dCcgJiYgZG9tUGFyc2VSZXNwb25zZTtcbiAgICAgICAgaWYgKCBjYW5Eb21QYXJzZSApIHtcbiAgICAgICAgICBib2R5ID0gZG9tUGFyc2VyLnBhcnNlRnJvbVN0cmluZyggYm9keSwgJ3RleHQvaHRtbCcgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIHJlc3BvbnNlLnN0YXR1cyA9PSAyMDQgKSB7XG4gICAgICAgICAgdGhpcy5sYXN0UGFnZVJlYWNoZWQoIGJvZHksIHBhdGggKTtcbiAgICAgICAgICByZXR1cm4geyBib2R5LCByZXNwb25zZSB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLm9uUGFnZUxvYWQoIGJvZHksIHBhdGgsIHJlc3BvbnNlICk7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICB9IClcbiAgICAuY2F0Y2goICggZXJyb3IgKSA9PiB7XG4gICAgICB0aGlzLm9uUGFnZUVycm9yKCBlcnJvciwgcGF0aCApO1xuICAgIH0gKTtcblxuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdyZXF1ZXN0JywgbnVsbCwgWyBwYXRoLCBmZXRjaFByb21pc2UgXSApO1xuXG4gIHJldHVybiBmZXRjaFByb21pc2U7XG59O1xuXG5wcm90by5vblBhZ2VMb2FkID0gZnVuY3Rpb24oIGJvZHksIHBhdGgsIHJlc3BvbnNlICkge1xuICAvLyBkb25lIGxvYWRpbmcgaWYgbm90IGFwcGVuZGluZ1xuICBpZiAoICF0aGlzLm9wdGlvbnMuYXBwZW5kICkge1xuICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gIH1cbiAgdGhpcy5wYWdlSW5kZXgrKztcbiAgdGhpcy5sb2FkQ291bnQrKztcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAnbG9hZCcsIG51bGwsIFsgYm9keSwgcGF0aCwgcmVzcG9uc2UgXSApO1xuICByZXR1cm4gdGhpcy5hcHBlbmROZXh0UGFnZSggYm9keSwgcGF0aCwgcmVzcG9uc2UgKTtcbn07XG5cbnByb3RvLmFwcGVuZE5leHRQYWdlID0gZnVuY3Rpb24oIGJvZHksIHBhdGgsIHJlc3BvbnNlICkge1xuICBsZXQgeyBhcHBlbmQsIHJlc3BvbnNlQm9keSwgZG9tUGFyc2VSZXNwb25zZSB9ID0gdGhpcy5vcHRpb25zO1xuICAvLyBkbyBub3QgYXBwZW5kIGpzb25cbiAgbGV0IGlzRG9jdW1lbnQgPSByZXNwb25zZUJvZHkgPT0gJ3RleHQnICYmIGRvbVBhcnNlUmVzcG9uc2U7XG4gIGlmICggIWlzRG9jdW1lbnQgfHwgIWFwcGVuZCApIHJldHVybiB7IGJvZHksIHJlc3BvbnNlIH07XG5cbiAgbGV0IGl0ZW1zID0gYm9keS5xdWVyeVNlbGVjdG9yQWxsKCBhcHBlbmQgKTtcbiAgbGV0IHByb21pc2VWYWx1ZSA9IHsgYm9keSwgcmVzcG9uc2UsIGl0ZW1zIH07XG4gIC8vIGxhc3QgcGFnZSBoaXQgaWYgbm8gaXRlbXMuICM4NDBcbiAgaWYgKCAhaXRlbXMgfHwgIWl0ZW1zLmxlbmd0aCApIHtcbiAgICB0aGlzLmxhc3RQYWdlUmVhY2hlZCggYm9keSwgcGF0aCApO1xuICAgIHJldHVybiBwcm9taXNlVmFsdWU7XG4gIH1cblxuICBsZXQgZnJhZ21lbnQgPSBnZXRJdGVtc0ZyYWdtZW50KCBpdGVtcyApO1xuICBsZXQgYXBwZW5kUmVhZHkgPSAoKSA9PiB7XG4gICAgdGhpcy5hcHBlbmRJdGVtcyggaXRlbXMsIGZyYWdtZW50ICk7XG4gICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoICdhcHBlbmQnLCBudWxsLCBbIGJvZHksIHBhdGgsIGl0ZW1zLCByZXNwb25zZSBdICk7XG4gICAgcmV0dXJuIHByb21pc2VWYWx1ZTtcbiAgfTtcblxuICAvLyBUT0RPIGFkZCBob29rIGZvciBvcHRpb24gdG8gdHJpZ2dlciBhcHBlbmRSZWFkeVxuICBpZiAoIHRoaXMub3B0aW9ucy5vdXRsYXllciApIHtcbiAgICByZXR1cm4gdGhpcy5hcHBlbmRPdXRsYXllckl0ZW1zKCBmcmFnbWVudCwgYXBwZW5kUmVhZHkgKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYXBwZW5kUmVhZHkoKTtcbiAgfVxufTtcblxucHJvdG8uYXBwZW5kSXRlbXMgPSBmdW5jdGlvbiggaXRlbXMsIGZyYWdtZW50ICkge1xuICBpZiAoICFpdGVtcyB8fCAhaXRlbXMubGVuZ3RoICkgcmV0dXJuO1xuXG4gIC8vIGdldCBmcmFnbWVudCBpZiBub3QgcHJvdmlkZWRcbiAgZnJhZ21lbnQgPSBmcmFnbWVudCB8fCBnZXRJdGVtc0ZyYWdtZW50KCBpdGVtcyApO1xuICByZWZyZXNoU2NyaXB0cyggZnJhZ21lbnQgKTtcbiAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKCBmcmFnbWVudCApO1xufTtcblxuZnVuY3Rpb24gZ2V0SXRlbXNGcmFnbWVudCggaXRlbXMgKSB7XG4gIC8vIGFkZCBpdGVtcyB0byBmcmFnbWVudFxuICBsZXQgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIGlmICggaXRlbXMgKSBmcmFnbWVudC5hcHBlbmQoIC4uLml0ZW1zICk7XG4gIHJldHVybiBmcmFnbWVudDtcbn1cblxuLy8gcmVwbGFjZSA8c2NyaXB0PnMgd2l0aCBjb3BpZXMgc28gdGhleSBsb2FkXG4vLyA8c2NyaXB0PnMgYWRkZWQgYnkgSW5maW5pdGVTY3JvbGwgd2lsbCBub3QgbG9hZFxuLy8gc2ltaWxhciB0byBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy82MTA5OTVcbmZ1bmN0aW9uIHJlZnJlc2hTY3JpcHRzKCBmcmFnbWVudCApIHtcbiAgbGV0IHNjcmlwdHMgPSBmcmFnbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHQnKTtcbiAgZm9yICggbGV0IHNjcmlwdCBvZiBzY3JpcHRzICkge1xuICAgIGxldCBmcmVzaFNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgIC8vIGNvcHkgYXR0cmlidXRlc1xuICAgIGxldCBhdHRycyA9IHNjcmlwdC5hdHRyaWJ1dGVzO1xuICAgIGZvciAoIGxldCBhdHRyIG9mIGF0dHJzICkge1xuICAgICAgZnJlc2hTY3JpcHQuc2V0QXR0cmlidXRlKCBhdHRyLm5hbWUsIGF0dHIudmFsdWUgKTtcbiAgICB9XG4gICAgLy8gY29weSBpbm5lciBzY3JpcHQgY29kZS4gIzcxOCwgIzc4MlxuICAgIGZyZXNoU2NyaXB0LmlubmVySFRNTCA9IHNjcmlwdC5pbm5lckhUTUw7XG4gICAgc2NyaXB0LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKCBmcmVzaFNjcmlwdCwgc2NyaXB0ICk7XG4gIH1cbn1cblxuLy8gLS0tLS0gb3V0bGF5ZXIgLS0tLS0gLy9cblxucHJvdG8uYXBwZW5kT3V0bGF5ZXJJdGVtcyA9IGZ1bmN0aW9uKCBmcmFnbWVudCwgYXBwZW5kUmVhZHkgKSB7XG4gIGxldCBpbWFnZXNMb2FkZWQgPSBJbmZpbml0ZVNjcm9sbC5pbWFnZXNMb2FkZWQgfHwgd2luZG93LmltYWdlc0xvYWRlZDtcbiAgaWYgKCAhaW1hZ2VzTG9hZGVkICkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1tJbmZpbml0ZVNjcm9sbF0gaW1hZ2VzTG9hZGVkIHJlcXVpcmVkIGZvciBvdXRsYXllciBvcHRpb24nKTtcbiAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBhcHBlbmQgb25jZSBpbWFnZXMgbG9hZGVkXG4gIHJldHVybiBuZXcgUHJvbWlzZSggZnVuY3Rpb24oIHJlc29sdmUgKSB7XG4gICAgaW1hZ2VzTG9hZGVkKCBmcmFnbWVudCwgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgYm9keVJlc3BvbnNlID0gYXBwZW5kUmVhZHkoKTtcbiAgICAgIHJlc29sdmUoIGJvZHlSZXNwb25zZSApO1xuICAgIH0gKTtcbiAgfSApO1xufTtcblxucHJvdG8ub25BcHBlbmRPdXRsYXllciA9IGZ1bmN0aW9uKCByZXNwb25zZSwgcGF0aCwgaXRlbXMgKSB7XG4gIHRoaXMub3B0aW9ucy5vdXRsYXllci5hcHBlbmRlZCggaXRlbXMgKTtcbn07XG5cbi8vIC0tLS0tIGNoZWNrTGFzdFBhZ2UgLS0tLS0gLy9cblxuLy8gY2hlY2sgcmVzcG9uc2UgZm9yIG5leHQgZWxlbWVudFxucHJvdG8uY2hlY2tMYXN0UGFnZSA9IGZ1bmN0aW9uKCBib2R5LCBwYXRoICkge1xuICBsZXQgeyBjaGVja0xhc3RQYWdlLCBwYXRoOiBwYXRoT3B0IH0gPSB0aGlzLm9wdGlvbnM7XG4gIGlmICggIWNoZWNrTGFzdFBhZ2UgKSByZXR1cm47XG5cbiAgLy8gaWYgcGF0aCBpcyBmdW5jdGlvbiwgY2hlY2sgaWYgbmV4dCBwYXRoIGlzIHRydXRoeVxuICBpZiAoIHR5cGVvZiBwYXRoT3B0ID09ICdmdW5jdGlvbicgKSB7XG4gICAgbGV0IG5leHRQYXRoID0gdGhpcy5nZXRQYXRoKCk7XG4gICAgaWYgKCAhbmV4dFBhdGggKSB7XG4gICAgICB0aGlzLmxhc3RQYWdlUmVhY2hlZCggYm9keSwgcGF0aCApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICAvLyBnZXQgc2VsZWN0b3IgZnJvbSBjaGVja0xhc3RQYWdlIG9yIHBhdGggb3B0aW9uXG4gIGxldCBzZWxlY3RvcjtcbiAgaWYgKCB0eXBlb2YgY2hlY2tMYXN0UGFnZSA9PSAnc3RyaW5nJyApIHtcbiAgICBzZWxlY3RvciA9IGNoZWNrTGFzdFBhZ2U7XG4gIH0gZWxzZSBpZiAoIHRoaXMuaXNQYXRoU2VsZWN0b3IgKSB7XG4gICAgLy8gcGF0aCBvcHRpb24gaXMgc2VsZWN0b3Igc3RyaW5nXG4gICAgc2VsZWN0b3IgPSBwYXRoT3B0O1xuICB9XG4gIC8vIGNoZWNrIGxhc3QgcGFnZSBmb3Igc2VsZWN0b3JcbiAgLy8gYmFpbCBpZiBubyBzZWxlY3RvciBvciBub3QgZG9jdW1lbnQgcmVzcG9uc2VcbiAgaWYgKCAhc2VsZWN0b3IgfHwgIWJvZHkucXVlcnlTZWxlY3RvciApIHJldHVybjtcblxuICAvLyBjaGVjayBpZiByZXNwb25zZSBoYXMgc2VsZWN0b3JcbiAgbGV0IG5leHRFbGVtID0gYm9keS5xdWVyeVNlbGVjdG9yKCBzZWxlY3RvciApO1xuICBpZiAoICFuZXh0RWxlbSApIHRoaXMubGFzdFBhZ2VSZWFjaGVkKCBib2R5LCBwYXRoICk7XG59O1xuXG5wcm90by5sYXN0UGFnZVJlYWNoZWQgPSBmdW5jdGlvbiggYm9keSwgcGF0aCApIHtcbiAgdGhpcy5jYW5Mb2FkID0gZmFsc2U7XG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ2xhc3QnLCBudWxsLCBbIGJvZHksIHBhdGggXSApO1xufTtcblxuLy8gLS0tLS0gZXJyb3IgLS0tLS0gLy9cblxucHJvdG8ub25QYWdlRXJyb3IgPSBmdW5jdGlvbiggZXJyb3IsIHBhdGgsIHJlc3BvbnNlICkge1xuICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xuICB0aGlzLmNhbkxvYWQgPSBmYWxzZTtcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAnZXJyb3InLCBudWxsLCBbIGVycm9yLCBwYXRoLCByZXNwb25zZSBdICk7XG4gIHJldHVybiBlcnJvcjtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHByZWZpbGwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuSW5maW5pdGVTY3JvbGwuY3JlYXRlLnByZWZpbGwgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGhpcy5vcHRpb25zLnByZWZpbGwgKSByZXR1cm47XG5cbiAgbGV0IGFwcGVuZCA9IHRoaXMub3B0aW9ucy5hcHBlbmQ7XG4gIGlmICggIWFwcGVuZCApIHtcbiAgICBjb25zb2xlLmVycm9yKGBhcHBlbmQgb3B0aW9uIHJlcXVpcmVkIGZvciBwcmVmaWxsLiBTZXQgYXMgOiR7YXBwZW5kfWApO1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnVwZGF0ZU1lYXN1cmVtZW50cygpO1xuICB0aGlzLnVwZGF0ZVNjcm9sbGVyKCk7XG4gIHRoaXMuaXNQcmVmaWxsaW5nID0gdHJ1ZTtcbiAgdGhpcy5vbiggJ2FwcGVuZCcsIHRoaXMucHJlZmlsbCApO1xuICB0aGlzLm9uY2UoICdlcnJvcicsIHRoaXMuc3RvcFByZWZpbGwgKTtcbiAgdGhpcy5vbmNlKCAnbGFzdCcsIHRoaXMuc3RvcFByZWZpbGwgKTtcbiAgdGhpcy5wcmVmaWxsKCk7XG59O1xuXG5wcm90by5wcmVmaWxsID0gZnVuY3Rpb24oKSB7XG4gIGxldCBkaXN0YW5jZSA9IHRoaXMuZ2V0UHJlZmlsbERpc3RhbmNlKCk7XG4gIHRoaXMuaXNQcmVmaWxsaW5nID0gZGlzdGFuY2UgPj0gMDtcbiAgaWYgKCB0aGlzLmlzUHJlZmlsbGluZyApIHtcbiAgICB0aGlzLmxvZygncHJlZmlsbCcpO1xuICAgIHRoaXMubG9hZE5leHRQYWdlKCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5zdG9wUHJlZmlsbCgpO1xuICB9XG59O1xuXG5wcm90by5nZXRQcmVmaWxsRGlzdGFuY2UgPSBmdW5jdGlvbigpIHtcbiAgLy8gZWxlbWVudCBzY3JvbGxcbiAgaWYgKCB0aGlzLm9wdGlvbnMuZWxlbWVudFNjcm9sbCApIHtcbiAgICByZXR1cm4gdGhpcy5zY3JvbGxlci5jbGllbnRIZWlnaHQgLSB0aGlzLnNjcm9sbGVyLnNjcm9sbEhlaWdodDtcbiAgfVxuICAvLyB3aW5kb3dcbiAgcmV0dXJuIHRoaXMud2luZG93SGVpZ2h0IC0gdGhpcy5lbGVtZW50LmNsaWVudEhlaWdodDtcbn07XG5cbnByb3RvLnN0b3BQcmVmaWxsID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMubG9nKCdzdG9wUHJlZmlsbCcpO1xuICB0aGlzLm9mZiggJ2FwcGVuZCcsIHRoaXMucHJlZmlsbCApO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnJldHVybiBJbmZpbml0ZVNjcm9sbDtcblxufSApICk7XG4iLCIvLyBzY3JvbGwtd2F0Y2hcbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICByZXF1aXJlKCcuL2NvcmUnKSxcbiAgICAgICAgcmVxdWlyZSgnZml6enktdWktdXRpbHMnKSxcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICB3aW5kb3cuSW5maW5pdGVTY3JvbGwsXG4gICAgICAgIHdpbmRvdy5maXp6eVVJVXRpbHMsXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgSW5maW5pdGVTY3JvbGwsIHV0aWxzICkge1xuXG5sZXQgcHJvdG8gPSBJbmZpbml0ZVNjcm9sbC5wcm90b3R5cGU7XG5cbi8vIGRlZmF1bHQgb3B0aW9uc1xuT2JqZWN0LmFzc2lnbiggSW5maW5pdGVTY3JvbGwuZGVmYXVsdHMsIHtcbiAgc2Nyb2xsVGhyZXNob2xkOiA0MDAsXG4gIC8vIGVsZW1lbnRTY3JvbGw6IG51bGwsXG59ICk7XG5cbkluZmluaXRlU2Nyb2xsLmNyZWF0ZS5zY3JvbGxXYXRjaCA9IGZ1bmN0aW9uKCkge1xuICAvLyBldmVudHNcbiAgdGhpcy5wYWdlU2Nyb2xsSGFuZGxlciA9IHRoaXMub25QYWdlU2Nyb2xsLmJpbmQoIHRoaXMgKTtcbiAgdGhpcy5yZXNpemVIYW5kbGVyID0gdGhpcy5vblJlc2l6ZS5iaW5kKCB0aGlzICk7XG5cbiAgbGV0IHNjcm9sbFRocmVzaG9sZCA9IHRoaXMub3B0aW9ucy5zY3JvbGxUaHJlc2hvbGQ7XG4gIGxldCBpc0VuYWJsZSA9IHNjcm9sbFRocmVzaG9sZCB8fCBzY3JvbGxUaHJlc2hvbGQgPT09IDA7XG4gIGlmICggaXNFbmFibGUgKSB0aGlzLmVuYWJsZVNjcm9sbFdhdGNoKCk7XG59O1xuXG5JbmZpbml0ZVNjcm9sbC5kZXN0cm95LnNjcm9sbFdhdGNoID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZGlzYWJsZVNjcm9sbFdhdGNoKCk7XG59O1xuXG5wcm90by5lbmFibGVTY3JvbGxXYXRjaCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIHRoaXMuaXNTY3JvbGxXYXRjaGluZyApIHJldHVybjtcblxuICB0aGlzLmlzU2Nyb2xsV2F0Y2hpbmcgPSB0cnVlO1xuICB0aGlzLnVwZGF0ZU1lYXN1cmVtZW50cygpO1xuICB0aGlzLnVwZGF0ZVNjcm9sbGVyKCk7XG4gIC8vIFRPRE8gZGlzYWJsZSBhZnRlciBlcnJvcj9cbiAgdGhpcy5vbiggJ2xhc3QnLCB0aGlzLmRpc2FibGVTY3JvbGxXYXRjaCApO1xuICB0aGlzLmJpbmRTY3JvbGxXYXRjaEV2ZW50cyggdHJ1ZSApO1xufTtcblxucHJvdG8uZGlzYWJsZVNjcm9sbFdhdGNoID0gZnVuY3Rpb24oKSB7XG4gIGlmICggIXRoaXMuaXNTY3JvbGxXYXRjaGluZyApIHJldHVybjtcblxuICB0aGlzLmJpbmRTY3JvbGxXYXRjaEV2ZW50cyggZmFsc2UgKTtcbiAgZGVsZXRlIHRoaXMuaXNTY3JvbGxXYXRjaGluZztcbn07XG5cbnByb3RvLmJpbmRTY3JvbGxXYXRjaEV2ZW50cyA9IGZ1bmN0aW9uKCBpc0JpbmQgKSB7XG4gIGxldCBhZGRSZW1vdmUgPSBpc0JpbmQgPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gIHRoaXMuc2Nyb2xsZXJbIGFkZFJlbW92ZSBdKCAnc2Nyb2xsJywgdGhpcy5wYWdlU2Nyb2xsSGFuZGxlciApO1xuICB3aW5kb3dbIGFkZFJlbW92ZSBdKCAncmVzaXplJywgdGhpcy5yZXNpemVIYW5kbGVyICk7XG59O1xuXG5wcm90by5vblBhZ2VTY3JvbGwgPSBJbmZpbml0ZVNjcm9sbC50aHJvdHRsZSggZnVuY3Rpb24oKSB7XG4gIGxldCBkaXN0YW5jZSA9IHRoaXMuZ2V0Qm90dG9tRGlzdGFuY2UoKTtcbiAgaWYgKCBkaXN0YW5jZSA8PSB0aGlzLm9wdGlvbnMuc2Nyb2xsVGhyZXNob2xkICkge1xuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCgnc2Nyb2xsVGhyZXNob2xkJyk7XG4gIH1cbn0gKTtcblxucHJvdG8uZ2V0Qm90dG9tRGlzdGFuY2UgPSBmdW5jdGlvbigpIHtcbiAgbGV0IGJvdHRvbSwgc2Nyb2xsWTtcbiAgaWYgKCB0aGlzLm9wdGlvbnMuZWxlbWVudFNjcm9sbCApIHtcbiAgICBib3R0b20gPSB0aGlzLnNjcm9sbGVyLnNjcm9sbEhlaWdodDtcbiAgICBzY3JvbGxZID0gdGhpcy5zY3JvbGxlci5zY3JvbGxUb3AgKyB0aGlzLnNjcm9sbGVyLmNsaWVudEhlaWdodDtcbiAgfSBlbHNlIHtcbiAgICBib3R0b20gPSB0aGlzLnRvcCArIHRoaXMuZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgc2Nyb2xsWSA9IHdpbmRvdy5zY3JvbGxZICsgdGhpcy53aW5kb3dIZWlnaHQ7XG4gIH1cbiAgcmV0dXJuIGJvdHRvbSAtIHNjcm9sbFk7XG59O1xuXG5wcm90by5vblJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnVwZGF0ZU1lYXN1cmVtZW50cygpO1xufTtcblxudXRpbHMuZGVib3VuY2VNZXRob2QoIEluZmluaXRlU2Nyb2xsLCAnb25SZXNpemUnLCAxNTAgKTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnJldHVybiBJbmZpbml0ZVNjcm9sbDtcblxufSApICk7XG4iLCIvLyBzdGF0dXNcbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICByZXF1aXJlKCcuL2NvcmUnKSxcbiAgICAgICAgcmVxdWlyZSgnZml6enktdWktdXRpbHMnKSxcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICB3aW5kb3cuSW5maW5pdGVTY3JvbGwsXG4gICAgICAgIHdpbmRvdy5maXp6eVVJVXRpbHMsXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgSW5maW5pdGVTY3JvbGwsIHV0aWxzICkge1xuXG5sZXQgcHJvdG8gPSBJbmZpbml0ZVNjcm9sbC5wcm90b3R5cGU7XG5cbi8vIEluZmluaXRlU2Nyb2xsLmRlZmF1bHRzLnN0YXR1cyA9IG51bGw7XG5cbkluZmluaXRlU2Nyb2xsLmNyZWF0ZS5zdGF0dXMgPSBmdW5jdGlvbigpIHtcbiAgbGV0IHN0YXR1c0VsZW0gPSB1dGlscy5nZXRRdWVyeUVsZW1lbnQoIHRoaXMub3B0aW9ucy5zdGF0dXMgKTtcbiAgaWYgKCAhc3RhdHVzRWxlbSApIHJldHVybjtcblxuICAvLyBlbGVtZW50c1xuICB0aGlzLnN0YXR1c0VsZW1lbnQgPSBzdGF0dXNFbGVtO1xuICB0aGlzLnN0YXR1c0V2ZW50RWxlbWVudHMgPSB7XG4gICAgcmVxdWVzdDogc3RhdHVzRWxlbS5xdWVyeVNlbGVjdG9yKCcuaW5maW5pdGUtc2Nyb2xsLXJlcXVlc3QnKSxcbiAgICBlcnJvcjogc3RhdHVzRWxlbS5xdWVyeVNlbGVjdG9yKCcuaW5maW5pdGUtc2Nyb2xsLWVycm9yJyksXG4gICAgbGFzdDogc3RhdHVzRWxlbS5xdWVyeVNlbGVjdG9yKCcuaW5maW5pdGUtc2Nyb2xsLWxhc3QnKSxcbiAgfTtcbiAgLy8gZXZlbnRzXG4gIHRoaXMub24oICdyZXF1ZXN0JywgdGhpcy5zaG93UmVxdWVzdFN0YXR1cyApO1xuICB0aGlzLm9uKCAnZXJyb3InLCB0aGlzLnNob3dFcnJvclN0YXR1cyApO1xuICB0aGlzLm9uKCAnbGFzdCcsIHRoaXMuc2hvd0xhc3RTdGF0dXMgKTtcbiAgdGhpcy5iaW5kSGlkZVN0YXR1cygnb24nKTtcbn07XG5cbnByb3RvLmJpbmRIaWRlU3RhdHVzID0gZnVuY3Rpb24oIGJpbmRNZXRob2QgKSB7XG4gIGxldCBoaWRlRXZlbnQgPSB0aGlzLm9wdGlvbnMuYXBwZW5kID8gJ2FwcGVuZCcgOiAnbG9hZCc7XG4gIHRoaXNbIGJpbmRNZXRob2QgXSggaGlkZUV2ZW50LCB0aGlzLmhpZGVBbGxTdGF0dXMgKTtcbn07XG5cbnByb3RvLnNob3dSZXF1ZXN0U3RhdHVzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2hvd1N0YXR1cygncmVxdWVzdCcpO1xufTtcblxucHJvdG8uc2hvd0Vycm9yU3RhdHVzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2hvd1N0YXR1cygnZXJyb3InKTtcbn07XG5cbnByb3RvLnNob3dMYXN0U3RhdHVzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2hvd1N0YXR1cygnbGFzdCcpO1xuICAvLyBwcmV2ZW50IGxhc3QgdGhlbiBhcHBlbmQgZXZlbnQgcmFjZSBjb25kaXRpb24gZnJvbSBzaG93aW5nIGxhc3Qgc3RhdHVzICM3MDZcbiAgdGhpcy5iaW5kSGlkZVN0YXR1cygnb2ZmJyk7XG59O1xuXG5wcm90by5zaG93U3RhdHVzID0gZnVuY3Rpb24oIGV2ZW50TmFtZSApIHtcbiAgc2hvdyggdGhpcy5zdGF0dXNFbGVtZW50ICk7XG4gIHRoaXMuaGlkZVN0YXR1c0V2ZW50RWxlbWVudHMoKTtcbiAgbGV0IGV2ZW50RWxlbSA9IHRoaXMuc3RhdHVzRXZlbnRFbGVtZW50c1sgZXZlbnROYW1lIF07XG4gIHNob3coIGV2ZW50RWxlbSApO1xufTtcblxucHJvdG8uaGlkZUFsbFN0YXR1cyA9IGZ1bmN0aW9uKCkge1xuICBoaWRlKCB0aGlzLnN0YXR1c0VsZW1lbnQgKTtcbiAgdGhpcy5oaWRlU3RhdHVzRXZlbnRFbGVtZW50cygpO1xufTtcblxucHJvdG8uaGlkZVN0YXR1c0V2ZW50RWxlbWVudHMgPSBmdW5jdGlvbigpIHtcbiAgZm9yICggbGV0IHR5cGUgaW4gdGhpcy5zdGF0dXNFdmVudEVsZW1lbnRzICkge1xuICAgIGxldCBldmVudEVsZW0gPSB0aGlzLnN0YXR1c0V2ZW50RWxlbWVudHNbIHR5cGUgXTtcbiAgICBoaWRlKCBldmVudEVsZW0gKTtcbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmZ1bmN0aW9uIGhpZGUoIGVsZW0gKSB7XG4gIHNldERpc3BsYXkoIGVsZW0sICdub25lJyApO1xufVxuXG5mdW5jdGlvbiBzaG93KCBlbGVtICkge1xuICBzZXREaXNwbGF5KCBlbGVtLCAnYmxvY2snICk7XG59XG5cbmZ1bmN0aW9uIHNldERpc3BsYXkoIGVsZW0sIHZhbHVlICkge1xuICBpZiAoIGVsZW0gKSB7XG4gICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gdmFsdWU7XG4gIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnJldHVybiBJbmZpbml0ZVNjcm9sbDtcblxufSApICk7XG4iLCIoZnVuY3Rpb24od2luZG93LCBmYWN0b3J5KSB7XG5cdHZhciBsYXp5U2l6ZXMgPSBmYWN0b3J5KHdpbmRvdywgd2luZG93LmRvY3VtZW50LCBEYXRlKTtcblx0d2luZG93LmxhenlTaXplcyA9IGxhenlTaXplcztcblx0aWYodHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyl7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBsYXp5U2l6ZXM7XG5cdH1cbn0odHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyA/XG4gICAgICB3aW5kb3cgOiB7fSwgXG4vKipcbiAqIGltcG9ydChcIi4vdHlwZXMvZ2xvYmFsXCIpXG4gKiBAdHlwZWRlZiB7IGltcG9ydChcIi4vdHlwZXMvbGF6eXNpemVzLWNvbmZpZ1wiKS5MYXp5U2l6ZXNDb25maWdQYXJ0aWFsIH0gTGF6eVNpemVzQ29uZmlnUGFydGlhbFxuICovXG5mdW5jdGlvbiBsKHdpbmRvdywgZG9jdW1lbnQsIERhdGUpIHsgLy8gUGFzcyBpbiB0aGUgd2luZG93IERhdGUgZnVuY3Rpb24gYWxzbyBmb3IgU1NSIGJlY2F1c2UgdGhlIERhdGUgY2xhc3MgY2FuIGJlIGxvc3Rcblx0J3VzZSBzdHJpY3QnO1xuXHQvKmpzaGludCBlcW51bGw6dHJ1ZSAqL1xuXG5cdHZhciBsYXp5c2l6ZXMsXG5cdFx0LyoqXG5cdFx0ICogQHR5cGUgeyBMYXp5U2l6ZXNDb25maWdQYXJ0aWFsIH1cblx0XHQgKi9cblx0XHRsYXp5U2l6ZXNDZmc7XG5cblx0KGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHByb3A7XG5cblx0XHR2YXIgbGF6eVNpemVzRGVmYXVsdHMgPSB7XG5cdFx0XHRsYXp5Q2xhc3M6ICdsYXp5bG9hZCcsXG5cdFx0XHRsb2FkZWRDbGFzczogJ2xhenlsb2FkZWQnLFxuXHRcdFx0bG9hZGluZ0NsYXNzOiAnbGF6eWxvYWRpbmcnLFxuXHRcdFx0cHJlbG9hZENsYXNzOiAnbGF6eXByZWxvYWQnLFxuXHRcdFx0ZXJyb3JDbGFzczogJ2xhenllcnJvcicsXG5cdFx0XHQvL3N0cmljdENsYXNzOiAnbGF6eXN0cmljdCcsXG5cdFx0XHRhdXRvc2l6ZXNDbGFzczogJ2xhenlhdXRvc2l6ZXMnLFxuXHRcdFx0ZmFzdExvYWRlZENsYXNzOiAnbHMtaXMtY2FjaGVkJyxcblx0XHRcdGlmcmFtZUxvYWRNb2RlOiAwLFxuXHRcdFx0c3JjQXR0cjogJ2RhdGEtc3JjJyxcblx0XHRcdHNyY3NldEF0dHI6ICdkYXRhLXNyY3NldCcsXG5cdFx0XHRzaXplc0F0dHI6ICdkYXRhLXNpemVzJyxcblx0XHRcdC8vcHJlbG9hZEFmdGVyTG9hZDogZmFsc2UsXG5cdFx0XHRtaW5TaXplOiA0MCxcblx0XHRcdGN1c3RvbU1lZGlhOiB7fSxcblx0XHRcdGluaXQ6IHRydWUsXG5cdFx0XHRleHBGYWN0b3I6IDEuNSxcblx0XHRcdGhGYWM6IDAuOCxcblx0XHRcdGxvYWRNb2RlOiAyLFxuXHRcdFx0bG9hZEhpZGRlbjogdHJ1ZSxcblx0XHRcdHJpY1RpbWVvdXQ6IDAsXG5cdFx0XHR0aHJvdHRsZURlbGF5OiAxMjUsXG5cdFx0fTtcblxuXHRcdGxhenlTaXplc0NmZyA9IHdpbmRvdy5sYXp5U2l6ZXNDb25maWcgfHwgd2luZG93LmxhenlzaXplc0NvbmZpZyB8fCB7fTtcblxuXHRcdGZvcihwcm9wIGluIGxhenlTaXplc0RlZmF1bHRzKXtcblx0XHRcdGlmKCEocHJvcCBpbiBsYXp5U2l6ZXNDZmcpKXtcblx0XHRcdFx0bGF6eVNpemVzQ2ZnW3Byb3BdID0gbGF6eVNpemVzRGVmYXVsdHNbcHJvcF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9KSgpO1xuXG5cdGlmICghZG9jdW1lbnQgfHwgIWRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0aW5pdDogZnVuY3Rpb24gKCkge30sXG5cdFx0XHQvKipcblx0XHRcdCAqIEB0eXBlIHsgTGF6eVNpemVzQ29uZmlnUGFydGlhbCB9XG5cdFx0XHQgKi9cblx0XHRcdGNmZzogbGF6eVNpemVzQ2ZnLFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBAdHlwZSB7IHRydWUgfVxuXHRcdFx0ICovXG5cdFx0XHRub1N1cHBvcnQ6IHRydWUsXG5cdFx0fTtcblx0fVxuXG5cdHZhciBkb2NFbGVtID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG5cdHZhciBzdXBwb3J0UGljdHVyZSA9IHdpbmRvdy5IVE1MUGljdHVyZUVsZW1lbnQ7XG5cblx0dmFyIF9hZGRFdmVudExpc3RlbmVyID0gJ2FkZEV2ZW50TGlzdGVuZXInO1xuXG5cdHZhciBfZ2V0QXR0cmlidXRlID0gJ2dldEF0dHJpYnV0ZSc7XG5cblx0LyoqXG5cdCAqIFVwZGF0ZSB0byBiaW5kIHRvIHdpbmRvdyBiZWNhdXNlICd0aGlzJyBiZWNvbWVzIG51bGwgZHVyaW5nIFNTUlxuXHQgKiBidWlsZHMuXG5cdCAqL1xuXHR2YXIgYWRkRXZlbnRMaXN0ZW5lciA9IHdpbmRvd1tfYWRkRXZlbnRMaXN0ZW5lcl0uYmluZCh3aW5kb3cpO1xuXG5cdHZhciBzZXRUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQ7XG5cblx0dmFyIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgc2V0VGltZW91dDtcblxuXHR2YXIgcmVxdWVzdElkbGVDYWxsYmFjayA9IHdpbmRvdy5yZXF1ZXN0SWRsZUNhbGxiYWNrO1xuXG5cdHZhciByZWdQaWN0dXJlID0gL15waWN0dXJlJC9pO1xuXG5cdHZhciBsb2FkRXZlbnRzID0gWydsb2FkJywgJ2Vycm9yJywgJ2xhenlpbmNsdWRlZCcsICdfbGF6eWxvYWRlZCddO1xuXG5cdHZhciByZWdDbGFzc0NhY2hlID0ge307XG5cblx0dmFyIGZvckVhY2ggPSBBcnJheS5wcm90b3R5cGUuZm9yRWFjaDtcblxuXHQvKipcblx0ICogQHBhcmFtIGVsZSB7RWxlbWVudH1cblx0ICogQHBhcmFtIGNscyB7c3RyaW5nfVxuXHQgKi9cblx0dmFyIGhhc0NsYXNzID0gZnVuY3Rpb24oZWxlLCBjbHMpIHtcblx0XHRpZighcmVnQ2xhc3NDYWNoZVtjbHNdKXtcblx0XHRcdHJlZ0NsYXNzQ2FjaGVbY2xzXSA9IG5ldyBSZWdFeHAoJyhcXFxcc3xeKScrY2xzKycoXFxcXHN8JCknKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlZ0NsYXNzQ2FjaGVbY2xzXS50ZXN0KGVsZVtfZ2V0QXR0cmlidXRlXSgnY2xhc3MnKSB8fCAnJykgJiYgcmVnQ2xhc3NDYWNoZVtjbHNdO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBAcGFyYW0gZWxlIHtFbGVtZW50fVxuXHQgKiBAcGFyYW0gY2xzIHtzdHJpbmd9XG5cdCAqL1xuXHR2YXIgYWRkQ2xhc3MgPSBmdW5jdGlvbihlbGUsIGNscykge1xuXHRcdGlmICghaGFzQ2xhc3MoZWxlLCBjbHMpKXtcblx0XHRcdGVsZS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgKGVsZVtfZ2V0QXR0cmlidXRlXSgnY2xhc3MnKSB8fCAnJykudHJpbSgpICsgJyAnICsgY2xzKTtcblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBlbGUge0VsZW1lbnR9XG5cdCAqIEBwYXJhbSBjbHMge3N0cmluZ31cblx0ICovXG5cdHZhciByZW1vdmVDbGFzcyA9IGZ1bmN0aW9uKGVsZSwgY2xzKSB7XG5cdFx0dmFyIHJlZztcblx0XHRpZiAoKHJlZyA9IGhhc0NsYXNzKGVsZSxjbHMpKSkge1xuXHRcdFx0ZWxlLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAoZWxlW19nZXRBdHRyaWJ1dGVdKCdjbGFzcycpIHx8ICcnKS5yZXBsYWNlKHJlZywgJyAnKSk7XG5cdFx0fVxuXHR9O1xuXG5cdHZhciBhZGRSZW1vdmVMb2FkRXZlbnRzID0gZnVuY3Rpb24oZG9tLCBmbiwgYWRkKXtcblx0XHR2YXIgYWN0aW9uID0gYWRkID8gX2FkZEV2ZW50TGlzdGVuZXIgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG5cdFx0aWYoYWRkKXtcblx0XHRcdGFkZFJlbW92ZUxvYWRFdmVudHMoZG9tLCBmbik7XG5cdFx0fVxuXHRcdGxvYWRFdmVudHMuZm9yRWFjaChmdW5jdGlvbihldnQpe1xuXHRcdFx0ZG9tW2FjdGlvbl0oZXZ0LCBmbik7XG5cdFx0fSk7XG5cdH07XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBlbGVtIHsgRWxlbWVudCB9XG5cdCAqIEBwYXJhbSBuYW1lIHsgc3RyaW5nIH1cblx0ICogQHBhcmFtIGRldGFpbCB7IGFueSB9XG5cdCAqIEBwYXJhbSBub0J1YmJsZXMgeyBib29sZWFuIH1cblx0ICogQHBhcmFtIG5vQ2FuY2VsYWJsZSB7IGJvb2xlYW4gfVxuXHQgKiBAcmV0dXJucyB7IEN1c3RvbUV2ZW50IH1cblx0ICovXG5cdHZhciB0cmlnZ2VyRXZlbnQgPSBmdW5jdGlvbihlbGVtLCBuYW1lLCBkZXRhaWwsIG5vQnViYmxlcywgbm9DYW5jZWxhYmxlKXtcblx0XHR2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcblxuXHRcdGlmKCFkZXRhaWwpe1xuXHRcdFx0ZGV0YWlsID0ge307XG5cdFx0fVxuXG5cdFx0ZGV0YWlsLmluc3RhbmNlID0gbGF6eXNpemVzO1xuXG5cdFx0ZXZlbnQuaW5pdEV2ZW50KG5hbWUsICFub0J1YmJsZXMsICFub0NhbmNlbGFibGUpO1xuXG5cdFx0ZXZlbnQuZGV0YWlsID0gZGV0YWlsO1xuXG5cdFx0ZWxlbS5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcblx0XHRyZXR1cm4gZXZlbnQ7XG5cdH07XG5cblx0dmFyIHVwZGF0ZVBvbHlmaWxsID0gZnVuY3Rpb24gKGVsLCBmdWxsKXtcblx0XHR2YXIgcG9seWZpbGw7XG5cdFx0aWYoICFzdXBwb3J0UGljdHVyZSAmJiAoIHBvbHlmaWxsID0gKHdpbmRvdy5waWN0dXJlZmlsbCB8fCBsYXp5U2l6ZXNDZmcucGYpICkgKXtcblx0XHRcdGlmKGZ1bGwgJiYgZnVsbC5zcmMgJiYgIWVsW19nZXRBdHRyaWJ1dGVdKCdzcmNzZXQnKSl7XG5cdFx0XHRcdGVsLnNldEF0dHJpYnV0ZSgnc3Jjc2V0JywgZnVsbC5zcmMpO1xuXHRcdFx0fVxuXHRcdFx0cG9seWZpbGwoe3JlZXZhbHVhdGU6IHRydWUsIGVsZW1lbnRzOiBbZWxdfSk7XG5cdFx0fSBlbHNlIGlmKGZ1bGwgJiYgZnVsbC5zcmMpe1xuXHRcdFx0ZWwuc3JjID0gZnVsbC5zcmM7XG5cdFx0fVxuXHR9O1xuXG5cdHZhciBnZXRDU1MgPSBmdW5jdGlvbiAoZWxlbSwgc3R5bGUpe1xuXHRcdHJldHVybiAoZ2V0Q29tcHV0ZWRTdHlsZShlbGVtLCBudWxsKSB8fCB7fSlbc3R5bGVdO1xuXHR9O1xuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gZWxlbSB7IEVsZW1lbnQgfVxuXHQgKiBAcGFyYW0gcGFyZW50IHsgRWxlbWVudCB9XG5cdCAqIEBwYXJhbSBbd2lkdGhdIHtudW1iZXJ9XG5cdCAqIEByZXR1cm5zIHtudW1iZXJ9XG5cdCAqL1xuXHR2YXIgZ2V0V2lkdGggPSBmdW5jdGlvbihlbGVtLCBwYXJlbnQsIHdpZHRoKXtcblx0XHR3aWR0aCA9IHdpZHRoIHx8IGVsZW0ub2Zmc2V0V2lkdGg7XG5cblx0XHR3aGlsZSh3aWR0aCA8IGxhenlTaXplc0NmZy5taW5TaXplICYmIHBhcmVudCAmJiAhZWxlbS5fbGF6eXNpemVzV2lkdGgpe1xuXHRcdFx0d2lkdGggPSAgcGFyZW50Lm9mZnNldFdpZHRoO1xuXHRcdFx0cGFyZW50ID0gcGFyZW50LnBhcmVudE5vZGU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHdpZHRoO1xuXHR9O1xuXG5cdHZhciByQUYgPSAoZnVuY3Rpb24oKXtcblx0XHR2YXIgcnVubmluZywgd2FpdGluZztcblx0XHR2YXIgZmlyc3RGbnMgPSBbXTtcblx0XHR2YXIgc2Vjb25kRm5zID0gW107XG5cdFx0dmFyIGZucyA9IGZpcnN0Rm5zO1xuXG5cdFx0dmFyIHJ1biA9IGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgcnVuRm5zID0gZm5zO1xuXG5cdFx0XHRmbnMgPSBmaXJzdEZucy5sZW5ndGggPyBzZWNvbmRGbnMgOiBmaXJzdEZucztcblxuXHRcdFx0cnVubmluZyA9IHRydWU7XG5cdFx0XHR3YWl0aW5nID0gZmFsc2U7XG5cblx0XHRcdHdoaWxlKHJ1bkZucy5sZW5ndGgpe1xuXHRcdFx0XHRydW5GbnMuc2hpZnQoKSgpO1xuXHRcdFx0fVxuXG5cdFx0XHRydW5uaW5nID0gZmFsc2U7XG5cdFx0fTtcblxuXHRcdHZhciByYWZCYXRjaCA9IGZ1bmN0aW9uKGZuLCBxdWV1ZSl7XG5cdFx0XHRpZihydW5uaW5nICYmICFxdWV1ZSl7XG5cdFx0XHRcdGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmbnMucHVzaChmbik7XG5cblx0XHRcdFx0aWYoIXdhaXRpbmcpe1xuXHRcdFx0XHRcdHdhaXRpbmcgPSB0cnVlO1xuXHRcdFx0XHRcdChkb2N1bWVudC5oaWRkZW4gPyBzZXRUaW1lb3V0IDogcmVxdWVzdEFuaW1hdGlvbkZyYW1lKShydW4pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHJhZkJhdGNoLl9sc0ZsdXNoID0gcnVuO1xuXG5cdFx0cmV0dXJuIHJhZkJhdGNoO1xuXHR9KSgpO1xuXG5cdHZhciByQUZJdCA9IGZ1bmN0aW9uKGZuLCBzaW1wbGUpe1xuXHRcdHJldHVybiBzaW1wbGUgP1xuXHRcdFx0ZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJBRihmbik7XG5cdFx0XHR9IDpcblx0XHRcdGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHRcdFx0dmFyIGFyZ3MgPSBhcmd1bWVudHM7XG5cdFx0XHRcdHJBRihmdW5jdGlvbigpe1xuXHRcdFx0XHRcdGZuLmFwcGx5KHRoYXQsIGFyZ3MpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHQ7XG5cdH07XG5cblx0dmFyIHRocm90dGxlID0gZnVuY3Rpb24oZm4pe1xuXHRcdHZhciBydW5uaW5nO1xuXHRcdHZhciBsYXN0VGltZSA9IDA7XG5cdFx0dmFyIGdEZWxheSA9IGxhenlTaXplc0NmZy50aHJvdHRsZURlbGF5O1xuXHRcdHZhciBySUNUaW1lb3V0ID0gbGF6eVNpemVzQ2ZnLnJpY1RpbWVvdXQ7XG5cdFx0dmFyIHJ1biA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRydW5uaW5nID0gZmFsc2U7XG5cdFx0XHRsYXN0VGltZSA9IERhdGUubm93KCk7XG5cdFx0XHRmbigpO1xuXHRcdH07XG5cdFx0dmFyIGlkbGVDYWxsYmFjayA9IHJlcXVlc3RJZGxlQ2FsbGJhY2sgJiYgcklDVGltZW91dCA+IDQ5ID9cblx0XHRcdGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHJlcXVlc3RJZGxlQ2FsbGJhY2socnVuLCB7dGltZW91dDogcklDVGltZW91dH0pO1xuXG5cdFx0XHRcdGlmKHJJQ1RpbWVvdXQgIT09IGxhenlTaXplc0NmZy5yaWNUaW1lb3V0KXtcblx0XHRcdFx0XHRySUNUaW1lb3V0ID0gbGF6eVNpemVzQ2ZnLnJpY1RpbWVvdXQ7XG5cdFx0XHRcdH1cblx0XHRcdH0gOlxuXHRcdFx0ckFGSXQoZnVuY3Rpb24oKXtcblx0XHRcdFx0c2V0VGltZW91dChydW4pO1xuXHRcdFx0fSwgdHJ1ZSlcblx0XHQ7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24oaXNQcmlvcml0eSl7XG5cdFx0XHR2YXIgZGVsYXk7XG5cblx0XHRcdGlmKChpc1ByaW9yaXR5ID0gaXNQcmlvcml0eSA9PT0gdHJ1ZSkpe1xuXHRcdFx0XHRySUNUaW1lb3V0ID0gMzM7XG5cdFx0XHR9XG5cblx0XHRcdGlmKHJ1bm5pbmcpe1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHJ1bm5pbmcgPSAgdHJ1ZTtcblxuXHRcdFx0ZGVsYXkgPSBnRGVsYXkgLSAoRGF0ZS5ub3coKSAtIGxhc3RUaW1lKTtcblxuXHRcdFx0aWYoZGVsYXkgPCAwKXtcblx0XHRcdFx0ZGVsYXkgPSAwO1xuXHRcdFx0fVxuXG5cdFx0XHRpZihpc1ByaW9yaXR5IHx8IGRlbGF5IDwgOSl7XG5cdFx0XHRcdGlkbGVDYWxsYmFjaygpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2V0VGltZW91dChpZGxlQ2FsbGJhY2ssIGRlbGF5KTtcblx0XHRcdH1cblx0XHR9O1xuXHR9O1xuXG5cdC8vYmFzZWQgb24gaHR0cDovL21vZGVybmphdmFzY3JpcHQuYmxvZ3Nwb3QuZGUvMjAxMy8wOC9idWlsZGluZy1iZXR0ZXItZGVib3VuY2UuaHRtbFxuXHR2YXIgZGVib3VuY2UgPSBmdW5jdGlvbihmdW5jKSB7XG5cdFx0dmFyIHRpbWVvdXQsIHRpbWVzdGFtcDtcblx0XHR2YXIgd2FpdCA9IDk5O1xuXHRcdHZhciBydW4gPSBmdW5jdGlvbigpe1xuXHRcdFx0dGltZW91dCA9IG51bGw7XG5cdFx0XHRmdW5jKCk7XG5cdFx0fTtcblx0XHR2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBsYXN0ID0gRGF0ZS5ub3coKSAtIHRpbWVzdGFtcDtcblxuXHRcdFx0aWYgKGxhc3QgPCB3YWl0KSB7XG5cdFx0XHRcdHNldFRpbWVvdXQobGF0ZXIsIHdhaXQgLSBsYXN0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdChyZXF1ZXN0SWRsZUNhbGxiYWNrIHx8IHJ1bikocnVuKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGltZXN0YW1wID0gRGF0ZS5ub3coKTtcblxuXHRcdFx0aWYgKCF0aW1lb3V0KSB7XG5cdFx0XHRcdHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcblx0XHRcdH1cblx0XHR9O1xuXHR9O1xuXG5cdHZhciBsb2FkZXIgPSAoZnVuY3Rpb24oKXtcblx0XHR2YXIgcHJlbG9hZEVsZW1zLCBpc0NvbXBsZXRlZCwgcmVzZXRQcmVsb2FkaW5nVGltZXIsIGxvYWRNb2RlLCBzdGFydGVkO1xuXG5cdFx0dmFyIGVMdlcsIGVsdkgsIGVMdG9wLCBlTGxlZnQsIGVMcmlnaHQsIGVMYm90dG9tLCBpc0JvZHlIaWRkZW47XG5cblx0XHR2YXIgcmVnSW1nID0gL15pbWckL2k7XG5cdFx0dmFyIHJlZ0lmcmFtZSA9IC9eaWZyYW1lJC9pO1xuXG5cdFx0dmFyIHN1cHBvcnRTY3JvbGwgPSAoJ29uc2Nyb2xsJyBpbiB3aW5kb3cpICYmICEoLyhnbGV8aW5nKWJvdC8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSk7XG5cblx0XHR2YXIgc2hyaW5rRXhwYW5kID0gMDtcblx0XHR2YXIgY3VycmVudEV4cGFuZCA9IDA7XG5cblx0XHR2YXIgaXNMb2FkaW5nID0gMDtcblx0XHR2YXIgbG93UnVucyA9IC0xO1xuXG5cdFx0dmFyIHJlc2V0UHJlbG9hZGluZyA9IGZ1bmN0aW9uKGUpe1xuXHRcdFx0aXNMb2FkaW5nLS07XG5cdFx0XHRpZighZSB8fCBpc0xvYWRpbmcgPCAwIHx8ICFlLnRhcmdldCl7XG5cdFx0XHRcdGlzTG9hZGluZyA9IDA7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciBpc1Zpc2libGUgPSBmdW5jdGlvbiAoZWxlbSkge1xuXHRcdFx0aWYgKGlzQm9keUhpZGRlbiA9PSBudWxsKSB7XG5cdFx0XHRcdGlzQm9keUhpZGRlbiA9IGdldENTUyhkb2N1bWVudC5ib2R5LCAndmlzaWJpbGl0eScpID09ICdoaWRkZW4nO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gaXNCb2R5SGlkZGVuIHx8ICEoZ2V0Q1NTKGVsZW0ucGFyZW50Tm9kZSwgJ3Zpc2liaWxpdHknKSA9PSAnaGlkZGVuJyAmJiBnZXRDU1MoZWxlbSwgJ3Zpc2liaWxpdHknKSA9PSAnaGlkZGVuJyk7XG5cdFx0fTtcblxuXHRcdHZhciBpc05lc3RlZFZpc2libGUgPSBmdW5jdGlvbihlbGVtLCBlbGVtRXhwYW5kKXtcblx0XHRcdHZhciBvdXRlclJlY3Q7XG5cdFx0XHR2YXIgcGFyZW50ID0gZWxlbTtcblx0XHRcdHZhciB2aXNpYmxlID0gaXNWaXNpYmxlKGVsZW0pO1xuXG5cdFx0XHRlTHRvcCAtPSBlbGVtRXhwYW5kO1xuXHRcdFx0ZUxib3R0b20gKz0gZWxlbUV4cGFuZDtcblx0XHRcdGVMbGVmdCAtPSBlbGVtRXhwYW5kO1xuXHRcdFx0ZUxyaWdodCArPSBlbGVtRXhwYW5kO1xuXG5cdFx0XHR3aGlsZSh2aXNpYmxlICYmIChwYXJlbnQgPSBwYXJlbnQub2Zmc2V0UGFyZW50KSAmJiBwYXJlbnQgIT0gZG9jdW1lbnQuYm9keSAmJiBwYXJlbnQgIT0gZG9jRWxlbSl7XG5cdFx0XHRcdHZpc2libGUgPSAoKGdldENTUyhwYXJlbnQsICdvcGFjaXR5JykgfHwgMSkgPiAwKTtcblxuXHRcdFx0XHRpZih2aXNpYmxlICYmIGdldENTUyhwYXJlbnQsICdvdmVyZmxvdycpICE9ICd2aXNpYmxlJyl7XG5cdFx0XHRcdFx0b3V0ZXJSZWN0ID0gcGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0XHRcdHZpc2libGUgPSBlTHJpZ2h0ID4gb3V0ZXJSZWN0LmxlZnQgJiZcblx0XHRcdFx0XHRcdGVMbGVmdCA8IG91dGVyUmVjdC5yaWdodCAmJlxuXHRcdFx0XHRcdFx0ZUxib3R0b20gPiBvdXRlclJlY3QudG9wIC0gMSAmJlxuXHRcdFx0XHRcdFx0ZUx0b3AgPCBvdXRlclJlY3QuYm90dG9tICsgMVxuXHRcdFx0XHRcdDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdmlzaWJsZTtcblx0XHR9O1xuXG5cdFx0dmFyIGNoZWNrRWxlbWVudHMgPSBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBlTGxlbiwgaSwgcmVjdCwgYXV0b0xvYWRFbGVtLCBsb2FkZWRTb21ldGhpbmcsIGVsZW1FeHBhbmQsIGVsZW1OZWdhdGl2ZUV4cGFuZCwgZWxlbUV4cGFuZFZhbCxcblx0XHRcdFx0YmVmb3JlRXhwYW5kVmFsLCBkZWZhdWx0RXhwYW5kLCBwcmVsb2FkRXhwYW5kLCBoRmFjO1xuXHRcdFx0dmFyIGxhenlsb2FkRWxlbXMgPSBsYXp5c2l6ZXMuZWxlbWVudHM7XG5cblx0XHRcdGlmKChsb2FkTW9kZSA9IGxhenlTaXplc0NmZy5sb2FkTW9kZSkgJiYgaXNMb2FkaW5nIDwgOCAmJiAoZUxsZW4gPSBsYXp5bG9hZEVsZW1zLmxlbmd0aCkpe1xuXG5cdFx0XHRcdGkgPSAwO1xuXG5cdFx0XHRcdGxvd1J1bnMrKztcblxuXHRcdFx0XHRmb3IoOyBpIDwgZUxsZW47IGkrKyl7XG5cblx0XHRcdFx0XHRpZighbGF6eWxvYWRFbGVtc1tpXSB8fCBsYXp5bG9hZEVsZW1zW2ldLl9sYXp5UmFjZSl7Y29udGludWU7fVxuXG5cdFx0XHRcdFx0aWYoIXN1cHBvcnRTY3JvbGwgfHwgKGxhenlzaXplcy5wcmVtYXR1cmVVbnZlaWwgJiYgbGF6eXNpemVzLnByZW1hdHVyZVVudmVpbChsYXp5bG9hZEVsZW1zW2ldKSkpe3VudmVpbEVsZW1lbnQobGF6eWxvYWRFbGVtc1tpXSk7Y29udGludWU7fVxuXG5cdFx0XHRcdFx0aWYoIShlbGVtRXhwYW5kVmFsID0gbGF6eWxvYWRFbGVtc1tpXVtfZ2V0QXR0cmlidXRlXSgnZGF0YS1leHBhbmQnKSkgfHwgIShlbGVtRXhwYW5kID0gZWxlbUV4cGFuZFZhbCAqIDEpKXtcblx0XHRcdFx0XHRcdGVsZW1FeHBhbmQgPSBjdXJyZW50RXhwYW5kO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICghZGVmYXVsdEV4cGFuZCkge1xuXHRcdFx0XHRcdFx0ZGVmYXVsdEV4cGFuZCA9ICghbGF6eVNpemVzQ2ZnLmV4cGFuZCB8fCBsYXp5U2l6ZXNDZmcuZXhwYW5kIDwgMSkgP1xuXHRcdFx0XHRcdFx0XHRkb2NFbGVtLmNsaWVudEhlaWdodCA+IDUwMCAmJiBkb2NFbGVtLmNsaWVudFdpZHRoID4gNTAwID8gNTAwIDogMzcwIDpcblx0XHRcdFx0XHRcdFx0bGF6eVNpemVzQ2ZnLmV4cGFuZDtcblxuXHRcdFx0XHRcdFx0bGF6eXNpemVzLl9kZWZFeCA9IGRlZmF1bHRFeHBhbmQ7XG5cblx0XHRcdFx0XHRcdHByZWxvYWRFeHBhbmQgPSBkZWZhdWx0RXhwYW5kICogbGF6eVNpemVzQ2ZnLmV4cEZhY3Rvcjtcblx0XHRcdFx0XHRcdGhGYWMgPSBsYXp5U2l6ZXNDZmcuaEZhYztcblx0XHRcdFx0XHRcdGlzQm9keUhpZGRlbiA9IG51bGw7XG5cblx0XHRcdFx0XHRcdGlmKGN1cnJlbnRFeHBhbmQgPCBwcmVsb2FkRXhwYW5kICYmIGlzTG9hZGluZyA8IDEgJiYgbG93UnVucyA+IDIgJiYgbG9hZE1vZGUgPiAyICYmICFkb2N1bWVudC5oaWRkZW4pe1xuXHRcdFx0XHRcdFx0XHRjdXJyZW50RXhwYW5kID0gcHJlbG9hZEV4cGFuZDtcblx0XHRcdFx0XHRcdFx0bG93UnVucyA9IDA7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYobG9hZE1vZGUgPiAxICYmIGxvd1J1bnMgPiAxICYmIGlzTG9hZGluZyA8IDYpe1xuXHRcdFx0XHRcdFx0XHRjdXJyZW50RXhwYW5kID0gZGVmYXVsdEV4cGFuZDtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRFeHBhbmQgPSBzaHJpbmtFeHBhbmQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYoYmVmb3JlRXhwYW5kVmFsICE9PSBlbGVtRXhwYW5kKXtcblx0XHRcdFx0XHRcdGVMdlcgPSBpbm5lcldpZHRoICsgKGVsZW1FeHBhbmQgKiBoRmFjKTtcblx0XHRcdFx0XHRcdGVsdkggPSBpbm5lckhlaWdodCArIGVsZW1FeHBhbmQ7XG5cdFx0XHRcdFx0XHRlbGVtTmVnYXRpdmVFeHBhbmQgPSBlbGVtRXhwYW5kICogLTE7XG5cdFx0XHRcdFx0XHRiZWZvcmVFeHBhbmRWYWwgPSBlbGVtRXhwYW5kO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJlY3QgPSBsYXp5bG9hZEVsZW1zW2ldLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG5cdFx0XHRcdFx0aWYgKChlTGJvdHRvbSA9IHJlY3QuYm90dG9tKSA+PSBlbGVtTmVnYXRpdmVFeHBhbmQgJiZcblx0XHRcdFx0XHRcdChlTHRvcCA9IHJlY3QudG9wKSA8PSBlbHZIICYmXG5cdFx0XHRcdFx0XHQoZUxyaWdodCA9IHJlY3QucmlnaHQpID49IGVsZW1OZWdhdGl2ZUV4cGFuZCAqIGhGYWMgJiZcblx0XHRcdFx0XHRcdChlTGxlZnQgPSByZWN0LmxlZnQpIDw9IGVMdlcgJiZcblx0XHRcdFx0XHRcdChlTGJvdHRvbSB8fCBlTHJpZ2h0IHx8IGVMbGVmdCB8fCBlTHRvcCkgJiZcblx0XHRcdFx0XHRcdChsYXp5U2l6ZXNDZmcubG9hZEhpZGRlbiB8fCBpc1Zpc2libGUobGF6eWxvYWRFbGVtc1tpXSkpICYmXG5cdFx0XHRcdFx0XHQoKGlzQ29tcGxldGVkICYmIGlzTG9hZGluZyA8IDMgJiYgIWVsZW1FeHBhbmRWYWwgJiYgKGxvYWRNb2RlIDwgMyB8fCBsb3dSdW5zIDwgNCkpIHx8IGlzTmVzdGVkVmlzaWJsZShsYXp5bG9hZEVsZW1zW2ldLCBlbGVtRXhwYW5kKSkpe1xuXHRcdFx0XHRcdFx0dW52ZWlsRWxlbWVudChsYXp5bG9hZEVsZW1zW2ldKTtcblx0XHRcdFx0XHRcdGxvYWRlZFNvbWV0aGluZyA9IHRydWU7XG5cdFx0XHRcdFx0XHRpZihpc0xvYWRpbmcgPiA5KXticmVhazt9XG5cdFx0XHRcdFx0fSBlbHNlIGlmKCFsb2FkZWRTb21ldGhpbmcgJiYgaXNDb21wbGV0ZWQgJiYgIWF1dG9Mb2FkRWxlbSAmJlxuXHRcdFx0XHRcdFx0aXNMb2FkaW5nIDwgNCAmJiBsb3dSdW5zIDwgNCAmJiBsb2FkTW9kZSA+IDIgJiZcblx0XHRcdFx0XHRcdChwcmVsb2FkRWxlbXNbMF0gfHwgbGF6eVNpemVzQ2ZnLnByZWxvYWRBZnRlckxvYWQpICYmXG5cdFx0XHRcdFx0XHQocHJlbG9hZEVsZW1zWzBdIHx8ICghZWxlbUV4cGFuZFZhbCAmJiAoKGVMYm90dG9tIHx8IGVMcmlnaHQgfHwgZUxsZWZ0IHx8IGVMdG9wKSB8fCBsYXp5bG9hZEVsZW1zW2ldW19nZXRBdHRyaWJ1dGVdKGxhenlTaXplc0NmZy5zaXplc0F0dHIpICE9ICdhdXRvJykpKSl7XG5cdFx0XHRcdFx0XHRhdXRvTG9hZEVsZW0gPSBwcmVsb2FkRWxlbXNbMF0gfHwgbGF6eWxvYWRFbGVtc1tpXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihhdXRvTG9hZEVsZW0gJiYgIWxvYWRlZFNvbWV0aGluZyl7XG5cdFx0XHRcdFx0dW52ZWlsRWxlbWVudChhdXRvTG9hZEVsZW0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciB0aHJvdHRsZWRDaGVja0VsZW1lbnRzID0gdGhyb3R0bGUoY2hlY2tFbGVtZW50cyk7XG5cblx0XHR2YXIgc3dpdGNoTG9hZGluZ0NsYXNzID0gZnVuY3Rpb24oZSl7XG5cdFx0XHR2YXIgZWxlbSA9IGUudGFyZ2V0O1xuXG5cdFx0XHRpZiAoZWxlbS5fbGF6eUNhY2hlKSB7XG5cdFx0XHRcdGRlbGV0ZSBlbGVtLl9sYXp5Q2FjaGU7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0cmVzZXRQcmVsb2FkaW5nKGUpO1xuXHRcdFx0YWRkQ2xhc3MoZWxlbSwgbGF6eVNpemVzQ2ZnLmxvYWRlZENsYXNzKTtcblx0XHRcdHJlbW92ZUNsYXNzKGVsZW0sIGxhenlTaXplc0NmZy5sb2FkaW5nQ2xhc3MpO1xuXHRcdFx0YWRkUmVtb3ZlTG9hZEV2ZW50cyhlbGVtLCByYWZTd2l0Y2hMb2FkaW5nQ2xhc3MpO1xuXHRcdFx0dHJpZ2dlckV2ZW50KGVsZW0sICdsYXp5bG9hZGVkJyk7XG5cdFx0fTtcblx0XHR2YXIgcmFmZWRTd2l0Y2hMb2FkaW5nQ2xhc3MgPSByQUZJdChzd2l0Y2hMb2FkaW5nQ2xhc3MpO1xuXHRcdHZhciByYWZTd2l0Y2hMb2FkaW5nQ2xhc3MgPSBmdW5jdGlvbihlKXtcblx0XHRcdHJhZmVkU3dpdGNoTG9hZGluZ0NsYXNzKHt0YXJnZXQ6IGUudGFyZ2V0fSk7XG5cdFx0fTtcblxuXHRcdHZhciBjaGFuZ2VJZnJhbWVTcmMgPSBmdW5jdGlvbihlbGVtLCBzcmMpe1xuXHRcdFx0dmFyIGxvYWRNb2RlID0gZWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbG9hZC1tb2RlJykgfHwgbGF6eVNpemVzQ2ZnLmlmcmFtZUxvYWRNb2RlO1xuXG5cdFx0XHQvLyBsb2FkTW9kZSBjYW4gYmUgYWxzbyBhIHN0cmluZyFcblx0XHRcdGlmIChsb2FkTW9kZSA9PSAwKSB7XG5cdFx0XHRcdGVsZW0uY29udGVudFdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKHNyYyk7XG5cdFx0XHR9IGVsc2UgaWYgKGxvYWRNb2RlID09IDEpIHtcblx0XHRcdFx0ZWxlbS5zcmMgPSBzcmM7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciBoYW5kbGVTb3VyY2VzID0gZnVuY3Rpb24oc291cmNlKXtcblx0XHRcdHZhciBjdXN0b21NZWRpYTtcblxuXHRcdFx0dmFyIHNvdXJjZVNyY3NldCA9IHNvdXJjZVtfZ2V0QXR0cmlidXRlXShsYXp5U2l6ZXNDZmcuc3Jjc2V0QXR0cik7XG5cblx0XHRcdGlmKCAoY3VzdG9tTWVkaWEgPSBsYXp5U2l6ZXNDZmcuY3VzdG9tTWVkaWFbc291cmNlW19nZXRBdHRyaWJ1dGVdKCdkYXRhLW1lZGlhJykgfHwgc291cmNlW19nZXRBdHRyaWJ1dGVdKCdtZWRpYScpXSkgKXtcblx0XHRcdFx0c291cmNlLnNldEF0dHJpYnV0ZSgnbWVkaWEnLCBjdXN0b21NZWRpYSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmKHNvdXJjZVNyY3NldCl7XG5cdFx0XHRcdHNvdXJjZS5zZXRBdHRyaWJ1dGUoJ3NyY3NldCcsIHNvdXJjZVNyY3NldCk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciBsYXp5VW52ZWlsID0gckFGSXQoZnVuY3Rpb24gKGVsZW0sIGRldGFpbCwgaXNBdXRvLCBzaXplcywgaXNJbWcpe1xuXHRcdFx0dmFyIHNyYywgc3Jjc2V0LCBwYXJlbnQsIGlzUGljdHVyZSwgZXZlbnQsIGZpcmVzTG9hZDtcblxuXHRcdFx0aWYoIShldmVudCA9IHRyaWdnZXJFdmVudChlbGVtLCAnbGF6eWJlZm9yZXVudmVpbCcsIGRldGFpbCkpLmRlZmF1bHRQcmV2ZW50ZWQpe1xuXG5cdFx0XHRcdGlmKHNpemVzKXtcblx0XHRcdFx0XHRpZihpc0F1dG8pe1xuXHRcdFx0XHRcdFx0YWRkQ2xhc3MoZWxlbSwgbGF6eVNpemVzQ2ZnLmF1dG9zaXplc0NsYXNzKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZWxlbS5zZXRBdHRyaWJ1dGUoJ3NpemVzJywgc2l6ZXMpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHNyY3NldCA9IGVsZW1bX2dldEF0dHJpYnV0ZV0obGF6eVNpemVzQ2ZnLnNyY3NldEF0dHIpO1xuXHRcdFx0XHRzcmMgPSBlbGVtW19nZXRBdHRyaWJ1dGVdKGxhenlTaXplc0NmZy5zcmNBdHRyKTtcblxuXHRcdFx0XHRpZihpc0ltZykge1xuXHRcdFx0XHRcdHBhcmVudCA9IGVsZW0ucGFyZW50Tm9kZTtcblx0XHRcdFx0XHRpc1BpY3R1cmUgPSBwYXJlbnQgJiYgcmVnUGljdHVyZS50ZXN0KHBhcmVudC5ub2RlTmFtZSB8fCAnJyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmaXJlc0xvYWQgPSBkZXRhaWwuZmlyZXNMb2FkIHx8ICgoJ3NyYycgaW4gZWxlbSkgJiYgKHNyY3NldCB8fCBzcmMgfHwgaXNQaWN0dXJlKSk7XG5cblx0XHRcdFx0ZXZlbnQgPSB7dGFyZ2V0OiBlbGVtfTtcblxuXHRcdFx0XHRhZGRDbGFzcyhlbGVtLCBsYXp5U2l6ZXNDZmcubG9hZGluZ0NsYXNzKTtcblxuXHRcdFx0XHRpZihmaXJlc0xvYWQpe1xuXHRcdFx0XHRcdGNsZWFyVGltZW91dChyZXNldFByZWxvYWRpbmdUaW1lcik7XG5cdFx0XHRcdFx0cmVzZXRQcmVsb2FkaW5nVGltZXIgPSBzZXRUaW1lb3V0KHJlc2V0UHJlbG9hZGluZywgMjUwMCk7XG5cdFx0XHRcdFx0YWRkUmVtb3ZlTG9hZEV2ZW50cyhlbGVtLCByYWZTd2l0Y2hMb2FkaW5nQ2xhc3MsIHRydWUpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoaXNQaWN0dXJlKXtcblx0XHRcdFx0XHRmb3JFYWNoLmNhbGwocGFyZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzb3VyY2UnKSwgaGFuZGxlU291cmNlcyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihzcmNzZXQpe1xuXHRcdFx0XHRcdGVsZW0uc2V0QXR0cmlidXRlKCdzcmNzZXQnLCBzcmNzZXQpO1xuXHRcdFx0XHR9IGVsc2UgaWYoc3JjICYmICFpc1BpY3R1cmUpe1xuXHRcdFx0XHRcdGlmKHJlZ0lmcmFtZS50ZXN0KGVsZW0ubm9kZU5hbWUpKXtcblx0XHRcdFx0XHRcdGNoYW5nZUlmcmFtZVNyYyhlbGVtLCBzcmMpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRlbGVtLnNyYyA9IHNyYztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihpc0ltZyAmJiAoc3Jjc2V0IHx8IGlzUGljdHVyZSkpe1xuXHRcdFx0XHRcdHVwZGF0ZVBvbHlmaWxsKGVsZW0sIHtzcmM6IHNyY30pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmKGVsZW0uX2xhenlSYWNlKXtcblx0XHRcdFx0ZGVsZXRlIGVsZW0uX2xhenlSYWNlO1xuXHRcdFx0fVxuXHRcdFx0cmVtb3ZlQ2xhc3MoZWxlbSwgbGF6eVNpemVzQ2ZnLmxhenlDbGFzcyk7XG5cblx0XHRcdHJBRihmdW5jdGlvbigpe1xuXHRcdFx0XHQvLyBQYXJ0IG9mIHRoaXMgY2FuIGJlIHJlbW92ZWQgYXMgc29vbiBhcyB0aGlzIGZpeCBpcyBvbGRlcjogaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9NzczMSAoMjAxNSlcblx0XHRcdFx0dmFyIGlzTG9hZGVkID0gZWxlbS5jb21wbGV0ZSAmJiBlbGVtLm5hdHVyYWxXaWR0aCA+IDE7XG5cblx0XHRcdFx0aWYoICFmaXJlc0xvYWQgfHwgaXNMb2FkZWQpe1xuXHRcdFx0XHRcdGlmIChpc0xvYWRlZCkge1xuXHRcdFx0XHRcdFx0YWRkQ2xhc3MoZWxlbSwgbGF6eVNpemVzQ2ZnLmZhc3RMb2FkZWRDbGFzcyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHN3aXRjaExvYWRpbmdDbGFzcyhldmVudCk7XG5cdFx0XHRcdFx0ZWxlbS5fbGF6eUNhY2hlID0gdHJ1ZTtcblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0XHRpZiAoJ19sYXp5Q2FjaGUnIGluIGVsZW0pIHtcblx0XHRcdFx0XHRcdFx0ZGVsZXRlIGVsZW0uX2xhenlDYWNoZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LCA5KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoZWxlbS5sb2FkaW5nID09ICdsYXp5Jykge1xuXHRcdFx0XHRcdGlzTG9hZGluZy0tO1xuXHRcdFx0XHR9XG5cdFx0XHR9LCB0cnVlKTtcblx0XHR9KTtcblxuXHRcdC8qKlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGVsZW0geyBFbGVtZW50IH1cblx0XHQgKi9cblx0XHR2YXIgdW52ZWlsRWxlbWVudCA9IGZ1bmN0aW9uIChlbGVtKXtcblx0XHRcdGlmIChlbGVtLl9sYXp5UmFjZSkge3JldHVybjt9XG5cdFx0XHR2YXIgZGV0YWlsO1xuXG5cdFx0XHR2YXIgaXNJbWcgPSByZWdJbWcudGVzdChlbGVtLm5vZGVOYW1lKTtcblxuXHRcdFx0Ly9hbGxvdyB1c2luZyBzaXplcz1cImF1dG9cIiwgYnV0IGRvbid0IHVzZS4gaXQncyBpbnZhbGlkLiBVc2UgZGF0YS1zaXplcz1cImF1dG9cIiBvciBhIHZhbGlkIHZhbHVlIGZvciBzaXplcyBpbnN0ZWFkIChpLmUuOiBzaXplcz1cIjgwdndcIilcblx0XHRcdHZhciBzaXplcyA9IGlzSW1nICYmIChlbGVtW19nZXRBdHRyaWJ1dGVdKGxhenlTaXplc0NmZy5zaXplc0F0dHIpIHx8IGVsZW1bX2dldEF0dHJpYnV0ZV0oJ3NpemVzJykpO1xuXHRcdFx0dmFyIGlzQXV0byA9IHNpemVzID09ICdhdXRvJztcblxuXHRcdFx0aWYoIChpc0F1dG8gfHwgIWlzQ29tcGxldGVkKSAmJiBpc0ltZyAmJiAoZWxlbVtfZ2V0QXR0cmlidXRlXSgnc3JjJykgfHwgZWxlbS5zcmNzZXQpICYmICFlbGVtLmNvbXBsZXRlICYmICFoYXNDbGFzcyhlbGVtLCBsYXp5U2l6ZXNDZmcuZXJyb3JDbGFzcykgJiYgaGFzQ2xhc3MoZWxlbSwgbGF6eVNpemVzQ2ZnLmxhenlDbGFzcykpe3JldHVybjt9XG5cblx0XHRcdGRldGFpbCA9IHRyaWdnZXJFdmVudChlbGVtLCAnbGF6eXVudmVpbHJlYWQnKS5kZXRhaWw7XG5cblx0XHRcdGlmKGlzQXV0byl7XG5cdFx0XHRcdCBhdXRvU2l6ZXIudXBkYXRlRWxlbShlbGVtLCB0cnVlLCBlbGVtLm9mZnNldFdpZHRoKTtcblx0XHRcdH1cblxuXHRcdFx0ZWxlbS5fbGF6eVJhY2UgPSB0cnVlO1xuXHRcdFx0aXNMb2FkaW5nKys7XG5cblx0XHRcdGxhenlVbnZlaWwoZWxlbSwgZGV0YWlsLCBpc0F1dG8sIHNpemVzLCBpc0ltZyk7XG5cdFx0fTtcblxuXHRcdHZhciBhZnRlclNjcm9sbCA9IGRlYm91bmNlKGZ1bmN0aW9uKCl7XG5cdFx0XHRsYXp5U2l6ZXNDZmcubG9hZE1vZGUgPSAzO1xuXHRcdFx0dGhyb3R0bGVkQ2hlY2tFbGVtZW50cygpO1xuXHRcdH0pO1xuXG5cdFx0dmFyIGFsdExvYWRtb2RlU2Nyb2xsTGlzdG5lciA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRpZihsYXp5U2l6ZXNDZmcubG9hZE1vZGUgPT0gMyl7XG5cdFx0XHRcdGxhenlTaXplc0NmZy5sb2FkTW9kZSA9IDI7XG5cdFx0XHR9XG5cdFx0XHRhZnRlclNjcm9sbCgpO1xuXHRcdH07XG5cblx0XHR2YXIgb25sb2FkID0gZnVuY3Rpb24oKXtcblx0XHRcdGlmKGlzQ29tcGxldGVkKXtyZXR1cm47fVxuXHRcdFx0aWYoRGF0ZS5ub3coKSAtIHN0YXJ0ZWQgPCA5OTkpe1xuXHRcdFx0XHRzZXRUaW1lb3V0KG9ubG9hZCwgOTk5KTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cblx0XHRcdGlzQ29tcGxldGVkID0gdHJ1ZTtcblxuXHRcdFx0bGF6eVNpemVzQ2ZnLmxvYWRNb2RlID0gMztcblxuXHRcdFx0dGhyb3R0bGVkQ2hlY2tFbGVtZW50cygpO1xuXG5cdFx0XHRhZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBhbHRMb2FkbW9kZVNjcm9sbExpc3RuZXIsIHRydWUpO1xuXHRcdH07XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0XzogZnVuY3Rpb24oKXtcblx0XHRcdFx0c3RhcnRlZCA9IERhdGUubm93KCk7XG5cblx0XHRcdFx0bGF6eXNpemVzLmVsZW1lbnRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShsYXp5U2l6ZXNDZmcubGF6eUNsYXNzKTtcblx0XHRcdFx0cHJlbG9hZEVsZW1zID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShsYXp5U2l6ZXNDZmcubGF6eUNsYXNzICsgJyAnICsgbGF6eVNpemVzQ2ZnLnByZWxvYWRDbGFzcyk7XG5cblx0XHRcdFx0YWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhyb3R0bGVkQ2hlY2tFbGVtZW50cywgdHJ1ZSk7XG5cblx0XHRcdFx0YWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhyb3R0bGVkQ2hlY2tFbGVtZW50cywgdHJ1ZSk7XG5cblx0XHRcdFx0YWRkRXZlbnRMaXN0ZW5lcigncGFnZXNob3cnLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRcdGlmIChlLnBlcnNpc3RlZCkge1xuXHRcdFx0XHRcdFx0dmFyIGxvYWRpbmdFbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy4nICsgbGF6eVNpemVzQ2ZnLmxvYWRpbmdDbGFzcyk7XG5cblx0XHRcdFx0XHRcdGlmIChsb2FkaW5nRWxlbWVudHMubGVuZ3RoICYmIGxvYWRpbmdFbGVtZW50cy5mb3JFYWNoKSB7XG5cdFx0XHRcdFx0XHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0bG9hZGluZ0VsZW1lbnRzLmZvckVhY2goIGZ1bmN0aW9uIChpbWcpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChpbWcuY29tcGxldGUpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dW52ZWlsRWxlbWVudChpbWcpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGlmKHdpbmRvdy5NdXRhdGlvbk9ic2VydmVyKXtcblx0XHRcdFx0XHRuZXcgTXV0YXRpb25PYnNlcnZlciggdGhyb3R0bGVkQ2hlY2tFbGVtZW50cyApLm9ic2VydmUoIGRvY0VsZW0sIHtjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWUsIGF0dHJpYnV0ZXM6IHRydWV9ICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZG9jRWxlbVtfYWRkRXZlbnRMaXN0ZW5lcl0oJ0RPTU5vZGVJbnNlcnRlZCcsIHRocm90dGxlZENoZWNrRWxlbWVudHMsIHRydWUpO1xuXHRcdFx0XHRcdGRvY0VsZW1bX2FkZEV2ZW50TGlzdGVuZXJdKCdET01BdHRyTW9kaWZpZWQnLCB0aHJvdHRsZWRDaGVja0VsZW1lbnRzLCB0cnVlKTtcblx0XHRcdFx0XHRzZXRJbnRlcnZhbCh0aHJvdHRsZWRDaGVja0VsZW1lbnRzLCA5OTkpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIHRocm90dGxlZENoZWNrRWxlbWVudHMsIHRydWUpO1xuXG5cdFx0XHRcdC8vLCAnZnVsbHNjcmVlbmNoYW5nZSdcblx0XHRcdFx0Wydmb2N1cycsICdtb3VzZW92ZXInLCAnY2xpY2snLCAnbG9hZCcsICd0cmFuc2l0aW9uZW5kJywgJ2FuaW1hdGlvbmVuZCddLmZvckVhY2goZnVuY3Rpb24obmFtZSl7XG5cdFx0XHRcdFx0ZG9jdW1lbnRbX2FkZEV2ZW50TGlzdGVuZXJdKG5hbWUsIHRocm90dGxlZENoZWNrRWxlbWVudHMsIHRydWUpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRpZigoL2QkfF5jLy50ZXN0KGRvY3VtZW50LnJlYWR5U3RhdGUpKSl7XG5cdFx0XHRcdFx0b25sb2FkKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9ubG9hZCk7XG5cdFx0XHRcdFx0ZG9jdW1lbnRbX2FkZEV2ZW50TGlzdGVuZXJdKCdET01Db250ZW50TG9hZGVkJywgdGhyb3R0bGVkQ2hlY2tFbGVtZW50cyk7XG5cdFx0XHRcdFx0c2V0VGltZW91dChvbmxvYWQsIDIwMDAwKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKGxhenlzaXplcy5lbGVtZW50cy5sZW5ndGgpe1xuXHRcdFx0XHRcdGNoZWNrRWxlbWVudHMoKTtcblx0XHRcdFx0XHRyQUYuX2xzRmx1c2goKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aHJvdHRsZWRDaGVja0VsZW1lbnRzKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRjaGVja0VsZW1zOiB0aHJvdHRsZWRDaGVja0VsZW1lbnRzLFxuXHRcdFx0dW52ZWlsOiB1bnZlaWxFbGVtZW50LFxuXHRcdFx0X2FMU0w6IGFsdExvYWRtb2RlU2Nyb2xsTGlzdG5lcixcblx0XHR9O1xuXHR9KSgpO1xuXG5cblx0dmFyIGF1dG9TaXplciA9IChmdW5jdGlvbigpe1xuXHRcdHZhciBhdXRvc2l6ZXNFbGVtcztcblxuXHRcdHZhciBzaXplRWxlbWVudCA9IHJBRkl0KGZ1bmN0aW9uKGVsZW0sIHBhcmVudCwgZXZlbnQsIHdpZHRoKXtcblx0XHRcdHZhciBzb3VyY2VzLCBpLCBsZW47XG5cdFx0XHRlbGVtLl9sYXp5c2l6ZXNXaWR0aCA9IHdpZHRoO1xuXHRcdFx0d2lkdGggKz0gJ3B4JztcblxuXHRcdFx0ZWxlbS5zZXRBdHRyaWJ1dGUoJ3NpemVzJywgd2lkdGgpO1xuXG5cdFx0XHRpZihyZWdQaWN0dXJlLnRlc3QocGFyZW50Lm5vZGVOYW1lIHx8ICcnKSl7XG5cdFx0XHRcdHNvdXJjZXMgPSBwYXJlbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NvdXJjZScpO1xuXHRcdFx0XHRmb3IoaSA9IDAsIGxlbiA9IHNvdXJjZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xuXHRcdFx0XHRcdHNvdXJjZXNbaV0uc2V0QXR0cmlidXRlKCdzaXplcycsIHdpZHRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZighZXZlbnQuZGV0YWlsLmRhdGFBdHRyKXtcblx0XHRcdFx0dXBkYXRlUG9seWZpbGwoZWxlbSwgZXZlbnQuZGV0YWlsKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHQvKipcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlbGVtIHtFbGVtZW50fVxuXHRcdCAqIEBwYXJhbSBkYXRhQXR0clxuXHRcdCAqIEBwYXJhbSBbd2lkdGhdIHsgbnVtYmVyIH1cblx0XHQgKi9cblx0XHR2YXIgZ2V0U2l6ZUVsZW1lbnQgPSBmdW5jdGlvbiAoZWxlbSwgZGF0YUF0dHIsIHdpZHRoKXtcblx0XHRcdHZhciBldmVudDtcblx0XHRcdHZhciBwYXJlbnQgPSBlbGVtLnBhcmVudE5vZGU7XG5cblx0XHRcdGlmKHBhcmVudCl7XG5cdFx0XHRcdHdpZHRoID0gZ2V0V2lkdGgoZWxlbSwgcGFyZW50LCB3aWR0aCk7XG5cdFx0XHRcdGV2ZW50ID0gdHJpZ2dlckV2ZW50KGVsZW0sICdsYXp5YmVmb3Jlc2l6ZXMnLCB7d2lkdGg6IHdpZHRoLCBkYXRhQXR0cjogISFkYXRhQXR0cn0pO1xuXG5cdFx0XHRcdGlmKCFldmVudC5kZWZhdWx0UHJldmVudGVkKXtcblx0XHRcdFx0XHR3aWR0aCA9IGV2ZW50LmRldGFpbC53aWR0aDtcblxuXHRcdFx0XHRcdGlmKHdpZHRoICYmIHdpZHRoICE9PSBlbGVtLl9sYXp5c2l6ZXNXaWR0aCl7XG5cdFx0XHRcdFx0XHRzaXplRWxlbWVudChlbGVtLCBwYXJlbnQsIGV2ZW50LCB3aWR0aCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciB1cGRhdGVFbGVtZW50c1NpemVzID0gZnVuY3Rpb24oKXtcblx0XHRcdHZhciBpO1xuXHRcdFx0dmFyIGxlbiA9IGF1dG9zaXplc0VsZW1zLmxlbmd0aDtcblx0XHRcdGlmKGxlbil7XG5cdFx0XHRcdGkgPSAwO1xuXG5cdFx0XHRcdGZvcig7IGkgPCBsZW47IGkrKyl7XG5cdFx0XHRcdFx0Z2V0U2l6ZUVsZW1lbnQoYXV0b3NpemVzRWxlbXNbaV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciBkZWJvdW5jZWRVcGRhdGVFbGVtZW50c1NpemVzID0gZGVib3VuY2UodXBkYXRlRWxlbWVudHNTaXplcyk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0XzogZnVuY3Rpb24oKXtcblx0XHRcdFx0YXV0b3NpemVzRWxlbXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGxhenlTaXplc0NmZy5hdXRvc2l6ZXNDbGFzcyk7XG5cdFx0XHRcdGFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGRlYm91bmNlZFVwZGF0ZUVsZW1lbnRzU2l6ZXMpO1xuXHRcdFx0fSxcblx0XHRcdGNoZWNrRWxlbXM6IGRlYm91bmNlZFVwZGF0ZUVsZW1lbnRzU2l6ZXMsXG5cdFx0XHR1cGRhdGVFbGVtOiBnZXRTaXplRWxlbWVudFxuXHRcdH07XG5cdH0pKCk7XG5cblx0dmFyIGluaXQgPSBmdW5jdGlvbigpe1xuXHRcdGlmKCFpbml0LmkgJiYgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSl7XG5cdFx0XHRpbml0LmkgPSB0cnVlO1xuXHRcdFx0YXV0b1NpemVyLl8oKTtcblx0XHRcdGxvYWRlci5fKCk7XG5cdFx0fVxuXHR9O1xuXG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHRpZihsYXp5U2l6ZXNDZmcuaW5pdCl7XG5cdFx0XHRpbml0KCk7XG5cdFx0fVxuXHR9KTtcblxuXHRsYXp5c2l6ZXMgPSB7XG5cdFx0LyoqXG5cdFx0ICogQHR5cGUgeyBMYXp5U2l6ZXNDb25maWdQYXJ0aWFsIH1cblx0XHQgKi9cblx0XHRjZmc6IGxhenlTaXplc0NmZyxcblx0XHRhdXRvU2l6ZXI6IGF1dG9TaXplcixcblx0XHRsb2FkZXI6IGxvYWRlcixcblx0XHRpbml0OiBpbml0LFxuXHRcdHVQOiB1cGRhdGVQb2x5ZmlsbCxcblx0XHRhQzogYWRkQ2xhc3MsXG5cdFx0ckM6IHJlbW92ZUNsYXNzLFxuXHRcdGhDOiBoYXNDbGFzcyxcblx0XHRmaXJlOiB0cmlnZ2VyRXZlbnQsXG5cdFx0Z1c6IGdldFdpZHRoLFxuXHRcdHJBRjogckFGLFxuXHR9O1xuXG5cdHJldHVybiBsYXp5c2l6ZXM7XG59XG4pKTtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIvKiBnbG9iYWwgbG9jYWxTdG9yYWdlICAqL1xuaW1wb3J0IGRvY1NlbGVjdG9yQWxsIGZyb20gJy4vZG9jdW1lbnQtcXVlcnktc2VsZWN0b3ItYWxsJ1xuXG5leHBvcnQgZGVmYXVsdCBlbCA9PiB7XG4gIGNvbnN0ICR0b2dnbGVUaGVtZSA9IGRvY1NlbGVjdG9yQWxsKGVsKVxuXG4gIGlmICghJHRvZ2dsZVRoZW1lLmxlbmd0aCkgcmV0dXJuXG5cbiAgY29uc3Qgcm9vdEVsID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XG5cbiAgJHRvZ2dsZVRoZW1lLmZvckVhY2goaXRlbSA9PiBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4gICAgaWYgKCFyb290RWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdkYXJrJykpIHtcbiAgICAgIHJvb3RFbC5jbGFzc0xpc3QuYWRkKCdkYXJrJylcbiAgICAgIGxvY2FsU3RvcmFnZS50aGVtZSA9ICdkYXJrJ1xuICAgIH0gZWxzZSB7XG4gICAgICByb290RWwuY2xhc3NMaXN0LnJlbW92ZSgnZGFyaycpXG4gICAgICBsb2NhbFN0b3JhZ2UudGhlbWUgPSAnbGlnaHQnXG4gICAgfVxuICB9KSlcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICBjb25zdCBwYXJlbnQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGRvY3VtZW50XG5cbiAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHBhcmVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSwgMClcbn1cbiIsIi8qKlxuICogaGFwdGljLWZlZWRiYWNrLmpzXG4gKlxuICogQXR0YWNoZXMgd2ViLWhhcHRpY3MgZmVlZGJhY2sgdG8gYW55IGVsZW1lbnQgdmlhIGEgYHRhcmdldHNgIGFycmF5LlxuICogRWFjaCB0YXJnZXQgbWFwcyBhIENTUyBzZWxlY3RvciDihpIgYSBuYW1lZCBoYXB0aWMgcHJlc2V0ICgrIG9wdGlvbmFsIGV2ZW50KS5cbiAqXG4gKiBVc2VzIGEgc2luZ2xlIGRlbGVnYXRlZCBsaXN0ZW5lciBvbiBgZG9jdW1lbnRgIOKAlCB3b3JrcyBhdXRvbWF0aWNhbGx5XG4gKiBmb3IgZWxlbWVudHMgYWRkZWQgbGF0ZXIgYnkgaW5maW5pdGUgc2Nyb2xsLCBubyByZS1pbml0IG5lZWRlZC5cbiAqXG4gKiDilIDilIDilIAgUHJlc2V0IHF1aWNrLXJlZmVyZW5jZSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbiAqXG4gKiAgXCJsaWdodFwiICAgICAgc2luZ2xlIHNob3J0IHRhcCAgICAg4oCUIG5hdiBsaW5rcywgdG9nZ2xlcywgbWlub3IgdGFwc1xuICogIFwibWVkaXVtXCIgICAgIG1vZGVyYXRlIHRhcCAgICAgICAgIOKAlCBidXR0b25zLCBjYXJkIGFjdGlvbnMgIChkZWZhdWx0KVxuICogIFwiaGVhdnlcIiAgICAgIHN0cm9uZyB0YXAgICAgICAgICAgIOKAlCBtYWpvciBhY3Rpb25zLCBkZXN0cnVjdGl2ZSBjb25maXJtc1xuICogIFwic29mdFwiICAgICAgIGN1c2hpb25lZCB0YXAgICAgICAgIOKAlCBzdWJ0bGUsIHJvdW5kZWQgZmVlbFxuICogIFwicmlnaWRcIiAgICAgIGNyaXNwIGhhcmQgdGFwICAgICAgIOKAlCBwcmVjaXNlLCBzbmFwcHkgZmVlbFxuICogIFwic2VsZWN0aW9uXCIgIHN1YnRsZSB0aWNrICAgICAgICAgIOKAlCBzbGlkZXJzLCBwaWNrZXJzLCBzdGVwcGVyc1xuICogIFwic3VjY2Vzc1wiICAgIHR3byBhc2NlbmRpbmcgdGFwcyAgIOKAlCBmb3JtIHNhdmVkLCBwYXltZW50IGNvbmZpcm1lZFxuICogIFwid2FybmluZ1wiICAgIHR3byB0YXBzICsgaGVzaXRhdGUgIOKAlCBkZXN0cnVjdGl2ZSBhY3Rpb24gYWhlYWRcbiAqICBcImVycm9yXCIgICAgICBmb3VyIHJhcGlkIHRhcHMgICAgICDigJQgdmFsaWRhdGlvbiBmYWlsLCBuZXR3b3JrIGVycm9yXG4gKiAgXCJudWRnZVwiICAgICAgc3Ryb25nICsgc29mdCB0YWlsICAg4oCUIHJlbWluZGVyIC8gYXR0ZW50aW9uIGdyYWJcbiAqICBcImJ1enpcIiAgICAgICBsb25nIHZpYnJhdGlvbiAgICAgICDigJQgcmFyZSwgaGlnaC1hdHRlbnRpb24gbW9tZW50c1xuICpcbiAqIOKUgOKUgOKUgCBVc2FnZSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbiAqXG4gKiAgIGltcG9ydCBpbml0SGFwdGljRmVlZGJhY2sgZnJvbSAnLi9hcHAvaGFwdGljLWZlZWRiYWNrJ1xuICpcbiAqICAgaW5pdEhhcHRpY0ZlZWRiYWNrKHtcbiAqICAgICB0YXJnZXRzOiBbXG4gKiAgICAgICB7IHNlbGVjdG9yOiAnYnV0dG9uJywgICAgICAgICAgICAgICBoYXB0aWM6ICdtZWRpdW0nICAgIH0sXG4gKiAgICAgICB7IHNlbGVjdG9yOiAnYVtocmVmXScsICAgICAgICAgICAgICBoYXB0aWM6ICdsaWdodCcgICAgIH0sXG4gKiAgICAgICB7IHNlbGVjdG9yOiAnLmtnLWF1ZGlvLXNlZWstc2xpZGVyJyxoYXB0aWM6ICdzZWxlY3Rpb24nLCBldmVudDogJ2NoYW5nZScgfSxcbiAqICAgICBdLFxuICogICAgIGV4Y2x1ZGU6IFsnW2Rpc2FibGVkXScsICcubm8taGFwdGljJ10sXG4gKiAgIH0pXG4gKi9cblxuaW1wb3J0IHsgaGFwdGljcyB9IGZyb20gJy4uL2xpYi9oYXB0aWMnXG5cbi8vIOKUgOKUgOKUgCBEZWZhdWx0cyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuY29uc3QgREVGQVVMVF9DT05GSUcgPSB7XG4gIHRhcmdldHM6IFtcbiAgICB7IHNlbGVjdG9yOiAnYnV0dG9uJywgICAgICAgICAgICAgICAgICBoYXB0aWM6ICdtZWRpdW0nICAgIH0sXG4gICAgeyBzZWxlY3RvcjogJ2FbaHJlZl0nLCAgICAgICAgICAgICAgICAgaGFwdGljOiAnaGVhdnknICAgICB9LFxuICAgIHsgc2VsZWN0b3I6ICcuaGxhJywgICAgICAgICAgICAgICAgICAgIGhhcHRpYzogJ2xpZ2h0JyAgICAgfSxcblxuICAgIC8vIFtkYXRhLWdob3N0LXNlYXJjaF0gY2xpY2tzIGFyZSBoYW5kbGVkIGJ5IG1laWxpc2VhcmNoLmpzIChjYXB0dXJlIHBoYXNlKVxuICAgIC8vIHNvIHRoZXkgbmV2ZXIgcmVhY2ggdGhpcyBidWJibGUtcGhhc2UgbGlzdGVuZXIuIExpc3RlZCBoZXJlIG9ubHkgc28gdGhhdFxuICAgIC8vIGlmIE1laWxpU2VhcmNoIGlzIG5vdCBsb2FkZWQsIHRoZSBjbGljayBzdGlsbCBnZXRzIGEgaGFwdGljLlxuICAgIHsgc2VsZWN0b3I6ICdbZGF0YS1naG9zdC1zZWFyY2hdJywgICAgIGhhcHRpYzogJ251ZGdlJyAgICAgfSxcblxuICAgIHsgc2VsZWN0b3I6ICdbZGF0YS1oYXB0aWNdJywgICAgICAgICAgIGhhcHRpYzogJ21lZGl1bScgICAgfSxcbiAgICB7IHNlbGVjdG9yOiAnLmtnLWF1ZGlvLXNlZWstc2xpZGVyJywgICBoYXB0aWM6ICdzZWxlY3Rpb24nLCBldmVudDogJ2NoYW5nZScgfSxcbiAgICB7IHNlbGVjdG9yOiAnLmtnLWF1ZGlvLXZvbHVtZS1zbGlkZXInLCBoYXB0aWM6ICdzZWxlY3Rpb24nLCBldmVudDogJ2NoYW5nZScgfSxcbiAgXSxcbiAgZXhjbHVkZTogW1xuICAgICdbZGlzYWJsZWRdJyxcbiAgICAnW2FyaWEtZGlzYWJsZWQ9XCJ0cnVlXCJdJyxcbiAgICAnLm5vLWhhcHRpYycsXG4gIF0sXG59XG5cbi8vIOKUgOKUgOKUgCBJbml0IOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpbml0SGFwdGljRmVlZGJhY2sgKHVzZXJDb25maWcgPSB7fSkge1xuICBjb25zdCBjb25maWcgPSB7XG4gICAgZXhjbHVkZTogWy4uLkRFRkFVTFRfQ09ORklHLmV4Y2x1ZGUsIC4uLih1c2VyQ29uZmlnLmV4Y2x1ZGUgfHwgW10pXSxcbiAgICB0YXJnZXRzOiB1c2VyQ29uZmlnLnRhcmdldHNcbiAgICAgID8gWy4uLkRFRkFVTFRfQ09ORklHLnRhcmdldHMsIC4uLnVzZXJDb25maWcudGFyZ2V0c11cbiAgICAgIDogWy4uLkRFRkFVTFRfQ09ORklHLnRhcmdldHNdLFxuICB9XG5cbiAgY29uc3QgZXhjbHVkZVNlbGVjdG9yID0gY29uZmlnLmV4Y2x1ZGUuZmlsdGVyKEJvb2xlYW4pLmpvaW4oJywgJykgfHwgbnVsbFxuXG4gIGNvbnN0IGJ5RXZlbnQgPSB7fVxuICBmb3IgKGNvbnN0IHRhcmdldCBvZiBjb25maWcudGFyZ2V0cykge1xuICAgIGNvbnN0IGV2ZW50ID0gdGFyZ2V0LmV2ZW50IHx8ICdjbGljaydcbiAgICBpZiAoIWJ5RXZlbnRbZXZlbnRdKSBieUV2ZW50W2V2ZW50XSA9IFtdXG4gICAgYnlFdmVudFtldmVudF0ucHVzaCh0YXJnZXQpXG4gIH1cblxuICBmb3IgKGNvbnN0IFtldmVudCwgdGFyZ2V0c10gb2YgT2JqZWN0LmVudHJpZXMoYnlFdmVudCkpIHtcbiAgICBjb25zdCBwcmVzZXRNYXAgPSBuZXcgTWFwKClcbiAgICBmb3IgKGNvbnN0IHQgb2YgdGFyZ2V0cykgcHJlc2V0TWFwLnNldCh0LnNlbGVjdG9yLnRyaW0oKSwgdC5oYXB0aWMgfHwgJ21lZGl1bScpXG5cbiAgICBjb25zdCBjb21iaW5lZFNlbGVjdG9yID0gWy4uLnByZXNldE1hcC5rZXlzKCldLmpvaW4oJywgJylcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGZ1bmN0aW9uIGhhbmRsZUhhcHRpYyAoZSkge1xuICAgICAgY29uc3QgZWwgPSBlLnRhcmdldC5jbG9zZXN0KGNvbWJpbmVkU2VsZWN0b3IpXG4gICAgICBpZiAoIWVsKSByZXR1cm5cbiAgICAgIGlmIChleGNsdWRlU2VsZWN0b3IgJiYgZWwubWF0Y2hlcyhleGNsdWRlU2VsZWN0b3IpKSByZXR1cm5cblxuICAgICAgbGV0IHByZXNldCA9ICdtZWRpdW0nXG4gICAgICBmb3IgKGNvbnN0IFtzZWwsIHBdIG9mIHByZXNldE1hcCkge1xuICAgICAgICB0cnkgeyBpZiAoZWwubWF0Y2hlcyhzZWwpKSB7IHByZXNldCA9IHA7IGJyZWFrIH0gfSBjYXRjaCAoXykge31cbiAgICAgIH1cblxuICAgICAgLy8gZGF0YS1oYXB0aWM9XCJwcmVzZXRcIiBpbmxpbmUgb3ZlcnJpZGUg4oCUIGhpZ2hlc3QgcHJpb3JpdHlcbiAgICAgIGNvbnN0IGRhdGFQcmVzZXQgPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaGFwdGljJylcbiAgICAgIGlmIChkYXRhUHJlc2V0ICYmIGRhdGFQcmVzZXQudHJpbSgpKSBwcmVzZXQgPSBkYXRhUHJlc2V0LnRyaW0oKVxuXG4gICAgICBoYXB0aWNzLnRyaWdnZXIocHJlc2V0KVxuICAgIH0sIHsgcGFzc2l2ZTogdHJ1ZSB9KVxuICB9XG5cbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICBmb3IgKGNvbnN0IFtldmVudCwgdGFyZ2V0c10gb2YgT2JqZWN0LmVudHJpZXMoYnlFdmVudCkpIHtcbiAgICAgIGNvbnNvbGUuZGVidWcoXG4gICAgICAgIGBbaGFwdGljLWZlZWRiYWNrXSBcIiR7ZXZlbnR9XCIgbGlzdGVuZXIg4oaSYCxcbiAgICAgICAgdGFyZ2V0cy5tYXAodCA9PiBgJHt0LnNlbGVjdG9yfSAoJHt0LmhhcHRpYyB8fCAnbWVkaXVtJ30pYCkuam9pbignIHwgJylcbiAgICAgIClcbiAgICB9XG4gICAgaWYgKGV4Y2x1ZGVTZWxlY3RvcikgY29uc29sZS5kZWJ1ZygnW2hhcHRpYy1mZWVkYmFja10gRXhjbHVkaW5nOicsIGV4Y2x1ZGVTZWxlY3RvcilcbiAgfVxufSIsImV4cG9ydCBkZWZhdWx0IChjb3ZlckNsYXNzLCBoZWFkVHJhbnNwYXJlbnQpID0+IHtcbiAgY29uc3QgZG9tQm9keSA9IGRvY3VtZW50LmJvZHlcbiAgY29uc3QgaGFzQ292ZXIgPSBkb21Cb2R5LmNsb3Nlc3QoY292ZXJDbGFzcylcblxuICBpZiAoIWhhc0NvdmVyKSByZXR1cm5cblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgKCkgPT4ge1xuICAgIGNvbnN0IGxhc3RTY3JvbGxZID0gd2luZG93LnNjcm9sbFlcblxuICAgIGxhc3RTY3JvbGxZID49IDYwID8gZG9tQm9keS5jbGFzc0xpc3QucmVtb3ZlKGhlYWRUcmFuc3BhcmVudCkgOiBkb21Cb2R5LmNsYXNzTGlzdC5hZGQoaGVhZFRyYW5zcGFyZW50KVxuICB9LCB7IHBhc3NpdmU6IHRydWUgfSlcbn1cbiIsIlxuaW1wb3J0IGRvY1NlbGVjdG9yQWxsIGZyb20gJy4vZG9jdW1lbnQtcXVlcnktc2VsZWN0b3ItYWxsJ1xuXG5leHBvcnQgZGVmYXVsdCAoc29jaWFsTWVkaWFEYXRhLCBib3hTZWxlY3RvcikgPT4ge1xuICAvLyBjaGVjayBpZiB0aGUgYm94IGZvciB0aGUgbWVudSBleGlzdHNcbiAgY29uc3Qgbm9kZUJveCA9IGRvY1NlbGVjdG9yQWxsKGJveFNlbGVjdG9yKVxuXG4gIGlmICghbm9kZUJveC5sZW5ndGgpIHJldHVyblxuXG4gIGNvbnN0IHVybFJlZ2V4cCA9IHVybCA9PiAvKCgoW0EtWmEtel17Myw5fTooPzpcXC9cXC8pPykoPzpbXFwtOzomPVxcK1xcJCxcXHddK0ApP1tBLVphLXowLTlcXC5cXC1dK3woPzp3d3dcXC58W1xcLTs6Jj1cXCtcXCQsXFx3XStAKVtBLVphLXowLTlcXC5cXC1dKykoKD86XFwvW1xcK34lXFwvXFwuXFx3XFwtX10qKT9cXD8/KD86W1xcLVxcKz0mOyVAXFwuXFx3X10qKSM/KD86W1xcLlxcIVxcL1xcXFxcXHddKikpPykvLnRlc3QodXJsKSAvL2VzbGludC1kaXNhYmxlLWxpbmVcblxuICBjb25zdCBjcmVhdGVFbGVtZW50ID0gZWxlbWVudCA9PiB7XG4gICAgT2JqZWN0LmVudHJpZXMoc29jaWFsTWVkaWFEYXRhKS5mb3JFYWNoKChbbmFtZSwgdXJsVGl0bGVdKSA9PiB7XG4gICAgICBjb25zdCB1cmwgPSB1cmxUaXRsZVswXVxuXG4gICAgICAvLyBUaGUgdXJsIGlzIGJlaW5nIHZhbGlkYXRlZCBpZiBpdCBpcyBmYWxzZSBpdCByZXR1cm5zXG4gICAgICBpZiAoIXVybFJlZ2V4cCh1cmwpKSByZXR1cm5cblxuICAgICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKVxuICAgICAgbGluay5ocmVmID0gdXJsXG4gICAgICBsaW5rLnRpdGxlID0gdXJsVGl0bGVbMV1cbiAgICAgIGxpbmsuY2xhc3NMaXN0ID0gYGJ1dHRvbiBib3JkZXItbm9uZSBob3Zlcjp0ZXh0LSR7bmFtZX1gXG4gICAgICBsaW5rLnRhcmdldCA9ICdfYmxhbmsnXG4gICAgICBsaW5rLnJlbCA9ICdub29wZW5lciBub3JlZmVycmVyJ1xuICAgICAgbGluay5pbm5lckhUTUwgPSBgPHN2ZyBjbGFzcz1cImljb24gaWNvbi0tJHtuYW1lfVwiPjx1c2UgeGxpbms6aHJlZj1cIiNpY29uLSR7bmFtZX1cIj48L3VzZT48L3N2Zz5gXG5cbiAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQobGluaylcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIG5vZGVCb3guZm9yRWFjaChjcmVhdGVFbGVtZW50KVxufVxuIiwiLyogZ2xvYmFsIE00R2FsbGVyeSAqL1xuXG5pbXBvcnQgbG9hZFNjcmlwdCBmcm9tICcuL2xvYWQtc2NyaXB0J1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7XG4gIGlmIChNNEdhbGxlcnkgPT09IGZhbHNlKSByZXR1cm5cblxuICBpZiAod2luZG93LmlubmVyV2lkdGggPCA3NjgpIHJldHVyblxuXG4gIGNvbnN0ICRwb3N0Qm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwb3N0LWJvZHknKVxuXG4gIGlmICghJHBvc3RCb2R5KSByZXR1cm5cblxuICAvKiA8aW1nPiBTZXQgQXRyaWJ1dGUgKGRhdGEtc3JjIC0gZGF0YS1zdWItaHRtbClcbiAgLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuICAkcG9zdEJvZHkucXVlcnlTZWxlY3RvckFsbCgnaW1nJykuZm9yRWFjaChlbCA9PiB7XG4gICAgaWYgKGVsLmNsb3Nlc3QoJ2EnKSkgcmV0dXJuXG5cbiAgICBlbC5jbGFzc0xpc3QuYWRkKCdNNC1saWdodC1nYWxsZXJ5JylcbiAgICBlbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtc3JjJywgZWwuc3JjKVxuXG4gICAgY29uc3QgbmV4dEVsZW1lbnQgPSBlbC5uZXh0U2libGluZ1xuXG4gICAgaWYgKG5leHRFbGVtZW50ICE9PSBudWxsICYmIG5leHRFbGVtZW50Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdmaWdjYXB0aW9uJykge1xuICAgICAgZWwuc2V0QXR0cmlidXRlKCdkYXRhLXN1Yi1odG1sJywgbmV4dEVsZW1lbnQuaW5uZXJIVE1MKVxuICAgIH1cbiAgfSlcblxuICAvKiBMaWdodGdhbGxlcnlcbiAgLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuICBjb25zdCAkaW1nTGlnaHRHYWxsZXJ5ID0gJHBvc3RCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJy5NNC1saWdodC1nYWxsZXJ5JylcblxuICBpZiAoISRpbWdMaWdodEdhbGxlcnkubGVuZ3RoKSByZXR1cm5cblxuICBjb25zdCBsb2FkQ1NTID0gaHJlZiA9PiB7XG4gICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKVxuICAgIGxpbmsubWVkaWEgPSAncHJpbnQnXG4gICAgbGluay5yZWwgPSAnc3R5bGVzaGVldCdcbiAgICBsaW5rLmhyZWYgPSBocmVmXG4gICAgbGluay5vbmxvYWQgPSAoKSA9PiB7IGxpbmsubWVkaWEgPSAnYWxsJyB9XG4gICAgZG9jdW1lbnQuaGVhZC5pbnNlcnRCZWZvcmUobGluaywgZG9jdW1lbnQuaGVhZC5jaGlsZE5vZGVzW2RvY3VtZW50LmhlYWQuY2hpbGROb2Rlcy5sZW5ndGggLSAxXS5uZXh0U2libGluZylcbiAgfVxuXG4gIGxvYWRDU1MoJ2h0dHBzOi8vdW5wa2cuY29tL2xpZ2h0Z2FsbGVyeUAyLjEuOC9jc3MvbGlnaHRnYWxsZXJ5LmNzcycpXG5cbiAgbG9hZFNjcmlwdCgnaHR0cHM6Ly91bnBrZy5jb20vbGlnaHRnYWxsZXJ5QDIuMS44L2xpZ2h0Z2FsbGVyeS5taW4uanMnLCAoKSA9PiB7XG4gICAgd2luZG93LmxpZ2h0R2FsbGVyeSgkcG9zdEJvZHksIHtcbiAgICAgIHNwZWVkOiA1MDAsXG4gICAgICBzZWxlY3RvcjogJy5NNC1saWdodC1nYWxsZXJ5J1xuICAgIH0pXG4gIH0pXG59XG4iLCIvKiBnbG9iYWwgcHJpc21KcyAqL1xuXG5pbXBvcnQgbG9hZFNjcmlwdCBmcm9tICcuL2xvYWQtc2NyaXB0J1xuaW1wb3J0IGRvY1NlbGVjdG9yQWxsIGZyb20gJy4uL2FwcC9kb2N1bWVudC1xdWVyeS1zZWxlY3Rvci1hbGwnXG5cbmV4cG9ydCBkZWZhdWx0IChyb290ID0gZG9jdW1lbnQsIGNvZGVMYW5ndWFnZSkgPT4ge1xuICBjb25zdCAkY29kZUxhbmd1YWdlID0gKHJvb3QgJiYgcm9vdC5xdWVyeVNlbGVjdG9yQWxsKSA/IHJvb3QucXVlcnlTZWxlY3RvckFsbChjb2RlTGFuZ3VhZ2UpIDogZG9jU2VsZWN0b3JBbGwoY29kZUxhbmd1YWdlKVxuXG4gIGlmICgoISRjb2RlTGFuZ3VhZ2UgfHwgISRjb2RlTGFuZ3VhZ2UubGVuZ3RoKSAmJiB0eXBlb2YgcHJpc21KcyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVyblxuXG4gIC8vIFNob3cgTGFuZ3VhZ2VcbiAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbCgkY29kZUxhbmd1YWdlIHx8IFtdLCBlbGVtZW50ID0+IHtcbiAgICAvLyBJZGVtcG90ZW5jeVxuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdCAmJiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnanMtcHJpc20tcHJvY2Vzc2VkJykpIHJldHVyblxuXG4gICAgbGV0IGxhbmd1YWdlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykgfHwgJydcbiAgICBsYW5ndWFnZSA9IGxhbmd1YWdlLnNwbGl0KCctJylcbiAgICBpZiAoZWxlbWVudC5wYXJlbnRFbGVtZW50ICYmIGxhbmd1YWdlWzFdKSB7XG4gICAgICBlbGVtZW50LnBhcmVudEVsZW1lbnQuc2V0QXR0cmlidXRlKCdyZWwnLCBsYW5ndWFnZVsxXSlcbiAgICB9XG5cbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnanMtcHJpc20tcHJvY2Vzc2VkJylcbiAgfSlcblxuICAvLyBMb2FkIFByaXNtSnMgYW5kIFBsdWdpbiBMb2FmXG4gIGxvYWRTY3JpcHQocHJpc21Kcylcbn1cbiIsIi8qKlxuICogaWctc2hhcmUtc3RvcnkuanNcbiAqXG4gKiBcIkFkZCB0byBTdG9yeVwiIGJ1dHRvbiDigJQgc2hhcmVzIHRoZSBwb3N0J3MgZmVhdHVyZSBpbWFnZSB2aWEgdGhlXG4gKiBXZWIgU2hhcmUgQVBJIHNvIHRoZSB1c2VyIGNhbiBwYXN0ZSBpdCBpbnRvIGFuIEluc3RhZ3JhbSBTdG9yeS5cbiAqXG4gKiBVc2FnZSAoaW4gYSBHaG9zdCB0ZW1wbGF0ZSk6XG4gKiAgIDxkaXYgY2xhc3M9XCJpZy1zaGFyZS1yb290XCIgZGF0YS1pbWFnZT1cInt7ZmVhdHVyZV9pbWFnZX19XCI+PC9kaXY+XG4gKlxuICogQ29uZmlndXJhdGlvbjpcbiAqICAgU2V0IElDT05fVVJMIHRvIHRoZSBVUkwgb2YgdGhlIEluc3RhZ3JhbS1jYW1lcmEgaWNvbiB5b3Ugd2FudFxuICogICBkaXNwbGF5ZWQgaW4gdGhlIGNpcmN1bGFyIGJ1dHRvbiBjb250YWluZXIuXG4gKi9cblxuLy8g4pSA4pSA4pSAIENvbmZpZ3VyYXRpb24g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbmNvbnN0IElDT05fVVJMID0gJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBZ0FBQUFJQUNBUUFBQUJlY1J4eEFBQUFJR05JVWswQUFIb21BQUNBaEFBQStnQUFBSURvQUFCMU1BQUE2bUFBQURxWUFBQVhjSnk2VVR3QUFBQUNZa3RIUkFEL2g0L012d0FBQUFsd1NGbHpBQUFPd3dBQURzTUJ4MitvWkFBQUwrMUpSRUZVZU5ydDNYbThWMVc5Ly9IWE9YRGdNTStpRElvZ0tDS1Rvb2lTSTRrek9YWHJPbVJabXBWWk50aXRlelc3RFdyOUxEUExLVTAwYitJUWhpYk9tcGlvSUtBQ0Nxak1BakxQOC9mM0J4NFp6dlFkUG10Lzl2Qis3b2NQT2RQYTY3UDIzcC92MnROYVpVamFOS1lkYldtenkzOXRhVUZqbWxCSkpVMW9SRE1xYVA3SmIyOWc0NmQvdVpsMXJHVXpLOW5JQmxhem1hVXMrMlQ1bUtXczhRNU5ySlY1VjBCSzFJSE9kS0VUbmVqQ1BuUmxiem9FVzlkbWxyR0llY3hsUGd1WXczd1dzTm03QWFRVVNnREowNUdlSEVCUER1QUFEcUNsYTExeUxHSU83ekdER2N4a0JodThHMGNLb3dTUURKM29TMy82MG9jRGFPRmRtVnJsbU1jTVpqS05LYnpGS3UvcVNQMlVBT0tyTVgzcFIxLzYwWjkyM3BVcFdJNFBtY3dVSmpPRk9kNlZrZG9vQWNUUC9neGhNSU1aU0NQdnFoaFp3WnU4eW5qR3M4eTdLckk3SllDNGFNN2hER0V3UjdLWGQxV0N5VEdEOGJ6S3Y1bkdOdS9LQ0NnQitHdkNFSTduQkk2Z29YZFZJclNHZi9NOHp6R0o3ZDVWeVRZbEFDOE42Yzh3aGpHVVN1K3FPRnJMZUo3bFdkNGs1MTJWYkZJQ2lONStuTWJwSEVNejc0ckV5SHllNDJuR3N0eTdJbG1qQkJDZGNnWnlCcWR6cUZxOUZ0dVl6T09NWWFKM1JiSkR1MklVV2pHYzB6bUY5dDRWU1lpWi9JTW5lSm10M2hWSlB5V0FzRm95Z3M5elVtcHU2RVZwQldNWXhUTjYyRGdrSllCUW1qQ004emhiWi9vbFdza1lIbUlzVzd3cmtrNUtBUFoySFBwbmZmcStuWlJ1T1Uvd0VFL3FwTUNhRW9DbE1vYnlGYzdWb1IvSVI5elBQVXozcmthYUtBRlk2Y1NGWEVKUDcycGt3RVR1NDM0OVZHeERDYUIwalRtSkN6a3JVMC95ZWR2SUdPN2puM3FndUZSS0FLWHB3YmU1a0RiZTFjaW8yZHpOblN6eXJvWmtVd2Z1WkNzNUxhN0xKaDdnS085ZEliblVBeWpXbWR5ZHdMZjAwMm9TdDNFLzY3MnJJVm54MzJ4My8relRzdnV5bEJ2bzVyMWpTQmJjNEw2emE2bDUyY29vQm5udkhwSnUzM1hmemJYVXZUekxaNzEza3FUUU5ZQkNIY1ZMdXVHWEFHOXlJdy9yTm1GOWxBQUswNGpKOVBhdWhPVHBRMjdtVGwwYXJFc0Q3d29rekhjNDM3c0trcmMybk14WDJNd1U5UVJxb3g1QUlTcjVrTDI5S3lFRm04Y3Z1RnZ2RTlhazNMc0NpWEtXRHY5RTZzcHR6T0pTWGJ1cFRnbWdFQmQ0VjBDS3RpKzNNNDBMZE5LN081MEM1Szh4eXpTOFIrSk40Mm9lOTY1RWZLZ0hrTCsrT3Z4VDRHREc4Q3dEdktzUkYwb0ErVHZZdXdKaTVFUW1jZytkdmFzUkIwb0ErZHZIdXdKaXBweUxtY0gxenBPcng0QVNRUDdpT3kyM0ZLTXBWL01lWDgzMk1hQWJJL2xMNG4za0hNcy9YZGF4QW9DVjVJRFZiQVBXVWs1VG9Ea1ZRQnVnRWMyQVpyU2pQUjFvbC9MeERmZm1UaTdsRzB6d3JvZ1hKWUQ4cmZTdVFEMDJNb2U1ekdVdXMxbnk2V0ZmcXNhMG96M3RhRTk3T3JBdis5T05ybFI0QjJ2b2NGN2pkbjd5U1hyTUdOMEd6TjhJUm50WFlROExtTVowUHZ6a3NGOFMyWG9iMElWdWRHTi85cWNiM2VuaTNSQUdsbkExOTVLNUtVcVZBUEszTDNPOHF3Q3NZQnBUbWNaVTNtYXhkMlUrMFpLZTlPRXdEcU5mb3ErVWpPT2J2T1ZkaVdncEFSUmlOdnU1clhrOHIvRW03OFI4L3R3eXV0T1B2dlJsSUQyOEsxT0VyZHpDLzdET3V4clJVUUlveFAvanFralh0NVlwVEdRYy80ck5aMzBoT25JRWgzRTBRNm4wcmtwQlp2TTFudld1UkZTVUFBb3hnRW1SckdjQnp6S08xNWlXaXRkWW0zQTRRem1Lb3hJemZIcU9PL2docTcycklmSHpYTkNock5Zd2hpdFQrOFJoT1gzNEZrK3d6bjNJc0h5V3VaenMzV0FTUDRQWUZtQm4yOG9Fcm1jWWpiM0RpMFFsdzdpZUNlNkhlUDNMS0EzOExudTZ5M1FYVzhuOW5FTXI3NkJjZE9jYmpJbDVmMkFoWjNvM1UxaHB2d2JRbE1IMFpWOWFBQnVZdzFSZUwvR0JudVpNcEpkQnpaYndHSS95UEp1OW04aFpKY2R5SG1mUjFyc2l0YnFEcTdKMFh5QXRHdkVmakdWRERkM3RGN21zcEJkN2U3Q29wRStWdWR6T0dYb0djemNOR01yTmZPeitpVi96OGdGRHZCdElDbEhPVjVsVDV5WmR3WTlvVW5UNWg3S2txQjFwQVRjd0tQVzlydUkxNWt6dVo3WDdBVjk5MmNUVjJYNXBLRWw2TVM2dmpUcWpoRWtsZXpHMW9CMW9BLy9IeVJxT0tpOU5PSnNIYStpN2VTL1BwK0tSNTlRN2g1VjViOUl0Zkx2bzlUVGpEM25PRGZ3cVg2ZTFkN01rVGx1dTVCMzNnMzczWlJubmVqZUwxS1dTbXd2ZXFOZVdzTDVER1ZQbkpLSHorUlVIZVRkS29oM0YzYXgxUC9CM1hXNVAySE9OR1hJUVU0cmFwRmVXdE5ZRCtRVlRxcVdCQmR6Rlo5WGxOOUdLeTNuVC9jRGZ1VXhrZis4bXNaT2VDMUlYOEtjaUI2L1l5a204VU9MYTI5R1gvV2hMT2F0WXdIUm1lemRINmd6aWE1d2ZrMkZaVi9BbHhuaFhRblpxeEcwbDVmVFpLUi8zSmkxYWNTWHozWHNBT1hKczUrWlVEWXFTYUozNGQ4a2I5RmZlUVVpZUduRlJUQzRPdnFSaFl1UGdhQllhYk15MTdPVWRpT1N0ak5ONDNqMEI1RmpBWjd5Ykl1c3VaWlBSeHZ3djcxQ2tRQU1ZeVdibkZMQ0ZLN3liSWJzYWM3ZmhwbnpYT3h3cFFqZnVZb3R6RXJoRmozVjdhTWVMeGhzeWlVTllDWFRqOWp3ZnlRcTFQSk9Zb1U1U293OGZtRy9HaTcyRGtxTDFacVJyRXBoSmIrOG15SkpUV0JWZ0kvN0dPeXdwU1I5RzFmbGNadGhsTmFkN04wQldYQnJvck85djNvRkp5Zm94eWkwRmJPVnE3L0RUcndGL0NMWUJuL1lPVGt3Y3oyUzNKUEI3dlRRY1VtTWVETGp4eG5xSEowYkt1WWpGVGluZzBSTEdtWkE2dGVYbG9KdnVZZThBeFZCcnJtZWpTd3I0dDRZU0RXRS9wZ1hlY0wvekRsR005WFM2SWpDVnJ0NmhwODBoekF1KzJiN2lIYVFFTUl5M0hWTEFBdnA3QjU0bVF3c1k1YWY0SmEwVGNtUmRCZDl6R0h4OHVkNFRzSElDYXlMWVlMTzh3NVNBdXZOTTVDbGdBMmQ0aDUwRzU1aTk3bFAzOHIvZWdVcGc1MFUrN1BoV0x2QU9PdW0rSE5FRG5wdm83QjJxQk5lUmtaR25nSXU5ZzA2eUt5Tjd0UFAzM3FGS1JFNnRaOFlJNjJVNzMvSU9PYWwrR05sR1dreDc3MkFsTXMyNFBzZ1VyN1duZ085Nmg1eEVWMGU0Z1VaNEJ5c1JPNTY1a2ZZRGZ1UWRjTkw4SU1LTmM1MTNzT0tnRmZkSG1nS3U5dzQ0U2FJOC9HL1g2eHVaZFZHazh4RCsyanZjcFBqdnlEYkpkbjZXb3BrUnBIRGQ4cHhIMG1hNXhqdmNKSWp1MHQ5S3p2SU9WdHcxNUtjUmppWDBFKzl3NCs0YmtkMzRtNmd4QU9VVFJ6SXJzaFNnMGFmcmNHRmt0MmR1cDdGM3NCSWpyUmdkV1Fvb2JTN0tGRHNyb2dHZVYvRjU3MUFsZHNxNE9xSlRnZTE4MVR2WU9EbzFvbWYrSjZkcGJsY3hkVnhFNHdodDVUenZVT1BtYU5aSDB2Ui9wYWwzcUJKalhYa3RrdjF3RXlkN2h4b25CN01za3J5clVWdWxQbzI1TTVJVXNJNmgzcUhHUldkbVI5RGdIelBNTzFCSmlNc2pPUjFkcHNsRUFGcEZNb2p6MjNUekRsUVNaQWdMSXRnclo5UEpPMUJ2bGZ3cmdvWWVTeXZ2UUNWaE9qRXhrZyttMXQ2QmVpcm5rUWdhK1NZYWVBY3FDZFNjeHlQWU81L1A4aE1wTndadjNzMWM2aDJrSkZaRGJvOGdCWXpNNnZzb1h3bmV0R3M0eFR0SVNiZ3JJM2c2OVZydklEMGNHL3hLNjBjYzVoMmtwTUE1d1o5UjJjNzUza0ZHN1NDV0IyN1VXZlQwRGxKUzRzamdUd2h1WUloM2tGSHF3QWVCRy9SVmpmSW5oZzVnWnVBOWRoSDdlUWNabFFwZUN0eVlZL1hBcnhqYk8vZ1VZMi9Ud2p2SWFOd2F1Q0VmbzlJN1JFbWhOb3dQdk9lT3pzTHdkQmNGYnNUN2FPZ2RvcVJVYzU0UHZQZW1mdEN3SXdQUDJYNXJGbktvdUduS1UwSDMzKzJjNHgxaVNQc0Vmc0w2Rjk0QlN1bzE0dEdnKy9EcTlNNVNYY0VyUVp0TzAzdEtGQ3I0VzlEOWVEb3R2VU1NNDdkQm0wMFRMMGhVR3ZEbm9QdnlLTzhBUXpnejZIaS9PdndsU21YY0hUUUZYT0Vkb0xVZXJBellYSmw4bGxwY05lRC9BdTdSbXpuS08wQkxsVUhmcmY2dGQzaVNTUlg4SStCZVBUZE56N0xlRWJDaGJ2VU9Uaktya21jQzd0bVBwK1UxNFM4R2JLUy9wS1dSSkpHYUJuMnMvVHZlNFZub0d2Qzl2MGYxMUo4NGE4a2J3ZmJ2alF6MERxOVVEWGc1V1BNOFJTUHY4RVJvSC9BMW9abEpmMEhvMm1CTk00SG0zc0dKQUxCM3dKZUYvK3dkWENrT1ozT2dabm1manQ3QmlYeXFKeDhIU3dHSm5jbXlPVE1DTmNrU2Vua0hKN0tiSTFnWGFHOWZRVmZ2NElwelQ2QUdXYU94L2lTR3pnczJmT2pUU2J6WGRYcWd4dGpHQ08vUVJHcjBvMEQ3Zkk3THZVTXJWRHMrQ3RRVTMvWU9UYVJXb1VhN1dwZTBrOTVRejBuZjRSMllTQjBhOG1TZ1BmK1ZKTTF2OWJsQWpmQ2tIdnlSbUd2QnBFQjcvL2U4UTh2WFhpd0owZ0NaR1RWVkVxMUxvSEd2MW5HQWQyajVlVEJJK011VEVyNWszdUJBSTErK2FIODN3UDY4NGhSK0dhQkp0M01lcndVb043dmFNSkNqT0pyRDZFRkwxckhSdTBJcHNvQmxuQmFnM0c1OHhFVHY0T3JXTE5DY1B6LzBEaXhGRHVFRzN0NWpmS2J0VE9GNituaFhMVVhDREJxMkt1NFBCZDBjSk94SGt2Z2dSQ3dkdzNOMXR2VFRITzFkeFpSb0VtZ1FuTWU4QTZ2TEVXd05FUEk3TlBNT0xCWGFjbjhlcmIyZGUybmpYZFZVMkRmUSt3R3hmUkN1SVc4R0NIZE5lc2RKajlRZzV1VGQ1aDl5cUhkMVUrSEVJQitJYytQNkh1ejNnK1M3TDNxSGxRb25zcWFnVmwvTjhkNVZUb1VmQnprbWJ2UU9xeVo3QnhuM1Z5UCtXVGlpd01NL1I0NTE2UnFYMWtrWkR3YzRLcmJRM3p1dzZoNElFT2hrbW5pSGxRSWRpM3d2WXhIN2VGYzlCVm96TzhDUk1TNXVsOFdQRFREdHh5cTZlNGVWQ2s4WHZRWCs2VjMxVkJnYTVFckErZDVoN2FvaFV3S0VlSUYzV0tsUTJwak01M3BYUHhWK0h1RG8rQ2hPTXdoK04wQ0FxWndmTFhJTlNoeVZhV2FTM2tHTHJZYThHdUFJQ2ZIRWJWSDJDbkQ1NzBOYWVZZVZDdWVVdkNYTzhnNGhGYnF6MnZ3WTJVUlA3N0IyK0pONWFOczQxanVvbEJoVDhyYjR1M2NJS2ZIbEFIMkEwZDVCQWZSbWkzbGdQL2NPS2lXYUdyeVZ0a0YzWW96OExVQUtHT1lkRkR4aEh0UmtUZmhoNUVTVDdhRkhnbXkwTHVCWnpIeVhTWlNYVnFrUy81empPZFc0bWJad0NadU55OHlxZmlhbDlQVU9JeVZXY2pIYmpjc2M0UHVrYkhtQU41NSs0aGxReXR4aXNrVis3eDFHaXRoZkw1dE5wVjg0WHpJUDUzV04rbWRvcE1rMnVkYzdqQlJweVR6elkrYjdYc0dVZW8rNStySkpRMUtZZXNoa3F6emtIVWFxbkdtZUFKYVg4dnAyS2RjQVRqVy9EM2s5VTQxTEZJbVhmNWduMURaZWZRRHJzZituMDlnbmtOUlNEeUNPOW1hWjhaR3p0dmlwY292dkFaUXozTFJaY255VFRhWWxpc1RSSW41Z1hHSXpyaTcyVDR0UEFJY1lEeHgxSjgrYmxpY1NWL2Z3akhHSmx4YzdXR2p4Q2FDM2FRQ0xpczloSWdtVDQzTFdtNVpZV2V6dDgrSVRnTzN3eEQ5Z3BXbDVJbkgyUHRjWmwvZ1Y5aXZtejRwUEFKYlRkTDNNWDQyYlF5VGVmc3Q3cHVWVkZEZDNSdkVKSUdkVzlXMWNZVmlhU0JKc01aL3M4eEk2Ri81SHhTZUFWV1lWdjVVcHhrMGhFbjlQOEtScGVZMkxlUjZnK0FRdzI2amFpN25HdEJsRWt1SXF0cGlXOS9YQ2gzRXRQZ0c4WTFUcC96SHNTNGdreWJ2ODBiUzhTcTZNc3ZvV3M2QlAxY3MvQWVsSndMaHJZeng5MktwQ2g5SXI1VjJBTVFZTmNCVmJRN2F2U0t5dDRGclQ4bHJ5dGVncVA3VGtmRFUydXNwbWtub0E4ZGZBZUVqOStZV05wMVZLRDJBYzQwc0tmWnY1TTlFaVNiT05xMHpMNjF6WUdFR2xEUWxXMnROTWQvSzJhZWdpU2ZRY1Q1dVdkM1dVMDRZOVduUlhaYkZtb1E5T3B3REpjSVR4eEhvbjU3L3FVZ2NGdll5RlJmMWRqcSt4SXJvV0ZvbXgxM25jdEx3cm9xejhFYXd0SWtmOU9Nb3FacFo2QUVuUmwyMkdQWUR0SEpqdmlrdnRBY0Rybk0yNkF2L214dmpNYXlZU0EyK2J6c0JVeGplaXJmNFFGdWFkbmJZYVgvV1UycWtIa0J4OVRQc0FxL09kTzdqMEhnREFxd3pNOHl6bWZZN2xKcTgyRm9tdHFmek5zTFFXZkNuNkVFYlU4MGpEeC96WWN4S0RERklQSUVsNm1zNnlPVDNLbTRGVnloak8vVFZNRnI2RkYvZ3F6YnhiT0hPVUFKTGxic01Fa09NeithelM5bFdjSEUveEZBM29Sejk2MEp3SzFqS1g5M2l0NE11RUl0bnp2MXhvZUVSZXlzdmVBWWt2OVFDU3huSUs4UTIwclgrRk5oY0JSY1RDYnd6THF1VEMrbjlKQ1VBa1BpYndrbUZwbDliL0swb0FJbkh5L3d6TE9wZ2o2dnNWSlFDUk9IbWNhWWFsMWZzMGdCS0FTSnprK0oxaGFWK3NiOEpkSlFDUmVCbkpJck95Mm5CRzNiK2dCQ0FTTDV0TXh3cXU1eVJBQ1VBa2J2NW9PSFhveVhTczY4ZEtBQ0p4czR6N3pjcHF5SGwxL1ZnSlFDUis3alFzNnovcStxRVNnRWo4VEdDU1dWbEgxelZ4dUJLQVNCemRaVlpTV1YwbkFVb0FJbkgwVjhNTGdYV2NCQ2dCaU1UUktrYVpsVFdJSHJYOVNBbEFKSjdzVGdMZzdOcCtvQVFnRWsrdk1OV3NyTE5xKzRFU2dFaGMvZG1zcENQcFV2TVBsQUJFNG1va0c0MUtLcXZ0blFBbEFKRzRXc1lZczdKcU9RbFFBaENKcndmTlNqcU8xalY5V3dsQUpMNmVZTFZSU1JXY1ZOTzNsUUJFNG11ajRiekJwOVQwVFNVQWtUaXpleHpvMUpxT2RpVUFrVGdieXlxamt2YmkwT3JmVkFJUWliTk5QR1pXMXFuVnY1Vi9BbWhCUDRZd2xMNDFYMDBVa1NEczdnVFVjQldnL3BuSW1uSW1wM01NWFhmNTNnTEdNWlpIemE1UWlraHRubUVaN1V4S09wdzJyQ2prRC9iaXhocm0rcTFhMXZHbnVvWWFFSGVhR3pBZDdqS2JMM0JFL2lzdDQ5dDFIUHhWeTBhdW9aRjMrMGd0bEFEUzRXU3pCSEJMdnF0c3p6TjVGL3E2K2dFeHBRU1FEcFdzTTBvQTFXWWRxdmtpWUhkZVpWamUxVHVjOGZUMWJpT1IxTnJJaTBZbDlkN3pyY0NhRWtCWG51T0Fnb3JkbStmcDVkRXlJcG53cEZsSngrLytaZlVFVU1uZjZWWndzZTE1VXJjSFJRSjV3cXlreit6K1pmVUVjRDJIRlZWd2QvNFVhWk9JWk1lSHpEUXFxWjRFY0RoWEZGMzBGemc1MGtZUnlRNnJrNEFEMld2WEwvZE1BTDhzNmVIZ1gxTVdhYU9JWk1WWW8zTEtPR3JYTDNjLzNBOHI0TnAvVFE2cDZXbGpFU25aaTJiekJPeDJFckI3QXJpazVNSy9FbG1EaUdUSkJsNHlLcW5XQkZERzUwb3UvRFNhUmRjbUlobGlkUkxRbjhxZFgreWFBQTVtbjVJTGI4eVFTQnRGSkN0ZU1DcW5FUU4yZnJGckFqakNwUGppYmlLS1NOMm1zdHlvcEYyTzlGMFRnTTJoMjZQMElrU2ttdTI4WmxSU0xRbGdrRW5oYlNOckVKRnNlY1dvbkJvVFFFUDZtUlRlSk1JR0Vja1Nxd1J3d002UDZaMEpvSS9Sb2JzdTBpWVJ5WTdYMkd4U1R0bk95NEE3RThDaHhaUlVnNlZSdG9oSWhteGdzbEZKL2F2K3NUTUIyRndCZ0hlamF3K1JqQmxuVkU0TkNXQ2dVZEh2Uk5nY0l0bGlkUlZnUU5VL3FoSkFHUWViRkp6anpXaGJSQ1JEckJKQTc2cVJQS3NTUUJkYW1SUThpNVZSdDRsSVppem1BNU55R3RGN3h6K3FFa0Fmb3dwT2pMeEpSTEpra2xFNW54enhWUW5nRUtOaWxRQkVRbnJicUp4QVBZQUpFVGVIU0xhOFpWVE9IZ25BNmhMZzVLamJReVJUZ3ZRQXlxcStMTkZjWFFJVUNlb0QxcHFVMDVNS3FFb0FYV2hoVXVpMDBvc1FrVHBzTjNyU3BvTHVVSlVBckY3aDFVTkFJcUZablFRY0JOWUpRRDBBa2RDc0xnTUc2QUZNZFdnT2tXeXg2Z0dZSjRDY1hnUVNDVzRLT1pOeWRra0EzVTBLbk1zYXB5WVJ5WTZWTERRcHB3Zlk5Z0JtT1RXSVNMWjhhRkpLTjhwM0pJQzJ0REVwOEgzSEpoSEpEcHNFMEpqT094TEFma2JWVWc5QUpBcXpqY3JwdWlNQmREWXFUajBBa1NqTU5pcW5peEtBU1BMWW5BS1lKd0Nib1FwRXBHNVdDZUNUYXdDZFRBcGJxcHVBSXBHWXoxYVRjajY1QnRERnBMQUZqZzBpa2lWYm1XZFNqdWtwZ0JLQVNGUm1tNVRTY1VjQ0tIMVNjTURvNlNRUnFaL05WWUFPVUU1RG8razg1M3UyaDBpbXpERXBwUVZOeW1sTG1VbGg2Z0dJUk1WcUFyNE81YlF6S2tvSlFDUXFWZ2xncjNMYUd4VzF5S3N0UkRMSE1BRlk5UUNXZWJXRlNPWllIVzF0R3lvQkFFMFlRajk2MEpJbTNsVXhkYVJSS2FPOEF6RzFnZFhNNGkzR3M4RzdLa1d6NmdHMHNrb0FteFA2SEdBRFJuQXhKOUhZdXlJeDFvWHp2S3NReENhZTRpODh4bmJ2aWhUQjZ1TzJWYm5SVGNCa2Z2NS9rWGQ1aEROMCtHZFNZODdrVWFiemVlK0tGR0VqNjB6S2FWVnVOQ09BVlpja092dndOQTl3Z0hjMXhGa3ZIbVFzZTN0WG8yQTJSMXpyY3BxWkZMVGNzeTJLY0NTVCtheDNKU1FtaGpPWndkNlZLSkJOQW1oVlRuT1RncEoxQmVBRW5tVXY3MHBJakhUa09VN3dya1JCYkU2NlcxcjFBR3ptSzR2R0lFWWJSUzNwMFl6UkhPcGRpUUxZSklBbVZqMEFtMHNTVVdqRFEwYlhQU1JkV3ZCM28wdmlVYkM1aFZscDFRTklUZ0s0aFc3ZVZaQ1kycGVidkt1UXQ4MG1wV1N1QjNBTS8rbGRCWW14aXpqS3V3cDUybVJTU3BOeW8yZmZrcElBcmpWNjkxSFNxWXhydmF1UUo3TWVRRU9UZ3RaN3RrWGVEa25ZbFY2SjNrbjA4YTVDWG14NkFKVldDV0NMWjF2azdTTHZDa2dDWE9CZGdielk5QUFhV2lVQW0xRktRenZGdXdLU0FNbllTMndTUUlOeUdwZ1V0TTJ6TGZMVU5pR2RPL0hWajliZVZjaUR6U2xBZ3l6MUFIcnJBcURrb1l5RHZLdVFCN01lUUhZU3dMN2VGWkNFc0pvdU55U3pIb0ROS1VBU0VvQ2UvNVA4SkdGUHNla0JsSmNiZFl0em5tMGhZaW9KcDRwR1IxeTUwV2UzellsRVdNbDZZMUg4clBhdVFCNHFURXJaWXBVQWJLb1QxbHp2Q2toQzJFeTdFWmJORWJjMVN6MkE2VHBSa1R4czUxM3ZLdVJCQ2FCZ3k1bnFYUVZKZ0xkWTZWMkZQSmdsQUp1SGVKTndDZ0QvOUs2QUpNQ1QzaFhJUzh5dUFTU2hCd0QzZVZkQUV1Qis3d3JrSldhbkFNbVlVT01kbnZldWdzVGNVMHp6cmtKZUdwbVVzcldjalNZRkpXV012Wi9xUXFEVUljZDEzbFhJazgzRFNsdktqWWJ5U0VvQ2VKbS9lbGRCWXV4ZVh2V3VRcDVzRXNEYWNxUHhmRzBHRm92Q0ZYem9YUVdKcWJsOHo3c0tlV3RwVWtvR0U4Qkt6dE16Z1ZLRDFYd3VRUlBjMlBRQTFsZ2xnS1NjQWdCTTVLekVqR0VvVVZuSFdVenlya1FCWXBZQWt2RCsxRTdQTVl6RjNwV1FHRm5FQ1FtN1F4U3pVNERrVEtpd3czZ0c4clIzSlNRbW5tUUFyM3RYb2tBeDZ3RzA5MnlMb256RWNMN0FUTzlxaUxOM09aZFRFOWdmN0dCU3lwcHlvK2VlMnlYaUhlbzlQVWh2enVWeG85RlZKRmsyOGcvT3BnK1BlRmVrQ0Uyc2JnTTJOSnBrc0lLV3JQSnNrU0p0NHhFZW9TbEQ2RWNQV2hzOVh4VVhRK2hpVU1yOHhOd2J6ODhtVmpLTHR4aHZOTCtlQjV2UGYxZ09JOGlaTEQyODIwU3FlY2hreXo3a0hZWlVNOGpvcUQyem5LVkdWVXJlVlFDUnBOckxxSnlQN1JLQVZhZEVST3BqbFFDV2xCdGRBNEJPWG0waGtqbFdIN2RMeTFsdU5LdFBaNy9XRU1rWW00L2J6YXd1WnpzclRBcXp1TjRzSXZtd21lUm1DYmx5NENPVHd0UURFSW1LemR4RkgwTTVNTitrTVBVQVJLTFMxYVNVSlRzU3dBS1R3dFFERUlsR0U2T0xnUE1zZXdDdGFlWFlKQ0xac2EvUmcvZnpMSHNBME4ydFFVU3l4R3FlNjdtV1BRQTR3S2s1UkxLbG0xRTVwcWNBNkcwQWtVZ2NaRlNPZWdBaUNkVExwSlFjODNja2dKVkdReUdxQnlBU2hRTk5Tdm1ZRFRzU0FNd3lLVkE5QUpId0t0amZwSng1VUpVQTNqY3BzSFBDaGdZVlNhSWVSak54emdMYkJGREd3VTVOSXBJZE5pY0FNQU5zRXdEMGNXZ09rV3pwYlZUT0xnbkE1aHFBRW9CSWVQMk55bmtQbEFCRWttYUFVVGt6b1NvQkxHYTFTWkdIZUxTSFNJWTBvYWRKT1l0M1RBaXdJd0hrbUdaU2FHZmErTFNLU0ViMHBZRkpPVE4yL0svOGt5K25HbFh2ME1nYlJDUkxUSzhBMkNlQXd5SnVEcEZzNldkVXp2UWQvNnRLQU84WUZhc0VJQkxTUUtOeXB1ejRuM1VQWUZERXpTR1NKUlZtSjlsN0pJQ0ZSaThFN1UrN3lCdEZKQ3NHME1Ta25BVlZFd0tWZi9vdG16NUFtUzREaWdSenBGRTVVNnIrVVY3OVd5VTZJc0xtRU1tV3dVYmwxSkFBSmhvVmZYU0V6U0dTTFFGN0FCT01pajdhNkVFRkVkbGRCN05CZDk2cStzZk9CRENkZFNaRnQ5UUR3U0pCRERFcVovMk85d0JnMXdTd2pjbEd4ZXNrUUNTRTQ0ektlWU90VmY4czMrWGJkaWNCSW1MdmVLTnl4dS84NTY0SndPb3k0TkNJbWtNa1M5cWFQUWI4MnM1L2h1Z0I3S3Z4Z1VYTUhiUGIwVnFLMTNmK2M5Y2kzelY2R2hDR1JkUWtJdGxoZFFJd2Q5ZkpBSGROQURuK2JiU0tFeU5xRXBIc0NIQUZnRDA2RmE4WXJlSUVzODZLaUFEc1pYWjcvZlZkdndpVEFOcnBqUUFSVThPTnBnU0hWM2Y5WXZjRThEb2JqVmFpcXdBaWxrNDFLbWY5N2hmN2QwOEFtOHh1Qlo0UVFaT0laRVVEUG10VTBpdHMzdlhMUGMvVnh4bXRab2pSOUVVaUFrUE14dGw0YWZjdlF5V0E1cG9xVk1UTUtXWWx2Ymo3bDNzbWdKZllZclNpYmdHYlF5UmI3SzRBdkxIN04vWk1BR3QydjBsUWdyYUJtMFFrSzdxYURRYSt4eFVBYXJoZi82elJxaXFDTm9sSWRweHRkZ3Z3eFQyL0VTNEJyQW5YSGlLWmNwWlpTUy91K1kzcUNlQTFvME4zU2JqMkVNbVFqbWJ2MTY2b2ZvSmZQUUZzMmZOR1FaRnNaaHNVeWJyUG1RMnk5OVRPZ1VDcTFQVE12c1ZKd0F5ek53dEZzdTFzczVLZXJQNnRtaExBRXdhcmVqcFljNGhrU1d1emdjQzI4MVQxYjlhVUFHWVpQQkQ4UU1nMkVjbU1zMmxrVk5LYkxLNyt6WnBmMjcyMXhGVk4yZjJOSXhFcDBvVm1KZjJ6cG0vV25BQWVZRTVKcS9wNXdBWVJ5WTdPSEdOVzFwTTFmYlBtQkxDSjc1ZXdvaGQ1SkdpamlHVEZCV1pENnl6ZDh5SGdIV29yL21GR0ZibWlOVnhLTG5qRGlHVEIrV1lsaldaYlRkK3VQYjljVnRTZC9CeVg3SngxUkVSS01JQytabVU5V3ZPM2EwOEFLem1GdVFXdjVqczhGTHhaUkxMaEFyT1NWdk44elQrbzZ3eGpMa09aWHNCS3RuRVp2NCtrWVVUU3I4THdCR0FNbTJyK1FkMlhHT1l4bUwvbHVZb0ZmSlk3SW1vYWtmUWJ3ZDVtWlQxYXloK1A0SDF5ZFM1YnVKazIzdTBsMVR4VXozYkxiOUZKblkrblRMWmVqaHpyYUZaYVZScnlKVjZwcGZBbDNNUiszbTBsTlZJQ1NLNTkyV3FXQUI2dWZUWDVEZDI1bFh1NWwyNE01M0FPcGlOdFdNMHFQbUFTNC9oWDlUZU1SS1JFWHpON0I3REVFd0JKTHZVQWtxb2g4ODArLzlmU3ZQWVZhUW92a2ZnNWpjNW1aZjJkdGJYL1VBbEFKSDZ1TkN6ci9ycCtxQVFnRWplSG1JMEJBRXQ0cnE0Zkt3R0l4TTEzelVZQmhnZnF2a2l2QkNBU0wrMzVvbUZwZjYzN3gwb0FJdkh5ZFpxWWxUVno5N21BcTFNQ0VJbVRDcjV1V05wZjZ2c0ZKUUNST1BsUHd4dUFXNVVBUkpLa2pCOFlsdllFQyt2N0ZTVUFrZmdZUVIvRDB1NnMvMWVVQUVUaTQ0ZUdaYzFuYlAyL3BBUWdFaGNuTU1Td3RMdHJIZ1Z3ZDBvQUluSHhYNFpsYmVmdWZINU5DVUFrSG81Z21HRnB6K1EzdDRjU2dFZzgvTXkwdER4bjk4cHZRSkRDTldJdy9lbEZLNXF3aXNYTTVGVm1CRnFYU1BJZHpYREQwajZzZVNLdzZ1d1RRQm5EdVpnemFGcnRKM040a052NXdIeU5Jc24zdjZhbDNaelBCY0FRaHZObW5hT1RiT1d2ZFBXcFdnWnBSS0NrT01Gcy9KOGNPVmJUeWlPSU5qeVk1eGlsM3pCODNWRnFwd1NRRkMrWkpvQ2JQVUxveHdjRlZQRkJLcjNiUEFPVUFKTGhGTlBEZnhzOW93L2hTSllYV00wWGFyaEtJTGFVQUpLZ3ZKN1Q1a0tYZnhTMmNndTllTHpnaVVHT1k1VGh3TWNpU2ZVbEJwcVdGL24wZkUyWVdtU3VzcjN6S1h0U0R5RCttakRYOVBOL1VtSFgxeXg2QUwvaTRDTC84c2NNQ3QvQ0lqSDJmZU83WXI4Z0YyMEFmZGhTUXI2YW9OT0FnTlFEaUx1OVdHWDYrZjl1b1IvcHBmY0FyaTNwWWFMRHVDUnNDNHZFMkhXME5DM3ZSclpIRzBEWGtxY3cvRmp6Q2dlakhrQzhIVkpTNzduNk1vOUdoVmFoMUI3QUYwcnV3cmZudW5BdExCSmJaZnpCK0ZIOG05aGM2SitVbWdCT002ajI1ZlExYlFhUkpMaUFZMDNMVzU3UEVHQjdLaTBCTkdLd1FjVWJSbi9uVXNSWlMyNDBMdkdtdWlZQnJVMXBDYUNIMFFPOXgvR2Z4bzBoRW0vWHNiZHBlVXVMK3hndExRSHNaMWI5bTNRcFVES2tEOTgwTHZFRzFoVHpaNlVsZ0JabTFlL0lEYmJ0SVJKYjVkeEdoV21KaS9oanNWVXBoZVZMdlYvbE00YWxpY1RYMXhscVhPSXZXVi9jSDVhV0FGWWJobERHYllYZnhSUkpuRTc4d3JqRWhkeFY3SitXbGdEeUduYzBid2R6dFdsNUluRjBLNjJOUzd5T0RUNmhOR0tqNlpOTW0vUkVnQ2s5Q1JnLzU1a2VNVGx5ekNybGVrSnBQWUROdkdiYU9JMFlhWHh4Sk50c1BoZUtQTHVVR3JUaWQrWmwvb2d0eGY5eHFVOEM1am40Y040RzZEVEEwS29ZbFNJQXQ5REp1TVR4UE9JWlVCZTJHWGRvZEJwZzU3c21XK1RiM21Ha3h1Zk11Lzg1OC9zSkJjdHZKT0JDbG9uQnBpdkptaE5OdHNmeDNtR2tSQWNXbXg4ckQzc0hCWWVVL0VKdzljVjJrb1RzYW1wd2tYWURUYnpEU0lreDVzZkpaby94ZjZ1N3pUeXdiUnpuSFZSS2xMN1QvZDA3aEpUNG12bFI0alQrZjNWdFdXb2UybHk5RzJEaW5KSzN4T2U4UTBpRi9WbHRmb3lzb0wxM1dGVytGU0M3amZJT0toVWE4RjVKVzJHNjVvODIwSkJ4QVk2UUs3ekQycWtCa3dNRWVMNTNXS253aFpLMndUbmUxVStGWHdZNE90Nk8xNlh5NHdLRXVKSUR2TU5LaGFlSzNnTFdUM2xrMDNFQkxwTnZOeDVOeUlEOTdjQWNVM1FGMmtCSEZoYlYrb3ZZeDd2cUtiQlhrYTFmOXpMU082enF1ckltUUtCLzhnNHJGWTRvWXR1c1k0aDN0Vk9nTE1ETnZ4eXJ6WjhuTkhGVmdGQnpYT0FkVmlxY1dHQUtXTTBKM2xWT2hhdURIQlBmOFE2clpnMllFQ0RZTmZUMkRpd1ZEbU4yM20zK2dmRjBsVmwxdlBHNC96dVd0K0oxK1c5WGd3SmM3c2p4RnMyOEEwdUZOb3hrZTcydHZaMTd6TjlYejZhdUFSNzl6YkdObzcwRHE4dnZnblI1SGpVZGZDekxodkpNblMzOWxNNzhqVFRtdFNESFFreWUvcXROTXo0TUVyWmVFclp6Q05mejFoNTlnZTFNNFZmMDhhNWFpdHdSNURpWVl6Z1FMMkE3ck9jT0l4Z2RvRG0zY1JwUEJTZzN1OXB3RVB2U0NsakZYTjVsaFhlRlV1VWk3ZzFTN2dqKzRSMWEvUjRJa3Z1VzY3RWdTWWdqMlJEa0dIakFPN0Q4dEdOUmtQRGZOcDVLV1NTRXpzd1Bzdjh2WlMvdjBQSjFacEFHeURFMnZqZEFSQUJvSHVTOW1CdzVMdlFPclJCaFRnTnkzT0VkbUVnZHloa2RhTThmN1IxYVlkcnhVYUNHaU5GTGtDSjcrSFdndlg0SkhiMURLMVNJQVJCejVOaktxZDZoaWRUb0s0SDIrWVFPeTNKUG9NWllyUWRWSllaT1pGT2dQZjV1NzlDSzA2ekUwV2pxNmhEMThnNU9aRGVEZ3J3Tm15UEh2T1ErbWoySXpZRWFaVmJ5em9ra3hYb0V1dldkWTF1eWgyVy9KbEN6NUpoQWMrL2dSQURveVB2Qjl2UGZlQWRYbW5KZUROWTB6OUhZT3p3UldqQXg0TWRjSSsvd1N0V1Y1Y0dhNXhFOUdDVE9tdkJjc1AxN1ZUb2VmLzk4c0FiS2NhK0dyUlpIRlVHRy9LcGFVak11OXEwQkcra1Azc0ZKWmpYZ2J3SDM3THU4dzdQVE9NaGdZVlhMYjczRGswd3E0NjZBZS9WNzZickkzWjBWQVJ2ckd1L3dKSFBLK0dQQVBYb0QvYjBEdEhaR0h1UFJGYjljN3gyZVpFcFpvTUh2cXBaTHZBTU1JV3lUS1FWSVZNcTRPZWkrZkp0M2dHRlVCSHdtSUVlT0c3d0RsRXdvNHc5QjkrUHg2WDIrcFNQemdqYmRyNzBEbE5RcjUrNmcrL0JpdW5pSEdOSVJnVVpMcTFwdTBnRGlFbEFEL2hKMC85M0NjZDRoaG5aaDBBYk1jWitlRHBSQUdqRXE4TjU3bFhlSVVRaDdCcFhqTVNxOVE1UVVhczdUZ2ZmYy8vTU9NUm9WL0N0d1F6NnR5Y1RFV0Z2K0hYaXZuVWhUN3lDajBwNVpnUnZ6MzdUekRsSlNwQk52QmQ1akY2VDc0dCtlRGdyNGp1Q09aUlk5dllPVWxEaUlPWUgzMXZVYzdoMWsxSTROTm9KYTFiS1VvN3lEbEJRWXl0TEFlK3EyWkE3NldhcHdZNmhXTFdzNXd6dElTYmp6V0I5OFAvMmhkNUJlUW8yaXZuUFp3bVhlUVVxQ1hjbTI0UHZvWDd5RDlGUE9JOEdiTjhkTk5QQU9WQktvRWZkR3NIYytrL3hCdjBwUkdmeVdZSTRjVHlWM1lHVngwcFlYSXRnejM2U0ZkNkRlV2dXYlRISFhaUVlIZWdjcUNYSWcweVBZS3o5Z2IrOUE0NkJMOEpzc09YSXNUZmI0NmhLaDAxa1p3Ujc1c1Q2VXF2UmtTUVFOdm9XcjlhcVExS09NcXlPNDhKZGpIVU84UTQyVEkxZ2JRYVBuR0UwcjcxQWx4bHJ3YUNUNzRXWk84UTQxYmo3THhraWEvbDM2ZUljcU1kVW5ralAvSE52U00rQzNwWFBZRWtuenIrSXM3MUFsaGk2S3FCZTZYYyttMU9hQ1NNNitjdVM0UGIzRExra1JtbkI3Ukh0ZWp1OTdCeHRuWHc0NmR2Q3V5MFM5TENTZk9DajR1MzQ3bHg5N0J4dDMzNDVzVTZ6V21aZ0FGMGZVOWMrUjQrZmV3U2JCVHlMYkhEbityS0ZETXEwVjkwVzR0OTNzSFc1Uy9DRENqZklCbi9FT1Y1d01DenhLOWU3TExYb0tKWC9maTNERGJPWDZiTCtRa1VtVlhCL1pKZWNjT1c3VjRWK1lxeUxjT0RuZW9wOTN3QktoZnJ3ZDZmNmxlYXVLOE4xSU45RjZ2dVVkc0VTaUlWZEg5TkNaRHY4U2ZUdXltNEk3bG9kbzRoMnlCTmFmaVpIdVV6bXU5UTQ1eWI3TTFrZzMxc3UwOUE1WmdxbmtwMnlPK1BEL2IrK2drKzdNd0pPSjdibThvR2NFVTJvbzcwWjg4Ry9qY3UrZzArQjRWa2U2MlhTM05uM2FjSFBFZmNrY20vZ1A3N0RUWWtqd1dRUjJYYll6M0R0Z01WVEdSWkdNTjdIN3NsWjdrYVYrTEl4dzQ3MnI1d0pTb3gvaklqLzRjeXpUY0IvV09qTWx3ZzM0WmU5d3hVQUxmaHZSSythN0w3TTEyRmNJYlNNWlFYakg4clozc0ZLeVU1bnJjUERuZUNkYnMveEZxVEVQUkxZWkIzZ0hLeVVvNDJjUlAwTlN0VHl0UWVkQ0t1T25FVzNJLy9FT1ZZcFd4cTB1QjMrT3U2andEajc5cm9qa2hzNnozbUZLMFc1Mk9maTM4UVB2d0xOaU9DdUNiODZQdklPVUlsM3Njdml2NDJ6dndMT2tON09DYjFLOUY1QkUzU0orYkt6cTQrSnc3OEN6cGkzUEJkNm9IYjFEbENLTWNqajhKOURWTyt3c3F1QzJvSnQxSCs4QXBXQURIYTc5ajFSZjBjODNBNzdkMWR3N09DbllQUkVmL0Z2NGpuZklXWGMwQzRKczJoWGVnVW5CS2lNKy8xL0tNTytRQmZibXBRQWI5MVh2c0tSZ3AwWjYrTDlKTisrQVMxZnVYUUVEaXppUkc4Z1psL3F5ZDFoU3NLRVJybXNrUTVudEhYRHBHbnBYd01SV2ZzUWs3akk5YXg5YjBHKzNvZy9kYVUwWjY1blBlMm5ZTlJLb2YwVHJXYyszdU1jN1dObFRiOE1KbmhiUUlNKzFkdU1hM3FnMndQUUMvc3l3VlBTdmtpU2FrWDZuYW43cHVLbzBld2owUjNtdDd4QWVxbk5zK1huOFVpK0dSaWlLdC85R2FpNnBlRHVYbFNWdjVDVjV2TkZWeVcveWZOZjhGUzdWRzJLUm1CLzQ0Ri9MUmQ0aFN2MzJaM3lKRy9xcjlhNmpHMjhXVk9JR0htQjQzcWNWVXB5cFFRLy9TZlQyRGxEeVU4RU5KVXo3TktiZVNad09Mdkt6Wmo0M2M0eXVEQVR6VExDRGZ4czNhSmk0WkRtR0Q0dmExTy9SdHA2U3U1UjRycm1Va1p5aDk4WUQrRjJndzM4T3gzbUhGa3FhSnl4c3llOEtIdHR2SHNmVWN3dXZrdkVtdDV1V01wcUhlWjR0WHMwVEUyWDBaU2k5NlVvellBV3ptY3FMekNtcXJNL3pZSUFhUHNSbGVpNDBxVDVYMElEUVUvSVl6ZTIzcHA4dEszaUlTekk2aGx3SHp1YytGdGV5SmI1WHhJWFROdVp2aGl6alBPOW1rdEowNUxFOE4vWmROSzIzdEg2QlJwbDlpMTl6WWtibUpHcklVSDVldzdNVGV5NHIrUW1WQlpiOXFPbFcrUWVkdkJ0TExJemd2WG8yOWNROHovSkdCem44cTVhMWpPRUsrcWIwTW1FWnZibVVod29heldrR2d3cGF4NGxtMjJJSlgvUnVNTEZUem5rOFdlT245d1llem5zT2w1NGwzRnNvWkZuQjQvd1hRMVBTSTZoZ01GY3htbytMYW90TmZLbWd0YjFvc2dVZW9JTjNzMFVqelJjQnEydkRaeGpFL25Ta0FWdFl6RXplNEJYVzV2MzMxM0ZOcFBYZHhCdTh6Q3RNWUhIVVRXV2dIWWR4Tko5aGNCNm5WblhKY1NXMzVQM2IvWmhRNGgyV2ovZ1dqMGJTUXBJd1lSODBxV3RaeUJQOG5IUHBIdnVVdlM4aitDbWptV01ZL2ZhQ3V1UFhsTFNtMjdQMTFHYmNkNmM0YWMrU0dMVFhLaVl6aVduTTVMM1lqRnpjZ1Y3MDRpQU9aU0R0Z3F4aFBZTjVKOC9mTGVjeFRpOXFMVlA0SnE4RWFxT1k4dCtoaytQRTJNMFZzSVlaekdRRzd6R0REMWtXNFpwYnN6Kzk2TW1COUtJbmJTSlk0d1NPWkZ1ZXY5dVV4em0rd1BMWDhSdCt5ZVlJSW9rVkpZRDhmWTA3dkt0UXA0MHNZQ0h6K0loNUxHUWhIN0hDNUFHV1ZyUmhIL2FoQzUzcFJGZjJwbXVKWi9YRnVheUE5bS9LZlFXTjAvOEEzNDlOZnlwU1NnRDUrd0UzZWxlaENDdFl1Y3V5bWEyc0FYS3NCR0FWT1ZvRDBJcHlvRGtWVk5ENjA2VU5yV096ajh5bVZ3SFBUWmJ4Zlg2VzEzTUUwL2dXTDNnSEovSDNZN2RMZ0ZwMkxJWE92WE1nZjYrbnhNVjhOOXR2WmFUemtaTXcxbmhYSVBQT0wvRDMzK01zK25OSGpWZEhjcnpCNVhUbnQ5bCtHeU11M2Jza09JOVIzbFhJdU5XMFkyc1JmOWVBd1F6bVFMclNpQnpMK1pDM2VJRkYzdUhFZ1JKQS92cmtmU05LUWhuRVJPOHFwSXRPQWZMM0xzdTlxNUI1QjNsWElHMlVBUEszamVlOXE1QjUrM2xYSUcyVUFBcnhnSGNGTWs4ajhocFRBaWpFNDh6MXJvS0lKU1dBUW16aEJ1OHFaTndxN3dxa2pSSkFZZTVnaW5jVk1tMjJkd1hTUmdtZ01GdjVLcHU4SzVGaHVoRnJUQW1nVUJQNGpuY1ZNdXRqcG50WElXMDBWMDNoSnRDQVk3MHJrVW1qZU15N0NtbWpCRkNNRjFqUE1EMUZHYm52NlJxQU5lM0V4VHFGZTdNeWNHUk1UT0pRN3lxa2ozb0F4WnJGUGJSbWdLNmlST1l5Wm5oWElYM1VBeWhOZDc3REJaRU1pWlYxWXpqVHV3cHBwQVJRdXNhY3hJV2NSVVB2aXFUWUV2cnI5ZDBRbEFDczdNUG4rYkxKdEtHeXB3MThObXVqOVVaRkNjRFdZTDdFRjNSS1lHb0RaelBXdXhKcHBRUmdyNUlSZklIaE5QR3VTQ29zNWx6R2VWY2l2WlFBUW1uT2FaekRxWHFCdFNSUGNrazJoK3VXZEdqSzJUekFhdmZ4ZEpPNHZGM3dLTUJTTVBVQW9sREpTWnpMNmJvMmtLYzFQTTVJbmlMblhaSDBVd0tJVGdNR01JeGhIS2NiaHJYNmdNY1p3OHQ2NHpJcVNnRFJhOGNKRE9NME9udFhKRWFXOHh6UDhpVHp2Q3VTTlVvQVhzb1l5SENHY3lTTnZhdmlhQXNUZUpxeHZKSDN4SjlpU2duQVcwUDZNNVNqT1NIUXhOcnh0STdKak9NVi9xVkJ2bndwQWNSSGQ0WXhsS0hzNzEyUmdCYnpCdU40aGRlek54RjNQQ2tCeEU4M2ptSWdBeGxJVysrcUdGbkZKQ1l4aWRmMFBsL2NLQUhFV1NjTzQyRDZjQmk5RTdpbFZqQ05pVXhrSXRQWjdsMFpxVm55ZHF0c2FzOEErbkFnUGVsRjF4aHZ0UVhNWUNZem1NWWt2YjJYQlBIZGxhUTJUZWhKTDNyU2l3UHBTWHZuMnF4Z0pqTjRqNW5NWUNacnZSdEhDcU1Fa0hTTmFjYytkS2NUKzN6eTMzNEIzejlZd1FkOHhNSlAvM3VmbGQ0TklLVlFBa2lmTWpyUWh0YWZMbTArL2FvQjBKd0tvSkltUUVOYUFHdllDcXhuRTdDSjljQldWckdTRlovOHQyTlp3VW8rMXNPNWFmUC9BUXFvakJuMmtSN0tBQUFBR1hSRldIUlRiMlowZDJGeVpRQjNkM2N1YVc1cmMyTmhjR1V1YjNKbm0rNDhHZ0FBQUFCSlJVNUVya0pnZ2c9PScgICAvLyDihpAgcmVwbGFjZSB3aXRoIHlvdXIgaWNvbiBVUkxcblxuLy8g4pSA4pSA4pSAIExhbmd1YWdlIHN1cHBvcnQg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbmNvbnN0IHRyYW5zbGF0aW9ucyA9IHtcbiAgZXM6IHtcbiAgICBhZGRUb1N0b3J5OiAgICdBZ3JlZ2FyIGEgSGlzdG9yaWEnLFxuICAgIHNlbGVjdEFwcDogICAgJ1NlbGVjY2lvbmEgSW5zdGFncmFtJyxcbiAgICBlcnJvck1lc3NhZ2U6ICdFcnJvciBhbCBjb21wYXJ0aXIuIFBvciBmYXZvciBpbnRlbnRhIG51ZXZhbWVudGUuJyxcbiAgICBtb2JpbGVPbmx5OiAgICcoU29sbyBtw7N2aWwpJyxcbiAgfSxcbiAgZW46IHtcbiAgICBhZGRUb1N0b3J5OiAgICdBZGQgdG8gU3RvcnknLFxuICAgIHNlbGVjdEFwcDogICAgJ1NlbGVjdCBJbnN0YWdyYW0nLFxuICAgIGVycm9yTWVzc2FnZTogJ0Vycm9yIHNoYXJpbmcuIFBsZWFzZSB0cnkgYWdhaW4uJyxcbiAgICBtb2JpbGVPbmx5OiAgICcoTW9iaWxlIG9ubHkpJyxcbiAgfSxcbn1cblxuZnVuY3Rpb24gZ2V0TGFuZyAoKSB7XG4gIGNvbnN0IGxhbmcgPSAobmF2aWdhdG9yLmxhbmd1YWdlIHx8IG5hdmlnYXRvci51c2VyTGFuZ3VhZ2UgfHwgJ2VzJykuc2xpY2UoMCwgMilcbiAgcmV0dXJuIGxhbmcgPT09ICdlbicgPyAnZW4nIDogJ2VzJ1xufVxuXG4vLyDilIDilIDilIAgRGV2aWNlIGRldGVjdGlvbiDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuZnVuY3Rpb24gaXNNb2JpbGVEZXZpY2UgKCkge1xuICByZXR1cm4gKFxuICAgIC9Nb2JpfEFuZHJvaWR8aVBob25lfGlQYWR8aVBvZC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgfHxcbiAgICAobmF2aWdhdG9yLm1heFRvdWNoUG9pbnRzICYmIG5hdmlnYXRvci5tYXhUb3VjaFBvaW50cyA+IDEpXG4gIClcbn1cblxuLy8g4pSA4pSA4pSAIENTUyBjdXN0b20gcHJvcGVydHkgZm9yIHRoZSBpY29uIFVSTCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbi8vIFRoZSByZXN0IG9mIHRoZSBzdHlsZXMgbGl2ZSBpbiBfaWctc2hhcmUtc3Rvcnkuc2Nzcy5cblxuZnVuY3Rpb24gaW5qZWN0SWNvblZhciAoKSB7XG4gIGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaWctc2hhcmUtaWNvbi12YXInKSkgcmV0dXJuXG4gIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICBzdHlsZS5pZCA9ICdpZy1zaGFyZS1pY29uLXZhcidcbiAgc3R5bGUudGV4dENvbnRlbnQgPSBgOnJvb3QgeyAtLWlnLXNoYXJlLWljb24tdXJsOiB1cmwoJyR7SUNPTl9VUkx9Jyk7IH1gXG4gIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpXG59XG5cbi8vIOKUgOKUgOKUgCBCdXR0b24gcmVuZGVyaW5nIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG5mdW5jdGlvbiByZW5kZXJTaGFyZUJ1dHRvbiAocm9vdCwgaW1hZ2VVcmwsIGxhbmcpIHtcbiAgY29uc3QgdCA9IHRyYW5zbGF0aW9uc1tsYW5nXVxuXG4gIHJvb3QuaW5uZXJIVE1MID0gYFxuICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiaWctc2hhcmUtYnRuXCIgYXJpYS1sYWJlbD1cIiR7dC5hZGRUb1N0b3J5fVwiPlxuICAgICAgPGRpdiBjbGFzcz1cImlnLXNoYXJlLWJ0bl9faWNvblwiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImlnLXNoYXJlLWJ0bl9fdGV4dC13cmFwXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJpZy1zaGFyZS1idG5fX2xhYmVsXCI+JHt0LmFkZFRvU3Rvcnl9PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2J1dHRvbj5cbiAgYFxuXG4gIGNvbnN0IGJ1dHRvbiA9IHJvb3QucXVlcnlTZWxlY3RvcignYnV0dG9uJylcbiAgY29uc3QgaXNNb2JpbGUgPSBpc01vYmlsZURldmljZSgpXG5cbiAgaWYgKCFpc01vYmlsZSkge1xuICAgIGJ1dHRvbi5kaXNhYmxlZCA9IHRydWVcbiAgICBidXR0b24ucXVlcnlTZWxlY3RvcignLmlnLXNoYXJlLWJ0bl9fbGFiZWwnKS5pbm5lckhUTUwgPVxuICAgICAgYCR7dC5hZGRUb1N0b3J5fTxicj48c3BhbiBjbGFzcz1cImlnLXNoYXJlLWJ0bl9fbm90ZVwiPiR7dC5tb2JpbGVPbmx5fTwvc3Bhbj5gXG4gICAgcmV0dXJuXG4gIH1cblxuICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGJ1dHRvbi5jbGFzc0xpc3QuY29udGFpbnMoJ2lnLXNoYXJlLWJ0bi0tbG9hZGluZycpKSByZXR1cm5cblxuICAgIGNvbnN0IHRleHRXcmFwICAgICA9IGJ1dHRvbi5xdWVyeVNlbGVjdG9yKCcuaWctc2hhcmUtYnRuX190ZXh0LXdyYXAnKVxuICAgIGNvbnN0IG9yaWdpbmFsTGFiZWwgPSB0ZXh0V3JhcC5xdWVyeVNlbGVjdG9yKCcuaWctc2hhcmUtYnRuX19sYWJlbCcpXG4gICAgY29uc3QgbG9hZGluZ0xhYmVsICA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cbiAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgnaWctc2hhcmUtYnRuLS1sb2FkaW5nJylcbiAgICBsb2FkaW5nTGFiZWwuY2xhc3NOYW1lID0gJ2lnLXNoYXJlLWJ0bl9fbGFiZWwgaWctc2hhcmUtYnRuX19sYWJlbC0tZW50ZXInXG4gICAgbG9hZGluZ0xhYmVsLnRleHRDb250ZW50ID0gdC5zZWxlY3RBcHBcbiAgICB0ZXh0V3JhcC5hcHBlbmRDaGlsZChsb2FkaW5nTGFiZWwpXG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIG9yaWdpbmFsTGFiZWwuY2xhc3NMaXN0LmFkZCgnaWctc2hhcmUtYnRuX19sYWJlbC0tZXhpdCcpXG4gICAgICBvcmlnaW5hbExhYmVsLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSdcbiAgICB9LCAxMClcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgNzAwKSlcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChpbWFnZVVybCwgeyBtb2RlOiAnY29ycycgfSlcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcignSW1hZ2UgbG9hZCBmYWlsZWQnKVxuICAgICAgY29uc3QgYmxvYiA9IGF3YWl0IHJlc3BvbnNlLmJsb2IoKVxuICAgICAgY29uc3QgZmlsZSA9IG5ldyBGaWxlKFtibG9iXSwgJ2hpc3RvcmlhLnBuZycsIHsgdHlwZTogYmxvYi50eXBlIH0pXG5cbiAgICAgIGlmICghbmF2aWdhdG9yLmNhblNoYXJlIHx8ICFuYXZpZ2F0b3IuY2FuU2hhcmUoeyBmaWxlczogW2ZpbGVdIH0pKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIldlYiBTaGFyZSBBUEkgbm90IHN1cHBvcnRlZCBvciBjYW4ndCBzaGFyZSBmaWxlc1wiKVxuICAgICAgfVxuXG4gICAgICBhd2FpdCBuYXZpZ2F0b3Iuc2hhcmUoeyBmaWxlczogW2ZpbGVdIH0pXG5cbiAgICB9IGNhdGNoIChfZXJyKSB7XG4gICAgICBhbGVydCh0LmVycm9yTWVzc2FnZSlcblxuICAgIH0gZmluYWxseSB7XG4gICAgICBsb2FkaW5nTGFiZWwuY2xhc3NMaXN0LnJlbW92ZSgnaWctc2hhcmUtYnRuX19sYWJlbC0tZW50ZXInKVxuICAgICAgbG9hZGluZ0xhYmVsLmNsYXNzTGlzdC5hZGQoJ2lnLXNoYXJlLWJ0bl9fbGFiZWwtLWV4aXQnKVxuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGV4dFdyYXAucmVtb3ZlQ2hpbGQobG9hZGluZ0xhYmVsKVxuICAgICAgICBvcmlnaW5hbExhYmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2lnLXNoYXJlLWJ0bl9fbGFiZWwtLWV4aXQnKVxuICAgICAgICBvcmlnaW5hbExhYmVsLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnYXV0bydcbiAgICAgICAgYnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2lnLXNoYXJlLWJ0bi0tbG9hZGluZycpXG4gICAgICB9LCA0MDApXG4gICAgfVxuICB9KVxufVxuXG4vLyDilIDilIDilIAgUHVibGljIGluaXQg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGluaXRJZ1NoYXJlU3RvcnkgKCkge1xuICBpbmplY3RJY29uVmFyKClcbiAgY29uc3QgbGFuZyA9IGdldExhbmcoKVxuXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5pZy1zaGFyZS1yb290W2RhdGEtaW1hZ2VdJykuZm9yRWFjaChyb290ID0+IHtcbiAgICBjb25zdCBpbWFnZVVybCA9IHJvb3QuZ2V0QXR0cmlidXRlKCdkYXRhLWltYWdlJylcbiAgICBpZiAoaW1hZ2VVcmwpIHJlbmRlclNoYXJlQnV0dG9uKHJvb3QsIGltYWdlVXJsLCBsYW5nKVxuICB9KVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgKHNyYywgY2FsbGJhY2spID0+IHtcbiAgY29uc3Qgc2NyaXB0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpXG4gIHNjcmlwdEVsZW1lbnQuc3JjID0gc3JjXG4gIHNjcmlwdEVsZW1lbnQuZGVmZXIgPSB0cnVlXG4gIHNjcmlwdEVsZW1lbnQuYXN5bmMgPSB0cnVlXG5cbiAgY2FsbGJhY2sgJiYgc2NyaXB0RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgY2FsbGJhY2spXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0RWxlbWVudClcbn1cbiIsImV4cG9ydCBkZWZhdWx0IHNldHRpbmdzID0+IHtcbiAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICBzZWxlY3RvcjogJyNqcy1wcm9tby1wb3B1cCcsXG4gICAgc3RvcmFnZUtleTogJ200LXByb21vLWhpZGRlbicsXG4gICAgZGVsYXk6IDEwMDAsXG4gICAgLi4uc2V0dGluZ3NcbiAgfVxuXG4gIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKG9wdGlvbnMuc2VsZWN0b3IpXG4gIGlmICghZWxlbWVudCkgcmV0dXJuXG5cbiAgY29uc3QgbWVzc2FnZSA9IGVsZW1lbnQuZGF0YXNldC5tZXNzYWdlXG4gIGlmICghbWVzc2FnZSkgcmV0dXJuXG5cbiAgaWYgKHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKG9wdGlvbnMuc3RvcmFnZUtleSkgPT09IG1lc3NhZ2UpIHJldHVyblxuXG4gIGVsZW1lbnQuaW5uZXJIVE1MID0gYFxuICAgIDxkaXYgY2xhc3M9XCJwcm9tby1wb3B1cF9fY29udGVudFwiPlxuICAgICAgPHNwYW4gY2xhc3M9XCJwcm9tby1wb3B1cF9fbWVzc2FnZVwiPiR7bWVzc2FnZX08L3NwYW4+XG4gICAgICA8YnV0dG9uIGNsYXNzPVwicHJvbW8tcG9wdXBfX2J0biBqcy1wcm9tby1jbG9zZVwiPkRvbid0IHNob3cgYWdhaW48L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgYFxuXG4gIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLXZpc2libGUnKVxuICB9LCBvcHRpb25zLmRlbGF5KVxuXG4gIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgIGlmIChlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2pzLXByb21vLWNsb3NlJykpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy12aXNpYmxlJylcbiAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKG9wdGlvbnMuc3RvcmFnZUtleSwgbWVzc2FnZSlcbiAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHsgZWxlbWVudC5pbm5lckhUTUwgPSAnJyB9LCA1MDApXG4gICAgfVxuICB9KVxufVxuIiwiaW1wb3J0IGRvY1NlbGVjdG9yQWxsIGZyb20gJy4uL2FwcC9kb2N1bWVudC1xdWVyeS1zZWxlY3Rvci1hbGwnXG5cbi8qKlxuICogR2FsbGVyeSBjYXJkIHN1cHBvcnRcbiAqIFVzZWQgb24gYW55IGluZGl2aWR1YWwgcG9zdC9wYWdlXG4gKlxuICogRGV0ZWN0cyB3aGVuIGEgZ2FsbGVyeSBjYXJkIGhhcyBiZWVuIHVzZWQgYW5kIGFwcGxpZXMgc2l6aW5nIHRvIG1ha2Ugc3VyZVxuICogdGhlIGRpc3BsYXkgbWF0Y2hlcyB3aGF0IGlzIHNlZW4gaW4gdGhlIGVkaXRvci5cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCAocm9vdCA9IGRvY3VtZW50KSA9PiB7XG4gIGNvbnN0IGltYWdlcyA9IChyb290ICYmIHJvb3QucXVlcnlTZWxlY3RvckFsbCkgPyByb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy5rZy1nYWxsZXJ5LWltYWdlID4gaW1nJykgOiBkb2NTZWxlY3RvckFsbCgnLmtnLWdhbGxlcnktaW1hZ2UgPiBpbWcnKVxuXG4gIGlmICghaW1hZ2VzIHx8ICFpbWFnZXMubGVuZ3RoKSByZXR1cm5cblxuICBpbWFnZXMuZm9yRWFjaChpbWFnZSA9PiB7XG4gICAgLy8gSWRlbXBvdGVuY3k6IHNraXAgaW1hZ2VzIGFscmVhZHkgcHJvY2Vzc2VkXG4gICAgaWYgKGltYWdlLmNsYXNzTGlzdCAmJiBpbWFnZS5jbGFzc0xpc3QuY29udGFpbnMoJ2pzLWdhbGxlcnktcHJvY2Vzc2VkJykpIHJldHVyblxuXG4gICAgY29uc3QgY29udGFpbmVyID0gaW1hZ2UuY2xvc2VzdCgnLmtnLWdhbGxlcnktaW1hZ2UnKVxuICAgIGlmICghY29udGFpbmVyKSByZXR1cm5cblxuICAgIGNvbnN0IHdpZHRoID0gaW1hZ2UuYXR0cmlidXRlcy53aWR0aCAmJiBpbWFnZS5hdHRyaWJ1dGVzLndpZHRoLnZhbHVlXG4gICAgY29uc3QgaGVpZ2h0ID0gaW1hZ2UuYXR0cmlidXRlcy5oZWlnaHQgJiYgaW1hZ2UuYXR0cmlidXRlcy5oZWlnaHQudmFsdWVcbiAgICBpZiAoIXdpZHRoIHx8ICFoZWlnaHQpIHJldHVyblxuXG4gICAgY29uc3QgcmF0aW8gPSB3aWR0aCAvIGhlaWdodFxuICAgIGNvbnRhaW5lci5zdHlsZS5mbGV4ID0gcmF0aW8gKyAnIDEgMCUnXG5cbiAgICBpbWFnZS5jbGFzc0xpc3QuYWRkKCdqcy1nYWxsZXJ5LXByb2Nlc3NlZCcpXG4gIH0pXG59XG4iLCJleHBvcnQgZGVmYXVsdCBlbCA9PiB7XG4gIGNvbnN0ICRoZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsKVxuXG4gIGlmICghJGhlYWRlcikgcmV0dXJuXG5cbiAgLy8gR3VhcmQ6IC5qcy1zZWFyY2ggbWF5IG5vdCBleGlzdCBvbiBldmVyeSBwYWdlIHRlbXBsYXRlXG4gIGNvbnN0ICRzZWFyY2ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtc2VhcmNoJylcblxuICBsZXQgcHJldlNjcm9sbHBvcyA9IHdpbmRvdy5wYWdlWU9mZnNldFxuXG4gIC8vIElNUE9SVEFOVDogdXNlIGFkZEV2ZW50TGlzdGVuZXIsIG5vdCBgd2luZG93Lm9uc2Nyb2xsID0gLi4uYFxuICAvLyBBc3NpZ25pbmcgdG8gd2luZG93Lm9uc2Nyb2xsIGdldHMgc2lsZW50bHkgb3ZlcndyaXR0ZW4gYnkgYW55IG90aGVyXG4gIC8vIHNjcmlwdCAoaW5jbHVkaW5nIGluZmluaXRlLXNjcm9sbCkgdGhhdCBkb2VzIHRoZSBzYW1lIOKAlCB0aGlzIHdhcyB3aHlcbiAgLy8gc2Nyb2xsLWhpZGUtaGVhZGVyIHN0b3BwZWQgd29ya2luZyBhZnRlciBpbmZpbml0ZSBzY3JvbGwgd2FzIGFkZGVkLlxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGN1cnJlbnRTY3JvbGxQb3MgPSB3aW5kb3cucGFnZVlPZmZzZXRcblxuICAgIGlmIChwcmV2U2Nyb2xscG9zID4gY3VycmVudFNjcm9sbFBvcykge1xuICAgICAgLy8gU2Nyb2xsaW5nIHVwIOKAlCByZXZlYWwgaGVhZGVyXG4gICAgICAkaGVhZGVyLmNsYXNzTGlzdC5yZW1vdmUoJy10b3AtMTgnKVxuICAgICAgaWYgKCRzZWFyY2gpICRzZWFyY2guY2xhc3NMaXN0LmFkZCgnbXQtMTYnKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTY3JvbGxpbmcgZG93biDigJQgaGlkZSBoZWFkZXJcbiAgICAgICRoZWFkZXIuY2xhc3NMaXN0LmFkZCgnLXRvcC0xOCcpXG4gICAgICBpZiAoJHNlYXJjaCkgJHNlYXJjaC5jbGFzc0xpc3QucmVtb3ZlKCdtdC0xNicpXG4gICAgfVxuXG4gICAgcHJldlNjcm9sbHBvcyA9IGN1cnJlbnRTY3JvbGxQb3NcbiAgfSwgeyBwYXNzaXZlOiB0cnVlIH0pXG59IiwiZXhwb3J0IGRlZmF1bHQgKHJvb3QgPSBkb2N1bWVudCkgPT4ge1xuICAvKiBJZnJhbWUgU1JDIHZpZGVvICovXG4gIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICAnaWZyYW1lW3NyYyo9XCJwbGF5ZXIudmltZW8uY29tXCJdJyxcbiAgICAnaWZyYW1lW3NyYyo9XCJkYWlseW1vdGlvbi5jb21cIl0nLFxuICAgICdpZnJhbWVbc3JjKj1cInlvdXR1YmUuY29tXCJdJyxcbiAgICAnaWZyYW1lW3NyYyo9XCJ5b3V0dWJlLW5vY29va2llLmNvbVwiXScsXG4gICAgJ2lmcmFtZVtzcmMqPVwicGxheWVyLnR3aXRjaC50dlwiXScsXG4gICAgJ2lmcmFtZVtzcmMqPVwia2lja3N0YXJ0ZXIuY29tXCJdW3NyYyo9XCJ2aWRlby5odG1sXCJdJ1xuICBdXG5cbiAgLy8gVXNlIHJvb3QucXVlcnlTZWxlY3RvckFsbCB0byBzY29wZSB0aGUgc2VhcmNoXG4gIGNvbnN0IGlmcmFtZXMgPSByb290LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JzLmpvaW4oJywnKSlcblxuICBpZiAoIWlmcmFtZXMubGVuZ3RoKSByZXR1cm5cblxuICBpZnJhbWVzLmZvckVhY2goZWwgPT4ge1xuICAgIC8vIENoZWNrIGlmIGFscmVhZHkgcHJvY2Vzc2VkXG4gICAgaWYgKGVsLnBhcmVudE5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKCd2aWRlby1yZXNwb25zaXZlJykpIHJldHVyblxuXG4gICAgY29uc3QgcGFyZW50Rm9yVmlkZW8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHBhcmVudEZvclZpZGVvLmNsYXNzTmFtZSA9ICd2aWRlby1yZXNwb25zaXZlJ1xuICAgIGVsLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHBhcmVudEZvclZpZGVvLCBlbClcbiAgICBwYXJlbnRGb3JWaWRlby5hcHBlbmRDaGlsZChlbClcbiAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoJ2hlaWdodCcpXG4gICAgZWwucmVtb3ZlQXR0cmlidXRlKCd3aWR0aCcpXG4gIH0pXG59IiwiLyoqXG4gKiBNYXRvbW8gQW5hbHl0aWNzICYgRW5nYWdlbWVudCBNYW5hZ2VyXG4gKiBIYW5kbGVzIFNQQS1saWtlIHBhZ2UgdHJhbnNpdGlvbnMgYW5kIHNjb3BlZCBzY3JvbGwgdHJhY2tpbmcuXG4gKlxuICog4pSA4pSA4pSAIFByZXJlbmRlcmluZyBndWFyZCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbiAqIFRoZSBTcGVjdWxhdGlvbiBSdWxlcyBBUEkgKHNwZWN1bGF0aW9uLXJ1bGVzLmpzKSBjdXJyZW50bHkgdXNlcyBgcHJlZmV0Y2hgLFxuICogd2hpY2ggZG9lcyBOT1QgZXhlY3V0ZSBKYXZhU2NyaXB0LCBzbyBNYXRvbW8gaXMgc2FmZSB0b2RheS5cbiAqXG4gKiBJZiB5b3UgZXZlciB1cGdyYWRlIHRvIGBwcmVyZW5kZXJgLCBKYXZhU2NyaXB0IERPRVMgcnVuIGluIHRoZSBiYWNrZ3JvdW5kIHRhYi5cbiAqIE1hdG9tbydzIG93biB0cmFja2luZyBzbmlwcGV0IChpbiB5b3VyIEdob3N0IHRlbXBsYXRlIC8gY29kZSBpbmplY3Rpb24pIHdvdWxkXG4gKiBmaXJlIGJlZm9yZSB0aGUgdXNlciBhY3R1YWxseSB2aWV3cyB0aGUgcGFnZSwgZG91YmxlLWNvdW50aW5nIHRoZSBwYWdldmlldy5cbiAqXG4gKiBUbyBmaXggdGhhdCBhdCB0aGUgc25pcHBldCBsZXZlbCwgd3JhcCBNYXRvbW8ncyB0cmFja1BhZ2VWaWV3IHB1c2ggbGlrZTpcbiAqXG4gKiAgIGlmIChkb2N1bWVudC5wcmVyZW5kZXJpbmcpIHtcbiAqICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwcmVyZW5kZXJpbmdjaGFuZ2UnLCAoKSA9PiB7XG4gKiAgICAgICBfcGFxLnB1c2goWyd0cmFja1BhZ2VWaWV3J10pXG4gKiAgICAgfSwgeyBvbmNlOiB0cnVlIH0pXG4gKiAgIH0gZWxzZSB7XG4gKiAgICAgX3BhcS5wdXNoKFsndHJhY2tQYWdlVmlldyddKVxuICogICB9XG4gKlxuICogVGhlIGB0cmFja1BhZ2VWaWV3YCBjYWxscyBpbnNpZGUgdGhpcyBjbGFzcyAodXNlZCBieSBpbmZpbml0ZSBzY3JvbGwpIGFyZVxuICogdHJpZ2dlcmVkIGJ5IHVzZXIgc2Nyb2xsIGFjdGlvbiBhbmQgYXJlIHRoZXJlZm9yZSBhbHJlYWR5IHNhZmUg4oCUIHRoZXkgb25seVxuICogZmlyZSBvbmNlIHRoZSBhcnRpY2xlIGlzIGFjdHVhbGx5IHZpc2libGUuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFuYWx5dGljc01hbmFnZXIge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgdGhpcy5jdXJyZW50UGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZVxuICAgIHRoaXMub2JzZXJ2ZXJzID0gbmV3IE1hcCgpXG4gIH1cblxuICAvKipcbiAgICogVHJhY2sgYSB2aXJ0dWFsIHBhZ2V2aWV3IGZvciBhbiBpbmZpbml0ZS1zY3JvbGwgYXJ0aWNsZSB0cmFuc2l0aW9uLlxuICAgKiBTYWZlIGZyb20gcHJlcmVuZGVyaW5nIGRvdWJsZS1jb3VudGluZzogdGhpcyBpcyBvbmx5IGNhbGxlZCBmcm9tIHRoZVxuICAgKiBJbmZpbml0ZVNjcm9sbCAnYXBwZW5kJyBldmVudCwgd2hpY2ggcmVxdWlyZXMgcmVhbCB1c2VyIHNjcm9sbCBhY3Rpb24uXG4gICAqL1xuICB0cmFja1BhZ2VWaWV3ICh1cmwsIHRpdGxlLCBwcmV2aW91c1VybCkge1xuICAgIGNvbnNvbGUuZGVidWcoJ1tBbmFseXRpY3NNYW5hZ2VyXSB0cmFja1BhZ2VWaWV3IGNhbGxlZCcsIHsgdXJsLCB0aXRsZSwgcHJldmlvdXNVcmwgfSlcblxuICAgIGlmICghd2luZG93Ll9wYXEpIHtcbiAgICAgIGNvbnNvbGUud2FybignW0FuYWx5dGljc01hbmFnZXJdIHdpbmRvdy5fcGFxIGlzIG5vdCBhdmFpbGFibGU7IHNraXBwaW5nIE1hdG9tbyBjYWxscycpXG4gICAgICB0aGlzLmN1cnJlbnRQYXRoID0gdXJsXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLmN1cnJlbnRQYXRoID0gdXJsXG5cbiAgICB0cnkge1xuICAgICAgd2luZG93Ll9wYXEucHVzaChbJ3NldFJlZmVycmVyVXJsJywgcHJldmlvdXNVcmxdKVxuICAgICAgd2luZG93Ll9wYXEucHVzaChbJ3NldEN1c3RvbVVybCcsIHVybF0pXG4gICAgICB3aW5kb3cuX3BhcS5wdXNoKFsnc2V0RG9jdW1lbnRUaXRsZScsIHRpdGxlXSlcbiAgICAgIHdpbmRvdy5fcGFxLnB1c2goWydzZXRHZW5lcmF0aW9uVGltZU1zJywgMF0pXG4gICAgICB3aW5kb3cuX3BhcS5wdXNoKFsndHJhY2tQYWdlVmlldyddKVxuICAgICAgd2luZG93Ll9wYXEucHVzaChbJ2VuYWJsZUxpbmtUcmFja2luZyddKVxuICAgICAgd2luZG93Ll9wYXEucHVzaChbJ01lZGlhQW5hbHl0aWNzOjpzY2FuRm9yTWVkaWEnXSlcbiAgICAgIGNvbnNvbGUuaW5mbygnW0FuYWx5dGljc01hbmFnZXJdIE1hdG9tbyB0cmFja1BhZ2VWaWV3IHB1c2hlZCcsIHsgdXJsLCB0aXRsZSB9KVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignW0FuYWx5dGljc01hbmFnZXJdIGVycm9yIHB1c2hpbmcgdG8gX3BhcScsIGVycilcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT2JzZXJ2ZSBhbiBhcnRpY2xlIGVsZW1lbnQgYW5kIGZpcmUgYSBcIlJlYWRcIiBldmVudCBvbmNlIHRoZSB1c2VyIGhhc1xuICAgKiBzcGVudCBtZWFuaW5nZnVsIHRpbWUgd2l0aCDiiaU1MCUgb2YgaXQgaW4gdmlldy5cbiAgICpcbiAgICogVGhpcyBpcyBhbHNvIHNhZmUgZnJvbSBwcmVyZW5kZXJpbmcgYmVjYXVzZSBJbnRlcnNlY3Rpb25PYnNlcnZlciBlbnRyaWVzXG4gICAqIGRvIG5vdCBmaXJlIHdoaWxlIHRoZSBwYWdlIGlzIGluIHRoZSBwcmVyZW5kZXJlZCAoYmFja2dyb3VuZCkgc3RhdGUg4oCUXG4gICAqIHRoZSBwYWdlIG11c3QgYmUgYWN0aXZlIGFuZCB2aXNpYmxlIGZvciBpbnRlcnNlY3Rpb25zIHRvIG9jY3VyLlxuICAgKi9cbiAgb2JzZXJ2ZUFydGljbGUgKGFydGljbGVFbGVtZW50LCB0aXRsZSkge1xuICAgIGNvbnNvbGUuZGVidWcoJ1tBbmFseXRpY3NNYW5hZ2VyXSBvYnNlcnZlQXJ0aWNsZSBjYWxsZWQnLCB7IHRpdGxlIH0pXG4gICAgaWYgKCFhcnRpY2xlRWxlbWVudCkgcmV0dXJuXG5cbiAgICBsZXQgaGFzUmVhZCAgICAgPSBmYWxzZVxuICAgIGxldCB0aW1lU3RhcnRlZCA9IDBcblxuICAgIGNvbnN0IFJFQURfVEhSRVNIT0xEX1BFUkNFTlQgPSAwLjVcbiAgICBjb25zdCBSRUFEX1RJTUVfTVMgICAgICAgICAgID0gMTAwMDBcblxuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IEludGVyc2VjdGlvbk9ic2VydmVyKChlbnRyaWVzKSA9PiB7XG4gICAgICBlbnRyaWVzLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgICBpZiAoZW50cnkuaXNJbnRlcnNlY3RpbmcgJiYgZW50cnkuaW50ZXJzZWN0aW9uUmF0aW8gPj0gUkVBRF9USFJFU0hPTERfUEVSQ0VOVCkge1xuICAgICAgICAgIGlmICghdGltZVN0YXJ0ZWQpIHRpbWVTdGFydGVkID0gRGF0ZS5ub3coKVxuXG4gICAgICAgICAgY29uc3QgZHdlbGxUaW1lID0gRGF0ZS5ub3coKSAtIHRpbWVTdGFydGVkXG4gICAgICAgICAgaWYgKGR3ZWxsVGltZSA+IFJFQURfVElNRV9NUyAmJiAhaGFzUmVhZCkge1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyUmVhZEV2ZW50KHRpdGxlKVxuICAgICAgICAgICAgaGFzUmVhZCA9IHRydWVcbiAgICAgICAgICAgIG9ic2VydmVyLnVub2JzZXJ2ZShhcnRpY2xlRWxlbWVudClcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGltZVN0YXJ0ZWQgPSAwXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSwge1xuICAgICAgdGhyZXNob2xkOiBbMCwgMC4yNSwgMC41LCAwLjc1LCAxXVxuICAgIH0pXG5cbiAgICBvYnNlcnZlci5vYnNlcnZlKGFydGljbGVFbGVtZW50KVxuICAgIHRoaXMub2JzZXJ2ZXJzLnNldChhcnRpY2xlRWxlbWVudCwgb2JzZXJ2ZXIpXG4gICAgY29uc29sZS5kZWJ1ZygnW0FuYWx5dGljc01hbmFnZXJdIEludGVyc2VjdGlvbk9ic2VydmVyIGF0dGFjaGVkIGZvciBhcnRpY2xlJywgeyB0aXRsZSB9KVxuICB9XG5cbiAgdHJpZ2dlclJlYWRFdmVudCAodGl0bGUpIHtcbiAgICBpZiAod2luZG93Ll9wYXEpIHtcbiAgICAgIHdpbmRvdy5fcGFxLnB1c2goWyd0cmFja0V2ZW50JywgJ0FydGljbGUnLCAnUmVhZCcsIHRpdGxlXSlcbiAgICB9XG4gICAgY29uc29sZS5sb2coYFtBbmFseXRpY3NdIE1hcmtlZCBhcyByZWFkOiAke3RpdGxlfWApXG4gIH1cblxuICBjbGVhbnVwICgpIHtcbiAgICB0aGlzLm9ic2VydmVycy5mb3JFYWNoKG9icyA9PiBvYnMuZGlzY29ubmVjdCgpKVxuICAgIHRoaXMub2JzZXJ2ZXJzLmNsZWFyKClcbiAgfVxufVxuIiwiLyoqXG4gKiBoYXB0aWMuanNcbiAqIENvcmUgaGFwdGljIGVuZ2luZSBwb3J0ZWQgZnJvbSB3ZWItaGFwdGljcyAoTUlUIMKpIGxvY2hpZSkuXG4gKiBodHRwczovL2dpdGh1Yi5jb20vbG9jaGllL3dlYi1oYXB0aWNzXG4gKlxuICogUHJlc2V0IHJlZmVyZW5jZSAoQXBwbGUgSElHIGFsaWduZWQpOlxuICpcbiAqIE5vdGlmaWNhdGlvbiAg4oaSIFwic3VjY2Vzc1wiICAgIHR3byBhc2NlbmRpbmcgdGFwcyDigJQgcG9zaXRpdmUgb3V0Y29tZVxuICogICAgICAgICAgICAgICDihpIgXCJ3YXJuaW5nXCIgICAgdHdvIHRhcHMgd2l0aCBoZXNpdGF0aW9uIOKAlCBjYXV0aW9uIGFoZWFkXG4gKiAgICAgICAgICAgICAgIOKGkiBcImVycm9yXCIgICAgICBmb3VyIHJhcGlkIGhhcnNoIHRhcHMg4oCUIGZhaWx1cmVcbiAqXG4gKiBJbXBhY3QgICAgICAgIOKGkiBcImxpZ2h0XCIgICAgICBzaW5nbGUgc2hvcnQgdGFwIOKAlCBtaW5vciBpbnRlcmFjdGlvblxuICogICAgICAgICAgICAgICDihpIgXCJtZWRpdW1cIiAgICAgbW9kZXJhdGUgdGFwIOKAlCBzdGFuZGFyZCBidXR0b24gcHJlc3NcbiAqICAgICAgICAgICAgICAg4oaSIFwiaGVhdnlcIiAgICAgIHN0cm9uZyB0YXAg4oCUIG1ham9yIHN0YXRlIGNoYW5nZVxuICogICAgICAgICAgICAgICDihpIgXCJzb2Z0XCIgICAgICAgY3VzaGlvbmVkIHRhcCDigJQgcm91bmRlZCBmZWVsXG4gKiAgICAgICAgICAgICAgIOKGkiBcInJpZ2lkXCIgICAgICBjcmlzcCBoYXJkIHRhcCDigJQgcHJlY2lzZSBmZWVsXG4gKlxuICogU2VsZWN0aW9uICAgICDihpIgXCJzZWxlY3Rpb25cIiAgc3VidGxlIHRpY2sg4oCUIHBpY2tlciAvIHNsaWRlciBzdGVwXG4gKlxuICogQ3VzdG9tICAgICAgICDihpIgXCJudWRnZVwiICAgICAgc3Ryb25nIHRhcCArIHNvZnQgdGFpbFxuICogICAgICAgICAgICAgICDihpIgXCJidXp6XCIgICAgICAgbG9uZyB2aWJyYXRpb25cbiAqL1xuXG4vLyDilIDilIDilIAgUGF0dGVybnMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0UGF0dGVybnMgPSB7XG4gIC8vIE5vdGlmaWNhdGlvblxuICBzdWNjZXNzOiAgIHsgcGF0dGVybjogW3sgZHVyYXRpb246IDMwLCBpbnRlbnNpdHk6IDAuNSB9LCB7IGRlbGF5OiA2MCwgIGR1cmF0aW9uOiA0MCwgaW50ZW5zaXR5OiAxICAgfV0gfSxcbiAgd2FybmluZzogICB7IHBhdHRlcm46IFt7IGR1cmF0aW9uOiA0MCwgaW50ZW5zaXR5OiAwLjggfSwgeyBkZWxheTogMTAwLCBkdXJhdGlvbjogNDAsIGludGVuc2l0eTogMC42IH1dIH0sXG4gIGVycm9yOiAgICAgeyBwYXR0ZXJuOiBbeyBkdXJhdGlvbjogNDAsIGludGVuc2l0eTogMC43IH0sIHsgZGVsYXk6IDQwLCAgZHVyYXRpb246IDQwLCBpbnRlbnNpdHk6IDAuNyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICB7IGRlbGF5OiA0MCwgIGR1cmF0aW9uOiA0MCwgaW50ZW5zaXR5OiAwLjkgfSwgeyBkZWxheTogNDAsIGR1cmF0aW9uOiA1MCwgaW50ZW5zaXR5OiAwLjYgfV0gfSxcbiAgLy8gSW1wYWN0XG4gIGxpZ2h0OiAgICAgeyBwYXR0ZXJuOiBbeyBkdXJhdGlvbjogMTUsIGludGVuc2l0eTogMC40IH1dIH0sXG4gIG1lZGl1bTogICAgeyBwYXR0ZXJuOiBbeyBkdXJhdGlvbjogMjUsIGludGVuc2l0eTogMC43IH1dIH0sXG4gIGhlYXZ5OiAgICAgeyBwYXR0ZXJuOiBbeyBkdXJhdGlvbjogMzUsIGludGVuc2l0eTogMSAgIH1dIH0sXG4gIHNvZnQ6ICAgICAgeyBwYXR0ZXJuOiBbeyBkdXJhdGlvbjogNDAsIGludGVuc2l0eTogMC41IH1dIH0sXG4gIHJpZ2lkOiAgICAgeyBwYXR0ZXJuOiBbeyBkdXJhdGlvbjogMTAsIGludGVuc2l0eTogMSAgIH1dIH0sXG4gIC8vIFNlbGVjdGlvblxuICBzZWxlY3Rpb246IHsgcGF0dGVybjogW3sgZHVyYXRpb246IDgsICBpbnRlbnNpdHk6IDAuMyB9XSB9LFxuICAvLyBDdXN0b21cbiAgbnVkZ2U6ICAgICB7IHBhdHRlcm46IFt7IGR1cmF0aW9uOiA4MCwgaW50ZW5zaXR5OiAwLjggfSwgeyBkZWxheTogODAsIGR1cmF0aW9uOiA1MCwgaW50ZW5zaXR5OiAwLjMgfV0gfSxcbiAgYnV6ejogICAgICB7IHBhdHRlcm46IFt7IGR1cmF0aW9uOiAxMDAwLCBpbnRlbnNpdHk6IDEgfV0gfSxcbn1cblxuLy8g4pSA4pSA4pSAIEludGVybmFsIGNvbnN0YW50cyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuY29uc3QgVE9HR0xFX01JTiAgID0gMTYgICAgLy8gbXMgYXQgaW50ZW5zaXR5IDEgKGV2ZXJ5IGZyYW1lKVxuY29uc3QgVE9HR0xFX01BWCAgID0gMTg0ICAgLy8gcmFuZ2UgYWJvdmUgbWluICAoMC41IOKJiCAxMDBtcylcbmNvbnN0IE1BWF9QSEFTRV9NUyA9IDEwMDAgIC8vIGJyb3dzZXIgaGFwdGljIHdpbmRvdyBsaW1pdFxuY29uc3QgUFdNX0NZQ0xFICAgID0gMjAgICAgLy8gbXMgcGVyIGludGVuc2l0eSBtb2R1bGF0aW9uIGN5Y2xlXG5cbi8vIOKUgOKUgOKUgCBJbnRlcm5hbCBoZWxwZXJzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG5mdW5jdGlvbiBub3JtYWxpemVJbnB1dCAoaW5wdXQpIHtcbiAgaWYgKGlucHV0ID09IG51bGwpIHJldHVybiB7IHZpYnJhdGlvbnM6IFt7IGR1cmF0aW9uOiAyNSwgaW50ZW5zaXR5OiAwLjcgfV0gfSAvLyBtZWRpdW0gZGVmYXVsdFxuICBpZiAodHlwZW9mIGlucHV0ID09PSAnbnVtYmVyJykgcmV0dXJuIHsgdmlicmF0aW9uczogW3sgZHVyYXRpb246IGlucHV0IH1dIH1cbiAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25zdCBwcmVzZXQgPSBkZWZhdWx0UGF0dGVybnNbaW5wdXRdXG4gICAgaWYgKCFwcmVzZXQpIHsgY29uc29sZS53YXJuKGBbd2ViLWhhcHRpY3NdIFVua25vd24gcHJlc2V0OiBcIiR7aW5wdXR9XCJgKTsgcmV0dXJuIG51bGwgfVxuICAgIHJldHVybiB7IHZpYnJhdGlvbnM6IHByZXNldC5wYXR0ZXJuLm1hcCh2ID0+ICh7IC4uLnYgfSkpIH1cbiAgfVxuICBpZiAoQXJyYXkuaXNBcnJheShpbnB1dCkpIHtcbiAgICBpZiAoIWlucHV0Lmxlbmd0aCkgcmV0dXJuIHsgdmlicmF0aW9uczogW10gfVxuICAgIGlmICh0eXBlb2YgaW5wdXRbMF0gPT09ICdudW1iZXInKSB7XG4gICAgICBjb25zdCB2aWJyYXRpb25zID0gW11cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXQubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgY29uc3QgZGVsYXkgPSBpID4gMCA/IGlucHV0W2kgLSAxXSA6IDBcbiAgICAgICAgdmlicmF0aW9ucy5wdXNoKHsgLi4uKGRlbGF5ID4gMCAmJiB7IGRlbGF5IH0pLCBkdXJhdGlvbjogaW5wdXRbaV0gfSlcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IHZpYnJhdGlvbnMgfVxuICAgIH1cbiAgICByZXR1cm4geyB2aWJyYXRpb25zOiBpbnB1dC5tYXAodiA9PiAoeyAuLi52IH0pKSB9XG4gIH1cbiAgaWYgKGlucHV0ICYmIGlucHV0LnBhdHRlcm4pIHJldHVybiB7IHZpYnJhdGlvbnM6IGlucHV0LnBhdHRlcm4ubWFwKHYgPT4gKHsgLi4udiB9KSkgfVxuICByZXR1cm4gbnVsbFxufVxuXG5mdW5jdGlvbiBtb2R1bGF0ZVZpYnJhdGlvbiAoZHVyYXRpb24sIGludGVuc2l0eSkge1xuICBpZiAoaW50ZW5zaXR5ID49IDEpIHJldHVybiBbZHVyYXRpb25dXG4gIGlmIChpbnRlbnNpdHkgPD0gMCkgcmV0dXJuIFtdXG4gIGNvbnN0IG9uVGltZSA9IE1hdGgubWF4KDEsIE1hdGgucm91bmQoUFdNX0NZQ0xFICogaW50ZW5zaXR5KSlcbiAgY29uc3Qgb2ZmVGltZSA9IFBXTV9DWUNMRSAtIG9uVGltZVxuICBjb25zdCByZXN1bHQgPSBbXVxuICBsZXQgcmVtYWluaW5nID0gZHVyYXRpb25cbiAgd2hpbGUgKHJlbWFpbmluZyA+PSBQV01fQ1lDTEUpIHsgcmVzdWx0LnB1c2gob25UaW1lLCBvZmZUaW1lKTsgcmVtYWluaW5nIC09IFBXTV9DWUNMRSB9XG4gIGlmIChyZW1haW5pbmcgPiAwKSB7XG4gICAgY29uc3QgcmVtT24gPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKHJlbWFpbmluZyAqIGludGVuc2l0eSkpXG4gICAgcmVzdWx0LnB1c2gocmVtT24pXG4gICAgY29uc3QgcmVtT2ZmID0gcmVtYWluaW5nIC0gcmVtT25cbiAgICBpZiAocmVtT2ZmID4gMCkgcmVzdWx0LnB1c2gocmVtT2ZmKVxuICB9XG4gIHJldHVybiByZXN1bHRcbn1cblxuZnVuY3Rpb24gdG9WaWJyYXRlUGF0dGVybiAodmlicmF0aW9ucywgZGVmYXVsdEludGVuc2l0eSkge1xuICBjb25zdCByZXN1bHQgPSBbXVxuICBmb3IgKGNvbnN0IHZpYiBvZiB2aWJyYXRpb25zKSB7XG4gICAgY29uc3QgaW50ZW5zaXR5ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgdmliLmludGVuc2l0eSA/PyBkZWZhdWx0SW50ZW5zaXR5KSlcbiAgICBjb25zdCBkZWxheSAgICAgPSB2aWIuZGVsYXkgPz8gMFxuICAgIGlmIChkZWxheSA+IDApIHtcbiAgICAgIGlmIChyZXN1bHQubGVuZ3RoICYmIHJlc3VsdC5sZW5ndGggJSAyID09PSAwKSByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdICs9IGRlbGF5XG4gICAgICBlbHNlIHsgaWYgKCFyZXN1bHQubGVuZ3RoKSByZXN1bHQucHVzaCgwKTsgcmVzdWx0LnB1c2goZGVsYXkpIH1cbiAgICB9XG4gICAgY29uc3QgbW9kdWxhdGVkID0gbW9kdWxhdGVWaWJyYXRpb24odmliLmR1cmF0aW9uLCBpbnRlbnNpdHkpXG4gICAgaWYgKCFtb2R1bGF0ZWQubGVuZ3RoKSB7XG4gICAgICBpZiAocmVzdWx0Lmxlbmd0aCAmJiByZXN1bHQubGVuZ3RoICUgMiA9PT0gMCkgcmVzdWx0W3Jlc3VsdC5sZW5ndGggLSAxXSArPSB2aWIuZHVyYXRpb25cbiAgICAgIGVsc2UgaWYgKHZpYi5kdXJhdGlvbiA+IDApIHJlc3VsdC5wdXNoKDAsIHZpYi5kdXJhdGlvbilcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIGZvciAoY29uc3Qgc2VnIG9mIG1vZHVsYXRlZCkgcmVzdWx0LnB1c2goc2VnKVxuICB9XG4gIHJldHVybiByZXN1bHRcbn1cblxuLy8g4pSA4pSA4pSAIFdlYkhhcHRpY3MgY2xhc3Mg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbmxldCBfaW5zdGFuY2VDb3VudGVyID0gMFxuXG5leHBvcnQgY2xhc3MgV2ViSGFwdGljcyB7XG4gIGNvbnN0cnVjdG9yIChvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLl9pZCAgICAgICA9ICsrX2luc3RhbmNlQ291bnRlclxuICAgIHRoaXMuX2RlYnVnICAgID0gb3B0aW9ucy5kZWJ1ZyA/PyBmYWxzZVxuICAgIHRoaXMuX2xhYmVsICAgID0gbnVsbFxuICAgIHRoaXMuX2RvbVJlYWR5ID0gZmFsc2VcbiAgICB0aGlzLl9yYWZJZCAgICA9IG51bGxcbiAgICB0aGlzLl9yZXNvbHZlICA9IG51bGxcbiAgfVxuXG4gIHN0YXRpYyBnZXQgaXNTdXBwb3J0ZWQgKCkge1xuICAgIHJldHVybiB0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbmF2aWdhdG9yLnZpYnJhdGUgPT09ICdmdW5jdGlvbidcbiAgfVxuXG4gIC8vIFRoZSBjaGVja2JveC1zd2l0Y2ggdHJpY2sgYmVsb3cgb25seSBwcm9kdWNlcyBhIHJlYWwgaGFwdGljIG9uIGlPUy9pUGFkT1MsXG4gIC8vIHdoZXJlIFNhZmFyaSBtYXBzIGEgPGlucHV0IHN3aXRjaD4gdG9nZ2xlIG9udG8gdGhlIG5hdGl2ZSBISUcgdGljay4gSXQgd2FzXG4gIC8vIHByZXZpb3VzbHkgZ2F0ZWQgb24gYCFpc1N1cHBvcnRlZGAsIHdoaWNoIGlzIEFMU08gdHJ1ZSBvbiBkZXNrdG9wIEZpcmVmb3hcbiAgLy8gYW5kIGRlc2t0b3AgU2FmYXJpIChuZWl0aGVyIGltcGxlbWVudHMgbmF2aWdhdG9yLnZpYnJhdGUpLiBPbiB0aG9zZSB0aGVcbiAgLy8gdHJpY2sgYnV5cyBub3RoaW5nIGFuZCBjb3N0cyBhIGxvdDogY2xpY2tpbmcgdGhlIGxhYmVsIGZvY3VzZXMgdGhlIGhpZGRlblxuICAvLyBjaGVja2JveCBhdCB0aGUgZW5kIG9mIDxib2R5Piwgd2hpY2ggc2Nyb2xscyB0aGUgZG9jdW1lbnQgdG8gdGhlIGJvdHRvbSBhbmRcbiAgLy8gc3RlYWxzIGZvY3VzIGZyb20gd2hhdGV2ZXIgdGhlIHJlYWRlciB3YXMgdXNpbmcgLS0gbm90YWJseSB0aGUgR2hvc3QgUG9ydGFsXG4gIC8vIHNpZ24taW4gaWZyYW1lLCB3aG9zZSBpbnB1dCB0aGVuIHNpbGVudGx5IHJlZnVzZXMgdHlwaW5nIGFuZCBwYXN0aW5nLlxuICBzdGF0aWMgZ2V0IF91c2VzU3dpdGNoRmFsbGJhY2sgKCkge1xuICAgIGlmICh0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJykgcmV0dXJuIGZhbHNlXG4gICAgY29uc3QgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50IHx8ICcnXG4gICAgLy8gaVBob25lL2lQb2QvaVBhZCwgcGx1cyBpUGFkT1MgMTMrIHdoaWNoIHJlcG9ydHMgaXRzZWxmIGFzIFwiTWFjaW50b3NoXCIuXG4gICAgcmV0dXJuIC9pUChob25lfG9kfGFkKS8udGVzdCh1YSkgfHxcbiAgICAgICAgICAgKC9NYWNpbnRvc2gvLnRlc3QodWEpICYmIChuYXZpZ2F0b3IubWF4VG91Y2hQb2ludHMgfHwgMCkgPiAxKVxuICB9XG5cbiAgYXN5bmMgdHJpZ2dlciAoaW5wdXQsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVJbnB1dChpbnB1dClcbiAgICBpZiAoIW5vcm1hbGl6ZWQpIHJldHVyblxuICAgIGNvbnN0IHsgdmlicmF0aW9ucyB9ID0gbm9ybWFsaXplZFxuICAgIGlmICghdmlicmF0aW9ucy5sZW5ndGgpIHJldHVyblxuXG4gICAgY29uc3QgZGVmYXVsdEludGVuc2l0eSA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIG9wdGlvbnMuaW50ZW5zaXR5ID8/IDAuNSkpXG5cbiAgICBmb3IgKGNvbnN0IHZpYiBvZiB2aWJyYXRpb25zKSB7XG4gICAgICBpZiAodmliLmR1cmF0aW9uID4gTUFYX1BIQVNFX01TKSB2aWIuZHVyYXRpb24gPSBNQVhfUEhBU0VfTVNcbiAgICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHZpYi5kdXJhdGlvbikgfHwgdmliLmR1cmF0aW9uIDwgMCB8fFxuICAgICAgICAgICh2aWIuZGVsYXkgIT09IHVuZGVmaW5lZCAmJiAoIU51bWJlci5pc0Zpbml0ZSh2aWIuZGVsYXkpIHx8IHZpYi5kZWxheSA8IDApKSkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1t3ZWItaGFwdGljc10gSW52YWxpZCB2aWJyYXRpb24gdmFsdWVzIOKAlCBza2lwcGluZy4nKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoV2ViSGFwdGljcy5pc1N1cHBvcnRlZCkge1xuICAgICAgbmF2aWdhdG9yLnZpYnJhdGUodG9WaWJyYXRlUGF0dGVybih2aWJyYXRpb25zLCBkZWZhdWx0SW50ZW5zaXR5KSlcbiAgICB9XG5cbiAgICAvLyBpT1MgLyBTYWZhcmk6IHVzZSB0aGUgY2hlY2tib3gtc3dpdGNoIHRyaWNrIChmaXJlcyBuYXRpdmUgSElHIGhhcHRpYylcbiAgICBpZiAoKCFXZWJIYXB0aWNzLmlzU3VwcG9ydGVkICYmIFdlYkhhcHRpY3MuX3VzZXNTd2l0Y2hGYWxsYmFjaykgfHwgdGhpcy5fZGVidWcpIHtcbiAgICAgIHRoaXMuX2Vuc3VyZURPTSgpXG4gICAgICBpZiAoIXRoaXMuX2xhYmVsKSByZXR1cm5cbiAgICAgIHRoaXMuX3N0b3BQYXR0ZXJuKClcbiAgICAgIGNvbnN0IGZpcnN0RGVsYXkgICAgICA9IHZpYnJhdGlvbnNbMF0/LmRlbGF5ID8/IDBcbiAgICAgIGNvbnN0IGZpcnN0Q2xpY2tGaXJlZCA9IGZpcnN0RGVsYXkgPT09IDBcbiAgICAgIGlmIChmaXJzdENsaWNrRmlyZWQpIHRoaXMuX3RpY2soKVxuICAgICAgYXdhaXQgdGhpcy5fcnVuUGF0dGVybih2aWJyYXRpb25zLCBkZWZhdWx0SW50ZW5zaXR5LCBmaXJzdENsaWNrRmlyZWQpXG4gICAgfVxuICB9XG5cbiAgY2FuY2VsICgpIHtcbiAgICB0aGlzLl9zdG9wUGF0dGVybigpXG4gICAgaWYgKFdlYkhhcHRpY3MuaXNTdXBwb3J0ZWQpIG5hdmlnYXRvci52aWJyYXRlKDApXG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICB0aGlzLl9zdG9wUGF0dGVybigpXG4gICAgaWYgKHRoaXMuX2xhYmVsKSB7IHRoaXMuX2xhYmVsLnJlbW92ZSgpOyB0aGlzLl9sYWJlbCA9IG51bGw7IHRoaXMuX2RvbVJlYWR5ID0gZmFsc2UgfVxuICB9XG5cbiAgX3N0b3BQYXR0ZXJuICgpIHtcbiAgICBpZiAodGhpcy5fcmFmSWQgIT09IG51bGwpIHsgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fcmFmSWQpOyB0aGlzLl9yYWZJZCA9IG51bGwgfVxuICAgIGlmICh0aGlzLl9yZXNvbHZlKSB7IHRoaXMuX3Jlc29sdmUoKTsgdGhpcy5fcmVzb2x2ZSA9IG51bGwgfVxuICB9XG5cbiAgX3J1blBhdHRlcm4gKHZpYnJhdGlvbnMsIGRlZmF1bHRJbnRlbnNpdHksIGZpcnN0Q2xpY2tGaXJlZCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIHRoaXMuX3Jlc29sdmUgPSByZXNvbHZlXG4gICAgICBjb25zdCBwaGFzZXMgID0gW11cbiAgICAgIGxldCBjdW11bGF0aXZlID0gMFxuICAgICAgZm9yIChjb25zdCB2aWIgb2YgdmlicmF0aW9ucykge1xuICAgICAgICBjb25zdCBpbnRlbnNpdHkgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCB2aWIuaW50ZW5zaXR5ID8/IGRlZmF1bHRJbnRlbnNpdHkpKVxuICAgICAgICBjb25zdCBkZWxheSAgICAgPSB2aWIuZGVsYXkgPz8gMFxuICAgICAgICBpZiAoZGVsYXkgPiAwKSB7IGN1bXVsYXRpdmUgKz0gZGVsYXk7IHBoYXNlcy5wdXNoKHsgZW5kOiBjdW11bGF0aXZlLCBpc09uOiBmYWxzZSwgaW50ZW5zaXR5OiAwIH0pIH1cbiAgICAgICAgY3VtdWxhdGl2ZSArPSB2aWIuZHVyYXRpb25cbiAgICAgICAgcGhhc2VzLnB1c2goeyBlbmQ6IGN1bXVsYXRpdmUsIGlzT246IHRydWUsIGludGVuc2l0eSB9KVxuICAgICAgfVxuICAgICAgY29uc3QgdG90YWxEdXJhdGlvbiA9IGN1bXVsYXRpdmVcbiAgICAgIGxldCBzdGFydFRpbWUgPSAwLCBsYXN0VG9nZ2xlVGltZSA9IC0xXG5cbiAgICAgIGNvbnN0IGxvb3AgPSB0aW1lID0+IHtcbiAgICAgICAgaWYgKCFzdGFydFRpbWUpIHN0YXJ0VGltZSA9IHRpbWVcbiAgICAgICAgY29uc3QgZWxhcHNlZCA9IHRpbWUgLSBzdGFydFRpbWVcbiAgICAgICAgaWYgKGVsYXBzZWQgPj0gdG90YWxEdXJhdGlvbikgeyB0aGlzLl9yYWZJZCA9IG51bGw7IHRoaXMuX3Jlc29sdmUgPSBudWxsOyByZXNvbHZlKCk7IHJldHVybiB9XG5cbiAgICAgICAgbGV0IHBoYXNlID0gcGhhc2VzWzBdXG4gICAgICAgIGZvciAoY29uc3QgcCBvZiBwaGFzZXMpIHsgaWYgKGVsYXBzZWQgPCBwLmVuZCkgeyBwaGFzZSA9IHA7IGJyZWFrIH0gfVxuXG4gICAgICAgIGlmIChwaGFzZS5pc09uKSB7XG4gICAgICAgICAgY29uc3QgaW50ZXJ2YWwgPSBUT0dHTEVfTUlOICsgKDEgLSBwaGFzZS5pbnRlbnNpdHkpICogVE9HR0xFX01BWFxuICAgICAgICAgIGlmIChsYXN0VG9nZ2xlVGltZSA9PT0gLTEpIHtcbiAgICAgICAgICAgIGxhc3RUb2dnbGVUaW1lID0gdGltZVxuICAgICAgICAgICAgaWYgKCFmaXJzdENsaWNrRmlyZWQpIHsgdGhpcy5fdGljaygpOyBmaXJzdENsaWNrRmlyZWQgPSB0cnVlIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKHRpbWUgLSBsYXN0VG9nZ2xlVGltZSA+PSBpbnRlcnZhbCkge1xuICAgICAgICAgICAgdGhpcy5fdGljaygpXG4gICAgICAgICAgICBsYXN0VG9nZ2xlVGltZSA9IHRpbWVcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcmFmSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcClcbiAgICAgIH1cbiAgICAgIHRoaXMuX3JhZklkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3ApXG4gICAgfSlcbiAgfVxuXG4gIC8vIEZpcmVzIHRoZSBzd2l0Y2ggdG9nZ2xlIHdpdGhvdXQgbGV0dGluZyBpdCBkaXN0dXJiIHRoZSBwYWdlLiBDbGlja2luZyBhXG4gIC8vIDxsYWJlbD4gZm9yd2FyZHMgdGhlIGNsaWNrIHRvIGl0cyBjaGVja2JveCwgd2hpY2ggRk9DVVNFUyB0aGF0IGNoZWNrYm94IC0tXG4gIC8vIGFuZCBmb2N1c2luZyBhbiBlbGVtZW50IHNjcm9sbHMgaXQgaW50byB2aWV3LiBCb3RoIGVmZmVjdHMgYXJlIHJlc3RvcmVkXG4gIC8vIHN5bmNocm9ub3VzbHkgaGVyZSBzbyB0aGUgcmVhZGVyIG5ldmVyIHNlZXMgdGhlbS5cbiAgX3RpY2sgKCkge1xuICAgIGlmICghdGhpcy5fbGFiZWwpIHJldHVyblxuICAgIGNvbnN0IGRvYyAgICA9IHRoaXMuX2xhYmVsLm93bmVyRG9jdW1lbnRcbiAgICBjb25zdCBwcmV2ICAgPSBkb2MuYWN0aXZlRWxlbWVudFxuICAgIGNvbnN0IHNjcm9sbCA9IHsgeDogd2luZG93LnNjcm9sbFgsIHk6IHdpbmRvdy5zY3JvbGxZIH1cbiAgICB0aGlzLl9sYWJlbC5jbGljaygpXG4gICAgaWYgKGRvYy5hY3RpdmVFbGVtZW50ICE9PSBwcmV2KSB7XG4gICAgICBpZiAocHJldiAmJiB0eXBlb2YgcHJldi5mb2N1cyA9PT0gJ2Z1bmN0aW9uJykgcHJldi5mb2N1cyh7IHByZXZlbnRTY3JvbGw6IHRydWUgfSlcbiAgICAgIGVsc2UgaWYgKGRvYy5hY3RpdmVFbGVtZW50ICYmIHR5cGVvZiBkb2MuYWN0aXZlRWxlbWVudC5ibHVyID09PSAnZnVuY3Rpb24nKSBkb2MuYWN0aXZlRWxlbWVudC5ibHVyKClcbiAgICB9XG4gICAgaWYgKHdpbmRvdy5zY3JvbGxYICE9PSBzY3JvbGwueCB8fCB3aW5kb3cuc2Nyb2xsWSAhPT0gc2Nyb2xsLnkpIHtcbiAgICAgIHdpbmRvdy5zY3JvbGxUbyhzY3JvbGwueCwgc2Nyb2xsLnkpXG4gICAgfVxuICB9XG5cbiAgX2Vuc3VyZURPTSAoKSB7XG4gICAgaWYgKHRoaXMuX2RvbVJlYWR5IHx8IHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHJldHVyblxuICAgIGNvbnN0IGlkICAgICAgID0gYHdlYi1oYXB0aWNzLSR7dGhpcy5faWR9YFxuICAgIGNvbnN0IGxhYmVsICAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKVxuICAgIGxhYmVsLmh0bWxGb3IgID0gaWRcbiAgICBsYWJlbC5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOmZpeGVkO3RvcDowO2xlZnQ6MDt3aWR0aDowO2hlaWdodDowO29wYWNpdHk6MDtwb2ludGVyLWV2ZW50czpub25lO292ZXJmbG93OmhpZGRlbidcbiAgICBjb25zdCBjaGVja2JveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JylcbiAgICBjaGVja2JveC50eXBlICA9ICdjaGVja2JveCdcbiAgICBjaGVja2JveC5pZCAgICA9IGlkXG4gICAgY2hlY2tib3guc2V0QXR0cmlidXRlKCdzd2l0Y2gnLCAnJylcbiAgICBjaGVja2JveC5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOmZpeGVkO3RvcDowO2xlZnQ6MDt3aWR0aDowO2hlaWdodDowO29wYWNpdHk6MDtwb2ludGVyLWV2ZW50czpub25lJ1xuICAgIGxhYmVsLmFwcGVuZENoaWxkKGNoZWNrYm94KVxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGFiZWwpXG4gICAgdGhpcy5fbGFiZWwgICAgPSBsYWJlbFxuICAgIHRoaXMuX2RvbVJlYWR5ID0gdHJ1ZVxuICB9XG59XG5cbi8vIOKUgOKUgOKUgCBTaGFyZWQgc2luZ2xldG9uIHVzZWQgYnkgaGFwdGljLWZlZWRiYWNrLmpzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuZXhwb3J0IGNvbnN0IGhhcHRpY3MgPSBuZXcgV2ViSGFwdGljcygpIiwiLyoqXG4gKiBtZWlsaXNlYXJjaC5qc1xuICpcbiAqIEZ1bGwgTWVpbGlTZWFyY2ggaW50ZWdyYXRpb24g4oCUIGluaXQsIGNsaWNrIGludGVyY2VwdGlvbiwgaGFwdGljcywgYW5pbWF0aW9uLlxuICpcbiAqIOKUgOKUgOKUgCBSb2xsYmFjayDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbiAqIFRvIHN3aXRjaCBiYWNrIHRvIHRoZSB0aGVtZSdzIG5hdGl2ZSBGbGV4U2VhcmNoOlxuICogICAxLiBTZXQgTUVJTElTRUFSQ0hfRU5BQkxFRCA9IGZhbHNlIGJlbG93XG4gKiAgIDIuIFJlbW92ZSB0aGUgQ0ROIDxzY3JpcHQ+IGFuZCA8bGluaz4gZnJvbSBkZWZhdWx0Lmhic1xuICogICAzLiBSZWJ1aWxkXG4gKiBFdmVyeXRoaW5nIGVsc2UgKGhlYWRlciBidXR0b25zLCBDU1Mgc2VsZWN0b3JzKSBzdGF5cyB0aGUgc2FtZS5cbiAqXG4gKiDilIDilIDilIAgQW5pbWF0aW9uIHN0cmF0ZWd5IOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuICogVGhlIGxpYnJhcnkgbW91bnRzIGl0cyBjb250YWluZXIgZGl2IGR1cmluZyBpbml0aWFsaXplKCksIE5PVCBvbiBmaXJzdFxuICogb3BlbigpLiBTbyBieSB0aGUgdGltZSB0aGUgdXNlciBjbGlja3MsIHRoZSBjb250YWluZXIgYWxyZWFkeSBleGlzdHMgaW4gdGhlXG4gKiBET00gYW5kIGEgTXV0YXRpb25PYnNlcnZlciB3YXRjaGluZyBmb3IgbmV3IGJvZHkgY2hpbGRyZW4gbmV2ZXIgZmlyZXMuXG4gKlxuICogSW5zdGVhZDpcbiAqICAgMS4gQWZ0ZXIgaW5pdGlhbGl6ZSgpLCBwb2xsIGZvciB0aGUgY29udGFpbmVyIHdpdGggZmluZENvbnRhaW5lcigpXG4gKiAgIDIuIFNhdmUgaXQgYXMgX3NlYXJjaENvbnRhaW5lclxuICogICAzLiBPbiBldmVyeSBvcGVuKCkgY2FsbCwgcmUtdHJpZ2dlciB0aGUgQ1NTIGtleWZyYW1lIHZpYSBhIGZvcmNlZCByZWZsb3dcbiAqICAgICAgKHZvaWQgZWwub2Zmc2V0V2lkdGgpIHNvIHRoZSBhbmltYXRpb24gcGxheXMgZWFjaCB0aW1lXG4gKlxuICog4pSA4pSA4pSAIEhhcHRpYyBzdHJhdGVneSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbiAqIFVzZXMgYSBjdXN0b20gdHdvLXB1bHNlIHBhdHRlcm4gdG8gbWF0Y2ggdGhlIHZpc3VhbCBcInNuYXAgb3Blbiwgc2V0dGxlXCJcbiAqIGZlZWwgb2YgdGhlIHNsaWRlIGFuaW1hdGlvbiByYXRoZXIgdGhhbiB0aGUgZ2VuZXJpYyBzaW5nbGUgdGFwIHVzZWQgYnlcbiAqIG90aGVyIGJ1dHRvbnMuIFR1bmUgU0VBUkNIX0hBUFRJQyB0byB0YXN0ZS5cbiAqL1xuXG5pbXBvcnQgeyBoYXB0aWNzIH0gZnJvbSAnLi9oYXB0aWMnXG5cbi8vIOKUgOKUgOKUgCBUb2dnbGUg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbi8qKlxuICogU2V0IHRvIGZhbHNlIHRvIGRpc2FibGUgTWVpbGlTZWFyY2ggYW5kIGZhbGwgYmFjayB0byB0aGUgdGhlbWUncyBuYXRpdmVcbiAqIEZsZXhTZWFyY2guIG1haW4uanMgcmVhZHMgdGhpcyBmbGFnIHRvIGRlY2lkZSB3aGV0aGVyIHRvIGxvYWQgc2VhcmNoLmpzLlxuICovXG5leHBvcnQgY29uc3QgTUVJTElTRUFSQ0hfRU5BQkxFRCA9IHRydWVcblxuLy8g4pSA4pSA4pSAIENvbmZpZyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuY29uc3QgTVNfQ09ORklHID0ge1xuICBtZWlsaXNlYXJjaEhvc3Q6ICAgJ2h0dHBzOi8vbTQ0LmNsL3NlYXJjaCcsXG4gIG1laWxpc2VhcmNoQXBpS2V5OiAnMjdjOGZmYTY4ZWY0MDQ1ZjYxMTZiYTIyNDk4YjFhMTlhMTlhY2M2ZjAwZDU4Njc4ZDRlZThmNTI4MTBmZDJiYScsXG4gIGluZGV4TmFtZTogICAgICAgICAnZ2hvc3RfcG9zdHMnLFxuICB0aGVtZTogICAgICAgICAgICAgJ3N5c3RlbScsICAvLyAnbGlnaHQnIHwgJ2RhcmsnIHwgJ3N5c3RlbSdcbn1cblxuLyoqXG4gKiBIYXB0aWMgcGF0dGVybiBmb3Igb3BlbmluZyBzZWFyY2guXG4gKiBBIHNoYXJwIHNuYXAgKGludGVuc2l0eSAwLjksIDI1IG1zKSBmb2xsb3dlZCBieSBhIHNvZnQgc2V0dGxlXG4gKiAoaW50ZW5zaXR5IDAuMjUsIDE1IG1zIGFmdGVyIDUwIG1zIGdhcCkg4oCUIG1pcnJvcnMgdGhlIGZhc3QtaW4gL1xuICogc2xvdy1vdXQgZmVlbCBvZiB0aGUgbXMtc2xpZGUtaW4gQ1NTIGFuaW1hdGlvbi5cbiAqIFN3YXAgZm9yIGFueSBwcmVzZXQgbmFtZSAoJ21lZGl1bScsICdudWRnZScsIGV0Yy4pIG9yIGxlYXZlIGFzIGFcbiAqIGN1c3RvbSBWaWJyYXRpb25bXSBhcnJheS5cbiAqL1xuY29uc3QgU0VBUkNIX0hBUFRJQyA9IFtcbiAgeyBkdXJhdGlvbjogMjUsIGludGVuc2l0eTogMC45IH0sXG4gIHsgZGVsYXk6IDUwLCBkdXJhdGlvbjogMTUsIGludGVuc2l0eTogMC4yNSB9LFxuXVxuXG4vLyDilIDilIDilIAgU3RhdGUg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbmxldCBfc2VhcmNoQ29udGFpbmVyID0gbnVsbCAgLy8gcmVmZXJlbmNlIHRvIHRoZSBtb2RhbCByb290IGVsZW1lbnRcblxuLy8g4pSA4pSA4pSAIENvbnRhaW5lciBkZXRlY3Rpb24g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbi8qKlxuICogVHJ5IHRvIGZpbmQgdGhlIHNlYXJjaCBtb2RhbCBjb250YWluZXIgdXNpbmcgbXVsdGlwbGUgc3RyYXRlZ2llczpcbiAqICAgMS4gS25vd24gSURzIHVzZWQgYnkgR2hvc3QncyBzb2RvLXNlYXJjaCAvIGNvbW1vbiBmb3Jrc1xuICogICAyLiBBbnkgbmV3IGNoaWxkIG9mIDxib2R5PiB0aGF0IGFwcGVhcmVkIHNpbmNlIGBzbmFwc2hvdGAgd2FzIHRha2VuXG4gKlxuICogUmV0dXJucyB0aGUgZWxlbWVudCBvciBudWxsLlxuICovXG5mdW5jdGlvbiBmaW5kQ29udGFpbmVyIChzbmFwc2hvdCkge1xuICBjb25zdCBieUlkID1cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2hvc3Qtc2VhcmNoLXJvb3QnKSB8fFxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzb2RvLXNlYXJjaC1yb290JykgICB8fFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWdob3N0LXNlYXJjaC1yb290XScpXG4gIGlmIChieUlkKSByZXR1cm4gYnlJZFxuXG4gIGlmIChzbmFwc2hvdCkge1xuICAgIGNvbnN0IG5ld0tpZHMgPSBbLi4uZG9jdW1lbnQuYm9keS5jaGlsZHJlbl0uZmlsdGVyKGVsID0+ICFzbmFwc2hvdC5oYXMoZWwpKVxuICAgIGlmIChuZXdLaWRzLmxlbmd0aCkgcmV0dXJuIG5ld0tpZHNbbmV3S2lkcy5sZW5ndGggLSAxXVxuICB9XG5cbiAgcmV0dXJuIG51bGxcbn1cblxuLyoqXG4gKiBQb2xsIGZvciB0aGUgY29udGFpbmVyIGFmdGVyIGluaXRpYWxpemUoKS5cbiAqIFRoZSBsaWJyYXJ5IG1heSByZW5kZXIgdGhlIGNvbnRhaW5lciBhc3luY2hyb25vdXNseSAoUmVhY3QpLCBzbyB3ZSBjaGVja1xuICogYWNyb3NzIHNldmVyYWwgYW5pbWF0aW9uIGZyYW1lcyByYXRoZXIgdGhhbiBpbiB0aGUgc2FtZSB0aWNrLlxuICovXG5mdW5jdGlvbiBkZXRlY3RDb250YWluZXJBZnRlckluaXQgKHNuYXBzaG90KSB7XG4gIGxldCBhdHRlbXB0cyA9IDBcbiAgY29uc3QgY2hlY2sgPSAoKSA9PiB7XG4gICAgYXR0ZW1wdHMrK1xuICAgIGNvbnN0IGZvdW5kID0gZmluZENvbnRhaW5lcihzbmFwc2hvdClcbiAgICBpZiAoZm91bmQpIHtcbiAgICAgIF9zZWFyY2hDb250YWluZXIgPSBmb3VuZFxuICAgICAgY29uc29sZS5kZWJ1ZygnW21laWxpc2VhcmNoXSBtb2RhbCBjb250YWluZXIgZGV0ZWN0ZWQ6JywgX3NlYXJjaENvbnRhaW5lci5pZCB8fCBfc2VhcmNoQ29udGFpbmVyLmNsYXNzTmFtZSB8fCBfc2VhcmNoQ29udGFpbmVyLnRhZ05hbWUpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKGF0dGVtcHRzIDwgMTUpIHJlcXVlc3RBbmltYXRpb25GcmFtZShjaGVjaylcbiAgfVxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2hlY2spXG59XG5cbi8vIOKUgOKUgOKUgCBBbmltYXRpb24g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbi8qKlxuICogVHJpZ2dlciB0aGUgbXMtc2xpZGUtaW4ga2V5ZnJhbWUgb24gdGhlIHNlYXJjaCBjb250YWluZXIuXG4gKiBSZW1vdmluZyB0aGUgY2xhc3MgYW5kIGZvcmNpbmcgYSByZWZsb3cgYmVmb3JlIHJlLWFkZGluZyBpdCByZXN0YXJ0c1xuICogdGhlIGFuaW1hdGlvbiBjbGVhbmx5IGV2ZW4gaWYgaXQgd2FzIGFscmVhZHkgYXBwbGllZCBvbiBhIHByZXZpb3VzIG9wZW4uXG4gKi9cbmZ1bmN0aW9uIGFuaW1hdGVTZWFyY2hPcGVuICgpIHtcbiAgaWYgKCFfc2VhcmNoQ29udGFpbmVyKSByZXR1cm5cbiAgX3NlYXJjaENvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdtcy1zZWFyY2gtZW50ZXJpbmcnKVxuICB2b2lkIF9zZWFyY2hDb250YWluZXIub2Zmc2V0V2lkdGggICAgICAgICAgIC8vIGZvcmNlIHJlZmxvdyDihpIgcmVzdGFydCBrZXlmcmFtZVxuICBfc2VhcmNoQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ21zLXNlYXJjaC1lbnRlcmluZycpXG4gIF9zZWFyY2hDb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcignYW5pbWF0aW9uZW5kJywgKCkgPT4ge1xuICAgIF9zZWFyY2hDb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnbXMtc2VhcmNoLWVudGVyaW5nJylcbiAgfSwgeyBvbmNlOiB0cnVlIH0pXG59XG5cbi8qKlxuICogQWZ0ZXIgY2FsbGluZyBvcGVuKCksIHJldHJ5IGZpbmRpbmcgdGhlIGNvbnRhaW5lciBpZiBpdCBpc24ndCBrbm93biB5ZXQuXG4gKiBUaGlzIGNvdmVycyB0aGUgKHVubGlrZWx5KSBjYXNlIHdoZXJlIHRoZSBjb250YWluZXIgaXMgYWRkZWQgb24gZmlyc3Qgb3BlblxuICogcmF0aGVyIHRoYW4gb24gaW5pdC5cbiAqL1xuZnVuY3Rpb24gYW5pbWF0ZVdpdGhSZXRyeSAoc25hcHNob3QsIGF0dGVtcHRzID0gMCkge1xuICBpZiAoX3NlYXJjaENvbnRhaW5lcikgeyBhbmltYXRlU2VhcmNoT3BlbigpOyByZXR1cm4gfVxuXG4gIGNvbnN0IGZvdW5kID0gZmluZENvbnRhaW5lcihzbmFwc2hvdClcbiAgaWYgKGZvdW5kKSB7IF9zZWFyY2hDb250YWluZXIgPSBmb3VuZDsgYW5pbWF0ZVNlYXJjaE9wZW4oKTsgcmV0dXJuIH1cblxuICBpZiAoYXR0ZW1wdHMgPCAxMCkge1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiBhbmltYXRlV2l0aFJldHJ5KHNuYXBzaG90LCBhdHRlbXB0cyArIDEpKVxuICB9XG59XG5cbi8vIOKUgOKUgOKUgCBJbml0IOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG5mdW5jdGlvbiBpbml0SW5zdGFuY2UgKCkge1xuICBpZiAod2luZG93Lkdob3N0TWVpbGlzZWFyY2hTZWFyY2ggJiYgIXdpbmRvdy5naG9zdE1laWxpc2VhcmNoU2VhcmNoKSB7XG4gICAgd2luZG93Ll9fTVNfU0VBUkNIX0NPTkZJR19fICAgPSBNU19DT05GSUdcbiAgICBjb25zdCBzbmFwc2hvdCA9IG5ldyBTZXQoWy4uLmRvY3VtZW50LmJvZHkuY2hpbGRyZW5dKVxuICAgIHdpbmRvdy5naG9zdE1laWxpc2VhcmNoU2VhcmNoID0gd2luZG93Lkdob3N0TWVpbGlzZWFyY2hTZWFyY2guaW5pdGlhbGl6ZShNU19DT05GSUcpXG4gICAgLy8gRmluZCB3aGF0ZXZlciB0aGUgbGlicmFyeSBqdXN0IGFkZGVkIHRvIDxib2R5PlxuICAgIGRldGVjdENvbnRhaW5lckFmdGVySW5pdChzbmFwc2hvdClcbiAgfVxufVxuXG4vLyDilIDilIDilIAgQ2xpY2sgaW50ZXJjZXB0aW9uIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG4vKipcbiAqIEF0dGFjaCBjYXB0dXJlLXBoYXNlIGxpc3RlbmVycyB0byBldmVyeSBbZGF0YS1naG9zdC1zZWFyY2hdIGVsZW1lbnQuXG4gKiBDYXB0dXJlIHBoYXNlIGVuc3VyZXMgb3VyIGhhbmRsZXIgcnVucyBiZWZvcmUgR2hvc3QncyBidWJibGUtcGhhc2UgaGFuZGxlci5cbiAqIHN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbiBwcmV2ZW50cyBHaG9zdCdzIG5hdGl2ZSBzZWFyY2ggZnJvbSBvcGVuaW5nLlxuICovXG5mdW5jdGlvbiB3aXJlU2VhcmNoVHJpZ2dlcnMgKCkge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1naG9zdC1zZWFyY2hdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgaWYgKGVsLmRhdGFzZXQubXNXaXJlZCkgcmV0dXJuXG4gICAgZWwuZGF0YXNldC5tc1dpcmVkID0gJzEnXG5cbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG5cbiAgICAgIC8vIEhhcHRpYyBmaXJlcyBzeW5jaHJvbm91c2x5IOKAlCBzdGlsbCB3aXRoaW4gdGhlIHVzZXIgZ2VzdHVyZSBjb250ZXh0XG4gICAgICAvLyByZXF1aXJlZCBieSBpT1MgU2FmYXJpIGZvciB0aGUgc3dpdGNoLWNoZWNrYm94IHRyaWNrIHRvIHByb2R1Y2UgYSB0YXAuXG4gICAgICBoYXB0aWNzLnRyaWdnZXIoU0VBUkNIX0hBUFRJQylcblxuICAgICAgLy8gU25hcHNob3QgYm9keSBjaGlsZHJlbiBCRUZPUkUgb3BlbigpIGluIGNhc2UgdGhlIGNvbnRhaW5lciBpc1xuICAgICAgLy8gYWRkZWQgbGF6aWx5IG9uIGZpcnN0IG9wZW4gcmF0aGVyIHRoYW4gZHVyaW5nIGluaXRpYWxpemUoKS5cbiAgICAgIGNvbnN0IHNuYXBzaG90ID0gbmV3IFNldChbLi4uZG9jdW1lbnQuYm9keS5jaGlsZHJlbl0pXG4gICAgICB3aW5kb3cuZ2hvc3RNZWlsaXNlYXJjaFNlYXJjaD8ub3BlbigpXG4gICAgICBhbmltYXRlV2l0aFJldHJ5KHNuYXBzaG90KVxuXG4gICAgfSwgdHJ1ZSAvKiBjYXB0dXJlIHBoYXNlICovKVxuICB9KVxufVxuXG4vLyDilIDilIDilIAgUHVibGljIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpbml0TWVpbGlTZWFyY2ggKCkge1xuICBpZiAoIU1FSUxJU0VBUkNIX0VOQUJMRUQpIHJldHVyblxuXG4gIGluaXRJbnN0YW5jZSgpXG4gIHdpcmVTZWFyY2hUcmlnZ2VycygpXG5cbiAgLy8gUG9sbCBpZiB0aGUgQ0ROIGJ1bmRsZSBoYXNuJ3QgZXhlY3V0ZWQgeWV0IChkZWZlciBpbiBkZWZhdWx0LmhicyBtZWFuc1xuICAvLyBpdCBydW5zIGFmdGVyIHBhcnNpbmcgYnV0IHRpbWluZyByZWxhdGl2ZSB0byBET01Db250ZW50TG9hZGVkIHZhcmllcylcbiAgaWYgKCF3aW5kb3cuZ2hvc3RNZWlsaXNlYXJjaFNlYXJjaCkge1xuICAgIGxldCBhdHRlbXB0cyA9IDBcbiAgICBjb25zdCBwb2xsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgYXR0ZW1wdHMrK1xuICAgICAgaW5pdEluc3RhbmNlKClcbiAgICAgIGlmICh3aW5kb3cuZ2hvc3RNZWlsaXNlYXJjaFNlYXJjaCB8fCBhdHRlbXB0cyA+PSAyMCkgY2xlYXJJbnRlcnZhbChwb2xsKVxuICAgIH0sIDEwMClcbiAgfVxufVxuIiwiLyoqXG4gKiBzcGVjdWxhdGlvbi1ydWxlcy5qc1xuICpcbiAqIEluamVjdHMgYSA8c2NyaXB0IHR5cGU9XCJzcGVjdWxhdGlvbnJ1bGVzXCI+IHRhZyB0byBlbmFibGUgYnJvd3Nlci1uYXRpdmVcbiAqIGhvdmVyLXRyaWdnZXJlZCBwcmVmZXRjaGluZyB2aWEgdGhlIFNwZWN1bGF0aW9uIFJ1bGVzIEFQSS5cbiAqXG4gKiBTdHJhdGVneTogcHJlZmV0Y2ggb25seSAobm90IHByZXJlbmRlcikg4oCUIHNhZmVyIGJlY2F1c2U6XG4gKiAgIC0gUHJlZmV0Y2ggb25seSBkb3dubG9hZHMgSFRNTDsgaXQgZG9lcyBOT1QgZXhlY3V0ZSBKYXZhU2NyaXB0XG4gKiAgIC0gTm8gcmlzayBvZiBNYXRvbW8gZG91YmxlLWNvdW50aW5nIHBhZ2V2aWV3c1xuICogICAtIE5vIHJpc2sgb2Ygc2lkZS1lZmZlY3Qgcm91dGVzICgvbG9nb3V0LCAvc2lnbm91dCkgdHJpZ2dlcmluZyBlYXJseVxuICogICAtIExvd2VyIGJhbmR3aWR0aCBjb3N0IG9uIG1vYmlsZVxuICpcbiAqIEVhZ2VybmVzcyBcIm1vZGVyYXRlXCI6IGJyb3dzZXIgcHJlZmV0Y2hlcyBhZnRlciB0aGUgcG9pbnRlciBoYXMgaG92ZXJlZFxuICogYSBsaW5rIGZvciB+MjAwIG1zLiBUaGlzIGZpbHRlcnMgb3V0IGFjY2lkZW50YWwgbW91c2Utb3ZlcnMgYW5kIGF2b2lkc1xuICogYmxhc3RpbmcgdGhlIHNlcnZlciB3aXRoIGV2ZXJ5IGxpbmsgb24gdGhlIHBhZ2UuXG4gKlxuICogVXBncmFkZSBwYXRoOiBvbmNlIHlvdSBjb25maXJtIHByZWZldGNoIGlzIHdvcmtpbmcgd2VsbCBhbmQgeW91clxuICogQ2xvdWRmbGFyZSB3b3JrZXIgcGFzc2VzIHRocm91Z2ggcHJlZmV0Y2ggcmVxdWVzdHMgY2xlYW5seSwgeW91IGNhblxuICogcHJvbW90ZSB0aGUgcnVsZSB0byBgcHJlcmVuZGVyYCBmb3IgbmVhci1pbnN0YW50IG5hdmlnYXRpb25zLiBKdXN0IGJlXG4gKiBzdXJlIHRvIGFkZCB0aGUgTWF0b21vIHByZXJlbmRlcmluZyBndWFyZCAoc2VlIGFuYWx5dGljcy5qcykgZmlyc3QuXG4gKlxuICog4pSA4pSA4pSAIENsb3VkZmxhcmUgU3BsYXNoIFNjcmVlbiBub3RlIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuICogUHJlZmV0Y2ggcmVxdWVzdHMgY2FycnkgY29va2llcywgc28gdXNlcnMgd2hvIGFscmVhZHkgcGFzc2VkIHRoZSBzcGxhc2hcbiAqIChjb29raWUgc2V0KSBhcmUgZmluZS4gRmlyc3QtdGltZSB2aXNpdG9ycyBtYXkgdHJpZ2dlciB0aGUgd29ya2VyIG9uXG4gKiBwcmVmZXRjaC4gQ29uZmlybSB5b3VyIHdvcmtlciBwYXNzZXMgcmVxdWVzdHMgdGhhdCBpbmNsdWRlIHRoZSBoZWFkZXI6XG4gKiAgIFNlYy1QdXJwb3NlOiBwcmVmZXRjaFxuICogb3IgYWRkIGEgd29ya2VyIGNoZWNrIGxpa2U6XG4gKiAgIGlmIChyZXF1ZXN0LmhlYWRlcnMuZ2V0KCdTZWMtUHVycG9zZScpID09PSAncHJlZmV0Y2gnKSByZXR1cm4gZmV0Y2gocmVxdWVzdClcbiAqXG4gKiDilIDilIDilIAgQ1NQIG5vdGUg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4gKiBJZiB5b3UgaGF2ZSBhIENvbnRlbnQtU2VjdXJpdHktUG9saWN5IGhlYWRlciwgYWRkOlxuICogICBzY3JpcHQtc3JjICdpbmxpbmUtc3BlY3VsYXRpb24tcnVsZXMnXG4gKiAoVGhpcyBpcyBhIGRlZGljYXRlZCBDU1Agc291cmNlIGV4cHJlc3Npb24sIE5PVCAndW5zYWZlLWlubGluZScuKVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGluaXRTcGVjdWxhdGlvblJ1bGVzICgpIHtcbiAgLy8gQmFpbCBvdXQgb24gdW5zdXBwb3J0ZWQgYnJvd3NlcnMgKEZpcmVmb3gsIFNhZmFyaSkg4oCUIHByb2dyZXNzaXZlIGVuaGFuY2VtZW50LlxuICAvLyBUaGUgc2l0ZSB3b3JrcyBwZXJmZWN0bHkgZm9yIHRoZW07IENocm9taXVtIHVzZXJzIGdldCB0aGUgc3BlZWQgYm9vc3QuXG4gIGlmICghSFRNTFNjcmlwdEVsZW1lbnQuc3VwcG9ydHM/Lignc3BlY3VsYXRpb25ydWxlcycpKSByZXR1cm5cblxuICAvLyBBdm9pZCBkb3VibGUtaW5qZWN0aW5nIChlLmcuIGlmIG1haW4uanMgaXMgc29tZWhvdyBjYWxsZWQgdHdpY2UpXG4gIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzY3JpcHRbdHlwZT1cInNwZWN1bGF0aW9ucnVsZXNcIl0nKSkgcmV0dXJuXG5cbiAgY29uc3QgcnVsZXMgPSB7XG4gICAgcHJlZmV0Y2g6IFtcbiAgICAgIHtcbiAgICAgICAgc291cmNlOiAnZG9jdW1lbnQnLFxuICAgICAgICB3aGVyZToge1xuICAgICAgICAgIGFuZDogW1xuICAgICAgICAgICAgLy8gT25seSBzYW1lLW9yaWdpbiBsaW5rcyAoY3Jvc3Mtb3JpZ2luIGlzIHRoZSBkZWZhdWx0IGJyb3dzZXIgYmVoYXZpb3VyKVxuICAgICAgICAgICAgeyBocmVmX21hdGNoZXM6ICcvKicgfSxcblxuICAgICAgICAgICAgLy8g4pSA4pSAIEdob3N0IGFkbWluICYgQVBJIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuICAgICAgICAgICAgeyBub3Q6IHsgaHJlZl9tYXRjaGVzOiAnL2dob3N0LyonIH0gfSxcblxuICAgICAgICAgICAgLy8g4pSA4pSAIEF1dGggLyBtZW1iZXJzaGlwIHNpZGUtZWZmZWN0cyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbiAgICAgICAgICAgIHsgbm90OiB7IGhyZWZfbWF0Y2hlczogJy9sb2dvdXQqJyAgfSB9LFxuICAgICAgICAgICAgeyBub3Q6IHsgaHJlZl9tYXRjaGVzOiAnL3NpZ25vdXQqJyB9IH0sXG4gICAgICAgICAgICB7IG5vdDogeyBocmVmX21hdGNoZXM6ICcvc3Vic2NyaWJlKicgfSB9LFxuXG4gICAgICAgICAgICAvLyBQb3J0YWwgbGlua3Mgb3BlbiBhIG1vZGFsLCBub3QgYSBuYXZpZ2F0aW9uXG4gICAgICAgICAgICB7IG5vdDogeyBzZWxlY3Rvcl9tYXRjaGVzOiAnW2RhdGEtcG9ydGFsXScgfSB9LFxuICAgICAgICAgICAgeyBub3Q6IHsgc2VsZWN0b3JfbWF0Y2hlczogJ1tkYXRhLW1lbWJlcnMtc2lnbm91dF0nIH0gfSxcblxuICAgICAgICAgICAgLy8g4pSA4pSAIFNlYXJjaCB0cmlnZ2VycyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbiAgICAgICAgICAgIC8vIFRoZXNlIG9wZW4gdGhlIE1laWxpU2VhcmNoIG1vZGFsLCBub3QgYSBwYWdlXG4gICAgICAgICAgICB7IG5vdDogeyBzZWxlY3Rvcl9tYXRjaGVzOiAnW2RhdGEtZ2hvc3Qtc2VhcmNoXScgfSB9LFxuXG4gICAgICAgICAgICAvLyDilIDilIAgSGFzaCAvIGZyYWdtZW50LW9ubHkgbGlua3Mg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4gICAgICAgICAgICAvLyBlLmcuIDxhIGhyZWY9XCIjc2VjdGlvblwiPiDigJQgbm8gbmF2aWdhdGlvbiBoYXBwZW5zXG4gICAgICAgICAgICB7IG5vdDogeyBocmVmX21hdGNoZXM6ICcvIyonIH0gfSxcblxuICAgICAgICAgICAgLy8g4pSA4pSAIEluZmluaXRlIHNjcm9sbCBcIm5leHRcIiBkYXRhIG5vZGVzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuICAgICAgICAgICAgLy8gVGhlc2UgYXJlIDxkaXYgZGF0YS11cmw9XCLigKZcIj4gbm90IHJlYWwgPGE+IHRhZ3MsIHNvIHRoZXkncmVcbiAgICAgICAgICAgIC8vIGFscmVhZHkgZXhjbHVkZWQg4oCUIGxpc3RlZCBoZXJlIGZvciBjbGFyaXR5XG4gICAgICAgICAgICB7IG5vdDogeyBzZWxlY3Rvcl9tYXRjaGVzOiAnW2RhdGEtbmV4dC1wb3N0LWRhdGFdJyB9IH0sXG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBlYWdlcm5lc3M6ICdtb2RlcmF0ZScsIC8vIGhvdmVyIH4yMDAgbXMgYmVmb3JlIHByZWZldGNoIGZpcmVzXG4gICAgICB9XG4gICAgXVxuICB9XG5cbiAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JylcbiAgc2NyaXB0LnR5cGUgPSAnc3BlY3VsYXRpb25ydWxlcydcbiAgc2NyaXB0LnRleHRDb250ZW50ID0gSlNPTi5zdHJpbmdpZnkocnVsZXMpXG4gIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KVxuXG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgY29uc29sZS5kZWJ1ZygnW3NwZWN1bGF0aW9uLXJ1bGVzXSBJbmplY3RlZCBwcmVmZXRjaCBydWxlcyAobW9kZXJhdGUgZWFnZXJuZXNzKScpXG4gIH1cbn1cbiIsIi8qIGdsb2JhbCBmb2xsb3dTb2NpYWxNZWRpYSBzaXRlU2VhcmNoICovXG5cbi8vIGxpYlxuaW1wb3J0ICdsYXp5c2l6ZXMnXG5cbmltcG9ydCBzb2NpYWxNZWRpYSAgICAgICAgZnJvbSAnLi9hcHAvc29jaWFsLW1lZGlhJ1xuaW1wb3J0IGRhcmtNb2RlICAgICAgICAgICBmcm9tICcuL2FwcC9kYXJrLW1vZGUnXG5pbXBvcnQgaGVhZGVyVHJhbnNwYXJlbmN5IGZyb20gJy4vYXBwL2hlYWRlci10cmFuc3BhcmVuY3knXG5pbXBvcnQgbG9hZFNjcmlwdCAgICAgICAgIGZyb20gJy4vY29tcG9uZW50cy9sb2FkLXNjcmlwdCdcbmltcG9ydCBzY3JvbGxIaWRlSGVhZGVyICAgZnJvbSAnLi9jb21wb25lbnRzL3Njcm9sbC1oaWRlLWhlYWRlcidcbmltcG9ydCBwcm9tb1BvcHVwICAgICAgICAgZnJvbSAnLi9jb21wb25lbnRzL3Byb21vLXBvcHVwJ1xuaW1wb3J0IHBvc3RJbmZpbml0ZSAgICAgICBmcm9tICcuL3Bvc3QtaW5maW5pdGUnXG5cbmltcG9ydCBpbml0SGFwdGljRmVlZGJhY2sgICAgICAgICAgICAgICAgICAgICAgIGZyb20gJy4vYXBwL2hhcHRpYy1mZWVkYmFjaydcbmltcG9ydCBpbml0TWVpbGlTZWFyY2gsIHsgTUVJTElTRUFSQ0hfRU5BQkxFRCB9IGZyb20gJy4vbGliL21laWxpc2VhcmNoJ1xuaW1wb3J0IGluaXRTcGVjdWxhdGlvblJ1bGVzICAgICAgICAgICAgICAgICAgICAgZnJvbSAnLi9saWIvc3BlY3VsYXRpb24tcnVsZXMnXG5cbmNvbnN0IE00U2V0dXAgPSAoKSA9PiB7XG4gIGNvbnNvbGUuZGVidWcoJ1ttYWluXSBNNFNldHVwIHN0YXJ0aW5nJylcblxuICBpZiAodHlwZW9mIGZvbGxvd1NvY2lhbE1lZGlhID09PSAnb2JqZWN0JyAmJiBmb2xsb3dTb2NpYWxNZWRpYSAhPT0gbnVsbCkge1xuICAgIHNvY2lhbE1lZGlhKGZvbGxvd1NvY2lhbE1lZGlhLCAnLmpzLXNvY2lhbC1tZWRpYScpXG4gIH1cblxuICBkYXJrTW9kZSgnLmpzLWRhcmstbW9kZScpXG4gIGhlYWRlclRyYW5zcGFyZW5jeSgnLmhhcy1jb3ZlcicsICdpcy1oZWFkLXRyYW5zcGFyZW50JylcblxuICBjb25zdCAkbWVudU9wZW4gID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLW1lbnUtb3BlbicpXG4gIGNvbnN0ICRtZW51Q2xvc2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtbWVudS1jbG9zZScpXG4gIGNvbnN0ICRzZWFyY2ggICAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtc2VhcmNoJylcblxuICBsZXQgX21lbnVTY3JvbGxZID0gMFxuXG4gIGlmICgkbWVudU9wZW4pIHtcbiAgICAkbWVudU9wZW4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgX21lbnVTY3JvbGxZID0gd2luZG93LnNjcm9sbFlcbiAgICAgIGlmICgkc2VhcmNoKSAkc2VhcmNoLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpXG4gICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ2hhcy1tZW51JylcbiAgICAgIC8vIEZpcmVmb3ggc2Nyb2xscyB0byB0aGUgbWVudSB3cmFwcGVyIG9uIG92ZXJmbG93OmhpZGRlbjsgcmVzdG9yZSBwb3NpdGlvbi5cbiAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCBfbWVudVNjcm9sbFkpXG4gICAgfSlcbiAgfVxuXG4gIGlmICgkbWVudUNsb3NlKSB7XG4gICAgJG1lbnVDbG9zZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2hhcy1tZW51JylcbiAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCBfbWVudVNjcm9sbFkpXG4gICAgfSlcbiAgfVxuXG4gIC8vIOKUgOKUgCBTZWFyY2gg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4gIGlmICghTUVJTElTRUFSQ0hfRU5BQkxFRCkge1xuICAgIGlmICh0eXBlb2Ygc2VhcmNoU2V0dGluZ3MgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBzaXRlU2VhcmNoICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgbG9hZFNjcmlwdChzaXRlU2VhcmNoKVxuICAgIH1cbiAgfVxuXG4gIHNjcm9sbEhpZGVIZWFkZXIoJy5qcy1oaWRlLWhlYWRlcicpXG4gIHByb21vUG9wdXAoJyNqcy1wcm9tby1wb3B1cCcsIDIwMDApXG5cbiAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1pbmZpbml0ZS1jb250YWluZXInKSkge1xuICAgIGNvbnNvbGUuaW5mbygnW21haW5dIC5qcy1pbmZpbml0ZS1jb250YWluZXIgZGV0ZWN0ZWQg4oCUIGluaXRpYWxpemluZyBwb3N0SW5maW5pdGUnKVxuICAgIHBvc3RJbmZpbml0ZSgpXG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5kZWJ1ZygnW21haW5dIC5qcy1pbmZpbml0ZS1jb250YWluZXIgbm90IGZvdW5kIOKAlCBza2lwcGluZyBwb3N0SW5maW5pdGUnKVxuICB9XG5cbiAgLy8g4pSA4pSAIEhhcHRpYyBmZWVkYmFjayDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbiAgaW5pdEhhcHRpY0ZlZWRiYWNrKHtcbiAgICB0YXJnZXRzOiBbXSxcbiAgICBleGNsdWRlOiBbXSxcbiAgfSlcblxuICAvLyDilIDilIAgTWVpbGlTZWFyY2gg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4gIGluaXRNZWlsaVNlYXJjaCgpXG5cbiAgLy8g4pSA4pSAIFNwZWN1bGF0aW9uIFJ1bGVzIChwcmVmZXRjaCBvbiBob3Zlcikg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4gIC8vIFByb2dyZXNzaXZlIGVuaGFuY2VtZW50OiBDaHJvbWl1bSBvbmx5LiBOby1vcHMgc2lsZW50bHkgb24gRmlyZWZveC9TYWZhcmkuXG4gIC8vIFNlZSBzcmMvanMvbGliL3NwZWN1bGF0aW9uLXJ1bGVzLmpzIGZvciBleGNsdXNpb24gbGlzdCBhbmQgdXBncmFkZSBub3Rlcy5cbiAgaW5pdFNwZWN1bGF0aW9uUnVsZXMoKVxufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgTTRTZXR1cClcbiIsImltcG9ydCBJbmZpbml0ZVNjcm9sbCBmcm9tICdpbmZpbml0ZS1zY3JvbGwnO1xyXG5pbXBvcnQgQW5hbHl0aWNzTWFuYWdlciBmcm9tICcuL2xpYi9hbmFseXRpY3MnO1xyXG5cclxuaW1wb3J0IHZpZGVvUmVzcG9uc2l2ZSBmcm9tICcuL2NvbXBvbmVudHMvdmlkZW8tcmVzcG9uc2l2ZSc7XHJcbmltcG9ydCByZXNpemVJbWFnZXNJbkdhbGxlcmllcyBmcm9tICcuL2NvbXBvbmVudHMvcmVzaXplLWltYWdlcy1nYWxsZXJpZXMnO1xyXG5pbXBvcnQgaGlnaGxpZ2h0UHJpc20gZnJvbSAnLi9jb21wb25lbnRzL2hpZ2hsaWdodC1wcmlzbWpzJztcclxuaW1wb3J0IE00R2FsbGVyeSBmcm9tICcuL2NvbXBvbmVudHMvZ2FsbGVyeSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7XHJcbiAgaWYgKHdpbmRvdy5NNEluZmluaXRlU2Nyb2xsQWN0aXZlKSByZXR1cm47XHJcblxyXG4gIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1pbmZpbml0ZS1jb250YWluZXInKTtcclxuICBjb25zdCBpbml0aWFsTmV4dExpbmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtbmV4dC1wb3N0LWxpbmsnKTtcclxuICBcclxuICAvLyBNb2JpbGUgTWVudSBEaWFnbm9zdGljXHJcbiAgY29uc3QgbWVudVRvZ2dsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51LXRvZ2dsZScpO1xyXG4gIGNvbnNvbGUubG9nKCdbSW5maW5pdGVTY3JvbGxdIERPTSBDaGVjazonLCB7IFxyXG4gICAgY29udGFpbmVyOiAhIWNvbnRhaW5lciwgXHJcbiAgICBuZXh0TGluazogISFpbml0aWFsTmV4dExpbmssXHJcbiAgICBtZW51VG9nZ2xlOiAhIW1lbnVUb2dnbGUgXHJcbiAgfSk7XHJcblxyXG4gIGlmICghY29udGFpbmVyIHx8ICFpbml0aWFsTmV4dExpbmspIHJldHVybjtcclxuXHJcbiAgY29uc3QgYW5hbHl0aWNzID0gbmV3IEFuYWx5dGljc01hbmFnZXIoKTtcclxuICBjb25zdCBmaXJzdEFydGljbGUgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignLmpzLXBvc3QtYXJ0aWNsZScpO1xyXG4gIGlmIChmaXJzdEFydGljbGUpIHtcclxuICAgIGFuYWx5dGljcy5vYnNlcnZlQXJ0aWNsZShmaXJzdEFydGljbGUsIGRvY3VtZW50LnRpdGxlKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGluZlNjcm9sbCA9IG5ldyBJbmZpbml0ZVNjcm9sbChjb250YWluZXIsIHtcclxuICAgIC8vIFRoZSBwYXRoIGZ1bmN0aW9uIGlzIGV2YWx1YXRlZCBiZWZvcmUgZXZlcnkgZmV0Y2hcclxuICAgIHBhdGg6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBjb25zdCBhcnRpY2xlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1wb3N0LWFydGljbGUnKTtcclxuICAgICAgY29uc3QgbGFzdEFydGljbGUgPSBhcnRpY2xlc1thcnRpY2xlcy5sZW5ndGggLSAxXTtcclxuICAgICAgaWYgKCFsYXN0QXJ0aWNsZSkgcmV0dXJuIG51bGw7XHJcbiAgICAgIFxyXG4gICAgICBjb25zdCBuZXh0RGF0YSA9IGxhc3RBcnRpY2xlLnF1ZXJ5U2VsZWN0b3IoJy5qcy1uZXh0LXBvc3QtZGF0YScpO1xyXG4gICAgICBjb25zdCBuZXh0VXJsID0gbmV4dERhdGEgPyBuZXh0RGF0YS5kYXRhc2V0LnVybCA6IG51bGw7XHJcbiAgICAgIFxyXG4gICAgICBpZiAobmV4dFVybCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbSW5maW5pdGVTY3JvbGxdIE5leHQgdGFyZ2V0IGlkZW50aWZpZWQ6JywgbmV4dFVybCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG5leHRVcmw7XHJcbiAgICB9LFxyXG4gICAgYXBwZW5kOiAnLmpzLXBvc3QtYXJ0aWNsZScsXHJcbiAgICBoaXN0b3J5OiAncHVzaCcsXHJcbiAgICBoaXN0b3J5VGl0bGU6IHRydWUsXHJcbiAgICBzY3JvbGxUaHJlc2hvbGQ6IDgwMCxcclxuICAgIGxvYWRPblNjcm9sbDogdHJ1ZVxyXG4gIH0pO1xyXG5cclxuICBpbmZTY3JvbGwub24oJ2FwcGVuZCcsIChyZXNwb25zZSwgcGF0aCwgaXRlbXMpID0+IHtcclxuICAgIGNvbnN0IG5ld0FydGljbGUgPSBpdGVtc1swXTtcclxuICAgIGlmICghbmV3QXJ0aWNsZSkgcmV0dXJuO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKCdbSW5maW5pdGVTY3JvbGxdIEFwcGVuZGVkOicsIG5ld0FydGljbGUuZGF0YXNldC50aXRsZSk7XHJcblxyXG4gICAgLy8gUmUtaW5pdGlhbGl6ZSB0aGVtZSBsb2dpYyBmb3IgdGhlIG5ld2x5IGFkZGVkIHBvc3QgY29udGVudFxyXG4gICAgdmlkZW9SZXNwb25zaXZlKG5ld0FydGljbGUpO1xyXG4gICAgcmVzaXplSW1hZ2VzSW5HYWxsZXJpZXMobmV3QXJ0aWNsZSk7XHJcbiAgICBoaWdobGlnaHRQcmlzbShuZXdBcnRpY2xlKTtcclxuICAgIE00R2FsbGVyeSgpO1xyXG5cclxuICAgIGFuYWx5dGljcy50cmFja1BhZ2VWaWV3KG5ld0FydGljbGUuZGF0YXNldC51cmwsIG5ld0FydGljbGUuZGF0YXNldC50aXRsZSwgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKTtcclxuICAgIGFuYWx5dGljcy5vYnNlcnZlQXJ0aWNsZShuZXdBcnRpY2xlLCBuZXdBcnRpY2xlLmRhdGFzZXQudGl0bGUpO1xyXG4gIH0pO1xyXG5cclxuICBpbmZTY3JvbGwub24oJ2Vycm9yJywgKGVycm9yLCBwYXRoKSA9PiB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdbSW5maW5pdGVTY3JvbGxdIEZldGNoIGZhaWxlZDonLCBlcnJvciwgcGF0aCk7XHJcbiAgfSk7XHJcblxyXG4gIHdpbmRvdy5NNEluZmluaXRlU2Nyb2xsQWN0aXZlID0gdHJ1ZTtcclxufTsiLCIvLyBQb3N0XG4vLyBJbXBvcnRzIG1haW4uanMgd2hpY2ggaGFuZGxlcyBhbGwgc2hhcmVkIHNldHVwIChuYXYsIGRhcmsgbW9kZSwgaGFwdGljLCBldGMuKVxuLy8gVGhpcyBmaWxlIG9ubHkgYWRkcyBwb3N0LXNwZWNpZmljIGJlaGF2aW91ciBvbiB0b3AuXG5pbXBvcnQgJy4vbWFpbidcblxuaW1wb3J0IHZpZGVvUmVzcG9uc2l2ZSBmcm9tICcuL2NvbXBvbmVudHMvdmlkZW8tcmVzcG9uc2l2ZSdcbmltcG9ydCByZXNpemVJbWFnZXNJbkdhbGxlcmllcyBmcm9tICcuL2NvbXBvbmVudHMvcmVzaXplLWltYWdlcy1nYWxsZXJpZXMnXG5pbXBvcnQgaGlnaGxpZ2h0UHJpc20gZnJvbSAnLi9jb21wb25lbnRzL2hpZ2hsaWdodC1wcmlzbWpzJ1xuaW1wb3J0IE00R2FsbGVyeSBmcm9tICcuL2NvbXBvbmVudHMvZ2FsbGVyeSdcbmltcG9ydCBpc1NpbmdsZVBvc3QgZnJvbSAnLi9wb3N0L2lzLXNpbmdnbGUtcG9zdCdcblxuaW1wb3J0IGluaXRJbmZpbml0ZVNjcm9sbCBmcm9tICcuL3Bvc3QtaW5maW5pdGUnXG5cbmltcG9ydCBpbml0SWdTaGFyZVN0b3J5IGZyb20gJy4vY29tcG9uZW50cy9pZy1zaGFyZS1zdG9yeSdcblxuY29uc3QgTTRQb3N0U2V0dXAgPSAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKCdNNFBvc3RTZXR1cDogU3RhcnRpbmcgaW5pdGlhbGl6YXRpb24uLi4nKVxuXG4gIHZpZGVvUmVzcG9uc2l2ZSgpXG4gIHJlc2l6ZUltYWdlc0luR2FsbGVyaWVzKClcbiAgaGlnaGxpZ2h0UHJpc20oJ2NvZGVbY2xhc3MqPWxhbmd1YWdlLV0nKVxuICBpc1NpbmdsZVBvc3QoKVxuICBNNEdhbGxlcnkoKVxuXG4gIGluaXRJZ1NoYXJlU3RvcnkoKVxuXG4gIGNvbnNvbGUubG9nKCdNNFBvc3RTZXR1cDogSW5pdGlhbGl6aW5nIEluZmluaXRlIFNjcm9sbC4uLicpXG4gIGluaXRJbmZpbml0ZVNjcm9sbCgpXG5cbiAgLy8gSGFwdGljIGZlZWRiYWNrIGlzIGFscmVhZHkgYWN0aXZlIGZyb20gbWFpbi5qcyDigJQgdGhlIGRlbGVnYXRlZCBsaXN0ZW5lciBvblxuICAvLyBgZG9jdW1lbnRgIGF1dG9tYXRpY2FsbHkgY292ZXJzIGFydGljbGVzIGFwcGVuZGVkIGJ5IGluZmluaXRlIHNjcm9sbC5cbn1cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIE00UG9zdFNldHVwKSIsImltcG9ydCBkb2NTZWxlY3RvckFsbCBmcm9tICcuLi9hcHAvZG9jdW1lbnQtcXVlcnktc2VsZWN0b3ItYWxsJ1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7XG4gIGlmICghZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLXNpbmdsZS1wb3N0JykpIHJldHVyblxuXG4gIGNvbnN0ICRzaGFyZUJveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1zaGFyZScpXG5cbiAgaWYgKCEkc2hhcmVCb3gpIHJldHVyblxuXG4gIGNvbnN0ICRvYnNlcnZlID0gZG9jU2VsZWN0b3JBbGwoJy5rZy13aWR0aC1mdWxsLCAua2ctd2lkdGgtd2lkZScpXG5cbiAgaWYgKCEkb2JzZXJ2ZS5sZW5ndGgpIHJldHVyblxuXG4gIGlmIChkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoIDw9IDEwMDApIHJldHVyblxuXG4gIC8qIEludGVyc2VjdCBzaGFyZSBib3ggd2l0aCBpbWFnZSA9PiByZXR1cm4gdHJ1ZSBvciBmYWxzZVxuICAvKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG4gIGNvbnN0IGludGVyc2VjdHMgPSAoZWwxLCBlbDIpID0+IHtcbiAgICBjb25zdCByZWN0MSA9IGVsMS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGNvbnN0IHJlY3QyID0gZWwyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG5cbiAgICByZXR1cm4gIShyZWN0MS50b3AgPiByZWN0Mi5ib3R0b20gfHwgcmVjdDEucmlnaHQgPCByZWN0Mi5sZWZ0IHx8IHJlY3QxLmJvdHRvbSA8IHJlY3QyLnRvcCB8fCByZWN0MS5sZWZ0ID4gcmVjdDIucmlnaHQpXG4gIH1cblxuICAvKiB0aGUgZmxvYXRpbmcgZmFkZSBzaGFyaW5nIGluIHRoZSBzaWRlYmFyXG4gIC8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cbiAgY29uc3Qgc2hhcmVGYWRlID0gKCkgPT4ge1xuICAgIGxldCBpc0hpZGRlbiA9IGZhbHNlXG5cbiAgICBmb3IgKGNvbnN0IGkgaW4gJG9ic2VydmUpIHtcbiAgICAgIGlmIChpbnRlcnNlY3RzKCRzaGFyZUJveCwgJG9ic2VydmVbaV0pKSB7XG4gICAgICAgIGlzSGlkZGVuID0gdHJ1ZVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIGlzSGlkZGVuID8gJHNoYXJlQm94LmNsYXNzTGlzdC5hZGQoJ2lzLWhpZGRlbicpIDogJHNoYXJlQm94LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWhpZGRlbicpXG4gIH1cblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgc2hhcmVGYWRlLCB7IHBhc3NpdmU6IHRydWUgfSlcblxuICAvL1xufVxuIl19

//# sourceMappingURL=map/post.js.map
