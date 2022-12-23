import PlayerManager from "./player-manager";
import GameManager from "./game-manager";

export default class HostPageManager {

    // Page elements
    playerCountElement: HTMLElement;
    hostLogElement: HTMLElement;
    hostIdElement: HTMLInputElement;
    addBotButton: HTMLButtonElement;

    // Game properties
    playerManager: PlayerManager;
    gameManager: GameManager;

    constructor() {
        // Create game properties
        this.playerManager = new PlayerManager(
            () => { this.redrawPageElements(); }
        );
        this.gameManager = new GameManager();

        // Handle missing page elements                               
        const missingElement = () => { throw "Missing page element" }
        this.playerCountElement = document.getElementById("player-count") ?? missingElement();
        this.hostLogElement = document.getElementById("connections-overview") ?? missingElement();
        this.hostIdElement = document.getElementById("host-id") as HTMLInputElement | null ?? missingElement();
        this.addBotButton = document.getElementById("add-bot-button") as HTMLButtonElement | null ?? missingElement();

        // set up buttons
        this.addBotButton.addEventListener("click", () => this.playerManager.addBot());

        // Draw page elements after setup
        this.redrawPageElements();
    }

    redrawPageElements() {
        this.hostIdElement.value = this.playerManager.displayHostId();
        this.playerCountElement.innerHTML = this.playerManager.displayPlayerCount();
        this.hostLogElement.innerHTML = this.playerManager.displayEventLog();
    }
}