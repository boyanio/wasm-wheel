const fs = require('fs');
const { promisify } = require('util');
const { formatWasmLoader } = require('./format-wasm-loader');

const copyFile = promisify(fs.copyFile);

module.exports = async (buildDir) => {
  await copyFile(
    `${__dirname}/output/wheel-part-kotlin.wasm`,
    `${buildDir}/wheel-part-kotlin.wasm`
  );
  await formatWasmLoader(
    `${__dirname}/konanc-generated.js`,
    `${buildDir}/wheel-part-kotlin.wasm-loader.js`
  );
};
