const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

exports.task = (done) => {
    const buildDir = `${__dirname}/../../../build/wasm`;

    const compilation = async() => {
        const monoCompiler = 'mcs';
        const vsCompiler = 'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc';

        let useMono = false;
        try {
            await exec(`${monoCompiler} --about`);
            useMono = true;
            console.log('Mono is present on this machine, using mcs');
        } catch (e) {
            console.log('Mono seems to be missing on this machine. Using csc instead');
        }

        const cmd = useMono ?
            `${monoCompiler} -target:library -out:"${buildDir}\\wheel-part-csharp.dll" "${__dirname}\\wheel-part.cs"` :
            `${vsCompiler} /nologo /target:library /out:"${buildDir}\\wheel-part-csharp.dll" "${__dirname}\\wheel-part.cs"`;

        return await exec(cmd);
    };

    compilation()
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