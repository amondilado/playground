import '../utils/boot.js';
import { wrap } from '../utils/wrap.js';
import '../utils/settings.js';
import { FlattenedNodesObserver } from '../utils/flattened-nodes-observer.js';
export { flush, enqueueDebouncer as addDebouncer } from '../utils/flush.js';
import { Debouncer } from '../utils/debounce.js';  

const p = Element.prototype;
const normalizedMatchesSelector = p.matches || p.matchesSelector ||
  p.mozMatchesSelector || p.msMatchesSelector ||
  p.oMatchesSelector || p.webkitMatchesSelector;

export const matchesSelector = function(node, selector) {
  return normalizedMatchesSelector.call(node, selector);
};

class DomApiNative {

  constructor(node) {
    this.node = node;
  }

  observeNodes(callback) {
    return new FlattenedNodesObserver(
(this.node), callback);
  }

  unobserveNodes(observerHandle) {
    observerHandle.disconnect();
  }

  notifyObserver() {}

  deepContains(node) {
    if (wrap(this.node).contains(node)) {
      return true;
    }
    let n = node;
    let doc = node.ownerDocument;
    while (n && n !== doc && n !== this.node) {
      n = wrap(n).parentNode || wrap(n).host;
    }
    return n === this.node;
  }

  getOwnerRoot() {
    return wrap(this.node).getRootNode();
  }

  getDistributedNodes() {
    return (this.node.localName === 'slot') ?
      wrap(this.node).assignedNodes({flatten: true}) :
      [];
  }

  getDestinationInsertionPoints() {
    let ip$ = [];
    let n = wrap(this.node).assignedSlot;
    while (n) {
      ip$.push(n);
      n = wrap(n).assignedSlot;
    }
    return ip$;
  }

  importNode(node, deep) {
    let doc = this.node instanceof Document ? this.node :
      this.node.ownerDocument;
    return wrap(doc).importNode(node, deep);
  }

  getEffectiveChildNodes() {
    return FlattenedNodesObserver.getFlattenedNodes(
 (this.node));
  }

  queryDistributedElements(selector) {
    let c$ = this.getEffectiveChildNodes();
    let list = [];
    for (let i=0, l=c$.length, c; (i<l) && (c=c$[i]); i++) {
      if ((c.nodeType === Node.ELEMENT_NODE) &&
          matchesSelector(c, selector)) {
        list.push(c);
      }
    }
    return list;
  }

  get activeElement() {
    let node = this.node;
    return node._activeElement !== undefined ? node._activeElement : node.activeElement;
  }
}

function forwardMethods(proto, methods) {
  for (let i=0; i < methods.length; i++) {
    let method = methods[i];
    proto[method] =  function() {
      return this.node[method].apply(this.node, arguments);
    };
  }
}

function forwardReadOnlyProperties(proto, properties) {
  for (let i=0; i < properties.length; i++) {
    let name = properties[i];
    Object.defineProperty(proto, name, {
      get: function() {
        const domApi = (this);
        return domApi.node[name];
      },
      configurable: true
    });
  }
}

function forwardProperties(proto, properties) {
  for (let i=0; i < properties.length; i++) {
    let name = properties[i];
    Object.defineProperty(proto, name, {
      get: function() {
        return this.node[name];
      },
      set: function(value) {
        this.node[name] = value;
      },
      configurable: true
    });
  }
}


export class EventApi {
  constructor(event) {
    this.event = event;
  }

  get rootTarget() {
    return this.path[0];
  }

  get localTarget() {
    return this.event.target;
  }

  get path() {
    return this.event.composedPath();
  }
}

DomApiNative.prototype.cloneNode;
DomApiNative.prototype.appendChild;
DomApiNative.prototype.insertBefore;
DomApiNative.prototype.removeChild;
DomApiNative.prototype.replaceChild;
DomApiNative.prototype.setAttribute;
DomApiNative.prototype.removeAttribute;
DomApiNative.prototype.querySelector;
DomApiNative.prototype.querySelectorAll;

DomApiNative.prototype.parentNode;
DomApiNative.prototype.firstChild;
DomApiNative.prototype.lastChild;
DomApiNative.prototype.nextSibling;
DomApiNative.prototype.previousSibling;
DomApiNative.prototype.firstElementChild;
DomApiNative.prototype.lastElementChild;
DomApiNative.prototype.nextElementSibling;
DomApiNative.prototype.previousElementSibling;
DomApiNative.prototype.childNodes;
DomApiNative.prototype.children;
DomApiNative.prototype.classList;

DomApiNative.prototype.textContent;
DomApiNative.prototype.innerHTML;

let DomApiImpl = DomApiNative;

if (window['ShadyDOM'] && window['ShadyDOM']['inUse'] && window['ShadyDOM']['noPatch'] && window['ShadyDOM']['Wrapper']) {

  class Wrapper extends window['ShadyDOM']['Wrapper'] {}

  Object.getOwnPropertyNames(DomApiNative.prototype).forEach((prop) => {
    if (prop != 'activeElement') {
      Wrapper.prototype[prop] = DomApiNative.prototype[prop];
    }
  });

  forwardReadOnlyProperties(Wrapper.prototype, [
    'classList'
  ]);

  DomApiImpl = Wrapper;

  Object.defineProperties(EventApi.prototype, {

    localTarget: {
      get() {
        return this.event.currentTarget;
      },
      configurable: true
    },

    path: {
      get() {
        return window['ShadyDOM']['composedPath'](this.event);
      },
      configurable: true
    }
  });

} else {

  forwardMethods(DomApiNative.prototype, [
    'cloneNode', 'appendChild', 'insertBefore', 'removeChild',
    'replaceChild', 'setAttribute', 'removeAttribute',
    'querySelector', 'querySelectorAll'
  ]);

  forwardReadOnlyProperties(DomApiNative.prototype, [
    'parentNode', 'firstChild', 'lastChild',
    'nextSibling', 'previousSibling', 'firstElementChild',
    'lastElementChild', 'nextElementSibling', 'previousElementSibling',
    'childNodes', 'children', 'classList'
  ]);

  forwardProperties(DomApiNative.prototype, [
    'textContent', 'innerHTML'
  ]);
}

export const DomApi = DomApiImpl;

export const dom = function(obj) {
  obj = obj || document;
  if (obj instanceof DomApiImpl) {
    return (obj);
  }
  if (obj instanceof EventApi) {
    return (obj);
  }
  let helper = obj['__domApi'];
  if (!helper) {
    if (obj instanceof Event) {
      helper = new EventApi(obj);
    } else {
      helper = new DomApiImpl((obj));
    }
    obj['__domApi'] = helper;
  }
  return helper;
};
