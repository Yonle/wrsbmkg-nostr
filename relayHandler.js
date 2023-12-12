const WebSocket = require("ws");
const relays = process.env.RELAYS?.split(",");
const socks = new Set();

if (!relays?.length) return console.error("No relays provided in RELAYS env variable.");

function conn(addr) {
  const relay = new WebSocket(addr);
  relay.on('open', _ => socks.add(relay));
  relay.on('error', _ => console.error(relay.url, _.toString()));
  relay.on('close', _ => {
    socks.delete(relay);
    conn(addr);
  });
}

module.exports = function pub(event) {
  for (sock of socks) {
    sock.send(JSON.stringify(["EVENT", event]));
  }
}

relays.forEach(conn);
