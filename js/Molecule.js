/*molecule*/

//Molecule from a string like : "ACGUACGUO" (O for undefined)
function Molecule(str)
{
	if(str===undefined)
	{
		alert('Chaîne de caractères non définie');
		return;
	}
	this.isCompleteMolecule=true;//==false if there is at least one O
	this.size=str.length;//size of the ARN molecule(number of bases)
	//array of the ranks of modifiable bases:
	this.modifiableBases = new Array();
	/* array of integers :
	 * 0 : undefined (grey)
	 * 1 : adénine (green)
	 * 2 : cytosine (orange)
	 * 3 : guanine (blue)
	 * 4 : uracile (red)
	 */ 
	this.bases = new Array(this.size);
	var c;
	for (var i = 0; i < this.size; i++)
	{
		c=str.charAt(i);
		switch(c)
		{
			case 'O' :
				this.modifiableBases.push(i);
				this.isCompleteMolecule=false;
				this.bases[i]=0;
				break;
			case 'A' :
				this.bases[i]=1;
				break;
			case 'C' :
				this.bases[i]=2;
				break;
			case 'G' :
				this.bases[i]=3;
				break;
			case 'U' :
				this.bases[i]=4;
				break;
			default :
				this.isCompleteMolecule=false;
				console.log('La molécule proposée contient au '+
				'moins une erreur' + str);
		}
	}
	
	/* A structure with a maximum of bonds : array of integers :
	 * -1 : no bond with this base
	 * i : bound with i
	 */ 
	this.structure = new Array(this.size);
	this.nbOfBonds = 0;//number of bond max
	this.nbOptStructures = 0;//number of structure with a max of bond
	this.listOptStructures = new Array();
/***************/	
	
	//determine the max of bonds and launch this.buildOptStructure()
	this.maxOfBonds = function()
	{
		var M = new Array(this.size);//M[i][n]=max of bonds between i and n;
		for (var i = 0; i<this.size; i++)
			M[i]= new Array(this.size);
			
		if (!this.isCompleteMolecule) return;//we cannot do anything
		
		for(var n=0; n<this.size; n++)
		{
			M[n][n]=0;
			for(var i=n-1; i>=0; i--)//n>0 in this loop
			{
				M[i][n]=M[i+1][n];
				
				//case of a bond between i and n :
				if(this.isBondPossible(i,n)) 
				{
					if(i<n-2 && M[i+1][n-1]+1 > M[i][n])
						M[i][n] = M[i+1][n-1]+1;
						
					else if(i==n-2 && M[i+1][i+2]==0)		   
						M[i][n] = 1;
					else if(i==n-1)
						M[i][n]=1;
				}			
				//general case :
				for(var j=i+1; j<n-1; j++)
				{	
					if(this.isBondPossible(j,n)
						&& (M[i][j-1] + M[j+1][n-1] +1) > M[i][n])
						M[i][n] = M[i][j-1] + M[j+1][n-1] +1;
				}
				
				if(M[i][n]<M[i][n-1])//no bond with n
					M[i][n]=M[i][n-1];
			}
		}
		this.nbOfBonds = M[0][this.size-1];
		this.listOptStructures=this.buildOptStructures(M,0,this.size-1);
		for(var k=0; k<this.listOptStructures; k++)
			if(this.listOptStructures[k].length!=this.size)
				console.log("Houston, houstin we got a "+ this.listOptStructures[k]);
		this.nbOptStructures = this.listOptStructures.length;
		this.structure=this.listOptStructures.shift();
	}
	
	this.switchMol=function()
	{
		this.listOptStructures.push(this.structure);
		this.structure=this.listOptStructures.shift();
	}
	
	//build this.listOptStructures
	this.buildOptStructures= function(M,i,j)
	{
		var listStruct = new Array();
		var notBonded = [-1];
		//~ if(this.listOptStructures<MAX_OPT_STRUCTURES)
		if(i==j)
		{
			listStruct.unshift(notBonded);
			return listStruct;
		}
		if(j<i)
			return listStruct;
		//general case
		if(M[i][j]==M[i+1][j])
		{
			var listA = this.buildOptStructures(M,i+1,j);
			for(var v=0; v < Math.min(listA.length,MAX_OPT_STRUCTURES)
				; v++)
				listStruct.unshift(notBonded.concat(listA[v]));
		}
		for(var k=i+2; k<j; k++)
		{
			if(this.isBondPossible(i,k))
			{//if true, we are sure i,k<this.size
				if(M[i][j]==1+M[i+1][k-1]+M[k+1][j])
				{
					var list0 = this.buildOptStructures(M,i+1,k-1);
					for(var v=0;
						v<Math.min(list0.length,MAX_OPT_STRUCTURES);
						v++)
					{
						var list1=this.buildOptStructures(M,k+1,j);
						for(var w=0;
							w<Math.min(list1.length,MAX_OPT_STRUCTURES);
							w++)
						{
							var tabk=[k];
							var tabi=[i];
							listStruct.unshift(tabk.concat(list0[v],
					 			tabi, list1[w]));
						}
					}
				}
			}
		}
		if(this.isBondPossible(i,i+1) && j>(i+1))
		{//the case k=i+1 hereabove
			if(M[i][j]==1+M[i+2][j])
			{
				var listB = this.buildOptStructures(M,i+2,j);
				for(var v=0;v<Math.min(listB.length,MAX_OPT_STRUCTURES);
					v++)
				{
					var tB=[i+1, i];
					listStruct.unshift(tB.concat(listB[v]));
				}
			}
		}
		if(this.isBondPossible(i,j))
		{//the case k=j hereabove
			if(j==i+1)
			{
				var t=[j,i];
				listStruct.unshift(t);
			}
			else if(M[i][j]==1+M[i+1][j-1])
			{
				var list = this.buildOptStructures(M,i+1,j-1);
				for(var v=0;v<Math.min(list.length,MAX_OPT_STRUCTURES);
					v++)
				{
					var tabj=[j];
					var tabi=[i];
					listStruct.unshift(tabj.concat(list[v],
						tabi));
				}
			}
		}
		return listStruct;
	}
	
	this.isBondPossible = function(i,j)
	{
		if(j>=this.size || i>=this.size || i<0 || j<0)
			return false;
		switch(this.bases[i])
		{
			case 0 :
				return true;
			case 1 :
				return (this.bases[j]==4);
			case 2 :
				return (this.bases[j]==3);
			case 3 :
				return (this.bases[j]==2 || this.bases[j]==4);
			case 4 :
				return (this.bases[j]==1 || this.bases[j]==3);
			default :
				alert('erreur dans isBondPossible pour i=' + this.bases[i]);
				return false;
		}
	}
	
	this.setNbBondsFromStruct = function()
	{
		this.nbOfBonds=0;
		for(var k=0; k<this.size; k++)
		{
			if(this.structure[k]>k)
				this.nbOfBonds++;
		}
	}
}
