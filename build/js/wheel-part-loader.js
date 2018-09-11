/* globals wheel */
(() => {
  'use strict';

  if (!WebAssembly.instantiateStreaming) {
    WebAssembly.instantiateStreaming = async (response, imports) => {
      const source = await (await response).arrayBuffer();
      return await WebAssembly.instantiate(source, imports);
    };
  }

  const utf8ToString = (heap, offset) => {
    let s = '';
    for (let i = offset; heap[i]; i++) {
      s += String.fromCharCode(heap[i]);
    }
    return s;
  };

  const defaultReadStringFromMemory = (exports, heap) => utf8ToString(heap, exports.name());

  const instantiateWasmFile = async (wasmFileName, importObject) => {
    try {
      const { instance } = await WebAssembly.instantiateStreaming(fetch(`wasm/${wasmFileName}`), importObject);
      return instance;
    } catch (err) {
      console.error(`Error instantiating ${wasmFileName}. ${err}`);
    }
  };

  const createImportObject = (memory, customImportObject) => {
    return Object.assign(customImportObject, {
      env: Object.assign(customImportObject.env || {}, {
        memory,

        // Some languages (like Rust) do not support random number generation easily,
        // so we allow them to reuse JavaScript's API
        random: () => Math.random()
      })
    });
  };

  const defaultWasmLoader = async (wasmFileName, readStringFromMemory, importObject = {}) => {
    const memory = new WebAssembly.Memory({ initial: 2, maximum: 10 });
    const wasmInstance = await instantiateWasmFile(
      wasmFileName,
      createImportObject(memory, importObject));

    const heap = new Uint8Array((wasmInstance.exports.memory || memory).buffer);
    const wheelPart = readStringFromMemory(wasmInstance.exports, heap);

    const event = new CustomEvent('wheelPartLoaded', {
      detail: {
        name: wheelPart,
        feelingLucky: () => Promise.resolve(wasmInstance.exports.feelingLucky())
      }
    });
    document.dispatchEvent(event);
  };
  wheel.defaultWasmLoader = defaultWasmLoader;

  const loadWheelPartWithCustomLoader = (wasmFileName, loaderVersion) => {
    const qs = loaderVersion ? `?v=${loaderVersion}` : '';

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      document.body.appendChild(script);
      script.onload = resolve;
      script.onerror = reject;
      script.async = true;
      script.src = `wasm/${wasmFileName}-loader.js${qs}`;
    });
  };

  const loadWheelParts = async () => {
    const wheelPartsResponse = await fetch(`wheel-parts.json?v=${new Date().getTime()}`);
    const wheelPartsJsonResponse = await wheelPartsResponse.json();

    wheelPartsJsonResponse.wheelParts.forEach(wheelPart => {
      if (wheelPart.loader) {
        const loaderVersion = wheelPart.loader.version;
        loadWheelPartWithCustomLoader(wheelPart.fileName, loaderVersion);
      } else {
        const readStringFromMemory = wheelPart.name ?
          () => wheelPart.name :
          defaultReadStringFromMemory;

        defaultWasmLoader(wheelPart.fileName, readStringFromMemory);
      }
    });
  };

  loadWheelParts();
})();