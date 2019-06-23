import './boot.js';

class LiteralString {
  constructor(string) {
    this.value = string.toString();
  }
  toString() {
    return this.value;
  }
}

function literalValue(value) {
  if (value instanceof LiteralString) {
    return (value).value;
  } else {
    throw new Error(
        `non-literal value passed to Polymer's htmlLiteral function: ${value}`
    );
  }
}

function htmlValue(value) {
  if (value instanceof HTMLTemplateElement) {
    return (value).innerHTML;
  } else if (value instanceof LiteralString) {
    return literalValue(value);
  } else {
    throw new Error(
        `non-template value passed to Polymer's html function: ${value}`);
  }
}

export const html = function html(strings, ...values) {
  const template = (document.createElement('template'));
  template.innerHTML = values.reduce((acc, v, idx) =>
      acc + htmlValue(v) + strings[idx + 1], strings[0]);
  return template;
};

export const htmlLiteral = function(strings, ...values) {
  return new LiteralString(values.reduce((acc, v, idx) =>
      acc + literalValue(v) + strings[idx + 1], strings[0]));
};
