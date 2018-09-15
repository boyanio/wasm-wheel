const fs = require('fs');
const { promisify } = require('util');
const execp = require('../../execp');

const copyFile = promisify(fs.copyFile);

const buildWasm = async (buildDir) => {
  const detectBuildCmd = async () => {
    const monoCompiler = 'mcs';
    const vsCompiler = 'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc';

    let useMono = false;
    try {
      await execp(`${monoCompiler} --about`);
      useMono = true;
      console.log('Mono is present on this machine, using mcs');
    } catch (e) {
      console.log('Mono seems to be missing on this machine. Using csc instead');
    }

    return useMono ?
      `${monoCompiler} -target:library -out:"${buildDir}/wheel-part-csharp.dll" "${__dirname}/wheel-part.cs"` :
      `${vsCompiler} /nologo /target:library /out:"${buildDir}\\wheel-part-csharp.dll" "${__dirname}\\wheel-part.cs"`;
  };

  const cmd = await detectBuildCmd();
  await execp(cmd);
};

const buildLoader = async (buildDir) => {
  await copyFile(`${__dirname}/wasm-loader.js`, `${buildDir}/wheel-part-csharp.wasm-loader.js`);
  await copyFile(`${__dirname}/dna.js`, `${buildDir}/wheel-part-csharp.js`);
  await copyFile(`${__dirname}/dna.wasm`, `${buildDir}/wheel-part-csharp.wasm`);
  await copyFile(`${__dirname}/corlib.dll`, `${buildDir}/corlib.dll`);
};

module.exports = async (buildDir) => {
  await buildWasm(buildDir);
  await buildLoader(buildDir);
};