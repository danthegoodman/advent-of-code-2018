import * as assert from "assert";
import { readFileSync } from "fs";
import * as _ from 'lodash';

function main() {
  const input = readFileSync(__dirname + "/input.txt", 'utf8').trim();
  const example =
      "1, 1\n" +
      "1, 6\n" +
      "8, 3\n" +
      "3, 4\n" +
      "5, 5\n" +
      "8, 9";

  assert.strictEqual(solveA(example), 17);
  console.log("A:", solveA(input));

  assert.strictEqual(solveB(example, 32), 16);
  console.log("B:", solveB(input, 10000));
}

const MULTIPLE = -1;
type Location = { ndx: number } & Point;
type Point = { r: number, c: number };

function parseInput(input: string): Location[] {
  return input.split('\n').map((it, ndx) => {
    let [c, r] = it.split(',').map(Number);
    return {ndx, r, c};
  });
}

function distance(a: Point, b: Point) {
  return Math.abs(b.r - a.r) + Math.abs(b.c - a.c);
}

function findClosestLocation(p: Point, locations: Location[]) {
  let result = -2;
  let minDist = Number.POSITIVE_INFINITY;
  for (let l of locations) {
    let d = distance(p, l);

    if (d === minDist) {
      result = MULTIPLE;
    } else if (d < minDist) {
      result = l.ndx;
      minDist = d;
    }
  }
  return result;
}

function solveA(input: string) {
  let locations = parseInput(input);
  let minR = _.minBy(locations, it => it.r)!.r - 1;
  let minC = _.minBy(locations, it => it.c)!.c - 1;
  let maxR = _.maxBy(locations, it => it.r)!.r + 1;
  let maxC = _.maxBy(locations, it => it.c)!.c + 1;

  let matrix: number[][] = [];
  for (let r = minR; r <= maxR; r++) {
    let row = [];
    for (let c = minC; c <= maxC; c++) {
      row[c] = findClosestLocation({r, c}, locations);
    }
    matrix[r] = row;
  }

  // for (let r = minR; r <= maxR; r++) {
  //   console.log(matrix[r].map(it => it.toString().padStart(2, '0')).join(' '));
  // }

  let possibleNdxs = new Set(locations.map(it => it.ndx));

  // If the ndx shows up on the outer ring, it extends infinitely
  // and cannot be used
  for (let c = minC; c <= maxC; c++) {
    possibleNdxs.delete(matrix[minR][c]);
    possibleNdxs.delete(matrix[maxR][c]);
  }
  for (let r = minR; r <= maxR; r++) {
    possibleNdxs.delete(matrix[r][minC]);
    possibleNdxs.delete(matrix[r][maxC]);
  }

  let maxCount = 0;
  for (let ndx of possibleNdxs) {
    let count = 0;
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (matrix[r][c] === ndx) {
          count += 1;
        }
      }
    }

    if (count > maxCount) maxCount = count;
  }

  return maxCount;
}

function solveB(input: string, rangeLimit: number) {
  let locations = parseInput(input);
  let minR = _.minBy(locations, it => it.r)!.r;
  let minC = _.minBy(locations, it => it.c)!.c;
  let maxR = _.maxBy(locations, it => it.r)!.r;
  let maxC = _.maxBy(locations, it => it.c)!.c;

  let count = 0;
  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      let p = {r, c};
      let totalDistance = _.sumBy(locations, l => distance(p, l));
      if (totalDistance < rangeLimit) {
        count += 1;
      }
    }
  }

  return count;
}

main();
