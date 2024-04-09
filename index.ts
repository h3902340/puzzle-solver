type Rect = {
    x: number;
    y: number;
    w: number;
    h: number;
};

type Position = {
    x: number;
    y: number;
}

type Vertex = {
    position: Position,
    g: number,
    h: number,
    f: number,
    boardState: number[][],
    children: Vertex[],
    parent: Vertex | null,
    isEnd: boolean
}

let canvas: HTMLCanvasElement = document.getElementById("mainCanvas") as HTMLCanvasElement;
let ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
let cardWidth: number = 50;
let cardHeight: number = 50;
let cardPadding: number = 5;
let margin: number = 4;
let problemWidth: number = 3;
let problemHeight: number = 3;
let rawArray: number[] = [];
let initialState: number[][] = [];
let scrambleStep: number = 100;
let isSolved: boolean = false;
let isSolving: boolean = false;
let solution: number[][][] = [];
let nodeCount: number = 1;
let elapsedTime: number = -1;
let timeout: number = 10;

function onInputWidth(value: any) {
    problemWidth = Number(value);
    if (problemWidth < 1) {
        problemWidth = 1;
    }
    createSolvedState();
    updateInitialState();
    drawBoard(initialState);
}


function onInputHeight(value: any) {
    problemHeight = Number(value);
    if (problemHeight < 1) {
        problemHeight = 1;
    }
    createSolvedState();
    updateInitialState();
    drawBoard(initialState);
}

function onInputScrambleStep(value: any) {
    scrambleStep = Number(value);
    if (scrambleStep < 1) {
        scrambleStep = 1;
    }
}

function onInputTimeout(value: any) {
    timeout = Number(value);
    if (timeout < 1) {
        timeout = 1;
    }
}

function drawHollowRect(rect: Rect, color: string, lineWidth: number): void {
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.stroke();
}

function drawText(text: string, startPosition: Position, color: string, font: string, size: number): void {
    ctx.font = `${size}px ${font}`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, startPosition.x, startPosition.y + 4);
}

function drawBoard(board: number[][]) {
    ctx.canvas.width = margin * 2 + problemWidth * cardWidth + (problemWidth - 1) * cardPadding;
    ctx.canvas.height = margin * 2 + problemHeight * cardHeight + (problemHeight - 1) * cardPadding;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    let center: Position = {
        x: ctx.canvas.width * .5,
        y: ctx.canvas.height * .5
    }
    let boardWidth = problemWidth * cardWidth + (problemWidth - 1) * cardPadding;
    let boardHeight = problemHeight * cardHeight + (problemHeight - 1) * cardPadding;
    let topLeft: Position = {
        x: center.x - boardWidth * .5,
        y: center.y - boardHeight * .5
    }
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] == 0) continue;
            drawHollowRect({ x: topLeft.x + (cardWidth + cardPadding) * j, y: topLeft.y + (cardHeight + cardPadding) * i, w: cardWidth, h: cardHeight }, 'white', 2);
            drawText(board[i][j].toString(), { x: topLeft.x + cardWidth * .5 + (cardWidth + cardPadding) * j, y: topLeft.y + cardHeight * .5 + (cardHeight + cardPadding) * i }, 'white', 'arial', 32);
        }
    }
}

function updateInitialState() {
    initialState = [];
    for (let i = 0; i < problemHeight; i++) {
        let row: number[] = [];
        for (let j = 0; j < problemWidth; j++) {
            row.push(rawArray[i * problemWidth + j]);
        }
        initialState.push(row);
    }
}

function createSolvedState() {
    rawArray = [];
    let element: number = 1;
    for (let i = 0; i < problemWidth; i++) {
        for (let j = 0; j < problemHeight; j++) {
            rawArray.push(element);
            element++;
        }
    }
    rawArray[rawArray.length - 1] = 0;
}

function scramble() {
    if (isSolving) return;
    createSolvedState();
    let zeroIndex: number = rawArray.length - 1;
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
    if (isSolving) return;
    drawBoard(initialState);
}

// use heuristic function to find the optimal solution for the 8-puzzle
function h(boardState: number[][]): number {
    let cost: number = 0;
    for (let i = 0; i < boardState.length; i++) {
        for (let j = 0; j < boardState[i].length; j++) {
            if (boardState[i][j] == 0) continue;
            cost += Math.abs((boardState[i][j] - 1) % boardState[i].length - j) + Math.abs(Math.floor((boardState[i][j] - 1) / boardState[i].length) - i);
        }
    }
    return cost;
}

function copyBoardState(boardState: number[][]): number[][] {
    let copy: number[][] = [];
    for (let i = 0; i < boardState.length; i++) {
        let row: number[] = [];
        for (let j = 0; j < boardState[i].length; j++) {
            row.push(boardState[i][j]);
        }
        copy.push(row);
    }
    return copy;
}

function solveByAStar() {
    let start = new Date();
    let rootHValue: number = h(initialState);
    let root: Vertex = {
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

    let rootPositionFound: boolean = false;
    for (let i = 0; i < initialState.length; i++) {
        for (let j = 0; j < initialState[i].length; j++) {
            if (initialState[i][j] == 0) {
                root.position = {
                    x: j,
                    y: i
                }
                rootPositionFound = true;
                break;
            }
        }
        if (rootPositionFound) break;
    }

    let openList: Vertex[] = [root];
    let closedList: Set<Vertex> = new Set();
    let smallestLeaf: Vertex = openList[0];
    while (true) {
        if (openList.length == 0) break;
        smallestLeaf = openList[0];
        for (let i = 1; i < openList.length; i++) {
            if (openList[i].f < smallestLeaf.f) {
                smallestLeaf = openList[i];
            }
        }

        if (smallestLeaf.isEnd) break;
        if (smallestLeaf.position.x > 0) {
            let boardState: number[][] = copyBoardState(smallestLeaf.boardState);
            boardState[smallestLeaf.position.y][smallestLeaf.position.x] = boardState[smallestLeaf.position.y][smallestLeaf.position.x - 1];
            boardState[smallestLeaf.position.y][smallestLeaf.position.x - 1] = 0;
            let hValue: number = h(boardState);
            let child: Vertex = {
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
            }
            smallestLeaf.children.push(child);
        }
        if (smallestLeaf.position.x < problemWidth - 1) {
            let boardState: number[][] = copyBoardState(smallestLeaf.boardState);
            boardState[smallestLeaf.position.y][smallestLeaf.position.x] = boardState[smallestLeaf.position.y][smallestLeaf.position.x + 1];
            boardState[smallestLeaf.position.y][smallestLeaf.position.x + 1] = 0;
            let hValue: number = h(boardState);
            let child: Vertex = {
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
            }
            smallestLeaf.children.push(child);
        }
        if (smallestLeaf.position.y > 0) {
            let boardState: number[][] = copyBoardState(smallestLeaf.boardState);
            boardState[smallestLeaf.position.y][smallestLeaf.position.x] = boardState[smallestLeaf.position.y - 1][smallestLeaf.position.x];
            boardState[smallestLeaf.position.y - 1][smallestLeaf.position.x] = 0;
            let hValue: number = h(boardState);
            let child: Vertex = {
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
            }
            smallestLeaf.children.push(child);
        }
        if (smallestLeaf.position.y < problemHeight - 1) {
            let boardState: number[][] = copyBoardState(smallestLeaf.boardState);
            boardState[smallestLeaf.position.y][smallestLeaf.position.x] = boardState[smallestLeaf.position.y + 1][smallestLeaf.position.x];
            boardState[smallestLeaf.position.y + 1][smallestLeaf.position.x] = 0;
            let hValue: number = h(boardState);
            let child: Vertex = {
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
            }
            smallestLeaf.children.push(child);
        }

        closedList.add(smallestLeaf);
        openList.splice(openList.indexOf(smallestLeaf), 1);
        for (let k = 0; k < smallestLeaf.children.length; k++) {
            if (closedList.has(smallestLeaf.children[k])) {
                break;
            }
            openList.push(smallestLeaf.children[k]);
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

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function solve() {
    if (isSolving) return;
    isSolving = true;
    if (!isSolved) {
        let start = new Date();
        solveByAStar();
        elapsedTime = new Date().getTime() - start.getTime();
        isSolved = true;
    }

    document.getElementById("moveText")!.innerHTML = (solution.length - 1).toString();
    document.getElementById("elapsedTime")!.innerHTML = elapsedTime + ' ms';
    document.getElementById("nodeGenerated")!.innerHTML = nodeCount.toString();

    for (let k = 1; k < solution.length; k++) {
        drawBoard(solution[k]);
        await sleep(200);
    }
    isSolving = false;
}

createSolvedState();
updateInitialState();
drawBoard(initialState);