package main

import (
	"math/rand"
	"time"
	"syscall/js"
)

var beforeUnloadCh = make(chan struct{})

func main() {
	rand.Seed(time.Now().UTC().UnixNano())

	nameCb := js.NewCallback(name)
	defer nameCb.Close()

	feelingLuckyCb := js.NewCallback(feelingLucky)
	defer feelingLuckyCb.Close()

	initGoCallbacks := js.Global().Get("initGoCallbacks")
	initGoCallbacks.Invoke(nameCb, feelingLuckyCb)

	beforeUnloadCb := js.NewEventCallback(0, beforeUnload)
	defer beforeUnloadCb.Close()
	addEventListener := js.Global().Get("addEventListener")
	addEventListener.Invoke("beforeunload", beforeUnloadCb)

	<- beforeUnloadCh
}

func name(args []js.Value) {
	args[0].Call("result", "Go")
}

func feelingLucky(args []js.Value) {
	number := 1 + rand.Intn(100)
	args[0].Call("result", number)
}

func beforeUnload(event js.Value) {
	beforeUnloadCh <- struct{}{}
} 