const fs = require('fs');
const { promisify } = require('util');
const execp = require('../../execp');
const { formatWasmLoader } = require('./format-wasm-loader');

const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);
const copyFile = promisify(fs.copyFile);

module.exports = async function () {
  const buildDir = `${__dirname}/../../../build/wasm`;
  const targetDir = `${__dirname}/target`;

  if (!(await exists(targetDir))) {
    await mkdir(targetDir);
  }

  await execp(`konanc wheel-part.kt -target wasm32 -o ${targetDir}/wheelpart.wasm -verbose`, { cwd: __dirname });
  
  await formatWasmLoader(`${targetDir}/wheelpart.wasm.js`, `${buildDir}/wheel-part-kotlin.wasm-loader.js`);
  await copyFile(`${targetDir}/wheelpart.wasm`, `${buildDir}/wheel-part-kotlin.wasm`);
};