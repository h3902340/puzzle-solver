"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let canvas = document.getElementById("mainCanvas");
let ctx = canvas.getContext("2d");
let cardWidth = 50;
let cardHeight = 50;
let cardPadding = 5;
let margin = 4;
let problemWidth = 3;
let problemHeight = 3;
let rawArray = [];
let initialState = [];
let scrambleStep = 100;
let isSolved = false;
let isSolving = false;
let solution = [];
let nodeCount = 1;
let elapsedTime = -1;
let timeout = 10;
function onInputWidth(value) {
    problemWidth = Number(value);
    if (problemWidth < 1) {
        problemWidth = 1;
    }
    createSolvedState();
    updateInitialState();
    drawBoard(initialState);
}
function onInputHeight(value) {
    problemHeight = Number(value);
    if (problemHeight < 1) {
        problemHeight = 1;
    }
    createSolvedState();
    updateInitialState();
    drawBoard(initialState);
}
function onInputScrambleStep(value) {
    scrambleStep = Number(value);
    if (scrambleStep < 1) {
        scrambleStep = 1;
    }
}
function onInputTimeout(value) {
    timeout = Number(value);
    if (timeout < 1) {
        timeout = 1;
    }
}
function drawHollowRect(rect, color, lineWidth) {
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.stroke();
}
function drawText(text, startPosition, color, font, size) {
    ctx.font = `${size}px ${font}`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, startPosition.x, startPosition.y + 4);
}
function drawBoard(board) {
    ctx.canvas.width = margin * 2 + problemWidth * cardWidth + (problemWidth - 1) * cardPadding;
    ctx.canvas.height = margin * 2 + problemHeight * cardHeight + (problemHeight - 1) * cardPadding;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    let center = {
        x: ctx.canvas.width * .5,
        y: ctx.canvas.height * .5
    };
    let boardWidth = problemWidth * cardWidth + (problemWidth - 1) * cardPadding;
    let boardHeight = problemHeight * cardHeight + (problemHeight - 1) * cardPadding;
    let topLeft = {
        x: center.x - boardWidth * .5,
        y: center.y - boardHeight * .5
    };
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] == 0)
                continue;
            drawHollowRect({ x: topLeft.x + (cardWidth + cardPadding) * j, y: topLeft.y + (cardHeight + cardPadding) * i, w: cardWidth, h: cardHeight }, 'white', 2);
            drawText(board[i][j].toString(), { x: topLeft.x + cardWidth * .5 + (cardWidth + cardPadding) * j, y: topLeft.y + cardHeight * .5 + (cardHeight + cardPadding) * i }, 'white', 'arial', 32);
        }
    }
}
function updateInitialState() {
    initialState = [];
    for (let i = 0; i < problemHeight; i++) {
        let row = [];
        for (let j = 0; j < problemWidth; j++) {
            row.push(rawArray[i * problemWidth + j]);
        }
        initialState.push(row);
    }
}
function createSolvedState() {
    rawArray = [];
    let element = 1;
    for (let i = 0; i < problemWidth; i++) {
        for (let j = 0; j < problemHeight; j++) {
            rawArray.push(element);
            element++;
        }
    }
    rawArray[rawArray.length - 1] = 0;
}
function scramble() {
    if (isSolving)
        return;
    createSolvedState();
    let zeroIndex = rawArray.length - 1;
    let scrambleCount = 0;
    while (scrambleCount < scrambleStep) {
        let direction = Math.floor(Math.random() * 4);
        switch (direction) {
            case 0:
                if (zeroIndex % problemWidth > 0) {
                    rawArray[zeroIndex] = rawArray[zeroIndex - 1];
                    rawArray[zeroIndex - 1] = 0;
                    zeroIndex = zeroIndex - 1;
                    scrambleCount++;
                }
                break;
            case 1:
                if (zeroIndex % problemWidth < problemWidth - 1) {
                    rawArray[zeroIndex] = rawArray[zeroIndex + 1];
                    rawArray[zeroIndex + 1] = 0;
                    zeroIndex = zeroIndex + 1;
                    scrambleCount++;
                }
                break;
            case 2:
                if (Math.floor(zeroIndex / problemWidth) > 0) {
                    rawArray[zeroIndex] = rawArray[zeroIndex - problemWidth];
                    rawArray[zeroIndex - problemWidth] = 0;
                    zeroIndex = zeroIndex - problemWidth;
                    scrambleCount++;
                }
                break;
            case 3:
                if (Math.floor(zeroIndex / problemWidth) < problemHeight - 1) {
                    rawArray[zeroIndex] = rawArray[zeroIndex + problemWidth];
                    rawArray[zeroIndex + problemWidth] = 0;
                    zeroIndex = zeroIndex + problemWidth;
                    scrambleCount++;
                }
                break;
        }
    }
    updateInitialState();
    drawBoard(initialState);
    isSolved = false;
}
function restore() {
    if (isSolving)
        return;
    drawBoard(initialState);
}
// use heuristic function to find the optimal solution for the 8-puzzle
function h(boardState) {
    let cost = 0;
    for (let i = 0; i < boardState.length; i++) {
        for (let j = 0; j < boardState[i].length; j++) {
            if (boardState[i][j] == 0)
                continue;
            cost += Math.abs((boardState[i][j] - 1) % boardState[i].length - j) + Math.abs(Math.floor((boardState[i][j] - 1) / boardState[i].length) - i);
        }
    }
    return cost;
}
function copyBoardState(boardState) {
    let copy = [];
    for (let i = 0; i < boardState.length; i++) {
        let row = [];
        for (let j = 0; j < boardState[i].length; j++) {
            row.push(boardState[i][j]);
        }
        copy.push(row);
    }
    return copy;
}
function solveByAStar() {
    let start = new Date();
    let rootHValue = h(initialState);
    let root = {
        position: {
            x: -1,
            y: -1
        },
        g: 0,
        h: rootHValue,
        f: rootHValue,
        boardState: initialState,
        children: [],
        parent: null,
        isEnd: rootHValue == 0,
    };
    let rootPositionFound = false;
    for (let i = 0; i < initialState.length; i++) {
        for (let j = 0; j < initialState[i].length; j++) {
            if (initialState[i][j] == 0) {
                root.position = {
                    x: j,
                    y: i
                };
                rootPositionFound = true;
                break;
            }
        }
        if (rootPositionFound)
            break;
    }
    let openList = [root];
    let closedList = [];
    let smallestLeaf = openList[0];
    while (true) {
        if (openList.length == 0)
            break;
        smallestLeaf = openList[0];
        for (let i = 1; i < openList.length; i++) {
            if (openList[i].f < smallestLeaf.f) {
                smallestLeaf = openList[i];
            }
        }
        if (smallestLeaf.isEnd)
            break;
        if (smallestLeaf.position.x > 0) {
            let boardState = copyBoardState(smallestLeaf.boardState);
            boardState[smallestLeaf.position.y][smallestLeaf.position.x] = boardState[smallestLeaf.position.y][smallestLeaf.position.x - 1];
            boardState[smallestLeaf.position.y][smallestLeaf.position.x - 1] = 0;
            let hValue = h(boardState);
            let child = {
                position: {
                    x: smallestLeaf.position.x - 1,
                    y: smallestLeaf.position.y
                },
                g: smallestLeaf.g + 1,
                h: hValue,
                f: smallestLeaf.g + 1 + hValue,
                boardState: boardState,
                children: [],
                parent: smallestLeaf,
                isEnd: hValue == 0
            };
            smallestLeaf.children.push(child);
        }
        if (smallestLeaf.position.x < problemWidth - 1) {
            let boardState = copyBoardState(smallestLeaf.boardState);
            boardState[smallestLeaf.position.y][smallestLeaf.position.x] = boardState[smallestLeaf.position.y][smallestLeaf.position.x + 1];
            boardState[smallestLeaf.position.y][smallestLeaf.position.x + 1] = 0;
            let hValue = h(boardState);
            let child = {
                position: {
                    x: smallestLeaf.position.x + 1,
                    y: smallestLeaf.position.y
                },
                g: smallestLeaf.g + 1,
                h: hValue,
                f: smallestLeaf.g + 1 + hValue,
                boardState: boardState,
                children: [],
                parent: smallestLeaf,
                isEnd: hValue == 0,
            };
            smallestLeaf.children.push(child);
        }
        if (smallestLeaf.position.y > 0) {
            let boardState = copyBoardState(smallestLeaf.boardState);
            boardState[smallestLeaf.position.y][smallestLeaf.position.x] = boardState[smallestLeaf.position.y - 1][smallestLeaf.position.x];
            boardState[smallestLeaf.position.y - 1][smallestLeaf.position.x] = 0;
            let hValue = h(boardState);
            let child = {
                position: {
                    x: smallestLeaf.position.x,
                    y: smallestLeaf.position.y - 1
                },
                g: smallestLeaf.g + 1,
                h: hValue,
                f: smallestLeaf.g + 1 + hValue,
                boardState: boardState,
                children: [],
                parent: smallestLeaf,
                isEnd: hValue == 0
            };
            smallestLeaf.children.push(child);
        }
        if (smallestLeaf.position.y < problemHeight - 1) {
            let boardState = copyBoardState(smallestLeaf.boardState);
            boardState[smallestLeaf.position.y][smallestLeaf.position.x] = boardState[smallestLeaf.position.y + 1][smallestLeaf.position.x];
            boardState[smallestLeaf.position.y + 1][smallestLeaf.position.x] = 0;
            let hValue = h(boardState);
            let child = {
                position: {
                    x: smallestLeaf.position.x,
                    y: smallestLeaf.position.y + 1
                },
                g: smallestLeaf.g + 1,
                h: hValue,
                f: smallestLeaf.g + 1 + hValue,
                boardState: boardState,
                children: [],
                parent: smallestLeaf,
                isEnd: hValue == 0
            };
            smallestLeaf.children.push(child);
        }
        closedList.push(smallestLeaf);
        openList.splice(openList.indexOf(smallestLeaf), 1);
        for (let k = 0; k < smallestLeaf.children.length; k++) {
            for (let l = 0; l < closedList.length; l++) {
                let isSame = true;
                for (let i = 0; i < initialState.length; i++) {
                    for (let j = 0; j < initialState[i].length; j++) {
                        if (smallestLeaf.children[k].boardState[i][j] != closedList[l].boardState[i][j]) {
                            isSame = false;
                            break;
                        }
                    }
                    if (!isSame)
                        break;
                }
                if (isSame) {
                    break;
                }
                if (l == closedList.length - 1) {
                    openList.push(smallestLeaf.children[k]);
                }
            }
        }
        nodeCount += smallestLeaf.children.length;
        if (new Date().getTime() - start.getTime() > timeout * 1000) {
            alert('Timeout!');
            break;
        }
    }
    solution = [smallestLeaf.boardState];
    while (smallestLeaf.parent) {
        solution = [smallestLeaf.parent.boardState].concat(solution);
        smallestLeaf = smallestLeaf.parent;
    }
}
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => setTimeout(resolve, ms));
    });
}
function solve() {
    return __awaiter(this, void 0, void 0, function* () {
        if (isSolving)
            return;
        isSolving = true;
        if (!isSolved) {
            let start = new Date();
            solveByAStar();
            elapsedTime = new Date().getTime() - start.getTime();
            isSolved = true;
        }
        document.getElementById("moveText").innerHTML = (solution.length - 1).toString();
        document.getElementById("elapsedTime").innerHTML = elapsedTime + ' ms';
        document.getElementById("nodeGenerated").innerHTML = nodeCount.toString();
        for (let k = 1; k < solution.length; k++) {
            drawBoard(solution[k]);
            yield sleep(200);
        }
        isSolving = false;
    });
}
createSolvedState();
updateInitialState();
drawBoard(initialState);