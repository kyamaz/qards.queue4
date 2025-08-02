# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Quantum Gate Card Game (Qards) - an educational card game about quantum computing based on the Japanese game "Shichinarabe" (七並べ). Built with Next.js 15, React 19, TypeScript, and Tailwind CSS v4.

## Essential Commands

### Development
```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Testing
```bash
npm test         # Run Jest tests
```

## Architecture Overview

### Directory Structure
- `/src/app/` - Next.js App Router pages and layouts
- `/src/components/` - React components with 'use client' directive
  - `GameScreen.tsx` - Main game container
  - `GameBoard.tsx` - Game board display
  - `PlayerHand.tsx` - Player hand management
- `/src/game/` - Core game logic (pure functions, no UI dependencies)
  - `types.ts` - All TypeScript types and interfaces
  - `gameLogic.ts` - Game state management and rules
- `/test/` - Jest unit tests mirroring `/src/` structure

### Key Architectural Decisions

1. **Separation of Concerns**: Game logic (`/src/game/`) is completely separated from UI components (`/src/components/`). This allows testing game rules independently of React.

2. **Type Safety**: All game entities (Player, Card, GameState) are strongly typed in `types.ts`. The game uses discriminated unions for card types (NumberCard | QuantumCard).

3. **State Management**: Game state is managed in React components using useState hooks. No external state management library is used.

4. **Component Pattern**: Components use the 'use client' directive and are functional components with hooks.

## Game-Specific Context

### Game Elements
- **Cards**: Various quantum computing cards including:
  - **QUBIT Cards**: Initial quantum states (|0⟩, |1⟩, |+⟩, |-⟩)
  - **GATE Cards**: Quantum gates (I, X, Z, H)
  - **CONTROL Cards**: Used to create controlled operations (C)
  - **TARGET Cards**: Auto-generated targets for controlled gates, displayed as 'O' (any Operation)
  - **UNITARY Cards**: General unitary operations (U)
  - **MEASUREMENT Cards**: Measurement operations (⟨0|, ⟨1|, ⟨+|, ⟨-|)
- **Players**: 3-6 players with elimination system for players who pass 4 times
- **Board**: 4-lane quantum circuit board
- **Win Condition**: Based on measurement points minus hand penalties when game ends
- **Elimination System**: Players who pass 4 times are eliminated individually; game continues with remaining players

### TARGET Card Display
TARGET cards are displayed with the symbol 'O' rather than 'T' to represent "any Operation". This design choice reflects that TARGET cards represent positions where any quantum operation can be applied as the target of a controlled gate, making 'O' a more intuitive and semantically correct representation than 'T'.

### Core Game Flow
1. Game initialization in `gameLogic.ts:initializeGame()`
2. Card placement validation in `isValidPlay()`
3. Turn management through `gameState.currentPlayerId` with active player filtering
4. Player elimination system when passing 4 times
5. Game ends when insufficient active players remain or other end conditions are met

### Scoring System
- **Measurement Cards**: When a measurement card is played, points are awarded based on the quantum measurement outcome:
  - **Measurement result '1'**: +5 points
  - **Measurement result '0'**: +3 points
- **Hand Penalty System**: Remaining cards in hand apply penalties at game end:
  - **Quantum Gate Cards (I, X, Z, H)**: 5 cards per -2 points (rounded up)
    - Examples: 1-5 cards = -2 pts, 6-10 cards = -4 pts, 11-15 cards = -6 pts
  - **All Other Cards (Qubit, Measurement, Unitary, Control, Target)**: 1 card per -2 points
    - Examples: 1 card = -2 pts, 3 cards = -6 pts, 5 cards = -10 pts
- **Quantum Integration**: The game includes real quantum computation when possible, falling back to classical simulation
- **Final Scoring**: Measurement points minus hand penalty determines the winner

## Development Guidelines

1. **TypeScript**: Use strict type checking. Import types from `/src/game/types.ts`
2. **Testing**: Write tests for any new game logic in `/test/game/`
3. **Path Imports**: Use `@/` alias for imports (maps to `./src/`)
4. **Client Components**: Add 'use client' directive for interactive components
5. **Styling**: Use Tailwind CSS v4 classes for all styling

### Git Branching Strategy
- **Feature branches** → **develop branch** → **main branch**
- Create feature branches from `develop` for new features and bug fixes
- Merge feature branches into `develop` via pull requests
- Merge `develop` into `main` for releases
- `main` branch contains stable, production-ready code

### Commit Guidelines
- **Always run tests before committing**: Execute `npm test` to ensure all tests pass
- **Never commit broken code**: Verify that your changes don't break existing functionality
- **Pre-commit checklist**:
  1. Run `npm test` - all tests must pass
  2. Run `npm run lint` - fix any linting errors
  3. Run `npm run build` - ensure the build succeeds
  4. Review your changes with `git diff`

## License and Copyright

This project is licensed under the MIT License. All source code files include SPDX license identifiers for compliance and clarity.

### SPDX License Identifier Policy
- **All source files** (.ts, .tsx, .js, .jsx, .css) must include both SPDX headers
- **Header format**: 
  ```
  // SPDX-License-Identifier: MIT
  // SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
  ```
  For CSS files use `/* */` comment style instead of `//`
- **Placement**: SPDX headers must be the very first lines of each file
- **JSON files**: Skip JSON files as they don't support comments
- **Generated files**: Skip auto-generated files like `next-env.d.ts`

## Memories

- to memorize
