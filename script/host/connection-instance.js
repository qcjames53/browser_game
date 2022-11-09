export default class ConnectionInstance {

    hostId = "test id";
    connectionStatus = "Awaiting connection";

    // p2p stuff
    peer = null; // Own peer object
    lastPeerId = null;
    conn = null;

    constructor(connectionManager) {
        this.connectionManager = connectionManager;
        this.initialize();
    }

    /*
     * Create the Peer object for our end of the connection.
     *
     * Sets up callbacks that handle any events related to our
     * peer object.
     */
    initialize() {
        // This is done for the sake of the inline function this calls being correct
        var _this = this;

        // Create own peer object with connection to shared PeerJS server
        this.peer = new Peer(null, {
            debug: 2
        });

        this.peer.on('open', function (id) {
            // Workaround for peer.reconnect deleting previous id
            if (_this.peer.id === null) {
                console.log('Received null id from peer open');
                _this.peer.id = _this.lastPeerId;
            } else {
                _this.lastPeerId = _this.peer.id;
            }

            console.log('ID: ' + _this.peer.id);
            _this.hostId = _this.peer.id;
            _this.connectionStatus = "Awaiting connection...";
            _this.connectionManager.redrawHostPage();
        });
        this.peer.on('connection', function (c) {
            // Allow only a single connection
            if (_this.conn && _this.conn.open) {
                c.on('open', function () {
                    c.send("Already connected to another client");
                    setTimeout(function () { c.close(); }, 500);
                });
                return;
            }

            _this.conn = c;
            console.log("Connected to: " + _this.conn.peer);
            _this.connectionStatus = "Connected";
            _this.connectionManager.redrawHostPage();
            _this.ready();
        });
        this.peer.on('disconnected', function () {
            _this.connectionStatus = "Connection lost. Please reconnect";
            console.log('Connection lost. Please reconnect');
            _this.connectionManager.redrawHostPage();

            // Workaround for peer.reconnect deleting previous id
            _this.peer.id = _this.lastPeerId;
            _this.peer._lastServerId = _this.lastPeerId;
            _this.peer.reconnect();
        });
        this.peer.on('close', function () {
            _this.conn = null;
            _this.connectionStatus = "Connection destroyed. Please refresh";
            console.log('Connection destroyed');
            _this.connectionManager.redrawHostPage();
        });
        this.peer.on('error', function (err) {
            console.log(err);
            alert('' + err);
        });
    }

    /**
     * Triggered once a connection has been achieved.
     * Defines callbacks to handle incoming data and connection events.
     */
    ready() {
        // This is done for the sake of the inline function this calls being correct
        var _this = this;

        this.conn.on('data', function (data) {
            console.log("Data received");
            _this.receiveMessage(data);
        });
        this.conn.on('close', function () {
            _this.connectionStatus = "Connection reset. Awaiting connection...";
            _this.conn = null;
            _this.connectionManager.redrawHostPage();
        });
    }

    receiveMessage(data) {
        this.connectionManager.receiveMessage(data);
        this.connectionManager.redrawHostPage();
    }

    sendMessage(data) {
        // Check that we're connected
        if (this.conn && this.conn.open) {
            this.conn.send(data)
            this.connectionManager.redrawHostPage();
        } else {
            console.log("Could not send data. Connection closed.")
        }
    }
}