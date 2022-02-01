"use strict";
process.title = 'ws-test-server';
var webSocketsServerPort = 1337;
var webSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) { });
server.listen(webSocketsServerPort, function() {
  console.log((new Date()) + " Server is listening on port "
      + webSocketsServerPort);
});

var wsServer = new webSocketServer({
  httpServer: server
});

// Variables
let connections = [];

const board = {
  id: 123,
  white_player: null,
  black_player: null,
  moves: [],
};

const playerNames = ['Magnus', 'Fabiano'];


function setBoardPlayer(uid) {
  const player = {
    fide_id: connections.length + 100,
    full_name: playerNames[connections.length],
    rating: 1803,
    federation: 1,
    uid: uid
  };

  if (board.white_player === null) {
    board.white_player = player;
  } else if (board.black_player === null) {
    board.black_player = player;
  }
}

function sendGameStartedMessage(connections, board) {
  const message = {
    message_type: 'GAMING',
    action: 'GAMING_GAME_STARTED',
    board: board
  };

  connections.forEach(con => con.send(JSON.stringify(message)));
}

wsServer.on('request', function(request) {
  console.log((new Date()) + ' Connection from origin '
      + request.origin + '.');

  setBoardPlayer(request.resourceURL.query.uid);
  console.log(request.resourceURL.query.uid);
  var connection = request.accept(null, request.origin); 
  // we need to know client index to remove them on 'close' event
  var index = connections.push(connection) - 1;
  console.log((new Date()) + ' Connection accepted.');

  console.log(connections.length);
  if (connections.length >= 2 && board.white_player && board.black_player) {
    sendGameStartedMessage(connections, board);
  }
  // user sent some message
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      console.log(message);
      const messageObject = JSON.parse(message.utf8Data);
      connections.forEach(clien => clien.send(JSON.stringify(messageObject)));
    }
  });

  // user disconnected
  connection.on('close', function(connection) {
    const uid = request.resourceURL.query.uid;
    if (board.white_player && board.white_player.uid === uid) {
      board.white_player = null;
    }

    if (board.black_player && board.black_player.uid === uid) {
      board.black_player = null;
    }
    connections.splice(index, 1);
  });
});