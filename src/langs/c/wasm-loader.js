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
      memoryBase: 0,
      memory: new WebAssembly.Memory({ initial: 256 }),
      tableBase: 0,
      table: new WebAssembly.Table({ initial: 4, element: 'anyfunc' }),
      abort: () => { },
      _random: Math.random
    }
  };

  wheel.loadWheelPart(
    `wheel-part-c.wasm?v=${WasmFileVersion}`,
    utf8ToString,
    importObject,
    { name: '_name', feelingLucky: '_feelingLucky' });
})();