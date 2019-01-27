/* global DotNetAnywhere, wheel */
(async () => {

  const injectWasmLoader = () => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    document.body.appendChild(script);
    script.onload = resolve;
    script.onerror = reject;
    script.async = true;
    script.src = 'wasm/dna.js';
  });

  let dna = null;

  const invokeCsharpFunc = (assemblyName, namespace, className, methodName, stringArg, returnType) =>
    dna.ccall(
      'JSInterop_CallDotNet',
      returnType, ['string', 'string', 'string', 'string', 'string'], [assemblyName, namespace, className, methodName, stringArg]);

  const dnaOps = {
    locateFile: file => `wasm/${file}`,
    arguments: ['wheel-part-csharp.dll'],
    preRun: () => {
      dna.FS_createPreloadedFile('/', 'corlib.dll', 'wasm/corlib.dll', true);
      dna.FS_createPreloadedFile('/', 'wheel-part-csharp.dll', 'wasm/wheel-part-csharp.dll', true);
    },
    postRun: () => {
      const feelingLuckyPromiseFunc =
        () => Promise.resolve(invokeCsharpFunc('wheel-part-csharp', 'WheelOfWasm', 'Program', 'feelingLucky', null, 'number'));
      wheel.dispatchWheelPartLoadedEvent('C#', feelingLuckyPromiseFunc);
    }
  };

  await injectWasmLoader();
  dna = DotNetAnywhere(dnaOps);
})();