(function() {
    "use strict";

    const utf8ToString = (heap, pointer) => {
        let s = '';
        for (let i = pointer; heap[i]; i++) {
            s += String.fromCharCode(heap[i]);
        }
        return s;
    };

    const wheelParts = [];

    fetch(`wheel-parts.json?v=${new Date().getTime()}`)
        .then(response => response.json())
        .then(data => {
            const wasmPromises = data.wasmFiles.map(wasmFile =>
                fetch(`wasm/${wasmFile}`)
                .then(response => response.arrayBuffer())
                .then(bytes => {
                    const memory = new WebAssembly.Memory({ initial: 10, maximum: 100 });
                    const hello = pointer => {
                        const heap = new Uint8Array(memory.buffer);
                        wheelParts.push(utf8ToString(heap, pointer));
                    };
                    return WebAssembly.instantiate(bytes, { env: { memory, hello } });
                }));

            Promise.all(wasmPromises)
                .then(wasmPairs => {
                    wheel.setWords(wheelParts);
                    wheel.drawWheel();
                });
        });
}());