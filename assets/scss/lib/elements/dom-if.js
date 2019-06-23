import { PolymerElement } from '../../polymer-element.js';

import { templatize } from '../utils/templatize.js';
import { Debouncer } from '../utils/debounce.js';
import { enqueueDebouncer, flush } from '../utils/flush.js';
import { microTask } from '../utils/async.js';
import { root } from '../utils/path.js';
import { wrap } from '../utils/wrap.js';

export class DomIf extends PolymerElement {

  static get is() { return 'dom-if'; }

  static get template() { return null; }

  static get properties() {

    return {


      if: {
        type: Boolean,
        observer: '__debounceRender'
      },

      restamp: {
        type: Boolean,
        observer: '__debounceRender'
      }

    };

  }

  constructor() {
    super();
    this.__renderDebouncer = null;
    this.__invalidProps = null;
    this.__instance = null;
    this._lastIf = false;
    this.__ctor = null;
    this.__hideTemplateChildren__ = false;
  }

  __debounceRender() {
    this.__renderDebouncer = Debouncer.debounce(
          this.__renderDebouncer
        , microTask
        , () => this.__render());
    enqueueDebouncer(this.__renderDebouncer);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const parent = wrap(this).parentNode;
    if (!parent || (parent.nodeType == Node.DOCUMENT_FRAGMENT_NODE &&
        !wrap(parent).host)) {
      this.__teardownInstance();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.style.display = 'none';
    if (this.if) {
      this.__debounceRender();
    }
  }

  render() {
    flush();
  }

  __render() {
    if (this.if) {
      if (!this.__ensureInstance()) {
        return;
      }
      this._showHideChildren();
    } else if (this.restamp) {
      this.__teardownInstance();
    }
    if (!this.restamp && this.__instance) {
      this._showHideChildren();
    }
    if (this.if != this._lastIf) {
      this.dispatchEvent(new CustomEvent('dom-change', {
        bubbles: true,
        composed: true
      }));
      this._lastIf = this.if;
    }
  }

  __ensureInstance() {
    let parentNode = wrap(this).parentNode;
    if (parentNode) {
      if (!this.__ctor) {
        let template = (wrap(this).querySelector('template'));
        if (!template) {
          let observer = new MutationObserver(() => {
            if (wrap(this).querySelector('template')) {
              observer.disconnect();
              this.__render();
            } else {
              throw new Error('dom-if requires a <template> child');
            }
          });
          observer.observe(this, {childList: true});
          return false;
        }
        this.__ctor = templatize(template, this, {
          mutableData: true,
          forwardHostProp: function(prop, value) {
            if (this.__instance) {
              if (this.if) {
                this.__instance.forwardHostProp(prop, value);
              } else {
                this.__invalidProps = this.__invalidProps || Object.create(null);
                this.__invalidProps[root(prop)] = true;
              }
            }
          }
        });
      }
      if (!this.__instance) {
        this.__instance = new this.__ctor();
        wrap(parentNode).insertBefore(this.__instance.root, this);
      } else {
        this.__syncHostProperties();
        let c$ = this.__instance.children;
        if (c$ && c$.length) {
          let lastChild = wrap(this).previousSibling;
          if (lastChild !== c$[c$.length-1]) {
            for (let i=0, n; (i<c$.length) && (n=c$[i]); i++) {
              wrap(parentNode).insertBefore(n, this);
            }
          }
        }
      }
    }
    return true;
  }

  __syncHostProperties() {
    let props = this.__invalidProps;
    if (props) {
      for (let prop in props) {
        this.__instance._setPendingProperty(prop, this.__dataHost[prop]);
      }
      this.__invalidProps = null;
      this.__instance._flushProperties();
    }
  }

  __teardownInstance() {
    if (this.__instance) {
      let c$ = this.__instance.children;
      if (c$ && c$.length) {
        let parent = wrap(c$[0]).parentNode;
        if (parent) {
          parent = wrap(parent);
          for (let i=0, n; (i<c$.length) && (n=c$[i]); i++) {
            parent.removeChild(n);
          }
        }
      }
      this.__instance = null;
      this.__invalidProps = null;
    }
  }

  _showHideChildren() {
    let hidden = this.__hideTemplateChildren__ || !this.if;
    if (this.__instance) {
      this.__instance._showHideChildren(hidden);
    }
  }

}

customElements.define(DomIf.is, DomIf);
