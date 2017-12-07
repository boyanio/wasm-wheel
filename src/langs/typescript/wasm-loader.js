(() => {
    const typeScriptWasmLoader = wasmFile =>
        fetch(`wasm/${wasmFile}`)
        .then(response => response.arrayBuffer())
        .then(bytes => WebAssembly.compile(bytes))
        .then(wasmModule => {
            const memory = new WebAssembly.Memory({ initial: 2, maximum: 10 });
            return WebAssembly.instantiate(wasmModule, { env: { memory }, Math })
                .then(instance => ({ exports: instance.exports }));
        })
        .then(({ exports }) => {
            const event = new CustomEvent('wheelPartLoaded', {
                detail: {
                    name: "TypeScript",
                    feelingLucky: () => exports.feelingLucky()
                }
            });
            document.dispatchEvent(event);
        });

    typeScriptWasmLoader('wheel-part-typescript.wasm');
})();