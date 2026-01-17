## API Base Path Mismatch Between Frontend and Backend

### Type
Bug / Enhancement

### Description

There is a mismatch between frontend API calls and backend route mount points.
On the frontend, API requests are made to endpoints like:
/queues,
/operator/queues,
/user-status/current-queue

However, the backend exposes these routes under the /api prefix:
/api/queues,
/api/operator/queues,
/api/user-status/...

When NEXT_PUBLIC_API_URL is set to something like http://localhost:5000, frontend requests to /queues do not resolve to /api/queues, leading to inconsistent 404 errors across different flows.
This causes confusion because some API calls appear to work while others silently fail depending on how the base URL is composed.

### Why this matters

Causes broken API calls and unexpected 404s
Makes debugging difficult for contributors and new developers
Creates fragile frontend–backend coupling
Slows down feature development due to unclear API contracts
Fixing this improves reliability, developer experience, and onboarding.
