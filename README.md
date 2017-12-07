# The Wheel of WASM

The Wheel of WASM is a project aiming to show the diversity of languages that compile to WebAssembly.

## Supported languages

- C / C++
- C#
- TypeScript

## Requirements

- Node 8.9.1 (could work with a lower version, too, but this is what I have installed)

## Build

```
$> git clone https://github.com/boyanio/wasm-wheel.git
$> cd wasm-wheel
$> npm install
```

### Compiling wheel parts

Each wheel part represents a language that can be compiled to WebAssembly. My initial idea was to use toolchain to compile each source automatically, but this turned out to be a bit more complex. That is why I am putting here how each source can be compiled individually.

#### C / C++

Compiled by [https://www.npmjs.com/package/webassembly](webassembly).

#### C#

This uses [https://github.com/SteveSanderson/Blazor/tree/150aeeb0965bd4b7a24412d239d836016c6b4238](DotNetAnywhere), where the compiled version is included in the repository. You need a C# compiler, though, in order to compile `wheel-part.cs`. I assume you have installed .NET Framework and you have a compiler at `C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe`.

#### TypeScript

Compiled by  [https://www.npmjs.com/package/assemblyscript](assemblyscript).

## Running

The following command will compile all sources to WASM and set up a HTTP server on port 8080. You can then access the site on `http://localhost:8080`.

```
$> gulp
```