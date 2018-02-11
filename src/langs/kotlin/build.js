const fs = require('fs');
const { exec } = require('child_process');

exports.task = (done) => {
    const buildDir = `${__dirname}/../../../build/wasm`;
    const targetDir = `${__dirname}/target`;

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
    }

    const ls = exec(`konanc wheel-part.kt -target wasm32 -o ${targetDir}/wheel-part.wasm -verbose`, { cwd: __dirname });
    ls.stdout.pipe(process.stdout)
    ls.stderr.pipe(process.stdout)
    ls.on('exit', (code) => {
        if (code !== 0)
            throw Error('Error when building the Kotlin wheel part');

        fs.copyFileSync(`${__dirname}/wasm-loader.js`, `${buildDir}/wheel-part-kotlin.wasm-loader.js`);
        fs.copyFileSync(`${targetDir}/wheel-part.wasm`, `${buildDir}/wheel-part-kotlin.wasm`);

        done();
    });
};