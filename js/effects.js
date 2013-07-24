/* effects.js */
/**APPEARANCE OF THE HTML PAGE**/
function initCanvas()//avoid a bug on IE, a better way probably exists
					 //with more CSS... this one is efficient	
{
	var canvas0 = document.getElementById('objective');
	var ctx0 = canvas0.getContext('2d');
	var canvas1 = document.getElementById('playerScreen');
	var ctx1 = canvas1.getContext('2d');
	var oW = $('#objective').width();
	var pSW = $('#playerScreen').width();//actually, pSW==oW
	var sH = $('#start').height();
	
	$('#objective').height(oW);
	$('#playerScreen').height(pSW);
	canvas0.height=oW;
	canvas0.width=oW;
	canvas1.height=pSW;
	canvas1.width=pSW;
	$('#marge').css({'height':(pSW + sH) +'px'});
	var iH =((pSW + sH) - 2*$('h2').height() - $('#niv').height())*15/20;
	$('#instructions').css({'height':iH+'px'});
	//$('#info').css({'height':sH+'px'});
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
	$("#ad").bind("mouseover", function() {
		$(this).css('color','green');
	});
	$("#ad").bind("mouseout", function() {
		$(this).css('color','black');
	});
	$("#cy").bind("mouseover", function() {
		$(this).css('color','orange');
	});
	$("#cy").bind("mouseout", function() {
		$(this).css('color','black');
	});
	$("#gu").bind("mouseover", function() {
		$(this).css('color','blue');
	});
	$("#gu").bind("mouseout", function() {
		$(this).css('color','black');
	});
	$("#ur").bind("mouseover", function() {
		$(this).css('color','red');
	});
	$("#ur").bind("mouseout", function() {
		$(this).css('color','black');
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
			offsetX += currentElement.offsetLeft
						-currentElement.scrollLeft;
			offsetY += currentElement.offsetTop
						-currentElement.scrollTop;
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
	});
	$("#instructions").bind("mouseover", function() {
		if(running==1)
			return;
		var canvas;
		canvas = document.getElementById("objective");
		if (canvas.getContext)
			var ctx = canvas.getContext("2d");
		else return;
		var r = canvas.width/18;
		var unBase = new Base(0,0,r);
		var adBase = new Base(0,1,r);
		var cyBase = new Base(1,2,r);
		var guBase = new Base(0,3,r);
		var urBase = new Base(1,4,r);
		
		ctx.beginPath();
		ctx.strokeStyle = "blue";
		ctx.lineWidth = 2;
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
		adBase.draw(true);
		urBase.draw(true);
		ctx.fillText('Guanine',r/2,8*r);
		guBase.X=2*r;
		guBase.Y=6*r;
		ctx.fillText('Cytosine',5*r,8*r);
		cyBase.X=6*r;
		cyBase.Y=6*r;
		guBase.draw(true);
		cyBase.draw(true);
		ctx.fillText('Guanine',r/2,12*r);
		guBase.X=2*r;
		guBase.Y=10*r;
		ctx.fillText('Uracile',5*r,12*r);
		urBase.X=6*r;
		urBase.Y=10*r;
		guBase.draw(true);
		urBase.draw(true);
		ctx.fillText('Base à définir',3*r+(r/2),14*r+(r/2));
		unBase.X=2*r;
		unBase.Y=14*r;
		unBase.draw(true);
		
		ctx.font=(r+3)+'px Georgia';
		ctx.strokeText('Les liaisons possibles',canvas.width/3,17*r);
	});
	$("#instructions").bind("mouseout", function() {
		if(running==1)
			return;
		var canvas;
		canvas = document.getElementById("objective");
		if (canvas.getContext)
			var ctx = canvas.getContext("2d");
		else return;
		//We clear the canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	});
}	
