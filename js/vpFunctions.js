var deck;
var playersHand;

	function getRandomNumbers()
   	{
		var numbers;
		var xhr;
		if (window.XMLHttpRequest)
  		{
  			xhr=new XMLHttpRequest();
  		}
		else
  		{
  			xhr=new ActiveXObject("Microsoft.XMLHTTP");
  		}
		xhr.onreadystatechange=function()
  		{
  			if (xhr.readyState==4 && xhr.status==200)
    		{
    			numbers=xhr.responseText;
				numbers=numbers.substring(0,numbers.lastIndexOf('\n'));
    		}
  		}		
		xhr.open("GET","http://www.random.org/sequences/?min=1&max=52&col=1&format=plain&rnd=new",false);
		xhr.send();
		return numbers;
	}
	
	function buildAndShuffleDeck() {
		var suits = new Array("S", "H", "C", "D");
		var values = new Array("A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K");
		var unshuffledDeck = new Array();
		for (var i = 0; i < values.length; i++)
		{
			for (var j = 0; j < suits.length; j++)
			{
				unshuffledDeck.push(values[i] + suits[j]);
			}
		}
		var numberString = getRandomNumbers();
		var numberArray = numberString.split("\n");
		for (var number = 0; number < 51; number++)
		{
			var randomNumber = parseInt(numberArray[number]);
			deck.push(unshuffledDeck[randomNumber - 1]);	
		}
	}
	
	function loadCard(cardValueSuit, divId) {
            var cardSlot = document.getElementById(divId);
            var cardId = "card" + divId.slice(-1);
            cardSlot.innerHTML = '';
            var xhr;
			if (window.XMLHttpRequest)
  			{
  				xhr=new XMLHttpRequest();
  			}
			else
  			{
  				xhr=new ActiveXObject("Microsoft.XMLHTTP");
  			}
            xhr.open('get', 'https://dl.dropboxusercontent.com/u/17091314/PlayingCards/' + cardValueSuit + '.svg', true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState != 4 && xhr.status==200) return;
                var svg = xhr.responseXML.documentElement;
                svg = document.importNode(svg, true);
                svg = sizeAndIdCard(svg, cardId);
                cardSlot.appendChild(svg);
            };
            xhr.send();
    }
	
	function dealCards() {
		deck = new Array();
		buildAndShuffleDeck();
		cardDivs = new Array();
		playersHand = new Array();
		for (var index = 0; index < 5; index++)
		{
			loadCard(deck[index], "cardSlot" + (index + 1));
			document.getElementById("holdStatus" + (index + 1)).innerHTML = "";
			document.getElementById("holdButton" + (index + 1)).className = "unselected";
			playersHand[index] = deck[index];
		}
	}
	
	function drawCards() {
		//determine which, if any, cards need to be replaced
		var randomNumbers = new Array();
		for (var index = 0; index < 5; index++)
		{
			var holdButton = document.getElementById("holdButton" + (index + 1));
			if (holdButton.className == 'unselected')
			{
				var deckIndex = function getDrawCard() {
					var result = Math.floor(Math.random() * 51) + 0;
					if(result > 4 && randomNumbers.indexOf(result) == -1)
					{
						randomNumbers.push(result);
						return;	
					}
					getDrawCard();
				};
				deckIndex();
				var cardByValueSuit = deck[randomNumbers[randomNumbers.length - 1]];
				playersHand[index] = cardByValueSuit;
				loadCard(cardByValueSuit, "cardSlot" + (index + 1));
			}
		}
	}
	
	function lookForPairs(hand)
	{
		var pairsBins = {
			"aces":new Array(),
			"kings":new Array(),
			"queens":new Array(),
			"jacks":new Array(),
			"tens":new Array(),
			"nines":new Array(),
			"eights":new Array(),
			"sevens":new Array(),
			"sixes":new Array(),
			"fives":new Array(),
			"fours":new Array(),
			"threes":new Array(),
			"twos":new Array()
			};
		
		for (var index = 0; index < hand.length; index++)
		{
			var thisCardValue = hand[index][0];
			switch (thisCardValue)
			{
				case 1:
				pairsBins["aces"].push(hand[index]);
				break;
				case 2:
				pairsBins["twos"].push(hand[index]);
				break;
				case 3:
				pairsBins["threes"].push(hand[index]);
				break;
				case 4:
				pairsBins["fours"].push(hand[index]);
				break;
				case 5:
				pairsBins["fives"].push(hand[index]);
				break;
				case 6:
				pairsBins["sixes"].push(hand[index]);
				break;
				case 7:
				pairsBins["sevens"].push(hand[index]);
				break;
				case 8:
				pairsBins["eights"].push(hand[index]);
				break;
				case 9:
				pairsBins["nines"].push(hand[index]);
				break;
				case 10:
				pairsBins["tens"].push(hand[index]);
				break;
				case 11:
				pairsBins["jacks"].push(hand[index]);
				break;
				case 12:
				pairsBins["queens"].push(hand[index]);
				break;
				case 13:
				pairsBins["kings"].push(hand[index]);
				break;
			}
		}
		
		var histogram = new Array();
		var smallPairs = 0;
		for (var bin in pairsBins)
		{
			if (pairsBins[bin].length > 0)
			{
				histogram.push(pairsBins[bin]);
				if (pairsBins[bin].length == 2 && (pairsBins[bin][0][0] > 1 && pairsBins[bin][0][0] < 11) )
				{
					smallPairs++;
				}
			}
		}
		histogram.sort(function(a, b) { 
    		return b.length > a.length;
		});
		
		var result = 1;
		
		if (histogram[0].length == 4)
		{
			//quads
			return 7;
		}
		else if (histogram[0].length == 3 && histogram[1].length == 2)
		{
			//full house
			return 6;
		}
		else if (histogram[0].length == 3 && histogram[1].length == 1)
		{
			//trips
			return 3;
		}
		else if (histogram[0].length == 2 && histogram[1].length == 2)
		{
			//two pair
			var newBin = [histogram[0][0],histogram[0][1],histogram[1][0],histogram[1][1]];
			return 2;
		}
		else if (histogram[0].length == 2 && histogram[1].length == 1)
		{
			//pair only if smallPairs == 0
			if(smallPairs == 0)
			{
				return 1;
			}
			else
			{
				//There is a pair, but not Jacks or Better
				//no need to look for other winners
				return -1;
			}
		}
		else
		{
			result = 0;
		}
		return result;
	}
	
	function lookForFlushes(hand)
	{
		var firstSuit = "";
		for (var index = 0; index < hand.length; index++)
		{
			if (firstSuit == "")
			{
				firstSuit = hand[index][1];
				continue;
			}
			if (hand[index][1] != firstSuit)
			{
				return 0;
			}
		}
		return 5;
	}
	
	function lookForStraights(hand)
	{
		//Is there an Ace in the hand?
		//If so, we need to account for it being both high and low
		var broadway = false;
		if (hand[0][0] == 1 && hand[1][0] == 10)
		{
			//set the Ace value to 14
			var resetAce = [14, hand[0][1], hand[0][2]];
			hand.shift();
			hand.push(resetAce);
			broadway = true;
		}
		
		for (var index = 0; index < hand.length; index++)
		{
			if(index != hand.length -1)
			{
				if ((hand[index + 1][0] - hand[index][0]) == 1)
				{
					continue;
				}
				else
				{
					return 0;
				}
			}
		}
		
		if(broadway)
		{
			return 41;
		}
		else
		{
			return 4;
		}
	}
	
	function evaluateHand() {
		var result = 0;
		var hand = new Array();
		for (var index = 0; index < playersHand.length; index++)
		{
			var cardByValueSuitPosition = new Array()
			var card = playersHand[index];
			var suit = card.substring(card.length -1);
			var value = card.substr(0, card.length - 1);
			var numericalValue;
			switch (value) {
				case "A":
				value = 1;
				break;
				
				case "J":
				value = 11;
				break;
				
				case "Q":
				value = 12;
				break;
				
				case "K":
				value = 13;
				break;
				
				default:
				value = parseInt(value);
			}
			cardByValueSuitPosition.push(value);
			cardByValueSuitPosition.push(suit);
			cardByValueSuitPosition.push(index + 1);
			
			hand.push(cardByValueSuitPosition);
		}
		
		hand.sort(function(a, b) { 
    		return a[0] > b[0]?1:-1;
		});
		
		//look for quads, trips, two pair and pair
		result = lookForPairs(hand);
		if (result == 0)
		{
			var broadway = false;
			var straight = false;
			//look for straights
			result = lookForStraights(hand);
			if (result > 0)
			{
				straight = true;
				if (result = 41)
				{
					broadway = true;
				}
			}
			//look for flushes
			result = lookForFlushes(hand)
			{
				if (result > 0)
				{
					if(straight && broadway)
					{
						result = 9;
					}
					else if(straight)
					{
						result = 8;
					}
					else
					{
						result = 5;	
					}
				}
				else if (straight)
				{
					result = 4;
				}
			}
		}
		
		switch (result)
		{
			case 9:
			document.getElementById("displayResult").innerHTML = "Royal Flush!";
			break;
			
			case 8:
			document.getElementById("displayResult").innerHTML = "Straight Flush!";
			break;
			
			case 7:
			document.getElementById("displayResult").innerHTML = "4 of a Kind!";
			break;
			
			case 6:
			document.getElementById("displayResult").innerHTML = "Full House!";
			break;
			
			case 5:
			document.getElementById("displayResult").innerHTML = "Flush!";
			break;
			
			case 4:
			document.getElementById("displayResult").innerHTML = "Straight!";
			break;
			
			case 3:
			document.getElementById("displayResult").innerHTML = "3 of a kind!";
			break;
			
			case 2:
			document.getElementById("displayResult").innerHTML = "Two Pairs!";
			break;
			
			case 1:
			document.getElementById("displayResult").innerHTML = "Jacks or Better!";
			break;
			
			default:
			document.getElementById("displayResult").innerHTML = "Sorry. You didn't win.";
			break;
		}
	}
	
	function dealOrDrawClicked() {
		var dealButton = document.getElementById('dealButton');
		if (deck == null)
		{
			//This is a deal event		
			dealCards();	
			dealButton.value = "Draw";
			document.getElementById("displayResult").innerHTML = "";
		}
		else
		{
			//This is a draw event
			drawCards();
			var localCheck = playersHand;
			result = evaluateHand();
			dealButton.value = "Deal";
			playersHand = null;
			deck = null;
		}
	}
	
	function sizeAndIdCard(svg, cardId) {
		svg.setAttribute("id", cardId);
		svg.setAttribute("width", "235");
		svg.setAttribute("height", "333");
		svg.setAttribute("preserveAspectRatio", "xMinYMin meet");
		svg.setAttribute("viewBox", "260 370 744.09448819 1052.3622047");
		return svg;
	}
	
	function toggleSelection(callingButton) {
		var slotNumber = callingButton.id.slice(-1);
		if (callingButton.className == 'selected')
		{
			document.getElementById("holdStatus" + slotNumber).innerHTML = "";
			callingButton.className = 'unselected';
		}
		else {	
			document.getElementById("holdStatus" + slotNumber).innerHTML = "hold";
			callingButton.className = 'selected';
		}
	}