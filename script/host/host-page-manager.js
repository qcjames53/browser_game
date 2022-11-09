import ConnectionInstance from "./connection-instance.js";
//import GameManager from "./game_manager.js";

class HostPageManager {
    connections = [];
    addPlayerButton = document.getElementById("button-add-player");
    removePlayerButton = document.getElementById("button-remove-player");
    playerCount = document.getElementById("player-count");
    connectionsOverview = document.getElementById("connections-overview");

    constructor() {

    }

    init() {
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
            <th>Player Name</th>
            <th>Connection ID</th>
            <th>Status</th>
            <th>Last message sent</th>
            <th>Last message received</th>
            </tr>`;

        // loop over all players
        for (let i = 0; i < this.connections.length; i++) {
            tableString += `<tr>
                <td>Player ${i}</td>
                <td>
                    <input type="text" id="player${i}-id" value="${this.connections[i].hostId}">
                    <button onclick="(function(){
                        document.getElementById('player${i}-id').select();
                        document.execCommand('copy');
                        })();">Copy ID</button>
                </td>   
                <td>
                    ${this.connections[i].connectionStatus}
                </td>
                <td> 
                    <input type="text" value="${this.connections[i].lastSentMessage}">
                </td>
                <td>
                    <input type="text" value="${this.connections[i].lastReceivedMessage}">
                </td>
            </tr>`;
        }
        tableString += `</table>`;
        this.connectionsOverview.innerHTML = tableString;
    }

    addPlayer() {
        // Make sure don't add more than 7 players
        if (this.connections.length >= 7) return;

        this.connections.push(new ConnectionInstance(this));
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
h.init();