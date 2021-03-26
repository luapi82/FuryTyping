// French words
var chooseWord = function(){
var dict = ["mot francais"];
var thisWord = dict[Math.round(Math.random()*(dict.length)-1+0)];
	while (thisWord.length > 12){
	thisWord = dict[Math.round(Math.random()*(dict.length)-1+0)];
	if (thisWord === "undefined"){alert("Please tell Paul about: " + thisWord)};
	};
		thisWord = thisWord.toUpperCase();
		return thisWord;
};
