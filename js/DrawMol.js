/* DrawMol.js */

//to change the drawing scale just change the radius rBase
//argument : an object Molecule
function DrawMol(mol)
{	
	this.mol=mol;
	this.mainLoop;//defined in draw()
	this.scale;//defined in draw()
	this.translation = new Array(2);//defined in draw()
	var rBase=0;
	/*****/
		
	this.draw = function(isObjective)
	{
		var canvas;
		if(isObjective)
			canvas = document.getElementById("objective");
		else
			canvas = document.getElementById("playerScreen");
			
		if (canvas.getContext)
			var ctx = canvas.getContext("2d");
		else return;
		//We clear the canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		rBase = canvas.width/17;//because of the rescaling, 
							//rBase controls the appearance of the bases
		var firstBase = new Base(0, this.mol.bases[0],rBase);
		var lastBase = new Base(this.mol.size-1, 
						this.mol.bases[this.mol.size-1],rBase);
		
		this.mainLoop = new Loop(firstBase,lastBase);
		
		/////////WE BUILD THE LOOPS////////////
		var k=1;
		
		if(this.mol.structure[0]!=-1 &&
			this.mol.structure[0]!=this.mol.size-1)
		{
			var newBase = new Base(this.mol.structure[0],
							this.mol.bases[mol.structure[0]],rBase);
			this.mainLoop.addBase(newBase);
			var newLoop = new Loop(firstBase,newBase);
			this.fillLoop(newLoop, 0);
			this.mainLoop.addLoop(newLoop);
			k=this.mol.structure[0]+1;
		}
		
		while(k < this.mol.size-1)
		{
			var newBase = new Base(k,this.mol.bases[k],rBase);
			this.mainLoop.addBase(newBase);
			//bond between k and another Base (not the last one)
			if(this.mol.structure[k]>k &&
				this.mol.structure[k]<(this.mol.size-1))
				{
					var newBase1 = new Base(this.mol.structure[k],
						this.mol.bases[this.mol.structure[k]],rBase);
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
		
		/////////WE DRAW THE MOLECULE////////////
		firstBase.X=canvas.width/2;
		firstBase.Y=canvas.height/2;
		lastBase.X=canvas.width/2;
		lastBase.Y=canvas.height/2 + 4*rBase;
		this.mainLoop.determineCoords(rBase, isObjective);
		//We extend the molecule as much as possible:
		var maxX = this.mainLoop.getMaxX()+rBase;
		var maxY = this.mainLoop.getMaxY()+rBase;
		var minX = this.mainLoop.getMinX()-rBase;
		var minY = this.mainLoop.getMinY()-rBase;
		this.scale = Math.min(0.95*canvas.width/(maxX-minX),
							 0.95*canvas.height/(maxY-minY));
		this.translation[0]= 7-minX;
		this.translation[1]= 7-minY;
		ctx.scale(this.scale,this.scale);//must be before translate
		ctx.translate(this.translation[0], this.translation[1]);
		//~ ctx.setTransform(this.scale, 0,0,this.scale,
			//~ this.translation[0], this.translation[1]);
			//does not work properly
		
		
		//We draw the skeleton :
		this.mainLoop.drawMainLoop(
			(this.mol.structure[0]==(this.mol.size-1)),isObjective);
		//We draw the bases:
		firstBase.draw(isObjective);
		lastBase.draw(isObjective);
		this.mainLoop.drawLoopBases(isObjective);
	}
	
	//rank is the rank of the first base of the Loop loop
	this.fillLoop=function(loop,rank)
	{
		var h=rank+1;
		while(h<this.mol.structure[rank])
		{
			var newBase = new Base(h,this.mol.bases[h] , rBase);
			loop.addBase(newBase);
			//bond between k and another Base (not the last one)
			if(this.mol.structure[h]>h)
			{
			var newBase1 = new Base(this.mol.structure[h],
				this.mol.bases[this.mol.structure[h]],rBase);
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
}
