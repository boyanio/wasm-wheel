FROM rust:1.31 AS wheel-part-rust

WORKDIR /work
COPY . .

RUN rustup update && \
  rustup target add wasm32-unknown-unknown && \
  mkdir ../output && \
  rustc --target wasm32-unknown-unknown -C opt-level=z -C lto --crate-type=cdylib -o ../output/wheel-part-rust.wasm wheel-part.rs && \
  rm -rf /root/.rustup/*
