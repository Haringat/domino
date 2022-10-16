import {SyntaxError, InvalidCharacterError} from './utils.mjs';

// DOMTokenList implementation based on https://github.com/Raynos/DOM-shim
export default class DOMTokenList {
  constructor(getter, setter) {
    this._getString = getter;
    this._setString = setter;
    this._length = 0;
    this._lastStringValue = '';
    this._update();
    this._item = function (index) {
      var list = getList(this);
      if (index < 0 || index >= list.length) {
        return null;
      }
      return list[index];
    };
    this._contains = function (token) {
      token = String(token); // no error checking for contains()
      var list = getList(this);
      return list.indexOf(token) > -1;
    };
    this._add = function () {
      var list = getList(this);
      for (var i = 0, len = arguments.length; i < len; i++) {
        var token = handleErrors(arguments[i]);
        if (list.indexOf(token) < 0) {
          list.push(token);
        }
      }
      // Note: as per spec, if handleErrors() throws any errors, we never
      // make it here and none of the changes take effect.
      // Also per spec: we run the "update steps" even if no change was
      // made (ie, if the token already existed)
      this._update(list);
    };
    this._remove = function () {
      var list = getList(this);
      for (var i = 0, len = arguments.length; i < len; i++) {
        var token = handleErrors(arguments[i]);
        var index = list.indexOf(token);
        if (index > -1) {
          list.splice(index, 1);
        }
      }
      // Note: as per spec, if handleErrors() throws any errors, we never
      // make it here and none of the changes take effect.
      // Also per spec: we run the "update steps" even if no change was
      // made (ie, if the token wasn't previously present)
      this._update(list);
    };
    this._toggle = function toggle(token, force) {
      token = handleErrors(token);
      if (this.contains(token)) {
        if (force === undefined || force === false) {
          this.remove(token);
          return false;
        }
        return true;
      } else {
        if (force === undefined || force === true) {
          this.add(token);
          return true;
        }
        return false;
      }
    };
    this._replace = function replace(token, newToken) {
      // weird corner case of spec: if `token` contains whitespace, but
      // `newToken` is the empty string, we must throw SyntaxError not
      // InvalidCharacterError (sigh)
      if (String(newToken) === '') {
        SyntaxError();
      }
      token = handleErrors(token);
      newToken = handleErrors(newToken);
      var list = getList(this);
      var idx = list.indexOf(token);
      if (idx < 0) {
        // Note that, per spec, we do not run the update steps on this path.
        return false;
      }
      var idx2 = list.indexOf(newToken);
      if (idx2 < 0) {
        list[idx] = newToken;
      } else {
        // "replace the first instance of either `token` or `newToken` with
        // `newToken` and remove all other instances"
        if (idx < idx2) {
          list[idx] = newToken;
          list.splice(idx2, 1);
        } else {
          // idx2 is already `newToken`
          list.splice(idx, 1);
        }
      }
      this._update(list);
      return true;
    };
    this._toString = function () {
      return this._getString();
    };
    this.__update = function (list) {
      if (list) {
        fixIndex(this, list);
        this._setString(list.join(" ").trim());
      } else {
        fixIndex(this, getList(this));
      }
      this._lastStringValue = this._getString();
    };
  }

  get length(){ return this._length; }

  get item() {
    return this._item;
  }

  set item(value) {
    this._item = value;
  }

  get contains() {
    return this._contains;
  }

  set contains(value) {
    this._contains = value;
  }

  get add() {
    return this._add;
  }

  set add(value) {
    this._add = value;
  }

  get remove() {
    return this._remove;
  }

  set remove(value) {
    this._remove = value;
  }

  get toggle() {
    return this._toggle;
  }

  set toggle(value) {
    this._toggle = value;
  }

  get replace() {
    return this._replace;
  }

  set replace(value) {
    this._replace = value;
  }

  get toString() {
    return this._toString;
  }

  set toString(value) {
    this._toString = value;
  }

  get value(){
    return this._getString();
  }

  set value(v) {
    this._setString(v);
    this._update();
  }

  get _update() {
    return this.__update;
  }

  set _update(value) {
    this.__update = value;
  }
}



function fixIndex(clist, list) {
  var oldLength = clist._length;
  var i;
  clist._length = list.length;
  for (i = 0; i < list.length; i++) {
    clist[i] = list[i];
  }
  // Clear/free old entries.
  for (; i < oldLength; i++) {
    clist[i] = undefined;
  }
}

function handleErrors(token) {
  token = String(token);
  if (token === "") {
    SyntaxError();
  }
  if (/[ \t\r\n\f]/.test(token)) {
    InvalidCharacterError();
  }
  return token;
}

function toArray(clist) {
  var length = clist._length;
  var arr = Array(length);
  for (var i = 0; i < length; i++) {
    arr[i] = clist[i];
  }
  return arr;
}

function getList(clist) {
  var strProp = clist._getString();
  if (strProp === clist._lastStringValue) {
    return toArray(clist);
  }
  var str = strProp.replace(/(^[ \t\r\n\f]+)|([ \t\r\n\f]+$)/g, '');
  if (str === "") {
    return [];
  } else {
    var seen = Object.create(null);
    return str.split(/[ \t\r\n\f]+/g).filter(function(n) {
      var key = '$' + n;
      if (seen[key]) { return false; }
      seen[key] = true;
      return true;
    });
  }
}
