const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { createHash } = require('./createHash');
const execp = require('./execp');

const readdir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);
const exists = promisify(fs.exists);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

const rootDir = path.resolve(__dirname, '../');
const buildWasmDir = path.resolve(rootDir, 'build/wasm');
const langsDir = path.resolve(rootDir, 'src/langs');

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
    const fileHash = await createHash(path.resolve(buildWasmDir, file));
    fileHashMap[file] = fileHash;
  }

  await writeFile(
    path.resolve(buildWasmDir, 'metadata.json'),
    JSON.stringify({ fileHashMap }, null, 2));
};

const buildWheelPart = async (lang) => {
  console.log(`\nBuilding ${lang} wheel part ...`);

  await buildDocker(lang);
  await buildLoader(lang);
};

const buildDocker = async (lang) => {
  const langDir = path.resolve(langsDir, lang);

  const dockerBuildCmd = `docker build -t wheel-part-${lang}:latest .`;
  await execp(dockerBuildCmd, { cwd: langDir });

  const dockerRunCmd = `docker run --rm -v ${langDir}:/tmp wheel-part-${lang}:latest cp -r ../output ../tmp`;
  await execp(dockerRunCmd, { cwd: langDir });
};

const buildLoader = async (lang) => {
  console.log(`\nBuilding ${lang} wheel part loader ...`);

  const buildFile = path.resolve(langsDir, `${lang}/build.js`);
  const build = require(buildFile);
  await build(buildWasmDir);
};

const buildLoaders = async () => {
  console.log('\nBuilding wheel part loaders...');

  const langs = await readdir(langsDir);
  for (const lang of langs) {
    await buildLoader(lang);
  }
};

const buildAllWheelParts = async () => {
  console.log('\nBuilding all wheel parts...');

  const langs = await readdir(langsDir);
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
