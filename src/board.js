var Board = function(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;

	this.cellHeight = this.height/11;
	this.cellWidth = this.width/11;

	this.cells = {};

	this.get = function(cell) {
		if(cell.toStr() in this.cells) {
			return this.cells[cell.toStr()];
		} else {
			return -1;
		}
	}

	this.getCellFromMouse = function(mx, my) {
		if(mx < this.x || mx > this.x+this.width || my < this.y || my > this.y+this.height) {
			return -1;
		}
		cell = new Cell(Math.floor((mx-this.x)/this.cellWidth), Math.floor((my-this.y)/this.cellHeight));
		return (cell.toStr() in this.cells) ? cell : -1;
	}

	this.getCellCoords = function(cell) {
		coord = {}
		coord.x = this.x+cell.x*this.cellWidth;
		coord.y = this.y+cell.y*this.cellHeight;
		return coord;
	}

	this.set = function(cell, value) {
		this.cells[cell.toStr()] = value;
	}

	this.init = function() {
		this.cells = {};

		for(var i = 0; i < 11; i++) {
    		for(var j = 0; j < 11; j++) {
    			if(!(  (i == 0  && (j < 2 || j > 8)) 
    				|| (i == 10 && (j < 2 || j > 8)) 
    				|| (i == 1  && (j == 0 || j == 10)) 
    				|| (i == 9  && (j == 0 || j == 10)))) {
    				this.set(new Cell(i, j), 0);
    			} 
    		}
    	}
	}

	this.nextTurn = function(turn) {
		for(key in this.cells) {
			if(this.cells[key] != 0 && this.cells[key].player != turn%2 && this.cells[key].currentRFP > 0) {
				this.cells[key].currentRFP -= 1;
			}
		}
	}

	this.renderPieces = function(ctx) {
		for(key in this.cells) {
			if(this.cells[key] != 0) {
				coord = this.getCellCoords(Cell.fromStr(key));
				this.cells[key].render(ctx, coord, this.cellWidth, this.cellHeight);
			}
		}
	}

	this.render = function(ctx) {
		ctx.fillStyle = "#000000"
		// for(var cell in this.cells) {
		// 	currCell = Cell.fromStr(cell);
		// 	coords = this.getCellCoords(currCell);

		// 	ctx.beginPath();
		// 	ctx.lineWidth="2";
		// 	ctx.strokeStyle = "black";
		// 	ctx.rect(coords.x, coords.y, this.cellWidth, this.cellHeight);
		// 	ctx.stroke();
		// }

		for(var i = 0; i < 11; i++) {
			ctx.font = "12px Arial";
			ctx.textAlign = "center";
			ctx.fillStyle = "#000000";
			ctx.textBaseline = "middle";
			ctx.fillText(i, this.x-10, this.y + this.cellHeight*(i+0.5));
			ctx.fillText(i, this.x + this.cellWidth*(i+0.5), this.y-10);
		}

		this.renderPieces(ctx);
	}

	this.gameOver = function() {
		p1 = false;
		p2 = false;
		for(cell in this.cells) {
			piece = this.cells[cell];
			if(piece != 0) {
				if(piece.player == 0) {
					p1 = true;
				} else {
					p2 = true;
				}
			}
		}

		return !(p1 && p2);
	}
}
