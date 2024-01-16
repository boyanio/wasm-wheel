const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const execp = require('./execp');

const readdir = promisify(fs.readdir);
const exists = promisify(fs.exists);
const rmdir = promisify(fs.rmdir);

const rootDir = path.resolve(__dirname, '../');
const langsDir = path.resolve(rootDir, 'src/langs');

const buildWheelPart = async (lang) => {
  console.log(`\nBuilding ${lang} wheel part ...`);

  const langDir = path.resolve(langsDir, lang);
  if (await exists(path.resolve(langDir, 'Dockerfile'))) {
    const outputDir = path.join(langDir, '/output');
    if (await exists(outputDir)) {
      await rmdir(outputDir, { recursive: true });
    }

    const dockerBuildCmd = `docker build -t wheel-part-${lang}:latest .`;
    await execp(dockerBuildCmd, { cwd: langDir });

    const dockerRunCmd = `docker run --rm -v ${langDir}:/tmp wheel-part-${lang}:latest cp -r ../output ../tmp`;
    await execp(dockerRunCmd, { cwd: langDir });
  } else {
    console.warn(`No Dockerfile found for ${lang} wheel part.`);
  }
};

const buildAllWheelParts = async () => {
  console.log('\nBuilding all wheel parts...');

  const langs = await readdir(langsDir);
  for (const lang of langs) {
    await buildWheelPart(lang);
  }
};

const build = async () => {
  if (process.argv.length > 2) {
    await buildWheelPart(process.argv[2]);
  } else {
    await buildAllWheelParts();
  }
};

build();
