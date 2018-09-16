const fs = require('fs');
const { promisify } = require('util');
const execp = require('../../execp');
const { formatWasmLoader } = require('./format-wasm-loader');

const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);
const copyFile = promisify(fs.copyFile);

const targetDir = `${__dirname}/target`;

const buildWasm = async (buildDir) => {
  if (!(await exists(targetDir))) {
    await mkdir(targetDir);
  }

  await execp(`konanc wheel-part.kt -target wasm32 -o ${targetDir}/output.wasm -verbose`, { cwd: __dirname });
  await copyFile(`${targetDir}/output.wasm`, `${buildDir}/wheel-part-kotlin.wasm`);
};

const buildLoader = async (buildDir) => {
  await formatWasmLoader(`${__dirname}/konanc-generated.js`, `${buildDir}/wheel-part-kotlin.wasm-loader.js`);
};

exports.buildLoader = buildLoader;
exports.buildWasm = buildWasm;