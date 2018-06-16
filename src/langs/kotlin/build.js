const fs = require('fs');
const { exec } = require('child_process');
const { formatWasmLoader } = require('./format-wasm-loader');

exports.task = (done) => {
    const buildDir = `${__dirname}/../../../build/wasm`;
    const targetDir = `${__dirname}/target`;

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
    }

    const ls = exec(`konanc wheel-part.kt -target wasm32 -o ${targetDir}/wheelpart.wasm -verbose`, { cwd: __dirname });
    ls.stdout.pipe(process.stdout)
    ls.stderr.pipe(process.stdout)
    ls.on('exit', (code) => {
        if (code !== 0)
            throw Error('Error when building the Kotlin wheel part');

        formatWasmLoader(`${targetDir}/wheelpart.wasm.js`, `${buildDir}/wheel-part-kotlin.wasm-loader.js`);
        fs.copyFileSync(`${targetDir}/wheelpart.wasm`, `${buildDir}/wheel-part-kotlin.wasm`);

        done();
    });
};