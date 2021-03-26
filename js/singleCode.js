//Copyright Paul Viau (Viau Computer Solutions) 2014
/*
New Ideas
- Easy mode adjust word length and adjust timer.
- Normal adjust word length and adjust timer.
- Expert adjust word length and adjust timer.
- Game mode to add time to timer when clearing word?
- On titleScreen put How to Play
- Scaling display
- Game mode: learning (with scalable difficulty)

Easy word length between 2-6. Normal word length between 4-10. Expert between 6-14 

List of things to implement:
- Multiplayer!
- Deactivate non letter keys
- Escape opens options (music on/off | sounds on/off | music volume | sound volume)
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
	leftSide = canvas.width * .75,
	rightSide = 785,
	gameLettersY = 525,
	localPlayer,	// Local player (Not used yet)
	remotePlayers,	// Remote players (Not used yet)
	socket,		// Socket connection
	gameover = true,
	backgroundColor = "lightblue",
	gameBgColor = "green",
	letters,
	currentWord,
	wordQueue = new Array(),
	timerWordQueue,
	linesCleared = 0,
	level = 1,
	difficulty = "", 
	levelTimer = 2500, //divide by 1000 to get actual English seconds
	levelCount = 0,
	combo = 0,
	maxCombo = 0,
	score = 0,
	highscore = localStorage.getItem("highscore"),
	letterIndex = 0,
	scoreMultiplier = 1,
	wpmErr = 0,
	wpmCount = 0,
	wpmGross = 0,
	letterCount = 0,
	wpmAccuracy = 0,
	wordMaxLength,
	statsTimer,
	/*statsCount = 0,*/
	gameIsPause = false,
	onGameOptionsMenu = false,
	onTitleScreen = true,
	onGameOverScreen = false,
	oncountdownToStartScreen = false,
	bgmusicStatus = false,
	clockSound = document.createElement("audio"),
	audio = document.createElement("audio"),
	countdown = document.createElement("audio"),
	bgmusic = new Audio('./sounds/bg.mp3'),		//background music selection
	count = 0,									//used for game timer
	scs = 0,									//set game timer seconds
	mns = 2,									//set game timer minutes
	totalSecs = mns * 60 + scs,
	current = count;

if (countdown != null && countdown.canPlayType && countdown.canPlayType("audio/mp3")) {
	countdown.preload = "metadata";
	countdown.src = "./sounds/countdown.mp3";
}

var Player = function () {
	"use strict";
	var	id;
};

function displayHighScores()
	{
		highscore = localStorage.getItem("highscore");
		difficulty = localStorage.getItem("difficulty");
		if (difficulty == null) difficulty = "Difficulty";
		if (highscore == null) highscore = "0";
		var newText = "<b>Highest Score: </b>"+ difficulty + ": " + highscore;
		document.getElementById('HighScoreText').innerHTML = newText;
	}

function roundRect(x, y, w, h, radius, color)
{
  var r = x + w;
  var b = y + h;
  ctx.strokeStyle=color;
  ctx.lineWidth="4";
  ctx.moveTo(x+radius, y);
  ctx.lineTo(r-radius, y);
  ctx.quadraticCurveTo(r, y, r, y+radius);
  ctx.lineTo(r, y+h-radius);
  ctx.quadraticCurveTo(r, b, r-radius, b);
  ctx.lineTo(x+radius, b);
  ctx.quadraticCurveTo(x, b, x, b-radius);
  ctx.lineTo(x, y+radius);
  ctx.quadraticCurveTo(x, y, x+radius, y);
  ctx.closePath();
  ctx.stroke();
}

var titleScreen = function(){
	onTitleScreen = true;
	var clickToStartX = leftSide + 50;
	var clickToStartY = 475;
	var howToPlayX = leftSide + 80;
	var howToPlayY = 175;
	ctx.fillStyle = 'rgba(0, 0, 0, 1)';
	ctx.beginPath();
	ctx.fillRect(leftSide+5, 45, canvas.width/2+45, canvas.height-80); //black screen
	ctx.closePath();
	ctx.font = '50pt verdana bold';
	ctx.fillStyle = 'white';
	ctx.fillText("Fury Typing", leftSide+90, 120); //text
	
	ctx.font = '14pt verdana bold';
	ctx.fillStyle = 'white';
	ctx.fillText("· Type the words at the bottom as quickly and as", howToPlayX, howToPlayY); //text
	ctx.fillText("  accurately as possible.", howToPlayX, howToPlayY+20); //text
	
	ctx.fillText("· Your score will increase significantly if you do not", howToPlayX, howToPlayY+50); //text
	ctx.fillText("  make any mistakes.", howToPlayX, howToPlayY+70); //text
	
	ctx.fillText("· A combo of 4 words will give you a multiplier", howToPlayX, howToPlayY+100); //text
	ctx.fillText("  and can increase up to 4x.", howToPlayX, howToPlayY+120); //text

	ctx.fillText("· You will level up every 10 lines cleared. To a max of", howToPlayX, howToPlayY+150); //text
	ctx.fillText("  level 10. The lines will appear faster every level.", howToPlayX, howToPlayY+170); //text
	
	ctx.fillText("· Backspace will toggle background music on/off", howToPlayX, howToPlayY+220); //text
	


	ctx.font = '34pt verdana bold';
	ctx.fillStyle = 'white';
	ctx.fillText("Press Spacebar to Start", clickToStartX + 20, clickToStartY +45); //text
	ctx.beginPath();
	roundRect(clickToStartX, clickToStartY, 450, 60, 20, "green");
	ctx.closePath();
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
	ctx.fillStyle = "#F7CBA0"; //brown bg
	ctx.beginPath();
	ctx.rect(leftSide+7, canvas.height - 124, 110, 27); //clear wpm
	ctx.closePath();
	ctx.fill();
	ctx.font = '16pt verdana bold';
	ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
	ctx.fillText("WPM: " + currentWPM, leftSide+10, canvas.height - 104);
}
function displayLevel() {
	"use strict";
	var levelLength = level.toString();
	ctx.fillStyle = "#F7CBA0";
	ctx.beginPath();
	ctx.rect(rightSide - 122 -(levelLength.length * 25), canvas.height - 125, 72 + (levelLength.length * 25), 27); //brown bg
	ctx.closePath();
	ctx.fill();
	ctx.font = '16pt verdana bold';
	ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
	ctx.fillText("LVL: " + level, rightSide - 100 - (levelLength.length * 25), canvas.height - 104);
}
//Game Timer----------------->

count += (mns * 60) + scs;
var timerPercent = count/120 * 100;

function timerPadding(n) {
    "use strict";
	return n < 10 ? '0' + n : n;
}

function isOdd(num) { return num % 2;}

function showTimer() {
	"use strict";
	scs = count % 60;
	mns = Math.floor(count / 60);
    if (scs >= 0 || mns >= 0) {
		var timerX = leftSide+250;
		var timerY = gameLettersY - 20;
		timerPercent = count/120 * 100;
		ctx.fillStyle = gameBgColor;
		ctx.beginPath(); 		//timer bar with countdown and health bar
		ctx.fillRect(leftSide+6, timerY, 554, 19);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = "red";
		ctx.beginPath();
		ctx.fillRect(leftSide+6, timerY+1, 554*(timerPercent/100), 17);
		ctx.closePath();
		ctx.fill();
		if (count <= 15 && isOdd(count) === 1){
			ctx.fillStyle = "rgba(230, 230, 250, 0.5)"
			ctx.beginPath();
			ctx.fillRect(leftSide+6, timerY+1, 554, 17);
			ctx.closePath();
			ctx.fill();
		}
		ctx.font = '14pt verdana bold';
		ctx.fillStyle = "white";//'lightgreen';
		wpmGross = (letterCount / 5) / (totalSecs / 60);
		ctx.fillText(timerPadding(mns) + ":" + timerPadding(scs), timerX, timerY+16); //show timer
		if (gameover === false) {
			displayWPM();
			displayLevel();
		}
	}
}
function timer() {
    "use strict";
    if (count > 0) {
		count -= 1;
		showTimer();
        setTimeout(timer, 1000);
	}
	if (count === 15) {
		if (clockSound.muted == false){
			clockSound.src = './sounds/clock.mp3';
			clockSound.volume = 0.75;
			clockSound.play();
		}
	}
	else if (count === 0 && gameover === false) {
		if (audio.muted == false){
			audio = new Audio('./sounds/game_over.mp3');
			audio.volume = 1;
			audio.play();
		}
		gameover = true;		
		displayStats();
	}
}

function startTimer(){
	if (current <= 0) {
		timer();
	} 
	else {
	showTimer();
	}
}
//<-----------------Game Timer

canvas.width = 1024;//window.innerWidth; //Canvas Size
canvas.height = 600;//window.innerHeight; //Canvas Size
bgmusic.loop = true;
if (bgmusic.muted == false)
bgmusic.volume = 0.10;
//bgmusic.play();			//If uncommented would enable music on start

var displayStats = function () {
	"use strict";
	onGameOverScreen = true;
	document.getElementById("SelectDifficulty").disabled=false;
	wpmGross = (letterCount / 5) / (totalSecs / 60);
	if (letterCount > 0) {
		wpmAccuracy = Math.round((letterCount - wpmErr) / letterCount * 100);
	}
	var x = leftSide+115,
	xText = 50,
	y = canvas.height * 0.27,
	spacing = 40;
	ctx.fillStyle = "white"; //"rgba(247, 203, 160, 1)";
	ctx.beginPath();
	ctx.fillRect(x - 60, y - 90, x + 60, y + spacing * 6); //score bg
	ctx.closePath();
	ctx.fillStyle = "black"; //"rgba(247, 203, 160, 1)";
	ctx.beginPath();
	ctx.fillRect(x - 50, y - 100, x + 40, y + spacing * 6 + 20); //score bg
	ctx.closePath();
	ctx.lineWidth = 10;
	ctx.strokeStyle = 'white';
	ctx.beginPath();
	ctx.rect(x - 50, y - 100, x + 40, y + spacing * 6 + 20); //score border
	ctx.closePath();
	ctx.stroke();
	ctx.fillStyle = 'white';
	ctx.font = '20pt Calibri';
	ctx.fillText('Game Over', x+xText+5, y - 50);
	ctx.font = '18pt Calibri';
	ctx.fillText('Score: ' + score, x+xText, y);
	ctx.fillText('Max Combo: ' + maxCombo, x+xText, y + spacing);
	ctx.fillText('Average WPM: ' + wpmGross, x+xText, y + spacing * 2);
	ctx.fillText('Errors: ' + wpmErr, x+xText, y + spacing * 3);
	ctx.fillText('Lines cleared: ' + linesCleared, x+xText, y + spacing * 4);
	ctx.fillText('Letters typed: ' + letterCount, x+xText, y + spacing * 5);
	ctx.fillText('Accuracy: ' + wpmAccuracy + '%', x+xText, y + spacing * 6);
	ctx.fillText('Level Reached: ' + level, x+xText, y + spacing * 7);
	/*    statsCount = 10,
        statsTimer = setInterval(function() {
            statsCount--;
            if(statsCount%2 === 1) {*/
				ctx.font = '16pt verdana bold';
				ctx.fillStyle = 'lightgreen';
				ctx.fillText("Press Spacebar to Play Again", x + 20, 470); //text
           /* }
            else if (statsCount >= 1 && statsCount != 1){
				ctx.fillStyle = "black";
				ctx.beginPath();
				ctx.fillRect(x + 10, 455, 265, 20); //text
				ctx.closePath();
				ctx.fill();
            }
            if(statsCount == 0) clearInterval(statsTimer);
        },1000);*/
if(highscore !== null){
   if (score > highscore) {
    localStorage.setItem("highscore", score );
	var x = document.getElementById("SelectDifficulty").value;
    localStorage.setItem("difficulty", x );
      }
}else{
	localStorage.setItem("highscore", score );
	var x = document.getElementById("SelectDifficulty").value;
    localStorage.setItem("difficulty", x );
}
displayHighScores();
};

var modifyWordQueue = function () {
	"use strict";
	if (gameover === false || oncountdownToStartScreen === true) {
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
	ctx.fillStyle = gameBgColor;
	ctx.beginPath();
	ctx.fillRect(leftSide+8, gameLettersY + 6, canvas.width*0.5-11, 38); //clear word
	ctx.closePath();
	for (i=0;i < typeThisWord.length; i++){ //draw a box for each letter
		ctx.fillStyle="#F7CBA0";
		ctx.beginPath();
		ctx.rect((leftSide+canvas.width*0.25-(letters.length*20))+i*40, gameLettersY + 7, 37, 37);//box behind letter
		ctx.closePath();
		ctx.fill();
/* 		ctx.lineWidth = 2;
		ctx.strokeStyle = 'white';
		ctx.stroke(); */
		ctx.font = '20pt Calibri bold';
		ctx.fillStyle="black";
		ctx.fillText(letters[i], (leftSide+canvas.width*.25-(letters.length*20)+10)+i*40, gameLettersY+37);// display letters in boxes
	};
};
var countdownToStart = function(){
		var count = 4,
		x = leftSide + 235,
		y = 255,
		timer = setInterval(function() {
			if(count >= 2){
				ctx.fillStyle = gameBgColor;
				ctx.beginPath();
				ctx.fillRect(x-20, y-45, 100, 50);
				ctx.closePath();
				ctx.fill();
				ctx.beginPath();
				ctx.font = '40pt Calibri';
				ctx.fillStyle='white';
				ctx.fillText(count-1, x, y); //Display Countdown number
				ctx.font = '39pt Calibri';
				ctx.lineWidth = 1;
				ctx.strokeStyle = 'black';
				ctx.strokeText(count-1, x, y); //Display  Countdown number
				ctx.stroke();
				ctx.closePath();
			}
			if(count === 2){countdown.pause();}
			if(count === 1){
				ctx.fillStyle = gameBgColor;
				ctx.beginPath();
				ctx.fillRect(x-20, y-45, 100, 50);
				ctx.closePath();
				ctx.fill();
				ctx.beginPath();
				ctx.font = '40pt Calibri';
				ctx.fillStyle='white';
				ctx.fillText("GO!",  x-10, y); //Display  Countdown GO
				ctx.font = '39pt Calibri';
				ctx.lineWidth = 1;
				ctx.strokeStyle = 'black';
				ctx.strokeText("GO!",  x-10, y); //Display  Countdown GO
				ctx.stroke();
				ctx.closePath();
				}
			if( count == 0) {
				//clearInterval(timer);
				gameover = false;
				oncountdownToStartScreen = false;
				startTimer();
				displayGameWords();
				startWordQueueTimer();
			};
							count--;
		},1000);
	}
	
var initialize = function(){
	if (audio.muted == false){	
		audio = new Audio('./sounds/2minutes.mp3');
		audio.volume = 0.75;
		audio.play();
	}
	onTitleScreen = false;
	onGameOverScreen = false;
	if (onTitleScreen == false && onGameOverScreen == false)
	document.getElementById("SelectDifficulty").disabled=true;
	ctx.beginPath();	
	ctx.clearRect(0,0,canvas.width,canvas.height); //clear screen
	ctx.closePath();
	ctx.fillStyle = gameBgColor;
	ctx.beginPath();
	ctx.fillRect(leftSide+5, 5, canvas.width/2+45, canvas.height-30); //game background color
	ctx.closePath();
	ctx.fill();
	ctx.font = '20pt Calibri';
	// Draw border
	ctx.strokeStyle = 'white';
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.rect(leftSide+5, 45, canvas.width/2+45, canvas.height-70); //entire border
	ctx.rect(leftSide+5, canvas.height-95, canvas.width/2+45, 20); //new timer bar
	ctx.moveTo(leftSide+canvas.width/2,45);
	ctx.lineTo(leftSide+canvas.width/2,canvas.height-95); //line in middle
	ctx.rect(leftSide+5, 5, canvas.width/2+45, 40); //top score
	ctx.closePath();
	ctx.stroke();
	ctx.beginPath();
	roundRect(leftSide-100, 475, 100, 100, 20, "green"); //combo and multiplier area on left
	ctx.fillStyle = gameBgColor;
	ctx.fill();
	ctx.strokeStyle = "white";
	ctx.lineWidth = 3;
	ctx.stroke();
	ctx.closePath();
	ctx.beginPath();
	ctx.arc(leftSide-50, 525, 40, 0, Math.PI*2, false); //Full-circle
	ctx.closePath();
	ctx.lineWidth = 5;
	ctx.fillStyle = 'pink';
	ctx.fill();
	ctx.strokeStyle = 'black';
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(leftSide-50, 525, 40, 0, Math.PI*0.5, false); //Quarter-circle
	ctx.lineTo(leftSide-50, 525);
	ctx.closePath();
	ctx.lineWidth = 5;
	ctx.fillStyle = 'red';
	ctx.fill();
	ctx.strokeStyle = 'black';
	ctx.stroke();
	ctx.font = '40pt Calibri';
	ctx.fillStyle='white';
	ctx.fillText('x'+scoreMultiplier, leftSide-70, 540); //Display Score Multiplier
	ctx.font = '40pt Calibri';
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'black';
	ctx.strokeText('x'+scoreMultiplier, leftSide-70, 540); //Display Score Multiplier
	ctx.stroke();
	showTimer();
	updateScore();
	oncountdownToStartScreen = true;
	modifyWordQueue();
	displayWord();
	setTimeout(function(){
		countdownToStart();
		if (countdown.muted == false)
		countdown.volume = .75;
		countdown.currentTime = 20;
		countdown.play();
		}, 800);
	setTimeout(function(){
		if (audio.muted == false){
			audio = new Audio('./sounds/go.mp3');
			audio.volume = 1;
			audio.play();
		}
	}, 4800);
	};
	
var setEventHandlers = function() {
	window.addEventListener("keyup", onKeyUp, false);

	// Window resize
	//window.addEventListener("resize", onResize, false);

};	
	
var updateScore = function(){
	ctx.font = '20pt Calibri';
	ctx.fillStyle = gameBgColor;
	ctx.beginPath();
	ctx.fillRect(leftSide+7,7,455,36); //clear score area
	ctx.closePath();
	ctx.fillText('Combo: '+combo, leftSide+50, 35); //Display combo
	ctx.font = '25pt Calibri';
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'white';
	ctx.strokeText('Score: '+score, leftSide+200, 35); //Display Score
	ctx.stroke();
};

/*function onResize(e) {
	// Maximize the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	initialize();
};*/

var showMenu = function(){
	var x = leftSide+115,
	xText = 50,
	y = canvas.height * 0.27,
	spacing = 40;
	ctx.fillStyle = "white"; //"rgba(247, 203, 160, 1)";
	ctx.beginPath();
	ctx.fillRect(x - 60, y - 90, x + 60, y + spacing * 6); //score bg
	ctx.closePath();
	ctx.fillStyle = "black"; //"rgba(247, 203, 160, 1)";
	ctx.beginPath();
	ctx.fillRect(x - 50, y - 100, x + 40, y + spacing * 6 + 20); //score bg
	ctx.closePath();
	ctx.lineWidth = 10;
	ctx.strokeStyle = 'white';
	ctx.beginPath();
	ctx.rect(x - 50, y - 100, x + 40, y + spacing * 6 + 20); //score border
	ctx.closePath();
	ctx.stroke();
	ctx.fillStyle = 'white';
	ctx.font = '20pt Calibri';
	ctx.fillText('Game Options', x+xText+5, y - 50);
};

var pauseGame = function(){
	alert ("Pause game and show menu");
	showMenu();
};

var onKeyUp = function (e){
	if (e.keyCode === 27){	//Escape opens menu
		if (onGameOptionsMenu === false){
			onGameOptionsMenu = true;
				if (onTitleScreen === false && onGameOverScreen === false && oncountdownToStartScreen === false){	//If game is running. Pause game and show menu
					gameIsPaused = true;
					pauseGame();
				}
				if (oncountdownToStartScreen === true){
					return;
				}
				else {
					showMenu();
				}
				return;
		}
		else if (onGameOptionsMenu === true){
			onGameOptionsMenu = false;
			if (onTitleScreen === true){
				titleScreen();
			}
			if (onGameOverScreen === true){
				displayStats();
			}
			else {
				gameIsPaused = false;
			}
		}
		return;
	}
	if (e.keyCode === 8){ 			//backspace pressed will start/stop music
		if(bgmusicStatus === true){
			bgmusic.pause();
			bgmusicStatus = false;
			return;
			}
		else{
			bgmusic.play();
			bgmusicStatus = true;
			return;
		};
	}
	else if (e.keyCode === 32 && gameover === true && onTitleScreen === true){ //spacebar start game
			initialize();
		}
	else if (e.keyCode === 32 && onGameOverScreen === true){ //spacebar start game from Game Over Screen
			level = 1,
			levelTimer = 2500, //divide by 1000 to get actual English seconds		
			levelCount = 0,
			combo = 0,
			linesCleared =0,
			maxCombo = 0,
			score = 0,
			letterIndex = 0,
			scoreMultiplier = 1,
			wpmErr = 0,
			wpmCount = 0,
			wpmGross = 0,
			letterCount = 0,
			wpmAccuracy = 0,
			count = 0,									//used for game timer
			scs = 0,									//set game timer seconds
			mns = 2,									//set game timer minutes
			totalSecs = mns * 60 + scs,
			current = count;
			count += (mns * 60) + scs;
			timerPercent = count/120 * 100;
			wordQueue.length = 0
			clearInterval(timerWordQueue);
			initialize();
		}
	else if (e.keyCode === letters[letterIndex].charCodeAt(letters[letterIndex]) && gameover === false){ 			//if the keyboard letter matches the next letter in the word
			if (letterIndex < letters.length){
				ctx.lineWidth = 2;
				ctx.strokeStyle = gameBgColor;
				ctx.beginPath();
				ctx.rect((leftSide+canvas.width*.25-(letters.length*20))+letterIndex*40, gameLettersY+7, 37, 37);//box around letter
				ctx.closePath();
				ctx.stroke();
				ctx.fillStyle="red";
				ctx.font = '20pt Calibri bold';
				ctx.fillText(letters[letterIndex], (leftSide+canvas.width*.25-(letters.length*20)+10)+letterIndex*40, gameLettersY+37);// display colored letters
				score = Math.round((score + 1 * scoreMultiplier * (level/10 + 1))*100)/100; //determine score
				letterCount++
				updateScore();
				if (audio.muted == false){
					audio = new Audio('./sounds/type.mp3');
					audio.volume = 0.25;
					audio.play();
				}
				letterIndex++;
			}
		if (letterIndex === letters.length){			//if you've typed all the letters in the word, start a new word
			if (audio.muted == false){
				audio = new Audio('./sounds/nice.mp3');
				audio.play();
			}
			levelCount++;
			linesCleared++;
			if (levelCount === 10 && level != 10){
				if (audio.muted == false){
					audio = new Audio('./sounds/level_up.mp3');
					audio.volume = 1;
					audio.play();
				}
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
					if (scoreMultiplier === 2){
						ctx.beginPath();
						ctx.arc(leftSide-50, 525, 40, 0, Math.PI*2, false); //Full-circle
						ctx.fillStyle = 'pink';
						ctx.closePath();
						ctx.fill();
						ctx.lineWidth = 5;
						ctx.strokeStyle = 'black';
						ctx.stroke();
						ctx.beginPath();
						ctx.arc(leftSide-50, 525, 40, 0, Math.PI, false); //Half-circle
						ctx.closePath();
						ctx.lineWidth = 5;
						ctx.fillStyle = 'red';
						ctx.fill();
						ctx.strokeStyle = 'black';
						ctx.stroke();
						ctx.font = '40pt Calibri';
						ctx.fillStyle='white';
						ctx.fillText('x'+scoreMultiplier, leftSide-70, 540); //Display Score Multiplier
						ctx.font = '40pt Calibri';
						ctx.lineWidth = 1;
						ctx.strokeStyle = 'black';
						ctx.strokeText('x'+scoreMultiplier, leftSide-70, 540); //Display Score Multiplier
						ctx.stroke();
					}
					if (scoreMultiplier === 3){
						ctx.beginPath();
						ctx.arc(leftSide-50, 525, 40, 0, Math.PI*2, false); //Full-circle
						ctx.fillStyle = 'pink';
						ctx.closePath();
						ctx.fill();
						ctx.lineWidth = 5;
						ctx.strokeStyle = 'black';
						ctx.stroke();
						ctx.beginPath();					
						ctx.arc(leftSide-50, 525, 40, 0, Math.PI*1.5, false); //Three Quarter-circle
						ctx.lineTo(leftSide-50, 525);
						ctx.closePath();
						ctx.lineWidth = 5;
						ctx.fillStyle = 'red';
						ctx.fill();
						ctx.strokeStyle = 'black';
						ctx.stroke();
						ctx.font = '40pt Calibri';
						ctx.fillStyle='white';
						ctx.fillText('x'+scoreMultiplier, leftSide-70, 540); //Display Score Multiplier
						ctx.font = '40pt Calibri';
						ctx.lineWidth = 1;
						ctx.strokeStyle = 'black';
						ctx.strokeText('x'+scoreMultiplier, leftSide-70, 540); //Display Score Multiplier
						ctx.stroke();
					}
					if (scoreMultiplier === 4){
						ctx.beginPath();
						ctx.arc(leftSide-50, 525, 40, 0, Math.PI*2, false); //Full-circle
						ctx.fillStyle = 'pink';
						ctx.closePath();
						ctx.fill();
						ctx.lineWidth = 5;
						ctx.strokeStyle = 'black';
						ctx.stroke();
						ctx.beginPath();
						ctx.arc(leftSide-50, 525, 40, 0, Math.PI*2, false); //Full-circle
						ctx.closePath();
						ctx.lineWidth = 5;
						ctx.fillStyle = 'red';
						ctx.fill();
						ctx.strokeStyle = 'black';
						ctx.stroke();
						ctx.font = '40pt Calibri';
						ctx.fillStyle='white';
						ctx.fillText('x'+scoreMultiplier, leftSide-70, 540); //Display Score Multiplier
						ctx.font = '40pt Calibri';
						ctx.lineWidth = 1;
						ctx.strokeStyle = 'black';
						ctx.strokeText('x'+scoreMultiplier, leftSide-70, 540); //Display Score Multiplier
						ctx.stroke();						
					}
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
	else if (gameover === false){			//if you've typed an error
	if (gameover === false){
		if (letterCount > wpmErr){
			wpmErr++;
		}
	combo = 0;
	if (audio.muted == false){
		audio = new Audio('./sounds/err.mp3');
		audio.play();
	}
	scoreMultiplier = 1;
	ctx.beginPath();
	ctx.arc(leftSide-50, 525, 40, 0, Math.PI*2, false); //Full-circle
	ctx.fillStyle = 'pink';
	ctx.closePath();
	ctx.fill();
	ctx.lineWidth = 5;
	ctx.strokeStyle = 'black';
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(leftSide-50, 525, 40, 0, Math.PI*0.5, false); //Quarter-circle
	ctx.lineTo(leftSide-50, 525);
	ctx.closePath();
	ctx.lineWidth = 5;
	ctx.fillStyle = 'red';
	ctx.fill();
	ctx.strokeStyle = 'black';
	ctx.stroke();
	ctx.stroke();
	ctx.font = '40pt Calibri';
	ctx.fillStyle='white';
	ctx.fillText('x'+scoreMultiplier, leftSide-70, 540); //Display Score Multiplier
	ctx.font = '40pt Calibri';
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'black';
	ctx.strokeText('x'+scoreMultiplier, leftSide-70, 540); //Display Score Multiplier
	ctx.stroke();	
	}
	}
	updateScore();
};


var displayGameWords = function(){
	if (gameover === false){
		if (wordQueue.length === 16){ 	//if the words on screen reach the top it's game over
			count = 0;
			clockSound.pause();
			if (audio.muted == false){
				audio = new Audio('./sounds/game_over.mp3');
				audio.volume = 1;
				audio.play();
			}
			gameover = true;
			displayStats();
			}
	else{
		ctx.fillStyle = gameBgColor;
		ctx.beginPath();
		ctx.fillRect(leftSide+7, 47, rightSide - leftSide - 56, canvas.height-143); //clear game area
		ctx.closePath();
		var y = 527
		for (i = 0;i < wordQueue.length;i++){
			y -= 30.5;
			ctx.fillStyle="#F7CBA0";
			ctx.lineWidth = 2;
			ctx.strokeStyle = "white";
			ctx.beginPath();
			ctx.rect(leftSide+7, y-23, rightSide - leftSide - 57, 29);	//box around word
			ctx.closePath();
			ctx.stroke();
			ctx.fill();
			ctx.font = '18pt Calibri';
			ctx.fillStyle='black';
			ctx.fillText(wordQueue[i], leftSide+canvas.width*0.25-60,y);
			displayLevel();
			displayWPM();
			}
		}
		}
};	

document.body.style.background = backgroundColor;
setEventHandlers();
titleScreen();

window.onkeydown = function(e) { 
  return !(e.keyCode < 69 || e.keyCode > 90);
};