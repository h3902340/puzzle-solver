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
let scrambleStep = 3000;
let isSolved = false;
let isSolving = false;
let solution = [];
let nodeCount = 0;
let elapsedTime = -1;
let timeout = 10;
let isTimeout = false;
let center = { x: -1, y: -1 };
let topLeft = { x: -1, y: -1 };
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
    let boardWidth = problemWidth * cardWidth + (problemWidth - 1) * cardPadding;
    let boardHeight = problemHeight * cardHeight + (problemHeight - 1) * cardPadding;
    ctx.canvas.width = margin * 2 + boardWidth;
    ctx.canvas.height = margin * 2 + boardHeight;
    center = {
        x: ctx.canvas.width * .5,
        y: ctx.canvas.height * .5
    };
    topLeft = {
        x: center.x - boardWidth * .5,
        y: center.y - boardHeight * .5
    };
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] == 0)
                continue;
            drawHollowRect({ x: topLeft.x + (cardWidth + cardPadding) * j, y: topLeft.y + (cardHeight + cardPadding) * i, w: cardWidth, h: cardHeight }, 'white', 2);
            drawText(board[i][j].toString(), { x: topLeft.x + cardWidth * .5 + (cardWidth + cardPadding) * j, y: topLeft.y + cardHeight * .5 + (cardHeight + cardPadding) * i }, 'white', 'arial', 32);
        }
    }
}
function drawAnimatedBoard(start, finish) {
    return __awaiter(this, void 0, void 0, function* () {
        drawBoard(start.boardState);
        let movingPieceStart = finish.position;
        let movingPieceFinish = start.position;
        let frameCount = 15;
        let currentFrame = 0;
        let movingStepX = (movingPieceFinish.x - movingPieceStart.x) / frameCount;
        let movingStepY = (movingPieceFinish.y - movingPieceStart.y) / frameCount;
        let currentX = movingPieceStart.x;
        let currentY = movingPieceStart.y;
        let rect = {
            x: topLeft.x + (cardWidth + cardPadding) * currentX,
            y: topLeft.y + (cardHeight + cardPadding) * currentY,
            w: cardWidth,
            h: cardHeight
        };
        let number = start.boardState[finish.position.y][finish.position.x].toString();
        while (currentFrame < frameCount) {
            currentFrame++;
            ctx.clearRect(rect.x - 2, rect.y - 2, rect.w + 4, rect.h + 4);
            currentX += movingStepX;
            currentY += movingStepY;
            rect = {
                x: topLeft.x + (cardWidth + cardPadding) * currentX,
                y: topLeft.y + (cardHeight + cardPadding) * currentY,
                w: cardWidth,
                h: cardHeight
            };
            drawHollowRect(rect, 'white', 2);
            drawText(number, {
                x: topLeft.x + cardWidth * .5 + (cardWidth + cardPadding) * currentX,
                y: topLeft.y + cardHeight * .5 + (cardHeight + cardPadding) * currentY
            }, 'white', 'arial', 32);
            yield sleep(16);
        }
    });
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
function hardest1() {
    if (isSolving)
        return;
    problemHeight = 3;
    problemWidth = 3;
    document.getElementById("problemHeight").value = problemHeight.toString();
    document.getElementById("problemWidth").value = problemWidth.toString();
    initialState = [
        [8, 6, 7],
        [2, 5, 4],
        [3, 0, 1]
    ];
    drawBoard(initialState);
    isSolved = false;
}
function hardest2() {
    if (isSolving)
        return;
    problemHeight = 3;
    problemWidth = 3;
    document.getElementById("problemHeight").value = problemHeight.toString();
    document.getElementById("problemWidth").value = problemWidth.toString();
    initialState = [
        [6, 4, 7],
        [8, 5, 0],
        [3, 2, 1]
    ];
    drawBoard(initialState);
    isSolved = false;
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
function heuristic(boardState) {
    let cost = 0;
    for (let i = 0; i < boardState.length; i++) {
        for (let j = 0; j < boardState[i].length; j++) {
            if (boardState[i][j] == 0)
                continue;
            // manhattan distance
            let xPos = (boardState[i][j] - 1) % boardState[i].length;
            let yPos = Math.floor((boardState[i][j] - 1) / boardState[i].length);
            cost += Math.abs(xPos - j) + Math.abs(yPos - i);
            // check for linear conflicts
            if (xPos == j && yPos == i)
                continue;
            if (xPos == j) {
                for (let k = i + 1; k <= yPos; k++) {
                    let xPos2 = (boardState[k][j] - 1) % boardState[k].length;
                    let yPos2 = Math.floor((boardState[k][j] - 1) / boardState[k].length);
                    if (xPos2 == xPos && yPos2 < yPos) {
                        cost += 2;
                    }
                }
            }
            else if (yPos == i) {
                for (let k = j + 1; k <= xPos; k++) {
                    let xPos2 = (boardState[i][k] - 1) % boardState[i].length;
                    let yPos2 = Math.floor((boardState[i][k] - 1) / boardState[i].length);
                    if (yPos2 == yPos && xPos2 < xPos) {
                        cost += 2;
                    }
                }
            }
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
    let rootHValue = heuristic(initialState);
    let root = {
        position: {
            x: -1,
            y: -1
        },
        g: 0,
        f: rootHValue,
        boardState: initialState,
        parent: null,
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
    // min heap
    let openList = [root];
    let closedList = new Set();
    // hash set
    let smallestNode = openList[0];
    nodeCount = 0;
    while (true) {
        smallestNode = openList[0];
        if (smallestNode.f == smallestNode.g)
            break;
        let children = [];
        let neighborBoards = getNeighborBoardList(smallestNode);
        for (let i = 0; i < neighborBoards.length; i++) {
            let isRepeated = false;
            let parent = smallestNode.parent;
            while (parent) {
                if (isBoardEqual(neighborBoards[i].board, parent.boardState)) {
                    isRepeated = true;
                    break;
                }
                parent = parent.parent;
            }
            if (isRepeated)
                continue;
            let hValue = heuristic(neighborBoards[i].board);
            let child = {
                position: neighborBoards[i].position,
                g: smallestNode.g + 1,
                f: smallestNode.g + 1 + hValue,
                boardState: neighborBoards[i].board,
                parent: smallestNode,
            };
            children.push(child);
        }
        closedList.add(serializeBoardState(smallestNode.boardState));
        openList[0] = openList[openList.length - 1];
        openList.pop();
        let currentIndex = 0;
        // delete min from the min heap
        while (true) {
            let leftChildIndex = currentIndex * 2 + 1;
            let rightChildIndex = currentIndex * 2 + 2;
            let smallerChildIndex = -1;
            if (rightChildIndex < openList.length) {
                smallerChildIndex = openList[leftChildIndex].f < openList[rightChildIndex].f ? leftChildIndex : rightChildIndex;
            }
            else if (leftChildIndex < openList.length) {
                smallerChildIndex = leftChildIndex;
            }
            else {
                break;
            }
            if (openList[currentIndex].f < openList[smallerChildIndex].f) {
                break;
            }
            else {
                let temp = openList[currentIndex];
                openList[currentIndex] = openList[smallerChildIndex];
                openList[smallerChildIndex] = temp;
                currentIndex = smallerChildIndex;
            }
        }
        for (let k = 0; k < children.length; k++) {
            if (closedList.has(serializeBoardState(children[k].boardState)))
                continue;
            openList.push(children[k]);
            let currentIndex = openList.length - 1;
            while (true) {
                if (currentIndex == 0)
                    break;
                let parentIndex = Math.floor((currentIndex - 1) * .5);
                if (openList[currentIndex].f < openList[parentIndex].f) {
                    let temp = openList[currentIndex];
                    openList[currentIndex] = openList[parentIndex];
                    openList[parentIndex] = temp;
                    currentIndex = parentIndex;
                }
                else {
                    break;
                }
            }
        }
        if (new Date().getTime() - start.getTime() > timeout * 1000) {
            alert('Timeout!');
            isTimeout = true;
            break;
        }
    }
    nodeCount = closedList.size + openList.length;
    solution = [smallestNode];
    while (smallestNode.parent) {
        solution = [smallestNode.parent].concat(solution);
        smallestNode = smallestNode.parent;
    }
}
function isBoardEqual(board1, board2) {
    for (let i = 0; i < board1.length; i++) {
        for (let j = 0; j < board1[i].length; j++) {
            if (board1[i][j] != board2[i][j])
                return false;
        }
    }
    return true;
}
function getNeighborBoardList(vertex) {
    let boardList = [];
    if (vertex.position.x > 0) {
        let board = copyBoardState(vertex.boardState);
        board[vertex.position.y][vertex.position.x] = board[vertex.position.y][vertex.position.x - 1];
        board[vertex.position.y][vertex.position.x - 1] = 0;
        boardList.push({
            board: board,
            position: {
                x: vertex.position.x - 1,
                y: vertex.position.y
            }
        });
    }
    if (vertex.position.x < vertex.boardState[0].length - 1) {
        let board = copyBoardState(vertex.boardState);
        board[vertex.position.y][vertex.position.x] = board[vertex.position.y][vertex.position.x + 1];
        board[vertex.position.y][vertex.position.x + 1] = 0;
        boardList.push({
            board: board,
            position: {
                x: vertex.position.x + 1,
                y: vertex.position.y
            }
        });
    }
    if (vertex.position.y > 0) {
        let board = copyBoardState(vertex.boardState);
        board[vertex.position.y][vertex.position.x] = board[vertex.position.y - 1][vertex.position.x];
        board[vertex.position.y - 1][vertex.position.x] = 0;
        boardList.push({
            board: board,
            position: {
                x: vertex.position.x,
                y: vertex.position.y - 1
            }
        });
    }
    if (vertex.position.y < vertex.boardState.length - 1) {
        let board = copyBoardState(vertex.boardState);
        board[vertex.position.y][vertex.position.x] = board[vertex.position.y + 1][vertex.position.x];
        board[vertex.position.y + 1][vertex.position.x] = 0;
        boardList.push({
            board: board,
            position: {
                x: vertex.position.x,
                y: vertex.position.y + 1
            }
        });
    }
    return boardList;
}
function serializeBoardState(board) {
    let output = '';
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (i == board.length - 1 && j == board[i].length - 1) {
                output += board[i][j];
            }
            else {
                output += board[i][j] + ',';
            }
        }
    }
    return output;
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
        isTimeout = false;
        if (!isSolved) {
            let start = new Date();
            solveByAStar();
            elapsedTime = new Date().getTime() - start.getTime();
            if (!isTimeout) {
                isSolved = true;
            }
        }
        document.getElementById("moveText").innerHTML = (solution.length - 1).toString();
        document.getElementById("elapsedTime").innerHTML = elapsedTime + ' ms';
        document.getElementById("nodeGenerated").innerHTML = nodeCount.toString();
        if (!isTimeout) {
            for (let k = 0; k < solution.length - 1; k++) {
                yield drawAnimatedBoard(solution[k], solution[k + 1]);
                yield sleep(200);
            }
        }
        isSolving = false;
    });
}
createSolvedState();
updateInitialState();
drawBoard(initialState);
