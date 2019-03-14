FROM node:8 AS wheel-part-assemblyscript

WORKDIR /work
COPY src/langs/assemblyscript .

RUN npm i npm@latest -g && \
    npm install

RUN mkdir ../output && \
    node_modules/.bin/asc wheel-part.ts \
        --baseDir ./ \
        --binaryFile ../output/wheel-part-assemblyscript.wasm \
        --importMemory \
        --validate \
        -O3z
