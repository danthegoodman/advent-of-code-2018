import * as assert from "assert";
import { readFileSync } from "fs";
import * as _ from 'lodash';

function main() {
  const input = readFileSync(__dirname + "/input.txt", 'utf8').trim();
  let example = 'depth: 510\ntarget: 10,10';
  assert.strictEqual(solveA(example), 114);
  assert.strictEqual(solveA(input), 6323);

  assert.strictEqual(solveB(example), 45);

  let start = process.hrtime();
  assert.strictEqual(solveB(input), 982);
  let t = process.hrtime(start);
  console.log(`${(t[0] * 1e3) + (t[1] * 1e-6)}ms`);
}

function solveA(input: string) {
  let [depth, targetX, targetY] = input.match(/\d+/g)!.map(Number);
  let erosionTable: number[][] = _.times(targetX + 1, () => _.times(targetY + 1, () => 0));

  let totalRisk = 0;
  for (let y = 0; y <= targetY; y++) {
    for (let x = 0; x <= targetX; x++) {
      computeErosionLevel(x, y);
      totalRisk += erosionTable[x][y] % 3;
    }
  }

  return totalRisk;

  function computeErosionLevel(x: number, y: number) {
    let geologicIndex: number;
    if (x === 0 && y === 0) {
      geologicIndex = 0;
    } else if (x === targetX && y === targetY) {
      geologicIndex = 0;
    } else if (y === 0) {
      geologicIndex = x * 16807;
    } else if (x === 0) {
      geologicIndex = y * 48271;
    } else {
      geologicIndex = erosionTable[x - 1][y] * erosionTable[x][y - 1];
    }

    erosionTable[x][y] = (geologicIndex + depth) % 20183;
  }
}

function solveB(input: string) {
  // const NOTHING /**/ = 0b001;
  const TORCH /*******/ = 0b010;
  // const GEAR /*****/ = 0b100;

  const ROCKY /*******/ = 0b110;
  const WET /*********/ = 0b101;
  const NARROW /******/ = 0b011;

  let [depth, targetX, targetY] = input.match(/\d+/g)!.map(Number);

  let getTerrain = (() => {
    let erosionTable: number[][] = [];
    let terrainTable: number[][] = [];

    function fillInTables(x: number, y: number) {
      let geologicIndex: number;
      if (x === 0 && y === 0) {
        geologicIndex = 0;
      } else if (x === targetX && y === targetY) {
        geologicIndex = 0;
      } else if (y === 0) {
        geologicIndex = x * 16807;
      } else if (x === 0) {
        geologicIndex = y * 48271;
      } else {
        let ea: number;
        let era = erosionTable[x - 1];
        if (era !== undefined && era[y] !== undefined) ea = era[y];
        else ea = fillInTables(x - 1, y);

        let eb: number;
        let erb = erosionTable[x];
        if (erb !== undefined && erb[y - 1] !== undefined) eb = erb[y - 1];
        else eb = fillInTables(x, y - 1);

        geologicIndex = ea * eb;
      }

      let erosionValue = (geologicIndex + depth) % 20183;
      (erosionTable[x] || (erosionTable[x] = []))[y] = erosionValue;

      let risk = erosionValue % 3;
      let terrainValue = (risk === 0 ? ROCKY : (risk === 1 ? WET : NARROW));
      (terrainTable[x] || (terrainTable[x] = []))[y] = terrainValue;

      return erosionValue;
    }

    return (x: number, y: number) => {
      let tr = terrainTable[x];
      if (tr !== undefined && tr[y] !== undefined) return tr[y];
      fillInTables(x, y);
      return terrainTable[x][y];
    }
  })();

  let guysSeen = new Set<string>();

  let investigations = [[{e: TORCH, x: 0, y: 0}]];

  for (let t = 0; ; t++) {
    let round = investigations[t];
    if (!round || !round.length) continue;

    let oneMin = (investigations[t + 1] || (investigations[t + 1] = []));
    let eightMin = (investigations[t + 8] || (investigations[t + 8] = []));
    for (let {e, x, y} of round) {
      // Has someone just like you been here before?
      let guyKey = `${e},${x},${y}`;
      if (guysSeen.has(guyKey)) continue;
      guysSeen.add(guyKey);

      // Are you at the destination?
      if (x === targetX && y === targetY) {
        //Are you properly equipped for the search?
        if (e === TORCH) return t;

        let sevenMin = (investigations[t + 7] || (investigations[t + 7] = []));
        sevenMin.push({e: TORCH, x, y});
        continue;
      }

      {
        let nextTerrain = getTerrain(x + 1, y);
        if (nextTerrain & e) oneMin.push({e, x: x + 1, y});
        else eightMin.push({e: getTerrain(x, y) & nextTerrain, x: x + 1, y})
      }
      {
        let nextTerrain = getTerrain(x, y + 1);
        if (nextTerrain & e) oneMin.push({e, x, y: y + 1});
        else eightMin.push({e: getTerrain(x, y) & nextTerrain, x, y: y + 1})
      }
      if (x > 0) {
        let nextTerrain = getTerrain(x - 1, y);
        if (nextTerrain & e) oneMin.push({e, x: x - 1, y});
        else eightMin.push({e: getTerrain(x, y) & nextTerrain, x: x - 1, y})
      }
      if (y > 0) {
        let nextTerrain = getTerrain(x, y - 1);
        if (nextTerrain & e) oneMin.push({e, x, y: y - 1});
        else eightMin.push({e: getTerrain(x, y) & nextTerrain, x, y: y - 1})
      }
    }
  }
}

main();
