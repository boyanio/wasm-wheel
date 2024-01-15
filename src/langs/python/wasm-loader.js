import { loadPyodide } from 'pyodide';
import './node_modules/pyodide/pyodide.asm';
import './node_modules/pyodide/pyodide.asm.wasm?wasm';
import './node_modules/pyodide/python_stdlib.zip?wasm';
import './node_modules/pyodide/pyodide-lock.json?wasm';
import wheelPartSource from './wheel-part.py?raw';
import { dispatchWheelPartLoadedEvent } from '../../app/wheel-part-loader';

loadPyodide({
  indexURL: 'wasm/',
}).then((pyodide) => {
  pyodide.runPython(wheelPartSource);
  const nameFn = pyodide.globals.get('name');
  const feelingLuckyFn = pyodide.globals.get('feelingLucky');
  dispatchWheelPartLoadedEvent(nameFn(), feelingLuckyFn);
});
