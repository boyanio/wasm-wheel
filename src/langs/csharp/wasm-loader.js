(() => {
    const invokeCSFunc = (assemblyName, namespace, className, methodName, stringArg, returnType) =>
        Module.ccall(
            'JSInterop_CallDotNet',
            returnType, ['string', 'string', 'string', 'string', 'string'], [assemblyName, namespace, className, methodName, stringArg]);

    window.Module = {
        wasmBinaryFile: 'wasm/wheel-part-csharp.wasm',
        arguments: ['wheel-part-csharp.dll'],
        preRun: () => {
            FS.createPreloadedFile('/', 'corlib.dll', '/wasm/corlib.dll', true);
            FS.createPreloadedFile('/', 'wheel-part-csharp.dll', '/wasm/wheel-part-csharp.dll', true);
        },
        postRun: () => {
            const event = new CustomEvent('wheelPartLoaded', {
                detail: {
                    name: 'C#',
                    feelingLucky: () => invokeCSFunc('wheel-part-csharp', 'WheelOfWasm', 'Program', 'feelingLucky', null, 'number')
                }
            });
            document.dispatchEvent(event);
        }
    };

    new Promise((resolve, reject) => {
        const script = document.createElement('script');
        document.body.appendChild(script);
        script.onload = resolve;
        script.onerror = reject;
        script.async = true;
        script.src = 'wasm/wheel-part-csharp.js';
    });
})();