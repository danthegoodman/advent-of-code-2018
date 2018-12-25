import * as assert from "assert";
import { readFileSync } from "fs";

function main() {
  const input = readFileSync(__dirname + "/input.txt", 'utf8').trim();
  assert.strictEqual(solveA(input), 12420065);
  assert.strictEqual(solveBAccoringToMyInput(), 1670686);
}

function parseInput(input: string) {
  const lines = input.split('\n');
  const ipReg = Number(lines[0].match(/\d/)![0]);
  const instrs = lines.slice(1).map(line => {
    let words = line.split(' ');
    let op = operations[words[0]];
    let [, inA, inB, outC] = words.map(Number);
    return (state: number[]) => op(state, inA, inB, outC);
  });
  return {ipReg, instrs};
}

function solveA(input: string): number {
  const {ipReg, instrs} = parseInput(input);

  let state = [-1, 0, 0, 0, 0, 0];
  while (0 <= state[ipReg] && state[ipReg] < instrs.length) {
    if (state[ipReg] === 28) {
      return state[4];
    }
    instrs[state[ipReg]](state);
    state[ipReg] += 1;
  }
  return -1;
}

function solveBAccoringToMyInput(): number {
  let s4 = 0, s5 = 0;
  let seen = new Set<number>();
  let lastSeen = -1;

  while(true){
    s5 = s4 | 65536;
    s4 = 10704114;

    while(true){
      s4 = s4 + (s5 & 255);
      s4 = s4 & 16777215;
      s4 = s4 * 65899;
      s4 = s4 & 16777215;

      if(256 > s5) break;

      s5 = Math.floor(s5 / 256);
    }

    if(seen.has(s4)) return lastSeen;
    seen.add(s4);
    lastSeen = s4;
  }
}

type Opcode = (state: number[], inA: number, inB: number, outC: number) => void

const operations: Record<string, Opcode> = {
  addr: (state, inA, inB, outC) => state[outC] = state[inA] + state[inB],
  addi: (state, inA, inB, outC) => state[outC] = state[inA] + inB,

  mulr: (state, inA, inB, outC) => state[outC] = state[inA] * state[inB],
  muli: (state, inA, inB, outC) => state[outC] = state[inA] * inB,

  banr: (state, inA, inB, outC) => state[outC] = state[inA] & state[inB],
  bani: (state, inA, inB, outC) => state[outC] = state[inA] & inB,

  borr: (state, inA, inB, outC) => state[outC] = state[inA] | state[inB],
  bori: (state, inA, inB, outC) => state[outC] = state[inA] | inB,

  setr: (state, inA, _, outC) => state[outC] = state[inA],
  seti: (state, inA, _, outC) => state[outC] = inA,

  gtir: (state, inA, inB, outC) => state[outC] = inA > state[inB] ? 1 : 0,
  gtri: (state, inA, inB, outC) => state[outC] = state[inA] > inB ? 1 : 0,
  gtrr: (state, inA, inB, outC) => state[outC] = state[inA] > state[inB] ? 1 : 0,

  eqir: (state, inA, inB, outC) => state[outC] = inA === state[inB] ? 1 : 0,
  eqri: (state, inA, inB, outC) => state[outC] = state[inA] === inB ? 1 : 0,
  eqrr: (state, inA, inB, outC) => state[outC] = state[inA] === state[inB] ? 1 : 0,
};
main();
