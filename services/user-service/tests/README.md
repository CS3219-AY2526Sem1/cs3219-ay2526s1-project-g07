# User Service Tests

This directory contains the test suite for the user-service.

## Structure

```
tests/
├── unit/              # Unit tests
│   ├── userController.test.ts
│   ├── userRepository.test.ts
│   └── userService.test.ts
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
- **userController.test.ts** - HTTP endpoint logic
- **userService.test.ts** - Business logic layer
- **userRepository.test.ts** - Database operations

### Current Tests

#### UserController (11 tests)
- GET /getUserData/:userId
- PUT /updateUserData/:userId
- GET /getAllUsers
- PATCH /:userId/role
- GET /checkAdmin/:userId

#### UserService (12 tests)
- getUserData()
- updateUserData()
- getAllUsers()
- updateUserRole()

#### UserRepository (14 tests)
- getUserData()
- updateUserData()
- getAllUsers()
- updateUserRole()

All tests include:
- Success cases
- Error handling
- Edge cases
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
