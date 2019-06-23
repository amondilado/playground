import './boot.js';
import { Debouncer } from '../utils/debounce.js';  
import { flushDebouncers } from '../utils/debounce.js';  
export { enqueueDebouncer } from '../utils/debounce.js';  

export const flush = function() {
  let shadyDOM, debouncers;
  do {
    shadyDOM = window.ShadyDOM && ShadyDOM.flush();
    if (window.ShadyCSS && window.ShadyCSS.ScopingShim) {
      window.ShadyCSS.ScopingShim.flush();
    }
    debouncers = flushDebouncers();
  } while (shadyDOM || debouncers);
};
