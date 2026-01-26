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

var testBoard = [
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

function positionToRowAndCol(position) {
    // [row, column]
    return [Math.floor(position / 8), position % 8]
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

function coordinateToPosition(coordinate) {
    return coordinate[0]*8 + coordinate[1];
}
function checkMoveByCoordinates(coordinate) {
    var leftLegal = false;
    var upRightDiagonalLegal = false;

    // leftwards check
    var row = coordinate[0];
    var col = coordinate[1];
    var position = coordinateToPosition(coordinate);

    var currPosLeft = col - 1;
    var currPosUpperRight = [row-1, col+1];
    if (board[position] !== "-") {
        return false;
    }
    if (blackToMove) {
        //if (currPosLeft > -1 && board[posLeft] !== "W") { //LEFT
        if (currPosLeft > -1 && board[coordinateToPosition([row,currPosLeft])] !== "W") { //LEFT
            // the left piece is not a white piece, so the left side is not legal
            leftLegal = false;
        } else {
            // otherwise, the left side might be legal, so check
            while (currPosLeft > -1) {
                if (board[coordinateToPosition([row,currPosLeft])] === "B")
                    leftLegal = true;
                else if (board[coordinateToPosition([row,currPosLeft])] === "-")
                    break;
                currPosLeft--;
            }
        }

        if (currPosUpperRight[0] > -1 && currPosUpperRight[1] < 8
            && board[coordinateToPosition(currPosUpperRight)] !== "W" ) {
                upRightDiagonalLegal = false;
        } else {
            // otherwise, the left side might be legal, so check
            while (currPosUpperRight[0] > -1 && currPosUpperRight[1] < 8) {
                if (board[coordinateToPosition(currPosUpperRight)] === "B")
                    leftLegal = true;
                else if (board[coordinateToPosition(currPosUpperRight)] === "-")
                    break;
                currPosUpperRight[0]--;
                currPosUpperRight[1]++;
            }
        }
    }
    return leftLegal || upRightDiagonalLegal;
}
function checkMove(position){
    //is move legal
    //what pieces flipped
    var posRight = position + 1; //offset to start at next
    var posLeft = position - 1;
    var currPosRight = (position % 8) + 1;
    var currPosLeft = (position % 8) - 1;
    var rightLegal = false;
    var leftLegal = false;

    var currColUp = position - 8;
    var currColDown = position + 8;
    var upLegal = false;
    var downLegal = false;


    //starter variables for diagonal checks, but need to check bounds differently than cardinal directions. maybe need floor division?
    var currUpright = position - 7;
    var upRightLegal = false;
    var currUpLeft = position - 9;
    var upLeftLegal = false;
    var currDownRight = position + 9;
    var downRightLegal = false;
    var currDownLeft = + 7;
    var downLeftLegal = false;

    var color; //could use this instead of "B" or "W" to avoid line 135 repeat the inner code block for white's turn
    if (blackToMove){
        color = "B";
    } else {
        color = "W";
    }

    if (board[position] !== "-"){ //empty
        return false;
    }

    if (blackToMove){
        if (currPosLeft > -1 && board[posLeft] !== "W") { //LEFT
            // the left piece is not a white piece, so the left side is not legal
            leftLegal = false;
        } else {
            // otherwise, the left side might be legal, so check
            while (currPosLeft > -1) {
                if (board[posLeft] === "B")
                    leftLegal = true;
                else if (board[posLeft] === "-")
                    break;
                posLeft--;
                currPosLeft--;
            }
        }
        //    ... - - B W W *
        //                ^ check if this is W for left legality
        //              ^   then start here and search leftwards for a 'B'                 
        // same thing for right side
        if (currPosRight < 9 && board[posRight] !== "W") { //RIGHT
            rightLegal = false;
        } else {
            while (currPosRight < 8) {
                if (board[posRight] === "B")
                    rightLegal = true;
                else if (board[posRight] === "-")
                    break;
                posRight++;
                currPosRight++;
            }
        }

        if (currColUp > -1 && board[currColUp] !== "W"){ //UP
            upLegal = false;
        } else {
            while (currColUp > -1) {
                if (board[currColUp] === "B"){
                    upLegal = true;
                } else if (board[currColUp] === "-"){
                        break;
                    }
                    currColUp -= 8;
                }
            }

        if (currColDown < 64 && board[currColDown] !== "W"){ //DOWN
            downLegal = false;
        } else {
            while (currColDown < 64) {
                if (board[currColDown] === "B"){
                    downLegal = true;
                } else if (board[currColDown] === "-"){
                        break;
                    }
                    currColDown += 8;
                }
            }

        }

            return leftLegal || rightLegal || upLegal || downLegal;
        }

function highlightMove(){
    console.log("a b c d e f g h")
    for (var r = 0; r < ROWS; r++) {
        var output = ""
        for (var c = 0; c < COLUMNS; c++) {
            var idx = 8*r + c;
            //if (checkMove(idx)){
            if (checkMoveByCoordinates([r,c])){
                output += "* ";
            } else {
                output += board[idx] + " ";
            }
        }
        console.log(output + (r + 1));
    }
}

function checkMoveAlgebraic(position) {
    var idx = algebraicToIdx(position);
    return checkMove(idx);// TODO
}

function makeMove(position) {
    var symbol = blackToMove ? "B" : "W";
    board[position] = symbol;
}

function test() {
    initBoard();
    //makeMove(0);
    //makeMove(31);

    //console.log(checkMove(29));
    //console.log(checkMove(29+8));
    //console.log(checkMove(29+8+1));
    for (var i = 0; i < testBoard.length; i++) {
        board = testBoard[i];
        //printBoard();
        
        highlightMove();
    }
}

function randomTest() {
    board = Array.from({length: 64}, () => {
        var x = Math.random();
        if (x < 0.5) return "-"
        else if (x < 0.75) return "W"
        else return "B"
    })
    highlightMove(board);
}

function test2() {
    board = Array.from({length: 64});
    var i = 0;
    while (i < 64) {
        board[i] = "X";
        i += 9;
    }
    print(board);
}

function main() {
    test();
    for (var i = 0; i != 10; ++i) {
        randomTest();
        console.log("")
    }
       /*
    var positions = ["a1", "b2", "c3", "d4", "e5", "f6", "g7", "h8"]
    for (var i = 0; i != positions.length; ++i) {
        console.log(positionToRowAndCol(algebraicToIdx(positions[i])));
    }
        */
}
main();