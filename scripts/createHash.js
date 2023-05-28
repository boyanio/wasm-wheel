const fs = require('fs');
const crypto = require('crypto');

exports.createHash = function createHash(path) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(path);
    stream.on('error', (err) => reject(err));
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
};
