import { readFileSync } from "fs";
import { expect } from 'chai';

function main() {
  const input = readFileSync(__dirname + "/input.txt", 'utf8').trim();
  const example =
      "#1 @ 1,3: 4x4\n" +
      "#2 @ 3,1: 4x4\n" +
      "#3 @ 5,5: 2x2";


  expect(solveA(example)).to.equal(4);
  console.log("A:", solveA(input));

  expect(solveB(example)).to.equal(3);
  console.log("B:", solveB(input));
}

main();

function parseClaims(input: string) {
  return input.split(/\n/).map(it => {
    let match = /#(\d+) @ (\d+),(\d+): (\d+)x(\d+)/.exec(it);
    if (!match) throw new Error(it);
    let [, id, left, top, width, height] = match.map(Number);
    return {id, left, top, width, height};
  });
}

function solveA(input: string) {
  let claims = parseClaims(input);
  let cutPoints = new Set<string>();
  let overlapPoints = new Set<string>();

  for (let c of claims) {
    for (let x = 0; x < c.width; x++) {
      for (let y = 0; y < c.height; y++) {
        let p = `${c.left + x},${c.top + y}`;
        if (cutPoints.has(p)) {
          overlapPoints.add(p)
        } else {
          cutPoints.add(p);
        }
      }
    }
  }

  return overlapPoints.size;
}

function solveB(input: string) {
  let claims = parseClaims(input);
  let cutPoints = new Set<string>();
  let overlapPoints = new Set<string>();

  for (let c of claims) {
    for (let x = 0; x < c.width; x++) {
      for (let y = 0; y < c.height; y++) {
        let p = `${c.left + x},${c.top + y}`;
        if (cutPoints.has(p)) {
          overlapPoints.add(p)
        } else {
          cutPoints.add(p);
        }
      }
    }
  }

  let found = claims.find(c => {
    for (let x = 0; x < c.width; x++) {
      for (let y = 0; y < c.height; y++) {
        let p = `${c.left + x},${c.top + y}`;
        if (overlapPoints.has(p)) {
          return false;
        }
      }
    }
    return true;
  });
  if (!found) throw new Error("All overlap");
  return found.id;
}
