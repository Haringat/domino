import {assert} from "./utils.mjs";

function checkListCircular(start) {
    let current = start._nextSibling;
    while (current !== start) {
        assert(current, "circular list ended");
        current = current._nextSibling;
    }
}

/**
 * remove single node a from its list
 */
export function remove(a) {
    assert(valid(a));
    const prev = a._previousSibling;
    if (prev === a) {
        return;
    }
    const next = a._nextSibling;
    prev._nextSibling = next;
    next._previousSibling = prev;
    a._previousSibling = a._nextSibling = a;
    assert(valid(a));
}

/**
 * replace a single node a with a list b (which could be null)
 */
export function replace(a, b) {
    assert(valid(a) && (b === null || valid(b)));
    if (b !== null) {
        insertBefore(b, a);
    }
    remove(a);
    assert(valid(a) && (b === null || valid(b)));
}

/**
 * insert a before b
 */
export function insertBefore(a, b) {
    assert(valid(a) && valid(b));
    const a_first = a;
    const a_last = a._previousSibling;
    const b_first = b;
    const b_last = b._previousSibling;
    a_first._previousSibling = b_last;
    a_last._nextSibling = b_first;
    b_last._nextSibling = a_first;
    b_first._previousSibling = a_last;
    assert(valid(a) && valid(b));
}

/**
 * basic validity tests on a circular linked list a
 */
export function valid(a) {
    assert(a, "list falsy");
    assert(a._previousSibling, "previous falsy");
    assert(a._nextSibling, "next falsy");
    checkListCircular(a);
    return true;
}
