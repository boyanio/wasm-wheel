FROM trzeci/emscripten:sdk-tag-1.39.4-64bit AS wheel-part-c

WORKDIR /work
COPY src/langs/c .

RUN mkdir ../output && \
  emcc -Os wheel-part.c -s EXPORTED_FUNCTIONS="['_name','_feelingLucky']" -s ERROR_ON_UNDEFINED_SYMBOLS=0 -o ../output/wheel-part-c.wasm