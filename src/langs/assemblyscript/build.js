const fs = require('fs');
const { promisify } = require('util');
const execp = require('../../execp');

const copyFile = promisify(fs.copyFile);
const rename = promisify(fs.rename);

const buildWasm = async (buildDir) => {
  await execp('npm install', { cwd: __dirname });

  const asc = require('assemblyscript/bin/asc');
  const ascMain = promisify(asc.main);
  await ascMain([
    'wheel-part.ts',
    '--baseDir', __dirname,
    '--binaryFile', 'output.wasm',
    '--importMemory',
    '--optimize',
    '--measure',
    '--validate',
    '--use', 'Math=JSMath'
  ]);

  await rename(`${__dirname}/output.wasm`, `${buildDir}/wheel-part-assemblyscript.wasm`);
};

const buildLoader = async (buildDir) => {
  await copyFile(`${__dirname}/wasm-loader.js`, `${buildDir}/wheel-part-assemblyscript.wasm-loader.js`);
};

exports.buildLoader = buildLoader;
exports.buildWasm = buildWasm;