//Copyright Paul Viau (Viau Computer Solutions) 2014
/*
List of things to implement:
- Multiplayer!
- Deactivate non letter keys
- Backspace opens options (music on/off | sounds on/off | music volume | sound volume)
- Load client's own songs
- Add in share score to Facebook (I got to level X and a score of X.. on Fury Typing think you can do better?)
- Choose dictionary language? or different styled dictionaries

SplashScreen:
- Title (Leaderboard displayed (Daily, Weekly, All Time buttons), Multi player defaulted, Difficulty buttons displayed)
- Single Player/Multi-player
	Single Player
		Game Mode (Standard/Endless)
			Standard
				Choose Level or difficulty
					Easy levelTimer = 10 sec
					Normal levelTimer = 5 sec
					Hard levelTimer = 2.5 sec
					Expert levelTimer = .5 sec
			Endless (Start at level 0 and have infinite levels?)
	Multi-player
- Options
	Settings
		Sound volume slider
		Music volume slider
	How to Play & Controls
		Button list and how to play
			Controls:
				Spacebar sends opponent word bomb
				Backspace pauses or resumes music (working)
			How to Play:
				Cannot have more mistakes than letters typed.
				A word consists of 5 letters
		Credits	
			Sounds provided by http://www.freesound.org
			Dictionary provided by Public domain word list enable1.txt
			Thanks to my family and friends for supporting me. Yves and Scott for your feedback and bouncing ideas off you all the time =).
		About Developer
			Game is always in Beta (allows me to make unannounced changes =))
			This is the first game that I have ever made. I know the coding isn't perfect but it is all new to me.
- Share on FB

*/

var	canvas = document.getElementById("canvas_id"),
	ctx = canvas.getContext("2d"),
	localPlayer,	// Local player (Not used yet)
	remotePlayers,	// Remote players (Not used yet)
	socket,		// Socket connection
	gameover = false,
	backgroundColor = "lightblue",
	letters,
	currentWord,
	wordQueue = new Array(),
	timerWordQueue,
	level = 1,
	levelTimer = 2500, //divide by 1000 to get actual English seconds
	levelCount = 0,
	combo = 0,
	maxCombo = 0,
	score = 0,
	letterIndex = 0,
	scoreMultiplier = 1,
	wpmErr = 0,
	wpmCount = 0,
	wpmGross = 0,
	letterCount = 0,
	wpmAccuracy = 0,
	bgmusicStatus = false,
	audio,
	bgmusic = new Audio('./sounds/bg.mp3'),		//background music selection
	count = 0,									//used for game timer
	scs = 0,									//set game timer seconds
	mns = 2,									//set game timer minutes
	totalSecs = mns * 60 + scs,
    current = count;
var Player = function () {
	"use strict";
	var	id;
};

function getNetWPM() {
	"use strict";
	var secondsLeft = totalSecs - count,
		cpm = Math.floor(letterCount / secondsLeft * 60),
		wpm = Math.round(cpm / 5);
	return wpm;
}
function displayWPM() {
	"use strict";
	var currentWPM = getNetWPM();
	ctx.beginPath();
	ctx.clearRect(8, canvas.height - 124, 110, 25); //clear wpm
	ctx.fillStyle = "#F7CBA0";
	ctx.rect(8, canvas.height - 124, 110, 25); //brown bg
	ctx.fill();
	ctx.closePath();
	ctx.beginPath();
	ctx.stroke();
	ctx.font = '16pt verdana bold';
	ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
	ctx.fillText("WPM: " + currentWPM, 10, canvas.height - 104);
	ctx.closePath();
}
function displayLevel() {
	"use strict";
	var currentWPM = getNetWPM(),
		levelLength = level.toString();
	ctx.beginPath();
	ctx.clearRect(canvas.width / 2 - 126 - (levelLength.length * 25), canvas.height - 125, 72 + (levelLength.length * 25), 25); //clear level text
	ctx.fillStyle = "#F7CBA0";
	ctx.rect(canvas.width / 2 - 126 - (levelLength.length * 25), canvas.height - 125, 72 + (levelLength.length * 25), 25); //brown bg
	ctx.fill();
	ctx.closePath();
	ctx.beginPath();
	ctx.stroke();
	ctx.font = '16pt verdana bold';
	ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
	ctx.fillText("LVL: " + level, canvas.width / 2 - 100 - (levelLength.length * 25), canvas.height - 104);
	ctx.closePath();
}
//Game Timer----------------->

count += (mns * 60) + scs;
function timerPadding(n) {
    "use strict";
	return n < 10 ? '0' + n : n;
}
function showTimer() {
	"use strict";
	scs = count % 60;
	mns = Math.floor(count / 60);
    if (scs >= 0 || mns >= 0) {
		var timerX = canvas.width / 2 - 30;
		ctx.beginPath();
		ctx.clearRect(timerX, 10, 65, 30); //clear timer
		ctx.fillStyle = "black";
		ctx.fillRect(timerX - 20, 5, 100, 40);
		ctx.font = '20pt verdana bold';
		ctx.fillStyle = 'lightgreen';
		wpmGross = (letterCount / 5) / (totalSecs / 60);
		ctx.fillText(timerPadding(mns) + ":" + timerPadding(scs), timerX - 15, 35); //show timer
		if (gameover === false) {
			displayWPM();
			displayLevel();
		}
	}
}
function timer() {
    "use strict";
	showTimer();
    if (count > 0) {
		count -= 1;
        setTimeout(timer, 1000);
	}
	if (count === 0 && gameover === false) {
		displayStats();
		gameover = true;
	}
}

if (current <= 0) {
	timer();
} else {
	showTimer();
}

//<-----------------Game Timer

canvas.width = 1024;//window.innerWidth; //Canvas Size
canvas.height = 600;//window.innerHeight; //Canvas Size
bgmusic.loop = true;
bgmusic.volume = 0.10;
//bgmusic.play();			//If uncommented would enable music on start

var splashScreen = function () {
	"use strict";
};
var displayStats = function () {
	"use strict";
	//ctx.clearRect(8, 60, canvas.width/2-61, canvas.height-160); //clear game area
	wpmGross = (letterCount / 5) / (totalSecs / 60);
	if (letterCount > 0) {
		wpmAccuracy = Math.round((letterCount - wpmErr) / letterCount * 100);
	}
	var x = canvas.width * 0.13,
		y = canvas.height * 0.27,
		spacing = 40;
	ctx.beginPath();
	ctx.fillStyle = "white"; //"rgba(247, 203, 160, 1)";
	ctx.fillRect(x - 60, y - 90, x + 200, y + spacing * 6); //score bg

	ctx.beginPath();
	ctx.fillStyle = "black"; //"rgba(247, 203, 160, 1)";
	ctx.fillRect(x - 50, y - 100, x + 180, y + spacing * 6 + 20); //score bg
	ctx.beginPath();
	ctx.lineWidth = 10;
	ctx.strokeStyle = 'white';
	ctx.rect(x - 50, y - 100, x + 180, y + spacing * 6 + 20); //score border
	ctx.stroke();
	ctx.beginPath();
	ctx.font = '20pt Calibri';
	ctx.fillStyle = 'white';
	ctx.fillText('     Game Over', x, y - 50);
	ctx.font = '18pt Calibri';
	ctx.fillText('Score: ' + score, x, y);
	ctx.fillText('Max Combo: ' + maxCombo, x, y + spacing);
	ctx.fillText('WPM: ' + wpmGross, x, y + spacing * 2);
	ctx.fillText('Errors: ' + wpmErr, x, y + spacing * 3);
	ctx.fillText('Words typed: ' + letterCount / 5, x, y + spacing * 4);
	ctx.fillText('Letters typed: ' + letterCount, x, y + spacing * 5);
	ctx.fillText('Accuracy: ' + wpmAccuracy + '%', x, y + spacing * 6);
	ctx.fillText('Level Reached: ' + level, x, y + spacing * 7);
};

var modifyWordQueue = function () {
	"use strict";
	if (gameover === false) {
		currentWord = chooseWord();
		wordQueue[wordQueue.length] = currentWord;
	}
};

var startWordQueueTimer = function () {
	"use strict";
	timerWordQueue = setInterval(function () {
		if (gameover === false) {
			modifyWordQueue();
			displayGameWords();
		}
	}, levelTimer);
};
var displayWord = function () {
	"use strict";
	var typeThisWord = wordQueue[0];
	letters = new Array();
	for (var i=0; i < typeThisWord.length; i++){ //create an array with the word letters
		letters.push(typeThisWord[i]);
		}
	ctx.clearRect(8, canvas.height-92, canvas.width*0.5-11, 50); //clear word
	for (i=0;i < typeThisWord.length; i++){ //draw a box for each letter
		ctx.beginPath();
		ctx.fillStyle="#F7CBA0";
		ctx.rect((canvas.width*0.25-(letters.length*20))+i*40, canvas.height-85, 37, 37);//box around letter
		ctx.lineWidth = 2;
		ctx.strokeStyle = 'black';
		ctx.stroke();
		ctx.fill();
		ctx.beginPath();
		ctx.font = '20pt Calibri bold';
		ctx.fillStyle="black";
		ctx.fillText(letters[i], (canvas.width*.25-(letters.length*20)+10)+i*40, canvas.height-57);// display letters in boxes
		ctx.fill();
	};
};

var initialize = function(){
	document.body.style.background = backgroundColor;
	ctx.clearRect(0,0,canvas.width,canvas.height); //clear screen
	ctx.font = '20pt Calibri';
	// Draw border
	ctx.beginPath();
	ctx.rect(5, 45, canvas.width-40, canvas.height-80); //entire border
	ctx.rect(5, canvas.height-95, canvas.width-40, 60); //play field at bottom
	ctx.rect(canvas.width/2-50, 45, 100, canvas.height-140); //queue in middle
	ctx.moveTo(canvas.width/2,45);
	ctx.lineTo(canvas.width/2,canvas.height-35); //line in middle
	ctx.stroke();
	ctx.rect(5, 5, canvas.width-40, 40); //top score
	ctx.lineWidth = 3;
	ctx.strokeStyle = 'black';
	ctx.stroke();
	updateScore();
	showTimer();
	startWordQueueTimer();
	modifyWordQueue();
	displayWord();
	displayGameWords();
	// Initialize the local player
	localPlayer = new Player();
	// Initialize socket connection
	socket = io.connect("http://paul-pc", {port: 8000, transports: ["websocket"]});
	// Initialize remote players array
	remotePlayers = [];
	};
	
var setEventHandlers = function() {
	window.addEventListener("keyup", onKeyUp, false);

	// Window resize
	//window.addEventListener("resize", onResize, false);
	
	/*// Socket connection successful
	socket.on("connect", onSocketConnected);

	// Socket disconnection
	socket.on("disconnect", onSocketDisconnect);

	// New player message received
	socket.on("new player", onNewPlayer);

	// Player move message received
	socket.on("move player", onMovePlayer);

	// Player removed message received
	socket.on("remove player", onRemovePlayer);*/
};	
	
var updateScore = function(){
	ctx.clearRect(10,10,400,30);
	ctx.font = '20pt Calibri';
	ctx.fillStyle='black';
	ctx.fillText('x'+scoreMultiplier, 15, 35); //Display Score Multiplier
	ctx.fillText('Combo: '+combo, 50, 35); //Display combo
	ctx.font = '25pt Calibri';
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'black';
	ctx.strokeText('Score: '+score, 200, 35); //Display Score
	ctx.stroke();
};

/*function onResize(e) {
	// Maximize the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	initialize();
};*/

var onKeyUp = function (e){
	if (e.keyCode === 8){
		if(bgmusicStatus === true){
			bgmusic.pause();
			bgmusicStatus = false;
			}
		else{
			bgmusic.play();
			bgmusicStatus = true;
		};
	}
	else if (e.keyCode === letters[letterIndex].charCodeAt(letters[letterIndex]) && gameover === false){ 			//if the keyboard letter matches the next letter in the word
		if (letterIndex < letters.length){
			ctx.beginPath();
			ctx.rect((canvas.width*.25-(letters.length*20))+letterIndex*40, canvas.height-85, 37, 37);//box around letter
			ctx.lineWidth = 2;
			ctx.strokeStyle = backgroundColor;
			ctx.stroke();
			ctx.beginPath();
			ctx.fillStyle="red";
			ctx.font = '20pt Calibri bold';
			ctx.fillText(letters[letterIndex], (canvas.width*.25-(letters.length*20)+10)+letterIndex*40, canvas.height-60);// display colored letters in boxes
			score = score + 1 * scoreMultiplier;
			letterCount++
			updateScore();
			audio = new Audio('./sounds/type.mp3');
			audio.volume = 0.25;
			audio.play();
			letterIndex++;
			};
		if (letterIndex === letters.length){			//if you've typed all the letters in the word, start a new word
			audio = new Audio('./sounds/nice.mp3');
			audio.play();
			levelCount++;
			if (levelCount === 10 && level != 10){
				level++;
				levelCount = 0;
				levelTimer = levelTimer * 0.75;
				};
			combo++;	
			if (combo > maxCombo){
				maxCombo++;
				};
			if (combo/4 === 1 || combo/4 === 2 || combo/4 === 3){
				scoreMultiplier++;
				};
			if (combo > 0){
				score = score + letters.length;
				};
		wordQueue.shift();
			if (wordQueue.length === 0){
				clearInterval(timerWordQueue);
				startWordQueueTimer();
				modifyWordQueue();
				displayGameWords();
				};
		displayWord();
		displayGameWords();
		letterIndex = 0;	
		};
	}
	else {			//if you've typed an error
	if (gameover === false){
	if (letterCount > wpmErr){
		wpmErr++;
		}
	combo = 0;
	audio = new Audio('./sounds/err.mp3');
	audio.play();
	scoreMultiplier = 1;
	}
	}
	updateScore();
};


var displayGameWords = function(){
	if (gameover === false){
		if (wordQueue.length === 16){
			count = 0;
			gameover = true;
			displayStats();
			}
	else{
		ctx.clearRect(7, 60, canvas.width/2-59, canvas.height-160); //clear game area
		var y = 527
		for (i = 0;i < wordQueue.length;i++){
			y -= 30.5;
			ctx.beginPath();
			ctx.fillStyle="#F7CBA0";
			ctx.lineWidth = 1;
			ctx.rect(8, y-23, 451, 29);	//box around word
			ctx.stroke();
			ctx.fill();
			ctx.beginPath();
			ctx.font = '18pt Calibri';
			ctx.fillStyle='black';
			ctx.fillText(wordQueue[i], canvas.width*0.25-100,y);
			displayLevel();
			displayWPM();
			}
		}
		}
};	

setEventHandlers();
initialize();

window.onkeydown = function(e) { 
  return !(e.keyCode < 69 || e.keyCode > 90);
};