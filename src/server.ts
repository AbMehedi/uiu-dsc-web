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
  getMemberByEmail,
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
    
    await addMember({ name, email, studentId, department, semester, phone, interests });
    
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
