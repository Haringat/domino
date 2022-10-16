export default class NodeList extends Array {

    constructor(a) {
        super(a?.length ?? 0);
        if (a) {
            for (const idx in a) {
                this[idx] = a[idx];
            }
        }
    }

    item(i) {
        return this[i] || null;
    }

}
