import * as assert from "assert";
import { readFileSync } from "fs";
import * as _ from 'lodash';

function main() {
  const input = readFileSync(__dirname + "/input.txt", 'utf8').trim();
  let example1 = "" +
      "#######\n" +
      "#.G...#\n" +
      "#...EG#\n" +
      "#.#.#G#\n" +
      "#..G#E#\n" +
      "#.....#\n" +
      "#######";

  let example2 = "" +
      "#######\n" +
      "#G..#E#\n" +
      "#E#E.E#\n" +
      "#G.##.#\n" +
      "#...#E#\n" +
      "#...E.#\n" +
      "#######";

  let example3 = "" +
      "#######\n" +
      "#E..EG#\n" +
      "#.#G.E#\n" +
      "#E.##E#\n" +
      "#G..#.#\n" +
      "#..E#.#\n" +
      "#######";

  let example4 = "" +
      "#######\n" +
      "#E.G#.#\n" +
      "#.#G..#\n" +
      "#G.#.G#\n" +
      "#G..#.#\n" +
      "#...E.#\n" +
      "#######";

  let example5 = "" +
      "#######\n" +
      "#.E...#\n" +
      "#.#..G#\n" +
      "#.###.#\n" +
      "#E#G#G#\n" +
      "#...#G#\n" +
      "#######";

  let example6 = "" +
      "#########\n" +
      "#G......#\n" +
      "#.E.#...#\n" +
      "#..##..G#\n" +
      "#...##..#\n" +
      "#...#...#\n" +
      "#.G...G.#\n" +
      "#.....G.#\n" +
      "#########";

  assert.strictEqual(solveA(example1), 27730);
  assert.strictEqual(solveA(example2), 36334);
  assert.strictEqual(solveA(example3), 39514);
  assert.strictEqual(solveA(example4), 27755);
  assert.strictEqual(solveA(example5), 28944);
  assert.strictEqual(solveA(example6), 18740);
  assert.strictEqual(solveA(input), 201123);


  assert.strictEqual(solveB(example1), 4988);
  assert.strictEqual(solveB(example3), 31284);
  assert.strictEqual(solveB(example4), 3478);
  assert.strictEqual(solveB(example5), 6474);
  assert.strictEqual(solveB(example6), 1140);
  assert.strictEqual(solveB(input), 54188);
}

type Options = { input: string, elfPower: number, throwOnElfDeath: boolean };
const ELF_DEAD = Symbol("An elf has died");

enum Type { Open, Wall, Goblin, Elf }

type Space = { type: Type.Open | Type.Wall }
type Fighter = { type: Type.Goblin | Type.Elf, atk: number, hp: number, r: number, c: number }
type MapItem = Space | Fighter

function solveCommon({input, elfPower, throwOnElfDeath}: Options) {
  let map = parseInput(input);
  let roundNumber = 0;
  let elvesRemaining = _.sumBy(map, row => _.sumBy(row, it => it.type === Type.Elf ? 1 : 0));
  let goblinsRemaining = _.sumBy(map, row => _.sumBy(row, it => it.type === Type.Goblin ? 1 : 0));

  resolveUntilSomeoneIsVictorious();
  let hpRemaining = _.sumBy(map, row => _.sumBy(row, it => (it.type === Type.Elf || it.type === Type.Goblin) ? it.hp : 0));
  return roundNumber * hpRemaining;

  function parseInput(input: string): MapItem[][] {
    return input.split('\n').map((ln, r) => ln.split('').map((ch, c) => parseInputCharacter(ch, r, c)));

    function parseInputCharacter(ch: string, r: number, c: number): MapItem {
      if (ch === '.') return {type: Type.Open};
      if (ch === '#') return {type: Type.Wall};
      if (ch === 'G') return {type: Type.Goblin, atk: 3, hp: 200, r, c};
      if (ch === 'E') return {type: Type.Elf, atk: elfPower, hp: 200, r, c};
      throw new Error(`invalid input: '${ch}'`);
    }
  }

  function resolveUntilSomeoneIsVictorious() {
    let fightersDoneThisRound = new Set<MapItem>();
    for (let r = 0; r < map.length; r++) {
      for (let c = 0; c < map[r].length; c++) {
        let fighter = map[r][c];
        if (fighter.type !== Type.Elf && fighter.type !== Type.Goblin) continue;

        if (fightersDoneThisRound.has(fighter)) continue;
        fightersDoneThisRound.add(fighter);

        if (isOneSideWipedOut()) return;
        let opponentType = fighter.type === Type.Goblin ? Type.Elf : Type.Goblin;
        let didAttack = attackNearestOpponent(fighter, opponentType);
        if (!didAttack) {
          moveToNearestOpponent(fighter, opponentType);
          attackNearestOpponent(fighter, opponentType);
        }
      }
    }

    roundNumber++;
    resolveUntilSomeoneIsVictorious();
  }

  function isOneSideWipedOut() {
    return elvesRemaining === 0 || goblinsRemaining === 0
  }

  function moveToNearestOpponent(fighter: Fighter, opponentType: Type) {
    let newPoint = findPointToMoveTo(fighter, opponentType);
    if (!newPoint) return;

    map[fighter.r][fighter.c] = {type: Type.Open};
    map[newPoint.r][newPoint.c] = fighter;
    fighter.r = newPoint.r;
    fighter.c = newPoint.c;
  }

  function findPointToMoveTo(fighter: Fighter, opponentType: Type) {
    let {r, c} = fighter;
    let walkable = map.map(row => row.map(it => it.type === Type.Open));
    let queue: Array<{ r: number, c: number, d: number, base: { r: number, c: number } }> = [];

    queue.push(
        {r: r - 1, c: c, d: 0, base: {r: r - 1, c: c}},
        {r: r, c: c - 1, d: 0, base: {r: r, c: c - 1}},
        {r: r, c: c + 1, d: 0, base: {r: r, c: c + 1}},
        {r: r + 1, c: c, d: 0, base: {r: r + 1, c: c}},
    );

    while (true) {
      const next = queue.shift();
      if (!next) return null; //nothing more to check.

      let {r, c} = next;
      if (map[r][c].type === opponentType) return next.base;

      if (!walkable[r][c]) continue;

      // no longer walkable, as we've already walked here.
      walkable[r][c] = false;

      // TODO optimize: A list which maintains it's sort order would be more efficient here.
      queue.push(
          {r: r - 1, c: c, d: next.d + 1, base: next.base},
          {r: r, c: c - 1, d: next.d + 1, base: next.base},
          {r: r, c: c + 1, d: next.d + 1, base: next.base},
          {r: r + 1, c: c, d: next.d + 1, base: next.base},
      );
      queue = _.sortBy(queue, it=>it.d, it=>it.r, it=>it.c);
    }
  }

  function attackNearestOpponent(fighter: Fighter, opponentType: Type) {
    let {r, c} = fighter;
    let items = [map[r - 1][c], map[r][c - 1], map[r][c + 1], map[r + 1][c]];
    let opponents = items.filter(it => it.type === opponentType) as Fighter[];
    if (!opponents.length) return false;

    let weakest = _.minBy(opponents, it => it.hp)!;
    weakest.hp -= fighter.atk;

    if (weakest.hp <= 0) {
      if (weakest.type === Type.Goblin) {
        goblinsRemaining -= 1;
      } else {
        if (throwOnElfDeath) throw ELF_DEAD;
        elvesRemaining -= 1;
      }
      map[weakest.r][weakest.c] = {type: Type.Open};
    }
    return true;
  }
}

function solveA(input: string): number {
  return solveCommon({input, elfPower: 3, throwOnElfDeath: false});
}

function solveB(input: string): number {
  let elfPower = 4;
  while (true) {
    try {
      return solveCommon({input, elfPower, throwOnElfDeath: true});
    } catch (err) {
      if (err === ELF_DEAD) {
        elfPower += 1;
      } else {
        throw err;
      }
    }
  }
}

main();
