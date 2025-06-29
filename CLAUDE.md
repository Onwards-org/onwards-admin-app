# Claude Development Notes - Onwards Admin Platform

## Project Overview
This is a comprehensive admin platform for Onwards, a volunteer-led organization supporting individuals with autism, ADHD, and anxiety. The platform handles member registration, attendance tracking, and reporting for funding purposes.

## Technology Stack
- **Frontend**: Vue.js 3, TypeScript, Tailwind CSS v3 (stable), Pinia (state management), Vue Router
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with pg driver, SSL support
- **Authentication**: JWT with bcrypt password hashing (12 salt rounds)
- **Validation**: Valibot for form validation
- **Address Autocomplete**: Google Places API with @googlemaps/js-api-loader
- **PDF Generation**: PDFKit
- **Charts**: Chart.js
- **Development**: Vite, tsx for development server, concurrently for parallel processes

## Project Structure
```
src/
├── client/          # Vue.js frontend application
│   ├── components/  # Reusable Vue components
│   ├── pages/       # Route-based page components
│   ├── stores/      # Pinia state management
│   ├── router/      # Vue Router configuration
│   └── assets/      # Static assets and styles
├── server/          # Express.js backend application
│   ├── models/      # Database models and schema
│   ├── routes/      # API route handlers
│   ├── middleware/  # Authentication and other middleware
│   └── utils/       # Utility functions
└── shared/          # Shared TypeScript types and constants
```

## Development Commands

### Basic Commands
- `npm run dev` - Start both client and server in development mode (interactive)
- `npm run dev:client` - Start only the Vue.js development server
- `npm run dev:server` - Start only the Express.js development server
- `npm run build` - Build both client and server for production
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint code linting

### Server Management Commands (CRITICAL)
- `npm run dev:detached` - Start servers in background (detached from terminal)
- `npm run dev:status` - Check server status from logs
- `npm run dev:logs` - Watch live server logs
- `npm run dev:stop` - Stop all development servers
- `npm run dev:restart` - Stop and restart servers
- `npm run dev:clean` - Force kill all processes and clean ports
- `npm run dev:health` - Check backend health endpoint
- `npm run dev:ports` - Check which processes are using ports 3001/8080

## Development Server Management (CRITICAL)

### Quick Start (Recommended)
**For Claude/automated environments, ALWAYS use:**

```bash
npm run dev:detached
```

This automatically:
- Starts both servers in background using `nohup`
- Returns control to terminal immediately (no blocking)
- Redirects output to `dev.log` for monitoring
- Shows the background process PID
- Provides next steps for checking status

**Why this is essential:**
- Regular `npm run dev` blocks the terminal and times out in automated environments
- The script properly detaches from the terminal session
- Returns control immediately with clear feedback
- Prevents process hanging and timeout issues
- This starts BOTH frontend (port 8080) and backend (port 3001) servers

### Checking Server Status
```bash
# Primary status check - shows recent server logs
npm run dev:status     # View last 15 lines of dev.log

# Health verification - tests actual connectivity
npm run dev:health     # Tests both frontend/backend endpoints

# Port usage check - shows what's using development ports
npm run dev:ports      # Shows processes on ports 3001,8080,8081,8082
```

### Stopping the Development Server
```bash
# Graceful stop - stops npm and concurrently processes
npm run dev:stop       # Recommended for normal shutdown

# Force cleanup - kills all project processes and frees ports
npm run dev:clean      # Use when dev:stop doesn't work
```

### Restarting After Changes
```bash
# Complete restart cycle
npm run dev:restart    # Stops and starts automatically

# Manual steps (if needed)
npm run dev:stop
npm run dev:detached
```

### Process Management Details

**The improved scripts handle:**
1. **Proper background execution** - No terminal blocking
2. **Comprehensive cleanup** - Kills all project-related processes
3. **Port management** - Frees stuck ports (3001, 8080, 8081, 8082)
4. **Error suppression** - Uses `|| true` to prevent script failures
5. **Timeout handling** - Prevents hanging curl requests
6. **Clear feedback** - Shows status and next steps

**What gets cleaned up:**
- Main npm processes running dev scripts
- Background tsx processes (backend)
- Background vite processes (frontend) 
- Any processes using development ports
- Concurrent/parallel process managers

### Expected Output

**Starting servers:**
```bash
$ npm run dev:detached
Servers starting in background (PID: 8701)
Check status: npm run dev:status
```

**Checking status (when ready):**
```bash
$ npm run dev:status
=== Development Server Status ===
[0] Server running on port 3001
[0] Health check: http://localhost:3001/api/health  
[1] VITE v5.4.19  ready in 4293 ms
[1] ➜  Local:   http://localhost:8080/
[1] ➜  Network: http://10.255.255.254:8080/
```

**Health check:**
```bash
$ npm run dev:health
✓ Backend OK
✓ Frontend OK
```

**Stopping servers:**
```bash
$ npm run dev:stop
Stopping development servers...
Done
```

### Common Issues and Solutions
1. **Port Already in Use (EADDRINUSE)**
   ```bash
   npm run dev:clean     # Recommended: Clean all processes and ports
   # Or manually:
   lsof -ti:3001 | xargs kill -9
   lsof -ti:8080 | xargs kill -9
   ```

2. **Frontend Not Starting** 
   - Check if PostCSS config exists and is named correctly
   - Ensure `postcss.config.cjs` (not .js) for ES modules

3. **Backend Database Connection Issues**
   - Check DATABASE_URL in .env
   - Verify database is accessible with SSL if needed

4. **Frontend Shows "Can't Reach Site"**
   - Frontend likely not running - check dev.log for Vite errors
   - Ensure both [0] (backend) and [1] (frontend) processes are running

5. **bcrypt Native Binding Issues in WSL**
   - Error: `invalid ELF header` or `ERR_DLOPEN_FAILED` with bcrypt
   - Solution: Replace bcrypt with bcryptjs (pure JavaScript implementation)
   ```bash
   npm uninstall bcrypt @types/bcrypt
   npm install bcryptjs @types/bcryptjs
   ```
   - Update imports in `src/server/models/User.ts`:
   ```typescript
   import bcrypt from 'bcryptjs'  // Changed from 'bcrypt'
   ```
   - bcryptjs has the same API as bcrypt but works across all platforms

**Common Issues:**
1. **Tailwind CSS version issue**: Use stable Tailwind v3, not v4 alpha:
   ```bash
   npm uninstall tailwindcss @tailwindcss/postcss
   npm install -D tailwindcss@^3.4.0
   ```
   postcss.config.js should be:
   ```js
   export default {
     plugins: {
       tailwindcss: {},
       autoprefixer: {}
     }
   }
   ```
   tailwind.config.js should use module.exports for v3 and correct paths for Vite root:
   ```js
   module.exports = {
     content: [
       './**/*.{vue,js,ts,jsx,tsx}',  // Relative to Vite root (src/client)
       './index.html'
     ],
     theme: { extend: {} },
     plugins: []
   }
   ```
2. **Tailwind CSS import error**: Use `@tailwind base;` instead of `@import 'tailwindcss/base';` in CSS files
3. **Port conflicts**: Check .env PORT setting and vite.config.ts port configuration
4. **Database permissions**: Ensure user has CREATE permissions or tables already exist
5. **Environment variables**: Make sure .env file is loaded with `import 'dotenv/config'` in server index
6. **Vite path aliases**: When using `root: 'src/client'`, ensure aliases resolve correctly with proper `__dirname` setup
7. **Database SSL**: For remote databases, set `ssl: { rejectUnauthorized: false }` in database config

## Database Schema

### Users Table
- Admin authentication system
- Password hashing with bcrypt (12 salt rounds)
- JWT token-based authentication

### Members Table
- Complete member information matching Jotform requirements
- Demographics, employment status, health information
- Privacy consent tracking

### Related Tables
- `emergency_contacts` - Multiple emergency contacts per member
- `medical_conditions` - Health conditions with predefined options
- `challenging_behaviours` - Behavioral support needs
- `attendance` - Session attendance tracking

## Key Features Implemented

### 1. Authentication System (`/src/server/routes/auth.ts`)
- First admin setup (when no users exist)
- Admin login with rate limiting (5 attempts per 15 minutes)
- JWT token generation and verification
- Admin user management (create, list, delete)
- Password change functionality
- Cannot delete last admin or own account

### 2. Member Registration (`/src/client/pages/Register.vue`)
- Multi-step wizard interface (6 steps: Privacy, Personal, Demographics, Emergency Contacts, Health, Review)
- Privacy statement with mandatory acceptance
- All required demographics matching Jotform
- UK phone number validation with regex
- Google Places API address autocomplete with postcode extraction
- Age calculation that accounts for birth month (not just year)
- Form validation with error display and boolean prop validation
- Accessible design for users with autism/ADHD
- Complete registration summary before submission
- Success page with next steps information

### 3. Member Management (`/src/server/routes/members.ts`)
- Complete CRUD operations
- Paginated member listing
- Search functionality
- Related data management (emergency contacts, conditions)
- Data validation with Valibot

### 4. Attendance System (`/src/server/routes/attendance.ts`)
- Individual and bulk attendance recording
- Date-based attendance queries
- Member attendance history
- Monthly report generation with demographics
- PDF report export with charts (pie charts and bar charts)
- Dashboard statistics endpoint (`/api/attendance/stats`)

### 4a. PDF Report Generation
- **Chart Types**: Supports pie charts and both vertical/horizontal bar charts
- **Horizontal Bar Charts**: Used for Medical Conditions (long text labels)
- **Vertical Bar Charts**: Used for Age Groups (short labels)
- **Chart Functions**:
  - `drawPieChart()` - Gender, Sexual Orientation, Employment, Geographic Location
  - `drawVerticalBarChart()` - Age Groups (with proper bottom labels)
  - `drawHorizontalBarChart()` - Medical Conditions (labels on left, bars extend right)
- **Text Positioning**: Fixed label positioning issues by using appropriate chart types
- **Color Palettes**: High contrast colors for accessibility

### 5. Admin Dashboard (`/src/client/pages/Dashboard.vue`)
- Statistics overview
- Quick actions for common tasks
- Recent activity tracking
- Navigation to all system areas

## Environment Variables Required

### Root .env file:
```
DATABASE_URL=postgresql://username:password@localhost:5432/onwards_db
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3001
NODE_ENV=development
```

### Client environment (src/client/.env.local):
```
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

**Important Notes:**
- Vite runs with `root: 'src/client'`, so client environment files must be in `src/client/`
- Client environment variables must be prefixed with `VITE_` to be accessible
- Server restarts are required for .env changes
- See `GOOGLE_MAPS_SETUP.md` for Google Maps API setup instructions

## Database Setup
1. Create PostgreSQL database (or use cloud service like Neon/Supabase)
2. Set DATABASE_URL in .env file with SSL if needed:
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
   ```
3. Run the application - schema will be created automatically
4. Access /setup to create first admin user

## Application URLs (Development)
- **Frontend**: http://localhost:8080/ (Vue.js with Vite)
- **Backend Health**: http://localhost:3001/api/health (Express.js server)
- **Admin Setup**: http://localhost:8080/setup (first time only)
- **Admin Login**: http://localhost:8080/login (after setup)
- **Admin Dashboard**: http://localhost:8080/dashboard (protected)
- **Member Registration**: http://localhost:8080/register (public form with Google Places)
- **Registration Success**: http://localhost:8080/register-success (redirect after signup)

## Quick Start Checklist
1. ✅ Install dependencies: `npm install`
2. ✅ Set up .env file with DATABASE_URL and JWT_SECRET
3. ✅ Optional: Set up Google Maps API in `src/client/.env.local`
4. ✅ Start dev server: `nohup npm run dev > dev.log 2>&1 &`
5. ✅ Verify both servers running: `tail -20 dev.log`
6. ✅ Access http://localhost:8080/ in browser
7. ✅ Create first admin at /setup
8. ✅ Test member registration at /register (with address autocomplete)
9. ✅ Test admin dashboard and member management

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/setup-first-admin` - Create first admin
- `GET /api/auth/check-setup` - Check if setup is needed
- `POST /api/auth/create-admin` - Create additional admin (requires auth)
- `GET /api/auth/admins` - List all admins (requires auth)
- `DELETE /api/auth/admins/:id` - Delete admin (requires auth)
- `PUT /api/auth/change-password` - Change password (requires auth)
- `GET /api/auth/verify` - Verify token (requires auth)

### Members
- `POST /api/members/register` - Member registration (public)
- `GET /api/members` - List members with pagination (requires auth)
- `GET /api/members/:id` - Get member details (requires auth)
- `PUT /api/members/:id` - Update member (requires auth)
- `DELETE /api/members/:id` - Delete member (requires auth)

### Attendance
- `POST /api/attendance/record` - Record single attendance (requires auth)
- `POST /api/attendance/record-bulk` - Record bulk attendance (requires auth)
- `GET /api/attendance/date/:date` - Get attendance by date (requires auth)
- `GET /api/attendance/members-for-date/:date` - Get member list for date (requires auth)
- `GET /api/attendance/member/:id` - Get member attendance history (requires auth)
- `GET /api/attendance/report/:year/:month` - Generate monthly report (requires auth)
- `GET /api/attendance/report/:year/:month/pdf` - Download PDF report (requires auth)

## Data Validation Options

### Employment Status
- Full-time employment, Part-time employment, Self-employed, Unemployed
- Student - Full-time, Student - Part-time, Retired
- Unable to work due to disability, Volunteer work, Other

### Ethnicity Options
- White (British, Irish, Other)
- Mixed heritage options
- Asian heritage options
- Black heritage options
- Arab, Other ethnic group, Prefer not to say

### Religion Options
- No religion, Christian, Buddhist, Hindu, Jewish, Muslim, Sikh
- Any other religion, Prefer not to say

### Gender Options
- Male, Female, Non-binary, Other, Prefer not to say

### Sexual Orientation Options
- Heterosexual/Straight, Gay or Lesbian, Bisexual, Pansexual, Asexual
- Other, Prefer not to say

### Medical Conditions Options
- Autism Spectrum Disorder, ADHD, Anxiety disorders, Depression
- Bipolar disorder, OCD, PTSD, Learning disability
- Physical disability, Sensory impairment, Chronic illness, Other

## Security Features
- Password hashing with bcrypt (12 salt rounds)
- JWT tokens with 24-hour expiration
- Rate limiting on login attempts
- SQL injection prevention with parameterized queries
- CORS and Helmet security middleware
- Input validation with Valibot
- Authentication required for all admin functions

## Accessibility Considerations
- Card-based wizard interface for easier navigation
- Clear step indicators and progress tracking
- Large clickable areas for attendance recording
- Search functionality for quick member lookup
- Consistent navigation and layout
- Error messages with clear guidance

## Development Notes
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Automatic database schema creation
- Development server with hot reload
- Separate client/server TypeScript configurations
- Shared types between frontend and backend

## Current Status (Completed Features)
✅ **Authentication System**: Complete with JWT, bcrypt, rate limiting  
✅ **Member Registration**: Full 6-step wizard with Google Places autocomplete  
✅ **Database Schema**: All tables with proper relationships and migrations  
✅ **Age Calculation**: Accurate age calculation considering birth month  
✅ **Address Validation**: Google Places API integration with postcode extraction  
✅ **Form Validation**: Boolean prop validation fixes and error handling  
✅ **Development Setup**: Proper server management and environment configuration  
✅ **Admin Dashboard**: Statistics, quick actions, member management  
✅ **Attendance System**: Individual and bulk recording with history  
✅ **Photo Consent Form**: Complete form with adult/child consent, submissions management  

## Known Limitations
1. Monthly reporting with charts needs completion
2. Email notifications not implemented
3. File upload for profile pictures not implemented
4. Advanced filtering and sorting on member list
5. Bulk member import functionality
6. PDF report generation needs Chart.js integration

## Next Development Priorities
1. **High Priority**: Complete monthly reporting with charts and PDF generation
2. **Medium Priority**: Add deployment configuration for Hostinger/Render.com
3. **Low Priority**: Email notification system for important events
4. **Low Priority**: Advanced member filtering and search
5. **Low Priority**: Data export functionality for member lists
6. **Low Priority**: Backup and restore functionality

## Testing Notes
- Manual testing required for all user flows
- Database seeding scripts needed for development
- API testing with proper authentication headers
- Frontend form validation testing
- Attendance recording workflow testing
- Report generation testing with sample data

## Performance Considerations
- Database indexes on frequently queried fields
- Pagination for member lists
- Lazy loading of related data
- Efficient bulk attendance recording
- Optimized database queries for reports
- Frontend code splitting with Vue Router

## Deployment Considerations
- Environment variable configuration
- Database migration strategy
- SSL certificate setup
- Static file serving
- Process management (PM2 recommended)
- Database backup strategy
- Log management and monitoring

## Recent Updates (Latest Session)

### Custom Purple Theme Implementation ✅
- **Background Color**: `#eecbf5` (light purple/lavender) applied to all pages
- **Navigation Bars**: `#a672b0` (medium purple) on all admin pages  
- **PDF Styling**: All generated PDFs use the custom purple theme
- **Text Colors**: Updated to white/purple-200 for proper contrast on purple backgrounds
- **Files Updated**: All Vue pages in `/src/client/pages/` and CSS in `/src/client/assets/style.css`

### PDF Generation Fixes ✅ 
- **Chart Rendering Issues FIXED**: Replaced complex SVG paths with geometric drawing using line-to and arc steps
- **Pie Charts**: Now use proper mathematical arc drawing with configurable steps instead of SVG paths
- **Bar Charts**: Fixed spacing, sizing, and label positioning issues
- **Data Validation**: Charts handle empty data gracefully with "No data available" messages
- **Label Handling**: Truncate long labels to prevent text overflow
- **Debug Information**: Added debug pages to verify data processing and troubleshoot issues

### Member Registration PDF Reports ✅
- **New Endpoint**: `/api/members/report/:year/:month/pdf` for demographic reports (was missing)
- **MemberModel.generateMonthlyReport()**: New method for demographic data aggregation
- **Demographics Included**: Gender distribution, age groups, medical conditions, geographic location
- **Geographic Mapping**: Postcode to location mapping (Walsall, Birmingham, West Midlands)
- **Age Categorization**: Proper age group buckets (Under 18, 18-24, 25-34, 35-44, 45-54, 55-64, 65+)
- **Professional Layout**: Multi-page PDF with cover page and separate chart pages

### Forms System Enhancements ✅
- **Centralized Forms Page**: `/forms` with overview of all available forms
- **Dual Button System**: "Fill Out Form" and "View Submissions" for each form
- **Submission Tables**: Dedicated pages for viewing form submissions (`MemberSubmissions.vue`, `UCLASubmissions.vue`)
- **Color-coded Responses**: UCLA responses use green/yellow/red color coding for visual clarity
- **Flexbox Layout**: Fixed button alignment issues regardless of description text length

### Development Server Improvements ✅
- **Port Consolidation**: Everything runs on port 8080 (frontend serves backend API)
- **tsx/esbuild Issues**: Use `npx tsx src/server/index.ts` for platform compatibility
- **Manual Backend Start**: Alternative startup method for WSL environments
- **Health Monitoring**: Proper health checks at `/api/health`

### Chart Drawing Functions (Fixed)
```typescript
// Fixed pie chart drawing using geometric shapes instead of SVG paths
function drawPieChart(doc: PDFDocument, x: number, y: number, radius: number, data: Record<string, number>, title: string)

// Improved bar charts with proper spacing and label handling  
function drawVerticalBarChart(doc: PDFDocument, x: number, y: number, width: number, height: number, data: Record<string, number>, title: string)

function drawHorizontalBarChart(doc: PDFDocument, x: number, y: number, width: number, height: number, data: Record<string, number>, title: string)
```

### Photo Consent Form Implementation ✅
- **Public Form**: `/photo-consent` - Photography consent form for events starting from 21/02/2025 onwards
- **Event Types**: General (All events), Workshop, Social Event, Training Session, Community Outreach, Other
- **Consent Options**: 
  - Adult consent for individual participants
  - Child consent for parents/guardians with multiple children
  - Responsible adult details when child consent is provided
- **Privacy Statement**: GDPR-compliant privacy information included
- **Digital Signatures**: Type full name as digital signature
- **Database Table**: `photo_consent_forms` with proper indexing
- **Admin Management**: `/forms/photo-consent/submissions` for viewing and managing submissions
- **API Endpoints**: 
  - `POST /api/photo-consent/submit` (public)
  - `GET /api/photo-consent` (admin - list submissions)
  - `GET /api/photo-consent/:id` (admin - view details)
  - `DELETE /api/photo-consent/:id` (admin - delete submission)

### Wellbeing Index Scoring Fix ✅
- **Issue Fixed**: Scoring calculation was incorrectly using 4 questions instead of all 5 questions
- **Missing Question**: Added `fresh_rested` question to scoring calculation in backend model
- **Score Range Corrected**: Updated from incorrect 4-24 range to proper 5-30 range (5 questions × 1-6 points each)
- **Frontend Display Fixed**: Changed all score displays from `/120` to `/30` throughout the interface
- **Progress Bars Updated**: Fixed percentage calculations to use 30-point scale instead of 120-point scale  
- **Score Categories**: Updated distribution ranges:
  - Very Low: 5-10 points
  - Low: 11-15 points
  - Below Average: 16-20 points
  - Average: 21-25 points
  - High: 26-30 points
- **Database Migration**: All 108 existing submissions were recalculated with correct scoring
- **Report Generation**: Updated monthly report functions to use proper wellbeing score calculations
- **Verification**: Average score corrected to 18.1/30 with proper range 9-30 across all submissions

### Key Files Modified
- `/src/server/routes/members.ts` - Added PDF report endpoint and chart functions
- `/src/server/models/Member.ts` - Added generateMonthlyReport method
- `/src/server/models/WellbeingIndex.ts` - Fixed scoring calculation to include all 5 questions, updated score ranges
- `/src/client/pages/WellbeingIndexSubmissions.vue` - Updated score display from /120 to /30, fixed progress bars and color coding
- `/src/client/assets/style.css` - Added custom purple background
- All Vue pages in `/src/client/pages/` - Updated with purple navigation and backgrounds
- `/src/client/pages/Forms.vue` - Added dual button system with flexbox layout
- `/src/server/models/PhotoConsent.ts` - New model for photo consent forms
- `/src/server/routes/photoConsent.ts` - New API routes for photo consent
- `/src/client/pages/PhotoConsent.vue` - New public form for photo consent
- `/src/client/pages/PhotoConsentSuccess.vue` - Success page after form submission
- `/src/client/pages/PhotoConsentSubmissions.vue` - Admin page for managing submissions
- `/src/server/models/schema.sql` - Added photo_consent_forms table
- `/src/client/router/index.ts` - Added routes for photo consent form and submissions