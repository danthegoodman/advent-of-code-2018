import * as assert from "assert";
import { readFileSync } from "fs";
import * as _ from 'lodash';

function main() {
  const input = readFileSync(__dirname + "/input.txt", 'utf8').trim();
  assert.strictEqual(getPowerLevel(3, 5, 8), 4);
  assert.strictEqual(getPowerLevel(122, 79, 57), -5);
  assert.strictEqual(getPowerLevel(217, 196, 39), 0);
  assert.strictEqual(getPowerLevel(101, 153, 71), 4);

  assert.strictEqual(solveA('18'), '33,45');
  assert.strictEqual(solveA('42'), '21,61');
  assert.strictEqual(solveA(input), '21,93');

  assert.strictEqual(solveB('18'), '90,269,16');
  assert.strictEqual(solveB('42'), '232,251,12');
  assert.strictEqual(solveB(input), '231,108,14');
}

function getPowerLevel(x: number, y: number, serial: number) {
  let rackId = x + 10;
  let power = rackId * y;
  power += serial;
  power *= rackId;
  let hundreds = Math.floor(power / 100) % 10;
  return hundreds - 5;
}

function solveA(input: string): string {
  let serial = Number(input);
  let grid = _.times(300, x => _.times(300, y => getPowerLevel(x + 1, y + 1, serial)));

  let bestPos = '1,1';
  let bestSum = 0;
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      bestSum += grid[x][y];
    }
  }

  for (let x = 0; x < 298; x++) {
    for (let y = 0; y < 298; y++) {
      let sum = 0;
      for (let a = 0; a < 3; a++) {
        for (let b = 0; b < 3; b++) {
          sum += grid[x + a][y + b];
        }
      }
      if (sum > bestSum) {
        bestSum = sum;
        bestPos = `${x + 1},${y + 1}`;
      }
    }
  }
  return bestPos;
}

function solveB(input: string): string {
  let serial = Number(input);
  let grid = _.times(300, x => _.times(300, y => getPowerLevel(x + 1, y + 1, serial)));

  let findSum = (x: number, y: number, size: number): number => {
    let sum = 0;
    for (let a = 0; a < size; a++) {
      for (let b = 0; b < size; b++) {
        sum += grid[x + a][y + b];
      }
    }
    return sum;
  };

  let bestPos = '1,1,1';
  let bestSum = grid[0][0];
  // Technically, it could be bigger than this, but I doubt it.
  for (let size = 4; size < 40; size++) {
    console.log(`serial=${serial};size=${size}`);
    let limit = 300 - size;
    for (let x = 0; x < limit; x++) {
      for (let y = 0; y < limit; y++) {
        let sum = findSum(x, y, size);
        if (sum > bestSum) {
          bestSum = sum;
          bestPos = `${x + 1},${y + 1},${size}`;
          console.log("  best: ",bestSum, bestPos);
        }
      }
    }
  }
  return bestPos;
}


main();
