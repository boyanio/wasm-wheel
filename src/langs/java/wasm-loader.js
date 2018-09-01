(() => {
    const getInt = (heap, offset) => {
        return heap[offset + 0] |
            heap[offset + 1] << 8 |
            heap[offset + 2] << 16 |
            heap[offset + 3] << 24;
    };

    const javaToJsString = (heap, offset) => {
        // Implementation based on https://stackoverflow.com/questions/31206851/how-much-memory-does-a-string-use-in-java-8 and heap dump analysis
        charArrayOffset = getInt(heap, offset + 8);
        charArrayLength = getInt(heap, charArrayOffset + 8);

        return String.fromCharCode.apply(String, new Uint16Array(heap.buffer, charArrayOffset + 12, charArrayLength));
    };

    const readStringFromMemory = (exports, heap) => javaToJsString(heap, exports.name());
    wheel.defaultWasmLoader('wheel-part-java.wasm', readStringFromMemory, { teavmMath: Math });
})();