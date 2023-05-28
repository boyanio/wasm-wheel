/* globals wheel */
(() => {
  'use strict';

  if (!WebAssembly.instantiateStreaming) {
    WebAssembly.instantiateStreaming = async (response, imports) => {
      const source = await (await response).arrayBuffer();
      return await WebAssembly.instantiate(source, imports);
    };
  }

  let resolveFilePath = (file) => `wasm/${file}`;

  const instantiateWasmFile = async (wasmFile, importObject) => {
    try {
      const { instance } = await WebAssembly.instantiateStreaming(
        fetch(wasmFile),
        importObject
      );
      return instance;
    } catch (err) {
      console.error(`Error instantiating ${wasmFile}. ${err}`);
    }
  };

  const dispatchWheelPartLoadedEvent = (name, feelingLuckyPromiseFunc) => {
    const event = new CustomEvent('wheelPartLoaded', {
      detail: {
        name: name,
        feelingLucky: feelingLuckyPromiseFunc,
      },
    });
    document.dispatchEvent(event);
  };

  const loadWheelPart = async (
    wasmFileName,
    readStringFromMemory,
    importObject = {},
    exportedNames = { name: 'name', feelingLucky: 'feelingLucky' },
    onWasmInstantiaated
  ) => {
    const wasmFile = resolveFilePath(wasmFileName);
    const wasmInstance = await instantiateWasmFile(wasmFile, importObject);

    if (onWasmInstantiaated) {
      onWasmInstantiaated(wasmInstance);
    }

    const memory =
      wasmInstance.exports.memory || (importObject.env || {}).memory;
    if (!memory) {
      throw new Error(
        `${wasmFileName} must either require import of memory (env.memory) er export its own memory`
      );
    }

    const heap = new Uint8Array(memory.buffer);
    const namePtr = wasmInstance.exports[exportedNames.name]();
    const wheelPartName = readStringFromMemory(heap, namePtr);

    dispatchWheelPartLoadedEvent(wheelPartName, () =>
      Promise.resolve(wasmInstance.exports[exportedNames.feelingLucky]())
    );
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

  const init = async () => {
    const { fileHashMap } = await fetch(
      `wasm/metadata.json?v=${new Date().getTime()}`
    ).then((x) => x.json());

    resolveFilePath = (file) => `wasm/${file}?v=${fileHashMap[file]}`;
    wheel.resolveFilePath = resolveFilePath;

    Object.keys(fileHashMap)
      .filter((file) => file.endsWith('wasm-loader.js'))
      .forEach((file) =>
        setupWheelPartLoader(`wasm/${file}?v=${fileHashMap[file]}`)
      );
  };

  wheel.dispatchWheelPartLoadedEvent = dispatchWheelPartLoadedEvent;
  wheel.loadWheelPart = loadWheelPart;

  init();
})();
