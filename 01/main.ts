import * as assert from "assert";
import { readFileSync } from "fs";
import _ = require("lodash");

function main() {
  const inputFile = readFileSync(__dirname + "/input.txt", 'utf8').trim();

  assert.strictEqual(solveA("+1 +1 +1"), 3);
  assert.strictEqual(solveA("+1 +1 -2"), 0);
  assert.strictEqual(solveA("-1 -2 -3"), -6);
  console.log("A:", solveA(inputFile));

  assert.strictEqual(solveB("+1 -1"), 0);
  assert.strictEqual(solveB("+3 +3 +4 -2 -4"), 10);
  assert.strictEqual(solveB("-6 +3 +8 +5 -6"), 5);
  assert.strictEqual(solveB("+7 +7 -2 -7 -4"), 14);
  console.log("B:", solveB(inputFile));
}

main();

function solveA(input: string) {
  let parts = input.split(/\s/).map(Number);
  return _.sum(parts)
}

function solveB(input: string) {
  let parts = input.split(/\s/).map(Number);

  let state = 0;
  let seenState = new Set<Number>([state]);

  while (true) {
    for (let p of parts) {
      state += p;
      if (seenState.has(state)) {
        return state;
      }
      seenState.add(state);
    }
  }
}
