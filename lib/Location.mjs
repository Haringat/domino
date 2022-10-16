import URL from "./URL.mjs";
import URLUtils from "./URLUtils";

export default class Location extends URLUtils {

  /**
   * Special behavior when href is set
   */
  get href() {
    return this._href;
  }
  set href(v) {
    this.assign(v);
  }

  constructor(window, href) {
    super();
    this._window = window;
    this._href = href;
  }
  assign(url) {
    /*
     Resolve the new url against the current one
     XXX:
     This is not actually correct. It should be resolved against
     the URL of the document of the script. For now, though, I only
     support a single window and there is only one base url.
     So this is good enough for now.
    */
    const current = new URL(this._href);
    const newurl = current.resolve(url);

    // Save the new url
    this._href = newurl;

    /*
     Start loading the new document!
     XXX
     This is just something hacked together.
     The real algorithm is: http://www.whatwg.org/specs/web-apps/current-work/multipage/history.html#navigate
    */
  }
  replace(url) {
    // XXX
    // Since we aren't tracking history yet, replace is the same as assign
    this.assign(url);
  }
  reload() {
    // XXX:
    // Actually, the spec is a lot more complicated than this
    this.assign(this.href);
  }
  toString() {
    return this.href;
  }
}
