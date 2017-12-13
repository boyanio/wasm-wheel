(() => {
    const getInt = (heap, offset) => {
        return heap[offset] |
            heap[offset + 1] << 8 |
            heap[offset + 2] << 16 |
            heap[offset + 3] << 24;
    };

    const getUshort = (heap, offset) => {
        return heap[offset] |
            heap[offset + 1] << 8;
    };

    const utf16leToString = (heap, offset) => {
        const length = getInt(heap, offset);
        const chars = new Array(length);
        for (let i = 0; i < length; i++) {
            chars[i] = getUshort(heap, offset + 8 + (i * 2));
        }
        return String.fromCharCode.apply(String, chars);
    };

    const readStringFromMemory = (exports, heap) => utf16leToString(heap, exports.name());
    wheel.defaultWasmLoader('wheel-part-assemblyscript.wasm', readStringFromMemory)
})();