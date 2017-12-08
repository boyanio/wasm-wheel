/// <reference path="../../../node_modules/assemblyscript/assembly.d.ts" />

declare function random(): number;

// If I create a name() method returning a string,
// I cannot fetch it from the memory as it adds some spaces
// between the letters

export function feelingLucky(): number {
  return floor(random() * 100) + 1;
}