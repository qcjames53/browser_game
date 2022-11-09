import cardJson from "../assets/cards.json" assert {type: "json"};
import Player from "./player";

export default class GameManager {

    // which direction to rotate the cards
    rotateUp = true;

    // array of players
    players = []

    constructor(sendFunction) {
        this.sendFunction = sendFunction;
    }

    addPlayer() {
        this.players.push(new Player())
    }

    handleInput(input) {
        this.sendFunction(`You played: ${input}`)
    }

    dealInitialCards() {

    }

    rotateHands() {

    }

    sendNextTurn() {
        // rotate the hands
    }
}