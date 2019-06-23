import './boot.js';

import './mixin.js';
import './async.js';

export class Debouncer {
  constructor() {
    this._asyncModule = null;
    this._callback = null;
    this._timer = null;
  }
  setConfig(asyncModule, callback) {
    this._asyncModule = asyncModule;
    this._callback = callback;
    this._timer = this._asyncModule.run(() => {
      this._timer = null;
      debouncerQueue.delete(this);
      this._callback();
    });
  }
  cancel() {
    if (this.isActive()) {
      this._cancelAsync();
      debouncerQueue.delete(this);
    }
  }
  _cancelAsync() {
    if (this.isActive()) {
      this._asyncModule.cancel((this._timer));
      this._timer = null;
    }
  }
  flush() {
    if (this.isActive()) {
      this.cancel();
      this._callback();
    }
  }
  isActive() {
    return this._timer != null;
  }
  static debounce(debouncer, asyncModule, callback) {
    if (debouncer instanceof Debouncer) {
      debouncer._cancelAsync();
    } else {
      debouncer = new Debouncer();
    }
    debouncer.setConfig(asyncModule, callback);
    return debouncer;
  }
}

let debouncerQueue = new Set();

export const enqueueDebouncer = function(debouncer) {
  debouncerQueue.add(debouncer);
};

export const flushDebouncers = function() {
  const didFlush = Boolean(debouncerQueue.size);
  debouncerQueue.forEach(debouncer => {
    try {
      debouncer.flush();
    } catch(e) {
      setTimeout(() => {
        throw e;
      });
    }
  });
  return didFlush;
};