# Claude Development Notes - Onwards Admin Platform

## Project Overview
This is a comprehensive admin platform for Onwards, a volunteer-led organization supporting individuals with autism, ADHD, and anxiety. The platform handles member registration, attendance tracking, and reporting for funding purposes.

## Technology Stack
- **Frontend**: Vue.js 3, TypeScript, Tailwind CSS 4, Pinia (state management), Vue Router
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with pg driver
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Valibot for form validation
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
- `npm run dev` - Start both client and server in development mode
- `npm run dev:client` - Start only the Vue.js development server
- `npm run dev:server` - Start only the Express.js development server
- `npm run build` - Build both client and server for production
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint code linting

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
- Multi-step wizard interface (6 steps)
- Privacy statement with mandatory acceptance
- All required demographics matching Jotform
- UK phone number validation
- Form validation with error display
- Accessible design for users with autism/ADHD

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
- Monthly report generation
- PDF report export

### 5. Admin Dashboard (`/src/client/pages/Dashboard.vue`)
- Statistics overview
- Quick actions for common tasks
- Recent activity tracking
- Navigation to all system areas

## Environment Variables Required
```
DATABASE_URL=postgresql://username:password@localhost:5432/onwards_db
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3000
NODE_ENV=development
GOOGLE_PLACES_API_KEY=your-google-places-api-key (optional)
```

## Database Setup
1. Create PostgreSQL database
2. Set DATABASE_URL in .env file
3. Run the application - schema will be created automatically
4. Access /setup to create first admin user

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

## Known Limitations
1. Google Places API integration pending
2. Monthly reporting with charts needs completion
3. Email notifications not implemented
4. File upload for profile pictures not implemented
5. Advanced filtering and sorting on member list
6. Bulk member import functionality

## Next Development Priorities
1. Complete monthly reporting with charts and PDF generation
2. Implement Google Places API for address validation
3. Add deployment configuration for Hostinger/Render.com
4. Email notification system for important events
5. Advanced member filtering and search
6. Data export functionality for member lists
7. Backup and restore functionality

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