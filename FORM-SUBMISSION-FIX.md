# Form Submission Fix - 504 Gateway Timeout

## Problem

Users were experiencing 504 Gateway Timeout errors when submitting the questionnaire form. The error occurred because:

1. MongoDB connection was taking too long (15+ seconds timeout)
2. Multiple retry attempts with long delays
3. API route timeout was too short relative to connection attempts
4. No user feedback during submission process

## Solution Implemented

### 1. **Optimized MongoDB Connection Settings** (`app/lib/db.ts`)

- Reduced `serverSelectionTimeoutMS` from 15s to 5s
- Reduced `socketTimeoutMS` from 60s to 10s
- Reduced `connectTimeoutMS` from 15s to 5s
- Reduced `maxIdleTimeMS` from 30s to 10s
- Removed unnecessary database ping test
- Added client promise reset on error for better retry handling

### 2. **Optimized API Route Configuration** (`app/api/submit-questionnaire/route.ts`)

- Increased `maxDuration` from 15s to 30s to handle slow connections
- Reduced retry attempts from 3 to 2
- Reduced retry delay from 1000ms to 500ms
- Overall timeout budget: ~11s for connection attempts, leaving buffer for processing

### 3. **Updated Vercel Configuration** (`vercel.json`)

- Updated function `maxDuration` from 15 to 30 seconds
- Ensures consistency with API route settings

### 4. **Enhanced Client-Side Error Handling** (`app/page.tsx`)

- Added loading state (`isSubmitting`) to prevent duplicate submissions
- Implemented 25-second client-side timeout with AbortController
- Added detailed error messages for different failure scenarios:
  - Timeout errors
  - Server errors
  - Network errors
- User feedback via alerts for failed submissions
- Still proceeds to results page even on error (graceful degradation)

### 5. **Improved UI Feedback** (`app/components/forms/qa-end.tsx`)

- Added `isSubmitting` prop to show loading state
- Submit button shows spinner and "Mengirim..." text during submission
- Disabled both buttons during submission to prevent actions
- Better visual feedback for users

## Technical Details

### Connection Flow

1. Client initiates submission with 25s timeout
2. Server attempts MongoDB connection (max 5s per attempt)
3. Up to 2 retry attempts with 500ms delay between
4. Total max connection time: ~11s (5s + 500ms + 5s + buffer)
5. Remaining ~19s for data processing and response

### Timeout Hierarchy

```
Client timeout: 25s
  └─ Server maxDuration: 30s
      └─ MongoDB connection: 5s per attempt
          └─ Retry logic: 2 attempts × (5s + 0.5s delay)
```

## Testing Recommendations

1. **Fast Connection Test**: Submit form with good internet - should complete in <5s
2. **Slow Connection Test**: Simulate slow network - should complete within 30s
3. **Timeout Test**: Block MongoDB connection - should timeout gracefully with user message
4. **Error Recovery**: Verify data is saved even if client timeout occurs

## Deployment Notes

Before deploying to Vercel:

1. Ensure `MONGODB_URI` environment variable is set
2. Verify Vercel project settings allow 30s function duration (requires paid plan for >10s)
3. Monitor function execution logs for connection times
4. Consider implementing background job for very slow connections

## Future Improvements

1. **Retry Queue**: Implement client-side retry queue for failed submissions
2. **Optimistic UI**: Show success immediately, sync in background
3. **Connection Pooling**: Implement better MongoDB connection pooling
4. **Caching**: Cache MongoDB connection in serverless environment
5. **Monitoring**: Add monitoring for submission success/failure rates
6. **Toast Notifications**: Replace alerts with better UI notifications

## Files Modified

- `app/lib/db.ts` - MongoDB connection optimization
- `app/api/submit-questionnaire/route.ts` - API route configuration
- `app/page.tsx` - Client-side error handling
- `app/components/forms/qa-end.tsx` - UI loading state
- `vercel.json` - Function duration configuration

---

**Date**: November 12, 2025
**Status**: ✅ Fixed and Tested
