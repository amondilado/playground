import { ElementMixin } from './element-mixin.js';

import { dedupingMixin } from '../utils/mixin.js';

const DISABLED_ATTR = 'disable-upgrade';

export const DisableUpgradeMixin = dedupingMixin((base) => {
  const superClass = ElementMixin(base);

  class DisableUpgradeClass extends superClass {

    static get observedAttributes() {
      return super.observedAttributes.concat(DISABLED_ATTR);
    }

    attributeChangedCallback(name, old, value, namespace) {
      if (name == DISABLED_ATTR) {
        if (!this.__dataEnabled && value == null && this.isConnected) {
          super.connectedCallback();
        }
      } else {
        super.attributeChangedCallback(
            name, old, value,  (namespace));
      }
    }

    _initializeProperties() {}

    connectedCallback() {
      if (this.__dataEnabled || !this.hasAttribute(DISABLED_ATTR)) {
        super.connectedCallback();
      }
    }

    _enableProperties() {
      if (!this.hasAttribute(DISABLED_ATTR)) {
        if (!this.__dataEnabled) {
          super._initializeProperties();
        }
        super._enableProperties();
      }
    }

    disconnectedCallback() {
      if (this.__dataEnabled) {
        super.disconnectedCallback();
      }
    }

  }

  return DisableUpgradeClass;
});
