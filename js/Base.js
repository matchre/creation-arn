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
	this.natDef=(nat!=0);//if true, can't swap
	
	this.swap = function()
	{
		if(this.natDef)
			return;
		if(this.nat==4)
			this.nat=1;
		else
			this.nat+=1;
		
		this.draw(1);
	}   
      
	this.draw = function(isObjective)
    {
		var canvas;
		if (isObjective==0)
			canvas = document.getElementById("objective");
		else if(isObjective==1)
			canvas = document.getElementById("playerScreen");
		else
			canvas = document.getElementById("margeCanvas");

		if (!canvas.getContext) return;
		
		var ctx = canvas.getContext("2d");
		ctx.beginPath();
		
		/**Change here the appearance of a modifiable Base:
		 * first the stroke and then the color of the filling : **/
		
		if(this.natDef)
		{
			ctx.strokeStyle = "white";
			ctx.lineWidth = 1;
		}
		else
		{
			ctx.strokeStyle = "black";
			ctx.lineWidth = 3;
		}
		
		// Create gradient
		var grd=ctx.createRadialGradient(this.X,this.Y,2,
												this.X,this.Y,this.r+3);
		var a=0;
		var b=1;

		if(this.natDef)
		{
			a=1;
			b=0;
		}
		switch(this.nat)
		{
			case 0 :		
				grd.addColorStop(a,"black");
				grd.addColorStop(b,"grey");
				break;
			case 1 :
				grd.addColorStop(a,"green");
				grd.addColorStop(b,"white");
				break;
			case 2 :
				grd.addColorStop(a,"orange");
				grd.addColorStop(b,"white");
				break;
			case 3 :
				grd.addColorStop(a,"blue");
				grd.addColorStop(b,"white");
				break;
			case 4 :
				grd.addColorStop(a,"red");
				grd.addColorStop(b,"white");
				break;
			default :
				grd.addColorStop(a,"black");
				grd.addColorStop(b,"white");
		}
		// Fill with gradient
		ctx.fillStyle=grd;
		ctx.arc(this.X,this.Y,this.r,0,2*Math.PI,false);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
		ctx.font=this.r+'px Georgia';
		(this.nat==0)?ctx.fillStyle='white':ctx.fillStyle='black';
		ctx.fillText((this.rank+1),(this.X-(this.r/2)),(this.Y+(this.r/3)));
		
	}

}
