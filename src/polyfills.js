if (!WebAssembly.instantiateStreaming) {
  WebAssembly.instantiateStreaming = async (response, imports) => {
    const source = await (await response).arrayBuffer();
    return await WebAssembly.instantiate(source, imports);
  };
}
