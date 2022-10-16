import Document from './Document.mjs';
import DocumentType from './DocumentType.mjs';
import HTMLParser from './HTMLParser.mjs';
import {InvalidCharacterError, NAMESPACE, nyi} from './utils.mjs';
import xml from './xmlnames';


// Feature/version pairs that DOMImplementation.hasFeature() returns
// true for.  It returns false for anything else.
const supportedFeatures = {
  'xml': { '': true, '1.0': true, '2.0': true },   // DOM Core
  'core': { '': true, '2.0': true },               // DOM Core
  'html': { '': true, '1.0': true, '2.0': true} ,  // HTML
  'xhtml': { '': true, '1.0': true, '2.0': true} , // HTML
};

// Each document must have its own instance of the domimplementation object
export default class DOMImplementation {
  constructor(contextObject) {
    this.contextObject = contextObject;
    this.mozHTMLParser = HTMLParser;
  }

  hasFeature(feature, version) {
      var f = supportedFeatures[(feature || '').toLowerCase()];
      return (f && f[version || '']) || false;
    }

  createDocumentType(qualifiedName, publicId, systemId) {
      if (!xml.isValidQName(qualifiedName)) InvalidCharacterError();

      return new DocumentType(this.contextObject, qualifiedName, publicId, systemId);
    }

  createDocument(namespace, qualifiedName, doctype) {
      //
      // Note that the current DOMCore spec makes it impossible to
      // create an HTML document with this function, even if the
      // namespace and doctype are propertly set.  See this thread:
      // http://lists.w3.org/Archives/Public/www-dom/2011AprJun/0132.html
      //
      var d = new Document(false, null);
      var e;

      if (qualifiedName)
        e = d.createElementNS(namespace, qualifiedName);
      else
        e = null;

      if (doctype) {
        d.appendChild(doctype);
      }

      if (e) d.appendChild(e);
      if (namespace === NAMESPACE.HTML) {
        d._contentType = 'application/xhtml+xml';
      } else if (namespace === NAMESPACE.SVG) {
        d._contentType = 'image/svg+xml';
      } else {
        d._contentType = 'application/xml';
      }

      return d;
    }

  createHTMLDocument(titleText) {
      var d = new Document(true, null);
      d.appendChild(new DocumentType(d, 'html'));
      var html = d.createElement('html');
      d.appendChild(html);
      var head = d.createElement('head');
      html.appendChild(head);
      if (titleText !== undefined) {
        var title = d.createElement('title');
        head.appendChild(title);
        title.appendChild(d.createTextNode(titleText));
      }
      html.appendChild(d.createElement('body'));
      d.modclock = 1; // Start tracking modifications
      return d;
    }

  mozSetOutputMutationHandler(doc, handler) {
      doc.mutationHandler = handler;
    }

  mozGetInputMutationHandler(doc) {
      nyi();
    }
}


