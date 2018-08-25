if (!WebAssembly.instantiateStreaming) {
    WebAssembly.instantiateStreaming = async (response, imports) => {
        const source = await (await response).arrayBuffer();
        return await WebAssembly.instantiate(source, imports);
    };
}

(() => {
    "use strict";

    const wheelParts = [];
    document.addEventListener('wheelPartLoaded', async (e) => {
        // Check if the wheel part can genrate a random number
        const wheelPart = e.detail;
        const randomNumber = await wheelPart.feelingLucky();
        if (randomNumber > 0 && randomNumber <= 100) {
            wheelParts.push(wheelPart);

            wheel.setWheelParts(wheelParts);
            wheel.drawWheel();
        }
        else {
            throw 'The wheel part ' + wheelPart.name + ' cannot generate random numbers between [1, 100]';
        }
    }, false);

    const utf8ToString = (heap, offset) => {
        let s = '';
        for (let i = offset; heap[i]; i++) {
            s += String.fromCharCode(heap[i]);
        }
        return s;
    };

    const defaultReadStringFromMemory = (exports, heap) => utf8ToString(heap, exports.name());

    const defaultWasmLoader = async (wasmFile, readStringFromMemory, importObject = {}) => {
        // For the WebAssembly MVP, there is only one memory for all modules, however
        // in the future, each module would probably get its own memory
        const memory = new WebAssembly.Memory({ initial: 2, maximum: 10 });
        const { mod, instance } = await WebAssembly.instantiateStreaming(fetch(`wasm/${wasmFile}`), Object.assign({
            env: {
                memory,
                // Some languages do not support random number generation easily,
                // so we allow them to reuse JavaScript's API
                random: () => Math.random()
            }
        }, importObject));

        const heap = new Uint8Array((instance.exports.memory || memory).buffer);
        const wheelPart = readStringFromMemory(instance.exports, heap);

        const event = new CustomEvent('wheelPartLoaded', {
            detail: {
                name: wheelPart,
                feelingLucky: () => Promise.resolve(instance.exports.feelingLucky())
            }
        });
        document.dispatchEvent(event);
    };
    wheel.defaultWasmLoader = defaultWasmLoader;

    (async () => {
        const response = await fetch(`wheel-parts.json?v=${new Date().getTime()}`);
        const data = await response.json();
        data.wasmFiles.map(wasm => {
            if (wasm.loader) {
                const loaderVersion = wasm.loader.version;
                const qs = loaderVersion ? `?v=${loaderVersion}` : '';

                new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    document.body.appendChild(script);
                    script.onload = resolve;
                    script.onerror = reject;
                    script.async = true;
                    script.src = `wasm/${wasm.file}-loader.js${qs}`;
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
    })();

    wheel.onSpinning(() => {
        wheel.setCenterText(null);
        wheel.drawCenterCircleText();
    });

    wheel.onSpinned(async () => {
        const currentWheelPart = wheel.getCurrentWheelPart();
        wheel.setCenterText(await currentWheelPart.feelingLucky(), currentWheelPart.bgColor);
        wheel.drawCenterCircleText();
    });

    document.getElementById('spinBtn').addEventListener('click', () => {
        wheel.spin(Math.random());
    }, false);
})();