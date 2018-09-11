const execp = require('../../execp');

module.exports = async function () {
  const buildDir = `${__dirname}/../../../build/wasm`;

  await execp(`rustc --target wasm32-unknown-unknown --crate-type=cdylib -o ${buildDir}/wheel-part-rust.wasm ${__dirname}/wheel-part.rs`);
};