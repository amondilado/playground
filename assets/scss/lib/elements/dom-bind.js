import '../utils/boot.js';

import { PropertyEffects } from '../mixins/property-effects.js';
import { OptionalMutableData } from '../mixins/mutable-data.js';
import { GestureEventListeners } from '../mixins/gesture-event-listeners.js';
import { strictTemplatePolicy } from '../utils/settings.js';
import { wrap } from '../utils/wrap.js';

const domBindBase =
  GestureEventListeners(
    OptionalMutableData(
      PropertyEffects(HTMLElement)));

export class DomBind extends domBindBase {

  static get observedAttributes() { return ['mutable-data']; }

  constructor() {
    super();
    if (strictTemplatePolicy) {
      throw new Error(`strictTemplatePolicy: dom-bind not allowed`);
    }
    this.root = null;
    this.$ = null;
    this.__children = null;
  }

  attributeChangedCallback() {
    this.mutableData = true;
  }

  connectedCallback() {
    this.style.display = 'none';
    this.render();
  }

  disconnectedCallback() {
    this.__removeChildren();
  }

  __insertChildren() {
    wrap(wrap(this).parentNode).insertBefore(this.root, this);
  }

  __removeChildren() {
    if (this.__children) {
      for (let i=0; i<this.__children.length; i++) {
        this.root.appendChild(this.__children[i]);
      }
    }
  }

  render() {
    let template;
    if (!this.__children) {
      template = (template || this.querySelector('template'));
      if (!template) {
        let observer = new MutationObserver(() => {
          template = (this.querySelector('template'));
          if (template) {
            observer.disconnect();
            this.render();
          } else {
            throw new Error('dom-bind requires a <template> child');
          }
        });
        observer.observe(this, {childList: true});
        return;
      }
      this.root = this._stampTemplate(
(template));
      this.$ = this.root.$;
      this.__children = [];
      for (let n=this.root.firstChild; n; n=n.nextSibling) {
        this.__children[this.__children.length] = n;
      }
      this._enableProperties();
    }
    this.__insertChildren();
    this.dispatchEvent(new CustomEvent('dom-change', {
      bubbles: true,
      composed: true
    }));
  }

}

customElements.define('dom-bind', DomBind);
