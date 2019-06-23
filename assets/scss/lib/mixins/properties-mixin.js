import '../utils/boot.js';

import { dedupingMixin } from '../utils/mixin.js';
import { register, incrementInstanceCount } from '../utils/telemetry.js';
import { PropertiesChanged } from './properties-changed.js';

function normalizeProperties(props) {
  const output = {};
  for (let p in props) {
    const o = props[p];
    output[p] = (typeof o === 'function') ? {type: o} : o;
  }
  return output;
}

export const PropertiesMixin = dedupingMixin(superClass => {

 const base = PropertiesChanged(superClass);

 function superPropertiesClass(constructor) {
   const superCtor = Object.getPrototypeOf(constructor);

   return (superCtor.prototype instanceof PropertiesMixin) ?
 (superCtor) : null;
 }

 function ownProperties(constructor) {
   if (!constructor.hasOwnProperty(JSCompiler_renameProperty('__ownProperties', constructor))) {
     let props = null;

     if (constructor.hasOwnProperty(JSCompiler_renameProperty('properties', constructor))) {
       const properties = constructor.properties;

       if (properties) {
        props = normalizeProperties(properties);
       }
     }

     constructor.__ownProperties = props;
   }
   return constructor.__ownProperties;
 }

 class PropertiesMixin extends base {

   static get observedAttributes() {
     if (!this.hasOwnProperty('__observedAttributes')) {
       register(this.prototype);
       const props = this._properties;
       this.__observedAttributes = props ? Object.keys(props).map(p => this.attributeNameForProperty(p)) : [];
     }
     return this.__observedAttributes;
   }

   static finalize() {
     if (!this.hasOwnProperty(JSCompiler_renameProperty('__finalized', this))) {
       const superCtor = superPropertiesClass((this));
       if (superCtor) {
         superCtor.finalize();
       }
       this.__finalized = true;
       this._finalizeClass();
     }
   }

   static _finalizeClass() {
     const props = ownProperties((this));
     if (props) {
       this.createProperties(props);
     }
   }

   static get _properties() {
     if (!this.hasOwnProperty(
       JSCompiler_renameProperty('__properties', this))) {
       const superCtor = superPropertiesClass((this));
       this.__properties = Object.assign({},
         superCtor && superCtor._properties,
         ownProperties((this)));
     }
     return this.__properties;
   }

   static typeForProperty(name) {
     const info = this._properties[name];
     return info && info.type;
   }

   _initializeProperties() {
     incrementInstanceCount();
     this.constructor.finalize();
     super._initializeProperties();
   }

   connectedCallback() {
     if (super.connectedCallback) {
       super.connectedCallback();
     }
     this._enableProperties();
   }

   disconnectedCallback() {
     if (super.disconnectedCallback) {
       super.disconnectedCallback();
     }
   }

 }

 return PropertiesMixin;

});
