# Question Service Tests

This directory contains the test suite for the question-service.

## Structure

```
tests/
├── unit/              # Unit tests
│   ├── questionController.test.ts
│   ├── questionRepository.test.ts
│   └── questionService.test.ts
└── integration/       # Integration tests (future)
```

## Running Tests

### Run all tests
```bash
pnpm test
```

### Run tests in watch mode
```bash
pnpm test:watch
```

### Run tests with UI
```bash
pnpm test:ui
```

### Run tests with coverage
```bash
pnpm test:coverage
```

## Test Coverage

The test suite covers:
- **questionController.test.ts** - HTTP endpoint logic
- **questionService.test.ts** - Business logic layer with validation
- **questionRepository.test.ts** - Database operations

### Current Tests

#### QuestionController (15 tests)
- GET /questions
- POST /questions
- GET /questions/:id
- PUT /questions/:id
- DELETE /questions/:id

#### QuestionService (29 tests)
- createQuestion() - with validation for all fields
- getAllQuestions()
- getQuestionById()
- updateQuestion()
- deleteQuestion()
- findMatchingQuestion()

#### QuestionRepository (21 tests)
- createQuestion()
- getAllQuestions()
- getQuestionById()
- updateQuestion() - with dynamic field updates
- deleteQuestion()
- findMatchingQuestion() - with case-insensitive search

All tests include:
- Success cases
- Error handling
- Edge cases
- Validation scenarios
- Database failure scenarios

## Writing New Tests

1. Create test file in `tests/unit/` or `tests/integration/`
2. Follow naming convention: `*.test.ts`
3. Use vitest's `describe`, `it`, `expect` syntax
4. Mock external dependencies with `vi.mock()`

Example:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('MyFeature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```
