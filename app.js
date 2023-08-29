// // Require the packages we will use:
// const http = require("http"),
//     fs = require("fs");

// const port = 3456;
// const file = "client.html";
// // Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html, on port 3456:
// const server = http.createServer(function (req, res) {
//     // This callback runs when a new connection is made to our HTTP server.

//     fs.readFile(file, function (err, data) {
//         // This callback runs when the client.html file has been read from the filesystem.

//         if (err) return res.writeHead(500);
//         res.writeHead(200);
//         res.end(data);
//     });
// });
// server.listen(port);

// // Import Socket.IO and pass our HTTP server object to it.
// const socketio = require("socket.io")(http, {
//     wsEngine: 'ws'
// });

// // Attach our Socket.IO server to our HTTP server to listen
// const io = socketio.listen(server);
// io.sockets.on("connection", function (socket) {
//     // This callback runs when a new Socket.IO connection is established.

//     socket.on('message_to_server', function (data) {
//         // This callback runs when the server receives a new message from the client.

//         console.log("message: " + data["message"]); // log it to the Node.JS output
//         io.sockets.emit("message_to_client", { message: data["message"] }) // broadcast the message to other users
//     });
// });
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 2000 });

// Array to store all connected sockets
const connectedSockets = [];
const express = require('express');
const app = express();
const port = 3000;
app.use(express.json()); // For parsing JSON data
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded data


wss.on('connection', function connection(ws) {
    connectedSockets.push(ws); // Add the new socket to the array
    ws.onmessage = function(e) {
        const data = e.data;
        console.log(data);

        // Send the received data to all connected sockets

    };

    ws.on('close', function() {
        // Remove the closed socket from the array
        const index = connectedSockets.indexOf(ws);
        if (index !== -1) {
            connectedSockets.splice(index, 1);
        }
    });
});
app.post('/submit', (req, res) => {
    // Access data from the request body
    const requestData = req.body;

    connectedSockets.forEach(socket => {
        socket.send(requestData['message']);
    });
    // Send a response
    res.send('Received POST request');
  });
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
  });