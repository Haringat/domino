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

import SyntaxUnit from "../util/SyntaxUnit.mjs";
import Parser from "./Parser.mjs";

/**
 * Represents a single part of a selector string, meaning a single set of
 * element name and modifiers. This does not include combinators such as
 * spaces, +, >, etc.
 */
export default class SelectorPart extends SyntaxUnit {
    /**
     * @param {String} elementName The element name in the selector or null
     *      if there is no element name.
     * @param {Array} modifiers Array of individual modifiers for the element.
     *      May be empty if there are none.
     * @param {String} text The text representation of the unit.
     * @param {int} line The line of text on which the unit resides.
     * @param {int} col The column of text on which the unit resides.
     */
    constructor(elementName, modifiers, text, line, col) {

        super(text, line, col, Parser.SELECTOR_PART_TYPE);

        /**
         * The tag name of the element to which this part
         * of the selector affects.
         * @type String
         * @property elementName
         */
        this.elementName = elementName;

        /**
         * The parts that come after the element name, such as class names, IDs,
         * pseudo classes/elements, etc.
         * @type Array
         * @property modifiers
         */
        this.modifiers = modifiers;

    }
}



