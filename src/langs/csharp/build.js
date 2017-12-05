const fs = require('fs');
const exec = require('child_process').exec;

exports.task = (done) => {
    const buildDir = `${__dirname}/../../../build/wasm`;
    fs.createReadStream(`${__dirname}/wasm-loader.js`).pipe(fs.createWriteStream(`${buildDir}/wheel-part-csharp.wasm-loader.js`));
    fs.createReadStream(`${__dirname}/dna.js`).pipe(fs.createWriteStream(`${buildDir}/dna.js`));
    fs.createReadStream(`${__dirname}/dna.wasm`).pipe(fs.createWriteStream(`${buildDir}/wheel-part-csharp.wasm`));
    fs.createReadStream(`${__dirname}/corlib.dll`).pipe(fs.createWriteStream(`${buildDir}/corlib.dll`));

    const compiler = 'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc';
    exec(`${compiler} /out:"${buildDir}\\wheel-part-csharp.dll" /t:library "${__dirname}\\wheel-part.cs"`, function(err, data) {
        if (err)
            throw err;

        done();
    });
};