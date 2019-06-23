import '../utils/boot.js';

import { dedupingMixin } from '../utils/mixin.js';

const walker = document.createTreeWalker(document, NodeFilter.SHOW_ALL,
    null, false);

const templateExtensions = {
  'dom-if': true,
  'dom-repeat': true
};
function wrapTemplateExtension(node) {
  let is = node.getAttribute('is');
  if (is && templateExtensions[is]) {
    let t = node;
    t.removeAttribute('is');
    node = t.ownerDocument.createElement(is);
    t.parentNode.replaceChild(node, t);
    node.appendChild(t);
    while(t.attributes.length) {
      node.setAttribute(t.attributes[0].name, t.attributes[0].value);
      t.removeAttribute(t.attributes[0].name);
    }
  }
  return node;
}

function findTemplateNode(root, nodeInfo) {
  let parent = nodeInfo.parentInfo && findTemplateNode(root, nodeInfo.parentInfo);
  if (parent) {
    walker.currentNode = parent;
    for (let n=walker.firstChild(), i=0; n; n=walker.nextSibling()) {
      if (nodeInfo.parentIndex === i++) {
        return n;
      }
    }
  } else {
    return root;
  }
}

function applyIdToMap(inst, map, node, nodeInfo) {
  if (nodeInfo.id) {
    map[nodeInfo.id] = node;
  }
}

function applyEventListener(inst, node, nodeInfo) {
  if (nodeInfo.events && nodeInfo.events.length) {
    for (let j=0, e$=nodeInfo.events, e; (j<e$.length) && (e=e$[j]); j++) {
      inst._addMethodEventListenerToNode(node, e.name, e.value, inst);
    }
  }
}

function applyTemplateContent(inst, node, nodeInfo) {
  if (nodeInfo.templateInfo) {
    node._templateInfo = nodeInfo.templateInfo;
  }
}

function createNodeEventHandler(context, eventName, methodName) {
  context = context._methodHost || context;
  let handler = function(e) {
    if (context[methodName]) {
      context[methodName](e, e.detail);
    } else {
      console.warn('listener method `' + methodName + '` not defined');
    }
  };
  return handler;
}

export const TemplateStamp = dedupingMixin(
    (superClass) => {

  class TemplateStamp extends superClass {

    static _parseTemplate(template, outerTemplateInfo) {
      if (!template._templateInfo) {
        let templateInfo = template._templateInfo = {};
        templateInfo.nodeInfoList = [];
        templateInfo.stripWhiteSpace =
          (outerTemplateInfo && outerTemplateInfo.stripWhiteSpace) ||
          template.hasAttribute('strip-whitespace');
        this._parseTemplateContent(template, templateInfo, {parent: null});
      }
      return template._templateInfo;
    }

    static _parseTemplateContent(template, templateInfo, nodeInfo) {
      return this._parseTemplateNode(template.content, templateInfo, nodeInfo);
    }

    static _parseTemplateNode(node, templateInfo, nodeInfo) {
      let noted;
      let element = (node);
      if (element.localName == 'template' && !element.hasAttribute('preserve-content')) {
        noted = this._parseTemplateNestedTemplate(element, templateInfo, nodeInfo) || noted;
      } else if (element.localName === 'slot') {
        templateInfo.hasInsertionPoint = true;
      }
      walker.currentNode = element;
      if (walker.firstChild()) {
        noted = this._parseTemplateChildNodes(element, templateInfo, nodeInfo) || noted;
      }
      if (element.hasAttributes && element.hasAttributes()) {
        noted = this._parseTemplateNodeAttributes(element, templateInfo, nodeInfo) || noted;
      }
      return noted;
    }

    static _parseTemplateChildNodes(root, templateInfo, nodeInfo) {
      if (root.localName === 'script' || root.localName === 'style') {
        return;
      }
      walker.currentNode = root;
      for (let node=walker.firstChild(), parentIndex=0, next; node; node=next) {
        if (node.localName == 'template') {
          node = wrapTemplateExtension(node);
        }
        walker.currentNode = node;
        next = walker.nextSibling();
        if (node.nodeType === Node.TEXT_NODE) {
          let  n = next;
          while (n && (n.nodeType === Node.TEXT_NODE)) {
            node.textContent += n.textContent;
            next = walker.nextSibling();
            root.removeChild(n);
            n = next;
          }
          if (templateInfo.stripWhiteSpace && !node.textContent.trim()) {
            root.removeChild(node);
            continue;
          }
        }
        let childInfo = { parentIndex, parentInfo: nodeInfo };
        if (this._parseTemplateNode(node, templateInfo, childInfo)) {
          childInfo.infoIndex = templateInfo.nodeInfoList.push((childInfo)) - 1;
        }
        walker.currentNode = node;
        if (walker.parentNode()) {
          parentIndex++;
        }
      }
    }

    static _parseTemplateNestedTemplate(node, outerTemplateInfo, nodeInfo) {
      let templateInfo = this._parseTemplate(node, outerTemplateInfo);
      let content = templateInfo.content =
        node.content.ownerDocument.createDocumentFragment();
      content.appendChild(node.content);
      nodeInfo.templateInfo = templateInfo;
      return true;
    }

    static _parseTemplateNodeAttributes(node, templateInfo, nodeInfo) {
      let noted = false;
      let attrs = Array.from(node.attributes);
      for (let i=attrs.length-1, a; (a=attrs[i]); i--) {
        noted = this._parseTemplateNodeAttribute(node, templateInfo, nodeInfo, a.name, a.value) || noted;
      }
      return noted;
    }

    static _parseTemplateNodeAttribute(node, templateInfo, nodeInfo, name, value) {
      if (name.slice(0, 3) === 'on-') {
        node.removeAttribute(name);
        nodeInfo.events = nodeInfo.events || [];
        nodeInfo.events.push({
          name: name.slice(3),
          value
        });
        return true;
      }
      else if (name === 'id') {
        nodeInfo.id = value;
        return true;
      }
      return false;
    }

    static _contentForTemplate(template) {
      let templateInfo =  (template)._templateInfo;
      return (templateInfo && templateInfo.content) || template.content;
    }

    _stampTemplate(template) {
      if (template && !template.content &&
          window.HTMLTemplateElement && HTMLTemplateElement.decorate) {
        HTMLTemplateElement.decorate(template);
      }
      let templateInfo = this.constructor._parseTemplate(template);
      let nodeInfo = templateInfo.nodeInfoList;
      let content = templateInfo.content || template.content;
      let dom =  (document.importNode(content, true));
      dom.__noInsertionPoint = !templateInfo.hasInsertionPoint;
      let nodes = dom.nodeList = new Array(nodeInfo.length);
      dom.$ = {};
      for (let i=0, l=nodeInfo.length, info; (i<l) && (info=nodeInfo[i]); i++) {
        let node = nodes[i] = findTemplateNode(dom, info);
        applyIdToMap(this, dom.$, node, info);
        applyTemplateContent(this, node, info);
        applyEventListener(this, node, info);
      }
      dom = (dom); 
      return dom;
    }

    _addMethodEventListenerToNode(node, eventName, methodName, context) {
      context = context || node;
      let handler = createNodeEventHandler(context, eventName, methodName);
      this._addEventListenerToNode(node, eventName, handler);
      return handler;
    }

    _addEventListenerToNode(node, eventName, handler) {
      node.addEventListener(eventName, handler);
    }

    _removeEventListenerFromNode(node, eventName, handler) {
      node.removeEventListener(eventName, handler);
    }

  }

  return TemplateStamp;

});
