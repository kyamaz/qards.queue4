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
- **Cards**: Number cards (0-6 in 4 colors) and Quantum cards (H, X, Y, Z gates)
- **Players**: 4 players (Human at position 0, CPUs at positions 1-3)
- **Board**: 7x4 grid for placing cards
- **Win Condition**: First player to empty their hand wins

### Core Game Flow
1. Game initialization in `gameLogic.ts:initializeGame()`
2. Card placement validation in `isValidMove()`
3. Turn management through `gameState.currentPlayer`
4. CPU players make automatic moves

## Development Guidelines

1. **TypeScript**: Use strict type checking. Import types from `/src/game/types.ts`
2. **Testing**: Write tests for any new game logic in `/test/game/`
3. **Path Imports**: Use `@/` alias for imports (maps to `./src/`)
4. **Client Components**: Add 'use client' directive for interactive components
5. **Styling**: Use Tailwind CSS v4 classes for all styling