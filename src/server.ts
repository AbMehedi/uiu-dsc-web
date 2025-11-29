import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import path from 'path';
import {
  initializeDatabase,
  getAllEvents,
  getUpcomingEvents,
  getAllTeamMembers,
  getAllPartners,
  getAllQuestions,
  addMember,
  getMemberByEmail,
  getDatabase,
  closeDatabase
} from './db';

// Extend Express Session
declare module 'express-session' {
  interface SessionData {
    isAdminLoggedIn?: boolean;
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// Admin credentials (in production, use environment variables)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Session middleware
app.use(session({
  secret: 'uiu-dsc-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 3600000, // 1 hour
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Routes

// Home page
app.get('/', async (req: Request, res: Response) => {
  try {
    const upcomingEvents = await getUpcomingEvents();
    const partners = await getAllPartners();
    
    res.render('index', {
      title: 'Home',
      upcomingEvents,
      partners
    });
  } catch (error) {
    console.error('Error loading home page:', error);
    res.status(500).send('Error loading page');
  }
});

// Events page
app.get('/events', async (req: Request, res: Response) => {
  try {
    const events = await getAllEvents();
    const upcomingEvents = await getUpcomingEvents();
    const pastEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      const today = new Date();
      return eventDate < today;
    });
    
    res.render('events', {
      title: 'Events',
      upcomingEvents,
      pastEvents
    });
  } catch (error) {
    console.error('Error loading events page:', error);
    res.status(500).send('Error loading page');
  }
});

// Team page
app.get('/team', async (req: Request, res: Response) => {
  try {
    const team = await getAllTeamMembers();
    
    res.render('team', {
      title: 'Our Team',
      team
    });
  } catch (error) {
    console.error('Error loading team page:', error);
    res.status(500).send('Error loading page');
  }
});

// Partners page
app.get('/partners', async (req: Request, res: Response) => {
  try {
    const partners = await getAllPartners();
    
    res.render('partners', {
      title: 'Partners',
      partners
    });
  } catch (error) {
    console.error('Error loading partners page:', error);
    res.status(500).send('Error loading page');
  }
});

// Questions Bank page
app.get('/questions', async (req: Request, res: Response) => {
  try {
    const questions = await getAllQuestions();
    
    res.render('questions', {
      title: 'Questions Bank',
      questions
    });
  } catch (error) {
    console.error('Error loading questions page:', error);
    res.status(500).send('Error loading page');
  }
});

// Join page (GET)
app.get('/join', (req: Request, res: Response) => {
  res.render('join', {
    title: 'Join Our Club',
    message: null
  });
});

// Join page (POST)
app.post('/join', async (req: Request, res: Response) => {
  try {
    const { name, email, studentId, department, semester, phone, interests } = req.body;
    
    // Basic validation
    if (!name || !email || !studentId || !department || !semester) {
      return res.render('join', {
        title: 'Join Our Club',
        message: { type: 'error', text: 'Please fill in all required fields' }
      });
    }
    
    // Check if email already exists
    const existingMember = await getMemberByEmail(email);
    if (existingMember) {
      return res.render('join', {
        title: 'Join Our Club',
        message: { type: 'error', text: 'An application with this email already exists. Check your status on the Track page.' }
      });
    }
    
    // Convert empty strings to undefined for optional fields
    await addMember({ 
      name, 
      email, 
      studentId, 
      department, 
      semester, 
      phone: phone?.trim() || undefined, 
      interests: interests?.trim() || undefined 
    });
    
    res.render('join', {
      title: 'Join Our Club',
      message: { type: 'success', text: 'Application submitted successfully! You can track your application status using your email.' }
    });
  } catch (error) {
    console.error('Error adding member:', error);
    res.render('join', {
      title: 'Join Our Club',
      message: { type: 'error', text: 'An error occurred. Please try again.' }
    });
  }
});

// Admin Login page (GET)
app.get('/admin/login', (req: Request, res: Response) => {
  if (req.session.isAdminLoggedIn) {
    return res.redirect('/admin');
  }
  res.render('admin-login', {
    title: 'Admin Login',
    error: null
  });
});

// Admin Login (POST)
app.post('/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  console.log('Login attempt:', { username, password: password ? '***' : 'empty' });
  
  // Trim whitespace from inputs
  const trimmedUsername = username?.trim();
  const trimmedPassword = password?.trim();
  
  console.log('After trim:', { username: trimmedUsername, password: trimmedPassword ? '***' : 'empty' });
  console.log('Expected:', { username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
  console.log('Match:', trimmedUsername === ADMIN_USERNAME && trimmedPassword === ADMIN_PASSWORD);
  
  if (trimmedUsername === ADMIN_USERNAME && trimmedPassword === ADMIN_PASSWORD) {
    req.session.isAdminLoggedIn = true;
    console.log('Login successful!');
    console.log('Session after setting isAdminLoggedIn:', req.session);
    // Save session before redirect
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.render('admin-login', {
          title: 'Admin Login',
          error: 'Session error. Please try again.'
        });
      }
      console.log('Session saved successfully');
      console.log('Session after save:', req.session);
      res.redirect('/admin');
    });
    return;
  }
  
  console.log('Login failed');
  res.render('admin-login', {
    title: 'Admin Login',
    error: 'Invalid username or password'
  });
});

// Admin Logout
app.get('/admin/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/admin/login');
  });
});

// Middleware to check admin authentication
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.isAdminLoggedIn) {
    return res.redirect('/admin/login');
  }
  next();
};

// ========== EVENT CRUD ROUTES ==========

// Add new event (GET - show form)
app.get('/admin/events/add', requireAuth, (req: Request, res: Response) => {
  res.render('admin-event-form', {
    title: 'Add Event',
    event: null,
    action: '/admin/events/add'
  });
});

// Add new event (POST)
app.post('/admin/events/add', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, date, time, location, seats, description } = req.body;
    const db = getDatabase();
    
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO events (title, date, time, location, seats, description, imageUrl) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, date, time, location, seats, description, '/images/events/default.jpg'],
        (err: Error) => err ? reject(err) : resolve(null)
      );
    });
    
    res.redirect('/admin?success=event-added');
  } catch (error) {
    console.error('Error adding event:', error);
    res.redirect('/admin?error=event-add-failed');
  }
});

// Edit event (GET - show form)
app.get('/admin/events/edit/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const event = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM events WHERE id = ?', [req.params.id], (err: Error, row: any) => {
        err ? reject(err) : resolve(row);
      });
    });
    
    if (!event) {
      return res.redirect('/admin?error=event-not-found');
    }
    
    res.render('admin-event-form', {
      title: 'Edit Event',
      event,
      action: `/admin/events/edit/${event.id}`
    });
  } catch (error) {
    console.error('Error loading event:', error);
    res.redirect('/admin?error=event-load-failed');
  }
});

// Edit event (POST)
app.post('/admin/events/edit/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, date, time, location, seats, description } = req.body;
    const db = getDatabase();
    
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE events 
         SET title = ?, date = ?, time = ?, location = ?, seats = ?, description = ?
         WHERE id = ?`,
        [title, date, time, location, seats, description, req.params.id],
        (err: Error) => err ? reject(err) : resolve(null)
      );
    });
    
    res.redirect('/admin?success=event-updated');
  } catch (error) {
    console.error('Error updating event:', error);
    res.redirect('/admin?error=event-update-failed');
  }
});

// Delete event
app.post('/admin/events/delete/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM events WHERE id = ?', [req.params.id], (err: Error) => {
        err ? reject(err) : resolve(null);
      });
    });
    
    res.redirect('/admin?success=event-deleted');
  } catch (error) {
    console.error('Error deleting event:', error);
    res.redirect('/admin?error=event-delete-failed');
  }
});

// ========== TEAM MEMBER CRUD ROUTES ==========

// Add team member (GET)
app.get('/admin/team/add', requireAuth, (req: Request, res: Response) => {
  res.render('admin-team-form', {
    title: 'Add Team Member',
    member: null,
    action: '/admin/team/add'
  });
});

// Add team member (POST)
app.post('/admin/team/add', requireAuth, async (req: Request, res: Response) => {
  try {
    const { name, role, category, email } = req.body;
    const db = getDatabase();
    
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO team_members (name, role, category, email, imageUrl) 
         VALUES (?, ?, ?, ?, ?)`,
        [name, role, category, email, '/images/team/default.jpg'],
        (err: Error) => err ? reject(err) : resolve(null)
      );
    });
    
    res.redirect('/admin?success=team-added');
  } catch (error) {
    console.error('Error adding team member:', error);
    res.redirect('/admin?error=team-add-failed');
  }
});

// Edit team member (GET)
app.get('/admin/team/edit/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const member = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM team_members WHERE id = ?', [req.params.id], (err: Error, row: any) => {
        err ? reject(err) : resolve(row);
      });
    });
    
    if (!member) {
      return res.redirect('/admin?error=team-not-found');
    }
    
    res.render('admin-team-form', {
      title: 'Edit Team Member',
      member,
      action: `/admin/team/edit/${member.id}`
    });
  } catch (error) {
    console.error('Error loading team member:', error);
    res.redirect('/admin?error=team-load-failed');
  }
});

// Edit team member (POST)
app.post('/admin/team/edit/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { name, role, category, email } = req.body;
    const db = getDatabase();
    
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE team_members 
         SET name = ?, role = ?, category = ?, email = ?
         WHERE id = ?`,
        [name, role, category, email, req.params.id],
        (err: Error) => err ? reject(err) : resolve(null)
      );
    });
    
    res.redirect('/admin?success=team-updated');
  } catch (error) {
    console.error('Error updating team member:', error);
    res.redirect('/admin?error=team-update-failed');
  }
});

// Delete team member
app.post('/admin/team/delete/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM team_members WHERE id = ?', [req.params.id], (err: Error) => {
        err ? reject(err) : resolve(null);
      });
    });
    
    res.redirect('/admin?success=team-deleted');
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.redirect('/admin?error=team-delete-failed');
  }
});

// ========== PARTNER CRUD ROUTES ==========

// Add partner (GET)
app.get('/admin/partners/add', requireAuth, (req: Request, res: Response) => {
  res.render('admin-partner-form', {
    title: 'Add Partner',
    partner: null,
    action: '/admin/partners/add'
  });
});

// Add partner (POST)
app.post('/admin/partners/add', requireAuth, async (req: Request, res: Response) => {
  try {
    const { name, description, benefits, websiteUrl } = req.body;
    const db = getDatabase();
    
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO partners (name, description, benefits, websiteUrl, logoUrl) 
         VALUES (?, ?, ?, ?, ?)`,
        [name, description, benefits, websiteUrl, '/images/partners/default.png'],
        (err: Error) => err ? reject(err) : resolve(null)
      );
    });
    
    res.redirect('/admin?success=partner-added');
  } catch (error) {
    console.error('Error adding partner:', error);
    res.redirect('/admin?error=partner-add-failed');
  }
});

// Edit partner (GET)
app.get('/admin/partners/edit/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const partner = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM partners WHERE id = ?', [req.params.id], (err: Error, row: any) => {
        err ? reject(err) : resolve(row);
      });
    });
    
    if (!partner) {
      return res.redirect('/admin?error=partner-not-found');
    }
    
    res.render('admin-partner-form', {
      title: 'Edit Partner',
      partner,
      action: `/admin/partners/edit/${partner.id}`
    });
  } catch (error) {
    console.error('Error loading partner:', error);
    res.redirect('/admin?error=partner-load-failed');
  }
});

// Edit partner (POST)
app.post('/admin/partners/edit/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { name, description, benefits, websiteUrl } = req.body;
    const db = getDatabase();
    
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE partners 
         SET name = ?, description = ?, benefits = ?, websiteUrl = ?
         WHERE id = ?`,
        [name, description, benefits, websiteUrl, req.params.id],
        (err: Error) => err ? reject(err) : resolve(null)
      );
    });
    
    res.redirect('/admin?success=partner-updated');
  } catch (error) {
    console.error('Error updating partner:', error);
    res.redirect('/admin?error=partner-update-failed');
  }
});

// Delete partner
app.post('/admin/partners/delete/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM partners WHERE id = ?', [req.params.id], (err: Error) => {
        err ? reject(err) : resolve(null);
      });
    });
    
    res.redirect('/admin?success=partner-deleted');
  } catch (error) {
    console.error('Error deleting partner:', error);
    res.redirect('/admin?error=partner-delete-failed');
  }
});

// ========== QUESTION CRUD ROUTES ==========

// Add question (GET)
app.get('/admin/questions/add', requireAuth, (req: Request, res: Response) => {
  res.render('admin-question-form', {
    title: 'Add Question',
    question: null,
    action: '/admin/questions/add'
  });
});

// Add question (POST)
app.post('/admin/questions/add', requireAuth, async (req: Request, res: Response) => {
  try {
    const { category, subcategory, title, link } = req.body;
    const db = getDatabase();
    
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO questions (category, subcategory, title, link) 
         VALUES (?, ?, ?, ?)`,
        [category, subcategory, title, link],
        (err: Error) => err ? reject(err) : resolve(null)
      );
    });
    
    res.redirect('/admin?success=question-added');
  } catch (error) {
    console.error('Error adding question:', error);
    res.redirect('/admin?error=question-add-failed');
  }
});

// Edit question (GET)
app.get('/admin/questions/edit/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const question = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM questions WHERE id = ?', [req.params.id], (err: Error, row: any) => {
        err ? reject(err) : resolve(row);
      });
    });
    
    if (!question) {
      return res.redirect('/admin?error=question-not-found');
    }
    
    res.render('admin-question-form', {
      title: 'Edit Question',
      question,
      action: `/admin/questions/edit/${question.id}`
    });
  } catch (error) {
    console.error('Error loading question:', error);
    res.redirect('/admin?error=question-load-failed');
  }
});

// Edit question (POST)
app.post('/admin/questions/edit/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { category, subcategory, title, link } = req.body;
    const db = getDatabase();
    
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE questions 
         SET category = ?, subcategory = ?, title = ?, link = ?
         WHERE id = ?`,
        [category, subcategory, title, link, req.params.id],
        (err: Error) => err ? reject(err) : resolve(null)
      );
    });
    
    res.redirect('/admin?success=question-updated');
  } catch (error) {
    console.error('Error updating question:', error);
    res.redirect('/admin?error=question-update-failed');
  }
});

// Delete question
app.post('/admin/questions/delete/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM questions WHERE id = ?', [req.params.id], (err: Error) => {
        err ? reject(err) : resolve(null);
      });
    });
    
    res.redirect('/admin?success=question-deleted');
  } catch (error) {
    console.error('Error deleting question:', error);
    res.redirect('/admin?error=question-delete-failed');
  }
});

// ========== MEMBER STATUS UPDATE ==========

app.post('/admin/members/update/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const db = getDatabase();
    
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE members SET status = ? WHERE id = ?',
        [status, req.params.id],
        (err: Error) => err ? reject(err) : resolve(null)
      );
    });
    
    res.redirect('/admin?success=status-updated');
  } catch (error) {
    console.error('Error updating member status:', error);
    res.redirect('/admin?error=status-update-failed');
  }
});

// Admin Panel page (Protected)
app.get('/admin', async (req: Request, res: Response) => {
  console.log('Admin page accessed, session:', req.session);
  console.log('Is admin logged in?', req.session.isAdminLoggedIn);
  
  // Check if admin is logged in
  if (!req.session.isAdminLoggedIn) {
    console.log('Not logged in, redirecting to login');
    return res.redirect('/admin/login');
  }
  
  console.log('Admin is logged in, loading data...');
  try {
    const events = await getAllEvents();
    const team = await getAllTeamMembers();
    const partners = await getAllPartners();
    const questions = await getAllQuestions();
    
    // Get all members from database (handle both old and new schema)
    const db = getDatabase();
    const members = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM members', [], (err: Error, rows: any[]) => {
        if (err) reject(err);
        else {
          // Sort by createdAt if it exists, otherwise by id
          const sortedRows = rows.sort((a: any, b: any) => {
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return (b.id || 0) - (a.id || 0);
          });
          resolve(sortedRows);
        }
      });
    });
    
    res.render('admin', {
      title: 'Admin Panel',
      events,
      team,
      partners,
      questions,
      members
    });
  } catch (error) {
    console.error('Error loading admin panel:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).send(`Error loading admin panel: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

// Track Application page (GET)
app.get('/track', (req: Request, res: Response) => {
  res.render('track', {
    title: 'Track Application',
    email: '',
    member: null,
    notFound: false
  });
});

// Track Application page (POST)
app.post('/track', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.render('track', {
        title: 'Track Application',
        email: '',
        member: null,
        notFound: false
      });
    }
    
    const member = await getMemberByEmail(email);
    
    if (member) {
      res.render('track', {
        title: 'Track Application',
        email,
        member,
        notFound: false
      });
    } else {
      res.render('track', {
        title: 'Track Application',
        email,
        member: null,
        notFound: true
      });
    }
  } catch (error) {
    console.error('Error tracking application:', error);
    res.render('track', {
      title: 'Track Application',
      email: req.body.email || '',
      member: null,
      notFound: true
    });
  }
});

// API endpoints

// Get all events
app.get('/api/events', async (req: Request, res: Response) => {
  try {
    const events = await getAllEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching events' });
  }
});

// Get upcoming events
app.get('/api/events/upcoming', async (req: Request, res: Response) => {
  try {
    const events = await getUpcomingEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching events' });
  }
});

// Get all team members
app.get('/api/team', async (req: Request, res: Response) => {
  try {
    const teamMembers = await getAllTeamMembers();
    res.json(teamMembers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching team members' });
  }
});

// Get all partners
app.get('/api/partners', async (req: Request, res: Response) => {
  try {
    const partners = await getAllPartners();
    res.json(partners);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching partners' });
  }
});

// Get all questions
app.get('/api/questions', async (req: Request, res: Response) => {
  try {
    const questions = await getAllQuestions();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching questions' });
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).render('404', {
    title: 'Page Not Found'
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    
    // Only start server if not in serverless environment
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...');
  closeDatabase();
  process.exit(0);
});

// Initialize database on module load
startServer();

// Export for Vercel serverless functions
export default app;
