# Implementation Plan - Displaying Exact Student Names on Waitlist Page

## Problem
The registered waiting list shows the total count (e.g. 5) at the top, but the list of student names below needs to be robustly fetched and rendered with all registered student names from the database waitlist table.

## Proposed Changes
1. **Waitlist Service (`/src/services/waitlist.ts`)**:
   - Ensure `fetchWaitlistPublicDirectory` reliably queries the Supabase `get_waitlist_directory` RPC (or falls back to local storage correctly).
   - Guarantee `first_name` and `is_me` flags are mapped correctly.

2. **Waitlist Page (`/src/pages/WaitlistPage.tsx`)**:
   - Ensure `loadData` runs immediately on mount and populates all fetched student names into state (`items`).
   - Add explicit empty-state handling if no names are returned yet.
   - Ensure infinite scroll or load-more displays all student rows cleanly.

## Verification Plan
- Run `npm run build` to verify clean compilation.
- Check that the list renders all exact student names below the total count banner.
