/*main.js*/

//for debug mode click START and then click 'cancel'
/*********************/
//CONSTANTS TO BE MODIFIED

//array of molecules with undetermined bases from the array hereabbelow
var partOfMolecules=[
				  "ACCCCOOOGAUGOAUGAUCGOOGAUOGAUOOOACGUA",
				  "AAOOOOOAAGAAGA",
				  "COOOACAUOACUOOCAUOOOUCO",
				  "GUCOOCAUCGOOOOUACGCCAOOOACUACOA",
				  "OCGUACACOOOOAAUUCGAUCGOOOA"
				];
//the same array with one optimized structure
var answersString=[
			"ACCCCUAAGAUGCAUGAUCGAAGAUCGAUGUUACGUA",
			"AACAACAAAGAAGA",
			"CUAGACAUGACUGACAUCAUUCU",
			"GUCAGCAUCGAUCAUACGCCAUCGACUACGA",
			"UCGUACACACCAAAUUCGAUCGAUCA"
			];
//number of attempts authorized for each molecule
var attemptsLimit = [8, 3, 7, 10, 9];
//bonus of attempts which depends on the mode chosen
var bonus = [0, 2, 0, 3]

/***************/

var ie = (document.all && !window.opera)?true:false;//true if IE
var running=0;//running if running==1
var attempts =0;//number of attempts left
var mode;//Mode: 0 : debug; 1 : easy; 2 : normal; 3 : hard
var quit=0;//if quit==1, quit (execute initGame())

//arrays of molecule to be found
var answers = new Array(answersString.length);
//An array with index of answers among which we will choose goal	
var pool = new Array();
var goal = 0;//rank of the molecule in answers the player has to find 
var playerMol;//molecule modified by the player
var playerDrawMol;//DrawMol modified by the player


$(function() {//we wait for the DOM
	initCanvas();
	initEffects();
	initButtons();
	initAnswers();
	initPool();
	initGame();
});
/***************/
function initButtons()
{
	$("#add").click(function() {
			var str = prompt('Entrez une molécule :');
			initGame();
			mode=0;
			drawMode();
			answersString.unshift(str);
			start();
		});
	$("#start").click(function() {
			if(mode==-1)
			{
				if(confirm('Veuillez choisir un niveau s\'il vous plaît')==false)
					if(confirm('Mode debug ?')) 
						mode=0;
				drawMode();	
			}
			else if(running==0)
			{
				$("span", this).text('SOUMETTRE');
				running=1;//Begin the game
				start();
			}
			else						
				attempt();
		});
	$('#quit').click(function() {
		if(quit==1)
		{
			initGame();
		}
		else if(running==0)
			return;
		else if(confirm('Voulez-vous vraiment quitter ?'))
			{
				quit++;
				gameOver();
			}
		});
	$('#modeEasy').click(function() {
		if(running==1)
		{
			alert('Vous devez recommencer une nouvelle '+ 
			'partie pour pouvoir changer de niveau');
			return;
		}
		mode=1;
		drawMode();
		});
	$('#modeNormal').click(function() {
		if(running==1)
		{
			alert('Vous devez recommencer une nouvelle '+ 
			'partie pour pouvoir changer de niveau');
			return;
		}
		mode=2;
		drawMode();
		});
	$('#modeHard').click(function() {
		if(running==1)
		{
			alert('Vous devez recommencer une nouvelle '+ 
			'partie pour pouvoir changer de niveau');
			return;
		}
		mode=3;
		drawMode();
		});
	$('#impossible').click(function() {
	if(confirm('Êtes-vous sûr que cette structure n\'est pas '
				+'réalisable de manière unique ?'))
		{
			if(answers[goal].nbOptStructures!=1)
				won();
			else
				gameOver();
		}
	});
}	
/*******************/
function getMode() 
{
	 return mode;
}

function drawMode()
{	
	$('#add').css('display', 'none');
	$('#impossible').css('display', 'none');
	$('#start span').text('DEMARRER');
	
	switch(mode)
	{
		case 0 :
			$('#modeEasy').css('color','grey');
			$('#modeNormal').css('color','grey');
			$('#modeHard').css('color','grey');
			$('#add').css('display', 'inline');
			$('#impossible').css('display', 'inline');
			charMode='debug';
			break;
		case 1 : 
			$('#modeEasy').css('color','red');
			$('#modeNormal').css('color','grey');
			$('#modeHard').css('color','grey');
			charMode='Facile';
			break;
		case 2 : 
			$('#modeEasy').css('color','grey');
			$('#modeNormal').css('color','red');
			$('#modeHard').css('color','grey');
			charMode='Normal';
			break;
		case 3 :
			$('#modeEasy').css('color','grey');
			$('#modeNormal').css('color','grey');
			$('#modeHard').css('color','red');
			$('#impossible').css('display', 'inline');
			charMode='Difficile. Attention, vous devez trouver une' 
			+' solution qui n\'admette pas d\'autre structure maximisant' 
			+' le nombre de liaisons que la structure attendue.'
			+ ' Certaines géométries ne sont pas réalisables de manière'
			+' unique, cliquez alors sur ARN impossible.';
			break;
		default : 
			$('#modeEasy').css('color','black');
			$('#modeNormal').css('color','black');
			$('#modeHard').css('color','black');
			return;
	}	
	
	if(mode!=0)
		alert('Vous avez choisi le niveau ' + charMode);
}

function initGame()
{
	running=0;
	quit=0;
	mode=-1;
	drawMode();
	//we clear both canvas
	var canvas0 = document.getElementById('objective');
    var ctx0 = canvas0.getContext('2d');
    var canvas1 = document.getElementById('playerScreen');
    var ctx1 = canvas1.getContext('2d');
    ctx0.clearRect(0, 0, canvas0.width, canvas0.height);
    ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
    //clear the informations' block
    $('#attempts').text('');
    $('#nbPosPlayer').text('');
	$('#nbOfBondsPlayer').text('');
	$('#nbOfBondsObj').text('');
}

function start()
{
	//We chose the molecule to find : answers[goal]
	goal = getRandomNumber();
	attempts=attemptsLimit[goal]+bonus[mode];
	/*We construct the game surface*/
	$('#attempts').css('color','green');
	$('#attempts').text(attempts);
	
	if(mode==0)
	{
		goal=0;
		var str=answersString[0];
		console.log('initial string: '+str);
		var mol = new Molecule(str);
		mol.maxOfBonds();
		var objDrawMol = new DrawMol(mol);
		//~ console.log(mol.structure);
		objDrawMol.draw(false);
		resetCanvas(false);
		
		/***/
		//~ console.log(objDrawMol.mainLoop.print());
		$('#nbOfBondsPlayer').text(mol.nbOfBonds);
		$('#nbPosPlayer').text(mol.nbOptStructures);
		/***///looking for a molecule with only one possibility of 
			 //optimal structure:
		var h=0;
		var newMol;
		var strSave = str;
		while(h<mol.size)
		{	
			for(var j=0; j<4; j++)
			{
				switch (j)
				{
					case 0 :
						str=str.replaceAt(h,"A");
						break;
					case 1 :
						str=str.replaceAt(h,"C");
						break;
					case 2 :
						str=str.replaceAt(h,"G");
						break;
					case 3 :
						str=str.replaceAt(h,"U");
						break;
				}
				newMol = new Molecule(str);
				newMol.maxOfBonds();
				if(newMol.nbOptStructures<mol.nbOptStructures)
				{	
					mol=newMol;
					strSave=str;
				}
			}
			if(newMol.nbOptStructures==1)
					break;
			str=strSave;
			h++;
		}
		
		console.log(str);
		newMol = new Molecule(str);
		newMol.maxOfBonds();
		$('#nbOfBondsObj').text(newMol.nbOfBonds);
		objDrawMol = new DrawMol(newMol);
		objDrawMol.draw(true);
		resetCanvas(true);
		
	}
	else
	{
		$('#nbOfBondsObj').text(answers[goal].nbOfBonds);
		playerMol = new Molecule(partOfMolecules[goal]);
		answers[goal].structure.copy(playerMol.structure);
		
		playerDrawMol= new DrawMol(playerMol);
		playerDrawMol.draw(true);
		resetCanvas(true);
		playerDrawMol.draw(false);
		//~ console.log(answers[goal].structure);
		//~ playerDrawMol.mainLoop.print();
		//~ console.log(playerDrawMol.mainLoop.getMaxX()
			 //~ +' scaling: '+ playerDrawMol.scale
			 //~ +' translation '+ playerDrawMol.translation);
	}
}

function gameOver()
{
	alert('Vous avez perdu en utilisant '+(attemptsLimit[goal]
			+bonus[mode]-attempts)
			+' essais. La structure cible va s\'afficher dans la'
			+' fenêtre objectif. Votre proposition admet '
			+playerMol.nbOptStructures+' structures possibles.'
			+' Cliquez sur ABANDONNER pour commencer une autre partie');
	var objDrawMol = new DrawMol(answers[goal]);
	objDrawMol.draw(true);
	resetCanvas(true);
	resetCanvas(false);
	quit=1;
}

function won()
{
	alert('Félicitations, vous avez gagné en utilisant '+
			(attemptsLimit[goal]+bonus[mode] - attempts)
			+' essais. La structure cible va s\'afficher dans la'
			+' fenêtre objectif. Votre proposition admet '
			+playerMol.nbOptStructures+' structures possibles'
			+' Cliquez sur ABANDONNER pour commencer une autre partie');
	var objDrawMol = new DrawMol(answers[goal]);
	objDrawMol.draw(true);
	resetCanvas(true);
	resetCanvas(false);
	quit=1;
}

function attempt()
{
	if(attempts==2)
			alert('Attention, dernier essai');

	var modBases = new Array(playerMol.modifiableBases.length);
	playerMol.modifiableBases.copy(modBases);
	
	playerMol.isCompleteMolecule=true;
	playerDrawMol.mainLoop.refresh(playerMol);

	if(!playerMol.isCompleteMolecule)
	{
		alert('Toutes les bases n\'ont pas été définies');
		return;
	}
	//undo scaling when the player molecule is complete:
	resetCanvas(false);
	//optimisation of the player molecule:
	playerMol.maxOfBonds();
	//draw the player molecule
	playerDrawMol.draw(false);
	//unable new modifications
	playerMol.modifiableBases = modBases;
	playerDrawMol.mainLoop.setModifiable(modBases);
	
	//playerDrawMol.mainLoop.print();
	
	attempts--;
	
	/*****/
	$('#nbPosPlayer').text(playerMol.nbOptStructures);
	if(playerMol.nbOptStructures==1)
		$('#nbPosPlayer').css('color','green');
	else
		$('#nbPosPlayer').css('color','black');
		
	$('#nbOfBondsPlayer').text(playerMol.nbOfBonds);
	if(playerMol.nbOfBonds==answers[goal].nbOfBonds)
		$('#nbOfBondsPlayer').css('color','green');
	else
		$('#nbOfBondsPlayer').css('color','black');
		
	if(attempts<=3)
		$('#attempts').css('color','orange');
	if(attempts<=1)
		$('#attempts').css('color','red');
	
	$('#attempts').text(attempts);
	/******/

	if(playerMol.structure.equal(answers[goal].structure))
	{
		if(playerMol.nbOptStructures==1 || mode<3)
			won();
		else
		{
			alert("La structure obtenue est la bonne mais n'est pas la"+
				" seule que peut adopter votre séquence.");
		}
	}
	else if(attempts==0)
		gameOver();
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
	for(var i=0; i<answers.length; i++)
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
//for debug mode:
String.prototype.replaceAt=function(index, char) 
{
	var s = this.substr(0, index)+char
		+this.substr(index+char.length);
	return s;
}
