const fs = require('fs');
const { Compiler } = require('assemblyscript');

exports.task = (done) => {
    const wasmModule = Compiler.compileFile(`${__dirname}/wheel-part.ts`, {
        silent: true,
        noRuntime: true,
        target: 'wasm32'
    });
    if (!wasmModule) {
        console.log(Compiler.lastDiagnostics);
        throw Error('Compilation failed.');
    }

    wasmModule.optimize();

    if (!wasmModule.validate())
        throw Error('Validation failed');

    const buildDir = `${__dirname}/../../../build/wasm`;
    fs.writeFile(`${buildDir}/wheel-part-typescript.wasm`, new Buffer(wasmModule.emitBinary()));
    fs.createReadStream(`${__dirname}/wasm-loader.js`).pipe(fs.createWriteStream(`${buildDir}/wheel-part-typescript.wasm-loader.js`));
    wasmModule.dispose();

    done();
};