# Soundwave

A Spotify-style music player built with plain HTML, CSS and JavaScript. No frameworks, no build step and no audio files: every song is composed live in the browser with the Web Audio API.

**Live demo:** https://lipsha-23.github.io/soundwave/ (turn on GitHub Pages in the repo settings if the link is not live yet)

## Features

- **Player:** play, pause, next, previous, shuffle, repeat, seek bar and volume
- **Generative tracks:** choose a mood (calm, bright, dark or dreamy), a tempo and a seed, and the app composes a new song. The same settings always produce the same song.
- **Share links:** a generated track has a link like `#g-482-calm-96`. Anyone who opens it gets the exact same track.
- **Audio visualizer:** a live frequency display driven by a Web Audio analyser node, colored by the current song
- **Playlists:** create, rename and delete your own playlists, saved in the browser. Add songs with the plus button or by dragging them onto a playlist, and reorder them by drag and drop.
- **Browsing:** Home shelves, a Search page with browse tiles, artist pages and Liked songs
- **Design:** light and dark themes that follow your system, a responsive layout for phones, keyboard focus styles and support for reduced motion

## Getting started

No installation is needed. Download or clone the repo and open `index.html` in a browser.

```
git clone https://github.com/Lipsha-23/soundwave.git
cd soundwave
```

To run it from a local server instead:

```
npx serve .
```

Click any song to start playback. Browsers only allow audio after a click, so a shared link loads the track but waits for you to press play.

## Project structure

```
soundwave/
├── index.html   page structure: sidebar, main area, player bar
├── style.css    themes, layout and responsive rules
└── script.js    song data, audio engine, views, playlists, visualizer
```

## How it works

**Audio engine.** Each track is a short seed that produces a 16-step melody pattern. A scheduler looks ahead and plays notes with oscillators, adds a bass note every few steps and a kick on faster tempos. The notes come from a major or minor scale depending on the mood.

**Share links.** The track settings (seed, mood and tempo) are encoded in the URL hash. On load the app reads the hash, regenerates the track and selects it.

**Playlists.** Playlists and liked songs are stored in `localStorage`. Drag and drop uses the HTML5 drag events, with a plus button menu as the alternative for keyboards and touch screens.

**Visualizer.** An analyser node is connected to the master volume. A canvas reads its frequency data on every animation frame and draws the bars.

## Known limitations

- Songs are synthesized, so there is no real music catalog or licensing
- Everything is stored in one browser, so there are no accounts and nothing syncs between devices
- Drag and drop needs a mouse; touch screens use the plus button
- There are no automated tests yet

## Roadmap

- [ ] Unit tests for the generator and playlist logic
- [ ] Queue panel with play next and add to queue
- [ ] Save generated tracks between visits
- [ ] Media Session API for lock-screen and headphone controls
- [ ] Installable app with a service worker
- [ ] Move to a component framework with TypeScript
- [ ] Backend with accounts and playlists that sync across devices

## License

Add a license of your choice, for example MIT, before sharing the project widely.
