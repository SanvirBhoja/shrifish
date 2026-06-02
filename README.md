# 🐠 ShriFish

A multiplayer card game with bluffing mechanics, built with React + Express + Socket.io.

## Game Rules

**Players**: 2-4 players

**Card Distribution**:
- 2-3 players: 7 cards each
- 4+ players: 5 cards each
- Remaining cards form the Pond

**How to Play**:
1. On your turn, ask another player for a specific card rank
2. You can **bluff** - claim to have cards you don't actually have
3. Other players can **challenge** your claim if they think you're lying
4. **Challenge Logic**:
   - If challenger is right (you were bluffing): You give all matching cards + draw 4 penalty cards
   - If challenger is wrong (you told the truth): Challenger draws 4 penalty cards
5. **Books**: Collect 4 matching cards to complete a book (placed face-up)
6. Empty hand? Draw 4 cards and keep playing
7. **Win**: First player to complete all 13 books wins!

## Quick Start

```bash
npm install
npm run dev
```

Visit: **http://localhost:5173**

## Project Structure

```
shrifish/
├── server/              Express + Socket.io backend
├── client/              React + Vite frontend
└── docs/                Documentation files
```

## Development

**Start development server:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Run production build:**
```bash
npm start
```

## Deployment

### Railway (Recommended)
1. Push to GitHub
2. Connect to Railway.app
3. Auto-deploys on push

### Docker
```bash
docker build -t shrifish .
docker run -p 3000:3000 shrifish
```

## Tech Stack

- **Backend**: Node.js + Express + Socket.io + TypeScript
- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: CSS3
- **Deployment**: Railway / Docker / VPS

## API Endpoints

**REST:**
- `GET /api/health` - Health check
- `GET /api/games/:gameId` - Get game state

**Socket.io Events:**
- `createGame(playerName)`
- `joinGame(gameId, playerName)`
- `startGame()`
- `askForCards(rank, bluffing)`
- `challenge()`
- `draw()`

## Features

✅ Multiplayer with Socket.io  
✅ Bluffing & Challenge mechanics  
✅ Book tracking and completion  
✅ Turn management  
✅ Responsive UI  
✅ Real-time updates  
✅ Production ready  

## License

MIT
