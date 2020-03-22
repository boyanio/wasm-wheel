package main

import (
	"math/rand"
	"time"
	"syscall/js"
)

var beforeUnloadCh = make(chan struct{})

func main() {
	rand.Seed(time.Now().UTC().UnixNano())

	nameCb := js.FuncOf(name)
	defer nameCb.Release()

	feelingLuckyCb := js.FuncOf(feelingLucky)
	defer feelingLuckyCb.Release()

	initGoCallbacks := js.Global().Get("initGoCallbacks")
	initGoCallbacks.Invoke(nameCb, feelingLuckyCb)

	beforeUnloadCb := js.FuncOf(beforeUnload)
	defer beforeUnloadCb.Release()
	addEventListener := js.Global().Get("addEventListener")
	addEventListener.Invoke("beforeunload", beforeUnloadCb)

	<- beforeUnloadCh
}

func name(this js.Value, args []js.Value) interface{} {
	args[0].Call("result", "Go")
	return nil
}

func feelingLucky(this js.Value, args []js.Value) interface{} {
	number := 1 + rand.Intn(100)
	args[0].Call("result", number)
	return nil
}

func beforeUnload(this js.Value, args []js.Value) interface{} {
	beforeUnloadCh <- struct{}{}
	return nil
}