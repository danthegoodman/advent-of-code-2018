import { readFileSync } from "fs";
import _ = require("lodash");
import { expect } from 'chai';

function main() {
  const inputFile = readFileSync(__dirname + "/input.txt", 'utf8').trim();

  expect(solveA("+1 +1 +1")).to.equal(3);
  expect(solveA("+1 +1 -2")).to.equal(0);
  expect(solveA("-1 -2 -3")).to.equal(-6);
  console.log("A:", solveA(inputFile));

  expect(solveB("+1 -1")).to.equal(0);
  expect(solveB("+3 +3 +4 -2 -4")).to.equal(10);
  expect(solveB("-6 +3 +8 +5 -6")).to.equal(5);
  expect(solveB("+7 +7 -2 -7 -4")).to.equal(14);
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
