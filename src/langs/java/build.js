const fs = require('fs');
const { promisify } = require('util');
const execp = require('../../../scripts/execp');

const copyFile = promisify(fs.copyFile);

const buildWasm = async (buildDir) => {
  await execp('mvn -B clean install', { cwd: __dirname });
  await copyFile(`${__dirname}/target/wasm/output.wasm`, `${buildDir}/wheel-part-java.wasm`);
};

const buildLoader = async (buildDir) => {
  await copyFile(`${__dirname}/wasm-loader.js`, `${buildDir}/wheel-part-java.wasm-loader.js`);
};

exports.buildLoader = buildLoader;
exports.buildWasm = buildWasm;