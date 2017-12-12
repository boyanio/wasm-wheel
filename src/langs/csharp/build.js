const fs = require('fs');
const { exec, execSync } = require('child_process');

exports.task = (done) => {
    const buildDir = `${__dirname}/../../../build/wasm`;

    const execCmd = () => {
        const monoCompiler = 'mcs';
        const vsCompiler = 'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc';

        let useMono = false;
        try {
            execSync(`${monoCompiler} --about`);
            useMono = true;
            console.log('Mono is present on this machine, using mcs');
        } catch (e) {
            console.log('Mono seems to be missing on this machine. Using csc instead');
        }

        return useMono ?
            `${monoCompiler} -target:library -out:"${buildDir}\\wheel-part-csharp.dll" "${__dirname}\\wheel-part.cs"` :
            `${vsCompiler} /nologo /target:library /out:"${buildDir}\\wheel-part-csharp.dll" "${__dirname}\\wheel-part.cs"`;
    };

    const ls = exec(execCmd());
    ls.stdout.pipe(process.stdout)
    ls.stderr.pipe(process.stdout)
    ls.on('exit', (code) => {
        if (code !== 0)
            throw Error('Error when building the Java wheel part');

        fs.copyFileSync(`${__dirname}/wasm-loader.js`, `${buildDir}/wheel-part-csharp.wasm-loader.js`);
        fs.copyFileSync(`${__dirname}/dna.js`, `${buildDir}/wheel-part-csharp.js`);
        fs.copyFileSync(`${__dirname}/dna.wasm`, `${buildDir}/wheel-part-csharp.wasm`);
        fs.copyFileSync(`${__dirname}/corlib.dll`, `${buildDir}/corlib.dll`);

        done();
    });
};