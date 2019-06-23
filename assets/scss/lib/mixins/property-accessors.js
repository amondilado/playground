import '../utils/boot.js';

import { dedupingMixin } from '../utils/mixin.js';
import { camelToDashCase, dashToCamelCase } from '../utils/case-map.js';
import { PropertiesChanged } from './properties-changed.js';

const nativeProperties = {};
let proto = HTMLElement.prototype;
while (proto) {
  let props = Object.getOwnPropertyNames(proto);
  for (let i=0; i<props.length; i++) {
    nativeProperties[props[i]] = true;
  }
  proto = Object.getPrototypeOf(proto);
}

function saveAccessorValue(model, property) {
  if (!nativeProperties[property]) {
    let value = model[property];
    if (value !== undefined) {
      if (model.__data) {
        model._setPendingProperty(property, value);
      } else {
        if (!model.__dataProto) {
          model.__dataProto = {};
        } else if (!model.hasOwnProperty(JSCompiler_renameProperty('__dataProto', model))) {
          model.__dataProto = Object.create(model.__dataProto);
        }
        model.__dataProto[property] = value;
      }
    }
  }
}

export const PropertyAccessors = dedupingMixin(superClass => {

   const base = PropertiesChanged(superClass);

  class PropertyAccessors extends base {

    static createPropertiesForAttributes() {
      let a$ = this.observedAttributes;
      for (let i=0; i < a$.length; i++) {
        this.prototype._createPropertyAccessor(dashToCamelCase(a$[i]));
      }
    }

    static attributeNameForProperty(property) {
      return camelToDashCase(property);
    }

    _initializeProperties() {
      if (this.__dataProto) {
        this._initializeProtoProperties(this.__dataProto);
        this.__dataProto = null;
      }
      super._initializeProperties();
    }

    _initializeProtoProperties(props) {
      for (let p in props) {
        this._setProperty(p, props[p]);
      }
    }

    _ensureAttribute(attribute, value) {
      const el = (this);
      if (!el.hasAttribute(attribute)) {
        this._valueToNodeAttribute(el, value, attribute);
      }
    }

    _serializeValue(value) {
      switch (typeof value) {
        case 'object':
          if (value instanceof Date) {
            return value.toString();
          } else if (value) {
            try {
              return JSON.stringify(value);
            } catch(x) {
              return '';
            }
          }

        default:
          return super._serializeValue(value);
      }
    }

    _deserializeValue(value, type) {
      let outValue;
      switch (type) {
        case Object:
          try {
            outValue = JSON.parse((value));
          } catch(x) {
            outValue = value;
          }
          break;
        case Array:
          try {
            outValue = JSON.parse((value));
          } catch(x) {
            outValue = null;
            console.warn(`Polymer::Attributes: couldn't decode Array as JSON: ${value}`);
          }
          break;
        case Date:
          outValue = isNaN(value) ? String(value) : Number(value);
          outValue = new Date(outValue);
          break;
        default:
          outValue = super._deserializeValue(value, type);
          break;
      }
      return outValue;
    }

    _definePropertyAccessor(property, readOnly) {
      saveAccessorValue(this, property);
      super._definePropertyAccessor(property, readOnly);
    }

    _hasAccessor(property) {
      return this.__dataHasAccessor && this.__dataHasAccessor[property];
    }

    _isPropertyPending(prop) {
      return Boolean(this.__dataPending && (prop in this.__dataPending));
    }

  }

  return PropertyAccessors;

});
