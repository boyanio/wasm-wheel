import PHP from './output/php';
import './output/php.data?wasm';
import './output/php.wasm?wasm';
import wheelPartSource from './wheel-part.php?raw';
import { dispatchWheelPartLoadedEvent } from '../../app/wheel-part-loader';

const promiseResolvers = {};
let lastPromiseId = 0;
let php = null;

const execPhpCode = (code) =>
  php.ccall('pib_eval', 'number', ['string'], [code]);

const phpOpts = {
  locateFile: (file) => `wasm/${file}`,
  postRun: [
    () => {
      const feelingLuckyPromiseFunc = () => {
        const promiseId = lastPromiseId++;

        return new Promise((resolve, reject) => {
          promiseResolvers[promiseId] = resolve;

          const code = `${wheelPartSource}\necho '${promiseId}:'.feelingLucky();\necho PHP_EOL;`;
          const ret = execPhpCode(code);
          if (ret !== 0) {
            delete promiseResolvers[promiseId];
            reject(`The PHP eval function returned ${ret}`);
          }
        });
      };
      dispatchWheelPartLoadedEvent('PHP', feelingLuckyPromiseFunc);
    },
  ],
  print: function (text) {
    if (arguments.length > 1) {
      text = Array.prototype.slice.call(arguments).join(' ');
    }

    const [promiseId, result] = text
      .split(':')
      .map((part) => parseInt(part, 10));
    promiseResolvers[promiseId](result);
    delete promiseResolvers[promiseId];
  },
};

php = PHP(phpOpts);
