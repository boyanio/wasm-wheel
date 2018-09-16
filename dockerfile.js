const fs = require('fs');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const langDir = `${__dirname}/src/langs`;

const buildDockerfile = async() => {
  const fileOps = { encoding: 'utf-8' };
  let dockerfile = '';
  let dockerfileCopyWheelParts = '';
  const langs = await readdir(langDir);
  for (const lang of langs) {
    const langDockerfile = await readFile(`${langDir}/${lang}/Dockerfile`, fileOps);
    dockerfile += `# Build the ${lang} wheel part\n${langDockerfile}\n\n`;
    dockerfileCopyWheelParts += `COPY --from=wheel-part-${lang} output build/wasm\n`;
  }

  const buildDockerfile = await readFile(`${__dirname}/Dockerfile.build`, fileOps);
  dockerfile += `${buildDockerfile.replace('COPY-WHEEL-PARTS', dockerfileCopyWheelParts)}`;
  await writeFile(`${__dirname}/Dockerfile`, dockerfile, fileOps);
};

buildDockerfile();