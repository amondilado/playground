import '../utils/boot.js';

import { rootPath, strictTemplatePolicy, allowTemplateFromDomModule, legacyOptimizations, syncInitialRender } from '../utils/settings.js';
import { dedupingMixin } from '../utils/mixin.js';
import { stylesFromTemplate, stylesFromModuleImports } from '../utils/style-gather.js';
import { pathFromUrl, resolveCss, resolveUrl } from '../utils/resolve-url.js';
import { DomModule } from '../elements/dom-module.js';
import { PropertyEffects } from './property-effects.js';
import { PropertiesMixin } from './properties-mixin.js';
import { wrap } from '../utils/wrap.js';

export const version = '3.2.0';

const builtCSS = window.ShadyCSS && window.ShadyCSS['cssBuild'];

export const ElementMixin = dedupingMixin(base => {
  const polymerElementBase = PropertiesMixin(PropertyEffects(base));

  function propertyDefaults(constructor) {
    if (!constructor.hasOwnProperty(
      JSCompiler_renameProperty('__propertyDefaults', constructor))) {
      constructor.__propertyDefaults = null;
      let props = constructor._properties;
      for (let p in props) {
        let info = props[p];
        if ('value' in info) {
          constructor.__propertyDefaults = constructor.__propertyDefaults || {};
          constructor.__propertyDefaults[p] = info;
        }
      }
    }
    return constructor.__propertyDefaults;
  }

  function ownObservers(constructor) {
    if (!constructor.hasOwnProperty(
      JSCompiler_renameProperty('__ownObservers', constructor))) {
      constructor.__ownObservers =
          constructor.hasOwnProperty(
              JSCompiler_renameProperty('observers', constructor)) ?
 (constructor).observers :
          null;
    }
    return constructor.__ownObservers;
  }

  function createPropertyFromConfig(proto, name, info, allProps) {
    if (info.computed) {
      info.readOnly = true;
    }
    if (info.computed) {
      if (proto._hasReadOnlyEffect(name)) {
        console.warn(`Cannot redefine computed property '${name}'.`);
      } else {
        proto._createComputedProperty(name, info.computed, allProps);
      }
    }
    if (info.readOnly && !proto._hasReadOnlyEffect(name)) {
      proto._createReadOnlyProperty(name, !info.computed);
    } else if (info.readOnly === false && proto._hasReadOnlyEffect(name)) {
      console.warn(`Cannot make readOnly property '${name}' non-readOnly.`);
    }
    if (info.reflectToAttribute && !proto._hasReflectEffect(name)) {
      proto._createReflectedProperty(name);
    } else if (info.reflectToAttribute === false && proto._hasReflectEffect(name)) {
      console.warn(`Cannot make reflected property '${name}' non-reflected.`);
    }
    if (info.notify && !proto._hasNotifyEffect(name)) {
      proto._createNotifyingProperty(name);
    } else if (info.notify === false && proto._hasNotifyEffect(name)) {
      console.warn(`Cannot make notify property '${name}' non-notify.`);
    }
    if (info.observer) {
      proto._createPropertyObserver(name, info.observer, allProps[info.observer]);
    }
    proto._addPropertyToAttributeMap(name);
  }

  function processElementStyles(klass, template, is, baseURI) {
    if (!builtCSS) {
      const templateStyles = template.content.querySelectorAll('style');
      const stylesWithImports = stylesFromTemplate(template);
      const linkedStyles = stylesFromModuleImports(is);
      const firstTemplateChild = template.content.firstElementChild;
      for (let idx = 0; idx < linkedStyles.length; idx++) {
        let s = linkedStyles[idx];
        s.textContent = klass._processStyleText(s.textContent, baseURI);
        template.content.insertBefore(s, firstTemplateChild);
      }
      let templateStyleIndex = 0;
      for (let i = 0; i < stylesWithImports.length; i++) {
        let s = stylesWithImports[i];
        let templateStyle = templateStyles[templateStyleIndex];
        if (templateStyle !== s) {
          s = s.cloneNode(true);
          templateStyle.parentNode.insertBefore(s, templateStyle);
        } else {
          templateStyleIndex++;
        }
        s.textContent = klass._processStyleText(s.textContent, baseURI);
      }
    }
    if (window.ShadyCSS) {
      window.ShadyCSS.prepareTemplate(template, is);
    }
  }

  function getTemplateFromDomModule(is) {
    let template = null;
    if (is && (!strictTemplatePolicy || allowTemplateFromDomModule)) {
      template =  (
          DomModule.import(is, 'template'));
      if (strictTemplatePolicy && !template) {
        throw new Error(`strictTemplatePolicy: expecting dom-module or null template for ${is}`);
      }
    }
    return template;
  }

  class PolymerElement extends polymerElementBase {

    static get polymerElementVersion() {
      return version;
    }

    static _finalizeClass() {
      super._finalizeClass();
      const observers = ownObservers(this);
      if (observers) {
        this.createObservers(observers, this._properties);
      }
      this._prepareTemplate();
    }

    static _prepareTemplate() {
      let template =  (this).template;
      if (template) {
        if (typeof template === 'string') {
          console.error('template getter must return HTMLTemplateElement');
          template = null;
        } else if (!legacyOptimizations) {
          template = template.cloneNode(true);
        }
      }

      this.prototype._template = template;
    }

    static createProperties(props) {
      for (let p in props) {
        createPropertyFromConfig(this.prototype, p, props[p], props);
      }
    }

    static createObservers(observers, dynamicFns) {
      const proto = this.prototype;
      for (let i=0; i < observers.length; i++) {
        proto._createMethodObserver(observers[i], dynamicFns);
      }
    }

    static get template() {
      if (!this.hasOwnProperty(JSCompiler_renameProperty('_template', this))) {
        this._template =
          this.prototype.hasOwnProperty(JSCompiler_renameProperty('_template', this.prototype)) ?
          this.prototype._template :
          (getTemplateFromDomModule( (this).is) ||
          Object.getPrototypeOf( (this).prototype).constructor.template);
      }
      return this._template;
    }

    static set template(value) {
      this._template = value;
    }

    static get importPath() {
      if (!this.hasOwnProperty(JSCompiler_renameProperty('_importPath', this))) {
        const meta = this.importMeta;
        if (meta) {
          this._importPath = pathFromUrl(meta.url);
        } else {
          const module = DomModule.import( (this).is);
          this._importPath = (module && module.assetpath) ||
            Object.getPrototypeOf( (this).prototype).constructor.importPath;
        }
      }
      return this._importPath;
    }

    constructor() {
      super();
      this._template;
      this._importPath;
      this.rootPath;
      this.importPath;
      this.root;
      this.$;
    }

    _initializeProperties() {
      this.constructor.finalize();
      this.constructor._finalizeTemplate((this).localName);
      super._initializeProperties();
      this.rootPath = rootPath;
      this.importPath = this.constructor.importPath;
      let p$ = propertyDefaults(this.constructor);
      if (!p$) {
        return;
      }
      for (let p in p$) {
        let info = p$[p];
        if (!this.hasOwnProperty(p)) {
          let value = typeof info.value == 'function' ?
            info.value.call(this) :
            info.value;
          if (this._hasAccessor(p)) {
            this._setPendingProperty(p, value, true);
          } else {
            this[p] = value;
          }
        }
      }
    }

    static _processStyleText(cssText, baseURI) {
      return resolveCss(cssText, baseURI);
    }

    static _finalizeTemplate(is) {
      const template = this.prototype._template;
      if (template && !template.__polymerFinalized) {
        template.__polymerFinalized = true;
        const importPath = this.importPath;
        const baseURI = importPath ? resolveUrl(importPath) : '';
        processElementStyles(this, template, is, baseURI);
        this.prototype._bindTemplate(template);
      }
    }

    connectedCallback() {
      if (window.ShadyCSS && this._template) {
        window.ShadyCSS.styleElement((this));
      }
      super.connectedCallback();
    }

    ready() {
      if (this._template) {
        this.root = this._stampTemplate(this._template);
        this.$ = this.root.$;
      }
      super.ready();
    }

    _readyClients() {
      if (this._template) {
        this.root = this._attachDom((this.root));
      }
      super._readyClients();
    }


    _attachDom(dom) {
      const n = wrap(this);
      if (n.attachShadow) {
        if (dom) {
          if (!n.shadowRoot) {
            n.attachShadow({mode: 'open'});
          }
          n.shadowRoot.appendChild(dom);
          if (syncInitialRender && window.ShadyDOM) {
            ShadyDOM.flushInitial(n.shadowRoot);
          }
          return n.shadowRoot;
        }
        return null;
      } else {
        throw new Error('ShadowDOM not available. ' +
        'PolymerElement can create dom as children instead of in ' +
        'ShadowDOM by setting `this.root = this;\` before \`ready\`.');
      }
    }

    updateStyles(properties) {
      if (window.ShadyCSS) {
        window.ShadyCSS.styleSubtree((this), properties);
      }
    }

    resolveUrl(url, base) {
      if (!base && this.importPath) {
        base = resolveUrl(this.importPath);
      }
      return resolveUrl(url, base);
    }

    static _parseTemplateContent(template, templateInfo, nodeInfo) {
      templateInfo.dynamicFns = templateInfo.dynamicFns || this._properties;
      return super._parseTemplateContent(template, templateInfo, nodeInfo);
    }

    static _addTemplatePropertyEffect(templateInfo, prop, effect) {
      if (legacyOptimizations && !(prop in this._properties)) {
        console.warn(`Property '${prop}' used in template but not declared in 'properties'; ` +
          `attribute will not be observed.`);
      }
      return super._addTemplatePropertyEffect(templateInfo, prop, effect);
    }

  }

  return PolymerElement;
});

export const updateStyles = function(props) {
  if (window.ShadyCSS) {
    window.ShadyCSS.styleDocument(props);
  }
};
