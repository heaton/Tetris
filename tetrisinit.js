$(document).ready(function(){
	Drawer.drawWorld("TetrisFram",config.worldWidth,config.worldHeight,config.density);
	GameControl.init();
	GameControl.start();
	$("body").keydown(keyDownAction);
	$("body").keyup(keyUpAction);
});

function keyDownAction(event){
	//left
	if(event.keyCode == 37){
		Action.left();
	}
	//right
	if(event.keyCode == 39){
		Action.right();
	}
	//up
	if(event.keyCode == 38){
		Action.change();
	}
	//down
	if(event.keyCode == 40){
		Action.down();
		Action.speedUp();
	}
}
function keyUpAction(event){
	//down
	if(event.keyCode == 40){
		Action.speedBack();
	}
}
