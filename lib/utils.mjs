"use strict";
import {isApiWritable} from "./config.mjs";

import DOMException from "./DOMException.mjs";

var ERR = DOMException;
export const NAMESPACE = {
  HTML: 'http://www.w3.org/1999/xhtml',
  XML: 'http://www.w3.org/XML/1998/namespace',
  XMLNS: 'http://www.w3.org/2000/xmlns/',
  MATHML: 'http://www.w3.org/1998/Math/MathML',
  SVG: 'http://www.w3.org/2000/svg',
  XLINK: 'http://www.w3.org/1999/xlink'
};

/*
 Shortcut functions for throwing errors of various types.
*/


export function IndexSizeError() { throw new DOMException(ERR.INDEX_SIZE_ERR); }

export function HierarchyRequestError() { throw new DOMException(ERR.HIERARCHY_REQUEST_ERR); }

export function WrongDocumentError() { throw new DOMException(ERR.WRONG_DOCUMENT_ERR); }

export function InvalidCharacterError() { throw new DOMException(ERR.INVALID_CHARACTER_ERR); }

export function NoModificationAllowedError() { throw new DOMException(ERR.NO_MODIFICATION_ALLOWED_ERR); }

export function NotFoundError() { throw new DOMException(ERR.NOT_FOUND_ERR); }

export function NotSupportedError() { throw new DOMException(ERR.NOT_SUPPORTED_ERR); }

export function InvalidStateError() { throw new DOMException(ERR.INVALID_STATE_ERR); }

export function SyntaxError() { throw new DOMException(ERR.SYNTAX_ERR); }

export function InvalidModificationError() { throw new DOMException(ERR.INVALID_MODIFICATION_ERR); }

export function NamespaceError() { throw new DOMException(ERR.NAMESPACE_ERR); }

export function InvalidAccessError() { throw new DOMException(ERR.INVALID_ACCESS_ERR); }

export function TypeMismatchError() { throw new DOMException(ERR.TYPE_MISMATCH_ERR); }

export function SecurityError() { throw new DOMException(ERR.SECURITY_ERR); }

export function NetworkError() { throw new DOMException(ERR.NETWORK_ERR); }

export function AbortError() { throw new DOMException(ERR.ABORT_ERR); }

export function UrlMismatchError() { throw new DOMException(ERR.URL_MISMATCH_ERR); }

export function QuotaExceededError() { throw new DOMException(ERR.QUOTA_EXCEEDED_ERR); }

export function TimeoutError() { throw new DOMException(ERR.TIMEOUT_ERR); }

export function InvalidNodeTypeError() { throw new DOMException(ERR.INVALID_NODE_TYPE_ERR); }

export function DataCloneError() { throw new DOMException(ERR.DATA_CLONE_ERR); }

export function nyi() {
  throw new Error("NotYetImplemented");
}

export function shouldOverride() {
  throw new Error("Abstract function; should be overriding in subclass.");
}

export function assert(expr, msg) {
  if (!expr) {
    throw new Error("Assertion failed: " + (msg || "") + "\n" + new Error().stack);
  }
}

export function expose(src, c) {
  return Object.entries(src)
      .map(([key, value]) => [key, {value, writable: isApiWritable}])
      .reduce((prototype, [key, descriptor]) => Object.defineProperty(prototype, key, descriptor), c.prototype);
}

/**
 * @param a
 * @param b
 * @returns {*}
 * @deprecated use `Object.assign` instead
 */
export function merge(a, b) {
  return Object.assign(a, b);
}

/**
 * Compare two nodes based on their document order. This function is intended
 * to be passed to sort(). Assumes that the array being sorted does not
 * contain duplicates.  And that all nodes are connected and comparable.
 * Clever code by ppk via jeresig.
 */
export function documentOrder(n, m) {
  /* jshint bitwise: false */
  return 3 - (n.compareDocumentPosition(m) & 6);
}

export function toASCIILowerCase(s) {
  return s.replace(/[A-Z]+/g, function(c) {
    return c.toLowerCase();
  });
}

export function toASCIIUpperCase(s) {
  return s.replace(/[a-z]+/g, function(c) {
    return c.toUpperCase();
  });
}
