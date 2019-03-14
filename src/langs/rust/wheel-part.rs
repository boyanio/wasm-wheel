#![feature(core_intrinsics)]
#![no_std]

use core::intrinsics;
use core::panic::PanicInfo;

// There are some issues compiling the rand crate using wasm32-unknown-unknown, so
// I prefer the import it from JavaScript
extern {
  fn random() -> f64;
}

#[panic_handler]
#[no_mangle]
pub fn panic(_info: &PanicInfo) -> ! {
  unsafe { intrinsics::abort() }
}

#[inline(always)]
fn floor(x: f64) -> f64 {
  unsafe { intrinsics::floorf64(x) }
}

#[no_mangle]
pub fn name() -> *const u8 {
	let n = b"Rust\0";
	n as *const u8
}

#[allow(non_snake_case)]
#[no_mangle]
pub fn feelingLucky() -> f64 {
	unsafe { floor(random() * 100.0) + 1.0 }
}
