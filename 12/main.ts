import * as assert from "assert";
import { readFileSync } from "fs";
import * as _ from 'lodash';

function main() {
  const input = readFileSync(__dirname + "/input.txt", 'utf8').trim();
  const example = `
initial state: #..#.#..##......###...###

##### => .
####. => #
###.# => #
###.. => #
##.## => #
##.#. => #
##..# => .
##... => .
#.### => #
#.##. => .
#.#.# => #
#.#.. => .
#..## => .
#..#. => .
#...# => .
#.... => .
.#### => #
.###. => .
.##.# => .
.##.. => #
.#.## => #
.#.#. => #
.#..# => .
.#... => #
..### => .
..##. => .
..#.# => .
..#.. => #
..#.. => #
...## => #
...#. => .
....# => .
..... => .
`.trim();

  assert.strictEqual(solveA(example), 325);
  assert.strictEqual(solveA(input), 3059);

  assert.strictEqual(solveB(input), 3650000001776);
}

function parseInitial(line: string) {
  let [, stateStr] = line.match(/state: (.+)$/)!;
  return stateStr;
}

function parsePatterns(lines: string[]) {
  return new Map(lines.map(it => {
    let [, input, output] = it.match(/(.....) => (.)/)!;
    return [input, output] as [string, string];
  }))
}

type State = { ndx: number, text: string };

function evolveState(state: State, patterns: Map<string, string>) {
  let text = '..' + state.text + '..';
  let newText = _.times(text.length, (n) => {
    let p = ('..' + text + '..').substring(n, n + 5);
    return patterns.get(p) || `!`;
  });
  text = newText.join('');

  let ndx = text.indexOf('#');
  text = text.substring(ndx, text.lastIndexOf('#') + 1);

  return {
    ndx: state.ndx - 2 + ndx,
    text,
  }
}

function solveA(input: string): number {
  let lines = input.split('\n');
  let state: State = {ndx: 0, text: parseInitial(lines[0])};
  let patterns = parsePatterns(lines.slice(2));

  for (let iter = 0; iter < 20; iter++) {
    state = evolveState(state, patterns)
  }
  let points = state.text.split('').map((it, ndx) => {
    if (it === '.') return 0;
    return ndx + state.ndx;
  });
  return _.sum(points);
}

function solveB(input: string): number {
  let lines = input.split('\n');
  let state: State = {ndx: 0, text: parseInitial(lines[0])};
  let patterns = parsePatterns(lines.slice(2));

  let iter = 0;
  while(true){
    iter += 1;
    let prevState = state;
    state = evolveState(prevState, patterns);
    if(prevState.text === state.text){
      let delta = state.ndx - prevState.ndx;
      state.ndx += delta * (50_000_000_000 - iter);
      break;
    }
  }
  let points = state.text.split('').map((it, ndx) => {
    if (it === '.') return 0;
    return ndx + state.ndx;
  });
  return _.sum(points);
}


main();
