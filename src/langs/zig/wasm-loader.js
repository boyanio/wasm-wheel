import wasmFile from './output/wheel-part-zig.wasm?wasm';
import { loadWheelPart } from '../../app/wheel-part-loader';

const utf8ToString = (heap, offset) => {
  let s = '';
  for (let i = offset; heap[i]; i++) {
    s += String.fromCharCode(heap[i]);
  }
  return s;
};

const importObject = {
  env: {
    seed: () => Math.random() * Number.MAX_SAFE_INTEGER,
  },
};

const onWasmInstantiated = (instance) => instance.exports._start();

loadWheelPart(
  wasmFile,
  utf8ToString,
  importObject,
  { name: 'name', feelingLucky: 'feelingLucky' },
  onWasmInstantiated
);
