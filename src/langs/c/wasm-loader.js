/* globals wheel */
(() => {
  const utf8ToString = (heap, offset) => {
    let s = '';
    for (let i = offset; heap[i]; i++) {
      s += String.fromCharCode(heap[i]);
    }
    return s;
  };

  const importObject = {
    env: {
      jsrandom: Math.random,
    },
  };

  const onWasmInstantiaated = (instance) => instance.exports._start();

  wheel.loadWheelPart(
    'wheel-part-c.wasm',
    utf8ToString,
    importObject,
    { name: 'name', feelingLucky: 'feelingLucky' },
    onWasmInstantiaated
  );
})();
