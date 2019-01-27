/* globals WebAssembly, wheel */
(() => {
  'use strict';

  if (!WebAssembly.instantiateStreaming) {
    WebAssembly.instantiateStreaming = async (response, imports) => {
      const source = await (await response).arrayBuffer();
      return await WebAssembly.instantiate(source, imports);
    };
  }

  const instantiateWasmFile = async (wasmFileName, importObject) => {
    try {
      const { instance } = await WebAssembly.instantiateStreaming(fetch(`wasm/${wasmFileName}`), importObject);
      
      // https://github.com/WebAssembly/tool-conventions/blob/master/DynamicLinking.md
      const postInstantiate = instance.exports['__post_instantiate'];
      if (postInstantiate) {
        postInstantiate();
      }

      return instance;
    } catch (err) {
      console.error(`Error instantiating ${wasmFileName}. ${err}`);
    }
  };

  const dispatchWheelPartLoadedEvent = (name, feelingLuckyPromiseFunc) => {
    const event = new CustomEvent('wheelPartLoaded', {
      detail: {
        name: name,
        feelingLucky: feelingLuckyPromiseFunc
      }
    });
    document.dispatchEvent(event);
  };

  const loadWheelPart = async (
    wasmFileName,
    readStringFromMemory,
    importObject = {},
    exportedNames = { name: 'name', feelingLucky: 'feelingLucky' }) => {
    
    const importObjectEnv = importObject.env || (importObject.env = {});
    const memory = importObjectEnv.memory || (importObjectEnv.memory = new WebAssembly.Memory({ initial: 2, maximum: 10 }));
    const wasmInstance = await instantiateWasmFile(wasmFileName, importObject);

    const heap = new Uint8Array((wasmInstance.exports.memory || memory).buffer);
    const namePtr = wasmInstance.exports[exportedNames.name]();
    const wheelPartName = readStringFromMemory(heap, namePtr);

    dispatchWheelPartLoadedEvent(
      wheelPartName,
      () => Promise.resolve(wasmInstance.exports[exportedNames.feelingLucky]()));
  };

  const setupWheelPartLoader = (loader) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      document.body.appendChild(script);
      script.onload = resolve;
      script.onerror = reject;
      script.async = true;
      script.src = loader;
    });
  };

  const loadWheelParts = async () => {
    const wheelParts = await fetch(`wheel-parts.json?v=${new Date().getTime()}`).then(r => r.json());
    wheelParts.loaders.forEach(loader => {
      setupWheelPartLoader(loader);
    });
  };

  wheel.dispatchWheelPartLoadedEvent = dispatchWheelPartLoadedEvent;
  wheel.loadWheelPart = loadWheelPart;

  loadWheelParts();
})();