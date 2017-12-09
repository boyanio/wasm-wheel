const compiler = require('webassembly/cli/compiler');

exports.task = (done) => {
    compiler.main(
        ['-o', `${__dirname}'/../../../build/wasm/wheel-part-c.wasm`, `${__dirname}/wheel-part.c`],
        (err, filename) => {
            if (err)
                throw err;

            done();
        });
};