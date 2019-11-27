// There are some issues compiling the rand crate using wasm32-unknown-unknown,
// so it is easier to import it from JavaScript
extern {
  fn random() -> f64;
}

#[no_mangle]
pub fn name() -> *const u8 {
  let n = b"Rust\0";
  return n as *const u8;
}

#[allow(non_snake_case)]
#[no_mangle]
pub fn feelingLucky() -> f64 {
  unsafe { (random() * 100.0).floor() + 1.0 }
}
