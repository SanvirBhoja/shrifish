# 🐠 ShriFish - Quick Start Guide

## What You Have

A complete, production-ready multiplayer card game with bluffing mechanics.

## 5-Minute Setup

### Step 1: Install
```bash
cd ~/Desktop/shrifish
npm install
```

### Step 2: Run
```bash
npm run dev
```

### Step 3: Play
Open two browser tabs:
- Tab 1 & 2: http://localhost:5173

**Tab 1:** Create game → Copy Game ID  
**Tab 2:** Join game → Paste Game ID → Start!

## Deployment

### To Railway (Easiest)
```bash
git push origin main
# Auto-deploys on Railway.app
```

### To Docker
```bash
docker build -t shrifish .
docker run -p 3000:3000 shrifish
```

## Key Files

- `server/src/game.ts` - Game engine
- `client/src/App.tsx` - Main app
- `client/src/components/` - UI components

## Commands

```bash
npm run dev      # Development
npm run build    # Build
npm start        # Production
```

**Ready? Let's go!** 🎮

```bash
cd ~/Desktop/shrifish && npm install && npm run dev
```
