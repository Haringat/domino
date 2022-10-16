import Node from './Node';
import NodeList from './NodeList.mjs';
import ContainerNode from './ContainerNode.mjs';
import Element from './Element.mjs';
import Text from './Text';
import Comment from './Comment.mjs';
import Event from './Event.mjs';
import DocumentFragment from './DocumentFragment.mjs';
import ProcessingInstruction from './ProcessingInstruction';
import DOMImplementation from './DOMImplementation.mjs';
import TreeWalker from './TreeWalker';
import NodeIterator from './NodeIterator';
import NodeFilter from './NodeFilter';
import URL from './URL.mjs';
import select from './select';
import events from './events.mjs';
import xml from './xmlnames';
import html from './htmlelts.mjs';
import svg from './svg';
import utils from './utils.mjs';
import MUTATE from './MutationConstants';
import {isApiWritable} from "./config.mjs";

const NAMESPACE = utils.NAMESPACE;

// Map from lowercase event category names (used as arguments to
// createEvent()) to the property name in the impl object of the
// event constructor.
const supportedEvents = {
  event: 'Event',
  customevent: 'CustomEvent',
  uievent: 'UIEvent',
  mouseevent: 'MouseEvent'
};

// Certain arguments to document.createEvent() must be treated specially
const replacementEvent = {
  events: 'event',
  htmlevents: 'event',
  mouseevents: 'mouseevent',
  mutationevents: 'mutationevent',
  uievents: 'uievent'
};

export default class Document extends ContainerNode {

  get nodeValue() {
    return null;
  }
  set nodeValue(nodeValue) {}

  // XXX: DOMCore may remove documentURI, so it is NYI for now
  get documentURI() { return this._address; }
  set documentURI(documentURI) {
    utils.nyi.call(this, documentURI);
  }

  get compatMode() {
    // The _quirks property is set by the HTML parser
    return this._quirks ? 'BackCompat' : 'CSS1Compat';
  }

  // The following attributes and methods are from the HTML spec
  get origin() { return null; }
  get characterSet() { return "UTF-8"; }
  get contentType() { return this._contentType; }
  get URL() { return this._address; }

  get domain() {
    return utils.nyi();
  }
  set domain(domain) {
    utils.nyi();
  }
  get referrer() {
    return utils.nyi();
  }
  get cookie() {
    return utils.nyi();
  }
  set cookie(cookie) {
    utils.nyi();
  }
  get lastModified() {
    return utils.nyi();
  }

  get location() {
    return this.defaultView ? this.defaultView.location : null; // gh #75
  }
  set location(location) {
    utils.nyi();
  }

  get _titleElement() {
    // The title element of a document is the first title element in the
    // document in tree order, if there is one, or null otherwise.
    return this.getElementsByTagName('title').item(0) || null;
  }
  get title() {
    var elt = this._titleElement;
    // The child text content of the title element, or '' if null.
    var value = elt ? elt.textContent : '';
    // Strip and collapse whitespace in value
    return value.replace(/[ \t\n\r\f]+/g, ' ').replace(/(^ )|( $)/g, '');
  }
  set title(value) {
    var elt = this._titleElement;
    var head = this.head;
    if (!elt && !head) { return; /* according to spec */ }
    if (!elt) {
      elt = this.createElement('title');
      head.appendChild(elt);
    }
    elt.textContent = value;
  }

  get dir() {
    const htmlElement = this.documentElement;
    if (htmlElement?.tagName === 'HTML') {
      return htmlElement.dir;
    } else {
      return '';
    }
  }
  set dir(dir) {
    const htmlElement = this.documentElement;
    if (htmlElement?.tagName === 'HTML') {
      htmlElement.dir = dir;
    }
  }
  get fgColor() {
    const body = this.body;
    if (body) {
      return body.text;
    } else {
      return '';
    }
  }
  set fgColor(fgColor) {
    const body = this.body;
    if (body) {
      body.fgColor = fgColor;
    }
  }
  get linkColor() {
    const body = this.body;
    if (body) {
      return body.link;
    } else {
      return '';
    }
  }
  set linkColor(linkColor) {
    const body = this.body;
    if (body) {
      body.link = linkColor;
    }
  }
  get vlinkColor() {
    const body = this.body;
    if (body) {
      return body.vLink;
    } else {
      return '';
    }
  }
  set vlinkColor(vlinkColor) {
    const body = this.body;
    if (body) {
      body.vLink = vlinkColor;
    }
  }
  get alinkColor() {
    const body = this.body;
    if (body) {
      return body.aLink;
    } else {
      return '';
    }
  }
  set alinkColor(alinkColor) {
    const body = this.body;
    if (body) {
      body.aLink = alinkColor;
    }
  }
  get bgColor() {
    const body = this.body;
    if (body) {
      return body.bgColor;
    } else {
      return '';
    }
  }
  set bgColor(bgColor) {
    const body = this.body;
    if (body) {
      body.bgColor = bgColor;
    }
  }

  get scrollingElement() {
    return this._quirks ? this.body : this.documentElement;
  }

  // Return the first <body> child of the document element.
  // XXX For now, setting this attribute is not implemented.
  get body() {
    return namedHTMLChild(this.documentElement, 'body');
  }
  set body(body) {
    utils.nyi();
  }
  // Return the first <head> child of the document element.
  get head() {
    return namedHTMLChild(this.documentElement, 'head');
  }
  get images() {
    return utils.nyi();
  }
  get embeds() {
    return utils.nyi();
  }
  get plugins() {
    return utils.nyi();
  }
  get links() {
    return utils.nyi();
  }
  get forms() {
    return utils.nyi();
  }
  get scripts() {
    return utils.nyi();
  }
  get applets() {
    return [];
  }
  get activeElement() {
    return null;
  }
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

  // Historical aliases of Document#characterSet
  get charset() { return this.characterSet; }
  get inputEncoding() { return this.characterSet; }

  get _documentBaseURL() {
    // XXX: This is not implemented correctly yet
    var url = this._address;
    if (url === 'about:blank') url = '/';

    var base = this.querySelector('base[href]');
    if (base) {
      return new URL(url).resolve(base.getAttribute('href'));
    }
    return url;

    // The document base URL of a Document object is the
    // absolute URL obtained by running these substeps:

    //     Let fallback base url be the document's address.

    //     If fallback base url is about:blank, and the
    //     Document's browsing context has a creator browsing
    //     context, then let fallback base url be the document
    //     base URL of the creator Document instead.

    //     If the Document is an iframe srcdoc document, then
    //     let fallback base url be the document base URL of
    //     the Document's browsing context's browsing context
    //     container's Document instead.

    //     If there is no base element that has an href
    //     attribute, then the document base URL is fallback
    //     base url; abort these steps. Otherwise, let url be
    //     the value of the href attribute of the first such
    //     element.

    //     Resolve url relative to fallback base url (thus,
    //     the base href attribute isn't affected by xml:base
    //     attributes).

    //     The document base URL is the result of the previous
    //     step if it was successful; otherwise it is fallback
    //     base url.
  }

  get _templateDoc() {
    if (!this._templateDocCache) {
      // "associated inert template document"
      var newDoc = new Document(this.isHTML, this._address);
      this._templateDocCache = newDoc._templateDocCache = newDoc;
    }
    return this._templateDocCache;
  }

  constructor(isHTML, address) {
    super();
    this.nodeType = Node.DOCUMENT_NODE;
    this.isHTML = isHTML;
    this._address = address || 'about:blank';
    this.readyState = 'loading';
    this.implementation = new DOMImplementation(this);

    // DOMCore says that documents are always associated with themselves
    this.ownerDocument = null; // ... but W3C tests expect null
    this._contentType = isHTML ? 'text/html' : 'application/xml';

    // These will be initialized by our custom versions of
    // appendChild and insertBefore that override the inherited
    // Node methods.
    // XXX: override those methods!
    this.doctype = null;
    this.documentElement = null;

    // "Associated inert template document"
    this._templateDocCache = null;
    // List of active NodeIterators, see NodeIterator#_preremove()
    this._nodeIterators = null;

    // Documents are always rooted, by definition
    this._nid = 1;
    this._nextnid = 2; // For numbering children of the document
    this._nodes = [null, this];  // nid to node map

    // This maintains the mapping from element ids to element nodes.
    // We may need to update this mapping every time a node is rooted
    // or uprooted, and any time an attribute is added, removed or changed
    // on a rooted element.
    this.byId = Object.create(null);

    // This property holds a monotonically increasing value akin to
    // a timestamp used to record the last modification time of nodes
    // and their subtrees. See the lastModTime attribute and modify()
    // method of the Node class. And see FilteredElementList for an example
    // of the use of lastModTime
    this.modclock = 0;
  }

  // This method allows dom.js to communicate with a renderer
  // that displays the document in some way
  // XXX: I should probably move this to the window object
  _setMutationHandler(handler) {
    this.mutationHandler = handler;
  }

  // This method allows dom.js to receive event notifications
  // from the renderer.
  // XXX: I should probably move this to the window object
  _dispatchRendererEvent(targetNid, type, details) {
    var target = this._nodes[targetNid];
    if (!target) return;
    target._dispatchEvent(new Event(type, details), true);
  }

  createTextNode(data) {
    return new Text(this, String(data));
  }

  createComment(data) {
    return new Comment(this, data);
  }

  createDocumentFragment() {
    return new DocumentFragment(this);
  }

  createProcessingInstruction(target, data) {
    if (!xml.isValidName(target) || data.indexOf('?>') !== -1)
      utils.InvalidCharacterError();
    return new ProcessingInstruction(this, target, data);
  }

  createAttribute(localName) {
    localName = String(localName);
    if (!xml.isValidName(localName)) utils.InvalidCharacterError();
    if (this.isHTML) {
      localName = utils.toASCIILowerCase(localName);
    }
    return new Element._Attr(null, localName, null, null, '');
  }

  createAttributeNS(namespace, qualifiedName) {
    // Convert parameter types according to WebIDL
    namespace =
        (namespace === null || namespace === undefined || namespace === '') ? null :
            String(namespace);
    qualifiedName = String(qualifiedName);
    var ve = validateAndExtract(namespace, qualifiedName);
    return new Element._Attr(null, ve.localName, ve.prefix, ve.namespace, '');
  }

  // This is used directly by HTML parser, which allows it to create
  // elements with localNames containing ':' and non-default namespaces
  _createElementNS(localName, namespace, prefix) {
    if (namespace === NAMESPACE.HTML) {
      return html.createElement(this, localName, prefix);
    }
    else if (namespace === NAMESPACE.SVG) {
      return svg.createElement(this, localName, prefix);
    }

    return new Element(this, localName, namespace, prefix);
  }

  createEvent(interfaceName) {
    interfaceName = interfaceName.toLowerCase();
    var name = replacementEvent[interfaceName] || interfaceName;
    var constructor = events[supportedEvents[name]];

    if (constructor) {
      var e = new constructor();
      e._initialized = false;
      return e;
    }
    else {
      utils.NotSupportedError();
    }
  }

  // See: http://www.w3.org/TR/dom/#dom-document-createtreewalker
  createTreeWalker(root, whatToShow, filter) {
    if (!root) { throw new TypeError("root argument is required"); }
    if (!(root instanceof Node)) { throw new TypeError("root not a node"); }
    whatToShow = whatToShow === undefined ? NodeFilter.SHOW_ALL : (+whatToShow);
    filter = filter === undefined ? null : filter;

    return new TreeWalker(root, whatToShow, filter);
  }

  // See: http://www.w3.org/TR/dom/#dom-document-createnodeiterator
  createNodeIterator(root, whatToShow, filter) {
    if (!root) { throw new TypeError("root argument is required"); }
    if (!(root instanceof Node)) { throw new TypeError("root not a node"); }
    whatToShow = whatToShow === undefined ? NodeFilter.SHOW_ALL : (+whatToShow);
    filter = filter === undefined ? null : filter;

    return new NodeIterator(root, whatToShow, filter);
  }

  _attachNodeIterator(ni) {
    // XXX ideally this should be a weak reference from Document to NodeIterator
    if (!this._nodeIterators) { this._nodeIterators = []; }
    this._nodeIterators.push(ni);
  }

  _detachNodeIterator(ni) {
    // ni should always be in list of node iterators
    var idx = this._nodeIterators.indexOf(ni);
    this._nodeIterators.splice(idx, 1);
  }

  _preremoveNodeIterators(toBeRemoved) {
    if (this._nodeIterators) {
      this._nodeIterators.forEach(function(ni) { ni._preremove(toBeRemoved); });
    }
  }

  // Maintain the documentElement and
  // doctype properties of the document.  Each of the following
  // methods chains to the Node implementation of the method
  // to do the actual inserting, removal or replacement.
  _updateDocTypeElement() {
    this.doctype = this.documentElement = null;
    for (var kid = this.firstChild; kid !== null; kid = kid.nextSibling) {
      if (kid.nodeType === Node.DOCUMENT_TYPE_NODE)
        this.doctype = kid;
      else if (kid.nodeType === Node.ELEMENT_NODE)
        this.documentElement = kid;
    }
  }

  insertBefore(child, refChild) {
    Node.prototype.insertBefore.call(this, child, refChild);
    this._updateDocTypeElement();
    return child;
  }

  replaceChild(node, child) {
    Node.prototype.replaceChild.call(this, node, child);
    this._updateDocTypeElement();
    return child;
  }

  removeChild(child) {
    Node.prototype.removeChild.call(this, child);
    this._updateDocTypeElement();
    return child;
  }

  getElementById(id) {
    var n = this.byId[id];
    if (!n) return null;
    if (n instanceof MultiId) { // there was more than one element with this id
      return n.getFirst();
    }
    return n;
  }

  _hasMultipleElementsWithId(id) {
    // Used internally by querySelectorAll optimization
    return (this.byId[id] instanceof MultiId);
  }

  adoptNode(node) {
    if (node.nodeType === Node.DOCUMENT_NODE) utils.NotSupportedError();
    if (node.nodeType === Node.ATTRIBUTE_NODE) { return node; }

    if (node.parentNode) node.parentNode.removeChild(node);

    if (node.ownerDocument !== this)
      recursivelySetOwner(node, this);

    return node;
  }

  write(args) {
    if (!this.isHTML) utils.InvalidStateError();

    // XXX: still have to implement the ignore-part
    if (!this._parser /* && this._ignore_destructive_writes > 0 */ )
      return;

    if (!this._parser) {
      // XXX call document.open, etc.
    }

    var s = arguments.join('');

    // If the Document object's reload override flag is set, then
    // append the string consisting of the concatenation of all the
    // arguments to the method to the Document's reload override
    // buffer.
    // XXX: don't know what this is about.  Still have to do it

    // If there is no pending parsing-blocking script, have the
    // tokenizer process the characters that were inserted, one at a
    // time, processing resulting tokens as they are emitted, and
    // stopping when the tokenizer reaches the insertion point or when
    // the processing of the tokenizer is aborted by the tree
    // construction stage (this can happen if a script end tag token is
    // emitted by the tokenizer).

    // XXX: still have to do the above. Sounds as if we don't
    // always call parse() here.  If we're blocked, then we just
    // insert the text into the stream but don't parse it reentrantly...

    // Invoke the parser reentrantly
    this._parser.parse(s);
  }

  writeln(args) {
    this.write(Array.prototype.join.call(arguments, '') + '\n');
  }

  open() {
    this.documentElement = null;
  }

  close() {
    this.readyState = 'interactive';
    this._dispatchEvent(new Event('readystatechange'), true);
    this._dispatchEvent(new Event('DOMContentLoaded'), true);
    this.readyState = 'complete';
    this._dispatchEvent(new Event('readystatechange'), true);
    if (this.defaultView) {
      this.defaultView._dispatchEvent(new Event('load'), true);
    }
  }

  // Utility methods
  clone() {
    var d = new Document(this.isHTML, this._address);
    d._quirks = this._quirks;
    d._contentType = this._contentType;
    return d;
  }

  // We need to adopt the nodes if we do a deep clone
  cloneNode(deep) {
    var clone = Node.prototype.cloneNode.call(this, false);
    if (deep) {
      for (var kid = this.firstChild; kid !== null; kid = kid.nextSibling) {
        clone._appendChild(clone.importNode(kid, true));
      }
    }
    clone._updateDocTypeElement();
    return clone;
  }

  isEqual(n) {
    // Any two documents are shallowly equal.
    // Node.isEqualNode will also test the children
    return true;
  }

  // Implementation-specific function.  Called when a text, comment,
  // or pi value changes.
  mutateValue(node) {
    if (this.mutationHandler) {
      this.mutationHandler({
        type: MUTATE.VALUE,
        target: node,
        data: node.data
      });
    }
  }

  // Invoked when an attribute's value changes. Attr holds the new
  // value.  oldval is the old value.  Attribute mutations can also
  // involve changes to the prefix (and therefore the qualified name)
  mutateAttr(attr, oldval) {
    // Manage id->element mapping for getElementsById()
    // XXX: this special case id handling should not go here,
    // but in the attribute declaration for the id attribute
    /*
    if (attr.localName === 'id' && attr.namespaceURI === null) {
      if (oldval) delId(oldval, attr.ownerElement);
      addId(attr.value, attr.ownerElement);
    }
    */
    if (this.mutationHandler) {
      this.mutationHandler({
        type: MUTATE.ATTR,
        target: attr.ownerElement,
        attr: attr
      });
    }
  }

  // Used by removeAttribute and removeAttributeNS for attributes.
  mutateRemoveAttr(attr) {
    /*
    * This is now handled in Attributes.js
        // Manage id to element mapping
        if (attr.localName === 'id' && attr.namespaceURI === null) {
          this.delId(attr.value, attr.ownerElement);
        }
    */
    if (this.mutationHandler) {
      this.mutationHandler({
        type: MUTATE.REMOVE_ATTR,
        target: attr.ownerElement,
        attr: attr
      });
    }
  }

  // Called by Node.removeChild, etc. to remove a rooted element from
  // the tree. Only needs to generate a single mutation event when a
  // node is removed, but must recursively mark all descendants as not
  // rooted.
  mutateRemove(node) {
    // Send a single mutation event
    if (this.mutationHandler) {
      this.mutationHandler({
        type: MUTATE.REMOVE,
        target: node.parentNode,
        node: node
      });
    }

    // Mark this and all descendants as not rooted
    recursivelyUproot(node);
  }

  // Called when a new element becomes rooted.  It must recursively
  // generate mutation events for each of the children, and mark them all
  // as rooted.
  mutateInsert(node) {
    // Mark node and its descendants as rooted
    recursivelyRoot(node);

    // Send a single mutation event
    if (this.mutationHandler) {
      this.mutationHandler({
        type: MUTATE.INSERT,
        target: node.parentNode,
        node: node
      });
    }
  }

  // Called when a rooted element is moved within the document
  mutateMove(node) {
    if (this.mutationHandler) {
      this.mutationHandler({
        type: MUTATE.MOVE,
        target: node
      });
    }
  }

  // Add a mapping from  id to n for n.ownerDocument
  addId(id, n) {
    var val = this.byId[id];
    if (!val) {
      this.byId[id] = n;
    }
    else {
      // TODO: Add a way to opt-out console warnings
      //console.warn('Duplicate element id ' + id);
      if (!(val instanceof MultiId)) {
        val = new MultiId(val);
        this.byId[id] = val;
      }
      val.add(n);
    }
  }

  // Delete the mapping from id to n for n.ownerDocument
  delId(id, n) {
    var val = this.byId[id];
    utils.assert(val);

    if (val instanceof MultiId) {
      val.del(n);
      if (val.length === 1) { // convert back to a single node
        this.byId[id] = val.downgrade();
      }
    }
    else {
      this.byId[id] = undefined;
    }
  }

  _resolve(href) {
    //XXX: Cache the URL
    return new URL(this._documentBaseURL).resolve(href);
  }

  querySelector(selector) {
    return select(selector, this)[0];
  }

  querySelectorAll(selector) {
    var nodes = select(selector, this);
    return nodes.item ? nodes : new NodeList(nodes);
  }

}

Object.defineProperties(Document.prototype, {
  nodeName: {
    value: '#document',
    writable: false
  },
  createElement: {
    value: function(localName) {
      localName = String(localName);
      if (!xml.isValidName(localName)) utils.InvalidCharacterError();
      // Per spec, namespace should be HTML namespace if "context object is
      // an HTML document or context object's content type is
      // "application/xhtml+xml", and null otherwise.
      if (this.isHTML) {
        if (/[A-Z]/.test(localName))
          localName = utils.toASCIILowerCase(localName);
        return html.createElement(this, localName, null);
      } else if (this.contentType === 'application/xhtml+xml') {
        return html.createElement(this, localName, null);
      } else {
        return new Element(this, localName, null, null);
      }
    },
    writable: isApiWritable
  },
  createElementNS: {
    value: function(namespace, qualifiedName) {
      // Convert parameter types according to WebIDL
      namespace =
          (namespace === null || namespace === undefined || namespace === '') ? null :
              String(namespace);
      qualifiedName = String(qualifiedName);
      var ve = validateAndExtract(namespace, qualifiedName);
      return this._createElementNS(ve.localName, ve.namespace, ve.prefix);
    },
    writable: isApiWritable
  },

  importNode: {
    value: function(node, deep) {
      return this.adoptNode(node.cloneNode(deep));
    },
    writable: isApiWritable
  },

  // Just copy this method from the Element prototype
  getElementsByName: { value: Element.prototype.getElementsByName },
  getElementsByTagName: { value: Element.prototype.getElementsByTagName },
  getElementsByTagNameNS: { value: Element.prototype.getElementsByTagNameNS },
  getElementsByClassName: { value: Element.prototype.getElementsByClassName },
});

/** @spec https://dom.spec.whatwg.org/#validate-and-extract */
function validateAndExtract(namespace, qualifiedName) {
  var prefix, localName, pos;
  if (namespace==='') { namespace = null; }
  // See https://github.com/whatwg/dom/issues/671
  // and https://github.com/whatwg/dom/issues/319
  if (!xml.isValidQName(qualifiedName)) {
    utils.InvalidCharacterError();
  }
  prefix = null;
  localName = qualifiedName;

  pos = qualifiedName.indexOf(':');
  if (pos >= 0) {
    prefix = qualifiedName.substring(0, pos);
    localName = qualifiedName.substring(pos+1);
  }
  if (prefix !== null && namespace === null) {
    utils.NamespaceError();
  }
  if (prefix === 'xml' && namespace !== NAMESPACE.XML) {
    utils.NamespaceError();
  }
  if ((prefix === 'xmlns' || qualifiedName === 'xmlns') &&
      namespace !== NAMESPACE.XMLNS) {
    utils.NamespaceError();
  }
  if (namespace === NAMESPACE.XMLNS && !(prefix==='xmlns' || qualifiedName==='xmlns')) {
    utils.NamespaceError();
  }
  return { namespace: namespace, prefix: prefix, localName: localName };
}

const eventHandlerTypes = [
  'abort', 'canplay', 'canplaythrough', 'change', 'click', 'contextmenu',
  'cuechange', 'dblclick', 'drag', 'dragend', 'dragenter', 'dragleave',
  'dragover', 'dragstart', 'drop', 'durationchange', 'emptied', 'ended',
  'input', 'invalid', 'keydown', 'keypress', 'keyup', 'loadeddata',
  'loadedmetadata', 'loadstart', 'mousedown', 'mousemove', 'mouseout',
  'mouseover', 'mouseup', 'mousewheel', 'pause', 'play', 'playing',
  'progress', 'ratechange', 'readystatechange', 'reset', 'seeked',
  'seeking', 'select', 'show', 'stalled', 'submit', 'suspend',
  'timeupdate', 'volumechange', 'waiting',
  'blur', 'error', 'focus', 'load', 'scroll'
];

// Add event handler idl attribute getters and setters to Document
eventHandlerTypes.forEach(function(type) {
  // Define the event handler registration IDL attribute for this type
  Object.defineProperty(Document.prototype, 'on' + type, {
    get: function() {
      return this._getEventHandler(type);
    },
    set: function(v) {
      this._setEventHandler(type, v);
    }
  });
});

function namedHTMLChild(parent, name) {
  if (parent && parent.isHTML) {
    for (var kid = parent.firstChild; kid !== null; kid = kid.nextSibling) {
      if (kid.nodeType === Node.ELEMENT_NODE &&
        kid.localName === name &&
        kid.namespaceURI === NAMESPACE.HTML) {
        return kid;
      }
    }
  }
  return null;
}

function root(n) {
  n._nid = n.ownerDocument._nextnid++;
  n.ownerDocument._nodes[n._nid] = n;
  // Manage id to element mapping
  if (n.nodeType === Node.ELEMENT_NODE) {
    var id = n.getAttribute('id');
    if (id) n.ownerDocument.addId(id, n);

    // Script elements need to know when they're inserted
    // into the document
    if (n._roothook) n._roothook();
  }
}

function uproot(n) {
  // Manage id to element mapping
  if (n.nodeType === Node.ELEMENT_NODE) {
    var id = n.getAttribute('id');
    if (id) n.ownerDocument.delId(id, n);
  }
  n.ownerDocument._nodes[n._nid] = undefined;
  n._nid = undefined;
}

function recursivelyRoot(node) {
  root(node);
  // XXX:
  // accessing childNodes on a leaf node creates a new array the
  // first time, so be careful to write this loop so that it
  // doesn't do that. node is polymorphic, so maybe this is hard to
  // optimize?  Try switching on nodeType?
/*
  if (node.hasChildNodes()) {
    var kids = node.childNodes;
    for(var i = 0, n = kids.length;  i < n; i++)
      recursivelyRoot(kids[i]);
  }
*/
  if (node.nodeType === Node.ELEMENT_NODE) {
    for (var kid = node.firstChild; kid !== null; kid = kid.nextSibling)
      recursivelyRoot(kid);
  }
}

function recursivelyUproot(node) {
  uproot(node);
  for (var kid = node.firstChild; kid !== null; kid = kid.nextSibling)
      recursivelyUproot(kid);
}

function recursivelySetOwner(node, owner) {
  node.ownerDocument = owner;
  node._lastModTime = undefined; // mod times are document-based
  if (Object.prototype.hasOwnProperty.call(node, '_tagName')) {
    node._tagName = undefined; // Element subclasses might need to change case
  }
  for (var kid = node.firstChild; kid !== null; kid = kid.nextSibling)
    recursivelySetOwner(kid, owner);
}

// A class for storing multiple nodes with the same ID
class MultiId {
  constructor(node) {
    this.nodes = Object.create(null);
    this.nodes[node._nid] = node;
    this.length = 1;
    this.firstNode = undefined;
  }

  // Add a node to the list, with O(1) time
  add(node) {
    if (!this.nodes[node._nid]) {
      this.nodes[node._nid] = node;
      this.length++;
      this.firstNode = undefined;
    }
  }

  // Remove a node from the list, with O(1) time
  del(node) {
    if (this.nodes[node._nid]) {
      delete this.nodes[node._nid];
      this.length--;
      this.firstNode = undefined;
    }
  }

  // Get the first node from the list, in the document order
  // Takes O(N) time in the size of the list, with a cache that is invalidated
  // when the list is modified.
  getFirst() {
    /* jshint bitwise: false */
    if (!this.firstNode) {
      var nid;
      for (nid in this.nodes) {
        if (this.firstNode === undefined ||
          this.firstNode.compareDocumentPosition(this.nodes[nid]) & Node.DOCUMENT_POSITION_PRECEDING) {
          this.firstNode = this.nodes[nid];
        }
      }
    }
    return this.firstNode;
  }

  // If there is only one node left, return it. Otherwise return "this".
  downgrade() {
    if (this.length === 1) {
      var nid;
      for (nid in this.nodes) {
        return this.nodes[nid];
      }
    }
    return this;
  }
}
