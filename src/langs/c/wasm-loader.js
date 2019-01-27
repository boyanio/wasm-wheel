/* globals wheel */
(() => {
  const WasmFileVersion = 2;

  const utf8ToString = (heap, offset) => {
    let s = '';
    for (let i = offset; heap[i]; i++) {
      s += String.fromCharCode(heap[i]);
    }
    return s;
  };

  const importObject = {
    env: {
      __memory_base: 0,
      memory: new WebAssembly.Memory({ initial: 256 }),
      _random: Math.random
    }
  };

  wheel.loadWheelPart(
    `wheel-part-c.wasm?v=${WasmFileVersion}`,
    utf8ToString,
    importObject,
    { name: '_name', feelingLucky: '_feelingLucky' });
})();