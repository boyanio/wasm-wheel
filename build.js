const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { createHash } = require('./scripts/createHash');

const readdir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);
const exists = promisify(fs.exists);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

const buildDir = `${__dirname}/build`;
const buildWasmDir = `${buildDir}/wasm`;
const langDir = `${__dirname}/src/langs`;

const createBuildWasmDir = async () => {
  if (!(await exists(buildWasmDir))) {
    console.log('\nCreating the build wasm directory...');
    await mkdir(buildWasmDir);
  }
};

const cleanBuildWasmDir = async () => {
  if (await exists(buildWasmDir)) {
    console.log('\nCleaning the build wasm directory...');

    const files = await readdir(buildWasmDir);
    for (const file of files) {
      await unlink(path.join(buildWasmDir, file));
    }
  }
};

const buildMetadata = async () => {
  console.log('\nCreating the metadata file for all wheel parts...');

  const fileHashMap = {};
  const buildWasmFiles = await readdir(buildWasmDir);
  for (const file of buildWasmFiles) {
    const fileHash = await createHash(`${buildWasmDir}/${file}`);
    fileHashMap[file] = fileHash;
  }

  await writeFile(`${buildWasmDir}/metadata.json`, JSON.stringify({ fileHashMap }, null, 2));
};

const requireWheelPartBuildExports = async (lang) => {
  if (!(await exists(`${langDir}/${lang}/build.js`))) {
    throw `Cannot find build.js for ${lang} wheel part`;
  }

  return require(`./src/langs/${lang}/build`);
};

const buildWheelPart = async (lang) => {
  console.log(`\nBuilding ${lang} wheel part ...`);

  const { buildWasm, buildLoader } = await requireWheelPartBuildExports(lang);
  await buildWasm(buildWasmDir);
  await buildLoader(buildWasmDir);
};

const buildLoader = async (lang) => {
  console.log(`\nBuilding ${lang} wheel part loader ...`);

  const { buildLoader } = await requireWheelPartBuildExports(lang);
  await buildLoader(buildWasmDir);
};

const buildLoaders = async () => {
  console.log('\nBuilding wheel part loaders...');

  const langs = await readdir(langDir);
  for (const lang of langs) {
    await buildLoader(lang);
  }
};

const buildAllWheelParts = async () => {
  console.log('\nBuilding all wheel parts...');

  const langs = await readdir(langDir);
  for (const lang of langs) {
    await buildWheelPart(lang);
  }
};

const buildWithArgs = async (args) => {
  for (let arg of args) {
    switch (arg) {
    case 'metadata':
      await buildMetadata();
      break;

    case 'loaders':
      await buildLoaders();
      break;

    default:
      await buildWheelPart(arg);
      break;
    }
  }
};

const buildAll = async () => {
  await cleanBuildWasmDir();
  await buildAllWheelParts();
  await buildMetadata();
};

const build = async () => {
  await createBuildWasmDir();
  if (process.argv.length > 2) {
    await buildWithArgs(process.argv.slice(2));
  } else {
    await buildAll();
  }
};

build();
