import { DataConnection, Peer } from "peerjs";
import Bot from "./bot";

/// A class which handles player and bot connections
export default class PlayerManager {

    players: Array<DataConnection | Bot> = [];
    botIndices: Array<number> = [];
    eventLog: Array<string> = [];

    // p2p stuff
    peer: Peer; // Own peer object

    redrawHostPage: Function;

    constructor(redrawHostPage: Function) {
        // redraw host window function
        this.redrawHostPage = redrawHostPage;

        // Create own peer object with connection to shared PeerJS server
        this.peer = new Peer("", {
            debug: 2
        });


        // add game manager here
        this.initialize();
    }

    /*
     * Create the Peer object for our end of the connection.
     *
     * Sets up callbacks that handle any events related to our
     * peer object.
     */
    initialize() {
        this.peer.on('open', (id) => {
            this.logEvent(`Host ID obtained: ${this.peer.id}`);
            this.redrawHostPage();
        });
        this.peer.on('connection', (c) => {
            // Handle incoming connections. Do nothing if can't accept new player.
            let newPlayerIndex = this.addPlayer(c);
            if (newPlayerIndex == -1) {
                return;
            };

            // Set up the new players
            this.logEvent(`Connected to: ${c.peer}. Player ${newPlayerIndex}`);
            this.redrawHostPage();
            this.ready(c, newPlayerIndex);
        });
        this.peer.on('disconnected', () => {
            this.logEvent('Connection lost to signalling server. Please reconnect');
            this.redrawHostPage();
        });
        this.peer.on('close', () => {
            this.players = [];
            this.logEvent('Connections all destroyed');
        });
        this.peer.on('error', (err) => {
            this.logEvent(`Error: ${err}`);
        });
    }

    /**
     * Triggered once a connection has been achieved.
     * Defines callbacks to handle incoming data and connection events.
     */
    ready(conn: DataConnection, playerIndex: number) {
        // if conn is null at this stage, throw an error
        if (!conn) {
            throw `Tried to interact with null connection`;
        }


        conn.on('data', (data) => {
            // ensure that the received data is a string
            if (typeof data !== "string") {
                throw `Non-string data type for returned data. Actual type '${typeof data}'`;
            }

            this.receiveMessage(data.toString(), playerIndex);
        });
        conn.on('close', () => {
            this.logEvent("Connection reset with conn. Awaiting connection...");

            // swap out the player with a bot
            this.players[playerIndex] = new Bot();
            this.redrawHostPage();
        });
    }

    receiveMessage(data: string, playerIndex: number) {
        this.logEvent(`P${playerIndex}: ${data}`);
        this.redrawHostPage();
    }

    sendMessage(data: string, playerIndex: number) {
        // Get the connection for this player index
        if (this.players.length <= playerIndex || playerIndex < 0) {
            this.logEvent("Tried to send message to non-existent player");
            return;
        }
        let conn = this.players[playerIndex];

        // Check that we're connected
        if (conn && conn.open) {
            conn.send(data)
            this.redrawHostPage();
        } else {
            this.logEvent("Could not send data to conn. Connection closed.");
        }
    }

    /// Returns whether we added the player or not
    addPlayer(conn: DataConnection): number {
        // if there are already 7 players, replace a bot
        if (this.players.length >= 7) {
            if (this.botIndices.length == 0) {
                this.logEvent("Someone tried to join but there are already 7 players!");
                return -1;
            }

            // replace the first bot
            let index = this.botIndices[0];
            this.players[index] = conn;
            this.logEvent(`Someone tried to join. Replacing bot ${index}`);
            this.botIndices.shift();
            return index;
        }

        this.players.push(conn);
        return this.players.length - 1;
    }

    /// Returns whether we added the bot or not
    addBot(): number {
        // ignore if there are already 7 players
        if (this.players.length >= 7) {
            this.logEvent("Tried to create bot but there are already 7 players!");
            this.redrawHostPage();
            return -1;
        }

        this.players.push(new Bot());
        this.botIndices.push(this.players.length - 1);
        this.logEvent(`Added bot as player ${this.players.length - 1}`);
        this.redrawHostPage();
        return this.players.length - 1;
    }

    logEvent(message: string) {
        this.eventLog.push(message);
    }

    displayEventLog() {
        let output = "";
        this.eventLog.forEach((event) => {
            output += `${event}<br/>`;
        })
        return output;
    }

    displayPlayerCount() {
        return `Players: ${this.players.length}`;
    }

    displayHostId() {
        if (this.peer.id === null) {
            return "Waiting on host ID..."
        }
        return this.peer.id;
    }
}