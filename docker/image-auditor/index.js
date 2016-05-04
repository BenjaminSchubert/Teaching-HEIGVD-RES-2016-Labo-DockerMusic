const dgram = require("dgram");
const udpServer = dgram.createSocket("udp4");

udpServer.on("message", function (msg, rinfo) {
	console.log("server got : " + msg);
	console.log("from : " + rinfo.address);
});

udpServer.on("listening", function () {
	var address = udpServer.address();
	console.log("server listening on " + address.address + ":" + address.port);
});

udpServer.bind(8800);
