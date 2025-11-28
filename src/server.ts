import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import {
  initializeDatabase,
  getAllEvents,
  getUpcomingEvents,
  getAllTeamMembers,
  getAllPartners,
  getAllQuestions,
  addMember,
  closeDatabase
} from './db';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

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
    const teamMembers = await getAllTeamMembers();
    
    // Group by category
    const groupedTeam: { [key: string]: any[] } = {};
    teamMembers.forEach(member => {
      if (!groupedTeam[member.category]) {
        groupedTeam[member.category] = [];
      }
      groupedTeam[member.category].push(member);
    });
    
    res.render('team', {
      title: 'Our Team',
      groupedTeam
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
    
    // Group by category and subcategory
    const groupedQuestions: { [key: string]: { [key: string]: any[] } } = {};
    questions.forEach(question => {
      if (!groupedQuestions[question.category]) {
        groupedQuestions[question.category] = {};
      }
      if (!groupedQuestions[question.category][question.subcategory]) {
        groupedQuestions[question.category][question.subcategory] = [];
      }
      groupedQuestions[question.category][question.subcategory].push(question);
    });
    
    res.render('questions', {
      title: 'Questions Bank',
      groupedQuestions
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
    success: false,
    error: null
  });
});

// Join page (POST)
app.post('/join', async (req: Request, res: Response) => {
  try {
    const { name, email, studentId, department, semester, phone } = req.body;
    
    // Basic validation
    if (!name || !email || !studentId || !department || !semester) {
      return res.render('join', {
        title: 'Join Our Club',
        success: false,
        error: 'Please fill in all required fields'
      });
    }
    
    await addMember({ name, email, studentId, department, semester, phone });
    
    res.render('join', {
      title: 'Join Our Club',
      success: true,
      error: null
    });
  } catch (error) {
    console.error('Error adding member:', error);
    res.render('join', {
      title: 'Join Our Club',
      success: false,
      error: 'An error occurred. Please try again.'
    });
  }
});

// Track Application page (placeholder)
app.get('/track', (req: Request, res: Response) => {
  res.render('track', {
    title: 'Track Application'
  });
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
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
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

startServer();
