import kotlin.math.floor;
import kotlinx.wasm.jsinterop.ReturnSlot_getDouble;

fun main() {
  // Required by the compiler
}

@Retain
public fun name(): String {
  return "Kotlin"
}

@Retain
public fun feelingLucky(): Int {
  // When returning a double from JavaScript, it is put in a global
  // storage as two parts (lower & upper). The way to access this double,
  // is by calling ReturnSlow_getDouble()
  rand();
  return (floor(ReturnSlot_getDouble() * 100) + 1).toInt()
}

@SymbolName("Konan_js_rand")
external public fun rand(): Double