"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const _ = require("lodash");
const chai_1 = require("chai");
function main() {
    const inputFile = fs_1.readFileSync(__dirname + "/input.txt", 'utf8').trim();
    const exampleA = "abcdef bababc abbcde abcccd aabcdd abcdee ababab";
    chai_1.expect(solveA(exampleA)).to.equal(12);
    console.log("A:", solveA(inputFile));
    const exampleB = "abcde fghij klmno pqrst fguij axcye wvxyz";
    chai_1.expect(solveB(exampleB)).to.equal("fgij");
    console.log("B:", solveB(inputFile));
}
main();
function solveA(input) {
    let words = input.split(/\s/);
    let twice = 0;
    let thrice = 0;
    for (let w of words) {
        let counts = _.values(_.countBy(w.split('')));
        if (counts.includes(2))
            twice++;
        if (counts.includes(3))
            thrice++;
    }
    return twice * thrice;
}
function solveB(input) {
    let words = input.split(/\s/);
    for (let i = 0; i < words.length; i++) {
        let wi = words[i].split('');
        for (let j = i + 1; j < words.length; j++) {
            let wj = words[j].split('');
            let common = '';
            for (let n = 0; n < wj.length; n++) {
                if (wi[n] === wj[n])
                    common += wi[n];
            }
            if (common.length === wi.length - 1)
                return common;
        }
    }
    return -1;
}
