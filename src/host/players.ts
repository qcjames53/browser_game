export default class Player {
    hand: Array<number> = [];
    playerIndex: number;

    constructor(playerIndex: number) {
        this.playerIndex = playerIndex;
    }
}