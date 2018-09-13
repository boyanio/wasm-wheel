const fs = require('fs');
const { promisify } = require('util');
const execp = require('../../execp');

const copyFile = promisify(fs.copyFile);

module.exports = async function () {
  const relativeBuildDir = '../../../build/wasm';
  const buildDir = `${__dirname}/${relativeBuildDir}`;

  await execp('npm install', { cwd: __dirname });

  const asc = require('assemblyscript/bin/asc');
  const ascMain = promisify(asc.main);
  await ascMain([
    'wheel-part.ts',
    '--baseDir', __dirname,
    '--binaryFile', `${relativeBuildDir}/wheel-part-assemblyscript.wasm`,
    '--importMemory',
    '--optimize',
    '--measure',
    '--validate',
    '--use', 'Math=JSMath'
  ]);

  await copyFile(`${__dirname}/wasm-loader.js`, `${buildDir}/wheel-part-assemblyscript.wasm-loader.js`);
};