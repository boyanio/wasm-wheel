(function () {
    "use strict";

    const wheelParts = [];
    document.addEventListener('wheelPartLoaded', e => {
        wheelParts.push(e.detail);

        wheel.setWheelParts(wheelParts);
        wheel.drawWheel();
    }, false);

    const utf8ToString = (heap, offset) => {
        let s = '';
        for (let i = offset; heap[i]; i++) {
            s += String.fromCharCode(heap[i]);
        }
        return s;
    };

    const defaultReadStringFromMemory = (exports, heap) => utf8ToString(heap, exports.name());

    const defaultWasmLoader = (wasmFile, readStringFromMemory) =>
        fetch(`wasm/${wasmFile}`)
            .then(response => response.arrayBuffer())
            .then(bytes => WebAssembly.compile(bytes))
            .then(wasmModule => {
                // For the MVP, there is only one memory for all modules, however
                // in the future, each module would probably get its own memory    
                const memory = new WebAssembly.Memory({ initial: 2, maximum: 10 });
                return WebAssembly.instantiate(wasmModule, {
                    env: {
                        memory,
                        // Some languages do not support random number generation easily,
                        // so we allow them to reuse JavaScript's API
                        random: () => Math.random()
                    }
                })
                    .then(instance => ({ exports: instance.exports, memory }));
            })
            .then(({ exports, memory }) => {
                const heap = new Uint8Array((exports.memory || memory).buffer);
                const wheelPart = readStringFromMemory(exports, heap);

                const event = new CustomEvent('wheelPartLoaded', {
                    detail: {
                        name: wheelPart,
                        feelingLucky: () => exports.feelingLucky()
                    }
                });
                document.dispatchEvent(event);
            });
    wheel.defaultWasmLoader = defaultWasmLoader;

    fetch(`wheel-parts.json?v=${new Date().getTime()}`)
        .then(response => response.json())
        .then(data => {
            data.wasmFiles.map(wasm => {
                if (wasm.loader) {
                    new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        document.body.appendChild(script);
                        script.onload = resolve;
                        script.onerror = reject;
                        script.async = true;
                        script.src = `wasm/${wasm.file}-loader.js`;
                    });
                } else {
                    const readStringFromMemory = (exports, heap) => {
                        if (wasm.name) {
                            return wasm.name;
                        }
                        return defaultReadStringFromMemory(exports, heap);
                    };
                    defaultWasmLoader(wasm.file, readStringFromMemory);
                }
            });
        });

    wheel.onSpinned(() => {
        const currentWheelPart = wheel.getCurrentWheelPart();
        wheel.setCenterText(currentWheelPart.feelingLucky());
        wheel.drawCenterCircleText();
    });

    document.getElementById('spinBtn').addEventListener('click', () => {
        wheel.spin(Math.random());
    }, false);
}());