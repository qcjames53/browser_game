export default class Player {
    hand: Array<number> = [];
    playerIndex: number;
    playedCards: number[] = [];
    coins: number = 0;

    constructor(playerIndex: number) {
        this.playerIndex = playerIndex;
    }

    determineValidPlays(): void {

    }
}