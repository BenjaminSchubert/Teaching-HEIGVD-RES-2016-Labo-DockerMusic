const dgram = require("dgram");
const net = require("net");
const udpServer = dgram.createSocket("udp4");
const MULTICAST_ADDRESS = "239.255.22.1";

var musicians = new Map();


function cleanMap() {
	var date = new Date();
	for(var entry of musicians.entries()) {
		if(date - entry[1].lastSeen > 5000) {
			musicians.delete(entry[0]);
		}
	}
	setTimeout(cleanMap, 1000);
}

function activeMusicians() {
	var data = [];
	for(var musician of musicians.values()) {
		data.push(musician.musician);
	}
	return JSON.stringify(data);
}

udpServer.on("message", function (msg, rinfo) {
	var ms = JSON.parse(msg);
	var date = new Date();

	if(musicians.get(ms.uuid) === undefined) {
		ms.activeSince = date;
		musicians.set(ms.uuid, {musician: ms});
	}
	musicians.get(ms.uuid).lastSeen = date;
});


udpServer.on("error", function(err) {
	console.log("Server error :\n" + err.stack);
	udpServer.close();
	process.exit(1);
});

udpServer.on("listening", function () {
	var address = udpServer.address();
	console.log("server listening on " + address.address + ":" + address.port);
});

udpServer.bind(8800, function() {
	udpServer.addMembership(MULTICAST_ADDRESS);
});

var tcpServer = net.createServer(function(socket) {
	socket.end(activeMusicians());
});

tcpServer.listen(2205, "0.0.0.0");

setTimeout(cleanMap, 1000);
