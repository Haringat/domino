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
 * Represents an individual media query.
 */
export default class MediaQuery extends SyntaxUnit {

    /**
     * @param {String} modifier The modifier "not" or "only" (or null).
     * @param {String} mediaType The type of media (i.e., "print").
     * @param {Array} features Array of selectors parts making up this selector.
     * @param {int} line The line of text on which the unit resides.
     * @param {int} col The column of text on which the unit resides.
     */
    constructor(modifier, mediaType, features, line, col){

        super((modifier ? modifier + " ": "") + (mediaType ? mediaType : "") + (mediaType && features.length > 0 ? " and " : "") + features.join(" and "), line, col, Parser.MEDIA_QUERY_TYPE);

        /**
         * The media modifier ("not" or "only")
         * @type String
         * @property modifier
         */
        this.modifier = modifier;

        /**
         * The mediaType (i.e., "print")
         * @type String
         * @property mediaType
         */
        this.mediaType = mediaType;

        /**
         * The parts that make up the selector.
         * @type Array
         * @property features
         */
        this.features = features;

    }
}
