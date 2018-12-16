import * as assert from "assert";
import { readFileSync } from "fs";

function main() {
  const input = readFileSync(__dirname + "/input.txt", 'utf8').trim();

  assert.strictEqual(solveA("9"), "5158916779");
  assert.strictEqual(solveA("5"), "0124515891");
  assert.strictEqual(solveA("18"), "9251071085");
  assert.strictEqual(solveA("2018"), "5941429882");
  assert.strictEqual(solveA(input), "1150511382");

  assert.strictEqual(solveB("51589"), 9);
  assert.strictEqual(solveB("59414"), 2018);
  assert.strictEqual(solveB(input), 20173656);
}

function solveA(input: string): string {
  let limit = Number(input);
  let state = [3, 7];
  let ndx0 = 0;
  let ndx1 = 1;

  while(state.length < limit + 10){
    let newRecipes = String(state[ndx0] + state[ndx1]).split('').map(Number);
    state.push(...newRecipes);

    ndx0 = (ndx0 + state[ndx0] + 1) % state.length;
    ndx1 = (ndx1 + state[ndx1] + 1) % state.length;
  }

  return state.slice(limit, limit + 10).join('');
}

function solveB(input: string): number {
  let state = [3, 7];
  let ndx0 = 0;
  let ndx1 = 1;

  while(true){
    let newRecipes = String(state[ndx0] + state[ndx1]).split('').map(Number);
    state.push(...newRecipes);
    ndx0 = (ndx0 + state[ndx0] + 1) % state.length;
    ndx1 = (ndx1 + state[ndx1] + 1) % state.length;

    let stateTail = state.slice(state.length - input.length - 2).join('');
    if(stateTail.includes(input)){
      return state.join('').indexOf(input);
    }
  }

}

main();
