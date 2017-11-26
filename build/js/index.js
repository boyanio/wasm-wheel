(function() {
    "use strict";

    const utf8ToString = (heap, offset) => {
        let s = '';
        for (let i = offset; heap[i]; i++) {
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
                .then(bytes => WebAssembly.compile(bytes))
                .then(wasmModule => {
                    const memory = new WebAssembly.Memory({ initial: 2, maximum: 10 });
                    return WebAssembly.instantiate(wasmModule, { env: { memory, rand: Math.random } });
                })
                .then(instance => {
                    const offset = instance.exports.name();
                    const heap = new Uint8Array(instance.exports.memory.buffer);
                    wheelParts.push(utf8ToString(heap, offset));
                }));

            Promise.all(wasmPromises)
                .then(() => {
                    wheel.setWords(wheelParts);
                    wheel.drawWheel();
                });
        });
}());