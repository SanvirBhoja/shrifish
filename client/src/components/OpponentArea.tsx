import React from "react";
import "./OpponentArea.css";

interface OpponentAreaProps {
  player: any;
  isMyTurn: boolean;
}

export default function OpponentArea({ player, isMyTurn }: OpponentAreaProps) {
  return (
    <div className={`opponent-area ${player.isCurrentTurn ? "current-turn" : ""}`}>
      <div className="opponent-header">
        <h4>{player.name}</h4>
        {player.isCurrentTurn && <span className="turn-indicator">🎯 TURN</span>}
      </div>

      <div className="opponent-stats">
        <div className="stat">
          <span className="stat-label">Hand:</span>
          <span className="stat-value">{player.handSize} 🃏</span>
        </div>
        <div className="stat">
          <span className="stat-label">Books:</span>
          <span className="stat-value">{player.books.length}</span>
        </div>
      </div>

      {player.books.length > 0 && (
        <div className="opponent-books">
          {player.books.map((rank: string) => (
            <div key={rank} className="opponent-book" title={`${rank}s`}>
              {rank}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
