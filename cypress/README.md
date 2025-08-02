# Cypress E2E Tests

This directory contains end-to-end tests for the Quantum Gate Card Game using Cypress.

## Running Tests

### Interactive Mode (with Cypress UI)
```bash
npm run e2e
```
This will:
1. Start the development server
2. Open the Cypress Test Runner
3. Allow you to run tests interactively

### Headless Mode (for CI/CD)
```bash
npm run e2e:headless
```
This will:
1. Start the development server
2. Run all tests in headless mode
3. Exit with appropriate status code

### Manual Testing
If you already have the dev server running:
```bash
npm run cypress:open   # Open Cypress UI
npm run cypress:run    # Run tests headlessly
```

## Test Structure

- `/e2e/` - End-to-end test files
  - `game-navigation.cy.ts` - Tests for navigating between screens
  - `settings.cy.ts` - Tests for settings functionality
  - `game-play.cy.ts` - Tests for game play interactions
- `/fixtures/` - Test data and mock data
- `/support/` - Custom commands and utilities
  - `commands.ts` - Custom Cypress commands for data-testid
  - `e2e.ts` - E2E test configuration

## Custom Commands

We've added custom commands to work with data-testid attributes:

- `cy.getByTestId(testId)` - Get element by data-testid
- `cy.clickByTestId(testId)` - Click element by data-testid
- `cy.shouldExistByTestId(testId)` - Assert element exists
- `cy.shouldNotExistByTestId(testId)` - Assert element doesn't exist

## Writing Tests

When writing new tests:
1. Always use data-testid attributes to select elements
2. Use the custom commands for cleaner code
3. Group related tests in describe blocks
4. Use beforeEach for common setup
5. Keep tests focused and independent

Example:
```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should do something specific', () => {
    cy.clickByTestId('some-button');
    cy.shouldExistByTestId('expected-element');
  });
});
```

## Best Practices

1. **Avoid using text selectors** - Use data-testid instead
2. **Keep tests independent** - Each test should run in isolation
3. **Use meaningful test names** - Describe what the test verifies
4. **Wait for elements** - Cypress automatically waits, avoid manual waits
5. **Test user flows** - Focus on real user scenarios