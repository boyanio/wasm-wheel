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

export const dispatchWheelPartLoadedEvent = (name, feelingLuckyPromiseFunc) => {
  const event = new CustomEvent('wheelPartLoaded', {
    detail: {
      name: name,
      feelingLucky: feelingLuckyPromiseFunc,
    },
  });
  document.dispatchEvent(event);
};

export const loadWheelPart = async (
  wasmFile,
  readStringFromMemory,
  importObject = {},
  exportedNames = { name: 'name', feelingLucky: 'feelingLucky' },
  onWasmInstantiated
) => {
  const wasmInstance = await instantiateWasmFile(wasmFile, importObject);

  if (onWasmInstantiated) {
    onWasmInstantiated(wasmInstance);
  }

  const memory = wasmInstance.exports.memory || (importObject.env || {}).memory;
  if (!memory) {
    throw new Error(
      `${wasmFile} must either require import of memory (env.memory) er export its own memory`
    );
  }

  const heap = new Uint8Array(memory.buffer);
  const namePtr = wasmInstance.exports[exportedNames.name]();
  const wheelPartName = readStringFromMemory(heap, namePtr);

  dispatchWheelPartLoadedEvent(wheelPartName, () =>
    Promise.resolve(wasmInstance.exports[exportedNames.feelingLucky]())
  );
};
