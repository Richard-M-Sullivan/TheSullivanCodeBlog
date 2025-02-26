// test.js
//
// Author: Richard M. Sullivan
//
// Description:
// This is a test to learn about the canvas element. This is for the purpose of
// creating interactive demonstrations for my website.

function make_grid(div, rows, cols, size) {
  div.style.textAlign = "center";
  div.style.display = "grid";
  div.style.gridTemplateRows = "repeat("+rows+", "+size+"px)";
  div.style.gridTemplateColumns = "repeat("+cols+", "+size+"px)";
}

function create_board(e_id) {
  // getting access to the frame containing the entire sudoku board
  const sudoku_board = document.getElementById(e_id);
  sudoku_board.style.padding = "5px";
  sudoku_board.style.background = "black";
  sudoku_board.style.borderRadius = "5px";


  // create a grid that holds 9 elements - the main grid
  const main_grid = document.createElement("div");
  make_grid(main_grid, 3, 3, 50*3);
  main_grid.style.gap = "3px 3px";
  sudoku_board.append(main_grid);

  // add a 9 sub grids to the main grid
  subGridList = [];
  for (i=0; i<9; i++) {
    subGridList[i] = document.createElement("div");
    make_grid(subGridList[i], 3, 3, 50);
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
    cell.setAttribute("pattern", "[0-9]{1,1}");


    
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

create_board("sudoku-board");
