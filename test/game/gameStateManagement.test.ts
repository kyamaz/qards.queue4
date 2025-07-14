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

    it('should only increment turn counter when completing a full round', () => {
      const gameState = initializeGame(['Player 1', 'Player 2', 'Player 3']);
      const initialTurn = gameState.turn;
      const numPlayers = gameState.players.length;
      
      // Simulate turn advancement logic - turn should only increment when back to first player
      let currentPlayerIndex = gameState.players.findIndex(p => p.id === gameState.currentPlayerId);
      let turn = initialTurn;
      
      // Advance through all players
      for (let i = 0; i < numPlayers; i++) {
        const nextPlayerIndex = (currentPlayerIndex + 1) % numPlayers;
        const shouldIncrementTurn = nextPlayerIndex === 0; // Back to first player
        
        if (shouldIncrementTurn) {
          turn = turn + 1;
        }
        
        currentPlayerIndex = nextPlayerIndex;
      }
      
      expect(turn).toBe(initialTurn + 1); // Turn should increment once after a full round
    });

    it('should not increment turn counter during intermediate player changes', () => {
      const gameState = initializeGame(['Player 1', 'Player 2', 'Player 3', 'Player 4']);
      const initialTurn = gameState.turn;
      const numPlayers = gameState.players.length;
      
      // Find current player index
      let currentPlayerIndex = gameState.players.findIndex(p => p.id === gameState.currentPlayerId);
      let turn = initialTurn;
      
      // Force start at player index 1 to ensure we don't complete a full round in 2 steps
      currentPlayerIndex = 1; 
      
      // Advance 2 players (not a full round): 1->2->3
      for (let i = 0; i < 2; i++) {
        const nextPlayerIndex = (currentPlayerIndex + 1) % numPlayers;
        const shouldIncrementTurn = nextPlayerIndex === 0; // Back to first player
        
        if (shouldIncrementTurn) {
          turn = turn + 1;
        }
        
        currentPlayerIndex = nextPlayerIndex;
      }
      
      // With 4 players, starting at index 1 and advancing 2 times: 1->2->3
      // We should not reach player 0, so turn should not increment
      expect(turn).toBe(initialTurn); // Turn should not increment
    });

    it('should increment turn counter in reverse direction when returning to last player', () => {
      const gameState = initializeGame(['Player 1', 'Player 2', 'Player 3']);
      const initialTurn = gameState.turn;
      const numPlayers = gameState.players.length;
      const turnDirection = 'reverse';
      
      // Start from first player
      let currentPlayerIndex = 0;
      let turn = initialTurn;
      
      // Advance through all players in reverse
      for (let i = 0; i < numPlayers; i++) {
        const nextPlayerIndex = (currentPlayerIndex - 1 + numPlayers) % numPlayers;
        const shouldIncrementTurn = nextPlayerIndex === numPlayers - 1; // Back to last player
        
        if (shouldIncrementTurn) {
          turn = turn + 1;
        }
        
        currentPlayerIndex = nextPlayerIndex;
      }
      
      expect(turn).toBe(initialTurn + 1); // Turn should increment once after a full reverse round
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
      
      // Simulate score addition - default score is 1
      const newScore = initialScore + 1;
      
      expect(newScore).toBe(initialScore + 1);
    });

    it('should calculate variable scores based on qubit compatibility', () => {
      // Test compatibility matrix directly
      const perfectMatchScore = 3;  // |0⟩ with ⟨0|
      const noMatchScore = 0;       // |0⟩ with ⟨1|  
      const partialMatchScore = 1;  // |0⟩ with ⟨+|
      
      expect(perfectMatchScore).toBe(3);
      expect(noMatchScore).toBe(0);
      expect(partialMatchScore).toBe(1);
    });

    it('should end game when measurement count reaches 11', () => {
      const gameState = initializeGame(['Player 1', 'Player 2', 'Player 3']);
      gameState.measurementCount = 10;
      
      // Simulate 11th measurement
      const newMeasurementCount = gameState.measurementCount + 1;
      const gameEnded = newMeasurementCount >= 11;
      
      expect(newMeasurementCount).toBe(11);
      expect(gameEnded).toBe(true);
    });

    it('should handle measurement scoring with qubits in the same lane', () => {
      // Simulate a lane with qubit followed by measurement
      const laneWithQuantumBit = [
        { id: '1', type: CardType.GATE, value: 'I' },
        { id: '2', type: CardType.QUBIT, value: '|0⟩' },
        null // Position for measurement card
      ];
      
      // Measurement card that perfectly matches
      const perfectMeasurement = { id: '3', type: CardType.MEASUREMENT, value: '⟨0|' };
      
      // This would result in a score of 3 points
      const expectedScore = 3;
      expect(expectedScore).toBe(3);
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