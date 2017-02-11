var Game = function() {
	// Variables
	var canvas, ctx, board, moved, attacked, hoveredCell, selectedCell, turn, state, cursorX, cursorY, images, imageCount;

	// Functions
	var setCursorPosition, clearCanvas, renderBoard, renderPieces, renderOverlay, render;

	setCursorPosition = function(e) {
	    var rect = canvas.getBoundingClientRect();
	    cursorX = e.clientX - rect.left;
	    cursorY = e.clientY - rect.top;
	}

	hoverUpdate = function() {
		var cell = board.getCellFromMouse(cursorX, cursorY);
		if(cell == -1) {
			if(hoveredCell != 0) {
				hoveredCell = 0;
				render();
			}
		} else {
			if(hoveredCell == 0 || !hoveredCell.equals(cell)) {
				hoveredCell = cell;
				render();
			}
		}
	}

	cellInArray = function(cell, arr) {
		for(var i = 0; i < arr.length; i++) {
			if (cell.equals(arr[i])) return true;
		}	
		return false;
	}

	removeCellFromArray = function(cell, arr) {
		var newArr = [];
		for(i = 0; i < arr.length; i++) {
			if(!cell.equals(arr[i])) newArr.push(arr[i])
		}
		return newArr;
	}

	getValidMoves = function(speed, oldCells, currentCells) {
		newCells = [];
		for(var i = 0; i < currentCells.length; i++) {
			newCell = currentCells[i].relative(1, 0);
			if(board.get(newCell) == 0 && !cellInArray(newCell, oldCells.concat(currentCells).concat(newCells))) {
				newCells.push(newCell);
			}

			newCell = currentCells[i].relative(-1, 0);
			if(board.get(newCell) == 0 && !cellInArray(newCell, oldCells.concat(currentCells).concat(newCells))) {
				newCells.push(newCell);
			}

			newCell = currentCells[i].relative(0, 1);
			if(board.get(newCell) == 0 && !cellInArray(newCell, oldCells.concat(currentCells).concat(newCells))) {
				newCells.push(newCell);
			}

			newCell = currentCells[i].relative(0, -1);
			if(board.get(newCell) == 0 && !cellInArray(newCell, oldCells.concat(currentCells).concat(newCells))) {
				newCells.push(newCell);
			}
		}

		if(speed == 1) {
			return oldCells.concat(currentCells).concat(newCells);
		} else {
			return getValidMoves(speed-1, oldCells.concat(currentCells), newCells);
		}
	}

	getAllValidMoves = function() {
		allCells = getValidMoves(board.get(selectedCell).speed, [], [selectedCell]);
		return allCells;//removeCellFromArray(selectedCell, allCells);
	}

	validMove = function(cell) {
		validMoves = getAllValidMoves();
		for (var i = 0; i < validMoves.length; i++) {
			if(validMoves[i].equals(cell)) {
				return true;
			}
		}
		return false;
	}

	validAttack = function(cell) {
		possibleAttacks = board.get(selectedCell).getPossibleAttackCells(selectedCell);
		for (var i = 0; i < possibleAttacks.length; i++) {
			if(possibleAttacks[i].equals(cell)) {
				return true;
			}
		}
		return false;
	}

	getOrient = function(cell) {
		upCell = selectedCell.relative(0, -1);
		if(cell.equals(upCell)) {
			return 0;
		}

		rightCell = selectedCell.relative(1, 0);
		if(cell.equals(rightCell)) {
			return 1;
		}

		downCell = selectedCell.relative(0, 1);
		if(cell.equals(downCell)) {
			return 2;
		}

		leftCell = selectedCell.relative(-1, 0);
		if(cell.equals(leftCell)) {
			return 3;
		}

		return -1;
	}

	nextTurn = function() {
		if(selectedCell != 0 && (moved || attacked)) {
			board.get(selectedCell).currentRFP = board.get(selectedCell).rfp
		}
		state = 0;
		moved = false;
		attacked = false;
		selectedCell = 0;
		board.nextTurn(turn);
		turn += 1;
	}

	clickUpdate = function() {
		cell = board.getCellFromMouse(cursorX, cursorY);
		if(cell == -1) return;

		switch(state) {
			case 0:
				piece = board.get(cell);
				if(piece != 0 && piece.player == turn%2 && piece.currentRFP == 0) {
					state = 1;
					selectedCell = cell;
					render();
				}
				break;
			case 1:
				piece = board.get(cell);
				if(!cell.equals(selectedCell) && piece != 0 && piece.player == turn%2 && piece.currentRFP == 0) {
					selectedCell = cell;
					render();
				} else if(validMove(cell)) {
					if(!cell.equals(selectedCell)) {
						board.set(cell, board.get(selectedCell))
						board.set(selectedCell, 0);
						selectedCell = cell;
					}

					moved = true;

					if(!attacked) {
					    state = 2;
					}
					else {
					    state = 3;
					}
					render();
				}
				break;
			case 2:
				if(validAttack(cell)) {
					cells = board.get(selectedCell).getAffectedCells(selectedCell, hoveredCell);

					board.get(selectedCell).useAbility(board, cells, selectedCell);

					for(var i = 0; i < cells.length; i++) {
						if(board.get(cells[i]) != 0) {
							if(board.get(cells[i]).hp <= 0) {
								board.set(cells[i], 0);
							}
						}
					}

					attacked = true;
					
					if(board.gameOver()) {
						state = 4;
						render();
					} else {
						if(!moved) {
							state = 1;
						} else {
							state = 3;
						}
						render();
					}
				}
				break;
			case 3:
				newOrient = getOrient(cell);
				if(newOrient != -1) {
					board.get(selectedCell).orient = newOrient; 
					nextTurn();
					render();
				}
				break;
			case 4:
				render();
				break;

		}
	}

	clearCanvas = function() {
		ctx.fillStyle = "#000000";
		ctx.fillRect(0,0,750,750);

		ctx.fillStyle = "#DDDDEE";
		ctx.fillRect(2,2,746,746);

		for(cellStr in board.cells) {
			cell = Cell.fromStr(cellStr);
			coords = board.getCellCoords(cell);

			//ctx.drawImage(images["tile"], coords.x, coords.y);
			ctx.fillStyle = "#AAAAAA";
			ctx.fillRect(coords.x+1, coords.y+1, 48, 48);
		}
	}

	renderBoard = function() {
		board.render(ctx);
	}

	renderOverlay = function() {
		switch(state) {
			case 0:
				for(cell in board.cells) {
					piece = board.cells[cell];

					if(piece != 0 && piece.player == turn%2) {
						coords = board.getCellCoords(Cell.fromStr(cell));
						ratio = piece.currentRFP/piece.rfp;
						g = Math.floor(255*(1 - ratio));
						r = Math.floor(255*ratio);
						ctx.fillStyle = "rgba("+r+","+g+",0,0.5)";
						ctx.fillRect(coords.x+1, coords.y+1, board.cellWidth-2, board.cellHeight-2)
					}
				}
				break;
			case 1:
				for(cell in board.cells) {
					piece = board.cells[cell];

					if(piece != 0 && piece.player == turn%2) {
						coords = board.getCellCoords(Cell.fromStr(cell));
						ratio = piece.currentRFP/piece.rfp;
						g = Math.floor(255*(1 - ratio));
						r = Math.floor(255*ratio);
						ctx.fillStyle = "rgba("+r+","+g+",0,0.5)";
						ctx.fillRect(coords.x+1, coords.y+1, board.cellWidth-2, board.cellHeight-2)
					}
				}

				allCells = getAllValidMoves();
				for(var i = 0; i < allCells.length; i++) {
					coords = board.getCellCoords(allCells[i]);
					ctx.fillStyle = "rgba(0,255,255,0.5)";
					ctx.fillRect(coords.x+1, coords.y+1, board.cellWidth-2, board.cellHeight-2)
				}
				break;
			case 2:
				possibleAttacks = board.get(selectedCell).getPossibleAttackCells(selectedCell);
				for(var i = 0; i < possibleAttacks.length; i++) {
					coords = board.getCellCoords(possibleAttacks[i]);
					ctx.fillStyle = "rgba(255,0,0,0.5)";
					ctx.fillRect(coords.x+1, coords.y+1, board.cellWidth-2, board.cellHeight-2)
				}

				if(hoveredCell != 0) {
					affectedCellsHover = board.get(selectedCell).getAffectedCells(selectedCell, hoveredCell);
					for(var i = 0; i < affectedCellsHover.length; i++) {
						coords = board.getCellCoords(affectedCellsHover[i]);
						ctx.fillStyle = "rgba(128, 0, 255, 0.55)";
						ctx.fillRect(coords.x+1, coords.y+1, board.cellWidth-2, board.cellHeight-2);
					}
				}

				break;
			case 3:
				ctx.fillStyle = "rgba(255,255,0,0.5)";

				coords = board.getCellCoords(selectedCell.relative(0, -1));
				ctx.fillRect(coords.x+1, coords.y+1, board.cellWidth-2, board.cellHeight-2)

				coords = board.getCellCoords(selectedCell.relative(1, 0));
				ctx.fillRect(coords.x+1, coords.y+1, board.cellWidth-2, board.cellHeight-2)

				coords = board.getCellCoords(selectedCell.relative(0, 1));
				ctx.fillRect(coords.x+1, coords.y+1, board.cellWidth-2, board.cellHeight-2)

				coords = board.getCellCoords(selectedCell.relative(-1, 0));
				ctx.fillRect(coords.x+1, coords.y+1, board.cellWidth-2, board.cellHeight-2)
				break;
			case 4:
				ctx.font = "64px Arial";
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillStyle = "#000000";
				ctx.fillText("GAME OVER!",350,350);
				break;
		}

		if(hoveredCell != 0 && state != 2) {
			ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
			//ctx.fillStyle = "#AACCFF"
			ctx.fillRect(board.x + board.cellWidth*hoveredCell.x + 2, board.y + board.cellHeight*hoveredCell.y + 2, board.cellWidth-4, board.cellHeight-4)
		}
	}

	renderInfo = function() {
		ctx.font = "24px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		
		ctx.fillStyle = "#000000";
		ctx.fillRect(70, 695, 610, 50);

		ctx.fillStyle = "#ffaa77";
		ctx.fillRect(72, 697, 606, 46);


		ctx.fillStyle = "#000000";
		ctx.fillRect(74 + 150*state, 699, 152, 42);


		ctx.fillStyle = "#00FF00";
		ctx.fillRect(75 + 150*state, 700, 150, 40);

		ctx.fillStyle = "#000000";
		ctx.fillText("Turn: "+turn, 375, 50);

		ctx.fillText("Select Unit", 150, 720);
		ctx.fillText("Move Unit", 300, 720);
		ctx.fillText("Use Ability", 450, 720);
		ctx.fillText("Orientation", 600, 720);

		if(hoveredCell != 0 && board.get(hoveredCell) != 0) {
			board.get(hoveredCell).renderInfo(ctx);
		}
	}

	render = function() {
		clearCanvas();
		renderOverlay();
		renderBoard();
		renderInfo();
	}

	reset = function() {
		turn = 0;
    	state = 0;
		moved = false;
		attacked = false;
    	hoveredCell = 0;
    	selectedCell = 0;
    	board = new Board(100, 100, 550, 550);
    	board.init();

    	board.set(new Cell(3,7), new Knight(0, images["knight"]));
    	board.set(new Cell(4,7), new Knight(0, images["knight"]));
    	board.set(new Cell(5,7), new Knight(0, images["knight"]));
    	board.set(new Cell(6,7), new Knight(0, images["knight"]));
    	board.set(new Cell(7,7), new Knight(0, images["knight"]));

    	board.set(new Cell(3,9), new Ranger(0, images["ranger"]));
    	board.set(new Cell(7,9), new Ranger(0, images["ranger"]));

    	board.set(new Cell(5,10), new Cleric(0, images["cleric"]));

    	board.set(new Cell(2,8), new Mage(0, images["mage"]));
    	board.set(new Cell(8,8), new Mage(0, images["mage"]));

    	//

    	board.set(new Cell(3,3), new Knight(1, images["knight"]));
    	board.set(new Cell(4,3), new Knight(1, images["knight"]));
    	board.set(new Cell(5,3), new Knight(1, images["knight"]));
    	board.set(new Cell(6,3), new Knight(1, images["knight"]));
    	board.set(new Cell(7,3), new Knight(1, images["knight"]));

		board.set(new Cell(3,1), new Ranger(1, images["ranger"]));
		board.set(new Cell(7,1), new Ranger(1, images["ranger"]));

		board.set(new Cell(5,0), new Cleric(1, images["cleric"]));

    	board.set(new Cell(2,2), new Mage(1, images["mage"]));
    	board.set(new Cell(8,2), new Mage(1, images["mage"]));
	}

	startGame = function() {
		reset();
		
    	canvas.addEventListener("mousemove", function(e) {
   			setCursorPosition(e);
   			hoverUpdate();
		});

		canvas.addEventListener("click", function(e) {
   			setCursorPosition(e);
   			clickUpdate();
		});

		render();
	}

	loadImage = function() {
		imageCount -= 1;
		if(imageCount == 0) {
			startGame();
		}
	}

	loadImages = function(imgs) {
		for(var i = 0; i < imgs.length; i++) {
			img = imgs[i];
			images[img] = new Image();
	    	images[img].onload = function() { loadImage(); };
	    	images[img].src = "imgs/"+img+".png"
		}
	}

	init = function() {
		canvas = document.getElementById("canvas");
    	ctx = canvas.getContext("2d");

    	images = {};
		imgs = ["knight", "mage", "ranger", "cleric", "tile"];
		imageCount = imgs.length;
    	loadImages(imgs);
	    
	    document.getElementById("endTurnButton").addEventListener('click', function() {
	    	nextTurn();
	    	render();
	    });

	    document.getElementById("moveButton").addEventListener('click', function() {
	        if(!moved && state == 2){
            	state = 1;
		    	render();
			}
	    });

		document.getElementById("attackButton").addEventListener('click', function() {
	        if(!attacked && state == 1){
            	state = 2;
		   		render();
			}
	    });

	    document.getElementById("newGameButton").addEventListener('click', function() {
	        reset();
	        render();
	    });
	}

	this.start = function() {
		init();
	}
}

new Game().start();
