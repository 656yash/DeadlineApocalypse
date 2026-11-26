# The Deadline Apocalypse

Gamified assignment & deadline tracker built with **React**, **Vite**, **Firebase Authentication**, and **Cloud Firestore** (Firebase database only).

## Project Structure

```text
├── index.html
├── package.json
├── vite.config.js
├── firestore.rules
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── firebase/
    │   ├── config.js          # Firebase app, Auth, Firestore setup
    │   └── db.js              # Firestore collections: users, assignments, quests
    ├── utils/
    │   ├── game.js            # Boss HP, level (1-10), urgency, XP, ranks, achievements
    │   └── fx.js              # Confetti bursts, rings, floating text, WebAudio SFX
    ├── styles/
    │   ├── global.css         # Theme, layout, cards, responsive breakpoints
    │   ├── boss.css           # Boss cards, urgency colors (green -> amber -> red)
    │   └── effects.css        # Modals, auth UI, victory overlays, toasts
    └── components/
        ├── ParticleCanvas.jsx
        ├── LandingPage.jsx
        ├── AuthModal.jsx
        ├── Sidebar.jsx
        ├── Topbar.jsx
        ├── BossCard.jsx
        ├── DashboardView.jsx
        ├── BossesView.jsx
        ├── QuestsView.jsx
        ├── ProgressView.jsx
        ├── SettingsView.jsx
        └── Modals.jsx
```

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Firebase Console Setup (`adwise-4e978`)

1. **Authentication -> Sign-in method**: Enable **Email/Password** (and **Google** if desired).
2. **Firestore Database**: Create a Firestore database and publish the rules from `firestore.rules`.
