import { Peer } from "peerjs";

export default class ClientManager {
    lastPeerId = null;
    peer = null; // own this.peer object
    conn = null;
    hostIdInput = document.getElementById("host-id") as HTMLInputElement;
    connection_status = document.getElementById("connection-status");
    message = document.getElementById("message");
    connectButton = document.getElementById("connect-button");
    playButton = document.getElementById("card-play");
    sacrificeButton = document.getElementById("card-sacrifice");
    discardButton = document.getElementById("card-discard");
    cardNumber = document.getElementById("card-number") as HTMLInputElement;

    constructor() {
        this.initialize();
    }

    /**
     * Create the this.peer object for our end of the connection.
     *
     * Sets up callbacks that handle any events related to our
     * this.peer object.
     */
    initialize() {
        // Create own this.peer object with connection to shared this.peerJS server
        this.peer = new Peer(null, {
            debug: 2
        });

        this.peer.on('open', (id) => {
            // Workaround for this.peer.reconnect deleting previous id
            if (this.peer.id === null) {
                console.log('Received null id from this.peer open');
                this.peer.id = this.lastPeerId;
            } else {
                this.lastPeerId = this.peer.id;
            }

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

            // Workaround for this.peer.reconnect deleting previous id
            this.peer.id = this.lastPeerId;
            this.peer._lastServerId = this.lastPeerId;
            this.peer.reconnect();
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
    getUrlParam(name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);
        if (results == null)
            return null;
        else
            return results[1];
    }

    displayHand(hand) {
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