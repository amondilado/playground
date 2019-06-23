
import { Class } from './class.js';
import { Polymer } from '../../polymer-legacy.js';
import { dedupingMixin } from '../utils/mixin.js';
import { templatize } from '../utils/templatize.js';

const UndefinedArgumentError = class extends Error {
  constructor(message, arg) {
    super(message);
    this.arg = arg;
    this.name = this.constructor.name;
    this.constructor = UndefinedArgumentError;
    this.__proto__ = UndefinedArgumentError.prototype;
  }
};

function wrapEffect(effect, fnName) {
  if (effect && effect.fn) {
    const fn = effect.fn;
    effect.fn = function() {
      try {
        fn.apply(this, arguments);
      } catch (e) {
        if (e instanceof UndefinedArgumentError) {
          console.warn(`Argument '${e.arg}'${fnName ?` for method '${fnName}'` : ''} was undefined. Ensure it has a default value, or else ensure the method handles the argument being undefined.`);
        } else {
          throw e;
        }
      }
    };
  }
  return effect;
}

export const LegacyDataMixin = dedupingMixin(superClass => {

  class LegacyDataMixin extends superClass {
    _marshalArgs(args, path, props) {
      const vals = super._marshalArgs(args, path, props);
      if (this._legacyUndefinedCheck && vals.length > 1) {
        for (let i=0; i<vals.length; i++) {
          if (vals[i] === undefined) {
            const name = args[i].name;
            throw new UndefinedArgumentError(`Argument '${name}' is undefined.`, name);
          }
        }
      }
      return vals;
    }

    _addPropertyEffect(property, type, effect) {
      return super._addPropertyEffect(property, type,
        wrapEffect(effect, effect && effect.info && effect.info.methodName));
    }

    static _addTemplatePropertyEffect(templateInfo, prop, effect) {
      return super._addTemplatePropertyEffect(templateInfo, prop, wrapEffect(effect));
    }

  }

  return LegacyDataMixin;

});

Polymer.Class = (info, mixin) => Class(info,
  superClass => mixin ?
    mixin(LegacyDataMixin(superClass)) :
    LegacyDataMixin(superClass)
);

const TemplatizeMixin =
  dedupingMixin(superClass => {
    const legacyBase = LegacyDataMixin(superClass);
    class TemplateLegacy extends legacyBase {
      get _legacyUndefinedCheck() {
        return this._methodHost && this._methodHost._legacyUndefinedCheck;
      }
    }
    TemplateLegacy.prototype._methodHost;
    return TemplateLegacy;
  });

templatize.mixin = TemplatizeMixin;

console.info('LegacyDataMixin will be applied to all legacy elements.\n' +
              'Set `_legacyUndefinedCheck: true` on element class to enable.');
