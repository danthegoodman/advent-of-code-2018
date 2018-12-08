import * as assert from "assert";
import { readFileSync } from "fs";

function main() {
  const input = readFileSync(__dirname + "/input.txt", 'utf8').trim();
  const example = "2 3 0 3 10 11 12 1 1 0 1 99 2 1 1 2";

  assert.strictEqual(solveA(example), 138);
  assert.strictEqual(solveA(input), 36566);

  assert.strictEqual(solveB(example), 66);
  assert.strictEqual(solveB(input), 30548);
}


function solveA(input: string): number {
  let nums = input.split(' ').map(Number);
  nums.reverse();
  return processNode(nums);

  function processNode(nums: number[]) {
    let children = nums.pop()!;
    let metadata = nums.pop()!;

    let result = 0;
    while (children > 0) {
      result += processNode(nums);
      children -= 1;
    }

    while (metadata > 0) {
      result += nums.pop()!;
      metadata -= 1;
    }

    return result;
  }
}

function solveB(input: string): number {
  let nums = input.split(' ').map(Number);
  nums.reverse();
  return processNode(nums);

  function processNode(nums: number[]) {
    let children = nums.pop()!;
    let metadata = nums.pop()!;

    let childValues = [];
    while (children > 0) {
      childValues.push(processNode(nums));
      children -= 1;
    }

    let result = 0;
    while (metadata > 0) {
      if(childValues.length){
        let childNdx = nums.pop()!;
        result += (childValues[childNdx - 1] || 0);
      } else {
        result += nums.pop()!;
      }
      metadata -= 1;
    }

    return result;
  }
}

main();
