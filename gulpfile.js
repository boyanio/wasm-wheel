const gulp = require('gulp');
const connect = require('connect');
const serveStatic = require('serve-static');
const fs = require('fs');
const path = require('path');

const buildDir = `${__dirname}/build`;
const buildWasmDir = `${buildDir}/wasm`;
const langDir = `${__dirname}/src/langs`;

const langs = fs.readdirSync(langDir)
    .filter(lang => fs.existsSync(`${langDir}/${lang}/build.js`));
const wasmTasks = [];

for (const lang of langs) {
    const task = `build-wasm-${lang}`;
    const taskFn = require(`./src/langs/${lang}/build`).task;
    gulp.task(task, (done) => {
        console.log(`Building ${lang} wheel part ...`);
        taskFn(done);
    });
    wasmTasks.push(task);
}

gulp.task('build-wasm', wasmTasks);

gulp.task('build-metadata', ['build-wasm'], () => {
    const wasmFiles = fs.readdirSync(langDir)
        .map(lang => {
            const wasmFile = `wheel-part-${lang}.wasm`;
            const metaFile = path.join(langDir, `${lang}/meta.json`);
            const meta = fs.existsSync(metaFile) ?
                JSON.parse(fs.readFileSync(metaFile, 'utf8')) : {};

            return {
                file: wasmFile,
                loader: meta.loader,
                name: meta.name
            };
        });

    fs.writeFileSync(`${buildDir}/wheel-parts.json`, JSON.stringify({ wasmFiles }));
});

gulp.task('clean-build-folder', (done) => {
    fs.readdir(buildWasmDir, (err, files) => {
        if (err)
            throw err;

        for (const file of files) {
            fs.unlink(path.join(buildWasmDir, file), err => {
                if (err)
                    throw err;
            });
        }

        done();
    })
});

gulp.task('build', ['clean-build-folder', 'build-metadata']);

gulp.task('http', (done) => {
    connect()
        .use(serveStatic(buildDir))
        .use((req, res, next) => {
            const url = req.url;
            console.log(url);
            next();
        })
        .listen(8080, done);
});

gulp.task('default', ['build', 'http']);