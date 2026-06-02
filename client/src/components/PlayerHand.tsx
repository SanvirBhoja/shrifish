import React from "react";
import "./PlayerHand.css";

interface PlayerHandProps {
  cards: any[];
  books: string[];
  playerName: string;
}

const SUIT_SYMBOLS: Record<string, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

const SUIT_COLORS: Record<string, string> = {
  hearts: "red",
  diamonds: "red",
  clubs: "black",
  spades: "black",
};

export default function PlayerHand({ cards, books, playerName }: PlayerHandProps) {
  const sortedCards = [...cards].sort((a, b) => {
    const rankOrder = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    const rankDiff = rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
    if (rankDiff !== 0) return rankDiff;
    return SUIT_SYMBOLS[a.suit].localeCompare(SUIT_SYMBOLS[b.suit]);
  });

  return (
    <div className="player-hand">
      <div className="hand-section">
        <h4>{playerName}'s Hand ({cards.length} cards)</h4>
        <div className="cards-display">
          {sortedCards.map((card) => (
            <div
              key={card.id}
              className={`card card-${SUIT_COLORS[card.suit]}`}
              title={`${card.rank}${SUIT_SYMBOLS[card.suit]}`}
            >
              <div className="card-rank">{card.rank}</div>
              <div className="card-suit">{SUIT_SYMBOLS[card.suit]}</div>
            </div>
          ))}
        </div>
      </div>

      {books.length > 0 && (
        <div className="books-section">
          <h4>Books ({books.length}/13)</h4>
          <div className="books-display">
            {books.map((rank) => (
              <div key={rank} className="book" title={`Book of ${rank}s`}>
                <div className="book-rank">{rank}</div>
                <div className="book-label">Book</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
