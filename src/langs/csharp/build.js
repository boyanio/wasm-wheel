const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

exports.task = (done) => {
    const buildDir = `${__dirname}/../../../build/wasm`;
    const compiler = 'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc';

    exec(`${compiler} /nologo /target:library /out:"${buildDir}\\wheel-part-csharp.dll" "${__dirname}\\wheel-part.cs"`)
        .then(({ stdout }) => {
            console.log(stdout);

            fs.copyFileSync(`${__dirname}/wasm-loader.js`, `${buildDir}/wheel-part-csharp.wasm-loader.js`);
            fs.copyFileSync(`${__dirname}/dna.js`, `${buildDir}/wheel-part-csharp.js`);
            fs.copyFileSync(`${__dirname}/dna.wasm`, `${buildDir}/wheel-part-csharp.wasm`);
            fs.copyFileSync(`${__dirname}/corlib.dll`, `${buildDir}/corlib.dll`);

            done();
        }, ({ stdout, cmd }) => {
            console.log(stdout);
            throw Error(`Error when running: ${cmd}`);
        });
};