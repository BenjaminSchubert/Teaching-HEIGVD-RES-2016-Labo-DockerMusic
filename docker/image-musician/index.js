const dgram = require("dgram");

const instruments = {
	piano: new Buffer("ti-ta-ti"),
	trumpet: new Buffer("pouet"),
	flute: new Buffer("trulu"),
	violin: new Buffer("gzi-gzi"),
	drum: new Buffer("boum-boum")
}

function sendSound() {
	socket.send(playing, 0, playing.length, 8800, "255.255.255.255", function(err, bytes) {});
}


// check instrument
playing = instruments[process.argv[2]];

if(playing == null) {
	console.log("Instrument not recognized. Got " + process.argv[2]);
	process.exit(1);
}


// Create socket
socket = dgram.createSocket("udp4");

socket.bind(0, "", function() {
	socket.setBroadcast(true);
});


setInterval(sendSound, 1000);
