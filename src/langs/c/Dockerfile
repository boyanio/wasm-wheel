FROM node:8 AS wheel-part-c

WORKDIR /work
COPY src/langs/c .

RUN npm i npm@latest -g && \
    npm install

RUN mkdir ../output && \
    node_modules/.bin/wa compile -o ../output/wheel-part-c.wasm wheel-part.c