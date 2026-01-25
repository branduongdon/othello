console.log("hello, world");

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
    if (typeof algebraic != "string" || algebraic.length != 2)
        return -1;

    var col = algebraic[0].toLowerCase(); // "h"
    var row = algebraic[1].toLowerCase(); // "8"

    // bounds checking
    if (col < 'a' || col > 'h') return -1;
    if (Number(row) < 1 || Number(row) > 8) return -1;

    /*  (in C)
        char first = 'A'; ascii: 65
        char second = 'C'; ascii: 67
        int difference = second - first; // 2
    */
    // 8*r + c
    return 8*(Number(row)-1) + (col.charCodeAt(0) - 'a'.charCodeAt(0));
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
function checkMove(position){
    //is move legal
    //what pieces flipped
    
}

function makeMove(position) {
    var symbol = blackToMove ? "B" : "W";
    board[position] = symbol;
}

function test() {
    initBoard();
    printBoard();
    makeMove(0);
    printBoard();

    console.log(algebraicToIdx('a1'));
    console.log(algebraicToIdx('a2'));
    console.log(algebraicToIdx('a3'));
    console.log(algebraicToIdx('a6'));
    console.log(algebraicToIdx('h8'));
    console.log(algebraicToIdx('i8'));
    console.log(algebraicToIdx('i'));
    console.log(algebraicToIdx(0xa));
    console.log(algebraicToIdx('h9'));
    console.log(algebraicToIdx(''));
}

test()