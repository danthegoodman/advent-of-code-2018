import * as assert from "assert";
import { readFileSync } from "fs";

function main() {
  const input = readFileSync(__dirname + "/input.txt", 'utf8').trim();
  let example = `
.#.#...|#.
.....#|##|
.|..|...#.
..|#.....#
#.#|||#|#|
...#.||...
.|....|...
||...#|.#|
|.||||..|.
...#.|..|.
`.trim();
  assert.strictEqual(solveA(example), 1147);
  assert.strictEqual(solveA(input), 589931);

  assert.strictEqual(solveB(input), 222332);
}

const GROUND = '.';
const TREE = '|';
const LUMBER = '#';

function evolveGrid(grid: string[][]): string[][] {
  return grid.map((row, r) => row.map((_, c) => evolveSquare(grid, r, c)));
}

function evolveSquare(grid: string[][], r: number, c: number): string {
  let cur = grid[r][c];
  if (cur === GROUND) {
    if (countSurrounding(TREE) >= 3) return TREE;
    return GROUND;
  }

  if (cur === TREE) {
    if (countSurrounding(LUMBER) >= 3) return LUMBER;
    return TREE;
  }

  if (cur === LUMBER) {
    if (countSurrounding(LUMBER) && countSurrounding(TREE)) return LUMBER;
    return GROUND;
  }

  throw new Error("bad state");

  function countSurrounding(thing: string) {
    let n = 0;
    if (r > 0) {
      if (grid[r - 1][c - 1] === thing) n++;
      if (grid[r - 1][c] === thing) n++;
      if (grid[r - 1][c + 1] === thing) n++;
    }

    if (grid[r][c - 1] === thing) n++;
    if (grid[r][c + 1] === thing) n++;

    if (grid[r + 1]) {
      if (grid[r + 1][c - 1] === thing) n++;
      if (grid[r + 1][c] === thing) n++;
      if (grid[r + 1][c + 1] === thing) n++;
    }

    return n;
  }
}

function calculateValue(grid: string[][]) {
  let trees = 0;
  let lumber = 0;
  for (let row of grid) {
    for (let it of row) {
      if (it === TREE) trees++;
      if (it === LUMBER) lumber++;
    }
  }

  return trees * lumber;
}

function solveA(input: string): number {
  let grid = input.split('\n').map(ln => ln.split(''));

  for (let i = 0; i < 10; i++) {
    grid = evolveGrid(grid);
  }

  return calculateValue(grid);
}

function solveB(input: string): number {
  let grid = input.split('\n').map(ln => ln.split(''));

  let seen = new Map<string, number>();
  seen.set(input, 0);

  const limit = 1000000000;
  for (let i = 0; i < limit; i++) {
    grid = evolveGrid(grid);
    let str = grid.map(row => row.join('')).join("\n");
    if (seen.has(str)) {
      let stepSize = i - seen.get(str)!;
      i += Math.floor((limit - i) / stepSize) * stepSize;
      seen.clear();
      continue;
    }
    seen.set(str, i);
  }

  return calculateValue(grid);
}

main();
