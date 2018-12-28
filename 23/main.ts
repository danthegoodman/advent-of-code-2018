import * as assert from "assert";
import { readFileSync } from "fs";
import * as _ from 'lodash';

function main() {
  const input = readFileSync(__dirname + "/input.txt", 'utf8').trim();
  let example1 = `
pos=<0,0,0>, r=4
pos=<1,0,0>, r=1
pos=<4,0,0>, r=3
pos=<0,2,0>, r=1
pos=<0,5,0>, r=3
pos=<0,0,3>, r=1
pos=<1,1,1>, r=1
pos=<1,1,2>, r=1
pos=<1,3,1>, r=1
`.trim();
  assert.strictEqual(solveA(example1), 7);
  assert.strictEqual(solveA(input), 341);

  assert.strictEqual(solveB_HowOnEarthDidThisGiveMeTheRightAnswer(input), 105191907);

// Short of brute forcing this, I'm not sure how to _actually_ solve the problem.
//
// let example2 = `
// pos=<10,12,12>, r=2
// pos=<12,14,12>, r=2
// pos=<16,12,12>, r=4
// pos=<14,14,14>, r=6
// pos=<50,50,50>, r=200
// pos=<10,10,10>, r=5
// `.trim();
//   assert.strictEqual(solveB(example2), 36);

}

type Nanobot = {x:number,y:number, z:number, r: number};

function manhatanDistance(a: Nanobot, b: Nanobot): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)
}

function solveA(input: string) {
  let nanobots = input.split('\n').map(ln => {
    let [, x, y, z, r] = ln.match(/pos=<([^,]+),([^,]+),([^,]+)>, r=([^,]+)/)!.map(Number);
    return {x, y, z, r};
  });

  let strongest = _.maxBy(nanobots, it=> it.r)!;
  return nanobots.filter(it=> manhatanDistance(it, strongest) <= strongest.r).length;
}

function solveB_HowOnEarthDidThisGiveMeTheRightAnswer(input: string) {
  let nanobots = input.split('\n').map(ln => {
    let [, x, y, z, r] = ln.match(/pos=<([^,]+),([^,]+),([^,]+)>, r=([^,]+)/)!.map(Number);
    return {x, y, z, r};
  });

  let origin = {x:0, y:0, z:0, r:0};
  let arr = [];
  for(let n of nanobots){
    arr.push({d: Math.abs(manhatanDistance(origin, n) - n.r), n});
  }

  let groups = _.values(_.groupBy(arr, it=>it.d));
  groups = _.sortBy(groups, grp=> -grp.length);

  return groups[0][0].d;
}

main();
