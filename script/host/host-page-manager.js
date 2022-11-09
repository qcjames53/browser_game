import ConnectionManager from "./connection-manager.js";

class HostPageManager {
    connections = [];
    addPlayerButton = document.getElementById("button-add-player");
    removePlayerButton = document.getElementById("button-remove-player");
    playerCount = document.getElementById("player-count");
    connectionsOverview = document.getElementById("connections-overview");

    constructor() {
        // set up the page buttons
        this.addPlayerButton.addEventListener('click', buttonAddPlayer);
        this.removePlayerButton.addEventListener('click', buttonRemovePlayer);
        this.redrawPageElements();
    }

    redrawPageElements() {
        // Draw the player count
        this.playerCount.innerHTML = `Players: ${this.connections.length}`;

        // Handle drawing player properties
        let tableString = `<table><tr>
            <th>P</th>
            <th>Connection ID</th>
            <th>Status</th>
            <th>Last message sent</th>
            <th>Last message received</th>
            </tr>`;

        // loop over all players
        for (let i = 0; i < this.connections.length; i++) {
            tableString += this.connections[i].getDisplayString();
        }
        tableString += `</table>`;
        this.connectionsOverview.innerHTML = tableString;
    }

    addPlayer() {
        // Make sure don't add more than 7 players
        if (this.connections.length >= 7) return;

        this.connections.push(new ConnectionManager(
            "Player",
            this,
            this.connections.length
        ));
        this.redrawPageElements();
    }

    removePlayer() {
        // Make sure don't remove all players
        if (this.connections.length < 0) return;

        this.connections.pop();
        this.redrawPageElements();
    }
}

function buttonAddPlayer() {
    h.addPlayer();
}

function buttonRemovePlayer() {
    h.removePlayer();
}

// run on page load
let h = new HostPageManager();