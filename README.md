# The Wheel of WebAssembly

[![Build Status](https://travis-ci.org/boyanio/wasm-wheel.svg?branch=master)](https://travis-ci.org/boyanio/wasm-wheel)

The _Wheel of WebAssembly_ is a project aiming to show the diversity of languages that compile to WebAssembly. My initial idea was to define two functions in each language:

- `name()` - returning the name of the language. This is used to render each part of the wheel.
- `feelingLucky()` - returning a random integer between 1 and 100. This is used when the wheel is spun.

In theory, when compiling each language, the output wasm file should be almost identical. In practice, this is not the case. As many of the compilers are still very experimental, these two functions cannot be defined in all the languages. Some have issues with generating a random number, so I import JavaScript's `Math.random()` to help them. Others cannot handle strings properly. WebAssembly defines only numeric types and strings are supposed to be put in the linear memory and accessed via a pointer from JavaScript.

![Wheel of WebAssembly screenShot](/assets/wasm-wheel-screenshot.jpg)

## Supported languages

- C / C++
- C#
- AssemblyScript
- Rust
- Java
- Kotlin
- Go
- PHP
- Python

## Getting started

You need Docker to build each wheel part. You need to create a [self-signed certificate](https://gist.github.com/elklein96/a15090f35a41e16bdc8574a7fb81e119) for localhost.

```bash
npm i
npm run wasm
npm start
```

You can then access the site on `http://localhost:8080`.

You can re-build individual wheel parts by running

```bash
npm run wasm -- [lang]
```

## Wheel parts

Each wheel part represents a language that can be compiled to WebAssembly. My initial idea was to use toolchain to compile each source automatically, but this turned out to be a bit more complex. That is why I am putting here how each source can be compiled individually.

### C / C++

Compiled by [emscripten](https://emscripten.org).

### C#

You would either need [Mono](http://www.mono-project.com/docs/) or Visual Studio 2017+ installed on your machine to compile the source. Although Mono has an [example](http://www.mono-project.com/news/2017/08/09/hello-webassembly/) of compiling C# directly to WebAssembly, the set-up is a bit more complicated. That is why I use Steve Sanderson's initial adjustment of [DotNetAnywhere](https://github.com/boyanio/DotNetAnywhere) to interpret .NET into the browser. You would also need [emscripten](https://kripken.github.io/emscripten-site/docs/getting_started/downloads.html) >= 1.38.12 to compile DotNetAnywhere's interpreter to WebAssembly.

### AssemblyScript

[AssemblyScript](https://www.npmjs.com/package/assemblyscript) defines a subset of TypeScript that can be compiled to WebAssembly.

### Rust

You have to install the Rust toolchain by following these [instructions](https://www.rust-lang.org/en-US/install.html). Afterwards you need to add the wasm32 target.

```bash
rustup update
rustup target add wasm32-unknown-unknown
```

### Java

In order to compile Java into WebAssembly, I use [TeaVM](http://teavm.org/). The only thing you need is Maven - it will install its dependencies afterwards. You obviously need Java SDK as well.

### Kotlin

[Kotlin/Native](https://github.com/JetBrains/kotlin-native/) is used to compile Kotlin to WebAssembly. Compiling Kotlin to native restricts you from importing Java libraries. In order to generate random numbers, one may use C instead (as in the C wheel part), but this requires further configuration using the `cinterop` tool. I think it is easier just to import the JavaScript one.

### Go

[Go 1.14](https://tip.golang.org/doc/go1.14) ships experimental WebAssembly support. The communication from JavaScript to Go works with callbacks, which made me change all other calls to use promises. The output file is quite large so far (~ 1.5MB), but this is already being [addressed](https://github.com/golang/go/issues/6853).

### PHP

The PHP interpreter is [compiled](https://github.com/oraoto/pib/) to WebAssembly and then using the wrapper function `pib_eval` we can evaluate PHP code, which gets printed on the console.

### Python

[Pyodide](https://github.com/iodide-project/pyodide) brings the Python 3.8 runtime to the browser via WebAssembly, along with the Python scientific stack.

## Questions & contribution

You can follow me on Twitter with [@boyanio](https://twitter.com/boyanio) and ask me questions you might have. You can also open an issue here on GitHub. Pull requests are welcome, too :-)
