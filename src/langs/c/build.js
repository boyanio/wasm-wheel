const fs = require('fs');
const { promisify } = require('util');
const execp = require('../../../scripts/execp');

const copyFile = promisify(fs.copyFile);

const buildWasm = async (buildDir) => {
  await execp(`emcc -Os wheel-part.c -s EXPORTED_FUNCTIONS="['_name','_feelingLucky']" -s ERROR_ON_UNDEFINED_SYMBOLS=0 -o ${buildDir}/wheel-part-c.wasm`, { cwd: __dirname });
};

const buildLoader = async (buildDir) => {
  await copyFile(`${__dirname}/wasm-loader.js`, `${buildDir}/wheel-part-c.wasm-loader.js`);
};

exports.buildLoader = buildLoader;
exports.buildWasm = buildWasm;