import * as assert from "assert";
import { readFileSync } from "fs";
import _ = require("lodash");

function main() {
  const inputFile = readFileSync(__dirname + "/input.txt", 'utf8').trim();
  const exampleA = "abcdef bababc abbcde abcccd aabcdd abcdee ababab";

  assert.strictEqual(solveA(exampleA), 12);
  console.log("A:", solveA(inputFile));

  const exampleB = "abcde fghij klmno pqrst fguij axcye wvxyz";

  assert.strictEqual(solveB(exampleB), "fgij");
  console.log("B:", solveB(inputFile));
}

main();

function solveA(input: string) {
  let words = input.split(/\s/);
  let twice = 0;
  let thrice = 0;
  for (let w of words) {
    let counts = _.values(_.countBy(w.split('')));
    if (counts.includes(2)) twice++;
    if (counts.includes(3)) thrice++;
  }
  return twice * thrice;
}

function solveB(input: string) {
  let words = input.split(/\s/);

  for(let i = 0; i < words.length; i++){
    let wi = words[i].split('');

    for(let j = i + 1; j < words.length; j++){
      let wj = words[j].split('');

      let common = '';
      for(let n = 0; n < wj.length; n++){
        if(wi[n] === wj[n]) common += wi[n];
      }

      if(common.length === wi.length - 1) return common;
    }
  }

  return -1;
}
