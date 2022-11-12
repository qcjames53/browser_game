import { DataConnection, Peer } from "peerjs";
import Bot from "./bot";

/// A class which handles player and bot connections
export default class PlayerManager {

    players: Array<DataConnection | Bot> = [];
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
            // // Workaround for peer.reconnect deleting previous id
            // if (this.peer.id === null) {
            //     this.logEvent('Received null id from peer open');
            //     this.peer.id = this.lastPeerId;
            // } else {
            //     this.lastPeerId = this.peer.id;
            // }

            this.logEvent(`Host ID obtained: ${this.peer.id}`);
            this.redrawHostPage();
        });
        this.peer.on('connection', (c) => {
            // Handle incoming connections. Do nothing if can't accept new player.
            if (!this.addPlayer(c)) {
                return;
            };

            // Set up the new players
            this.logEvent(`Connected to: ${c.peer}`);
            this.redrawHostPage();
            this.ready(c, this.players.length - 1);

            // // Allow only a single connection
            // if (this.conn && this.conn.open) {
            //     c.on('open', () => {
            //         c.send("Already connected to another client");
            //         setTimeout(c.close, 500);
            //     });
            //     return;
            // }

            // this.conn = c;
            // this.logEvent("Connected to: " + this.conn.peer);
            // this.redrawHostPage();
            // this.ready();
        });
        this.peer.on('disconnected', () => {
            this.logEvent('Connection lost to signalling server. Please reconnect');
            this.redrawHostPage();

            // // Workaround for peer.reconnect deleting previous id
            // this.peer.id = this.lastPeerId;
            // this.peer._lastServerId = this.lastPeerId;
            // this.peer.reconnect();
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

            this.logEvent("Data received from conn");
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
    addPlayer(conn: DataConnection): boolean {
        // ignore if there are already 7 players
        if (this.players.length >= 7) {
            this.logEvent("Someone tried to join but there are already 7 players!");
            return false;
        }

        this.players.push(conn);
        return true;
    }

    /// Returns whether we added the bot or not
    addBot(): boolean {
        // ignore if there are already 7 players
        if (this.players.length >= 7) {
            this.logEvent("Tried to create bot but there are already 7 players!");
            return false;
        }

        this.players.push(new Bot());
        return true;
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