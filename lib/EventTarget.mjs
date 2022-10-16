import Event from './Event.mjs';
import MouseEvent from './MouseEvent';
import {InvalidStateError} from './utils.mjs';

export default class EventTarget {
  constructor() {}

  // abort if it sees any node with a zero count.
  addEventListener(type, listener, capture) {
    if (!listener) return;
    if (capture === undefined) capture = false;
    if (!this._listeners) this._listeners = Object.create(null);
    if (!this._listeners[type]) this._listeners[type] = [];
    const list = this._listeners[type];

    // If this listener has already been registered, just return
    for(let i = 0; i < list.length; i++) {
      const l = list[i];
      if (l.listener === listener && l.capture === capture)
        return;
    }

    // Add an object to the list of listeners
    const obj = {listener: listener, capture: capture};
    if (typeof listener === 'function') obj.f = listener;
    list.push(obj);
  }

  removeEventListener(type, listener, capture) {
    if (capture === undefined) capture = false;
    if (this._listeners) {
      const list = this._listeners[type];
      if (list) {
        // Find the listener in the list and remove it
        for(let i = 0; i < list.length; i++) {
          const l = list[i];
          if (l.listener === listener && l.capture === capture) {
            if (list.length === 1) {
              this._listeners[type] = undefined;
            }
            else {
              list.splice(i, 1);
            }
            return;
          }
        }
      }
    }
  }

  /**
   * See _dispatchEvent for the implementation
   */
  dispatchEvent(event) {
    // Dispatch an untrusted event
    return this._dispatchEvent(event, false);
  }

  _dispatchEvent(event, trusted) {
    if (typeof trusted !== 'boolean') trusted = false;
    function invoke(target, event) {
      const type = event.type, phase = event.eventPhase;
      event.currentTarget = target;

      // If there was an individual handler defined, invoke it first
      // XXX: see comment above: this shouldn't always be first.
      if (phase !== Event.CAPTURING_PHASE && target._handlers && target._handlers[type]) {
        const handler = target._handlers[type];
        let rv;
        if (typeof handler === 'function') {
          rv=handler.call(event.currentTarget, event);
        }
        else {
          const f = handler.handleEvent;
          if (typeof f !== 'function')
            throw new TypeError('handleEvent property of ' +
                'event handler object is' +
                'not a function.');
          rv=f.call(handler, event);
        }

        switch(event.type) {
          case 'mouseover':
            if (rv === true)  // Historical baggage
              event.preventDefault();
            break;
          case 'beforeunload':
            // XXX: eventually we need a special case here
            /* falls through */
          default:
            if (rv === false)
              event.preventDefault();
            break;
        }
      }

      // Now invoke list of listeners for this target and type
      let list = target._listeners && target._listeners[type];
      if (!list) return;
      list = list.slice();
      for(let i = 0; i < list.length; i++) {
        if (event._immediatePropagationStopped) return;
        const l = list[i];
        if ((phase === Event.CAPTURING_PHASE && !l.capture) ||
            (phase === Event.BUBBLING_PHASE && l.capture))
          continue;
        if (l.f) {
          l.f.call(event.currentTarget, event);
        }
        else {
          const fn = l.listener.handleEvent;
          if (typeof fn !== 'function')
            throw new TypeError('handleEvent property of event listener object is not a function.');
          fn.call(l.listener, event);
        }
      }
    }

    if (!event._initialized || event._dispatching) InvalidStateError();
    event.isTrusted = trusted;

    // Begin dispatching the event now
    event._dispatching = true;
    event.target = this;

    // Build the list of targets for the capturing and bubbling phases
    // XXX: we'll eventually have to add Window to this list.
    const ancestors = [];
    for(let n = this.parentNode; n; n = n.parentNode)
      ancestors.push(n);

    // Capturing phase
    event.eventPhase = Event.CAPTURING_PHASE;
    for(var i = ancestors.length-1; i >= 0; i--) {
      invoke(ancestors[i], event);
      if (event._propagationStopped) break;
    }

    // At target phase
    if (!event._propagationStopped) {
      event.eventPhase = Event.AT_TARGET;
      invoke(this, event);
    }

    // Bubbling phase
    if (event.bubbles && !event._propagationStopped) {
      event.eventPhase = Event.BUBBLING_PHASE;
      for(var ii = 0, nn = ancestors.length; ii < nn; ii++) {
        invoke(ancestors[ii], event);
        if (event._propagationStopped) break;
      }
    }

    event._dispatching = false;
    event.eventPhase = Event.AT_TARGET;
    event.currentTarget = null;

    // Deal with mouse events and figure out when
    // a click has happened
    if (trusted && !event.defaultPrevented && event instanceof MouseEvent) {
      switch(event.type) {
        case 'mousedown':
          this._armed = {
            x: event.clientX,
            y: event.clientY,
            t: event.timeStamp
          };
          break;
        case 'mouseout':
        case 'mouseover':
          this._armed = null;
          break;
        case 'mouseup':
          if (this._isClick(event)) this._doClick(event);
          this._armed = null;
          break;
      }
    }

    return !event.defaultPrevented;
  }

  // XXX We don't support double clicks for now
  _isClick(event) {
    return (this._armed !== null &&
        event.type === 'mouseup' &&
        event.isTrusted &&
        event.button === 0 &&
        event.timeStamp - this._armed.t < 1000 &&
        Math.abs(event.clientX - this._armed.x) < 10 &&
        Math.abs(event.clientY - this._armed.Y) < 10);
  }

  // The event argument must be the trusted mouseup event
  _doClick(event) {
    if (this._click_in_progress) return;
    this._click_in_progress = true;

    // Find the nearest enclosing element that is activatable
    // An element is activatable if it has a
    // _post_click_activation_steps hook
    let activated = this;
    while(activated && !activated._post_click_activation_steps)
      activated = activated.parentNode;

    if (activated && activated._pre_click_activation_steps) {
      activated._pre_click_activation_steps();
    }

    const click = this.ownerDocument.createEvent('MouseEvent');
    click.initMouseEvent('click', true, true,
        this.ownerDocument.defaultView, 1,
        event.screenX, event.screenY,
        event.clientX, event.clientY,
        event.ctrlKey, event.altKey,
        event.shiftKey, event.metaKey,
        event.button, null);

    const result = this._dispatchEvent(click, true);

    if (activated) {
      if (result) {
        // This is where hyperlinks get followed, for example.
        if (activated._post_click_activation_steps)
          activated._post_click_activation_steps(click);
      }
      else {
        if (activated._cancelled_activation_steps)
          activated._cancelled_activation_steps();
      }
    }
  }

  _setEventHandler(type, handler) {
    if (!this._handlers) this._handlers = Object.create(null);
    this._handlers[type] = handler;
  }

  _getEventHandler(type) {
    return (this._handlers && this._handlers[type]) || null;
  }
}


