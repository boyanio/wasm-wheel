# Build C wheel part
FROM node:8 AS wheel-part-c

WORKDIR /work
COPY src/langs/c .

RUN npm i npm@latest -g && \
    npm install

RUN mkdir ../output && \
    node_modules/.bin/wa compile -o ../output/wheel-part-c.wasm wheel-part.c

# Build AssemblyScript wheel part
FROM node:8 AS wheel-part-assemblyscript

WORKDIR /work
COPY src/langs/assemblyscript .

RUN npm i npm@latest -g && \
    npm install

RUN mkdir ../output && \
    node_modules/.bin/asc wheel-part.ts \
        --baseDir ./ \
        --binaryFile ../output/wheel-part-assemblyscript.wasm \
        --importMemory \
        --optimize \
        --measure \
        --validate \
        --use 'Math=JSMath'

# Build Java wheel part
FROM openjdk:8-jdk AS wheel-part-java

WORKDIR /work
COPY src/langs/java .

RUN apt-get update && \
    apt-get install -y maven && \
    apt-get clean

RUN mvn install && \
    mkdir ../output && \
    cp target/wasm/output.wasm ../output/wheel-part-java.wasm && \
    rm -rf target/* && \
    rm -rf /root/.m2/*

# Build Kotlin wheel part
FROM openjdk:8-jdk AS wheel-part-kotlin

WORKDIR /work
COPY src/langs/kotlin .

ENV KOTLIN_NATIVE_VERSION="0.8.2"

RUN apt-get update && \
    apt-get install -y ca-certificates wget && \
    wget --progress=bar "https://github.com/JetBrains/kotlin-native/releases/download/v${KOTLIN_NATIVE_VERSION}/kotlin-native-linux-${KOTLIN_NATIVE_VERSION}.tar.gz" && \
    tar xzf "kotlin-native-linux-${KOTLIN_NATIVE_VERSION}.tar.gz" && \
    rm -f "kotlin-native-linux-${KOTLIN_NATIVE_VERSION}.tar.gz" && \
    apt-get remove -y wget && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir target && \
    "kotlin-native-linux-${KOTLIN_NATIVE_VERSION}/bin/konanc" wheel-part.kt -target wasm32 -o target/output.wasm -verbose && \
    mkdir ../output && \
    cp target/output.wasm ../output/wheel-part-kotlin.wasm && \
    rm -rf /root/.konan/* && \
    rm -rf target/*

# Build Go wheel part
FROM golang:1.11 AS wheel-part-go

WORKDIR /work
COPY src/langs/go .

RUN mkdir ../output && \
    GOOS=js GOARCH=wasm go build -o ../output/wheel-part-go.wasm wheel-part.go

# Build C# wheel part
FROM mono:5.14 AS wheel-part-csharp

WORKDIR /work
COPY src/langs/csharp .

RUN mkdir ../output && \
    mcs -target:library -out:../output/wheel-part-csharp.dll wheel-part.cs

# Build Rust wheel part
FROM rust:1.29.0 AS wheel-part-rust

WORKDIR /work
COPY src/langs/rust .

RUN rustup update && \
    rustup target add wasm32-unknown-unknown && \
    mkdir ../output && \
    rustc --target wasm32-unknown-unknown --crate-type=cdylib -o ../output/wheel-part-rust.wasm wheel-part.rs && \
    rm -rf /root/.rustup/*

# Build the app
FROM node:8-alpine

WORKDIR /app
COPY . .

RUN npm i npm@latest -g && \
    npm install

RUN npm run build -- metadata loaders

COPY --from=wheel-part-c output build/wasm
COPY --from=wheel-part-assemblyscript output build/wasm
COPY --from=wheel-part-java output build/wasm
COPY --from=wheel-part-kotlin output build/wasm
COPY --from=wheel-part-go output build/wasm
COPY --from=wheel-part-csharp output build/wasm
COPY --from=wheel-part-rust output build/wasm

EXPOSE 8080
CMD [ "npm", "run", "serve" ]