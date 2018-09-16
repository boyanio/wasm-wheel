const { promisify } = require('util');
const execp = require('../../execp');

const buildWasm = async (buildDir) => {
  await execp('npm install', { cwd: __dirname });

  const compiler = require('webassembly/cli/compiler');
  const compilerMain = promisify(compiler.main);
  await compilerMain([
    '-o', `${buildDir}/wheel-part-c.wasm`,
    `${__dirname}/wheel-part.c`
  ]);
};

exports.buildWasm = buildWasm;