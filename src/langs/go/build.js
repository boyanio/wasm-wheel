const fs = require('fs');
const { promisify } = require('util');

const copyFile = promisify(fs.copyFile);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

module.exports = async (buildDir) => {
  await copyFile(`${__dirname}/output/wheel-part-go.wasm`, `${buildDir}/wheel-part-go.wasm`);

  const opts = { encoding: 'utf-8' };
  const wasmExec = await readFile(`${__dirname}/wasm_exec.js`, opts);
  const appendix = await readFile(`${__dirname}/wasm-loader-appendix.js`, opts);
  const wasmLoaderContents = `${wasmExec}\r\r${appendix}`;
  await writeFile(`${buildDir}/wheel-part-go.wasm-loader.js`, wasmLoaderContents, opts);
};
