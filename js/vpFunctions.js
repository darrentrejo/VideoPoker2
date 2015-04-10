var deck;
var playersHand;
    
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

        for (var k = 0; k < unshuffledDeck.length; k++) {
            var rn = Math.floor(Math.random() * unshuffledDeck.length);
            var temp = unshuffledDeck[k];
            unshuffledDeck[k] = unshuffledDeck[rn];
            unshuffledDeck[rn] = temp;
        }

        this.deck = unshuffledDeck; //now shuffled
    }
    
    function loadCard(cardValue, cardSuit, canvasId) {
        var cardSlot = document.getElementById(canvasId);
        var canvas = document.getElementById(canvasId);
        canvas.width = parseInt(canvas.parentNode.offsetWidth);
        canvas.height = parseInt(canvas.parentNode.offsetHeight);
        var context = canvas.getContext("2d");		
        var suitY = canvas.height / 2 - 5;
        drawPip(context, cardValue, cardSuit);
        switch(cardSuit)
        {
            case "S":
                drawSpade(context,  canvas.width * 0.5, suitY, 37.5, 50);
                drawSpade(context, 11.875, 22, 18.75, 25);
                break;
            case "H":
                drawHeart(context,  canvas.width * 0.5, suitY, 37.5, 50);
                drawHeart(context, 11.875, 22, 18.75, 25);
                break;
            case "C":
                drawClub(context,  canvas.width * 0.5, suitY, 37.5, 50);
                drawClub(context, 11.875, 22, 18.75, 25);
                break;
            case "D":
                drawDiamond(context,  canvas.width * 0.5, suitY, 37.5, 50);
                drawDiamond(context, 11.875, 22, 18.75, 25);
                break;
        }
    }
    
    function dealCards() {
        deck = new Array();
        buildAndShuffleDeck();
        cardDivs = new Array();
        playersHand = new Array();
        for (var index = 0; index < 5; index++)
        {
            var cardValue = deck[index].substring(0,deck[index].length - 1);
            var cardSuit = deck[index].slice(-1);
            loadCard(cardValue, cardSuit, "canvas" + (index + 1));
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
                var cardValue = playersHand[index].substring(0,playersHand[index].length - 1);
                var cardSuit = cardByValueSuit.slice(-1);
                loadCard(cardValue, cardSuit, "canvas" + (index + 1));
            }
        }
    }

//Can't take credit for this ranking algorithm. I was working on something similar and then I found out this guy beat me to it.
//http://www.codeproject.com/Articles/569271/A-Poker-hand-analyzer-in-JavaScript-using-bit-math
    function rankPokerHand(cs, ss) {
        var v, i, o, s = 1 << cs[0] | 1 << cs[1] | 1 << cs[2] | 1 << cs[3] | 1 << cs[4];
        for (i = -1, v = o = 0; i < 5; i++, o = Math.pow(2, cs[i] * 4)) { v += o * ((v / o & 15) + 1); }
        v = v % 15 - ((s / (s & -s) == 31) || (s == 0x403c) ? 3 : 1);
        v -= (ss[0] == (ss[1] | ss[2] | ss[3] | ss[4])) * ((s == 0x7c00) ? -5 : 1);
        return v;
    }
    
    function evaluateHand() {
        var cs = new Array();
        var ss = new Array();
        var hands = ["4 of a Kind", "Straight Flush", "Straight", "Flush", "Sorry, You didn't win", "Jacks or better", "2 Pair", "Royal Flush", "3 of a Kind", "Full House"];
        var _ = { "S": 1, "C": 2, "H": 4, "D": 8 };

        for (var index = 0; index < playersHand.length; index++)
        {
            var card = playersHand[index];
            var suit = card.substring(card.length -1);
            var value = card.substr(0, card.length - 1);

            switch (value) {
                case "A":
                value = 14;
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

            cs.push(value);
            ss.push(_[card.substring(card.length - 1)]);
        }

        var result = rankPokerHand(cs, ss);

        if (result == 5) {
            cs.sort(function (a, b) {
                return b > a;
            });
            for (var i = 0; i < cs.length - 1; i++) {
                if (cs[i + 1] == cs[i]) {
                    if (cs[i] < 11)
                        result = 4
                    break;
                }
            }
        }

        document.getElementById("displayResult").innerHTML = hands[result];
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
    function drawSpade(context, x, y, width, height) {
            context.save();
            var bottomWidth = width * 0.7;
            var topHeight = height * 0.7;
            var bottomHeight = height * 0.3;

            context.beginPath();
            context.moveTo(x, y);

            // top left of spade          
            context.bezierCurveTo(
                x, y + topHeight / 2, // control point 1
                x - width / 2, y + topHeight / 2, // control point 2
                x - width / 2, y + topHeight // end point
            );

            // bottom left of spade
            context.bezierCurveTo(
                x - width / 2, y + topHeight * 1.3, // control point 1
                x, y + topHeight * 1.3, // control point 2
                x, y + topHeight // end point
            );

            // bottom right of spade
            context.bezierCurveTo(
                x, y + topHeight * 1.3, // control point 1
                x + width / 2, y + topHeight * 1.3, // control point 2
                x + width / 2, y + topHeight // end point
            );

            // top right of spade
            context.bezierCurveTo(
                x + width / 2, y + topHeight / 2, // control point 1
                x, y + topHeight / 2, // control point 2
                x, y // end point
            );

            context.closePath();
            context.fill();

            // bottom of spade
            context.beginPath();
            context.moveTo(x, y + topHeight);
            context.quadraticCurveTo(
                x, y + topHeight + bottomHeight, // control point
                x - bottomWidth / 2, y + topHeight + bottomHeight // end point
            );
            context.lineTo(x + bottomWidth / 2, y + topHeight + bottomHeight);
            context.quadraticCurveTo(
                x, y + topHeight + bottomHeight, // control point
                x, y + topHeight // end point
            );
            context.closePath();
            context.fillStyle = "black";
            context.fill();
            context.restore();
        }

        function drawHeart(context, x, y, width, height) {
            context.save();
            context.beginPath();
            var topCurveHeight = height * 0.3;
            context.moveTo(x, y + topCurveHeight);
            // top left curve
            context.bezierCurveTo(
                x, y,
                x - width / 2, y,
                x - width / 2, y + topCurveHeight
            );

            // bottom left curve
            context.bezierCurveTo(
                x - width / 2, y + (height + topCurveHeight) / 2,
                x, y + (height + topCurveHeight) / 2,
                x, y + height
            );

            // bottom right curve
            context.bezierCurveTo(
                x, y + (height + topCurveHeight) / 2,
                x + width / 2, y + (height + topCurveHeight) / 2,
                x + width / 2, y + topCurveHeight
            );

            // top right curve
            context.bezierCurveTo(
                x + width / 2, y,
                x, y,
                x, y + topCurveHeight
            );

            context.closePath();
            context.fillStyle = "red";
            context.fill();
            context.restore();
        }

        function drawClub(context, x, y, width, height) {
            context.save();
            var circleRadius = width * 0.3;
            var bottomWidth = width * 0.5;
            var bottomHeight = height * 0.35;
            context.fillStyle = "black";

            // top circle
            context.beginPath();
            context.arc(
                x, y + circleRadius + (height * 0.05),
                circleRadius, 0, 2 * Math.PI, false
            );
            context.fill();

            // bottom right circle
            context.beginPath();
            context.arc(
                x + circleRadius, y + (height * 0.6),
                circleRadius, 0, 2 * Math.PI, false
            );
            context.fill();

            // bottom left circle
            context.beginPath();
            context.arc(
                x - circleRadius, y + (height * 0.6),
                circleRadius, 0, 2 * Math.PI, false
            );
            context.fill();

            // center filler circle
            context.beginPath();
            context.arc(
                x, y + (height * 0.5),
                circleRadius / 2, 0, 2 * Math.PI, false
            );
            context.fill();

            // bottom of club
            context.moveTo(x, y + (height * 0.6));
            context.quadraticCurveTo(
                x, y + height,
                x - bottomWidth / 2, y + height
            );
            context.lineTo(x + bottomWidth / 2, y + height);
            context.quadraticCurveTo(
                x, y + height,
                x, y + (height * 0.6)
            );
            context.closePath();
            context.fill();
            context.restore();
        }

        function drawDiamond(context, x, y, width, height) {
            context.save();
            context.beginPath();
            context.moveTo(x, y);

            // top left edge
            context.lineTo(x - width / 2, y + height / 2);

            // bottom left edge
            context.lineTo(x, y + height);

            // bottom right edge
            context.lineTo(x + width / 2, y + height / 2);

            // closing the path automatically creates
            // the top right edge
            context.closePath();

            context.fillStyle = "red";
            context.fill();
            context.restore();
        }

        function drawPip(context, value, suit) {
            context.save();
            context.font = "bold 20pt serif";
            if (suit == "H" || suit == "D")
                context.fillStyle = "red";
            context.fillText(value, 5, 20);
            context.restore();
        }
        
        function clearCardCanvas(canvasId, width, height, context)
        {
            context.clearRect(0, 0, width, height);
        }