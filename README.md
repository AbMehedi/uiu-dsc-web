# UIU Data Science Club Website Clone

A full-stack clone of the UIU Data Science Club website built with Node.js, TypeScript, Express, SQLite, and EJS templating. This project demonstrates modern web development practices with a complete CRUD-capable backend and responsive frontend.

## 🚀 Features

- **Full-Stack Architecture**: Node.js backend with Express.js and TypeScript for type safety
- **Database Integration**: SQLite database for storing events, team members, partners, questions, and member registrations
- **Dynamic Content**: Server-side rendering with EJS templates
- **RESTful API**: JSON API endpoints for all data models
- **Responsive Design**: Mobile-friendly CSS with flexbox/grid layouts
- **Form Handling**: Member registration with validation and database persistence
- **Modular Structure**: Organized codebase with separate routes, models, and views

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## 🛠️ Installation & Setup

1. **Navigate to the project directory**:
   ```bash
   cd uiu-dsc-clone
   ```

2. **Install dependencies** (already done if following the build process):
   ```bash
   npm install
   ```

3. **Build the TypeScript code**:
   ```bash
   npm run build
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

5. **Access the application**:
   Open your browser and navigate to: `http://localhost:3000`

## 📁 Project Structure

```
uiu-dsc-clone/
├── src/                      # TypeScript source files
│   ├── models/
│   │   └── types.ts         # TypeScript interfaces for data models
│   ├── routes/              # Route handlers (future expansion)
│   ├── db.ts                # Database connection and CRUD operations
│   └── server.ts            # Express server configuration
├── public/                   # Static assets
│   ├── css/
│   │   └── styles.css       # Main stylesheet
│   ├── js/
│   │   └── main.js          # Client-side JavaScript
│   └── images/              # Image assets (placeholders)
├── views/                    # EJS templates
│   ├── partials/
│   │   ├── header.ejs       # Header component
│   │   └── footer.ejs       # Footer component
│   ├── index.ejs            # Home page
│   ├── events.ejs           # Events listing
│   ├── team.ejs             # Team members
│   ├── partners.ejs         # Partners page
│   ├── questions.ejs        # Questions bank
│   ├── join.ejs             # Membership form
│   ├── track.ejs            # Application tracking
│   └── 404.ejs              # 404 error page
├── data/                     # Seed data (JSON files)
│   ├── events.json
│   ├── team.json
│   ├── partners.json
│   └── questions.json
├── dist/                     # Compiled JavaScript (generated)
├── database.db              # SQLite database (auto-created)
├── package.json
├── tsconfig.json
└── README.md
```

## 🗄️ Database Schema

### Events Table
- `id`: INTEGER (Primary Key)
- `title`: TEXT
- `date`: TEXT
- `time`: TEXT
- `location`: TEXT
- `seats`: INTEGER
- `description`: TEXT
- `imageUrl`: TEXT

### Team Members Table
- `id`: INTEGER (Primary Key)
- `name`: TEXT
- `role`: TEXT
- `category`: TEXT (Advisor, Executive Committee, Coordinators, etc.)
- `email`: TEXT
- `imageUrl`: TEXT

### Partners Table
- `id`: INTEGER (Primary Key)
- `name`: TEXT
- `description`: TEXT
- `benefits`: TEXT
- `logoUrl`: TEXT
- `websiteUrl`: TEXT

### Questions Table
- `id`: INTEGER (Primary Key)
- `category`: TEXT (Departmental, Non-Departmental)
- `subcategory`: TEXT (Department name)
- `title`: TEXT
- `link`: TEXT

### Members Table
- `id`: INTEGER (Primary Key)
- `name`: TEXT
- `email`: TEXT
- `studentId`: TEXT
- `department`: TEXT
- `semester`: TEXT
- `phone`: TEXT
- `joinedAt`: TEXT (ISO date)

## 🌐 Available Routes

### Web Pages
- `GET /` - Home page
- `GET /events` - Events listing (upcoming and past)
- `GET /team` - Team members page
- `GET /partners` - Partners page
- `GET /questions` - Questions bank
- `GET /join` - Membership registration form
- `POST /join` - Submit membership application
- `GET /track` - Track application status

### API Endpoints
- `GET /api/events` - Get all events (JSON)
- `GET /api/events/upcoming` - Get upcoming events (JSON)
- `GET /api/team` - Get all team members (JSON)
- `GET /api/partners` - Get all partners (JSON)
- `GET /api/questions` - Get all questions (JSON)

## 🎨 Design Features

- **Color Scheme**: Blue gradient theme (data science focused)
- **Responsive**: Mobile-first design with breakpoints at 768px and 480px
- **Animations**: Smooth scroll, hover effects, and scroll-triggered animations
- **Typography**: Clean, professional fonts with proper hierarchy
- **Components**: Reusable card components, forms, and navigation

## 🔧 NPM Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start the production server
- `npm run dev` - Build and start server (development)
- `npm run clean` - Remove compiled files

## 📝 Initial Data

The application comes pre-seeded with sample data:
- **3 Events**: Including workshops and partnership announcements
- **8 Team Members**: Organized by role categories
- **2 Partners**: Including DataCamp Donates partnership
- **9 Questions**: Categorized by department and course

Data is automatically loaded from JSON files in the `/data` directory on first run.

## 🔐 Environment Variables

Currently, the application uses default settings. For production deployment, consider adding:
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `DATABASE_PATH`: Custom database location

## 🚧 Future Enhancements

- Admin dashboard for content management
- User authentication system
- Event registration with seat tracking
- Email notifications for new members
- Image upload functionality
- Search and filter capabilities
- Analytics dashboard

## 📚 Technologies Used

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: SQLite3
- **Templating**: EJS (Embedded JavaScript)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Tools**: npm, TypeScript Compiler

## 🤝 Contributing

This is an educational project. To add features:
1. Create new routes in `src/server.ts`
2. Add corresponding EJS templates in `views/`
3. Update database models in `src/db.ts` if needed
4. Rebuild with `npm run build`

## 📄 License

ISC License - Educational purposes only. This is a clone for learning full-stack development.

## 👥 Credits

Inspired by the UIU Data Science Club official website at https://uiudsc.uiu.ac.bd/

Built as an educational project to demonstrate:
- Full-stack web development
- TypeScript integration with Node.js
- Database design and CRUD operations
- Server-side rendering with EJS
- Responsive web design principles

## 📞 Contact

For questions about this project:
- Email: club@datascience.uiu.ac.bd (mock for educational purposes)

---

**Note**: This is an educational clone built for learning purposes. It is not affiliated with or endorsed by UIU Data Science Club. All sample data is fictional.
