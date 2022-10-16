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
 * Base type to represent a single syntactic unit.
 * @param {String} text The text of the unit.
 * @param {int} line The line of text on which the unit resides.
 * @param {int} col The column of text on which the unit resides.
 */
export default class SyntaxUnit {

    /**
     * Create a new syntax unit based solely on the given token.
     * Convenience method for creating a new syntax unit when
     * it represents a single token instead of multiple.
     * @param {Object} token The token object to represent.
     * @return {SyntaxUnit} The object representing the token.
     * @static
     * @method fromToken
     */
    static fromToken(token){
        return new SyntaxUnit(token.value, token.startLine, token.startCol);
    }

    constructor(text, line, col, type){


        /**
         * The column of text on which the unit resides.
         * @type int
         * @property col
         */
        this.col = col;

        /**
         * The line of text on which the unit resides.
         * @type int
         * @property line
         */
        this.line = line;

        /**
         * The text representation of the unit.
         * @type String
         * @property text
         */
        this.text = text;

        /**
         * The type of syntax unit.
         * @type int
         * @property type
         */
        this.type = type;
    }

    /**
     * Returns the text representation of the unit.
     * @return {String} The text representation of the unit.
     * @method valueOf
     */
    valueOf(){
        return this.toString();
    }

    /**
     * Returns the text representation of the unit.
     * @return {String} The text representation of the unit.
     * @method toString
     */
    toString(){
        return this.text;
    }

}
