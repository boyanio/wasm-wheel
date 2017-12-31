// This file is adopted from the original JavaScript loader,
// which the Kotlin Native compiler generates
(() => {
    "use strict";

    const globalArguments = [];
    const globalBase = 0; // TODO: Is there any way to obtain global_base from JavaScript?
    var heap;
    var memory;
    var konanStackTop;

    const utf8encode = s => unescape(encodeURIComponent(s));

    const utf8decode = s => decodeURIComponent(escape(s));

    const fromString = (string, pointer) => {
        for (let i = 0; i < string.length; i++) {
            heap[pointer + i] = string.charCodeAt(i);
        }
        heap[pointer + string.length] = 0;
    };

    const toString = (pointer) => {
        let string = '';
        for (let i = pointer; heap[i] != 0; i++) {
            string += String.fromCharCode(heap[i]);
        }
        return string;
    };

    const toUTF16String = (pointer, size) => {
        let string = '';
        for (let i = pointer; i < pointer + size; i += 2) {
            string += String.fromCharCode(heap[i] + heap[i + 1] * 256);
        }
        return string;
    };

    const int32ToHeap = (value, pointer) => {
        heap[pointer] = value & 0xff;
        heap[pointer + 1] = (value & 0xff00) >>> 8;
        heap[pointer + 2] = (value & 0xff0000) >>> 16;
        heap[pointer + 3] = (value & 0xff000000) >>> 24;
    };

    const getInt = (offset) => {
        return heap[offset] |
            heap[offset + 1] << 8 |
            heap[offset + 2] << 16 |
            heap[offset + 3] << 24;
    };

    const getUshort = (offset) => {
        return heap[offset] |
            heap[offset + 1] << 8;
    };

    const stackTop = () => {
        // Read the value module's `__stack_pointer` is initialized with.
        // It is the very first static in .data section.
        const addr = (globalBase == 0 ? 4 : globalBase);
        const fourBytes = heap.buffer.slice(addr, addr + 4);
        return new Uint32Array(fourBytes)[0];
    }

    const konan_dependencies = {
        env: {
            abort: () => {
                throw new Error("abort()");
            },
            // TODO: Account for file and size.
            fgets: (str, size, file) => {
                // TODO: readline can't read lines without a newline.
                // Browsers cant read from console at all.
                fromString(utf8encode(readline() + '\n'), str);
                return str;
            },
            Konan_heap_upper: () => memory.buffer.byteLength,
            Konan_heap_lower: () => konanStackTop,
            Konan_heap_grow: (pages) => {
                // The buffer is allocated anew on calls to grow(),
                // so renew the heap array.
                const oldLength = memory.grow(pages);
                heap = new Uint8Array(konan_dependencies.env.memory.buffer);
                return oldLength;
            },
            Konan_abort: (pointer) => {
                throw new Error("Konan_abort(" + utf8decode(toString(pointer)) + ")");
            },
            Konan_exit: (status) => {
                throw new Error('Not implemented');
            },
            Konan_js_arg_size: (index) => {
                if (index >= globalArguments.length)
                    return -1;

                return globalArguments[index].length + 1; // + 1 for trailing zero.
            },
            Konan_js_fetch_arg: function (index, ptr) {
                const arg = utf8encode(globalArguments[index]);
                fromString(arg, ptr);
            },
            Konan_date_now: function (pointer) {
                const now = Date.now();
                const high = Math.floor(now / 0xffffffff);
                const low = Math.floor(now % 0xffffffff);
                int32ToHeap(low, pointer);
                int32ToHeap(high, pointer + 4);
            },
            stdin: 0, // This is for fgets(,,stdin) to resolve. It is ignored.
            // TODO: Account for fd and size.
            write: (fd, str, size) => {
                throw new Error('Not implemented');
            },
            memory: new WebAssembly.Memory({ initial: 256, maximum: 16384 }),
            Konan_js_rand: (from, to) => Math.floor(Math.random() * (to - from)) + from
        }
    };

    const getName = (instance) => {
        const ptr = instance.exports["'kfun:name$$Reference'"]();
        const size = getInt(ptr + 8);
        return toUTF16String(ptr + 8 + 4, size * 2);
    };

    const invokeModule = (instance) => {

        memory = konan_dependencies.env.memory;
        heap = new Uint8Array(konan_dependencies.env.memory.buffer);
        konanStackTop = stackTop();

        const event = new CustomEvent('wheelPartLoaded', {
            detail: {
                name: getName(instance),
                feelingLucky: () => instance.exports["'kfun:feelingLucky$$ValueType'"]()
            }
        });
        document.dispatchEvent(event);
    };

    const setupWasmModule = wasmModule => {
        wasmModule.env = {};
        wasmModule.env.memoryBase = 0;
        wasmModule.env.tablebase = 0;
    };

    const filename = 'wasm/wheel-part-kotlin.wasm';
    fetch(filename)
        .then(response => response.arrayBuffer())
        .then(bytes => WebAssembly.compile(bytes))
        .then(wasmModule => {
            setupWasmModule(wasmModule);
            return WebAssembly.instantiate(wasmModule, konan_dependencies);
        }).then(instance => {
            invokeModule(instance);
        }).catch(err => {
            console.log(err);
        });
})();