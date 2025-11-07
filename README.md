# Cat Snack Drop 🐱

A simple browser game where you control a cat catching snacks and dodging junk.

**🎮 [Play the game online](https://catsnackdrop.vercel.app)** - No installation needed!

## First Time Setup

### Step 1: Check if You Have Node.js

1. Open the terminal in Cursor (View → Terminal, or press `` Ctrl+` ``)
2. Copy and paste this into your terminal:
   ```bash
   node --version
   ```
3. Press Enter

**If you see a version number (like `v20.x.x`):** You're good! Skip to Step 2. ✅

**If you see an error:** You need to install Node.js. 
- **On Mac:** Copy and paste this: `brew install node` (if you have Homebrew) or download from [nodejs.org](https://nodejs.org/)
- **On Windows:** Download the installer from [nodejs.org](https://nodejs.org/)
- **On Linux:** Copy and paste this: `sudo apt install nodejs npm` (Ubuntu/Debian) or `sudo yum install nodejs npm` (Fedora)

### Step 2: Get This Code

**Option A: Download as ZIP (Easiest)**
1. On GitHub, click the green "Code" button
2. Click "Download ZIP"
3. Unzip the folder
4. In Cursor: File → Open Folder → Select the unzipped folder

**Option B: Using Git**
1. Open the terminal in Cursor
2. Copy and paste this (replace with your repo URL):
   ```bash
   git clone [your-repo-url-here]
   ```
3. Press Enter
4. In Cursor: File → Open Folder → Select the cloned folder

### Step 3: Install the Game Files

1. Make sure you have the project folder open in Cursor
2. Open the terminal (View → Terminal, or `` Ctrl+` ``)
3. Copy and paste this:
   ```bash
   npm install
   ```
4. Press Enter and wait for it to finish (might take a minute)

### Step 4: Start the Game

In the same terminal, copy and paste this:
```bash
npm run dev
```

Press Enter. You'll see something like:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Step 5: Play!

1. Click the `http://localhost:5173/` link in the terminal (or copy/paste it into your browser)
2. The game will open! 🎮

**To stop the game:** Press `Ctrl+C` in the terminal.

---

## How to Play

- **Move the cat:** Use `← →` arrow keys or `A / D` keys
- **Pause:** Press `Space` or `P`
- **Restart:** Press `R`

**Goal:** Catch the good snacks (🐟 🥩 🧀 🍣) and avoid the junk (🥦 🥾 💣 🧹)!

---

## Troubleshooting

**"npm: command not found" or "node: command not found"**
- You need to install Node.js (see Step 1)

**"Port 5173 is already in use"**
- Something else is using that port. Close other programs or restart your computer.

**The game won't load**
- Make sure you ran `npm install` first
- Make sure `npm run dev` is still running in the terminal

---

Made with React + Vite + TypeScript. No external APIs, no assets — just vibes 🐾
