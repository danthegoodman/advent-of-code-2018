import * as assert from "assert";
import { readFileSync } from "fs";
import * as _ from 'lodash';

function main() {
  const input = readFileSync(__dirname + "/input.txt", 'utf8').trim();
  let example = `
Before: [3, 2, 1, 1]
9 2 1 2
After:  [3, 2, 2, 1]`.trim();
  assert.strictEqual(solveA(example), 1);
  assert.strictEqual(solveA(input), 612);

  assert.strictEqual(solveB(input), 485);
}

function solveA(input: string): number {
  const samples = input.match(/Before:.*\n.*\nAfter:.*/g)!.map(it => {
    const nums = it.match(/\d+/g)!.map(Number);
    return {
      before: nums.slice(0, 4) as Registers,
      code: nums.slice(4, 8) as Instruction,
      after: nums.slice(8, 12) as Registers,
    }
  });

  let countMatchThreeOrMore = 0;

  for (let s of samples) {
    let countMatch = 0;
    for (let op of Object.values(operations)) {
      let state = s.before.slice() as Registers;
      op(state, s.code);
      if (state[0] === s.after[0] && state[1] === s.after[1] && state[2] === s.after[2] && state[3] === s.after[3]) {
        countMatch += 1;
      }
    }

    if (countMatch >= 3) {
      countMatchThreeOrMore += 1;
    }
  }
  return countMatchThreeOrMore;
}

function solveB(input: string): number {
  const samples = input.match(/Before:.*\n.*\nAfter:.*/g)!.map(it => {
    const nums = it.match(/\d+/g)!.map(Number);
    return {
      before: nums.slice(0, 4) as Registers,
      code: nums.slice(4, 8) as Instruction,
      after: nums.slice(8, 12) as Registers,
    }
  });
  let possibleOps = new Map(_.times(16, (n) => [n, Object.values(operations)] as [number, Opcode[]]));

  for (let s of samples) {
    let instrNum = s.code[0];
    let ops = possibleOps.get(instrNum)!;
    if (ops.length === 1) continue;

    _.remove(ops, op => {
      let state = s.before.slice() as Registers;
      op(state, s.code);
      return (state[0] !== s.after[0] || state[1] !== s.after[1] || state[2] !== s.after[2] || state[3] !== s.after[3])
    });
  }

  let actualOp = new Map<number, Opcode>();
  let possibleOpsArr = Array.from(possibleOps.entries(), ([num, ops]) => ({num, ops}));
  while (possibleOpsArr.length) {
    possibleOpsArr = _.sortBy(possibleOpsArr, it => it.ops.length);
    let {num, ops} = possibleOpsArr.shift()!;
    if (ops.length !== 1) throw new Error(`Instruction number ${num} matched not 1 but ${ops.map(it => it.name)}`);
    actualOp.set(num, ops[0]);

    for (let other of possibleOpsArr) {
      if (other.num === num) continue;
      _.pull(other.ops, ops[0]);
    }
  }

  const testProgram = input.split('\n\n\n')[1].match(/\d+ \d+ \d+ \d+/g)!.map(line => line.split(' ').map(Number) as Instruction);
  let state = [0, 0, 0, 0] as Registers;
  for (let instr of testProgram) {
    let op = actualOp.get(instr[0])!;
    op(state, instr);
  }

  return state[0];
}

type Registers = [number, number, number, number];
type Instruction = [number, number, number, number];
type Opcode = (state: Registers, instr: Instruction) => void

const operations: Record<string, Opcode> = {
  addr: (state, [, inA, inB, outC]) => state[outC] = state[inA] + state[inB],
  addi: (state, [, inA, inB, outC]) => state[outC] = state[inA] + inB,

  mulr: (state, [, inA, inB, outC]) => state[outC] = state[inA] * state[inB],
  muli: (state, [, inA, inB, outC]) => state[outC] = state[inA] * inB,

  banr: (state, [, inA, inB, outC]) => state[outC] = state[inA] & state[inB],
  bani: (state, [, inA, inB, outC]) => state[outC] = state[inA] & inB,

  borr: (state, [, inA, inB, outC]) => state[outC] = state[inA] | state[inB],
  bori: (state, [, inA, inB, outC]) => state[outC] = state[inA] | inB,

  setr: (state, [, inA, , outC]) => state[outC] = state[inA],
  seti: (state, [, inA, , outC]) => state[outC] = inA,

  gtir: (state, [, inA, inB, outC]) => state[outC] = inA > state[inB] ? 1 : 0,
  gtri: (state, [, inA, inB, outC]) => state[outC] = state[inA] > inB ? 1 : 0,
  gtrr: (state, [, inA, inB, outC]) => state[outC] = state[inA] > state[inB] ? 1 : 0,

  eqir: (state, [, inA, inB, outC]) => state[outC] = inA === state[inB] ? 1 : 0,
  eqri: (state, [, inA, inB, outC]) => state[outC] = state[inA] === inB ? 1 : 0,
  eqrr: (state, [, inA, inB, outC]) => state[outC] = state[inA] === state[inB] ? 1 : 0,
};
main();
