import Node from './Node';
import NodeList from './NodeList.mjs';
import ContainerNode from './ContainerNode.mjs';
import Element from './Element.mjs';
import select from './select';
import utils from './utils.mjs';

export default class DocumentFragment extends ContainerNode {

  get nodeValue() {
    return null;
  }
  set nodeValue(nodeValue) {}

  // Non-standard, but useful (github issue #73)
  get innerHTML() {
    return this.serialize();
  }
  set innerHTML(innerHTML) {
    utils.nyi();
  }
  get outerHTML() {
    return this.serialize();
  }
  set outerHTML(outerHTML) {
    utils.nyi();
  }

  constructor(doc) {
    super();
    this.nodeType = Node.DOCUMENT_FRAGMENT_NODE;
    this.ownerDocument = doc;
  }

  querySelector(selector) {
    // implement in terms of querySelectorAll
    var nodes = this.querySelectorAll(selector);
    return nodes.length ? nodes[0] : null;
  }

  querySelectorAll(selector) {
    // create a context
    var context = Object.create(this);
    // add some methods to the context for zest implementation, without
    // adding them to the public DocumentFragment API
    context.isHTML = true; // in HTML namespace (case-insensitive match)
    context.getElementsByTagName = Element.prototype.getElementsByTagName;
    context.nextElement =
        Object.getOwnPropertyDescriptor(Element.prototype, 'firstElementChild').
            get;
    // invoke zest
    var nodes = select(selector, context);
    return nodes.item ? nodes : new NodeList(nodes);
  }

  // Utility methods
  clone() {
    return new DocumentFragment(this.ownerDocument);
  }
  isEqual(n) {
    // Any two document fragments are shallowly equal.
    // Node.isEqualNode() will test their children for equality
    return true;
  }

}

Object.defineProperties(DocumentFragment.prototype, {
  nodeName: {
    value: '#document-fragment',
    writable: false
  },
  // Copy the text content getter/setter from Element
  textContent: Object.getOwnPropertyDescriptor(Element.prototype, 'textContent'),
});
