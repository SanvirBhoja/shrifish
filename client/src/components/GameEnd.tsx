import React from "react";
import "./GameEnd.css";

interface GameEndProps {
  gameState: any;
  playerName: string;
}

export default function GameEnd({ gameState, playerName }: GameEndProps) {
  const winner = gameState.players.find((p: any) => p.id === gameState.winner);
  const isWinner = winner?.id === gameState.winner;

  const sortedPlayers = [...gameState.players].sort(
    (a: any, b: any) => b.books.length - a.books.length
  );

  return (
    <div className="game-end">
      <div className="game-end-content">
        {isWinner ? (
          <>
            <h2 className="winner-title">🎉 You Won! 🎉</h2>
            <p className="winner-name">{playerName}</p>
          </>
        ) : (
          <>
            <h2>Game Over</h2>
            <p className="winner-text">{winner?.name} won with {winner?.books.length} books!</p>
          </>
        )}

        <div className="final-standings">
          <h3>Final Standings</h3>
          <div className="standings-list">
            {sortedPlayers.map((player: any, index: number) => (
              <div
                key={player.id}
                className={`standing-item ${index === 0 ? "winner" : ""}`}
              >
                <span className="position">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                </span>
                <span className="name">{player.name}</span>
                <span className="books">{player.books.length} books</span>
              </div>
            ))}
          </div>
        </div>

        <a href="/" className="btn btn-primary btn-large">
          Play Again
        </a>
      </div>
    </div>
  );
}
