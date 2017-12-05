const gulp = require('gulp');
const connect = require('connect');
const serveStatic = require('serve-static');
const fs = require('fs');

const buildTasks = () => fs.readdirSync(`${__dirname}/src/langs`)
    .filter(lang => fs.existsSync(`${__dirname}/src/langs/${lang}/build.js`))
    .reduce((tasks, lang) => {
        const task = `build-wasm-${lang}`;
        const taskFn = require(`./src/langs/${lang}/build`).task;
        gulp.task(task, (done) => {
            console.log(`Building ${lang} wheel part ...`);
            taskFn(done);
        });
        return [...tasks, task];
    }, []);

gulp.task('build-wasm', buildTasks());

gulp.task('http', (done) => {
    connect()
        .use(serveStatic(`${__dirname}/build`))
        .use((req, res, next) => {
            const url = req.url;
            if (url.startsWith('/wheel-parts.json')) {
                const wasmFiles = fs.readdirSync(`${__dirname}/build/wasm`)
                    .filter(file => file.startsWith('wheel-part') && file.endsWith('.wasm'))
                    .map(file => ({
                        file,
                        loader: fs.existsSync(`${__dirname}/build/wasm/${file}-loader.js`) ?
                            `${file}-loader.js` : null
                    }));

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

gulp.task('default', ['build-wasm', 'http']);