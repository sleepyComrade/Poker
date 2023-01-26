const a: number = 6;
import * as webSocket from 'websocket';
import { connection } from 'websocket';
import * as http from 'http';
const WebSocketServer = webSocket.server;
const port = 3002;

const server = http.createServer((request, response) => {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});
server.listen(port, () => {
  console.log((new Date()) + ` Server is listening on port ${port}`);
});

const socket = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

const connections: connection[] = [];

socket.on('request', (request) => {
  const connection = request.accept(undefined, request.origin);
  connections.push(connection);
  console.log((new Date()) + ' Connection accepted.');
  connection.on('message', (message) => {
      if (message.type === 'utf8') {
          console.log('Received Message: ' + message.utf8Data);
          connections.forEach(el => {
            console.log('some');
            el.sendUTF(message.utf8Data);
          })
      }
      else if (message.type === 'binary') {
          console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
          connection.sendBytes(message.binaryData);
      }
  });

  connection.on('close', (reasonCode, description) => {
    connections.splice(connections.indexOf(connection), 1);
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
})