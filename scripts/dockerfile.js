const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const rootDir = path.resolve(__dirname, '../');
const langDir = path.resolve(rootDir, 'src/langs');

const buildDockerfile = async() => {
  const fileOps = { encoding: 'utf-8' };
  let dockerfile = '';
  let dockerfileCopyWheelParts = '';
  const langs = await readdir(langDir);
  for (const lang of langs) {
    const langDockerfilePath = path.resolve(langDir, lang, 'Dockerfile');
    const langDockerfile = await readFile(langDockerfilePath, fileOps);
    dockerfile += `# Build the ${lang} wheel part\n${langDockerfile}\n\n`;
    dockerfileCopyWheelParts += `COPY --from=wheel-part-${lang} output build/wasm\n`;
  }

  const dockerfileBuildPath = path.resolve(rootDir, 'Dockerfile.build');
  const dockerfileFinalPath = path.resolve(rootDir, 'Dockerfile');
  const buildDockerfile = await readFile(dockerfileBuildPath, fileOps);
  dockerfile += `${buildDockerfile.replace('COPY-WHEEL-PARTS', dockerfileCopyWheelParts)}`;
  await writeFile(dockerfileFinalPath, dockerfile, fileOps);
};

buildDockerfile();