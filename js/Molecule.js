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
				alert('La molécule proposée contient au moins une erreur');
		}
	}
	
	/* A structure with a maximum of bonds : array of integers :
	 * -1 : no bond with this base
	 * i : bound with i
	 */ 
	this.structure = new Array(this.size);
	this.nbOfBonds = 0;//number of bond max
	this.nbOptStructures = 0;//number of structure with a max of bond
	
/***************/	
	
	//determine the max of bonds and launch this.buildOptStructure()
	this.maxOfBonds = function()
	{
		var M = new Array(this.size);//M[i][n]=max of bonds between i and n;
		var S = new Array(this.size);//S[i][n]=with which base n is bonded
									 //to reach M[i][n] and -1 if none.
		var nbPos = new Array(this.size);//nbPos[i][n]=number of
										 //possibilities to get M[i][n]
		var mijMem=0;					 
		for (var i = 0; i<this.size; i++)
		{
			M[i]= new Array(this.size);
			S[i]= new Array(this.size);
			nbPos[i]= new Array(this.size);
			for (var j = 0; j<this.size; j++)
				S[i][j]=-1;
		}

		for(var i = 0; i < this.size; i++)
			this.structure[i]=-1;
		
		if (!this.isCompleteMolecule) return;//we cannot do anything
		
		
		for(var n=0; n<this.size; n++)
		{
			M[n][n]=0;
			nbPos[n][n]=1;
			for(var i = n-1; i>=0; i--)//n>0 in this loop
			{
				M[i][n]=M[i+1][n];
				nbPos[i][n]=nbPos[i+1][n];
				S[i][n]=S[i+1][n];//n bonded to S[i+1][n]
				
				//case of a bond between i and n :
				if(this.isBondPossible(i,n)) 
				{
					if(i<n-2 && M[i+1][n-1]+1 >= M[i][n])
					{
						if(M[i+1][n-1]+1 > M[i][n])
						{
							M[i][n] = M[i+1][n-1]+1;
							nbPos[i][n]=nbPos[i+1][n-1];
							S[i][n] = i;
						}
						else
							nbPos[i][n]+=nbPos[i+1][n-1];

					}
					else if(i==n-2)
					{
						if( M[i+1][n]==0 && M[i][i+1]==0)
						//no bond possible exept between n-2 and n 
						{			   			   
							M[i][n] = 1;
							nbPos[i][n]=1;
							S[i][n] = i;
						}
						else
							nbPos[i][n]=2;
					}
					else if(i==n-1)
					{
						M[i][n]=1;
						nbPos[i][n]=1;
						S[i][n] = i;
					}
				}
				mijMem=0;
				//general case :
				for(var j=i+1; j<n-1; j++)
				{	
					if(this.isBondPossible(j,n)
						&& (M[i][j-1] + M[j+1][n-1] +1) >= M[i][n])
					{
						if((M[i][j-1] + M[j+1][n-1] +1) > M[i][n])
						{
							M[i][n] = M[i][j-1] + M[j+1][n-1] +1;
							nbPos[i][n] = nbPos[i][j-1]*nbPos[j+1][n-1];
							S[i][n] = j;
						}
						else
							nbPos[i][n] = nbPos[i][j-1]*nbPos[j+1][n-1]
										 + nbPos[i][n];
							
					}
					else if(M[i][j]+M[j+1][n]==M[i][n] && M[i][j]!=mijMem)
					{
						mijMem=M[i][j];
						nbPos[i][n]+=nbPos[i][j]*nbPos[j+1][n];
					}
				}
				
				if(M[i][n]<=M[i][n-1])
				{
					if(M[i][n]<M[i][n-1])
					{
						S[i][n]=-1;
						M[i][n]=M[i][n-1];
						nbPos[i][n]=nbPos[i][n-1];
					}
					else
						nbPos[i][n]=nbPos[i][n-1];
				}
			}
		}
		//~ console.log(M);
		//~ console.log(nbPos);
		this.nbOptStructures=nbPos[0][this.size-1];
		this.nbOfBonds = M[0][this.size-1];
		this.buildOptStructure(S,0,this.size-1);
	}
	
	//from M et S build an optimal structure
	this.buildOptStructure = function(S,i,j)
	{
		if(i>=j) return;
		var k = S[i][j];
		if(k>j || (k<i && k!=-1))
			console.log('Houston we got a problem:'+k);
		if(k==-1)
			this.buildOptStructure(S, i, j-1);
		else if(k==i)
		{	
			this.structure[i]=j;
			this.structure[j]=i
			this.buildOptStructure(S, i+1, j-1);
		}
		else
		{
			this.structure[k]=j;
			this.structure[j]=k
			this.buildOptStructure(S, k+1, j-1);
			this.buildOptStructure(S, i, k-1);
		}
	}
	
	this.isBondPossible = function(i,j) 
	{
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
}
