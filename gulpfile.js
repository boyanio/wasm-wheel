const gulp = require('gulp');
const compiler = require('webassembly/cli/compiler');
const connect = require('connect');
const serveStatic = require('serve-static');
const fs = require('fs');

gulp.task('build-wasm', (done) => {
    compiler.main(
        ['-o', 'build/wasm/wheel-part-c.wasm', 'src/langs/c/wheel-part.c', '-m'],
        (err, filename) => {
            if (err)
                throw err;

            console.log(`WASM file saved to: ${filename}`);
            done();
        });
});

gulp.task('build', ['build-wasm']);

gulp.task('http', (done) => {
    connect()
        .use(serveStatic(__dirname + '/build'))
        .use((req, res, next) => {
            const url = req.url;
            if (url.startsWith('/wheel-parts.json')) {
                const wasmFiles = fs.readdirSync(__dirname + '/build/wasm');

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ wasmFiles }));
                res.end();
            } else {
                next();
            }
        })
        .use((req, res, next) => {
            const url = req.url;
            console.log(url);
            next();
        })
        .listen(8080, done);
});

gulp.task('default', ['build', 'http']);