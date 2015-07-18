var bind = function (fn, me) {
            return function () {
                return fn.apply(me, arguments);
            };
        };
//游戏画板类
var Board = function(game, height, width){

	this.game = game; 
	this.height = height;
	this.width = width;
	this.static_blocks = [];
	this.build();
};
//画板创建
Board.prototype.build = function(){
	var row,cell,i,j;
	var temprow;

	this.cells = []; //存储画板上的每一小格x，y坐标的数组,这个坐标存储在每一个小块的location属性中
	for (i = 0; i < this.height; i++) {
		row = $('<div>').addClass('row');
		temprow = [];
		for (j = 0; j < this.width; j++) {
			cell = $('<div>').addClass('cell');
			//console.log(x+','+y);
			temprow.push(cell);
			row.append(cell);
		};
		this.cells.push(temprow);
		if(this.height>10){
			$("#board").append(row);
		}else{
			$("#nextboard").append(row);
		}
		
		//console.log($("#board").val());
	};
	//console.log(this.cells);
};

//判断游戏面板的第i行是否全占满
Board.prototype.isFull = function(i) {
	var row_i = this.cells[i];
	var results = [];
	for (var k= 0; k < row_i.length; k++) {
		if(row_i[k].hasClass('block') !== true){
			results.push(1);
		}
	};
	return results.length === 0 ? true : false; //一行全满返回true、否则返回false

};

//清除消掉的行上边静止的方块
Board.prototype.clearStatic = function() {
	var static_blocks = this.static_blocks;
	for (var k = 0; k < static_blocks.length; k++) {
		static_blocks[k].erase();
	};
};

//将消掉的行上边静止的方块下移
Board.prototype.shiftDownStatic = function(i) {
	var static_blocks = this.static_blocks;
	for (var k = 0; k < static_blocks.length; k++) {
		static_blocks[k].shiftDown(i);
	};
};

//下移后恢复消掉的行上边静止的方块
Board.prototype.unClearStatic = function() {
	var static_blocks = this.static_blocks;
	for (var k = 0; k < static_blocks.length; k++) {
		static_blocks[k].draw();
	};
};




//检测全满需要消除的行，并进行消除处理
Board.prototype.checkFullLines = function() {
	var fullLines = [];//存储哪一行需要消除，因为要消除的可能不是一行
	for (var i = this.cells.length - 1; i >= 0; i--) {//从下往上进行检查
		if(this.isFull(i)){ //如果第i行全满,将这一行消除
			fullLines.push(i);
			for (var j = 0; j < this.static_blocks.length; j++) { //对每一个底层堆叠静止的方块进行i行擦除
				this.static_blocks[j].crashLine(i);
			};
		}
	};
	//消除完需要消除的行之后，要进行消除处理，将这些行上边剩下的方块集体向下移动n行（n为消除的行数）
	this.clearStatic();
	var craseLines = fullLines.reverse();//定义消除掉的所有行，从上往下数
	for (var k = 0; k < craseLines.length; k++) { //将消除掉的所有行 从上到下 一行一行下移
		this.shiftDownStatic(craseLines[k]);
	};
	this.unClearStatic();
	this.game.cal_score(craseLines.length);
};

//Chunk定义一个小块，即block的一个格子，并且带有坐标
var Chunk = function(block, coor) {
	this.block = block;
	this.x = coor[1];
	this.y = coor[0];
	this.crashed = false;//定义一个小块是否为已经处于消除状态
};

Chunk.prototype.currentX = function() {
	return this.x + this.block.location.x;
};

Chunk.prototype.currentY = function() {
	return this.y + this.block.location.y;
};

//方块类
var Block = function(board, location) {
	var i;
	this.board = board;
	this.location = location;   
	//定义7种方块
	this.blocks = [
	{
	  class: 'blockI',
      shape: [ [ 0, -1 ], [ 0, 0 ], [ 0, 1 ], [ 0, 2 ] ]
	},{
	  class: 'blockO',
      shape: [ [ -1, -1 ], [ -1, 0 ], [ 0, -1 ], [ 0, 0 ] ]
	},{
	  class: 'blockT',
      shape: [ [ -1, -1 ], [ -1, 0 ], [ -1, 1 ], [ 0, 0 ] ]
	},{
	  class: 'blockZ',
      shape: [ [ -1, -1 ], [ -1, 0 ], [ 0, 0 ], [ 0, 1 ] ]
	},{
	  class: 'blockJ',
      shape: [ [ -1, -1 ], [ -1, 0 ], [ -1, 1 ], [ 0, 1 ] ]
	},{
	  class: 'blockL',
      shape: [ [ -1, -1 ], [ -1, 0 ], [ -1, 1 ], [ 0, -1 ] ]
	},{
	  class: 'blockS',
      shape: [ [ -1, 0 ], [ -1, 1 ], [ 0, -1 ], [ 0, 0 ] ]
	}
	];

	i = Math.floor(Math.random() * this.blocks.length);
    this['class'] = this.blocks[i]['class'];
    this.chunks = this.intoCoor(this.blocks[i]);
    this.draw();
}; 

//将一个形状的方块拼装成坐标的形式，参数为一个方块，即blocks数组的一项,返回由Chunk对象组成的一个数组，代表一个完整的方块组合
Block.prototype.intoCoor = function(a_block) {
	var chunks = [];
	for (var i = 0; i < a_block.shape.length; i++) {
		chunks.push(new Chunk(this, a_block.shape[i]));
	};
	return chunks;
};

//显示一个方块
Block.prototype.draw = function() {
	var temp = this.chunks;
	
	for (var i = 0; i < temp.length; i++) {
		//console.log(temp[i].currentY()+','+temp[i].currentX());
		if(!temp[i].crashed){
			this.board.cells[temp[i].currentY()][temp[i].currentX()].addClass('block').addClass(this['class']);	
		}
	
	};
};

//擦除一个方块
Block.prototype.erase = function() {
	var temp = this.chunks;
	//console.log('erase');
	for (var i = 0; i < temp.length; i++) {
		this.board.cells[temp[i].currentY()][temp[i].currentX()].removeClass('block').removeClass(this['class']);
	};
};

//如果一个方块有需要i行消除（在第i行堆满一行）的部分，此方法将其需要消除的部分消除
Block.prototype.crashLine = function(i) {
	var temp = this.chunks;
	for (var k = 0; k < temp.length; k++) { 
		if(temp[k].currentY() === i) { //擦除需要擦除的（第i行）的一个小方块（chunk）
			this.board.cells[temp[k].currentY()][temp[k].currentX()].removeClass('block').removeClass(this['class']);
			temp[k].crashed = true;
		}
	};
};

//检查方块在location位置是否正常
Block.prototype.check = function(location) {
	var temp = this.chunks;
	var checky,checkx;
	for (var i = 0; i < temp.length; i++) {
		//console.log(temp[i].currentY()+','+temp[i].currentX());
		checky = temp[i].y+location.y;
		checkx = temp[i].x+location.x;
		if(this.board.cells[checky] == null) {
			console.log('方块触底边界');
			return false;
		}else if(this.board.cells[checky][checkx] == null) {
			console.log('方块触左边界或右边界');
			return false;
		}else if(this.board.cells[checky][checkx].hasClass('block')){
			console.log('方块堆叠到已有静止方块上');
			return false;
		}
	};
	return true;
};

//方块旋转
Block.prototype.rotate = function() {
	var temp = this.chunks;
	var t;
	for (var i = 0; i < temp.length; i++) {
		t = temp[i].y;
		temp[i].y = temp[i].x;
		temp[i].x = -t;
	};
};

//方块旋转还原
Block.prototype.unrotate = function() {
	var temp = this.chunks;
	var t;
	for (var i = 0; i < temp.length; i++) {
		t = temp[i].x;
		temp[i].x = temp[i].y;
		temp[i].y = -t;
	};
};

//将一个方块在第i行上边的部分下移一行
Block.prototype.shiftDown = function(i) {
	var temp = this.chunks;
	for (var k = 0; k < temp.length; k++) { 
		if(temp[k].currentY() < i) { 
			temp[k].y += 1; //temp只是一个指针，改变temp[k]的y坐标同时会改变this.chunks[k]的y坐标
		}
	};
};

//游戏方块移动控制
Block.prototype.move = function(direction) {
	var  newlocation, xmod=0, ymod=0;

	this.erase();

	switch(direction) {
		case 'down': 
			{
				ymod = 1;
				break;
			}
		case 'left':
			{ 
				xmod = -1;
			   break;
			}
		case 'right': 
			{
				xmod = 1;
				break;
			}
		case 'rotate': 
			{
				if(this['class'] != 'blockO'){
					this.rotate();
				}

				break;
			}
	}

	newlocation = {
                x: this.location.x + xmod,
                y: this.location.y + ymod
         	   };
    var check = this.check(newlocation);
    if(check){
    	this.location = newlocation;
    }else{
    	if(direction == 'rotate'){
    		//console.log('rotate error');
    		this.unrotate();
    	}
    }
    
    console.log(this.location);

	this.draw();
	return check;
};

//方块瞬间下落触底
Block.prototype.drop = function() {
	while(this.move('down'));
};


var Input = function(game) {
	this.handleKey = bind(this.handleKey, this);
    this.game = game;
    $(document).keydown(this.handleKey);
};

Input.prototype.handleKey = function (e) {
    e.preventDefault();
    if (this.codes[e.keyCode]) {
        return this.game.input(this.codes[e.keyCode]);
    }
};
Input.prototype.codes = {
    32: 'rotate',
    37: 'left',
    38: 'drop',
    39: 'right',
    40: 'down',
    13: 'pause',
};

// var board = new Board("game",21,10);
// var block = new Block(board,{x:2,y:2});
// setTimeout(block.move('down'), 1000);

var Game = function(){
	this.tick = bind(this.tick, this);
	this.start = bind(this.start, this);
	this.pause = bind(this.pause, this);
	this.changeBlockStyle = bind(this.changeBlockStyle, this);
	this.changeBackGround = bind(this.changeBackGround, this);
	this.board = new Board(this,21,11);
	this.next_board = new Board(this,5,5);
	this.backgroundNum = 1; //控制背景图片的选择
	this.highScore = 0;//记录最高分数
	//this.block = new Block(this.board,{x:2,y:2});
	new Input(this);

	// $('#start').on('click', this.start);
	 $('#pause').on('click', this.pause);
	 $('#style').on('click', this.changeBlockStyle);
	 $('#background').on('click', this.changeBackGround);
	//this.start();

	this.next_board.cells[2][0].text('请');
	this.next_board.cells[2][1].text('点');
	this.next_board.cells[2][2].text('击');
	this.next_board.cells[2][3].text('开');
	this.next_board.cells[2][4].text('始');
	 $('#nextboard').on('click', this.start);
};

Game.prototype.start = function () {
	if(this.run) return;    //如果游戏没有结束，不进行游戏初始化
	this.active_block = false; //定义当前活动的方块
	this.block = false; //定义当前生成的方块
	this.l_cleared = 0; //消除的总行数 
	this.score = 0;  //总分数
	this.board.clearStatic();//清除原有面板
	$('#nextboard').addClass('grid'); //加上nextboard的网格效果
	$('#nextboard .cell').text(''); //清除nextboard上的文字
	this.cal_score(0); //还原分数和级别 速度等的显示数据
	this.genernateBlock(); //生成一个方块
	this.makeActive();  //使生成的方块进入游戏面板
	this.board.static_blocks = [];//定义已经下落触底后静止后的方块集合
	this.run = true; //控制游戏的进行与结束
	this.paused = false; //控制游戏的暂停与继续
	this.tick();
};

Game.prototype.pause = function () {
    if (!this.run) {
        return;
    }
    if(!this.paused){
		$('#nextboard').removeClass('grid');
		this.next_board.cells[4][0].text('游');
		this.next_board.cells[4][1].text('戏');
		this.next_board.cells[4][2].text('已');
		this.next_board.cells[4][3].text('暂');
		this.next_board.cells[4][4].text('停');
    }else{
    	$('#nextboard').addClass('grid');	
    	$('#nextboard .cell').text('');	
    }
    this.paused = !this.paused;
    
    //$('#board, #next').toggleClass('paused', this.paused);
};

//游戏核心计时函数，根据速度使方块进行下落，触底之后进行判断，将活动方块变为静止方块，并进行消行判定，之后使新的方块进入活动状态
Game.prototype.tick = function () {
	if(!this.run) return;
	setTimeout(this.tick, this.getSpeed());
	if (this.paused) return;
	 if (!this.active_block.move('down')) {
            this.makeStaticBlock();
            this.board.checkFullLines();
            this.makeActive();
        }
	//this.block.move('down');
};
//计算等级（每消掉10行增加一级，初始为1级）
Game.prototype.getLevel = function() {
	return Math.floor(this.l_cleared/10) + 1;
}
//计算下落速度，初始为1000ms下落一次
Game.prototype.getSpeed = function() {
	var speed = 1100 - this.getLevel() * 100;
	return speed > 0 ? speed : 50;
};
//输入控制函数
Game.prototype.input = function(input) {
	if(input == 'drop'){
		this.active_block.drop();
	}
	else if(input == 'pause') {
		this.pause();
	}
	else{
		this.active_block.move(input);
	}
};

//生成一个方块图形
Game.prototype.genernateBlock =  function() {
	this.block = new Block(this.next_board,{x:2,y:2});
};

//使一个生成的方块进入活动状态，进入游戏面板之中
Game.prototype.makeActive = function() {
	this.block.erase();
	this.active_block = this.block;
	this.active_block.location = { //方块的初始位置
		y:1,
		x:5
	};
	this.active_block.board = this.board;
	if (this.active_block.check(this.active_block.location)) {//如果刚生成的一个方块刚进入活动状态就check失败，说明方块已经堆叠到最上方，此时游戏结束
        this.active_block.draw();
        this.genernateBlock();
    } else{
    	this.gameover();
    }
};

//生成静止方块集合
Game.prototype.makeStaticBlock = function() {
	this.board.static_blocks.push(this.active_block);
};

//计算分数和消除的总行数，如果一次消掉n行则获得n*n*100分
Game.prototype.cal_score = function(n) {
	this.l_cleared += n ;
	this.score += 100 * n * n;
	if(this.score > this.highScore){ //记录最高分
		this.highScore = this.score;
		$("#hi_score_value").text(this.score);
	}
	$("#score_value").text(this.score);
	$("#l_cleared").text(this.score);
	$("#level").text(this.getLevel());
	$("#speed").text(this.getSpeed());
};
//游戏结束
Game.prototype.gameover = function() {
	this.run = false;
	$('#nextboard').removeClass('grid');
	this.next_board.cells[1][1].text('您');
	this.next_board.cells[1][2].text('挂');
	this.next_board.cells[1][3].text('了');

	this.next_board.cells[2][0].text('请');
	this.next_board.cells[2][1].text('重');
	this.next_board.cells[2][2].text('新');
	this.next_board.cells[2][3].text('来');
	this.next_board.cells[2][4].text('过');
	//alert('gameover');
	//this.start();
};

//切换方块外观
Game.prototype.changeBlockStyle = function() {
    $('#main').toggleClass('round');
};

//切换背景图片
Game.prototype.changeBackGround = function() {
 var imgArray  = [0,1,2,3,4,5];
 var n = this.backgroundNum++;
  $(".main").fadeOut(500,function(){
  	 $(".main").css("background-image","url(./img/bg"+imgArray[n % 6]+".jpg)");
 	 $(".main").fadeIn();
	});
};

$(function(){
 	new Game();
});


