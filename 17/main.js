"use strict";
/// <reference lib="dom" />
Object.defineProperty(exports, "__esModule", { value: true });
const $sidebar = document.querySelector('#sidebar');
const $canvas = document.querySelector('#canvas');
const $ctx = $canvas.getContext('2d');
let subFrameDelay = 0;
function setup() {
    let example1 = `
x=495, y=2..7
y=7, x=495..501
x=501, y=3..7
x=498, y=2..4
x=506, y=1..2
x=498, y=10..13
x=504, y=10..13
y=13, x=498..504
`.trim();
    addButton("Example 1", () => run(example1, 40));
    let example2 = `
x=495, y=2..7
y=7, x=495..501
x=501, y=3..7
x=507, y=1..2
x=498, y=10..13
x=506, y=10..14
y=14 x=498..506
y=12 x=502..503
`.trim();
    addButton("Example 2", () => run(example2, 40));
    addButton("Input", () => run(INPUT, 4));
}
const SAND = 1;
const WATER = 2;
const STILLWATER = 3;
const CLAY = 4;
function addButton(text, action) {
    let btn = $sidebar.appendChild(document.createElement('button'));
    btn.innerText = text;
    btn.addEventListener('click', action, false);
}
function parseInput(input) {
    let locations = input.split('\n').map(it => {
        let [base, min, max] = it.match(/\d+/g).map(Number);
        if (it[0] === 'x') {
            return { xMin: base, xMax: base, yMin: min, yMax: max };
        }
        else {
            return { xMin: min, xMax: max, yMin: base, yMax: base };
        }
    });
    let xMin = _.min(locations.map(it => it.xMin)) - 1;
    let xMax = _.max(locations.map(it => it.xMax)) + 1;
    let yMin = _.min(locations.map(it => it.yMin));
    let yMax = _.max(locations.map(it => it.yMax));
    let grid = _.times(xMax - xMin + 1, () => _.times(yMax - yMin + 1, () => SAND));
    for (let l of locations) {
        for (let x = l.xMin; x <= l.xMax; x++) {
            for (let y = l.yMin; y <= l.yMax; y++) {
                grid[x - xMin][y - yMin] = CLAY;
            }
        }
    }
    return {
        grid,
        startX: 500 - xMin,
    };
}
function renderGrid(grid, scale) {
    $canvas.width = grid.length * scale;
    $canvas.height = grid[0].length * scale;
    $ctx.scale(scale, scale);
    $ctx.fillStyle = "black";
    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[x].length; y++) {
            if (grid[x][y] === CLAY) {
                $ctx.rect(x, y, 1, 1);
            }
        }
    }
    $ctx.fill();
}
async function drawWater(x, y, frameDelay) {
    $ctx.fillStyle = "#1E90FF";
    $ctx.fillRect(x, y, 1, 1);
    if (frameDelay < 20) {
        if (subFrameDelay < 20) {
            subFrameDelay += frameDelay;
        }
        else {
            await new Promise(resolve => setTimeout(resolve, subFrameDelay));
            subFrameDelay = 0;
        }
    }
    else {
        await new Promise(resolve => setTimeout(resolve, frameDelay));
    }
}
function drawStillwater(x, y) {
    $ctx.fillStyle = "#4169E1";
    $ctx.fillRect(x, y, 1, 1);
}
async function run(input, scale) {
    const { grid, startX } = parseInput(input);
    const downspouts = [{ x: startX, y: 0 }];
    let frameDelay = 1000 / grid.length;
    while ($sidebar.firstChild)
        $sidebar.firstChild.remove();
    addButton("Faster", () => frameDelay /= 2);
    addButton("Slower", () => frameDelay *= 2);
    let $status = $sidebar.appendChild(document.createElement('div'));
    $status.innerHTML = `Running...`;
    renderGrid(grid, scale);
    while (downspouts.length) {
        let { x, y } = downspouts.shift();
        await fillFromDownspout(x, y);
    }
    let counts = countWaters(grid);
    $status.innerHTML = "" +
        "Results:<br/>" +
        `Part 1: ${counts.water + counts.stillwater}<br/>` +
        `Part 2: ${counts.stillwater}`;
    return;
    async function fillFromDownspout(x, y) {
        if (grid[x][y] === WATER)
            return;
        if (grid[x][y] === STILLWATER)
            return;
        y = await fillDown(x, y);
        if (!Number.isFinite(y))
            return;
        await fillSideways(x, y);
    }
    async function fillDown(x, y) {
        while (true) {
            grid[x][y] = WATER;
            await drawWater(x, y, frameDelay);
            let next = grid[x][y + 1];
            if (next === undefined)
                return Number.POSITIVE_INFINITY;
            if (next === CLAY)
                break;
            if (next === STILLWATER)
                break;
            y++;
        }
        return y;
    }
    async function fillSideways(sourceX, sourceY) {
        const sideshoots = [{ x: sourceX, y: sourceY }];
        while (sideshoots.length) {
            const ss = sideshoots.pop();
            if (grid[ss.x][ss.y] !== WATER) {
                grid[ss.x][ss.y] = WATER;
                await drawWater(ss.x, ss.y, frameDelay);
            }
            let hitSideCount = 0;
            for (let xDelt of [-1, +1]) {
                let { x, y } = ss;
                while (true) {
                    let nextSideElem = grid[x + xDelt][y];
                    if (nextSideElem === CLAY) {
                        hitSideCount += 1;
                        break;
                    }
                    x += xDelt;
                    if (grid[x][y] !== WATER) {
                        grid[x][y] = WATER;
                        await drawWater(x, y, frameDelay);
                    }
                    let elemBelow = grid[x][y + 1];
                    if (elemBelow === WATER)
                        break;
                    if (elemBelow === SAND) {
                        downspouts.push({ x: x, y: y + 1 });
                        break;
                    }
                }
            }
            if (hitSideCount == 2) {
                sideshoots.push({ x: ss.x, y: ss.y - 1 });
                makeStillWater(ss.x, ss.y);
            }
        }
    }
    function makeStillWater(startX, y) {
        for (let xDelt of [-1, +1]) {
            let x = startX;
            while (grid[x][y] === WATER || grid[x][y] === STILLWATER) {
                grid[x][y] = STILLWATER;
                drawStillwater(x, y);
                x += xDelt;
            }
        }
    }
}
function countWaters(grid) {
    let water = 0;
    let stillwater = 0;
    for (let row of grid) {
        for (let it of row) {
            if (it === WATER)
                water++;
            if (it === STILLWATER)
                stillwater++;
        }
    }
    return { water, stillwater };
}
setup();
