(async () => {
  const go = new Go();
  const response = await fetch('wasm/wheel-part-go.wasm');
  const bytes = await response.arrayBuffer();
  const result = await WebAssembly.instantiate(bytes, go.importObject);

  window.initGoCallbacks = async (getName, getFeelingLucky) => {
    const getNamePromise = () => new Promise((resolve, reject) => {
      getName({
        result: (n) => { resolve(n); }
      });
    });

    const getFeelingLuckyPromise = () => new Promise((resolve, reject) => {
      getFeelingLucky({
        result: (n) => { resolve(n); }
      });
    });

    const event = new CustomEvent('wheelPartLoaded', {
      detail: {
        name: await getNamePromise(),
        feelingLucky: () => getFeelingLuckyPromise()
      }
    });
    document.dispatchEvent(event);

    delete window.initGoCallbacks;
  };

  await go.run(result.instance);
})();