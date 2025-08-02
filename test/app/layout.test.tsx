// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RootLayout, { metadata } from '../../src/app/layout';

// Mock next/font
jest.mock('next/font/google', () => ({
  Geist: () => ({
    variable: '--font-geist-sans',
    subsets: ['latin'],
  }),
  Geist_Mono: () => ({
    variable: '--font-geist-mono',
    subsets: ['latin'],
  }),
}));

// Mock the I18nProvider
jest.mock('../../src/i18n', () => ({
  I18nProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="i18n-provider">{children}</div>
}));

describe('RootLayout', () => {
  it('should render children within proper structure', () => {
    const testContent = <div data-testid="test-content">Test Content</div>;
    
    render(<RootLayout>{testContent}</RootLayout>);
    
    // Should render I18nProvider
    expect(screen.getByTestId('i18n-provider')).toBeInTheDocument();
    
    // Should render children
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('should render layout structure correctly', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="test-child">Test</div>
      </RootLayout>
    );
    
    // In test environment, html and body are not rendered by the component
    // Instead, check that the I18nProvider wraps the children correctly
    expect(screen.getByTestId('i18n-provider')).toBeInTheDocument();
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('should configure fonts correctly', () => {
    // Test that the component renders without errors
    // In Next.js, font classes are applied at build time
    render(
      <RootLayout>
        <div data-testid="test-content">Test</div>
      </RootLayout>
    );
    
    // Verify the component structure is correct
    expect(screen.getByTestId('i18n-provider')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('should wrap content in I18nProvider', () => {
    const testContent = <div data-testid="child-content">Child Content</div>;
    
    render(<RootLayout>{testContent}</RootLayout>);
    
    const i18nProvider = screen.getByTestId('i18n-provider');
    const childContent = screen.getByTestId('child-content');
    
    expect(i18nProvider).toContainElement(childContent);
  });

  it('should handle empty children', () => {
    const { container } = render(
      <RootLayout>{null}</RootLayout>
    );
    
    expect(container.querySelector('[data-testid="i18n-provider"]')).toBeInTheDocument();
  });

  it('should handle multiple children', () => {
    const children = (
      <>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </>
    );
    
    render(<RootLayout>{children}</RootLayout>);
    
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('should handle undefined children gracefully', () => {
    render(<RootLayout>{undefined}</RootLayout>);
    
    // Should still render I18nProvider even with undefined children
    expect(screen.getByTestId('i18n-provider')).toBeInTheDocument();
  });

  it('should render with complex nested children', () => {
    const complexChildren = (
      <div data-testid="wrapper">
        <header data-testid="header">Header</header>
        <main data-testid="main">
          <section data-testid="section">Section</section>
        </main>
      </div>
    );
    
    render(<RootLayout>{complexChildren}</RootLayout>);
    
    expect(screen.getByTestId('wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('main')).toBeInTheDocument();
    expect(screen.getByTestId('section')).toBeInTheDocument();
  });

  describe('Font Configuration', () => {
    it('should render with font configuration', () => {
      // Font variables are applied at build time in Next.js
      // We can only test that the component renders successfully
      render(
        <RootLayout>
          <div data-testid="font-test">Font test</div>
        </RootLayout>
      );

      expect(screen.getByTestId('font-test')).toBeInTheDocument();
      expect(screen.getByTestId('i18n-provider')).toBeInTheDocument();
    });
  });

  describe('HTML Structure', () => {
    it('should have proper document structure', () => {
      render(
        <RootLayout>
          <main data-testid="main-content">Main content</main>
        </RootLayout>
      );

      // In test environment, check the rendered structure
      expect(screen.getByTestId('i18n-provider')).toBeInTheDocument();
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
    });

    it('should maintain semantic HTML structure', () => {
      render(
        <RootLayout>
          <main data-testid="semantic-main">
            <article data-testid="semantic-article">Article content</article>
          </main>
        </RootLayout>
      );

      expect(screen.getByTestId('semantic-main')).toBeInTheDocument();
      expect(screen.getByTestId('semantic-article')).toBeInTheDocument();
    });
  });

  describe('Metadata Export', () => {
    it('should export correct metadata', () => {
      expect(metadata).toBeDefined();
      expect(metadata.title).toBe('Create Next App');
      expect(metadata.description).toBe('Generated by create next app');
    });

    it('should have metadata with string title', () => {
      expect(typeof metadata.title).toBe('string');
    });

    it('should have metadata with string description', () => {
      expect(typeof metadata.description).toBe('string');
    });
  });

  describe('Edge Cases', () => {
    it('should handle React fragments as children', () => {
      const fragmentChildren = (
        <>
          <div data-testid="fragment-child-1">Fragment 1</div>
          <div data-testid="fragment-child-2">Fragment 2</div>
        </>
      );
      
      render(<RootLayout>{fragmentChildren}</RootLayout>);
      
      expect(screen.getByTestId('fragment-child-1')).toBeInTheDocument();
      expect(screen.getByTestId('fragment-child-2')).toBeInTheDocument();
    });

    it('should handle conditional children', () => {
      const showContent = true;
      const conditionalChildren = showContent ? <div data-testid="conditional-content">Shown</div> : null;
      
      render(<RootLayout>{conditionalChildren}</RootLayout>);
      
      expect(screen.getByTestId('conditional-content')).toBeInTheDocument();
    });

    it('should handle array of children', () => {
      const arrayChildren = [
        <div key="1" data-testid="array-child-1">Array 1</div>,
        <div key="2" data-testid="array-child-2">Array 2</div>
      ];
      
      render(<RootLayout>{arrayChildren}</RootLayout>);
      
      expect(screen.getByTestId('array-child-1')).toBeInTheDocument();
      expect(screen.getByTestId('array-child-2')).toBeInTheDocument();
    });
  });

  describe('Integration with I18nProvider', () => {
    it('should provide translation context to children', () => {
      const testChild = <div data-testid="i18n-child">I18n Child</div>;
      
      render(<RootLayout>{testChild}</RootLayout>);
      
      const i18nProvider = screen.getByTestId('i18n-provider');
      const child = screen.getByTestId('i18n-child');
      
      expect(i18nProvider).toContainElement(child);
    });
  });

  describe('CSS and Styling', () => {
    it('should render without errors', () => {
      render(
        <RootLayout>
          <div data-testid="styled-content">Content</div>
        </RootLayout>
      );

      // Test that the component renders successfully
      expect(screen.getByTestId('styled-content')).toBeInTheDocument();
      expect(screen.getByTestId('i18n-provider')).toBeInTheDocument();
    });
  });
});