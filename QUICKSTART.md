# Quick Start Guide - UIU DSC Clone


Your UIU Data Science Club website clone is now running at:
**http://localhost:3000**

## 📊 What's Working

### Pages Available:
- ✅ **Home** (`/`) - Landing page with club info and upcoming events
- ✅ **Events** (`/events`) - Full event listing (upcoming + past)
- ✅ **Team** (`/team`) - Team members organized by category
- ✅ **Partners** (`/partners`) - Partnership information
- ✅ **Questions Bank** (`/questions`) - Study materials by department
- ✅ **Join** (`/join`) - Membership registration form
- ✅ **Track** (`/track`) - Application tracking (placeholder)

### API Endpoints Available:
- ✅ `GET /api/events` - All events as JSON
- ✅ `GET /api/events/upcoming` - Upcoming events only
- ✅ `GET /api/team` - All team members
- ✅ `GET /api/partners` - All partners
- ✅ `GET /api/questions` - All questions

### Database:
- ✅ SQLite database created at `database.db`
- ✅ All tables initialized (events, team_members, partners, questions, members)
- ✅ Sample data seeded from JSON files

## 🧪 Testing the Application

### 1. View the Homepage
Open your browser and go to: http://localhost:3000

### 2. Test the Registration Form
1. Navigate to http://localhost:3000/join
2. Fill out the form with sample data
3. Submit and verify success message
4. Check database to confirm data was saved

### 3. Test API Endpoints
Try these URLs in your browser or use a tool like Postman:
- http://localhost:3000/api/events
- http://localhost:3000/api/team
- http://localhost:3000/api/partners
- http://localhost:3000/api/questions

### 4. Test Responsive Design
- Open browser DevTools (F12)
- Toggle device toolbar (Ctrl+Shift+M)
- Test on different screen sizes (mobile, tablet, desktop)

## 🛠️ Development Commands

```bash
# Stop the server
Ctrl+C in the terminal

# Rebuild after code changes
npm run build

# Start server again
npm start

# Clean compiled files
npm run clean
```

## 📁 Key Files to Explore

### Backend:
- `src/server.ts` - Main Express server and routes
- `src/db.ts` - Database operations and CRUD functions
- `src/models/types.ts` - TypeScript interfaces

### Frontend:
- `views/*.ejs` - All page templates
- `public/css/styles.css` - Main stylesheet
- `public/js/main.js` - Client-side JavaScript

### Data:
- `data/*.json` - Seed data files
- `database.db` - SQLite database (created after first run)

## 🎯 Next Steps - Try These!

### 1. Add a New Event
Edit `data/events.json` and add a new event:
```json
{
  "title": "Your Event Name",
  "date": "2025-12-25",
  "time": "15:00",
  "location": "Room 101",
  "seats": 30,
  "description": "Your event description"
}
```
Delete `database.db`, rebuild, and restart to see the new event.

### 2. Customize the Styling
Edit `public/css/styles.css`:
- Change color scheme (modify CSS variables in `:root`)
- Adjust layouts (modify grid/flexbox properties)
- Add new animations

### 3. Add a New Route
In `src/server.ts`, add:
```typescript
app.get('/about', (req, res) => {
  res.render('about', { title: 'About Us' });
});
```
Create `views/about.ejs` and rebuild.

### 4. Query the Database Directly
Use SQLite browser or command line:
```bash
# View all members who joined
sqlite3 database.db "SELECT * FROM members;"

# Count events
sqlite3 database.db "SELECT COUNT(*) FROM events;"
```

## 🐛 Troubleshooting

### Server won't start?
- Make sure port 3000 is not in use
- Run `npm run build` to recompile TypeScript
- Check for error messages in terminal

### Database issues?
- Delete `database.db` and restart server to recreate
- Check that `data/*.json` files are valid JSON

### Styles not loading?
- Verify `public/css/styles.css` exists
- Check browser console for 404 errors
- Clear browser cache (Ctrl+F5)

## 📱 Testing Checklist

- [ ] Homepage loads with all sections
- [ ] Navigation works on all pages
- [ ] Events page shows upcoming and past events
- [ ] Team page displays members by category
- [ ] Partners page shows partnership details
- [ ] Questions page organizes by category/subcategory
- [ ] Join form accepts input and saves to database
- [ ] Mobile menu works on small screens
- [ ] All API endpoints return JSON data
- [ ] Form validation works (try submitting empty form)

