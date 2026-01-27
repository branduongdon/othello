"use strict";
const ROWS = 8;
const COLUMNS = 8;

var board = [];
var blackToMove = true;

/*
a b c d e f g h
- - - - - - - - 1
- - - - - - - - 2
- - - - - - - - 3
- - - W B - - - 4
- - - B W - - - 5
- - - - - - - - 6
- - - - - - - - 7
- - - - - - - - 8
*/

const testBoards = [
    ["B", "W", "W", "-", "-", "-", "-", "-",
     "-", "-", "-", "-", "-", "W", "W", "W",
     "-", "-", "-", "-", "-", "-", "-", "-",
     "-", "-", "B", "W", "B", "-", "-", "-",
     "-", "W", "W", "B", "W", "W", "-", "-",
     "-", "-", "-", "-", "-", "-", "-", "-",
     "-", "-", "-", "-", "-", "-", "-", "-",
     "-", "-", "B", "B", "W", "B", "W", "-",],
    ["-", "-", "-", "-", "-", "-", "B", "-",
     "-", "-", "-", "-", "-", "-", "-", "W",
     "-", "-", "-", "-", "-", "-", "-", "-",
     "-", "-", "-", "W", "B", "-", "-", "-",
     "-", "-", "-", "B", "W", "-", "-", "-",
     "-", "-", "-", "-", "-", "-", "-", "-",
     "-", "-", "-", "-", "-", "-", "-", "-",
     "-", "-", "-", "-", "-", "-", "-", "-",],
    ["-", "-", "-", "-", "-", "-", "-", "-",
     "-", "-", "-", "-", "-", "-", "-", "-",
     "-", "-", "-", "-", "-", "-", "-", "W",
     "B", "-", "-", "-", "-", "-", "-", "-",
     "-", "-", "-", "-", "-", "-", "-", "-",
     "-", "-", "-", "-", "-", "-", "-", "-",
     "-", "-", "-", "-", "-", "-", "-", "-",
     "-", "-", "-", "-", "-", "-", "-", "-",],
    ["-", "-", "-", "-", "-", "-", "-", "-",
     "-", "-", "-", "-", "-", "-", "-", "B",
     "W", "-", "-", "-", "-", "-", "-", "-",
     "-", "-", "-", "-", "-", "-", "-", "-",
     "-", "-", "-", "-", "-", "-", "-", "-",
     "-", "-", "-", "-", "-", "-", "-", "-",
     "-", "-", "-", "-", "-", "-", "-", "-",
     "-", "-", "-", "-", "-", "-", "-", "-",],
];

class Coordinate {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }
    toPosition() {
        return 8*this.row + this.col;
    }
    isValid() {
        return (this.row > -1) && (this.row < 8) && (this.col > -1) && (this.col < 8);
    }
    getAdjacent() {
        // Does not check the validity 
        return [
            new Coordinate(this.row-1, this.col-1),
            new Coordinate(this.row-1, this.col),
            new Coordinate(this.row-1, this.col+1),
            new Coordinate(this.row  , this.col+1),
            new Coordinate(this.row+1, this.col+1),
            new Coordinate(this.row+1, this.col  ),
            new Coordinate(this.row+1, this.col-1),
            new Coordinate(this.row  , this.col-1),
        ]
    }
    /*
    setCoordinate(row, col) {
        this.row = row;
        this.col = col;
    }
        */
}

function initBoard() {
    for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLUMNS; c++) {
            var idx = 8*r + c;
            board[idx] = "-";
        }
    }
    board[27] = "W";
    board[28] = "B";
    board[35] = "B";
    board[36] = "W";

    blackToMove = true;
}

function printBoard() {
    console.log("a b c d e f g h")
    for (var r = 0; r < ROWS; r++) {
        var output = ""
        for (var c = 0; c < COLUMNS; c++) {
            var idx = 8*r + c;
            output += (board[idx]) + " ";
        }
        console.log(output + (r + 1));
    }
}

// Translates algebraic notation to the appropriate index for
// the board representation.
function algebraicToIdx(algebraic) {
    return algebraicToCoordinate(algebraic).toPosition();
}

function algebraicToCoordinate(algebraic) {
    if (typeof algebraic != "string" || algebraic.length != 2)
        return -1;

    var col = algebraic[0].toLowerCase(); // "h"
    var row = algebraic[1].toLowerCase(); // "8"

    // bounds checking
    if (col < 'a' || col > 'h') return -1;
    if (Number(row) < 1 || Number(row) > 8) return -1;

    return new Coordinate(Number(row)-1, col.charCodeAt(0) - 'a'.charCodeAt(0));

}

function positionToRowAndCol(position) {
    // [row, column]
    return [Math.floor(position / 8), position % 8]
}

function getOppositeColorSymbol() {
    return blackToMove ? "W" : "B";
}

function getCurrentColorSymbol() {
    return blackToMove ? "B" : "W";
}

/*
Legal moves for black, move 1
a b c d e f g h
- - - - - - - - 1
- - - - - - - - 2
- - - * - - - - 3
- - * W B - - - 4
- - - B W * - - 5
- - - - * - - - 6
- - - - - - - - 7
- - - - - - - - 8

CONDITIONS for legal move:
1. must be an empty square ==> starting square is "-"
2. there must be an unbroken sequence of opposite colored pieces in between,
   ending with a piece of the same color, and no empty squares in between
*/
function checkMoveByCoordinates(coordinate, flip) {
    // If the queried position is not empty, then the move is illegal.
    if (board[coordinate.toPosition()] !== "-") {
        return false;
    }

    // Keep track of legal directions.
    var legalDirections = new Array(8).fill(false);

    // BEGIN checking in all directions.
    // `adjacentCoordinates` is an array holding the adjacent coordinates numbered 0 to 7 shown below.
    // 0 1 2
    // 7 * 3   (* = the position of the move to be checked, `coordinate`)
    // 6 5 4   (directions are checked in increasing order, starting from 0)
    var adjacentCoordinates = coordinate.getAdjacent();

    let toBeFlipped = [];
    for (var i = 0; i != 8; ++i) {
        var currPos = adjacentCoordinates[i];
        let coordStack = []; // keep track of positions to flip
        if (currPos.isValid() && board[currPos.toPosition()] === getOppositeColorSymbol()) {
            while (currPos.isValid()) {
                coordStack.push(new Coordinate(currPos.row, currPos.col));
                if (board[currPos.toPosition()] === getCurrentColorSymbol()) {
                    legalDirections[i] = true;
                    toBeFlipped = toBeFlipped.concat(coordStack);
                }
                else if (board[currPos.toPosition()] === "-")
                    break;
                // Update the coordinate based on the direction as described above.
                switch (i) {
                    case 0:
                        currPos.col--;
                        currPos.row--;
                        break;
                    case 1:
                        currPos.row--;
                        break;
                    case 2:
                        currPos.row--;
                        currPos.col++;
                        break;
                    case 3:
                        currPos.col++;
                        break;
                    case 4:
                        currPos.row++;
                        currPos.col++;
                        break;
                    case 5:
                        currPos.row++;
                        break;
                    case 6:
                        currPos.row++;
                        currPos.col--;
                        break;
                    case 7:
                        currPos.col--;
                        break;
                }
            }
        }
    }
    if (flip) {
        if (legalDirections.some(value => value === true))
            board[coordinate.toPosition()] = getCurrentColorSymbol();
        for (let i = 0; i != toBeFlipped.length; ++i) {
            board[toBeFlipped[i].toPosition()] = getCurrentColorSymbol();
        }
    }
    return legalDirections.some(value => value === true);
}

function highlightLegalMoves(){
    console.log("a b c d e f g h")
    for (var r = 0; r < ROWS; r++) {
        var output = ""
        for (var c = 0; c < COLUMNS; c++) {
            let coord = new Coordinate(r, c);
            output += checkMoveByCoordinates(coord, false) ? "* " : board[coord.toPosition()] + " ";
        }
        console.log(output + (r + 1));
    }
}

function checkMoveAlgebraic(algebraic) {
    return checkMoveByCoordinates(algebraicToCoordinate(algebraic), false);// TODO
}

function makeMoveAtAlgebraic(algebraic) {
    let coord = algebraicToCoordinate(algebraic);
    // TODO: "flip"
    let result = checkMoveByCoordinates(coord, true)
    if (!result) return false;

    // if the move was successful, set up the next player's move
    blackToMove = !blackToMove;
}

function test() {
    for (var i = 0; i < testBoards.length; i++) {
        board = testBoards[i];
        highlightLegalMoves();
    }
}

function randomTest() {
    board = Array.from({length: 64}, () => {
        var x = Math.random();
        if (x < 0.5) return "-"
        else if (x < 0.75) return "W"
        else return "B"
    })
    highlightLegalMoves(board);
}

function main() {
    initBoard();
    //console.log("f4 is legal? " + checkMoveAlgebraic("f4"));
    //console.log("d3 is legal? " + checkMoveAlgebraic("d3"));

    console.log("Black to move. d3")
    makeMoveAtAlgebraic("d3");
    printBoard();
    console.log("White to move. e3")
    makeMoveAtAlgebraic("e3");
    printBoard();
    console.log("Black to move. f5")
    makeMoveAtAlgebraic("f5");
    printBoard();

    console.log("White to move. a1")
    makeMoveAtAlgebraic("a1");
    printBoard();

    console.log("White to move. e6")
    makeMoveAtAlgebraic("e6");
    printBoard();
}
module.exports = {
    board,
    initBoard,
    checkMoveAlgebraic,
}
main();