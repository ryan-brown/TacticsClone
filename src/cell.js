var Cell = function(x, y) {
	this.x = x;
	this.y = y;

	this.equals = function(cell) {
		return (cell.x == this.x && cell.y == this.y);
	}

	this.toStr = function() {
		return this.x+","+this.y;
	}

	this.relative = function(x, y) {
		return new Cell(this.x+x, this.y+y);
	}
}

Cell.fromStr = function(str) {
	pos = str.split(",").map(function(x) {
		return parseInt(x);
	});

	return new Cell(pos[0], pos[1]);
}