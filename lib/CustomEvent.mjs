import Event from './Event.mjs';

export default class CustomEvent extends Event {
  constructor(type, dictionary) {
    // Just use the superclass constructor to initialize
    super(type, dictionary);
  }
}
