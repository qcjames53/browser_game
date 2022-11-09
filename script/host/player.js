export default class Player {

    PlayerStatus = {
        Disconnected: "disconnected",
        Waiting: "waiting",
        Thinking: "thinking"
    };

    playerIndex;
    cards = [];
    status = this.PlayerStatus.Waiting;
    
    constructor() {

    }

    startGame(index) {
        this.playerIndex = index;
    }

    newHand(cards) {
        this.cards = cards;
    }
}