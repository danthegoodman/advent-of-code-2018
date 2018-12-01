"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const _ = require("lodash");
const chai_1 = require("chai");
function main() {
    const inputFile = fs_1.readFileSync(__dirname + "/input.txt", 'utf8').trim();
    chai_1.expect(solveA("+1 +1 +1")).to.equal(3);
    chai_1.expect(solveA("+1 +1 -2")).to.equal(0);
    chai_1.expect(solveA("-1 -2 -3")).to.equal(-6);
    console.log("A:", solveA(inputFile));
    chai_1.expect(solveB("+1 -1")).to.equal(0);
    chai_1.expect(solveB("+3 +3 +4 -2 -4")).to.equal(10);
    chai_1.expect(solveB("-6 +3 +8 +5 -6")).to.equal(5);
    chai_1.expect(solveB("+7 +7 -2 -7 -4")).to.equal(14);
    console.log("B:", solveB(inputFile));
}
main();
function solveA(input) {
    let parts = input.split(/\s/).map(Number);
    return _.sum(parts);
}
function solveB(input) {
    let parts = input.split(/\s/).map(Number);
    let state = 0;
    let seenState = new Set([state]);
    while (true) {
        for (let p of parts) {
            state += p;
            if (seenState.has(state)) {
                return state;
            }
            seenState.add(state);
        }
    }
}
