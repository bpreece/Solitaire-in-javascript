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
    var DOUBLE_CLICK_TIMEOUT = 200;
    var WIN_PER_CARD = 5;
    var COST_PER_GAME = 52;
    
    /*
     * 
     * @param {type} execList
     * @returns {undefined}
     */
    function executeAll(execList) {
        while (execList.length > 0) {
            execList.pop()();
        }
    }
    
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
        undoList: [],
    };
    
    /*
     * Refresh the score display.
     * 
     * Negative scores are display in red and between parentheses.
     * 
     * @param {type} score
     * @returns {undefined}
     */
    solitaire.adjustScore = function(score) {
        this.score += score;
        var statusDiv = document.getElementById("status");
        if (this.score < 0) {
            statusDiv.style.color = "red";
            statusDiv.textContent = "($" + (-this.score) + ")";
        } else {
            statusDiv.style.color = "lightblue";
            statusDiv.textContent = "$" + this.score;
        }
    };
    
    /*
     * 
     * @returns {undefined}
     */
    solitaire.undo = function() {
        if (this.undoList.length > 0) {
            var undoFunction = this.undoList.pop();
            undoFunction();
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
     *  This function is undoable.
     * 
     * @param {type} card
     * @returns {undefined}
     */
    solitaire.dropCardOntoStock = function(card) {
        var self = this;
        self.stock.push(card);
        card.style.zIndex = self.stock.length;
        card.className = "stock card face-down";
        return function() { 
           var card = self.stock.pop();
           card.style.zIndex = 99;
       };
    };
    
    /*
     *  This function is undoable.
     * 
     * @param {type} card
     * @returns {Function}
     */
    solitaire.removeCardFromStock = function(card) {
        // presuming c ard is on top on the stock
        var self = this;
        self.stock.pop();
        card.style.zIndex = 99;
        return function() { self.dropCardOntoStock(card); };
    };
    
    /*
     * This function is undoable.
     * 
     * @param {type} col
     * @param {type} card
     * @returns {undefined}
     */
    solitaire.dropCardOntoWaste = function(col, card) {
        var self = this;
        
        if (self.waste.length > 0) {
            setCardDraggable(self.waste[self.waste.length - 1], false);
        }
        self.waste.push(card);
        card.style.zIndex = self.waste.length;
        card.setAttribute("col", col);
        card.className = "waste card col-" + col + " face-up";
        setCardDraggable(card, true);
        
        return function() { self.removeCardFromWaste(card); };
    };
    
    /*
     *  This function is undoable.
     *  
     * @param {type} card
     * @returns {undefined}
     */
    solitaire.removeCardFromWaste = function(card) {
        var self = this;

        // presuming card is on top of the waste pile
        self.waste.pop();
        var col = parseInt(card.getAttribute("col"));
        setCardDraggable(card, false);
        card.removeAttribute("col");
        card.style.zIndex = 99;
        if (self.waste.length > 0) {
            setCardDraggable(self.waste[self.waste.length-1], true);
        }
        
        return function() { self.dropCardOntoWaste(col, card); };
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
        var self = this;

        var pile = this.foundation[col-1];
        if (pile.length > 0) {
            setCardDraggable(pile[pile.length-1], false);  
        }
        pile.push(card);
        var cardClassName = "card foundation col-" + col;
        card.setAttribute("col", col);
        card.style.zIndex = pile.length + 1;
        card.className = cardClassName;
        setCardDraggable(card, true);
        this.adjustScore(WIN_PER_CARD);
        
        return function() { self.removeCardFromFoundation(card); };
    };
    
    /*
     * 
     * @param {type} card
     * @returns {undefined}
     */
    solitaire.removeCardFromFoundation = function(card) {
        var self = this;

        // presume it's on top of the foundation pile
        var col = parseInt(card.getAttribute("col"));
        var pile = this.foundation[col - 1];
        pile.pop();
        if (pile.length > 0) {
            setCardDraggable(pile[pile.length - 1], true);
        }
        card.removeAttribute("col");
        setCardDraggable(card, false);
        this.adjustScore(-WIN_PER_CARD);
        
        return function() { self.dropCardOntoFoundation(col, card); };
    };
    
    /*
     * 
     * @param {type} col
     * @returns {Boolean}
     */
    solitaire.turnTableauTopCardFaceUp = function(col, faceUp) {
        var self = this;
        var pile = self.tableau[col - 1];
        if (pile.length > 0) {
            var card = pile[pile.length - 1];
            if (faceUp === true && card.classList.contains("face-down")) {
                card.setAttribute("up", 1);
                card.classList.remove("face-down");
                card.classList.add("face-up", "up-1");
                setCardDraggable(card, true);
                return function() { self.turnTableauTopCardFaceUp(col, false); };
            } else if (faceUp === false && card.classList.contains("face-up")) {
                setCardDraggable(card, false);
                card.removeAttribute("up");
                card.classList.remove("up-1");
                card.classList.remove("face-up");
                card.classList.add("face-down");
                return function() { self.turnTableauTopCardFaceUp(col, true); };
            }
        }
        return function() { };
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
        var self = this;

        var pile = this.tableau[col-1];
        pile.push(card);
        var row = pile.length;
        card.style.zIndex = row;
        card.setAttribute("col", col);
        card.setAttribute("row", row);
        var className = "tableau card row-" + row + " col-" + col + " face-up";
        if (pile.length === 1) {
            // this is the only card in the pile, so it had up==1
            card.setAttribute("up", "1");
            className += " up-1";
        } else {
            // set this card's "up" from the current top of the pile
            var previousTopCard = pile[pile.length - 2];
            if (previousTopCard.hasAttribute("up")) {
                var up = parseInt(previousTopCard.getAttribute("up")) + 1;
                card.setAttribute("up", up);
                className += " up-" + up;
            } else {
                card.setAttribute("up", "1");
                className += " up-1";
            }
        }
        card.className = className;
        setCardDraggable(card, true);
        
        return function() { self.removeCardFromTableau(card); };
    };
    
    /*
     * Called by dealCards() to move a card from the stock to the tableau. 
     * 
     * This is different from dropCardOntoTableau() since we know from the 
     * caller that row <= col; that the card will be face up and if 
     * row == col, but face down and undraggable otherwise; and that the card 
     * beneath it is already set face down and undraggable.
     * 
     * @param {type} card
     * @param {type} col
     * @param {type} row
     * @returns {undefined}
     */
    solitaire.dealCardOntoTableau = function(card, row, col) {
        var self = this;

        var pile  = this.tableau[col-1];
        pile.push(card);
        card.style.zIndex = pile.length;
        card.setAttribute("row", row);
        card.setAttribute("col", col);
        var className = "tableau card row-" + row + " col-" + col;
        if (row === col) {
            card.setAttribute("up", "1");
            className += " face-up up-1" ;
            setCardDraggable(card, true);
        } else /* row < col */ {
            className += " face-down" ;
        }
        card.className = className;
    };
    
    /*
     * 
     * @param {type} card
     * @returns {solitaire_L24.solitaire.removeCardFromTableau.undoFunction}
     */
    solitaire.removeCardFromTableau = function(card) {
        var self = this;

        // Assume this is the top card (up == 1).  If it's not, then we 
        // should be calling removeCardArrayFromTableau() instead.
        var col = card.getAttribute("col");
        card.removeAttribute("col");
        card.removeAttribute("row");
        card.removeAttribute("up");
        card.classList.remove("up-1");
        var pile = this.tableau[col-1];
        pile.pop();
        card.style.zIndex = 99;
        setCardDraggable(card, false);
        
        // Flip the new top card, if the pile is not empty now, and if the 
        // new top card is face down.
        var undoTurnTableauTopCardFaceUp = self.turnTableauTopCardFaceUp(col, true);
        
        return function() { 
            undoTurnTableauTopCardFaceUp(); 
            self.dropCardOntoTableau(col, card); 
        };
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
        for (var i = 0, timeout = 0; i < cardArray.length; i++, timeout += interval) {
            var card = cardArray[i];
            (function(col, card) {
                setTimeout (function() {
                    self.dropCardOntoTableau(col, card);
                }, timeout);
            })(col, card, timeout);
        }
        
        return function() { self.removeCardArrayFromTableau(cardArray); };
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
    solitaire.removeCardArrayFromTableau = function(cardArray) {
        var self = this;
        
        var bottomCard = cardArray[0];
        var oldCol = parseInt(bottomCard.getAttribute("col"));
        var oldRow = bottomCard.getAttribute("row");
        var oldPile = self.tableau[oldCol - 1];
        
        self.tableau[oldCol - 1] = oldPile.slice(0, oldRow - 1);
        
        return function() { 
            self.dropCardArrayOntoTableau(oldCol, cardArray); 
        };
    };
    
    /*
     *  Moving from the tableau to the tableau, so move the drag target 
     *  and all the cards above it from one column inside the tableau 
     *  to another.
     * 
     * @param {type} newCol
     * @param {type} card
     * @returns {Function}
     */
    solitaire.moveCardArrayOnTableau = function(newCol, card) {
        var self = this;
        
        // Collect the cards that need to be moved
        var oldCol = parseInt(card.getAttribute("col"));
        var oldRow = card.getAttribute("row");
        var oldPile = self.tableau[oldCol - 1];
        var cardArray = oldPile.slice(oldRow - 1);
        self.tableau[oldCol - 1] = oldPile.slice(0, oldRow - 1);
        
        // Moving from the tableau to the tableau, so move the drag target 
        // and all the cards above it from one column inside the tableau 
        // to another.
        var undoRemoveCardArrayFromTableau = self.removeCardArrayFromTableau(cardArray);
        var undoDropCardArrayOntoTableau = self.dropCardArrayOntoTableau(newCol, cardArray);
        var undoTurnTableauTopCardFaceUp = self.turnTableauTopCardFaceUp(oldCol, true);
        
        return function() { 
            undoTurnTableauTopCardFaceUp(); 
            undoDropCardArrayOntoTableau(); 
            undoRemoveCardArrayFromTableau();
        };
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
        var self = this;

        if (card.classList.contains("stock")) {
            // presuming c ard is on top on the stock
            var undoRemoveCardFromStock = self.removeCardFromStock(card);
            return undoRemoveCardFromStock;
        } else if (card.classList.contains("waste")) {
            var undoRemoveCardFromWaste = self.removeCardFromWaste(card);
            return undoRemoveCardFromWaste;
        } else if (card.classList.contains("foundation")) {
            var undoRemoveCardFromFoundation = self.removeCardFromFoundation(card);
            return undoRemoveCardFromFoundation;
        } else if (card.classList.contains("tableau")) {
            var undoRemoveCardFromTableau = self.removeCardFromTableau(card);
            return undoRemoveCardFromTableau;
        }
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
        var col = target.getAttribute("col");
        if (target.classList.contains("tableau") &&
            this.tableauWillAcceptCard(col, card) &&
            card.classList.contains("tableau")) 
        {
            var undoMoveCardArrayOnTableau = this.moveCardArrayOnTableau(col, card);
            return undoMoveCardArrayOnTableau;
        } else {
            if (target.classList.contains("foundation") &&
                this.foundationWillAcceptCard(col, card)) 
            {
                // move the card onto the foundation
                var undoRemoveCardFromPile = this.removeCardFromPile(card);
                var undoDropCardOntoFoundation = this.dropCardOntoFoundation(col, card);
                return function() { undoDropCardOntoFoundation(); undoRemoveCardFromPile(); };
            } else if (target.classList.contains("tableau") &&
                this.tableauWillAcceptCard(col, card)) 
            {
                // move the card onto the tableau
                var undoRemoveCardFromPile = this.removeCardFromPile(card);
                var undoDropCardOntoTableau = this.dropCardOntoTableau(col, card);
                return function() { undoDropCardOntoTableau(); undoRemoveCardFromPile(); };
            } else {
                return function() { };
            }
        }
    };
    
    solitaire.playToFoundation = function(card) {
        for (var col = 1; col <= 4; col++) {
            var pile = this.foundation[col - 1];
            if (card.pip === (pile.length + 1) && 
                    (pile.length === 0 || pile[0].suit === card.suit))
            {
                // move the card onto the foundation
                var undoRemoveCardFromPile = this.removeCardFromPile(card);
                var undoDropCardOntoFoundation = this.dropCardOntoFoundation(col, card);
                return function() { undoDropCardOntoFoundation(); undoRemoveCardFromPile(); };
            }
        }
        return function() { };
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
        // We discover the drag target by reading the transfer data
        var cardID = event.dataTransfer.getData("text");
        var card = document.getElementById(cardID);
        // The drop target is in the drop event, but if the player is dropping 
        // onto a card, we need to make sure we get the card, and not the 
        // card's IMG element.
        var dropTarget = event.target;
        if (dropTarget.tagName === 'IMG') {
            dropTarget = dropTarget.parentNode;
        }
        // Now we can drop the drag target onto the drop target.
        var undoDropCardOntoTarget = this.dropCardOntoTarget(card, dropTarget); 
        this.undoList.push(undoDropCardOntoTarget);
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
        this.undoList = [];
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
        this.adjustScore(-COST_PER_GAME);
        
        for (var row = 1, timeout = 0; row <= 7; row++, timeout += 75) {
            for (var col = row; col <= 7; col++, timeout += 50) {
                (function(row, col, timeout) {
                    setTimeout(function() {
                        // move one card from the stock list to the tableau to the tableau list
                        var card = stock.pop();
                        self.dealCardOntoTableau(card, row, col);
                    }, timeout);
                })(row, col, timeout);
            }
        }
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
        
        var undoList = [];
        function undoFunction() { executeAll(undoList); }
        
        var count = self.waste.length;
        for (var i = 0, timeout = 0; i < count; i++, timeout += 20) {
            var card = self.waste[self.waste.length - 1];
            var col = parseInt(card.getAttribute("col"));
            self.removeCardFromPile(card);
            (function(col, card) { 
                setTimeout(function() {
                    self.dropCardOntoStock(card);
                    undoList.push(function() { self.removeCardFromPile(card); self.dropCardOntoWaste(col, card); });
                }, timeout);
            })(col, card);
        }
        
        return undoFunction;
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
            
        var undoList = [];
        function undoFunction() { executeAll(undoList); }

        var count = Math.min(3, self.stock.length);
        for (var col = 1, timeout = 0; col <= count; col++, timeout += 50) {
            var card = self.stock.pop();
            (function(col, card) {
                setTimeout(function() {
                    self.dropCardOntoWaste(col, card);
                    undoList.push(function() { self.removeCardFromPile(card); self.dropCardOntoStock(card); });
                }, timeout);
            })(col, card);
        }

        return undoFunction;
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
        if (target.tagName === 'IMG') {
            target = target.parentNode;
        }
        
        switch (event.detail) {
            case 1:
                if (target.classList.contains('stock')) {
                    if (target.classList.contains('target')) {
                        var undoResetStock = this.resetStock();
                        this.undoList.push(undoResetStock);
                    } else {
                        // Got a card
                        var undoTurnStock = this.turnStock();
                        this.undoList.push(undoTurnStock);
                    }
                }
                break;
            case 2:
                var col = parseInt(target.getAttribute("col"));
                var zIndex = parseInt(target.style.zIndex);
                if (target.classList.contains("waste") && zIndex === this.waste.length || 
                        target.classList.contains("tableau") && zIndex === this.tableau[col - 1].length) 
                {
                    var undoPlayToFoundation = this.playToFoundation(target);
                    this.undoList.push(undoPlayToFoundation);
                }
                break;
            default:
                console.log("super-double click");
                break;
        }
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