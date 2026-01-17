# Legacy Data Migration Guide (Option A)

## Overview

This guide describes the Option A strategy:
- Legacy profiles keep their legacy `userID` as `profiles.id` (TEXT)
- New users use `profiles.id = auth.users.id::text`
- Profiles are linked on **email verification**

## User States

### 1. LEGACY
- Imported from the old system
- `profiles.auth_id` is NULL
- `profiles.status = 'LEGACY'`
- `profiles.is_unclaimed = true`

### 2. CLAIMED
- Legacy user has verified their email in Supabase Auth
- `profiles.auth_id` is set
- `profiles.status = 'CLAIMED'`
- `profiles.is_unclaimed = false`

### 3. NEW
- Signed up directly in Supabase Auth (no legacy data)
- `profiles.id = auth.users.id::text`
- `profiles.status = 'NEW'`
- `profiles.is_unclaimed = false`

## How Claiming Works

1. A user signs up in Supabase Auth
2. When their email is verified, a trigger runs:
   - If a LEGACY profile matches by email (case-insensitive), it is claimed
   - Otherwise a NEW profile is created

No legacy data is rewritten. Access is based on `profiles.id`, which remains the legacy ID for legacy users.

## Migration Steps

### 1) Run Schema Migrations

Execute migrations in order:

```bash
psql -f supabase/migrations/001_create_tables.sql
psql -f supabase/migrations/002_import_data.sql
psql -f supabase/migrations/003_auth_triggers.sql
psql -f supabase/migrations/004_rls_policies.sql
```

Or using Supabase CLI:

```bash
supabase db reset
```

### 2) Import Legacy CSV Data

```bash
node scripts/import-legacy-data.js import
```

This sets:
- `profiles.status = 'LEGACY'`
- `profiles.is_unclaimed = true`

### 3) Verify Import

```sql
SELECT status, COUNT(*) FROM profiles GROUP BY status;
SELECT COUNT(*) FROM profiles WHERE auth_id IS NULL;
```

### 4) Test Claiming

Create a new auth user with the same email as a legacy profile, verify the email,
then confirm:

```sql
SELECT id, email, auth_id, status, is_unclaimed
FROM profiles
WHERE email = 'user@example.com';
```

## Important Considerations

- Emails are stored as `CITEXT`, so matching is case-insensitive and unique.
- Claiming only happens after email verification.
- Access to user data uses `public.get_my_profile_id()` and RLS policies.

## Post-Migration Tasks

1. Configure Supabase Auth providers
2. Test claim flow with real legacy users
3. Confirm RLS policies for all user-owned tables
