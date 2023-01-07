import GameManager from "./game-manager";
import Player from "./player";

export default class GameTestManager {

    // Page elements
    playerCountElement: HTMLInputElement;
    startGameElement: HTMLButtonElement;
    getDeckElement: HTMLButtonElement;
    dealCardsElement: HTMLButtonElement;
    determineValidPlaysElement: HTMLButtonElement;
    playAllCardsElement: HTMLButtonElement;
    playerNumberElement: HTMLInputElement;
    cardNumberElement: HTMLInputElement;
    playCardElement: HTMLButtonElement;
    sacrificeCardElement: HTMLButtonElement;
    discardCardElement: HTMLButtonElement;
    playerHandsElement: HTMLDivElement;
    messagesElement: HTMLDivElement;

    // Game
    gameManager: GameManager = new GameManager(-1);

    constructor() {
        // Set all page elements
        const missingElement = () => { throw "Missing page element" }
        this.playerCountElement = document.getElementById("player-count") as HTMLInputElement | null ?? missingElement();
        this.startGameElement = document.getElementById("start-game") as HTMLButtonElement | null ?? missingElement();
        this.getDeckElement = document.getElementById("get-deck") as HTMLButtonElement | null ?? missingElement();
        this.dealCardsElement = document.getElementById("deal-cards") as HTMLButtonElement | null ?? missingElement();
        this.determineValidPlaysElement = document.getElementById("determine-valid-plays") as HTMLButtonElement | null ?? missingElement();
        this.playAllCardsElement = document.getElementById("play-all-cards") as HTMLButtonElement | null ?? missingElement();
        this.playerNumberElement = document.getElementById("player-number") as HTMLInputElement | null ?? missingElement();
        this.cardNumberElement = document.getElementById("card-number") as HTMLInputElement | null ?? missingElement();
        this.playCardElement = document.getElementById("card-play") as HTMLButtonElement | null ?? missingElement();
        this.sacrificeCardElement = document.getElementById("card-sacrifice") as HTMLButtonElement | null ?? missingElement();
        this.discardCardElement = document.getElementById("card-discard") as HTMLButtonElement | null ?? missingElement();
        this.playerHandsElement = document.getElementById("player-hands") as HTMLDivElement | null ?? missingElement();
        this.messagesElement = document.getElementById("messages") as HTMLDivElement | null ?? missingElement();

        // Set up buttons
        this.startGameElement.addEventListener("click", () => this.startGame());
        this.getDeckElement.addEventListener("click", () => this.getDeck());
        this.dealCardsElement.addEventListener("click", () => this.dealCards());
        this.determineValidPlaysElement.addEventListener("click", () => this.determineValidPlays());
        this.playAllCardsElement.addEventListener("click", () => this.playAllCards());
        this.playCardElement.addEventListener("click", () => this.playCard());
        this.sacrificeCardElement.addEventListener("click", () => this.sacrificeCard());
        this.discardCardElement.addEventListener("click", () => this.discardCard());
    }

    startGame() {
        let playerCount: number = parseInt(this.playerCountElement.value);
        this.gameManager = new GameManager(playerCount);
        this.logMessage(`Started a game with ${playerCount} players`);
    }

    getDeck() {
        this.logMessage("Getting deck");
        this.gameManager.getDeck();
        this.updatePlayerHands();
    }

    dealCards() {
        this.logMessage("Dealing cards");
        this.gameManager.dealCards();
        this.updatePlayerHands();
    }

    determineValidPlays() {
        this.logMessage("Determining valid plays");
        this.gameManager.determineValidPlays();
        this.updatePlayerHands();
    }

    playAllCards() {
        this.logMessage("Play all cards");
    }

    playCard() {
        let setPlayer = this.playerNumberElement.value;
        let setCard = this.cardNumberElement.value;
        this.logMessage(`Player ${setPlayer} plays card ${setCard}`);
    }

    sacrificeCard() {
        let setPlayer = this.playerNumberElement.value;
        let setCard = this.cardNumberElement.value;
        this.logMessage(`Player ${setPlayer} sacrifices card ${setCard}`);
    }

    discardCard() {
        let setPlayer = this.playerNumberElement.value;
        let setCard = this.cardNumberElement.value;
        this.logMessage(`Player ${setPlayer} discards card ${setCard}`);
    }

    updatePlayerHands() {
        this.playerHandsElement.innerHTML = "";

        // Display cards to deal
        this.playerHandsElement.innerHTML += `Cards to deal: ${this.gameManager.cardsToDeal.sort((n1, n2) => n1 - n2)} [${this.gameManager.cardsToDeal.length}]<br/>`;

        // Display player states
        for (let p = 0; p < this.gameManager.playerCount; p++) {
            let player: Player = this.gameManager.players[p];

            this.playerHandsElement.innerHTML += `<br/>Player ${player.playerIndex} - Coins:${player.coins} - Next move: ${player.nextMove}`;

            let playerTable = `<table><tr><th>Hand</th>`;
            for (let card in player.hand.sort((n1, n2) => n1 - n2)) {
                playerTable += `<td>${player.hand[card]}</td>`;
            }
            playerTable += `</tr>`;
            let playRow = `<th>P</th>`;
            let sacRow = `<th>S</th>`;
            let disRow = `<th>D</th>`;
            for (let c = 0; c < player.validPlays.length; c++) {
                playRow += `<td>${player.validPlays[c][0]}</td>`
                sacRow += `<td>${player.validPlays[c][1]}</td>`
                disRow += `<td>${player.validPlays[c][2]}</td>`
            }
            playerTable += `<tr>${playRow}</tr><tr>${sacRow}</tr><tr>${disRow}</tr></table>`

            this.playerHandsElement.innerHTML += playerTable;
        }
    }

    logMessage(message: String) {
        this.messagesElement.innerHTML += `${message}<br/>`
    }
}