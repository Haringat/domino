/*
 * Domino uses sloppy-mode features (in particular, `with`) for a few
 * minor things. This file encapsulates all the sloppiness; every
 * other module should be strict.
 */
/* jshint evil: true */

export function Window_run(code, file) {
  "use strict";
  if (file) code += '\n//@ sourceURL=' + file;
  new Function("code", "with(this) eval(code)").call(this, code);
}

export function EventHandlerBuilder_build() {
  try {
    return new Function("defaultView", "document", "form", "element", "event", "with(defaultView)with(document)with(form)with(element){"+this.body+"};").bind(this, this.document.defaultView || Object.create(null), this.document, this.form, this.element);
  } catch (err) {
    return function () { throw err; };
  }
}
