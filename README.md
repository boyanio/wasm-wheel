# The Wheel of WebAssembly

The _Wheel of WebAssembly_ is a project aiming to show the diversity of languages that compile to WebAssembly. My initial idea was to define two functions in each language:

- `name()` - returning the name of the language. This is used to render each part of the wheel.
- `feelingLucky()` - returning a random integer between 1 and 100. This is used when the wheel is spinned.

In theory, when compiling each language, the output wasm file should be almost identical. In practice, this is not the case. As many of the compilers are still very experimental, these two functions cannot be definen in all the languages. Some have issues with generating a random number, so I import JavaSript's `Math.random()` to help them. Others cannot handle strings properly. WebAssembly defines only numeric types and strings are suppsed to be put in the linear memory and accessed via a pointer from JavaScript.

## Supported languages

- C / C++
- C#
- AssemblyScript
- Rust
- Java
- Kotlin

## Requirements

- Node 8.9.1 (could work with a lower version, too, but this is what I have installed)
- emscripten (SDK 1.37.22)

Furthermore, each language has further requirements.

### Compiling wheel parts

Each wheel part represents a language that can be compiled to WebAssembly. My initial idea was to use toolchain to compile each source automatically, but this turned out to be a bit more complex. That is why I am putting here how each source can be compiled individually.

#### C / C++

Compiled by [webassembly](https://www.npmjs.com/package/webassembly).

#### C#

You would either need [Mono](http://www.mono-project.com/docs/) or Visual Studio 2017+ installed on your machine to compile the source. Although, Mono has an [example](http://www.mono-project.com/news/2017/08/09/hello-webassembly/) of compiling C# directly to WebAssembly, the set-up is a bit more complicated. That is why I use Steve Sanderson's example of [DotNetAnywhere](https://github.com/SteveSanderson/Blazor/tree/150aeeb0965bd4b7a24412d239d836016c6b4238) to load a .NET DLL into the browser.

#### AssemblyScript

[AssemblyScript](https://www.npmjs.com/package/assemblyscript) defines a subset of TypeScript that it compiles to WebAssembly.

#### Rust

You have to install the Rust toolchain by following these [instructions](https://www.rust-lang.org/en-US/install.html). Afterwards you need to add the wasm32 target.

```
$> rustup update
$> rustup target add wasm32-unknown-unknown
```

#### Java

In order to compile Java into WebAssembly, I use [TeaVM](http://teavm.org/). The only thing you need is Maven - it will install its depedencies afterwards. You obviously need Java SDK as well.

#### Kotlin

[Kotlin/Native](https://github.com/JetBrains/kotlin-native/) v0.7.1 is used to compile Kotlin to WebAssembly. Compiling Kotlin to native restricts you from importing Java libraries. In order to generate random numbers, one may use C instead (as in the C wheel part), but this requires further configuration using the `cinterop` tool. I think it is easier just to import the JavaScript one.

As I don't need the `main` function, I tried specifying `-nomain` on the compiler, but it still throws an exception when initializing the WebAssembly module.

#### Go

[Go 1.11](https://github.com/golang/go/milestone/62?closed=1) will have support for WebAssembly. The version is not released yet, but one can find the beta one - [go1.11beta1](https://golang.org/dl/). This is the first version of the implementation, so it will definitely undergo further improvements in the future. The communication from JavaScript to Go works with callbacks, which made me change all other calls to use promises. The output file is very big, but it is already being [addressed](https://github.com/golang/go/issues/6853).

## Build

```
$> git clone https://github.com/boyanio/wasm-wheel.git
$> cd wasm-wheel
$> npm install
```

## Run

The following command will compile all sources to WASM and set up a HTTP server on port 8080. You can then access the site on `http://localhost:8080`.

```
$> gulp
```

## Questions & contribution

You can follow me on Twitter with [@boyanio](https://twitter.com/boyanio) and ask me questions you might have. You can also open an issue here on GitHub. Pull requests are welcome, too :-)
