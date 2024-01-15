import wasmFile from './output/wheel-part-java.wasm?wasm';
import { loadWheelPart } from '../../app/wheel-part-loader';

const getInt = (heap, offset) => {
  return (
    heap[offset + 0] |
    (heap[offset + 1] << 8) |
    (heap[offset + 2] << 16) |
    (heap[offset + 3] << 24)
  );
};

const javaToJavaScriptString = (heap, offset) => {
  // Implementation based on https://stackoverflow.com/questions/31206851/how-much-memory-does-a-string-use-in-java-8 and heap dump analysis
  const charArrayOffset = getInt(heap, offset + 8);
  const charArrayLength = getInt(heap, charArrayOffset + 8);

  return String.fromCharCode.apply(
    String,
    new Uint16Array(heap.buffer, charArrayOffset + 12, charArrayLength)
  );
};

const importObject = {
  teavm: {
    logString: (what) => {
      console.log('Java: logStringInt', what);
    },
    logInt: (what) => {
      console.log('Java: logInt', what);
    },
    logOutOfMemory: (what) => {
      console.log('Java: logOutOfMemory', what);
    },
  },
  teavmMath: Math,
};

loadWheelPart(wasmFile, javaToJavaScriptString, importObject);
