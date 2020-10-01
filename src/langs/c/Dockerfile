FROM trzeci/emscripten:1.39.11-upstream AS wheel-part-c

WORKDIR /work
COPY . .

RUN mkdir ../output && \
  emcc -Os wheel-part.c -s EXPORTED_FUNCTIONS="['_name','_feelingLucky']" -s ERROR_ON_UNDEFINED_SYMBOLS=0 -o ../output/wheel-part-c.wasm