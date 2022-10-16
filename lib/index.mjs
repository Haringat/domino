import DOMImplementation from './DOMImplementation.mjs';
import HTMLParser from './HTMLParser.mjs';
import Window from './Window';

export function createDOMImplementation() {
  return new DOMImplementation(null);
}

export function createDocument(html, force) {
  // Previous API couldn't let you pass '' as a document, and that
  // yields a slightly different document than createHTMLDocument('')
  // does.  The new `force` parameter lets you pass '' if you want to.
  if (html || force) {
    var parser = new HTMLParser();
    parser.parse(html || '', true);
    return parser.document();
  }
  return new DOMImplementation(null).createHTMLDocument("");
}

/**
 *
 * @returns {{process: (function(*): boolean|boolean), document: (function(): Document), end: end, write: write}}
 */
export function createIncrementalHTMLParser() {
    var parser = new HTMLParser();
    /** API for incremental parser. */
    return {
        /** Provide an additional chunk of text to be parsed. */
        write: function(s) {
          if (s.length > 0) {
            parser.parse(s, false, function() { return true; });
          }
        },
        /**
         * Signal that we are done providing input text, optionally
         * providing one last chunk as a parameter.
         */
        end: function(s) {
          parser.parse(s || '', true, function() { return true; });
        },
        /**
         * Performs a chunk of parsing work, returning at the end of
         * the next token as soon as shouldPauseFunc() returns true.
         * Returns true iff there is more work to do.
         *
         * For example:
         * ```
         *  var incrParser = domino.createIncrementalHTMLParser();
         *  incrParser.end('...long html document...');
         *  while (true) {
         *    // Pause every 10ms
         *    var start = Date.now();
         *    var pauseIn10 = function() { return (Date.now() - start) >= 10; };
         *    if (!incrParser.process(pauseIn10)) {
         *      break;
         *    }
         *    ...yield to other tasks, do other housekeeping, etc...
         *  }
         * ```
         */
        process: function(shouldPauseFunc) {
          return parser.parse('', false, shouldPauseFunc);
        },
        /**
         * Returns the result of the incremental parse.  Valid after
         * `this.end()` has been called and `this.process()` has returned
         * false.
         */
        document: function() {
          return parser.document();
        },
    };
}

export function createWindow(html, address) {
    const document = createDocument(html);
    if (address !== undefined) { document._address = address; }
  return new Window(document);
}

import impl from './impl';
export {impl};
