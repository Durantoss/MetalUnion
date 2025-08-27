# MetalUnion UUID Migration Guide

This guide provides step-by-step instructions for safely converting VARCHAR UUID columns to proper UUID types in your Supabase database.

## Overview

Your database currently has some tables with VARCHAR columns that store UUID strings but aren't properly typed as UUID. This migration will:

1. Convert VARCHAR columns with UUID defaults to proper UUID type
2. Handle all dependent policies and foreign key constraints
3. Ensure data integrity throughout the process
4. Provide rollback capabilities if needed

## Files Created

- `supabase-uuid-conversion-migration.sql` - Main migration script
- `supabase-policy-analyzer.sql` - Pre-migration analysis tool
- `UUID_MIGRATION_GUIDE.md` - This guide

## Pre-Migration Steps

### 1. Backup Your Database

**CRITICAL**: Always backup your database before running any migration:

```bash
# Using Supabase CLI
supabase db dump --file backup-before-uuid-migration.sql

# Or using pg_dump if you have direct access
pg_dump -h your-host -U your-user -d your-database > backup-before-uuid-migration.sql
```

### 2. Run the Policy Analyzer

Before running the migration, analyze your current state:

```sql
-- Run this in your Supabase SQL editor
\i supabase-policy-analyzer.sql
```

This will show you:
- Which columns need conversion
- How many policies will be affected
- Foreign key constraints that will be recreated
- A summary of the migration impact

### 3. Review the Analysis Results

Look for the summary report (query #5 in the analyzer). Pay attention to:
- Tables with `MIGRATION_REQUIRED` status
- Number of policies that will be recreated
- Foreign key constraints that will be affected

## Migration Process

### Step 1: Test in Development First

**Never run this migration directly in production**. Test it in a development environment first:

1. Create a copy of your production database
2. Run the migration on the copy
3. Test your application thoroughly
4. Verify all functionality works correctly

### Step 2: Schedule Maintenance Window

This migration will temporarily drop policies and foreign key constraints. Schedule a maintenance window when:
- User activity is minimal
- You can afford brief downtime
- You have time to rollback if needed

### Step 3: Run the Migration

```sql
-- Run this in your Supabase SQL editor during your maintenance window
\i supabase-uuid-conversion-migration.sql
```

The script will:
1. Check which columns actually need conversion
2. Drop dependent policies and foreign keys
3. Convert column types safely
4. Recreate all constraints and policies
5. Validate the results

### Step 4: Monitor the Migration

Watch for these log messages:
- `Starting UUID conversion migration...`
- `Converting [table].[column] to UUID...` or `[table].[column] already has correct UUID type`
- `Foreign key constraints recreated successfully`
- `RLS policies recreated successfully`
- `SUCCESS: All UUID columns have been properly converted!`

## Post-Migration Verification

### 1. Check Migration Results

The script includes validation that will report:
- Number of UUID columns found
- Number of VARCHAR columns with UUID defaults remaining (should be 0)

### 2. Test Your Application

After migration, thoroughly test:
- User authentication and sessions
- All CRUD operations
- Policy enforcement (users can only access their own data)
- Foreign key relationships work correctly

### 3. Verify Data Integrity

Run these queries to verify everything is working:

```sql
-- Check that UUIDs are properly formatted
SELECT id, email FROM users LIMIT 5;

-- Verify foreign key relationships work
SELECT ub.id, u.stagename, b.name 
FROM user_badges ub
JOIN users u ON ub.user_id = u.id
JOIN badges b ON ub.badge_id = b.id
LIMIT 5;

-- Test policy enforcement (should only return current user's data)
SELECT id, email FROM users; -- Should be filtered by RLS
```

## Rollback Procedure

If something goes wrong, you can rollback:

### Option 1: Restore from Backup

```bash
# Stop your application first
# Then restore the backup
psql -h your-host -U your-user -d your-database < backup-before-uuid-migration.sql
```

### Option 2: Manual Rollback (if backup restore isn't possible)

The migration script is designed to be safe, but if you need to manually rollback specific changes:

1. The script uses transactions, so partial failures should auto-rollback
2. If you need to revert specific tables, you can modify the script to target only those tables
3. Contact your database administrator for assistance with complex rollback scenarios

## Troubleshooting

### Common Issues

1. **"Column cannot be cast automatically"**
   - This means some data isn't valid UUID format
   - Check for NULL values or malformed UUIDs in your data

2. **"Policy already exists"**
   - The script includes `IF EXISTS` clauses to handle this
   - If you see this error, some policies weren't properly dropped

3. **"Foreign key constraint violation"**
   - This indicates orphaned records in child tables
   - The script includes cleanup for sessions table, but other tables might need similar cleanup

### Getting Help

If you encounter issues:

1. Check the PostgreSQL logs for detailed error messages
2. Verify your backup is complete and accessible
3. Consider running the migration on a smaller subset of tables first
4. Reach out to Supabase support if you need assistance

## Performance Considerations

- The migration locks tables during column type conversion
- Larger tables will take longer to convert
- Plan for 1-5 minutes of downtime depending on data size
- The script processes tables in dependency order to minimize lock time

## Security Notes

- RLS policies are temporarily dropped during migration
- This creates a brief window where data access isn't restricted
- Ensure no users are actively using the system during migration
- All policies are recreated with the same security rules

## Success Criteria

The migration is successful when:
- ✅ All target columns are converted to UUID type
- ✅ All foreign key constraints are recreated
- ✅ All RLS policies are restored
- ✅ Application functionality works normally
- ✅ No data loss occurred
- ✅ Performance is maintained or improved

## Next Steps After Migration

1. Update your application code if it was doing any string-based UUID operations
2. Consider updating your database documentation to reflect the new schema
3. Monitor application performance for any improvements (UUID operations are generally faster)
4. Update your backup and recovery procedures to account for the new schema

---

**Remember**: This migration is designed to be safe and reversible, but always test thoroughly in a development environment first!
