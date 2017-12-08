(function() {
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

    const defaultWasmLoader = (wasmFile, name) =>
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
            let wheelPart = name;
            if (!wheelPart) {
                const offset = exports.name();
                const heap = new Uint8Array(memory.buffer);
                wheelPart = utf8ToString(heap, offset);
            }

            const event = new CustomEvent('wheelPartLoaded', {
                detail: {
                    name: wheelPart,
                    feelingLucky: () => exports.feelingLucky()
                }
            });
            document.dispatchEvent(event);
        });

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
                    defaultWasmLoader(wasm.file, wasm.name);
                }
            });
        });

    wheel.onSpinned(() => {
        const currentWheelPart = wheel.getCurrentWheelPart();
        alert(`You got ${currentWheelPart.feelingLucky()} from ${currentWheelPart.name}`);
    });
}());