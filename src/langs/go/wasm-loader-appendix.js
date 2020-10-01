/* globals Go, wheel */
(async () => {
  const go = new Go();
  const wasmFileName = wheel.resolveFilePath('wheel-part-go.wasm');
  const result = await WebAssembly.instantiateStreaming(
    fetch(wasmFileName),
    go.importObject
  );

  window.initGoCallbacks = async (getName, getFeelingLucky) => {
    const getNamePromise = () =>
      new Promise((resolve) => {
        getName({
          result: (n) => {
            resolve(n);
          },
        });
      });

    const getFeelingLuckyPromise = () =>
      new Promise((resolve) => {
        getFeelingLucky({
          result: (n) => {
            resolve(n);
          },
        });
      });

    const wheelPartName = await getNamePromise();
    const feelingLuckyPromiseFunc = () => getFeelingLuckyPromise();
    wheel.dispatchWheelPartLoadedEvent(wheelPartName, feelingLuckyPromiseFunc);

    delete window.initGoCallbacks;
  };

  await go.run(result.instance);
})();
