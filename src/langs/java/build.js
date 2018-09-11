const fs = require('fs');
const { promisify } = require('util');
const execp = require('../../execp');

const copyFile = promisify(fs.copyFile);

module.exports = async function () {
  const buildDir = `${__dirname}/../../../build/wasm`;

  await execp('mvn -B clean install', { cwd: __dirname });

  await copyFile(`${__dirname}/target/wasm/output.wasm`, `${buildDir}/wheel-part-java.wasm`);
  await copyFile(`${__dirname}/wasm-loader.js`, `${buildDir}/wheel-part-java.wasm-loader.js`);
};