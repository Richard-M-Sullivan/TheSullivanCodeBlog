// sudoku-worker.js
//
// Author: Richard M. Sullivan
//
// Description:
// This file contains the solving algorithm for the SudokuBoard.
// It is written in a separate file, so it can be run as a web worker.

import {SudokuBoard, BadNumFinder} from '/javascript/sudoku-board.js';

// board is a SudokuBoard
function findSudokuSolution(board=null) {
    // if no board is set, we are launching the program
    if (board === null) {
        return false;
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

// web worker code
onmessage = function(boardData) {
    let board = new SudokuBoard();
    board.setBoard(boardData.data.board);
    let solutionBoard = findSudokuSolution(board);
    postMessage(solutionBoard);
}

