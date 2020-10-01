FROM node:8 AS wheel-part-assemblyscript

WORKDIR /work
COPY . .

RUN npm i npm@latest -g && \
        npm ci

RUN mkdir ../output && \
        node_modules/.bin/asc wheel-part.ts \
        --baseDir ./ \
        --binaryFile ../output/wheel-part-assemblyscript.wasm \
        --importMemory \
        --validate \
        --runtime none \
        -O3z
