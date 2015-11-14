// ****************************** Disc Golf Score Card v.0.4.0.0 ****************************
// * For Chrome 34 (currently no cross compatibility)                                        *
// * known bugs: incorrect sorting function, improper highlight toggling                    *
// * TODO:                                                                                  *
// *** minor stuff **************************************************************************
// * DONE *add input validation for setup and entry forms*											  *
// * fix highlighted hole bug for scoreForm x-out														  *
// * click on individual hole cell to change score														  *
// * more stylizing and animating - add outer div around entire score card?					  *
// * optimizations: combine var statements, optimize DOM stuff, etc                         *
// *** MAJOR stuff **************************************************************************
// * re-ordering/sorting for rank changes														  			  *
// * implement some sort of offline storage (cookies?) 												  *
// * select from pre-loaded course objects with stored info (using JSON/XML possibly?)      *
// * player profiles for score tracking														  			  *
// * cross-browser compatibility																				  *
// ******************************************************************************************

//player object constructor
function Player (name) {
	this.name = name;
	this.rawScore = 0;
	this.diff = 0;
	this.parTotal = 0;
}

//global module
var players = (function () {
	
	//player array
	var playerList = [];
	
	//initialize with first player
	playerList.push(new Player("Player 1"));
	
	//current player
	var current = 0;
	
	//current hole
	var hole = 0;
	
	//number of holes;
	var holes;

    //rank order
    var rankOrder = [];
	
	return {
	
		addPlayer: function (newPlayer) {
			playerList.push(newPlayer);
		},
		
		getPlayer: function (n) {
			return playerList[n];
		},
		
		getAllPlayers: function () {
			return playerList;
		},
		
		setAllPlayers: function (pL) {
			playerList = pL;
		},
		
		getPlayerCount: function () {
			return playerList.length;
		},
		
		setCurrent: function (c) {
			current = c;
		},
		
		getCurrent: function () {
			return current;
		},
		
		setHole: function (h) {
			hole = h;
		},
		
		getHole: function() {
			return hole;
		},
		
		setHoles: function (h) {
			holes = h;
		},
		
		getHoles: function () {
			return holes;
		}

	};
}());

//entry form stuff
function setupForm () {
	var dForm = document.getElementById("discForm");
	
	//test sort function
	//var sortTest = document.getElementById("sortTest");
	//sortTest.addEventListener("click", sortPlayers, false);
	
	var sboxPlayers = dForm.numPlayers;
	sboxPlayers.addEventListener("change", function() {
		var sboxI = sboxPlayers.selectedIndex;
		var num = sboxPlayers[sboxI].value;
		toggleInputNames(num);
	}, false);
	
	var startBtn = dForm.startRound;
	startBtn.addEventListener("click", function() {
	
		//get course name
		var courseName = dForm.courseName.value;
		
		//get number of holes
		var holes = dForm.numHoles.value;
		players.setHoles(holes);
	
		//get number of players
		var sboxI = sboxPlayers.selectedIndex;
		var numPlayers = sboxPlayers[sboxI].value;
		
		//create players array
		var pNames = dForm.querySelectorAll(".inputName");
		players.getPlayer(0).name = pNames[0].value;
		for (var i=1; i<numPlayers; i++) {
			var newPlayer = new Player(pNames[i].value);
			players.addPlayer(newPlayer);
		}
		
		dForm.style.display = "none";
		
		//setup score form and generate card
		initializeScoreForm();
		generateCard(courseName, holes);
		
	}, false);
	
}

function toggleInputNames(numOfPlayers) {
	var pList = document.querySelectorAll(".inputName"),
	    len = pList.length,
		 i;
		 
	//first remove any textboxes
	for (i=1; i<len; i++) {
		pList[i].classList.add("hidden");
	}
	
	//then re-add to DOM
	for (i=1; i<numOfPlayers; i++) {
		pList[i].classList.remove("hidden");
	}
}

function generateCard(courseName, numHoles) {
	var doc = document;
	var cardFrag = doc.createDocumentFragment();
	
	//create course name header
	var headerDiv = doc.createElement("div");
	headerDiv.id = "toprow";
	var headerName = doc.createElement("h2");
	headerName.innerHTML = courseName;
	headerDiv.appendChild(headerName);
	
	//set number of holes and holewidth
	players.setHoles(numHoles);
	var holeWidth = (100/numHoles) + "%";
	
	//create hole + par rows
	var holeRow = createRows("Hole", numHoles, holeWidth);
	var parRow = createRows("Par", numHoles, holeWidth);

	//add header rows to fragment
	cardFrag.appendChild(headerDiv);
	cardFrag.appendChild(holeRow);
	cardFrag.appendChild(parRow);
	
	//create player rows
	var numPlayers = players.getPlayerCount();
	var i=0;
	do {
		var playerRow = createRows(players.getPlayer(i).name, numHoles, holeWidth, i);
		var pName = playerRow.firstChild;
		var pScore = playerRow.lastChild;
		pName.classList.add("pname");
		pName.id = "p" + i + "name";
		pScore.classList.add("scoreRow");
		pScore.id = "p" + i + "row";
		
		//create inner divs for rawScore and par difference
		var playerTotal = createTotalBox("rawScore", i);
		pName.appendChild(playerTotal);
		
		var playerDiff = createTotalBox("diff", i);
		pName.appendChild(playerDiff);
		
		cardFrag.appendChild(playerRow);
	} while (++i<numPlayers);
	
	doc.body.appendChild(cardFrag);
}

function createRows (header, holes, w, pNum) {
	var frag = document.createDocumentFragment();
	
	var leftDiv = document.createElement("div");
	leftDiv.classList.add("leftcol");

	var rightDiv = document.createElement("div");
	rightDiv.classList.add("rightcol");
	
	if (header === "Par") {
		rightDiv.addEventListener("click", showParBox, false);
	} else if (header === "Hole") {
		rightDiv.addEventListener("click", showScoreForm, false);
	}
	
	var divLabel = document.createElement("h2");
	divLabel.innerHTML = header;
	leftDiv.appendChild(divLabel);

	for (var i=0; i<holes; i++) {
		var hole = document.createElement("div");
		hole.classList.add("holeCell");
		if (header === "Hole") {
			hole.innerHTML = (i+1);
			hole.id = "hole" + (i);
			hole.addEventListener("mouseenter", toggleHighlight, false);
			hole.addEventListener("mouseleave", toggleHighlight, false);
		} else if (header === "Par") {
			hole.innerHTML = 3;
			hole.id = "par" + (i);
		} else {
			hole.id = "p" + (pNum) + "hole" + (i);
		}
		hole.style.width = w;
		rightDiv.appendChild(hole);
	}
	frag.appendChild(leftDiv);
	frag.appendChild(rightDiv);
	
	return frag;
}

function createTotalBox (boxType, pNum) {
	var totalBox = document.createElement("div");
	totalBox.classList.add(boxType);
	totalBox.id = "p" + pNum + boxType;
	totalBox.innerHTML = 0;
	return totalBox;
}

function initializeScoreForm () {
	var doc = document;
	var sForm = doc.getElementById("scoreForm");
	
	var scoreEntryBox = sForm.scoreEntryBox;
	var scoreEntryBtn = sForm.scoreEntryBtn;
	var scoreCloseBtn = sForm.closeForm;
	
	//intialize changePar elements
	var chgParDiv = doc.getElementById("chgParDiv");
	chgParDiv.addEventListener("click", function (event) {
        toggleHighlightHole();
		var target = event.target;
		
		switch (target.id) {
			case "chgParBtn3":
			case "chgParBtn4":
			case "chgParBtn5":
				changePar(event);
				break;
			case "parCloseBtn":
				toggleHighlightHole();
				chgParDiv.classList.add("hidden");
				break;
		}
	}, false);
	
	//update holeCell for player with entered score
	scoreEntryBtn.addEventListener("click", function () {
		updateHoleCell(Number(scoreEntryBox.value));
		scoreEntryBox.focus();
	}, false);
	
	//prevent non-number input
	scoreEntryBox.addEventListener("keypress", function (event) {
		var val = event.keyCode;
		if (!/\d/.test(String.fromCharCode(val))) {
			event.preventDefault();
		}
	}, false);
	
	//quick picks
	var quickPickDiv = doc.getElementById("quickPickDiv");
	quickPickDiv.addEventListener("click", quickPick, false);
	
	scoreCloseBtn.addEventListener("click", function () {
		sForm.classList.add("hidden");
		toggleHighlightHole();
		toggleHighlightPlayer();
	}, false);
}

function showParBox(event) {
	players.setHole(event.target.id.substring(3));
	toggleHighlightHole();
	var box = document.getElementById("chgParDiv");
	setPosition(box);
	box.classList.remove("hidden");
}

function showScoreForm(event) {
	players.setHole(event.target.innerHTML-1);
	var sForm = document.getElementById("scoreForm");
	
	setPosition(sForm);

	//highlight related elements
	toggleHighlightHole();
	toggleHighlightPlayer();
	
	//show form
	sForm.classList.remove("hidden");
	sForm.scoreEntryBox.focus();
}

function updateHoleCell (score) {
	//updates individual hole cell with given score and compares to par
	var sForm = document.getElementById("scoreForm");
	var entered, oldScore;
	
	//get current player
	var current = players.getCurrent();
	
	//get current hole;
	var holeCell = getHoleCell();
	
	//get par for current hole
	var par = getPar();
	
	//check if already score already entered
	if (holeCell.innerHTML.length) {
		oldScore = holeCell.innerHTML;
		entered = 1;
	}
	
	//set hole cell to score and stylize
	holeCell.innerHTML = score;
	stylizeHoleCell(score, par);
	
	//if score was already entered, new score is difference and totalpar is not increased
	if (entered) {
		score = score - oldScore;
		par = 0;
	}
	
	//update player totals
	updatePlayerTotals(score, par);
	
	//increment current player then check if more players, else reset current to 0
	current++;
	toggleHighlightPlayer();
	if (current < players.getPlayerCount()) {
		players.setCurrent(current);
		toggleHighlightPlayer();
	}
	else {
		toggleHighlightHole();
		//sortPlayers();
		players.setCurrent(0);
		sForm.classList.add("hidden");
	}
}

function sortPlayers () {
	var playerList = players.getAllPlayers();
	var len = players.getPlayerCount();
	var scoreArr = [];
	var tempscore, tempplayer;

	//sort player scores with tacked-on index value as decimal
	for (var i=0; i<len; i++) {
		tempscore = playerList[i].rawScore + ((i+1)/10);
		scoreArr.push(tempscore);
	}
	scoreArr.sort(function(a,b){return a-b;});
	console.log(scoreArr);
	
	//convert score array into rank values
	var rankArr = scoreArr.map(function(score) {
		return Math.round((score - Math.floor(score))*10)-1;
	});
	console.log(rankArr);
	
	//use rank values as indices for re-ordering players
	var frag = document.createDocumentFragment();
	var leftDiv, rightDiv;
	for (i=0; i<len; i++) {
		players.setCurrent(rankArr[i]);
		leftDiv = getPInfoDiv("name");
		rightDiv = getPInfoDiv("row");
		frag.appendChild(leftDiv);
		frag.appendChild(rightDiv);
	}
	
	//re-set players array with updated rank
	playerList = [];
	for (i=0; i<len; i++) {
		tempplayer = players.getPlayer(rankArr[i]);
		console.log(tempplayer.name);
		playerList.push(tempplayer);
	}
	players.setAllPlayers(playerList);
	
	document.body.appendChild(frag);
}



function updatePlayerTotals (score, par) {
	//update player total boxes for rawScore and difference from par
	
	var current = players.getCurrent();
	var player = players.getPlayer(current);

	//add score and par to player totals and calculate difference
	player.rawScore = player.rawScore + score;
	player.parTotal = player.parTotal + par;
	player.diff = player.rawScore - player.parTotal;
	
	var rawScoreDiv = getPInfoDiv("rawScore");
	var diffDiv = getPInfoDiv("diff");
	
	if (player.diff > 0) {
		diffDiv.style.backgroundColor = "#FF1122";
	} else if (player.diff < 0) {
		diffDiv.style.backgroundColor = "#008F00";
	} else {
		diffDiv.style.backgroundColor = "#eee";
	}
	
	rawScoreDiv.innerHTML = player.rawScore;
	diffDiv.innerHTML = player.diff;
	
}

function adjustParTotals (parDiff) {
	//on par change, adjusts the values related to par for each player
	var oldCurrent = players.getCurrent();
	for (var i=0, len=players.getPlayerCount(); i<len; i++) {
		players.setCurrent(i);
		updatePlayerTotals(0, parDiff);
		stylizeHoleCell();
	}
	players.setCurrent(oldCurrent);
}

function quickPick (event) {
	var target = event.target;
	var par = getPar();
	
	switch (target.value) {
		case "Par":
			updateHoleCell(par);
			break;
		case "Birdie":
			updateHoleCell(par-1);
			break;
		case "Bogey":
			updateHoleCell(par+1);
			break;
	}
}

function changePar(event) {
	var newPar = event.target.value;
	var div = getHoleDiv("par");
	var oldPar = getPar();
	div.innerHTML = newPar;
	var box = document.getElementById("chgParDiv");
	
	//if score entered, adjust totals
	var holeCell = getHoleCell().innerHTML;
	if (holeCell.length) {
		adjustParTotals(newPar - oldPar);
	}
	toggleHighlightHole();
	box.classList.add("hidden");
}	

function getHoleDiv (type) {
	var hole = players.getHole();
	var ID = type + hole;
	var div = document.getElementById(ID);
	return div;
}

function getPar() {
	var div = getHoleDiv("par");
	return Number(div.innerHTML);
}

function getPInfoDiv (type) {
	//returns player info div based on type (name, row, totals)
	var current = players.getCurrent();
	var ID = "p" + current + type;
	var div = document.getElementById(ID);
	return div;
}

function getHoleCell () {
	var current = players.getCurrent();
	var hole = players.getHole();
	var ID = "p" + current + "hole" + hole;
	var div = document.getElementById(ID);
	return div;
}

function setPosition (box) {
	var hole = players.getHole();
	var holes = players.getHoles();
	var w = 60 - (hole*(60/holes)) + "%";
	box.style.right = w;
}

function stylizeHoleCell() {
	var holeCell = getHoleCell();
	var score = holeCell.innerHTML;
	var par = getPar();
	if (score === 1) {
		holeCell.classList.add("ace");
	} else {
		switch (score - par) {
			case -2:
				holeCell.style.backgroundColor = "gold";
				break;
			case -1:
				holeCell.style.backgroundColor = "#FFB56C";
				break;
			case 0:
				holeCell.style.backgroundColor = "#4791FF";
				break;
			case 1:
				holeCell.style.backgroundColor = "red";
				break;
			default:
				holeCell.style.backgroundColor = "maroon";
				break;
		}
	}
}

function toggleHighlightHole() {
	var holeDiv = getHoleDiv("hole");
	var parDiv = getHoleDiv("par");
	holeDiv.classList.toggle("highlightHole");
	parDiv.classList.toggle("highlightHole");
}

function toggleHighlightPlayer () {
	var name = getPInfoDiv("name");
	var row = getPInfoDiv("row");
	name.classList.toggle("highlightHole");
	row.classList.toggle("highlightHole");
}

function toggleHighlight () {
	this.classList.toggle("highlight");
}

//start app
setupForm();