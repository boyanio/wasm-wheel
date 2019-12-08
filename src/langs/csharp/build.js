const fs = require('fs');
const os = require('os');
const { promisify } = require('util');
const execp = require('../../../scripts/execp');

const copyFile = promisify(fs.copyFile);
const exists = promisify(fs.exists);

const buildDotNetAnywhereWasm = async (buildDir) => {
  const nativeDir = `${__dirname}/DotNetAnywhere/native`;
  const isLinux = os.type() === 'Linux';
  if (isLinux) {
    await execp(`chmod +x ${nativeDir}/build.sh`, { cwd: nativeDir });
    await execp(`${nativeDir}/build.sh`, { cwd: nativeDir });
  } else {
    await execp(`${nativeDir}/build.cmd`, { cwd: nativeDir });
  }

  const outputDir = `${__dirname}/DotNetAnywhere/build`;
  await copyFile(`${outputDir}/dna.js`, `${buildDir}/dna.js`);
  await copyFile(`${outputDir}/dna.wasm`, `${buildDir}/dna.wasm`);
};

const buildDotNetAnywhereCorlib = async (buildDir) => {
  const csprojDir = `${__dirname}/DotNetAnywhere/corlib`;
  await execp('msbuild /t:Restore corlib.csproj', { cwd: csprojDir });
  await execp('msbuild /p:Configuration=Release corlib.csproj', { cwd: csprojDir });
  await copyFile(`${csprojDir}/bin/Release/netstandard1.3/corlib.dll`, `${buildDir}/corlib.dll`);
};

const buildDotNetAnywhere = async (buildDir) => {
  const dnaDir = `${__dirname}/DotNetAnywhere`;
  if (!(await exists(dnaDir))) {
    await execp('git clone https://github.com/boyanio/DotNetAnywhere.git', { cwd: __dirname });
  }

  await buildDotNetAnywhereCorlib(buildDir);
  await buildDotNetAnywhereWasm(buildDir);
};

const buildWheelPartDll = async (buildDir) => {
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

const buildWasm = async (buildDir) => {
  await buildDotNetAnywhere(buildDir);
  await buildWheelPartDll(buildDir);
};

const buildLoader = async (buildDir) => {
  await copyFile(`${__dirname}/wasm-loader.js`, `${buildDir}/wheel-part-csharp.wasm-loader.js`);
};

exports.buildLoader = buildLoader;
exports.buildWasm = buildWasm;