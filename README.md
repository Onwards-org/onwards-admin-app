# Onwards Admin Platform

A comprehensive web application for managing community members, attendance tracking, and generating reports for the Onwards organization - supporting individuals with autism, ADHD, and anxiety.

## 🌟 Features

### 👤 Member Management
- **Public Registration Form**: Multi-step wizard interface matching Jotform requirements
- **Member Database**: Complete demographic and health information storage
- **Privacy Compliance**: Built-in privacy statement and consent tracking
- **Search & Filter**: Easy member lookup and management tools

### 🔐 Authentication & Security
- **Admin System**: Secure admin authentication with JWT tokens
- **First Admin Setup**: Automated setup process for initial administrator
- **Password Security**: Bcrypt hashing with 12 salt rounds
- **Rate Limiting**: Protection against brute force attacks

### 📊 Attendance Tracking
- **Quick Recording**: One-click attendance recording for Friday sessions
- **Bulk Operations**: Mark all members present/absent efficiently
- **Date-based Tracking**: Historical attendance records and analytics
- **Search Integration**: Find members quickly during attendance recording

### 📈 Reporting System
- **Monthly Reports**: Automated demographic analysis for funding reports
- **PDF Generation**: Professional reports ready for authorities
- **Statistical Breakdowns**: Gender, age groups, ethnicity, disabilities, employment status
- **Attendance Analytics**: Member participation tracking and trends

### 🎨 User Experience
- **Accessible Design**: Optimized for users with autism, ADHD, and anxiety
- **Card-based Interface**: Clear, step-by-step navigation
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Visual Feedback**: Clear success/error messages and loading states

## 🛠 Technology Stack

- **Frontend**: Vue.js 3, TypeScript, Tailwind CSS, Pinia, Vue Router
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with SSL support
- **Authentication**: JWT tokens with bcrypt hashing
- **Validation**: Valibot for robust form validation
- **PDF Generation**: PDFKit for report generation
- **Address Validation**: Google Places API autocomplete
- **Development**: Vite, hot reload, TypeScript strict mode

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Onwards-org/onwards-admin-app.git
   cd onwards-admin-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create `.env` file in the project root:
   ```env
   # Database configuration (use your actual database credentials)
   DATABASE_URL=postgresql://username:password@localhost:5432/onwards_db
   
   # JWT Secret for authentication (generate a secure random string)
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Server configuration
   PORT=3001
   NODE_ENV=development
   ```

   **Optional: Google Maps API** (for address autocomplete)
   ```env
   # Add to src/client/.env.local for client-side access
   VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```
   See `GOOGLE_MAPS_SETUP.md` for detailed setup instructions.

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   **Important**: The server runs in the background. You should see:
   - Backend: `Server running on port 3001`
   - Frontend: `Local: http://localhost:8080/`
   
   If you get port conflicts, see "Development Server Management" in `CLAUDE.md`

5. **Set up first admin**
   - Visit `http://localhost:8080/setup`
   - Create your first administrator account
   - Login and start using the platform

## 📖 Usage Guide

### For Administrators

1. **Login**: Access the admin dashboard at `/login`
2. **Member Management**: View and manage community members
3. **Attendance**: Record weekly attendance for Friday sessions
4. **Reports**: Generate monthly demographic reports for funding
5. **Admin Management**: Add/remove additional administrators

### For Community Members

1. **Registration**: Complete the registration form at `/register`
2. **Privacy**: Read and accept the privacy statement
3. **Information**: Provide demographic and health information
4. **Emergency Contacts**: Add emergency contact details
5. **Completion**: Receive confirmation of successful registration

## 🗃 Database Schema

### Core Tables
- **users**: Administrator accounts and authentication
- **members**: Community member information and demographics
- **attendance**: Session attendance tracking
- **emergency_contacts**: Emergency contact information
- **medical_conditions**: Health conditions and support needs
- **challenging_behaviours**: Behavioral support requirements

### Key Features
- Automated schema creation on first run
- Proper foreign key relationships
- Data validation and constraints
- Optimized indexes for performance

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start both client and server
npm run dev:client   # Start only frontend
npm run dev:server   # Start only backend

# Production
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run typecheck   # TypeScript type checking
npm run lint        # ESLint code linting
npm run lint:fix    # Fix ESLint issues
```

### Project Structure

```
src/
├── client/          # Vue.js frontend
│   ├── components/  # Reusable components
│   ├── pages/       # Route pages
│   ├── stores/      # State management
│   ├── router/      # Routing configuration
│   └── assets/      # Static assets
├── server/          # Express.js backend
│   ├── models/      # Database models
│   ├── routes/      # API routes
│   ├── middleware/  # Auth middleware
│   └── utils/       # Utilities
└── shared/          # Shared TypeScript types
```

## 🌐 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - Admin login
- `POST /api/auth/setup-first-admin` - Initial setup
- `GET /api/auth/check-setup` - Check setup status
- `POST /api/auth/create-admin` - Create admin (authenticated)

### Member Endpoints
- `POST /api/members/register` - Public registration
- `GET /api/members` - List members (authenticated)
- `GET /api/members/:id` - Get member details (authenticated)
- `PUT /api/members/:id` - Update member (authenticated)

### Attendance Endpoints
- `POST /api/attendance/record` - Record attendance (authenticated)
- `POST /api/attendance/record-bulk` - Bulk attendance (authenticated)
- `GET /api/attendance/report/:year/:month` - Monthly report (authenticated)
- `GET /api/attendance/report/:year/:month/pdf` - PDF report (authenticated)

## 🔒 Security Features

- **Password Hashing**: Bcrypt with 12 salt rounds
- **JWT Authentication**: 24-hour token expiration
- **Rate Limiting**: Login attempt protection
- **Input Validation**: Comprehensive form validation
- **SQL Injection Prevention**: Parameterized queries
- **CORS Protection**: Cross-origin request security

## 📋 Data Collection

### Registration Form Fields
- **Privacy**: Mandatory privacy statement acceptance
- **Personal**: Name, phone, email, address (with Google Places autocomplete), birth month/year
- **Demographics**: Employment, ethnicity, religion, gender, sexual orientation
- **Emergency Contacts**: Multiple emergency contacts with validation
- **Health Information**: Medical conditions, challenging behaviors, pregnancy status, additional information
- **Interests**: Hobbies and interests text field
- **Review**: Complete summary before submission

### Validation Rules
- UK phone number format validation
- Email address validation
- Required field enforcement
- Age range validation (birth year constraints)
- Dropdown option validation

## 📊 Reporting Features

### Monthly Demographics Report
- **Gender Distribution**: Breakdown by gender identity
- **Age Groups**: Age-based demographic analysis
- **Ethnicity**: Ethnic background distribution
- **Disabilities**: Medical conditions and support needs
- **Employment**: Employment and education status
- **Geographic**: Postcode-based location analysis

### Export Options
- **PDF Reports**: Professional formatted reports
- **Statistical Summaries**: Key metrics and percentages
- **Attendance Data**: Participation rates and trends

## 🚢 Deployment

### Environment Setup
1. Set up PostgreSQL database
2. Configure environment variables
3. Build the application: `npm run build`
4. Start with process manager: `pm2 start dist/server/index.js`

### Recommended Hosting
- **Render.com**: Easy deployment with PostgreSQL addon
- **Hostinger**: VPS hosting with database support
- **Heroku**: Platform-as-a-service deployment

### Production Checklist
- [ ] Set strong JWT_SECRET
- [ ] Configure production DATABASE_URL
- [ ] Enable SSL/HTTPS
- [ ] Set up regular database backups
- [ ] Configure error logging
- [ ] Set up monitoring

## 🤝 Contributing

We welcome contributions to improve the Onwards Admin Platform!

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Coding Standards
- TypeScript strict mode
- ESLint configuration compliance
- Component-based architecture
- Proper error handling
- Accessibility considerations

## 📞 Support

For questions, issues, or contributions:

- **Issues**: [GitHub Issues](https://github.com/Onwards-org/onwards-admin-app/issues)
- **Documentation**: See `CLAUDE.md` for detailed technical documentation
- **Email**: Contact the Onwards organization directly

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Onwards Community**: For their vision and requirements
- **Vue.js Team**: For the excellent frontend framework
- **Express.js Community**: For the robust backend framework
- **Contributors**: All developers who help improve this platform

---

**Built with ❤️ for the Onwards Community**

Supporting individuals with autism, ADHD, and anxiety through technology and community engagement.
