import ValidationError from "./ValidationError.mjs";

/**
 * Determines if the next part(s) of the given expression
 * are of a given type.
 */
export function isType(expression, type) {
    const part = expression.peek();
    let result;

    if (type.charAt(0) !== "<") {
        result = isLiteral(part, type);
        if (result) {
            expression.next();
        }
    } else if (simple[type]) {
        result = simple[type](part);
        if (result) {
            expression.next();
        }
    } else {
        result = complex[type](expression);
    }

    return result;
}

/**
 * Determines if the next part(s) of the given expression
 * are one of a group.
 */
export function isAnyOfGroup(expression, types) {
    return types.split(" || ").find(it => isType(expression, it)) ?? false;
}

/**
 * Determines if the next part(s) of the given expression
 * are any of the given types.
 */
export function isAny(expression, types) {
    return expression.hasNext() && types.split(" | ").some(it => isType(expression, it));
}

export function isComplex(type) {
    return !!complex[type];
}

export function isSimple(type) {
    return !!simple[type];
}

export function isLiteral(part, literals) {
    const text = part.text.toString().toLowerCase();

    return literals.split(" | ").some(it => text === it.toLowerCase());
}

const simpleValues = {

    "<absolute-size>": function(part){
        return isLiteral(part, "xx-small | x-small | small | medium | large | x-large | xx-large");
    },

    "<attachment>": function(part){
        return isLiteral(part, "scroll | fixed | local");
    },

    "<attr>": function(part){
        return part.type === "function" && part.name === "attr";
    },

    "<bg-image>": function(part){
        return this["<image>"](part) || this["<gradient>"](part) ||  String(part) === "none";
    },

    "<gradient>": function(part) {
        return part.type === "function" && /^(?:-(?:ms|moz|o|webkit)-)?(?:repeating-)?(?:radial-|linear-)?gradient/i.test(part);
    },

    "<box>": function(part){
        return isLiteral(part, "padding-box | border-box | content-box");
    },

    "<content>": function(part){
        return part.type === "function" && part.name === "content";
    },

    "<relative-size>": function(part){
        return isLiteral(part, "smaller | larger");
    },

    //any identifier
    "<ident>": function(part){
        return part.type === "identifier";
    },

    "<length>": function(part){
        if (part.type === "function" && /^(?:-(?:ms|moz|o|webkit)-)?calc/i.test(part)){
            return true;
        }else{
            return part.type === "length" || part.type === "number" || part.type === "integer" || String(part) === "0";
        }
    },

    "<color>": function(part){
        return part.type === "color" || String(part) === "transparent" || String(part) === "currentColor";
    },

    "<number>": function(part){
        return part.type === "number" || this["<integer>"](part);
    },

    "<integer>": function(part){
        return part.type === "integer";
    },

    "<line>": function(part){
        return part.type === "integer";
    },

    "<angle>": function(part){
        return part.type === "angle";
    },

    "<uri>": function(part){
        return part.type === "uri";
    },

    "<image>": function(part){
        return this["<uri>"](part);
    },

    "<percentage>": function(part){
        return part.type === "percentage" || String(part) === "0";
    },

    "<border-width>": function(part){
        return this["<length>"](part) || isLiteral(part, "thin | medium | thick");
    },

    "<border-style>": function(part){
        return isLiteral(part, "none | hidden | dotted | dashed | solid | double | groove | ridge | inset | outset");
    },

    "<content-sizing>": function(part){ // http://www.w3.org/TR/css3-sizing/#width-height-keywords
        return isLiteral(part, "fill-available | -moz-available | -webkit-fill-available | max-content | -moz-max-content | -webkit-max-content | min-content | -moz-min-content | -webkit-min-content | fit-content | -moz-fit-content | -webkit-fit-content");
    },

    "<margin-width>": function(part){
        return this["<length>"](part) || this["<percentage>"](part) || isLiteral(part, "auto");
    },

    "<padding-width>": function(part){
        return this["<length>"](part) || this["<percentage>"](part);
    },

    "<shape>": function(part){
        return part.type === "function" && (part.name === "rect" || part.name === "inset-rect");
    },

    "<time>": function(part) {
        return part.type === "time";
    },

    "<flex-grow>": function(part){
        return this["<number>"](part);
    },

    "<flex-shrink>": function(part){
        return this["<number>"](part);
    },

    "<width>": function(part){
        return this["<margin-width>"](part);
    },

    "<flex-basis>": function(part){
        return this["<width>"](part);
    },

    "<flex-direction>": function(part){
        return isLiteral(part, "row | row-reverse | column | column-reverse");
    },

    "<flex-wrap>": function(part){
        return isLiteral(part, "nowrap | wrap | wrap-reverse");
    },

    "<feature-tag-value>": function(part){
        return (part.type === "function" && /^[A-Z0-9]{4}$/i.test(part));
    }
};

export const simple = Object.create(null, Object.getOwnPropertyDescriptors(simpleValues));

const complexValues = {

    "<bg-position>": function(expression){
        let result = false;
        const numeric = "<percentage> | <length>";
        const xDir = "left | right";
        const yDir = "top | bottom";
        let count = 0;

        while (expression.peek(count) && expression.peek(count).text !== ",") {
            count++;
        }

        /*
        <position> = [
          [ left | center | right | top | bottom | <percentage> | <length> ]
        |
          [ left | center | right | <percentage> | <length> ]
          [ top | center | bottom | <percentage> | <length> ]
        |
          [ center | [ left | right ] [ <percentage> | <length> ]? ] &&
          [ center | [ top | bottom ] [ <percentage> | <length> ]? ]
        ]
        */

        if (count < 3) {
            if (isAny(expression, xDir + " | center | " + numeric)) {
                result = true;
                isAny(expression, yDir + " | center | " + numeric);
            } else if (isAny(expression, yDir)) {
                result = true;
                isAny(expression, xDir + " | center");
            }
        } else {
            if (isAny(expression, xDir)) {
                if (isAny(expression, yDir)) {
                    result = true;
                    isAny(expression, numeric);
                } else if (isAny(expression, numeric)) {
                    if (isAny(expression, yDir)) {
                        result = true;
                        isAny(expression, numeric);
                    } else if (isAny(expression, "center")) {
                        result = true;
                    }
                }
            } else if (isAny(expression, yDir)) {
                if (isAny(expression, xDir)) {
                    result = true;
                    isAny(expression, numeric);
                } else if (isAny(expression, numeric)) {
                    if (isAny(expression, xDir)) {
                        result = true;
                        isAny(expression, numeric);
                    } else if (isAny(expression, "center")) {
                        result = true;
                    }
                }
            } else if (isAny(expression, "center")) {
                if (isAny(expression, xDir + " | " + yDir)) {
                    result = true;
                    isAny(expression, numeric);
                }
            }
        }

        return result;
    },

    "<bg-size>": function(expression){
        //<bg-size> = [ <length> | <percentage> | auto ]{1,2} | cover | contain
        let result = false;
        const numeric = "<percentage> | <length> | auto";

        if (isAny(expression, "cover | contain")) {
            result = true;
        } else if (isAny(expression, numeric)) {
            result = true;
            isAny(expression, numeric);
        }

        return result;
    },

    "<repeat-style>": function(expression){
        //repeat-x | repeat-y | [repeat | space | round | no-repeat]{1,2}
        var result  = false,
            values  = "repeat | space | round | no-repeat",
            part;

        if (expression.hasNext()){
            part = expression.next();

            if (isLiteral(part, "repeat-x | repeat-y")) {
                result = true;
            } else if (isLiteral(part, values)) {
                result = true;

                if (expression.hasNext() && isLiteral(expression.peek(), values)) {
                    expression.next();
                }
            }
        }

        return result;

    },

    "<shadow>": function(expression) {
        //inset? && [ <length>{2,4} && <color>? ]
        var result  = false,
            count   = 0,
            inset   = false,
            color   = false;

        if (expression.hasNext()) {

            if (isAny(expression, "inset")){
                inset = true;
            }

            if (isAny(expression, "<color>")) {
                color = true;
            }

            while (isAny(expression, "<length>") && count < 4) {
                count++;
            }


            if (expression.hasNext()) {
                if (!color) {
                    isAny(expression, "<color>");
                }

                if (!inset) {
                    isAny(expression, "inset");
                }

            }

            result = (count >= 2 && count <= 4);

        }

        return result;
    },

    "<x-one-radius>": function(expression) {
        //[ <length> | <percentage> ] [ <length> | <percentage> ]?
        var result  = false,
            simple = "<length> | <percentage> | inherit";

        if (isAny(expression, simple)){
            result = true;
            isAny(expression, simple);
        }

        return result;
    },

    "<flex>": function(expression) {
        // http://www.w3.org/TR/2014/WD-css-flexbox-1-20140325/#flex-property
        // none | [ <flex-grow> <flex-shrink>? || <flex-basis> ]
        // Valid syntaxes, according to https://developer.mozilla.org/en-US/docs/Web/CSS/flex#Syntax
        // * none
        // * <flex-grow>
        // * <flex-basis>
        // * <flex-grow> <flex-basis>
        // * <flex-grow> <flex-shrink>
        // * <flex-grow> <flex-shrink> <flex-basis>
        // * inherit
        var part,
            result = false;
        if (isAny(expression, "none | inherit")) {
            result = true;
        } else {
            if (isType(expression, "<flex-grow>")) {
                if (expression.peek()) {
                    if (isType(expression, "<flex-shrink>")) {
                        if (expression.peek()) {
                            result = isType(expression, "<flex-basis>");
                        } else {
                            result = true;
                        }
                    } else if (isType(expression, "<flex-basis>")) {
                        result = expression.peek() === null;
                    }
                } else {
                    result = true;
                }
            } else if (isType(expression, "<flex-basis>")) {
                result = true;
            }
        }

        if (!result) {
            // Generate a more verbose error than "Expected <flex>..."
            part = expression.peek();
            throw new ValidationError("Expected (none | [ <flex-grow> <flex-shrink>? || <flex-basis> ]) but found '" + expression.value.text + "'.", part.line, part.col);
        }

        return result;
    }
};

export const complex = Object.create(null, Object.getOwnPropertyDescriptors(complexValues));
