import wasmFile from './output/wheel-part-rust.wasm?wasm';
import { dispatchWheelPartLoadedEvent } from '../../app/wheel-part-loader';
import { init, WASI } from '@wasmer/wasi';

const utf8ToString = (heap, offset) => {
  let s = '';
  for (let i = offset; heap[i]; i++) {
    s += String.fromCharCode(heap[i]);
  }
  return s;
};

Promise.all([init(), WebAssembly.compileStreaming(fetch(wasmFile))]).then(
  ([, module]) => {
    const wasi = new WASI({});
    const instance = wasi.instantiate(module, {});

    const heap = new Uint8Array(instance.exports.memory.buffer);
    const namePtr = instance.exports.name();
    const name = utf8ToString(heap, namePtr);
    dispatchWheelPartLoadedEvent(name, instance.exports.feelingLucky);
  },
  (err) => {
    console.error('Error when instantiating Rust runtime', err);
  }
);
