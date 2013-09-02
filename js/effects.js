/* effects.js */
/**APPEARANCE OF THE HTML PAGE**/
function initCanvas()//avoid a bug on IE, a better way probably exists
					 //with more CSS... this one is efficient	
{
	var canvas0 = document.getElementById('objective');
	var canvas1 = document.getElementById('playerScreen');
	var canvas2 = document.getElementById('margeCanvas');
	var oW = $('#objective').width();
	var pSW = $('#playerScreen').width();//actually, pSW==oW
	var sH = $('#info').height();
	
	$('#objective').height(oW);
	$('#playerScreen').height(pSW);
	canvas0.height=oW;
	canvas0.width=oW;
	canvas1.height=pSW;
	canvas1.width=pSW;
	$('#marge').css({'height':(pSW + sH) +'px'});
	var iH =((pSW + sH) - 2*$('h2').height()-$('#niv').height())*15/20;
	var hC=Math.max(iH-7, 290);
	$('#divMargeCanvas').height(iH);
	$('#divMargeCanvas').css('overflow','auto');
	$('#margeCanvas').height(hC);
	canvas2.height=hC;
	canvas2.width=$('#margeCanvas').width();
	

}
/**EFFECTS*/
function initEffects()
{
	$("#obj").bind("mouseover", function() {
		$(this).css('color','red');
		$("#objective").css('border-color','red');
	});	
	$("#obj").bind("mouseout", function() {
		$(this).css('color','black');
		$("#objective").css('border-color','black');
	});
	$("#playerScreen").keydown(function(e) {
		keyDown=1;
	});
	$("#playerScreen").keyup(function(e) {
		if(running==0 || quit==1)
			return;
		keyDown=0;
		attempt();
	});
	$("#playerScreen").bind('mouseover',function(e){
		$(this).focus();
	});
	$("#switch").click(function(e){
		if(running==0 || quit==1 || playerMol.nbOptStructures==1)
			return;
		switchMol();
	});
	$("#playerScreen").click(function(e) {
		if(running==0 || quit==1)
			return;
		var x=0;
		var y=0;
		var canvas = document.getElementById("playerScreen");
		var currentElement=this;
		var offsetX = 0;
		var offsetY = 0;
		do
		{
			offsetX += currentElement.offsetLeft;
			offsetY += currentElement.offsetTop;
		}while(currentElement = currentElement.offsetParent)
			
		x=e.pageX - offsetX;
		y=e.pageY - offsetY;
		//~ console.log('x: '+x+' y: '+y);
		
		x = x/playerDrawMol.scale - playerDrawMol.translation[0];
		y = y/playerDrawMol.scale - playerDrawMol.translation[1];
		
		//~ console.log('after scaling x: '+x+' y: '+y);		
		var getMin = playerDrawMol.mainLoop.getBase(x,y);
		getMin.closest.swap();
		//~ console.log('Base: '+getMin.closest.rank +'  '+getMin.minDist
							//~ +' x: '+getMin.closest.X+' y: '
							//~ +getMin.closest.Y);
		
		if(!keyDown)
			attempt();
	});
	$('#levelMenu').click(function() {
		if(quit==1)
		{
			initGame();
		}
		else if(running==0)
			return;
		else if(confirm('Voulez-vous vraiment quitter ?'))
			gameOver();
	});
	$('#restart').click(function() {
		if(confirm('Voulez-vous vraiment quitter et recommencer ce niveau ?'))
		{
				clearInterval(timer);
			if(currentLevel.password=='OOOO')
			{
				alert('Désolé, vous avez perdu !');
			}
			else
			{
			alert('Désolé, vous avez perdu !\n'
				+'Temps : '+(currentLevel.timeLimit-timeLeft)
				+' secondes\n'
				+'Nombre de coups : '+attempts+'\n' 
				+'Votre proposition admet '
				+playerMol.nbOptStructures+' structures possibles.\n'
				+'Mot de passe de ce niveau : '+currentLevel.password);
			}
			initGame()
			$('#selectLevel').css('display','none');
			$('#shadowing').css('display','none');
			start();
		}
	});	
	$('#impossible').click(function() {
	if(confirm('Êtes-vous sûr que cette structure n\'est pas '
				+'réalisable de manière unique ?'))
		{
			if(answer.nbOptStructures!=1)
				won();
			else
				gameOver();
		}
	});
	$('#next').click(function(){
		margeCanvasNum++;
		if(margeCanvasNum==3)
			margeCanvasNum=0;
		drawMargeCanvas();
	});
	$('#previous').click(function(){
		margeCanvasNum--;
		if(margeCanvasNum==-1)
			margeCanvasNum=2;
		drawMargeCanvas();
	});
	$('.rules').click(function(){
		$('#shadowing').css('display', 'block');
		$('#popUp').css('display','block')
		$('#textLevel').css('display','none');
		$('.instructions').css('display','block');
		$('.rules').css('display','none');
		$('#returnGame').css('display', 'none');
		if(running==0)
		{
			$('#returnLevel').css('display', 'inherit');
			$('#returnTextLevel').css('display', 'none');
		}
		else
		{
			$('#returnTextLevel').css('display', 'inherit');
			$('#returnLevel').css('display', 'none');
		}
	});
	$('#returnLevel').click(function(){
		$('.rules').css('display','block');
		$('#popUp').css('display', 'none');
	});
	$('#returnTextLevel').click(function(){
		$('.rules').css('display','block');
		$('.instructions').css('display', 'none');
		$('#textLevel').css('display', 'block');
		$('#returnTextLevel').css('display','none');
		$('#returnGame').css('display','block');
	});
	$('#returnGame').click(function(){
		runTimer(timeLeft);
		$('#shadowing').css('display', 'none');
		$('#popUp').css('display', 'none');
	});
	$('#news').click(function(){
		$('#shadowing').css('display', 'block');
		$('#popUp').css('display', 'block');
		$('.instructions').css('display','none');
		$('#textLevel').css('display','block');
		$('#returnGame').css('display', 'block');
		$('#returnLevel').css('display', 'none');
		$('#returnTextLevel').css('display', 'none');
		clearInterval(timer);
	});
	$('#objective').click(function(){
		alert('Fenêtre objectif.\n'+'La séquence à modifier est dans'+
			' la fenêtre de droite.');
	});
}

/*** margeCanvas ****/
function drawMargeCanvas()
{
	var canvas = document.getElementById("margeCanvas");
	if (canvas.getContext)
		var ctx = canvas.getContext("2d");
	else return;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	var r = canvas.width/9;
	var unBase = new Base(0,0,r);
	var adBase = new Base(0,1,r);
	var cyBase = new Base(1,2,r);
	var guBase = new Base(0,3,r);
	var urBase = new Base(1,4,r);
	
	switch(margeCanvasNum)
	{
		case 0 :
			$('#margeTitle').text('Liaisons autorisées');
			ctx.beginPath();
			ctx.strokeStyle = "blue";
			ctx.lineWidth = 5;
			ctx.moveTo(2*r,2*r);
			ctx.lineTo(6*r,2*r);
			ctx.moveTo(2*r,6*r);
			ctx.lineTo(6*r,6*r);
			ctx.moveTo(2*r,10*r);
			ctx.lineTo(6*r,10*r);
				
			ctx.stroke();
			ctx.closePath();
				
			ctx.font=(r-1)+'px Georgia';
			ctx.fillStyle = 'black';
				
			ctx.fillText('Adénine',r/2,4*r);
			adBase.X=2*r;
			adBase.Y=2*r;
			ctx.fillText('Uracile',5*r,4*r);
			urBase.X=6*r;
			urBase.Y=2*r;
			adBase.draw(-1);
			urBase.draw(-1);
			ctx.font=(r-1)+'px Georgia';
			ctx.fillStyle = 'black';
			ctx.fillText('Guanine',r/2,8*r);
			guBase.X=2*r;
			guBase.Y=6*r;
			ctx.font=(r-1)+'px Georgia';
			ctx.fillText('Cytosine',5*r,8*r);
			cyBase.X=6*r;
			cyBase.Y=6*r;
			guBase.draw(-1);
			cyBase.draw(-1);
			ctx.font=(r-1)+'px Georgia';
			ctx.fillStyle = 'black';
			ctx.fillText('Guanine',r/2,12*r);
			guBase.X=2*r;
			guBase.Y=10*r;
			ctx.font=(r-1)+'px Georgia';
			ctx.fillText('Uracile',5*r,12*r);
			urBase.X=6*r;
			urBase.Y=10*r;
			guBase.draw(-1);
			urBase.draw(-1);
			ctx.fillStyle = 'black';
			break;
		
		case 1 :
			$('#margeTitle').text('Remplissages et contours');
			unBase.X=4*r;
			unBase.Y=2*r;
			unBase.draw(-1);
			ctx.fillStyle='black';
			ctx.font=(r-1)+'px Georgia';
			ctx.fillText('Base à déterminer',0.5*r,4*r);
			
			urBase.X=2*r;
			urBase.Y=6*r;
			cyBase.X=6*r;
			cyBase.Y=6*r;
			cyBase.draw(-1);
			urBase.draw(-1);
			ctx.font=(r-1)+'px Georgia';
			ctx.fillStyle='black';
			ctx.fillText('Des bases non',0.5*r,8*r);
			ctx.fillText('modifiables',0.5*r,9*r);
			
			urBase.X=2*r;
			urBase.Y=11*r;
			urBase.natDef=false;
			cyBase.X=6*r;
			cyBase.Y=11*r;
			cyBase.natDef=false;
			cyBase.draw(-1);
			urBase.draw(-1);
			ctx.font=(r-1)+'px Georgia';
			ctx.fillStyle='black';
			ctx.fillText('Des bases',0.5*r,13*r);
			ctx.fillText('modifiables',0.5*r,14*r);
			break;
			
		case 2 :
			$('#margeTitle').text('Couleur des liaisons');
			ctx.beginPath();
			ctx.lineWidth = 2;
			ctx.strokeStyle = "black";
			ctx.moveTo(2*r,2*r);
			ctx.lineTo(6*r,2*r);
			ctx.stroke();
			ctx.closePath();
			
			cyBase.X=2*r;
			cyBase.Y=2*r;
			cyBase.natDef=false;
			guBase.X=6*r;
			guBase.Y=2*r;
			guBase.natDef=true;
			cyBase.draw(-1);
			guBase.draw(-1);
			
			ctx.font=(r-1)+'px Georgia';
			ctx.fillStyle='black';
			ctx.fillText('Le squelette',0.5*r,4*r);
			ctx.fillText('de la molécule',0.5*r,5*r);
			
			ctx.beginPath();
			ctx.lineWidth = 5;
			ctx.strokeStyle = "blue";
			ctx.moveTo(2*r,7*r);
			ctx.lineTo(6*r,7*r);
			ctx.stroke();
			ctx.closePath();
		
			cyBase.X=2*r;
			cyBase.Y=7*r;
			cyBase.natDef=false;
			guBase.X=6*r;
			guBase.Y=7*r;
			guBase.natDef=true;
			cyBase.draw(-1);
			guBase.draw(-1);
			
			ctx.font=(r-1)+'px Georgia';
			ctx.fillStyle='black';
			ctx.fillText('Une liaison',0.5*r,9*r);
			ctx.fillText('comforme',0.5*r,10*r);
			ctx.fillText('à l\'objectif',0.5*r,11*r);
			
			ctx.beginPath();
			ctx.lineWidth = 5;
			ctx.strokeStyle = "red";
			ctx.moveTo(2*r,13*r);
			ctx.lineTo(6*r,13*r);
			ctx.stroke();
			ctx.closePath();
			
			cyBase.X=2*r;
			cyBase.Y=13*r;
			cyBase.natDef=false;
			guBase.X=6*r;
			guBase.Y=13*r;
			guBase.natDef=true;
			cyBase.draw(-1);
			guBase.draw(-1);
			
			ctx.font=(r-1)+'px Georgia';
			ctx.fillStyle='black';
			ctx.fillText('Une liaison',0.5*r,15*r);
			ctx.fillText('non conforme',0.5*r,16*r);
			ctx.fillText('à l\'objectif',0.5*r,17*r);
			break;
	}
}
