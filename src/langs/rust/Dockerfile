FROM rust:1.32 AS wheel-part-rust

WORKDIR /work
COPY src/langs/rust .

RUN rustup update && \
    rustup target add wasm32-unknown-unknown && \
    mkdir ../output && \
    rustc --target wasm32-unknown-unknown --crate-type=cdylib -o ../output/wheel-part-rust.wasm wheel-part.rs && \
    rm -rf /root/.rustup/*