// test.js
//
// Author: Richard M. Sullivan
//
// Description:
// This is a test to learn about the canvas element. This is for the purpose of
// creating interactive demonstrations for my website.


//////////
// view //
//////////

const lightRed = "oklch(0.808 0.114 19.571)";
const darkRed = "oklch(0.637 0.237 25.331)";

// this turns a div into a grid with a specified size
function make_grid(div, rows, cols, size) {
  div.style.textAlign = "center";
  div.style.display = "grid";
  div.style.gridTemplateRows = "repeat("+rows+", "+size+"px)";
  div.style.gridTemplateColumns = "repeat("+cols+", "+size+"px)";
}

// Create a sudoku board to display to the user
function create_board(e_id) {
  // getting access to the frame containing the entire sudoku board
  const sudoku_board = document.getElementById(e_id);
  sudoku_board.style.padding = "5px";
  sudoku_board.style.background = "black";
  sudoku_board.style.borderRadius = "5px";


  // create a grid that holds 9 elements - the main grid
  const main_grid = document.createElement("div");
  make_grid(main_grid, 3, 3, 40*3);
  main_grid.style.gap = "3px 3px";
  sudoku_board.append(main_grid);

  // add a 9 sub grids to the main grid
  subGridList = [];
  for (i=0; i<9; i++) {
    subGridList[i] = document.createElement("div");
    make_grid(subGridList[i], 3, 3, 40);
    subGridList[i].style.background = "white";
    main_grid.append(subGridList[i]);
  }

  // create 81 cells, and append them in a specific order into the grid
  let col_select = -1;
  let row_select = -1;
  for (i=0; i<(9*9); i++) {
    const cell = document.createElement("input");
    cell.id = "cell-" + i;
    cell.style.border = "1px solid black";
    cell.style.textAlign = "center";
    cell.style.fontSize = "2em";
    cell.style.outline = "none"
    cell.style.fontWeight = "bold"
    cell.setAttribute("type", "text");
    cell.setAttribute("minlength", "1");
    cell.setAttribute("maxlength", "1");
    
    if (i%3 == 0) {
      col_select += 1;
      col_select = col_select % 3;
    }

    if (i%(9*3) == 0) {
      row_select += 1;
    }

    subGridList[col_select + 3*row_select].append(cell);
  }
}


///////////
// model //
///////////

class BadNumFinder {
    constructor() {
        // bad numbers found
        this.badNums = new Set();
        // recording location of found numbers
        this.numCords = {};
    }

    addNum(num, row, col) {
        // if no number do not add coordinate
        if (num === "") {
            return;
        }

        // if first time seeing number create dictionary and list, then add item
        if (this.numCords[num] === undefined) {
            this.numCords[num] = [];
            this.numCords[num].push({"num":num, "row":row, "col":col});
        // if not first time seeing number add to dictionary and notate in badnumber set
        } else {
            this.numCords[num].push({"num":num, "row":row, "col":col});
            this.badNums.add(num);
        }
    }

    getBadNums() {
        let badData = [];
        // iterate through all the bad numbers
        for (let badNum of this.badNums.values()) {
            // store the coordinates related to the bad number in bad data
            badData = badData.concat(this.numCords[badNum]);
        }

        // then return bad data
        return badData;
    }
}

// sudoku board model
class SudokuBoard {
    constructor() {
        this.rows = 9;
        this.cols = 9;

        this.board = [];

        // pupulate the original and solution boards with empty data
        for (let i=0; i<9; i++) {
            let row = [];
            for (let j=0; j<9; j++) {
                row.push("");
            }
            this.board.push(row);
        }
    }

    // filter out bad board values
    cleanBoard() {
        for (let row=0; row < this.rows; row++) {
            for (let col=0; col < this.cols; col++) {
                if ( /[1-9]/.test(this.board[row][col]) === false ){
                    this.board[row][col] = "";
                }
            }
        }
    }

    // reset all values to be blank
    clearBoard() {
        for (let row=0; row < this.rows; row++) {
            for (let col=0; col < this.cols; col++) {
                this.board[row][col] = "";
            }
        }
    }

    // check if a row is valid
    checkRow(row_num) {
        let numTracker = new BadNumFinder();
        // iterate over all cols in the row
        for (let col=0; col < this.cols; col++) {
            let val = this.board[row_num][col];
            // add the entry to the bad num finder
            numTracker.addNum(val, row_num, col);
        }

        return numTracker.getBadNums();
    }

    // check if a column is valid
    checkCol(col_num) {
        let numTracker = new BadNumFinder();
        // iterate over all cols in the row
        for (let row=0; row < this.rows; row++) {
            let val = this.board[row][col_num];
            numTracker.addNum(val, row, col_num);
        }

        return numTracker.getBadNums();
    }

    // check if a block is valid
    checkBlock(blockNum) {
        let numTracker = new BadNumFinder();

        // starting location of block
        let startRow = Math.floor(blockNum / 3) * 3;
        let startCol = (blockNum % 3) * 3;

        // iterate through block values
        for (let row=startRow; row < startRow+3; row++) {
            for (let col=startCol; col < startCol+3; col++) {
                // get the value from the cell
                let val = this.board[row][col];

                numTracker.addNum(val, row, col);
            }
        }

        return numTracker.getBadNums();
    }

    isValid() {
        let badNums = [];
        for (let i=0; i < this.rows; i++) {
            badNums =  this.checkRow(i);
            if ( badNums.length !== 0 ) {
                return false;
            }
            badNums =  this.checkCol(i);
            if ( badNums.length !== 0 ) {
                return false;
            }
            badNums =  this.checkBlock(i);
            if ( badNums.length !== 0 ) {
                return false;
            }
        }

        return true;
    }

    isFull() {
        for (let row=0; row < this.rows; row++) {
            for (let col=0; col < this.cols; col++) {
                if (this.board[row][col] === "") {
                    return false;
                }
            }
        }
        return true;
    }
}

class Solution {
    constructor() {
        this.board = "";
        this.status = "";
    }
}

// creating two boards to manage program state
let originalBoard = new SudokuBoard();
let solutionBoard = new SudokuBoard();


////////////////
// controller //
////////////////


// solve controller
function findSudokuSolution(board=null) {
    // if no board is set, we are launching the program
    if (board === null) {
        board = getSudokuBoard();
    }

    let full = board.isFull();
    let valid = board.isValid();
    
    // return if solved board - base case
    if (full === true && valid === true) {
        return board;
    }
        
    // feturn if invalid board
    if (valid === false) {
        return false;
    }

    // if valid and not solved

    // select an empty cell
    let emptyCellRow = 0;
    let emptyCellCol = 0;
    for (let row = 0; row < board.rows; row++) {
        for (let col = 0; col < board.cols; col++) {
            // break if empty cell found
            if ( board.board[row][col] === '') {
                emptyCellCol = col;
                emptyCellRow = row;
                break;
            }
        }
        // need to check again because we may have gotten here from searching
        // all cols or from breaking
        if ( board.board[emptyCellRow][emptyCellCol] === '') {
            break;
        }
    }

    // create a new board
    let new_board = new SudokuBoard();
    new_board.board = structuredClone(board.board);

    // recurse with filled in cell
    for (let i=1; i <= 9; i++) {
        new_board.board[emptyCellRow][emptyCellCol] = i;
        let result = findSudokuSolution(new_board);
        if (result !== false) {
            // return the solved board if found
            return result;
        }
    }
    // if no solved boards found
    return false;
}

function sudokuSolveBoard() {
    let board = getSudokuBoard();

    // if the board is solved, do not overwrite the original board the solution
    // is attached to.
    if (board.isFull() !== true || board.isValid() !== true) {
        originalBoard = getSudokuBoard();
    }

    solutionBoard = findSudokuSolution();

    if (solutionBoard === false) {
        sudokuPrint("There is no solution.");
        solutionBoard = new SudokuBoard();
    } else {
        setSudokuBoard(solutionBoard);
        sudokuPrint("Solution found");
    }
}
// reset controller
function sudokuResetBoard() {
    setSudokuBoard(originalBoard);
    colorizeBoard();
    sudokuPrint("Fill in the needed cells and click solve.");
}
// clear controller
function sudokuClearBoard() {
    originalBoard.clearBoard();
    solutionBoard.clearBoard();
    setSudokuBoard(originalBoard);
    colorizeBoard();
    sudokuPrint("Fill in the needed cells and click solve.");
}

// set board on screen to the one in the data structure
function setSudokuBoard(board) {
    // iterate through each cell in the board and set it to the cell in the data structure
    for (let row=0; row < board.rows; row++) {
        for (let col=0; col < board.cols; col++ ) {
            document.getElementById("cell-"+(row*board.rows+col)).value = board.board[row][col];
        }
    }
}

// get the values in the UI sudoku board
function getSudokuBoard() {
    board = new SudokuBoard();

    for (let row=0; row < board.rows; row++) {
        for (let col=0; col < board.cols; col++) {
            board.board[row][col] = document.getElementById("cell-"+(row*board.rows + col)).value;
        }
    }

    return board;
}

// print to text area
function sudokuPrint(message) {
    document.getElementById("sudoku-output").value = message;
}

// colorize the board to show errors
function colorizeBoard() {
    removeCharacters();
    // this is a board where the number in the board represents a color
    let colorsBoard = new SudokuBoard();
    let board = getSudokuBoard();

    let totalBadCells = [];
    let badCells = [];
    // iterate through all the rows, cols, and blocks
    for (let i=0; i<9; i++) {
        badCells = board.checkRow(i);
        if (badCells.length !== 0) {
            colorizeRow(i, colorsBoard);
            totalBadCells = totalBadCells.concat(badCells);
        }

        badCells = board.checkCol(i);
        if (badCells.length !== 0) {
            colorizeCol(i, colorsBoard);
            totalBadCells = totalBadCells.concat(badCells);
        }

        badCells = board.checkBlock(i);
        if (badCells.length !== 0) {
            colorizeBlock(i, colorsBoard);
            totalBadCells = totalBadCells.concat(badCells);
        }
    }

    // iterate through all the cells
    for (cell of totalBadCells) {
        colorizeCell(cell.row, cell.col, colorsBoard);
    }

    colorBoard(colorsBoard);
}

function colorizeRow(row, board, color=lightRed) {
    for (let i=0; i < board.cols; i++) {
        board.board[row][i] = color;
    }

}

function colorizeCol(col, board, color=lightRed) {
    for (let i=0; i < board.rows; i++) {
        board.board[i][col] = color;
    }
}

function colorizeBlock(blockNum, board, color=lightRed) {
    let startRow = Math.floor(blockNum / 3) * 3;
    let startCol = (blockNum % 3) * 3;

    // iterate through block values
    for (let row=startRow; row < startRow+3; row++) {
        for (let col=startCol; col < startCol+3; col++) {
            // get the value from the cell
            board.board[row][col] = color;
        }
    }
}

function colorizeCell(row, col, board, color=darkRed) {
    board.board[row][col] = color;

}

function colorBoard(board) {
    for (let row=0; row < board.rows; row++) {
        for (let col=0; col < board.cols; col++) {
            cell = document.getElementById("cell-" + (row*board.cols + col));

            if (board.board[row][col] === "") {
                board.board[row][col] = "white";
            }

            cell.style.backgroundColor = board.board[row][col];
        }
    }
}

function removeCharacters() {
    let board = getSudokuBoard();
    board.cleanBoard();
    setSudokuBoard(board);

}

create_board("sudoku-board");

addEventListener("input", colorizeBoard);

