/* Base object */
	
/* Argument nat:
 * 0 : undefined (grey)
 * 1 : adénine (green)
 * 2 : cytosine (orange)
 * 3 : guanine (blue)
 * 4 : uracile (red)
 * boolean == true <=> canvas Objective
 */ 
function Base(rank, nat, rBase)
{
	this.rank = rank;
	this.nat = nat;//nature of the base
	//coordinates :
	this.X;
	this.Y;
	this.r=rBase;//radius
	this.natDef=(nat!=0);//if true when created, can't swap
	
	this.swap = function()
	{
		if(this.natDef)
			return;
		if(this.nat==4)
			this.nat=1;
		else
			this.nat+=1;
		
		this.draw(false);
	}   
      
	this.draw = function(isObjective)
    {
		var canvas;
		if (isObjective)
			canvas = document.getElementById("objective");
		else
			canvas = document.getElementById("playerScreen");
		
		if (!canvas.getContext) return;
		
		var ctx = canvas.getContext("2d");
		ctx.beginPath();
		ctx.strokeStyle = "black";
		ctx.lineWidth = 1;
		// Create gradient
		switch(this.nat)
		{
			case 0 :
				var grd=ctx.createRadialGradient(this.X,this.Y,2,
												this.X,this.Y,this.r+3);
				grd.addColorStop(0,"black");
				grd.addColorStop(1,"grey");
				break;
			case 1 :
				var grd=ctx.createRadialGradient(this.X,this.Y,2,
												this.X,this.Y,this.r+3);
				grd.addColorStop(0,"green");
				grd.addColorStop(1,"white");
				break;
			case 2 :
				var grd=ctx.createRadialGradient(this.X,this.Y,2,
												this.X,this.Y,this.r+3);
				grd.addColorStop(0,"orange");
				grd.addColorStop(1,"white");
				break;
			case 3 :
				var grd=ctx.createRadialGradient(this.X,this.Y,2,
												this.X,this.Y,this.r+3);
				grd.addColorStop(0,"blue");
				grd.addColorStop(1,"white");
				break;
			case 4 :
				var grd=ctx.createRadialGradient(this.X,this.Y,2,
												this.X,this.Y,this.r+3);
				grd.addColorStop(0,"red");
				grd.addColorStop(1,"white");
				break;
			default :
				var grd=ctx.createRadialGradient(this.X,this.Y,2,
												this.X,this.Y,this.r+3);
				grd.addColorStop(0,"black");
				grd.addColorStop(1,"white");
			}			
			
		// Fill with gradient
		ctx.fillStyle=grd;
		ctx.arc(this.X,this.Y,this.r,0,2*Math.PI,false);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
		if(this.nat==0)//or a getMode to avoid global variables
		{
			ctx.font=this.r+'px Georgia';
			ctx.fillStyle='white';
			ctx.fillText(this.rank,(this.X-(this.r/2)),(this.Y+(this.r/3)));
		}
		else
		{
			ctx.font=this.r+'px Georgia';
			ctx.fillStyle='black';
			ctx.fillText(this.rank,(this.X-(this.r/2)),(this.Y+(this.r/3)));
		}
	}
}
