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

const createOrCleanBuildWasmDir = async () => {
  if (await exists(buildWasmDir)) {
    console.log('Cleaning the build wasm directory...');

    const files = await readdir(buildWasmDir);
    for (const file of files) {
      await unlink(path.join(buildWasmDir, file));
    }
  } else {
    console.log('Creating the build wasm directory...');
    await mkdir(buildWasmDir);
  }
};

const createMetadataFile = async () => {
  console.log('Creating the metdata file for all wheel parts...');

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

const buildWheelPart = async (lang) => {
  console.log(`Building ${lang} wheel part ...`);

  if (!(await exists(`${langDir}/${lang}/build.js`))) {
    throw `Cannot find build.js for ${lang} wheel part`;
  }

  const buildFn = require(`./src/langs/${lang}/build`);
  await buildFn();
};

const buildAllWheelParts = async () => {
  console.log('Building all wheel parts...');

  const langs = await readdir(langDir);
  for (const lang of langs) {
    await buildWheelPart(lang);
  }
};

const build = async () => {
  if (process.argv.length > 2) {
    const wheelPartToBuild = process.argv[2];
    await buildWheelPart(wheelPartToBuild);
  } else {
    await createMetadataFile();

    await createOrCleanBuildWasmDir();

    await buildAllWheelParts();
  }
};

build();