const { exec } = require('child_process');

module.exports = function execp(cmd, opts) {
  opts || (opts = {});

  return new Promise((resolve, reject) => {
    console.log(`Running ${cmd}`);

    const ls = exec(cmd, opts);
    ls.stdout.pipe(process.stdout);
    ls.stderr.pipe(process.stdout);
    ls.on('exit', (code) => {
      if (code !== 0) {
        reject(code);
      } else {  
        resolve();
      }
    });
  });
};