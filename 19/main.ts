import * as assert from "assert";
import { readFileSync } from "fs";
import * as _ from 'lodash';

function main() {
  const input = readFileSync(__dirname + "/input.txt", 'utf8').trim();
  let example = `
#ip 0
seti 5 0 1
seti 6 0 2
addi 0 1 0
addr 1 2 3
setr 1 0 0
seti 8 0 4
seti 9 0 5
`.trim();
  assert.strictEqual(solveUsingOpCodes(example), 7);

  //Part 1
  assert.strictEqual(solveUsingOpCodes(input), 2160);
  assert.strictEqual(solveUsingTheIntent(input, 0), 2160);

  //Part 2
  assert.strictEqual(solveUsingTheIntent(input, 1), 25945920);
}

function parseInput(input: string) {
  const lines = input.split('\n');
  const ipReg = Number(lines[0].match(/\d/)![0]);
  const instrs = lines.slice(1).map(line => {
    let words = line.split(' ');
    let op = operations[words[0]];
    let [, inA, inB, outC] = words.map(Number);
    return (state: number[]) => op(state, inA, inB, outC)
  });
  return {ipReg, instrs};
}

function solveUsingOpCodes(input: string): number {
  const {ipReg, instrs} = parseInput(input);

  let state = [0, 0, 0, 0, 0, 0];
  while (0 <= state[ipReg] && state[ipReg] < instrs.length) {
    instrs[state[ipReg]](state);
    state[ipReg] += 1;
  }
  return state[0];
}

function solveUsingTheIntent(input: string, register0: number): number {
  const {ipReg, instrs} = parseInput(input);

  let state = [register0, 0, 0, 0, 0, 0];
  while (state[ipReg] !== 2) {
    instrs[state[ipReg]](state);
    state[ipReg] += 1;
  }

  return sumAllTheFactors(state[3]);
}

function sumAllTheFactors(base: number) {
  let stoppingPoint = Math.sqrt(base);

  let factors = [1, base];
  for (let i = 2; i < stoppingPoint; i++) {
    let div = base / i;
    if (Number.isInteger(div)) {
      factors.push(i, div);
    }
  }

  return _.sum(factors);
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
