const fs = require('fs');
const { promisify } = require('util');

const copyFile = promisify(fs.copyFile);

module.exports = async (buildDir) => {
  await copyFile(`${__dirname}/output/php.data`, `${buildDir}/php.data`);
  await copyFile(`${__dirname}/output/php.wasm`, `${buildDir}/php.wasm`);
  await copyFile(`${__dirname}/output/php.js`, `${buildDir}/php.js`);
  await copyFile(
    `${__dirname}/output/wheel-part-php.txt`,
    `${buildDir}/wheel-part-php.txt`
  );
  await copyFile(
    `${__dirname}/wasm-loader.js`,
    `${buildDir}/wheel-part-php.wasm-loader.js`
  );
};
