const fs = require('fs');
const { exec } = require('child_process');

const createWasmLoader = (destinationPath) => {
  const wasmExec = fs.readFileSync(`${__dirname}/wasm_exec.js`, { encoding: 'utf-8' });
  const appendix = fs.readFileSync(`${__dirname}/wasm-loader-appendix.js`, { encoding: 'utf-8' });
  const wasmLoaderContents = `${wasmExec}\r\r${appendix}`;
  fs.writeFileSync(destinationPath, wasmLoaderContents, { encoding: 'utf-8' });
};

exports.task = (done) => {
  const buildDir = `${__dirname}/../../../build/wasm`;

  const ls = exec(`go build -o ${buildDir}/wheel-part-go.wasm wheel-part.go`, { cwd: __dirname, env: { GOOS: 'js', GOARCH: 'wasm' } });
  ls.stdout.pipe(process.stdout)
  ls.stderr.pipe(process.stdout)
  ls.on('exit', (code) => {
    if (code !== 0)
      throw Error('Error when building the Go wheel part');

    createWasmLoader(`${buildDir}/wheel-part-go.wasm-loader.js`);
    done();
  });
};