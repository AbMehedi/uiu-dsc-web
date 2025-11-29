import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { Event, TeamMember, Partner, Question, Member } from './models/types';

const DB_PATH = path.join(__dirname, '../database.db');

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Helper function to promisify database operations
function runQuery(sql: string, params: any[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function getAllQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

function getQuery<T>(sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });
}

// Initialize database tables
export async function initializeDatabase(): Promise<void> {
  try {
    // Create Events table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        location TEXT NOT NULL,
        seats INTEGER NOT NULL,
        description TEXT NOT NULL,
        imageUrl TEXT
      )
    `);

    // Create TeamMembers table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        category TEXT NOT NULL,
        email TEXT,
        imageUrl TEXT
      )
    `);

    // Create Partners table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS partners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        benefits TEXT NOT NULL,
        logoUrl TEXT,
        websiteUrl TEXT
      )
    `);

    // Create Questions table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        subcategory TEXT NOT NULL,
        title TEXT NOT NULL,
        link TEXT NOT NULL
      )
    `);

    // Create Members table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        studentId TEXT NOT NULL,
        department TEXT NOT NULL,
        semester TEXT NOT NULL,
        phone TEXT,
        interests TEXT,
        status TEXT DEFAULT 'pending',
        createdAt TEXT NOT NULL
      )
    `);

    // Add interests column if it doesn't exist (migration)
    try {
      await runQuery(`ALTER TABLE members ADD COLUMN interests TEXT`);
    } catch (error: any) {
      // Column already exists, ignore error
      if (!error.message.includes('duplicate column name')) {
        console.error('Migration error:', error);
      }
    }

    console.log('Database tables initialized successfully');
    
    // Seed data if tables are empty
    await seedData();
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Seed initial data
async function seedData(): Promise<void> {
  try {
    // Check if data already exists
    const eventCount = await getQuery<{ count: number }>('SELECT COUNT(*) as count FROM events');
    
    if (eventCount && eventCount.count === 0) {
      console.log('Seeding initial data...');
      
      // Load seed data from JSON files
      const dataPath = path.join(__dirname, '../data');
      
      if (fs.existsSync(path.join(dataPath, 'events.json'))) {
        const eventsData = JSON.parse(fs.readFileSync(path.join(dataPath, 'events.json'), 'utf-8'));
        for (const event of eventsData) {
          await addEvent(event);
        }
      }
      
      if (fs.existsSync(path.join(dataPath, 'team.json'))) {
        const teamData = JSON.parse(fs.readFileSync(path.join(dataPath, 'team.json'), 'utf-8'));
        for (const member of teamData) {
          await addTeamMember(member);
        }
      }
      
      if (fs.existsSync(path.join(dataPath, 'partners.json'))) {
        const partnersData = JSON.parse(fs.readFileSync(path.join(dataPath, 'partners.json'), 'utf-8'));
        for (const partner of partnersData) {
          await addPartner(partner);
        }
      }
      
      if (fs.existsSync(path.join(dataPath, 'questions.json'))) {
        const questionsData = JSON.parse(fs.readFileSync(path.join(dataPath, 'questions.json'), 'utf-8'));
        for (const question of questionsData) {
          await addQuestion(question);
        }
      }
      
      console.log('Data seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

// Event CRUD operations
export async function getAllEvents(): Promise<Event[]> {
  return getAllQuery<Event>('SELECT * FROM events ORDER BY date DESC');
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const today = new Date().toISOString().split('T')[0];
  return getAllQuery<Event>(
    'SELECT * FROM events WHERE date >= ? ORDER BY date ASC',
    [today]
  );
}

export async function getEventById(id: number): Promise<Event | undefined> {
  return getQuery<Event>('SELECT * FROM events WHERE id = ?', [id]);
}

export async function addEvent(event: Omit<Event, 'id'>): Promise<void> {
  await runQuery(
    'INSERT INTO events (title, date, time, location, seats, description, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [event.title, event.date, event.time, event.location, event.seats, event.description, event.imageUrl || null]
  );
}

// Team Member CRUD operations
export async function getAllTeamMembers(): Promise<TeamMember[]> {
  return getAllQuery<TeamMember>('SELECT * FROM team_members ORDER BY id ASC');
}

export async function getTeamMembersByCategory(category: string): Promise<TeamMember[]> {
  return getAllQuery<TeamMember>(
    'SELECT * FROM team_members WHERE category = ? ORDER BY id ASC',
    [category]
  );
}

export async function addTeamMember(member: Omit<TeamMember, 'id'>): Promise<void> {
  await runQuery(
    'INSERT INTO team_members (name, role, category, email, imageUrl) VALUES (?, ?, ?, ?, ?)',
    [member.name, member.role, member.category, member.email || null, member.imageUrl || null]
  );
}

// Partner CRUD operations
export async function getAllPartners(): Promise<Partner[]> {
  return getAllQuery<Partner>('SELECT * FROM partners ORDER BY id ASC');
}

export async function getPartnerById(id: number): Promise<Partner | undefined> {
  return getQuery<Partner>('SELECT * FROM partners WHERE id = ?', [id]);
}

export async function addPartner(partner: Omit<Partner, 'id'>): Promise<void> {
  await runQuery(
    'INSERT INTO partners (name, description, benefits, logoUrl, websiteUrl) VALUES (?, ?, ?, ?, ?)',
    [partner.name, partner.description, partner.benefits, partner.logoUrl || null, partner.websiteUrl || null]
  );
}

// Question CRUD operations
export async function getAllQuestions(): Promise<Question[]> {
  return getAllQuery<Question>('SELECT * FROM questions ORDER BY category, subcategory, id ASC');
}

export async function getQuestionsByCategory(category: string): Promise<Question[]> {
  return getAllQuery<Question>(
    'SELECT * FROM questions WHERE category = ? ORDER BY subcategory, id ASC',
    [category]
  );
}

export async function addQuestion(question: Omit<Question, 'id'>): Promise<void> {
  await runQuery(
    'INSERT INTO questions (category, subcategory, title, link) VALUES (?, ?, ?, ?)',
    [question.category, question.subcategory, question.title, question.link]
  );
}

// Member CRUD operations
export async function getAllMembers(): Promise<Member[]> {
  return getAllQuery<Member>('SELECT * FROM members ORDER BY createdAt DESC');
}

export async function getMemberByEmail(email: string): Promise<Member | undefined> {
  return getQuery<Member>('SELECT * FROM members WHERE email = ?', [email]);
}

export async function addMember(member: Omit<Member, 'id' | 'createdAt' | 'status'>): Promise<void> {
  const createdAt = new Date().toISOString();
  await runQuery(
    'INSERT INTO members (name, email, studentId, department, semester, phone, interests, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [member.name, member.email, member.studentId, member.department, member.semester, member.phone || null, member.interests || null, 'pending', createdAt]
  );
}

export function getDatabase() {
  return db;
}

export function closeDatabase(): void {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
  });
}
