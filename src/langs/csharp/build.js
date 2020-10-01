const fs = require('fs');
const { promisify } = require('util');

const copyFile = promisify(fs.copyFile);

module.exports = async (buildDir) => {
  await copyFile(`${__dirname}/output/corlib.dll`, `${buildDir}/corlib.dll`);
  await copyFile(
    `${__dirname}/output/wheel-part-csharp.dll`,
    `${buildDir}/wheel-part-csharp.dll`
  );
  await copyFile(`${__dirname}/output/dna.js`, `${buildDir}/dna.js`);
  await copyFile(`${__dirname}/output/dna.wasm`, `${buildDir}/dna.wasm`);
  await copyFile(
    `${__dirname}/wasm-loader.js`,
    `${buildDir}/wheel-part-csharp.wasm-loader.js`
  );
};
