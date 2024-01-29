FROM kassany/bookworm-ziglang:latest AS wheel-part-zig

WORKDIR /work
COPY . .

RUN mkdir ../output && \
  zig build -Drelease && mv zig-out/bin/wheel-part-zig.wasm ../output/
