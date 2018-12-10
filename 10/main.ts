import * as assert from "assert";
import { readFileSync } from "fs";
import * as _ from 'lodash';

function main() {
  const input = readFileSync(__dirname + "/input.txt", 'utf8').trim();
  const example = `
position=< 9,  1> velocity=< 0,  2>
position=< 7,  0> velocity=<-1,  0>
position=< 3, -2> velocity=<-1,  1>
position=< 6, 10> velocity=<-2, -1>
position=< 2, -4> velocity=< 2,  2>
position=<-6, 10> velocity=< 2, -2>
position=< 1,  8> velocity=< 1, -1>
position=< 1,  7> velocity=< 1,  0>
position=<-3, 11> velocity=< 1, -2>
position=< 7,  6> velocity=<-1, -1>
position=<-2,  3> velocity=< 1,  0>
position=<-4,  3> velocity=< 2,  0>
position=<10, -3> velocity=<-1,  1>
position=< 5, 11> velocity=< 1, -2>
position=< 4,  7> velocity=< 0, -1>
position=< 8, -2> velocity=< 0,  1>
position=<15,  0> velocity=<-2,  0>
position=< 1,  6> velocity=< 1,  0>
position=< 8,  9> velocity=< 0, -1>
position=< 3,  3> velocity=<-1,  1>
position=< 0,  5> velocity=< 0, -1>
position=<-2,  2> velocity=< 2,  0>
position=< 5, -2> velocity=< 1,  2>
position=< 1,  4> velocity=< 2,  1>
position=<-2,  7> velocity=< 2, -2>
position=< 3,  6> velocity=<-1, -1>
position=< 5,  0> velocity=< 1,  0>
position=<-6,  0> velocity=< 2,  0>
position=< 5,  9> velocity=< 1, -2>
position=<14,  7> velocity=<-2,  0>
position=<-3,  6> velocity=< 2, -1>`.trim();

  // A is solved by reading the console output
  // and interpreting the tall character output.
  assert.strictEqual(solveB(example), 3);
  assert.strictEqual(solveB(input), 10124);
}

function getYDelta(points: Array<{y:number}>) {
  let ys = points.map(it=>it.y);
  return _.max(ys)! - _.min(ys)!;
}

function solveB(input: string): number {
  let points = input.split('\n').map(it => {
    let [x, y, xVel, yVel] = it.match(/([0-9-]+)/g)!.map(Number);
    return {x, y, xVel, yVel};
  });

  let t = 0;
  let yDelt = getYDelta(points);
  while(true){
    t++;
    for(let p of points){
      p.x += p.xVel;
      p.y += p.yVel;
    }

    let newYDelt = getYDelta(points);
    console.log(newYDelt);
    if(newYDelt > yDelt){
      for(let p of points){
        p.x -= p.xVel;
        p.y -= p.yVel;
      }
      t--;
      break;
    }
    yDelt = newYDelt;
  }

  let xs = points.map(it=>it.x);
  let ys = points.map(it=>it.y);
  let xmin = _.min(xs)!;
  let xmax = _.max(xs)!;
  let ymax = _.max(ys)!;
  let ymin = _.min(ys)!;
  let grid = _.times(ymax - ymin + 1, ()=> _.times(xmax - xmin + 1, ()=> '.'));
  for(let p of points){
    grid[p.y - ymin][p.x - xmin] = '#';
  }
  console.log(grid.map(it=>it.join('')).join('\n'));

  return t;
}

main();
