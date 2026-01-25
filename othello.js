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

    board[30] = "W";

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
    var posRight = position + 1; //offset to start at next
    var posLeft = position - 1;
    var currPosRight = (position % 8) + 2; //offset by 2 because indexing and to start at next
    var currPosLeft = (position % 8) - 2;
    var oppStreakRight = false;
    var oppStreakLeft = false;
    var rightLegal = false;
    var leftLegal = false;

    //console.log(board[position]);

    if (board[position] !== "-"){
        return -1;
    }

    if (blackToMove){
        for (currPosRight ; currPosRight < 9 ; currPosRight++){ //right direction
            if (board[posRight] == "-"){ //next one to the right is empty
                rightLegal = false;
                break;
            }

            if (board[posRight] == "W"){ //next one right is white
                oppStreakRight = true;
                posRight++;
                continue;
            }

            if (board[posRight] == "B" && oppStreakRight){ //black and streak (legal)
                rightLegal = true;
                break;
            } else {// black but no streak
                rightLegal = false;
                break;
            }
        }

        for (currPosLeft ; currPosLeft > 0 ; currPosLeft--){ //left direction
            if (board[posLeft] == "-"){ //next one to the left is empty
                leftLegal = false;
                break;
            }

            if (board[posLeft] == "W"){ //next one left is white
                oppStreakLeft = true;
                posLeft--;
                continue;
            }

            if (board[posLeft] == "B" && oppStreakLeft){ //black and streak (legal)
                leftLegal = true;
                break;
            } else {// black but no streak
                leftLegal = false;
                break;
            }
        }
    }

    //return leftLegal;
    return rightLegal;

}

function makeMove(position) {
    var symbol = blackToMove ? "B" : "W";
    board[position] = symbol;
}

function test() {
    initBoard();
    makeMove(0);
    makeMove(31)
    printBoard();

    console.log(checkMove(29));
}

test()