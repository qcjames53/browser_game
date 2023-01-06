// import the card json
import cardsToUse from '../../assets/cards_to_use.json';

// import required objects
import Player from './player';

// Game constants
const MIN_PLAYERS = 3;
const MAX_PLAYERS = 7;
const MAX_AGE = 3;
const STARTING_COINS = 3;

export default class GameManager {

    playerCount: number;
    age: number;
    isValidGame: boolean;

    // array of cards to deal 
    cardsToDeal: number[] = [];

    // which direction to rotate the cards
    rotateToHigherIndex: boolean = true;

    // array of players
    players: Player[] = []

    constructor(playerCount: number) {
        this.playerCount = playerCount;
        this.age = 0;
        this.isValidGame = MIN_PLAYERS <= playerCount && playerCount <= MAX_PLAYERS;

        // Add all players
        for (let p = 0; p < this.playerCount; p++) {
            this.players.push(new Player(p));
            this.players[p].coins = STARTING_COINS;
        }
    }

    // Ends the age and draws new cards
    getDeck(): void {
        // If this game is invalid, do nothing here
        if (!this.isValidGame) {
            return;
        }

        // End the age
        // clear player hands
        this.players.forEach(function (player) {
            player.hand = [];
        });
        this.cardsToDeal = [];
        this.age++;

        // If the age is above the maximum, end the game and invalidate it
        if (this.age > MAX_AGE) {
            this.isValidGame = false;
            return;
        }

        // Get new cards based on age and player count. Combine all cards in 
        // cardsToUse["age1"][2,n) where n is the number of players. Allow 
        // for duplicates
        let cardsSlice: number[][] = cardsToUse["age1"].slice(2, this.playerCount);
        if (this.age == 2) {
            cardsSlice = cardsToUse["age2"].slice(2, this.playerCount);
        } else if (this.age == 3) {
            cardsSlice = cardsToUse["age3"].slice(2, this.playerCount);
            // Get n+2 guild cards randomly where n is the number of players
            // and add these to the cardsSlice
            let shuffledGuildCards: number[] = Array.from(cardsToUse["guilds"]);
            shuffleArray(shuffledGuildCards);
            cardsSlice.push(shuffledGuildCards.slice(0, this.playerCount + 2));
        }

        // Add new cards to dealer deck
        for (let slice of cardsSlice) {
            for (let card of slice) {
                this.cardsToDeal.push(card);
            }
        }
    }

    // Deals the dealer deck evenly to the players
    dealCards(): void {
        // If this game is invalid, do nothing here
        if (!this.isValidGame) {
            return;
        }

        // Check that the cards will divide evenly between all players. If not, invalidate the game
        if (this.cardsToDeal.length == 0 || this.cardsToDeal.length % this.playerCount != 0) {
            this.isValidGame = false;
            return;
        }

        // Shuffle the cards
        let shuffledCardsToDeal: number[] = Array.from(this.cardsToDeal);
        shuffleArray(shuffledCardsToDeal);

        // Deal the cards evenly
        let cardsPerPlayer = Math.floor(shuffledCardsToDeal.length / this.playerCount);
        for (let p = 0; p < this.playerCount; p++) {
            this.players[p].hand = shuffledCardsToDeal.slice(cardsPerPlayer * p, cardsPerPlayer * (p + 1));
        }
    }

    // Determine all the valid plays for each player
    determineValidPlays(): void {
        for (let p = 0; p < this.playerCount; p++) {
            this.players[p].determineValidPlays();
        }
    }
}

// Randomize array in-place using Durstenfeld shuffle algorithm
// Stolen from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}