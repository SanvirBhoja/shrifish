import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { ShriFishGame } from "./game.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Serve static files from client build
app.use(express.static(path.join(__dirname, "../../client/dist")));

const games = new Map<string, ShriFishGame>();
const playerToGame = new Map<string, string>();
const socketToPlayer = new Map<string, string>();

io.on("connection", (socket: Socket) => {
  console.log("New connection:", socket.id);

  socket.on("createGame", (playerName, callback) => {
    const playerId = uuidv4();
    const game = new ShriFishGame(playerId, playerName);

    games.set(game.state.id, game);
    playerToGame.set(playerId, game.state.id);
    socketToPlayer.set(socket.id, playerId);

    socket.join(game.state.id);

    console.log(`Game created: ${game.state.id} by ${playerName}`);
    callback(game.state.id, playerId);

    socket.emit("gameState", game.getPlayerView(playerId));
  });

  socket.on("joinGame", (gameId, playerName, callback) => {
    const game = games.get(gameId);
    if (!game) {
      socket.emit("error", "Game not found");
      return;
    }

    if (game.state.gamePhase !== "waiting") {
      socket.emit("error", "Game has already started");
      return;
    }

    const playerId = uuidv4();
    game.addPlayer(playerId, playerName, socket.id);
    playerToGame.set(playerId, gameId);
    socketToPlayer.set(socket.id, playerId);

    socket.join(gameId);
    callback(playerId);

    console.log(`${playerName} joined game ${gameId}`);

    io.to(gameId).emit("gameState", {
      gameId: game.state.id,
      players: game.state.players.map((p) => ({
        id: p.id,
        name: p.name,
        handSize: p.hand.length,
      })),
      gamePhase: "waiting",
    });
  });

  socket.on("startGame", (callback) => {
    const playerId = socketToPlayer.get(socket.id);
    if (!playerId) {
      socket.emit("error", "Player not found");
      return;
    }

    const gameId = playerToGame.get(playerId);
    if (!gameId) {
      socket.emit("error", "Game not found");
      return;
    }

    const game = games.get(gameId);
    if (!game) {
      socket.emit("error", "Game not found");
      return;
    }

    game.startGame();
    console.log(`Game ${gameId} started`);
    callback();

    for (const player of game.state.players) {
      const playerSocket = io.sockets.sockets.get(player.socketId);
      if (playerSocket) {
        playerSocket.emit("gameState", game.getPlayerView(player.id));
      }
    }
  });

  socket.on("askForCards", (rank: string, bluffing: boolean) => {
    const playerId = socketToPlayer.get(socket.id);
    if (!playerId) {
      socket.emit("error", "Player not found");
      return;
    }

    const gameId = playerToGame.get(playerId);
    if (!gameId) {
      socket.emit("error", "Game not found");
      return;
    }

    const game = games.get(gameId);
    if (!game) {
      socket.emit("error", "Game not found");
      return;
    }

    try {
      game.askForCards(playerId, rank as any, bluffing);

      io.to(gameId).emit("challengeStarted", {
        askerName: game.getPlayer(playerId).name,
        rank,
        isBluffing: bluffing,
      });

      for (const player of game.state.players) {
        const playerSocket = io.sockets.sockets.get(player.socketId);
        if (playerSocket) {
          playerSocket.emit("gameState", game.getPlayerView(player.id));
        }
      }
    } catch (err) {
      socket.emit("error", (err as Error).message);
    }
  });

  socket.on("challenge", () => {
    const playerId = socketToPlayer.get(socket.id);
    if (!playerId) {
      socket.emit("error", "Player not found");
      return;
    }

    const gameId = playerToGame.get(playerId);
    if (!gameId) {
      socket.emit("error", "Game not found");
      return;
    }

    const game = games.get(gameId);
    if (!game) {
      socket.emit("error", "Game not found");
      return;
    }

    try {
      const challengeState = game.state.challengeState;
      const asker = game.getPlayer(challengeState?.asker || "");
      const challenger = game.getPlayer(playerId);

      game.challengeAsker(playerId);

      io.to(gameId).emit("challengeResolved", {
        askerName: asker.name,
        challengerName: challenger.name,
        askerWasRight: (challengeState?.claimedCards.length || 0) > 0,
        rank: challengeState?.claimedRank,
      });

      for (const player of game.state.players) {
        const playerSocket = io.sockets.sockets.get(player.socketId);
        if (playerSocket) {
          playerSocket.emit("gameState", game.getPlayerView(player.id));
        }
      }
    } catch (err) {
      socket.emit("error", (err as Error).message);
    }
  });

  socket.on("draw", () => {
    const playerId = socketToPlayer.get(socket.id);
    if (!playerId) {
      socket.emit("error", "Player not found");
      return;
    }

    const gameId = playerToGame.get(playerId);
    if (!gameId) {
      socket.emit("error", "Game not found");
      return;
    }

    const game = games.get(gameId);
    if (!game) {
      socket.emit("error", "Game not found");
      return;
    }

    try {
      game.drawCards(playerId);

      for (const player of game.state.players) {
        const playerSocket = io.sockets.sockets.get(player.socketId);
        if (playerSocket) {
          playerSocket.emit("gameState", game.getPlayerView(player.id));
        }
      }
    } catch (err) {
      socket.emit("error", (err as Error).message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    socketToPlayer.delete(socket.id);
  });
});

app.get("/api/games/:gameId", (req, res) => {
  const game = games.get(req.params.gameId);
  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return;
  }

  res.json(game.getPublicState());
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Catch-all route - serve index.html for SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🐠 ShriFish server running on port ${PORT}`);
});