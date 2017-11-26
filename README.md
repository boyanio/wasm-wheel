# The Wheel of WASM

The Wheel of WASM is a project aiming to show the diversity of languages that compile to WebAssembly.

## Supported languages

- C / C++

## Building

```
$> git clone https://github.com/boyanio/wasm-wheel.git
$> cd wasm-wheel
$> npm install
```

### Compiling wheel parts

Each wheel part represents a language that can be compiled to WebAssembly. My initial idea was to use toolchain to compile each source automatically, but this turned out to be a bit more complex. That is why I am putting here how each source can be compiled individually.

#### C / C++

The easiest (cleanest) way to compile it is by [https://wasdk.github.io/WasmFiddle/?aixkf](WasmFiddle).

## Running

The following command will compile all sources to WASM and set up a HTTP server on port 8080. You can then access the site on `http://localhost:8080`.

```
$> gulp
```