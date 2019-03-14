@external("env", "random")
declare function random(): f64;

export function name(): string {
  return "AssemblyScript";
}

export function feelingLucky(): f64 {
  return Math.floor(random() * 100) + 1;
}
