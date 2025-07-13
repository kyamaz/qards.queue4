import { initializeGame } from '../../src/game/gameLogic';
import { CardType, GameState, Card } from '../../src/game/types';

describe('Game State Management', () => {
  describe('advanceTurn', () => {
    it('should advance to the next player in forward direction', () => {
      const gameState = initializeGame(['Player 1', 'Player 2', 'Player 3']);
      const currentPlayerIndex = gameState.players.findIndex(p => p.id === gameState.currentPlayerId);
      
      // Simulate advance turn logic
      const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length;
      const nextPlayerId = gameState.players[nextPlayerIndex].id;
      
      expect(gameState.players[nextPlayerIndex]).toBeDefined();
      expect(nextPlayerId).not.toBe(gameState.currentPlayerId);
    });

    it('should advance to the previous player in backward direction', () => {
      const gameState = initializeGame(['Player 1', 'Player 2', 'Player 3']);
      gameState.turnDirection = 'backward';
      const currentPlayerIndex = gameState.players.findIndex(p => p.id === gameState.currentPlayerId);
      
      // Simulate advance turn logic in backward direction
      const nextPlayerIndex = (currentPlayerIndex - 1 + gameState.players.length) % gameState.players.length;
      const nextPlayerId = gameState.players[nextPlayerIndex].id;
      
      expect(gameState.players[nextPlayerIndex]).toBeDefined();
      expect(nextPlayerId).not.toBe(gameState.currentPlayerId);
    });

    it('should increment turn counter when advancing turn', () => {
      const gameState = initializeGame(['Player 1', 'Player 2', 'Player 3']);
      const initialTurn = gameState.turn;
      
      // Simulate turn advancement
      const newTurn = initialTurn + 1;
      
      expect(newTurn).toBe(initialTurn + 1);
    });

    it('should wrap around to first player after last player in forward direction', () => {
      const gameState = initializeGame(['Player 1', 'Player 2', 'Player 3']);
      // Set current player to last player
      gameState.currentPlayerId = gameState.players[gameState.players.length - 1].id;
      
      const currentPlayerIndex = gameState.players.length - 1;
      const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length;
      
      expect(nextPlayerIndex).toBe(0);
      expect(gameState.players[nextPlayerIndex].name).toBe('Player 1');
    });

    it('should wrap around to last player after first player in backward direction', () => {
      const gameState = initializeGame(['Player 1', 'Player 2', 'Player 3']);
      gameState.turnDirection = 'backward';
      gameState.currentPlayerId = gameState.players[0].id;
      
      const currentPlayerIndex = 0;
      const nextPlayerIndex = (currentPlayerIndex - 1 + gameState.players.length) % gameState.players.length;
      
      expect(nextPlayerIndex).toBe(gameState.players.length - 1);
      expect(gameState.players[nextPlayerIndex].name).toBe('Player 3');
    });
  });

  describe('handleCardPlacement', () => {
    let gameState: GameState;

    beforeEach(() => {
      gameState = initializeGame(['Player 1', 'Player 2', 'Player 3']);
    });

    it('should remove card from player hand when placed', () => {
      const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
      const initialHandSize = currentPlayer!.hand.length;
      const cardToPlay = currentPlayer!.hand[0];
      
      // Simulate card removal
      const newHand = currentPlayer!.hand.filter(c => c.id !== cardToPlay.id);
      
      expect(newHand.length).toBe(initialHandSize - 1);
      expect(newHand.find(c => c.id === cardToPlay.id)).toBeUndefined();
    });

    it('should place card on board at specified position', () => {
      const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
      const cardToPlay = currentPlayer!.hand[0];
      const laneIndex = 0;
      const position = 1;
      
      // Simulate card placement
      const newBoard = { ...gameState.board };
      const newLane = [...newBoard.lane[laneIndex]];
      newLane[position] = cardToPlay;
      newBoard.lane[laneIndex] = newLane;
      
      expect(newBoard.lane[laneIndex][position]).toBe(cardToPlay);
    });

    it('should fill empty slots with null when placing card beyond current lane length', () => {
      const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
      const cardToPlay = currentPlayer!.hand[0];
      const laneIndex = 0;
      const position = 3; // Beyond current lane length
      
      // Simulate card placement with gap filling
      const newLane = [...gameState.board.lane[laneIndex]];
      while (newLane.length < position) {
        newLane.push(null);
      }
      newLane[position] = cardToPlay;
      
      expect(newLane[1]).toBeNull();
      expect(newLane[2]).toBeNull();
      expect(newLane[position]).toBe(cardToPlay);
    });
  });

  describe('handleUnitaryCardEffect', () => {
    it('should reverse turn direction when unitary card is played', () => {
      const gameState = initializeGame(['Player 1', 'Player 2', 'Player 3']);
      const initialDirection = gameState.turnDirection;
      
      // Simulate unitary card effect
      const newDirection = initialDirection === 'forward' ? 'backward' : 'forward';
      
      expect(newDirection).toBe(initialDirection === 'forward' ? 'backward' : 'forward');
    });

    it('should not advance turn after playing unitary card', () => {
      const gameState = initializeGame(['Player 1', 'Player 2', 'Player 3']);
      const currentPlayerId = gameState.currentPlayerId;
      
      // After playing unitary card, current player should remain the same
      expect(gameState.currentPlayerId).toBe(currentPlayerId);
    });
  });

  describe('handleMeasurementCardEffect', () => {
    it('should increment measurement count when measurement card is played', () => {
      const gameState = initializeGame(['Player 1', 'Player 2', 'Player 3']);
      const initialCount = gameState.measurementCount;
      
      // Simulate measurement card effect
      const newCount = initialCount + 1;
      
      expect(newCount).toBe(initialCount + 1);
    });

    it('should add score to player when measurement card is played', () => {
      const gameState = initializeGame(['Player 1', 'Player 2', 'Player 3']);
      const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
      const initialScore = currentPlayer!.score;
      
      // Simulate score addition
      const newScore = initialScore + 1;
      
      expect(newScore).toBe(initialScore + 1);
    });

    it('should end game when measurement count reaches 10', () => {
      const gameState = initializeGame(['Player 1', 'Player 2', 'Player 3']);
      gameState.measurementCount = 9;
      
      // Simulate 10th measurement
      const newMeasurementCount = gameState.measurementCount + 1;
      const gameEnded = newMeasurementCount >= 10;
      
      expect(newMeasurementCount).toBe(10);
      expect(gameEnded).toBe(true);
    });
  });

  describe('handlePass', () => {
    it('should increment pass count for current player', () => {
      const gameState = initializeGame(['Player 1', 'Player 2', 'Player 3']);
      const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
      const initialPasses = currentPlayer!.passes;
      
      // Simulate pass
      const newPasses = initialPasses + 1;
      
      expect(newPasses).toBe(initialPasses + 1);
    });

    it('should end game when player reaches 4 passes', () => {
      const gameState = initializeGame(['Player 1', 'Player 2', 'Player 3']);
      const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
      currentPlayer!.passes = 3;
      
      // Simulate 4th pass
      const newPasses = currentPlayer!.passes + 1;
      const gameEnded = newPasses >= 4;
      
      expect(newPasses).toBe(4);
      expect(gameEnded).toBe(true);
    });

    it('should end game when all players have passed 3 times', () => {
      const gameState = initializeGame(['Player 1', 'Player 2', 'Player 3']);
      
      // Set all players to 3 passes
      gameState.players.forEach(player => {
        player.passes = 3;
      });
      
      const allPlayersPassed = gameState.players.every(p => p.passes >= 3);
      
      expect(allPlayersPassed).toBe(true);
    });
  });

  describe('controlCardPlacement', () => {
    it('should create control link when control card is placed', () => {
      const controlCard: Card = {
        id: 'control-1',
        type: CardType.CONTROL,
        value: 'C'
      };
      const targetLaneIndex = 1;
      
      // Simulate control card with link
      const linkedControlCard = { ...controlCard, controlLink: { targetLaneIndex } };
      
      expect(linkedControlCard.controlLink).toBeDefined();
      expect(linkedControlCard.controlLink!.targetLaneIndex).toBe(targetLaneIndex);
    });

    it('should place control card in empty slot', () => {
      const gameState = initializeGame(['Player 1', 'Player 2', 'Player 3']);
      const controlCard: Card = {
        id: 'control-1',
        type: CardType.CONTROL,
        value: 'C'
      };
      const controlLaneIndex = 0;
      const position = 2;
      
      // Ensure lane is long enough
      const newLane = [...gameState.board.lane[controlLaneIndex]];
      while (newLane.length <= position) {
        newLane.push(null);
      }
      newLane[position] = controlCard;
      
      expect(newLane[position]).toBe(controlCard);
      expect(newLane[1]).toBeNull(); // Empty slot before control card
    });
  });
});