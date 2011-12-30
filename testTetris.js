$(document).ready(function(){

	module("Array");

	test("test array contain", function(){
		var list = [4,6,-7,45];
		ok(list.contain(4));
		ok(list.contain(-7));
		ok(list.contain(45));
		ok(!list.contain(10));
		list = ["aa","bb"];
		ok(list.contain("aa"));
	});

	test("test insert", function(){
		var list = [1,3,5,7];
		list.insert(0,-1);
		equal(list[0],-1);
		list.insert(2,10);
		equal(list[2],10);
	});

	test("test remove", function(){
		var list = [1,3,5,7];
		list.remove(1);
		equal(list[1],5);
	});

	test("test drawWorld", function() {
	});

	module("Shape");

	test("test Shape equal", function(){
		var shape1 = new Shape();
		shape1.blocks = [[0,0],[1,0],[2,0],[3,0]];
		var shape2 = new Shape();
		shape2.blocks = [[0,0],[1,0],[2,0],[3,0]];
		ok(shape1.equals(shape2), "-- = --");
		shape1.blocks = [[0,0],[1,0],[2,0],[1,-1]];
		shape2.blocks = [[0,0],[1,0],[1,-1],[2,0]];
		ok(shape1.equals(shape2), "_|_ = _|_"); 
		shape1.blocks = [[0,0],[1,0],[2,0],[1,-1]];
		shape2.blocks = [[0,0],[-1,0],[0,-1],[1,0]];
		ok(shape1.equals(shape2), "_|_ = _|_");
		shape1.blocks = [[0,0],[1,0],[2,0],[1,-1]];
		shape2.blocks = [[0,0],[0,-1],[1,0],[0,1]];
		ok(!shape1.equals(shape2), "_|_ ~= |-");
		shape1.blocks = [[0,0],[1,0],[2,0],[1,-1]];
		shape2.blocks = [[0,0],[1,0],[2,0],[2,-1]];
		ok(!shape1.equals(shape2), "_|_ != __|");
	});

	test("test turnRight", function(){
		var shape = new Shape();
		shape.blocks = [[0,0],[2,0],[1,0],[1,1]];
		var shape1 = shape.turnRight();
		equalBlocks(shape1.blocks, [[-1,0],[0,-1],[0,0],[0,1]]);
		ok(!shape.equals(shape1));
		equalBlocks(shape1.turnRight().blocks, [[-1,0],[0,-1],[0,0],[1,0]]);
	});

	test("test reposition", function(){
		var shape = new Shape();
		shape.blocks = [[0,1],[1,1],[1,0],[2,1]];
		equalBlocks(shape.reposition().blocks, [[-1,0],[0,-1],[0,0],[1,0]]);
	});

	module("Tetris");

	test("test Tetris", function(){
		var shape = new Shape();
		shape.blocks = [[0,0],[1,0],[2,0],[3,0]];
		var t = new Tetris(shape);
		equal(t.shape, shape);
	});

	test("test getFirstPosition", function(){
		var shape = new Shape();
		shape.blocks = [[0,0],[1,-2],[2,-3],[-4,1]];
		var t = new Tetris(shape);
		var width = config.worldWidth;
		config.worldWidth = 13;
		ok(equalBlock(t.getFirstPosition(), [6,3]));
		ok(equalBlock(t.position, [6,3]));
		config.worldWidth = width;
	});

	test("test checkBlocks", function(){
		var shape = new Shape();
		shape.blocks = [[-1,0],[-1,0],[0,0],[1,0]];
		var t = new Tetris(shape);
		var wss = GameContainer.worldStates;
		GameControl.clearWorldStates();
		ok(t.checkBlocks(shape.blocks,0,1));
		ok(t.checkBlocks(shape.blocks,1,0));
		ok(t.checkBlocks(shape.blocks,-1,0));
		t.position = [1,5];
		ok(!t.checkBlocks(shape.blocks,-1,0));
		GameContainer.worldStates[5][5]=1;
		t.position = [4,4];
		ok(!t.checkBlocks(shape.blocks,0,1));
		t.position = [5,10];
		ok(t.checkBlocks(shape.blocks,0,1));
		GameContainer.worldStates = wss;
	});

	test("test checkMove", function(){
		var shape = new Shape();
		shape.blocks = [[-1,0],[-1,0],[0,0],[1,0]];
		var t = new Tetris(shape);
		t.checkBlocks = function(blocks,x,y){
			return blocks = shape.blocks && x==10 && y==20;
		}
		ok(t.checkMove(10,20));
		ok(!t.checkMove(0,-1));
	});

	test("test move", function(){
		var shape = new Shape();
		shape.blocks = [[-1,0],[-1,0],[0,0],[1,0]];
		var t = new Tetris(shape);
		t.checkMove = function(x,y){
			return true;
		}
		t.position = [1,4];
		equal(t.lastPosition,null);
		ok(t.down());
		ok(equalBlock(t.lastPosition,[1,4]));
		ok(equalBlock(t.position,[1,5]));
		ok(t.right());
		ok(equalBlock(t.position,[2,5]));
		ok(t.left());
		ok(equalBlock(t.position,[1,5]));
		t.checkMove = function(x,y){
			return false;
		}
		ok(!t.down());
		ok(equalBlock(t.position, [1,5]));
	});

	test("test checkDown", function(){
		var shape = new Shape();
		shape.blocks = [[-1,0],[-1,0],[0,0],[1,0]];
		var t = new Tetris(shape);
		t.checkMove = function(x,y){
			return x==0&&y==1;
		}
		ok(t.checkDown());
	});

	test("test checkTurn", function(){
		var shape = new Shape();
		shape.blocks = [[-1,0],[0,-1],[0,0],[1,0]];
		var t = new Tetris(shape);
		ok(!t.checkTurn(null));
		t.checkBlocks = function(blocks,x,y){
			return blocks[2][0]==1 && blocks[2][1]==1 && x==0&&y==0;
		}
		shape = new Shape();
		shape.blocks = [[-1,0],[0,-1],[1,1],[1,0]];
		ok(t.checkTurn(shape));
		shape.blocks = [[-1,0],[0,-1],[0,1],[1,0]];
		ok(!t.checkTurn(shape));
	});

	test("test turn", function(){
		var shape = new Shape();
		shape.blocks = [[-1,0],[0,-1],[0,0],[1,0]];
		var t = new Tetris(shape);
		shape.nextShape = new Shape();
		shape.blocks = [[-1,0],[0,-1],[1,1],[1,0]];
		t.checkTurn = function(shape){
			return false;
		}
		ok(!t.turn());
		equal(t.shape, shape);
		t.checkTurn = function(shape){
			return true;
		}
		ok(t.turn(shape));
		equal(t.shape, shape.nextShape);
	});
	module("Random");

	test("testGetNum", function() {
		var rd = new Random();
		ok(rd.getNum(1)==0);
		ok(rd.getNum(-1)==0);
		ok(rd.getNum(7)<7);
		ok(rd.getNum(5)<5);
	});

	test("testGetOne", function() {
		var rd = new Random();
		var list;
		equal(rd.getOne(list),null);
		list = new Array();
		equal(rd.getOne(list),null);
		list[0] = 1;
		equal(rd.getOne(list),1);
		list = [4,5,6];
		ok(isInArray(rd.getOne(list),list));
	});

	module("TetrisFactory");

	test("testNewTetris", function() {
		equal(TetrisFactory.rd.getNum(1), 0);
		TetrisFactory.rd.getNum = function(n){
			return 1;
		}
		var shapeList = [[0,1],[2,3],[4,5]];
		equal(TetrisFactory.newTetris(shapeList).shape,3);
	});

	module("Cube");

	test("test new Cube", function(){
		var cube = new Cube(3);
		equal(cube.n, 3);
		ok(!cube.canOverlap);
		var expect = [[0,0],[1,0],[2,0],[0,1],[1,1],[0,2]];
		equalBlocks(cube.baseBlocks, expect);
	});

	test("test createShape", function(){
		var cube = new Cube(3);
		var bs = [[1,2],[4,-3],[-2,1]];
		cube.blocks = bs;
		var shape = cube.createShape();
		equalBlocks(shape.blocks,bs);
		bs[0] = [2,3];
		ok(!equalBlock(bs[0],shape.blocks[0]));
	});

	test("test addShape", function(){
		var cube = new Cube(4);
		var shape = new Shape();
		shape.blocks = [[0,0],[-1,0],[1,0],[0,1]];
		cube.addShape(shape);
		equal(cube.shapeList.length,1);
		equal(cube.shapeList[0].length,4);
		equal(shape.nextShape,cube.shapeList[0][1]);
		shape = new Shape();
		shape.blocks = [[1,0],[0,0],[1,1],[2,1]]
		cube.addShape(shape);
		equal(cube.shapeList.length,2);
		equal(cube.shapeList[1].length, 2);
		equal(cube.shapeList[1][1].nextShape,cube.shapeList[1][0]);
		cube.addShape(shape);
		equal(cube.shapeList.length,2);
		equal(cube.shapeList[1].length, 2);
		shape = new Shape();
		shape.blocks = [[1,0],[0,0],[1,1],[0,1]]
		cube.addShape(shape);
		equal(cube.shapeList.length,3);
		equal(cube.shapeList[2].length, 1);
		equal(shape.nextShape,null);
	});

	test("test checkBlock", function(){
		var cube = new Cube(1);
		cube.blocks = [[0,0],[1,0],[2,0],[1,0],[-1,-1]];
		ok(!cube.checkBlock(3));
		ok(cube.checkBlock(2));
		ok(!cube.checkBlock(4));
		ok(cube.checkBlock(0));
		ok(cube.checkBlock(1));
	});

	test("test getShapeList", function(){
		var cube = new Cube(4);
		var shapeList = cube.getShapeList();
		if(!shapeList || shapeList.length==0){
			ok(false, "no return");
			return;
		}
		equal(shapeList.length, 7);
		var sumLength = 0;
		for(var i=0;i<shapeList.length;i++){
			sumLength += shapeList[i].length;
		}
		equal(sumLength, 19);
	});

	module("BlockTools");

	test("test inBlock", function(){
		ok(BlockTools.inBlock([1,2],[[0,0],[1,1],[1,2],[2,2]]));
		ok(!BlockTools.inBlock([3,2],[[0,0],[1,1],[1,2],[2,2]]));
	});

	test("test equalBlock", function(){
		ok(BlockTools.equalBlock([-2,1],[-2,1]));
		ok(!BlockTools.equalBlock([3,0],[-3,0]));
	});

	test("test compare", function(){
		equal(BlockTools.compare([1,2],[1,2]), 0);
		equal(BlockTools.compare([0,2],[1,2]), -1);
		equal(BlockTools.compare([-3,2],[-4,2]), 1);
		equal(BlockTools.compare([1,-4],[1,5]), -1);
		equal(BlockTools.compare([0,-2],[0,-3]), 1);
	});

	test("test getRange", function(){
		equal(BlockTools.getRange([1,3],[4,2]), 9+1);
		equal(BlockTools.getRange([1,3],[1,2]), 1);
		equal(BlockTools.getRange([4,2],[1,2]), 9);
	});

	test("test isNeighbour", function(){
		ok(BlockTools.isNeighbour([-1,0],[0,0]));
		ok(!BlockTools.isNeighbour([-1,0],[1,0]));
		ok(!BlockTools.isNeighbour([-1,1],[0,0]));
	});

	test("test equalBlocks", function(){
		ok(!BlockTools.equalBlocks(null,[[0,0]]));
		ok(!BlockTools.equalBlocks([[0,0]],null));
		ok(!BlockTools.equalBlocks([[0,0],[1,0],[-1,0]],[[0,0],[1,0],[1,0]]));
		ok(!BlockTools.equalBlocks([[1,0],[0,0],[-1,0]],[[0,0],[1,0],[-1,0]]));
		ok(BlockTools.equalBlocks([[1,0],[0,0],[-1,0]],[[1,0],[0,0],[-1,0]]));
	});

	test("test getCenter", function(){
		var blocks = [[0,0],[1,-1],[1,0],[2,0]];
		equal(BlockTools.getCenter(blocks),2);
		blocks = [[1,0],[0,-1],[0,0],[2,0]];
		equal(BlockTools.getCenter(blocks),0);
	});

	test("test convertXy", function(){
		var ls = [[1,2,3],[4,5,6],[7,8,9]];
		var lr = [[1,4,7],[2,5,8],[3,6,9]];
		var l = BlockTools.convertXy(ls);
		deepEqual(l, lr);
		l = BlockTools.convertXy(l);
		deepEqual(l,ls);
	});

	module("World");

	test("test getBlockState", function(){
		var ws = GameContainer.worldStates;
		GameContainer.worldStates = [[0,0,1],[1,0,0]]
		equal(World.getBlockState(-1,0),-1);
		equal(World.getBlockState(1,-3),-1);
		equal(World.getBlockState(4,0),-1);
		equal(World.getBlockState(1,3),-1);
		equal(World.getBlockState(0,1),0);
		equal(World.getBlockState(1,0),1);
		GameContainer.worldStates = ws;
	});

	test("test changeState", function(){
		var w = config.worldWidth;
		config.worldWidth = 4;
		var ws = [[0,1,1,0],[1,1,0,1],[1,0,0,1],[1,1,1,1]];
		ws = World.changeState(ws,[1]);
		equal(ws.length, 4);
		deepEqual(ws[0],[0,0,0,0]);
		deepEqual(ws[1],[0,1,1,0]);
		ws[0] = [1,0,1,0];
		ws = World.changeState(ws,[1,3]);
		equal(ws.length, 4);
		deepEqual(ws[0],[0,0,0,0]);
		deepEqual(ws[1],[0,0,0,0]);
		deepEqual(ws[2],[1,0,1,0]);
		deepEqual(ws[3],[1,0,0,1]);
		config.worldWidth = w;
	});

	module("Drawer");

	test("test processShape", function(){
		var shape = new Shape();
		shape.blocks = [[-1,2]];
		var position = [3,5];
		Drawer.processShape(shape,position,function(x,y,w,l){
			equal(x,2*config.density+1);
			equal(y,7*config.density+1);
			equal(w,config.density-1);
			equal(l,config.density-1);
		});
	});

	test("test drawTetris", function(){
		var ft1 = Drawer.clearShape;
		var ft2 = Drawer.drawShape;
		var doFlag1 = false;
		var doFlag2 = false;
		var s = new Shape();
		var t = new Tetris(s);
		t.getFirstPosition = function(){
			this.position = [1,2];
			return [1,2];
		}
		Drawer.clearShape = function(shape,p){
			equal(shape,s);
			ok(equalBlock(p,[3,5]));
			doFlag1 = true;
		}
		Drawer.drawShape = function(shape,p){
			equal(shape,s);
			ok(equalBlock(p,[1,2]));
			doFlag2 = true;
		}
		Drawer.drawTetris(t);
		ok(equalBlock(t.position,[1,2]));
		ok(doFlag2);
		ok(!doFlag1);
		doFlag2 = false;
		t.lastPosition = [3,5];
		Drawer.drawTetris(t);
		ok(doFlag1);
		ok(doFlag2);
		Drawer.clearShape = ft1;
		Drawer.drawShape = ft2;
	});

	test("test clearTetris", function(){
		var ft = Drawer.clearShape;
		var doFlag = false;
		var shape = new Shape();
		var t = new Tetris(shape);
		t.position = [0,1];
		Drawer.clearShape= function(s,p){
			equal(s,shape);
			ok(equalBlock(p,t.position));
			doFlag = true;
		}
		Drawer.clearTetris(t);
		ok(doFlag);
		Drawer.clearShape = ft;
	});

	module("GameControl");

	test("test init", function(){
		var ft = GameControl.clearWorldStates;
		var doFlag = false;
		GameControl.clearWorldStates = function(){
			doFlag = true;
		}
		GameControl.init();
		equal(GameContainer.shapeList.length, 7);
		ok(doFlag);
		GameControl.clearWorldStates = ft;
	});

	test("test clearWorldStates", function(){
		GameContainer.worldStates = null;
		GameControl.clearWorldStates();
		equal(GameContainer.worldStates.length, config.worldWidth);
		equal(GameContainer.worldStates[0].length, config.worldHeight);
		equal(GameContainer.worldStates[5][6], 0);
		equal(GameContainer.worldStates[9][19],0);
	});

	test("test setWorldStates", function(){
		GameControl.clearWorldStates();
		GameControl.setWorldStates(null);
		var shape = new Shape();
		shape.blocks = [[-1,0],[0,-1],[0,0],[1,0]];
		var t = new Tetris(shape);
		t.position = [3,14];
		GameControl.setWorldStates(t);
		var ws = GameContainer.worldStates;
		equal(ws[2][14],1);
		equal(ws[3][13],1);
		equal(ws[3][14],1);
		equal(ws[4][14],1);
	});

	test("test checkLine", function(){
		var t = GameControl.curTetris;
		GameControl.curTetris = null;
		GameControl.checkLine();
		var ft = GameControl.getFullLines;
		var ft3 = BlockTools.convertXy;
		var doFlag3 = false;
		BlockTools.convertXy = function(ws){
			doFlag3 = true;
			return null;
		}
		var doFlag = false;
		GameControl.getFullLines = function(ws){
			doFlag = true;
			return new Array();
		}
		var ft1 = Drawer.flushWorld;
		var doFlag1 = false;
		Drawer.flushWorld = function(){
			doFlag1 = true;
		}
		var ft2 = World.changeState;
		var doFlag2 = false;
		World.changeState = function(ws,l){
			doFlag2 = true;
			deepEqual(l,[1,3]);
		}
		GameControl.curTetris = new Tetris(null);
		GameControl.checkLine();
		ok(doFlag);
		ok(!doFlag1);
		ok(!doFlag2);
		ok(doFlag3);
		doFlag = false;
		GameControl.getFullLines = function(){
			doFlag = true;
			return [1,3];
		}
		GameControl.checkLine();
		ok(doFlag);
		ok(doFlag1);
		ok(doFlag2);
		BlockTools.convertXy = ft3;
		World.changeState = ft2;
		Drawer.flushWorld = ft1;
		GameControl.getFullLines = ft;
		GameControl.curTetris = t;
	});

	test("test autoDown", function(){
	});

	test("test goon", function(){
		var ft = GameControl.autoDown;
		var doFlag = false;
		GameControl.autoDown = function(){
			doFlag = true;
		}
		GameControl.goon();
		ok(doFlag);
		GameControl.autoDown = ft;
	});

	test("test start", function(){
		var ft = GameControl.goon;
		var doFlag = false;
		GameControl.goon = function(){
			doFlag = true;
		}
		GameControl.start();
		ok(doFlag);
		equal(GameContainer.state,1);
		GameControl.goon = ft;
	});

	test("test getFullLines", function(){
		var ls = [[0,0,1,0],[1,0,1,0],[0,1,0,1],[0,0,0,0],[1,1,1,0],[1,1,1,1],[1,0,0,1],[1,1,1,1]];
		var l = GameControl.getFullLines(ls);
		deepEqual(l,[5,7]);
	});
});

function equalBlock(actual,expected){
	return actual[0]==expected[0] && actual[1]==expected[1];
}

function equalBlocks(actual, expected){
	equal(actual.length, expected.length);
	for(var i=0;i<expected.length;i++){
		ok(equalBlock(actual[i],expected[i]),"same Bolck");
	}
}

function isInArray(value, array){
	for(var i=0;i<array.length;i++){
		if(value==array[i])
			return true;
	}
	return false;
}

