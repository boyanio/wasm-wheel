const fs = require('fs');
const asc = require('assemblyscript/bin/asc');

exports.task = (done) => {
    const relativeBuildDir = '../../../build/wasm';
    const buildDir = `${__dirname}/${relativeBuildDir}`;

    const ascDone = (err) => {
        if (err) {
            throw err;
        }

        fs.copyFileSync(`${__dirname}/wasm-loader.js`, `${buildDir}/wheel-part-assemblyscript.wasm-loader.js`);
        done();
    };

    asc.main([
        'wheel-part.ts',
        '--baseDir', __dirname,
        '--binaryFile', `${relativeBuildDir}/wheel-part-assemblyscript.wasm`,
        '--importMemory',
        '--optimize',
        '--measure',
        '--validate',
        '--use', 'Math=JSMath'
    ], ascDone);
};