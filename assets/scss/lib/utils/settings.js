import './boot.js';

import { pathFromUrl } from './resolve-url.js';
export const useShadow = !(window.ShadyDOM);
export const useNativeCSSProperties = Boolean(!window.ShadyCSS || window.ShadyCSS.nativeCss);
export const useNativeCustomElements = !(window.customElements.polyfillWrapFlushCallback);


export let rootPath = pathFromUrl(document.baseURI || window.location.href);

export const setRootPath = function(path) {
  rootPath = path;
};

export let sanitizeDOMValue = window.Polymer && window.Polymer.sanitizeDOMValue || undefined;

export const setSanitizeDOMValue = function(newSanitizeDOMValue) {
  sanitizeDOMValue = newSanitizeDOMValue;
};

export let passiveTouchGestures = false;

export const setPassiveTouchGestures = function(usePassive) {
  passiveTouchGestures = usePassive;
};

export let strictTemplatePolicy = false;

export const setStrictTemplatePolicy = function(useStrictPolicy) {
  strictTemplatePolicy = useStrictPolicy;
};

export let allowTemplateFromDomModule = false;

export const setAllowTemplateFromDomModule = function(allowDomModule) {
  allowTemplateFromDomModule = allowDomModule;
};

export let legacyOptimizations = false;

export const setLegacyOptimizations = function(useLegacyOptimizations) {
  legacyOptimizations = useLegacyOptimizations;
};

export let syncInitialRender = false;

export const setSyncInitialRender = function(useSyncInitialRender) {
  syncInitialRender = useSyncInitialRender;
};
