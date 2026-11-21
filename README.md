# JackTheCounter
Application for learning to count cards in BlackJack and beat the evil dealer.

Practise card counting across eight antes: ante N deals from an N-deck shoe, a little faster each time.
Every few rounds the table is swept and you give the running count; from ante 2 you also give the true count.
Three wrong answers end the run, lives left become stars, and clearing an ante unlocks the next.

- Three counts to train: Hi-Lo, KO (running count only) and Omega II, each with its own progress.
- Deal speed from ×0.75 to ×3, set from the menu or during a game.
- A Skip button: shows the rest of the hand at once (every card still counts), then clears the table.
- Each hand ends with who won: blackjack, win, push, lose or bust, animated on the table.
- A recap of every round dealt so far, with each card's value and the running count after each round.
- Card sounds on every deal and soft jingles for answers and results, which can be turned off.
- English and French, picked from the browser language and switchable on the menu.
- Guides from the menu: blackjack rules, basic strategy charts with the Hi-Lo index plays, and a counter's handbook.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # game engine tests (node:test)
npm run build    # static site in dist/, with service worker
npm run staging  # test build with every ante unlocked, served on the local network (port 4173)
```

## On a phone

The build is a PWA. Deploy `dist/` to any static host over HTTPS, open it on the phone, then
"Add to Home Screen" (iOS Safari) or "Install app" (Android Chrome). It runs full screen and offline.

## Credits

Colours come from the Balatro modding palette in
[balamod/aseprite-balamod-extension](https://github.com/balamod/aseprite-balamod-extension) (`UI.gpl`).
Cards, suits, jingles and the swirl background are made in code; no game sprites are included.
The card sound is `src/assets/card.mp3`, supplied with the project.
Font: [Jersey 10](https://fonts.google.com/specimen/Jersey+10) (OFL).
