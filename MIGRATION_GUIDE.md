# Migration Guide: SQLite to PostgreSQL

## 1. Create Supabase Account
- Go to https://supabase.com
- Create a new project (free tier)
- Get your connection string

## 2. Install Dependencies
```bash
npm install pg
npm install --save-dev @types/pg
```

## 3. Update Environment Variables
Create `.env`:
```
DATABASE_URL=postgresql://user:pass@host:5432/database
```

## 4. Replace db.ts

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/uiu_dsc',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Replace sqlite3 queries with PostgreSQL
export async function getAllEvents(): Promise<Event[]> {
  const result = await pool.query('SELECT * FROM events ORDER BY date DESC');
  return result.rows;
}
```

## 5. Update Schema
Replace SQLite schema with PostgreSQL:
```sql
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,  -- Changed from INTEGER AUTOINCREMENT
  title TEXT NOT NULL,
  -- ... rest of schema
);
```

## 6. Deploy
```bash
git add .
git commit -m "Switch to PostgreSQL"
git push
```

Data will now persist across deployments!
