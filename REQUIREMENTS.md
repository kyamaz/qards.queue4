# qards4 - Quantum Card Game Requirements Specification

## 1. Project Overview

### 1.1 Project Name
qards4 - Quantum Computing Card Game

### 1.2 Purpose
Develop a card game application that allows players to learn fundamental quantum computing concepts (qubits, gate operations, measurements) in an engaging and interactive way.

### 1.3 Technology Stack
- **Frontend**: Next.js 15.3.5 (App Router)
- **UI**: React 19 + TypeScript + Tailwind CSS v4
- **Testing**: Jest + React Testing Library
- **Development Environment**: Node.js

## 2. Functional Requirements

### 2.1 Core Game Features

#### 2.1.1 Player Management
- **Player Count**: 3-6 players (default: 4 players)
- **Player Names**: Customizable player names
- **Score Management**: Point system based on measurement card interactions
- **Pass System**: Player elimination when passing 4 times (individual elimination, game continues with remaining players)

#### 2.1.2 Initial Player Selection Process
- **Card Distribution Phase**: Distribute all cards (including INITIAL_QUBIT cards) randomly to all players
- **Hand Check Phase**: Each player checks if they have INITIAL_QUBIT cards in their hand
- **Sequential Placement**: Starting from Player A, players with INITIAL_QUBIT cards place them sequentially
- **Card Placement**: Players with INITIAL_QUBIT cards must place ALL of them in leftmost board slots
- **Multiple Cards**: If a player has multiple INITIAL_QUBIT cards, all must be placed
- **Lane Assignment**: Each INITIAL_QUBIT card is placed in a separate lane (lane 0, 1, 2, 3)
- **First Player Rule**: The player who places an |1⟩ INITIAL_QUBIT card becomes the first player
- **Priority Order**: If multiple players have |1⟩ cards, the first in alphabetical/turn order wins
- **Default Rule**: If no player has |1⟩, the first player with any INITIAL_QUBIT card starts
- **Random Distribution**: INITIAL_QUBIT cards are distributed randomly, so some players may not have any

#### 2.1.3 Turn Management System
- **Turn Counter**: Increments only when all players complete a full round
- **Direction Control**: Forward/backward turn direction controlled by Unitary cards
- **Turn Display**: Current turn number and active player indication

#### 2.1.4 Card System
Total Deck: 60 cards

**Qubit Cards (7 cards)**
- |+⟩ cards: 2 cards
- |-⟩ cards: 2 cards
- |0⟩ cards: 2 cards
- |1⟩ cards: 1 card
- Placeable only after Measurement cards

**Gate Cards (32 cards)**
- I (Identity) gates: 8 cards
- X (Pauli-X) gates: 8 cards
- Z (Pauli-Z) gates: 8 cards
- H (Hadamard) gates: 8 cards

**Unitary Cards (2 cards)**
- U cards: 2 cards

**Control Cards (4 cards)**
- C cards: 4 cards

**Target Cards (Generated dynamically)**
- O cards: Auto-generated when Control cards are placed (displayed as 'O' for "any Operation")
- Not included in deck, created during gameplay

**Measurement Cards (11 cards)**
- ⟨0| cards: 4 cards
- ⟨1| cards: 3 cards
- ⟨+| cards: 2 cards
- ⟨-| cards: 2 cards

**Initial State Cards (4 cards, distributed with other cards at game start)**
- |0⟩ cards: 3 cards
- |1⟩ cards: 1 card

### 2.2 Quantum Circuit Board

#### 2.2.1 Board Configuration
- **Lane Count**: 4 lanes (fixed)
- **Initial Setup**: Each lane pre-populated with I gate
- **Scrolling**: Unified scrolling across all lanes
- **Display**: "Quantum Circuit" title, lane names hidden

#### 2.2.2 Card Placement Rules
**Qubit Cards**
- Regular QUBIT cards: Placeable only after Measurement cards
- INITIAL_QUBIT cards: Placeable after Measurement cards or after initial I gate

**Gate Cards**
- Placeable at any position except after measurement cards
- Can be stacked on top of Unitary cards

**Unitary Cards**
- Placeable anywhere except after measurement cards
- Cannot be stacked on other Unitary cards
- Restriction: Same player cannot play more than one Unitary card per turn

**Measurement Cards**
- Placeable after any card except other Measurement cards

**Control Cards**
- Two-stage placement process: Control position → Target position
- Control and Target must be in adjacent lanes at same position
- Must be placed in empty slots
- Both Control and Target positions must have cards in all preceding positions (no gaps allowed)
- H gates cannot be control targets
- Auto-generates corresponding Target card when placed

**Target Cards**
- Automatically placed when Control cards are positioned
- Displayed as 'O' representing "any Operation" (more intuitive than 'T')
- Accept Gate card placement (similar to Unitary cards)
- Gate placement on Target cards does NOT reverse turn direction
- Cannot be manually selected or placed by players
- Cannot be placed if the preceding card in the target lane is a Measurement card

### 2.3 Measurement Card Scoring System

#### 2.3.1 Quantum Computation Engine
- **Quantum State Evolution**: Real quantum mechanics simulation using complex amplitudes
- **Gate Operations**: Accurate matrix representations (I, X, Z, H gates)
- **Measurement Simulation**: Probabilistic outcomes based on quantum state
- **Fallback System**: Classical compatibility matrix when quantum computation unavailable

#### 2.3.2 Compatibility Matrix (Classical Fallback)
| Qubit | ⟨0\| | ⟨1\| | ⟨+\| | ⟨-\| |
|-------------|------|------|------|------|
| \|0⟩        | 3    | 0    | 1    | 1    |
| \|1⟩        | 0    | 3    | 1    | 1    |
| \|+⟩        | 1    | 1    | 3    | 0    |
| \|-⟩        | 1    | 1    | 0    | 3    |

#### 2.3.3 Quantum Computation Process
1. **Circuit Construction**: Convert game board to quantum circuit representation
2. **State Evolution**: Apply quantum gates sequentially to evolve qubit state
3. **Measurement Simulation**: Calculate probabilities in specified measurement basis
4. **Score Calculation**: Use quantum probabilities for realistic scoring
5. **Debug Information**: Detailed computation steps logged to console

#### 2.3.4 Score Calculation
- **Quantum Mode**: Score based on actual quantum measurement probabilities
- **Classical Mode**: Compatibility matrix-based scoring (fallback)
- **Perfect Match**: 3 points (e.g., |0⟩ + ⟨0|)
- **Partial Match**: 1 point (e.g., |0⟩ + ⟨+|)
- **No Match**: 0 points (e.g., |0⟩ + ⟨1|)
- **Default**: 1 point when no preceding qubit exists

#### 2.3.5 Measurement Effects
- Automatic measurement counter increment
- Player score addition based on quantum computation or compatibility score
- Measurement result message display with quantum computation indicator (🔬)
- Detailed quantum computation steps logged to browser console
- Game ends after 11 measurements

### 2.4 Card Effect System

#### 2.4.1 Unitary Card Effects
- **Turn Direction Reversal**: forward ⇔ backward
- **Additional Turn**: Player gets another turn
- **Message Display**: Effect explanation shown
- **Per-Turn Limit**: Each player can only play one Unitary card per turn (additional turns count as the same turn)

#### 2.4.2 Control Card Effects
- **Control Link**: Visual connection to adjacent lanes
- **Placement Process**: Two-stage placement (control → target)
- **Visual Indicator**: Target lane number display (1-indexed)

### 2.5 User Interface

#### 2.5.1 Main Screens
- **Title Screen**: Game start, settings navigation
- **Game Screen**: Quantum circuit board, player hands, game information
- **Settings Screen**: Game configuration and options

#### 2.5.2 Settings Features
- **Volume Controls**: Sound/Music (0-100%)
- **Difficulty**: Easy/Normal/Hard
- **Animation Speed**: Slow/Normal/Fast
- **Hint Display**: ON/OFF
- **Language**: Japanese/English
- **Player Count**: 3-6 player selection
- **LocalStorage**: Persistent settings storage

#### 2.5.3 Hint System
- **Valid Placement Zones**: Highlighted placement positions for selected cards
- **Measurement Score Prediction**: Score hints when selecting measurement cards
- **Settings Dependent**: Display controlled by hint ON/OFF setting

#### 2.5.4 Visual Design
**Card Type Color Coding**
- Qubit: Green (bg-green-600)
- Initial Qubit: Dark Green (bg-green-800)
- Gate: Blue (bg-blue-600)
- Unitary: Purple (bg-purple-600)
- Control: Yellow (bg-yellow-600)
- Measurement: Red (bg-red-600)

**Interaction States**
- Hover Effect: scale-105
- Selected State: cyan-400 ring
- Current Player: Clickable
- Other Players: Display only

### 2.6 Game End Conditions
1. **Hand Empty Trigger**: When any player empties their hand, game ends and final scoring occurs
2. **Measurement Count**: 11 measurements completed
3. **Insufficient Active Players**: Only 1 or fewer active (non-eliminated) players remain
4. **All Active Players Pass**: All active players have passed 3+ times

### 2.7 Player Elimination System
- **Elimination Trigger**: Player is eliminated when they pass 4 times
- **Individual Elimination**: Only the passing player is eliminated; game continues with remaining active players
- **Visual Indication**: Eliminated players shown with red styling and "脱落" badge
- **Turn Skipping**: Eliminated players are automatically skipped during turn progression
- **Game Continuation**: Game only ends when insufficient active players remain (≤1) or other end conditions are met

#### 2.6.1 Final Scoring System
When game ends (any condition above), winner is determined by:
- **Positive Points**: Measurement card scores earned during gameplay
- **Hand Penalty**: Remaining cards in hand apply penalties based on card type:
  - **Quantum Gate Cards (I, X, Z, H)**: 5 cards per -2 points (rounded up)
    - Examples: 1-5 cards = -2 points, 6-10 cards = -4 points, 11-15 cards = -6 points
  - **All Other Cards (Qubit, Measurement, Unitary, Control, Target)**: 1 card per -2 points
    - Examples: 1 card = -2 points, 3 cards = -6 points, 5 cards = -10 points
- **Winner**: Player with highest total score (positive points - hand penalty)

**Example Final Score Calculation**:
- Player has 15 measurement points
- Remaining hand: 3 Gate cards + 2 Qubit cards  
- Penalty: ceil(3/5) × 2 + 2 × 2 = 2 + 4 = 6 points
- Final score: 15 - 6 = 9 points

## 3. Non-Functional Requirements

### 3.1 Performance Requirements
- **Response Time**: Sub-1 second response after user actions
- **Animation**: Speed adjustment based on user settings
- **Memory Usage**: Efficient state management

### 3.2 Usability Requirements
- **Intuitive Operation**: Click-based interface (no drag-and-drop required)
- **Visual Feedback**: Clear indication of valid card placement positions
- **Error Handling**: Appropriate message display for invalid operations
- **Accessibility**: Keyboard navigation support

### 3.3 Maintainability Requirements
- **TypeScript**: Enhanced maintainability through type safety
- **Component Separation**: Reusable React component design
- **Test Coverage**: Comprehensive unit and integration testing

## 4. Technical Specifications

### 4.1 Architecture
```
src/
├── components/          # React Components
│   ├── GameScreen.tsx   # Main game screen
│   ├── GameBoard.tsx    # Quantum circuit board
│   ├── PlayerHand.tsx   # Player hand component
│   ├── SettingsScreen.tsx # Settings screen
│   └── cards/          # Card Components
│       ├── BaseCard.tsx    # Base card component
│       ├── CardComponent.tsx # Card factory
│       └── [CardType].tsx  # Specific card components
├── game/               # Game Logic
│   ├── gameLogic.ts    # Core game logic
│   └── types.ts        # Type definitions
├── quantum/            # Quantum Computation
│   ├── quantumEngine.ts    # Quantum mechanics engine
│   ├── gameIntegration.ts  # Game integration layer
│   ├── types.ts           # Quantum type definitions
│   └── index.ts           # Quantum module exports
└── utils/              # Utilities
```

### 4.2 Core Functions

#### 4.2.1 Game Logic Functions
- `createDeck()`: Generate 60-card deck
- `initializeGame(playerNames)`: Initialize game state
- `isValidPlay(card, lane, position, board)`: Validate card placement
- `isValidControlCardPlay(...)`: Validate control card placement

#### 4.2.2 Measurement Card Functions
- `calculateMeasurementScore(quantumBit, measurement)`: Calculate compatibility score
- `findPrecedingQuantumBit(lane, position)`: Find preceding qubit card

#### 4.2.3 Turn Management Functions
- `advanceTurn()`: Advance to next player
- Turn counter increments only on full round completion

#### 4.2.4 Quantum Computation Functions
- `QuantumEngine.executeQuantumComputation()`: Execute quantum circuit simulation
- `QuantumGameIntegration.executeMeasurementComputation()`: Integrate quantum computation with game
- `cardValueToQuantumState()`: Convert card values to quantum states
- `applyGate()`: Apply quantum gate matrices to states
- `performMeasurement()`: Simulate quantum measurement with probabilities

### 4.3 State Management

#### 4.3.1 GameState Interface
```typescript
interface GameState {
  players: Player[];           // Player information
  deck: Card[];               // Remaining deck
  board: { lane: (Card | null)[][] }; // Quantum circuit board
  currentPlayerId: string;    // Current player
  turn: number;              // Turn number
  measurementCount: number;   // Measurement count
  gameEnded: boolean;        // Game end flag
  turnDirection: 'forward' | 'backward'; // Turn direction
}
```

#### 4.3.2 Card Interface
```typescript
interface Card {
  id: string;                 // Unique ID
  type: CardType;            // Card type
  value: CardValue;          // Card value
  controlLink?: {            // For control cards
    targetLaneIndex: number;
  };
}
```

#### 4.3.3 Quantum State Interfaces
```typescript
interface QuantumState {
  amplitude0: { real: number; imaginary: number };
  amplitude1: { real: number; imaginary: number };
}

interface QuantumComputationResult {
  measurementResult: MeasurementResult;
  gameScore: number;
  computationSteps: string[];
  executionTime: number;
}

interface QuantumCircuit {
  lanes: QuantumCircuitElement[][];
  initialStates: QuantumState[];
}
```

## 5. Testing Requirements

### 5.1 Test Coverage
- **Total Tests**: 212+ tests
- **Test Suites**: 10+ suites
- **Success Rate**: 100%
- **Quantum Module**: Dedicated test suite for quantum computation engine

### 5.2 Test Categories

#### 5.2.1 Unit Tests
- Individual game logic function testing
- Card placement validation
- Measurement card score calculation
- Turn management logic

#### 5.2.2 Component Tests
- React component rendering
- User interaction handling
- Property passing
- State changes
- Use data-* attributes (data-testid) for stable element targeting in tests

#### 5.2.3 Integration Tests
- Game state management
- Edge case handling
- Error handling

#### 5.2.4 E2E Tests
- Use Cypress for end-to-end testing
- Target elements using data-testid attributes for test stability
- Avoid relying on text content or CSS classes as selectors

### 5.3 Key Test Cases

#### 5.3.1 Measurement Card Functionality (12 tests)
- Complete compatibility matrix combinations
- Preceding qubit search (empty lanes, null values)
- Score calculation (perfect/partial/no match)

#### 5.3.2 Game State Management (20 tests)
- Turn progression (forward/backward)
- Card placement and effect processing
- Game end conditions

#### 5.3.3 Edge Cases (36 tests)
- Player count boundaries (2,3,6,7 players)
- Invalid card placements
- Control card placement restrictions

#### 5.3.4 Quantum Computation Tests (Planned)
- Quantum state initialization and evolution
- Gate matrix operations (I, X, Z, H)
- Measurement simulation in different bases
- Game integration and fallback mechanisms
- Complex amplitude calculations
- Circuit construction from game board

## 6. Constraints

### 6.1 Technical Constraints
- **Browser Support**: Modern browsers (ES2020+ support)
- **Responsive Design**: Desktop-focused (mobile optimization future)
- **Offline Play**: Local single-device play only

### 6.2 Game Constraints
- **Synchronous Play**: No real-time communication
- **AI Opponents**: Not implemented
- **Game Records**: No save/load functionality

## 7. Future Extensibility

### 7.1 Feature Extensions
- **Multiplayer**: Online multiplayer functionality
- **AI Opponents**: CPU opponent modes
- **Card Expansion**: Additional quantum gate types
- **Mobile Support**: Touch interface optimization

### 7.2 Learning Features
- **Tutorial System**: Progressive learning modes
- **Quantum Concept Explanation**: Physical meaning of card effects
- **Practice Mode**: Solo play environment

---

**Document Version**: 1.0  
**Created**: July 3, 2025  
**Last Updated**: July 13, 2025  
**Author**: Claude Code Assistant
