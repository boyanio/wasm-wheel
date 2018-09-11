const compiler = require('webassembly/cli/compiler');
const { promisify } = require('util');

const compilerMain = promisify(compiler.main);

module.exports = async function () {
  await compilerMain([
    '-o', `${__dirname}'/../../../build/wasm/wheel-part-c.wasm`,
    `${__dirname}/wheel-part.c`
  ]);
};