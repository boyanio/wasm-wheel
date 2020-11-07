/* globals languagePluginLoader, wheel, pyodide */
(async () => {
  const injectWasmLoader = () =>
    new Promise((resolve, reject) => {
      const script = document.createElement('script');
      document.body.appendChild(script);
      script.onload = resolve;
      script.onerror = reject;
      script.async = true;
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.15.0/full/pyodide.js';
    });

  await injectWasmLoader();
  await languagePluginLoader;

  const pythonFileScript = wheel.resolveFilePath('wheel-part-python.txt');
  const wheelPartSource = await fetch(pythonFileScript).then((r) => r.text());
  await pyodide.runPythonAsync(wheelPartSource);

  wheel.dispatchWheelPartLoadedEvent(
    pyodide.globals.name(),
    pyodide.globals.feelingLucky
  );
})();
