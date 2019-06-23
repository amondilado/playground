import { Class } from './class.js';

import '../utils/boot.js';

const Polymer = function(info) {
  let klass;
  if (typeof info === 'function') {
    klass = info;
  } else {
    klass = Polymer.Class(info);
  }
  customElements.define(klass.is, (klass));
  return klass;
};

Polymer.Class = Class;

export { Polymer };