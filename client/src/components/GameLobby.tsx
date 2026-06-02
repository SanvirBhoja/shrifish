import React, { useState } from "react";
import "./GameLobby.css";

interface GameLobbyProps {
  onCreateGame: (playerName: string) => void;
  onJoinGame: (gameId: string, playerName: string) => void;
}

export default function GameLobby({ onCreateGame, onJoinGame }: GameLobbyProps) {
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");
  const [playerName, setPlayerName] = useState("");
  const [gameId, setGameId] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onCreateGame(playerName);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && gameId.trim()) {
      onJoinGame(gameId, playerName);
    }
  };

  return (
    <div className="lobby">
      {mode === "menu" && (
        <div className="lobby-menu">
          <div className="lobby-content">
            <h2>Welcome to ShriFish!</h2>
            <p>A multiplayer card game with bluffing and challenges</p>

            <div className="lobby-buttons">
              <button className="btn btn-primary" onClick={() => setMode("create")}>
                Create Game
              </button>
              <button className="btn btn-secondary" onClick={() => setMode("join")}>
                Join Game
              </button>
            </div>

            <div className="lobby-info">
              <h3>How to Play</h3>
              <ul>
                <li>2-3 players get 7 cards each</li>
                <li>4+ players get 5 cards each</li>
                <li>Ask other players for ranks (bluff if you want!)</li>
                <li>Challenge claims you think are false</li>
                <li>Collect 4 of a kind to make books</li>
                <li>First to complete all 13 books wins!</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {mode === "create" && (
        <div className="lobby-form">
          <h2>Create New Game</h2>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label htmlFor="playerName">Your Name</label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                autoFocus
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="btn btn-primary">
                Create
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setMode("menu");
                  setPlayerName("");
                }}
              >
                Back
              </button>
            </div>
          </form>
        </div>
      )}

      {mode === "join" && (
        <div className="lobby-form">
          <h2>Join Game</h2>
          <form onSubmit={handleJoin}>
            <div className="form-group">
              <label htmlFor="gameId">Game ID</label>
              <input
                id="gameId"
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                placeholder="Enter game ID"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="joinPlayerName">Your Name</label>
              <input
                id="joinPlayerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="btn btn-primary">
                Join
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setMode("menu");
                  setPlayerName("");
                  setGameId("");
                }}
              >
                Back
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
