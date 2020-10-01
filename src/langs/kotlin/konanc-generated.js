/* eslint-disable */
var konan = { libraries: [] };

/*
 * Copyright 2010-2018 JetBrains s.r.o.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

let instance;
let heap;
let global_arguments;

function isBrowser() {
  return typeof self !== 'undefined';
}

let runtime;
if (isBrowser()) {
  runtime = {
    print: console.log,
    stdout: '',
    write: function (message) {
      this.stdout += message;
      const lastNewlineIndex = this.stdout.lastIndexOf('\n');
      if (lastNewlineIndex == -1) return;
      this.print(this.stdout.substring(0, lastNewlineIndex));
      this.stdout = this.stdout.substring(lastNewlineIndex + 1);
    },
    flush: function () {
      this.print(this.stdout);
    },
    exit: function (status) {
      throw Error('Kotlin process called exit (' + status + ')');
    },
  };
} else {
  runtime = {
    write: write,
    print: print,
    flush: function () {},
    exit: quit,
  };
}

function print_usage() {
  // TODO: any reliable way to obtain the current script name?
  runtime.print(
    'Usage: d8 --expose-wasm launcher.js -- <program.wasm> <program arg1> <program arg2> ...'
  );
  quit(1); // TODO: this is d8 specific
}

function utf8encode(s) {
  return unescape(encodeURIComponent(s));
}

function utf8decode(s) {
  return decodeURIComponent(escape(s));
}

function fromString(string, pointer) {
  for (let i = 0; i < string.length; i++) {
    heap[pointer + i] = string.charCodeAt(i);
  }
  heap[pointer + string.length] = 0;
}

function toString(pointer) {
  let string = '';
  for (let i = pointer; heap[i] != 0; i++) {
    string += String.fromCharCode(heap[i]);
  }
  return string;
}

function toUTF16String(pointer, size) {
  let string = '';
  for (let i = pointer; i < pointer + size; i += 2) {
    string += String.fromCharCode(heap[i] + heap[i + 1] * 256);
  }
  return string;
}

function twoIntsToDouble(upper, lower) {
  const buffer = new ArrayBuffer(8);
  const ints = new Int32Array(buffer);
  const doubles = new Float64Array(buffer);
  ints[1] = upper;
  ints[0] = lower;
  return doubles[0];
}

function doubleToTwoInts(value) {
  const buffer = new ArrayBuffer(8);
  const ints = new Int32Array(buffer);
  const doubles = new Float64Array(buffer);
  doubles[0] = value;
  return { upper: ints[1], lower: ints[0] };
}

function int32ToHeap(value, pointer) {
  heap[pointer] = value & 0xff;
  heap[pointer + 1] = (value & 0xff00) >>> 8;
  heap[pointer + 2] = (value & 0xff0000) >>> 16;
  heap[pointer + 3] = (value & 0xff000000) >>> 24;
}

function doubleToReturnSlot(value) {
  const twoInts = doubleToTwoInts(value);
  instance.exports.ReturnSlot_setDouble(twoInts.upper, twoInts.lower);
}

let konan_dependencies = {
  env: {
    abort: function () {
      throw new Error('abort()');
    },
    // TODO: Account for file and size.
    fgets: function (str, size, file) {
      // TODO: readline can't read lines without a newline.
      // Browsers cant read from console at all.
      fromString(utf8encode(readline() + '\n'), str);
      return str;
    },
    read: function (file, str, size) {
      let string = utf8encode(readline() + '\n');
      fromString(string.substring(0, size), str);
      return string.length;
    },
    Konan_notify_memory_grow: function () {
      heap = new Uint8Array(instance.exports.memory.buffer);
    },
    Konan_abort: function (pointer) {
      throw new Error('Konan_abort(' + utf8decode(toString(pointer)) + ')');
    },
    Konan_exit: function (status) {
      runtime.exit(status);
    },
    Konan_js_arg_size: function (index) {
      if (index >= global_arguments.length) return -1;
      return global_arguments[index].length + 1; // + 1 for trailing zero.
    },
    Konan_js_fetch_arg: function (index, ptr) {
      let arg = utf8encode(global_arguments[index]);
      fromString(arg, ptr);
    },
    Konan_date_now: function (pointer) {
      let now = Date.now();
      let high = Math.floor(now / 0xffffffff);
      let low = Math.floor(now % 0xffffffff);
      int32ToHeap(low, pointer);
      int32ToHeap(high, pointer + 4);
    },
    // TODO: Account for fd and size.
    write: function (fd, str, size) {
      if (fd != 1 && fd != 2) throw 'write(' + fd + ', ...)';
      // TODO: There is no writeErr() in d8.
      // Approximate it with write() to stdout for now.
      runtime.write(utf8decode(toString(str)));
    },
  },
};

function linkJavaScriptLibraries() {
  konan.libraries.forEach(function (library) {
    for (const property in library) {
      konan_dependencies.env[property] = library[property];
    }
  });
}

function invokeModule(inst, args) {
  if (args.length < 1) print_usage();
  global_arguments = args;

  instance = inst;

  heap = new Uint8Array(instance.exports.memory.buffer);

  let exit_status = 0;

  try {
    exit_status = instance.exports.Konan_js_main(
      args.length,
      isBrowser() ? 0 : 1
    );
  } catch (e) {
    runtime.print('Exception executing entry point: ' + e);
    runtime.print(e.stack);
    exit_status = 1;
  }
  runtime.flush();

  return exit_status;
}

// Instantiate module in Browser.
function instantiateAndRun(arraybuffer, args) {
  linkJavaScriptLibraries();
  WebAssembly.instantiate(
    arraybuffer,
    konan_dependencies
  ).then((resultObject) => invokeModule(resultObject.instance, args));
}

// Instantiate module in d8 synchronously.
function instantiateAndRunSync(arraybuffer, args) {
  const module = new WebAssembly.Module(arraybuffer);
  linkJavaScriptLibraries();
  const instance = new WebAssembly.Instance(module, konan_dependencies);
  return invokeModule(instance, args);
}

// Instantiate module in Browser using streaming instantiation.
function instantiateAndRunStreaming(filename) {
  linkJavaScriptLibraries();
  WebAssembly.instantiateStreaming(
    fetch(filename),
    konan_dependencies
  ).then((resultObject) => invokeModule(resultObject.instance, [filename]));
}

konan.moduleEntry = function (args) {
  if (isBrowser()) {
    if (!document.currentScript.hasAttribute('wasm')) {
      throw new Error(
        'Could not find the wasm attribute pointing to the WebAssembly binary.'
      );
    }
    const filename = document.currentScript.getAttribute('wasm');
    if (typeof WebAssembly.instantiateStreaming === 'function') {
      instantiateAndRunStreaming(filename);
    } else {
      fetch(filename)
        .then((response) => response.arrayBuffer())
        .then((arraybuffer) => instantiateAndRun(arraybuffer, [filename]));
    }
  } else {
    // Invoke from d8.
    const arrayBuffer = readbuffer(args[0]);
    const exitStatus = instantiateAndRunSync(arrayBuffer, args);
    quit(exitStatus);
  }
};

// NOTE: THIS FILE IS AUTO-GENERATED!
// Run ':runtime:generateJsMath' to re-generate it.

konan.libraries.push({
  knjs_get__Math_E: function () {
    var result = Math.E;
    return doubleToReturnSlot(result);
  },

  knjs_get__Math_LN2: function () {
    var result = Math.LN2;
    return doubleToReturnSlot(result);
  },

  knjs_get__Math_LN10: function () {
    var result = Math.LN10;
    return doubleToReturnSlot(result);
  },

  knjs_get__Math_LOG2E: function () {
    var result = Math.LOG2E;
    return doubleToReturnSlot(result);
  },

  knjs_get__Math_LOG10E: function () {
    var result = Math.LOG10E;
    return doubleToReturnSlot(result);
  },

  knjs_get__Math_PI: function () {
    var result = Math.PI;
    return doubleToReturnSlot(result);
  },

  knjs_get__Math_SQRT1_2: function () {
    var result = Math.SQRT1_2;
    return doubleToReturnSlot(result);
  },

  knjs_get__Math_SQRT2: function () {
    var result = Math.SQRT2;
    return doubleToReturnSlot(result);
  },

  knjs__Math_abs: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.abs(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_acos: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.acos(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_acosh: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.acosh(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_asin: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.asin(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_asinh: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.asinh(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_atan: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.atan(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_atanh: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.atanh(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_atan2: function (yUpper, yLower, xUpper, xLower) {
    var y = twoIntsToDouble(yUpper, yLower);
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.atan2(y, x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_cbrt: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.cbrt(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_ceil: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.ceil(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_clz32: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.clz32(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_cos: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.cos(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_cosh: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.cosh(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_exp: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.exp(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_expm1: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.expm1(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_floor: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.floor(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_fround: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.fround(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_log: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.log(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_log1p: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.log1p(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_log10: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.log10(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_log2: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.log2(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_pow: function (xUpper, xLower, yUpper, yLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var y = twoIntsToDouble(yUpper, yLower);
    var result = Math.pow(x, y);
    return doubleToReturnSlot(result);
  },

  knjs__Math_random: function () {
    var result = Math.random();
    return doubleToReturnSlot(result);
  },

  knjs__Math_round: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.round(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_sign: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.sign(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_sin: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.sin(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_sinh: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.sinh(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_sqrt: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.sqrt(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_tan: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.tan(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_tanh: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.tanh(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_trunc: function (xUpper, xLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var result = Math.trunc(x);
    return doubleToReturnSlot(result);
  },

  knjs__Math_hypot: function (xUpper, xLower, yUpper, yLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var y = twoIntsToDouble(yUpper, yLower);
    var result = Math.hypot(x, y);
    return doubleToReturnSlot(result);
  },

  knjs__Math_max: function (xUpper, xLower, yUpper, yLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var y = twoIntsToDouble(yUpper, yLower);
    var result = Math.max(x, y);
    return doubleToReturnSlot(result);
  },

  knjs__Math_min: function (xUpper, xLower, yUpper, yLower) {
    var x = twoIntsToDouble(xUpper, xLower);
    var y = twoIntsToDouble(yUpper, yLower);
    var result = Math.min(x, y);
    return doubleToReturnSlot(result);
  },
});

/*
 * Copyright 2010-2018 JetBrains s.r.o.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

konan.libraries.push({
  arenas: new Map(),
  nextArena: 0,
  Konan_js_allocateArena: function (array) {
    var index = konan_dependencies.env.nextArena++;
    konan_dependencies.env.arenas.set(index, array || []);
    return index;
  },
  Konan_js_freeArena: function (arenaIndex) {
    var arena = konan_dependencies.env.arenas.get(arenaIndex);
    arena.forEach(function (element, index) {
      arena[index] = null;
    });
    konan_dependencies.env.arenas.delete(arenaIndex);
  },
  Konan_js_pushIntToArena: function (arenaIndex, value) {
    var arena = konan_dependencies.env.arenas.get(arenaIndex);
    arena.push(value);
    return arena.length - 1;
  },
  Konan_js_addObjectToArena: function (arenaIndex, object) {
    var arena = konan_dependencies.env.arenas.get(arenaIndex);
    arena.push(object);
    return arena.length - 1;
  },
  Konan_js_wrapLambda: function (functionArenaIndex, index) {
    return function () {
      var functionArena = konan_dependencies.env.arenas.get(functionArenaIndex);

      // convert Arguments to an array
      // to be provided by launcher.js
      var argumentArenaIndex = konan_dependencies.env.Konan_js_allocateArena(
        Array.prototype.slice.call(arguments)
      );

      var resultIndex = instance.exports.Konan_js_runLambda(
        index,
        argumentArenaIndex,
        arguments.length
      );
      var result = kotlinObject(argumentArenaIndex, resultIndex);
      konan_dependencies.env.Konan_js_freeArena(argumentArenaIndex);

      return result;
    };
  },
  Konan_js_getInt: function (
    arenaIndex,
    objIndex,
    propertyNamePtr,
    propertyNameLength
  ) {
    // TODO:  The toUTF16String() is to be resolved by launcher.js runtime.
    var property = toUTF16String(propertyNamePtr, propertyNameLength);
    var value = kotlinObject(arenaIndex, objIndex)[property];
    return value;
  },
  Konan_js_getProperty: function (
    arenaIndex,
    objIndex,
    propertyNamePtr,
    propertyNameLength
  ) {
    // TODO:  The toUTF16String() is to be resolved by launcher.js runtime.
    var property = toUTF16String(propertyNamePtr, propertyNameLength);
    var arena = konan_dependencies.env.arenas.get(arenaIndex);
    var value = arena[objIndex][property];
    arena.push(value);
    return arena.length - 1;
  },
  Konan_js_setFunction: function (
    arena,
    obj,
    propertyName,
    propertyNameLength,
    func
  ) {
    var name = toUTF16String(propertyName, propertyNameLength);
    kotlinObject(arena, obj)[name] = konan_dependencies.env.Konan_js_wrapLambda(
      arena,
      func
    );
  },

  Konan_js_setString: function (
    arena,
    obj,
    propertyName,
    propertyNameLength,
    stringPtr,
    stringLength
  ) {
    var name = toUTF16String(propertyName, propertyNameLength);
    var string = toUTF16String(stringPtr, stringLength);
    kotlinObject(arena, obj)[name] = string;
  },
});

// TODO: This is just a shorthand notation.
function kotlinObject(arenaIndex, objectIndex) {
  var arena = konan_dependencies.env.arenas.get(arenaIndex);
  if (typeof arena == 'undefined') {
    console.log('No arena index ' + arenaIndex + 'for object' + objectIndex);
    console.trace();
  }
  return arena[objectIndex];
}

function toArena(arenaIndex, object) {
  return konan_dependencies.env.Konan_js_addObjectToArena(arenaIndex, object);
}

if (isBrowser()) {
  konan.moduleEntry([]);
} else {
  konan.moduleEntry(arguments);
}
