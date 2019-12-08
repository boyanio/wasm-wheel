const fs = require('fs');
const { promisify } = require('util');
const execp = require('../../../scripts/execp');

const copyFile = promisify(fs.copyFile);

const buildWasm = async (buildDir) => {
  await execp(`emcc -Os wheel-part.c -o ${buildDir}/wheel-part-c.wasm -s SIDE_MODULE=1`, { cwd: __dirname });
};

const buildLoader = async (buildDir) => {
  await copyFile(`${__dirname}/wasm-loader.js`, `${buildDir}/wheel-part-c.wasm-loader.js`);
};

exports.buildLoader = buildLoader;
exports.buildWasm = buildWasm;