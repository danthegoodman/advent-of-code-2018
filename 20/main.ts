import * as assert from "assert";
import { readFileSync } from "fs";

function main() {
  const input = readFileSync(__dirname + "/input.txt", 'utf8').trim();
  let example1 = '^ESSWWN(E|NNENN(EESS(WNSE|)SSS|WWWSSSSE(SW|NNNE)))$';
  let example2 = '^WSSEESWWWNW(S|NENNEEEENN(ESSSSW(NWSW|SSEN)|WSWWN(E|WWS(E|SS))))$';

  assert.strictEqual(solveA(computeDistances(example1)), 23);
  assert.strictEqual(solveA(computeDistances(example2)), 31);

  const distances = computeDistances(input);
  assert.strictEqual(solveA(distances), 3218);
  assert.strictEqual(solveB(distances), 1000);
}

function solveA(distances: Map<string, number>) {
  let max = 0;
  for (let d of distances.values()) {
    if (d > max) max = d;
  }
  return max;
}

function solveB(distances: Map<string, number>) {
  let count = 0;
  for (let d of distances.values()) {
    if (d >= 1000) count++;
  }
  return count;
}

type Token = string | BranchTokens;

interface BranchTokens extends Array<Array<Token>> {
}

function expandPattern(input: string) {
  let chars = input.split('').slice(1, -1).reverse();
  let tokens: Token[] = [];

  while (chars.length) {
    let next = chars.pop()!;
    if (next === '(') {
      tokens.push(buildBranchToken(chars));
    } else {
      tokens.push(next);
    }
  }

  return tokens;
}

function buildBranchToken(baseChars: string[]): BranchTokens {
  let innerChars = [];
  let depth = 0;
  while (true) {
    let next = baseChars.pop()!;
    if (next === ')' && depth === 0) break;
    if (next === ')') depth--;
    if (next === '(') depth++;
    innerChars.push(next)
  }
  innerChars.reverse();

  let curr: Token[] = [];
  let options: BranchTokens = [curr];

  while (innerChars.length) {
    let next = innerChars.pop()!;
    if (next === '(') {
      curr.push(buildBranchToken(innerChars));
    } else if (next === '|') {
      curr = [];
      options.push(curr);
    } else {
      curr.push(next);
    }
  }

  return options;
}

function computeDistances(input: string) {
  let tokens = expandPattern(input);
  let doors = traversePaths(tokens);
  return findDistancesFromStart(doors);
}

function findDistancesFromStart(doors: Set<string>) {
  let distances = new Map<string, number>();
  let queue = [{r: 0, c: 0, d: 0}];

  while (queue.length) {
    let {r, c, d} = queue.pop()!;
    let key = `${r},${c}`;
    if (distances.has(key)) continue;
    distances.set(key, d);

    if (doors.has(`${r},${c}:N`)) queue.push({r: r - 1, c, d: d + 1});
    if (doors.has(`${r},${c}:W`)) queue.push({r, c: c - 1, d: d + 1});
    if (doors.has(`${r + 1},${c}:N`)) queue.push({r: r + 1, c, d: d + 1});
    if (doors.has(`${r},${c + 1}:W`)) queue.push({r, c: c + 1, d: d + 1});
  }

  return distances;
}

function traversePaths(tokens: Token[]) {
  let doors = new Set<string>();
  let cache = new Set<string>();

  followToken(tokens, cache, doors, 0, 0);

  return doors;
}

function renderTokens(tokens: Token[]): string{
  return tokens.map(it => typeof it === 'string' ? it : '(' + it.map(renderTokens).join('|') + ')').join('');
}

function followToken(tokens: Token[], cache: Set<string>, doors: Set<string>, r: number, c: number): void {
  let cacheKey = `${r}:${c}:${renderTokens(tokens)}`;
  if(cache.has(cacheKey)) return;
  cache.add(cacheKey);
  let t = tokens.shift();
  if (!t) return;

  if (typeof t === 'string') {
    doors.add(getDoorKey(t, r, c));

    if (t === "N") return followToken(tokens, cache, doors, r - 1, c);
    if (t === "W") return followToken(tokens, cache, doors, r, c - 1);
    if (t === "S") return followToken(tokens, cache, doors, r + 1, c);
    if (t === "E") return followToken(tokens, cache, doors, r, c + 1);
    throw new Error("bad state");
  }

  for(let ndx = 0; ndx < t.length; ndx++){
    let optionTokens = t[ndx].concat(tokens);
    followToken(optionTokens, cache, doors, r, c);
  }
}

function getDoorKey(char: string, r: number, c: number) {
  if (char === "N") return `${r},${c}:N`;
  if (char === "W") return `${r},${c}:W`;
  if (char === "S") return `${r + 1},${c}:N`;
  if (char === "E") return `${r},${c + 1}:W`;
  throw new Error("bad state");
}


main();
