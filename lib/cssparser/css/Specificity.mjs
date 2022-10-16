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

import Pseudos from "./pseudos.mjs";
import SelectorPart from "./SelectorPart.mjs";

/**
 * Represents a selector's specificity.
 */
export default class Specificity {
    /**
     * @param {int} a Should be 1 for inline styles, zero for stylesheet styles
     * @param {int} b Number of ID selectors
     * @param {int} c Number of classes and pseudo classes
     * @param {int} d Number of element names and pseudo-elements
     */
    constructor(a, b, c, d) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.constructor = Specificity;
    }

    /**
     * Compare this specificity to another.
     * @param {Specificity} other The other specificity to compare to.
     * @return {int} -1 if the other specificity is larger, 1 if smaller, 0 if equal.
     * @method compare
     */
    compare(other) {
        const comps = ["a", "b", "c", "d"];

        for (let i=0; i < comps.length; i++){
            if (this[comps[i]] < other[comps[i]]){
                return -1;
            } else if (this[comps[i]] > other[comps[i]]){
                return 1;
            }
        }

        return 0;
    }

    /**
     * Creates a numeric value for the specificity.
     * @return {int} The numeric value for the specificity.
     * @method valueOf
     */
    valueOf() {
        return (this.a * 1000) + (this.b * 100) + (this.c * 10) + this.d;
    }

    /**
     * Returns a string representation for specificity.
     * @return {String} The string representation of specificity.
     * @method toString
     */
    toString() {
        return this.a + "," + this.b + "," + this.c + "," + this.d;
    }

    /**
     * Calculates the specificity of the given selector.
     * @param {Selector} selector The selector to calculate specificity for.
     * @return {Specificity} The specificity of the selector.
     * @static
     * @method calculate
     */
    static calculate(selector) {

        let part;
        let b = 0;
        let c = 0;
        let d = 0;

        function updateValues(part){

            let j;
            let num;
            const elementName = part.elementName ? part.elementName.text : "";
            let modifier;

            if (elementName && elementName.charAt(elementName.length-1) !== "*") {
                d++;
            }

            for (let i=0; i < part.modifiers.length; i++){
                modifier = part.modifiers[i];
                switch(modifier.type){
                    case "class":
                    case "attribute":
                        c++;
                        break;

                    case "id":
                        b++;
                        break;

                    case "pseudo":
                        if (Pseudos.isElement(modifier.text)){
                            d++;
                        } else {
                            c++;
                        }
                        break;

                    case "not":
                        for (j=0, num=modifier.args.length; j < num; j++){
                            updateValues(modifier.args[j]);
                        }
                }
            }
        }

        for (let i=0; i < selector.parts.length; i++){
            part = selector.parts[i];

            if (part instanceof SelectorPart){
                updateValues(part);
            }
        }

        return new Specificity(0, b, c, d);
    }
}



