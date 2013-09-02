/*Level*/
//You cannot specify an objective structure and give a
//molecule solution : the program will construct the optimal structure
//by itself.

//Level.num : from 1 to levels.length, Level0.num<Level1.num means 
//Level1 is harder than Level0

//OOOO password is reserved for the tutorial levels. It identify them

//for one optimum only write:
//  one structure only:{possible} if the ARN sequence is possible
//  one structure only:{not possible} if not (good answer will be : 
//    "ARN IMPOSSIBLE"only)

function initLevels()
{
	//AJAX -> ok for chrome if not a local access
	$.get("levels.txt", function(data){
			var levelArray =data.split('}\n\n');
			for(var k=0; k<levelArray.length; k++)
				levels.push(new Level(levelArray[k], k%4));
			
			 for(var i=0; i<levels.length; i++)
				levels[i].drawButtonLevel();
			initGame();
		}, 'text');
	
	
}

function getLevel(num)
{
	var maxNum=0;
	var indexMaxNum=0;
	for(var k=0; k<levels.length; k++)
	{
		if(levels[k].num==num)
			return levels[k];
		else if(maxNum < levels[k].num)
		{
			maxNum=levels[k].num;
			indexMaxNum=k;
		}
	}	
	return levels[indexMaxNum];
}
//col is a number to fix the button level color
Level = function(str, col)
{
	var tab = ['orange','blue','red','green'];
	this.color=tab[col];
	this.password;
	this.name='';
	this.num=-1;
	this.timeLimit=-1;
	this.comments='';
	this.oneOptStructOnly=-1;//-1 -> no; 0 -> yes but not possible
							 //1 -> yes and possible
	this.authorised = false;
	this.targetStructure;//".", "(" and ")"
	this.solution='';
	this.incompleteSeq;
	
	this.stringToStructure=function(string)
	{
		var listLeftBracket = new Array();
		var l=0;
		if(this.solution!='')
			return;
		this.targetStructure=new Array(string.length);
		for(var i=0; i<string.length; i++)
		{
			switch(string.charAt(i))
			{
				case '.' :
					this.targetStructure[i]=-1;
					break;
				case '(' :
					listLeftBracket.push(i);
					break;
				case ')' :
					if(listLeftBracket.length==0)
					{
						console.log("Non valid structure error at:"+i);
						return;
					}
					l=listLeftBracket.pop();
					this.targetStructure[i]=l;
					this.targetStructure[l]=i;
					break;
				default :
					console.log("Non valid character at"+i);
					return;
			}
			
		}
		
	}
	
	var infos=str.split('}\n');
	for(var i=0; i<infos.length; i++)
	{
		var infoLine = infos[i].split('{');
		switch(infoLine[0])
		{
			case "number:" :
				this.num=parseInt(infoLine[1]);
				break;
			case "name:" : 
				this.name=infoLine[1];
				break;
			case "password:" :
				this.password=infoLine[1];
				break;
			case "time:" :
				this.timeLimit=parseInt(infoLine[1]);
				break;
			case "comments:" :
				this.comments=infoLine[1];
				break;
			case "one structure only:" :
				switch (infoLine[1])
				{
					case "possible" :
						this.oneOptStructOnly=1;
						break;
					case "not possible" :
						this.oneOptStructOnly=0;
						break;
					default :
						console.log('invalid entry at : one structure'+
							' only');
				}
				break;
			case "structure:" :
				this.stringToStructure(infoLine[1]);
				break;
			case "solution:":
				this.solution = infoLine[1];
				break;
			case "incomplete sequences:" :
				this.incompleteSeq = infoLine[1].split(',\n');
				break;
			case '' :
				break;
			default :
				console.log("Error in level file: "+ infoLine[0]);
		}
	}
	
	this.authorised=(this.password=='OOOO');

	this.check=function()
	{
		if(this.num==-1)
			console.log('num of '+this.name+' undefined');
		
		var l= (this.solution===''?this.targetStructure.length:
			this.solution.length);
		for(var k=0; k<this.incompleteSeq.length; k++)
		{
			if(this.incompleteSeq[k].length!=l)
				console.log(k+' incomplete sequence does not have' +
				' the right length '+this.incompleteSeq[k].length+
				' instead of '+l);
		}
	}
	this.check();
	
	this.drawButtonLevel=function()
	{
		$('<input>',{
			type: 'button',
			class: 'levelButton',
			id: this.num,
			value: this.num+'\n'+this.name
		}).appendTo('#selectLevel');
		
		$("#"+this.num).css('background-color',this.color);
		$("#"+this.num).css('margin-top','20px');
		
		if(this.authorised)
			$("#"+this.num).css('background-color', this.color);
		else
			$("#"+this.num).css('background-color', 'grey');
			
		var l=this;//In the event, we cannot refer to this !
		$("#"+l.num).click(function() {
			
			if(l.authorised)
			{
				$('#selectLevel').css('display','none');
				$('#shadowing').css('display','none');
				
				currentLevel=l;
				start();	
			}
			else
			{
				var passwordTry = prompt('Entrez le mot de passe'+
					' correspondant au niveau '+ l.name, '');
				if(passwordTry==l.password || passwordTry=='inria2013')
					l.authorise(true);
				else if(passwordTry !='' && passwordTry != null)
					alert('Ce n\'est pas le bon mot de passe.')
			}
		});
	}
	
	this.authorise = function(boolean)
	{
		this.authorised=boolean;
		if(boolean)
		{
			for(var k=0; k<levels.length; k++)
			{
				if(this.num>=levels[k].num)
				{
					levels[k].authorised=true;
					$("#"+levels[k].num).css(
						'background-color', levels[k].color);
				}
			}
		}
		else
			$("#"+this.num).css('background-color', 'grey');
		
	}
}
