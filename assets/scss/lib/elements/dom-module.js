import '../utils/boot.js';

import { resolveUrl, pathFromUrl } from '../utils/resolve-url.js';
import { strictTemplatePolicy } from '../utils/settings.js';

let modules = {};
let lcModules = {};
function setModule(id, module) {
  modules[id] = lcModules[id.toLowerCase()] = module;
}
function findModule(id) {
  return modules[id] || lcModules[id.toLowerCase()];
}

function styleOutsideTemplateCheck(inst) {
  if (inst.querySelector('style')) {
    console.warn('dom-module %s has style outside template', inst.id);
  }
}

export class DomModule extends HTMLElement {

  static get observedAttributes() { return ['id']; }

  static import(id, selector) {
    if (id) {
      let m = findModule(id);
      if (m && selector) {
        return m.querySelector(selector);
      }
      return m;
    }
    return null;
  }

  attributeChangedCallback(name, old, value, namespace) {
    if (old !== value) {
      this.register();
    }
  }

  get assetpath() {
    if (!this.__assetpath) {
      const owner = window.HTMLImports && HTMLImports.importForElement ?
        HTMLImports.importForElement(this) || document : this.ownerDocument;
      const url = resolveUrl(
        this.getAttribute('assetpath') || '', owner.baseURI);
      this.__assetpath = pathFromUrl(url);
    }
    return this.__assetpath;
  }

  register(id) {
    id = id || this.id;
    if (id) {
      if (strictTemplatePolicy && findModule(id) !== undefined) {
        setModule(id, null);
        throw new Error(`strictTemplatePolicy: dom-module ${id} re-registered`);
      }
      this.id = id;
      setModule(id, this);
      styleOutsideTemplateCheck(this);
    }
  }
}

DomModule.prototype['modules'] = modules;

customElements.define('dom-module', DomModule);
