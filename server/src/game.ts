export type Piece = "W" | "B" | "-";
function getWhitePieceSymbol(): Piece {
  return "W";
}
function getBlackPieceSymbol(): Piece {
  return "B";
}
function _getEmptyPieceSymbol(): Piece {
  return "-";
}
export type Board<P> = // https://stackoverflow.com/questions/52489261/can-i-define-an-n-length-tuple-type
  [
    P, P, P, P, P, P, P, P,
    P, P, P, P, P, P, P, P,
    P, P, P, P, P, P, P, P,
    P, P, P, P, P, P, P, P,
    P, P, P, P, P, P, P, P,
    P, P, P, P, P, P, P, P,
    P, P, P, P, P, P, P, P,
    P, P, P, P, P, P, P, P,
  ];
type AdjacencyList<P> = [P, P, P, P, P, P, P, P]; // todo: can refactor this at some point
/**
 * A game state, encapsulating the current player to move.
 */
export type Game = {
  blackToMove: boolean;
  moveHistory: Array<string>;
  board: Board<Piece>;
};

class Coordinate {
  row: number;
  col: number;

  constructor(pos = -1, row: number, col: number) {
    if (0 <= pos && pos < 64) {
      this.row = Math.floor(pos / 8);
      this.col = pos % 8;
    } else {
      this.row = row;
      this.col = col;
    }
  }
  toPosition() {
    return 8 * this.row + this.col;
  }
  isValid() {
    return (this.row > -1) && (this.row < 8) && (this.col > -1) &&
      (this.col < 8);
  }
  // 0 1 2
  // 7 * 3   (* = the position of the move to be checked, `coordinate`)
  // 6 5 4   (directions are checked in increasing order, starting from 0)
  directionalUpdate(dir: number) {
    switch (dir) {
      case 0:
        this.col--;
        this.row--;
        break;
      case 1:
        this.row--;
        break;
      case 2:
        this.row--;
        this.col++;
        break;
      case 3:
        this.col++;
        break;
      case 4:
        this.row++;
        this.col++;
        break;
      case 5:
        this.row++;
        break;
      case 6:
        this.row++;
        this.col--;
        break;
      case 7:
        this.col--;
        break;
      default:
        throw new Error("uh-oh spaghetti-oh");
    }
  }
  getAdjacent(): AdjacencyList<Coordinate> {
    return [
      new Coordinate(-1, this.row - 1, this.col - 1),
      new Coordinate(-1, this.row - 1, this.col),
      new Coordinate(-1, this.row - 1, this.col + 1),
      new Coordinate(-1, this.row, this.col + 1),
      new Coordinate(-1, this.row + 1, this.col + 1),
      new Coordinate(-1, this.row + 1, this.col),
      new Coordinate(-1, this.row + 1, this.col - 1),
      new Coordinate(-1, this.row, this.col - 1),
    ] as AdjacencyList<Coordinate>;
  }
}

/**
 * Initialize the board for a new game.
 *
 * @returns Starting position for othello.
 */
export function initBoard(): Board<Piece> {
  return [
      "-", "-", "-", "-", "-", "-", "-", "-",
      "-", "-", "-", "-", "-", "-", "-", "-",
      "-", "-", "-", "-", "-", "-", "-", "-",
      "-", "-", "-", "W", "B", "-", "-", "-",
      "-", "-", "-", "B", "W", "-", "-", "-",
      "-", "-", "-", "-", "-", "-", "-", "-",
      "-", "-", "-", "-", "-", "-", "-", "-",
      "-", "-", "-", "-", "-", "-", "-", "-",
    ] as Board<Piece>;
}

export function initGame(): Game {
  return {
    blackToMove: true,
    moveHistory: [],
    board: initBoard(),
  };
}

/**
 * Returns a string representation of the game state,
 * useful for debugging.
 *
 * TODO: _highlight
 *
 * @param {Game} g The game state.
 */
function printBoard(g: Game, _highlight: boolean): void {
  console.log("a b c d e f g h");
  for (let r = 0; r < 8; r++) {
    let output = "";
    for (let c = 0; c < 8; c++) {
      const pos = 8 * r + c;
      output += g.board[pos] + " ";
    }
    console.log(output + (r + 1));
  }
}

function getOppositeColorSymbol(g: Game): Piece {
  return g.blackToMove ? getWhitePieceSymbol() : getBlackPieceSymbol();
}

function getCurrentColorSymbol(g: Game): Piece {
  return g.blackToMove ? getBlackPieceSymbol() : getWhitePieceSymbol();
}

export function legalMoveAt(g: Game, pos: number, flip: boolean): [boolean, Game] {
  const coord = new Coordinate(pos, -1, -1);

  if (g.board[pos] !== "-") {
    return [false, g];
  }

  // BEGIN checking in all directions.
  // `adjacentCoordinates` is an array holding the adjacent coordinates numbered 0 to 7 shown below.
  // 0 1 2
  // 7 * 3   (* = the position of the move to be checked, `coordinate`)
  // 6 5 4   (directions are checked in increasing order, starting from 0)
  const legalDirections: boolean[] = new Array(8).fill(false);
  const adjacentCoordinates = coord.getAdjacent();
  let toBeFlipped: Coordinate[] = [];
  for (let dir = 0; dir != 8; ++dir) {
    const coordStack: Coordinate[] = []; // keep track of positions to flip
    const pos = adjacentCoordinates[dir];
    if (typeof pos === "undefined") return [false, g];
    if (
      pos.isValid() && g.board[pos.toPosition()] === getOppositeColorSymbol(g)
    ) {
      while (pos!.isValid()) {
        coordStack.push(new Coordinate(-1, pos.row, pos.col));
        if (g.board[pos.toPosition()] === getCurrentColorSymbol(g)) {
          legalDirections[dir] = true;
          toBeFlipped = toBeFlipped.concat(coordStack);
          break;
        } else if (g.board[pos.toPosition()] === "-") {
          break;
        }
        // Update the coordinate based on the direction as described above.
        pos.directionalUpdate(dir);
      }
    }
  }
  const result = legalDirections.some((value) => value === true);
  if (result && flip) {
    const newGameState = {
      blackToMove: !g.blackToMove,
      moveHistory: g.moveHistory.slice(),
      board: g.board.slice() as Board<Piece>,
    };
    if (legalDirections.some((value) => value === true)) {
      newGameState.board[coord.toPosition()] = getCurrentColorSymbol(g);
    }
    for (let i = 0; i != toBeFlipped.length; ++i) {
      newGameState.board[toBeFlipped[i]!.toPosition()] = getCurrentColorSymbol(
        g,
      );
    }
    newGameState.moveHistory.push(helperPosToAlgebraic(pos));
    return [result, newGameState];
  }
  return [result, g];
}

function currentPlayerHasMoves(g: Game) {
  for (let r = 0; r != 8; ++r) {
    for (let c = 0; c != 8; ++c) {
      const pos = 8 * r + c;
      const [posIsLegal, _] = legalMoveAt(g, pos, false);
      if (posIsLegal) return true;
    }
  }
  return false;
}

/**
 * Makes a move on the board. Automatically passes if no move is available to the next player.
 *
 * @param g The game state before the move.
 * @param pos The index/positional value of where the move is to be made.
 * @returns A game state; if successful, this is the game state after the move is made.
 */
export function makeMoveAt(g: Game, pos: number): Game {
  const [moveWasOK, newGameState] = legalMoveAt(g, pos, true);

  if (moveWasOK) {
    if (!currentPlayerHasMoves(g)) {
      newGameState.blackToMove = !newGameState.blackToMove;
    }
    return newGameState;
  }
  return g;
}

/**
 * Checks whether the game has finished and returns a boolean value.
 *
 * @param g The game state.
 * @returns a boolean indicating whether the game is over (neither player has any legal moves).
 */
function _gameIsOver(g: Game): boolean {
  const otherPlayerMoves = {
    blackToMove: !g.blackToMove,
    moveHistory: g.moveHistory,
    board: g.board,
  };
  return !currentPlayerHasMoves(g) && !currentPlayerHasMoves(otherPlayerMoves);
}

function helperAlgebraicToPos(algebraic: string): number {
  if (algebraic.length != 2) {
    return -1;
  }

  const col = algebraic[0]!.toLowerCase(); // "h"
  const row = algebraic[1]!.toLowerCase(); // "8"

  // bounds checking
  if (col < "a" || col > "h") return -1;
  if (Number(row) < 1 || Number(row) > 8) return -1;

  //return new Coordinate(Number(row)-1, col.charCodeAt(0) - 'a'.charCodeAt(0));
  return 8 * (Number(row) - 1) + (col.charCodeAt(0) - "a".charCodeAt(0));
}

function helperPosToAlgebraic(pos: number): string {
  if (pos < 0 || pos >= 64) return "--";
  return String.fromCharCode(pos % 8 + "a".charCodeAt(0)) +
    (Math.floor(pos / 8) + 1);
}

export function test(): Game {
  let state = initGame();
  printBoard(state, false);

  const moves = ["e6", "f4", "e3", "f6", "g5", "d6", "e7", "f5", "c5"];
  for (const move of moves) {
    console.log(
      `move ${move} (pos ${helperAlgebraicToPos(move)}) parsed ${
        helperPosToAlgebraic(helperAlgebraicToPos(move))
      }`,
    );
    state = makeMoveAt(state, helperAlgebraicToPos(move));
    printBoard(state, false);
    console.log(state.moveHistory);
  }
  return state;
  /*
    for (let i = 0; i != 64; ++i) {
        state = makeMoveAt(state, i);
        printBoard(state, false);
    }
        */
}
