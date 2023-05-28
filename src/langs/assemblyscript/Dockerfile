FROM node:18.16.0 AS wheel-part-assemblyscript

WORKDIR /work
COPY . .

RUN npm i npm@9.6.4 -g && \
    npm ci --no-fund --no-audit

RUN mkdir ../output && \
    node_modules/.bin/asc wheel-part.ts \
    wheel-part.ts \
    -o ../output/wheel-part-assemblyscript.wasm \
    -O3z
