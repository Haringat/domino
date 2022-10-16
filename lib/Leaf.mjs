"use strict";
import Node from "./Node";
import NodeList from "./NodeList.mjs";
import {HierarchyRequestError, NotFoundError} from "./utils.mjs";

/**
 * This class defines common functionality for node subtypes that
 * can never have children
 */
export default class Leaf extends Node {

  /* jshint ignore:start */
  firstChild = null
  lastChild = null
  /* jshint ignore:end */

  constructor() {
    super();
  }

  hasChildNodes() {
    return false;
  }
  insertBefore(node, child) {
    if (!node.nodeType) throw new TypeError('not a node');
    HierarchyRequestError();
  }
  replaceChild(node, child) {
    if (!node.nodeType) throw new TypeError('not a node');
    HierarchyRequestError();
  }
  removeChild(node) {
    if (!node.nodeType) throw new TypeError('not a node');
    NotFoundError();
  }
  removeChildren() {
    /* no op */
  }
  childNodes() {
    if (!this._childNodes) this._childNodes = new NodeList();
    return this._childNodes;
  }
}


