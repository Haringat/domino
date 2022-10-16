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
import Specificity from "./Specificity.mjs";

/**
 * Represents an entire single selector, including all parts but not
 * including multiple selectors (those separated by commas).
 */
export default class Selector extends SyntaxUnit {
    /**
     * @param {Array} parts Array of selectors parts making up this selector.
     * @param {int} line The line of text on which the unit resides.
     * @param {int} col The column of text on which the unit resides.
     */
    constructor(parts, line, col) {

        super(parts.join(" "), line, col, Parser.SELECTOR_TYPE);

        /**
         * The parts that make up the selector.
         * @type Array
         * @property parts
         */
        this.parts = parts;

        /**
         * The specificity of the selector.
         * @type Specificity
         * @property specificity
         */
        this.specificity = Specificity.calculate(this);

    }
}



