const { readFileSync, writeFileSync } = require('fs');

const addTabs = (text) =>
  text.split(/\r?\n/).map(line => `  ${line}`).join('\r\n');

exports.formatWasmLoader = (originalWasmLoaderFilePath, outputWasmLoaderFilePath) => {
  const originalContents = readFileSync(originalWasmLoaderFilePath, { encoding: 'utf-8' });

  let modifiedContents = originalContents;

  // The default behavior to load Kotlin-compiled WASM is to create a <script>
  // and put an attribute wasm indicating the wasm file. We will override this
  // with a simpler version, where it is not necessary to create a <script>
  // element, but rather load the wasm file right away
  modifiedContents = modifiedContents.substring(0, modifiedContents.indexOf('if (!document.currentScript.hasAttribute("wasm")) {')) +
    modifiedContents.substring(modifiedContents.indexOf('var filename = document.currentScript.getAttribute("wasm");'));

  modifiedContents = modifiedContents.replace(
    'var filename = document.currentScript.getAttribute("wasm");',
    'var filename = "wasm/wheel-part-kotlin.wasm?v=3";');

  // Inject a function to emit a event when the wheel part has been loaded
  const invokeModuleFuncIndex = modifiedContents.indexOf('function invokeModule(inst, args)');
  modifiedContents = modifiedContents.substring(0, invokeModuleFuncIndex) +
    `
function emitWheelPartLoadedEvent() {
    var getInt = function(offset) {
        return heap[offset] |
            heap[offset + 1] << 8 |
            heap[offset + 2] << 16 |
            heap[offset + 3] << 24;
    };

    var getName = function() {
        const ptr = instance.exports["'kfun:name$$kotlin.String'"]();
        const size = getInt(ptr + 8);
        return toUTF16String(ptr + 8 + 4, size * 2);
    };

    var event = new CustomEvent('wheelPartLoaded', {
        detail: {
            name: getName(),
            feelingLucky: () => instance.exports["'kfun:feelingLucky$$ValueType'"]()
        }
    });
    document.dispatchEvent(event);
}

` +
    modifiedContents.substring(invokeModuleFuncIndex);

  // Call the function on invokeModule
  const invokeModuleFuncReturnIndex = modifiedContents.indexOf('return exit_status;');
  modifiedContents = modifiedContents.substring(0, invokeModuleFuncReturnIndex) +
    `emitWheelPartLoadedEvent();
    ` +
    modifiedContents.substring(invokeModuleFuncReturnIndex);

  // Register custom wasm imports
  const customImportsIndex = modifiedContents.indexOf('function linkJavaScriptLibraries() {');
  modifiedContents = modifiedContents.substring(0, customImportsIndex) +
    `konan_dependencies.env.Konan_js_rand = function(from, to) { return Math.floor(Math.random() * (to - from)) + from; }

` +
    modifiedContents.substring(customImportsIndex);

  // Surround the whole file with a function scope to prevent messing with the
  // global scope
  modifiedContents = `(function () {\r\n${addTabs(modifiedContents)}\r\n})();`;

  writeFileSync(outputWasmLoaderFilePath, modifiedContents, { encoding: 'utf-8' });
};