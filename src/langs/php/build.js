const fs = require('fs');
const os = require('os');
const { promisify } = require('util');
const execp = require('../../execp');

const copyFile = promisify(fs.copyFile);
const exists = promisify(fs.exists);

const buildPib = async (buildDir) => {

  const isLinux = os.type() === 'Linux';
  if (!isLinux)
    throw 'Building the PIB on Windows is not supported for now. Use the Docker build instead';

  const pibDir = `${__dirname}/pib`;
  if (!(await exists(pibDir))) {
    await execp('git clone https://github.com/boyanio/pib.git', { cwd: __dirname });
  }
  
  await execp('chmod +x build.sh', { cwd: pibDir });
  await execp(`${pibDir}/build.sh`, { cwd: pibDir });

  await copyFile(`${pibDir}/php.js`, `${buildDir}/php.js`);
  await copyFile(`${pibDir}/php.wasm`, `${buildDir}/php.wasm`);
  await copyFile(`${pibDir}/php.data`, `${buildDir}/php.data`);
};

const buildWasm = async (buildDir) => {
  await buildPib(buildDir);
  await copyFile(`${__dirname}/wheel-part.php`, `${buildDir}/wheel-part-php.txt`);
};

const buildLoader = async (buildDir) => {
  await copyFile(`${__dirname}/wasm-loader.js`, `${buildDir}/wheel-part-php.wasm-loader.js`);
};

exports.buildLoader = buildLoader;
exports.buildWasm = buildWasm;