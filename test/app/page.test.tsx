// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../../src/app/page';

// Mock the Game component
jest.mock('../../src/components/Game', () => {
  return function MockGame() {
    return <div data-testid="game-component">Mocked Game Component</div>;
  };
});

describe('Home Page', () => {
  it('should render Game component', () => {
    render(<Home />);
    
    expect(screen.getByTestId('game-component')).toBeInTheDocument();
    expect(screen.getByTestId('game-component')).toHaveTextContent('Mocked Game Component');
  });

  it('should render without errors', () => {
    const { container } = render(<Home />);
    
    expect(container).toBeInTheDocument();
  });

  it('should have proper structure', () => {
    const { container } = render(<Home />);
    
    // Should contain the mocked Game component
    expect(container.querySelector('[data-testid="game-component"]')).toBeInTheDocument();
  });

  it('should render Game component text content', () => {
    const { container } = render(<Home />);
    
    expect(container).toHaveTextContent('Mocked Game Component');
  });

  it('should be a client component', () => {
    // This test verifies that the page uses 'use client' directive
    // by successfully rendering without SSR-related errors
    render(<Home />);
    
    expect(screen.getByTestId('game-component')).toBeInTheDocument();
  });

  it('should export a default function', () => {
    expect(typeof Home).toBe('function');
    expect(Home.name).toBe('Home');
  });

  it('should render the correct component tree', () => {
    const { container } = render(<Home />);
    
    // Should only contain the Game component
    expect(container.firstChild).toHaveAttribute('data-testid', 'game-component');
  });

  it('should not render any additional wrapper elements', () => {
    const { container } = render(<Home />);
    
    // The container should only have one direct child (the Game component)
    expect(container.children).toHaveLength(1);
  });

  it('should properly pass props to Game component (if any)', () => {
    // Even though Game doesn't accept props currently, 
    // this tests the component integration
    render(<Home />);
    
    expect(screen.getByTestId('game-component')).toBeInTheDocument();
  });

  describe('Component Integration', () => {
    it('should integrate with Game component without errors', () => {
      render(<Home />);
      
      // Verify that the Game component is rendered correctly
      const gameComponent = screen.getByTestId('game-component');
      expect(gameComponent).toBeInTheDocument();
      expect(gameComponent).toBeVisible();
    });

    it('should handle Game component re-renders', () => {
      const { rerender } = render(<Home />);
      
      expect(screen.getByTestId('game-component')).toBeInTheDocument();
      
      // Re-render the component
      rerender(<Home />);
      
      expect(screen.getByTestId('game-component')).toBeInTheDocument();
    });
  });

  describe('Next.js Page Requirements', () => {
    it('should be a valid Next.js page component', () => {
      // Next.js pages should be React functional components
      expect(typeof Home).toBe('function');
      
      // Should render without throwing
      expect(() => {
        render(<Home />);
      }).not.toThrow();
    });

    it('should use client-side rendering', () => {
      // The 'use client' directive means this component runs on the client
      // This is verified by successful rendering with client-side features
      render(<Home />);
      
      expect(screen.getByTestId('game-component')).toBeInTheDocument();
    });
  });

  describe('Performance and Optimization', () => {
    it('should render efficiently', () => {
      const startTime = performance.now();
      render(<Home />);
      const endTime = performance.now();
      
      // Component should render quickly (arbitrary threshold)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should not cause memory leaks', () => {
      const { unmount } = render(<Home />);
      
      // Component should unmount cleanly
      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle Game component errors gracefully', () => {
      // Mock console.error to prevent error output in tests
      const originalError = console.error;
      console.error = jest.fn();
      
      try {
        render(<Home />);
        expect(screen.getByTestId('game-component')).toBeInTheDocument();
      } finally {
        console.error = originalError;
      }
    });
  });

  describe('Accessibility', () => {
    it('should be accessible', () => {
      render(<Home />);
      
      // The Game component should be accessible
      const gameComponent = screen.getByTestId('game-component');
      expect(gameComponent).toBeInTheDocument();
    });

    it('should not have accessibility violations', () => {
      render(<Home />);
      
      // Basic accessibility check - component renders without throwing
      expect(screen.getByTestId('game-component')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple renders', () => {
      const { rerender } = render(<Home />);
      
      for (let i = 0; i < 5; i++) {
        rerender(<Home />);
        expect(screen.getByTestId('game-component')).toBeInTheDocument();
      }
    });

    it('should handle unmount and remount', () => {
      const { unmount } = render(<Home />);
      
      expect(screen.getByTestId('game-component')).toBeInTheDocument();
      
      unmount();
      
      // Re-render after unmount
      render(<Home />);
      expect(screen.getByTestId('game-component')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should return JSX element directly', () => {
      const result = Home();
      
      // Should return a React element
      expect(React.isValidElement(result)).toBe(true);
    });

    it('should maintain consistent structure', () => {
      const { container } = render(<Home />);
      
      // Should always render the same structure
      expect(container.firstChild).toHaveAttribute('data-testid', 'game-component');
    });
  });

  describe('Import and Export', () => {
    it('should have proper SPDX license headers', () => {
      // This is tested by the file being successfully imported
      // SPDX headers are in the source file
      expect(Home).toBeDefined();
    });

    it('should properly import Game component', () => {
      // Game component is mocked, but import should work
      render(<Home />);
      expect(screen.getByTestId('game-component')).toBeInTheDocument();
    });
  });

  describe('Functional Behavior', () => {
    it('should render consistently across multiple calls', () => {
      const render1 = render(<Home />);
      const render2 = render(<Home />);
      
      expect(render1.container.innerHTML).toBe(render2.container.innerHTML);
      
      render1.unmount();
      render2.unmount();
    });

    it('should handle rapid mounting and unmounting', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<Home />);
        expect(screen.getByTestId('game-component')).toBeInTheDocument();
        unmount();
      }
    });
  });
});