import * as assert from "assert";
import { readFileSync } from "fs";
import LinkedList = require('linked-list');

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
  let list = LinkedList.from(Array.from(input, it => {
    let item = new LinkedList.Item();
    item.value = it;
    return item;
  }));

  let ndx = 0;
  let node = list.head;
  while(node){
    if(node.prev && node.prev.value === oppositeCase(node.value)){
      let finalNode = node.next;
      node.prev.detach();
      node.detach();
      node = finalNode;
      ndx -= 1;
    } else {
      node = node.next;
      ndx += 1;
    }
  }
  return ndx;
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
