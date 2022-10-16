import Node from './Node';


const NonDocumentTypeChildNode = {

  get nextElementSibling() {
    if (this.parentNode) {
      for (var kid = this.nextSibling; kid !== null; kid = kid.nextSibling) {
        if (kid.nodeType === Node.ELEMENT_NODE) return kid;
      }
    }
    return null;
  },

  get previousElementSibling() {
    if (this.parentNode) {
      for (var kid = this.previousSibling; kid !== null; kid = kid.previousSibling) {
        if (kid.nodeType === Node.ELEMENT_NODE) return kid;
      }
    }
    return null;
  }

};

export default Object.getOwnPropertyDescriptors(NonDocumentTypeChildNode);
