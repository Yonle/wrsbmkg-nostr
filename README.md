# wrsbmkg-nostr
Bot Nostr tidak Resmi WRS-BMKG yang digunakan untuk menerima Peringatan Gempa yang dirasakan, dan gempa realtime.

## Menyiapkan bot
Siapkan dependencies yang diperlukan
```
$ npm install
```

Kemudian, Copy file `.env.example` menjadi `.env`
```
$ cp .env.example .env
```

Edit file `.env`, dan isi kolom yang dibutuhkan:
```
# Alamat relay-relay. Masukkan beberapa relay dengan koma ","
# Contoh:
# RELAYS=wss://example1.com,wss://example2.com,wss://example3.com
RELAYS=

# Private Token.
PRIVATE_KEY=
```

## Menjalankan bot
```
node index.js
```

Atau jika anda mau menjalankan bot di background,
```
tmux new sh -c 'while true; do node index.js; done'
```
