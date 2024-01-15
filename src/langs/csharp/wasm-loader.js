import { dispatchWheelPartLoadedEvent } from '../../app/wheel-part-loader';
import corlibDllPath from './output/corlib.dll?wasm';
import wheelPartDllPath from './output/wheel-part-csharp.dll?wasm';
import './output/dna.wasm?wasm';
import DotNetAnywhere from './output/dna';

let dna = null;

const invokeCsharpFunc = (
  assemblyName,
  namespace,
  className,
  methodName,
  stringArg,
  returnType
) =>
  dna.ccall(
    'JSInterop_CallDotNet',
    returnType,
    ['string', 'string', 'string', 'string', 'string'],
    [assemblyName, namespace, className, methodName, stringArg]
  );

const dnaOps = {
  locateFile: (file) => `wasm/${file}`,
  arguments: ['wheel-part-csharp.dll'],
  preRun: () => {
    dna.FS_createPreloadedFile('/', 'corlib.dll', corlibDllPath, true);
    dna.FS_createPreloadedFile(
      '/',
      'wheel-part-csharp.dll',
      wheelPartDllPath,
      true
    );
  },
  postRun: () => {
    const feelingLuckyPromiseFunc = () =>
      Promise.resolve(
        invokeCsharpFunc(
          'wheel-part-csharp',
          'WheelOfWasm',
          'Program',
          'feelingLucky',
          null,
          'number'
        )
      );
    dispatchWheelPartLoadedEvent('C#', feelingLuckyPromiseFunc);
  },
};

dna = DotNetAnywhere(dnaOps);
