import { PropertyAccessors } from './property-accessors.js';

import { dedupingMixin } from '../utils/mixin.js';

const HOST_DIR = /:host\(:dir\((ltr|rtl)\)\)/g;
const HOST_DIR_REPLACMENT = ':host([dir="$1"])';

const EL_DIR = /([\s\w-#\.\[\]\*]*):dir\((ltr|rtl)\)/g;
const EL_DIR_REPLACMENT = ':host([dir="$2"]) $1';

const DIR_CHECK = /:dir\((?:ltr|rtl)\)/;

const SHIM_SHADOW = Boolean(window['ShadyDOM'] && window['ShadyDOM']['inUse']);

const DIR_INSTANCES = [];

let observer = null;

let DOCUMENT_DIR = '';

function getRTL() {
  DOCUMENT_DIR = document.documentElement.getAttribute('dir');
}

function setRTL(instance) {
  if (!instance.__autoDirOptOut) {
    const el = (instance);
    el.setAttribute('dir', DOCUMENT_DIR);
  }
}

function updateDirection() {
  getRTL();
  DOCUMENT_DIR = document.documentElement.getAttribute('dir');
  for (let i = 0; i < DIR_INSTANCES.length; i++) {
    setRTL(DIR_INSTANCES[i]);
  }
}

function takeRecords() {
  if (observer && observer.takeRecords().length) {
    updateDirection();
  }
}

export const DirMixin = dedupingMixin((base) => {

  if (!SHIM_SHADOW) {
    if (!observer) {
      getRTL();
      observer = new MutationObserver(updateDirection);
      observer.observe(document.documentElement, {attributes: true, attributeFilter: ['dir']});
    }
  }

  const elementBase = PropertyAccessors(base);

  class Dir extends elementBase {

    static _processStyleText(cssText, baseURI) {
      cssText = super._processStyleText(cssText, baseURI);
      if (!SHIM_SHADOW && DIR_CHECK.test(cssText)) {
        cssText = this._replaceDirInCssText(cssText);
        this.__activateDir = true;
      }
      return cssText;
    }

    static _replaceDirInCssText(text) {
      let replacedText = text;
      replacedText = replacedText.replace(HOST_DIR, HOST_DIR_REPLACMENT);
      replacedText = replacedText.replace(EL_DIR, EL_DIR_REPLACMENT);
      return replacedText;
    }

    constructor() {
      super();
      this.__autoDirOptOut = false;
    }

    ready() {
      super.ready();
      this.__autoDirOptOut = (this).hasAttribute('dir');
    }

    connectedCallback() {
      if (elementBase.prototype.connectedCallback) {
        super.connectedCallback();
      }
      if (this.constructor.__activateDir) {
        takeRecords();
        DIR_INSTANCES.push(this);
        setRTL(this);
      }
    }

    disconnectedCallback() {
      if (elementBase.prototype.disconnectedCallback) {
        super.disconnectedCallback();
      }
      if (this.constructor.__activateDir) {
        const idx = DIR_INSTANCES.indexOf(this);
        if (idx > -1) {
          DIR_INSTANCES.splice(idx, 1);
        }
      }
    }
  }

  Dir.__activateDir = false;

  return Dir;
});
