export function createForloop(index0, length, parentloop) {
    if (index0 < 0) {
        throw new Error('Invalid forloop index: index cannot be negative');
    }
    if (index0 >= length) {
        throw new Error('Invalid forloop index: index must be less than length');
    }
    if (length <= 0) {
        throw new Error('Invalid forloop length: length must be greater than 0');
    }
    return {
        index: index0 + 1,
        index0,
        rindex: length - index0,
        rindex0: length - index0 - 1,
        first: index0 === 0,
        last: index0 === length - 1,
        length,
        parentloop
    };
}
//# sourceMappingURL=forloop.js.map