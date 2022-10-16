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

import ValidationError from "./ValidationError.mjs";
import {isAny} from "./validationTypes.mjs";

export default function multiProperty(types, expression, comma, max) {

    var result      = false,
        value       = expression.value,
        count       = 0,
        part;

    while(expression.hasNext() && !result && count < max) {
        if (isAny(expression, types)) {
            count++;
            if (!expression.hasNext()) {
                result = true;

            } else if (comma) {
                if (String(expression.peek()) === ",") {
                    part = expression.next();
                } else {
                    break;
                }
            }
        } else {
            break;

        }
    }

    if (!result) {
        if (expression.hasNext() && !expression.isFirst()) {
            part = expression.peek();
            throw new ValidationError("Expected end of value but found '" + part + "'.", part.line, part.col);
        } else {
            part = expression.previous();
            if (comma && String(part) === ",") {
                throw new ValidationError("Expected end of value but found '" + part + "'.", part.line, part.col);
            } else {
                throw new ValidationError("Expected (" + types + ") but found '" + value + "'.", value.line, value.col);
            }
        }

    } else if (expression.hasNext()) {
        part = expression.next();
        throw new ValidationError("Expected end of value but found '" + part + "'.", part.line, part.col);
    }

}
