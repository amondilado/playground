import { MutableData } from '../mixins/mutable-data.js';

let mutablePropertyChange;
(() => {
  mutablePropertyChange = MutableData._mutablePropertyChange;
})();

export const MutableDataBehavior = {

  _shouldPropertyChange(property, value, old) {
    return mutablePropertyChange(this, property, value, old, true);
  }
};

export const OptionalMutableDataBehavior = {

  properties: {
    mutableData: Boolean
  },

  _shouldPropertyChange(property, value, old) {
    return mutablePropertyChange(this, property, value, old, this.mutableData);
  }
};
