import '@webcomponents/shadycss/entrypoints/custom-style-interface.js';

import { cssFromModules } from '../utils/style-gather.js';

const attr = 'include';

const CustomStyleInterface = window.ShadyCSS.CustomStyleInterface;

export class CustomStyle extends HTMLElement {
  constructor() {
    super();
    this._style = null;
    CustomStyleInterface.addCustomStyle(this);
  }
  getStyle() {
    if (this._style) {
      return this._style;
    }
    const style = (this.querySelector('style'));
    if (!style) {
      return null;
    }
    this._style = style;
    const include = style.getAttribute(attr);
    if (include) {
      style.removeAttribute(attr);
      style.textContent = cssFromModules(include) + style.textContent;
    }
    if (this.ownerDocument !== window.document) {
      window.document.head.appendChild(this);
    }
    return this._style;
  }
}

window.customElements.define('custom-style', CustomStyle);
