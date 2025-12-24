class GameLogic {
    constructor() {
        this.deck = [];
        this.discardPile = [];
        this.players = [];
        this.currentPlayerIndex = 0;
        this.direction = 1; // 1 for clockwise, -1 for counter-clockwise
        this.currentCard = null;
        this.currentColor = null;
    }

    initGame(players) {
        this.players = players;
        this.createDeck();
        this.shuffleDeck();
        this.dealCards();
        this.startDiscardPile();
    }

    createDeck() {
        const colors = ['red', 'blue', 'green', 'yellow'];
        const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'];
        this.deck = [];

        colors.forEach(color => {
            values.forEach(value => {
                this.deck.push({ color, value });
                if (value !== '0') this.deck.push({ color, value });
            });
        });

        for (let i = 0; i < 4; i++) {
            this.deck.push({ color: 'wild', value: 'wild' });
            this.deck.push({ color: 'wild', value: 'draw4' });
        }
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealCards() {
        this.players.forEach(player => {
            player.hand = this.deck.splice(0, 7);
        });
    }

    startDiscardPile() {
        let card = this.deck.pop();
        while (card.color === 'wild') {
            this.deck.unshift(card);
            card = this.deck.pop();
        }
        this.discardPile.push(card);
        this.currentCard = card;
        this.currentColor = card.color;
    }

    playCard(playerId, cardIndex, chosenColor) {
        const player = this.players.find(p => p.id === playerId);
        const playerIndex = this.players.indexOf(player);

        if (playerIndex !== this.currentPlayerIndex) {
            return { success: false, message: "Not your turn" };
        }

        const card = player.hand[cardIndex];
        if (!this.isValidMove(card)) {
            return { success: false, message: "Invalid move" };
        }

        // Remove from hand and add to discard
        player.hand.splice(cardIndex, 1);
        this.discardPile.push(card);
        this.currentCard = card;
        this.currentColor = card.color === 'wild' ? chosenColor : card.color;

        // Handle special card effects
        this.handleSpecialCards(card);

        // Check win condition
        if (player.hand.length === 0) {
            return { success: true, card, winner: player.name };
        }

        this.nextTurn();
        return { success: true, card };
    }

    isValidMove(card) {
        if (card.color === 'wild') return true;
        return card.color === this.currentColor || card.value === this.currentCard.value;
    }

    handleSpecialCards(card) {
        if (card.value === 'skip') {
            this.nextTurn();
        } else if (card.value === 'reverse') {
            if (this.players.length === 2) {
                this.nextTurn();
            } else {
                this.direction *= -1;
            }
        } else if (card.value === 'draw2') {
            this.nextTurn();
            const nextPlayer = this.players[this.currentPlayerIndex];
            nextPlayer.hand.push(...this.drawFromDeck(2));
        } else if (card.value === 'draw4') {
            this.nextTurn();
            const nextPlayer = this.players[this.currentPlayerIndex];
            nextPlayer.hand.push(...this.drawFromDeck(4));
        }
    }

    drawCard(playerId) {
        const player = this.players.find(p => p.id === playerId);
        const playerIndex = this.players.indexOf(player);

        if (playerIndex !== this.currentPlayerIndex) {
            return { success: false, message: "Not your turn" };
        }

        const drawnCard = this.drawFromDeck(1)[0];
        player.hand.push(drawnCard);

        // After drawing, if it's playable, the player can choose to play it (simplified: just pass turn)
        this.nextTurn();
        return { success: true };
    }

    drawFromDeck(count) {
        if (this.deck.length < count) {
            const topCard = this.discardPile.pop();
            this.deck = [...this.deck, ...this.discardPile];
            this.shuffleDeck();
            this.discardPile = [topCard];
        }
        return this.deck.splice(0, count);
    }

    nextTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + this.direction + this.players.length) % this.players.length;
    }

    getBotMove(botId) {
        const bot = this.players.find(p => p.id === botId);
        const playableIndex = bot.hand.findIndex(card => this.isValidMove(card));

        if (playableIndex !== -1) {
            const card = bot.hand[playableIndex];
            const chosenColor = card.color === 'wild' ? ['red', 'blue', 'green', 'yellow'][Math.floor(Math.random() * 4)] : card.color;
            return { action: 'play', cardIndex: playableIndex, color: chosenColor };
        } else {
            return { action: 'draw' };
        }
    }

    getGameState() {
        return {
            currentCard: this.currentCard,
            currentColor: this.currentColor,
            currentPlayerIndex: this.currentPlayerIndex,
            deckCount: this.deck.length,
            discardPile: [this.currentCard], // Only send the top card
            direction: this.direction,
            winner: this.players.find(p => p.hand.length === 0)?.name || null
        };
    }
}

module.exports = GameLogic;
