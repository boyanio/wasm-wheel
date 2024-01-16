extern crate rand;

use rand::Rng;

#[no_mangle]
pub fn name() -> *const u8 {
  let n = b"Rust\0";
  return n as *const u8;
}

#[allow(non_snake_case)]
#[no_mangle]
pub fn feelingLucky() -> f64 {
  let mut rng = rand::thread_rng();
  let y: f64 = rng.gen_range(1.0..101.0);
  return y.floor() + 1.0
}
