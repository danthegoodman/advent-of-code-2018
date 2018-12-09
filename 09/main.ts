import * as assert from "assert";
import { readFileSync } from "fs";
import * as _ from 'lodash';
import LinkedList = require("linked-list");

function main() {
  const input = readFileSync(__dirname + "/input.txt", 'utf8').trim();

  assert.strictEqual(solveA("9 players; last marble is worth 25 points"), 32);
  assert.strictEqual(solveA("10 players; last marble is worth 1618 points"), 8317);
  assert.strictEqual(solveA("13 players; last marble is worth 7999 points"), 146373);
  assert.strictEqual(solveA("17 players; last marble is worth 1104 points"), 2764);
  assert.strictEqual(solveA("21 players; last marble is worth 6111 points"), 54718);
  assert.strictEqual(solveA("30 players; last marble is worth 5807 points"), 37305);
  assert.strictEqual(solveA(input), 412127);

  assert.strictEqual(solveB(input), -1);
}

function solveA(input: string): number {
  let [, numPlayers, numMarbles] = input.match(/(\d+) players.*worth (\d+) points/)!.map(Number);
  let scores = _.times(numPlayers, ()=>0);
  let marbleChain = [0,2,1];
  let ndx = 1;

  for(let marble = 3; marble <= numMarbles; marble++){
    if (marble % 23 == 0){
      let player = marble % numPlayers;
      let removedIndex = ndx - 7;
      if (removedIndex < 0){
        removedIndex += marbleChain.length;
      }
      let [removedMarble] = marbleChain.splice(removedIndex, 1);
      scores[player] += marble + removedMarble;
      ndx = removedIndex;
    } else {
      let insertionIndex = ndx + 2;
      if (insertionIndex > marbleChain.length) {
        insertionIndex = 1;
      }
      marbleChain.splice(insertionIndex, 0, marble);
      ndx = insertionIndex;
    }
  }

  return _.max(scores)!;
}

function linkedItem(val: number) {
  let item = new LinkedList.Item();
  item.value = val;
  return item;
}

function solveB(input: string): number {
  let [, numPlayers, numMarbles] = input.match(/(\d+) players.*worth (\d+) points/)!.map(Number);
  numMarbles *= 100;
  let scores = _.times(numPlayers, ()=>0);
  let marbleChain = new LinkedList(linkedItem(0), linkedItem(2), linkedItem(1));
  let node = marbleChain.head!.next!;

  for(let marble = 3; marble <= numMarbles; marble++){
    if(marble % 10000 === 0) console.log(marble);
    if (marble % 23 == 0){
      let player = marble % numPlayers;
      let removedNode = node;
      for(let i = 0; i < 7; i++){
        removedNode = removedNode.prev || marbleChain.tail!;
      }
      node = removedNode.next || marbleChain.head!;
      scores[player] += marble + removedNode.value;
      removedNode.detach();
    } else {
      let insertAfterNode = node;
      insertAfterNode = node.next || marbleChain.head!;
      insertAfterNode.append(linkedItem(marble));
      node = insertAfterNode.next!;
    }
  }

  return _.max(scores)!;
}

main();
