var Piece = function(maxHP, dodge, res, speed, rfp, orient, player, image) {
	this.maxHP = maxHP;
	this.hp = this.maxHP;
	this.dodge = dodge;
	this.res = res;
	this.speed = speed;
	this.rfp = rfp;
	this.currentRFP = 0;
	this.orient = orient;
	this.player = player;
	this.image = image;
	this.color = (this.player%2 == 0) ? "#FFDD88" : "#88DDFF"

	this.render = function(ctx, coord, width, height) {
		// ctx.beginPath();
		// ctx.arc(coord.x+25, coord.y+25, 20, 0, 2 * Math.PI, false);
		// ctx.fillStyle = this.color;
		// ctx.fill();
		// ctx.lineWidth = 2;
  //     	ctx.strokeStyle = '#000000';
  //     	ctx.stroke();

		ctx.save();
		ctx.translate(coord.x+25, coord.y+25); 
		ctx.rotate(Math.PI/2*this.orient); 
		ctx.drawImage(this.image, -25, -25);
		ctx.restore();
	}

	this.renderInfo = function(ctx) {
		ctx.fillStyle = "#000000";
		ctx.fillRect(24, 24, 102, 27);

		ctx.fillStyle = "#FF0000";
		ctx.fillRect(25, 25, 100, 25);

		ctx.fillStyle = "#00FF00";
		ctx.fillRect(25, 25, 100*(this.hp/this.maxHP), 25);

		ctx.font = "16px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "#000000";
		ctx.fillText(this.hp+"/"+this.maxHP+" HP", 75, 38);
		ctx.fillText(this.toStr(), 375, 675);
	}

	this.toStr = function() {
		return "HP: "+this.hp+"/"+this.maxHP+
				" | Dodge: "+this.dodge+"%"+
				" | Resist: "+this.res+"%"+
				" | Speed: "+this.speed+
				" | Range: "+this.range+
				" | Player: "+this.player+
				" | RFP: "+this.currentRFP+"/"+this.rfp+
				" | Orient: "+this.orient;

	}

	this.getDodgeRatio = function(me, you, orientation) {
		backRatio = 0.20;
		sideRatio = 0.60;
		frontRatio = 1;

		dodgeRatio = frontRatio;
		switch(orientation) {
			case 0:
				if(me.x == you.x && me.y > you.y) {
					dodgeRatio = backRatio;
				} else if(!((you.y - me.y) >= Math.abs(you.x - me.x))) {
					dodgeRatio = sideRatio;
				}
				break;
			case 1:
				if(me.y == you.y && me.x < you.x) {
					dodgeRatio = backRatio;
				} else if(!((me.x - you.x) >= Math.abs(you.y - me.y))) {
					dodgeRatio = sideRatio;
				}
				break;
			case 2:
				if(me.x == you.x && me.y < you.y) {
					dodgeRatio = backRatio;
				} else if(!((me.y - you.y) >= Math.abs(you.x - me.x))) {
					dodgeRatio = sideRatio;
				}
				break;
			case 3:
				if(me.y == you.y && me.x > you.x) {
					dodgeRatio = backRatio;
				} else if(!((you.x - me.x) >= Math.abs(you.y - me.y))) {
					dodgeRatio = sideRatio;
				}
				break;
		}

		return dodgeRatio;
	}
}

var Knight = function(player, image) {
	Piece.call(this, 50, 80, 20, 3, 1, player*2, player, image);
	this.range = 1;

	this.getPossibleAttackCells = function(startCell) {
		possibleCells = [];

		upCell = startCell.relative(0, -1);
		possibleCells.push(upCell);

		rightCell = startCell.relative(1, 0);
		possibleCells.push(rightCell);

		downCell = startCell.relative(0, 1);
		possibleCells.push(downCell);

		leftCell = startCell.relative(-1, 0);
		possibleCells.push(leftCell);

		return possibleCells;
	}

	this.getAffectedCells = function(startCell, hoveredCell) {
		return [hoveredCell];
	}

	this.useAbility = function(board, cells, me) {
		for(var i = 0; i < cells.length; i++) {
			piece = board.get(cells[i]);
			if(piece != 0) {
				dodgeRatio = this.getDodgeRatio(me, cells[i], piece.orient);
				roll = Math.floor(Math.random() * 100) + 1;

				if(roll > dodgeRatio*piece.dodge) {
					piece.hp -= 20;
				}
			}
		}
	}
}

var Mage = function(player, image) {
	Piece.call(this, 30, 20, 60, 3, 3, player*2, player, image);

	this.range = 3;

	this.getPossibleAttackCells = function(startCell) {
		possibleCells = [];

		for(var i = -this.range; i < this.range+1; i++) {
			if(i != 0) possibleCells.push(startCell.relative(0, i))

			radius =  this.range-Math.abs(i);

			for(j = radius; j > 0; j--) {
				possibleCells.push(startCell.relative(j, i));
				possibleCells.push(startCell.relative(-j, i));
			}
		}

		return possibleCells;
	}

	this.getAffectedCells = function(startCell, hoveredCell) {
		possibleCells = [hoveredCell];

		upCell = hoveredCell.relative(0, -1);
		possibleCells.push(upCell);

		rightCell = hoveredCell.relative(1, 0);
		possibleCells.push(rightCell);

		downCell = hoveredCell.relative(0, 1);
		possibleCells.push(downCell);

		leftCell = hoveredCell.relative(-1, 0);
		possibleCells.push(leftCell);

		return possibleCells;
	}

	this.useAbility = function(board, cells, me) {
		for(var i = 0; i < cells.length; i++) {
			piece = board.get(cells[i]);
			piece.hp -= 20*(1-piece.res/100);
		}
	}
}

var Ranger = function(player, image) {
	Piece.call(this, 40, 40, 30, 5, 2, player*2, player, image);

	this.range = 5;

	this.getPossibleAttackCells = function(startCell) {
		possibleCells = [];

		for(var i = -this.range; i < this.range+1; i++) {
			if(i != 0) possibleCells.push(startCell.relative(0, i))

			radius =  this.range-Math.abs(i);

			for(j = radius; j > 0; j--) {
				possibleCells.push(startCell.relative(j, i));
				possibleCells.push(startCell.relative(-j, i));
			}
		}

		return possibleCells;
	}

	this.getAffectedCells = function(startCell, hoveredCell) {
		return [hoveredCell];
	}

	this.useAbility = function(board, cells, me) {
		for(var i = 0; i < cells.length; i++) {
			piece = board.get(cells[i]);
			if(piece != 0) {
				dodgeRatio = this.getDodgeRatio(me, cells[i], piece.orient);
				roll = Math.floor(Math.random() * 100) + 1;

				if(roll > dodgeRatio*piece.dodge) {
					piece.hp -= 17;
				}
			}
		}
	}
}

var Cleric = function(player, image) {
	Piece.call(this, 35, 20, 40, 2, 5, player*2, player, image);

	this.range = 4;

	this.getPossibleAttackCells = function(startCell) {
		possibleCells = [];

		for(var i = -this.range; i < this.range+1; i++) {
			if(i != 0) possibleCells.push(startCell.relative(0, i))

			radius =  this.range-Math.abs(i);

			for(j = radius; j > 0; j--) {
				possibleCells.push(startCell.relative(j, i));
				possibleCells.push(startCell.relative(-j, i));
			}
		}

		return possibleCells;
	}

	this.getAffectedCells = function(startCell, hoveredCell) {
		possibleCells = [];
		for(var i = -1; i < 2; i++) {
			for(var j = -1; j < 2; j++) {
				possibleCells.push(hoveredCell.relative(i, j));
			}
		}

		return possibleCells;
	}

	this.useAbility = function(board, cells, me) {
		for(var i = 0; i < cells.length; i++) {
			piece = board.get(cells[i]);
			piece.hp += 15;
			if(piece.hp > piece.maxHP) piece.hp = piece.maxHP;
		}
	}
}
