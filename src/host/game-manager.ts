// sets up the game states
enum GameState {
    Lobby,
    Active
}

export default class GameManager {

    // which direction to rotate the cards
    rotateToHigherIndex = true;
    gameState: GameState = GameState.Lobby;

    // array of players
    players = []

    constructor() {
    }

    addPlayer() {
    }

    handleInput() {

    }

    dealInitialCards() {

    }

    rotateHands() {

    }

    sendNextTurn() {
        // rotate the hands
    }
}