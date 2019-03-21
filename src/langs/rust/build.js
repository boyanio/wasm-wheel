const fs = require('fs');
const { promisify } = require('util');
const execp = require('../../execp');

const copyFile = promisify(fs.copyFile);

const buildWasm = async (buildDir) => {
  await execp(`rustc --target wasm32-unknown-unknown -C opt-level=z -C lto --crate-type=cdylib -o ${buildDir}/wheel-part-rust.wasm ${__dirname}/wheel-part.rs`);
};

const buildLoader = async (buildDir) => {
  await copyFile(`${__dirname}/wasm-loader.js`, `${buildDir}/wheel-part-rust.wasm-loader.js`);
};

exports = {
  buildLoader,
  buildWasm
};
