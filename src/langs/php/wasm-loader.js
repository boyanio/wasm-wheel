/* global PHP */
(async () => {

  const PhpFileVersion = 2;

  const injectWasmLoader = () => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    document.body.appendChild(script);
    script.onload = resolve;
    script.onerror = reject;
    script.async = true;
    script.src = `wasm/php.js?v=${PhpFileVersion}`;
  });

  const wheelPartSource = await fetch('wasm/wheel-part-php.txt').then(r => r.text());

  const promiseResolvers = {};
  let lastPromiseId = 0;
  let php = null;

  const execPhpCode = code => php.ccall('pib_eval', 'number', ['string'], [code]);

  const phpOpts = {
    locateFile: file => `wasm/${file}`,
    preRun: [
      () => {
        php.asmLibraryArg._putenv('USE_ZEND_ALLOC=0');
      }
    ],
    postRun: [
      () => {
        const event = new CustomEvent('wheelPartLoaded', {
          detail: {
            name: 'PHP',
            feelingLucky: () => {
              const promiseId = lastPromiseId++;

              return new Promise((resolve, reject) => {
                promiseResolvers[promiseId] = resolve;

                const code = `${wheelPartSource}\necho '${promiseId}:'.feelingLucky();\necho PHP_EOL;`;
                const ret = execPhpCode(code);
                if (ret !== 0) {
                  delete promiseResolvers[promiseId];
                  reject(`The PHP eval function returned ${ret}`);
                }
              });
            }
          }
        });
        document.dispatchEvent(event);
      }
    ],
    print: function (text) {
      if (arguments.length > 1) {
        text = Array.prototype.slice.call(arguments).join(' ');
      }

      const [promiseId, result] = text.split(':').map(part => parseInt(part, 10));
      promiseResolvers[promiseId](result);
      delete promiseResolvers[promiseId];
    }
  };

  await injectWasmLoader();
  php = PHP(phpOpts);
})();