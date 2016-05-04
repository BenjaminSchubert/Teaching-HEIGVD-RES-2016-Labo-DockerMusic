const dgram = require("dgram");
const uuid = require("node-uuid");

const instruments = {
	piano: "ti-ta-ti",
	trumpet: "pouet",
	flute: "trulu",
	violin: "gzi-gzi",
	drum: "boum-boum"
}


function sendSound() {
	socket.send(json_payload, 0, json_payload.length, 8800, "255.255.255.255", function(err, bytes) {});
}


// check instrument
var playing = {
	sound: instruments[process.argv[2]]
}

if(playing["sound"] == null) {
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
	socket.setBroadcast(true);
});


setInterval(sendSound, 1000);
