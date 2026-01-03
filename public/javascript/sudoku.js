// test.js
//
// Author: Richard M. Sullivan
//
// Description:
// This is a test to learn about the canvas element. This is for the purpose of
// creating interactive demonstrations for my website.

import {SudokuBoard, BadNumFinder} from '/javascript/sudoku-board.js';

////////////////////////
// Solve board worker //
////////////////////////

const sudokuWorker = new Worker('/javascript/sudoku-worker.js', {type: "module"});

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
  let subGridList = [];
  for (let i=0; i<9; i++) {
    subGridList[i] = document.createElement("div");
    make_grid(subGridList[i], 3, 3, 40);
    subGridList[i].style.background = "white";
    main_grid.append(subGridList[i]);
  }

  // create 81 cells, and append them in a specific order into the grid
  let col_select = -1;
  let row_select = -1;
  for (let i=0; i<(9*9); i++) {
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


// creating two boards to manage program state
let originalBoard = new SudokuBoard();
let solutionBoard = new SudokuBoard();

////////////////
// controller //
////////////////

// solve button - launch solver web worker
export function sudokuSolveBoard() {
    if (document.getElementById("sudoku-output").value === "Solving... This can take a while.") {
        return;
    }

    let board = getSudokuBoard();

    // if the board is solved, do not overwrite the original board the solution
    // is attached to.
    if (board.isFull() !== true || board.isValid() !== true) {
        originalBoard = getSudokuBoard();
    }

    sudokuPrint("Solving... This can take a while.");
    sudokuWorker.postMessage(board);
}

// when results come back update sudoku board to contain solution
sudokuWorker.onmessage = function(boardData) {
    if (boardData.data === false) {
        sudokuPrint("There is no solution.");
        solutionBoard = new SudokuBoard();

    } else {
        let resultBoard = new SudokuBoard();
        resultBoard.setBoard(boardData.data.board);

        setSudokuBoard(resultBoard);
        sudokuPrint("Solution found");
    }
}

// reset button
export function sudokuResetBoard() {
    setSudokuBoard(originalBoard);
    colorizeBoard();
    sudokuPrint("Fill in the needed cells and click solve.");
}

// clear button
export function sudokuClearBoard() {
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
    let board = new SudokuBoard();

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
    for (let cell of totalBadCells) {
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
            let cell = document.getElementById("cell-" + (row*board.cols + col));

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
