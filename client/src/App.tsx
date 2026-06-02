import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import "./App.css";
import GameLobby from "./components/GameLobby";
import GameBoard from "./components/GameBoard";
import GameEnd from "./components/GameEnd";

interface GameState {
  gameId: string;
  players: any[];
  pondSize: number;
  gamePhase: "waiting" | "asking" | "challenge" | "drawing" | "finished";
  currentTurn: string;
  currentTurnName: string;
  challengeActive: boolean;
  winner?: string;
  myHand?: any[];
  myId?: string;
}

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [gamePhase, setGamePhase] = useState<"lobby" | "game" | "end">("lobby");

  useEffect(() => {
    const socketUrl = import.meta.env.DEV ? "http://localhost:3000" : window.location.origin;
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("Connected to server");
    });

    newSocket.on("gameState", (state: GameState) => {
      console.log("Game state updated:", state);
      setGameState(state);

      if (state.gamePhase === "finished") {
        setGamePhase("end");
      } else if (state.gamePhase !== "waiting") {
        setGamePhase("game");
      }
    });

    newSocket.on("error", (message: string) => {
      setError(message);
      setTimeout(() => setError(""), 5000);
    });

    newSocket.on("challengeStarted", (data: any) => {
      console.log("Challenge started:", data);
    });

    newSocket.on("challengeResolved", (data: any) => {
      console.log("Challenge resolved:", data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleCreateGame = (name: string) => {
    if (!socket) return;

    setPlayerName(name);
    socket.emit("createGame", name, (gameId: string, newPlayerId: string) => {
      setPlayerId(newPlayerId);
      console.log(`Game created: ${gameId}, Player: ${newPlayerId}`);
    });
  };

  const handleJoinGame = (gameId: string, name: string) => {
    if (!socket) return;

    setPlayerName(name);
    socket.emit("joinGame", gameId, name, (newPlayerId: string) => {
      setPlayerId(newPlayerId);
      console.log(`Joined game: ${gameId}, Player: ${newPlayerId}`);
    });
  };

  const handleStartGame = () => {
    if (!socket) return;
    socket.emit("startGame", () => {
      console.log("Game started");
    });
  };

  const handleAskForCards = (rank: string, bluffing: boolean) => {
    if (!socket) return;
    socket.emit("askForCards", rank, bluffing);
  };

  const handleChallenge = () => {
    if (!socket) return;
    socket.emit("challenge");
  };

  const handleDraw = () => {
    if (!socket) return;
    socket.emit("draw");
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🐠 ShriFish</h1>
        <p>A game of bluffing and challenges</p>
      </header>

      {error && <div className="error-message">{error}</div>}

      <main className="app-main">
        {gamePhase === "lobby" && (
          <GameLobby onCreateGame={handleCreateGame} onJoinGame={handleJoinGame} />
        )}

        {gamePhase === "game" && gameState && playerId && (
          <GameBoard
            gameState={gameState}
            playerId={playerId}
            playerName={playerName}
            onStartGame={handleStartGame}
            onAskForCards={handleAskForCards}
            onChallenge={handleChallenge}
            onDraw={handleDraw}
          />
        )}

        {gamePhase === "end" && gameState && (
          <GameEnd gameState={gameState} playerName={playerName} />
        )}
      </main>
    </div>
  );
}
