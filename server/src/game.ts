import { v4 as uuidv4 } from "uuid";

export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
export type Suit = "hearts" | "diamonds" | "clubs" | "spades";

export interface Card {
  id: string;
  rank: Rank;
  suit: Suit;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  books: Rank[];
  socketId: string;
}

export interface ChallengeState {
  active: boolean;
  challenger: string;
  asker: string;
  claimedRank: Rank;
  claimedCards: Card[];
  timeoutId?: NodeJS.Timeout;
}

export interface GameState {
  id: string;
  players: Player[];
  pond: Card[];
  currentTurn: string;
  gamePhase: "waiting" | "asking" | "challenge" | "drawing" | "finished";
  challengeState: ChallengeState | null;
  winner: string | null;
  history: string[];
}

export class ShriFishGame {
  state: GameState;

  constructor(playerId: string, playerName: string) {
    this.state = {
      id: uuidv4(),
      players: [
        {
          id: playerId,
          name: playerName,
          hand: [],
          books: [],
          socketId: "",
        },
      ],
      pond: [],
      currentTurn: playerId,
      gamePhase: "waiting",
      challengeState: null,
      winner: null,
      history: [`Game created by ${playerName}`],
    };
  }

  addPlayer(playerId: string, playerName: string, socketId: string): void {
    if (this.state.players.length >= 4) {
      throw new Error("Game is full");
    }
    this.state.players.push({
      id: playerId,
      name: playerName,
      hand: [],
      books: [],
      socketId,
    });
    this.state.history.push(`${playerName} joined the game`);
  }

  startGame(): void {
    if (this.state.players.length < 2) {
      throw new Error("Need at least 2 players");
    }

    const ranks: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
    const deck: Card[] = [];

    for (const rank of ranks) {
      for (const suit of suits) {
        deck.push({
          id: uuidv4(),
          rank,
          suit,
        });
      }
    }

    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    const cardsPerPlayer = this.state.players.length >= 4 ? 5 : 7;
    let deckIndex = 0;

    for (const player of this.state.players) {
      for (let i = 0; i < cardsPerPlayer; i++) {
        player.hand.push(deck[deckIndex++]);
      }
    }

    this.state.pond = deck.slice(deckIndex);
    this.state.gamePhase = "asking";
    this.state.currentTurn = this.state.players[0].id;
    this.state.history.push("Game started");
  }

  getPlayer(playerId: string): Player {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) throw new Error("Player not found");
    return player;
  }

  getCurrentPlayer(): Player {
    return this.getPlayer(this.state.currentTurn);
  }

  askForCards(askerId: string, rank: Rank, bluffed: boolean): void {
    const asker = this.getPlayer(askerId);

    if (this.state.currentTurn !== askerId) {
      throw new Error("Not your turn");
    }

    if (!bluffed && !asker.hand.some((c) => c.rank === rank)) {
      throw new Error("You must have at least one of that rank (unless bluffing)");
    }

    this.state.gamePhase = "challenge";
    this.state.challengeState = {
      active: true,
      asker: askerId,
      challenger: "",
      claimedRank: rank,
      claimedCards: asker.hand.filter((c) => c.rank === rank),
    };

    this.state.history.push(
      `${asker.name} asked for ${rank}${bluffed ? " (BLUFFING)" : ""}`
    );

    this.state.challengeState.timeoutId = setTimeout(() => {
      if (this.state.challengeState?.active) {
        this.resolveChallengeTimeout();
      }
    }, 10000);
  }

  challengeAsker(challengerId: string): void {
    if (!this.state.challengeState || !this.state.challengeState.active) {
      throw new Error("No active challenge");
    }

    const challenger = this.getPlayer(challengerId);
    const asker = this.getPlayer(this.state.challengeState.asker);

    this.state.challengeState.challenger = challengerId;
    this.state.challengeState.active = false;

    const askerLied = this.state.challengeState.claimedCards.length === 0;

    if (askerLied) {
      this.state.history.push(
        `${challenger.name} challenged ${asker.name} and was RIGHT! ${asker.name} was bluffing.`
      );
      const cardsToDraw = Math.min(4, this.state.pond.length);
      for (let i = 0; i < cardsToDraw; i++) {
        const card = this.state.pond.pop();
        if (card) asker.hand.push(card);
      }
    } else {
      this.state.history.push(
        `${challenger.name} challenged ${asker.name} and was WRONG! ${asker.name} told the truth.`
      );
      const cardsToDraw = Math.min(4, this.state.pond.length);
      for (let i = 0; i < cardsToDraw; i++) {
        const card = this.state.pond.pop();
        if (card) challenger.hand.push(card);
      }
    }

    this.state.gamePhase = "drawing";
    this.endTurn();
  }

  resolveChallengeTimeout(): void {
    if (!this.state.challengeState) return;

    const asker = this.getPlayer(this.state.challengeState.asker);

    this.state.history.push(
      `${asker.name}'s claim for ${this.state.challengeState.claimedRank} was accepted (no challenge)`
    );

    const claimedCards = this.state.challengeState.claimedCards;
    asker.hand = asker.hand.filter((c) => !claimedCards.includes(c));

    this.checkForBooks(asker);
    this.state.challengeState = null;
    this.state.gamePhase = "drawing";
    this.endTurn();
  }

  drawCards(playerId: string): void {
    if (this.state.gamePhase !== "drawing") {
      throw new Error("Not in drawing phase");
    }

    const player = this.getPlayer(playerId);

    while (player.hand.length === 0 && this.state.pond.length > 0) {
      const card = this.state.pond.pop();
      if (card) player.hand.push(card);
    }

    this.endTurn();
  }

  checkForBooks(player: Player): void {
    const rankCounts: Record<Rank, number> = {} as any;

    for (const card of player.hand) {
      rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
    }

    for (const [rank, count] of Object.entries(rankCounts)) {
      if (count >= 4) {
        player.hand = player.hand.filter((c) => c.rank !== rank);
        if (!player.books.includes(rank as Rank)) {
          player.books.push(rank as Rank);
          this.state.history.push(`${player.name} completed a book of ${rank}s!`);
        }
      }
    }
  }

  endTurn(): void {
    const currentIdx = this.state.players.findIndex((p) => p.id === this.state.currentTurn);
    const nextIdx = (currentIdx + 1) % this.state.players.length;
    this.state.currentTurn = this.state.players[nextIdx].id;

    this.state.gamePhase = "asking";
    this.state.challengeState = null;

    const totalRanks = 13;
    const totalBooks = this.state.players.reduce((sum, p) => sum + p.books.length, 0);

    if (totalBooks === totalRanks) {
      this.endGame();
    }
  }

  endGame(): void {
    const winner = this.state.players.reduce((prev, current) =>
      prev.books.length > current.books.length ? prev : current
    );

    this.state.winner = winner.id;
    this.state.gamePhase = "finished";
    this.state.history.push(`Game ended! ${winner.name} won with ${winner.books.length} books!`);
  }

  getPublicState() {
    return {
      gameId: this.state.id,
      players: this.state.players.map((p) => ({
        id: p.id,
        name: p.name,
        handSize: p.hand.length,
        books: p.books,
        isCurrentTurn: p.id === this.state.currentTurn,
      })),
      pondSize: this.state.pond.length,
      gamePhase: this.state.gamePhase,
      currentTurn: this.state.currentTurn,
      currentTurnName: this.getPlayer(this.state.currentTurn).name,
      challengeActive: this.state.challengeState?.active,
      winner: this.state.winner,
    };
  }

  getPlayerView(playerId: string) {
    const player = this.getPlayer(playerId);
    return {
      ...this.getPublicState(),
      myHand: player.hand,
      myId: playerId,
    };
  }
}
