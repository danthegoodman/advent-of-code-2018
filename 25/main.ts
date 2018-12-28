import * as assert from "assert";
import { readFileSync } from "fs";
import * as _ from 'lodash';

function main() {
  const input = readFileSync(__dirname + "/input.txt", 'utf8').trim();
  let example1 = `
0,0,0,0
3,0,0,0
0,3,0,0
0,0,3,0
0,0,0,3
0,0,0,6
9,0,0,0
12,0,0,0
`.trim();
  assert.strictEqual(solveA(example1), 2);

  let example2 = `
-1,2,2,0
0,0,2,-2
0,0,0,-2
-1,2,0,0
-2,-2,-2,2
3,0,2,-1
-1,3,2,2
-1,0,-1,0
0,2,1,-2
3,0,0,0
`.trim();
  assert.strictEqual(solveA(example2), 4);

  let example3 = `
1,-1,0,1
2,0,-1,0
3,2,-1,0
0,0,3,1
0,0,-1,-1
2,3,-2,0
-2,2,0,0
2,-2,0,-1
1,-1,0,-1
3,2,0,2
`.trim();
  assert.strictEqual(solveA(example3), 3);

  let example4 = `
1,-1,-1,-2
-2,-2,0,1
0,2,1,3
-2,3,-2,1
0,2,3,-2
-1,-1,1,-2
0,-2,-1,0
-2,2,3,-1
1,2,2,0
-1,-2,0,-2
`.trim();
  assert.strictEqual(solveA(example4), 8);

  assert.strictEqual(solveA(input), 367);
}

type Point = {
  id: string,
  score: number,
  coord: [number, number, number, number]
};

function manhatanDistance(pa: Point, pb: Point) {
  let a = pa.coord;
  let b = pb.coord;
  return Math.abs(a[0] - b[0]) +
      Math.abs(a[1] - b[1]) +
      Math.abs(a[2] - b[2]) +
      Math.abs(a[3] - b[3]);
}

function solveA(input: string) {
  let points = input.split('\n').map(line => {
    let coord = line.match(/[-\d]+/g)!.map(Number);
    return {
      id: line,
      score: coord[0] + coord[1] + coord[2] + coord[3],
      coord: coord,
    }
  });
  let constellations = _.fromPairs(points.map((it, ndx) => [it.id, ndx] as [string, number]));

  let scoreTable = _.groupBy(points, it => it.score) as Record<number, Point[]>;
  let scoreKeys = _.sortBy(Object.keys(scoreTable).map(Number));

  let numChanged = 0;
  do {
    numChanged = 0;
    for (let s of scoreKeys) {
      for (let p of scoreTable[s]) {
        // You can save a bit of time by only looking at the points with a sum within three of yours
        for (let siblingOffset = 0; siblingOffset <= 3; siblingOffset++) {
          let siblings = scoreTable[s + siblingOffset] || [];
          for (let o of siblings) {
            if (o === p) continue;
            if (constellations[o.id] === constellations[p.id]) continue;
            if (manhatanDistance(p, o) <= 3) {
              let constId = Math.min(constellations[p.id], constellations[o.id]);
              constellations[o.id] = constId;
              constellations[p.id] = constId;
              numChanged++
            }
          }
        }
      }
    }
  } while (numChanged);

  return _.uniq(Object.values(constellations)).length;
}

main();
