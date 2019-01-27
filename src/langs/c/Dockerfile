FROM trzeci/emscripten:sdk-tag-1.38.25-64bit AS wheel-part-c

WORKDIR /work
COPY src/langs/c .

RUN mkdir ../output && \
    emcc -Os wheel-part.c -o ../output/wheel-part-c.wasm -s SIDE_MODULE=1