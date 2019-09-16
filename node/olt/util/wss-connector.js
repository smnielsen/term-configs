const WebSocket = require('ws');
const Koa = require('koa');
const token = process.env.TOKEN || 'Bearer <token>';
const wssUrl =
  process.env.WSS_URL ||
  'wss://api.dev.oltd.de/v1/devices/streaming-connections/<streaming_id>/ws';
if (!wssUrl) {
  throw new Error('Missing url on process.env.WSS_URL');
}

const ws = new WebSocket(wssUrl, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

ws.on('open', function open() {
  ws.send('open');
});

ws.on('message', function incoming(data) {
  console.log('Message:', data);
});

const app = new Koa();

// response
app.use(ctx => {
  ctx.body = 'Hello Koa';
});

app.listen(2222);
