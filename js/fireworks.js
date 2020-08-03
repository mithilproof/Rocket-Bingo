//Aliases
var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    Text = PIXI.Text,
    Graphics = PIXI.Graphics;



var type = "WebGL"
if(!PIXI.utils.isWebGLSupported()){
	type = "canvas";
}

//Create the renderer
var renderer = autoDetectRenderer(256, 256, {antialias: false, transparent: false, resolution: 1});

renderer.backgroundColor = 0x061639;

renderer.view.style.position = "absolute";
renderer.view.style.display = "block";
renderer.autoResize = true;
renderer.resize(window.innerWidth, window.innerHeight);

//Add the canvas to the HTML document

//Create a container object called the `stage`
var root = new Container();

var message = new Text(
	"Scoreboard",
	{fontFamily: "Arial", fontSize: 32, fill: "white"}
);

message.anchor.set(0.5,1);
message.position.set(window.innerWidth/2, window.innerHeight);
root.addChild(message);

var menuMusic, gameMusic, creditsMusic, winMusic, loseMusic, commentsGood=Array(), commentsBad=Array();
var commentCooldownDefault = 30*4;
var commentCooldown = commentCooldownDefault;

function startGame(){
	document.getElementById("intro").remove();
	
	document.body.appendChild(renderer.view);
	
	message.text = "loading sounds (28MB, might take a while…)"; 
	renderer.render(root);
	
	sounds.load([
	"sound/Rites.mp3",
	"sound/Cyborg Ninja_s.mp3",
	"sound/Rocket.mp3",
	"sound/Winner Winner.mp3",
	"sound/Hamster March.mp3",
	"sound/bingo2.mp3",
	"sound/bingo3.mp3",
	"sound/sad.mp3",
	"sound/ohhhh.mp3",
	"sound/noise.mp3",
	"sound/hui.mp3",
	"sound/poof.mp3",
	"sound/hmmm.mp3",
	"sound/great.mp3",
	"sound/fantastic.mp3",
	"sound/boring.mp3",
	"sound/ahhh.mp3",
	"sound/rekt.mp3"
	]);

	sounds.whenLoaded = loadGraphics;
}

function loadGraphics(){
	
	menuMusic = sounds["sound/Rites.mp3"];
	gameMusic = sounds["sound/Cyborg Ninja_s.mp3"];
	creditsMusic = sounds["sound/Rocket.mp3"];
	winMusic = sounds["sound/Hamster March.mp3"];
	loseMusic = sounds["sound/Winner Winner.mp3"];
	
	commentsGood.push(sounds["sound/bingo3.mp3"],sounds["sound/bingo2.mp3"],sounds["sound/ohhhh.mp3"],sounds["sound/hui.mp3"],sounds["sound/great.mp3"],sounds["sound/fantastic.mp3"],sounds["sound/ahhh.mp3"]);
	commentsBad.push(sounds["sound/sad.mp3"],sounds["sound/hmmm.mp3"],sounds["sound/boring.mp3"],sounds["sound/rekt.mp3"]);
	
	gameMusic.loop = true;
	menuMusic.loop = true;
	creditsMusic.loop = true;
	winMusic.loop = false;
	loseMusic.loop = false;
	
	loader.add([
	"images/backdrop.png",
	"images/launcher.png",
	"images/rocket_yellow.png",
	"images/rocket_cyan.png",
	"images/rocket_gray.png",
	"images/boom01.png",
	"images/boom02.png",
	"images/boom03.png",
	"images/boom04.png",
	"images/boom05.png",
	"images/target_cyan.png",
	"images/target_yellow.png",
	"images/boomwrong.png",
	"images/score_cyan.png",
	"images/score_yellow.png",
	"images/help.png",
	"images/credits.png",
	"images/win.png",
	"images/lose.png"
	])
	.on("progress", loadProgressHandler)
	.load(setup);
}


function loadProgressHandler(loader, resource) {
	message.text = "loading " + resource.url + " ("+Math.round(loader.progress)+"% completed)"; 
	renderer.render(root);
}

var launcher, rocket, boom, target, scoreboard;
var keyLeft, keyUp, keyRight, keyDown, keyH, keyC, keyM, keyR;
var max_velocity = 12;
var autopilot_state = idle, autopilot_ticks = 30;
var boundary = {"top":20, "bottom":window.innerHeight, "left":20, "right":window.innerWidth-20};
var musicToggle = false;
var animatronix = Array();

function setup() {
	backdrop = new Sprite(
		loader.resources["images/backdrop.png"].texture
	);
	scoreboard = new Text(
		"Scoreboard",
		{fontFamily: "Arial", fontSize: 32, fill: "white"}
	);
	launcherA = new Sprite(
		loader.resources["images/launcher.png"].texture
	);
	launcherB = new Sprite(
		loader.resources["images/launcher.png"].texture
	);
	rocketA= new Sprite(
		loader.resources["images/rocket_yellow.png"].texture
	);
	rocketB= new Sprite(
		loader.resources["images/rocket_cyan.png"].texture
	);
	rocketC= new Sprite(
		loader.resources["images/rocket_gray.png"].texture
	);
	boomA = new Array();
	boomA.push(
		loader.resources["images/boom01.png"].texture
	);
	boomA.push(
		loader.resources["images/boom02.png"].texture
	);
	boomA.push(
		loader.resources["images/boom03.png"].texture
	);
	boomA.push(
		loader.resources["images/boom04.png"].texture
	);
	boomA.push(
		loader.resources["images/boom05.png"].texture
	);
	boomB = new Array();
	boomB.push(
		loader.resources["images/boom01.png"].texture
	);
	boomB.push(
		loader.resources["images/boom02.png"].texture
	);
	boomB.push(
		loader.resources["images/boom03.png"].texture
	);
	boomB.push(
		loader.resources["images/boom04.png"].texture
	);
	boomB.push(
		loader.resources["images/boom05.png"].texture
	);
	splatA = loader.resources["images/boomwrong.png"].texture;
	splatB = loader.resources["images/boomwrong.png"].texture;
	splatC = loader.resources["images/boomwrong.png"].texture;
	
	targetA = new Sprite(
		loader.resources["images/target_yellow.png"].texture
	);
	targetB = new Sprite(
		loader.resources["images/target_cyan.png"].texture
	);
	scoreA = new Sprite(
		loader.resources["images/score_yellow.png"].texture
	);
	scoreB = new Sprite(
		loader.resources["images/score_cyan.png"].texture
	);
	help = new Sprite(
		loader.resources["images/help.png"].texture
	);
	credits = new Sprite(
		loader.resources["images/credits.png"].texture
	);
	win = new Sprite(
		loader.resources["images/win.png"].texture
	);
	lose = new Sprite(
		loader.resources["images/lose.png"].texture
	);
	
	backdrop.position.set(0,0);
	backdrop.width = window.innerWidth;
	backdrop.height = window.innerHeight;
	
	scoreboard.anchor.set(0.5,1);
	scoreboard.position.set(window.innerWidth/2, window.innerHeight);
	
	help.anchor.set(0.5,0.5);
	help.position.set(window.innerWidth/2, window.innerHeight/2);
	
	credits.anchor.set(0.5,0.5);
	credits.position.set(window.innerWidth/2, window.innerHeight/2);
	credits.visible = false;
	
	win.anchor.set(0.5,0.5);
	win.position.set(window.innerWidth/2, window.innerHeight/2);
	win.visible = false;
	
	lose.anchor.set(0.5,0.5);
	lose.position.set(window.innerWidth/2, window.innerHeight/2);
	lose.visible = false;
	
	rocketA.initX = 50;
	rocketA.initY = window.innerHeight-1;
	
	rocketB.initX = window.innerWidth - 50;
	rocketB.initY = window.innerHeight-1;
	
	rocketC.initX = window.innerWidth/2;
	rocketC.initY = window.innerHeight-1;
	
	launcherA.position.set(50,window.innerHeight);
	launcherA.anchor.set(0.5, 1);
	
	rocketA.anchor.set(0.5, 0.5);
	rocketA.position.set(rocketA.initX, rocketA.initY);

	
	targetA.initX = 400;
	targetA.initY = 400;
	resetTarget(targetA);
	targetA.anchor.set(0.5, 0.5);
	
	scoreA.position.set((window.innerWidth/2)-120,window.innerHeight);
	scoreA.anchor.set(0.5, 1);
	
	rocketA.angle = 3*Math.PI/2;
	rocketA.velocity = 3;
	rocketA.color = 0xffcc00;
	rocketA.respects_boundary = true;
	
	
	
	launcherB.position.set(window.innerWidth-50,window.innerHeight);
	launcherB.anchor.set(0.5, 1);
	
	rocketB.position.set(rocketB.initX, rocketB.initY);
	rocketB.anchor.set(0.5, 0.5);
	
	targetB.initX = window.innerWidth-400;
	targetB.initY = 400;
	resetTarget(targetB);
	targetB.anchor.set(0.5, 0.5);
	
	scoreB.position.set((window.innerWidth/2)+120,window.innerHeight);
	scoreB.anchor.set(0.5, 1);
	
	rocketB.angle = 3*Math.PI/2;
	rocketB.velocity = 5;
	rocketB.color = 0x00aad4;
	rocketB.respects_boundary = true;
	
	
	rocketC.position.set(rocketC.initX, rocketC.initY);
	rocketC.anchor.set(0.5, 0.5);
	
	rocketC.angle = 3*Math.PI/2;
	rocketC.velocity = 5;
	rocketC.color = 0x483e37;
	rocketC.respects_boundary = false;
	
	
	root.addChild(backdrop);
	
	root.addChild(targetA);
	root.addChild(rocketA);
	root.addChild(launcherA);

	root.addChild(scoreA);
	
	root.addChild(targetB);
	root.addChild(rocketB);
	root.addChild(launcherB);

	root.addChild(scoreB);
	
	root.addChild(rocketC);
	
	root.addChild(scoreboard);
	
	
	keyLeft= keyboard(37);
	keyUp= keyboard(38);
	keyRight= keyboard(39);
	keyDown= keyboard(40);
	keyH= keyboard(72);
	keyA= keyboard(65);
	keyC= keyboard(67);
	keyM= keyboard(77);
	keyR= keyboard(82);
	
	keyH.press = function(){
		credits.visible = false;
		if(stateFunc == runGame){
			stateFunc = idle;
			help.visible = true;
			switchToMenuMusic();
		} else {
			stateFunc = runGame;
			help.visible = false;
			switchToGameMusic();
		}
	}
	
	keyC.press = function(){
		help.visible = false;
		if(stateFunc == runGame){
			stateFunc = idle;
			credits.visible = true;
			switchToCreditsMusic();
		} else {
			stateFunc = runGame;
			credits.visible = false;
			switchToGameMusic();
		}
	}
	
	keyA.press = function(){
		if(rocketA.autopilot_target == null){
			rocketA.autopilot_target = targetA;
		} else {
			rocketA.autopilot_target = null;
		}
	}
	
	keyM.press = function(){
		console.log("M");
	}
	
	keyR.press = function(){
		restart();
	}
	
	asdfjiadfadsf();
	
	rocketCountA = new Text(
		"0",
		{fontFamily: "Arial", fontSize: 30, fill: "white"}
	);
	rocketCountA.counter = 0;
	
	rocketCountB = new Text(
		"0",
		{fontFamily: "Arial", fontSize: 30, fill: "white"}
	);
	rocketCountB.counter = 0;
	scoreCountA = new Text(
		"0",
		{fontFamily: "Arial", fontSize: 30, fill: "white", fontWeight: "bold"}
	);
	scoreCountA.counter = 0;
	
	scoreCountB = new Text(
		"0",
		{fontFamily: "Arial", fontSize: 30, fill: "white", fontWeight: "bold"}
	);
	scoreCountB.counter = 0;
	
	
	
	rocketCountA.anchor.set(0.5,1);
	rocketCountA.position.set(50, window.innerHeight-5);
	
	rocketCountB.anchor.set(0.5,1);
	rocketCountB.position.set(window.innerWidth-50, window.innerHeight-5);
	
	scoreCountA.anchor.set(0.5,1);
	scoreCountA.position.set((window.innerWidth/2)-120, window.innerHeight-10);
	
	scoreCountB.anchor.set(0.5,1);
	scoreCountB.position.set((window.innerWidth/2)+120, window.innerHeight-10);
	
	root.addChild(rocketCountA);
	root.addChild(rocketCountB);
	root.addChild(scoreCountA);
	root.addChild(scoreCountB);
	root.addChild(help);
	root.addChild(credits);
	root.addChild(win);
	root.addChild(lose);
	
	rocketA.counter = rocketCountA;
	rocketB.counter = rocketCountB;
	rocketC.counter = null;
	
	rocketA.autopilot_target = null;
	rocketB.autopilot_target = targetB;
	rocketC.autopilot_target = rocketA;
	
	rocketA.boom = boomA;
	rocketB.boom = boomB;
	rocketC.boom = Object();
	rocketA.activeboom = null;
	rocketB.activeboom = null;
	rocketC.activeboom = null;
	
	rocketA.splat = splatA;
	rocketB.splat = splatB;
	rocketC.splat = splatC;
	
	rocketA.scorecount = scoreCountA;
	rocketB.scorecount = scoreCountB;
	rocketC.scorecount = Object();
	
	addTrail(rocketA);
	addTrail(rocketB);
	addTrail(rocketC);
	
	menuMusic.play();
	menuMusic.fadeIn(3);

	//Tell the `renderer` to `render` the `stage`
	gameLoop();
	
}

function switchToGameMusic(){
	stopMusic(menuMusic);
	stopMusic(creditsMusic);
	stopMusic(winMusic);
	stopMusic(loseMusic);
	startMusic(gameMusic);
}

function switchToMenuMusic(){
	stopMusic(gameMusic);
	stopMusic(creditsMusic);
	stopMusic(winMusic);
	stopMusic(loseMusic);
	startMusic(menuMusic);
}

function switchToCreditsMusic(){
	stopMusic(gameMusic);
	stopMusic(menuMusic);
	stopMusic(winMusic);
	stopMusic(loseMusic);
	startMusic(creditsMusic);
}
function switchToWinMusic(){
	stopMusic(gameMusic);
	stopMusic(menuMusic);
	stopMusic(creditsMusic);
	stopMusic(loseMusic);
	if(!winMusic.playing){
		winMusic.playFrom(1.5);
		winMusic.fadeIn(1);
	}
}
function switchToLoseMusic(){
	stopMusic(gameMusic);
	stopMusic(menuMusic);
	stopMusic(winMusic);
	stopMusic(creditsMusic);
	startMusic(loseMusic);
}

function stopMusic(m){
	if(m.playing){
		m.fadeOut(1);
		setTimeout(function(){m.pause();}, 1000);
	}
}

function startMusic(m){
	if(!m.playing){
		m.play();
		m.fadeIn(1);
	}
}

function addTrail(r){
	
	r.trail = Array();
	r.trailIndex = 0;
	r.trailSkip = 0;
	
	for(var i=0; i<10; i++){
		var circle = new Graphics();
		circle.beginFill(r.color);
		circle.drawCircle(0, 0, 2);
		circle.endFill();
		circle.x = 0;
		circle.y = 0;
		circle.alpha = 0;
		root.addChild(circle);
		r.trail.push(circle);
	}
}

var stateFunc = idle;

function gameLoop(){

	//Loop this function 60 times per second
	requestAnimationFrame(gameLoop);

	stateFunc();

	//Render the stage
	renderer.render(root);
}


function rocketFlight() {
	//Move the rocket 1 pixel per frame
	
	if(keyUp.isDown){
		accelerate(rocketA);
	}
	if(keyRight.isDown){
		steerRight(rocketA);
	}
	if(keyLeft.isDown){
		steerLeft(rocketA);
	}
	if(keyDown.isDown){
		decelerate(rocketA);
	}
	
	moveRocket(rocketA);
	moveRocket(rocketB);
	moveRocket(rocketC);
	
}

function getRocketBack(r){
	dx = r.height / 2 * Math.cos(r.angle);
	dy = r.height / 2 * Math.sin(r.angle);
	
	retval = Object();
	retval.x = r.x - dx;
	retval.y = r.y - dy;
	return retval;
}

function moveRocket(r){
	r.x += Math.cos(r.angle) * r.velocity;
	r.y += Math.sin(r.angle) * r.velocity;
	r.rotation = fixRotation(r.angle);
	
	back = getRocketBack(r);
	
	if(r.trail && r.trailSkip > 3){
		r.trail[r.trailIndex].x = back.x;
		r.trail[r.trailIndex].y = back.y;
		r.trailIndex++;
		r.trailIndex %= 10;
		r.trailSkip = 0;
		
		for(var i=0; i<r.trail.length; i++){
			let idx = (r.trailIndex+i)%r.trail.length;
			r.trail[idx].alpha = (i*0.1);
		}
		
	} else {
		r.trailSkip++;
	}
}

function steerRight(r){
	r.angle += 0.06;
	if(r.angle > 2*Math.PI){
		r.angle -= (2*Math.PI);
	}
}

function steerLeft(r){
	r.angle -= 0.06;
	if(r.angle < 0){
		r.angle += (2*Math.PI);
	}
}

function accelerate(r){
	r.velocity = Math.min(max_velocity, r.velocity+1);
}

function decelerate(r){
	r.velocity = Math.max(0, r.velocity-1);
}

function resetRocket(r){
	r.position.set(r.initX, r.initY);
	r.angle = 3*Math.PI/2;
	r.velocity = 5;
	
	if(r.counter != null){
		r.counter.counter++;
		r.counter.text = r.counter.counter;
	}
}

function resetTarget(t){
	t.position.set(t.initX, t.initY);
}

function getVelocity(dx, dy){
	return Math.sqrt(dx*dx + dy*dy);
}

function fixRotation(r){
	r += (Math.PI/2);
	
	if(r > (2*Math.PI)){
		r -= (2*Math.PI);
	}
	
	return r;
}

function getRotation(dx, dy){
	
	let s = Math.sqrt(dx*dx + dy*dy);
	
	let rotation = Math.acos(dx/s);
	
	if(dy < 0){
		rotation = (2*Math.PI) - rotation;
	}
	
	rotation += (Math.PI/2);
	
	if(rotation > (2*Math.PI)){
		rotation -= (2*Math.PI);
	}
	
	return rotation;
}


function runGame(){
	collisions();
	
	autopilots();
	
	rocketFlight();
	
	explosions();
	
	checkWin();
	
	commentCooldown -= 1;
	
}

function explosions(){
	
	var to_remove = Array();
	for(var i=0; i<animatronix.length; i++){
		if(!explode(animatronix[i])){
			to_remove.push(i);
		}
	}
	
	for(var i=0; i<to_remove.length; i++){
		let removed = animatronix.splice(to_remove[i], to_remove[i]);
		for(var j=0; j<removed.length; j++){
			root.removeChild(removed[j]);
		}
	}
}

function explode(b){
	if(b != null){
		if(b.alpha > 0){
			b.alpha -= 0.01;
			b.scale.x += 0.02;
			b.scale.y += 0.02;
			b.rotation = Math.random()*Math.PI*2;
			return true;
		} else {
			b.scale.x = 1;
			b.scale.y = 1;
			b.alpha = 1;
			b.visible = false;
			return false;
		}
	}
	return false;
}

function launchComment(c, force=false){
	if(force || ((commentCooldown < 0) && (Math.random() < 0.5))){
		setTimeout(function(){
			c.play();
		}, 400);
		commentCooldown = commentCooldownDefault;
	}
}

function collisions(){
	// rocket collision
	if(checkRocketCollision(rocketA, rocketC)){
		//nothing
		explosionSound();
		launchComment(choose(commentsBad));
	}
	if(checkRocketCollision(rocketB, rocketC)){
		//nothing
		explosionSound();
	}
	
	if(checkRocketCollision(rocketA, rocketB)){
		scoreCountA.counter = 0;
		scoreCountB.counter = 0;
		updateScore(scoreCountA);
		updateScore(scoreCountB);
		explosionSound();
	}
	
	if(checkTargetCollision(rocketA, targetA)){
		//nothing
		jumpSound();
		launchComment(choose(commentsGood));
	}
	
	if(checkOutsideBoundary(rocketA)){
		//nothing
		//explosionSound();
		sounds["sound/poof.mp3"].play();
 		launchComment(choose(commentsBad));

	}
	
	// rocket b
	if(checkTargetCollision(rocketB, targetB)){
		//nothing
		jumpSound();
	}
	
	if(checkOutsideBoundary(rocketB)){
		//nothing
		//explosionSound();
		sounds["sound/poof.mp3"].play();
	}
}

function checkOutsideBoundary(r){
	if(isOutsideBoundary(r) && r.respects_boundary){
		
		let splat = r.splat;
		let sprite = new Sprite(splat);
		sprite.anchor.set(0.5,0.5);
		root.addChild(sprite);
		
		sprite.position.set(r.x, r.y);
		
		animatronix.push(sprite);
		
		resetRocket(r);
		return true;
	}
	return false;
}


function checkTargetCollision(r, t){
	if(hitTestPointRectangle(r, t)){
		let boom = choose(r.boom);
		let sprite = new Sprite(boom);
		sprite.anchor.set(0.5,0.5);
		root.addChild(sprite);
		
		sprite.position.set(r.x, r.y);
		
		
		animatronix.push(sprite);
		
		r.scorecount.counter++;
		updateScore(r.scorecount);
		
		resetRocket(r);
		relocateTarget(t);
		return true;
	}
	return false;
}

function checkRocketCollision(r1, r2){
	if(hitTestPointRectangle(r1, r2)){
		let splat1 = r1.splat;
		let splat2 = r2.splat;
		let sprite1 = new Sprite(splat1);
		let sprite2 = new Sprite(splat2);
		
		sprite1.anchor.set(0.5,0.5);
		sprite2.anchor.set(0.5,0.5);
		
		root.addChild(sprite1, sprite2);
		
		sprite1.position.set(r1.x, r1.y);
		sprite2.position.set(r2.x, r2.y);
		
		animatronix.push(sprite1, sprite2);
		
		resetRocket(r1);
		resetRocket(r2);
		return true;
	}
	return false;
}

function autopilots(){
	if(rocketA.autopilot_target){
		autopilot(rocketA, rocketA.autopilot_target);
	}
	if(rocketB.autopilot_target){
		autopilot(rocketB, rocketB.autopilot_target);
	}
	if(rocketC.autopilot_target){
		autopilot(rocketC, rocketC.autopilot_target);
	}
}

function checkWin(){
	if(scoreCountA.counter > 10){
		win.visible = true;
		for(var i=0; i<20; i++){
			placeRandomFireworks();
		}
		stateFunc = finishAnimations;
		launchComment(choose(commentsGood), true);
		switchToWinMusic();
	}
	if(scoreCountB.counter > 10){
		lose.visible = true;
		stateFunc = finishAnimations;
		launchComment(choose(commentsBad), true);
		switchToLoseMusic();
	}
}

function updateScore(s){
	s.text = s.counter;
}

function placeRandomFireworks(){
	x = 300 + Math.random()*(window.innerWidth-300);
	y = 300 + Math.random()*(window.innerHeight-300);
	
	let boom = choose(rocketA.boom);
	let sprite = new Sprite(boom);
	sprite.anchor.set(0.5,0.5);
	root.addChild(sprite);
		
	sprite.position.set(x, y);
		
		
	animatronix.push(sprite);
	
}

function idle(){}

function finishAnimations(){
	explosions();
	
	if(animatronix.length < 1){
		stateFunc = idle;
	}
}

function restart(){
	if(!(win.visible || lose.visible)){
		return;
	}
	
	scoreCountA.counter = 0;
	scoreCountA.text = scoreCountA.counter;
	scoreCountB.counter = 0;
	scoreCountB.text = scoreCountB.counter;
	
	resetRocket(rocketA);
	resetRocket(rocketB);
	resetRocket(rocketC);
	
	rocketCountA.counter = 0;
	rocketCountA.text = rocketCountA.counter;
	rocketCountB.counter = 0;
	rocketCountB.text = rocketCountB.counter;
	
	
	resetTarget(targetA);
	resetTarget(targetB);
	
	stateFunc = idle;
	
	win.visible = false;
	lose.visible = false;
	help.visible = true;
	switchToMenuMusic();
}

function relocateTarget(t){
	t.x = 300 + Math.random()*(window.innerWidth-350)
	t.y = 50 + Math.random()*(window.innerHeight-350)
}

function autopilot(r, t){
	dx = t.x - r.x;
	dy = t.y - r.y;
	
	if(autopilot_ticks <= 0){
		autopilot_ticks = 0;
		if(dx == 0){
			// nothing
		} else {
			let beta = Math.atan(dy / dx);
			
			if (beta < 0){
				beta += 2*Math.PI;
			}
			
			if(r.x > t.x){
				beta += Math.PI;
				if(beta > 2*Math.PI){
					beta -= 2*Math.PI;
				}
			}
			var correct_direction = "";
			var pos = "";
			
			if(Math.abs(beta-r.angle) < 0.1){
				correct_direction = "straight";
			} else {
			
				if(r.y > t.y){
					//beta += Math.PI;
					pos = "r.y > t.y";
					
					if( ( (beta-Math.PI) < r.angle ) && ( r.angle < beta ) ){
						var correct_direction = "right";
					} else {
						var correct_direction = "left";
					}
				} else {
					pos = "r.y < t.y";
					if( ( beta < r.angle ) && ( r.angle < (beta + Math.PI) ) ){
						var correct_direction = "left";
					} else {
						var correct_direction = "right";
					}
				}
			}
			
			let random = Math.random();
			
			if(random < 0.8){
				if(correct_direction === "left" || correct_direction === "straight"){
					steerLeft(r);
				} else if(correct_direction === "right"){
					steerRight(r);
				}
			} else if (random < 0.95) {
				if(correct_direction === "right"){
					steerLeft(r);
				}  else if(correct_direction === "left" || correct_direction === "straight") {
					steerRight(r);
				}
				
			} else {
				// nothing
			}
		}
		
	}
	autopilot_ticks--;
	
}


function isOutsideBoundary(r){
	if(r.x < (boundary.left)) return true;
	if(r.y < (boundary.top)) return true;
	if(r.x > (boundary.right)) return true;
	if(r.y > (boundary.bottom)) return true;
	return false;
}

function keyboard(keyCode) {
	var key = {};
	key.code = keyCode;
	key.isDown = false;
	key.isUp = true;
	key.press = undefined;
	key.release = undefined;
	//The `downHandler`
	key.downHandler = function(event) {
	if (event.keyCode === key.code) {
		if (key.isUp && key.press) key.press();
			key.isDown = true;
			key.isUp = false;
		}
		if(event.keyCode > 36 && event.keyCode < 41){
			event.preventDefault();
		}
	};

	//The `upHandler`
	key.upHandler = function(event) {
		if (event.keyCode === key.code) {
			if (key.isDown && key.release) key.release();
			key.isDown = false;
			key.isUp = true;
		}
		if(event.keyCode > 36 && event.keyCode < 41){
			event.preventDefault();
		}
	};
	//Attach event listeners
	window.addEventListener(
		"keydown", key.downHandler.bind(key), false
	);
	window.addEventListener(
		"keyup", key.upHandler.bind(key), false
	);
	return key;
}

function hitTestRectangle(r1, r2) {

	//Define the variables we'll need to calculate
	var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

	//hit will determine whether there's a collision
	hit = false;

	//Find the center points of each sprite
	r1.centerX = r1.x + r1.width / 2;
	r1.centerY = r1.y + r1.height / 2;
	r2.centerX = r2.x + r2.width / 2;
	r2.centerY = r2.y + r2.height / 2;

	//Find the half-widths and half-heights of each sprite
	r1.halfWidth = r1.width / 2;
	r1.halfHeight = r1.height / 2;
	r2.halfWidth = r2.width / 2;
	r2.halfHeight = r2.height / 2;

	//Calculate the distance vector between the sprites
	vx = r1.centerX - r2.centerX;
	vy = r1.centerY - r2.centerY;

	//Figure out the combined half-widths and half-heights
	combinedHalfWidths = r1.halfWidth + r2.halfWidth;
	combinedHalfHeights = r1.halfHeight + r2.halfHeight;

	//Check for a collision on the x axis
	if (Math.abs(vx) < combinedHalfWidths) {

		//A collision might be occuring. Check for a collision on the y axis
		if (Math.abs(vy) < combinedHalfHeights) {

			//There's definitely a collision happening
			hit = true;
		} else {

			//There's no collision on the y axis
			hit = false;
		}
	} else {

		//There's no collision on the x axis
		hit = false;
	}

	//`hit` will be either `true` or `false`
	return hit;
};

function hitTestPointRectangle(r1, r2) {

	//Define the variables we'll need to calculate
	var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

	//hit will determine whether there's a collision
	hit = false;

	//Find the center points of each sprite
	r1.centerX = r1.x;
	r1.centerY = r1.y;
	r2.centerX = r2.x;
	r2.centerY = r2.y;

	//Calculate the distance vector between the sprites
	vx = r1.centerX - r2.centerX;
	vy = r1.centerY - r2.centerY;

	//Check for a collision on the x axis
	if (Math.abs(vx) < 20) {

		//A collision might be occuring. Check for a collision on the y axis
		if (Math.abs(vy) < 20) {

			//There's definitely a collision happening
			hit = true;
		} else {

			//There's no collision on the y axis
			hit = false;
		}
	} else {

		//There's no collision on the x axis
		hit = false;
	}

	//`hit` will be either `true` or `false`
	return hit;
};

function explosionSound() {
  soundEffect(
    16,          //frequency
    0,           //attack
    1,           //decay
    "sawtooth",  //waveform
    1,           //volume
    0,           //pan
    0,           //wait before playing
    0,           //pitch bend amount
    false,       //reverse
    0,           //random pitch range
    50,          //dissonance
    undefined,   //echo array: [delay, feedback, filter]
    undefined    //reverb array: [duration, decay, reverse?]
  );
}
function asdfjiadfadsf(){
	if(window.location.hash == "#hype"){
		rocketA.texture = loader.resources["images/boom03.png"].texture;
	}
};

function shootSound() {
  soundEffect(
    1046.5,           //frequency
    0,                //attack
    0.3,              //decay
    "sawtooth",       //waveform
    1,                //Volume
    -0.8,             //pan
    0,                //wait before playing
    1200,             //pitch bend amount
    false,            //reverse bend
    0,                //random pitch range
    25,               //dissonance
    [0.2, 0.2, 2000], //echo array: [delay, feedback, filter]
    undefined         //reverb array: [duration, decay, reverse?]
  );
}

function jumpSound() {
  soundEffect(
    523.25,       //frequency
    0.05,         //attack
    0.2,          //decay
    "sine",       //waveform
    3,            //volume
    0.8,          //pan
    0,            //wait before playing
    600,          //pitch bend amount
    true,         //reverse
    100,          //random pitch range
    0,            //dissonance
    undefined,    //echo array: [delay, feedback, filter]
    undefined     //reverb array: [duration, decay, reverse?]
  );
}

function choose(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}