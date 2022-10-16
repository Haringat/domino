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

import PropertyValueIterator from "../PropertyValueIterator.mjs";
import Properties from "../properties.mjs";
import ValidationError from "./ValidationError.mjs";
import multiProperty from "./multiProperty.mjs";

export default function validate(property, value){

    //normalize name
    var name        = property.toString().toLowerCase(),
        expression  = new PropertyValueIterator(value),
        spec        = Properties[name];

    if (!spec) {
        if (name.indexOf("-") !== 0){    //vendor prefixed are ok
            throw new ValidationError("Unknown property '" + property + "'.", property.line, property.col);
        }
    } else if (typeof spec !== "number"){

        //initialization
        if (typeof spec === "string"){
            if (spec.indexOf("||") > -1) {
                this.groupProperty(spec, expression);
            } else {
                this.singleProperty(spec, expression, 1);
            }

        } else if (spec.multi) {
            multiProperty(spec.multi, expression, spec.comma, spec.max || Infinity);
        } else if (typeof spec === "function") {
            spec(expression);
        }

    }

}
