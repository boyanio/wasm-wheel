FROM kassany/bookworm-ziglang:0.11.0 AS wheel-part-zig

WORKDIR /work
COPY . .

RUN mkdir ../output && \
  zig build -Drelease && mv zig-out/bin/wheel-part-zig.wasm ../output/
