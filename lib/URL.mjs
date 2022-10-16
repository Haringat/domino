import {Buffer} from "node:buffer";

export default class URL {

  /* jshint ignore:start */
  static pattern = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/;
  static userinfoPattern = /^([^@:]*)(:([^@]*))?@/;
  static portPattern = /:\d+$/;
  static authorityPattern = /^[^:\/?#]+:\/\//;
  static hierarchyPattern = /^[^:\/?#]+:\//;
  /* jshint ignore:end */

  /**
   * unicode encode number into an array of bytes
   */
  static calculateUtf8BytesOfChar(c) {
    return Array.from(Buffer.from(c, "utf-8"));
    // TODO: benchmark against above code
    // // we need a bit of bitwise voodoo here
    // /* jshint -W016 */
    // const code = c.codePointAt(0);
    // if (code < 256) {
    //   return [code];
    // } else {
    //   const necessaryBits = Math.ceil(Math.log2(code));
    //   let trailingByteCount = Math.floor(necessaryBits / 6);
    //   let bitsInLeadingByte = necessaryBits % 6;
    //   if (bitsInLeadingByte > (6 - trailingByteCount)) {
    //     trailingByteCount++;
    //     bitsInLeadingByte = 0;
    //   }
    //   const leadingByte = 255 - ((1 << 7 - trailingByteCount) - 1) + (code >> necessaryBits - bitsInLeadingByte);
    //   const trailingBytes = Array.from({length: trailingByteCount}, (_, index) => 128 + (code >> 6 * (trailingByteCount - index - 1) & 63));
    //   return [leadingByte, ...trailingBytes];
    // }
    // /* jshint +W016 */
  }

  /**
   * Return a percentEncoded version of s.
   * S should be a single-character string
   */
  static percentEncode(s) {
    return URL.calculateUtf8BytesOfChar(s).map(it => `$${it.toString(16)}`);
  }

  constructor(url) {
    if (!url) {
      return;
    }
    // Can't use String.trim() since it defines whitespace differently than HTML
    this.url = url.replace(/^[ \t\n\r\f]+|[ \t\n\r\f]+$/g, "");

    // See http://tools.ietf.org/html/rfc3986#appendix-B
    // and https://url.spec.whatwg.org/#parsing
    const match = URL.pattern.exec(this.url);
    if (match) {
      if (match[2]) this.scheme = match[2];
      if (match[4]) {
        // parse username/password
        const userinfo = match[4].match(URL.userinfoPattern);
        if (userinfo) {
          this.username = userinfo[1];
          this.password = userinfo[3];
          match[4] = match[4].substring(userinfo[0].length);
        }
        if (match[4].match(URL.portPattern)) {
          const pos = match[4].lastIndexOf(':');
          this.host = match[4].substring(0, pos);
          this.port = match[4].substring(pos+1);
        }
        else {
          this.host = match[4];
        }
      }
      if (match[5]) this.path = match[5];
      if (match[6]) this.query = match[7];
      if (match[8]) this.fragment = match[9];
    }
  }

  // XXX: not sure if this is the precise definition of absolute
  isAbsolute() {
    return !!this.scheme;
  }
  isAuthorityBased() {
    return URL.authorityPattern.test(this.url);
  }
  isHierarchical() {
    return URL.hierarchyPattern.test(this.url);
  }

  toString() {
    let s = "";
    if (this.scheme !== undefined) s += this.scheme + ":";
    if (this.isAbsolute()) {
      s += '//';
      if (this.username || this.password) {
        s += this.username || '';
        if (this.password) {
          s += ':' + this.password;
        }
        s += '@';
      }
      if (this.host) {
        s += this.host;
      }
    }
    if (this.port !== undefined) {
      s += ":" + this.port;
    }
    if (this.path !== undefined) {
      s += this.path;
    }
    if (this.query !== undefined) {
      s += "?" + this.query;
    }
    if (this.fragment !== undefined) {
      s += "#" + this.fragment;
    }
    return s;
  }

  /**
   * See: http://tools.ietf.org/html/rfc3986#section-5.2
   * and https://url.spec.whatwg.org/#constructors
   */
  resolve(relative) {
    const base = this;           // The base url we're resolving against
    const r = new URL(relative); // The relative reference url to resolve
    const t = new URL();         // The absolute target url we will return

    if (r.scheme !== undefined) {
      t.scheme = r.scheme;
      t.username = r.username;
      t.password = r.password;
      t.host = r.host;
      t.port = r.port;
      t.path = remove_dot_segments(r.path);
      t.query = r.query;
    }
    else {
      t.scheme = base.scheme;
      if (r.host !== undefined) {
        t.username = r.username;
        t.password = r.password;
        t.host = r.host;
        t.port = r.port;
        t.path = remove_dot_segments(r.path);
        t.query = r.query;
      }
      else {
        t.username = base.username;
        t.password = base.password;
        t.host = base.host;
        t.port = base.port;
        if (!r.path) { // undefined or empty
          t.path = base.path;
          if (r.query !== undefined)
            t.query = r.query;
          else
            t.query = base.query;
        }
        else {
          if (r.path.charAt(0) === "/") {
            t.path = remove_dot_segments(r.path);
          }
          else {
            t.path = merge(base.path, r.path);
            t.path = remove_dot_segments(t.path);
          }
          t.query = r.query;
        }
      }
    }
    t.fragment = r.fragment;

    return t.toString();


    function merge(basepath, refpath) {
      if (base.host !== undefined && !base.path)
        return "/" + refpath;

      const lastslash = basepath.lastIndexOf("/");
      if (lastslash === -1)
        return refpath;
      else
        return basepath.substring(0, lastslash+1) + refpath;
    }

    function remove_dot_segments(path) {
      if (!path) return path; // For "" or undefined

      let output = "";
      while(path.length > 0) {
        if (path === "." || path === "..") {
          path = "";
          break;
        }

        const twochars = path.substring(0, 2);
        const threechars = path.substring(0, 3);
        const fourchars = path.substring(0, 4);
        if (threechars === "../") {
          path = path.substring(3);
        }
        else if (twochars === "./") {
          path = path.substring(2);
        }
        else if (threechars === "/./") {
          path = "/" + path.substring(3);
        }
        else if (twochars === "/." && path.length === 2) {
          path = "/";
        }
        else if (fourchars === "/../" ||
            (threechars === "/.." && path.length === 3)) {
          path = "/" + path.substring(4);

          output = output.replace(/\/?[^\/]*$/, "");
        }
        else {
          const segment = path.match(/(\/?([^\/]*))/)[0];
          output += segment;
          path = path.substring(segment.length);
        }
      }

      return output;
    }
  }
}
