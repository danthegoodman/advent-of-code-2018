import * as assert from "assert";
import { readFileSync } from "fs";
import _ = require("lodash");

function main() {
  const input = readFileSync(__dirname + "/input.txt", 'utf8');
  const example = readFileSync(__dirname + "/example.txt", 'utf8');
  const example2 = readFileSync(__dirname + "/example2.txt", 'utf8');

  assert.strictEqual(solveA(example), "7,3");
  assert.strictEqual(solveA(input), "117,62");

  assert.strictEqual(solveB(example2), "6,4");
  assert.strictEqual(solveB(input), "69,67");
}

enum Track {NONE, HORIZ, VERT, CURVE_L, CURVE_R, INTERSECTION }

enum Dir { UP, RIGHT, DOWN, LEFT }

type Cart = { r: number, c: number, dir: Dir, intersectionCount: number }

function parseInput(input: string) {
  let carts: Cart[] = [];
  let grid = input.split('\n').map((ln, r) => ln.split('').map((it, c) => {
    if (it === ' ') return Track.NONE;
    if (it === '-') return Track.HORIZ;
    if (it === '|') return Track.VERT;
    if (it === '\\') return Track.CURVE_L;
    if (it === '/') return Track.CURVE_R;
    if (it === '+') return Track.INTERSECTION;

    if (it === '>') {
      carts.push({r, c, dir: Dir.RIGHT, intersectionCount: 0});
      return Track.HORIZ
    }
    if (it === '<') {
      carts.push({r, c, dir: Dir.LEFT, intersectionCount: 0});
      return Track.HORIZ
    }
    if (it === '^') {
      carts.push({r, c, dir: Dir.UP, intersectionCount: 0});
      return Track.VERT
    }
    if (it === 'v') {
      carts.push({r, c, dir: Dir.DOWN, intersectionCount: 0});
      return Track.VERT
    }

    throw new Error(`Illegal: ${it}`);
  }));

  return {carts, grid};
}

function updateCart(cart: Cart, grid: Track[][]) {
  let dir = cart.dir;
  if (dir === Dir.UP) cart.r--;
  else if (dir === Dir.DOWN) cart.r++;
  else if (dir === Dir.LEFT) cart.c--;
  else if (dir === Dir.RIGHT) cart.c++;

  let t = grid[cart.r][cart.c];
  if (t === Track.NONE) throw new Error(`BAD STATE: ${cart.r},${cart.c}`);
  if (t === Track.VERT || t === Track.HORIZ) return;

  if (t === Track.CURVE_L) {
    if (dir === Dir.UP) cart.dir = Dir.LEFT;
    else if (dir === Dir.LEFT) cart.dir = Dir.UP;
    else if (dir === Dir.RIGHT) cart.dir = Dir.DOWN;
    else if (dir === Dir.DOWN) cart.dir = Dir.RIGHT;
    return;
  }

  if (t === Track.CURVE_R) {
    if (dir === Dir.UP) cart.dir = Dir.RIGHT;
    else if (dir === Dir.RIGHT) cart.dir = Dir.UP;
    else if (dir === Dir.LEFT) cart.dir = Dir.DOWN;
    else if (dir === Dir.DOWN) cart.dir = Dir.LEFT;
    return;
  }

  if (t !== Track.INTERSECTION) throw new Error(`BAD STATE`);

  if (cart.intersectionCount === 0) {
    if (dir === Dir.UP) cart.dir = Dir.LEFT;
    else if (dir === Dir.LEFT) cart.dir = Dir.DOWN;
    else if (dir === Dir.DOWN) cart.dir = Dir.RIGHT;
    else if (dir === Dir.RIGHT) cart.dir = Dir.UP;
  } else if (cart.intersectionCount === 1) {
    //go straight; no turn.
  } else if (cart.intersectionCount === 2) {
    if (dir === Dir.UP) cart.dir = Dir.RIGHT;
    else if (dir === Dir.RIGHT) cart.dir = Dir.DOWN;
    else if (dir === Dir.DOWN) cart.dir = Dir.LEFT;
    else if (dir === Dir.LEFT) cart.dir = Dir.UP;
  }
  cart.intersectionCount = (cart.intersectionCount + 1) % 3;
}

function solveA(input: string): string {
  let {carts, grid} = parseInput(input);

  while (true) {
    carts = _.sortBy(carts, it => it.r, it => it.c);
    for (let c of carts) {
      updateCart(c, grid);
      let wentBoom = carts.filter(it => it !== c && it.r === c.r && it.c === c.c);
      if (wentBoom.length) {
        return `${c.c},${c.r}`;
      }
    }
  }
}

function solveB(input: string): string {
  let {carts, grid} = parseInput(input);

  while (carts.length > 1) {
    carts = _.sortBy(carts, it => it.r, it => it.c);

    for (let i = 0; i < carts.length; i++) {
      let c = carts[i];
      updateCart(c, grid);
      let wentBoom = carts.findIndex(it => it !== c && it.r === c.r && it.c === c.c);
      if (wentBoom !== -1) {
        console.log("boom", carts[wentBoom],carts[i]);
        carts.splice(wentBoom, 1);
        if (wentBoom < i) i--;

        carts.splice(i, 1);
        i--;
      }
    }
  }

  return `${carts[0].c},${carts[0].r}`
}


main();
