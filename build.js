const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const crypto = require('crypto');

const readdir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);
const exists = promisify(fs.exists);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

const buildDir = `${__dirname}/build`;
const buildWasmDir = `${buildDir}/wasm`;
const langDir = `${__dirname}/src/langs`;

const generateFileHash = (filePath) => {
  return new Promise(resolve => {
    const hash = crypto.createHash('sha1');
    hash.setEncoding('hex');

    const fileStream = fs.createReadStream(filePath);

    fileStream.on('end', () => {
      hash.end();
      resolve(hash.read().substring(0, 10));
    });

    // read all file and pipe it (write it) to the hash object
    fileStream.pipe(hash);
  });
};

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

  const loaders = [];
  const langs = await readdir(langDir);
  for (const lang of langs) {
    const loaderWebPath = `wasm/wheel-part-${lang}.wasm-loader.js`;
    const loaderHash = await generateFileHash(`build/${loaderWebPath}`);
    loaders.push(`${loaderWebPath}?v=${loaderHash}`);
  }

  await writeFile(`${buildDir}/wheel-parts.json`, JSON.stringify({ loaders }));
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
  await buildMetadata();
  await createBuildWasmDir();
  await cleanBuildWasmDir();
  await buildAllWheelParts();
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
