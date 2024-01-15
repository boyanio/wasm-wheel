import wasmFile from './output/wheel-part-go.wasm?wasm';
import './wasm_exec';
import { dispatchWheelPartLoadedEvent } from '../../app/wheel-part-loader';

window.initGoCallbacks = async (getName, getFeelingLucky) => {
  const getNamePromise = () =>
    new Promise((resolve) => {
      getName({
        result: (n) => {
          resolve(n);
        },
      });
    });

  const getFeelingLuckyPromise = () =>
    new Promise((resolve) => {
      getFeelingLucky({
        result: (n) => {
          resolve(n);
        },
      });
    });

  const wheelPartName = await getNamePromise();
  const feelingLuckyPromiseFunc = () => getFeelingLuckyPromise();
  dispatchWheelPartLoadedEvent(wheelPartName, feelingLuckyPromiseFunc);

  delete window.initGoCallbacks;
};

const go = new window.Go();
WebAssembly.instantiateStreaming(fetch(wasmFile), go.importObject).then(
  (result) => go.run(result.instance)
);
