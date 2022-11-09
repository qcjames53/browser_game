(function () {

    var lastPeerId = null;
    var peer = null; // own peer object
    var conn = null;
    var hostIdInput = document.getElementById("host-id");
    var connection_status = document.getElementById("connection-status");
    var message = document.getElementById("message");
    var connectButton = document.getElementById("connect-button");
    var playButton = document.getElementById("card-play");
    var sacrificeButton = document.getElementById("card-sacrifice");
    var discardButton = document.getElementById("card-discard");
    var cardNumber = document.getElementById("card-number")

    /**
     * Create the Peer object for our end of the connection.
     *
     * Sets up callbacks that handle any events related to our
     * peer object.
     */
    function initialize() {
        // Create own peer object with connection to shared PeerJS server
        peer = new Peer(null, {
            debug: 2
        });

        peer.on('open', function (id) {
            // Workaround for peer.reconnect deleting previous id
            if (peer.id === null) {
                console.log('Received null id from peer open');
                peer.id = lastPeerId;
            } else {
                lastPeerId = peer.id;
            }

            console.log('ID: ' + peer.id);
        });
        peer.on('connection', function (c) {
            // Disallow incoming connections
            c.on('open', function () {
                c.send("Sender does not accept incoming connections");
                setTimeout(function () { c.close(); }, 500);
            });
        });
        peer.on('disconnected', function () {
            connection_status.innerHTML = "Connection lost. Please reconnect";
            console.log('Connection lost. Please reconnect');

            // Workaround for peer.reconnect deleting previous id
            peer.id = lastPeerId;
            peer._lastServerId = lastPeerId;
            peer.reconnect();
        });
        peer.on('close', function () {
            conn = null;
            connection_status.innerHTML = "Connection destroyed. Please refresh";
            console.log('Connection destroyed');
        });
        peer.on('error', function (err) {
            console.log(err);
            alert('' + err);
        });
    };

    /**
     * Create the connection between the two Peers.
     *
     * Sets up callbacks that handle any events related to the
     * connection and data received on it.
     */
    function join() {
        // Close old connection
        if (conn) {
            conn.close();
        }

        // Create connection to destination peer specified in the input field
        conn = peer.connect(hostIdInput.value, {
            reliable: true
        });

        conn.on('open', function () {
            connection_status.innerHTML = "Connected to: " + conn.peer;
            console.log("Connected to: " + conn.peer);

            // Check URL params for comamnds that should be sent immediately
            var command = getUrlParam("command");
            if (command)
                conn.send(command);
        });
        // Handle incoming data (messages only since this is the signal sender)
        conn.on('data', function (data) {
            displayHand(data);
        });
        conn.on('close', function () {
            connection_status.innerHTML = "Connection closed";
        });
    };

    /**
     * Get first "GET style" parameter from href.
     * This enables delivering an initial command upon page load.
     *
     * Would have been easier to use location.hash.
     */
    function getUrlParam(name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);
        if (results == null)
            return null;
        else
            return results[1];
    };

    function displayHand(hand) {
        message.innerHTML = hand;
    }

    function playCard() {
        // if we're connected
        if (conn && conn.open) {
            conn.send(`Play card ${cardNumber.value}`)
        } else {
            console.log("Could not play card. Connection closed.")
        }
    };

    function sacrificeCard() {
        // if we're connected
        if (conn && conn.open) {
            conn.send(`Sacrifice card ${cardNumber.value}`)
        } else {
            console.log("Could not sacrifice card. Connection closed.")
        }
    };

    function discardCard() {
        // if we're connected
        if (conn && conn.open) {
            conn.send(`Discard card ${cardNumber.value}`)
        } else {
            console.log("Could not discard card. Connection closed.")
        }
    };

    // Set up the button event listeners
    connectButton.addEventListener('click', join);
    playButton.addEventListener('click', playCard);
    sacrificeButton.addEventListener('click', sacrificeCard);
    discardButton.addEventListener('click', discardCard);

    // Since all our callbacks are setup, start the process of obtaining an ID
    initialize();
})();