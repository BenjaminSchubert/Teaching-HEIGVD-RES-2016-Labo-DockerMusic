// required for udp sockets
const dgram = require("dgram");

// required to generate uuids
const uuid = require("node-uuid");

// multicast address
const MULTICAST_ADDRESS = "239.255.22.1";

// list of available instruments
const instruments = {
	piano: "ti-ta-ti",
	trumpet: "pouet",
	flute: "trulu",
	violin: "gzi-gzi",
	drum: "boum-boum"
};

// sends the sound to the server
function sendSound() {
	socket.send(json_payload, 0, json_payload.length, 8800, MULTICAST_ADDRESS, function(err, bytes) {});
}


// check instrument
var playing = {
	sound: instruments[process.argv[2]]
};


if(playing["sound"] === undefined) {
	console.log("Instrument not recognized. Got " + process.argv[2]);
	process.exit(1);
}

// generate UUID
playing.uuid = uuid.v4();

// prepare json payload
json_payload = new Buffer(JSON.stringify(playing));

// Create socket
var socket = dgram.createSocket("udp4");

socket.bind(0, "", function() {
	socket.addMembership(MULTICAST_ADDRESS);
	socket.setMulticastTTL(1);
});


// send sound every second
setInterval(sendSound, 1000);
