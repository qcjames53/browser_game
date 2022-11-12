import { DataConnection, Peer } from "peerjs";

/// A class which handles player and bot connections
export default class PlayerManager {

    players = [];
    bots = [];
    eventLog: Array<string> = [];

    // p2p stuff
    peer: Peer; // Own peer object
    lastPeerId: string | null = null;
    conn: DataConnection | null = null;

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
            // Allow only a single connection
            if (this.conn && this.conn.open) {
                c.on('open', () => {
                    c.send("Already connected to another client");
                    setTimeout(c.close, 500);
                });
                return;
            }

            this.conn = c;
            this.logEvent("Connected to: " + this.conn.peer);
            this.redrawHostPage();
            this.ready();
        });
        this.peer.on('disconnected', () => {
            this.logEvent('Connection lost. Please reconnect');
            this.redrawHostPage();

            // // Workaround for peer.reconnect deleting previous id
            // this.peer.id = this.lastPeerId;
            // this.peer._lastServerId = this.lastPeerId;
            // this.peer.reconnect();
        });
        this.peer.on('close', () => {
            this.conn = null;
            this.logEvent('Connection destroyed');
        });
        this.peer.on('error', (err) => {
            this.logEvent(`Error: ${err}`);
        });
    }

    /**
     * Triggered once a connection has been achieved.
     * Defines callbacks to handle incoming data and connection events.
     */
    ready() {
        // if conn is null at this stage, throw an error
        if (!this.conn) {
            throw `Tried to interact with null connection`;
        }


        this.conn.on('data', (data) => {
            // ensure that the received data is a string
            if (typeof data !== "string") {
                throw `Non-string data type for returned data. Actual type '${typeof data}'`;
            }

            this.logEvent("Data received from conn");
            this.receiveMessage(data.toString());
        });
        this.conn.on('close', () => {
            this.logEvent("Connection reset with conn. Awaiting connection...");
            this.conn = null;
            this.redrawHostPage();
        });
    }

    receiveMessage(data: string) {
        this.logEvent(data);
        this.redrawHostPage();
    }

    sendMessage(data: string) {
        // Check that we're connected
        if (this.conn && this.conn.open) {
            this.conn.send(data)
            this.redrawHostPage();
        } else {
            this.logEvent("Could not send data to conn. Connection closed.")
        }
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
        return `Players: ${this.players.length + this.bots.length}`;
    }

    displayHostId() {
        if (this.peer.id === null) {
            return "Waiting on host ID..."
        }
        return this.peer.id;
    }
}