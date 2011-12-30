//Version: 1.0
//Date:2011-12-25

Array.prototype.contain = function(v){
	for (var i = 0; i < this.length; i++) {
		if(this[i]==v)
			return true;
	}
	return false;
}
Array.prototype.insert = function(i,v){
	this.splice(i,0,v);
}
Array.prototype.remove = function(i){
	this.splice(i,1);
}

function Shape(){
	this.blocks = new Array();
	this.nextShape = null;
	//0:not equal,1:completely equal,2:same shape but different state
	this.equals = function(shape){
		this.reposition();
		shape.reposition();
		return BlockTools.equalBlocks(this.blocks,shape.blocks);
	}
	this.turnRight = function(){
		var shape = new Shape();
		shape.blocks = $.extend(true,shape.blocks,this.blocks);
		for (var i = 0; i < shape.blocks.length; i++) {
			var b = shape.blocks[i];
			shape.blocks[i] = [b[1]*-1,b[0]];
		}
		shape.reposition();
		return shape;
	}
	this.reposition = function(){
		this.blocks = this.blocks.sort(BlockTools.compare);
		var ci = BlockTools.getCenter(this.blocks);
		var cb = this.blocks[ci];
		var cx = cb[0];
		var cy = cb[1];
		if(cx==0 && cy==0) return this;
		for (var i = 0; i < this.blocks.length; i++) {
			var x = this.blocks[i][0];
			var y = this.blocks[i][1];
			this.blocks[i] = [x-cx,y-cy];
		}
		return this;
	}
}

function Tetris(shape){
	this.shape = shape;
	this.lastPosition = null;
	this.position = null;
	this.speed = config.initialSpeed; 
	this.getFirstPosition = function(){
		var y = 0;
		for (var i = 0; i < this.shape.blocks.length; i++) {
			var b = this.shape.blocks[i];
			y = Math.min(y, b[1]);
		}
		var x = Math.floor(config.worldWidth/2);
		this.position = [x,y*-1];
		return this.position;
	}
	this.checkBlocks = function(blocks,x,y){
		if(this.position==null)
			this.position = this.getFirstPosition();
		for (var i = 0; i < blocks.length; i++) {
			var b = blocks[i];
			var bx = b[0]+this.position[0]+x;
			var by = b[1]+this.position[1]+y;
			if(World.getBlockState(bx,by)!=0)
				return false;
		}
		return true;
	}
	this.checkMove = function(x,y){
		return this.checkBlocks(this.shape.blocks,x,y);
	}
	this.move = function(x,y){
		if(!this.checkMove(x,y))return false;
		var p = this.position;
		this.lastPosition = p;
		this.position = [p[0]+x,p[1]+y];
		return true;
	}
	this.down = function(){
		return this.move(0,1);
	}
	this.checkDown = function(){
		return this.checkMove(0,1);
	}
	this.right = function(){
		return this.move(1,0);
	}
	this.left = function(){
		return this.move(-1,0);
	}
	this.checkTurn = function(shape){
		if(shape==null) return false;
		return this.checkBlocks(shape.blocks,0,0);
	}
	this.turn = function(){
		if(!this.checkTurn(this.shape.nextShape))return false;
		this.shape = this.shape.nextShape;
		return true;
	}
}

var Random = function(){
	this.getNum = function(n){
		if(n<0)return 0;
		return Math.floor(Math.random()*n);
	},
	this.getOne = function(list){
		if(!list || !list.length)return null;
		if(list.length<1)return null;
		return list[this.getNum(list.length)];
	}
}

var TetrisFactory = {
	rd : new Random(),
	newTetris : function(shapeList){
		var shapes = this.rd.getOne(shapeList);
		var shape = this.rd.getOne(shapes);
		var tetris = new Tetris(shape);
		return tetris;
	}
}

function Cube(n,canOverlap){
	this.n = n;
	this.canOverlap = canOverlap?canOverlap:false;
	this.baseBlocks = new Array();
	for(var y=0;y<this.n;y++){
		for(var x=0;x<this.n-y;x++){
			this.baseBlocks.push([x,y]);
		}
	}

	//check duplication and neighbour
	this.checkBlock = function(cursor){
		var curBlock = this.blocks[cursor];
		var neighFlag = false;
		for(var i=0;i<cursor;i++){
			if(BlockTools.equalBlock(curBlock,this.blocks[i])){
				return false;
			}
			if(!neighFlag && BlockTools.isNeighbour(curBlock,this.blocks[i])){
				neighFlag = true;
			}
		}
		return neighFlag || cursor==0;
	}
	this.blocks = new Array(this.n);
	this.shapeList = new Array();
	this.createShape = function(){
		var shape = new Shape();
		shape.blocks = $.extend(true,shape.blocks,this.blocks);
		return shape;
	}
	this.addShape = function(shape){
		for (var i = 0; i < this.shapeList.length; i++) {
			var shapes = this.shapeList[i];
			for (var j = 0; j < shapes.length; j++) {
				if(shapes[j].equals(shape)){
					return false;
				}
			}
		}
		var na = new Array();
		na.push(shape.reposition());
		var sp = shape;
		for (var i = 0; i < 3; i++) {
			sp = sp.turnRight();
			if(shape.equals(sp)){
				break;
			}
			na.push(sp.reposition());
			na[i].nextShape = na[i+1];
		}
		if(na.length>1){
			na[na.length-1].nextShape = na[0];
		}
		this.shapeList.push(na);
		return true;
	}
	this.createBlocks = function(cursor){
		if(cursor==this.n){
			var shape = this.createShape();
			this.addShape(shape);
			return cursor-1;
		}
		for(var i=0;i<this.baseBlocks.length;i++){
			this.blocks[cursor] = this.baseBlocks[i];
			if(!this.checkBlock(cursor))continue;
			cursor = this.createBlocks(cursor+1);
		}
		return cursor-1;
	}
	this.getShapeList = function(){
		this.createBlocks(0);
		return this.shapeList;
	}
}

var BlockTools = {
	inBlock : function(block, blockList){
		for(var i=0;i<blockList.length;i++){
			if(this.equalBlock(block,blockList[i])){
				return true;
			}
		}
		return false;
	},
	equalBlock : function(b1,b2){
		return b1[0]==b2[0] && b1[1]==b2[1];
	},
	compare: function(b1,b2) {
		if(b1[0]>b2[0])return 1;
		if(b1[0]<b2[0])return -1;

		if(b1[1]>b2[1])return 1;
		if(b1[1]<b2[1])return -1;
		return 0;
	},
	getRange : function(b1,b2){
		return Math.pow(b1[0]-b2[0],2)+Math.pow(b1[1]-b2[1],2);
	},
	isNeighbour : function(b1,b2){
		return this.getRange(b1,b2)==1;
	},
	equalBlocks : function(bs1,bs2){
		if(!bs1 || !bs1.length || !bs2 || !bs2.length)return false;
		if(bs1.length != bs2.length) return false;
		for (var i = 0; i < bs1.length; i++) {
			if(!this.equalBlock(bs1[i],bs2[i]))
				return false;
		}
		return true;
	},
	getCenter : function(blocks){
		var minRangeIndex = 0;
		var minRange = -1;
		for (var i = 0; i < blocks.length; i++) {
			var rangeSum = 0;
			for (var j = 0; j < blocks.length; j++) {
				rangeSum += this.getRange(blocks[i],blocks[j]);
			}
			if(minRange==-1 || minRange > rangeSum){
				minRange = rangeSum;
				minRangeIndex = i;
			}
		}
		return minRangeIndex;
	},
	convertXy : function(lists){
		var l = new Array();
		for (var i = 0; i < lists.length; i++) {
			for (var j = 0; j < lists[i].length; j++) {
				if(!l[j])l[j] = new Array();
				l[j][i] = lists[i][j]
			}
		}
		return l;
	}
}
var World = {
	getBlockState : function(x,y){
		if(x<0 || y<0) return -1;
		var ss = GameContainer.worldStates;
		if(x>=ss.length || y>=ss[x].length) return -1;
		return ss[x][y];
	},
	changeState : function(ws,list){
		list = list.sort();
		for (var i = 0; i < list.length; i++) {
			var index = list[i];
			ws.remove(index);
			var na = new Array();
			for (var j = 0; j < config.worldWidth; j++) {
				na.push(0);
			}
			ws.insert(0,na);
		}
		return ws;
	}
}

var Drawer = {
	context : null,
	drawWorld : function(id,width,height,density){
		var canvas = $("#"+id).get(0);
		this.context = canvas.getContext("2d");
		this.context.strokeStyle = "e5e5e5";
		var x = 1;
		var y = 1;
		for(var i=0;i<width;i++){
			y = 1;
			for(var j=0;j<height;j++){
				this.context.strokeRect(x, y, density, density);
				this.context.clearRect(x, y, density, density);
				y += density;
			}
			x += density;
		}
		this.context.strokeStyle = "000000";
		this.context.strokeRect(0,0,x+1,y+1);
		return this.context;
	},
	clearShape : function(shape,p){
		this.processShape(shape,p,function(x,y,w,l){
			Drawer.context.clearRect(x,y,w,l);
		});
	},
	drawShape : function(shape,p){
		this.processShape(shape,p,function(x,y,w,l){
			Drawer.context.fillRect(x,y,w,l);
		});
	},
	processShape : function(shape,p,f){
		var density = config.density;
		for (var i = 0; i < shape.blocks.length; i++) {
			var b = shape.blocks[i];
			var x = b[0]+p[0];
			var y = b[1]+p[1];
			f(x*density+1,y*density+1,density-1,density-1);
		}
	},
	drawTetris : function(tetris){
		if(tetris.lastPosition!=null){
			this.clearShape(tetris.shape, tetris.lastPosition);
		}
		if(tetris.position==null){
			this.drawShape(tetris.shape, tetris.getFirstPosition());
		}else{
			this.drawShape(tetris.shape, tetris.position);
		}
	},
	clearTetris : function(tetris){
		this.clearShape(tetris.shape,tetris.position);
	},
	flushWorld : function(){
		var ws = GameContainer.worldStates;
		var density = config.density;
		for (var x = 0; x < ws.length; x++) {
			for (var y = 0; y < ws[x].length; y++) {
				if(ws[x][y]==0){
					this.context.clearRect(x*density+1,y*density+1,density-1,density-1);
				}else{
					this.context.fillRect(x*density+1,y*density+1,density-1,density-1);
				}
			}
		}
	}
}
//Default Config
var config = {
	tetrisLenght : 4,
	worldWidth : 10,
	worldHeight : 20,
	density : 18,
	initialSpeed : 500,
	upshift : 0.9
}
var GameContainer = {
	shapeList : null,
	worldStates : null,
	state : 0
}
var GameControl = {
	curTetris : null,
	init : function(){
		var cube = new Cube(config.tetrisLenght);
		GameContainer.shapeList = cube.getShapeList();
		this.clearWorldStates();
	},
	clearWorldStates : function(){
		GameContainer.worldStates = new Array();
		for (var i = 0; i < config.worldWidth; i++) {
			GameContainer.worldStates.push(new Array());
			for (var j = 0; j < config.worldHeight; j++) {
				GameContainer.worldStates[i].push(0);
			}
		}
	},
	setWorldStates : function(tetris){
		if(tetris==null) return;
		for (var i = 0; i < tetris.shape.blocks.length; i++) {
			var b = tetris.shape.blocks[i];
			var bx = b[0]+tetris.position[0];
			var by = b[1]+tetris.position[1];
			GameContainer.worldStates[bx][by] = 1;
		}
	},
	checkLine : function(){
		if(this.curTetris==null)return;
		var ws = GameContainer.worldStates;
		ws = BlockTools.convertXy(ws);
		var flist = this.getFullLines(ws);
		if(flist.length>0){
			ws = World.changeState(ws,flist);
			GameContainer.worldStates = BlockTools.convertXy(ws);
			Drawer.flushWorld();
		}
	},
	autoDown : function(){
		if(this.curTetris==null || !this.curTetris.down()){
			this.setWorldStates(this.curTetris);
			this.checkLine();
			this.curTetris = TetrisFactory.newTetris(GameContainer.shapeList);
			if(!this.curTetris.checkDown()){
				GameContainer.state = -1;
			}
		}
		Drawer.drawTetris(this.curTetris);
		if(GameContainer.state != -1)
			setTimeout(this.goon, this.curTetris.speed);
	},
	goon : function(){
		GameControl.autoDown();
	},
	start : function(){
		GameContainer.state = 1;
		this.goon();
	},
	getFullLines : function(ws){
		var fullLineList = new Array();
		for (var i = 0; i < ws.length; i++) {
			var f = true;
			for (var j = 0; j < ws[i].length; j++) {
				if(ws[i][j]==0){
					f = false;
					break;
				}
			}
			if(f){
				fullLineList.push(i);
			}
		}
		return fullLineList;
	}
}
var Action = {
	change : function() {
		var shape = GameControl.curTetris.shape;
		if(GameControl.curTetris.turn()){
			Drawer.clearShape(shape,GameControl.curTetris.position);
			GameControl.curTetris.lastPosition = null;
			Drawer.drawTetris(GameControl.curTetris);
		}
	},
	speedUp : function() {
		GameControl.curTetris.speed = 100;
	},
	speedBack : function() {
		GameControl.curTetris.speed = config.initialSpeed;
	},
	down : function(){
		if(GameControl.curTetris.down()){
			Drawer.drawTetris(GameControl.curTetris);
		}
	},
	left : function() {
		if(GameControl.curTetris.left()){
			Drawer.drawTetris(GameControl.curTetris);
		}
	},
	right : function() {
		if(GameControl.curTetris.right()){
			Drawer.drawTetris(GameControl.curTetris);
		}
	}
}
