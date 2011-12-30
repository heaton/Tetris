Array.prototype.distinct = function () {
    this.sort();
    var ret = [];
    for (var i = this.length - 1; i > -1; i--) {
        if (this[i] != ret[ret.length - 1]) ret.push(this[i]);
    }
    return ret;
};

function $(id) {
	return document.getElementById(id);
}

function get2dContext(id) {
	var canvas = $("TetrisFram");
	var context = canvas.getContext('2d');
	return context;
}

//绘制轮廓
function drawFram(id) {
	var context = get2dContext("TetrisFram");
	context.strokeStyle = "e5e5e5";
	var x = 1;
	var y = 1;
	for (i = 0; i < 10; i++) {
		for (ii = 0; ii < 20; ii++) {
			context.strokeRect(x, y, 18, 18);
			context.clearRect(x, y, 18, 18);
			y += 18;
		}
		y = 1;
		x += 18;
	}
	context.strokeStyle = "000000";
	context.strokeRect(0, 0, 182, 362);
}

//获取键盘动作
function catchAction(event) {
	//当按下left时。
	if (event.keyCode == 37) {
		if (Cube.checkCubeLt() !== true) {
			Cube.moveLeft();
		}
	}
	//当按下right时
	if (event.keyCode == 39) {
		if (Cube.checkCubeRt() !== true) {
			Cube.moveRight();
		}
	}
	//向上旋转
	if (event.keyCode == 38) {
		if (Cube.shapeAmount[Cube.shape] > 0 && Cube.checkRotate() !== true) {
			Cube.rotate();
		}
	}
	//加速向下
	if (event.keyCode == 40) {
		Cube.downSpeed = 100;
	}
}

//停止加速
function setSpeedToNormal(event) {
	if (event.keyCode == 40) {
		Cube.downSpeed = 500;
	}
}

var Fram = {};
//保存每个方块状态的列表
Fram.list = [];
Fram.init = function() {
	for (var i = 0; i < 20; i++) {
		Fram.list[i] = [];
		for (var ii = 0; ii < 10; ii++) {
			Fram.list[i][ii] = 0;
		}
	}
};
Fram.init();

var Cube = {};
Cube.canvas = $("TetrisFram");
Cube.context = Cube.canvas.getContext('2d');
Cube.shape = Math.floor(Math.random() * 7);
Cube.x = 73;
Cube.y = 1;
Cube.shapeAmount = [1,0,1,1,3,3,3];
//当前方块的形状，如果是方块的话应该为0，长条的话为1，L的话为3。
Cube.shapeNum = 0;
Cube.getCoordinate = function(xOry,shapeNum) {
	var shapeList = [[], [], [], [], [], [], []];
	var x = Cube.x;
	var y = Cube.y;
	if (shapeNum !== undefined) {
		shapeNum = shapeNum;
	}
	else {
		shapeNum = Cube.shapeNum;
	}
	// --
	shapeList[0][0] = [x - 18, x, x + 18, x + 36, y, y, y, y];
	// |
	shapeList[0][1] = [x, x, x, x, y, y - 18, y - 36, y - 54];
	//方块
	shapeList[1][0] = [x, x + 18, x, x + 18, y, y, y + 18, y + 18];
	//横z
	shapeList[2][0] = [x - 18, x, x, x + 18, y, y, y + 18, y + 18];
	//竖z
	shapeList[2][1] = [x + 18, x + 18, x, x, y - 18, y, y, y + 18];
	//反横z
	shapeList[3][0] = [x + 18, x, x, x - 18, y, y, y + 18, y + 18];
	//反竖z
	shapeList[3][1] = [x - 18, x - 18, x, x, y - 18, y, y, y + 18];
	//L.A
	shapeList[4][0] = [x + 36, x + 36, x + 18, x, y, y + 18, y + 18, y + 18];
	//L.B
	shapeList[4][1] = [x, x + 18, x + 18, x + 18, y - 18, y - 18, y, y + 18];
	//L.C
	shapeList[4][2] = [x + 36, x + 18, x, x, y, y, y, y + 18];
	//L.D
	shapeList[4][3] = [x + 18, x + 18, x + 18, x + 36, y - 18, y, y + 18, y + 18];
	//反L.A
	shapeList[5][0] = [x, x, x + 18, x + 36, y, y + 18, y + 18, y + 18];
	//反L.B
	shapeList[5][1] = [x + 36, x + 18, x + 18, x + 18, y - 18, y - 18, y, y + 18];
	//反L.C
	shapeList[5][2] = [x, x + 18, x + 36, x + 36, y, y, y, y + 18];
	//反L.D
	shapeList[5][3] = [x + 18, x + 18, x + 18, x + 36, y - 18, y, y + 18, y + 18];
	//山
	shapeList[6][0] = [x - 18, x, x + 18, x, y, y, y, y + 18];
	shapeList[6][1] = [x, x, x, x - 18, y - 18, y, y + 18, y];
	shapeList[6][2] = [x - 18, x, x + 18, x, y, y, y, y - 18];
	shapeList[6][3] = [x, x, x, x + 18, y - 18, y, y + 18, y];
	//console.log(Cube.shape + "," + Cube.shapeNum + "," + xOry);
	return shapeList[Cube.shape][shapeNum][xOry];
};

Cube.downSpeed = 500;

Cube.init = function() {
	Cube.shape = Math.floor(Math.random() * 7);
	Cube.shapeNum = 0;
	Cube.x = 73;
	Cube.y = 1;
	Cube.setPos();
	Cube.drawCube();
	setTimeout("Cube.down()", Cube.downSpeed);
};

Cube.currentPos = [];

Cube.setPos = function(x) {
	//x = 0；（标记空）
	//x = 1；（标记当前方块所在位置）
	//x = 2；（已有方块停落的位置）
	Cube.currentPos = Cube.getCurrentPos();
	//posList结构为[[i,ii],[i,ii],[i,ii],[i,ii]]
	if (x !== null && x !== undefined) {
		Fram.list[Cube.currentPos[0][0]][Cube.currentPos[0][1]] = x;
		Fram.list[Cube.currentPos[1][0]][Cube.currentPos[1][1]] = x;
		Fram.list[Cube.currentPos[2][0]][Cube.currentPos[2][1]] = x;
		Fram.list[Cube.currentPos[3][0]][Cube.currentPos[3][1]] = x;
	}
};

Cube.checkFramBottom = function() {
	if (Cube.currentPos[0][0] >= 19 || Cube.currentPos[1][0] >= 19 || Cube.currentPos[2][0] >= 19 || Cube.currentPos[3][0] >= 19) {
		return true;
	}
};

Cube.checkCubeBottom = function() {
	//Fram.list[y0 + 1][x0] == 2;
	//Fram.list[y1 + 1][x1] == 2;
	//Fram.list[y2 + 1][x2] == 2;
	//Fram.list[y3 + 1][x3] == 2;
	if (Fram.list[Cube.currentPos[0][0] + 1][Cube.currentPos[0][1]] == 2 ||
		Fram.list[Cube.currentPos[1][0] + 1][Cube.currentPos[1][1]] == 2 ||
		Fram.list[Cube.currentPos[2][0] + 1][Cube.currentPos[2][1]] == 2 ||
		Fram.list[Cube.currentPos[3][0] + 1][Cube.currentPos[3][1]] == 2) {
	   return true;
	}
};

Cube.checkClear = function() {
	var clearList = [];
	var stopedPos = Cube.currentPos;
	var checkList = [];
	var oneRow;
	var rowPassed;
	for (var i = 0; i < stopedPos.length; i++) {
		checkList.push(stopedPos[i][0]);
	}
	checkList = checkList.distinct();
	for (var i = 0; i < checkList.length; i++) {
		oneRow = checkList[i];
		rowPassed = true;
		for (var ii = 0; ii < Fram.list[oneRow].length; ii++) {
			//只要这一行有一个方块不等于2则停止检测这行并标记这行为false
			if (Fram.list[oneRow][ii] != 2) {
				rowPassed = false;
				break;
			}
		}
		if (rowPassed !== false) {
			clearList.push(oneRow);
		}
	}
	if (clearList[0]) {
		return clearList;
	}
};

Cube.clearRow = function(clearList) {
	clearList.sort();
	//clearList = [17,18,19]
	var timeOut = 0;
	for (var i = 0; i < clearList.length; i++) {
		for (var ii = 0; ii < 10; ii++) {
			Fram.list[clearList[i]][ii] = 0;
		}
	}
	function clearOneColumn() {
		if (x > 9) {
			clearInterval(loop);
		} else {
			for (var ii = 0; ii < clearList.length; ii++) {
				Cube.context.clearRect(x * 18 + 1,clearList[ii] * 18 + 1,17,17);
			}
			x += 1;
		}
	}
	var x = 0;
	var loop = setInterval(clearOneColumn,50);
	//下面是将方块下移的函数
	function rowDown() {
		console.log(clearList);
		for (var j = clearList[0] - 1; j >= 0; j--) {
			for (var jj = 0; jj < Fram.list[j].length; jj++) {
				if (Fram.list[j][jj] == 2) {
					//clear
					Fram.list[j][jj] = 0;
					Cube.context.clearRect(jj*18+1,j*18+1,17,17);
					//reDraw
					Fram.list[j + clearList.length][jj] = 2;
					Cube.context.fillRect(jj*18+1,(j + clearList.length)*18+1,17,17);
				}
			}
		}
	}
	setTimeout(rowDown,550);
};

Cube.down = function() {
	if (Cube.checkFramBottom() === true || Cube.checkCubeBottom() === true) {
		//到达底部后将方块停落的位置标记为2，也就是代表已有方块存在。
		Cube.setPos(2);
		if (Cube.checkClear()) {
			Cube.clearRow(Cube.checkClear());
			//消掉方块后需要等待600ms再重新下落方块
			setTimeout(Cube.init, 600);
		} else {
			Cube.init();
		}
	} else {
		Cube.clearCube();
		Cube.setPos(0);
		//重绘
		Cube.y += 18;
		Cube.drawCube();
		Cube.setPos(1);
		setTimeout("Cube.down()", Cube.downSpeed);
	}
};

Cube.getCurrentPos = function(shapeNum) {
	if (shapeNum === 'next') {
		if (Cube.shapeNum != Cube.shapeAmount[Cube.shape]) {
			shapeNum = Cube.shapeNum + 1;
		}
		else {
			shapeNum = 0;
		}
	}
	var posList = [];
	//列表的序号和canvas的x,y坐标正好是反过来的
	//如果canvas是[x][y]的话列表就是[y][x]
	//Fram.list[第n个y轴坐标][第n个x轴坐标]
 	var i0 = (Cube.getCoordinate(4,shapeNum) - 1)/18;//第1个方块y轴坐标
 	var i1 = (Cube.getCoordinate(5,shapeNum) - 1)/18;//第2个方块y轴坐标
 	var i2 = (Cube.getCoordinate(6,shapeNum) - 1)/18;//第3个方块y轴坐标
 	var i3 = (Cube.getCoordinate(7,shapeNum) - 1)/18;//第4个方块y轴坐标
	var ii0 = (Cube.getCoordinate(0,shapeNum) -1)/18;//第1个方块x轴坐标
	var ii1 = (Cube.getCoordinate(1,shapeNum) -1)/18;//第2个方块x轴坐标
	var ii2 = (Cube.getCoordinate(2,shapeNum) -1)/18;//第3个方块x轴坐标
	var ii3 = (Cube.getCoordinate(3,shapeNum) -1)/18;//第4个方块x轴坐标
	posList[0] = [i0,ii0];
	posList[1] = [i1,ii1];
	posList[2] = [i2,ii2];
	posList[3] = [i3,ii3];
	return posList;
};

Cube.clearCube = function() {
	Cube.context.clearRect(Cube.getCoordinate(0), Cube.getCoordinate(4), 17, 17);
	Cube.context.clearRect(Cube.getCoordinate(1), Cube.getCoordinate(5), 17, 17);
	Cube.context.clearRect(Cube.getCoordinate(2), Cube.getCoordinate(6), 17, 17);
	Cube.context.clearRect(Cube.getCoordinate(3), Cube.getCoordinate(7), 17, 17);
};

Cube.drawCube = function() {
	Cube.context.fillRect(Cube.getCoordinate(0), Cube.getCoordinate(4), 17, 17);
	Cube.context.fillRect(Cube.getCoordinate(1), Cube.getCoordinate(5), 17, 17);
	Cube.context.fillRect(Cube.getCoordinate(2), Cube.getCoordinate(6), 17, 17);
	Cube.context.fillRect(Cube.getCoordinate(3), Cube.getCoordinate(7), 17, 17);
};

Cube.checkCubeLt = function() {
	//下面的代码相当于Fram.list[y][x + 1]
	if (Fram.list[Cube.currentPos[0][0]][Cube.currentPos[0][1] - 1] == 2 ||
		Fram.list[Cube.currentPos[1][0]][Cube.currentPos[1][1] - 1] == 2 ||
		Fram.list[Cube.currentPos[2][0]][Cube.currentPos[2][1] - 1] == 2 ||
		Fram.list[Cube.currentPos[3][0]][Cube.currentPos[3][1] - 1] == 2 ||
		Cube.currentPos[0][1] == 0 || Cube.currentPos[1][1] == 0 ||
		Cube.currentPos[2][1] == 0 || Cube.currentPos[3][1] == 0) {
			return true;
	}
};

Cube.checkCubeRt = function() {
	if (Fram.list[Cube.currentPos[0][0]][Cube.currentPos[0][1] + 1] == 2 ||
		Fram.list[Cube.currentPos[1][0]][Cube.currentPos[1][1] + 1] == 2 ||
		Fram.list[Cube.currentPos[2][0]][Cube.currentPos[2][1] + 1] == 2 ||
		Fram.list[Cube.currentPos[3][0]][Cube.currentPos[3][1] + 1] == 2 ||
		Cube.currentPos[0][1] == 9 || Cube.currentPos[1][1] == 9 ||
		Cube.currentPos[2][1] == 9 || Cube.currentPos[3][1] == 9) {
			return true;
	}
};

//让方块左右移动的函数
Cube.moveLeft = function() {
	Cube.clearCube();
	Cube.setPos(0);
	//更改x坐标并重绘
	Cube.x -= 18;
	Cube.drawCube();
	Cube.setPos(1);
};

Cube.moveRight = function() {
	Cube.clearCube();
	Cube.setPos(0);
	//更改x坐标并重绘
	Cube.x += 18;
	Cube.drawCube();
	Cube.setPos(1);
};

Cube.rotate = function() {
	if (Cube.shapeAmount[Cube.shape] > 0) {
	   	Cube.clearCube();
		Cube.setPos(0);
		//如果未达到形状上限的话则把Cube.shapeNum+1
		if (Cube.shapeNum != Cube.shapeAmount[Cube.shape]) {
			Cube.shapeNum += 1;
		}
		else {
			Cube.shapeNum = 0;
		}
		Cube.drawCube();
		Cube.setPos(1);
	}
};

Cube.checkRotate = function() {
	//这里是旋转的边框测试
	//条件为:如果下一个形状中的任何一个方块超过边界则不能进行旋转
	//nextShape = [[y,x],[y,x],[y,x],[y,x]];
	var nextShape = Cube.getCurrentPos("next");
	var y;
	var x;
	for (var i = 0; i < nextShape.length; i++) {
		y = nextShape[i][0];
		x = nextShape[i][1];
		if (x < 0 || x > 9 || y < 0 || y > 19) {
			return true;
		}
	};
	//旋转碰撞测试
	for (var i = 0; i < nextShape.length; i++) {
		y = nextShape[i][0];
		x = nextShape[i][1];
		if (Fram.list[y][x] == 2) {
			return true;
		}
	};
};

//Cube.init();
setTimeout(Cube.init, 50);

