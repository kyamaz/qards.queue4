// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { calculateFinalScores, determineWinner } from '../../src/game/gameLogic';
import { GameState, Player, Card, CardType } from '../../src/game/types';

describe('Final Scoring System', () => {
  const createMockGameState = (players: Player[]): GameState => ({
    players,
    deck: [],
    board: { lane: [] },
    currentPlayerId: players[0].id,
    turn: 1,
    measurementCount: 0,
    turnDirection: 'forward',
    gamePhase: 'normal_play',
    initialSelection: null,
    unitaryCardsPlayedThisTurn: {},
    firstPlayerId: undefined,
  });

  const createCard = (type: CardType, value: string, id: string): Card => ({
    id,
    type,
    value: value as any
  });

  describe('Hand Penalty Calculation', () => {
    it('should apply new penalty system for gate cards: 2 cards per -1 point', () => {
      const players: Player[] = [
        {
          id: 'p1',
          name: 'Player 1',
          score: 10, // 10 points from measurements
          passes: 0,
          hand: [
            // 5 gate cards = ceil(5/2) * 1 = 3 * 1 = -3 points
            createCard(CardType.GATE, 'I', 'g1'),
            createCard(CardType.GATE, 'X', 'g2'),
            createCard(CardType.GATE, 'Z', 'g3'),
            createCard(CardType.GATE, 'H', 'g4'),
            createCard(CardType.GATE, 'I', 'g5'),
          ]
        }
      ];

      const gameState = createMockGameState(players);
      const finalScores = calculateFinalScores(gameState);

      expect(finalScores[0].finalScore).toBe(7); // 10 - 3 = 7
    });

    it('should apply penalty for partial gate cards: 3 gate cards = -2 points (rounded up)', () => {
      const players: Player[] = [
        {
          id: 'p1',
          name: 'Player 1',
          score: 10,
          passes: 0,
          hand: [
            // 3 gate cards = ceil(3/2) * 1 = 2 * 1 = -2 points
            createCard(CardType.GATE, 'I', 'g1'),
            createCard(CardType.GATE, 'X', 'g2'),
            createCard(CardType.GATE, 'Z', 'g3'),
          ]
        }
      ];

      const gameState = createMockGameState(players);
      const finalScores = calculateFinalScores(gameState);

      expect(finalScores[0].finalScore).toBe(8); // 10 - 2 = 8
    });

    it('should apply penalty for multiple groups of gate cards: 7 gate cards = -4 points', () => {
      const players: Player[] = [
        {
          id: 'p1',
          name: 'Player 1',
          score: 15,
          passes: 0,
          hand: [
            // 7 gate cards = ceil(7/2) * 1 = 4 * 1 = -4 points
            createCard(CardType.GATE, 'I', 'g1'),
            createCard(CardType.GATE, 'X', 'g2'),
            createCard(CardType.GATE, 'Z', 'g3'),
            createCard(CardType.GATE, 'H', 'g4'),
            createCard(CardType.GATE, 'I', 'g5'),
            createCard(CardType.GATE, 'X', 'g6'),
            createCard(CardType.GATE, 'Z', 'g7'),
          ]
        }
      ];

      const gameState = createMockGameState(players);
      const finalScores = calculateFinalScores(gameState);

      expect(finalScores[0].finalScore).toBe(11); // 15 - 4 = 11
    });

    it('should apply penalty for non-gate cards: 1 card per -2 points', () => {
      const players: Player[] = [
        {
          id: 'p1',
          name: 'Player 1',
          score: 10,
          passes: 0,
          hand: [
            // Non-gate cards: 1 card per -2 points
            createCard(CardType.QUBIT, '|0⟩', 'q1'),
            createCard(CardType.MEASUREMENT, '⟨0|', 'm1'),
            createCard(CardType.UNITARY, 'U', 'u1'),
          ]
        }
      ];

      const gameState = createMockGameState(players);
      const finalScores = calculateFinalScores(gameState);

      expect(finalScores[0].finalScore).toBe(4); // 10 - 6 = 4 (3 cards * 2 points each)
    });

    it('should apply mixed penalty system correctly', () => {
      const players: Player[] = [
        {
          id: 'p1',
          name: 'Player 1',
          score: 20,
          passes: 0,
          hand: [
            // 3 gate cards = ceil(3/2) * 1 = 2 * 1 = -2 points
            createCard(CardType.GATE, 'I', 'g1'),
            createCard(CardType.GATE, 'X', 'g2'),
            createCard(CardType.GATE, 'Z', 'g3'),
            // 2 non-gate cards = -4 points (2 * 2)
            createCard(CardType.QUBIT, '|0⟩', 'q1'),
            createCard(CardType.MEASUREMENT, '⟨0|', 'm1'),
          ]
        }
      ];

      const gameState = createMockGameState(players);
      const finalScores = calculateFinalScores(gameState);

      expect(finalScores[0].finalScore).toBe(14); // 20 - 2 - 4 = 14
    });

    it('should handle empty hand with no penalty', () => {
      const players: Player[] = [
        {
          id: 'p1',
          name: 'Player 1',
          score: 10,
          passes: 0,
          hand: [] // No cards = no penalty
        }
      ];

      const gameState = createMockGameState(players);
      const finalScores = calculateFinalScores(gameState);

      expect(finalScores[0].finalScore).toBe(10); // 10 - 0 = 10
    });
  });

  describe('Winner Determination', () => {
    it('should correctly determine winner with new penalty system', () => {
      const players: Player[] = [
        {
          id: 'p1',
          name: 'Player 1',
          score: 15,
          passes: 0,
          hand: [
            // 5 gate cards = -2 points
            createCard(CardType.GATE, 'I', 'g1'),
            createCard(CardType.GATE, 'X', 'g2'),
            createCard(CardType.GATE, 'Z', 'g3'),
            createCard(CardType.GATE, 'H', 'g4'),
            createCard(CardType.GATE, 'I', 'g5'),
          ]
        },
        {
          id: 'p2',
          name: 'Player 2',
          score: 10,
          passes: 0,
          hand: [
            // 2 non-gate cards = -4 points
            createCard(CardType.QUBIT, '|0⟩', 'q1'),
            createCard(CardType.MEASUREMENT, '⟨0|', 'm1'),
          ]
        }
      ];

      const gameState = createMockGameState(players);
      const result = determineWinner(gameState);

      // Player 1: 15 - ceil(5/2)*1 = 15 - 3 = 12
      // Player 2: 10 - 4 = 6
      expect(result.winner.id).toBe('p1');
      expect(result.finalScores[0].finalScore).toBe(12);
      expect(result.finalScores[1].finalScore).toBe(6);
    });
  });

  describe('Penalty System Examples', () => {
    it('should demonstrate various penalty scenarios', () => {
      const testCases = [
        {
          description: '1 gate card',
          gateCards: 1,
          otherCards: 0,
          expectedPenalty: 1 // ceil(1/2) * 1 = 1 * 1 = 1
        },
        {
          description: '2 gate cards',
          gateCards: 2,
          otherCards: 0,
          expectedPenalty: 1 // ceil(2/2) * 1 = 1 * 1 = 1
        },
        {
          description: '3 gate cards',
          gateCards: 3,
          otherCards: 0,
          expectedPenalty: 2 // ceil(3/2) * 1 = 2 * 1 = 2
        },
        {
          description: '4 gate cards',
          gateCards: 4,
          otherCards: 0,
          expectedPenalty: 2 // ceil(4/2) * 1 = 2 * 1 = 2
        },
        {
          description: '5 gate cards',
          gateCards: 5,
          otherCards: 0,
          expectedPenalty: 3 // ceil(5/2) * 1 = 3 * 1 = 3
        },
        {
          description: '6 gate cards',
          gateCards: 6,
          otherCards: 0,
          expectedPenalty: 3 // ceil(6/2) * 1 = 3 * 1 = 3
        },
        {
          description: '10 gate cards',
          gateCards: 10,
          otherCards: 0,
          expectedPenalty: 5 // ceil(10/2) * 1 = 5 * 1 = 5
        },
        {
          description: '3 gate + 2 other cards',
          gateCards: 3,
          otherCards: 2,
          expectedPenalty: 6 // ceil(3/2) * 1 + 2 * 2 = 2 + 4 = 6
        }
      ];

      testCases.forEach(({ description, gateCards, otherCards, expectedPenalty }) => {
        const hand: Card[] = [];
        
        // Add gate cards
        for (let i = 0; i < gateCards; i++) {
          hand.push(createCard(CardType.GATE, 'I', `g${i}`));
        }
        
        // Add other cards
        for (let i = 0; i < otherCards; i++) {
          hand.push(createCard(CardType.QUBIT, '|0⟩', `q${i}`));
        }

        const players: Player[] = [
          {
            id: 'p1',
            name: 'Player 1',
            score: 20,
            passes: 0,
            hand
          }
        ];

        const gameState = createMockGameState(players);
        const finalScores = calculateFinalScores(gameState);
        const actualPenalty = 20 - finalScores[0].finalScore;

        expect(actualPenalty).toBe(expectedPenalty);
      });
    });
  });
});