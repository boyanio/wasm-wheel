/// <reference path="../../../node_modules/assemblyscript/assembly.d.ts" />

declare function Math$random(): number;
declare function Math$floor(num: number): number;

export function feelingLucky(): number {
  return Math$floor(Math$random() * 100) + 1;
}