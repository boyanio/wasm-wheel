# Compile DotNetAnywhere's corlib and the wheel part to CIL (.dll)
FROM mono:5.14 AS wheel-part-csharp-mono

WORKDIR /work

COPY src/langs/csharp .

RUN curl -SL https://github.com/boyanio/DotNetAnywhere/archive/master.tar.gz | tar xz && \
    mkdir ../output && \
    mcs -target:library -out:../output/wheel-part-csharp.dll wheel-part.cs && \
    msbuild /t:Restore ./DotNetAnywhere-master/corlib/corlib.csproj && \
    msbuild /p:Configuration=Release ./DotNetAnywhere-master/corlib/corlib.csproj && \
    cp ./DotNetAnywhere-master/corlib/bin/Release/netstandard1.3/corlib.dll ../output && \
    rm -rf ./DotNetAnywhere-master

# Compile DotNetAnywhere to WebAssembly
FROM trzeci/emscripten:sdk-tag-1.38.25-64bit AS wheel-part-csharp-wasm

WORKDIR /work

COPY src/langs/csharp .

RUN curl -SL https://github.com/boyanio/DotNetAnywhere/archive/master.tar.gz | tar xz && \
    chmod +x ./DotNetAnywhere-master/native/build.sh && \
    ./DotNetAnywhere-master/native/build.sh && \
    mkdir ../output && \
    mv ./DotNetAnywhere-master/build/dna.* ../output && \
    rm -rf ./DotNetAnywhere-master


FROM alpine:latest AS wheel-part-csharp

WORKDIR /output

COPY --from=wheel-part-csharp-mono output .
COPY --from=wheel-part-csharp-wasm output .