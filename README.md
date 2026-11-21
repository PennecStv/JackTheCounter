# JackTheCounter
Application for learning to count cards in BlackJack and beat the evil dealer.

Practise card counting across eight antes: ante N deals from an N-deck shoe, a little faster each time.
Every few rounds the table is swept and you give the running count; from ante 2 you also give the true count.
Three wrong answers end the run, lives left become stars, and clearing an ante unlocks the next.

- Three counts to train: Hi-Lo, KO (running count only) and Omega II, each with its own progress.
- Deal speed (slow, normal, fast) and chiptune sound effects, both saved on the device.
- Guides from the menu: blackjack rules, basic strategy charts with the Hi-Lo index plays, and a counter's handbook.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # game engine tests (node:test)
npm run build    # static site in dist/, with service worker
```

## On a phone

The build is a PWA. Deploy `dist/` to any static host over HTTPS, open it on the phone, then
"Add to Home Screen" (iOS Safari) or "Install app" (Android Chrome). It runs full screen and offline.

## Credits

Colours come from the Balatro modding palette in
[balamod/aseprite-balamod-extension](https://github.com/balamod/aseprite-balamod-extension) (`UI.gpl`).
Cards, suits, sounds and the swirl background are made in code; no game sprites or audio are included.
Font: [Jersey 10](https://fonts.google.com/specimen/Jersey+10) (OFL).
