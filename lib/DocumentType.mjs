import Node from './Node';
import Leaf from './Leaf.mjs';
import ChildNode from './ChildNode.mjs';

export default class DocumentType extends Leaf {

  get nodeName() {
    return this.name;
  }

  get nodeValue() {
    return null;
  }
  set nodeValue(nodeValue) {
  }

  constructor(ownerDocument, name, publicId, systemId) {
    super();
    this.nodeType = Node.DOCUMENT_TYPE_NODE;
    this.ownerDocument = ownerDocument || null;
    this.name = name;
    this.publicId = publicId || "";
    this.systemId = systemId || "";
  }

  // Utility methods
  clone() {
    return new DocumentType(this.ownerDocument, this.name, this.publicId, this.systemId);
  }

  isEqual(n) {
    return this.name === n.name &&
        this.publicId === n.publicId &&
        this.systemId === n.systemId;
  }
}

Object.defineProperties(DocumentType.prototype, ChildNode);
