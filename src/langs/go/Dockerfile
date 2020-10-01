FROM golang:1.14 AS wheel-part-go

WORKDIR /work
COPY . .

RUN mkdir ../output && \
    GOOS=js GOARCH=wasm go build -o ../output/wheel-part-go.wasm wheel-part.go