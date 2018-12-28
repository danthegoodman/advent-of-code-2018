import * as assert from "assert";
import { readFileSync } from "fs";
import * as _ from 'lodash';

function main() {
  const input = readFileSync(__dirname + "/input.txt", 'utf8').trim();
  let example1 = `
Immune System:
17 units each with 5390 hit points (weak to radiation, bludgeoning) with an attack that does 4507 fire damage at initiative 2
989 units each with 1274 hit points (immune to fire; weak to bludgeoning, slashing) with an attack that does 25 slashing damage at initiative 3

Infection:
801 units each with 4706 hit points (weak to radiation) with an attack that does 116 bludgeoning damage at initiative 1
4485 units each with 2961 hit points (immune to radiation; weak to fire, cold) with an attack that does 12 slashing damage at initiative 4
`.trim();
  assert.strictEqual(solveA(example1), 5216);
  assert.strictEqual(solveA(input), 14854);

  assert.strictEqual(solveB(input), 3467);
}

interface Group {
  readonly team: string,
  readonly hp: number,
  readonly initiative: number,
  readonly atkPower: number,
  readonly atkType: string,
  readonly weakness: string[],
  readonly immune: string[],
  units: number,
}

function parseInput(input: string) {
  let armies = input.split('\n\n').map(it => it.trim());
  let results: Group[] = [];

  for (let army of armies) {
    let lines = army.split('\n');
    let team = lines[0];
    for (let ln of lines.slice(1)) {

      results.push({
        team,
        units: matchNum(ln, /(\d+) units each/),
        hp: matchNum(ln, /with (\d+) hit points/),
        initiative: matchNum(ln, /at initiative (\d+)/),
        atkPower: matchNum(ln, /attack that does (\d+) \w+ damage/),
        atkType: matchStr(ln, /attack that does \d+ (\w+) damage/),
        weakness: maybeMatchStrList(ln, /weak to ([^;\)]+)/),
        immune: maybeMatchStrList(ln, /immune to ([^;\)]+)/),
      });
    }
  }

  return results;

  function matchNum(str: string, rex: RegExp) {
    return Number(str.match(rex)![1]);
  }

  function matchStr(str: string, rex: RegExp) {
    return str.match(rex)![1];
  }

  function maybeMatchStrList(str: string, rex: RegExp): string[] {
    let match = str.match(rex);
    if (!match) return [];
    let found = match[1];
    return found.split(', ');
  }
}

function countTeams(groups: Group[]): number {
  return _.uniq(groups.map(it => it.team)).length;
}

function effectivePower(group: Group): number {
  return group.units * group.atkPower;
}

function initiative(group: Group): number {
  return group.initiative;
}

function computeDamage(attacker: Group, defender: Group): number {
  if (defender.immune.includes(attacker.atkType)) return 0;

  let base = effectivePower(attacker);

  if (defender.weakness.includes(attacker.atkType)) {
    return base * 2;
  } else {
    return base;
  }
}

function selectTarget(attacker: Group, defenders: Group[]): Group | null {
  let maxDamage = 1;
  let options: Group[] = [];
  for (let def of defenders) {
    let dmg = computeDamage(attacker, def);
    if (dmg > maxDamage) {
      options = [def];
      maxDamage = dmg;
    } else if (dmg === maxDamage) {
      options.push(def);
    }
  }

  if (!options.length) return null;

  let orderedOptions = _.orderBy(options, [effectivePower, initiative], ['desc', 'desc']);
  return orderedOptions[0];
}

function runBattleSimulation(groups: Group[]) {
  while (countTeams(groups) > 1) {
    let targetSelectionGroups = _.orderBy(groups, [effectivePower, initiative], ['desc', 'desc']);
    let attackableGroups = [...groups];
    let attacks = [];

    for (let attacker of targetSelectionGroups) {
      let target = selectTarget(attacker, _.filter(attackableGroups, it => it.team !== attacker.team));
      if (!target) continue;
      attacks.push({attacker, target});
      _.pull(attackableGroups, target);
    }

    let numKilled = 0;
    attacks = _.orderBy(attacks, [it => it.attacker.initiative], ['desc']);
    for (let {attacker, target} of attacks) {
      if (attacker.units <= 0) continue;
      if (target.units <= 0) continue;
      let damage = computeDamage(attacker, target);
      let killed = Math.floor(damage / target.hp);
      numKilled += killed;
      target.units -= killed;
    }

    if (numKilled === 0) throw 'stalemate';

    _.remove(groups, it => it.units <= 0);
  }

  return groups;
}

function solveA(input: string) {
  let groups = parseInput(input);
  groups = runBattleSimulation(groups);
  return _.sum(groups.map(it => it.units));
}

function solveB(input: string) {
  let sourceGroups = parseInput(input);

  let boost = 0;
  while (true) {
    boost += 1;

    let groups = sourceGroups.map(it => {
      if (it.team.startsWith("Immune")) {
        return {...it, atkPower: it.atkPower + boost}
      } else {
        return {...it}
      }
    });

    try {
      groups = runBattleSimulation(groups);
    } catch (err) {
      if (err === "stalemate") continue;
      throw err;
    }

    if (groups[0].team.startsWith("Immune")) return _.sum(groups.map(it => it.units));
  }
}

main();
