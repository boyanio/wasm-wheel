/* globals wheel */
(() => {
  const WasmFileVersion = 1;

  const utf8ToString = (heap, offset) => {
    let s = '';
    for (let i = offset; heap[i]; i++) {
      s += String.fromCharCode(heap[i]);
    }
    return s;
  };

  const importObject = {
    env: {
      random: Math.random
    }
  };

  wheel.loadWheelPart(
    `wheel-part-rust.wasm?v=${WasmFileVersion}`,
    utf8ToString,
    importObject);
})();