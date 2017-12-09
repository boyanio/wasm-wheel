const util = require('util');
const exec = util.promisify(require('child_process').exec);

exports.task = (done) => {
    exec(`mvn clean install`, { cwd: `${__dirname}` })
        .then(({ stdout }) => {
                console.log(stdout);
                done();
            },
            ({ stdout, cmd }) => {
                console.log(stdout);
                throw Error(`Error when running: ${cmd}`);
            });
};