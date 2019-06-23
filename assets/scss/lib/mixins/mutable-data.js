import { dedupingMixin } from '../utils/mixin.js';

function mutablePropertyChange(inst, property, value, old, mutableData) {
  let isObject;
  if (mutableData) {
    isObject = (typeof value === 'object' && value !== null);
    if (isObject) {
      old = inst.__dataTemp[property];
    }
  }
  let shouldChange = (old !== value && (old === old || value === value));
  if (isObject && shouldChange) {
    inst.__dataTemp[property] = value;
  }
  return shouldChange;
}

export const MutableData = dedupingMixin(superClass => {

  class MutableData extends superClass {
    _shouldPropertyChange(property, value, old) {
      return mutablePropertyChange(this, property, value, old, true);
    }

  }

  return MutableData;

});

export const OptionalMutableData = dedupingMixin(superClass => {

  class OptionalMutableData extends superClass {

    static get properties() {
      return {
        mutableData: Boolean
      };
    }

    _shouldPropertyChange(property, value, old) {
      return mutablePropertyChange(this, property, value, old, this.mutableData);
    }
  }

  return OptionalMutableData;

});

MutableData._mutablePropertyChange = mutablePropertyChange;
