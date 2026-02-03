# Frontend Testing Guide

## Overview

This project uses **Jest** and **React Testing Library** for unit and integration testing of React components.

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are located alongside the components they test in `__tests__` directories:

```
src/
  components/
    __tests__/
      TaskCard.test.tsx
    TaskCard.tsx
```

## Writing Tests

### Component Tests

```typescript
import { render, screen, fireEvent } from '@/test-utils'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('handles user interaction', () => {
    const mockHandler = jest.fn()
    render(<MyComponent onClick={mockHandler} />)

    fireEvent.click(screen.getByRole('button'))
    expect(mockHandler).toHaveBeenCalled()
  })
})
```

### Mocking Fetch

```typescript
global.fetch = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
})

it('fetches data', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: 'test' }),
  })

  // Your test code here
})
```

## Test Coverage

Current test coverage focuses on:
- ✅ TaskCard component (8 tests)
  - Rendering task information
  - Priority badge display
  - Edit/Delete button interactions
  - Checkbox toggle functionality
  - Inline editing
  - Completed task styling

## Best Practices

1. **Test user behavior, not implementation details**
   - Use `screen.getByRole()`, `screen.getByText()`, `screen.getByTitle()`
   - Avoid testing internal state or implementation

2. **Keep tests isolated**
   - Clear mocks between tests with `beforeEach(() => jest.clearAllMocks())`
   - Don't rely on test execution order

3. **Use descriptive test names**
   - `it('calls onDelete when delete button is clicked')`
   - Not: `it('works')`

4. **Mock external dependencies**
   - Mock `fetch` for API calls
   - Mock complex child components when testing parents

## Configuration Files

- `jest.config.js` - Jest configuration for Next.js
- `jest.setup.js` - Global test setup (imports `@testing-library/jest-dom`)
- `src/test-utils.tsx` - Custom render function with providers

## Troubleshooting

### TypeScript errors for Jest matchers

If you see TypeScript errors for matchers like `toBeInTheDocument()`, ensure:
1. `@testing-library/jest-dom` is installed
2. `jest.setup.js` imports it
3. `setupFilesAfterEnv` is configured in `jest.config.js`

### Tests fail with "Cannot find module"

Check that `moduleNameMapper` in `jest.config.js` matches your `tsconfig.json` paths.

## Adding New Tests

1. Create a `__tests__` directory next to your component
2. Create a test file: `ComponentName.test.tsx`
3. Import from `@/test-utils` instead of `@testing-library/react`
4. Write your tests following the patterns above
5. Run `npm test` to verify

## CI/CD Integration

Tests run automatically in CI/CD pipelines. All tests must pass before merging to main.
