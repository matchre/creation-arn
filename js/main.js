/*main.js*/

//to unlock any level, use password : inria2013
/****/
var TRANSITION_TIME=1000;//transition time between two molecules (ms)
var TRANSITION_STEPS=10;//step number between two molecules
var MAX_OPT_STRUCTURES=75;//number of co-optimal structures determined
var PRINT_ANSWER=false;
/****/
var ie = (document.all && !window.opera)?true:false;//true if IE
var running=0;//running if running==1
var attempts =0;//number of attempts used
var quit=0;//if quit==1, quit (execute initGame())
var levels = new Array();//list of Levels
var buttonLevels = new Array();//list of button levels
var currentLevel;//pointer on the current Level
var memNumLevel=-1;//we keep memory of the last level played
//arrays of molecule to be found
//~ var answers = new Array(answersString.length);
//An array with index of answers among which we will choose goal	
var pool = new Array();
var from = 0;//rank of the incomplete sequence given to the player 
var playerMol;//molecule modified by the player
var playerDrawMol;//DrawMol modified by the player
var answer;//molecule which is a solution
var attempts;//count the number of attempts
var timeLeft;//the time(sec.) the player have to find the answer
var timer=0;//timer id
var presentationString;
var keyDown = false;//==true if a key is down 
					//when the cursor is over playerScreen
var firstPlay=0;
var listOptStructures;//list of optimized structure for playerMol.bases

$(function() {//we wait for the DOM
	presentationString = $('#instructions').text();
	initCanvas();
	initEffects();
	initLevels();//and initGame when level file loaded
	//~ test();
});
/*
test=function()
{
	var mol= new Molecule('AGCA');
	mol.maxOfBonds();
	console.log(mol.nbOfBonds);
	console.log(mol.structure);
	//~ for(var k=0; k<3; k++)
		//~ console.log(mol.listOptStructures[100+k]);
	console.log(mol.listOptStructures);
	//~ var tab=[1,1,1];
	//~ var t=[0,2,4];
	//~ console.log(tab.concat(t));
	//~ var tt= new Array();
	//~ tt.unshift(tab);
	//~ tt.unshift(t);
	//~ console.log(tt);
	//~ console.log(tt[1]);
}
*/
function getMode() 
{
	 return mode;
}

function drawMode()
{
	$('#selectLevel').css('display','block');
	$('#shadowing').css('display','block');
}

function initGame()
{
	running=0;
	quit=0;
	mode=-1;
	attempts=0;
	
	//we clear both canvas
	var canvas0 = document.getElementById('objective');
    var ctx0 = canvas0.getContext('2d');
    var canvas1 = document.getElementById('playerScreen');
    var ctx1 = canvas1.getContext('2d');
    ctx0.clearRect(0, 0, canvas0.width, canvas0.height);
    ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
	resetCanvas(true);
	resetCanvas(false);
	
	drawMode();

    $('#title').css('display', 'block');
	$('#basesColor').css('display', 'none');
	if(firstPlay=0)
		$('#instructions').text(presentationString);
    $('#start').css('display', 'none');
    $('#impossible').css('display','none');
    $('#timeLeft').text('');
    $('#nbPosPlayer').text('');
	$('#nbOfBondsPlayer').text('');
	$('#nbOfBondsObj').text('');
	firstPlay=1;
}

function startTuto()
{
	alert(currentLevel.comments);
	$('#start').css('display', 'block');
	drawCanvasTuto();
}

function switchMol()
{
	var modBases = new Array(playerMol.modifiableBases.length);
	playerMol.modifiableBases.copy(modBases);
	
	playerMol.switchMol();
	
	playerMol.modifiableBases = modBases;
	
	resetCanvas(false);
	playerDrawMol= new DrawMol(playerMol);
	playerDrawMol.build(false);
	playerDrawMol.mainLoop.setModifiable(modBases);
	playerDrawMol.draw(false);

	if(playerMol.structure.equal(answer.structure))
	{
		if(playerMol.nbOptStructures==1||
			currentLevel.oneOptStructOnly==-1)
			won();
		else
		{
			$("#instructions").text("La structure obtenue est la bonne"
			+" mais n'est pas la"+
			" seule que peut adopter votre séquence.");
		}
	}		
	running=1;
}

function start()
{
	if(currentLevel.password=='OOOO')
		$('#margeTitle').text('Présentation');
	else
		$('#margeTitle').text('INDICATIONS');
	$('#title').css('display', 'none');
	$('#basesColor').css('display', 'block');
	running=1;
	keyDown=0;
	if(memNumLevel!=currentLevel.num)
	{
		memNumLevel = currentLevel.num;
		initPool();
	}
	if(currentLevel.oneOptStructOnly != -1)
		$('#impossible').css('display','block');
		
	$('#levelName').text(currentLevel.name);
	$('#levelName').css('background-color',currentLevel.color);
	
	if(currentLevel.password!='OOOO')//keep rules if tutorial level
	{
		$('#instructions').text(currentLevel.comments);
		runTimer();
	}
	
	//We chose the molecule to find : answers[goal]
	from = getRandomNumber();
	
	if(currentLevel.solution!='')
	{
		answer = new Molecule(currentLevel.solution);
		answer.maxOfBonds();
	}
	else
	{
		answer = new Molecule(currentLevel.incompleteSeq[from]);
		answer.structure = currentLevel.targetStructure;
		answer.setNbBondsFromStruct();
	}
	playerMol = new Molecule(currentLevel.incompleteSeq[from]);
	$('#nbOfBondsObj').text(answer.nbOfBonds);
	answer.structure.copy(playerMol.structure);

	playerDrawMol= new DrawMol(playerMol);
	playerDrawMol.build(true);
	playerDrawMol.draw(true);
	resetCanvas(true);
	printTitleObjective();
	playerDrawMol.build(false);
	playerDrawMol.draw(false);
}

function gameOver()
{
	if(quit==1)
		return;
	clearInterval(timer);
	if(currentLevel.password=='OOOO')
	{
		alert('Désolé, vous avez perdu !\n'
			+'Cliquez sur MENU pour commencer une autre partie.\n');
	}
	else
	{
	alert('Désolé, vous avez perdu !\n'
			+'Temps : '+(currentLevel.timeLimit-timeLeft)
			+' secondes\n'
			+'Nombre de coups : '+attempts+'\n' 
			+'Votre proposition admet '
			+playerMol.nbOptStructures+' structures possibles.\n'
			+'Cliquez sur MENU pour commencer une autre partie.\n'
			+ 'Mot de passe de ce niveau : '+ currentLevel.password);
	}
	if(PRINT_ANSWER)
	{
		var objDrawMol = new DrawMol(answer);
		objDrawMol.build(true);
		objDrawMol.draw(true);
	}
	resetCanvas(true);
	resetCanvas(false);
	quit=1;
}

function won()
{
	if(quit==1)
		return;
	clearInterval(timer);
	var l=getLevel(currentLevel.num + 3);
	if(currentLevel.password=='OOOO')
	{
		alert('Félicitations, vous avez gagné !\n'
			+'Cliquez sur MENU pour commencer une autre partie.\n'
			+ 'Mot de passe du niveau ' + l.name +' ('+ l.num+' ) :\n'
			+ l.password);
	}
	else
	{
	alert('Félicitations, vous avez gagné !\n'
			+'Temps : '+(currentLevel.timeLimit-timeLeft)
			+' secondes \n'
			+'Nombre de coups '+attempts 
			+'\n Votre proposition admet '
			+playerMol.nbOptStructures+' structures possibles.\n'
			+' Cliquez sur MENU pour commencer une autre partie.\n'
			+ 'Mot de passe du niveau ' + l.name +' ('+ l.num+' ) :\n'
			+ l.password);
	}
	l.authorise(true);
	var objDrawMol = new DrawMol(answer);
	objDrawMol.build(true);
	objDrawMol.draw(true);
	resetCanvas(true);
	resetCanvas(false);
	quit=1;
}

function attempt()
{
	attempts++;
	//modifiable bases :
	var modBases = new Array(playerMol.modifiableBases.length);
	playerMol.modifiableBases.copy(modBases);
	
	var lastPlayerBases = new Array();//ordonned by num
	playerDrawMol.mainLoop.copyBases(lastPlayerBases);
	var lastPlayerStructure = new Array(playerMol.size);
	playerMol.structure.copy(lastPlayerStructure);
	
	var intermPlayerBases = new Array(playerMol.size);
	playerDrawMol.mainLoop.copyBases(intermPlayerBases);
	
	var lastScale=playerDrawMol.scale;
	var lastTranslation = new Array(2);
	playerDrawMol.translation.copy(lastTranslation);
	var newPlayerBases = new Array(playerMol.size);
		
	playerMol.isCompleteMolecule=true;
	playerDrawMol.mainLoop.refresh(playerMol);

	if(!playerMol.isCompleteMolecule)
		return;
	
	running=0;//forbide a new change on the player screen
	//optimisation of the player molecule:
	playerMol.maxOfBonds();
	
	//build the player molecule
	var canvas;
	canvas = document.getElementById("playerScreen");
	var ctx = canvas.getContext("2d");
	resetCanvas(false);
	playerDrawMol.build(false);
	
	//unable new modifications
	playerMol.modifiableBases = modBases;
	playerDrawMol.mainLoop.setModifiable(modBases);
	
	playerDrawMol.mainLoop.copyBases(newPlayerBases);
	
	//draw the player molecule dynamically :
	var n;
	var step = 0;
	var deltaT=TRANSITION_TIME/TRANSITION_STEPS;
	var deltaScale=(playerDrawMol.scale-lastScale)/TRANSITION_STEPS;
	var deltaTranslation = new Array(2);
	deltaTranslation[0]=(playerDrawMol.translation[0]-
		lastTranslation[0])/TRANSITION_STEPS;
	deltaTranslation[1]=(playerDrawMol.translation[1]-
		lastTranslation[1])/TRANSITION_STEPS;

	transition = setInterval(function(){
		this.animate(step);
		step++;
		if(step>=TRANSITION_STEPS)
			this.end();
		},deltaT);

	this.animate=function(s)
	{
		resetCanvas(false);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.scale(lastScale+ s*deltaScale,lastScale+ s*deltaScale);
		ctx.translate(lastTranslation[0] + s*deltaTranslation[0],
			lastTranslation[1] + s*deltaTranslation[1]);
		//~ ctx.setTransform(this.scale, 0,0,this.scale,
			//~ this.translation[0], this.translation[1]);
			//does not work properly
		for(var k=0; k<playerMol.size; k++)
		{
			intermPlayerBases[k].X = lastPlayerBases[k].X +
				s*(newPlayerBases[k].X
				- lastPlayerBases[k].X)/TRANSITION_STEPS;
			intermPlayerBases[k].Y =lastPlayerBases[k].Y +
				s*(newPlayerBases[k].Y
				- lastPlayerBases[k].Y)/TRANSITION_STEPS;
			if(s>=TRANSITION_STEPS/2)
			{
				intermPlayerBases[k].nat=newPlayerBases[k].nat;
				n =playerMol.structure[intermPlayerBases[k].rank];
			}
			else
				n =lastPlayerStructure[intermPlayerBases[k].rank];
			
			if(intermPlayerBases[k].rank> n && n!=-1)
			{
				ctx.beginPath();
				ctx.moveTo(intermPlayerBases[k].X,
					intermPlayerBases[k].Y);
				ctx.lineTo(intermPlayerBases[n].X,
					intermPlayerBases[n].Y);
				ctx.strokeStyle = "blue";
				ctx.lineWidth = 5;
				ctx.stroke();
				ctx.closePath();
			}
			if(k>0)
			{
				ctx.beginPath();
				ctx.moveTo(intermPlayerBases[k-1].X,
					intermPlayerBases[k-1].Y);
				ctx.lineTo(intermPlayerBases[k].X,
					intermPlayerBases[k].Y);
				ctx.strokeStyle = "black";
				ctx.lineWidth = 2;
				ctx.stroke();
				ctx.closePath();
			}
		}
		
		for(var k=0; k<playerMol.size; k++)
			intermPlayerBases[k].draw(false);
		
	}
	this.end = function()
	{
		clearInterval(transition);
		//draw the new final player molecule
		resetCanvas(false);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		playerDrawMol.draw(false);
		//playerDrawMol.mainLoop.print();
		
		
		/*****/
		if(playerMol.nbOptStructures>MAX_OPT_STRUCTURES)
			$('#nbPosPlayer').text('>'+MAX_OPT_STRUCTURES);
		else
			$('#nbPosPlayer').text(playerMol.nbOptStructures);
		
		if(playerMol.nbOptStructures==1)
			$('#nbPosPlayer').css('color','green');
		else
			$('#nbPosPlayer').css('color','black');
			
		$('#nbOfBondsPlayer').text(playerMol.nbOfBonds);
		if(playerMol.nbOfBonds==answer.nbOfBonds)
			$('#nbOfBondsPlayer').css('color','green');
		else
			$('#nbOfBondsPlayer').css('color','black');
		/******/
		running=1;
		if(playerMol.structure.equal(answer.structure))
		{
			if(playerMol.nbOptStructures==1||
				currentLevel.oneOptStructOnly == -1)
				won();
			else
			{
				$("#instructions").text("La structure obtenue est la bonne"
				+" mais n'est pas la"+
				" seule que peut adopter votre séquence.");
			}
		}
	}
}

//return true if the two arrays are exactly the same
Array.prototype.equal = function(array)
 {
        if(this.length!=array.length)//never happen
			return false;
        for(var i=0; i<this.length; i++)
		{
			if(this[i]!=array[i])
				return false;
		}
		return true;
 }
//copy this in array
Array.prototype.copy = function(array)
 {
        if(this.length!=array.length)//never happen
			return;
        for(var i=0; i<this.length; i++)
			array[i]=this[i];
 }
//return a random number from pool and delete it
function getRandomNumber()
{
	if(pool.length==0)
		initPool();
	var r = Math.floor(pool.length*Math.random());
	var n = pool.splice(r, 1);
	return n;
}
function initPool()
{
	pool = []; 
	for(var i=0; i<currentLevel.incompleteSeq.length; i++)
		pool.push(i);
}
function initAnswers()
{
	for(var i=0; i<answers.length; i++)
		{
		var mol = new Molecule(answersString[i]);
		mol.maxOfBonds();
		answers[i]=mol;
	}
}
//We undo the scaling and translation	
resetCanvas = function(isObjective)
{
	var canvas;
	if(isObjective)
			canvas = document.getElementById("objective");
	else
		canvas = document.getElementById("playerScreen");
		
	if (canvas.getContext)
		var ctx = canvas.getContext("2d");
	else return;
	
	ctx.setTransform(1,0,0,1,0,0);
}

function printTitleObjective()
{
	canvas = document.getElementById("objective");
	if (canvas.getContext)
		var ctx = canvas.getContext("2d");
	else return;
	ctx.font=12+'px Georgia';
	ctx.fillStyle='black';
	ctx.fillText("Objectif",5,canvas.height-5,canvas.width);
}
//for debug mode:
String.prototype.replaceAt=function(index, char) 
{
	var s = this.substr(0, index)+char
		+this.substr(index+char.length);
	return s;
}

function runTimer()
{
	timeLeft = currentLevel.timeLimit;
	timer = setInterval(function(){
		timeLeft--;
		if(timeLeft>10)
			$('#timeLeft').css('color','green');
		else if(timeLeft<5)
			$('#timeLeft').css('color','red');
		else
			$('#timeLeft').css('color','orange');
		
		$('#timeLeft').text(timeLeft);
		if(timeLeft<=0)
			gameOver();
		},1000);
}
