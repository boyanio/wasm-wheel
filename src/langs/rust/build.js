const execp = require('../../execp');

const buildWasm = async (buildDir) => {
  await execp(`rustc --target wasm32-unknown-unknown --crate-type=cdylib -o ${buildDir}/wheel-part-rust.wasm ${__dirname}/wheel-part.rs`);
};

exports.buildWasm = buildWasm;