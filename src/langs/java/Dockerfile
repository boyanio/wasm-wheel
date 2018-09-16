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