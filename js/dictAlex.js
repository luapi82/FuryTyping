// French words
var chooseWord = function(){
var dict = ["papa","maman","alex","kyana","maxine","paul","Bash","Boomer","Camo","Chop Chop","Cynder","Dino Rang","Double Trouble","Drill Sergeant","Drobot","Eruptor","Flameslinger","Ghost Roaster","Gill Grunt","Hex","Ignitor","Lightning Rod","Prism Break","Slam Bam","Sonic Boom","Spyro","Stealth Elf","Stump Smash","Sunburn","Terrafin","Trigger Happy","Voodood","Warnado","Wham Shell","Whirlwind","Wrecking Ball","Zap","Zook","Bouncer","Crusher","Granite","Eye Brawl","Hot Head","Ninjini","Swarm","Thumpback","Tree Rex","Mercure","venus","terre","mars","jupiter","saturne","uranus","neptune","viau","minecraft","cheval","chevalier","abeille","ballon","dinosaure","chemise","fille","igloo","jus","kangourou","lapin","mouton","noir","orange","quatre","rose","serpent","tortue","usine","vis","wapiti","cadeau","xylophone","citrouille","genou","cercle","triangle","rectangle","ellipse","cylindre","cube","sphere","cone","prisme","est","pas","elle","il","avec","et","un","une","toi","voici","dans","les","mon","mots","chanelle","maxime","emmet","preston","madison","emilie","makenzi","christian","rylan","cade","hayden","jasmine","kaylee","samuel","sheldon","kamdon","kayden","tante","oncle","melanie","yves","evan","miguel"];
var thisWord = dict[Math.round(Math.random()*(dict.length-1))];
	//alert(dict.length + " " + thisWord);
	while (thisWord.length > 12){
		thisWord = dict[Math.round(Math.random()*(dict.length)-1)];
	};
	thisWord = thisWord.toUpperCase();
	return thisWord;
};
