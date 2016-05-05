// required for udp sockets
const dgram = require("dgram");

// required for tcp sockets
const net = require("net");

// multicast address to use
const MULTICAST_ADDRESS = "239.255.22.1";

// map of all active musicians
var musicians = new Map();


/**
 * Periodically cleans up the map of active musicians if
 * they were absent for more than 5 seconds.
 *
 * This is done using setTimeout and not setInterval just
 * in case the map becomes very very large and takes more
 * than one minute to execute.
 */
function cleanMap() {
	var date = new Date();
	for(var entry of musicians.entries()) {
		if(date - entry[1].lastSeen > 5000) {
			musicians.delete(entry[0]);
		}
	}
	setTimeout(cleanMap, 1000);
}

/**
 * Prepare a json string containing all active musicians
 */
function activeMusicians() {
	var data = [];
	for(var musician of musicians.values()) {
		data.push(musician.musician);
	}
	return JSON.stringify(data);
}


// creates the udp server
const udpServer = dgram.createSocket("udp4");


/**
 * On message received adds the new musician to the map.
 */
udpServer.on("message", function (msg, rinfo) {
	var ms = JSON.parse(msg);
	var date = new Date();

	if(musicians.get(ms.uuid) === undefined) {
		ms.activeSince = date;
		musicians.set(ms.uuid, {musician: ms});
	}
	musicians.get(ms.uuid).lastSeen = date;
});


/**
 * On error, show it then kill the program
 */
udpServer.on("error", function(err) {
	console.log("Server error :\n" + err.stack);
	udpServer.close();
	process.exit(1);
});


/**
 * Output udp server address once the program is up and running
 */
udpServer.on("listening", function () {
	var address = udpServer.address();
	console.log("server listening on " + address.address + ":" + address.port);
});


// binds the udp server and adds it to the listening multicast address
udpServer.bind(8800, function() {
	udpServer.addMembership(MULTICAST_ADDRESS);
});

// creates the new tcp server and send the active musicians on connection
var tcpServer = net.createServer(function(socket) {
	socket.end(activeMusicians());
});

// start tcp server
tcpServer.listen(2205, "0.0.0.0");

// launch clean map in 1 second
setTimeout(cleanMap, 1000);
