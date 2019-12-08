/* global wheel */
(() => {
  const getInt = (heap, offset) => {
    return (
      heap[offset + 0] <<  0 |
      heap[offset + 1] <<  8 |
      heap[offset + 2] << 16 |
      heap[offset + 3] << 24
    );
  };

  const getUshort = (heap, offset) => {
    return heap[offset] | heap[offset + 1] << 8;
  };

  const utf16leToString = (heap, offset) => {
    const length = getInt(heap, offset);
    const chars = new Array(length);
    for (let i = 0; i < length; i++) {
      chars[i] = getUshort(heap, offset + (i << 1) + 4);
    }
    return String.fromCharCode.apply(String, chars);
  };

  const importObject = {
    env: {
      abort: () => {},
      random: Math.random
    },
  };

  wheel.loadWheelPart('wheel-part-assemblyscript.wasm', utf16leToString, importObject);
})();
