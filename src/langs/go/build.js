const fs = require('fs');
const { promisify } = require('util');
const execp = require('../../execp');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const createWasmLoader = async (destinationPath) => {
  const opts = { encoding: 'utf-8' };
  const wasmExec = await readFile(`${__dirname}/wasm_exec.js`, opts);
  const appendix = await readFile(`${__dirname}/wasm-loader-appendix.js`, opts);
  const wasmLoaderContents = `${wasmExec}\r\r${appendix}`;
  await writeFile(destinationPath, wasmLoaderContents, opts);
};

module.exports = async function () {
  const buildDir = `${__dirname}/../../../build/wasm`;

  await execp(
    `go build -o ${buildDir}/wheel-part-go.wasm wheel-part.go`,
    { cwd: __dirname, env: Object.assign({}, process.env, { GOOS: 'js', GOARCH: 'wasm' }) });

  await createWasmLoader(`${buildDir}/wheel-part-go.wasm-loader.js`);
};