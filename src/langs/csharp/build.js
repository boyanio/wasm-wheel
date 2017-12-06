const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

exports.task = (done) => {
    const buildDir = `${__dirname}/../../../build/wasm`;
    const compiler = 'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc';

    exec(`${compiler} /nologo /target:library /out:"${buildDir}\\wheel-part-csharp.dll" "${__dirname}\\wheel-part.cs"`)
        .then(({ stdout, stderr }) => {
            console.log(stdout);

            fs.createReadStream(`${__dirname}/wasm-loader.js`).pipe(fs.createWriteStream(`${buildDir}/wheel-part-csharp.wasm-loader.js`));
            fs.createReadStream(`${__dirname}/dna.js`).pipe(fs.createWriteStream(`${buildDir}/wheel-part-csharp.js`));
            fs.createReadStream(`${__dirname}/dna.wasm`).pipe(fs.createWriteStream(`${buildDir}/wheel-part-csharp.wasm`));
            fs.createReadStream(`${__dirname}/corlib.dll`).pipe(fs.createWriteStream(`${buildDir}/corlib.dll`));

            done();
        });
};