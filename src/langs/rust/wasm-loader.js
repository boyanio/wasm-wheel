import wasmFile from './output/wheel-part-rust.wasm?wasm';
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
    random: Math.random,
  },
};

loadWheelPart(wasmFile, utf8ToString, importObject);
