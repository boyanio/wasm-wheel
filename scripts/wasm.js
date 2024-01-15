const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const execp = require('./execp');

const readdir = promisify(fs.readdir);
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

const buildWheelPart = async (lang) => {
  console.log(`\nBuilding ${lang} wheel part ...`);

  await buildDocker(lang);
};

const buildDocker = async (lang) => {
  const langDir = path.resolve(langsDir, lang);
  if (await exists(path.resolve(langDir, 'Dockerfile'))) {
    const dockerBuildCmd = `docker build -t wheel-part-${lang}:latest .`;
    await execp(dockerBuildCmd, { cwd: langDir });

    const dockerRunCmd = `docker run --rm -v ${langDir}:/tmp wheel-part-${lang}:latest cp -r ../output ../tmp`;
    await execp(dockerRunCmd, { cwd: langDir });
  }
};

const buildAllWheelParts = async () => {
  console.log('\nBuilding all wheel parts...');

  const langs = await readdir(langsDir);
  for (const lang of langs) {
    await buildWheelPart(lang);
  }
};

const buildAll = async () => {
  await cleanBuildWasmDir();
  await buildAllWheelParts();
};

const build = async () => {
  await createBuildWasmDir();
  if (process.argv.length > 2) {
    await buildWheelPart(process.argv.slice(2));
  } else {
    await buildAll();
  }
};

build();
