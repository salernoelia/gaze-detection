const dgram = require('dgram');
const WebSocket = require('ws');

const udpPort = 7070;
const wsPort = 8080;


const udpServer = dgram.createSocket('udp4');


const wss = new WebSocket.Server({ port: wsPort });

wss.on('connection', function connection(ws) {
  console.log('WebSocket client connected');
});


udpServer.on('message', function (msg, rinfo) {

  if (msg.length !== 32) {
    console.error('Unexpected packet size:', msg.length);
    return;
  }
  // Read the timestamp (int64)
  const timestamp = msg.readBigInt64LE(0);
  // Read the six int32 values
  const l_cx = msg.readInt32LE(8);
  const l_cy = msg.readInt32LE(12);
  const l_dx = msg.readInt32LE(16);
  const l_dy = msg.readInt32LE(20);
  const pitch_scaled = msg.readInt32LE(24);
  const yaw_scaled = msg.readInt32LE(28);

  // Convert pitch and yaw back to float
  const pitch = pitch_scaled / 1000.0;
  const yaw = yaw_scaled / 1000.0;

  const data = {
    timestamp: timestamp.toString(),
    l_cx: l_cx,
    l_cy: l_cy,
    l_dx: l_dx,
    l_dy: l_dy,
    pitch: pitch,
    yaw: yaw
  };

  console.log('Received UDP data:', data);

  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
});

udpServer.on('error', function (err) {
  console.error('UDP server error:', err.stack);
  udpServer.close();
});

udpServer.on('listening', function () {
  const address = udpServer.address();
  console.log(`UDP server listening on ${address.address}:${address.port}`);
});

udpServer.bind(udpPort);
