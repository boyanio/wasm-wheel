FROM openjdk:8-jdk AS wheel-part-kotlin

WORKDIR /work
COPY src/langs/kotlin .

ENV KOTLIN_NATIVE_VERSION="0.9.3"

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