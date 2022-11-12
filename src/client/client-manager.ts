import { DataConnection, Peer } from "peerjs";

export default class ClientManager {
    lastPeerId = null;
    peer: Peer; // own this.peer object
    conn: DataConnection | null = null;
    hostIdInput: HTMLInputElement;
    connection_status: HTMLElement;
    message: HTMLElement;
    connectButton: HTMLButtonElement;
    playButton: HTMLButtonElement;
    sacrificeButton: HTMLButtonElement;
    discardButton: HTMLButtonElement;
    cardNumber: HTMLInputElement;

    constructor() {
        // ensure that the htmlelements are correct
        const missingElement = () => { throw "Missing page element" }
        this.hostIdInput = document.getElementById("host-id") as HTMLInputElement | null ?? missingElement();
        this.connection_status = document.getElementById("connection-status") ?? missingElement();
        this.message = document.getElementById("message") ?? missingElement();
        this.connectButton = document.getElementById("connect-button") as HTMLButtonElement | null ?? missingElement();
        this.playButton = document.getElementById("card-play") as HTMLButtonElement | null ?? missingElement();
        this.sacrificeButton = document.getElementById("card-sacrifice") as HTMLButtonElement | null ?? missingElement();
        this.discardButton = document.getElementById("card-discard") as HTMLButtonElement | null ?? missingElement();
        this.cardNumber = document.getElementById("card-number") as HTMLInputElement | null ?? missingElement();


        // Create own this.peer object with connection to shared this.peerJS server
        this.peer = new Peer("", {
            debug: 2
        });

        this.initialize();
    }

    /**
     * Create the this.peer object for our end of the connection.
     *
     * Sets up callbacks that handle any events related to our
     * this.peer object.
     */
    initialize() {

        this.peer.on('open', (id) => {
            // // Workaround for this.peer.reconnect deleting previous id
            // if (this.peer.id === null) {
            //     console.log('Received null id from this.peer open');
            //     this.peer.id = this.lastPeerId;
            // } else {
            //     this.lastPeerId = this.peer.id;
            // }

            console.log('ID: ' + this.peer.id);
        });
        this.peer.on('connection', (c) => {
            // Disallow incoming connections
            c.on('open', function () {
                c.send("Sender does not accept incoming connections");
                setTimeout(function () { c.close(); }, 500);
            });
        });
        this.peer.on('disconnected', () => {
            this.connection_status.innerHTML = "Connection lost. Please reconnect";
            console.log('Connection lost. Please reconnect');

            // // Workaround for this.peer.reconnect deleting previous id
            // this.peer.id = this.lastPeerId;
            // this.peer._lastServerId = this.lastPeerId;
            // this.peer.reconnect();
        });
        this.peer.on('close', () => {
            this.conn = null;
            this.connection_status.innerHTML = "Connection destroyed. Please refresh";
            console.log('Connection destroyed');
        });
        this.peer.on('error', (err) => {
            console.log(err);
            alert('' + err);
        });

        // Set up the button event listeners
        this.connectButton.addEventListener('click', () => this.join());
        this.playButton.addEventListener('click', () => this.playCard());
        this.sacrificeButton.addEventListener('click', () => this.sacrificeCard());
        this.discardButton.addEventListener('click', () => this.discardCard());
    }

    /**
     * Create the connection between the two this.peers.
     *
     * Sets up callbacks that handle any events related to the
     * connection and data received on it.
     */
    join() {
        // Close old connection
        if (this.conn) {
            this.conn.close();
        }

        // Create connection to destination this.peer specified in the input field
        this.conn = this.peer.connect(this.hostIdInput.value, {
            reliable: true
        });

        this.conn.on('open', () => {
            // if conn is null at this stage, throw an error
            if (!this.conn) {
                throw `Tried to interact with null connection`;
            }

            this.connection_status.innerHTML = "Connected to: " + this.conn.peer;
            console.log("Connected to: " + this.conn.peer);

            // Check URL params for comamnds that should be sent immediately
            var command = this.getUrlParam("command");
            if (command) {
                this.conn.send(command);
            }
        });
        // Handle incoming data (messages only since this is the signal sender)
        this.conn.on('data', (data) => {
            // ensure that the received data is a string
            if (typeof data !== "string") {
                throw `Non-string data type for returned data. Actual type '${typeof data}'`;
            }

            this.displayHand(data);
        });
        this.conn.on('close', () => {
            this.connection_status.innerHTML = "Connection closed";
        });
    }

    /**
     * Get first "GET style" parameter from href.
     * This enables delivering an initial command upon page load.
     *
     * Would have been easier to use location.hash.
     */
    getUrlParam(name: string) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);
        if (results == null)
            return null;
        else
            return results[1];
    }

    displayHand(hand: string) {
        this.message.innerHTML = hand;
    }

    playCard() {
        // if we're connected
        if (this.conn && this.conn.open) {
            this.conn.send(`Play card ${this.cardNumber.value}`)
        } else {
            console.log("Could not play card. Connection closed.")
        }
    }

    sacrificeCard() {
        // if we're connected
        if (this.conn && this.conn.open) {
            this.conn.send(`Sacrifice card ${this.cardNumber.value}`)
        } else {
            console.log("Could not sacrifice card. Connection closed.")
        }
    }

    discardCard() {
        // if we're connected
        if (this.conn && this.conn.open) {
            this.conn.send(`Discard card ${this.cardNumber.value}`)
        } else {
            console.log("Could not discard card. Connection closed.")
        }
    }
}