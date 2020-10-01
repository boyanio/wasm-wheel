const fs = require('fs');
const { promisify } = require('util');

const copyFile = promisify(fs.copyFile);

module.exports = async (buildDir) => {
  await copyFile(`${__dirname}/output/wheel-part-assemblyscript.wasm`, `${buildDir}/wheel-part-assemblyscript.wasm`);
  await copyFile(`${__dirname}/wasm-loader.js`, `${buildDir}/wheel-part-assemblyscript.wasm-loader.js`);
};
