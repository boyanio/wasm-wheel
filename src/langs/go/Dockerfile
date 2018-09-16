FROM golang:1.11 AS wheel-part-go

WORKDIR /work
COPY src/langs/go .

RUN mkdir ../output && \
    GOOS=js GOARCH=wasm go build -o ../output/wheel-part-go.wasm wheel-part.go