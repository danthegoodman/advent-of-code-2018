import { readFileSync } from "fs";
import { expect } from 'chai';
import _ = require("lodash");

function main() {
  const input = readFileSync(__dirname + "/input.txt", 'utf8').trim();
  const example =
      "[1518-11-01 00:00] Guard #10 begins shift\n" +
      "[1518-11-01 00:05] falls asleep\n" +
      "[1518-11-01 00:25] wakes up\n" +
      "[1518-11-01 00:30] falls asleep\n" +
      "[1518-11-01 00:55] wakes up\n" +
      "[1518-11-01 23:58] Guard #99 begins shift\n" +
      "[1518-11-02 00:40] falls asleep\n" +
      "[1518-11-02 00:50] wakes up\n" +
      "[1518-11-03 00:05] Guard #10 begins shift\n" +
      "[1518-11-03 00:24] falls asleep\n" +
      "[1518-11-03 00:29] wakes up\n" +
      "[1518-11-04 00:02] Guard #99 begins shift\n" +
      "[1518-11-04 00:36] falls asleep\n" +
      "[1518-11-04 00:46] wakes up\n" +
      "[1518-11-05 00:03] Guard #99 begins shift\n" +
      "[1518-11-05 00:45] falls asleep\n" +
      "[1518-11-05 00:55] wakes up";

  expect(solveA(example)).to.equal(240);
  console.log("A:", solveA(input));

  expect(solveB(example)).to.equal(4455);
  console.log("B:", solveB(input));
}

main();

function parseLogs(input: string) {
  let result = input.split(/\n/).map(it => {
    let [, timestamp, action] = /\[([^\]]+)] (.+)/.exec(it)!;
    let [, minute] = /:(\d+)$/.exec(timestamp)!.map(Number);
    return {timestamp, minute, action};
  });
  return _.sortBy(result, it => it.timestamp);
}

function buildSleepyTimes(logs: ReturnType<typeof parseLogs>) {
  let sleepyTimes = [];
  let guard = -1;
  let sleepStart = -1;

  for (let l of logs) {
    let guardMatch = /Guard #(\d+)/.exec(l.action);
    if (guardMatch) {
      if (sleepStart !== -1) console.log("Already asleep!");
      guard = Number(guardMatch[1]);
      sleepStart = -1;
      continue;
    }

    if (l.action.startsWith('falls')) {
      sleepStart = l.minute;
    }

    if (l.action.startsWith('wakes')) {
      if (sleepStart === -1) console.log("Already awake!");
      sleepyTimes.push({
        guard,
        minutes: _.range(sleepStart, l.minute)
      });
      sleepStart = -1;
    }
  }

  return sleepyTimes;
}

function solveA(input: string) {
  let logs = parseLogs(input);
  let sleepyTimes = buildSleepyTimes(logs);

  let guardsSleepyTimes = _.values(_.groupBy(sleepyTimes, it => it.guard));

  let sleepiestGuardTimes = _.maxBy(guardsSleepyTimes, times => _.sumBy(times, it => it.minutes.length))!;

  let allSleepingMinutes = _.flatten(sleepiestGuardTimes.map(it => it.minutes));
  let minutesCounts = _.toPairs(_.countBy(allSleepingMinutes));
  let mostCommonMinute = Number(_.maxBy(minutesCounts, it => it[1])![0]);

  return sleepiestGuardTimes[0].guard * mostCommonMinute;
}

function solveB(input: string) {
  let logs = parseLogs(input);
  let sleepyTimes = buildSleepyTimes(logs);

  let guardsSleepyTimes = _.values(_.groupBy(sleepyTimes, it => it.guard));
  let guardsMostSleepingMinute = _.map(guardsSleepyTimes, times => {
    let allSleepingMinutes = _.flatten(times.map(it => it.minutes));
    let minutesCounts = _.toPairs(_.countBy(allSleepingMinutes));
    let mostCommonPair = _.maxBy(minutesCounts, it => it[1])!;
    return {guard: times[0].guard, minute: Number(mostCommonPair[0]), times: mostCommonPair[1]};
  });

  let mostSleepingMinute = _.maxBy(guardsMostSleepingMinute, it=>it.times)!;
  return mostSleepingMinute.guard * mostSleepingMinute.minute
}
