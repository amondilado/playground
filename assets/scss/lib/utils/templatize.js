

import './boot.js';

import { PropertyEffects } from '../mixins/property-effects.js';
import { MutableData } from '../mixins/mutable-data.js';
import { strictTemplatePolicy } from './settings.js';
import { wrap } from './wrap.js';

let newInstance = null;

function HTMLTemplateElementExtension() { return newInstance; }
HTMLTemplateElementExtension.prototype = Object.create(HTMLTemplateElement.prototype, {
  constructor: {
    value: HTMLTemplateElementExtension,
    writable: true
  }
});

const DataTemplate = PropertyEffects(HTMLTemplateElementExtension);

const MutableDataTemplate = MutableData(DataTemplate);

function upgradeTemplate(template, constructor) {
  newInstance = template;
  Object.setPrototypeOf(template, constructor.prototype);
  new constructor();
  newInstance = null;
}

const templateInstanceBase = PropertyEffects(class {});

class TemplateInstanceBase extends templateInstanceBase {
  constructor(props) {
    super();
    this._configureProperties(props);
    this.root = this._stampTemplate(this.__dataHost);
    let children = this.children = [];
    for (let n = this.root.firstChild; n; n=n.nextSibling) {
      children.push(n);
      n.__templatizeInstance = this;
    }
    if (this.__templatizeOwner &&
      this.__templatizeOwner.__hideTemplateChildren__) {
      this._showHideChildren(true);
    }
    let options = this.__templatizeOptions;
    if ((props && options.instanceProps) || !options.instanceProps) {
      this._enableProperties();
    }
  }
  _configureProperties(props) {
    let options = this.__templatizeOptions;
    if (options.forwardHostProp) {
      for (let hprop in this.__hostProps) {
        this._setPendingProperty(hprop, this.__dataHost['_host_' + hprop]);
      }
    }
    for (let iprop in props) {
      this._setPendingProperty(iprop, props[iprop]);
    }
  }
  forwardHostProp(prop, value) {
    if (this._setPendingPropertyOrPath(prop, value, false, true)) {
      this.__dataHost._enqueueClient(this);
    }
  }

  _addEventListenerToNode(node, eventName, handler) {
    if (this._methodHost && this.__templatizeOptions.parentModel) {
      this._methodHost._addEventListenerToNode(node, eventName, (e) => {
        e.model = this;
        handler(e);
      });
    } else {
      let templateHost = this.__dataHost.__dataHost;
      if (templateHost) {
        templateHost._addEventListenerToNode(node, eventName, handler);
      }
    }
  }
  _showHideChildren(hide) {
    let c = this.children;
    for (let i=0; i<c.length; i++) {
      let n = c[i];
      if (Boolean(hide) != Boolean(n.__hideTemplateChildren__)) {
        if (n.nodeType === Node.TEXT_NODE) {
          if (hide) {
            n.__polymerTextContent__ = n.textContent;
            n.textContent = '';
          } else {
            n.textContent = n.__polymerTextContent__;
          }
        } else if (n.localName === 'slot') {
          if (hide) {
            n.__polymerReplaced__ = document.createComment('hidden-slot');
            wrap(wrap(n).parentNode).replaceChild(n.__polymerReplaced__, n);
          } else {
            const replace = n.__polymerReplaced__;
            if (replace) {
              wrap(wrap(replace).parentNode).replaceChild(n, replace);
            }
          }
        }

        else if (n.style) {
          if (hide) {
            n.__polymerDisplay__ = n.style.display;
            n.style.display = 'none';
          } else {
            n.style.display = n.__polymerDisplay__;
          }
        }
      }
      n.__hideTemplateChildren__ = hide;
      if (n._showHideChildren) {
        n._showHideChildren(hide);
      }
    }
  }
  _setUnmanagedPropertyToNode(node, prop, value) {
    if (node.__hideTemplateChildren__ &&
        node.nodeType == Node.TEXT_NODE && prop == 'textContent') {
      node.__polymerTextContent__ = value;
    } else {
      super._setUnmanagedPropertyToNode(node, prop, value);
    }
  }
  get parentModel() {
    let model = this.__parentModel;
    if (!model) {
      let options;
      model = this;
      do {
        model = model.__dataHost.__dataHost;
      } while ((options = model.__templatizeOptions) && !options.parentModel);
      this.__parentModel = model;
    }
    return model;
  }

   dispatchEvent(event) { 
     return true;
  }
}

TemplateInstanceBase.prototype.__dataHost;
TemplateInstanceBase.prototype.__templatizeOptions;
TemplateInstanceBase.prototype._methodHost;
TemplateInstanceBase.prototype.__templatizeOwner;
TemplateInstanceBase.prototype.__hostProps;

const MutableTemplateInstanceBase = MutableData(TemplateInstanceBase);

function findMethodHost(template) {
  let templateHost = template.__dataHost;
  return templateHost && templateHost._methodHost || templateHost;
}

function createTemplatizerClass(template, templateInfo, options) {
  let templatizerBase = options.mutableData ?
    MutableTemplateInstanceBase : TemplateInstanceBase;

  if (templatize.mixin) {
    templatizerBase = templatize.mixin(templatizerBase);
  }

  let klass = class extends templatizerBase { };
  klass.prototype.__templatizeOptions = options;
  klass.prototype._bindTemplate(template);
  addNotifyEffects(klass, template, templateInfo, options);
  return klass;
}

function addPropagateEffects(template, templateInfo, options) {
  let userForwardHostProp = options.forwardHostProp;
  if (userForwardHostProp) {
    let klass = templateInfo.templatizeTemplateClass;
    if (!klass) {
      let templatizedBase = options.mutableData ? MutableDataTemplate : DataTemplate;
      klass = templateInfo.templatizeTemplateClass =
        class TemplatizedTemplate extends templatizedBase {};
      let hostProps = templateInfo.hostProps;
      for (let prop in hostProps) {
        klass.prototype._addPropertyEffect('_host_' + prop,
          klass.prototype.PROPERTY_EFFECT_TYPES.PROPAGATE,
          {fn: createForwardHostPropEffect(prop, userForwardHostProp)});
        klass.prototype._createNotifyingProperty('_host_' + prop);
      }
    }
    upgradeTemplate(template, klass);
    if (template.__dataProto) {
      Object.assign(template.__data, template.__dataProto);
    }
    template.__dataTemp = {};
    template.__dataPending = null;
    template.__dataOld = null;
    template._enableProperties();
  }
}

function createForwardHostPropEffect(hostProp, userForwardHostProp) {
  return function forwardHostProp(template, prop, props) {
    userForwardHostProp.call(template.__templatizeOwner,
      prop.substring('_host_'.length), props[prop]);
  };
}

function addNotifyEffects(klass, template, templateInfo, options) {
  let hostProps = templateInfo.hostProps || {};
  for (let iprop in options.instanceProps) {
    delete hostProps[iprop];
    let userNotifyInstanceProp = options.notifyInstanceProp;
    if (userNotifyInstanceProp) {
      klass.prototype._addPropertyEffect(iprop,
        klass.prototype.PROPERTY_EFFECT_TYPES.NOTIFY,
        {fn: createNotifyInstancePropEffect(iprop, userNotifyInstanceProp)});
    }
  }
  if (options.forwardHostProp && template.__dataHost) {
    for (let hprop in hostProps) {
      klass.prototype._addPropertyEffect(hprop,
        klass.prototype.PROPERTY_EFFECT_TYPES.NOTIFY,
        {fn: createNotifyHostPropEffect()});
    }
  }
}

function createNotifyInstancePropEffect(instProp, userNotifyInstanceProp) {
  return function notifyInstanceProp(inst, prop, props) {
    userNotifyInstanceProp.call(inst.__templatizeOwner,
      inst, prop, props[prop]);
  };
}

function createNotifyHostPropEffect() {
  return function notifyHostProp(inst, prop, props) {
    inst.__dataHost._setPendingPropertyOrPath('_host_' + prop, props[prop], true, true);
  };
}


export function templatize(template, owner, options) {
  if (strictTemplatePolicy && !findMethodHost(template)) {
    throw new Error('strictTemplatePolicy: template owner not trusted');
  }
  options = (options || {});
  if (template.__templatizeOwner) {
    throw new Error('A <template> can only be templatized once');
  }
  template.__templatizeOwner = owner;
  const ctor = owner ? owner.constructor : TemplateInstanceBase;
  let templateInfo = ctor._parseTemplate(template);
  let baseClass = templateInfo.templatizeInstanceClass;
  if (!baseClass) {
    baseClass = createTemplatizerClass(template, templateInfo, options);
    templateInfo.templatizeInstanceClass = baseClass;
  }
  addPropagateEffects(template, templateInfo, options);
  let klass = class TemplateInstance extends baseClass {};
  klass.prototype._methodHost = findMethodHost(template);
  klass.prototype.__dataHost =  (template);
  klass.prototype.__templatizeOwner =  (owner);
  klass.prototype.__hostProps = templateInfo.hostProps;
  klass = (klass); 
  return klass;
}

export function modelForElement(template, node) {
  let model;
  while (node) {
    if ((model = node.__templatizeInstance)) {
      if (model.__dataHost != template) {
        node = model.__dataHost;
      } else {
        return model;
      }
    } else {
      node = wrap(node).parentNode;
    }
  }
  return null;
}

export { TemplateInstanceBase };
