/* global wheel */
(() => {
  const utf16leToString = (heap, offset) => {
    const buf = heap.buffer;
    const U16 = new Uint16Array(buf);
    const U32 = new Uint32Array(buf);
    const length = U32[(offset - 4) >> 2] >>> 1;
    offset >>>= 1;
    return String.fromCharCode.apply(String, U16.subarray(offset, offset + length));
  };

  const importObject = {
    env: {
      random: Math.random,
      memory: new WebAssembly.Memory({ initial: 1, maximum: 5 })
    },
  };

  wheel.loadWheelPart('wheel-part-assemblyscript.wasm', utf16leToString, importObject);
})();
