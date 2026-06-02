import React, { useState } from "react";
import "./GameBoard.css";
import PlayerHand from "./PlayerHand";
import OpponentArea from "./OpponentArea";
import ChallengePrompt from "./ChallengePrompt";

interface GameBoardProps {
  gameState: any;
  playerId: string;
  playerName: string;
  onStartGame: () => void;
  onAskForCards: (rank: string, bluffing: boolean) => void;
  onChallenge: () => void;
  onDraw: () => void;
}

const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

export default function GameBoard({
  gameState,
  playerId,
  playerName,
  onStartGame,
  onAskForCards,
  onChallenge,
  onDraw,
}: GameBoardProps) {
  const [selectedRank, setSelectedRank] = useState<string>("");
  const [bluffing, setBluffing] = useState(false);

  const isMyTurn = gameState.currentTurn === playerId;
  const myPlayer = gameState.players.find((p: any) => p.id === playerId);
  const opponents = gameState.players.filter((p: any) => p.id !== playerId);

  const handleAskClick = () => {
    if (selectedRank) {
      onAskForCards(selectedRank, bluffing);
      setSelectedRank("");
      setBluffing(false);
    }
  };

  const handleChallengeClick = () => {
    onChallenge();
  };

  const handleDrawClick = () => {
    onDraw();
  };

  const getRanksInHand = () => {
    const ranks = new Set<string>();
    if (gameState.myHand) {
      gameState.myHand.forEach((card: any) => {
        ranks.add(card.rank);
      });
    }
    return ranks;
  };

  const ranksInHand = getRanksInHand();

  return (
    <div className="game-board">
      <div className="game-header">
        <div className="game-info">
          <h2>Game: {gameState.gameId.slice(0, 8)}</h2>
          <p className="current-turn">
            {isMyTurn ? "🎯 Your Turn" : `${gameState.currentTurnName}'s Turn`}
          </p>
        </div>
        <div className="game-status">
          <div className="pond-info">Pond: {gameState.pondSize} cards</div>
        </div>
      </div>

      {gameState.gamePhase === "waiting" && (
        <div className="game-waiting">
          <h3>Waiting for players...</h3>
          <div className="players-list">
            {gameState.players.map((player: any) => (
              <div key={player.id} className="player-item">
                {player.id === playerId ? "✓ " : ""}
                {player.name}
              </div>
            ))}
          </div>
          {gameState.players.length >= 2 && (
            <button className="btn btn-primary" onClick={onStartGame}>
              Start Game
            </button>
          )}
        </div>
      )}

      {gameState.gamePhase !== "waiting" && (
        <>
          <div className="opponents-container">
            {opponents.map((opponent: any) => (
              <OpponentArea key={opponent.id} player={opponent} isMyTurn={isMyTurn} />
            ))}
          </div>

          <div className="center-area">
            <div className="challenge-area">
              {gameState.challengeActive && (
                <ChallengePrompt
                  onChallenge={handleChallengeClick}
                  isCurrentAsker={gameState.currentTurn === playerId}
                />
              )}
            </div>
          </div>

          <div className="player-area">
            {gameState.gamePhase === "asking" && isMyTurn && (
              <div className="action-panel">
                <h3>Your Turn - Ask for Cards</h3>
                <div className="rank-selector">
                  {RANKS.map((rank) => (
                    <button
                      key={rank}
                      className={`rank-btn ${selectedRank === rank ? "selected" : ""} ${
                        !ranksInHand.has(rank) ? "disabled-hint" : ""
                      }`}
                      onClick={() => setSelectedRank(rank)}
                      disabled={!ranksInHand.has(rank) && !bluffing}
                      title={
                        !ranksInHand.has(rank) ? "You must have this rank unless bluffing" : ""
                      }
                    >
                      {rank}
                    </button>
                  ))}
                </div>

                <label className="bluff-checkbox">
                  <input
                    type="checkbox"
                    checked={bluffing}
                    onChange={(e) => setBluffing(e.target.checked)}
                  />
                  I'm bluffing (I don't have this rank)
                </label>

                <button
                  className="btn btn-primary btn-large"
                  onClick={handleAskClick}
                  disabled={!selectedRank}
                >
                  Ask for {selectedRank || "Cards"}
                </button>
              </div>
            )}

            {gameState.gamePhase === "drawing" && isMyTurn && (
              <div className="action-panel">
                <h3>Draw Cards from the Pond</h3>
                <button className="btn btn-primary btn-large" onClick={handleDrawClick}>
                  Draw Cards
                </button>
              </div>
            )}

            {gameState.gamePhase === "challenge" && !gameState.challengeActive && (
              <div className="action-panel">
                <p>Waiting for challenge decision...</p>
              </div>
            )}

            <PlayerHand
              cards={gameState.myHand || []}
              books={myPlayer?.books || []}
              playerName={playerName}
            />
          </div>
        </>
      )}
    </div>
  );
}
