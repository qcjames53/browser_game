class GameManager {
    constructor(sendFunction) {
        this.sendFunction = sendFunction;
    }

    handleInput(input) {
        this.sendFunction(`You played: ${input}`)
    }
}