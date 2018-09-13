const { promisify } = require('util');
const execp = require('../../execp');

module.exports = async function () {
  await execp('npm install', { cwd: __dirname });

  const compiler = require('webassembly/cli/compiler');
  const compilerMain = promisify(compiler.main);
  await compilerMain([
    '-o', `${__dirname}'/../../../build/wasm/wheel-part-c.wasm`,
    `${__dirname}/wheel-part.c`
  ]);
};