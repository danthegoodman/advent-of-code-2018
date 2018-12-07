import * as assert from "assert";
import { readFileSync } from "fs";

function main() {
  const input = readFileSync(__dirname + "/input.txt", 'utf8').trim();

  assert.strictEqual(solveA("aA"), 0);
  assert.strictEqual(solveA("abBA"), 0);
  assert.strictEqual(solveA("abAB"), 4);
  assert.strictEqual(solveA("aabAAB"), 6);
  assert.strictEqual(solveA("dabAcCaCBAcCcaDA"), 10);
  console.log("A:", solveA(input));

  assert.strictEqual(solveB("dabAcCaCBAcCcaDA"), 4);
  console.log("B:", solveB(input));
}

main();

function oppositeCase(char: string) {
  if (char === char.toUpperCase()) {
    return char.toLowerCase();
  } else {
    return char.toUpperCase();
  }
}

function solveA(input: string) {
  let list = [];
  for (let c of input) {
    list.push(c);
    if (list[list.length - 2] && list[list.length - 2] === oppositeCase(c)) {
      list.pop();
      list.pop();
    }
  }
  return list.length;
}

function solveB(srcInput: string) {
  let a = 'a'.charCodeAt(0);
  let minNum = Number.POSITIVE_INFINITY;
  for(let n = 0; n < 26; n++){
    let char = String.fromCharCode(a + n);
    let withoutChar = srcInput.replace(new RegExp(char, "gi"), "");
    if(withoutChar.length === srcInput.length) continue;

    let charSolved = solveA(withoutChar);
    if(charSolved < minNum){
      minNum = charSolved;
    }
  }
  return minNum
}
