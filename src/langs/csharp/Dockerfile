FROM mono:5.14 AS wheel-part-csharp

WORKDIR /work
COPY src/langs/csharp .

RUN mkdir ../output && \
    mcs -target:library -out:../output/wheel-part-csharp.dll wheel-part.cs