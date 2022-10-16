import Node from './Node';
import NodeList from './NodeList.mjs';

// This class defines common functionality for node subtypes that
// can have children
export default class ContainerNode extends Node {

  get childNodes() {
    this._ensureChildNodes();
    return this._childNodes;
  }

  get firstChild() {
    if (this._childNodes) {
      return this._childNodes.length === 0 ? null : this._childNodes[0];
    }
    return this._firstChild;
  }

  get lastChild() {
    const kids = this._childNodes;
    let first;
    if (kids) {
      return kids.length === 0 ? null: kids[kids.length-1];
    }
    first = this._firstChild;
    if (first === null) { return null; }
    return first._previousSibling; // circular linked list
  }

  constructor() {
    super();
    this._firstChild = this._childNodes = null;
  }

  hasChildNodes() {
    if (this._childNodes) {
      return this._childNodes.length > 0;
    }
    return this._firstChild !== null;
  }

  _ensureChildNodes() {
    if (this._childNodes) { return; }
    const first = this._firstChild;
    let kid = first;
    const childNodes = this._childNodes = new NodeList();
    if (first) do {
      childNodes.push(kid);
      kid = kid._nextSibling;
    } while (kid !== first); // circular linked list
    this._firstChild = null; // free memory
  }

  /**
   * Remove all of this node's children.  This is a minor
   * optimization that only calls modify() once.
   */
  removeChildren() {
    const root = this.rooted ? this.ownerDocument : null;
    let next = this.firstChild;
    let kid;
    while (next !== null) {
      kid = next;
      next = kid.nextSibling;

      if (root) root.mutateRemove(kid);
      kid.parentNode = null;
    }
    if (this._childNodes) {
      this._childNodes.length = 0;
    } else {
      this._firstChild = null;
    }
    this.modify(); // Update last modified type once only
  }

}
