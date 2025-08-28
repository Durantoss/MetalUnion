# UUID Handling Guide for Supabase/PostgreSQL

This guide provides comprehensive examples for proper UUID handling in PostgreSQL queries and application code to avoid type casting errors.

## Common UUID Type Casting Patterns

### 1. Direct UUID Casting in Queries

```sql
-- Cast string literals to UUID
SELECT * 
FROM my_table
WHERE uuid_column = '4a1b2c3d-e5f6-7890-abcd-ef1234567890'::uuid;

-- Cast both sides for safety
SELECT * 
FROM users 
WHERE id::uuid = '550e8400-e29b-41d4-a716-446655440000'::uuid;
```

### 2. Parameterized Queries with UUID Casting

```javascript
// Node.js/Express example
const { id } = req.params; // comes in as string
await db.query('SELECT * FROM my_table WHERE uuid_column = $1::uuid', [id]);

// Alternative: cast the parameter
await db.query('SELECT * FROM my_table WHERE uuid_column = $1', [id + '::uuid']);
```

### 3. Supabase Client UUID Handling

```javascript
// Supabase JavaScript client
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId); // Supabase handles UUID casting automatically

// For custom RLS policies, ensure UUID casting
const { data, error } = await supabase
  .from('sessions')
  .select('*')
  .eq('user_id', userId); // Works with our fixed RLS policies
```

## RLS Policy UUID Casting Examples

### ✅ Correct UUID Casting in RLS Policies

```sql
-- Sessions table policies (FIXED)
CREATE POLICY "sessions_select_self" ON sessions 
FOR SELECT TO authenticated 
USING ((SELECT auth.uid()::uuid) = user_id::uuid);

-- User-specific content policies (FIXED)
CREATE POLICY "posts_owner_full" ON posts 
FOR ALL TO authenticated 
USING (user_id = auth.uid()::uuid);

-- Conversation policies (FIXED)
CREATE POLICY "Users can view own conversations" ON conversations 
FOR SELECT TO authenticated 
USING (participant1_id = auth.uid()::uuid OR participant2_id = auth.uid()::uuid);
```

### ❌ Common Mistakes to Avoid

```sql
-- DON'T: Missing UUID casting
CREATE POLICY "bad_policy" ON sessions 
FOR SELECT TO authenticated 
USING (auth.uid() = user_id); -- ERROR: character varying = uuid

-- DON'T: Inconsistent casting
CREATE POLICY "bad_policy2" ON sessions 
FOR SELECT TO authenticated 
USING (auth.uid()::uuid = user_id); -- Missing cast on user_id
```

## Application Code Examples

### Express.js Route Handlers

```javascript
// Session management with UUID casting
app.get('/api/sessions/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await db.query(
      'SELECT * FROM sessions WHERE user_id = $1::uuid',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('UUID casting error:', error);
    res.status(400).json({ error: 'Invalid UUID format' });
  }
});

// User profile updates
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  
  const result = await db.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3::uuid RETURNING *',
    [name, email, id]
  );
  
  res.json(result.rows[0]);
});
```

### Supabase Edge Functions

```javascript
// Deno/Supabase Edge Function
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const { userId } = await req.json();
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_ANON_KEY')
  );
  
  // Supabase handles UUID casting in client queries
  const { data, error } = await supabase
    .from('user_badges')
    .select('*, badges(*)')
    .eq('user_id', userId);
    
  return new Response(JSON.stringify({ data, error }));
});
```

## Schema Design Best Practices

### 1. Consistent UUID Usage

```sql
-- ✅ Good: All ID fields are UUID
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Proper Foreign Key Relationships

```sql
-- ✅ Good: UUID foreign keys with proper references
CREATE TABLE sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- Ensure user_id is properly UUID typed
ALTER TABLE sessions
    ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
```

## Troubleshooting UUID Errors

### Common Error Messages and Solutions

1. **"operator does not exist: character varying = uuid"**
   ```sql
   -- Problem: Missing UUID casting
   WHERE auth.uid() = user_id
   
   -- Solution: Add explicit casting
   WHERE auth.uid()::uuid = user_id::uuid
   ```

2. **"invalid input syntax for type uuid"**
   ```javascript
   // Problem: Invalid UUID string
   const invalidId = "not-a-uuid";
   
   // Solution: Validate UUID format first
   const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId);
   if (!isValidUUID) {
     throw new Error('Invalid UUID format');
   }
   ```

3. **"column must appear in the GROUP BY clause"**
   ```sql
   -- Problem: UUID columns in SELECT without GROUP BY
   SELECT user_id, COUNT(*) FROM sessions WHERE user_id = $1::uuid;
   
   -- Solution: Add GROUP BY or use aggregate properly
   SELECT user_id, COUNT(*) FROM sessions WHERE user_id = $1::uuid GROUP BY user_id;
   ```

## Testing UUID Queries

### Validation Queries

```sql
-- Test UUID column types
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sessions' AND column_name = 'user_id';

-- Test RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'sessions';

-- Test UUID casting in queries
SELECT 
    '550e8400-e29b-41d4-a716-446655440000'::uuid as test_uuid,
    pg_typeof('550e8400-e29b-41d4-a716-446655440000'::uuid) as uuid_type;
```

### Application Testing

```javascript
// Test UUID validation function
function isValidUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Test cases
console.log(isValidUUID('550e8400-e29b-41d4-a716-446655440000')); // true
console.log(isValidUUID('invalid-uuid')); // false
console.log(isValidUUID('550e8400-e29b-41d4-a716-44665544000')); // false (too short)
```

## Migration Checklist

- [ ] All ID columns are properly typed as UUID
- [ ] Foreign key relationships use UUID types
- [ ] RLS policies include explicit UUID casting
- [ ] Application queries use parameterized queries with UUID casting
- [ ] UUID validation is implemented in application code
- [ ] Database indexes are created on UUID columns for performance
- [ ] Test queries validate UUID type casting works correctly

## Performance Considerations

### UUID Indexing

```sql
-- Create indexes on UUID columns for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant1_id, participant2_id);
```

### Query Optimization

```sql
-- Use EXPLAIN to analyze UUID query performance
EXPLAIN ANALYZE 
SELECT * FROM sessions 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid;
```

This guide ensures consistent UUID handling across your PostgreSQL/Supabase application and prevents common type casting errors.
