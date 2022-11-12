import PlayerManager from "./player-manager.js";

export default class HostPageManager {
    connections = [];
    playerCount = document.getElementById("player-count");
    connectionsOverview = document.getElementById("connections-overview");
    hostId = document.getElementById("host-id") as HTMLInputElement;

    playerManager: PlayerManager;

    constructor() {
        this.playerManager = new PlayerManager(
            () => this.redrawPageElements()
        );

        this.redrawPageElements();
    }

    redrawPageElements() {
        this.hostId.value = this.playerManager.displayHostId();
        this.playerCount.innerHTML = this.playerManager.displayPlayerCount();
        this.connectionsOverview.innerHTML = this.playerManager.displayEventLog();
    }
}