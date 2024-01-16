FROM rust:1.75 AS wheel-part-rust

WORKDIR /work
COPY Cargo.toml .
COPY wheel-part.rs .

RUN rustup update && \
  rustup target add wasm32-wasi && \
  mkdir ../output && \
  cargo build --target wasm32-wasi --release && \
  cp target/wasm32-wasi/release/wheel_part_rust.wasm ../output/wheel-part-rust.wasm
