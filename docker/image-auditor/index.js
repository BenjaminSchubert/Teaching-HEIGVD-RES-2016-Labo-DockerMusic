const dgram = require("dgram");
const udpServer = dgram.createSocket("udp4");
const MULTICAST_ADDRESS = "239.255.22.1";

var musicians = new Map();


function show() {
	var data = [];
	for(var musician of musicians.values()) {
		data.push(musician.musician);
	}
	console.log(data);
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

setInterval(show, 5000);
