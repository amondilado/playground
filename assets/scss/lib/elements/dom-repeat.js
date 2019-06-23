import { PolymerElement } from '../../polymer-element.js';

import { TemplateInstanceBase, templatize, modelForElement } from '../utils/templatize.js'; 
import { Debouncer } from '../utils/debounce.js';
import { enqueueDebouncer, flush } from '../utils/flush.js';
import { OptionalMutableData } from '../mixins/mutable-data.js';
import { matches, translate } from '../utils/path.js';
import { timeOut, microTask } from '../utils/async.js';
import { wrap } from '../utils/wrap.js';

const domRepeatBase = OptionalMutableData(PolymerElement);

export class DomRepeat extends domRepeatBase {

  static get is() { return 'dom-repeat'; }

  static get template() { return null; }

  static get properties() {

    return {

      items: {
        type: Array
      },

      as: {
        type: String,
        value: 'item'
      },

      indexAs: {
        type: String,
        value: 'index'
      },

      itemsIndexAs: {
        type: String,
        value: 'itemsIndex'
      },

      sort: {
        type: Function,
        observer: '__sortChanged'
      },

      filter: {
        type: Function,
        observer: '__filterChanged'
      },

      observe: {
        type: String,
        observer: '__observeChanged'
      },

      delay: Number,

      renderedItemCount: {
        type: Number,
        notify: true,
        readOnly: true
      },

      initialCount: {
        type: Number,
        observer: '__initializeChunking'
      },

      targetFramerate: {
        type: Number,
        value: 20
      },

      _targetFrameTime: {
        type: Number,
        computed: '__computeFrameTime(targetFramerate)'
      }

    };

  }

  static get observers() {
    return [ '__itemsChanged(items.*)' ];
  }

  constructor() {
    super();
    this.__instances = [];
    this.__limit = Infinity;
    this.__pool = [];
    this.__renderDebouncer = null;
    this.__itemsIdxToInstIdx = {};
    this.__chunkCount = null;
    this.__lastChunkTime = null;
    this.__sortFn = null;
    this.__filterFn = null;
    this.__observePaths = null;
    this.__ctor = null;
    this.__isDetached = true;
    this.template = null;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.__isDetached = true;
    for (let i=0; i<this.__instances.length; i++) {
      this.__detachInstance(i);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.style.display = 'none';
    if (this.__isDetached) {
      this.__isDetached = false;
      let wrappedParent = wrap(wrap(this).parentNode);
      for (let i=0; i<this.__instances.length; i++) {
        this.__attachInstance(i, wrappedParent);
      }
    }
  }

  __ensureTemplatized() {
    if (!this.__ctor) {
      let template = this.template = (this.querySelector('template'));
      if (!template) {
        let observer = new MutationObserver(() => {
          if (this.querySelector('template')) {
            observer.disconnect();
            this.__render();
          } else {
            throw new Error('dom-repeat requires a <template> child');
          }
        });
        observer.observe(this, {childList: true});
        return false;
      }
      let instanceProps = {};
      instanceProps[this.as] = true;
      instanceProps[this.indexAs] = true;
      instanceProps[this.itemsIndexAs] = true;
      this.__ctor = templatize(template, this, {
        mutableData: this.mutableData,
        parentModel: true,
        instanceProps: instanceProps,
        forwardHostProp: function(prop, value) {
          let i$ = this.__instances;
          for (let i=0, inst; (i<i$.length) && (inst=i$[i]); i++) {
            inst.forwardHostProp(prop, value);
          }
        },
        notifyInstanceProp: function(inst, prop, value) {
          if (matches(this.as, prop)) {
            let idx = inst[this.itemsIndexAs];
            if (prop == this.as) {
              this.items[idx] = value;
            }
            let path = translate(this.as, `${JSCompiler_renameProperty('items', this)}.${idx}`, prop);
            this.notifyPath(path, value);
          }
        }
      });
    }
    return true;
  }

  __getMethodHost() {
    return this.__dataHost._methodHost || this.__dataHost;
  }

  __functionFromPropertyValue(functionOrMethodName) {
    if (typeof functionOrMethodName === 'string') {
      let methodName = functionOrMethodName;
      let obj = this.__getMethodHost();
      return function() { return obj[methodName].apply(obj, arguments); };
    }

    return functionOrMethodName;
  }

  __sortChanged(sort) {
    this.__sortFn = this.__functionFromPropertyValue(sort);
    if (this.items) { this.__debounceRender(this.__render); }
  }

  __filterChanged(filter) {
    this.__filterFn = this.__functionFromPropertyValue(filter);
    if (this.items) { this.__debounceRender(this.__render); }
  }

  __computeFrameTime(rate) {
    return Math.ceil(1000/rate);
  }

  __initializeChunking() {
    if (this.initialCount) {
      this.__limit = this.initialCount;
      this.__chunkCount = this.initialCount;
      this.__lastChunkTime = performance.now();
    }
  }

  __tryRenderChunk() {
    if (this.items && this.__limit < this.items.length) {
      this.__debounceRender(this.__requestRenderChunk);
    }
  }

  __requestRenderChunk() {
    requestAnimationFrame(()=>this.__renderChunk());
  }

  __renderChunk() {
    let currChunkTime = performance.now();
    let ratio = this._targetFrameTime / (currChunkTime - this.__lastChunkTime);
    this.__chunkCount = Math.round(this.__chunkCount * ratio) || 1;
    this.__limit += this.__chunkCount;
    this.__lastChunkTime = currChunkTime;
    this.__debounceRender(this.__render);
  }

  __observeChanged() {
    this.__observePaths = this.observe &&
      this.observe.replace('.*', '.').split(' ');
  }

  __itemsChanged(change) {
    if (this.items && !Array.isArray(this.items)) {
      console.warn('dom-repeat expected array for `items`, found', this.items);
    }
    if (!this.__handleItemPath(change.path, change.value)) {
      this.__initializeChunking();
      this.__debounceRender(this.__render);
    }
  }

  __handleObservedPaths(path) {
    if (this.__sortFn || this.__filterFn) {
      if (!path) {
        this.__debounceRender(this.__render, this.delay);
      } else if (this.__observePaths) {
        let paths = this.__observePaths;
        for (let i=0; i<paths.length; i++) {
          if (path.indexOf(paths[i]) === 0) {
            this.__debounceRender(this.__render, this.delay);
          }
        }
      }
    }
  }

  __debounceRender(fn, delay = 0) {
    this.__renderDebouncer = Debouncer.debounce(
          this.__renderDebouncer
        , delay > 0 ? timeOut.after(delay) : microTask
        , fn.bind(this));
    enqueueDebouncer(this.__renderDebouncer);
  }

  render() {
    this.__debounceRender(this.__render);
    flush();
  }

  __render() {
    if (!this.__ensureTemplatized()) {
      return;
    }
    this.__applyFullRefresh();
    this.__pool.length = 0;
    this._setRenderedItemCount(this.__instances.length);
    this.dispatchEvent(new CustomEvent('dom-change', {
      bubbles: true,
      composed: true
    }));
    this.__tryRenderChunk();
  }

  __applyFullRefresh() {
    let items = this.items || [];
    let isntIdxToItemsIdx = new Array(items.length);
    for (let i=0; i<items.length; i++) {
      isntIdxToItemsIdx[i] = i;
    }
    if (this.__filterFn) {
      isntIdxToItemsIdx = isntIdxToItemsIdx.filter((i, idx, array) =>
        this.__filterFn(items[i], idx, array));
    }
    if (this.__sortFn) {
      isntIdxToItemsIdx.sort((a, b) => this.__sortFn(items[a], items[b]));
    }
    const itemsIdxToInstIdx = this.__itemsIdxToInstIdx = {};
    let instIdx = 0;
    const limit = Math.min(isntIdxToItemsIdx.length, this.__limit);
    for (; instIdx<limit; instIdx++) {
      let inst = this.__instances[instIdx];
      let itemIdx = isntIdxToItemsIdx[instIdx];
      let item = items[itemIdx];
      itemsIdxToInstIdx[itemIdx] = instIdx;
      if (inst) {
        inst._setPendingProperty(this.as, item);
        inst._setPendingProperty(this.indexAs, instIdx);
        inst._setPendingProperty(this.itemsIndexAs, itemIdx);
        inst._flushProperties();
      } else {
        this.__insertInstance(item, instIdx, itemIdx);
      }
    }
    for (let i=this.__instances.length-1; i>=instIdx; i--) {
      this.__detachAndRemoveInstance(i);
    }
  }

  __detachInstance(idx) {
    let inst = this.__instances[idx];
    const wrappedRoot = wrap(inst.root);
    for (let i=0; i<inst.children.length; i++) {
      let el = inst.children[i];
      wrappedRoot.appendChild(el);
    }
    return inst;
  }

  __attachInstance(idx, parent) {
    let inst = this.__instances[idx];
    parent.insertBefore(inst.root, this);
  }

  __detachAndRemoveInstance(idx) {
    let inst = this.__detachInstance(idx);
    if (inst) {
      this.__pool.push(inst);
    }
    this.__instances.splice(idx, 1);
  }

  __stampInstance(item, instIdx, itemIdx) {
    let model = {};
    model[this.as] = item;
    model[this.indexAs] = instIdx;
    model[this.itemsIndexAs] = itemIdx;
    return new this.__ctor(model);
  }

  __insertInstance(item, instIdx, itemIdx) {
    let inst = this.__pool.pop();
    if (inst) {
      inst._setPendingProperty(this.as, item);
      inst._setPendingProperty(this.indexAs, instIdx);
      inst._setPendingProperty(this.itemsIndexAs, itemIdx);
      inst._flushProperties();
    } else {
      inst = this.__stampInstance(item, instIdx, itemIdx);
    }
    let beforeRow = this.__instances[instIdx + 1];
    let beforeNode = beforeRow ? beforeRow.children[0] : this;
    wrap(wrap(this).parentNode).insertBefore(inst.root, beforeNode);
    this.__instances[instIdx] = inst;
    return inst;
  }

  _showHideChildren(hidden) {
    for (let i=0; i<this.__instances.length; i++) {
      this.__instances[i]._showHideChildren(hidden);
    }
  }

  __handleItemPath(path, value) {
    let itemsPath = path.slice(6); 
    let dot = itemsPath.indexOf('.');
    let itemsIdx = dot < 0 ? itemsPath : itemsPath.substring(0, dot);
    if (itemsIdx == parseInt(itemsIdx, 10)) {
      let itemSubPath = dot < 0 ? '' : itemsPath.substring(dot+1);
      this.__handleObservedPaths(itemSubPath);
      let instIdx = this.__itemsIdxToInstIdx[itemsIdx];
      let inst = this.__instances[instIdx];
      if (inst) {
        let itemPath = this.as + (itemSubPath ? '.' + itemSubPath : '');
        inst._setPendingPropertyOrPath(itemPath, value, false, true);
        inst._flushProperties();
      }
      return true;
    }
  }

  itemForElement(el) {
    let instance = this.modelForElement(el);
    return instance && instance[this.as];
  }

  indexForElement(el) {
    let instance = this.modelForElement(el);
    return instance && instance[this.indexAs];
  }

  modelForElement(el) {
    return modelForElement(this.template, el);
  }

}

customElements.define(DomRepeat.is, DomRepeat);
