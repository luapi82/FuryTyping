var chooseWord = function(){
var thisWord = dict[Math.round(Math.random()*(dict.length-1))];
	while (thisWord.length > wordMaxLength){
		thisWord = dict[Math.round(Math.random()*(dict.length)-1)];
		};
	thisWord = thisWord.toUpperCase();
	return thisWord;
};