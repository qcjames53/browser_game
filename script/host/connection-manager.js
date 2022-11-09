import ConnectionInstance from "./connection-instance.js";

export default class ConnectionManager {

    PlayerType = {
        Player: "Player",
        BotRandom: "BotRandom"
    };

    lastSentMessage = "";
    lastReceivedMessage = "";

    constructor(connectionType, hostPageManager, index) {
        this.connectionType = connectionType;
        this.hostPageManager = hostPageManager;
        this.index = index;

        // Set up the connection object
        switch (this.connectionType) {
            case this.PlayerType.Player:
                this.conn = new ConnectionInstance(this);
        }
    }

    sendMessage(data) {
        this.lastSentMessage = data;
        this.conn.sendMessage(data);
    }

    receiveMessage(data) {
        this.lastReceivedMessage = data;

        // parrot the received message back to test connection
        this.sendMessage("Message received: " + data);
    }

    redrawHostPage() {
        this.hostPageManager.redrawPageElements();
    }

    getDisplayString() {
        if (this.connectionType == this.PlayerType.Player) {
            return `<tr>
                <td>${this.index}</td>
                <td>
                    <input type="text" id="player${this.index}-id" value="${this.conn.hostId}">
                    <button onclick="(function(){
                        document.getElementById('player${this.index}-id').select();
                        document.execCommand('copy');
                        })();">Copy ID</button>
                </td>   
                <td>
                    ${this.conn.connectionStatus}
                </td>
                <td> 
                    <input type="text" value="${this.lastSentMessage}">
                </td>
                <td>
                    <input type="text" value="${this.lastReceivedMessage}">
                </td>
            </tr>`;
        }

    }
}