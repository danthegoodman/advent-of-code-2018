import * as assert from "assert";
import { readFileSync } from "fs";
import * as _ from 'lodash';

function main() {
  const input = readFileSync(__dirname + "/input.txt", 'utf8').trim();
  const example =
      "Step C must be finished before step A can begin.\n" +
      "Step C must be finished before step F can begin.\n" +
      "Step A must be finished before step B can begin.\n" +
      "Step A must be finished before step D can begin.\n" +
      "Step B must be finished before step E can begin.\n" +
      "Step D must be finished before step E can begin.\n" +
      "Step F must be finished before step E can begin.";

  assert.strictEqual(solveA(example), "CABDFE");
  console.log("A:", solveA(input));

  assert.strictEqual(solveB(example, 0, 2), 15);
  console.log("B:", solveB(input, 60, 5));
}

type Step = { begin: string, end: string };

function parseInput(input: string): Step[] {
  return input.split('\n').map(it => {
    let [, begin, end] = /Step ([A-Z]) must be finished before step ([A-Z]) can begin./.exec(it)!;
    return {begin, end};
  });
}

function findBestChar(chars: string[], steps: Step[]) {
  return chars.find(ch => steps.every(s => s.end !== ch))!;
}

function solveA(input: string) {
  let steps = parseInput(input);
  let chars = _.uniq(_.concat(steps.map(it => it.begin), steps.map(it => it.end)));
  chars.sort();

  let result = "";
  while (chars.length) {
    let ch = findBestChar(chars, steps);
    result += ch;
    _.pull(chars, ch);
    _.remove(steps, s => s.begin === ch);
  }
  return result;
}

function solveB(input: string, timePerStep: number, numWorkers: number) {
  let steps = parseInput(input);
  let chars = _.uniq(_.concat(steps.map(it => it.begin), steps.map(it => it.end)));
  chars.sort();

  let busyWorkers: { time: number, char: string }[] = [];
  let time = 0;

  function advanceTime() {
    time += 1;
    for (let w of busyWorkers) {
      w.time -= 1;
    }

    _.remove(busyWorkers, w => w.time === 0).forEach(w => {
      _.remove(steps, s => s.begin === w.char);
    });
  }

  while (busyWorkers.length || chars.length) {
    let nextChar = null;
    if (busyWorkers.length < numWorkers) {
      nextChar = findBestChar(chars, steps);
    }

    if(!nextChar){
      advanceTime();
      continue;
    }

    _.pull(chars, nextChar);
    let charTime = (nextChar.charCodeAt(0) - 'A'.charCodeAt(0)) + 1;
    busyWorkers.push({time: timePerStep + charTime, char: nextChar});
  }

  return time;
}

main();
