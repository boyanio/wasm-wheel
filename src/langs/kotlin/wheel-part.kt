fun main(args: Array<String>) {
}

public fun name(): String {
  return "Kotlin"
}

public fun feelingLucky(): Int {
  return rand(1, 101);
}

@SymbolName("Konan_js_rand")
external public fun rand(from: Int, to: Int): Int