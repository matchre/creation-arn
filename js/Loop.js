/* Loop.js */

/*Arguments:
 *firstBase and lastBase are two Bases which are already defined,
 *for all base in arrayBases, firstBase.rank < base.rank < lastBase.rank
 */
function Loop(firstBase, lastBase)
{
	this.nbBases = 2;//actually nbBases=this.arrayBases.length + 2
	this.firstBase=firstBase;
	this.lastBase=lastBase;
	this.arrayBases = new Array();//List of Bases ordonned by rank
	//List of the Loops which begin on Bases of the current Loop
	this.sons = new Array();
	
	//add at the end a Base in listBase
	this.addBase = function(base)
	{
		this.nbBases++;
		this.arrayBases.push(base);
	}
	
	//add at the end a Loop in this.sons
	this.addLoop = function(loop)
	{
		this.sons.push(loop);
	}
	
	//determine the coordinates of the Bases for the current loop
	//and for his sons recursively
	this.determineCoords = function(rBase, isObjective)
    {	
		if(this.nbBases==2) return;

		var radius = 4*rBase*this.nbBases/(2*Math.PI);
		var teta0 = (2*Math.PI)/this.nbBases;//angle between two Bases

		var deltaX = this.lastBase.X - this.firstBase.X;
		var deltaY = this.lastBase.Y - this.firstBase.Y;
		var dist = 1.0*deltaX*deltaX + deltaY*deltaY;
		if(radius < Math.sqrt(dist/4))
			radius=Math.sqrt(dist/4)+1;
		var a=0;
		
		if(this.nbBases==3)//more beautiful than the general case
		{
			var nbPx = 3*rBase;
			if(deltaX > 0)
			{
				a=deltaY/deltaX;
				this.arrayBases[0].X=Math.floor(
						((this.lastBase.X + this.firstBase.X)/2)
						+a*nbPx/(Math.sqrt(1+a*a)));
				this.arrayBases[0].Y=Math.floor(
						((this.lastBase.Y + this.firstBase.Y)/2)
						-nbPx/(Math.sqrt(1+a*a)));
			}
			else if(deltaX < 0)
			{
				a=deltaY/deltaX;
				this.arrayBases[0].X=Math.floor(
						((this.lastBase.X + this.firstBase.X)/2)
						-a*nbPx/(Math.sqrt(1+a*a)));
				this.arrayBases[0].Y=Math.floor(
						((this.lastBase.Y + this.firstBase.Y)/2)
						+nbPx/(Math.sqrt(1+a*a)));
			}
			else
			{
				if(deltaY>0)
				{
					this.arrayBases[0].X=this.lastBase.X + nbPx;
					this.arrayBases[0].Y=
								(this.lastBase.Y + this.firstBase.Y)/2;
				}
				else
				{
					this.arrayBases[0].X=this.lastBase.X - nbPx;
					this.arrayBases[0].Y=
								(this.lastBase.Y + this.firstBase.Y)/2;
				}
			}
		}
		else
		{
			/*coordinates of the center of the loop: 4 cases:
			 * deltaX > 0
			 * deltaX == 0 & deltaY>0
			 * deltaX < 0
			 * deltaX == 0 & deltaY<0 
			 */
			var xCenter=0;
			var yCenter=0;
			if(deltaX>0)
			{
				a=deltaY/deltaX;
				xCenter=((this.firstBase.X + this.lastBase.X)/2)
							+a*Math.sqrt((radius*radius-(dist/4))/(1+a*a));
				yCenter=((this.firstBase.Y + this.lastBase.Y)/2)
							-Math.sqrt((radius*radius-(dist/4))/(1+a*a));
			}
			else if(deltaX==0 && deltaY>0)
			{
				xCenter=this.firstBase.X + Math.sqrt(radius*radius-(dist/4));
				yCenter=(this.firstBase.Y + this.lastBase.Y)/2;
			}
			else if(deltaX<0)
			{
				a=deltaY/deltaX;
				xCenter=((this.firstBase.X + this.lastBase.X)/2)
							-a*Math.sqrt((radius*radius-(dist/4))/(1+a*a));
				yCenter=((this.firstBase.Y + this.lastBase.Y)/2)
							+Math.sqrt((radius*radius-(dist/4))/(1+a*a));
			}
			else//case deltaX==0 && deltaY<0 
			{
				xCenter=this.firstBase.X - Math.sqrt(radius*radius-(dist/4));
				yCenter=(this.firstBase.Y + this.lastBase.Y)/2;
			}
			
			var teta=Math.acos((this.firstBase.X-xCenter)/radius);
			if(Math.asin((this.firstBase.Y-yCenter)/radius)<0)
				teta = -teta;

			for(var k=0; k<this.arrayBases.length; k++)
			{
				teta += teta0;
				this.arrayBases[k].X=Math.floor(
									xCenter + radius*Math.cos(teta));
				this.arrayBases[k].Y=Math.floor(
									yCenter + radius*Math.sin(teta));
			}
		}
		for(var k=0; k<this.sons.length; k++)
			this.sons[k].determineCoords(rBase, isObjective);
		
	}

	//draw the skeleton of the current Loop and his sons
	this.draw = function(isObjective)
	{
		
		if (isObjective)
			var canvas = document.getElementById("objective");
		else
			var canvas = document.getElementById("playerScreen");
		
		if (!canvas.getContext) return;
		var ctx = canvas.getContext("2d");
		
		ctx.beginPath();
		ctx.moveTo(this.firstBase.X,this.firstBase.Y);	
		ctx.lineTo(this.lastBase.X,this.lastBase.Y);
		ctx.strokeStyle = "blue";
		ctx.lineWidth = 5;
		ctx.stroke();
		ctx.closePath();
		
		if(this.nbBases==2)
		{
			
			ctx.beginPath();
			ctx.moveTo(this.firstBase.X,this.firstBase.Y);	
			//number of pixels between the line and the control point
			//in case of a bond between to successive bases
			var nbPx=4*this.firstBase.r;
			
			var deltaX = this.lastBase.X - this.firstBase.X ;
			var deltaY = this.lastBase.Y - this.firstBase.Y ;
			var dist = 1.0*deltaX*deltaX + deltaY*deltaY;
			//coordinates of the control point
			var xCtrl=0;
			var yCtrl=0;
			var a=0;
			if(deltaX > 0)
			{	
				a=deltaY/deltaX;
				xCtrl=Math.floor(
						((this.lastBase.X + this.firstBase.X)/2)
						+a*nbPx/(Math.sqrt(1+a*a)));
				yCtrl=Math.floor(
						((this.lastBase.Y + this.firstBase.Y)/2)
						-nbPx/(Math.sqrt(1+a*a)));
			}
			else if(deltaX < 0)
			{
				a=deltaY/deltaX;
				xCtrl=Math.floor(
						((this.lastBase.X + this.firstBase.X)/2)
						-a*nbPx/(Math.sqrt(1+a*a)));
				yCtrl=Math.floor(
						((this.lastBase.Y + this.firstBase.Y)/2)
						+nbPx/(Math.sqrt(1+a*a)));
			}
			else
			{
				if(deltaY>0)
				{
					xCtrl=this.lastBase.X + nbPx;
					yCtrl=(this.lastBase.Y + this.firstBase.Y)/2;
				}
				else
				{
					xCtrl=this.lastBase.X - nbPx;
					yCtrl=(this.lastBase.Y + this.firstBase.Y)/2;
				}
			}
			
			
			ctx. quadraticCurveTo(xCtrl, yCtrl,
				this.lastBase.X, this.lastBase.Y);
			ctx.strokeStyle = "black";
			ctx.lineWidth = 2;
			ctx.stroke();
			ctx.closePath();
			return;
		}

		ctx.beginPath();
		ctx.strokeStyle = "black";
		ctx.lineWidth = 2;
		//bond between firstBase and arrayBase[0]
		ctx.moveTo(this.firstBase.X,this.firstBase.Y);	
		ctx.lineTo(this.arrayBases[0].X,this.arrayBases[0].Y);
		for(var j=0; j<this.arrayBases.length-1; j++) 
		{	
			if((this.arrayBases[j].rank+1)==this.arrayBases[j+1].rank)
			//no matter if j and j+1 are bonded we will draw the
			//blue stroke above the black one
			{
			ctx.moveTo(this.arrayBases[j].X,this.arrayBases[j].Y);	
			ctx.lineTo(this.arrayBases[j+1].X,this.arrayBases[j+1].Y);
			}
		}
		
		//bond between lastBase and arrayBase[this.arrayBases.length-1]
		ctx.moveTo(this.lastBase.X,this.lastBase.Y);	
		ctx.lineTo(this.arrayBases[this.arrayBases.length-1].X,
			this.arrayBases[this.arrayBases.length-1].Y);
		ctx.stroke();
		ctx.closePath();
		
		for(var k=0; k<this.sons.length; k++)
			this.sons[k].draw(isObjective);
	}
	//draw the skeleton of the main loop
	this.drawMainLoop= function(isBuckled, isObjective)
	{
		
		if(isBuckled)
		{
			this.draw(isObjective);
			return;
		}
		//No bond between firstBase and lastBase
		if (isObjective)
			var canvas = document.getElementById("objective");
		else
			var canvas = document.getElementById("playerScreen");
		
		if (!canvas.getContext) return;
		
		var ctx = canvas.getContext("2d");
		
		ctx.beginPath();
		ctx.strokeStyle = "black";
		ctx.lineWidth = 2;
		//bond between firstBase and arrayBase[0]
		ctx.moveTo(this.firstBase.X,this.firstBase.Y);	
		ctx.lineTo(this.arrayBases[0].X,this.arrayBases[0].Y);
		for(var j=0; j<this.arrayBases.length-1; j++) 
		{	
			if((this.arrayBases[j].rank+1)==this.arrayBases[j+1].rank)
			{
			ctx.moveTo(this.arrayBases[j].X,this.arrayBases[j].Y);	
			ctx.lineTo(this.arrayBases[j+1].X,this.arrayBases[j+1].Y);
			}	
		}
		//bond between lastBase and arrayBase[this.arrayBases.length-1]
		ctx.moveTo(this.lastBase.X,this.lastBase.Y);	
		ctx.lineTo(this.arrayBases[this.arrayBases.length-1].X,
			this.arrayBases[this.arrayBases.length-1].Y);
		ctx.stroke();
		ctx.closePath();
		
		for(var k=0; k<this.sons.length; k++)
			this.sons[k].draw(isObjective);
	}
	//draw the bases:
	this.drawLoopBases= function(isObjective)
	{
		//lastBase and firstBase are drawn in the parent Loop
		for(var j=0; j<this.arrayBases.length; j++)
			this.arrayBases[j].draw(isObjective);
		
		for(var k=0; k<this.sons.length; k++)
			this.sons[k].drawLoopBases(isObjective);
	}
	
	this.getMaxX=function()
	{	
		var maxX = Math.max(this.firstBase.X, this.lastBase.X);
		for(var j=0; j<this.arrayBases.length; j++)
			maxX=Math.max(this.arrayBases[j].X, maxX);
		for(var k=0; k<this.sons.length; k++)
			maxX=Math.max(this.sons[k].getMaxX(),maxX);
		
		return maxX;
	}
	
	this.getMaxY=function()
	{
		var maxY = Math.max(this.firstBase.Y, this.lastBase.Y);
		for(var j=0; j<this.arrayBases.length; j++)
			maxY=Math.max(this.arrayBases[j].Y, maxY);
		for(var k=0; k<this.sons.length; k++)
			maxY=Math.max(this.sons[k].getMaxY(),maxY);
		
		return maxY;
	}
	
	this.getMinX=function()
	{
		var minX = Math.min(this.firstBase.X, this.lastBase.X);
		for(var j=0; j<this.arrayBases.length; j++)
			minX=Math.min(this.arrayBases[j].X, minX);
		for(var k=0; k<this.sons.length; k++)
			minX=Math.min(this.sons[k].getMinX(),minX);
		
		return minX;
	}
	
	this.getMinY=function()
	{
		var minY = Math.min(this.firstBase.Y, this.lastBase.Y);
		for(var j=0; j<this.arrayBases.length; j++)
			minY=Math.min(this.arrayBases[j].Y, minY);
		for(var k=0; k<this.sons.length; k++)
			minY=Math.min(this.sons[k].getMinY(),minY);
		
		return minY;
	}
	//return a ref to the base which can be modified
	//the closest of (x,y) point
	this.getBase=function(x,y)
	{
		var minDist=50000;//= infinity
		var closest;
		var newDist=distance(this.firstBase.X,this.firstBase.Y,x,y);
		if(minDist > newDist && !this.firstBase.natDef)
		{
			closest=this.firstBase;
			minDist=distance(this.firstBase.X,this.firstBase.Y,x,y);
		}
		newDist=distance(this.lastBase.X,this.lastBase.Y,x,y);
		if(minDist > newDist && !this.lastBase.natDef)
		{
			closest = this.lastBase;
			minDist = newDist;
		}
		for(var j=0; j<this.arrayBases.length; j++)
		{
			newDist =
				distance(this.arrayBases[j].X,this.arrayBases[j].Y,x,y);
			if(minDist > newDist && !this.arrayBases[j].natDef)
			{
				closest = this.arrayBases[j];
				minDist= newDist;
			}
		}
		
		for(var k=0; k<this.sons.length; k++)
		{
			var minSon = this.sons[k].getBase(x,y);
			newDist=minSon.minDist;
			if(minDist > newDist)
			{
				closest = minSon.closest;
				minDist= newDist;
			}
		}
		return {minDist : minDist,closest : closest};
	}
	
	//get the nature of bases modified by the player
	this.refresh = function(mol)
	{
		mol.bases[this.firstBase.rank]=this.firstBase.nat;
		if(this.firstBase.nat==0)
			mol.isCompleteMolecule=false;
		mol.bases[this.lastBase.rank]=this.lastBase.nat;
		if(this.lastBase.nat==0)
			mol.isCompleteMolecule=false;
		
		for(var j=0; j<this.arrayBases.length; j++)
		{
			mol.bases[this.arrayBases[j].rank]=
										this.arrayBases[j].nat;
			if(this.arrayBases[j].nat==0)
				mol.isCompleteMolecule=false;
		}
		for(var k=0; k<this.sons.length; k++)
			this.sons[k].refresh(mol);
	}
	
	//We set the modifiable molecules
	this.setModifiable = function(tab)
	{
		if($.inArray(this.firstBase.rank, tab)!=-1)
			this.firstBase.natDef=false;
		if($.inArray(this.lastBase.rank, tab)!=-1)
			this.lastBase.natDef=false;

		for(var j=0; j<this.arrayBases.length; j++)
		{
			if($.inArray(this.arrayBases[j].rank, tab)!=-1)
				this.arrayBases[j].natDef=false;
		}
		for(var k=0; k<this.sons.length; k++)
			this.sons[k].setModifiable(tab);
	}
	
	this.print = function()
	{
		var s=this.firstBase.rank;
		s+='[';
		for(var j=0; j<this.arrayBases.length-1; j++)
			s+=this.arrayBases[j].rank + ',';
		if(this.arrayBases.length==0)
			s+=']';
		else
			s+=this.arrayBases[this.arrayBases.length-1].rank + ']';
		
		s+=this.lastBase.rank;
		console.log(s);
		console.log(this.sons.length);
		for(var k=0; k<this.sons.length; k++)
			this.sons[k].print();
	}
	
	this.copyBases = function(tabBases)
	{
		tabBases[this.firstBase.rank]
				= new Base(this.firstBase.rank,
					this.firstBase.nat,
					this.firstBase.r);
		tabBases[this.firstBase.rank].X = this.firstBase.X;
		tabBases[this.firstBase.rank].Y = this.firstBase.Y;
		tabBases[this.lastBase.rank]
				= new Base(this.lastBase.rank,
					this.lastBase.nat,
					this.lastBase.r);
		tabBases[this.lastBase.rank].X = this.lastBase.X;
		tabBases[this.lastBase.rank].Y = this.lastBase.Y;
		
		for(var j=0; j<this.arrayBases.length; j++)
		{
			tabBases[this.arrayBases[j].rank]
				= new Base(this.arrayBases[j].rank,
					this.arrayBases[j].nat,
					this.arrayBases[j].r);
			tabBases[this.arrayBases[j].rank].X = this.arrayBases[j].X;
			tabBases[this.arrayBases[j].rank].Y = this.arrayBases[j].Y;
		}
		for(var k=0; k<this.sons.length; k++)
			this.sons[k].copyBases(tabBases);
	}
	
}

//return the catesian distance between two points
function distance(x0,y0,x1,y1)
{
	return Math.sqrt((x1-x0)*(x1-x0)+(y1-y0)*(y1-y0));
}
