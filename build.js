const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
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
  console.log('\nCreating the metdata file for all wheel parts...');

  const wheelParts = [];
  const langs = await readdir(langDir);
  for (const lang of langs) {
    const wasmFileName = `wheel-part-${lang}.wasm`;
    const metaFile = path.join(langDir, `${lang}/meta.json`);
    const meta = await exists(metaFile) ?
      JSON.parse(await readFile(metaFile, 'utf8')) : {};

    wheelParts.push({
      fileName: wasmFileName,
      loader: meta.loader,
      name: meta.name
    });
  }

  await writeFile(`${buildDir}/wheel-parts.json`, JSON.stringify({ wheelParts }));
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
  if (buildLoader) {
    await buildLoader(buildWasmDir);
  }
};

const buildLoader = async (lang) => {
  const { buildLoader } = await requireWheelPartBuildExports(lang);
  if (buildLoader) {
    console.log(`\nBuilding ${lang} wheel part loader ...`);
    await buildLoader(buildWasmDir);
  } else {
    console.log(`\n${lang} wheel part does not have loader. Skipping`);
  }
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
      await createBuildWasmDir();
      await buildLoaders();
      break;

    default:
      await createBuildWasmDir();
      await buildWheelPart(arg);
      break;
    }
  }
};

const buildAll = async () => {
  await buildMetadata();
  await createBuildWasmDir();
  await cleanBuildWasmDir();
  await buildAllWheelParts();
};

const build = async () => {
  if (process.argv.length > 2) {
    await buildWithArgs(process.argv.slice(2));
  } else {
    await buildAll();
  }
};

build();