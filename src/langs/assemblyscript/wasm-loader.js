/* global wheel */
(() => {
  const utf16leToString = (heap, offset) => {
    const U16 = new Uint16Array(heap);
    const U32 = new Uint32Array(heap);
    const length = U32[offset - 4];
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
