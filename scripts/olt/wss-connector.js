const WebSocket = require('ws');
const Koa = require('koa');
const token = process.env.TOKEN 
  || 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJWV0VOVDNBN1FLWllFTURoWFBKd3dVa1Jpd04tREI5OThQeUpoU0gzRDZFIn0.eyJqdGkiOiJlOGQxZjUzZi01Y2I5LTRhY2EtYTg3ZS0zNTY0ODZkOGNmMTQiLCJleHAiOjE1NDAxMjQ3MDUsIm5iZiI6MCwiaWF0IjoxNTM5MjYwNzE4LCJpc3MiOiJodHRwczovL2FwaS5kZXYub2x0ZC5kZS92MS9pZC9hdXRoL3JlYWxtcy9vbHQiLCJhdWQiOiJvbHQiLCJzdWIiOiJiMDE1NGZjZC1jNjk3LTRmZGQtYWY1Yi02MTBmM2JjZTZmYjciLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJvbHQiLCJub25jZSI6IjhWcURUUGh6T0JZWnY4M1FhMm5OZkZLVUlSb1o5QTVucjhmTnBEZ3oiLCJhdXRoX3RpbWUiOjE1MzkyNjA3MTgsInNlc3Npb25fc3RhdGUiOiI4MWFiY2FjNC0xOGI1LTQzMWItOTc2OS01NDQ0NzdiMWE2MmEiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIioiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIG9sdC1leHRlcm5hbCBlbWFpbCBvZmZsaW5lX2FjY2VzcyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoidGVzdCB1c2VyIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiLW9sdC1lMmUtdGVzdHMtaWQtZW5kcG9pbnRAbGlnaHRlbGxpZ2VuY2UuZGUiLCJnaXZlbl9uYW1lIjoidGVzdCIsImZhbWlseV9uYW1lIjoidXNlciIsImVtYWlsIjoiLW9sdC1lMmUtdGVzdHMtaWQtZW5kcG9pbnRAbGlnaHRlbGxpZ2VuY2UuZGUiLCJ0ZW5hbnQiOiJkZTczNmJmYy0zZDk5LTQwMzctODY3My03NTlmOGE0MDE1OWYifQ.tCtSuV2MSurmLo_eK0Rxekc4zmwgaUi9UDPotvXz1paLA0nGeFY0XsVbKaQzvI8h35DFUmubow3siyI6bVYAjCtelphipwvrcQFdcrEEiqCinNa7I8Oghzv5VkwOeMBCAYNxuiLu9H7ps9RTz08deOFQPsKPBtmzgJ1wapitUPddLy8mp5TpE1bukecXofXM1QlaZqSHP74K_Fn73EoU3qQo2Oy0p1CxPaaIvLKcWpVopMoNSAA27m0vbp-Ss91wvtuOGIV-d61ElkfpNqxqMyYxcZyHld4uTqPAiqLc7nNPiSBJygTIXKPTyi3nlEJI1TSUl1d3MmOAYlV-ByNViA'
const wssUrl = process.env.WSS_URL 
  || 'wss://api.dev.oltd.de/v1/devices/streaming-connections/43279ed77978ac81fef1c60d0851ead4acf13e411496c1f19943bcc584c277da/ws';
if (!wssUrl) {
  throw new Error('Missing url on process.env.WSS_URL')
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