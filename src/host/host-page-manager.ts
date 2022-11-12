import PlayerManager from "./player-manager.js";

export default class HostPageManager {
    playerCountElement: HTMLElement;
    hostLogElement: HTMLElement;
    hostIdElement: HTMLInputElement;
    playerManager: PlayerManager;
    addBotButton: HTMLButtonElement;

    constructor() {
        this.playerManager = new PlayerManager(
            () => { this.redrawPageElements(); }
        );

        // Handle missing page elements                               
        const missingElement = () => { throw "Missing page element" }
        this.playerCountElement = document.getElementById("player-count") ?? missingElement();
        this.hostLogElement = document.getElementById("connections-overview") ?? missingElement();
        this.hostIdElement = document.getElementById("host-id") as HTMLInputElement | null ?? missingElement();
        this.addBotButton = document.getElementById("add-bot-button") as HTMLButtonElement | null ?? missingElement();

        // set up buttons
        this.addBotButton.addEventListener("click", () => this.playerManager.addBot());

        // Draw page elements
        this.redrawPageElements();
    }

    redrawPageElements() {
        this.hostIdElement.value = this.playerManager.displayHostId();
        this.playerCountElement.innerHTML = this.playerManager.displayPlayerCount();
        this.hostLogElement.innerHTML = this.playerManager.displayEventLog();
    }
}