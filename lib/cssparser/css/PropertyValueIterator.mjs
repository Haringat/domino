/*!
Parser-Lib
Copyright (c) 2009-2011 Nicholas C. Zakas. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

/**
 * A utility class that allows for easy iteration over the various parts of a
 * property value.
 */
export default class PropertyValueIterator {
    /**
     * @param {PropertyValue} value The property value to iterate over.
     */
    constructor(value) {

        /**
         * Iterator value
         * @type int
         * @property _i
         * @private
         */
        this._i = 0;

        /**
         * The parts that make up the value.
         * @type Array
         * @property _parts
         * @private
         */
        this._parts = value.parts;

        /**
         * Keeps track of bookmarks along the way.
         * @type Array
         * @property _marks
         * @private
         */
        this._marks = [];

        /**
         * Holds the original property value.
         * @type parserlib.css.PropertyValue
         * @property value
         */
        this.value = value;

    }

    /**
     * Returns the total number of parts in the value.
     * @return {int} The total number of parts in the value.
     * @method count
     */
    count() {
        return this._parts.length;
    }

    /**
     * Indicates if the iterator is positioned at the first item.
     * @return {Boolean} True if positioned at first item, false if not.
     * @method isFirst
     */
    isFirst() {
        return this._i === 0;
    }

    /**
     * Indicates if there are more parts of the property value.
     * @return {Boolean} True if there are more parts, false if not.
     * @method hasNext
     */
    hasNext() {
        return (this._i < this._parts.length);
    }

    /**
     * Marks the current spot in the iteration so it can be restored to
     * later on.
     * @return {void}
     * @method mark
     */
    mark() {
        this._marks.push(this._i);
    }

    /**
     * Returns the next part of the property value or null if there is no next
     * part. Does not move the internal counter forward.
     * @return {parserlib.css.PropertyValuePart} The next part of the property value or null if there is no next
     * part.
     * @method peek
     */
    peek(count) {
        return this.hasNext() ? this._parts[this._i + (count || 0)] : null;
    }

    /**
     * Returns the next part of the property value or null if there is no next
     * part.
     * @return {parserlib.css.PropertyValuePart} The next part of the property value or null if there is no next
     * part.
     * @method next
     */
    next() {
        return this.hasNext() ? this._parts[this._i++] : null;
    }

    /**
     * Returns the previous part of the property value or null if there is no
     * previous part.
     * @return {parserlib.css.PropertyValuePart} The previous part of the
     * property value or null if there is no previous part.
     * @method previous
     */
    previous() {
        return this._i > 0 ? this._parts[--this._i] : null;
    }

    /**
     * Restores the last saved bookmark.
     * @return {void}
     * @method restore
     */
    restore() {
        if (this._marks.length){
            this._i = this._marks.pop();
        }
    }
}

