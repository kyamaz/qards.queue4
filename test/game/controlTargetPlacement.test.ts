import { 
  initializeGame, 
  startControlTargetPlacement, 
  completeControlTargetPlacement, 
  cancelControlTargetPlacement, 
  isValidTargetLane 
} from '../../src/game/gameLogic';
import { CardType } from '../../src/game/types';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

describe('Control-Target Placement System', () => {
  it('should start control-target placement correctly', () => {
    const gameState = initializeGame(['P1', 'P2', 'P3', 'P4']);
    
    // Create a CONTROL card
    const controlCard = {
      id: 'control-1',
      type: CardType.CONTROL,
      value: 'C' as const,
    };
    
    const controlLane = 0;
    const controlPosition = 0;
    
    const updatedState = startControlTargetPlacement(gameState, controlCard, controlLane, controlPosition);
    
    expect(updatedState.controlTargetPlacement).toBeDefined();
    expect(updatedState.controlTargetPlacement?.controlCard).toBe(controlCard);
    expect(updatedState.controlTargetPlacement?.controlLane).toBe(controlLane);
    expect(updatedState.controlTargetPlacement?.controlPosition).toBe(controlPosition);
    expect(updatedState.controlTargetPlacement?.waitingForTarget).toBe(true);
  });

  it('should validate target lanes correctly', () => {
    const gameState = initializeGame(['P1', 'P2', 'P3', 'P4']);
    
    const controlCard = {
      id: 'control-1',
      type: CardType.CONTROL,
      value: 'C' as const,
    };
    
    const controlLane = 1;
    const controlPosition = 0;
    
    const stateWithPending = startControlTargetPlacement(gameState, controlCard, controlLane, controlPosition);
    
    // Adjacent lanes should be valid
    expect(isValidTargetLane(stateWithPending, 0)).toBe(true); // lane above
    expect(isValidTargetLane(stateWithPending, 2)).toBe(true); // lane below
    
    // Non-adjacent lanes should be invalid
    expect(isValidTargetLane(stateWithPending, 3)).toBe(false); // too far
    
    // Same lane should be invalid
    expect(isValidTargetLane(stateWithPending, 1)).toBe(false);
    
    // Invalid lane indices
    expect(isValidTargetLane(stateWithPending, -1)).toBe(false);
    expect(isValidTargetLane(stateWithPending, 100)).toBe(false);
  });

  it('should complete control-target placement correctly', () => {
    const gameState = initializeGame(['P1', 'P2', 'P3', 'P4']);
    
    // Add control card to player's hand
    const controlCard = {
      id: 'control-1',
      type: CardType.CONTROL,
      value: 'C' as const,
    };
    
    gameState.players[0].hand.push(controlCard);
    
    const controlLane = 0;
    const controlPosition = 0;
    const targetLane = 1;
    
    // Start placement
    const pendingState = startControlTargetPlacement(gameState, controlCard, controlLane, controlPosition);
    
    // Complete placement
    const completedState = completeControlTargetPlacement(pendingState, targetLane);
    
    // Check that placement is cleared
    expect(completedState.controlTargetPlacement).toBeUndefined();
    
    // Check that cards are placed on board
    expect(completedState.board.lane[controlLane][controlPosition]).toBeDefined();
    expect(completedState.board.lane[targetLane][controlPosition]).toBeDefined();
    
    // Check control card has target link
    const placedControlCard = completedState.board.lane[controlLane][controlPosition];
    expect(placedControlCard?.type).toBe(CardType.CONTROL);
    expect(placedControlCard?.controlLink?.targetLaneIndex).toBe(targetLane);
    
    // Check target card is created
    const placedTargetCard = completedState.board.lane[targetLane][controlPosition];
    expect(placedTargetCard?.type).toBe(CardType.TARGET);
    expect(placedTargetCard?.value).toBe('T');
    expect(placedTargetCard?.controlLink?.targetLaneIndex).toBe(controlLane);
    
    // Check card is removed from player's hand
    const player = completedState.players.find(p => p.id === gameState.currentPlayerId);
    expect(player?.hand.find(card => card.id === controlCard.id)).toBeUndefined();
  });

  it('should cancel control-target placement correctly', () => {
    const gameState = initializeGame(['P1', 'P2', 'P3', 'P4']);
    
    const controlCard = {
      id: 'control-1',
      type: CardType.CONTROL,
      value: 'C' as const,
    };
    
    // Start placement
    const pendingState = startControlTargetPlacement(gameState, controlCard, 0, 0);
    
    // Cancel placement
    const canceledState = cancelControlTargetPlacement(pendingState);
    
    expect(canceledState.controlTargetPlacement).toBeUndefined();
    expect(canceledState.board).toEqual(gameState.board); // Board should be unchanged
  });

  it('should throw error when completing without pending placement', () => {
    const gameState = initializeGame(['P1', 'P2', 'P3', 'P4']);
    
    expect(() => {
      completeControlTargetPlacement(gameState, 1);
    }).toThrow('No pending control-target placement');
  });

  it('should return false for isValidTargetLane without pending placement', () => {
    const gameState = initializeGame(['P1', 'P2', 'P3', 'P4']);
    
    expect(isValidTargetLane(gameState, 0)).toBe(false);
    expect(isValidTargetLane(gameState, 1)).toBe(false);
  });
});