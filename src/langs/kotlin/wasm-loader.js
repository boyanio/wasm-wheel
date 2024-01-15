import originalContents from './konanc-generated.js?raw';
import wasmFile from './output/wheel-part-kotlin.wasm?wasm';
import * as wheel from '../../app/wheel-part-loader';

let modifiedContents = originalContents;

// The default behavior to load Kotlin-compiled WASM is to create a <script>
// and put an attribute wasm indicating the wasm file. We will override this
// with a simpler version, where it is not necessary to create a <script>
// element, but rather load the wasm file right away
modifiedContents =
  modifiedContents.substring(
    0,
    modifiedContents.indexOf(
      `if (!document.currentScript.hasAttribute('wasm')) {`
    )
  ) +
  modifiedContents.substring(
    modifiedContents.indexOf(
      `const filename = document.currentScript.getAttribute('wasm');`
    )
  );

modifiedContents = modifiedContents.replace(
  `const filename = document.currentScript.getAttribute('wasm');`,
  `const filename = '${wasmFile}';`
);

// Inject a function to emit a event when the wheel part has been loaded
const invokeModuleFuncIndex = modifiedContents.indexOf(
  'function invokeModule(inst, args)'
);
modifiedContents =
  modifiedContents.substring(0, invokeModuleFuncIndex) +
  `
function dispatchWheelPartLoadedEvent() {
    const getInt = function(offset) {
        return heap[offset] |
            heap[offset + 1] << 8 |
            heap[offset + 2] << 16 |
            heap[offset + 3] << 24;
    };

    const getName = function() {
        const ptr = instance.exports["kfun:#name(){}kotlin.String"]();
        const size = getInt(ptr + 4);
        return toUTF16String(ptr + 4 + 4, size * 2);
    };

    const feelingLuckyPromiseFunc = () => Promise.resolve(instance.exports["kfun:#feelingLucky(){}kotlin.Int"]());
    wheel.dispatchWheelPartLoadedEvent(getName(), feelingLuckyPromiseFunc);
}

` +
  modifiedContents.substring(invokeModuleFuncIndex);

// Call the function on invokeModule
const invokeModuleFuncReturnIndex = modifiedContents.indexOf(
  'return exit_status;'
);
modifiedContents =
  modifiedContents.substring(0, invokeModuleFuncReturnIndex) +
  `dispatchWheelPartLoadedEvent();
  ` +
  modifiedContents.substring(invokeModuleFuncReturnIndex);

// Register custom wasm imports
const dateNowDependencyIndex = modifiedContents.indexOf(
  'Konan_date_now: function (pointer) {'
);
modifiedContents =
  modifiedContents.substring(0, dateNowDependencyIndex) +
  `Konan_js_rand: function () {
            const result = Math.random();
            doubleToReturnSlot(result);
        },
        ` +
  modifiedContents.substring(dateNowDependencyIndex);

const init = new Function('wheel', modifiedContents);
init(wheel);
