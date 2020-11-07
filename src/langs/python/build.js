const fs = require('fs');
const { promisify } = require('util');

const copyFile = promisify(fs.copyFile);

module.exports = async (buildDir) => {
  await copyFile(
    `${__dirname}/wheel-part.py`,
    `${buildDir}/wheel-part-python.txt`
  );
  await copyFile(
    `${__dirname}/wasm-loader.js`,
    `${buildDir}/wheel-part-python.wasm-loader.js`
  );
};
