# The Wheel of WebAssembly

The _Wheel of WebAssembly_ is a project aiming to show the diversity of languages that compile to WebAssembly. My initial idea was to define two functions in each language:

- `name()` - returning the name of the language. This is used to render each part of the wheel.
- `feelingLucky()` - returning a random integer between 1 and 100. This is used when the wheel is turned.

In theory, when compiling each language, the output wasm file should be almost identical. In practice, this is not the case. As many of the compilers are still very experimental, these two functions cannot be definen in all the languages. Some have issues with generating a random number, so I import JavaSript's `Math.random()` to help them. Others cannot handle strings properly. WebAssembly defines only numeric types and strings are suppsed to be put in the linear memory and accessed via a pointer from JavaScript.

## Supported languages

- C / C++
- C#
- TypeScript
- Rust
- Java

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

#### TypeScript

Compiled by [assemblyscript](https://www.npmjs.com/package/assemblyscript).

#### Rust

You have to install the Rust toolchain by following these [instructions](https://www.rust-lang.org/en-US/install.html). Afterwards you need to install the nightly toolchain in order to compile to WebAssembly using the experimental LLVM compiler.

```
$> rustup update nightly
$> rustup default nightly
$> rustup target add wasm32-unknown-unknown
```

#### Java

In order to compile Java into WebAssembly, I use [TeaVM](http://teavm.org/). The only thing you need is Maven - it will install its depedencies afterwards. You obviously need Java SDK as well.

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