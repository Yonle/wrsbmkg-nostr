require("dotenv").config();
const NostrTools = require("nostr-tools");
const WRSBMKG = require("wrs-bmkg");

const pub = require("./relayHandler.js");
let privkey = process.env.PRIVATE_KEY?.startsWith("nsec") ? NostrTools.nip19.decode(process.env.PRIVATE_KEY).data : process.env.PRIVATE_KEY;
let pool = new NostrTools.SimplePool();
let wrs = WRSBMKG();
let posts = 0;

if (!privkey) return console.log("No private key (or nsec) was provided. Aborting.");

console.log("Hello", NostrTools.getPublicKey(privkey));
function post(t, eStr = "") {
  let hashtags = "#wrsbmkg #gempabot #gempabumi " + eStr;
  let note = {
    kind: 1,
    content: t + "\n" + hashtags,
    tags: []
  }

  note.created_at = Math.floor(Date.now() / 1000);
  note.pubkey = NostrTools.getPublicKey(privkey);
  note.tags = hashtags.split(" ").map(i => ["t", i.slice(1)]);
  note.id = NostrTools.getEventHash(note);
  note.sig = NostrTools.getSignature(note, privkey);

  const ok = NostrTools.validateEvent(note);
  const veryOk = NostrTools.verifySignature(note);

  if (ok && veryOk) pub(note);

  console.log(note.content, "\n-----------------------");
}

wrs.on("error", (e) => {
  console.error(e);
  wrs.stopPolling();
  wrs.startPolling();
});

wrs.on("Gempabumi", async (msg) => {
  post(msg.headline);

  const img_url = `https://bmkg-content-inatews.storage.googleapis.com/${msg.eventid}`

  const text = [
    msg.subject,
    msg.description,
    msg.area,
    msg.potential,
    msg.instruction,
   `Informasi dampak berdasarkan data observasi peralatan Acelerometer: ${img_url}.mmi.jpg`,
   `Informasi dampak berbasis kecamatan berdasarkan data observasi peralatan Acelerometer: ${img_url}_rev/impact_list.jpg`,
   `Sebaran peralatan Acelerometer yang digunakan: ${img_url}_rev/loc_map.png`,
   `Hasil perhitungan PGA Max dan MMI berdasarkan data observasi peralatan Acelerometer: ${img_url}_rev/stationlist_MMI.jpg`
  ].join("\n\n");
  post(text);
});

wrs.on("realtime", (msg) => {
  msg.geometry.coordinates.pop();
  let text = [
    msg.properties.place,
    "Tanggal   : " + new Date(msg.properties.time).toLocaleDateString("id"),
    "Waktu     : " +
      `${new Date(msg.properties.time).toLocaleTimeString("us", {
        timeZone: "Asia/Jakarta",
      })} (WIB)`,
    "Magnitudo : " + Number(msg.properties.mag).toFixed(1),
    "Koordinat : " + msg.geometry.coordinates.reverse().join(", "),
  ];

  if (Number(msg.properties.mag) >= 7)
    text.unshift("Peringatan: Gempa berskala M >= 7");
  else if (Number(msg.properties.mag) >= 6)
    text.unshift("Peringatan: Gempa berskala M >= 6");
  else if (Number(msg.properties.mag) >= 5)
    text.push("\nPeringatan: Gempa berskala M >= 5");

  text = text.join("\n");

  post(text, "#gempaM" + Math.floor(msg.properties.mag));
});

wrs.startPolling();

