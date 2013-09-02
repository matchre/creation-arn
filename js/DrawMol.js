/* DrawMol.js */

//to change the drawing scale just change the radius rBase
//argument : an object Molecule
function DrawMol(mol)
{	
	this.mol=mol;
	this.mainLoop;//defined in draw()
	this.scale;//defined in draw()
	this.translation = new Array(2);//defined in draw()
	this.rBase=0;
	/*****/
		
	this.build = function(isObjective)
	{
		var canvas;
		if(isObjective)
			canvas = document.getElementById("objective");
		else
			canvas = document.getElementById("playerScreen");
			
		if (canvas.getContext)
			var ctx = canvas.getContext("2d");
		else return;
		
		this.rBase = canvas.width/17;//because of the rescaling, 
							//rBase controls the appearance of the bases
		var firstBase = new Base(0, this.mol.bases[0],this.rBase);
		var lastBase = new Base(this.mol.size-1, 
						this.mol.bases[this.mol.size-1],this.rBase);
		
		this.mainLoop = new Loop(firstBase,lastBase);
		
		/////////WE BUILD THE LOOPS////////////
		var k=1;
		
		if(this.mol.structure[0]!=-1 &&
			this.mol.structure[0]!=this.mol.size-1)
		{
			var newBase = new Base(this.mol.structure[0],
							this.mol.bases[mol.structure[0]],this.rBase);
			this.mainLoop.addBase(newBase);
			var newLoop = new Loop(firstBase,newBase);
			this.fillLoop(newLoop, 0);
			this.mainLoop.addLoop(newLoop);
			k=this.mol.structure[0]+1;
		}
		
		while(k < this.mol.size-1)
		{
			var newBase = new Base(k,this.mol.bases[k],this.rBase);
			this.mainLoop.addBase(newBase);
			//bond between k and another Base (not the last one)
			if(this.mol.structure[k]>k &&
				this.mol.structure[k]<(this.mol.size-1))
				{
					var newBase1 = new Base(this.mol.structure[k],
						this.mol.bases[this.mol.structure[k]],this.rBase);
					this.mainLoop.addBase(newBase1);
					var newLoop = new Loop(newBase,newBase1);
					this.fillLoop(newLoop, k);
					this.mainLoop.addLoop(newLoop);
					k=this.mol.structure[k]+1;
				}
			//bond between the lastBase and k
			else if(this.mol.structure[k]==(this.mol.size-1))
			{
				var newLoop = new Loop(newBase,lastBase);
				this.fillLoop(newLoop, k);
				this.mainLoop.addLoop(newLoop);
				break;
			}
			
			else//no bond with k
				k++;
		}
		
		firstBase.X=canvas.width/2;
		firstBase.Y=canvas.height/2;
		lastBase.X=canvas.width/2;
		lastBase.Y=canvas.height/2 + 4*this.rBase;
		this.mainLoop.determineCoords(this.rBase, isObjective);
		
		//We clear the canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		//We extend the molecule as much as possible:
		var maxX = this.mainLoop.getMaxX()+this.rBase;
		var maxY = this.mainLoop.getMaxY()+this.rBase;
		var minX = this.mainLoop.getMinX()-this.rBase;
		var minY = this.mainLoop.getMinY()-this.rBase;
		this.scale = Math.min((canvas.width-15-2*this.rBase)/(maxX-minX),
							 (canvas.height-15-2*this.rBase)/(maxY-minY));
		this.translation[0]= 25-minX;
		this.translation[1]= 25-minY;
				
	}
	
	this.draw=function(isObjective, struct)
	{
		var canvas;
		if(isObjective)
			canvas = document.getElementById("objective");
		else
			canvas = document.getElementById("playerScreen");
			
		if (canvas.getContext)
			var ctx = canvas.getContext("2d");
		else return;
		
		ctx.scale(this.scale,this.scale);//must be before translate
		ctx.translate(this.translation[0], this.translation[1]);
		//~ ctx.setTransform(this.scale, 0,0,this.scale,
			//~ this.translation[0], this.translation[1]);
			//does not work properly
		//We draw the skeleton :
		this.mainLoop.drawMainLoop(
			(this.mol.structure[0]==(this.mol.size-1)),isObjective,
			this.getRightBonds(struct));
		//We draw the bases:
		var isObj=0;
		if(!isObjective)
			isObj=1;
		this.mainLoop.firstBase.draw(isObj);
		this.mainLoop.lastBase.draw(isObj);
		this.mainLoop.drawLoopBases(isObjective);
	}
	//rank is the rank of the first base of the Loop loop
	this.fillLoop=function(loop,rank)
	{
		var h=rank+1;
		while(h<this.mol.structure[rank])
		{
			var newBase = new Base(h,this.mol.bases[h], this.rBase);
			loop.addBase(newBase);
			//bond between k and another Base (not the last one)
			if(this.mol.structure[h]>h)
			{
			var newBase1 = new Base(this.mol.structure[h],
				this.mol.bases[this.mol.structure[h]],this.rBase);
			loop.addBase(newBase1);
			
			var newLoop = new Loop(newBase,newBase1);
			this.fillLoop(newLoop,h);
			loop.addLoop(newLoop);
			h=mol.structure[h]+1;
			}
			else//no bond with k
				h++;
		}
	}
	//return a list of the bonds in this.mol which are the same as
	//struct (a bond is identified with his the first base)
	this.getRightBonds = function(struct)
	{
		var listRight=new Array();
		if(struct===undefined)
			return listRight;
		for(var i=0; i<mol.size; i++)
		{
			if(this.mol.structure[i]>i
				&& this.mol.structure[i]==struct[i] )
			{
				listRight.push(i);
			}
		}
		return listRight;
	}
}
