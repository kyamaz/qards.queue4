# qards.queue4 - Quantum Card Game Requirements Specification

## 1. Project Overview

### 1.1 Project Name
qards.queu4 - Quantum Computing Card Game

### 1.2 Purpose
Develop a card game application that allows players to learn fundamental quantum computing concepts (qubits, gate operations, measurements) in an engaging and interactive way.

### 1.3 Game Concept
Similar to the classic card game "Shichinarabe" (also known as Fan Tan), players place cards (gates) according to specific rules, starting from a fixed reference point (the 'I' gates). The game is designed to feel like building a quantum circuit, where players compete for points earned from card plays and measurements.

### 1.4 Target Audience
- Individuals interested in quantum computers and quantum mechanics.
- People who enjoy programming and logic puzzles.
- Players looking to try a new and strategic type of card game.

### 1.5 Technology Stack
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
- **Card Placement**: Players with INITIAL_QUBIT cards must place ALL of them in the leftmost available board slots
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

**Initial State Cards (4 cards, distributed with other cards at game start)**
- |0⟩ cards: 3 cards
- |1⟩ cards: 1 card

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

### 2.2 Quantum Circuit Board

#### 2.2.1 Board Configuration
- **Lane Count**: 4 lanes (fixed)
- **Initial Setup**: Each lane pre-populated with an I gate in the center
- **Scrolling**: Unified scrolling across all lanes
- **Display**: "Quantum Circuit" title, lane names hidden

#### 2.2.2 Card Placement Rules
**Qubit Cards**
- Regular QUBIT cards: Placeable only after Measurement cards
- INITIAL_QUBIT cards: Placeable after Measurement cards or after the initial I gate

**Gate Cards**
- Placeable at any position except after measurement cards
- Can be stacked on top of Unitary cards

**Unitary Cards**
- Placeable anywhere except after measurement cards
- Cannot be stacked on other Unitary cards
- Restriction: A player cannot play more than one Unitary card per turn (additional turns granted by the card are considered part of the same turn).

**Measurement Cards**
- Placeable after any card except other Measurement cards

**Control Cards**
- Two-stage placement process: Control position → Target position
- Control and Target must be in adjacent lanes at the same position
- Must be placed in empty slots
- Both Control and Target positions must have cards in all preceding positions (no gaps allowed in the lane)
- H gates cannot be control targets
- Auto-generates a corresponding Target card when placed

**Target Cards**
- Automatically placed when Control cards are positioned
- Displayed as 'O' representing "any Operation" (more intuitive than 'T')
- Accept Gate card placement (similar to Unitary cards)
- Gate placement on Target cards does NOT reverse turn direction
- Cannot be manually selected or placed by players
- Cannot be placed if the preceding card in the target lane is a Measurement card

### 2.3 Scoring System

#### 2.3.1 Measurement Scoring
- **Quantum Computation Engine**: The game uses a real quantum mechanics simulation with complex amplitudes to evolve the quantum state. Measurement outcomes are probabilistic, based on the final state.
- **Fallback System**: If quantum computation is unavailable, a classical compatibility matrix is used.
- **Score Calculation**:
  - **Quantum Mode**: Score is based on actual quantum measurement probabilities.
  - **Classical Mode**: Uses the compatibility matrix for scoring.
  - **Perfect Match**: 3 points (e.g., |0⟩ measured with ⟨0|)
  - **Partial Match**: 1 point (e.g., |0⟩ measured with ⟨+|)
  - **No Match**: 0 points (e.g., |0⟩ measured with ⟨1|)
  - **Default**: 1 point is awarded if no preceding qubit exists in the lane.
- **Compatibility Matrix (Classical Fallback)**
| Qubit | ⟨0\| | ⟨1\| | ⟨+\| | ⟨-\| |
|---|---|---|---|---|
| \|0⟩ | 3 | 0 | 1 | 1 |
| \|1⟩ | 0 | 3 | 1 | 1 |
| \|+⟩ | 1 | 1 | 3 | 0 |
| \|-⟩ | 1 | 1 | 0 | 3 |

#### 2.3.2 Final Scoring System
When the game ends, the winner is determined by:
- **Positive Points**: Sum of all measurement scores earned during gameplay.
- **Hand Penalty**: Remaining cards in hand apply penalties:
  - **Quantum Gate Cards (I, X, Z, H)**: -2 points for every 5 cards (rounded up).
    - Examples: 1-5 cards = -2 pts, 6-10 cards = -4 pts.
  - **All Other Cards (Qubit, Measurement, Unitary, Control, Target)**: -2 points per card.
    - Examples: 1 card = -2 pts, 3 cards = -6 pts.
- **Winner**: Player with the highest total score (Positive Points - Hand Penalty).

**Example Final Score Calculation**:
- Player has 15 measurement points.
- Remaining hand: 3 Gate cards + 2 Qubit cards.
- Penalty: (ceil(3/5) * 2) + (2 * 2) = 2 + 4 = 6 points.
- Final score: 15 - 6 = 9 points.

### 2.4 Card Effect System

#### 2.4.1 Unitary Card Effects
- **Turn Direction Reversal**: Flips the turn order (forward ⇔ backward).
- **Additional Turn**: The player who played the card gets another turn immediately.
- **Message Display**: An explanation of the effect is shown.
- **Per-Turn Limit**: Each player can only play one Unitary card per turn.

#### 2.4.2 Control Card Effects
- **Control Link**: Creates a visual connection to an adjacent lane.
- **Placement Process**: A two-stage placement (control → target).
- **Visual Indicator**: The target lane number is displayed (1-indexed).

### 2.5 User Interface

#### 2.5.1 Main Screens
- **Title Screen**: Game start, navigation to settings.
- **Game Screen**: Displays the quantum circuit board, player hands, and game information.
- **Settings Screen**: Game configuration and options.
- **Result Screen**: Shows final scores and rankings, highlights the winner.

#### 2.5.2 Settings Features
- **Volume Controls**: Sound/Music (0-100%).
- **Difficulty**: Easy/Normal/Hard.
- **Animation Speed**: Slow/Normal/Fast.
- **Hint Display**: ON/OFF.
- **Language**: Japanese/English.
- **Player Count**: 3-6 player selection.
- **LocalStorage**: Settings are persisted in LocalStorage.

#### 2.5.3 Hint System
- **Valid Placement Zones**: Highlights valid placement positions for the selected card.
- **Measurement Score Prediction**: Shows score hints when a measurement card is selected.
- **Settings Dependent**: Display is controlled by the hint ON/OFF setting.

#### 2.5.4 Visual Design & Interaction
**Card Type Color Coding**
- Qubit: Green (`bg-green-600`)
- Initial Qubit: Dark Green (`bg-green-800`)
- Gate: Blue (`bg-blue-600`)
- Unitary: Purple (`bg-purple-600`)
- Control: Yellow (`bg-yellow-600`)
- Measurement: Red (`bg-red-600`)

**Interaction States**
- Hover Effect: `scale-105`
- Selected State: `cyan-400` ring
- Current Player's Hand: Cards are clickable.
- Other Players' Hands: Display only.

### 2.6 Game End Conditions
1. **Hand Empty**: The game ends immediately when any player empties their hand.
2. **Measurement Count**: The game ends after 11 measurements have been completed.
3. **Insufficient Active Players**: The game ends if only 1 or fewer active (non-eliminated) players remain.
4. **All Players Pass**: The game ends if all active players have passed 3 or more times.

### 2.7 Player Elimination System
- **Elimination Trigger**: A player is eliminated when they pass for the 4th time.
- **Individual Elimination**: Only the passing player is eliminated; the game continues with the remaining active players.
- **Visual Indication**: Eliminated players are shown with red styling and a "Eliminated" (脱落) badge.
- **Turn Skipping**: Eliminated players are automatically skipped during turn progression.

## 3. Non-Functional Requirements

### 3.1 Performance
- **Response Time**: User actions should have a sub-1 second response time.
- **Animation**: Animation speed should be adjustable based on user settings.
- **Memory Usage**: State management should be efficient.

### 3.2 Usability
- **Intuitive Operation**: A click-based interface (no drag-and-drop required).
- **Visual Feedback**: Clear indication of valid card placement positions.
- **Error Handling**: Appropriate messages for invalid operations.
- **Accessibility**: Support for keyboard navigation.

### 3.3 Maintainability
- **TypeScript**: Use of TypeScript for enhanced maintainability through type safety.
- **Component Separation**: A reusable React component design.
- **Test Coverage**: Comprehensive unit and integration testing.

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
- `createDeck()`: Generate the 60-card deck.
- `initializeGame(playerNames)`: Initialize the game state.
- `isValidPlay(card, lane, position, board)`: Validate card placement.
- `isValidControlCardPlay(...)`: Validate control card placement.

#### 4.2.2 Quantum & Measurement Functions
- `QuantumEngine.executeQuantumComputation()`: Execute the quantum circuit simulation.
- `QuantumGameIntegration.executeMeasurementComputation()`: Integrate quantum computation with the game.
- `findPrecedingQuantumBit(lane, position)`: Find the preceding qubit card for measurement.

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
```

## 5. Testing Requirements

### 5.1 Test Coverage
- **Unit & Integration Tests**: Comprehensive coverage of game logic, state management, and component rendering.
- **E2E Tests**: Key user flows and game scenarios are tested using Cypress.
- **Quantum Module**: A dedicated test suite for the quantum computation engine.

### 5.2 Test Strategy
- **Unit Tests**: Focus on individual functions in `gameLogic.ts` and `quantumEngine.ts`.
- **Component Tests**: Verify React component rendering and interaction using React Testing Library.
- **Integration Tests**: Test the interaction between different parts of the game logic.
- **E2E Tests**: Use Cypress to simulate full game scenarios. Use `data-testid` attributes for stable element selection.

## 6. Constraints

### 6.1 Technical Constraints
- **Browser Support**: Modern browsers with ES2020+ support.
- **Responsive Design**: Primarily desktop-focused, with mobile optimization as a future goal.
- **Offline Play**: Local, single-device play only.

### 6.2 Game Constraints
- **Synchronous Play**: No real-time communication for multiplayer.
- **AI Opponents**: Not currently implemented.
- **Game Records**: No save/load functionality.

## 7. Future Extensibility

### 7.1 Feature Extensions
- **Multiplayer**: Online multiplayer functionality.
- **AI Opponents**: CPU opponent modes.
- **Card Expansion**: Additional quantum gate types.
- **Mobile Support**: Optimization for touch interfaces.

### 7.2 Learning Features
- **Tutorial System**: A progressive learning mode for new players.
- **Quantum Concept Explanation**: In-game explanations of the physical meaning behind card effects.
- **Practice Mode**: A solo play environment.

---

**Document Version**: 1.1
**Last Updated**: August 2, 2025
**Author**: Kiyohito Yamaz@ki
