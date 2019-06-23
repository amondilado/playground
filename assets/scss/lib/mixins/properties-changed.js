import '../utils/boot.js';

import { dedupingMixin } from '../utils/mixin.js';
import { microTask } from '../utils/async.js';
import { wrap } from '../utils/wrap.js';

const microtask = microTask;

export const PropertiesChanged = dedupingMixin(
    (superClass) => {

  class PropertiesChanged extends superClass {

    static createProperties(props) {
      const proto = this.prototype;
      for (let prop in props) {
        if (!(prop in proto)) {
          proto._createPropertyAccessor(prop);
        }
      }
    }

    static attributeNameForProperty(property) {
      return property.toLowerCase();
    }

    static typeForProperty(name) { } 

    _createPropertyAccessor(property, readOnly) {
      this._addPropertyToAttributeMap(property);
      if (!this.hasOwnProperty('__dataHasAccessor')) {
        this.__dataHasAccessor = Object.assign({}, this.__dataHasAccessor);
      }
      if (!this.__dataHasAccessor[property]) {
        this.__dataHasAccessor[property] = true;
        this._definePropertyAccessor(property, readOnly);
      }
    }

    _addPropertyToAttributeMap(property) {
      if (!this.hasOwnProperty('__dataAttributes')) {
        this.__dataAttributes = Object.assign({}, this.__dataAttributes);
      }
      if (!this.__dataAttributes[property]) {
        const attr = this.constructor.attributeNameForProperty(property);
        this.__dataAttributes[attr] = property;
      }
    }

     _definePropertyAccessor(property, readOnly) {
      Object.defineProperty(this, property, {
        get() {
          return this._getProperty(property);
        },
        set: readOnly ? function () {} : function (value) {
          this._setProperty(property, value);
        }
      });
    }

    constructor() {
      super();
      this.__dataEnabled = false;
      this.__dataReady = false;
      this.__dataInvalid = false;
      this.__data = {};
      this.__dataPending = null;
      this.__dataOld = null;
      this.__dataInstanceProps = null;
      this.__serializing = false;
      this._initializeProperties();
    }

    ready() {
      this.__dataReady = true;
      this._flushProperties();
    }

    _initializeProperties() {
      for (let p in this.__dataHasAccessor) {
        if (this.hasOwnProperty(p)) {
          this.__dataInstanceProps = this.__dataInstanceProps || {};
          this.__dataInstanceProps[p] = this[p];
          delete this[p];
        }
      }
    }

    _initializeInstanceProperties(props) {
      Object.assign(this, props);
    }

    _setProperty(property, value) {
      if (this._setPendingProperty(property, value)) {
        this._invalidateProperties();
      }
    }

    _getProperty(property) {
      return this.__data[property];
    }

    _setPendingProperty(property, value, ext) {
      let old = this.__data[property];
      let changed = this._shouldPropertyChange(property, value, old);
      if (changed) {
        if (!this.__dataPending) {
          this.__dataPending = {};
          this.__dataOld = {};
        }
        if (this.__dataOld && !(property in this.__dataOld)) {
          this.__dataOld[property] = old;
        }
        this.__data[property] = value;
        this.__dataPending[property] = value;
      }
      return changed;
    }

    _invalidateProperties() {
      if (!this.__dataInvalid && this.__dataReady) {
        this.__dataInvalid = true;
        microtask.run(() => {
          if (this.__dataInvalid) {
            this.__dataInvalid = false;
            this._flushProperties();
          }
        });
      }
    }

    _enableProperties() {
      if (!this.__dataEnabled) {
        this.__dataEnabled = true;
        if (this.__dataInstanceProps) {
          this._initializeInstanceProperties(this.__dataInstanceProps);
          this.__dataInstanceProps = null;
        }
        this.ready();
      }
    }

    _flushProperties() {
      const props = this.__data;
      const changedProps = this.__dataPending;
      const old = this.__dataOld;
      if (this._shouldPropertiesChange(props, changedProps, old)) {
        this.__dataPending = null;
        this.__dataOld = null;
        this._propertiesChanged(props, changedProps, old);
      }
    }

    _shouldPropertiesChange(currentProps, changedProps, oldProps) { 
      return Boolean(changedProps);
    }

    _propertiesChanged(currentProps, changedProps, oldProps) { 
    }

    _shouldPropertyChange(property, value, old) {
      return (
        (old !== value &&
          (old === old || value === value))
      );
    }

    attributeChangedCallback(name, old, value, namespace) {
      if (old !== value) {
        this._attributeToProperty(name, value);
      }
      if (super.attributeChangedCallback) {
        super.attributeChangedCallback(name, old, value, namespace);
      }
    }

    _attributeToProperty(attribute, value, type) {
      if (!this.__serializing) {
        const map = this.__dataAttributes;
        const property = map && map[attribute] || attribute;
        this[property] = this._deserializeValue(value, type ||
          this.constructor.typeForProperty(property));
      }
    }

    _propertyToAttribute(property, attribute, value) {
      this.__serializing = true;
      value = (arguments.length < 3) ? this[property] : value;
      this._valueToNodeAttribute((this), value,
        attribute || this.constructor.attributeNameForProperty(property));
      this.__serializing = false;
    }

    _valueToNodeAttribute(node, value, attribute) {
      const str = this._serializeValue(value);
      if (str === undefined) {
        node.removeAttribute(attribute);
      } else {
        if (attribute === 'class' || attribute === 'name' || attribute === 'slot') {
          node = (wrap(node));
        }
        node.setAttribute(attribute, str);
      }
    }

    _serializeValue(value) {
      switch (typeof value) {
        case 'boolean':
          return value ? '' : undefined;
        default:
          return value != null ? value.toString() : undefined;
      }
    }

    _deserializeValue(value, type) {
      switch (type) {
        case Boolean:
          return (value !== null);
        case Number:
          return Number(value);
        default:
          return value;
      }
    }

  }

  return PropertiesChanged;
});
