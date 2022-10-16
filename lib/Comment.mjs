import Node from './Node';
import CharacterData from './CharacterData.mjs';

export default class Comment extends CharacterData {

  get nodeValue() {
    return this._data;
  }
  set nodeValue(nodeValue) {
    this._data = String(nodeValue ?? '');
    if (this.rooted)
      this.ownerDocument.mutateValue(this);
  }

  get textContent() {
    return this.nodeValue;
  }
  set textContent(textContent) {
    this.nodeValue = textContent;
  }

  get data() {
    return this.nodeValue;
  }
  set data(data) {
    this.nodeValue = data;
  }

  constructor(doc, data) {
    super();
    this.nodeType = Node.COMMENT_NODE;
    this.ownerDocument = doc;
    this._data = data;
  }

  clone() {
    return new Comment(this.ownerDocument, this._data);
  }
}

Object.defineProperty(Comment.prototype, 'nodeName', {
  value: '#comment',
  writable: false
});
