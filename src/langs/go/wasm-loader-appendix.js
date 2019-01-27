/* globals Go, wheel */
(async () => {
  const WasmFileVersion = 2;

  const go = new Go();
  const result = await WebAssembly.instantiateStreaming(fetch(`wasm/wheel-part-go.wasm?v=${WasmFileVersion}`), go.importObject);

  window.initGoCallbacks = async (getName, getFeelingLucky) => {
    const getNamePromise = () => new Promise(resolve => {
      getName({ result: n => { resolve(n); } });
    });

    const getFeelingLuckyPromise = () => new Promise(resolve => {
      getFeelingLucky({ result: n => { resolve(n); } });
    });

    const wheelPartName = await getNamePromise();
    const feelingLuckyPromiseFunc = () => getFeelingLuckyPromise();
    wheel.dispatchWheelPartLoadedEvent(wheelPartName, feelingLuckyPromiseFunc);

    delete window.initGoCallbacks;
  };

  await go.run(result.instance);
})();