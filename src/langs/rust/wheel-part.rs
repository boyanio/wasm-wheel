// There are some issues compiling the rand crate using wasm32-unknown-unknown, so
// I prefer the import it from JavaScript
extern {
  fn random() -> f64;
}

// I get 'RuntimeError: memory access out of bounds'
// when trying to define a name() method, which
// returns a String, so that's why I am putting the name in the metafile

#[allow(non_snake_case)]
#[no_mangle]
pub fn feelingLucky() -> i32 {
	unsafe {
		return ((random() * 100.0) as i32) + 1;
	}
}