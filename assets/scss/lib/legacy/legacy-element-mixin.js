import '@webcomponents/shadycss/entrypoints/apply-shim.js';
import { ElementMixin } from '../mixins/element-mixin.js';
import { GestureEventListeners } from '../mixins/gesture-event-listeners.js';
import { DirMixin } from '../mixins/dir-mixin.js';
import { dedupingMixin } from '../utils/mixin.js';
import '../utils/render-status.js';
import '../utils/unresolved.js';
import { dom, matchesSelector } from './polymer.dom.js';
import { setTouchAction } from '../utils/gestures.js';
import { Debouncer } from '../utils/debounce.js';
import { timeOut, microTask } from '../utils/async.js';
import { get } from '../utils/path.js';
import { wrap } from '../utils/wrap.js';

let styleInterface = window.ShadyCSS;

export const LegacyElementMixin = dedupingMixin((base) => {
  const legacyElementBase = DirMixin(GestureEventListeners(ElementMixin(base)));

  const DIRECTION_MAP = {
    'x': 'pan-x',
    'y': 'pan-y',
    'none': 'none',
    'all': 'auto'
  };

  class LegacyElement extends legacyElementBase {

    constructor() {
      super();
      this.isAttached;
      this.__boundListeners;
      this._debouncers;
    }

    static get importMeta() {
      return this.prototype.importMeta;
    }

    created() {}

    connectedCallback() {
      super.connectedCallback();
      this.isAttached = true;
      this.attached();
    }

    attached() {}

    disconnectedCallback() {
      super.disconnectedCallback();
      this.isAttached = false;
      this.detached();
    }

    detached() {}

    attributeChangedCallback(name, old, value, namespace) {
      if (old !== value) {
        super.attributeChangedCallback(name, old, value, namespace);
        this.attributeChanged(name, old, value);
      }
    }

    attributeChanged(name, old, value) {} 

    _initializeProperties() {
      let proto = Object.getPrototypeOf(this);
      if (!proto.hasOwnProperty('__hasRegisterFinished')) {
        this._registered();
        proto.__hasRegisterFinished = true;
      }
      super._initializeProperties();
      this.root = (this);
      this.created();
      this._applyListeners();
    }

    _registered() {}

    ready() {
      this._ensureAttributes();
      super.ready();
    }

    _ensureAttributes() {}

    _applyListeners() {}

    serialize(value) {
      return this._serializeValue(value);
    }

    deserialize(value, type) {
      return this._deserializeValue(value, type);
    }

    reflectPropertyToAttribute(property, attribute, value) {
      this._propertyToAttribute(property, attribute, value);
    }

    serializeValueToAttribute(value, attribute, node) {
      this._valueToNodeAttribute( (node || this), value, attribute);
    }

    extend(prototype, api) {
      if (!(prototype && api)) {
        return prototype || api;
      }
      let n$ = Object.getOwnPropertyNames(api);
      for (let i=0, n; (i<n$.length) && (n=n$[i]); i++) {
        let pd = Object.getOwnPropertyDescriptor(api, n);
        if (pd) {
          Object.defineProperty(prototype, n, pd);
        }
      }
      return prototype;
    }

    mixin(target, source) {
      for (let i in source) {
        target[i] = source[i];
      }
      return target;
    }

    chainObject(object, prototype) {
      if (object && prototype && object !== prototype) {
        object.__proto__ = prototype;
      }
      return object;
    }


    instanceTemplate(template) {
      let content = this.constructor._contentForTemplate(template);
      let dom = 
        (document.importNode(content, true));
      return dom;
    }




    fire(type, detail, options) {
      options = options || {};
      detail = (detail === null || detail === undefined) ? {} : detail;
      let event = new Event(type, {
        bubbles: options.bubbles === undefined ? true : options.bubbles,
        cancelable: Boolean(options.cancelable),
        composed: options.composed === undefined ? true: options.composed
      });
      event.detail = detail;
      let node = options.node || this;
      wrap(node).dispatchEvent(event);
      return event;
    }

    listen(node, eventName, methodName) {
      node =  (node || this);
      let hbl = this.__boundListeners ||
        (this.__boundListeners = new WeakMap());
      let bl = hbl.get(node);
      if (!bl) {
        bl = {};
        hbl.set(node, bl);
      }
      let key = eventName + methodName;
      if (!bl[key]) {
        bl[key] = this._addMethodEventListenerToNode(
 (node), eventName, methodName, this);
      }
    }

    unlisten(node, eventName, methodName) {
      node =  (node || this);
      let bl = this.__boundListeners &&
          this.__boundListeners.get( (node));
      let key = eventName + methodName;
      let handler = bl && bl[key];
      if (handler) {
        this._removeEventListenerFromNode(
 (node), eventName, handler);
        bl[key] =  (null);
      }
    }

    setScrollDirection(direction, node) {
      setTouchAction(
 (node || this),
          DIRECTION_MAP[direction] || 'auto');
    }

    $$(slctr) {
      return this.root.querySelector(slctr);
    }

    get domHost() {
      let root = wrap(this).getRootNode();
      return (root instanceof DocumentFragment) ?  (root).host : root;
    }

    distributeContent() {
      const thisEl =  (this);
      const domApi = (dom(thisEl));
      if (window.ShadyDOM && domApi.shadowRoot) {
        ShadyDOM.flush();
      }
    }

    getEffectiveChildNodes() {
      const thisEl =  (this);
      const domApi =  (dom(thisEl));
      return domApi.getEffectiveChildNodes();
    }

    queryDistributedElements(selector) {
      const thisEl =  (this);
      const domApi =  (dom(thisEl));
      return domApi.queryDistributedElements(selector);
    }

    getEffectiveChildren() {
      let list = this.getEffectiveChildNodes();
      return list.filter(function( n) {
        return (n.nodeType === Node.ELEMENT_NODE);
      });
    }

    getEffectiveTextContent() {
      let cn = this.getEffectiveChildNodes();
      let tc = [];
      for (let i=0, c; (c = cn[i]); i++) {
        if (c.nodeType !== Node.COMMENT_NODE) {
          tc.push(c.textContent);
        }
      }
      return tc.join('');
    }

    queryEffectiveChildren(selector) {
      let e$ = this.queryDistributedElements(selector);
      return e$ && e$[0];
    }

    queryAllEffectiveChildren(selector) {
      return this.queryDistributedElements(selector);
    }

    getContentChildNodes(slctr) {
      let content = this.root.querySelector(slctr || 'slot');
      return content ?
 (dom(content)).getDistributedNodes() :
          [];
    }

    getContentChildren(slctr) {
      let children = (this.getContentChildNodes(slctr).filter(function(n) {
        return (n.nodeType === Node.ELEMENT_NODE);
      }));
      return children;
    }

    isLightDescendant(node) {
      const thisNode =  (this);
      return thisNode !== node && wrap(thisNode).contains(node) &&
        wrap(thisNode).getRootNode() === wrap(node).getRootNode();
    }

    isLocalDescendant(node) {
      return this.root === wrap(node).getRootNode();
    }

    scopeSubtree(container, shouldObserve) { 
    }

    getComputedStyleValue(property) {
      return styleInterface.getComputedStyleValue((this), property);
    }


    debounce(jobName, callback, wait) {
      this._debouncers = this._debouncers || {};
      return this._debouncers[jobName] = Debouncer.debounce(
            this._debouncers[jobName]
          , wait > 0 ? timeOut.after(wait) : microTask
          , callback.bind(this));
    }

    isDebouncerActive(jobName) {
      this._debouncers = this._debouncers || {};
      let debouncer = this._debouncers[jobName];
      return !!(debouncer && debouncer.isActive());
    }

    flushDebouncer(jobName) {
      this._debouncers = this._debouncers || {};
      let debouncer = this._debouncers[jobName];
      if (debouncer) {
        debouncer.flush();
      }
    }

    cancelDebouncer(jobName) {
      this._debouncers = this._debouncers || {};
      let debouncer = this._debouncers[jobName];
      if (debouncer) {
        debouncer.cancel();
      }
    }

    async(callback, waitTime) {
      return waitTime > 0 ? timeOut.run(callback.bind(this), waitTime) :
          ~microTask.run(callback.bind(this));
    }

    cancelAsync(handle) {
      handle < 0 ? microTask.cancel(~handle) :
          timeOut.cancel(handle);
    }


    create(tag, props) {
      let elt = document.createElement(tag);
      if (props) {
        if (elt.setProperties) {
          elt.setProperties(props);
        } else {
          for (let n in props) {
            elt[n] = props[n];
          }
        }
      }
      return elt;
    }

    elementMatches(selector, node) {
      return matchesSelector( (node || this), selector);
    }

    toggleAttribute(name, bool) {
      let node = (this);
      if (arguments.length === 3) {
        node = (arguments[2]);
      }
      if (arguments.length == 1) {
        bool = !node.hasAttribute(name);
      }
      if (bool) {
        wrap(node).setAttribute(name, '');
        return true;
      } else {
        wrap(node).removeAttribute(name);
        return false;
      }
    }


    toggleClass(name, bool, node) {
      node =  (node || this);
      if (arguments.length == 1) {
        bool = !node.classList.contains(name);
      }
      if (bool) {
        node.classList.add(name);
      } else {
        node.classList.remove(name);
      }
    }

    transform(transformText, node) {
      node =  (node || this);
      node.style.webkitTransform = transformText;
      node.style.transform = transformText;
    }

    translate3d(x, y, z, node) {
      node =  (node || this);
      this.transform('translate3d(' + x + ',' + y + ',' + z + ')', node);
    }

    arrayDelete(arrayOrPath, item) {
      let index;
      if (Array.isArray(arrayOrPath)) {
        index = arrayOrPath.indexOf(item);
        if (index >= 0) {
          return arrayOrPath.splice(index, 1);
        }
      } else {
        let arr = get(this, arrayOrPath);
        index = arr.indexOf(item);
        if (index >= 0) {
          return this.splice(arrayOrPath, index, 1);
        }
      }
      return null;
    }


    _logger(level, args) {
      if (Array.isArray(args) && args.length === 1 && Array.isArray(args[0])) {
        args = args[0];
      }
      switch(level) {
        case 'log':
        case 'warn':
        case 'error':
          console[level](...args);
      }
    }

    _log(...args) {
      this._logger('log', args);
    }

    _warn(...args) {
      this._logger('warn', args);
    }

    _error(...args) {
      this._logger('error', args);
    }

    _logf(methodName, ...args) {
      return ['[%s::%s]', this.is, methodName, ...args];
    }

  }

  LegacyElement.prototype.is = '';

  return LegacyElement;
});
