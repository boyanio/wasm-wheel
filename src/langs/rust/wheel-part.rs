// There are some issues compiling the rand crate using wasm32-unknown-unknown, so
// I prefer the import it from JavaScript
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
pub fn feelingLucky() -> i32 {
	unsafe {
		return ((random() * 100.0) as i32) + 1;
	}
}