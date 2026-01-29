

## Plan: Increase Lead Submission Rate Limit

### Current Setting
- **File:** `src/utils/leadValidation.ts`
- **Line 34:** `const MAX_SUBMISSIONS = 3;`
- **Time Window:** 1 hour (unchanged)

### Change Required

Update line 34 to increase the limit:

```typescript
// Before
const MAX_SUBMISSIONS = 3; // Maximum submissions allowed

// After
const MAX_SUBMISSIONS = 10; // Maximum submissions allowed
```

### Impact
- Users can now submit up to **10 lead forms per hour** before being rate-limited
- Provides more flexibility for testing and legitimate multi-submission scenarios
- Still protects against spam/bot abuse

### File to Modify
1. `src/utils/leadValidation.ts` - Line 34: Change `MAX_SUBMISSIONS` from `3` to `10`

