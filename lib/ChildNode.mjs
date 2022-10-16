import Node from './Node';
import LinkedList from './LinkedList.mjs';

function createDocumentFragmentFromArguments(document, args) {
  const docFrag = document.createDocumentFragment();
  return args
    .map(it => {
      const isNode = it instanceof Node;
      return isNode ? it : document.createTextNode(String(it));
    })
    .forEach((it) => docFrag.appendChild(it));
}

/*
 * The ChildNode interface contains methods that are particular to `Node`
 * objects that can have a parent.  It is implemented by `Element`,
 * `DocumentType`, and `CharacterData` objects.
 */
const ChildNode = {

  /**
   * Inserts a set of Node or String objects in the children list of this
   * ChildNode's parent, just after this ChildNode.  String objects are
   * inserted as the equivalent Text nodes.
   */
  after(...argArr) {
    var parentNode = this.parentNode, nextSibling = this.nextSibling;
    if (parentNode === null) { return; }
    // Find "viable next sibling"; that is, next one not in argArr
    while (nextSibling && argArr.some(v => v === nextSibling))
      nextSibling = nextSibling.nextSibling;
    // ok, parent and sibling are saved away since this node could itself
    // appear in argArr and we're about to move argArr to a document fragment.
    var docFrag = createDocumentFragmentFromArguments(this.doc, argArr);

    parentNode.insertBefore(docFrag, nextSibling);
  },

  /**
   * Inserts a set of Node or String objects in the children list of this
   * ChildNode's parent, just before this ChildNode.  String objects are
   * inserted as the equivalent Text nodes.
   */
  before(...argArr) {
    const parentNode = this.parentNode;
    let prevSibling = this.previousSibling;
    if (parentNode === null) { return; }
    // Find "viable prev sibling"; that is, prev one not in argArr
    while (prevSibling && argArr.some(v => v === prevSibling))
      prevSibling = prevSibling.previousSibling;
    // ok, parent and sibling are saved away since this node could itself
    // appear in argArr and we're about to move argArr to a document fragment.
    const docFrag = createDocumentFragmentFromArguments(this.doc, argArr);

    const nextSibling =
        prevSibling ? prevSibling.nextSibling : parentNode.firstChild;
    parentNode.insertBefore(docFrag, nextSibling);
  },

  /**
   * Remove this node from its parent
   */
  remove() {
    if (this.parentNode === null) return;

    // Send mutation events if necessary
    if (this.doc) {
      this.doc._preremoveNodeIterators(this);
      if (this.rooted) {
        this.doc.mutateRemove(this);
      }
    }

    // Remove this node from its parents array of children
    // and update the structure id for all ancestors
    this._remove();

    // Forget this node's parent
    this.parentNode = null;
  },

  /**
   * Remove this node w/o uprooting or sending mutation events
   * (But do update the structure id for all ancestors)
   */
  _remove() {
    const parent = this.parentNode;
    if (parent === null) return;
    if (parent._childNodes) {
      parent._childNodes.splice(this.index, 1);
    } else if (parent._firstChild === this) {
      if (this._nextSibling === this) {
        parent._firstChild = null;
      } else {
        parent._firstChild = this._nextSibling;
      }
    }
    LinkedList.remove(this);
    parent.modify();
  },

  /**
   * Replace this node with the nodes or strings provided as arguments.
   */
  replaceWith(...argArr) {
    const parentNode = this.parentNode;
    let nextSibling = this.nextSibling;
    if (parentNode === null) { return; }
    // Find "viable next sibling"; that is, next one not in argArr
    while (nextSibling && argArr.some(v => v === nextSibling))
      nextSibling = nextSibling.nextSibling;
    // ok, parent and sibling are saved away since this node could itself
    // appear in argArr and we're about to move argArr to a document fragment.
    const docFrag = createDocumentFragmentFromArguments(this.doc, argArr);
    if (this.parentNode === parentNode) {
      parentNode.replaceChild(docFrag, this);
    } else {
      // `this` was inserted into docFrag
      parentNode.insertBefore(docFrag, nextSibling);
    }
  },

};

export default Object.getOwnPropertyDescriptors(ChildNode);
