const fs = require('fs');
const { promisify } = require('util');

const copyFile = promisify(fs.copyFile);

module.exports = async (buildDir) => {
  await copyFile(
    `${__dirname}/output/wheel-part-rust.wasm`,
    `${buildDir}/wheel-part-rust.wasm`
  );
  await copyFile(
    `${__dirname}/wasm-loader.js`,
    `${buildDir}/wheel-part-rust.wasm-loader.js`
  );
};
