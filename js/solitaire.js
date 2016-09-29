/* 
 * Copyright © 2016 Ben Preece
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy 
 * of this software and its documentation files, images files, and other 
 * associated collateral (the "Software"), to deal in the Software without 
 *  * restriction, including without limitation the rights to use, copy, modify, 
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, 
 * and to permit persons to whom the Software is furnished to do so, subject to 
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in 
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHOR(S) OR COPYRIGHT HOLDER(S) BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
 * SOFTWARE.
 */

var SOLITAIRE = (function () {
    
    /*
     * Create a new card element.
     * 
     * Each card element has javascript attributes indicating the suit and 
     * pip, and given an inner IMG element for the card image.  Each card is 
     * initially set face down.
     * 
     * @param {type} suit
     * @param {type} pip
     * @returns {solitaire_L8.newCardElement.cardElement|Element}
     */
    function newCardElement(suit, pip) {
        var cardElement = document.createElement("div");

        cardElement.suit = suit;
        cardElement.pip = pip;
        cardElement.className = "card face-down";
        var imgElement = document.createElement("img");
        imgElement.setAttribute("src", "/img/" + PIPS[pip] + " " + SUITS[suit] + ".png");
        imgElement.setAttribute("draggable", "false");
        cardElement.appendChild(imgElement);

        return cardElement;
    }
    
    var SUITS = [ "Clubs", "Diamonds", "Hearts", "Spades" ];
    var PIPS = [ "Joker", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K" ];
    var CARDS = [
        "A Clubs.png", "2 Clubs.png", "3 Clubs.png", "4 Clubs.png", "5 Clubs.png", 
        "6 Clubs.png", "7 Clubs.png", "8 Clubs.png", "9 Clubs.png", "10 Clubs.png", 
        "J Clubs.png", "Q Clubs.png", "K Clubs.png", 
        "A Diamonds.png", "2 Diamonds.png", "3 Diamonds.png", "4 Diamonds.png", "5 Diamonds.png", 
        "6 Diamonds.png", "7 Diamonds.png", "8 Diamonds.png", "9 Diamonds.png", "10 Diamonds.png", 
        "J Diamonds.png", "Q Diamonds.png", "K Diamonds.png", 
        "A Hearts.png", "2 Hearts.png", "3 Hearts.png", "4 Hearts.png", "5 Hearts.png", 
        "6 Hearts.png", "7 Hearts.png", "8 Hearts.png", "9 Hearts.png", "10 Hearts.png", 
        "J Hearts.png", "Q Hearts.png", "K Hearts.png", 
        "A Spades.png", "2 Spades.png", "3 Spades.png", "4 Spades.png", "5 Spades.png", 
        "6 Spades.png", "7 Spades.png", "8 Spades.png", "9 Spades.png", "10 Spades.png", 
        "J Spades.png", "Q Spades.png", "K Spades.png", 
    ];

    var solitaire = {
        score: 0,
        stock: [],
        waste: [],
        foundation: [ [], [], [], [] ],
        tableau: [ [], [], [], [], [], [], [] ],
    };
    
    /*
     * Refresh the score display.
     * 
     * Negative scores are display in red and between parentheses.
     * 
     * @param {type} score
     * @returns {undefined}
     */
    solitaire.setScore = function(score) {
        var statusDiv = document.getElementById("status");
        if (score < 0) {
            statusDiv.style.color = "red";
            statusDiv.textContent = "($" + (-score) + ")";
        } else {
            statusDiv.style.color = "lightblue";
            statusDiv.textContent = "$" + score;
        }
    };
    
    /*
     * The event handler for the "dragstart" event.
     * 
     * The dataTransfer attribute for the event is set to the HTML ID of the 
     * card being dragged.  This will be used by the drop handler to locate 
     * the card in the DOM.
     * 
     * @param {type} event
     * @returns {Boolean}
     */
    function dragStart(event) {
        event.dataTransfer.setData("text", event.target.id);
        return true;
    }
    
    /*
     * Mark a card as draggable or not.
     * 
     * A card is draggable if it has the HTML attribute "draggable" set to 
     * "true", and has an event listener for the "dragstart" event.
     * 
     * @param {type} card
     * @param {type} draggable
     * @returns {undefined}
     */
    function setCardDraggable(card, draggable) {
        if (draggable) {
            card.setAttribute("draggable", "true");
            card.addEventListener("dragstart", dragStart, false);
        } else {
            card.removeEventListener("dragstart", dragStart);
            card.removeAttribute("draggable");
        }
    }
    
    /*
     * Create a new game.
     * 
     * This function allocates elements for a new deck of cards, shuffles 
     * them, and adds the card elements to the stock pile.  This function does 
     * not deal the cards.
     * 
     * @returns {undefined}
     */
    solitaire.newGame = function() {
        // create new elements for the cards
        for (var suit = 0; suit < 4; suit++) {
            for (var pip = 1; pip <= 13; pip++) {
                var cardElement = newCardElement(suit, pip);
                cardElement.id = PIPS[pip] + ' ' + SUITS[suit];
                this.stock.push(cardElement);
            }
        }
        // shuffle the cards in the deck
        for (var i = 0; i < this.stock.length; i++) {
            var j = i + Math.floor(Math.random() * this.stock.length - i);
            var tmp = this.stock[j];
            this.stock[j] = this.stock[i];
            this.stock[i] = tmp;
        }
        // add the new card elements to the stock
        var tableElement = document.getElementById("table");
        for (var j = 0; j < this.stock.length; j++) {
            var card = this.stock[j];
            card.classList.add("stock");
            card.style.zIndex = j;
            tableElement.appendChild(card);
        }
    };
    
    /*
     * Deal cards from the stock onto the tableau
     * 
     * Dealing a new game costs the player $52.
     * 
     * @param {type} stock
     * @returns {undefined}
     */
    solitaire.dealCards = function(stock) {
        var self = this;
        this.score -= 52;
        this.setScore(this.score);
        
        for (var row = 1, timeout = 0; row <= 7; row++, timeout += 75) {
            for (var col = row; col <= 7; col++, timeout += 50) {
                (function(row, col, timeout) {
                    setTimeout(function() {
                        // move one card from the stock list to the tableau to the tableau list
                        var card = stock.pop();
                        card.style.zIndex = "";
                        self.tableau[col-1].push(card);
                        // set the card attributes for its position in the tableau - this will animate the move
                        card.setAttribute("row", row);
                        card.setAttribute("col", col);
                        var className = "tableau card row-" + row + " col-" + col;
                        if (row < col) {
                            className += " face-down" ;
                        } else /* row === col */ {
                            className += " face-up up-1" ;
                            card.setAttribute("up", "1");
                            setCardDraggable(card, true);
                        }
                        card.className = className;
                    }, timeout);
                })(row, col, timeout);
            }
        }
    };
    
    /*
     * Remove all the card elements from the table and let them be garbage collected.
     * 
     * @returns {solitaire_L8.solitaire.clearTable}
     */
    solitaire.clearTable = function() {
        this.stock = [];
        this.waste = [];
        this.foundation = [ [], [], [], [] ];
        this.tableau = [ [], [], [], [], [], [], [] ];
        // The list returned by getElementsByClassName() is an active list -- 
        // if you remove a card from the DOM, then it will automatically be 
        // removed from the list as well.
        var cards = document.getElementsByClassName("card");
        while (cards.length > 0) {
            var card = cards[0];
            card.parentElement.removeChild(card);
        }
    };

    /*
     * Deal out a new game.
     * 
     * All the cards on the table will be garbage collected.  A new deck of 
     * cards will be created and shuffled and dealt out.
     * 
     * @returns {undefined}
     */
    solitaire.redeal = function() {
        this.clearTable();
        this.newGame();
        this.dealCards(this.stock);
    };
    
    /*
     * Turn all the cards from the waste pile back over and return them to the stock pile.
     * 
     * All the cards returned to the stock are made undraggable again.
     * 
     *  @returns {undefined}
     */
    solitaire.resetStock = function() {
        var self = this;
        if (this.waste.length > 0) {
            setCardDraggable(this.waste[this.waste.length - 1], false);
            var repeater = setInterval(
                    function() {
                        var card = self.waste.pop();
                        self.stock.push(card);
                        card.style.zIndex = self.stock.length;
                        card.className = "stock card face-down";
                        if (self.waste.length === 0) {
                            clearInterval(repeater);
                        }
                    }, 25);
        }
    };
    
    /*
     * Turn the top card(s) from the stock pile over into the waste pile.
     * 
     * Only the top card of the waste pile is draggable, so if the waste pile 
     * is not empty, then the top waste card is made undraggable.
     * 
     * @param {type} stock
     * @returns {undefined}
     */
    solitaire.turnStock = function(stock) {
        var self = this;
        if (self.stock.length > 0) {
            if (self.waste.length > 0) {
                setCardDraggable(self.waste[self.waste.length - 1], false);
            }
            
            (function turnOneCard(col, stock) {
                var card = stock.pop();
                card.style.zIndex = self.waste.length;
                self.waste.push(card);
                card.className = "waste card col-" + col + " face-up";
                if (col < 3 && stock.length > 0) {
                    setTimeout(function() { turnOneCard(col+1, stock); }, 50);
                } else {
                    setCardDraggable(card, true);
                }
            })(1, this.stock);
        }
    };
    
    /*
     * Handle a mouse click.
     * 
     * Only the stock pile accepts clicks.  If there are cards in the stock 
     * pile, then the top card(s) are turned over into the waste pile.  But if 
     * the stock pile is empty, then the waste pile is turned back over and 
     * returned to the stock.
     * 
     * @param {type} event
     * @returns {undefined}
     */
    solitaire.handleClick = function(event) {
        var target = document.elementFromPoint(event.clientX, event.clientY);
        if (target.classList.contains('target')) {
            if (target.classList.contains('stock')) {
                this.resetStock();
            }
        } else if (target.tagName === 'IMG') {
            // Got a card
            if (target.parentNode.classList.contains("stock")) {
                this.turnStock();
            }
        }
    };
    
    /*
     * Determine whether a card can be moved to a pile on the foundation.
     * 
     * If the card comes from the tableau, it must be the top card.  Only an 
     * ace can be moved to an empty pile.  If the foundation pile is not empty,
     * then the new card must have the same suit as the top card, and its pip 
     * value must be one greater.
     * 
     * @param {type} col
     * @param {type} card
     * @returns {Boolean}
     */
    solitaire.foundationWillAcceptCard = function(col, card) {
        var pile = this.foundation[col-1];

        if (card.classList.contains("tableau")) {
            // if the card comes from the tableau, it must be the top card.
            var oldCol = card.getAttribute("col");
            var row = card.getAttribute("row");
            var oldPile = this.tableau[oldCol-1];
            if (parseInt(row) !== oldPile.length) {
                return false;
            }
        }
        if (pile.length === 0) {
            // pile is empty, so the card must be an ace
            return PIPS[card.pip] === 'A';  
        } else {
            // pile is not empty, so the suits must match, and the new card 
            // must be the next in sequence
            var topCard = pile[pile.length-1];
            return card.suit === topCard.suit && card.pip === topCard.pip + 1;
        }
    };
    
    /*
     * Determine whether a card can be moved onto a column in the tableau.
     * 
     * Only a kihg can be moved to an empty column.  If the column is not 
     * empty, then the new card and the previous top card must have suits of 
     * different colors, and the pip value of thet new card must be one less 
     * than the top card.
     * 
     * @param {type} col
     * @param {type} card
     * @returns {Boolean}
     */
    solitaire.tableauWillAcceptCard = function(col, card) {
        var pile = this.tableau[col-1];
        if (pile.length === 0) {
            // pile is empty -- the card must be a King
            return card.pip === 13;
        } else {
            var topCard = pile[pile.length-1];
            // WARNING: CHEAP HACK!!  Suits are ordered BLACK, RED, RED, BLACK, 
            // so the the sum of different suits of the same color is always 3.
            return card.suit !== topCard.suit && 
                    (card.suit + topCard.suit !== 3) && 
                    card.pip === topCard.pip - 1;
        }
    };
    
    /*
     * Remove a card from the waste pile, or from the founation, or from the 
     * tableau.
     * 
     * If the card is coming from the waste pile, or from the foundation, then 
     * the card below it needs to be made draggable again.  If the card is 
     * coming from the tableau, and the card that's been uncovered is face 
     * down, then that card needs to be made face up and draggable.
     * 
     * Removing a card from the foundation loses the player $5.
     * 
     * This function is only used to remove a card from the tableau if it's 
     * going to the foundation.  If it's going to another column on the 
     * tableau, then we'll call removeCardArrayFromTableau() instead.
     * 
     * @param {type} card
     * @returns {undefined}
     */
    solitaire.removeCardFromPile = function(card) {
        if (card.classList.contains("stock")) {
            // presuming its top on the stock
            this.stock.pop();
        } else if (card.classList.contains("waste")) {
            this.waste.pop();
            if (this.waste.length > 0) {
                setCardDraggable(this.waste[this.waste.length-1], true);
            }
        } else if (card.classList.contains("foundation")) {
            // presume it's on top of the pile
            var col = parseInt(card.getAttribute("col"));
            var pile = this.foundation[col - 1];
            pile.pop();
            if (pile.length > 0) {
                setCardDraggable(pile[pile.length - 1], true);
            }
            card.removeAttribute("col");
            this.score -= 5;
            this.setScore(this.score);
        } else if (card.classList.contains("tableau")) {
            // Assume this is the top card (up == 1).  If it's not, then we 
            // should be calling removeCardArrayFromTableau() instead.
            var col = card.getAttribute("col");
            card.removeAttribute("col");
            card.removeAttribute("row");
            card.removeAttribute("up");
            card.classList.remove("up-1");
            var pile = this.tableau[col-1];
            pile.pop();
            // Flip the new top card, if the pile is not empty now, and if the 
            // new top card is face down.
            if (pile.length > 0) {
                var newTopCard = pile[pile.length-1];
                if (newTopCard.classList.contains("face-down")) {
                    newTopCard.classList.remove("face-down");
                    newTopCard.classList.add("face-up", "up-1");
                    newTopCard.setAttribute("up", "1");
                    setCardDraggable(newTopCard, true);
                }
            }
        }
    };
    
    /*
     * Remove a card from the tableau together with all the cards above it.
     * 
     * If the new top card is face-down, then we need to make it face up and
     * make it draggable.
     * 
     * @param {type} card
     * @returns {undefined}
     */
    solitaire.removeCardArrayFromTableau = function(card) {
        var col = card.getAttribute("col");
        var row = card.getAttribute("row");
        var pile = this.tableau[col-1];
        var cards = [];
        for (var i = row-1; i < pile.length; i++) {
            cards.push(pile[i]);
        }
        for (var j = 0; j < cards.length; j++) {
            pile.pop();
        }
        if (pile.length > 0) {
            var topCard = pile[pile.length - 1];
            if (topCard.classList.contains("face-down")) {
                topCard.classList.remove("face-down");
                topCard.classList.add("face-up", "up-1");
                topCard.setAttribute("up", "1");
                setCardDraggable(topCard, true);
            }
        }
        return cards;
    };

    /*
     * Drop a card onto the foundation.
     * 
     * This earns the player $5.
     * 
     *  If the pile is not empty, ,then the previous top card is set 
     *  undraggable.  This is probably unnecessary, since it's completely 
     *  covered, but it shouldn't hurt either.
     *  
     * @param {type} col
     * @param {type} card
     * @returns {undefined}
     */
    solitaire.dropCardOntoFoundation = function(col, card) {
        var pile = this.foundation[col-1];
        if (pile.length > 0) {
            setCardDraggable(pile[pile.length-1], false);  
        }
        pile.push(card);
        var cardClassName = "card foundation col-" + col;
        card.setAttribute("col", col);
        card.style.zIndex = pile.length + 1;
        card.className = cardClassName;
        this.score += 5;
        this.setScore(this.score);
    } ;
    
    /*
     *  Drop a card onto the tableau.
     *  
     *  The HTML attributes "row" and "up" keep track of the card's position 
     *  in the stack, and to determine where to draw the card on the table.. 
     *  (See the CSS file.)  The "up" element says how many cards are face-up 
     *  in the stack, not counting any cards above it  If the card is moving 
     *  onto an empty stack, then the "row" and "up" will both be 1.  If it's 
     *  moving onto cards already in the stack, then the new card's "row" and 
     *  "up" will both increase by one.
     *  
     *  After it's been moved, the card will be set draggable.
     *  
     * @param {type} col
     * @param {type} card
     * @returns {undefined}
     */
    solitaire.dropCardOntoTableau = function(col, card) {
        var pile = this.tableau[col-1];
        if (pile.length === 0) {
            pile.push(card);
            card.setAttribute("col", col);
            card.setAttribute("row", "1");
            card.setAttribute("up", "1");
            card.style.zIndex = 1;
            card.className = "card tableau col-" + col + " row-1 face-up up-1";
        } else {
            var topCard = pile[pile.length - 1];
            var up = parseInt(topCard.getAttribute("up")) + 1;
            pile.push(card);
            card.setAttribute("col", col);
            card.setAttribute("row", pile.length);
            card.setAttribute("up", up);
            card.style.zIndex = pile.length;
            card.className = "card tableau col-" + col + " row-" + pile.length + " face-up up-" + up;
        }
    };
    
    /*
     * Drop a stack of cards onto the tableau
     * 
     * The cards are moved successively by calling dropCardOntotableau(), then 
     * using setTimeout() to schedule each of the following moves.  The time 
     * interval between moves is set to 250ms, divided by the number of cards 
     * to move, so that the total time is less than 1/4 second.
     * 
     * @param {type} col
     * @param {type} card
     * @returns {undefined}
     */
    solitaire.dropCardArrayOntoTableau = function(col, cardArray) {
        var self = this;
        var interval = 250 / cardArray.length;
        var i = 0;
        // You might think that setInterval() would be move natural than this.
        // The problem with setInterval() is that the interval applies to the 
        // first iteration as well as the rest, which means there's a 
        // noticeable delay between the drop and the start of the move.
        // Besides, this shows the interesting technique of using an ad hoc 
        // named function to schedule repeated actions.
        (function moveOne(col, cardArray) {
            var card = cardArray.shift();
            self.dropCardOntoTableau(col, card);
            if (cardArray.length > 0) {
                setTimeout(function() { moveOne(col, cardArray); }, interval);
            }
        })(col, cardArray);
    };
    
    /*
     *  Drop a drag target onto a drop target as a result of a "drop" event.
     *  
     *  This function determines whether the card is being dragged to the 
     *  foundation or the tableau, which are the only places it can be dragged.
     *  If the drop target can accept the card, then it is removed from its 
     *  current pile, and added to the drop target.
     *  
     *  If the drag target is coming from the tableau and going to the 
     *  tableau, then all the cards above it must be dragged as well.
     * 
     * @param {type} card
     * @param {type} target
     * @returns {undefined}
     */
    solitaire.dropCardOntoTarget = function(card, target) {
        if (target.classList.contains("foundation")) {
            var col = target.getAttribute("col");
            if (this.foundationWillAcceptCard(col, card)) {
                // move the card onto the foundation
                this.removeCardFromPile(card);
                this.dropCardOntoFoundation(col, card);
            }
        } else if (target.classList.contains("tableau")) {
            var col = target.getAttribute("col");
            if (this.tableauWillAcceptCard(col, card)) {
                if (card.classList.contains("tableau")) {
                    // move the drag target and all the cards above it from one
                    // column inside the tableau to another
                    var cards = this.removeCardArrayFromTableau(card);
                    this.dropCardArrayOntoTableau(col, cards);
                } else {
                    // move the card onto the tableau
                    this.removeCardFromPile(card);
                    this.dropCardOntoTableau(col, card);
                }
            }
        } else {
            // there's no other place we can drag a card, so we can just 
            // ignore all other cases.
        }
    };
    
    /*
     * Handle mouse drop events.
     * 
     * The only elements that will be dropped are the card elements. The drop 
     * target will either be a CSS target element (e.g. .stock.target, or 
     * .foundation.target, or else a card.  If it's a card, then the target in 
     * the drop event will actually be the IMG element inside the card element,
     * since that's on top.  In that case we need to get the card element, 
     * which is the IMG's parent, because thar's where we wrote all the drag 
     * information.
     * 
     * On the dragstart event, the HTML ID of the card which is the drag 
     * target was written into the drag event's datatTansfer attribute.
     * This function fetches the card element with that ID, then calls
     * dropCardOntoTarget() to move the dragged card to the location of the 
     * drop target.
     * 
     * @param {type} event
     * @returns {undefined}
     */
    solitaire.handleDropEvent = function(event) {
        event.preventDefault(); 
        var cardID = event.dataTransfer.getData("text");
        var card = document.getElementById(cardID);
        var target = event.target;
        if (target.tagName === 'IMG') {
            target = target.parentNode;
        }
        this.dropCardOntoTarget(card, target); 
    };
    
    /*
     * Setup the event listeners.  
     * 
     * This function is called by the initialize() function.  It sets up the 
     * #table element to handle mouse click events, the dragenter and dragover 
     * events, and the drop event.  (The dragstart events are all handled by 
     * the card elements.)
     * 
     * @returns {undefined}
     */
    solitaire.setupEventListeners = function() {
        var self = this;
        var table = document.getElementById("table");
        table.addEventListener("click", function (event) { self.handleClick(event); }, false);
        table.addEventListener("dragenter", function(event) { event.preventDefault(); }, false);
        table.addEventListener("dragover", function(event) { event.preventDefault(); }, false);
        table.addEventListener("drop", function(event) { self.handleDropEvent(event); }, false);
    };
    
    /*
     * This initialization function is called by the document body's "onload" 
     * event handler.  It will set up the mouse and keyboard event listeners, 
     * then deal a new game.
     * 
     * @returns {undefined}
     */
    solitaire.initialize = function() {
        this.setupEventListeners();
        this.redeal();
    };
    
    return solitaire;
}());