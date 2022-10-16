import {property, registerChangeHandler} from './attributes.mjs';
import {EventHandlerBuilder_build} from './sloppy.mjs';
import {isApiWritable} from "./config.mjs";

export default function defineElement(spec, defaultConstructor, tagList, tagNameToImpl) {
  const ctor = spec.ctor;

  const attributesProps = Object.entries(spec.attributes || {})
      .map(([n, attr]) => {
        if (typeof attr !== 'object' || Array.isArray(attr)) {
          return [n, {type: attr}];
        }
        if (!attr.name) {
          return [
            n,
            {
              ...attr,
              name: n.toLowerCase()
            }
          ];
        }
        return [n, attr];
      })
      .map(([n, attr]) => {
        return [n, property(attr)];
      });
  const props = {
    ...(spec.props ?? {}),
    ...Object.fromEntries(attributesProps)
  };

  props.constructor = { value : ctor, writable: isApiWritable };
  ctor.prototype = Object.create((spec.superclass || defaultConstructor).prototype, props);
  if (spec.events) {
    addEventHandlers(ctor, spec.events);
  }
  tagList[ctor.name] = ctor;

  (spec.tags || spec.tag && [spec.tag] || []).forEach(function(tag) {
    tagNameToImpl[tag] = ctor;
  });

  return ctor;
}

function EventHandlerBuilder(body, document, form, element) {
  this.body = body;
  this.document = document;
  this.form = form;
  this.element = element;
}

EventHandlerBuilder.prototype.build = EventHandlerBuilder_build;

function EventHandlerChangeHandler(elt, name, oldval, newval) {
  const doc = elt.ownerDocument || Object.create(null);
  const form = elt.form || Object.create(null);
  elt[name] = new EventHandlerBuilder(newval, doc, form, elt).build();
}

function addEventHandlers(c, eventHandlerTypes) {
  const p = c.prototype;
  eventHandlerTypes.forEach(type => {
    // Define the event handler registration IDL attribute for this type
    Object.defineProperty(p, "on" + type, {
      get: function() {
        return this._getEventHandler(type);
      },
      set: function(v) {
        this._setEventHandler(type, v);
      },
    });

    // Define special behavior for the content attribute as well
    registerChangeHandler(c, "on" + type, EventHandlerChangeHandler);
  });
}
